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

  var track = root.querySelector(".carousel-track");
  var slides = root.querySelectorAll(".carousel-track figure");
  var prev = root.querySelector("[data-carousel-prev]");
  var next = root.querySelector("[data-carousel-next]");
  if (!track || !slides.length) return;

  var index = 0;

  function perView() {
    var n = parseInt(getComputedStyle(root).getPropertyValue("--per-view"), 10);
    return n > 0 ? n : 3;
  }

  function maxIndex() {
    return Math.max(0, slides.length - perView());
  }

  function show(i) {
    index = Math.max(0, Math.min(maxIndex(), i));
    var slide = slides[0];
    var styles = getComputedStyle(track);
    var gap = parseFloat(styles.columnGap || styles.gap) || 0;
    var step = slide.getBoundingClientRect().width + gap;
    track.style.transform = "translateX(" + (-index * step) + "px)";
    if (prev) prev.disabled = index <= 0;
    if (next) next.disabled = index >= maxIndex();
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

  window.addEventListener("resize", function () { show(index); });
  show(0);
})();

(function () {
  var gallery = document.querySelector(".gallery");
  if (!gallery) return;

  var overlay = document.createElement("div");
  overlay.className = "lightbox";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-label", "Original sample photo");
  overlay.innerHTML =
    '<button type="button" class="lightbox-close" aria-label="Close">×</button><img alt="">';
  document.body.appendChild(overlay);

  var big = overlay.querySelector("img");
  var closeBtn = overlay.querySelector(".lightbox-close");
  var lastFocus = null;
  var startX = 0;
  var dragged = false;

  function open(src, alt, from) {
    lastFocus = from;
    big.src = src;
    big.alt = alt || "";
    overlay.classList.add("is-open");
    document.body.style.overflow = "hidden";
    closeBtn.focus();
  }

  function close() {
    if (!overlay.classList.contains("is-open")) return;
    overlay.classList.remove("is-open");
    big.removeAttribute("src");
    document.body.style.overflow = "";
    if (lastFocus) lastFocus.focus();
  }

  gallery.addEventListener("pointerdown", function (e) {
    startX = e.clientX;
    dragged = false;
  });
  gallery.addEventListener("pointermove", function (e) {
    if (Math.abs(e.clientX - startX) > 24) dragged = true;
  });
  gallery.addEventListener("click", function (e) {
    var shot = e.target.closest(".zoom-shot");
    if (!shot) return;
    if (dragged) {
      e.preventDefault();
      return;
    }
    var href = shot.getAttribute("href");
    if (!href) return;
    e.preventDefault();
    var img = shot.querySelector("img");
    open(href, img ? img.alt : "", shot);
  });

  overlay.addEventListener("click", function (e) {
    if (e.target === overlay || e.target === closeBtn) close();
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") close();
  });
})();
