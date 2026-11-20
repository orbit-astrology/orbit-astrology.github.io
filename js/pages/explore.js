// explore.js
// ---------------------------------------------------------------
// Explore has two views on one page:
//   - the home: five topics
//   - one topic, when the address ends in #identity, #love, etc.
// Switching between them uses the part of the address after "#",
// so the browser's Back button works as expected.
// ---------------------------------------------------------------

import { calculateChart } from '../astro/chart.js?v=202611202105';
import { setUpGlossary, termButton } from '../glossary.js?v=202611202105';
import { setUpMenu, showSampleBanner } from '../layout.js?v=202611202105';
import { loadBirth, saveBirth, SAMPLE_BIRTH } from '../store.js?v=202611202105';
import { saveButton } from '../save-button.js?v=202611202105';
import { addPersonalSections } from '../personal-sections.js?v=202611202105';
import { TOPICS, topicById } from '../content/topics.js?v=202611202105';
import { STRENGTH, WATCH } from '../content/topic-texts.js?v=202611202105';
import { HOUSES } from '../content/basics.js?v=202611202105';
import { placements, connections, ordinal, orList, houseText } from '../readings.js?v=202611202105';

const $ = (id) => document.getElementById(id);
const make = (tag, className, text) => {
  const n = document.createElement(tag);
  if (className) n.className = className;
  if (text !== undefined) n.textContent = text;
  return n;
};

setUpMenu();

// Without a chart, the page explains how to make one (topics need it).
const birth = loadBirth();
showSampleBanner(birth);
const result = birth ? calculateChart(birth) : null;
const chart = result?.status === 'ok' ? result.chart : null;
const all = chart ? placements(chart) : [];
const byId = Object.fromEntries(all.map((p) => [p.id, p]));

// --- Topic list ---------------------------------------------------------

// Each topic is one row: its name, and the parts of YOUR chart it's
// built from (e.g. "Your Venus in Leo, Mars in Cancer and 7th house"),
// so you can see it comes from what you've already read.
function partsOf(t) {
  const parts = [];
  for (const item of t.items) {
    if (item.type === 'placement') {
      const p = byId[item.id];
      if (!chart) parts.push(item.id === 'rising' ? 'Rising sign' : item.id[0].toUpperCase() + item.id.slice(1));
      else if (p) parts.push(`${p.short} in ${p.uncertain ? orList(p.possibleSigns) : p.sign}`);
    } else if (item.type === 'house' && (!chart || chart.houses)) {
      parts.push(`${ordinal(item.number)} house`);
    }
  }
  if (parts.length === 0) return '';
  const list = parts.length === 1 ? parts[0] : `${parts.slice(0, -1).join(', ')} and ${parts.at(-1)}`;
  return chart ? `Your ${list}` : list;
}

for (const t of TOPICS) {
  const li = make('li');
  const a = make('a', 'topic-link');
  a.href = `#${t.id}`;
  const go = make('span', 'topic-go', '→');
  go.setAttribute('aria-hidden', 'true');
  a.append(make('span', 'topic-name', t.name), make('span', 'topic-parts', partsOf(t)), go);
  li.append(a);
  $('topic-list').append(li);
}
if (!chart) $('no-chart-note').hidden = false;

// --- About you: elements, birth Moon, big life moments --------------------
// Under the topics (js/personal-sections.js). Only with a real chart.
if (chart) addPersonalSections(chart, document.querySelector('#hub .next-step'));
$('try-sample').addEventListener('click', (e) => {
  e.preventDefault();
  saveBirth(SAMPLE_BIRTH);
  location.reload();
});

// --- One topic --------------------------------------------------------------

// The sign of one of your placements, or null if it isn't certain.
const certainSign = (id) => (byId[id] && !byId[id].uncertain ? byId[id].sign : null);
// The sign a house starts in, or null without a birth time.
const houseSign = (n) => chart?.houses?.[n - 1]?.sign ?? null;

// "Putting it together": the topic's short sentences, skipping any
// part that needs a birth time you haven't given.
function together(t) {
  return t.together(certainSign, houseSign).filter(Boolean).join(' ');
}

function itemBox(head, body) {
  const box = make('article', 'topic-item');
  box.append(head, body);
  return box;
}

function placementItem(item) {
  const p = byId[item.id];
  if (!p) return null; // e.g. Rising or Midheaven without a birth time
  const head = make('div', 'topic-item-head');
  if (p.symbol) head.append(make('span', 'symbol', p.symbol + '︎'));
  head.append(make('p', 'eyebrow', `${p.short} · ${p.what}`));
  head.append(make('h2', 'topic-item-title', `${p.short} in ${p.uncertain ? orList(p.possibleSigns) : p.sign}`));
  const meta = make('p', 'topic-item-meta');
  if (p.uncertain) meta.append('Depends on your birth time · ', termButton(chart.timeKnown ? 'approximate-time' : 'unknown-time', 'why?'));
  if (p.kind === 'planet' && p.house) {
    if (meta.childNodes.length) meta.append(' · ');
    meta.append(termButton('house', houseText(p)));
  }
  head.append(meta);

  const body = make('div', 'topic-item-body');
  if (p.uncertain) {
    const why = chart.timeKnown ? 'your birth time is approximate, and it changes sign within that window' : 'it changed sign on the day you were born';
    body.append(make('p', 'lens', `Your ${p.name} could be in ${orList(p.possibleSigns)}, because ${why}.`));
    for (const sign of p.possibleSigns) body.append(make('p', '', `If it’s ${sign}: ${item.lens({ ...p, sign })}`));
  } else {
    // Only what's new for this topic: you've just read the rest in My Chart.
    body.append(make('p', 'lens', item.lens(p)));
    if (item.more) {
      const text = item.more(p, certainSign);
      if (text) body.append(make('p', '', text));
    }
    if (item.sides) {
      const strength = make('p', 'side');
      strength.append(make('strong', '', 'Strength: '), STRENGTH[p.sign] + '.');
      const watch = make('p', 'side');
      watch.append(make('strong', '', 'Watch out for: '), WATCH[p.sign] + '.');
      body.append(strength, watch);
    }
  }
  return itemBox(head, body);
}

