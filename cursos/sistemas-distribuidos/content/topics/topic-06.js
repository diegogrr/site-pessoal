/* ============================================================
   topic-06.js — Sistemas Operacionais Distribuídos
   ------------------------------------------------------------
   Estrutura documentada no modelo topic-01.js (sections[] com
   slides[] opcionais, quiz[], glossary[], references[]).
   Fundamentação: manifesto em docs/fontes/topico-06.json, que liga
   cada seção às páginas que a autorizam. Hierarquia de fontes em
   docs/fontes/README.md — o Coulouris (cap. 7) dá o esqueleto e o
   van Steen 4. ed. (cap. 3) manda no conteúdo.
   ============================================================ */

window.SD = window.SD || {};
SD.content = SD.content || {};

SD.content["06"] = {

  sections: [
    {
      title: "A camada do sistema operacional",
      html:
        "<p>O tópico 5 mostrou o middleware fazendo o trabalho pesado da invocação " +
        "remota, com stubs, despachantes e retransmissões acontecendo sem que o " +
        "programador escreva uma linha para isso. Fica a pergunta de quem sustenta o " +
        "middleware. Abaixo dele está a <strong>camada do sistema operacional</strong>, " +
        "e é o sistema operacional de cada nó que fornece processos, threads, memória e " +
        "comunicação, que são as abstrações sobre as quais o middleware constrói as " +
        "suas.</p>" +
        "<p>Este tópico desce um andar e faz uma pergunta de fronteira. Até que ponto o " +
        "sistema operacional consegue atender ao que o middleware exige, que é acesso " +
        "eficiente e robusto aos recursos físicos? O par formado pelo sistema " +
        "operacional e pelo hardware de um nó chama-se <strong>plataforma</strong>, e a " +
        "dificuldade nasce de o middleware precisar rodar sobre muitas plataformas " +
        "diferentes ao mesmo tempo.</p>" +
        "<h3>Sistema operacional de rede e sistema operacional distribuído</h3>" +
        "<p>Linux e Windows são <strong>sistemas operacionais de rede</strong>. Eles têm " +
        "rede incorporada e alcançam recursos remotos sem dificuldade, montando um " +
        "sistema de arquivos de outra máquina ou abrindo uma sessão remota. Mesmo assim, " +
        "cada nó mantém autonomia sobre os próprios processos, o que significa que existe " +
        "uma imagem do sistema por nó.</p>" +
        "<p>No extremo oposto estaria o <strong>sistema operacional distribuído</strong>, " +
        "com uma imagem única do sistema. Nele o sistema operacional controlaria todos os " +
        "nós e dispararia cada processo no nó mais conveniente, de forma transparente " +
        "para quem programa. A ideia existe desde os anos 1980 e ainda assim não há " +
        "sistema operacional distribuído de uso geral em produção.</p>" +
        "<p>Duas razões explicam essa ausência, e nenhuma delas é técnica no sentido " +
        "estrito. A primeira é o investimento acumulado em software aplicativo, porque " +
        "ninguém troca de sistema operacional em nome da eficiência se os programas que " +
        "usa deixarem de funcionar, e emular um sistema já estabelecido sobre um núcleo " +
        "novo nunca alcançou desempenho satisfatório. A segunda é a autonomia, porque o " +
        "usuário quer mandar na própria máquina e não aceita de bom grado que o processo " +
        "de outra pessoa dispute o processador dele.</p>" +
        "<p>O arranjo que venceu combina as duas coisas. O sistema operacional de rede " +
        "preserva a autonomia local, e o middleware constrói os serviços distribuídos por " +
        "cima dele. Isso explica por que este tópico existe, já que entender o que o " +
        "andar de baixo oferece é entender o que o andar de cima teve de inventar.</p>" +
        "<h3>O que o sistema operacional precisa fornecer</h3>" +
        "<p>Quem gerencia recursos são os núcleos e os processos servidores, e deles se " +
        "exigem três coisas.</p>" +
        "<ul>" +
        "<li>O <strong>encapsulamento</strong> expõe uma interface de serviço útil e " +
        "esconde os detalhes de memória e de dispositivo por trás dela.</li>" +
        "<li>A <strong>proteção</strong> impede que um recurso seja acessado de forma " +
        "ilegítima.</li>" +
        "<li>O <strong>processamento concorrente</strong> permite que vários clientes " +
        "compartilhem o mesmo recurso ao mesmo tempo, sem que um perceba o outro.</li>" +
        "</ul>" +
        "<p>Acessar um recurso encapsulado é o que se chama de mecanismo de invocação, e " +
        "tanto uma chamada de sistema quanto uma invocação remota se encaixam nessa " +
        "descrição. Toda invocação envolve duas partes, a comunicação, que leva " +
        "parâmetros e traz resultados, e o escalonamento, que agenda o processamento " +
        "dentro do nó que atende. Por dentro, o sistema operacional se divide em " +
        "gerências de processos, de threads, de comunicação e de memória, mais um " +
        "supervisor que cuida de interrupções, chamadas de sistema e exceções.</p>" +
        "<h3>Proteção, e o preço que ela cobra</h3>" +
        "<p>A ameaça que a proteção enfrenta não é só o código malicioso. Código benigno " +
        "com defeito corrompe recurso da mesma forma, e o mecanismo precisa dar conta dos " +
        "dois. Além de decidir quem pode ler e quem pode escrever, ele precisa impedir " +
        "operações que sequer fazem parte da interface do recurso, como apontar o " +
        "ponteiro de leitura de um arquivo para um número qualquer.</p>" +
        "<p>Um caminho é a linguagem fortemente tipada, em que o programa simplesmente " +
        "não consegue formar uma referência inválida, e sem referência válida não há " +
        "acesso. O caminho universal, porém, é o hardware, com ajuda do " +
        "<strong>núcleo</strong>, que é o programa carregado na inicialização e o único " +
        "que executa com privilégio total.</p>" +
        "<p>O processador tem um registrador de modo que sustenta essa divisão. O núcleo " +
        "roda em <strong>modo supervisor</strong> e todo o resto roda em <strong>modo " +
        "usuário</strong>. Cada processo ganha um <strong>espaço de " +
        "endereçamento</strong>, que é o conjunto de intervalos de memória virtual a que " +
        "ele tem direito, e não enxerga nada fora dele.</p>" +
        "<p>Para invocar o núcleo, o processo executa uma <strong>chamada de " +
        "sistema</strong>. Uma instrução especial põe o processador em modo supervisor e " +
        "salta para um tratador que pertence ao núcleo, e não ao programa que chamou, o " +
        "que garante que ninguém obtenha controle ilícito do hardware pelo caminho.</p>" +
        "<p>Guarde o preço disso, porque ele volta duas seções adiante. Cada travessia " +
        "entre espaços de endereçamento custa muitos ciclos de processador, e é esse " +
        "custo que transforma uma invocação aparentemente simples em algo caro.</p>",
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
            "<li>A <strong>chamada de sistema</strong> desvia para um tratador que pertence "
            + "ao núcleo, e não ao programa que chamou</li>" +
            "<li>Cada travessia custa <strong>muitos ciclos</strong>: lembre " +
            "disso adiante</li>" +
            "</ul>"
        }
      ]
    },
    {
      title: "Processos e threads",
      html:
        "<p>Nos anos 1980 ficou claro que o processo tradicional, com um único fluxo de " +
        "execução, não servia bem a sistemas distribuídos. Compartilhar recursos entre " +
        "atividades relacionadas saía caro e complicado, porque cada atividade exigia um " +
        "processo inteiro só para si.</p>" +
        "<p>A solução foi partir o conceito em dois. Um <strong>processo</strong> passou " +
        "a ser um <strong>ambiente de execução</strong>, que é a unidade de gerenciamento " +
        "de recursos e reúne o espaço de endereçamento, os soquetes, os arquivos abertos " +
        "e os semáforos. Dentro dele vivem uma ou mais <strong>threads</strong>, que são " +
        "a abstração de uma atividade em andamento.</p>" +
        "<p>A assimetria entre os dois é o que torna a divisão útil. O ambiente é caro de " +
        "criar, porque envolve montar tabelas de memória e adquirir recursos junto ao " +
        "núcleo. A thread é barata, porque nasce dentro de um ambiente que já existe e " +
        "usa tudo o que está lá.</p>" +
        "<p>Convém acrescentar uma distinção que explica de onde vem esse custo. O " +
        "processador guarda um <strong>contexto de processador</strong>, que é o conteúdo " +
        "mínimo de registradores para continuar de onde parou, incluindo o contador de " +
        "programa e o ponteiro de pilha. O <strong>contexto de thread</strong> é esse " +
        "contexto de processador mais o estado que a biblioteca de threads mantém. Já o " +
        "<strong>contexto de processo</strong> acrescenta o mapeamento de memória e os " +
        "recursos do núcleo, e é justamente ele que torna a troca entre processos cara, " +
        "porque trocar o mapeamento de memória invalida boa parte das caches.</p>" +
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
        "<p>O espaço de endereçamento tem 2<sup>32</sup> ou 2<sup>64</sup> bytes e é um " +
        "conjunto esparso de <strong>regiões</strong> que não se sobrepõem. As três " +
        "clássicas são o texto, que guarda o código, o heap e a pilha.</p>" +
        "<p>Sobre essa base o sistema acrescenta outras. Cada thread ganha uma pilha " +
        "separada, e ultrapassar o limite de uma delas gera um erro de página que o " +
        "sistema consegue detectar em vez de deixar o programa corromper a pilha " +
        "vizinha. Os arquivos mapeados fazem um arquivo ser acessado como se fosse um " +
        "vetor de bytes na memória, o que dispensa chamadas de leitura e escrita.</p>" +
        "<p>Há ainda as regiões compartilhadas entre processos, e elas resolvem três " +
        "problemas diferentes. Uma biblioteca usada por muitos programas fica em uma " +
        "cópia só, em vez de uma por processo. O próprio núcleo é mapeado em todo espaço " +
        "de endereçamento, o que evita trocar mapeamentos a cada chamada de sistema. E " +
        "dados de comunicação podem ficar numa região compartilhada, o que é bem mais " +
        "eficiente do que copiar mensagens, como a próxima seção mostra.</p>" +
        "<h3>Criar um processo em um sistema distribuído</h3>" +
        "<p>Criar um processo num sistema distribuído envolve duas decisões " +
        "independentes, e vale tratá-las separadamente porque elas têm literatura " +
        "própria.</p>" +
        "<p>A primeira decisão é em qual nó o processo vai nascer. A política de " +
        "transferência decide se ele nasce local ou remoto, e a política de localização " +
        "escolhe qual é o nó de destino. Essa escolha pode ser estática, seguindo regras " +
        "fixas que não olham o estado do sistema, ou adaptativa, aplicando heurísticas " +
        "sobre a carga medida naquele momento.</p>" +
        "<p>Os sistemas de balanceamento de carga variam em duas dimensões. Quanto à " +
        "organização, eles podem ser centralizados, hierárquicos ou descentralizados. " +
        "Quanto a quem toma a iniciativa, ela pode partir da origem, com o nó " +
        "sobrecarregado procurando ajuda, ou do destino, com o nó ocioso se anunciando.</p>" +
        "<p>Migrar um processo que já está em execução é possível e é raro na prática, " +
        "porque extrair o estado de dentro do núcleo é caro e difícil. A lição que Eager " +
        "e colegas tiraram das medições recomenda simplicidade, já que o custo de coletar " +
        "informação e decidir pode consumir a vantagem que o balanceamento traria.</p>" +
        "<p>A segunda decisão é como montar o ambiente de execução do processo novo. Ou o " +
        "formato é estático, definido de antemão, ou é derivado do processo pai, como " +
        "acontece na chamada <code>fork</code>.</p>" +
        "<p>A otimização clássica dessa segunda decisão chama-se <strong>cópia na " +
        "escrita</strong>. A região herdada do pai é copiada sem que haja cópia física, " +
        "porque os quadros de memória ficam compartilhados entre os dois processos e " +
        "protegidos contra escrita. Só quando um dos lados tenta escrever é que o quadro " +
        "atingido é de fato duplicado, e quem é duplicado é apenas aquele quadro. O " +
        "processo que nunca escreve nunca paga a cópia.</p>" +
        "<h3>Threads no servidor, e as contas que justificam</h3>" +
        "<p>A pergunta de por que servidores usam várias threads tem resposta " +
        "aritmética, e vale acompanhar a conta porque ela mostra algo que se repete em " +
        "todo ajuste de desempenho. Suponha requisições que custam 2 ms de processador " +
        "mais 8 ms de disco.</p>" +
        "<p>Com uma única thread, cada requisição ocupa o servidor por 10 ms, porque a " +
        "thread fica parada esperando o disco. O teto é de 100 requisições por segundo.</p>" +
        "<p>Com duas threads, uma computa enquanto a outra espera o disco, e o gargalo " +
        "passa a ser o próprio disco, com seus 8 ms. O teto sobe para 125 por segundo.</p>" +
        "<p>Acrescente agora uma cache de blocos que acerta em 75% dos casos. A espera " +
        "média de entrada e saída cai para 2 ms, mas o processamento sobe para 2,5 ms, " +
        "porque manter a cache custa trabalho. O teto vai a 400 por segundo, e o gargalo " +
        "mudou de lado, sendo agora o processador. Num multiprocessador de dois núcleos, " +
        "três ou mais threads chegam a 500 por segundo.</p>" +
        "<p>Duas lições saem da conta. As threads convertem tempo de espera em vazão, e " +
        "cada otimização move o gargalo de lugar em vez de eliminá-lo. Otimizar sem saber " +
        "onde está o gargalo atual é gastar esforço no lugar errado.</p>" +
        "<p>Organizar essas threads tem quatro arranjos correntes. O <strong>conjunto de " +
        "trabalhadores</strong> mantém um número fixo de threads consumindo uma fila de " +
        "requisições, que pode ter prioridades. A <strong>thread por requisição</strong> " +
        "dá o máximo de paralelismo e paga o custo de criar e destruir a cada pedido. A " +
        "<strong>thread por conexão</strong> e a <strong>thread por objeto</strong> criam " +
        "menos threads, em troca do risco de uma fila ficar desequilibrada enquanto outra " +
        "está vazia.</p>" +
        "<p>O cliente também ganha com várias threads, e por uma razão diferente. O " +
        "navegador busca as imagens de uma página em paralelo, com uma thread produzindo " +
        "os pedidos enquanto outras ficam bloqueadas esperando as respostas remotas. Aqui " +
        "o objetivo não é vazão, e sim esconder a latência da rede de quem está " +
        "olhando.</p>" +
        "<h3>Threads ou processos, e quem escalona</h3>" +
        "<p>Tudo o que a seção anterior descreve poderia ser feito com vários processos " +
        "de uma thread só. A escolha por threads se sustenta em custo e em conveniência.</p>" +
        "<p>O custo aparece nas medições clássicas de Anderson e colegas. Criar uma " +
        "thread leva cerca de 1 ms e criar um processo leva cerca de 11 ms, uma ordem de " +
        "grandeza acima. Chavear entre threads do mesmo ambiente custa 0,4 ms, ou 0,04 ms " +
        "quando o chaveamento acontece em nível de usuário, contra 1,8 ms para chavear " +
        "entre processos. A diferença vem da transição de domínio, que troca o mapeamento " +
        "de memória e invalida caches.</p>" +
        "<p>A conveniência é que threads do mesmo ambiente compartilham dados " +
        "diretamente na memória, sem precisar de mecanismo de comunicação. Essa mesma " +
        "conveniência é o risco, porque threads do mesmo ambiente não são protegidas umas " +
        "das outras, e a sincronização passa a ser responsabilidade de quem programa.</p>" +
        "<p>Onde as threads são implementadas também muda o comportamento do sistema. No " +
        "<strong>núcleo</strong>, como em Linux e Windows, o núcleo escalona cada thread " +
        "individualmente, o que permite aproveitar multiprocessador de verdade. Em " +
        "<strong>nível de usuário</strong>, uma biblioteca cuida disso, o chaveamento " +
        "fica baratíssimo, o escalonador pode ser personalizado e milhares de threads " +
        "tornam-se viáveis.</p>" +
        "<p>O nível de usuário tem dois defeitos que decidem a escolha na prática. Uma " +
        "chamada de sistema bloqueante feita por uma thread trava o processo inteiro, " +
        "porque o núcleo não sabe que existem outras, e não há paralelismo real, porque " +
        "para o núcleo existe um processo só.</p>" +
        "<p>Os projetos híbridos tentam ficar com o melhor dos dois. O Solaris pôs " +
        "threads de usuário sobre processos leves do núcleo. As <strong>ativações do " +
        "escalonador</strong> foram além, com o núcleo fazendo chamadas para cima que " +
        "avisam o escalonador de usuário quando uma thread bloqueou ou quando um " +
        "processador foi tomado, de modo que nenhuma thread pronta fique parada havendo " +
        "processador virtual disponível.</p>",
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
        "<p>Uma pergunta de projeto atravessa esta seção. Que primitivas de comunicação o " +
        "sistema operacional deve entregar ao middleware?</p>" +
        "<p>Alguns núcleos de pesquisa, como o Amoeba, o V e o Chorus, apostaram em " +
        "embutir a invocação de alto nível dentro do próprio núcleo, o que economizava " +
        "chamadas de sistema. Prevaleceu o oposto. O núcleo fornece soquetes, e o " +
        "middleware constrói a invocação remota em nível de usuário, o que é mais simples " +
        "de desenvolver, mais portável e mais interoperável, já que toda plataforma " +
        "oferece uma interface de soquetes parecida.</p>" +
        "<p>Disso decorrem duas obrigações para o sistema operacional. Ele precisa " +
        "manter compatibilidade com os protocolos estabelecidos, e precisa acomodar " +
        "protocolos novos sem obrigar aplicações a mudar. A segunda obrigação se cumpre " +
        "com controladores de protocolo instaláveis e com a composição dinâmica de " +
        "pilhas, que é o que permite ao computador portátil trocar do enlace sem fio para " +
        "o cabeado ao chegar no escritório sem que a aplicação perceba.</p>" +
        "<h3>Quanto custa invocar</h3>" +
        "<p>O custo de uma invocação responde a três perguntas. Ela cruza um domínio de " +
        "proteção? Ela cruza a rede? Ela exige escalonamento e troca de contexto? Cada sim " +
        "acrescenta uma ordem de grandeza.</p>" +
        "<p>Os números tornam isso concreto. Uma chamada de procedimento convencional " +
        "custa fração de microssegundo. Uma <strong>invocação remota nula</strong>, que " +
        "não passa parâmetros e executa um procedimento vazio, custa décimos de " +
        "milissegundo entre dois processos numa rede local, centenas de vezes mais.</p>" +
        "<p>O dado seguinte é o que muda a intuição de quem está aprendendo. Os cerca de " +
        "100 bytes dessa invocação nula, a 100 megabits por segundo, gastam algo como " +
        "0,01 ms de rede. Quase todo o atraso restante é software, dividido entre o " +
        "núcleo e o código de invocação remota. A rede, que parecia a culpada, é a menor " +
        "parcela.</p>" +
        "<p>Cinco componentes formam esse custo de software. O empacotamento copia e " +
        "converte os dados. A cópia de dados repete a mensagem várias vezes, entre o " +
        "espaço do usuário e o núcleo, entre camadas de protocolo e entre o núcleo e a " +
        "interface de rede. A inicialização de pacotes monta cabeçalhos e somas de " +
        "verificação. O escalonamento e as trocas de contexto acontecem várias vezes por " +
        "invocação. E a espera por confirmações fecha a conta.</p>" +
        "<p>O atraso cresce com o tamanho dos argumentos, em degraus, porque cada pacote " +
        "novo acrescenta um salto. Disso vem uma regra prática que vale a pena guardar, " +
        "que é buscar 32 KB numa invocação em vez de em 32 invocações de 1 KB, porque a " +
        "parcela fixa é paga uma vez em vez de 32.</p>" +
        "<p>Na Internet a escala é outra. As latências vão a centenas de milissegundos, " +
        "variam bastante e passam a ser dominadas pela carga do servidor, e nesse regime " +
        "as otimizações de núcleo perdem importância diante da distância.</p>" +
        "<h3>As otimizações, e a invocação local leve</h3>" +
        "<p>O sistema operacional tem como ajudar. As regiões compartilhadas eliminam " +
        "cópias entre o espaço do usuário e o núcleo, e a arquitetura U-Net foi além, " +
        "dando à aplicação acesso direto à interface de rede e chegando a nenhuma " +
        "cópia.</p>" +
        "<p>A escolha do protocolo também pesa, e nem sempre no sentido esperado. O TCP " +
        "não é necessariamente pior que o UDP, mas os buffers do sistema operacional e a " +
        "partida lenta podem atrapalhar. O estudo de Nielsen sobre o HTTP mostrou os dois " +
        "lados disso, porque as conexões persistentes da versão 1.1 amortizam o custo de " +
        "conexão, e ajustar o comportamento dos buffers do núcleo eliminou atrasos de " +
        "espera que nada tinham a ver com a rede. O sistema operacional pode ajudar ou " +
        "atrapalhar o middleware, dependendo de como está configurado.</p>" +
        "<p>Há um caso especial que ficou mais importante com o tempo. Bershad e colegas " +
        "observaram que a maioria das invocações acontece dentro do mesmo computador, " +
        "entre processos vizinhos, e não pela rede. Otimizar esse caso rende mais do que " +
        "otimizar o caso remoto.</p>" +
        "<p>A <strong>invocação local leve</strong> faz exatamente isso. Os argumentos " +
        "passam por uma pilha em região compartilhada entre cliente e servidor, o que " +
        "reduz de quatro cópias para uma. E em vez de acordar uma thread do servidor, a " +
        "própria thread do cliente executa o procedimento dentro do domínio do servidor, " +
        "com o núcleo validando a entrada. O resultado medido é três vezes mais rápido " +
        "que a invocação local convencional.</p>" +
        "<p>A transparência sobrevive a essa otimização, o que é o ponto elegante do " +
        "mecanismo. Um único bit, definido no momento da vinculação, decide se a chamada " +
        "segue o caminho leve ou o caminho remoto, e a aplicação escreve o mesmo código " +
        "nos dois casos.</p>" +
        "<h3>Quando a latência é alta, opere de forma assíncrona</h3>" +
        "<p>Na Internet e no mundo móvel a latência vence qualquer otimização de núcleo. " +
        "Duas respostas de projeto existem para isso.</p>" +
        "<p>A primeira são as <strong>invocações concorrentes</strong>, em que chamadas " +
        "bloqueantes acontecem em várias threads ao mesmo tempo. O navegador que busca as " +
        "imagens de uma página em paralelo é o exemplo cotidiano.</p>" +
        "<p>A segunda são as <strong>invocações assíncronas</strong>, em que a chamada " +
        "retorna imediatamente e o resultado chega depois. No sistema Mercury, a operação " +
        "assíncrona devolve uma <strong>promessa</strong>, que representa um resultado " +
        "futuro, e o chamador pode bloquear até que ela esteja pronta ou apenas testar se " +
        "já está. Se o nome soa familiar, deveria, porque é a mesma ideia que hoje " +
        "aparece em quase toda linguagem sob o nome de promessa ou futuro.</p>" +
        "<p>A forma mais radical é a <strong>invocação assíncrona persistente</strong>. " +
        "Sem conexão disponível, as requisições esperam num registro estável em disco, e " +
        "quando o enlace volta elas são enviadas por ordem de prioridade. A resposta pode " +
        "até chegar por outro enlace, sendo depositada numa caixa de correio do " +
        "cliente.</p>" +
        "<p>Repare no que essa última forma faz com a definição de falha. A desconexão " +
        "deixa de ser um erro a tratar e passa a ser apenas latência muito alta, o que " +
        "muda todo o desenho da aplicação. O tópico de computação móvel retoma essa " +
        "ideia.</p>",
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
            "<li>Chamada local custa fração de microssegundo. <strong>Invocação remota " +
            "nula, em rede local, custa décimos de milissegundo</strong></li>" +
            "<li>Rede: ~0,01 ms: <strong>o resto é software</strong></li>" +
            "<li>Vilões: empacotamento · <strong>cópias</strong> · cabeçalhos · " +
            "trocas de contexto · confirmações</li>" +
            "<li>A parcela fixa manda. Buscar 32 KB em <strong>uma</strong> invocação bate "
            + "buscar em 32 invocações de 1 KB</li>" +
            "</ul>"
        },
        {
          title: "Memória compartilhada e invocação local leve",
          html:
            "<ul>" +
            "<li>Regiões compartilhadas: menos cópias (U-Net: zero)</li>" +
            "<li>Maioria das invocações: <strong>mesmo computador</strong></li>" +
            "<li>A <strong>invocação local leve</strong> passa os argumentos por uma pilha " +
            "compartilhada, com uma cópia em vez de quatro, e faz a thread do cliente " +
            "executar dentro do domínio do servidor</li>" +
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
        "<p>Um sistema distribuído aberto exige três coisas do arranjo do software " +
        "básico. Cada computador deve rodar apenas o que precisa, os serviços devem poder " +
        "ser trocados e acrescentados sem quebrar o resto, e a proteção entre eles precisa " +
        "continuar valendo.</p>" +
        "<p>O princípio de projeto que sustenta isso é separar <strong>mecanismo</strong> " +
        "de <strong>política</strong>. O mecanismo é o que o núcleo fornece, e a política " +
        "é o que cada aplicação decide fazer com ele. Daí sai a pergunta arquitetural " +
        "clássica, que é quanto deve viver dentro do núcleo.</p>" +
        "<h3>Núcleo monolítico e micronúcleo</h3>" +
        "<p>O núcleo <strong>monolítico</strong> executa todas as funções básicas dentro " +
        "de si, o que dá megabytes de código com os servidores embutidos. O nome vem " +
        "daí, porque o resultado é maciço e pouco diferenciado, e por isso mesmo difícil " +
        "de modificar.</p>" +
        "<p>O <strong>micronúcleo</strong> inverte a aposta. O núcleo fornece apenas as " +
        "abstrações mínimas, que são espaços de endereçamento, threads e comunicação " +
        "local entre processos. Todo o resto, incluindo o sistema de arquivos e a rede, " +
        "vira servidor carregado dinamicamente e acessado por passagem de mensagens. " +
        "Sobre um micronúcleo é possível até emular sistemas operacionais inteiros, e o " +
        "Mach chegou a hospedar dois deles ao mesmo tempo.</p>" +
        "<p>O placar entre os dois é claro e não tem vencedor absoluto. O micronúcleo " +
        "ganha em extensibilidade, em modularidade imposta pela própria proteção de " +
        "memória e em confiabilidade, já que um núcleo pequeno tem menos lugares onde " +
        "errar. O monolítico ganha em eficiência de invocação, porque uma chamada de " +
        "sistema é mais barata que uma travessia entre espaços de usuário.</p>" +
        "<p>As estratégias mistas exploram o meio do caminho, e cada uma abre mão de algo " +
        "diferente. O Mach e o Chorus passaram a carregar servidores dentro do núcleo, o " +
        "que permite depurar em nível de usuário e executar em nível de núcleo, ao preço " +
        "de perder a proteção. O Spin trocou a proteção por hardware pela proteção por " +
        "linguagem, com tudo escrito em Modula-3 num espaço só. O quarto núcleo da linhagem "
        + "de Liedtke manteve os servidores " +
        "fora e investiu em otimizar a comunicação até o osso. O exonúcleo foi ao extremo " +
        "oposto, entregando recursos crus como blocos de disco e pondo até o sistema de " +
        "arquivos em bibliotecas de aplicação.</p>" +
        "<p>O balanço de Liedtke, um dos projetistas, resume bem a trajetória ao dizer " +
        "que a história do micronúcleo está repleta de boas ideias e de becos escuros. " +
        "Quem herdou a missão de sustentar vários sistemas com proteção entre eles não foi " +
        "o micronúcleo, e sim a virtualização.</p>" +
        "<h3>Virtualização</h3>" +
        "<p>Threads e processos permitem fazer mais de uma coisa ao mesmo tempo, e num " +
        "processador de núcleo único essa simultaneidade é ilusão, criada por chaveamento " +
        "rápido. Separar o recurso real do recurso aparente é uma ideia que se estende " +
        "muito além do processador, e é isso que se chama de virtualização de recursos.</p>" +
        "<p>Na essência, virtualizar é estender ou substituir uma interface existente " +
        "para imitar o comportamento de outro sistema. Para entender as variantes, ajuda " +
        "saber que um computador oferece interfaces em três níveis. Há o conjunto de " +
        "instruções de máquina, dividido entre instruções privilegiadas, que só o sistema " +
        "operacional pode executar, e instruções gerais, que qualquer programa executa. Há " +
        "as chamadas de sistema oferecidas pelo sistema operacional. E há as chamadas de " +
        "biblioteca, que costumam esconder as chamadas de sistema atrás de uma interface " +
        "de programação.</p>" +
        "<p>Virtualizar cada um desses níveis produz coisas diferentes.</p>" +
        "<ul>" +
        "<li>A <strong>máquina virtual de processo</strong> fornece um conjunto abstrato " +
        "de instruções para executar aplicações, interpretando ou emulando. O ambiente de " +
        "execução do Java é o exemplo conhecido, e a virtualização vale para um processo " +
        "só.</li>" +
        "<li>O <strong>monitor nativo de máquina virtual</strong> é uma camada colocada " +
        "diretamente sobre o hardware, que oferece o conjunto completo de instruções como " +
        "interface. Vários sistemas operacionais convidados rodam sobre ele ao mesmo " +
        "tempo e de forma independente.</li>" +
        "<li>O <strong>monitor hospedado</strong> roda sobre um sistema operacional " +
        "hospedeiro em vez de sobre o hardware nu, o que lhe permite reaproveitar os " +
        "controladores de dispositivo que já existem em vez de reescrevê-los. É a forma " +
        "mais usada em centros de dados e em nuvem.</li>" +
        "</ul>" +
        "<p>As razões para virtualizar mudaram com o tempo, e a mudança explica por que o " +
        "assunto voltou à moda. Nos anos 1970 a razão era executar software antigo em " +
        "hardware caro de grande porte. Hoje a razão principal é a portabilidade, porque " +
        "o software de nível mais alto envelhece bem mais devagar que a plataforma sob " +
        "ele, e virtualizar permite levar as interfaces antigas para plataformas novas. " +
        "Some a isso o isolamento de código, que é o que torna a virtualização " +
        "indispensável em nuvem, ao mesmo tempo em que abre ameaças de segurança " +
        "próprias.</p>" +
        "<p>Na <strong>virtualização total</strong>, o hipervisor oferece uma interface " +
        "idêntica à do hardware, e o sistema operacional convidado roda sem modificação " +
        "alguma. O critério teórico que diz quando isso é viável vem de Popek e Goldberg, " +
        "em 1974. Uma arquitetura é virtualizável se toda instrução sensível, ou seja, " +
        "toda instrução que altera ou depende da configuração real da máquina, for também " +
        "privilegiada, e portanto capturável pelo hipervisor quando executada em modo " +
        "usuário.</p>" +
        "<p>O x86 clássico falha nesse critério, e falha por pouco, com 17 instruções " +
        "sensíveis que não são privilegiadas. Cada uma delas pode ser executada em modo " +
        "usuário sem provocar desvio para o sistema operacional, e ainda assim afeta o " +
        "modo como ele gerencia recursos. Virtualização total ali exige varrer o " +
        "executável e inserir código em volta dessas instruções para desviar o controle " +
        "ao hipervisor, que é o caminho seguido pelo VMware.</p>" +
        "<p>A <strong>paravirtualização</strong> aceita a troca oposta. Ela modifica o " +
        "sistema operacional convidado, de modo que as instruções problemáticas ou deixem " +
        "de existir ou passem a ter o mesmo significado nos dois modos. Instruções " +
        "privilegiadas viram <strong>hiperchamadas</strong> ao hipervisor. O preço é " +
        "precisar portar o convidado, e o ganho é desempenho bem melhor.</p>" +
        "<h3>Estudo de caso: Xen</h3>" +
        "<p>O Xen nasceu num projeto de pesquisa em Cambridge e virou a referência de " +
        "paravirtualização. Vale olhar três decisões dele, porque cada uma ilustra um " +
        "princípio que a seção anterior enunciou.</p>" +
        "<p>A primeira decisão é o hipervisor ser deliberadamente mínimo, cuidando apenas " +
        "de virtualizar o processador, escalonar e gerenciar a memória física. O " +
        "raciocínio é direto, porque uma falha no hipervisor derruba todas as máquinas " +
        "virtuais de uma vez, e um componente pequeno e muito testado erra menos. É a " +
        "mesma separação entre mecanismo e política que o exonúcleo defendia, agora com o " +
        "mecanismo no hipervisor e a política fora dele.</p>" +
        "<p>A segunda decisão aparece na distribuição de privilégio. No x86, o hipervisor " +
        "ocupa o anel de privilégio máximo, os sistemas operacionais convidados descem " +
        "para o anel intermediário e as aplicações continuam no anel de menor privilégio. " +
        "O convidado, que antes mandava na máquina, passa a ter alguém acima dele.</p>" +
        "<p>A terceira decisão é a existência de um domínio privilegiado. As máquinas " +
        "virtuais do Xen chamam-se domínios, e a maioria delas não tem privilégio sobre o " +
        "hardware. Um domínio especial foge à regra e funciona como plano de controle, " +
        "concentrando os controladores de dispositivo reais e criando, destruindo e " +
        "configurando os demais.</p>" +
        "<p>Uma consequência interessante do arranjo é o escalonamento ganhar um nível a " +
        "mais. O hipervisor escalona processadores virtuais sobre os processadores " +
        "físicos, cada convidado escalona as suas threads sobre os processadores virtuais " +
        "que recebeu, e as bibliotecas de nível de usuário ainda podem escalonar threads " +
        "por conta própria. Três escalonadores empilhados tomam decisões sem saber uns dos " +
        "outros, o que é uma fonte conhecida de comportamento difícil de prever.</p>" +
        "<p>Convém registrar de onde tudo isso veio. O projeto original previa servidores " +
        "públicos executando código de clientes mediante cobrança, com registro e " +
        "descoberta de recursos. Em 2003, isso era um retrato antecipado da infraestrutura " +
        "como serviço que o tópico de nuvem examina.</p>" +
        "<h3>Contêineres</h3>" +
        "<p>A máquina virtual resolve o caso em que a aplicação depende de um conjunto de " +
        "instruções e de um sistema operacional específicos. Acontece que boa parte das " +
        "aplicações é estável quanto a essas duas coisas e depende, na verdade, de " +
        "bibliotecas e de programas de apoio. O que se quer nesse caso é outra coisa, e " +
        "carregar um sistema operacional inteiro para consegui-la é desproporcional.</p>" +
        "<p>O que se quer é que aplicações rodem lado a lado, cada uma com o próprio " +
        "ambiente de software, sem sequer perceber que existem outras com ambientes " +
        "diferentes. É esse o problema que o <strong>contêiner</strong> resolve, " +
        "virtualizando o ambiente de software em vez da máquina.</p>" +
        "<p>Um contêiner é uma coleção de binários que, juntos, formam o ambiente de " +
        "execução de uma aplicação. A maneira mais fácil de imaginá-lo é pensar no que " +
        "alguém vê ao entrar num sistema Unix, com diretórios de programas executáveis, " +
        "bibliotecas e documentação.</p>" +
        "<p>Uma implementação ingênua copiaria esse ambiente inteiro para um " +
        "subdiretório e faria a aplicação enxergar aquele subdiretório como se fosse a " +
        "raiz. Ela funcionaria, e falharia em três exigências. Os processos de contêineres " +
        "diferentes precisam ficar isolados uns dos outros, copiar o ambiente inteiro " +
        "desperdiça espaço quando as bibliotecas se repetem, e o sistema hospedeiro " +
        "precisa manter controle sobre o consumo dos próprios recursos.</p>" +
        "<p>Em Linux, três mecanismos atendem a essas três exigências, e vale conhecê-los " +
        "pelo nome porque é assim que aparecem na documentação.</p>" +
        "<ul>" +
        "<li>Os <strong>espaços de nomes</strong> dão ao conjunto de processos de um " +
        "contêiner uma visão própria dos identificadores do sistema. O caso mais " +
        "ilustrativo é o identificador de processo, porque toda máquina tem um único " +
        "processo de inicialização com identificador 1, e cada contêiner precisa enxergar " +
        "o seu. Dentro do contêiner, os processos de fora simplesmente não existem.</li>" +
        "<li>O <strong>sistema de arquivos em união</strong> combina vários sistemas de " +
        "arquivos em camadas empilhadas, e só a camada mais alta aceita escrita. Uma base " +
        "comum, como uma distribuição inteira, é montada em modo somente leitura e " +
        "compartilhada por muitos contêineres, e cada um empilha por cima apenas o que " +
        "tem de diferente. Trocar a versão de uma linguagem vira empilhar os diretórios " +
        "dela sobre os da versão anterior.</li>" +
        "<li>Os <strong>grupos de controle</strong> limitam o que um conjunto de " +
        "processos pode consumir, seja memória principal, seja prioridade de processador. " +
        "É o que impede que um contêiner sozinho consuma os recursos de que os outros " +
        "precisam.</li>" +
        "</ul>" +
        "<h3>Máquina virtual e contêiner comparados</h3>" +
        "<p>Desde que os contêineres se popularizaram, o debate sobre qual das duas " +
        "tecnologias é melhor virou lugar-comum, e ele costuma ser atrapalhado por " +
        "vocabulário impreciso. Chamar o contêiner de leve e a máquina virtual de pesada " +
        "sugere uma conclusão de desempenho que os números nem sempre sustentam.</p>" +
        "<p>Os estudos comparativos apontam para três achados, e nenhum deles autoriza " +
        "uma resposta única.</p>" +
        '<div class="tabela-rolagem">' +
        '<table class="tabela-conteudo" id="tab-mv-conteiner">' +
        "<tr><th>Critério</th><th>O que a medição mostra</th></tr>" +
        "<tr><td>Uso de processador e memória</td>" +
        "<td>A diferença existe e favorece o contêiner, mas é pequena quando a aplicação " +
        "roda sozinha.</td></tr>" +
        "<tr><td>Entrada e saída</td>" +
        "<td>Aqui a máquina virtual perde de forma mais visível, porque a operação de " +
        "entrada e saída tradicional depende de muitas instruções privilegiadas. Estudos " +
        "mais recentes encontram diferenças quase desprezíveis até nisso, em parte porque " +
        "o sistema hospedeiro guarda resultados em memória e boa parte das operações nem " +
        "chega ao disco.</td></tr>" +
        "<tr><td>Aplicações concorrentes</td>" +
        "<td>A tendência se inverte. O contêiner tem mais dificuldade para isolar " +
        "aplicações independentes, e o escalonamento de processador e de disco entre " +
        "concorrentes é mais bem resolvido pela máquina virtual.</td></tr>" +
        "</table>" +
        "</div>" +
        "<p>A conclusão que se sustenta é modesta e útil. A máquina virtual impõe mais " +
        "sobrecarga que o contêiner, a diferença encolheu bastante ao longo dos anos, e " +
        "nenhuma das duas precisa ser significativamente mais lenta que executar a " +
        "aplicação diretamente sobre o sistema hospedeiro. A escolha entre elas se decide " +
        "pelo isolamento pretendido, e não por um número de referência.</p>" +
        "<p>É por isso que a nuvem usa as duas ao mesmo tempo, e não uma delas. A máquina " +
        "virtual isola clientes diferentes, que não confiam uns nos outros, e o contêiner " +
        "empacota os serviços de um mesmo cliente.</p>" +
        "<h3>Migração de código</h3>" +
        "<p>As duas seções anteriores tratam de mover a máquina e de mover o ambiente. " +
        "Falta o terceiro caso, que é mover a execução, e ele fecha o assunto deste " +
        "tópico.</p>" +
        "<p>A razão mais antiga para migrar código é o desempenho, movendo processos de " +
        "máquinas carregadas para máquinas ociosas. A seção sobre criação de processos já " +
        "mostrou por que essa razão sozinha decepciona, porque o custo de decidir consome " +
        "boa parte do ganho.</p>" +
        "<p>As razões que se sustentam melhor são outras. Migrar código para perto dos " +
        "dados evita transferir volumes grandes pela rede, invertendo o sentido do que " +
        "viaja. E migrar por flexibilidade permite montar a aplicação dinamicamente, " +
        "buscando no servidor o componente de que ela precisa em vez de instalá-lo de " +
        "antemão.</p>" +
        "<p>O que exatamente se move define quanto custa. Migrar apenas o código, sem " +
        "estado, é simples, porque o destino começa a execução do zero. Migrar o código " +
        "junto com o estado de execução é o caso caro, porque exige extrair de dentro do " +
        "núcleo coisas que não foram feitas para sair de lá, como descritores de arquivo " +
        "e conexões abertas.</p>" +
        "<p>Migrar entre plataformas heterogêneas acrescenta o problema de o destino não " +
        "entender o formato do que chega. É justamente aqui que as duas tecnologias " +
        "anteriores mostram o seu valor mais claro. Migrar uma máquina virtual inteira, ou " +
        "uma imagem de contêiner, resolve a heterogeneidade de uma vez, porque o ambiente " +
        "viaja junto com o que ele executa.</p>" +
        /* A demo saiu daqui para página própria em 2026-08-07. O cartão fica neste
           ponto porque a última etapa dela compara máquina virtual com contêiner,
           que é exatamente o que o parágrafo acima acabou de argumentar. */
        '<a class="lab-card" href="demos/virtualizacao/index.html" ' +
        'target="_blank" rel="noopener">' +
        '<span class="lab-card-eyebrow">Demonstração interativa · 5 etapas · ' +
        "cerca de 12 min</span>" +
        '<span class="lab-card-title">A Sala de Máquinas</span>' +
        '<span class="lab-card-summary">Monte um servidor e persiga o gargalo, ' +
        "que muda de lugar a cada otimização que você faz. No fim, empacote o " +
        "mesmo servidor numa máquina virtual e num contêiner, e compare o que " +
        "cada um cobra.</span>" +
        '<span class="lab-card-cta">Abrir a demonstração ↗</span>' +
        "</a>",
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
            "<li>O <strong>Spin</strong> protege por linguagem, o <strong>quarto núcleo " +
            "da linhagem Liedtke</strong> otimiza a comunicação entre processos, e o " +
            "<strong>exonúcleo</strong> põe o sistema de arquivos em bibliotecas</li>" +
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
            "<li>O escalonamento ganha um nível. O hipervisor escalona processadores " +
            "virtuais, o convidado escalona threads sobre eles, e a biblioteca ainda " +
            "escalona por conta própria</li>" +
            "<li><strong>Três escalonadores empilhados</strong> decidem sem saber uns " +
            "dos outros, o que é fonte conhecida de comportamento imprevisível</li>" +
            "<li>O projeto original, de 2003, já era um retrato da " +
            "<strong>infraestrutura como serviço</strong></li>" +
            "</ul>"
        },
        {
          title: "O contêiner virtualiza o ambiente, não a máquina",
          html:
            "<ul>" +
            "<li>A aplicação costuma ser estável quanto a instruções e a sistema " +
            "operacional. O que ela exige é <strong>biblioteca e programa de " +
            "apoio</strong></li>" +
            "<li>Carregar um sistema operacional inteiro para isso é desproporcional</li>" +
            "<li>Quer-se que aplicações rodem lado a lado, cada uma com o seu ambiente, " +
            "<strong>sem perceber que existem outras</strong></li>" +
            "<li>O contêiner é o ambiente empacotado. Pense no que você vê ao entrar " +
            "num sistema Unix</li>" +
            "</ul>"
        },
        {
          title: "Os três mecanismos que sustentam o contêiner",
          html:
            "<ul>" +
            "<li><strong>Espaços de nomes</strong> isolam. Cada contêiner enxerga o " +
            "seu processo de número 1, e os de fora não existem</li>" +
            "<li><strong>Sistema de arquivos em união</strong> evita desperdício. " +
            "Camadas empilhadas, só a mais alta escreve, a base é compartilhada</li>" +
            "<li><strong>Grupos de controle</strong> limitam consumo, de memória e de " +
            "processador</li>" +
            "</ul>"
        },
        {
          title: "Máquina virtual ou contêiner",
          ref: "tab-mv-conteiner"
        },
        {
          title: "O que a comparação de fato autoriza concluir",
          html:
            "<ul>" +
            "<li>Chamar um de leve e o outro de pesado sugere conclusão que " +
            "<strong>os números nem sempre sustentam</strong></li>" +
            "<li>A máquina virtual impõe mais sobrecarga, e a diferença " +
            "<strong>encolheu bastante</strong></li>" +
            "<li>A escolha se decide pelo <strong>isolamento pretendido</strong>, não " +
            "por um número de referência</li>" +
            "<li>A nuvem usa as duas. Máquina virtual isola clientes que não confiam " +
            "uns nos outros, contêiner empacota os serviços de um deles</li>" +
            "</ul>"
        },
        {
          title: "Mover a máquina, o ambiente e a execução",
          html:
            "<ul>" +
            "<li>Migrar por <strong>desempenho</strong> decepciona, porque o custo de " +
            "decidir consome o ganho</li>" +
            "<li>Migrar para <strong>perto dos dados</strong> evita transferir volumes " +
            "grandes, invertendo o sentido do que viaja</li>" +
            "<li>Migrar só o código é simples. Migrar <strong>código mais estado de " +
            "execução</strong> é o caso caro, porque exige tirar do núcleo o que não " +
            "foi feito para sair</li>" +
            "<li>Entre plataformas diferentes, migrar a <strong>máquina virtual ou a " +
            "imagem de contêiner</strong> resolve de uma vez, porque o ambiente viaja " +
            "junto</li>" +
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
        "Porque escalonar processos entre nós diferentes é tecnicamente impossível.",
        "Porque ninguém trocaria os aplicativos que já tem, nem cederia a própria máquina.",
        "Porque o hardware exigido por uma imagem única do sistema sai caro demais.",
        "Porque a Internet impede a transparência de localização entre máquinas."
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
        "Copia na hora todos os quadros de memória da região para o processo filho.",
        "Bloqueia qualquer escrita na região herdada enquanto o processo pai não terminar.",
        "Compartilha os quadros protegidos contra escrita, e copia só o que alguém escrever.",
        "Passa a região para o núcleo, que intermedeia cada acesso dos dois processos."
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
        "100 por segundo, e a segunda thread computa enquanto a primeira espera o disco.",
        "500 por segundo, e a segunda thread dobra esse valor, chegando a 1000 por segundo.",
        "125 por segundo, e a segunda thread não muda nada em um único processador.",
        "100 por segundo, e a segunda thread só ajuda se a máquina tiver dois discos."
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
        "Uma invocação remota nula entre processos em uma rede local leva cerca de 0,1 ms, dos quais a transmissão dos cerca de 100 bytes pela rede explica cerca de 0,01 ms. O que consome o restante do tempo?",
      options: [
        "A propagação do sinal elétrico pelos cabos que ligam as duas máquinas.",
        "A espera obrigatória pelas três confirmações que o TCP troca antes dos dados.",
        "O algoritmo de roteamento executado pelos comutadores da rede local.",
        "O software, com o empacotamento, as cópias e as trocas de contexto que ele faz."
      ],
      answer: 3,
      explanation:
        "O tempo de rede é cerca de um décimo do total. O atraso da invocação é " +
        "dominado pelo software, ou seja, pelo código do núcleo e da camada de " +
        "invocação, que faz as cópias, o empacotamento, os cabeçalhos e as trocas " +
        "de contexto. É por isso que a invocação local leve ataca exatamente cópias " +
        "e escalonamento, reduzindo de quatro cópias para uma e fazendo a thread do " +
        "cliente executar no domínio do servidor, o que a deixa três vezes mais " +
        "rápida."
    },
    {
      question:
        "Qual é o principal trade-off entre núcleos monolíticos e micronúcleos?",
      options: [
        "O monolítico é mais seguro, e o micronúcleo ocupa mais espaço em memória.",
        "O micronúcleo ganha em extensibilidade e confiabilidade, e perde em invocação.",
        "O micronúcleo não consegue suportar um sistema de arquivos completo.",
        "O monolítico só roda em mainframe, e o micronúcleo roda em qualquer máquina."
      ],
      answer: 1,
      explanation:
        "No micronúcleo, os serviços viram servidores fora do núcleo: " +
        "extensível, modular e com menos código privilegiado; o preço é cada " +
        "invocação atravessar espaços de endereçamento. As estratégias mistas " +
        "tentaram vários pontos intermediários, e a " +
        "virtualização acabou herdando a missão."
    },
    {
      question:
        "Segundo a condição de Popek e Goldberg, por que a família x86 clássica é difícil de virtualizar totalmente, e como a paravirtualização do Xen contorna isso?",
      options: [
        "Porque o x86 não tem registrador de modo, e o Xen acrescenta um por software.",
        "Porque o x86 tem instruções demais, e o Xen remove da máquina as que não usa.",
        "Porque 17 instruções sensíveis não são privilegiadas, e o Xen porta o convidado.",
        "Porque os dois anéis de privilégio do x86 não bastam para virtualizar nada."
      ],
      answer: 2,
      explanation:
        "A condição exige que toda instrução sensível seja privilegiada, para o " +
        "hipervisor capturá-la; o x86 clássico viola isso com 17 instruções " +
        "que podem ser executadas em modo usuário sem provocar desvio. A "
        + "virtualização total resolve com uma camada de " +
        "simulação (cara); a paravirtualização reescreve o convidado: " +
        "hiperchamadas no anel 0, convidado no anel 1, aplicativos no anel 3."
    }
  ],

  glossary: [
    {
      term: "Sistema operacional de rede",
      definition:
        "Sistema operacional com rede incorporada, capaz de acessar recursos " +
        "remotos, montando o sistema de arquivos de outra máquina ou abrindo uma " +
        "sessão remota, mas em que cada nó mantém autonomia sobre os seus " +
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
        "espaços de endereçamento, trata as chamadas de sistema e " +
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
      term: "Invocação local leve",
      definition:
        "Mecanismo otimizado de invocação entre processos do mesmo computador. Os " +
        "argumentos passam por uma pilha em região de memória compartilhada, o que " +
        "reduz de quatro cópias para uma, e a própria thread do cliente executa o " +
        "procedimento dentro do domínio do servidor, sob validação do núcleo. Fica " +
        "cerca de três vezes mais rápida que a invocação local convencional, e um " +
        "único bit definido na vinculação decide qual caminho a chamada segue, o " +
        "que preserva a transparência."
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
      term: "Contêiner",
      definition:
        "Coleção de binários que forma o ambiente de software de uma aplicação, " +
        "virtualizando esse ambiente em vez da máquina. Em Linux ele se sustenta em " +
        "três mecanismos. Os espaços de nomes dão a cada contêiner uma visão própria " +
        "dos identificadores do sistema, o sistema de arquivos em união empilha " +
        "camadas com apenas a mais alta aceitando escrita, e os grupos de controle " +
        "limitam quanto de memória e de processador o conjunto pode consumir."
    },
    {
      term: "Migração de código",
      definition:
        "Mover a execução de uma máquina para outra. Migrar apenas o código é " +
        "simples, porque o destino começa do zero, e migrar o código junto com o " +
        "estado de execução é caro, porque exige extrair do núcleo coisas que não " +
        "foram feitas para sair de lá. Entre plataformas diferentes, migrar a máquina " +
        "virtual inteira ou a imagem de contêiner resolve a heterogeneidade, porque o " +
        "ambiente viaja junto com o que ele executa."
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
    "VAN STEEN, M.; TANENBAUM, A. S. Distributed Systems. 4. ed. (versão DS 4.03). " +
    "distributed-systems.net. Cap. 3. Processes, seções 3.1, 3.2 e 3.5 (fonte " +
    "principal deste tópico: contextos de processador, de thread e de processo; os " +
    "três níveis de interface que se pode virtualizar; máquina virtual de processo, " +
    "monitor nativo e monitor hospedado; contêineres, com espaços de nomes, sistema " +
    "de arquivos em união e grupos de controle; a comparação medida entre máquinas " +
    "virtuais e contêineres; e a migração de código).",
    "COULOURIS, G.; DOLLIMORE, J.; KINDBERG, T.; BLAIR, G. Sistemas Distribuídos: " +
    "Conceitos e Projeto. 5. ed. Porto Alegre: Bookman, 2013. Cap. 7. Sistema " +
    "Operacional (pp. 279-334). Organiza a progressão do tópico e é a fonte do " +
    "contraste entre sistema operacional de rede e distribuído, das contas de vazão " +
    "do servidor, do custo da invocação e do estudo de caso do Xen.",
    "HWANG, K.; FOX, G.; DONGARRA, J. Distributed and Cloud Computing. Waltham: " +
    "Morgan Kaufmann, 2011. Cap. 3. Virtual Machines and Virtualization of " +
    "Clusters and Data Centers (leitura complementar sobre os níveis de " +
    "implementação da virtualização e o gerenciamento de máquinas virtuais).",
    "HUNTER, T. Distributed Systems with Node.js. Cap. 5. Containers (leitura " +
    "complementar sobre contêineres na prática, com imagens, camadas e o ciclo de " +
    "execução).",
    "TANENBAUM, A. S.; BOS, H. Sistemas Operacionais Modernos. 4. ed. São Paulo: " +
    "Pearson, 2016. Bibliografia complementar da disciplina, com os fundamentos de " +
    "processos, threads, escalonamento e memória."
  ]
};
