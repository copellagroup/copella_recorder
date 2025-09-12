document.addEventListener('DOMContentLoaded', function(){
  // Service worker placeholder (optional): disabled in plugin context
  // if ('serviceWorker' in navigator) { window.addEventListener('load', function(){ navigator.serviceWorker.register(CopellaRuntime.pluginUrl + 'sw.js'); }); }

  function handleSearch(query) {
    CopellaStations.renderList(query);
    
    // Показываем/скрываем кнопку очистки
    if (query.trim()) {
      CopellaDOM.clearSearchBtn.classList.remove('hidden');
    } else {
      CopellaDOM.clearSearchBtn.classList.add('hidden');
    }
    
    if (query.length > 2) {
      CopellaDOM.apiSearchResults.style.display = 'block';
      CopellaDOM.apiSearchMessage.textContent = 'Идет поиск...';
      CopellaDOM.apiSearchResultsContainer.innerHTML = '';
      debouncedApiSearch(query);
    } else {
      CopellaDOM.apiSearchResults.style.display = 'none';
      CopellaDOM.apiSearchResultsContainer.innerHTML = '';
    }
  }
  function debounce(func, delay) { var timeout; return function() { var args = arguments; clearTimeout(timeout); timeout = setTimeout(function(){ func.apply(null, args); }, delay); }; }
  var debouncedApiSearch = debounce(function(query){ searchGlobalStations(query); }, 500);
  function searchGlobalStations(query) {
    fetch('https://de1.api.radio-browser.info/json/stations/search?name=' + encodeURIComponent(query) + '&limit=15&hidebroken=true&order=clickcount&reverse=true')
      .then(function(res){ if (!res.ok) throw new Error('Network response was not ok'); return res.json(); })
      .then(function(data){ renderApiResults(data); })
      .catch(function(error){ console.error('API search failed:', error); CopellaDOM.apiSearchMessage.textContent = 'Ошибка поиска. Попробуйте позже.'; });
  }
  function renderApiResults(stations) {
    CopellaDOM.apiSearchResultsContainer.innerHTML = '';
    if (!stations || stations.length === 0) { 
      CopellaDOM.apiSearchMessage.textContent = 'Ничего не найдено.'; 
      return; 
    }
    CopellaDOM.apiSearchMessage.textContent = '';
    
    var list = document.createElement('ul');
    list.className = 'api-search-list';
    
    stations.forEach(function(station, index){
      var url = station.url_resolved || station.url;
      var isAlreadyAdded = CopellaState.stations.some(function(s){ return s.url === url; });
      var item = document.createElement('li');
      item.className = 'api-search-item';
      item.draggable = true;
      item.dataset.stationIndex = index;
      
      var iconHTML = station.favicon ? 
        '<img src="' + station.favicon + '" class="api-search-thumb" onerror="this.style.display=\'none\'">' : 
        '<div class="api-search-thumb bg-bg-color flex items-center justify-center text-text-secondary font-bold text-lg">' + 
        (station.name.charAt(0).toUpperCase()) + '</div>';
      
      item.innerHTML = 
        '<div class="api-search-card">' +
          '<div class="api-search-drag-handle">' +
            '<svg fill="currentColor" viewBox="0 0 24 24"><path d="M11 18c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm-2-8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 4c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>' +
          '</div>' +
          iconHTML +
          '<div class="api-search-meta">' +
            '<p class="api-search-name" title="' + station.name + '">' + station.name + '</p>' +
            '<p class="api-search-country">' + (station.country || 'Неизвестная страна') + '</p>' +
          '</div>' +
          '<div class="api-search-actions">' +
            '<button class="api-search-btn add-api-btn" title="Добавить в мой список" ' + 
            (isAlreadyAdded ? 'disabled' : '') + '>' + 
            (isAlreadyAdded ? CopellaConfig.ICONS.check : CopellaConfig.ICONS.add) + 
            '</button>' +
          '</div>' +
        '</div>';
      
      if (!isAlreadyAdded) {
        item.querySelector('.add-api-btn').onclick = function(e){ 
          e.stopPropagation(); 
          addStationFromApi(station, e.currentTarget); 
        };
      }
      
      // Добавляем обработчики перетаскивания
      item.addEventListener('dragstart', function(e) {
        e.dataTransfer.setData('text/plain', index);
        e.dataTransfer.effectAllowed = 'move';
        item.querySelector('.api-search-card').classList.add('dragging');
      });
      
      item.addEventListener('dragend', function(e) {
        item.querySelector('.api-search-card').classList.remove('dragging');
      });
      
      item.addEventListener('dragover', function(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
      });
      
      item.addEventListener('drop', function(e) {
        e.preventDefault();
        var draggedIndex = parseInt(e.dataTransfer.getData('text/plain'));
        var targetIndex = parseInt(item.dataset.stationIndex);
        
        if (draggedIndex !== targetIndex) {
          // Перемещаем элементы в массиве
          var draggedStation = stations[draggedIndex];
          stations.splice(draggedIndex, 1);
          stations.splice(targetIndex, 0, draggedStation);
          
          // Перерендериваем список
          renderApiResults(stations);
        }
      });
      
      list.appendChild(item);
    });
    
    CopellaDOM.apiSearchResultsContainer.appendChild(list);
    
    // Добавляем обработчики для кнопок навигации
    var prevBtn = document.getElementById('apiSearchPrev');
    var nextBtn = document.getElementById('apiSearchNext');
    
    if (prevBtn && nextBtn) {
      prevBtn.onclick = function(e){ 
        e.preventDefault(); 
        scrollApiResults(-200); 
      };
      nextBtn.onclick = function(e){ 
        e.preventDefault(); 
        scrollApiResults(200); 
      };
    }
  }
  
  function scrollApiResults(amount) {
    var container = CopellaDOM.apiSearchResultsContainer;
    if (!container) return;
    try { 
      container.scrollBy({ left: amount, behavior: 'smooth' }); 
    } catch(_){ 
      container.scrollLeft += amount; 
    }
  }
  function addStationFromApi(apiStation, btn) {
    var url = apiStation.url_resolved || apiStation.url;
    var newStation = { name: apiStation.name.trim(), url: url, icon: apiStation.favicon || '' };
    CopellaState.stations.push(newStation);
    CopellaStorage.saveStations();
    CopellaStations.renderList(CopellaDOM.stationSearchInput.value);
    btn.innerHTML = CopellaConfig.ICONS.check; btn.classList.add('text-accent-green'); btn.disabled = true; CopellaUI.showToast('Станция добавлена', 'success');
  }

  function init() {
    CopellaDB.init().catch(function(err){ console.error('Failed to init DB. Recordings will not be saved.', err); CopellaUI.showToast('Хранилище записей не инициализировано. Записи не будут сохраняться.', 'error', 5000); }).finally(function(){
      CopellaState.stations = CopellaStorage.getStations() || [
        { name: 'Европа Плюс', url: 'https://hls-01-regions.emgsound.ru/11_msk/playlist.m3u8', icon: 'https://www.radio-city.fm/wp-content/uploads/2017/04/logo-europa-plus.png' },
        { name: 'Радио РБК', url: 'https://hls-01-rbc.hostingradio.ru/rbc/playlist.m3u8', icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/RBC_logo_2019.svg/1200px-RBC_logo_2019.svg.png' }
      ];
      if (CopellaStorage.getStations() === null) CopellaStorage.saveStations();
      CopellaState.scheduledRecordings = CopellaStorage.getSchedules();
      CopellaDOM.audioPlayer.volume = CopellaStorage.getVolume();
      CopellaPlayer.renderPlayer(null);
      CopellaStations.renderList();
      CopellaVisualizer.updateMskTime();
      setInterval(CopellaVisualizer.updateMskTime, 5000);
      CopellaState.scheduleCheckInterval = setInterval(CopellaScheduler.checkSchedules, 5000);
      CopellaDOM.addStationHeaderBtn.onclick = function(){ CopellaUI.haptic(); CopellaModals.openStationModal(); };
      CopellaDOM.emptyAddBtn.onclick = function(){ CopellaUI.haptic(); CopellaModals.openStationModal(); };
      CopellaDOM.stationSearchInput.oninput = function(e){ handleSearch(e.target.value); };
      CopellaDOM.clearSearchBtn.onclick = function(){ 
        CopellaDOM.stationSearchInput.value = '';
        CopellaDOM.clearSearchBtn.classList.add('hidden');
        handleSearch(''); 
      };
      CopellaDOM.schedulerBtn.onclick = function(){ CopellaUI.haptic(); CopellaScheduler.openSchedulerModal(); };
      CopellaDOM.recordingsBtn.onclick = function(){ CopellaUI.haptic(); CopellaRecording.openRecordingsModal(); };
      CopellaDOM.settingsBtn.onclick = function(){ CopellaUI.haptic(); CopellaModals.openSettingsModal(); };
      CopellaDOM.statsBtn.onclick = function(){ CopellaUI.haptic(); CopellaStats.openStatsModal(); };
      CopellaDOM.streamInfoBtn.onclick = function(){ CopellaUI.haptic(); CopellaStreamInfo.openStreamInfoModal(); };
      
      // Инициализируем новые модули
      CopellaStats.init();
      
      // Обработчик кнопки "Назад"
      var backBtn = document.getElementById('backBtn');
      if (backBtn) {
        backBtn.onclick = function(){ 
          CopellaUI.haptic(); 
          // Проверяем, есть ли история браузера
          if (window.history.length > 1) {
            window.history.back();
          } else {
            // Если нет истории, перенаправляем на главную страницу сайта
            window.location.href = '/';
          }
        };
      }
      
      window.addEventListener('resize', CopellaVisualizer.resizeCanvas);
      CopellaDOM.audioPlayer.onplay = function(){
        CopellaPlayer.updatePlayPauseIcon();
        CopellaVisualizer.setup();
        CopellaDOM.playerPanel.classList.remove('loading', 'error');
        Array.prototype.forEach.call(document.querySelectorAll('.station-list-item.active .playing-indicator'), function(el){ el.classList.add('hidden'); });
        var activeItem = document.querySelector(".station-list-item[data-index='" + CopellaState.currentStationIndex + "']");
        if (activeItem) { var el = activeItem.querySelector('.playing-indicator'); if (el) el.classList.remove('hidden'); }
        if (CopellaState.pendingScheduledRecording) {
          var schedule = CopellaState.pendingScheduledRecording; schedule.status = 'recording'; CopellaRecording.toggleRecording(); setTimeout(function(){ if (CopellaState.mediaRecorder && CopellaState.mediaRecorder.state === 'recording') CopellaRecording.toggleRecording(); schedule.status = 'finished'; CopellaStorage.saveSchedules(); if (!CopellaDOM.schedulerModal.classList.contains('opacity-0')) CopellaScheduler.renderScheduleList(); }, schedule.duration * 60 * 1000); CopellaStorage.saveSchedules(); if (!CopellaDOM.schedulerModal.classList.contains('opacity-0')) CopellaScheduler.renderScheduleList(); CopellaState.pendingScheduledRecording = null;
        }
      };
      CopellaDOM.audioPlayer.onpause = function(){ CopellaPlayer.updatePlayPauseIcon(); CopellaDOM.playerPanel.classList.remove('loading'); Array.prototype.forEach.call(document.querySelectorAll('.playing-indicator'), function(item){ item.classList.add('hidden'); }); };
      CopellaDOM.audioPlayer.onvolumechange = CopellaPlayer.updateVolumeUI;
      CopellaDOM.audioPlayer.onerror = function(){ CopellaDOM.playerPanel.classList.remove('loading'); CopellaDOM.playerPanel.classList.add('error'); CopellaPlayer.updateNowPlayingUI('Ошибка потока'); };
      if (!localStorage.getItem(CopellaConfig.STORAGE_KEYS.welcomeSeen)) setTimeout(CopellaModals.openWelcomeModal, 500);
    });
  }
  init();
});
