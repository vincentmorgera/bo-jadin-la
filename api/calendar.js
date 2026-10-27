import ical from 'node-ical';

export default async function handler(req, res) {
  // Colle ton lien d'exportation iCal Airbnb ici :
  const AIRBNB_ICAL_URL = "https://www.airbnb.fr/calendar/ical/1686923054634848912.ics?t=a1b129e9575949828653d84db026404c";

  try {
    const events = await ical.async.fromURL(AIRBNB_ICAL_URL);
    const bookedDates = [];

    for (const key in events) {
      const event = events[key];
      if (event.type === 'VEVENT') {
        bookedDates.push({
          start: event.start,
          end: event.end,
          summary: 'Occupé'
        });
      }
    }

    // Autoriser les requêtes CORS et mettre en cache 15 minutes
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate');
    
    return res.status(200).json({ success: true, bookedDates });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
