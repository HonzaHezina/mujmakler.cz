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
  const menuIcon = navToggle.querySelector('.material-icons-outlined');

  const setMenuState = (open) => {
    navList.classList.toggle('open', open);
    navToggle.setAttribute('aria-expanded', String(open));
    if (menuIcon) {
      menuIcon.textContent = open ? 'close' : 'menu';
    }
  };

  navToggle.addEventListener('click', () => {
    const isOpen = !navList.classList.contains('open');
    setMenuState(isOpen);
  });

  navList.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      setMenuState(false);
    });
  });

  document.addEventListener('click', (event) => {
    if (!navList.classList.contains('open')) {
      return;
    }

    const clickedInsideMenu = navList.contains(event.target);
    const clickedToggle = navToggle.contains(event.target);
    if (!clickedInsideMenu && !clickedToggle) {
      setMenuState(false);
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      setMenuState(false);
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 900) {
      setMenuState(false);
    }
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

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const supportsHoverPointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

function applyTilt(card, event) {
  const bounds = card.getBoundingClientRect();
  const relativeX = event.clientX - bounds.left;
  const relativeY = event.clientY - bounds.top;
  const rotateY = ((relativeX / bounds.width) - 0.5) * 5;
  const rotateX = (0.5 - (relativeY / bounds.height)) * 5;

  card.style.transform = `perspective(900px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-4px)`;
  card.style.setProperty('--mx', `${(relativeX / bounds.width) * 100}%`);
  card.style.setProperty('--my', `${(relativeY / bounds.height) * 100}%`);
}

if (!prefersReducedMotion && supportsHoverPointer) {
  const liftTargets = document.querySelectorAll('.hero-panel, .service-card, .listing-card');

  liftTargets.forEach((card) => {
    card.classList.add('interactive-lift');

    card.addEventListener('pointermove', (event) => {
      applyTilt(card, event);
    });

    card.addEventListener('pointerleave', () => {
      card.style.transform = '';
      card.style.removeProperty('--mx');
      card.style.removeProperty('--my');
    });
  });

  const revealTargets = document.querySelectorAll('.section-head, .service-card, .timeline li, .listing-card, blockquote, .valuation-wrap > *');
  if (!('IntersectionObserver' in window)) {
    revealTargets.forEach((item) => {
      item.classList.add('is-visible');
    });
    return;
  }

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -8% 0px' });

  revealTargets.forEach((item) => {
    item.classList.add('reveal');
    revealObserver.observe(item);
  });
}
