(function(){
  if (document.documentElement.classList.contains('cp-header-ready')) return;
  document.documentElement.classList.add('cp-header-ready');

  // Robust admin bar detection and offset management
  var root = document.documentElement;
  function updateAdminBarOffset(){
    try {
      var bar = document.getElementById('wpadminbar');
      var offset = 0;
      var isFixed = false;
      if (bar) {
        var cs = window.getComputedStyle(bar);
        isFixed = !!(cs && (cs.position === 'fixed' || cs.position === 'sticky'));
        var rect = bar.getBoundingClientRect();
        var h = (rect && rect.height) ? rect.height : (bar.offsetHeight || parseInt(cs.height || '0', 10) || 0);
        if (isFixed && h > 0) offset = h;
      }
      root.style.setProperty('--cp-adminbar-h', (offset || 0) + 'px');
      if (bar) { root.classList.toggle('cp-adminbar-fixed', !!(isFixed && offset > 0)); }
      else { root.classList.remove('cp-adminbar-fixed'); }
    } catch(_){ /* no-op */ }
  }
  updateAdminBarOffset();

  // Keep in sync on resize and when admin bar height changes dynamically
  var adminbarResizeDebounce;
  window.addEventListener('resize', function(){
    clearTimeout(adminbarResizeDebounce);
    adminbarResizeDebounce = setTimeout(updateAdminBarOffset, 120);
  }, false);

  try {
    // Observe runtime height changes
    if (window.ResizeObserver) {
      var barEl = document.getElementById('wpadminbar');
      if (barEl) {
        var ro = new ResizeObserver(function(){ updateAdminBarOffset(); });
        ro.observe(barEl);
      }
    }
    // Detect late insertion/removal of admin bar
    if (window.MutationObserver) {
      var mo = new MutationObserver(function(){ updateAdminBarOffset(); });
      mo.observe(document.documentElement, { childList: true, subtree: true });
    }
  } catch(_){ /* ignore observer errors */ }

  var header = document.getElementById('cp-header');
  var toggle = document.querySelector('[data-search-toggle]') || document.querySelector('.cp-header__search-toggle');
  var sidebarToggle = document.querySelector('[data-sidebar-toggle]') || document.querySelector('.cp-header__sidebar-toggle');
  var form = document.querySelector('.cp-header__search-form');
  var searchInput = form ? form.querySelector('input[type="search"]') : null;
  var searchCancel = document.querySelector('[data-search-cancel]');
  var panel = document.getElementById('cp-search-panel');
  var scroller = document.querySelector('[data-popular-scroller]');
  var prevBtn = panel ? panel.querySelector('[data-popular-prev]') : null;
  var nextBtn = panel ? panel.querySelector('[data-popular-next]') : null;
  function setExpanded(expanded){
    if (!toggle || !form || !header) return;
    toggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    header.classList.toggle('cp-header--search-open', !!expanded);
    if (!expanded) { form.style.display = ''; }
    
    // Keep search form in place - don't let it move
    if (form) {
      form.style.position = 'relative';
      form.style.zIndex = '1002';
    }

    // GSAP animate panel and form
    try {
      var useGsap = !!window.gsap;
      if (useGsap) { document.documentElement.classList.add('cp-header-gsap'); }
      if (useGsap && panel) {
        if (expanded) {
          panel.hidden = false;
          panel.style.pointerEvents = 'auto';
          window.gsap.fromTo(panel, { autoAlpha: 0, y: -6 }, { autoAlpha: 1, y: 0, duration: 0.22, ease: 'power2.out', onStart: function(){ panel.classList.add('is-visible'); } });
        } else {
          panel.style.pointerEvents = 'none';
          window.gsap.to(panel, { autoAlpha: 0, y: -6, duration: 0.18, ease: 'power2.in', onComplete: function(){ panel.hidden = true; panel.classList.remove('is-visible'); } });
        }
      } else if (panel) {
        // CSS fallback
        panel.classList.toggle('is-visible', !!expanded);
        panel.hidden = !expanded;
      }
    } catch(_){ /* ignore */ }
  }
  if (toggle) {
    toggle.addEventListener('click', function(){
      var expanded = toggle.getAttribute('aria-expanded') === 'true';
      setExpanded(!expanded);
      if (!expanded && searchInput) { try { searchInput.focus(); } catch(_){} }
    }, false);
  }

  // Sidebar toggle functionality
  if (sidebarToggle) {
    sidebarToggle.addEventListener('click', function(){
      var expanded = sidebarToggle.getAttribute('aria-expanded') === 'true';
      var toExpand = !expanded;
      sidebarToggle.setAttribute('aria-expanded', toExpand);

      // Desktop-only pin/unpin with smooth GSAP via cpSidebar API if available
      try {
        if (window.innerWidth > 768 && window.cpSidebar) {
          if (toExpand) { window.cpSidebar.expandPinned(); }
          else { window.cpSidebar.collapsePinned(); }
          return;
        }
      } catch(_){ /* no-op */ }

      // Fallback: toggle class directly
      if (toExpand) { root.classList.add('cp-sb-expanded'); }
      else { root.classList.remove('cp-sb-expanded'); }
    }, false);
  }

  // Cancel button for mobile search
  if (searchCancel) {
    searchCancel.addEventListener('click', function(){
      setExpanded(false);
      if (searchInput) { try { searchInput.blur(); } catch(_){} }
    }, false);
  }

  // Open panel when focusing the input on desktop only
  if (searchInput) {
    searchInput.addEventListener('focus', function(){
      try { 
        if (window.innerWidth > 768) {
          setExpanded(true); 
        }
      } catch(_){}
    }, false);
  }

  // Close on outside click
  document.addEventListener('click', function(e){
    try {
      var within = header.contains(e.target) || (panel && panel.contains(e.target));
      if (!within) setExpanded(false);
    } catch(_){}
  }, false);

  // Popular carousel buttons
  function scrollByAmount(amount){
    if (!scroller) return; 
    try { 
      scroller.scrollBy({ left: amount, behavior: 'smooth' }); 
    } catch(_){ 
      scroller.scrollLeft += amount; 
    }
  }
  if (prevBtn) prevBtn.addEventListener('click', function(e){ e.preventDefault(); scrollByAmount(-280); }, false);
  if (nextBtn) nextBtn.addEventListener('click', function(e){ e.preventDefault(); scrollByAmount(280); }, false);

  // Touch is native with touch-action: pan-x; no JS needed

  var lastWidth = window.innerWidth;
  window.addEventListener('resize', function(){
    if (window.innerWidth !== lastWidth) {
      lastWidth = window.innerWidth;
      setExpanded(false);
    }
  }, false);

  // Close on Escape
  document.addEventListener('keydown', function(e){
    var k = e.key || e.keyCode;
    if (k === 'Escape' || k === 'Esc' || k === 27) setExpanded(false);
  }, false);
})();

