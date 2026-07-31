/* ============================================================
   lab.js — Comportamento das páginas de prática (app/labs/)
   ------------------------------------------------------------
   Depende de core/store.js e ui/theme.js (mesmo tema do app).
   O que faz, tudo opcional e sem framework:
     - botão copiar em cada bloco de comando;
     - ficha do ambiente: o aluno digita os IPs uma vez e todos
       os comandos da página passam a mostrar o valor real;
     - abas Windows/PowerShell × macOS/Linux;
     - notas de aprofundamento abertas no lugar da menção;
     - checkpoints por passo, com contador na barra superior;
     - tabela de resultados com botão de copiar o resumo.
   Tudo é persistido em UM cookie por prática (sd_lab_<id>).
   Namespace global: SD.lab
   ============================================================ */

window.SD = window.SD || {};

SD.lab = (function () {
  "use strict";

  var COOKIE_DIAS = 180;
  var estado = { os: "", vars: {}, checks: {}, res: {} };
  var chaveCookie = "sd_lab";

  /* ---------- Persistência (mesmo mecanismo do app) ---------- */
  function lerCookie(nome) {
    var achado = document.cookie.match(new RegExp("(?:^|;\\s*)" + nome + "=([^;]*)"));
    return achado ? decodeURIComponent(achado[1]) : null;
  }

  function gravarCookie(nome, valor) {
    var expira = new Date(Date.now() + COOKIE_DIAS * 864e5).toUTCString();
    document.cookie = nome + "=" + encodeURIComponent(valor) +
      "; expires=" + expira + "; path=/; SameSite=Lax";
  }

  function carregar() {
    try {
      var salvo = JSON.parse(lerCookie(chaveCookie));
      if (salvo && typeof salvo === "object") {
        estado.os = salvo.os || "";
        estado.vars = salvo.vars || {};
        estado.checks = salvo.checks || {};
        estado.res = salvo.res || {};
      }
    } catch (e) { /* cookie ausente ou inválido: começa do zero */ }
  }

  function salvar() {
    try { gravarCookie(chaveCookie, JSON.stringify(estado)); } catch (e) { /* silencioso */ }
  }

  /* ---------- Copiar para a área de transferência ----------
     A API moderna exige contexto seguro; aberta do disco (file://)
     a página cai no método antigo com textarea temporária. */
  function copiar(texto, botao) {
    function feedback(ok) {
      var rotulo = botao.getAttribute("data-rotulo") || "copiar";
      botao.textContent = ok ? "✓ copiado" : "falhou";
      botao.classList.toggle("copiado", ok);
      setTimeout(function () {
        botao.textContent = rotulo;
        botao.classList.remove("copiado");
      }, 1600);
    }
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(texto).then(function () { feedback(true); },
        function () { feedback(copiaAntiga(texto)); });
    } else {
      feedback(copiaAntiga(texto));
    }
  }

  function copiaAntiga(texto) {
    var area = document.createElement("textarea");
    area.value = texto;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    var ok = false;
    try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
    document.body.removeChild(area);
    return ok;
  }

  function ligarBotoesCopiar() {
    Array.prototype.forEach.call(document.querySelectorAll("[data-copiar]"), function (botao) {
      botao.setAttribute("data-rotulo", botao.textContent.trim());
      botao.addEventListener("click", function () {
        var alvo = botao.getAttribute("data-copiar");
        var bloco = botao.closest(".cmd");
        var origem = alvo
          ? document.getElementById(alvo)
          : (bloco && bloco.querySelector("pre"));
        if (origem) copiar(origem.textContent.replace(/\s+$/, ""), botao);
      });
    });
  }

  /* ---------- Ficha do ambiente: IPs digitados uma vez ---------- */
  function aplicarVariavel(nome, valor) {
    Array.prototype.forEach.call(
      document.querySelectorAll('[data-var="' + nome + '"]'),
      function (marca) {
        var padrao = marca.getAttribute("data-padrao");
        if (padrao === null) {
          padrao = marca.textContent;
          marca.setAttribute("data-padrao", padrao);
        }
        marca.textContent = valor || padrao;
        marca.classList.toggle("preenchida", !!valor);
      }
    );
  }

  function ligarFicha() {
    Array.prototype.forEach.call(document.querySelectorAll("[data-ficha]"), function (campo) {
      var nome = campo.getAttribute("data-ficha");
      if (estado.vars[nome]) campo.value = estado.vars[nome];
      aplicarVariavel(nome, campo.value.trim());
      campo.addEventListener("input", function () {
        var valor = campo.value.trim();
        estado.vars[nome] = valor;
        aplicarVariavel(nome, valor);
        salvar();
      });
    });
  }

  /* ---------- Abas de sistema operacional ---------- */
  function aplicarOS(os) {
    document.body.setAttribute("data-os", os);
    Array.prototype.forEach.call(document.querySelectorAll("[data-os-btn]"), function (botao) {
      botao.setAttribute("aria-pressed", String(botao.getAttribute("data-os-btn") === os));
    });
  }

  function ligarOS() {
    var padrao = estado.os ||
      (/Win/i.test(navigator.platform || navigator.userAgent) ? "win" : "unix");
    aplicarOS(padrao);
    Array.prototype.forEach.call(document.querySelectorAll("[data-os-btn]"), function (botao) {
      botao.addEventListener("click", function () {
        estado.os = botao.getAttribute("data-os-btn");
        aplicarOS(estado.os);
        salvar();
      });
    });
  }

  /* ---------- Checkpoints ---------- */
  function atualizarContador() {
    var caixas = document.querySelectorAll(".check input[type=checkbox]");
    var feitos = document.querySelectorAll(".check input[type=checkbox]:checked");
    var alvo = document.getElementById("lab-contador");
    if (alvo && caixas.length) {
      alvo.textContent = feitos.length + " de " + caixas.length + " passos";
    }
  }

  function ligarCheckpoints() {
    Array.prototype.forEach.call(
      document.querySelectorAll(".check input[type=checkbox]"),
      function (caixa) {
        if (estado.checks[caixa.id]) caixa.checked = true;
        caixa.closest(".check").classList.toggle("marcado", caixa.checked);
        caixa.addEventListener("change", function () {
          estado.checks[caixa.id] = caixa.checked;
          caixa.closest(".check").classList.toggle("marcado", caixa.checked);
          atualizarContador();
          salvar();
        });
      }
    );
    atualizarContador();
  }

  /* ---------- Notas de aprofundamento ----------
     O termo marcado com data-nota vira um botão dentro da própria
     frase; a explicação abre LOGO ABAIXO do parágrafo, sem
     sobrepor nada e sem tirar o aluno da página. O texto vem de
     content/notas.js, para que o mesmo termo citado em roteiros
     diferentes seja escrito uma vez só. */
  var BASE_APP_DIR = "../../";              // todo roteiro vive em app/labs/<pratica>/
  var BASE_APP = BASE_APP_DIR + "index.html";

  /* A figura da nota vem com src relativo à raiz de app/, pela mesma
     razão dos ponteiros de leia[]: quem sabe a profundidade da página é
     quem a monta, não o content/notas.js. */
  function montarFigura(figura) {
    if (!figura || !figura.src) return "";
    var dim = figura.largura && figura.altura
      ? ' width="' + figura.largura + '" height="' + figura.altura + '"'
      : "";
    return '<figure class="nota-figura">' +
      '<img src="' + BASE_APP_DIR + figura.src + '" alt="' + figura.alt + '"' + dim +
      ' loading="lazy" decoding="async">' +
      (figura.legenda ? "<figcaption>" + figura.legenda + "</figcaption>" : "") +
      "</figure>";
  }

  function montarNota(nota, id) {
    var caixa = document.createElement("div");
    caixa.className = "nota-corpo";
    caixa.id = id;
    caixa.hidden = true;

    var leia = "";
    if (nota.leia && nota.leia.length) {
      leia = '<p class="nota-leia">No curso: ' + nota.leia.map(function (item) {
        return '<a href="' + BASE_APP + "#/topico/" + item.topico + '">' +
          item.rotulo + "</a>";
      }).join(" · ") + "</p>";
    }

    // {{figura}} marca o lugar dela no texto; sem o marcador, entra no fim.
    var figura = montarFigura(nota.figura);
    var corpo = nota.html.indexOf("{{figura}}") >= 0
      ? nota.html.replace("{{figura}}", figura)
      : nota.html + figura;

    caixa.innerHTML =
      '<p class="nota-cabeca"><span>Nota: ' + nota.termo + "</span>" +
      '<button type="button" class="nota-fechar">fechar</button></p>' +
      corpo + leia;
    return caixa;
  }

  function ligarNotas() {
    var contador = 0;
    Array.prototype.forEach.call(document.querySelectorAll("[data-nota]"), function (botao) {
      var nota = (window.SD.notas || {})[botao.getAttribute("data-nota")];
      if (!nota) {
        // Sem o conteúdo, o termo volta a ser texto comum em vez de
        // virar um botão que não faz nada.
        botao.setAttribute("disabled", "");
        return;
      }

      contador += 1;
      var id = "nota-" + botao.getAttribute("data-nota") + "-" + contador;
      var caixa = montarNota(nota, id);

      var item = botao.closest("li");
      if (item) {
        item.appendChild(caixa); // dentro do <li>, para não quebrar a lista
      } else {
        var bloco = botao.closest("p") || botao.parentNode;
        bloco.parentNode.insertBefore(caixa, bloco.nextSibling);
      }

      botao.setAttribute("aria-expanded", "false");
      botao.setAttribute("aria-controls", id);

      function alternar() {
        var aberta = botao.getAttribute("aria-expanded") === "true";
        botao.setAttribute("aria-expanded", String(!aberta));
        caixa.hidden = aberta;
      }

      botao.addEventListener("click", alternar);
      caixa.querySelector(".nota-fechar").addEventListener("click", function () {
        alternar();
        botao.focus();
      });
    });
  }

  /* ---------- Tabela de resultados ---------- */
  function ligarResultados() {
    Array.prototype.forEach.call(document.querySelectorAll("[data-res]"), function (campo) {
      var nome = campo.getAttribute("data-res");
      if (estado.res[nome]) campo.value = estado.res[nome];
      campo.addEventListener("input", function () {
        estado.res[nome] = campo.value;
        salvar();
      });
    });

    var botao = document.getElementById("copiar-resultados");
    if (!botao) return;
    botao.setAttribute("data-rotulo", botao.textContent.trim());
    botao.addEventListener("click", function () {
      var linhas = [document.title, ""];
      Array.prototype.forEach.call(document.querySelectorAll("[data-res]"), function (campo) {
        var rotulo = campo.getAttribute("data-rotulo") ||
          campo.closest("tr").querySelector("td, th").textContent.trim();
        linhas.push(rotulo + ": " + (campo.value || "(não preenchido)"));
      });
      copiar(linhas.join("\n"), botao);
    });
  }

  /* ---------- Limpar tudo ---------- */
  function ligarLimpeza() {
    var botao = document.getElementById("limpar-lab");
    if (!botao) return;
    botao.addEventListener("click", function () {
      if (!window.confirm("Apagar os dados desta prática guardados neste navegador?")) return;
      estado = { os: estado.os, vars: {}, checks: {}, res: {} };
      salvar();
      window.location.reload();
    });
  }

  /* ---------- Início ---------- */
  function init(opcoes) {
    chaveCookie = "sd_lab_" + ((opcoes && opcoes.id) || "00");
    carregar();
    if (window.SD.theme) SD.theme.init();
    var alternador = document.getElementById("theme-toggle");
    if (alternador) alternador.addEventListener("click", SD.theme.toggle);
    ligarBotoesCopiar();
    ligarFicha();
    ligarOS();
    ligarNotas();
    ligarCheckpoints();
    ligarResultados();
    ligarLimpeza();
  }

  return { init: init };
})();
