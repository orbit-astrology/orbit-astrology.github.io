// cloud.js
// ---------------------------------------------------------------
// ORBIT accounts: sign up, log in, log out, and keeping your chart,
// your people and your saved readings in sync with your account.
//
// How it fits together:
//   - The browser still keeps a working copy of everything
//     (localStorage, see store.js), so pages load instantly and the
//     site works without an account.
//   - When you're logged in, every change is also sent to your row
//     in the Supabase database (a table called orbit_data).
//   - When you log in on another device, your row is downloaded.
//
// We talk to Supabase with plain fetch() requests to its two web
// services: /auth/v1 (accounts) and /rest/v1 (the database). Your
// login is a "session": an access token (proves who you are, lasts
// about an hour) and a refresh token (gets a new access token).
// ---------------------------------------------------------------

import { SUPABASE_URL, SUPABASE_KEY } from './cloud-config.js?v=202610201606';

const SESSION_KEY = 'orbit.session';
const SYNCED_KEY = 'orbit.synced-at';
// The localStorage keys that hold your data (see store.js).
const DATA_KEYS = { birth: 'orbit.birth', people: 'orbit.connections', saved: 'orbit.saved' };
// Small per-person extras that are also forgotten when someone else
// takes over the browser (the chosen lens, whether the tour was seen).
const EXTRA_KEYS = ['orbit.lens', 'orbit.tour-done'];
// Remembers "keep what's on this device" while a new account waits
// for its email to be confirmed.
const KEEP_KEY = 'orbit.keep-for';

export const cloudReady = Boolean(SUPABASE_URL && SUPABASE_KEY);

// --- Small helpers ---------------------------------------------------

function read(key) {
  try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch { return null; }
}
function write(key, value) {
  try {
    if (value === null || value === undefined) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(value));
  } catch { /* storage blocked */ }
}

// Turn Supabase's error messages into plain words.
function friendly(data, status) {
  const text = `${data?.error_description || data?.msg || data?.message || data?.error || ''}`.toLowerCase();
  if (text.includes('invalid login')) return 'That email and password don’t match. Please try again.';
  if (text.includes('already registered') || text.includes('already been registered')) return 'There’s already an account with this email. Log in instead.';
  if (text.includes('not confirmed')) return 'Please confirm your email first: open the link we sent you.';
  if (text.includes('password') && text.includes('characters')) return 'Your password needs at least 8 characters.';
  if (text.includes('email') && text.includes('invalid')) return 'That email address doesn’t look right.';
  if (status === 429 || text.includes('rate limit')) return 'Too many tries in a short time. Please wait a minute and try again.';
  return 'Something went wrong talking to ORBIT’s server. Please try again.';
}

