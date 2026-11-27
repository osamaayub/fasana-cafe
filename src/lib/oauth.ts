import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { prisma } from "./prisma";
import { siteUrl } from "./site";

/*
 * "Continue with Google / GitHub" using the standard OAuth 2.0 authorization-code flow.
 * No extra library: the flow is two redirects and two fetch calls.
 * A provider is switched on only when both of its env vars are set.
 */

/** Short-lived cookie that holds the state and PKCE verifier between the two redirects. */
export const OAUTH_COOKIE = "fasana_oauth";

export type ProviderId = "google" | "github";

export type OAuthProfile = { providerUserId: string; email: string; emailVerified: boolean; name: string };

type Provider = {
  label: string;
  clientId?: string;
  clientSecret?: string;
  authorizeUrl: string;
  tokenUrl: string;
  scope: string;
  pkce: boolean;
  profile: (accessToken: string) => Promise<OAuthProfile>;
};

const providers: Record<ProviderId, Provider> = {
  google: {
    label: "Google",
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    authorizeUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    scope: "openid email profile",
    pkce: true,
    async profile(token) {
      const r = await fetch("https://openidconnect.googleapis.com/v1/userinfo", { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
      if (!r.ok) throw new Error(`google userinfo ${r.status}`);
      const p = (await r.json()) as { sub: string; email?: string; email_verified?: boolean; name?: string };
      return { providerUserId: p.sub, email: p.email ?? "", emailVerified: p.email_verified === true, name: p.name ?? "" };
    },
  },
  github: {
    label: "GitHub",
    clientId: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    authorizeUrl: "https://github.com/login/oauth/authorize",
    tokenUrl: "https://github.com/login/oauth/access_token",
    scope: "read:user user:email",
    pkce: true,
    async profile(token) {
      const h = { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json", "User-Agent": "fasana-cafe", "X-GitHub-Api-Version": "2022-11-28" };
      const r = await fetch("https://api.github.com/user", { headers: h, cache: "no-store" });
      if (!r.ok) throw new Error(`github user ${r.status}`);
      const p = (await r.json()) as { id: number; login: string; name?: string | null };
      // The profile email is often hidden, so read the account's primary, verified email instead.
      const er = await fetch("https://api.github.com/user/emails", { headers: h, cache: "no-store" });
      const emails = er.ok ? ((await er.json()) as { email: string; primary: boolean; verified: boolean }[]) : [];
      const best = emails.find((e) => e.primary && e.verified) ?? emails.find((e) => e.verified);
      return { providerUserId: String(p.id), email: best?.email ?? "", emailVerified: !!best, name: p.name || p.login };
    },
  },
};

export const isProvider = (p: string): p is ProviderId => p === "google" || p === "github";

export function enabledProviders(): { id: ProviderId; label: string }[] {
  return (Object.keys(providers) as ProviderId[])
    .filter((id) => providers[id].clientId && providers[id].clientSecret)
    .map((id) => ({ id, label: providers[id].label }));
}

export const isEnabled = (id: ProviderId) => !!(providers[id].clientId && providers[id].clientSecret);

export const redirectUri = (id: ProviderId) => `${siteUrl}/api/auth/${id}/callback`;

const b64url = (b: Buffer) => b.toString("base64url");

/** Builds the provider's sign-in URL plus the values to keep in short-lived cookies. */
export function startAuth(id: ProviderId) {
  const p = providers[id];
  const state = b64url(randomBytes(32));
  const verifier = p.pkce ? b64url(randomBytes(32)) : "";
  const params = new URLSearchParams({
    client_id: p.clientId!,
    redirect_uri: redirectUri(id),
    response_type: "code",
    scope: p.scope,
    state,
  });
  if (p.pkce) {
    params.set("code_challenge", b64url(createHash("sha256").update(verifier).digest()));
    params.set("code_challenge_method", "S256");
  }
  if (id === "google") params.set("prompt", "select_account");
  return { url: `${p.authorizeUrl}?${params}`, state, verifier };
}

/** Swaps the one-time code for an access token, then reads the person's profile. */
export async function finishAuth(id: ProviderId, code: string, verifier: string): Promise<OAuthProfile> {
  const p = providers[id];
  const body = new URLSearchParams({
    client_id: p.clientId!,
    client_secret: p.clientSecret!,
    code,
    redirect_uri: redirectUri(id),
    grant_type: "authorization_code",
  });
  if (p.pkce) body.set("code_verifier", verifier);
  const r = await fetch(p.tokenUrl, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" }, body, cache: "no-store" });
  if (!r.ok) throw new Error(`${id} token ${r.status}`);
  // GitHub answers 200 with an "error" field on failure, so check for the token itself.
  const { access_token, error } = (await r.json()) as { access_token?: string; error?: string };
  if (!access_token) throw new Error(`${id} token missing${error ? `: ${error}` : ""}`);
  return p.profile(access_token);
}

export class OAuthError extends Error {
  constructor(public code: "no-email" | "unverified") {
    super(code);
  }
}

/**
 * Finds or creates the customer for a Google/GitHub profile.
 * 1. Already linked: that account.
 * 2. Same verified email as an existing account: link it (the provider has proved they own the email).
 * 3. Otherwise: a new account with no password.
 */
export async function userForProfile(id: ProviderId, profile: OAuthProfile) {
  const linked = await prisma.oAuthAccount.findUnique({
    where: { provider_providerUserId: { provider: id, providerUserId: profile.providerUserId } },
    include: { user: true },
  });
  if (linked) return { user: linked.user, created: false };

  const email = profile.email.trim().toLowerCase();
  if (!email) throw new OAuthError("no-email");
  if (!profile.emailVerified) throw new OAuthError("unverified");

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    await prisma.oAuthAccount.create({ data: { provider: id, providerUserId: profile.providerUserId, userId: existing.id } });
    // Linking proves they own the inbox, so clear any lockout from wrong passwords.
    const user = await prisma.user.update({ where: { id: existing.id }, data: { failedLogins: 0, lockedUntil: null } });
    return { user, created: false };
  }

  const user = await prisma.user.create({
    data: {
      email,
      name: profile.name.trim().slice(0, 80) || email.split("@")[0],
      oauthAccounts: { create: { provider: id, providerUserId: profile.providerUserId } },
    },
  });
  return { user, created: true };
}
