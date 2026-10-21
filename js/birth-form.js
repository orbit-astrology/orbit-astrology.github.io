// birth-form.js
// ---------------------------------------------------------------
// Everything a birth form needs, shared by the Welcome page (your
// details) and Connections (someone else's details):
//   - "I don't know the birth time"
//   - birthplace search (only a place picked from the list is used,
//     so a typo can never silently become the wrong coordinates)
//   - clear checks with messages that say exactly what's wrong
//   - the question when a clock time happened twice (clocks going back)
//
// The HTML uses ids that all start with the same prefix, for example
// "birth-day", "birth-place" on Welcome and "friend-day",
// "friend-place" on Connections.
// ---------------------------------------------------------------

import { calculateChart } from './astro/chart.js?v=202610211817';
import { searchPlaces } from './astro/places.js?v=202610211817';
import { formatOffset } from './astro/time.js?v=202610211817';

// Options:
//   form, prefix  – the <form> and the start of its ids
//   whose         – 'your' or 'their', used in the messages
//   extraFields   – other fields the page adds (e.g. ['name'])
//   check()       – the page's own checks for those fields, run first;
//                   returns [message, fieldNames] or null
//   onSuccess(birth, chart, showError) – called once everything is right
export function setUpBirthForm({ form, prefix, whose = 'your', extraFields = [], check = () => null, onSuccess }) {
  const $ = (name) => document.getElementById(prefix + name);
  const FIELDS = [...extraFields, 'day', 'month', 'year', 'hour', 'minute', 'place'];

  // --- "I don't know the birth time" ---
  $('time-unknown').addEventListener('change', (e) => {
    const unknown = e.target.checked;
    $('hour').disabled = unknown;
    $('minute').disabled = unknown;
    $('time-hint').hidden = !unknown;
    $('margin-field').hidden = unknown; // "how sure?" only makes sense with a time
  });

  // --- "How sure are you about this time?" (approximate time) ---
  $('margin').addEventListener('change', () => { $('margin-hint').hidden = $('margin').value === '0'; });

  // --- Birthplace search ---
  const input = $('place');
  const list = $('place-list');
  const status = $('place-status');
  const defaultStatus = status.textContent;
  let results = [];
  let active = -1;        // which suggestion is highlighted with the arrow keys
  let chosenPlace = null;
  let timer = null;
  let searchNumber = 0;   // ignores answers to old searches that arrive late

  function closeList() {
    list.hidden = true;
    input.setAttribute('aria-expanded', 'false');
    input.removeAttribute('aria-activedescendant');
    active = -1;
  }
  function highlight(i) {
    active = i;
    [...list.children].forEach((li, n) => li.setAttribute('aria-selected', String(n === i)));
    if (i >= 0) {
      input.setAttribute('aria-activedescendant', `${prefix}option-${i}`);
      list.children[i].scrollIntoView({ block: 'nearest' });
    }
  }
  function choose(i) {
    chosenPlace = results[i];
    input.value = chosenPlace.label;
    input.removeAttribute('aria-invalid');
    status.textContent = `Selected: ${chosenPlace.label} (time zone ${chosenPlace.timeZone}).`;
    closeList();
  }
  function showResults() {
    list.replaceChildren();
    results.forEach((place, i) => {
      const li = document.createElement('li');
      li.id = `${prefix}option-${i}`;
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
    input.setAttribute('aria-expanded', String(results.length > 0));
  }

  input.addEventListener('input', () => {
    chosenPlace = null; // typing again means the old choice no longer applies
    clearTimeout(timer);
    const query = input.value.trim();
    if (query.length < 2) { closeList(); status.textContent = defaultStatus; return; }
    status.textContent = 'Searching…';
    timer = setTimeout(async () => {
      const mine = ++searchNumber;
      try {
        const found = await searchPlaces(query);
        if (mine !== searchNumber) return;
        results = found;
        showResults();
        status.textContent = found.length
          ? `${found.length} place${found.length > 1 ? 's' : ''} found. Choose the right one from the list.`
          : 'No places found. Try another spelling, or a bigger city nearby.';
      } catch {
        if (mine !== searchNumber) return;
        closeList();
        status.textContent = 'The place search isn’t answering right now. Please check your connection and try again.';
      }
    }, 300);
  });
  input.addEventListener('keydown', (e) => {
    if (list.hidden) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); highlight(Math.min(active + 1, results.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); highlight(Math.max(active - 1, 0)); }
    else if (e.key === 'Enter' && active >= 0) { e.preventDefault(); choose(active); }
    else if (e.key === 'Escape') { closeList(); }
  });
  input.addEventListener('blur', () => setTimeout(closeList, 150));

  // --- Checking ---
  let chosenOffset = null; // set only when the "happened twice" question is answered

  const number = (name) => {
    const v = $(name).value.trim();
    return v === '' ? NaN : Number(v);
  };

  function showError(message, wrong = []) {
    $('form-error').textContent = message;
    for (const f of FIELDS) {
      if (wrong.includes(f)) $(f).setAttribute('aria-invalid', 'true');
      else $(f).removeAttribute('aria-invalid');
    }
    if (wrong.length) $(wrong[0]).focus();
  }

  function read() {
    const timeKnown = !$('time-unknown').checked;
    const birth = {
      day: number('day'), month: number('month'), year: number('year'),
      timeKnown,
      hour: timeKnown ? number('hour') : undefined,
      minute: timeKnown ? number('minute') : undefined,
      place: chosenPlace,
    };
    const margin = Number($('margin').value);
    if (timeKnown && margin > 0) birth.margin = margin; // ± minutes
    if (chosenOffset !== null) birth.offsetMinutes = chosenOffset;
    return birth;
  }

  function problem(b) {
    const date = [];
    if (!Number.isInteger(b.day) || b.day < 1 || b.day > 31) date.push('day');
    if (!b.month) date.push('month');
    if (!Number.isInteger(b.year) || b.year < 1000) date.push('year');
    if (date.length) return [`Please enter ${whose} full date of birth: day, month and year (for example 4, August, 2001).`, date];
    if (b.timeKnown) {
      const time = [];
      if (!Number.isInteger(b.hour) || b.hour < 0 || b.hour > 23) time.push('hour');
      if (!Number.isInteger(b.minute) || b.minute < 0 || b.minute > 59) time.push('minute');
      if (time.length) return [`Please enter the birth time as hour (0–23) and minute (0–59), or tick “I don’t know the birth time”.`, time];
    }
    if (!b.place) return ['Please choose the place of birth from the list of suggestions.', ['place']];
    return null;
  }

  function askWhichTime(options) {
    const box = $('ambiguous-options');
    box.replaceChildren();
    options.forEach((option, i) => {
      const label = document.createElement('label');
      const radio = document.createElement('input');
      radio.type = 'radio';
      radio.name = `${prefix}which-time`;
      radio.addEventListener('change', () => { chosenOffset = option.offsetMinutes; $('form-error').textContent = ''; });
      label.append(radio, i === 0
        ? `The first time, before the clocks went back (${formatOffset(option.offsetMinutes)})`
        : `The second time, after the clocks went back (${formatOffset(option.offsetMinutes)})`);
      box.append(label);
    });
    $('ambiguous').hidden = false;
    box.querySelector('input').focus();
  }

  // Changing the date or time cancels any earlier "which time" answer.
  for (const f of ['day', 'month', 'year', 'hour', 'minute']) {
    $(f).addEventListener('input', () => { chosenOffset = null; $('ambiguous').hidden = true; });
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const birth = read();
    const wrong = check() || problem(birth);
    if (wrong) return showError(...wrong);

    const result = calculateChart(birth);
    if (result.status === 'ambiguous') {
      showError('Please choose which of the two times you mean, then press the button again.');
      return askWhichTime(result.options);
    }
    if (result.status === 'error') {
      const fields = { 'invalid-date': ['day', 'month'], 'future-date': ['year'], 'out-of-range': ['year'], 'nonexistent-time': ['hour', 'minute'], 'no-place': ['place'] };
      return showError(result.message, fields[result.code] || []);
    }
    showError('');
    onSuccess(birth, result.chart, showError);
  });

  // So a page can fill the form (to edit saved details) or clear it.
  return {
    fill(birth) {
      $('day').value = birth.day;
      $('month').value = String(birth.month);
      $('year').value = birth.year;
      $('time-unknown').checked = !birth.timeKnown;
      $('hour').disabled = !birth.timeKnown;
      $('minute').disabled = !birth.timeKnown;
      $('time-hint').hidden = birth.timeKnown;
      $('hour').value = birth.timeKnown ? birth.hour : '';
      $('minute').value = birth.timeKnown ? birth.minute : '';
      $('margin').value = String(birth.margin || 0);
      $('margin-field').hidden = !birth.timeKnown;
      $('margin-hint').hidden = !birth.margin;
      chosenPlace = birth.place;
      input.value = birth.place.label;
      status.textContent = `Selected: ${birth.place.label} (time zone ${birth.place.timeZone}).`;
      chosenOffset = birth.offsetMinutes ?? null;
    },
    reset() {
      form.reset();
      chosenPlace = null;
      chosenOffset = null;
      $('hour').disabled = false;
      $('minute').disabled = false;
      $('time-hint').hidden = true;
      $('margin-field').hidden = false;
      $('margin-hint').hidden = true;
      $('ambiguous').hidden = true;
      status.textContent = defaultStatus;
      showError('');
    },
  };
}
