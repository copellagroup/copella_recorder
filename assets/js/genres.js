window.CopellaGenres = (function(){
  var genres = {
    'Поп': ['поп', 'pop', 'хит', 'hit', 'топ', 'top'],
    'Рок': ['рок', 'rock', 'метал', 'metal', 'альтернатива', 'alternative'],
    'Электроника': ['электро', 'electronic', 'house', 'techno', 'trance', 'dubstep'],
    'Джаз': ['джаз', 'jazz', 'блюз', 'blues', 'фьюжн', 'fusion'],
    'Классика': ['классика', 'classical', 'симфония', 'symphony', 'оркестр', 'orchestra'],
    'Рэп': ['рэп', 'rap', 'хип-хоп', 'hip-hop', 'рэпкор', 'rapcore'],
    'Кантри': ['кантри', 'country', 'фолк', 'folk', 'акустика', 'acoustic'],
    'Ретро': ['ретро', 'retro', '80s', '90s', 'диско', 'disco'],
    'Новости': ['новости', 'news', 'информация', 'information', 'talk'],
    'Спорт': ['спорт', 'sport', 'футбол', 'football', 'хоккей', 'hockey']
  };
  
  function detectGenre(stationName, stationUrl) {
    var text = (stationName + ' ' + stationUrl).toLowerCase();
    
    for (var genre in genres) {
      var keywords = genres[genre];
      for (var i = 0; i < keywords.length; i++) {
        if (text.includes(keywords[i])) {
          return genre;
        }
      }
    }
    
    return 'Разное';
  }
  
  function getStationsByGenre(genre) {
    return CopellaState.stations.filter(function(station) {
      return detectGenre(station.name, station.url) === genre;
    });
  }
  
  function getAllGenres() {
    var stationGenres = {};
    CopellaState.stations.forEach(function(station) {
      var genre = detectGenre(station.name, station.url);
      if (!stationGenres[genre]) {
        stationGenres[genre] = [];
      }
      stationGenres[genre].push(station);
    });
    return stationGenres;
  }
  
  function addGenreFilter() {
    var searchContainer = document.querySelector('.search-container');
    if (!searchContainer) return;
    
    // Добавляем кнопку фильтра по жанрам
    var genreBtn = document.createElement('button');
    genreBtn.id = 'genreFilterBtn';
    genreBtn.className = 'action-btn p-2 rounded-full text-text-secondary hover:bg-white/10 hover:text-accent transition-colors ml-2';
    genreBtn.title = 'Фильтр по жанрам';
    genreBtn.innerHTML = '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M3 17h6v-2H3v2zM3 5v2h10V5H3zm10 16v-2h8v-2h-8v-2h-2v6h2zM7 9v2H3v2h4v2h2V9H7zm14 4v-2H11v2h10zm-6-4h2V7h4V5h-4V3h-2v6z"></path></svg>';
    
    searchContainer.appendChild(genreBtn);
    
    // Обработчик клика
    genreBtn.onclick = function() {
      openGenreFilter();
    };
  }
  
  function openGenreFilter() {
    var allGenres = getAllGenres();
    var genreList = Object.keys(allGenres).sort();
    
    var modal = document.getElementById('stationModal'); // Переиспользуем существующий модал
    
    var genreButtons = '';
    genreList.forEach(function(genre) {
      var count = allGenres[genre].length;
      genreButtons += '<button class="genre-btn w-full bg-panel-bg hover:bg-zinc-700 text-text-primary p-3 rounded-medium text-left transition-colors" data-genre="' + genre + '"><div class="flex justify-between items-center"><span>' + genre + '</span><span class="text-text-secondary text-sm">' + count + '</span></div></button>';
    });
    
    modal.innerHTML = '<div class="modal-content bg-panel-bg rounded-large p-6 max-w-md w-full mx-4"><div class="flex justify-between items-center mb-6"><h3 class="text-xl font-bold text-text-primary">Фильтр по жанрам</h3><button class="close-modal text-text-secondary hover:text-accent transition-colors"><svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"></path></svg></button></div><div class="space-y-2">' + genreButtons + '<button class="genre-btn w-full bg-panel-bg hover:bg-zinc-700 text-text-primary p-3 rounded-medium text-left transition-colors" data-genre="all"><div class="flex justify-between items-center"><span>Все станции</span><span class="text-text-secondary text-sm">' + CopellaState.stations.length + '</span></div></button></div></div>';
    
    modal.classList.remove('opacity-0', 'pointer-events-none');
    modal.classList.add('opacity-100');
    
    // Обработчики
    modal.querySelector('.close-modal').onclick = function() { CopellaModals.closeModal('stationModal'); };
    
    // Обработчики для кнопок жанров
    modal.querySelectorAll('.genre-btn').forEach(function(btn) {
      btn.onclick = function() {
        var genre = this.dataset.genre;
        if (genre === 'all') {
          CopellaStations.renderList();
        } else {
          var stations = getStationsByGenre(genre);
          CopellaStations.renderList();
          // Фильтруем отображение
          var container = document.getElementById('stationListContainer');
          var allItems = container.querySelectorAll('.station-list-item');
          allItems.forEach(function(item) {
            var stationName = item.querySelector('p').textContent;
            var station = CopellaState.stations.find(function(s) { return s.name === stationName; });
            if (station && detectGenre(station.name, station.url) !== genre) {
              item.style.display = 'none';
            } else {
              item.style.display = 'flex';
            }
          });
        }
        CopellaModals.closeModal('stationModal');
      };
    });
    
    // Закрытие по клику вне модального окна
    modal.onclick = function(e) { if (e.target === modal) CopellaModals.closeModal('stationModal'); };
  }
  
  return {
    detectGenre: detectGenre,
    getStationsByGenre: getStationsByGenre,
    getAllGenres: getAllGenres,
    addGenreFilter: addGenreFilter,
    openGenreFilter: openGenreFilter
  };
})();