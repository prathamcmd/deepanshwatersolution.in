document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('portalAccessForm');
  const input = document.getElementById('projectAccessId');
  const error = document.getElementById('portalAccessError');

  if (!form || !input) return;

  const hideError = () => {
    if (!error) return;
    error.hidden = true;
    input.setAttribute('aria-invalid', 'false');
  };

  const showError = (message) => {
    if (!error) return;
    error.textContent = message;
    error.hidden = false;
    input.setAttribute('aria-invalid', 'true');
  };

  input.addEventListener('input', hideError);

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const projectId = input.value.trim().toUpperCase();

    if (!projectId) {
      showError('Please enter your project ID.');
      input.focus();
      return;
    }

    hideError();
    window.location.href = `/client?id=${encodeURIComponent(projectId)}`;
  });
});
