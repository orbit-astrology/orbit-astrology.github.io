// basics.js
// ---------------------------------------------------------------
// The building blocks of every reading, in plain words:
//   planet = WHAT part of you
//   sign   = HOW it shows up
//   house  = WHERE in your life
// plus one short line for each Sun, Moon and Rising sign.
//
// Status: first draft written with AI from traditional astrology
// meanings. Salma reviews and edits before submission.
// ---------------------------------------------------------------

export const PLANETS = {
  sun:     { symbol: '☉', what: 'who you are',            short: 'your core self and what gives you energy' },
  moon:    { symbol: '☽', what: 'how you feel',           short: 'your emotions and what you need to feel safe' },
  mercury: { symbol: '☿', what: 'how you think and talk', short: 'your mind, your words and how you learn' },
  venus:   { symbol: '♀', what: 'how you love',           short: 'love, beauty and what you value' },
  mars:    { symbol: '♂', what: 'how you act',            short: 'your drive, your energy and how you go after things' },
  jupiter: { symbol: '♃', what: 'how you grow',           short: 'luck, growth and where you feel generous' },
  saturn:  { symbol: '♄', what: 'how you build',          short: 'discipline, responsibility and life lessons' },
  uranus:  { symbol: '♅', what: 'how you break free',     short: 'change, surprises and being different' },
  neptune: { symbol: '♆', what: 'how you dream',          short: 'imagination, dreams and intuition' },
  pluto:   { symbol: '♇', what: 'how you transform',      short: 'deep change, power and starting again' },
};

// A fuller sentence about each planet, for the explanations on My Chart.
export const PLANET_DETAIL = {
  sun:     'The Sun is the centre of your chart: your core self, what gives you energy and what you want to become.',
  moon:    'The Moon is your emotional side: how you react, what comforts you and what you need to feel safe.',
  mercury: 'Mercury is your mind: how you think, learn, talk and make sense of things.',
  venus:   'Venus is about love and pleasure: what you’re drawn to, what you find beautiful and how you show affection.',
  mars:    'Mars is your drive: how you go after what you want, how you handle anger and where your energy goes.',
  jupiter: 'Jupiter is about growth and luck: where you feel generous, hopeful and open to more.',
  saturn:  'Saturn is about effort and lessons: where you need patience, take responsibility and build something solid over time.',
  uranus:  'Uranus is about change and freedom: where you need to do things your own way and expect the unexpected.',
  neptune: 'Neptune is about dreams and imagination: where you’re intuitive, idealistic, and sometimes a little lost in a fog.',
  pluto:   'Pluto is about deep change: where you go through endings and new beginnings and discover your inner strength.',
};

// The slow outer planets stay in one sign for years, so everyone born
// around the same time shares them. Saying so is part of being honest.
export const SLOW_PLANETS = ['uranus', 'neptune', 'pluto'];

// "how" each sign does things, in a few words
export const SIGNS = {
  Aries:       { symbol: '♈', how: 'boldly and directly' },
  Taurus:      { symbol: '♉', how: 'steadily and sensually' },
  Gemini:      { symbol: '♊', how: 'curiously and playfully' },
  Cancer:      { symbol: '♋', how: 'tenderly and protectively' },
  Leo:         { symbol: '♌', how: 'warmly and expressively' },
  Virgo:       { symbol: '♍', how: 'carefully and helpfully' },
  Libra:       { symbol: '♎', how: 'gracefully, looking for balance' },
  Scorpio:     { symbol: '♏', how: 'intensely and privately' },
  Sagittarius: { symbol: '♐', how: 'freely and optimistically' },
  Capricorn:   { symbol: '♑', how: 'patiently and ambitiously' },
  Aquarius:    { symbol: '♒', how: 'independently, in your own way' },
  Pisces:      { symbol: '♓', how: 'gently and imaginatively' },
};

// A sentence about each sign's personality.
export const SIGN_DETAIL = {
  Aries:       'Aries is the first sign: brave, impatient and full of energy, always ready to start.',
  Taurus:      'Taurus is calm, loyal and grounded, and loves comfort, beauty and things that last.',
  Gemini:      'Gemini is curious, quick and chatty, always collecting new ideas and people.',
  Cancer:      'Cancer is caring, sensitive and protective, with a strong need for closeness and home.',
  Leo:         'Leo is warm, proud and generous, and loves to create, play and be seen.',
  Virgo:       'Virgo is thoughtful, practical and helpful, with an eye for detail and improvement.',
  Libra:       'Libra is kind, social and fair-minded, always looking for balance and harmony.',
  Scorpio:     'Scorpio is deep, private and all-or-nothing, with strong instincts about people.',
  Sagittarius: 'Sagittarius is free, honest and optimistic, always looking for the next adventure or big idea.',
  Capricorn:   'Capricorn is patient, responsible and ambitious, and takes the long road to success.',
  Aquarius:    'Aquarius is independent, original and idealistic, and cares about doing things differently.',
  Pisces:      'Pisces is gentle, imaginative and compassionate, and feels the world very deeply.',
};

