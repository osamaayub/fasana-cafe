import { config } from "dotenv";
import { defineConfig } from "prisma/config";

// .env.local wins over .env (dotenv never overrides already-set vars)
config({ path: ".env.local" });
config({ path: ".env" });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations", seed: "tsx prisma/seed.ts" },
  // process.env (not env()) so `npm install` -> `prisma generate` works before .env.local exists.
  // Commands that touch the database (migrate, seed, studio) still need DATABASE_URL.
  datasource: { url: process.env.DATABASE_URL ?? "" },
});
