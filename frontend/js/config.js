const ghHostname = window.location.hostname;
const ghSameOriginHost = /^(localhost|127\.0\.0\.1)$/.test(ghHostname) || ghHostname.endsWith('.onrender.com') || ghHostname.endsWith('.workers.dev');
const ghRemoteApiBase = 'https://mideva-cosmetics.chemeresmiriam.workers.dev/api';

window.GH_CONFIG = {
  businessName: 'Gifted Hands',
  phoneDisplay: '0712117024',
  whatsappNumber: '254712117024', // Kenya international format without +
  apiBase: (window.GH_API_BASE || (ghSameOriginHost ? '/api' : ghRemoteApiBase)).replace(/\/+$/, ''),
  locationPlaceholder: 'Business location placeholder (configure in site content)',
  socialLinks: {
    instagram: '#',
    facebook: '#',
    tiktok: '#'
  }
};

function ghWhatsAppLink(message) {
  const text = encodeURIComponent(message || 'Hello Gifted Hands, I would like to inquire about your hair services.');
  return `https://wa.me/${window.GH_CONFIG.whatsappNumber}?text=${text}`;
}
