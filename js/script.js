const navToggle = document.querySelector('.nav-toggle');
const navList = document.querySelector('.main-nav ul');
const year = document.getElementById('year');
const estimateForm = document.getElementById('quick-estimate-form');
const estimateResult = document.getElementById('estimate-result');
const leadForm = document.getElementById('lead-form');

if (year) {
  year.textContent = String(new Date().getFullYear());
}

if (navToggle && navList) {
  navToggle.addEventListener('click', () => {
    const isOpen = navList.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  navList.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      navList.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

const baseByType = {
  byt: 125000,
  dum: 98000,
  pozemek: 5500,
};

if (estimateForm && estimateResult) {
  estimateForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(estimateForm);
    const type = String(formData.get('type'));
    const size = Number(formData.get('size'));
    const state = Number(formData.get('state'));

    const total = Math.round((baseByType[type] || 0) * size * state);
    estimateResult.textContent = `Orientační tržní cena: ${total.toLocaleString('cs-CZ')} Kč`;
  });
}

if (leadForm) {
  const status = leadForm.querySelector('.form-status');
  leadForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (status) {
      status.textContent = 'Děkujeme, zpráva byla odeslána. Ozveme se vám nejpozději do 24 hodin.';
    }
    leadForm.reset();
  });
}
