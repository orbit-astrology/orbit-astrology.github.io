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

import { skyAt } from '../astro/sky.js?v=202610211325';
import { drawWheel } from '../wheel.js?v=202610211325';
import { setUpGlossary } from '../glossary.js?v=202610211325';
import { setUpBirthForm } from '../birth-form.js?v=202610211325';
import { startCloud, currentUser, cloudReady } from '../cloud.js?v=202610211325';
import { setUpAccountPanel } from '../account-panel.js?v=202610211325';
import { saveBirth, loadBirth, sameBirth, startFresh, SAMPLE_BIRTH } from '../store.js?v=202610211325';

const $ = (id) => document.getElementById(id);

setUpGlossary();

// --- The real sky right now, drawn faintly behind the title --------

const sky = skyAt(new Date());
$('sky-now').append(drawWheel(sky, { label: 'The sky right now' }));
const sunNow = sky.bodies.find((b) => b.id === 'sun').sign;
const moonNow = sky.bodies.find((b) => b.id === 'moon').sign;
$('sky-caption').textContent = `The faint wheel is the real sky right now: the Sun is in ${sunNow} and the Moon is in ${moonNow}.`;

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
  window.location.href = 'universe.html';
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
