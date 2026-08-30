import * as THREE from "./vendor/three.module.js";

const FINISHES = {
  citrus: {
    head: "#3ec4e0",
    back: "#d4ee2a",
    belly: "#f7f3ea",
    blush: "#e8a8a0",
  },
  blossom: {
    head: "#f4a8bc",
    back: "#f6b8c8",
    belly: "#fff6f4",
    blush: "#ee7a96",
  },
  gulf: {
    head: "#4a90c8",
    back: "#7eb8e0",
    belly: "#f4f8fc",
    blush: "#9ec8e8",
  },
  pearl: {
    head: "#e8e2d6",
    back: "#efe8dc",
    belly: "#fffdf8",
    blush: "#e0d4c4",
  },
};

function hexRgb(hex) {
  var n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function mix(a, b, t) {
  return [
    a[0] + (b[0] - a[0]) * t,
    a[1] + (b[1] - a[1]) * t,
    a[2] + (b[2] - a[2]) * t,
  ];
}

function paintMap(spec) {
  var w = 1024;
  var h = 512;
  var c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  var g = c.getContext("2d");
  var img = g.createImageData(w, h);
  var head = hexRgb(spec.head);
  var back = hexRgb(spec.back);
  var belly = hexRgb(spec.belly);
  var blush = hexRgb(spec.blush);
  var x;
  var y;
  for (y = 0; y < h; y += 1) {
    var v = y / (h - 1);
    var bellyAmt = Math.pow(Math.sin(v * Math.PI), 1.35);
    for (x = 0; x < w; x += 1) {
      var u = x / (w - 1);
      var along;
      if (u < 0.2) along = mix(head, back, u / 0.2);
      else if (u < 0.78) along = mix(back, belly, (u - 0.2) / 0.9);
      else along = mix(back, belly, 0.55 + (u - 0.78) * 0.8);
      var col = mix(along, belly, bellyAmt * 0.82);
      var blushGate = Math.exp(-Math.pow((u - 0.42) / 0.16, 2)) * bellyAmt;
      col = mix(col, blush, blushGate * 0.45);
      var scale = 0;
      if (u > 0.14 && u < 0.88) {
        scale = Math.sin(u * 48) * Math.sin(v * 22) * (1 - bellyAmt * 0.4);
      }
      var i = (y * w + x) * 4;
      img.data[i] = Math.max(0, Math.min(255, col[0] + scale * 18));
      img.data[i + 1] = Math.max(0, Math.min(255, col[1] + scale * 16));
      img.data[i + 2] = Math.max(0, Math.min(255, col[2] + scale * 10));
      img.data[i + 3] = 255;
    }
  }
  g.putImageData(img, 0, 0);
  var tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  tex.needsUpdate = true;
  return tex;
}

function minnowBody() {
  var pts = [
    new THREE.Vector2(0.012, -1.42),
    new THREE.Vector2(0.04, -1.36),
    new THREE.Vector2(0.09, -1.22),
    new THREE.Vector2(0.145, -1.02),
    new THREE.Vector2(0.175, -0.78),
    new THREE.Vector2(0.188, -0.42),
    new THREE.Vector2(0.19, -0.08),
    new THREE.Vector2(0.178, 0.28),
    new THREE.Vector2(0.15, 0.62),
    new THREE.Vector2(0.11, 0.92),
    new THREE.Vector2(0.07, 1.14),
    new THREE.Vector2(0.035, 1.3),
    new THREE.Vector2(0.012, 1.4),
  ];
  var geo = new THREE.LatheGeometry(pts, 64);
  var pos = geo.attributes.position;
  var uv = geo.attributes.uv;
  var i;
  var yMin = 1e9;
  var yMax = -1e9;
  for (i = 0; i < pos.count; i += 1) {
    var yy = pos.getY(i);
    if (yy < yMin) yMin = yy;
    if (yy > yMax) yMax = yy;
  }
  for (i = 0; i < pos.count; i += 1) {
    var px = pos.getX(i);
    var py = pos.getY(i);
    var pz = pos.getZ(i);
    var along = 1 - (py - yMin) / (yMax - yMin);
    var around = (Math.atan2(pz, px) + Math.PI) / (Math.PI * 2);
    uv.setXY(i, along, around);
  }
  uv.needsUpdate = true;
  return geo;
}

function treble() {
  var g = new THREE.Group();
  var metal = new THREE.MeshStandardMaterial({
    color: 0x1c1c1c,
    metalness: 0.9,
    roughness: 0.28,
  });
  var ring = new THREE.Mesh(new THREE.TorusGeometry(0.048, 0.01, 12, 24), metal);
  g.add(ring);
  var k;
  for (k = 0; k < 3; k += 1) {
    var curve = new THREE.CubicBezierCurve3(
      new THREE.Vector3(0, -0.02, 0),
      new THREE.Vector3(0.02, -0.12, 0),
      new THREE.Vector3(0.05, -0.2, 0),
      new THREE.Vector3(0.09, -0.16, 0.02)
    );
    var tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 12, 0.009, 8, false), metal);
    var wrap = new THREE.Group();
    wrap.rotation.y = (k * Math.PI * 2) / 3;
    wrap.rotation.x = 0.15;
    wrap.add(tube);
    g.add(wrap);
  }
  return g;
}

