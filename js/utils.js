/**
 * Утилиты DOM — общие хелперы для всего проекта.
 * Чтобы изменить селекторы глобально, правьте только этот файл.
 */
window.$ = (selector) => document.querySelector(selector);
window.$$ = (selector) => document.querySelectorAll(selector);
