// houses.js
// ---------------------------------------------------------------
// The Ascendant, Midheaven and the twelve Placidus house cusps.
//
// Three inputs are needed:
//   ramc – how far the sky has turned overhead at the birthplace
//          (local sidereal time, in degrees)
//   eps  – the tilt of Earth's axis (obliquity, about 23.44°)
//   lat  – birthplace latitude (north positive, south negative)
//
// Midheaven (MC): the point of the zodiac highest in the sky,
//   on the meridian.
// Ascendant (ASC): the point of the zodiac rising on the eastern
//   horizon.
// Placidus divides the time each point of the zodiac takes to
//   travel from the horizon to the meridian into three equal parts;
//   those divisions are cusps 11, 12, 2 and 3. The rest are opposite
//   points (cusp 5 is opposite 11, and so on).
// ---------------------------------------------------------------

import { normalize } from './zodiac.js?v=202610111932';

const rad = (d) => (d * Math.PI) / 180;
const deg = (r) => (r * 180) / Math.PI;

// Convert a right ascension (position along the equator) into the
// point of the zodiac with that right ascension.
function raToLongitude(ra, eps) {
  return normalize(deg(Math.atan2(Math.sin(rad(ra)), Math.cos(rad(ra)) * Math.cos(rad(eps)))));
}

// How far north or south of the equator a zodiac point is.
function declination(longitude, eps) {
  return deg(Math.asin(Math.sin(rad(eps)) * Math.sin(rad(longitude))));
}

export function midheaven(ramc, eps) {
  return raToLongitude(ramc, eps);
}

export function ascendant(ramc, eps, lat) {
  return normalize(deg(Math.atan2(
    Math.cos(rad(ramc)),
    -(Math.sin(rad(ramc)) * Math.cos(rad(eps)) + Math.tan(rad(lat)) * Math.sin(rad(eps))),
  )));
}

// Solve for one intermediate Placidus cusp by repeating a guess
// until it stops changing. `targetRa` returns the right ascension
// the cusp must have, given the semi-arc of the current guess.
function solveCusp(start, eps, lat, targetRa) {
  let lon = start;
  for (let i = 0; i < 100; i++) {
    const x = -Math.tan(rad(lat)) * Math.tan(rad(declination(lon, eps)));
    if (Math.abs(x) > 1) return null; // this point never rises or never sets here
    const diurnalSemiArc = deg(Math.acos(x)); // time above the horizon, horizon→meridian
    const next = raToLongitude(targetRa(diurnalSemiArc), eps);
    const change = Math.abs(normalize(next - lon + 180) - 180);
    lon = next;
    if (change < 1e-9) return lon;
  }
  return null;
}

/**
 * Returns { ascendant, midheaven, cusps: [12 longitudes] }
 * or { error: 'placidus-undefined' } near the polar circles, where
 * some zodiac points never rise and Placidus can't be calculated.
 * We show that limitation instead of silently switching systems.
 */
export function placidusHouses(ramc, eps, lat) {
  const asc = ascendant(ramc, eps, lat);
  const mc = midheaven(ramc, eps);

  // Cusps 11 and 12 sit between the Midheaven and the Ascendant,
  // one and two thirds of the way along the day-time semi-arc.
  const c11 = solveCusp(mc + 30, eps, lat, (dsa) => ramc + dsa / 3);
  const c12 = solveCusp(mc + 60, eps, lat, (dsa) => ramc + (2 * dsa) / 3);
  // Cusps 2 and 3 sit between the Ascendant and the bottom of the
  // chart (IC), along the night-time semi-arc (180° − day-time arc).
  const c2 = solveCusp(asc + 30, eps, lat, (dsa) => ramc + 180 - (2 * (180 - dsa)) / 3);
  const c3 = solveCusp(asc + 60, eps, lat, (dsa) => ramc + 180 - (180 - dsa) / 3);

  if ([c11, c12, c2, c3].includes(null)) {
    return { ascendant: asc, midheaven: mc, error: 'placidus-undefined' };
  }

  const cusps = [asc, c2, c3, mc + 180, c11 + 180, c12 + 180,
    asc + 180, c2 + 180, c3 + 180, mc, c11, c12].map(normalize);
  return { ascendant: asc, midheaven: mc, cusps };
}

// Which house (1–12) a longitude falls in, given the 12 cusps.
export function houseOf(longitude, cusps) {
  for (let i = 0; i < 12; i++) {
    const start = cusps[i];
    const end = cusps[(i + 1) % 12];
    const width = normalize(end - start);
    if (normalize(longitude - start) < width) return i + 1;
  }
  return null;
}