// How the five main angles between planets feel, in plain words.
export const ASPECT_TEXT = {
  conjunction: { name: 'conjunction', angle: 0,   plain: 'side by side', meaning: 'they blend together and act as one' },
  sextile:     { name: 'sextile',     angle: 60,  plain: 'at a friendly angle', meaning: 'they support each other when you make the effort' },
  square:      { name: 'square',      angle: 90,  plain: 'at a tense angle', meaning: 'they rub against each other, which can push you to grow' },
  trine:       { name: 'trine',       angle: 120, plain: 'at an easy angle', meaning: 'they work together naturally' },
  opposition:  { name: 'opposition',  angle: 180, plain: 'on opposite sides', meaning: 'they pull in different directions, and you learn to balance them' },
};

// Where a degree sits inside its sign (each sign is 30°).
export function degreePlace(degree) {
  if (degree < 10) return 'early in the sign';
  if (degree < 20) return 'around the middle of the sign';
  return 'late in the sign';
}

// "where": the 12 areas of life
export const HOUSES = {
  1:  'you, your body and how you come across',
  2:  'money, belongings and self-worth',
  3:  'everyday talk, siblings and learning',
  4:  'home, family and roots',
  5:  'fun, creativity and romance',
  6:  'daily routines, work and health',
  7:  'partners and close relationships',
  8:  'deep bonds, shared things and change',
  9:  'travel, big ideas and beliefs',
  10: 'career and how the world sees you',
  11: 'friends, groups and hopes',
  12: 'the private, hidden and spiritual side of life',
};

export const SUN_IN = {
  Aries:       'Brave and full of energy. You feel most yourself when you’re starting something new.',
  Taurus:      'Calm and loyal. You shine when life feels steady, comfortable and beautiful.',
  Gemini:      'Curious and quick. You feel alive when you’re learning, talking and trying new things.',
  Cancer:      'Caring and protective. Your energy comes from the people and places you love.',
  Leo:         'Warm and expressive. You feel most yourself when you can create and be seen.',
  Virgo:       'Thoughtful and helpful. You shine when you’re making things better, down to the details.',
  Libra:       'Kind and fair. You feel most yourself in harmony, beauty and good company.',
  Scorpio:     'Deep and determined. You don’t do anything halfway, and you see beneath the surface.',
  Sagittarius: 'Free-spirited and optimistic. You feel alive when exploring places and ideas.',
  Capricorn:   'Patient and ambitious. You shine when you’re building something that lasts.',
  Aquarius:    'Original and independent. You feel most yourself when you can think differently.',
  Pisces:      'Gentle and imaginative. You feel deeply and pick up on what others don’t say.',
};

export const MOON_IN = {
  Aries:       'You feel things fast and strongly, and you need space to act on them.',
  Taurus:      'You need calm, comfort and routine to feel safe.',
  Gemini:      'Talking things through is how you make sense of your feelings.',
  Cancer:      'You need closeness and a safe place to come home to.',
  Leo:         'You need to feel loved, appreciated and a little bit special.',
  Virgo:       'You feel calmer when life is organised and you can be useful.',
  Libra:       'You need harmony around you, and conflict can unsettle you.',
  Scorpio:     'You feel everything deeply and need people you can truly trust.',
  Sagittarius: 'You need freedom and something to look forward to.',
  Capricorn:   'You keep feelings private and feel safe when things are under control.',
  Aquarius:    'You need space to process feelings in your own way.',
  Pisces:      'You’re very sensitive to the moods around you and need quiet time to recharge.',
};

export const RISING_IN = {
  Aries:       'People first meet someone direct, energetic and quick to act.',
  Taurus:      'People first meet someone calm, grounded and easy to be around.',
  Gemini:      'People first meet someone chatty, bright and curious.',
  Cancer:      'People first meet someone gentle, warm and a little shy.',
  Leo:         'People first meet someone confident, warm and hard to miss.',
  Virgo:       'People first meet someone neat, thoughtful and observant.',
  Libra:       'People first meet someone charming, polite and easy-going.',
  Scorpio:     'People first meet someone quiet, intense and hard to read.',
  Sagittarius: 'People first meet someone open, funny and adventurous.',
  Capricorn:   'People first meet someone serious, capable and mature.',
  Aquarius:    'People first meet someone friendly but a bit different.',
  Pisces:      'People first meet someone soft, dreamy and kind.',
};
