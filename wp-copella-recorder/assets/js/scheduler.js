window.CopellaScheduler = (function(){
  function openSchedulerModal() {
    var stationOptions = CopellaState.stations.map(function(s, i){ return '<option value="' + i + '">' + s.name + '</option>'; }).join('');
    var disabled = CopellaState.stations.length === 0 ? 'disabled' : '';
    var content = '<div class="modal-content bg-panel-bg p-6 rounded-large w-full max-w-lg transform scale-95 transition-transform duration-300 flex flex-col">' +
      '<div class="flex justify-between items-center mb-4 flex-shrink-0"><h2 class="text-xl font-bold">Планировщик записей</h2><button class="close-btn text-2xl text-text-secondary">&times;</button></div>' +
      '<form id="scheduleForm" class="flex flex-col gap-4 flex-shrink-0">' +
      '<select id="scheduleStation" required ' + disabled + ' class="w-full p-3 border border-border-color rounded-small text-base bg-bg-color text-text-primary appearance-none focus:ring-2 focus:ring-accent/50 outline-none">' + (stationOptions || '<option>Нет доступных станций</option>') + '</select>' +
      '<input type="datetime-local" id="scheduleStartTime" required class="w-full p-3 border border-border-color rounded-small text-base bg-bg-color text-text-primary focus:ring-2 focus:ring-accent/50 outline-none" style="color-scheme: dark;">' +
      '<input type="number" id="scheduleDuration" placeholder="Длительность (в минутах)" min="1" required class="w-full p-3 border border-border-color rounded-small text-base bg-bg-color text-text-primary focus:ring-2 focus:ring-accent/50 outline-none">' +
      '<button type="submit" class="w-full p-3 text-base font-bold rounded-small border-none bg-accent text-bg-color cursor-pointer" ' + disabled + '>Добавить</button>' +
      '</form><hr class="my-4 border-border-color flex-shrink-0"><div class="flex-grow overflow-y-auto"><div id="scheduleList"></div></div>' +
      '<p class="text-xs text-text-secondary mt-4 text-center flex-shrink-0"><strong>Важно:</strong> приложение автоматически переключит станцию и начнет запись. Для этого вкладка должна быть открытой.</p></div>';
    CopellaUI.openModal(CopellaDOM.schedulerModal, content);
    renderScheduleList();
    CopellaDOM.schedulerModal.querySelector('.close-btn').onclick = function(){ CopellaUI.closeModal(CopellaDOM.schedulerModal); };
    CopellaDOM.schedulerModal.querySelector('#scheduleForm').onsubmit = handleScheduleSubmit;
  }
  function renderScheduleList() {
    var listEl = document.getElementById('scheduleList'); if (!listEl) return; listEl.innerHTML = '';
    if (CopellaState.scheduledRecordings.length === 0) { listEl.innerHTML = '<p class="text-center text-text-secondary py-8">Нет запланированных записей</p>'; return; }
    CopellaState.scheduledRecordings.forEach(function(schedule){
      var station = CopellaState.stations[schedule.stationIndex]; if (!station) return;
      var startTime = new Date(schedule.startTime);
      var item = document.createElement('div');
      var statusInfo = { 'scheduled': { text: 'Запланировано', color: 'bg-accent-blue' }, 'recording': { text: 'В эфире', color: 'bg-record animate-pulse' }, 'finished': { text: 'Завершено', color: 'bg-accent-green' }, 'missed': { text: 'Пропущено', color: 'bg-warning' }, 'pending': { text: 'Скоро', color: 'bg-accent-blue' } };
      var currentStatus = statusInfo[schedule.status] || { text: 'Неизвестно', color: 'bg-gray-500' };
      item.className = 'flex items-center gap-4 p-2 rounded-medium mb-2 bg-zinc-800';
      var iconHTML = station.icon ? '<img src="' + station.icon + '" class="w-full h-full object-cover">' : CopellaUI.createPlaceholder(station.name, ['text-lg']);
      item.innerHTML = '<div class="w-12 h-12 flex-shrink-0 rounded-small overflow-hidden bg-bg-color">' + iconHTML + '</div>' +
        '<div class="flex-grow overflow-hidden"><p class="font-bold text-base truncate" title="' + station.name + '">' + station.name + '</p>' +
        '<div class="flex items-center gap-2"><span class="w-2 h-2 rounded-full ' + currentStatus.color + '"></span><p class="text-sm text-text-secondary">' + currentStatus.text + ' &bull; ' + startTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) + ' &bull; ' + schedule.duration + ' мин.</p></div></div>' +
        '<button data-id="' + schedule.id + '" class="delete-schedule-btn p-2 rounded-full text-text-secondary hover:bg-white/10 hover:text-record transition-colors" title="Удалить">' + CopellaConfig.ICONS.trash + '</button>';
      listEl.appendChild(item);
    });
    Array.prototype.forEach.call(document.querySelectorAll('.delete-schedule-btn'), function(btn){ btn.onclick = function(e){ deleteSchedule(e.currentTarget.dataset.id); }; });
  }
  function handleScheduleSubmit(e) {
    e.preventDefault();
    var form = e.target;
    var stationIndex = form.querySelector('#scheduleStation').value;
    var startTime = form.querySelector('#scheduleStartTime').value;
    var duration = form.querySelector('#scheduleDuration').value;
    if (!stationIndex || !startTime || !duration || new Date(startTime) < new Date()) { CopellaUI.showToast('Выберите станцию и укажите время в будущем.', 'warning'); return; }
    var newSchedule = { id: Date.now().toString(), stationIndex: parseInt(stationIndex), startTime: new Date(startTime).toISOString(), duration: parseInt(duration), status: 'scheduled' };
    CopellaState.scheduledRecordings.push(newSchedule);
    CopellaState.scheduledRecordings.sort(function(a,b){ return new Date(a.startTime) - new Date(b.startTime); });
    CopellaStorage.saveSchedules();
    renderScheduleList();
    form.reset();
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
