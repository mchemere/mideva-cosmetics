(function () {
  const token = sessionStorage.getItem('gh_admin_token');
  if (!token) { window.location.href = '/admin/login.html'; return; }
  document.getElementById('admin-user').textContent = sessionStorage.getItem('gh_admin_name') || 'Admin';
  const alertEl = document.getElementById('dash-alert');
  const authHeaders = () => ({ Authorization: `Bearer ${token}` });

  function esc(s){ return String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

  async function loadBookings(){
    const body = document.getElementById('bookings-body');
    try {
      const items = await apiRequest('/admin/bookings', { headers: authHeaders() });
      if (!items.length) { body.innerHTML = '<tr><td colspan="8" class="muted">No bookings yet.</td></tr>'; return; }
      body.innerHTML = items.map(b => `<tr>
        <td>${b.id}</td>
        <td>${esc(b.customer_name)}</td>
        <td>${esc(b.phone_number)}${b.email ? `<br><span class="small muted">${esc(b.email)}</span>`:''}</td>
        <td>${esc(b.service_name)}</td>
        <td>${esc(b.preferred_date)}<br><span class="small muted">${esc(b.preferred_time)}</span></td>
        <td>${esc(b.message || '')}</td>
        <td><span class="status ${esc(b.status)}">${esc(b.status)}</span></td>
        <td><div class="stack">
          <button class="btn btn-secondary" data-bact="approved" data-id="${b.id}">Approve</button>
          <button class="btn btn-secondary" data-bact="rejected" data-id="${b.id}">Reject</button>
          <button class="btn btn-secondary" data-bact="completed" data-id="${b.id}">Complete</button>
          <button class="btn btn-secondary" data-bdel="${b.id}">Delete</button>
        </div></td>
      </tr>`).join('');
    } catch (e) { body.innerHTML = `<tr><td colspan="8">${esc(e.message)}</td></tr>`; }
  }

  async function loadServices(){
    const body = document.getElementById('services-body');
    try {
      const items = await apiRequest('/admin/services', { headers: authHeaders() });
      window._services = items;
      if (!items.length) { body.innerHTML = '<tr><td colspan="7" class="muted">No services found.</td></tr>'; return; }
      body.innerHTML = items.map(s => `<tr>
        <td>${s.id}</td><td>${esc(s.name)}</td><td>${esc(s.category)}</td><td>${esc(s.price_label)}</td><td>${esc(s.duration_label)}</td><td>${s.is_active ? 'Yes':'No'}</td>
        <td><div class="stack"><button class="btn btn-secondary" data-sedit="${s.id}">Edit</button><button class="btn btn-secondary" data-sdel="${s.id}">Delete</button></div></td>
      </tr>`).join('');
    } catch (e) { body.innerHTML = `<tr><td colspan="7">${esc(e.message)}</td></tr>`; }
  }

  async function loadInquiries(){
    const body = document.getElementById('inquiries-body');
    try {
      const items = await apiRequest('/admin/inquiries', { headers: authHeaders() });
      if (!items.length) { body.innerHTML = '<tr><td colspan="6" class="muted">No inquiries yet.</td></tr>'; return; }
      body.innerHTML = items.map(i => `<tr>
        <td>${i.id}</td><td>${esc(i.name)}</td><td>${esc(i.phone_number || '')}${i.email?`<br><span class="small muted">${esc(i.email)}</span>`:''}</td><td>${esc(i.subject || '')}</td><td>${esc(i.message)}</td><td>${new Date(i.created_at).toLocaleString()}</td>
      </tr>`).join('');
    } catch (e) { body.innerHTML = `<tr><td colspan="6">${esc(e.message)}</td></tr>`; }
  }

  async function refreshAll(){ await Promise.all([loadBookings(), loadServices(), loadInquiries()]); }

  document.addEventListener('click', async (e) => {
    const b = e.target.closest('[data-bact]');
    if (b) {
      try { await apiRequest(`/admin/bookings/${b.dataset.id}`, { method:'PATCH', headers: authHeaders(), body: JSON.stringify({status:b.dataset.bact}) }); showAlert(alertEl,'success','Booking updated.'); loadBookings(); }
      catch(err){ showAlert(alertEl,'error',err.message); }
    }
    const bd = e.target.closest('[data-bdel]');
    if (bd && confirm('Delete this booking?')) {
      try { await apiRequest(`/admin/bookings/${bd.dataset.id}`, { method:'DELETE', headers: authHeaders() }); showAlert(alertEl,'success','Booking deleted.'); loadBookings(); }
      catch(err){ showAlert(alertEl,'error',err.message); }
    }
    const se = e.target.closest('[data-sedit]');
    if (se) {
      const s = (window._services||[]).find(x=>String(x.id)===se.dataset.sedit); if(!s) return;
      document.getElementById('service-form-title').textContent = 'Edit Service';
      document.getElementById('service-id').value = s.id;
      document.getElementById('s-name').value = s.name;
      document.getElementById('s-slug').value = s.slug;
      document.getElementById('s-category').value = s.category;
      document.getElementById('s-image').value = s.image_path;
      document.getElementById('s-price').value = s.price_label;
      document.getElementById('s-duration').value = s.duration_label;
      document.getElementById('s-desc').value = s.description;
      document.getElementById('s-active').checked = !!s.is_active;
      window.scrollTo({top:0,behavior:'smooth'});
    }
    const sd = e.target.closest('[data-sdel]');
    if (sd && confirm('Delete this service?')) {
      try { await apiRequest(`/admin/services/${sd.dataset.id}`, { method:'DELETE', headers: authHeaders() }); showAlert(alertEl,'success','Service deleted.'); loadServices(); }
      catch(err){ showAlert(alertEl,'error',err.message); }
    }
  });

  function resetServiceForm(){
    document.getElementById('service-form-title').textContent = 'Add Service';
    document.getElementById('service-form').reset();
    document.getElementById('service-id').value='';
    document.getElementById('s-active').checked = true;
  }
  document.getElementById('service-cancel').addEventListener('click', resetServiceForm);
  document.getElementById('service-form').addEventListener('submit', async (e)=>{
    e.preventDefault();
    const id = document.getElementById('service-id').value;
    const payload = {
      name: document.getElementById('s-name').value.trim(),
      slug: document.getElementById('s-slug').value.trim(),
      category: document.getElementById('s-category').value.trim(),
      description: document.getElementById('s-desc').value.trim(),
      price_label: document.getElementById('s-price').value.trim() || 'Price on request',
      duration_label: document.getElementById('s-duration').value.trim() || 'Duration on consultation',
      image_path: document.getElementById('s-image').value.trim(),
      is_active: document.getElementById('s-active').checked,
    };
    try {
      if (id) await apiRequest(`/admin/services/${id}`, { method:'PUT', headers: authHeaders(), body: JSON.stringify(payload) });
      else await apiRequest('/admin/services', { method:'POST', headers: authHeaders(), body: JSON.stringify(payload) });
      showAlert(alertEl,'success','Service saved.');
      resetServiceForm(); loadServices();
    } catch(err){ showAlert(alertEl,'error',err.message); }
  });

  document.getElementById('logout-btn').addEventListener('click', ()=>{ sessionStorage.clear(); window.location.href='/admin/login.html'; });
  document.getElementById('refresh-btn').addEventListener('click', refreshAll);
  refreshAll();
})();
