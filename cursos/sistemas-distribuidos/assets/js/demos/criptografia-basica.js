/* ============================================================
   demos/criptografia-basica.js — Demo "Mallory na Linha"
   ------------------------------------------------------------
   Demonstração interativa do Tópico 7 (Segurança): o aluno
   começa do lado errado da linha — grampeia a rede e executa
   os ataques do capítulo (lê um cartão em claro, injeta uma
   mensagem falsa, altera uma ordem em trânsito) —, liga a cifra
   simétrica e descobre as duas rachaduras que sobram (a chave
   viajou em claro; o replay paga duas vezes), fabrica um par RSA
   de brinquedo com os números do próprio livro (13×17=221, d=5,
   c=77) e vê o fatorador engasgar com dígitos maiores, vira
   vítima do homem no meio até derrotá-lo com assinatura e
   certificado, e fecha montando o aperto de mãos do TLS peça por
   peça — quando o cadeado acende, o grampo só mostra ruído.
   Plano e fundamentação:
   docs/demos/2026-07-18-demo-criptografia-basica-plano.md

   NOTA DE HONESTIDADE: TODAS as cifras aqui são de BRINQUEDO,
   inseguras de propósito. O RSA usa os inteiros minúsculos do
   próprio livro; a "cifra simétrica" e o "resumo" são
   transformações visuais reversíveis, não AES/SHA. O fatorador
   é um medidor ilustrativo do crescimento exponencial (marcos
   512/768/2.048 bits vêm do texto). Nada aqui é referência de
   implementação de segurança — o painel final repete isso.

   Determinismo (Playwright): ?demo-seed=<int> fixa o PRNG
   (mulberry32; sorteios: mensagem no fio, nonces exibidos,
   embaralhamento das peças do handshake); ?demo-fast=1 acelera
   animações e contadores.
   Namespace: SD.demos["criptografia-basica"]
   ============================================================ */

window.SD = window.SD || {};
SD.demos = SD.demos || {};

