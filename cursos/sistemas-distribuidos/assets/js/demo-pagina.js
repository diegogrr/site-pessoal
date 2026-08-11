/* ============================================================================
   demo-pagina.js — casca das demonstrações em página própria

   FORMATO EM AVALIAÇÃO (2026-08-07). Ele convive com o formato antigo, em que
   a demo é montada dentro da página do tópico por views/topic.js. Enquanto os
   dois existirem, cada demo fica em um formato só, e nenhuma regra daqui pode
   alcançar as que continuam embutidas.

   Nada aqui toca os módulos de demonstração. A demo monta como sempre montou,
   e só depois os blocos que ela produziu são movidos para zonas fixas. Isso é
   possível porque o módulo guarda referência dos elementos e atualiza as
   partes internas por ela, de modo que mudar um bloco de lugar não invalida
   referência nenhuma. Se o formato for abandonado, apagar este arquivo e a
   página que o chama desfaz tudo.

   Uma coisa remonta a casca inteira, e é "↺ Reiniciar demo". As sete demos
   reiniciam chamando o próprio `mount` de novo, que escreve
   `container.innerHTML` e substitui a raiz, e daí a organização em zonas
   precisa ser refeita. Por isso ela mora numa função rechamável e idempotente
   em vez de correr direto na montagem.

   As zonas, na ordem em que aparecem na grade:

     cabecalho    identificação da demo e da etapa
     comando      o que o aluno opera (passos, previsão, controles, botões)
     palco        a visualização
     painel       dashboards, resumo e registro
     explicacao   o que a demo diz sobre o que acabou de acontecer
     navegacao    avançar, voltar e reiniciar

   O mapa de qual bloco vai para qual zona é declarado pela página, e não aqui,
   porque ele depende das classes que cada demo emite. Quando (e se) o formato
   virar padrão, o caminho natural é os próprios módulos emitirem as zonas e
   este mapa desaparecer.

   Namespace: SD.demoPagina
   ========================================================================== */
var SD = window.SD = window.SD || {};

