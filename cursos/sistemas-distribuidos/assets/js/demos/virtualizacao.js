/* ============================================================
   demos/virtualizacao.js — Demo "A Sala de Máquinas"
   ------------------------------------------------------------
   Demonstração interativa do Tópico 6 (Sistemas Operacionais
   Distribuídos): o aluno monta um servidor multithreaded com o
   exemplo numérico do Coulouris (threads, cache, CPUs — e o
   gargalo que muda de lugar), ordena a escada de custos da
   chamada local à RPC pela Internet, provoca um fork que não
   copia nada até alguém escrever (copy-on-write) e corre a
   mesma chamada por RPC local × LRPC, caça instruções sensíveis
   como um hipervisor no x86 (e vê a que escapa, até a
   paravirtualização consertar) e empacota os mesmos serviços em
   máquinas virtuais e em contêineres, comparando densidade,
   boot e isolamento.
   Plano e fundamentação:
   docs/demos/2026-07-16-demo-virtualizacao-plano.md

   Modelo analítico determinístico com os números do próprio
   livro; ordens de grandeza e tamanhos são didáticos (grandezas
   relativas). Sorteios (ordem das instruções após a cena
   roteirizada na etapa 4; serviço vítima na etapa 5):
   ?demo-seed=<int> fixa o PRNG (mulberry32); ?demo-fast=1
   acelera animações e boots.
   Namespace: SD.demos["virtualizacao"]
   ============================================================ */

window.SD = window.SD || {};
SD.demos = SD.demos || {};

