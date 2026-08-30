import * as THREE from "./vendor/three.module.js";

const FINISHES = {
  citrus: {
    head: "#7ec8c4",
    back: "#d5e36a",
    belly: "#fff8ee",
    blush: "#f0c4b0",
    label: "Citrus",
  },
  blossom: {
    head: "#f4b4c4",
    back: "#f7c3d0",
    belly: "#fff6f4",
    blush: "#ee8fa8",
    label: "Blossom",
  },
  gulf: {
    head: "#6aa8d8",
    back: "#8ec4e6",
    belly: "#f3f8fc",
    blush: "#b7d4ea",
    label: "Gulf",
  },
  pearl: {
    head: "#ece6da",
    back: "#e8e2d4",
    belly: "#fffcf7",
    blush: "#e4d4c4",
    label: "Pearl",
  },
};

function paintMap(spec) {
  var c = document.createElement("canvas");
  c.width = 512;
  c.height = 256;
  var g = c.getContext("2d");
  var along = g.createLinearGradient(0, 0, 512, 0);
  along.addColorStop(0, spec.head);
  along.addColorStop(0.16, spec.head);
  along.addColorStop(0.34, spec.back);
  along.addColorStop(0.72, spec.back);
  along.addColorStop(1, spec.belly);
  g.fillStyle = along;
  g.fillRect(0, 0, 512, 256);

  var down = g.createLinearGradient(0, 0, 0, 256);
  down.addColorStop(0, "rgba(0,0,0,0)");
  down.addColorStop(0.42, "rgba(0,0,0,0)");
  down.addColorStop(0.62, spec.belly);
  down.addColorStop(1, spec.belly);
  g.fillStyle = down;
  g.fillRect(0, 0, 512, 256);

  g.globalAlpha = 0.35;
  g.fillStyle = spec.blush;
  g.beginPath();
  g.ellipse(250, 168, 70, 28, 0, 0, Math.PI * 2);
  g.fill();
  g.globalAlpha = 1;

  g.strokeStyle = "rgba(20,20,20,0.08)";
  g.lineWidth = 1;
  var i;
  for (i = 0; i < 18; i += 1) {
    g.beginPath();
    g.moveTo(80 + i * 20, 20);
    g.lineTo(60 + i * 20, 236);
    g.stroke();
  }

  var tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

function minnowBody() {
  var pts = [
    new THREE.Vector2(0.01, -1.18),
    new THREE.Vector2(0.05, -1.12),
    new THREE.Vector2(0.13, -0.98),
    new THREE.Vector2(0.2, -0.78),
    new THREE.Vector2(0.255, -0.42),
    new THREE.Vector2(0.27, -0.05),
    new THREE.Vector2(0.255, 0.35),
    new THREE.Vector2(0.2, 0.72),
    new THREE.Vector2(0.12, 0.98),
    new THREE.Vector2(0.045, 1.12),
    new THREE.Vector2(0.012, 1.18),
  ];
  return new THREE.LatheGeometry(pts, 48);
}

function hook(spread) {
  var g = new THREE.Group();
  var metal = new THREE.MeshStandardMaterial({
    color: 0x2a2a2a,
    metalness: 0.85,
    roughness: 0.35,
  });
  var ring = new THREE.Mesh(new THREE.TorusGeometry(0.055, 0.012, 10, 20), metal);
  g.add(ring);
  var k;
  for (k = 0; k < 3; k += 1) {
    var arm = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.008, 0.22, 8), metal);
    arm.position.y = -0.12;
    var wrap = new THREE.Group();
    wrap.rotation.z = (k * Math.PI * 2) / 3 + spread;
    wrap.rotation.x = 0.45;
    wrap.add(arm);
    g.add(wrap);
  }
  return g;
}

