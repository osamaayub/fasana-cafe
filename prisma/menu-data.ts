/*
 * Fasana Café menu, taken from the café's own brochures (Nov 2026):
 * "MENU BAHRIA", "BREAKFAST MENU AUG 26" and "From the Bar BAHRIA".
 * Bakery & Desserts is not in the brochures; those items and prices come from the café's Foodpanda page.
 *
 * Bump MENU_VERSION whenever this file changes: the next deploy's seed then replaces the live menu once.
 * Admin edits made after that are kept until the version changes again.
 */

export const MENU_VERSION = "2026-11-27-brochures";

export type MenuSeedItem = {
  name: string;
  description?: string;
  /** Single price in PKR. Leave out when `options` is set: the lowest option price is used. */
  price?: number | null;
  /** Sizes or proteins, e.g. "Chicken 2030 | Beef 2475 | Prawns 2635". */
  options?: string;
  featured?: boolean;
  /** Key in DISH_PHOTOS when it differs from the dish name. */
  photo?: string;
};

export type MenuSeedCategory = { name: string; slug: string; items: MenuSeedItem[] };

const sml = (s: number, r: number, l: number) => `Small ${s} | Regular ${r} | Large ${l}`;
const rl = (r: number, l: number) => `Regular ${r} | Large ${l}`;
const pizza = (ten: number, fourteen: number) => `10 inch ${ten} | 14 inch ${fourteen}`;
const RICE = " Served with egg fried, masala or garlic rice.";

