/* ============================================================
   ui/theme.js — Alternância de tema claro/escuro
   O tema é aplicado via atributo data-theme no <html> e
   persistido em cookie (SD.store).
   Namespace global: SD.theme
   ============================================================ */

window.SD = window.SD || {};

SD.theme = (function () {
  "use strict";

  var THEMES = ["light", "dark"];

  function apply(theme) {
    if (THEMES.indexOf(theme) === -1) theme = "light";
    document.documentElement.setAttribute("data-theme", theme);
    SD.store.setTheme(theme);
    var btn = document.getElementById("theme-toggle");
    if (btn) {
      btn.textContent = theme === "dark" ? "☀️" : "🌙";
      btn.setAttribute("aria-label",
        theme === "dark" ? "Mudar para tema claro" : "Mudar para tema escuro");
    }
  }

  function current() {
    return document.documentElement.getAttribute("data-theme") || "light";
  }

  function toggle() {
    apply(current() === "dark" ? "light" : "dark");
  }

  /** Aplica o tema salvo (ou a preferência do sistema) na inicialização. */
  function init() {
    var saved = SD.store.getTheme();
    if (!saved && window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches) {
      saved = "dark";
    }
    apply(saved || "light");
  }

  return { init: init, toggle: toggle, current: current };
})();
