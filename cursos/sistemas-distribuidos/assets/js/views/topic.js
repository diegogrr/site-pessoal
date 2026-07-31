/* ============================================================
   views/topic.js — Página de um tópico
   Carrega o conteúdo sob demanda (SD.loader) e monta, em três
   zonas (trilha · leitura · índice): cabeçalho do tópico com
   metadados, seções numeradas, área de demonstração, quiz,
   glossário do tópico, referências, índice "Nesta página" com
   scroll-spy e paginação anterior/próximo.
   Namespace global: SD.views.topic
   ============================================================ */

window.SD = window.SD || {};
SD.views = SD.views || {};

SD.views.topic = function (params) {
  "use strict";

  var view = document.getElementById("app-view");
  var meta = SD.course.getTopic(params.id);

  if (!meta) {
    view.innerHTML = SD.layout.viewContainer(
      '<div class="empty-state"><h1>Tópico não encontrado</h1>' +
      '<p><a href="#/">Voltar ao início</a></p></div>'
    );
    return;
  }

  view.innerHTML = SD.layout.viewContainer(
    '<div class="empty-state">Carregando tópico…</div>'
  );

  SD.loader.loadTopic(meta.id)
    .then(function (content) { renderTopic(view, meta, content); })
    .catch(function (err) {
      view.innerHTML = SD.layout.viewContainer(
        '<div class="empty-state"><h1>Erro ao carregar o tópico</h1>' +
        "<p>" + err.message + "</p></div>"
      );
    });

  /** Estima o tempo de leitura (min) a partir do texto das seções. */
  function readingMinutes(sections) {
    var words = 0;
    (sections || []).forEach(function (sec) {
      var text = (sec.title + " " + (sec.html || "")).replace(/<[^>]+>/g, " ");
      words += (text.match(/\S+/g) || []).length;
    });
    return Math.max(1, Math.round(words / 200));
  }

  /** Infere o tipo de callout pelo emoji do título (sem tocar no conteúdo).
     Usa indexOf com o emoji inteiro: um character class de emojis fora do
     BMP (ex.: /[🚫]/) casaria surrogates soltos e pegaria 💡 por engano. */
  function has(txt, emoji) { return txt.indexOf(emoji) !== -1; }
  function classifyCallouts(root) {
    Array.prototype.forEach.call(root.querySelectorAll(".callout"), function (c) {
      var title = c.querySelector(".callout-title");
      var txt = title ? title.textContent : "";
      if (has(txt, "🚫") || has(txt, "⛔") || has(txt, "❌")) c.classList.add("is-danger");
      else if (has(txt, "⚠") || has(txt, "⏳")) c.classList.add("is-warn");
    });
  }

  function renderTopic(view, meta, content) {
    SD.progress.markVisited(meta.id);

    var index = SD.course.getTopicIndex(meta.id);
    var prev = SD.course.topics[index - 1] || null;
    var next = SD.course.topics[index + 1] || null;
    var chapter = index + 1;
    var sections = content.sections || [];

    /* ---- Seções de conteúdo (título numerado como "nó") ---- */
    var sectionsHtml = sections.map(function (section, i) {
      return (
        '<section class="topic-section" id="secao-' + (i + 1) + '">' +
        '<h2><span class="section-number">' + chapter + "." + (i + 1) + "</span>" +
        "<span>" + section.title + "</span></h2>" +
        (section.html || "") +
        "</section>"
      );
    }).join("");

    /* ---- Índice "Nesta página" ---- */
    var toc = sections.map(function (section, i) {
      return { id: "secao-" + (i + 1), label: chapter + "." + (i + 1) + " " + section.title };
    });

    /* ---- Cartão da prática na AWS (content.lab é opcional) ---- */
    var labHtml = "";
    if (content.lab && content.lab.href) {
      var lab = content.lab;
      var labMeta = ["Roteiro guiado"]
        .concat(lab.duration ? [lab.duration] : [])
        .concat(lab.environment ? [lab.environment] : [])
        .join(" · ");
      labHtml =
        '<section class="topic-section" id="pratica">' +
        '<h2><span class="section-number is-accent">▶</span><span>Prática na AWS</span></h2>' +
        '<a class="lab-card" href="' + lab.href + '" target="_blank" rel="noopener">' +
        '<span class="lab-card-eyebrow">' + labMeta + "</span>" +
        '<span class="lab-card-title">' + lab.title + "</span>" +
        '<span class="lab-card-summary">' + (lab.summary || "") + "</span>" +
        '<span class="lab-card-cta">Abrir o roteiro ↗</span>' +
        "</a></section>";
      toc.push({ id: "pratica", label: "Prática na AWS" });
    }

    toc.push({ id: "quiz", label: "Autoavaliação" });

    /* ---- Glossário do tópico ---- */
    var glossaryHtml = "";
    if (content.glossary && content.glossary.length) {
      glossaryHtml =
        '<section class="topic-section" id="glossario-topico">' +
        '<h2><span class="section-number is-muted">§</span><span>Termos-chave</span></h2>' +
        '<dl class="glossary-list">' +
        content.glossary.map(function (g) {
          return '<div class="glossary-item"><dt>' + g.term + "</dt><dd>" + g.definition + "</dd></div>";
        }).join("") +
        "</dl></section>";
      toc.push({ id: "glossario-topico", label: "Termos-chave" });
    }

    /* ---- Referências do tópico ---- */
    var referencesHtml = "";
    if (content.references && content.references.length) {
      referencesHtml =
        '<section class="topic-section" id="referencias-topico">' +
        '<h2><span class="section-number is-muted">☰</span><span>Referências</span></h2>' +
        '<ul class="reference-list">' +
        content.references.map(function (r) { return "<li>" + r + "</li>"; }).join("") +
        "</ul></section>";
      toc.push({ id: "referencias-topico", label: "Referências" });
    }

    var done = SD.progress.isDone(meta.id);
    var chips =
      '<div class="topic-chips">' +
      '<span class="chip">◷ ~' + readingMinutes(sections) + " min de leitura</span>" +
      '<span class="chip">▤ ' + sections.length + " seções</span>" +
      '<span class="chip">✎ Autoavaliação</span>' +
      (done ? '<span class="chip is-ok">✓ concluído</span>' : "") +
      "</div>";

    var tocHtml =
      '<nav class="topic-toc" aria-label="Nesta página">' +
      '<p class="toc-title">Nesta página</p>' +
      toc.map(function (t) {
        return '<a href="#" data-target="' + t.id + '">' + t.label + "</a>";
      }).join("") +
      "</nav>";

    var mainHtml =
      '<div class="topic-main">' +
      '<header class="topic-header">' +
      '<div class="topic-meta">' +
      '<span class="badge">Tópico ' + meta.id + " de " + SD.course.topics.length + "</span>" +
      (done ? ' <span class="badge badge-success">✓ Concluído</span>' : "") +
      "</div>" +
      "<h1>" + chapter + ". " + meta.title + "</h1>" +
      '<p class="topic-summary">' + meta.summary + "</p>" +
      chips +
      '<div class="topic-toolbar">' +
      '<button type="button" class="btn" id="btn-present">▶ Modo apresentação</button>' +
      '<button type="button" class="btn btn-secondary" id="btn-done"' + (done ? " disabled" : "") + ">" +
      (done ? "✓ Lido" : "✓ Marcar como lido") + "</button>" +
      "</div>" +
      "</header>" +

      sectionsHtml +
      labHtml +

      '<section class="topic-section" id="quiz">' +
      '<h2><span class="section-number is-accent">✎</span><span>Autoavaliação</span></h2>' +
      '<div id="quiz-mount"></div>' +
      "</section>" +

      glossaryHtml +
      referencesHtml +

      '<nav class="topic-pager" aria-label="Navegação entre tópicos">' +
      (prev
        ? '<a href="#/topico/' + prev.id + '"><span class="pager-key">← Anterior</span>' +
          '<span class="pager-val">' + prev.title + "</span></a>"
        : "<span></span>") +
      (next
        ? '<a class="is-next" href="#/topico/' + next.id + '"><span class="pager-key">Próximo →</span>' +
          '<span class="pager-val">' + next.title + "</span></a>"
        : '<a class="is-next" href="#/"><span class="pager-key">Fim da trilha</span>' +
          '<span class="pager-val">Concluir trilha 🏁</span></a>') +
      "</nav>" +
      "</div>";

    view.innerHTML = SD.layout.viewContainer(
      '<div class="topic-layout">' + mainHtml + tocHtml + "</div>"
    );

    /* ---- Callouts semânticos (info/warn/danger pelo emoji do título) ---- */
    classifyCallouts(view);

    /* ---- Quiz ---- */
    SD.quiz.render(document.getElementById("quiz-mount"), meta.id, content.quiz);

    /* ---- Demonstrações interativas ----
       Cada seção declara um ponto de montagem .demo-area com
       data-demo="nome". Se houver módulo registrado em SD.demos["nome"],
       ele é montado no lugar do placeholder; sem módulo, o placeholder
       permanece. O gancho content.initDemos segue disponível. */
    Array.prototype.forEach.call(
      view.querySelectorAll(".demo-area[data-demo]"),
      function (area) {
        var demo = SD.demos && SD.demos[area.getAttribute("data-demo")];
        if (demo && demo.mount) {
          area.classList.add("demo-mounted");
          area.innerHTML = "";
          demo.mount(area);
        }
      }
    );
    if (content.initDemos) {
      content.initDemos(view);
    }

    /* ---- Índice: rolagem suave sem interferir no roteador por hash ---- */
    Array.prototype.forEach.call(view.querySelectorAll(".topic-toc a[data-target]"), function (a) {
      a.addEventListener("click", function (e) {
        e.preventDefault();
        var el = document.getElementById(a.getAttribute("data-target"));
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });

    /* ---- Marcar como lido ---- */
    var btnDone = document.getElementById("btn-done");
    if (btnDone) {
      btnDone.addEventListener("click", function () {
        SD.progress.markDone(meta.id);
        btnDone.textContent = "✓ Lido";
        btnDone.disabled = true;
      });
    }

    /* ---- Modo apresentação ---- */
    document.getElementById("btn-present").addEventListener("click", function () {
      SD.presentation.open(meta, content);
    });

    SD.layout.renderSidebar();
    view.focus();
    window.scrollTo(0, 0);
    if (SD.reading) SD.reading.update();
  }
};
