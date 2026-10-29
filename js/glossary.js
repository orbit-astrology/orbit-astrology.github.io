// glossary.js
// ---------------------------------------------------------------
// Makes every astrology word on a page explain itself.
//
// In the HTML, a word is written like this:
//   <button type="button" class="term" data-term="rising">Rising sign</button>
// Resting the mouse on it, focusing it (keyboard) or tapping it shows a
// small box with the plain explanation from js/content/glossary.js.
// ---------------------------------------------------------------

import { GLOSSARY } from './content/glossary.js?v=202610291945';

let open = null; // the pop-up currently showing, if any
let waiting = null; // a hover that hasn't lasted long enough yet
const HOVER_DELAY = 300; // milliseconds: the mouse must rest on the word, not just pass over it
let openedAt = 0; // when the pop-up opened (see the click handler)

function close() {
  clearTimeout(waiting);
  if (!open) return;
  open.popup.hidden = true;
  open.button.setAttribute('aria-expanded', 'false');
  open = null;
}

function show(button) {
  if (open && open.button === button) return;
  close();
  let popup = button.querySelector('.term-popup');
  if (!popup) {
    const entry = GLOSSARY[button.dataset.term];
    if (!entry) return;
    popup = document.createElement('span');
    popup.className = 'term-popup';
    popup.id = `term-${button.dataset.term}-${Math.random().toString(36).slice(2, 7)}`;
    popup.setAttribute('role', 'tooltip');
    const title = document.createElement('strong');
    title.textContent = entry.term;
    popup.append(title, entry.text);
    button.append(popup);
    button.setAttribute('aria-describedby', popup.id);
  }
  popup.hidden = false;
  button.setAttribute('aria-expanded', 'true');
  open = { button, popup };
  openedAt = Date.now();
}

// Turn on every .term inside `root` (the whole page by default).
export function setUpGlossary(root = document) {
  for (const button of root.querySelectorAll('.term:not([data-ready])')) {
    button.dataset.ready = 'true';
    button.setAttribute('aria-expanded', 'false');
    // Hover only counts for a real mouse: phones send pretend mouse
    // events around a tap, which would close the box straight away.
    button.addEventListener('pointerenter', (e) => {
      if (e.pointerType !== 'mouse') return;
      clearTimeout(waiting);
      waiting = setTimeout(() => show(button), HOVER_DELAY);
    });
    button.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') close(); });
    button.addEventListener('focus', () => show(button));
    button.addEventListener('blur', close);
    // A click or tap opens the box. Clicking again closes it, unless it
    // only just opened from the same click (a tap also counts as
    // "focus", which opens it a moment before the click arrives).
    button.addEventListener('click', (e) => {
      e.preventDefault();
      clearTimeout(waiting);
      const justOpened = Date.now() - openedAt < 500;
      if (open && open.button === button && !justOpened) close(); else show(button);
    });
  }
}

// Escape closes the pop-up (an accessibility requirement for tooltips).
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });

// Small helper so page scripts can write a term without repeating markup.
export function termButton(key, label) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'term';
  button.dataset.term = key;
  button.textContent = label;
  return button;
}
