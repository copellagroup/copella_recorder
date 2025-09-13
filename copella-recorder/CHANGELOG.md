# Copella Recorder - Обновление до Girly шрифта

## Версия 1.0 - Girly Edition

### Основные изменения:

1. **Шрифт Girly**
   - Заменен шрифт Manrope на Girly во всех файлах
   - Обновлены ссылки на Google Fonts
   - Изменены CSS классы с `font-manrope` на `font-girly`

2. **Цветовая схема**
   - Убраны сине-белые оттенки (`accent-blue`)
   - Добавлены фиолетовые и розовые акценты (`accent-purple`, `accent-pink`)
   - Обновлены градиенты для более женственного стиля

3. **Новые микрофункции**
   - `animateElement()` - анимация элементов
   - `createGradientBackground()` - создание градиентных фонов
   - `addSparkleEffect()` - эффект блесток
   - `createFloatingButton()` - плавающие кнопки
   - `addRippleEffect()` - эффект волн при нажатии
   - `createProgressRing()` - кольца прогресса

4. **Улучшения UI**
   - Добавлены эффекты ripple для всех кнопок
   - Блестки на арт-обложках станций
   - Градиентные фоны для элементов
   - Новые CSS анимации

### Структура плагина:
```
copella-recorder/
├── copella-recorder.php (основной файл)
├── assets/
│   ├── css/
│   │   └── app.css (обновленные стили)
│   └── js/
│       ├── ui.js (новые микрофункции)
│       ├── player.js (обновленный плеер)
│       ├── config.js, dom.js, db.js, export.js
│       ├── init.js, modals.js, now-playing.js
│       ├── recording.js, scheduler.js, state.js
│       ├── stations.js, stats.js, storage.js
│       ├── stream-info.js, visualizer.js
│       └── mp3-encoder.js
├── templates/
│   └── player.php (обновленный шаблон)
├── README.md
└── CHANGELOG.md
```

### Установка:
1. Загрузите файл `copella-recorder-girly-v1.0.zip`
2. Установите через админ-панель WordPress
3. Активируйте плагин
4. Используйте шорткод `[copella_recorder]`

### Совместимость:
- WordPress 5.0+
- Современные браузеры с поддержкой CSS Grid и Flexbox
- Мобильные устройства