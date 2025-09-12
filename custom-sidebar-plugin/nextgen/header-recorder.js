(function(){
  // Проверяем, находимся ли мы на странице copella-recorder
  function isCopellaRecorderPage() {
    // Проверяем URL
    const currentUrl = window.location.href;
    if (currentUrl.includes('copella.live/copella-recorder') || 
        currentUrl.includes('/copella-recorder') ||
        document.body.classList.contains('copella-recorder-page')) {
      return true;
    }
    
    // Проверяем наличие шорткода [copella_recorder] на странице
    const recorderShortcode = document.querySelector('[data-copella-recorder]') || 
                             document.querySelector('.app-container') ||
                             document.querySelector('#copella-recorder');
    
    return !!recorderShortcode;
  }

  // Инициализация специального хедера
  function initRecorderHeader() {
    if (!isCopellaRecorderPage()) return;
    
    // Добавляем класс к body для стилизации
    document.body.classList.add('copella-recorder-page');
    
    const header = document.getElementById('cp-header-recorder');
    if (!header) return;
    
    // Обработчик кнопки "Назад"
    const backBtn = header.querySelector('#backBtn');
    if (backBtn) {
      backBtn.addEventListener('click', function() {
        // Проверяем, есть ли история браузера
        if (window.history.length > 1) {
          window.history.back();
        } else {
          // Если нет истории, переходим на главную
          window.location.href = '/';
        }
      });
    }
    
    // Обработчик кнопки настроек
    const settingsBtn = header.querySelector('#settingsBtn');
    if (settingsBtn) {
      settingsBtn.addEventListener('click', function() {
        // Ищем модальное окно настроек в приложении recorder
        const settingsModal = document.querySelector('#settingsModal');
        if (settingsModal) {
          // Показываем модальное окно настроек
          settingsModal.classList.remove('opacity-0', 'pointer-events-none');
          settingsModal.classList.add('opacity-100');
        }
      });
    }
    
    // Обновление времени (если есть элемент для времени)
    const timeElement = header.querySelector('#mskTime');
    if (timeElement) {
      function updateTime() {
        const now = new Date();
        const mskTime = new Date(now.getTime() + (3 * 60 * 60 * 1000)); // UTC+3 для Москвы
        timeElement.textContent = mskTime.toLocaleTimeString('ru-RU', {
          hour: '2-digit',
          minute: '2-digit'
        });
      }
      
      updateTime();
      setInterval(updateTime, 1000);
    }
  }

  // Инициализация при загрузке DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRecorderHeader);
  } else {
    initRecorderHeader();
  }
})();