/**
 * Three.js — 3D-логотип на прелоадере.
 *
 * Файл подключается как ES-модуль (type="module"), потому что Three.js
 * импортируется через import map / CDN ESM. Не переводите этот файл
 * на обычный <script> без сборщика — импорты перестанут работать.
 *
 * Чтобы сменить модель — замените путь в GLTFLoader.load("./logo.glb").
 * Скорость вращения — model.rotation.y += 0.01 в функции animate.
 */
import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js?module";
import { GLTFLoader } from "https://unpkg.com/three@0.160.0/examples/jsm/loaders/GLTFLoader.js?module";

const logoWrap = document.getElementById("logoWrap");
const fallback = document.getElementById("fallbackLogo");

if (!logoWrap) {
  console.warn("[three-scene] #logoWrap не найден — сцена не инициализирована.");
} else {
  /* ---------- Сцена, камера, рендерер ---------- */
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.z = 10;

  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
  });

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  logoWrap.appendChild(renderer.domElement);

  /** Подгоняем canvas под размер контейнера при ресайзе */
  function syncRendererSize() {
    const size = logoWrap.clientWidth || 120;
    renderer.setSize(size, size);
    camera.aspect = 1;
    camera.updateProjectionMatrix();
  }

  syncRendererSize();
  window.addEventListener("resize", syncRendererSize);

  /* ---------- Освещение ---------- */
  scene.add(new THREE.AmbientLight(0xffffff, 3));

  const light = new THREE.DirectionalLight(0xffffff, 4);
  light.position.set(5, 8, 7);

  const fill = new THREE.DirectionalLight(0xffffff, 2);
  fill.position.set(-5, -2, 4);

  scene.add(light, fill);

  /* ---------- Загрузка GLB-модели ---------- */
  let model;

  new GLTFLoader().load(
    "./logo.glb",

    (gltf) => {
      model = gltf.scene;

      model.traverse((child) => {
        if (!child.isMesh) return;

        child.material = new THREE.MeshStandardMaterial({
          color: 0xffffff,
          metalness: 0.35,
          roughness: 0.25,
        });
      });

      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());

      model.position.sub(center);
      model.scale.set(0.2, 0.2, 0.2);

      scene.add(model);
    },

    undefined,

    () => {
      renderer.domElement.style.display = "none";
      if (fallback) fallback.style.display = "flex";
    },
  );

  /* ---------- Цикл рендеринга ---------- */
  (function animate() {
    requestAnimationFrame(animate);

    if (model) {
      model.rotation.y += 0.01;
    }

    renderer.render(scene, camera);
  })();
}
