(function () {
  var host = document.querySelector("[data-lure]");
  if (!host) return;
  var img = host.querySelector("[data-lure-art]");
  if (!img) return;
  var base = img.getAttribute("data-base") || img.getAttribute("src");

  function setFinish(id) {
    var btn = host.querySelector('[data-finish="' + id + '"]');
    if (!btn) return;
    img.src = btn.getAttribute("data-src") || base;
    img.style.filter = btn.getAttribute("data-filter") || "";
    img.alt = btn.getAttribute("aria-label") || "";
    host.querySelectorAll("[data-finish]").forEach(function (el) {
      el.classList.toggle("is-on", el.getAttribute("data-finish") === id);
    });
  }

  host.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-finish]");
    if (!btn) return;
    setFinish(btn.getAttribute("data-finish"));
  });
})();
