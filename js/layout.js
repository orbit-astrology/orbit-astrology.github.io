// layout.js
// ---------------------------------------------------------------
// Small things every page needs:
//   - the "Menu" button that opens and closes the menu on phones
//   - the strip that says "You're viewing a sample chart"
// ---------------------------------------------------------------

export function setUpMenu() {
  const button = document.querySelector('.menu-button');
  const nav = document.getElementById('site-nav');
  if (!button || !nav) return;

  const phone = window.matchMedia('(max-width: 760px)');

  function sync() {
    // On a phone the menu starts closed; on a computer it's always visible.
    if (phone.matches) {
      nav.hidden = button.getAttribute('aria-expanded') !== 'true';
    } else {
      nav.hidden = false;
    }
  }

  button.addEventListener('click', () => {
    const isOpen = button.getAttribute('aria-expanded') === 'true';
    button.setAttribute('aria-expanded', String(!isOpen));
    sync();
  });
  phone.addEventListener('change', sync);
  sync();
}

export function showSampleBanner(birth) {
  if (!birth?.isSample) return;
  const banner = document.createElement('div');
  banner.className = 'sample-banner';
  banner.setAttribute('role', 'note');
  banner.innerHTML = 'You’re viewing a sample chart for a made-up person. <a href="index.html#create">Create your own</a>';
  document.body.prepend(banner);
}
