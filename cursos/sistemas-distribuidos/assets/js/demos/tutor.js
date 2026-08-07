/* ============================================================
   demos/tutor.js: camada de tutoria das demonstrações
   ------------------------------------------------------------
   Plano: docs/demos/2026-08-03-demo-modelos-arquitetura-tutoria-plano.md

   O diagnóstico que originou este módulo: a demo mostra ESTADO e
   o aluno precisa de TRANSIÇÃO. Ela responde "como está agora" e
   nunca "o que mudou, por que mudou e para onde olhar".

   Quatro peças, todas dentro da própria demo (nunca popup, nunca
   página nova: para entender a explicação o aluno precisa olhar o
   número que mudou, e o modal cobre justamente esse número):

     passos    → o que fazer, nomeando o controle como ele aparece
     previsão  → uma pergunta de um clique antes da ação-chave
     efeito    → o que mudou · antes → depois · por quê · olhe para
     conceito  → a nota de aprofundamento, recolhida por padrão

   REGRA DE PROJETO: este módulo NÃO conhece o modelo de demo
   nenhuma. Ele recebe metricas[] (rótulo, formato e direção boa),
   uma função snapshot() e as frases conceituais já prontas. É o
   que permite uma demo de eventos usar o painel sem usar o
   retrato antes/depois, e uma demo de estado usar os dois.

   Namespace: SD.demoTutor
   ============================================================ */

window.SD = window.SD || {};

