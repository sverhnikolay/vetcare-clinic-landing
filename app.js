const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

const modal = $('#booking-modal');
const toast = $('.toast');
const bookingService = $('#booking-form select[name="service"]');

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('show'), 3500);
}

function openModal(trigger) {
  const service = trigger?.dataset?.serviceName;
  if (service && bookingService) {
    const option = [...bookingService.options].find(item => item.text.includes(service) || service.includes(item.text));
    if (option) bookingService.value = option.value;
  }
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
  setTimeout(() => $('#booking-form input')?.focus(), 60);
}

function closeModal() {
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
}

$$('.open-booking').forEach(button => button.addEventListener('click', () => openModal(button)));
$$('[data-close]').forEach(button => button.addEventListener('click', closeModal));
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeModal(); });

$$('form').forEach(form => form.addEventListener('submit', event => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  closeModal();
  form.reset();
  showToast('Спасибо! Заявка принята — мы скоро вам позвоним.');
}));

$$('.faq-item button').forEach(button => button.addEventListener('click', () => {
  const item = button.closest('.faq-item');
  item.classList.toggle('open');
  $('b', button).textContent = item.classList.contains('open') ? '−' : '+';
}));

$$('.tab').forEach(tab => tab.addEventListener('click', () => {
  $$('.tab').forEach(item => item.classList.remove('active'));
  tab.classList.add('active');
  $$('.service-card').forEach(card => {
    card.hidden = tab.dataset.filter !== 'all' && card.dataset.category !== tab.dataset.filter;
  });
}));

$$('.choice').forEach(button => button.addEventListener('click', () => {
  $$('.choice').forEach(item => item.classList.remove('active'));
  button.classList.add('active');
}));

$$('.chip').forEach(button => button.addEventListener('click', () => {
  $$('.chip').forEach(item => item.classList.remove('active'));
  button.classList.add('active');
}));

$('.quiz-submit').addEventListener('click', () => {
  const service = $('.chip.active').dataset.service;
  const pet = $('.choice.active').dataset.pet.toLowerCase();
  $('[data-rec-title]').textContent = service;
  $('[data-rec-copy]').textContent = `Оптимальная услуга для вашего питомца (${pet}): осмотр врача и персональные рекомендации.`;
  $('.recommendation').classList.add('pulse');
  setTimeout(() => $('.recommendation').classList.remove('pulse'), 500);
});

$('.menu-toggle').addEventListener('click', event => {
  const button = event.currentTarget;
  const open = button.getAttribute('aria-expanded') === 'true';
  button.setAttribute('aria-expanded', String(!open));
  $('.nav').classList.toggle('open');
});

$$('.nav a').forEach(link => link.addEventListener('click', () => {
  $('.nav').classList.remove('open');
  $('.menu-toggle').setAttribute('aria-expanded', 'false');
}));

$$('.logo').forEach(link => link.addEventListener('click', event => {
  event.preventDefault();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}));

$('.show-doctors').addEventListener('click', () => {
  $('#doctors').scrollIntoView({ behavior: 'smooth' });
  showToast('Все специалисты клиники уже представлены в этом разделе.');
});

$$('.case-more').forEach(button => button.addEventListener('click', () => {
  showToast(`${button.dataset.case}: подробная история доступна на консультации врача.`);
}));

const dateInput = $('#booking-form input[type="date"]');
const today = new Date();
dateInput.min = today.toISOString().split('T')[0];
today.setDate(today.getDate() + 1);
dateInput.value = today.toISOString().split('T')[0];
