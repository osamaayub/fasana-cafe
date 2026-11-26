/**
 * Starter photos, free under the Unsplash License (https://unsplash.com/license).
 * They are mood shots, not photos of Fasana. Replace them with the café's own photos
 * from Admin > Settings before launch.
 */
const u = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1800&q=80`;

export const STARTER_PHOTOS = {
  hero: u("photo-1699192253430-e5a5a2a44f21"), // coffee beside a lamp, by nik radzi
  story: u("photo-1602325611479-2c258843f119"), // stack of books on a café table, by Miriana Dorobanțu
  reserve: u("photo-1763497397285-a557a7c8d8b7"), // book and coffee on marble, by Esra Afşar
  gallery: [
    u("photo-1768608082926-68f1811cfd1a"), // café interior, by Haberdoedas
    u("photo-1473093226795-af9932fe5856"), // pasta, by Eaters Collective
    u("photo-1615134614521-d601f0b97972"), // café shelf, by Sam Grozyan
    u("photo-1763497397285-a557a7c8d8b7"),
    u("photo-1602325611479-2c258843f119"),
    u("photo-1699192253430-e5a5a2a44f21"),
  ],
};
