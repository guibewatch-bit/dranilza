/* Dra. Nilza Mendes · Landing page */
(() => {
  'use strict';

  const WA_NUMBER = '5513996652159';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.documentElement.classList.add('js');

  /* ---------- Links do WhatsApp com mensagem por botão ---------- */
  document.querySelectorAll('[data-wa]').forEach((a) => {
    a.href = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(a.dataset.wa)}`;
    a.target = '_blank';
    a.rel = 'noopener';
    a.addEventListener('click', () => {
      // Eventos para GA4 / Meta Pixel, se instalados
      const label = a.dataset.wa;
      if (typeof window.gtag === 'function') window.gtag('event', 'whatsapp_click', { label });
      if (typeof window.fbq === 'function') window.fbq('track', 'Contact');
    });
  });

  /* ---------- Menu ---------- */
  const header = document.querySelector('.header');
  const toggle = document.getElementById('menuToggle');
  const setMenu = (open) => {
    document.body.classList.toggle('menu-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  };
  toggle.addEventListener('click', () => setMenu(!document.body.classList.contains('menu-open')));
  document.querySelectorAll('.nav a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

  /* ---------- Rolagem: menu com vidro, botões fixos e paralaxe ---------- */
  const waFloat = document.querySelector('.wa-float');
  const mobileBar = document.querySelector('.mobile-bar');
  const parallax = reduceMotion ? [] : [...document.querySelectorAll('.parallax img')];
  let ticking = false;

  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle('is-scrolled', y > 20);
    const show = y > window.innerHeight * 0.3;
    waFloat.classList.toggle('is-visible', show);
    mobileBar.classList.toggle('is-visible', show);

    parallax.forEach((img) => {
      const r = img.parentElement.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) return;
      const offset = (r.top + r.height / 2 - window.innerHeight / 2) * -0.06;
      img.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0) scale(1.12)`;
    });
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();
  // Mostra o botão depois de 3 s mesmo sem rolagem
  setTimeout(() => { waFloat.classList.add('is-visible'); mobileBar.classList.add('is-visible'); }, 3000);

  /* ---------- Título palavra por palavra ---------- */
  if (!reduceMotion) {
    document.querySelectorAll('[data-split]').forEach((el) => {
      let i = 0;
      const wrap = (node) => {
        [...node.childNodes].forEach((child) => {
          if (child.nodeType === Node.TEXT_NODE) {
            const frag = document.createDocumentFragment();
            child.textContent.split(/(\s+)/).forEach((part) => {
              if (!part) return;
              if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
              const s = document.createElement('span');
              s.className = 'word';
              s.style.setProperty('--i', i++);
              s.textContent = part;
              frag.appendChild(s);
            });
            child.replaceWith(frag);
          } else if (child.nodeType === Node.ELEMENT_NODE) {
            wrap(child);
          }
        });
      };
      wrap(el);
    });
  }

  /* ---------- Revelação ao rolar + contadores ---------- */
  const groups = new Map();
  document.querySelectorAll('.reveal').forEach((el) => {
    const parent = el.parentElement;
    const idx = groups.get(parent) || 0;
    el.style.setProperty('--d', `${Math.min(idx, 5) * 0.08}s`);
    groups.set(parent, idx + 1);
  });

  const countUp = (el) => {
    const target = Number(el.dataset.count);
    if (reduceMotion || !target) return;
    const start = performance.now();
    const dur = 1600;
    const step = (now) => {
      const p = Math.min((now - start) / dur, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    };
    el.textContent = '0';
    requestAnimationFrame(step);
  };

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        entry.target.querySelectorAll('[data-count]').forEach(countUp);
        io.unobserve(entry.target);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.reveal, #steps, .about__media').forEach((el) => io.observe(el));
  } else {
    document.querySelectorAll('.reveal, #steps').forEach((el) => el.classList.add('is-in'));
  }

  /* ---------- Antes e depois ---------- */
  document.querySelectorAll('[data-ba]').forEach((frame) => {
    const range = frame.querySelector('.ba__range');
    const update = () => frame.style.setProperty('--pos', `${range.value}%`);
    range.addEventListener('input', update);
    update();
  });

  /* ---------- FAQ: uma pergunta aberta por vez ---------- */
  const faqItems = document.querySelectorAll('#faq details');
  faqItems.forEach((d) => d.addEventListener('toggle', () => {
    if (d.open) faqItems.forEach((o) => { if (o !== d) o.open = false; });
  }));

  /* ---------- Mapa carregado sob demanda (desempenho) ---------- */
  const mapBtn = document.getElementById('mapLoad');
  mapBtn.addEventListener('click', () => {
    const iframe = document.createElement('iframe');
    iframe.src = 'https://www.google.com/maps?q=' +
      encodeURIComponent('Av. Conselheiro Nébias, 726, Santos - SP, 11045-002') + '&output=embed';
    iframe.title = 'Mapa da clínica Dra. Nilza Mendes';
    iframe.loading = 'lazy';
    iframe.referrerPolicy = 'no-referrer-when-downgrade';
    mapBtn.replaceWith(iframe);
  });

  /* ---------- Ano no rodapé ---------- */
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
