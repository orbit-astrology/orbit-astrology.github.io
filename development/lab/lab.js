// lab.js
// ---------------------------------------------------------------
// Connects the test page's form to the calculation modules and
// prints the result as plain tables. No chart drawing yet: this
// page only proves the numbers are right.
// ---------------------------------------------------------------

import { calculateChart } from '../../js/astro/chart.js?v=202610201914';
import { searchPlaces } from '../../js/astro/places.js?v=202610201914';
import { formatLongitude } from '../../js/astro/zodiac.js?v=202610201914';
import { formatOffset } from '../../js/astro/time.js?v=202610201914';
import { REFERENCE_CHARTS } from '../tests/reference-charts.js?v=202610201914';
import { runChecks } from '../tests/checks.js?v=202610201914';

const $ = (id) => document.getElementById(id);

// Tiny helper to build HTML elements safely (text is never parsed as HTML).
function h(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') el.className = v;
    else el.setAttribute(k, v);
  }
  for (const c of children.flat()) {
    if (c !== null && c !== undefined) el.append(c instanceof Node ? c : String(c));
  }
  return el;
}

function table(headers, rows) {
  return h('div', { class: 'table-wrap' },
    h('table', {},
      h('thead', {}, h('tr', {}, headers.map((t) => h('th', { scope: 'col' }, t)))),
      h('tbody', {}, rows.map((r) => h('tr', {}, r.map((cell) =>
        cell instanceof Node ? cell : h('td', {}, cell)))))));
}

// --- Birthplace -------------------------------------------------

// Only a place picked from the results is used. Typing a new search
// clears the previous choice, so text can never silently become
// coordinates.
let chosenPlace = null;

function choosePlace(place) {
  chosenPlace = place;
  const chosen = $('place-chosen');
  chosen.hidden = !place;
  if (place) {
    chosen.textContent = `Selected: ${place.label} · ${place.latitude.toFixed(4)}, ${place.longitude.toFixed(4)} · time zone ${place.timeZone}`;
  }
}

$('place-query').addEventListener('input', () => {
  choosePlace(null);
  $('place-results').hidden = true;
});

$('place-query').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') { e.preventDefault(); $('place-search').click(); }
});

$('place-search').addEventListener('click', async () => {
  const status = $('place-status');
  const results = $('place-results');
  const options = $('place-options');
  choosePlace(null);
  options.replaceChildren();
  results.hidden = true;
  status.textContent = 'Searching for places…';
  try {
    const places = await searchPlaces($('place-query').value);
    if (places.length === 0) {
      status.textContent = 'No places found. Try a different spelling or a larger nearby city.';
      return;
    }
    status.textContent = `${places.length} place${places.length > 1 ? 's' : ''} found.`;
    places.forEach((place, i) => {
      const input = h('input', { type: 'radio', name: 'place', id: `place-${i}` });
      input.addEventListener('change', () => choosePlace(place));
      options.append(h('label', { for: `place-${i}` }, input, place.label));
    });
    results.hidden = false;
  } catch (err) {
    status.textContent = `${err.message} If it keeps failing, the place service may be down.`;
  }
});

// --- Unknown time ------------------------------------------------

$('time-unknown').addEventListener('change', (e) => {
  $('birth-time').disabled = e.target.checked;
});

// --- Calculate -----------------------------------------------------

let chosenOffset = null; // set only when the user answers the "happened twice" question

function readForm() {
  const [year, month, day] = ($('birth-date').value || '').split('-').map(Number);
  const timeKnown = !$('time-unknown').checked;
  const [hour, minute] = ($('birth-time').value || '').split(':').map(Number);
  return { year, month, day, timeKnown, hour, minute, place: chosenPlace, offsetMinutes: chosenOffset };
}

function showError(message) {
  $('form-error').textContent = message;
}

function calculate() {
  showError('');
  const birth = readForm();
  if (!birth.year) return showError('Please enter your date of birth.');
  if (birth.timeKnown && Number.isNaN(birth.hour)) {
    return showError('Please enter your birth time, or tick “I don’t know my birth time”.');
  }

  const out = calculateChart(birth);

  if (out.status === 'ambiguous') {
    const box = $('ambiguous-options');
    box.replaceChildren();
    out.options.forEach((o, i) => {
      const input = h('input', { type: 'radio', name: 'offset', id: `offset-${i}` });
      input.addEventListener('change', () => { chosenOffset = o.offsetMinutes; });
      const which = i === 0 ? 'The first time (summer time)' : 'The second time (after the clocks went back)';
      box.append(h('label', { for: `offset-${i}` }, input, `${which}, ${formatOffset(o.offsetMinutes)}`));
    });
    $('ambiguous').hidden = false;
    return showError('Please choose which of the two times you mean, then calculate again.');
  }
  $('ambiguous').hidden = true;

  if (out.status === 'error') return showError(out.message);
  renderChart(out.chart);
}

$('birth-form').addEventListener('submit', (e) => {
  e.preventDefault();
  calculate();
});

// Any change to date/time resets the "happened twice" answer.
for (const id of ['birth-date', 'birth-time']) {
  $(id).addEventListener('input', () => { chosenOffset = null; $('ambiguous').hidden = true; });
}

// --- Examples ------------------------------------------------------

