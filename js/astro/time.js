// time.js
// ---------------------------------------------------------------
// Turns "14:30 on 3 June 1986 in Madrid" into one exact moment in
// UTC, which is what the astronomy engine needs.
//
// Why this is tricky: the clock offset of a place changes over
// time (summer time, and countries changing their rules). We must
// use the offset that applied on the BIRTH DATE in the BIRTHPLACE,
// never today's offset and never the visitor's own time zone.
//
// The browser already knows the world's time-zone history (the
// IANA database), and Intl.DateTimeFormat lets us ask it "what did
// the clock read in Europe/Madrid at this UTC instant?". We use
// that question to work backwards from a local time to UTC.
// ---------------------------------------------------------------

const formatters = new Map();

// One formatter per time zone, created once and reused.
function formatterFor(timeZone) {
  if (!formatters.has(timeZone)) {
    formatters.set(timeZone, new Intl.DateTimeFormat('en-US', {
      timeZone,
      hourCycle: 'h23',
      year: 'numeric', month: 'numeric', day: 'numeric',
      hour: 'numeric', minute: 'numeric', second: 'numeric',
    }));
  }
  return formatters.get(timeZone);
}

// How many minutes ahead of UTC the clock in `timeZone` was at
// the instant `utcMs` (milliseconds since 1970). Madrid in summer → 120.
export function offsetMinutesAt(utcMs, timeZone) {
  const parts = {};
  for (const p of formatterFor(timeZone).formatToParts(new Date(utcMs))) {
    parts[p.type] = Number(p.value);
  }
  const wallClockAsUtc = Date.UTC(parts.year, parts.month - 1, parts.day,
    parts.hour, parts.minute, parts.second);
  return Math.round((wallClockAsUtc - utcMs) / 60000);
}

// Is this a real calendar date? (Rejects 31 April, 29 Feb 2023 …)
export function isRealDate(year, month, day) {
  const d = new Date(Date.UTC(year, month - 1, day));
  return d.getUTCFullYear() === year && d.getUTCMonth() === month - 1 && d.getUTCDate() === day;
}

/**
 * Convert a local wall-clock time in a time zone to UTC.
 *
 * Returns one of:
 *   { status: 'ok', utc: Date, offsetMinutes }
 *   { status: 'ambiguous', options: [{ utc, offsetMinutes }, …] }
 *       – the clock showed this time twice (clocks went back)
 *   { status: 'nonexistent' }
 *       – the clock skipped this time (clocks went forward)
 */
export function localToUtc({ year, month, day, hour, minute }, timeZone) {
  // Pretend the local time is UTC, then correct by the real offset.
  const naive = Date.UTC(year, month - 1, day, hour, minute);

  // Collect every offset the zone used around that day. Normally
  // there is one; on a summer-time change day there are two.
  const offsets = new Set();
  for (const hours of [-36, -12, 0, 12, 36]) {
    offsets.add(offsetMinutesAt(naive + hours * 3600000, timeZone));
  }

  // An offset is valid if, applying it, the clock really reads the
  // time the user typed.
  const options = [];
  for (const offsetMinutes of offsets) {
    const utcMs = naive - offsetMinutes * 60000;
    if (offsetMinutesAt(utcMs, timeZone) === offsetMinutes) {
      options.push({ utc: new Date(utcMs), offsetMinutes });
    }
  }
  options.sort((a, b) => a.utc - b.utc);

  if (options.length === 0) return { status: 'nonexistent' };
  if (options.length > 1) return { status: 'ambiguous', options };
  return { status: 'ok', ...options[0] };
}

// 120 → "UTC+2", -630 → "UTC−10:30"
export function formatOffset(offsetMinutes) {
  const sign = offsetMinutes >= 0 ? '+' : '−';
  const abs = Math.abs(offsetMinutes);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  return `UTC${sign}${h}${m ? ':' + String(m).padStart(2, '0') : ''}`;
}