SD.demoTutor = (function () {
  "use strict";

  /* Nota de aprofundamento no contexto do SPA. O texto vive em
     content/notas.js e em nenhum outro lugar; quem monta a URL é o
     consumidor, e aqui o consumidor está na raiz de app/. */
  function montarFigura(figura) {
    if (!figura || !figura.src) return "";
    var dim = figura.largura && figura.altura
      ? ' width="' + figura.largura + '" height="' + figura.altura + '"'
      : "";
    return '<figure class="demo-tutor-nota-figura">' +
      '<img src="' + figura.src + '" alt="' + figura.alt + '"' + dim +
      ' loading="lazy" decoding="async">' +
      (figura.fonte ? '<p class="figura-fonte">' + figura.fonte + "</p>" : "") +
      (figura.legenda ? "<figcaption>" + figura.legenda + "</figcaption>" : "") +
      "</figure>";
  }

  function corpoDaNota(nota) {
    var figura = montarFigura(nota.figura);
    var corpo = nota.html.indexOf("{{figura}}") >= 0
      ? nota.html.replace("{{figura}}", figura)
      : nota.html + figura;
    var leia = "";
    if (nota.leia && nota.leia.length) {
      leia = '<p class="demo-tutor-nota-leia">No curso: ' + nota.leia.map(function (item) {
        return '<a href="#/topico/' + item.topico + '">' + item.rotulo + "</a>";
      }).join(" · ") + "</p>";
    }
    return '<p class="demo-tutor-nota-cabeca">Nota: ' + nota.termo + "</p>" + corpo + leia;
  }

  /**
   * @param cfg {object}
   *   alvos     {passos, previsao, efeito, conceito}: elementos já no DOM
   *   metricas  [{ chave, rotulo, formatar, melhorQuando: "menor"|"maior" }]
   *   snapshot  function(): objeto com as chaves declaradas (e o que mais a
   *             demo quiser carregar; só as declaradas viram linha no painel)
   */
  function criar(cfg) {
    var alvos = cfg.alvos;
    var metricas = cfg.metricas || [];
    var snapshot = cfg.snapshot || function () { return {}; };
    var previsaoRespondida = null;   // consumida pelo primeiro efeito seguinte
    var contadorNota = 0;

    /* ---------------- Passos ---------------- */

    var passosAtuais = [];

    function renderPassos() {
      if (!passosAtuais.length) {
        alvos.passos.innerHTML = "";
        alvos.passos.hidden = true;
        return;
      }
      alvos.passos.hidden = false;
      alvos.passos.innerHTML =
        '<p class="demo-tutor-passos-titulo">Nesta etapa:</p>' +
        '<ol class="demo-tutor-passos-lista">' +
        passosAtuais.map(function (p) {
          return '<li data-passo="' + p.id + '"' + (p.feito ? ' class="is-feito"' : "") + ">" +
            '<span class="demo-tutor-marca" aria-hidden="true">' + (p.feito ? "✓" : "○") +
            "</span>" +
            '<span class="demo-tutor-passo-texto">' + p.texto + "</span>" +
            (p.feito ? '<span class="sr-only">(feito)</span>' : "") +
            "</li>";
        }).join("") +
        "</ol>";
    }

    function passoFeito(id) {
      var mudou = false;
      passosAtuais.forEach(function (p) {
        if (p.id === id && !p.feito) { p.feito = true; mudou = true; }
      });
      if (mudou) renderPassos();
    }

    /* ---------------- Previsão ----------------
       Uma por etapa, na ação-chave, ignorável. Três alternativas
       convidam ao chute, então o veredito nunca é só "errou": ele
       explica, e o painel de efeito vem logo em seguida. */

    function renderPrevisao(previsao) {
      if (!previsao) {
        alvos.previsao.innerHTML = "";
        alvos.previsao.hidden = true;
        return;
      }
      alvos.previsao.hidden = false;
      alvos.previsao.innerHTML =
        '<p class="demo-tutor-previsao-pergunta">' +
        '<span class="demo-tutor-previsao-selo">Antes de mexer</span> ' +
        previsao.pergunta + "</p>" +
        '<div class="demo-tutor-previsao-opcoes">' +
        previsao.opcoes.map(function (o, i) {
          return '<button type="button" class="btn-ghost demo-tutor-opcao" data-opcao="' +
            i + '">' + o.rotulo + "</button>";
        }).join("") +
        "</div>" +
        '<p class="demo-tutor-previsao-veredito" aria-live="polite" hidden></p>';

      alvos.previsao.addEventListener("click", function aoClicar(e) {
        var b = e.target.closest("[data-opcao]");
        if (!b) return;
        var i = parseInt(b.getAttribute("data-opcao"), 10);
        var escolhida = previsao.opcoes[i];
        var certa = previsao.opcoes.filter(function (o) { return o.correta; })[0];
        Array.prototype.forEach.call(
          alvos.previsao.querySelectorAll("[data-opcao]"),
          function (botao, j) {
            botao.disabled = true;
            if (previsao.opcoes[j].correta) botao.classList.add("is-correta");
            if (j === i) botao.classList.add("is-escolhida");
          }
        );
        var veredito = alvos.previsao.querySelector(".demo-tutor-previsao-veredito");
        veredito.hidden = false;
        veredito.className = "demo-tutor-previsao-veredito " +
          (escolhida.correta ? "is-acerto" : "is-erro");
        veredito.innerHTML = (escolhida.correta ? "✓ " : "✗ ") +
          (escolhida.correta
            ? ""
            : "A resposta é <strong>" + certa.rotulo + "</strong>. ") +
          (escolhida.veredito || certa.veredito || "");
        previsaoRespondida = {
          acertou: escolhida.correta,
          rotulo: escolhida.rotulo,
          texto: veredito.textContent
        };
        alvos.previsao.removeEventListener("click", aoClicar);
      });
    }

    /* ---------------- Conceito (camada 3) ---------------- */

    function renderConceito(slug) {
      var nota = slug && (window.SD.notas || {})[slug];
      if (!nota) {
        alvos.conceito.innerHTML = "";
        alvos.conceito.hidden = true;
        return;
      }
      contadorNota += 1;
      var id = "demo-tutor-nota-" + contadorNota;
      alvos.conceito.hidden = false;
      alvos.conceito.innerHTML =
        '<button type="button" class="btn-ghost demo-tutor-conceito-btn" ' +
        'aria-expanded="false" aria-controls="' + id + '">Por que isso acontece?</button>' +
        '<div class="demo-tutor-nota" id="' + id + '" hidden>' + corpoDaNota(nota) + "</div>";

      var botao = alvos.conceito.querySelector(".demo-tutor-conceito-btn");
      var caixa = alvos.conceito.querySelector(".demo-tutor-nota");
      botao.addEventListener("click", function () {
        var aberta = botao.getAttribute("aria-expanded") === "true";
        botao.setAttribute("aria-expanded", String(!aberta));
        caixa.hidden = aberta;
        /* Recolhido, o botão divide a linha com a meta; aberto, a nota precisa
           da largura inteira. Quem sabe disso é o JS, não o seletor. */
        alvos.conceito.classList.toggle("is-aberta", !aberta);
      });
    }

    /* ---------------- Painel de efeito ----------------
       O núcleo: quatro partes, sempre nesta ordem.
         o que você mudou · antes → depois · por quê · olhe para
       A última linha é a resposta ao "do que mudou, o que devo
       observar com mais atenção". */

    function diferencas(antes, depois) {
      if (!antes) return [];
      var linhas = [];
      metricas.forEach(function (m) {
        var a = antes[m.chave];
        var d = depois[m.chave];
        if (a === undefined || d === undefined) return;
        var fa = m.formatar(a);
        var fd = m.formatar(d);
        if (fa === fd) return;   // igualdade pelo texto: evita ruído de arredondamento
        var melhorou = m.melhorQuando === "maior" ? d > a : d < a;
        linhas.push({
          texto: m.rotulo + ": " + fa + " → " + fd,
          classe: melhorou ? "is-melhor" : "is-pior"
        });
      });
      return linhas;
    }

    /**
     * @param dados {acao, antes, porque, olhe, numeros}
     *   antes    retrato tirado ANTES da mudança (null quando não há diff)
     *   numeros  linha pronta, para quando a mudança não está nas métricas
     * @return {string} o resumo "antes → depois" para o log, ou ""
     */
    function efeito(dados) {
      var depois = snapshot();
      var linhas = diferencas(dados.antes, depois);
      var resumo = linhas.map(function (l) { return l.texto; }).join(" · ");

      var previsaoHtml = "";
      if (previsaoRespondida) {
        previsaoHtml =
          '<p class="demo-tutor-efeito-previsao">' +
          (previsaoRespondida.acertou ? "✓ " : "✗ ") +
          "Você previu <strong>" + previsaoRespondida.rotulo + "</strong>. " +
          previsaoRespondida.texto.replace(/^[✓✗]\s*/, "") +
          "</p>";
        previsaoRespondida = null;
        /* Cumprido o papel dela (apostar ANTES), a pergunta sai da tela: o
           veredito passa a viver aqui, e a demo não paga altura duas vezes. */
        alvos.previsao.hidden = true;
        alvos.previsao.innerHTML = "";
      }

      var numerosHtml = "";
      if (dados.numeros) {
        numerosHtml = '<p class="demo-tutor-efeito-nums"><span class="demo-tutor-delta">' +
          dados.numeros + "</span></p>";
      } else if (linhas.length) {
        numerosHtml = '<p class="demo-tutor-efeito-nums">' +
          linhas.map(function (l) {
            return '<span class="demo-tutor-delta ' + l.classe + '">' + l.texto + "</span>";
          }).join("") + "</p>";
      } else if (dados.antes) {
        numerosHtml = '<p class="demo-tutor-efeito-nums">' +
          '<span class="demo-tutor-delta">Nenhum número se moveu.</span></p>';
      }

      alvos.efeito.hidden = false;
      alvos.efeito.className = "demo-tutor-efeito";
      alvos.efeito.innerHTML =
        previsaoHtml +
        '<p class="demo-tutor-efeito-acao">' + dados.acao + "</p>" +
        numerosHtml +
        '<p class="demo-tutor-efeito-porque"><strong>Por quê:</strong> ' + dados.porque + "</p>" +
        '<p class="demo-tutor-efeito-olhe"><strong>Olhe para:</strong> ' + dados.olhe + "</p>";
      return resumo;
    }

    /* Mensagem de espera: o painel nunca fica vazio, senão a etapa
       começa com um bloco em branco sem explicação nenhuma. */
    function aguardar(texto) {
      alvos.efeito.hidden = false;
      alvos.efeito.className = "demo-tutor-efeito is-aguardando";
      alvos.efeito.innerHTML = '<p class="demo-tutor-efeito-acao">' + texto + "</p>";
    }

    /* ---------------- Etapa ---------------- */

    function abrirEtapa(cfg2) {
      passosAtuais = (cfg2.passos || []).map(function (p) {
        return { id: p.id, texto: p.texto, feito: false };
      });
      previsaoRespondida = null;
      renderPassos();
      renderPrevisao(cfg2.previsao || null);
      renderConceito(cfg2.conceito || null);
      aguardar(cfg2.aguardando ||
        "Mexa em um controle e esta faixa conta o que mudou e por quê.");
    }

    return {
      abrirEtapa: abrirEtapa,
      passoFeito: passoFeito,
      retrato: snapshot,
      efeito: efeito,
      aguardar: aguardar
    };
  }

  return { criar: criar };
})();
