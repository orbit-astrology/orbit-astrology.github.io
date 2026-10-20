// sky.js
// ---------------------------------------------------------------
// The sky RIGHT NOW, and what happens in it THIS WEEK.
//
// A "week" is Monday 00:00 to the next Monday 00:00 in the
// visitor's own time zone. We look at the planets every 3 hours
// through the week and notice three kinds of events:
//   - ingress:  a planet moves into a new sign
//   - station:  a planet turns retrograde (or forward again)
//   - transit:  a planet makes an exact-ish angle (within 1°) to
//               your own Sun, Moon or Rising sign
// The Moon is left out: it changes sign every 2–3 days, so it
// would fill the week with small events.
// ---------------------------------------------------------------

import { positionsAt } from './chart.js?v=202610201505';
import { findAspects, aspectBetween } from './aspects.js?v=202610201505';
import { houseOf } from './houses.js?v=202610201505';

const HOUR = 3600000;
const MOVERS = ['sun', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];
const TRANSITING = ['sun', 'mercury', 'venus', 'mars', 'jupiter', 'saturn'];

// The planets at one moment, in the same shape as a birth chart,
// so the same wheel drawing can show it.
export function skyAt(date) {
  const bodies = positionsAt(date);
  return { bodies, aspects: findAspects(bodies), angles: null, houses: null, timeKnown: true };
}

export function weekRange(now = new Date()) {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const daysSinceMonday = (start.getDay() + 6) % 7; // Monday = 0
  start.setDate(start.getDate() - daysSinceMonday);
  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  return { start, end };
}

// Your natal points that this week's planets can "touch".
function natalTargets(chart) {
  const targets = [];
  const sun = chart.bodies.find((b) => b.id === 'sun');
  const moon = chart.bodies.find((b) => b.id === 'moon');
  targets.push({ id: 'sun', longitude: sun.longitude });
  if (chart.timeKnown || !moon.uncertain) targets.push({ id: 'moon', longitude: moon.longitude });
  // The Rising sign only counts with an exact time: it moves about 1° every 4 minutes.
  if (chart.angles && !chart.timeMargin) targets.push({ id: 'rising', longitude: chart.angles.ascendant.longitude });
  return targets;
}

export function weeklyEvents(chart, now = new Date()) {
  const { start, end } = weekRange(now);
  const events = [];

  // 1 & 2. Ingresses and stations: compare each sample with the one before.
  let previous = positionsAt(start);
  for (let t = start.getTime() + 3 * HOUR; t <= end.getTime(); t += 3 * HOUR) {
    const date = new Date(t);
    const current = positionsAt(date);
    current.forEach((body, i) => {
      if (!MOVERS.includes(body.id)) return;
      const before = previous[i];
      if (body.sign !== before.sign) {
        events.push({ type: 'ingress', body: body.id, sign: body.sign, longitude: body.longitude, date });
      }
      if (body.id !== 'sun' && Math.sign(body.speed) !== Math.sign(before.speed)) {
        events.push({ type: 'station', body: body.id, retrograde: body.speed < 0, date });
      }
    });
    previous = current;
  }

  // 3. Transits to your Sun, Moon and Rising: check each day at noon
  // and keep the day each angle is closest to exact.
  const best = new Map();
  for (let day = 0; day < 7; day++) {
    const date = new Date(start.getTime() + day * 24 * HOUR + 12 * HOUR);
    const sky = positionsAt(date);
    for (const body of sky) {
      if (!TRANSITING.includes(body.id)) continue;
      for (const target of natalTargets(chart)) {
        const aspect = aspectBetween(body.longitude, target.longitude);
        if (!aspect || aspect.orb > 1) continue;
        const key = `${body.id}-${aspect.type}-${target.id}`;
        if (!best.has(key) || aspect.orb < best.get(key).orb) {
          best.set(key, { type: 'transit', body: body.id, target: target.id, aspect: aspect.type, orb: aspect.orb, date });
        }
      }
    }
  }
  events.push(...best.values());

  // Add the house each new sign position falls in (only with an exact birth time).
  for (const e of events) {
    if (e.type === 'ingress' && chart.houses && !chart.timeMargin) e.house = houseOf(e.longitude, chart.houses.map((h) => h.longitude));
  }

  // Choose up to three: rare events first (stations), then personal
  // transits (closest first), then planets changing sign.
  const rank = (e) => (e.type === 'station' ? 0 : e.type === 'transit' ? 1 + e.orb : 3);
  const chosen = events.sort((a, b) => rank(a) - rank(b)).slice(0, 3);
  return { start, end, events: chosen.sort((a, b) => a.date - b.date) };
}