SD.demos["criptografia-basica"] = (function () {
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

  /* ---- Aritmética modular exata (os números do livro cabem em double) ---- */
  function modpow(base, exp, mod) {
    base = base % mod; var r = 1;
    while (exp > 0) {
      if (exp & 1) r = (r * base) % mod;
      exp = Math.floor(exp / 2);
      base = (base * base) % mod;
    }
    return r;
  }
  function modinv(a, m) {
    a = ((a % m) + m) % m;
    for (var x = 1; x < m; x++) if ((a * x) % m === 1) return x;
    return null;
  }
  /* Resumo de BRINQUEDO: determinístico, em [0,220], muda com qualquer byte. */
  function digest(s) {
    var h = 7;
    for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 221;
    return h;
  }

  /* ---- Mensagens de Alice na etapa 1 (didáticas) ---- */
  var MESSAGES = [
    { kind: "recado", text: "Oi Bob! Almoço às 12h?" },
    { kind: "cartao", text: "Cartão 4131 9822 5570 3316" },
    { kind: "pagamento", text: "Pagar R$ 500 ao fornecedor", amount: 500 }
  ];

  /* ---- Peças do aperto de mãos TLS (etapa 5) ---- */
  var TLS_STEPS = [
    { id: "hello", name: "Olá — negociar o conjunto de cifras",
      why: "cliente e servidor combinam versão e algoritmos ANTES de qualquer " +
        "segredo. Nada aqui é secreto ainda." },
    { id: "cert", name: "Certificado do servidor (validado na AC pré-instalada)",
      why: "a chave pública do servidor só vale depois de conferida contra a " +
        "autoridade que já veio de fábrica — senão você a pegaria de Mallory." },
    { id: "premaster", name: "Segredo pré-mestre cifrado com a chave do certificado",
      why: "só faz sentido DEPOIS de validar o certificado: mandá-lo antes " +
        "entregaria o segredo ao homem no meio." },
    { id: "session", name: "Derivar as chaves de sessão (uma por direção)",
      why: "as chaves simétricas nascem do pré-mestre — é preciso ter o " +
        "pré-mestre primeiro." },
    { id: "changecipher", name: "Trocar a especificação de cifra (ChangeCipherSpec)",
      why: "a partir daqui tudo viaja cifrado; anunciar isso antes de ter as " +
        "chaves não faz sentido." },
    { id: "appdata", name: "Dados da aplicação: MAC + cifra simétrica",
      why: "o volume viaja com chave simétrica (rápida) e um MAC por registro " +
        "(integridade). A assimétrica ficou só na abertura." }
  ];

  function mount(container) {
    var params = new URLSearchParams(window.location.search);
    var seed = parseInt(params.get("demo-seed"), 10);
    var rand = isNaN(seed) ? Math.random : mulberry32(seed);
    var timeScale = params.get("demo-fast") ? 0.12 : 1;
    var startedAt = Date.now();

    /* Parâmetros fixos do RSA de brinquedo (números do livro) */
    var RSA = { P: 13, Q: 17, N: 221, Z: 192, d: 5, c: 77 };

    function pickMsg() { return MESSAGES[Math.floor(rand() * MESSAGES.length)]; }
    function nonce() { return 1000 + Math.floor(rand() * 9000); }

    var state = {
      stage: 1,
      /* etapa 1 */
      s1: { wire: pickMsg(), intercepted: false, injected: false, altered: false,
            inbox: [] },
      /* etapa 2 */
      s2: { cipherOn: false, tamperDetected: false, keyExposed: false,
            replaySeen: false, nonceOn: false, replayBlocked: false,
            payCount: 0, lastNonce: null, busy: false },
      /* etapa 3 */
      s3: { msg: 88, cipher: null, decrypted: null, roundTrip: false,
            factored: false, bits: 16, sawGrowth: false, busy: false },
      /* etapa 4 */
      s4: { mitmSeen: false, signed: false, sig: null,
            doc: "Transferir R$ 500 para Bob", tampered: false,
            sigTamperSeen: false, certOn: false, certBlocked: false, busy: false },
      /* etapa 5 */
      s5: { placed: [], order: null, wrongSeen: false, lockOn: false,
            everLocked: false, busy: false }
    };

    function to(fn, ms) {
      setTimeout(function () { if (container.isConnected) fn(); }, ms * timeScale);
    }

    /* ============ Estrutura da interface ============ */

    container.innerHTML =
      '<div class="demo-cf demo-sg">' +
      '  <div class="demo-cf-head">' +
      '    <span class="badge demo-cf-badge">Demonstração</span>' +
      '    <p class="demo-cf-title"></p>' +
      '    <p class="demo-cf-instructions"></p>' +
      '    <p class="demo-cf-goal"></p>' +
      '  </div>' +
      '  <div class="demo-sg-stage-area"></div>' +
      '  <div class="demo-cf-controls demo-sg-controls"></div>' +
      '  <div class="demo-cf-summary callout" hidden></div>' +
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
      area: container.querySelector(".demo-sg-stage-area"),
      controls: container.querySelector(".demo-sg-controls"),
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

    /* Palco da rede compartilhado pelas etapas 1, 2 e 5 */
    function stageNet(opts) {
      /* opts: { wireLabel, wireClass, tapLabel, tapClass, bob } */
      return '<div class="demo-sg-net">' +
        '  <div class="demo-sg-node demo-sg-alice"><span class="demo-sg-face">👩</span>' +
        '<span class="demo-sg-name">Alice</span></div>' +
        '  <div class="demo-sg-wire">' +
        '    <div class="demo-sg-wire-msg ' + (opts.wireClass || "") + '">' +
        (opts.wireLabel || "") + "</div>" +
        '    <div class="demo-sg-tap ' + (opts.tapClass || "") + '">' +
        '      <span class="demo-sg-face">🕵️</span>' +
        '      <span class="demo-sg-tap-label">' + (opts.tapLabel || "") + "</span>" +
        "    </div>" +
        "  </div>" +
        '  <div class="demo-sg-node demo-sg-bob"><span class="demo-sg-face">🧔</span>' +
        '<span class="demo-sg-name">Bob</span></div>' +
        "</div>" +
        (opts.bob || "");
    }

    /* ============ Etapa 1 — Escute a rede ============ */

    function renderStage1() {
      var s = state.s1;
      var tapClass = s.intercepted ? "is-reading" : "";
      var tapLabel = s.intercepted
        ? "Eve lê em claro: <strong>" + s.wire.text + "</strong>"
        : "Eve no grampo — clique em <em>Interceptar</em>";
      var inboxHtml = s.inbox.length
        ? s.inbox.map(function (m) {
            return '<li data-forged="' + (m.forged ? "true" : "false") +
              '">📥 ' + m.text + " <span class=\"demo-sg-tag\">" + m.tag + "</span></li>";
          }).join("")
        : "<li><em>nada recebido ainda</em></li>";
      els.area.innerHTML =
        stageNet({
          wireLabel: "✉️ " + s.wire.text,
          wireClass: "is-clear",
          tapLabel: tapLabel,
          tapClass: tapClass,
          bob: '<div class="demo-sg-inbox"><p class="demo-sg-inbox-title">📬 Caixa de ' +
            "entrada de Bob (ele confia em tudo que “parece” da Alice):</p><ul>" +
            inboxHtml + "</ul></div>"
        }) +
        '<dl class="demo-cf-metrics">' +
        '  <div><dt>Ataques executados</dt><dd data-attacks>' +
        [s.intercepted, s.injected, s.altered].filter(Boolean).length + "/3</dd></div>" +
        '  <div><dt>Intromissão</dt><dd data-a-int>' +
        (s.intercepted ? "✓" : "—") + "</dd></div>" +
        '  <div><dt>Mascaramento</dt><dd data-a-inj>' +
        (s.injected ? "✓" : "—") + "</dd></div>" +
        '  <div><dt>Falsificação</dt><dd data-a-alt>' +
        (s.altered ? "✓" : "—") + "</dd></div>" +
        "</dl>";
      els.controls.innerHTML =
        '<button type="button" class="btn-ghost demo-sg-next-msg">▶ Alice envia outra mensagem</button>' +
        '<button type="button" class="btn demo-sg-intercept">🔎 Interceptar (ler o tráfego)</button>' +
        '<button type="button" class="btn demo-sg-inject">✉️ Injetar mensagem forjada</button>' +
        '<button type="button" class="btn demo-sg-alter">✂️ Alterar em trânsito</button>';
      els.controls.querySelector(".demo-sg-next-msg").addEventListener("click", function () {
        s.wire = pickMsg();
        log("📨 Alice pôs outra mensagem no fio: <strong>" + s.wire.text +
          "</strong> (em claro).");
        renderStage1();
      });
      els.controls.querySelector(".demo-sg-intercept").addEventListener("click", function () {
        s.intercepted = true;
        log("👁️ <strong>Intromissão</strong> (classe: <em>vazamento</em>): você grampeou " +
          "o fio e leu <strong>" + s.wire.text + "</strong> sem tocar em nada. Numa rede " +
          "insegura, o tráfego em claro é público.");
        renderStage1(); updateNav();
      });
      els.controls.querySelector(".demo-sg-inject").addEventListener("click", function () {
        s.injected = true;
        s.inbox.unshift({ text: "Pague R$ 9.000 à conta 0007", forged: true,
          tag: "“de Alice” (forjada)" });
        log("🎭 <strong>Mascaramento</strong> (classe: <em>falsificação</em>): você forjou " +
          "uma mensagem <em>“de Alice”</em> e Bob a aceitou como genuína — o remetente é " +
          "forjável quando nada autentica a origem.");
        renderStage1(); updateNav();
      });
      els.controls.querySelector(".demo-sg-alter").addEventListener("click", function () {
        s.altered = true;
        var before = s.wire.text, after;
        if (s.wire.kind === "pagamento") {
          after = "Pagar R$ 9.000 ao fornecedor";
        } else {
          after = s.wire.text + " …EXCETO: envie tudo a Eve";
        }
        s.wire = { kind: s.wire.kind, text: after, amount: 9000 };
        s.inbox.unshift({ text: after, forged: true, tag: "alterada em trânsito" });
        log("✂️ <strong>Falsificação de mensagem</strong> (classe: <em>adulteração/" +
          "vandalismo</em>): você alterou a mensagem em trânsito — de “" + before +
          "” para “<strong>" + after + "</strong>”. Bob não percebe: nada garante a " +
          "integridade.");
        renderStage1(); updateNav();
      });
    }

    /* ============ Etapa 2 — Cifre e feche as rachaduras ============ */

    function scramble(text) {
      /* "cifra" de brinquedo: só para o grampo ver ruído (NÃO é AES). */
      var out = "";
      for (var i = 0; i < text.length; i++) {
        out += "▓▒░◆◇▪▫"[(text.charCodeAt(i) + i) % 7];
      }
      return out;
    }

    function crackRow(label, open) {
      return '<li data-open="' + (open ? "true" : "false") + '">' +
        (open ? "🔴 EM ABERTO" : "🟢 fechada") + " — " + label + "</li>";
    }

    function renderStage2() {
      var s = state.s2;
      var wireLabel = s.cipherOn
        ? "🔐 {" + scramble("Pagar R$ 500") + "}<sub>K<sub>AB</sub></sub>"
        : "✉️ Pagar R$ 500 ao fornecedor";
      var tapLabel = s.keyExposed
        ? "Mallory tem K<sub>AB</sub> — lê tudo <strong>de novo</strong>: “Pagar R$ 500”"
        : (s.cipherOn ? "Eve só vê <strong>texto cifrado</strong> (ruído)"
                      : "Eve lê em claro");
      els.area.innerHTML =
        stageNet({
          wireLabel: wireLabel,
          wireClass: s.cipherOn && !s.keyExposed ? "is-cipher" : "is-clear",
          tapLabel: tapLabel,
          tapClass: s.cipherOn && !s.keyExposed ? "is-blind" : "is-reading"
        }) +
        '<div class="demo-sg-cracks">' +
        '  <p class="demo-sg-cracks-title">Rachaduras que a cifra <em>não</em> fecha:</p>' +
        "  <ul>" +
        crackRow("Distribuição da chave — como K<sub>AB</sub> chegou até Bob?" +
          (s.keyExposed ? " <em>(demonstrada: a chave viajou em claro!)</em>" : "") +
          " — só a chave pública fecha (etapa 3)", true) +
        crackRow("Repetição (replay) — reenviar a mensagem cifrada sem ter a chave",
          !s.replayBlocked) +
        "  </ul>" +
        "</div>" +
        '<dl class="demo-cf-metrics">' +
        '  <div><dt>Cifra simétrica</dt><dd data-cipher>' + (s.cipherOn ? "ligada" : "—") +
        "</dd></div>" +
        '  <div><dt>Bob pagou</dt><dd data-paycount>' + s.payCount + "×</dd></div>" +
        '  <div><dt>Nonce/frescor</dt><dd data-nonce>' + (s.nonceOn ? "ligado" : "—") +
        "</dd></div>" +
        "</dl>";
      els.controls.innerHTML =
        '<label><input type="checkbox" class="demo-sg-cipher"' +
        (s.cipherOn ? " checked" : "") + (s.busy ? " disabled" : "") +
        "> 🔐 Ligar cifra simétrica (K<sub>AB</sub>)</label>" +
        '<button type="button" class="btn demo-sg-tamper"' +
        (!s.cipherOn || s.busy ? " disabled" : "") +
        ">✂️ Tentar adulterar o texto cifrado</button>" +
        '<button type="button" class="btn btn-secondary demo-sg-keyq"' +
        (!s.cipherOn || s.busy ? " disabled" : "") +
        ">🔑 E como K<sub>AB</sub> chegou a Bob?</button>" +
        '<button type="button" class="btn btn-secondary demo-sg-replay"' +
        (!s.cipherOn || s.busy ? " disabled" : "") +
        ">📼 Mallory reenvia o pagamento cifrado</button>" +
        '<label><input type="checkbox" class="demo-sg-nonce"' +
        (s.nonceOn ? " checked" : "") + (s.busy ? " disabled" : "") +
        "> 🎫 Ligar nonce / carimbo de tempo</label>";
      els.controls.querySelector(".demo-sg-cipher").addEventListener("change", function (ev) {
        s.cipherOn = ev.target.checked;
        log(s.cipherOn
          ? "🔐 Cifra simétrica <strong>ligada</strong>: Alice e Bob compartilham " +
            "K<sub>AB</sub>. O grampo de Eve passa a ver só texto cifrado — segredo " +
            "e integridade protegidos pela soma de verificação."
          : "🔓 Cifra desligada: de volta ao texto em claro.");
        renderStage2(); updateNav();
      });
      els.controls.querySelector(".demo-sg-tamper").addEventListener("click", function () {
        s.tamperDetected = true;
        log("🛡️ Você mexeu num byte do texto cifrado. Ao decifrar, Bob obteve " +
          "<strong>lixo</strong> e a <strong>soma de verificação não bate</strong> — " +
          "adulteração detectada e descartada. Injetar/alterar deixou de funcionar.");
        renderStage2(); updateNav();
      });
      els.controls.querySelector(".demo-sg-keyq").addEventListener("click", keyScene2);
      els.controls.querySelector(".demo-sg-replay").addEventListener("click", replayScene2);
      els.controls.querySelector(".demo-sg-nonce").addEventListener("change", function (ev) {
        s.nonceOn = ev.target.checked;
        log(s.nonceOn
          ? "🎫 Nonce/carimbo de tempo <strong>ligado</strong>: cada mensagem carrega uma " +
            "marca de frescor de uso único; Bob recusa marcas já vistas."
          : "🎫 Frescor desligado.");
        renderStage2(); updateNav();
      });
    }

    function keyScene2() {
      var s = state.s2;
      if (s.busy) return;
      s.busy = true; renderStage2();
      log("🔑 Cena: “e como K<sub>AB</sub> chegou até Bob?” Alice precisa mandá-la de " +
        "algum jeito…");
      to(function () {
        log("📡 …e a única via é a MESMA rede insegura: <strong>K<sub>AB</sub> viaja em " +
          "claro</strong>. Mallory, no grampo, copia a chave.");
      }, 700);
      to(function () {
        s.keyExposed = true; s.busy = false;
        log("💥 Com K<sub>AB</sub> em mãos, Mallory <strong>volta a ler tudo</strong>. " +
          "Cifrar não resolveu a <strong>distribuição da chave</strong> — é o que a " +
          "chave pública vai consertar (etapa 3).");
        if (state.stage === 2) renderStage2();
        updateNav();
      }, 1400);
    }

    function replayScene2() {
      var s = state.s2;
      if (s.busy) return;
      s.busy = true; s.payCount = 0; renderStage2();
      var n = nonce();
      log("💳 Alice envia “Pagar R$ 500” cifrada" +
        (s.nonceOn ? " com nonce <code>#" + n + "</code>" : "") + ". Bob paga uma vez.");
      to(function () {
        s.payCount += 1;
        if (state.stage === 2) renderStage2();
        log("📼 Mallory NÃO tem a chave — mas <strong>copia os bits cifrados</strong> e os " +
          "reenvia. É o ataque de <strong>repetição</strong>.");
      }, 800);
      to(function () {
        if (s.nonceOn) {
          s.replayBlocked = true;
          log("🎫 A cópia chega com o nonce <code>#" + n + "</code> — que Bob JÁ viu. " +
            "<strong>Frescor recusa a repetição.</strong> Bob paga <strong>uma só vez</strong>. " +
            "Rachadura do replay fechada.");
        } else {
          s.payCount += 1;
          s.replaySeen = true;
          log("🚨 Sem prova de frescor, Bob acha que é um novo pedido legítimo e " +
            "<strong>paga DE NOVO</strong>: total <strong>" + s.payCount + "×</strong>. Uma " +
            "mensagem cifrada E autêntica foi reaproveitada sem a chave — ligue o nonce e " +
            "reenvie.");
        }
        s.busy = false;
        if (state.stage === 2) renderStage2();
        updateNav();
      }, 1600);
    }

    /* ============ Etapa 3 — O alçapão dos primos ============ */

    function bitsEstimate(bits) {
      /* medidor ILUSTRATIVO do crescimento (não é benchmark real) */
      if (bits <= 20) return { txt: "instantâneo", hard: false };
      if (bits <= 128) return { txt: "segundos a minutos", hard: false };
      if (bits < 512) return { txt: "dias a meses (viável a atacantes)", hard: false };
      if (bits < 768) return { txt: "≈ 512 bits JÁ foram fatorados (2003, 174 dígitos)",
        hard: true };
      if (bits < 2048) return { txt: "inviável hoje — mínimo recomendado ≥ 768 bits",
        hard: true };
      return { txt: "2.048 bits em uso — fora de alcance da força bruta conhecida",
        hard: true };
    }

    function renderStage3() {
      var s = state.s3;
      var C = modpow(s.msg, RSA.c, RSA.N);
      var est = bitsEstimate(s.bits);
      els.area.innerHTML =
        '<div class="demo-sg-rsa">' +
        '  <p class="demo-sg-server-title">🔬 Bancada RSA de brinquedo (números do livro)</p>' +
        '  <div class="demo-sg-rsa-grid">' +
        "    <div><span>P</span><strong>" + RSA.P + "</strong></div>" +
        "    <div><span>Q</span><strong>" + RSA.Q + "</strong></div>" +
        "    <div><span>N = P·Q</span><strong data-n>" + RSA.N + "</strong></div>" +
        "    <div><span>Z = (P−1)(Q−1)</span><strong data-z>" + RSA.Z + "</strong></div>" +
        "    <div><span>d (privada, guarde)</span><strong data-d>" + RSA.d + "</strong></div>" +
        "    <div><span>c (pública, publique)</span><strong data-c>" + RSA.c + "</strong></div>" +
        "  </div>" +
        '  <p class="demo-sg-mural">📢 Mural público: chave de cifragem ⟨c=' + RSA.c +
        ", N=" + RSA.N + "⟩ — qualquer um cifra; só quem tem <strong>d=" + RSA.d +
        "</strong> decifra.</p>" +
        '  <div class="demo-sg-rsa-run">' +
        "    <p>Mensagem M = <strong data-m>" + s.msg + "</strong> " +
        '(0–220)</p>' +
        "    <p>Cifrar: C = M<sup>" + RSA.c + "</sup> mod " + RSA.N +
        ' = <strong data-cipher-out>' + (s.cipher === null ? "?" : s.cipher) +
        "</strong></p>" +
        "    <p>Decifrar: C<sup>" + RSA.d + "</sup> mod " + RSA.N +
        ' = <strong data-dec-out>' + (s.decrypted === null ? "?" : s.decrypted) +
        "</strong> " + (s.roundTrip ? "✓ voltou ao M original" : "") + "</p>" +
        "  </div>" +
        "</div>" +
        '<div class="demo-sg-factor">' +
        '  <p class="demo-sg-server-title">⚙️ Bancada do fatorador (o alçapão)</p>' +
        "  <p data-factored=\"" + s.factored + "\">" +
        (s.factored
          ? "Contra N=221 o fatorador achou <strong>13 × 17</strong> num instante, " +
            "recuperou Z=192 e derivou <strong>d=5</strong> — sua chave privada. Números " +
            "de brinquedo não protegem nada."
          : "Contra este N minúsculo, fatorar é trivial. Clique para quebrar.") + "</p>" +
        '  <label>dígitos/bits de N: <input type="range" class="demo-sg-bits" min="16" ' +
        'max="2048" step="16" value="' + s.bits + '"> <output data-bits-out>' + s.bits +
        " bits</output></label>" +
        '  <p class="demo-sg-est" data-hard="' + est.hard + '">Tempo estimado p/ fatorar: ' +
        "<strong>" + est.txt + "</strong></p>" +
        '  <p class="demo-sg-cost">💸 Cifrar com RSA custa <strong>100–1.000×</strong> a ' +
        "cifra simétrica: ótimo para ABRIR o canal, ruim para conversar (etapa 5).</p>" +
        "</div>";
      els.controls.innerHTML =
        '<label>M: <input type="number" class="demo-sg-msg" min="0" max="220" value="' +
        s.msg + '"></label>' +
        '<button type="button" class="btn demo-sg-encrypt">🔒 Cifrar (M^' + RSA.c +
        " mod " + RSA.N + ")</button>" +
        '<button type="button" class="btn demo-sg-decrypt"' +
        (s.cipher === null ? " disabled" : "") + ">🔓 Decifrar (C^" + RSA.d + ")</button>" +
        '<button type="button" class="btn btn-secondary demo-sg-eve">🕵️ Eve tenta ' +
        "(só tem ⟨" + RSA.c + "," + RSA.N + "⟩)</button>" +
        '<button type="button" class="btn btn-secondary demo-sg-factorbtn"' +
        (s.factored ? " disabled" : "") + ">⚙️ Fatorar N = 221</button>";
      els.controls.querySelector(".demo-sg-msg").addEventListener("change", function (ev) {
        var v = parseInt(ev.target.value, 10);
        if (isNaN(v) || v < 0) v = 0; if (v > 220) v = 220;
        s.msg = v; s.cipher = null; s.decrypted = null; s.roundTrip = false;
        renderStage3(); updateNav();
      });
      els.controls.querySelector(".demo-sg-encrypt").addEventListener("click", function () {
        s.cipher = modpow(s.msg, RSA.c, RSA.N); s.decrypted = null; s.roundTrip = false;
        log("🔒 M=" + s.msg + " cifrada com a chave PÚBLICA: C = " + s.msg + "^" + RSA.c +
          " mod " + RSA.N + " = <strong>" + s.cipher + "</strong>. Publicável — só d " +
          "reverte.");
        renderStage3(); updateNav();
      });
      els.controls.querySelector(".demo-sg-decrypt").addEventListener("click", function () {
        if (s.cipher === null) return;
        s.decrypted = modpow(s.cipher, RSA.d, RSA.N);
        s.roundTrip = s.decrypted === s.msg;
        log("🔓 Decifrando com a chave PRIVADA d=" + RSA.d + ": " + s.cipher + "^" + RSA.d +
          " mod " + RSA.N + " = <strong>" + s.decrypted + "</strong>" +
          (s.roundTrip ? " — voltou exatamente ao M. Alçapão: fácil com d." : "") + ".");
        renderStage3(); updateNav();
      });
      els.controls.querySelector(".demo-sg-eve").addEventListener("click", function () {
        log("🕵️ Eve tem só ⟨c=" + RSA.c + ", N=" + RSA.N + "⟩. Para achar d ela teria que " +
          "<strong>fatorar N</strong> — trivial para 221, <strong>inviável</strong> para os " +
          "primos de verdade (> 10<sup>100</sup>). Ela não volta.");
      });
      els.controls.querySelector(".demo-sg-factorbtn").addEventListener("click", factor3);
      els.area.querySelector(".demo-sg-bits").addEventListener("input", function (ev) {
        s.bits = parseInt(ev.target.value, 10);
        var e = bitsEstimate(s.bits);
        if (s.bits >= 512) {
          if (!s.sawGrowth) {
            log("📈 Com " + s.bits + " bits, fatorar já é <strong>" + e.txt + "</strong>. " +
              "O custo cresce exponencialmente: cada bloco de bits multiplica o esforço — " +
              "é o tamanho da chave que compra a segurança.");
          }
          s.sawGrowth = true;
        }
        renderStage3(); updateNav();
      });
    }

    function factor3() {
      var s = state.s3;
      if (s.busy || s.factored) return;
      s.busy = true;
      log("⚙️ Fatorando N=221 por divisão sucessiva: 2? 3? 5? 7? 11? <strong>13 ✓</strong>…");
      to(function () {
        s.factored = true; s.busy = false;
        log("💥 221 = <strong>13 × 17</strong> → Z=(13−1)(17−1)=192 → d = inverso de c=77 " +
          "mod 192 = <strong>5</strong>. Chave privada recuperada. Por isso N de verdade " +
          "tem centenas de dígitos.");
        if (state.stage === 3) renderStage3();
        updateNav();
      }, 900);
      renderStage3();
    }

    /* ============ Etapa 4 — O homem no meio e o cartório ============ */

    function renderStage4() {
      var s = state.s4;
      var recovered = s.sig === null ? null : modpow(s.sig, RSA.c, RSA.N);
      var current = digest(s.doc);
      var sigValid = s.sig !== null && recovered === current;
      els.area.innerHTML =
        '<div class="demo-sg-mitm" data-cert="' + s.certOn + '" data-blocked="' +
        s.certBlocked + '">' +
        '  <p class="demo-sg-server-title">🎭 Troca de chave pública Alice ⇄ Bob</p>' +
        "  <p data-mitm=\"" + s.mitmSeen + "\">" +
        (s.certBlocked
          ? "🔒 Com <strong>certificado</strong>: a chave de Bob vem assinada por Fred " +
            "(autoridade pré-instalada). O certificado FORJADO de Mallory falha a " +
            "verificação — o ataque morre e Alice usa a chave REAL de Bob."
          : (s.mitmSeen
            ? "💥 <strong>Homem no meio</strong>: Mallory respondeu com a chave DELE. " +
              "Alice e Bob “conversam normalmente” — nenhum erro em lado nenhum — enquanto " +
              "Mallory <strong>decifra e recifra em silêncio</strong> cada mensagem."
            : "Alice vai pedir “a chave pública de Bob” pela rede. Sem autenticação, quem " +
              "responde primeiro vence.")) +
        "</p>" +
        "</div>" +
        '<div class="demo-sg-sign">' +
        '  <p class="demo-sg-server-title">✍️ Cartório: assinatura digital</p>' +
        '  <p class="demo-sg-doc">Documento: “<strong data-doc>' + s.doc + "</strong>”</p>" +
        "  <p>Resumo H(M) = <strong data-hm>" + current + "</strong>" +
        (s.sig !== null
          ? " · assinatura [H]<sub>d</sub> = <strong data-sig>" + s.sig + "</strong>"
          : "") + "</p>" +
        (s.sig !== null
          ? '<p class="demo-sg-verify" data-valid="' + sigValid + '">Verificação: ' +
            "[H]<sub>d</sub><sup>c</sup> = " + recovered + " vs H(M)=" + current + " → " +
            (sigValid
              ? "<strong>✅ assinatura VÁLIDA</strong> (documento íntegro)"
              : "<strong>🚨 assinatura INVÁLIDA</strong> — o documento foi adulterado!") +
            "</p>"
          : "") +
        "</div>";
      els.controls.innerHTML =
        '<button type="button" class="btn demo-sg-askkey"' + (s.busy ? " disabled" : "") +
        ">▶ Alice pede a chave pública de Bob</button>" +
        '<button type="button" class="btn btn-secondary demo-sg-sign-btn"' +
        (s.busy ? " disabled" : "") + ">✍️ Assinar o documento (resumo + chave privada)</button>" +
        '<button type="button" class="btn btn-secondary demo-sg-tamper-doc"' +
        (s.sig === null || s.tampered || s.busy ? " disabled" : "") +
        ">✂️ Adulterar 1 byte do documento assinado</button>" +
        '<label><input type="checkbox" class="demo-sg-cert"' +
        (s.certOn ? " checked" : "") + (s.busy ? " disabled" : "") +
        "> 📜 Exigir certificado da autoridade (Fred pré-instalada)</label>";
      els.controls.querySelector(".demo-sg-askkey").addEventListener("click", askKey4);
      els.controls.querySelector(".demo-sg-sign-btn").addEventListener("click", function () {
        s.sig = modpow(digest(s.doc), RSA.d, RSA.N);
        log("✍️ Assinatura = H(M) cifrado com a chave PRIVADA: [" + digest(s.doc) + "]<sub>d</sub>" +
          " = <strong>" + s.sig + "</strong>. Qualquer um verifica com a chave pública; " +
          "só o dono da privada pôde produzi-la.");
        renderStage4(); updateNav();
      });
      els.controls.querySelector(".demo-sg-tamper-doc").addEventListener("click", function () {
        s.tampered = true; s.sigTamperSeen = true;
        s.doc = s.doc.replace("500", "900");
        log("✂️ Você trocou “500” por “900” no documento JÁ assinado. O resumo mudou de " +
          digest("Transferir R$ 500 para Bob") + " para <strong>" + digest(s.doc) +
          "</strong>, mas a assinatura ainda decifra para o resumo ANTIGO — " +
          "<strong>verificação falha na hora</strong>. Assinatura detecta adulteração.");
        renderStage4(); updateNav();
      });
      els.controls.querySelector(".demo-sg-cert").addEventListener("change", function (ev) {
        s.certOn = ev.target.checked;
        log(s.certOn
          ? "📜 Agora a chave de Bob só é aceita dentro de um <strong>certificado assinado " +
            "por Fred</strong> — a autoridade cuja chave veio de fábrica com Alice."
          : "📜 Certificado dispensado (de volta à confiança cega).");
        renderStage4(); updateNav();
      });
    }

    function askKey4() {
      var s = state.s4;
      if (s.busy) return;
      s.busy = true; renderStage4();
      log("📨 Alice: “me manda a chave pública de Bob”. Mallory está no caminho…");
      to(function () {
        if (s.certOn) {
          s.certBlocked = true;
          log("📜 Mallory tenta injetar a chave DELE num certificado forjado — mas não sabe " +
            "assinar como Fred. A verificação contra a AC pré-instalada <strong>rejeita</strong>. " +
            "Alice recebe a chave REAL de Bob. Homem no meio derrotado.");
        } else {
          s.mitmSeen = true;
          log("🎭 Mallory responde PRIMEIRO com a chave dele. Daqui em diante ele lê e " +
            "reescreve tudo <strong>sem erro visível</strong> — violação silenciosa, como a " +
            "corrupção da demo 4.");
        }
        s.busy = false;
        if (state.stage === 4) renderStage4();
        updateNav();
      }, 1100);
    }

    /* ============ Etapa 5 — O aperto de mãos ============ */

    function order5() {
      var s = state.s5;
      if (s.order) return s.order;
      /* embaralha as peças (determinístico com semente) mantendo-as todas */
      var idx = TLS_STEPS.map(function (_, i) { return i; });
      for (var i = idx.length - 1; i > 0; i--) {
        var j = Math.floor(rand() * (i + 1));
        var tmp = idx[i]; idx[i] = idx[j]; idx[j] = tmp;
      }
      s.order = idx;
      return idx;
    }

    function renderStage5() {
      var s = state.s5;
      var done = s.placed.length >= TLS_STEPS.length;
      var order = order5();
      var placedHtml = TLS_STEPS.map(function (st, i) {
        var n = s.placed.indexOf(i);
        if (n < 0) return "";
        return '<li class="demo-sg-piece is-placed"><span class="demo-sg-piece-n">' +
          (n + 1) + "</span> " + st.name + "</li>";
      }).join("");
      var trayHtml = order.map(function (i) {
        if (s.placed.indexOf(i) >= 0) return "";
        return '<button type="button" class="btn btn-secondary demo-sg-piece-btn" ' +
          'data-piece="' + i + '"' + (s.busy ? " disabled" : "") + ">" +
          TLS_STEPS[i].name + "</button>";
      }).join("");
      els.area.innerHTML =
        '<div class="demo-sg-handshake" data-lock="' + s.lockOn +
        '" data-wrong="' + s.wrongSeen + '">' +
        '  <p class="demo-sg-server-title">🤝 Monte o aperto de mãos do TLS, na ORDEM ' +
        "certa (a peça errada é recusada e explicada):</p>" +
        '  <ol class="demo-sg-assembly" data-count="' + s.placed.length + '">' +
        (placedHtml || '<li class="demo-sg-empty"><em>nenhuma peça montada ainda</em></li>') +
        "</ol>" +
        '  <div class="demo-sg-tray">' + (trayHtml || "") + "</div>" +
        (done
          ? '<div class="demo-sg-lock" data-lock-on="true">🔒 <strong>Cadeado aceso.</strong> ' +
            "Canal seguro: o grampo de Mallory vê só <strong>ruído</strong>; injetar falha " +
            "(o <strong>MAC</strong> não bate); repetir falha (frescor do handshake). " +
            "Assimétrica só na abertura (~ms); simétrica no volume.</div>"
          : "") +
        "</div>";
      els.controls.innerHTML =
        '<button type="button" class="btn-ghost demo-sg-hs-reset"' +
        (s.busy ? " disabled" : "") + ">↺ Recomeçar o handshake</button>";
      Array.prototype.forEach.call(
        els.area.querySelectorAll(".demo-sg-piece-btn"),
        function (btn) {
          btn.addEventListener("click", function () {
            place5(parseInt(btn.getAttribute("data-piece"), 10));
          });
        }
      );
      els.controls.querySelector(".demo-sg-hs-reset").addEventListener("click", function () {
        s.placed = []; s.lockOn = false;
        log("↺ Handshake reiniciado (as metas já cumpridas permanecem).");
        renderStage5();
      });
    }

    function place5(i) {
      var s = state.s5;
      if (s.busy) return;
      var expected = s.placed.length; /* índice do próximo passo esperado */
      if (i !== expected) {
        s.wrongSeen = true;
        log("✗ <strong>" + TLS_STEPS[i].name + "</strong> ainda não: " + TLS_STEPS[i].why);
        renderStage5();
        return;
      }
      s.placed.push(i);
      log("✓ Passo " + s.placed.length + ": <strong>" + TLS_STEPS[i].name + "</strong> — " +
        TLS_STEPS[i].why);
      if (s.placed.length >= TLS_STEPS.length) {
        s.lockOn = true; s.everLocked = true;
        log("🔒 <strong>Cadeado aceso!</strong> Cada peça respondeu a um ataque que você " +
          "mesmo executou. Isto é o <code>https:</code> — todo o tópico em milissegundos.");
      }
      renderStage5();
      updateNav();
    }

    /* ============ Painel-síntese ============ */

    function fillSummary() {
      els.summary.innerHTML =
        '<p class="callout-title">🎓 Mallory fora da linha</p>' +
        "<p>Cada ameaça que você executou na etapa 1 foi fechada por uma defesa que você " +
        "construiu — e todas se encontram no aperto de mãos do TLS:</p>" +
        '<ul class="demo-sg-synth">' +
        "  <li><strong>Intromissão / vazamento</strong> ← cifra (etapa 2)</li>" +
        "  <li><strong>Distribuição de chave</strong> ← alçapão RSA + certificado (etapas 3–4)</li>" +
        "  <li><strong>Repetição (replay)</strong> ← nonce / frescor (etapa 2)</li>" +
        "  <li><strong>Mascaramento / falsificação</strong> ← assinatura e MAC (etapas 4–5)</li>" +
        "  <li><strong>Homem no meio</strong> ← certificado de autoridade (etapa 4)</li>" +
        "</ul>" +
        "<p>Tudo montado no <strong>handshake do TLS</strong> (etapa 5) — o mesmo cadeado do " +
        "navegador. No texto do tópico: Needham–Schroeder e Kerberos generalizam o nonce/" +
        "frescor; o WEP mostra o que dá errado quando se erra o projeto. Na prática moderna, " +
        "é assim que se protegem os serviços.</p>" +
        '<p class="demo-sg-honesty">⚠️ Todas as cifras desta demo são de <strong>brinquedo</strong>, ' +
        "inseguras de propósito (RSA com N=221; “cifra” e “resumo” visuais). Não use nada " +
        "aqui como referência de implementação — use AES/SHA/TLS reais.</p>";
    }

    /* ============ Etapas ============ */

    var STAGES = [
      {
        title: "Etapa 1 — Escute a rede (você é Eve/Mallory)",
        instructions: "Alice fala com Bob por uma rede insegura, em claro. Opere o grampo: " +
          "intercepte (leia), injete uma mensagem forjada e altere uma em trânsito. Cada " +
          "ataque aparece no log com seu método e sua classe.",
        goalText: "Meta: executar os três ataques — interceptar, injetar e alterar.",
        setup: function () {},
        render: renderStage1,
        goalMet: function () {
          var s = state.s1; return s.intercepted && s.injected && s.altered;
        }
      },
      {
        title: "Etapa 2 — Cifre e feche as rachaduras",
        instructions: "Ligue a cifra simétrica: o grampo passa a ver ruído e adulterar não " +
          "cola mais. Mas duas rachaduras sobram — descubra como a chave chegou a Bob e " +
          "assista ao replay pagar duas vezes; depois ligue o nonce para fechá-lo.",
        goalText: "Meta: cifrar + detectar adulteração + ver a chave exposta + ver o replay " +
          "duplicar o pagamento e bloqueá-lo com o nonce.",
        setup: function () { state.s2.busy = false; },
        render: renderStage2,
        goalMet: function () {
          var s = state.s2;
          return s.cipherOn && s.tamperDetected && s.keyExposed && s.replaySeen &&
            s.replayBlocked;
        }
      },
      {
        title: "Etapa 3 — O alçapão dos primos (RSA de brinquedo)",
        instructions: "Bancada com os números do livro: P=13, Q=17 → N=221, Z=192, d=5, c=77. " +
          "Cifre uma mensagem com a chave pública e decifre com a privada; mande o fatorador " +
          "quebrar N=221 e arraste os bits de N para ver o custo explodir.",
        goalText: "Meta: cifrar e decifrar de volta (ida-e-volta) + fatorar N=221 + ver o " +
          "custo crescer para ≥ 512 bits.",
        setup: function () { state.s3.busy = false; },
        render: renderStage3,
        goalMet: function () {
          var s = state.s3; return s.roundTrip && s.factored && s.sawGrowth;
        }
      },
      {
        title: "Etapa 4 — O homem no meio e o cartório",
        instructions: "Sem autenticação, Mallory se passa pela chave de Bob e lê tudo em " +
          "silêncio. Construa as defesas: assine um documento e adultere um byte para ver a " +
          "verificação acusar; depois exija o certificado da autoridade e repita o pedido.",
        goalText: "Meta: ver o homem no meio silencioso + a assinatura acusar a adulteração + " +
          "o certificado rejeitar a chave forjada.",
        setup: function () { state.s4.busy = false; },
        render: renderStage4,
        goalMet: function () {
          var s = state.s4; return s.mitmSeen && s.sigTamperSeen && s.certBlocked;
        }
      },
      {
        title: "Etapa 5 — O aperto de mãos (monte o TLS)",
        instructions: "Ordene as peças do handshake TLS, da negociação de cifras aos dados " +
          "com MAC. A peça fora de ordem é recusada e explicada. Complete a linha e o cadeado " +
          "acende — o grampo de Mallory só verá ruído.",
        goalText: "Meta: montar o handshake na ordem certa e acender o cadeado.",
        setup: function () { state.s5.busy = false; },
        render: renderStage5,
        goalMet: function () { return state.s5.lockOn || state.s5.everLocked; }
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
      if (state.stage === STAGES.length && st.goalMet()) {
        fillSummary();
        els.summary.hidden = false;
      }
    }

    function gotoStage(n) {
      state.stage = n;
      var st = STAGES[n - 1];
      els.title.innerHTML = "<strong>" + st.title + "</strong>";
      els.instructions.textContent = st.instructions;
      els.summary.hidden = true;
      log("— " + st.title + " —");
      st.setup();
      st.render();
      updateNav();
    }

    els.prev.addEventListener("click", function () {
      if (state.stage > 1) gotoStage(state.stage - 1);
    });
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
