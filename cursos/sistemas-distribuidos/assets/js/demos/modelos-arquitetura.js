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

   Camada de tutoria (passos, previsão, painel de efeito e
   conceito sob demanda) em demos/tutor.js; plano e números de
   cada etapa em
   docs/demos/2026-08-03-demo-modelos-arquitetura-tutoria-plano.md
   Aqui vivem apenas os DADOS dessa camada: o que fazer, o que
   perguntar antes e como explicar cada efeito. O motor é genérico
   e não conhece este modelo.

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

  /* Latências fixas do comparador da etapa 5: 2 camadas = 2 pernas de rede
     (40 ms cada, cliente até o servidor) + processamento; 3 camadas acrescenta
     2 pernas de rede local do centro de dados (5 ms cada, como os ~2,8 ms
     medidos na prática 02) + o sobrecusto de atravessar a fronteira do processo
     do banco. O trabalho de achar o dado NÃO entra na diferença: ele existe nos
     dois arranjos e já está em PROC_MS. Modelá-lo só do lado de três camadas
     atribuiria ao salto de rede um custo que não é dele (achado A1 da auditoria
     de 2026-08-04). */
  var LEG_MS = 40;          // perna de rede entre cliente e centro de dados
  var LAN_MS = 5;           // perna de rede local dentro do centro de dados
  var PROC_MS = 30;         // processamento do servidor que atende
  var CROSS_MS = 5;         // atravessar o processo do banco (conexão, serialização)
  var T2_MS = 2 * LEG_MS + PROC_MS;
  var T3_MS = 2 * LEG_MS + 2 * LAN_MS + PROC_MS + CROSS_MS;

  /* Área de plotagem do gráfico, em unidades do viewBox. As margens existem
     para os rótulos de eixo: sem elas o texto sairia cortado. */
  var CH = { x0: 46, x1: 322, y0: 14, y1: 128, tMax: 500, uMin: 10, uMax: 1000, passo: 30 };

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
      ticks: 0,
      viuSaturacao1: false,  // etapa 1: já levou o slider até a saturação
      viuMil: false          // etapa 4: já levou o slider até 1000 peers
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
      '    <div class="demo-tutor-passos" hidden></div>' +
      '    <div class="demo-tutor-previsao" hidden></div>' +
      '    <div class="demo-ma-goalrow">' +
      '      <p class="demo-cf-goal"></p>' +
      '      <div class="demo-tutor-conceito" hidden></div>' +
      '    </div>' +
      '  </div>' +
      '  <div class="demo-ma-userrow">' +
      '    <label>Usuários: <output class="demo-ma-users-out"></output>' +
      '    <input type="range" class="demo-ma-users" min="10" max="1000" step="10"></label>' +
      '    <p class="demo-ma-demand"></p>' +
      '  </div>' +
      '  <div class="demo-ma-world">' +
      '    <div class="demo-ma-bars"></div>' +
      '    <svg class="demo-ma-chart" viewBox="0 0 336 154" role="img"></svg>' +
      '  </div>' +
      '  <p class="demo-ma-chart-caption">Tempo de resposta × usuários: <span class="demo-ma-leg-ref">─ 1 servidor (referência)</span> · ' +
      '<span class="demo-ma-leg-cur">─ arranjo atual</span> · <span class="demo-ma-leg-target">┄ alvo (' + TARGET_MS + ' ms)</span>' +
      '<span class="demo-ma-chart-nota"></span></p>' +
      '  <div class="demo-cf-controls demo-ma-controls"></div>' +
      '  <div class="demo-tutor-efeito" aria-live="polite"></div>' +
      '  <dl class="demo-cf-metrics">' +
      '    <div><dt>Tempo de resposta</dt><dd data-metric="tempo">n/d</dd></div>' +
      '    <div><dt>Utilização máx.</dt><dd data-metric="util">n/d</dd></div>' +
      '    <div><dt>Atendidos por segundo</dt><dd data-metric="served">n/d</dd></div>' +
      '    <div><dt>Alvo</dt><dd>≤ ' + TARGET_MS + ' ms</dd></div>' +
      '  </dl>' +
      '  <div class="demo-ma-tiers" hidden>' +
      '    <p class="demo-ma-tiers-aviso">Este comparador <strong>não depende dos controles ' +
      'acima</strong>: ele mede o caminho de um pedido, não a carga do sistema.</p>' +
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
      root: container.querySelector(".demo-ma"),
      title: container.querySelector(".demo-cf-title"),
      instructions: container.querySelector(".demo-cf-instructions"),
      goal: container.querySelector(".demo-cf-goal"),
      usersRange: container.querySelector(".demo-ma-users"),
      usersOut: container.querySelector(".demo-ma-users-out"),
      demand: container.querySelector(".demo-ma-demand"),
      bars: container.querySelector(".demo-ma-bars"),
      chart: container.querySelector(".demo-ma-chart"),
      chartNota: container.querySelector(".demo-ma-chart-nota"),
      controls: container.querySelector(".demo-ma-controls"),
      metrics: container.querySelector(".demo-cf-metrics"),
      tiers: container.querySelector(".demo-ma-tiers"),
      summary: container.querySelector(".demo-cf-summary"),
      log: container.querySelector(".demo-cf-log"),
      prev: container.querySelector(".demo-cf-prev"),
      next: container.querySelector(".demo-cf-next"),
      stageCounter: container.querySelector(".demo-cf-stage-counter")
    };

    /* ============ Utilidades ============ */

    function log(text, diff) {
      var li = document.createElement("li");
      var t = ((Date.now() - startedAt) / 1000).toFixed(1);
      li.innerHTML = '<span class="demo-cf-log-time">+' + t + "s</span> " + text +
        (diff ? ' <span class="demo-cf-log-diff">(' + diff + ")</span>" : "");
      els.log.insertBefore(li, els.log.firstChild);
      while (els.log.children.length > 40) els.log.removeChild(els.log.lastChild);
    }

    function fmtMs(t) { return t >= INF ? "∞ (fila crescendo)" : Math.round(t) + " ms"; }
    function fmtPct(u) { return Math.round(u * 100) + "%"; }
    function fmtInt(v) { return String(Math.round(v)); }

    /* números para leitura em pt_BR: 0.5 vira "0,5" e 180 continua "180" */
    function num(v) { return String(v).replace(".", ","); }

    function demandaAtual() { return state.users * REQ_PER_USER; }
    function backendAtual() {
      return demandaAtual() * (state.cacheOn ? (1 - state.cacheHit) : 1);
    }
    function utilMax(m) { return Math.max.apply(null, m.utils); }

    /* ============ Tutoria: retrato do estado ============ */

    /* O tutor imprime só o que está em metricas[]; os demais campos existem
       para as explicações desta demo (saltos, população, servidores). */
    function retrato() {
      var m = current();
      return {
        t: m.t,
        util: utilMax(m),
        served: m.served,
        hops: m.hops,
        users: state.users,
        servers: state.servers
      };
    }

    var tutor = SD.demoTutor.criar({
      alvos: {
        passos: container.querySelector(".demo-tutor-passos"),
        previsao: container.querySelector(".demo-tutor-previsao"),
        efeito: container.querySelector(".demo-tutor-efeito"),
        conceito: container.querySelector(".demo-tutor-conceito")
      },
      metricas: [
        { chave: "t", rotulo: "Tempo de resposta", formatar: fmtMs, melhorQuando: "menor" },
        { chave: "util", rotulo: "Utilização máx.", formatar: fmtPct, melhorQuando: "menor" },
        { chave: "served", rotulo: "Atendidos por segundo", formatar: fmtInt, melhorQuando: "maior" }
      ],
      snapshot: retrato
    });

    /* ============ Explicações (o "por quê" e o "olhe para") ============ */

    function porqueSaturou() {
      var b = backendAtual();
      if (state.mode === "particionado" && state.servers > 1) {
        var quente = Math.round(b * HOT_SHARE);
        return "a fatia quente sozinha são " + quente + " pedidos/s, e um servidor faz " +
          CAP + ". Acrescentar servidores divide as fatias frias, nunca a quente: com " +
          MAX_SERVERS + " servidores o A continuaria com esses mesmos " + quente +
          " pedidos/s.";
      }
      return "os servidores recebem " + Math.round(b) + " pedidos/s e a capacidade " +
        "instalada é de " + (state.servers * CAP) + " pedidos/s (" + state.servers +
        " × " + CAP + "): a fila deixa de esvaziar e o tempo cresce sem limite.";
    }

    function olheParaSaturacao(m) {
      var d = demandaAtual();
      var sobra = Math.round(d - m.served);
      return '"Atendidos por segundo", que travou em ' + Math.round(m.served) +
        (sobra > 0 ? ": " + sobra + " pedidos/s ficam para trás a cada segundo." : ".");
    }

    function explicarUsuarios(antes) {
      var m = current();
      if (state.p2p) {
        /* Os saltos são ceil(log2(usuários)) e o passo prescrito da etapa 4 manda
           VOLTAR a 100, quando eles caem. Frase fixa afirmava crescimento na hora
           em que o número diminuía (achado A3 da auditoria de 2026-08-04). */
        var verbo = m.hops > antes.hops
          ? "O que cresceu foram os saltos para localizar o objeto (" + antes.hops +
            " → " + m.hops + ", " + HOP_MS + " ms cada)"
          : m.hops < antes.hops
            ? "Os saltos para localizar o objeto caíram de " + antes.hops + " para " +
              m.hops + " (" + HOP_MS + " ms cada)"
            : "Os saltos para localizar o objeto ficaram nos mesmos " + m.hops +
              " (" + HOP_MS + " ms cada)";
        /* A curva de referência só passa do teto de TARGET do gráfico bem depois
           de 100 usuários. Mandar olhar "fora da escala" com 100 peers apontava
           para uma curva visivelmente dentro dela (achado A4). */
        var refFora = evaluate(state.users, CFG_REF).t > CH.tMax;
        return {
          porque: "a utilização de cada peer não se moveu, porque cada usuário novo traz " +
            num(PEER_CAP) + " pedido/s de capacidade e consome " + num(REQ_PER_USER) +
            ", então capacidade e demanda crescem juntas. " + verbo +
            ", e eles crescem com o logaritmo do número de peers.",
          olhe: refFora
            ? "a curva cinza de 1 servidor, que neste mesmo ponto já saiu da escala."
            : "que com esta população a curva cinza de 1 servidor ainda responde mais " +
              "rápido, porque o peer-to-peer paga os saltos de localização desde o " +
              "primeiro pedido. A vantagem dele aparece quando a população cresce."
        };
      }
      if (m.t >= INF) {
        return { porque: porqueSaturou(), olhe: olheParaSaturacao(m) };
      }
      var u = utilMax(m);
      return {
        porque: "o tempo de resposta não acompanha a carga em proporção: ele é " + BASE_MS +
          " ms divididos pela folga de capacidade que sobra, e agora sobram " +
          fmtPct(1 - u) + ".",
        olhe: m.t > TARGET_MS
          ? "o joelho da curva: daqui em diante, cada usuário novo custa mais tempo que o " +
            "anterior."
          : "a distância até o alvo de " + TARGET_MS + " ms, que ainda tem folga."
      };
    }

    function explicarServidores(antes, adicionou) {
      var m = current();
      var b = backendAtual();
      var porCabeca = Math.round(b / state.servers);
      if (m.t >= INF) {
        return { porque: porqueSaturou(), olhe: olheParaSaturacao(m) };
      }
      var porque = state.mode === "particionado" && state.servers > 1
        ? "as fatias frias foram redivididas entre " + (state.servers - 1) +
          " servidores, e a quente continua inteira em um só."
        : "cada servidor passou a receber " + porCabeca + " dos " + Math.round(b) +
          " pedidos/s, o que dá " + fmtPct(utilMax(m)) + " de utilização.";
      var olhe;
      if (!adicionou) {
        /* O "quase nada" valia para 3 → 2 servidores e era falso para 2 → 1, que
           mais que dobra o tempo e que a própria etapa induz (achado A5 da
           auditoria de 2026-08-04). Compara as grandezas antes de escrever. */
        var piora = antes && antes.t > 0 && antes.t < INF ? m.t / antes.t : 1;
        if (state.cacheOn && piora < 1.5) {
          olhe = "o quanto o tempo piorou ao devolver um servidor inteiro, que foi quase " +
            "nada, porque o cache absorveu o trabalho da réplica.";
        } else if (state.cacheOn && m.t <= TARGET_MS) {
          olhe = "que o tempo mais que dobrou e ainda assim ficou dentro do alvo de " +
            TARGET_MS + " ms, porque o cache segurou " + fmtPct(state.cacheHit) +
            " da carga antes que ela chegasse aos servidores.";
        } else {
          olhe = "o quanto o tempo piorou. Tirar capacidade custa mais caro quanto mais " +
            "perto da saturação você estiver.";
        }
      } else if (m.t > TARGET_MS) {
        olhe = "o tempo caiu, mas ainda está acima do alvo: " + fmtPct(utilMax(m)) +
          " de utilização continua caro.";
      } else {
        olhe = "o quanto o tempo caiu por um servidor a mais, comparado ao ganho do " +
          "servidor anterior: o retorno diminui a cada réplica.";
      }
      return { porque: porque, olhe: olhe };
    }

    function explicarParticao(ligou) {
      var m = current();
      if (!ligou) {
        return {
          porque: "sem partição, qualquer servidor atende qualquer pedido, e a carga volta " +
            "a se dividir por igual entre as réplicas.",
          olhe: "as barras iguais de novo, e a meta de volta ao alcance."
        };
      }
      var quente = Math.round(backendAtual() * HOT_SHARE);
      /* O controle também aparece na etapa 3, onde com cache a fatia quente ainda
         cabe no nó e nada satura. O texto fixo afirmava saturação e meta desfeita
         sem olhar o estado (achado A2 da auditoria de 2026-08-04). */
      if (state.servers <= 1) {
        return {
          porque: "com um servidor só não há corte a fazer, porque a fatia quente e as " +
            "frias moram todas na mesma máquina. Particionar aqui não muda nada.",
          olhe: "que a barra continua igual. O efeito da partição só aparece quando " +
            "existem servidores entre os quais dividir as fatias."
        };
      }
      if (m.t >= INF) {
        return {
          porque: porqueSaturou(),
          olhe: "o desequilíbrio entre as barras. O servidor A está em " +
            fmtPct(m.utils[0]) + " enquanto os outros sobram em " + fmtPct(m.utils[1]) +
            ". A meta se desfez de propósito, e é isso que a etapa tem a ensinar. Para " +
            'avançar, desmarque "Particionar dados", porque a fatia quente pede outra ' +
            "saída. Aqueles " + quente + " pedidos/s não cabem em um nó."
        };
      }
      return {
        porque: "a fatia quente concentra " + fmtPct(HOT_SHARE) + " da procura num " +
          "servidor só, e são " + quente + " pedidos/s contra os " + CAP +
          " que ele faz. Neste ponto ainda cabe, então a meta continua cumprida.",
        olhe: "o desequilíbrio entre as barras, com o servidor A em " +
          fmtPct(m.utils[0]) + " enquanto os outros sobram em " + fmtPct(m.utils[1]) +
          ". A partição não quebrou nada agora, e é essa folga que some quando a " +
          "procura cresce."
      };
    }

    function explicarCache(ligou) {
      var d = demandaAtual();
      if (!ligou) {
        return {
          porque: "sem cache, todo pedido volta a atravessar os servidores: " +
            Math.round(d) + " pedidos/s em vez de " + Math.round(d * (1 - state.cacheHit)) + ".",
          olhe: "a utilização de volta ao patamar de antes, e o contador de desatualizadas " +
            "parado."
        };
      }
      return {
        porque: "com " + fmtPct(state.cacheHit) + " de acerto, essa fatia dos pedidos é " +
          "respondida pelo cache em " + CACHE_MS + " ms e nem chega aos servidores: o " +
          "backend recebe " + Math.round(backendAtual()) + " pedidos/s em vez de " +
          Math.round(d) + ".",
        olhe: "o contador de respostas possivelmente desatualizadas, que começou a subir: " +
          "quem respondeu não foi a fonte da verdade (Tópico 10)."
      };
    }

    function explicarAcerto() {
      if (state.cacheHit === 0) {
        return {
          porque: "com 0% de acerto o cache deixou de existir na prática: nenhum pedido é " +
            "respondido por ele, e todos voltam a atravessar os servidores.",
          olhe: "a volta da fila, com o cache ainda ligado: um cache que não acerta é só " +
            "mais um salto no caminho."
        };
      }
      return {
        porque: "cada ponto de taxa de acerto tira carga do backend: agora ele recebe " +
          Math.round(backendAtual()) + " dos " + Math.round(demandaAtual()) + " pedidos/s.",
        olhe: "o contador de desatualizadas subindo junto: acertar mais é responder mais " +
          "vezes com uma cópia, e cópia envelhece."
      };
    }

    function explicarP2p(ligou) {
      var m = current();
      if (!ligou) {
        return {
          porque: "de volta ao cliente-servidor, a capacidade parou de crescer com a " +
            "população: ela é a dos " + state.servers + " servidores, e só.",
          olhe: "a utilização, que voltou a depender do slider de usuários."
        };
      }
      return {
        porque: "cada usuário virou peer: traz " + num(PEER_CAP) + " pedido/s de capacidade " +
          "e consome " + num(REQ_PER_USER) + ". A utilização passou a " + fmtPct(utilMax(m)) +
          " e não se move mais, porque capacidade e demanda crescem juntas.",
        olhe: "a barra, que agora ignora o slider de usuários. O preço aparece nos saltos " +
          "de localização e no contador de re-replicações por churn."
      };
    }

    /* ============ Etapas ============ */

    var STAGES = [
      {
        title: "Etapa 1: Um servidor para todos",
        instructions: "Cliente-servidor puro: um servidor de " + CAP +
          " pedidos/s para todo mundo.",
        goalText: "Meta: saturar o servidor (utilização ≥ 100%).",
        aguardando: 'Arraste "Usuários" e esta faixa conta o que mudou e por quê.',
        conceito: "saturacao-e-tempo-de-resposta",
        passos: [
          /* 200 é o ponto em que a folga acaba, mas ali a sobra ainda é zero e o
             painel não teria pedidos ficando para trás. Em 240 são 120 pedidos/s
             de demanda contra 100 atendidos (achado A7 da auditoria de
             2026-08-04). */
          { id: "subir", texto: 'Arraste "Usuários" até 240, passando dos 200 em que a folga acaba' },
          { id: "voltar", texto: "Volte para 100 e compare os dois cenários" }
        ],
        previsao: {
          pergunta: "com 100 usuários o tempo de resposta é 120 ms. Dobrando para 200 " +
            "usuários, ele vai para:",
          opcoes: [
            {
              rotulo: "cerca de 240 ms",
              veredito: "O tempo não é proporcional à carga: ele é " + BASE_MS +
                " ms divididos pela folga de capacidade, e com 200 usuários não sobra folga."
            },
            {
              rotulo: "cerca de 600 ms",
              veredito: "Perto: 600 ms é o que se mede com 180 usuários. Em 200 a folga acaba."
            },
            {
              rotulo: "a fila cresce sem limite",
              correta: true,
              veredito: "Com 200 usuários a demanda é de " + CAP + " pedidos/s, exatamente a " +
                "capacidade do servidor: a fila deixa de esvaziar."
            }
          ]
        },
        setup: function () {
          state.users = 100; state.servers = 1; state.mode = "replicado";
          state.cacheOn = false; state.p2p = false;
        },
        goalMet: function () { return state.saturatedOnce; }
      },
      {
        title: "Etapa 2: Replicar ou particionar",
        instructions: "Com " + STAGE2_USERS + " usuários o servidor único afunda. Há duas " +
          "saídas, com preços diferentes.",
        goalText: "Meta: com " + STAGE2_USERS + "+ usuários, tempo de resposta ≤ " +
          TARGET_MS + " ms.",
        aguardando: "Adicione réplicas e esta faixa conta o que cada uma comprou.",
        conceito: "replicar-ou-particionar",
        passos: [
          { id: "replicas", texto: 'Clique em "➕ Adicionar réplica" até o tempo voltar ao alvo' },
          { id: "particionar", texto: 'Marque "Particionar dados" e compare as três barras' },
          { id: "desmarcar", texto: "Desmarque para voltar ao arranjo replicado e avançar" }
        ],
        previsao: {
          pergunta: "com " + STAGE2_USERS + " usuários e 1 servidor a fila cresce sem " +
            "limite. Quantos servidores no total trazem o tempo de volta ao alvo de " +
            TARGET_MS + " ms?",
          opcoes: [
            {
              rotulo: "2",
              veredito: "Com 2 servidores cada um recebe 90 dos 180 pedidos/s: 90% de " +
                "utilização ainda custa 600 ms."
            },
            {
              rotulo: "3",
              correta: true,
              veredito: "Com 3 são 60 pedidos/s em cada, 60% de utilização, e o tempo cai " +
                "para 150 ms."
            },
            {
              rotulo: "4",
              veredito: "4 servidores dão 109 ms, mas 3 já bastavam: o alvo é " + TARGET_MS +
                " ms, não o menor tempo possível."
            }
          ]
        },
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
        instructions: "Um proxy na frente responde parte dos pedidos sem tocar nos " +
          "servidores.",
        goalText: "Meta: atender 400+ usuários no alvo com no máximo 2 servidores e cache ligado.",
        aguardando: "Ligue o cache e esta faixa conta o que ele comprou e o que ele custou.",
        conceito: "cache-e-atualidade",
        passos: [
          { id: "cache", texto: 'Marque "Cache/proxy na frente"' },
          { id: "remover", texto: 'Clique em "➖ Remover réplica" até sobrarem 2 ou menos' },
          { id: "acerto", texto: 'Mexa em "Taxa de acerto" e acompanhe o contador' }
        ],
        previsao: {
          pergunta: "com cache de 60% de acerto, quantos servidores bastam para atender 400 " +
            "usuários dentro do alvo?",
          opcoes: [
            {
              rotulo: "1",
              correta: true,
              veredito: "Um só, com 132 ms. Sem cache, 2 servidores já deixariam a fila " +
                "crescer sem limite."
            },
            {
              rotulo: "2",
              veredito: "2 dão 52 ms, mas 1 já bastava (132 ms). Sem cache, esses mesmos 2 " +
                "deixariam a fila crescer."
            },
            {
              rotulo: "3",
              veredito: "3 dão 45 ms, quase o mesmo que 2 (52 ms): o cache absorveu o " +
                "trabalho das réplicas."
            }
          ]
        },
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
        instructions: "Outra saída: cada usuário vira peer e traz capacidade junto.",
        goalText: "Meta: 1000 usuários com tempo de resposta ≤ " + TARGET_MS + " ms.",
        aguardando: "Migre para P2P e esta faixa conta o que muda na conta de capacidade.",
        conceito: "p2p-recursos-crescem",
        passos: [
          { id: "migrar", texto: 'Marque "Migrar para peer-to-peer"' },
          { id: "mil", texto: 'Arraste "Usuários" até 1000' },
          { id: "voltar", texto: 'Volte "Usuários" para 100 e veja o quanto o tempo mudou' }
        ],
        previsao: {
          pergunta: "multiplicando por 10 o número de peers, a utilização de cada um vai:",
          opcoes: [
            {
              rotulo: "subir 10 vezes",
              veredito: "É o que aconteceria num servidor central. Aqui não: quem chega traz " +
                "capacidade junto."
            },
            {
              rotulo: "subir um pouco",
              veredito: "Ela não sobe nem um pouco: cada peer novo traz " + num(PEER_CAP) +
                " pedido/s e consome " + num(REQ_PER_USER) + "."
            },
            {
              rotulo: "não mudar",
              correta: true,
              veredito: "33%, com 10 ou com 1000 peers. É isso que significa \"os recursos " +
                "disponíveis crescem com o número de usuários\"."
            }
          ]
        },
        setup: function () { state.cacheOn = false; },
        goalMet: function () {
          return state.p2p && state.users >= 1000 && current().t <= TARGET_MS;
        }
      },
      {
        title: "Etapa 5: Duas × três camadas físicas",
        instructions: "O mesmo pedido em uma arquitetura de duas e de três camadas físicas.",
        goalText: "Meta: testar um pedido em cada arquitetura.",
        aguardando: "Teste os dois caminhos e esta faixa compara a latência de cada um.",
        conceito: "camadas-fisicas-latencia",
        passos: [
          { id: "t2", texto: 'Clique em "Testar pedido" na coluna de duas camadas' },
          { id: "t3", texto: 'Clique em "Testar pedido" na coluna de três camadas' }
        ],
        previsao: {
          pergunta: "acrescentar uma terceira camada física custa, por pedido:",
          opcoes: [
            {
              rotulo: "nada",
              veredito: "Custa sim: o pedido passa a atravessar mais uma fronteira de rede e " +
                "mais um processo."
            },
            {
              rotulo: "cerca de " + (T3_MS - T2_MS) + " ms",
              correta: true,
              veredito: T2_MS + " ms contra " + T3_MS + " ms. São 2 pernas de rede local, " +
                "de " + LAN_MS + " ms cada, mais " + CROSS_MS + " ms para atravessar a " +
                "fronteira do processo do banco. Achar o dado custa igual nos dois arranjos."
            },
            {
              rotulo: "mais que o dobro",
              veredito: "Menos que isso: " + T2_MS + " ms viram " + T3_MS + " ms. A rede " +
                "local do centro de dados é barata perto da perna até o cliente."
            }
          ]
        },
        setup: function () {},
        goalMet: function () { return state.tiers.t2 && state.tiers.t3; }
      }
    ];

    /* ============ Renderização ============ */

    function renderBars(m) {
      var alvo = state.p2p ? "cada peer" : "cada servidor";
      var html = '<p class="demo-ma-bars-title">Utilização de ' + alvo +
        '<span class="demo-ma-bars-scale">0% a 100%: a régua inteira é a capacidade (' +
        (state.p2p ? num(PEER_CAP) + " pedido/s por peer" : CAP + " pedidos/s") +
        ')</span></p>';

      function barra(rotulo, u, extraClasse) {
        var cls = u >= 1 ? "is-sat" : (u >= 0.7 ? "is-warn" : "is-ok");
        return '<div class="demo-ma-bar"><span class="demo-ma-bar-label">' + rotulo +
          "</span>" +
          '<span class="demo-ma-bar-track"><span class="demo-ma-bar-fill ' + cls +
          (extraClasse || "") + '" data-util="' + u.toFixed(2) + '" style="width:' +
          Math.min(u * 100, 100) + '%"></span></span>' +
          '<span class="demo-ma-bar-value">' + Math.round(u * 100) + "%</span>" +
          (u >= 1
            ? '<span class="demo-ma-bar-over">↑ acima da capacidade</span>'
            : "") +
          "</div>";
      }

      if (state.p2p) {
        html += barra(state.users + " peers", m.utils[0]) +
          '<p class="demo-ma-bar-note">Cada peer é cliente E servidor: a capacidade cresce junto com a demanda.</p>';
      } else {
        m.utils.forEach(function (u, i) {
          var quente = state.mode === "particionado" && i === 0 && state.servers > 1;
          html += barra("Servidor " + SERVER_NAMES[i] + (quente ? " 🔥" : ""), u);
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

    /* ---- Gráfico ----
       O teto de 500 ms é o detalhe que mais confundia: a curva saturada
       encostava nele e virava uma reta horizontal, e o aluno lia
       "estabilizou" onde o significado é "saiu da escala". Daí os eixos
       rotulados, o traço interrompido acima do teto e o aviso. */

    function cx(u) {
      return CH.x0 + ((u - CH.uMin) / (CH.uMax - CH.uMin)) * (CH.x1 - CH.x0);
    }
    function cy(t) {
      return CH.y1 - (Math.min(t, CH.tMax) / CH.tMax) * (CH.y1 - CH.y0);
    }

    /* Divide a curva em trechos dentro e fora da escala, para o traço
       interrompido marcar exatamente onde ela deixou de ser legível. */
    function chartSegmentos(cfg) {
      var segs = [];
      var atual = null;
      for (var u = CH.uMin; u <= CH.uMax; u += CH.passo) {
        var t = evaluate(u, cfg).t;
        var fora = t > CH.tMax;
        var ponto = cx(u).toFixed(1) + "," + cy(t).toFixed(1);
        if (!atual || atual.fora !== fora) {
          if (atual) atual.pts.push(ponto);   // fecha o trecho anterior sem buraco
          atual = { fora: fora, pts: [] };
          segs.push(atual);
        }
        atual.pts.push(ponto);
      }
      return segs;
    }

    function polilinhas(segs, classe) {
      return segs.filter(function (s) { return s.pts.length > 1; }).map(function (s) {
        return '<polyline points="' + s.pts.join(" ") + '" class="' + classe +
          (s.fora ? " is-fora" : "") + '"></polyline>';
      }).join("");
    }

    function ultimoPonto(segs) {
      var s = segs[segs.length - 1];
      var p = s.pts[s.pts.length - 1].split(",");
      return { x: parseFloat(p[0]), y: parseFloat(p[1]) };
    }

    /* Primeiro ponto em que a referência de 1 servidor sai da escala: entra
       na descrição textual do gráfico, para quem usa leitor de tela. */
    function saiDaEscala(cfg) {
      for (var u = CH.uMin; u <= CH.uMax; u += CH.passo) {
        if (evaluate(u, cfg).t > CH.tMax) return u;
      }
      return null;
    }

    var CFG_REF = { servers: 1, mode: "replicado", cacheOn: false, cacheHit: 0, p2p: false };

    function renderChart(m) {
      var segsRef = chartSegmentos(CFG_REF);
      var segsCur = chartSegmentos(state);
      var yAlvo = cy(TARGET_MS);
      var fimRef = ultimoPonto(segsRef);
      var fimCur = ultimoPonto(segsCur);
      var curFora = segsCur.some(function (s) { return s.fora; });
      var coincidem = !state.p2p && !state.cacheOn && state.servers === 1 &&
        state.mode === "replicado";

      var eixos =
        '<line x1="' + CH.x0 + '" y1="' + CH.y1 + '" x2="' + CH.x1 + '" y2="' + CH.y1 +
        '" class="demo-ma-chart-axis"></line>' +
        '<line x1="' + CH.x0 + '" y1="' + CH.y0 + '" x2="' + CH.x0 + '" y2="' + CH.y1 +
        '" class="demo-ma-chart-axis"></line>' +
        '<line x1="' + CH.x0 + '" y1="' + CH.y0 + '" x2="' + CH.x1 + '" y2="' + CH.y0 +
        '" class="demo-ma-chart-teto"></line>' +
        '<line x1="' + CH.x0 + '" y1="' + yAlvo + '" x2="' + CH.x1 + '" y2="' + yAlvo +
        '" class="demo-ma-chart-target"></line>';

      /* Sem título de eixo dentro do SVG: a legenda em HTML logo abaixo já diz
         o que cada eixo é, e o topo do desenho é disputado por três rótulos
         (nomes das curvas, ponto atual e teto). */
      var rotulos =
        '<text x="' + (CH.x0 - 4) + '" y="' + (CH.y1 + 3) +
        '" class="demo-ma-chart-label" text-anchor="end">0</text>' +
        '<text x="' + (CH.x0 - 4) + '" y="' + (yAlvo + 3) +
        '" class="demo-ma-chart-label is-alvo" text-anchor="end">' + TARGET_MS + '</text>' +
        '<text x="' + (CH.x0 - 4) + '" y="' + (CH.y0 + 3) +
        '" class="demo-ma-chart-label" text-anchor="end">' + CH.tMax + '</text>' +
        '<text x="' + CH.x0 + '" y="' + (CH.y1 + 12) + '" class="demo-ma-chart-label">' +
        CH.uMin + '</text>' +
        '<text x="' + cx(500) + '" y="' + (CH.y1 + 12) +
        '" class="demo-ma-chart-label" text-anchor="middle">500</text>' +
        '<text x="' + CH.x1 + '" y="' + (CH.y1 + 12) +
        '" class="demo-ma-chart-label" text-anchor="end">' + CH.uMax + '</text>' +
        '<text x="' + CH.x1 + '" y="' + (CH.y1 + 24) +
        '" class="demo-ma-chart-label" text-anchor="end">usuários</text>';

      /* O rótulo da curva de referência vive na margem acima do teto; o do
         arranjo atual, logo abaixo do fim dela. Quando as duas coincidem
         (etapa 1 com 1 servidor), só um rótulo é desenhado e a legenda em
         HTML explica a coincidência. */
      var nomes =
        '<text x="' + (CH.x1 - 2) + '" y="' + Math.max(fimRef.y - 5, 8) +
        '" class="demo-ma-chart-name is-ref" text-anchor="end">1 servidor</text>' +
        (coincidem ? "" :
          '<text x="' + (CH.x1 - 2) + '" y="' + Math.max(fimCur.y + 11, 20) +
          '" class="demo-ma-chart-name is-cur" text-anchor="end">atual</text>');

      /* Ponto atual: o rótulo desce para baixo do ponto quando ele está no
         alto, senão colide com o nome das curvas. */
      var xNow = cx(state.users);
      var yNow = cy(m.t);
      var direita = xNow > CH.x1 - 70;
      var ponto = '<circle cx="' + xNow + '" cy="' + yNow +
        '" r="3.5" class="demo-ma-chart-dot"></circle>' +
        '<text x="' + (direita ? xNow - 6 : xNow + 6) + '" y="' +
        (yNow < CH.y0 + 28 ? yNow + 13 : yNow - 6) +
        '" class="demo-ma-chart-now" text-anchor="' +
        (direita ? "end" : "start") + '">' + state.users + " usuários: " +
        (m.t >= INF ? "fora da escala" : Math.round(m.t) + " ms") + "</text>";

      els.chart.innerHTML = eixos + rotulos +
        polilinhas(segsRef, "demo-ma-chart-ref") +
        polilinhas(segsCur, "demo-ma-chart-cur") +
        nomes + ponto;

      var uRef = saiDaEscala(CFG_REF);
      els.chart.setAttribute("aria-label",
        "Gráfico de tempo de resposta contra número de usuários, de " + CH.uMin + " a " +
        CH.uMax + ". Arranjo atual: " + state.users + " usuários dão " +
        (m.t >= INF ? "fila crescendo sem limite" : Math.round(m.t) + " milissegundos") +
        ". A curva de referência de 1 servidor sai da escala de " + CH.tMax +
        " milissegundos a partir de cerca de " + uRef + " usuários.");

      /* O aviso do teto vive aqui, em texto, e não dentro do desenho: era mais
         um rótulo disputando o topo, e é justamente a informação que não pode
         passar despercebida (curva interrompida no teto não é patamar). */
      var notas = [];
      if (coincidem) {
        notas.push("As duas curvas coincidem: o arranjo atual é o de referência.");
      }
      if (curFora || segsRef.some(function (s) { return s.fora; })) {
        notas.push("Onde a curva vira tracejada, ela passou de " + CH.tMax +
          " ms e saiu da escala: ali o tempo não estabilizou, disparou.");
      }
      els.chartNota.textContent = notas.length ? " " + notas.join(" ") : "";
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
        var antes = tutor.retrato();
        state.servers++;
        update(true);
        tutor.passoFeito("replicas");
        var exp = explicarServidores(antes, true);
        var diff = tutor.efeito({
          acao: "Você adicionou uma réplica: agora são " + state.servers + " servidores.",
          antes: antes, porque: exp.porque, olhe: exp.olhe
        });
        log("＋ réplica adicionada (agora " + state.servers + " servidores)", diff);
      });
      var rem = els.controls.querySelector(".demo-ma-remove");
      if (rem) rem.addEventListener("click", function () {
        var antes = tutor.retrato();
        state.servers--;
        update(true);
        if (state.servers <= 2) tutor.passoFeito("remover");
        var exp = explicarServidores(antes, false);
        var diff = tutor.efeito({
          acao: "Você removeu uma réplica: agora " + state.servers + " servidor" +
            (state.servers > 1 ? "es" : "") + ".",
          antes: antes, porque: exp.porque, olhe: exp.olhe
        });
        log("－ réplica removida (agora " + state.servers + " servidor" +
          (state.servers > 1 ? "es" : "") + ")", diff);
      });
      var mode = els.controls.querySelector(".demo-ma-mode");
      if (mode) mode.addEventListener("change", function () {
        var antes = tutor.retrato();
        var ligou = mode.checked;
        state.mode = ligou ? "particionado" : "replicado";
        update(true);
        tutor.passoFeito(ligou ? "particionar" : "desmarcar");
        var exp = explicarParticao(ligou);
        var diff = tutor.efeito({
          acao: ligou
            ? "Você particionou os dados: cada servidor passou a guardar uma fatia, e uma " +
              "delas concentra " + Math.round(HOT_SHARE * 100) + "% da procura."
            : "Você voltou ao arranjo replicado: todos os servidores guardam os mesmos dados.",
          antes: antes, porque: exp.porque, olhe: exp.olhe
        });
        log("modo: dados " + state.mode + (ligou ? " (uma fatia concentra " +
          Math.round(HOT_SHARE * 100) + "% da carga)" : ""), diff);
      });
      var cache = els.controls.querySelector(".demo-ma-cache");
      if (cache) cache.addEventListener("change", function () {
        var antes = tutor.retrato();
        state.cacheOn = cache.checked;
        update(true);
        if (state.cacheOn) tutor.passoFeito("cache");
        var exp = explicarCache(state.cacheOn);
        var diff = tutor.efeito({
          acao: state.cacheOn
            ? "Você ligou o cache com " + fmtPct(state.cacheHit) + " de acerto."
            : "Você desligou o cache.",
          antes: antes, porque: exp.porque, olhe: exp.olhe
        });
        log(state.cacheOn
          ? "cache ligado (acerto " + Math.round(state.cacheHit * 100) + "%)"
          : "cache desligado", diff);
      });
      var hit = els.controls.querySelector(".demo-ma-hit");
      if (hit) {
        var hitAntes = null;
        hit.addEventListener("input", function () {
          if (hitAntes === null) hitAntes = tutor.retrato();
          state.cacheHit = parseInt(hit.value, 10) / 100;
          hit.parentNode.querySelector("output").textContent = hit.value + "%";
          update(false);
        });
        hit.addEventListener("change", function () {
          var antes = hitAntes;
          hitAntes = null;
          if (!antes) return;
          tutor.passoFeito("acerto");
          var exp = explicarAcerto();
          var diff = tutor.efeito({
            acao: "Você levou a taxa de acerto do cache para " + fmtPct(state.cacheHit) + ".",
            antes: antes, porque: exp.porque, olhe: exp.olhe
          });
          log("taxa de acerto: " + fmtPct(state.cacheHit), diff);
        });
      }
      var p2p = els.controls.querySelector(".demo-ma-p2p");
      if (p2p) p2p.addEventListener("change", function () {
        var antes = tutor.retrato();
        state.p2p = p2p.checked;
        update(true);
        if (state.p2p) tutor.passoFeito("migrar");
        /* Quem arrastou até 1000 ANTES de ligar o P2P cumpria a meta com dois
           passos ainda em aberto, porque eles só eram avaliados no manipulador do
           slider (achado A9 da auditoria de 2026-08-04). */
        marcarPassosUsuarios();
        var exp = explicarP2p(state.p2p);
        var diff = tutor.efeito({
          acao: state.p2p
            ? "Você migrou para peer-to-peer: cada usuário virou peer."
            : "Você voltou ao cliente-servidor.",
          antes: antes, porque: exp.porque, olhe: exp.olhe
        });
        log(state.p2p
          ? "🌐 migrado para peer-to-peer: cada usuário agora traz capacidade"
          : "de volta ao cliente-servidor", diff);
      });
    }

    function updateMetrics(m) {
      var maxU = utilMax(m);
      if (maxU >= 1 && !state.p2p) state.saturatedOnce = true;
      var tempo = els.metrics.querySelector('[data-metric="tempo"]');
      tempo.textContent = fmtMs(m.t);
      tempo.setAttribute("data-ms", Math.round(Math.min(m.t, INF)));
      var util = els.metrics.querySelector('[data-metric="util"]');
      util.textContent = fmtPct(maxU);
      util.setAttribute("data-util", maxU.toFixed(3));
      var served = els.metrics.querySelector('[data-metric="served"]');
      served.textContent = fmtInt(m.served);
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
      /* Na etapa 5 o comparador não depende de carga nenhuma: os controles de
         população ficam atenuados para não competirem pela atenção. */
      els.root.classList.toggle("is-camadas", state.stage === 5);
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
      state.viuSaturacao1 = false;
      state.viuMil = false;
      tutor.abrirEtapa({
        passos: st.passos,
        previsao: st.previsao,
        conceito: st.conceito,
        aguardando: st.aguardando
      });
      update(true);
    }

    /* ============ Eventos ============ */

    /* O slider dispara "input" a cada pixel: o painel de efeito só fala quando
       o aluno solta ("change"), comparando com o retrato do início do arrasto. */
    var arrastoAntes = null;

    function marcarPassosUsuarios() {
      if (state.stage === 1) {
        if (state.users >= 240) { state.viuSaturacao1 = true; tutor.passoFeito("subir"); }
        if (state.viuSaturacao1 && state.users <= 100) tutor.passoFeito("voltar");
      }
      if (state.stage === 4 && state.p2p) {
        if (state.users >= 1000) { state.viuMil = true; tutor.passoFeito("mil"); }
        if (state.viuMil && state.users <= 100) tutor.passoFeito("voltar");
      }
    }

    els.usersRange.addEventListener("input", function () {
      if (arrastoAntes === null) arrastoAntes = tutor.retrato();
      state.users = parseInt(els.usersRange.value, 10);
      update(false);
    });
    els.usersRange.addEventListener("change", function () {
      var antes = arrastoAntes;
      arrastoAntes = null;
      if (!antes || antes.users === state.users) return;
      marcarPassosUsuarios();
      var exp = explicarUsuarios(antes);
      var diff = tutor.efeito({
        acao: "Você levou a população de " + antes.users + " para " + state.users +
          " usuários (demanda de " + num(state.users * REQ_PER_USER) + " pedidos/s).",
        antes: antes, porque: exp.porque, olhe: exp.olhe
      });
      log("usuários: " + antes.users + " → " + state.users, diff);
    });

    els.prev.addEventListener("click", function () { if (state.stage > 1) gotoStage(state.stage - 1); });
    els.next.addEventListener("click", function () {
      if (state.stage < STAGES.length) gotoStage(state.stage + 1);
    });
    els.tiers.addEventListener("click", function (e) {
      var b = e.target.closest("[data-tier]");
      if (!b) return;
      var tier = b.getAttribute("data-tier");
      var t = tier === "2" ? T2_MS : T3_MS;
      container.querySelector('[data-tier-result="' + tier + '"]').innerHTML =
        "latência medida: <strong data-tier-ms=\"" + t + "\">" + t + " ms</strong>" +
        (tier === "2" ? " (1 ida e volta até o servidor)"
          : " (1 ida e volta até o servidor + 1 na rede local)");
      state.tiers["t" + tier] = true;
      tutor.passoFeito("t" + tier);
      var ambos = state.tiers.t2 && state.tiers.t3;
      tutor.efeito({
        acao: "Você testou um pedido na arquitetura de " + tier + " camadas físicas.",
        antes: null,
        numeros: ambos
          ? "Duas camadas: " + T2_MS + " ms · Três camadas: " + T3_MS + " ms (" +
            Math.round(((T3_MS - T2_MS) / T2_MS) * 100) + "% a mais por pedido)"
          : "Latência deste caminho: " + t + " ms. Teste o outro para comparar.",
        porque: "as duas pernas até o servidor custam " + LEG_MS + " ms cada nas duas " +
          "arquiteturas. A terceira camada acrescenta 2 pernas de rede local do centro de " +
          "dados, de " + LAN_MS + " ms cada, mais " + CROSS_MS + " ms para atravessar a " +
          "fronteira do processo do banco. O trabalho de achar o dado custa igual nos " +
          "dois arranjos e por isso não entra na diferença.",
        olhe: ambos
          ? "o que se compra com esses " + (T3_MS - T2_MS) + " ms: o selo \"lógica da " +
            "aplicação em um só lugar\", que é manutenibilidade. Latência e manutenção " +
            "puxam para lados opostos."
          : "o selo no rodapé desta coluna: ele diz onde a lógica da aplicação mora nesta " +
            "arquitetura."
      });
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
      /* Com taxa de acerto em 0% o cache deixou de existir na prática, e o piso
         de 1 fazia o contador subir mesmo assim, contradizendo o texto que a demo
         mostra nesse instante (achado A6 da auditoria de 2026-08-04). */
      if (state.cacheOn && state.stage === 3 && state.cacheHit > 0) {
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
