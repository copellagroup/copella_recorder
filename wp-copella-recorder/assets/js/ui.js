window.CopellaUI = (function(){
  function haptic() { if ('vibrate' in navigator) navigator.vibrate(8); }
  function showToast(message, type, duration) {
    if (!type) type = 'info';
    if (!duration) duration = 3000;
    var colors = { info: 'bg-accent-blue', success: 'bg-accent-green', error: 'bg-error', warning: 'bg-warning' };
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
  function openModal(modal, content) { modal.innerHTML = content; modal.classList.remove('opacity-0', 'pointer-events-none'); modal.querySelector('.modal-content') && modal.querySelector('.modal-content').classList.remove('scale-95'); }
  function closeModal(modal) { if (!modal) return; modal.classList.add('opacity-0', 'pointer-events-none'); modal.querySelector('.modal-content') && modal.querySelector('.modal-content').classList.add('scale-95'); }
  return { haptic: haptic, showToast: showToast, createPlaceholder: createPlaceholder, openModal: openModal, closeModal: closeModal };
})();
