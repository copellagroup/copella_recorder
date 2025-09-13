window.CopellaModals = (function(){
  function openStationModal(editIndex) {
    var isEditing = (editIndex !== undefined && editIndex !== null);
    var station = isEditing ? CopellaState.stations[editIndex] : {};
    var modalContent = '<div class="modal-content bg-panel-bg p-6 rounded-large w-full max-w-md transform scale-95 transition-transform duration-300">' +
      '<div class="flex justify-between items-center mb-6"><h2 class="text-xl font-bold">' + (isEditing ? 'Редактировать' : 'Новая станция') + '</h2><button class="close-btn text-2xl text-text-secondary">&times;</button></div>' +
      '<form id="stationForm" data-index="' + (isEditing ? editIndex : 'null') + '" class="flex flex-col gap-4">' +
      '<label for="stationIconFile" class="mx-auto"><div id="icon-upload-area" style="background-image: url(' + (station.icon || '') + ')" class="w-28 h-28 rounded-large border-2 border-dashed border-border-color flex flex-col justify-center items-center text-text-secondary cursor-pointer bg-cover bg-center transition-all">' + (!station.icon ? '<span>Иконка</span>' : '') + '</div></label>' +
      '<input type="file" id="stationIconFile" accept="image/*" class="hidden">' +
      '<input type="text" id="stationName" placeholder="Название" value="' + (station.name || '') + '" required class="w-full p-3 border border-border-color rounded-small text-base bg-bg-color text-text-primary focus:ring-2 focus:ring-accent/50 outline-none">' +
      '<input type="url" id="stationUrl" placeholder="URL потока" value="' + (station.url || '') + '" required class="w-full p-3 border border-border-color rounded-small text-base bg-bg-color text-text-primary focus:ring-2 focus:ring-accent/50 outline-none">' +
      '<button type="submit" class="w-full p-3 text-base font-bold rounded-small border-none bg-accent text-bg-color cursor-pointer mt-2">' + (isEditing ? 'Сохранить' : 'Добавить') + '</button>' +
      '</form></div>';
    CopellaUI.openModal(CopellaDOM.stationModal, modalContent);
    CopellaDOM.stationModal.querySelector('.close-btn').onclick = function(){ CopellaUI.closeModal(CopellaDOM.stationModal); };
    CopellaDOM.stationModal.querySelector('#stationForm').onsubmit = handleFormSubmit;
    CopellaDOM.stationModal.querySelector('#stationIconFile').onchange = function(e){ var file = e.target.files[0], iconArea = CopellaDOM.stationModal.querySelector('#icon-upload-area'); if (file) { var reader = new FileReader(); reader.onload = function(ev){ iconArea.style.backgroundImage = 'url(' + ev.target.result + ')'; iconArea.innerHTML = ''; }; reader.readAsDataURL(file); } };
  }
  function handleFormSubmit(e) {
    e.preventDefault();
    var form = e.target;
    var name = form.querySelector('#stationName').value.trim();
    var url = form.querySelector('#stationUrl').value.trim();
    var file = form.querySelector('#stationIconFile').files[0];
    var editIndex = form.dataset.index !== 'null' ? parseInt(form.dataset.index) : null;
    if (!name || !url) return;
    var processStation = function(iconData){
      var newData = { name: name, url: url, icon: iconData };
      if (editIndex !== null) {
        if (!iconData) newData.icon = CopellaState.stations[editIndex].icon;
        CopellaState.stations[editIndex] = newData;
        if (CopellaState.currentStationIndex === editIndex) { CopellaPlayer.renderPlayer(newData); }
      } else { CopellaState.stations.push({ name: name, url: url, icon: iconData || '' }); }
      CopellaStorage.saveStations();
      CopellaStations.renderList(CopellaDOM.stationSearchInput.value);
      CopellaUI.closeModal(CopellaDOM.stationModal);
      CopellaUI.showToast(editIndex !== null ? 'Станция обновлена' : 'Станция добавлена', 'success');
    };
    if (file) { var reader = new FileReader(); reader.onload = function(ev){ processStation(ev.target.result); }; reader.readAsDataURL(file); }
    else { processStation(editIndex !== null ? (CopellaState.stations[editIndex] ? CopellaState.stations[editIndex].icon : null) : null); }
  }
  function openWelcomeModal() {
    var content = '<div class="modal-content bg-panel-bg p-6 rounded-large w-full max-w-md transform scale-95 transition-transform duration-300">' +
      '<div class="text-center mb-4"><h2 class="text-xl font-bold">Copella Recorder v1.1 - Обновление</h2></div>' +
      '<div class="text-text-secondary space-y-4 text-center">' +
        '<p class="font-semibold text-accent-green">Новые функции в версии 1.1:</p>' +
        '<div class="space-y-3 text-left">' +
          '<div class="flex items-start gap-2"><span class="text-accent-green font-bold">•</span><span><strong>Профессиональные функции</strong> для радио любителей</span></div>' +
          '<div class="flex items-start gap-2"><span class="text-accent-green font-bold">•</span><span><strong>Улучшенная обработка</strong> аудиопотоков</span></div>' +
          '<div class="flex items-start gap-2"><span class="text-accent-green font-bold">•</span><span><strong>Расширенные возможности</strong> записи</span></div>' +
          '<div class="flex items-start gap-2"><span class="text-accent-green font-bold">•</span><span><strong>Оптимизированная работа</strong> с различными форматами</span></div>' +
          '<div class="flex items-start gap-2"><span class="text-accent-green font-bold">•</span><span><strong>Серьёзный интерфейс</strong> без отвлекающих элементов</span></div>' +
        '</div>' +
        '<p class="text-sm mt-4">Добавлено <strong>15 новых функций</strong> для профессиональной работы с радио!</p>' +
      '</div>' +
      '<button id="closeWelcomeBtn" class="w-full p-3 text-base font-bold rounded-small border-none bg-accent text-bg-color cursor-pointer mt-6">Начать работу</button></div>';
    CopellaUI.openModal(CopellaDOM.welcomeModal, content);
    CopellaDOM.welcomeModal.querySelector('#closeWelcomeBtn').onclick = function(){ CopellaUI.closeModal(CopellaDOM.welcomeModal); localStorage.setItem(CopellaConfig.STORAGE_KEYS.welcomeSeen, 'true'); };
  }
  function openSettingsModal() {
    var currentFormat = CopellaStorage.getRecordingFormat();
    var content = '<div class="modal-content bg-panel-bg p-6 rounded-large w-full max-w-md transform scale-95 transition-transform duration-300 flex flex-col">' +
      '<div class="flex justify-between items-center mb-6 flex-shrink-0"><h2 class="text-xl font-bold">Настройки</h2><button class="close-btn text-2xl text-text-secondary">&times;</button></div>' +
      '<div class="space-y-6">' +
      '<div><h3 class="font-bold text-text-primary mb-2">Формат записи</h3><div class="flex flex-col gap-2" id="formatChooser">' +
      '<label class="flex items-center gap-3 p-3 bg-zinc-800 rounded-medium cursor-pointer"><input type="radio" name="format" value="mp3" class="accent-accent-blue" ' + (currentFormat === 'mp3' ? 'checked' : '') + '><span>MP3 (Рекомендуется, универсальный)</span></label>' +
      '<label class="flex items-center gap-3 p-3 bg-zinc-800 rounded-medium cursor-pointer"><input type="radio" name="format" value="webm" class="accent-accent-blue" ' + (currentFormat === 'webm' ? 'checked' : '') + '><span>WebM (Быстро, без конвертации)</span></label>' +
      '</div><p class="text-xs text-text-secondary mt-2">WebM сохраняется мгновенно, но может не поддерживаться на некоторых устройствах.</p></div>' +
      '<div><h3 class="font-bold text-text-primary mb-2">Профессиональные функции</h3><div class="flex flex-col gap-3">' +
      '<button id="technicalInfoBtn" class="p-3 text-base font-bold rounded-small border border-border-color bg-zinc-800 text-text-primary cursor-pointer">Техническая информация</button>' +
      '<button id="exportTechDataBtn" class="p-3 text-base font-bold rounded-small border border-border-color bg-zinc-800 text-text-primary cursor-pointer">Экспорт технических данных</button>' +
      '</div></div>' +
      '<div><h3 class="font-bold text-text-primary mb-2">Управление данными</h3><div class="flex flex-col sm:flex-row gap-3">' +
      '<button id="exportBtn" class="flex-1 p-3 text-base font-bold rounded-small border border-border-color bg-zinc-800 text-text-primary cursor-pointer">Экспорт станций</button>' +
      '<label class="flex-1 p-3 text-base font-bold rounded-small border border-border-color bg-zinc-800 text-text-primary cursor-pointer text-center">Импорт станций <input type="file" id="importFile" accept=".json" class="hidden"></label>' +
      '</div></div>' +
      '<div><h3 class="font-bold text-text-primary mb-2 mt-2">О приложении</h3><div class="space-y-3 text-sm text-text-secondary"><p><strong class="font-semibold text-text-primary">Copella Recorder 1.1</strong> — профессиональное веб-приложение для прослушивания и записи интернет-радио.</p><p class="text-xs text-center pt-4 text-text-secondary/70">© 2025 Copella</p></div></div>' +
      '</div></div>';
    CopellaUI.openModal(CopellaDOM.settingsModal, content);
    CopellaDOM.settingsModal.querySelector('.close-btn').onclick = function(){ CopellaUI.closeModal(CopellaDOM.settingsModal); };
    CopellaDOM.settingsModal.querySelector('#exportBtn').onclick = exportStations;
    CopellaDOM.settingsModal.querySelector('#importFile').onchange = importStations;
    CopellaDOM.settingsModal.querySelector('#formatChooser').onchange = function(e){ CopellaStorage.saveRecordingFormat(e.target.value); CopellaUI.showToast('Формат записи сохранен!', 'success'); };
    CopellaDOM.settingsModal.querySelector('#technicalInfoBtn').onclick = function(){ CopellaUI.closeModal(CopellaDOM.settingsModal); CopellaProfessional.showTechnicalInfo(); };
    CopellaDOM.settingsModal.querySelector('#exportTechDataBtn').onclick = function(){ CopellaProfessional.exportTechnicalData(); };
  }
  function exportStations() {
    if (CopellaState.stations.length === 0) { CopellaUI.showToast('Список станций пуст.', 'warning'); return; }
    var dataStr = JSON.stringify(CopellaState.stations, null, 2);
    var blob = new Blob([dataStr], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = 'copella-stations-' + new Date().toISOString().slice(0, 10) + '.json';
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
    CopellaUI.showToast('Файл экспорта готов!', 'success');
  }
  function importStations(event) {
    var file = event.target.files[0]; if (!file) return;
    var reader = new FileReader();
    reader.onload = function(e){
      try { var imported = JSON.parse(e.target.result); if (!Array.isArray(imported) || !imported.every(function(s){ return s.name && s.url; })) throw new Error('Invalid file format.'); CopellaState.stations = imported; CopellaStorage.saveStations(); CopellaStations.renderList(); CopellaUI.closeModal(CopellaDOM.settingsModal); CopellaUI.showToast('Станции успешно импортированы!', 'success'); }
      catch(err){ CopellaUI.showToast('Ошибка импорта. Неверный формат файла.', 'error'); }
    };
    reader.readAsText(file);
  }
  function closeModal(modalRef) {
    var modal = (typeof modalRef === 'string') ? document.getElementById(modalRef) : modalRef;
    CopellaUI.closeModal(modal);
  }
  return { openStationModal: openStationModal, openWelcomeModal: openWelcomeModal, openSettingsModal: openSettingsModal, closeModal: closeModal };
})();
