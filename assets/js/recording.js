window.CopellaRecording = (function(){
  function setRecordingUI() {
    var btn = document.getElementById('recordButton');
    var container = document.getElementById('player-now-playing');
    var playerArt = CopellaDOM.playerPanel.querySelector('.player-art');
    if (btn) btn.classList.add('recording', 'animate-pulse-border', 'border-record');
    if (playerArt) playerArt.classList.add('animate-pulse-record-glow');
    CopellaState.recordingStartTime = Date.now();
    CopellaState.isRecording = true; // Устанавливаем флаг записи для визуализатора
    if (container) container.classList.add('recording-status', 'text-record', 'font-bold');
    updateRecordingTimer();
    CopellaState.recordingInterval = setInterval(updateRecordingTimer, 1000);
  }
  function resetRecordingUI() {
    var btn = document.getElementById('recordButton');
    var container = document.getElementById('player-now-playing');
    var playerArt = CopellaDOM.playerPanel.querySelector('.player-art');
    if (btn) btn.classList.remove('recording', 'animate-pulse-border', 'border-record');
    if (playerArt) playerArt.classList.remove('animate-pulse-record-glow');
    CopellaState.isRecording = false; // Сбрасываем флаг записи для визуализатора
    if (container) {
      container.classList.remove('recording-status', 'text-record', 'font-bold');
      container.textContent = 'Прямой эфир';
    }
    if (CopellaState.recordingInterval) { clearInterval(CopellaState.recordingInterval); CopellaState.recordingInterval = null; }
  }
  function showConversionProgress(show) {
    var container = document.getElementById('conversion-progress-container');
    var nowPlaying = document.getElementById('player-now-playing');
    if (!container || !nowPlaying) return;
    if (show) { container.classList.remove('hidden'); nowPlaying.classList.add('hidden'); }
    else { container.classList.add('hidden'); nowPlaying.classList.remove('hidden'); document.getElementById('conversion-progress-bar').style.width = '0%'; document.getElementById('conversion-status-text').textContent = 'Обработка...'; }
  }
  function updateRecordingTimer() {
    var container = document.getElementById('player-now-playing'); if (!container) return;
    var elapsed = Math.floor((Date.now() - CopellaState.recordingStartTime) / 1000);
    var m = String(Math.floor(elapsed / 60)).padStart(2, '0');
    var s = String(elapsed % 60).padStart(2, '0');
    container.textContent = 'Запись ' + m + ':' + s;
  }
  function toggleRecording() {
    if (CopellaState.currentStationIndex === -1 || CopellaDOM.audioPlayer.paused) { CopellaUI.showToast('Начните воспроизведение для записи.', 'warning'); return; }
    if (CopellaState.mediaRecorder && CopellaState.mediaRecorder.state === 'recording') {
      CopellaState.mediaRecorder.stop();
    } else { startRecording(); }
  }
  function getCaptureStream() {
    // Try native element capture first
    var stream = (CopellaDOM.audioPlayer.captureStream && CopellaDOM.audioPlayer.captureStream()) || (CopellaDOM.audioPlayer.mozCaptureStream && CopellaDOM.audioPlayer.mozCaptureStream());
    if (stream && stream.getAudioTracks && stream.getAudioTracks().length > 0) return stream;
    // Fallback: WebAudio route element into MediaStreamDestination (cross-browser)
    try {
      if (!CopellaState.audioContext || CopellaState.audioContext.state === 'closed') {
        CopellaState.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (!CopellaState.source) CopellaState.source = CopellaState.audioContext.createMediaElementSource(CopellaDOM.audioPlayer);
      var destination = CopellaState.audioContext.createMediaStreamDestination();
      // Keep existing analyser/destination connections intact
      CopellaState.source.connect(destination);
      if (CopellaState.analyser) CopellaState.source.connect(CopellaState.analyser);
      if (CopellaState.audioContext.destination) CopellaState.source.connect(CopellaState.audioContext.destination);
      return destination.stream;
    } catch (e) {
      return null;
    }
  }
  function startRecording() {
    try {
      var stream = getCaptureStream();
      if (!stream || !stream.getAudioTracks || stream.getAudioTracks().length === 0) { CopellaUI.showToast('Не удалось захватить аудиопоток. Станция может быть защищена (CORS).', 'error'); return; }
      var mimeType = CopellaPlayer.chooseBestMimeType();
      var options = mimeType ? { mimeType: mimeType } : undefined;
      CopellaState.audioChunks = [];
      CopellaState.mediaRecorder = new MediaRecorder(stream, options);
      CopellaState.mediaRecorder.ondataavailable = function(e){ if (e.data && e.data.size > 0) CopellaState.audioChunks.push(e.data); };
      CopellaState.mediaRecorder.onstop = function(){ processRecording(); };
      CopellaState.mediaRecorder.start(1000);
      setRecordingUI();
    } catch (e) { CopellaUI.showToast('Не удалось начать запись: ' + e.message, 'error'); }
  }
  function processRecording() {
    if (CopellaState.audioChunks.length === 0) { CopellaUI.showToast('Запись не удалась. Файл пуст.', 'error'); resetRecordingUI(); return; }
    var webmBlob = new Blob(CopellaState.audioChunks, { type: (CopellaState.audioChunks[0] && CopellaState.audioChunks[0].type) || 'audio/webm' });
    var durationInSeconds = Math.round((Date.now() - CopellaState.recordingStartTime) / 1000);
    var station = CopellaState.stations[CopellaState.currentStationIndex];
    resetRecordingUI();
    if (CopellaStorage.getRecordingFormat() === 'webm') {
      var data = { id: Date.now(), stationName: station.name, stationIcon: station.icon, date: new Date().toISOString(), duration: durationInSeconds, blob: webmBlob };
      CopellaDB.saveRecording(data).then(function(){ CopellaState.hasNewRecordings = true; updateNewRecordingBadge(); CopellaUI.showToast('Запись WebM сохранена!', 'success'); });
      return;
    }
    showConversionProgress(true); document.getElementById('conversion-status-text').textContent = 'Декодирование...';
    var audioContext = new (window.AudioContext || window.webkitAudioContext)();
    webmBlob.arrayBuffer().then(function(arrayBuffer){
      audioContext.decodeAudioData(arrayBuffer).then(function(audioBuffer){
        var channelsData = []; var transferable = [];
        for (var i = 0; i < audioBuffer.numberOfChannels; i++) { var channel = audioBuffer.getChannelData(i); channelsData.push(channel); transferable.push(channel.buffer); }
        if (durationInSeconds > 60 * 10) { CopellaUI.showToast('Началась обработка длинной записи. Это может занять несколько минут.', 'info', 5000); }
        if (CopellaState.converterWorker) CopellaState.converterWorker.terminate();
        CopellaState.converterWorker = new Worker((window.CopellaRuntime ? CopellaRuntime.pluginUrl : '') + 'assets/js/workers/mp3-encoder.js');
        CopellaState.converterWorker.onmessage = function(event){ var type = event.data.type, progress = event.data.progress, mp3Blob = event.data.mp3Blob, message = event.data.message; if (type === 'progress') { document.getElementById('conversion-progress-bar').style.width = progress + '%'; document.getElementById('conversion-status-text').textContent = 'Кодирование... ' + progress + '%'; } else if (type === 'complete') { var rec = { id: Date.now(), stationName: station.name, stationIcon: station.icon, date: new Date().toISOString(), duration: durationInSeconds, blob: mp3Blob }; CopellaDB.saveRecording(rec).then(function(){ CopellaState.hasNewRecordings = true; updateNewRecordingBadge(); CopellaUI.showToast('Запись MP3 сохранена!', 'success'); showConversionProgress(false); CopellaState.converterWorker.terminate(); CopellaState.converterWorker = null; }); } else if (type === 'error') { throw new Error(message); } };
        CopellaState.converterWorker.onerror = function(err){ CopellaUI.showToast('Критическая ошибка воркера: ' + err.message, 'error'); };
        CopellaState.converterWorker.postMessage({ channels: channelsData, sampleRate: audioBuffer.sampleRate }, transferable);
      }).catch(function(error){ console.error(error); CopellaUI.showToast('Не удалось декодировать запись: ' + error.message, 'error', 5000); showConversionProgress(false); });
    }).catch(function(error){ CopellaUI.showToast('Ошибка чтения записи: ' + error.message, 'error'); showConversionProgress(false); });
  }
  function updateNewRecordingBadge() { CopellaDOM.newRecordingBadge.classList.toggle('hidden', !CopellaState.hasNewRecordings); }
  function openRecordingsModal() {
    CopellaState.hasNewRecordings = false; updateNewRecordingBadge();
    var content = '<div class="modal-content bg-panel-bg p-5 rounded-large w-full max-w-lg transform scale-95 transition-transform duration-300 flex flex-col">'
      + '<div class="flex justify-between items-center mb-4 flex-shrink-0">'
      + '<h2 class="text-lg font-bold">Мои Записи</h2>'
      + '<button class="close-btn text-2xl text-text-secondary">&times;</button>'
      + '</div>'
      + '<div class="flex-grow overflow-y-auto"><div id="recordingsList"></div></div>'
      + '</div>';
    CopellaUI.openModal(CopellaDOM.recordingsModal, content);
    renderRecordingsList();
    CopellaDOM.recordingsModal.querySelector('.close-btn').onclick = function(){ CopellaUI.closeModal(CopellaDOM.recordingsModal); };
  }
  function renderRecordingsList() {
    var listEl = document.getElementById('recordingsList'); if (!listEl) return;
    CopellaDB.getRecordings().then(function(recordings){
      listEl.innerHTML = '';
      if (!recordings || recordings.length === 0) { listEl.innerHTML = '<p class="text-center text-text-secondary py-8">У вас пока нет записей</p>'; return; }
      recordings.sort(function(a,b){ return b.id - a.id; }).forEach(function(rec){
        var item = document.createElement('div');
        item.className = 'flex items-center gap-3 p-2 rounded-medium mb-2 bg-zinc-800';
        var iconHTML = rec.stationIcon ? '<img src="' + rec.stationIcon + '" class="w-full h-full object-cover">' : CopellaUI.createPlaceholder(rec.stationName, ['text-lg']);
        var date = new Date(rec.date); var minutes = Math.floor(rec.duration / 60); var seconds = rec.duration % 60; var fileExtension = rec.blob.type && rec.blob.type.indexOf('mpeg') > -1 ? 'mp3' : 'webm';
        item.innerHTML = '<div class="w-10 h-10 flex-shrink-0 rounded-small overflow-hidden bg-bg-color">' + iconHTML + '</div>' +
          '<div class="flex-grow overflow-hidden"><p class="font-bold text-sm truncate" title="' + rec.stationName + '">' + rec.stationName + '</p><p class="text-xs text-text-secondary">' + date.toLocaleDateString() + ' • ' + minutes + 'м ' + seconds + 'с • <span class="uppercase font-semibold">' + fileExtension + '</span></p></div>' +
          '<div class="flex-shrink-0 flex gap-1"><button data-id="' + rec.id + '" class="download-rec-btn p-2 rounded-full text-text-secondary hover:bg-white/10 hover:text-accent-green transition-colors" title="Скачать">' + CopellaConfig.ICONS.download + '</button><button data-id="' + rec.id + '" class="delete-rec-btn p-2 rounded-full text-text-secondary hover:bg-white/10 hover:text-record transition-colors" title="Удалить">' + CopellaConfig.ICONS.trash + '</button></div>';
        listEl.appendChild(item);
      });
      Array.prototype.forEach.call(document.querySelectorAll('.download-rec-btn'), function(btn){ btn.onclick = function(e){ downloadRecording(parseInt(e.currentTarget.dataset.id)); }; });
      Array.prototype.forEach.call(document.querySelectorAll('.delete-rec-btn'), function(btn){ var id = parseInt(btn.dataset.id); btn.onclick = function(e){ e.stopPropagation(); btn.innerHTML = CopellaConfig.ICONS.confirm; var original = btn.onclick; btn.onclick = function(ev){ ev.stopPropagation(); deleteRecording(id); }; setTimeout(function(){ btn.innerHTML = CopellaConfig.ICONS.trash; btn.onclick = original; }, 3000); }; });
    });
  }
  function downloadRecording(id) { CopellaDB.getRecording(id).then(function(rec){ if (!rec) return; var ext = rec.blob.type && rec.blob.type.indexOf('mpeg') > -1 ? 'mp3' : 'webm'; var a = document.createElement('a'); a.href = URL.createObjectURL(rec.blob); a.download = 'rec_' + rec.stationName.replace(/\s/g, '_') + '_' + new Date(rec.date).toISOString().slice(0,19).replace(/T|:/g, '-') + '.' + ext; a.click(); URL.revokeObjectURL(a.href); }); }
  function deleteRecording(id) { CopellaDB.deleteRecording(id).then(function(){ renderRecordingsList(); CopellaUI.showToast('Запись удалена.', 'info'); }); }
  return { toggleRecording: toggleRecording, openRecordingsModal: openRecordingsModal };
})();
