// topic-texts.js
// ---------------------------------------------------------------
// The words for the Explore topics (Who you are, Your feelings,
// Love, Work and direction, How you grow). Each text is written for
// ONE topic, so a topic tells you something you haven't read yet
// in My Chart.
//
// Status: first draft written with AI. Salma reviews and edits.
// ---------------------------------------------------------------

// What each sign is good at, and what it can overdo.
// Used for the Sun, the Rising sign and the houses.
export const STRENGTH = {
  Aries:       'courage: you start things others only talk about',
  Taurus:      'patience: you stay steady when everything else is changing',
  Gemini:      'curiosity: you connect ideas and people easily',
  Cancer:      'care: people feel safe and looked after around you',
  Leo:         'warmth: you light up a room and lift other people up',
  Virgo:       'attention to detail: you notice what others miss and make it better',
  Libra:       'fairness: you see both sides and help people get along',
  Scorpio:     'depth: you go all the way and see what’s really going on',
  Sagittarius: 'optimism: you find meaning and adventure almost anywhere',
  Capricorn:   'determination: you set a goal and keep going until you reach it',
  Aquarius:    'originality: you see new ways of doing things',
  Pisces:      'empathy: you understand what people feel without them saying it',
};

export const WATCH = {
  Aries:       'rushing in, or losing patience when things go slowly',
  Taurus:      'getting stuck, or holding on when it’s time to change',
  Gemini:      'scattering your energy over too many things at once',
  Cancer:      'taking things personally, or hiding in your shell when hurt',
  Leo:         'needing to be noticed, or feeling hurt when you’re not',
  Virgo:       'being too hard on yourself and everyone else',
  Libra:       'saying yes to keep the peace when you mean no',
  Scorpio:     'keeping everything inside, or finding it hard to trust',
  Sagittarius: 'promising more than you can do, or leaving when it gets serious',
  Capricorn:   'working so hard that you forget to rest and enjoy things',
  Aquarius:    'pulling away from your feelings, or other people’s',
  Pisces:      'losing yourself in other people’s problems, or in daydreams',
};

// Who you are: how you think and talk (Mercury).
export const MERCURY_TOPIC = {
  Aries:       'You think fast and say what you mean, often before anyone else has finished. Quick decisions come easily; slowing down to listen is the skill to practise.',
  Taurus:      'You think things through slowly and properly, and once you’ve decided, you don’t change your mind easily. People trust your opinion because it’s never rushed.',
  Gemini:      'Your mind jumps between ideas, and you can talk to almost anyone about almost anything. You learn best by asking questions and chatting things through.',
  Cancer:      'You think with your feelings and remember how things felt more than what was said. You listen well, and people open up to you.',
  Leo:         'You speak with confidence and enjoy telling a good story. Your words are warm and dramatic, and people remember them.',
  Virgo:       'You think carefully and like to get the details right. You’re great at explaining, fixing and organising, but you can overthink small things.',
  Libra:       'You weigh up every side before deciding, and you choose your words to keep things pleasant. Making up your mind can take a while.',
  Scorpio:     'You think deeply and notice what people aren’t saying. You don’t share your thoughts with just anyone, but when you do, you go straight to the point.',
  Sagittarius: 'You think big and speak honestly, sometimes too honestly. You love ideas, travel and learning about different ways of seeing the world.',
  Capricorn:   'You think in a practical, organised way and like plans that work. You say less, but what you say is serious and useful.',
  Aquarius:    'You think differently from most people and enjoy ideas that are new or unusual. You like to discuss and debate, and you don’t mind disagreeing.',
  Pisces:      'You think in pictures and feelings more than in lists. You’re imaginative and intuitive, but you may find it hard to explain how you “just know” things.',
};

