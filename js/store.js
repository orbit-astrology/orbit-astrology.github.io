// store.js
// ---------------------------------------------------------------
// Remembers the birth details between pages.
//
// Everything is saved in this browser (localStorage), so pages load
// instantly and ORBIT works without an account. When you're logged
// in, cloud.js also sends every change to your account, so it follows
// you to other devices. We save the birth DETAILS, not the chart: the
// chart is recalculated from them every time, so it's always correct.
// ---------------------------------------------------------------

import { SETTINGS } from './astro/settings.js?v=202610201540';

const KEY = 'orbit.birth';

// Tell the rest of the site that saved data changed (cloud.js listens
// and sends it to your account when you're logged in).
const changed = () => window.dispatchEvent(new Event('orbit:changed'));

// The made-up sample person, for "Explore a sample chart".
export const SAMPLE_BIRTH = {
  name: 'Alex',
  year: 2001, month: 8, day: 4, hour: 14, minute: 30, timeKnown: true,
  place: { label: 'Valencia, Valencian Community, Spain', latitude: 39.4699, longitude: -0.3763, timeZone: 'Europe/Madrid' },
  isSample: true,
};

export function saveBirth(birth) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...birth, settingsVersion: SETTINGS.version }));
    changed();
    return true;
  } catch {
    return false; // private browsing or storage turned off
  }
}

export function loadBirth() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearBirth() {
  try { localStorage.removeItem(KEY); changed(); } catch { /* nothing to clear */ }
}

// --- The people you've added on Connections ---------------------
// A list of { id, name, birth, isSample }. Only their birth DETAILS
// are saved (in this browser), never a calculated chart.

const PEOPLE_KEY = 'orbit.connections';

export function loadPeople() {
  try {
    const list = JSON.parse(localStorage.getItem(PEOPLE_KEY) || '[]');
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export function savePeople(list) {
  try {
    localStorage.setItem(PEOPLE_KEY, JSON.stringify(list));
    changed();
    return true;
  } catch {
    return false;
  }
}

// --- Saved readings (Profile) -------------------------------------
// A list of { kind: 'placement' | 'topic', id, title, sign, savedAt }.
// `sign` remembers which sign it was in when saved, so Profile can
// say so if you later change your birth details.

const SAVED_KEY = 'orbit.saved';

export function loadSaved() {
  try {
    const list = JSON.parse(localStorage.getItem(SAVED_KEY) || '[]');
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export function saveSaved(list) {
  try {
    localStorage.setItem(SAVED_KEY, JSON.stringify(list));
    changed();
    return true;
  } catch {
    return false;
  }
}

export const isSaved = (kind, id) => loadSaved().some((s) => s.kind === kind && s.id === id);

// --- A different person on the same computer ---------------------
// Someone types birth details that aren't the ones saved here: it's
// a new person, so the people and readings saved by the last person
// are forgotten (they're theirs, not yours).

export function sameBirth(a, b) {
  if (!a || !b) return false;
  const keys = ['year', 'month', 'day', 'hour', 'minute', 'timeKnown'];
  return keys.every((k) => a[k] === b[k]) && a.place?.label === b.place?.label;
}

export function startFresh() {
  try {
    for (const key of [PEOPLE_KEY, SAVED_KEY, 'orbit.lens', 'orbit.tour-done']) localStorage.removeItem(key);
  } catch { /* nothing to clear */ }
  changed();
}

// Everything ORBIT keeps in this browser, for "Download my data" and
// "Delete everything" on the Profile page.
export const ALL_KEYS = [KEY, PEOPLE_KEY, SAVED_KEY, 'orbit.lens', 'orbit.tour-done'];
