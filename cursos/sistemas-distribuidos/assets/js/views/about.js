/* ============================================================
   views/about.js — Sobre a disciplina
   Identificação das duas ofertas (SLTSIDO/ADS e SLTSISD/BCC),
   ementa/objetivos, bibliografia dos planos de ensino e gestão
   do progresso salvo.
   Namespace global: SD.views.about
   ============================================================ */

window.SD = window.SD || {};
SD.views = SD.views || {};

SD.views.about = function () {
  "use strict";

  var view = document.getElementById("app-view");
  var bib = SD.course.bibliography;

  function list(items) {
    return "<ul class=\"reference-list\">" +
      items.map(function (i) { return "<li>" + i + "</li>"; }).join("") +
      "</ul>";
  }

  var offeringsList = list(SD.course.offerings.map(function (o) {
    return "<strong>" + o.code + "</strong> · " + o.program +
      " (" + o.programShort + "), " + o.semester;
  }));

  view.innerHTML = SD.layout.viewContainer(
    "<h1>Sobre a disciplina</h1>" +

    '<section class="card">' +
    "<h2>Identificação</h2>" +
    "<p><strong>Componente curricular:</strong> " + SD.course.name + "<br>" +
    "<strong>Campus:</strong> " + SD.course.institution + "</p>" +
    "<p>A mesma disciplina é ofertada em dois cursos, com conteúdo programático " +
    "equivalente. Esta plataforma atende às duas turmas:</p>" +
    offeringsList +
    "</section>" +

    '<section class="card">' +
    "<h2>Objetivo</h2>" +
    "<p>" + SD.course.objectives.join(" ") + "</p>" +
    "</section>" +

    '<section class="card">' +
    "<h2>Bibliografia básica</h2>" + list(bib.basic) +
    "<h2>Bibliografia complementar</h2>" + list(bib.complementary) +
    '<p class="hint">Bibliografia comum aos dois planos de ensino. O plano do BCC ' +
    "(SLTSISD) acrescenta FREIRE, P. <em>Extensão ou Comunicação</em> (Paz e Terra, 2013) " +
    "e MORIMOTO, Carlos E. <em>Servidores Linux: guia prático</em> (Sul, 2008).</p>" +
    "</section>" +

    '<section class="card">' +
    "<h2>Seu progresso</h2>" +
    '<div id="about-progress"></div>' +
    "<p>O progresso é salvo por cookie apenas neste navegador.</p>" +
    '<button type="button" class="btn btn-secondary" id="btn-reset-progress">Apagar progresso salvo</button>' +
    "</section>"
  );

  SD.progress.renderBar(document.getElementById("about-progress"));

  document.getElementById("btn-reset-progress")
    .addEventListener("click", function () {
      if (SD.progress.reset()) {
        SD.progress.renderBar(document.getElementById("about-progress"));
      }
    });

  view.focus();
};
