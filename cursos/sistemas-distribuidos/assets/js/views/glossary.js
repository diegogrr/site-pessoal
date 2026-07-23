/* ============================================================
   views/glossary.js — Glossário geral
   Agrega os termos-chave de todos os tópicos JÁ CARREGADOS e
   carrega os demais sob demanda, exibindo tudo em ordem
   alfabética com indicação do tópico de origem.
   Namespace global: SD.views.glossary
   ============================================================ */

window.SD = window.SD || {};
SD.views = SD.views || {};

SD.views.glossary = function () {
  "use strict";

  var view = document.getElementById("app-view");
  view.innerHTML = SD.layout.viewContainer(
    '<div class="empty-state">Carregando glossário…</div>'
  );

  // Carrega todos os tópicos para reunir os termos
  var loads = SD.course.topics.map(function (t) {
    return SD.loader.loadTopic(t.id).catch(function () { return null; });
  });

  Promise.all(loads).then(function (contents) {
    var terms = [];

    contents.forEach(function (content, i) {
      if (!content || !content.glossary) return;
      var topic = SD.course.topics[i];
      content.glossary.forEach(function (g) {
        terms.push({ term: g.term, definition: g.definition, topic: topic });
      });
    });

    terms.sort(function (a, b) {
      return a.term.localeCompare(b.term, "pt-BR");
    });

    var listHtml = terms.length
      ? '<dl class="glossary-list">' +
        terms.map(function (t) {
          return (
            '<div class="glossary-item"><dt>' + t.term +
            ' <a class="badge" href="#/topico/' + t.topic.id + '" title="' + t.topic.title + '">Tópico ' + t.topic.id + "</a></dt>" +
            "<dd>" + t.definition + "</dd></div>"
          );
        }).join("") +
        "</dl>"
      : '<div class="empty-state">Os termos do glossário aparecerão aqui conforme o conteúdo dos tópicos for preenchido.</div>';

    view.innerHTML = SD.layout.viewContainer(
      "<h1>Glossário</h1>" +
      "<p>Termos-chave reunidos de todos os tópicos do curso.</p>" +
      listHtml
    );
    view.focus();
  });
};
