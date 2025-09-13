# Copella Recorder - Обновление до Gilroy шрифта

## Версия 1.0 - Gilroy Edition

### Основные изменения:

1. **Шрифт Gilroy**
   - Заменен шрифт Manrope на Gilroy во всех файлах
   - Используется оригинальный шрифт с copella.live
   - Изменены CSS классы с `font-manrope` на `font-gilroy`

2. **Цветовая схема**
   - Убраны сине-белые оттенки (`accent-blue`)
   - Убраны все цветные эффекты и градиенты
   - Строгий минималистичный дизайн

3. **Новые микрофункции**
   - `animateElement()` - анимация элементов
   - `addRippleEffect()` - эффект волн при нажатии
   - `createProgressRing()` - кольца прогресса
   - Цветные эффекты отключены для строгого дизайна

4. **Улучшения UI**
   - Добавлены эффекты ripple для всех кнопок
   - Строгий минималистичный дизайн
   - Убраны все цветные кружочки и градиенты

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