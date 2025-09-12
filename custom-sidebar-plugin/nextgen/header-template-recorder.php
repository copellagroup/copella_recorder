<?php if (!defined('ABSPATH')) { exit; } ?>
<!-- Специальный хедер для страницы copella-recorder -->
<header id="cp-header-recorder" class="cp-site-header cp-header-recorder" role="banner" aria-label="Шапка Copella Recorder">
  <div class="cp-header__row">
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
    <div class="header-center flex-1 text-center">
      <img src="https://copella.live/wp-content/uploads/2025/09/Новый-проект-504-FCF08D2.png" alt="Copella Logo" class="header-logo h-12 sm:h-14 inline-block transition-all duration-300">
    </div>
    
    <!-- Действия справа -->
    <div class="header-actions flex items-center gap-2">
      <span id="mskTime" class="text-sm font-medium text-text-secondary hidden sm:block"></span>
      <button id="settingsBtn" class="action-btn p-2 rounded-full text-text-secondary hover:bg-white/10 hover:text-accent transition-colors" title="Настройки">
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M3 17v2h6v-2H3zM3 5v2h10V5H3zm10 16v-2h8v-2h-8v-2h-2v6h2zM7 9v2H3v2h4v2h2V9H7zm14 4v-2H11v2h10zm-6-4h2V7h4V5h-4V3h-2v6z"></path></svg>
      </button>
    </div>
  </div>
</header>