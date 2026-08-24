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
    var id = youtubeId(el.getAttribute("data-youtube"));
    if (id) youtubeFrame(el, id);
    else pendingSlot(el);
  }

  document.querySelectorAll(".player").forEach(mount);
})();
