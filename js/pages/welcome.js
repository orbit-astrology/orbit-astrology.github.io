// welcome.js
// ---------------------------------------------------------------
// The Welcome page: the birth form.
//
// What happens when you press "Generate my chart":
//   1. check every field (and say clearly what's wrong)
//   2. calculate the chart (js/astro/chart.js) to make sure it works
//   3. save the birth details in this browser (js/store.js)
//   4. go to My Universe, which reads them and shows your chart
// ---------------------------------------------------------------

import { calculateChart } from '../astro/chart.js?v=202610111804';
import { searchPlaces } from '../astro/places.js?v=202610111804';
import { formatOffset } from '../astro/time.js?v=202610111804';
import { skyAt } from '../astro/sky.js?v=202610111804';
import { drawWheel } from '../wheel.js?v=202610111804';
import { setUpGlossary } from '../glossary.js?v=202610111804';
import { saveBirth, loadBirth, SAMPLE_BIRTH } from '../store.js?v=202610111804';

const $ = (id) => document.getElementById(id);

setUpGlossary();

// --- The real sky right now, drawn faintly behind the title --------

const sky = skyAt(new Date());
$('sky-now').append(drawWheel(sky, { label: 'The sky right now' }));
const sunNow = sky.bodies.find((b) => b.id === 'sun').sign;
const moonNow = sky.bodies.find((b) => b.id === 'moon').sign;
$('sky-caption').textContent = `The faint wheel is the real sky right now: the Sun is in ${sunNow} and the Moon is in ${moonNow}.`;

// --- Coming back? Offer a shortcut ----------------------------------

const saved = loadBirth();
if (saved && !saved.isSample) $('continue-link').hidden = false;

// --- "I don't know my birth time" -----------------------------------

$('time-unknown').addEventListener('change', (e) => {
  const unknown = e.target.checked;
  $('birth-hour').disabled = unknown;
  $('birth-minute').disabled = unknown;
  $('time-hint').hidden = !unknown;
});

// --- Birthplace search ----------------------------------------------
// You type, ORBIT asks Open-Meteo for matching places, and you pick
// one. Only a place picked from the list is used, so a typo can never
// silently become the wrong coordinates.

const placeInput = $('birth-place');
const list = $('place-list');
const placeStatus = $('place-status');
let results = [];
let active = -1;        // which suggestion is highlighted with the arrow keys
let chosenPlace = null;
let searchTimer = null;
let searchNumber = 0;   // ignores answers to old searches that arrive late

function closeList() {
  list.hidden = true;
  placeInput.setAttribute('aria-expanded', 'false');
  placeInput.removeAttribute('aria-activedescendant');
  active = -1;
}

function highlight(index) {
  active = index;
  [...list.children].forEach((li, i) => li.setAttribute('aria-selected', String(i === index)));
  if (index >= 0) {
    placeInput.setAttribute('aria-activedescendant', `place-${index}`);
    list.children[index].scrollIntoView({ block: 'nearest' });
  }
}

function choose(index) {
  chosenPlace = results[index];
  placeInput.value = chosenPlace.label;
  placeInput.removeAttribute('aria-invalid');
  placeStatus.textContent = `Selected: ${chosenPlace.label} (time zone ${chosenPlace.timeZone}).`;
  closeList();
}

function showResults() {
  list.replaceChildren();
  results.forEach((place, i) => {
    const li = document.createElement('li');
    li.id = `place-${i}`;
    li.setAttribute('role', 'option');
    li.setAttribute('aria-selected', 'false');
    const [first, ...rest] = place.label.split(', ');
    li.append(first);
    if (rest.length) {
      const detail = document.createElement('span');
      detail.className = 'place-detail';
      detail.textContent = `, ${rest.join(', ')}`;
      li.append(detail);
    }
    li.addEventListener('mousedown', (e) => { e.preventDefault(); choose(i); });
    list.append(li);
  });
  list.hidden = results.length === 0;
  placeInput.setAttribute('aria-expanded', String(results.length > 0));
}

placeInput.addEventListener('input', () => {
  chosenPlace = null; // typing again means the old choice no longer applies
  clearTimeout(searchTimer);
  const query = placeInput.value.trim();
  if (query.length < 2) {
    closeList();
    placeStatus.textContent = 'Type at least two letters, then choose your city from the list.';
    return;
  }
  placeStatus.textContent = 'Searching…';
  searchTimer = setTimeout(async () => {
    const mine = ++searchNumber;
    try {
      const found = await searchPlaces(query);
      if (mine !== searchNumber) return;
      results = found;
      showResults();
      placeStatus.textContent = found.length
        ? `${found.length} place${found.length > 1 ? 's' : ''} found. Choose yours from the list.`
        : 'No places found. Try another spelling, or a bigger city nearby.';
    } catch {
      if (mine !== searchNumber) return;
      closeList();
      placeStatus.textContent = 'The place search isn’t answering right now. Please check your connection and try again.';
    }
  }, 300);
});

