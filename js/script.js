/**
 * Главный файл — загружает остальные скрипты в правильном порядке.
 *
 * Порядок важен:
 * 1. utils.js      — хелперы $ и $$
 * 2. app.js        — параллакс курсора
 * 3. glitch.js     — эффект глитча в About
 * 4. preloader.js  — анимация загрузки
 * 5. reveal.js     — GSAP scroll-анимации
 * 6. particles.js  — частицы в About
 * 7. contact.js    — форма связи
 * 8. project-modal.js — модалка + Swiper (нужен PROJECTS_DATA и Swiper CDN)
 * 9. three-scene.js — Three.js (ES-модуль, отдельно)
 *
 * Чтобы добавить новый скрипт — вставьте путь в массив SCRIPTS
 * перед project-modal.js (если он от него зависит) или после.
 */
(function () {
  const SCRIPTS = [
    "js/utils.js",
    "js/app.js",
    "js/glitch.js",
    "js/terminal.js",
    "js/preloader.js",
    "js/reveal.js",
    "js/particles.js",
    "js/contact.js",
    "js/project-modal.js",
  ];

  /** Последовательная загрузка обычных скриптов */
  function loadScript(index) {
    if (index >= SCRIPTS.length) {
      loadThreeModule();
      return;
    }

    const script = document.createElement("script");
    script.src = SCRIPTS[index];
    script.onload = () => loadScript(index + 1);
    script.onerror = () => {
      console.error("[script.js] Не удалось загрузить:", SCRIPTS[index]);
      loadScript(index + 1);
    };
    document.body.appendChild(script);
  }

  /** Three.js подключается как ES-модуль — иначе import не сработает */
  function loadThreeModule() {
    const module = document.createElement("script");
    module.type = "module";
    module.src = "js/three-scene.js";
    document.body.appendChild(module);
  }

  loadScript(0);
})();
