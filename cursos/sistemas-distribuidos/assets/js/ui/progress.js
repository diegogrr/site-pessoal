/* ============================================================
   ui/progress.js — Progresso do estudante
   Regras de conclusão e renderização da barra de progresso.
   Um tópico é considerado concluído quando o quiz de
   autoavaliação é respondido (ajuste a regra aqui se desejar).
   Namespace global: SD.progress
   ============================================================ */

window.SD = window.SD || {};

SD.progress = (function () {
  "use strict";

  function markVisited(topicId) {
    SD.store.updateTopic(topicId, { visited: true });
  }

  function markQuizDone(topicId, score) {
    SD.store.updateTopic(topicId, { quizScore: score, done: true });
    renderAll();
  }

  /** Marca o tópico como lido sem exigir o quiz (afordância de estudo). */
  function markDone(topicId) {
    SD.store.updateTopic(topicId, { done: true });
    renderAll();
  }

  function isDone(topicId) {
    var p = SD.store.getProgress();
    return !!(p[topicId] && p[topicId].done);
  }

  function summary() {
    var progress = SD.store.getProgress();
    var total = SD.course.topics.length;
    var done = SD.course.topics.filter(function (t) {
      return progress[t.id] && progress[t.id].done;
    }).length;
    return {
      total: total,
      done: done,
      percent: total ? Math.round((done / total) * 100) : 0
    };
  }

  /**
   * Renderiza uma barra de progresso dentro do elemento alvo.
   * @param {HTMLElement} el
   */
  function renderBar(el) {
    if (!el) return;
    var s = summary();
    el.innerHTML =
      '<div class="progress-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + s.percent + '">' +
      '  <div class="progress-bar-fill" style="width:' + s.percent + '%"></div>' +
      "</div>" +
      '<p class="progress-label">' + s.done + " de " + s.total +
      " tópicos concluídos (" + s.percent + "%)</p>";
  }

  /** Reset com confirmação (usado na página Sobre). */
  function reset() {
    if (window.confirm("Apagar todo o progresso salvo neste navegador?")) {
      SD.store.resetProgress();
      renderAll();
      return true;
    }
    return false;
  }

  /** Re-renderiza todos os indicadores visíveis (sidebar etc.). */
  function renderAll() {
    if (SD.layout && SD.layout.renderSidebar) {
      SD.layout.renderSidebar();
    }
  }

  return {
    markVisited: markVisited,
    markQuizDone: markQuizDone,
    markDone: markDone,
    isDone: isDone,
    summary: summary,
    renderBar: renderBar,
    reset: reset
  };
})();
