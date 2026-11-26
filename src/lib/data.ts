import "server-only";
import { cache } from "react";
import { prisma } from "./prisma";

export const getSettings = cache(async () => {
  const row = await prisma.settings.findUnique({ where: { id: 1 } });
  if (!row) throw new Error("Settings missing. Run `npm run db:seed`.");
  return row;
});

export const getHours = cache(() => prisma.openingHour.findMany({ orderBy: { dayOfWeek: "asc" } }));

export const getHighlights = cache(() => prisma.highlight.findMany({ orderBy: { sortOrder: "asc" } }));

export const getMenu = cache(() =>
  prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: { items: { where: { available: true }, orderBy: { sortOrder: "asc" } } },
  })
);

export const getFeatured = cache(() =>
  prisma.menuItem.findMany({
    where: { featured: true, available: true },
    orderBy: { sortOrder: "asc" },
    include: { category: true },
    take: 6,
  })
);
