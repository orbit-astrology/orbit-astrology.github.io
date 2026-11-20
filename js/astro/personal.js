// personal.js
// ---------------------------------------------------------------
// Three things about YOUR chart, shown on Explore:
//
//   1. elementBalance: how many of your ten planets are in Fire,
//      Earth, Air and Water signs.
//   2. birthMoonPhase: the shape of the Moon on the day you were born
//      (new, crescent, full...), from the angle between Sun and Moon.
//   3. lifeMoments: real dates when slow planets come back to where
//      they were when you were born (for example your Saturn return).
//
// Everything is calculated from your chart (js/astro/chart.js) and
// the real planet positions. Nothing is made up.
// ---------------------------------------------------------------

import { bodyLongitude, positionsAt } from './chart.js?v=202611201706';
import { normalize } from './zodiac.js?v=202611201706';

// --- 1. Elements --------------------------------------------------

// Each sign belongs to one of four elements.
export const ELEMENT_OF = {
  Aries: 'Fire', Leo: 'Fire', Sagittarius: 'Fire',
  Taurus: 'Earth', Virgo: 'Earth', Capricorn: 'Earth',
  Gemini: 'Air', Libra: 'Air', Aquarius: 'Air',
  Cancer: 'Water', Scorpio: 'Water', Pisces: 'Water',
};

// Returns { Fire: [planets], Earth: [...], Air: [...], Water: [...], unsure: [...] }.
// A planet whose sign isn't certain (it changed sign on your birthday
// and we don't know your birth time) only counts if every possible
// sign has the same element. Otherwise it goes in "unsure".
export function elementBalance(chart) {
  const result = { Fire: [], Earth: [], Air: [], Water: [], unsure: [] };
  for (const body of chart.bodies) {
    const signs = body.uncertain ? body.possibleSigns : [body.sign];
    const elements = [...new Set(signs.map((s) => ELEMENT_OF[s]))];
    if (elements.length === 1) result[elements[0]].push(body);
    else result.unsure.push(body);
  }
  return result;
}

// --- 2. The Moon's phase ------------------------------------------

// The eight phases, each covering 45° of the Moon's distance ahead of
// the Sun (0° = New Moon, 180° = Full Moon).
export const PHASES = [
  'New Moon', 'Waxing crescent', 'First quarter', 'Waxing gibbous',
  'Full Moon', 'Waning gibbous', 'Last quarter', 'Waning crescent',
];

const phaseOf = (angle) => PHASES[Math.floor(normalize(angle + 22.5) / 45) % 8];
const angleAt = (sun, moon) => normalize(moon - sun);

// Returns { angle, phases, lit }:
//   angle  how far the Moon was ahead of the Sun (0–360°)
//   phases the phase name, or two names if it changed during your
//          birthday and we don't know your birth time
//   lit    how much of the Moon was lit, from 0 (new) to 1 (full)
export function birthMoonPhase(chart) {
  const sun = chart.bodies.find((b) => b.id === 'sun');
  const moon = chart.bodies.find((b) => b.id === 'moon');
  const angle = angleAt(sun.longitude, moon.longitude);
  const phases = [phaseOf(angle)];
  if (chart.utcRange) {
    // Unknown or approximate time: check the start and end of the window.
    for (const moment of chart.utcRange) {
      const p = positionsAt(new Date(moment));
      const name = phaseOf(angleAt(p[0].longitude, p[1].longitude));
      if (!phases.includes(name)) phases.push(name);
    }
  }
  const lit = (1 - Math.cos((angle * Math.PI) / 180)) / 2;
  return { angle, phases, lit };
}

// --- 3. Big life moments ------------------------------------------

const DAY = 86400000;
const YEAR = 365.25 * DAY;

// The moments we look for: a planet back at the same spot as at your
// birth ("return", 0°), or exactly opposite it ("opposition", 180°).
export const MOMENTS = [
  // skip: years to wait before looking (just after birth a slow planet
  // can wobble back over its own spot, which isn't a real return).
  { id: 'jupiter-return', body: 'Jupiter', offset: 0, step: 3, skip: 6 },
  { id: 'saturn-return', body: 'Saturn', offset: 0, step: 5, skip: 15 },
  { id: 'uranus-opposition', body: 'Uranus', offset: 180, step: 5, skip: 20 },
];

// How far a planet is from a target point, between −180° and +180°.
const distance = (lon, target) => normalize(lon - target + 180) - 180;

// Every date when `body` is exactly at `target`, between two dates.
// We step through time a few days at a time and notice when the
// distance changes from minus to plus (or back), then narrow it down
// to the exact day. A planet can cross the same point up to three
// times, because it sometimes seems to move backwards (retrograde).
function crossings(body, target, from, to, stepDays) {
  const hits = [];
  let t = from;
  let d = distance(bodyLongitude(body, new Date(t)), target);
  while (t < to) {
    const t2 = t + stepDays * DAY;
    const d2 = distance(bodyLongitude(body, new Date(t2)), target);
    // A real crossing: the sign changes and both are close to 0°
    // (not the jump from +180° to −180° on the far side).
    if (Math.sign(d) !== Math.sign(d2) && Math.abs(d - d2) < 30) {
      let a = t;
      let b = t2;
      let da = d;
      while (b - a > DAY / 4) {
        const mid = (a + b) / 2;
        const dm = distance(bodyLongitude(body, new Date(mid)), target);
        if (Math.sign(dm) === Math.sign(da)) { a = mid; da = dm; } else { b = mid; }
      }
      hits.push(new Date((a + b) / 2));
    }
    t = t2;
    d = d2;
  }
  return hits;
}

// Returns a list of moments, in date order, up to age 90:
//   { id, body, number, start, end, ageStart, ageEnd }
// "number" counts them (1st Jupiter return, 2nd...). "start" and
// "end" are the first and last exact dates of that pass.
export function lifeMoments(chart, untilAge = 90) {
  const born = new Date(chart.utc).getTime();
  const to = born + untilAge * YEAR;
  const all = [];
  for (const m of MOMENTS) {
    const natal = chart.bodies.find((b) => b.name === m.body).longitude;
    const hits = crossings(m.body, normalize(natal + m.offset), born + m.skip * YEAR, to, m.step);
    // Hits less than a year apart belong to the same pass.
    const passes = [];
    for (const hit of hits) {
      const last = passes.at(-1);
      if (last && hit - last.at(-1) < YEAR) last.push(hit);
      else passes.push([hit]);
    }
    passes.forEach((pass, i) => {
      const start = pass[0];
      const end = pass.at(-1);
      all.push({
        id: m.id, body: m.body, number: i + 1, start, end,
        ageStart: Math.floor((start - born) / YEAR),
        ageEnd: Math.floor((end - born) / YEAR),
      });
    });
  }
  return all.sort((a, b) => a.start - b.start);
}
