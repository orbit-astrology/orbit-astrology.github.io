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

import { calculateChart } from '../astro/chart.js?v=202610211905';
import { drawWheel } from '../wheel.js?v=202610211905';
import { placeTip } from '../tip-position.js?v=202610211905';
import { setUpGlossary, termButton } from '../glossary.js?v=202610211905';
import { setUpMenu, showSampleBanner } from '../layout.js?v=202610211905';
import { setUpBirthForm } from '../birth-form.js?v=202610211905';
import { makeShareLink, readShareCode } from '../share.js?v=202610211905';
import { setUpAccountPanel } from '../account-panel.js?v=202610211905';
import { startCloud, currentUser, myInvite, addMeTo } from '../cloud.js?v=202610211905';
import { loadBirth, saveBirth, loadPeople, savePeople } from '../store.js?v=202610211905';
import { risingText } from '../readings.js?v=202610211905';
import { compareCharts, explainLink, summarise, signText } from '../compare.js?v=202610211905';
import { PERSONAL, LENS_TAGS, LINK_TYPES, THEIR_WHAT, SAMPLE_PERSON } from '../content/connections.js?v=202610211905';
import { PLANETS, SIGNS } from '../content/basics.js?v=202610211905';

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
// Wait for the account sync first, so people added from another device
// (or a friend who added themselves) are already in the list.
await startCloud();
const me = loadBirth();
showSampleBanner(me);

// Your own chart, calculated fresh from your saved birth details.
const mine = me ? calculateChart(me) : null;
const myChart = mine?.status === 'ok' ? mine.chart : null;


