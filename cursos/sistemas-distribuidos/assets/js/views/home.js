/* ============================================================
   views/home.js — Página inicial
   Herói com a trilha desenhada como uma rede de tópicos
   (constelação: nós acesos = concluídos, nó anelado = atual),
   progresso do curso e grade de tópicos.
   Namespace global: SD.views.home
   ============================================================ */

window.SD = window.SD || {};
SD.views = SD.views || {};

SD.views.home = function () {
  "use strict";

  var view = document.getElementById("app-view");
  var progress = SD.store.getProgress();
  var topics = SD.course.topics;
  var s = SD.progress.summary();

  function isDone(id) { return !!(progress[id] && progress[id].done); }
  function pad(n) { return (n < 10 ? "0" : "") + n; }

  var firstUndone = null;
  for (var i = 0; i < topics.length; i++) {
    if (!isDone(topics[i].id)) { firstUndone = topics[i]; break; }
  }

  /* ---- Cards da trilha ---- */
  var cards = topics.map(function (topic) {
    var done = isDone(topic.id);
    return (
      '<a class="topic-card' + (done ? " is-done" : "") + '" href="#/topico/' + topic.id + '">' +
      '<span class="topic-card-number">Tópico ' + topic.id + "</span>" +
      "<h3>" + topic.title + "</h3>" +
      '<p class="topic-card-summary">' + topic.summary + "</p>" +
      '<span class="topic-card-status">' + (done ? "✓ concluído" : "○ a fazer") + "</span>" +
      "</a>"
    );
  }).join("");

  var continueHref = firstUndone ? "#/topico/" + firstUndone.id : "#/topico/" + topics[0].id;
  var continueLabel = firstUndone
    ? "Continuar → Tópico " + firstUndone.id + " · " + firstUndone.title
    : "Revisar a trilha";

  /* ---- Herói ---- */
  var heroProgress =
    '<div class="hero-progress" title="Progresso do curso">' +
    '<span class="lbl">' + pad(s.done) + " / " + s.total + "</span>" +
    '<span class="track"><span class="fill" style="width:' + s.percent + '%"></span></span>' +
    '<span class="lbl">' + s.percent + "% concluído</span>" +
    "</div>";

  view.innerHTML = SD.layout.viewContainer(
    '<section class="hero">' +
    "<div>" +
    '<p class="eyebrow hero-eyebrow">' + SD.course.institution + " · " +
    SD.course.program + "</p>" +
    '<h1>A rede é o <span class="hero-em">computador</span>.</h1>' +
    '<p class="hero-lead">' + SD.course.description + "</p>" +
    '<div class="hero-cta">' +
    '<a class="btn" href="' + continueHref + '">' + continueLabel + "</a>" +
    '<a class="btn btn-secondary" href="#trilha">Ver a trilha</a>' +
    "</div>" +
    heroProgress +
    "</div>" +
    buildConstellation(topics, isDone, firstUndone) +
    "</section>" +

    '<div class="section-head" id="trilha">' +
    "<h2>Trilha do curso</h2>" +
    '<span class="hint">Siga a ordem sugerida ou navegue livremente</span>' +
    "</div>" +
    '<div class="topic-grid">' + cards + "</div>"
  );

  view.focus();
};

/* ------------------------------------------------------------
   Constelação: os tópicos como nós de uma rede (SVG inline).
   Posições fixas e agradáveis para 12 tópicos; se o número
   mudar, cai num arranjo em arco simples.
   ------------------------------------------------------------ */
function buildConstellation(topics, isDone, current) {
  "use strict";

  var P = [
    [40, 55], [104, 40], [168, 58], [238, 48],
    [250, 118], [182, 132], [112, 120], [46, 140],
    [60, 206], [130, 222], [200, 210], [254, 196]
  ];
  var E = [
    [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7],
    [7, 8], [8, 9], [9, 10], [10, 11], [1, 6], [3, 5], [6, 9]
  ];

  var pos = topics.map(function (t, i) {
    if (i < P.length) return P[i];
    // fallback em arco para contagens diferentes de 12
    var a = Math.PI * (0.15 + 0.7 * (i / Math.max(1, topics.length - 1)));
    return [40 + 220 * (i / Math.max(1, topics.length - 1)), 150 - 90 * Math.sin(a)];
  });

  var edges = E.filter(function (e) { return e[0] < pos.length && e[1] < pos.length; })
    .map(function (e) {
      var a = pos[e[0]], b = pos[e[1]];
      var done = isDone(topics[e[0]].id) && isDone(topics[e[1]].id);
      return '<path class="cn-edge' + (done ? " is-done" : "") + '" d="M' +
        a[0] + " " + a[1] + " L" + b[0] + " " + b[1] + '"/>';
    }).join("");

  var nodes = topics.map(function (t, i) {
    var p = pos[i];
    var done = isDone(t.id);
    var isCur = current && t.id === current.id;
    var cls = "cn-node" + (done ? " is-done" : "") + (isCur ? " is-current" : "");
    var ring = isCur ? '<circle class="ring" cx="' + p[0] + '" cy="' + p[1] + '" r="18"/>' : "";
    return '<g class="' + cls + '">' + ring +
      '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="13"/>' +
      '<text x="' + p[0] + '" y="' + p[1] + '">' + t.id + "</text></g>";
  }).join("");

  // trajeto da mensagem em trânsito (primeiras arestas) — enfeite animado
  var msgPath = "M" + P[0][0] + " " + P[0][1] + " L" + P[1][0] + " " + P[1][1] +
    " L" + P[2][0] + " " + P[2][1] + " L" + P[3][0] + " " + P[3][1];
  var msg = '<circle class="cn-msg" r="3.2" style="offset-path: path(\'' + msgPath + '\');"></circle>';

  return (
    '<div class="constellation" aria-label="Mapa da trilha do curso como uma rede de tópicos">' +
    '<svg viewBox="0 0 300 280" role="img" aria-hidden="true">' +
    edges + msg + nodes +
    "</svg>" +
    '<span class="cap">A trilha como um sistema distribuído · nós acesos = concluídos</span>' +
    "</div>"
  );
}
