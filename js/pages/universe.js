// universe.js
// ---------------------------------------------------------------
// My Universe: reads your saved birth details, calculates your real
// chart, and fills the page with it:
//   - the line "Born 4 August 2001 · 14:30 · Valencia"
//   - your chart wheel
//   - your Big Three (Sun, Moon, Rising) with a short meaning each
//   - this week's sky, matched against your chart
// ---------------------------------------------------------------

import { calculateChart } from '../astro/chart.js?v=202610111804';
import { weeklyEvents } from '../astro/sky.js?v=202610111804';
import { drawWheel } from '../wheel.js?v=202610111804';
import { setUpGlossary, termButton } from '../glossary.js?v=202610111804';
import { setUpMenu, showSampleBanner } from '../layout.js?v=202610111804';
import { loadBirth } from '../store.js?v=202610111804';
import { PLANETS, SIGNS, HOUSES, SUN_IN, MOON_IN, RISING_IN } from '../content/basics.js?v=202610111804';

const $ = (id) => document.getElementById(id);

setUpMenu();

// No saved details yet? Send the visitor to the form first.
const birth = loadBirth();
if (!birth) {
  window.location.replace('index.html');
  throw new Error('No birth details saved yet');
}
showSampleBanner(birth);

const result = calculateChart(birth);
if (result.status !== 'ok') {
  document.querySelector('main').innerHTML =
    '<section class="wrap" style="padding-block:96px"><h1 class="section-title">We couldn’t calculate this chart</h1>' +
    '<p class="lede" style="margin-top:16px">Something in the saved birth details doesn’t work. Please enter them again.</p>' +
    '<p style="margin-top:24px"><a class="button" href="index.html#create">Enter birth details</a></p></section>';
  throw new Error(result.message || 'Chart could not be calculated');
}
const chart = result.chart;
const body = (id) => chart.bodies.find((b) => b.id === id);

// --- Born line ------------------------------------------------------

const dateText = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
  .format(new Date(Date.UTC(birth.year, birth.month - 1, birth.day)));
const timeText = birth.timeKnown
  ? `${String(birth.hour).padStart(2, '0')}:${String(birth.minute).padStart(2, '0')}`
  : 'time unknown';
const who = birth.isSample ? `${birth.name} was born` : 'Born';
$('born-line').textContent = `${who} ${dateText} · ${timeText} · ${birth.place.label}`;

// --- Chart wheel ----------------------------------------------------

const summary = `Your birth chart wheel. Sun in ${body('sun').sign}, Moon in ${body('moon').possibleSigns?.join(' or ') ?? body('moon').sign}` +
  (chart.angles ? `, Rising sign ${chart.angles.ascendant.sign}.` : '. Rising sign unknown because the birth time is unknown.');
$('hero-wheel').append(drawWheel(chart, { label: summary }));

// --- Big Three --------------------------------------------------------

function placement({ label, termKey, termLabel, sign, text, note, link }) {
  const col = document.createElement('article');
  col.className = 'placement';

  const eyebrow = document.createElement('p');
  eyebrow.className = 'eyebrow';
  eyebrow.textContent = label;

  const signEl = document.createElement('p');
  signEl.className = sign ? 'placement-sign' : 'placement-sign unknown';
  signEl.textContent = sign || 'Unknown';

  const textEl = document.createElement('p');
  textEl.append(text);

  col.append(eyebrow, signEl, textEl);

  if (note) {
    const noteEl = document.createElement('p');
    noteEl.className = 'note';
    noteEl.append(...note);
    col.append(noteEl);
  }

  const more = document.createElement('p');
  more.className = 'note';
  more.append('What is a ', termButton(termKey, termLabel), '?');
  col.append(more);

  if (link) {
    const a = document.createElement('a');
    a.className = 'text-link';
    a.href = link;
    a.textContent = 'Read more →';
    col.append(a);
  }
  return col;
}

const sun = body('sun');
const moon = body('moon');
const cards = [];

cards.push(placement({
  label: 'Sun · who you are', termKey: 'sun', termLabel: 'Sun sign',
  sign: sun.sign, text: SUN_IN[sun.sign], link: 'chart.html#sun',
}));

if (moon.uncertain) {
  // Without a birth time, the Moon could be in one of two signs that day.
  cards.push(placement({
    label: 'Moon · how you feel', termKey: 'moon', termLabel: 'Moon sign',
    sign: moon.possibleSigns.join(' or '),
    text: `The Moon changed sign on the day you were born, so it depends on your birth time. ${moon.possibleSigns[0]}: ${MOON_IN[moon.possibleSigns[0]]}`,
    note: [`${moon.possibleSigns[1]}: ${MOON_IN[moon.possibleSigns[1]]}`],
    link: 'chart.html#moon',
  }));
} else {
  cards.push(placement({
    label: 'Moon · how you feel', termKey: 'moon', termLabel: 'Moon sign',
    sign: moon.sign, text: MOON_IN[moon.sign], link: 'chart.html#moon',
  }));
}

