window.CopellaPlayer = (function(){
  var DEFAULT_STATIONS = [
    { name: 'Европа Плюс', url: 'https://hls-01-regions.emgsound.ru/11_msk/playlist.m3u8', icon: 'https://www.radio-city.fm/wp-content/uploads/2017/04/logo-europa-plus.png' },
    { name: 'Радио РБК', url: 'https://hls-01-rbc.hostingradio.ru/rbc/playlist.m3u8', icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/RBC_logo_2019.svg/1200px-RBC_logo_2019.svg.png' }
  ];

  function createPlayerHTML(station) {
    var artContent = station.icon ? '<img src="' + station.icon + '" alt="' + station.name + '" class="w-full h-full object-cover">' : CopellaUI.createPlaceholder(station.name, ['text-4xl']);
    return '<div class="player-art w-32 h-32 rounded-large flex-shrink-0 bg-bg-color overflow-hidden transition-shadow duration-400 ease-in-out">' + artContent + '</div>' +
      '<div class="station-info text-center flex flex-col justify-center gap-1 w/full overflow-hidden">' +
      '<div id="player-station-name" class="text-2xl font-extrabold truncate flex items-center justify-center gap-2" title="' + station.name + '">' + station.name + '<button id="copyUrlBtn" class="p-1 rounded-full text-text-secondary hover:bg-white/10 hover:text-accent transition-colors" title="Копировать URL потока">' + CopellaConfig.ICONS.copy + '</button></div>' +
      '<div id="player-now-playing" class="text-base font-medium text-text-secondary transition-colors duration-300 whitespace-nowrap overflow-hidden text-ellipsis w-full">Прямой эфир</div>' +
      '<div id="conversion-progress-container" class="w-full max-w-xs mx-auto text-center hidden mt-2"><p id="conversion-status-text" class="text-sm text-text-secondary mb-1">Обработка...</p><div class="w-full bg-border-color rounded-full h-1.5"><div id="conversion-progress-bar" class="bg-accent-blue h-1.5 rounded-full transition-width duration-300" style="width: 0%"></div></div></div>' +
      '</div>' +
      '<div class="player-controls flex items-center justify-center gap-2 sm:gap-4 mt-2 w-full">' +
      '<button id="recordButton" class="control-button w-12 h-12 bg-white/10 border border-border-color rounded-full flex justify-center items-center transition-all duration-200 active:scale-90" title="Запись"><div class="record-icon w-4 h-4 bg-record rounded-full"></div></button>' +
      '<button id="playPauseButton" class="control-button w-16 h-16 bg-accent text-bg-color rounded-full flex justify-center items-center border-none transition-transform active:scale-90">' + CopellaConfig.ICONS.play + '</button>' +
      '<div class="volume-control-wrapper flex items-center gap-2"><button id="volumeIcon" class="control-button w-12 h-12 bg-white/10 border border-border-color rounded-full flex justify-center items-center transition-all duration-200 active:scale-90" title="Громкость">' + CopellaConfig.ICONS.volumeOn + '</button><div class="volume-slider-container w-24"><input type="range" id="volumeSlider" min="0" max="1" step="0.01" class="w-full"></div></div>' +
      '</div>';
  }

  function renderPlayer(station) {
    if (station) {
      CopellaDOM.playerContent.innerHTML = createPlayerHTML(station);
      document.getElementById('recordButton').onclick = function(){ CopellaUI.haptic(); CopellaRecording.toggleRecording(); };
      document.getElementById('playPauseButton').onclick = function(){ CopellaUI.haptic(); togglePlayPause(); };
      document.getElementById('copyUrlBtn').onclick = function(e){ e.stopPropagation(); CopellaUI.haptic(); navigator.clipboard.writeText(station.url).then(function(){ CopellaUI.showToast('URL потока скопирован!', 'success'); }); };
      var volumeSlider = document.getElementById('volumeSlider');
      var volumeIcon = document.getElementById('volumeIcon');
      volumeSlider.value = CopellaDOM.audioPlayer.volume;
      volumeSlider.oninput = function(e){ setVolume(e.target.value); };
      volumeSlider.onchange = function(e){ CopellaStorage.saveVolume(e.target.value); };
      volumeIcon.onclick = function(){ CopellaDOM.audioPlayer.muted = !CopellaDOM.audioPlayer.muted; updateVolumeUI(); };
      updatePlayPauseIcon();
      updateVolumeUI();
    } else {
      CopellaDOM.playerContent.innerHTML = '<div id="player-placeholder" class="m-auto text-text-secondary">Станция не выбрана</div>';
    }
  }

  function chooseBestMimeType() {
    var candidates = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus',
      'audio/ogg',
      'audio/mp4'
    ];
    for (var i = 0; i < candidates.length; i++) {
      if (window.MediaRecorder && MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(candidates[i])) return candidates[i];
    }
    return '';
  }

  function playStation(index) {
    if (CopellaState.currentStationIndex === index && !CopellaDOM.audioPlayer.paused) { togglePlayPause(); return; }
    if (index < 0 || index >= CopellaState.stations.length) return;
    if (CopellaState.mediaRecorder && CopellaState.mediaRecorder.state === 'recording') { CopellaUI.showToast('Остановите запись перед сменой станции.', 'warning'); return; }
    CopellaState.currentStationIndex = index;
    var station = CopellaState.stations[index];
    CopellaDOM.playerContent.classList.add('opacity-0');
    setTimeout(function(){ updateMediaSession(station); renderPlayer(station); CopellaStations.renderList(CopellaDOM.stationSearchInput.value); CopellaDOM.playerContent.classList.remove('opacity-0'); }, 300);
    CopellaDOM.playerPanel.classList.remove('error');
    CopellaDOM.playerPanel.classList.add('loading');
    var streamUrl = station.url;
    
    // Улучшенная логика поддержки различных типов потоков
    if (isHlsStream(streamUrl)) {
      playHlsStream(streamUrl);
    } else if (isIcecastStream(streamUrl)) {
      playIcecastStream(streamUrl);
    } else {
      // Для потоков без явного расширения сначала пробуем HLS
      tryHlsFirst(streamUrl);
    }
    CopellaStorage.setLastPlayed(index);
  }

  function isHlsStream(url) {
    // Проверяем только расширения файлов
    var hlsExtensions = ['.m3u8', '.m3u'];
    
    for (var i = 0; i < hlsExtensions.length; i++) {
      if (url.indexOf(hlsExtensions[i]) > -1) {
        return Hls.isSupported();
      }
    }
    
    return false;
  }

  function isIcecastStream(url) {
    return url.indexOf('icecast') > -1 || url.indexOf('shoutcast') > -1 || url.indexOf('stream') > -1;
  }

  function tryHlsFirst(streamUrl) {
    // Сначала пробуем как HLS поток
    try { 
      CopellaState.hls.destroy(); 
    } catch(e) {}
    
    var hlsConfig = {
      enableWorker: true,
      lowLatencyMode: true,
      backBufferLength: 90,
      maxBufferLength: 30,
      maxMaxBufferLength: 60,
      liveSyncDurationCount: 3,
      liveMaxLatencyDurationCount: 5,
      fragLoadingTimeOut: 15000,
      manifestLoadingTimeOut: 8000,
      levelLoadingTimeOut: 8000,
      startLevel: -1,
      capLevelToPlayerSize: false,
      maxLoadingDelay: 4,
      maxBufferHole: 0.5
    };
    
    CopellaState.hls = new Hls(hlsConfig);
    CopellaState.hls.loadSource(streamUrl);
    CopellaState.hls.attachMedia(CopellaDOM.audioPlayer);
    
    var hlsFailed = false;
    
    CopellaState.hls.on(Hls.Events.MANIFEST_PARSED, function(){ 
      console.log('HLS manifest parsed successfully (tryHlsFirst)');
      CopellaDOM.audioPlayer.play().catch(function(err) {
        console.error('HLS play failed in tryHlsFirst:', err);
        if (!hlsFailed) {
          hlsFailed = true;
          CopellaUI.showToast('HLS не работает, пробуем нативное воспроизведение', 'info');
          playNatively(streamUrl);
        }
      }); 
    });
    
    CopellaState.hls.on(Hls.Events.ERROR, function(event, data){ 
      console.error('HLS error in tryHlsFirst:', data);
      if (data.fatal && !hlsFailed) {
        hlsFailed = true;
        console.log('HLS failed, switching to native playback');
        CopellaUI.showToast('HLS не поддерживается, переключаемся на нативное воспроизведение', 'info');
        playNatively(streamUrl);
      }
    });
    
    // Таймаут для HLS - если за 10 секунд не загрузился, переходим на нативное
    setTimeout(function() {
      if (!hlsFailed && CopellaState.hls && CopellaState.hls.media && CopellaState.hls.media.readyState < 2) {
        hlsFailed = true;
        console.log('HLS timeout, switching to native playback');
        CopellaUI.showToast('HLS загрузка слишком медленная, переключаемся на нативное воспроизведение', 'info');
        playNatively(streamUrl);
      }
    }, 10000);
  }

  function playHlsStream(streamUrl) {
    try { 
      CopellaState.hls.destroy(); 
    } catch(e) {}
    
    // Настройки HLS для различных типов потоков
    var hlsConfig = {
      enableWorker: true,
      lowLatencyMode: true,
      backBufferLength: 90,
      maxBufferLength: 30,
      maxMaxBufferLength: 60,
      liveSyncDurationCount: 3,
      liveMaxLatencyDurationCount: 5,
      // Дополнительные настройки для проблемных потоков
      fragLoadingTimeOut: 20000,
      manifestLoadingTimeOut: 10000,
      levelLoadingTimeOut: 10000,
      // Поддержка различных форматов
      startLevel: -1,
      capLevelToPlayerSize: false,
      // Обработка ошибок
      maxLoadingDelay: 4,
      maxBufferHole: 0.5
    };
    
    CopellaState.hls = new Hls(hlsConfig);
    CopellaState.hls.loadSource(streamUrl);
    CopellaState.hls.attachMedia(CopellaDOM.audioPlayer);
    
    CopellaState.hls.on(Hls.Events.MANIFEST_PARSED, function(){ 
      console.log('HLS manifest parsed successfully');
      CopellaDOM.audioPlayer.play().catch(function(err) {
        console.error('HLS play failed:', err);
        CopellaUI.showToast('Ошибка воспроизведения HLS потока, пробуем нативное воспроизведение', 'warning');
        playNatively(streamUrl);
      }); 
    });
    
    CopellaState.hls.on(Hls.Events.ERROR, function(event, data){ 
      console.error('HLS error:', data);
      if (data.fatal) {
        switch(data.type) {
          case Hls.ErrorTypes.NETWORK_ERROR:
            console.log('Fatal network error encountered, try to recover');
            CopellaState.hls.startLoad();
            break;
          case Hls.ErrorTypes.MEDIA_ERROR:
            console.log('Fatal media error encountered, try to recover');
            CopellaState.hls.recoverMediaError();
            break;
          default:
            console.log('Fatal error, cannot recover');
            CopellaUI.showToast('Критическая ошибка HLS потока, пробуем нативное воспроизведение', 'warning');
            playNatively(streamUrl);
            break;
        }
      }
    });
    
    CopellaState.hls.on(Hls.Events.FRAG_PARSING_METADATA, function(event, data){ 
      try {
        if (data.samples && data.samples.length > 0 && data.samples[0].data) {
          var metadataText = new TextDecoder('utf-8').decode(data.samples[0].data).trim();
          var titleMatch = metadataText.match(/StreamTitle='([^']*)';/);
          if (titleMatch && titleMatch[1]) updateNowPlayingUI(titleMatch[1]);
        }
      } catch(_){}
    });
    
    // Дополнительные обработчики для отладки
    CopellaState.hls.on(Hls.Events.MANIFEST_LOADING, function() {
      console.log('Loading HLS manifest...');
    });
    
    CopellaState.hls.on(Hls.Events.MANIFEST_LOADED, function() {
      console.log('HLS manifest loaded');
    });
  }

  function playIcecastStream(streamUrl) {
    try { 
      CopellaState.hls.destroy(); 
    } catch(e) {}
    CopellaDOM.audioPlayer.crossOrigin = 'anonymous';
    CopellaDOM.audioPlayer.src = streamUrl;
    CopellaDOM.audioPlayer.load();
    CopellaDOM.audioPlayer.play().catch(function(err) {
      console.error('Icecast play failed:', err);
      CopellaUI.showToast('Ошибка воспроизведения потока', 'error');
      CopellaDOM.playerPanel.classList.add('error');
    });
  }

  function playNatively(url) { 
    try { 
      CopellaState.hls.destroy(); 
    } catch(e) {}
    
    // Настройки для нативного воспроизведения
    CopellaDOM.audioPlayer.crossOrigin = 'anonymous';
    CopellaDOM.audioPlayer.preload = 'metadata';
    CopellaDOM.audioPlayer.src = url;
    CopellaDOM.audioPlayer.load();
    
    // Обработчики событий для отладки
    CopellaDOM.audioPlayer.addEventListener('loadstart', function() {
      console.log('Native audio load started');
    });
    
    CopellaDOM.audioPlayer.addEventListener('canplay', function() {
      console.log('Native audio can play');
    });
    
    CopellaDOM.audioPlayer.addEventListener('error', function(e) {
      console.error('Native audio error:', e);
      CopellaUI.showToast('Ошибка воспроизведения потока', 'error');
      CopellaDOM.playerPanel.classList.add('error');
    });
    
    CopellaDOM.audioPlayer.play().catch(function(err) {
      console.error('Native play failed:', err);
      CopellaUI.showToast('Не удалось запустить воспроизведение потока', 'error');
      CopellaDOM.playerPanel.classList.add('error');
    });
  }
  function togglePlayPause() { if (CopellaState.currentStationIndex === -1) return; if (CopellaDOM.audioPlayer.paused) { CopellaDOM.audioPlayer.play().catch(function(err){ console.error('Play failed:', err); CopellaDOM.playerPanel.classList.add('error'); CopellaUI.showToast('Не удалось запустить воспроизведение.', 'error'); }); } else { CopellaDOM.audioPlayer.pause(); } }
  function setVolume(value) { CopellaDOM.audioPlayer.volume = value; CopellaDOM.audioPlayer.muted = (value == 0); updateVolumeUI(); }
  function updatePlayPauseIcon() { var btn = document.getElementById('playPauseButton'); if (btn) btn.innerHTML = CopellaDOM.audioPlayer.paused ? CopellaConfig.ICONS.play : CopellaConfig.ICONS.pause; }
  function updateVolumeUI() { var icon = document.getElementById('volumeIcon'); var slider = document.getElementById('volumeSlider'); if (!icon || !slider) return; if (CopellaDOM.audioPlayer.muted || CopellaDOM.audioPlayer.volume === 0) { icon.innerHTML = CopellaConfig.ICONS.volumeOff; icon.classList.add('text-record'); } else { icon.innerHTML = CopellaConfig.ICONS.volumeOn; icon.classList.remove('text-record'); } slider.value = CopellaDOM.audioPlayer.muted ? 0 : CopellaDOM.audioPlayer.volume; }
  function updateNowPlayingUI(text) { var el = document.getElementById('player-now-playing'); if (el && text) { el.textContent = text; clearTimeout(CopellaState.nowPlayingTimeout); CopellaState.nowPlayingTimeout = setTimeout(function(){ if (el.textContent === text) el.textContent = 'Прямой эфир'; }, 120000); } }
  function updateMediaSession(station, nowPlaying) { if (!nowPlaying) nowPlaying = 'Прямой эфир'; if ('mediaSession' in navigator) { try { navigator.mediaSession.metadata = new MediaMetadata({ title: nowPlaying, artist: station.name, artwork: [{ src: station.icon || (window.CopellaRuntime ? CopellaRuntime.pluginUrl + 'assets/icon-512.png' : ''), sizes: '512x512', type: 'image/png' }] }); navigator.mediaSession.setActionHandler('play', togglePlayPause); navigator.mediaSession.setActionHandler('pause', togglePlayPause); } catch(_){} } }

  return { renderPlayer: renderPlayer, playStation: playStation, togglePlayPause: togglePlayPause, setVolume: setVolume, updatePlayPauseIcon: updatePlayPauseIcon, updateVolumeUI: updateVolumeUI, updateNowPlayingUI: updateNowPlayingUI, chooseBestMimeType: chooseBestMimeType };
})();
