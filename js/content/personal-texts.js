// personal-texts.js
// ---------------------------------------------------------------
// The words for the three "about you" sections on Explore
// (js/personal-sections.js): your elements, the Moon you were born
// under and your big life moments. Plain language for beginners.
// ---------------------------------------------------------------

// The four elements: what each one is like, and what having little
// of it can mean.
export const ELEMENTS = {
  Fire: {
    signs: 'Aries, Leo and Sagittarius',
    like: 'full of energy, warm and quick to act',
    little: 'you may need a push to get started, and prefer to think before you jump in',
  },
  Earth: {
    signs: 'Taurus, Virgo and Capricorn',
    like: 'grounded and practical, with a love of real, useful results',
    little: 'everyday routines and practical details may not come naturally',
  },
  Air: {
    signs: 'Gemini, Libra and Aquarius',
    like: 'curious and sociable, happiest among ideas and conversations',
    little: 'you trust what you feel more than what you think, and may find it hard to step back and be objective',
  },
  Water: {
    signs: 'Cancer, Scorpio and Pisces',
    like: 'sensitive and intuitive, feeling things deeply',
    little: 'you may keep feelings at a distance, and understand them by thinking them through',
  },
};

// The eight shapes of the Moon, and what each says about people born
// under it.
export const PHASE_TEXT = {
  'New Moon': 'The Moon was dark, right next to the Sun. People born now are said to love fresh starts and to follow their instincts, sometimes before they know why.',
  'Waxing crescent': 'A thin sliver of Moon, growing. People born now are said to be determined to grow beyond where they started.',
  'First quarter': 'Half the Moon was lit, and growing. People born now are said to be good under pressure and to like building things.',
  'Waxing gibbous': 'The Moon was almost full, and growing. People born now are said to like analysing, improving and getting things right.',
  'Full Moon': 'The whole Moon was lit, opposite the Sun. People born now are said to care a lot about other people and to see both sides of things.',
  'Waning gibbous': 'The Moon was just past full, and shrinking. People born now are said to be natural teachers who like to share what they’ve learned.',
  'Last quarter': 'Half the Moon was lit, and shrinking. People born now are said to question old ways and aren’t afraid to turn the page.',
  'Waning crescent': 'A thin sliver of Moon, about to disappear. People born now are said to be reflective and intuitive, with a feeling for endings and new beginnings.',
};

// The big life moments.
export const MOMENT_TEXT = {
  'jupiter-return': {
    name: 'Jupiter return',
    what: 'Jupiter, the planet of luck and growth, comes back to where it was when you were born. It happens about every 12 years, and is said to bring a year of new chances and open doors.',
  },
  'saturn-return': {
    name: 'Saturn return',
    what: 'Saturn, the planet of responsibility, comes back to where it was when you were born. It happens about every 29 years. The first one is famous: a time of growing up, when people often make big decisions about work, love and who they want to be.',
  },
  'uranus-opposition': {
    name: 'Uranus opposition',
    what: 'Uranus, the planet of sudden change, reaches the opposite side of the sky from where it was when you were born. It happens once, around age 40 to 42: the classic “midlife” moment, with a strong wish for freedom and change.',
  },
};
