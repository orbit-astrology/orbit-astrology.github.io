// personal-sections.js
// ---------------------------------------------------------------
// The three "about you" sections on Explore, under "Ask your chart":
//   1. Your elements
//   2. The Moon you were born under
//   3. Your big life moments
// The numbers come from js/astro/personal.js, the words from
// js/content/personal-texts.js.
// ---------------------------------------------------------------

import { elementBalance, birthMoonPhase, lifeMoments } from './astro/personal.js?v=202611201706';
import { ELEMENTS, PHASE_TEXT, MOMENT_TEXT } from './content/personal-texts.js?v=202611201706';
import { PLANETS } from './content/basics.js?v=202611201706';
import { termButton } from './glossary.js?v=202611201706';

const SVG_NS = 'http://www.w3.org/2000/svg';
const make = (tag, className, text) => {
  const n = document.createElement(tag);
  if (className) n.className = className;
  if (text !== undefined) n.textContent = text;
  return n;
};
const listOf = (words) => (words.length < 2 ? words.join('') : `${words.slice(0, -1).join(', ')} and ${words.at(-1)}`);

// A section with a title and a short introduction.
function section(id, title, intro) {
  const box = make('section', 'personal wrap');
  box.setAttribute('aria-labelledby', `${id}-title`);
  const h2 = make('h2', 'section-title', title);
  h2.id = `${id}-title`;
  box.append(h2, make('p', 'lede', intro));
  return box;
}

// --- 1. Your elements ------------------------------------------------

function elementsSection(chart) {
  const balance = elementBalance(chart);
  const names = ['Fire', 'Earth', 'Air', 'Water'];
  const most = Math.max(...names.map((n) => balance[n].length));
  const least = Math.min(...names.map((n) => balance[n].length));
  const top = names.filter((n) => balance[n].length === most);
  const low = names.filter((n) => balance[n].length === least);

  const box = section('elements', 'Your elements',
    'Every sign belongs to one of four elements: Fire, Earth, Air or Water. Here is where your ten planets are.');

  // One row per element: its name, its signs, and a symbol for each of your planets in it.
  const rows = make('ul', 'element-rows');
  for (const n of names) {
    const row = make('li', `element-row${top.includes(n) ? ' strongest' : ''}`);
    const label = make('div', 'element-label');
    label.append(make('span', 'element-name', n), make('span', 'element-signs', ELEMENTS[n].signs));
    const symbols = make('div', 'element-planets');
    for (const body of balance[n]) {
      const s = make('span', 'element-planet', PLANETS[body.id].symbol + '︎');
      s.title = body.name;
      symbols.append(s);
    }
    const count = balance[n].length;
    symbols.setAttribute('aria-label', count ? `${count}: ${listOf(balance[n].map((b) => b.name))}` : 'none');
    row.append(label, symbols, make('span', 'element-count', String(count)));
    rows.append(row);
  }
  box.append(rows);

  // What it says about you.
  const summary = make('p', 'personal-summary');
  if (top.length === 1) {
    summary.textContent = `You’re mostly ${top[0]}: ${ELEMENTS[top[0]].like}.`;
    box.append(summary);
  } else {
    // A tie: say each one in its own sentence, so it reads clearly.
    summary.textContent = `You’re a mix of ${listOf(top)}.`;
    box.append(summary);
    for (const n of top) box.append(make('p', 'quiet', `${n}: ${ELEMENTS[n].like}.`));
  }
  if (low.length === 1) {
    box.append(make('p', 'quiet', `Least ${low[0]}${least === 0 ? ' (none at all)' : ''}: ${ELEMENTS[low[0]].little}. That’s not a lack, just a different way of being.`));
  }
  if (balance.unsure.length) {
    box.append(make('p', 'quiet', `Not counted: your ${listOf(balance.unsure.map((b) => b.name))}, which changed sign on your birthday, so it depends on your birth time.`));
  }
  return box;
}

// --- 2. The Moon you were born under ----------------------------------

