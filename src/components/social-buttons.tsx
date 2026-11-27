import { enabledProviders, type ProviderId } from "@lib/oauth";

function GoogleLogo() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden className="h-5 w-5 shrink-0">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 38.4 44 33 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}

function GitHubLogo() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="h-5 w-5 shrink-0" fill="currentColor">
      <path d="M12 .5C5.7.5.5 5.7.5 12.1c0 5.1 3.3 9.4 7.9 10.9.6.1.8-.3.8-.6v-2.1c-3.2.7-3.9-1.5-3.9-1.5-.5-1.3-1.3-1.7-1.3-1.7-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.7-1.6-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.2 1.2a11 11 0 0 1 5.8 0c2.2-1.5 3.2-1.2 3.2-1.2.6 1.6.2 2.8.1 3.1.8.8 1.2 1.9 1.2 3.1 0 4.4-2.7 5.4-5.3 5.7.4.4.8 1.1.8 2.2v3.2c0 .3.2.7.8.6a11.6 11.6 0 0 0 7.9-10.9C23.5 5.7 18.3.5 12 .5z" />
    </svg>
  );
}

const logos: Record<ProviderId, () => React.JSX.Element> = { google: GoogleLogo, github: GitHubLogo };

/**
 * "Continue with Google / GitHub" buttons. Plain links, so they work before JavaScript loads.
 * Renders nothing until a provider's keys are set, so visitors never see a button that can't work.
 */
export function SocialButtons({ next, mode }: { next?: string; mode: "signin" | "signup" }) {
  const list = enabledProviders();
  if (list.length === 0) return null;
  const qs = next ? `?next=${encodeURIComponent(next)}` : "";
  return (
    <div>
      <div className="grid gap-3">
        {list.map(({ id, label }) => {
          const Logo = logos[id];
          return (
            <a
              key={id}
              href={`/api/auth/${id}${qs}`}
              className="flex min-h-12 w-full items-center justify-center gap-3 rounded-full border border-line bg-sheet px-5 py-3 text-[15px] font-semibold text-ink transition-[border-color,box-shadow,transform] hover:-translate-y-0.5 hover:border-ink/30 hover:shadow-[0_10px_22px_-18px_rgba(22,33,59,.5)] active:translate-y-px"
            >
              <Logo />
              {mode === "signup" ? `Sign up with ${label}` : `Continue with ${label}`}
            </a>
          );
        })}
      </div>
      <div className="my-6 flex items-center gap-4 text-xs font-medium uppercase tracking-[0.18em] text-muted" role="separator">
        <span className="h-px flex-1 bg-line" />
        or with email
        <span className="h-px flex-1 bg-line" />
      </div>
    </div>
  );
}
