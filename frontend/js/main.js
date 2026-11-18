(function () {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('[data-nav]').forEach((a) => {
    const href = a.getAttribute('href');
    if (href === path || (path === '' && href === 'index.html')) a.classList.add('active');
  });

  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => links.classList.toggle('open'));
    links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => links.classList.remove('open')));
  }

  document.querySelectorAll('[data-whatsapp]').forEach((el) => {
    const msg = el.getAttribute('data-message') || 'Hello Gifted Hands, I would like to book a hairstyle appointment.';
    el.setAttribute('href', ghWhatsAppLink(msg));
    el.setAttribute('target', '_blank');
    el.setAttribute('rel', 'noopener');
  });

  document.querySelectorAll('[data-phone]').forEach(el => el.textContent = window.GH_CONFIG.phoneDisplay);
  document.querySelectorAll('[data-phone-link]').forEach(el => el.setAttribute('href', `tel:${window.GH_CONFIG.phoneDisplay}`));
  document.querySelectorAll('[data-location]').forEach(el => el.textContent = window.GH_CONFIG.locationPlaceholder);

  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();

async function apiRequest(path, options = {}) {
  let res;
  try {
    res = await fetch(`${window.GH_CONFIG.apiBase}${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    });
  } catch (e) {
    throw new Error('Cannot reach the booking service. Please try again or use WhatsApp.');
  }
  const text = await res.text();
  let data = {};
  try { data = text ? JSON.parse(text) : {}; } catch (e) { data = {}; }
  if (!res.ok) {
    const message = data.error || (res.status === 404 ? 'Booking service is not available at this address.' : `Request failed (${res.status})`);
    throw new Error(message);
  }
  return data;
}

function showAlert(el, type, message) {
  if (!el) return;
  el.className = `alert show ${type}`;
  el.textContent = message;
}