// Draws the Moon: a dim full circle with the lit part on top.
// "angle" is how far the Moon was ahead of the Sun (0 = new, 180 = full).
function moonDrawing(angle, southern) {
  const r = 56;
  const c = 64;
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', '0 0 128 128');
  svg.setAttribute('class', 'moon-drawing');
  svg.setAttribute('aria-hidden', 'true');
  const disc = document.createElementNS(SVG_NS, 'circle');
  disc.setAttribute('cx', c); disc.setAttribute('cy', c); disc.setAttribute('r', r);
  disc.setAttribute('class', 'moon-dark');
  svg.append(disc);

  // The lit part: half a circle on the lit side, closed by the curved
  // line between light and dark (half an ellipse). Waxing (growing)
  // Moons are lit on the right, waning (shrinking) ones on the left.
  const k = Math.cos((angle * Math.PI) / 180); // 1 = new, 0 = half, −1 = full
  const rx = Math.abs(k) * r;
  const waxing = angle < 180;
  const outer = waxing ? 1 : 0;
  const inner = waxing ? (k > 0 ? 0 : 1) : (k > 0 ? 1 : 0);
  const lit = document.createElementNS(SVG_NS, 'path');
  lit.setAttribute('d', `M ${c} ${c - r} A ${r} ${r} 0 0 ${outer} ${c} ${c + r} A ${rx} ${r} 0 0 ${inner} ${c} ${c - r} Z`);
  lit.setAttribute('class', 'moon-lit');
  svg.append(lit);
  // South of the equator, the Moon looks the other way round.
  if (southern) svg.style.transform = 'scaleX(-1)';
  return svg;
}

function moonSection(chart) {
  const { angle, phases, lit } = birthMoonPhase(chart);
  const southern = chart.input.place.latitude < 0;
  const box = section('moon-phase', 'The Moon you were born under',
    'The Moon’s shape changes through the month, depending on where it is compared with the Sun. This is how it looked on the day you were born.');

  const inner = make('div', 'moon-phase');
  inner.append(moonDrawing(angle, southern));
  const text = make('div', 'moon-phase-text');
  text.append(make('p', 'moon-phase-name', phases.join(' or ')));
  text.append(make('p', 'quiet', `${chart.utcRange ? 'About ' : ''}${Math.round(lit * 100)}% lit${southern ? ', as seen from the southern half of the world, where you were born' : ''}.`));
  for (const name of phases) text.append(make('p', '', PHASE_TEXT[name]));
  if (phases.length > 1) {
    const why = make('p', 'quiet');
    why.append('The Moon changed shape on your birthday, so it depends on your birth time. ', termButton('unknown-time', 'Why?'));
    text.append(why);
  }
  inner.append(text);
  box.append(inner);
  return box;
}

// --- 3. Your big life moments -------------------------------------------

const monthYear = (d) => new Intl.DateTimeFormat('en-GB', { month: 'short', year: 'numeric' }).format(d);
// 1st, 2nd, 3rd, 4th...
const ordinal = (n) => {
  const ending = (n % 100 >= 11 && n % 100 <= 13) ? 'th' : ({ 1: 'st', 2: 'nd', 3: 'rd' }[n % 10] || 'th');
  return `${n}${ending}`;
};

function momentsSection(chart, now = new Date()) {
  const moments = lifeMoments(chart);
  const box = section('moments', 'Your big life moments',
    'The slow planets take years to travel around the sky. When one comes back to where it was when you were born, astrologers see a turning point. These are your real dates.');

  // What each kind of moment means.
  const key = make('dl', 'moment-key');
  for (const id of Object.keys(MOMENT_TEXT)) {
    const item = make('div');
    item.append(make('dt', '', MOMENT_TEXT[id].name), make('dd', '', MOMENT_TEXT[id].what));
    key.append(item);
  }
  box.append(key);

  // Your timeline. Past moments are quieter; the next one is marked.
  const next = moments.find((m) => m.end >= now);
  // Only number a moment if it happens more than once (1st, 2nd Saturn return).
  const howMany = (id) => moments.filter((m) => m.id === id).length;
  const list = make('ol', 'moment-list');
  for (const m of moments) {
    const past = m.end < now;
    const row = make('li', `moment${past ? ' past' : ''}${m === next ? ' next' : ''}`);
    const dates = m.start.getMonth() === m.end.getMonth() && m.start.getFullYear() === m.end.getFullYear()
      ? monthYear(m.start) : `${monthYear(m.start)} – ${monthYear(m.end)}`;
    const age = m.ageStart === m.ageEnd ? `at ${m.ageStart}` : `at ${m.ageStart}–${m.ageEnd}`;
    row.append(
      make('span', 'moment-when', dates),
      make('span', 'moment-name', howMany(m.id) > 1 ? `${ordinal(m.number)} ${MOMENT_TEXT[m.id].name}` : MOMENT_TEXT[m.id].name),
      make('span', 'moment-age', age),
      make('span', 'moment-tag', past ? 'Done' : m === next ? 'Next' : ''),
    );
    list.append(row);
  }
  box.append(list);
  return box;
}

// --- Putting them on the page -------------------------------------------

export function addPersonalSections(chart, before) {
  for (const build of [elementsSection, moonSection, momentsSection]) {
    before.before(build(chart));
  }
}
