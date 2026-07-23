/* ============================================================
   demos/caracterizacao-falhas.js — Demo "Caiu ou está lenta?"
   ------------------------------------------------------------
   Demonstração interativa do Tópico 1 (seção Desafios): um
   cliente envia pedidos por uma rede que perde e atrasa
   mensagens; o aluno vive a indistinguibilidade entre servidor
   morto e rede lenta e experimenta timeout/retransmissão e
   redundância. Plano e fundamentação:
   docs/demos/2026-07-13-demo-caracterizacao-falhas-plano.md

   Regra central: o LOG mostra apenas o que o cliente observa.
   A animação mostra a rede — exceto na etapa 3, coberta por
   "névoa" até o aluno apostar.

   Teste determinístico (Playwright): ?demo-seed=<int> fixa o
   gerador pseudoaleatório; ?demo-fast=1 acelera o tempo (15%).
   Namespace: SD.demos["caracterizacao-falhas"]
   ============================================================ */

window.SD = window.SD || {};
SD.demos = SD.demos || {};

SD.demos["caracterizacao-falhas"] = (function () {
  "use strict";

  var MAX_ATTEMPTS = 3;
  var MAX_SERVERS = 3;
  var BASE_LATENCY = 600; // ms por perna (ida OU volta), com jitter
  var SERVER_NAMES = ["A", "B", "C"];

  /* ---- PRNG com semente (mulberry32) para testes reproduzíveis ---- */
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function mount(container) {
    var params = new URLSearchParams(window.location.search);
    var seed = parseInt(params.get("demo-seed"), 10);
    var rand = isNaN(seed) ? Math.random : mulberry32(seed);
    var timeScale = params.get("demo-fast") ? 0.15 : 1;
    var startedAt = Date.now();

    var state = {
      stage: 1,
      lossRate: 0,           // etapa 2+ (slider)
      timeoutMs: 800,        // etapa 4+ (slider)
      retry: false,          // etapa 4+ (toggle)
      sent: 0,
      responses: 0,
      timeouts: 0,
      duplicates: 0,
      stage2drops: 0,
      requests: {},
      servers: [newServer(0)],
      challenge: { active: false, scenario: null, rounds: 0, hits: 0, events: [] },
      stage5kill: false      // já derrubou servidor tendo réplica no ar
    };

    function newServer(i) {
      return { index: i, up: true, suspected: false, seen: {}, dups: 0 };
    }

    /* ================= Estrutura da interface ================= */

    container.innerHTML =
      '<div class="demo-cf">' +
      '  <div class="demo-cf-head">' +
      '    <span class="badge demo-cf-badge">Demonstração</span>' +
      '    <p class="demo-cf-title"></p>' +
      '    <p class="demo-cf-instructions"></p>' +
      '    <p class="demo-cf-goal"></p>' +
      '  </div>' +
      '  <div class="demo-cf-world">' +
      '    <div class="demo-cf-client">' +
      '      <span class="demo-cf-node-icon" aria-hidden="true">💻</span>' +
      '      <span class="demo-cf-node-name">Cliente</span>' +
      '      <button type="button" class="btn demo-cf-send">📨 Enviar pedido</button>' +
      '    </div>' +
      '    <div class="demo-cf-net" aria-hidden="true"></div>' +
      '    <div class="demo-cf-servers"></div>' +
      '  </div>' +
      '  <div class="demo-cf-controls"></div>' +
      '  <div class="demo-cf-challenge" hidden>' +
      '    <button type="button" class="btn demo-cf-round">🎲 Nova rodada</button>' +
      '    <span class="demo-cf-score">Rodadas: 0 · Acertos: 0</span>' +
      '    <div class="demo-cf-guesses" hidden>' +
      '      <span>O que está acontecendo?</span>' +
      '      <button type="button" class="btn btn-secondary" data-guess="down">Servidor caiu</button>' +
      '      <button type="button" class="btn btn-secondary" data-guess="slow">Rede lenta</button>' +
      '      <button type="button" class="btn btn-secondary" data-guess="loss">Mensagens sendo perdidas</button>' +
      '    </div>' +
      '    <div class="demo-cf-xray" hidden></div>' +
      '  </div>' +
      '  <dl class="demo-cf-metrics">' +
      '    <div><dt>Enviados</dt><dd data-metric="sent">0</dd></div>' +
      '    <div><dt>Respostas</dt><dd data-metric="responses">0</dd></div>' +
      '    <div><dt>Timeouts</dt><dd data-metric="timeouts">0</dd></div>' +
      '    <div><dt>Disponibilidade</dt><dd data-metric="availability">—</dd></div>' +
      '  </dl>' +
      '  <div class="demo-cf-summary callout" hidden>' +
      '    <p class="callout-title">🎓 O que você acabou de viver</p>' +
      '    <p><strong>Falha parcial</strong>: partes caem, o resto segue. ' +
      '    <strong>Suspeita × detecção</strong>: o timeout não prova nada — só levanta suspeita. ' +
      '    <strong>Mascaramento</strong>: retransmitir esconde perdas, ao custo de duplicatas. ' +
      '    <strong>Redundância</strong>: réplicas mantêm a <strong>disponibilidade</strong> ' +
      '    quando um servidor morre. E as falácias nº 1 e nº 5 — "a rede é confiável", ' +
      '    "a latência é zero" — são falsas.</p>' +
      '  </div>' +
      '  <div class="demo-cf-log-wrap">' +
      '    <p class="demo-cf-log-title">O que o <strong>cliente</strong> vê:</p>' +
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
      send: container.querySelector(".demo-cf-send"),
      net: container.querySelector(".demo-cf-net"),
      servers: container.querySelector(".demo-cf-servers"),
      controls: container.querySelector(".demo-cf-controls"),
      challenge: container.querySelector(".demo-cf-challenge"),
      round: container.querySelector(".demo-cf-round"),
      score: container.querySelector(".demo-cf-score"),
      guesses: container.querySelector(".demo-cf-guesses"),
      xray: container.querySelector(".demo-cf-xray"),
      metrics: container.querySelector(".demo-cf-metrics"),
      summary: container.querySelector(".demo-cf-summary"),
      log: container.querySelector(".demo-cf-log"),
      prev: container.querySelector(".demo-cf-prev"),
      next: container.querySelector(".demo-cf-next"),
      stageCounter: container.querySelector(".demo-cf-stage-counter")
    };

    /* ================= Etapas ================= */

    var STAGES = [
      {
        title: "Etapa 1 — Mundo perfeito",
        instructions: "A rede entrega tudo, com latência baixa. Envie pedidos e observe o " +
          "ciclo completo: pedido vai (azul), resposta volta (verde).",
        goalText: "Meta: receber 3 respostas.",
        setup: function () { state.lossRate = 0; state.retry = false; },
        goalMet: function () { return state.responses >= 3; }
      },
      {
        title: "Etapa 2 — A rede perde mensagens",
        instructions: "Agora parte das mensagens some no caminho — sem aviso, sem erro. " +
          "Repare no log: “sem resposta” não diz SE nem ONDE algo falhou " +
          "(ida? volta? servidor?).",
        goalText: "Meta: presenciar ao menos 1 mensagem perdida.",
        setup: function () { if (state.lossRate === 0) state.lossRate = 0.3; state.retry = false; },
        goalMet: function () { return state.stage2drops >= 1; }
      },
      {
        title: "Etapa 3 — Caiu ou está lenta?",
        instructions: "Sorteie uma rodada: a rede fica encoberta e algo (oculto) acontece. " +
          "Envie pedidos, observe apenas o que o cliente vê e aposte. Depois o raio-X revela.",
        goalText: "Meta: completar 3 rodadas de aposta.",
        setup: function () { state.retry = false; endRound(); },
        goalMet: function () { return state.challenge.rounds >= 3; }
      },
      {
        title: "Etapa 4 — Timeout e retransmissão",
        instructions: "Sem detecção possível, resta suspeitar: espere um prazo (timeout) e " +
          "reenvie. Use um timeout curto e veja o efeito colateral no servidor: " +
          "pedidos duplicados.",
        goalText: "Meta: provocar ao menos 1 pedido duplicado no servidor.",
        setup: function () {
          state.retry = true;
          if (state.lossRate === 0) state.lossRate = 0.3;
          endRound();
        },
        goalMet: function () { return state.duplicates >= 1; }
      },
      {
        title: "Etapa 5 — Redundância",
        instructions: "Adicione réplicas e derrube servidores clicando neles. Com uma " +
          "réplica no ar, o serviço sobrevive à falha parcial — acompanhe a disponibilidade.",
        goalText: "Meta: derrubar um servidor tendo réplica no ar e ainda receber resposta.",
        setup: function () {
          state.retry = true;
          // Um timeout curto demais (herdado da etapa 4) faria todo pedido
          // desistir antes da 1ª resposta e confundiria a lição de redundância
          if (state.timeoutMs < 2000) state.timeoutMs = 2000;
        },
        goalMet: function () { return state.stage5kill && state.responses > 0; }
      }
    ];

    /* ================= Utilidades ================= */

    function now() { return Date.now(); }

    function log(text) {
      var li = document.createElement("li");
      var t = ((now() - startedAt) / 1000).toFixed(1);
      li.innerHTML = '<span class="demo-cf-log-time">+' + t + "s</span> " + text;
      els.log.insertBefore(li, els.log.firstChild);
      while (els.log.children.length > 40) els.log.removeChild(els.log.lastChild);
    }

    function currentLoss() {
      if (state.challenge.active) return state.challenge.scenario === "loss" ? 0.85 : 0;
      return state.lossRate;
    }

    function legLatency() {
      if (state.challenge.active && state.challenge.scenario === "slow") {
        return 3000 + rand() * 6000;
      }
      return BASE_LATENCY * (0.7 + rand() * 0.6);
    }

    function pickServer() {
      var alive = null;
      for (var i = 0; i < state.servers.length; i++) {
        if (!state.servers[i].suspected) { alive = state.servers[i]; break; }
      }
      if (!alive) { // todos suspeitos: recomeça a tentar do primeiro
        state.servers.forEach(function (s) { s.suspected = false; });
        alive = state.servers[0];
        renderServers();
      }
      return alive;
    }

    /* ================= Rede (animação + entrega) ================= */

    /* kind: "req"|"res"; devolve o destino via onArrive (se não perder). */
    function networkSend(kind, label, server, onArrive) {
      var lost = rand() < currentLoss();
      var duration = legLatency() * timeScale;
      animateDot(kind, server.index, lost, duration);

      if (state.challenge.active) {
        state.challenge.events.push(
          label + (kind === "req" ? " (ida)" : " (volta)") + ": " +
          (lost ? "perdida na rede" : "entregue")
        );
      }
      if (lost) {
        if (state.stage === 2) { state.stage2drops++; updateNav(); }
        return;
      }
      setTimeout(onArrive, duration);
    }

    function animateDot(kind, lane, lost, duration) {
      var dot = document.createElement("span");
      dot.className = "demo-cf-dot " + (kind === "req" ? "is-req" : "is-res");
      var lanes = state.servers.length;
      dot.style.top = (((lane + 0.5) / lanes) * 100) + "%";
      dot.style.transitionDuration = (lost ? duration * 0.45 : duration) + "ms";
      dot.classList.add(kind === "req" ? "pos-client" : "pos-server");
      els.net.appendChild(dot);
      void dot.offsetWidth; // aplica a posição inicial antes de animar
      dot.classList.remove("pos-client", "pos-server");
      if (lost) {
        dot.classList.add("pos-mid");
        setTimeout(function () { dot.classList.add("is-lost"); }, duration * 0.45);
      } else {
        dot.classList.add(kind === "req" ? "pos-server" : "pos-client");
      }
      setTimeout(function () {
        if (dot.parentNode) dot.parentNode.removeChild(dot);
      }, duration + 600);
    }

    /* ================= Cliente ================= */

    function sendRequest() {
      state.sent++;
      var req = { id: state.sent, attempts: 0, done: false, gaveUp: false, t0: now(), timer: null };
      state.requests[req.id] = req;
      attempt(req);
      updateMetrics();
    }

    function attempt(req) {
      req.attempts++;
      var server = pickServer();
      if (req.attempts === 1) {
        log("→ pedido nº" + req.id + " enviado");
      } else {
        log("↻ pedido nº" + req.id + " reenviado (tentativa " + req.attempts + ")");
      }
      networkSend("req", "pedido nº" + req.id, server, function () {
        serverReceive(req, server);
      });
      if (state.retry) {
        req.timer = setTimeout(function () {
          if (req.done || req.gaveUp) return;
          state.timeouts++;
          log("⏱ timeout do pedido nº" + req.id + " — suspeita de falha no servidor " +
            SERVER_NAMES[server.index]);
          server.suspected = true;
          renderServers();
          if (req.attempts < MAX_ATTEMPTS) {
            attempt(req);
          } else {
            req.gaveUp = true;
            log("✕ pedido nº" + req.id + ": desisti após " + MAX_ATTEMPTS + " tentativas");
          }
          updateMetrics();
        }, state.timeoutMs * timeScale);
      }
    }

    function serverReceive(req, server) {
      if (!server.up) return; // servidor fora: a mensagem morre em silêncio
      server.seen[req.id] = (server.seen[req.id] || 0) + 1;
      if (server.seen[req.id] > 1) {
        server.dups++;
        state.duplicates++;
        renderServers();
        updateNav();
      }
      networkSend("res", "resposta nº" + req.id, server, function () {
        clientReceive(req, server);
      });
    }

    function clientReceive(req, server) {
      if (req.gaveUp) {
        log("(resposta tardia do pedido nº" + req.id + " descartada — o cliente já desistiu)");
        return;
      }
      if (req.done) {
        log("(resposta repetida do pedido nº" + req.id + " ignorada)");
        return;
      }
      req.done = true;
      if (req.timer) clearTimeout(req.timer);
      state.responses++;
      server.suspected = false;
      log("← resposta do pedido nº" + req.id + " recebida (" +
        Math.round((now() - req.t0) / timeScale) + " ms)");
      if (state.stage === 5 && state.servers.length >= 2 &&
          state.servers.some(function (s) { return !s.up; })) {
        state.stage5kill = true;
        els.summary.hidden = false;
      }
      renderServers();
      updateMetrics();
    }

    /* ================= Etapa 3 — rodadas ================= */

    function startRound() {
      var draws = ["down", "slow", "loss"];
      var c = state.challenge;
      c.active = true;
      c.scenario = draws[Math.floor(rand() * draws.length)];
      c.events = [];
      state.servers[0].up = c.scenario !== "down";
      els.net.classList.add("is-foggy");
      els.servers.classList.add("is-hidden");
      els.round.disabled = true;
      els.guesses.hidden = false;
      els.xray.hidden = true;
      els.send.disabled = false;
      renderServers();
      log("— 🎲 nova rodada: algo (oculto) aconteceu na rede ou no servidor —");
    }

    function guess(choice) {
      var c = state.challenge;
      if (!c.active) return;
      var names = { down: "servidor caiu", slow: "rede lenta", loss: "mensagens sendo perdidas" };
      var right = choice === c.scenario;
      c.rounds++;
      if (right) c.hits++;
      els.net.classList.remove("is-foggy");
      els.servers.classList.remove("is-hidden");
      els.xray.hidden = false;
      els.xray.innerHTML =
        "<p><strong>Raio-X da rodada:</strong> cenário real — <strong>" +
        names[c.scenario] + "</strong>. Seu palpite: " + names[choice] + " — " +
        (right ? "✅ acerto." : "❌ erro.") + "</p>" +
        (c.events.length
          ? "<ul>" + c.events.map(function (e) { return "<li>" + e + "</li>"; }).join("") + "</ul>"
          : "<p>(nenhuma mensagem foi enviada nesta rodada)</p>") +
        "<p>Sem abrir o raio-X, as três situações são <strong>indistinguíveis</strong> " +
        "para o cliente — é por isso que falha se <em>suspeita</em>, não se detecta.</p>";
      els.score.textContent = "Rodadas: " + c.rounds + " · Acertos: " + c.hits;
      endRound();
      updateNav();
    }

    function endRound() {
      var c = state.challenge;
      c.active = false;
      c.scenario = null;
      state.servers.forEach(function (s) { s.up = true; s.suspected = false; });
      els.net.classList.remove("is-foggy");
      els.servers.classList.remove("is-hidden");
      els.round.disabled = false;
      els.guesses.hidden = true;
      renderServers();
    }

    /* ================= Renderização ================= */

    function renderServers() {
      els.servers.innerHTML = state.servers.map(function (s) {
        var cls = "demo-cf-server " + (s.up ? "is-up" : "is-down") +
          (s.suspected ? " is-suspected" : "") +
          (state.stage === 5 ? " is-clickable" : "");
        return (
          '<button type="button" class="' + cls + '" data-server="' + s.index + '"' +
          (state.stage === 5 ? "" : " disabled") + ">" +
          '<span class="demo-cf-node-icon" aria-hidden="true">🖥️</span>' +
          '<span class="demo-cf-node-name">Servidor ' + SERVER_NAMES[s.index] + "</span>" +
          '<span class="demo-cf-server-state">' +
          (s.up ? "no ar" : "fora do ar") +
          (s.suspected ? " · suspeito p/ cliente" : "") + "</span>" +
          '<span class="demo-cf-server-dups">duplicatas: ' + s.dups + "</span>" +
          "</button>"
        );
      }).join("");
    }

    function renderControls() {
      var html = "";
      if (state.stage >= 2 && state.stage !== 3) {
        html +=
          '<label>Perda de mensagens: <output>' + Math.round(state.lossRate * 100) + "%</output>" +
          '<input type="range" class="demo-cf-loss" min="0" max="50" step="5" value="' +
          Math.round(state.lossRate * 100) + '"></label>';
      }
      if (state.stage >= 4) {
        html +=
          '<label>Timeout: <output>' + state.timeoutMs + " ms</output>" +
          '<input type="range" class="demo-cf-timeout" min="300" max="3000" step="100" value="' +
          state.timeoutMs + '"></label>' +
          '<label class="demo-cf-retry-label"><input type="checkbox" class="demo-cf-retry"' +
          (state.retry ? " checked" : "") + "> Reenviar após timeout (máx. " +
          MAX_ATTEMPTS + " tentativas)</label>";
      }
      if (state.stage === 5) {
        html += '<button type="button" class="btn btn-secondary demo-cf-add-replica"' +
          (state.servers.length >= MAX_SERVERS ? " disabled" : "") +
          ">➕ Adicionar réplica</button>";
      }
      els.controls.innerHTML = html;

      var loss = els.controls.querySelector(".demo-cf-loss");
      if (loss) loss.addEventListener("input", function () {
        state.lossRate = parseInt(loss.value, 10) / 100;
        loss.parentNode.querySelector("output").textContent = loss.value + "%";
      });
      var to = els.controls.querySelector(".demo-cf-timeout");
      if (to) to.addEventListener("input", function () {
        state.timeoutMs = parseInt(to.value, 10);
        to.parentNode.querySelector("output").textContent = to.value + " ms";
      });
      var retry = els.controls.querySelector(".demo-cf-retry");
      if (retry) retry.addEventListener("change", function () {
        state.retry = retry.checked;
      });
      var add = els.controls.querySelector(".demo-cf-add-replica");
      if (add) add.addEventListener("click", function () {
        if (state.servers.length >= MAX_SERVERS) return;
        state.servers.push(newServer(state.servers.length));
        log("＋ réplica adicionada: servidor " + SERVER_NAMES[state.servers.length - 1]);
        renderServers();
        renderControls();
      });
    }

    function updateMetrics() {
      els.metrics.querySelector('[data-metric="sent"]').textContent = state.sent;
      els.metrics.querySelector('[data-metric="responses"]').textContent = state.responses;
      els.metrics.querySelector('[data-metric="timeouts"]').textContent = state.timeouts;
      els.metrics.querySelector('[data-metric="availability"]').textContent =
        state.sent ? Math.round((state.responses / state.sent) * 100) + "%" : "—";
      updateNav();
    }

    function updateNav() {
      var st = STAGES[state.stage - 1];
      els.stageCounter.textContent = "Etapa " + state.stage + " de " + STAGES.length;
      els.prev.disabled = state.stage === 1;
      els.next.disabled = state.stage === STAGES.length || !st.goalMet();
      els.goal.innerHTML = st.goalText + (st.goalMet()
        ? ' <strong class="demo-cf-goal-ok">✓ cumprida' +
          (state.stage < STAGES.length ? " — avance!" : "") + "</strong>"
        : "");
    }

    function gotoStage(stageNumber) {
      state.stage = stageNumber;
      var st = STAGES[stageNumber - 1];
      st.setup();
      els.title.innerHTML = "<strong>" + st.title + "</strong>";
      els.instructions.textContent = st.instructions;
      els.challenge.hidden = state.stage !== 3;
      els.send.disabled = state.stage === 3 && !state.challenge.active;
      renderServers();
      renderControls();
      updateMetrics();
      log("— " + st.title + " —");
    }

    /* ================= Eventos ================= */

    els.send.addEventListener("click", sendRequest);
    els.prev.addEventListener("click", function () { if (state.stage > 1) gotoStage(state.stage - 1); });
    els.next.addEventListener("click", function () {
      if (state.stage < STAGES.length) gotoStage(state.stage + 1);
    });
    els.round.addEventListener("click", startRound);
    /* Reset: remonta o módulo do zero no mesmo contêiner. O estado, o log e
       os timers antigos ficam órfãos (fecham sobre DOM já destacado) e não
       afetam a nova instância; com ?demo-seed, reiniciar reproduz a mesma
       sequência de eventos. */
    container.querySelector(".demo-cf-reset").addEventListener("click", function () {
      mount(container);
    });
    els.guesses.addEventListener("click", function (e) {
      var b = e.target.closest("[data-guess]");
      if (b) guess(b.getAttribute("data-guess"));
    });
    els.servers.addEventListener("click", function (e) {
      if (state.stage !== 5) return;
      var b = e.target.closest("[data-server]");
      if (!b) return;
      var s = state.servers[parseInt(b.getAttribute("data-server"), 10)];
      s.up = !s.up;
      s.suspected = false;
      log(s.up
        ? "🔧 (operador) servidor " + SERVER_NAMES[s.index] + " religado"
        : "💥 (operador) servidor " + SERVER_NAMES[s.index] + " derrubado");
      renderServers();
    });

    gotoStage(1);
  }

  return { mount: mount };
})();
