window.CopellaDB = {
  init: function() {
    return new Promise(function(resolve, reject) {
      var request = indexedDB.open(CopellaConfig.DB_NAME, CopellaConfig.DB_VERSION);
      request.onerror = function(event) { reject('Database error: ' + event.target.errorCode); };
      request.onsuccess = function(event) { CopellaState.db = event.target.result; resolve(); };
      request.onupgradeneeded = function(event) {
        var db = event.target.result;
        if (!db.objectStoreNames.contains('recordings')) {
          db.createObjectStore('recordings', { keyPath: 'id' });
        }
      };
    });
  },
  saveRecording: function(record) {
    return new Promise(function(resolve, reject) {
      if (!CopellaState.db) return reject('Database not initialized.');
      CopellaState.db.transaction(['recordings'], 'readwrite')
        .objectStore('recordings')
        .add(record)
        .onsuccess = resolve;
    });
  },
  getRecordings: function() {
    return new Promise(function(resolve) {
      CopellaState.db.transaction(['recordings'], 'readonly')
        .objectStore('recordings')
        .getAll()
        .onsuccess = function(e) { resolve(e.target.result); };
    });
  },
  getRecording: function(id) {
    return new Promise(function(resolve) {
      CopellaState.db.transaction(['recordings'], 'readonly')
        .objectStore('recordings')
        .get(id)
        .onsuccess = function(e) { resolve(e.target.result); };
    });
  },
  deleteRecording: function(id) {
    return new Promise(function(resolve) {
      CopellaState.db.transaction(['recordings'], 'readwrite')
        .objectStore('recordings')
        .delete(id)
        .onsuccess = resolve;
    });
  }
};
