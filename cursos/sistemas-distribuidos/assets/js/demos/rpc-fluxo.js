/* ============================================================
   demos/rpc-fluxo.js — Demo "A Chamada Invisível"
   ------------------------------------------------------------
   Demonstração interativa do Tópico 5 (Objetos Distribuídos e
   Invocação Remota): o aluno monta a linha de produção da
   chamada (stub → despachante → esqueleto → servente), escolhe a
   semântica de chamada e paga o preço de cada uma (crédito em
   dobro × histórico retido), aposta se uma chamada que lançou
   exceção executou ou não, vive a diferença entre passar um
   objeto por cópia ou por referência remota e acompanha o ciclo
   de vida completo de um objeto remoto — do lookup no vinculador
   ao lease que expira quando o cliente some.
   Plano e fundamentação:
   docs/demos/2026-07-16-demo-rpc-fluxo-plano.md

   Não há RMI nem registry reais: tudo é simulado na página, com
   as primeiras perdas de cada tipo roteirizadas (didática
   garantida) e os sorteios restantes determinísticos por semente
   (?demo-seed=<int>, PRNG mulberry32); ?demo-fast=1 acelera
   animações, timeouts e o relógio do lease.
   Namespace: SD.demos["rpc-fluxo"]
   ============================================================ */

window.SD = window.SD || {};
SD.demos = SD.demos || {};

