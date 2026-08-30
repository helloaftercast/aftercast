(function () {
  var host = document.querySelector("[data-lure]");
  if (!host) return;
  var img = host.querySelector("[data-lure-art]");
  if (!img) return;

  function setFinish(id) {
    var btn = host.querySelector('[data-finish="' + id + '"]');
    if (!btn) return;
    var src = btn.getAttribute("data-art");
    if (src) img.src = src;
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
