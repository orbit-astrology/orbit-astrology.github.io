// connections.js
// ---------------------------------------------------------------
// The Connections page has three states:
//   1. no chart of your own yet → a link to create one
//   2. your people: the list, and a form to add someone
//   3. "You & Sam": both charts on one wheel, explained
//
// Which one shows depends on the address: connections.html shows the
// list, and connections.html#with=<id> shows the comparison. Using
// the address means the browser's Back button works as expected.
// ---------------------------------------------------------------

import { calculateChart } from '../astro/chart.js?v=202610111909';
import { drawWheel } from '../wheel.js?v=202610111909';
import { setUpGlossary, termButton } from '../glossary.js?v=202610111909';
import { setUpMenu, showSampleBanner } from '../layout.js?v=202610111909';
import { setUpBirthForm } from '../birth-form.js?v=202610111909';
import { loadBirth, loadPeople, savePeople } from '../store.js?v=202610111909';
import { compareCharts, explainLink, summarise, signText } from '../compare.js?v=202610111909';
import { PERSONAL, LENSES, LINK_TYPES, THEIR_WHAT, SAMPLE_PERSON } from '../content/connections.js?v=202610111909';
import { PLANETS, SIGNS } from '../content/basics.js?v=202610111909';

const $ = (id) => document.getElementById(id);
const nameOf = (id) => id[0].toUpperCase() + id.slice(1);

