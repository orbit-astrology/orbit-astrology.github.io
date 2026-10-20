// save-button.js
// ---------------------------------------------------------------
// The small "Save" button on readings (My Chart) and topics (Explore).
// Saved things appear on the Profile page. Saved only in this browser.
// ---------------------------------------------------------------

import { loadSaved, saveSaved } from './store.js?v=202610201450';

// item: { kind: 'placement' | 'topic', id, title, sign }
export function saveButton(item) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'save-button';

  const show = () => {
    const saved = loadSaved().some((s) => s.kind === item.kind && s.id === item.id);
    button.setAttribute('aria-pressed', String(saved));
    button.textContent = saved ? 'Saved to your profile ✓' : 'Save to my profile';
  };

  button.addEventListener('click', () => {
    const list = loadSaved();
    const already = list.some((s) => s.kind === item.kind && s.id === item.id);
    const next = already
      ? list.filter((s) => !(s.kind === item.kind && s.id === item.id))
      : [...list, { ...item, savedAt: new Date().toISOString() }];
    if (!saveSaved(next)) {
      button.textContent = 'Your browser is blocking saving';
      return;
    }
    show();
  });

  show();
  return button;
}
