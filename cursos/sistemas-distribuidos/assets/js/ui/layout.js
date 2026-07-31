/* ============================================================
   ui/layout.js — Layout consistente (cabeçalho, sidebar, rodapé)
   Renderizados uma única vez por JS para que qualquer mudança
   de layout seja feita aqui, valendo para o site inteiro.
   Namespace global: SD.layout
   ============================================================ */

window.SD = window.SD || {};

SD.layout = (function () {
  "use strict";

  function renderHeader() {
    var header = document.getElementById("app-header");
    header.innerHTML =
      '<div class="header-inner">' +
      '  <a class="header-brand" href="#/">' +
      '    <svg class="brand-mark" width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden="true">' +
      '      <path d="M6 7 L20 6 M20 6 L19 19 M19 19 L7 19 M7 19 L6 7 M6 7 L19 19" stroke="var(--color-border)" stroke-width="1.3"/>' +
      '      <circle cx="6" cy="7" r="3" fill="var(--color-brand)"/>' +
      '      <circle cx="20" cy="6" r="2.4" fill="var(--color-accent)"/>' +
      '      <circle cx="19" cy="19" r="3" fill="var(--color-brand)"/>' +
      '      <circle cx="7" cy="19" r="2.2" fill="var(--color-text-muted)"/>' +
      "    </svg>" +
      "    <span>" + SD.course.name + "</span>" +
      '    <span class="brand-code">' + SD.course.code + "</span>" +
      "  </a>" +
      '  <span class="header-spacer"></span>' +
      '  <nav class="header-nav" aria-label="Navegação principal">' +
      '    <a href="#/" data-nav="/">Início</a>' +
      '    <a href="#/glossario" data-nav="/glossario">Glossário</a>' +
      '    <a href="#/sobre" data-nav="/sobre">Sobre a disciplina</a>' +
      "  </nav>" +
      '  <div class="header-actions">' +
      '    <button id="theme-toggle" class="btn-ghost" type="button" aria-label="Alternar tema">🌙</button>' +
      "  </div>" +
      "</div>";

    document.getElementById("theme-toggle")
      .addEventListener("click", SD.theme.toggle);
  }

  function renderSidebar() {
    var sidebar = document.getElementById("app-sidebar");
    var path = SD.router.currentPath();

    var itemsHtml = SD.course.topics.map(function (topic) {
      var isActive = path === "/topico/" + topic.id;
      var isDone = SD.progress.isDone(topic.id);
      var classes = "topic-link" +
        (isActive ? " is-active" : "") +
        (isDone ? " is-done" : "");
      return (
        "<li>" +
        '<a class="' + classes + '" href="#/topico/' + topic.id + '" title="' + topic.title + '">' +
        '<span class="topic-number">' + (isDone ? "✓" : topic.id) + "</span>" +
        '<span class="topic-label">' + topic.title + "</span>" +
        "</a></li>"
      );
    }).join("");

    sidebar.innerHTML =
      '<div class="sidebar-progress" id="sidebar-progress"></div>' +
      '<p class="sidebar-title">Trilha de tópicos</p>' +
      '<ul class="topic-list">' + itemsHtml + "</ul>";

    SD.progress.renderBar(document.getElementById("sidebar-progress"));
  }

  function renderFooter() {
    var footer = document.getElementById("app-footer");
    var offerings = SD.course.offerings.map(function (o) {
      return o.code + " (" + o.programShort + ", " + o.semester + ")";
    }).join(" · ");

    footer.innerHTML =
      "<p>" + SD.course.name + " · " + SD.course.institution + " · " + offerings + "</p>";
  }

  /** Destaca o link ativo no menu do cabeçalho. */
  function highlightNav() {
    var path = SD.router.currentPath();
    document.querySelectorAll(".header-nav a").forEach(function (a) {
      a.classList.toggle("is-active", a.getAttribute("data-nav") === path);
    });
  }

  /** Container padrão usado por todas as views. */
  function viewContainer(innerHtml) {
    return '<div class="view-container">' + innerHtml + "</div>";
  }

  function init() {
    renderHeader();
    renderSidebar();
    renderFooter();
  }

  return {
    init: init,
    renderSidebar: renderSidebar,
    highlightNav: highlightNav,
    viewContainer: viewContainer
  };
})();