// Your feelings: what helps you feel safe (Moon).
export const MOON_TOPIC = {
  Aries:       'You feel safe when you’re free to act on your feelings straight away. Anger comes fast and goes fast. You calm down by moving: a walk, sport, doing something.',
  Taurus:      'You feel safe with routine, comfort and people who stay. Good food, a cosy home and time without rushing calm you down. Sudden changes upset you most.',
  Gemini:      'You feel better once you’ve talked about it. Writing, messaging a friend or understanding why you feel something helps you calm down. Being bored or ignored upsets you.',
  Cancer:      'You feel safe at home, with the people closest to you. You need to feel looked after, and you show love by looking after others. Feeling left out hurts you most.',
  Leo:         'You feel safe when you feel appreciated and loved out loud. Being creative, laughing and a bit of attention lift your mood. Being ignored hurts you most.',
  Virgo:       'You feel safe when things are in order and you’re being useful. Tidying, planning or helping someone calms you down. Chaos and criticism unsettle you.',
  Libra:       'You feel safe when there’s peace and harmony around you. Arguments upset you, and beautiful places and kind company calm you down.',
  Scorpio:     'You feel safe with a few people you trust completely. Your feelings are deep and strong, even if you don’t show them. Betrayal is what hurts you most.',
  Sagittarius: 'You feel safe when you have space, freedom and something to look forward to. Plans, trips and laughter lift your mood. Feeling trapped upsets you most.',
  Capricorn:   'You feel safe when you’re in control and know what’s coming. You may hide your feelings and just keep going. Achieving something calms you down.',
  Aquarius:    'You feel safe when you’re free to be yourself, with some space of your own. You like to understand your feelings before you share them. Pressure to fit in upsets you.',
  Pisces:      'You feel everything, including other people’s moods. Music, art, sleep and quiet time help you recharge. Harsh words and noisy places drain you.',
};

// Love: how you love and what you're drawn to (Venus).
export const VENUS_TOPIC = {
  Aries:       'You fall fast and love the excitement of the chase. You’re drawn to confident, direct people, and you want a relationship that feels alive, not routine.',
  Taurus:      'You love slowly and loyally, through touch, time and small comforts. You’re drawn to people who feel safe and steady, and you need to trust before you open up.',
  Gemini:      'You fall for minds first: a good conversation is the best flirting. You need a partner who makes you laugh, keeps things interesting and gives you space.',
  Cancer:      'You love by caring: cooking, remembering, protecting. You’re drawn to people who feel like home, and you need to feel emotionally safe before you open up.',
  Leo:         'You love generously and like romance to feel special, even a bit dramatic. You need a partner who admires you, and you shower them with attention back.',
  Virgo:       'You show love through small useful things: helping, noticing, fixing. You’re drawn to people who are kind and reliable, and you can be choosy before you commit.',
  Libra:       'You love beauty, kindness and partnership, and relationships matter a lot to you. You’re drawn to people with good manners and taste, and you want things to feel fair.',
  Scorpio:     'You love all or nothing. You’re drawn to depth and honesty, and you need complete trust. Small talk bores you; real connection is what you want.',
  Sagittarius: 'You love freely and honestly, and fall for people who make life feel like an adventure. You need a partner who is also your friend and doesn’t try to tie you down.',
  Capricorn:   'You take love seriously and show it by being there, year after year. You’re drawn to people who are mature and reliable, and you may open up slowly.',
  Aquarius:    'You love in your own way and value friendship inside a relationship. You’re drawn to people who are a little different, and you need space to stay yourself.',
  Pisces:      'You love romantically and with your whole heart. You’re drawn to gentle, creative people, and you sometimes see the best in someone before it’s really there.',
};

// Love: how you go after what (and who) you want (Mars).
export const MARS_TOPIC = {
  Aries:       'When you like someone, they know quickly: you make the first move and don’t play games.',
  Taurus:      'When you like someone, you take your time, but once you decide, you’re steady and determined.',
  Gemini:      'When you like someone, you flirt with words: jokes, messages, long conversations.',
  Cancer:      'When you like someone, you show it by taking care of them, though you may wait for a sign before acting.',
  Leo:         'When you like someone, you go for it with big, warm gestures that are hard to miss.',
  Virgo:       'When you like someone, you show it through helpful little actions rather than big declarations.',
  Libra:       'When you like someone, you charm them and wait for them to come closer, rather than chasing.',
  Scorpio:     'When you like someone, you feel it intensely, but you watch carefully before you show it.',
  Sagittarius: 'When you like someone, you’re open and playful about it, and you invite them on an adventure.',
  Capricorn:   'When you like someone, you’re patient and serious: you’d rather build something real than rush.',
  Aquarius:    'When you like someone, you start as friends and surprise them with how you show interest.',
  Pisces:      'When you like someone, you dream about them first and show it in soft, romantic ways.',
};