function buildLure() {
  var root = new THREE.Group();
  var bodyMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    roughness: 0.22,
    metalness: 0.08,
    clearcoat: 0.7,
    clearcoatRoughness: 0.2,
  });
  var body = new THREE.Mesh(minnowBody(), bodyMat);
  body.rotation.z = Math.PI / 2;
  root.add(body);

  var lipMat = new THREE.MeshPhysicalMaterial({
    color: 0xd8f4f8,
    roughness: 0.08,
    metalness: 0,
    transparent: true,
    opacity: 0.42,
    transmission: 0.55,
    thickness: 0.2,
  });
  var lip = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.02, 0.28), lipMat);
  lip.position.set(-1.22, -0.16, 0);
  lip.rotation.z = 0.55;
  root.add(lip);

  var eyeMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.25 });
  var irisMat = new THREE.MeshStandardMaterial({ color: 0x2a6b8a, roughness: 0.3 });
  [-1, 1].forEach(function (side) {
    var eye = new THREE.Mesh(new THREE.SphereGeometry(0.055, 16, 12), eyeMat);
    eye.position.set(-0.72, 0.04, side * 0.2);
    root.add(eye);
    var iris = new THREE.Mesh(new THREE.SphereGeometry(0.028, 12, 10), irisMat);
    iris.position.set(-0.74, 0.04, side * 0.248);
    root.add(iris);
  });

  var h1 = hook(0.15);
  h1.position.set(-0.15, -0.28, 0);
  h1.scale.setScalar(0.9);
  root.add(h1);
  var h2 = hook(-0.1);
  h2.position.set(0.85, -0.18, 0);
  h2.scale.setScalar(0.85);
  root.add(h2);

  root.userData.bodyMat = bodyMat;
  return root;
}

function boot() {
  var host = document.querySelector("[data-lure]");
  if (!host) return;
  var canvas = host.querySelector("canvas");
  var fallback = host.querySelector(".lure-fallback");
  if (!canvas) return;

  var renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
  } catch (err) {
    if (fallback) fallback.hidden = false;
    canvas.hidden = true;
    return;
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(32, 2, 0.1, 40);
  camera.position.set(0.35, 0.55, 4.2);
  camera.lookAt(0, -0.05, 0);

  scene.add(new THREE.HemisphereLight(0xfff6e8, 0x6a6560, 1.05));
  var key = new THREE.DirectionalLight(0xffffff, 1.15);
  key.position.set(2.2, 2.4, 3);
  scene.add(key);
  var rim = new THREE.DirectionalLight(0xcfe8ff, 0.45);
  rim.position.set(-3, 0.4, -2);
  scene.add(rim);

  var lure = buildLure();
  scene.add(lure);

  var maps = {};
  Object.keys(FINISHES).forEach(function (id) {
    maps[id] = paintMap(FINISHES[id]);
  });
  lure.userData.bodyMat.map = maps.citrus;
  lure.userData.bodyMat.needsUpdate = true;

  var yaw = 0.35;
  var dragging = false;
  var lastX = 0;
  var idle = true;
  var idleTimer = 0;

  function poke() {
    idle = false;
    window.clearTimeout(idleTimer);
    idleTimer = window.setTimeout(function () {
      idle = true;
    }, 2600);
  }

  function size() {
    var w = host.clientWidth || 640;
    var h = Math.max(280, Math.round(w * 0.48));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  function setFinish(id) {
    if (!maps[id]) return;
    lure.userData.bodyMat.map = maps[id];
    lure.userData.bodyMat.needsUpdate = true;
    host.querySelectorAll("[data-finish]").forEach(function (btn) {
      btn.classList.toggle("is-on", btn.getAttribute("data-finish") === id);
    });
  }

  host.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-finish]");
    if (btn) setFinish(btn.getAttribute("data-finish"));
    if (e.target.closest("[data-lure-left]")) {
      yaw -= 0.45;
      poke();
    }
    if (e.target.closest("[data-lure-right]")) {
      yaw += 0.45;
      poke();
    }
  });

  canvas.addEventListener("pointerdown", function (e) {
    dragging = true;
    poke();
    lastX = e.clientX;
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener("pointermove", function (e) {
    if (!dragging) return;
    poke();
    yaw += (e.clientX - lastX) * 0.01;
    lastX = e.clientX;
  });
  canvas.addEventListener("pointerup", function () {
    dragging = false;
  });
  canvas.addEventListener("pointercancel", function () {
    dragging = false;
  });

  window.addEventListener("resize", size);
  size();
  setFinish("citrus");

  function tick() {
    if (idle) yaw += 0.004;
    lure.rotation.y = yaw;
    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  }
  tick();
}

boot();
