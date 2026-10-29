// layout.js
// ---------------------------------------------------------------
// Small things every page needs:
//   - the menu (always visible: on phones it becomes two rows of tabs)
//   - the strip that says "You're viewing a sample chart"
// ---------------------------------------------------------------

import { startCloud } from './cloud.js?v=202610291953';

export function setUpMenu() {
  startCloud(); // accounts: log in from email links, keep this device in sync (js/cloud.js)
  setUpBackLink(); // every page with the menu also gets the "Back to …" button
}

export function showSampleBanner(birth) {
  if (!birth?.isSample) return;
  const banner = document.createElement('div');
  banner.className = 'sample-banner';
  banner.setAttribute('role', 'note');
  banner.innerHTML = 'You’re viewing a sample chart for a made-up person. <a href="index.html#create">Create your own</a>';
  document.body.prepend(banner);
}

// ---------------------------------------------------------------
// "← Back to …" button
// When you follow a link inside a page (like "Read more →" on My
// Universe) to another page, a small button appears in the corner
// that takes you back to exactly where you were, at the same scroll
// position. The top menu doesn't count: that's choosing a new page.
// Saved in sessionStorage, which is forgotten when the tab is closed.
// ---------------------------------------------------------------

const RETURN_KEY = 'orbit.return';
const RESTORE_KEY = 'orbit.restore';
const PAGE_NAMES = {
  'universe.html': 'My Universe',
  'chart.html': 'My Chart',
  'explore.html': 'Explore',
  'connections.html': 'Connections',
  'profile.html': 'Profile',
};
const pageOf = (url) => new URL(url, location.href).pathname.split('/').pop() || 'index.html';

function readSession(key) {
  try { return JSON.parse(sessionStorage.getItem(key) || 'null'); } catch { return null; }
}
function writeSession(key, value) {
  try {
    if (value === null) sessionStorage.removeItem(key);
    else sessionStorage.setItem(key, JSON.stringify(value));
  } catch { /* storage blocked: the button just won't appear */ }
}

export function setUpBackLink() {
  // 1. Remember where you were when you follow a link to another page.
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href]');
    if (!link || link.target === '_blank' || link.hasAttribute('download')) return;
    const to = new URL(link.href, location.href);
    if (to.origin !== location.origin) return;
    if (link.closest('.site-nav, .brand, .back-chip')) { writeSession(RETURN_KEY, null); return; }
    if (pageOf(to.href) === pageOf(location.href)) return; // same page: it has its own back links
    if (!PAGE_NAMES[pageOf(location.href)]) return;
    writeSession(RETURN_KEY, { url: location.href, y: window.scrollY, page: pageOf(location.href) });
  }, true);

  // 2. Coming back: scroll to where you were.
  const restore = readSession(RESTORE_KEY);
  if (restore && restore.url === location.href) {
    writeSession(RESTORE_KEY, null);
    window.addEventListener('load', () => setTimeout(() => window.scrollTo(0, restore.y), 400));
  }

  // 3. Show the button if you arrived here from another page's link.
  const back = readSession(RETURN_KEY);
  if (!back || back.page === pageOf(location.href)) return;
  const button = document.createElement('a');
  button.className = 'back-chip';
  button.href = back.url;
  button.textContent = `← Back to ${PAGE_NAMES[back.page]}`;
  button.addEventListener('click', () => {
    writeSession(RETURN_KEY, null);
    writeSession(RESTORE_KEY, { url: back.url, y: back.y });
  });
  document.body.append(button);
}
