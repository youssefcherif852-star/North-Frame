/* North Frame — minimal interaction layer.
   No dependencies. Everything degrades to a working static page. */
(function () {
  'use strict';

  /* ---- 1. Sticky nav state -------------------------------------- */
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
      // the marquee can sit above the nav, so start the overlay at the nav's real edge
      document.documentElement.style.setProperty('--menu-top', Math.round(nav.getBoundingClientRect().bottom) + 'px');
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

  /* ---- 3. One rAF-throttled scroll handler ----------------------- */
  var queued = false;
  function onScroll() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(function () {
      navState();
      queued = false;
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  navState();

  /* ---- 4. Footer year -------------------------------------------- */
  var year = document.querySelector('[data-year]');
  if (year) year.textContent = String(new Date().getFullYear());
})();
