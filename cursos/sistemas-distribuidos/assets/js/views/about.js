/* ============================================================
   views/about.js — Sobre a disciplina
   Identificação, ementa/objetivos, bibliografia (do plano de
   ensino SLTSIDO) e gestão do progresso salvo.
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

  view.innerHTML = SD.layout.viewContainer(
    "<h1>Sobre a disciplina</h1>" +

    '<section class="card">' +
    "<h2>Identificação</h2>" +
    "<p><strong>Componente curricular:</strong> " + SD.course.name + " (" + SD.course.code + ")<br>" +
    "<strong>Curso:</strong> " + SD.course.program + "<br>" +
    "<strong>Campus:</strong> " + SD.course.institution + "<br>" +
    "<strong>Semestre:</strong> " + SD.course.semester + "</p>" +
    "</section>" +

    '<section class="card">' +
    "<h2>Objetivo</h2>" +
    "<p>" + SD.course.objectives.join(" ") + "</p>" +
    "</section>" +

    '<section class="card">' +
    "<h2>Bibliografia básica</h2>" + list(bib.basic) +
    "<h2>Bibliografia complementar</h2>" + list(bib.complementary) +
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
