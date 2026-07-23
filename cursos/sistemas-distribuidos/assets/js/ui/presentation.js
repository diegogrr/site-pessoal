/* ============================================================
   ui/presentation.js — Modo apresentação para o docente
   Converte as seções do tópico atual em slides de tela cheia.
   Navegação: ← → (teclado), botões na barra inferior, Esc sai.
   Namespace global: SD.presentation
   ============================================================ */

window.SD = window.SD || {};

SD.presentation = (function () {
  "use strict";

  var layer = null;
  var slides = [];
  var index = 0;
  var active = false;

  function buildSlides(topicMeta, topicContent) {
    var list = [];

    // Numeração de livro didático, igual à da página do tópico:
    // capítulo N na capa, N.1, N.2… nos slides de cada seção.
    var chapter = SD.course.getTopicIndex(topicMeta.id) + 1;

    // Slide de capa
    list.push(
      '<section class="slide slide-cover">' +
      '<p class="slide-course-name">' + SD.course.name + " · Tópico " + topicMeta.id + "</p>" +
      "<h1>" + chapter + ". " + topicMeta.title + "</h1>" +
      "<p>" + (topicMeta.summary || "") + "</p>" +
      "</section>"
    );

    // Slides por seção. Preferência: slides autorais da seção
    // (section.slides = [{ title, html }], texto enxuto pensado para
    // projeção). Fallback: a seção inteira vira um único slide.
    (topicContent.sections || []).forEach(function (section, si) {
      var number = chapter + "." + (si + 1);
      var perSection = (section.slides && section.slides.length)
        ? section.slides
        : [{ title: section.title, html: section.html }];
      perSection.forEach(function (slide) {
        list.push(
          '<section class="slide">' +
          "<h2>" + number + " " + (slide.title || section.title) + "</h2>" +
          (slide.html || "") +
          "</section>"
        );
      });
    });

    return list;
  }

  function renderSlide() {
    var stage = layer.querySelector("#slide-stage");
    stage.innerHTML = slides[index];
    layer.querySelector(".slide-counter").textContent =
      (index + 1) + " / " + slides.length;
    // Slide mais alto que a tela: sinaliza que o conteúdo continua no scroll
    var slide = stage.querySelector(".slide");
    if (slide && slide.scrollHeight > slide.clientHeight + 1) {
      slide.classList.add("has-overflow");
    }
  }

  function next() { if (index < slides.length - 1) { index++; renderSlide(); } }
  function prev() { if (index > 0) { index--; renderSlide(); } }

  function onKeydown(e) {
    if (!active) return;
    if (e.key === "ArrowRight" || e.key === "PageDown" || e.key === " ") next();
    else if (e.key === "ArrowLeft" || e.key === "PageUp") prev();
    else if (e.key === "Escape") close();
  }

  /**
   * Abre o modo apresentação para um tópico já carregado.
   * @param {object} topicMeta — entrada do manifesto (SD.course)
   * @param {object} topicContent — conteúdo registrado (SD.content)
   */
  function open(topicMeta, topicContent) {
    layer = document.getElementById("presentation-layer");
    slides = buildSlides(topicMeta, topicContent);
    index = 0;
    active = true;

    layer.innerHTML =
      '<div id="slide-stage" style="display:contents"></div>' +
      '<div class="presentation-controls">' +
      '  <button type="button" class="btn-secondary btn" id="pres-exit">✕ Sair (Esc)</button>' +
      '  <span class="controls-hint">Use as setas ← → para navegar</span>' +
      '  <span>' +
      '    <button type="button" class="btn-ghost" id="pres-prev" aria-label="Slide anterior">←</button>' +
      '    <span class="slide-counter"></span>' +
      '    <button type="button" class="btn-ghost" id="pres-next" aria-label="Próximo slide">→</button>' +
      "  </span>" +
      "</div>";

    layer.hidden = false;
    layer.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    layer.querySelector("#pres-exit").addEventListener("click", close);
    layer.querySelector("#pres-prev").addEventListener("click", prev);
    layer.querySelector("#pres-next").addEventListener("click", next);
    document.addEventListener("keydown", onKeydown);

    // Tela cheia, quando suportado (ignora recusa do navegador)
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(function () {});
    }

    renderSlide();
  }

  function close() {
    if (!layer) return;
    active = false;
    layer.hidden = true;
    layer.setAttribute("aria-hidden", "true");
    layer.innerHTML = "";
    document.body.style.overflow = "";
    document.removeEventListener("keydown", onKeydown);
    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(function () {});
    }
  }

  return { open: open, close: close };
})();
