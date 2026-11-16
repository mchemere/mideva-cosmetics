(function () {
  const form = document.getElementById('contact-form');
  const alertEl = document.getElementById('contact-alert');
  if (!form) return;

  // set social placeholders from config
  const s = (window.GH_CONFIG && window.GH_CONFIG.socialLinks) || {};
  const ig = document.getElementById('ig-link'); if (ig) ig.href = s.instagram || '#';
  const fb = document.getElementById('fb-link'); if (fb) fb.href = s.facebook || '#';
  const tt = document.getElementById('tt-link'); if (tt) tt.href = s.tiktok || '#';

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      name: document.getElementById('name').value.trim(),
      phone_number: document.getElementById('phone_number').value.trim() || null,
      email: document.getElementById('email').value.trim() || null,
      subject: document.getElementById('subject').value.trim() || null,
      message: document.getElementById('message').value.trim(),
    };
    if (!payload.name || !payload.message) { showAlert(alertEl, 'error', 'Name and message are required.'); return; }
    if (payload.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) { showAlert(alertEl, 'error', 'Please enter a valid email address.'); return; }
    if (payload.phone_number && !/^[0-9+\-\s]{7,20}$/.test(payload.phone_number)) { showAlert(alertEl, 'error', 'Please enter a valid phone number.'); return; }
    try {
      const res = await apiRequest('/inquiries', { method: 'POST', body: JSON.stringify(payload) });
      showAlert(alertEl, 'success', res.message || 'Message sent successfully.');
      form.reset();
    } catch (err) {
      showAlert(alertEl, 'error', err.message || 'Unable to send message right now.');
    }
  });
})();
