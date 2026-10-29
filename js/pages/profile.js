// profile.js
// ---------------------------------------------------------------
// The Profile page:
//   1. your details: see them, and change them with the same form
//      and checks as the Welcome page
//   2. saved readings: the readings and topics you saved
//   3. your data: what ORBIT keeps in this browser, with
//      "Download my data" and "Delete everything"
//
// Everything lives in this browser (localStorage) and, when you're
// logged in, in your ORBIT account too (js/cloud.js). The page says
// honestly where your data is.
// ---------------------------------------------------------------

import { calculateChart } from '../astro/chart.js?v=202610291947';
import { setUpGlossary } from '../glossary.js?v=202610291947';
import { setUpMenu, showSampleBanner } from '../layout.js?v=202610291947';
import { setUpBirthForm } from '../birth-form.js?v=202610291947';
import { placements, risingText, marginText } from '../readings.js?v=202610291947';
import { topicById } from '../content/topics.js?v=202610291947';
import { startCloud, cloudReady, currentUser, deleteAccount } from '../cloud.js?v=202610291947';
import { setUpAccountPanel } from '../account-panel.js?v=202610291947';
import { loadBirth, saveBirth, loadPeople, loadSaved, saveSaved, ALL_KEYS } from '../store.js?v=202610291947';

const $ = (id) => document.getElementById(id);
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const two = (n) => String(n).padStart(2, '0');

