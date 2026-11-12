// topics.js
// ---------------------------------------------------------------
// The five Explore topics. Each one answers a real question by
// bringing together the parts of YOUR chart that relate to it.
//
// Each topic lists "items" to show:
//   { type: 'placement', id }     a planet, Rising or Midheaven
//   { type: 'house', number }     the sign a house starts in, and planets inside it
//   { type: 'aspects', … }        a few of your planet connections
// Each item has a "lens": one sentence that explains that part of
// your chart for THIS topic (Venus means something specific in Love),
// and can have "more": a few sentences written only for this topic,
// and "sides": true to add a Strength and a Watch out for line.
// Each topic also has "together": a few short sentences at the top
// that connect the parts into one picture.
//
// Status: first draft written with AI. Salma reviews and edits.
// ---------------------------------------------------------------

import { SIGN_TRAITS as T, SIGNS, HOUSES } from './basics.js?v=202611121802';
import {
  WATCH, MERCURY_TOPIC, MOON_TOPIC, VENUS_TOPIC, MARS_TOPIC,
  MIDHEAVEN_TOPIC, SATURN_TOPIC, JUPITER_TOPIC,
} from './topic-texts.js?v=202611121802';

// "Putting it together" helpers. sign(id) gives the sign of one of
// your placements, or null if it isn't certain (no birth time).
// houseSign(n) gives the sign a house starts in, or null.

export const TOPICS = [
  {
    id: 'identity', name: 'Who you are', dot: '#C0A9B6',
    together: (sign) => [
      sign('sun') && `At heart you’re ${T[sign('sun')]}.`,
      sign('rising') && (sign('rising') === sign('sun') ? 'People see that straight away.' : `But people first meet someone ${T[sign('rising')]}.`),
      sign('mercury') && (sign('mercury') === sign('sun') ? 'And your mind works just like your heart.' : `Your mind is ${T[sign('mercury')]}.`),
    ],
    items: [
      { type: 'placement', id: 'sun', sides: true, lens: (p) => `At your core you’re ${T[p.sign]}.` },
      { type: 'placement', id: 'rising', lens: (p) => `People often first see you as ${T[p.sign]}.`,
        more: (p, sign) => (sign('sun') === p.sign
          ? 'Your Sun is in the same sign, so what people see first is really who you are.'
          : `Once they get to know you, they find your ${sign('sun')} Sun underneath: ${T[sign('sun')]}. So the first impression is only half the story.`) },
      { type: 'placement', id: 'mercury', lens: (p) => `You think and talk in a way that’s ${T[p.sign]}.`, more: (p) => MERCURY_TOPIC[p.sign] },
    ],
  },
  {
    id: 'emotions', name: 'Your feelings', dot: '#A8B4C4',
    together: (sign, houseSign) => [
      sign('moon') && `You feel things ${SIGNS[sign('moon')].how}.`,
      houseSign(4) && `You feel most at home when you can be ${T[houseSign(4)]}.`,
    ],
    items: [
      { type: 'placement', id: 'moon', lens: (p) => `Emotionally you’re ${T[p.sign]}.`, more: (p) => MOON_TOPIC[p.sign] },
      { type: 'house', number: 4, lens: (sign) => `Home, for you, feels best when it lets you be ${T[sign]}.` },
      { type: 'aspects', of: ['moon'], title: 'What affects your mood', intro: 'These planets talk to your Moon, so they colour how you feel.' },
    ],
  },
  {
    id: 'love', name: 'Love', dot: '#C9A3A6',
    together: (sign, houseSign) => [
      sign('venus') && `You love ${SIGNS[sign('venus')].how}.`,
      sign('mars') && `When you want someone, you go for it ${SIGNS[sign('mars')].how}.`,
      houseSign(7) && `You’re looking for someone ${T[houseSign(7)]}.`,
    ],
    items: [
      { type: 'placement', id: 'venus', lens: (p) => `You love in a way that’s ${T[p.sign]}.`, more: (p) => VENUS_TOPIC[p.sign] },
      { type: 'placement', id: 'mars', lens: (p) => `You go after what you want ${SIGNS[p.sign].how}.`, more: (p) => MARS_TOPIC[p.sign] },
      { type: 'house', number: 7, lens: (sign) => `Traditionally, this describes what you look for in a partner: someone ${T[sign]}.` },
      { type: 'house', number: 5, lens: (sign) => `Flirting, dates and fun feel best when they’re ${T[sign]}.` },
      { type: 'aspects', of: ['venus', 'mars'], title: 'How your love planets connect', intro: 'These connections shape how love and desire work together for you.' },
    ],
  },
  {
    id: 'career', name: 'Work and direction', dot: '#CDBB92',
    together: (sign, houseSign) => [
      sign('midheaven') && `You’re drawn to work that feels ${T[sign('midheaven')]}.`,
      sign('saturn') && `You build success ${SIGNS[sign('saturn')].how}, step by step.`,
      houseSign(6) && `Day to day, you work best ${SIGNS[houseSign(6)].how}.`,
    ],
    items: [
      { type: 'placement', id: 'midheaven', lens: (p) => `You’re drawn to work that feels ${T[p.sign]}.`, more: (p) => MIDHEAVEN_TOPIC[p.sign] },
      { type: 'placement', id: 'saturn', lens: (p) => `Success comes when you’re ${T[p.sign]}, step by step.`, more: (p) => SATURN_TOPIC[p.sign] },
      { type: 'house', number: 10, lens: (sign) => `The world tends to see your work as ${T[sign]}.` },
      { type: 'house', number: 6, lens: (sign) => `Day to day, you work best ${SIGNS[sign].how}.` },
    ],
  },
  {
    id: 'growth', name: 'How you grow', dot: '#B0B89E',
    together: (sign) => [
      sign('jupiter') && `You grow ${SIGNS[sign('jupiter')].how}.`,
      sign('saturn') && `Your big lesson: learning to be ${T[sign('saturn')]}.`,
    ],
    items: [
      { type: 'placement', id: 'jupiter', lens: (p) => `You grow when you let yourself be ${T[p.sign]}.`, more: (p) => JUPITER_TOPIC[p.sign] },
      { type: 'placement', id: 'saturn', lens: (p) => `A life lesson: learning to be ${T[p.sign]}, without being too hard on yourself.`, more: (p) => `What can get in the way: ${WATCH[p.sign]}.` },
      { type: 'placement', id: 'pluto', lens: (p) => `Pluto is about deep change. ${p.house ? `For you it plays out in your ${p.house}${['st', 'nd', 'rd'][p.house - 1] || 'th'} house: ${HOUSES[p.house]}.` : 'Its house needs your birth time.'}` },
      { type: 'aspects', tense: true, title: 'Where you grow the most', intro: 'These tense angles (squares and oppositions) are like friction between two parts of you. Working with them is where a lot of growth happens.' },
    ],
  },
];

export const topicById = Object.fromEntries(TOPICS.map((t) => [t.id, t]));
