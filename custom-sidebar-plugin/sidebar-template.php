<?php if (!defined('ABSPATH')) { exit; } ?>
<aside class="cp-sb" id="cp-sb" aria-label="Основное меню" aria-hidden="false">
  <div class="cp-sb__rail">
    <a class="cp-sb__logo" href="<?php echo esc_url( home_url( '/' ) ); ?>" aria-label="Copella home">
      <img class="cp-sb__logo--mini" src="https://copella.live/wp-content/uploads/2025/02/copella.png" alt="Copella" />
      <img class="cp-sb__logo--full" src="https://copella.live/wp-content/uploads/2024/10/clive.png" alt="Copella" />
    </a>
    <nav class="cp-sb__nav" role="navigation">
      <a class="cp-sb__item" href="/streams/" title="Эфиры">
        <span class="cp-sb__icon" aria-hidden="true">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M6.343 4.938a1 1 0 0 1 0 1.415a8.003 8.003 0 0 0 0 11.317a1 1 0 1 1-1.414 1.414c-3.907-3.906-3.907-10.24 0-14.146a1 1 0 0 1 1.414 0m12.732 0c3.906 3.907 3.906 10.24 0 14.146a1 1 0 0 1-1.415-1.414a8.003 8.003 0 0 0 0-11.317a1 1 0 0 1 1.415-1.415M9.31 7.812a1 1 0 0 1 0 1.414a3.92 3.92 0 0 0 0 5.544a1 1 0 1 1-1.415 1.414a5.92 5.92 0 0 1 0-8.372a1 1 0 0 1 1.415 0m6.958 0a5.92 5.92 0 0 1 0 8.372a1 1 0 0 1-1.414-1.414a3.92 3.92 0 0 0 0-5.544a1 1 0 0 1 1.414-1.414m-4.186 2.77a1.5 1.5 0 1 1 0 3a1.5 1.5 0 0 1 0-3"/></svg>
        </span>
        <span class="cp-sb__label">Эфиры</span>
      </a>
      <a class="cp-sb__item" href="/videos/" title="Видео">
        <span class="cp-sb__icon" aria-hidden="true">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g fill="currentColor"><path d="M20.117 7.625a1 1 0 0 0-.564.1L15 10v4l4.553 2.275A1 1 0 0 0 21 15.383V8.617a1 1 0 0 0-.883-.992"/><path d="M5 5C3.355 5 2 6.355 2 8v8c0 1.645 1.355 3 3 3h8c1.645 0 3-1.355 3-3V8c0-1.645-1.355-3-3-3z"/></g></svg>
        </span>
        <span class="cp-sb__label">Видео</span>
      </a>
      <a class="cp-sb__item cp-sb__archive" href="/Archive-commet/" title="Архив Commet">
        <span class="cp-sb__icon" aria-hidden="true">
          <img src="https://copella.live/wp-content/uploads/2025/09/COMMET2309_LOGO_MAIN-2.png" alt="" width="24" height="24" loading="eager" decoding="async" fetchpriority="high" />
        </span>
        <span class="cp-sb__label">Архив Commet</span>
      </a>
      <a class="cp-sb__item" href="/category/radio/" title="Радио">
        <span class="cp-sb__icon" aria-hidden="true">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M4 22q-.825 0-1.412-.587T2 20V8q0-.625.338-1.125t.912-.725l11.825-4.825q.35-.125.688.013t.462.487t-.012.688t-.488.462L8.3 6H20q.825 0 1.413.588T22 8v12q0 .825-.587 1.413T20 22zm0-2h16v-7H4zm4-1q1.05 0 1.775-.725T10.5 16.5t-.725-1.775T8 14t-1.775.725T5.5 16.5t.725 1.775T8 19m-4-8h12v-1q0-.425.288-.712T17 9t.713.288T18 10v1h2V8H4zm0 9v-7z"/></svg>
        </span>
        <span class="cp-sb__label">Радио</span>
      </a>
      <a class="cp-sb__item" href="/category/podcasts/" title="Подкасты">
        <span class="cp-sb__icon" aria-hidden="true">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M16.85 18.58a9 9 0 1 0-9.7 0"/><path d="M8 14a5 5 0 1 1 8 0"/><circle cx="12" cy="11" r="1"/><path d="M13 17a1 1 0 1 0-2 0l.5 4.5a.5.5 0 1 0 1 0Z"/></g></svg>
        </span>
        <span class="cp-sb__label">Подкасты</span>
      </a>
      <a class="cp-sb__item cp-sb__donate" href="<?php echo esc_url( home_url( '/#donate' ) ); ?>" data-scroll-donate="1" title="Задонатить">
        <span class="cp-sb__icon" aria-hidden="true">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"><path fill="currentColor" d="M12 21s-1-.684-2.293-1.824C7.4 17.6 4 14.6 4 10.8C4 8.149 6.149 6 8.8 6c1.362 0 2.65.624 3.2 1.6c.55-.976 1.838-1.6 3.2-1.6C17.851 6 20 8.149 20 10.8c0 3.8-3.4 6.8-5.707 8.376C13 20.316 12 21 12 21"/></svg>
        </span>
        <span class="cp-sb__label">Задонатить</span>
      </a>
      <a class="cp-sb__item cp-sb__recorder" href="https://copella.live/copella-recorder" title="Copella Recorder">
        <span class="cp-sb__icon" aria-hidden="true">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g fill="currentColor"><path d="M12 14a4 4 0 1 0-4-4a4 4 0 0 0 4 4"/><path d="M16.5 10a1 1 0 0 0-1 1a3.5 3.5 0 1 1-7 0a1 1 0 1 0-2 0a5.5 5.5 0 0 0 5 5.477V19H8a1 1 0 0 0 0 2h8a1 1 0 1 0 0-2h-3.5v-2.523A5.5 5.5 0 0 0 17.5 11a1 1 0 0 0-1-1"/></g></svg>
        </span>
        <span class="cp-sb__label">Copella Recorder</span>
      </a>
    </nav>
    
  </div>

  <button class="cp-sb__burger" aria-label="Открыть меню" aria-expanded="false" aria-controls="cp-sb__drawer">
    <span class="cp-sb__burger-line" aria-hidden="true"></span>
    <span class="cp-sb__burger-line" aria-hidden="true"></span>
    <span class="cp-sb__burger-line" aria-hidden="true"></span>
  </button>

  <div class="cp-sb__scrim" hidden></div>
  <div class="cp-sb__drawer" id="cp-sb__drawer" role="dialog" aria-modal="true" aria-label="Меню" hidden>
    <div class="cp-sb__drawer-header">
      <a class="cp-sb__logo" href="<?php echo esc_url( home_url( '/' ) ); ?>" aria-label="Copella home">
        <img class="cp-sb__logo--mini" src="https://copella.live/wp-content/uploads/2025/02/copella.png" alt="Copella" />
        <img class="cp-sb__logo--full" src="https://copella.live/wp-content/uploads/2024/10/clive.png" alt="Copella" />
      </a>
      <button class="cp-sb__close" aria-label="Закрыть меню">✕</button>
    </div>
    <nav class="cp-sb__drawer-nav" role="navigation">
      <a class="cp-sb__drawer-item" href="/streams/" title="Эфиры">
        <span class="cp-sb__icon" aria-hidden="true">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M6.343 4.938a1 1 0 0 1 0 1.415a8.003 8.003 0 0 0 0 11.317a1 1 0 1 1-1.414 1.414c-3.907-3.906-3.907-10.24 0-14.146a1 1 0 0 1 1.414 0m12.732 0c3.906 3.907 3.906 10.24 0 14.146a1 1 0 0 1-1.415-1.414a8.003 8.003 0 0 0 0-11.317a1 1 0 0 1 1.415-1.415M9.31 7.812a1 1 0 0 1 0 1.414a3.92 3.92 0 0 0 0 5.544a1 1 0 1 1-1.415 1.414a5.92 5.92 0 0 1 0-8.372a1 1 0 0 1 1.415 0m6.958 0a5.92 5.92 0 0 1 0 8.372a1 1 0 0 1-1.414-1.414a3.92 3.92 0 0 0 0-5.544a1 1 0 0 1 1.414-1.414m-4.186 2.77a1.5 1.5 0 1 1 0 3a1.5 1.5 0 0 1 0-3"/></svg>
        </span>
        <span class="cp-sb__label">Эфиры</span>
      </a>
      <a class="cp-sb__drawer-item" href="/videos/" title="Видео">
        <span class="cp-sb__icon" aria-hidden="true">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g fill="currentColor"><path d="M20.117 7.625a1 1 0 0 0-.564.1L15 10v4l4.553 2.275A1 1 0 0 0 21 15.383V8.617a1 1 0 0 0-.883-.992"/><path d="M5 5C3.355 5 2 6.355 2 8v8c0 1.645 1.355 3 3  3h8c1.645 0 3-1.355 3-3V8c0-1.645-1.355-3-3-3z"/></g></svg>
        </span>
        <span class="cp-sb__label">Видео</span>
      </a>
      <a class="cp-sb__drawer-item cp-sb__archive" href="/archive-commet/" title="Архив Commet">
        <span class="cp-sb__icon" aria-hidden="true">
          <img src="https://copella.live/wp-content/uploads/2025/09/COMMET2309_LOGO_MAIN-2.png" alt="" width="24" height="24" loading="eager" decoding="async" fetchpriority="high" />
        </span>
        <span class="cp-sb__label">Архив Commet</span>
      </a>
      <a class="cp-sb__drawer-item" href="/category/radio/" title="Радио">
        <span class="cp-sb__icon" aria-hidden="true">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M4 22q-.825 0-1.412-.587T2 20V8q0-.625.338-1.125t.912-.725l11.825-4.825q.35-.125.688.013t.462.487t-.012.688t-.488.462L8.3 6H20q.825 0 1.413.588T22 8v12q0 .825-.587 1.413T20 22zm0-2h16v-7H4zm4-1q1.05 0 1.775-.725T10.5 16.5t-.725-1.775T8 14t-1.775.725T5.5 16.5t.725 1.775T8 19m-4-8h12v-1q0-.425.288-.712T17 9t.713.288T18 10v1h2V8H4zm0 9v-7z"/></svg>
        </span>
        <span class="cp-sb__label">Радио</span>
      </a>
      <a class="cp-sb__drawer-item" href="/category/podcasts/" title="Подкасты">
        <span class="cp-sb__icon" aria-hidden="true">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M16.85 18.58a9 9 0 1 0-9.7 0"/><path d="M8 14a5 5 0 1 1 8 0"/><circle cx="12" cy="11" r="1"/><path d="M13 17a1 1 0 1 0-2 0l.5 4.5a.5.5 0 1 0 1 0Z"/></g></svg>
        </span>
        <span class="cp-sb__label">Подкасты</span>
      </a>
      <a class="cp-sb__drawer-item cp-sb__donate" href="<?php echo esc_url( home_url( '/#donate' ) ); ?>" data-scroll-donate="1" title="Задонатить">
        <span class="cp-sb__icon" aria-hidden="true">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"><path fill="currentColor" d="M12 21s-1-.684-2.293-1.824C7.4 17.6 4 14.6 4 10.8C4 8.149 6.149 6 8.8 6c1.362 0 2.65.624 3.2 1.6c.55-.976 1.838-1.6 3.2-1.6C17.851 6 20 8.149 20 10.8c0 3.8-3.4 6.8-5.707 8.376C13 20.316 12 21 12 21"/></svg>
        </span>
        <span class="cp-sb__label">Задонатить</span>
      </a>
      <a class="cp-sb__drawer-item cp-sb__recorder" href="https://copella.live/copella-recorder" title="Copella Recorder">
        <span class="cp-sb__icon" aria-hidden="true">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g fill="currentColor"><path d="M12 14a4 4 0 1 0-4-4a4 4 0 0 0 4 4"/><path d="M16.5 10a1 1 0 0 0-1 1a3.5 3.5 0 1 1-7 0a1 1 0 1 0-2 0a5.5 5.5 0 0 0 5 5.477V19H8a1 1 0 0 0 0 2h8a1 1 0 1 0 0-2h-3.5v-2.523A5.5 5.5 0 0 0 17.5 11a1 1 0 0 0-1-1"/></g></svg>
        </span>
        <span class="cp-sb__label">Copella Recorder</span>
      </a>
    </nav>
  </div>
</aside>
