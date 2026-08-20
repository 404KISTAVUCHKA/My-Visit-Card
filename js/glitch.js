/**
 * Глитч-эффект для фото в секции About.
 *
 * Три типа эффектов (classic, zone, wave) запускаются случайно.
 * Фото циклически меняются по таймеру — настройки в imageList и scheduleNextImageChange.
 */

// ========== 1. НАСТРОЙКИ СМЕНЫ ФОТО ==========
// Пути на фото
const imageList = [
  // "./img/my photo/MyPhoto1.webp",
  "./img/my photo/MyPhoto2.webp"
];
let currentImageIndex = 0; // индекс изначального фото

// Функция смены фото
function scheduleNextImageChange() {
  // Тут интервал 20-30 сек
  const delay = 20000 + Math.random() * 10000;
  setTimeout(() => changeToNextImage(), delay);
}

function changeToNextImage() {
  // Выбор следующего фото
  const nextIndex = (currentImageIndex + 1) % imageList.length;
  const newSrc = imageList[nextIndex];

  // Предзагрузка изображения
  const preloader = new Image();
  preloader.onload = () => {
    // Когда изображение полностью загружено – заменяем src у всех элементов
    img.src = newSrc;
    redLayer.src = newSrc;
    blueLayer.src = newSrc;
    // Обновляем геометрию (размеры, позиционирование)
    updateGeometry();
    // Запоминаем новый индекс
    currentImageIndex = nextIndex;
    // Планируем следующую смену
    scheduleNextImageChange();
  };
  preloader.onerror = () => {
    // Если фото не загрузилось – пробуем через секунду снова
    console.warn("Не удалось загрузить фото:", newSrc);
    setTimeout(() => changeToNextImage(), 1000);
  };
  preloader.src = newSrc;
}

// ========== 2. ВСЯ ОСТАЛЬНАЯ ЛОГИКА ГЛИТЧА ==========
const wrap = document.getElementById("glitchWrap");
const canvas = document.getElementById("fxCanvas");
const ctx = canvas.getContext("2d");
const img = document.getElementById("mainPhoto");
const redLayer = document.getElementById("redLayer");
const blueLayer = document.getElementById("blueLayer");

let effectActive = false;
let animFrame = null;
let nextTimer = null;
let currentEffect = null; // 'classic', 'zone', 'wave'

let imgRenderX = 0,
  imgRenderY = 0,
  imgRenderW = 0,
  imgRenderH = 0;
let naturalW = 0,
  naturalH = 0;
let containerW = 0,
  containerH = 0;

function updateGeometry() {
  if (!img.complete || img.naturalWidth === 0) return;
  const rect = wrap.getBoundingClientRect();
  containerW = rect.width;
  containerH = rect.height;
  naturalW = img.naturalWidth;
  naturalH = img.naturalHeight;
  const scale = Math.max(containerW / naturalW, containerH / naturalH);
  imgRenderW = naturalW * scale;
  imgRenderH = naturalH * scale;
  imgRenderX = (containerW - imgRenderW) / 2;
  imgRenderY = (containerH - imgRenderH) / 2;
  canvas.width = containerW;
  canvas.height = containerH;
  redLayer.style.width = "";
  redLayer.style.height = "";
  blueLayer.style.width = "";
  blueLayer.style.height = "";
  if (!effectActive) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.style.opacity = "0";
  }
}

function drawCleanImage() {
  ctx.drawImage(
    img,
    0,
    0,
    naturalW,
    naturalH,
    imgRenderX,
    imgRenderY,
    imgRenderW,
    imgRenderH,
  );
}

// ---------- ЭФФЕКТ №1 (классический) ----------
const rnd = (a, b) => Math.random() * (b - a) + a;
const rndi = (a, b) => Math.floor(rnd(a, b + 1));

