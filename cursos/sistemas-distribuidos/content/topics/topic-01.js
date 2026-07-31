/* ============================================================
   topic-01.js — Caracterização de Sistemas Distribuídos
   ------------------------------------------------------------
   MODELO DE ARQUIVO DE TÓPICO. Use esta estrutura para os
   demais tópicos:
     - sections[]   → seções de conteúdo (título + HTML)
       · cada seção pode ter slides[] ({ title, html } enxutos,
         ~5 bullets curtos) para o modo apresentação; sem eles,
         a seção inteira vira um único slide (gera scroll)
     - quiz[]       → questões de múltipla escolha
     - glossary[]   → termos-chave do tópico
     - references[] → bibliografia específica
   Conteúdo baseado em: COULOURIS et al., cap. 1 (pp. 1–26) e
   VAN STEEN; TANENBAUM, 4. ed., cap. 1 (seções 1.2–1.4).
   ============================================================ */

window.SD = window.SD || {};
SD.content = SD.content || {};

SD.content["01"] = {

  sections: [
    {
      title: "Conceitos introdutórios",
      html:
        "<p>Redes de computadores estão por toda parte: a Internet, redes corporativas, " +
        "redes domésticas, redes veiculares e as redes de telefonia móvel. Definimos um " +
        "<strong>sistema distribuído</strong> como aquele no qual os componentes de hardware " +
        "ou software, localizados em computadores interligados em rede, comunicam-se e " +
        "coordenam suas ações <em>apenas enviando mensagens</em> entre si. Os computadores " +
        "podem estar na mesma sala ou em continentes diferentes: a definição abrange os " +
        "dois extremos.</p>" +
        '<div class="callout">' +
        '<p class="callout-title">💡 Ideia central</p>' +
        "<p>A única forma de comunicação é a troca de mensagens pela rede. As três " +
        "consequências que caracterizam esses sistemas, e boa parte dos seus desafios, " +
        "decorrem dessa restrição.</p>" +
        "</div>" +
        "<p>Dessa definição seguem três consequências importantes:</p>" +
        "<ul>" +
        "<li><strong>Concorrência de componentes:</strong> a execução simultânea de " +
        "programas é a norma; cada usuário trabalha em sua máquina enquanto compartilha " +
        "recursos com os demais, e a coordenação desses programas concorrentes é um tema " +
        "recorrente da disciplina.</li>" +
        "<li><strong>Inexistência de relógio global:</strong> há limites para a precisão " +
        "com que computadores sincronizam seus relógios pela rede: não existe uma noção " +
        "global única do tempo correto.</li>" +
        "<li><strong>Falhas independentes:</strong> cada componente pode falhar deixando " +
        "os outros em funcionamento, e uma falha de rede não é imediatamente distinguível " +
        "de uma rede apenas lenta. As falhas em um sistema distribuído são " +
        "<em>parciais</em>.</li>" +
        "</ul>" +
        "<p>A principal motivação para construir sistemas distribuídos é o desejo de " +
        "<strong>compartilhar recursos</strong>: de componentes de hardware (discos, " +
        "impressoras) a entidades definidas por software (arquivos, bancos de dados, " +
        "fluxos de vídeo). Três exemplos reais dão a dimensão do que isso significa " +
        "hoje:</p>" +
        "<ul>" +
        "<li><strong>Pesquisa na Web:</strong> o Google mantém uma das maiores " +
        "infraestruturas distribuídas já construídas: data centers pelo mundo, um " +
        "sistema de arquivos distribuído próprio, armazenamento estruturado de grande " +
        "escala, serviços de coordenação e um modelo de programação para processamento " +
        "massivamente paralelo.</li>" +
        "<li><strong>Jogos online massivos (MMOGs):</strong> milhares de jogadores " +
        "simultâneos interagem com um mundo virtual persistente que exige respostas " +
        "rápidas e uma visão coerente do estado compartilhado. Há soluções " +
        "cliente-servidor sobre clusters, arquiteturas particionadas em vários " +
        "servidores e propostas peer-to-peer.</li>" +
        "<li><strong>Negócios financeiros:</strong> sistemas baseados em eventos " +
        "distribuem, em tempo real e de forma confiável, itens de interesse (cotações, " +
        "indicadores) para clientes interessados, com processamento de eventos complexos " +
        "(CEP) para detectar padrões e disparar decisões automáticas.</li>" +
        "</ul>" +
        "<p>Quatro tendências impulsionam os sistemas distribuídos modernos: a " +
        "interligação em rede <strong>pervasiva</strong> (conectividade a qualquer hora, " +
        "em qualquer lugar), a <strong>computação móvel e ubíqua</strong>, a demanda " +
        "crescente por <strong>multimídia distribuída</strong> (áudio e vídeo com " +
        "requisitos de tempo) e a visão da <strong>computação como serviço público</strong>" +
        ", que hoje chamamos de computação em nuvem.</p>",
      slides: [
        {
          title: "O que é um sistema distribuído?",
          html:
            "<p>Componentes de hardware ou software, em computadores interligados em " +
            "rede, que se comunicam e coordenam suas ações <strong>apenas trocando " +
            "mensagens</strong>.</p>" +
            "<ul>" +
            "<li>Na mesma sala ou em continentes diferentes</li>" +
            "<li>Motivação central: <strong>compartilhar recursos</strong></li>" +
            "<li>As três consequências (e boa parte dos desafios) decorrem da restrição " +
            "às mensagens</li>" +
            "</ul>"
        },
        {
          title: "Três consequências da definição",
          html:
            "<ul>" +
            "<li><strong>Concorrência</strong>: execução simultânea é a norma</li>" +
            "<li><strong>Sem relógio global</strong>: não há noção única do tempo correto</li>" +
            "<li><strong>Falhas independentes</strong>: partes falham enquanto o resto continua</li>" +
            "</ul>"
        },
        {
          title: "Exemplos reais",
          html:
            "<ul>" +
            "<li><strong>Pesquisa na Web</strong>: data centers no mundo todo, sistema de " +
            "arquivos distribuído, processamento massivamente paralelo</li>" +
            "<li><strong>Jogos online massivos</strong>: mundo virtual coerente para " +
            "dezenas de milhares de jogadores simultâneos</li>" +
            "<li><strong>Negócios financeiros</strong>: eventos em tempo real e detecção " +
            "de padrões (CEP)</li>" +
            "</ul>"
        },
        {
          title: "Quatro tendências",
          html:
            "<ul>" +
            "<li>Interligação em rede <strong>pervasiva</strong>: conectar a qualquer hora, em qualquer lugar</li>" +
            "<li>Computação <strong>móvel e ubíqua</strong></li>" +
            "<li><strong>Multimídia distribuída</strong>: áudio e vídeo com requisitos de tempo</li>" +
            "<li>Computação como <strong>serviço público</strong> → a nuvem</li>" +
            "</ul>"
        }
      ]
    },
    {
      title: "Tipos de sistemas distribuídos",
      html:
        "<p>Van Steen e Tanenbaum propõem classificar os sistemas distribuídos pela " +
        "finalidade para a qual são desenvolvidos, em três grandes classes, cujas " +
        "fronteiras, na prática, se sobrepõem:</p>" +
        "<h3>Computação distribuída de alto desempenho</h3>" +
        "<p>Sistemas voltados a tarefas de computação intensiva. Em " +
        "<strong>computação em cluster</strong>, um conjunto de nós semelhantes, " +
        "interligados por uma rede de alta velocidade e geralmente executando o mesmo " +
        "sistema operacional, forma um único recurso computacional para programação " +
        "paralela. Já a <strong>computação em grade</strong> (<em>grid</em>) é construída " +
        "como uma federação de sistemas que podem pertencer a domínios administrativos " +
        "diferentes e variar muito em hardware, software e rede. A computação em nuvem " +
        "estende essa linha ao alugar recursos sob demanda, tipicamente implementados " +
        "sobre grandes clusters.</p>" +
        "<h3>Sistemas de informação distribuídos</h3>" +
        "<p>Nasceram da necessidade das organizações de integrar aplicações em rede que " +
        "não interoperavam. Um mecanismo central é a <strong>transação " +
        "distribuída</strong>, que agrupa operações (possivelmente em vários servidores) " +
        "de modo que <em>todas ou nenhuma</em> sejam executadas, obedecendo às " +
        "propriedades <strong>ACID</strong>: atomicidade, consistência, isolamento e " +
        "durabilidade. Com componentes de aplicação cada vez mais independentes, surgiu " +
        "também a integração direta entre aplicações (EAI, <em>Enterprise Application " +
        "Integration</em>).</p>" +
        "<h3>Sistemas pervasivos</h3>" +
        "<p>Sistemas feitos para se misturar naturalmente ao ambiente: a base da " +
        "<em>Internet das Coisas</em>. Seus dispositivos costumam ser pequenos, movidos a " +
        "bateria, móveis e conectados sem fio, e a separação entre usuário e sistema é " +
        "tênue: sensores captam o comportamento do usuário e atuadores respondem a ele. " +
        "Distinguem-se três subtipos com grande sobreposição: <strong>sistemas de " +
        "computação ubíqua</strong> (presentes e ativos continuamente, cientes de " +
        "contexto), <strong>sistemas móveis</strong> e <strong>redes de " +
        "sensores</strong>.</p>" +
        '<div class="callout">' +
        '<p class="callout-title">💡 Computação como serviço público</p>' +
        "<p>Na nuvem, armazenamento, processamento e aplicações são alugados como água " +
        "ou eletricidade (pagos pelo uso, fornecidos por data centers e viabilizados " +
        "por virtualização) em vez de pertencerem ao usuário final.</p>" +
        "</div>",
      slides: [
        {
          title: "Três tipos de sistemas distribuídos",
          html:
            "<ul>" +
            "<li><strong>Computação de alto desempenho</strong>: cluster, grade, nuvem</li>" +
            "<li><strong>Sistemas de informação distribuídos</strong>: integração corporativa, transações</li>" +
            "<li><strong>Sistemas pervasivos</strong>: a Internet das Coisas</li>" +
            "</ul>" +
            "<p><em>As fronteiras não são estritas: combinações são comuns.</em></p>"
        },
        {
          title: "Alto desempenho: cluster × grade × nuvem",
          html:
            "<ul>" +
            "<li><strong>Cluster</strong>: nós semelhantes, mesma organização, rede de " +
            "alta velocidade, mesmo sistema operacional</li>" +
            "<li><strong>Grade</strong>: federação entre domínios administrativos " +
            "diferentes; hardware e software heterogêneos</li>" +
            "<li><strong>Nuvem</strong>: recursos alugados sob demanda, como água ou " +
            "eletricidade</li>" +
            "</ul>"
        },
        {
          title: "Informação distribuída e sistemas pervasivos",
          html:
            "<ul>" +
            "<li><strong>Transação distribuída</strong>: todas as operações ou nenhuma " +
            "(propriedades <strong>ACID</strong>)</li>" +
            "<li><strong>EAI</strong>: aplicações conversando diretamente entre si</li>" +
            "<li><strong>Pervasivos</strong>: sensores e atuadores misturados ao ambiente</li>" +
            "<li>Subtipos: <strong>ubíquos</strong>, <strong>móveis</strong>, " +
            "<strong>redes de sensores</strong></li>" +
            "</ul>"
        }
      ]
    },
    {
      title: "Objetivos da tecnologia",
      html:
        "<p>Se distribuir um sistema é tão difícil, por que fazê-lo? Os objetivos de " +
        "projeto clássicos são quatro: compartilhamento de recursos, transparência, " +
        "abertura e escalabilidade.</p>" +
        "<h3>Compartilhamento de recursos</h3>" +
        "<p>Um <strong>serviço</strong> é a parte do sistema que gerencia um conjunto de " +
        "recursos relacionados e expõe sua funcionalidade por meio de um conjunto " +
        "bem definido de operações (ler, escrever, imprimir…). Um " +
        "<strong>servidor</strong> é um processo que aceita pedidos e responde; os " +
        "processos que pedem são os <strong>clientes</strong>, e a interação completa " +
        "pedido-resposta é uma <em>invocação remota</em>. O mesmo processo pode ser " +
        "cliente e servidor: os termos designam papéis em um pedido, não máquinas.</p>" +
        "<h3>Transparência</h3>" +
        "<p><strong>Transparência</strong> é ocultar do usuário e do programador a " +
        "separação dos componentes, de modo que o sistema seja percebido como um todo. " +
        "O modelo de referência ANSA/RM-ODP identifica oito formas:</p>" +
        "<ul>" +
        "<li><strong>Acesso:</strong> recursos locais e remotos são acessados com " +
        "operações idênticas.</li>" +
        "<li><strong>Localização:</strong> o recurso é acessado sem que se conheça sua " +
        "localização física ou de rede.</li>" +
        "<li><strong>Concorrência:</strong> vários processos usam recursos " +
        "compartilhados sem interferência mútua.</li>" +
        "<li><strong>Replicação:</strong> várias instâncias do recurso aumentam " +
        "confiabilidade e desempenho sem que usuários saibam das réplicas.</li>" +
        "<li><strong>Falhas:</strong> usuários e aplicações concluem suas tarefas apesar " +
        "de falhas de componentes.</li>" +
        "<li><strong>Mobilidade:</strong> recursos e clientes se movem sem afetar a " +
        "operação.</li>" +
        "<li><strong>Desempenho:</strong> o sistema pode ser reconfigurado conforme a " +
        "carga varia.</li>" +
        "<li><strong>Escalabilidade:</strong> sistema e aplicações se expandem sem mudar " +
        "sua estrutura ou seus algoritmos.</li>" +
        "</ul>" +
        "<p>As duas mais importantes são as de <strong>acesso</strong> e " +
        "<strong>localização</strong>, chamadas em conjunto de <em>transparência de " +
        "rede</em>. O e-mail é um bom exemplo: enviar para " +
        "<code>fulano@exemplo.com</code> não exige saber onde a pessoa está nem muda o " +
        "procedimento conforme a localização dela.</p>" +
        "<h3>Abertura</h3>" +
        "<p>Um sistema é <strong>aberto</strong> quando pode ser estendido e " +
        "reimplementado de várias maneiras, o que se obtém <em>publicando</em> as " +
        "interfaces principais dos componentes. Foi assim com a Internet: as " +
        "especificações dos protocolos, publicadas como RFCs, permitiram que qualquer um " +
        "construísse sistemas e aplicações compatíveis, sem dependência de um fornecedor " +
        "único.</p>" +
        "<h3>Escalabilidade</h3>" +
        "<p>Um sistema é <strong>escalável</strong> se permanece eficiente quando há um " +
        "aumento significativo no número de recursos e de usuários: dos poucos " +
        "computadores de uma intranet aos bilhões de dispositivos da Internet.</p>" +
        '<div class="callout">' +
        '<p class="callout-title">⚠️ Transparência tem custo</p>' +
        "<p>Ocultar a distribuição é desejável, mas nunca é de graça nem completo: " +
        "latência, falhas parciais e mobilidade acabam transparecendo. Bons projetos " +
        "decidem <em>o quanto</em> ocultar: não assumem que a rede desaparece.</p>" +
        "</div>",
      slides: [
        {
          title: "Por que distribuir? Objetivos de projeto",
          html:
            "<ul>" +
            "<li><strong>Compartilhamento de recursos</strong>: serviços, servidores e clientes</li>" +
            "<li><strong>Transparência</strong>: o sistema percebido como um todo único</li>" +
            "<li><strong>Abertura</strong>: interfaces publicadas, sem fornecedor único</li>" +
            "<li><strong>Escalabilidade</strong>: eficiente mesmo com crescimento significativo</li>" +
            "</ul>"
        },
        {
          title: "As oito formas de transparência",
          html:
            "<ul>" +
            "<li><strong>Acesso</strong> e <strong>localização</strong>: juntas, a " +
            "<em>transparência de rede</em></li>" +
            "<li><strong>Concorrência</strong> · <strong>Replicação</strong> · " +
            "<strong>Falhas</strong></li>" +
            "<li><strong>Mobilidade</strong> · <strong>Desempenho</strong> · " +
            "<strong>Escalabilidade</strong></li>" +
            "</ul>" +
            "<p>Exemplo: enviar e-mail para <code>fulano@exemplo.com</code> não exige " +
            "saber onde a pessoa está.</p>"
        },
        {
          title: "Transparência tem custo",
          html:
            "<ul>" +
            "<li>Ocultar a distribuição nunca é de graça nem completo</li>" +
            "<li>Latência, falhas parciais e mobilidade acabam transparecendo</li>" +
            "<li>Bons projetos decidem <strong>o quanto</strong> ocultar: a rede não desaparece</li>" +
            "</ul>"
        }
      ]
    },
    {
      title: "Desafios",
      html:
        "<p>Os projetistas de sistemas distribuídos enfrentam um conjunto recorrente de " +
        "desafios, que estrutura boa parte do restante do curso:</p>" +
        "<ul>" +
        "<li><strong>Heterogeneidade:</strong> redes, hardware, sistemas operacionais, " +
        "linguagens e implementações de diferentes desenvolvedores precisam conviver. O " +
        "<strong>middleware</strong> (camada de software que mascara essas diferenças e " +
        "oferece um modelo de programação uniforme) e as máquinas virtuais (para código " +
        "móvel) são as respostas clássicas.</li>" +
        "<li><strong>Sistemas abertos:</strong> publicar interfaces é só o ponto de " +
        "partida; o desafio real é dominar a complexidade de sistemas com muitos " +
        "componentes escritos por muitas equipes.</li>" +
        "<li><strong>Segurança:</strong> tem três componentes: confidencialidade, " +
        "integridade e disponibilidade. Criptografia resolve sigilo e autenticação, mas " +
        "ataques de negação de serviço e a segurança de código móvel permanecem " +
        "problemas sem solução geral.</li>" +
        "<li><strong>Escalabilidade:</strong> exige controlar o custo dos recursos " +
        "físicos (idealmente proporcional ao número de usuários), controlar a perda de " +
        "desempenho ao crescer (estruturas hierárquicas escalam melhor que lineares), " +
        "impedir que recursos de software se esgotem (o endereço IP de 32 bits é o " +
        "exemplo canônico) e evitar gargalos centralizados: o DNS escala porque " +
        "particiona a tabela de nomes entre servidores administrados localmente e porque " +
        "as respostas ficam em cache por toda a Internet. Cache e replicação são as " +
        "técnicas de apoio onipresentes.</li>" +
        "<li><strong>Tratamento de falhas:</strong> como as falhas são parciais, o " +
        "sistema precisa combinar <em>detecção</em> (somas de verificação), " +
        "<em>mascaramento</em> (retransmissão, gravação redundante), " +
        "<em>tolerância</em> (clientes que desistem e informam o usuário), " +
        "<em>recuperação</em> (retroceder estado permanente após colapso) e " +
        "<em>redundância</em> (rotas, réplicas de tabelas e de bancos de dados) para " +
        "manter alta disponibilidade.</li>" +
        "<li><strong>Concorrência:</strong> vários clientes podem acessar o mesmo " +
        "recurso ao mesmo tempo; sem sincronização, operações entrelaçadas corrompem " +
        "dados (dois lances simultâneos em um leilão podem terminar trocados). Todo " +
        "objeto que representa um recurso compartilhado deve operar corretamente em " +
        "ambiente concorrente.</li>" +
        "<li><strong>Qualidade de serviço (QoS):</strong> além de funcionar, o serviço " +
        "precisa atender confiabilidade, segurança e desempenho, inclusive garantias de " +
        "tempo para dados críticos, como fluxos de áudio e vídeo.</li>" +
        "</ul>" +
        '<div class="callout">' +
        '<p class="callout-title">🚫 As oito falácias da computação distribuída</p>' +
        "<p>Peter Deutsch catalogou as suposições falsas que projetistas iniciantes " +
        "costumam fazer: a rede é confiável; a rede é segura; a rede é homogênea; a " +
        "topologia não muda; a latência é zero; a largura de banda é infinita; o custo " +
        "de transporte é zero; há um único administrador. Boa parte das técnicas desta " +
        "disciplina existe porque cada uma dessas frases é falsa.</p>" +
        "</div>" +
        /* Área reservada para demonstração interativa futura.
           O atributo data-demo identifica qual módulo JS de demo
           deverá ser montado aqui quando for implementado. */
        '<div class="demo-area" data-demo="caracterizacao-falhas">' +
        '<span class="demo-placeholder-icon" aria-hidden="true">🧪</span>' +
        "<p><strong>Demonstração interativa (em breve)</strong></p>" +
        "<p>Espaço reservado para uma simulação sobre falhas parciais: nós que caem, " +
        "mensagens que se perdem e como o sistema (não) percebe a diferença.</p>" +
        "</div>",
      slides: [
        {
          title: "Sete desafios de projeto",
          html:
            "<ul>" +
            "<li><strong>Heterogeneidade</strong>: a resposta é o middleware</li>" +
            "<li><strong>Sistemas abertos</strong>: complexidade de muitos autores</li>" +
            "<li><strong>Segurança</strong>: confidencialidade, integridade, disponibilidade</li>" +
            "<li><strong>Escalabilidade</strong>: sem gargalos centralizados</li>" +
            "<li><strong>Tratamento de falhas</strong>: falhas são parciais</li>" +
            "<li><strong>Concorrência</strong>: sincronizar o acesso compartilhado</li>" +
            "<li><strong>Qualidade de serviço</strong>: garantias de tempo</li>" +
            "</ul>"
        },
        {
          title: "Escalabilidade na prática",
          html:
            "<ul>" +
            "<li>Custo dos recursos físicos proporcional ao nº de usuários</li>" +
            "<li>Descentralizar para evitar gargalos, por exemplo, o DNS particiona a tabela de " +
            "nomes entre servidores locais</li>" +
            "<li>Não esgotar recursos de software, por exemplo, endereços IPv4</li>" +
            "<li><strong>Cache</strong> e <strong>replicação</strong> em toda parte</li>" +
            "</ul>"
        },
        {
          title: "As oito falácias da computação distribuída",
          html:
            "<p>Suposições <strong>falsas</strong> de quem projeta pela primeira vez " +
            "(Peter Deutsch):</p>" +
            "<ul>" +
            "<li>A rede é confiável · é segura · é homogênea</li>" +
            "<li>A topologia não muda</li>" +
            "<li>A latência é zero · a largura de banda é infinita</li>" +
            "<li>O transporte custa zero</li>" +
            "<li>Há um único administrador</li>" +
            "</ul>"
        },
        {
          title: "Síntese do tópico",
          html:
            "<ul>" +
            "<li>Sistema distribuído = componentes que só se comunicam por <strong>mensagens</strong></li>" +
            "<li>Consequências: concorrência, sem relógio global, <strong>falhas parciais</strong></li>" +
            "<li>Objetivos: compartilhar recursos, transparência, abertura, escalabilidade</li>" +
            "<li>A rede <strong>não</strong> desaparece: projete contando com isso</li>" +
            "</ul>"
        }
      ]
    }
  ],

  quiz: [
    {
      question: "Segundo Coulouris et al., o que caracteriza um sistema distribuído?",
      options: [
        "Um sistema em que um servidor central coordena todos os demais computadores.",
        "Um sistema com múltiplos processadores que compartilham um relógio global preciso.",
        "Componentes em computadores interligados em rede que se comunicam e coordenam suas ações apenas por troca de mensagens.",
        "Qualquer conjunto de computadores que compartilha memória física comum."
      ],
      answer: 2,
      explanation:
        "A definição exige comunicação e coordenação exclusivamente por troca de " +
        "mensagens pela rede: não há memória compartilhada, relógio global nem " +
        "coordenador central obrigatório."
    },
    {
      question:
        "Qual das características abaixo NÃO é uma consequência direta da definição de sistema distribuído?",
      options: [
        "Concorrência de componentes.",
        "Inexistência de relógio global.",
        "Falhas independentes de componentes.",
        "Memória compartilhada global entre os componentes."
      ],
      answer: 3,
      explanation:
        "As três consequências clássicas são concorrência, inexistência de relógio " +
        "global e falhas independentes. Memória compartilhada global contradiz a " +
        "definição: a única comunicação é por mensagens."
    },
    {
      question:
        "Um aplicativo usa exatamente as mesmas operações para abrir arquivos locais e arquivos remotos. Qual forma de transparência está em ação?",
      options: [
        "Transparência de localização.",
        "Transparência de acesso.",
        "Transparência de mobilidade.",
        "Transparência de replicação."
      ],
      answer: 1,
      explanation:
        "Operações idênticas para recursos locais e remotos é a definição de " +
        "transparência de acesso. A de localização oculta ONDE o recurso está; juntas, " +
        "elas formam a transparência de rede."
    },
    {
      question:
        "O predecessor do DNS mantinha os nomes em um único arquivo central; o DNS particionou essa tabela entre servidores administrados localmente. Esse é um exemplo de qual estratégia de escalabilidade?",
      options: [
        "Impedir que recursos de software se esgotem.",
        "Descentralizar algoritmos para evitar gargalos de desempenho.",
        "Mascaramento de falhas por retransmissão.",
        "Controlar o custo dos recursos físicos."
      ],
      answer: 1,
      explanation:
        "O arquivo central era um gargalo de desempenho e de administração. " +
        "Particionar a tabela entre muitos servidores descentraliza o algoritmo: a " +
        "recomendação geral para sistemas escaláveis."
    },
    {
      question:
        "Na classificação de van Steen e Tanenbaum, o que distingue uma grade (grid) de um cluster?",
      options: [
        "A grade usa nós idênticos executando o mesmo sistema operacional.",
        "O cluster é uma federação de sistemas de várias organizações.",
        "A grade é uma federação de sistemas sob diferentes domínios administrativos, com hardware, software e redes possivelmente muito diferentes.",
        "O cluster só existe como serviço de computação em nuvem."
      ],
      answer: 2,
      explanation:
        "Cluster: nós semelhantes, mesma organização, rede de alta velocidade, mesmo " +
        "SO. Grade: federação entre domínios administrativos distintos e " +
        "heterogêneos. É exatamente o inverso das duas primeiras alternativas."
    },
    {
      question:
        "Qual das afirmações abaixo é uma das \"falácias da computação distribuída\" de Peter Deutsch?",
      options: [
        "\"A latência da rede é zero.\"",
        "\"As falhas em sistemas distribuídos são parciais.\"",
        "\"A rede pode particionar a qualquer momento.\"",
        "\"Mensagens podem se perder ou atrasar.\""
      ],
      answer: 0,
      explanation:
        "As falácias são suposições FALSAS que projetistas iniciantes tratam como " +
        "verdadeiras, como latência zero. As outras alternativas descrevem fatos " +
        "reais dos sistemas distribuídos, não falácias."
    }
  ],

  glossary: [
    {
      term: "Sistema distribuído",
      definition:
        "Sistema cujos componentes, localizados em computadores interligados em rede, " +
        "comunicam-se e coordenam suas ações exclusivamente por troca de mensagens."
    },
    {
      term: "Transparência",
      definition:
        "Ocultação da separação dos componentes, de modo que o sistema seja percebido " +
        "como um todo. Formas: acesso, localização, concorrência, replicação, falhas, " +
        "mobilidade, desempenho e escalabilidade."
    },
    {
      term: "Escalabilidade",
      definition:
        "Capacidade de o sistema permanecer eficiente quando há aumento significativo " +
        "no número de recursos e de usuários."
    },
    {
      term: "Middleware",
      definition:
        "Camada de software que fornece uma abstração de programação uniforme e " +
        "mascara a heterogeneidade de redes, hardware, sistemas operacionais e " +
        "linguagens subjacentes."
    },
    {
      term: "Sistema distribuído aberto",
      definition:
        "Sistema cujas interfaces principais são publicadas, permitindo estendê-lo e " +
        "reimplementá-lo, em hardware (novos computadores) e em software (novos " +
        "serviços), sem dependência de um único fornecedor."
    },
    {
      term: "Falha parcial",
      definition:
        "Situação típica dos sistemas distribuídos em que alguns componentes falham " +
        "enquanto outros continuam funcionando, o que torna o tratamento de falhas " +
        "particularmente difícil."
    },
    {
      term: "Modelo cliente-servidor",
      definition:
        "Estratégia em que clientes (ativos) enviam pedidos em mensagens e servidores " +
        "(passivos, de execução contínua) os atendem e respondem. Os termos designam " +
        "papéis em um pedido: o mesmo processo pode exercer os dois."
    },
    {
      term: "Computação ubíqua",
      definition:
        "Uso de muitos dispositivos computacionais pequenos e baratos entranhados no " +
        "ambiente físico dos usuários, com acesso a serviços disponível em qualquer " +
        "lugar e interação pouco intrusiva. Cuidado com a variação de vocabulário entre " +
        "as fontes: em van Steen e Tanenbaum, seguidos por este tópico, a computação " +
        "ubíqua é um subtipo de sistema pervasivo, ao lado dos sistemas móveis e das " +
        "redes de sensores; em Coulouris, ubíquo e pervasivo aparecem como sinônimos."
    },
    {
      term: "Qualidade de serviço (QoS)",
      definition:
        "Propriedades não funcionais percebidas por clientes e usuários: " +
        "confiabilidade, segurança e desempenho, incluindo garantias de tempo para " +
        "dados críticos como áudio e vídeo."
    }
  ],

  references: [
    "COULOURIS, G.; DOLLIMORE, J.; KINDBERG, T.; BLAIR, G. Sistemas Distribuídos: " +
    "Conceitos e Projeto. 5. ed. Porto Alegre: Bookman, 2013. Cap. 1. Caracterização " +
    "de Sistemas Distribuídos (pp. 1-26).",
    "VAN STEEN, M.; TANENBAUM, A. S. Distributed Systems. 4. ed. (versão DS 4.03). " +
    "distributed-systems.net. Cap. 1. Introduction (seções 1.2 a 1.4)."
  ]
};
