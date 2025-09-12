window.CopellaStations = (function(){
  function renderList(filterText) {
    var query = (filterText || '').toLowerCase().trim();
    var stationsToRender = query ? CopellaState.stations.filter(function(s){ return s.name.toLowerCase().includes(query); }) : CopellaState.stations;
    var showEmptyState = CopellaState.stations.length === 0 && !query;
    CopellaDOM.stationListContainer.style.display = showEmptyState ? 'none' : 'block';
    CopellaDOM.stationsHeader.style.display = showEmptyState ? 'none' : 'flex';
    CopellaDOM.emptyStationsView.style.display = showEmptyState ? 'flex' : 'none';
    CopellaDOM.stationListContainer.innerHTML = '';
    if (!showEmptyState && stationsToRender.length === 0) {
      CopellaDOM.stationListMessage.textContent = 'Станции не найдены';
      CopellaDOM.stationListMessage.style.display = 'block';
    } else {
      CopellaDOM.stationListMessage.style.display = 'none';
      stationsToRender.forEach(function(station){
        var index = CopellaState.stations.indexOf(station);
        var item = createListItem(station, index);
        CopellaDOM.stationListContainer.appendChild(item);
      });
    }
  }
  function createListItem(station, index) {
    var item = document.createElement('div');
    item.className = 'station-list-item flex items-center gap-3 p-2 rounded-medium mb-3 bg-panel-bg cursor-pointer transition-all duration-200 hover:bg-zinc-800 ' + (CopellaState.currentStationIndex === index ? 'active bg-zinc-700' : '');
    item.dataset.index = index;
    item.draggable = true;
    var iconHTML = station.icon ? '<img src="' + station.icon + '" class="w-full h-full object-cover">' : CopellaUI.createPlaceholder(station.name, ['text-xl']);
    item.innerHTML = '<span class="drag-handle text-border-color cursor-grab p-3 -ml-2 flex-shrink-0 transition-colors hover:text-text-secondary active:cursor-grabbing">' + CopellaConfig.ICONS.dragHandle + '</span>' +
      '<div class="relative w-14 h-14 flex-shrink-0 rounded-small overflow-hidden bg-bg-color">' + iconHTML + '<div class="playing-indicator hidden absolute bottom-1 right-1 bg-black/60 px-1 rounded-sm backdrop-blur-sm items-end h-3 gap-px"><span class="w-0.5 bg-accent-green animate-bounce"></span><span class="w-0.5 bg-accent-green animate-bounce" style="animation-delay: -1.0s;"></span><span class="w-0.5 bg-accent-green animate-bounce" style="animation-delay: -0.8s;"></span></div></div>' +
      '<div class="flex-grow overflow-hidden"><p class="font-bold text-base truncate" title="' + station.name + '">' + station.name + '</p></div>' +
      '<div class="station-item-actions flex-shrink-0 flex gap-0"><button class="edit-btn p-2 rounded-full text-text-secondary hover:bg-white/10 hover:text-text-primary transition-colors" title="Редактировать">' + CopellaConfig.ICONS.edit + '</button><button class="delete-btn p-2 rounded-full text-text-secondary hover:bg-white/10 hover:text-text-primary transition-colors" title="Удалить">' + CopellaConfig.ICONS.trash + '</button></div>';
    addItemListeners(item, index);
    return item;
  }
  function addItemListeners(item, index) {
    item.onclick = function(e){ if (e.target.closest('.station-item-actions, .drag-handle')) return; CopellaUI.haptic(); CopellaPlayer.playStation(index); };
    var editBtn = item.querySelector('.edit-btn');
    editBtn.onclick = function(e){ e.stopPropagation(); CopellaUI.haptic(); CopellaModals.openStationModal(index); };
    var deleteBtn = item.querySelector('.delete-btn');
    deleteBtn.onclick = function(e){ e.stopPropagation(); CopellaUI.haptic(); deleteBtn.innerHTML = CopellaConfig.ICONS.confirm; deleteBtn.classList.add('text-record'); var original = deleteBtn.onclick; deleteBtn.onclick = function(ev){ ev.stopPropagation(); deleteStation(index); }; setTimeout(function(){ deleteBtn.innerHTML = CopellaConfig.ICONS.trash; deleteBtn.classList.remove('text-record'); deleteBtn.onclick = original; }, 3000); };
    var dragHandle = item.querySelector('.drag-handle');
    item.addEventListener('dragstart', function(e){ if (!dragHandle.contains(e.target)) { e.preventDefault(); return; } CopellaState.draggedItemIndex = index; setTimeout(function(){ item.classList.add('opacity-50'); }, 0); });
    item.addEventListener('dragend', function(){ item.classList.remove('opacity-50'); });
    item.addEventListener('dragover', function(e){ e.preventDefault(); });
    item.addEventListener('drop', function(e){ e.preventDefault(); var droppedOnIndex = index; if (CopellaState.draggedItemIndex === droppedOnIndex) return; var draggedItem = CopellaState.stations.splice(CopellaState.draggedItemIndex, 1)[0]; CopellaState.stations.splice(droppedOnIndex, 0, draggedItem); if (CopellaState.currentStationIndex === CopellaState.draggedItemIndex) CopellaState.currentStationIndex = droppedOnIndex; else if (CopellaState.draggedItemIndex < CopellaState.currentStationIndex && droppedOnIndex >= CopellaState.currentStationIndex) CopellaState.currentStationIndex--; else if (CopellaState.draggedItemIndex > CopellaState.currentStationIndex && droppedOnIndex <= CopellaState.currentStationIndex) CopellaState.currentStationIndex++; CopellaStorage.saveStations(); renderList(CopellaDOM.stationSearchInput.value); });
  }
  function deleteStation(indexToDelete) {
    if (CopellaState.currentStationIndex === indexToDelete) {
      CopellaDOM.audioPlayer.pause();
      CopellaDOM.audioPlayer.src = '';
      CopellaState.currentStationIndex = -1;
      CopellaPlayer.renderPlayer(null);
      if ('mediaSession' in navigator) try { navigator.mediaSession.metadata = null; } catch(_){}
      CopellaStorage.clearLastPlayed();
    } else if (CopellaState.currentStationIndex > indexToDelete) {
      CopellaState.currentStationIndex--;
      CopellaStorage.setLastPlayed(CopellaState.currentStationIndex);
    }
    CopellaState.stations.splice(indexToDelete, 1);
    CopellaStorage.saveStations();
    renderList(CopellaDOM.stationSearchInput.value);
    CopellaUI.showToast('Станция удалена', 'info');
  }
  return { renderList: renderList, deleteStation: deleteStation };
})();
