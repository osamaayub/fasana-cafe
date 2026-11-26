import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { getSettings } from "@/lib/data";
import { siteUrl } from "@/lib/site";

const sans = localFont({ src: "./fonts/instrument-sans-latin-wght-normal.woff2", variable: "--font-instrument-sans", display: "swap" });
const serif = localFont({ src: "./fonts/instrument-serif-latin-400-normal.woff2", variable: "--font-instrument-serif", display: "swap" });
// Subset to the five letters of فسانہ only (12 KB)
const nastaliq = localFont({ src: "./fonts/nastaliq-fasana.woff2", variable: "--font-nastaliq", display: "block", weight: "700" });


export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  const title = `${s.name} | ${s.tagline}`;
  return {
    metadataBase: new URL(siteUrl),
    title: { default: title, template: `%s | ${s.name}` },
    description: s.heroSubtitle,
    openGraph: { title, description: s.heroSubtitle, type: "website", locale: "en_PK", siteName: s.name },
    twitter: { card: "summary_large_image", title, description: s.heroSubtitle },
    alternates: { canonical: "/" },
  };
}

export const viewport: Viewport = { themeColor: "#f6f7f3", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable} ${nastaliq.variable}`} suppressHydrationWarning>
      <head>
        {/* lets CSS hide scroll-reveal content only when JS is running */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
