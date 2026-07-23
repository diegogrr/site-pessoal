/* ============================================================
   ui/quiz.js — Quiz de autoavaliação
   Renderiza as questões definidas no arquivo do tópico,
   corrige no clique e registra a conclusão no progresso.
   Namespace global: SD.quiz
   ============================================================ */

window.SD = window.SD || {};

SD.quiz = (function () {
  "use strict";

  /**
   * Renderiza o quiz de um tópico dentro do elemento alvo.
   * @param {HTMLElement} el — container
   * @param {string} topicId
   * @param {Array} questions — [{ question, options[], answer, explanation }]
   */
  function render(el, topicId, questions) {
    if (!el) return;
    if (!questions || !questions.length) {
      el.innerHTML =
        '<div class="empty-state">As questões de autoavaliação deste tópico serão adicionadas em breve.</div>';
      return;
    }

    var html = questions.map(function (q, qi) {
      var options = q.options.map(function (opt, oi) {
        var inputId = "q" + qi + "-o" + oi;
        return (
          '<label class="quiz-option" data-question="' + qi + '" data-option="' + oi + '">' +
          '<input type="radio" id="' + inputId + '" name="q' + qi + '" value="' + oi + '">' +
          "<span>" + opt + "</span>" +
          "</label>"
        );
      }).join("");

      return (
        '<fieldset class="quiz-question" data-question="' + qi + '">' +
        "<legend>" + (qi + 1) + ". " + q.question + "</legend>" +
        options +
        '<div class="quiz-feedback" hidden></div>' +
        "</fieldset>"
      );
    }).join("");

    el.innerHTML =
      '<div class="quiz-container">' +
      html +
      '<button type="button" class="btn" id="quiz-submit">Corrigir respostas</button>' +
      '<p class="quiz-result" id="quiz-result" hidden></p>' +
      "</div>";

    el.querySelector("#quiz-submit").addEventListener("click", function () {
      grade(el, topicId, questions);
    });
  }

  function grade(el, topicId, questions) {
    var correct = 0;

    questions.forEach(function (q, qi) {
      var fieldset = el.querySelector('.quiz-question[data-question="' + qi + '"]');
      var chosen = fieldset.querySelector("input:checked");
      var feedback = fieldset.querySelector(".quiz-feedback");

      fieldset.querySelectorAll(".quiz-option").forEach(function (label) {
        label.classList.remove("is-correct", "is-wrong");
        var oi = Number(label.getAttribute("data-option"));
        if (oi === q.answer) label.classList.add("is-correct");
        else if (chosen && Number(chosen.value) === oi) label.classList.add("is-wrong");
      });

      if (chosen && Number(chosen.value) === q.answer) correct++;

      feedback.hidden = false;
      feedback.textContent = q.explanation || "Resposta correta: " + q.options[q.answer];
    });

    var result = el.querySelector("#quiz-result");
    result.hidden = false;
    result.textContent =
      "Você acertou " + correct + " de " + questions.length + " questões.";

    SD.progress.markQuizDone(topicId, correct / questions.length);
  }

  return { render: render };
})();
