// share.js
// ---------------------------------------------------------------
// "Share my chart" links, so friends can add each other to
// Connections without typing anything (and without accounts).
//
// The link carries your name and birth details, written in a
// compact code after the # of the address, for example:
//   connections.html#add=eyJuIjoiU2FsbWEiLC…
// The part after # is never sent to the website's server: it stays
// between you, the person you send it to, and their browser.
// ---------------------------------------------------------------

// Text → a code that is safe inside an address (base64url).
function encode(text) {
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function decode(code) {
  const binary = atob(code.replace(/-/g, '+').replace(/_/g, '/'));
  return new TextDecoder().decode(Uint8Array.from(binary, (c) => c.charCodeAt(0)));
}

// Build the link for your own chart. Only what's needed is included.
export function makeShareLink(name, birth) {
  const data = {
    n: name,
    y: birth.year, m: birth.month, d: birth.day,
    t: birth.timeKnown ? [birth.hour, birth.minute] : null,
    o: birth.offsetMinutes ?? null,
    p: [birth.place.label, birth.place.latitude, birth.place.longitude, birth.place.timeZone],
  };
  const page = new URL('connections.html', window.location.href);
  page.hash = `add=${encode(JSON.stringify(data))}`;
  return page.href;
}

// Read a shared link. Returns { name, birth } or null if the link is
// broken or has been changed. Everything is checked, because anyone
// could edit a link by hand.
export function readShareCode(code) {
  try {
    const d = JSON.parse(decode(code));
    const isInt = Number.isInteger;
    const name = typeof d.n === 'string' ? d.n.trim().slice(0, 40) : '';
    const [label, latitude, longitude, timeZone] = Array.isArray(d.p) ? d.p : [];
    if (!name || !isInt(d.y) || !isInt(d.m) || !isInt(d.d)) return null;
    if (typeof label !== 'string' || typeof timeZone !== 'string') return null;
    if (typeof latitude !== 'number' || Math.abs(latitude) > 90 || typeof longitude !== 'number' || Math.abs(longitude) > 180) return null;
    new Intl.DateTimeFormat('en', { timeZone }); // throws if the time zone isn't real

    const birth = {
      year: d.y, month: d.m, day: d.d,
      timeKnown: Array.isArray(d.t),
      place: { label: label.slice(0, 120), latitude, longitude, timeZone },
    };
    if (birth.timeKnown) {
      const [hour, minute] = d.t;
      if (!isInt(hour) || !isInt(minute) || hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;
      birth.hour = hour;
      birth.minute = minute;
    }
    if (isInt(d.o)) birth.offsetMinutes = d.o;
    return { name, birth };
  } catch {
    return null;
  }
}
