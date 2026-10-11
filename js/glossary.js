// glossary.js
// ---------------------------------------------------------------
// Makes every astrology word on a page explain itself.
//
// In the HTML, a word is written like this:
//   <button type="button" class="term" data-term="rising">Rising sign</button>
// Hovering, focusing (keyboard) or tapping it shows a small box with
// the plain explanation from js/content/glossary.js.
// ---------------------------------------------------------------

import { GLOSSARY } from './content/glossary.js';

let open = null; // the pop-up currently showing, if any

function close() {
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
}

// Turn on every .term inside `root` (the whole page by default).
export function setUpGlossary(root = document) {
  for (const button of root.querySelectorAll('.term:not([data-ready])')) {
    button.dataset.ready = 'true';
    button.setAttribute('aria-expanded', 'false');
    button.addEventListener('mouseenter', () => show(button));
    button.addEventListener('mouseleave', close);
    button.addEventListener('focus', () => show(button));
    button.addEventListener('blur', close);
    button.addEventListener('click', (e) => {
      e.preventDefault();
      if (open && open.button === button) close(); else show(button);
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
