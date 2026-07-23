/* ============================================================
   core/loader.js — Carregamento sob demanda do conteúdo
   Cada tópico vive em content/topics/topic-XX.js e se registra
   em SD.content quando carregado. A injeção via <script>
   funciona inclusive abrindo o site direto do disco (file://),
   o que não seria possível com fetch().
   Namespace global: SD.loader
   ============================================================ */

window.SD = window.SD || {};
SD.content = SD.content || {}; // preenchido pelos arquivos de tópico

SD.loader = (function () {
  "use strict";

  var pending = {}; // promessas em andamento, por id de tópico

  /**
   * Garante que o conteúdo de um tópico esteja carregado.
   * @param {string} topicId — ex.: "01"
   * @returns {Promise<object>} objeto registrado em SD.content[topicId]
   */
  function loadTopic(topicId) {
    if (SD.content[topicId]) {
      return Promise.resolve(SD.content[topicId]);
    }
    if (pending[topicId]) {
      return pending[topicId];
    }

    pending[topicId] = new Promise(function (resolve, reject) {
      var script = document.createElement("script");
      script.src = "content/topics/topic-" + topicId + ".js";
      script.onload = function () {
        delete pending[topicId];
        if (SD.content[topicId]) {
          resolve(SD.content[topicId]);
        } else {
          reject(new Error("Tópico " + topicId + " não se registrou em SD.content."));
        }
      };
      script.onerror = function () {
        delete pending[topicId];
        reject(new Error("Falha ao carregar o arquivo do tópico " + topicId + "."));
      };
      document.head.appendChild(script);
    });

    return pending[topicId];
  }

  return { loadTopic: loadTopic };
})();
