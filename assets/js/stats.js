window.CopellaStats = (function(){
  var stats = {
    totalListeningTime: 0,
    stationsPlayed: {},
    recordingsCount: 0,
    favoriteGenres: {},
    lastPlayed: null
  };
  
  function init() {
    // Загружаем статистику из localStorage
    var savedStats = localStorage.getItem('copella-stats');
    if (savedStats) {
      try {
        stats = Object.assign(stats, JSON.parse(savedStats));
      } catch (e) {
        console.warn('Failed to load stats:', e);
      }
    }
    
    // Отслеживаем время прослушивания
    var lastStartTime = null;
    var interval = setInterval(function() {
      if (CopellaState.currentStationIndex !== -1 && !CopellaDOM.audioPlayer.paused) {
        if (!lastStartTime) lastStartTime = Date.now();
        stats.totalListeningTime += 1; // +1 секунда
        
        // Обновляем статистику по станциям
        var station = CopellaState.stations[CopellaState.currentStationIndex];
        if (station) {
          if (!stats.stationsPlayed[station.name]) {
            stats.stationsPlayed[station.name] = { time: 0, plays: 0 };
          }
          stats.stationsPlayed[station.name].time += 1;
        }
        
        saveStats();
      } else {
        lastStartTime = null;
      }
    }, 1000);
    
    // Отслеживаем количество записей
    var originalSaveRecording = CopellaDB.saveRecording;
    if (originalSaveRecording) {
      CopellaDB.saveRecording = function(data) {
        stats.recordingsCount++;
        saveStats();
        return originalSaveRecording.call(this, data);
      };
    }
  }
  
  function saveStats() {
    localStorage.setItem('copella-stats', JSON.stringify(stats));
  }
  
  function formatTime(seconds) {
    var hours = Math.floor(seconds / 3600);
    var minutes = Math.floor((seconds % 3600) / 60);
    var secs = seconds % 60;
    
    if (hours > 0) {
      return hours + 'ч ' + minutes + 'м ' + secs + 'с';
    } else if (minutes > 0) {
      return minutes + 'м ' + secs + 'с';
    } else {
      return secs + 'с';
    }
  }
  
  function getTopStations() {
    return Object.entries(stats.stationsPlayed)
      .sort(function(a, b) { return b[1].time - a[1].time; })
      .slice(0, 5);
  }
  
  function openStatsModal() {
    var topStations = getTopStations();
    var modal = document.getElementById('statsModal');
    
    var topStationsHTML = '';
    if (topStations.length > 0) {
      topStationsHTML = '<div class="mt-4"><h4 class="text-lg font-bold text-text-primary mb-3">Топ станций</h4><div class="space-y-2">';
      topStations.forEach(function(entry, index) {
        var station = entry[0];
        var data = entry[1];
        topStationsHTML += '<div class="flex justify-between items-center p-2 bg-bg-color rounded-small"><span class="text-text-primary">' + (index + 1) + '. ' + station + '</span><span class="text-text-secondary text-sm">' + formatTime(data.time) + '</span></div>';
      });
      topStationsHTML += '</div></div>';
    }
    
    modal.innerHTML = '<div class="modal-content bg-panel-bg rounded-large p-6 max-w-lg w-full mx-4"><div class="flex justify-between items-center mb-6"><h3 class="text-xl font-bold text-text-primary">Статистика прослушивания</h3><button class="close-modal text-text-secondary hover:text-accent transition-colors"><svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"></path></svg></button></div><div class="space-y-4"><div class="grid grid-cols-2 gap-4"><div class="bg-bg-color p-4 rounded-medium text-center"><div class="text-2xl font-bold text-accent">' + formatTime(stats.totalListeningTime) + '</div><div class="text-text-secondary text-sm">Общее время</div></div><div class="bg-bg-color p-4 rounded-medium text-center"><div class="text-2xl font-bold text-accent">' + stats.recordingsCount + '</div><div class="text-text-secondary text-sm">Записей</div></div></div>' + topStationsHTML + '</div></div>';
    
    modal.classList.remove('opacity-0', 'pointer-events-none');
    modal.classList.add('opacity-100');
    
    // Обработчики
    modal.querySelector('.close-modal').onclick = function() { CopellaModals.closeModal('statsModal'); };
    
    // Закрытие по клику вне модального окна
    modal.onclick = function(e) { if (e.target === modal) CopellaModals.closeModal('statsModal'); };
  }
  
  function resetStats() {
    stats = {
      totalListeningTime: 0,
      stationsPlayed: {},
      recordingsCount: 0,
      favoriteGenres: {},
      lastPlayed: null
    };
    saveStats();
    CopellaUI.showToast('Статистика сброшена', 'success');
  }
  
  return {
    init: init,
    openStatsModal: openStatsModal,
    resetStats: resetStats,
    getStats: function() { return stats; }
  };
})();