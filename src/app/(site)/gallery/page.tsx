import type { Metadata } from "next";
import { getSettings } from "@lib/data";
import { PageHeader } from "@ui/page-header";
import { PhotoGrid } from "@ui/photo-grid";

export const revalidate = 3600;
export const metadata: Metadata = { title: "Gallery", description: "Inside Fasana Café — the room, the food and the books.", alternates: { canonical: "/gallery" } };

export default async function GalleryPage() {
  const s = await getSettings();
  const images = [s.heroImage, s.storyImage, s.reserveImage, ...s.galleryImages.split("\n").filter(Boolean)].filter(Boolean);
  const unique = [...new Set(images)];
  return (
    <>
      <PageHeader eyebrow="A look inside" title="The room, the food, the books" intro="A few frames from Fasana — come see it in person.">
        <p className="mt-6 text-sm text-muted">{unique.length} photos · swap in your own from Admin → Settings</p>
      </PageHeader>
      <div className="container-x pb-24">
        <PhotoGrid images={unique} />
      </div>
    </>
  );
}
