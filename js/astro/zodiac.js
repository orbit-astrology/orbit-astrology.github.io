// zodiac.js
// ---------------------------------------------------------------
// Small helpers for turning a longitude (0–360°) into a sign and a
// readable degree. 0° is the start of Aries, 30° the start of
// Taurus, and so on, 30° per sign.
// ---------------------------------------------------------------

import { SIGNS } from './settings.js?v=202610291947';

// Keep any angle inside 0 ≤ x < 360.
export function normalize(degrees) {
  return ((degrees % 360) + 360) % 360;
}

// The shorter angle between two longitudes on the circle (0–180°).
// Example: 350° and 10° are 20° apart, not 340°.
export function separation(a, b) {
  const d = Math.abs(normalize(a - b));
  return d > 180 ? 360 - d : d;
}

// 132.55 → { sign: 'Leo', signIndex: 4, degree: 12.55 }
export function signOf(longitude) {
  const lon = normalize(longitude);
  const signIndex = Math.floor(lon / 30);
  return { sign: SIGNS[signIndex], signIndex, degree: lon - signIndex * 30 };
}

// 132.55 → "12°33′ Leo". Minutes are rounded down, as astrology
// tables do, so 12°33.9′ still reads 12°33′.
export function formatLongitude(longitude) {
  const { sign, degree } = signOf(longitude);
  const whole = Math.floor(degree);
  const minutes = Math.floor((degree - whole) * 60);
  return `${whole}°${String(minutes).padStart(2, '0')}′ ${sign}`;
}