function houseItem(item) {
  if (!chart?.houses) return null;
  const sign = chart.houses[item.number - 1].sign;
  const inside = all.filter((p) => p.kind === 'planet' && p.house === item.number);
  const head = make('div', 'topic-item-head');
  head.append(make('p', 'eyebrow', `${ordinal(item.number)} house · ${HOUSES[item.number]}`));
  head.append(make('h2', 'topic-item-title', `${ordinal(item.number)} house in ${sign}`));

  const body = make('div', 'topic-item-body');
  body.append(make('p', 'lens', item.lens(sign)));
  // Planets inside the house add extra focus. (No planets is common
  // and means nothing special, so then there's nothing to add.)
  if (inside.length) body.append(make('p', '', `Planets here: ${inside.map((p) => p.name).join(', ')}. Having planets in a house puts extra focus on that area of your life.`));
  return itemBox(head, body);
}

function aspectsItem(item) {
  let list = [];
  if (item.tense) {
    list = chart.aspects
      .filter((a) => a.type === 'square' || a.type === 'opposition')
      .slice(0, 3)
      .map((a) => connections(chart, a.from).find((c) => c.id === a.id));
  } else {
    const seen = new Set();
    for (const id of item.of) {
      for (const c of connections(chart, id)) {
        if (!seen.has(c.id)) { seen.add(c.id); list.push(c); }
      }
    }
  }
  const head = make('div', 'topic-item-head');
  head.append(make('p', 'eyebrow', 'Connections'));
  head.append(make('h2', 'topic-item-title', item.title));

  const body = make('div', 'topic-item-body');
  body.append(make('p', '', item.intro));
  if (list.length) {
    const ul = make('ul');
    for (const c of list) {
      const li = make('li');
      li.append(make('strong', '', c.title), ' · ', c.text);
      if (c.uncertain) li.append(' ', make('span', 'quiet', '(might not apply: depends on your birth time)'));
      ul.append(li);
    }
    body.append(ul);
  } else {
    body.append(make('p', 'quiet', 'None of your planets make close angles here. That’s fine: it just means these parts of you work more independently.'));
  }
  return itemBox(head, body);
}

function showTopic(t) {
  $('hub').hidden = true;
  $('topic').hidden = false;
  document.title = `${t.name} · Explore · ORBIT`;
  document.body.style.setProperty('--topic', t.dot);
  $('topic-title').textContent = t.name;
  $('topic-together').textContent = chart ? together(t) : '';
  // Save this topic to your Profile (only with your own chart).
  $('topic-save').replaceChildren(chart && !birth.isSample ? saveButton({ kind: 'topic', id: t.id, title: t.name }) : '');

  const items = $('topic-items');
  items.replaceChildren();
  const note = $('topic-time-note');
  note.hidden = true;

  if (!chart) {
    const p = make('p', 'lede');
    p.append('This topic uses your birth chart. ');
    const a = make('a', '', 'Create your chart');
    a.href = 'index.html#create';
    p.append(a, ' first, or go back and try the sample chart.');
    items.append(p);
  } else {
    let skipped = false;
    for (const item of t.items) {
      const box = item.type === 'placement' ? placementItem(item)
        : item.type === 'house' ? houseItem(item)
          : aspectsItem(item);
      if (box) items.append(box); else skipped = true;
    }
    if (skipped) {
      note.hidden = false;
      note.replaceChildren('Some parts of this topic (the houses, Rising sign or Midheaven) need your exact birth time, so they’re not shown. ', termButton('unknown-time', 'Why?'));
    }
  }

  const nav = $('topic-nav');
  nav.replaceChildren();
  for (const other of TOPICS.filter((x) => x.id !== t.id)) {
    const a = make('a');
    a.href = `#${other.id}`;
    const dot = make('span', 'topic-dot');
    dot.style.background = other.dot;
    a.append(dot, other.name);
    nav.append(a);
  }

  setUpGlossary();
  window.scrollTo(0, 0);
  $('topic-title').setAttribute('tabindex', '-1');
  $('topic-title').focus({ preventScroll: true });
}

function showHub() {
  $('topic').hidden = true;
  $('hub').hidden = false;
  document.title = 'Explore · ORBIT';
}

function route() {
  const id = location.hash.slice(1);
  if (topicById[id]) showTopic(topicById[id]);
  else {
    showHub();
    if (id && $(id)) $(id).scrollIntoView();
  }
}
window.addEventListener('hashchange', route);
route();
setUpGlossary();
