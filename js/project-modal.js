/**
 * Модальное окно проекта + слайдер Swiper.
 */
(function () {
  const modal = document.getElementById("projectModal");
  if (!modal || !window.PROJECTS_DATA) return;

  const cards = document.querySelectorAll(".project-card[data-project-index]");
  const swiperEl = modal.querySelector(".project-modal__swiper");
  const track = modal.querySelector(".project-modal__track");
  const dotsWrap = modal.querySelector(".project-modal__dots");
  const titleEl = modal.querySelector(".project-modal__title");
  const shortEl = modal.querySelector(".project-modal__short");
  const descEl = modal.querySelector(".project-modal__desc");
  const techList = modal.querySelector(".project-modal__tech-list");

  const slideLabel = modal.querySelector(".project-modal__slide-label");
  const btnPrev = modal.querySelector(".project-modal__nav--prev");
  const btnNext = modal.querySelector(".project-modal__nav--next");
  const closeTargets = modal.querySelectorAll("[data-close]");

  const shell = modal.querySelector(".project-modal__shell");
  const gallery = modal.querySelector(".project-modal__gallery");
  const content = modal.querySelector(".project-modal__content");
  const backdrop = modal.querySelector(".project-modal__backdrop");

  let swiperInstance = null;
  let lastFocus = null;
  let slidesCount = 0;
  let openTween = null;
  let closeTween = null;

  function pad(num) {
    return String(num).padStart(2, "0");
  }

  function updateSlideUI(activeIndex) {
    const index = (activeIndex % slidesCount) + 1;

    if (slideLabel) {
      slideLabel.textContent = `img - ${pad(index)}`;
    }
  }

  function buildTech(tags) {
    techList.innerHTML = "";
    tags.forEach((tag) => {
      const li = document.createElement("li");
      li.textContent = tag;
      techList.appendChild(li);
    });
  }

  function lockScroll() {
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;
    document.body.style.paddingRight =
      scrollbarWidth > 0 ? `${scrollbarWidth}px` : "";
    document.body.classList.add("project-modal-open");
  }

  function unlockScroll() {
    document.body.classList.remove("project-modal-open");
    document.body.style.paddingRight = "";
  }

  function setClosedState() {
    if (!window.gsap) return;

    gsap.set(backdrop, { opacity: 0 });
    gsap.set(shell, { opacity: 0, y: 32, scale: 0.98 });
    gsap.set(gallery, { opacity: 0, x: -24 });
    gsap.set(content, { opacity: 0, x: 24 });
  }

  function initSwiper(images) {
    if (typeof Swiper === "undefined") {
      console.error("[project-modal] Swiper не загружен.");
      return;
    }

    if (swiperInstance) {
      swiperInstance.destroy(true, true);
      swiperInstance = null;
    }

    track.innerHTML = "";
    slidesCount = images.length;
    const canRewind = slidesCount > 1;

    images.forEach((src, i) => {
      const slide = document.createElement("div");
      slide.className = "swiper-slide project-modal__slide";
      slide.innerHTML = `<img src="${src}" alt="Слайд ${i + 1}" loading="eager" draggable="false" />`;
      track.appendChild(slide);
    });

    swiperInstance = new Swiper(swiperEl, {
      slidesPerView: 1,
      spaceBetween: 0,
      speed: 550,
      rewind: canRewind,
      allowTouchMove: canRewind,
      grabCursor: canRewind,
      watchOverflow: true,
      resistanceRatio: 0.85,

      keyboard: {
        enabled: true,
        onlyInViewport: true,
      },

      pagination: {
        el: dotsWrap,
        clickable: true,
        bulletClass: "project-modal__dot",
        bulletActiveClass: "is-active",
        renderBullet(index, className) {
          return `<button type="button" class="${className}" aria-label="Слайд ${index + 1}"></button>`;
        },
      },

      on: {
        init(swiper) {
          updateSlideUI(swiper.activeIndex);
        },
        slideChange(swiper) {
          updateSlideUI(swiper.activeIndex);
        },
      },
    });

    btnPrev.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!swiperInstance || slidesCount <= 1) return;
      swiperInstance.slidePrev();
    };

    btnNext.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!swiperInstance || slidesCount <= 1) return;
      swiperInstance.slideNext();
    };

    swiperInstance.update();
    swiperInstance.slideTo(0, 0);
  }

  function animateOpen() {
    if (!window.gsap) return;

    openTween?.kill();
    closeTween?.kill();

    const tl = gsap.timeline({
      defaults: { ease: "power2.out" },
      onComplete: () => {
        gsap.set([shell, gallery, content, backdrop], { clearProps: "willChange" });
      },
    });

    tl.to(backdrop, { opacity: 1, duration: 0.45 }, 0)
      .to(
        shell,
        { opacity: 1, y: 0, scale: 1, duration: 0.55 },
        0.04,
      )
      .to(gallery, { opacity: 1, x: 0, duration: 0.5 }, 0.12)
      .to(content, { opacity: 1, x: 0, duration: 0.5 }, 0.18);

    openTween = tl;
  }

  function openModal(projectIndex) {
    const data = window.PROJECTS_DATA[projectIndex];
    if (!data) return;

    lastFocus = document.activeElement;

    titleEl.textContent = data.title;
    if (shortEl) shortEl.textContent = data.short;
    descEl.textContent = data.description;
    buildTech(data.tech);

    const linkBtn = modal.querySelector(".project-modal__link-button");
    const linkWrap = modal.querySelector(".project-modal__actions");
    if (linkBtn && linkWrap) {
      const projectUrl = data.link?.[0];
      if (projectUrl) {
        linkBtn.href = projectUrl;
        linkWrap.style.display = "";
      } else {
        linkWrap.style.display = "none";
      }
    }

    setClosedState();
    lockScroll();

    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");

    initSwiper(data.images);

    requestAnimationFrame(() => {
      animateOpen();
    });

    modal.querySelector(".project-modal__close")?.focus();
  }

  function closeModal(scrollToProjects = false) {
    if (!modal.classList.contains("is-open")) return;

    const finish = () => {
      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "true");
      unlockScroll();

      btnPrev.onclick = null;
      btnNext.onclick = null;

      if (swiperInstance) {
        swiperInstance.destroy(true, true);
        swiperInstance = null;
      }

      if (window.gsap) {
        gsap.set([shell, gallery, content, backdrop], { clearProps: "all" });
      }

      if (lastFocus && typeof lastFocus.focus === "function") {
        lastFocus.focus();
      }

      if (scrollToProjects) {
        document.getElementById("projects")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    };

    openTween?.kill();

    if (window.gsap) {
      closeTween = gsap.timeline({
        onComplete: finish,
      });

      closeTween.to(backdrop, {
        opacity: 0,
        duration: 0.28,
        ease: "power2.in",
      });

      closeTween.to(
        shell,
        {
          opacity: 0,
          y: 16,
          scale: 0.98,
          duration: 0.32,
          ease: "power2.in",
        },
        0,
      );
    } else {
      finish();
    }
  }

  setClosedState();

  cards.forEach((card) => {
    card.addEventListener("click", () => {
      openModal(Number(card.dataset.projectIndex));
    });

    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openModal(Number(card.dataset.projectIndex));
      }
    });
  });

  closeTargets.forEach((el) => {
    el.addEventListener("click", () => {
      closeModal(el.classList.contains("project-modal__back"));
    });
  });

  document.addEventListener("keydown", (e) => {
    if (!modal.classList.contains("is-open")) return;

    if (e.key === "Escape") {
      closeModal(true);
      return;
    }

    if (e.key === "ArrowLeft") {
      swiperInstance?.slidePrev();
    }

    if (e.key === "ArrowRight") {
      swiperInstance?.slideNext();
    }
  });
})();
