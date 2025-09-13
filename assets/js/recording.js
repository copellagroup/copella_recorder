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
    var audioBlob = new Blob(CopellaState.audioChunks, { type: (CopellaState.audioChunks[0] && CopellaState.audioChunks[0].type) || 'audio/webm' });
    var durationInSeconds = Math.round((Date.now() - CopellaState.recordingStartTime) / 1000);
    var station = CopellaState.stations[CopellaState.currentStationIndex];
    resetRecordingUI();
    
    // Если формат WebM или браузер не поддерживает декодирование, сохраняем как есть
    if (CopellaStorage.getRecordingFormat() === 'webm' || !canDecodeAudio()) {
      var data = { id: Date.now(), stationName: station.name, stationIcon: station.icon, date: new Date().toISOString(), duration: durationInSeconds, blob: audioBlob };
      CopellaDB.saveRecording(data).then(function(){ 
        CopellaState.hasNewRecordings = true; 
        updateNewRecordingBadge(); 
        var format = CopellaStorage.getRecordingFormat() === 'webm' ? 'WebM' : 'WebM (MP3 недоступен)';
        CopellaUI.showToast('Запись ' + format + ' сохранена!', 'success'); 
      });
      return;
    }
    
    // Попытка конвертации в MP3
    showConversionProgress(true); 
    document.getElementById('conversion-status-text').textContent = 'Декодирование...';
    
    try {
      var audioContext = new (window.AudioContext || window.webkitAudioContext)();
      audioBlob.arrayBuffer().then(function(arrayBuffer){
        audioContext.decodeAudioData(arrayBuffer).then(function(audioBuffer){
          var channelsData = []; var transferable = [];
          for (var i = 0; i < audioBuffer.numberOfChannels; i++) { 
            var channel = audioBuffer.getChannelData(i); 
            channelsData.push(channel); 
            transferable.push(channel.buffer); 
          }
          if (durationInSeconds > 60 * 10) { 
            CopellaUI.showToast('Началась обработка длинной записи. Это может занять несколько минут.', 'info', 5000); 
          }
          if (CopellaState.converterWorker) CopellaState.converterWorker.terminate();
          try {
            CopellaState.converterWorker = new Worker((window.CopellaRuntime ? CopellaRuntime.pluginUrl : '') + 'assets/js/mp3-encoder.js');
          } catch (error) {
            console.error('Failed to create worker:', error);
            CopellaUI.showToast('Не удалось создать воркер конвертации. Сохраняем в формате WebM.', 'warning', 5000);
            showConversionProgress(false);
            // Fallback: сохраняем как WebM
            var data = { id: Date.now(), stationName: station.name, stationIcon: station.icon, date: new Date().toISOString(), duration: durationInSeconds, blob: audioBlob };
            CopellaDB.saveRecording(data).then(function(){
              CopellaState.hasNewRecordings = true;
              updateNewRecordingBadge();
              CopellaUI.showToast('Запись WebM сохранена!', 'success');
            });
            return;
          }
          CopellaState.converterWorker.onmessage = function(event){ 
            var type = event.data.type, progress = event.data.progress, mp3Blob = event.data.mp3Blob, message = event.data.message; 
            if (type === 'progress') { 
              document.getElementById('conversion-progress-bar').style.width = progress + '%'; 
              document.getElementById('conversion-status-text').textContent = 'Кодирование... ' + progress + '%'; 
            } else if (type === 'complete') { 
              var rec = { id: Date.now(), stationName: station.name, stationIcon: station.icon, date: new Date().toISOString(), duration: durationInSeconds, blob: mp3Blob }; 
              CopellaDB.saveRecording(rec).then(function(){ 
                CopellaState.hasNewRecordings = true; 
                updateNewRecordingBadge(); 
                CopellaUI.showToast('Запись MP3 сохранена!', 'success'); 
                showConversionProgress(false); 
                CopellaState.converterWorker.terminate(); 
                CopellaState.converterWorker = null; 
              }); 
            } else if (type === 'error') { 
              throw new Error(message); 
            } 
          };
          CopellaState.converterWorker.onerror = function(err){ 
            console.error('Worker error:', err);
            var errorMessage = 'Ошибка воркера конвертации';
            if (err.message) {
              errorMessage += ': ' + err.message;
            } else if (err.filename) {
              errorMessage += ' в файле: ' + err.filename;
            } else {
              errorMessage += ': Неизвестная ошибка';
            }
            CopellaUI.showToast(errorMessage, 'error'); 
            showConversionProgress(false);
            if (CopellaState.converterWorker) {
              CopellaState.converterWorker.terminate();
              CopellaState.converterWorker = null;
            }
          };
          CopellaState.converterWorker.postMessage({ channels: channelsData, sampleRate: audioBuffer.sampleRate }, transferable);
        }).catch(function(error){ 
          console.error('Decode error:', error); 
          CopellaUI.showToast('Не удалось декодировать запись. Сохраняем в формате WebM.', 'warning', 5000); 
          showConversionProgress(false);
          // Fallback: сохраняем как WebM
          var data = { id: Date.now(), stationName: station.name, stationIcon: station.icon, date: new Date().toISOString(), duration: durationInSeconds, blob: audioBlob };
          CopellaDB.saveRecording(data).then(function(){ 
            CopellaState.hasNewRecordings = true; 
            updateNewRecordingBadge(); 
            CopellaUI.showToast('Запись WebM сохранена!', 'success'); 
          });
        });
      }).catch(function(error){ 
        console.error('ArrayBuffer error:', error); 
        CopellaUI.showToast('Ошибка чтения записи: ' + error.message, 'error'); 
        showConversionProgress(false); 
      });
    } catch (error) {
      console.error('AudioContext error:', error);
      CopellaUI.showToast('Ошибка создания аудиоконтекста. Сохраняем в формате WebM.', 'warning', 5000);
      showConversionProgress(false);
      // Fallback: сохраняем как WebM
      var data = { id: Date.now(), stationName: station.name, stationIcon: station.icon, date: new Date().toISOString(), duration: durationInSeconds, blob: audioBlob };
      CopellaDB.saveRecording(data).then(function(){ 
        CopellaState.hasNewRecordings = true; 
        updateNewRecordingBadge(); 
        CopellaUI.showToast('Запись WebM сохранена!', 'success'); 
      });
    }
  }
  
  function canDecodeAudio() {
    try {
      var audioContext = new (window.AudioContext || window.webkitAudioContext)();
      return audioContext && typeof audioContext.decodeAudioData === 'function';
    } catch (e) {
      return false;
    }
  }
  function updateNewRecordingBadge() { CopellaDOM.newRecordingBadge.classList.toggle('hidden', !CopellaState.hasNewRecordings); }
  function openRecordingsModal() {
    CopellaState.hasNewRecordings = false; updateNewRecordingBadge();
    var content = '<div class="modal-content bg-panel-bg p-3 sm:p-5 rounded-large w-full max-w-2xl transform scale-95 transition-transform duration-300 flex flex-col">'
      + '<div class="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 flex-shrink-0 gap-3">'
      + '<h2 class="text-lg font-bold text-center sm:text-left">Мои Записи</h2>'
      + '<div class="flex flex-col sm:flex-row gap-2">'
      + '<div class="flex gap-2 justify-center sm:justify-end">'
      + '<button id="createPlaylistBtn" class="px-3 py-2 text-xs sm:text-sm font-bold rounded-small border border-border-color bg-accent-purple text-white cursor-pointer flex-shrink-0">Плейлист</button>'
      + '<button id="exportBtn" class="px-3 py-2 text-xs sm:text-sm font-bold rounded-small border border-border-color bg-accent-green text-white cursor-pointer flex-shrink-0">Экспорт</button>'
      + '</div>'
      + '<div class="flex gap-2 justify-center sm:justify-end">'
      + '<button id="selectAllBtn" class="px-3 py-2 text-xs sm:text-sm font-bold rounded-small border border-border-color bg-zinc-800 text-text-primary cursor-pointer flex-shrink-0">Выбрать все</button>'
      + '<button id="batchDeleteBtn" class="px-3 py-2 text-xs sm:text-sm font-bold rounded-small border border-border-color bg-record text-white cursor-pointer hidden flex-shrink-0">Удалить</button>'
      + '<button class="close-btn text-xl sm:text-2xl text-text-secondary px-2">&times;</button>'
      + '</div>'
      + '</div>'
      + '</div>'
      + '<div class="flex-grow overflow-y-auto"><div id="recordingsList"></div></div>'
      + '<div id="recordingPlayer" class="hidden mt-4 p-3 sm:p-4 bg-zinc-800 rounded-medium flex-shrink-0">'
      + '<div class="flex items-center gap-3 sm:gap-4 mb-3">'
      + '<div id="recordingArt" class="w-10 h-10 sm:w-12 sm:h-12 rounded-small bg-bg-color overflow-hidden flex-shrink-0"></div>'
      + '<div class="flex-grow min-w-0">'
      + '<div id="recordingTitle" class="font-bold text-xs sm:text-sm truncate"></div>'
      + '<div id="recordingInfo" class="text-xs text-text-secondary truncate"></div>'
      + '</div>'
      + '</div>'
      + '<div class="flex items-center gap-2 sm:gap-3">'
      + '<button id="recordingPlayBtn" class="w-8 h-8 sm:w-10 sm:h-10 bg-accent text-bg-color rounded-full flex justify-center items-center flex-shrink-0">'
      + '<svg class="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"></path></svg>'
      + '</button>'
      + '<div class="flex-grow min-w-0">'
      + '<div class="w-full bg-border-color rounded-full h-1 mb-1">'
      + '<div id="recordingProgress" class="bg-accent h-1 rounded-full transition-all duration-300" style="width: 0%"></div>'
      + '</div>'
      + '<div class="flex justify-between text-xs text-text-secondary">'
      + '<span id="recordingCurrentTime">0:00</span>'
      + '<span id="recordingDuration">0:00</span>'
      + '</div>'
      + '</div>'
      + '<button id="recordingVolumeBtn" class="w-8 h-8 sm:w-10 sm:h-10 bg-white/10 border border-border-color rounded-full flex justify-center items-center flex-shrink-0">'
      + '<svg class="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"></path></svg>'
      + '</button>'
      + '</div>'
      + '</div>'
      + '</div>';
    CopellaUI.openModal(CopellaDOM.recordingsModal, content);
    renderRecordingsList();
    setupRecordingPlayer();
    setupBatchOperations();
    
    // Обработчики для новых функций
    CopellaDOM.recordingsModal.querySelector('#createPlaylistBtn').onclick = function() {
      createPlaylistFromRecordings();
    };
    
    CopellaDOM.recordingsModal.querySelector('#exportBtn').onclick = function() {
      var exportMenu = '<div class="absolute top-full right-0 mt-2 bg-zinc-800 border border-border-color rounded-small shadow-lg z-50">' +
        '<button class="w-full p-2 text-sm text-left hover:bg-zinc-700" onclick="CopellaRecording.exportRecordings(\'json\')">JSON</button>' +
        '<button class="w-full p-2 text-sm text-left hover:bg-zinc-700" onclick="CopellaRecording.exportRecordings(\'csv\')">CSV</button>' +
        '<button class="w-full p-2 text-sm text-left hover:bg-zinc-700" onclick="CopellaRecording.exportRecordings(\'txt\')">TXT</button>' +
        '</div>';
      
      var btn = CopellaDOM.recordingsModal.querySelector('#exportBtn');
      btn.style.position = 'relative';
      btn.innerHTML = 'Экспорт' + exportMenu;
    };
    
    CopellaDOM.recordingsModal.querySelector('.close-btn').onclick = function(){ 
      stopRecordingPlayback();
      CopellaUI.closeModal(CopellaDOM.recordingsModal); 
    };
  }
  function renderRecordingsList() {
    var listEl = document.getElementById('recordingsList'); if (!listEl) return;
    CopellaDB.getRecordings().then(function(recordings){
      listEl.innerHTML = '';
      if (!recordings || recordings.length === 0) { listEl.innerHTML = '<p class="text-center text-text-secondary py-8">У вас пока нет записей</p>'; return; }
      recordings.sort(function(a,b){ return b.id - a.id; }).forEach(function(rec){
        var item = document.createElement('div');
        item.className = 'flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-medium mb-2 bg-zinc-800';
        var iconHTML = rec.stationIcon ? '<img src="' + rec.stationIcon + '" class="w-full h-full object-cover">' : CopellaUI.createPlaceholder(rec.stationName, ['text-sm sm:text-lg']);
        var date = new Date(rec.date); var minutes = Math.floor(rec.duration / 60); var seconds = rec.duration % 60; var fileExtension = rec.blob.type && rec.blob.type.indexOf('mpeg') > -1 ? 'mp3' : 'webm';
        item.innerHTML = '<div class="custom-checkbox w-4 h-4 rounded border-2 border-border-color flex items-center justify-center cursor-pointer flex-shrink-0" data-id="' + rec.id + '"><div class="w-2 h-2 bg-accent rounded-sm hidden"></div></div>' +
          '<div class="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0 rounded-small overflow-hidden bg-bg-color">' + iconHTML + '</div>' +
          '<div class="flex-grow overflow-hidden min-w-0"><p class="font-bold text-xs sm:text-sm truncate" title="' + rec.stationName + '">' + rec.stationName + '</p><p class="text-xs text-text-secondary truncate">' + date.toLocaleDateString() + ' • ' + minutes + 'м ' + seconds + 'с • <span class="uppercase font-semibold">' + fileExtension + '</span></p></div>' +
          '<div class="flex-shrink-0 flex gap-1"><button data-id="' + rec.id + '" class="play-rec-btn p-1.5 sm:p-2 rounded-full text-text-secondary hover:bg-white/10 hover:text-accent transition-colors" title="Прослушать">' + CopellaConfig.ICONS.play + '</button><button data-id="' + rec.id + '" class="download-rec-btn p-1.5 sm:p-2 rounded-full text-text-secondary hover:bg-white/10 hover:text-accent-green transition-colors" title="Скачать">' + CopellaConfig.ICONS.download + '</button><button data-id="' + rec.id + '" class="delete-rec-btn p-1.5 sm:p-2 rounded-full text-text-secondary hover:bg-white/10 hover:text-record transition-colors" title="Удалить">' + CopellaConfig.ICONS.trash + '</button></div>';
        listEl.appendChild(item);
      });
      Array.prototype.forEach.call(document.querySelectorAll('.play-rec-btn'), function(btn){ btn.onclick = function(e){ playRecording(parseInt(e.currentTarget.dataset.id)); }; });
      Array.prototype.forEach.call(document.querySelectorAll('.download-rec-btn'), function(btn){ btn.onclick = function(e){ downloadRecording(parseInt(e.currentTarget.dataset.id)); }; });
      Array.prototype.forEach.call(document.querySelectorAll('.delete-rec-btn'), function(btn){ var id = parseInt(btn.dataset.id); btn.onclick = function(e){ e.stopPropagation(); btn.innerHTML = CopellaConfig.ICONS.confirm; var original = btn.onclick; btn.onclick = function(ev){ ev.stopPropagation(); deleteRecording(id); }; setTimeout(function(){ btn.innerHTML = CopellaConfig.ICONS.trash; btn.onclick = original; }, 3000); }; });
    });
  }
  function downloadRecording(id) { CopellaDB.getRecording(id).then(function(rec){ if (!rec) return; var ext = rec.blob.type && rec.blob.type.indexOf('mpeg') > -1 ? 'mp3' : 'webm'; var a = document.createElement('a'); a.href = URL.createObjectURL(rec.blob); a.download = 'rec_' + rec.stationName.replace(/\s/g, '_') + '_' + new Date(rec.date).toISOString().slice(0,19).replace(/T|:/g, '-') + '.' + ext; a.click(); URL.revokeObjectURL(a.href); }); }
  function deleteRecording(id) { CopellaDB.deleteRecording(id).then(function(){ renderRecordingsList(); CopellaUI.showToast('Запись удалена.', 'info'); }); }
  
  // Функции для работы с аудиоплеером записей
  var recordingPlayer = null;
  var currentRecording = null;
  var recordingProgressInterval = null;
  
  function setupRecordingPlayer() {
    recordingPlayer = document.createElement('audio');
    recordingPlayer.preload = 'metadata';
    
    var playBtn = document.getElementById('recordingPlayBtn');
    var volumeBtn = document.getElementById('recordingVolumeBtn');
    
    if (playBtn) {
      playBtn.onclick = function() { toggleRecordingPlayback(); };
    }
    
    if (volumeBtn) {
      volumeBtn.onclick = function() { 
        recordingPlayer.muted = !recordingPlayer.muted; 
        updateRecordingVolumeUI(); 
      };
    }
    
    recordingPlayer.addEventListener('timeupdate', updateRecordingProgress);
    recordingPlayer.addEventListener('loadedmetadata', function() {
      updateRecordingDuration();
    });
    recordingPlayer.addEventListener('ended', function() {
      stopRecordingPlayback();
    });
  }
  
  function playRecording(id) {
    CopellaDB.getRecording(id).then(function(rec) {
      if (!rec) return;
      
      stopRecordingPlayback();
      currentRecording = rec;
      
      var url = URL.createObjectURL(rec.blob);
      recordingPlayer.src = url;
      
      // Обновляем UI плеера
      var artEl = document.getElementById('recordingArt');
      var titleEl = document.getElementById('recordingTitle');
      var infoEl = document.getElementById('recordingInfo');
      var playerEl = document.getElementById('recordingPlayer');
      
      if (artEl) {
        artEl.innerHTML = rec.stationIcon ? '<img src="' + rec.stationIcon + '" class="w-full h-full object-cover">' : CopellaUI.createPlaceholder(rec.stationName, ['text-lg']);
      }
      
      if (titleEl) {
        titleEl.textContent = rec.stationName;
      }
      
      if (infoEl) {
        var date = new Date(rec.date);
        var minutes = Math.floor(rec.duration / 60);
        var seconds = rec.duration % 60;
        var fileExtension = rec.blob.type && rec.blob.type.indexOf('mpeg') > -1 ? 'mp3' : 'webm';
        infoEl.textContent = date.toLocaleDateString() + ' • ' + minutes + 'м ' + seconds + 'с • ' + fileExtension.toUpperCase();
      }
      
      if (playerEl) {
        playerEl.classList.remove('hidden');
      }
      
      recordingPlayer.play().catch(function(err) {
        console.error('Ошибка воспроизведения записи:', err);
        CopellaUI.showToast('Не удалось воспроизвести запись', 'error');
      });
    });
  }
  
  function toggleRecordingPlayback() {
    if (!recordingPlayer || !currentRecording) return;
    
    if (recordingPlayer.paused) {
      recordingPlayer.play().catch(function(err) {
        console.error('Ошибка воспроизведения:', err);
        CopellaUI.showToast('Ошибка воспроизведения записи', 'error');
      });
    } else {
      recordingPlayer.pause();
    }
  }
  
  function stopRecordingPlayback() {
    if (recordingPlayer) {
      recordingPlayer.pause();
      recordingPlayer.currentTime = 0;
      recordingPlayer.src = '';
    }
    
    if (recordingProgressInterval) {
      clearInterval(recordingProgressInterval);
      recordingProgressInterval = null;
    }
    
    updateRecordingPlayButton();
    updateRecordingProgress();
    
    var playerEl = document.getElementById('recordingPlayer');
    if (playerEl) {
      playerEl.classList.add('hidden');
    }
    
    currentRecording = null;
  }
  
  function updateRecordingProgress() {
    if (!recordingPlayer) return;
    
    var progressEl = document.getElementById('recordingProgress');
    var currentTimeEl = document.getElementById('recordingCurrentTime');
    
    if (progressEl && recordingPlayer.duration) {
      var progress = (recordingPlayer.currentTime / recordingPlayer.duration) * 100;
      progressEl.style.width = progress + '%';
    }
    
    if (currentTimeEl) {
      currentTimeEl.textContent = formatTime(recordingPlayer.currentTime);
    }
    
    updateRecordingPlayButton();
  }
  
  function updateRecordingDuration() {
    var durationEl = document.getElementById('recordingDuration');
    if (durationEl && recordingPlayer.duration) {
      durationEl.textContent = formatTime(recordingPlayer.duration);
    }
  }
  
  function updateRecordingPlayButton() {
    var playBtn = document.getElementById('recordingPlayBtn');
    if (!playBtn) return;
    
    var icon = recordingPlayer && !recordingPlayer.paused ? 
      '<svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"></path></svg>' :
      '<svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"></path></svg>';
    
    playBtn.innerHTML = icon;
  }
  
  function updateRecordingVolumeUI() {
    var volumeBtn = document.getElementById('recordingVolumeBtn');
    if (!volumeBtn || !recordingPlayer) return;
    
    var icon = recordingPlayer.muted ? 
      '<svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"></path></svg>' :
      '<svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"></path></svg>';
    
    volumeBtn.innerHTML = icon;
  }
  
  function formatTime(seconds) {
    if (isNaN(seconds) || !isFinite(seconds) || seconds < 0) return '0:00';
    var mins = Math.floor(seconds / 60);
    var secs = Math.floor(seconds % 60);
    return mins + ':' + (secs < 10 ? '0' : '') + secs;
  }
  
  // Функции для массовых операций
  function setupBatchOperations() {
    var selectAllBtn = document.getElementById('selectAllBtn');
    var batchDeleteBtn = document.getElementById('batchDeleteBtn');
    
    if (selectAllBtn) {
      selectAllBtn.onclick = function() { toggleSelectAll(); };
    }
    
    if (batchDeleteBtn) {
      batchDeleteBtn.onclick = function() { batchDeleteRecordings(); };
    }
    
    // Обработчики для кастомных чекбоксов
    setTimeout(function() {
      Array.prototype.forEach.call(document.querySelectorAll('.custom-checkbox'), function(checkbox) {
        checkbox.onclick = function() {
          var dot = this.querySelector('div');
          var isChecked = !dot.classList.contains('hidden');
          if (isChecked) {
            dot.classList.add('hidden');
            this.classList.remove('border-accent');
          } else {
            dot.classList.remove('hidden');
            this.classList.add('border-accent');
          }
          updateBatchButtons();
        };
      });
    }, 100);
  }
  
  function toggleSelectAll() {
    var checkboxes = document.querySelectorAll('.custom-checkbox');
    var selectAllBtn = document.getElementById('selectAllBtn');
    var allChecked = Array.prototype.every.call(checkboxes, function(cb) { 
      var dot = cb.querySelector('div');
      return !dot.classList.contains('hidden');
    });
    
    Array.prototype.forEach.call(checkboxes, function(checkbox) {
      var dot = checkbox.querySelector('div');
      if (allChecked) {
        dot.classList.add('hidden');
        checkbox.classList.remove('border-accent');
      } else {
        dot.classList.remove('hidden');
        checkbox.classList.add('border-accent');
      }
    });
    
    if (selectAllBtn) {
      selectAllBtn.textContent = allChecked ? 'Выбрать все' : 'Снять все';
    }
    
    updateBatchButtons();
  }
  
  function updateBatchButtons() {
    var checkboxes = document.querySelectorAll('.custom-checkbox');
    var checkedCount = Array.prototype.filter.call(checkboxes, function(cb) { 
      var dot = cb.querySelector('div');
      return !dot.classList.contains('hidden');
    }).length;
    var batchDeleteBtn = document.getElementById('batchDeleteBtn');
    
    if (batchDeleteBtn) {
      if (checkedCount > 0) {
        batchDeleteBtn.classList.remove('hidden');
        batchDeleteBtn.textContent = 'Удалить выбранные (' + checkedCount + ')';
      } else {
        batchDeleteBtn.classList.add('hidden');
      }
    }
  }
  
  function batchDeleteRecordings() {
    var checkboxes = Array.prototype.filter.call(document.querySelectorAll('.custom-checkbox'), function(cb) {
      var dot = cb.querySelector('div');
      return !dot.classList.contains('hidden');
    });
    if (checkboxes.length === 0) return;
    
    var confirmMsg = 'Вы уверены, что хотите удалить ' + checkboxes.length + ' записей?';
    if (!confirm(confirmMsg)) return;
    
    var deletePromises = [];
    Array.prototype.forEach.call(checkboxes, function(checkbox) {
      var id = parseInt(checkbox.dataset.id);
      deletePromises.push(CopellaDB.deleteRecording(id));
    });
    
    Promise.all(deletePromises).then(function() {
      renderRecordingsList();
      setupBatchOperations();
      CopellaUI.showToast('Записи удалены', 'success');
    }).catch(function(err) {
      console.error('Ошибка массового удаления:', err);
      CopellaUI.showToast('Ошибка при удалении записей', 'error');
    });
  }
  
  // --- НОВЫЕ ФУНКЦИИ v1.2 ---
  
  // Автоматическое создание плейлистов
  function createPlaylistFromRecordings() {
    CopellaDB.getRecordings().then(function(recordings) {
      if (recordings.length === 0) {
        CopellaUI.showToast('Нет записей для создания плейлиста', 'warning');
        return;
      }
      
      var playlistName = 'Плейлист ' + new Date().toLocaleDateString('ru-RU');
      var playlist = {
        id: Date.now(),
        name: playlistName,
        recordings: recordings.map(function(rec) {
          return {
            id: rec.id,
            title: rec.stationName + ' - ' + new Date(rec.date).toLocaleString('ru-RU'),
            duration: rec.duration,
            date: rec.date
          };
        }),
        createdAt: new Date().toISOString()
      };
      
      // Сохраняем плейлист в localStorage
      var playlists = JSON.parse(localStorage.getItem('copella_playlists') || '[]');
      playlists.push(playlist);
      localStorage.setItem('copella_playlists', JSON.stringify(playlists));
      
      CopellaUI.showToast('Плейлист "' + playlistName + '" создан! (' + recordings.length + ' записей)', 'success');
    });
  }
  
  // Система тегов для записей
  function addTagToRecording(recordingId, tag) {
    CopellaDB.getRecordings().then(function(recordings) {
      var recording = recordings.find(function(r) { return r.id === recordingId; });
      if (!recording) return;
      
      if (!recording.tags) recording.tags = [];
      if (!recording.tags.includes(tag)) {
        recording.tags.push(tag);
        CopellaDB.saveRecording(recording);
        CopellaUI.showToast('Тег "' + tag + '" добавлен к записи', 'success');
      }
    });
  }
  
  function removeTagFromRecording(recordingId, tag) {
    CopellaDB.getRecordings().then(function(recordings) {
      var recording = recordings.find(function(r) { return r.id === recordingId; });
      if (!recording || !recording.tags) return;
      
      var index = recording.tags.indexOf(tag);
      if (index > -1) {
        recording.tags.splice(index, 1);
        CopellaDB.saveRecording(recording);
        CopellaUI.showToast('Тег "' + tag + '" удален', 'success');
      }
    });
  }
  
  // Поиск по записям
  function searchRecordings(query) {
    CopellaDB.getRecordings().then(function(recordings) {
      var filtered = recordings.filter(function(rec) {
        var searchText = (rec.stationName + ' ' + rec.date + ' ' + (rec.tags ? rec.tags.join(' ') : '')).toLowerCase();
        return searchText.includes(query.toLowerCase());
      });
      
      // Обновляем отображение списка
      var recordingsList = document.getElementById('recordingsList');
      if (recordingsList) {
        recordingsList.innerHTML = '';
        filtered.forEach(function(rec) {
          var item = createRecordingItem(rec);
          recordingsList.appendChild(item);
        });
      }
      
      CopellaUI.showToast('Найдено записей: ' + filtered.length, 'info');
    });
  }
  
  // Автоматическое переименование записей
  function autoRenameRecording(recordingId, newName) {
    CopellaDB.getRecordings().then(function(recordings) {
      var recording = recordings.find(function(r) { return r.id === recordingId; });
      if (!recording) return;
      
      recording.customName = newName;
      CopellaDB.saveRecording(recording);
      CopellaUI.showToast('Запись переименована в "' + newName + '"', 'success');
    });
  }
  
  // Умное переименование на основе времени и станции
  function smartRenameRecording(recordingId) {
    CopellaDB.getRecordings().then(function(recordings) {
      var recording = recordings.find(function(r) { return r.id === recordingId; });
      if (!recording) return;
      
      var date = new Date(recording.date);
      var timeStr = date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
      var dateStr = date.toLocaleDateString('ru-RU');
      var smartName = recording.stationName + ' - ' + dateStr + ' ' + timeStr;
      
      recording.customName = smartName;
      CopellaDB.saveRecording(recording);
      CopellaUI.showToast('Запись переименована: "' + smartName + '"', 'success');
    });
  }
  
  // Экспорт записей в различных форматах
  function exportRecordings(format) {
    CopellaDB.getRecordings().then(function(recordings) {
      var data = recordings.map(function(rec) {
        return {
          station: rec.stationName,
          date: rec.date,
          duration: rec.duration,
          tags: rec.tags || [],
          customName: rec.customName || ''
        };
      });
      
      var content, filename, mimeType;
      
      switch(format) {
        case 'json':
          content = JSON.stringify(data, null, 2);
          filename = 'recordings-' + new Date().toISOString().slice(0, 10) + '.json';
          mimeType = 'application/json';
          break;
        case 'csv':
          content = 'Станция,Дата,Длительность,Теги,Название\n' + 
                   data.map(function(r) {
                     return '"' + r.station + '","' + r.date + '",' + r.duration + ',"' + (r.tags.join(', ') || '') + '","' + (r.customName || '') + '"';
                   }).join('\n');
          filename = 'recordings-' + new Date().toISOString().slice(0, 10) + '.csv';
          mimeType = 'text/csv';
          break;
        case 'txt':
          content = 'СПИСОК ЗАПИСЕЙ\n' + '='.repeat(50) + '\n\n' +
                   data.map(function(r, i) {
                     return (i + 1) + '. ' + r.station + '\n   Дата: ' + r.date + '\n   Длительность: ' + formatTime(r.duration) + '\n   Теги: ' + (r.tags.join(', ') || 'нет') + '\n   Название: ' + (r.customName || 'автоматическое') + '\n';
                   }).join('\n');
          filename = 'recordings-' + new Date().toISOString().slice(0, 10) + '.txt';
          mimeType = 'text/plain';
          break;
      }
      
      var blob = new Blob([content], { type: mimeType });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      CopellaUI.showToast('Экспорт в ' + format.toUpperCase() + ' завершен!', 'success');
    });
  }
  
  return { 
    toggleRecording: toggleRecording, 
    openRecordingsModal: openRecordingsModal, 
    playRecording: playRecording, 
    stopRecordingPlayback: stopRecordingPlayback,
    createPlaylistFromRecordings: createPlaylistFromRecordings,
    addTagToRecording: addTagToRecording,
    removeTagFromRecording: removeTagFromRecording,
    searchRecordings: searchRecordings,
    autoRenameRecording: autoRenameRecording,
    smartRenameRecording: smartRenameRecording,
    exportRecordings: exportRecordings
  };
})();
