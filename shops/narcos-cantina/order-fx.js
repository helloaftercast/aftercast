(function () {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const layer = document.querySelector("[data-order-chat]");
  const nameEl = layer && layer.querySelector("[data-chat-name]");
  const textEl = layer && layer.querySelector("[data-order-text]");
  const ticksEl = layer && layer.querySelector(".ticks");
  const replyEl = layer && layer.querySelector("[data-reply-bubble]");
  const outEl = layer && layer.querySelector(".bubble.out");
  const inEl = layer && layer.querySelector(".bubble.in");
  let sending = false;

  function pop(el) {
    if (!el) return;
    el.classList.remove("is-pop");
    void el.offsetWidth;
    el.classList.add("is-pop");
  }

  function flyFrom(btn) {
    const dock = document.querySelector("[data-bag-dock]");
    pop(btn);
    if (!dock || dock.hidden) return;
    pop(dock);
    if (reduce) return;

    const name = btn.getAttribute("data-name") || "Added";
    const ghost = document.createElement("span");
    ghost.className = "fly-chip";
    ghost.textContent = name;
    const r0 = btn.getBoundingClientRect();
    const r1 = dock.getBoundingClientRect();
    const x0 = r0.left + r0.width / 2;
    const y0 = r0.top + r0.height / 2;
    const dx = r1.left + r1.width / 2 - x0;
    const dy = r1.top + r1.height / 2 - y0;
    ghost.style.left = x0 + "px";
    ghost.style.top = y0 + "px";
    document.body.appendChild(ghost);
    void ghost.offsetWidth;
    ghost.style.transform = "translate(calc(-50% + " + dx + "px), calc(-50% + " + dy + "px)) scale(0.18)";
    ghost.style.opacity = "0";
    window.setTimeout(function () {
      ghost.remove();
    }, 520);
  }

  document.addEventListener("click", function (e) {
    const addBtn = e.target.closest("[data-add]");
    if (addBtn) flyFrom(addBtn);
  });

  function go(href) {
    window.location.href = href;
  }

  function typeText(el, text, done) {
    if (reduce) {
      el.textContent = text;
      done();
      return;
    }
    var i = 0;
    var step = Math.max(3, Math.ceil(text.length / 40));
    var id = window.setInterval(function () {
      i += step;
      el.textContent = text.slice(0, i);
      var body = el.closest(".chat-body");
      if (body) body.scrollTop = body.scrollHeight;
      if (i >= text.length) {
        window.clearInterval(id);
        done();
      }
    }, 18);
  }

  window.playOrderChat = function (opts) {
    if (sending) return;
    sending = true;
    var text = opts.text || "";
    var href = opts.href;
    var copy = opts.copy;

    if (copy && navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).catch(function () {});
    }

    if (!layer || !href) {
      go(href);
      return;
    }

    if (nameEl) nameEl.textContent = layer.getAttribute("data-name") || "";
    if (replyEl) replyEl.textContent = layer.getAttribute("data-reply") || "Got it!";
    if (textEl) textEl.textContent = "";
    if (ticksEl) ticksEl.classList.remove("is-read");
    if (outEl) outEl.classList.remove("is-in");
    if (inEl) inEl.classList.remove("is-in");

    layer.hidden = false;
    document.body.classList.add("order-chat-open");
    window.setTimeout(function () {
      layer.classList.add("is-open");
      if (outEl) outEl.classList.add("is-in");
      typeText(textEl, text, function () {
        window.setTimeout(function () {
          if (ticksEl) ticksEl.classList.add("is-read");
        }, 280);
        window.setTimeout(function () {
          if (inEl) inEl.classList.add("is-in");
        }, 720);
        window.setTimeout(function () {
          go(href);
        }, 1600);
      });
    }, 40);
  };
})();
