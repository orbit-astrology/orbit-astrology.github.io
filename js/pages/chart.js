// chart.js
// ---------------------------------------------------------------
// My Chart: the interactive birth chart (carta astral).
//
//   1. calculate the chart from the saved birth details
//   2. draw the wheel, and make every part of it explain itself
//      when you hover, focus (keyboard) or tap it
//   3. offer a List view for people who prefer a table
//   4. write "Your chart, explained": one section per placement
// ---------------------------------------------------------------

import { calculateChart } from '../astro/chart.js?v=202611121743';
import { formatOffset } from '../astro/time.js?v=202611121743';
import { drawWheel } from '../wheel.js?v=202611121743';
import { placeTip } from '../tip-position.js?v=202611121743';
import { setUpGlossary, termButton } from '../glossary.js?v=202611121743';
import { setUpMenu, showSampleBanner } from '../layout.js?v=202611121743';
import { loadBirth } from '../store.js?v=202611121743';
import { saveButton } from '../save-button.js?v=202611121743';
import { runTour } from '../tour.js?v=202611121743';
import { SIGNS, SIGN_DETAIL, HOUSES } from '../content/basics.js?v=202611121743';
import { placements, reading, grammar, connections, degreeText, ordinal, orList, houseText } from '../readings.js?v=202611121743';

const $ = (id) => document.getElementById(id);
const make = (tag, className, text) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
};
const capital = (t) => t[0].toUpperCase() + t.slice(1);

setUpMenu();

// --- 1. The chart ----------------------------------------------------

const birth = loadBirth();
if (!birth) {
  window.location.replace('index.html');
  throw new Error('No birth details saved yet');
}
showSampleBanner(birth);

const result = calculateChart(birth);
if (result.status !== 'ok') {
  window.location.replace('index.html#create');
  throw new Error('Chart could not be calculated');
}
const chart = result.chart;
const all = placements(chart);
const byId = Object.fromEntries(all.map((p) => [p.id, p]));
const signLabel = (p) => (p.uncertain ? orList(p.possibleSigns) : p.sign);
// Which explanation fits: no birth time at all, or an approximate one.
const timeTerm = chart.timeKnown ? 'approximate-time' : 'unknown-time';

// --- 2. The wheel ----------------------------------------------------

const summary = all.map((p) => `${p.name} in ${signLabel(p)}`).join(', ');
const svg = drawWheel(chart, { hoverAreas: true, label: `Your birth chart wheel: ${summary}.` });
$('wheel-box').append(svg);

const tip = $('tip');
const area = $('wheel-area');
let tipOwner = null;     // the thing the explanation box is currently about
let lastPointer = 'mouse';
let tipBeforeTap = null; // what the box showed just before a tap (phones)
let tapped = null;       // the sign or house whose box was opened by the last tap or click
area.addEventListener('pointerdown', (e) => { lastPointer = e.pointerType; tipBeforeTap = tipOwner; }, true);
// On phones there's no "mouse leaving", so the box closes when you tap
// anywhere outside the wheel instead.
document.addEventListener('pointerdown', (e) => {
  if (e.pointerType === 'touch' && !area.contains(e.target)) { hideTip(); unfocus(); }
});

// What the box says for each kind of thing on the wheel.
function planetTip(p) {
  const meta = [degreeText(p.degree)];
  if (p.house) meta.push(houseText(p));
  if (p.retrograde) meta.push('retrograde');
  const how = p.uncertain ? 'depends on your birth time' : SIGNS[p.sign].how;
  return {
    title: `${p.name} in ${signLabel(p)}`,
    meta: p.uncertain ? 'Depends on your birth time' : meta.join(' · '),
    text: `${capital(p.what)}: ${how}.`,
    // Say WHAT to click: the box itself disappears when the mouse moves to it.
    action: lastPointer === 'touch'
      ? `Tap the ${p.name} symbol again to read its full explanation ↓`
      : `Click the ${p.name} symbol on the wheel to read its full explanation ↓`,
  };
}

function signTip(sign) {
  const here = all.filter((p) => p.kind === 'planet' && !p.uncertain && p.sign === sign).map((p) => p.name);
  return {
    title: sign,
    meta: 'Signs describe how',
    text: SIGN_DETAIL[sign],
    action: here.length ? `Your planets here: ${here.join(', ')}` : 'None of your planets are in this sign.',
  };
}

function houseTip(n) {
  const here = all.filter((p) => p.kind === 'planet' && p.house === n).map((p) => p.name);
  return {
    title: `${ordinal(n)} house`,
    meta: 'Houses describe where',
    text: `The area of ${HOUSES[n]}.`,
    action: here.length ? `Your planets here: ${here.join(', ')}` : 'None of your planets are in this house.',
  };
}