function make(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

setUpMenu();
setUpGlossary();

let me = loadBirth();
showSampleBanner(me);

// Your own chart (not the sample), or null.
function myChart() {
  if (!me || me.isSample) return null;
  const result = calculateChart(me);
  return result.status === 'ok' ? result.chart : null;
}

// =====================================================================
// 1. Your details
// =====================================================================

function showDetails() {
  const chart = myChart();
  const list = $('details-list');
  list.replaceChildren();
  const row = (label, value) => {
    const div = make('div');
    div.append(make('dt', '', label), make('dd', '', value));
    list.append(div);
  };

  $('profile-title').textContent = chart && me.name ? `Hello, ${me.name}` : 'Your profile';

  if (!chart) {
    list.hidden = true;
    $('details-note').textContent = me?.isSample
      ? 'You’re looking at the made-up sample chart, so there’s no profile yet. Create your own chart and your details will appear here.'
      : 'You haven’t created your chart yet. Add your birth details and ORBIT will calculate it.';
    $('edit-details').textContent = 'Create my chart';
    return;
  }

  list.hidden = false;
  const body = (id) => chart.bodies.find((b) => b.id === id);
  const sign = (b) => (b.uncertain ? b.possibleSigns.join(' or ') : b.sign);
  row('Name', me.name || 'Not added');
  row('Born', `${me.day} ${MONTHS[me.month - 1]} ${me.year}`);
  row('Time', !me.timeKnown ? 'Unknown (no Rising sign or houses)'
    : me.margin ? `Around ${two(me.hour)}:${two(me.minute)} (${marginText(me.margin)})` : `${two(me.hour)}:${two(me.minute)}`);
  row('Place', me.place.label);
  row('Big Three', `Sun in ${sign(body('sun'))} · Moon in ${sign(body('moon'))} · Rising ${risingText(chart) ?? 'unknown'}`);
  $('details-note').textContent = '';
  $('edit-details').textContent = 'Edit my details';
}

const form = setUpBirthForm({
  form: $('me'),
  prefix: 'me-',
  whose: 'your',
  onSuccess(birth, chart, showError) {
    // Only now, with the new chart calculated, do we replace the old details.
    const name = $('me-name').value.trim().slice(0, 40);
    const next = name ? { ...birth, name } : birth;
    if (!saveBirth(next)) {
      showError('Your browser is blocking ORBIT from saving (this can happen in private browsing). Please allow site data and try again.');
      return;
    }
    me = loadBirth();
    closeForm();
    showDetails();
    showSaved();
    showData();
    document.querySelector('.sample-banner')?.remove();
    $('details-saved').textContent = 'Saved. Your chart has been recalculated, and every page now uses your new details.';
  },
});

function openForm() {
  form.reset();
  const editing = me && !me.isSample;
  if (editing) {
    form.fill(me);
    $('me-name').value = me.name || '';
  }
  $('me-submit').textContent = editing ? 'Save and recalculate' : 'Create my chart';
  $('details-view').hidden = true;
  $('me').hidden = false;
  $('me-day').focus();
}

function closeForm() {
  $('me').hidden = true;
  $('details-view').hidden = false;
  $('details-title').focus();
}

$('edit-details').addEventListener('click', () => { $('details-saved').textContent = ''; openForm(); });
$('me-cancel').addEventListener('click', closeForm);

// =====================================================================
// 2. Saved readings
// =====================================================================

function showSaved() {
  const saved = loadSaved();
  const chart = myChart();
  const now = chart ? Object.fromEntries(placements(chart).map((p) => [p.id, p])) : {};
  const list = $('saved-list');
  list.replaceChildren();
  $('saved-empty').hidden = saved.length > 0;

  for (const item of saved) {
    const li = make('li', 'saved-item');
    const main = make('div', 'saved-main');
    const link = make('a');
    const title = make('h3', 'saved-title');
    let note = null;

    if (item.kind === 'topic') {
      const topic = topicById[item.id];
      link.textContent = topic ? topic.name : item.title;
      link.href = `explore.html#${item.id}`;
      main.append(make('p', 'saved-kind', 'Explore topic'));
    } else {
      // A placement: check it against your chart as it is now.
      const p = now[item.id];
      const signNow = p ? (p.uncertain ? p.possibleSigns.join(' or ') : p.sign) : null;
      link.textContent = p ? `${p.short} in ${signNow}` : item.title;
      link.href = `chart.html#${item.id}`;
      main.append(make('p', 'saved-kind', 'My Chart reading'));
      if (!p) {
        note = make('p', 'saved-note changed', 'Not in your chart right now: it needs an exact birth time.');
      } else if (item.sign && signNow !== item.sign) {
        note = make('p', 'saved-note changed', `Updated: when you saved it, it was ${item.title}. Your birth details have changed since.`);
      }
    }

    title.append(link);
    main.append(title);
    if (note) main.append(note);
    main.append(make('p', 'saved-note', `Saved ${new Date(item.savedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`));

    const remove = make('button', 'link-button', 'Remove');
    remove.type = 'button';
    remove.setAttribute('aria-label', `Remove ${link.textContent} from saved readings`);
    remove.addEventListener('click', () => {
      saveSaved(loadSaved().filter((s) => !(s.kind === item.kind && s.id === item.id)));
      showSaved();
      showData();
      $('saved-title').setAttribute('tabindex', '-1');
      $('saved-title').focus();
    });

    li.append(main, remove);
    list.append(li);
  }
}

// =====================================================================
// 3. Your data
// =====================================================================

function counts() {
  return {
    account: currentUser()?.email ?? null,
    birth: Boolean(me && !me.isSample),
    people: loadPeople().length,
    saved: loadSaved().length,
  };
}

const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

function showData() {
  const c = counts();
  // Where your data lives depends on whether you're logged in.
  $('data-where').textContent = c.account
    ? 'You’re logged in, so everything is saved in this browser and in your ORBIT account, which you can open on any device.'
    : 'You’re not logged in, so everything is saved only in this browser, on this device. It doesn’t follow you to your phone or another computer, and clearing your browser data deletes it.';
  $('data-server').textContent = c.account
    ? 'Your account is stored with Supabase (ORBIT’s database), protected so that only you can read it. The place search also receives the city name you type.'
    : `Your birth details are never sent to a server. The only thing that leaves your browser is the city name you type into the place search.${cloudReady ? ' Create an account above to keep them safe online.' : ''}`;
  const list = $('data-list');
  list.replaceChildren(
    ...(c.account ? [make('li', '', `Your account: ${c.account}`)] : []),
    make('li', '', c.birth ? 'Your birth details and name' : 'No birth details of your own'),
    make('li', '', `${plural(c.people, 'person')} in Connections`.replace('persons', 'people')),
    make('li', '', plural(c.saved, 'saved reading')),
  );
}

// Download: one file with everything, in a format any computer can open (JSON).
$('download').addEventListener('click', () => {
  const data = {
    about: 'Everything ORBIT had saved in this browser.',
    exported: new Date().toISOString(),
    birthDetails: me && !me.isSample ? me : null,
    connections: loadPeople(),
    savedReadings: loadSaved(),
  };
  const file = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const link = make('a');
  link.href = URL.createObjectURL(file);
  link.download = 'orbit-my-data.json';
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
});

// Delete everything: asks first, right on the page.
$('delete-all').addEventListener('click', () => {
  const c = counts();
  const parts = [];
  if (c.account) parts.push(`your account (${c.account})`);
  if (c.birth) parts.push('your birth details');
  if (c.people) parts.push(plural(c.people, 'person').replace('persons', 'people') + ' in Connections');
  if (c.saved) parts.push(plural(c.saved, 'saved reading'));
  $('delete-question').textContent = parts.length
    ? `Delete ${parts.length > 1 ? `${parts.slice(0, -1).join(', ')} and ${parts.at(-1)}` : parts[0]} ${c.account ? ' for good, on every device' : ' from this browser'}? This can’t be undone.`
    : 'There’s nothing of yours saved here, but this also clears the sample chart. Continue?';
  $('delete-all').hidden = true;
  $('delete-confirm').hidden = false;
  $('delete-no').focus();
});
$('delete-no').addEventListener('click', () => {
  $('delete-confirm').hidden = true;
  $('delete-all').hidden = false;
  $('delete-all').focus();
});
$('delete-yes').addEventListener('click', async () => {
  // Logged in: delete the account on the server first.
  if (currentUser()) {
    try {
      await deleteAccount();
    } catch (error) {
      $('delete-error').textContent = `Your account couldn’t be deleted: ${error.message}`;
      return;
    }
  }
  try { for (const key of ALL_KEYS) localStorage.removeItem(key); } catch { /* nothing to delete */ }
  window.location.href = 'index.html';
});

// =====================================================================
// Start
// =====================================================================

// Accounts: log in from an email link, sync, then set up the account box.
const mode = await startCloud();
me = loadBirth();
setUpAccountPanel({
  mode,
  keepByDefault: true, // on Profile you usually sign up to keep the chart you just made
  onChange() {
    me = loadBirth();
    showDetails();
    showSaved();
    showData();
  },
});

showDetails();
showSaved();
showData();
