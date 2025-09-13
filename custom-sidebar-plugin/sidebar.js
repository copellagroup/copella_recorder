(function(){
  if (document.documentElement.classList.contains('cp-sb-ready')) return;
  document.documentElement.classList.add('cp-sb-ready');

  var htmlEl = document.documentElement;
  var rail = document.querySelector('.cp-sb__rail');
  var burger = document.querySelector('.cp-sb__burger');
  var headerBurger = document.querySelector('.cp-header__burger');
  var drawer = document.getElementById('cp-sb__drawer');
  var scrim = document.querySelector('.cp-sb__scrim');
  var closeBtn = document.querySelector('.cp-sb__close');
  var labels = document.querySelectorAll('.cp-sb__label');
  var bodyEl = document.body;
  var isPinned = false;
  function isMobile(){ return (window.innerWidth || 0) <= 768; }

  function openDrawer(){
    if (!isMobile()) return;
    if (!drawer) return;
    drawer.hidden = false; if (scrim) scrim.hidden = false;
    /* Force reflow before adding class to ensure transition on older devices */
    // eslint-disable-next-line no-unused-expressions
    void drawer.offsetWidth;
    drawer.classList.add('is-open'); if (scrim) scrim.classList.add('is-visible');
    if (burger) burger.setAttribute('aria-expanded', 'true');
    if (headerBurger) headerBurger.setAttribute('aria-expanded', 'true');
    try { drawer.focus(); } catch(_){ }
    document.body.style.overflow = 'hidden';
  }
  function closeDrawer(){
    if (!drawer) return;
    drawer.classList.remove('is-open'); if (scrim) scrim.classList.remove('is-visible');
    if (burger) burger.setAttribute('aria-expanded', 'false');
    if (headerBurger) headerBurger.setAttribute('aria-expanded', 'false');
    
    setTimeout(function(){
      if (drawer) drawer.hidden = true; if (scrim) scrim.hidden = true;
    }, 280);
    document.body.style.overflow = '';
  }

  function toggleFrom(el){
    if (!isMobile()) return;
    var expanded = el.getAttribute('aria-expanded') === 'true';
    if (expanded) closeDrawer(); else openDrawer();
  }
  if (burger) burger.addEventListener('click', function(){
    if (!isMobile()) return;
    var expanded = burger.getAttribute('aria-expanded') === 'true';
    if (expanded) closeDrawer(); else openDrawer();
  }, false);
  if (headerBurger) headerBurger.addEventListener('click', function(){ toggleFrom(headerBurger); }, false);
  if (scrim) scrim.addEventListener('click', function(e){ if(e.target===scrim){ closeDrawer(); } }, false);
  if (closeBtn) closeBtn.addEventListener('click', closeDrawer, false);
  document.addEventListener('keydown', function(e){
    var k = e.key || e.keyCode; if (k === 'Escape' || k === 'Esc' || k === 27) closeDrawer();
  }, false);

  
  var resizeDebounce;
  window.addEventListener('resize', function(){
    clearTimeout(resizeDebounce);
    resizeDebounce = setTimeout(function(){
      if (window.innerWidth > 768) closeDrawer();
    }, 100);
  }, false);

  
  try {
    var prefersHover = window.matchMedia('(hover: hover) and (pointer: fine)');
    function setExpandedState(expanded){
      if (expanded) { htmlEl.classList.add('cp-sb-expanded'); }
      else { htmlEl.classList.remove('cp-sb-expanded'); }
    }

    // GSAP-powered hover animation for desktop, with graceful fallback
    if (prefersHover && prefersHover.matches && rail) {
      var usingGsap = typeof window.gsap !== 'undefined';
      var tl = usingGsap ? window.gsap.timeline({ paused: true, defaults: { ease: 'power2.out' } }) : null;
      var railWidthMini = getComputedStyle(document.documentElement).getPropertyValue('--cp-sb-rail-w').trim();
      var railWidthFull = getComputedStyle(document.documentElement).getPropertyValue('--cp-sb-expanded-w').trim();

      if (usingGsap) {
        // Prevent CSS hover width transition fighting with GSAP
        document.documentElement.classList.add('cp-sb-gsap');

        // Prepare initial state
        window.gsap.set(rail, { width: railWidthMini });
        window.gsap.set(labels, { opacity: 0, x: -6, maxWidth: 0 });

        // Animate body padding-left directly (for browsers without CSS vars) and update CSS var when supported
        var startPx = parseInt(railWidthMini, 10) || 88;
        var endPx = parseInt(railWidthFull, 10) || 232;
        // Set an initial inline padding-left to ensure consistent start on older browsers
        try { bodyEl.style.paddingLeft = startPx + 'px'; } catch(_){ }
        var proxy = { v: startPx };
        tl.to(proxy, { v: endPx, duration: 0.24, onUpdate: function(){
          try { document.documentElement.style.setProperty('--cp-sb-left', proxy.v + 'px'); } catch(_){ }
          try { bodyEl.style.paddingLeft = proxy.v + 'px'; } catch(_){ }
        }}, 0);
        tl.to(rail, { width: railWidthFull, duration: 0.24 }, 0);
        tl.to(labels, { opacity: 1, x: 0, maxWidth: 160, duration: 0.2, stagger: 0.02 }, 0.04);

        function onEnter(){ tl.play(); setExpandedState(true); }
        function onLeave(){ 
          if (isPinned) return;
          tl.reverse(); 
          // Delay state change to allow animation to complete
          setTimeout(function(){ if (!isPinned) setExpandedState(false); }, 240);
        }
        rail.addEventListener('mouseenter', onEnter, false);
        rail.addEventListener('mouseleave', onLeave, false);

        window.addEventListener('resize', function(){ if (window.innerWidth <= 768) { isPinned = false; tl.pause(0); setExpandedState(false); } }, false);

        // Minimal API for desktop pin/unpin controlled from header toggle
        try {
          window.cpSidebar = window.cpSidebar || {};
          window.cpSidebar.isPinned = function(){ return !!isPinned; };
          window.cpSidebar.expandPinned = function(){
            isPinned = true;
            if (tl) { tl.play(); }
            setExpandedState(true);
          };
          window.cpSidebar.collapsePinned = function(){
            isPinned = false;
            if (tl) { tl.reverse(); setTimeout(function(){ if (!isPinned) setExpandedState(false); }, 240); }
            else { setExpandedState(false); }
          };
          window.cpSidebar.togglePinned = function(){ if (isPinned) window.cpSidebar.collapsePinned(); else window.cpSidebar.expandPinned(); };
        } catch(_){ /* no-op */ }
      } else {
        // Fallback to CSS-driven state toggle for very old browsers (e.g., Lumia IE/Edge legacy)
        function onRailEnter(){ setExpandedState(true); }
        function onRailLeave(){ setExpandedState(false); }
        rail.addEventListener('mouseenter', onRailEnter, false);
        rail.addEventListener('mouseleave', onRailLeave, false);
        window.addEventListener('resize', function(){ if (window.innerWidth <= 768) setExpandedState(false); }, false);
      }
    }
  } catch(_){ }

  
  function scrollToDonate(){
    var isHome = location.pathname === '/' || location.pathname === '';
    if (!isHome) {
      try {
        var url = (window.location.origin || '') + '/' + '#donate';
        window.location.assign(url);
      } catch(_) {
        window.location.assign('/#donate');
      }
      return;
    }
    var target = document.querySelector('#donate') || document.querySelector('.cp-support') || document.querySelector('[data-scroll-target="donate"]');
    if (!target){
      try { window.location.hash = 'donate'; } catch(_){ }
      return;
    }
    try {
      var top = target.getBoundingClientRect().top + window.pageYOffset - 80; // offset for sticky header
      window.scrollTo({ top: top, behavior: 'smooth' });
    } catch(_){ window.location.hash = 'donate'; }
    closeDrawer();
  }
  document.querySelectorAll('[data-scroll-donate="1"]').forEach(function(el){
    el.addEventListener('click', function(e){ e.preventDefault(); scrollToDonate(); }, false);
  });

  // Handle arriving to /#donate from other pages: ensure offset scroll after load
  function handleHashOnLoad(){
    var h = (location.hash || '').replace('#','');
    if(h !== 'donate') return;
    var attempts = 0;
    (function tryScroll(){
      attempts++;
      var target = document.querySelector('#donate') || document.querySelector('.cp-support') || document.querySelector('[data-scroll-target="donate"]');
      if (target) {
        try {
          var top = target.getBoundingClientRect().top + window.pageYOffset - 80;
          window.scrollTo({ top: top, behavior: 'smooth' });
        } catch(_){ /* ignore */ }
        return;
      }
      if (attempts < 20) { setTimeout(tryScroll, 50); }
    })();
  }
  window.addEventListener('load', handleHashOnLoad, false);
  window.addEventListener('hashchange', handleHashOnLoad, false);
})();
