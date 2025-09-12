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
    if (Hls.isSupported() && (streamUrl.indexOf('.m3u8') > -1 || streamUrl.indexOf('.m3u') > -1)) {
      try { CopellaState.hls.destroy(); } catch(e) {}
      CopellaState.hls = new Hls();
      CopellaState.hls.loadSource(streamUrl);
      CopellaState.hls.attachMedia(CopellaDOM.audioPlayer);
      CopellaState.hls.on(Hls.Events.MANIFEST_PARSED, function(){ CopellaDOM.audioPlayer.play().catch(console.error); });
      CopellaState.hls.on(Hls.Events.ERROR, function(event, data){ if (data.fatal) playNatively(streamUrl); });
      CopellaState.hls.on(Hls.Events.FRAG_PARSING_METADATA, function(event, data){ try {
        if (data.samples && data.samples.length > 0 && data.samples[0].data) {
          var metadataText = new TextDecoder('utf-8').decode(data.samples[0].data).trim();
          var titleMatch = metadataText.match(/StreamTitle='([^']*)';/);
          if (titleMatch && titleMatch[1]) updateNowPlayingUI(titleMatch[1]);
        }
      } catch(_){} });
    } else { playNatively(streamUrl); }
    CopellaStorage.setLastPlayed(index);
  }

  function playNatively(url) { try { CopellaState.hls.destroy(); } catch(e) {} CopellaDOM.audioPlayer.src = url; CopellaDOM.audioPlayer.load(); CopellaDOM.audioPlayer.play().catch(console.error); }
  function togglePlayPause() { if (CopellaState.currentStationIndex === -1) return; if (CopellaDOM.audioPlayer.paused) { CopellaDOM.audioPlayer.play().catch(function(err){ console.error('Play failed:', err); CopellaDOM.playerPanel.classList.add('error'); CopellaUI.showToast('Не удалось запустить воспроизведение.', 'error'); }); } else { CopellaDOM.audioPlayer.pause(); } }
  function setVolume(value) { CopellaDOM.audioPlayer.volume = value; CopellaDOM.audioPlayer.muted = (value == 0); updateVolumeUI(); }
  function updatePlayPauseIcon() { var btn = document.getElementById('playPauseButton'); if (btn) btn.innerHTML = CopellaDOM.audioPlayer.paused ? CopellaConfig.ICONS.play : CopellaConfig.ICONS.pause; }
  function updateVolumeUI() { var icon = document.getElementById('volumeIcon'); var slider = document.getElementById('volumeSlider'); if (!icon || !slider) return; if (CopellaDOM.audioPlayer.muted || CopellaDOM.audioPlayer.volume === 0) { icon.innerHTML = CopellaConfig.ICONS.volumeOff; icon.classList.add('text-record'); } else { icon.innerHTML = CopellaConfig.ICONS.volumeOn; icon.classList.remove('text-record'); } slider.value = CopellaDOM.audioPlayer.muted ? 0 : CopellaDOM.audioPlayer.volume; }
  function updateNowPlayingUI(text) { var el = document.getElementById('player-now-playing'); if (el && text) { el.textContent = text; clearTimeout(CopellaState.nowPlayingTimeout); CopellaState.nowPlayingTimeout = setTimeout(function(){ if (el.textContent === text) el.textContent = 'Прямой эфир'; }, 120000); } }
  function updateMediaSession(station, nowPlaying) { if (!nowPlaying) nowPlaying = 'Прямой эфир'; if ('mediaSession' in navigator) { try { navigator.mediaSession.metadata = new MediaMetadata({ title: nowPlaying, artist: station.name, artwork: [{ src: station.icon || (window.CopellaRuntime ? CopellaRuntime.pluginUrl + 'assets/icon-512.png' : ''), sizes: '512x512', type: 'image/png' }] }); navigator.mediaSession.setActionHandler('play', togglePlayPause); navigator.mediaSession.setActionHandler('pause', togglePlayPause); } catch(_){} } }

  return { renderPlayer: renderPlayer, playStation: playStation, togglePlayPause: togglePlayPause, setVolume: setVolume, updatePlayPauseIcon: updatePlayPauseIcon, updateVolumeUI: updateVolumeUI, updateNowPlayingUI: updateNowPlayingUI, chooseBestMimeType: chooseBestMimeType };
})();
