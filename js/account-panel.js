// account-panel.js
// ---------------------------------------------------------------
// The "Your account" box (on the Welcome page and the Profile page):
// log in, create an account, forgot password, choose a new password,
// log out. The talking-to-the-server part is in cloud.js.
// ---------------------------------------------------------------

import { cloudReady, currentUser, signUp, logIn, logOut, sendPasswordReset, setNewPassword, deviceHasData, finishSignUp } from './cloud.js?v=202610291953';
import { loadBirth } from './store.js?v=202610291953';

const $ = (id) => document.getElementById(id);

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/**
 * mode      – what startCloud() reported: 'recovery' after a password
 *             reset link, 'confirmed' after confirming an email, or null
 * onChange  – called after logging in ('login'), creating an account
 *             ('signup') or logging out ('logout'), so the page can refresh
 * collapsed – true: only the two buttons show until one is pressed
 *             (Welcome page); false: the log-in form shows straight away
 * keepByDefault – whether "keep the chart on this device" starts ticked
 */
export function setUpAccountPanel({ mode, onChange, collapsed = false, keepByDefault = false }) {
  let signingUp = false;
  const message = $('account-message');
  $('account-keep').checked = keepByDefault;

  // "Also save the chart on this device to my new account", with the
  // birth date so you can tell whose it is.
  function showKeep() {
    const offer = signingUp && deviceHasData();
    $('account-keep-field').hidden = !offer;
    if (!offer) return;
    const b = loadBirth();
    $('account-keep-what').textContent = b && !b.isSample
      ? `the chart on this device (born ${b.day} ${MONTHS[b.month - 1]} ${b.year}${b.place?.label ? `, ${b.place.label.split(',')[0]}` : ''}) and anything saved with it`
      : 'the people and readings saved on this device';
  }

  function show() {
    const user = currentUser();
    $('account-off').hidden = cloudReady;
    $('account-out').hidden = !cloudReady || Boolean(user);
    $('account-in').hidden = !user;
    if (user) $('account-who').textContent = user.email;
  }

  function setMode(signup) {
    signingUp = signup;
    $('account-form').hidden = false;
    $('mode-login').setAttribute('aria-pressed', String(!signup));
    $('mode-signup').setAttribute('aria-pressed', String(signup));
    $('account-submit').textContent = signup ? 'Create my account' : 'Log in';
    $('account-password').autocomplete = signup ? 'new-password' : 'current-password';
    $('password-hint').hidden = !signup;
    $('forgot').hidden = signup;
    $('account-error').textContent = '';
    showKeep();
  }

  $('mode-login').addEventListener('click', () => { setMode(false); $('account-email').focus(); });
  $('mode-signup').addEventListener('click', () => { setMode(true); $('account-email').focus(); });

  // Simple checks before asking the server.
  function check(email, password) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return ['That email address doesn’t look right.', 'account-email'];
    if (password.length < 8) return ['Your password needs at least 8 characters.', 'account-password'];
    return null;
  }

  $('account-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = $('account-email').value.trim();
    const password = $('account-password').value;
    const problem = check(email, password);
    $('account-email').removeAttribute('aria-invalid');
    $('account-password').removeAttribute('aria-invalid');
    if (problem) {
      $('account-error').textContent = problem[0];
      $(problem[1]).setAttribute('aria-invalid', 'true');
      $(problem[1]).focus();
      return;
    }
    const button = $('account-submit');
    button.disabled = true;
    $('account-error').textContent = '';
    message.textContent = signingUp ? 'Creating your account…' : 'Logging in…';
    try {
      let event = 'login';
      if (signingUp) {
        const keep = !$('account-keep-field').hidden && $('account-keep').checked;
        const result = await signUp(email, password, keep);
        if (result === 'check-email') {
          message.textContent = `Almost there: we sent a link to ${email}. Open it on any device (your phone is fine) and this page will log you in by itself.`;
          waitForConfirmation(email, password);
        } else {
          message.textContent = 'Your account is ready. Everything you save from now on is kept in it.';
        }
        event = 'signup';
      } else {
        await logIn(email, password);
        message.textContent = 'Welcome back. Your universe is up to date.';
      }
      $('account-form').reset();
      $('account-keep').checked = keepByDefault;
      show();
      onChange?.(event);
    } catch (error) {
      message.textContent = '';
      $('account-error').textContent = error.message;
    } finally {
      button.disabled = false;
    }
  });

  // Waiting for the email to be confirmed. The link might be opened on
  // another device, so this page checks by itself: every 15 seconds,
  // and straight away when you come back to this tab. It stops after
  // 30 minutes (then just log in normally).
  function waitForConfirmation(email, password) {
    const started = Date.now();
    let busy = false;
    async function check() {
      if (busy || document.hidden) return;
      if (Date.now() - started > 30 * 60000) return stop();
      busy = true;
      try {
        if (await finishSignUp(email, password)) {
          stop();
          message.textContent = 'Your email is confirmed and you’re logged in.';
          show();
          onChange?.('login');
        }
      } catch { /* offline for a moment: try again next time */ }
      busy = false;
    }
    const timer = setInterval(check, 15000);
    document.addEventListener('visibilitychange', check);
    window.addEventListener('focus', check);
    function stop() {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', check);
      window.removeEventListener('focus', check);
    }
  }

  $('forgot').addEventListener('click', async () => {
    const email = $('account-email').value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      $('account-error').textContent = 'Type your email above first, then press “Forgot your password?” again.';
      $('account-email').focus();
      return;
    }
    try {
      await sendPasswordReset(email);
      $('account-error').textContent = '';
      message.textContent = `If there’s an account for ${email}, we’ve sent it a link to choose a new password.`;
    } catch (error) {
      $('account-error').textContent = error.message;
    }
  });

  $('new-password')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const password = $('new-password-input').value;
    if (password.length < 8) {
      $('new-password-error').textContent = 'Your password needs at least 8 characters.';
      return;
    }
    try {
      await setNewPassword(password);
      $('new-password').hidden = true;
      message.textContent = 'Your new password is saved.';
      show();
    } catch (error) {
      $('new-password-error').textContent = error.message;
    }
  });

  $('logout').addEventListener('click', async () => {
    await logOut();
    message.textContent = 'You’re logged out. Your universe is safe in your account; log in again to see it.';
    show();
    onChange?.('logout');
  });

  if (collapsed) {
    // Nothing chosen yet: just the two buttons.
    $('account-form').hidden = true;
    $('mode-login').setAttribute('aria-pressed', 'false');
    $('mode-signup').setAttribute('aria-pressed', 'false');
  } else {
    setMode(false);
  }
  addShowButtons();
  show();
  if (mode === 'confirmed') message.textContent = 'Your email is confirmed and you’re logged in.';
  if (mode === 'recovery') {
    $('account-in').hidden = true;
    $('new-password').hidden = false;
    $('new-password-input').focus();
  }
}

// A "Show" button inside each password box, so you can check what
// you typed. It switches the box between hidden dots (type="password")
// and normal text, and back to dots whenever the form is cleared.
function addShowButtons() {
  for (const input of document.querySelectorAll('.account-form input[type="password"]')) {
    const wrap = document.createElement('span');
    wrap.className = 'password-wrap';
    input.replaceWith(wrap);
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'password-show';
    button.textContent = 'Show';
    button.setAttribute('aria-pressed', 'false');
    button.setAttribute('aria-label', 'Show password');
    wrap.append(input, button);

    const hide = (hidden) => {
      input.type = hidden ? 'password' : 'text';
      button.textContent = hidden ? 'Show' : 'Hide';
      button.setAttribute('aria-pressed', String(!hidden));
      button.setAttribute('aria-label', hidden ? 'Show password' : 'Hide password');
    };
    button.addEventListener('click', () => hide(input.type === 'text'));
    input.form?.addEventListener('reset', () => hide(true));
  }
}
