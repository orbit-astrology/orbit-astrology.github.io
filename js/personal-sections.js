// personal-sections.js
// ---------------------------------------------------------------
// The three "about you" sections on Explore, under "Ask your chart":
//   1. Your elements
//   2. The Moon you were born under
//   3. Your big life moments
// The numbers come from js/astro/personal.js, the words from
// js/content/personal-texts.js.
// ---------------------------------------------------------------

import { elementBalance, birthMoonPhase, lifeMoments, PHASES } from './astro/personal.js?v=202611201854';
import { ELEMENTS, ELEMENT_PAIRS, PHASE_TEXT, PHASE_LIFE, MOMENT_TEXT, RETURN_THEME } from './content/personal-texts.js?v=202611201854';
import { PLANETS } from './content/basics.js?v=202611201854';
import { termButton, setUpGlossary } from './glossary.js?v=202611201854';

const SVG_NS = 'http://www.w3.org/2000/svg';
const make = (tag, className, text) => {
  const n = document.createElement(tag);
  if (className) n.className = className;
  if (text !== undefined) n.textContent = text;
  return n;
};
const listOf = (words) => (words.length < 2 ? words.join('') : `${words.slice(0, -1).join(', ')} and ${words.at(-1)}`);

// Turns the astrology words in a text into dashed glossary words
// (tap or hover to see what they mean). Each word is linked once per text.
const TERMS = [
  [/\b(sign)\b/i, 'sign'],
  [/\b(elements?)\b/i, 'element'],
  [/\b(planets)\b/i, 'planet'],
  [/\b(Waxing|Waning)\b/i, 'waxing-waning'],
  [/\b(gibbous)\b/i, 'gibbous'],
  [/\b(crescent)\b/i, 'crescent'],
  [/\b(quarter)\b/i, 'moon-quarter'],
  [/\b(shape)\b/i, 'moon-phase'],
  [/\b(return)\b/i, 'planetary-return'],
  [/\b(opposition)\b/i, 'opposition-moment'],
];
function withTerms(text, keys = TERMS.map((t) => t[1])) {
  let parts = [text];
  for (const [pattern, key] of TERMS) {
    if (!keys.includes(key)) continue;
    const i = parts.findIndex((p) => typeof p === 'string' && pattern.test(p));
    if (i < 0) continue;
    const m = parts[i].match(pattern);
    const before = parts[i].slice(0, m.index);
    const after = parts[i].slice(m.index + m[0].length);
    parts.splice(i, 1, before, termButton(key, m[0]), after);
  }
  return parts.filter((p) => p !== '');
}
const termed = (tag, className, text, keys) => {
  const n = make(tag, className);
  n.append(...withTerms(text, keys));
  return n;
};

// A numbered section: on the left its number, title and a short
// introduction; on the right ("body") the part about you.
// Returns [section, body].
function section(id, number, title, intro) {
  const box = make('section', 'personal wrap');
  box.setAttribute('aria-labelledby', `${id}-title`);
  const head = make('div', 'personal-head');
  const h2 = make('h2', 'section-title', title);
  h2.id = `${id}-title`;
  head.append(make('p', 'personal-number', number), h2, termed('p', 'lede', intro));
  const body = make('div', 'personal-body');
  box.append(head, body);
  return [box, body];
}

// The old symbol for each element, drawn as a triangle: Fire and Air
// point up (they rise), Earth and Water point down. Air and Earth have
// a line across.
function elementSymbol(name) {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', '0 0 40 40');
  svg.setAttribute('class', 'element-symbol');
  svg.setAttribute('aria-hidden', 'true');
  const up = name === 'Fire' || name === 'Air';
  const tri = document.createElementNS(SVG_NS, 'path');
  tri.setAttribute('d', up ? 'M20 5 L36 34 L4 34 Z' : 'M4 6 L36 6 L20 35 Z');
  svg.append(tri);
  if (name === 'Air' || name === 'Earth') {
    const bar = document.createElementNS(SVG_NS, 'path');
    bar.setAttribute('d', up ? 'M8 24 L32 24' : 'M8 16 L32 16');
    svg.append(bar);
  }
  return svg;
}

