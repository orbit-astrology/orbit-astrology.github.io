// welcome.js
// ---------------------------------------------------------------
// The Welcome page: the birth form.
//
// What happens when you press "Generate my chart":
//   1. check every field and calculate the chart (js/birth-form.js)
//   2. save the birth details in this browser (js/store.js)
//   3. go to My Universe, which reads them and shows your chart
//
// To keep the page calm, the account box (log in / create account) only
// opens when you press "Log in" at the top (or when you're logged in).
// If you're logged in and your chart is already saved, the form is
// replaced by a "Welcome back" link to your universe.
// ---------------------------------------------------------------

import { skyAt } from '../astro/sky.js?v=202611121751';
import { drawWheel } from '../wheel.js?v=202611121751';
import { setUpGlossary } from '../glossary.js?v=202611121751';
import { setUpBirthForm } from '../birth-form.js?v=202611121751';
import { startCloud, currentUser, cloudReady } from '../cloud.js?v=202611121751';
import { setUpAccountPanel } from '../account-panel.js?v=202611121751';
import { saveBirth, loadBirth, sameBirth, startFresh, SAMPLE_BIRTH } from '../store.js?v=202611121751';

const $ = (id) => document.getElementById(id);

setUpGlossary();

// --- The real sky right now, drawn faintly behind the title --------

const sky = skyAt(new Date());
$('sky-now').append(drawWheel(sky, { label: 'The sky right now' }));

// --- A first glimpse: your Sun and Moon -----------------------------
// As soon as a whole birthday is typed, show the Sun and Moon signs,
// before the rest of the form. A birthday covers different moments
// around the world, so we check that whole day in every time zone
// (from UTC+14 to UTC−12). If a sign changed during it, we say both:
// the birth time and place decide which one (never a guess).

const HOUR = 3600000;
const SYMBOL = { sun: '☉', moon: '☽' };

function signsOnBirthday(id, year, month, day) {
  const start = Date.UTC(year, month - 1, day) - 14 * HOUR;
  const end = Date.UTC(year, month - 1, day) + 36 * HOUR;
  const signs = [];
  for (let t = start; t <= end; t += 2 * HOUR) {
    const sign = skyAt(new Date(t)).bodies.find((b) => b.id === id).sign;
    if (!signs.includes(sign)) signs.push(sign);
  }
  return signs;
}

function previewLine(id, label, meaning, signs) {
  const line = document.createElement('p');
  const symbol = document.createElement('span');
  symbol.className = 'preview-symbol';
  symbol.setAttribute('aria-hidden', 'true');
  symbol.textContent = SYMBOL[id];
  const sign = document.createElement('strong');
  sign.textContent = signs.join(' or ');
  line.append(symbol, `Your ${label} sign (${meaning}): `, sign);
  if (signs.length > 1) line.append('. Your birth time and place decide which.');
  return line;
}

function showPreview() {
  const box = $('birth-preview');
  const day = Number($('birth-day').value);
  const month = Number($('birth-month').value);
  const year = Number($('birth-year').value);
  const real = new Date(Date.UTC(year, month - 1, day));
  const complete = Number.isInteger(day) && month && year >= 1900 && year <= 2100 &&
    real.getUTCDate() === day && real.getUTCMonth() === month - 1;
  if (!complete) { box.hidden = true; return; }
  const next = document.createElement('p');
  next.className = 'preview-next';
  next.textContent = 'Add your city below to see your whole chart.';
  box.replaceChildren(
    previewLine('sun', 'Sun', 'who you are at heart', signsOnBirthday('sun', year, month, day)),
    previewLine('moon', 'Moon', 'how you feel', signsOnBirthday('moon', year, month, day)),
    next,
  );
  box.hidden = false;
}
for (const id of ['birth-day', 'birth-month', 'birth-year']) $(id).addEventListener('input', showPreview);
$('birth-month').addEventListener('change', showPreview);

// --- Coming back? Offer a shortcut ----------------------------------

const hasChart = () => { const b = loadBirth(); return Boolean(b && !b.isSample); };

let accountOpen = false; // has "Log in" been pressed?

function showRightSide() {
  const loggedIn = Boolean(currentUser());
  $('account').hidden = !loggedIn && !accountOpen;
  $('login-link').hidden = loggedIn || !cloudReady;
  $('login-link').setAttribute('aria-expanded', String(accountOpen));
  const welcomeBack = loggedIn && hasChart();
  $('welcome-back').hidden = !welcomeBack;
  $('create').hidden = welcomeBack;
  $('continue-link').hidden = welcomeBack || !hasChart();
}

// --- The form -------------------------------------------------------

function goToUniverse(birth, showError) {
  // Not logged in, and these aren't the birth details saved here? Then
  // it's someone new on this computer: forget the last person's people
  // and saved readings so they don't see them.
  const before = loadBirth();
  if (!currentUser() && before && !sameBirth(before, birth)) startFresh();
  if (!saveBirth(birth)) {
    showError('Your browser is blocking ORBIT from saving your details (this can happen in private browsing). Please allow site data and try again.');
    return;
  }
  // Came here from a friend's invitation? Go straight back to it.
  let pending = null;
  try { pending = localStorage.getItem('orbit.pending-add'); localStorage.removeItem('orbit.pending-add'); } catch { /* none */ }
  window.location.href = pending ? `connections.html#${pending}` : 'universe.html';
}

setUpBirthForm({
  form: $('create'),
  prefix: 'birth-',
  whose: 'your',
  onSuccess: (birth, chart, showError) => goToUniverse(birth, showError),
});

$('sample').addEventListener('click', () => goToUniverse(SAMPLE_BIRTH, (m) => { $('birth-form-error').textContent = m; }));

// --- Your account ---------------------------------------------------

const mode = await startCloud(); // logs you in from an email link, and syncs
showRightSide();

// "Log in" at the top opens the account box (press again to close it).
$('login-link').addEventListener('click', () => {
  accountOpen = !accountOpen;
  showRightSide();
  if (accountOpen) {
    $('mode-login').click(); // show the log-in form straight away
    $('account').scrollIntoView({ block: 'nearest' });
  }
});
setUpAccountPanel({
  mode,
  collapsed: true,
  onChange(event) {
    // Logged in and your account already has a chart: straight to it.
    if (event === 'login' && hasChart()) { window.location.href = 'universe.html'; return; }
    // Logged out: reload, so the form starts completely empty.
    if (event === 'logout') { window.location.reload(); return; }
    showRightSide();
  },
});
