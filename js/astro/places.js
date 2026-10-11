// places.js
// ---------------------------------------------------------------
// Birthplace search, using the free Open-Meteo geocoding service
// (no account or key needed, free for non-commercial projects).
// Each result gives us what the chart needs: latitude, longitude
// and the place's time-zone name (e.g. "Europe/Madrid").
//
// The form must only accept a place the user picked from these
// results. Typed text alone never becomes coordinates.
// ---------------------------------------------------------------

const ENDPOINT = 'https://geocoding-api.open-meteo.com/v1/search';

export async function searchPlaces(query, { count = 8, language = 'en' } = {}) {
  const name = query.trim();
  if (name.length < 2) return [];

  const url = new URL(ENDPOINT);
  url.searchParams.set('name', name);
  url.searchParams.set('count', String(count));
  url.searchParams.set('language', language);
  url.searchParams.set('format', 'json');

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Place search failed (${response.status}). Please try again.`);
  }
  const data = await response.json();

  return (data.results ?? [])
    .filter((r) => r.timezone) // without a time zone we can't convert the birth time
    .map((r) => ({
      id: r.id,
      name: r.name,
      // Region details tell apart places with the same name
      // (Springfield, Missouri vs Springfield, Illinois).
      label: [r.name, r.admin2 !== r.name ? r.admin2 : null, r.admin1, r.country]
        .filter(Boolean).join(', '),
      country: r.country,
      latitude: r.latitude,
      longitude: r.longitude,
      timeZone: r.timezone,
    }));
}