document.querySelectorAll('[data-example]').forEach((button) => {
  button.addEventListener('click', () => {
    const { birth } = REFERENCE_CHARTS[Number(button.dataset.example)];
    const pad = (n) => String(n).padStart(2, '0');
    $('birth-date').value = `${birth.year}-${pad(birth.month)}-${pad(birth.day)}`;
    $('birth-time').value = `${pad(birth.hour)}:${pad(birth.minute)}`;
    $('time-unknown').checked = false;
    $('birth-time').disabled = false;
    $('place-query').value = birth.place.label;
    $('place-results').hidden = true;
    choosePlace(birth.place);
    calculate();
  });
});

// --- Output ------------------------------------------------------

function renderChart(chart) {
  const section = $('result');
  const place = chart.input.place;
  const deg = (n) => `${n.toFixed(4)}°`;

  const parts = [h('h2', {}, 'Result')];

  const sun = chart.bodies[0];
  const moon = chart.bodies[1];
  const rising = chart.angles ? chart.angles.ascendant.sign : 'unknown (needs birth time)';
  const moonText = moon.uncertain ? moon.possibleSigns.join(' or ') : moon.sign;
  parts.push(h('p', { class: 'summary' }, `Sun in ${sun.sign} · Moon in ${moonText} · Rising ${rising}`));

  // "How we know this": every step from the form to the numbers.
  parts.push(h('h3', {}, 'How we know this'));
  const facts = [
    ['Birthplace', `${place.label} (${place.latitude.toFixed(4)}, ${place.longitude.toFixed(4)})`],
    ['Time zone', `${place.timeZone}, which was ${formatOffset(chart.offsetMinutes)} on that date`],
    ['Moment in UTC', chart.timeKnown ? chart.utc.replace('T', ' ').replace('.000Z', ' UTC')
      : `unknown time: planets shown at local noon (${chart.utc.slice(11, 16)} UTC); checked across the whole day`],
  ];
  if (chart.calculation) {
    facts.push(['Local sidereal time', `${deg(chart.calculation.ramc)} (how far the sky had turned overhead)`]);
    facts.push(['Earth’s tilt', deg(chart.calculation.obliquity)]);
  }
  facts.push(['Settings', `${chart.settings.zodiac} zodiac · ${chart.settings.houseSystem} houses · ${chart.settings.engine}`]);
  parts.push(h('dl', { class: 'facts' }, facts.flatMap(([k, v]) => [h('dt', {}, k), h('dd', {}, v)])));

  if (chart.houseLimitation === 'time-unknown') {
    parts.push(h('p', { class: 'notice' }, 'Without a birth time, the Ascendant, Midheaven and houses can’t be calculated, so ORBIT doesn’t show them. Planets marked “uncertain” changed sign during that day.'));
  } else if (chart.houseLimitation === 'placidus-undefined') {
    parts.push(h('p', { class: 'notice' }, 'This birthplace is so far north or south that Placidus houses can’t be calculated for this moment. The Ascendant and Midheaven are still shown.'));
  }

  parts.push(h('h3', {}, 'Planets'));
  parts.push(table(['Planet', 'Position', 'Longitude', 'House', 'Motion', 'Certainty'],
    chart.bodies.map((b) => [
      b.name,
      formatLongitude(b.longitude),
      deg(b.longitude),
      b.house ?? '—',
      b.retrograde ? 'Retrograde' : 'Direct',
      chart.timeKnown ? 'Exact' : b.uncertain ? `Uncertain: ${b.possibleSigns.join(' or ')}` : 'Sign certain, degree approximate',
    ])));

  if (chart.angles) {
    parts.push(h('h3', {}, 'Angles'));
    parts.push(table(['Angle', 'Position', 'Longitude'], [
      ['Ascendant (Rising)', formatLongitude(chart.angles.ascendant.longitude), deg(chart.angles.ascendant.longitude)],
      ['Midheaven (MC)', formatLongitude(chart.angles.midheaven.longitude), deg(chart.angles.midheaven.longitude)],
    ]));
  }

  if (chart.houses) {
    parts.push(h('h3', {}, 'House cusps (Placidus)'));
    parts.push(table(['House', 'Starts at', 'Longitude'],
      chart.houses.map((c) => [c.number, formatLongitude(c.longitude), deg(c.longitude)])));
  }

  parts.push(h('h3', {}, `Aspects (${chart.aspects.length})`));
  const name = (id) => chart.bodies.find((b) => b.id === id).name;
  parts.push(table(['Between', 'Aspect', 'Exact angle', 'Actual angle', 'Orb', ...(chart.timeKnown ? [] : ['Certainty'])],
    chart.aspects.map((a) => [
      `${name(a.from)} – ${name(a.to)}`,
      a.name,
      `${a.angle}°`,
      `${a.separation.toFixed(2)}°`,
      `${a.orb.toFixed(2)}°`,
      ...(chart.timeKnown ? [] : [a.uncertain ? 'May not apply all day' : 'All day']),
    ])));

  section.replaceChildren(...parts);
  section.hidden = false;
  section.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
}

// --- Reference checks ------------------------------------------------

$('run-checks').addEventListener('click', () => {
  const results = runChecks();
  const passed = results.filter((r) => r.pass).length;
  $('checks').replaceChildren(
    h('p', { class: 'summary' }, `${passed} of ${results.length} checks passed`),
    table(['Case', 'Item', 'Reference', 'ORBIT', 'Result'],
      results.map((r) => [
        r.case,
        r.item,
        r.reference,
        r.off !== undefined ? `${r.off}′ off (limit ${r.limit}′)` : r.actual,
        h('td', { class: r.pass ? 'pass' : 'fail' }, r.pass ? 'Pass' : 'Fail'),
      ])),
  );
});
