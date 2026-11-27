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
import { DISH_PHOTOS } from "../src/lib/dish-photos";

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

  if ((await prisma.category.count()) > 0) return;

  type Seed = { name: string; description: string; price: number | null; featured?: boolean };
  const menu: { name: string; slug: string; items: Seed[] }[] = [
  { name: "Starters", slug: "starters", items: [
    { name: "Chicken Strips", description: "Classic deep-fried crumbed chicken strips with our chef's special dip.", price: 1315 },
    { name: "Dynamite Tempura Chicken", description: "Crispy tempura-fried chicken coated in creamy dynamite sauce.", price: 1425 },
    { name: "Mozzarella Sticks", description: "Crispy breaded mozzarella sticks with our chef's special garlic dip.", price: 1535, featured: true },
    { name: "Sweet Chilli Wings", description: "Fried wings tossed in a sweet and spicy chilli sauce.", price: 1315 },
    { name: "Korean Spicy Wings", description: "Crispy wings tossed in a fiery chilli sauce.", price: 1315 },
    { name: "Loaded Fries", description: "Fries loaded with chicken, jalapeños, olives and jack cheese.", price: 1535 },
    { name: "Plain Fries", description: "Golden French fries.", price: 545 },
  ]},
  { name: "Seafood", slug: "seafood", items: [
    { name: "Dynamite Shrimps", description: "Crispy shrimp coated in our chef's homemade dynamite sauce.", price: 1865 },
    { name: "Tempura Prawns", description: "Crispy batter-fried prawns with sweet chilli, wasabi or wonton sauce.", price: 2415 },
    { name: "Fish & Chips", description: "Classic crumbed fish with French fries and tartar sauce.", price: 2195 },
    { name: "Sole Mediterranean", description: "Char-grilled sole, balsamic reduction, celery and mash.", price: 3185 },
    { name: "Cashew Nut Prawns", description: "Crispy fried prawns with cashews, vegetables and tomatoes.", price: 2635 },
    { name: "Dragon Fire Prawns", description: "Prawns stir-fried with green chillies in a fiery sauce.", price: 2635 },
    { name: "Chilli Dry Prawns", description: "Prawns stir-fried with chillies, ginger and spring onion.", price: 2635 },
    { name: "Prawn Szechuan", description: "Prawns with mixed vegetables in a bold Szechuan sauce.", price: 2635 },
  ]},
  { name: "Salads", slug: "salads", items: [
    { name: "Greek Salad", description: "Crisp greens, feta, olives and tomato.", price: 995 },
    { name: "Quinoa Salad", description: "Quinoa with fresh vegetables and dressing.", price: 1100 },
  ]},
  { name: "Soups", slug: "soups", items: [
    { name: "House Special Soup", description: "Prawns, chicken, shiitake, Szechuan pepper and peanuts.", price: 963 },
    { name: "Szechuan Soup", description: "Shrimp and chicken in a rich dark broth with fish crackers.", price: 1095 },
    { name: "Hot & Sour Soup", description: "Spicy soup with chicken and vegetables, fish crackers.", price: 765 },
    { name: "Cream of Mushroom Soup", description: "Rich mushroom soup served with garlic bread.", price: 985 },
    { name: "Cream of Chicken Soup", description: "Smooth chicken soup served with garlic bread.", price: 875 },
    { name: "Chicken Corn Soup", description: "Chicken and sweet corn soup with fish crackers.", price: 765 },
    { name: "Tomato Basil Soup", description: "Smooth tomato soup with basil, croutons and garlic bread.", price: 875 },
  ]},
  { name: "Breakfast", slug: "breakfast", items: [
    { name: "Brioche French Toast", description: "Brioche French toast with berries.", price: 1450 },
    { name: "Pulled Beef Eggs Benedict", description: "Poached eggs and pulled beef on brioche.", price: 1650 },
    { name: "Shakshuka", description: "Eggs poached in spiced tomato sauce.", price: 1250 },
    { name: "Buttermilk Pancakes", description: "Fluffy buttermilk pancakes with maple.", price: 1350 },
    { name: "French Omelette", description: "Herb French omelette with sides.", price: 1150 },
    { name: "Berries and Granola Bowl", description: "Fresh berries, granola and yoghurt.", price: 1050 },
  ]},
  { name: "Mains", slug: "mains", items: [
    { name: "Butter Stuffed Chicken", description: "Crispy chicken breast filled with cheese, spinach and turkey bacon.", price: 2450, featured: true },
    { name: "Moroccan Chicken", description: "House Moroccan-spiced chicken.", price: 2195, featured: true },
    { name: "Chicken Parm", description: "Breaded chicken with tomato sauce and melted cheese.", price: 1950 },
    { name: "Grilled Chicken with Tarragon Sauce", description: "Grilled chicken in a creamy tarragon sauce.", price: 2100, featured: true },
    { name: "Cordon Bleu Chicken", description: "Breaded chicken stuffed with ham and cheese.", price: 2200, featured: true },
    { name: "Kung Pao Chicken", description: "Kung pao chicken, wok-tossed.", price: 1950 },
    { name: "Norwegian Pink Salmon", description: "Grilled salmon in pink sauce.", price: 6995 },
  ]},
  { name: "Pan Asian", slug: "pan-asian", items: [
    { name: "Crispy Honey Chicken", description: "Fried chicken in a sweet and savoury honey glaze.", price: 2030 },
    { name: "Bai Ze Chicken", description: "Stuffed breaded chicken breast with a tangy sauce.", price: 2195 },
    { name: "Cashew Nut Chicken", description: "Crispy chicken with cashews, vegetables and mushrooms.", price: 2140 },
    { name: "Beef Chilli Dry", description: "Beef strips stir-fried with chillies, with egg fried rice.", price: 2475 },
    { name: "Dragon Chicken", description: "Chicken strips in a fiery spice blend.", price: 2030 },
  ]},
  { name: "Pasta", slug: "pasta", items: [
    { name: "Tagliatelle Alfredo Pasta", description: "Baked pasta with jalapeños and olives in creamy alfredo.", price: 2275, featured: true },
    { name: "Creamy Neapolitan Pasta", description: "Creamy Neapolitan sauce with crispy fried chicken.", price: 1975, featured: true },
    { name: "Penne Arrabiata Pasta", description: "Penne in a spicy arrabiata tomato sauce.", price: 2050, featured: true },
    { name: "Penne Florentine", description: "Penne in creamy spinach sauce with crispy fried chicken.", price: 2085 },
    { name: "Fettuccine Pesto", description: "Homemade pasta in fresh basil pesto with mushrooms.", price: 2325 },
    { name: "Mac & Cheese Pasta", description: "Classic baked macaroni in house cheese sauce.", price: 1700 },
  ]},
  { name: "Noodles", slug: "noodles", items: [
    { name: "Thai Spicy Noodles", description: "Rice noodles in a Thai-style spicy sauce.", price: 1661 },
    { name: "Chicken Chowmein", description: "Stir-fried noodles with chicken and vegetables.", price: 1645 },
  ]},
  { name: "Pizza", slug: "pizza", items: [
    { name: "Spicy Chicken Tikka Pizza", description: "Spicy chicken tikka, onions and mozzarella.", price: 1920 },
    { name: "Sicilian Chicken Pizza", description: "Sicilian spiced chicken, jalapeños, capsicum and buffalo mozzarella.", price: 2145 },
    { name: "Spicy Chicken Tikka Pizza (14 in)", description: "Spicy chicken tikka, onions and mozzarella.", price: 2250 },
    { name: "Sicilian Chicken Pizza (14 in)", description: "Sicilian spiced chicken pizza, large.", price: 2525 },
    { name: "Margherita Pizza", description: "San Marzano tomato, fresh mozzarella, basil.", price: 1950 },
    { name: "Pepperoni Pizza", description: "Pepperoni and mozzarella on wood-fired base.", price: 2250 },
  ]},
  { name: "Sandwiches & Burgers", slug: "sandwiches-burgers", items: [
    { name: "Dynamite Panini", description: "Grilled chicken in dynamite sauce, tomatoes and iceberg in panini bread.", price: 1425, featured: true },
    { name: "Turkey Club Sandwich", description: "Grilled chicken, smoked turkey, fried egg and special sauce.", price: 1755 },
    { name: "Philly Cheese Steak Sandwich", description: "Beef, cheese, mushrooms and capsicum with potato wedges.", price: 2035 },
    { name: "Smoking Cheese Beef Burger", description: "Signature beef patty with cheese disk, BBQ sauce and gherkin.", price: 2035, featured: true },
    { name: "Smoking Cheese Chicken Burger", description: "Signature chicken patty with cheese disk and BBQ sauce.", price: 1755 },
    { name: "Chicken Smash Burger", description: "Juicy patty, caramelized onions and cheese, with fries.", price: 1425 },
    { name: "Beef Smash Burger", description: "Juicy beef patty, caramelized onions and cheese, with fries.", price: 2140 },
    { name: "Buttermilk Burger", description: "Buttermilk fried chicken, classic or Nashville style.", price: 1848 },
    { name: "Swiss Mushroom Chicken Burger", description: "Mushroom sauce, tomato and lettuce on a thick patty.", price: 1755 },
    { name: "Swiss Mushroom Beef Burger", description: "Mushroom sauce, tomato and lettuce on a beef patty.", price: 2035 },
  ]},
  { name: "Bakery", slug: "bakery", items: [
    { name: "Butter Croissant", description: "Freshly baked butter croissant.", price: 495 },
    { name: "Chocolate Chunk Cookie", description: "Soft-baked cookie with dark chocolate chunks.", price: 225 },
    { name: "Double Chocolate Cookie", description: "Soft, chewy double chocolate cookie.", price: 295 },
    { name: "Chocolate Brownie", description: "Dense chocolate brownie.", price: 450 },
    { name: "Nutella Brownie", description: "Fudgy brownie with Nutella swirl.", price: 450 },
    { name: "Chocolate Choux", description: "Choux pastry with chocolate.", price: 550 },
    { name: "Apple Crumble Tart", description: "Buttery apple crumble tart.", price: 650 },
  ]},
  { name: "Desserts", slug: "desserts", items: [
    { name: "Sebastian Cheesecake", description: "The house favourite cheesecake.", price: 950, featured: true },
    { name: "Lotus Cheesecake Slice", description: "Lotus biscuit cheesecake slice.", price: 850 },
    { name: "Chocolate Éclair", description: "Choux pastry with chocolate.", price: 600 },
    { name: "Walnut Brownie", description: "Dense walnut brownie, served warm.", price: 550 },
    { name: "Ice Cream Sundae", description: "Sundae with chocolate and nuts.", price: 750 },
  ]},
  { name: "Drinks", slug: "drinks", items: [
    { name: "Coffee", description: "Freshly brewed. Ask staff for today's options.", price: 350 },
    { name: "Cappuccino", description: "Espresso with steamed milk foam.", price: 450 },
    { name: "Flat White", description: "Double espresso with velvety milk.", price: 480 },
    { name: "Iced Caramel Macchiato", description: "Espresso over milk with caramel.", price: 550, featured: true },
    { name: "Matcha Latte", description: "Warm, creamy matcha latte with caramel sweetness.", price: 875 },
    { name: "Peach Iced Tea", description: "Refreshing peach iced tea.", price: null, featured: true },
    { name: "Jasmine Green Tea", description: "Green tea that will make you smile.", price: 295 },
    { name: "Masala Tea", description: "Spiced milk tea.", price: 425 },
    { name: "Mint Green Tea", description: "Green tea infused with mint.", price: 295 },
    { name: "Lemon Green Tea", description: "Green tea with lemon.", price: 295 },
    { name: "Herbal Wellness Tea", description: "Ginger, turmeric, lemongrass and chamomile blend.", price: 450 },
    { name: "Hot Chocolate", description: "Rich hot chocolate.", price: 500 },
    { name: "Dark Chocolate Shake", description: "Rich dark chocolate milkshake.", price: 650 },
    { name: "Marshmallow Shake", description: "Marshmallow milkshake.", price: 650 },
    { name: "Cookie N Cream Shake", description: "Cookie and cream milkshake.", price: 650 },
    { name: "Mango Smoothie", description: "Fresh mango smoothie.", price: 600 },
    { name: "French Vanilla Frappé", description: "Blended coffee frappé.", price: 700 },
    { name: "The Last Temptation", description: "House signature mocktail.", price: 550, featured: true },
    { name: "Passion Fruit Mocktail", description: "Fresh passion fruit mocktail.", price: 500 },
  ]},
];

  for (const [ci, cat] of menu.entries()) {
    await prisma.category.create({
      data: {
        name: cat.name,
        slug: cat.slug,
        sortOrder: ci,
        items: {
          create: cat.items.map((it, ii) => ({ name: it.name, description: it.description, price: it.price, featured: it.featured ?? false, imageUrl: DISH_PHOTOS[it.name] ?? "", sortOrder: ii })),
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