export const MENU: MenuSeedCategory[] = [
  {
    name: "Breakfast",
    slug: "breakfast",
    items: [
      { name: "English Breakfast", description: "Sunny-side-up eggs, hash brown, baked beans, turkey bacon, toast and grilled veggies.", price: 1755 },
      { name: "Eggs Benedict", description: "Poached eggs on English muffins with hollandaise sauce, greens and a fruit bowl.", options: "With pulled beef 1735 | With turkey bacon 1895 | With smoked salmon 2145", photo: "Pulled Beef Eggs Benedict" },
      { name: "Steak and Eggs", description: "Grilled tenderloin, eggs your way, gratin potatoes and mushroom demi-glace.", price: 3095 },
      { name: "Shakshuka", description: "Spicy pepper and tomato sauce with eggs your way, cheese and pita bread.", options: "Classic 1425 | Chicken 1755 | Beef sausage 1965" },
      { name: "Scrambled Eggs", description: "Classic scrambled eggs with toast, hash browns and greens.", price: 1045 },
      { name: "Shroom Cheese Omelette", description: "Fluffy omelette with mozzarella, hash browns and baked beans.", price: 1955 },
      { name: "Stuffed French Omelette", description: "Classic French omelette stuffed with chicken and Swiss cheese, with hash browns.", price: 1365 },
      { name: "Mexican Omelette", description: "Spicy omelette stuffed with kidney beans and bell peppers, with patatas bravas and salsa.", price: 1645 },
      { name: "Vegetarian Omelette", description: "Mixed bell peppers, sweet corn and cherry tomatoes, with gratin potatoes.", price: 1095 },
      { name: "Pakistani Omelette", description: "Traditional desi omelette with achar and kachumber salad.", price: 985 },
      { name: "Buttermilk Pancakes", description: "Buttery-soft pancakes with maple syrup, Nutella and fruit.", price: 975 },
      { name: "Brioche French Toast", description: "Milky brioche French toast topped with maple syrup and nuts.", price: 1645 },
      { name: "Nutella French Toast", description: "Nutella-filled French toast with caramelised banana.", price: 1705 },
      { name: "Pulled Beef Toast", description: "Slow-simmered beef with cayenne pepper on sourdough, topped with an egg.", price: 1795 },
      { name: "Berries & Granola Bowl", description: "Mixed berries, Greek yogurt, house-made granola, nuts and chia seeds.", price: 1495, photo: "Berries and Granola Bowl" },
      { name: "Hummus & Falafel", description: "Classic hummus and falafel with pita bread.", price: 1575 },
      { name: "Hummus Bil Lahme", description: "Classic hummus with spiced meat and olive oil, served with pita bread.", price: 2475 },
      { name: "Fruit Cocktail Bowl", description: "Mixed seasonal fruits.", price: 945 },
      { name: "Butter Croissant", description: "Flaky, freshly baked croissant.", price: 655 },
      { name: "Almond Croissant", description: "Croissant with a sweet almond filling.", price: 875 },
      { name: "Chocolate Croissant", description: "Croissant with a chocolate filling.", price: 875 },
      { name: "Mini Pancakes", description: "For the little ones: with maple syrup or Nutella, and fruit.", price: 715 },
      { name: "Chicken Tenders & Fries", description: "For the little ones, served with house sauce.", price: 1295 },
    ],
  },
  {
    name: "Breakfast Sides",
    slug: "breakfast-sides",
    items: [
      { name: "Toast", price: 50 },
      { name: "Fried Egg", price: 120 },
      { name: "Spicy Aioli", price: 150 },
      { name: "Baked Beans", price: 250 },
      { name: "Mixed Greens", price: 270 },
      { name: "Patatas Bravas", price: 300 },
      { name: "Hash Brown", price: 320 },
      { name: "Maple Syrup", price: 330 },
      { name: "Nutella", price: 330 },
      { name: "Sautéed Mushrooms", price: 350 },
      { name: "Sausage", price: 500 },
      { name: "Turkey Bacon", price: 550 },
      { name: "House-made Granola", price: 790 },
    ],
  },
  {
    name: "Small Plates",
    slug: "small-plates",
    items: [
      { name: "Loaded Fries", description: "Crispy fries topped with chicken, jalapeños, black olives, jack cheese and a trio of special sauces.", price: 1695 },
      { name: "Sweet Potato Fries", description: "Golden sweet potato fries with the chef's garlic mayo.", price: 1095 },
      { name: "Mozzarella Sticks", description: "Crispy breaded mozzarella sticks with our chef's special garlic dip.", price: 1495, featured: true },
      { name: "Chicken Strips", description: "Crispy, golden-fried chicken strips with our chef's special dip.", price: 1425 },
      { name: "Dynamite Tempura Chicken", description: "Crispy tempura-fried chicken coated in creamy dynamite sauce.", price: 1535 },
      { name: "Tempura Prawns", description: "Crispy batter-fried prawns with a choice of sweet chilli, wasabi or wonton sauce.", price: 2525 },
      { name: "Dynamite Shrimps", description: "Crispy shrimp coated in a rich and spicy dynamite sauce.", price: 1865 },
      { name: "Chilli Garlic Prawns", description: "Juicy prawns stir-fried with garlic, chillies and a special sauce.", price: 2085 },
      { name: "Finger Fish with Tamarind Sauce", description: "Crispy fish fingers with a tangy tamarind sauce.", price: 2035 },
      { name: "Teriyaki Beef Bites", description: "Tender beef bites glazed in a savoury teriyaki sauce.", price: 2195 },
      { name: "Glazed Buffalo Wings", description: "Crispy wings coated in a tangy buffalo glaze.", price: 1315 },
      { name: "Sweet Chilli Wings", description: "Fried wings tossed in a sweet and spicy chilli sauce.", price: 1315 },
      { name: "Korean Spicy Wings", description: "Crispy wings tossed in a fiery chilli sauce.", price: 1315 },
      { name: "Lime Chicken Tacos", description: "Soft tacos with lime-grilled chicken, cilantro, habanero chilli, tangy salsa and sour cream.", price: 1535 },
      { name: "Beef Birria Tacos", description: "Slow-simmered spiced pulled beef in crispy tacos with tomatillo salsa, cilantro and cayenne pepper.", price: 1865 },
    ],
  },
  {
    name: "Soups",
    slug: "soups",
    items: [
      { name: "House Special Soup", description: "Prawns, chicken, shiitake mushrooms, Szechuan pepper and peanuts.", price: 975 },
      { name: "Hot & Sour Soup", description: "Classic spicy and tangy soup with chicken and vegetables, served with fish crackers.", price: 765 },
      { name: "Cream of Mushroom Soup", description: "Rich and creamy mushroom soup with garlic bread.", price: 985 },
      { name: "Cream of Chicken Soup", description: "Smooth and velvety chicken soup with garlic bread.", price: 935 },
      { name: "Szechuan Soup", description: "Shrimp, chicken and black mushrooms in a rich, dark broth, served with fish crackers.", price: 1095 },
      { name: "Chicken Corn Soup", description: "Classic chicken and sweet corn soup, served with fish crackers.", price: 765 },
      { name: "Tomato Basil Soup", description: "Smooth tomato soup infused with basil, with croutons and garlic bread.", price: 985 },
    ],
  },
  {
    name: "Salads",
    slug: "salads",
    items: [
      { name: "Classic Caesar Salad", description: "Crisp iceberg lettuce, grilled chicken, black olives and sun-dried tomatoes with creamy Caesar dressing.", price: 1695 },
      { name: "Thai Fusion Salad", description: "Thai-inspired salad with chicken, prawns, cucumber, cashew nuts and mixed vegetables.", price: 1535 },
      { name: "Quinoa Salad", description: "Steamed quinoa, chickpeas, mixed greens, candied walnuts, cucumber and mustard vinaigrette.", price: 1795 },
      { name: "Greek Salad", description: "Feta, kale, iceberg lettuce, rocket, black olives, capsicum, onion and cherry tomatoes.", price: 1430 },
    ],
  },
  {
    name: "Seafood",
    slug: "seafood",
    items: [
      { name: "Caper Grilled Fish", description: "Grilled sole with a creamy caper sauce and sweet potato fries.", price: 2855 },
      { name: "Pan-Seared Sole", description: "With lemon butter sauce, grilled vegetables and sweet potato fries.", price: 2855 },
      { name: "Fish & Chips", description: "Classic crumbed fish with French fries and tartar sauce.", price: 2195 },
      { name: "Sole Mediterranean", description: "Char-grilled sole with a tangy balsamic reduction and celery, served with mashed potatoes.", price: 2995 },
    ],
  },
  {
    name: "Poultry",
    slug: "poultry",
    items: [
      { name: "Butter Stuffed Chicken", description: "Golden-fried chicken fillet filled with a rich cheese and butter sauce, with sautéed vegetables and spaghetti in marinara and Parmesan.", price: 2345, featured: true },
      { name: "Cordon Bleu", description: "Crispy chicken breast stuffed with homemade cheese, spinach, turkey bacon and black olive sauce, with mashed potatoes and sautéed vegetables.", price: 2525, featured: true, photo: "Cordon Bleu Chicken" },
      { name: "Chicken Parm", description: "Crispy chicken topped with Parmesan and marinara, served with creamy red sauce pasta.", price: 2495 },
      { name: "Flame Roasted Chicken", description: "Half a flame-roasted spicy chicken with Latin rice, seasonal greens and rosemary jus.", price: 2890 },
      { name: "Moroccan Chicken", description: "Grilled chicken in a rich Moroccan sauce, with sautéed vegetables and garlic rice.", price: 2195, featured: true },
      { name: "Grilled Chicken with Tarragon Sauce", description: "Tender grilled chicken fillet with creamy tarragon sauce, mashed potatoes and sautéed vegetables.", price: 2195, featured: true },
      { name: "Grilled Chicken with Jalapeño Sauce", description: "Tender grilled chicken fillet with the chef's spicy jalapeño sauce, mashed potatoes and sautéed vegetables.", price: 2195 },
      { name: "Thai Lemon Chicken", description: "Crispy battered chicken with nam jim sauce, lemon zest, bird's eye chilli and mushroom butter rice.", price: 1750 },
      { name: "Parmesan Stuffed Chicken", description: "Breaded chicken stuffed with mozzarella and Parmesan, with wholegrain mustard sauce and mashed potatoes.", price: 2840 },
    ],
  },
  {
    name: "Pasta",
    slug: "pasta",
    items: [
      { name: "Tagliatelle Alfredo", description: "Baked homemade pasta with jalapeños and black olives in a creamy Alfredo sauce.", price: 1750, featured: true, photo: "Tagliatelle Alfredo Pasta" },
      { name: "Creamy Neapolitan", description: "A creamy twist on classic Neapolitan sauce pasta, with crispy fried chicken.", price: 1795, featured: true, photo: "Creamy Neapolitan Pasta" },
      { name: "Penne Arrabiata", description: "Penne in a spicy arrabiata tomato sauce.", price: 1700, featured: true, photo: "Penne Arrabiata Pasta" },
      { name: "Bianco Tortellini", description: "Homemade tortellini filled with cream cheese in a rich house-special white sauce.", price: 2024 },
      { name: "Au Gratin", description: "Homemade fettuccine baked in a house-special spicy, creamy red sauce.", price: 1750 },
      { name: "Garlic Parm", description: "Homemade fettuccine with garlic-sautéed mushrooms, olives and bell peppers in a tangy Parmesan sauce.", price: 1795 },
      { name: "Fettuccine Pesto", description: "Homemade pasta in fresh basil pesto with mushrooms.", price: 1795 },
      { name: "Spaghetti al Truffle", description: "Rich, creamy truffle-infused pasta with mushrooms and Parmesan.", price: 2855 },
      { name: "Mac & Cheese", description: "Classic baked macaroni in a rich, creamy house cheese sauce.", price: 1545, photo: "Mac & Cheese Pasta" },
      { name: "Penne Florentine", description: "Penne in a creamy spinach Florentine sauce with crispy fried chicken.", price: 2085 },
      { name: "Chicken Lasagna", description: "Extra virgin olive oil, sofrito, peeled tomatoes, béchamel and buffalo mozzarella.", price: 1890, photo: "Lasagne" },
      { name: "Pasta Add-ons", description: "Add to any pasta.", options: "Chicken 385 | Prawns 550" },
    ],
  },
  {
    name: "Pizza",
    slug: "pizza",
    items: [
      { name: "Smoked Chicken", description: "Italian style. Smoked chicken, mushrooms, sun-dried tomatoes and mozzarella.", price: 2618 },
      { name: "Tuscan Pesto", description: "Italian style. Rich pesto sauce, mozzarella and fresh cherry tomatoes.", price: 2280 },
      { name: "Quattro Formaggi", description: "Italian style. Four cheeses (cheddar, cottage, mozzarella and gouda) on a tomato base.", price: 2360 },
      { name: "Margherita Italiana", description: "Italian style. Classic margherita with fresh mozzarella and basil.", price: 2195, photo: "Margherita Pizza" },
      { name: "Pepperoni & Pesto", description: "Italian style. Smoked beef pepperoni, buffalo mozzarella, basil pesto and jalapeños.", price: 2965, photo: "Pepperoni Pizza" },
      { name: "Montanara", description: "American style, thin crust or deep pan. Beef and chicken pepperoni, sausage and buffalo mozzarella.", options: pizza(1920, 2390), photo: "Montanara Pizza" },
      { name: "Capricciosa", description: "American style, thin crust or deep pan. Chicken, mozzarella, mushrooms, olives, capsicum and basil.", options: pizza(1920, 2475) },
      { name: "Chicken Tikka", description: "American style, thin crust or deep pan. Spicy chicken tikka, onions and mozzarella.", options: pizza(1920, 2250), photo: "Spicy Chicken Tikka Pizza" },
      { name: "Fajita Sicilian", description: "American style, thin crust or deep pan. Spicy Sicilian chicken, jalapeños, tomatoes, onions and mozzarella.", options: pizza(2145, 2525), photo: "Sicilian Chicken Pizza" },
      { name: "Margherita", description: "American style, thin crust or deep pan. Buffalo mozzarella and cheddar on tomato sauce.", options: pizza(1700, 1920), photo: "Margherita Pizza" },
      { name: "Fresh Garden", description: "American style, thin crust or deep pan. Corn, tomatoes, capsicum, onions, basil and mozzarella.", options: pizza(1545, 1995) },
    ],
  },
  {
    name: "Pan Asian",
    slug: "pan-asian",
    items: [
      { name: "Szechuan", description: "Stir-fried with mixed vegetables and dry red chillies in a bold, spicy Szechuan sauce." + RICE, options: "Chicken 2030 | Beef 2475 | Prawns 2635", photo: "Prawn Szechuan" },
      { name: "Dragon Fire", description: "Our hottest: stir-fried with green chillies and mixed vegetables in a fiery sauce." + RICE, options: "Chicken 2030 | Beef 2475 | Prawns 2635", photo: "Dragon Chicken" },
      { name: "Chilli Dry", description: "Stir-fried with green chillies, ginger and spring onion in our chef's special sauce." + RICE, options: "Chicken 2030 | Beef 2375 | Prawns 2635", photo: "Beef Chilli Dry" },
      { name: "Kung Pao", description: "Stir-fried with peanuts, vegetables, shallots and spring onion in a homemade Kung Pao sauce." + RICE, options: "Chicken 2030 | Prawns 2480 | Fish 2415", photo: "Kung Pao Chicken" },
      { name: "Sweet & Sour", description: "Stir-fried with capsicum, onion, pineapple and carrot in a homemade sweet and sour sauce." + RICE, options: "Chicken 2030 | Prawns 2360 | Fish 2250" },
      { name: "Cashew Nut", description: "Crispy fried and topped with roasted cashews, mixed vegetables, mushrooms and tomatoes." + RICE, options: "Chicken 2140 | Prawns 2635", photo: "Cashew Nut Chicken" },
      { name: "Roasted Chilli Garlic Chicken", description: "Dry tom yum, bird's eye chillies, mixed bell peppers, mushrooms and nam pla, served with garlic rice.", price: 2195 },
      { name: "Sesame Chicken", description: "Crispy chicken in a savoury sesame glaze with capsicum and broccoli." + RICE, price: 2145 },
      { name: "Bai Ze Chicken", description: "Stuffed breaded chicken breast with a strong, tangy sauce." + RICE, price: 2195 },
      { name: "Crispy Honey Chicken", description: "Fried chicken in a sweet and savoury honey glaze with a hint of spice." + RICE, price: 2140 },
      { name: "Thai Hot Basil", description: "Stir-fried chicken in a spicy basil-infused sauce with capsicum and onion." + RICE, price: 1975 },
      { name: "Crispy Mongolian Beef", description: "Crispy beef slices with spring onion in our signature Mongolian sauce." + RICE, price: 2475 },
    ],
  },
  {
    name: "Noodles",
    slug: "noodles",
    items: [
      { name: "Dark Soy Chicken Noodles", description: "Dry tom yum, fresh lime, sweet basil, nam pla and bird's eye chillies.", price: 1755 },
      { name: "Thai Spicy Noodles", description: "Stir-fried Thai rice noodles with chicken, onion, bell peppers, mushrooms and chillies.", price: 1660 },
      { name: "Stir-Fried Beef Noodles", description: "Beef stir-fried with mixed vegetables and noodles in our chef's special sauce.", price: 2175 },
      { name: "Chicken Chow Mein", description: "Noodles stir-fried in our special sauce with chicken and assorted vegetables.", price: 1645, photo: "Chicken Chowmein" },
      { name: "Vegetable Chow Mein", description: "Noodles stir-fried in our special sauce with assorted vegetables.", price: 1315 },
    ],
  },
  {
    name: "Burgers",
    slug: "burgers",
    items: [
      { name: "Smoking Cheese Burger", description: "Signature BBQ sauce, cheese, iceberg lettuce and gherkins. Served with coleslaw and fries.", options: "Chicken 1695 | Beef 1850", featured: true, photo: "Smoking Cheese Beef Burger" },
      { name: "Smash Burger", description: "Juicy patty, caramelised onions and cheese, with chilli garlic mayo or black pepper mayo. Served with fries and coleslaw.", options: "Chicken 1425 | Beef 1750", photo: "Smash Beef Burger" },
      { name: "Swiss Mushroom Burger", description: "Homemade Swiss mushroom sauce, tomato and iceberg lettuce. Served with coleslaw and fries.", options: "Chicken 1595 | Beef 1850", photo: "Swiss Mushroom Beef Burger" },
      { name: "Crispy Chicken Burger", description: "Crumbed chicken thigh, iceberg lettuce and cocktail sauce. Served with fries and coleslaw.", price: 1640 },
      { name: "Buttermilk Burger", description: "Classic or Nashville style, served with French fries and coleslaw.", price: 1680 },
    ],
  },
  {
    name: "Sandwiches",
    slug: "sandwiches",
    items: [
      { name: "Dynamite Panini", description: "Grilled chicken chunks with dynamite sauce in panini bread. Served with coleslaw and fries.", price: 1495, featured: true },
      { name: "Turkey Club Sandwich", description: "Grilled chicken, smoked turkey bacon, fried egg, iceberg, tomatoes and special sauce. Served with coleslaw and fries.", price: 1755 },
      { name: "Philly Cheese Steak Sandwich", description: "Beef, cheese, mushrooms, capsicum, onion and sweet corn, with potato wedges.", price: 2145 },
      { name: "Grilled Chicken Croissant", description: "Grilled chicken, garlic aioli and buffalo mozzarella, with French fries.", price: 1705 },
      { name: "Fajita Wrap", description: "Spicy fajita chicken, bell peppers, sweet corn and cheese, with French fries.", price: 1535 },
      { name: "Tikka Sourdough Sandwich", description: "Marinated chicken, masala mayo, lettuce, mozzarella and Swiss cheddar, with French fries.", price: 1380 },
    ],
  },
  {
    name: "Bakery & Desserts",
    slug: "bakery-desserts",
    items: [
      { name: "Sebastian Cheesecake", description: "The house favourite cheesecake.", price: 950, featured: true },
      { name: "Lotus Cheesecake Slice", description: "Lotus biscuit cheesecake slice.", price: 850 },
      { name: "Chocolate Éclair", description: "Choux pastry with chocolate.", price: 600 },
      { name: "Walnut Brownie", description: "Dense walnut brownie, served warm.", price: 550 },
      { name: "Ice Cream Sundae", description: "Sundae with chocolate and nuts.", price: 750 },
      { name: "Apple Crumble Tart", description: "Buttery apple crumble tart.", price: 650 },
      { name: "Chocolate Choux", description: "Choux pastry with chocolate.", price: 550 },
      { name: "Chocolate Brownie", description: "Dense chocolate brownie.", price: 450 },
      { name: "Nutella Brownie", description: "Fudgy brownie with a Nutella swirl.", price: 450 },
      { name: "Double Chocolate Cookie", description: "Soft, chewy double chocolate cookie.", price: 295 },
      { name: "Chocolate Chunk Cookie", description: "Soft-baked cookie with dark chocolate chunks.", price: 225 },
    ],
  },
  {
    name: "Hot Coffee & Chocolate",
    slug: "hot-coffee",
    items: [
      { name: "Cappuccino", description: "Made with premium illy beans.", options: sml(710, 930, 1145) },
      { name: "Café Latte", description: "Made with premium illy beans.", options: sml(710, 930, 1145) },
      { name: "Flat White", description: "Made with premium illy beans. One size.", price: 710 },
      { name: "Americano", description: "Made with premium illy beans.", options: sml(545, 710, 930) },
      { name: "Flavoured Latte", description: "Vanilla, caramel or hazelnut.", options: sml(820, 1040, 1245) },
      { name: "Spanish Latte", options: sml(820, 1040, 1245) },
      { name: "Caramel Macchiato", options: sml(930, 1095, 1295) },
      { name: "Hazelnut Macchiato", options: sml(930, 1095, 1295) },
      { name: "Mocha", options: sml(930, 1095, 1295) },
      { name: "Pumpkin Spiced Latte", options: sml(820, 1040, 1245) },
      { name: "Butterscotch Latte", options: sml(820, 1040, 1245) },
      { name: "Signature Hot Chocolate", options: sml(820, 1040, 1260), photo: "Hot Chocolate" },
      { name: "Dark Hot Chocolate", options: sml(1095, 1315, 1495) },
      { name: "Marshmallow Hot Chocolate", options: sml(1095, 1295, 1495) },
      { name: "Vanilla Hot Chocolate", options: sml(1095, 1295, 1495) },
    ],
  },
  {
    name: "Iced Coffee & Frappés",
    slug: "iced-coffee",
    items: [
      { name: "Iced Caramel Macchiato", description: "Iced or blended.", options: rl(1195, 1395), featured: true },
      { name: "Iced Latte", description: "Iced or blended.", options: rl(985, 1195) },
      { name: "Iced Flavoured Latte", description: "Vanilla, caramel or hazelnut. Iced or blended.", options: rl(1095, 1295) },
      { name: "Iced Spanish Latte", description: "Iced or blended.", options: rl(1095, 1295) },
      { name: "Iced Mocha", description: "Iced or blended.", options: rl(1095, 1295) },
      { name: "Iced Hazelnut Macchiato", description: "Iced or blended.", options: rl(1195, 1395) },
      { name: "Iced Pumpkin Spiced Latte", description: "Iced or blended.", options: rl(1095, 1295) },
      { name: "Iced Butterscotch Latte", description: "Iced or blended.", options: rl(1095, 1295) },
      { name: "Caramel Frappé", options: rl(930, 1095), photo: "French Vanilla Frappé" },
      { name: "Hazelnut Frappé", options: rl(930, 1095) },
      { name: "Chocolate Frappé", options: rl(930, 1095) },
      { name: "Dark Chocolate Frappé", options: rl(930, 1095) },
    ],
  },
  {
    name: "Matcha",
    slug: "matcha",
    items: [
      { name: "Matcha Latte", description: "Hot.", options: sml(765, 985, 1195) },
      { name: "Flavoured Matcha Latte", description: "Hot. Spanish, vanilla, caramel or hazelnut.", options: sml(875, 1095, 1295) },
      { name: "Iced Matcha Latte", description: "Iced or blended.", options: rl(930, 1145) },
      { name: "Iced Flavoured Matcha Latte", description: "Spanish, vanilla, caramel or hazelnut. Iced or blended.", options: rl(1040, 1245) },
      { name: "Signature Matcha Latte", description: "Strawberry, raspberry, passion fruit or blueberry. Iced or blended.", options: rl(1145, 1345) },
      { name: "Vanilla Sea Salt Matcha", price: 995 },
      { name: "Berry Lavender Matcha", price: 1195 },
      { name: "White Candy Floss Matcha", price: 1195 },
      { name: "Coconut Matcha", price: 1195 },
      { name: "Strawberry Cloud Matcha", price: 1195 },
    ],
  },
  {
    name: "Shakes",
    slug: "shakes",
    items: [
      { name: "Classic Shake", description: "Chocolate, vanilla or strawberry.", options: rl(765, 875) },
      { name: "Lotus Shake", options: rl(1145, 1245) },
      { name: "Dark Chocolate Shake", options: rl(985, 1095) },
      { name: "Cookies and Cream Shake", options: rl(820, 930), photo: "Cookie N Cream Shake" },
      { name: "Hazelnut Shake", options: rl(820, 930) },
      { name: "Mocha Shake", options: rl(1095, 1145) },
      { name: "Brownie Shake", options: rl(930, 1045) },
      { name: "Marshmallow Shake", options: rl(765, 875) },
      { name: "Classic Cold Coffee", options: rl(820, 1145) },
    ],
  },
  {
    name: "Smoothies & Juices",
    slug: "smoothies-juices",
    items: [
      { name: "Very Berry Smoothie", options: rl(1095, 1495) },
      { name: "Strawberry Banana Smoothie", options: rl(1095, 1495) },
      { name: "Passion Fruit & Coconut Smoothie", options: rl(1145, 1545) },
      { name: "Peachy Pineapple Smoothie", options: rl(1095, 1495) },
      { name: "Mango Pineapple Smoothie", options: rl(1145, 1245), photo: "Mango Smoothie" },
      { name: "Apple Juice", price: 715 },
      { name: "Seasonal Fresh Juice", price: 935 },
      { name: "Apple, Beetroot & Carrot", description: "Detox juice.", price: 655 },
      { name: "Pineapple Mint Ginger", description: "Detox juice.", price: 715 },
    ],
  },
  {
    name: "Chillers & Mocktails",
    slug: "chillers-mocktails",
    items: [
      { name: "The Last Temptation", description: "Signature mocktail, mango and pineapple based.", price: 677, featured: true },
      { name: "The Old Fashioned", description: "Mocktail, peach based.", price: 875 },
      { name: "Island Breeze", description: "Mocktail, apple based.", price: 600 },
      { name: "Passion Fruit Mocktail", price: 545 },
      { name: "Mint Margarita", price: 545 },
      { name: "Piña Colada", price: 820 },
      { name: "Rose Mojito", price: 600 },
      { name: "Passion Fruit Chiller", options: rl(995, 1095) },
      { name: "Strawberry Chiller", options: rl(1095, 1295) },
      { name: "Peach Chiller", options: rl(930, 1040) },
      { name: "Blue Hawaiian Chiller", options: rl(820, 930) },
      { name: "Wild Tropical Chiller", options: rl(820, 930) },
      { name: "Green Apple Chiller", options: rl(655, 765) },
    ],
  },
  {
    name: "Tea",
    slug: "tea",
    items: [
      { name: "Peach Iced Tea", price: 845, featured: true },
      { name: "Lemon Iced Tea", price: 845 },
      { name: "Masala Tea", price: 495 },
      { name: "Mixed Tea", price: 468 },
      { name: "Green Tea", description: "Jasmine, mint or lemon.", price: 325, photo: "Jasmine Green Tea" },
      { name: "Wellness Tea for Two", price: 495, photo: "Herbal Wellness Tea" },
      { name: "Wellness Tea for Four", price: 605 },
    ],
  },
];
