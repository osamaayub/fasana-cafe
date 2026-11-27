import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { prisma } from "./prisma";
import { siteUrl } from "./site";

/*
 * "Continue with Google / Facebook" using the standard OAuth 2.0 authorization-code flow.
 * No extra library: the flow is two redirects and two fetch calls.
 * A provider is switched on only when both of its env vars are set.
 */

/** Short-lived cookie that holds the state and PKCE verifier between the two redirects. */
export const OAUTH_COOKIE = "fasana_oauth";

export type ProviderId = "google" | "facebook";

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

const FB_GRAPH = "https://graph.facebook.com/v21.0";

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
  facebook: {
    label: "Facebook",
    clientId: process.env.FACEBOOK_CLIENT_ID,
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    authorizeUrl: "https://www.facebook.com/v21.0/dialog/oauth",
    tokenUrl: `${FB_GRAPH}/oauth/access_token`,
    scope: "email,public_profile",
    pkce: false,
    async profile(token) {
      const r = await fetch(`${FB_GRAPH}/me?fields=id,name,email&access_token=${encodeURIComponent(token)}`, { cache: "no-store" });
      if (!r.ok) throw new Error(`facebook me ${r.status}`);
      const p = (await r.json()) as { id: string; email?: string; name?: string };
      // Facebook only returns an email the person has confirmed with Facebook.
      return { providerUserId: p.id, email: p.email ?? "", emailVerified: !!p.email, name: p.name ?? "" };
    },
  },
};

export const isProvider = (p: string): p is ProviderId => p === "google" || p === "facebook";

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
  const r = await fetch(p.tokenUrl, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body, cache: "no-store" });
  if (!r.ok) throw new Error(`${id} token ${r.status}`);
  const { access_token } = (await r.json()) as { access_token?: string };
  if (!access_token) throw new Error(`${id} token missing`);
  return p.profile(access_token);
}

export class OAuthError extends Error {
  constructor(public code: "no-email" | "unverified") {
    super(code);
  }
}

/**
 * Finds or creates the customer for a Google/Facebook profile.
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
