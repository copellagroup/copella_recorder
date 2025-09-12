window.CopellaNowPlaying = (function(){
  var currentTrack = null;
  var updateInterval = null;
  
  function init() {
    // Добавляем элемент для отображения текущей программы
    addNowPlayingElement();
    
    // Отслеживаем изменения аудио только когда станция выбрана
    CopellaDOM.audioPlayer.addEventListener('loadstart', function() {
      // Запускаем отслеживание только если станция выбрана
      if (CopellaState.currentStationIndex !== -1) {
        startTracking();
      }
    });
    
    CopellaDOM.audioPlayer.addEventListener('pause', function() {
      stopTracking();
    });
    
    CopellaDOM.audioPlayer.addEventListener('ended', function() {
      stopTracking();
    });
  }
  
  function addNowPlayingElement() {
    var playerContent = document.getElementById('player-content');
    if (!playerContent) return;
    
    var nowPlayingDiv = document.createElement('div');
    nowPlayingDiv.id = 'now-playing';
    nowPlayingDiv.className = 'now-playing bg-panel-bg rounded-medium p-4 mt-4 w-full max-w-sm';
    nowPlayingDiv.innerHTML = '<div class="text-center"><div class="text-sm text-text-secondary mb-2">Сейчас играет</div><div id="current-track" class="text-text-primary font-bold text-lg">Загрузка...</div><div id="current-artist" class="text-text-secondary text-sm mt-1"></div><div id="stream-info" class="text-text-secondary text-xs mt-2"></div></div>';
    
    // Вставляем после плеера
    playerContent.appendChild(nowPlayingDiv);
  }
  
  function startTracking() {
    if (updateInterval) return;
    
    updateInterval = setInterval(function() {
      updateNowPlaying();
    }, 5000); // Обновляем каждые 5 секунд
  }
  
  function stopTracking() {
    if (updateInterval) {
      clearInterval(updateInterval);
      updateInterval = null;
    }
  }
  
  function updateNowPlaying() {
    var audio = CopellaDOM.audioPlayer;
    if (!audio || audio.paused || CopellaState.currentStationIndex === -1) return;
    
    // Пытаемся получить метаданные из аудио потока
    try {
      // Для некоторых потоков можно получить метаданные
      if (audio.metadata) {
        var track = audio.metadata.title || 'Неизвестная композиция';
        var artist = audio.metadata.artist || '';
        
        updateDisplay(track, artist);
        return;
      }
    } catch (e) {
      // Игнорируем ошибки метаданных
    }
    
    // Если метаданные недоступны, показываем информацию о потоке
    var station = CopellaState.stations[CopellaState.currentStationIndex];
    if (station) {
      updateDisplay(station.name, 'Радиостанция');
      updateStreamInfo(audio);
    }
  }
  
  function updateDisplay(track, artist) {
    var trackElement = document.getElementById('current-track');
    var artistElement = document.getElementById('current-artist');
    
    if (trackElement) {
      trackElement.textContent = track;
    }
    
    if (artistElement) {
      artistElement.textContent = artist;
    }
  }
  
  function updateStreamInfo(audio) {
    var infoElement = document.getElementById('stream-info');
    if (!infoElement) return;
    
    var info = [];
    
    // Получаем информацию о потоке
    if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
      info.push('Длительность: ' + Math.round(audio.duration) + 'с');
    }
    
    if (audio.readyState >= 2) {
      info.push('Статус: Готов');
    } else {
      info.push('Статус: Загрузка');
    }
    
    // Пытаемся получить битрейт (если доступно)
    if (audio.webkitAudioDecodedByteCount !== undefined) {
      var bitrate = Math.round(audio.webkitAudioDecodedByteCount * 8 / 1000);
      info.push('Битрейт: ~' + bitrate + ' kbps');
    }
    
    infoElement.textContent = info.join(' • ');
  }
  
  function getCurrentTrack() {
    return currentTrack;
  }
  
  function setCustomTrack(title, artist) {
    updateDisplay(title, artist);
    currentTrack = { title: title, artist: artist, timestamp: Date.now() };
  }
  
  return {
    init: init,
    getCurrentTrack: getCurrentTrack,
    setCustomTrack: setCustomTrack,
    startTracking: startTracking,
    stopTracking: stopTracking
  };
})();