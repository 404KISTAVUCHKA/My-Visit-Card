/**
 * Прелоадер — анимация появления бренда и открытие hero-секции.
 *
 * Показывается один раз за сессию вкладки (sessionStorage).
 * Перезагрузка страницы — без прелоадера; новая вкладка — снова с прелоадером.
 */
(function () {
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  window.scrollTo(0, 0);

  const STORAGE_KEY = "preloader-shown";

  const brand = $("#brand");
  const text = $("#brandText");
  const hero = $("#hero");
  const preloader = $("#preloader");

  if (!hero || !preloader) return;

  const scrollKeys = new Set([
    " ",
    "ArrowUp",
    "ArrowDown",
    "PageUp",
    "PageDown",
    "Home",
    "End",
  ]);

  function wasShownThisSession() {
    try {
      return sessionStorage.getItem(STORAGE_KEY) === "1";
    } catch {
      return false;
    }
  }

  function markShownThisSession() {
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {}
  }

  function preventScroll(e) {
    e.preventDefault();
  }

  function preventScrollKeys(e) {
    if (scrollKeys.has(e.key)) e.preventDefault();
  }

  function lockScroll() {
    document.documentElement.classList.add("preloader-active");
    document.body.classList.add("preloader-active");
    window.scrollTo(0, 0);
    window.addEventListener("wheel", preventScroll, { passive: false });
    window.addEventListener("touchmove", preventScroll, { passive: false });
    window.addEventListener("keydown", preventScrollKeys);
  }

  function unlockScroll() {
    document.documentElement.classList.remove("preloader-active");
    document.body.classList.remove("preloader-active");
    window.removeEventListener("wheel", preventScroll);
    window.removeEventListener("touchmove", preventScroll);
    window.removeEventListener("keydown", preventScrollKeys);
    window.scrollTo(0, 0);
  }

  function finishPreloader() {
    hero.classList.add("visible");
    preloader.classList.add("open");
    unlockScroll();
    window.dispatchEvent(new Event("preloader-done"));
  }

  /** Повторный заход в той же вкладке — пропускаем анимацию */
  if (wasShownThisSession()) {
    finishPreloader();
    return;
  }

  if (!brand || !text) return;

  lockScroll();

  window.addEventListener("load", () => {
    setTimeout(() => brand.classList.add("enter"), 400);
    setTimeout(() => text.classList.add("exit"), 4200);
    setTimeout(() => brand.classList.add("fade-out"), 5200);

    setTimeout(() => {
      markShownThisSession();
      finishPreloader();
    }, 6000);
  });
})();
