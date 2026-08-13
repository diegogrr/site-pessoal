/* ============================================================
   topic-02.js — Modelos de Sistema
   ------------------------------------------------------------
   Estrutura documentada no modelo topic-01.js (sections[] com
   slides[] opcionais, quiz[], glossary[], references[]).
   Fundamentação: manifesto em docs/fontes/topico-02.json, que liga
   cada seção às páginas que a autorizam. Hierarquia de fontes em
   docs/fontes/README.md — o Coulouris (cap. 2) dá o esqueleto e o
   van Steen 4. ed. (caps. 2, 8 e 9) manda no conteúdo.
   ============================================================ */

window.SD = window.SD || {};
SD.content = SD.content || {};

SD.content["02"] = {

  sections: [
    {
      title: "Por que modelar? E os modelos físicos",
      html:
        "<p>Sistemas distribuídos de tipos muito diferentes compartilham as mesmas " +
        "propriedades de base e enfrentam os mesmos problemas de projeto. Todos precisam " +
        "responder a cargas que variam aos milhões de acessos, conviver com ambientes " +
        "heterogêneos, tolerar relógios dessincronizados e sobreviver a falhas e a " +
        "ataques. Discutir isso com rigor exige um vocabulário comum, e é para isso que " +
        "servem os <strong>modelos descritivos</strong>, que são descrições abstratas e " +
        "simplificadas, mas consistentes, de um aspecto relevante do projeto.</p>" +
        "<p>São três os tipos de modelo, e eles organizam o restante deste tópico.</p>" +
        "<ul>" +
        "<li>O <strong>modelo físico</strong> descreve a composição de hardware do " +
        "sistema, ou seja, os computadores, os dispositivos e as redes que os " +
        "interligam.</li>" +
        "<li>O <strong>modelo de arquitetura</strong> descreve o sistema em termos das " +
        "tarefas computacionais e de comunicação dos seus elementos.</li>" +
        "<li>O <strong>modelo fundamental</strong> toma um aspecto individual de cada " +
        "vez, que pode ser a interação, as falhas ou a segurança, e o examina de forma " +
        "abstrata.</li>" +
        "</ul>" +
        "<p>Antes de seguir, vale separar duas perguntas que atravessam o tópico " +
        "inteiro, porque a distinção organiza tudo o que vem depois. De um lado " +
        "está a <strong>organização lógica</strong> dos componentes de software, que diz " +
        "quais peças existem e como elas conversam. Essa organização lógica é o que se " +
        "chama de arquitetura de software. Do outro lado está a <strong>realização " +
        "física</strong>, que instala essas peças em máquinas de verdade e decide quantas " +
        "máquinas são, onde ficam e quem executa o quê. O resultado dessa instalação é o " +
        "que se chama de arquitetura de sistema.</p>" +
        "<p>O modelo de arquitetura trata das duas coisas. A última das quatro perguntas " +
        "que ele responde, a do posicionamento, é justamente a da realização física, e a " +
        "seção 2 volta a ela com calma. O modelo físico fica com o hardware, ou seja, com " +
        "as máquinas e as redes que existem antes de qualquer software ser instalado " +
        "nelas.</p>" +
        "<p>A mesma arquitetura de software admite realizações físicas muito diferentes. " +
        "Um sistema de três partes lógicas pode rodar inteiro numa máquina, ou espalhado " +
        "por três, ou replicado em trezentas, sem que a divisão lógica mude. É por isso " +
        "que descrever apenas uma das duas organizações deixa metade do projeto de fora.</p>" +
        '<div class="callout">' +
        '<p class="callout-title">💡 Ideia central</p>' +
        "<p>Um modelo torna <em>explícitas</em> as suposições sobre o sistema e permite " +
        "fazer generalizações sobre o que é <em>possível ou impossível</em> dadas essas " +
        "suposições, inclusive com prova matemática. Se as suposições valem no seu " +
        "sistema, as conclusões também valem.</p>" +
        "</div>" +
        "<p>O <strong>modelo físico básico</strong> repete a definição do Tópico 1. Um " +
        "sistema distribuído é um conjunto extensível de nós de computador " +
        "interconectados por uma rede para a passagem de mensagens. Sobre essa base, " +
        "distinguem-se três gerações, e vale compará-las pelas mesmas dimensões para " +
        "enxergar a direção em que a área caminhou.</p>" +
        '<div class="tabela-rolagem">' +
        '<table class="tabela-conteudo" id="tab-geracoes">' +
        "<tr><th>Geração</th><th>Quando</th><th>Escala e alcance</th>" +
        "<th>O que a caracteriza</th></tr>" +
        "<tr><td>Sistemas primitivos</td>" +
        "<td>Do fim dos anos 1970 ao início dos anos 1980.</td>" +
        "<td>De 10 a 100 nós em uma rede local, com a Internet ainda de alcance " +
        "limitado.</td>" +
        "<td>As configurações eram homogêneas, e o que se compartilhava eram impressoras " +
        "e arquivos, além do correio eletrônico.</td></tr>" +
        "<tr><td>Sistemas adaptados para a Internet</td>" +
        "<td>Anos 1990.</td>" +
        "<td>Escala global, sobre a rede de redes.</td>" +
        "<td>A heterogeneidade entre as máquinas passa a ser significativa, o que " +
        "desloca a ênfase para os padrões abertos e para o middleware, como o CORBA " +
        "(Common Object Request Broker Architecture) e os serviços Web.</td></tr>" +
        "<tr><td>Sistemas contemporâneos</td>" +
        "<td>Dos anos 2000 em diante.</td>" +
        "<td>Escala ultragrande, com centenas de milhares de nós.</td>" +
        "<td>Os nós deixam de ser todos parecidos e fixos, e passam a se mover, a ficar " +
        "embarcados no ambiente ou a se reunir em conjuntos que fornecem um " +
        "serviço.</td></tr>" +
        "</table>" +
        "</div>" +
        "<p>As três novidades da geração contemporânea têm nome próprio. A " +
        "<strong>computação móvel</strong> trata dos nós que mudam de lugar durante a " +
        "execução, como o celular que troca de rede sem interromper o que estava " +
        "fazendo. A <strong>computação ubíqua</strong> trata dos nós embarcados no " +
        "ambiente, pequenos e numerosos, que o usuário não percebe como computadores. A " +
        "<strong>nuvem</strong> e os <strong>clusters</strong> reúnem muitos nós para " +
        "fornecer um serviço único, e é essa reunião que sustenta a escala ultragrande.</p>" +
        "<p>No extremo dessa evolução estão os <strong>sistemas de sistemas</strong> " +
        "(ULS, <em>Ultra Large Scale</em>), assim chamados porque cada subsistema já é, " +
        "ele próprio, um sistema completo. Um sistema de previsão de enchentes é um bom " +
        "exemplo, porque combina redes de sensores no rio, clusters de simulação, bases " +
        "históricas e um serviço de alertas por celular, cada um com o seu próprio " +
        "projeto e a sua própria operação.</p>" +
        "<p>Repare no que a tabela e o exemplo mostram juntos. A cada geração o sistema " +
        "ganha nós, ganha alcance e perde uniformidade, e é justamente por isso que " +
        "descrever um sistema distribuído exige modelo. Sem ele, cada afirmação valeria " +
        "apenas para o arranjo específico que a pessoa tem em mente.</p>",
      slides: [
        {
          title: "Por que modelar",
          html:
            "<ul>" +
            "<li>Sistemas muito diferentes enfrentam <strong>os mesmos problemas de " +
            "projeto</strong>, e um modelo descreve todos eles de uma vez</li>" +
            "<li>Modelar é <strong>tornar explícitas as suposições</strong> que se faz " +
            "sobre o sistema</li>" +
            "<li>Com as suposições na mesa, dá para provar o que é <strong>possível ou " +
            "impossível</strong> sob elas</li>" +
            "<li>São três modelos e três recortes. O <strong>físico</strong> descreve o " +
            "hardware, o <strong>de arquitetura</strong> descreve as tarefas de cada " +
            "elemento e o <strong>fundamental</strong> isola um aspecto de cada vez</li>" +
            "</ul>"
        },
        {
          title: "Organização lógica e realização física",
          html:
            "<ul>" +
            "<li>A <strong>organização lógica</strong> diz quais peças de software " +
            "existem e como elas conversam. É a arquitetura de software</li>" +
            "<li>A <strong>realização física</strong> instala essas peças em máquinas de " +
            "verdade. É a arquitetura de sistema</li>" +
            "<li>A mesma arquitetura de software roda numa máquina, em três ou em " +
            "trezentas, <strong>sem que a divisão lógica mude</strong></li>" +
            "<li>Descrever só uma das duas deixa metade do projeto de fora</li>" +
            "</ul>"
        },
        {
          title: "Três gerações de modelo físico",
          ref: "tab-geracoes"
        },
        {
          title: "Para onde a evolução caminhou",
          html:
            "<ul>" +
            "<li>A cada geração o sistema <strong>ganha nós, ganha alcance e perde " +
            "uniformidade</strong></li>" +
            "<li>No extremo estão os <strong>sistemas de sistemas</strong> (ULS, " +
            "<em>Ultra Large Scale</em>), em que cada subsistema já é um sistema " +
            "completo</li>" +
            "<li>É a perda de uniformidade que obriga a modelar. Sem modelo, cada " +
            "afirmação valeria só para o arranjo que quem fala tem em mente</li>" +
            "</ul>"
        }
      ]
    },
    {
      title: "Modelos de arquitetura",
      html:
        "<p>A arquitetura de um sistema é a sua estrutura em termos de componentes " +
        "especificados separadamente e das inter-relações entre eles. Projetá-la bem " +
        "significa buscar quatro qualidades ao mesmo tempo, porque o sistema precisa ser " +
        "confiável, gerenciável, adaptável e rentável.</p>" +
        "<p>Essa estrutura se descreve com duas peças. Um <strong>componente</strong> é " +
        "uma unidade modular com interfaces bem definidas, que declara o que oferece e o " +
        "que exige. A exigência de ser modular tem uma razão prática forte, porque um " +
        "componente só pode ser substituído se a interface dele permanecer intacta, e " +
        "sistemas grandes raramente podem ser desligados para manutenção. Trocar uma peça " +
        "com o sistema no ar é o caso comum, não a exceção.</p>" +
        "<p>A segunda peça é o <strong>conector</strong>, que é o mecanismo que medeia a " +
        "comunicação entre componentes. Uma chamada de procedimento, uma passagem de " +
        "mensagens e um fluxo contínuo de dados são todos conectores, e o que eles têm em " +
        "comum é permitir que controle e dados passem de um componente a outro. " +
        "Componentes e conectores combinados de uma maneira recorrente formam o que se " +
        "chama de <strong>estilo de arquitetura</strong>.</p>" +
        "<p>Para chegar aos elementos de base, quatro perguntas organizam a discussão.</p>" +
        "<ul>" +
        "<li><strong>Que entidades</strong> se comunicam?</li>" +
        "<li><strong>Como</strong> elas se comunicam, isto é, por qual paradigma?</li>" +
        "<li><strong>Que papéis</strong> elas têm na arquitetura?</li>" +
        "<li><strong>Onde</strong> elas são posicionadas na infraestrutura física?</li>" +
        "</ul>" +
        "<h3>Entidades em comunicação</h3>" +
        "<p>Do ponto de vista do sistema, quem troca mensagens são " +
        "<strong>processos</strong>. Em rigor são threads, e em redes de sensores esse " +
        "papel cabe ao nó, mas processo é a abstração que basta na maior parte das " +
        "discussões. Quem programa, no entanto, raramente pensa em processos. Pensa em " +
        "objetos, em componentes e em serviços Web.</p>" +
        "<p>Um <strong>objeto</strong> é acessado pela sua interface, descrita numa " +
        "linguagem de definição de interfaces (IDL). Ela existe para que cliente e " +
        "servidor concordem sobre a forma da chamada mesmo quando são escritos em " +
        "linguagens diferentes. Um <strong>componente</strong> vai um passo além, porque " +
        "declara também as dependências de que precisa para funcionar, e não apenas o " +
        "que oferece. O contrato fica mais completo, e é possível montar o sistema " +
        "sabendo de antemão o que cada peça exige.</p>" +
        "<p>Um <strong>serviço Web</strong> também encapsula funcionalidade atrás de uma " +
        "interface, mas nasce integrado à Web. Ele é identificado por um URI (Uniform " +
        "Resource Identifier), o mesmo tipo de identificador que endereça uma página, e " +
        "troca mensagens escritas na linguagem de marcação extensível (XML), que " +
        "permite a sistemas diferentes interpretar os mesmos dados. Por isso o " +
        "serviço Web é a escolha comum quando a comunicação atravessa a fronteira entre " +
        "organizações.</p>" +
        "<h3>Paradigmas de comunicação</h3>" +
        "<p>Respondida a pergunta sobre quem se comunica, vem a pergunta sobre como. São " +
        "três os paradigmas, e o que os distingue é a distância entre o programador e a " +
        "rede.</p>" +
        '<div class="tabela-rolagem">' +
        '<table class="tabela-conteudo" id="tab-paradigmas">' +
        "<tr><th>Paradigma</th><th>Nível de abstração</th><th>Acoplamento</th>" +
        "<th>Exemplos</th></tr>" +
        "<tr><td>Comunicação entre processos</td>" +
        "<td>O mais baixo, com o programador tratando diretamente das mensagens.</td>" +
        "<td>Em geral as duas pontas se conhecem e precisam estar no ar ao mesmo tempo, " +
        "com exceção do multicast, em que o remetente endereça um grupo.</td>" +
        "<td>Passagem de mensagens, soquetes e multicast.</td></tr>" +
        "<tr><td>Invocação remota</td>" +
        "<td>Intermediário, com uma troca bilateral que chama uma operação remota.</td>" +
        "<td>As duas pontas se conhecem e precisam estar no ar ao mesmo tempo.</td>" +
        "<td>Protocolos requisição-resposta como o HTTP, mais a chamada de procedimento " +
        "remoto (RPC) e a invocação remota de métodos (RMI).</td></tr>" +
        "<tr><td>Comunicação indireta</td>" +
        "<td>O mais alto, com um intermediário entre as pontas.</td>" +
        "<td>Desacoplada no espaço e no tempo.</td>" +
        "<td>Comunicação em grupo, publicar-assinar, filas de mensagem, espaços de tupla " +
        "e memória compartilhada distribuída (DSM).</td></tr>" +
        "</table>" +
        "</div>" +
        "<p>Duas linhas dessa tabela merecem explicação. A primeira é a da invocação " +
        "remota. O RPC faz o procedimento remoto ser chamado como se fosse local, e é " +
        "isso que entrega transparência de acesso e de localização. O RMI é a versão do " +
        "mesmo mecanismo para objetos distribuídos, e a diferença está na " +
        "<em>identidade de objeto</em>, porque ali a chamada não chega a um procedimento " +
        "qualquer, e sim a um objeto específico, com estado próprio, que vive no " +
        "servidor.</p>" +
        "<p>A segunda linha é a da comunicação indireta, e ela traz dois " +
        "desacoplamentos. O <em>desacoplamento espacial</em> significa que o remetente " +
        "não sabe para quem envia. O <em>desacoplamento temporal</em> significa que " +
        "remetente e destinatário nem precisam existir ao mesmo tempo.</p>" +
        "<p>É esse par de propriedades que torna a comunicação indireta atraente quando " +
        "as partes entram e saem do sistema o tempo todo.</p>" +
        "<p>Vale insistir nesses dois desacoplamentos, porque combiná-los produz uma " +
        "classificação mais fina que os três paradigmas. São duas perguntas " +
        "independentes. A primeira é se as duas partes precisam estar no ar ao mesmo " +
        "tempo, e a segunda é se quem envia precisa saber para quem está enviando. Como " +
        "cada resposta é sim ou não, saem quatro formas de coordenação.</p>" +
        '<div class="tabela-rolagem">' +
        '<table class="tabela-conteudo" id="tab-coordenacao">' +
        "<tr><th>Forma de coordenação</th><th>Precisam estar no ar juntas?</th>" +
        "<th>Quem envia sabe para quem?</th><th>Como funciona</th></tr>" +
        "<tr><td>Comunicação direta</td><td>Sim</td><td>Sim</td>" +
        "<td>Um processo nomeia o outro e fala com ele, como numa ligação telefônica em " +
        "que quem liga precisa do número e do outro lado atendendo.</td></tr>" +
        "<tr><td>Caixa postal</td><td>Não</td><td>Sim</td>" +
        "<td>Quem envia deposita a mensagem numa caixa endereçada e segue a vida. O " +
        "destinatário lê quando voltar, e por isso os dois nunca precisam coincidir no " +
        "tempo.</td></tr>" +
        "<tr><td>Baseada em eventos</td><td>Sim</td><td>Não</td>" +
        "<td>Quem produz apenas publica a notificação de que algo aconteceu, e a " +
        "notificação chega a quem tiver assinado aquele tipo de evento.</td></tr>" +
        "<tr><td>Espaço de dados compartilhado</td><td>Não</td><td>Não</td>" +
        "<td>Os processos escrevem e leem registros estruturados num espaço comum, " +
        "procurando por conteúdo em vez de por remetente.</td></tr>" +
        "</table>" +
        "</div>" +
        "<p>As duas últimas linhas são a base do estilo publicar-assinar, que aparece " +
        "adiante nesta seção. Repare que a caixa postal e o espaço de dados compartilhado " +
        "exigem que alguém guarde a mensagem no meio do caminho, e é essa exigência de " +
        "armazenamento que separa as formas desacopladas no tempo das demais.</p>" +
        "<p>As duas primeiras perguntas já têm resposta, e é hora de ver o que se " +
        "constrói com elas. Os estilos de arquitetura que vêm a seguir são combinações " +
        "recorrentes de entidades e paradigmas, ou seja, das duas respostas que acabaram " +
        "de sair. Depois deles, a seção retoma as duas perguntas que faltam, a dos papéis " +
        "e a do posicionamento.</p>" +
        "<h3>Estilo orientado a serviços</h3>" +
        "<p>O estilo em camadas, que a próxima seção detalha, tem um inconveniente " +
        "conhecido, que é a dependência forte entre camadas vizinhas. Quando um sistema " +
        "grande é montado por composição de componentes existentes, sem cuidado com a " +
        "estabilidade das interfaces, essa dependência vira armadilha. Um caso real " +
        "ilustra bem o tamanho do problema. Um componente que apenas preenchia uma cadeia " +
        "de caracteres com zeros ou espaços foi retirado da biblioteca pública em que " +
        "vivia, e milhares de programas pararam de funcionar.</p>" +
        "<p>Daí nasce um estilo de organização mais frouxa, em que o sistema é uma coleção " +
        "de entidades separadas e independentes. Cada entidade encapsula um " +
        "<strong>serviço</strong> e roda como um processo próprio. Sejam chamadas de " +
        "objetos, de serviços ou de microsserviços, todas compartilham essa característica.</p>" +
        "<p>Na variante <strong>baseada em objetos</strong>, cada objeto reúne os dados, " +
        "que formam o seu estado, e as operações que agem sobre esses dados, que são os " +
        "seus métodos. A interface esconde a implementação, o que permite considerar o " +
        "objeto independentemente do ambiente em que ele vive. E permite algo mais " +
        "interessante, que é colocar a interface numa máquina e o objeto em outra.</p>" +
        '<figure class="figura" id="fig-objeto-remoto">' +
        '<svg viewBox="0 0 640 290" role="img" aria-labelledby="fig-objeto-titulo">' +
        '<title id="fig-objeto-titulo">Um cliente numa máquina invoca um método de um ' +
        "objeto que está em outra. O proxy do lado do cliente empacota a chamada, ela " +
        "atravessa a rede e o skeleton do lado do servidor desempacota e invoca o método " +
        "no objeto.</title>" +
        '<text class="rotulo-secundario" x="145" y="20" text-anchor="middle" ' +
        'font-size="14">Máquina cliente</text>' +
        '<rect class="caixa" x="20" y="30" width="250" height="175" rx="8"/>' +
        '<rect class="caixa" x="45" y="50" width="200" height="45" rx="6"/>' +
        '<text x="145" y="78" text-anchor="middle" font-size="16">Cliente</text>' +
        '<path class="traco" d="M145 95 L145 113"/>' +
        '<path class="seta" d="M139 113 L151 113 L145 121 Z"/>' +
        '<rect class="caixa-destaque" x="45" y="125" width="200" height="45" rx="6"/>' +
        '<text x="145" y="153" text-anchor="middle" font-size="16">Proxy</text>' +
        '<text class="rotulo-secundario" x="145" y="192" text-anchor="middle" ' +
        'font-size="13">empacota a chamada</text>' +
        '<text class="rotulo-secundario" x="495" y="20" text-anchor="middle" ' +
        'font-size="14">Máquina servidora</text>' +
        '<rect class="caixa" x="370" y="30" width="250" height="175" rx="8"/>' +
        '<rect class="caixa" x="395" y="50" width="200" height="45" rx="6"/>' +
        '<text x="495" y="78" text-anchor="middle" font-size="16">Objeto</text>' +
        '<path class="traco" d="M495 125 L495 107"/>' +
        '<path class="seta" d="M489 107 L501 107 L495 99 Z"/>' +
        '<rect class="caixa-destaque" x="395" y="125" width="200" height="45" rx="6"/>' +
        '<text x="495" y="153" text-anchor="middle" font-size="16">Skeleton</text>' +
        '<text class="rotulo-secundario" x="495" y="192" text-anchor="middle" ' +
        'font-size="13">desempacota e invoca</text>' +
        '<path class="traco" d="M145 205 L145 245 L495 245 L495 205"/>' +
        '<text class="rotulo-secundario" x="320" y="268" text-anchor="middle" ' +
        'font-size="14">a invocação empacotada atravessa a rede</text>' +
        "</svg>" +
        "<figcaption>O proxy tem a mesma interface do objeto, então o cliente chama o " +
        "método como se o objeto fosse local. Quem faz o trabalho sujo são as duas peças " +
        "em destaque, que empacotam a chamada de um lado e a desempacotam do outro. O " +
        "tópico 5 volta a esse mecanismo em detalhe.</figcaption>" +
        "</figure>" +
        "<p>Esse arranjo se chama <strong>objeto distribuído</strong>, ou objeto remoto. " +
        "Vale notar uma característica que costuma surpreender. Na maior parte desses " +
        "objetos o estado não fica distribuído, porque ele mora numa máquina só, e o que " +
        "se publica nas outras é apenas a interface. Quando o estado é mesmo espalhado " +
        "por várias máquinas, essa distribuição também fica escondida atrás da " +
        "interface.</p>" +
        "<h4>Microsserviços</h4>" +
        "<p>A ideia de encapsular um serviço numa unidade independente, levada ao limite " +
        "de dividir o sistema em peças cada vez menores, produz os " +
        "<strong>microsserviços</strong>. A inspiração " +
        "declarada vem do Unix, em que muitos programas pequenos e mutuamente " +
        "independentes se compõem para formar programas maiores.</p>" +
        "<p>O que define um microsserviço é ele rodar como um processo de rede separado e " +
        "representar de fato um serviço independente. Não existe acordo sobre o tamanho " +
        "que ele deve ter, apesar do prefixo, e insistir nessa pergunta é perder tempo. O " +
        "que importa é a modularização.</p>" +
        "<p>O tamanho importa por outro motivo, que é o posicionamento. Como cada " +
        "microsserviço é um processo de rede, existe a escolha de onde colocá-lo, e essa " +
        "escolha ganhou peso com as infraestruturas de borda que a próxima seção " +
        "apresenta. A pergunta deixa de ser apenas como dividir e passa a ser também onde " +
        "instalar cada pedaço.</p>" +
        "<p>Um serviço comum, sem o prefixo, costuma ser maior que um microsserviço e nem " +
        "sempre pertence à mesma organização. Uma loja de livros digitais mostra os dois " +
        "casos juntos. O processamento do pedido é interno, com seleção de itens e " +
        "registro da entrega, mas o pagamento pode ser um serviço de outra empresa, para " +
        "o qual o cliente é redirecionado e que depois avisa a loja para concluir a " +
        "transação.</p>" +
        "<p>Os dois recortes não se excluem. Não é incomum que um serviço desses seja, " +
        "por dentro, uma coleção de microsserviços.</p>" +
        "<h4>O estilo baseado em recursos, ou REST</h4>" +
        "<p>A composição de serviços tem um problema próprio. Se cada serviço oferece a " +
        "sua própria interface, ligar vários deles vira um exercício de integração " +
        "penoso. Uma alternativa é olhar o sistema distribuído como uma coleção enorme de " +
        "<strong>recursos</strong>, cada um gerenciado por um componente, que podem ser " +
        "criados, recuperados, modificados e removidos.</p>" +
        "<p>Essa é a abordagem que a Web adotou, conhecida pela sigla REST, de " +
        "transferência de estado representacional. Uma arquitetura REST tem quatro " +
        "características.</p>" +
        "<ul>" +
        "<li>Os recursos são identificados por um esquema único de nomes.</li>" +
        "<li>Todos os serviços oferecem a mesma interface, com no máximo quatro " +
        "operações.</li>" +
        "<li>As mensagens trocadas com o serviço descrevem a si mesmas por completo.</li>" +
        "<li>Depois de executar uma operação, o componente esquece tudo sobre quem " +
        "chamou, o que se chama de execução sem estado.</li>" +
        "</ul>" +
        '<div class="tabela-rolagem">' +
        '<table class="tabela-conteudo" id="tab-rest">' +
        "<tr><th>Operação</th><th>O que ela faz com o recurso</th></tr>" +
        "<tr><td><code>PUT</code></td><td>Modifica o recurso, transferindo para ele um " +
        "estado novo.</td></tr>" +
        "<tr><td><code>POST</code></td><td>Cria um recurso novo.</td></tr>" +
        "<tr><td><code>GET</code></td><td>Recupera o estado do recurso em alguma " +
        "representação.</td></tr>" +
        "<tr><td><code>DELETE</code></td><td>Apaga o recurso.</td></tr>" +
        "</table>" +
        "</div>" +
        "<p>O serviço de armazenamento simples da Amazon, que a empresa abrevia como " +
        "<code>S3</code>, é um exemplo direto. Ele oferece objetos, que equivalem a " +
        "arquivos, e baldes, que equivalem a diretórios, e endereça um objeto por um " +
        "identificador uniforme de recurso (URI) da forma " +
        "<code>https://s3.amazonaws.com/NomeDoBalde/NomeDoObjeto</code>. Para criar o " +
        "balde, a aplicação envia um <code>PUT</code> para esse endereço, e o protocolo " +
        "usado é o HTTP comum. Para saber o que há dentro dele, envia um " +
        "<code>GET</code>.</p>" +
        "<p>Repare que a criação saiu por <code>PUT</code>, e não por <code>POST</code>, " +
        "contrariando a tabela à primeira vista. Quando o cliente já sabe o nome do " +
        "recurso, ele transfere o estado direto para o endereço final, que é exatamente " +
        "o que o <code>PUT</code> faz. O <code>POST</code> fica para o caso em que quem " +
        "escolhe o nome do recurso novo é o servidor.</p>" +
        "<p>A simplicidade é o que tornou o estilo popular, e ela cobra o seu preço. " +
        "Esquemas de comunicação intrincados ficam difíceis de exprimir com quatro " +
        "operações genéricas, e a transação distribuída é o exemplo clássico, porque " +
        "exige que o serviço guarde o estado da execução. Há uma troca também na " +
        "verificação de erros. Numa interface específica, com uma operação por " +
        "necessidade, muito erro de sintaxe aparece já na compilação. Numa interface " +
        "genérica, em que o pedido inteiro vira uma cadeia de caracteres, a verificação " +
        "só acontece em tempo de execução.</p>" +
        "<h3>Estilo publicar-assinar</h3>" +
        "<p>À medida que o sistema cresce e os processos entram e saem com facilidade, " +
        "interessa que a dependência entre eles seja a menor possível. O estilo " +
        "publicar-assinar responde a isso separando com força o <strong>processamento</strong> " +
        "da <strong>coordenação</strong>. O sistema passa a ser uma coleção de processos " +
        "autônomos, e a coordenação é a cola que une o que cada um faz.</p>" +
        "<p>Quem produz apenas publica uma notificação descrevendo um evento, sem " +
        "endereçá-la a ninguém. Quem tem interesse registra uma assinatura no middleware, " +
        "descrevendo o tipo de evento que quer receber. O casamento entre notificações e " +
        "assinaturas é feito por um intermediário, e nenhum dos dois lados precisa " +
        "conhecer o outro.</p>" +
        "<p>A descrição do evento costuma ser uma série de atributos, e é aí que aparece a " +
        "diferença entre as duas famílias. Na assinatura <strong>por tópico</strong>, a " +
        "descrição são pares de atributo e valor, e o assinante pede exatamente aquele " +
        "valor. Na assinatura <strong>por conteúdo</strong>, a descrição admite faixas de " +
        "valores e até predicados parecidos com uma consulta a banco de dados. Quanto mais " +
        "expressiva a descrição, mais caro fica testar se um evento casa com ela, e essa " +
        "é a troca que o projetista faz.</p>" +
        "<p>Feito o casamento, restam duas condutas possíveis para o middleware. Ele pode " +
        "encaminhar a notificação junto com os dados, e nesse caso não precisa guardar " +
        "nada, o que exige o assinante no ar no momento da publicação. Ou pode encaminhar " +
        "só a notificação e deixar que o assinante venha buscar os dados depois, e aí " +
        "precisa armazená-los, com a opção de dar a cada item um prazo de validade após o " +
        "qual ele é apagado sozinho.</p>" +
        "<h3>Papéis: cliente-servidor e peer-to-peer</h3>" +
        "<p>O modelo <strong>cliente-servidor</strong> é historicamente o mais " +
        "importante e ainda é o mais empregado. Nele os clientes invocam os servidores, " +
        "e nada impede que um servidor seja, por sua vez, cliente de outro. Um servidor " +
        "Web faz isso quando consulta o DNS. Um mecanismo de busca faz o mesmo de duas " +
        "maneiras, porque responde aos navegadores e ao mesmo tempo executa web " +
        "crawlers, que são clientes de outros servidores.</p>" +
        "<p>No modelo <strong>peer-to-peer</strong> não existe essa distinção entre " +
        "cliente e servidor. Todos os processos executam o mesmo programa e oferecem as " +
        "mesmas interfaces. O Napster abriu o caminho para essa organização, e o " +
        "BitTorrent é o exemplo moderno.</p>" +
        "<p>A motivação do peer-to-peer é que os recursos disponíveis crescem com o " +
        "número de usuários, o que ataca o limite de escalabilidade da centralização. O " +
        "preço é uma complexidade bem maior, porque o sistema passa a ter de posicionar " +
        "os objetos, recuperá-los depois e manter réplicas deles.</p>" +
        "<h3>Posicionamento</h3>" +
        "<p>A última pergunta é onde colocar cada coisa. Mapear serviços nas máquinas " +
        "certas importa para o desempenho, para a confiabilidade e para a segurança, e " +
        "quatro estratégias aparecem com frequência.</p>" +
        "<ul>" +
        "<li>O uso de <strong>vários servidores</strong> divide o trabalho entre " +
        "máquinas. Os dados podem ser particionados entre elas, como acontece na Web, ou " +
        "replicados em todas, como no Network Information Service (NIS).</li>" +
        "<li>O <strong>cache</strong> guarda cópias dos dados perto de quem os usa, tanto " +
        "no navegador quanto em servidores proxy no caminho. Assim o pedido seguinte " +
        "pode ser atendido sem chegar à origem.</li>" +
        "<li>O <strong>código móvel</strong> inverte o sentido do movimento, porque é o " +
        "programa que viaja até o cliente. O applet é o caso clássico, com o navegador " +
        "baixando o código e executando-o localmente, o que dá boa resposta interativa. " +
        "Depois de carregado, ele ainda pode receber atualizações por iniciativa do " +
        "servidor, no modelo <em>push</em>.</li>" +
        "<li>Os <strong>agentes móveis</strong> levam código e dados juntos, visitando " +
        "uma máquina após a outra. A aplicabilidade deles é limitada, porque executar " +
        "código de origem alheia levanta problemas de segurança difíceis de " +
        "resolver.</li>" +
        "</ul>" +
        "<p>As quatro perguntas estão respondidas, e vale reunir o que cada uma rendeu. " +
        "Quem se comunica são processos, que o programador enxerga como objetos, " +
        "componentes e serviços Web. O paradigma decide o quanto a rede aparece no " +
        "código, e os dois desacoplamentos refinam essa escolha em quatro formas de " +
        "coordenação. Os papéis dizem quem pede e quem serve, sendo o peer-to-peer o " +
        "caso em que os dois coincidem na mesma máquina. O posicionamento decide onde " +
        "cada peça roda, que é a realização física de que a seção 1 falou. Descrever uma " +
        "arquitetura é responder a essas quatro perguntas.</p>",
      slides: [
        {
          title: "Quatro perguntas de arquitetura",
          html:
            "<ul>" +
            "<li><strong>Que entidades</strong> se comunicam?</li>" +
            "<li><strong>Por qual paradigma</strong> elas se comunicam?</li>" +
            "<li><strong>Que papéis</strong> elas exercem na arquitetura?</li>" +
            "<li><strong>Onde</strong> elas são posicionadas na infraestrutura física?</li>" +
            "<li>Responder às quatro é descrever a arquitetura do sistema, que precisa " +
            "sair confiável, gerenciável, adaptável e rentável</li>" +
            "</ul>"
        },
        {
          title: "Componente e conector",
          html:
            "<ul>" +
            "<li>Um <strong>componente</strong> é uma unidade modular que declara o que " +
            "oferece e o que exige</li>" +
            "<li>Ser modular não é elegância, é necessidade. Só se troca uma peça com o " +
            "sistema no ar se <strong>a interface dela permanecer intacta</strong></li>" +
            "<li>Um <strong>conector</strong> é o mecanismo que medeia a comunicação. " +
            "Chamada de procedimento, passagem de mensagens e fluxo de dados são todos " +
            "conectores</li>" +
            "<li>Componentes e conectores combinados de forma recorrente formam um " +
            "<strong>estilo de arquitetura</strong></li>" +
            "</ul>"
        },
        {
          title: "Que entidades se comunicam",
          html:
            "<ul>" +
            "<li>Para o sistema, quem troca mensagens são <strong>processos</strong></li>" +
            "<li>Quem programa pensa em outra unidade, e são três</li>" +
            "<li>O <strong>objeto</strong> é acessado pela interface descrita em uma IDL, " +
            "a linguagem de definição de interfaces, para que as duas pontas concordem " +
            "mesmo escritas em linguagens diferentes</li>" +
            "<li>O <strong>componente</strong> declara também as dependências de que " +
            "precisa, e não só o que oferece</li>" +
            "<li>O <strong>serviço Web</strong> nasce integrado à Web, com URI e XML. É a " +
            "escolha comum entre organizações</li>" +
            "</ul>"
        },
        {
          title: "Três paradigmas de comunicação",
          ref: "tab-paradigmas"
        },
        {
          title: "Duas perguntas, quatro formas de coordenação",
          ref: "tab-coordenacao"
        },
        {
          title: "Por que o estilo orientado a serviços apareceu",
          html:
            "<ul>" +
            "<li>O estilo em camadas cria <strong>dependência forte</strong> entre " +
            "camadas vizinhas</li>" +
            "<li>Um componente que só preenchia texto com zeros foi retirado da " +
            "biblioteca pública em que vivia, e <strong>milhares de programas " +
            "pararam</strong></li>" +
            "<li>A resposta é organizar o sistema como entidades separadas e " +
            "independentes, cada uma encapsulando um <strong>serviço</strong> e rodando " +
            "como processo próprio</li>" +
            "<li>Objetos, serviços e microsserviços diferem no tamanho, não nessa " +
            "característica</li>" +
            "</ul>"
        },
        {
          title: "O objeto distribuído",
          ref: "fig-objeto-remoto",
          html:
            "<ul>" +
            "<li>O proxy tem <strong>a mesma interface do objeto</strong>, então o " +
            "cliente chama como se fosse local</li>" +
            "<li>Na <strong>maior parte</strong> deles o estado não fica distribuído. " +
            "Ele mora numa máquina só, e o que se publica fora é a interface</li>" +
            "</ul>"
        },
        {
          title: "Microsserviços",
          html:
            "<ul>" +
            "<li>A inspiração é o Unix, em que muitos programas pequenos e independentes " +
            "se compõem para formar programas maiores</li>" +
            "<li>Cada um roda como <strong>processo de rede separado</strong> e " +
            "representa um serviço de fato independente</li>" +
            "<li>Não há acordo sobre o tamanho, apesar do prefixo. O que importa é a " +
            "<strong>modularização</strong></li>" +
            "<li>O tamanho importa por outro motivo. Sendo processo de rede, ele pode ser " +
            "colocado em lugares diferentes, e <strong>onde instalar</strong> virou " +
            "pergunta de projeto com as infraestruturas de borda</li>" +
            "<li>Um serviço comum é maior e nem sempre é da mesma organização. Não é raro " +
            "que ele seja, por dentro, uma coleção de microsserviços</li>" +
            "</ul>"
        },
        {
          title: "REST: quatro operações para tudo",
          ref: "tab-rest"
        },
        {
          title: "O que o REST cobra pela simplicidade",
          html:
            "<ul>" +
            "<li>Recursos com <strong>esquema único de nomes</strong>, a mesma interface " +
            "em todos os serviços, mensagens que se descrevem por completo e " +
            "<strong>execução sem estado</strong></li>" +
            "<li>Esquema intrincado fica difícil com quatro operações genéricas, e a " +
            "transação distribuída é o caso clássico, porque exige guardar o estado da " +
            "execução</li>" +
            "<li>Interface específica pega erro de sintaxe <strong>na compilação</strong>; " +
            "interface genérica, em que o pedido vira uma cadeia de caracteres, só pega " +
            "<strong>em execução</strong></li>" +
            "</ul>"
        },
        {
          title: "Publicar-assinar",
          html:
            "<ul>" +
            "<li>Separa com força o <strong>processamento</strong> da " +
            "<strong>coordenação</strong>, e nenhum dos dois lados conhece o outro</li>" +
            "<li>Quem produz publica a notificação de um evento. Quem tem interesse " +
            "registra uma assinatura no middleware, que faz o casamento</li>" +
            "<li>Assinatura <strong>por tópico</strong> pede um valor exato; " +
            "<strong>por conteúdo</strong> admite faixas e predicados</li>" +
            "<li>Quanto mais expressiva a descrição, mais caro testar se o evento casa " +
            "com ela</li>" +
            "<li>Se o middleware manda os dados junto, não guarda nada e exige o " +
            "assinante no ar. Se manda só o aviso, precisa armazenar</li>" +
            "</ul>"
        },
        {
          title: "Papéis, do cliente-servidor ao peer-to-peer",
          html:
            "<ul>" +
            "<li>O <strong>cliente-servidor</strong> é o mais empregado, e o papel é do " +
            "processo, não da máquina. Um servidor Web vira cliente quando consulta o " +
            "DNS</li>" +
            "<li>Centralizar cobra o preço na escala, porque a capacidade e a banda do " +
            "servidor limitam o sistema inteiro</li>" +
            "<li>No <strong>peer-to-peer</strong> todos executam o mesmo programa e " +
            "oferecem as mesmas interfaces</li>" +
            "<li>Os recursos <strong>crescem com o número de usuários</strong>, que é " +
            "justamente o limite que a centralização impõe</li>" +
            "<li>Em troca, posicionar os objetos, recuperá-los e replicá-los fica bem " +
            "mais complexo</li>" +
            "</ul>"
        },
        {
          title: "Posicionamento, ou onde colocar cada coisa",
          html:
            "<ul>" +
            "<li><strong>Vários servidores</strong>, com os dados particionados entre " +
            "eles, como na Web, ou replicados em todos, como no NIS</li>" +
            "<li><strong>Cache</strong>, que guarda cópias perto de quem usa, no navegador " +
            "ou em um proxy no caminho</li>" +
            "<li><strong>Código móvel</strong>, que inverte o sentido da viagem e roda na " +
            "máquina do usuário. O applet é o caso clássico</li>" +
            "<li><strong>Agentes móveis</strong>, que levam código e dados de uma máquina " +
            "a outra. O uso é limitado por causa da segurança</li>" +
            "</ul>"
        }
      ]
    },
    {
      title: "Padrões arquitetônicos e middleware",
      html:
        "<p>Os elementos básicos da seção anterior respondem a perguntas isoladas, e um " +
        "sistema real precisa combinar as respostas. Os <strong>padrões " +
        "arquitetônicos</strong> são estruturas compostas que já se mostraram boas " +
        "soluções em circunstâncias conhecidas, e conhecê-los evita projetar do zero o " +
        "que já foi resolvido muitas vezes.</p>" +
        "<h3>Camadas lógicas (layers)</h3>" +
        "<p>Um sistema complexo fica mais fácil de entender quando é particionado " +
        "verticalmente em camadas. Cada camada usa os serviços da camada imediatamente " +
        "inferior e não precisa saber como eles foram implementados. É essa ignorância " +
        "deliberada que permite trocar a implementação de baixo sem reescrever o que " +
        "está em cima.</p>" +
        "<p>Em sistemas distribuídos, a pilha costuma ter quatro níveis. Repare, no " +
        "diagrama, em que ordem eles se empilham e, principalmente, em quais dois deles " +
        "são tratados como uma coisa só.</p>" +
        '<figure class="figura" id="fig-camadas">' +
        '<svg viewBox="0 0 600 300" role="img" aria-labelledby="fig-camadas-titulo">' +
        '<title id="fig-camadas-titulo">Pilha de quatro camadas, da aplicação no topo ao ' +
        "hardware na base, com o hardware e o sistema operacional agrupados sob o nome " +
        "de plataforma.</title>" +
        '<rect class="caixa" x="30" y="12" width="380" height="54" rx="8"/>' +
        '<text x="220" y="45" text-anchor="middle" font-size="17">Aplicações e serviços</text>' +
        '<path class="traco" d="M220 66 L220 78"/>' +
        '<path class="seta" d="M214 78 L226 78 L220 86 Z"/>' +
        '<text class="rotulo-secundario" x="234" y="82" font-size="13">usa os serviços de</text>' +
        '<rect class="caixa-destaque" x="30" y="86" width="380" height="54" rx="8"/>' +
        '<text x="220" y="119" text-anchor="middle" font-size="17">Middleware</text>' +
        '<path class="traco" d="M220 140 L220 152"/>' +
        '<path class="seta" d="M214 152 L226 152 L220 160 Z"/>' +
        '<rect class="caixa" x="30" y="160" width="380" height="54" rx="8"/>' +
        '<text x="220" y="193" text-anchor="middle" font-size="17">Sistema operacional</text>' +
        '<path class="traco" d="M220 214 L220 226"/>' +
        '<path class="seta" d="M214 226 L226 226 L220 234 Z"/>' +
        '<rect class="caixa" x="30" y="234" width="380" height="54" rx="8"/>' +
        '<text x="220" y="267" text-anchor="middle" font-size="17">Hardware</text>' +
        '<path class="traco" d="M425 160 L437 160 L437 288 L425 288"/>' +
        '<text class="rotulo-secundario" x="447" y="229" font-size="15">plataforma</text>' +
        "</svg>" +
        "<figcaption>A plataforma é o par formado pelo hardware e pelo sistema " +
        "operacional, como um computador com processador Intel x86 executando Linux. O " +
        "middleware fica acima dela e abaixo das aplicações, e é essa posição que define " +
        "o trabalho dele.</figcaption>" +
        "</figure>" +
        "<p>O papel do middleware é o que mais interessa aqui. Ele mascara a " +
        "heterogeneidade das plataformas, de modo que o mesmo programa não precise ser " +
        "reescrito para cada combinação de hardware e sistema operacional. Além disso, " +
        "oferece abstrações de programação de nível mais alto, como a invocação remota, " +
        "a notificação de eventos e a replicação.</p>" +
        "<p>Uma comparação ajuda a fixar essa posição. O middleware está para o sistema " +
        "distribuído assim como o sistema operacional está para um computador, porque " +
        "também é um gerente de recursos, só que de recursos espalhados pela rede. Ele " +
        "presta, por isso, serviços que qualquer sistema operacional também presta, entre " +
        "eles a comunicação entre aplicações, a segurança, a contabilização do uso e o " +
        "mascaramento de falhas com a recuperação delas. O que muda é que esses serviços " +
        "são oferecidos num ambiente em rede, e que quase todos servem a muitas aplicações " +
        "ao mesmo tempo. Daí a outra forma de enxergá-lo, como um repositório de " +
        "componentes de uso comum que cada aplicação não precisa mais escrever por conta " +
        "própria.</p>" +
        "<h3>Camadas físicas (tiers)</h3>" +
        "<p>As camadas lógicas dizem respeito à organização interna do software. As " +
        "camadas físicas respondem a outra pergunta, que é em quantas máquinas essa " +
        "organização vai ser distribuída. Uma aplicação típica se decompõe em três " +
        "elementos, a <em>apresentação</em>, a <em>lógica da aplicação</em> e o acesso " +
        "aos <em>dados</em>, e a arquitetura muda conforme o lugar em que cada um deles " +
        "é executado.</p>" +
        "<p>As duas soluções mais comuns se comparam pelas mesmas três dimensões.</p>" +
        '<div class="tabela-rolagem">' +
        '<table class="tabela-conteudo" id="tab-camadas">' +
        "<tr><th>Dimensão</th><th>Duas camadas</th><th>Três camadas</th></tr>" +
        "<tr><td>Onde ficam os três elementos</td>" +
        "<td>Divididos entre dois processos, um no cliente e outro no servidor.</td>" +
        "<td>Cada elemento lógico ganha o seu servidor, com o de aplicação separado do " +
        "de banco de dados.</td></tr>" +
        "<tr><td>Custo de um pedido</td>" +
        "<td>Uma única troca de mensagens.</td>" +
        "<td>Uma troca a mais, porque o pedido atravessa outro salto de rede.</td></tr>" +
        "<tr><td>Efeito sobre a manutenção</td>" +
        "<td>A lógica da aplicação fica partida entre as duas pontas.</td>" +
        "<td>Cada responsabilidade tem um lugar só.</td></tr>" +
        "</table>" +
        "</div>" +
        "<p>A comparação revela uma troca, e não uma solução melhor que a outra, porque " +
        "a arquitetura de duas camadas ganha em latência e perde em manutenção, e a de " +
        "três faz exatamente o inverso. O mesmo raciocínio se estende para <em>n</em> " +
        "camadas, e a Wikipedia mostra a escala que esse arranjo alcança, atendendo até " +
        "60 mil pedidos de página por segundo.</p>" +
        "<p>O Asynchronous JavaScript and XML (AJAX) é a técnica que costura cliente e " +
        "servidor na Web interativa. Em vez de recarregar a página inteira a cada ação, " +
        "o JavaScript que roda no navegador pede ao servidor apenas os dados de que " +
        "precisa e atualiza somente a parte afetada da página. O Google Maps é o exemplo " +
        "clássico, porque o mapa se desloca continuamente enquanto o resto da interface " +
        "permanece onde está.</p>" +
        /* A demo saiu daqui para página própria em 2026-08-07 (formato em avaliação,
           ver docs/demos/). O cartão fica neste ponto, e não no fim do tópico como o
           da prática, porque é aqui que o aluno já leu tudo o que as cinco etapas
           cobram: papéis e posicionamento na seção 2, camadas físicas logo acima. */
        '<a class="lab-card" href="demos/modelos-arquitetura/index.html" ' +
        'target="_blank" rel="noopener">' +
        '<span class="lab-card-eyebrow">Demonstração interativa · 5 etapas · ' +
        "cerca de 10 min</span>" +
        '<span class="lab-card-title">Arquiteto de Sistemas</span>' +
        '<span class="lab-card-summary">Monte um sistema que aguente a carga que ' +
        "os usuários impõem. Você começa com um servidor só, descobre onde ele " +
        "quebra e escolhe entre replicar, guardar em cache e separar em camadas, " +
        "medindo o efeito de cada decisão.</span>" +
        '<span class="lab-card-cta">Abrir a demonstração ↗</span>' +
        "</a>" +
        "<h3>Thin client e outros padrões</h3>" +
        "<p>Existe uma tendência de tirar complexidade do equipamento do usuário, e ela " +
        "leva ao <strong>thin client</strong>. Nesse arranjo, o equipamento do usuário " +
        "fica apenas com a interface, e a execução acontece remotamente.</p>" +
        "<p>A Computação de Rede Virtual (VNC) é a realização mais conhecida dessa " +
        "ideia, e transmite entre as duas pontas apenas os eventos de teclado, de vídeo " +
        "e de mouse. Por isso ela funciona em qualquer aparelho, por mais modesto que " +
        "seja, mas sofre nas atividades gráficas muito interativas.</p>" +
        "<p>Outros três padrões aparecem com frequência nos sistemas distribuídos. O " +
        "<strong>proxy</strong> é um " +
        "representante local do objeto remoto e oferece a mesma interface que ele, o que " +
        "faz dele a base da transparência em RPC e em RMI. O " +
        "<strong>brokerage</strong> resolve o problema de o cliente não saber de antemão " +
        "quem oferece o serviço de que ele precisa. Ele organiza três " +
        "participantes, o provedor de serviços, o solicitante e o corretor que aproxima " +
        "os dois, e é o padrão por trás dos diretórios de serviços Web. A " +
        "<strong>reflexão</strong> dá ao próprio sistema a capacidade de examinar a " +
        "própria estrutura em execução, o que se chama de introspecção, e de se adaptar " +
        "dinamicamente a partir do que descobriu.</p>" +
        "<h3>Middleware: categorias e limites</h3>" +
        "<p>As principais classes de middleware seguem os modelos arquitetônicos vistos " +
        "na seção anterior, ou seja, cada classe leva para a prática um dos modos de " +
        "organizar entidades, papéis e comunicação. Seis delas aparecem com mais " +
        "frequência, e vale reconhecer cada uma pelo problema que ela resolve, não pelo " +
        "nome do produto que a implementa.</p>" +
        "<ul>" +
        "<li>O middleware de <strong>objetos distribuídos</strong> faz o objeto remoto " +
        "ser chamado como se fosse local. Seguem esse modelo o modelo de referência para " +
        "processamento distribuído aberto, padronizado pela Organização Internacional de " +
        "Normalização (ISO), além do CORBA e do Java " +
        "RMI.</li>" +
        "<li>O de <strong>componentes distribuídos</strong> declara também as " +
        "dependências de cada peça, e não apenas o que ela oferece. Seguem esse modelo o " +
        "Fractal, os Enterprise JavaBeans (EJB) e os servidores de aplicação, que " +
        "sustentam diretamente a arquitetura de três camadas.</li>" +
        "<li>O de <strong>publicar-assinar</strong> entrega cada evento a quem se " +
        "declarou interessado nele, sem que o remetente saiba quem são os destinatários. " +
        "O Java Message Service (JMS) é a realização mais difundida.</li>" +
        "<li>As <strong>filas de mensagem</strong> guardam a mensagem até que o " +
        "destinatário venha buscá-la, o que dispensa os dois lados de estarem no ar ao " +
        "mesmo tempo. O WebSphere MQ (Message Queue) é o exemplo mais conhecido.</li>" +
        "<li>Os <strong>serviços Web</strong> expõem a funcionalidade por interfaces " +
        "integradas à Web, como faz o Apache Axis.</li>" +
        "<li>O middleware <strong>peer-to-peer</strong> organiza nós que executam o " +
        "mesmo programa e têm o mesmo papel, como no Gnutella e no Pastry.</li>" +
        "</ul>" +
        '<div class="callout">' +
        '<p class="callout-title">⚠️ O princípio fim-a-fim</p>' +
        "<p>Algumas funções de comunicação só podem ser implementadas completa e " +
        "corretamente com o conhecimento da <em>aplicação</em> nos pontos extremos " +
        "(Saltzer, Reed e Clark, 1984). O middleware simplifica muito, mas alguns " +
        "aspectos de confiabilidade continuam exigindo suporte no nível da aplicação. Um " +
        "e-mail gigante, por exemplo, precisa de retomada própria além da que o TCP " +
        "oferece.</p>" +
        "</div>" +
        "<h3>Como o middleware se abre</h3>" +
        "<p>As classes acima dizem o que cada middleware faz, e nenhuma delas nasce " +
        "sabendo qual aplicação vai usá-la. Reaparece aqui a abertura estudada no tópico " +
        "01, agora como problema de projeto interno. Middleware aberto é o que pode ser " +
        "estendido para o caso que ninguém previu sem ser reescrito por dentro, e dois " +
        "padrões de projeto carregam quase toda essa responsabilidade. O empacotador " +
        "resolve um problema, o interceptador resolve outro, e os dois perseguem o mesmo " +
        "objetivo.</p>" +
        "<h4>Empacotadores, quando a interface não serve</h4>" +
        "<p>Montar um sistema distribuído a partir de peças que já existem esbarra num " +
        "obstáculo imediato. A interface que o componente antigo oferece dificilmente é a " +
        "que a aplicação nova precisa chamar. O <strong>empacotador</strong> (wrapper), " +
        "também chamado de adaptador, é um componente que oferece uma interface aceitável " +
        "para quem chama e traduz cada função dela para as que o componente de fato tem. " +
        "Ele resolve o problema da interface incompatível, e nada além disso.</p>" +
        "<p>O <code>S3</code>, visto na seção anterior, é um exemplo direto. Ele publica " +
        "duas interfaces, uma no estilo de recursos sobre HTTP e outra mais tradicional. " +
        "Quem usa a primeira conversa com um servidor Web comum, e esse servidor age como " +
        "adaptador do serviço de armazenamento real, porque disseca a requisição que chega " +
        "e repassa as partes a servidores especializados internos. O cliente nunca fala " +
        "com o armazenamento. Ele fala com o empacotador.</p>" +
        "<p>Enquanto foram poucos, os empacotadores davam conta da extensibilidade " +
        "sozinhos. Se a aplicação A guardava dados de que a aplicação B precisava, bastava " +
        "escrever um empacotador específico para B. O problema aparece na hora de contar " +
        "quantos esse arranjo exige, porque com <em>N</em> aplicações que dependem umas " +
        "das outras são <em>N</em> × (<em>N</em> - 1) empacotadores, número que cresce com " +
        "o quadrado de <em>N</em>.</p>" +
        "<p>A saída é o <strong>corretor</strong> (broker), um componente logicamente " +
        "centralizado por onde passam todos os acessos entre aplicações. Cada aplicação " +
        "manda ao corretor um pedido dizendo do que precisa. O corretor conhece todas as " +
        "aplicações relevantes, procura as adequadas, combina e transforma as respostas " +
        "quando é o caso, e devolve o resultado a quem pediu. Como ele oferece uma " +
        "interface só para cada aplicação, bastam 2<em>N</em> empacotadores, conta que " +
        "cresce em proporção direta ao número de aplicações. É a mesma corretagem descrita " +
        "acima, agora com o número que justifica a escolha.</p>" +
        '<figure class="figura" id="fig-empacotadores">' +
        '<svg viewBox="0 0 600 270" role="img" aria-labelledby="fig-empacotadores-titulo">' +
        '<title id="fig-empacotadores-titulo">Quatro aplicações ligadas todas com todas, ' +
        "do lado esquerdo, e as mesmas quatro ligadas a um corretor central, do lado " +
        "direito, que reduz as seis ligações a quatro.</title>" +
        '<path class="traco" d="M80 67 L200 67"/>' +
        '<path class="traco" d="M80 187 L200 187"/>' +
        '<path class="traco" d="M80 67 L80 187"/>' +
        '<path class="traco" d="M200 67 L200 187"/>' +
        '<path class="traco" d="M80 67 L200 187"/>' +
        '<path class="traco" d="M200 67 L80 187"/>' +
        '<rect class="caixa" x="48" y="52" width="64" height="30" rx="6"/>' +
        '<text x="80" y="72" text-anchor="middle" font-size="15">A</text>' +
        '<rect class="caixa" x="168" y="52" width="64" height="30" rx="6"/>' +
        '<text x="200" y="72" text-anchor="middle" font-size="15">B</text>' +
        '<rect class="caixa" x="48" y="172" width="64" height="30" rx="6"/>' +
        '<text x="80" y="192" text-anchor="middle" font-size="15">C</text>' +
        '<rect class="caixa" x="168" y="172" width="64" height="30" rx="6"/>' +
        '<text x="200" y="192" text-anchor="middle" font-size="15">D</text>' +
        '<text x="140" y="26" text-anchor="middle" font-size="15">Sem corretor</text>' +
        '<text class="rotulo-secundario" x="140" y="240" text-anchor="middle" font-size="13">' +
        "N × (N - 1), aqui 12</text>" +
        '<path class="traco" d="M300 40 L300 216" stroke-dasharray="5 5"/>' +
        '<path class="traco" d="M400 67 L460 127"/>' +
        '<path class="traco" d="M520 67 L460 127"/>' +
        '<path class="traco" d="M400 187 L460 127"/>' +
        '<path class="traco" d="M520 187 L460 127"/>' +
        '<rect class="caixa-destaque" x="422" y="112" width="76" height="30" rx="6"/>' +
        '<text x="460" y="132" text-anchor="middle" font-size="13">corretor</text>' +
        '<rect class="caixa" x="368" y="52" width="64" height="30" rx="6"/>' +
        '<text x="400" y="72" text-anchor="middle" font-size="15">A</text>' +
        '<rect class="caixa" x="488" y="52" width="64" height="30" rx="6"/>' +
        '<text x="520" y="72" text-anchor="middle" font-size="15">B</text>' +
        '<rect class="caixa" x="368" y="172" width="64" height="30" rx="6"/>' +
        '<text x="400" y="192" text-anchor="middle" font-size="15">C</text>' +
        '<rect class="caixa" x="488" y="172" width="64" height="30" rx="6"/>' +
        '<text x="520" y="192" text-anchor="middle" font-size="15">D</text>' +
        '<text x="460" y="26" text-anchor="middle" font-size="15">Com corretor</text>' +
        '<text class="rotulo-secundario" x="460" y="240" text-anchor="middle" font-size="13">' +
        "2N, aqui 8</text>" +
        "</svg>" +
        '<p class="figura-fonte">Fonte: traduzido de Van Steen e Tanenbaum (2023).</p>' +
        "<figcaption>Cada ligação exige um empacotador em cada ponta, e é por isso que a " +
        "conta cresce com o quadrado. Com quatro aplicações são 12 empacotadores sem " +
        "corretor e 8 com ele, e a distância entre as duas contas aumenta a cada aplicação " +
        "nova.</figcaption>" +
        "</figure>" +
        "<h4>Interceptadores, quando o fluxo precisa desviar</h4>" +
        "<p>O <strong>interceptador</strong> é apenas uma construção de software que quebra " +
        "o fluxo normal de controle e deixa outro código, escrito para uma aplicação " +
        "específica, executar naquele ponto. É o meio principal de adaptar o middleware às " +
        "necessidades de uma aplicação, e daí ser o segundo pilar da abertura. Torná-lo " +
        "genérico custa um esforço de implementação considerável, e nem sempre compensa, " +
        "porque instalações de interceptação limitadas costumam deixar o software e o " +
        "sistema inteiro mais fáceis de administrar.</p>" +
        "<p>A invocação de um objeto remoto deixa a ideia concreta, e ela acontece em três " +
        "passos que os próximos tópicos detalham. Primeiro, o objeto A recebe uma interface " +
        "local idêntica à do objeto B, que está em outra máquina, e chama o método nessa " +
        "interface. Depois, a chamada vira uma invocação genérica, oferecida pelo " +
        "middleware da máquina de A, de modo que <code>B.doit(val)</code> se torna " +
        "<code>invoke(B, &amp;doit, val)</code>. Por fim, a invocação genérica vira uma " +
        "mensagem, entregue à interface de rede do sistema operacional local.</p>" +
        '<figure class="figura" id="fig-interceptadores">' +
        '<svg viewBox="0 0 600 300" role="img" aria-labelledby="fig-interceptadores-titulo">' +
        '<title id="fig-interceptadores-titulo">Os três passos da invocação de um objeto ' +
        "remoto empilhados, da interface local até a mensagem na rede, com um interceptador " +
        "de requisição entre o primeiro e o segundo passo e um interceptador de mensagem " +
        "entre o segundo e o terceiro.</title>" +
        '<path class="traco" d="M155 97 L322 97"/>' +
        '<path class="seta" d="M322 91 L322 103 L330 97 Z"/>' +
        '<path class="traco" d="M155 207 L322 207"/>' +
        '<path class="seta" d="M322 201 L322 213 L330 207 Z"/>' +
        '<path class="traco" d="M155 66 L155 120"/>' +
        '<path class="seta" d="M149 120 L161 120 L155 128 Z"/>' +
        '<path class="traco" d="M155 176 L155 230"/>' +
        '<path class="seta" d="M149 230 L161 230 L155 238 Z"/>' +
        '<rect class="caixa" x="30" y="18" width="250" height="48" rx="8"/>' +
        '<text x="155" y="39" text-anchor="middle" font-size="15">1. Interface local, igual à de B</text>' +
        '<text class="rotulo-secundario" x="155" y="57" text-anchor="middle" font-size="12">' +
        "A chama B.doit(val)</text>" +
        '<rect class="caixa" x="30" y="128" width="250" height="48" rx="8"/>' +
        '<text x="155" y="149" text-anchor="middle" font-size="15">2. Invocação genérica</text>' +
        '<text class="rotulo-secundario" x="155" y="167" text-anchor="middle" font-size="12">' +
        "vira invoke(B, &amp;doit, val)</text>" +
        '<rect class="caixa" x="30" y="238" width="250" height="48" rx="8"/>' +
        '<text x="155" y="259" text-anchor="middle" font-size="15">3. Mensagem na rede</text>' +
        '<text class="rotulo-secundario" x="155" y="277" text-anchor="middle" font-size="12">' +
        "entregue ao sistema operacional</text>" +
        '<rect class="caixa-destaque" x="330" y="73" width="240" height="48" rx="8"/>' +
        '<text x="450" y="94" text-anchor="middle" font-size="15">Interceptador de requisição</text>' +
        '<text class="rotulo-secundario" x="450" y="112" text-anchor="middle" font-size="12">' +
        "chama uma vez por réplica de B</text>" +
        '<rect class="caixa-destaque" x="330" y="183" width="240" height="48" rx="8"/>' +
        '<text x="450" y="204" text-anchor="middle" font-size="15">Interceptador de mensagem</text>' +
        '<text class="rotulo-secundario" x="450" y="222" text-anchor="middle" font-size="12">' +
        "quebra o vetor grande em partes</text>" +
        "</svg>" +
        '<p class="figura-fonte">Fonte: traduzido de Van Steen e Tanenbaum (2023).</p>' +
        "<figcaption>O interceptador não substitui nenhum dos três passos. Ele se instala " +
        "entre dois deles e faz o desvio de que a aplicação precisa, sem que os passos " +
        "vizinhos tomem conhecimento.</figcaption>" +
        "</figure>" +
        "<p>Cada uma das duas passagens é um ponto de corte. Suponha que B esteja " +
        "replicado, porque então cada réplica precisa ser invocada. O " +
        "<strong>interceptador de requisição</strong> resolve isso sozinho, chamando " +
        "<code>invoke</code> uma vez para cada réplica. O ganho está em quem não fica " +
        "sabendo. O objeto A não precisa saber que B está replicado, e o middleware de " +
        "objetos não precisa de componente nenhum dedicado à chamada replicada. Só o " +
        "interceptador sabe, e ele foi acrescentado ao middleware depois de o middleware " +
        "estar pronto.</p>" +
        "<p>O <strong>interceptador de mensagem</strong> age no nível de baixo, onde a " +
        "chamada finalmente vira tráfego de rede. Imagine que o parâmetro " +
        "<code>val</code> seja um vetor enorme de dados. Convém quebrá-lo em partes " +
        "menores e remontá-lo no destino, o que pode melhorar o desempenho ou a " +
        "confiabilidade. De novo o middleware não precisa tomar conhecimento, porque o " +
        "interceptador de nível mais baixo cuida sozinho do resto da conversa com o " +
        "sistema operacional local.</p>" +
        "<h4>Middleware modificável</h4>" +
        "<p>Empacotadores e interceptadores são meios de estender e adaptar o middleware, " +
        "e a necessidade de adaptar vem de fora. O ambiente em que a aplicação distribuída " +
        "executa muda o tempo todo, com mobilidade, variação forte na qualidade de serviço " +
        "da rede, hardware que falha e bateria que acaba. Em vez de responsabilizar cada " +
        "aplicação por reagir a essas mudanças, a tarefa é colocada no middleware. Some a " +
        "isso o tamanho, porque um sistema distribuído grande raramente pode ser desligado " +
        "para ter uma parte trocada.</p>" +
        "<p>Daí o nome <strong>middleware modificável</strong>, proposto por Parlavantzas " +
        "e Coulson em 2007. Ele diz mais do que middleware adaptativo, porque não basta o " +
        "software reagir ao ambiente. É preciso poder modificá-lo de propósito sem " +
        "derrubá-lo, e o interceptador é justamente o que permite adaptar o fluxo padrão de " +
        "controle. Trocar um componente de software em execução é um exemplo de " +
        "modificação, e a abordagem mais popular constrói o middleware dinamicamente a " +
        "partir de componentes.</p>" +
        "<p>O projeto baseado em componentes sustenta a modificabilidade pela composição, " +
        "que pode ser configurada estaticamente, em tempo de projeto, ou dinamicamente, em " +
        "tempo de execução. A segunda exige <strong>ligação tardia</strong> (late " +
        "binding), técnica bem-sucedida em ambientes de linguagem de programação e também " +
        "em sistemas operacionais que carregam e descarregam módulos à vontade. Selecionar " +
        "automaticamente a melhor implementação de um componente durante a execução já é " +
        "bem compreendido, mas continua complexo em sistemas distribuídos, porque " +
        "substituir um componente exige saber exatamente o efeito da troca sobre os " +
        "outros. Componentes costumam ser menos independentes do que parecem.</p>" +
        "<p>Três exigências mínimas resultam disso.</p>" +
        "<ul>" +
        "<li>O middleware precisa <strong>carregar e descarregar componentes em " +
        "execução</strong>, sem parar para isso</li>" +
        "<li>Cada componente precisa <strong>declarar as interfaces que oferece e também " +
        "as que exige</strong>, que é exatamente o traço do middleware de componentes " +
        "distribuídos listado acima</li>" +
        "<li>Componente que guarda <strong>estado entre chamadas</strong> pede medidas " +
        "próprias, porque a troca não pode esquecer o que já aconteceu</li>" +
        "</ul>" +
        "<p>Repare que a reflexão, citada entre os padrões recorrentes, é a peça que fecha " +
        "esse quadro. Um sistema capaz de examinar a própria estrutura em execução tem como " +
        "descobrir quais componentes estão no ar e quais interfaces eles declaram, que é a " +
        "informação de que a modificação em tempo de execução depende.</p>" +
        "<h3>Arquiteturas híbridas</h3>" +
        "<p>Os padrões vistos até aqui aparecem isolados só no material didático. Um " +
        "sistema real combina traços centralizados com traços peer-to-peer e com " +
        "organizações hierárquicas, e a mistura fica ainda mais complicada quando ele " +
        "atravessa a fronteira entre organizações, porque então nenhuma delas responde " +
        "sozinha pela operação. Três arranjos híbridos merecem atenção, e os três são " +
        "recentes o bastante para ainda estarem em movimento.</p>" +
        "<h4>A nuvem, em quatro camadas</h4>" +
        "<p>Quem opera centro de dados passou anos procurando um jeito de abrir esses " +
        "recursos a terceiros. O resultado foi a computação como utilidade, em que o " +
        "cliente envia tarefas ao centro de dados e paga pelo recurso consumido, e é dela " +
        "que a <strong>computação em nuvem</strong> descende. O que caracteriza a nuvem é " +
        "um conjunto de recursos virtualizados de acesso fácil, configuráveis " +
        "dinamicamente, com cobrança por uso e garantias fixadas em acordos de nível de " +
        "serviço, que são os contratos em que o provedor declara o que promete entregar " +
        "e o que acontece se não entregar.</p>" +
        "<p>Poder pedir mais recursos quando o trabalho aumenta é justamente o que dá " +
        "escalabilidade ao arranjo. Ele se organiza em quatro camadas, e é útil ver quais " +
        "delas cada modelo de serviço vende.</p>" +
        '<div class="tabela-rolagem">' +
        '<table class="tabela-conteudo" id="tab-nuvem">' +
        "<tr><th>Camada</th><th>O que ela contém</th><th>Vendida como</th></tr>" +
        "<tr><td>Hardware</td>" +
        "<td>Reúne processadores, roteadores e até energia e refrigeração. O cliente " +
        "normalmente nunca vê esses recursos diretamente.</td>" +
        '<td rowspan="2">Infraestrutura como serviço (IaaS)</td></tr>' +
        "<tr><td>Infraestrutura</td>" +
        "<td>Aplica virtualização para entregar armazenamento e computação virtuais. É a " +
        "espinha dorsal da nuvem, e aqui nada é o que parece.</td></tr>" +
        "<tr><td>Plataforma</td>" +
        "<td>Faz pelo cliente da nuvem o que um sistema operacional faz por quem " +
        "desenvolve, oferecendo uma interface de programação para enviar e executar " +
        "programas, além de abstrações de armazenamento.</td>" +
        "<td>Plataforma como serviço (PaaS)</td></tr>" +
        "<tr><td>Aplicação</td>" +
        "<td>Executa as aplicações que o usuário final usa e personaliza, como as suítes " +
        "de escritório, que rodam na nuvem do fornecedor.</td>" +
        "<td>Software como serviço (SaaS)</td></tr>" +
        "</table>" +
        "</div>" +
        "<p>Vista como arquitetura de sistema, a nuvem é uma arquitetura cliente-servidor " +
        "bastante avançada. A diferença está em quanto ela esconde, porque em geral não se " +
        "sabe onde o servidor está nem se ele é, por dentro, distribuído, o que " +
        "frequentemente é. A função como serviço leva isso ao extremo, permitindo executar " +
        "código sem sequer iniciar um servidor para hospedá-lo.</p>" +
        "<h4>A borda, entre o dispositivo e a nuvem</h4>" +
        "<p>Com cada vez mais dispositivos conectados, ficou claro que a nuvem sozinha não " +
        "resolvia tudo, e daí nasceu a <strong>computação de borda</strong>. Ela trata do " +
        "posicionamento de serviços na periferia da rede, e essa periferia costuma ser a " +
        "fronteira entre a rede de uma organização e a Internet propriamente dita.</p>" +
        "<p>Um campus universitário é o exemplo mais próximo. Ele tem prédios com redes " +
        "locais ligadas por uma rede do campus, e serviços de armazenamento, computação e " +
        "aulas hospedados ali mesmo, sob responsabilidade da equipe local. Boa parte do " +
        "tráfego desses serviços nunca sai do campus, e esse conjunto de rede, servidores " +
        "e serviços é uma infraestrutura de borda típica.</p>" +
        '<figure class="figura" id="fig-borda">' +
        '<svg viewBox="0 0 640 268" role="img" aria-labelledby="fig-borda-titulo">' +
        '<title id="fig-borda-titulo">Três faixas empilhadas. Embaixo os dispositivos, no ' +
        "meio a infraestrutura de borda dentro da organização, e em cima a nuvem, com a " +
        "Internet separando a borda da nuvem.</title>" +
        '<rect class="caixa" x="60" y="10" width="500" height="52" rx="8"/>' +
        '<text x="310" y="41" text-anchor="middle" font-size="17">Nuvem</text>' +
        '<text class="rotulo-secundario" x="574" y="41" font-size="13">longe</text>' +
        '<path class="traco" d="M310 71 L310 97"/>' +
        '<path class="seta" d="M304 71 L316 71 L310 63 Z"/>' +
        '<path class="seta" d="M304 97 L316 97 L310 105 Z"/>' +
        '<text class="rotulo-secundario" x="328" y="88" font-size="13">Internet, cerca ' +
        "de 100 ms</text>" +
        '<rect class="caixa-destaque" x="60" y="106" width="500" height="52" rx="8"/>' +
        '<text x="310" y="137" text-anchor="middle" font-size="17">Infraestrutura de ' +
        "borda</text>" +
        '<path class="traco" d="M310 167 L310 193"/>' +
        '<path class="seta" d="M304 167 L316 167 L310 159 Z"/>' +
        '<path class="seta" d="M304 193 L316 193 L310 201 Z"/>' +
        '<text class="rotulo-secundario" x="328" y="184" font-size="13">rede local</text>' +
        '<rect class="caixa" x="60" y="202" width="500" height="52" rx="8"/>' +
        '<text x="310" y="233" text-anchor="middle" font-size="17">Dispositivos</text>' +
        '<text class="rotulo-secundario" x="574" y="233" font-size="13">perto</text>' +
        "</svg>" +
        "<figcaption>A faixa do meio existe por causa do salto de cima. Quando o serviço " +
        "está na nuvem, cada interação paga a latência da Internet, e há aplicações que " +
        "não sobrevivem a esse preço.</figcaption>" +
        "</figure>" +
        "<p>A pergunta natural é por que não ligar o dispositivo direto à nuvem, já que a " +
        "rede hoje é boa. Quatro argumentos costumam ser dados, e eles não têm a mesma " +
        "força.</p>" +
        "<p>O primeiro é <strong>banda</strong>, e ele envelheceu mal. A banda disponível " +
        "só cresceu ao longo das décadas, a ponto de valer a pergunta se instalar e manter " +
        "uma infraestrutura de borda por falta de banda ainda se justifica. Serviços de " +
        "vídeo são a exceção que sobra, porque quanto mais perto está a fonte, melhores " +
        "são as garantias de qualidade.</p>" +
        "<p>O segundo é <strong>latência</strong>, e esse é o argumento forte, porque aqui " +
        "quem atrapalha é a natureza. Alcançar a nuvem pode custar 100 ms, o que inutiliza " +
        "boa parte das aplicações interativas. A direção autônoma é o caso limite, já que " +
        "um carro observa o ambiente e reage continuamente, e coordenar esse movimento " +
        "pela nuvem é inaceitável em tempo real. O mesmo exemplo mostra o ganho da borda, " +
        "porque carros podem anunciar a própria posição a uma infraestrutura local e se " +
        "revelar uns aos outros ao chegar num cruzamento sem visibilidade.</p>" +
        "<p>O terceiro é <strong>confiabilidade</strong>, e ele vale menos do que parece. " +
        "Para a maioria das aplicações a conectividade com a nuvem é boa, e nos casos em " +
        "que depender dela o tempo todo não é opção, como hospitais e fábricas, medidas " +
        "próprias já existiam antes de a borda ter nome.</p>" +
        "<p>O quarto é <strong>segurança e privacidade</strong>, e ele exige cuidado. Se " +
        "uma solução na nuvem não é segura, não há razão para que a de borda seja, e " +
        "muralha em volta da organização não protege contra ataque de dentro. Existe, " +
        "porém, um motivo regulatório que é decisivo. Muitas organizações simplesmente não " +
        "têm permissão para colocar certos dados na nuvem, e prontuário médico que precisa " +
        "ficar em servidor certificado, com auditoria, obriga a manter infraestrutura " +
        "própria.</p>" +
        "<p>Acrescentar essa camada intermediária custa caro em decisão. Na nuvem, o " +
        "fornecedor decide em boa medida onde e como o serviço é realizado. Com borda, " +
        "quem decide é a organização cliente, e ela precisa responder o que fica local e o " +
        "que sobe, com menos recursos, mais heterogeneidade de hardware e carga bem mais " +
        "variável do que na nuvem. Esse trabalho de decisão tem nome, que é orquestração, " +
        "e ele se divide em alocar recursos, escolher onde instalar cada serviço e " +
        "escolher qual borda atende cada pedido.</p>" +
        "<h4>Blockchain, quando não há terceiro confiável</h4>" +
        "<p>Um sistema de transações precisa validar a transação, efetivá-la e guardá-la " +
        "para auditoria. Se Alice transfere dez reais para Bob, normalmente um banco " +
        "verifica se ela tem saldo, se Bob pode receber, executa a transferência e mantém " +
        "o registro. O banco funciona como <strong>terceiro confiável</strong>.</p>" +
        "<p>O blockchain parte de uma suposição de projeto diferente, que é a de que as " +
        "partes participantes não podem, em princípio, ser confiáveis. Isso exclui também " +
        "o terceiro confiável, e é essa exclusão que gera toda a arquitetura. Os " +
        "participantes registram as transações num livro-razão público, de modo que " +
        "qualquer um possa ver o que aconteceu e verificar a validade de uma transação. " +
        "Num sistema de moedas digitais, isso permite conferir se uma moeda já foi gasta, " +
        "percorrendo as transações desde o início.</p>" +
        "<p>O funcionamento tem três passos. Alice anuncia a todos a intenção de " +
        "transferir, o que permite a voluntários validarem a transação. Um validador " +
        "agrupa várias transações num bloco, por eficiência. Se o bloco é válido, ele o " +
        "protege contra modificação e o acrescenta à cadeia, difundindo-o a todos os " +
        "participantes.</p>" +
        "<p>A imutabilidade do bloco tem uma consequência que vale notar. Como ele nunca " +
        "vai mudar, replicá-lo em massa sai barato, e cada participante guarda a cadeia " +
        "inteira localmente para que a verificação seja simples. A cadeia é logicamente " +
        "única e fisicamente replicada pela Internet inteira.</p>" +
        "<p>O que separa um sistema de blockchain de outro é quem pode validar, e decidir " +
        "isso exige <strong>consenso distribuído</strong>, que é o problema de fazer nós " +
        "independentes chegarem à mesma decisão mesmo quando parte deles falha ou mente. " +
        "O Tópico 10 mostra o preço que ele cobra na replicação, e aqui basta saber que " +
        "ele existe e que sai caro. Há três organizações possíveis.</p>" +
        '<div class="tabela-rolagem">' +
        '<table class="tabela-conteudo" id="tab-blockchain">' +
        "<tr><th>Organização</th><th>Quem valida</th><th>Onde ela aperta</th></tr>" +
        "<tr><td>Centralizada</td>" +
        "<td>Um terceiro confiável valida as transações, como fazia o banco.</td>" +
        "<td>Contraria o objetivo de projeto, porque é justamente o terceiro confiável que " +
        "se queria eliminar.</td></tr>" +
        "<tr><td>Distribuída, com permissão</td>" +
        "<td>Um grupo pequeno e pré-selecionado de nós recebe permissão para validar.</td>" +
        "<td>Nenhum deles é considerado confiável, então eles rodam um protocolo de " +
        "consenso que resiste a comportamento malicioso, suportando no máximo um terço de " +
        "nós defeituosos. Na prática o grupo não passa de algumas dezenas.</td></tr>" +
        "<tr><td>Descentralizada, sem permissão</td>" +
        "<td>Todos os nós participam coletivamente da validação.</td>" +
        "<td>Quem quiser validar entra numa eleição de líder, e o eleito acrescenta o " +
        "bloco. Nem todos querem participar, porque a eleição custa caro em recursos.</td>" +
        "</tr>" +
        "</table>" +
        "</div>" +
        "<p>Repare que a segunda linha da tabela contém uma tensão que o próprio autor " +
        "aponta. Um grupo de algumas dezenas de validadores sem confiança individual " +
        "acaba formando um grupo distribuído centralizado e tolerante a falhas, o que está " +
        "longe da descentralização que o discurso em torno do blockchain costuma " +
        "prometer.</p>" +
        "<p>Nuvem, borda e blockchain fecham a seção porque são exatamente o que ela " +
        "prometeu no começo, ou seja, padrões compostos a partir das camadas lógicas e " +
        "físicas que vieram antes. Reconhecer a composição é o que evita projetar cada " +
        "sistema novo do zero, e é também o que permite enxergar, num arranjo que se " +
        "anuncia como novidade, o cliente-servidor de sempre com outro nome.</p>",
      slides: [
        {
          title: "Camadas lógicas, e onde entra o middleware",
          ref: "fig-camadas",
          html:
            "<ul>" +
            "<li>Cada camada usa a de baixo sem saber como ela foi feita</li>" +
            "<li>A <strong>plataforma</strong> junta hardware e sistema operacional</li>" +
            "<li>O <strong>middleware</strong> mascara a heterogeneidade e oferece " +
            "abstrações de nível mais alto</li>" +
            "</ul>"
        },
        {
          title: "Camadas físicas, duas ou três",
          ref: "tab-camadas"
        },
        {
          title: "A troca das camadas físicas, e o AJAX",
          html:
            "<ul>" +
            "<li>A aplicação se decompõe em <strong>apresentação, lógica e acesso aos " +
            "dados</strong>, e a arquitetura muda com o lugar em que cada um executa</li>" +
            "<li>Não há solução melhor, há troca. Duas camadas ganham em latência e " +
            "perdem em manutenção, três fazem o inverso</li>" +
            "<li>O raciocínio se estende para n camadas, e a Wikipedia chega a 60 mil " +
            "pedidos de página por segundo</li>" +
            "<li>O <strong>AJAX</strong> pede ao servidor só os dados de que precisa e " +
            "atualiza só a parte afetada da página, como no Google Maps</li>" +
            "</ul>"
        },
        {
          title: "Thin client e três padrões recorrentes",
          html:
            "<ul>" +
            "<li>No <strong>thin client</strong> o equipamento do usuário fica só com a " +
            "interface, e a execução acontece remotamente</li>" +
            "<li>O VNC transmite apenas teclado, vídeo e mouse. Roda em qualquer aparelho, " +
            "mas sofre no gráfico muito interativo</li>" +
            "<li>O <strong>proxy</strong> é o representante local do objeto remoto, e " +
            "oferece a mesma interface. É a base da transparência em RPC e RMI</li>" +
            "<li>O <strong>brokerage</strong> junta provedor, solicitante e corretor</li>" +
            "<li>A <strong>reflexão</strong> deixa o sistema inspecionar a si mesmo e se " +
            "adaptar em execução</li>" +
            "</ul>"
        },
        {
          title: "Middleware, por problema resolvido",
          html:
            "<ul>" +
            "<li>Reconheça cada classe pelo problema que ela resolve, não pelo nome do " +
            "produto</li>" +
            "<li><strong>Objetos</strong> chamam o remoto como se fosse local (CORBA, Java " +
            "RMI). <strong>Componentes</strong> declaram também as dependências (EJB)</li>" +
            "<li><strong>Publicar-assinar</strong> entrega o evento a quem se declarou " +
            "interessado (JMS). A <strong>fila</strong> guarda a mensagem até virem " +
            "buscá-la (WebSphere MQ)</li>" +
            "<li>O <strong>princípio fim-a-fim</strong> limita todos eles. Parte da " +
            "correção só pode ser implementada na aplicação</li>" +
            "</ul>"
        },
        {
          title: "O empacotador, e por que veio o corretor",
          ref: "fig-empacotadores",
          html:
            "<ul>" +
            "<li>O <strong>empacotador</strong> traduz a interface que existe para a que " +
            "a aplicação precisa chamar</li>" +
            "<li>Sem corretor, N aplicações pedem N × (N - 1) empacotadores</li>" +
            "<li>O <strong>corretor</strong> centraliza os acessos e derruba a conta " +
            "para 2N</li>" +
            "</ul>"
        },
        {
          title: "O interceptador desvia o fluxo",
          ref: "fig-interceptadores",
          html:
            "<ul>" +
            "<li>Quebra o fluxo de controle e deixa código específico executar ali</li>" +
            "<li>O de <strong>requisição</strong> chama uma vez por réplica, e A não " +
            "fica sabendo</li>" +
            "<li>O de <strong>mensagem</strong> fragmenta o parâmetro grande antes da " +
            "rede</li>" +
            "</ul>"
        },
        {
          title: "Middleware modificável",
          html:
            "<ul>" +
            "<li>O ambiente muda o tempo todo, com mobilidade, rede irregular, hardware " +
            "que falha e bateria que acaba</li>" +
            "<li>Sistema grande não é desligado para trocar uma peça, então a mudança " +
            "tem que acontecer em execução</li>" +
            "<li>Exige <strong>ligação tardia</strong>, mais componentes que declaram o " +
            "que oferecem <em>e</em> o que exigem</li>" +
            "<li>Componentes costumam ser <strong>menos independentes</strong> do que " +
            "parecem</li>" +
            "</ul>"
        },
        {
          title: "Sistemas reais são híbridos",
          html:
            "<ul>" +
            "<li>Os padrões só aparecem isolados no material didático</li>" +
            "<li>Um sistema real combina traços <strong>centralizados</strong>, " +
            "<strong>peer-to-peer</strong> e <strong>hierárquicos</strong> ao mesmo " +
            "tempo</li>" +
            "<li>Complica mais quando ele atravessa a fronteira entre organizações, " +
            "porque aí <strong>nenhuma responde sozinha</strong> pela operação</li>" +
            "<li>Três arranjos híbridos importam hoje. A nuvem, a borda e o " +
            "blockchain</li>" +
            "</ul>"
        },
        {
          title: "A nuvem em quatro camadas",
          ref: "tab-nuvem"
        },
        {
          title: "A nuvem esconde onde o servidor está",
          html:
            "<ul>" +
            "<li>Nasceu da <strong>computação como utilidade</strong>, em que o cliente " +
            "manda tarefas ao centro de dados e paga pelo recurso consumido</li>" +
            "<li>É um conjunto de recursos virtualizados configuráveis " +
            "dinamicamente, e é isso que dá a escalabilidade</li>" +
            "<li>Como arquitetura de sistema, é <strong>cliente-servidor bastante " +
            "avançada</strong></li>" +
            "<li>A diferença está em quanto ela esconde. Não se sabe onde o servidor " +
            "está, nem se ele é distribuído por dentro, o que frequentemente é</li>" +
            "<li>A <strong>função como serviço</strong> leva ao extremo, executando " +
            "código sem sequer iniciar um servidor</li>" +
            "</ul>"
        },
        {
          title: "A borda, entre o dispositivo e a nuvem",
          ref: "fig-borda",
          html:
            "<ul>" +
            "<li>Serviço colocado na periferia da rede, na fronteira entre a rede da " +
            "organização e a Internet</li>" +
            "<li>O campus universitário é o exemplo. <strong>Boa parte</strong> do " +
            "tráfego dos serviços locais nunca sai do campus</li>" +
            "</ul>"
        },
        {
          title: "Por que não ligar tudo direto na nuvem",
          html:
            "<ul>" +
            "<li><strong>Banda</strong>: o argumento envelheceu mal, porque a banda só " +
            "cresceu. Sobra o vídeo, que quer a fonte perto</li>" +
            "<li><strong>Latência</strong>: este é o forte, porque aqui quem atrapalha é " +
            "a natureza. Cem milissegundos até a nuvem inutilizam a direção autônoma</li>" +
            "<li><strong>Confiabilidade</strong>: vale menos do que parece. Onde depender " +
            "da nuvem não é opção, já havia medida própria antes</li>" +
            "<li><strong>Segurança</strong>: se a nuvem não é segura, a borda também não " +
            "seria. O que decide é a <strong>regulação</strong>, quando o dado não pode " +
            "sair de casa</li>" +
            "<li>O preço da borda é a <strong>orquestração</strong>, ou seja, decidir o " +
            "que fica local, onde instalar e qual borda atende</li>" +
            "</ul>"
        },
        {
          title: "Blockchain: as três organizações",
          ref: "tab-blockchain"
        },
        {
          title: "O que o blockchain assume, e o que isso custa",
          html:
            "<ul>" +
            "<li>A suposição de projeto é que <strong>as partes não são confiáveis</strong>, " +
            "e isso exclui também o terceiro confiável que o banco seria</li>" +
            "<li>Transações vão para um <strong>livro-razão público</strong>, então " +
            "qualquer um verifica se uma moeda já foi gasta</li>" +
            "<li>O bloco é imutável, e por isso replicá-lo em massa sai barato. A cadeia " +
            "é <strong>logicamente única e fisicamente replicada</strong></li>" +
            "<li>Um grupo de algumas dezenas de validadores acaba sendo um grupo " +
            "distribuído centralizado e tolerante a falhas, o que está <strong>longe da " +
            "descentralização prometida</strong></li>" +
            "</ul>"
        }
      ]
    },
    {
      title: "Modelos fundamentais: interação, falhas e segurança",
      html:
        "<p>Por mais diferentes que sejam, todos os modelos de arquitetura compartilham " +
        "o essencial, que são processos comunicando-se por mensagens. Os modelos " +
        "fundamentais isolam um aspecto de cada vez desse essencial, e é esse isolamento " +
        "que permite raciocinar com precisão sobre cada um.</p>" +
        "<h3>Modelo de interação</h3>" +
        "<p>Comunicar tem custo, e três características descrevem esse custo. A " +
        "<strong>latência</strong> é o atraso entre o início do envio e o início da " +
        "recepção. A <strong>largura de banda</strong> é o volume total que pode ser " +
        "transmitido por unidade de tempo, e ela é compartilhada por todos que usam o " +
        "mesmo caminho. O <strong>jitter</strong> é a variação do atraso, que é crucial " +
        "em multimídia, porque um fluxo de áudio ou de vídeo tolera atraso constante mas " +
        "não tolera atraso irregular.</p>" +
        "<p>Há ainda um segundo custo, menos visível. Cada computador tem o seu próprio " +
        "relógio, e relógios se <em>desviam</em> (drift) a taxas diferentes, o que " +
        "significa que dois nós discordam sobre que horas são. Do que se pode ou não " +
        "supor a respeito desses dois custos nascem as duas variantes do modelo de " +
        "interação.</p>" +
        "<ul>" +
        "<li>No <strong>sistema distribuído síncrono</strong>, o tempo de execução de " +
        "cada etapa, o atraso das mensagens e o desvio dos relógios têm limites " +
        "<em>conhecidos</em>. Isso permite usar timeouts para <em>detectar</em> falhas, " +
        "porque o que ultrapassa o limite conhecido não está apenas lento. Em " +
        "compensação, garantir esses limites exige reservar recursos.</li>" +
        "<li>No <strong>sistema distribuído assíncrono</strong> não se faz " +
        "<em>nenhuma</em> suposição sobre velocidades, atrasos ou desvios. A Internet se " +
        "encaixa perfeitamente nesse modelo. Toda solução válida para um sistema " +
        "assíncrono vale também para um síncrono, e é por isso que projetar para o caso " +
        "assíncrono é a aposta mais segura.</li>" +
        "</ul>" +
        "<p>Essas duas variantes são os extremos, e nenhum dos dois descreve bem o que se " +
        "encontra na prática. Sistema puramente síncrono só existe na teoria, porque " +
        "garantir todo limite o tempo todo é caro demais. Declarar todo sistema " +
        "assíncrono, por outro lado, é pessimismo excessivo, já que na maior parte do " +
        "tempo as mensagens chegam dentro de um prazo razoável.</p>" +
        "<p>A suposição realista fica no meio e tem nome próprio. Um sistema " +
        "<strong>parcialmente síncrono</strong> comporta-se como síncrono quase sempre, " +
        "mas não há limite para quanto tempo ele pode se comportar de forma assíncrona. O " +
        "comportamento assíncrono é a exceção, e não a regra. Na prática isso significa " +
        "que o timeout serve para concluir que um processo caiu, e que essa conclusão " +
        "estará ocasionalmente errada. O projeto precisa aguentar essa detecção errada, e " +
        "boa parte da dificuldade de tolerar falhas mora exatamente aí.</p>" +
        "<p>Mesmo sem relógio global, os eventos podem ser ordenados " +
        "<em>logicamente</em>, porque algumas relações independem de que horas são. Uma " +
        "mensagem é recebida depois de ter sido enviada, e uma resposta vem depois da " +
        "leitura do pedido. O <strong>relógio lógico</strong> de Lamport (1978) numera " +
        "os eventos por essa ordem, o que resolve, por exemplo, os e-mails que chegam " +
        "fora de ordem na caixa de entrada.</p>" +
        "<h3>Modelo de falhas</h3>" +
        "<p>Antes da classificação, convém separar três palavras que o uso corrente " +
        "confunde. Um <strong>defeito</strong> é a causa, ou seja, aquilo que está errado " +
        "no sistema. Ele produz um <strong>erro</strong>, que é o estado interno " +
        "incorreto a que o defeito leva. E o erro pode chegar até a fronteira do sistema, " +
        "produzindo uma <strong>falha</strong>, que é o serviço deixando de ser prestado " +
        "como devia. Um programador escreve código errado, o que é o defeito, o programa " +
        "entra num estado inconsistente, que é o erro, e o programa quebra, que é a " +
        "falha.</p>" +
        "<p>Essa cadeia importa porque tolerar falhas é, no fundo, controlar defeitos, e " +
        "os defeitos se classificam pela persistência. O <strong>transitório</strong> " +
        "acontece uma vez e some, e repetir a operação resolve, como um pássaro cruzando " +
        "o feixe de um transmissor de micro-ondas e derrubando alguns bits. O " +
        "<strong>intermitente</strong> aparece, some sozinho e volta, e é o pior de " +
        "diagnosticar, porque costuma funcionar bem justamente quando alguém vai olhar. " +
        "Um mau contato num conector é o exemplo clássico. O <strong>permanente</strong> " +
        "continua existindo até que o componente seja trocado, como um chip queimado ou " +
        "um erro de programação.</p>" +
        "<p>O modelo de falhas define de que maneiras um sistema pode falhar, e a " +
        "taxonomia de Hadzilacos e Toueg, na versão que van Steen e Tanenbaum adotam, " +
        "organiza essas maneiras em quatro famílias. Vale olhar primeiro o desenho da " +
        "classificação, porque duas dessas famílias ainda se subdividem.</p>" +
        '<figure class="figura" id="fig-falhas">' +
        '<svg viewBox="0 0 640 355" role="img" aria-labelledby="fig-falhas-titulo">' +
        '<title id="fig-falhas-titulo">Árvore de classificação das falhas, com as ' +
        "famílias por omissão, de resposta, de temporização e arbitrária. A família por " +
        "omissão se subdivide em falha de processo e de comunicação, esta última em " +
        "omissão de envio, de recepção e de canal. A família de resposta se subdivide em " +
        "falha de valor e falha de transição de estado.</title>" +
        '<rect class="caixa-destaque" x="10" y="207" width="90" height="34" rx="6"/>' +
        '<text x="55" y="229" text-anchor="middle" font-size="13">Falhas</text>' +
        '<path class="traco" d="M100 224 H110 V119 H120"/>' +
        '<path class="traco" d="M100 224 H110 V236 H120"/>' +
        '<path class="traco" d="M100 224 H110 V282 H120"/>' +
        '<path class="traco" d="M100 224 H110 V328 H120"/>' +
        '<rect class="caixa" x="120" y="102" width="150" height="34" rx="6"/>' +
        '<text x="195" y="124" text-anchor="middle" font-size="13">Por omissão</text>' +
        '<rect class="caixa" x="120" y="219" width="150" height="34" rx="6"/>' +
        '<text x="195" y="241" text-anchor="middle" font-size="13">De resposta</text>' +
        '<rect class="caixa" x="120" y="265" width="150" height="34" rx="6"/>' +
        '<text x="195" y="287" text-anchor="middle" font-size="13">De temporização</text>' +
        '<rect class="caixa" x="120" y="311" width="150" height="34" rx="6"/>' +
        '<text x="195" y="333" text-anchor="middle" font-size="13">Arbitrárias</text>' +
        '<path class="traco" d="M270 119 H280 V71 H290"/>' +
        '<path class="traco" d="M270 119 H280 V167 H290"/>' +
        '<path class="traco" d="M270 236 H280 V213 H290"/>' +
        '<path class="traco" d="M270 236 H280 V259 H290"/>' +
        '<rect class="caixa" x="290" y="54" width="160" height="34" rx="6"/>' +
        '<text x="370" y="76" text-anchor="middle" font-size="13">De comunicação</text>' +
        '<rect class="caixa" x="290" y="150" width="160" height="34" rx="6"/>' +
        '<text x="370" y="172" text-anchor="middle" font-size="13">De processo</text>' +
        '<rect class="caixa" x="290" y="196" width="160" height="34" rx="6"/>' +
        '<text x="370" y="218" text-anchor="middle" font-size="13">De valor</text>' +
        '<rect class="caixa" x="290" y="242" width="160" height="34" rx="6"/>' +
        '<text x="370" y="264" text-anchor="middle" font-size="12">De transição de ' +
        "estado</text>" +
        '<path class="traco" d="M450 71 H460 V25 H470"/>' +
        '<path class="traco" d="M450 71 H460 V71 H470"/>' +
        '<path class="traco" d="M450 71 H460 V117 H470"/>' +
        '<rect class="caixa" x="470" y="8" width="160" height="34" rx="6"/>' +
        '<text x="550" y="30" text-anchor="middle" font-size="13">Omissão de envio</text>' +
        '<rect class="caixa" x="470" y="54" width="160" height="34" rx="6"/>' +
        '<text x="550" y="76" text-anchor="middle" font-size="13">Omissão de recepção</text>' +
        '<rect class="caixa" x="470" y="100" width="160" height="34" rx="6"/>' +
        '<text x="550" y="122" text-anchor="middle" font-size="13">Omissão de canal</text>' +
        "</svg>" +
        "<figcaption>A profundidade da árvore é o que interessa. Duas famílias se " +
        "subdividem, a de omissão e a de resposta, e é nelas que se concentra a maior " +
        "parte do vocabulário que você vai encontrar na literatura.</figcaption>" +
        "</figure>" +
        "<p>Na <strong>falha por omissão</strong>, algo simplesmente deixa de ser feito. " +
        "Quando quem omite é o processo, o caso típico é o <em>colapso</em>, em que ele " +
        "para e fica parado. Se os outros processos conseguem detectar esse colapso com " +
        "certeza, dá-se a ele o nome de <em>parada por falha</em> (fail-stop), que só é " +
        "possível em sistema síncrono, justamente porque ali o timeout distingue o " +
        "parado do lento. Quando quem omite é a comunicação, a mensagem se perde, e a " +
        "perda recebe nome conforme o lugar em que acontece, seja no processo emissor, " +
        "no processo receptor ou no meio pelo qual a mensagem trafega.</p>" +
        "<p>A parada por falha é o caso mais brando de uma escala, e conhecer a escala " +
        "inteira ajuda a entender por que alguns protocolos são tão mais complicados que " +
        "outros. Imagine um processo tentando descobrir o que houve com outro, e ordene " +
        "os cenários do mais fácil ao mais difícil.</p>" +
        '<div class="tabela-rolagem">' +
        '<table class="tabela-conteudo" id="tab-deteccao">' +
        "<tr><th>Cenário</th><th>O que quem observa consegue concluir</th></tr>" +
        "<tr><td>Parada detectável (fail-stop)</td>" +
        "<td>Conclui com certeza que o outro parou, porque os canais são confiáveis e " +
        "existe um atraso máximo conhecido para a resposta.</td></tr>" +
        "<tr><td>Parada com ruído (fail-noisy)</td>" +
        "<td>Chega à conclusão certa, mas só depois de um tempo indeterminado em que as " +
        "detecções dele não são confiáveis.</td></tr>" +
        "<tr><td>Parada silenciosa (fail-silent)</td>" +
        "<td>Não consegue distinguir a parada da omissão, mesmo com os canais " +
        "funcionando, e por isso não sabe se o outro morreu ou apenas deixou de " +
        "responder.</td></tr>" +
        "<tr><td>Falha inofensiva (fail-safe)</td>" +
        "<td>Enfrenta falhas arbitrárias que, apesar de arbitrárias, não causam " +
        "dano.</td></tr>" +
        "<tr><td>Falha arbitrária (fail-arbitrary)</td>" +
        "<td>Enfrenta o pior caso, em que o outro falha de qualquer maneira possível, " +
        "inclusive de forma imperceptível e prejudicial.</td></tr>" +
        "</table>" +
        "</div>" +
        "<p>A escala inteira diz uma coisa só, e vale enunciá-la. Quanto menos confiável " +
        "fica a conclusão que um processo consegue tirar sobre o outro, mais caro fica o " +
        "protocolo que precisa funcionar apesar disso. Os cinco rótulos estão em inglês " +
        "porque é nessa forma que você vai encontrá-los na literatura e nos artigos.</p>" +
        "<p>Há ainda um corte transversal que evita discussão inútil sobre intenção. Uma " +
        "falha <strong>por omissão</strong> acontece quando o componente deixa de fazer " +
        "algo que deveria ter feito, e uma falha <strong>por comissão</strong> acontece " +
        "quando ele faz algo que não deveria. Essa distinção não julga se houve má-fé, o " +
        "que é útil porque muitas vezes não dá para saber. Um computador com sistema " +
        "operacional mal construído que atrapalha o desempenho dos outros está agindo com " +
        "malícia? A pergunta não tem resposta e nem precisa ter.</p>" +
        "<p>A <strong>falha de resposta</strong> é o caso de comissão com nome próprio. O " +
        "componente não se cala, ele responde, e a resposta está errada. Essa é a família " +
        "mais incômoda das quatro, porque quem recebe a resposta não tem, olhando apenas " +
        "para ela, como saber que foi enganado.</p>" +
        "<p>Ela se subdivide em duas. Na <em>falha de valor</em>, o conteúdo da resposta " +
        "está errado, como no total de uma compra somado sem um dos itens. Na <em>falha " +
        "de transição de estado</em>, o componente desvia do fluxo de controle correto, " +
        "por exemplo ao receber um pedido que não sabe tratar e tomar uma ação qualquer " +
        "em vez de recusá-lo.</p>" +
        "<p>A <strong>falha arbitrária</strong>, também chamada de bizantina, é a pior " +
        "semântica possível, porque qualquer comportamento pode ocorrer, inclusive " +
        "responder errado ou omitir passos de forma seletiva. Em canais ela é rara, " +
        "porque as somas de verificação e os números de sequência a convertem em " +
        "omissão, que é um problema bem mais fácil de tratar.</p>" +
        "<p>A <strong>falha de temporização</strong> só faz sentido em sistemas " +
        "síncronos, onde existe limite prometido a ser descumprido. Ela ocorre quando o " +
        "relógio, o desempenho do processo ou o desempenho do canal saem desses " +
        "limites.</p>" +
        "<p>Conhecida a taxonomia, o projeto pode reagir a ela. Um serviço faz " +
        "<strong>mascaramento</strong> quando oculta as falhas dos componentes de que " +
        "depende, ou quando as converte em falhas mais aceitáveis.</p>" +
        "<p>Três mecanismos conhecidos mostram as duas condutas. As somas de verificação " +
        "convertem a falha arbitrária em falha por omissão. A retransmissão oculta as " +
        "perdas. A replicação mascara os colapsos.</p>" +
        "<p>O mascaramento pode chegar ao ponto de tornar a comunicação " +
        "<em>confiável</em>, e aí duas propriedades passam a valer. A " +
        "<strong>validade</strong> garante que toda mensagem enviada será uma hora " +
        "entregue. A <strong>integridade</strong> garante que ela chega idêntica à que " +
        "saiu e sem duplicação.</p>" +
        "<h3>Modelo de segurança</h3>" +
        "<p>Proteger um sistema distribuído significa proteger três coisas, os " +
        "processos, os canais que os ligam e os objetos que esses processos encapsulam. " +
        "Os <strong>direitos de acesso</strong> especificam quem pode fazer o quê sobre " +
        "esses objetos. Por trás de cada invocação existe um <strong>principal</strong>, " +
        "que é o usuário ou o processo em nome de quem ela é feita, e cuja identidade " +
        "precisa ser verificada.</p>" +
        "<p>Vale separar duas coisas que o vocabulário corrente costuma misturar. A " +
        "<strong>política de segurança</strong> declara com precisão o que cada entidade " +
        "do sistema pode e não pode fazer, e os direitos de acesso são exatamente isso. " +
        "O <strong>mecanismo de segurança</strong> é o que faz a política valer na " +
        "prática. Uma política sem mecanismo não passa de uma intenção declarada, e um " +
        "mecanismo sem política é uma ferramenta sem critério de uso.</p>" +
        "<p>Para raciocinar sobre proteção, o modelo postula um " +
        "<strong>invasor</strong>. Supõe-se que ele consegue enviar qualquer mensagem a " +
        "qualquer processo e que consegue ler, copiar, alterar ou reproduzir as " +
        "mensagens que trafegam na rede. Esse invasor ameaça os três alvos ao mesmo " +
        "tempo, como mostra o desenho.</p>" +
        '<figure class="figura" id="fig-invasor">' +
        '<svg viewBox="0 0 620 230" role="img" aria-labelledby="fig-invasor-titulo">' +
        '<title id="fig-invasor-titulo">O processo cliente e o processo servidor ligados ' +
        "pelo canal de comunicação, e o invasor abaixo deles, com setas apontando para " +
        "os três alvos.</title>" +
        '<rect class="caixa" x="40" y="16" width="180" height="44" rx="8"/>' +
        '<text x="130" y="44" text-anchor="middle" font-size="14">Processo cliente</text>' +
        '<path class="traco" d="M220 38 H240"/>' +
        '<rect class="caixa" x="240" y="16" width="140" height="44" rx="8"/>' +
        '<text x="310" y="44" text-anchor="middle" font-size="14">Canal</text>' +
        '<path class="traco" d="M380 38 H400"/>' +
        '<rect class="caixa" x="400" y="16" width="180" height="44" rx="8"/>' +
        '<text x="490" y="44" text-anchor="middle" font-size="14">Processo servidor</text>' +
        '<path class="traco" d="M310 170 V120"/>' +
        '<path class="traco" d="M130 120 H490"/>' +
        '<path class="traco" d="M130 120 V72"/>' +
        '<path class="traco" d="M310 120 V72"/>' +
        '<path class="traco" d="M490 120 V72"/>' +
        '<path class="seta" d="M130 60 L125 72 L135 72 Z"/>' +
        '<path class="seta" d="M310 60 L305 72 L315 72 Z"/>' +
        '<path class="seta" d="M490 60 L485 72 L495 72 Z"/>' +
        '<rect class="caixa-destaque" x="250" y="170" width="120" height="44" rx="8"/>' +
        '<text x="310" y="198" text-anchor="middle" font-size="14">Invasor</text>' +
        "</svg>" +
        "<figcaption>O invasor não escolhe um alvo. O modelo supõe que ele age sobre os " +
        "três, e é por isso que a defesa precisa cobrir cliente, canal e servidor.</figcaption>" +
        "</figure>" +
        "<p>Cada seta do desenho tem um nome. Contra o servidor, o invasor envia pedidos " +
        "com identidade falsa. Contra o cliente, ele se faz passar pelo servidor, no que " +
        "se chama de <em>spoofing</em>. Contra o canal, ele viola o sigilo do que passa " +
        "por ali, adultera as mensagens ou as reproduz mais tarde, no ataque conhecido " +
        "como <em>replay</em>.</p>" +
        "<p>Contra essas ameaças, são quatro os mecanismos que fazem a política " +
        "valer.</p>" +
        "<ul>" +
        "<li>A <strong>criptografia</strong> transforma os dados em algo que o invasor " +
        "não entende, o que entrega sigilo. Ela também permite detectar se alguém " +
        "alterou os dados no caminho.</li>" +
        "<li>A <strong>autenticação</strong> verifica quem está por trás de um pedido, e " +
        "é o que impede o invasor de se passar por outra pessoa ou por outro " +
        "serviço.</li>" +
        "<li>A <strong>autorização</strong> confere, já sabendo de quem se trata, se " +
        "aquela entidade tem o direito de fazer o que está pedindo. É ela que aplica a " +
        "política de acesso.</li>" +
        "<li>O <strong>monitoramento com auditoria</strong> registra os acessos para que " +
        "se descubra depois o que de fato aconteceu. Ele não impede o ataque, mas " +
        "permite responsabilizar quem agiu e corrigir o que estava frouxo.</li>" +
        "</ul>" +
        "<p>Na prática esses mecanismos aparecem combinados num pacote só. Um " +
        "<strong>canal seguro</strong> reúne privacidade, integridade e proteção " +
        "contra reprodução de mensagens, e é o que entregam as redes privadas virtuais " +
        "(VPN) e o par formado pelo Secure Sockets Layer (SSL) e pelo seu sucessor, o " +
        "Transport Layer Security (TLS).</p>" +
        "<p>Nem tudo cabe nessas defesas. A negação de serviço e o código móvel " +
        "malicioso ficam além do que um canal seguro resolve. Por isso o projeto seguro " +
        "começa por um <em>modelo de ameaças</em>, que declara contra quem se está " +
        "defendendo, e pondera o custo de cada defesa contra o risco que ela evita.</p>",
      slides: [
        {
          title: "O que custa comunicar",
          html:
            "<ul>" +
            "<li>A <strong>latência</strong> é o atraso entre o início do envio e o " +
            "início da recepção</li>" +
            "<li>A <strong>largura de banda</strong> é o volume por unidade de tempo, e " +
            "ela é compartilhada por todos no mesmo caminho</li>" +
            "<li>O <strong>jitter</strong> é a variação do atraso. Áudio e vídeo toleram " +
            "atraso constante, mas não toleram atraso irregular</li>" +
            "<li>Há um segundo custo, menos visível. Cada relógio <strong>desvia</strong> " +
            "a uma taxa diferente, e dois nós discordam sobre que horas são</li>" +
            "</ul>"
        },
        {
          title: "Síncrono e assíncrono",
          html:
            "<ul>" +
            "<li>No <strong>síncrono</strong>, a execução, o atraso das mensagens e o " +
            "desvio dos relógios têm limites <em>conhecidos</em></li>" +
            "<li>Por isso o timeout <strong>detecta</strong> a falha ali. O que passa do " +
            "limite conhecido não está apenas lento</li>" +
            "<li>No <strong>assíncrono</strong> não se supõe nada sobre tempo, e o timeout " +
            "gera só <strong>suspeita</strong>. A Internet é assim</li>" +
            "<li>Toda solução para o assíncrono vale para o síncrono, nunca o contrário. " +
            "Projetar para o assíncrono é a aposta segura</li>" +
            "<li>Sem relógio global ainda há ordem. O <strong>relógio lógico</strong> de " +
            "Lamport numera os eventos pelo que veio antes</li>" +
            "</ul>"
        },
        {
          title: "O caso realista fica no meio",
          html:
            "<ul>" +
            "<li>Síncrono puro <strong>só existe na teoria</strong>, porque garantir todo " +
            "limite o tempo todo é caro demais</li>" +
            "<li>Chamar tudo de assíncrono é <strong>pessimismo excessivo</strong>. Quase " +
            "sempre a mensagem chega num prazo razoável</li>" +
            "<li>O <strong>parcialmente síncrono</strong> comporta-se como síncrono quase " +
            "sempre, sem limite para quanto tempo pode se comportar de outro jeito</li>" +
            "<li>Consequência prática: o timeout serve para concluir que alguém caiu, e " +
            "essa conclusão <strong>vai estar errada de vez em quando</strong></li>" +
            "<li>O projeto precisa aguentar a detecção errada, e é aí que mora boa parte " +
            "da dificuldade de tolerar falhas</li>" +
            "</ul>"
        },
        {
          title: "Defeito, erro e falha",
          html:
            "<ul>" +
            "<li>O <strong>defeito</strong> é a causa, aquilo que está errado no " +
            "sistema</li>" +
            "<li>O <strong>erro</strong> é o estado interno incorreto a que o defeito " +
            "leva</li>" +
            "<li>A <strong>falha</strong> é o erro chegando à fronteira, com o serviço " +
            "deixando de ser prestado</li>" +
            "<li>O programador escreve código errado, o programa fica inconsistente e o " +
            "programa quebra. Defeito, erro, falha</li>" +
            "<li>Defeitos se classificam pela persistência. O " +
            "<strong>transitório</strong> some ao repetir, o " +
            "<strong>intermitente</strong> vai e volta e é o pior de diagnosticar, e o " +
            "<strong>permanente</strong> só sai trocando a peça</li>" +
            "</ul>"
        },
        {
          title: "Do mais fácil ao mais difícil de detectar",
          ref: "tab-deteccao"
        },
        {
          title: "As três famílias de falha",
          ref: "fig-falhas",
          html:
            "<ul>" +
            "<li>Só a família <strong>por omissão</strong> se subdivide, e por isso ela " +
            "concentra o vocabulário da literatura</li>" +
            "<li>A <strong>arbitrária</strong>, ou bizantina, é a pior. O processo pode " +
            "responder errado</li>" +
            "<li>A <strong>de temporização</strong> só existe no sistema síncrono</li>" +
            "</ul>"
        },
        {
          title: "Mascarar a falha",
          html:
            "<ul>" +
            "<li>Mascarar é ocultar a falha do componente de que se depende, ou " +
            "convertê-la em outra mais aceitável</li>" +
            "<li>A soma de verificação converte a falha arbitrária em omissão, que é " +
            "problema bem mais fácil</li>" +
            "<li>A retransmissão oculta as perdas e a replicação mascara os colapsos</li>" +
            "<li>Quando o mascaramento chega à comunicação confiável, valem a " +
            "<strong>validade</strong>, que promete a entrega, e a " +
            "<strong>integridade</strong>, que promete a mensagem idêntica e sem " +
            "duplicação</li>" +
            "</ul>"
        },
        {
          title: "O invasor diante dos três alvos",
          ref: "fig-invasor",
          html:
            "<ul>" +
            "<li>O invasor não escolhe alvo. A defesa cobre <strong>cliente, canal e " +
            "servidor</strong></li>" +
            "<li>A <strong>política</strong> diz o que cada um pode fazer</li>" +
            "<li>Os <strong>mecanismos</strong> a fazem valer, com criptografia, " +
            "autenticação, autorização e auditoria</li>" +
            "<li>Fora do alcance deles ficam a negação de serviço e o código " +
            "malicioso</li>" +
            "</ul>"
        }
      ]
    }
  ],

  quiz: [
    {
      question:
        "Uma equipe quer justificar a construção de uma infraestrutura de borda para uma aplicação de direção semiautônoma. Qual argumento sustenta melhor a decisão?",
      options: [
        "A banda disponível até a nuvem é insuficiente para o volume de dados dos sensores.",
        "A latência até a nuvem, na casa dos 100 ms, é incompatível com a reação em tempo real.",
        "A conectividade com a nuvem não é confiável o bastante para uso contínuo.",
        "A borda é intrinsecamente mais segura, por ficar dentro da rede da organização."
      ],
      answer: 1,
      explanation:
        "A latência é o argumento forte, porque aqui o limite é físico. Um carro " +
        "observa o ambiente e reage continuamente, e coordenar esse movimento por um " +
        "caminho que custa cerca de 100 ms não funciona. Os outros três argumentos " +
        "aparecem muito na discussão e valem menos do que parecem. A banda só cresceu " +
        "ao longo das décadas, a conectividade com a nuvem costuma ser boa, e a borda " +
        "não é segura por natureza, já que muralha em volta da organização não protege " +
        "contra ataque de dentro. O que de fato obriga a manter infraestrutura própria " +
        "por segurança é a regra regulatória que proíbe certos dados de saírem de casa."
    },
    {
      question:
        "Um blockchain com permissão limita a validação a algumas dezenas de nós pré-selecionados. Qual é a crítica arquitetural mais precisa a esse arranjo?",
      options: [
        "Ele não consegue tolerar nós que se comportem de forma maliciosa.",
        "Ele acaba formando um grupo distribuído centralizado, distante da descentralização prometida.",
        "Ele impede que os participantes verifiquem a validade das transações.",
        "Ele obriga cada participante a guardar a cadeia inteira, o que não escala."
      ],
      answer: 1,
      explanation:
        "Um grupo pequeno e pré-selecionado de validadores acaba funcionando como um " +
        "grupo distribuído centralizado e tolerante a falhas, o que está longe da " +
        "descentralização que costuma ser prometida. As outras alternativas descrevem " +
        "mal o arranjo. Ele tolera comportamento malicioso, justamente porque roda um " +
        "protocolo de consenso que suporta até um terço de nós defeituosos. O " +
        "livro-razão continua público, então qualquer participante verifica as " +
        "transações. E guardar a cadeia inteira é escolha deliberada, porque o bloco é " +
        "imutável e replicá-lo em massa torna a verificação simples."
    },
    {
      question:
        "O que caracteriza um sistema distribuído síncrono, segundo o modelo de interação?",
      options: [
        "Todos os relógios do sistema marcam exatamente a mesma hora.",
        "Tempo de execução das etapas, atraso das mensagens e desvio dos relógios têm limites conhecidos.",
        "Os processos executam em sincronia, uma etapa de cada vez, em todos os nós.",
        "As mensagens são entregues instantaneamente, sem latência."
      ],
      answer: 1,
      explanation:
        "Síncrono não significa relógios iguais nem latência zero. O que ele significa " +
        "é que existem limites conhecidos para a execução, para a entrega e para o " +
        "desvio de relógio, e é isso que permite usar timeouts para detectar falhas. A " +
        "Internet não oferece nenhum desses limites, e por isso é assíncrona."
    },
    {
      question:
        "Um servidor responde a invocações com valores errados e omite passos do processamento de forma imprevisível. No modelo de falhas, que família de falha é essa?",
      options: [
        "Por omissão de recepção.",
        "De temporização.",
        "Arbitrária (bizantina).",
        "De parada (fail-stop)."
      ],
      answer: 2,
      explanation:
        "Falha arbitrária ou bizantina é a pior semântica possível, porque qualquer " +
        "comportamento pode ocorrer. Repare que responder com valor errado, sozinho, " +
        "seria uma falha de resposta. O que leva este caso para a família arbitrária é a " +
        "imprevisibilidade somada à omissão seletiva de passos. Nenhuma das duas é " +
        "detectada apenas verificando se o processo responde, já que ele responde, mas " +
        "responde mal."
    },
    {
      question:
        "Somas de verificação (checksums) fazem mensagens corrompidas serem descartadas, restando apenas a perda da mensagem. De que isso é exemplo?",
      options: [
        "Mascaramento de falhas, com conversão para um tipo mais fácil de tratar.",
        "Transparência de replicação, que esconde do usuário a existência das cópias.",
        "Falha de temporização de canal, por atraso além do limite prometido.",
        "Comunicação síncrona confiável, com validade e integridade garantidas."
      ],
      answer: 0,
      explanation:
        "Um serviço mascara uma falha ocultando-a ou convertendo-a em um tipo mais " +
        "aceitável. O checksum converte a falha arbitrária (conteúdo corrompido) em " +
        "omissão (mensagem perdida), que a retransmissão sabe tratar."
    },
    {
      question:
        "Comparada à solução de duas camadas físicas, qual é a principal vantagem da arquitetura de três camadas físicas?",
      options: [
        "Menor latência, porque cada operação exige uma única troca de mensagens.",
        "Eliminar a necessidade de um servidor de banco de dados separado.",
        "Reduzir o tráfego total na rede entre o cliente e o servidor.",
        "Mapeamento um-para-um dos elementos lógicos em servidores, que melhora a manutenibilidade."
      ],
      answer: 3,
      explanation:
        "Na solução de três camadas, apresentação, lógica da aplicação e dados têm cada " +
        "um o seu servidor. O preço que se paga por isso é mais tráfego e mais latência, " +
        "e as duas primeiras alternativas descrevem justamente a solução de duas camadas."
    },
    {
      question:
        "Numa comunicação indireta com armazenamento intermediário, quem publica não sabe quem receberá o evento e o destinatário nem precisa estar no ar no momento do envio. Como se chamam essas duas propriedades?",
      options: [
        "Transparência de acesso e de localização.",
        "Desacoplamento espacial e desacoplamento temporal.",
        "Validade e integridade.",
        "Introspecção e intercessão."
      ],
      answer: 1,
      explanation:
        "As duas marcas da comunicação indireta são essas. No desacoplamento espacial, " +
        "quem envia não sabe para quem está enviando. No desacoplamento temporal, " +
        "remetente e destinatário não precisam coexistir. O espaço de tupla tem as duas " +
        "por construção, e o publicar-assinar só ganha a segunda quando o middleware " +
        "guarda o evento para entregar depois."
    },
    {
      question:
        "Por que a arquitetura peer-to-peer escala melhor que a cliente-servidor centralizada?",
      options: [
        "Porque os peers usam conexões de rede mais rápidas que os servidores.",
        "Porque elimina completamente a necessidade de replicação de dados.",
        "Porque os recursos de rede e computação disponíveis crescem com o número de usuários do serviço.",
        "Porque cada peer mantém uma cópia completa de todos os dados do sistema."
      ],
      answer: 2,
      explanation:
        "A ideia-chave do peer-to-peer é usar os recursos dos próprios usuários, " +
        "porque cada novo usuário traz capacidade em vez de só consumir a capacidade de " +
        "um servidor central. O custo é a complexidade de posicionar, localizar e " +
        "replicar os objetos, já que cada nó guarda só uma pequena parte, replicada em " +
        "alguns outros."
    },
    {
      question:
        "Uma equipe mantém a mesma divisão entre apresentação, lógica e dados, mas passa a rodar tudo numa máquina só, em vez de três. O que mudou?",
      options: [
        "A arquitetura de software, porque a divisão em camadas deixou de existir.",
        "A arquitetura de sistema, porque mudou a realização física e não a organização lógica.",
        "As duas, já que arquitetura de software e arquitetura de sistema são o mesmo conceito com nomes diferentes.",
        "Nenhuma das duas, porque a arquitetura é uma propriedade do código."
      ],
      answer: 1,
      explanation:
        "A organização lógica dos componentes de software continuou a mesma, com as " +
        "três camadas separadas, e é ela que se chama de arquitetura de software. O que " +
        "mudou foi a realização física, ou seja, a arquitetura de sistema. A mesma " +
        "arquitetura de software admite realizações físicas muito diferentes, e é por " +
        "isso que descrever apenas uma das duas deixa metade do projeto de fora."
    },
    {
      question:
        "O que caracteriza um microsserviço, segundo o critério adotado no tópico?",
      options: [
        "Ter menos que um número determinado de linhas de código.",
        "Ser escrito numa linguagem diferente da dos demais serviços do sistema.",
        "Rodar como um processo de rede separado e representar um serviço independente.",
        "Compartilhar o banco de dados com os outros serviços, para manter a consistência."
      ],
      answer: 2,
      explanation:
        "O que define um microsserviço é ele rodar como processo de rede separado e " +
        "representar de fato um serviço independente. Não existe acordo sobre o tamanho " +
        "que ele deve ter, apesar do prefixo, e insistir nessa pergunta é perder tempo. " +
        "O que importa é a modularização. O tamanho só volta a pesar por causa do " +
        "posicionamento, já que cada microsserviço é um processo que precisa ser " +
        "colocado em algum lugar."
    },
    {
      question:
        "Num sistema parcialmente síncrono, um processo conclui por timeout que outro caiu, mas o outro estava apenas lento. O que o modelo diz sobre essa situação?",
      options: [
        "É consequência inevitável do modelo, e o projeto precisa continuar correto apesar dela.",
        "É um defeito de implementação do detector, que deveria ter usado um timeout maior.",
        "É impossível, porque o sistema parcialmente síncrono garante limites de entrega.",
        "É irrelevante, porque a detecção errada se corrige sozinha na tentativa seguinte."
      ],
      answer: 0,
      explanation:
        "Um sistema parcialmente síncrono comporta-se como síncrono quase sempre, mas " +
        "não há limite para quanto tempo ele pode se comportar de forma assíncrona. " +
        "Aumentar o timeout adia o problema sem eliminá-lo, porque nenhum valor de " +
        "timeout é seguro contra um atraso sem limite. A conclusão tirada por timeout " +
        "estará ocasionalmente errada, e boa parte da dificuldade de tolerar falhas mora " +
        "exatamente em aguentar essa detecção errada."
    },
    {
      question:
        "Um programador troca o sinal de uma operação, o saldo da conta fica negativo na memória do programa e o extrato sai com o valor errado para o cliente. Nessa sequência, qual é o erro, no sentido preciso que o modelo dá à palavra?",
      options: [
        "A troca do sinal no código.",
        "O extrato com o valor errado entregue ao cliente.",
        "A sequência inteira, porque defeito, erro e falha são sinônimos no modelo.",
        "O saldo negativo no estado interno do programa."
      ],
      answer: 3,
      explanation:
        "O defeito é a causa, que aqui é a troca de sinal no código. O erro é o estado " +
        "interno incorreto a que o defeito leva, que é o saldo negativo em memória. A " +
        "falha é esse erro chegando à fronteira do sistema, que é o extrato errado " +
        "entregue ao cliente. A cadeia importa porque tolerar falhas é, no fundo, " +
        "controlar defeitos antes que eles cheguem à fronteira."
    }
  ],

  /* Roteiro de prática na AWS (página autônoma em app/labs/).
     Campo opcional: sem ele, a página do tópico não mostra o cartão. */
  lab: {
    href: "labs/pratica-02/index.html",
    title: "O mesmo código, sistemas diferentes",
    summary:
      "Suba três máquinas com programas idênticos e arrume-as de jeitos diferentes: " +
      "meça o que custa separar a aplicação dos dados, veja a replicação mascarar a " +
      "queda de um nó e depois descubra a falha que esse arranjo não mascara, a do nó " +
      "que responde na hora e responde errado.",
    duration: "100 min",
    environment: "AWS Academy Sandbox"
  },

  glossary: [
    {
      term: "Modelo físico",
      definition:
        "Representação dos elementos de hardware de um sistema distribuído (nós e " +
        "redes de interconexão) abstraindo as tecnologias específicas."
    },
    {
      term: "Modelo de arquitetura",
      definition:
        "Descrição do sistema em termos das tarefas computacionais e de comunicação " +
        "dos seus elementos. Ele responde a quatro perguntas, que são quais entidades " +
        "se comunicam, como elas se comunicam, que papéis exercem e onde estão " +
        "posicionadas."
    },
    {
      term: "Modelo fundamental",
      definition:
        "Modelo abstrato de um aspecto individual do sistema (interação, falhas ou " +
        "segurança), com suposições explícitas que permitem generalizar o que é " +
        "possível ou impossível."
    },
    {
      term: "Sistema distribuído síncrono",
      definition:
        "Sistema em que o tempo de execução de cada etapa, o atraso das mensagens e o " +
        "desvio dos relógios têm limites conhecidos, o que permite detectar falhas por " +
        "timeout."
    },
    {
      term: "Sistema parcialmente síncrono",
      definition:
        "Sistema que se comporta como síncrono na maior parte do tempo, sem que haja " +
        "limite para quanto tempo ele pode se comportar de forma assíncrona. É a " +
        "suposição realista, porque o síncrono puro só existe na teoria e o assíncrono " +
        "puro é pessimista demais. Na prática significa que o timeout serve para " +
        "concluir que um processo caiu, e que essa conclusão estará errada de vez em " +
        "quando."
    },
    {
      term: "Defeito, erro e falha",
      definition:
        "Os três elos de uma cadeia de causa. O defeito é aquilo que está errado no " +
        "sistema, o erro é o estado interno incorreto a que o defeito leva, e a falha é " +
        "esse erro chegando à fronteira, com o serviço deixando de ser prestado como " +
        "devia. Tolerar falhas é, no fundo, controlar defeitos."
    },
    {
      term: "Conector",
      definition:
        "Mecanismo que medeia a comunicação, a coordenação ou a cooperação entre " +
        "componentes, permitindo que controle e dados passem de um para outro. Uma " +
        "chamada de procedimento remoto, uma passagem de mensagens e um fluxo contínuo " +
        "de dados são todos conectores. Componentes e conectores combinados de forma " +
        "recorrente formam um estilo de arquitetura."
    },
    {
      term: "Microsserviço",
      definition:
        "Serviço que roda como um processo de rede separado e representa uma unidade " +
        "funcional de fato independente. Não existe acordo sobre o tamanho que ele deve " +
        "ter, apesar do prefixo, e o que importa é a modularização. Por ser processo de " +
        "rede, ele pode ser colocado em lugares diferentes, o que transforma o " +
        "posicionamento em decisão de projeto."
    },
    {
      term: "REST",
      definition:
        "Estilo de arquitetura que vê o sistema distribuído como uma coleção de " +
        "recursos, cada um gerenciado por um componente. Os recursos são identificados " +
        "por um esquema único de nomes, todos os serviços oferecem a mesma interface " +
        "com no máximo quatro operações, as mensagens se descrevem por completo e a " +
        "execução é sem estado, ou seja, o componente esquece quem chamou assim que " +
        "termina."
    },
    {
      term: "Computação de borda",
      definition:
        "Colocação de serviços na periferia da rede, tipicamente na fronteira entre a " +
        "rede de uma organização e a Internet. O argumento decisivo a favor dela é a " +
        "latência, porque alcançar a nuvem pode custar cerca de 100 ms e há aplicações " +
        "interativas que não sobrevivem a esse atraso. O preço é a orquestração, que " +
        "decide o que fica local, onde instalar cada serviço e qual borda atende cada " +
        "pedido."
    },
    {
      term: "Sistema distribuído assíncrono",
      definition:
        "Sistema sem qualquer suposição sobre velocidades de execução, atrasos de " +
        "mensagens ou desvio de relógios. A Internet segue esse modelo."
    },
    {
      term: "Jitter",
      definition:
        "Variação no tempo de entrega de uma série de mensagens. É crítico para dados " +
        "multimídia, como fluxos de áudio e vídeo."
    },
    {
      term: "Falha arbitrária (bizantina)",
      definition:
        "É a pior semântica de falha que um componente pode ter. O processo ou o canal " +
        "pode exibir qualquer comportamento, inclusive responder com valores errados ou " +
        "omitir passos seletivamente."
    },
    {
      term: "Camada física (tier)",
      definition:
        "Unidade de organização que distribui a funcionalidade de uma aplicação, ou " +
        "seja, a apresentação, a lógica e os dados, por servidores distintos. É dessa " +
        "distribuição que nascem as arquiteturas de duas, de três ou de n camadas."
    },
    {
      term: "Comunicação indireta",
      definition:
        "Paradigma em que remetente e destinatário se comunicam por um intermediário, " +
        "com desacoplamento no espaço e no tempo. São exemplos o publicar-assinar, as " +
        "filas de mensagem, os espaços de tupla e a memória compartilhada distribuída."
    },
    {
      term: "Canal seguro",
      definition:
        "Canal de comunicação entre processos que garante a identidade dos principais, " +
        "a privacidade e integridade dos dados e proteção contra reprodução de " +
        "mensagens. O SSL com o TLS e as VPN são as realizações mais comuns."
    },
    {
      term: "Empacotador (wrapper)",
      definition:
        "Componente que oferece uma interface aceitável para quem chama e traduz cada " +
        "função dela para as que o componente de destino de fato tem. Também chamado de " +
        "adaptador, resolve o problema da interface incompatível ao montar um sistema a " +
        "partir de peças que já existem."
    },
    {
      term: "Corretor (broker)",
      definition:
        "Componente logicamente centralizado por onde passam todos os acessos entre " +
        "aplicações. Ele conhece as aplicações relevantes, procura as adequadas e " +
        "devolve o resultado a quem pediu, o que derruba o número de empacotadores " +
        "necessários de N × (N - 1) para 2N."
    },
    {
      term: "Interceptador",
      definition:
        "Construção de software que quebra o fluxo normal de controle e deixa executar " +
        "ali um código escrito para uma aplicação específica. É o meio principal de " +
        "adaptar o middleware sem reescrevê-lo, e aparece em dois níveis na invocação " +
        "remota, o de requisição e o de mensagem."
    },
    {
      term: "Middleware modificável",
      definition:
        "Middleware que pode ser alterado de propósito enquanto executa, e não apenas " +
        "reagir sozinho ao ambiente. Depende de carregar e descarregar componentes em " +
        "execução e de cada componente declarar as interfaces que oferece e também as " +
        "que exige."
    },
    {
      term: "Ligação tardia (late binding)",
      definition:
        "Técnica que adia para o tempo de execução a escolha de qual implementação de " +
        "um componente será usada. É o que permite configurar dinamicamente um " +
        "middleware montado a partir de componentes, em vez de fixar a composição em " +
        "tempo de projeto."
    }
  ],

  references: [
    "VAN STEEN, M.; TANENBAUM, A. S. Distributed Systems. 4. ed. (versão DS 4.03). " +
    "distributed-systems.net. Cap. 2. Architectures (fonte principal deste tópico: " +
    "estilos de arquitetura, orientação a serviços, microsserviços, REST, " +
    "publicar-assinar, middleware com empacotadores, corretor, interceptadores e " +
    "modificabilidade, multicamadas, par a par, nuvem, borda e blockchain).",
    "VAN STEEN, M.; TANENBAUM, A. S. Op. cit. Cap. 8. Fault tolerance, seção 8.1 " +
    "(defeito, erro e falha; a taxonomia de falhas e a escala de detecção) e seção " +
    "8.2.3 (sistema parcialmente síncrono).",
    "COULOURIS, G.; DOLLIMORE, J.; KINDBERG, T.; BLAIR, G. Sistemas Distribuídos: " +
    "Conceitos e Projeto. 5. ed. Porto Alegre: Bookman, 2013. Cap. 2. Modelos de " +
    "Sistema (pp. 37-79). Organiza a progressão do tópico e é a fonte dos modelos " +
    "físicos, dos elementos de arquitetura, do modelo de interação e dos alvos e " +
    "ameaças do modelo de segurança.",
    "VAN STEEN, M.; TANENBAUM, A. S. Op. cit. Cap. 9. Security, seção 9.1. Fonte da " +
    "separação entre política e mecanismo de segurança e dos quatro mecanismos que " +
    "fazem a política valer.",
    "VITILLO, R. Understanding Distributed Systems. 2. ed. Cap. 12. Functional " +
    "decomposition (leitura complementar sobre microsserviços)."
  ]
};
