/* North Frame — minimal interaction layer.
   No dependencies. Everything degrades to a working static page. */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- 1. Sticky nav state + scroll progress ---------------------- */
  var nav = document.querySelector('[data-nav]');
  var lastStuck = null;

  function navState() {
    var stuck = window.scrollY > 8;
    if (stuck !== lastStuck) {
      nav.classList.toggle('is-stuck', stuck);
      lastStuck = stuck;
    }
  }

  /* ---- 2. Mobile menu -------------------------------------------- */
  var toggle = document.querySelector('[data-menu-toggle]');
  var menu = document.querySelector('[data-menu]');
  var label = toggle && toggle.querySelector('.nav__toggle-label');

  function setMenu(open) {
    if (!menu || !toggle) return;
    if (open) {
      // hiding the scrollbar would shift the page; reserve exactly its width
      var sbw = window.innerWidth - document.documentElement.clientWidth;
      document.documentElement.style.setProperty('--sbw', Math.max(0, sbw) + 'px');
    }
    toggle.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
    document.body.classList.toggle('is-locked', open);
    if (label) label.textContent = open ? 'Close' : 'Menu';

    if (open) {
      menu.hidden = false;
      // next frame, so the transition has a starting point to animate from
      requestAnimationFrame(function () { menu.classList.add('is-in'); });
    } else {
      menu.classList.remove('is-in');
      menu.hidden = true;
    }
  }

  if (toggle) {
    toggle.addEventListener('click', function () {
      setMenu(toggle.getAttribute('aria-expanded') !== 'true');
    });
  }

  if (menu) {
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && toggle && toggle.getAttribute('aria-expanded') === 'true') {
      setMenu(false);
      toggle.focus();
    }
  });

  // A resize past the desktop breakpoint should not leave the overlay open.
  var desktop = window.matchMedia('(min-width: 62rem)');
  function onBreakpoint(e) { if (e.matches) setMenu(false); }
  if (desktop.addEventListener) desktop.addEventListener('change', onBreakpoint);
  else if (desktop.addListener) desktop.addListener(onBreakpoint);

  /* ---- 3. Reveals ------------------------------------------------
     Two kinds: .reveal fades up, .mask slides display type out of a clipped
     box. Both are driven by one observer and one stagger rule. */
  var reveals = Array.prototype.slice.call(document.querySelectorAll('.reveal, .mask'));

  function showAll() { reveals.forEach(function (el) { el.classList.add('is-in'); }); }

  if (reduced || !('IntersectionObserver' in window)) {
    showAll();
  } else {
    // Siblings sharing a parent arrive as a set, unless the markup sets its own
    // order (the hero is choreographed by hand).
    var groups = new Map();
    reveals.forEach(function (el) {
      if (el.style.getPropertyValue('--i')) return;
      var parent = el.parentElement;
      var n = groups.get(parent) || 0;
      if (n) el.style.setProperty('--i', String(Math.min(n, 5)));
      groups.set(parent, n + 1);
    });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    // Hold the first frame until the display face is ready, so the opening
    // reveal never animates in the fallback font and then reflow mid-motion.
    var start = function () { reveals.forEach(function (el) { io.observe(el); }); };
    var fonts = document.fonts && document.fonts.ready;
    if (fonts && typeof Promise !== 'undefined') {
      var armed = false;
      var once = function () { if (!armed) { armed = true; start(); } };
      fonts.then(once);
      setTimeout(once, 600);   // never wait on a font that failed to load
    } else {
      start();
    }
  }

  /* ---- 4. Approach progress rule --------------------------------- */
  var approach = document.querySelector('[data-approach]');
  var steps = approach && approach.querySelector('.steps');

  function progress() {
    if (!steps || reduced) return;
    var r = steps.getBoundingClientRect();
    var vh = window.innerHeight;
    // 0 when the list's top reaches 80% of the viewport, 1 when its bottom passes 55%.
    var start = vh * 0.8;
    var end = vh * 0.55;
    var p = (start - r.top) / Math.max(r.height - (start - end), 1);
    steps.style.setProperty('--progress', String(Math.min(1, Math.max(0, p))));
  }

  /* ---- 5. One rAF-throttled scroll handler ----------------------- */
  var queued = false;
  function onScroll() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(function () {
      navState();
      progress();
      queued = false;
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  navState();
  progress();

  /* ---- 6. Footer year -------------------------------------------- */
  var year = document.querySelector('[data-year]');
  if (year) year.textContent = String(new Date().getFullYear());
})();
