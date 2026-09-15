// Pathway 2 Privacy — shared page behavior (Phase 2 static build)
// Replaces the Claude Design runtime (DCLogic / sc-if / {{ }}) with plain DOM code.
(function () {
  'use strict';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ── Sticky header shadow on scroll ────────────────────────────────────
  var header = document.querySelector('.site-header');
  if (header) {
    var onScroll = function () {
      header.classList.toggle('scrolled', window.scrollY > 8);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // ── Mega-menu + sectors dropdown: hover open, mouse-leave close, keyboard focus ──
  var navWrap = document.querySelector('.nav-wrap');
  var triggers = document.querySelectorAll('.nav-trigger');
  function closeAllPanels() {
    triggers.forEach(function (t) {
      t.setAttribute('aria-expanded', 'false');
      var panel = document.getElementById(t.getAttribute('aria-controls'));
      if (panel) panel.classList.remove('open');
    });
  }
  function openPanel(trigger) {
    closeAllPanels();
    trigger.setAttribute('aria-expanded', 'true');
    var panel = document.getElementById(trigger.getAttribute('aria-controls'));
    if (panel) panel.classList.add('open');
  }
  triggers.forEach(function (t) {
    t.addEventListener('mouseenter', function () { openPanel(t); });
    t.addEventListener('focus', function () { openPanel(t); });
    t.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { closeAllPanels(); t.blur(); }
    });
  });
  document.querySelectorAll('.site-nav > a').forEach(function (a) {
    a.addEventListener('mouseenter', closeAllPanels);
    a.addEventListener('focus', closeAllPanels);
  });
  if (navWrap) {
    navWrap.addEventListener('mouseleave', closeAllPanels);
    navWrap.addEventListener('focusout', function (e) {
      if (!navWrap.contains(e.relatedTarget)) closeAllPanels();
    });
  }

  // ── Mobile nav: hamburger toggle + Services/Sectors accordions ────────
  var mobileToggle = document.querySelector('.mobile-menu-toggle');
  var mobileNav = document.getElementById('mobile-nav');
  if (mobileToggle && mobileNav) {
    mobileToggle.addEventListener('click', function () {
      var open = mobileNav.classList.toggle('open');
      mobileToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && mobileNav.classList.contains('open')) {
        mobileNav.classList.remove('open');
        mobileToggle.setAttribute('aria-expanded', 'false');
      }
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 900 && mobileNav.classList.contains('open')) {
        mobileNav.classList.remove('open');
        mobileToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }
  document.querySelectorAll('.mobile-accordion-toggle').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', open ? 'false' : 'true');
      var panel = document.getElementById(btn.getAttribute('aria-controls'));
      if (panel) panel.classList.toggle('open', !open);
    });
  });

  // ── Scroll reveal ──────────────────────────────────────────────────────
  var revealEls = document.querySelectorAll('[data-reveal]');
  if (reduced || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('revealed'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('revealed');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  // ── Stat count-up ──────────────────────────────────────────────────────
  var statEls = document.querySelectorAll('[data-countup]');
  function animateCount(el) {
    var target = parseFloat(el.getAttribute('data-countup'));
    var suffix = el.getAttribute('data-suffix') || '';
    if (reduced) { el.textContent = target + suffix; return; }
    var dur = 1100, t0 = performance.now();
    function tick(now) {
      var p = Math.min(1, (now - t0) / dur);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    }
    el.textContent = '0' + suffix;
    requestAnimationFrame(tick);
  }
  if (reduced || !('IntersectionObserver' in window)) {
    statEls.forEach(function (el) { animateCount(el); });
  } else {
    var statIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        animateCount(entry.target);
        statIo.unobserve(entry.target);
      });
    }, { threshold: 0.4 });
    statEls.forEach(function (el) { statIo.observe(el); });
  }

  // ── FAQ accordion: one open at a time per .row-list ───────────────────
  document.querySelectorAll('.row-list').forEach(function (list) {
    var rows = list.querySelectorAll('.row');
    rows.forEach(function (row) {
      var btn = row.querySelector('.faq-q');
      if (!btn) return;
      btn.addEventListener('click', function () {
        var wasOpen = row.classList.contains('open');
        rows.forEach(function (r) {
          r.classList.remove('open');
          var sign = r.querySelector('.sign');
          if (sign) sign.textContent = '+';
          r.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
        });
        if (!wasOpen) {
          row.classList.add('open');
          var sign = row.querySelector('.sign');
          if (sign) sign.textContent = '–';
          btn.setAttribute('aria-expanded', 'true');
        }
      });
    });
  });
})();