function angleTip(id) {
  const p = byId[id];
  return id === 'rising'
    ? { title: `Rising sign: ${signLabel(p)}`, meta: 'ASC, the Ascendant', text: 'The sign coming up over the horizon when you were born: how you come across.', action: 'Click to read more ↓' }
    : { title: `Midheaven: ${signLabel(p)}`, meta: 'MC, the top of the chart', text: 'Linked to your direction in life and how you want to be seen.', action: 'Click to read more ↓' };
}

function showTip(owner, content) {
  tipOwner = owner;
  tip.replaceChildren(
    make('h3', '', content.title),
    make('p', 'tip-meta', content.meta),
    make('p', '', content.text),
    make('p', 'tip-action', content.action),
  );
  tip.hidden = false;
  placeTip(tip, owner, svg, area); // beside the wheel, never on top of it
}

function hideTip() {
  tip.hidden = true;
  tipOwner = null;
  tapped = null;
}

// Light up a planet and every line (aspect) connected to it.
function focusPlanet(id) {
  svg.classList.add('focusing');
  const connected = new Set([id]);
  for (const line of svg.querySelectorAll('.aspect')) {
    const on = line.dataset.from === id || line.dataset.to === id;
    line.classList.toggle('lit', on);
    if (on) { connected.add(line.dataset.from); connected.add(line.dataset.to); }
  }
  for (const g of svg.querySelectorAll('.planet')) g.classList.toggle('lit', connected.has(g.dataset.body));
}
function unfocus() {
  svg.classList.remove('focusing');
  svg.querySelectorAll('.lit').forEach((n) => n.classList.remove('lit'));
}

// Jump down to a placement's explanation and briefly highlight it.
// Opens (or closes) the rest of a reading: the "Read more" part.
function openReading(section, open) {
  const more = section.querySelector('.reading-more');
  const toggle = section.querySelector('.read-more');
  if (!more || !toggle) return;
  more.hidden = !open;
  toggle.textContent = open ? 'Show less' : 'Read more';
  toggle.setAttribute('aria-expanded', String(open));
}

function goToReading(id) {
  const section = $(id);
  if (!section) return;
  openReading(section, true); // coming from the wheel: show the whole reading
  section.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
  section.classList.add('flash');
  setTimeout(() => section.classList.remove('flash'), 1600);
  section.querySelector('h3')?.focus({ preventScroll: true });
}

// Planets: hover/focus shows the box, click/Enter jumps to the reading.
for (const g of svg.querySelectorAll('.planet')) {
  const p = byId[g.dataset.body];
  g.setAttribute('tabindex', '0');
  g.setAttribute('role', 'button');
  g.setAttribute('aria-label', `${p.name} in ${signLabel(p)}, ${p.uncertain ? '' : `${Math.floor(p.degree)} degrees`}${p.house ? `, ${houseText(p)}` : ''}. Open its explanation.`);
  const enter = () => { showTip(g, planetTip(p)); focusPlanet(p.id); };
  const leave = () => { if (lastPointer === 'touch') return; hideTip(); unfocus(); };
  g.addEventListener('mouseenter', enter);
  g.addEventListener('mouseleave', leave);
  g.addEventListener('focus', enter);
  g.addEventListener('blur', leave);
  const open = () => {
    svg.querySelectorAll('.planet.active').forEach((x) => x.classList.remove('active'));
    g.classList.add('active');
    goToReading(p.id);
  };
  g.addEventListener('click', () => {
    // On a phone, the first tap shows the box; the second tap opens the reading.
    if (lastPointer === 'touch' && tipBeforeTap !== g) { enter(); return; }
    open();
  });
  g.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
  });
}

// Signs, houses and the ASC/MC labels: hover or tap to see what they are.
function hoverable(node, content) {
  node.addEventListener('mouseenter', () => showTip(node, content()));
  node.addEventListener('mouseleave', () => { if (lastPointer !== 'touch') hideTip(); });
  node.addEventListener('click', () => {
    // A tap or click opens the box; doing it again on the same thing closes it.
    if (tapped === node) { hideTip(); return; }
    showTip(node, content());
    tapped = node;
  });
}
svg.querySelectorAll('[data-sign]').forEach((n) => hoverable(n, () => signTip(n.dataset.sign)));
svg.querySelectorAll('[data-house]').forEach((n) => hoverable(n, () => houseTip(Number(n.dataset.house))));
svg.querySelectorAll('[data-angle]').forEach((n) => {
  hoverable(n, () => angleTip(n.dataset.angle));
  n.addEventListener('dblclick', () => goToReading(n.dataset.angle));
});

