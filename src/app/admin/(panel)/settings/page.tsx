import { prisma } from "@/lib/prisma";
import { SettingsForm } from "./settings-form";

export default async function SettingsPage() {
  const [s, hours] = await Promise.all([
    prisma.settings.findUnique({ where: { id: 1 } }),
    prisma.openingHour.findMany({ orderBy: { dayOfWeek: "asc" } }),
  ]);
  if (!s) return <p>Run <code>npm run db:seed</code> first.</p>;
  return (
    <div>
      <h1 className="mb-6 text-4xl text-ink">Settings</h1>
      <SettingsForm s={s} hours={hours} />
    </div>
  );
}