function drawGlitchFrame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const w = canvas.width,
    h = canvas.height;
  const types = rndi(3, 8);
  for (let i = 0; i < types; i++) {
    const t = rndi(0, 4);
    if (t === 0) {
      const y = rnd(0, h);
      const sh = rnd(5, 50);
      const dx = rnd(-60, 60);
      ctx.drawImage(
        img,
        0,
        (y - imgRenderY) / (imgRenderH / naturalH),
        w / (imgRenderW / naturalW),
        sh / (imgRenderH / naturalH),
        imgRenderX + dx,
        y,
        imgRenderW,
        sh,
      );
    } else if (t === 1) {
      const bw = rnd(40, 220),
        bh = rnd(8, 60);
      const sx = rnd(0, naturalW - bw),
        sy = rnd(0, naturalH - bh);
      const dx = imgRenderX + (sx / naturalW) * imgRenderW + rnd(-80, 80);
      const dy = imgRenderY + (sy / naturalH) * imgRenderH;
      const dw = (bw / naturalW) * imgRenderW,
        dh = (bh / naturalH) * imgRenderH;
      ctx.drawImage(img, sx, sy, bw, bh, dx, dy, dw, dh);
    } else if (t === 2) {
      ctx.fillStyle =
        Math.random() > 0.5
          ? `rgba(255,230,0,${rnd(0.08, 0.25)})`
          : `rgba(0,255,255,${rnd(0.08, 0.25)})`;
      ctx.fillRect(0, rnd(0, h), w, rnd(1, 4));
    } else if (t === 3) {
      const x = rnd(0, w),
        y = rnd(0, h);
      ctx.fillStyle = `rgba(${rndi(0, 255)}, ${rndi(0, 255)}, ${rndi(0, 255)}, ${rnd(0.05, 0.25)})`;
      ctx.fillRect(x, y, rnd(2, 20), rnd(2, 20));
    } else {
      const yy = rnd(0, h);
      const grad = ctx.createLinearGradient(0, yy, 0, yy + 4);
      grad.addColorStop(0, "rgba(255,255,255,0)");
      grad.addColorStop(0.5, `rgba(255,255,255,${rnd(0.05, 0.18)})`);
      grad.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, yy, w, rnd(2, 8));
    }
  }
}

function runEffectClassic() {
  return new Promise((resolve) => {
    const duration = rnd(1600, 3200);
    const frameDelay = 80;
    let lastFrame = 0;
    let start = performance.now();
    canvas.style.opacity = "1";
    redLayer.style.opacity = rnd(0.15, 0.45);
    blueLayer.style.opacity = rnd(0.15, 0.45);
    const animate = (now) => {
      if (!effectActive || currentEffect !== "classic") return;
      if (now - lastFrame >= frameDelay) {
        redLayer.style.transform = `translate(${rnd(-12, 12)}px, ${rnd(-4, 4)}px)`;
        blueLayer.style.transform = `translate(${rnd(-12, 12)}px, ${rnd(-4, 4)}px)`;
        drawGlitchFrame();
        lastFrame = now;
      }
      if (now - start < duration) {
        animFrame = requestAnimationFrame(animate);
      } else {
        redLayer.style.opacity = "0";
        blueLayer.style.opacity = "0";
        redLayer.style.transform = "";
        blueLayer.style.transform = "";
        canvas.style.opacity = "0";
        setTimeout(() => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          resolve();
        }, 600);
        cancelAnimationFrame(animFrame);
      }
    };
    animFrame = requestAnimationFrame(animate);
  });
}

