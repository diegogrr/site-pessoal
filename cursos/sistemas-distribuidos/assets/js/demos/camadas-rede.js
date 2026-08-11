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

   Camada de tutoria (passos, previsão, painel de efeito e conceito
   sob demanda) em demos/tutor.js; diagnóstico, previsões e critérios
   em docs/demos/2026-08-08-demo-camadas-rede-tutoria-plano.md
   Aqui vivem apenas os DADOS dessa camada: o que fazer, o que
   perguntar antes e como explicar cada efeito. O motor é genérico
   e não conhece este modelo.

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
    { dest: "C", start: "A", label: "Pacote 1: destino rede 10.5, do servidor web (ligada a C)" },
    { dest: "D", start: "C", label: "Pacote 2: destino rede ligada a D" },
    { dest: "DEF", start: "A", label: "Pacote 3: destino 203.0.113.9 (Internet, não está na tabela!)" }
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
      /* etapa 2 */ sends: 0, arpCached: false, busy: false, envios: [],
      /* etapa 3 */ roundIdx: 0, packetAt: null, delivered3: 0,
      /* etapa 4 */ linkDown: false, vectors: null, rounds: 0, converged: true,
                    deliveredAfterConv: false, testouNoCaos: false,
      /* etapa 5 */ lostFrag: 0, dupFrag: 0, mode: "udp", sentUdp: false,
                    sentTcp: false, tcpIntact: false, leituras: {}
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
      '    <div class="demo-tutor-passos" hidden></div>' +
      '    <div class="demo-tutor-previsao" hidden></div>' +
      '    <div class="demo-cr-goalrow">' +
      '      <p class="demo-cf-goal"></p>' +
      '      <div class="demo-tutor-conceito" hidden></div>' +
      '    </div>' +
      '  </div>' +
      '  <div class="demo-cr-stage-area"></div>' +
      '  <div class="demo-cf-controls demo-cr-controls"></div>' +
      '  <div class="demo-tutor-efeito" aria-live="polite"></div>' +
      '  <dl class="demo-cf-metrics">' +
      '    <div><dt>Saltos (pacote atual)</dt><dd data-metric="hops">0</dd></div>' +
      '    <div><dt>Entregues</dt><dd data-metric="delivered">0</dd></div>' +
      '    <div><dt>Perdidos/descartados</dt><dd data-metric="lost">0</dd></div>' +
      '    <div><dt>Duplicatas</dt><dd data-metric="dups">0</dd></div>' +
      '  </dl>' +
      '  <div class="demo-cf-summary callout" hidden>' +
      '    <p class="callout-title">🎓 O que você acabou de viver</p>' +
      '    <p><strong>Encapsulamento</strong> é mecânico e tem direção: cada camada embrulha a de ' +
      'cima e rotula o conteúdo. Na rede local não há roteamento: <strong>ARP</strong> + broadcast ' +
      'resolvem. Entre redes, cada roteador decide sozinho o <strong>próximo salto</strong> com uma ' +
      'tabela parcial (e <strong>rotas default</strong> cobrem o resto). Quando um enlace cai, o ' +
      '<strong>vetor de distância</strong> reconverge trocando tabelas, errando no meio do caminho. ' +
      'E como o IP entrega "no <strong>melhor esforço</strong>" (perda, desordem, duplicata), a ' +
      'confiabilidade é construída <strong>nas pontas</strong>: sequenciamento, confirmação e ' +
      'retransmissão do <strong>TCP</strong>. É o princípio fim-a-fim em ação, e o porão da demo ' +
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

    function log(text, diff) {
      var li = document.createElement("li");
      var t = ((Date.now() - startedAt) / 1000).toFixed(1);
      li.innerHTML = '<span class="demo-cf-log-time">+' + t + "s</span> " + text +
        (diff ? ' <span class="demo-cf-log-diff">(' + diff + ")</span>" : "");
      els.log.insertBefore(li, els.log.firstChild);
      while (els.log.children.length > 48) els.log.removeChild(els.log.lastChild);
    }

    function metric(name, value) {
      var el = els.metrics.querySelector('[data-metric="' + name + '"]');
      el.textContent = value;
    }

    function bump(name) { state[name]++; metric(name, state[name]); }

    /* ============ Tutoria: retrato do estado ============ */

    /* O tutor imprime só o que está em metricas[]; os demais campos existem
       para as explicações desta demo. "Saltos" fica DE FORA da lista, e de
       propósito: o painel colore cada linha de verde ou vermelho conforme a
       direção boa, e salto a mais não é melhora nem piora, é o pacote andando.
       Onde ele é a notícia (etapa 3), a linha vai escrita à mão em `numeros`. */
    function retrato() {
      return {
        delivered: state.delivered, lost: state.lost, dups: state.dups,
        hops: state.hops, sends: state.sends, envios: state.envios.length,
        wrapped: state.wrapped.length, rounds: state.rounds
      };
    }

    function fmtInt(v) { return String(v); }

    var tutor = SD.demoTutor.criar({
      alvos: {
        passos: container.querySelector(".demo-tutor-passos"),
        previsao: container.querySelector(".demo-tutor-previsao"),
        efeito: container.querySelector(".demo-tutor-efeito"),
        conceito: container.querySelector(".demo-tutor-conceito")
      },
      metricas: [
        { chave: "delivered", rotulo: "Entregues", formatar: fmtInt, melhorQuando: "maior" },
        { chave: "lost", rotulo: "Perdidos/descartados", formatar: fmtInt, melhorQuando: "menor" },
        { chave: "dups", rotulo: "Duplicatas", formatar: fmtInt, melhorQuando: "menor" }
      ],
      snapshot: retrato
    });

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
      /* A lista sai na ordem de LAYERS, da aplicação para o enlace, e NÃO invertida.
         Até 2026-08-08 ela vinha com .reverse(), pondo o quadro Ethernet no topo, e o
         aluno que lia de cima para baixo clicava justo na camada que só entra por
         último. Pior, a recusa dizia que o quadro "embrulha o que vem de cima" quando
         não havia nada acima dele na tela. Nesta ordem o clique de cima para baixo é o
         certo, o desenho casa com a pilha que o tópico ensina e a frase de recusa passa
         a ser literalmente verdadeira. */
      var buttons = LAYERS.map(function (l) {
        var used = state.wrapped.indexOf(l.id) !== -1;
        return '<button type="button" class="btn btn-secondary demo-cr-layerbtn" data-layer="' +
          l.id + '"' + (used ? " disabled" : "") + "><strong>" + l.label +
          "</strong><span>" + l.desc + "</span></button>";
      }).join("");
      var envelope = '<p class="demo-cr-envelope-hint">clique nas camadas na ordem certa</p>';
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
      /* A etapa 1 não tem controle na zona de comando, e sem esta limpeza o
         botão da etapa anterior sobrevive ali quando o aluno volta. */
      els.controls.innerHTML = "";
      els.area.querySelectorAll(".demo-cr-layerbtn").forEach(function (btn) {
        btn.addEventListener("click", function () {
          var layer = LAYERS.filter(function (x) { return x.id === btn.getAttribute("data-layer"); })[0];
          if (layer.order === state.wrapped.length) {
            aplicarCamada(layer);
          } else {
            recusarCamada(layer);
          }
        });
      });
    }

    function aplicarCamada(layer) {
      var antes = tutor.retrato();
      state.wrapped.push(layer.id);
      var fechou = state.wrapped.length === LAYERS.length;
      log("✓ <strong>" + layer.label + "</strong>: " + layer.why + ".");
      if (fechou) {
        log("📦 Quadro completo: envelope dentro de envelope, pronto para a rede física.");
      }
      renderStage1();
      if (state.wrapped.length >= 1) tutor.passoFeito("primeira");
      if (fechou) tutor.passoFeito("fechar");
      /* A camada de baixo da pilha não embrulha ninguém, então as frases sobre
         "o que veio de cima" e "por fora da anterior" só valem a partir da
         segunda. */
      var primeira = layer.order === 0;
      tutor.efeito({
        acao: "Você embrulhou o pacote com <strong>" + layer.label + "</strong>.",
        antes: antes,
        numeros: "Camadas embrulhadas: " + antes.wrapped + " → " + state.wrapped.length +
          " de " + LAYERS.length,
        porque: layer.why + (primeira
          ? ". É este conteúdo que os três envelopes seguintes vão carregar sem alterar."
          : ". Os dados que vieram de cima não foram tocados, e o que cresceu foi o envelope."),
        olhe: fechou
          ? "a ordem em que você montou, da aplicação para o enlace. A transmissão é a " +
            "inversa, porque o último envelope fechado é o primeiro a entrar no fio, e " +
            "a mensagem da aplicação viaja no meio de todos eles."
          : (primeira
            ? "o envelope à direita, que deixou de estar vazio. Daqui em diante cada " +
              "camada nova entra POR FORA desta."
            : "o envelope à direita, em que a camada nova entrou POR FORA da anterior. A " +
              "próxima é a primeira que ainda estiver ativa na lista à esquerda.")
      });
      updateNav();
    }

    function recusarCamada(layer) {
      var expected = LAYERS[state.wrapped.length];
      /* O que ESTA camada embrulharia é a de dentro dela, e não a próxima da
         fila. Confundir as duas produzia a frase falsa "o quadro Ethernet
         embrulharia a mensagem da aplicação". */
      var interna = LAYERS[layer.order - 1];
      log("✗ Ainda não: <strong>" + layer.label + "</strong> embrulha o que vem de cima, " +
        "e ainda falta <strong>" + expected.label + "</strong>.");
      var env = els.area.querySelector(".demo-cr-envelope");
      env.classList.remove("is-shake");
      void env.offsetWidth;
      env.classList.add("is-shake");
      tutor.efeito({
        acao: "Você tentou embrulhar com <strong>" + layer.label + "</strong> antes da hora.",
        antes: null,
        numeros: "Camadas embrulhadas: " + state.wrapped.length + " de " + LAYERS.length +
          " (nada mudou)",
        porque: "cada camada embrulha o que a de cima já entregou, e " + layer.label +
          " embrulharia " + (interna ? interna.label : expected.label) + ", que ainda não " +
          "foi montado. A vez agora é de " + expected.label + ".",
        olhe: "a lista à esquerda. A camada já usada fica desabilitada, então a próxima " +
          "é sempre a primeira que ainda dá para clicar."
      });
    }

    /* ============ Etapa 2 — Entrega local (ARP) ============ */

    /* Placar dos envios: a etapa promete comparar o primeiro envio com o
       segundo, e a diferença entre eles é a lição inteira. Sem ele, comparar
       exigiria guardar de cabeça as linhas do primeiro envio, esperar a
       animação e reparar que não voltaram, o que é tarefa de memória e não de
       observação (achado A2 do diagnóstico de 2026-08-08). */
    function renderPlacar2() {
      var linhas = state.envios.map(function (e, i) {
        return "<tr><td>" + (i + 1) + "º</td><td>" + e.arp + "</td><td>" + e.dados +
          "</td><td><strong>" + (e.arp + e.dados) + "</strong></td></tr>";
      }).join("");
      if (state.envios.length < 2) {
        linhas += '<tr class="is-pendente"><td>' + (state.envios.length + 1) +
          "º</td><td>?</td><td>?</td><td>?</td></tr>";
      }
      return '<table class="demo-cr-table demo-cr-placar"><caption>Quadros que cada envio ' +
        "colocou no fio</caption><thead><tr><th>Envio</th><th>ARP</th><th>Dados</th>" +
        "<th>Total</th></tr></thead><tbody>" + linhas + "</tbody></table>";
    }

    function renderStage2() {
      var cards = STATIONS.map(function (s) {
        return '<div class="demo-cr-station" data-station="' + s.ip + '">' +
          '<span class="demo-cr-station-icon">🖥️</span>' +
          "<strong>" + s.name + "</strong><span>" + s.ip + "</span>" +
          '<span class="demo-cr-station-mac">MAC ' + s.mac + "</span>" +
          '<span class="demo-cr-station-note" data-note></span></div>';
      }).join("");
      els.area.innerHTML =
        '<div class="demo-cr-lanview"><p class="demo-cr-lanview-title">Ethernet local: ' +
        "rede 10.1 (um único segmento; sem roteamento)</p>" +
        '<div class="demo-cr-stations">' + cards + "</div>" +
        '<p class="demo-cr-arpcache" data-cached="' + state.arpCached + '">cache ARP do cliente: ' +
        (state.arpCached ? "<code>10.1.0.7 ⇒ 02:C3</code>" : "<em>vazio</em>") + "</p>" +
        renderPlacar2() + "</div>";
      els.controls.innerHTML =
        '<button type="button" class="btn demo-cr-send2"' + (state.busy ? " disabled" : "") +
        ">✉️ Enviar arquivo para 10.1.0.7</button>" +
        '<span class="demo-cr-sends">envios concluídos: <strong>' + state.sends + "</strong></span>";
      els.controls.querySelector(".demo-cr-send2").addEventListener("click", sendLocal);
    }

    function explicarEnvio2(antes, arpFrames) {
      var total = arpFrames + 1;
      if (state.sends === 1) {
        return {
          acao: "Você enviou o arquivo pela primeira vez, e o cliente precisou descobrir " +
            "o MAC de 10.1.0.7.",
          numeros: "Quadros no fio: " + total + " (" + arpFrames + " de ARP + 1 de dados)",
          porque: "o quadro Ethernet precisa de um endereço MAC de destino, e o cliente " +
            "tinha só o IP. O ARP perguntou em difusão quem tem 10.1.0.7, todas as " +
            "estações receberam a pergunta e só o dono respondeu.",
          olhe: "o placar logo abaixo das estações. Ele guarda o que este envio gastou, " +
            "para você comparar com o próximo sem precisar lembrar de nada."
        };
      }
      if (state.sends === 2) {
        var e1 = state.envios[0];
        return {
          acao: "Você enviou o mesmo arquivo de novo, e desta vez o ARP não apareceu.",
          numeros: "Quadros de ARP: " + e1.arp + " → " + arpFrames + " · quadros no fio: " +
            (e1.arp + e1.dados) + " → " + total,
          porque: "o par (IP, MAC) descoberto no primeiro envio ficou guardado no cache " +
            "ARP, e o cliente montou o quadro direto. A difusão só volta quando a entrada " +
            "expira ou quando o destino é outro.",
          olhe: "as duas linhas do placar, uma embaixo da outra. A diferença entre elas é " +
            "o cache, e a rede não ficou mais rápida, o que sumiu foi trabalho repetido."
        };
      }
      return {
        acao: "Você enviou o arquivo mais uma vez.",
        numeros: "Quadros no fio: " + total + " (o cache continua valendo)",
        porque: "enquanto a entrada do cache não expirar, todo envio para 10.1.0.7 custa " +
          "um quadro só. A economia do ARP não é de uma vez, é de todas as seguintes.",
        olhe: "o placar, em que as linhas a partir da segunda são todas iguais."
      };
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
      var antes = tutor.retrato();
      /* Dois quadros no fio quando o ARP roda, que são a pergunta em difusão e
         a resposta de quem se reconhece. Guardar o par no cache é escrita em
         memória local e não gasta quadro nenhum. */
      var arpFrames = state.arpCached ? 0 : 2;
      state.busy = true;
      renderStage2();
      tutor.aguardar("Enviando. Esta faixa conta quantos quadros o envio gastou assim que " +
        "ele terminar.");
      var t = 0;
      if (!state.arpCached) {
        to(function () {
          log("❓ O cliente sabe o IP 10.1.0.7, mas não o MAC. Entra o <strong>ARP em " +
            "broadcast</strong>: “quem tem 10.1.0.7?” (1º quadro no fio)");
          STATIONS.forEach(function (s) { stationNote(s.ip, "recebeu o broadcast", "is-flash"); });
        }, (t += 200));
        to(function () {
          stationNote("10.1.0.6", "IP não é meu: ignora", "");
          stationNote("10.1.0.7", "sou eu! responde: MAC 02:C3", "is-target");
          log("🙋 Só <strong>10.1.0.7</strong> responde, com seu MAC (2º quadro no fio). " +
            "Os demais ignoram.");
        }, (t += 900));
        to(function () {
          state.arpCached = true;
          var badge = els.area.querySelector(".demo-cr-arpcache");
          badge.setAttribute("data-cached", "true");
          badge.innerHTML = "cache ARP do cliente: <code>10.1.0.7 ⇒ 02:C3</code>";
          log("🗃️ Par (IP, MAC) guardado no <strong>cache ARP</strong>, sem gastar quadro " +
            "nenhum, porque isso é memória local. O broadcast não se repete.");
        }, (t += 800));
      } else {
        to(function () {
          log("🗃️ MAC de 10.1.0.7 já está no <strong>cache ARP</strong>: quadro direto, sem broadcast.");
        }, (t += 200));
      }
      to(function () {
        state.sends++;
        state.envios.push({ arp: arpFrames, dados: 1 });
        bump("delivered");
        state.busy = false;
        renderStage2();
        stationNote("10.1.0.6", "quadro não é para mim", "");
        stationNote("10.1.0.7", "MAC confere → entrega às camadas de cima", "is-target");
        if (state.sends >= 1) tutor.passoFeito("envio1");
        if (state.sends >= 2) tutor.passoFeito("envio2");
        var exp = explicarEnvio2(antes, arpFrames);
        /* O painel fala primeiro para que o resumo dele feche a linha do
           registro, que é a última do envio. O log desta demo já narra o
           conceito, então ele ganha o número e não uma linha nova. */
        var diff = tutor.efeito({
          acao: exp.acao, antes: antes, numeros: exp.numeros,
          porque: exp.porque, olhe: exp.olhe
        });
        log("📬 Quadro entregue na interface certa; as outras estações o descartam em " +
          "hardware. Este envio gastou " + (arpFrames + 1) + " quadro" +
          (arpFrames ? "s" : "") + " no fio.", diff);
        updateNav();
      }, (t += 900));
    }

    /* ============ Etapa 3 — Seja o roteador ============ */

    function currentRound() { return ROUNDS[state.roundIdx]; }

    /* Sem coluna de custo, desde 2026-08-08. Nesta etapa a decisão usa só a linha do
       destino e a coluna de saída, e o custo apontava para a resposta errada: o pacote 1
       vai para a rede 10.5, cuja linha custa 2, enquanto "rede em B" sai pelo mesmo
       enlace e custa 1. O custo só ganha sentido na etapa 4, e é lá que ele aparece,
       dentro do vetor de distância. */
    function renderTable(node, dest) {
      var t = TABLES[node];
      var rows = Object.keys(t).map(function (d) {
        var e = t[d];
        var out = e === "local" ? "local" : (e === "gateway" ? "→ Internet (gateway)" :
          "enlace " + e.l);
        return "<tr" + (d === dest ? ' data-dest-row="1"' : "") + "><td>" + DEST_LABEL[d] +
          "</td><td>" + out + "</td></tr>";
      }).join("");
      return '<table class="demo-cr-table"><caption>Tabela de roteamento de <strong>' + node +
        "</strong></caption><thead><tr><th>Para</th><th>Saída</th></tr></thead>" +
        "<tbody>" + rows + "</tbody></table>";
    }

    function renderStage3() {
      if (state.roundIdx >= ROUNDS.length) {
        els.area.innerHTML = renderSvg({}) +
          '<p class="demo-cr-round">🏁 Os três pacotes chegaram. Repare: nenhum roteador conhecia ' +
          "o caminho inteiro, só o próximo salto.</p>";
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

    /* O "por quê" e o "olhe para" de um salto. A ideia que a etapa persegue é
       que a decisão coube a UMA linha da tabela, e que errar o enlace custa
       caminho, não pacote. */
    function explicarSalto(o) {
      var destino = o.r.dest === "DEF" ? "203.0.113.9, na Internet"
        : "a " + DEST_LABEL[o.r.dest];
      if (o.arrived) {
        if (o.r.dest === "DEF") {
          return {
            acao: "Você levou o pacote até <strong>E</strong>, o único roteador com saída " +
              "para a Internet.",
            porque: "nenhum roteador daqui conhece 203.0.113.9, e nenhum precisava. A rota " +
              "padrão de E manda para o gateway tudo o que a tabela não reconhece.",
            olhe: "o tamanho das tabelas que você consultou, com meia dúzia de linhas cada " +
              "uma, num mundo de bilhões de endereços. É a rota padrão que torna isso " +
              "possível."
          };
        }
        return {
          acao: "Você entregou o pacote em <strong>" + o.next + "</strong>, que é a rede de " +
            "destino.",
          porque: "cada roteador do caminho consultou uma linha da própria tabela e passou " +
            "adiante. Em nenhum momento alguém conheceu a rota inteira.",
          olhe: 'o contador "Saltos (pacote atual)", que zerou para o pacote seguinte. Daqui ' +
            "em diante a entrega é local, como na etapa 2."
        };
      }
      if (o.correct) {
        return {
          acao: "Você mandou o pacote pelo <strong>enlace " + o.l + "</strong>, de " + o.at +
            " até <strong>" + o.next + "</strong>.",
          porque: o.r.dest === "DEF"
            ? "a tabela de " + o.at + " não tem linha para 203.0.113.9, então valeu a rota " +
              "padrão, que aponta o enlace " + o.l + ". Ela existe justamente para o destino " +
              "desconhecido."
            : "a tabela de " + o.at + " associa " + DEST_LABEL[o.r.dest] + " ao enlace " +
              o.l + ", e foi essa única linha que decidiu. As outras não foram consultadas, " +
              "e nenhuma delas diz o caminho inteiro.",
          olhe: "a tabela na tela, que trocou de dono. Quem decide agora é a de " + o.next +
            ", e ela é outra."
        };
      }
      return {
        acao: "Você mandou o pacote pelo <strong>enlace " + o.l + "</strong>, e a tabela de " +
          o.at + " mandava o <strong>enlace " + o.entry.l + "</strong>.",
        porque: "o pacote não se perdeu, porque em " + o.next + " existe outra tabela, e ela " +
          "também sabe alcançar " + destino + ". O desvio custou um salto a mais, e não a " +
          "entrega.",
        olhe: "a tabela de " + o.next + ", que já está na tela. Encaminhamento errado vira " +
          "caminho mais longo, e é essa tolerância que sustenta uma rede cujas tabelas nunca " +
          "estão todas em dia."
      };
    }

    function chooseLink(l) {
      var antes = tutor.retrato();
      var r = currentRound();
      var at = state.packetAt;
      var entry = TABLES[at][r.dest] === undefined || r.dest === "DEF" ? TABLES[at].DEF : TABLES[at][r.dest];
      var correct = entry !== "local" && entry !== "gateway" && entry.l === l;
      var next = viaLink(at, l);
      bump("hops");
      state.packetAt = next;
      if (correct) {
        log("✓ Saltou por <strong>enlace " + l + "</strong> até <strong>" + next +
          "</strong>: era o que a tabela de " + at + " mandava.");
      } else {
        log("🚧 A tabela de " + at + " apontava o <strong>enlace " + entry.l +
          "</strong>, mas o pacote foi pelo " + l + " e parou em <strong>" + next +
          "</strong>. Agora é a tabela DELE que decide.");
      }
      var arrived = (r.dest !== "DEF" && next === r.dest) ||
        (r.dest === "DEF" && next === "E");
      var saltosDoPacote = state.hops;
      if (arrived) {
        if (r.dest === "DEF") {
          log("🌐 Em E, a rota <strong>padrão</strong> aponta o gateway: o pacote segue para a " +
            "Internet. Ninguém aqui conhecia 203.0.113.9, e não precisava.");
        } else {
          log("🏁 Chegou à rede de <strong>" + next + "</strong>: entrega local (como na etapa 2).");
        }
        state.delivered3++;
        bump("delivered");
        state.roundIdx++;
        state.hops = 0;
        metric("hops", 0);
        tutor.passoFeito("pacote" + state.delivered3);
        if (state.roundIdx < ROUNDS.length) {
          state.packetAt = currentRound().start;
          log("▶ " + currentRound().label);
        }
      }
      renderStage3();
      var exp = explicarSalto({
        at: at, l: l, entry: entry, correct: correct, next: next,
        arrived: arrived, r: r, antes: antes
      });
      /* O registro desta etapa já narra cada salto e cada chegada, então aqui
         o painel não devolve linha nova para ele. */
      tutor.efeito({
        acao: exp.acao,
        antes: antes,
        numeros: arrived
          ? "Entregues: " + antes.delivered + " → " + state.delivered + " · o pacote andou " +
            saltosDoPacote + " salto" + (saltosDoPacote > 1 ? "s" : "")
          : "Saltos deste pacote: " + antes.hops + " → " + state.hops +
            (correct ? "" : ", um deles desnecessário"),
        porque: exp.porque,
        olhe: exp.olhe
      });
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
      state.testouNoCaos = false;
    }

    /* Forma curta da rota, para a linha de antes/depois do painel. Sem
       dois-pontos, porque ali várias rotas dividem a mesma linha. */
    function rotaCurta(v) {
      if (v === "local") return "local";
      return v.c >= INFC ? "sem rota (∞)" : "enlace " + v.l + " (custo " + v.c + ")";
    }

    function retratoVetores() {
      var m = {};
      Object.keys(state.vectors).forEach(function (n) { m[n] = rotaCurta(state.vectors[n]); });
      return m;
    }

    function mudancasDeRota(antes) {
      return Object.keys(state.vectors).filter(function (n) {
        return antes[n] !== rotaCurta(state.vectors[n]);
      }).map(function (n) {
        return n + " " + antes[n] + " → " + rotaCurta(state.vectors[n]);
      });
    }

    function workingLinks(n) {
      return NODE_LINKS[n].filter(function (l) { return !(state.linkDown && l === 2); });
    }

    function vecCost(n) { return state.vectors[n] === "local" ? 0 : state.vectors[n].c; }

    function exchangeRound() {
      var antes = tutor.retrato();
      var rotasAntes = retratoVetores();
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
      var mudancas = mudancasDeRota(rotasAntes);
      if (changed) {
        state.converged = false;
        log("🔁 Rodada " + state.rounds + ": tabelas trocadas, rotas para a rede de C mudaram.");
      } else {
        state.converged = true;
        log("🟢 Rodada " + state.rounds + ": nada mudou, as tabelas <strong>convergiram</strong>.");
        if (state.linkDown) tutor.passoFeito("trocar");
      }
      renderStage4();
      tutor.efeito({
        acao: changed
          ? "Você mandou os roteadores trocarem tabelas (rodada " + state.rounds + ")."
          : "Você trocou tabelas mais uma vez (rodada " + state.rounds +
            "), e nada mudou.",
        antes: antes,
        numeros: mudancas.length ? mudancas.join(" · ") : "Nenhuma rota mudou nesta rodada",
        porque: changed
          ? "cada roteador somou 1 ao custo que cada vizinho anunciou e ficou com o menor. " +
            "Ninguém calculou o caminho inteiro, e mesmo assim as rotas se acertaram."
          : "uma rodada sem novidade é a definição de convergência no vetor de distância. " +
            "Enquanto alguma rota muda, a rede ainda está se acertando, e por isso a rodada " +
            "que parece inútil é justamente a que fecha o processo.",
        olhe: changed
          ? "de onde veio a correção. A notícia da queda chegou a A como o custo infinito " +
            "anunciado por B, e não como um aviso sobre o enlace 2, que A nem enxerga."
          : (state.linkDown
            ? "a linha de estado, que passou a dizer estáveis, e o custo de A, que ficou em " +
              vecCost("A") + " contra os 2 de antes da falha. Reconvergir custou um salto."
            : "a linha de estado. As tabelas já concordavam, então esta troca não teve o " +
              "que corrigir.")
      });
      updateNav();
    }

    function explicarEntrega4(ok, reason, path) {
      if (!ok) {
        return {
          acao: "Você testou uma entrega com as tabelas ainda desatualizadas.",
          porque: "A mandou o pacote para B, porque a tabela dela ainda dizia isso, e B já " +
            "não tinha para onde mandar. O pacote foi descartado no meio do caminho, e " +
            "ninguém avisou a origem.",
          olhe: "a janela que se abriu entre a falha e a convergência. A rede erra ali " +
            "porque a informação leva tempo para viajar de vizinho em vizinho, e não por " +
            "defeito de projeto."
        };
      }
      if (!state.linkDown) {
        return {
          acao: "Você entregou um pacote com a rede inteira de pé.",
          porque: "o caminho " + path.join(" para ") + " é o que as tabelas apontam hoje, " +
            "com custo 2 a partir de A. É este o estado que a falha vai desmanchar.",
          olhe: "o enlace 2 no desenho, que é o próximo salto de B. Derrubá-lo é derrubar " +
            "a rota preferida, e não a rede."
        };
      }
      if (state.converged) {
        return {
          acao: "Você testou a entrega com as tabelas já estáveis.",
          porque: "a rota de A passou a sair pelo enlace 3, e o pacote foi por D e por E " +
            "até C, sem tocar no enlace caído.",
          olhe: "o caminho no registro, um salto mais longo que o original. A rede se " +
            "refez sozinha, e não de graça."
        };
      }
      return {
        acao: "Você testou a entrega, e ela já funciona.",
        porque: "a rodada de troca que você acabou de rodar consertou as rotas de A e de " +
          "B, e o pacote encontrou o caminho por D e por E.",
        olhe: "a linha de estado, que ainda diz instáveis. As rotas já estão certas, e " +
          "falta a rodada sem novidade que autoriza declarar isso."
      };
    }

    function testDelivery() {
      var antes = tutor.retrato();
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
      if (state.linkDown && state.rounds === 0) state.testouNoCaos = true;
      if (ok) {
        log("🏁 Entregue: <strong>" + path.join(" → ") + "</strong> (" + (path.length - 1) +
          " saltos)" + (state.linkDown ? ". Rota alternativa, sem passar pelo enlace 2." : "."));
        bump("delivered");
        if (state.linkDown && state.converged) {
          state.deliveredAfterConv = true;
          tutor.passoFeito("testar-ok");
        }
      } else {
        log("💥 Pacote perdido: " + (reason || "vagou demais (TTL)") + ". Durante a convergência, " +
          "a rede erra.");
        bump("lost");
      }
      if (state.testouNoCaos) tutor.passoFeito("testar-caos");
      var exp = explicarEntrega4(ok, reason, path);
      tutor.efeito({
        acao: exp.acao, antes: antes,
        numeros: ok
          ? "Entregues: " + antes.delivered + " → " + state.delivered + " · caminho " +
            path.join(" → ") + ", " + (path.length - 1) + " saltos"
          : "Perdidos/descartados: " + antes.lost + " → " + state.lost + " · caminho " +
            path.join(" → ") + ", descartado antes de chegar",
        porque: exp.porque, olhe: exp.olhe
      });
      updateNav();
    }

    function renderStage4() {
      var rows = Object.keys(state.vectors).map(function (n) {
        var v = state.vectors[n];
        var txt = v === "local" ? "local (é a rede dela)" :
          (v.c >= INFC ? "∞ (sem rota)" : "enlace " + v.l + ", custo " + v.c);
        return '<tr data-router="' + n + '"><td>' + n + "</td><td data-vec>" + txt + "</td></tr>";
      }).join("");
      els.area.innerHTML = renderSvg({}) +
        '<table class="demo-cr-table demo-cr-vectors"><caption>Rota de cada roteador para a ' +
        "<strong>rede de C</strong> (destino do servidor)</caption>" +
        "<thead><tr><th>Roteador</th><th>Próximo salto</th></tr></thead><tbody>" + rows +
        "</tbody></table>" +
        '<p class="demo-cr-round" data-converged="' + state.converged + '">Tabelas: <strong>' +
        (state.converged ? "estáveis" : "instáveis (troque tabelas até convergir)") +
        "</strong> · rodadas de troca: " + state.rounds + "</p>";
      els.controls.innerHTML =
        '<button type="button" class="btn btn-secondary demo-cr-break"' +
        (state.linkDown ? " disabled" : "") + ">💥 Derrubar enlace 2 (B-C)</button>" +
        '<button type="button" class="btn btn-secondary demo-cr-exchange">🔁 Trocar tabelas ' +
        "(1 rodada)</button>" +
        '<button type="button" class="btn demo-cr-test">✉️ Testar entrega (A → servidor)</button>';
      els.controls.querySelector(".demo-cr-break").addEventListener("click", function () {
        var antes = tutor.retrato();
        var rotasAntes = retratoVetores();
        state.linkDown = true;
        state.converged = false;
        state.vectors.B = { l: 2, c: INFC };
        log("💥 Enlace 2 (B-C) caiu. B marca a rota pela saída 2 com <strong>custo ∞</strong> " +
          "(ações Envia/Recebe do RIP). Teste uma entrega agora, e depois troque tabelas.");
        renderStage4();
        tutor.passoFeito("derrubar");
        tutor.efeito({
          acao: "Você derrubou o enlace 2, que era por onde B alcançava a rede de C.",
          antes: antes,
          numeros: mudancasDeRota(rotasAntes).join(" · "),
          porque: "B percebeu a queda do enlace vizinho e marcou com custo infinito a rota " +
            "que passava por ali. Só B sabe disso neste instante, e A continua achando que " +
            "chega ao destino por B, com custo 2.",
          olhe: "a tabela de rotas, em que só a linha de B mudou. As outras quatro ainda " +
            "descrevem uma rede que não existe mais, e a próxima entrega vai mostrar o que " +
            "isso custa."
        });
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

    /* Placar dos dois protocolos: a etapa promete "os MESMOS acidentes, finais
       diferentes", e sem guardar o que a aplicação leu no envio anterior a
       comparação viraria exercício de memória, como era na etapa 2. */
    function renderPlacar5() {
      var linhas = ["udp", "tcp"].map(function (m) {
        var r = state.leituras[m];
        if (!r) {
          return '<tr class="is-pendente"><td>' + m.toUpperCase() +
            "</td><td>ainda não enviado</td><td>?</td></tr>";
        }
        return "<tr><td>" + m.toUpperCase() + '</td><td><code>«' + r.texto +
          "»</code></td><td>" + r.distintos + " de " + FRAGS.length +
          (r.intacto ? ", em ordem" : ", com falha") + "</td></tr>";
      }).join("");
      /* Antes do primeiro envio a legenda não nomeia os fragmentos, senão
         entrega a resposta da previsão. Depois ela nomeia, porque aí a
         afirmação "os mesmos acidentes" precisa ser verificável. */
      var legenda = state.leituras.udp || state.leituras.tcp
        ? "Nos dois envios o fragmento " + state.lostFrag + " se perde numa fila cheia e o " +
          "fragmento " + state.dupFrag + " chega duas vezes"
        : "Os dois envios enfrentam os mesmos acidentes, com um fragmento perdido numa " +
          "fila cheia e outro chegando duas vezes";
      return '<table class="demo-cr-table demo-cr-placar"><caption>' + legenda +
        "</caption><thead><tr><th>Protocolo</th>" +
        "<th>O que a aplicação leu</th><th>Fragmentos</th></tr></thead><tbody>" +
        linhas + "</tbody></table>";
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
        '<p class="demo-cr-apptext">O que a aplicação leu: <strong data-apptext data-intact="">n/d' +
        "</strong></p></div>" + renderPlacar5();
      renderControls5();
    }

    function explicarEnvio5(mode) {
      if (mode === "udp") {
        return {
          numeros: null,   // o diff automático já conta a perda e a duplicata
          porque: "o IP entregou no melhor esforço, com um fragmento descartado numa fila " +
            "cheia e outro chegando em dobro por causa de uma retransmissão. O UDP repassou " +
            "à aplicação o que chegou, na ordem em que chegou.",
          olhe: 'a linha "O que a aplicação leu", com a lacuna do fragmento perdido e o ' +
            "pedaço repetido. É exatamente o texto que o programa receberia."
        };
      }
      var udp = state.leituras.udp;
      return {
        numeros: udp
          ? "Fragmentos entregues à aplicação: " + udp.distintos + " de " + FRAGS.length +
            " no UDP → " + FRAGS.length + " de " + FRAGS.length + " no TCP"
          : "Fragmentos entregues à aplicação: " + FRAGS.length + " de " + FRAGS.length,
        porque: "os acidentes foram os mesmos, porque a rede não mudou. O que mudou está " +
          "nas pontas, com o número de sequência que ordena e denuncia a repetição, a " +
          "confirmação que revela a falta e a retransmissão que a repara.",
        olhe: "os contadores de perdidos e de duplicatas, que subiram neste envio também. " +
          "A rede continuou errando do começo ao fim, e ainda assim a aplicação leu a " +
          "mensagem inteira."
      };
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
        '<span class="demo-cr-modes-done">enviado com: UDP ' + (state.sentUdp ? "✓" : "✗") +
        " · TCP " + (state.sentTcp ? "✓" : "✗") + "</span>";
      els.controls.querySelectorAll('[name="demo-cr-mode"]').forEach(function (rb) {
        rb.addEventListener("change", function () { state.mode = rb.value; });
      });
      els.controls.querySelector(".demo-cr-send5").addEventListener("click", sendStage5);
    }

    function slotEl(f) { return els.area.querySelector('[data-slot="' + f + '"]'); }

    function sendStage5() {
      if (state.busy) return;
      var antes = tutor.retrato();
      state.busy = true;
      renderStage5();
      tutor.aguardar("Enviando os " + FRAGS.length + " fragmentos. Esta faixa conta o que a " +
        "aplicação recebeu assim que o último chegar.");
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
              log("👯 Fragmento " + ev.frag + " chegou DE NOVO: o UDP entrega a duplicata à aplicação.");
            } else {
              log("🗑️ Fragmento " + ev.frag + " chegou de novo, mesmo nº de sequência: " +
                "<strong>duplicata descartada</strong> pelo TCP.");
            }
            return;
          }
          if (mode === "udp") {
            appOrder.push(ev.frag);
            s.classList.add("is-rx");
            log("📥 Fragmento " + ev.frag + " chegou: UDP repassa à aplicação na hora.");
          } else {
            buffered[ev.frag] = true;
            s.classList.add("is-buf");
            var gap = ev.frag > deliveredUpTo + 1;
            log("📥 Fragmento " + ev.frag + " chegou" + (gap
              ? " fora de ordem: fica no <strong>buffer</strong> esperando a lacuna."
              : ": em ordem, entregue e <strong>confirmado</strong>."));
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
            " no prazo: o remetente <strong>retransmite</strong>.");
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
        var distintos = appOrder.filter(function (f, i) {
          return appOrder.indexOf(f) === i;
        }).length;
        var out = els.area.querySelector("[data-apptext]");
        out.textContent = "«" + (text || "(nada)") + "»" + (intact ? "" :
          " (fora de ordem, com lacuna ou duplicata)");
        out.setAttribute("data-intact", String(intact));
        els.area.querySelector(".demo-cr-slots").setAttribute("data-done", "1");
        state.leituras[mode] = { texto: text, intacto: intact, distintos: distintos };
        if (mode === "udp") {
          state.sentUdp = true;
          log("📄 UDP entregou o que chegou, como chegou: <strong>«" + text + "»</strong>. " +
            "Rápido e barato, mas a aplicação que se vire.");
        } else {
          state.sentTcp = true;
          state.tcpIntact = intact;
          bump("delivered");
          log("📄 TCP entregou <strong>«" + text + "»</strong>, íntegra e em ordem. A rede " +
            "continuou perdendo e duplicando; quem consertou foram <strong>as pontas</strong>.");
        }
        state.busy = false;
        /* Só os controles e o placar: as caixinhas dos fragmentos e a linha do
           que a aplicação leu ficam como estão, senão o resultado que o aluno
           acabou de assistir sumiria da tela. */
        var placar = els.area.querySelector(".demo-cr-placar");
        if (placar) placar.outerHTML = renderPlacar5();
        renderControls5();
        tutor.passoFeito(mode);
        var exp = explicarEnvio5(mode);
        tutor.efeito({
          acao: mode === "udp"
            ? "Você enviou a mensagem com UDP."
            : "Você enviou a MESMA mensagem com TCP.",
          antes: antes, numeros: exp.numeros, porque: exp.porque, olhe: exp.olhe
        });
        updateNav();
      }, (t += 700));
    }

    /* ============ Etapas ============ */

    var STAGES = [
      {
        title: "Etapa 1: Empacotar (encapsulamento)",
        instructions: "O navegador em 10.1.0.5 quer pedir uma página ao servidor 10.5.0.80. " +
          "Monte o pacote clicando as camadas de cima para baixo, porque cada uma embrulha " +
          "a que veio antes.",
        goalText: "Meta: fechar o quadro completo (4 camadas na ordem certa).",
        aguardando: "Clique numa camada e esta faixa conta o que ela embrulhou e por quê.",
        conceito: "encapsulamento",
        passos: [
          { id: "primeira", texto: 'Clique em "Mensagem da aplicação", a primeira da lista' },
          { id: "fechar", texto: "Siga para baixo até fechar o quadro Ethernet" }
        ],
        previsao: {
          pergunta: "quando este pacote for transmitido, qual das quatro camadas entra " +
            "primeiro no fio?",
          opcoes: [
            {
              rotulo: "a mensagem da aplicação",
              veredito: "A mensagem da aplicação é a primeira a ser montada e a última a " +
                "aparecer, porque viaja no meio de todos os envelopes."
            },
            {
              rotulo: "o cabeçalho TCP",
              veredito: "O cabeçalho TCP é o segundo envelope de dentro para fora, e no fio " +
                "ele vem depois do quadro Ethernet e do cabeçalho IP."
            },
            {
              rotulo: "o quadro Ethernet",
              correta: true,
              veredito: "O último envelope fechado é o primeiro a sair. Quem recebe começa " +
                "lendo o cabeçalho Ethernet e vai abrindo um envelope de cada vez, de fora " +
                "para dentro."
            }
          ]
        },
        setup: function () {
          if (state.wrapped.length !== LAYERS.length) state.wrapped = [];
        },
        render: renderStage1,
        marcar: function () {
          if (state.wrapped.length >= 1) tutor.passoFeito("primeira");
          if (state.wrapped.length === LAYERS.length) tutor.passoFeito("fechar");
        },
        goalMet: function () { return state.wrapped.length === LAYERS.length; }
      },
      {
        title: "Etapa 2: Entrega local (mesma Ethernet)",
        instructions: "Antes de cruzar o mundo, um destino na MESMA rede local. Não há " +
          "roteamento a fazer, mas o cliente conhece só o IP do destino, e o quadro precisa " +
          "de um endereço MAC.",
        goalText: "Meta: enviar 2 vezes (a segunda sem precisar de ARP).",
        aguardando: "Envie o arquivo e esta faixa conta quantos quadros o envio gastou.",
        conceito: "arp-e-cache-arp",
        passos: [
          { id: "envio1", texto: 'Clique em "✉️ Enviar arquivo para 10.1.0.7" e acompanhe o ARP' },
          { id: "envio2", texto: "Envie de novo e compare os dois envios no placar" }
        ],
        previsao: {
          pergunta: "o mesmo arquivo vai para o mesmo destino duas vezes. O segundo envio " +
            "coloca no fio:",
          opcoes: [
            {
              rotulo: "os mesmos quadros do primeiro",
              veredito: "O ARP não se repete. O par (IP, MAC) descoberto no primeiro envio " +
                "ficou guardado no cache."
            },
            {
              rotulo: "um quadro a menos",
              veredito: "Saem dois a menos, porque o ARP custa dois quadros, a pergunta em " +
                "difusão e a resposta de quem se reconhece."
            },
            {
              rotulo: "só o quadro de dados",
              correta: true,
              veredito: "O cache ARP responde no lugar da rede, e os dois quadros de ARP " +
                "desaparecem. De 3 quadros no fio para 1."
            }
          ]
        },
        setup: function () { state.busy = false; },
        render: renderStage2,
        marcar: function () {
          if (state.sends >= 1) tutor.passoFeito("envio1");
          if (state.sends >= 2) tutor.passoFeito("envio2");
        },
        goalMet: function () { return state.sends >= 2; }
      },
      {
        title: "Etapa 3: Seja o roteador",
        instructions: "Agora o pacote cruza a inter-rede. Em cada roteador, leia a tabela e " +
          "escolha o enlace de saída. Ninguém conhece o caminho inteiro, só o próximo salto.",
        goalText: "Meta: entregar os 3 pacotes (o último só sai pela rota padrão).",
        aguardando: "Escolha um enlace e esta faixa conta o que a tabela mandou fazer.",
        conceito: "proximo-salto-e-rota-padrao",
        passos: [
          { id: "pacote1", texto: "Encaminhe o pacote 1 até a rede 10.5, um enlace por vez" },
          { id: "pacote2", texto: "Faça o mesmo com o pacote 2, que parte de C" },
          { id: "pacote3", texto: "Encaminhe o pacote 3, cujo destino não está em tabela nenhuma" }
        ],
        previsao: {
          pergunta: "o pacote 1 vai para a rede 10.5 e está em A, que tem saída pelo enlace " +
            "1 (para B) e pelo enlace 3 (para D). Por onde ele sai?",
          opcoes: [
            {
              rotulo: "pelo enlace 1",
              correta: true,
              veredito: "A tabela de A tem uma linha para a rede 10.5, e ela diz enlace 1. A " +
                "decisão inteira cabe nessa linha."
            },
            {
              rotulo: "pelo enlace 3, que parece mais perto",
              veredito: "O desenho engana. Quem decide é a linha da tabela, e a de A manda " +
                "pelo enlace 1, para B."
            },
            {
              rotulo: "não dá para saber sem conhecer o caminho inteiro",
              veredito: "Dá para saber, e é a lição da etapa. A tabela de A não conhece o " +
                "caminho inteiro e mesmo assim decide, porque ela precisa só do próximo salto."
            }
          ]
        },
        setup: function () {
          if (state.roundIdx === 0 && state.packetAt === null) {
            state.packetAt = ROUNDS[0].start;
            log("▶ " + ROUNDS[0].label);
          }
          state.hops = 0;
          metric("hops", 0);
        },
        render: renderStage3,
        marcar: function () {
          for (var i = 1; i <= state.delivered3; i++) tutor.passoFeito("pacote" + i);
        },
        goalMet: function () { return state.delivered3 >= ROUNDS.length; }
      },
      {
        title: "Etapa 4: A rede muda (falha e reconvergência)",
        instructions: "A rota preferida para o servidor passa pelo enlace 2 (B-C). Derrube-o, " +
          "teste uma entrega no meio do caos, troque tabelas até convergir e entregue de novo.",
        goalText: "Meta: derrubar o enlace 2, reconvergir as tabelas e entregar por rota alternativa.",
        aguardando: "Mexa em um controle e esta faixa conta o que aconteceu com as tabelas.",
        conceito: "vetor-de-distancia-e-convergencia",
        passos: [
          { id: "derrubar", texto: 'Clique em "💥 Derrubar enlace 2 (B-C)"' },
          { id: "testar-caos", texto: 'Clique em "✉️ Testar entrega" ANTES de trocar tabelas' },
          { id: "trocar", texto: 'Clique em "🔁 Trocar tabelas" até a linha dizer estáveis' },
          { id: "testar-ok", texto: "Teste a entrega de novo e compare o caminho" }
        ],
        previsao: {
          pergunta: "depois da queda do enlace 2, quantas rodadas de troca até a demo " +
            "declarar as tabelas estáveis?",
          opcoes: [
            {
              rotulo: "1",
              veredito: "A primeira rodada já conserta as rotas de A e de B, e ninguém sabe " +
                "disso ainda. Falta a rodada que não muda nada."
            },
            {
              rotulo: "2",
              correta: true,
              veredito: "A primeira conserta as rotas de A e de B. A segunda não muda nada, " +
                "e é por não mudar nada que a convergência pode ser declarada."
            },
            {
              rotulo: "5 ou mais",
              veredito: "Nesta rede de cinco roteadores bastam 2. A convergência lenta do " +
                "vetor de distância aparece quando a notícia precisa atravessar muitos vizinhos."
            }
          ]
        },
        setup: function () { if (!state.vectors) initVectors(); },
        render: renderStage4,
        marcar: function () {
          if (state.linkDown) tutor.passoFeito("derrubar");
          if (state.testouNoCaos) tutor.passoFeito("testar-caos");
          if (state.linkDown && state.converged) tutor.passoFeito("trocar");
          if (state.deliveredAfterConv) tutor.passoFeito("testar-ok");
        },
        goalMet: function () { return state.linkDown && state.converged && state.deliveredAfterConv; }
      },
      {
        title: "Etapa 5: Melhor esforço × TCP",
        instructions: "Uma mensagem de 4 fragmentos enfrenta a rede real, com perda, desordem " +
          "e duplicata. Envie com UDP e depois com TCP. Os acidentes são os mesmos, e os " +
          "finais são diferentes.",
        goalText: "Meta: enviar com UDP e com TCP (e receber a mensagem íntegra no TCP).",
        aguardando: "Envie a mensagem e esta faixa conta o que a aplicação recebeu.",
        conceito: "entrega-confiavel-sobre-melhor-esforco",
        passos: [
          { id: "udp", texto: 'Com "UDP" marcado, clique em "📨 Enviar mensagem"' },
          { id: "tcp", texto: 'Marque "TCP" e envie a MESMA mensagem de novo' }
        ],
        previsao: {
          pergunta: "a mensagem tem 4 fragmentos, um se perde numa fila cheia e outro chega " +
            "duas vezes. No UDP, o que a aplicação vai receber?",
          opcoes: [
            {
              rotulo: "os 4, em ordem",
              veredito: "Isso é o que o TCP entrega. O UDP repassa o que chegar, do jeito " +
                "que chegar."
            },
            {
              rotulo: "3, e um deles duas vezes",
              correta: true,
              veredito: "O UDP não numera, não confirma e não retransmite. O que se perdeu " +
                "não volta, e o que chegou em dobro sobe em dobro para a aplicação."
            },
            {
              rotulo: "3, em ordem e sem repetição",
              veredito: "Ordenar e descartar repetição é trabalho de quem numera os pedaços, " +
                "e o UDP não faz isso."
            }
          ]
        },
        setup: function () { state.busy = false; },
        render: renderStage5,
        marcar: function () {
          if (state.sentUdp) tutor.passoFeito("udp");
          if (state.sentTcp) tutor.passoFeito("tcp");
        },
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
          (state.stage < STAGES.length ? ", avance!" : "") + "</strong>"
        : "");
      if (state.stage === STAGES.length && st.goalMet()) els.summary.hidden = false;
      metric("hops", state.hops);
    }

    function gotoStage(n) {
      state.stage = n;
      var st = STAGES[n - 1];
      els.title.innerHTML = "<strong>" + st.title + "</strong>";
      els.instructions.textContent = st.instructions;
      log("▶ " + st.title);
      st.setup();
      st.render();
      tutor.abrirEtapa({
        passos: st.passos,
        previsao: st.previsao,
        conceito: st.conceito,
        aguardando: st.aguardando
      });
      /* Voltar para uma etapa já cumprida não pode devolver os passos em
         branco: o que o aluno fez continua feito, e a lista precisa dizer isso. */
      st.marcar();
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