document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { hideTip(); unfocus(); } });

// No birth time: explain what's missing and why.
if (!chart.timeKnown) {
  $('how-houses').hidden = true;
  $('how-angles').hidden = true;
  const note = $('time-note');
  note.hidden = false;
  note.append('Without a birth time, the wheel shows your planets but no houses, Rising sign or Midheaven: these change every few hours. ', termButton('unknown-time', 'Why?'));
}

// --- 3. List view ------------------------------------------------------

const body = $('list-body');
for (const p of all) {
  const tr = document.createElement('tr');
  const nameCell = make('td');
  if (p.symbol) nameCell.append(make('span', 'symbol', p.symbol + '︎'));
  nameCell.append(p.name);
  const link = make('a', 'text-link', 'Explained ↓');
  link.href = `#${p.id}`;
  const linkCell = make('td');
  linkCell.append(link);
  tr.append(
    nameCell,
    make('td', 'quiet', capital(p.what)),
    make('td', '', p.uncertain ? `${signLabel(p)} (depends on birth time)` : `${p.sign} ${Math.floor(p.degree)}°`),
    make('td', '', p.houseUncertain ? `${houseText(p)} (approximate time)` : p.house ? `${ordinal(p.house)} · ${HOUSES[p.house]}` : '–'),
    linkCell,
  );
  body.append(tr);
}

function setView(list) {
  $('show-wheel').setAttribute('aria-pressed', String(!list));
  $('show-list').setAttribute('aria-pressed', String(list));
  $('wheel-area').hidden = list;
  $('list-area').hidden = !list;
  hideTip();
}
$('show-wheel').addEventListener('click', () => setView(false));
$('show-list').addEventListener('click', () => setView(true));

// --- 4. Your chart, explained -----------------------------------------

const jump = $('jump-links');
const readings = $('readings');



for (const p of all) {
  // Quick link
  const li = make('li');
  const a = make('a', '', p.short);
  a.href = `#${p.id}`;
  li.append(a);
  jump.append(li);

  // The section
  const section = make('article', 'reading');
  section.id = p.id;

  const head = make('div', 'reading-head');
  if (p.symbol) head.append(make('span', 'symbol', p.symbol + '︎'));
  head.append(make('p', 'eyebrow', `${p.short} · ${p.what}`));
  const h3 = make('h3', 'reading-title', `${p.short} in ${signLabel(p)}`);
  h3.tabIndex = -1;
  head.append(h3);
  const meta = make('p', 'reading-meta');
  if (!p.uncertain) meta.append(termButton('degree', `${Math.floor(p.degree)}°`), ` (${degreeText(p.degree).split('(')[1]}`);
  if (p.kind === 'planet' && p.house) meta.append(' · ', termButton('house', houseText(p)));
  if (p.houseUncertain) meta.append(' · ', termButton('approximate-time', 'approximate time'));
  if (p.retrograde) meta.append(' · ', termButton('retrograde', 'retrograde'));
  if (p.uncertain) meta.append('Depends on your birth time · ', termButton(timeTerm, 'why?'));
  head.append(meta);
  // Save this reading to your Profile (not for the made-up sample).
  if (!birth.isSample) {
    head.append(saveButton({ kind: 'placement', id: p.id, title: `${p.short} in ${signLabel(p)}`, sign: signLabel(p) }));
  }

  const body = make('div', 'reading-body');
  const pieces = grammar(p);
  if (pieces) {
    const g = make('p', 'grammar');
    for (const piece of pieces) {
      if (!piece.role) { g.append(piece.text); continue; }
      g.append(make('span', 'role', piece.text), ' ', make('span', 'note', `(${piece.note})`));
    }
    body.append(g);
  }
  // Only the first paragraph shows at first. "Read more" opens the rest
  // right here on the page, so the list of planets stays short.
  const texts = reading(chart, p);
  body.append(make('p', '', texts[0]));
  const more = make('div', 'reading-more');
  more.id = `${p.id}-more`;
  more.hidden = true;
  for (const text of texts.slice(1)) more.append(make('p', '', text));

  if (p.kind === 'planet') {
    const links = connections(chart, p.id);
    if (links.length) {
      const title = make('h4', 'connections-title');
      title.append('How it connects to the rest of your chart (', termButton('aspect', 'aspects'), ')');
      const ul = make('ul', 'connections-list');
      for (const c of links) {
        const item = make('li');
        item.append(make('strong', '', c.title), ' · ', c.text);
        if (c.uncertain) item.append(' ', make('span', 'maybe', '(might not apply: depends on your birth time)'));
        ul.append(item);
      }
      more.append(title, ul);
    }
  }

  const back = make('a', 'back-to-wheel', '↑ Back to the wheel');
  back.href = '#main';
  more.append(back);

  const toggle = make('button', 'link-button read-more', 'Read more');
  toggle.type = 'button';
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-controls', more.id);
  toggle.addEventListener('click', () => openReading(section, more.hidden));
  // The button sits after the hidden part, so it's always at the end.
  body.append(more, toggle);

  section.append(head, body);
  readings.append(section);
}

