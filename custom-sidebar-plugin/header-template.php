<?php if (!defined('ABSPATH')) { exit; } ?>
<header id="cp-header" class="cp-site-header" role="banner" aria-label="Шапка сайта">
  <div class="cp-header__row">
    <button class="cp-header__burger cp-header__icon-btn" type="button" aria-label="Открыть меню" aria-controls="cp-sb__drawer" aria-expanded="false">
      <svg class="cp-header__icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"/></svg>
    </button>

    <button class="cp-header__sidebar-toggle cp-header__icon-btn" type="button" aria-label="Открыть боковое меню" aria-expanded="false" data-sidebar-toggle>
      <svg class="cp-header__icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"/></svg>
    </button>

    <a class="cp-header__logo cp-header__logo--mobile" href="<?php echo esc_url( home_url( '/' ) ); ?>" aria-label="Copella home">
      <img src="https://copella.live/wp-content/uploads/2024/10/clive.png" alt="Copella" />
    </a>

    <form class="cp-header__search-form" role="search" method="get" action="<?php echo esc_url( home_url( '/' ) ); ?>" aria-label="Поиск по сайту" autocomplete="off">
      <input class="cp-header__search-input" type="search" name="s" placeholder="Поиск..." value="<?php echo esc_attr( get_search_query() ); ?>" />
      <button class="cp-header__search-submit" type="submit" aria-label="Найти">
        <svg class="cp-header__icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6" stroke="currentColor" stroke-width="2" fill="none"/><path d="M20 20l-4.3-4.3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
      </button>
      <button class="cp-header__search-cancel" type="button" aria-label="Отменить поиск" data-search-cancel>
        <svg class="cp-header__icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"/></svg>
      </button>
    </form>

    <button class="cp-header__search-toggle cp-header__icon-btn" type="button" aria-label="Показать популярное" aria-expanded="false" data-search-toggle>
      <svg class="cp-header__icon cp-header__search-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6" stroke="currentColor" stroke-width="2" fill="none"/><path d="M20 20l-4.3-4.3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
      <svg class="cp-header__icon cp-header__close-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"/></svg>
    </button>
  </div>
  <div class="cp-header__search-panel" id="cp-search-panel" hidden>
    <div class="cp-popular">
      <div class="cp-popular__header">
        <div class="cp-popular__title">Популярное</div>
        <div class="cp-popular__controls">
          <button class="cp-popular__btn" type="button" aria-label="Назад" data-popular-prev>
            <svg class="cp-header__icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6l-6 6 6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"/></svg>
          </button>
          <button class="cp-popular__btn" type="button" aria-label="Вперед" data-popular-next>
            <svg class="cp-header__icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"/></svg>
          </button>
        </div>
      </div>
      <div class="cp-popular__scroller" data-popular-scroller>
        <ul class="cp-popular__list">
          <?php
          // Fetch popular posts (exclude pages)
          $popular = new WP_Query(array(
            'post_type' => 'post',
            'posts_per_page' => 12,
            'ignore_sticky_posts' => true,
            'orderby' => 'comment_count',
            'order' => 'DESC',
            'no_found_rows' => true,
          ));
          if ($popular->have_posts()):
            while ($popular->have_posts()): $popular->the_post();
              $thumb = get_the_post_thumbnail_url(get_the_ID(), 'thumbnail');
              if (!$thumb) { $thumb = 'https://via.placeholder.com/112x112/1a1a1a/ffffff?text=No+Image'; }
          ?>
          <li class="cp-popular__item">
            <a class="cp-popular__link" href="<?php echo esc_url( get_permalink() ); ?>" title="<?php echo esc_attr( get_the_title() ); ?>">
              <img class="cp-popular__thumb" src="<?php echo esc_url($thumb); ?>" alt="" loading="lazy"/>
              <div class="cp-popular__meta">
                <div class="cp-popular__name"><?php echo esc_html( get_the_title() ); ?></div>
                <div class="cp-popular__extra"><?php echo esc_html( get_the_date() ); ?></div>
              </div>
            </a>
          </li>
          <?php endwhile; wp_reset_postdata(); endif; ?>
        </ul>
      </div>
    </div>
  </div>
</header>

