// account-panel.js
// ---------------------------------------------------------------
// The "Your account" box on the Profile page: log in, create an
// account, forgot password, choose a new password, log out.
// The talking-to-the-server part is in cloud.js.
// ---------------------------------------------------------------

import { cloudReady, currentUser, signUp, logIn, logOut, sendPasswordReset, setNewPassword } from './cloud.js?v=202610201505';

const $ = (id) => document.getElementById(id);

/**
 * mode     – what startCloud() reported: 'recovery' after a password
 *            reset link, 'confirmed' after confirming an email, or null
 * onChange – called after logging in or out, so the page can refresh
 */
export function setUpAccountPanel({ mode, onChange }) {
  let signingUp = false;
  const message = $('account-message');

  function show() {
    const user = currentUser();
    $('account-off').hidden = cloudReady;
    $('account-out').hidden = !cloudReady || Boolean(user);
    $('account-in').hidden = !user;
    if (user) $('account-who').textContent = user.email;
  }

  function setMode(signup) {
    signingUp = signup;
    $('mode-login').setAttribute('aria-pressed', String(!signup));
    $('mode-signup').setAttribute('aria-pressed', String(signup));
    $('account-submit').textContent = signup ? 'Create my account' : 'Log in';
    $('account-password').autocomplete = signup ? 'new-password' : 'current-password';
    $('password-hint').hidden = !signup;
    $('forgot').hidden = signup;
    $('account-error').textContent = '';
  }

  $('mode-login').addEventListener('click', () => setMode(false));
  $('mode-signup').addEventListener('click', () => setMode(true));

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
      if (signingUp) {
        const result = await signUp(email, password);
        message.textContent = result === 'check-email'
          ? `Almost there: we sent a link to ${email}. Open it to confirm your email, and you’ll be logged in.`
          : 'Your account is ready. Your universe is now saved to it.';
      } else {
        await logIn(email, password);
        message.textContent = 'Welcome back. Your universe is up to date.';
      }
      $('account-form').reset();
      show();
      onChange?.();
    } catch (error) {
      message.textContent = '';
      $('account-error').textContent = error.message;
    } finally {
      button.disabled = false;
    }
  });

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

  $('new-password').addEventListener('submit', async (e) => {
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
    onChange?.();
  });

  setMode(false);
  show();
  if (mode === 'confirmed') message.textContent = 'Your email is confirmed and you’re logged in.';
  if (mode === 'recovery') {
    $('account-in').hidden = true;
    $('new-password').hidden = false;
    $('new-password-input').focus();
  }
}
