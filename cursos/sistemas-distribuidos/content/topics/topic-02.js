/* ============================================================
   topic-02.js — Modelos de Sistema
   ------------------------------------------------------------
   Estrutura documentada no modelo topic-01.js (sections[] com
   slides[] opcionais, quiz[], glossary[], references[]).
   Conteúdo baseado em: COULOURIS et al., cap. 2 (pp. 37–79) e
   VAN STEEN; TANENBAUM, 4. ed., cap. 2 (leitura complementar).
   ============================================================ */

window.SD = window.SD || {};
SD.content = SD.content || {};

SD.content["02"] = {

  sections: [
    {
      title: "Por que modelar? E os modelos físicos",
      html:
        "<p>Sistemas distribuídos de tipos muito diferentes compartilham propriedades " +
        "de base e enfrentam os mesmos problemas de projeto: cargas que variam aos " +
        "milhões de acessos, ambientes heterogêneos, relógios dessincronizados, falhas " +
        "e ataques. Para discutir tudo isso com rigor, usamos <strong>modelos " +
        "descritivos</strong>: descrições abstratas e simplificadas, mas consistentes, " +
        "de um aspecto relevante do projeto. São três os tipos:</p>" +
        "<ul>" +
        "<li><strong>Modelos físicos</strong>: a composição de hardware: computadores " +
        "e dispositivos e suas redes de interconexão.</li>" +
        "<li><strong>Modelos de arquitetura</strong>: o sistema em termos das tarefas " +
        "computacionais e de comunicação dos seus elementos.</li>" +
        "<li><strong>Modelos fundamentais</strong>: uma perspectiva abstrata sobre " +
        "aspectos individuais: interação, falhas e segurança.</li>" +
        "</ul>" +
        '<div class="callout">' +
        '<p class="callout-title">💡 Ideia central</p>' +
        "<p>Um modelo torna <em>explícitas</em> as suposições sobre o sistema e permite " +
        "fazer generalizações sobre o que é <em>possível ou impossível</em> dadas essas " +
        "suposições, inclusive com prova matemática. Se as suposições valem no seu " +
        "sistema, as conclusões também valem.</p>" +
        "</div>" +
        "<p>O <strong>modelo físico básico</strong> repete a definição do Tópico 1: um " +
        "conjunto extensível de nós de computador interconectados por uma rede para a " +
        "passagem de mensagens. Sobre essa base, distinguem-se três gerações:</p>" +
        "<ul>" +
        "<li><strong>Sistemas primitivos</strong> (fim dos anos 1970/início dos 1980): " +
        "10-100 nós em uma rede local, Internet limitada, configurações homogêneas: " +
        "impressoras e arquivos compartilhados, e-mail.</li>" +
        "<li><strong>Sistemas adaptados para a Internet</strong> (anos 1990): escala " +
        "global sobre a rede de redes, heterogeneidade significativa, ênfase em padrões " +
        "abertos e middleware (CORBA, serviços Web).</li>" +
        "<li><strong>Sistemas contemporâneos</strong>: nós que se movem (computação " +
        "móvel), nós embarcados no ambiente (computação ubíqua) e conjuntos de nós que " +
        "fornecem um serviço (nuvem, clusters): escala ultragrande, com centenas de " +
        "milhares de nós.</li>" +
        "</ul>" +
        "<p>No extremo dessa evolução estão os <strong>sistemas de sistemas</strong> " +
        "(ULS, <em>Ultra Large Scale</em>): subsistemas que são, eles próprios, " +
        "sistemas, como um sistema de previsão de enchentes que combina redes de " +
        "sensores, clusters de simulação, bases históricas e alertas por celular.</p>",
      slides: [
        {
          title: "Por que modelar?",
          html:
            "<ul>" +
            "<li>Sistemas muito diferentes, <strong>mesmos problemas de projeto</strong></li>" +
            "<li>Modelo = descrição abstrata + <strong>suposições explícitas</strong></li>" +
            "<li>Permite raciocinar sobre o que é <strong>possível ou impossível</strong></li>" +
            "<li>Três tipos: <strong>físicos</strong> · <strong>de arquitetura</strong> · " +
            "<strong>fundamentais</strong></li>" +
            "</ul>"
        },
        {
          title: "Modelos físicos: três gerações",
          html:
            "<ul>" +
            "<li><strong>Primitivos</strong>: 10-100 nós em rede local, homogêneos (anos 1970-80)</li>" +
            "<li><strong>Adaptados à Internet</strong>: escala global, heterogeneidade, " +
            "padrões abertos (anos 1990)</li>" +
            "<li><strong>Contemporâneos</strong>: móvel + ubíqua + nuvem; escala ultragrande</li>" +
            "<li><strong>Sistemas de sistemas</strong>: subsistemas que são sistemas completos</li>" +
            "</ul>"
        }
      ]
    },
    {
      title: "Modelos de arquitetura",
      html:
        "<p>A arquitetura de um sistema é sua estrutura em termos de componentes " +
        "especificados separadamente e suas inter-relações: o objetivo é que ela seja " +
        "confiável, gerenciável, adaptável e rentável. Para entender os elementos de " +
        "base, quatro perguntas:</p>" +
        "<ul>" +
        "<li><strong>Que entidades</strong> se comunicam?</li>" +
        "<li><strong>Como</strong> se comunicam (qual paradigma)?</li>" +
        "<li><strong>Que papéis</strong> elas têm na arquitetura?</li>" +
        "<li><strong>Onde</strong> são posicionadas na infraestrutura física?</li>" +
        "</ul>" +
        "<h3>Entidades em comunicação</h3>" +
        "<p>Do ponto de vista do sistema, quem se comunica são <strong>processos</strong> " +
        "(rigorosamente, threads; em redes de sensores, nós). Do ponto de vista do " +
        "problema, programamos com abstrações: <strong>objetos</strong> (acessados por " +
        "interfaces, com IDL), <strong>componentes</strong> (como objetos, mas com todas " +
        "as dependências explícitas: um contrato mais completo) e <strong>serviços " +
        "Web</strong> (encapsulamento acessado por interface, integrado à Web: URI, " +
        "trocas de mensagens XML, frequentemente atravessando organizações).</p>" +
        "<h3>Paradigmas de comunicação</h3>" +
        "<ul>" +
        "<li><strong>Comunicação entre processos</strong>: nível baixo: passagem de " +
        "mensagens, soquetes, multicast.</li>" +
        "<li><strong>Invocação remota</strong>: troca bilateral que chama uma operação " +
        "remota: protocolos <em>requisição-resposta</em> (como o HTTP), <strong>RPC</strong> " +
        "(procedimentos remotos como se fossem locais: transparência de acesso e " +
        "localização) e <strong>RMI</strong> (a versão para objetos distribuídos, com " +
        "identidade de objeto).</li>" +
        "<li><strong>Comunicação indireta</strong>: via um intermediário, com " +
        "<em>desacoplamento espacial</em> (remetente não sabe para quem envia) e " +
        "<em>temporal</em> (não precisam existir ao mesmo tempo): comunicação em grupo, " +
        "<strong>publicar-assinar</strong>, filas de mensagem, espaços de tupla e memória " +
        "compartilhada distribuída (DSM).</li>" +
        "</ul>" +
        "<h3>Papéis: cliente-servidor e peer-to-peer</h3>" +
        "<p>No modelo <strong>cliente-servidor</strong> (historicamente o mais " +
        "importante e ainda o mais empregado), clientes invocam servidores, e um " +
        "servidor pode ser cliente de outro: um servidor Web consulta o DNS; um " +
        "mecanismo de busca responde a navegadores <em>e</em> executa web crawlers que " +
        "são clientes de outros servidores. Já no <strong>peer-to-peer</strong>, todos " +
        "os processos executam o mesmo programa e oferecem as mesmas interfaces, sem " +
        "distinção cliente/servidor (Napster abriu o caminho; BitTorrent é o exemplo " +
        "moderno). A motivação: os recursos disponíveis <em>crescem com o número de " +
        "usuários</em>, atacando o limite de escalabilidade da centralização: ao custo " +
        "de uma complexidade bem maior (posicionar objetos, recuperá-los, manter " +
        "réplicas).</p>" +
        "<h3>Posicionamento</h3>" +
        "<p>Mapear serviços nas máquinas certas importa para desempenho, confiabilidade " +
        "e segurança. Estratégias recorrentes: <strong>vários servidores</strong> (dados " +
        "particionados, como na Web, ou replicados, como no NIS); <strong>cache</strong> " +
        "(cópias próximas do cliente: navegadores e servidores proxy); <strong>código " +
        "móvel</strong> (applets: o navegador baixa o código e o executa localmente, com " +
        "boa resposta interativa; depois de carregado, o applet pode receber atualizações " +
        "por iniciativa do servidor, o modelo <em>push</em>); e <strong>agentes " +
        "móveis</strong> (código + dados visitando máquinas: aplicabilidade limitada por " +
        "segurança).</p>" +
        /* A demo é montada aqui por views/topic.js; o conteúdo abaixo só aparece se o
           módulo da demonstração não carregar. */
        '<div class="demo-area" data-demo="modelos-arquitetura">' +
        '<span class="demo-placeholder-icon" aria-hidden="true">🧪</span>' +
        "<p><strong>A demonstração interativa não pôde ser carregada</strong></p>" +
        "<p>Recarregue a página para tentar de novo.</p>" +
        "</div>",
      slides: [
        {
          title: "Quatro perguntas de arquitetura",
          html:
            "<ul>" +
            "<li><strong>O quê</strong> se comunica? (entidades)</li>" +
            "<li><strong>Como</strong> se comunica? (paradigma)</li>" +
            "<li><strong>Com que papéis?</strong> (funções na arquitetura)</li>" +
            "<li><strong>Onde?</strong> (posicionamento na infraestrutura física)</li>" +
            "</ul>"
        },
        {
          title: "Entidades e paradigmas de comunicação",
          html:
            "<ul>" +
            "<li>Entidades: <strong>processos</strong>, e, para o programador, " +
            "<strong>objetos</strong>, <strong>componentes</strong>, <strong>serviços Web</strong></li>" +
            "<li><strong>Entre processos</strong>: mensagens, soquetes, multicast</li>" +
            "<li><strong>Invocação remota</strong>: requisição-resposta, RPC, RMI</li>" +
            "<li><strong>Indireta</strong>: grupo, publicar-assinar, filas, tuplas, DSM " +
            "(desacoplamento espacial e temporal)</li>" +
            "</ul>"
        },
        {
          title: "Cliente-servidor × peer-to-peer",
          html:
            "<ul>" +
            "<li><strong>Cliente-servidor</strong>: o mais usado; servidores também são " +
            "clientes (Web → DNS)</li>" +
            "<li>Centralizar limita a escala: capacidade e banda do servidor</li>" +
            "<li><strong>Peer-to-peer</strong>: todos com o mesmo papel; recursos " +
            "<strong>crescem com os usuários</strong></li>" +
            "<li>Custo do P2P: posicionar, localizar e replicar objetos: mais complexo</li>" +
            "</ul>"
        },
        {
          title: "Posicionamento: onde colocar cada coisa",
          html:
            "<ul>" +
            "<li><strong>Vários servidores</strong>: particionar (Web) ou replicar (NIS)</li>" +
            "<li><strong>Cache e proxy</strong>: cópias perto do cliente</li>" +
            "<li><strong>Código móvel</strong>: applets; atualizações depois, no modelo push</li>" +
            "<li><strong>Agentes móveis</strong>: código viajante, uso limitado</li>" +
            "</ul>"
        }
      ]
    },
    {
      title: "Padrões arquitetônicos e middleware",
      html:
        "<p>Sobre os elementos básicos, os <strong>padrões arquitetônicos</strong> " +
        "oferecem estruturas compostas que já se mostraram boas soluções em " +
        "circunstâncias conhecidas.</p>" +
        "<h3>Camadas lógicas (layers)</h3>" +
        "<p>Um sistema complexo é particionado verticalmente: cada camada usa os " +
        "serviços da camada inferior sem conhecer sua implementação. Em sistemas " +
        "distribuídos, a pilha típica é: aplicações e serviços ↑ <strong>middleware</strong> " +
        "↑ sistema operacional ↑ hardware: sendo <strong>plataforma</strong> o par " +
        "SO + hardware (ex.: Intel x86/Linux) e <strong>middleware</strong> a camada que " +
        "mascara heterogeneidade e oferece abstrações de programação (invocação remota, " +
        "eventos, replicação…).</p>" +
        "<h3>Camadas físicas (tiers)</h3>" +
        "<p>Complementares às lógicas: distribuem a funcionalidade entre servidores. " +
        "Decompondo uma aplicação em <em>apresentação</em>, <em>lógica da aplicação</em> " +
        "e <em>dados</em>: na solução de <strong>duas camadas</strong>, tudo se divide " +
        "entre cliente e servidor: latência baixa (uma troca de mensagens), mas a " +
        "lógica fica partida; na de <strong>três camadas</strong>, cada elemento lógico " +
        "tem seu servidor (aplicação e banco de dados separados): melhor " +
        "manutenibilidade, ao custo de mais tráfego e latência. Generaliza para " +
        "<em>n</em> camadas: a Wikipedia atende até 60.000 pedidos de página por " +
        "segundo em arquitetura multicamadas. O <strong>AJAX</strong> é a cola " +
        "cliente-servidor da Web interativa: JavaScript no navegador pede dados " +
        "diretamente ao servidor e atualiza só parte da página (Google Maps é o exemplo " +
        "clássico).</p>" +
        "<h3>Thin client e outros padrões</h3>" +
        "<p>A tendência de tirar complexidade do equipamento do usuário leva ao " +
        "<strong>thin client</strong>: interface local, execução remota. " +
        "A Computação de Rede Virtual (VNC) transmite eventos de teclado/vídeo/mouse; " +
        "funciona em qualquer aparelho, mas sofre em atividades gráficas muito " +
        "interativas. Outros padrões recorrentes: <strong>proxy</strong> (representante " +
        "local do objeto remoto, com a mesma interface: base da transparência em " +
        "RPC/RMI), <strong>brokerage</strong> (provedor + solicitante + corretor de " +
        "serviços) e <strong>reflexão</strong> (introspecção e adaptação dinâmica do " +
        "próprio sistema).</p>" +
        "<h3>Middleware: categorias e limites</h3>" +
        "<p>As principais classes de middleware seguem os modelos arquitetônicos: " +
        "objetos distribuídos (RM-ODP, CORBA, Java RMI), componentes distribuídos " +
        "(Fractal, EJB e os <em>servidores de aplicação</em>, que suportam diretamente " +
        "as três camadas), publicar-assinar (JMS), filas de mensagem (WebSphere MQ), " +
        "serviços Web (Apache Axis) e peer-to-peer (Gnutella, Pastry).</p>" +
        '<div class="callout">' +
        '<p class="callout-title">⚠️ O princípio fim-a-fim</p>' +
        "<p>Algumas funções de comunicação só podem ser implementadas completa e " +
        "corretamente com o conhecimento da <em>aplicação</em> nos pontos extremos " +
        "(Saltzer, Reed e Clark, 1984). O middleware simplifica muito, mas alguns " +
        "aspectos de confiabilidade exigem suporte no nível da aplicação: um e-mail " +
        "gigante precisa de retomada própria além do TCP.</p>" +
        "</div>",
      slides: [
        {
          title: "Camadas lógicas: plataforma e middleware",
          html:
            "<ul>" +
            "<li>Aplicações e serviços ↑ <strong>middleware</strong> ↑ SO ↑ hardware</li>" +
            "<li><strong>Plataforma</strong> = SO + hardware (ex.: x86/Linux)</li>" +
            "<li><strong>Middleware</strong> = mascara heterogeneidade + abstrações de " +
            "programação (RMI, eventos, replicação…)</li>" +
            "</ul>"
        },
        {
          title: "Camadas físicas (tiers): 2 × 3",
          html:
            "<ul>" +
            "<li>Decomposição: <strong>apresentação · lógica · dados</strong></li>" +
            "<li><strong>2 camadas</strong>: menos latência, lógica partida entre " +
            "cliente e servidor</li>" +
            "<li><strong>3 camadas</strong>: um servidor por elemento lógico; " +
            "manutenibilidade, mais tráfego</li>" +
            "<li><strong>AJAX</strong>: atualiza só parte da página (Google Maps)</li>" +
            "</ul>"
        },
        {
          title: "Thin client e padrões recorrentes",
          html:
            "<ul>" +
            "<li><strong>Thin client</strong>: interface local, execução remota (VNC)</li>" +
            "<li><strong>Proxy</strong>: representante local do objeto remoto (RPC/RMI)</li>" +
            "<li><strong>Brokerage</strong>: provedor · solicitante · corretor</li>" +
            "<li><strong>Reflexão</strong>: o sistema inspeciona e adapta a si mesmo</li>" +
            "</ul>"
        },
        {
          title: "Middleware: categorias e o princípio fim-a-fim",
          html:
            "<ul>" +
            "<li>Objetos (CORBA, Java RMI) · componentes (EJB, servidores de aplicação)</li>" +
            "<li>Publicar-assinar (JMS) · filas (MQ) · serviços Web · P2P (Pastry)</li>" +
            "<li><strong>Fim-a-fim</strong>: parte da correção só existe na aplicação: " +
            "o middleware não resolve tudo</li>" +
            "</ul>"
        }
      ]
    },
    {
      title: "Modelos fundamentais: interação, falhas e segurança",
      html:
        "<p>Todos os modelos de arquitetura compartilham o essencial: processos que se " +
        "comunicam por mensagens. Os modelos fundamentais isolam cada aspecto para " +
        "permitir raciocínio preciso.</p>" +
        "<h3>Modelo de interação</h3>" +
        "<p>A comunicação tem custo, descrito por três características: " +
        "<strong>latência</strong> (atraso entre início do envio e início da recepção), " +
        "<strong>largura de banda</strong> (volume total transmissível por unidade de " +
        "tempo, compartilhado) e <strong>jitter</strong> (variação do atraso: crucial " +
        "para multimídia). Além disso, cada computador tem seu relógio, e relógios se " +
        "<em>desviam</em> (drift) a taxas diferentes. Disso nascem as duas variantes " +
        "do modelo:</p>" +
        "<ul>" +
        "<li><strong>Sistema distribuído síncrono</strong>: tempo de execução de cada " +
        "etapa, atraso de mensagens e desvio de relógio têm limites <em>conhecidos</em>. " +
        "Permite usar timeouts para <em>detectar</em> falhas, mas garantir os limites " +
        "exige reservar recursos.</li>" +
        "<li><strong>Sistema distribuído assíncrono</strong>: <em>nenhuma</em> " +
        "suposição sobre velocidades, atrasos ou desvios. A Internet se encaixa " +
        "perfeitamente nesse modelo. Toda solução válida para um sistema assíncrono " +
        "vale também para um síncrono.</li>" +
        "</ul>" +
        "<p>Mesmo sem relógio global, eventos podem ser ordenados <em>logicamente</em>: " +
        "uma mensagem é recebida depois de enviada, e uma resposta vem depois da leitura" +
        ": o <strong>relógio lógico</strong> de Lamport (1978) numera eventos por essa " +
        "ordem, resolvendo, por exemplo, e-mails que chegam fora de ordem na caixa de " +
        "entrada.</p>" +
        "<h3>Modelo de falhas</h3>" +
        "<p>Define como uma falha pode se manifestar (taxonomia de Hadzilacos e " +
        "Toueg):</p>" +
        "<ul>" +
        "<li><strong>Falhas por omissão</strong>: algo deixa de ser feito. De processo: " +
        "o <em>colapso</em> (para e fica parado); se outros podem detectar com certeza, " +
        "é <em>parada por falha</em> (fail-stop): só possível em sistema síncrono. De " +
        "comunicação: perda de mensagens, que pode ocorrer no processo emissor (omissão " +
        "de envio), no processo receptor (omissão de recepção) ou no meio de comunicação " +
        "(omissão de canal).</li>" +
        "<li><strong>Falhas arbitrárias (bizantinas)</strong>: a pior semântica: " +
        "qualquer comportamento, inclusive responder errado ou omitir passos " +
        "seletivamente. Em canais são raras (somas de verificação e números de " +
        "sequência as convertem em omissões).</li>" +
        "<li><strong>Falhas de temporização</strong>: só fazem sentido em sistemas " +
        "síncronos: relógio, desempenho de processo ou de canal fora dos limites " +
        "prometidos.</li>" +
        "</ul>" +
        "<p><strong>Mascaramento</strong>: um serviço pode ocultar falhas dos " +
        "componentes de que depende ou convertê-las em falhas mais aceitáveis: " +
        "checksums convertem falha arbitrária em omissão; retransmissão oculta perdas; " +
        "replicação mascara colapsos. <em>Comunicação confiável</em> = " +
        "<strong>validade</strong> (toda mensagem enviada é uma hora entregue) + " +
        "<strong>integridade</strong> (idêntica à enviada, sem duplicação).</p>" +
        "<h3>Modelo de segurança</h3>" +
        "<p>Segurança = proteger processos, canais e os objetos que eles encapsulam. " +
        "Direitos de acesso especificam quem pode fazer o quê, e cada invocação tem por " +
        "trás um <strong>principal</strong> (usuário ou processo) cuja identidade deve " +
        "ser verificada. O modelo postula um <strong>invasor</strong> capaz de enviar " +
        "qualquer mensagem a qualquer processo e de ler, copiar, alterar ou reproduzir " +
        "mensagens na rede: ameaçando servidores (pedidos com identidade falsa), " +
        "clientes (spoofing do servidor) e canais (violação, adulteração, replay). As " +
        "defesas: <strong>criptografia</strong> com segredos compartilhados, " +
        "<strong>autenticação</strong> de mensagens e <strong>canais seguros</strong> " +
        "(privacidade + integridade + proteção contra replay: VPNs e SSL/TLS). Ficam " +
        "além dos canais seguros a negação de serviço e o código móvel malicioso; o " +
        "projeto seguro começa por um <em>modelo de ameaças</em> e pondera custo × " +
        "risco.</p>",
      slides: [
        {
          title: "Modelo de interação",
          html:
            "<ul>" +
            "<li><strong>Latência</strong>: atraso até começar a receber</li>" +
            "<li><strong>Largura de banda</strong>: volume por tempo, compartilhada</li>" +
            "<li><strong>Jitter</strong>: variação do atraso (dói na multimídia)</li>" +
            "<li>Relógios se <strong>desviam</strong> a taxas diferentes: não há tempo global</li>" +
            "<li>Ordem sem relógio: <strong>relógio lógico</strong> de Lamport</li>" +
            "</ul>"
        },
        {
          title: "Síncrono × assíncrono",
          html:
            "<ul>" +
            "<li><strong>Síncrono</strong>: limites <em>conhecidos</em> para execução, " +
            "mensagens e desvio de relógio; timeout <strong>detecta</strong> falha</li>" +
            "<li><strong>Assíncrono</strong>: nenhuma suposição de tempo; timeout só " +
            "gera <strong>suspeita</strong></li>" +
            "<li>A <strong>Internet é assíncrona</strong></li>" +
            "<li>Solução para assíncrono vale para síncrono: nunca o contrário</li>" +
            "</ul>"
        },
        {
          title: "Modelo de falhas",
          html:
            "<ul>" +
            "<li><strong>Omissão</strong>: colapso de processo; perda de mensagem</li>" +
            "<li><strong>Arbitrárias (bizantinas)</strong>: qualquer comportamento, " +
            "até responder errado</li>" +
            "<li><strong>Temporização</strong>: só em sistemas síncronos</li>" +
            "<li><strong>Mascaramento</strong>: checksum, retransmissão, replicação</li>" +
            "<li>Comunicação confiável = <strong>validade + integridade</strong></li>" +
            "</ul>"
        },
        {
          title: "Modelo de segurança",
          html:
            "<ul>" +
            "<li>Proteger <strong>processos, canais e objetos</strong></li>" +
            "<li>Cada invocação tem um <strong>principal</strong> por trás</li>" +
            "<li>O <strong>invasor</strong>: lê, copia, altera, injeta e reproduz mensagens</li>" +
            "<li>Defesas: criptografia · autenticação · <strong>canais seguros</strong> " +
            "(VPN, SSL/TLS)</li>" +
            "<li>Fora do alcance deles: negação de serviço, código móvel</li>" +
            "</ul>"
        }
      ]
    }
  ],

  quiz: [
    {
      question:
        "O que caracteriza um sistema distribuído SÍNCRONO, segundo o modelo de interação?",
      options: [
        "Todos os relógios do sistema marcam exatamente a mesma hora.",
        "Tempo de execução das etapas, atraso das mensagens e desvio dos relógios têm limites conhecidos.",
        "Os processos executam em sincronia, uma etapa de cada vez, em todos os nós.",
        "As mensagens são entregues instantaneamente, sem latência."
      ],
      answer: 1,
      explanation:
        "Síncrono não significa relógios iguais nem latência zero: significa que " +
        "existem LIMITES conhecidos para execução, entrega e desvio de relógio, o que " +
        "permite, por exemplo, usar timeouts para detectar falhas. A Internet não " +
        "oferece nenhum desses limites (é assíncrona)."
    },
    {
      question:
        "Um servidor responde a invocações com valores errados e omite passos do processamento de forma imprevisível. No modelo de falhas, isso é uma falha:",
      options: [
        "Por omissão de recepção.",
        "De temporização.",
        "Arbitrária (bizantina).",
        "De parada (fail-stop)."
      ],
      answer: 2,
      explanation:
        "Falha arbitrária ou bizantina é a pior semântica possível: qualquer " +
        "comportamento pode ocorrer, inclusive responder errado. Não pode ser detectada " +
        "apenas verificando se o processo responde: ele responde, mas mal."
    },
    {
      question:
        "Somas de verificação (checksums) fazem mensagens corrompidas serem descartadas, restando apenas a perda da mensagem. Isso é um exemplo de:",
      options: [
        "Mascaramento de falhas: converter uma falha arbitrária em falha por omissão.",
        "Transparência de replicação.",
        "Falha de temporização de canal.",
        "Comunicação síncrona confiável."
      ],
      answer: 0,
      explanation:
        "Um serviço mascara uma falha ocultando-a ou convertendo-a em um tipo mais " +
        "aceitável. O checksum converte a falha arbitrária (conteúdo corrompido) em " +
        "omissão (mensagem perdida), que a retransmissão sabe tratar."
    },
    {
      question:
        "Comparada à solução de duas camadas físicas, a principal vantagem da arquitetura de TRÊS camadas físicas é:",
      options: [
        "Menor latência: cada operação exige uma única troca de mensagens.",
        "Eliminar a necessidade de um servidor de banco de dados.",
        "Reduzir o tráfego total na rede.",
        "Mapeamento um-para-um dos elementos lógicos em servidores: a lógica da aplicação fica em um só lugar, melhorando a manutenibilidade."
      ],
      answer: 3,
      explanation:
        "Na solução de três camadas, apresentação, lógica da aplicação e dados têm cada " +
        "um o seu servidor. O preço é justamente MAIS tráfego e latência (as duas " +
        "primeiras alternativas descrevem a solução de duas camadas)."
    },
    {
      question:
        "Em um sistema publicar-assinar, publicadores não sabem quem receberá os eventos, e assinantes não precisam estar ativos no momento da publicação. Essas propriedades chamam-se:",
      options: [
        "Transparência de acesso e de localização.",
        "Desacoplamento espacial e desacoplamento temporal.",
        "Validade e integridade.",
        "Introspecção e intercessão."
      ],
      answer: 1,
      explanation:
        "São as duas marcas da comunicação INDIRETA: desacoplamento espacial (não " +
        "sabe para quem envia) e temporal (remetente e destinatário não precisam " +
        "coexistir). Valem para publicar-assinar, filas de mensagem e espaços de tupla."
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
        "A ideia-chave do P2P é usar os recursos dos próprios usuários: cada novo " +
        "usuário TRAZ capacidade, em vez de só consumir a capacidade de um servidor " +
        "central. O custo é a complexidade de posicionar, localizar e replicar os " +
        "objetos (cada nó guarda só uma pequena parte, replicada em alguns outros)."
    }
  ],

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
        "dos seus elementos: que entidades se comunicam, como, com que papéis e onde " +
        "estão posicionadas."
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
        "A pior semântica de falha: o processo ou canal pode exibir qualquer " +
        "comportamento, inclusive responder com valores errados ou omitir passos " +
        "seletivamente."
    },
    {
      term: "Camada física (tier)",
      definition:
        "Unidade de organização que mapeia a funcionalidade de uma aplicação " +
        "(apresentação, lógica, dados) em servidores distintos: arquiteturas de duas, " +
        "três ou n camadas."
    },
    {
      term: "Comunicação indireta",
      definition:
        "Paradigma em que remetente e destinatário se comunicam por um intermediário, " +
        "com desacoplamento espacial e temporal: publicar-assinar, filas de mensagem, " +
        "espaços de tupla, DSM."
    },
    {
      term: "Canal seguro",
      definition:
        "Canal de comunicação entre processos que garante a identidade dos principais, " +
        "a privacidade e integridade dos dados e proteção contra reprodução de " +
        "mensagens (ex.: SSL/TLS, VPN)."
    }
  ],

  references: [
    "COULOURIS, G.; DOLLIMORE, J.; KINDBERG, T.; BLAIR, G. Sistemas Distribuídos: " +
    "Conceitos e Projeto. 5. ed. Porto Alegre: Bookman, 2013. Cap. 2. Modelos de " +
    "Sistema (pp. 37-79).",
    "VAN STEEN, M.; TANENBAUM, A. S. Distributed Systems. 4. ed. (versão DS 4.03). " +
    "distributed-systems.net. Cap. 2. Architectures (estilos arquitetônicos, " +
    "multicamadas, P2P, nuvem; leitura complementar)."
  ]
};
