/**
 * Scroll-анимации появления блоков через GSAP ScrollTrigger.
 *
 * Чтобы добавить анимацию новому блоку — повесьте на него класс .reveal.
 * Параметры (смещение, длительность, точка старта) меняются в объекте gsap.from.
 */
(function () {
  if (!window.gsap || !window.ScrollTrigger) return;

  gsap.registerPlugin(ScrollTrigger);

  gsap.utils.toArray(".reveal").forEach((item) => {
    gsap.from(item, {
      y: 120,
      opacity: 0,
      duration: 1.2,
      ease: "power3.out",
      scrollTrigger: {
        trigger: item,
        start: "top 85%",
      },
    });
  });
})();