// ---------- ЭФФЕКТ №2 (локальные зоны) ----------
function drawZoneGlitch() {
  drawCleanImage();
  const zones = Math.floor(Math.random() * 5) + 2;
  for (let z = 0; z < zones; z++) {
    const type = Math.floor(Math.random() * 5);
    const zoneX = Math.random() * naturalW;
    const zoneY = Math.random() * naturalH;
    const zoneW = Math.min(naturalW - zoneX, 20 + Math.random() * 200);
    const zoneH = Math.min(naturalH - zoneY, 10 + Math.random() * 100);
    const scaleX = imgRenderW / naturalW,
      scaleY = imgRenderH / naturalH;
    const canvasX = imgRenderX + zoneX * scaleX;
    const canvasY = imgRenderY + zoneY * scaleY;
    const canvasW = zoneW * scaleX,
      canvasH = zoneH * scaleY;

    if (type === 0) {
      const shift = (Math.random() - 0.5) * 70;
      ctx.drawImage(
        img,
        zoneX,
        zoneY,
        zoneW,
        zoneH,
        canvasX + shift,
        canvasY,
        canvasW,
        canvasH,
      );
    } else if (type === 1) {
      const shiftX = (Math.random() - 0.5) * 60,
        shiftY = (Math.random() - 0.5) * 30;
      ctx.drawImage(
        img,
        zoneX,
        zoneY,
        zoneW,
        zoneH,
        canvasX + shiftX,
        canvasY + shiftY,
        canvasW,
        canvasH,
      );
      if (Math.random() > 0.6) {
        ctx.globalAlpha = 0.4;
        ctx.drawImage(
          img,
          zoneX,
          zoneY,
          zoneW,
          zoneH,
          canvasX - shiftX * 0.5,
          canvasY + shiftY * 0.8,
          canvasW,
          canvasH,
        );
        ctx.globalAlpha = 1;
      }
    } else if (type === 2) {
      ctx.fillStyle = `rgba(${Math.random() * 255}, ${Math.random() * 100}, ${Math.random() * 255}, 0.25)`;
      ctx.fillRect(canvasX, canvasY, canvasW, canvasH);
      ctx.globalAlpha = 0.7;
      ctx.drawImage(
        img,
        zoneX,
        zoneY,
        zoneW,
        zoneH,
        canvasX,
        canvasY,
        canvasW,
        canvasH,
      );
      ctx.globalAlpha = 1;
    } else if (type === 3) {
      const rShift = (Math.random() - 0.5) * 12,
        bShift = (Math.random() - 0.5) * 12;
      ctx.globalCompositeOperation = "screen";
      ctx.globalAlpha = 0.35;
      ctx.drawImage(
        img,
        zoneX,
        zoneY,
        zoneW,
        zoneH,
        canvasX + rShift,
        canvasY,
        canvasW,
        canvasH,
      );
      ctx.fillStyle = "#00ffff";
      ctx.globalAlpha = 0.35;
      ctx.drawImage(
        img,
        zoneX,
        zoneY,
        zoneW,
        zoneH,
        canvasX + bShift,
        canvasY,
        canvasW,
        canvasH,
      );
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 0.6;
      ctx.drawImage(
        img,
        zoneX,
        zoneY,
        zoneW,
        zoneH,
        canvasX,
        canvasY,
        canvasW,
        canvasH,
      );
      ctx.globalAlpha = 1;
    } else {
      const step = 4;
      for (let y = 0; y < canvasH; y += step) {
        for (let x = 0; x < canvasW; x += step) {
          if (Math.random() > 0.7) {
            ctx.fillStyle = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.5)`;
            ctx.fillRect(canvasX + x, canvasY + y, step, step);
          }
        }
      }
      ctx.drawImage(
        img,
        zoneX,
        zoneY,
        zoneW,
        zoneH,
        canvasX,
        canvasY,
        canvasW,
        canvasH,
      );
    }
  }
  if (Math.random() < 0.3) {
    ctx.fillStyle = `rgba(255,255,255, ${0.1 + Math.random() * 0.2})`;
    ctx.fillRect(
      0,
      Math.random() * canvas.height,
      canvas.width,
      2 + Math.random() * 6,
    );
  }
}

function runEffectZone(duration) {
  return new Promise((resolve) => {
    const frameDelay = 80;
    let lastFrame = 0;
    const start = performance.now();
    const step = (now) => {
      if (!effectActive || currentEffect !== "zone") return resolve();
      if (now - lastFrame >= frameDelay) {
        drawZoneGlitch();
        lastFrame = now;
      }
      if (now - start < duration) {
        animFrame = requestAnimationFrame(step);
      } else {
        cancelAnimationFrame(animFrame);
        resolve();
      }
    };
    animFrame = requestAnimationFrame(step);
  });
}

// ---------- ЭФФЕКТ №3 (волновая рябь) ----------
function drawWaveGlitch(time) {
  drawCleanImage();
  const w = canvas.width,
    h = canvas.height;
  const stripeH = 12 + Math.sin(time * 0.008) * 3;
  const steps = Math.ceil(h / stripeH);
  for (let i = 0; i <= steps; i++) {
    const yStart = i * stripeH;
    if (yStart > h) break;
    const currH = Math.min(stripeH, h - yStart);
    const shiftAmp =
      7 * Math.sin(time * 0.012 + i * 0.3) +
      3 * Math.cos(time * 0.007 + i * 0.2);
    const xShift = shiftAmp * 0.7;
    ctx.drawImage(
      img,
      0,
      (yStart - imgRenderY) / (imgRenderH / naturalH),
      w / (imgRenderW / naturalW),
      currH / (imgRenderH / naturalH),
      imgRenderX + xShift,
      yStart,
      imgRenderW,
      currH,
    );
    if (Math.sin(time * 0.025 + i * 0.5) > 0.7) {
      ctx.globalCompositeOperation = "screen";
      ctx.fillStyle = `hsla(${180 + Math.sin(time * 0.02) * 40}, 70%, 65%, 0.07)`;
      ctx.fillRect(imgRenderX, yStart, imgRenderW, currH);
      ctx.globalCompositeOperation = "source-over";
    }
  }
  if (Math.sin(time * 0.045) > 0.2) {
    ctx.globalCompositeOperation = "screen";
    ctx.globalAlpha = 0.08;
    const driftR = Math.sin(time * 0.05) * 2.8;
    const driftB = Math.cos(time * 0.045) * 2.5;
    ctx.drawImage(
      img,
      0,
      0,
      naturalW,
      naturalH,
      imgRenderX + driftR,
      imgRenderY,
      imgRenderW,
      imgRenderH,
    );
    ctx.fillStyle = "#ffaa88";
    ctx.globalAlpha = 0.07;
    ctx.drawImage(
      img,
      0,
      0,
      naturalW,
      naturalH,
      imgRenderX + driftB,
      imgRenderY,
      imgRenderW,
      imgRenderH,
    );
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;
  }
}

function runEffectWave(duration) {
  return new Promise((resolve) => {
    const frameDelay = 80;
    let lastFrame = 0;
    const start = performance.now();
    const step = (now) => {
      if (!effectActive || currentEffect !== "wave") return resolve();
      if (now - lastFrame >= frameDelay) {
        drawWaveGlitch(now - start);
        lastFrame = now;
      }
      if (now - start < duration) {
        animFrame = requestAnimationFrame(step);
      } else {
        cancelAnimationFrame(animFrame);
        resolve();
      }
    };
    animFrame = requestAnimationFrame(step);
  });
}

// ---------- Управление очередью эффектов ----------
async function resetAndSchedule() {
  if (nextTimer) clearTimeout(nextTimer);
  effectActive = false;
  currentEffect = null;
  if (animFrame) cancelAnimationFrame(animFrame);
  redLayer.style.opacity = "0";
  blueLayer.style.opacity = "0";
  redLayer.style.transform = "";
  blueLayer.style.transform = "";
  canvas.style.opacity = "0";
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  nextTimer = setTimeout(
    () => launchRandomEffect(),
    3000 + Math.random() * 5000,
  );
}

async function launchRandomEffect() {
  if (effectActive) return;
  updateGeometry();
  effectActive = true;
  const choice = Math.floor(Math.random() * 3);
  if (choice === 0) currentEffect = "classic";
  else if (choice === 1) currentEffect = "zone";
  else currentEffect = "wave";

  if (currentEffect === "classic") {
    canvas.style.opacity = "0";
    setTimeout(() => (canvas.style.opacity = "1"), 30);
    await runEffectClassic();
  } else {
    canvas.style.opacity = "0";
    await new Promise((r) => setTimeout(r, 60));
    canvas.style.opacity = "1";
    const duration = 1500 + Math.random() * 2000;
    if (currentEffect === "zone") await runEffectZone(duration);
    else await runEffectWave(duration);
    canvas.style.opacity = "0";
  }
  await resetAndSchedule();
}

// ---------- Инициализация ----------
let glitchStarted = false;

function startGlitchLoop() {
  if (glitchStarted) return;
  glitchStarted = true;
  updateGeometry();
  setTimeout(() => launchRandomEffect(), 600);
}

function onImageReady() {
  updateGeometry();
  if (redLayer) redLayer.src = img.src;
  if (blueLayer) blueLayer.src = img.src;
}

function init() {
  if (!wrap || !canvas || !img) return;

  if (img.complete && img.naturalWidth > 0) {
    onImageReady();
  } else {
    img.onload = onImageReady;
  }

  window.addEventListener("resize", () => {
    updateGeometry();
    if (!effectActive) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      canvas.style.opacity = "0";
      redLayer.style.opacity = "0";
      blueLayer.style.opacity = "0";
    }
  });

  window.addEventListener("load", () => {
    requestAnimationFrame(updateGeometry);
    const preloader = document.getElementById("preloader");
    if (preloader && !preloader.classList.contains("open")) {
      window.addEventListener(
        "preloader-done",
        () => {
          requestAnimationFrame(updateGeometry);
          setTimeout(() => {
            updateGeometry();
            startGlitchLoop();
          }, 400);
        },
        { once: true },
      );
    } else {
      startGlitchLoop();
    }
  });

  window.addEventListener("preloader-done", () => {
    setTimeout(updateGeometry, 2200);
  });

  new ResizeObserver(() => updateGeometry()).observe(wrap);

  scheduleNextImageChange();
}

init();
