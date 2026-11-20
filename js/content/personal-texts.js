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
    more: 'Fire is the spark. It shows in enthusiasm, courage and the wish to be seen and to lead. At its best it inspires other people; on a bad day it can burn out or rush ahead.',
    signs: 'Aries, Leo and Sagittarius',
    like: 'full of energy, warm and quick to act',
    little: 'you may need a push to get started, and prefer to think before you jump in',
  },
  Earth: {
    more: 'Earth is the ground. It shows in patience, loyalty and a talent for making ideas real, step by step. At its best it builds things that last; on a bad day it can get stuck or worry too much.',
    signs: 'Taurus, Virgo and Capricorn',
    like: 'grounded and practical, with a love of real, useful results',
    little: 'everyday routines and practical details may not come naturally',
  },
  Air: {
    more: 'Air is the mind. It shows in talking, connecting people and seeing things from many sides. At its best it brings fresh ideas; on a bad day it can overthink or feel far from its emotions.',
    signs: 'Gemini, Libra and Aquarius',
    like: 'curious and sociable, happiest among ideas and conversations',
    little: 'you trust what you feel more than what you think, and may find it hard to step back and be objective',
  },
  Water: {
    more: 'Water is the heart. It shows in empathy, imagination and a strong memory for feelings. At its best it understands people without words; on a bad day it can be overwhelmed by moods.',
    signs: 'Cancer, Scorpio and Pisces',
    like: 'sensitive and intuitive, feeling things deeply',
    little: 'you may keep feelings at a distance, and understand them by thinking them through',
  },
};

// What two strong elements are like together (for a mix).
export const ELEMENT_PAIRS = {
  'Fire+Earth': 'Together they make a doer with a plan: the spark to start things and the patience to finish them. Part of you wants to jump in, part of you wants to be sure first.',
  'Fire+Air': 'Together they make someone lively and full of ideas: Air feeds Fire, so talking about a plan makes you want to do it right away.',
  'Fire+Water': 'Together they make someone passionate and deeply feeling: big emotions and the energy to act on them, a mix of steam and heart.',
  'Earth+Air': 'Together they make a practical thinker: you like ideas, but only the ones that can actually work.',
  'Earth+Water': 'Together they make someone caring and steady: you look after people in real, useful ways, and you value safety and closeness.',
  'Air+Water': 'Together they make someone who understands people: you can feel what others feel and also put it into words.',
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
    short: 'Jupiter, the planet of luck, is back where it was when you were born: a year of new chances.',
    what: 'Jupiter, the planet of luck and growth, comes back to where it was when you were born. It happens about every 12 years, and is said to bring a year of new chances and open doors.',
  },
  'saturn-return': {
    name: 'Saturn return',
    short: 'Saturn, the planet of responsibility, is back: a time of growing up and big decisions.',
    what: 'Saturn, the planet of responsibility, comes back to where it was when you were born. It happens about every 29 years. The first one is famous: a time of growing up, when people often make big decisions about work, love and who they want to be.',
  },
  'uranus-opposition': {
    name: 'Uranus opposition',
    short: 'Uranus, the planet of sudden change, is opposite where it was: the “midlife” wish for freedom.',
    what: 'Uranus, the planet of sudden change, reaches the opposite side of the sky from where it was when you were born. It happens once, around age 40 to 42: the classic “midlife” moment, with a strong wish for freedom and change.',
  },
};

// A second paragraph for each Moon shape: how it's said to show in
// everyday life.
export const PHASE_LIFE = {
  'New Moon': 'In everyday life: you may prefer to find your own way rather than follow a plan, and you often feel most alive at the start of something new.',
  'Waxing crescent': 'In everyday life: you may feel you have to prove yourself, and you keep going even when things are hard at first.',
  'First quarter': 'In everyday life: you tend to act when others hesitate, and a bit of challenge or crisis can bring out your best.',
  'Waxing gibbous': 'In everyday life: you notice what could be better, and you like to learn, practise and polish until something feels right.',
  'Full Moon': 'In everyday life: relationships matter a lot to you, and you often find yourself balancing what you want with what others need.',
  'Waning gibbous': 'In everyday life: you like to pass on what you know, whether by explaining, advising or creating, and you feel good when it helps someone.',
  'Last quarter': 'In everyday life: you may question rules that don’t make sense, and you’re ready to change direction when something no longer fits.',
  'Waning crescent': 'In everyday life: you may need more quiet time than others, and you can sense when a chapter is ending before anyone says so.',
};

// What a Jupiter or Saturn return is said to be about, depending on the
// sign that planet was in when you were born (it comes back to the same
// sign). Used for the next return on your timeline.
export const RETURN_THEME = {
  Jupiter: {
    Aries: 'growing by being brave: starting something of your own',
    Taurus: 'growing by building security: money, comfort and things that last',
    Gemini: 'growing by learning: new skills, new people, new conversations',
    Cancer: 'growing at home: family, roots and feeling safe',
    Leo: 'growing by being seen: creativity, joy and confidence',
    Virgo: 'growing through work and health: better habits and being useful',
    Libra: 'growing through others: partnerships, friendships and fairness',
    Scorpio: 'growing through depth: close bonds, honesty and letting go of the past',
    Sagittarius: 'growing by exploring: travel, study and big questions',
    Capricorn: 'growing through ambition: goals, career and responsibility',
    Aquarius: 'growing through community: friends, causes and being yourself',
    Pisces: 'growing through imagination: art, kindness and the inner life',
  },
  Saturn: {
    Aries: 'learning to stand on your own and act with patience',
    Taurus: 'learning what really makes you feel secure, money included',
    Gemini: 'learning to focus your mind and say what you mean',
    Cancer: 'learning to care for yourself, and finding where home really is',
    Leo: 'learning to trust your own talent and take yourself seriously',
    Virgo: 'learning healthy routines, and that good enough is good enough',
    Libra: 'learning to build fair, committed relationships',
    Scorpio: 'learning to trust, share and face what you fear',
    Sagittarius: 'learning what you truly believe and where you want to go',
    Capricorn: 'learning to build the career and life you really want',
    Aquarius: 'learning to be yourself while still belonging somewhere',
    Pisces: 'learning to turn dreams into something real, with clear limits',
  },
};
