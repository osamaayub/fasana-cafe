/*
 * Seed data for Fasana Café, Bahria Town, Lahore.
 * Business details come from the public Google listing.
 * Menu prices come from the café's Foodpanda page (Nov 2026) and may differ in-store.
 * Items with price: null were mentioned by customers but have no published price.
 * Everything can be edited from /admin. Safe to run more than once.
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { STARTER_PHOTOS } from "../src/lib/photos";

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
        "Fasana Café is a café and kitchen in the Sector C commercial area of Bahria Town, Lahore, sharing its space with a reading bookstore. Come for a coffee and a pastry, stay for a full meal, or settle into the air-conditioned outdoor seating with a book.\n\n(Draft text: replace with the owner's own story from the admin panel.)",
      address: "Sector C Commercial Area, Bahria Town, Lahore 53720, Pakistan",
      phone: "+92 300 5258219",
      whatsapp: "923005258219",
      foodpandaUrl: "https://www.foodpanda.pk/restaurant/fokv/fasana-cafe-bahria-town",
      mapsUrl: "https://www.google.com/maps/place/?q=place_id:ChIJoSEWbdL_GDkR0bxe3ADJ6TA",
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

  if ((await prisma.category.count()) > 0) return;

  type Seed = { name: string; description: string; price: number | null; featured?: boolean };
  const menu: { name: string; slug: string; items: Seed[] }[] = [
    { name: "Soups", slug: "soups", items: [{ name: "Hot & Sour Soup", description: "Classic hot and sour soup.", price: 765 }] },
    {
      name: "Mains",
      slug: "mains",
      items: [
        {
          name: "Butter Stuffed Chicken",
          description:
            "Crispy chicken breast filled with homemade cheese, spinach and turkey bacon, with black olive sauce, mashed potatoes and sautéed vegetables.",
          price: 2470,
          featured: true,
        },
        { name: "Moroccan Chicken", description: "House Moroccan-spiced chicken.", price: 2195, featured: true },
        { name: "Chicken Parm", description: "Breaded chicken with tomato sauce and melted cheese.", price: null },
        { name: "Chicken Chowmein", description: "Stir-fried noodles with chicken and vegetables.", price: 1645 },
      ],
    },
    {
      name: "Pasta",
      slug: "pasta",
      items: [
        { name: "Creamy Neapolitan Pasta", description: "A creamy take on classic Neapolitan sauce, topped with crispy fried chicken.", price: 1975, featured: true },
      ],
    },
    {
      name: "Sandwiches & Burgers",
      slug: "sandwiches-burgers",
      items: [
        { name: "Dynamite Panini", description: "Grilled chicken and dynamite sauce in panini bread, with coleslaw and fries.", price: 1495, featured: true },
        { name: "Turkey Club Sandwich", description: "Layered club sandwich with turkey.", price: 1755 },
        { name: "Smash Beef Burger", description: "Smashed beef patty burger.", price: null },
      ],
    },
    { name: "Desserts", slug: "desserts", items: [{ name: "Chocolate Éclair", description: "Choux pastry with chocolate.", price: null }] },
    {
      name: "Drinks",
      slug: "drinks",
      items: [
        { name: "Coffee", description: "Freshly brewed. Ask staff for today's options.", price: null },
        { name: "The Last Temptation", description: "House signature mocktail.", price: null, featured: true },
        { name: "Passion Fruit Mocktail", description: "Fresh passion fruit mocktail.", price: null },
      ],
    },
  ];

  for (const [ci, cat] of menu.entries()) {
    await prisma.category.create({
      data: {
        name: cat.name,
        slug: cat.slug,
        sortOrder: ci,
        items: {
          create: cat.items.map((it, ii) => ({ name: it.name, description: it.description, price: it.price, featured: it.featured ?? false, sortOrder: ii })),
        },
      },
    });
  }
}

main()
  .then(() => console.log("Seeded Fasana Café data"))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
