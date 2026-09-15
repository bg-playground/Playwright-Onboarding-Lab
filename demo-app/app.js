const form = document.getElementById('login-form');
const error = document.getElementById('error');

if (form) {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const ok = email === 'demo@example.com' && password === 'password123';
    if (ok) {
      window.location.href = '/tasks.html';
      return;
    }
    error.hidden = false;
  });
}
