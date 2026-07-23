/* ============================================================
   ui/reading.js — Auxílios de leitura da página de tópico
   Barra fina de progresso de leitura (sob o cabeçalho) e
   scroll-spy do índice "Nesta página". Autocontido: um único
   listener global que só age quando há um tópico na tela.
   Namespace global: SD.reading
   ============================================================ */

window.SD = window.SD || {};

SD.reading = (function () {
  "use strict";

  var bar, fill;

  function ensureBar() {
    if (bar) return;
    bar = document.createElement("div");
    bar.className = "readbar";
    bar.setAttribute("aria-hidden", "true");
    fill = document.createElement("i");
    bar.appendChild(fill);
    document.body.appendChild(bar);
  }

  /** Atualiza a barra e o índice conforme a rolagem. */
  function update() {
    ensureBar();
    var main = document.querySelector(".topic-main");
    if (!main) { bar.style.display = "none"; return; }
    bar.style.display = "block";

    var d = document.documentElement;
    var max = d.scrollHeight - d.clientHeight;
    var ratio = max > 0 ? d.scrollTop / max : 0;
    fill.style.width = (Math.max(0, Math.min(1, ratio)) * 100) + "%";

    var links = document.querySelectorAll(".topic-toc a[data-target]");
    if (!links.length) return;
    var threshold = window.innerHeight * 0.34;
    var current = links[0];
    Array.prototype.forEach.call(links, function (a) {
      var sec = document.getElementById(a.getAttribute("data-target"));
      if (sec && sec.getBoundingClientRect().top <= threshold) current = a;
    });
    Array.prototype.forEach.call(links, function (a) {
      a.classList.toggle("is-active", a === current);
    });
  }

  function init() {
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });
    window.addEventListener("hashchange", function () { setTimeout(update, 0); });
    update();
  }

  return { init: init, update: update };
})();
