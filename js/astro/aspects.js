// aspects.js
// ---------------------------------------------------------------
// An aspect is a meaningful angle between two planets: 0°, 60°,
// 90°, 120° or 180°, give or take an "orb" (see settings.js).
// ---------------------------------------------------------------

import { ASPECTS } from './settings.js?v=202610111804';
import { separation } from './zodiac.js?v=202610111804';

// Which aspect, if any, two longitudes make. Returns the closest
// matching aspect, or null.
export function aspectBetween(lonA, lonB, orbKey = 'natalOrb') {
  const sep = separation(lonA, lonB);
  let best = null;
  for (const aspect of ASPECTS) {
    const orb = Math.abs(sep - aspect.angle);
    if (orb <= aspect[orbKey] && (!best || orb < best.orb)) {
      best = { type: aspect.id, name: aspect.name, angle: aspect.angle, separation: sep, orb };
    }
  }
  return best;
}

// All aspects within one set of points: [{ id, name, longitude }, …]
export function findAspects(points, orbKey = 'natalOrb') {
  const found = [];
  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      const a = points[i];
      const b = points[j];
      const aspect = aspectBetween(a.longitude, b.longitude, orbKey);
      if (aspect) found.push({ id: `${a.id}-${aspect.type}-${b.id}`, from: a.id, to: b.id, ...aspect });
    }
  }
  return found.sort((x, y) => x.orb - y.orb); // tightest (strongest) first
}

// Aspects between two different charts (for Connections).
export function findCrossAspects(pointsA, pointsB, orbKey = 'synastryOrb') {
  const found = [];
  for (const a of pointsA) {
    for (const b of pointsB) {
      const aspect = aspectBetween(a.longitude, b.longitude, orbKey);
      if (aspect) found.push({ id: `${a.id}-${aspect.type}-${b.id}`, from: a.id, to: b.id, ...aspect });
    }
  }
  return found.sort((x, y) => x.orb - y.orb);
}
