import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { getSettings } from "@lib/data";
import { siteUrl } from "@lib/site";

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
    openGraph: {
      title, description: s.heroSubtitle, type: "website", locale: "en_PK", siteName: s.name,
      images: s.heroImage ? [{ url: s.heroImage, width: 2400, height: 1350, alt: s.name }] : undefined,
    },
    twitter: { card: "summary_large_image", title, description: s.heroSubtitle, images: s.heroImage ? [s.heroImage] : undefined },
    alternates: { canonical: "/" },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f7f3" },
    { media: "(prefers-color-scheme: dark)", color: "#0d1526" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable} ${nastaliq.variable}`} suppressHydrationWarning>
      <head>
        {/* lets CSS hide scroll-reveal content only when JS is running; applies saved/system theme before paint */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js');try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&matchMedia('(prefers-color-scheme: dark)').matches))document.documentElement.classList.add('dark')}catch(e){}" }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
