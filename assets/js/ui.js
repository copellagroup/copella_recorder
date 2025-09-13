window.CopellaUI = (function(){
  function haptic() { if ('vibrate' in navigator) navigator.vibrate(8); }
  function showToast(message, type, duration) {
    if (!type) type = 'info';
    if (!duration) duration = 3000;
    var colors = { info: 'bg-accent', success: 'bg-accent-green', error: 'bg-error', warning: 'bg-warning' };
    var toast = document.createElement('div');
    toast.className = 'toast p-3 rounded-medium text-center text-sm font-semibold shadow-lg text-bg-color ' + colors[type] + ' animate-fade-in-up';
    toast.textContent = message;
    CopellaDOM.toastContainer.appendChild(toast);
    setTimeout(function(){ toast.classList.remove('animate-fade-in-up'); toast.classList.add('animate-fade-out-down'); setTimeout(function(){ toast.remove(); }, 300); }, duration);
  }
  function createPlaceholder(name, extraClasses) {
    var initial = (name ? name.trim().charAt(0) : '?').toUpperCase();
    var hash = 0; for (var i = 0; i < (name || '').length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    var color = 'hsl(' + (hash % 360) + ', 50%, 30%)';
    var classes = ['w-full h-full flex items-center justify-center font-bold'];
    if (extraClasses && extraClasses.length) classes = classes.concat(extraClasses);
    return '<div class="' + classes.join(' ') + '" style="background-color:' + color + ';">' + initial + '</div>';
  }
  function openModal(modal, content) {
    if (!modal) return;
    // Clean up previous listeners if reusing the same modal
    if (modal._overlayHandler) modal.removeEventListener('click', modal._overlayHandler, false);
    if (modal._escHandler) document.removeEventListener('keydown', modal._escHandler, false);

    modal.innerHTML = content;
    modal.classList.remove('opacity-0', 'pointer-events-none');
    var contentEl = modal.querySelector('.modal-content');
    if (contentEl) contentEl.classList.remove('scale-95');

    // Close on overlay click
    modal._overlayHandler = function(e){ if (e.target === modal) closeModal(modal); };
    modal.addEventListener('click', modal._overlayHandler, false);

    // Close on Escape
    modal._escHandler = function(e){ if (e.key === 'Escape') closeModal(modal); };
    document.addEventListener('keydown', modal._escHandler, false);
  }
  function closeModal(modal) {
    if (!modal) return;
    modal.classList.add('opacity-0', 'pointer-events-none');
    var contentEl = modal.querySelector('.modal-content');
    if (contentEl) contentEl.classList.add('scale-95');

    // Detach listeners
    if (modal._overlayHandler) { modal.removeEventListener('click', modal._overlayHandler, false); modal._overlayHandler = null; }
    if (modal._escHandler) { document.removeEventListener('keydown', modal._escHandler, false); modal._escHandler = null; }
  }
  // Новые микрофункции
  function animateElement(element, animation, duration) {
    if (!element) return;
    element.style.animation = animation + ' ' + (duration || '0.3s') + ' ease-out';
    setTimeout(function() { element.style.animation = ''; }, duration || 300);
  }
  
  function createGradientBackground(element, colors) {
    // Отключено для строгого дизайна
    return;
  }
  
  function addSparkleEffect(element) {
    // Отключено для строгого дизайна
    return;
  }
  
  function createFloatingButton(text, icon, onClick) {
    // Отключено для строгого дизайна
    return;
  }
  
  function addRippleEffect(element, event) {
    if (!element) return;
    var ripple = document.createElement('span');
    var rect = element.getBoundingClientRect();
    var size = Math.max(rect.width, rect.height);
    var x = event.clientX - rect.left - size / 2;
    var y = event.clientY - rect.top - size / 2;
    
    ripple.style.cssText = 'position: absolute; border-radius: 50%; background: rgba(255,255,255,0.3); transform: scale(0); animation: ripple 0.6s linear; left: ' + x + 'px; top: ' + y + 'px; width: ' + size + 'px; height: ' + size + 'px;';
    
    element.style.position = 'relative';
    element.style.overflow = 'hidden';
    element.appendChild(ripple);
    
    setTimeout(function() { ripple.remove(); }, 600);
  }
  
  function createProgressRing(element, progress, size) {
    if (!element) return;
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', size || '60');
    svg.setAttribute('height', size || '60');
    svg.setAttribute('class', 'progress-ring');
    
    var circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', (size || 60) / 2);
    circle.setAttribute('cy', (size || 60) / 2);
    circle.setAttribute('r', ((size || 60) - 4) / 2);
    circle.setAttribute('fill', 'transparent');
    circle.setAttribute('stroke', '#FFFFFF');
    circle.setAttribute('stroke-width', '4');
    circle.setAttribute('stroke-dasharray', '2 * Math.PI * ' + ((size || 60) - 4) / 2);
    circle.setAttribute('stroke-dashoffset', '2 * Math.PI * ' + ((size || 60) - 4) / 2 + ' * (1 - ' + progress + ')');
    
    svg.appendChild(circle);
    element.appendChild(svg);
    return svg;
  }
  
  // Новые микрофункции
  function createNotificationBadge(element, count) {
    if (!element) return;
    var badge = document.createElement('span');
    badge.className = 'notification-badge absolute -top-1 -right-1 bg-record text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1';
    badge.textContent = count > 99 ? '99+' : count;
    element.style.position = 'relative';
    element.appendChild(badge);
    return badge;
  }
  
  function addPulseEffect(element, color) {
    if (!element) return;
    element.style.animation = 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite';
    element.style.boxShadow = '0 0 0 0 ' + (color || 'rgba(255, 255, 255, 0.4)');
  }
  
  function createTooltip(element, text) {
    if (!element) return;
    var tooltip = document.createElement('div');
    tooltip.className = 'tooltip absolute z-50 px-2 py-1 text-xs font-semibold text-bg-color bg-accent rounded-small opacity-0 pointer-events-none transition-opacity duration-200';
    tooltip.textContent = text;
    element.style.position = 'relative';
    element.appendChild(tooltip);
    
    element.addEventListener('mouseenter', function() {
      tooltip.style.opacity = '1';
    });
    
    element.addEventListener('mouseleave', function() {
      tooltip.style.opacity = '0';
    });
    
    return tooltip;
  }
  
  function addGlowEffect(element, color) {
    if (!element) return;
    element.style.boxShadow = '0 0 20px ' + (color || 'rgba(255, 255, 255, 0.3)');
    element.style.transition = 'box-shadow 0.3s ease';
  }
  
  function removeGlowEffect(element) {
    if (!element) return;
    element.style.boxShadow = 'none';
  }
  
  function createLoadingSpinner(size) {
    var spinner = document.createElement('div');
    spinner.className = 'loading-spinner inline-block';
    spinner.style.width = (size || '20') + 'px';
    spinner.style.height = (size || '20') + 'px';
    spinner.style.border = '2px solid rgba(255, 255, 255, 0.3)';
    spinner.style.borderTop = '2px solid #FFFFFF';
    spinner.style.borderRadius = '50%';
    spinner.style.animation = 'spin 1s linear infinite';
    return spinner;
  }
  
  function addShakeEffect(element) {
    if (!element) return;
    element.style.animation = 'shake 0.5s ease-in-out';
    setTimeout(function() {
      element.style.animation = '';
    }, 500);
  }
  
  // Новые функции версии 1.1
  function createWaveAnimation(element, color) {
    if (!element) return;
    var wave = document.createElement('div');
    wave.className = 'wave-animation absolute inset-0 pointer-elements-none';
    wave.innerHTML = '<div class="wave w-full h-full border-2 border-current opacity-30 rounded-full animate-ping"></div>';
    wave.style.color = color || '#FFFFFF';
    element.style.position = 'relative';
    element.appendChild(wave);
    
    setTimeout(function() {
      wave.remove();
    }, 2000);
    
    return wave;
  }
  
  function addTypewriterEffect(element, text, speed) {
    if (!element || !text) return;
    element.textContent = '';
    var i = 0;
    var interval = setInterval(function() {
      element.textContent += text.charAt(i);
      i++;
      if (i >= text.length) {
        clearInterval(interval);
      }
    }, speed || 50);
    
    return interval;
  }
  
  return { 
    haptic: haptic, 
    showToast: showToast, 
    createPlaceholder: createPlaceholder, 
    openModal: openModal, 
    closeModal: closeModal,
    animateElement: animateElement,
    createGradientBackground: createGradientBackground,
    addSparkleEffect: addSparkleEffect,
    createFloatingButton: createFloatingButton,
    addRippleEffect: addRippleEffect,
    createProgressRing: createProgressRing,
    createNotificationBadge: createNotificationBadge,
    addPulseEffect: addPulseEffect,
    createTooltip: createTooltip,
    addGlowEffect: addGlowEffect,
    removeGlowEffect: removeGlowEffect,
    createLoadingSpinner: createLoadingSpinner,
    addShakeEffect: addShakeEffect,
    createWaveAnimation: createWaveAnimation,
    addTypewriterEffect: addTypewriterEffect
  };
})();
