window.CopellaScheduler = (function(){
  function openSchedulerModal() {
    var stationOptions = CopellaState.stations.map(function(s, i){ return '<option value="' + i + '">' + s.name + '</option>'; }).join('');
    var disabled = CopellaState.stations.length === 0 ? 'disabled' : '';
    var content = '<div class="modal-content bg-panel-bg p-4 rounded-large w-full max-w-md transform scale-95 transition-transform duration-300 flex flex-col">' +
      '<div class="flex justify-between items-center mb-3 flex-shrink-0"><h2 class="text-lg font-bold">Планировщик</h2><button class="close-btn text-xl text-text-secondary hover:text-accent transition-colors">&times;</button></div>' +
      '<form id="scheduleForm" class="flex flex-col gap-2 flex-shrink-0 mb-3">' +
      '<div class="grid grid-cols-2 gap-2">' +
      '<select id="scheduleStation" required ' + disabled + ' class="p-2 border border-border-color rounded-small text-sm bg-bg-color text-text-primary appearance-none focus:ring-2 focus:ring-accent/50 outline-none">' + (stationOptions || '<option>Нет станций</option>') + '</select>' +
      '<input type="number" id="scheduleDuration" placeholder="Минуты" min="1" max="180" required class="p-2 border border-border-color rounded-small text-sm bg-bg-color text-text-primary focus:ring-2 focus:ring-accent/50 outline-none">' +
      '</div>' +
      '<div class="grid grid-cols-2 gap-2">' +
      '<input type="date" id="scheduleDate" required class="p-2 border border-border-color rounded-small text-sm bg-bg-color text-text-primary focus:ring-2 focus:ring-accent/50 outline-none" style="color-scheme: dark;">' +
      '<input type="time" id="scheduleTime" required class="p-2 border border-border-color rounded-small text-sm bg-bg-color text-text-primary focus:ring-2 focus:ring-accent/50 outline-none" style="color-scheme: dark;">' +
      '</div>' +
      '<button type="submit" class="w-full p-2 text-sm font-bold rounded-small border-none bg-accent text-bg-color cursor-pointer hover:bg-accent/90 transition-colors" ' + disabled + '>Добавить запись</button>' +
      '</form><div class="flex-grow overflow-y-auto"><div id="scheduleList"></div></div>' +
      '<p class="text-xs text-text-secondary mt-2 text-center flex-shrink-0">Вкладка должна быть открытой для автоматической записи</p></div>';
    CopellaUI.openModal(CopellaDOM.schedulerModal, content);
    renderScheduleList();
    CopellaDOM.schedulerModal.querySelector('.close-btn').onclick = function(){ CopellaUI.closeModal(CopellaDOM.schedulerModal); };
    CopellaDOM.schedulerModal.querySelector('#scheduleForm').onsubmit = handleScheduleSubmit;
    
    // Устанавливаем минимальную дату на сегодня
    var today = new Date().toISOString().split('T')[0];
    document.getElementById('scheduleDate').min = today;
  }
  function renderScheduleList() {
    var listEl = document.getElementById('scheduleList'); if (!listEl) return; listEl.innerHTML = '';
    if (CopellaState.scheduledRecordings.length === 0) { listEl.innerHTML = '<p class="text-center text-text-secondary py-6 text-sm">Нет запланированных записей</p>'; return; }
    CopellaState.scheduledRecordings.forEach(function(schedule){
      var station = CopellaState.stations[schedule.stationIndex]; if (!station) return;
      var startTime = new Date(schedule.startTime);
      var item = document.createElement('div');
      var statusInfo = { 'scheduled': { text: 'Запланировано', color: 'bg-accent-blue', icon: '⏰' }, 'recording': { text: 'В эфире', color: 'bg-record animate-pulse', icon: '🔴' }, 'finished': { text: 'Завершено', color: 'bg-accent-green', icon: '✅' }, 'missed': { text: 'Пропущено', color: 'bg-warning', icon: '❌' }, 'pending': { text: 'Скоро', color: 'bg-accent-blue', icon: '⏳' } };
      var currentStatus = statusInfo[schedule.status] || { text: 'Неизвестно', color: 'bg-gray-500', icon: '❓' };
      item.className = 'flex items-center gap-2 p-2 rounded-medium mb-1 bg-zinc-800 hover:bg-zinc-700 transition-colors';
      var iconHTML = station.icon ? '<img src="' + station.icon + '" class="w-full h-full object-cover">' : CopellaUI.createPlaceholder(station.name, ['text-sm']);
      item.innerHTML = '<div class="w-8 h-8 flex-shrink-0 rounded-small overflow-hidden bg-bg-color">' + iconHTML + '</div>' +
        '<div class="flex-grow overflow-hidden min-w-0">' +
        '<p class="font-bold text-xs truncate" title="' + station.name + '">' + station.name + '</p>' +
        '<div class="flex items-center gap-1 text-xs text-text-secondary">' +
        '<span>' + currentStatus.icon + '</span>' +
        '<span>' + startTime.toLocaleDateString() + ' ' + startTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) + '</span>' +
        '<span>•</span>' +
        '<span>' + schedule.duration + ' мин</span>' +
        '</div></div>' +
        '<button data-id="' + schedule.id + '" class="delete-schedule-btn p-1 rounded-full text-text-secondary hover:bg-white/10 hover:text-record transition-colors text-sm" title="Удалить">' + CopellaConfig.ICONS.trash + '</button>';
      listEl.appendChild(item);
    });
    Array.prototype.forEach.call(document.querySelectorAll('.delete-schedule-btn'), function(btn){ btn.onclick = function(e){ deleteSchedule(e.currentTarget.dataset.id); }; });
  }
  function handleScheduleSubmit(e) {
    e.preventDefault();
    var form = e.target;
    var stationIndex = form.querySelector('#scheduleStation').value;
    var date = form.querySelector('#scheduleDate').value;
    var time = form.querySelector('#scheduleTime').value;
    var duration = form.querySelector('#scheduleDuration').value;
    
    if (!stationIndex || !date || !time || !duration) { 
      CopellaUI.showToast('Заполните все поля', 'warning'); 
      return; 
    }
    
    var startTime = new Date(date + 'T' + time);
    if (startTime < new Date()) { 
      CopellaUI.showToast('Выберите время в будущем', 'warning'); 
      return; 
    }
    
    var newSchedule = { 
      id: Date.now().toString(), 
      stationIndex: parseInt(stationIndex), 
      startTime: startTime.toISOString(), 
      duration: parseInt(duration), 
      status: 'scheduled' 
    };
    
    CopellaState.scheduledRecordings.push(newSchedule);
    CopellaState.scheduledRecordings.sort(function(a,b){ return new Date(a.startTime) - new Date(b.startTime); });
    CopellaStorage.saveSchedules();
    renderScheduleList();
    form.reset();
    CopellaUI.showToast('Запись запланирована', 'success');
  }
  function deleteSchedule(id) { CopellaState.scheduledRecordings = CopellaState.scheduledRecordings.filter(function(s){ return s.id !== id; }); CopellaStorage.saveSchedules(); renderScheduleList(); }
  function checkSchedules() {
    if ((CopellaState.mediaRecorder && CopellaState.mediaRecorder.state === 'recording') || CopellaState.pendingScheduledRecording) return;
    var now = new Date(); var needsRender = false;
    var due = CopellaState.scheduledRecordings.find(function(s){ return s.status === 'scheduled' && new Date(s.startTime) <= now; });
    if (due) {
      if (CopellaState.currentStationIndex === due.stationIndex && !CopellaDOM.audioPlayer.paused) {
        CopellaUI.showToast('Начинается запись по расписанию: ' + CopellaState.stations[due.stationIndex].name, 'info');
        CopellaState.pendingScheduledRecording = due; due.status = 'pending'; CopellaDOM.audioPlayer.dispatchEvent(new Event('play'));
      } else {
        CopellaState.scheduledRecordings.forEach(function(s){ if (s.status === 'scheduled' && new Date(s.startTime) <= now) { s.status = 'missed'; } });
        due.status = 'pending'; CopellaUI.showToast('Переключаю станцию для записи по расписанию...', 'info'); CopellaState.pendingScheduledRecording = due; CopellaPlayer.playStation(due.stationIndex);
      }
      needsRender = true;
    }
    CopellaState.scheduledRecordings.forEach(function(schedule){ if (schedule.status === 'scheduled' && (now - new Date(schedule.startTime)) > 5 * 60 * 1000) { schedule.status = 'missed'; needsRender = true; } });
    if (needsRender) { CopellaStorage.saveSchedules(); if (!CopellaDOM.schedulerModal.classList.contains('opacity-0')) renderScheduleList(); }
  }
  return { openSchedulerModal: openSchedulerModal, renderScheduleList: renderScheduleList, checkSchedules: checkSchedules };
})();