// --- How we know this: once, for the whole chart --------------------
// The same steps for every planet, so they're shown once at the end
// instead of under each reading.

const dateText = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
  .format(new Date(Date.UTC(birth.year, birth.month - 1, birth.day)));
const pad = (n) => String(n).padStart(2, '0');
const who = birth.isSample ? `${birth.name} was` : 'You were';
const steps = chart.timeKnown
  ? [
    `${who} born on ${dateText} at ${pad(birth.hour)}:${pad(birth.minute)} in ${birth.place.label}.`,
    `On that date the clocks there were at ${formatOffset(chart.offsetMinutes)}, so the exact moment was ${chart.utc.slice(11, 16)} in world time (UTC).`,
  ]
  : [
    `${who} born on ${dateText} in ${birth.place.label}, time unknown.`,
    'Without a time, ORBIT checked the whole day and shows positions for midday. That’s why there’s no Rising sign or houses.',
  ];
steps.push(
  'For that moment, the Astronomy Engine library calculated where the Sun, Moon and each planet were in the sky.',
  `Each sign covers 30° of the circle, so each planet’s position tells us its sign. For example, your Sun was at ${byId.sun.longitude.toFixed(1)}°, which is ${Math.floor(byId.sun.degree)}° into ${byId.sun.sign}.`,
);
if (chart.houses) steps.push('Your birth time and place give the Rising sign and where each of the 12 houses starts.');
const ol = $('how-we-know-steps');
for (const step of steps) ol.append(make('li', '', step));

setUpGlossary();

// Arriving from My Universe with a link like chart.html#venus.
if (location.hash && $(location.hash.slice(1))) {
  setTimeout(() => goToReading(location.hash.slice(1)), 150);
}

// --- 5. Watch your chart build, step by step (js/tour.js) -----------

function tourSteps() {
  // Each step: { intro, points: [{ label, text }] } (shown by js/tour.js)
  const steps = [
    { layers: ['signs'], title: 'The 12 signs',
      intro: 'The outer ring is the zodiac: the 12 signs. Each sign is a style or mood, how a part of you behaves.',
      points: [
        { label: 'Aries', text: 'boldly' },
        { label: 'Taurus', text: 'calmly' },
        { label: 'Gemini', text: 'curiously' },
      ] },
    { layers: ['planets'], title: 'Your planets',
      intro: 'Each gold symbol is a planet, placed where it was in the sky when you were born. Each planet is one part of you.',
      points: [
        { label: 'Sun', text: 'who you are' },
        { label: 'Moon', text: 'how you feel' },
        { label: 'Venus', text: 'how you love' },
      ] },
  ];
  if (chart.houses) {
    steps.push({ layers: ['houses'], title: 'The houses',
      intro: 'The 12 numbered slices are the houses. Each house is an area of life.',
      points: [
        { label: '4th house', text: 'home and family' },
        { label: '7th house', text: 'partners' },
        { label: '10th house', text: 'career' },
      ] });
  }
  steps.push({ layers: ['aspects'], title: 'The lines',
    intro: 'A line means two planets affect each other.',
    points: [
      { label: 'Dashed', text: 'they help each other easily', line: 'dashed' },
      { label: 'Solid', text: 'they pull against each other, which helps you grow', line: 'solid' },
    ] });
  return steps;
}

function startTour() {
  setView(false); // the tour needs the wheel
  hideTip();
  $('how-content').hidden = true;
  $('replay-tour').style.visibility = 'hidden'; // keeps its space, so nothing below moves
  // On a laptop the page stays exactly where it is. Only on phones do we
  // scroll to the wheel, because there the tour card covers the bottom.
  if (matchMedia('(max-width: 960px)').matches) {
    $('wheel-box').scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }
  runTour({
    svg,
    panel: $('tour'),
    steps: tourSteps(),
    onEnd: () => {
      $('how-content').hidden = false;
      $('replay-tour').style.visibility = '';
      $('replay-tour').focus({ preventScroll: true });
    },
  });
}

// The full chart shows straight away. The step-by-step version only
// runs when you press "Watch your chart build, step by step".
$('replay-tour').addEventListener('click', startTour);

