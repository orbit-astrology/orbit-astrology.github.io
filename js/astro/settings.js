// settings.js
// ---------------------------------------------------------------
// Every astrological choice ORBIT makes lives in this one file.
// The calculation, the chart drawing and the texts all read from
// here, so they can never disagree with each other.
// If anything here changes, bump SETTINGS.version: saved charts
// with an older version number will then be recalculated.
// ---------------------------------------------------------------

export const SETTINGS = {
  version: 1,
  engine: 'Astronomy Engine 2.1.19',
  zodiac: 'tropical',      // signs are measured from the spring equinox
  houseSystem: 'placidus', // the most common house system in Western astrology
  // Dates we have tested. Outside this range we show a message
  // instead of a chart we can't vouch for.
  minYear: 1900,
  maxYear: 2100,
};

// The ten bodies discussed in the plan, in traditional order.
export const BODIES = [
  'Sun', 'Moon', 'Mercury', 'Venus', 'Mars',
  'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto',
];

export const SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

// The five major aspects. "angle" is the exact angle between two
// planets; "orb" is how far from exact it can be and still count.
// natalOrb is for one chart; synastryOrb is tighter, for comparing
// two people's charts in Connections.
export const ASPECTS = [
  { id: 'conjunction', name: 'Conjunction', angle: 0,   natalOrb: 8, synastryOrb: 6 },
  { id: 'sextile',     name: 'Sextile',     angle: 60,  natalOrb: 5, synastryOrb: 4 },
  { id: 'square',      name: 'Square',      angle: 90,  natalOrb: 7, synastryOrb: 5 },
  { id: 'trine',       name: 'Trine',       angle: 120, natalOrb: 7, synastryOrb: 5 },
  { id: 'opposition',  name: 'Opposition',  angle: 180, natalOrb: 8, synastryOrb: 6 },
];
