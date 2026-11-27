-- Sizes or proteins with their own prices, e.g. "Small 710 | Regular 930 | Large 1145"
ALTER TABLE "MenuItem" ADD COLUMN     "options" TEXT NOT NULL DEFAULT '';

-- Lets the seed swap in a new built-in menu once, without touching later admin edits
ALTER TABLE "Settings" ADD COLUMN     "menuVersion" TEXT NOT NULL DEFAULT '';
