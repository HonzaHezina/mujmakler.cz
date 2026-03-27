/* MujMakler.cz – sdílená hlavička a patička (single source of truth) */
(function () {

  var HEADER = [
    '<a class="skip-link" href="#hlavni-obsah">P\u0159esko\u010dit na obsah</a>',
    '<header class="header">',
    '  <div class="container">',
    '    <div class="inner">',
    '      <a class="brand" href="index.html" aria-label="Dom\u016f">',
    '        <img src="assets/img/logo.png" alt="MujMakler.cz logo" width="120" height="36">',
    '      </a>',
    '      <nav class="nav" aria-label="Hlavn\u00ed navigace">',
    '        <a data-nav href="index.html">Dom\u016f</a>',
    '        <a data-nav href="prodej-nemovitosti.html">Prodej nemovitosti</a>',
    '        <a data-nav href="sluzby.html">Slu\u017eby</a>',
    '        <a data-nav href="reference.html">Reference</a>',
    '        <a data-nav href="makleri.html">Makl\u00e9\u0159i</a>',
    '        <a data-nav href="kariera.html">Kari\u00e9ra</a>',
    '        <a data-nav href="kontakt.html">Kontakt</a>',
    '      </nav>',
    '      <div class="header-cta">',
    '        <a class="btn btn-primary btn-sm" href="rychly-odhad.html">Rychl\u00fd odhad</a>',
    '        <button class="icon-btn burger" id="burger" aria-label="Menu" aria-expanded="false" aria-controls="mobilePanel">',
    '          <svg class="icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">',
    '            <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
    '          </svg>',
    '        </button>',
    '      </div>',
    '    </div>',
    '  </div>',
    '  <div class="mobile-panel" id="mobilePanel" aria-hidden="true">',
    '    <div class="container">',
    '      <nav class="nav" aria-label="Mobiln\u00ed navigace">',
    '        <a data-nav href="index.html">Dom\u016f</a>',
    '        <a data-nav href="prodej-nemovitosti.html">Prodej nemovitosti</a>',
    '        <a data-nav href="sluzby.html">Slu\u017eby</a>',
    '        <a data-nav href="reference.html">Reference</a>',
    '        <a data-nav href="makleri.html">Makl\u00e9\u0159i</a>',
    '        <a data-nav href="kariera.html">Kari\u00e9ra</a>',
    '        <a data-nav href="kontakt.html">Kontakt</a>',
    '        <a class="btn btn-primary" href="rychly-odhad.html" style="margin-top:6px">Rychl\u00fd odhad</a>',
    '      </nav>',
    '    </div>',
    '  </div>',
    '</header>'
  ].join('\n');

  var FOOTER = [
    '<footer class="footer">',
    '  <div class="container">',
    '    <div class="grid grid-4">',
    '      <div>',
    '        <img src="assets/img/logo.png" alt="MujMakler.cz logo" width="120" height="32" style="height:32px;width:auto;filter:brightness(0) invert(1);margin-bottom:16px" loading="lazy">',
    '        <p class="muted" style="max-width:240px">',
    '          Pr\u00e9mium realitní kancel\u00e1\u0159 zam\u011b\u0159en\u00e1 na datovou analytiku a modern\u00ed technologie prodeje.',
    '        </p>',
    '      </div>',
    '      <div>',
    '        <div class="col-title">Slu\u017eby</div>',
    '        <div style="display:grid;gap:10px">',
    '          <a href="prodej-nemovitosti.html">Prodej nemovitosti</a>',
    '          <a href="rychly-odhad.html">Odhad ceny zdarma</a>',
    '          <a href="sluzby.html">V\u0161echny slu\u017eby</a>',
    '          <a href="poradna.html">Poradna</a>',
    '        </div>',
    '      </div>',
    '      <div>',
    '        <div class="col-title">O spole\u010dnosti</div>',
    '        <div style="display:grid;gap:10px">',
    '          <a href="jak-pracujeme.html">Jak pracujeme</a>',
    '          <a href="makleri.html">Makl\u00e9\u0159i</a>',
    '          <a href="reference.html">Reference</a>',
    '          <a href="kariera.html">Kari\u00e9ra</a>',
    '        </div>',
    '      </div>',
    '      <div>',
    '        <div class="col-title">Kontakt</div>',
    '        <div style="display:grid;gap:10px">',
    '          <div class="muted small">+420 123 456 789</div>',
    '          <div class="muted small">info@mujmakler.cz</div>',
    '          <div class="muted small">Praha, \u010cesk\u00e1 republika</div>',
    '          <div style="margin-top:6px"><a class="btn btn-primary btn-sm" href="kontakt.html">Napi\u0161te n\u00e1m</a></div>',
    '          <div class="footer-social">',
    '            <!-- TODO: nahradit # skutečnými URL profilů na sociálních sítích -->',
    '            <a href="https://www.facebook.com/mujmakler" aria-label="Facebook MujMakler.cz" target="_blank" rel="noopener noreferrer">',
    '              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>',
    '            </a>',
    '            <a href="https://www.linkedin.com/company/mujmakler" aria-label="LinkedIn MujMakler.cz" target="_blank" rel="noopener noreferrer">',
    '              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>',
    '            </a>',
    '            <a href="https://www.instagram.com/mujmakler" aria-label="Instagram MujMakler.cz" target="_blank" rel="noopener noreferrer">',
    '              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>',
    '            </a>',
    '          </div>',
    '        </div>',
    '      </div>',
    '    </div>',
    '    <div class="line"></div>',
    '    <div class="legal">',
    '      <span>\u00a9 2026 MujMakler.cz. V\u0161echna pr\u00e1va vyhrazena.</span>',
    '      <a href="gdpr.html">GDPR</a>',
    '      <a href="obchodni-podminky.html">Obchodn\u00ed podm\u00ednky</a>',
    '      <a href="aml.html">AML</a>',
    '      <a href="cookies.html">Cookies</a>',
    '    </div>',
    '  </div>',
    '</footer>',
    '<div class="toast" id="toast" role="status" aria-live="polite"></div>',
    '<button class="back-to-top" id="backToTop" aria-label="Zpět nahoru">',
    '  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><polyline points="18 15 12 9 6 15"/></svg>',
    '</button>'
  ].join('\n');

  /* ── Synchronní injekce hlavičky ── */
  var headerEl = document.getElementById('site-header');
  if (headerEl) {
    headerEl.outerHTML = HEADER;
  }

  /* ── Injekce patičky po načtení DOM ── */
  function injectFooter() {
    var footerEl = document.getElementById('site-footer');
    if (footerEl) {
      footerEl.outerHTML = FOOTER;
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectFooter);
  } else {
    injectFooter();
  }

})();
