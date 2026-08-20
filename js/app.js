/**
 * Параллакс hero-слоёв — CSS-переменные --move-x / --move-y
 * обновляются при движении курсора.
 *
 * На тач-устройствах и при prefers-reduced-motion эффект отключён —
 * иначе слои «залипают» и мешают скроллу.
 */
(function () {
  const canParallax =
    window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!canParallax) return;

  const root = document.documentElement;

  document.addEventListener("mousemove", (e) => {
    root.style.setProperty(
      "--move-x",
      `${(e.clientX - window.innerWidth / 2) * -0.005}deg`,
    );
    root.style.setProperty(
      "--move-y",
      `${(e.clientY - window.innerHeight / 2) * 0.01}deg`,
    );
  });
})();
