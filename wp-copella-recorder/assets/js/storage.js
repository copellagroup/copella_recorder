window.CopellaStorage = {
  getStations: function() { return JSON.parse(localStorage.getItem(CopellaConfig.STORAGE_KEYS.stations)) || null; },
  saveStations: function() { localStorage.setItem(CopellaConfig.STORAGE_KEYS.stations, JSON.stringify(CopellaState.stations)); },
  getLastPlayed: function() { return localStorage.getItem(CopellaConfig.STORAGE_KEYS.lastPlayed); },
  setLastPlayed: function(index) { localStorage.setItem(CopellaConfig.STORAGE_KEYS.lastPlayed, index); },
  clearLastPlayed: function() { localStorage.removeItem(CopellaConfig.STORAGE_KEYS.lastPlayed); },
  getSchedules: function() { return JSON.parse(localStorage.getItem(CopellaConfig.STORAGE_KEYS.schedules)) || []; },
  saveSchedules: function() { localStorage.setItem(CopellaConfig.STORAGE_KEYS.schedules, JSON.stringify(CopellaState.scheduledRecordings)); },
  getVolume: function() { var v = parseFloat(localStorage.getItem(CopellaConfig.STORAGE_KEYS.volume)); return isNaN(v) ? 0.8 : v; },
  saveVolume: function(vol) { localStorage.setItem(CopellaConfig.STORAGE_KEYS.volume, vol); },
  getRecordingFormat: function() { return localStorage.getItem(CopellaConfig.STORAGE_KEYS.recordingFormat) || 'mp3'; },
  saveRecordingFormat: function(format) { localStorage.setItem(CopellaConfig.STORAGE_KEYS.recordingFormat, format); }
};
