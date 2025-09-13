window.CopellaVisualizer = (function(){
  function updateMskTime() { CopellaDOM.mskTime.textContent = new Date().toLocaleTimeString('ru-RU', { timeZone: 'Europe/Moscow', hour: '2-digit', minute: '2-digit' }); }
  function resizeCanvas() { var canvas = CopellaDOM.visualizer; var rect = canvas.parentElement.getBoundingClientRect(); canvas.width = rect.width; canvas.height = rect.height; }
  function setup() {
    resizeCanvas();
    if (!CopellaState.audioContext || CopellaState.audioContext.state === 'closed') {
      try {
        CopellaState.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        CopellaState.analyser = CopellaState.audioContext.createAnalyser();
        CopellaState.source = CopellaState.audioContext.createMediaElementSource(CopellaDOM.audioPlayer);
        CopellaState.source.connect(CopellaState.analyser).connect(CopellaState.audioContext.destination);
        CopellaState.analyser.fftSize = 256;
        CopellaState.lastVisualizerData = new Uint8Array(CopellaState.analyser.frequencyBinCount);
      } catch (e) { console.warn('AudioContext setup failed:', e); return; }
    }
    if (CopellaState.animationFrameId) cancelAnimationFrame(CopellaState.animationFrameId);
    draw();
  }
  function draw() {
    var ctx = CopellaDOM.visualizer.getContext('2d');
    var dataArray = new Uint8Array(CopellaState.analyser.frequencyBinCount);
    CopellaState.animationFrameId = requestAnimationFrame(draw);
    if (!CopellaState.analyser || CopellaDOM.audioPlayer.paused) { ctx.clearRect(0, 0, CopellaDOM.visualizer.width, CopellaDOM.visualizer.height); return; }
    CopellaState.analyser.getByteFrequencyData(dataArray);
    var width = ctx.canvas.width, height = ctx.canvas.height;
    ctx.clearRect(0, 0, width, height);
    var barWidth = (width / dataArray.length) * 1.5; var x = 0;
    
    // Цвет эквалайзера - всегда стандартный
    var barColor = 'rgba(255, 255, 255, 0.05)';
    ctx.fillStyle = barColor;
    
    for (var i = 0; i < dataArray.length; i++) {
      var newHeight = (dataArray[i] / 255) * height * 0.7;
      var oldHeight = CopellaState.lastVisualizerData[i] || 0;
      var smoothed = oldHeight * 0.9 + newHeight * 0.1;
      CopellaState.lastVisualizerData[i] = smoothed;
      if (smoothed < 2) continue;
      ctx.fillRect(x, height - smoothed, barWidth, smoothed);
      x += barWidth + 2;
    }
  }
  return { updateMskTime: updateMskTime, resizeCanvas: resizeCanvas, setup: setup };
})();