if (chart.angles) {
  const rising = chart.angles.ascendant.sign;
  cards.push(placement({
    label: 'Rising · how you come across', termKey: 'rising', termLabel: 'Rising sign',
    sign: rising, text: RISING_IN[rising], link: 'chart.html#rising',
  }));
} else {
  cards.push(placement({
    label: 'Rising · how you come across', termKey: 'rising', termLabel: 'Rising sign',
    sign: null,
    text: 'Your Rising sign changes about every two hours, so it needs your exact birth time. ORBIT leaves it out rather than guess.',
    note: ['If you find your birth time (it’s often on your birth certificate), you can ', Object.assign(document.createElement('a'), { href: 'index.html#create', textContent: 'add it here' }), '.'],
  }));
}

$('big-three').append(...cards);

// --- Your sky this week ------------------------------------------------

const ASPECT_WORDS = {
  conjunction: { verb: 'meets', angle: 'lines up exactly with', feel: 'The two blend together, so this energy is strong and hard to miss.' },
  sextile:     { verb: 'supports', angle: 'makes a friendly angle to', feel: 'A small, helpful nudge.' },
  square:      { verb: 'challenges', angle: 'makes a tense angle to', feel: 'A bit of friction that pushes you to act.' },
  trine:       { verb: 'flows with', angle: 'makes an easy, flowing angle to', feel: 'Things tend to come naturally.' },
  opposition:  { verb: 'faces', angle: 'sits opposite', feel: 'A pull in two directions, asking for balance.' },
};
const TARGETS = {
  sun:    { name: 'your Sun', what: 'who you are' },
  moon:   { name: 'your Moon', what: 'how you feel' },
  rising: { name: 'your Rising sign', what: 'how you come across' },
};
// "the Sun" and "the Moon" need "the"; planets don't.
const nameOf = (id) => (id === 'sun' || id === 'moon' ? 'the ' : '') + id[0].toUpperCase() + id.slice(1);
const capital = (text) => text[0].toUpperCase() + text.slice(1);
const ordinal = (n) => n + (n === 1 ? 'st' : n === 2 ? 'nd' : n === 3 ? 'rd' : 'th');

function describe(e) {
  const planet = nameOf(e.body);
  if (e.type === 'ingress') {
    const title = `${capital(planet)} moves into ${e.sign}`;
    let text = `${capital(planet)} stands for ${PLANETS[e.body].short}. In ${e.sign}, it works ${SIGNS[e.sign].how}.`;
    if (e.house) text += ` For you, it’s moving through your ${ordinal(e.house)} house: ${HOUSES[e.house]}.`;
    return { title, text, term: 'house', termLabel: 'What is a house?' };
  }
  if (e.type === 'station') {
    return e.retrograde
      ? { title: `${capital(planet)} turns retrograde`, text: `It starts to look like it’s moving backwards from Earth. Traditionally a time to slow down and look again at ${PLANETS[e.body].short}.`, term: 'retrograde', termLabel: 'What does retrograde mean?' }
      : { title: `${capital(planet)} moves forward again`, text: `After weeks of looking like it went backwards, things linked to ${PLANETS[e.body].short} can start moving again.` };
  }
  const words = ASPECT_WORDS[e.aspect];
  const target = TARGETS[e.target];
  return {
    title: `${capital(planet)} ${words.verb} ${target.name}`,
    text: `This week’s ${planet.replace('the ', '')} (${PLANETS[e.body].short}) ${words.angle} ${target.name} (${target.what}). ${words.feel}`,
    term: 'aspect', termLabel: 'What is an angle between planets?',
  };
}

const week = weeklyEvents(chart);
const dayFormat = new Intl.DateTimeFormat('en-GB', { weekday: 'long' });
const rangeFormat = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long' });
const lastDay = new Date(week.end.getTime() - 1);
$('week-dates').textContent = `${rangeFormat.format(week.start)} – ${rangeFormat.format(lastDay)}`;

const list = $('week-list');
if (week.events.length === 0) {
  const li = document.createElement('li');
  li.innerHTML = '<p class="week-text"><strong>A quiet week in the sky.</strong> <span>No planet changes sign or makes a close angle to your Sun, Moon or Rising sign this week.</span></p>';
  list.append(li);
}
for (const e of week.events) {
  const { title, text, term, termLabel } = describe(e);
  const li = document.createElement('li');
  const day = document.createElement('p');
  day.className = 'week-day';
  day.textContent = dayFormat.format(e.date);
  const p = document.createElement('p');
  p.className = 'week-text';
  const strong = document.createElement('strong');
  strong.textContent = title;
  const span = document.createElement('span');
  span.textContent = text + ' ';
  if (term) span.append(termButton(term, termLabel));
  p.append(strong, span);
  li.append(day, p);
  list.append(li);
}

setUpGlossary();
