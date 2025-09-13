window.CopellaExport = (function(){
  function exportToM3U() {
    var playlist = '#EXTM3U\n';
    CopellaState.stations.forEach(function(station) {
      playlist += '#EXTINF:-1,' + station.name + '\n';
      playlist += station.url + '\n';
    });
    
    var blob = new Blob([playlist], { type: 'audio/mpegurl' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'copella-playlist.m3u';
    a.click();
    URL.revokeObjectURL(url);
    
    CopellaUI.showToast('Плейлист экспортирован!', 'success');
  }
  
  function exportToPLS() {
    var playlist = '[playlist]\n';
    CopellaState.stations.forEach(function(station, index) {
      playlist += 'File' + (index + 1) + '=' + station.url + '\n';
      playlist += 'Title' + (index + 1) + '=' + station.name + '\n';
      playlist += 'Length' + (index + 1) + '=-1\n';
    });
    playlist += 'NumberOfEntries=' + CopellaState.stations.length + '\n';
    playlist += 'Version=2\n';
    
    var blob = new Blob([playlist], { type: 'audio/x-scpls' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'copella-playlist.pls';
    a.click();
    URL.revokeObjectURL(url);
    
    CopellaUI.showToast('Плейлист PLS экспортирован!', 'success');
  }
  
  function exportToJSON() {
    var data = {
      name: 'Copella Playlist',
      stations: CopellaState.stations,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
    
    var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'copella-playlist.json';
    a.click();
    URL.revokeObjectURL(url);
    
    CopellaUI.showToast('Плейлист JSON экспортирован!', 'success');
  }
  
  function openExportModal() {
    var modal = document.getElementById('exportModal');
    modal.innerHTML = '<div class="modal-content bg-panel-bg rounded-large p-6 max-w-md w-full mx-4"><div class="flex justify-between items-center mb-6"><h3 class="text-xl font-bold text-text-primary">Экспорт плейлиста</h3><button class="close-modal text-text-secondary hover:text-accent transition-colors"><svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"></path></svg></button></div><div class="space-y-3"><button class="export-m3u w-full bg-accent text-bg-color px-4 py-3 rounded-medium font-bold transition-transform active:scale-95">Экспорт в M3U</button><button class="export-pls w-full bg-accent text-bg-color px-4 py-3 rounded-medium font-bold transition-transform active:scale-95">Экспорт в PLS</button><button class="export-json w-full bg-accent text-bg-color px-4 py-3 rounded-medium font-bold transition-transform active:scale-95">Экспорт в JSON</button></div></div>';
    
    modal.classList.remove('opacity-0', 'pointer-events-none');
    modal.classList.add('opacity-100');
    
    // Обработчики
    modal.querySelector('.close-modal').onclick = function() { CopellaModals.closeModal('exportModal'); };
    modal.querySelector('.export-m3u').onclick = function() { exportToM3U(); CopellaModals.closeModal('exportModal'); };
    modal.querySelector('.export-pls').onclick = function() { exportToPLS(); CopellaModals.closeModal('exportModal'); };
    modal.querySelector('.export-json').onclick = function() { exportToJSON(); CopellaModals.closeModal('exportModal'); };
    
    // Закрытие по клику вне модального окна
    modal.onclick = function(e) { if (e.target === modal) CopellaModals.closeModal('exportModal'); };
  }
  
  return {
    openExportModal: openExportModal,
    exportToM3U: exportToM3U,
    exportToPLS: exportToPLS,
    exportToJSON: exportToJSON
  };
})();