// Work and direction: what you're drawn to do (Midheaven).
export const MIDHEAVEN_TOPIC = {
  Aries:       'You want work where you can lead, start new things and move fast. Being your own boss, sport or anything competitive can suit you.',
  Taurus:      'You want work that is stable and lets you build something real and lasting. Design, food, nature, money or anything hands-on can suit you.',
  Gemini:      'You want work with variety, people and words. Teaching, writing, media, sales or anything where you talk and learn can suit you.',
  Cancer:      'You want work where you care for people or make them feel at home. Health, education, food, family businesses or caring jobs can suit you.',
  Leo:         'You want work where you can create and be seen. Performing, art, events, leading a team or anything that lets you shine can suit you.',
  Virgo:       'You want work where you’re useful and can do things properly. Health, science, organising, editing or anything detailed can suit you.',
  Libra:       'You want work with beauty, people and fairness. Design, fashion, law, mediation or anything that brings people together can suit you.',
  Scorpio:     'You want work that goes deep. Research, psychology, investigation, medicine or anything where you find out what’s hidden can suit you.',
  Sagittarius: 'You want work with freedom and meaning. Travel, teaching, publishing, languages or anything that widens horizons can suit you.',
  Capricorn:   'You want work where you can climb, build and be respected. Business, management, architecture or any long-term project can suit you.',
  Aquarius:    'You want work that changes things or does them differently. Technology, science, activism or anything new and future-facing can suit you.',
  Pisces:      'You want work that feels meaningful or creative. Art, music, film, healing or helping people can suit you.',
};

// Work and direction: how you build success (Saturn).
export const SATURN_TOPIC = {
  Aries:       'Your challenge is learning to be patient and finish what you start. When you do, you become a strong, independent leader.',
  Taurus:      'Your challenge is feeling secure enough to take risks. When you do, you build something solid that lasts.',
  Gemini:      'Your challenge is focusing on one thing and trusting your own voice. When you do, you become an expert people listen to.',
  Cancer:      'Your challenge is balancing work with home and feelings. When you do, you create a safe place for yourself and others.',
  Leo:         'Your challenge is believing your work deserves to be seen. When you do, you shine with real, earned confidence.',
  Virgo:       'Your challenge is letting things be “good enough”. When you do, your skill and care make you someone people rely on.',
  Libra:       'Your challenge is making decisions without needing everyone to agree. When you do, you become fair and respected.',
  Scorpio:     'Your challenge is trusting others and sharing control. When you do, you become powerful in a quiet, lasting way.',
  Sagittarius: 'Your challenge is turning big ideas into real plans. When you do, your vision takes you far.',
  Capricorn:   'Your challenge is not carrying everything alone. When you do, you reach the top and enjoy the view.',
  Aquarius:    'Your challenge is staying true to your ideas while working with others. When you do, you change things for the better.',
  Pisces:      'Your challenge is giving your dreams a shape and some limits. When you do, your imagination becomes real work.',
};

// How you grow: where life opens up for you (Jupiter).
export const JUPITER_TOPIC = {
  Aries:       'You grow by being brave and trying new things first. Opportunities come when you take the lead instead of waiting.',
  Taurus:      'You grow by building slowly and enjoying the process. Opportunities come through patience, skills and simple pleasures.',
  Gemini:      'You grow by learning, talking and meeting new people. Opportunities often come through conversations, classes and messages.',
  Cancer:      'You grow by caring and being cared for. Opportunities come through family, home and the people closest to you.',
  Leo:         'You grow by creating and letting yourself be seen. Opportunities come when you share your talents generously.',
  Virgo:       'You grow by improving a little every day. Opportunities come through hard work, health and helping others.',
  Libra:       'You grow through relationships and teamwork. Opportunities come through partners, friends and people you meet.',
  Scorpio:     'You grow by facing difficult things instead of avoiding them. Opportunities come through deep connections and honest change.',
  Sagittarius: 'You grow by exploring: travel, study, big questions. Opportunities come when you say yes to the unknown.',
  Capricorn:   'You grow by setting goals and reaching them step by step. Opportunities come through responsibility and long-term effort.',
  Aquarius:    'You grow by being different and joining with like-minded people. Opportunities come through friends, groups and new ideas.',
  Pisces:      'You grow through kindness, creativity and quiet time. Opportunities come when you trust your intuition.',
};
