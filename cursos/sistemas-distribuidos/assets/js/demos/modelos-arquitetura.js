/* ============================================================
   demos/modelos-arquitetura.js — Demo "Arquiteto de Sistemas"
   ------------------------------------------------------------
   Demonstração interativa do Tópico 2 (seção Modelos de
   arquitetura): o aluno serve uma população crescente de
   usuários e mede o efeito de cada decisão arquitetural —
   servidor único satura, réplicas/partições dividem a carga,
   cache alivia ao custo de atualidade, P2P escala com os
   usuários, e 2×3 camadas trocam latência por manutenibilidade.
   Plano e fundamentação:
   docs/demos/2026-07-14-demo-modelos-arquitetura-plano.md

   O simulador usa um modelo de fila SIMPLIFICADO e didático:
   t(ρ) = BASE/(1-ρ), divergindo na saturação (ρ→1). Valores
   absolutos são fictícios; o comportamento qualitativo é o das
   fontes citadas no plano. A simulação é analítica e
   determinística: ?demo-seed é aceito por contrato, mas não há
   aleatoriedade; ?demo-fast=1 acelera os contadores por tempo.
   Namespace: SD.demos["modelos-arquitetura"]
   ============================================================ */

window.SD = window.SD || {};
SD.demos = SD.demos || {};

