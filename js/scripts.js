/* =========================================================
   Interações do site: tema, destaque de seção e ampliação de credenciais.
   ========================================================= */
(function () {
  var root = document.documentElement;

  /* ----- Alternância de tema (com persistência) ----- */
  function isDark() {
    var attr = root.getAttribute('data-theme');
    if (attr) return attr === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  var btn = document.getElementById('themeBtn');
  var sunSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
  var moonSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/></svg>';
  function syncIcon() {
    if (btn) btn.innerHTML = isDark() ? sunSvg : moonSvg;
  }
  syncIcon();
  if (btn) {
    btn.addEventListener('click', function () {
      var next = isDark() ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('dg-theme', next); } catch (e) {}
      syncIcon();
    });
  }

  /* ----- Destaque da seção ativa na navegação ----- */
  var links = Array.prototype.slice.call(document.querySelectorAll('.navlinks a[href^="#"]'));
  var map = {};
  links.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
  var sections = links
    .map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); })
    .filter(Boolean);
  if ('IntersectionObserver' in window) {
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          links.forEach(function (l) { l.classList.remove('active'); });
          var act = map[e.target.id];
          if (act) act.classList.add('active');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
    sections.forEach(function (s) { obs.observe(s); });
  }

  /* ----- Ampliação de credenciais (lightbox) ----- */
  var lb = document.getElementById('lightbox');
  var lbImg = document.getElementById('lbImg');
  var lbCap = document.getElementById('lbCap');
  var lbClose = document.getElementById('lbClose');
  var lastFocus = null;
  function openLB(src, cap) {
    lastFocus = document.activeElement;
    lbImg.src = src; lbImg.alt = cap; lbCap.textContent = cap;
    lb.classList.add('open');
    lbClose.focus();
  }
  function closeLB() {
    lb.classList.remove('open'); lbImg.src = '';
    if (lastFocus) lastFocus.focus();
  }
  if (lb) {
    document.querySelectorAll('.badge-btn').forEach(function (b) {
      b.addEventListener('click', function () {
        var img = b.querySelector('img');
        openLB(img.src, b.getAttribute('data-cap') || img.alt);
      });
    });
    lbClose.addEventListener('click', closeLB);
    lb.addEventListener('click', function (e) { if (e.target === lb) closeLB(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && lb.classList.contains('open')) closeLB();
    });
  }
})();
