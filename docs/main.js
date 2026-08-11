/* =============================================================
   IndicoDataFusion — main.js
   Handles: nav toggle, active-link highlighting, scroll-reveal,
            smooth anchor scrolling (polyfill), footer year.
   Vanilla JS, no dependencies.
   ============================================================= */

(function () {
  'use strict';

  /* ── Mobile nav toggle ──────────────────────────────────── */
  const toggle  = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');

  if (toggle && navMenu) {
    toggle.addEventListener('click', () => {
      const isOpen = navMenu.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });

    // Close menu on nav link click (mobile UX)
    navMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });

    // Close on Escape
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && navMenu.classList.contains('open')) {
        navMenu.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.focus();
      }
    });
  }

  /* ── Active nav link highlighting on scroll ─────────────── */
  const sections  = Array.from(document.querySelectorAll('section[id], div[id="top"]'));
  const navLinks  = Array.from(document.querySelectorAll('.nav-links a[href^="#"]'));
  const navHeight = parseInt(getComputedStyle(document.documentElement)
                      .getPropertyValue('--nav-h'), 10) || 64;

  function getActiveSection() {
    const scrollY = window.scrollY + navHeight + 20;
    let active = null;
    for (const section of sections) {
      if (section.offsetTop <= scrollY) {
        active = section.id;
      }
    }
    return active;
  }

  function updateActiveLink() {
    const id = getActiveSection();
    navLinks.forEach(link => {
      const href = link.getAttribute('href').replace('#', '');
      link.classList.toggle('active', href === id);
    });
  }

  window.addEventListener('scroll', updateActiveLink, { passive: true });
  updateActiveLink();

  /* Add active style inline (avoids an extra CSS rule dependency) */
  const style = document.createElement('style');
  style.textContent = '.nav-links a.active:not(.btn){color:#fff;}';
  document.head.appendChild(style);

  /* ── Scroll-reveal (IntersectionObserver) ───────────────── */
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!prefersReducedMotion && 'IntersectionObserver' in window) {
    // Elements to animate: section titles, cards, steps, stat-cards
    const targets = document.querySelectorAll(
      '.section-label, .section-title, .feature-card, .step, ' +
      '.stat-card, .repo-link-card, .contrib-card, .roadmap-col, ' +
      '.vision-text p, .pillars, .hero-badge, .hero-title, ' +
      '.hero-tagline, .hero-mission, .hero-ctas, .hero-trust'
    );

    targets.forEach((el, i) => {
      el.classList.add('reveal');
      // Stagger siblings within the same parent
      const siblings = Array.from(el.parentElement.children).filter(c => c.classList.contains('reveal'));
      const idx = siblings.indexOf(el);
      if (idx > 0) {
        el.style.transitionDelay = `${idx * 60}ms`;
      }
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    targets.forEach(el => observer.observe(el));
  }

  /* ── Header shadow on scroll ────────────────────────────── */
  const header = document.querySelector('.site-header');
  if (header) {
    const updateHeader = () => {
      header.style.boxShadow = window.scrollY > 10
        ? '0 2px 24px rgba(0,0,0,.45)'
        : '';
    };
    window.addEventListener('scroll', updateHeader, { passive: true });
    updateHeader();
  }

  /* ── Footer copyright year ──────────────────────────────── */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

})();
