<?php
/**
 * Plugin Name: Copella UI (NextGen)
 * Description: Sidebar + Header with search. High-quality, low-jank. Mini rail on desktop with burger control. Burger drawer on mobile. Accessible and performant.
 * Version: 2.3.0
 * Author: Copella
 */

if (!defined('ABSPATH')) { exit; }

// Функция для определения страницы copella-recorder
function isCopellaRecorderPage() {
    // Проверяем URL
    $current_url = $_SERVER['REQUEST_URI'] ?? '';
    if (strpos($current_url, '/copella-recorder') !== false) {
        return true;
    }
    
    // Проверяем slug страницы
    if (is_page() && get_post_field('post_name') === 'copella-recorder') {
        return true;
    }
    
    // Проверяем наличие шорткода [copella_recorder] в контенте
    global $post;
    if ($post && has_shortcode($post->post_content, 'copella_recorder')) {
        return true;
    }
    
    // Проверяем по классу body (если он установлен)
    if (is_admin()) {
        return false;
    }
    
    // Дополнительная проверка через JavaScript будет выполнена на клиенте
    return false;
}

add_action('wp_enqueue_scripts', function () {
    // Skip loading for admin, REST API, AJAX, and cron requests
    if (is_admin() || wp_doing_ajax() || wp_doing_cron() || 
        (defined('REST_REQUEST') && REST_REQUEST)) {
        return;
    }
    
    // This is a UI plugin, only skip on specific contexts where sidebar isn't needed
    // For now, load on all frontend pages as it's core UI functionality
    
    $base = plugin_dir_path(__FILE__);
    $url  = plugin_dir_url(__FILE__);

    // Проверяем, находимся ли мы на странице copella-recorder
    $is_recorder_page = isCopellaRecorderPage();

    // Sidebar CSS - загружаем только если НЕ страница copella-recorder
    if (!$is_recorder_page) {
        $css_sidebar = $url . 'sidebar.css';
        wp_enqueue_style('cp-sidebar-nextgen', $css_sidebar, array(), file_exists($base.'sidebar.css') ? filemtime($base.'sidebar.css') : null);
    }

    // Header CSS - загружаем только если НЕ страница copella-recorder
    if (!$is_recorder_page) {
        $css_header = $url . 'header.css';
        if (file_exists($base.'header.css')) {
            wp_enqueue_style('cp-header-nextgen', $css_header, array('cp-sidebar-nextgen'), filemtime($base.'header.css'));
        }
    }

    // GSAP (for smoother, widely-compatible animations incl. older mobile browsers)
    $gsap_cdn = 'https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js';
    wp_register_script('gsap', $gsap_cdn, array(), '3.12.5', array('in_footer' => true));
    if (function_exists('wp_script_add_data')) { wp_script_add_data('gsap', 'strategy', 'defer'); }
    wp_enqueue_script('gsap');

    // Sidebar JS - загружаем только если НЕ страница copella-recorder
    if (!$is_recorder_page) {
        $js_sidebar = $url . 'sidebar.js';
        wp_register_script('cp-sidebar-nextgen', $js_sidebar, array('gsap'), file_exists($base.'sidebar.js') ? filemtime($base.'sidebar.js') : null, array('in_footer' => true));
        if (function_exists('wp_script_add_data')) { wp_script_add_data('cp-sidebar-nextgen', 'strategy', 'defer'); }
        wp_enqueue_script('cp-sidebar-nextgen');
    }

    // Header JS - загружаем только если НЕ страница copella-recorder
    if (!$is_recorder_page) {
        $js_header = $url . 'header.js';
        if (file_exists($base.'header.js')) {
            wp_register_script('cp-header-nextgen', $js_header, array(), filemtime($base.'header.js'), array('in_footer' => true));
            if (function_exists('wp_script_add_data')) { wp_script_add_data('cp-header-nextgen', 'strategy', 'defer'); }
            wp_enqueue_script('cp-header-nextgen');
        }
    }
}, 5);

add_action('wp_body_open', function() {
    static $rendered = false; if ($rendered) return; $rendered = true;
    
    // Проверяем, находимся ли мы на странице copella-recorder
    $is_recorder_page = isCopellaRecorderPage();
    
    // Показываем обычный хедер только если НЕ страница copella-recorder
    if (!$is_recorder_page) {
        include __DIR__ . '/header-template.php';
    }
    
    // Показываем сайдбар только если НЕ страница copella-recorder
    if (!$is_recorder_page) {
        include __DIR__ . '/sidebar-template.php';
    }
});

