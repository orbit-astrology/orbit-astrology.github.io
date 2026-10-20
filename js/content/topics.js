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
// your chart for THIS topic (Venus means something specific in Love).
//
// Status: first draft written with AI. Salma reviews and edits.
// ---------------------------------------------------------------

import { SIGN_TRAITS as T, SIGNS, MOON_IN, HOUSES } from './basics.js?v=202610201616';

export const TOPICS = [
  {
    id: 'identity', number: '01', name: 'Identity & personality', question: 'Who am I?', dot: '#C0A9B6',
    intro: 'Three parts of your chart describe your personality best: your Sun (your core self), your Rising sign (how you come across) and Mercury (how you think and talk).',
    items: [
      { type: 'placement', id: 'sun', lens: (p) => `At your core you’re ${T[p.sign]}. This side of you gets stronger the more you live it.` },
      { type: 'placement', id: 'rising', lens: (p) => `People often first see you as ${T[p.sign]}, even before they know the real you.` },
      { type: 'placement', id: 'mercury', lens: (p) => `You think and talk in a way that’s ${T[p.sign]}.` },
    ],
  },
  {
    id: 'emotions', number: '02', name: 'Emotions & inner world', question: 'What do I need to feel safe?', dot: '#A8B4C4',
    intro: 'Your Moon is the main key to your feelings. Your 4th house, the area of home and family, shows where you go to feel safe.',
    items: [
      { type: 'placement', id: 'moon', lens: (p) => `Emotionally you’re ${T[p.sign]}. ${MOON_IN[p.sign]}` },
      { type: 'house', number: 4, lens: (sign) => `Home, for you, feels best when it lets you be ${T[sign]}.` },
      { type: 'aspects', of: ['moon'], title: 'What affects your mood', intro: 'These planets talk to your Moon, so they colour how you feel.' },
    ],
  },
  {
    id: 'love', number: '03', name: 'Love & relationships', question: 'How do I love?', dot: '#C9A3A6',
    intro: 'Venus shows how you love and what you’re drawn to. Mars shows how you go after what (and who) you want. Your 7th house, the area of partners, shows what you look for in a relationship.',
    items: [
      { type: 'placement', id: 'venus', lens: (p) => `You love in a way that’s ${T[p.sign]}, and you’re drawn to people and things that feel that way too.` },
      { type: 'placement', id: 'mars', lens: (p) => `When you like someone, you go after them ${SIGNS[p.sign].how}.` },
      { type: 'house', number: 7, lens: (sign) => `Traditionally, this describes what you look for in a partner: someone ${T[sign]}.` },
      { type: 'house', number: 5, lens: (sign) => `Flirting, dates and fun feel best when they’re ${T[sign]}.` },
      { type: 'aspects', of: ['venus', 'mars'], title: 'How your love planets connect', intro: 'These connections shape how love and desire work together for you.' },
    ],
  },
  {
    id: 'career', number: '04', name: 'Career & direction', question: 'Where am I going?', dot: '#CDBB92',
    intro: 'Your Midheaven, the top of your chart, shows the direction you’re drawn to. Saturn shows where you build things slowly and earn them. Your 10th and 6th houses cover career and daily work.',
    items: [
      { type: 'placement', id: 'midheaven', lens: (p) => `You’re drawn to work and a reputation that feel ${T[p.sign]}.` },
      { type: 'placement', id: 'saturn', lens: (p) => `Success tends to come when you’re ${T[p.sign]}, step by step. It might feel slow, but what you build here lasts.` },
      { type: 'house', number: 10, lens: (sign) => `The world tends to see your work as ${T[sign]}.` },
      { type: 'house', number: 6, lens: (sign) => `Day to day, you work best ${SIGNS[sign].how}.` },
    ],
  },
  {
    id: 'growth', number: '05', name: 'Growth & change', question: 'What am I learning?', dot: '#B0B89E',
    intro: 'Jupiter shows where you grow easily. Saturn and Pluto show where you grow through effort and change. Tense angles between planets are often where you learn the most.',
    items: [
      { type: 'placement', id: 'jupiter', lens: (p) => `You grow when you let yourself be ${T[p.sign]}. Traditionally, this is where luck finds you.` },
      { type: 'placement', id: 'saturn', lens: (p) => `A life lesson: learning to be ${T[p.sign]}, without being too hard on yourself.` },
      { type: 'placement', id: 'pluto', lens: (p) => `Pluto is about deep change. ${p.house ? `For you it plays out in your ${p.house}${['st', 'nd', 'rd'][p.house - 1] || 'th'} house: ${HOUSES[p.house]}.` : 'Its house needs your birth time.'}` },
      { type: 'aspects', tense: true, title: 'Where you grow the most', intro: 'These tense angles (squares and oppositions) are like friction between two parts of you. Working with them is where a lot of growth happens.' },
    ],
  },
];

export const topicById = Object.fromEntries(TOPICS.map((t) => [t.id, t]));
