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

import { calculateChart } from '../astro/chart.js?v=202610112058';
import { formatOffset } from '../astro/time.js?v=202610112058';
import { drawWheel } from '../wheel.js?v=202610112058';
import { placeTip } from '../tip-position.js?v=202610112058';
import { setUpGlossary, termButton } from '../glossary.js?v=202610112058';
import { setUpMenu, showSampleBanner } from '../layout.js?v=202610112058';
import { loadBirth } from '../store.js?v=202610112058';
import { saveButton } from '../save-button.js?v=202610112058';
import { SIGNS, SIGN_DETAIL, HOUSES } from '../content/basics.js?v=202610112058';
import { placements, reading, grammar, connections, degreeText, ordinal } from '../readings.js?v=202610112058';

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
const signLabel = (p) => (p.uncertain ? p.possibleSigns.join(' or ') : p.sign);

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
  if (p.house) meta.push(`${ordinal(p.house)} house`);
  if (p.retrograde) meta.push('retrograde');
  const how = p.uncertain ? 'depends on your birth time' : SIGNS[p.sign].how;
  return {
    title: `${p.name} in ${signLabel(p)}`,
    meta: p.uncertain ? 'The Moon changed sign that day' : meta.join(' · '),
    text: `${capital(p.what)}: ${how}.`,
    action: lastPointer === 'touch' ? 'Tap again to read the full explanation ↓' : 'Click to read the full explanation ↓',
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
    ? { title: `Rising sign: ${p.sign}`, meta: 'ASC, the Ascendant', text: 'The sign coming up over the horizon when you were born: how you come across.', action: 'Click to read more ↓' }
    : { title: `Midheaven: ${p.sign}`, meta: 'MC, the top of the chart', text: 'Linked to your direction in life and how you want to be seen.', action: 'Click to read more ↓' };
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
function goToReading(id) {
  const section = $(id);
  if (!section) return;
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
  g.setAttribute('aria-label', `${p.name} in ${signLabel(p)}, ${p.uncertain ? '' : `${Math.floor(p.degree)} degrees`}${p.house ? `, ${ordinal(p.house)} house` : ''}. Open its explanation.`);
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
    make('td', '', p.house ? `${ordinal(p.house)} · ${HOUSES[p.house]}` : '–'),
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

const dateText = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
  .format(new Date(Date.UTC(birth.year, birth.month - 1, birth.day)));
const pad = (n) => String(n).padStart(2, '0');
const utcTime = chart.utc.slice(11, 16);

function howWeKnow(p) {
  const steps = [];
  if (chart.timeKnown) {
    steps.push(`${birth.isSample ? `${birth.name} was` : 'You were'} born on ${dateText} at ${pad(birth.hour)}:${pad(birth.minute)} in ${birth.place.label}.`);
    steps.push(`On that date the clocks there were at ${formatOffset(chart.offsetMinutes)}, so the exact moment was ${utcTime} in world time (UTC).`);
  } else {
    steps.push(`Born on ${dateText} in ${birth.place.label}, time unknown.`);
    steps.push('Without a time, ORBIT checked the whole day, from 00:00 to 23:59, and shows positions for midday.');
  }
  const start = SIGNS[p.sign] ? Object.keys(SIGNS).indexOf(p.sign) * 30 : 0;
  steps.push(`At that moment, ${p.kind === 'angle' ? `your ${p.name}` : p.name} was at ${p.longitude.toFixed(2)}° around the zodiac (counting from the start of Aries).`);
  if (!p.uncertain) {
    steps.push(`Each sign covers 30°. ${p.sign} runs from ${start}° to ${start + 30}°, so it was ${Math.floor(p.degree)}° into ${p.sign}.`);
  }
  if (p.kind === 'planet' && p.house && chart.houses) {
    const h = chart.houses[p.house - 1].longitude;
    const next = chart.houses[p.house % 12].longitude;
    steps.push(`Your ${ordinal(p.house)} house runs from ${h.toFixed(1)}° to ${next.toFixed(1)}°, so it falls in that house.`);
  }
  return steps;
}

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
  if (p.kind === 'planet' && p.house) meta.append(' · ', termButton('house', `${ordinal(p.house)} house`));
  if (p.retrograde) meta.append(' · ', termButton('retrograde', 'retrograde'));
  if (p.uncertain) meta.append('Depends on your birth time · ', termButton('unknown-time', 'why?'));
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
  for (const text of reading(chart, p)) body.append(make('p', '', text));

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
      body.append(title, ul);
    }
  }

  const details = make('details', 'how-we-know');
  details.append(make('summary', '', 'How we know this'));
  const ol = make('ol');
  for (const step of howWeKnow(p)) ol.append(make('li', '', step));
  details.append(ol);
  body.append(details);

  const back = make('a', 'back-to-wheel', '↑ Back to the wheel');
  back.href = '#main';
  body.append(back);

  section.append(head, body);
  readings.append(section);
}

setUpGlossary();

// Arriving from My Universe with a link like chart.html#venus.
if (location.hash && $(location.hash.slice(1))) {
  setTimeout(() => goToReading(location.hash.slice(1)), 150);
}
