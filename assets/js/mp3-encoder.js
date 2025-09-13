/* global self */
try {
  importScripts('https://cdn.jsdelivr.net/npm/lamejs@1.2.1/lame.min.js');
} catch (error) {
  self.postMessage({ type: 'error', message: 'Не удалось загрузить lamejs: ' + error.message });
  return;
}

if (typeof lamejs === 'undefined') {
  self.postMessage({ type: 'error', message: 'lamejs не загружен' });
  return;
}

self.onmessage = function(event){
  var channels = event.data.channels;
  var sampleRate = event.data.sampleRate;
  try {
    var kbps = 128;
    var encoder = new lamejs.Mp3Encoder(channels.length, sampleRate, kbps);
    var mp3Data = [];
    var blockSize = 1152;
    var pcmInt16 = channels.map(function(channelData){
      var int16Array = new Int16Array(channelData.length);
      for (var i = 0; i < channelData.length; i++) {
        int16Array[i] = channelData[i] < 0 ? channelData[i] * 32768 : channelData[i] * 32767;
      }
      return int16Array;
    });
    var total = pcmInt16[0].length; var processed = 0;
    for (var i = 0; i < total; i += blockSize) {
      var left = pcmInt16[0].subarray(i, i + blockSize);
      var right = (pcmInt16.length === 2) ? pcmInt16[1].subarray(i, i + blockSize) : null;
      var buf = encoder.encodeBuffer(left, right);
      if (buf.length > 0) mp3Data.push(buf);
      processed += blockSize;
      var progress = Math.min(100, Math.round((processed / total) * 100));
      if (i % (blockSize * 20) === 0 || (i + blockSize >= total)) self.postMessage({ type: 'progress', progress: progress });
    }
    var flush = encoder.flush(); if (flush.length > 0) mp3Data.push(flush);
    var mp3Blob = new Blob(mp3Data, { type: 'audio/mpeg' });
    self.postMessage({ type: 'complete', mp3Blob: mp3Blob });
  } catch (error) {
    self.postMessage({ type: 'error', message: error.message });
  }
};