SD.demos["modelos-arquitetura"] = (function () {
  "use strict";

  var REQ_PER_USER = 0.5;   // pedidos/s gerados por usuário
  var CAP = 100;            // capacidade de um servidor (pedidos/s)
  var PEER_CAP = 1.5;       // capacidade que cada peer traz (pedidos/s)
  var BASE_MS = 60;         // tempo de resposta com sistema ocioso
  var CACHE_MS = 20;        // resposta servida pelo cache
  var HOP_MS = 15;          // custo por salto de localização no P2P
  var TARGET_MS = 250;      // alvo de tempo de resposta
  var HOT_SHARE = 0.7;      // fatia "quente" no modo particionado
  var STAGE2_USERS = 360;   // população da etapa 2: 1 servidor satura, 2 melhoram, 3 fecham
  var MAX_SERVERS = 4;
  var INF = 99999;          // saturado: fila crescendo sem limite
  var SERVER_NAMES = ["A", "B", "C", "D"];

  function mount(container) {
    var params = new URLSearchParams(window.location.search);
    var timeScale = params.get("demo-fast") ? 0.15 : 1;
    var startedAt = Date.now();

    var state = {
      stage: 1,
      users: 100,
      servers: 1,
      mode: "replicado",     // "replicado" | "particionado"
      cacheOn: false,
      cacheHit: 0.6,
      p2p: false,
      saturatedOnce: false,
      staleServed: 0,
      reReplications: 0,
      tiers: { t2: false, t3: false },
      ticks: 0
    };

    /* ============ Modelo (analítico e determinístico) ============ */

    function respTime(rho) {
      return rho < 0.98 ? BASE_MS / (1 - rho) : INF;
    }

    /* Avalia uma configuração para N usuários; devolve métricas. */
    function evaluate(usersN, cfg) {
      var demand = usersN * REQ_PER_USER;
      if (cfg.p2p) {
        var hops = Math.ceil(Math.log(Math.max(usersN, 2)) / Math.LN2);
        var rhoPeer = demand / (usersN * PEER_CAP);
        return {
          /* a utilização também pesa no P2P: o que muda é que a capacidade
             cresce junto com a demanda, então ρ não dispara com a população */
          t: respTime(rhoPeer) + hops * HOP_MS,
          utils: [rhoPeer],
          served: demand,
          hops: hops
        };
      }
      var backend = demand * (cfg.cacheOn ? (1 - cfg.cacheHit) : 1);
      var n = cfg.servers;
      var loads = [];
      var i;
      if (cfg.mode === "particionado" && n > 1) {
        loads.push(backend * HOT_SHARE);
        for (i = 1; i < n; i++) loads.push((backend * (1 - HOT_SHARE)) / (n - 1));
      } else {
        for (i = 0; i < n; i++) loads.push(backend / n);
      }
      var utils = loads.map(function (l) { return l / CAP; });
      var tBackend = 0;
      var anyInf = false;
      loads.forEach(function (l, j) {
        var share = backend > 0 ? l / backend : 1 / n;
        var tj = respTime(utils[j]);
        if (tj >= INF) anyInf = true;
        tBackend += share * tj;
      });
      if (anyInf) tBackend = INF;
      var t = cfg.cacheOn && tBackend < INF
        ? cfg.cacheHit * CACHE_MS + (1 - cfg.cacheHit) * tBackend
        : tBackend;
      if (cfg.cacheOn && tBackend >= INF) t = INF;
      var served = loads.reduce(function (s, l) { return s + Math.min(l, CAP); }, 0) +
        (cfg.cacheOn ? demand * cfg.cacheHit : 0);
      return { t: t, utils: utils, served: served, hops: 0 };
    }

    function current() { return evaluate(state.users, state); }

    /* ============ Estrutura da interface ============ */

    container.innerHTML =
      '<div class="demo-cf demo-ma">' +
      '  <div class="demo-cf-head">' +
      '    <span class="badge demo-cf-badge">Demonstração</span>' +
      '    <p class="demo-cf-title"></p>' +
      '    <p class="demo-cf-instructions"></p>' +
      '    <p class="demo-cf-goal"></p>' +
      '  </div>' +
      '  <div class="demo-ma-userrow">' +
      '    <label>Usuários: <output class="demo-ma-users-out"></output>' +
      '    <input type="range" class="demo-ma-users" min="10" max="1000" step="10"></label>' +
      '    <p class="demo-ma-demand"></p>' +
      '  </div>' +
      '  <div class="demo-ma-world">' +
      '    <div class="demo-ma-bars"></div>' +
      '    <svg class="demo-ma-chart" viewBox="0 0 300 130" preserveAspectRatio="none" aria-hidden="true"></svg>' +
      '  </div>' +
      '  <p class="demo-ma-chart-caption">Tempo de resposta × usuários: <span class="demo-ma-leg-ref">─ 1 servidor (referência)</span> · ' +
      '<span class="demo-ma-leg-cur">─ arranjo atual</span> · <span class="demo-ma-leg-target">┄ alvo (' + TARGET_MS + ' ms)</span></p>' +
      '  <div class="demo-cf-controls demo-ma-controls"></div>' +
      '  <dl class="demo-cf-metrics">' +
      '    <div><dt>Tempo de resposta</dt><dd data-metric="tempo">n/d</dd></div>' +
      '    <div><dt>Utilização máx.</dt><dd data-metric="util">n/d</dd></div>' +
      '    <div><dt>Atendidos por segundo</dt><dd data-metric="served">n/d</dd></div>' +
      '    <div><dt>Alvo</dt><dd>≤ ' + TARGET_MS + ' ms</dd></div>' +
      '  </dl>' +
      '  <div class="demo-ma-tiers" hidden>' +
      '    <div class="demo-ma-tier">' +
      '      <p><strong>Duas camadas físicas</strong></p>' +
      '      <p class="demo-ma-tier-path">cliente ⇄ servidor (aplicação + dados)</p>' +
      '      <button type="button" class="btn btn-secondary" data-tier="2">Testar pedido</button>' +
      '      <p class="demo-ma-tier-result" data-tier-result="2">n/d</p>' +
      '      <p class="demo-ma-tier-badge">lógica da aplicação <strong>dividida</strong> entre cliente e servidor</p>' +
      '    </div>' +
      '    <div class="demo-ma-tier">' +
      '      <p><strong>Três camadas físicas</strong></p>' +
      '      <p class="demo-ma-tier-path">cliente ⇄ servidor de aplicação ⇄ banco de dados' +
      ' <span class="demo-ma-tier-hint">(o segundo salto é rede local do centro de dados)</span></p>' +
      '      <button type="button" class="btn btn-secondary" data-tier="3">Testar pedido</button>' +
      '      <p class="demo-ma-tier-result" data-tier-result="3">n/d</p>' +
      '      <p class="demo-ma-tier-badge">lógica da aplicação <strong>em um só lugar</strong> (manutenibilidade)</p>' +
      '    </div>' +
      '  </div>' +
      '  <div class="demo-cf-summary callout" hidden>' +
      '    <p class="callout-title">🎓 O que você acabou de viver</p>' +
      '    <p><strong>Cliente-servidor</strong> centralizado satura na capacidade de um nó. ' +
      '    <strong>Réplicas</strong> dividem a leitura, ao custo de manter todas as cópias em ' +
      '    dia; <strong>partições</strong> escalam escrita e armazenamento, ao custo do ' +
      '    desequilíbrio quando uma fatia é mais procurada (a fatia quente). ' +
      '    <strong>Cache</strong> corta carga e latência, ao custo de respostas possivelmente ' +
      '    desatualizadas (Tópico 10). <strong>Peer-to-peer</strong> escala porque cada usuário ' +
      '    traz recursos, pagando em complexidade de localização. E <strong>camadas físicas</strong> ' +
      '    trocam latência por manutenibilidade. Arquitetura é decisão com consequências mensuráveis.</p>' +
      '  </div>' +
      '  <div class="demo-cf-log-wrap">' +
      '    <p class="demo-cf-log-title">Decisões e efeitos:</p>' +
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
      usersRange: container.querySelector(".demo-ma-users"),
      usersOut: container.querySelector(".demo-ma-users-out"),
      demand: container.querySelector(".demo-ma-demand"),
      bars: container.querySelector(".demo-ma-bars"),
      chart: container.querySelector(".demo-ma-chart"),
      controls: container.querySelector(".demo-ma-controls"),
      metrics: container.querySelector(".demo-cf-metrics"),
      tiers: container.querySelector(".demo-ma-tiers"),
      summary: container.querySelector(".demo-cf-summary"),
      log: container.querySelector(".demo-cf-log"),
      prev: container.querySelector(".demo-cf-prev"),
      next: container.querySelector(".demo-cf-next"),
      stageCounter: container.querySelector(".demo-cf-stage-counter")
    };

    /* ============ Etapas ============ */

    var STAGES = [
      {
        title: "Etapa 1: Um servidor para todos",
        instructions: "Cliente-servidor puro: um servidor de " + CAP + " pedidos/s para " +
          "todo mundo, e cada usuário gerando " + num(REQ_PER_USER) + " pedido/s. Aumente " +
          "os usuários e observe a utilização e o tempo de resposta.",
        goalText: "Meta: saturar o servidor (utilização ≥ 100%).",
        setup: function () {
          state.users = 100; state.servers = 1; state.mode = "replicado";
          state.cacheOn = false; state.p2p = false;
        },
        goalMet: function () { return state.saturatedOnce; }
      },
      {
        title: "Etapa 2: Replicar ou particionar",
        instructions: "Com " + STAGE2_USERS + " usuários o servidor único afunda. Adicione " +
          "réplicas até voltar ao alvo, e experimente o modo particionado para ver a fatia " +
          "quente desequilibrar a carga.",
        goalText: "Meta: com " + STAGE2_USERS + "+ usuários, tempo de resposta ≤ " +
          TARGET_MS + " ms.",
        setup: function () {
          /* fixa a população da etapa (não só eleva): com 1000 usuários herdados da
             etapa 1, nem os 4 servidores do teto dariam conta e a meta seria impossível */
          state.users = STAGE2_USERS;
          state.cacheOn = false; state.p2p = false;
        },
        goalMet: function () {
          return !state.p2p && state.users >= STAGE2_USERS && current().t <= TARGET_MS;
        }
      },
      {
        title: "Etapa 3: Cache na frente",
        instructions: "Ligue o cache e veja a carga nos servidores despencar, a ponto " +
          "de dispensar réplicas. Repare no contador de respostas possivelmente " +
          "desatualizadas: nada é de graça.",
        goalText: "Meta: atender 400+ usuários no alvo com no máximo 2 servidores e cache ligado.",
        setup: function () {
          if (state.users < 400) state.users = 400;
          state.p2p = false; state.mode = "replicado";
        },
        goalMet: function () {
          return state.cacheOn && state.servers <= 2 && state.users >= 400 &&
            current().t <= TARGET_MS;
        }
      },
      {
        title: "Etapa 4: Peer-to-peer",
        instructions: "Migre para P2P: cada usuário vira peer e traz " + num(PEER_CAP) +
          " pedido/s de capacidade, três vezes o que ele consome. Suba até 1000 usuários e " +
          "compare a curva com a da etapa 1. O preço aparece nos saltos de localização.",
        goalText: "Meta: 1000 usuários com tempo de resposta ≤ " + TARGET_MS + " ms.",
        setup: function () { state.cacheOn = false; },
        goalMet: function () {
          return state.p2p && state.users >= 1000 && current().t <= TARGET_MS;
        }
      },
      {
        title: "Etapa 5: Duas × três camadas físicas",
        instructions: "Para fechar: o mesmo pedido em uma arquitetura de duas e de três " +
          "camadas físicas. Teste os dois e compare a latência, e o que se ganha em troca.",
        goalText: "Meta: testar um pedido em cada arquitetura.",
        setup: function () {},
        goalMet: function () { return state.tiers.t2 && state.tiers.t3; }
      }
    ];

    /* ============ Utilidades ============ */

    function log(text) {
      var li = document.createElement("li");
      var t = ((Date.now() - startedAt) / 1000).toFixed(1);
      li.innerHTML = '<span class="demo-cf-log-time">+' + t + "s</span> " + text;
      els.log.insertBefore(li, els.log.firstChild);
      while (els.log.children.length > 40) els.log.removeChild(els.log.lastChild);
    }

    function fmtMs(t) { return t >= INF ? "∞ (fila crescendo)" : Math.round(t) + " ms"; }

    /* números para leitura em pt_BR: 0.5 vira "0,5" e 180 continua "180" */
    function num(v) { return String(v).replace(".", ","); }

    /* ============ Renderização ============ */

    function renderBars(m) {
      var html = "";
      if (state.p2p) {
        var u = m.utils[0];
        html =
          '<div class="demo-ma-bar"><span class="demo-ma-bar-label">' + state.users +
          " peers</span>" +
          '<span class="demo-ma-bar-track"><span class="demo-ma-bar-fill is-ok" data-util="' +
          u.toFixed(2) + '" style="width:' + Math.min(u * 100, 120) + '%"></span></span>' +
          '<span class="demo-ma-bar-value">' + Math.round(u * 100) + "%</span></div>" +
          '<p class="demo-ma-bar-note">Cada peer é cliente E servidor: a capacidade cresce junto com a demanda.</p>';
      } else {
        m.utils.forEach(function (u, i) {
          var cls = u >= 1 ? "is-sat" : (u >= 0.7 ? "is-warn" : "is-ok");
          html +=
            '<div class="demo-ma-bar"><span class="demo-ma-bar-label">Servidor ' +
            SERVER_NAMES[i] +
            (state.mode === "particionado" && i === 0 && state.servers > 1 ? " 🔥" : "") +
            "</span>" +
            '<span class="demo-ma-bar-track"><span class="demo-ma-bar-fill ' + cls +
            '" data-util="' + u.toFixed(2) + '" style="width:' + Math.min(u * 100, 120) +
            '%"></span></span>' +
            '<span class="demo-ma-bar-value">' + Math.round(u * 100) + "%</span></div>";
        });
        if (state.servers > 1) {
          html += '<p class="demo-ma-bar-note">' + (state.mode === "particionado"
            ? "Cada servidor guarda 1/" + state.servers + " dos dados: particionar é o que " +
              "escala escrita e armazenamento. O preço é o desequilíbrio quando uma fatia é " +
              "mais procurada que as outras."
            : "As réplicas dividem a leitura, mas guardam os mesmos dados: toda atualização " +
              "precisa chegar a todas as cópias (Tópico 10).") + "</p>";
        }
        if (state.cacheOn) {
          html += '<p class="demo-ma-bar-note">Cache absorvendo ' +
            Math.round(state.cacheHit * 100) + "% dos pedidos antes dos servidores.</p>";
        }
      }
      els.bars.innerHTML = html;
    }

    function chartPath(cfg) {
      var pts = [];
      for (var u = 10; u <= 1000; u += 33) {
        var t = evaluate(u, cfg).t;
        var x = ((u - 10) / 990) * 300;
        var y = 130 - Math.min(t, 500) / 500 * 130;
        pts.push(x.toFixed(1) + "," + y.toFixed(1));
      }
      return pts.join(" ");
    }

    function renderChart(m) {
      var yTarget = 130 - (TARGET_MS / 500) * 130;
      var xNow = ((state.users - 10) / 990) * 300;
      var yNow = 130 - Math.min(m.t, 500) / 500 * 130;
      els.chart.innerHTML =
        '<line x1="0" y1="' + yTarget + '" x2="300" y2="' + yTarget +
        '" class="demo-ma-chart-target"></line>' +
        '<polyline points="' + chartPath({ servers: 1, mode: "replicado", cacheOn: false, cacheHit: 0, p2p: false }) +
        '" class="demo-ma-chart-ref"></polyline>' +
        '<polyline points="' + chartPath(state) + '" class="demo-ma-chart-cur"></polyline>' +
        '<circle cx="' + xNow + '" cy="' + yNow + '" r="4" class="demo-ma-chart-dot"></circle>';
    }

    function renderControls() {
      var html = "";
      if (state.stage >= 2 && state.stage <= 3 && !state.p2p) {
        html +=
          '<button type="button" class="btn btn-secondary demo-ma-add"' +
          (state.servers >= MAX_SERVERS ? " disabled" : "") + ">➕ Adicionar réplica</button>" +
          '<button type="button" class="btn btn-secondary demo-ma-remove"' +
          (state.servers <= 1 ? " disabled" : "") + ">➖ Remover réplica</button>" +
          '<label class="demo-ma-modelabel"><input type="checkbox" class="demo-ma-mode"' +
          (state.mode === "particionado" ? " checked" : "") +
          "> Particionar dados (fatia quente: " + Math.round(HOT_SHARE * 100) + "%)</label>";
      }
      if (state.stage === 3) {
        html +=
          '<label><input type="checkbox" class="demo-ma-cache"' +
          (state.cacheOn ? " checked" : "") + "> Cache/proxy na frente</label>" +
          '<label>Taxa de acerto: <output>' + Math.round(state.cacheHit * 100) + "%</output>" +
          '<input type="range" class="demo-ma-hit" min="0" max="90" step="10" value="' +
          Math.round(state.cacheHit * 100) + '"' + (state.cacheOn ? "" : " disabled") + "></label>" +
          '<span class="demo-ma-stale">respostas possivelmente desatualizadas: ' +
          "<strong>" + state.staleServed + "</strong></span>";
      }
      if (state.stage === 4) {
        html +=
          '<label><input type="checkbox" class="demo-ma-p2p"' +
          (state.p2p ? " checked" : "") + "> Migrar para peer-to-peer</label>" +
          (state.p2p
            ? '<span class="demo-ma-hops">saltos para localizar: <strong>~' +
              current().hops + "</strong> (cresce com log dos peers)</span>" +
              '<span class="demo-ma-churn">re-replicações por churn: <strong>' +
              state.reReplications + "</strong></span>"
            : "");
      }
      els.controls.innerHTML = html;

      var add = els.controls.querySelector(".demo-ma-add");
      if (add) add.addEventListener("click", function () {
        state.servers++;
        log("＋ réplica adicionada (agora " + state.servers + " servidores)");
        update(true);
      });
      var rem = els.controls.querySelector(".demo-ma-remove");
      if (rem) rem.addEventListener("click", function () {
        state.servers--;
        log("－ réplica removida (agora " + state.servers + " servidor" +
          (state.servers > 1 ? "es" : "") + ")");
        update(true);
      });
      var mode = els.controls.querySelector(".demo-ma-mode");
      if (mode) mode.addEventListener("change", function () {
        state.mode = mode.checked ? "particionado" : "replicado";
        log("modo: dados " + state.mode + (mode.checked ? " (uma fatia concentra " +
          Math.round(HOT_SHARE * 100) + "% da carga)" : ""));
        update(true);
      });
      var cache = els.controls.querySelector(".demo-ma-cache");
      if (cache) cache.addEventListener("change", function () {
        state.cacheOn = cache.checked;
        log(state.cacheOn
          ? "cache ligado (acerto " + Math.round(state.cacheHit * 100) + "%)"
          : "cache desligado");
        update(true);
      });
      var hit = els.controls.querySelector(".demo-ma-hit");
      if (hit) hit.addEventListener("input", function () {
        state.cacheHit = parseInt(hit.value, 10) / 100;
        hit.parentNode.querySelector("output").textContent = hit.value + "%";
        update(false);
      });
      var p2p = els.controls.querySelector(".demo-ma-p2p");
      if (p2p) p2p.addEventListener("change", function () {
        state.p2p = p2p.checked;
        log(state.p2p
          ? "🌐 migrado para peer-to-peer: cada usuário agora traz capacidade"
          : "de volta ao cliente-servidor");
        update(true);
      });
    }

    function updateMetrics(m) {
      var maxU = Math.max.apply(null, m.utils);
      if (maxU >= 1 && !state.p2p) state.saturatedOnce = true;
      var tempo = els.metrics.querySelector('[data-metric="tempo"]');
      tempo.textContent = fmtMs(m.t);
      tempo.setAttribute("data-ms", Math.round(Math.min(m.t, INF)));
      var util = els.metrics.querySelector('[data-metric="util"]');
      util.textContent = Math.round(maxU * 100) + "%";
      util.setAttribute("data-util", maxU.toFixed(3));
      var served = els.metrics.querySelector('[data-metric="served"]');
      served.textContent = Math.round(m.served);
      served.setAttribute("data-served", Math.round(m.served));
    }

    function updateNav() {
      var st = STAGES[state.stage - 1];
      els.stageCounter.textContent = "Etapa " + state.stage + " de " + STAGES.length;
      els.prev.disabled = state.stage === 1;
      els.next.disabled = state.stage === STAGES.length || !st.goalMet();
      els.goal.innerHTML = st.goalText + (st.goalMet()
        ? ' <strong class="demo-cf-goal-ok">✓ cumprida' +
          (state.stage < STAGES.length ? ", avance!" : "") + "</strong>"
        : "");
      if (state.stage === STAGES.length && st.goalMet()) els.summary.hidden = false;
    }

    /* rebuildControls: true quando um controle muda de estado habilitado/visível */
    function update(rebuildControls) {
      var m = current();
      els.usersOut.textContent = state.users;
      els.usersRange.value = state.users;
      els.demand.textContent = "cada usuário gera " + num(REQ_PER_USER) + " pedido/s, " +
        "então " + state.users + " usuários = " + num(state.users * REQ_PER_USER) +
        " pedidos/s de demanda.";
      renderBars(m);
      renderChart(m);
      updateMetrics(m);
      if (rebuildControls) renderControls();
      var hopsEl = els.controls.querySelector(".demo-ma-hops strong");
      if (hopsEl) hopsEl.textContent = "~" + m.hops;
      updateNav();
    }

    function gotoStage(n) {
      state.stage = n;
      var st = STAGES[n - 1];
      /* o setup da etapa mexe no arranjo por baixo do pano; o log precisa contar,
         senão as barras mudam de patamar sem explicação no painel de decisões */
      var antes = {
        users: state.users, servers: state.servers, mode: state.mode,
        cacheOn: state.cacheOn, p2p: state.p2p
      };
      st.setup();
      els.title.innerHTML = "<strong>" + st.title + "</strong>";
      els.instructions.textContent = st.instructions;
      els.tiers.hidden = state.stage !== 5;
      log("▶ " + st.title);
      var ajustes = [];
      if (antes.users !== state.users) ajustes.push("usuários em " + state.users);
      if (antes.servers !== state.servers) ajustes.push("servidores em " + state.servers);
      if (antes.mode !== state.mode) ajustes.push("dados no modo " + state.mode);
      if (antes.cacheOn !== state.cacheOn) {
        ajustes.push(state.cacheOn ? "cache ligado" : "cache desligado");
      }
      if (antes.p2p !== state.p2p) {
        ajustes.push(state.p2p ? "peer-to-peer ligado" : "de volta ao cliente-servidor");
      }
      if (ajustes.length) {
        log("⚙️ ajustes automáticos para esta etapa: " + ajustes.join(", ") + ".");
      }
      update(true);
    }

    /* ============ Eventos ============ */

    els.usersRange.addEventListener("input", function () {
      state.users = parseInt(els.usersRange.value, 10);
      update(false);
    });
    els.prev.addEventListener("click", function () { if (state.stage > 1) gotoStage(state.stage - 1); });
    els.next.addEventListener("click", function () {
      if (state.stage < STAGES.length) gotoStage(state.stage + 1);
    });
    els.tiers.addEventListener("click", function (e) {
      var b = e.target.closest("[data-tier]");
      if (!b) return;
      var tier = b.getAttribute("data-tier");
      // Latências fixas do comparador: 2 camadas = 2 pernas de rede (40 ms cada, cliente
      // até o servidor) + processamento; 3 camadas acrescenta 2 pernas de rede local do
      // centro de dados (5 ms cada, como os ~2,8 ms medidos na prática 02) + processamento
      // no segundo nó.
      var t = tier === "2" ? 2 * 40 + 30 : 2 * 40 + 2 * 5 + 30 + 20;
      container.querySelector('[data-tier-result="' + tier + '"]').innerHTML =
        "latência medida: <strong data-tier-ms=\"" + t + "\">" + t + " ms</strong>" +
        (tier === "2" ? " (1 ida e volta até o servidor)"
          : " (1 ida e volta até o servidor + 1 na rede local)");
      state.tiers["t" + tier] = true;
      log("pedido de teste em " + tier + " camadas físicas: " + t + " ms");
      updateNav();
    });
    container.querySelector(".demo-cf-reset").addEventListener("click", function () {
      mount(container); // remontagem: estado e timers antigos ficam órfãos
    });

    /* Contadores acumulados por tempo (determinísticos: sem aleatoriedade) */
    var timer = setInterval(function () {
      if (!container.isConnected) { clearInterval(timer); return; }
      state.ticks++;
      if (state.cacheOn && state.stage === 3) {
        state.staleServed += Math.round(state.users * REQ_PER_USER * state.cacheHit * 0.05) || 1;
        var stale = els.controls.querySelector(".demo-ma-stale strong");
        if (stale) stale.textContent = state.staleServed;
      }
      if (state.p2p && state.stage === 4 && state.ticks % 4 === 0) {
        state.reReplications++;
        var churn = els.controls.querySelector(".demo-ma-churn strong");
        if (churn) churn.textContent = state.reReplications;
      }
    }, 1000 * timeScale);

    gotoStage(1);
  }

  return { mount: mount };
})();
