/* ============================================================
   app.js — Inicialização da aplicação
   Aplica o tema salvo, monta o layout, registra as rotas e
   inicia o roteador.
   ============================================================ */

(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    // 1. Tema (cookie ou preferência do sistema)
    SD.theme.init();

    // 2. Layout fixo (cabeçalho, sidebar, rodapé)
    SD.layout.init();

    // 2b. Auxílios de leitura (barra de progresso + scroll-spy do índice)
    if (SD.reading) SD.reading.init();

    // 3. Rotas
    SD.router.register("/", SD.views.home);
    SD.router.register("/topico/:id", SD.views.topic);
    SD.router.register("/glossario", SD.views.glossary);
    SD.router.register("/sobre", SD.views.about);

    SD.router.setNotFound(function () {
      document.getElementById("app-view").innerHTML = SD.layout.viewContainer(
        '<div class="empty-state"><h1>Página não encontrada</h1>' +
        '<p><a href="#/">Voltar ao início</a></p></div>'
      );
    });

    // 4. A cada navegação, atualiza sidebar e menu ativo
    window.addEventListener("hashchange", function () {
      SD.layout.renderSidebar();
      SD.layout.highlightNav();
    });

    // 5. Inicia
    SD.router.start();
    SD.layout.highlightNav();
  });
})();
