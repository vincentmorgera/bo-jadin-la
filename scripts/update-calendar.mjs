// Télécharge le calendrier iCal Airbnb et écrit public/data/bookings.json (sans dépendance)
import { writeFileSync, readFileSync, existsSync } from "node:fs";

const FILE = "public/data/bookings.json";
const url = process.env.AIRBNB_ICAL_URL;
if (!url) { console.error("AIRBNB_ICAL_URL manquant"); process.exit(1); }

const res = await fetch(url);
if (!res.ok) { console.error("Erreur iCal", res.status); process.exit(1); }

const text = (await res.text()).replace(/\r?\n[ \t]/g, "");
const iso = v => `${v.slice(0,4)}-${v.slice(4,6)}-${v.slice(6,8)}`;
const bookings = [];
for (const ev of text.split("BEGIN:VEVENT").slice(1)) {
  const s = ev.match(/DTSTART[^:]*:(\d{8})/), e = ev.match(/DTEND[^:]*:(\d{8})/);
  if (s && e) bookings.push({ start: iso(s[1]), end: iso(e[1]) });
}
bookings.sort((x, y) => x.start.localeCompare(y.start));

// On n'écrit que si les réservations ont changé
const old = existsSync(FILE) ? JSON.parse(readFileSync(FILE, "utf8")).bookings : null;
if (JSON.stringify(old) !== JSON.stringify(bookings))
  writeFileSync(FILE, JSON.stringify({ updated: new Date().toISOString(), bookings }, null, 2));
console.log(bookings.length, "réservations");