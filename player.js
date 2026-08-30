(function () {
  function youtubeId(value) {
    var raw = (value || "").trim();
    if (!raw) return "";
    var watch = raw.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
    if (watch) return watch[1];
    var short = raw.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
    if (short) return short[1];
    var embed = raw.match(/embed\/([a-zA-Z0-9_-]{11})/);
    if (embed) return embed[1];
    if (/^[a-zA-Z0-9_-]{11}$/.test(raw)) return raw;
    return "";
  }

  function youtubeFrame(el, id) {
    var title = el.getAttribute("data-title") || "Video";
    var iframe = document.createElement("iframe");
    iframe.src = "https://www.youtube-nocookie.com/embed/" + encodeURIComponent(id);
    iframe.title = title;
    iframe.allow =
      "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    iframe.allowFullscreen = true;
    iframe.referrerPolicy = "strict-origin-when-cross-origin";
    el.innerHTML = "";
    el.appendChild(iframe);
  }

  function fileVideo(el, src) {
    var title = el.getAttribute("data-title") || "Video";
    var video = document.createElement("video");
    video.src = src;
    video.controls = true;
    video.playsInline = true;
    video.preload = "metadata";
    video.title = title;
    el.innerHTML = "";
    el.appendChild(video);
  }

  function pendingSlot(el) {
    var href = el.getAttribute("data-instagram") || "https://www.instagram.com/";
    var title = el.getAttribute("data-title") || "Video";
    el.innerHTML =
      '<div class="video-slot video-pending">' +
      '<span class="play" aria-hidden="true"></span>' +
      '<span class="video-cta">YouTube embed ready</span></div>' +
      '<p class="video-backup"><a href="' +
      href +
      '" target="_blank" rel="noopener noreferrer">Instagram backup — ' +
      title +
      "</a></p>";
  }

  function mount(el) {
    var file = (el.getAttribute("data-video") || "").trim();
    var id = youtubeId(el.getAttribute("data-youtube"));
    if (file) fileVideo(el, file);
    else if (id) youtubeFrame(el, id);
    else pendingSlot(el);
  }

  document.querySelectorAll(".player").forEach(mount);
})();

(function () {
  var flow = document.querySelector(".flow");
  var panels = document.querySelectorAll(".flow-details details");
  if (!flow || !panels.length) return;

  var steps = flow.querySelectorAll("a[href^='#step-']");

  function setCurrent(id) {
    steps.forEach(function (a) {
      a.classList.toggle("is-current", a.getAttribute("href") === "#" + id);
    });
  }

  steps.forEach(function (a) {
    a.addEventListener("click", function (e) {
      var id = (a.getAttribute("href") || "").slice(1);
      var target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      panels.forEach(function (d) {
        d.open = d.id === id;
      });
      setCurrent(id);
      target.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  });

  panels.forEach(function (d) {
    d.addEventListener("toggle", function () {
      if (d.open) setCurrent(d.id);
    });
  });
})();

(function () {
  var root = document.querySelector("[data-carousel]");
  if (!root) return;

  var slides = root.querySelectorAll(".carousel-window figure");
  var prev = root.querySelector("[data-carousel-prev]");
  var next = root.querySelector("[data-carousel-next]");
  var count = document.querySelector("[data-carousel-count]");
  var index = 0;

  function show(i) {
    index = (i + slides.length) % slides.length;
    slides.forEach(function (slide, n) {
      slide.classList.toggle("is-active", n === index);
    });
    if (count) count.textContent = index + 1 + " / " + slides.length;
  }

  if (prev) prev.addEventListener("click", function () { show(index - 1); });
  if (next) next.addEventListener("click", function () { show(index + 1); });

  root.addEventListener("keydown", function (e) {
    if (e.key === "ArrowLeft") show(index - 1);
    if (e.key === "ArrowRight") show(index + 1);
  });

  var startX = 0;
  root.addEventListener("touchstart", function (e) {
    if (e.changedTouches[0]) startX = e.changedTouches[0].clientX;
  }, { passive: true });
  root.addEventListener("touchend", function (e) {
    if (!e.changedTouches[0]) return;
    var dx = e.changedTouches[0].clientX - startX;
    if (dx > 40) show(index - 1);
    if (dx < -40) show(index + 1);
  }, { passive: true });

  show(0);
})();
