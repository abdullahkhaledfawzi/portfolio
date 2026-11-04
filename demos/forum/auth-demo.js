/**
 * Forum demo — auth pages. The real app's login flow is simulated:
 * any email/username + password logs you in client-side (no server).
 */
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('login-form') || document.getElementById('register-form');
  if (!form) return;
  const reg = document.getElementById('register-form');
  const err = document.getElementById('form-error');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (reg) {
      const em = document.getElementById('email');
      const un = document.getElementById('username') || document.getElementById('email');
      const pw = document.getElementById('password');
      const cf = document.getElementById('confirm-password');
      if (!em || em.value.trim() === '') return fail('Enter an email address.');
      if (pw.value.length < 8) return fail('Password must be at least 8 characters long.');
      if (cf && pw.value !== cf.value) return fail('Passwords do not match.');
      sessionStorage.setItem('demo-user', usernameFrom(em.value, un.value));
    } else {
      const em = document.getElementById('email');
      const pw = document.getElementById('password');
      if (!em || em.value.trim() === '') return fail('Enter an email address.');
      if (pw.value.length < 8) return fail('Password must be at least 8 characters long.');
      sessionStorage.setItem('demo-user', usernameFrom(em.value, null));
    }
    window.location.href = 'index.html';
  });

  function fail(msg) {
    if (err) err.textContent = msg;
  }

  function usernameFrom(email, usernameInput) {
    if (usernameInput && usernameInput.value.trim()) return usernameInput.value.trim();
    const local = email.split('@')[0] || 'guest';
    return local.replace(/[^a-zA-Z0-9_.-]/g, '_');
  }
});
