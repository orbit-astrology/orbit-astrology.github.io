// welcome.js
// ---------------------------------------------------------------
// The Welcome page: the birth form.
//
// What happens when you press "Generate my chart":
//   1. check every field and calculate the chart (js/birth-form.js)
//   2. save the birth details in this browser (js/store.js)
//   3. go to My Universe, which reads them and shows your chart
// ---------------------------------------------------------------

import { skyAt } from '../astro/sky.js?v=202610141025';
import { drawWheel } from '../wheel.js?v=202610141025';
import { setUpGlossary } from '../glossary.js?v=202610141025';
import { setUpBirthForm } from '../birth-form.js?v=202610141025';
import { saveBirth, loadBirth, SAMPLE_BIRTH } from '../store.js?v=202610141025';

const $ = (id) => document.getElementById(id);

setUpGlossary();

// --- The real sky right now, drawn faintly behind the title --------

const sky = skyAt(new Date());
$('sky-now').append(drawWheel(sky, { label: 'The sky right now' }));
const sunNow = sky.bodies.find((b) => b.id === 'sun').sign;
const moonNow = sky.bodies.find((b) => b.id === 'moon').sign;
$('sky-caption').textContent = `The faint wheel is the real sky right now: the Sun is in ${sunNow} and the Moon is in ${moonNow}.`;

// --- Coming back? Offer a shortcut ----------------------------------

const saved = loadBirth();
if (saved && !saved.isSample) $('continue-link').hidden = false;

// --- The form -------------------------------------------------------

function goToUniverse(birth, showError) {
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