async function call(path, { method = 'GET', body, token, headers = {} } = {}) {
  let response;
  try {
    response = await fetch(`${SUPABASE_URL}${path}`, {
      method,
      headers: {
        apikey: SUPABASE_KEY,
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error('Can’t reach ORBIT’s server. Please check your internet connection.');
  }
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) {
    const error = new Error(friendly(data, response.status));
    error.notConfirmed = text.toLowerCase().includes('not confirmed'); // see finishSignUp
    throw error;
  }
  return data;
}

// --- Your session (being logged in) ---------------------------------

function saveSession(data) {
  write(SESSION_KEY, {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: Date.now() + (Number(data.expires_in) || 3600) * 1000,
    user: { id: data.user?.id, email: data.user?.email },
  });
}

export function currentUser() {
  return read(SESSION_KEY)?.user ?? null;
}

// A valid access token, refreshing it first if it has run out.
async function token() {
  const session = read(SESSION_KEY);
  if (!session) return null;
  if (Date.now() < session.expires_at - 60000) return session.access_token;
  try {
    saveSession(await call('/auth/v1/token?grant_type=refresh_token', { method: 'POST', body: { refresh_token: session.refresh_token } }));
    return read(SESSION_KEY).access_token;
  } catch {
    write(SESSION_KEY, null); // the login expired: log out quietly
    return null;
  }
}

// Where links in ORBIT's emails (confirm, reset password) should land.
const profileUrl = () => new URL('profile.html', location.href).href.split('#')[0];

// --- Sign up, log in, log out ----------------------------------------
// Every account is separate: you only ever see your own chart, people
// and saved readings, even on a computer someone else used before you.

// Forget everything personal in this browser (not the login itself).
export function clearThisDevice() {
  for (const key of [...Object.values(DATA_KEYS), ...EXTRA_KEYS, SYNCED_KEY, KEEP_KEY]) write(key, null);
}

// Is there anything personal in this browser right now? Used to offer
// "keep the chart on this device" when creating an account.
export function deviceHasData() {
  const d = localData();
  return Boolean((d.birth && !d.birth.isSample) || d.people.length || d.saved.length);
}

// keepHere: true = the chart, people and saved readings already in this
// browser become the new account's first contents. false = the new
// account starts completely empty.
// Returns 'logged-in', or 'check-email' when Supabase wants the email
// address confirmed first.
export async function signUp(email, password, keepHere = false) {
  const data = await call(`/auth/v1/signup?redirect_to=${encodeURIComponent(profileUrl())}`, { method: 'POST', body: { email, password } });
  if (keepHere) write(KEEP_KEY, email.toLowerCase());
  else clearThisDevice();
  if (!data?.access_token) return 'check-email';
  saveSession(data);
  await syncAfterLogin(keepHere);
  return 'logged-in';
}

// After "check your email": has the email been confirmed yet (maybe on
// another device, like a phone)? If so, log in here too and return
// true. If not yet, return false. The password is only kept in the
// page's memory while it waits, never saved.
export async function finishSignUp(email, password) {
  let data;
  try {
    data = await call('/auth/v1/token?grant_type=password', { method: 'POST', body: { email, password } });
  } catch (error) {
    if (error.notConfirmed) return false;
    throw error;
  }
  saveSession(data);
  await syncAfterLogin(read(KEEP_KEY) === email.toLowerCase());
  return true;
}

// Logging in shows that account's things only: whatever was in this
// browser before (maybe from someone else) is replaced.
export async function logIn(email, password) {
  saveSession(await call('/auth/v1/token?grant_type=password', { method: 'POST', body: { email, password } }));
  await syncAfterLogin(false);
}

// Logging out also clears your data from this browser (it stays safe
// in your account), so the next person using this device can't see it.
export async function logOut() {
  const t = await token();
  if (t) { try { await call('/auth/v1/logout', { method: 'POST', token: t }); } catch { /* logged out locally anyway */ } }
  write(SESSION_KEY, null);
  clearThisDevice();
}

export async function sendPasswordReset(email) {
  await call(`/auth/v1/recover?redirect_to=${encodeURIComponent(profileUrl())}`, { method: 'POST', body: { email } });
}

export async function setNewPassword(password) {
  await call('/auth/v1/user', { method: 'PUT', token: await token(), body: { password } });
}

// Deletes the account and everything in it (a database function that
// only ever deletes the person asking: development/docs/supabase-setup.sql).
export async function deleteAccount() {
  await call('/rest/v1/rpc/delete_my_account', { method: 'POST', token: await token(), body: {} });
  write(SESSION_KEY, null);
  write(SYNCED_KEY, null);
}

// --- Keeping your data in sync ---------------------------------------

const localData = () => ({
  birth: read(DATA_KEYS.birth),
  people: read(DATA_KEYS.people) || [],
  saved: read(DATA_KEYS.saved) || [],
});

let pulling = false; // true while we copy account data into the browser

function writeLocal({ birth, people, saved }) {
  pulling = true;
  write(DATA_KEYS.birth, birth ?? null);
  write(DATA_KEYS.people, people || []);
  write(DATA_KEYS.saved, saved || []);
  pulling = false;
}

async function fetchRow() {
  const user = currentUser();
  const t = await token();
  if (!user || !t) return null;
  const rows = await call(`/rest/v1/orbit_data?select=birth,people,saved,updated_at&user_id=eq.${user.id}`, { token: t });
  return rows?.[0] ?? null;
}

// Send everything in this browser to your account.
export async function push() {
  const user = currentUser();
  const t = await token();
  if (!user || !t) return;
  const data = localData();
  const birth = data.birth?.isSample ? null : data.birth; // the made-up sample is never saved
  const rows = await call('/rest/v1/orbit_data', {
    method: 'POST',
    token: t,
    headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
    body: { user_id: user.id, birth, people: data.people, saved: data.saved, updated_at: new Date().toISOString() },
  });
  write(SYNCED_KEY, rows?.[0]?.updated_at ?? new Date().toISOString());
}

// Right after logging in.
//   keepHere = false (logging in): this browser shows exactly what's in
//     your account, nothing else. A brand-new account = a blank start.
//   keepHere = true (a new account that chose to keep this device's
//     chart): what's in this browser is saved to the account.
async function syncAfterLogin(keepHere) {
  write(KEEP_KEY, null);
  const row = await fetchRow();
  if (keepHere) {
    await push();
    return;
  }
  for (const key of EXTRA_KEYS) write(key, null); // the tour and lens start fresh too
  writeLocal(row ?? { birth: null, people: [], saved: [] });
  write(SYNCED_KEY, row?.updated_at ?? null);
}

// Every change saved in the browser (store.js announces it) is sent to
// your account a moment later. Several quick changes = one request.
let pushTimer = null;
window.addEventListener('orbit:changed', () => {
  if (pulling || !currentUser() || !cloudReady) return;
  clearTimeout(pushTimer);
  pushTimer = setTimeout(() => push().catch(() => { /* tried again on the next change */ }), 800);
});

// --- When any page opens -----------------------------------------------
// 1. Coming back from a link in one of ORBIT's emails: log in.
// 2. If your account was changed on another device since this browser
//    last synced, download it and reload the page once.
// Returns 'recovery' when the email link was a password reset.
// It runs once per page, however many times it's asked.
let started = null;
export function startCloud() {
  started ??= openPage();
  return started;
}

async function openPage() {
  if (!cloudReady) return null;
  let mode = null;
  const hash = new URLSearchParams(location.hash.slice(1));
  if (hash.get('access_token')) {
    try {
      const access = hash.get('access_token');
      const user = await call('/auth/v1/user', { token: access });
      saveSession({ access_token: access, refresh_token: hash.get('refresh_token'), expires_in: hash.get('expires_in'), user });
      mode = hash.get('type') === 'recovery' ? 'recovery' : 'confirmed';
      history.replaceState(null, '', location.pathname + location.search);
      // Confirming a new account in the same browser where it was made,
      // after ticking "keep the chart on this device": keep it.
      const keepHere = hash.get('type') === 'signup' && read(KEEP_KEY) === user.email?.toLowerCase();
      await syncAfterLogin(keepHere);
    } catch { /* an old or used link: nothing happens */ }
  }
  if (currentUser()) {
    try {
      const row = await fetchRow();
      const lastSync = read(SYNCED_KEY);
      if (row && row.updated_at !== lastSync && JSON.stringify(row.birth) !== JSON.stringify(localData().birth || null)) {
        writeLocal(row);
        write(SYNCED_KEY, row.updated_at);
        if (sessionStorage.getItem('orbit.reloaded') !== row.updated_at) {
          sessionStorage.setItem('orbit.reloaded', row.updated_at);
          location.reload();
        }
      } else if (row) {
        // Same birth details: just take the newest lists.
        if (row.updated_at !== lastSync) { writeLocal({ ...localData(), people: row.people, saved: row.saved }); write(SYNCED_KEY, row.updated_at); }
      }
    } catch { /* offline: keep using the browser's copy */ }
  }
  return mode;
}
