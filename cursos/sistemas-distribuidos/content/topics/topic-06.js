/* ============================================================
   topic-06.js — Sistemas Operacionais Distribuídos
   ------------------------------------------------------------
   Estrutura documentada no modelo topic-01.js (sections[] com
   slides[] opcionais, quiz[], glossary[], references[]).
   Conteúdo baseado em: COULOURIS et al., cap. 7 (pp. 279–334),
   VAN STEEN; TANENBAUM, 4. ed., cap. 3 e HWANG et al., cap. 3
   (leituras complementares).
   ============================================================ */

window.SD = window.SD || {};
SD.content = SD.content || {};

SD.content["06"] = {

  sections: [
    {
      title: "A camada do sistema operacional",
      html:
        "<p>O Tópico 5 mostrou o middleware fazendo mágica: stubs, despachantes, " +
        "retransmissões: tudo automático. Mas quem sustenta o mágico? Abaixo da " +
        "camada de middleware está a <strong>camada do sistema operacional</strong>: " +
        "é o SO de cada nó que fornece processos, threads, memória e comunicação" +
        ": as abstrações sobre as quais o middleware constrói as suas. Este " +
        "tópico desce ao andar de baixo e pergunta: até que ponto os requisitos " +
        "do middleware (acesso <em>eficiente</em> e <em>robusto</em> aos recursos " +
        "físicos) podem ser satisfeitos pelo SO? O par SO-hardware de um nó é " +
        "chamado de <strong>plataforma</strong>, e o middleware precisa rodar " +
        "sobre muitas plataformas diferentes.</p>" +
        "<h3>Sistema operacional de rede × sistema operacional distribuído</h3>" +
        "<p>UNIX/Linux e Windows são <strong>sistemas operacionais de rede</strong>: " +
        "têm rede incorporada e acessam recursos remotos (montam um NFS, abrem um " +
        "ssh), mas cada nó mantém <em>autonomia</em> sobre seus próprios processos" +
        ". Há <em>várias imagens do sistema</em>, uma por nó. No extremo oposto " +
        "estaria o <strong>sistema operacional distribuído</strong>: uma " +
        "<em>imagem única do sistema</em>, em que o SO controla todos os nós e " +
        "dispara cada processo no nó mais conveniente, de forma transparente. A " +
        "ideia existe desde os anos 80, e, no entanto, <strong>não existem SOs " +
        "distribuídos de uso geral</strong>. Dois motivos: primeiro, os usuários " +
        "têm um investimento enorme em software aplicativo, e não trocam de SO " +
        "por eficiência se seus aplicativos não rodarem nele (emular UNIX sobre " +
        "núcleos novos nunca teve desempenho satisfatório); segundo, os usuários " +
        "preferem manter <em>autonomia</em> sobre a própria máquina: ninguém " +
        "quer o processo alheio disputando seu processador. O equilíbrio que " +
        "venceu é a combinação <strong>middleware + SO de rede</strong>: " +
        "autonomia local, com serviços distribuídos por cima.</p>" +
        "<h3>O que o SO precisa fornecer</h3>" +
        "<p>Núcleos e processos servidores são os gerenciadores de recursos. " +
        "Deles, o mínimo exigido é:</p>" +
        "<ul>" +
        "<li><strong>Encapsulamento</strong>: expor uma interface de serviço " +
        "útil e esconder os detalhes (memória, dispositivos);</li>" +
        "<li><strong>Proteção</strong>: recursos protegidos contra acessos " +
        "ilegítimos;</li>" +
        "<li><strong>Processamento concorrente</strong>: clientes compartilham " +
        "recursos ao mesmo tempo, com transparência de concorrência.</li>" +
        "</ul>" +
        "<p>Acessar um recurso encapsulado é o <em>mecanismo de invocação</em> " +
        "(uma chamada de sistema, uma RMI), que envolve <em>comunicação</em> " +
        "(levar parâmetros e resultados) e <em>escalonamento</em> (agendar o " +
        "processamento). Por dentro, o SO se organiza em: gerência de " +
        "<strong>processos</strong>, de <strong>threads</strong>, de " +
        "<strong>comunicação</strong>, de <strong>memória</strong> e o " +
        "<strong>supervisor</strong> (interrupções, chamadas de sistema, " +
        "exceções: no Windows, a HAL).</p>" +
        "<h3>Proteção: modos, espaços e o preço</h3>" +
        "<p>A ameaça não é só código malicioso: código <em>benigno com erro</em> " +
        "também corrompe. Além de impor quem pode ler ou escrever, é preciso " +
        "impedir operações que nem fazem parte da interface (ninguém deveria " +
        "conseguir apontar o ponteiro do arquivo para um número aleatório). Um " +
        "caminho é a <em>linguagem fortemente tipada</em> (Singularity/Sing#, " +
        "Modula-3): sem referência válida, não há acesso. O caminho universal é o " +
        "<em>hardware</em>, com ajuda do <strong>núcleo</strong> (kernel): o " +
        "programa que carrega na inicialização e executa com privilégio total. O " +
        "processador tem um <em>registrador de modo</em>: o núcleo roda em " +
        "<strong>modo supervisor</strong>; todo o resto, em <strong>modo " +
        "usuário</strong>. Cada processo ganha um <strong>espaço de " +
        "endereçamento</strong> (os intervalos de memória virtual que pode " +
        "acessar, com direitos definidos) e não enxerga nada fora dele. Para " +
        "invocar o núcleo, o processo executa uma <strong>chamada de " +
        "sistema</strong>: uma instrução TRAP põe o processador em modo " +
        "supervisor e salta para um tratador <em>do núcleo</em>: ninguém ganha " +
        "controle ilícito do hardware. O preço: cada travessia entre espaços de " +
        "endereçamento custa muitos ciclos. Guarde esse custo: ele é o vilão da " +
        "seção de comunicação.</p>",
      slides: [
        {
          title: "O andar de baixo do middleware",
          html:
            "<ul>" +
            "<li>Abaixo do middleware: a <strong>camada do SO</strong> de cada nó</li>" +
            "<li><strong>Plataforma</strong> = SO + hardware · o middleware roda " +
            "sobre várias</li>" +
            "<li>Requisito: acesso <strong>eficiente</strong> e " +
            "<strong>robusto</strong> aos recursos</li>" +
            "<li>Do SO vêm: processos, threads, memória, comunicação</li>" +
            "</ul>"
        },
        {
          title: "SO de rede × SO distribuído",
          html:
            "<ul>" +
            "<li><strong>SO de rede</strong> (UNIX, Windows): várias imagens do " +
            "sistema, autonomia por nó</li>" +
            "<li><strong>SO distribuído</strong>: imagem única, processos em " +
            "qualquer nó: transparente</li>" +
            "<li>Por que não existe: <strong>aplicativos</strong> não rodariam + " +
            "perda de <strong>autonomia</strong></li>" +
            "<li>Vencedor: <strong>middleware + SO de rede</strong></li>" +
            "</ul>"
        },
        {
          title: "O que o SO precisa dar",
          html:
            "<ul>" +
            "<li><strong>Encapsulamento</strong> · <strong>proteção</strong> · " +
            "<strong>concorrência</strong></li>" +
            "<li>Invocação = comunicação + escalonamento</li>" +
            "<li>Gerências: processos · threads · comunicação · memória · " +
            "<strong>supervisor</strong></li>" +
            "</ul>"
        },
        {
          title: "Proteção, e seu preço",
          html:
            "<ul>" +
            "<li>Modo <strong>supervisor</strong> (núcleo) × modo " +
            "<strong>usuário</strong> (resto)</li>" +
            "<li><strong>Espaço de endereçamento</strong>: cada processo só vê o " +
            "seu</li>" +
            "<li>Chamada de sistema = <strong>TRAP</strong> → tratador do núcleo</li>" +
            "<li>Cada travessia custa <strong>muitos ciclos</strong>: lembre " +
            "disso adiante</li>" +
            "</ul>"
        }
      ]
    },
    {
      title: "Processos e threads",
      html:
        "<p>Nos anos 80 descobriu-se que o processo tradicional, um único fluxo " +
        "de execução, não servia para sistemas distribuídos: compartilhar " +
        "recursos entre atividades relacionadas ficava caro e complicado. A " +
        "solução foi repartir o conceito: um <strong>processo</strong> é um " +
        "<strong>ambiente de execução</strong> (a unidade de gerenciamento de " +
        "recursos: espaço de endereçamento, soquetes, arquivos abertos, " +
        "semáforos) habitado por uma ou mais <strong>threads</strong> (a " +
        "abstração de uma atividade). O ambiente é caro de criar; as threads são " +
        "baratas, e compartilham tudo o que há dentro dele.</p>" +
        '<div class="callout">' +
        '<p class="callout-title">💡 Um jarro de moscas</p>' +
        "<p>A analogia clássica (do grupo comp.os.mach): o ambiente de execução " +
        "é um <em>jarro tampado</em>, com ar e comida; cada thread é uma " +
        "<em>mosca</em> lá dentro. As moscas nascem e morrem, consomem qualquer " +
        "recurso do jarro e, sem disciplina de fila, <em>colidem</em> umas com as " +
        "outras (condições de corrida). Podem mandar mensagens para moscas de " +
        "outros jarros, mas nenhuma escapa do vidro, e nenhuma de fora entra. " +
        "Um processo UNIX tradicional? Um jarro com uma única mosca estéril.</p>" +
        "</div>" +
        "<h3>Espaços de endereçamento</h3>" +
        "<p>O espaço de endereçamento (2<sup>32</sup> ou 2<sup>64</sup> bytes) é " +
        "um conjunto esparso de <strong>regiões</strong> que não se sobrepõem: " +
        "texto (código), heap, pilha, e, generalizando o UNIX, uma <em>pilha " +
        "separada por thread</em> (ultrapassar o limite gera erro de página " +
        "detectável), <em>arquivos mapeados</em> (o arquivo acessado como um " +
        "vetor de bytes na memória) e <strong>regiões compartilhadas</strong> " +
        "entre processos: bibliotecas (uma cópia para todos), o próprio núcleo " +
        "(mapeado em todo espaço, evitando trocar mapeamentos na chamada de " +
        "sistema) e dados de comunicação: mais eficiente do que copiar " +
        "mensagens, como veremos.</p>" +
        "<h3>Criar um processo em um sistema distribuído</h3>" +
        "<p>A criação se divide em duas decisões independentes. Primeira: " +
        "<strong>em qual nó?</strong> A <em>política de transferência</em> decide " +
        "se o processo nasce local ou remoto; a <em>política de localização</em> " +
        "escolhe o nó de destino: de forma <em>estática</em> (regras fixas, sem " +
        "olhar o estado) ou <em>adaptativa</em> (heurísticas sobre a carga " +
        "medida). Sistemas de balanceamento de carga podem ser centralizados, " +
        "hierárquicos ou descentralizados; iniciados pela <em>origem</em> " +
        "(sobrecarregado procura ajuda) ou pelo <em>destino</em> (ocioso se " +
        "anuncia). <em>Migrar</em> processos em execução é possível, mas raro: " +
        "caro e difícil (extrair o estado de dentro do núcleo). A lição de Eager " +
        "e colegas: <strong>simplicidade</strong>: o custo de coletar informação " +
        "e decidir pode comer a vantagem do balanceamento. Segunda decisão: " +
        "<strong>como montar o ambiente de execução?</strong> Ou o formato é " +
        "estático, ou é derivado do pai, como no fork do UNIX. A otimização " +
        "clássica é a <strong>cópia na escrita</strong> (copy-on-write): a região " +
        "herdada é “copiada” sem cópia física; os quadros de memória ficam " +
        "compartilhados e protegidos contra escrita, e só quando um dos lados " +
        "tenta escrever é que o quadro atingido é de fato duplicado (a exceção de " +
        "erro de página dispara a cópia). Quem nunca escreve, nunca paga.</p>" +
        "<h3>Threads no servidor: fazendo as contas</h3>" +
        "<p>Por que servidores são multithreaded? Considere requisições que " +
        "custam <strong>2 ms de processador + 8 ms de disco</strong>. Com uma " +
        "única thread, cada uma leva 10 ms: <strong>100 requisições/s</strong> no " +
        "máximo. Com duas threads (uma computa enquanto a outra espera o disco), " +
        "o disco vira o gargalo: <strong>125/s</strong>. Acrescente uma " +
        "<em>cache</em> de blocos com 75% de acerto: a E/S média cai a 2 ms, mas " +
        "o processamento sobe a 2,5 ms (manter a cache custa), e o teto passa a " +
        "ser <strong>400/s</strong>, agora limitado pelo processador. Num " +
        "multiprocessador com 2 CPUs, três ou mais threads chegam a " +
        "<strong>500/s</strong>. Moral: threads convertem espera em vazão, e " +
        "cada otimização move o gargalo de lugar. As arquiteturas para organizar " +
        "isso: <strong>conjunto de trabalhadores</strong> (pool fixo + fila de " +
        "requisições, possivelmente com prioridades), <strong>thread por " +
        "requisição</strong> (máximo paralelismo, custo de criar/destruir), " +
        "<strong>thread por conexão</strong> e <strong>thread por objeto</strong> " +
        "(menos criação, risco de fila desequilibrada). Clientes também lucram: o " +
        "navegador busca imagens em paralelo; uma thread produz, outra faz as " +
        "invocações remotas bloqueantes.</p>" +
        "<h3>Threads × processos, e quem escalona</h3>" +
        "<p>Tudo isso poderia ser feito com vários processos de uma thread só. " +
        "Por que threads? <em>Custo</em>: criar uma thread (~1 ms, na medição " +
        "clássica de Anderson) é uma ordem de grandeza mais barato que criar um " +
        "processo (~11 ms); chavear entre threads do mesmo ambiente (0,4 ms, ou " +
        "0,04 ms em nível de usuário) é bem mais barato que entre processos " +
        "(1,8 ms), que exige <em>transição de domínio</em> e invalida caches. E " +
        "<em>conveniência</em>: dados compartilhados direto na memória. O outro " +
        "lado: threads do mesmo jarro <strong>não são protegidas umas das " +
        "outras</strong>: programar exige sincronização (em Java: métodos " +
        "<em>synchronized</em> = monitor; <em>wait/notify</em> como variáveis de " +
        "condição). Onde as threads são implementadas também importa: no " +
        "<strong>núcleo</strong> (Windows, Linux: o núcleo escalona cada uma; " +
        "aproveitam multiprocessador) ou em <strong>nível de usuário</strong> " +
        "(biblioteca: chaveamento baratíssimo, escalonador personalizável, " +
        "milhares de threads, mas uma chamada de sistema bloqueante trava o " +
        "processo inteiro e não há paralelismo real). Os projetos híbridos " +
        "combinam os dois: no Solaris, threads de usuário sobre “processos " +
        "leves” do núcleo; nas <strong>ativações do escalonador</strong>, o " +
        "núcleo faz <em>upcalls</em> notificando o escalonador de usuário " +
        "(“sua thread bloqueou”, “processador preemptado”) para que nenhuma " +
        "thread pronta fique parada tendo processador virtual livre.</p>",
      slides: [
        {
          title: "Processo = jarro · threads = moscas",
          html:
            "<ul>" +
            "<li><strong>Ambiente de execução</strong>: espaço de endereçamento + " +
            "recursos (caro)</li>" +
            "<li><strong>Threads</strong>: atividades dentro dele (baratas, " +
            "compartilham tudo)</li>" +
            "<li>Moscas colidem: sincronização é problema seu</li>" +
            "<li>Processo UNIX tradicional: jarro com uma mosca estéril</li>" +
            "</ul>"
        },
        {
          title: "Espaços de endereçamento",
          html:
            "<ul>" +
            "<li><strong>Regiões</strong>: texto · heap · <strong>uma pilha por " +
            "thread</strong></li>" +
            "<li><strong>Arquivos mapeados</strong>: arquivo como vetor de bytes</li>" +
            "<li>Regiões <strong>compartilhadas</strong>: bibliotecas, núcleo, " +
            "dados de comunicação</li>" +
            "</ul>"
        },
        {
          title: "Criar processos na rede",
          html:
            "<ul>" +
            "<li>Onde? política de <strong>transferência</strong> + de " +
            "<strong>localização</strong> (estática × adaptativa)</li>" +
            "<li>Origem procura ajuda × destino ocioso se anuncia · migração: " +
            "rara e cara</li>" +
            "<li>Lição de Eager: <strong>simplicidade</strong> compensa</li>" +
            "<li><strong>Cópia na escrita</strong>: só copia o quadro quando " +
            "alguém escreve</li>" +
            "</ul>"
        },
        {
          title: "Threads no servidor: as contas",
          html:
            "<ul>" +
            "<li>2 ms CPU + 8 ms disco: 1 thread = <strong>100 req/s</strong> · " +
            "2 threads = <strong>125</strong></li>" +
            "<li>+ cache 75%: <strong>400</strong> (gargalo virou a CPU) · " +
            "2 CPUs: <strong>500</strong></li>" +
            "<li>Arquiteturas: <strong>pool de trabalhadores</strong> · por " +
            "requisição · por conexão · por objeto</li>" +
            "</ul>"
        },
        {
          title: "Threads × processos · usuário × núcleo",
          html:
            "<ul>" +
            "<li>Criar: ~1 ms × ~11 ms · chavear: 0,04-0,4 ms × 1,8 ms</li>" +
            "<li>Compartilham tudo, e <strong>não são protegidas</strong> entre si</li>" +
            "<li>Nível de usuário: barato e flexível, mas bloqueia junto</li>" +
            "<li>Híbridos: Solaris · <strong>ativações do escalonador</strong> " +
            "(upcalls do núcleo)</li>" +
            "</ul>"
        }
      ]
    },
    {
      title: "Comunicação e invocação: o preço de cada chamada",
      html:
        "<p>Quais primitivas de comunicação o SO dá ao middleware? Alguns " +
        "núcleos de pesquisa (Amoeba, V, Chorus) embutiram invocação de alto " +
        "nível: doOperation/getRequest/sendReply direto no núcleo, economizando " +
        "chamadas de sistema. Mas o que prevaleceu foi o oposto: o núcleo fornece " +
        "<strong>soquetes TCP e UDP</strong>, e o middleware constrói RPC/RMI em " +
        "nível de usuário: mais simples de desenvolver, portável e interoperável " +
        "(toda plataforma tem uma API de soquetes parecida). A compatibilidade " +
        "com TCP/UDP é obrigatória; ao mesmo tempo, o SO precisa acomodar " +
        "protocolos novos (WiFi, Bluetooth): de <em>drivers</em> de protocolo " +
        "instaláveis à <em>composição dinâmica</em> de pilhas (o notebook que " +
        "troca do enlace sem fio para a Ethernet do escritório sem os aplicativos " +
        "notarem).</p>" +
        "<h3>Quanto custa invocar</h3>" +
        "<p>Invocações têm três perguntas de desempenho: cruzam um <em>domínio de " +
        "proteção</em>? cruzam a <em>rede</em>? exigem <em>escalonamento e troca " +
        "de contexto</em>? Uma chamada de procedimento convencional custa fração " +
        "de microssegundo; uma <strong>RPC nula</strong> (sem parâmetros, " +
        "procedimento vazio) entre processos em uma rede local custa " +
        "<strong>décimos de milissegundo</strong>: centenas de vezes mais. E " +
        "aqui o dado que muda a intuição: os ~100 bytes da RPC nula, a " +
        "100 megabits/s, gastam ~0,01 ms de rede. <strong>Quase todo o atraso é " +
        "software</strong>: núcleo + código de RPC. Os componentes: " +
        "<em>empacotamento</em> (cópia e conversão), <em>cópia de dados</em> (a " +
        "mensagem pode ser copiada várias vezes: usuário↔núcleo, entre camadas de " +
        "protocolo, núcleo↔interface de rede), <em>inicialização de pacotes</em> " +
        "(cabeçalhos, somas de verificação), <em>escalonamento e trocas de " +
        "contexto</em> (várias chamadas de sistema por RPC) e <em>espera por " +
        "confirmações</em>. O atraso cresce com o tamanho dos argumentos, com " +
        "degraus a cada novo pacote, e na Internet tudo muda de escala: " +
        "latências de centenas de milissegundos, variáveis, com a carga do " +
        "servidor dominando. A latência fixa é o que a RPC nula mede; é por isso " +
        "que buscar 32 KB em UMA invocação é bem melhor que em 32 invocações de " +
        "1 KB.</p>" +
        "<h3>As otimizações, e a LRPC</h3>" +
        "<p>O SO pode ajudar: <strong>regiões compartilhadas</strong> eliminam " +
        "cópias entre usuário e núcleo (a U-Net foi além: acesso direto da " +
        "aplicação à interface de rede, zero cópias). A escolha do protocolo " +
        "importa: TCP não é necessariamente pior que UDP, mas os buffers do SO e " +
        "a partida lenta podem atrapalhar (o estudo de Nielsen sobre o HTTP: as " +
        "conexões persistentes do 1.1 amortizam o custo de conexão, como vimos " +
        "no Tópico 5, e ajustar o comportamento dos buffers do núcleo eliminou " +
        "atrasos de timeout: o SO pode ajudar ou atrapalhar o middleware). E há " +
        "um caso especial cada vez mais importante: Bershad e colegas observaram " +
        "que a <em>maioria</em> das invocações acontece <strong>dentro do mesmo " +
        "computador</strong>. A <strong>LRPC</strong> (RPC leve) otimiza esse " +
        "caso: argumentos passam por uma <em>pilha A</em> em região compartilhada " +
        "entre cliente e servidor: <strong>1 cópia</strong> em vez das 4 da RPC " +
        "local convencional, e, em vez de acordar uma thread do servidor, a " +
        "própria <em>thread do cliente</em> executa o procedimento no domínio do " +
        "servidor, com o núcleo validando a entrada (upcall). Resultado: " +
        "<strong>3× mais rápida</strong> que a RPC local. E a transparência? " +
        "Preservada: um bit, definido na hora da vinculação, decide LRPC (local) " +
        "ou RPC (remoto): o aplicativo nem sabe.</p>" +
        "<h3>Latência alta? Opere assíncrono</h3>" +
        "<p>Na Internet (e no mundo móvel) a latência vence qualquer otimização " +
        "de SO. As respostas são dois modelos: <strong>invocações " +
        "concorrentes</strong> (chamadas bloqueantes em várias threads: o " +
        "navegador buscando as imagens da página em paralelo, o pipeline do " +
        "HTTP 1.1) e <strong>invocações assíncronas</strong> (a chamada não " +
        "bloqueante retorna já; o resultado vem depois). No sistema Mercury, a " +
        "operação assíncrona devolve uma <strong>promise</strong>, a “promessa” " +
        "de um resultado futuro, que o chamador resgata com <em>claim</em> " +
        "(bloqueia até estar pronta) ou testa com <em>ready</em>. Se o nome soa " +
        "familiar, deveria. É a mesma ideia das promises/futures de hoje. A " +
        "forma mais radical é a <strong>invocação assíncrona persistente</strong> " +
        "(QRPC, do toolkit Rover): sem conexão, as requisições esperam em um " +
        "<em>log estável</em>; quando o enlace volta, são enviadas por prioridade" +
        ": a resposta pode chegar por outro enlace, na “caixa de correio” do " +
        "cliente. Desconexão deixa de ser falha e vira só latência muito alta: " +
        "tema que reencontraremos na computação móvel (Tópico 12).</p>",
      slides: [
        {
          title: "Quem fornece a comunicação",
          html:
            "<ul>" +
            "<li>Núcleos de pesquisa: invocação <em>dentro</em> do núcleo (Amoeba)</li>" +
            "<li>O que venceu: núcleo dá <strong>soquetes TCP/UDP</strong>; " +
            "middleware faz o resto</li>" +
            "<li>Motivos: portabilidade e interoperação</li>" +
            "<li>Protocolos novos: drivers e <strong>composição dinâmica</strong> " +
            "de pilhas</li>" +
            "</ul>"
        },
        {
          title: "O custo de uma invocação",
          html:
            "<ul>" +
            "<li>Chamada local: fração de µs · <strong>RPC nula na LAN: décimos " +
            "de ms</strong></li>" +
            "<li>Rede: ~0,01 ms: <strong>o resto é software</strong></li>" +
            "<li>Vilões: empacotamento · <strong>cópias</strong> · cabeçalhos · " +
            "trocas de contexto · confirmações</li>" +
            "<li>Latência fixa manda: 1 RPC de 32 KB ≫ 32 RPCs de 1 KB</li>" +
            "</ul>"
        },
        {
          title: "Memória compartilhada e LRPC",
          html:
            "<ul>" +
            "<li>Regiões compartilhadas: menos cópias (U-Net: zero)</li>" +
            "<li>Maioria das invocações: <strong>mesmo computador</strong></li>" +
            "<li><strong>LRPC</strong>: pilha A compartilhada (1 cópia, não 4) + " +
            "a thread do cliente entra no servidor</li>" +
            "<li><strong>3× mais rápida</strong> · bit na vinculação preserva a " +
            "transparência</li>" +
            "</ul>"
        },
        {
          title: "Latência alta? Assíncrono",
          html:
            "<ul>" +
            "<li><strong>Invocações concorrentes</strong>: navegador busca " +
            "imagens em paralelo</li>" +
            "<li><strong>Assíncronas</strong>: retorna já → <strong>promise</strong> " +
            "+ claim/ready (Mercury): as futures de hoje</li>" +
            "<li><strong>QRPC persistente</strong>: fila em log estável; envia " +
            "quando conectar</li>" +
            "<li>Desconexão = latência altíssima (Tópico 12)</li>" +
            "</ul>"
        }
      ]
    },
    {
      title: "Arquiteturas de núcleo e virtualização",
      html:
        "<p>Um sistema distribuído aberto pede que cada computador rode só o " +
        "software de que precisa, que serviços possam ser trocados e adicionados " +
        "sem quebrar o resto, e o princípio de projeto que sustenta isso é " +
        "separar <strong>mecanismo</strong> (o que o núcleo fornece) de " +
        "<strong>política</strong> (o que cada aplicação decide). A pergunta " +
        "arquitetural clássica: <em>quanto</em> deve viver dentro do núcleo?</p>" +
        "<h3>Monolítico × micronúcleo</h3>" +
        "<p>O núcleo <strong>monolítico</strong> (UNIX é o exemplo canônico: " +
        "“monólito”: maciço e não diferenciado) executa todas as funções básicas: " +
        "megabytes de código, servidores dentro do próprio núcleo, difícil de " +
        "modificar. O <strong>micronúcleo</strong> inverte: o núcleo fornece só " +
        "as abstrações mínimas: <em>espaços de endereçamento, threads e " +
        "comunicação local entre processos</em>, e todo o resto (sistema de " +
        "arquivos, rede…) vira <em>servidor</em> carregado dinamicamente, " +
        "acessado por passagem de mensagens. Sobre o micronúcleo, " +
        "<em>subsistemas</em> podem até emular SOs inteiros (UNIX e OS/2 " +
        "coexistiram sobre o Mach). O placar: o micronúcleo ganha em " +
        "<strong>extensibilidade</strong>, em <strong>modularidade imposta por " +
        "proteção de memória</strong> e em confiabilidade (núcleo pequeno = menos " +
        "erros); o monolítico ganha em <strong>eficiência de invocação</strong>: " +
        "uma chamada de sistema é mais barata que uma travessia entre espaços de " +
        "usuário. As estratégias mistas exploram o meio: Mach e Chorus passaram a " +
        "carregar servidores <em>dentro</em> do núcleo (depure em nível de " +
        "usuário, rode no núcleo: perdendo a proteção); o SPIN protege por " +
        "<em>linguagem</em> (tudo em Modula-3, num só espaço, com interação por " +
        "eventos); o L4 (“segunda geração”) mantém servidores fora, mas otimiza " +
        "brutalmente a comunicação; o Exonúcleo entrega recursos crus (blocos de " +
        "disco) e põe até o sistema de arquivos em <em>bibliotecas</em>. O " +
        "balanço de um dos projetistas (Liedtke): “a história do micronúcleo está " +
        "repleta de boas ideias e becos escuros”. Quem herdou a missão, suportar " +
        "vários sistemas com proteção entre eles, foi a " +
        "<strong>virtualização</strong>.</p>" +
        "<h3>Virtualização: várias máquinas em uma</h3>" +
        "<p>A meta: oferecer <strong>várias máquinas virtuais</strong>, imagens " +
        "virtuais do hardware, sobre uma única máquina física, cada uma rodando " +
        "seu próprio sistema operacional. Quem aloca os recursos físicos entre " +
        "elas é uma camada fina chamada <strong>monitor de máquina virtual</strong> " +
        "ou <strong>hipervisor</strong>. Os casos de uso explicam o entusiasmo:</p>" +
        "<ul>" +
        "<li><strong>Servidores</strong>: um serviço por MV, MVs alocadas aos " +
        "servidores físicos; MVs <em>migram</em> com facilidade (processos, não), " +
        "reduzindo máquinas e energia nas server farms;</li>" +
        "<li><strong>Computação em nuvem</strong>: a IaaS é literalmente isto: " +
        "alugar máquinas virtuais (Tópico 11);</li>" +
        "<li><strong>Criação dinâmica</strong>: jogos online e multimídia criam " +
        "e destroem MVs com pouca sobrecarga;</li>" +
        "<li><strong>Desktop</strong>: Windows e Linux convivendo no seu " +
        "notebook (Parallels, VMware).</li>" +
        "</ul>" +
        "<p>Na <strong>virtualização total</strong>, o hipervisor oferece uma " +
        "interface <em>idêntica</em> ao hardware: o SO convidado roda sem " +
        "modificação. O critério teórico vem de Popek e Goldberg (1974): uma " +
        "arquitetura é virtualizável se toda instrução <em>sensível</em> (que " +
        "mexe ou depende da configuração real da máquina) for " +
        "<em>privilegiada</em>, e portanto capturável pelo hipervisor. O x86 " +
        "clássico falha no critério: <strong>17 instruções sensíveis não são " +
        "privilegiadas</strong>: virtualização total ali exige camada de " +
        "simulação, que custa caro. A <strong>paravirtualização</strong> aceita o " +
        "trade-off oposto: modifica (porta) o SO convidado: instruções " +
        "privilegiadas viram <strong>hiperchamadas</strong> ao hipervisor, e os " +
        "efeitos das instruções problemáticas são tratados no próprio convidado: " +
        "em troca de desempenho muito melhor.</p>" +
        "<h3>Estudo de caso: Xen</h3>" +
        "<p>O Xen nasceu no projeto XenoServer (Cambridge) e virou referência de " +
        "paravirtualização. O <strong>hipervisor</strong> é deliberadamente " +
        "mínimo: só virtualização de CPU, escalonamento e memória física; uma " +
        "falha nele derruba tudo, então pequeno + testado = confiável (herança " +
        "declarada do Exonúcleo: mecanismo no hipervisor, política fora). No " +
        "x86, ele roda no <em>anel 0</em> de privilégio; os SOs convidados descem " +
        "para o <em>anel 1</em>; aplicativos seguem no <em>anel 3</em>. As " +
        "máquinas virtuais são <strong>domínios</strong>: os " +
        "<strong>domíniosU</strong> (sem privilégio sobre o hardware) e o " +
        "<strong>domínio0</strong>, especial, que roda XenoLinux e atua como " +
        "<em>plano de controle</em>, inclusive com os drivers reais. O " +
        "escalonamento ganha um terceiro nível: o hipervisor escalona " +
        "<strong>CPUs virtuais (VCPUs)</strong> nas CPUs físicas (escalonadores " +
        "SEDF, por prazos, e Credit, por pesos e limites); cada convidado " +
        "escalona suas threads nas VCPUs; bibliotecas escalonam threads de " +
        "usuário. A memória vira três camadas: física (hipervisor), " +
        "<em>pseudofísica</em> (a ilusão de espaço contíguo, com o mapeamento " +
        "mantido <em>pelo convidado</em>) e virtual (aplicativos), o que " +
        "facilita até migrar e suspender/retomar domínios. Dispositivos usam " +
        "<strong>drivers divididos</strong>: o <em>back-end</em> no domínio0 " +
        "multiplexa o driver real; o <em>front-end</em> no convidado é um proxy " +
        "simples; os dois conversam por memória compartilhada (tabelas de " +
        "concessão) com <em>anéis de E/S</em>, e a descoberta passa pelo " +
        "XenStore. Portar um SO para o Xen é: trocar instruções privilegiadas por " +
        "hiperchamadas, tratar as sensíveis, portar a memória virtual e escrever " +
        "os front-ends. E o projeto que deu origem a tudo (XenoServers públicos " +
        "executando código de clientes mediante cobrança, com registro via " +
        "XenoCorp e descoberta de recursos) era, em 2003, um retrato antecipado " +
        "da <strong>infraestrutura como serviço</strong> que o Tópico 11 " +
        "examina.</p>" +
        '<div class="callout">' +
        '<p class="callout-title">💡 Do hipervisor ao contêiner</p>' +
        "<p>A virtualização não parou no hipervisor. Entre os níveis de " +
        "implementação está a <em>virtualização em nível de SO</em>: em vez de " +
        "várias máquinas com seus núcleos, um único núcleo isola grupos de " +
        "processos com visões próprias de sistema: a base dos " +
        "<strong>contêineres</strong> de hoje (Docker, Kubernetes), mais leves " +
        "que MVs porém menos isolados. A nuvem moderna usa os dois: MVs para " +
        "isolar inquilinos, contêineres para empacotar serviços. A leitura " +
        "complementar de Hwang percorre os níveis de virtualização; o Tópico 11 " +
        "retoma o assunto na nuvem.</p>" +
        "</div>" +
        /* Área reservada para demonstração interativa futura. */
        '<div class="demo-area" data-demo="virtualizacao">' +
        '<span class="demo-placeholder-icon" aria-hidden="true">🧪</span>' +
        "<p><strong>Demonstração interativa (em breve)</strong></p>" +
        "<p>Espaço reservado para um comparativo interativo entre máquinas virtuais e contêineres.</p>" +
        "</div>",
      slides: [
        {
          title: "Monolítico × micronúcleo",
          html:
            "<ul>" +
            "<li><strong>Monolítico</strong> (UNIX): tudo no núcleo: eficiente, " +
            "intratável</li>" +
            "<li><strong>Micronúcleo</strong>: só espaços + threads + IPC; o " +
            "resto vira <strong>servidor</strong></li>" +
            "<li>Micro ganha: extensibilidade, modularidade, núcleo pequeno</li>" +
            "<li>Mono ganha: <strong>invocação barata</strong></li>" +
            "</ul>"
        },
        {
          title: "Estratégias mistas, e o veredicto",
          html:
            "<ul>" +
            "<li>Mach/Chorus: servidor dentro do núcleo (adeus proteção)</li>" +
            "<li><strong>SPIN</strong>: proteção por linguagem · <strong>L4</strong>: " +
            "IPC otimizada · <strong>Exonúcleo</strong>: bibliotecas</li>" +
            "<li>“Boas ideias e becos escuros” (Liedtke)</li>" +
            "<li>Quem herdou a missão: a <strong>virtualização</strong></li>" +
            "</ul>"
        },
        {
          title: "Virtualização: por quê",
          html:
            "<ul>" +
            "<li>Várias <strong>máquinas virtuais</strong> (e SOs) sobre um " +
            "hardware: via <strong>hipervisor</strong></li>" +
            "<li>Server farms: um serviço por MV · MVs <strong>migram</strong> · " +
            "menos energia</li>" +
            "<li>Nuvem: <strong>IaaS</strong> = alugar MVs (Tópico 11)</li>" +
            "<li>Criação dinâmica (jogos) · desktop (Windows + Linux)</li>" +
            "</ul>"
        },
        {
          title: "Total × para · Popek e Goldberg",
          html:
            "<ul>" +
            "<li>Condição (1974): toda instrução <strong>sensível</strong> deve " +
            "ser <strong>privilegiada</strong></li>" +
            "<li>x86 clássico: <strong>17 instruções</strong> violam: total " +
            "exige simulação cara</li>" +
            "<li><strong>Paravirtualização</strong>: porta o convidado · " +
            "privilegiadas viram <strong>hiperchamadas</strong></li>" +
            "<li>Anéis: hipervisor 0 · convidado 1 · aplicativos 3</li>" +
            "</ul>"
        },
        {
          title: "Xen, e o caminho para a nuvem",
          html:
            "<ul>" +
            "<li>Hipervisor <strong>mínimo</strong> · <strong>domínio0</strong> " +
            "controla e tem os drivers reais</li>" +
            "<li>3 níveis: VCPUs ← threads do convidado ← threads de usuário</li>" +
            "<li>Memória física / <strong>pseudofísica</strong> / virtual · " +
            "drivers <strong>divididos</strong> (anéis de E/S)</li>" +
            "<li>XenoServer (2003) = IaaS avant la lettre · contêineres: MV mais " +
            "leve, menos isolada</li>" +
            "</ul>"
        }
      ]
    }
  ],

  quiz: [
    {
      question:
        "Por que NÃO existem sistemas operacionais distribuídos (imagem única do sistema) de uso geral?",
      options: [
        "Porque é tecnicamente impossível escalonar processos entre nós diferentes.",
        "Porque os usuários não abandonariam seus aplicativos existentes, e as emulações de SOs sobre núcleos novos tiveram desempenho insatisfatório: além de os usuários preferirem manter autonomia sobre a própria máquina.",
        "Porque o custo do hardware necessário é proibitivo.",
        "Porque a Internet impede qualquer forma de transparência de localização."
      ],
      answer: 1,
      explanation:
        "Os dois motivos do texto: o enorme investimento em software aplicativo " +
        "(que precisa continuar rodando) e a autonomia: ninguém quer os " +
        "processos alheios degradando sua máquina. O equilíbrio vencedor é o " +
        "middleware sobre sistemas operacionais DE REDE."
    },
    {
      question:
        "O que a técnica de cópia na escrita (copy-on-write) faz quando uma região é herdada logicamente copiada no fork?",
      options: [
        "Copia imediatamente todos os quadros de memória da região para o processo filho.",
        "Impede qualquer escrita na região herdada até o processo pai terminar.",
        "Compartilha os quadros entre pai e filho, protegidos contra escrita; só quando um deles tenta escrever é que o quadro atingido é fisicamente copiado (disparado pela exceção de erro de página).",
        "Move a região para o espaço de endereçamento do núcleo, que passa a intermediar todos os acessos."
      ],
      answer: 2,
      explanation:
        "A cópia é lógica até ser necessária: os quadros ficam compartilhados e " +
        "protegidos contra escrita; a primeira escrita gera uma exceção, e só " +
        "então o quadro é duplicado byte a byte. Páginas que ninguém modifica " +
        "nunca são copiadas: ideal para o fork tipicamente seguido de exec."
    },
    {
      question:
        "Um servidor single-threaded processa requisições que custam 2 ms de CPU + 8 ms de E/S de disco. Qual é sua vazão máxima, e por que adicionar uma segunda thread ajuda?",
      options: [
        "100 requisições/s; a segunda thread computa enquanto a primeira espera o disco, elevando a vazão (para 125/s, com o disco como novo gargalo).",
        "500 requisições/s; a segunda thread dobra esse valor para 1000/s.",
        "125 requisições/s; a segunda thread não muda nada em um único processador.",
        "100 requisições/s; a segunda thread só ajuda se houver dois discos."
      ],
      answer: 0,
      explanation:
        "Uma thread: 2+8 = 10 ms por requisição → 100/s. Com duas threads, a " +
        "computação de uma sobrepõe a E/S da outra; como os acessos ao disco " +
        "serializam (8 ms cada), o teto passa a 1000/8 = 125/s. Threads " +
        "convertem espera em vazão, e cada otimização move o gargalo."
    },
    {
      question:
        "Uma RPC nula entre processos em uma rede local leva ~0,1 ms, dos quais a transmissão dos ~100 bytes pela rede explica ~0,01 ms. O que consome o restante do tempo?",
      options: [
        "A propagação do sinal elétrico pelos cabos.",
        "A espera obrigatória por três confirmações do TCP.",
        "O algoritmo de roteamento dos comutadores da rede local.",
        "Sobrecargas de software: empacotamento, cópias de dados entre usuário/núcleo e camadas, inicialização de pacotes, chamadas de sistema, escalonamento e trocas de contexto."
      ],
      answer: 3,
      explanation:
        "O tempo de rede é ~10% do total: o atraso da invocação é dominado pelo " +
        "código do núcleo e do runtime de RPC: as cópias, o empacotamento, os " +
        "cabeçalhos e as trocas de contexto. É por isso que a LRPC ataca " +
        "exatamente cópias e escalonamento no caso local (1 cópia em vez de 4, " +
        "thread do cliente entra no servidor) e fica 3× mais rápida."
    },
    {
      question:
        "Qual é o principal trade-off entre núcleos monolíticos e micronúcleos?",
      options: [
        "Monolíticos são mais seguros; micronúcleos são maiores.",
        "Micronúcleos ganham em extensibilidade, modularidade imposta por proteção de memória e confiabilidade (núcleo menor); monolíticos ganham em eficiência de invocação, pois a travessia entre espaços de usuário custa mais que uma chamada de sistema.",
        "Micronúcleos não suportam sistemas de arquivos.",
        "Monolíticos só rodam em mainframes; micronúcleos, em qualquer máquina."
      ],
      answer: 1,
      explanation:
        "No micronúcleo, os serviços viram servidores fora do núcleo: " +
        "extensível, modular e com menos código privilegiado; o preço é cada " +
        "invocação atravessar espaços de endereçamento. As estratégias mistas " +
        "(SPIN, L4, Exonúcleo) tentaram vários pontos intermediários, e a " +
        "virtualização acabou herdando a missão."
    },
    {
      question:
        "Segundo a condição de Popek e Goldberg, por que a família x86 clássica é difícil de virtualizar totalmente, e como a paravirtualização do Xen contorna isso?",
      options: [
        "Porque o x86 não tem registrador de modo; o Xen adiciona um por software.",
        "Porque o x86 tem instruções demais; o Xen remove as que não usa.",
        "Porque 17 instruções sensíveis do x86 NÃO são privilegiadas (não podem ser capturadas pelo hipervisor); o Xen porta o SO convidado (instruções privilegiadas viram hiperchamadas e os efeitos das sensíveis são tratados no próprio convidado) em troca de desempenho.",
        "Porque o x86 só tem dois anéis de privilégio, insuficientes para qualquer virtualização."
      ],
      answer: 2,
      explanation:
        "A condição exige que toda instrução sensível seja privilegiada, para o " +
        "hipervisor capturá-la; o x86 clássico viola isso com 17 instruções " +
        "(como LAR e LSL). A virtualização total resolve com uma camada de " +
        "simulação (cara); a paravirtualização reescreve o convidado: " +
        "hiperchamadas no anel 0, convidado no anel 1, aplicativos no anel 3."
    }
  ],

  glossary: [
    {
      term: "Sistema operacional de rede",
      definition:
        "Sistema operacional com rede incorporada, capaz de acessar recursos " +
        "remotos (NFS, ssh), mas em que cada nó mantém autonomia sobre seus " +
        "próprios processos. Há várias imagens do sistema, uma por nó. UNIX e " +
        "Windows são exemplos; é sobre eles que o middleware constrói os " +
        "sistemas distribuídos."
    },
    {
      term: "Sistema operacional distribuído",
      definition:
        "Sistema operacional que apresenta uma imagem única do sistema para " +
        "todos os recursos de um sistema distribuído: o SO controla todos os " +
        "nós e dispara processos no nó mais conveniente, transparentemente. Não " +
        "existe em uso geral: pelo investimento em aplicativos existentes e " +
        "pela perda de autonomia dos nós."
    },
    {
      term: "Núcleo (kernel)",
      definition:
        "Programa carregado desde a inicialização que executa com privilégios " +
        "completos sobre os recursos físicos (modo supervisor). Configura " +
        "espaços de endereçamento, trata chamadas de sistema (via TRAP) e " +
        "garante que nenhum outro código controle o hardware de formas " +
        "inaceitáveis."
    },
    {
      term: "Ambiente de execução",
      definition:
        "A unidade de gerenciamento de recursos de um processo: espaço de " +
        "endereçamento, recursos de sincronização e comunicação entre threads " +
        "(semáforos, soquetes) e recursos de mais alto nível (arquivos, " +
        "janelas). Caro de criar; suas threads compartilham tudo o que ele " +
        "contém."
    },
    {
      term: "Thread",
      definition:
        "Abstração do sistema operacional para uma atividade (um “fio de " +
        "execução”) dentro de um ambiente de execução. Threads são baratas de " +
        "criar e chavear, compartilham os recursos do processo, e, por isso " +
        "mesmo, não são protegidas umas das outras: exigem sincronização " +
        "(monitores, variáveis de condição)."
    },
    {
      term: "Cópia na escrita (copy-on-write)",
      definition:
        "Otimização para copiar regiões de memória: os quadros ficam " +
        "compartilhados entre origem e destino, protegidos contra escrita; a " +
        "primeira tentativa de escrita gera uma exceção de erro de página e só " +
        "então o quadro atingido é fisicamente copiado. Regiões nunca " +
        "modificadas nunca são copiadas."
    },
    {
      term: "Arquiteturas de servidor multithreaded",
      definition:
        "Formas de mapear requisições em threads num servidor: conjunto de " +
        "trabalhadores (pool fixo + fila), thread por requisição (paralelismo " +
        "máximo, custo de criação), thread por conexão e thread por objeto " +
        "(menos criação, risco de desequilíbrio entre filas)."
    },
    {
      term: "Ativações do escalonador",
      definition:
        "Esquema híbrido de escalonamento em que o núcleo aloca processadores " +
        "virtuais aos processos e notifica o escalonador em nível de usuário " +
        "por upcalls (thread bloqueou, desbloqueou, processador preemptado), " +
        "permitindo que nenhuma thread pronta fique parada havendo processador " +
        "disponível."
    },
    {
      term: "RPC leve (LRPC)",
      definition:
        "Mecanismo otimizado de invocação entre processos do MESMO computador: " +
        "argumentos passam por uma pilha A em região de memória compartilhada " +
        "(uma cópia, em vez de quatro) e a própria thread do cliente executa o " +
        "procedimento no domínio do servidor, sob validação do núcleo: cerca " +
        "de 3× mais rápida que a RPC local convencional."
    },
    {
      term: "Micronúcleo",
      definition:
        "Arquitetura de núcleo que fornece apenas as abstrações mais básicas (" +
        "espaços de endereçamento, threads e comunicação local entre processos" +
        ") deixando todos os demais serviços para servidores carregados " +
        "dinamicamente, acessados por mensagens. Ganha em extensibilidade e " +
        "modularidade; perde em custo de invocação."
    },
    {
      term: "Hipervisor (monitor de máquina virtual)",
      definition:
        "Camada fina de software sobre a arquitetura física que fornece várias " +
        "máquinas virtuais, multiplexando entre elas os recursos reais " +
        "(processadores, memória). Na virtualização total, oferece interface " +
        "idêntica ao hardware; no Xen, é deliberadamente mínimo, com o " +
        "domínio0 como plano de controle."
    },
    {
      term: "Paravirtualização",
      definition:
        "Estratégia de virtualização em que o sistema operacional convidado é " +
        "modificado (portado): instruções privilegiadas viram hiperchamadas ao " +
        "hipervisor e os efeitos das instruções sensíveis não privilegiadas são " +
        "tratados no próprio convidado. Contorna as violações da condição de " +
        "Popek e Goldberg (17 instruções no x86 clássico) com desempenho muito " +
        "superior ao da simulação."
    }
  ],

  references: [
    "COULOURIS, G.; DOLLIMORE, J.; KINDBERG, T.; BLAIR, G. Sistemas Distribuídos: " +
    "Conceitos e Projeto. 5. ed. Porto Alegre: Bookman, 2013. Cap. 7. Sistema " +
    "Operacional (pp. 279-334).",
    "VAN STEEN, M.; TANENBAUM, A. S. Distributed Systems. 4. ed. (versão DS 4.03). " +
    "distributed-systems.net. Cap. 3. Processes (leitura complementar: threads, " +
    "virtualização, clientes, servidores e migração de código).",
    "HWANG, K.; FOX, G.; DONGARRA, J. Distributed and Cloud Computing. Waltham: " +
    "Morgan Kaufmann, 2011. Cap. 3. Virtual Machines and Virtualization of " +
    "Clusters and Data Centers (leitura complementar: níveis de virtualização (" +
    "inclusive em nível de SO, a base dos contêineres) e gerenciamento de MVs).",
    "TANENBAUM, A. S.; BOS, H. Sistemas Operacionais Modernos. 4. ed. São Paulo: " +
    "Pearson, 2016. (Bibliografia complementar da disciplina: fundamentos de " +
    "processos, threads, escalonamento e memória.)"
  ]
};