SD.demos["rpc-fluxo"] = (function () {
  "use strict";

  /* ---- PRNG com semente (mulberry32) para testes reproduzíveis ---- */
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* Estações da linha de produção da etapa 1, na ordem da chamada */
  var LINE = [
    { id: "stub", name: "Stub / proxy", side: "cliente",
      role: "empacota a invocação e finge ser o objeto",
      needFirst: null,
      failMsg: "sem stub, a chamada nem SAI do cliente: a aplicação teria de " +
        "empacotar bytes à mão — você já fez isso na demo do Tópico 4." },
    { id: "desp", name: "Despachante", side: "servidor",
      role: "seleciona o método pelo operationId",
      needFirst: "stub",
      failMsg: "a requisição chegou ao servidor e morreu na porta: <strong>não há " +
        "despachante</strong> para escolher qual método invocar." },
    { id: "esq", name: "Esqueleto", side: "servidor",
      role: "desempacota argumentos e empacota o resultado",
      needFirst: "desp",
      failMsg: "o despachante selecionou o método, mas <strong>não há esqueleto</strong> " +
        "para desempacotar os argumentos e chamar o objeto." },
    { id: "serv", name: "Servente", side: "servidor",
      role: "o objeto de verdade, que executa",
      needFirst: "esq",
      failMsg: "tudo pronto no encanamento — mas <strong>não há servente</strong>: " +
        "nenhuma instância dá corpo ao objeto remoto banco." }
  ];

  var SEM_LABEL = {
    talvez: "talvez",
    alo: "pelo menos uma vez",
    amo: "no máximo uma vez"
  };

  var CENARIO_LABEL = {
    reqlost: "a REQUISIÇÃO se perdeu (a operação NÃO executou)",
    resplost: "a RESPOSTA se perdeu (a operação EXECUTOU)",
    crashafter: "o servidor COLAPSOU logo após executar (a operação EXECUTOU)"
  };

  var COPY_BYTES = 240;   /* tamanho didático da figura serializada */
  var LEASE_MS = 6000;    /* duração do lease (comprimida; ?demo-fast acelera) */

  function mount(container) {
    var params = new URLSearchParams(window.location.search);
    var seed = parseInt(params.get("demo-seed"), 10);
    var rand = isNaN(seed) ? Math.random : mulberry32(seed);
    var timeScale = params.get("demo-fast") ? 0.12 : 1;
    var startedAt = Date.now();

    var state = {
      stage: 1,
      calls: 0, msgs: 0, execs: 0, retx: 0,
      /* etapa 1 */ line: { stub: false, desp: false, esq: false, serv: false },
                    busy1: false, failSeen: false, wrongOrderSeen: false,
                    call8Done: false, lastReturn: null,
      /* etapa 2 */ sem: "talvez", saldo2: 100, esperado2: 100, execs2: 0,
                    hist2: 0, opSeq2: 0, busy2: false, clientView2: "—",
                    talvezSeen: false, doubleSeen: false, fixSeen: false,
                    cheapSeen: false, scrTalvez: false, scrALO: false,
                    scrAMO: false, scrCon: false,
      /* etapa 3 */ round: 0, hits: 0, roundActive: false, scenario: null,
                    saldo3: 100, execs3: 0, busy3: false, serverUp: true,
                    events3: [],
      /* etapa 4 */ hasCopy: false, colorA: null, colorSrv: "azul", colorB: "azul",
                    bytesCopied: 0, trips: 0, div4: false, conv4: false, busy4: false,
      /* etapa 5 */ bound5: false, lookup5: false, holders: [], cbOn: false,
                    cbNotified: false, polls: 0, clientDead: false, leaseOn: false,
                    leaseLeft: 0, renewLogged: false, leakSeen: false,
                    collected: false, busy5: false
    };

    function to(fn, ms) {
      setTimeout(function () { if (container.isConnected) fn(); }, ms * timeScale);
    }

    /* ============ Estrutura da interface ============ */

    container.innerHTML =
      '<div class="demo-cf demo-rf">' +
      '  <div class="demo-cf-head">' +
      '    <span class="badge demo-cf-badge">Demonstração</span>' +
      '    <p class="demo-cf-title"></p>' +
      '    <p class="demo-cf-instructions"></p>' +
      '    <p class="demo-cf-goal"></p>' +
      '  </div>' +
      '  <div class="demo-rf-stage-area"></div>' +
      '  <div class="demo-cf-controls demo-rf-controls"></div>' +
      '  <dl class="demo-cf-metrics">' +
      '    <div><dt>Chamadas concluídas</dt><dd data-metric="calls">0</dd></div>' +
      '    <div><dt>Mensagens na rede</dt><dd data-metric="msgs">0</dd></div>' +
      '    <div><dt>Execuções no servidor</dt><dd data-metric="execs">0</dd></div>' +
      '    <div><dt>Retransmissões</dt><dd data-metric="retx">0</dd></div>' +
      '  </dl>' +
      '  <div class="demo-cf-summary callout" hidden>' +
      '    <p class="callout-title">🎓 A linha carrega tudo</p>' +
      "    <p><code>banco.creditar(10)</code> parece uma linha inocente — mas agora você " +
      "sabe o que ela carrega: um <strong>contrato</strong> (a interface, com stub e " +
      "despachante gerados a partir dela), uma <strong>promessa</strong> (a semântica de " +
      "chamada que alguém escolheu), um <strong>custo</strong> (viagens de rede, bytes " +
      "copiados, histórico retido) e um <strong>ciclo de vida</strong> (nomes no " +
      "vinculador, referências contadas, leases). De onde vêm os nomes → Tópico 9. Quem " +
      "mantém o serviço quando um servidor cai → Tópico 10. Quem gerencia processos e " +
      "threads que atendem invocações → Tópico 6. E o herdeiro que você vai usar no " +
      "trabalho: <strong>gRPC</strong> — IDL, stubs gerados e requisição-resposta, como " +
      "em 1984.</p>" +
      '  </div>' +
      '  <div class="demo-cf-log-wrap">' +
      '    <p class="demo-cf-log-title">O que está acontecendo:</p>' +
      '    <ol class="demo-cf-log" aria-live="polite"></ol>' +
      '  </div>' +
      '  <div class="demo-cf-nav">' +
      '    <button type="button" class="btn btn-secondary demo-cf-prev">← Etapa anterior</button>' +
      '    <span class="demo-cf-nav-mid">' +
      '      <span class="demo-cf-stage-counter"></span>' +
      '      <button type="button" class="btn-ghost demo-cf-reset">↺ Reiniciar demo</button>' +
      '    </span>' +
      '    <button type="button" class="btn demo-cf-next">Próxima etapa →</button>' +
      '  </div>' +
      '</div>';

    var els = {
      title: container.querySelector(".demo-cf-title"),
      instructions: container.querySelector(".demo-cf-instructions"),
      goal: container.querySelector(".demo-cf-goal"),
      area: container.querySelector(".demo-rf-stage-area"),
      controls: container.querySelector(".demo-rf-controls"),
      metrics: container.querySelector(".demo-cf-metrics"),
      summary: container.querySelector(".demo-cf-summary"),
      log: container.querySelector(".demo-cf-log"),
      prev: container.querySelector(".demo-cf-prev"),
      next: container.querySelector(".demo-cf-next"),
      stageCounter: container.querySelector(".demo-cf-stage-counter")
    };

    function log(text) {
      var li = document.createElement("li");
      var t = ((Date.now() - startedAt) / 1000).toFixed(1);
      li.innerHTML = '<span class="demo-cf-log-time">+' + t + "s</span> " + text;
      els.log.insertBefore(li, els.log.firstChild);
      while (els.log.children.length > 48) els.log.removeChild(els.log.lastChild);
    }

    function metric(name, value) {
      els.metrics.querySelector('[data-metric="' + name + '"]').textContent = value;
    }

    function bump(name) { state[name]++; metric(name, state[name]); }

    /* ============ Etapa 1 — Raio-X da chamada ============ */

    function lineComplete() {
      return LINE.every(function (p) { return state.line[p.id]; });
    }

    function renderStage1() {
      var stations = LINE.map(function (p, i) {
        return (i ? '<span class="demo-rf-arrow" aria-hidden="true">→</span>' : "") +
          '<span class="demo-rf-station" data-station="' + p.id + '" data-on="' +
          state.line[p.id] + '">' +
          "<strong>" + p.name + "</strong> <em>(" + p.side + ")</em>" +
          '<span class="demo-rf-station-role">' +
          (state.line[p.id] ? p.role : "não instalado") + "</span></span>";
      }).join("");
      els.area.innerHTML =
        '<p class="demo-rf-code">// código do cliente (uma linha)\n' +
        "saldo = banco.consultar()" +
        (state.lastReturn !== null ? "   →   " + state.lastReturn : "") + "</p>" +
        '<div class="demo-rf-pipeline" data-fail-seen="' + state.failSeen +
        '" data-wrong-order="' + state.wrongOrderSeen + '" data-call8="' +
        state.call8Done + '">' +
        '<span class="demo-rf-endpoint">💻 cliente</span>' + stations +
        '<span class="demo-rf-endpoint">🏦 objeto banco</span>' +
        "</div>";
      els.controls.innerHTML =
        '<button type="button" class="btn demo-rf-call"' +
        (state.busy1 ? " disabled" : "") + ">▶ Chamar banco.consultar()</button>" +
        LINE.map(function (p) {
          return '<button type="button" class="btn btn-secondary demo-rf-install" ' +
            'data-install="' + p.id + '"' +
            (state.line[p.id] || state.busy1 ? " disabled" : "") +
            ">🔧 Instalar " + p.name.toLowerCase() + "</button>";
        }).join("") +
        '<button type="button" class="btn-ghost demo-rf-unmount"' +
        (state.busy1 ? " disabled" : "") + ">↺ Desmontar a linha</button>";
      els.controls.querySelector(".demo-rf-call").addEventListener("click", runCall1);
      els.controls.querySelectorAll(".demo-rf-install").forEach(function (btn) {
        btn.addEventListener("click", function () { install1(btn.getAttribute("data-install")); });
      });
      els.controls.querySelector(".demo-rf-unmount").addEventListener("click", function () {
        state.line = { stub: false, desp: false, esq: false, serv: false };
        state.lastReturn = null;
        log("↺ Linha desmontada — a chamada volta a não ter por onde passar.");
        renderStage1();
        updateNav();
      });
    }

    function install1(id) {
      var piece = LINE.filter(function (p) { return p.id === id; })[0];
      if (piece.needFirst && !state.line[piece.needFirst]) {
        var need = LINE.filter(function (p) { return p.id === piece.needFirst; })[0];
        state.wrongOrderSeen = true;
        log("✗ <strong>Ordem errada:</strong> o " + piece.name.toLowerCase() +
          " depende do <strong>" + need.name.toLowerCase() + "</strong> — é ele quem " +
          (need.id === "stub" ? "origina a requisição" :
           need.id === "desp" ? "entrega a requisição ao método certo" :
           "desempacota os argumentos") + ". Instale primeiro o " +
          need.name.toLowerCase() + ".");
        renderStage1();
        return;
      }
      state.line[id] = true;
      log("🔧 <strong>" + piece.name + "</strong> instalado no " + piece.side + " — " +
        piece.role + ". (Ninguém escreve isso à mão: o compilador de interface gera.)");
      renderStage1();
    }

    function setActiveStation(id) {
      els.area.querySelectorAll(".demo-rf-station").forEach(function (s) {
        s.classList.toggle("is-active", s.getAttribute("data-station") === id);
      });
    }

    function runCall1() {
      if (state.busy1) return;
      state.busy1 = true;
      renderStage1();
      log("▶ O cliente executou <code>banco.consultar()</code> — para ele, uma chamada " +
        "comum.");
      /* percorre a linha até a primeira peça ausente */
      var missing = null;
      for (var i = 0; i < LINE.length; i++) {
        if (!state.line[LINE[i].id]) { missing = LINE[i]; break; }
      }
      if (missing) {
        var t0 = 0;
        if (missing.id !== "stub") {
          to(function () {
            bump("msgs");
            log("1/8 — stub empacota operationId + argumentos e envia a requisição…");
          }, (t0 += 500));
        }
        to(function () {
          state.failSeen = true;
          log("💥 <strong>A chamada morreu aqui:</strong> " + missing.failMsg);
          state.busy1 = false;
          if (state.stage === 1) renderStage1();
          updateNav();
        }, (t0 += 700));
        return;
      }
      var steps = [
        { st: "stub", txt: "1/8 — o <strong>stub</strong> empacota operationId=consultar " +
          "+ argumentos (empacotamento automático)." },
        { st: "stub", txt: "2/8 — o módulo de comunicação envia a <strong>requisição</strong> " +
          "(requestId #" + (state.calls + 1) + ").", msg: true },
        { st: "desp", txt: "3/8 — o <strong>despachante</strong> recebe e seleciona o método " +
          "pelo operationId." },
        { st: "esq", txt: "4/8 — o <strong>esqueleto</strong> desempacota os argumentos." },
        { st: "serv", txt: "5/8 — o <strong>servente</strong> executa consultar() → 100.",
          exec: true },
        { st: "esq", txt: "6/8 — o esqueleto empacota o resultado na <strong>resposta</strong>." },
        { st: "stub", txt: "7/8 — a resposta viaja de volta ao cliente.", msg: true },
        { st: "stub", txt: "8/8 — o stub desempacota e retorna: <strong>saldo = 100</strong>. " +
          "O código do cliente nunca soube da viagem." }
      ];
      var t = 0;
      steps.forEach(function (s) {
        to(function () {
          if (state.stage !== 1) return;
          setActiveStation(s.st);
          if (s.msg) bump("msgs");
          if (s.exec) bump("execs");
          log(s.txt);
        }, (t += 480));
      });
      to(function () {
        state.call8Done = true;
        state.lastReturn = "100";
        bump("calls");
        state.busy1 = false;
        if (state.stage === 1) renderStage1();
        updateNav();
      }, (t += 480));
    }

    /* ============ Etapa 2 — Escolha a promessa (semânticas) ============ */

    function bank2Update() {
      var saldoEl = els.area.querySelector("[data-saldo2]");
      if (!saldoEl) return;
      saldoEl.textContent = state.saldo2;
      els.area.querySelector("[data-esperado2]").textContent = state.esperado2;
      els.area.querySelector("[data-execs2]").textContent = state.execs2;
      els.area.querySelector("[data-hist2]").textContent = state.hist2;
      els.area.querySelector("[data-client2]").textContent = state.clientView2;
      var div = els.area.querySelector("[data-div2]");
      var ok = state.saldo2 === state.esperado2;
      div.textContent = ok ? "✓ saldo confere" : "✗ DIVERGIU (R$ " +
        Math.abs(state.esperado2 - state.saldo2) + " a " +
        (state.saldo2 < state.esperado2 ? "menos" : "mais") + ")";
      div.className = "demo-rf-diverge " + (ok ? "is-ok" : "is-bad");
      var flags = els.area.querySelector("[data-flags2]");
      flags.setAttribute("data-talvez-seen", state.talvezSeen);
      flags.setAttribute("data-double-seen", state.doubleSeen);
      flags.setAttribute("data-fix-seen", state.fixSeen);
      flags.setAttribute("data-cheap-seen", state.cheapSeen);
    }

    function renderStage2() {
      els.area.innerHTML =
        '<div class="demo-rf-world">' +
        '  <div class="demo-rf-machine">' +
        '    <p class="demo-rf-machine-title">💻 Cliente</p>' +
        '    <p class="demo-rf-note">última resposta: <strong data-client2>' +
        state.clientView2 + "</strong></p>" +
        '    <p class="demo-rf-note">semântica em uso: <strong data-sem2>' +
        SEM_LABEL[state.sem] + "</strong></p>" +
        "  </div>" +
        '  <div class="demo-rf-machine">' +
        '    <p class="demo-rf-machine-title">🏦 Banco (servidor)</p>' +
        '    <p class="demo-rf-big">saldo: R$ <strong data-saldo2>' + state.saldo2 +
        "</strong></p>" +
        '    <p class="demo-rf-note">execuções: <strong data-execs2>' + state.execs2 +
        '</strong> · histórico: <strong data-hist2>' + state.hist2 +
        "</strong> respostas retidas</p>" +
        "  </div>" +
        "</div>" +
        '<p class="demo-rf-status" data-flags2 data-talvez-seen="' + state.talvezSeen +
        '" data-double-seen="' + state.doubleSeen + '" data-fix-seen="' + state.fixSeen +
        '" data-cheap-seen="' + state.cheapSeen +
        '">se nada se perdesse, o saldo seria R$ <strong data-esperado2>' +
        state.esperado2 + '</strong> — <span class="demo-rf-diverge" data-div2></span></p>';
      els.controls.innerHTML =
        '<span class="demo-rf-semrow">promessa: ' +
        ["talvez", "alo", "amo"].map(function (s) {
          return '<label><input type="radio" name="demo-rf-sem" value="' + s + '"' +
            (state.sem === s ? " checked" : "") + (state.busy2 ? " disabled" : "") +
            "> " + SEM_LABEL[s] + "</label>";
        }).join("") + "</span>" +
        '<button type="button" class="btn demo-rf-cred"' +
        (state.busy2 ? " disabled" : "") + ">💰 creditar(10) — não idempotente</button>" +
        '<button type="button" class="btn btn-secondary demo-rf-cons"' +
        (state.busy2 ? " disabled" : "") + ">🔍 consultar() — idempotente</button>" +
        '<button type="button" class="btn-ghost demo-rf-reopen"' +
        (state.busy2 ? " disabled" : "") + ">↺ Reabrir conta (R$ 100)</button>";
      els.controls.querySelectorAll('[name="demo-rf-sem"]').forEach(function (rb) {
        rb.addEventListener("change", function () {
          state.sem = rb.value;
          var why = {
            talvez: "nenhuma medida de tolerância: sem novas tentativas, sem filtro. " +
              "Barato — e sem garantia nenhuma.",
            alo: "o middleware retransmite até obter resposta, SEM filtrar duplicatas: " +
              "a operação pode executar mais de uma vez.",
            amo: "retransmissão + filtro de duplicatas + histórico: cada chamada executa " +
              "no máximo uma vez — pagando com estado retido no servidor."
          };
          log("🎚️ Promessa trocada para <strong>" + SEM_LABEL[state.sem] + "</strong>: " +
            why[state.sem]);
          var el = els.area.querySelector("[data-sem2]");
          if (el) el.textContent = SEM_LABEL[state.sem];
        });
      });
      els.controls.querySelector(".demo-rf-cred").addEventListener("click", function () { op2("cred"); });
      els.controls.querySelector(".demo-rf-cons").addEventListener("click", function () { op2("cons"); });
      els.controls.querySelector(".demo-rf-reopen").addEventListener("click", function () {
        state.saldo2 = 100; state.esperado2 = 100; state.execs2 = 0; state.hist2 = 0;
        state.clientView2 = "—";
        log("↺ Conta reaberta: saldo R$ 100 (execuções e histórico zerados).");
        bank2Update();
      });
      bank2Update();
    }

    function exec2(kind, id, isRetx) {
      /* servidor executa (ou reconhece) a requisição #id */
      if (state.sem === "amo" && isRetx) {
        log("🛡️ O servidor reconheceu a requisição #" + id + " no <strong>histórico</strong>: " +
          "reenviou a resposta guardada <strong>sem reexecutar</strong>.");
        return;
      }
      if (kind === "cred") {
        state.saldo2 += 10;
        state.execs2++;
        bump("execs");
        log("🏦 Servidor executou creditar(10) #" + id +
          (isRetx ? " <strong>DE NOVO</strong>" : "") + ": saldo R$ " + state.saldo2 + ".");
        if (isRetx) {
          state.doubleSeen = true;
          log("💥 A retransmissão virou <strong>execução dupla</strong> — creditar não é " +
            "idempotente e o saldo divergiu. Foi o middleware que retransmitiu: a " +
            "promessa era só “pelo menos uma vez”.");
        }
      } else {
        state.execs2++;
        bump("execs");
        if (isRetx) {
          state.cheapSeen = true;
          log("🔁 consultar() #" + id + " reexecutada — <strong>idempotente</strong>: ler " +
            "duas vezes não muda nada. Para interfaces assim, “pelo menos uma vez” " +
            "basta — e dispensa o custo do histórico.");
        }
      }
      if (state.sem === "amo" && !isRetx) {
        state.hist2++;
        /* resposta guardada para reconhecer futuros reenvios */
      }
      bank2Update();
    }

    function op2(kind) {
      if (state.busy2) return;
      state.busy2 = true;
      renderStage2();
      state.opSeq2++;
      var id = state.opSeq2;
      if (kind === "cred") state.esperado2 += 10;
      bank2Update();
      /* cenas roteirizadas primeiro; depois, sorteio */
      var lossLeg = null;
      if (kind === "cred" && state.sem === "talvez" && !state.scrTalvez) {
        lossLeg = "resp"; state.scrTalvez = true;
      } else if (kind === "cred" && state.sem === "alo" && !state.scrALO) {
        lossLeg = "resp"; state.scrALO = true;
      } else if (kind === "cred" && state.sem === "amo" && !state.scrAMO) {
        lossLeg = "resp"; state.scrAMO = true;
      } else if (kind === "cons" && state.sem === "alo" && !state.scrCon) {
        lossLeg = "resp"; state.scrCon = true;
      } else {
        var r = rand();
        lossLeg = r < 0.15 ? "req" : (r < 0.4 ? "resp" : null);
      }
      var label = kind === "cred" ? "creditar(10)" : "consultar()";
      var t = 0;
      log("✉️ Chamada " + label + " → requisição #" + id + " enviada (" +
        SEM_LABEL[state.sem] + ").");
      bump("msgs");
      if (lossLeg === "req") {
        to(function () {
          log("💥 A <strong>requisição</strong> #" + id + " se perdeu — o servidor nem " +
            "ficou sabendo.");
        }, (t += 600));
        if (state.sem === "talvez") {
          to(function () { finishTalvez(kind, id, false); }, (t += 900));
        } else {
          to(function () {
            bump("retx"); bump("msgs");
            log("⏲️ Timeout → o middleware <strong>retransmite</strong> #" + id +
              " sozinho (você não precisou clicar em nada).");
          }, (t += 900));
          to(function () {
            exec2(kind, id, false); /* chega pela primeira vez: execução única */
            log("✅ O reenvio salvou a chamada: a requisição perdida chegou na segunda " +
              "tentativa e executou UMA vez.");
          }, (t += 600));
          to(function () { bump("msgs"); finishOk2(kind, id); }, (t += 500));
        }
        return;
      }
      to(function () { exec2(kind, id, false); }, (t += 600));
      if (lossLeg === "resp") {
        to(function () {
          bump("msgs");
          log("💥 A <strong>resposta</strong> de #" + id + " se perdeu — a operação JÁ " +
            "executou, mas o cliente não sabe.");
        }, (t += 500));
        if (state.sem === "talvez") {
          to(function () { finishTalvez(kind, id, true); }, (t += 900));
        } else {
          to(function () {
            bump("retx"); bump("msgs");
            log("⏲️ Timeout → o middleware <strong>retransmite</strong> #" + id + ".");
          }, (t += 900));
          to(function () { exec2(kind, id, true); }, (t += 600));
          to(function () {
            bump("msgs");
            if (state.sem === "amo" && kind === "cred") {
              state.fixSeen = true;
              log("✅ Perda + reenvio sob “no máximo uma vez”: o crédito executou UMA " +
                "vez só — o filtro reconheceu o reenvio e respondeu pelo histórico.");
            }
            finishOk2(kind, id);
          }, (t += 500));
        }
        return;
      }
      to(function () { bump("msgs"); finishOk2(kind, id); }, (t += 500));
    }

    function finishTalvez(kind, id, executou) {
      state.clientView2 = "EXCEÇÃO: nenhum resultado";
      if (kind === "cred" && executou) state.talvezSeen = true;
      log("❌ <strong>EXCEÇÃO</strong> na chamada #" + id + ": nenhum resultado " +
        "(“talvez”: sem novas tentativas). Raio-X: a operação <strong>" +
        (executou ? "EXECUTOU" : "NÃO executou") + "</strong> — o cliente é que " +
        "nunca saberá a diferença.");
      state.busy2 = false;
      if (state.stage === 2) { renderStage2(); }
      updateNav();
    }

    function finishOk2(kind, id) {
      state.clientView2 = kind === "cred"
        ? "crédito OK · saldo R$ " + state.saldo2
        : "saldo R$ " + state.saldo2;
      bump("calls");
      log("📬 Resposta da chamada #" + id + " chegou: <strong>" + state.clientView2 +
        "</strong>.");
      state.busy2 = false;
      if (state.stage === 2) { renderStage2(); }
      updateNav();
    }

    /* ============ Etapa 3 — Caiu ou executou? (apostas) ============ */

    function renderStage3() {
      els.area.innerHTML =
        '<div class="demo-rf-world">' +
        '  <div class="demo-rf-machine">' +
        '    <p class="demo-rf-machine-title">💻 Cliente</p>' +
        '    <p class="demo-rf-note" data-client3>' +
        (state.roundActive ? "esperando resposta…" : "pronto para chamar") + "</p>" +
        "  </div>" +
        '  <div class="demo-rf-machine' + (state.roundActive ? " demo-rf-covered" : "") +
        '" data-covered="' + state.roundActive + '">' +
        '    <p class="demo-rf-machine-title">🏦 Banco (servidor)' +
        (state.serverUp ? "" : " — 💀 fora do ar") + "</p>" +
        '    <p class="demo-rf-big">saldo: R$ <strong data-saldo3>' + state.saldo3 +
        "</strong></p>" +
        '    <p class="demo-rf-note">execuções: <strong data-execs3>' + state.execs3 +
        "</strong></p>" +
        "  </div>" +
        "</div>" +
        '<div class="demo-cf-challenge">' +
        '  <span class="demo-cf-score" data-round="' + state.round + '" data-hits="' +
        state.hits + '">Rodadas: ' + state.round + " · Acertos: " + state.hits + "</span>" +
        '  <span class="demo-cf-guesses" data-guesses' +
        (state.roundActive && state.scenario === "bet" ? "" : " hidden") + ">" +
        "    aposte: " +
        '    <button type="button" class="btn btn-secondary demo-rf-bet-yes">executou</button>' +
        '    <button type="button" class="btn btn-secondary demo-rf-bet-no">não executou</button>' +
        "  </span>" +
        '  <div class="demo-cf-xray" data-xray hidden></div>' +
        "</div>";
      els.controls.innerHTML =
        '<button type="button" class="btn demo-rf-round"' +
        (state.busy3 || state.roundActive ? " disabled" : "") +
        ">🎲 Nova rodada: creditar(10) remoto</button>" +
        '<button type="button" class="btn btn-secondary demo-rf-local"' +
        (state.busy3 ? " disabled" : "") + ">▶ Chamada local de controle</button>";
      els.controls.querySelector(".demo-rf-round").addEventListener("click", startRound3);
      els.controls.querySelector(".demo-rf-local").addEventListener("click", function () {
        log("✅ Chamada <strong>local</strong>: retornou na hora, executou <strong>exatamente " +
          "uma vez</strong>. Sem rede não há ambiguidade — esse é o mundo de onde a RPC " +
          "tenta importar a sintaxe.");
      });
      var yes = els.area.querySelector(".demo-rf-bet-yes");
      var no = els.area.querySelector(".demo-rf-bet-no");
      if (yes) yes.addEventListener("click", function () { bet3(true); });
      if (no) no.addEventListener("click", function () { bet3(false); });
    }

    function startRound3() {
      if (state.busy3 || state.roundActive) return;
      state.busy3 = true;
      state.roundActive = true;
      state.events3 = [];
      var scripted = ["reqlost", "resplost", "crashafter"];
      state.scenarioReal = state.round < 3
        ? scripted[state.round]
        : scripted[Math.floor(rand() * 3)];
      state.scenario = "run";
      renderStage3();
      log("— 🎲 rodada " + (state.round + 1) + ": o cliente chama creditar(10); o servidor " +
        "está <strong>encoberto</strong> até a aposta —");
      log("✉️ Requisição enviada… ⏳ esperando resposta…");
      bump("msgs");
      var sc = state.scenarioReal;
      if (sc === "reqlost") {
        state.events3.push("a requisição se perdeu na rede — o servidor nunca a recebeu");
      } else {
        state.events3.push("a requisição chegou; o servidor executou creditar(10)");
        state.saldo3 += 10;
        state.execs3++;
        bump("execs");
        if (sc === "resplost") {
          state.events3.push("a resposta foi enviada — e se perdeu na volta");
        } else {
          state.events3.push("o servidor COLAPSOU logo depois de executar — sem resposta");
          state.serverUp = false;
        }
      }
      to(function () {
        if (state.stage !== 3) return;
        log("⏲️ Timeout. ❌ <strong>EXCEÇÃO: nenhum resultado.</strong> E agora: o crédito " +
          "aconteceu ou não?");
        state.scenario = "bet";
        state.busy3 = false;
        renderStage3();
      }, 1800);
    }

    function bet3(saidYes) {
      if (state.scenario !== "bet") return;
      var executou = state.scenarioReal !== "reqlost";
      var right = saidYes === executou;
      state.round++;
      if (right) state.hits++;
      state.roundActive = false;
      state.scenario = null;
      renderStage3();
      var xray = els.area.querySelector("[data-xray]");
      xray.hidden = false;
      xray.setAttribute("data-scenario", state.scenarioReal);
      xray.innerHTML =
        "<p><strong>Raio-X da rodada:</strong> " + CENARIO_LABEL[state.scenarioReal] +
        ". Seu palpite: <em>" + (saidYes ? "executou" : "não executou") + "</em> — " +
        (right ? "✅ acerto." : "❌ erro.") + "</p>" +
        "<ul>" + state.events3.map(function (e) { return "<li>" + e + "</li>"; }).join("") +
        "</ul>" +
        "<p>Do lado do cliente, as três situações são <strong>a mesma exceção</strong>. " +
        "É por isso que a diferença local × remoto precisa aparecer na " +
        "<strong>interface</strong> — e por que “no máximo uma vez” existe.</p>";
      log("🩻 Raio-X: " + CENARIO_LABEL[state.scenarioReal] + " — palpite " +
        (right ? "certo" : "errado") + " (acertos: " + state.hits + "/" + state.round + ").");
      if (!state.serverUp) {
        state.serverUp = true;
        log("🔧 O servidor voltou ao ar para a próxima rodada.");
        renderStage3();
        var xr = els.area.querySelector("[data-xray]");
        xr.hidden = false;
        xr.setAttribute("data-scenario", state.scenarioReal);
        xr.innerHTML = xray.innerHTML;
      }
      updateNav();
    }

    /* ============ Etapa 4 — Referência ou cópia ============ */

    function fig(color) {
      return color === null ? "—"
        : (color === "azul" ? "🔵" : "🔴") + " círculo " + color;
    }

    function conv4Check() {
      var all = state.colorSrv === state.colorB &&
        (!state.hasCopy || state.colorA === state.colorSrv);
      if (all && state.colorSrv === "vermelho") state.conv4 = true;
      return all;
    }

    function renderStage4() {
      var eq = conv4Check();
      els.area.innerHTML =
        '<div class="demo-rf-world">' +
        '  <div class="demo-rf-machine">' +
        '    <p class="demo-rf-machine-title">💻 Cliente A</p>' +
        '    <p class="demo-rf-big" data-color-a="' + (state.colorA || "nenhuma") + '">' +
        (state.hasCopy ? "cópia local: " + fig(state.colorA) : "<em>sem cópia ainda</em>") +
        "</p>" +
        '    <p class="demo-rf-note">referência remota para a figura: sempre disponível</p>' +
        "  </div>" +
        '  <div class="demo-rf-machine">' +
        '    <p class="demo-rf-machine-title">🗄️ Servidor (quadro branco)</p>' +
        '    <p class="demo-rf-big" data-color-srv="' + state.colorSrv + '">figura: ' +
        fig(state.colorSrv) + "</p>" +
        "  </div>" +
        '  <div class="demo-rf-machine">' +
        '    <p class="demo-rf-machine-title">💻 Cliente B (só observa o servidor)</p>' +
        '    <p class="demo-rf-big" data-color-b="' + state.colorB + '">vê: ' +
        fig(state.colorB) + "</p>" +
        "  </div>" +
        "</div>" +
        '<p class="demo-rf-status" data-div4="' + state.div4 + '" data-conv4="' +
        state.conv4 + '">bytes copiados: <strong data-bytes-copied>' + state.bytesCopied +
        "</strong> · viagens de rede por acesso remoto: <strong data-trips>" + state.trips +
        '</strong> — <span class="demo-rf-diverge ' + (eq ? "is-ok" : "is-bad") + '">' +
        (eq ? "✓ todos veem a mesma figura" : "✗ estados DIVERGENTES") + "</span></p>";
      els.controls.innerHTML =
        '<button type="button" class="btn demo-rf-copy"' +
        (state.busy4 || state.hasCopy ? " disabled" : "") +
        ">📦 A recebe a figura por VALOR (cópia serializável)</button>" +
        '<button type="button" class="btn btn-secondary demo-rf-paint"' +
        (state.busy4 || !state.hasCopy ? " disabled" : "") +
        ">🎨 A pinta a SUA cópia de vermelho</button>" +
        '<button type="button" class="btn btn-secondary demo-rf-invoke"' +
        (state.busy4 ? " disabled" : "") +
        ">🔗 A invoca pintar(“vermelho”) pela REFERÊNCIA remota</button>" +
        '<button type="button" class="btn-ghost demo-rf-fig-reset"' +
        (state.busy4 ? " disabled" : "") + ">↺ Recomeçar figura (azul)</button>";
      els.controls.querySelector(".demo-rf-copy").addEventListener("click", copy4);
      els.controls.querySelector(".demo-rf-paint").addEventListener("click", paint4);
      els.controls.querySelector(".demo-rf-invoke").addEventListener("click", invoke4);
      els.controls.querySelector(".demo-rf-fig-reset").addEventListener("click", function () {
        state.hasCopy = false; state.colorA = null;
        state.colorSrv = "azul"; state.colorB = "azul";
        log("↺ Figura de volta ao azul; A ficou sem cópia.");
        renderStage4();
      });
    }

    function copy4() {
      if (state.busy4 || state.hasCopy) return;
      state.busy4 = true;
      renderStage4();
      log("📦 A chama getFigura() — o objeto NÃO é remoto, então viaja <strong>por " +
        "valor</strong>: o servidor serializa a figura inteira…");
      bump("msgs");
      to(function () {
        bump("msgs");
        state.hasCopy = true;
        state.colorA = state.colorSrv;
        state.bytesCopied += COPY_BYTES;
        state.trips++;
        bump("calls");
        log("📬 " + COPY_BYTES + " bytes depois, um objeto <strong>novo</strong> nasceu no " +
          "processo de A — uma cópia. Daqui em diante, os estados são independentes.");
        state.busy4 = false;
        if (state.stage === 4) renderStage4();
        updateNav();
      }, 900);
    }

    function paint4() {
      if (state.busy4 || !state.hasCopy) return;
      state.colorA = "vermelho";
      if (state.colorSrv !== state.colorA) {
        state.div4 = true;
        log("🎨 A pintou a cópia: acesso <strong>local</strong>, zero viagens — mas só a " +
          "cópia mudou. O servidor e B continuam vendo " + fig(state.colorSrv) +
          ": <strong>os estados divergiram</strong>, exatamente como o texto avisa.");
      } else {
        log("🎨 A repintou a cópia local (já estava vermelha).");
      }
      renderStage4();
      updateNav();
    }

    function invoke4() {
      if (state.busy4) return;
      state.busy4 = true;
      renderStage4();
      log("🔗 A invoca pintar(“vermelho”) na <strong>referência de objeto remoto</strong> — " +
        "a mensagem leva só a referência + argumentos…");
      bump("msgs");
      to(function () {
        bump("execs");
        state.colorSrv = "vermelho";
        state.colorB = "vermelho";
        log("🗄️ O servente executou pintar(): a figura DO SERVIDOR mudou — e B vê na hora. " +
          "Um único estado, compartilhado.");
      }, 700);
      to(function () {
        bump("msgs");
        state.trips++;
        bump("calls");
        log("📬 Resposta OK. Custo do modo referência: <strong>1 viagem de rede por " +
          "acesso</strong> (latência ordens de grandeza acima da local — os números " +
          "estão no cap. 7 do Coulouris), em troca de nunca copiar nem divergir.");
        state.busy4 = false;
        if (state.stage === 4) renderStage4();
        updateNav();
      }, 1200);
    }

    /* ============ Etapa 5 — Do lookup ao lease ============ */

    var leaseTicker = null;

    function holdersHtml() {
      return state.holders.length
        ? state.holders.map(function (h) {
            return "<li>" + h + (state.leaseOn
              ? " — lease: " + (state.clientDead
                ? Math.max(0, Math.ceil(state.leaseLeft / 1000)) + "s (sem renovação!)"
                : "renovado ✓")
              : " — sem lease") + "</li>";
          }).join("")
        : "<li><em>vazio" + (state.collected ? " → objeto coletado 🗑️" : "") + "</em></li>";
    }

    function renderStage5() {
      els.area.innerHTML =
        '<div class="demo-rf-world">' +
        '  <div class="demo-rf-machine" data-dead="' + state.clientDead + '">' +
        '    <p class="demo-rf-machine-title">💻 Cliente' +
        (state.clientDead ? " — 💀 morto (sem desregistrar)" : "") + "</p>" +
        '    <p class="demo-rf-note" data-proxy5>' +
        (state.lookup5 ? "proxy do banco criado ✓" : "<em>ainda sem referência</em>") + "</p>" +
        '    <p class="demo-rf-note">consultas vazias (polling): <strong data-polls>' +
        state.polls + "</strong></p>" +
        '    <p class="demo-rf-note" data-cbstate>callback: ' +
        (state.cbOn ? "registrado 🔔" : "não registrado") +
        (state.cbNotified ? " · notificado ⚡" : "") + "</p>" +
        "  </div>" +
        '  <div class="demo-rf-machine">' +
        '    <p class="demo-rf-machine-title">📇 Vinculador (RMIregistry)</p>' +
        '    <p class="demo-rf-note" data-registry>' +
        (state.bound5 ? "<code>//servidor/banco</code> → referência remota ✓"
          : "<em>tabela vazia</em>") + "</p>" +
        "  </div>" +
        '  <div class="demo-rf-machine">' +
        '    <p class="demo-rf-machine-title">🏦 Servidor</p>' +
        '    <p class="demo-rf-note">objeto banco: <strong data-obj5>' +
        (state.collected ? "COLETADO 🗑️" : (state.bound5 ? "vivo" : "ainda não criado")) +
        "</strong></p>" +
        '    <p class="demo-rf-note">B.holders (quem tem referências):</p>' +
        '    <ul class="demo-rf-holders" data-holders="' + state.holders.length + '">' +
        holdersHtml() + "</ul>" +
        "  </div>" +
        "</div>" +
        '<p class="demo-rf-status" data-leak-seen="' + state.leakSeen +
        '" data-collected="' + state.collected + '" data-cb-notified="' + state.cbNotified +
        '"></p>';
      els.controls.innerHTML =
        '<button type="button" class="btn demo-rf-bind5"' +
        (state.busy5 || state.bound5 ? " disabled" : "") +
        ">🏭 Servidor: fábrica + rebind(//servidor/banco)</button>" +
        '<button type="button" class="btn demo-rf-lookup5"' +
        (state.busy5 || !state.bound5 || state.lookup5 ? " disabled" : "") +
        ">🔎 Cliente: lookup(//servidor/banco)</button>" +
        '<button type="button" class="btn btn-secondary demo-rf-poll5"' +
        (state.busy5 || !state.lookup5 || state.clientDead || state.collected ? " disabled" : "") +
        ">🔁 Cliente: alguma novidade? (polling)</button>" +
        '<button type="button" class="btn btn-secondary demo-rf-cb5"' +
        (state.busy5 || !state.lookup5 || state.cbOn || state.clientDead || state.collected
          ? " disabled" : "") + ">🔔 Cliente: registrar callback</button>" +
        '<button type="button" class="btn btn-secondary demo-rf-event5"' +
        (state.busy5 || !state.bound5 || state.collected ? " disabled" : "") +
        ">⚡ Evento no servidor (juros creditados)</button>" +
        '<button type="button" class="btn btn-secondary demo-rf-die5"' +
        (state.busy5 || !state.lookup5 || state.clientDead ? " disabled" : "") +
        ">💀 Cliente morre (sem desregistrar)</button>" +
        '<label class="demo-rf-leaselabel"><input type="checkbox" class="demo-rf-lease5"' +
        (state.leaseOn ? " checked" : "") + (state.collected ? " disabled" : "") +
        "> arrendamento (lease de " + Math.round(LEASE_MS / 1000) + " s, renovado por " +
        "clientes vivos)</label>" +
        '<button type="button" class="btn-ghost demo-rf-reset5">↺ Reiniciar cenário</button>';
      els.controls.querySelector(".demo-rf-bind5").addEventListener("click", bind5);
      els.controls.querySelector(".demo-rf-lookup5").addEventListener("click", lookup5);
      els.controls.querySelector(".demo-rf-poll5").addEventListener("click", poll5);
      els.controls.querySelector(".demo-rf-cb5").addEventListener("click", cb5);
      els.controls.querySelector(".demo-rf-event5").addEventListener("click", event5);
      els.controls.querySelector(".demo-rf-die5").addEventListener("click", die5);
      els.controls.querySelector(".demo-rf-lease5").addEventListener("change", function (ev) {
        state.leaseOn = ev.target.checked;
        if (state.leaseOn) {
          state.leaseLeft = LEASE_MS;
          state.renewLogged = false;
          log("📜 <strong>Arrendamento ligado</strong>: cada referência agora vale por " +
            Math.round(LEASE_MS / 1000) + " s; clientes vivos renovam sozinhos — quem " +
            "some, expira.");
        } else {
          log("🚫 Arrendamento desligado: referências valem para sempre (por sua conta e " +
            "risco).");
        }
        renderStage5();
      });
      els.controls.querySelector(".demo-rf-reset5").addEventListener("click", function () {
        state.bound5 = false; state.lookup5 = false; state.holders = [];
        state.cbOn = false; state.polls = 0; state.clientDead = false;
        state.leaseOn = false; state.leaseLeft = 0; state.collected = false;
        state.renewLogged = false;
        log("↺ Cenário reiniciado (as metas já cumpridas permanecem).");
        renderStage5();
      });
    }

    function bind5() {
      if (state.bound5) return;
      state.bound5 = true;
      log("🏭 O servidor criou o objeto banco por <strong>método de fábrica</strong> " +
        "(interfaces remotas não têm construtores), exportou-o e registrou " +
        "<code>//servidor/banco</code> no <strong>vinculador</strong> com rebind.");
      renderStage5();
    }

    function lookup5() {
      if (!state.bound5 || state.lookup5) return;
      state.lookup5 = true;
      state.holders = ["Cliente 1"];
      bump("msgs"); bump("msgs");
      log("🔎 lookup(//servidor/banco) → o cliente recebeu a <strong>referência de objeto " +
        "remoto</strong>, criou o proxy e chamou <strong>addRef</strong>: o servidor " +
        "anotou o cliente em <strong>B.holders</strong>.");
      if (state.leaseOn) state.leaseLeft = LEASE_MS;
      renderStage5();
      updateNav();
    }

    function poll5() {
      if (!state.lookup5 || state.clientDead || state.collected) return;
      state.polls++;
      bump("msgs"); bump("msgs");
      log("🔁 Polling nº " + state.polls + ": “alguma novidade?” — <em>não</em>. Duas " +
        "mensagens gastas para descobrir que nada mudou" +
        (state.polls >= 2 ? " (e o servidor atende TODOS os curiosos assim — há um jeito " +
          "melhor: o callback)" : "") + ".");
      renderStage5();
    }

    function cb5() {
      if (!state.lookup5 || state.cbOn || state.clientDead) return;
      state.cbOn = true;
      bump("msgs");
      log("🔔 O cliente criou um <strong>objeto remoto próprio</strong> de callback e o " +
        "registrou no servidor (register): agora é o servidor quem liga.");
      renderStage5();
    }

    function event5() {
      if (!state.bound5 || state.collected) return;
      log("⚡ Evento no servidor: juros creditados na conta.");
      if (state.cbOn && !state.clientDead) {
        bump("msgs");
        state.cbNotified = true;
        log("📞 O servidor invocou o <strong>callback</strong> do cliente: notificado na " +
          "hora, com UMA mensagem — sem nenhuma consulta vazia.");
      } else if (state.clientDead && !state.leaseOn) {
        state.leakSeen = true;
        if (state.cbOn) {
          bump("msgs");
          log("💥 O servidor tentou o callback do cliente MORTO: erro. E B.holders ainda o " +
            "lista — o servidor segue <strong>preso a um fantasma</strong>, guardando " +
            "objeto e registro para ninguém.");
        } else {
          log("🕳️ Ninguém registrado para avisar — e B.holders ainda lista o cliente morto: " +
            "o objeto não pode ser coletado. <strong>Vazamento</strong> à vista.");
        }
      } else if (state.clientDead && state.leaseOn) {
        log("⏳ Cliente morto, mas o lease dele está correndo — o sistema vai se limpar " +
          "sozinho.");
      } else {
        log("🕳️ Ninguém registrou callback: quem faz polling só descobrirá na próxima " +
          "consulta.");
      }
      renderStage5();
      updateNav();
    }

    function die5() {
      if (!state.lookup5 || state.clientDead) return;
      state.clientDead = true;
      if (state.leaseOn) state.leaseLeft = LEASE_MS;
      log("💀 O cliente morreu <strong>sem desregistrar nada</strong> — nem removeRef, nem " +
        "deregister do callback. O servidor não fica sabendo… a menos que algo expire.");
      renderStage5();
    }

    function tickLease() {
      if (!container.isConnected) { clearInterval(leaseTicker); return; }
      if (state.stage !== 5 || !state.leaseOn || !state.lookup5 || state.collected) return;
      if (!state.clientDead) {
        state.leaseLeft = LEASE_MS;
        if (!state.renewLogged) {
          state.renewLogged = true;
          log("🔄 O cliente (vivo) renovou o lease antes de expirar — é responsabilidade " +
            "de quem usa o recurso.");
          renderStage5();
        }
        return;
      }
      state.leaseLeft -= 500;
      var el = els.area.querySelector("[data-holders]");
      if (el) el.innerHTML = holdersHtml();
      if (state.leaseLeft <= 0) {
        state.holders = [];
        state.cbOn = false;
        state.collected = true;
        log("⌛ <strong>Lease expirado</strong> sem renovação: o servidor removeu o cliente " +
          "de B.holders e descartou o callback morto.");
        log("🗑️ B.holders vazio → o coletor de lixo <strong>recolheu o objeto banco</strong>. " +
          "Nenhum protocolo perguntou “você ainda está aí?” — o tempo respondeu.");
        renderStage5();
        updateNav();
      }
    }

    /* ============ Etapas ============ */

    var STAGES = [
      {
        title: "Etapa 1 — Raio-X da chamada",
        instructions: "O código do cliente tem UMA linha: saldo = banco.consultar(). " +
          "Chame ANTES de montar a linha e veja onde a chamada morre; depois instale " +
          "stub, despachante, esqueleto e servente (a ordem importa) e chame de novo.",
        goalText: "Meta: ver 1 chamada morrer na linha desmontada e 1 chamada completa " +
          "percorrer as 8 estações.",
        setup: function () { state.busy1 = false; },
        render: renderStage1,
        goalMet: function () { return state.failSeen && state.call8Done; }
      },
      {
        title: "Etapa 2 — Escolha a promessa (semânticas de chamada)",
        instructions: "Agora o middleware trabalha sozinho — mas a PROMESSA é escolha sua. " +
          "Credite sob “talvez”; depois sob “pelo menos uma vez”; depois sob “no máximo " +
          "uma vez”. Compare também uma consulta sob “pelo menos uma vez”.",
        goalText: "Meta: viver as três promessas — a exceção ambígua do talvez, o crédito " +
          "em dobro do pelo menos uma vez e a correção (com custo) do no máximo uma vez.",
        setup: function () { state.busy2 = false; },
        render: renderStage2,
        goalMet: function () {
          return state.talvezSeen && state.doubleSeen && state.fixSeen;
        }
      },
      {
        title: "Etapa 3 — Caiu ou executou?",
        instructions: "A cada rodada, uma chamada remota termina em exceção com o servidor " +
          "encoberto. Aposte se a operação executou; o raio-X revela. Compare com a " +
          "chamada local de controle.",
        goalText: "Meta: completar 3 rodadas de aposta.",
        setup: function () {
          state.busy3 = false; state.roundActive = false; state.scenario = null;
        },
        render: renderStage3,
        goalMet: function () { return state.round >= 3; }
      },
      {
        title: "Etapa 4 — Referência ou cópia",
        instructions: "O servidor guarda uma figura de quadro branco. Receba-a como cópia " +
          "serializável, pinte a SUA cópia e veja quem fica sabendo; depois invoque " +
          "pintar() pela referência remota e compare os custos.",
        goalText: "Meta: fazer os estados divergirem com a cópia e convergirem pela " +
          "referência.",
        setup: function () { state.busy4 = false; },
        render: renderStage4,
        goalMet: function () { return state.div4 && state.conv4; }
      },
      {
        title: "Etapa 5 — Do lookup ao lease",
        instructions: "Monte o ciclo de vida: fábrica + rebind, lookup, callback no lugar " +
          "do polling. Depois mate o cliente sem desregistrar, dispare um evento e veja o " +
          "vazamento; ligue o arrendamento e espere o sistema se limpar.",
        goalText: "Meta: receber 1 callback, ver o vazamento do cliente morto e a coleta " +
          "do objeto após o lease expirar.",
        setup: function () { state.busy5 = false; },
        render: renderStage5,
        goalMet: function () {
          return state.cbNotified && state.leakSeen && state.collected;
        }
      }
    ];

    function updateNav() {
      var st = STAGES[state.stage - 1];
      els.stageCounter.textContent = "Etapa " + state.stage + " de " + STAGES.length;
      els.prev.disabled = state.stage === 1;
      els.next.disabled = state.stage === STAGES.length || !st.goalMet();
      els.goal.innerHTML = st.goalText + (st.goalMet()
        ? ' <strong class="demo-cf-goal-ok">✓ cumprida' +
          (state.stage < STAGES.length ? " — avance!" : "") + "</strong>"
        : "");
      if (state.stage === STAGES.length && st.goalMet()) els.summary.hidden = false;
    }

    function gotoStage(n) {
      state.stage = n;
      var st = STAGES[n - 1];
      els.title.innerHTML = "<strong>" + st.title + "</strong>";
      els.instructions.textContent = st.instructions;
      log("— " + st.title + " —");
      st.setup();
      st.render();
      updateNav();
    }

    els.prev.addEventListener("click", function () { if (state.stage > 1) gotoStage(state.stage - 1); });
    els.next.addEventListener("click", function () {
      if (state.stage < STAGES.length) gotoStage(state.stage + 1);
    });
    /* Reset: remonta o módulo do zero no mesmo contêiner (estado e timers
       antigos ficam órfãos; com ?demo-seed a sequência se repete). */
    container.querySelector(".demo-cf-reset").addEventListener("click", function () {
      clearInterval(leaseTicker);
      mount(container);
    });

    leaseTicker = setInterval(tickLease, 500 * timeScale);

    gotoStage(1);
  }

  return { mount: mount };
})();
