// chart.js
// ---------------------------------------------------------------
// The heart of ORBIT: birth details in, one normalized chart out.
//
//   birth details → exact UTC moment → planet positions
//                 → houses & angles (only if birth time is known)
//                 → aspects
//
// Everything else in the site (wheel, list, readings) reads the
// object this file returns, so they always show the same data.
// ---------------------------------------------------------------

import * as Astronomy from '../vendor/astronomy.js?v=202610111920';
import { SETTINGS, BODIES } from './settings.js?v=202610111920';
import { normalize, signOf } from './zodiac.js?v=202610111920';
import { localToUtc, isRealDate } from './time.js?v=202610111920';
import { placidusHouses, houseOf } from './houses.js?v=202610111920';
import { findAspects } from './aspects.js?v=202610111920';

// --- 1. Raw astronomy ------------------------------------------

// Where a body appears along the zodiac, as seen from Earth, at a
// moment. "Tropical" longitude = measured along the ecliptic of
// that date from the spring equinox point (0° Aries).
export function bodyLongitude(body, date) {
  const vector = Astronomy.GeoVector(body, date, true); // true = as we actually see it (light-time corrected)
  return Astronomy.Ecliptic(vector).elon;
}

// Degrees per day. Negative means the planet looks like it moves
// backwards from Earth: retrograde.
function bodySpeed(body, date) {
  const halfDay = 12 * 3600000;
  const before = bodyLongitude(body, new Date(date.getTime() - halfDay));
  const after = bodyLongitude(body, new Date(date.getTime() + halfDay));
  return normalize(after - before + 180) - 180;
}

export function positionsAt(date) {
  return BODIES.map((body) => {
    const longitude = bodyLongitude(body, date);
    const speed = bodySpeed(body, date);
    return {
      id: body.toLowerCase(),
      name: body,
      longitude,
      ...signOf(longitude),
      speed,
      retrograde: body !== 'Sun' && body !== 'Moon' && speed < 0,
    };
  });
}

// Houses need the local sidereal time and Earth's tilt at that moment.
export function housesAt(date, latitude, longitude) {
  const time = Astronomy.MakeTime(date);
  const siderealHours = Astronomy.SiderealTime(time); // Greenwich apparent sidereal time
  const ramc = normalize(siderealHours * 15 + longitude); // turn it into degrees, then shift to the birthplace
  const obliquity = Astronomy.e_tilt(time).tobl;         // Earth's true tilt on that date
  return { ...placidusHouses(ramc, obliquity, latitude), ramc, obliquity, siderealHours };
}

// --- 2. Validation & time --------------------------------------

function fail(code, message) {
  return { status: 'error', code, message };
}

// Convert a local time, nudging forward if that time didn't exist
// (only used for the start/end of an unknown-time day).
function dayEdgeToUtc(parts, timeZone, edge) {
  for (let shift = 0; shift <= 120; shift += 30) {
    const minute = edge === 'start' ? parts.minute + shift : parts.minute - shift;
    const result = localToUtc({ ...parts, minute }, timeZone);
    if (result.status === 'ok') return result;
    if (result.status === 'ambiguous') {
      return edge === 'start' ? result.options[0] : result.options[result.options.length - 1];
    }
  }
  return null;
}

/**
 * birth = {
 *   year, month, day,
 *   timeKnown: true|false, hour, minute,      // hour/minute ignored if timeKnown is false
 *   place: { label, latitude, longitude, timeZone },
 *   offsetMinutes   // optional: chosen when the local time was ambiguous
 * }
 *
 * Returns { status: 'ok', chart } or { status: 'error', code, message }
 * or { status: 'ambiguous', options } (ask the user which one).
 */