// Makes a set of buttons work as tabs: one is "chosen" at a time, and
// choosing one calls show(index). Used by all three sections.
function choosable(buttons, show, start) {
  const choose = (i) => {
    buttons.forEach((b, n) => b.setAttribute('aria-pressed', String(n === i)));
    show(i);
  };
  buttons.forEach((b, i) => b.addEventListener('click', () => choose(i)));
  choose(start);
}

// --- 1. Your elements ------------------------------------------------

function elementsSection(chart) {
  const balance = elementBalance(chart);
  const names = ['Fire', 'Earth', 'Air', 'Water'];
  const most = Math.max(...names.map((n) => balance[n].length));
  const least = Math.min(...names.map((n) => balance[n].length));
  const top = names.filter((n) => balance[n].length === most);
  const low = names.filter((n) => balance[n].length === least);

  const [box, body] = section('elements', '01', 'Your elements',
    'Every sign belongs to one of four elements: Fire, Earth, Air or Water. Each element is a way of meeting the world. Here is where your ten planets are. Tap an element to read about it.');

  // The headline: your strongest element(s).
  if (top.length === 1) {
    body.append(make('p', 'personal-summary', `You’re mostly ${top[0]}: ${ELEMENTS[top[0]].like}.`));
  } else {
    body.append(make('p', 'personal-summary', `You’re a mix of ${listOf(top)}.`));
    const pair = ELEMENT_PAIRS[top.join('+')];
    if (pair) body.append(make('p', 'personal-text', pair));
  }

  // Four columns, one per element: its old symbol, name, signs and a
  // symbol for each of your planets in it. Each column is a button.
  const grid = make('div', 'element-grid');
  const buttons = names.map((n) => {
    const col = make('button', `element-col${top.includes(n) ? ' strongest' : ''}`);
    col.type = 'button';
    col.append(elementSymbol(n), make('span', 'element-name', n), make('span', 'element-signs', ELEMENTS[n].signs));
    const symbols = make('span', 'element-planets');
    balance[n].forEach((planet, i) => {
      const s = make('span', 'element-planet', PLANETS[planet.id].symbol + '︎');
      s.style.setProperty('--i', i);
      symbols.append(s);
    });
    const count = balance[n].length;
    col.append(symbols, make('span', 'element-count', count === 1 ? '1 planet' : `${count} planets`));
    grid.append(col);
    return col;
  });
  body.append(grid);

  // The reading for the chosen element (your strongest at first).
  const panel = make('div', 'element-panel');
  panel.setAttribute('aria-live', 'polite');
  body.append(panel);
  choosable(buttons, (i) => {
    const n = names[i];
    const here = balance[n];
    const where = here.length
      ? `Your ${listOf(here.map((b) => b.name))} ${here.length === 1 ? 'is' : 'are'} in ${n}.`
      : `None of your planets are in ${n}.`;
    const text = top.includes(n)
      ? `${ELEMENTS[n].like[0].toUpperCase()}${ELEMENTS[n].like.slice(1)}. ${ELEMENTS[n].more}`
      : `${ELEMENTS[n].more}${low.length === 1 && low[0] === n ? ` Having little ${n}: ${ELEMENTS[n].little}. That’s not a lack, just a different way of being.` : ''}`;
    panel.replaceChildren(make('p', 'element-panel-name', n), make('p', 'element-panel-where', where), make('p', '', text));
  }, names.indexOf(top[0]));

  if (balance.unsure.length) {
    body.append(make('p', 'quiet', `Not counted: your ${listOf(balance.unsure.map((b) => b.name))}, which changed sign on your birthday, so it depends on your birth time.`));
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
  const [box, body] = section('moon-phase', '02', 'The Moon you were born under',
    'The Moon’s shape changes through the month, depending on where it is compared with the Sun. This is how it looked on the day you were born.');

  const inner = make('div', 'moon-phase');
  const big = make('div', 'moon-big');
  big.append(moonDrawing(angle, southern));
  inner.append(big);
  const text = make('div', 'moon-phase-text');
  text.append(termed('p', 'moon-phase-name', phases.join(' or '), ['waxing-waning', 'gibbous', 'crescent', 'moon-quarter']));
  text.append(make('p', 'quiet', `${chart.utcRange ? 'About ' : ''}${Math.round(lit * 100)}% lit${southern ? ', as seen from the southern half of the world, where you were born' : ''}.`));
  for (const name of phases) text.append(make('p', '', PHASE_TEXT[name]));
  // With one certain shape, add how it's said to show in everyday life.
  if (phases.length === 1) text.append(make('p', '', PHASE_LIFE[phases[0]]));
  if (phases.length > 1) {
    const why = make('p', 'quiet');
    why.append('The Moon changed shape on your birthday, so it depends on your birth time. ', termButton('unknown-time', 'Why?'));
    text.append(why);
  }
  inner.append(text);
  body.append(inner);

  // The whole month: the eight shapes in order, yours marked. Tap one
  // to read about people born under it.
  body.append(make('p', 'eyebrow moon-cycle-title', 'The Moon’s month · tap a shape'));
  const cycle = make('div', 'moon-cycle');
  const buttons = PHASES.map((name, i) => {
    const step = make('button', `moon-step${phases.includes(name) ? ' yours' : ''}`);
    step.type = 'button';
    step.style.setProperty('--i', i);
    step.append(moonDrawing(i * 45, southern), make('span', 'moon-step-name', name));
    step.append(make('span', 'moon-step-tag', phases.includes(name) ? 'You' : ''));
    cycle.append(step);
    return step;
  });
  body.append(cycle);
  const panel = make('p', 'moon-cycle-panel');
  panel.setAttribute('aria-live', 'polite');
  body.append(panel);
  choosable(buttons, (i) => {
    const name = PHASES[i];
    if (phases.includes(name)) {
      panel.replaceChildren(termed('strong', '', name, ['waxing-waning', 'gibbous', 'crescent', 'moon-quarter']), ': your Moon. Tap the others to compare.');
    } else {
      panel.replaceChildren(termed('strong', '', name, ['waxing-waning', 'gibbous', 'crescent', 'moon-quarter']), ': ', PHASE_TEXT[name].replace(/^.*?\. /, ''));
    }
    setUpGlossary(panel);
  }, PHASES.indexOf(phases[0]));
  return box;
}

// --- 3. Your big life moments -------------------------------------------

const monthYear = (d) => new Intl.DateTimeFormat('en-GB', { month: 'short', year: 'numeric' }).format(d);
// 1st, 2nd, 3rd, 4th...
const ordinal = (n) => {
  const ending = (n % 100 >= 11 && n % 100 <= 13) ? 'th' : ({ 1: 'st', 2: 'nd', 3: 'rd' }[n % 10] || 'th');
  return `${n}${ending}`;
};

// "in 3 years", "in 8 months"...
function fromNow(date, now) {
  const months = Math.round((date - now) / (30.44 * 86400000));
  if (months < 1) return 'happening now';
  if (months < 12) return `in ${months} month${months === 1 ? '' : 's'}`;
  const years = Math.round(months / 12);
  return `in about ${years} year${years === 1 ? '' : 's'}`;
}

const datesOf = (m) => (m.start.getMonth() === m.end.getMonth() && m.start.getFullYear() === m.end.getFullYear()
  ? monthYear(m.start) : `${monthYear(m.start)} – ${monthYear(m.end)}`);
const ageOf = (m) => (m.ageStart === m.ageEnd ? `at ${m.ageStart}` : `at ${m.ageStart}–${m.ageEnd}`);

// "3 years ago", "8 months ago"...
function ago(date, now) {
  const years = Math.round((now - date) / (365.25 * 86400000));
  return years < 1 ? 'less than a year ago' : `${years} year${years === 1 ? '' : 's'} ago`;
}

const SHAPE = { 'jupiter-return': 'circle', 'saturn-return': 'square', 'uranus-opposition': 'diamond' };

function momentsSection(chart, now = new Date()) {
  const all = lifeMoments(chart);
  const [box, body] = section('moments', '03', 'Your big life moments',
    'The slow planets take years to travel around the sky. When one comes back to where it was when you were born (a return), or reaches the opposite side (an opposition), astrologers see a turning point in your life. These are your real dates.');
  if (!all.length) return box;

  // Only number a moment if it happens more than once (1st, 2nd Saturn return).
  const howMany = (id) => all.filter((m) => m.id === id).length;
  const nameOf = (m) => (howMany(m.id) > 1 ? `${ordinal(m.number)} ${MOMENT_TEXT[m.id].name}` : MOMENT_TEXT[m.id].name);
  let nextIndex = all.findIndex((m) => m.end >= now);
  if (nextIndex < 0) nextIndex = all.length - 1;

  // The lifeline: birth to 90, a mark for every moment (one shape per
  // kind) and a line for today. Each mark is a button.
  const born = new Date(chart.utc).getTime();
  const untilAge = 90;
  const at = (date) => `${Math.min(100, Math.max(0, ((date - born) / (365.25 * 86400000) / untilAge) * 100))}%`;
  const figure = make('figure', 'lifeline');
  const track = make('div', 'lifeline-track');
  const lived = make('span', 'lifeline-lived');
  lived.style.width = at(now);
  track.append(lived);
  for (let age = 0; age <= untilAge; age += 10) {
    const tick = make('span', `lifeline-tick${age % 20 ? ' odd' : ''}`, String(age));
    tick.style.left = `${(age / untilAge) * 100}%`;
    track.append(tick);
  }
  const today = make('span', 'lifeline-now', 'You, now');
  today.style.left = at(now);
  track.append(today);
  const marks = all.map((m, i) => {
    const mark = make('button', `lifeline-mark ${SHAPE[m.id]}${m.end < now ? ' past' : ''}`);
    mark.type = 'button';
    mark.style.left = at(m.start);
    mark.style.setProperty('--i', i);
    mark.setAttribute('aria-label', `${nameOf(m)}, ${datesOf(m)}`);
    track.append(mark);
    return mark;
  });
  figure.append(track);
  const key = make('figcaption', 'lifeline-key');
  for (const id of Object.keys(SHAPE)) {
    const item = make('span');
    item.append(make('span', `lifeline-shape ${SHAPE[id]}`), MOMENT_TEXT[id].name);
    key.append(item);
  }
  key.append(make('span', 'quiet', 'Age · tap a mark'));
  figure.append(key);

  // The chosen moment, told in full (your next one at first), with
  // buttons to step to the one before or after.
  const feature = make('article', 'moment-feature');
  feature.setAttribute('aria-live', 'polite');
  const prev = make('button', 'moment-step', '← Earlier');
  const next = make('button', 'moment-step', 'Later →');
  prev.type = 'button';
  next.type = 'button';
  const steps = make('div', 'moment-steps');
  steps.append(prev, next);
  let current = nextIndex;

  const show = (i) => {
    current = i;
    const m = all[i];
    const past = m.end < now;
    const label = i === nextIndex && !past ? 'Your next big moment' : past ? 'Already happened' : 'Coming later';
    const content = make('div', 'moment-feature-content');
    content.append(
      make('p', 'eyebrow', label),
      termed('h3', 'moment-feature-name', nameOf(m), ['planetary-return', 'opposition-moment']),
      make('p', 'moment-feature-when', `${datesOf(m)} · ${ageOf(m)} · ${past ? ago(m.end, now) : fromNow(m.start, now)}`),
      make('p', '', MOMENT_TEXT[m.id].what),
    );
    // Jupiter and Saturn come back to the sign they were in when you
    // were born, so that sign says what this return is about for you.
    const natal = chart.bodies.find((b) => b.name === m.body);
    const theme = RETURN_THEME[m.body]?.[natal.sign];
    if (theme && !natal.uncertain) {
      content.append(make('p', 'moment-feature-theme', `Your ${m.body} is in ${natal.sign}, so for you this one is said to be about ${theme}.`));
    }
    feature.replaceChildren(content, steps);
    setUpGlossary(feature);
    prev.disabled = i === 0;
    next.disabled = i === all.length - 1;
  };
  prev.addEventListener('click', () => marks[current - 1]?.click());
  next.addEventListener('click', () => marks[current + 1]?.click());

  body.append(figure, feature);
  choosable(marks, show, nextIndex);
  return box;
}

// --- Putting them on the page -------------------------------------------

export function addPersonalSections(chart, before) {
  // Each section draws itself in once, when you scroll to it.
  const watcher = 'IntersectionObserver' in window ? new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) { e.target.classList.add('shown'); watcher.unobserve(e.target); }
    }
  }, { threshold: 0.2 }) : null;
  for (const build of [elementsSection, moonSection, momentsSection]) {
    const box = build(chart);
    before.before(box);
    if (watcher) watcher.observe(box); else box.classList.add('shown');
  }
}