SD.demos["virtualizacao"] = (function () {
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

  /* ---- Etapa 2: a escada de custos (ordens de grandeza didáticas) ---- */
  var LADDER = [
    { id: "local", name: "Chamada de procedimento local", cost: "≈ 0,5 µs",
      why: "fica dentro do mesmo espaço de endereçamento: nem núcleo, nem rede." },
    { id: "sistema", name: "Chamada de sistema", cost: "≈ 20 µs",
      why: "cruza para o núcleo (TRAP + troca de contexto) — mas não muda de " +
        "espaço de usuário nem toca a rede." },
    { id: "lrpc", name: "LRPC (mesmo computador)", cost: "≈ 50 µs",
      why: "cruza para OUTRO processo, mas com pilha A compartilhada e sem " +
        "escalonar thread do servidor — o caso local otimizado." },
    { id: "lan", name: "RPC nula na rede local", cost: "≈ 150 µs",
      why: "atravessa DOIS núcleos, empacota, copia e ainda viaja pela rede — " +
        "décimos de milissegundo." },
    { id: "internet", name: "RPC pela Internet", cost: "≈ 200 ms",
      why: "latência alta e variável, muitos roteadores, carga do servidor: " +
        "mil vezes a LAN." }
  ];

  /* ---- Etapa 4: lote de instruções roteirizado ---- */
  var BATCH = [
    { kind: "comum", name: "ADD r1, r2 (soma)" },
    { kind: "priv", name: "configurar tabela de páginas" },
    { kind: "comum", name: "MOV r3, [mem] (leitura comum)" },
    { kind: "sens", name: "LSL — ler limite de segmento" },
    { kind: "priv", name: "desabilitar interrupções" }
  ];

  /* ---- Etapa 5: serviços e tamanhos (didáticos) ---- */
  var SERVICES = ["web", "api", "banco", "fila", "cache", "relatórios"];
  var SRV_RAM = 8;          /* GB por rack */
  var VM_GB = 2;            /* SO convidado 1,5 + app 0,5 */
  var CT_KERNEL_GB = 0.5;   /* núcleo hospedeiro (uma vez) */
  var CT_GB = 0.55;         /* app 0,5 + overhead 0,05 */
  var VM_BOOT = 3000;       /* ms simulados */
  var CT_BOOT = 150;

  function mount(container) {
    var params = new URLSearchParams(window.location.search);
    var seed = parseInt(params.get("demo-seed"), 10);
    var rand = isNaN(seed) ? Math.random : mulberry32(seed);
    var timeScale = params.get("demo-fast") ? 0.12 : 1;
    var startedAt = Date.now();

    var state = {
      stage: 1,
      /* etapa 1 */ threads: 1, cache: false, cpus: 1,
                    seen100: false, seen125: false, seen400: false, seen500: false,
                    seen444: false,
      /* etapa 2 */ ladderNext: 0, wrongSeen2: false, xraySeen: false,
                    expSeen: false, busy2: false,
      /* etapa 3 */ forked: false, pages: [], copies: 0,
                    ranRPC: false, ranLRPC: false, busy3: false,
      /* etapa 4 */ paravirt: false, leakSeen: false, fixSeen: false,
                    costSeen: false, busy4: false, guestLeak: false,
      /* etapa 5 */ vms: [], cts: [], vmFullSeen: false, ctAllSeen: false,
                    ctKernelFail: false, vmContained: false, busy5: false,
                    ctDown: false
    };

    function to(fn, ms) {
      setTimeout(function () { if (container.isConnected) fn(); }, ms * timeScale);
    }

    /* ============ Estrutura da interface ============ */

    container.innerHTML =
      '<div class="demo-cf demo-vz">' +
      '  <div class="demo-cf-head">' +
      '    <span class="badge demo-cf-badge">Demonstração</span>' +
      '    <p class="demo-cf-title"></p>' +
      '    <p class="demo-cf-instructions"></p>' +
      '    <p class="demo-cf-goal"></p>' +
      '  </div>' +
      '  <div class="demo-vz-stage-area"></div>' +
      '  <div class="demo-cf-controls demo-vz-controls"></div>' +
      '  <div class="demo-cf-summary callout" hidden>' +
      '    <p class="callout-title">🎓 A sala de máquinas sustenta a mágica</p>' +
      "    <p>As <strong>threads</strong> que atendem cada invocação (etapa 1) pagam " +
      "os custos da <strong>escada</strong> (etapa 2) com os <strong>truques de " +
      "memória</strong> do SO (etapa 3), dentro de máquinas que hoje são " +
      "<strong>virtuais</strong> (etapa 4), empacotadas como <strong>MVs ou " +
      "contêineres</strong> (etapa 5). É essa infraestrutura que a computação em " +
      "nuvem (Tópico 11) aluga por hora — e é sobre ela que TODO o middleware deste " +
      "curso está de pé.</p>" +
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
      area: container.querySelector(".demo-vz-stage-area"),
      controls: container.querySelector(".demo-vz-controls"),
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

    /* ============ Etapa 1 — Monte o servidor ============ */

    function calc1() {
      var cpu = state.cache ? 2.5 : 2;
      var io = state.cache ? 2 : 8;
      var tl = state.threads * 1000 / (cpu + io);
      var cl = state.cpus * 1000 / cpu;
      var dl = 1000 / io;
      var v = Math.min(tl, cl, dl);
      var gargalo = v === tl ? "threads" : (v === cl ? "CPU" : "disco");
      return { v: Math.round(v), gargalo: gargalo, cpu: cpu, io: io };
    }

    function renderStage1() {
      var r = calc1();
      if (r.v === 100) state.seen100 = true;
      if (r.v === 125) state.seen125 = true;
      if (r.v === 400) state.seen400 = true;
      if (r.v === 500) state.seen500 = true;
      els.area.innerHTML =
        '<div class="demo-vz-server">' +
        '  <p class="demo-vz-server-title">🖥️ Servidor — requisições: ' +
        (state.cache ? "2,5 ms CPU + 2 ms disco (média c/ cache 75%)"
          : "2 ms CPU + 8 ms disco") + "</p>" +
        '  <dl class="demo-cf-metrics">' +
        '    <div><dt>Vazão máxima</dt><dd data-vazao>' + r.v + " req/s</dd></div>" +
        '    <div><dt>Gargalo</dt><dd data-gargalo>' + r.gargalo + "</dd></div>" +
        '    <div><dt>Threads</dt><dd data-th>' + state.threads + "</dd></div>" +
        '    <div><dt>CPUs</dt><dd data-cp>' + state.cpus + "</dd></div>" +
        "  </dl>" +
        '  <p class="demo-vz-marks" data-seen100="' + state.seen100 +
        '" data-seen125="' + state.seen125 + '" data-seen400="' + state.seen400 +
        '" data-seen500="' + state.seen500 + '">marcos do livro: ' +
        [state.seen100 ? "✓100" : "100", state.seen125 ? "✓125" : "125",
         state.seen400 ? "✓400" : "400", state.seen500 ? "✓500" : "500"].join(" · ") +
        " req/s</p>" +
        "</div>";
      els.controls.innerHTML =
        '<label>threads: <input type="range" class="demo-vz-threads" min="1" max="8" ' +
        'step="1" value="' + state.threads + '"> <output data-th-out>' + state.threads +
        "</output></label>" +
        '<label><input type="checkbox" class="demo-vz-cache"' +
        (state.cache ? " checked" : "") + "> cache de blocos (75% de acerto, " +
        "+0,5 ms de CPU)</label>" +
        '<span class="demo-vz-cpurow">CPUs: ' +
        [1, 2].map(function (n) {
          return '<label><input type="radio" name="demo-vz-cpus" value="' + n + '"' +
            (state.cpus === n ? " checked" : "") + "> " + n + "</label>";
        }).join("") + "</span>";
      els.controls.querySelector(".demo-vz-threads").addEventListener("input", function (ev) {
        state.threads = parseInt(ev.target.value, 10);
        update1("threads = " + state.threads);
      });
      els.controls.querySelector(".demo-vz-cache").addEventListener("change", function (ev) {
        state.cache = ev.target.checked;
        update1(state.cache ? "cache LIGADA: E/S média cai a 2 ms, mas a CPU sobe a 2,5 ms"
          : "cache desligada");
      });
      els.controls.querySelectorAll('[name="demo-vz-cpus"]').forEach(function (rb) {
        rb.addEventListener("change", function () {
          state.cpus = parseInt(rb.value, 10);
          update1("CPUs = " + state.cpus);
        });
      });
    }

    function update1(what) {
      var r = calc1();
      if (r.v === 100) state.seen100 = true;
      if (r.v === 125) state.seen125 = true;
      if (r.v === 400) state.seen400 = true;
      if (r.v === 500) state.seen500 = true;
      var extra = "";
      if (r.v === 444 && !state.seen444) {
        state.seen444 = true;
        extra = " (o 444 do exercício do livro: as 2 threads viraram o limite!)";
      }
      log("🎚️ " + what + " → vazão <strong>" + r.v + " req/s</strong>, gargalo: <strong>" +
        r.gargalo + "</strong>" + extra + ".");
      if (state.stage === 1) renderStage1();
      updateNav();
    }

    /* ============ Etapa 2 — A escada dos custos ============ */

    function renderStage2() {
      var rungs = LADDER.map(function (m, i) {
        var placed = i < state.ladderNext;
        return '<button type="button" class="demo-vz-rung' + (placed ? " is-placed" : "") +
          '" data-rung="' + m.id + '" data-placed="' + placed + '"' +
          (placed || state.busy2 ? " disabled" : "") + ">" +
          "<strong>" + m.name + "</strong>" +
          (placed ? ' <span class="demo-vz-cost">' + m.cost + "</span>" : "") +
          "</button>";
      });
      /* embaralha visualmente os não colocados (ordem fixa p/ determinismo) */
      var shuffledIdx = [3, 0, 4, 2, 1];
      var html = state.ladderNext >= LADDER.length
        ? LADDER.map(function (m, i) { return rungs[i]; }).join("")
        : shuffledIdx.map(function (i) { return rungs[i]; }).join("");
      els.area.innerHTML =
        '<p class="demo-vz-hint">Clique nos mecanismos do MAIS BARATO ao MAIS CARO:</p>' +
        '<div class="demo-vz-ladder" data-ladder-done="' +
        (state.ladderNext >= LADDER.length) + '" data-wrong-seen="' + state.wrongSeen2 +
        '">' + html + "</div>" +
        '<div class="demo-vz-xray2" data-xray2' + (state.xraySeen ? "" : " hidden") + ">" +
        "<p><strong>Raio-X da RPC nula na LAN (~0,15 ms):</strong> rede " +
        '<strong>~0,01 ms</strong> — todo o resto é <strong>software</strong>:</p>' +
        "<ul><li>empacotamento e desempacotamento</li>" +
        "<li>cópias de dados (usuário↔núcleo, camadas, interface de rede)</li>" +
        "<li>cabeçalhos e somas de verificação</li>" +
        "<li>chamadas de sistema, escalonamento e trocas de contexto</li></ul>" +
        "</div>" +
        '<p class="demo-vz-exp" data-exp' + (state.expSeen ? "" : " hidden") + ">" +
        "📦 Buscar 32 KB (RMI nula 2 ms + 1,5 ms/KB): <strong>1 chamada de 32 KB = " +
        '<span data-exp1>50 ms</span></strong> × <strong>32 chamadas de 1 KB = ' +
        '<span data-exp32>112 ms</span></strong> — a latência fixa se paga a cada ida.</p>';
      els.controls.innerHTML =
        '<button type="button" class="btn demo-vz-xraybtn"' +
        (state.ladderNext < LADDER.length ? " disabled" : "") +
        ">🩻 Raio-X da RPC na LAN</button>" +
        '<button type="button" class="btn btn-secondary demo-vz-expbtn"' +
        (state.ladderNext < LADDER.length ? " disabled" : "") +
        ">📦 Experimento: 32 KB em 1 × 32 chamadas</button>";
      els.area.querySelectorAll(".demo-vz-rung").forEach(function (btn) {
        btn.addEventListener("click", function () { pick2(btn.getAttribute("data-rung")); });
      });
      els.controls.querySelector(".demo-vz-xraybtn").addEventListener("click", function () {
        state.xraySeen = true;
        log("🩻 O raio-X abriu a barra da RPC: a REDE é ~0,01 ms de ~0,15 ms — o atraso " +
          "é dominado pelo código do núcleo e do runtime de RPC.");
        renderStage2();
        updateNav();
      });
      els.controls.querySelector(".demo-vz-expbtn").addEventListener("click", function () {
        state.expSeen = true;
        log("📦 1×32 KB = 2 + 32×1,5 = <strong>50 ms</strong>; 32×1 KB = 32×(2+1,5) = " +
          "<strong>112 ms</strong>. A latência fixa (2 ms) cobrada 32 vezes mais que " +
          "dobra o tempo total: menos idas, com mais dados.");
        renderStage2();
        updateNav();
      });
    }

    function pick2(id) {
      var expected = LADDER[state.ladderNext];
      var picked = LADDER.filter(function (m) { return m.id === id; })[0];
      if (id !== expected.id) {
        state.wrongSeen2 = true;
        log("✗ <strong>" + picked.name + "</strong> ainda não: " + picked.why +
          " O próximo degrau é mais barato que esse.");
        renderStage2();
        return;
      }
      state.ladderNext++;
      log("✓ Degrau " + state.ladderNext + ": <strong>" + picked.name + "</strong> (" +
        picked.cost + ") — " + picked.why);
      if (state.ladderNext >= LADDER.length) {
        log("🪜 Escada completa: da fração de microssegundo às centenas de " +
          "milissegundos — <strong>seis ordens de grandeza</strong>. Agora abra o " +
          "raio-X e rode o experimento dos 32 KB.");
      }
      renderStage2();
      updateNav();
    }

    /* ============ Etapa 3 — Truques de memória ============ */

    function renderStage3() {
      var pagesHtml = state.pages.map(function (p, i) {
        return '<button type="button" class="demo-vz-frame" data-frame="' + i +
          '" data-state="' + p + '"' +
          (!state.forked || p === "copiado" || state.busy3 ? " disabled" : "") + ">" +
          "pág. " + (i + 1) + "<span>" +
          (state.forked ? (p === "copiado" ? "quadro COPIADO" : "quadro compartilhado")
            : "só do pai") + "</span></button>";
      }).join("");
      els.area.innerHTML =
        '<div class="demo-vz-cow">' +
        '  <p class="demo-vz-server-title">🧠 (a) Cópia na escrita — processo pai com 8 ' +
        "páginas" + (state.forked ? " + filho (fork feito)" : "") + "</p>" +
        '  <div class="demo-vz-frames">' + pagesHtml + "</div>" +
        '  <p class="demo-vz-marks" data-fork-done="' + state.forked +
        '" data-copies="' + state.copies + '">cópias físicas de quadros: <strong>' +
        state.copies + "</strong>" +
        (state.forked ? " — clique numa página para o FILHO escrever nela" : "") + "</p>" +
        "</div>" +
        '<div class="demo-vz-lrpc">' +
        '  <p class="demo-vz-server-title">⚡ (b) A mesma invocação local, dois caminhos</p>' +
        '  <dl class="demo-cf-metrics">' +
        '    <div><dt>RPC local: cópias</dt><dd data-rpc-copias>' +
        (state.ranRPC ? "4" : "—") + "</dd></div>" +
        '    <div><dt>RPC local: tempo</dt><dd data-rpc-tempo>' +
        (state.ranRPC ? "~300 µs" : "—") + "</dd></div>" +
        '    <div><dt>LRPC: cópias</dt><dd data-lrpc-copias>' +
        (state.ranLRPC ? "1" : "—") + "</dd></div>" +
        '    <div><dt>LRPC: tempo</dt><dd data-lrpc-tempo>' +
        (state.ranLRPC ? "~100 µs" : "—") + "</dd></div>" +
        "  </dl>" +
        "</div>";
      els.controls.innerHTML =
        '<button type="button" class="btn demo-vz-fork"' +
        (state.forked || state.busy3 ? " disabled" : "") + ">🍴 fork()</button>" +
        '<button type="button" class="btn btn-secondary demo-vz-rpc"' +
        (state.busy3 ? " disabled" : "") + ">▶ RPC local convencional</button>" +
        '<button type="button" class="btn btn-secondary demo-vz-lrpcbtn"' +
        (state.busy3 ? " disabled" : "") + ">▶ LRPC (pilha A compartilhada)</button>" +
        '<button type="button" class="btn-ghost demo-vz-cow-reset"' +
        (state.busy3 ? " disabled" : "") + ">↺ Refazer o fork</button>";
      els.area.querySelectorAll(".demo-vz-frame").forEach(function (btn) {
        btn.addEventListener("click", function () {
          write3(parseInt(btn.getAttribute("data-frame"), 10));
        });
      });
      els.controls.querySelector(".demo-vz-fork").addEventListener("click", fork3);
      els.controls.querySelector(".demo-vz-rpc").addEventListener("click", function () { runCall3(false); });
      els.controls.querySelector(".demo-vz-lrpcbtn").addEventListener("click", function () { runCall3(true); });
      els.controls.querySelector(".demo-vz-cow-reset").addEventListener("click", function () {
        state.forked = false; state.copies = 0;
        state.pages = state.pages.map(function () { return "pai"; });
        log("↺ De volta ao processo pai sozinho, 8 páginas, zero cópias.");
        renderStage3();
      });
    }

    function fork3() {
      if (state.forked) return;
      state.forked = true;
      state.pages = state.pages.map(function () { return "compartilhado"; });
      log("🍴 <strong>fork()</strong>: o filho nasceu com as 8 páginas — e o contador de " +
        "cópias físicas marca <strong>ZERO</strong>. Os quadros ficaram compartilhados " +
        "e protegidos contra escrita.");
      renderStage3();
      updateNav();
    }

    function write3(i) {
      if (!state.forked || state.pages[i] === "copiado") return;
      state.busy3 = true;
      state.pages[i] = "escrevendo";
      renderStage3();
      log("✍️ O filho tenta escrever na página " + (i + 1) +
        " — página protegida: <strong>exceção de erro de acesso</strong>!");
      to(function () {
        state.pages[i] = "copiado";
        state.copies++;
        state.busy3 = false;
        log("📄 O tratador copiou SÓ o quadro da página " + (i + 1) +
          " (cópias físicas: <strong>" + state.copies + "</strong>) e liberou a " +
          "escrita. As outras " + (8 - state.copies) + " páginas seguem " +
          "compartilhadas — quem nunca escreve, nunca paga.");
        if (state.stage === 3) renderStage3();
        updateNav();
      }, 700);
    }

    function runCall3(isLrpc) {
      if (state.busy3) return;
      state.busy3 = true;
      renderStage3();
      var t = 0;
      if (isLrpc) {
        log("▶ <strong>LRPC</strong>: o stub empacota os argumentos DIRETO na pilha A, " +
          "na região compartilhada com o servidor (cópia 1 — e única).");
        to(function () {
          log("🚪 O núcleo valida a entrada e a <strong>própria thread do cliente</strong> " +
            "executa o procedimento no domínio do servidor — ninguém foi escalonado.");
        }, (t += 600));
        to(function () {
          state.ranLRPC = true;
          state.busy3 = false;
          log("✅ LRPC concluída: <strong>1 cópia</strong>, ~100 µs — o fator ~3× de " +
            "Bershad sobre a RPC local.");
          if (state.stage === 3) renderStage3();
          updateNav();
        }, (t += 600));
      } else {
        log("▶ <strong>RPC local convencional</strong>: pilha do stub → mensagem " +
          "(cópia 1) → buffer do núcleo (cópia 2)…");
        to(function () {
          log("… → mensagem do servidor (cópia 3) → pilha do stub do servidor " +
            "(cópia 4). E ainda: escalonar uma thread do servidor + trocas de contexto.");
        }, (t += 700));
        to(function () {
          state.ranRPC = true;
          state.busy3 = false;
          log("✅ RPC local concluída: <strong>4 cópias</strong>, ~300 µs.");
          if (state.stage === 3) renderStage3();
          updateNav();
        }, (t += 700));
      }
    }

    /* ============ Etapa 4 — Capture a instrução ============ */

    function renderStage4() {
      els.area.innerHTML =
        '<div class="demo-vz-rings">' +
        '  <div class="demo-vz-ring" data-ring="0">anel 0 — <strong>hipervisor</strong>' +
        "<span>instruções privilegiadas só aqui</span></div>" +
        '  <div class="demo-vz-ring" data-ring="1">anel 1 — SO convidado ' +
        (state.paravirt ? "<strong>(portado: paravirtualização)</strong>" : "(sem modificação)") +
        "<span data-guest-view>" +
        (state.guestLeak
          ? "💥 o convidado leu a máquina REAL: 2 CPUs, 16 GB — a MV acreditava ter " +
            "1 vCPU, 2 GB. Virtualização quebrada em silêncio."
          : "visão do convidado: 1 vCPU · 2 GB (virtual) ✓") + "</span></div>" +
        '  <div class="demo-vz-ring" data-ring="3">anel 3 — aplicativos</div>' +
        "</div>" +
        '<p class="demo-vz-marks" data-leak-seen="' + state.leakSeen +
        '" data-paravirt="' + state.paravirt + '" data-fix-seen="' + state.fixSeen +
        '" data-cost-seen="' + state.costSeen + '"></p>' +
        '<div class="demo-vz-xray2" data-cost4' + (state.costSeen ? "" : " hidden") + ">" +
        "<p><strong>Custo comparado:</strong> virtualização <em>total</em> = camada de " +
        "simulação interpretando as instruções afetadas (lenta, convidado intacto); " +
        "<em>paravirtualização</em> = comuns direto no hardware + hiperchamadas só nas " +
        "privilegiadas (rápida, convidado portado). O Xen escolheu a segunda.</p>" +
        "</div>";
      els.controls.innerHTML =
        '<button type="button" class="btn demo-vz-batch"' +
        (state.busy4 ? " disabled" : "") + ">▶ Rodar lote de instruções do convidado</button>" +
        '<label><input type="checkbox" class="demo-vz-pv"' +
        (state.paravirt ? " checked" : "") + (state.busy4 ? " disabled" : "") +
        "> paravirtualização (portar o SO convidado)</label>" +
        '<button type="button" class="btn btn-secondary demo-vz-cost"' +
        (state.busy4 || !state.leakSeen ? " disabled" : "") +
        ">📊 Comparar custo com a simulação total</button>";
      els.controls.querySelector(".demo-vz-batch").addEventListener("click", batch4);
      els.controls.querySelector(".demo-vz-pv").addEventListener("change", function (ev) {
        state.paravirt = ev.target.checked;
        state.guestLeak = false;
        log(state.paravirt
          ? "🔧 <strong>Convidado portado</strong>: instruções privilegiadas reescritas " +
            "como hiperchamadas; as sensíveis, tratadas no próprio convidado."
          : "🚫 Convidado sem modificação: de volta ao x86 cru.");
        renderStage4();
      });
      els.controls.querySelector(".demo-vz-cost").addEventListener("click", function () {
        state.costSeen = true;
        log("📊 Simulação total: TODAS as instruções afetadas passam pela camada de " +
          "simulação — convidado intacto, desempenho ruim. Paravirtualização: quase " +
          "tudo roda direto no hardware — desempenho, ao preço de portar o convidado.");
        renderStage4();
        updateNav();
      });
    }

    function batch4() {
      if (state.busy4) return;
      state.busy4 = true;
      renderStage4();
      /* após a 1ª rodada roteirizada, embaralha a ordem (semente) */
      var batch = state.leakSeen
        ? BATCH.slice().sort(function () { return rand() - 0.5; })
        : BATCH;
      var t = 0;
      log("— ▶ lote de " + batch.length + " instruções do convidado (" +
        (state.paravirt ? "paravirtualizado" : "sem modificação") + ") —");
      batch.forEach(function (ins) {
        to(function () {
          if (state.stage !== 4) return;
          if (ins.kind === "comum") {
            log("· <code>" + ins.name + "</code> — comum: executa direto no hardware, " +
              "rápida.");
          } else if (ins.kind === "priv") {
            log(state.paravirt
              ? "📞 <code>" + ins.name + "</code> — privilegiada REESCRITA como " +
                "<strong>hiperchamada</strong>: o hipervisor executa com segurança."
              : "🪤 <code>" + ins.name + "</code> — privilegiada: <strong>TRAP!</strong> " +
                "Capturada pelo hipervisor (anel 0), que a executa com segurança.");
          } else {
            if (state.paravirt) {
              state.fixSeen = true;
              state.guestLeak = false;
              log("🛡️ <code>" + ins.name + "</code> — sensível não privilegiada: o " +
                "convidado PORTADO não a usa crua; o código reescrito preserva a visão " +
                "virtual. Nada vazou.");
            } else {
              state.leakSeen = true;
              state.guestLeak = true;
              log("💥 <code>" + ins.name + "</code> — <strong>sensível e NÃO " +
                "privilegiada</strong>: nenhum trap! Ela leu o estado FÍSICO da máquina " +
                "e o convidado viu 2 CPUs e 16 GB reais. A condição de Popek e Goldberg " +
                "foi violada — em silêncio (é a falha do x86 clássico: 17 instruções " +
                "assim).");
            }
            if (state.stage === 4) renderStage4();
          }
        }, (t += 650));
      });
      to(function () {
        state.busy4 = false;
        if (state.stage === 4) renderStage4();
        updateNav();
      }, (t += 400));
    }

    /* ============ Etapa 5 — MV × contêiner ============ */

    function ramUsed(rack) {
      return rack === "vm"
        ? state.vms.length * VM_GB
        : (state.cts.length ? CT_KERNEL_GB + state.cts.length * CT_GB : 0);
    }

    function renderStage5() {
      function slots(list, kind, down) {
        return list.map(function (s) {
          return '<span class="demo-vz-slot" data-kind="' + kind + '" data-down="' +
            (down || s.down ? "true" : "false") + '">' + s.name +
            (s.booting ? " ⏳" : (down || s.down ? " 💥" : " ✓")) + "</span>";
        }).join("") || "<em>vazio</em>";
      }
      var vmMem = ramUsed("vm").toFixed(1);
      var ctMem = ramUsed("ct").toFixed(2);
      els.area.innerHTML =
        '<div class="demo-vz-racks">' +
        '  <div class="demo-vz-rack">' +
        '    <p class="demo-vz-server-title">🗄️ Rack A — máquinas virtuais (' + SRV_RAM +
        " GB) <span>cada MV: SO convidado 1,5 GB + app 0,5 GB · boot ~30 s</span></p>" +
        '    <div class="demo-vz-slotrow" data-vm-count="' + state.vms.length +
        '" data-vm-full="' + state.vmFullSeen + '" data-vm-contained="' +
        state.vmContained + '">' + slots(state.vms, "vm") + "</div>" +
        '    <p class="demo-vz-marks">memória: <strong data-vm-mem>' + vmMem +
        "</strong> / " + SRV_RAM + " GB · hipervisor: " +
        '<strong data-hyper>ok</strong></p>' +
        "  </div>" +
        '  <div class="demo-vz-rack">' +
        '    <p class="demo-vz-server-title">🗄️ Rack B — contêineres (' + SRV_RAM +
        " GB) <span>núcleo hospedeiro 0,5 GB + ~0,55 GB por contêiner · boot ~1 s</span></p>" +
        '    <div class="demo-vz-slotrow" data-ct-count="' + state.cts.length +
        '" data-ct-all="' + state.ctAllSeen + '" data-ct-kernel-fail="' +
        state.ctKernelFail + '">' + slots(state.cts, "ct", state.ctDown) + "</div>" +
        '    <p class="demo-vz-marks">memória: <strong data-ct-mem>' + ctMem +
        "</strong> / " + SRV_RAM + " GB · núcleo hospedeiro: " +
        '<strong data-hostkernel>' + (state.ctDown ? "💥 PANE" : "ok") + "</strong></p>" +
        "  </div>" +
        "</div>";
      els.controls.innerHTML =
        '<button type="button" class="btn demo-vz-addvm"' +
        (state.busy5 ? " disabled" : "") + ">➕ Empacotar serviço como MV</button>" +
        '<button type="button" class="btn demo-vz-addct"' +
        (state.busy5 || state.ctDown ? " disabled" : "") +
        ">➕ Empacotar serviço como contêiner</button>" +
        '<button type="button" class="btn btn-secondary demo-vz-failvm"' +
        (state.busy5 || !state.vms.length ? " disabled" : "") +
        ">💥 Bug de núcleo numa MV</button>" +
        '<button type="button" class="btn btn-secondary demo-vz-failct"' +
        (state.busy5 || !state.cts.length || state.ctDown ? " disabled" : "") +
        ">💥 Bug de núcleo num contêiner</button>" +
        '<button type="button" class="btn-ghost demo-vz-migrate"' +
        (state.busy5 || !state.vms.length ? " disabled" : "") +
        ">➡️ Migrar uma MV a quente</button>" +
        '<button type="button" class="btn-ghost demo-vz-rack-reset"' +
        (state.busy5 ? " disabled" : "") + ">↺ Reiniciar racks</button>";
      els.controls.querySelector(".demo-vz-addvm").addEventListener("click", function () { pack5("vm"); });
      els.controls.querySelector(".demo-vz-addct").addEventListener("click", function () { pack5("ct"); });
      els.controls.querySelector(".demo-vz-failvm").addEventListener("click", function () { fail5("vm"); });
      els.controls.querySelector(".demo-vz-failct").addEventListener("click", function () { fail5("ct"); });
      els.controls.querySelector(".demo-vz-migrate").addEventListener("click", function () {
        log("➡️ MV <strong>" + state.vms[0].name + "</strong> migrada A QUENTE para outro " +
          "servidor físico — sem parar o serviço. Processos comuns não têm essa " +
          "facilidade; MVs, sim (§7.7.1). É assim que a nuvem esvazia um servidor para " +
          "manutenção.");
      });
      els.controls.querySelector(".demo-vz-rack-reset").addEventListener("click", function () {
        state.vms = []; state.cts = []; state.ctDown = false;
        log("↺ Racks esvaziados (as metas já cumpridas permanecem).");
        renderStage5();
      });
    }

    function pack5(kind) {
      if (state.busy5) return;
      var list = kind === "vm" ? state.vms : state.cts;
      if (list.length >= SERVICES.length) {
        log("ℹ️ Os " + SERVICES.length + " serviços já estão empacotados nesse rack.");
        return;
      }
      var name = SERVICES[list.length];
      if (kind === "vm" && ramUsed("vm") + VM_GB > SRV_RAM) {
        state.vmFullSeen = true;
        log("🚫 <strong>Sem memória no rack A</strong>: cada MV carrega um SO convidado " +
          "inteiro (2 GB por serviço) — só " + state.vms.length + " de " +
          SERVICES.length + " serviços couberam. Densidade tem preço.");
        renderStage5();
        updateNav();
        return;
      }
      state.busy5 = true;
      var item = { name: name, booting: true, down: false };
      list.push(item);
      if (kind === "ct" && state.cts.length === 1) {
        log("📦 Primeiro contêiner: o núcleo HOSPEDEIRO (0,5 GB) passa a ser " +
          "compartilhado por todos os contêineres deste rack.");
      }
      renderStage5();
      log((kind === "vm" ? "🖥️ MV" : "📦 Contêiner") + " <strong>" + name +
        "</strong>: boot iniciado (" + (kind === "vm" ? "~30 s — SO convidado inteiro"
          : "~1 s — só o processo") + ")…");
      to(function () {
        item.booting = false;
        state.busy5 = false;
        log("✅ <strong>" + name + "</strong> no ar no rack " +
          (kind === "vm" ? "A (MV)" : "B (contêiner)") + ".");
        if (kind === "ct" && state.cts.length === SERVICES.length) {
          state.ctAllSeen = true;
          log("📊 Rack B: os <strong>" + SERVICES.length + " serviços</strong> couberam " +
            "com folga (" + ramUsed("ct").toFixed(2) + " GB de " + SRV_RAM +
            ") — e cada boot levou ~1 s. Densidade e velocidade: o forte do contêiner.");
        }
        if (state.stage === 5) renderStage5();
        updateNav();
      }, kind === "vm" ? VM_BOOT : CT_BOOT);
    }

    function fail5(kind) {
      if (state.busy5) return;
      if (kind === "vm") {
        var i = Math.floor(rand() * state.vms.length);
        var vm = state.vms[i];
        vm.down = true;
        state.vmContained = true;
        log("💥 Bug de núcleo DENTRO da MV <strong>" + vm.name + "</strong>: o núcleo " +
          "que falhou é o convidado DELA. As outras MVs e o hipervisor seguem " +
          "intactos — <strong>falha contida</strong>.");
        to(function () {
          vm.down = false;
          log("🔄 MV " + vm.name + " reiniciada a partir de seu próprio SO convidado.");
          if (state.stage === 5) renderStage5();
        }, 1800);
      } else {
        var j = Math.floor(rand() * state.cts.length);
        state.ctDown = true;
        state.ctKernelFail = true;
        log("💥 Bug de núcleo disparado pelo contêiner <strong>" + state.cts[j].name +
          "</strong>: o núcleo que falhou é o do HOSPEDEIRO — compartilhado por " +
          "todos. <strong>Os " + state.cts.length + " contêineres caíram juntos.</strong> " +
          "Um núcleo só = um destino só.");
        to(function () {
          state.ctDown = false;
          log("🔄 Hospedeiro reiniciado; contêineres de volta (rápido — mas caíram " +
            "TODOS). MVs para isolar, contêineres para empacotar: a nuvem usa os dois " +
            "(Tópico 11).");
          if (state.stage === 5) renderStage5();
          updateNav();
        }, 2200);
      }
      renderStage5();
      updateNav();
    }

    /* ============ Etapas ============ */

    var STAGES = [
      {
        title: "Etapa 1 — Monte o servidor (threads e vazão)",
        instructions: "Requisições custam 2 ms de CPU + 8 ms de disco. Comece com 1 " +
          "thread e vá girando os botões: threads, cache, CPUs. Observe a vazão E o " +
          "gargalo — ele muda de lugar a cada otimização.",
        goalText: "Meta: reproduzir os quatro marcos do livro — 100, 125, 400 e " +
          "500 req/s.",
        setup: function () {},
        render: renderStage1,
        goalMet: function () {
          return state.seen100 && state.seen125 && state.seen400 && state.seen500;
        }
      },
      {
        title: "Etapa 2 — A escada dos custos",
        instructions: "Cinco mecanismos de invocação, embaralhados. Ordene do mais " +
          "barato ao mais caro (erros são explicados). Depois, abra o raio-X da RPC na " +
          "LAN e rode o experimento dos 32 KB.",
        goalText: "Meta: ordenar a escada + ver o raio-X (software domina) + comparar " +
          "1×32 KB com 32×1 KB.",
        setup: function () { state.busy2 = false; },
        render: renderStage2,
        goalMet: function () {
          return state.ladderNext >= LADDER.length && state.xraySeen && state.expSeen;
        }
      },
      {
        title: "Etapa 3 — Truques de memória (copy-on-write e LRPC)",
        instructions: "Faça o fork e veja o contador de cópias marcar zero; escreva em " +
          "duas páginas do filho e observe o que é copiado. Depois rode a mesma " +
          "invocação por RPC local e por LRPC e compare os tiles.",
        goalText: "Meta: fork sem cópias + 2 quadros copiados na escrita + RPC e LRPC " +
          "executadas (4 cópias × 1).",
        setup: function () {
          state.busy3 = false;
          if (!state.pages.length) {
            state.pages = ["pai", "pai", "pai", "pai", "pai", "pai", "pai", "pai"];
          }
        },
        render: renderStage3,
        goalMet: function () {
          return state.forked && state.copies >= 2 && state.ranRPC && state.ranLRPC;
        }
      },
      {
        title: "Etapa 4 — Capture a instrução (Popek & Goldberg)",
        instructions: "Você é o hipervisor (anel 0); o convidado roda no anel 1. Rode o " +
          "lote de instruções e observe as armadilhas — e a instrução que escapa. " +
          "Depois ligue a paravirtualização, rode de novo e compare o custo com a " +
          "simulação total.",
        goalText: "Meta: ver a instrução sensível escapar (x86), consertar com a " +
          "paravirtualização e comparar os custos.",
        setup: function () { state.busy4 = false; },
        render: renderStage4,
        goalMet: function () {
          return state.leakSeen && state.fixSeen && state.costSeen;
        }
      },
      {
        title: "Etapa 5 — MV × contêiner: empacote o servidor",
        instructions: "Dois racks de 8 GB e seis serviços. Empacote como MV até faltar " +
          "memória; empacote os seis como contêineres. Depois dispare um bug de núcleo " +
          "em cada mundo e compare o estrago.",
        goalText: "Meta: rack de MVs lotado + 6 contêineres no ar + bug de núcleo " +
          "contido na MV e derrubando todos os contêineres.",
        setup: function () { state.busy5 = false; },
        render: renderStage5,
        goalMet: function () {
          return state.vmFullSeen && state.ctAllSeen && state.ctKernelFail &&
            state.vmContained;
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
      mount(container);
    });

    gotoStage(1);
  }

  return { mount: mount };
})();
