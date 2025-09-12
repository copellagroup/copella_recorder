<?php
/**
 * Plugin Name: Copella Recorder
 * Description: Интернет-радио с записью эфира. Шорткод: [copella_recorder]
 * Version: 1.0.0
 * Author: Copella
 * Text Domain: copella-recorder
 */

if (!defined('ABSPATH')) { exit; }

define('COPEL_REC_PLUGIN_FILE', __FILE__);
define('COPEL_REC_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('COPEL_REC_PLUGIN_URL', plugin_dir_url(__FILE__));

// Enqueue front-end assets
add_action('wp_enqueue_scripts', function() {
    // Tailwind via CDN (match original)
    wp_enqueue_script('tailwind-cdn', 'https://cdn.tailwindcss.com', [], null, true);
    wp_add_inline_script('tailwind-cdn', 'tailwind.config = { theme: { extend: { colors: { "bg-color": "#0A0A0A", "panel-bg": "#1C1C1C", "text-primary": "#FFFFFF", "text-secondary": "#8A8A8E", "accent": "#FFFFFF", "accent-green": "#30D158", "accent-blue": "#0A84FF", "border-color": "#333333", "record": "#FF453A", "error": "#FF453A", "warning": "#FFD53A" }, fontFamily: { manrope: ["Manrope", "sans-serif"] }, borderRadius: { large: "24px", medium: "16px", small: "12px" }, transitionProperty: { width: "width" }, keyframes: { spin: { to: { transform: "rotate(360deg)" } }, "pulse-record-glow": { "0%, 100%": { boxShadow: "0 0 0 0px rgba(255, 69, 58, 0.7)" }, "70%": { boxShadow: "0 0 0 10px rgba(255, 69, 58, 0)" } }, "pulse-border": { "0%, 100%": { boxShadow: "0 0 0 0 rgba(255, 69, 58, 0.7)" }, "70%": { boxShadow: "0 0 0 8px rgba(255, 69, 58, 0)" } }, bounce: { "0%, 40%, 100%": { height: "2px" }, "20%": { height: "10px" } }, fadeInUp: { from: { opacity: 0, transform: "translateY(20px) scale(0.95)" }, to: { opacity: 1, transform: "translateY(0) scale(1)" } }, fadeOutDown: { from: { opacity: 1, transform: "translateY(0) scale(1)" }, to: { opacity: 0, transform: "translateY(20px) scale(0.95)" } } }, animation: { spin: "spin 1s linear infinite", "pulse-record-glow": "pulse-record-glow 1.5s infinite", "pulse-border": "pulse-border 1.5s infinite", bounce: "bounce 1.2s ease-in-out infinite", "fade-in-up": "fadeInUp 0.3s ease-out forwards", "fade-out-down": "fadeOutDown 0.3s ease-in forwards" } } } };', 'after');

    // Google font
    wp_enqueue_style('copella-manrope', 'https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;700;800&display=swap', [], null);

    // HLS.js & lamejs
    wp_enqueue_script('hls-js', 'https://cdn.jsdelivr.net/npm/hls.js@latest', [], null, true);
    wp_enqueue_script('lamejs', 'https://cdn.jsdelivr.net/npm/lamejs@1.2.1/lame.min.js', [], null, true);

    // Core styles (minor resets matching inline style)
    wp_enqueue_style('copella-recorder-styles', COPEL_REC_PLUGIN_URL . 'assets/css/app.css', [], filemtime(COPEL_REC_PLUGIN_DIR . 'assets/css/app.css'));

    // App scripts (module order)
    $deps = ['hls-js'];
    wp_enqueue_script('copella-config', COPEL_REC_PLUGIN_URL . 'assets/js/config.js', $deps, filemtime(COPEL_REC_PLUGIN_DIR . 'assets/js/config.js'), true);
    wp_enqueue_script('copella-state', COPEL_REC_PLUGIN_URL . 'assets/js/state.js', ['copella-config'], filemtime(COPEL_REC_PLUGIN_DIR . 'assets/js/state.js'), true);
    wp_enqueue_script('copella-dom', COPEL_REC_PLUGIN_URL . 'assets/js/dom.js', ['copella-state'], filemtime(COPEL_REC_PLUGIN_DIR . 'assets/js/dom.js'), true);
    wp_enqueue_script('copella-db', COPEL_REC_PLUGIN_URL . 'assets/js/db.js', ['copella-state'], filemtime(COPEL_REC_PLUGIN_DIR . 'assets/js/db.js'), true);
    wp_enqueue_script('copella-storage', COPEL_REC_PLUGIN_URL . 'assets/js/storage.js', ['copella-config'], filemtime(COPEL_REC_PLUGIN_DIR . 'assets/js/storage.js'), true);
    wp_enqueue_script('copella-ui', COPEL_REC_PLUGIN_URL . 'assets/js/ui.js', ['copella-dom'], filemtime(COPEL_REC_PLUGIN_DIR . 'assets/js/ui.js'), true);
    wp_enqueue_script('copella-player', COPEL_REC_PLUGIN_URL . 'assets/js/player.js', ['copella-ui', 'copella-storage'], filemtime(COPEL_REC_PLUGIN_DIR . 'assets/js/player.js'), true);
    wp_enqueue_script('copella-stations', COPEL_REC_PLUGIN_URL . 'assets/js/stations.js', ['copella-player'], filemtime(COPEL_REC_PLUGIN_DIR . 'assets/js/stations.js'), true);
    wp_enqueue_script('copella-modals', COPEL_REC_PLUGIN_URL . 'assets/js/modals.js', ['copella-stations'], filemtime(COPEL_REC_PLUGIN_DIR . 'assets/js/modals.js'), true);
    wp_enqueue_script('copella-scheduler', COPEL_REC_PLUGIN_URL . 'assets/js/scheduler.js', ['copella-modals'], filemtime(COPEL_REC_PLUGIN_DIR . 'assets/js/scheduler.js'), true);
    wp_enqueue_script('copella-recording', COPEL_REC_PLUGIN_URL . 'assets/js/recording.js', ['copella-player', 'lamejs'], filemtime(COPEL_REC_PLUGIN_DIR . 'assets/js/recording.js'), true);
    wp_enqueue_script('copella-visualizer', COPEL_REC_PLUGIN_URL . 'assets/js/visualizer.js', ['copella-player'], filemtime(COPEL_REC_PLUGIN_DIR . 'assets/js/visualizer.js'), true);
    wp_enqueue_script('copella-init', COPEL_REC_PLUGIN_URL . 'assets/js/init.js', ['copella-scheduler', 'copella-recording', 'copella-visualizer'], filemtime(COPEL_REC_PLUGIN_DIR . 'assets/js/init.js'), true);

    // Pass runtime data
    wp_localize_script('copella-config', 'CopellaRuntime', [
        'pluginUrl' => COPEL_REC_PLUGIN_URL,
        'ajaxUrl'   => admin_url('admin-ajax.php'),
    ]);
});

// Shortcode to render the app container
add_shortcode('copella_recorder', function() {
    ob_start();
    include COPEL_REC_PLUGIN_DIR . 'templates/player.php';
    return ob_get_clean();
});