// Show the right part of the page, depending on the address:
//   #add=…    a friend's share link
//   #with=id  you & that person
//   nothing   your people (or "create your chart first")
function route() {
  const params = new URLSearchParams(location.hash.slice(1));
  for (const id of ['need-chart', 'shared-view', 'people-view', 'compare-view']) $(id).hidden = true;

  if (params.has('add')) {
    showShared(params.get('add'));
    setUpGlossary();
    return;
  }
  if (!myChart) {
    $('need-chart').hidden = false;
    return;
  }

  const id = params.get('with');
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
  const rising = chart.angles ? `Rising ${risingText(chart)}` : 'Rising unknown (no birth time)';
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
    if (person.shared) name.append(make('span', 'person-tag', 'Shared with you'));
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
// Share links
// =====================================================================

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const two = (n) => String(n).padStart(2, '0');

// "4 August 2001 at 14:30 in Valencia, Spain"
function bornText(birth) {
  const time = birth.timeKnown ? ` at ${two(birth.hour)}:${two(birth.minute)}` : ' (birth time unknown)';
  return `${birth.day} ${MONTHS[birth.month - 1]} ${birth.year}${time} in ${birth.place.label}`;
}

// Two sets of birth details are the same person if date, time and place match.
const samePerson = (a, b) => a.year === b.year && a.month === b.month && a.day === b.day
  && Boolean(a.timeKnown) === Boolean(b.timeKnown) && (!a.timeKnown || (a.hour === b.hour && a.minute === b.minute))
  && a.place.label === b.place.label;

// Someone opened a friend's link: show who it is and ask before adding.
function showShared(code) {
  $('shared-view').hidden = false;
  const shared = readShareCode(code);
  const result = shared ? calculateChart(shared.birth) : null;
  const title = $('shared-title');
  const actions = $('shared-actions');
  $('shared-error').textContent = '';

  if (result?.status !== 'ok') {
    title.replaceChildren('This link ', make('em', '', 'doesn’t work'));
    $('shared-details').textContent = 'It may have been cut off when it was copied. Ask your friend to send it again.';
    $('shared-hint').hidden = true;
    actions.hidden = true;
    return;
  }

  const { name, birth } = shared;
  title.replaceChildren(`${name} `, make('em', '', 'shared their chart with you'));
  $('shared-details').textContent = `Born ${bornText(birth)}. ${bigThree(result.chart)}.`;
  $('shared-hint').hidden = false;
  actions.hidden = false;

  if (me && !me.isSample && samePerson(me, birth)) {
    $('shared-details').append(' This is your own link: send it to a friend so they can add you.');
    actions.hidden = true;
    return;
  }

  // Two-way: if the link came from a logged-in friend, offer to add
  // yourself to their people too. Only possible when you're logged in
  // and have your own chart (the server sends them your saved details).
  const canShareBack = Boolean(shared.invite && currentUser() && me && !me.isSample);
  $('share-back').hidden = !canShareBack;
  $('share-back-label').textContent = `Also add me to ${name}’s people (${name} will see my birth details)`;
  $('share-back-name').value = me?.name || '';
  $('share-back-yes').onchange = () => { $('share-back-name-field').hidden = !$('share-back-yes').checked; };
  // Not logged in: offer to log in or create an account right here.
  // After logging in, the page reloads and shows the box above.
  $('account').hidden = !(shared.invite && !currentUser());
  $('share-join-why').textContent = `To also appear in ${name}’s people, log in or create a free account. You can also just add ${name} without one.`;
  // Logged in but no chart yet: make one, then come straight back here.
  const needsChart = Boolean(shared.invite && currentUser() && (!me || me.isSample));
  $('share-need-chart').hidden = !needsChart;
  $('shared-add').hidden = needsChart; // make your chart first; you'll come back to this button
  $('share-need-chart-why').textContent = `Next, create your own chart, so ${name} can see it too. ORBIT will bring you back here afterwards.`;
  $('share-make-chart').onclick = () => {
    try { localStorage.setItem('orbit.pending-add', location.hash.slice(1)); } catch { /* the link will just need opening again */ }
  };

  const existing = loadPeople().find((p) => samePerson(p.birth, birth));
  const button = $('shared-add');
  button.textContent = existing ? `${existing.name} is already in your people: compare` : `Add ${name} to my people`;
  button.onclick = async () => {
    // Add yourself to their people first (it needs a moment online).
    if (canShareBack && $('share-back-yes').checked) {
      const myName = $('share-back-name').value.trim();
      if (!myName) {
        $('shared-error').textContent = `Please add your name, so ${name} knows who you are.`;
        $('share-back-name').focus();
        return;
      }
      button.disabled = true;
      try {
        if (!(await addMeTo(shared.invite, myName))) throw new Error();
        saveBirth({ ...me, name: myName }); // remember your name for next time
      } catch {
        button.disabled = false;
        $('shared-error').textContent = `ORBIT couldn’t add you to ${name}’s people just now. Untick the box to add ${name} anyway, or try again.`;
        return;
      }
    }
    let id = existing?.id;
    if (!id) {
      id = `p${Date.now().toString(36)}`;
      // They shared it themselves, so permission is already given.
      if (!savePeople([...loadPeople(), { id, name, birth, shared: true }])) {
        $('shared-error').textContent = 'Your browser is blocking ORBIT from saving (this can happen in private browsing). Please allow site data and try again.';
        return;
      }
    }
    // Replace the address, so Back doesn't return to the "add" question.
    history.replaceState(null, '', `connections.html#with=${id}`);
    route();
  };
  title.focus({ preventScroll: true });
}

// The "Share your chart" box, under your people.
function setUpShareBox() {
  if (!me || me.isSample) {
    $('share-intro').textContent = 'Once you’ve created your own chart, you can send friends a link that adds you to their Connections.';
    $('share-form').hidden = true;
    return;
  }
  $('share-name').value = me.name || '';
  $('share-make').addEventListener('click', async () => {
    const name = $('share-name').value.trim();
    if (!name) {
      $('share-error').textContent = 'Please add your name, so your friend knows who the link is from.';
      $('share-name').setAttribute('aria-invalid', 'true');
      $('share-name').focus();
      return;
    }
    $('share-error').textContent = '';
    $('share-name').removeAttribute('aria-invalid');
    saveBirth({ ...me, name }); // remember your name for next time
    // Logged in: the link carries your invite code, so a friend can
    // add themselves to your people too.
    const invite = await myInvite();
    $('share-link').value = makeShareLink(name, me, invite);
    $('share-two-way').hidden = !invite;
    $('share-result').hidden = false;
    $('share-copy').textContent = 'Copy';
  });
  $('share-copy').addEventListener('click', async () => {
    const field = $('share-link');
    try {
      await navigator.clipboard.writeText(field.value);
      $('share-copy').textContent = 'Copied';
      $('share-status').textContent = 'Copied. Paste it in a message to your friend. Anyone with this link can see your birth details, so only send it to people you trust.';
    } catch {
      // Some browsers don't allow copying: select the text so it's easy to copy by hand.
      field.select();
      $('share-status').textContent = 'Your browser didn’t let ORBIT copy it. The link is selected: copy it with Ctrl+C (or ⌘C on a Mac).';
    }
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
    hoverAreas: true,
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
  const rising = (chart) => risingText(chart) ?? 'Needs a birth time';
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
    showLens(true);
  });
}

// Show the chosen lens. `changed` is true when you just clicked the
// switch: then the changed parts briefly light up.
function showLens(changed = false) {
  for (const button of document.querySelectorAll('[data-lens]')) {
    button.setAttribute('aria-pressed', String(button.dataset.lens === lens));
  }
  renderLinks();
  if (changed) {
    for (const node of document.querySelectorAll('.link-meaning')) {
      node.classList.remove('flash');
      void node.offsetWidth; // restart the highlight if you click quickly
      node.classList.add('flash');
    }
  }
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

    const meaning = make('p', 'link-meaning');
    meaning.append(make('span', 'lens-tag', LENS_TAGS[lens]), e.meaning);
    li.append(meta, heading, make('p', 'link-text', e.facts), meaning);
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
let tappedSign = null; // the sign whose box was opened by the last tap or click
area.addEventListener('pointerdown', (e) => { lastPointer = e.pointerType; tipBeforeTap = tipOwner; }, true);
// On phones there's no "mouse leaving", so the box closes when you tap
// anywhere outside the wheel instead.
document.addEventListener('pointerdown', (e) => {
  if (e.pointerType === 'touch' && !area.contains(e.target)) { hideTip(); unlight(); }
});

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
  if (!current) return; // no comparison on screen
  const { svg } = current;
  svg.classList.remove('focusing');
  document.querySelectorAll('.lit').forEach((n) => n.classList.remove('lit'));
}

// What the box says about one planet (yours or theirs).
function planetTip(person, id) {
  const chart = person === 'you' ? myChart : current.theirChart;
  const body = chart.bodies.find((b) => b.id === id);
  const who = person === 'you' ? 'Your' : `${current.person.name}’s`;
  const what = person === 'you' ? PLANETS[id].what : THEIR_WHAT[id];
  const others = linksOf(person, id).map((l) => {
    const other = person === 'you' ? `${current.person.name}’s ${nameOf(l.to)}` : `your ${nameOf(l.from)}`;
    return `${other} (${LINK_TYPES[l.type].label.toLowerCase()})`;
  });
  return {
    title: `${who} ${nameOf(id)} in ${signText(body)}`,
    meta: body.uncertain ? 'Depends on the birth time' : `${nameOf(id)}: ${what}`,
    text: body.uncertain ? `${nameOf(id)}: ${what}.` : `Working ${SIGNS[body.sign].how}.`,
    action: others.length
      ? `Linked to ${others.join(', ')}. ${lastPointer === 'touch' ? 'Tap again' : 'Click'} to read about it ↓`
      : 'No strong links with this planet.',
  };
}

// What the box says about one line (a link between you and them).
function linkTip(link) {
  const e = explainLink(link, myChart, current.theirChart, current.person.name, lens);
  const meta = [e.label];
  if (e.strong) meta.push('Strong link');
  if (e.uncertain) meta.push('Might not be exact');
  return {
    title: e.title.replace(' · ', ' & '),
    meta: meta.join(' · '),
    text: `They’re ${e.plain}. This link is about ${e.theme}.`,
    // Say WHAT to click: the box itself disappears when the mouse moves to it.
    action: `${lastPointer === 'touch' ? 'Tap the line again' : 'Click the line on the wheel'} to read the full explanation ↓`,
  };
}

// What the box says about one sign, and whose planets are in it.
function signTip(sign) {
  const inSign = (chart) => chart.bodies.filter((b) => PERSONAL.includes(b.id) && !b.uncertain && b.sign === sign).map((b) => nameOf(b.id));
  const yours = inSign(myChart);
  const theirs = inSign(current.theirChart);
  const here = [];
  if (yours.length) here.push(`Yours: ${yours.join(', ')}`);
  if (theirs.length) here.push(`${current.person.name}’s: ${theirs.join(', ')}`);
  return {
    title: sign,
    meta: 'Signs describe how',
    text: `Planets here work ${SIGNS[sign].how}.`,
    action: here.length ? `${here.join('. ')}.` : 'None of your personal planets are in this sign.',
  };
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
  placeTip(tip, owner, current.svg, area); // beside the wheel, never on top of it
}

function hideTip() {
  tip.hidden = true;
  tipOwner = null;
  tappedSign = null;
}

// Scroll to an explanation in the list, and highlight it.
function goToCard(link) {
  const card = link && $(`link-${link.id}`);
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
    const enter = () => { showTip(g, planetTip(person, body)); lightPlanet(person, body); };
    const leave = () => { if (lastPointer === 'touch') return; hideTip(); unlight(); };
    g.addEventListener('mouseenter', enter);
    g.addEventListener('mouseleave', leave);
    g.addEventListener('focus', enter);
    g.addEventListener('blur', leave);
    g.addEventListener('click', () => {
      // On a phone, the first tap shows the box; the second goes to the explanation.
      if (lastPointer === 'touch' && tipBeforeTap !== g) { enter(); return; }
      goToCard(linksOf(person, body)[0]);
    });
    g.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); goToCard(linksOf(person, body)[0]); }
    });
  }

  // The lines between you: hover, focus or tap to read about that link.
  for (const hit of svg.querySelectorAll('.aspect-hit')) {
    const link = current.links.find((l) => l.id === hit.dataset.aspect);
    hit.setAttribute('tabindex', '0');
    hit.setAttribute('role', 'button');
    hit.setAttribute('aria-label', `${explainLink(link, myChart, current.theirChart, current.person.name, lens).title}. Read about this link.`);
    const enter = () => { showTip(hit, linkTip(link)); lightLink(link); $(`link-${link.id}`)?.classList.add('lit'); };
    const leave = () => { if (lastPointer === 'touch') return; hideTip(); unlight(); };
    hit.addEventListener('mouseenter', enter);
    hit.addEventListener('mouseleave', leave);
    hit.addEventListener('focus', enter);
    hit.addEventListener('blur', leave);
    hit.addEventListener('click', () => {
      if (lastPointer === 'touch' && tipBeforeTap !== hit) { enter(); return; }
      goToCard(link);
    });
    hit.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); goToCard(link); }
    });
  }

  // The signs: hover or tap to see what they mean and whose planets are there.
  for (const slice of svg.querySelectorAll('[data-sign]')) {
    slice.addEventListener('mouseenter', () => showTip(slice, signTip(slice.dataset.sign)));
    slice.addEventListener('mouseleave', () => { if (lastPointer !== 'touch') hideTip(); });
    slice.addEventListener('click', () => {
      // A tap or click opens the box; doing it again on the same sign closes it.
      if (tappedSign === slice) { hideTip(); return; }
      showTip(slice, signTip(slice.dataset.sign));
      tappedSign = slice;
    });
  }
}

document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && current) { hideTip(); unlight(); } });

// =====================================================================
// Start: everything above is ready, so draw the page.
// =====================================================================

setUpAddForm();
setUpShareBox();
route();

// The log-in box inside a friend's invitation (#add=…). After logging
// in, reload: the same invitation opens again, now with the option to
// add yourself to their people.
setUpAccountPanel({
  collapsed: true,
  onChange(event) { if (event !== 'signup' || currentUser()) window.location.reload(); },
});
window.addEventListener('hashchange', route);
