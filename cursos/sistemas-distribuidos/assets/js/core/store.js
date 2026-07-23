/* ============================================================
   core/store.js — Persistência via cookies
   Guarda tema escolhido e progresso do estudante.
   Namespace global: SD.store
   ============================================================ */

window.SD = window.SD || {};

SD.store = (function () {
  "use strict";

  var COOKIE_DAYS = 365;

  function setCookie(name, value, days) {
    var expires = new Date(Date.now() + (days || COOKIE_DAYS) * 864e5).toUTCString();
    document.cookie =
      name + "=" + encodeURIComponent(value) +
      "; expires=" + expires + "; path=/; SameSite=Lax";
  }

  function getCookie(name) {
    var match = document.cookie.match(new RegExp("(?:^|;\\s*)" + name + "=([^;]*)"));
    return match ? decodeURIComponent(match[1]) : null;
  }

  function removeCookie(name) {
    document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
  }

  /* ---- Tema ---- */
  function getTheme() {
    return getCookie("sd_theme");
  }

  function setTheme(theme) {
    setCookie("sd_theme", theme);
  }

  /* ---- Progresso ----
     Formato: { "01": { visited: true, quizScore: 0.8, done: true }, ... } */
  function getProgress() {
    try {
      return JSON.parse(getCookie("sd_progress")) || {};
    } catch (e) {
      return {};
    }
  }

  function saveProgress(progress) {
    setCookie("sd_progress", JSON.stringify(progress));
  }

  function updateTopic(topicId, patch) {
    var progress = getProgress();
    progress[topicId] = Object.assign({}, progress[topicId], patch);
    saveProgress(progress);
    return progress;
  }

  function resetProgress() {
    removeCookie("sd_progress");
  }

  return {
    getTheme: getTheme,
    setTheme: setTheme,
    getProgress: getProgress,
    updateTopic: updateTopic,
    resetProgress: resetProgress
  };
})();