placeInput.addEventListener('keydown', (e) => {
  if (list.hidden) return;
  if (e.key === 'ArrowDown') { e.preventDefault(); highlight(Math.min(active + 1, results.length - 1)); }
  else if (e.key === 'ArrowUp') { e.preventDefault(); highlight(Math.max(active - 1, 0)); }
  else if (e.key === 'Enter' && active >= 0) { e.preventDefault(); choose(active); }
  else if (e.key === 'Escape') { closeList(); }
});
placeInput.addEventListener('blur', () => setTimeout(closeList, 150));

// --- Checking the form ------------------------------------------------

let chosenOffset = null; // set only when the "happened twice" question is answered

function readNumber(id) {
  const value = $(id).value.trim();
  return value === '' ? NaN : Number(value);
}

function markInvalid(ids) {
  for (const id of ['birth-day', 'birth-month', 'birth-year', 'birth-hour', 'birth-minute', 'birth-place']) {
    if (ids.includes(id)) $(id).setAttribute('aria-invalid', 'true');
    else $(id).removeAttribute('aria-invalid');
  }
  if (ids.length) $(ids[0]).focus();
}

function showError(message, invalidIds = []) {
  $('form-error').textContent = message;
  markInvalid(invalidIds);
}

function readForm() {
  const timeKnown = !$('time-unknown').checked;
  const birth = {
    day: readNumber('birth-day'),
    month: readNumber('birth-month'),
    year: readNumber('birth-year'),
    timeKnown,
    hour: timeKnown ? readNumber('birth-hour') : undefined,
    minute: timeKnown ? readNumber('birth-minute') : undefined,
    place: chosenPlace,
  };
  if (chosenOffset !== null) birth.offsetMinutes = chosenOffset;
  return birth;
}

function check(birth) {
  const dateWrong = [];
  if (!Number.isInteger(birth.day) || birth.day < 1 || birth.day > 31) dateWrong.push('birth-day');
  if (!birth.month) dateWrong.push('birth-month');
  if (!Number.isInteger(birth.year) || birth.year < 1000) dateWrong.push('birth-year');
  if (dateWrong.length) return ['Please enter your full date of birth: day, month and year (for example 4, August, 2001).', dateWrong];

  if (birth.timeKnown) {
    const timeWrong = [];
    if (!Number.isInteger(birth.hour) || birth.hour < 0 || birth.hour > 23) timeWrong.push('birth-hour');
    if (!Number.isInteger(birth.minute) || birth.minute < 0 || birth.minute > 59) timeWrong.push('birth-minute');
    if (timeWrong.length) return ['Please enter your birth time as hour (0–23) and minute (0–59), or tick “I don’t know my birth time”.', timeWrong];
  }

  if (!birth.place) return ['Please choose your place of birth from the list of suggestions.', ['birth-place']];
  return null;
}

function askWhichTime(options) {
  const box = $('ambiguous-options');
  box.replaceChildren();
  options.forEach((option, i) => {
    const label = document.createElement('label');
    const input = document.createElement('input');
    input.type = 'radio';
    input.name = 'which-time';
    input.addEventListener('change', () => { chosenOffset = option.offsetMinutes; $('form-error').textContent = ''; });
    label.append(input, i === 0
      ? `The first time, before the clocks went back (${formatOffset(option.offsetMinutes)})`
      : `The second time, after the clocks went back (${formatOffset(option.offsetMinutes)})`);
    box.append(label);
  });
  $('ambiguous').hidden = false;
  box.querySelector('input').focus();
}

// Changing the date or time cancels any earlier "which time" answer.
for (const id of ['birth-day', 'birth-month', 'birth-year', 'birth-hour', 'birth-minute']) {
  $(id).addEventListener('input', () => { chosenOffset = null; $('ambiguous').hidden = true; });
}

function goToUniverse(birth) {
  if (!saveBirth(birth)) {
    showError('Your browser is blocking ORBIT from saving your details (this can happen in private browsing). Please allow site data and try again.');
    return;
  }
  window.location.href = 'universe.html';
}

$('create').addEventListener('submit', (e) => {
  e.preventDefault();
  const birth = readForm();
  const problem = check(birth);
  if (problem) return showError(...problem);

  const result = calculateChart(birth);
  if (result.status === 'ambiguous') {
    showError('Please choose which of the two times you mean, then press the button again.');
    return askWhichTime(result.options);
  }
  if (result.status === 'error') {
    const fields = { 'invalid-date': ['birth-day', 'birth-month'], 'future-date': ['birth-year'], 'out-of-range': ['birth-year'], 'nonexistent-time': ['birth-hour', 'birth-minute'], 'no-place': ['birth-place'] };
    return showError(result.message, fields[result.code] || []);
  }

  showError('');
  goToUniverse(birth);
});

$('sample').addEventListener('click', () => goToUniverse(SAMPLE_BIRTH));