// Make an element with a class and text (text is always added as
// plain text, so a name someone types can never break the page).
function make(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

setUpMenu();
const me = loadBirth();
showSampleBanner(me);

// Your own chart, calculated fresh from your saved birth details.
const mine = me ? calculateChart(me) : null;
const myChart = mine?.status === 'ok' ? mine.chart : null;

if (!myChart) {
  $('need-chart').hidden = false;
} else {
  setUpAddForm();
  route();
  window.addEventListener('hashchange', route);
}
setUpGlossary();

// Show the list or a comparison, depending on the address.
function route() {
  const id = new URLSearchParams(location.hash.slice(1)).get('with');
  const person = id ? loadPeople().find((p) => p.id === id) : null;
  const chart = person ? calculateChart(person.birth) : null;
  const comparing = chart?.status === 'ok';
  $('people-view').hidden = comparing;
  $('compare-view').hidden = !comparing;
  if (comparing) {
    showComparison(person, chart.chart);
    window.scrollTo(0, 0);
    $('compare-title').focus({ preventScroll: true });
  } else {
    showPeople();
  }
  setUpGlossary();
}

// =====================================================================
// 2. Your people
// =====================================================================

// "Sun in Virgo · Moon in Leo · Rising Scorpio" for one person.
function bigThree(chart) {
  const body = (id) => chart.bodies.find((b) => b.id === id);
  const rising = chart.angles ? `Rising ${chart.angles.ascendant.sign}` : 'Rising unknown (no birth time)';
  return `Sun in ${signText(body('sun'))} · Moon in ${signText(body('moon'))} · ${rising}`;
}

function showPeople() {
  const people = loadPeople();
  const list = $('people-list');
  list.replaceChildren();
  $('people-empty').hidden = people.length > 0;

  for (const person of people) {
    const result = calculateChart(person.birth);
    const li = make('li', 'person');
    const main = make('div', 'person-main');
    const name = make('h3', 'person-name', person.name);
    if (person.isSample) name.append(make('span', 'person-tag', 'Made-up sample'));
    main.append(name, make('p', 'person-signs', result.status === 'ok' ? bigThree(result.chart) : 'These birth details can’t be read. Please remove and add them again.'));

    const actions = make('div', 'person-actions');
    const compare = make('a', 'button button-outline', 'Compare');
    compare.href = `#with=${encodeURIComponent(person.id)}`;
    compare.setAttribute('aria-label', `Compare your chart with ${person.name}’s`);
    const remove = make('button', 'link-button', 'Remove');
    remove.type = 'button';
    remove.setAttribute('aria-label', `Remove ${person.name}`);
    if (result.status === 'ok') actions.append(compare);
    actions.append(remove);

    // Removing asks first, right there in the list (no pop-up window).
    const confirm = make('div', 'person-confirm');
    confirm.hidden = true;
    const yes = make('button', 'button', 'Yes, remove');
    yes.type = 'button';
    const no = make('button', 'link-button', 'Cancel');
    no.type = 'button';
    confirm.append(make('p', '', `Remove ${person.name} from your people? Their birth details will be deleted from this browser.`), yes, no);

    remove.addEventListener('click', () => { actions.hidden = true; confirm.hidden = false; no.focus(); });
    no.addEventListener('click', () => { confirm.hidden = true; actions.hidden = false; remove.focus(); });
    yes.addEventListener('click', () => {
      if (!savePeople(loadPeople().filter((p) => p.id !== person.id))) return storageError();
      showPeople();
      $('people-title').focus();
    });

    li.append(main, actions, confirm);
    list.append(li);
  }
}

function storageError() {
  $('people-error').textContent = 'Your browser is blocking ORBIT from saving (this can happen in private browsing). Please allow site data and try again.';
}

$('add-sample').addEventListener('click', () => {
  const people = loadPeople().filter((p) => p.id !== SAMPLE_PERSON.id);
  if (!savePeople([...people, SAMPLE_PERSON])) return storageError();
  location.hash = `with=${SAMPLE_PERSON.id}`;
});

function setUpAddForm() {
  const form = setUpBirthForm({
    form: $('add'),
    prefix: 'friend-',
    whose: 'their',
    extraFields: ['name', 'permission'],
    check() {
      if (!$('friend-name').value.trim()) return ['Please add their name (a first name or nickname is enough).', ['name']];
      if (!$('friend-permission').checked) return ['Birth details are personal. Please check they’re happy for you to use theirs, then tick the box.', ['permission']];
      return null;
    },
    onSuccess(birth, chart, showError) {
      const person = {
        id: `p${Date.now().toString(36)}`,
        name: $('friend-name').value.trim().slice(0, 40),
        birth,
      };
      if (!savePeople([...loadPeople(), person])) {
        showError('Your browser is blocking ORBIT from saving (this can happen in private browsing). Please allow site data and try again.');
        return;
      }
      form.reset();
      location.hash = `with=${person.id}`;
    },
  });
}

// =====================================================================
// 3. You & someone
// =====================================================================

let lens = 'friendship';
try { lens = localStorage.getItem('orbit.lens') === 'romance' ? 'romance' : 'friendship'; } catch { /* keep the default */ }

let current = null; // { person, theirChart, links, svg }

function showComparison(person, theirChart) {
  const name = person.name;
  const links = compareCharts(myChart, theirChart);

  // Title and introduction
  const title = $('compare-title');
  const em = make('em', '', `& ${name}`);
  title.replaceChildren('You ', em);
  const lede = $('compare-lede');
  lede.replaceChildren(`Your chart and ${name}’s on one wheel, comparing your `, termButton('personal-planets', 'personal planets'), '.');
  const unknown = [];
  if (!myChart.timeKnown) unknown.push('your');
  if (!theirChart.timeKnown) unknown.push(`${name}’s`);
  if (unknown.length) {
    lede.append(` Because ${unknown.join(' and ')} birth time isn’t known, the Moon could be a few degrees off, so some links are marked “might not be exact”.`);
  }
  if (person.isSample) lede.append(` ${name} is a made-up person, so you can see how this page works.`);

  $('key-name').textContent = name;
  $('side-them').textContent = name;

  // The wheel: you on the outside, them on the inside.
  const svg = drawWheel(myChart, {
    aspects: false,
    houses: false,
    only: PERSONAL,
    partner: { chart: theirChart, aspects: links },
    label: `Your personal planets on the outer ring and ${name}’s on the inner ring, with ${links.length} links between them.`,
  });
  $('pair-wheel').replaceChildren(svg);

  current = { person, theirChart, links, svg };
  fillSideBySide();
  setUpWheel();
  showLens();
}

// The table: each planet's sign for both of you.
function fillSideBySide() {
  const { theirChart } = current;
  const body = $('side-body');
  body.replaceChildren();
  const row = (label, symbol, you, them) => {
    const tr = document.createElement('tr');
    const th = make('th', '');
    th.scope = 'row';
    if (symbol) th.append(make('span', 'symbol', symbol));
    th.append(label);
    tr.append(th, make('td', '', you), make('td', '', them));
    body.append(tr);
  };
  const sign = (chart, id) => signText(chart.bodies.find((b) => b.id === id));
  const rising = (chart) => (chart.angles ? chart.angles.ascendant.sign : 'Needs a birth time');
  row('Sun', PLANETS.sun.symbol, sign(myChart, 'sun'), sign(theirChart, 'sun'));
  row('Moon', PLANETS.moon.symbol, sign(myChart, 'moon'), sign(theirChart, 'moon'));
  row('Rising', '', rising(myChart), rising(theirChart));
  for (const id of ['mercury', 'venus', 'mars']) row(nameOf(id), PLANETS[id].symbol, sign(myChart, id), sign(theirChart, id));
}

// --- Friendship / Romance ----------------------------------------------

for (const button of document.querySelectorAll('[data-lens]')) {
  button.addEventListener('click', () => {
    lens = button.dataset.lens;
    try { localStorage.setItem('orbit.lens', lens); } catch { /* not saved, that's fine */ }
    showLens();
  });
}

function showLens() {
  for (const button of document.querySelectorAll('[data-lens]')) {
    button.setAttribute('aria-pressed', String(button.dataset.lens === lens));
  }
  $('lens-note').textContent = LENSES[lens];
  renderLinks();
}

// --- The explanations ---------------------------------------------------

function renderLinks() {
  const { person, theirChart, links } = current;
  const count = summarise(links);
  const summary = $('links-summary');
  if (!links.length) {
    summary.textContent = `None of your personal planets and ${person.name}’s are at one of the main angles. That doesn’t mean you don’t get on: it just means no single pair stands out, so your connection shows up in quieter ways.`;
  } else {
    const parts = [];
    if (count.easy) parts.push(`${count.easy} easy`);
    if (count.tense) parts.push(`${count.tense} tense`);
    if (count.blend) parts.push(`${count.blend} blending`);
    const listed = parts.length > 1 ? `${parts.slice(0, -1).join(', ')} and ${parts.at(-1)}` : parts[0];
    summary.textContent = `We found ${links.length} link${links.length > 1 ? 's' : ''} between your planets and ${person.name}’s: ${listed}. A mix is normal. Tense links aren’t bad: they’re where you challenge each other and grow. The strongest links come first.`;
  }

  const list = $('links-list');
  list.replaceChildren();
  for (const link of links) {
    const e = explainLink(link, myChart, theirChart, person.name, lens);
    const li = make('li', `link-card ${e.kind}`);
    li.id = `link-${link.id}`;
    li.tabIndex = 0;
    li.dataset.from = link.from;
    li.dataset.to = link.to;

    const meta = make('p', 'link-meta');
    meta.append(make('span', `link-kind ${e.kind}`, e.label));
    if (e.strong) meta.append(termButton('strong-link', 'Strong link'));
    if (e.uncertain) meta.append(make('span', 'link-maybe', 'Might not be exact'));

    const heading = make('h3', 'link-title');
    heading.append(make('span', 'link-symbol', e.symbols[0]), `Your ${nameOf(link.from)} `, make('span', 'link-and', '&'), ` ${person.name}’s ${nameOf(link.to)}`, make('span', 'link-symbol them', e.symbols[1]));

    li.append(meta, heading, make('p', 'link-text', e.text));
    li.addEventListener('mouseenter', () => lightLink(link));
    li.addEventListener('mouseleave', unlight);
    li.addEventListener('focus', () => lightLink(link));
    li.addEventListener('blur', unlight);
    list.append(li);
  }
  setUpGlossary($('links-list'));
}

// --- Wheel interaction --------------------------------------------------
// Hovering a planet lights up its links (on the wheel and in the list).
// Hovering a link in the list lights it up on the wheel.

const tip = $('tip');
const area = $('pair-area');
let lastPointer = 'mouse';
let tipOwner = null;
let tipBeforeTap = null;
area.addEventListener('pointerdown', (e) => { lastPointer = e.pointerType; tipBeforeTap = tipOwner; }, true);

const sameLink = (line, link) => line.dataset.from === link.from && line.dataset.to === link.to;

function lightLink(link) {
  const { svg } = current;
  svg.classList.add('focusing');
  svg.querySelectorAll('.aspect').forEach((line) => line.classList.toggle('lit', sameLink(line, link)));
  svg.querySelectorAll('.planet').forEach((g) => {
    const on = (g.dataset.person === 'you' && g.dataset.body === link.from) || (g.dataset.person === 'them' && g.dataset.body === link.to);
    g.classList.toggle('lit', on);
  });
}

// All the links of one planet (yours or theirs).
const linksOf = (person, id) => current.links.filter((l) => (person === 'you' ? l.from === id : l.to === id));

function lightPlanet(person, id) {
  const { svg } = current;
  const mineLinks = linksOf(person, id);
  svg.classList.add('focusing');
  svg.querySelectorAll('.aspect').forEach((line) => line.classList.toggle('lit', mineLinks.some((l) => sameLink(line, l))));
  svg.querySelectorAll('.planet').forEach((g) => {
    const on = (g.dataset.person === person && g.dataset.body === id)
      || mineLinks.some((l) => (g.dataset.person === 'you' ? l.from : l.to) === g.dataset.body && g.dataset.person !== person);
    g.classList.toggle('lit', on);
  });
  document.querySelectorAll('.link-card').forEach((card) => {
    card.classList.toggle('lit', mineLinks.some((l) => card.id === `link-${l.id}`));
  });
}

function unlight() {
  const { svg } = current;
  svg.classList.remove('focusing');
  document.querySelectorAll('.lit').forEach((n) => n.classList.remove('lit'));
}

function showTip(owner, person, id) {
  const chart = person === 'you' ? myChart : current.theirChart;
  const body = chart.bodies.find((b) => b.id === id);
  const who = person === 'you' ? 'Your' : `${current.person.name}’s`;
  const what = person === 'you' ? PLANETS[id].what : THEIR_WHAT[id];
  const own = linksOf(person, id);
  const others = own.map((l) => {
    const other = person === 'you' ? `${current.person.name}’s ${nameOf(l.to)}` : `your ${nameOf(l.from)}`;
    return `${other} (${LINK_TYPES[l.type].label.toLowerCase()})`;
  });
  tipOwner = owner;
  tip.replaceChildren(
    make('h3', '', `${who} ${nameOf(id)} in ${signText(body)}`),
    make('p', 'tip-meta', body.uncertain ? 'Depends on the birth time' : `${nameOf(id)}: ${what}`),
    make('p', '', body.uncertain ? `${nameOf(id)}: ${what}.` : `Working ${SIGNS[body.sign].how}.`),
    make('p', 'tip-action', others.length
      ? `Linked to ${others.join(', ')}. ${lastPointer === 'touch' ? 'Tap again' : 'Click'} to read about it ↓`
      : 'No strong links with this planet.'),
  );
  tip.hidden = false;
  const a = area.getBoundingClientRect();
  const o = owner.getBoundingClientRect();
  const left = o.left - a.left + o.width / 2 > a.width / 2 ? o.left - a.left - tip.offsetWidth - 12 : o.right - a.left + 12;
  const top = Math.min(Math.max(o.top - a.top - 20, 0), a.height - tip.offsetHeight);
  tip.style.left = `${Math.max(0, Math.min(left, a.width - tip.offsetWidth))}px`;
  tip.style.top = `${top}px`;
}

function hideTip() {
  tip.hidden = true;
  tipOwner = null;
}

// Scroll to the first explanation for this planet, and highlight it.
function goToLinks(person, id) {
  const first = linksOf(person, id)[0];
  const card = first && $(`link-${first.id}`);
  if (!card) return;
  card.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' });
  card.focus({ preventScroll: true });
}

function setUpWheel() {
  hideTip();
  const { svg } = current;
  for (const g of svg.querySelectorAll('.planet')) {
    const { person, body } = g.dataset;
    const chart = person === 'you' ? myChart : current.theirChart;
    const who = person === 'you' ? 'Your' : `${current.person.name}’s`;
    g.setAttribute('tabindex', '0');
    g.setAttribute('role', 'button');
    g.setAttribute('aria-label', `${who} ${nameOf(body)} in ${signText(chart.bodies.find((b) => b.id === body))}. Show its links.`);
    const enter = () => { showTip(g, person, body); lightPlanet(person, body); };
    const leave = () => { hideTip(); unlight(); };
    g.addEventListener('mouseenter', enter);
    g.addEventListener('mouseleave', leave);
    g.addEventListener('focus', enter);
    g.addEventListener('blur', leave);
    g.addEventListener('click', () => {
      // On a phone, the first tap shows the box; the second goes to the explanation.
      if (lastPointer === 'touch' && tipBeforeTap !== g) { enter(); return; }
      goToLinks(person, body);
    });
    g.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); goToLinks(person, body); }
    });
  }
}

document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && current) { hideTip(); unlight(); } });
