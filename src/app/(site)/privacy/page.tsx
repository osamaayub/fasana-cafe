import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@ui/page-header";
import { getSettings } from "@lib/data";

export const revalidate = 3600;
export const metadata: Metadata = {
  title: "Privacy policy",
  description: "What Fasana Café collects when you book, sign in or contact us, why we keep it, and how to delete it.",
  alternates: { canonical: "/privacy" },
};

const UPDATED = "27 November 2026";

/** Café details come from Admin > Settings, so this page stays correct when they change. */
export default async function PrivacyPage() {
  const s = await getSettings();
  const tel = s.phone.replace(/\s/g, "");
  const contact = (
    <>
      {s.email && (
        <>
          email <a href={`mailto:${s.email}`} className="link-underline">{s.email}</a>
          {s.phone ? ", " : ""}
        </>
      )}
      {s.phone && (
        <>
          call or WhatsApp <a href={`tel:${tel}`} className="link-underline">{s.phone}</a>
        </>
      )}
    </>
  );

  const sections: { id: string; title: string; body: React.ReactNode }[] = [
    {
      id: "what",
      title: "What we collect",
      body: (
        <ul>
          <li><strong>When you book a table:</strong> your name, phone or WhatsApp number, email if you give it, date, time, number of guests, seating choice and any notes.</li>
          <li><strong>When you create an account:</strong> your name, email and a password (stored only as a scrambled hash we cannot read). Optionally your phone, seating preference, dietary notes and whether you want offers.</li>
          <li><strong>When you sign in with Google or Facebook:</strong> only your name, email address and an account ID from that service. We never see your Google or Facebook password and we never post anything for you.</li>
          <li><strong>When you message us or join the newsletter:</strong> your name, contact details and message.</li>
          <li><strong>Technical basics:</strong> your browser type for the &quot;signed-in devices&quot; list, and your IP address for a short time to block spam and repeated failed sign-ins.</li>
        </ul>
      ),
    },
    {
      id: "why",
      title: "Why we use it",
      body: (
        <ul>
          <li>To confirm and manage your bookings, including a WhatsApp or call to confirm your table.</li>
          <li>To keep your account secure and let you see and cancel your bookings.</li>
          <li>To tell the kitchen about allergies or dietary needs you add.</li>
          <li>To send offers and news, only if you opted in. You can turn this off any time in your account.</li>
        </ul>
      ),
    },
    {
      id: "cookies",
      title: "Cookies",
      body: (
        <p>
          We use a small number of cookies that the site needs to work: one keeps you signed in, one shows your first name in the menu, one remembers light or dark mode, and a short-lived one protects Google and Facebook sign-in. We do not use advertising cookies or sell your data.
        </p>
      ),
    },
    {
      id: "sharing",
      title: "Who we share it with",
      body: (
        <>
          <p>We don&apos;t sell or rent your information. We only use these services to run the site:</p>
          <ul>
            <li><strong>Vercel</strong> hosts the website.</li>
            <li><strong>Prisma Postgres</strong> stores the database.</li>
            <li><strong>Resend</strong> sends booking alerts and password-reset emails.</li>
            <li><strong>Google</strong> and <strong>Facebook</strong> confirm who you are, only if you choose to sign in with them.</li>
          </ul>
        </>
      ),
    },
    {
      id: "keep",
      title: "How long we keep it",
      body: (
        <p>
          Your account stays until you delete it. Booking records stay with the café so staff can seat you and keep simple records; if you delete your account, past bookings are no longer linked to it. Sign-in sessions expire after 30 days without use, and password-reset links after 1 hour.
        </p>
      ),
    },
    {
      id: "delete",
      title: "Deleting your data",
      body: (
        <>
          <p>You can delete your account yourself at any time:</p>
          <ol>
            <li>Sign in and open <Link href="/account#security" className="link-underline">Account</Link>.</li>
            <li>Go to <strong>Security</strong> and choose <strong>Delete account</strong>.</li>
            <li>Type your email to confirm. Your profile, saved details, linked Google or Facebook login and all sign-in sessions are removed straight away.</li>
          </ol>
          <p>
            If you signed in with Facebook, you can also remove {s.name} from Facebook under <strong>Settings &amp; privacy &gt; Settings &gt; Apps and websites</strong>, then ask us to delete your data. To ask us to delete booking details or messages, {contact}, and we&apos;ll do it within 30 days.
          </p>
        </>
      ),
    },
    {
      id: "contact",
      title: "Contact",
      body: (
        <p>
          {s.name}, {s.address}. For any privacy question, {contact}, or use the <Link href="/contact" className="link-underline">contact page</Link>.
        </p>
      ),
    },
  ];

  return (
    <>
      <PageHeader eyebrow="Your data" title="Privacy policy" intro={`What ${s.name} collects when you book, sign in or contact us, and how to delete it. Last updated ${UPDATED}.`} />
      <div className="container-x grid gap-10 pb-24 lg:grid-cols-[14rem_1fr]">
        <nav aria-label="On this page" className="hidden lg:block">
          <ul className="sticky top-28 space-y-2 text-sm">
            {sections.map((sec) => (
              <li key={sec.id}><a href={`#${sec.id}`} className="text-muted transition-colors hover:text-ink">{sec.title}</a></li>
            ))}
          </ul>
        </nav>
        <div className="max-w-[68ch] space-y-10 rounded-3xl border border-line bg-sheet p-6 leading-relaxed sm:p-10 [&_li]:mt-2 [&_ol]:mt-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol+p]:mt-3 [&_p+p]:mt-3 [&_p+ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-5">
          {sections.map((sec) => (
            <section key={sec.id} id={sec.id} className="scroll-mt-28">
              <h2 className="mb-3 text-3xl">{sec.title}</h2>
              <div className="text-ink/80">{sec.body}</div>
            </section>
          ))}
        </div>
      </div>
    </>
  );
}