function buildLure() {
  var root = new THREE.Group();
  var bodyMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    roughness: 0.18,
    metalness: 0.12,
    clearcoat: 1,
    clearcoatRoughness: 0.12,
    sheen: 0.25,
    sheenColor: new THREE.Color(0xfff6e8),
  });
  var body = new THREE.Mesh(minnowBody(), bodyMat);
  body.rotation.z = Math.PI / 2;
  root.add(body);

  var lipMat = new THREE.MeshPhysicalMaterial({
    color: 0xe8f6fa,
    roughness: 0.06,
    metalness: 0,
    transparent: true,
    opacity: 0.38,
    transmission: 0.72,
    thickness: 0.35,
    ior: 1.4,
  });
  var lip = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.018, 0.36), lipMat);
  lip.position.set(-1.48, -0.2, 0);
  lip.rotation.z = 0.48;
  root.add(lip);

  var white = new THREE.MeshStandardMaterial({ color: 0xf4f4f0, roughness: 0.35 });
  var pupil = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.2 });
  var glint = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.05 });
  [-1, 1].forEach(function (side) {
    var sclera = new THREE.Mesh(new THREE.SphereGeometry(0.068, 20, 16), white);
    sclera.position.set(-0.88, 0.03, side * 0.155);
    sclera.scale.set(0.85, 1, 1);
    root.add(sclera);
    var ball = new THREE.Mesh(new THREE.SphereGeometry(0.042, 16, 12), pupil);
    ball.position.set(-0.9, 0.03, side * 0.195);
    root.add(ball);
    var hi = new THREE.Mesh(new THREE.SphereGeometry(0.012, 8, 8), glint);
    hi.position.set(-0.91, 0.045, side * 0.22);
    root.add(hi);
  });

  var steel = new THREE.MeshStandardMaterial({ color: 0x8a8a8a, metalness: 0.95, roughness: 0.22 });
  var nose = new THREE.Mesh(new THREE.TorusGeometry(0.028, 0.007, 10, 18), steel);
  nose.position.set(-1.44, 0.02, 0);
  nose.rotation.y = Math.PI / 2;
  root.add(nose);

  var belly = treble();
  belly.position.set(-0.05, -0.24, 0);
  root.add(belly);
  var tail = treble();
  tail.position.set(1.12, -0.14, 0);
  tail.scale.setScalar(0.92);
  root.add(tail);

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
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: false });
  } catch (err) {
    if (fallback) fallback.hidden = false;
    canvas.hidden = true;
    return;
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0xe8e4dc, 1);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;
  renderer.shadowMap.enabled = true;

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(28, 2, 0.1, 40);
  camera.position.set(0.55, 0.72, 5.1);
  camera.lookAt(0.05, -0.12, 0);

  scene.add(new THREE.HemisphereLight(0xfff8ee, 0x8a847c, 0.95));
  var key = new THREE.DirectionalLight(0xffffff, 1.35);
  key.position.set(2.6, 3.2, 3.4);
  key.castShadow = true;
  scene.add(key);
  var fill = new THREE.DirectionalLight(0xfff1dc, 0.45);
  fill.position.set(-2.4, 1.2, 2);
  scene.add(fill);
  var rim = new THREE.DirectionalLight(0xd8ecff, 0.55);
  rim.position.set(-2.8, 0.6, -2.6);
  scene.add(rim);

  var floor = new THREE.Mesh(
    new THREE.CircleGeometry(3.2, 48),
    new THREE.MeshStandardMaterial({ color: 0xe8e4dc, roughness: 0.92, metalness: 0 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.55;
  scene.add(floor);

  var lure = buildLure();
  lure.traverse(function (n) {
    if (n.isMesh) n.castShadow = true;
  });
  scene.add(lure);

  var maps = {};
  Object.keys(FINISHES).forEach(function (id) {
    maps[id] = paintMap(FINISHES[id]);
  });

  var yaw = 0.42;
  var target = 0.42;

  function size() {
    var box = canvas.parentElement || host;
    var w = box.clientWidth || 640;
    var h = Math.max(380, Math.round(w * 0.62));
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
    if (e.target.closest("[data-lure-left]")) target -= Math.PI / 2;
    if (e.target.closest("[data-lure-right]")) target += Math.PI / 2;
  });

  window.addEventListener("resize", size);
  size();
  setFinish("citrus");

  function tick() {
    yaw += (target - yaw) * 0.1;
    lure.rotation.y = yaw;
    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  }
  tick();
}

boot();