SD.demoPagina = (function () {
  "use strict";

  var ORDEM = [
    "cabecalho", "comando", "palco", "painel", "explicacao", "navegacao"
  ];

  /* Rótulo desenhado pelo CSS acima de cada zona, para o aluno aprender onde
     procurar cada coisa e achar no mesmo lugar na demo seguinte. Cabeçalho e
     navegação não levam, porque se explicam sozinhos. */
  var ROTULOS = {
    comando: "Controles",
    palco: "Simulação",
    painel: "Medições",
    explicacao: "O que mudou"
  };

  /* Mapa padrão, levantado da varredura das sete demos em 2026-08-07. Elas
     compartilham o mesmo esqueleto, com raiz `demo-cf` e os mesmos blocos na
     mesma ordem, e a única variação é o nome da área de palco, que segue o
     padrão `demo-XX-stage-area` (a 01, mais antiga, chama a dela de
     `demo-cf-world`). Por isso o mapa mora aqui, e a página só declara o que
     foge dele. Quem declara exceção é a demo que já recebeu a camada de
     tutoria, porque ela acrescenta blocos à zona de comando (hoje a 02 e a 03).

     Zona declarada que não recebeu bloco nenhum é removida, o que resolve
     sozinho os dois casos irregulares: demo sem medições e demo sem tutoria. */
  var MAPA_PADRAO = {
    cabecalho: [".demo-cf-badge", ".demo-cf-title", ".demo-cf-instructions"],
    comando: [".demo-cf-goal", ".demo-cf-controls", ".demo-cf-challenge"],
    palco: ['[class*="-stage-area"]', ".demo-cf-world"],
    painel: [".demo-cf-metrics", ".demo-cf-summary", ".demo-cf-log-wrap"],
    explicacao: [".demo-tutor-efeito"],
    navegacao: [".demo-cf-nav"]
  };

  /* A página substitui zonas inteiras, nunca acrescenta a uma lista do padrão.
     Mistura parcial daria um mapa que ninguém consegue ler de um lugar só. */
  function comPadrao(declarado) {
    var mapa = {};
    ORDEM.forEach(function (nome) {
      if (declarado && declarado[nome]) mapa[nome] = declarado[nome];
      else if (MAPA_PADRAO[nome]) mapa[nome] = MAPA_PADRAO[nome];
    });
    return mapa;
  }

  /* Um agrupador do formato antigo que perdeu todos os filhos para as zonas
     não pode continuar na árvore, porque ele ainda carrega margem e borda. */
  function limparVazios(raiz) {
    Array.prototype.slice.call(raiz.children).forEach(function (el) {
      if (!el.children.length && !el.textContent.trim()) {
        raiz.removeChild(el);
      }
    });
  }

  /* --------------------------------------------------------------------
     Estabilização de altura

     O incômodo medido em 2026-08-08 não é o crescimento, é a OSCILAÇÃO. Na
     etapa 2 da demo 02 a zona de comando vai a 604px, responder a previsão a
     leva a 521px e operar os controles a derruba para 374px, e tudo o que está
     abaixo sobe e desce junto. Reservar o máximo de cada zona resolveria, e
     custaria caro demais: a demo ficaria sempre com 1192px, contra os 710px que
     ela tem em repouso hoje.

     A saída é mais barata. Enquanto o aluno permanece no mesmo estado, zona
     nenhuma encolhe: a maior altura já alcançada vira piso. O layout cresce até
     assentar e para de se mexer, e o custo é só o espaço em branco de um bloco
     que sumiu. Estado novo zera os pisos, porque ali a mudança de tamanho é
     esperada e informa que algo mudou de propósito.

     Só vale em duas colunas. Abaixo de 1100px a demo é uma pilha e reservar
     altura em tela estreita seria trocar rolagem por espaço vazio.
     ------------------------------------------------------------------ */
  function estabilizarAltura(raiz) {
    var DUAS_COLUNAS = "(min-width: 1101px)";
    var maximos = {};
    var estadoAtual = null;
    var agendado = false;

    /* Duas coisas encerram a validade dos pisos, e as duas são deliberadas: a
       troca de etapa e o abrir ou fechar de um bloco recolhível, que hoje é a
       nota do "Por que isso acontece?". Sem a segunda, fechar a nota devolvia o
       texto mas não o espaço. A zona de comando ficava com quase mil pixels de
       fundo vazio e empurrava para fora da tela as zonas da linha de baixo
       (medido em 2026-08-10: 292px em repouso, 1236px com a nota aberta e
       1236px depois de fechá-la, com as zonas de explicação e painel saindo de
       607px para 1508px do topo).

       Serve qualquer `aria-expanded`, porque é assim que um recolhível se
       anuncia na árvore. Dentro de uma demo, só o botão de conceito usa o
       atributo hoje, e um recolhível novo entra nesta conta sem precisar de
       ajuste aqui. */
    function chaveDeEstado() {
      var titulo = raiz.querySelector(".demo-cf-title");
      var recolhiveis = Array.prototype.map.call(
        raiz.querySelectorAll("[aria-expanded]"),
        function (el) { return el.getAttribute("aria-expanded"); }
      );
      return (titulo ? titulo.textContent.trim() : "") + "|" + recolhiveis.join(",");
    }

    function zonasMoveis() {
      return Array.prototype.filter.call(
        raiz.querySelectorAll(".demo-zona"),
        function (z) {
          var n = z.getAttribute("data-zona");
          return n !== "cabecalho" && n !== "navegacao";
        }
      );
    }

    function soltar() {
      maximos = {};
      zonasMoveis().forEach(function (z) { z.style.minHeight = ""; });
    }

    function ajustar() {
      agendado = false;
      if (!window.matchMedia(DUAS_COLUNAS).matches) { soltar(); return; }

      var estado = chaveDeEstado();
      if (estado !== estadoAtual) {
        estadoAtual = estado;
        soltar();
        agendar();   // mede na passada seguinte, já sem piso do estado anterior
        return;
      }

      zonasMoveis().forEach(function (z) {
        var nome = z.getAttribute("data-zona");
        var h = z.getBoundingClientRect().height;
        if (h > (maximos[nome] || 0)) {
          maximos[nome] = h;
          z.style.minHeight = Math.round(h) + "px";
        }
      });
    }

    function agendar() {
      if (agendado) return;
      agendado = true;
      window.requestAnimationFrame(ajustar);
    }

    /* Observa conteúdo e os três atributos que mexem no tamanho. Incluir
       `style` faria a própria escrita de minHeight disparar o observador, e o
       laço não teria fim. */
    var observador = new MutationObserver(agendar);
    observador.observe(raiz, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["class", "hidden", "aria-expanded"]
    });
    window.addEventListener("resize", agendar);
    agendar();

    /* Devolve como se desligar. O observador morre junto com a árvore que
       observa, mas o ouvinte de `resize` mora em `window` e sobreviveria a
       cada remontagem, acumulando um por reinício e medindo uma demo que já
       não está na tela. */
    return function desligar() {
      observador.disconnect();
      window.removeEventListener("resize", agendar);
    };
  }

  function montar(config) {
    var alvo = document.getElementById(config.montarEm || "demo-mount");
    if (!alvo) return;

    var modulo = SD.demos && SD.demos[config.demo];
    if (!modulo || !modulo.mount) {
      alvo.innerHTML =
        '<p class="demo-pagina-erro">A demonstração não pôde ser carregada. ' +
        "Recarregue a página para tentar de novo.</p>";
      return;
    }

    var mapa = comPadrao(config.zonas);
    var desligarEstabilizador = null;

    /* Organizar é idempotente de propósito, e é o que permite chamar de novo
       depois de uma remontagem sem risco de dobrar zona. Raiz que já tem a
       classe `demo-zoneada` sai fora sem fazer nada. */
    function organizar() {
      var raiz = alvo.querySelector(".demo-cf") || alvo.firstElementChild;
      if (!raiz || raiz.classList.contains("demo-zoneada")) return;

      var zonas = {};
      ORDEM.forEach(function (nome) {
        if (!mapa[nome]) return;
        var z = document.createElement("div");
        z.className = "demo-zona demo-zona-" + nome;
        z.setAttribute("data-zona", nome);
        if (ROTULOS[nome]) z.setAttribute("data-rotulo", ROTULOS[nome]);
        zonas[nome] = z;
      });

      /* Move antes de inserir as zonas na árvore. Buscar sempre a partir da
         raiz encontra o bloco onde quer que ele esteja, inclusive dentro de um
         agrupador do formato antigo, e appendChild se encarrega de tirá-lo de
         lá.

         Daí sai a regra de precedência, que vale a pena enunciar porque não é
         óbvia. Como as zonas ainda não entraram na árvore, um bloco que já foi
         levado para dentro de uma delas deixa de ser encontrável, então **bloco
         aninhado viaja junto com o bloco que o contém**, e quem chega primeiro
         na ORDEM leva. É isso que mantém as métricas dentro da simulação nas
         demos 06 e 07, onde o autor as aninhou de propósito, sem precisar de
         exceção declarada na página. Inverter a ORDEM inverteria esse
         comportamento. */
      ORDEM.forEach(function (nome) {
        if (!mapa[nome]) return;
        mapa[nome].forEach(function (sel) {
          var el = raiz.querySelector(sel);
          if (el) zonas[nome].appendChild(el);
        });
      });

      limparVazios(raiz);

      raiz.classList.add("demo-zoneada");
      ORDEM.forEach(function (nome) {
        var z = zonas[nome];
        if (!z) return;
        /* Zona vazia não vai à tela, porque moldura e rótulo sem conteúdo
           dentro parecem defeito. A classe avisa o CSS para a grade se refazer
           sem ela. */
        if (!z.children.length) {
          raiz.classList.add("sem-" + nome);
          return;
        }
        /* O painel se chama "Medições" quando de fato traz medição. Há demo
           cujas métricas ficam dentro da própria simulação, e nela esta zona
           guarda só o registro, então prometer medição no rótulo seria
           mentir. */
        if (nome === "painel" && !z.querySelector(".demo-cf-metrics")) {
          z.setAttribute("data-rotulo", "Registro");
        }
        raiz.appendChild(z);
      });

      if (desligarEstabilizador) desligarEstabilizador();
      desligarEstabilizador = estabilizarAltura(raiz);
    }

    modulo.mount(alvo);
    organizar();

    /* "↺ Reiniciar demo" apaga as zonas, e por isso elas precisam ser refeitas.
       As sete demos reiniciam chamando o próprio `mount` de novo, que escreve
       `container.innerHTML` e substitui a raiz inteira, inclusive as zonas que
       tinham sido penduradas nela. Sem isto, reiniciar devolvia a pilha vertical
       do formato antigo, sem erro nenhum no console (medido em 2026-08-11: de 6
       zonas e duas colunas de 512px e 940px para 0 zonas e coluna nenhuma).

       Quem avisa é a troca dos filhos de `alvo`, e não um clique no botão. Assim
       o conserto não depende de o módulo continuar reiniciando desse jeito, e o
       organizador segue sem conhecer demo nenhuma. Observa só `childList` no
       primeiro nível, que é exatamente onde a remontagem aparece; as zonas
       nascem um nível abaixo e não realimentam o observador. */
    new MutationObserver(organizar).observe(alvo, { childList: true });
  }

  return { montar: montar };
})();
