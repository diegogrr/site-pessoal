/* ============================================================
   demos/sockets-mensagens.js — Demo "O Middleware é Você"
   ------------------------------------------------------------
   Demonstração interativa do Tópico 4 (Comunicação entre
   Processos): o aluno vincula soquetes a portas (e vê mensagens
   sumirem em silêncio), sincroniza send/receive (e provoca um
   deadlock), empacota uma struct entre máquinas de arquiteturas
   diferentes (bytes crus × CDR × JSON × XML), sofre a requisição
   duplicada criada pela própria retransmissão (débito executado
   duas vezes; filtro de duplicatas = at-most-once) e faz
   multicast para réplicas que divergem por omissão e por ordem.
   Plano e fundamentação:
   docs/demos/2026-07-15-demo-sockets-mensagens-plano.md

   Não há sockets reais: processos e máquinas são simulados na
   página. Sorteios (qual perda ocorre depois das cenas roteirizadas,
   qual réplica perde/aplica em outra ordem): ?demo-seed=<int> fixa
   o PRNG (mulberry32); ?demo-fast=1 acelera as animações.
   Namespace: SD.demos["sockets-mensagens"]
   ============================================================ */

window.SD = window.SD || {};
SD.demos = SD.demos || {};

SD.demos["sockets-mensagens"] = (function () {
  "use strict";

  /* ---- Etapa 3: a struct Person do Coulouris (§4.3, Figs. 4.8/4.10) ---- */
  var JSON_TXT = '{"name":"Smith","place":"London","year":1984}';
  var XML_TXT = '<person id="123456789"><name>Smith</name>' +
    "<place>London</place><year>1984</year></person>";
  var CDR_BYTES = "00 00 00 05 | 53 6D 69 74 | 68 00 00 00 |" +
    " 00 00 00 06 | 4C 6F 6E 64 | 6F 6E 00 00 | 00 00 07 C0";
  var CDR_SIZE = 28; /* Fig. 4.8: índices 0–27 */
  var YEAR_GARBLED = "3.221.684.224"; /* 0x000007C0 lido na ordem trocada = 0xC0070000 */

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
    var timeScale = params.get("demo-fast") ? 0.12 : 1;
    var startedAt = Date.now();

    var state = {
      stage: 1,
      delivered: 0, dropped: 0, dups: 0, retx: 0,
      /* etapa 1 */ bound: false, bindErrSeen: false, dropSeen: false,
                    delC1: 0, delC2: 0, inbox: [], msgN: 0, busy1: false,
      /* etapa 2 */ a: "run", b: "run", transit: null, deadlock: false,
                    exchanges: 0, deadlockSeen: false, timeoutLost: false,
                    expTimeout: 500, expBusy: false,
      /* etapa 3 */ fmt: "crus", mismatch: false, rawSeen: false, swappedSeen: false,
                    sizes: { cdr: 0, json: 0, xml: 0 }, busy3: false,
      /* etapa 4 */ saldo: 100, esperado: 100, execs: 0, filterOn: false,
                    history: {}, opSeq: 0, firstCon: false, firstDebNoF: false,
                    firstDebF: false, doubleSeen: false, filterFixSeen: false,
                    busy4: false,
      /* etapa 5 */ reps: [10, 10, 10], reliable: false, divLoss: false,
                    divOrder: false, convergedSeen: false, busy5: false
    };

    function to(fn, ms) {
      setTimeout(function () { if (container.isConnected) fn(); }, ms * timeScale);
    }

    /* ============ Estrutura da interface ============ */

    container.innerHTML =
      '<div class="demo-cf demo-sm">' +
      '  <div class="demo-cf-head">' +
      '    <span class="badge demo-cf-badge">Demonstração</span>' +
      '    <p class="demo-cf-title"></p>' +
      '    <p class="demo-cf-instructions"></p>' +
      '    <p class="demo-cf-goal"></p>' +
      '  </div>' +
      '  <div class="demo-sm-stage-area"></div>' +
      '  <div class="demo-cf-controls demo-sm-controls"></div>' +
      '  <dl class="demo-cf-metrics">' +
      '    <div><dt>Entregues</dt><dd data-metric="delivered">0</dd></div>' +
      '    <div><dt>Descartadas</dt><dd data-metric="dropped">0</dd></div>' +
      '    <div><dt>Duplicatas</dt><dd data-metric="dups">0</dd></div>' +
      '    <div><dt>Retransmissões</dt><dd data-metric="retx">0</dd></div>' +
      '  </dl>' +
      '  <div class="demo-cf-summary callout" hidden>' +
      '    <p class="callout-title">🎓 O que você fez à mão → quem faz por você</p>' +
      '    <p><strong>Vincular e localizar</strong> portas e serviços → servidor de nomes/' +
      "<em>binder</em> (Tópico 9). <strong>Empacotar e desempacotar</strong> structs → o " +
      "middleware de RPC/RMI gera isso a partir da interface (Tópico 5). <strong>Timeout, " +
      "retransmissão e filtro de duplicatas</strong> → protocolos requisição-resposta e a " +
      "semântica de invocação <em>at-least-once</em> × <em>at-most-once</em> (Tópico 5). " +
      "<strong>Multicast confiável e totalmente ordenado</strong> → comunicação em grupo " +
      "(Tópicos 6 e 10). A comunicação entre processos é o porão de TODO o resto do curso " +
      "— e agora você sabe o que tem lá embaixo.</p>" +
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
      area: container.querySelector(".demo-sm-stage-area"),
      controls: container.querySelector(".demo-sm-controls"),
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

    /* ============ Etapa 1 — Caixas postais (portas e soquetes) ============ */

    function renderStage1() {
      var inboxItems = state.inbox.map(function (m) {
        return "<li>#" + m.n + " de <code>" + m.from + "</code></li>";
      }).join("");
      els.area.innerHTML =
        '<div class="demo-sm-world">' +
        '  <div class="demo-sm-machine">' +
        '    <p class="demo-sm-machine-title">💻 Computador A · 10.0.0.1</p>' +
        '    <div class="demo-sm-proc">C1 <span>soquete na porta 41230</span></div>' +
        '    <div class="demo-sm-proc">C2 <span>soquete na porta 41231</span></div>' +
        '    <p class="demo-sm-note">clientes: qualquer porta livre serve</p>' +
        "  </div>" +
        '  <div class="demo-sm-machine">' +
        '    <p class="demo-sm-machine-title">🖥️ Computador B · 10.0.0.2</p>' +
        '    <div class="demo-sm-port" data-port="6789" data-bound="' + state.bound + '">' +
        "porta <strong>6789</strong> — " +
        (state.bound ? "soquete de S ✔ (UDP)" : "<em>sem soquete vinculado</em>") + "</div>" +
        '    <div class="demo-sm-proc">S <span>' +
        (state.bound ? "recebendo na 6789" : "ainda sem soquete") + "</span></div>" +
        '    <div class="demo-sm-proc">S2 <span data-binderr="' + state.bindErrSeen +
        '">outro processo do mesmo computador</span></div>' +
        '    <div class="demo-sm-inbox"><p>fila de mensagens de S:</p>' +
        '<ul data-inbox="' + state.inbox.length + '">' +
        (inboxItems || "<li><em>vazia</em></li>") + "</ul></div>" +
        "  </div>" +
        "</div>";
      els.controls.innerHTML =
        '<button type="button" class="btn btn-secondary demo-sm-send-c1"' +
        (state.busy1 ? " disabled" : "") + ">✉️ C1 → 10.0.0.2:6789</button>" +
        '<button type="button" class="btn btn-secondary demo-sm-send-c2"' +
        (state.busy1 ? " disabled" : "") + ">✉️ C2 → 10.0.0.2:6789</button>" +
        '<button type="button" class="btn demo-sm-bind">' +
        (state.bound ? "🔒 Fechar o soquete de S" : "🔌 Vincular soquete de S à porta 6789") +
        "</button>" +
        '<button type="button" class="btn btn-secondary demo-sm-bind2"' +
        (state.bound ? "" : " disabled") + ">🔌 Tentar vincular S2 à 6789</button>";
      els.controls.querySelector(".demo-sm-send-c1").addEventListener("click", function () { send1("C1"); });
      els.controls.querySelector(".demo-sm-send-c2").addEventListener("click", function () { send1("C2"); });
      els.controls.querySelector(".demo-sm-bind").addEventListener("click", function () {
        state.bound = !state.bound;
        log(state.bound
          ? "🔌 S criou um soquete UDP e o <strong>vinculou</strong> a (10.0.0.2, porta 6789). " +
            "Agora a porta tem exatamente UM destino — e pode ter muitos remetentes."
          : "🔒 S <strong>fechou</strong> o soquete — a porta 6789 voltou a ficar sem destino.");
        renderStage1();
        updateNav();
      });
      els.controls.querySelector(".demo-sm-bind2").addEventListener("click", function () {
        state.bindErrSeen = true;
        log("✗ <strong>Erro: endereço já em uso.</strong> S2 não pode vincular a porta 6789 — " +
          "processos do mesmo computador NÃO compartilham portas (a exceção é o multicast IP).");
        renderStage1();
      });
    }

    function send1(c) {
      if (state.busy1) return;
      state.busy1 = true;
      renderStage1();
      var srcPort = c === "C1" ? 41230 : 41231;
      log("✉️ " + c + " (10.0.0.1:" + srcPort + ") enviou para 10.0.0.2:6789 — o send " +
        "retornou na hora: para " + c + ", está tudo certo.");
      to(function () {
        if (!state.bound) {
          state.dropSeen = true;
          bump("dropped");
          log("🕳️ Na porta 6789 <strong>não há soquete vinculado</strong>: a mensagem foi " +
            "descartada <strong>em silêncio</strong>. " + c + " nunca ficará sabendo.");
        } else {
          bump("delivered");
          state["del" + c]++;
          state.msgN++;
          state.inbox.push({ n: state.msgN, from: "10.0.0.1:" + srcPort });
          log("📬 O soquete de S na porta 6789 recebeu a mensagem #" + state.msgN +
            " (o receive informa a origem: 10.0.0.1:" + srcPort + ").");
        }
        state.busy1 = false;
        if (state.stage === 1) renderStage1();
        updateNav();
      }, 800);
    }

    /* ============ Etapa 2 — Bloqueio (send/receive síncronos) ============ */

    var TRANSIT = 1600;
    var PROC_LABEL = { run: "executando", recv: "bloqueado em receive", send: "bloqueado em send" };

    function renderProcs() {
      var stat = els.area.querySelector("[data-exchanges]");
      ["a", "b"].forEach(function (p) {
        var card = els.area.querySelector('[data-proc2="' + p.toUpperCase() + '"]');
        if (!card) return;
        card.setAttribute("data-state", state.deadlock ? "dead" : state[p]);
        card.querySelector("[data-proc2-state]").textContent =
          state.deadlock ? "💀 em deadlock" : PROC_LABEL[state[p]];
      });
      if (stat) {
        stat.setAttribute("data-exchanges", state.exchanges);
        stat.setAttribute("data-deadlock", state.deadlockSeen);
        stat.setAttribute("data-timeout-lost", state.timeoutLost);
        stat.innerHTML = "trocas completas: <strong>" + state.exchanges + "</strong>" +
          (state.deadlock ? ' · <strong class="demo-sm-bad">DEADLOCK</strong>' : "");
      }
    }

    function renderStage2() {
      els.area.innerHTML =
        '<div class="demo-sm-world">' +
        '  <div class="demo-sm-machine demo-sm-proc2" data-proc2="A" data-state="run">' +
        '    <p class="demo-sm-machine-title">⚙️ Processo A</p>' +
        '    <p class="demo-sm-proc2-state" data-proc2-state>executando</p>' +
        "  </div>" +
        '  <div class="demo-sm-machine demo-sm-proc2" data-proc2="B" data-state="run">' +
        '    <p class="demo-sm-machine-title">⚙️ Processo B</p>' +
        '    <p class="demo-sm-proc2-state" data-proc2-state>executando</p>' +
        "  </div>" +
        "</div>" +
        '<p class="demo-sm-status" data-exchanges="0" data-deadlock="false" ' +
        'data-timeout-lost="false">trocas completas: <strong>0</strong></p>';
      renderControls2();
      renderProcs();
    }

    function renderControls2() {
      var locked = state.deadlock || state.expBusy;
      els.controls.innerHTML =
        '<button type="button" class="btn btn-secondary demo-sm-a-recv"' +
        (locked || state.a !== "run" ? " disabled" : "") + ">A: receive()</button>" +
        '<button type="button" class="btn btn-secondary demo-sm-a-send"' +
        (locked || state.a !== "run" ? " disabled" : "") + ">A: send(→ B)</button>" +
        '<button type="button" class="btn btn-secondary demo-sm-b-recv"' +
        (locked || state.b !== "run" ? " disabled" : "") + ">B: receive()</button>" +
        '<button type="button" class="btn btn-secondary demo-sm-b-send"' +
        (locked || state.b !== "run" ? " disabled" : "") + ">B: send(→ A)</button>" +
        '<button type="button" class="btn-ghost demo-sm-unblock">🔓 Desbloquear tudo</button>' +
        '<span class="demo-sm-exp">' +
        "  <label>timeout do receive: <select class=\"demo-sm-tmo\">" +
        '    <option value="500"' + (state.expTimeout === 500 ? " selected" : "") + ">0,5 s</option>" +
        '    <option value="5000"' + (state.expTimeout === 5000 ? " selected" : "") + ">5 s</option>" +
        "  </select></label>" +
        '  <button type="button" class="btn demo-sm-exp-run"' + (state.expBusy ? " disabled" : "") +
        ">🧪 Experimento: B envia (1,6 s de viagem), A recebe com timeout</button>" +
        "</span>";
      els.controls.querySelector(".demo-sm-a-recv").addEventListener("click", function () { act2("a", "recv"); });
      els.controls.querySelector(".demo-sm-a-send").addEventListener("click", function () { act2("a", "send"); });
      els.controls.querySelector(".demo-sm-b-recv").addEventListener("click", function () { act2("b", "recv"); });
      els.controls.querySelector(".demo-sm-b-send").addEventListener("click", function () { act2("b", "send"); });
      els.controls.querySelector(".demo-sm-unblock").addEventListener("click", function () {
        state.a = "run"; state.b = "run"; state.transit = null; state.deadlock = false;
        log("🔓 Troca reiniciada: A e B voltaram a executar.");
        renderControls2();
        renderProcs();
      });
      els.controls.querySelector(".demo-sm-tmo").addEventListener("change", function (ev) {
        state.expTimeout = parseInt(ev.target.value, 10);
      });
      els.controls.querySelector(".demo-sm-exp-run").addEventListener("click", runTimeoutExp);
    }

    function act2(p, op) {
      if (state.deadlock || state[p] !== "run") return;
      state[p] = op;
      var name = p.toUpperCase();
      log(op === "recv"
        ? "⏸️ <strong>" + name + "</strong> executou receive — comunicação síncrona: fica " +
          "<strong>bloqueado</strong> até a mensagem chegar."
        : "⏸️ <strong>" + name + "</strong> executou send — síncrono: fica <strong>bloqueado</strong> " +
          "até o receive correspondente do outro lado.");
      renderControls2();
      renderProcs();
      tryMatch2();
    }

    function tryMatch2() {
      if (state.transit) return;
      var sender = state.a === "send" ? "a" : (state.b === "send" ? "b" : null);
      var recvr = state.a === "recv" ? "a" : (state.b === "recv" ? "b" : null);
      if (sender && recvr && sender !== recvr) {
        var tr = { from: sender, to: recvr };
        state.transit = tr;
        log("📨 send e receive casaram: mensagem de " + sender.toUpperCase() + " para " +
          recvr.toUpperCase() + " em trânsito…");
        to(function () {
          if (state.transit !== tr) return; /* troca foi reiniciada no meio */
          state.transit = null;
          state[tr.from] = "run";
          state[tr.to] = "run";
          state.exchanges++;
          bump("delivered");
          log("✅ Entregue: " + tr.to.toUpperCase() + " recebeu e os DOIS desbloquearam — é a " +
            "sincronização a cada mensagem.");
          if (state.stage === 2) { renderControls2(); renderProcs(); }
          updateNav();
        }, TRANSIT);
        return;
      }
      /* dois bloqueados sem par possível → deadlock à vista */
      if (state.a !== "run" && state.b !== "run") {
        var snapshot = state.a + "/" + state.b;
        to(function () {
          if (state.stage !== 2) return;
          if (state.deadlock || state.transit) return;
          if (state.a + "/" + state.b !== snapshot) return;
          if (state.a === "run" || state.b === "run") return;
          state.deadlock = true;
          state.deadlockSeen = true;
          log("💀 <strong>Deadlock!</strong> " + (state.a === "recv"
            ? "A espera mensagem de B, e B espera mensagem de A — ninguém envia."
            : "A e B esperam um receive que nunca virá — ninguém recebe.") +
            " Sem timeout, ficariam assim para sempre. Desbloqueie e refaça: um deles " +
            "precisa ENVIAR primeiro.");
          renderControls2();
          renderProcs();
          updateNav();
        }, 1400);
      }
    }

    function runTimeoutExp() {
      if (state.expBusy) return;
      state.expBusy = true;
      renderControls2();
      var tmo = state.expTimeout;
      var arrived = false, gaveUp = false;
      log("🧪 Experimento (UDP): A executa receive com <strong>timeout de " +
        (tmo === 500 ? "0,5 s" : "5 s") + "</strong>; B envia — a mensagem leva 1,6 s.");
      to(function () {
        if (!arrived) {
          gaveUp = true;
          log("⏲️ Timeout! O receive de A <strong>desistiu</strong> antes de a mensagem chegar.");
        }
      }, tmo);
      to(function () {
        arrived = true;
        if (gaveUp) {
          bump("dropped");
          state.timeoutLost = true;
          log("📭 A mensagem chegou 1,6 s depois — e não havia mais ninguém esperando: perdida " +
            "para esta troca. Timeout curto demais desiste do que ESTAVA a caminho (o dilema " +
            "da demo do Tópico 1).");
        } else {
          bump("delivered");
          log("📬 A mensagem chegou dentro do prazo: recebida. Timeout longo cobre a viagem — " +
            "mas atrasa a detecção de falhas reais. Não existe valor perfeito.");
        }
        state.expBusy = false;
        if (state.stage === 2) { renderControls2(); renderProcs(); }
        updateNav();
      }, 1700);
    }

    /* ============ Etapa 3 — Empacotar (representação externa) ============ */

    function fmtName(f) {
      return { crus: "bytes crus", cdr: "CDR (binário + acordo IDL)", json: "JSON", xml: "XML" }[f];
    }

    function renderStage3() {
      var s = state.sizes;
      els.area.innerHTML =
        '<div class="demo-sm-world">' +
        '  <div class="demo-sm-machine">' +
        '    <p class="demo-sm-machine-title">💻 Máquina A <span class="demo-sm-arch">big-endian · ' +
        "Unicode (2 bytes/caractere)</span></p>" +
        '    <table class="demo-sm-struct"><caption>struct Person</caption>' +
        "<tr><td>name</td><td>“Smith”</td></tr>" +
        "<tr><td>place</td><td>“London”</td></tr>" +
        "<tr><td>year</td><td>1984</td></tr></table>" +
        "  </div>" +
        '  <div class="demo-sm-machine">' +
        '    <p class="demo-sm-machine-title">🖥️ Máquina B <span class="demo-sm-arch">little-endian · ' +
        "ASCII (1 byte/caractere)</span></p>" +
        '    <table class="demo-sm-struct" data-rx data-intact="" data-swapped="false">' +
        "<caption>recebido</caption>" +
        '<tr><td>name</td><td data-rx-name>—</td></tr>' +
        '<tr><td>place</td><td data-rx-place>—</td></tr>' +
        '<tr><td>year</td><td data-rx-year>—</td></tr></table>' +
        "  </div>" +
        "</div>" +
        '<pre class="demo-sm-bytes" data-bytes hidden></pre>' +
        '<p class="demo-sm-sizes">tamanho da mensagem — ' +
        'CDR: <strong data-size-cdr="' + s.cdr + '">' + (s.cdr || "—") + "</strong> bytes · " +
        'JSON: <strong data-size-json="' + s.json + '">' + (s.json || "—") + "</strong> bytes · " +
        'XML: <strong data-size-xml="' + s.xml + '">' + (s.xml || "—") + "</strong> bytes</p>";
      els.controls.innerHTML =
        '<label><input type="radio" name="demo-sm-fmt" value="crus"' +
        (state.fmt === "crus" ? " checked" : "") + "> bytes crus</label>" +
        '<label><input type="radio" name="demo-sm-fmt" value="cdr"' +
        (state.fmt === "cdr" ? " checked" : "") + "> CDR</label>" +
        '<label><input type="radio" name="demo-sm-fmt" value="json"' +
        (state.fmt === "json" ? " checked" : "") + "> JSON</label>" +
        '<label><input type="radio" name="demo-sm-fmt" value="xml"' +
        (state.fmt === "xml" ? " checked" : "") + "> XML</label>" +
        '<label class="demo-sm-mismatch"><input type="checkbox" class="demo-sm-mm"' +
        (state.mismatch ? " checked" : "") + "> as pontas discordam da ordem dos campos (CDR)</label>" +
        '<button type="button" class="btn demo-sm-send3"' + (state.busy3 ? " disabled" : "") +
        ">📦 Enviar Person A → B</button>";
      els.controls.querySelectorAll('[name="demo-sm-fmt"]').forEach(function (rb) {
        rb.addEventListener("change", function () { state.fmt = rb.value; });
      });
      els.controls.querySelector(".demo-sm-mm").addEventListener("change", function (ev) {
        state.mismatch = ev.target.checked;
      });
      els.controls.querySelector(".demo-sm-send3").addEventListener("click", send3);
    }

    function showRx(name, place, year, intact, swapped) {
      var rx = els.area.querySelector("[data-rx]");
      if (!rx) return;
      rx.setAttribute("data-intact", String(intact));
      rx.setAttribute("data-swapped", String(swapped));
      rx.classList.remove("is-bad", "is-ok");
      rx.classList.add(intact ? "is-ok" : "is-bad");
      els.area.querySelector("[data-rx-name]").textContent = name;
      els.area.querySelector("[data-rx-place]").textContent = place;
      els.area.querySelector("[data-rx-year]").textContent = year;
    }

    function showBytes(text) {
      var pre = els.area.querySelector("[data-bytes]");
      if (!pre) return;
      pre.hidden = false;
      pre.textContent = text;
    }

    function send3() {
      if (state.busy3) return;
      state.busy3 = true;
      renderStage3();
      var f = state.fmt;
      log("📦 A empacota a struct Person em <strong>" + fmtName(f) + "</strong> e envia…");
      to(function () {
        if (f === "crus") {
          state.rawSeen = true;
          showBytes("bytes de A (sem representação externa):\n00 00 07 C0  (year, na ordem de A)" +
            "\n00 53 00 6D 00 69 00 74 00 68  (“Smith” em Unicode de 2 bytes)");
          showRx("S□m□i□", "L□o□n□", YEAR_GARBLED, false, false);
          log("💥 B leu <strong>lixo</strong>: o inteiro 1984 virou <strong>" + YEAR_GARBLED +
            "</strong> (ordem de bytes trocada) e as strings ganharam caracteres nulos " +
            "(Unicode de 2 bytes lido como ASCII). Nenhum bit se corrompeu na viagem — as " +
            "MÁQUINAS é que discordam da representação.");
        } else if (f === "cdr") {
          showBytes("CDR (Fig. 4.8 do Coulouris) — " + CDR_SIZE + " bytes:\n" + CDR_BYTES);
          if (state.mismatch) {
            state.swappedSeen = true;
            showRx("London", "Smith", "1984", false, true);
            log("⚠️ Os bytes chegaram INTACTOS — mas B esperava os campos na ordem " +
              "<em>place, name, year</em>: leu name=“London” e place=“Smith”. O CDR não " +
              "carrega tipos nem nomes; <strong>violar o acordo (IDL) corrompe o " +
              "significado sem corromper um único byte</strong>.");
          } else {
            state.sizes.cdr = CDR_SIZE;
            bump("delivered");
            showRx("Smith", "London", "1984", true, false);
            log("✅ Íntegra em <strong>" + CDR_SIZE + " bytes</strong> — compacto porque a " +
              "mensagem só carrega VALORES: a ordem e os tipos vêm do acordo prévio (IDL) " +
              "das duas pontas.");
          }
        } else {
          var txt = f === "json" ? JSON_TXT : XML_TXT;
          state.sizes[f] = txt.length;
          showBytes(f.toUpperCase() + " — " + txt.length + " bytes:\n" + txt);
          bump("delivered");
          showRx("Smith", "London", "1984", true, false);
          log("✅ Íntegra em <strong>" + txt.length + " bytes</strong> — " +
            (state.mismatch ? "e a ordem dos campos NEM IMPORTA: " : "") + "o formato é " +
            "<strong>autodescritivo</strong> (cada valor viaja rotulado), por isso é maior " +
            "que o CDR.");
        }
        if (state.sizes.cdr && state.sizes.json && state.sizes.xml) {
          log("📏 Compare: CDR " + state.sizes.cdr + " × JSON " + state.sizes.json + " × XML " +
            state.sizes.xml + " bytes — o preço da autodescrição. (Buffers de protocolo e " +
            "afins buscam o meio-termo: binário compacto COM esquema.)");
        }
        state.busy3 = false;
        if (state.stage === 3) refreshStage3();
        updateNav();
      }, 900);
    }

    /* atualiza tamanhos e reabilita o botão SEM re-renderizar a área
       (o resultado visível — bytes e struct recebida — permanece na tela) */
    function refreshStage3() {
      var sizesEl = els.area.querySelector(".demo-sm-sizes");
      if (sizesEl) {
        sizesEl.innerHTML = "tamanho da mensagem — " +
          'CDR: <strong data-size-cdr="' + state.sizes.cdr + '">' + (state.sizes.cdr || "—") +
          "</strong> bytes · " +
          'JSON: <strong data-size-json="' + state.sizes.json + '">' + (state.sizes.json || "—") +
          "</strong> bytes · " +
          'XML: <strong data-size-xml="' + state.sizes.xml + '">' + (state.sizes.xml || "—") +
          "</strong> bytes";
      }
      var btn = els.controls.querySelector(".demo-sm-send3");
      if (btn) btn.disabled = false;
    }

    /* ============ Etapa 4 — A requisição duplicada ============ */

    function bankUpdate() {
      var saldoEl = els.area.querySelector("[data-saldo]");
      if (!saldoEl) return;
      saldoEl.textContent = state.saldo;
      els.area.querySelector("[data-esperado]").textContent = state.esperado;
      els.area.querySelector("[data-execs]").textContent = state.execs;
      var div = els.area.querySelector("[data-diverge]");
      var ok = state.saldo === state.esperado;
      div.textContent = ok ? "✓ saldo confere" : "✗ DIVERGIU (R$ " +
        Math.abs(state.esperado - state.saldo) + " a " +
        (state.saldo < state.esperado ? "menos" : "mais") + ")";
      div.className = "demo-sm-diverge " + (ok ? "is-ok" : "is-bad");
      var stat = els.area.querySelector("[data-double-seen]");
      stat.setAttribute("data-double-seen", state.doubleSeen);
      stat.setAttribute("data-filter-fix", state.filterFixSeen);
    }

    function renderStage4() {
      els.area.innerHTML =
        '<div class="demo-sm-world">' +
        '  <div class="demo-sm-machine">' +
        '    <p class="demo-sm-machine-title">💻 Cliente</p>' +
        '    <p class="demo-sm-note">última resposta: <strong data-client-view>—</strong></p>' +
        "  </div>" +
        '  <div class="demo-sm-machine">' +
        '    <p class="demo-sm-machine-title">🏦 Banco (servidor)</p>' +
        '    <p class="demo-sm-big">saldo: R$ <strong data-saldo>' + state.saldo + "</strong></p>" +
        '    <p class="demo-sm-note">débitos executados: <strong data-execs>' + state.execs +
        "</strong> · filtro de duplicatas: <strong data-filter>" +
        (state.filterOn ? "LIGADO" : "desligado") + "</strong></p>" +
        "  </div>" +
        "</div>" +
        '<p class="demo-sm-status" data-double-seen="' + state.doubleSeen +
        '" data-filter-fix="' + state.filterFixSeen + '">se nada se perdesse, o saldo seria ' +
        "R$ <strong data-esperado>" + state.esperado + "</strong> — " +
        '<span class="demo-sm-diverge" data-diverge></span></p>' +
        '<p class="demo-sm-note">E com TCP? A duplicata some — mas se a CONEXÃO cair depois do ' +
        "envio, o cliente continua sem saber se o débito aconteceu. A incerteza muda de lugar, " +
        "não desaparece.</p>";
      els.controls.innerHTML =
        '<button type="button" class="btn btn-secondary demo-sm-consulta"' +
        (state.busy4 ? " disabled" : "") + ">🔍 Consultar saldo</button>" +
        '<button type="button" class="btn demo-sm-debito"' +
        (state.busy4 ? " disabled" : "") + ">💸 Debitar R$ 10</button>" +
        '<label class="demo-sm-filterlabel"><input type="checkbox" class="demo-sm-filter"' +
        (state.filterOn ? " checked" : "") + (state.busy4 ? " disabled" : "") +
        "> filtro de duplicatas (id + histórico)</label>" +
        '<button type="button" class="btn-ghost demo-sm-reopen"' +
        (state.busy4 ? " disabled" : "") + ">↺ Reabrir conta (R$ 100)</button>";
      els.controls.querySelector(".demo-sm-consulta").addEventListener("click", function () { op4("consulta"); });
      els.controls.querySelector(".demo-sm-debito").addEventListener("click", function () { op4("debito"); });
      els.controls.querySelector(".demo-sm-filter").addEventListener("change", function (ev) {
        state.filterOn = ev.target.checked;
        log(state.filterOn
          ? "🛡️ Filtro LIGADO: cada requisição leva um id; o servidor guarda as respostas e " +
            "reconhece reenvios (semântica <strong>at-most-once</strong>)."
          : "🚫 Filtro desligado: reenvio será tratado como requisição nova " +
            "(<strong>at-least-once</strong>).");
        var f = els.area.querySelector("[data-filter]");
        if (f) f.textContent = state.filterOn ? "LIGADO" : "desligado";
      });
      els.controls.querySelector(".demo-sm-reopen").addEventListener("click", function () {
        state.saldo = 100; state.esperado = 100; state.execs = 0; state.history = {};
        log("↺ Conta reaberta: saldo R$ 100 (o histórico do filtro foi limpo).");
        bankUpdate();
        var cv = els.area.querySelector("[data-client-view]");
        if (cv) cv.textContent = "—";
      });
      bankUpdate();
    }

    function serverExec(kind, id, isRetx) {
      if (isRetx) bump("dups"); /* o reenvio chega como mensagem duplicada no servidor */
      if (state.filterOn && state.history[id] !== undefined) {
        log("🛡️ O servidor reconheceu a requisição #" + id + " no histórico: <strong>reenviou a " +
          "resposta guardada SEM reexecutar</strong>.");
        return state.history[id];
      }
      var resp;
      if (kind === "debito") {
        state.saldo -= 10;
        state.execs++;
        resp = "débito OK · saldo R$ " + state.saldo;
        log("🏦 Servidor executou o débito #" + id + (isRetx ? " <strong>DE NOVO</strong>" : "") +
          ": saldo agora R$ " + state.saldo + ".");
        if (isRetx && !state.filterOn) {
          state.doubleSeen = true;
          log("💥 A MESMA operação executou <strong>duas vezes</strong> — a retransmissão virou " +
            "requisição nova. Débito não é idempotente: o saldo divergiu.");
        }
      } else {
        resp = "saldo R$ " + state.saldo;
        if (isRetx) {
          log("🔁 Consulta #" + id + " reexecutada — <strong>idempotente</strong>: ler duas vezes " +
            "não muda nada.");
        }
      }
      if (state.filterOn) state.history[id] = resp;
      bankUpdate();
      return resp;
    }

    function op4(kind) {
      if (state.busy4) return;
      state.busy4 = true;
      renderStage4();
      state.opSeq++;
      var id = state.opSeq;
      var execsBefore = state.execs;
      if (kind === "debito") state.esperado -= 10;
      bankUpdate();
      /* cenas roteirizadas primeiro (didática garantida); depois, sorteio */
      var lossLeg = null;
      if (kind === "debito" && !state.filterOn && !state.firstDebNoF) {
        lossLeg = "resp"; state.firstDebNoF = true;
      } else if (kind === "debito" && state.filterOn && !state.firstDebF) {
        lossLeg = "resp"; state.firstDebF = true;
      } else if (kind === "consulta" && !state.firstCon) {
        lossLeg = "resp"; state.firstCon = true;
      } else {
        var r = rand();
        lossLeg = r < 0.18 ? "req" : (r < 0.4 ? "resp" : null);
      }
      runRequest4(kind, id, lossLeg, execsBefore);
    }

    function runRequest4(kind, id, lossLeg, execsBefore) {
      var t = 0;
      var label = kind === "debito" ? "débito de R$ 10" : "consulta de saldo";
      log("✉️ Requisição #" + id + " (" + label + ") enviada por UDP.");
      if (lossLeg === "req") {
        to(function () {
          bump("dropped");
          log("💥 A <strong>requisição</strong> #" + id + " se perdeu no caminho — o servidor " +
            "nem ficou sabendo.");
        }, (t += 700));
        to(function () {
          bump("retx");
          log("⏲️ Sem resposta no prazo → o cliente <strong>retransmite</strong> #" + id + ".");
        }, (t += 900));
        to(function () {
          var resp = serverExec(kind, id, false);
          finishOp4(kind, resp, false, execsBefore);
        }, (t += 700));
        return;
      }
      to(function () {
        serverExec(kind, id, false);
      }, (t += 700));
      if (lossLeg === "resp") {
        to(function () {
          bump("dropped");
          log("💥 A <strong>resposta</strong> de #" + id + " se perdeu — o cliente não sabe que " +
            "a operação JÁ foi executada.");
        }, (t += 500));
        to(function () {
          bump("retx");
          log("⏲️ Timeout no cliente → <strong>retransmite</strong> a requisição #" + id + ".");
        }, (t += 900));
        to(function () {
          var resp = serverExec(kind, id, true);
          finishOp4(kind, resp, true, execsBefore);
        }, (t += 700));
      } else {
        to(function () {
          finishOp4(kind, kind === "debito" ? "débito OK · saldo R$ " + state.saldo :
            "saldo R$ " + state.saldo, false, execsBefore);
        }, (t += 500));
      }
    }

    function finishOp4(kind, resp, wasRetx, execsBefore) {
      bump("delivered");
      log("📬 Resposta chegou ao cliente: <strong>" + resp + "</strong>.");
      if (wasRetx && state.filterOn && kind === "debito" &&
          state.execs - execsBefore === 1) {
        state.filterFixSeen = true;
        log("✅ Perda + reenvio COM filtro: o débito executou UMA vez só — o reenvio foi " +
          "reconhecido, não reexecutado. É a semântica <strong>at-most-once</strong>.");
      }
      state.busy4 = false;
      if (state.stage === 4) {
        renderStage4(); /* re-render primeiro; a resposta visível vem depois */
        var cv = els.area.querySelector("[data-client-view]");
        if (cv) cv.textContent = resp;
      }
      updateNav();
    }

    /* ============ Etapa 5 — Multicast para as réplicas ============ */

    function allEqual5() {
      return state.reps[0] === state.reps[1] && state.reps[1] === state.reps[2];
    }

    function repsUpdate() {
      state.reps.forEach(function (v, i) {
        var el = els.area.querySelector('[data-rep="' + (i + 1) + '"]');
        if (el) el.textContent = v;
      });
      var stat = els.area.querySelector("[data-repstatus]");
      if (stat) {
        var eq = allEqual5();
        stat.textContent = eq ? "✓ réplicas iguais" : "✗ réplicas DIVERGENTES";
        stat.className = "demo-sm-diverge " + (eq ? "is-ok" : "is-bad");
        stat.setAttribute("data-div-loss", state.divLoss);
        stat.setAttribute("data-div-order", state.divOrder);
        stat.setAttribute("data-converged5", state.convergedSeen);
      }
    }

    function renderStage5() {
      var cards = state.reps.map(function (v, i) {
        return '<div class="demo-sm-machine demo-sm-rep">' +
          '<p class="demo-sm-machine-title">🗄️ Réplica R' + (i + 1) + "</p>" +
          '<p class="demo-sm-big">valor: <strong data-rep="' + (i + 1) + '">' + v +
          "</strong></p></div>";
      }).join("");
      els.area.innerHTML =
        '<div class="demo-sm-world">' + cards + "</div>" +
        '<p class="demo-sm-status demo-sm-diverge" data-repstatus data-div-loss="' +
        state.divLoss + '" data-div-order="' + state.divOrder + '" data-converged5="' +
        state.convergedSeen + '"></p>';
      els.controls.innerHTML =
        '<button type="button" class="btn demo-sm-mc1"' + (state.busy5 ? " disabled" : "") +
        ">📢 Multicast: +10 (uma origem)</button>" +
        '<button type="button" class="btn demo-sm-mc2"' + (state.busy5 ? " disabled" : "") +
        ">📢📢 Duas origens: +10 e ×2</button>" +
        '<label class="demo-sm-filterlabel"><input type="checkbox" class="demo-sm-rel"' +
        (state.reliable ? " checked" : "") +
        "> multicast confiável + totalmente ordenado (caixa-preta — Tópico 10)</label>" +
        '<button type="button" class="btn-ghost demo-sm-rreset">↺ Reiniciar réplicas (valor 10)' +
        "</button>";
      els.controls.querySelector(".demo-sm-mc1").addEventListener("click", mc1);
      els.controls.querySelector(".demo-sm-mc2").addEventListener("click", mc2);
      els.controls.querySelector(".demo-sm-rel").addEventListener("change", function (ev) {
        state.reliable = ev.target.checked;
        log(state.reliable
          ? "🛡️ Garantias LIGADAS: entrega tudo-ou-nada e mesma ordem em todos os membros " +
            "(como se constrói isso é assunto do Tópico 10)."
          : "🚫 De volta ao multicast IP puro: omissão possível, ordem não garantida.");
      });
      els.controls.querySelector(".demo-sm-rreset").addEventListener("click", function () {
        state.reps = [10, 10, 10];
        log("↺ Réplicas reiniciadas: todas com valor 10.");
        repsUpdate();
      });
      repsUpdate();
    }

    function mc1() {
      if (state.busy5) return;
      state.busy5 = true;
      renderStage5();
      log("📢 Coordenador envia <strong>+10</strong> por multicast para R1, R2 e R3…");
      to(function () {
        if (state.reliable) {
          state.reps = state.reps.map(function (v) { return v + 10; });
          bump("delivered");
          log("✅ Entrega tudo-ou-nada: as TRÊS réplicas aplicaram +10.");
        } else {
          var miss = 1 + Math.floor(rand() * 3);
          state.reps = state.reps.map(function (v, i) { return i + 1 === miss ? v : v + 10; });
          bump("dropped");
          log("💥 Falha por omissão: <strong>R" + miss + " não recebeu</strong> a atualização " +
            "(buffer cheio) — as outras aplicaram. Alguns recebem, outros não: é o modelo de " +
            "falhas do multicast IP.");
          if (!allEqual5()) state.divLoss = true;
        }
        if (state.reliable && allEqual5()) state.convergedSeen = true;
        state.busy5 = false;
        if (state.stage === 5) renderStage5();
        updateNav();
      }, 900);
    }

    function mc2() {
      if (state.busy5) return;
      state.busy5 = true;
      renderStage5();
      log("📢📢 Duas origens enviam ao MESMO tempo: origem 1 manda <strong>+10</strong>, " +
        "origem 2 manda <strong>×2</strong>…");
      to(function () {
        if (state.reliable) {
          state.reps = state.reps.map(function (v) { return (v + 10) * 2; });
          bump("delivered");
          log("✅ Ordem TOTAL: todos entregaram +10 antes de ×2 — as réplicas aplicaram a mesma " +
            "sequência e continuam iguais.");
        } else {
          var flip = 1 + Math.floor(rand() * 3);
          state.reps = state.reps.map(function (v, i) {
            return i + 1 === flip ? v * 2 + 10 : (v + 10) * 2;
          });
          bump("delivered");
          log("💥 Sem perda nenhuma — mas <strong>R" + flip + " recebeu ×2 antes de +10</strong> " +
            "e as outras, o contrário. Ordens diferentes, estados diferentes: réplicas divergem " +
            "SEM perder uma única mensagem.");
          if (!allEqual5()) state.divOrder = true;
        }
        if (state.reliable && allEqual5()) state.convergedSeen = true;
        state.busy5 = false;
        if (state.stage === 5) renderStage5();
        updateNav();
      }, 900);
    }

    /* ============ Etapas ============ */

    var STAGES = [
      {
        title: "Etapa 1 — Caixas postais (portas e soquetes)",
        instructions: "O servidor S deveria atender em 10.0.0.2:6789 — mas ninguém vinculou o " +
          "soquete ainda. Envie uma mensagem ANTES de vincular; depois vincule, envie dos dois " +
          "clientes e tente vincular S2 à mesma porta.",
        goalText: "Meta: 1 mensagem descartada em silêncio + soquete vinculado + entregas de C1 e C2.",
        setup: function () { state.busy1 = false; },
        render: renderStage1,
        goalMet: function () {
          return state.dropSeen && state.bound && state.delC1 > 0 && state.delC2 > 0;
        }
      },
      {
        title: "Etapa 2 — Bloqueio (send e receive síncronos)",
        instructions: "Você decide a ordem das operações de A e B. Comece com os DOIS em receive " +
          "e veja no que dá; desbloqueie e complete uma troca. Depois rode o experimento do " +
          "timeout com 0,5 s.",
        goalText: "Meta: provocar um deadlock, completar 1 troca e ver um timeout desistir cedo demais.",
        setup: function () {
          state.transit = null; state.deadlock = false;
          state.a = "run"; state.b = "run"; state.expBusy = false;
        },
        render: renderStage2,
        goalMet: function () {
          return state.deadlockSeen && state.exchanges >= 1 && state.timeoutLost;
        }
      },
      {
        title: "Etapa 3 — Empacotar (representação externa de dados)",
        instructions: "A máquina A (big-endian, Unicode) envia a struct Person à máquina B " +
          "(little-endian, ASCII). Envie primeiro em bytes crus; depois compare CDR, JSON e XML " +
          "— e experimente violar o acordo de ordem do CDR.",
        goalText: "Meta: ver os bytes crus chegarem adulterados e entregar a struct íntegra em " +
          "CDR, JSON e XML.",
        setup: function () { state.busy3 = false; },
        render: renderStage3,
        goalMet: function () {
          return state.rawSeen && state.sizes.cdr > 0 && state.sizes.json > 0 &&
            state.sizes.xml > 0;
        }
      },
      {
        title: "Etapa 4 — A requisição duplicada",
        instructions: "Requisição-resposta sobre UDP: respostas se perdem e o cliente retransmite " +
          "por timeout. Faça um débito SEM o filtro e observe o saldo; depois ligue o filtro de " +
          "duplicatas e debite de novo.",
        goalText: "Meta: ver um débito executar DUAS vezes — e depois um reenvio com filtro " +
          "manter o saldo certo.",
        setup: function () { state.busy4 = false; },
        render: renderStage4,
        goalMet: function () { return state.doubleSeen && state.filterFixSeen; }
      },
      {
        title: "Etapa 5 — Multicast para as réplicas",
        instructions: "Três réplicas guardam o mesmo valor. Com multicast IP, veja a omissão e a " +
          "ordem quebrarem a igualdade; depois reinicie as réplicas, ligue as garantias e repita " +
          "as duas jogadas.",
        goalText: "Meta: divergir por omissão, divergir por ordem e convergir com as garantias " +
          "ligadas.",
        setup: function () { state.busy5 = false; },
        render: renderStage5,
        goalMet: function () {
          return state.divLoss && state.divOrder && state.convergedSeen;
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
