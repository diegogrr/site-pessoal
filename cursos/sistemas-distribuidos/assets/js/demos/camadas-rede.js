/* ============================================================
   demos/camadas-rede.js — Demo "A Viagem do Pacote"
   ------------------------------------------------------------
   Demonstração interativa do Tópico 3 (seção Conceitos básicos):
   o aluno empacota uma mensagem camada por camada, entrega na
   Ethernet local via ARP, decide o próximo salto nos roteadores
   com tabelas reais (inter-rede da Fig. 3.7/3.8 do Coulouris),
   vê a rede reconvergir após a queda de um enlace (vetor de
   distância) e compara UDP × TCP sobre a entrega "de melhor
   esforço" do IP (perda, desordem, duplicata).
   Plano e fundamentação:
   docs/demos/2026-07-15-demo-camadas-rede-plano.md

   A inter-rede é pequena e didática; a simulação é determinística
   — a única aleatoriedade é o sorteio (etapa 5) de qual fragmento
   se perde e qual chega duplicado: ?demo-seed=<int> fixa o PRNG
   (mulberry32); ?demo-fast=1 acelera as animações.
   Namespace: SD.demos["camadas-rede"]
   ============================================================ */

window.SD = window.SD || {};
SD.demos = SD.demos || {};

SD.demos["camadas-rede"] = (function () {
  "use strict";

  var INFC = 99; // custo "infinito" do vetor de distância

  /* ---- Topologia (Figs. 3.7/3.8 do Coulouris) ---- */
  var LINKS = { 1: ["A", "B"], 2: ["B", "C"], 3: ["A", "D"], 4: ["B", "E"], 5: ["C", "E"], 6: ["D", "E"] };
  var NODE_POS = { A: [60, 62], B: [160, 34], C: [262, 62], D: [60, 148], E: [160, 148] };
  var NODE_LINKS = { A: [1, 3], B: [1, 2, 4], C: [2, 5], D: [3, 6], E: [4, 5, 6] };
  /* Tabelas de roteamento completas (Fig. 3.8) + rota padrão (gateway em E) */
  var TABLES = {
    A: { A: "local", B: { l: 1, c: 1 }, C: { l: 1, c: 2 }, D: { l: 3, c: 1 }, E: { l: 1, c: 2 }, DEF: { l: 1 } },
    B: { A: { l: 1, c: 1 }, B: "local", C: { l: 2, c: 1 }, D: { l: 1, c: 2 }, E: { l: 4, c: 1 }, DEF: { l: 4 } },
    C: { A: { l: 2, c: 2 }, B: { l: 2, c: 1 }, C: "local", D: { l: 5, c: 2 }, E: { l: 5, c: 1 }, DEF: { l: 5 } },
    D: { A: { l: 3, c: 1 }, B: { l: 3, c: 2 }, C: { l: 6, c: 2 }, D: "local", E: { l: 6, c: 1 }, DEF: { l: 6 } },
    E: { A: { l: 4, c: 2 }, B: { l: 4, c: 1 }, C: { l: 5, c: 1 }, D: { l: 6, c: 1 }, E: "local", DEF: "gateway" }
  };
  var DEST_LABEL = {
    A: "rede 10.1 (em A)", B: "rede em B", C: "rede 10.5 (em C)", D: "rede em D",
    E: "rede em E", DEF: "padrão (default)"
  };

  function viaLink(node, link) {
    var ends = LINKS[link];
    return ends[0] === node ? ends[1] : ends[0];
  }

  /* ---- Etapa 1: camadas do encapsulamento ---- */
  var LAYERS = [
    { id: "msg", order: 0, label: "Mensagem da aplicação", desc: "GET /index.html (HTTP)",
      why: "tudo começa com a mensagem que a aplicação quer enviar" },
    { id: "tcp", order: 1, label: "Cabeçalho TCP", desc: "porta 80 · nº de sequência",
      why: "o TCP embrulha a mensagem e a endereça a um PROCESSO (porta 80)" },
    { id: "ip", order: 2, label: "Cabeçalho IP", desc: "10.1.0.5 → 10.5.0.80",
      why: "o IP embrulha o segmento e o endereça a um COMPUTADOR da inter-rede" },
    { id: "eth", order: 3, label: "Quadro Ethernet", desc: "MAC 02:A1 → MAC do roteador A",
      why: "a rede física embrulha o datagrama para o PRÓXIMO SALTO apenas" }
  ];

  /* ---- Etapa 2: estações da Ethernet local ---- */
  var STATIONS = [
    { name: "cliente", ip: "10.1.0.5", mac: "02:A1" },
    { name: "vizinho", ip: "10.1.0.6", mac: "02:B7" },
    { name: "arquivos", ip: "10.1.0.7", mac: "02:C3" }
  ];

  /* ---- Etapa 3: rodadas do "seja o roteador" ---- */
  var ROUNDS = [
    { dest: "C", start: "A", label: "Pacote 1 — destino: rede 10.5, do servidor web (ligada a C)" },
    { dest: "D", start: "C", label: "Pacote 2 — destino: rede ligada a D" },
    { dest: "DEF", start: "A", label: "Pacote 3 — destino: 203.0.113.9 (Internet — não está na tabela!)" }
  ];

  /* ---- Etapa 5: mensagem fragmentada ---- */
  var FRAGS = ["A RE", "DE É", " CONFI", "ÁVEL."];
  var FULL_MSG = FRAGS.join("");

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
      delivered: 0, lost: 0, dups: 0, hops: 0,
      /* etapa 1 */ wrapped: [],
      /* etapa 2 */ sends: 0, arpCached: false, busy: false,
      /* etapa 3 */ roundIdx: 0, packetAt: null, delivered3: 0,
      /* etapa 4 */ linkDown: false, vectors: null, rounds: 0, converged: true,
                    deliveredAfterConv: false,
      /* etapa 5 */ lostFrag: 0, dupFrag: 0, mode: "udp", sentUdp: false,
                    sentTcp: false, tcpIntact: false
    };

    function to(fn, ms) {
      setTimeout(function () { if (container.isConnected) fn(); }, ms * timeScale);
    }

    /* ============ Estrutura da interface ============ */

    container.innerHTML =
      '<div class="demo-cf demo-cr">' +
      '  <div class="demo-cf-head">' +
      '    <span class="badge demo-cf-badge">Demonstração</span>' +
      '    <p class="demo-cf-title"></p>' +
      '    <p class="demo-cf-instructions"></p>' +
      '    <p class="demo-cf-goal"></p>' +
      '  </div>' +
      '  <div class="demo-cr-stage-area"></div>' +
      '  <div class="demo-cf-controls demo-cr-controls"></div>' +
      '  <dl class="demo-cf-metrics">' +
      '    <div><dt>Saltos (pacote atual)</dt><dd data-metric="hops">0</dd></div>' +
      '    <div><dt>Entregues</dt><dd data-metric="delivered">0</dd></div>' +
      '    <div><dt>Perdidos/descartados</dt><dd data-metric="lost">0</dd></div>' +
      '    <div><dt>Duplicatas</dt><dd data-metric="dups">0</dd></div>' +
      '  </dl>' +
      '  <div class="demo-cf-summary callout" hidden>' +
      '    <p class="callout-title">🎓 O que você acabou de viver</p>' +
      '    <p><strong>Encapsulamento</strong> é mecânico e tem direção: cada camada embrulha a de ' +
      'cima e rotula o conteúdo. Na rede local não há roteamento — <strong>ARP</strong> + broadcast ' +
      'resolvem. Entre redes, cada roteador decide sozinho o <strong>próximo salto</strong> com uma ' +
      'tabela parcial (e <strong>rotas default</strong> cobrem o resto). Quando um enlace cai, o ' +
      '<strong>vetor de distância</strong> reconverge trocando tabelas — errando no meio do caminho. ' +
      'E como o IP entrega "no <strong>melhor esforço</strong>" (perda, desordem, duplicata), a ' +
      'confiabilidade é construída <strong>nas pontas</strong>: sequenciamento, confirmação e ' +
      'retransmissão do <strong>TCP</strong>. É o princípio fim-a-fim em ação — e o porão da demo ' +
      'do Tópico 1.</p>' +
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
      area: container.querySelector(".demo-cr-stage-area"),
      controls: container.querySelector(".demo-cr-controls"),
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
      var el = els.metrics.querySelector('[data-metric="' + name + '"]');
      el.textContent = value;
    }

    function bump(name) { state[name]++; metric(name, state[name]); }

    /* ============ SVG da inter-rede (etapas 3–5) ============ */

    function linkClass(l) {
      return "demo-cr-link" + (state.linkDown && l === 2 ? " is-down" : "");
    }

    function renderSvg(opts) {
      opts = opts || {};
      var html = '<svg class="demo-cr-svg" viewBox="0 0 320 190" role="img" ' +
        'aria-label="Inter-rede com roteadores A a E">';
      Object.keys(LINKS).forEach(function (l) {
        var p1 = NODE_POS[LINKS[l][0]], p2 = NODE_POS[LINKS[l][1]];
        html += '<line data-link="' + l + '" class="' + linkClass(+l) + '" x1="' + p1[0] +
          '" y1="' + p1[1] + '" x2="' + p2[0] + '" y2="' + p2[1] + '"></line>' +
          '<text class="demo-cr-linklabel" x="' + ((p1[0] + p2[0]) / 2 + 5) + '" y="' +
          ((p1[1] + p2[1]) / 2 - 4) + '">' + l + "</text>";
      });
      /* redes das pontas + Internet */
      html += '<rect class="demo-cr-lan" x="4" y="18" width="44" height="26" rx="4"></rect>' +
        '<text class="demo-cr-lanlabel" x="26" y="34">rede 10.1</text>' +
        '<line class="demo-cr-link is-stub" x1="26" y1="44" x2="60" y2="62"></line>' +
        '<rect class="demo-cr-lan" x="272" y="18" width="44" height="26" rx="4"></rect>' +
        '<text class="demo-cr-lanlabel" x="294" y="34">rede 10.5</text>' +
        '<line class="demo-cr-link is-stub" x1="294" y1="44" x2="262" y2="62"></line>' +
        '<text class="demo-cr-cloud" x="228" y="176">☁ Internet</text>' +
        '<line class="demo-cr-link is-stub" x1="160" y1="148" x2="212" y2="168"></line>';
      Object.keys(NODE_POS).forEach(function (n) {
        var p = NODE_POS[n];
        html += '<circle data-node="' + n + '" class="demo-cr-node' +
          (opts.at === n ? " is-here" : "") + '" cx="' + p[0] + '" cy="' + p[1] +
          '" r="13"></circle>' +
          '<text class="demo-cr-nodelabel" x="' + p[0] + '" y="' + (p[1] + 4) + '">' + n + "</text>";
      });
      if (opts.at) {
        var pp = NODE_POS[opts.at];
        html += '<circle class="demo-cr-packet" data-at="' + opts.at + '" cx="' + pp[0] +
          '" cy="' + (pp[1] - 20) + '" r="5"></circle>';
      }
      html += "</svg>";
      return html;
    }

    /* ============ Etapa 1 — Empacotar ============ */

    function renderStage1() {
      var buttons = LAYERS.slice().reverse().map(function (l) {
        var used = state.wrapped.indexOf(l.id) !== -1;
        return '<button type="button" class="btn btn-secondary demo-cr-layerbtn" data-layer="' +
          l.id + '"' + (used ? " disabled" : "") + "><strong>" + l.label +
          "</strong><span>" + l.desc + "</span></button>";
      }).join("");
      var envelope = '<p class="demo-cr-envelope-hint">— clique nas camadas na ordem certa —</p>';
      if (state.wrapped.length) {
        envelope = "";
        /* aninha do mais externo (último aplicado) para o mais interno */
        state.wrapped.slice().reverse().forEach(function (id) {
          var l = LAYERS.filter(function (x) { return x.id === id; })[0];
          envelope += '<div class="demo-cr-env demo-cr-env-' + id + '" data-env="' + id +
            '"><span class="demo-cr-env-label">' + l.label + " · " + l.desc + "</span>";
        });
        state.wrapped.forEach(function () { envelope += "</div>"; });
      }
      els.area.innerHTML =
        '<div class="demo-cr-pack">' +
        '  <div class="demo-cr-layers">' + buttons + "</div>" +
        '  <div class="demo-cr-envelope" data-wrapped="' + state.wrapped.length + '">' +
        envelope + "</div></div>";
      els.area.querySelectorAll(".demo-cr-layerbtn").forEach(function (btn) {
        btn.addEventListener("click", function () {
          var layer = LAYERS.filter(function (x) { return x.id === btn.getAttribute("data-layer"); })[0];
          if (layer.order === state.wrapped.length) {
            state.wrapped.push(layer.id);
            log("✓ <strong>" + layer.label + "</strong> — " + layer.why + ".");
            if (state.wrapped.length === LAYERS.length) {
              log("📦 Quadro completo: envelope dentro de envelope, pronto para a rede física.");
            }
            renderStage1();
            updateNav();
          } else if (layer.order < state.wrapped.length) {
            log("⚠️ " + layer.label + " já foi aplicada — siga para a camada de fora.");
          } else {
            var expected = LAYERS[state.wrapped.length];
            log("✗ Ainda não: <strong>" + layer.label + "</strong> embrulha o que vem de cima — " +
              "e ainda falta <strong>" + expected.label + "</strong>.");
            var env = els.area.querySelector(".demo-cr-envelope");
            env.classList.remove("is-shake");
            void env.offsetWidth;
            env.classList.add("is-shake");
          }
        });
      });
    }

    /* ============ Etapa 2 — Entrega local (ARP) ============ */

    function renderStage2() {
      var cards = STATIONS.map(function (s) {
        return '<div class="demo-cr-station" data-station="' + s.ip + '">' +
          '<span class="demo-cr-station-icon">🖥️</span>' +
          "<strong>" + s.name + "</strong><span>" + s.ip + "</span>" +
          '<span class="demo-cr-station-mac">MAC ' + s.mac + "</span>" +
          '<span class="demo-cr-station-note" data-note></span></div>';
      }).join("");
      els.area.innerHTML =
        '<div class="demo-cr-lanview"><p class="demo-cr-lanview-title">Ethernet local — ' +
        "rede 10.1 (um único segmento; sem roteamento)</p>" +
        '<div class="demo-cr-stations">' + cards + "</div>" +
        '<p class="demo-cr-arpcache" data-cached="' + state.arpCached + '">cache ARP do cliente: ' +
        (state.arpCached ? "<code>10.1.0.7 ⇒ 02:C3</code>" : "<em>vazio</em>") + "</p></div>";
      els.controls.innerHTML =
        '<button type="button" class="btn demo-cr-send2"' + (state.busy ? " disabled" : "") +
        ">✉️ Enviar arquivo para 10.1.0.7</button>" +
        '<span class="demo-cr-sends">envios concluídos: <strong>' + state.sends + "</strong></span>";
      els.controls.querySelector(".demo-cr-send2").addEventListener("click", sendLocal);
    }

    function stationNote(ip, text, cls) {
      var st = els.area.querySelector('[data-station="' + ip + '"]');
      if (!st) return;
      st.querySelector("[data-note]").textContent = text;
      st.classList.remove("is-flash", "is-target");
      if (cls) { void st.offsetWidth; st.classList.add(cls); }
    }

    function sendLocal() {
      if (state.busy) return;
      state.busy = true;
      renderStage2();
      var t = 0;
      if (!state.arpCached) {
        to(function () {
          log("❓ O cliente sabe o IP 10.1.0.7, mas não o MAC — <strong>ARP em broadcast</strong>: " +
            "“quem tem 10.1.0.7?”");
          STATIONS.forEach(function (s) { stationNote(s.ip, "recebeu o broadcast", "is-flash"); });
        }, (t += 200));
        to(function () {
          stationNote("10.1.0.6", "IP não é meu — ignora", "");
          stationNote("10.1.0.7", "sou eu! responde: MAC 02:C3", "is-target");
          log("🙋 Só <strong>10.1.0.7</strong> responde, com seu MAC. Os demais ignoram.");
        }, (t += 900));
        to(function () {
          state.arpCached = true;
          var badge = els.area.querySelector(".demo-cr-arpcache");
          badge.setAttribute("data-cached", "true");
          badge.innerHTML = "cache ARP do cliente: <code>10.1.0.7 ⇒ 02:C3</code>";
          log("🗃️ Par (IP, MAC) guardado no <strong>cache ARP</strong> — o broadcast não se repete.");
        }, (t += 800));
      } else {
        to(function () {
          log("🗃️ MAC de 10.1.0.7 já está no <strong>cache ARP</strong> — quadro direto, sem broadcast.");
        }, (t += 200));
      }
      to(function () {
        state.sends++;
        bump("delivered");
        state.busy = false;
        renderStage2();
        stationNote("10.1.0.6", "quadro não é para mim", "");
        stationNote("10.1.0.7", "MAC confere → entrega às camadas de cima", "is-target");
        log("📬 Quadro entregue na interface certa; as outras estações o descartam em hardware.");
        updateNav();
      }, (t += 900));
    }

    /* ============ Etapa 3 — Seja o roteador ============ */

    function currentRound() { return ROUNDS[state.roundIdx]; }

    function renderTable(node, dest) {
      var t = TABLES[node];
      var rows = Object.keys(t).map(function (d) {
        var e = t[d];
        var out = e === "local" ? "local" : (e === "gateway" ? "→ Internet (gateway)" :
          "enlace " + e.l);
        var cost = (e && e.c !== undefined) ? e.c : "—";
        return "<tr" + (d === dest ? ' data-dest-row="1"' : "") + "><td>" + DEST_LABEL[d] +
          "</td><td>" + out + "</td><td>" + cost + "</td></tr>";
      }).join("");
      return '<table class="demo-cr-table"><caption>Tabela de roteamento de <strong>' + node +
        "</strong></caption><thead><tr><th>Para</th><th>Saída</th><th>Custo</th></tr></thead>" +
        "<tbody>" + rows + "</tbody></table>";
    }

    function renderStage3() {
      if (state.roundIdx >= ROUNDS.length) {
        els.area.innerHTML = renderSvg({}) +
          '<p class="demo-cr-round">🏁 Os três pacotes chegaram. Repare: nenhum roteador conhecia ' +
          "o caminho inteiro — só o próximo salto.</p>";
        els.controls.innerHTML = "";
        return;
      }
      var r = currentRound();
      var at = state.packetAt;
      els.area.innerHTML = renderSvg({ at: at }) +
        '<p class="demo-cr-round"><strong>' + r.label + "</strong><br>O pacote está em <strong>" +
        at + "</strong>. Consulte a tabela e escolha o enlace de saída.</p>" + renderTable(at, r.dest);
      var btns = NODE_LINKS[at].map(function (l) {
        return '<button type="button" class="btn btn-secondary demo-cr-linkbtn" data-choose="' + l +
          '">enlace ' + l + " → " + viaLink(at, l) + "</button>";
      }).join("");
      els.controls.innerHTML = btns;
      els.controls.querySelectorAll(".demo-cr-linkbtn").forEach(function (b) {
        b.addEventListener("click", function () {
          chooseLink(parseInt(b.getAttribute("data-choose"), 10));
        });
      });
    }

    function chooseLink(l) {
      var r = currentRound();
      var at = state.packetAt;
      var entry = TABLES[at][r.dest] === undefined || r.dest === "DEF" ? TABLES[at].DEF : TABLES[at][r.dest];
      var correct = entry !== "local" && entry !== "gateway" && entry.l === l;
      var next = viaLink(at, l);
      bump("hops");
      state.packetAt = next;
      if (correct) {
        log("✓ Saltou por <strong>enlace " + l + "</strong> até <strong>" + next +
          "</strong> — era o que a tabela de " + at + " mandava.");
      } else {
        log("🚧 A tabela de " + at + " apontava o <strong>enlace " + entry.l +
          "</strong>, mas o pacote foi pelo " + l + " e parou em <strong>" + next +
          "</strong> — agora é a tabela DELE que decide.");
      }
      var arrived = (r.dest !== "DEF" && next === r.dest) ||
        (r.dest === "DEF" && next === "E");
      if (arrived) {
        if (r.dest === "DEF") {
          log("🌐 Em E, a rota <strong>padrão</strong> aponta o gateway: o pacote segue para a " +
            "Internet. Ninguém aqui conhecia 203.0.113.9 — e não precisava.");
        } else {
          log("🏁 Chegou à rede de <strong>" + next + "</strong>: entrega local (como na etapa 2).");
        }
        state.delivered3++;
        bump("delivered");
        state.roundIdx++;
        state.hops = 0;
        metric("hops", 0);
        if (state.roundIdx < ROUNDS.length) {
          state.packetAt = currentRound().start;
          log("— " + currentRound().label + " —");
        }
      }
      renderStage3();
      updateNav();
    }

    /* ============ Etapa 4 — A rede muda ============ */

    function initVectors() {
      state.vectors = {
        A: { l: 1, c: 2 }, B: { l: 2, c: 1 }, C: "local", D: { l: 6, c: 2 }, E: { l: 5, c: 1 }
      };
      state.linkDown = false;
      state.rounds = 0;
      state.converged = true;
      state.deliveredAfterConv = false;
    }

    function workingLinks(n) {
      return NODE_LINKS[n].filter(function (l) { return !(state.linkDown && l === 2); });
    }

    function vecCost(n) { return state.vectors[n] === "local" ? 0 : state.vectors[n].c; }

    function exchangeRound() {
      var snap = {};
      Object.keys(state.vectors).forEach(function (n) { snap[n] = vecCost(n); });
      var changed = false;
      Object.keys(state.vectors).forEach(function (n) {
        if (state.vectors[n] === "local") return;
        var cur = state.vectors[n];
        var best = { l: cur.l, c: cur.c };
        /* autoridade: o vizinho da rota corrente substitui o custo */
        if (workingLinks(n).indexOf(cur.l) !== -1) {
          best.c = Math.min(snap[viaLink(n, cur.l)] + 1, INFC);
        } else {
          best.c = INFC; /* rota corrente por enlace caído */
        }
        workingLinks(n).forEach(function (l) {
          var cand = Math.min(snap[viaLink(n, l)] + 1, INFC);
          if (cand < best.c) best = { l: l, c: cand };
        });
        if (best.l !== cur.l || best.c !== cur.c) changed = true;
        state.vectors[n] = best;
      });
      state.rounds++;
      if (changed) {
        state.converged = false;
        log("🔁 Rodada " + state.rounds + ": tabelas trocadas — rotas para a rede de C mudaram.");
      } else {
        state.converged = true;
        log("🟢 Rodada " + state.rounds + ": nada mudou — as tabelas <strong>convergiram</strong>.");
      }
      renderStage4();
      updateNav();
    }

    function testDelivery() {
      var path = ["A"];
      var at = "A";
      var ok = false, reason = "";
      for (var i = 0; i < 8; i++) {
        if (at === "C") { ok = true; break; }
        var v = state.vectors[at];
        if (v === "local") { ok = true; break; }
        if (v.c >= INFC) { reason = "descartado em " + at + ": sem rota (custo ∞)"; break; }
        if (state.linkDown && v.l === 2) { reason = "descartado em " + at + ": enlace 2 caído"; break; }
        at = viaLink(at, v.l);
        path.push(at);
      }
      if (ok) {
        log("🏁 Entregue: <strong>" + path.join(" → ") + "</strong> (" + (path.length - 1) +
          " saltos)" + (state.linkDown ? " — rota alternativa, sem passar pelo enlace 2." : "."));
        bump("delivered");
        if (state.linkDown && state.converged) {
          state.deliveredAfterConv = true;
        }
      } else {
        log("💥 Pacote perdido: " + (reason || "vagou demais (TTL)") + ". Durante a convergência, " +
          "a rede erra.");
        bump("lost");
      }
      updateNav();
    }

    function renderStage4() {
      var rows = Object.keys(state.vectors).map(function (n) {
        var v = state.vectors[n];
        var txt = v === "local" ? "local (é a rede dela)" :
          (v.c >= INFC ? "∞ — sem rota" : "enlace " + v.l + ", custo " + v.c);
        return '<tr data-router="' + n + '"><td>' + n + "</td><td data-vec>" + txt + "</td></tr>";
      }).join("");
      els.area.innerHTML = renderSvg({}) +
        '<table class="demo-cr-table demo-cr-vectors"><caption>Rota de cada roteador para a ' +
        "<strong>rede de C</strong> (destino do servidor)</caption>" +
        "<thead><tr><th>Roteador</th><th>Próximo salto</th></tr></thead><tbody>" + rows +
        "</tbody></table>" +
        '<p class="demo-cr-round" data-converged="' + state.converged + '">Tabelas: <strong>' +
        (state.converged ? "estáveis" : "instáveis — troque tabelas até convergir") +
        "</strong> · rodadas de troca: " + state.rounds + "</p>";
      els.controls.innerHTML =
        '<button type="button" class="btn btn-secondary demo-cr-break"' +
        (state.linkDown ? " disabled" : "") + ">💥 Derrubar enlace 2 (B–C)</button>" +
        '<button type="button" class="btn btn-secondary demo-cr-exchange">🔁 Trocar tabelas ' +
        "(1 rodada)</button>" +
        '<button type="button" class="btn demo-cr-test">✉️ Testar entrega (A → servidor)</button>';
      els.controls.querySelector(".demo-cr-break").addEventListener("click", function () {
        state.linkDown = true;
        state.converged = false;
        state.vectors.B = { l: 2, c: INFC };
        log("💥 Enlace 2 (B–C) caiu. B marca a rota pela saída 2 com <strong>custo ∞</strong> " +
          "(ações Envia/Recebe do RIP). Teste uma entrega agora — e depois troque tabelas.");
        renderStage4();
        updateNav();
      });
      els.controls.querySelector(".demo-cr-exchange").addEventListener("click", exchangeRound);
      els.controls.querySelector(".demo-cr-test").addEventListener("click", testDelivery);
    }

    /* ============ Etapa 5 — Melhor esforço × TCP ============ */

    function drawFrag() { return 1 + Math.floor(rand() * FRAGS.length); }

    function initStage5() {
      if (!state.lostFrag) {
        state.lostFrag = drawFrag();
        state.dupFrag = drawFrag();
        if (state.dupFrag === state.lostFrag) state.dupFrag = (state.dupFrag % FRAGS.length) + 1;
      }
    }

    /* Linha do tempo dos fragmentos: ímpares pela rota rápida (A→B→C),
       pares pela lenta (A→D→E→C); um se perde, outro chega em dobro. */
    function arrivals() {
      var evs = [];
      for (var f = 1; f <= FRAGS.length; f++) {
        var sendT = (f - 1) * 12;
        var arriveT = sendT + (f % 2 === 1 ? 30 : 55);
        if (f !== state.lostFrag) {
          evs.push({ frag: f, at: arriveT, dup: false });
          if (f === state.dupFrag) evs.push({ frag: f, at: arriveT + 20, dup: true });
        }
      }
      evs.sort(function (a, b) { return a.at - b.at; });
      return evs;
    }

    function renderStage5() {
      initStage5();
      var slots = FRAGS.map(function (_, i) {
        return '<span class="demo-cr-slot" data-slot="' + (i + 1) + '">' + (i + 1) + "</span>";
      }).join("");
      els.area.innerHTML = renderSvg({}) +
        '<p class="demo-cr-round">Mensagem de ' + FRAGS.length + " fragmentos (maior que a MTU): " +
        "ímpares pela rota rápida (A→B→C), pares pela lenta (A→D→E→C). A fila de um roteador " +
        "está cheia; uma retransmissão gera duplicata.</p>" +
        '<div class="demo-cr-rx"><p>Recebido no servidor (rede 10.5):</p>' +
        '<div class="demo-cr-slots" data-done="0">' + slots + "</div>" +
        '<p class="demo-cr-apptext">O que a aplicação leu: <strong data-apptext data-intact="">—' +
        "</strong></p></div>";
      renderControls5();
    }

    function renderControls5() {
      els.controls.innerHTML =
        '<label><input type="radio" name="demo-cr-mode" value="udp"' +
        (state.mode === "udp" ? " checked" : "") + "> UDP (entrega como chegar)</label>" +
        '<label><input type="radio" name="demo-cr-mode" value="tcp"' +
        (state.mode === "tcp" ? " checked" : "") + "> TCP (sequência + confirmação + " +
        "retransmissão)</label>" +
        '<button type="button" class="btn demo-cr-send5"' + (state.busy ? " disabled" : "") +
        ">📨 Enviar mensagem</button>" +
        '<span class="demo-cr-modes-done">enviado com: UDP ' + (state.sentUdp ? "✓" : "—") +
        " · TCP " + (state.sentTcp ? "✓" : "—") + "</span>";
      els.controls.querySelectorAll('[name="demo-cr-mode"]').forEach(function (rb) {
        rb.addEventListener("change", function () { state.mode = rb.value; });
      });
      els.controls.querySelector(".demo-cr-send5").addEventListener("click", sendStage5);
    }

    function slotEl(f) { return els.area.querySelector('[data-slot="' + f + '"]'); }

    function sendStage5() {
      if (state.busy) return;
      state.busy = true;
      renderStage5();
      var mode = state.mode;
      var evs = arrivals();
      var appOrder = [];       // UDP: ordem de chegada; TCP: ordem final
      var buffered = {};       // TCP: fragmentos à espera da lacuna
      var deliveredUpTo = 0;   // TCP: última posição contígua entregue
      var t = 0;
      log("📨 Enviando “" + FULL_MSG + "” em " + FRAGS.length + " fragmentos, via <strong>" +
        mode.toUpperCase() + "</strong>.");
      to(function () {
        log("💥 Fila cheia num roteador: <strong>fragmento " + state.lostFrag +
          " descartado</strong> (a causa mais comum de perda).");
        bump("lost");
      }, (t += 400));
      evs.forEach(function (ev) {
        to(function () {
          var s = slotEl(ev.frag);
          if (ev.dup) {
            bump("dups");
            if (mode === "udp") {
              appOrder.push(ev.frag);
              s.classList.add("is-dup");
              log("👯 Fragmento " + ev.frag + " chegou DE NOVO — o UDP entrega a duplicata à aplicação.");
            } else {
              log("🗑️ Fragmento " + ev.frag + " chegou de novo — mesmo nº de sequência: " +
                "<strong>duplicata descartada</strong> pelo TCP.");
            }
            return;
          }
          if (mode === "udp") {
            appOrder.push(ev.frag);
            s.classList.add("is-rx");
            log("📥 Fragmento " + ev.frag + " chegou — UDP repassa à aplicação na hora.");
          } else {
            buffered[ev.frag] = true;
            s.classList.add("is-buf");
            var gap = ev.frag > deliveredUpTo + 1;
            log("📥 Fragmento " + ev.frag + " chegou" + (gap
              ? " fora de ordem — fica no <strong>buffer</strong> esperando a lacuna."
              : " — em ordem, entregue e <strong>confirmado</strong>."));
            while (buffered[deliveredUpTo + 1]) {
              deliveredUpTo++;
              appOrder.push(deliveredUpTo);
              slotEl(deliveredUpTo).classList.add("is-rx");
            }
          }
        }, 400 + ev.at * 12);
      });
      t = 400 + 120 * 12;
      if (mode === "tcp") {
        to(function () {
          log("⏲️ Sem confirmação do fragmento " + state.lostFrag +
            " no prazo — o remetente <strong>retransmite</strong>.");
        }, (t += 500));
        to(function () {
          buffered[state.lostFrag] = true;
          log("📥 Retransmissão do fragmento " + state.lostFrag + " chegou.");
          while (buffered[deliveredUpTo + 1]) {
            deliveredUpTo++;
            appOrder.push(deliveredUpTo);
            slotEl(deliveredUpTo).classList.add("is-rx");
          }
        }, (t += 700));
      }
      to(function () {
        var text = appOrder.map(function (f) { return FRAGS[f - 1]; }).join("");
        var intact = text === FULL_MSG;
        var out = els.area.querySelector("[data-apptext]");
        out.textContent = "«" + (text || "(nada)") + "»" + (intact ? "" :
          " — fora de ordem, com lacuna ou duplicata");
        out.setAttribute("data-intact", String(intact));
        els.area.querySelector(".demo-cr-slots").setAttribute("data-done", "1");
        if (mode === "udp") {
          state.sentUdp = true;
          log("📄 UDP entregou o que chegou, como chegou: <strong>«" + text + "»</strong>. " +
            "Rápido e barato — mas a aplicação que se vire.");
        } else {
          state.sentTcp = true;
          state.tcpIntact = intact;
          bump("delivered");
          log("📄 TCP entregou <strong>«" + text + "»</strong> — íntegra e em ordem. A rede " +
            "continuou perdendo e duplicando; quem consertou foram <strong>as pontas</strong>.");
        }
        state.busy = false;
        renderControls5(); /* só os controles: o resultado na área fica visível */
        updateNav();
      }, (t += 700));
    }

    /* ============ Etapas ============ */

    var STAGES = [
      {
        title: "Etapa 1 — Empacotar (encapsulamento)",
        instructions: "O navegador em 10.1.0.5 quer pedir uma página ao servidor 10.5.0.80. " +
          "Monte o pacote clicando as camadas NA ORDEM: cada uma embrulha a de cima.",
        goalText: "Meta: fechar o quadro completo (4 camadas na ordem certa).",
        setup: function () {
          if (state.wrapped.length !== LAYERS.length) state.wrapped = [];
        },
        render: renderStage1,
        goalMet: function () { return state.wrapped.length === LAYERS.length; }
      },
      {
        title: "Etapa 2 — Entrega local (mesma Ethernet)",
        instructions: "Antes de cruzar o mundo: um destino na MESMA rede local. Sem roteamento — " +
          "mas o cliente só conhece o IP do destino, não o MAC. Envie duas vezes e compare.",
        goalText: "Meta: enviar 2 vezes (a segunda sem precisar de ARP).",
        setup: function () { state.busy = false; },
        render: renderStage2,
        goalMet: function () { return state.sends >= 2; }
      },
      {
        title: "Etapa 3 — Seja o roteador",
        instructions: "Agora o pacote cruza a inter-rede. Em cada roteador, leia a tabela e " +
          "escolha o enlace de saída. Ninguém conhece o caminho inteiro — só o próximo salto.",
        goalText: "Meta: entregar os 3 pacotes (o último só sai pela rota padrão).",
        setup: function () {
          if (state.roundIdx === 0 && state.packetAt === null) {
            state.packetAt = ROUNDS[0].start;
            log("— " + ROUNDS[0].label + " —");
          }
          state.hops = 0;
          metric("hops", 0);
        },
        render: renderStage3,
        goalMet: function () { return state.delivered3 >= ROUNDS.length; }
      },
      {
        title: "Etapa 4 — A rede muda (falha e reconvergência)",
        instructions: "A rota preferida para o servidor passa pelo enlace 2 (B–C). Derrube-o, " +
          "teste uma entrega no meio do caos, troque tabelas até convergir e entregue de novo.",
        goalText: "Meta: derrubar o enlace 2, reconvergir as tabelas e entregar por rota alternativa.",
        setup: function () { if (!state.vectors) initVectors(); },
        render: renderStage4,
        goalMet: function () { return state.linkDown && state.converged && state.deliveredAfterConv; }
      },
      {
        title: "Etapa 5 — Melhor esforço × TCP",
        instructions: "Uma mensagem de 4 fragmentos enfrenta a rede real: perda, desordem e " +
          "duplicata. Envie com UDP e depois com TCP — os MESMOS acidentes, finais diferentes.",
        goalText: "Meta: enviar com UDP e com TCP (e receber a mensagem íntegra no TCP).",
        setup: function () { state.busy = false; },
        render: renderStage5,
        goalMet: function () { return state.sentUdp && state.sentTcp && state.tcpIntact; }
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
      metric("hops", state.hops);
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
