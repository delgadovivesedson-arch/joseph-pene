'use strict';
const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const menu = $('.menu-toggle');
const nav = $('#navigation');
function closeMenu() { nav.classList.remove('open'); menu.setAttribute('aria-expanded', 'false'); }
menu.addEventListener('click', () => { menu.setAttribute('aria-expanded', String(nav.classList.toggle('open'))); });
nav.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
document.addEventListener('keydown', e => { if (e.key === 'Escape' && nav.classList.contains('open')) { closeMenu(); menu.focus(); } });
$('#year').textContent = new Date().getFullYear();
const config = window.JOSHEP_CONFIG || {};
const number = String(config.whatsapp || '50688388013').replace(/[^0-9]/g, '');
const instagram = String(config.instagram || 'josephmiranda07').replace(/[^a-zA-Z0-9_.]/g, '');
$$('[data-whatsapp]').forEach(a => { a.href = `https://wa.me/${number}`; });
$$('[data-instagram]').forEach(a => { a.href = `https://www.instagram.com/${instagram}/`; });
// Only the appearance preference is stored. Form data stays in the page.
function setTheme(dark) {
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  $('#theme-toggle').setAttribute('aria-pressed', String(dark));
  $('#theme-toggle').setAttribute('aria-label', dark ? 'Activar modo claro' : 'Activar modo oscuro');
  $('#theme-toggle').textContent = dark ? 'Modo claro' : 'Modo oscuro';
}
let theme = null;
try { theme = localStorage.getItem('joshep-theme'); } catch {}
setTheme(theme === 'dark');
$('#theme-toggle').addEventListener('click', () => {
  const dark = document.documentElement.dataset.theme !== 'dark';
  setTheme(dark);
  try { localStorage.setItem('joshep-theme', dark ? 'dark' : 'light'); } catch {}
});
const form = $('#contact-form');
const serviceInputs = $$('input[name="services"]');
function localDay() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
$('#deadline').min = localDay();
function dateLabel(value) {
  if (!value) return 'Por coordinar';
  const [y, m, d] = value.split('-').map(Number);
  return new Intl.DateTimeFormat('es-CR', {day:'numeric', month:'long', year:'numeric'}).format(new Date(y,m-1,d));
}
function buildMessage() {
  const services = serviceInputs.filter(c => c.checked).map(c => c.value).join(', ') || 'Por elegir';
  return `¡Hola, Joshep! Soy ${$('#name').value.trim() || '[tu nombre]'}.\n\nNecesito: ${services}.\nMateria o tema: ${$('#subject').value.trim() || '[materia o tema]'}.\nNivel: ${$('#level').value || 'Por confirmar'}.\nFecha: ${dateLabel($('#deadline').value)}.\nPreferencia: ${$('#format').value}.\n\n${$('#message').value.trim() || '[contame qué necesitás]'}\n\n¿Me confirmás disponibilidad y costo?`;
}
function updateSummary() {
  $('#live-summary').textContent = buildMessage();
  $('#message-count').textContent = `${$('#message').value.length} / 2000`;
  $('#result').hidden = true;
  $('#form-error').hidden = true;
  $('#status').textContent = '';
}
form.addEventListener('input', updateSummary);
form.addEventListener('change', updateSummary);
$$('[data-service]').forEach(a => {
  a.href = `https://wa.me/${number}?text=${encodeURIComponent(`¡Hola, Joshep! Quiero solicitar ${a.dataset.service.toLowerCase()}. ¿Me confirmás disponibilidad y precio?`)}`;
});
function validatedMessage() {
  $('#deadline').min = localDay();
  if (!form.reportValidity()) return null;
  let error = '';
  if (!serviceInputs.some(c => c.checked)) error = 'Elegí al menos un tipo de apoyo.';
  else if (!$('#name').value.trim() || !$('#subject').value.trim() || !$('#message').value.trim()) error = 'Completá tu nombre, la materia y el detalle de tu consulta.';
  if (error) {
    $('#form-error').textContent = error;
    $('#form-error').hidden = false;
    if (!serviceInputs.some(c => c.checked)) serviceInputs[0].focus();
    else [$('#name'), $('#subject'), $('#message')].find(el => !el.value.trim()).focus();
    return null;
  }
  $('#form-error').hidden = true;
  return buildMessage();
}
function showResult(text) {
  $('#prepared-message').value = text;
  $('#whatsapp-retry').href = `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
  $('#result').hidden = false;
}
form.addEventListener('submit', e => {
  e.preventDefault();
  const text = validatedMessage();
  if (!text) return;
  showResult(text);
  window.location.assign($('#whatsapp-retry').href);
  $('#status').textContent = 'Abrí el chat de Joshep y tocá Enviar. Si no se abrió, usá el enlace de arriba.';
});
$('#copy').addEventListener('click', async () => {
  const text = validatedMessage();
  if (!text) return;
  showResult(text);
  try {
    if (!navigator.clipboard || !window.isSecureContext) throw new Error('manual');
    await navigator.clipboard.writeText(text);
    $('#status').textContent = '¡Consulta copiada! Podés pegarla en WhatsApp o Instagram.';
  } catch {
    const field = $('#prepared-message');
    field.focus(); field.select(); field.setSelectionRange(0, field.value.length);
    $('#status').textContent = 'Mensaje seleccionado. Usá Ctrl+C o mantené presionado y elegí Copiar.';
  }
});
$('#download').addEventListener('click', () => {
  const text = validatedMessage();
  if (!text) return;
  const url = URL.createObjectURL(new Blob([text], {type:'text/plain;charset=utf-8'}));
  const a = document.createElement('a');
  a.href = url; a.download = 'Mi_consulta_Joshep.txt';
  document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  $('#status').textContent = 'Consulta preparada para descargar. No se ha enviado a Joshep.';
});
form.addEventListener('reset', () => setTimeout(() => { updateSummary(); $('#name').focus(); }, 0));
updateSummary();
const normalize = text => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const faqs = $$('.faq-list details');
$('#faq-search').addEventListener('input', e => {
  const query = normalize(e.target.value.trim());
  let count = 0;
  faqs.forEach(item => {
    const match = normalize(item.textContent).includes(query);
    item.hidden = !match;
    item.open = Boolean(query && match);
    if (match) count++;
  });
  $('#faq-count').textContent = query ? `${count} ${count === 1 ? 'respuesta encontrada' : 'respuestas encontradas'}` : '';
  $('#faq-empty').hidden = count > 0;
});
const back = $('#back-top');
function toggleBack() { back.hidden = window.scrollY < 600; }
window.addEventListener('scroll', toggleBack, {passive:true});
back.addEventListener('click', () => { window.scrollTo({top:0, behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'}); $('.brand').focus({preventScroll:true}); });
toggleBack();
