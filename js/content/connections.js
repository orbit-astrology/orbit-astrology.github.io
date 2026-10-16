// content/connections.js
// ---------------------------------------------------------------
// The words for comparing two people's charts (Connections page).
// Rules: development/docs/writing-guide.md. Status: first draft written with AI,
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

// What each pair of planets is about (`about`), and what it can look
// like in real life (`tip`), once for friends and once for couples. The key is the two planets in
// the order of PERSONAL, so "venus-mars" covers your Venus with their
// Mars AND your Mars with their Venus.
export const PAIRS = {
  'sun-sun': {
    friendship: { about: 'how your personalities and goals sit side by side',
      tip: 'Notice whether you enjoy the same kinds of plans, or bring each other new ones.' },
    romance: { about: 'how your personalities and life goals fit together as a couple',
      tip: 'Talk about where you each want your lives to go: this link shows how easily those plans fit together.' },
  },
  'sun-moon': {
    friendship: { about: 'how one of you shines and the other feels looked after',
      tip: 'One of you often ends up cheering the other up or making them feel at home.' },
    romance: { about: 'a deep kind of bond: how who one of you is meets what the other needs to feel safe',
      tip: 'Often one of you feels truly seen and the other feels safe. Couples tend to feel this link strongly.' },
  },
  'sun-mercury': {
    friendship: { about: 'how one of you sees the other’s ideas',
      tip: 'It’s good for swapping ideas, giving honest advice and making plans together.' },
    romance: { about: 'how well you understand each other’s minds and support each other’s plans',
      tip: 'Notice how you listen to each other’s ideas and dreams, and whether you both feel heard.' },
  },
  'sun-venus': {
    friendship: { about: 'how much you simply enjoy and appreciate each other',
      tip: 'You probably like spending time together and saying nice things about each other.' },
    romance: { about: 'affection: how much one of you admires who the other is',
      tip: 'It often shows as admiration and affection: one of you simply likes who the other is.' },
  },
  'sun-mars': {
    friendship: { about: 'the energy between you: how you push each other on',
      tip: 'You can motivate each other to try things, like a sport, a project or an adventure.' },
    romance: { about: 'spark and chemistry: how one of you fires the other up',
      tip: 'It’s about physical spark and energy: you can fire each other up, in good ways and in arguments.' },
  },
  'moon-moon': {
    friendship: { about: 'whether you feel relaxed around each other’s moods',
      tip: 'It shows how easy it is to be around each other on bad days, or to just do nothing together.' },
    romance: { about: 'your emotional rhythm: how naturally you understand each other’s feelings and needs',
      tip: 'It shows how comfortable you’d feel living side by side: moods, routines and what home feels like.' },
  },
  'moon-mercury': {
    friendship: { about: 'how easy it is to talk about feelings together',
      tip: 'It shows whether you can talk about how you feel without it getting awkward.' },
    romance: { about: 'how you talk about feelings together',
      tip: 'Pay attention to how you talk when one of you is upset: words can soothe or sting here.' },
  },
  'moon-venus': {
    friendship: { about: 'warmth and kindness between you',
      tip: 'You tend to be gentle and kind with each other.' },
    romance: { about: 'tenderness: one of you feels cared for by the way the other loves',
      tip: 'Small gestures of care matter a lot here: you can make each other feel truly loved.' },
  },
  'moon-mars': {
    friendship: { about: 'how one person’s energy lands on the other’s feelings',
      tip: 'One of you may be more direct and the other more sensitive, so a little care goes a long way.' },
    romance: { about: 'how passion and feelings mix between you',
      tip: 'There can be real passion, but also hurt feelings if one of you rushes ahead before the other is ready.' },
  },
  'mercury-mercury': {
    friendship: { about: 'how you think and talk together: chats, jokes and debates',
      tip: 'It shows whether you get each other’s sense of humour and enjoy talking for hours.' },
    romance: { about: 'how you talk as a couple, from everyday plans to disagreements',
      tip: 'It shows how you handle everyday plans, decisions and disagreements together.' },
  },
  'mercury-venus': {
    friendship: { about: 'easy, pleasant conversations and shared taste',
      tip: 'You may share taste in music, films or style, and conversations feel easy.' },
    romance: { about: 'sweet talk: flirting, compliments and kind words',
      tip: 'Flirting, compliments and kind messages come into play here.' },
  },
  'mercury-mars': {
    friendship: { about: 'lively discussions and debates',
      tip: 'Debates can get lively, so it helps to remember you’re on the same side.' },
    romance: { about: 'how you argue and make decisions together',
      tip: 'Quick words can turn into heated ones, so it helps to slow down when you disagree.' },
  },
  'venus-venus': {
    friendship: { about: 'shared taste: what you both enjoy and find beautiful',
      tip: 'You may love the same places, things and ways of having fun.' },
    romance: { about: 'how your ways of showing love and affection match',
      tip: 'It shows whether you show love in similar ways, like gifts, time together or words.' },
  },
  'venus-mars': {
    friendship: { about: 'a playful, energising pull between you',
      tip: 'You might enjoy teasing each other, having adventures or making things together.' },
    romance: { about: 'attraction: how affection and desire meet',
      tip: 'Astrologers see this as one of the main signs of attraction between two people.' },
  },
  'mars-mars': {
    friendship: { about: 'how you get things done together',
      tip: 'You might make a great team for sports, games or projects, or end up competing a lot.' },
    romance: { about: 'how your energy and tempers meet',
      tip: 'When you agree you make a strong team; when you don’t, sparks can fly.' },
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
    feel: { friendship: 'these two parts of you blend, so this side of your friendship feels strong and familiar',
      romance: 'these two parts of you blend, so this feels strong and intense between you' } },
  sextile:     { label: 'Friendly',   kind: 'easy',  plain: 'at a friendly angle (60°)',
    feel: { friendship: 'there’s an easy opening here that grows the more time you spend together',
      romance: 'there’s a gentle opening here that grows when you both make an effort' } },
  trine:       { label: 'Easy',       kind: 'easy',  plain: 'at an easy angle (120°)',
    feel: { friendship: 'this tends to flow naturally between you as friends',
      romance: 'this tends to flow naturally between you as a couple, without much effort' } },
  square:      { label: 'Tense',      kind: 'tense', plain: 'at a tense angle (90°)',
    feel: { friendship: 'it can cause friction, and working through it can make your friendship stronger',
      romance: 'it can cause friction, and working through it is often how couples grow closer' } },
  opposition:  { label: 'Opposite',   kind: 'tense', plain: 'on opposite sides (180°)',
    feel: { friendship: 'you’re opposites here: you can balance each other out or clash, and you learn to meet in the middle',
      romance: 'you’re opposites here: it can draw you to each other or pull you apart, and you learn to meet in the middle' } },
};

// The little label in front of the part of each explanation that
// changes with the Friendship / Romance switch (the planets never change).
export const LENS_TAGS = { friendship: 'As friends', romance: 'As a couple' };

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
