// content/connections.js
// ---------------------------------------------------------------
// The words for comparing two people's charts (Connections page).
// Rules: docs/writing-guide.md. Status: first draft written with AI,
// Salma reviews and edits.
//
// How a "link" is explained:
//   your planet (what part of you) + their planet (what part of them)
//   + the angle between them (easy, tense, blending…)
//
// The Friendship / Romance switch only changes these WORDS. The
// planets and angles are exactly the same either way.
// ---------------------------------------------------------------

// We compare the five "personal" planets: the ones that describe
// everyday personality, feelings, talking, love and energy.
export const PERSONAL = ['sun', 'moon', 'mercury', 'venus', 'mars'];

// What each planet stands for, said about the other person.
export const THEIR_WHAT = {
  sun: 'who they are',
  moon: 'how they feel',
  mercury: 'how they think and talk',
  venus: 'how they love',
  mars: 'how they act',
};

// What each pair of planets is about. The key is the two planets in
// the order of PERSONAL, so "venus-mars" covers your Venus with their
// Mars AND your Mars with their Venus.
export const PAIRS = {
  'sun-sun': {
    friendship: 'how your personalities and goals sit side by side',
    romance: 'how your personalities and life goals fit together as a couple',
  },
  'sun-moon': {
    friendship: 'how one of you shines and the other feels looked after',
    romance: 'a deep kind of bond: how who one of you is meets what the other needs to feel safe',
  },
  'sun-mercury': {
    friendship: 'how one of you sees the other’s ideas',
    romance: 'how well you understand each other’s minds and support each other’s plans',
  },
  'sun-venus': {
    friendship: 'how much you simply enjoy and appreciate each other',
    romance: 'affection: how much one of you admires who the other is',
  },
  'sun-mars': {
    friendship: 'the energy between you: how you push each other on',
    romance: 'spark and chemistry: how one of you fires the other up',
  },
  'moon-moon': {
    friendship: 'whether you feel relaxed around each other’s moods',
    romance: 'your emotional rhythm: how naturally you understand each other’s feelings and needs',
  },
  'moon-mercury': {
    friendship: 'how easy it is to talk about feelings together',
    romance: 'how you talk about feelings together',
  },
  'moon-venus': {
    friendship: 'warmth and kindness between you',
    romance: 'tenderness: one of you feels cared for by the way the other loves',
  },
  'moon-mars': {
    friendship: 'how one person’s energy lands on the other’s feelings',
    romance: 'how passion and feelings mix between you',
  },
  'mercury-mercury': {
    friendship: 'how you think and talk together: chats, jokes and debates',
    romance: 'how you talk as a couple, from everyday plans to disagreements',
  },
  'mercury-venus': {
    friendship: 'easy, pleasant conversations and shared taste',
    romance: 'sweet talk: flirting, compliments and kind words',
  },
  'mercury-mars': {
    friendship: 'lively discussions and debates',
    romance: 'how you argue and make decisions together',
  },
  'venus-venus': {
    friendship: 'shared taste: what you both enjoy and find beautiful',
    romance: 'how your ways of showing love and affection match',
  },
  'venus-mars': {
    friendship: 'a playful, energising pull between you',
    romance: 'attraction: how affection and desire meet',
  },
  'mars-mars': {
    friendship: 'how you get things done together',
    romance: 'how your energy and tempers meet',
  },
};

// The two planets in a link, always in the same order, e.g. "venus-mars".
export function pairKey(a, b) {
  return PERSONAL.indexOf(a) <= PERSONAL.indexOf(b) ? `${a}-${b}` : `${b}-${a}`;
}

// What each kind of angle feels like between two people.
// "kind" groups them for the little label and the line style.
export const LINK_TYPES = {
  conjunction: { label: 'Blending',   kind: 'blend', plain: 'side by side (0°)',
    feel: 'these two parts of you blend, so this link feels strong and familiar' },
  sextile:     { label: 'Friendly',   kind: 'easy',  plain: 'at a friendly angle (60°)',
    feel: 'there’s an easy opening here that grows when you both make an effort' },
  trine:       { label: 'Easy',       kind: 'easy',  plain: 'at an easy angle (120°)',
    feel: 'this tends to flow naturally between you, without much effort' },
  square:      { label: 'Tense',      kind: 'tense', plain: 'at a tense angle (90°)',
    feel: 'this can cause friction, and working through it is often how you grow closer' },
  opposition:  { label: 'Opposite',   kind: 'tense', plain: 'on opposite sides (180°)',
    feel: 'you’re opposites here: it can attract you or pull you apart, and you learn to meet in the middle' },
};

// Short introductions for the two ways of reading.
// The planets never change, only the words.
export const LENSES = {
  friendship: 'Reading as friends: how you get on, talk, have fun and support each other.',
  romance: 'Reading as a couple: attraction, affection, feelings and how you handle conflict.',
};
export const LENS_HINT = 'The planets stay the same; the explanations change.';

// The made-up sample person, so anyone can try Connections without
// typing someone else's details. Clearly labelled as made up.
export const SAMPLE_PERSON = {
  id: 'sample-sam',
  name: 'Sam',
  isSample: true,
  birth: {
    year: 2000, month: 9, day: 24, hour: 9, minute: 15, timeKnown: true,
    place: { label: 'Lisbon, Lisbon, Portugal', latitude: 38.7167, longitude: -9.1333, timeZone: 'Europe/Lisbon' },
  },
};
