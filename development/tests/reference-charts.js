// reference-charts.js
// ---------------------------------------------------------------
// Published charts we compare ORBIT against. Positions are copied
// from Astrotheme (astrotheme.com, tropical zodiac, Placidus),
// which, like most sites, cuts minutes off rather than rounding.
//
// These are public figures with published birth data, so no
// private information is stored in this public repository.
// ---------------------------------------------------------------

export const REFERENCE_CHARTS = [
  {
    name: 'Barack Obama',
    note: 'Hawaii, 1961 – a time zone 10 hours behind UTC',
    source: 'https://www.astrotheme.com/astrology/Barack_Obama',
    birth: {
      year: 1961, month: 8, day: 4, hour: 19, minute: 24, timeKnown: true,
      place: { label: 'Honolulu, Hawaii, United States', latitude: 21.3069, longitude: -157.8583, timeZone: 'Pacific/Honolulu' },
    },
    expectedUtc: '1961-08-05T05:24:00.000Z',
    expected: {
      sun: "12°33' Leo", moon: "3°21' Gemini", mercury: "2°20' Leo", venus: "1°47' Cancer",
      mars: "22°35' Virgo", jupiter: "0°52' Aquarius", saturn: "25°20' Capricorn",
      uranus: "25°16' Leo", neptune: "8°36' Scorpio", pluto: "6°59' Virgo",
      ascendant: "18°03' Aquarius", midheaven: "28°53' Scorpio",
    },
    // Placidus cusps 1–12, from a second site:
    // https://www.astro-charts.com/persons/chart/barack-obama/
    expectedHouses: [
      "18°03' Aquarius", "25°54' Pisces", "0°18' Taurus", "28°54' Taurus",
      "23°59' Gemini", "19°01' Cancer", "18°03' Leo", "25°54' Virgo",
      "0°18' Scorpio", "28°54' Scorpio", "23°59' Sagittarius", "19°01' Capricorn",
    ],
  },
  {
    name: 'Rafael Nadal',
    note: 'Spain, 1986 – summer time (UTC+2)',
    source: 'https://www.astrotheme.com/astrology/Rafael_Nadal',
    birth: {
      year: 1986, month: 6, day: 3, hour: 18, minute: 20, timeKnown: true,
      place: { label: 'Manacor, Balearic Islands, Spain', latitude: 39.5696, longitude: 3.2096, timeZone: 'Europe/Madrid' },
    },
    expectedUtc: '1986-06-03T16:20:00.000Z',
    expected: {
      sun: "12°47' Gemini", moon: "0°17' Taurus", mercury: "26°19' Gemini", venus: "15°40' Cancer",
      mars: "22°56' Capricorn", jupiter: "20°30' Pisces", saturn: "5°55' Sagittarius",
      uranus: "20°42' Sagittarius", neptune: "5°01' Capricorn", pluto: "5°00' Scorpio",
      ascendant: "9°51' Scorpio", midheaven: "17°35' Leo",
    },
    expectedRetrograde: ['saturn', 'uranus', 'neptune', 'pluto'],
  },
  {
    name: 'Sebastian Vettel (time unknown, compared at noon)',
    note: 'Germany, 1987 – the Moon is at 0° Libra, right on a sign boundary',
    source: 'https://www.astrotheme.com/astrology/Sebastian_Vettel',
    birth: {
      year: 1987, month: 7, day: 3, hour: 12, minute: 0, timeKnown: true,
      place: { label: 'Heppenheim, Hesse, Germany', latitude: 49.6415, longitude: 8.6385, timeZone: 'Europe/Berlin' },
    },
    expectedUtc: '1987-07-03T10:00:00.000Z',
    expected: {
      sun: "10°58' Cancer", moon: "0°03' Libra", mercury: "12°08' Cancer", venus: "27°03' Gemini",
      mars: "27°54' Cancer", jupiter: "26°16' Aries", saturn: "16°10' Sagittarius",
      uranus: "24°03' Sagittarius", neptune: "6°30' Capricorn", pluto: "7°13' Scorpio",
    },
    expectedRetrograde: ['mercury', 'saturn', 'uranus', 'neptune', 'pluto'],
  },
  {
    name: 'Hugh Jackman (time unknown, compared at noon)',
    note: 'Australia, 1968 – southern hemisphere',
    source: 'https://www.astrotheme.com/astrology/Hugh_Jackman',
    birth: {
      year: 1968, month: 10, day: 12, hour: 12, minute: 0, timeKnown: true,
      place: { label: 'Sydney, New South Wales, Australia', latitude: -33.8679, longitude: 151.2073, timeZone: 'Australia/Sydney' },
    },
    expectedUtc: '1968-10-12T02:00:00.000Z',
    expected: {
      sun: "18°48' Libra", moon: "20°55' Gemini", mercury: "26°32' Libra", venus: "18°50' Scorpio",
      mars: "12°41' Virgo", jupiter: "23°26' Virgo", saturn: "22°21' Aries",
      uranus: "0°50' Libra", neptune: "24°56' Scorpio", pluto: "23°37' Virgo",
    },
  },
];

// The sky at one moment, not a person: checks the "current sky"
// (Your Sky This Week) calculation. Astrotheme, 28 Sep 2026, 21:57 UT.
export const REFERENCE_SKY = {
  utc: '2026-09-28T21:57:00Z',
  expected: {
    sun: "5°47' Libra", moon: "4°16' Taurus", mercury: "27°52' Libra", venus: "8°08' Scorpio",
    mars: "0°28' Leo", jupiter: "19°13' Leo", saturn: "11°44' Aries",
    uranus: "5°34' Gemini", neptune: "2°55' Aries", pluto: "3°08' Aquarius",
  },
};

// Time-zone traps the birth-time conversion must handle.
export const TIME_CASES = [
  { label: 'Spain, clocks go forward (2:30 never happened)', local: { year: 2026, month: 3, day: 29, hour: 2, minute: 30 }, timeZone: 'Europe/Madrid', expect: 'nonexistent' },
  { label: 'Spain, clocks go back (2:30 happened twice)', local: { year: 2026, month: 10, day: 25, hour: 2, minute: 30 }, timeZone: 'Europe/Madrid', expect: 'ambiguous' },
  { label: 'Spain, summer 1986', local: { year: 1986, month: 6, day: 3, hour: 18, minute: 20 }, timeZone: 'Europe/Madrid', expect: '1986-06-03T16:20:00.000Z' },
  { label: 'Hawaii, 1961 (date changes in UTC)', local: { year: 1961, month: 8, day: 4, hour: 19, minute: 24 }, timeZone: 'Pacific/Honolulu', expect: '1961-08-05T05:24:00.000Z' },
  { label: 'India, half-hour time zone', local: { year: 2000, month: 1, day: 1, hour: 12, minute: 0 }, timeZone: 'Asia/Kolkata', expect: '2000-01-01T06:30:00.000Z' },
];

// "12°33' Leo" → 132.55
const SIGN_NAMES = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
export function parsePosition(text) {
  const m = text.match(/(\d+)°(\d+)'\s+(\w+)/);
  return SIGN_NAMES.indexOf(m[3]) * 30 + Number(m[1]) + Number(m[2]) / 60;
}
