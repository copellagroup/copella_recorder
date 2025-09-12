window.CopellaStreamInfo = (function(){
  function getStreamDetails() {
    var audio = CopellaDOM.audioPlayer;
    var station = CopellaState.stations[CopellaState.currentStationIndex];
    
    if (!audio || !station) return null;
    
    var details = {
      stationName: station.name,
      streamUrl: station.url,
      currentTime: audio.currentTime,
      duration: audio.duration,
      readyState: audio.readyState,
      networkState: audio.networkState,
      volume: audio.volume,
      playbackRate: audio.playbackRate,
      paused: audio.paused,
      muted: audio.muted,
      timestamp: new Date().toISOString()
    };
    
    // Дополнительная информация о потоке
    if (station.url.includes('m3u8')) {
      details.streamType = 'HLS';
    } else if (station.url.includes('mp3')) {
      details.streamType = 'MP3';
    } else if (station.url.includes('aac')) {
      details.streamType = 'AAC';
    } else {
      details.streamType = 'Unknown';
    }
    
    return details;
  }
  
  function formatReadyState(state) {
    var states = {
      0: 'HAVE_NOTHING',
      1: 'HAVE_METADATA', 
      2: 'HAVE_CURRENT_DATA',
      3: 'HAVE_FUTURE_DATA',
      4: 'HAVE_ENOUGH_DATA'
    };
    return states[state] || 'Unknown';
  }
  
  function formatNetworkState(state) {
    var states = {
      0: 'NETWORK_EMPTY',
      1: 'NETWORK_IDLE',
      2: 'NETWORK_LOADING',
      3: 'NETWORK_NO_SOURCE'
    };
    return states[state] || 'Unknown';
  }
  
  function openStreamInfoModal() {
    var details = getStreamDetails();
    if (!details) {
      CopellaUI.showToast('Нет активного потока', 'warning');
      return;
    }
    
    var modal = document.getElementById('settingsModal'); // Переиспользуем модал
    
    var infoHTML = '<div class="space-y-3">';
    infoHTML += '<div class="grid grid-cols-2 gap-2"><div class="bg-bg-color p-2 rounded-small"><div class="text-xs text-text-secondary">Станция</div><div class="text-sm text-text-primary font-bold">' + details.stationName + '</div></div>';
    infoHTML += '<div class="bg-bg-color p-2 rounded-small"><div class="text-xs text-text-secondary">Тип потока</div><div class="text-sm text-text-primary">' + details.streamType + '</div></div></div>';
    
    infoHTML += '<div class="grid grid-cols-2 gap-2"><div class="bg-bg-color p-2 rounded-small"><div class="text-xs text-text-secondary">Статус готовности</div><div class="text-sm text-text-primary">' + formatReadyState(details.readyState) + '</div></div>';
    infoHTML += '<div class="bg-bg-color p-2 rounded-small"><div class="text-xs text-text-secondary">Статус сети</div><div class="text-sm text-text-primary">' + formatNetworkState(details.networkState) + '</div></div></div>';
    
    infoHTML += '<div class="grid grid-cols-2 gap-2"><div class="bg-bg-color p-2 rounded-small"><div class="text-xs text-text-secondary">Громкость</div><div class="text-sm text-text-primary">' + Math.round(details.volume * 100) + '%</div></div>';
    infoHTML += '<div class="bg-bg-color p-2 rounded-small"><div class="text-xs text-text-secondary">Скорость</div><div class="text-sm text-text-primary">' + details.playbackRate + 'x</div></div></div>';
    
    if (details.duration && !isNaN(details.duration) && isFinite(details.duration)) {
      infoHTML += '<div class="bg-bg-color p-2 rounded-small"><div class="text-xs text-text-secondary">Длительность</div><div class="text-sm text-text-primary">' + Math.round(details.duration) + ' секунд</div></div>';
    }
    
    infoHTML += '<div class="bg-bg-color p-2 rounded-small"><div class="text-xs text-text-secondary">URL потока</div><div class="text-xs text-text-primary break-all">' + details.streamUrl + '</div></div>';
    infoHTML += '<div class="bg-bg-color p-2 rounded-small"><div class="text-xs text-text-secondary">Время обновления</div><div class="text-xs text-text-primary">' + new Date(details.timestamp).toLocaleString() + '</div></div>';
    infoHTML += '</div>';
    
    modal.innerHTML = '<div class="modal-content bg-panel-bg rounded-large p-6 max-w-lg w-full mx-4"><div class="flex justify-between items-center mb-6"><h3 class="text-xl font-bold text-text-primary">Информация о потоке</h3><button class="close-modal text-text-secondary hover:text-accent transition-colors"><svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"></path></svg></button></div>' + infoHTML + '</div>';
    
    modal.classList.remove('opacity-0', 'pointer-events-none');
    modal.classList.add('opacity-100');
    
    // Обработчики
    modal.querySelector('.close-modal').onclick = function() { CopellaModals.closeModal('settingsModal'); };
    
    // Закрытие по клику вне модального окна
    modal.onclick = function(e) { if (e.target === modal) CopellaModals.closeModal('settingsModal'); };
  }
  
  return {
    getStreamDetails: getStreamDetails,
    openStreamInfoModal: openStreamInfoModal
  };
})();