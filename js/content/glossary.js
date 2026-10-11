// glossary.js
// ---------------------------------------------------------------
// One plain explanation per astrology word, used by every page so
// a word always means the same thing everywhere on ORBIT.
// (Rules: docs/writing-guide.md)
//
// Status: first draft written with AI. Salma reviews and edits.
// ---------------------------------------------------------------

export const GLOSSARY = {
  'birth-chart': {
    term: 'Birth chart',
    text: 'A map of where the Sun, Moon and planets were in the sky at the exact moment and place you were born. Also called a natal chart or carta astral.',
  },
  sign: {
    term: 'Sign',
    text: 'One of the 12 zodiac signs, from Aries to Pisces. In a chart, a sign describes how something in you shows up.',
  },
  planet: {
    term: 'Planet',
    text: 'In astrology the Sun, the Moon and the planets each stand for a part of you, like your feelings or how you love.',
  },
  house: {
    term: 'House',
    text: 'One of 12 areas of life, like home, love or work. Where a planet sits in the houses shows where in your life it plays out.',
  },
  'big-three': {
    term: 'Big Three',
    text: 'Your Sun, Moon and Rising signs. Together they give a quick picture of who you are, how you feel and how you come across.',
  },
  sun: {
    term: 'Sun sign',
    text: 'The sign the Sun was in when you were born: the one most people know as “their sign”. It stands for your core self.',
  },
  moon: {
    term: 'Moon sign',
    text: 'The sign the Moon was in when you were born. It stands for your feelings and what you need to feel safe.',
  },
  rising: {
    term: 'Rising sign',
    text: 'The sign that was coming up over the eastern horizon when you were born. It shows how you come across to others. Also called the Ascendant. It needs an exact birth time.',
  },
  midheaven: {
    term: 'Midheaven',
    text: 'The highest point of the sky when you were born. It’s linked to your direction in life and how you want to be seen in the world.',
  },
  'chart-angles': {
    term: 'ASC and MC',
    text: 'Two key points on the wheel. ASC (Ascendant) is your Rising sign, on the left. MC (Midheaven) is the top of the chart, linked to your direction in life.',
  },
  'slow-planet': {
    term: 'Slow planets',
    text: 'Uranus, Neptune and Pluto move so slowly that they stay in one sign for many years, so everyone your age shares them. The house they’re in is more personal.',
  },
  'how-we-know': {
    term: 'How we know this',
    text: 'ORBIT turns your birth time and place into an exact moment, then calculates where each planet was with an astronomy library accurate to about 1/60 of a degree.',
  },
  aspect: {
    term: 'Aspect',
    text: 'The angle between two planets. Certain angles mean the planets “talk” to each other, easily or with tension.',
  },
  degree: {
    term: 'Degree',
    text: 'How far a planet is through its sign. Each sign has 30 degrees, so 15° is halfway through.',
  },
  retrograde: {
    term: 'Retrograde',
    text: 'When a planet looks like it’s moving backwards from Earth (it isn’t really). Traditionally a time to slow down and look back.',
  },
  transit: {
    term: 'Transit',
    text: 'Where a planet is in the sky right now, compared with where it was in your birth chart.',
  },
  'unknown-time': {
    term: 'Why we need your birth time',
    text: 'The Moon moves through a whole sign in about two and a half days, and the Rising sign changes every two hours or so. Without your birth time, ORBIT can’t know these for sure, so it tells you instead of guessing.',
  },
};
