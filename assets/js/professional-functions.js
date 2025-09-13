window.CopellaProfessional = (function(){
  // Профессиональные функции для радио любителей
  
  // Анализ качества потока
  function analyzeStreamQuality() {
    if (!CopellaState.analyser) return null;
    
    var dataArray = new Uint8Array(CopellaState.analyser.frequencyBinCount);
    CopellaState.analyser.getByteFrequencyData(dataArray);
    
    var total = 0;
    var peaks = 0;
    var silence = 0;
    
    for (var i = 0; i < dataArray.length; i++) {
      total += dataArray[i];
      if (dataArray[i] > 200) peaks++;
      if (dataArray[i] < 10) silence++;
    }
    
    var average = total / dataArray.length;
    var quality = 'unknown';
    
    if (average > 100 && peaks > 10) quality = 'excellent';
    else if (average > 50 && peaks > 5) quality = 'good';
    else if (average > 20 && peaks > 2) quality = 'fair';
    else if (average > 5) quality = 'poor';
    else quality = 'silent';
    
    return {
      quality: quality,
      average: Math.round(average),
      peaks: peaks,
      silence: silence,
      bitrate: estimateBitrate()
    };
  }
  
  // Оценка битрейта потока
  function estimateBitrate() {
    if (!CopellaDOM.audioPlayer.src) return 'unknown';
    
    var url = CopellaDOM.audioPlayer.src.toLowerCase();
    if (url.includes('128')) return '128 kbps';
    if (url.includes('192')) return '192 kbps';
    if (url.includes('256')) return '256 kbps';
    if (url.includes('320')) return '320 kbps';
    if (url.includes('64')) return '64 kbps';
    if (url.includes('96')) return '96 kbps';
    
    return 'unknown';
  }
  
  // Анализ метаданных потока
  function analyzeStreamMetadata() {
    var station = CopellaState.stations[CopellaState.currentStationIndex];
    if (!station) return null;
    
    var metadata = {
      stationName: station.name,
      url: station.url,
      protocol: detectProtocol(station.url),
      format: detectFormat(station.url),
      server: extractServer(station.url),
      port: extractPort(station.url),
      path: extractPath(station.url)
    };
    
    return metadata;
  }
  
  // Определение протокола
  function detectProtocol(url) {
    if (url.includes('https://')) return 'HTTPS';
    if (url.includes('http://')) return 'HTTP';
    if (url.includes('rtmp://')) return 'RTMP';
    if (url.includes('rtsp://')) return 'RTSP';
    if (url.includes('udp://')) return 'UDP';
    return 'Unknown';
  }
  
  // Определение формата
  function detectFormat(url) {
    if (url.includes('.m3u8')) return 'HLS';
    if (url.includes('.m3u')) return 'M3U';
    if (url.includes('.pls')) return 'PLS';
    if (url.includes('.asx')) return 'ASX';
    if (url.includes('.wax')) return 'WAX';
    if (url.includes('.wvx')) return 'WVX';
    if (url.includes('.mp3')) return 'MP3';
    if (url.includes('.aac')) return 'AAC';
    if (url.includes('.ogg')) return 'OGG';
    return 'Unknown';
  }
  
  // Извлечение сервера
  function extractServer(url) {
    try {
      var urlObj = new URL(url);
      return urlObj.hostname;
    } catch (e) {
      return 'unknown';
    }
  }
  
  // Извлечение порта
  function extractPort(url) {
    try {
      var urlObj = new URL(url);
      return urlObj.port || (urlObj.protocol === 'https:' ? '443' : '80');
    } catch (e) {
      return 'unknown';
    }
  }
  
  // Извлечение пути
  function extractPath(url) {
    try {
      var urlObj = new URL(url);
      return urlObj.pathname;
    } catch (e) {
      return 'unknown';
    }
  }
  
  // Мониторинг соединения
  function monitorConnection() {
    var startTime = Date.now();
    var connectionInfo = {
      startTime: startTime,
      reconnectAttempts: 0,
      lastError: null,
      uptime: 0,
      status: 'connected'
    };
    
    // Мониторинг ошибок
    CopellaDOM.audioPlayer.addEventListener('error', function(e) {
      connectionInfo.lastError = e.type;
      connectionInfo.reconnectAttempts++;
      connectionInfo.status = 'error';
    });
    
    // Мониторинг переподключений
    CopellaDOM.audioPlayer.addEventListener('loadstart', function() {
      connectionInfo.status = 'connecting';
    });
    
    CopellaDOM.audioPlayer.addEventListener('canplay', function() {
      connectionInfo.status = 'connected';
      connectionInfo.uptime = Date.now() - startTime;
    });
    
    return connectionInfo;
  }
  
  // Анализ частотного спектра
  function analyzeFrequencySpectrum() {
    if (!CopellaState.analyser) return null;
    
    var dataArray = new Uint8Array(CopellaState.analyser.frequencyBinCount);
    CopellaState.analyser.getByteFrequencyData(dataArray);
    
    var spectrum = {
      bass: 0,      // 0-64 Hz
      lowMid: 0,    // 64-256 Hz
      mid: 0,       // 256-1024 Hz
      highMid: 0,   // 1024-4096 Hz
      treble: 0     // 4096+ Hz
    };
    
    var bassEnd = Math.floor(dataArray.length * 0.1);
    var lowMidEnd = Math.floor(dataArray.length * 0.3);
    var midEnd = Math.floor(dataArray.length * 0.6);
    var highMidEnd = Math.floor(dataArray.length * 0.8);
    
    for (var i = 0; i < dataArray.length; i++) {
      if (i < bassEnd) spectrum.bass += dataArray[i];
      else if (i < lowMidEnd) spectrum.lowMid += dataArray[i];
      else if (i < midEnd) spectrum.mid += dataArray[i];
      else if (i < highMidEnd) spectrum.highMid += dataArray[i];
      else spectrum.treble += dataArray[i];
    }
    
    return spectrum;
  }
  
  // Детектор тишины
  function detectSilence() {
    if (!CopellaState.analyser) return false;
    
    var dataArray = new Uint8Array(CopellaState.analyser.frequencyBinCount);
    CopellaState.analyser.getByteFrequencyData(dataArray);
    
    var total = 0;
    for (var i = 0; i < dataArray.length; i++) {
      total += dataArray[i];
    }
    
    var average = total / dataArray.length;
    return average < 5; // Порог тишины
  }
  
  // Анализатор громкости
  function analyzeVolume() {
    if (!CopellaState.analyser) return null;
    
    var dataArray = new Uint8Array(CopellaState.analyser.frequencyBinCount);
    CopellaState.analyser.getByteFrequencyData(dataArray);
    
    var total = 0;
    var peak = 0;
    
    for (var i = 0; i < dataArray.length; i++) {
      total += dataArray[i];
      if (dataArray[i] > peak) peak = dataArray[i];
    }
    
    var average = total / dataArray.length;
    var volume = Math.round((average / 255) * 100);
    var peakVolume = Math.round((peak / 255) * 100);
    
    return {
      average: volume,
      peak: peakVolume,
      level: getVolumeLevel(volume)
    };
  }
  
  // Определение уровня громкости
  function getVolumeLevel(volume) {
    if (volume > 80) return 'very_loud';
    if (volume > 60) return 'loud';
    if (volume > 40) return 'moderate';
    if (volume > 20) return 'quiet';
    if (volume > 5) return 'very_quiet';
    return 'silent';
  }
  
  // Проверка стабильности потока
  function checkStreamStability() {
    if (!CopellaState.analyser) return null;
    
    var dataArray = new Uint8Array(CopellaState.analyser.frequencyBinCount);
    CopellaState.analyser.getByteFrequencyData(dataArray);
    
    var total = 0;
    var variance = 0;
    
    for (var i = 0; i < dataArray.length; i++) {
      total += dataArray[i];
    }
    
    var average = total / dataArray.length;
    
    for (var i = 0; i < dataArray.length; i++) {
      variance += Math.pow(dataArray[i] - average, 2);
    }
    
    variance = variance / dataArray.length;
    var stability = Math.round(100 - (Math.sqrt(variance) / average * 100));
    
    return {
      stability: Math.max(0, stability),
      variance: Math.round(variance),
      average: Math.round(average)
    };
  }
  
  // Экспорт технических данных
  function exportTechnicalData() {
    var data = {
      timestamp: new Date().toISOString(),
      station: analyzeStreamMetadata(),
      quality: analyzeStreamQuality(),
      spectrum: analyzeFrequencySpectrum(),
      volume: analyzeVolume(),
      stability: checkStreamStability(),
      silence: detectSilence()
    };
    
    var dataStr = JSON.stringify(data, null, 2);
    var blob = new Blob([dataStr], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'copella-technical-data-' + new Date().toISOString().slice(0, 10) + '.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    CopellaUI.showToast('Технические данные экспортированы!', 'success');
  }
  
  // Генерация отчета о качестве
  function generateQualityReport() {
    var quality = analyzeStreamQuality();
    var metadata = analyzeStreamMetadata();
    var volume = analyzeVolume();
    var stability = checkStreamStability();
    
    var report = '=== ОТЧЕТ О КАЧЕСТВЕ ПОТОКА ===\n\n';
    report += 'Станция: ' + (metadata ? metadata.stationName : 'Неизвестно') + '\n';
    report += 'Протокол: ' + (metadata ? metadata.protocol : 'Неизвестно') + '\n';
    report += 'Формат: ' + (metadata ? metadata.format : 'Неизвестно') + '\n';
    report += 'Сервер: ' + (metadata ? metadata.server : 'Неизвестно') + '\n';
    report += 'Порт: ' + (metadata ? metadata.port : 'Неизвестно') + '\n\n';
    
    report += '=== АНАЛИЗ КАЧЕСТВА ===\n';
    report += 'Общее качество: ' + (quality ? quality.quality : 'Неизвестно') + '\n';
    report += 'Средний уровень: ' + (quality ? quality.average : 'Неизвестно') + '\n';
    report += 'Пики: ' + (quality ? quality.peaks : 'Неизвестно') + '\n';
    report += 'Тишина: ' + (quality ? quality.silence : 'Неизвестно') + '\n';
    report += 'Битрейт: ' + (quality ? quality.bitrate : 'Неизвестно') + '\n\n';
    
    report += '=== АНАЛИЗ ГРОМКОСТИ ===\n';
    report += 'Средняя громкость: ' + (volume ? volume.average + '%' : 'Неизвестно') + '\n';
    report += 'Пиковая громкость: ' + (volume ? volume.peak + '%' : 'Неизвестно') + '\n';
    report += 'Уровень: ' + (volume ? volume.level : 'Неизвестно') + '\n\n';
    
    report += '=== СТАБИЛЬНОСТЬ ===\n';
    report += 'Стабильность: ' + (stability ? stability.stability + '%' : 'Неизвестно') + '\n';
    report += 'Вариация: ' + (stability ? stability.variance : 'Неизвестно') + '\n';
    report += 'Среднее значение: ' + (stability ? stability.average : 'Неизвестно') + '\n\n';
    
    report += 'Время генерации: ' + new Date().toLocaleString() + '\n';
    
    return report;
  }
  
  // Показать техническую информацию
  function showTechnicalInfo() {
    var report = generateQualityReport();
    var content = '<div class="modal-content bg-panel-bg p-6 rounded-large w-full max-w-2xl transform scale-95 transition-transform duration-300 flex flex-col">' +
      '<div class="flex justify-between items-center mb-6 flex-shrink-0">' +
      '<h2 class="text-xl font-bold">Техническая информация</h2>' +
      '<button class="close-btn text-2xl text-text-secondary">&times;</button>' +
      '</div>' +
      '<div class="flex-grow overflow-y-auto">' +
      '<pre class="text-sm text-text-primary whitespace-pre-wrap bg-zinc-800 p-4 rounded-medium">' + report + '</pre>' +
      '</div>' +
      '<div class="flex gap-3 mt-4 flex-shrink-0">' +
      '<button id="exportTechDataBtn" class="flex-1 p-3 text-base font-bold rounded-small border border-border-color bg-zinc-800 text-text-primary cursor-pointer">Экспорт данных</button>' +
      '<button id="copyReportBtn" class="flex-1 p-3 text-base font-bold rounded-small border border-border-color bg-zinc-800 text-text-primary cursor-pointer">Копировать отчет</button>' +
      '</div>' +
      '</div>';
    
    CopellaUI.openModal(CopellaDOM.statsModal, content);
    CopellaDOM.statsModal.querySelector('.close-btn').onclick = function(){ CopellaUI.closeModal(CopellaDOM.statsModal); };
    CopellaDOM.statsModal.querySelector('#exportTechDataBtn').onclick = exportTechnicalData;
    CopellaDOM.statsModal.querySelector('#copyReportBtn').onclick = function(){
      navigator.clipboard.writeText(report).then(function(){
        CopellaUI.showToast('Отчет скопирован в буфер обмена!', 'success');
      });
    };
  }
  
  return {
    analyzeStreamQuality: analyzeStreamQuality,
    analyzeStreamMetadata: analyzeStreamMetadata,
    analyzeFrequencySpectrum: analyzeFrequencySpectrum,
    analyzeVolume: analyzeVolume,
    checkStreamStability: checkStreamStability,
    detectSilence: detectSilence,
    monitorConnection: monitorConnection,
    exportTechnicalData: exportTechnicalData,
    generateQualityReport: generateQualityReport,
    showTechnicalInfo: showTechnicalInfo
  };
})();