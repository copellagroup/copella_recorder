window.CopellaUI = (function(){
  function haptic() { if ('vibrate' in navigator) navigator.vibrate(8); }
  function showToast(message, type, duration) {
    if (!type) type = 'info';
    if (!duration) duration = 3000;
    var colors = { info: 'bg-accent-purple', success: 'bg-accent-green', error: 'bg-error', warning: 'bg-warning' };
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
    if (!element || !colors) return;
    var gradient = 'linear-gradient(135deg, ' + colors.join(', ') + ')';
    element.style.background = gradient;
  }
  
  function addSparkleEffect(element) {
    if (!element) return;
    var sparkle = document.createElement('div');
    sparkle.className = 'sparkle-effect absolute inset-0 pointer-events-none';
    sparkle.innerHTML = '<div class="sparkle w-1 h-1 bg-accent-pink rounded-full animate-ping absolute top-2 left-2"></div><div class="sparkle w-1 h-1 bg-accent-purple rounded-full animate-ping absolute top-4 right-3" style="animation-delay: 0.5s;"></div><div class="sparkle w-1 h-1 bg-accent-green rounded-full animate-ping absolute bottom-3 left-4" style="animation-delay: 1s;"></div>';
    element.style.position = 'relative';
    element.appendChild(sparkle);
  }
  
  function createFloatingButton(text, icon, onClick) {
    var button = document.createElement('button');
    button.className = 'floating-btn fixed bottom-6 right-6 w-14 h-14 bg-accent-pink text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center z-40';
    button.innerHTML = icon || '<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"></path></svg>';
    button.title = text;
    button.addEventListener('click', onClick);
    document.body.appendChild(button);
    return button;
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
    circle.setAttribute('stroke', '#8B5CF6');
    circle.setAttribute('stroke-width', '4');
    circle.setAttribute('stroke-dasharray', '2 * Math.PI * ' + ((size || 60) - 4) / 2);
    circle.setAttribute('stroke-dashoffset', '2 * Math.PI * ' + ((size || 60) - 4) / 2 + ' * (1 - ' + progress + ')');
    
    svg.appendChild(circle);
    element.appendChild(svg);
    return svg;
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
    createProgressRing: createProgressRing
  };
})();
