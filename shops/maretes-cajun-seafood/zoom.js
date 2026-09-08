(function () {
  const layer = document.querySelector("[data-zoom-layer]");
  if (!layer) return;

  const img = layer.querySelector("img");
  const back = layer.querySelector(".zoom-back");
  const ease = "cubic-bezier(.2,.82,.2,1)";
  let last = null;
  let closing = false;

  function fit(nw, nh) {
    const maxW = Math.min(window.innerWidth * 0.92, nw);
    const maxH = window.innerHeight * 0.88;
    const ratio = nw / nh;
    let w = maxW;
    let h = w / ratio;
    if (h > maxH) {
      h = maxH;
      w = h * ratio;
    }
    return {
      left: (window.innerWidth - w) / 2,
      top: (window.innerHeight - h) / 2,
      width: w,
      height: h
    };
  }

  function place(el, box, animate) {
    img.style.transition = animate
      ? "left .5s " + ease + ", top .5s " + ease + ", width .5s " + ease + ", height .5s " + ease
      : "none";
    img.style.left = box.left + "px";
    img.style.top = box.top + "px";
    img.style.width = box.width + "px";
    img.style.height = box.height + "px";
  }

  function openFrom(btn) {
    const srcImg = btn.querySelector("img") || btn;
    const src = btn.getAttribute("data-zoom") || srcImg.currentSrc;
    const start = srcImg.getBoundingClientRect();
    last = srcImg;
    closing = false;
    img.src = src;
    img.alt = srcImg.alt || "";
    layer.hidden = false;
    document.body.classList.add("zoom-lock");
    place(img, start, false);
    back.style.opacity = "0";
    requestAnimationFrame(function () {
      const nw = srcImg.naturalWidth || start.width * 2;
      const nh = srcImg.naturalHeight || start.height * 2;
      place(img, fit(nw, nh), true);
      back.style.transition = "opacity .35s ease";
      back.style.opacity = "1";
      layer.classList.add("is-open");
    });
  }

  function close() {
    if (layer.hidden || closing) return;
    closing = true;
    const end = last
      ? last.getBoundingClientRect()
      : { left: window.innerWidth / 2, top: window.innerHeight / 2, width: 24, height: 24 };
    place(img, end, true);
    back.style.opacity = "0";
    layer.classList.remove("is-open");
    window.setTimeout(function () {
      layer.hidden = true;
      document.body.classList.remove("zoom-lock");
      closing = false;
    }, 500);
  }

  document.addEventListener("click", function (e) {
    const btn = e.target.closest("[data-zoom]");
    if (btn) {
      e.preventDefault();
      openFrom(btn);
      return;
    }
    if (e.target.closest("[data-zoom-close]")) close();
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") close();
  });
})();
