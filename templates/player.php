<?php if (!defined('ABSPATH')) { exit; } ?>
<div class="app-container flex flex-col h-full max-w-4xl mx-auto w-full p-4 sm:p-6 pb-[calc(1rem+env(safe-area-inset-bottom))] bg-bg-color text-text-primary font-manrope min-h-screen antialiased">
    <!-- Компактный хедер для встраивания в существующий сайт -->
    <header class="app-header fixed top-0 left-0 right-0 z-50 flex justify-between items-center h-20 px-4 bg-[#1a1a1a] border-b border-white/10 font-gilroy">
        <!-- Кнопка "Назад" -->
        <div class="back-button-container">
            <button id="backBtn" class="back-btn flex items-center gap-2 text-text-secondary hover:text-accent transition-colors group" title="Вернуться назад">
                <svg class="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
                </svg>
                <span class="text-sm font-medium">Назад</span>
            </button>
        </div>
        
        <!-- Центральная часть с логотипом -->
        <div class="header-center flex-1 text-center flex justify-center items-center">
            <img src="https://copella.live/wp-content/uploads/2025/09/Новый-проект-504-FCF08D2.png" alt="Copella Logo" class="header-logo h-16 inline-block transition-all duration-300">
        </div>
        
        <!-- Действия справа -->
        <div class="header-actions flex items-center gap-2">
            <span id="mskTime" class="text-sm font-medium text-text-secondary hidden sm:block"></span>
            <button id="settingsBtn" class="action-btn p-2 rounded-full text-text-secondary hover:bg-white/10 hover:text-accent transition-colors" title="Настройки">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M3 17v2h6v-2H3zM3 5v2h10V5H3zm10 16v-2h8v-2h-8v-2h-2v6h2zM7 9v2H3v2h4v2h2V9H7zm14 4v-2H11v2h10zm-6-4h2V7h4V5h-4V3h-2v6z"></path></svg>
            </button>
        </div>
    </header>
    <main class="flex flex-col flex-grow overflow-hidden pt-20">
        <section id="playerPanel" class="player-panel relative bg-panel-bg rounded-large p-6 mt-4 flex-shrink-0 overflow-hidden">
            <canvas id="visualizer" class="absolute inset-0 z-0 opacity-70 pointer-events-none"></canvas>
            <div id="player-content" class="relative z-10 flex flex-col items-center gap-4 min-h-[250px] transition-opacity duration-300"><div id="player-placeholder" class="m-auto text-text-secondary">Станция не выбрана</div></div>
            <div class="loading-overlay absolute inset-0 z-20 flex justify-center items-center bg-panel-bg/50 opacity-0 pointer-events-none transition-opacity duration-300"><div class="spinner w-10 h-10 border-4 border-white/20 border-t-accent rounded-full animate-spin"></div></div>
        </section>
        <section class="stations-panel mt-6 flex-grow flex flex-col overflow-hidden">
            <div id="stationsHeader" class="stations-header flex justify-between items-center mb-4 flex-shrink-0">
                <div class="search-container relative flex-1 mr-2 sm:mr-4">
                    <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" fill="currentColor" viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"></path></svg>
                    <input type="search" id="stationSearchInput" placeholder="Найти станцию..." class="w-full bg-panel-bg border-none rounded-small py-2.5 pl-10 pr-4 text-text-primary text-base outline-none focus:ring-2 focus:ring-accent/50 transition-shadow">
                </div>
                <div class="station-actions flex gap-1 sm:gap-2">
                    <button id="recordingsBtn" class="action-btn relative p-2 rounded-full text-text-secondary hover:bg-white/10 hover:text-accent transition-colors" title="Мои Записи"><svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M20 6h-8l-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V6h5.17l2 2H20v10z"></path></svg><span id="newRecordingBadge" class="absolute top-1 right-1 w-2.5 h-2.5 bg-record rounded-full border-2 border-panel-bg hidden"></span></button>
                    <button id="schedulerBtn" class="action-btn p-2 rounded-full text-text-secondary hover:bg-white/10 hover:text-accent transition-colors" title="Планировщик записей"><svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM9 14H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2zM5 8V6h14v2H5z"></path></svg></button>
                    <button id="exportBtn" class="action-btn p-2 rounded-full text-text-secondary hover:bg-white/10 hover:text-accent transition-colors" title="Экспорт плейлиста"><svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"></path></svg></button>
                    <button id="statsBtn" class="action-btn p-2 rounded-full text-text-secondary hover:bg-white/10 hover:text-accent transition-colors" title="Статистика"><svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M16,6L18.29,8.29L13.41,13.17L9.41,9.17L2,16.59L3.41,18L9.41,12L13.41,16L19.71,9.71L22,12V6H16Z"></path></svg></button>
                    <button id="streamInfoBtn" class="action-btn p-2 rounded-full text-text-secondary hover:bg-white/10 hover:text-accent transition-colors" title="Информация о потоке"><svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"></path></svg></button>
                    <button id="addStationHeaderBtn" class="action-btn p-2 rounded-full text-text-secondary hover:bg-white/10 hover:text-accent transition-colors" title="Добавить станцию"><svg class="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"></path></svg></button>
                </div>
            </div>
            <div class="flex-grow overflow-y-auto pr-1">
                <div id="stationListContainer"></div>
                <div id="stationListMessage" class="text-center text-text-secondary p-12 hidden"></div>
                <div id="apiSearchResults" class="mt-4 hidden">
                    <h3 class="text-sm font-bold text-text-secondary uppercase tracking-wider mb-2 px-2">Глобальный поиск</h3>
                    <div id="apiSearchResultsContainer"></div>
                    <div id="apiSearchMessage" class="text-center text-text-secondary p-8"></div>
                </div>
            </div>
            <div id="empty-stations-view" class="text-center text-text-secondary p-8 flex flex-col items-center justify-center flex-grow min-h-[200px] hidden"><svg class="w-20 h-20 mb-6 opacity-30" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3c-4.97 0-9 4.03-9 9v7c0 1.1.9 2 2 2h4v-8H5v-1c0-3.87 3.13-7 7-7s7 3.13 7 7v1h-4v8h4c1.1 0 2-.9 2-2v-7c0-4.97-4.03-9-9-9z"></path></svg><h4 class="text-lg font-bold text-text-primary mb-2">Ваша медиатека пуста</h4><p class="mb-6 max-w-xs">Добавьте радиостанции вручную или найдите новые через поиск.</p><button id="emptyAddBtn" class="inline-flex items-center gap-3 text-base font-bold text-bg-color bg-accent px-6 py-3 rounded-medium shadow-lg transition-transform active:scale-95"><svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"></path></svg><span>Добавить станцию</span></button></div>
        </section>
    </main>
    <div id="stationModal" class="modal fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-center items-center p-4 opacity-0 pointer-events-none transition-opacity duration-300"></div>
    <div id="welcomeModal" class="modal fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-center items-center p-4 opacity-0 pointer-events-none transition-opacity duration-300"></div>
    <div id="schedulerModal" class="modal fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-center items-center p-4 opacity-0 pointer-events-none transition-opacity duration-300"></div>
    <div id="recordingsModal" class="modal fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-center items-center p-4 opacity-0 pointer-events-none transition-opacity duration-300"></div>
    <div id="settingsModal" class="modal fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-center items-center p-4 opacity-0 pointer-events-none transition-opacity duration-300"></div>
    <div id="exportModal" class="modal fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-center items-center p-4 opacity-0 pointer-events-none transition-opacity duration-300"></div>
    <div id="statsModal" class="modal fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-center items-center p-4 opacity-0 pointer-events-none transition-opacity duration-300"></div>
    <div id="toastContainer" class="fixed bottom-0 right-0 left-0 sm:left-auto sm:bottom-4 sm:right-4 z-[100] p-4 flex flex-col items-center sm:items-end gap-3 pointer-events-none"></div>
    <audio id="audioPlayer" crossorigin="anonymous" class="hidden"></audio>
</div>
