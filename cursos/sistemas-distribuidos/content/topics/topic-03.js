/* ============================================================
   topic-03.js — Redes de Computadores e Interligação em Rede
   ------------------------------------------------------------
   Estrutura documentada no modelo topic-01.js (sections[] com
   slides[] opcionais, quiz[], glossary[], references[]).
   Conteúdo baseado em: COULOURIS et al., cap. 3 (pp. 81–143) e
   VAN STEEN; TANENBAUM, 4. ed., cap. 4, seção 4.1 (leitura
   complementar).
   ============================================================ */

window.SD = window.SD || {};
SD.content = SD.content || {};

SD.content["03"] = {

  sections: [
    {
      title: "As redes pelo olhar dos sistemas distribuídos",
      html:
        "<p>Todo sistema distribuído vive sobre um <strong>subsistema de " +
        "comunicação</strong>: o conjunto de hardware (cabos, fibras, rádio, " +
        "roteadores, switches, interfaces) e software (pilhas de protocolo, drivers) " +
        "que fornece a comunicação. Os computadores que usam a rede são " +
        "<strong>hosts</strong>; <strong>nó</strong> é qualquer computador ou " +
        "equipamento de comunicação ligado a ela. O desempenho, a confiabilidade, a " +
        "escalabilidade e a mobilidade da rede subjacente <em>afetam diretamente o " +
        "projeto</em> do sistema distribuído.</p>" +
        "<h3>Desempenho: latência e taxa de transferência</h3>" +
        "<p><strong>Latência</strong> é o tempo entre executar o envio e os dados " +
        "começarem a chegar (mede-se com uma mensagem vazia); a <strong>taxa de " +
        "transferência</strong> é a velocidade com que os dados fluem depois que a " +
        "transmissão começou. Combinando:</p>" +
        '<div class="callout">' +
        '<p class="callout-title">📐 A conta que todo projetista faz</p>' +
        "<p>Tempo de transmissão da mensagem = <strong>latência</strong> + " +
        "<strong>tamanho ÷ taxa de transferência</strong>. Como sistemas " +
        "distribuídos trocam muitas mensagens <em>pequenas</em>, a latência " +
        "frequentemente importa tanto quanto (ou mais que) a taxa de " +
        "transferência.</p>" +
        "</div>" +
        "<p>As ordens de grandeza dão o contexto: invocar um objeto na memória " +
        "local leva menos de 1 microssegundo; uma requisição-resposta em rede local " +
        "pouco carregada, cerca de 0,5 milissegundo: <em>mil vezes mais</em>; na " +
        "Internet, a ida e volta fica entre 5 e 500 ms (tipicamente 20-200 ms). Por " +
        "outro lado, a rede local costuma superar o disco rígido: um servidor de " +
        "arquivos com bom cache pode responder mais rápido que o disco local.</p>" +
        "<h3>Os demais requisitos</h3>" +
        "<ul>" +
        "<li><strong>Escalabilidade</strong>: a Internet caminha para bilhões de " +
        "nós; endereçamento e roteamento precisaram ser revistos para acompanhar.</li>" +
        "<li><strong>Confiabilidade</strong>: a mídia física é muito confiável; " +
        "quando algo se perde, a causa comum é software nos extremos (estouro de " +
        "buffer, host que não aceita o pacote). O argumento <em>fim-a-fim</em> " +
        "(Tópico 2) sugere: detecção e correção de erros é melhor feita pela " +
        "aplicação.</li>" +
        "<li><strong>Segurança</strong>: a primeira defesa é o <em>firewall</em> " +
        "no gateway da organização; segurança fina exige criptografia fim-a-fim e " +
        "VPNs (seção adiante).</li>" +
        "<li><strong>Mobilidade</strong>: dispositivos trocam de ponto de conexão; " +
        "os esquemas de endereçamento da Internet nasceram antes disso e precisaram " +
        "de adaptações (MobileIP).</li>" +
        "<li><strong>Qualidade de serviço (QoS)</strong>: multimídia em tempo real " +
        "exige banda garantida e latência limitada.</li>" +
        "<li><strong>Multicasting</strong>: comunicação de um para muitos sem " +
        "repetir envios ponto a ponto.</li>" +
        "</ul>" +
        "<h3>Tipos de rede</h3>" +
        "<ul>" +
        "<li><strong>PAN / WPAN</strong>: redes pessoais entre dispositivos do " +
        "usuário; sem fio, alcance de 10-30 m (Bluetooth).</li>" +
        "<li><strong>LAN</strong>: rede local em um prédio ou campus (1-2 km), " +
        "banda alta (10 Mbps, 10 Gbps), latência baixa; Ethernet domina. Variante sem " +
        "fio: <strong>WLAN</strong> (WiFi, 11-108 Mbps).</li>" +
        "<li><strong>MAN</strong>: metropolitana (2-50 km): DSL, modem a cabo; sem " +
        "fio: <strong>WMAN</strong> (WiMAX).</li>" +
        "<li><strong>WAN</strong>: longa distância, mundial, atravessa roteadores: " +
        "latência de 100-500 ms; sem fio: <strong>WWAN</strong> (celular 3G/4G).</li>" +
        "<li><strong>Inter-redes</strong>: várias redes heterogêneas integradas em " +
        "um único meio de comunicação: uma “rede virtual” sobre as redes " +
        "reais. A Internet é o exemplo máximo.</li>" +
        "</ul>" +
        "<p>Quanto a erros: pacotes se perdem em qualquer tipo de rede: quase " +
        "sempre por atraso de processamento ou estouro de buffer no destino, não " +
        "por corrupção na mídia. Em redes de longa distância, pacotes roteados " +
        "individualmente podem chegar <em>fora de ordem</em>; e retransmissões por " +
        "suspeita de perda geram <em>duplicatas</em> (como visto na demo do " +
        "Tópico 1).</p>",
      slides: [
        {
          title: "A rede molda o sistema distribuído",
          html:
            "<ul>" +
            "<li><strong>Subsistema de comunicação</strong> = hardware + software da rede</li>" +
            "<li>Tempo de transmissão = <strong>latência + tamanho ÷ taxa</strong></li>" +
            "<li>Muitas mensagens pequenas → a <strong>latência domina</strong></li>" +
            "<li>Local ~1 µs · LAN ~0,5 ms · Internet 20-200 ms</li>" +
            "</ul>"
        },
        {
          title: "Requisitos além do desempenho",
          html:
            "<ul>" +
            "<li><strong>Escalabilidade</strong>: bilhões de nós</li>" +
            "<li><strong>Confiabilidade</strong>: erros nascem nos extremos (fim-a-fim)</li>" +
            "<li><strong>Segurança</strong>: firewall · criptografia · VPN</li>" +
            "<li><strong>Mobilidade</strong> · <strong>QoS</strong> · <strong>multicast</strong></li>" +
            "</ul>"
        },
        {
          title: "Tipos de rede",
          html:
            "<ul>" +
            "<li><strong>PAN/WPAN</strong>: pessoais, 10-30 m (Bluetooth)</li>" +
            "<li><strong>LAN</strong>: 1-2 km, banda alta (Ethernet) · <strong>WLAN</strong> (WiFi)</li>" +
            "<li><strong>MAN</strong>: cidade (DSL) · <strong>WAN</strong>: mundial, " +
            "100-500 ms (celular = WWAN)</li>" +
            "<li><strong>Inter-rede</strong>: rede de redes: a Internet</li>" +
            "</ul>"
        }
      ]
    },
    {
      title: "Conceitos básicos: pacotes, camadas e roteamento",
      html:
        "<p>A base de todas as redes de computadores é a <strong>comutação de " +
        "pacotes</strong> (anos 1960): pacotes de destinos diferentes compartilham " +
        "os mesmos enlaces, ao contrário da <em>comutação de circuitos</em> da " +
        "telefonia antiga, que reservava um caminho por chamada. Antes de " +
        "transmitir, cada mensagem é dividida em <strong>pacotes</strong> de " +
        "comprimento limitado: para que os nós possam alocar buffers e para que " +
        "mensagens longas não monopolizem os canais. O tamanho máximo do campo de " +
        "dados é a <strong>MTU</strong> (na Ethernet, 1.500 bytes).</p>" +
        "<h3>Esquemas de comutação</h3>" +
        "<ul>" +
        "<li><strong>Broadcast</strong>: sem comutação: tudo é transmitido a todos " +
        "os nós e cada um recolhe o que lhe é endereçado (Ethernet, redes sem fio).</li>" +
        "<li><strong>Comutação de circuitos</strong>: caminho estabelecido e " +
        "reservado antes da conversa (o “sistema telefônico antigo”).</li>" +
        "<li><strong>Comutação de pacotes</strong>: rede de <em>armazenamento e " +
        "encaminhamento</em> (store-and-forward): cada nó recebe o pacote inteiro, " +
        "guarda e repassa ao próximo, como o sistema postal.</li>" +
        "<li><strong>Frame relay</strong>: meio-termo: quadros pequenos comutados " +
        "em trânsito, examinando só os primeiros bits (ATM), com latências de " +
        "microssegundos.</li>" +
        "</ul>" +
        "<h3>Protocolos em camadas</h3>" +
        "<p>Um <strong>protocolo</strong> é um conjunto conhecido de regras e " +
        "formatos com duas partes: a <em>sequência</em> das mensagens trocadas e o " +
        "<em>formato</em> dos dados. O software de rede se organiza em " +
        "<strong>camadas</strong>: cada uma oferece serviço à camada de cima e usa " +
        "a de baixo; no remetente, cada camada <em>encapsula</em> os dados com seu " +
        "cabeçalho; no destino, o processo se inverte. O modelo de referência " +
        "<strong>OSI</strong> define sete camadas (física, enlace, rede, transporte, " +
        "sessão, apresentação, aplicação). A Internet não implementa sessão e " +
        "apresentação como camadas separadas: elas são absorvidas pela aplicação ou " +
        "pelo <em>middleware</em>. O empilhamento simplifica, mas custa: transmitir " +
        "por N camadas envolve N transferências de controle e N cópias dos dados: " +
        "por isso a taxa vista pela aplicação é bem menor que a da rede.</p>" +
        "<p>Na camada de transporte, mensagens são endereçadas a <strong>portas</strong>" +
        ": pontos de destino ligados a processos. Um <em>endereço de transporte</em> " +
        "= endereço de rede do host + número da porta; serviços conhecidos usam " +
        "portas registradas (HTTP: 80).</p>" +
        "<p>Há duas estratégias de entrega na camada de rede: <strong>datagramas</strong>" +
        ", cada pacote é roteado de forma independente, sem configuração prévia (IP, " +
        "Ethernet), e <strong>circuitos virtuais</strong>: um caminho é montado " +
        "antes e os pacotes carregam só o número do circuito (ATM).</p>" +
        "<h3>Roteamento</h3>" +
        "<p>Em qualquer rede maior que um segmento local, entregar pacotes é tarefa " +
        "coletiva dos roteadores, em <em>saltos</em> (hops) sucessivos. Um algoritmo " +
        "de roteamento tem duas partes: <strong>decidir o próximo salto</strong> de " +
        "cada pacote (rápido, na chegada) e <strong>manter o conhecimento da " +
        "topologia</strong> (em segundo plano). No algoritmo de <strong>vetor de " +
        "distância</strong> (Bellman-Ford, base do protocolo RIP), cada roteador " +
        "guarda uma tabela “destino → enlace de saída + custo em saltos” e " +
        "periodicamente troca sua tabela com os vizinhos, adotando rotas melhores; " +
        "um enlace defeituoso vira custo infinito, e a notícia se propaga. Sua " +
        "convergência lenta motivou os algoritmos de <strong>estado de enlace</strong> " +
        "(como o <strong>OSPF</strong>): cada nó mantém um mapa da rede e calcula " +
        "as rotas ótimas com o algoritmo de Dijkstra. E como nenhum roteador " +
        "consegue conhecer o mundo inteiro, usam-se <strong>rotas padrão</strong> " +
        "(default): tudo o que a tabela não cobre segue por uma saída única.</p>" +
        "<p><strong>Congestionamento</strong>: quando a carga passa de ~80% da " +
        "capacidade, filas estouram, pacotes são descartados e as retransmissões " +
        "desperdiçam ainda mais recursos. O controle em redes de datagramas é " +
        "<em>fim-a-fim</em>: o remetente reduz o ritmo ao perceber perdas ou avisos" +
        ". É daí que o TCP tira o “controle de transmissão” do nome.</p>" +
        "<h3>Interligando redes heterogêneas</h3>" +
        "<p>Para unir sub-redes de tecnologias diferentes são necessários: um " +
        "endereçamento unificado, um protocolo comum de pacotes e componentes de " +
        "interconexão: na Internet, respectivamente os endereços IP, o protocolo " +
        "IP e os roteadores. No caminho aparecem também <strong>hubs</strong> " +
        "(apenas estendem um segmento local: repetem tudo a todos), " +
        "<strong>switches</strong> (comutam quadros só para a rede local de " +
        "destino), <strong>pontes</strong> (ligam redes de tipos diferentes) e o " +
        "<strong>tunelamento</strong>: transportar um protocolo encapsulado dentro " +
        "de outro, como pacotes IPv6 viajando em “ilhas” através do mar " +
        "IPv4: o túnel é transparente para quem o atravessa.</p>" +
        /* Área reservada para demonstração interativa futura. */
        '<div class="demo-area" data-demo="camadas-rede">' +
        '<span class="demo-placeholder-icon" aria-hidden="true">🧪</span>' +
        "<p><strong>Demonstração interativa (em breve)</strong></p>" +
        "<p>Espaço reservado para uma visualização interativa das camadas de protocolo e do encaminhamento de pacotes.</p>" +
        "</div>",
      slides: [
        {
          title: "Comutação: como os dados viajam",
          html:
            "<ul>" +
            "<li><strong>Broadcast</strong>: todos ouvem; cada nó recolhe o seu (Ethernet, rádio)</li>" +
            "<li><strong>Circuitos</strong>: caminho reservado por conversa (telefonia antiga)</li>" +
            "<li><strong>Pacotes</strong>: armazenar e encaminhar, como o correio (Internet)</li>" +
            "<li><strong>Frame relay</strong>: comuta pelo início do quadro (ATM)</li>" +
            "</ul>"
        },
        {
          title: "Protocolos em camadas",
          html:
            "<ul>" +
            "<li>Protocolo = <strong>sequência de mensagens + formato</strong></li>" +
            "<li>Cada camada serve a de cima; <strong>encapsulamento</strong> por cabeçalhos</li>" +
            "<li>OSI: 7 camadas · Internet: 4 (middleware absorve as superiores)</li>" +
            "<li>Custo: N transferências de controle + N cópias</li>" +
            "</ul>"
        },
        {
          title: "Roteamento",
          html:
            "<ul>" +
            "<li>Duas partes: <strong>próximo salto</strong> + <strong>manter a topologia</strong></li>" +
            "<li><strong>Vetor de distância</strong> (RIP): troca tabelas com vizinhos; " +
            "falha = custo ∞</li>" +
            "<li><strong>Estado de enlace</strong> (OSPF): mapa da rede + Dijkstra</li>" +
            "<li><strong>Rotas default</strong> encolhem as tabelas</li>" +
            "</ul>"
        },
        {
          title: "Interligando redes heterogêneas",
          html:
            "<ul>" +
            "<li><strong>Hub</strong>: repete tudo · <strong>switch</strong>: comuta na LAN</li>" +
            "<li><strong>Roteador</strong>: encaminha entre redes · <strong>ponte</strong>: " +
            "liga tecnologias</li>" +
            "<li><strong>Tunelamento</strong>: protocolo dentro de protocolo (IPv6 sobre IPv4)</li>" +
            "<li><strong>Congestionamento</strong>: carga &gt; 80% → perdas em cascata</li>" +
            "</ul>"
        }
      ]
    },
    {
      title: "Protocolos Internet: IP, TCP, UDP e a infraestrutura",
      html:
        "<p>A pilha <strong>TCP/IP</strong> nasceu da ARPANET e hoje é quase " +
        "universal em sistemas distribuídos. Seu segredo é a independência da " +
        "tecnologia de transmissão: aplicações veem uma única <em>rede IP " +
        "virtual</em>; embaixo, datagramas IP são encapsulados nos quadros de " +
        "qualquer rede real (Ethernet, WiFi, ATM, linhas seriais via PPP).</p>" +
        "<h3>IP: entrega de melhor esforço</h3>" +
        "<p>O IP transmite <strong>datagramas</strong> (até 64 KB) com semântica de " +
        "<strong>melhor esforço</strong> (best effort): sem garantias: datagramas " +
        "podem ser perdidos, duplicados, retardados ou entregues fora de ordem. A " +
        "soma de verificação cobre <em>só o cabeçalho</em>: validar os dados fica " +
        "para TCP e UDP, um exemplo prático do princípio fim-a-fim. Datagramas " +
        "maiores que a MTU da rede subjacente são <em>fragmentados</em> e remontados " +
        "no destino. Na fronteira com a rede física, o <strong>ARP</strong> converte " +
        "endereço IP em endereço físico: pergunta em broadcast na rede local " +
        "“quem tem este IP?” e guarda as respostas em cache. E um alerta: " +
        "o endereço de origem de um datagrama <em>não é confiável</em>: o " +
        "<strong>spoofing de IP</strong> (forjar o remetente) já alimentou ataques " +
        "de negação de serviço famosos.</p>" +
        "<h3>Endereçamento: da escassez ao IPv6</h3>" +
        "<p>O <strong>IPv4</strong> usa endereços de 32 bits (4 octetos: " +
        "138.37.94.248) com identificador de rede + identificador de host, " +
        "originalmente divididos em classes A, B e C (mais D para multicast). " +
        "Quatro bilhões de endereços pareciam bastar, mas a alocação por classes " +
        "desperdiçava, e por volta de 1990 o esgotamento tinha prazo. Três medidas " +
        "responderam:</p>" +
        "<ul>" +
        "<li><strong>CIDR</strong> (roteamento entre domínios sem classes): uma " +
        "<em>máscara</em> na tabela de roteamento permite que a divisão rede/host " +
        "caia em qualquer ponto do endereço (a notação /29 indica 29 bits de rede), " +
        "flexibilizando a alocação.</li>" +
        "<li><strong>NAT</strong> (tradução de endereços de rede): uma rede " +
        "inteira com endereços privados (ex.: 192.168.1.x, distribuídos por " +
        "<strong>DHCP</strong>) compartilha um único IP registrado. O roteador NAT " +
        "reescreve endereço e porta de origem de cada mensagem que sai e usa a " +
        "porta de destino das respostas para localizar, em sua tabela, o computador " +
        "interno correto. Funciona muito bem para clientes; para expor servidores é " +
        "preciso configuração manual.</li>" +
        "<li><strong>IPv6</strong>: endereços de 128 bits (≈3·10<sup>38</sup>: " +
        "mesmo em estimativas pessimistas, mil endereços por metro quadrado do " +
        "planeta), roteamento mais rápido (sem checksum de conteúdo nem " +
        "fragmentação em trânsito), <em>classe de tráfego</em> e <em>rótulo de " +
        "fluxo</em> para tempo real, difusão <em>anycast</em> e segurança no nível " +
        "IP. A migração, planejada por túneis sobre IPv4, tem sido lenta (CIDR e " +
        "NAT aliviaram a pressão) mas a explosão de dispositivos móveis a tornou " +
        "inevitável.</li>" +
        "</ul>" +
        "<p><strong>MobileIP</strong> resolve o computador que se move sem trocar " +
        "de endereço: um <em>agente doméstico</em> na rede de origem recebe os " +
        "datagramas e os entrega, por túnel, ao <em>agente estrangeiro</em> onde o " +
        "host está agora (que lhe dá um “endereço aos cuidados de”). " +
        "Eficaz, embora pouco eficiente: a telefonia celular faz o equivalente de " +
        "forma nativa.</p>" +
        "<h3>TCP e UDP: os dois transportes</h3>" +
        "<p>Enquanto o IP liga <em>computadores</em>, TCP e UDP ligam " +
        "<em>processos</em>, via portas. O <strong>UDP</strong> é quase um IP com " +
        "portas: sem conexão, sem confirmação, checksum opcional: custo mínimo " +
        "para quem tolera perdas. O <strong>TCP</strong> oferece um <em>fluxo de " +
        "bytes</em> confiável, orientado a conexão, somando ao IP:</p>" +
        "<ul>" +
        "<li><strong>Sequenciamento</strong>: segmentos numerados, entregues à " +
        "aplicação na ordem;</li>" +
        "<li><strong>Controle de fluxo</strong>: confirmações carregam uma " +
        "<em>janela</em>: quanto o remetente pode enviar antes da próxima " +
        "confirmação, protegendo destinos e nós lentos;</li>" +
        "<li><strong>Retransmissão</strong>: segmento não confirmado no prazo é " +
        "reenviado;</li>" +
        "<li><strong>Buffers</strong> no receptor equilibram os ritmos; e uma " +
        "<strong>soma de verificação</strong> cobre cabeçalho e dados.</li>" +
        "</ul>" +
        "<h3>DNS: nomes em vez de números</h3>" +
        "<p>Humanos usam <em>nomes de domínio</em> hierárquicos (www.ifsp.edu.br); " +
        "a comunicação exige endereços IP. O <strong>DNS</strong> faz a conversão: " +
        "servidores de nomes distribuídos, cada um responsável por sua parte da " +
        "hierarquia, resolvem consultas recursivamente e guardam os resultados em " +
        "<em>cache</em>: sem o cache, os servidores-raiz seriam o gargalo de toda " +
        "a Internet.</p>" +
        "<h3>Firewalls e VPNs</h3>" +
        "<p>Em uma intranet grande, sempre haverá algum software vulnerável. O " +
        "<strong>firewall</strong> monitora e controla toda a comunicação que entra " +
        "e sai, aplicando a política de segurança da organização em até três " +
        "níveis: <em>filtragem de datagramas IP</em> (por endereços, portas, tipo " +
        "de serviço), <em>gateway TCP</em> (valida conexões e segmentos) e " +
        "<em>gateway de aplicação</em> (um <em>proxy</em> examina o conteúdo: " +
        "processos que costumam rodar em um computador dedicado, o " +
        "<em>bastião</em>). Servidores públicos (Web, FTP) ficam fora da zona " +
        "protegida, às vezes em uma sub-rede entre dois filtros. Já a " +
        "<strong>VPN</strong> estende o perímetro protegido através da Internet " +
        "pública: canais cifrados em nível IP (IPSec) ligam usuários remotos e " +
        "filiais como se estivessem na rede interna.</p>",
      slides: [
        {
          title: "IP: a rede virtual de melhor esforço",
          html:
            "<ul>" +
            "<li>Uma rede lógica sobre tecnologias heterogêneas</li>" +
            "<li><strong>Sem garantias</strong>: perda, duplicação, atraso, desordem</li>" +
            "<li>Checksum só do cabeçalho: dados são problema do transporte " +
            "(<strong>fim-a-fim</strong>)</li>" +
            "<li>Fragmentação conforme a <strong>MTU</strong> do caminho</li>" +
            "</ul>"
        },
        {
          title: "Endereços: da escassez ao IPv6",
          html:
            "<ul>" +
            "<li><strong>IPv4</strong>: 32 bits em classes → esgotamento anunciado</li>" +
            "<li><strong>CIDR</strong>: máscaras flexíveis · <strong>DHCP</strong>: " +
            "endereço dinâmico</li>" +
            "<li><strong>NAT</strong>: rede privada inteira atrás de 1 IP (mapa por portas)</li>" +
            "<li><strong>IPv6</strong>: 128 bits (~3·10³⁸), fluxo, anycast, segurança</li>" +
            "</ul>"
        },
        {
          title: "Quem é quem: ARP, DNS, MobileIP",
          html:
            "<ul>" +
            "<li><strong>ARP</strong>: IP → endereço físico (broadcast local + cache)</li>" +
            "<li><strong>DNS</strong>: nome de domínio → IP; hierarquia + cache</li>" +
            "<li><strong>MobileIP</strong>: agente doméstico entuba até o agente " +
            "estrangeiro</li>" +
            "<li><strong>Spoofing</strong>: o endereço de origem não é confiável</li>" +
            "</ul>"
        },
        {
          title: "TCP × UDP",
          html:
            "<ul>" +
            "<li><strong>UDP</strong>: portas + checksum opcional; sem conexão nem garantias</li>" +
            "<li><strong>TCP</strong>: fluxo de bytes confiável, orientado a conexão</li>" +
            "<li>Sequenciamento · confirmações com <strong>janela</strong> · " +
            "retransmissão · buffers</li>" +
            "<li>Escolha: custo mínimo (UDP) × entrega garantida (TCP)</li>" +
            "</ul>"
        },
        {
          title: "A borda defendida: firewalls e VPN",
          html:
            "<ul>" +
            "<li><strong>Firewall</strong>: todo o tráfego passa por ele: política da " +
            "organização</li>" +
            "<li>Níveis: filtro IP · gateway TCP · proxy de aplicação (<strong>bastião</strong>)</li>" +
            "<li>Servidores públicos fora da zona protegida</li>" +
            "<li><strong>VPN</strong>: canal cifrado em nível IP (IPSec) estende a intranet</li>" +
            "</ul>"
        }
      ]
    },
    {
      title: "Estudos de caso: Ethernet, WiFi e Bluetooth",
      html:
        "<p>Os padrões de rede local do comitê <strong>IEEE 802</strong> dominam a " +
        "borda da Internet: 802.3 (Ethernet), 802.11 (WiFi), 802.15.1 (Bluetooth): " +
        "além de 802.15.4 (ZigBee, sensores) e 802.16 (WiMAX). Três estudos de caso " +
        "mostram compromissos de projeto bem diferentes.</p>" +
        "<h3>Ethernet (IEEE 802.3): disputa educada pelo meio</h3>" +
        "<p>Criada no Xerox PARC em 1973, é um <em>barramento de disputa</em>: " +
        "todas as estações compartilham o meio e “escutam” continuamente; " +
        "quadros (de 64 a 1.518 bytes) carregam endereços <strong>MAC</strong> de " +
        "48 bits, únicos de fábrica. O método é <strong>CSMA/CD</strong>: " +
        "<em>detecção de portadora</em> (só transmitir com o meio livre), " +
        "<em>detecção de colisão</em> (comparar o que transmite com o que ouve; ao " +
        "divergir, parar e emitir sinal de reforço: jamming) e <em>back-off</em> " +
        "(cada estação espera um tempo aleatório antes de tentar de novo, dobrando " +
        "o limite a cada nova colisão). O quadro mínimo de 64 bytes garante que " +
        "colisões sejam percebidas mesmo entre extremos do cabo. A eficiência chega " +
        "a 80-95%, mas <em>não há garantia de prazo</em>: o meio pode estar sempre " +
        "ocupado quando a mensagem fica pronta.</p>" +
        '<div class="callout">' +
        '<p class="callout-title">💡 Por que a Ethernet comutada mudou o jogo</p>' +
        "<p>Com <strong>switches</strong> (em vez de hubs), cada host tem seu " +
        "próprio segmento: só recebe quadros endereçados a ele. Sem disputa pelo " +
        "meio, a eficiência se aproxima de 100% com latência constante, e a " +
        "Ethernet passou a servir até aplicações de tempo real, aposentando " +
        "concorrentes como o token ring.</p>" +
        "</div>" +
        "<h3>WiFi (IEEE 802.11): quando não dá para detectar colisão</h3>" +
        "<p>O WiFi leva o princípio da Ethernet ao rádio (2,4/5 GHz, até 54 Mbps, " +
        "~150 m), em duas configurações: <em>infraestrutura</em> (estação-base como " +
        "ponto de acesso à rede cabeada) e <em>ad hoc</em> (dispositivos que se " +
        "detectam e formam rede na hora). Mas no rádio a intensidade do sinal varia " +
        "pelo espaço, e a detecção de colisão falha por três motivos: " +
        "<strong>estações ocultas</strong> (um obstáculo esconde um transmissor " +
        "ativo), <strong>desvanecimento</strong> (o sinal enfraquece com o quadrado " +
        "da distância) e <strong>mascaramento</strong> (o próprio sinal, muito mais " +
        "forte, abafa o remoto: o transmissor nunca “ouve” a colisão que " +
        "causou). A resposta é <em>prevenir</em> em vez de detectar. " +
        "<strong>CSMA/CA</strong>: antes de transmitir, a estação reserva um slot " +
        "trocando quadros curtos <em>RTS/CTS</em> (request/clear to send) com o " +
        "destino; quem ouve qualquer um dos dois cala pelo período anunciado, e a " +
        "recepção é confirmada quadro a quadro. A segurança nasceu mal: o WEP " +
        "original era falho e foi substituído.</p>" +
        "<h3>Bluetooth (IEEE 802.15.1): a rede que cabe no bolso</h3>" +
        "<p>Projetado para ligar fones, telefones e acessórios com hardware de " +
        "custo ínfimo (meta: US$ 5 por dispositivo) e baixíssimo consumo, o " +
        "Bluetooth opera a ~1 mW com alcance de 10 m. Os nós se associam " +
        "dinamicamente em <strong>piconets</strong>: um <em>mestre</em> e até 7 " +
        "<em>escravos</em> ativos (mais até 255 “estacionados” em modo de " +
        "baixa energia); piconets ligadas por nós-ponte formam uma " +
        "<em>scatternet</em>. Dois tipos de enlace refletem os dois usos: " +
        "<strong>SCO</strong>, síncrono, para voz em tempo real, cada bit " +
        "transmitido em triplicata, sem retransmissão (dado atrasado é inútil), e " +
        "<strong>ACL</strong>, assíncrono, para dados. A versão 1.1 atinge 1 Mbps " +
        "por piconet (a 2.0 chega a 3 Mbps). O calcanhar de aquiles: a associação " +
        "de um novo dispositivo pode levar até 10 segundos: inviável para, por " +
        "exemplo, pagar pedágio em movimento.</p>",
      slides: [
        {
          title: "Ethernet (IEEE 802.3)",
          html:
            "<ul>" +
            "<li><strong>CSMA/CD</strong> no meio compartilhado: ouvir antes e durante</li>" +
            "<li>Colisão → jamming + <strong>back-off</strong> aleatório (dobra a cada vez)</li>" +
            "<li>Quadros 64-1.518 bytes · endereço <strong>MAC</strong> único de 48 bits</li>" +
            "<li>Com <strong>switches</strong>: segmento por host: sem disputa, " +
            "latência estável</li>" +
            "</ul>"
        },
        {
          title: "WiFi (IEEE 802.11)",
          html:
            "<ul>" +
            "<li>Rádio 2,4/5 GHz · até 54 Mbps · ~150 m</li>" +
            "<li>Detectar colisão falha: <strong>estações ocultas</strong>, " +
            "desvanecimento, sinal local abafa</li>" +
            "<li><strong>CSMA/CA</strong>: reserva de slot com <strong>RTS/CTS</strong> + " +
            "confirmação</li>" +
            "<li><strong>Infraestrutura</strong> (ponto de acesso) × <strong>ad hoc</strong></li>" +
            "</ul>"
        },
        {
          title: "Bluetooth (IEEE 802.15.1)",
          html:
            "<ul>" +
            "<li><strong>WPAN</strong>: barato (~US$ 5), baixa energia, ~10 m</li>" +
            "<li><strong>Piconet</strong>: mestre + 7 escravos ativos (+255 estacionados)</li>" +
            "<li><strong>SCO</strong>: voz em tempo real, redundância tripla · " +
            "<strong>ACL</strong>: dados</li>" +
            "<li>Custo: associação lenta (até 10 s)</li>" +
            "</ul>"
        }
      ]
    }
  ],

  quiz: [
    {
      question:
        "Uma interação requisição-resposta em rede local leva ~0,5 ms; invocar um objeto na memória local, menos de 1 microssegundo. Para sistemas distribuídos, que trocam muitas mensagens PEQUENAS, qual parâmetro da rede costuma pesar tanto quanto ou mais que a taxa de transferência?",
      options: [
        "A largura de banda total do sistema.",
        "A latência.",
        "O MTU da rede subjacente.",
        "O número de hosts conectados."
      ],
      answer: 1,
      explanation:
        "Tempo de transmissão = latência + tamanho ÷ taxa de transferência. Quando " +
        "as mensagens são pequenas, o termo 'tamanho ÷ taxa' encolhe e a latência " +
        "(sobrecargas de software, atrasos de roteamento, disputa pelo canal) domina " +
        "o tempo total."
    },
    {
      question:
        "Por que as mensagens são divididas em pacotes de comprimento limitado antes da transmissão?",
      options: [
        "Porque o modelo OSI exige exatamente sete fragmentos por mensagem.",
        "Para que cada pacote possa seguir obrigatoriamente a mesma rota.",
        "Para permitir que cada nó aloque buffers suficientes e para evitar que mensagens longas monopolizem os canais de comunicação.",
        "Para eliminar a necessidade de somas de verificação."
      ],
      answer: 2,
      explanation:
        "Pacotes de tamanho limitado permitem que cada computador reserve buffer " +
        "para o maior pacote possível e impedem os atrasos excessivos que mensagens " +
        "longas causariam ao ocupar canais sem subdivisão: a base da comutação de " +
        "pacotes."
    },
    {
      question:
        "O IP oferece uma semântica de entrega descrita como 'de melhor esforço' (best effort). O que isso significa?",
      options: [
        "Não há garantias: datagramas podem ser perdidos, duplicados, retardados ou entregues fora de ordem.",
        "Os datagramas são sempre entregues, mas possivelmente fora de ordem.",
        "O IP retransmite cada datagrama perdido até três vezes antes de desistir.",
        "As perdas só ocorrem em redes sem fio; nas cabeadas a entrega é garantida."
      ],
      answer: 0,
      explanation:
        "O IP não garante nada sobre a entrega, e nem valida os dados (a soma de " +
        "verificação cobre só o cabeçalho). Confiabilidade, quando necessária, é " +
        "acrescentada pelo transporte (TCP) ou pela aplicação, seguindo o princípio " +
        "fim-a-fim."
    },
    {
      question:
        "Um roteador NAT recebe da Internet uma mensagem TCP de resposta. Como ele decide a qual computador da rede interna entregá-la?",
      options: [
        "Pelo endereço MAC de destino gravado no quadro Ethernet externo.",
        "Transmitindo a mensagem em broadcast para todos os computadores internos.",
        "Pelo endereço IP de origem do servidor externo que respondeu.",
        "Pelo número da porta de destino da mensagem, que indexa em sua tabela o endereço IP e a porta internos reais."
      ],
      answer: 3,
      explanation:
        "Ao sair, cada mensagem interna tem endereço e porta de origem substituídos " +
        "pelo IP do roteador e por uma porta virtual que indexa a tabela de " +
        "mapeamento. A resposta externa chega endereçada a essa porta virtual, e é " +
        "ela que aponta o computador interno correto."
    },
    {
      question:
        "Qual mecanismo do TCP impede que um remetente rápido sobrecarregue um destinatário (ou nós intermediários) mais lento?",
      options: [
        "A soma de verificação de cabeçalho e dados.",
        "O controle de fluxo: as confirmações anunciam uma janela com o volume que o remetente pode enviar antes da próxima confirmação.",
        "A fragmentação dos datagramas conforme o MTU.",
        "O rótulo de fluxo do cabeçalho IPv6."
      ],
      answer: 1,
      explanation:
        "O receptor confirma os segmentos informando o número de sequência mais " +
        "alto recebido e um TAMANHO DE JANELA: o quanto ainda aceita receber. O " +
        "remetente só envia dentro dessa janela, equilibrando os ritmos dos dois " +
        "lados."
    },
    {
      question:
        "Por que o WiFi (IEEE 802.11) usa PREVENÇÃO de colisão (CSMA/CA, com quadros RTS/CTS) em vez da DETECÇÃO de colisão (CSMA/CD) da Ethernet?",
      options: [
        "Porque colisões são fisicamente impossíveis em transmissões de rádio.",
        "Porque os quadros RTS/CTS transportam os dados mais rapidamente.",
        "Porque no rádio o sinal local abafa o remoto e há estações ocultas e desvanecimento: o transmissor não consegue perceber a colisão que causou.",
        "Por exigência do protocolo de segurança WEP."
      ],
      answer: 2,
      explanation:
        "A detecção de colisão exige que todos ouçam sinais com intensidade " +
        "parecida. No rádio isso falha: estações ocultas por obstáculos, sinal que " +
        "desvanece com a distância e o próprio sinal (muito mais forte) mascarando " +
        "o alheio. Por isso o 802.11 reserva o canal antes, com a troca RTS/CTS, e " +
        "confirma cada quadro recebido."
    }
  ],

  glossary: [
    {
      term: "Comutação de pacotes",
      definition:
        "Técnica em que pacotes endereçados a destinos diferentes compartilham os " +
        "mesmos enlaces: cada nó armazena o pacote recebido e o encaminha ao " +
        "próximo (store-and-forward). É a base de todas as redes de computadores."
    },
    {
      term: "Latência (de rede)",
      definition:
        "Tempo decorrido entre a execução do envio e o início da chegada dos dados " +
        "ao destino: medível como o tempo de transferir uma mensagem vazia. Em " +
        "sistemas distribuídos, frequentemente pesa mais que a taxa de transferência."
    },
    {
      term: "MTU (Maximum Transfer Unit)",
      definition:
        "Comprimento máximo do campo de dados de um pacote em uma tecnologia de " +
        "rede. Na Ethernet é de 1.500 bytes; mensagens maiores precisam ser " +
        "fragmentadas e remontadas no destino."
    },
    {
      term: "Protocolo",
      definition:
        "Conjunto bem conhecido de regras e formatos para a comunicação entre " +
        "processos, com duas partes: a especificação da sequência de mensagens " +
        "trocadas e a especificação do formato dos dados nelas."
    },
    {
      term: "Datagrama",
      definition:
        "Modo de entrega em que cada pacote é roteado de forma independente, sem " +
        "configuração prévia nem estado na rede: pacotes podem seguir rotas " +
        "diferentes e chegar fora de ordem. É o modo do IP."
    },
    {
      term: "Circuito virtual",
      definition:
        "Modo de entrega em que um caminho é configurado antes da transmissão " +
        "(entradas de tabela nos nós intermediários); os pacotes carregam apenas o " +
        "número do circuito, não os endereços. Exemplo: redes ATM."
    },
    {
      term: "Vetor de distância",
      definition:
        "Família de algoritmos de roteamento (Bellman-Ford) em que cada roteador " +
        "mantém uma tabela destino → próximo enlace + custo e a troca " +
        "periodicamente com os vizinhos, adotando rotas de custo menor. Base do " +
        "protocolo RIP."
    },
    {
      term: "NAT (Network Address Translation)",
      definition:
        "Esquema em que uma rede com endereços IP privados compartilha um único " +
        "endereço registrado: o roteador reescreve endereço e porta de origem das " +
        "mensagens que saem e usa a porta de destino das respostas para localizar o " +
        "computador interno."
    },
    {
      term: "ARP (Address Resolution Protocol)",
      definition:
        "Protocolo que converte um endereço IP no endereço físico (MAC) " +
        "correspondente dentro de uma rede local, perguntando em broadcast e " +
        "guardando os pares descobertos em cache."
    },
    {
      term: "DNS (Domain Name System)",
      definition:
        "Serviço distribuído que converte nomes de domínio hierárquicos (como " +
        "www.ifsp.edu.br) em endereços IP, com servidores responsáveis por partes " +
        "da hierarquia e uso intensivo de cache."
    },
    {
      term: "Firewall",
      definition:
        "Conjunto de processos em um gateway que monitora e filtra toda a " +
        "comunicação entre uma intranet e a Internet, aplicando a política de " +
        "segurança da organização (filtragem IP, gateway TCP, proxy de aplicação)."
    },
    {
      term: "CSMA/CD",
      definition:
        "Método de acesso ao meio da Ethernet: detecção de portadora com múltiplo " +
        "acesso e detecção de colisão: transmitir só com o meio livre, comparar o " +
        "sinal enviado com o ouvido e, ao colidir, recuar por um tempo aleatório " +
        "(back-off)."
    }
  ],

  references: [
    "COULOURIS, G.; DOLLIMORE, J.; KINDBERG, T.; BLAIR, G. Sistemas Distribuídos: " +
    "Conceitos e Projeto. 5. ed. Porto Alegre: Bookman, 2013. Cap. 3. Redes de " +
    "Computadores e Interligação em Rede (pp. 81-143).",
    "VAN STEEN, M.; TANENBAUM, A. S. Distributed Systems. 4. ed. (versão DS 4.03). " +
    "distributed-systems.net. Cap. 4. Communication (seção 4.1, Foundations: " +
    "camadas de protocolo e protocolos de middleware; leitura complementar)."
  ]
};
