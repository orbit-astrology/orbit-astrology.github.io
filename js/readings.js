// readings.js
// ---------------------------------------------------------------
// Builds the plain-language explanation of each placement from its
// parts, using the "astrology grammar":
//
//   PLANET = what part of you   (Venus = how you love)
//   SIGN   = how it shows up    (Scorpio = intensely, privately)
//   HOUSE  = where in your life (1st house = you and how you come across)
//
// plus the aspects (angles) it makes with your other planets.
// Every sentence is built from the person's real chart data, so two
// different charts always get different readings.
// Used by My Chart now, and by Explore later.
// ---------------------------------------------------------------

import {
  PLANETS, PLANET_DETAIL, SIGNS, SIGN_DETAIL, HOUSES, SLOW_PLANETS,
  ASPECT_TEXT, SUN_IN, MOON_IN, RISING_IN, degreePlace,
} from './content/basics.js?v=202610211856';

export const ORDER = ['sun', 'moon', 'rising', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto', 'midheaven'];

export const ordinal = (n) => n + (n === 1 ? 'st' : n === 2 ? 'nd' : n === 3 ? 'rd' : 'th');

// ['Leo', 'Virgo', 'Libra'] → "Leo, Virgo or Libra"
export const orList = (items) => (items.length > 1 ? `${items.slice(0, -1).join(', ')} or ${items.at(-1)}` : items[0]);

// The Rising sign as text: "Scorpio", "Scorpio or Sagittarius" (approximate
// time), or null when there's no birth time.
export function risingText(chart) {
  if (!chart.angles) return null;
  const asc = chart.angles.ascendant;
  return asc.uncertain ? orList(asc.possibleSigns) : asc.sign;
}

// "give or take 1 hour" for a margin of 60 minutes (approximate time).
export function marginText(minutes) {
  if (!minutes) return '';
  if (minutes < 60) return `give or take ${minutes} minutes`;
  const hours = minutes / 60;
  return `give or take ${hours} hour${hours === 1 ? '' : 's'}`;
}

// A planet's house as text: "3rd house" or "3rd or 4th house".
export function houseText(p) {
  if (!p.house) return null;
  if (!p.houseUncertain) return `${ordinal(p.house)} house`;
  // In number order ("5th or 6th"), but 12th before 1st, since the 1st follows the 12th.
  const list = [...p.possibleHouses].sort((x, y) => x - y);
  if (list.includes(1) && list.includes(12)) list.unshift(list.pop());
  return `${orList(list.map(ordinal))} house`;
}
const nameOf = (id) => id[0].toUpperCase() + id.slice(1);

// "14°" plus where that sits in the sign, e.g. "14° (around the middle of the sign)"
export function degreeText(degree) {
  return `${Math.floor(degree)}° (${degreePlace(degree)})`;
}

// Every placement in the chart, in one simple shape the page can use:
// { id, name, what, sign, degree, house, retrograde, uncertain, … }
export function placements(chart) {
  const list = [];
  for (const id of ORDER) {
    if (id === 'rising' || id === 'midheaven') {
      if (!chart.angles) continue;
      const point = id === 'rising' ? chart.angles.ascendant : chart.angles.midheaven;
      list.push({
        id, kind: 'angle',
        name: id === 'rising' ? 'Rising sign' : 'Midheaven',
        short: id === 'rising' ? 'Rising' : 'Midheaven',
        what: id === 'rising' ? 'how you come across' : 'your direction in life',
        sign: point.sign, degree: point.degree, longitude: point.longitude,
        house: id === 'rising' ? 1 : 10,
        uncertain: Boolean(point.uncertain), possibleSigns: point.possibleSigns ?? [point.sign],
      });
      continue;
    }
    const b = chart.bodies.find((x) => x.id === id);
    list.push({
      id, kind: 'planet', name: b.name, short: b.name, what: PLANETS[id].what,
      symbol: PLANETS[id].symbol, sign: b.sign, degree: b.degree, longitude: b.longitude,
      house: b.house ?? null, retrograde: b.retrograde,
      uncertain: Boolean(b.uncertain), possibleSigns: b.possibleSigns ?? [b.sign],
      approximate: Boolean(b.approximate),
      houseUncertain: Boolean(b.houseUncertain), possibleHouses: b.possibleHouses ?? (b.house ? [b.house] : []),
    });
  }
  return list;
}

// The aspects one planet makes, as readable sentences.
export function connections(chart, id) {
  return chart.aspects
    .filter((a) => a.from === id || a.to === id)
    .map((a) => {
      const other = a.from === id ? a.to : a.from;
      const t = ASPECT_TEXT[a.type];
      return {
        id: a.id, type: a.type, other, uncertain: Boolean(a.uncertain),
        title: `${nameOf(id)} ${t.name} ${nameOf(other)}`,
        text: `Your ${nameOf(id)} (${PLANETS[id].what}) and your ${nameOf(other)} (${PLANETS[other].what}) are ${t.plain} (${t.angle}°): ${t.meaning}.`,
      };
    });
}

// The main paragraph(s) for one placement.
export function reading(chart, p) {
  const parts = [];

  if (p.kind === 'angle' && p.uncertain) {
    // Approximate birth time: say honestly which signs it could be.
    const what = p.id === 'rising' ? 'Rising sign' : 'Midheaven';
    parts.push(`Your birth time is approximate, and your ${what} moves into a new sign within that time window, so it could be ${orList(p.possibleSigns)}.`);
    if (p.id === 'rising') {
      for (const sign of p.possibleSigns) parts.push(`If it’s ${sign}: ${RISING_IN[sign]}`);
      parts.push('Your Rising sign is the sign that was coming up over the eastern horizon when you were born: the first impression you give. If you can find your exact birth time (it’s often on your birth certificate), ORBIT can tell you which one it is.');
    } else {
      parts.push('Your Midheaven was the highest point of the sky when you were born, linked to your direction in life. ' + p.possibleSigns.map((sign) => `If it’s ${sign}, you’re drawn to a path you can follow ${SIGNS[sign].how}.`).join(' '));
    }
    return parts;
  }

  if (p.id === 'rising') {
    parts.push(RISING_IN[p.sign]);
    parts.push(`Your Rising sign is the sign that was coming up over the eastern horizon at the moment you were born. It’s like the front door of your chart: the first impression you give, and the style you use to meet new situations. ${SIGN_DETAIL[p.sign]} So you tend to meet the world ${SIGNS[p.sign].how}.`);
    parts.push('It also decides where your 12 houses start, which is why it needs an exact birth time.');
    return parts;
  }

  if (p.id === 'midheaven') {
    parts.push(`Your Midheaven (MC) was the highest point of the sky when you were born. In astrology it’s linked to your direction in life: your ambitions, your career and how you’d like the world to see you. ${SIGN_DETAIL[p.sign]} So you’re drawn to a path you can follow ${SIGNS[p.sign].how}.`);
    return parts;
  }

  if (p.uncertain) {
    const when = chart.timeKnown ? 'within your approximate birth time' : 'on the day you were born, so without your birth time';
    parts.push(`${PLANET_DETAIL[p.id]} Your ${p.name} changed sign ${when}, so it could be in ${orList(p.possibleSigns)}.`);
    parts.push(p.possibleSigns.map((sign) => `If it’s ${sign}: you’d tend to show this side of you ${SIGNS[sign].how}.`).join(' '));
    return parts;
  }

  if (p.id === 'sun') parts.push(SUN_IN[p.sign]);
  if (p.id === 'moon') parts.push(MOON_IN[p.sign]);

  parts.push(`${PLANET_DETAIL[p.id]} ${SIGN_DETAIL[p.sign]} So your ${p.name} works ${SIGNS[p.sign].how}.`);

  if (p.house && p.houseUncertain) {
    parts.push(`Your birth time is approximate, so it could sit in your ${houseText(p)}: ${p.possibleHouses.map((h) => `the ${ordinal(h)} is about ${HOUSES[h]}`).join('; ')}. That’s where this part of you tends to show up most.`);
  } else if (p.house) {
    parts.push(`It sits in your ${ordinal(p.house)} house, the area of ${HOUSES[p.house]}. That’s where this part of you tends to show up most.`);
  }
  if (SLOW_PLANETS.includes(p.id)) {
    parts.push(`${p.name} moves slowly, so everyone born within a few years of you shares this sign.${p.house ? ' The house it’s in is the more personal part.' : ''}`);
  }
  if (p.retrograde) {
    parts.push(`${p.name} was retrograde when you were born (it looked like it was moving backwards from Earth). Traditionally this turns its energy more inward and reflective.`);
  }
  return parts;
}

// The "planet = what, sign = how, house = where" sentence, as pieces
// the page can underline. Each piece: { text, role } where role is
// 'what', 'how', 'where' or plain.
export function grammar(p) {
  if (p.kind === 'angle' || p.uncertain) return null;
  const pieces = [
    { text: 'Your ' }, { text: p.name, role: 'what', note: p.what },
    { text: ' in ' }, { text: p.sign, role: 'how', note: SIGNS[p.sign].how },
  ];
  if (p.house && !p.houseUncertain) pieces.push({ text: ' in your ' }, { text: `${ordinal(p.house)} house`, role: 'where', note: HOUSES[p.house] });
  return pieces;
}