export function calculateChart(birth, { now = new Date() } = {}) {
  const { year, month, day, timeKnown, place } = birth;

  if (!place || typeof place.latitude !== 'number' || !place.timeZone) {
    return fail('no-place', 'Please choose your birthplace from the suggestions.');
  }
  if (!isRealDate(year, month, day)) {
    return fail('invalid-date', 'That date doesn’t exist. Please check the day and month.');
  }
  if (year < SETTINGS.minYear || year > SETTINGS.maxYear) {
    return fail('out-of-range', `ORBIT can calculate charts for ${SETTINGS.minYear}–${SETTINGS.maxYear}.`);
  }

  let utc;
  let offsetMinutes;
  let utcRange = null;

  if (timeKnown) {
    const result = localToUtc(birth, place.timeZone);
    if (result.status === 'nonexistent') {
      return fail('nonexistent-time',
        'That clock time didn’t exist in this place on that date (the clocks jumped forward). Please check the time.');
    }
    if (result.status === 'ambiguous') {
      const chosen = result.options.find((o) => o.offsetMinutes === birth.offsetMinutes);
      if (!chosen) return { status: 'ambiguous', options: result.options };
      utc = chosen.utc;
      offsetMinutes = chosen.offsetMinutes;
    } else {
      utc = result.utc;
      offsetMinutes = result.offsetMinutes;
    }
  } else {
    // Unknown time: look at the whole local day. Planets are drawn
    // at local noon, but anything that changes sign during the day
    // is marked uncertain.
    const start = dayEdgeToUtc({ year, month, day, hour: 0, minute: 0 }, place.timeZone, 'start');
    const end = dayEdgeToUtc({ year, month, day, hour: 23, minute: 59 }, place.timeZone, 'end');
    const noon = dayEdgeToUtc({ year, month, day, hour: 12, minute: 0 }, place.timeZone, 'start');
    utc = noon.utc;
    offsetMinutes = noon.offsetMinutes;
    utcRange = [start.utc, end.utc];
  }

  if (utc > now) {
    return fail('future-date', 'That birth date is in the future. Please check it.');
  }

  // --- 3. The chart ---------------------------------------------

  const bodies = positionsAt(utc);

  if (!timeKnown) {
    const atStart = positionsAt(utcRange[0]);
    const atEnd = positionsAt(utcRange[1]);
    bodies.forEach((b, i) => {
      const signs = [...new Set([atStart[i].sign, b.sign, atEnd[i].sign])];
      b.approximate = true;            // exact degree depends on the unknown time
      b.uncertain = signs.length > 1;  // even the sign could be different
      b.possibleSigns = signs;
      b.range = [atStart[i].longitude, atEnd[i].longitude];
    });
  }

  let angles = null;
  let houses = null;
  let houseLimitation = timeKnown ? null : 'time-unknown';
  let calculation = null;

  if (timeKnown) {
    const h = housesAt(utc, place.latitude, place.longitude);
    calculation = { siderealHours: h.siderealHours, ramc: h.ramc, obliquity: h.obliquity };
    angles = {
      ascendant: { longitude: h.ascendant, ...signOf(h.ascendant) },
      midheaven: { longitude: h.midheaven, ...signOf(h.midheaven) },
    };
    if (h.error) {
      houseLimitation = h.error;
    } else {
      houses = h.cusps.map((longitude, i) => ({ number: i + 1, longitude, ...signOf(longitude) }));
      for (const b of bodies) b.house = houseOf(b.longitude, h.cusps);
    }
  }

  let aspects = findAspects(bodies);
  if (!timeKnown) {
    // An aspect is only certain if it holds all day long.
    const dayAspects = [positionsAt(utcRange[0]), positionsAt(utcRange[1])]
      .map((pts) => new Set(findAspects(pts).map((a) => a.id)));
    aspects = aspects.map((a) => ({ ...a, uncertain: !dayAspects.every((s) => s.has(a.id)) }));
  }

  return {
    status: 'ok',
    chart: {
      settings: { ...SETTINGS },
      input: structuredClone(birth),
      timeKnown: Boolean(timeKnown),
      utc: utc.toISOString(),
      utcRange: utcRange && utcRange.map((d) => d.toISOString()),
      offsetMinutes,
      bodies,
      angles,
      houses,
      houseLimitation,
      aspects,
      calculation,
    },
  };
}
