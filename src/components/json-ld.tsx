import type { OpeningHour, Settings } from "@/lib/types";

const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function RestaurantJsonLd({ s, hours, url }: { s: Settings; hours: OpeningHour[]; url: string }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "CafeOrCoffeeShop",
    name: s.name,
    description: s.heroSubtitle,
    url,
    telephone: s.phone,
    address: { "@type": "PostalAddress", streetAddress: s.address, addressLocality: "Lahore", addressRegion: "Punjab", addressCountry: "PK" },
    geo: { "@type": "GeoCoordinates", latitude: s.latitude, longitude: s.longitude },
    hasMap: s.mapsUrl,
    servesCuisine: ["Continental", "Cafe"],
    acceptsReservations: true,
    menu: `${url}/menu`,
    openingHoursSpecification: hours
      .filter((h) => !h.closed)
      .map((h) => ({ "@type": "OpeningHoursSpecification", dayOfWeek: dayNames[h.dayOfWeek], opens: h.opensAt, closes: h.closesAt === "00:00" ? "23:59" : h.closesAt })),
    sameAs: [s.instagram, s.facebook].filter(Boolean),
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}
