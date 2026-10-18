(() => {
  'use strict';
  const button = document.querySelector('.copy-email');
  const status = document.querySelector('.copy-status');
  if (!button || !status) return;
  button.hidden = false;
  button.addEventListener('click', async () => {
    try {
      if (!navigator.clipboard || !window.isSecureContext) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText('stefankvitanov@gmail.com');
      status.textContent = 'Email address copied.';
    } catch {
      const address = document.querySelector('.email-address');
      const selection = window.getSelection();
      if (address && selection) {
        const range = document.createRange();
        range.selectNodeContents(address);
        selection.removeAllRanges();
        selection.addRange(range);
      }
      status.textContent = 'Select and copy the email address above.';
    }
  });
})();
