/*
 * Seed data for Fasana Café, Bahria Town, Lahore.
 * Business details come from the public Google listing.
 * The menu lives in menu-data.ts (from the café's own brochures).
 * Everything can be edited from /admin. Safe to run more than once.
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { STARTER_PHOTOS } from "../src/lib/photos";
import { DISH_PHOTOS } from "../src/lib/dish-photos";
import { parseOptions } from "../src/lib/format";
import { MENU, MENU_VERSION } from "./menu-data";

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });

async function main() {
  await prisma.settings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: "Fasana Café",
      tagline: "Café, kitchen and bookstore in Bahria Town",
      heroTitle: "Stay for one more chapter.",
      heroSubtitle:
        "Continental plates, fresh pastries and mocktails next to a reading bookstore in Sector C, Bahria Town. Open every day until midnight.",
      about:
        "Fasana Café is a book-themed café and kitchen in the Sector C commercial area of Bahria Town, Lahore — directly above the Readings bookstore. Launched in April 2025 by Dr. Anwaar Nasir and Rana Saeed Ahmed, the founders of Readings, it's a calm retreat for readers, laptop workers, and groups who want great food in a beautiful setting.\n\nThe menu runs from all-day breakfast and continental plates to pasta, burgers, pan-Asian dishes and premium coffee — including guest favourites like Butter Stuffed Chicken, the Sebastian Cheesecake and the Iced Caramel Macchiato. Whether you're browsing the shelves, meeting friends on the cooled terrace, or settling in for a long catch-up, there's a table with your name on it.",
      address: "Sector C Commercial Area, Bahria Town, Lahore 53720, Pakistan",
      phone: "+92 300 5258219",
      whatsapp: "923005258219",
      foodpandaUrl: "https://www.foodpanda.pk/restaurant/fokv/fasana-cafe-bahria-town",
      mapsUrl: "https://www.google.com/maps/search/?api=1&query=Fasana%20Caf%C3%A9%2C%20Bahria%20Town%2C%20Lahore&query_place_id=ChIJoSEWbdL_GDkR0bxe3ADJ6TA",
      mapEmbedQuery: "Fasana Café, Sector C, Bahria Town, Lahore",
      latitude: 31.3715053,
      longitude: 74.1853719,
      googleRating: 4.6,
      googleReviews: 1047,
      heroImage: STARTER_PHOTOS.hero,
      storyImage: STARTER_PHOTOS.story,
      reserveImage: STARTER_PHOTOS.reserve,
      galleryImages: STARTER_PHOTOS.gallery.join("\n"),
    },
  });

  for (let d = 0; d < 7; d++) {
    await prisma.openingHour.upsert({
      where: { dayOfWeek: d },
      update: {},
      create: { dayOfWeek: d, opensAt: "10:00", closesAt: "00:00" },
    });
  }

  if ((await prisma.highlight.count()) === 0) {
    await prisma.highlight.createMany({
      data: [
        { title: "Reading bookstore", description: "Browse the shelves next door and read over your coffee.", icon: "book", sortOrder: 0 },
        { title: "Air-conditioned outdoor seating", description: "Sit outside in comfort, even in a Lahore summer.", icon: "leaf", sortOrder: 1 },
        { title: "Open daily, 10 AM to midnight", description: "Breakfast, lunch, dinner or a late coffee.", icon: "coffee", sortOrder: 2 },
        { title: "Rated 4.6 on Google", description: "From over a thousand customer reviews.", icon: "star", sortOrder: 3 },
      ],
    });
  }

  await seedMenu();
}

/**
 * Loads the built-in menu from menu-data.ts. Runs on a fresh database, and once more whenever
 * MENU_VERSION changes (it replaces the whole menu then). Admin edits are left alone otherwise.
 */
async function seedMenu() {
  const settings = await prisma.settings.findUnique({ where: { id: 1 } });
  const hasMenu = (await prisma.category.count()) > 0;
  if (hasMenu && settings?.menuVersion === MENU_VERSION) return;

  await prisma.$transaction(async (tx) => {
    await tx.category.deleteMany(); // items go with their category (onDelete: Cascade)
    for (const [ci, cat] of MENU.entries()) {
      await tx.category.create({
        data: {
          name: cat.name,
          slug: cat.slug,
          sortOrder: ci,
          items: {
            create: cat.items.map((it, ii) => {
              const opts = parseOptions(it.options);
              const price = it.price !== undefined ? it.price : opts.length ? Math.min(...opts.map((o) => o.price)) : null;
              return {
                name: it.name,
                description: it.description ?? "",
                price,
                options: it.options ?? "",
                featured: it.featured ?? false,
                imageUrl: DISH_PHOTOS[it.photo ?? it.name] ?? "",
                sortOrder: ii,
              };
            }),
          },
        },
      });
    }
    await tx.settings.update({ where: { id: 1 }, data: { menuVersion: MENU_VERSION } });
  }, { timeout: 60_000 });
  console.log(`Loaded menu ${MENU_VERSION}`);
}

main()
  .then(() => console.log("Seeded Fasana Café data"))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
