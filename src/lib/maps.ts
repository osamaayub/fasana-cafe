/*
 * Google Maps links built in Google's documented "Maps URLs" format
 * (https://developers.google.com/maps/documentation/urls/get-started).
 * These open the right place in any browser and in the Google Maps app on Android and iPhone.
 * The old "maps/place/?q=place_id:..." style is undocumented and often opens an empty map on phones.
 */
type Place = { name: string; address: string; mapsUrl: string; mapEmbedQuery: string };

const placeId = (url: string) => url.match(/place_id[:=]([A-Za-z0-9_-]+)/)?.[1] ?? "";
const query = (p: Place) => p.mapEmbedQuery || [p.name, p.address].filter(Boolean).join(", ");

/** "Open in Google Maps". Uses the admin's own share link (e.g. maps.app.goo.gl) when one is set. */
export function mapsLink(p: Place) {
  const own = p.mapsUrl.trim();
  if (/^https:\/\//.test(own) && !own.includes("place_id:")) return own;
  const id = placeId(own);
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query(p))}${id ? `&query_place_id=${id}` : ""}`;
}

/** "Get directions": opens turn-by-turn directions to the café from where the visitor is. */
export function directionsLink(p: Place) {
  const id = placeId(p.mapsUrl);
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(query(p))}${id ? `&destination_place_id=${id}` : ""}`;
}
