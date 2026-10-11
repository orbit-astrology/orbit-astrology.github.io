// store.js
// ---------------------------------------------------------------
// Remembers the birth details between pages.
//
// For now everything is saved only in this browser (localStorage).
// That means: it stays when you reload or come back later on the
// same device, but it doesn't follow you to other devices, and it
// disappears if you clear your browser data. Real accounts come
// later. We save the birth DETAILS, not the chart: the chart is
// recalculated from them every time, so it's always correct.
// ---------------------------------------------------------------

import { SETTINGS } from './astro/settings.js?v=202610112058';

const KEY = 'orbit.birth';

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
  try { localStorage.removeItem(KEY); } catch { /* nothing to clear */ }
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
    return true;
  } catch {
    return false;
  }
}

export const isSaved = (kind, id) => loadSaved().some((s) => s.kind === kind && s.id === id);

// Everything ORBIT keeps in this browser, for "Download my data" and
// "Delete everything" on the Profile page.
export const ALL_KEYS = [KEY, PEOPLE_KEY, SAVED_KEY, 'orbit.lens'];
