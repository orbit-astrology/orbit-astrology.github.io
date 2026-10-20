// explore.js
// ---------------------------------------------------------------
// Explore has two views on one page:
//   - the home: five topics, the astrology library, the playground
//   - one topic, when the address ends in #identity, #love, etc.
// Switching between them uses the part of the address after "#",
// so the browser's Back button works as expected.
// ---------------------------------------------------------------

import { calculateChart } from '../astro/chart.js?v=202610201912';
import { setUpGlossary, termButton } from '../glossary.js?v=202610201912';
import { setUpMenu, showSampleBanner } from '../layout.js?v=202610201912';
import { loadBirth, saveBirth, SAMPLE_BIRTH } from '../store.js?v=202610201912';
import { saveButton } from '../save-button.js?v=202610201912';
import { setUpPlayground } from '../playground.js?v=202610201912';
import { TOPICS, topicById } from '../content/topics.js?v=202610201912';
import { PLANETS, PLANET_DETAIL, SIGNS, SIGN_DETAIL, HOUSES, ASPECT_TEXT, SIGN_TRAITS } from '../content/basics.js?v=202610201912';
import { placements, connections, degreeText, ordinal, orList, houseText } from '../readings.js?v=202610201912';

const $ = (id) => document.getElementById(id);
const make = (tag, className, text) => {
  const n = document.createElement(tag);
  if (className) n.className = className;
  if (text !== undefined) n.textContent = text;
  return n;
};

setUpMenu();

// The chart is optional here: the library and playground work without one.
const birth = loadBirth();
showSampleBanner(birth);
const result = birth ? calculateChart(birth) : null;
const chart = result?.status === 'ok' ? result.chart : null;
const all = chart ? placements(chart) : [];
const byId = Object.fromEntries(all.map((p) => [p.id, p]));

// --- Topic list ---------------------------------------------------------

for (const t of TOPICS) {
  const li = make('li');
  const a = make('a', 'topic-link');
  a.href = `#${t.id}`;
  const dot = make('span', 'topic-dot');
  dot.style.background = t.dot;
  dot.setAttribute('aria-hidden', 'true');
  const go = make('span', 'topic-go');
  const arrow = make('span', '', '→');
  arrow.setAttribute('aria-hidden', 'true');
  go.append('Explore ', arrow);
  a.append(make('span', 'topic-num', t.number), dot, make('span', 'topic-name', t.name), make('span', 'topic-ask', t.question), go);
  li.append(a);
  $('topic-list').append(li);
}
if (!chart) $('no-chart-note').hidden = false;
$('try-sample').addEventListener('click', (e) => {
  e.preventDefault();
  saveBirth(SAMPLE_BIRTH);
  location.reload();
});

// --- Library --------------------------------------------------------------

function librarySection(name, sub, items) {
  const details = make('details');
  const summary = make('summary');
  summary.append(make('span', 'lib-name', name), make('span', 'lib-sub', sub));
  const grid = make('div', 'lib-items');
  for (const item of items) {
    const box = make('div', 'lib-item');
    const h3 = make('h3');
    if (item.symbol) h3.append(make('span', 'symbol', item.symbol + '︎'));
    h3.append(item.title);
    box.append(h3, make('p', '', item.text));
    if (item.yours) box.append(make('span', 'yours', item.yours));
    grid.append(box);
  }
  details.append(summary, grid);
  return details;
}

const planetItems = Object.keys(PLANETS).map((id) => {
  const p = byId[id];
  return {
    symbol: PLANETS[id].symbol, title: id[0].toUpperCase() + id.slice(1), text: PLANET_DETAIL[id],
    yours: p ? `Yours: ${p.uncertain ? orList(p.possibleSigns) : p.sign}${p.house ? `, ${houseText(p)}` : ''}` : null,
  };
});
const signItems = Object.keys(SIGNS).map((sign) => {
  const mine = all.filter((p) => p.kind === 'planet' && !p.uncertain && p.sign === sign).map((p) => p.name);
  return { symbol: SIGNS[sign].symbol, title: sign, text: `${SIGN_DETAIL[sign]} In a chart it means acting ${SIGNS[sign].how}.`, yours: mine.length ? `Your planets here: ${mine.join(', ')}` : null };
});
const houseItems = Object.entries(HOUSES).map(([n, text]) => {
  const mine = all.filter((p) => p.kind === 'planet' && p.house === Number(n)).map((p) => p.name);
  return { title: `${ordinal(Number(n))} house`, text: `The area of ${text}.`, yours: mine.length ? `Your planets here: ${mine.join(', ')}` : null };
});
const aspectItems = Object.values(ASPECT_TEXT).map((a) => ({
  title: `${a.name[0].toUpperCase() + a.name.slice(1)} · ${a.angle}°`,
  text: `Two planets ${a.plain}: ${a.meaning}.`,
}));

$('library-sections').append(
  librarySection('The planets', 'The what: 10 parts of you', planetItems),
  librarySection('The signs', 'The how: 12 styles', signItems),
  librarySection('The houses', 'The where: 12 areas of life', houseItems),
  librarySection('The aspects', 'How planets talk to each other', aspectItems),
);

// --- Playground -------------------------------------------------------------

setUpPlayground($('playground-wheel'), $('playground-readout'));

// --- One topic --------------------------------------------------------------

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
  else meta.append(degreeText(p.degree));
  if (p.kind === 'planet' && p.house) meta.append(' · ', termButton('house', houseText(p)));
  head.append(meta);

  const body = make('div', 'topic-item-body');
  if (p.uncertain) {
    const why = chart.timeKnown ? 'your birth time is approximate, and it changes sign within that window' : 'it changed sign on the day you were born';
    body.append(make('p', 'lens', `Your ${p.name} could be in ${orList(p.possibleSigns)}, because ${why}.`));
    for (const sign of p.possibleSigns) body.append(make('p', '', `If it’s ${sign}: ${item.lens({ ...p, sign })}`));
  } else {
    body.append(make('p', 'lens', item.lens(p)));
    if (p.kind === 'planet' && p.house) {
      body.append(make('p', 'quiet', p.houseUncertain
        ? `Your birth time is approximate, so it could sit in your ${houseText(p)}: ${p.possibleHouses.map((h) => HOUSES[h]).join(', or ')}.`
        : `It sits in your ${ordinal(p.house)} house, so this shows up most in the area of ${HOUSES[p.house]}.`));
    }
  }
  const link = make('a', 'text-link', 'Read the full explanation in My Chart →');
  link.href = `chart.html#${p.id}`;
  body.append(link);
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
  body.append(make('p', 'quiet', `This area of your life starts in ${sign}, so it has a ${SIGN_TRAITS[sign]} feel.`));
  body.append(make('p', '', inside.length
    ? `Planets here: ${inside.map((p) => p.name).join(', ')}. Having planets in a house puts extra focus on that area of life.`
    : 'No planets here. That’s very common and doesn’t mean this area is empty in your life: the sign it starts in still describes it.'));
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
  $('topic-number').textContent = `${t.number} · Explore`;
  $('topic-title').textContent = t.name;
  $('topic-question').textContent = t.question;
  $('topic-intro').textContent = t.intro;
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
