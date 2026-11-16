(async function () {
  const form = document.getElementById('booking-form');
  const alertEl = document.getElementById('booking-alert');
  const serviceSelect = document.getElementById('service_name');
  const serviceIdInput = document.getElementById('service_id');
  const waBtn = document.getElementById('wa-booking');
  const params = new URLSearchParams(window.location.search);

  const today = new Date().toISOString().split('T')[0];
  const dateInput = document.getElementById('preferred_date');
  if (dateInput) dateInput.min = today;

  let services = [];
  try {
    services = await apiRequest('/services');
    services.forEach(s => {
      const opt = document.createElement('option');
      opt.value = s.name;
      opt.textContent = s.name;
      opt.dataset.id = s.id;
      serviceSelect.appendChild(opt);
    });
  } catch (e) {
    ['Knotless Braids','Normal Braids','Twist-outs','Ghanaian Hairstyles'].forEach(name => {
      const opt = document.createElement('option'); opt.value = name; opt.textContent = name; serviceSelect.appendChild(opt);
    });
  }

  const preService = params.get('service');
  const preId = params.get('service_id');
  if (preService) serviceSelect.value = preService;
  if (preId) serviceIdInput.value = preId;
  serviceSelect.addEventListener('change', () => {
    const sel = serviceSelect.options[serviceSelect.selectedIndex];
    serviceIdInput.value = sel && sel.dataset.id ? sel.dataset.id : '';
  });
  if (preService) serviceSelect.dispatchEvent(new Event('change'));

  function getPayload() {
    const email = document.getElementById('email').value.trim();
    const msg = document.getElementById('message').value.trim();
    const sid = serviceIdInput.value ? parseInt(serviceIdInput.value, 10) : null;
    return {
      customer_name: document.getElementById('customer_name').value.trim(),
      phone_number: document.getElementById('phone_number').value.trim(),
      email: email || null,
      service_id: Number.isInteger(sid) ? sid : null,
      service_name: serviceSelect.value.trim(),
      preferred_date: document.getElementById('preferred_date').value,
      preferred_time: document.getElementById('preferred_time').value,
      message: msg || null,
    };
  }

  function validate(p) {
    if (!p.customer_name) return 'Please enter your name.';
    if (!/^[0-9+\-\s]{7,20}$/.test(p.phone_number)) return 'Please enter a valid phone number.';
    if (p.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email)) return 'Please enter a valid email address.';
    if (!p.service_name) return 'Please select a hairstyle.';
    if (!p.preferred_date) return 'Please choose a preferred date.';
    if (!p.preferred_time) return 'Please choose a preferred time.';
    if (p.preferred_date < today) return 'Preferred date cannot be in the past.';
    return null;
  }

  waBtn.addEventListener('click', () => {
    const p = getPayload();
    const err = validate(p);
    if (err) { showAlert(alertEl, 'error', err); return; }
    const lines = [
      `Hello Gifted Hands, I would like to request a booking.`,
      `Name: ${p.customer_name}`,
      `Phone: ${p.phone_number}`,
      p.email ? `Email: ${p.email}` : null,
      `Hairstyle: ${p.service_name}`,
      `Preferred date: ${p.preferred_date}`,
      `Preferred time: ${p.preferred_time}`,
      p.message ? `Message: ${p.message}` : null,
      `Please let me know if this slot is available.`
    ].filter(Boolean);
    window.open(ghWhatsAppLink(lines.join('\n')), '_blank', 'noopener');
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const p = getPayload();
    const err = validate(p);
    if (err) { showAlert(alertEl, 'error', err); return; }
    try {
      const res = await apiRequest('/bookings', { method: 'POST', body: JSON.stringify(p) });
      showAlert(alertEl, 'success', res.message || 'Booking request submitted successfully.');
      form.reset();
      serviceIdInput.value = '';
      if (dateInput) dateInput.min = today;
    } catch (error) {
      showAlert(alertEl, 'error', error.message || 'Unable to submit booking request.');
    }
  });
})();
