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
        "<p>Todo sistema distribuído se apoia em um <strong>subsistema de " +
        "comunicação</strong>, que é o conjunto de hardware e de software encarregado " +
        "de levar mensagens de um nó a outro. Os meios de transmissão incluem cabos " +
        "de cobre, fibras ópticas e rádio. Os equipamentos incluem roteadores, " +
        "comutadores (switches) e interfaces de rede. O software inclui as pilhas de " +
        "protocolo e os drivers desses componentes.</p>" +
        "<p>Dois <strong>termos</strong> vão se repetir no restante do tópico. " +
        "<strong>Nó</strong> é qualquer equipamento ligado à rede. Alguns nós são " +
        "<strong>hosts</strong>, ou seja, computadores e dispositivos que usam a rede " +
        "para executar as suas aplicações, portanto todo host é um nó. Roteadores e " +
        "comutadores também são nós, mas sua função principal é encaminhar o tráfego, " +
        "e não executar a aplicação distribuída.</p>" +
        "<p>A rede não é um detalhe de implementação que o projetista possa ignorar, " +
        "porque cada propriedade dela reaparece como restrição no sistema executado " +
        "sobre ela. Pelo desempenho, o projetista estima o custo de uma invocação " +
        "remota; pela confiabilidade, identifica as falhas contra as quais precisa se " +
        "defender. A escalabilidade limita o tamanho alcançável; a mobilidade " +
        "determina se um nó consegue mudar de lugar sem perder a identidade.</p>" +
        "<h3>Desempenho, medido por dois números</h3>" +
        "<p>Duas grandezas descrevem o desempenho de uma rede, e confundir uma com a " +
        "outra leva a decisões erradas de projeto. A <strong>latência</strong> é o " +
        "tempo entre o envio ser executado no remetente e os primeiros dados " +
        "começarem a chegar ao destino, e ela é medida com uma mensagem vazia, " +
        "justamente para isolar o atraso do tamanho da mensagem. A <strong>taxa de " +
        "transferência</strong> é a velocidade com que os dados fluem depois que a " +
        "transmissão já começou.</p>" +
        '<div class="callout">' +
        '<p class="callout-title">📐 A conta que todo projetista faz</p>' +
        "<p>Tempo de transmissão de uma mensagem = <strong>latência</strong> + " +
        "<strong>tamanho ÷ taxa de transferência</strong>.</p>" +
        "</div>" +
        "<p>Repare em qual das duas parcelas domina no caso que interessa aqui. Um " +
        "sistema distribuído troca muitas mensagens pequenas, e numa mensagem pequena " +
        "o segundo termo da soma é quase zero. Quem paga a conta é a latência, e é " +
        "ela que o projetista precisa vigiar, mesmo quando o marketing da rede só " +
        "anuncia a taxa de transferência.</p>" +
        "<p>As ordens de grandeza mostram o tamanho dessa diferença.</p>" +
        '<div class="tabela-rolagem">' +
        '<table class="tabela-conteudo" id="tab-latencias">' +
        "<tr><th>Operação</th><th>Tempo típico</th><th>Quanto isso representa</th></tr>" +
        "<tr><td>Invocar um objeto na memória local</td>" +
        "<td>Menos de 1 microssegundo.</td>" +
        "<td>É a referência com que as outras linhas se comparam.</td></tr>" +
        "<tr><td>Requisição e resposta em rede local pouco carregada</td>" +
        "<td>Cerca de 0,5 milissegundo.</td>" +
        "<td>Mil vezes mais lento que a invocação local.</td></tr>" +
        "<tr><td>Ida e volta na Internet</td>" +
        "<td>De 5 a 500 milissegundos, tipicamente entre 20 e 200.</td>" +
        "<td>Dezenas a centenas de vezes mais lento que a rede local.</td></tr>" +
        "</table></div>" +
        "<p>A comparação com armazenamento depende da tecnologia, pois no cenário " +
        "medido pela fonte um servidor de arquivos com bom cache podia responder antes de " +
        "um disco magnético local, porque a resposta saía da memória. Com um " +
        "dispositivo de estado sólido local, essa comparação costuma se inverter e a " +
        "leitura local volta a ter menor latência.</p>" +
        "<h3>Os outros requisitos</h3>" +
        "<p>Desempenho é o requisito mais discutido, mas não é o único que um " +
        "sistema distribuído coloca sobre a rede em que roda. Outros seis aparecem " +
        "com frequência, e vale reparar que eles não são todos da mesma natureza. " +
        "Uns cobram da rede uma qualidade, como a escalabilidade e a " +
        "confiabilidade, e outros pedem dela um recurso que nem toda rede oferece, " +
        "como a qualidade de serviço e o multicast.</p>" +
        "<p><strong>Escalabilidade.</strong> O crescimento da Internet exigiu rever " +
        "o endereçamento e o roteamento, pois os esquemas originais não foram " +
        "projetados para bilhões de nós.</p>" +
        "<p><strong>Confiabilidade.</strong> A mídia física costuma ser confiável, mas " +
        "buffers podem estourar tanto nas filas dos roteadores congestionados quanto " +
        "no host de destino. O argumento fim-a-fim do Tópico 2 recomenda que a " +
        "aplicação verifique e corrija os erros que importam para ela.</p>" +
        "<p><strong>Segurança.</strong> O firewall no gateway fornece a defesa de " +
        "perímetro, enquanto a proteção mais fina usa criptografia fim-a-fim e uma " +
        "<strong>rede privada virtual (VPN)</strong>, assunto da seção 3.</p>" +
        "<p><strong>Mobilidade.</strong> Um dispositivo pode trocar de ponto de " +
        "conexão, enquanto o endereçamento IP associa o endereço à sub-rede; uma das " +
        "adaptações para esse conflito é o <strong>IP móvel (MobileIP)</strong>.</p>" +
        "<p><strong>Qualidade de serviço (QoS).</strong> Aplicações multimídia em " +
        "tempo real podem exigir largura de banda garantida e latência limitada.</p>" +
        "<p><strong>Multicast.</strong> O remetente envia uma mensagem a um grupo sem " +
        "repetir um envio ponto a ponto para cada destinatário.</p>" +
        "<h3>Tipos de rede</h3>" +
        "<p>As redes se classificam pelo alcance, e o nome de cada tipo já diz qual " +
        "é. Nas variantes sem fio, a inicial W do nome vem do inglês " +
        "<em>wireless</em>.</p>" +
        '<div class="tabela-rolagem">' +
        '<table class="tabela-conteudo" id="tab-tipos-rede">' +
        "<tr><th>Tipo</th><th>Alcance</th><th>O que a caracteriza</th>" +
        "<th>Variante sem fio</th></tr>" +
        "<tr><td>Rede pessoal (PAN)</td>" +
        "<td>De 10 a 30 metros.</td>" +
        "<td>Liga entre si os dispositivos de um mesmo usuário.</td>" +
        "<td>A rede pessoal sem fio (WPAN), do Bluetooth.</td></tr>" +
        "<tr><td>Rede local (LAN)</td>" +
        "<td>De 1 a 2 quilômetros, o que cobre um prédio ou um campus.</td>" +
        "<td>Tem banda alta, de 10 Mbps a 10 Gbps, e latência baixa. A Ethernet " +
        "domina esse território.</td>" +
        "<td>A rede local sem fio (WLAN), do WiFi. As taxas nominais vão das " +
        "dezenas de Mbps no 802.11a/g às centenas de Mbps e aos gigabits por " +
        "segundo nas gerações n, ac e ax.</td></tr>" +
        "<tr><td>Rede metropolitana (MAN)</td>" +
        "<td>De 2 a 50 quilômetros, o que cobre uma cidade.</td>" +
        "<td>Chega ao assinante pela linha digital do assinante (DSL) ou pelo modem " +
        "a cabo.</td>" +
        "<td>A rede metropolitana sem fio (WMAN), do WiMAX.</td></tr>" +
        "<tr><td>Rede de longa distância (WAN)</td>" +
        "<td>Mundial.</td>" +
        "<td>A distância de propagação e as filas dos roteadores elevam a latência, " +
        "que pode ir de poucos a centenas de milissegundos.</td>" +
        "<td>A rede de longa distância sem fio (WWAN), da telefonia celular 3G e " +
        "4G.</td></tr>" +
        "<tr><td>Inter-rede</td>" +
        "<td>Sem limite definido.</td>" +
        "<td>Integra redes de tecnologias diferentes em um único meio de comunicação, " +
        "ou seja, monta uma rede virtual sobre as redes reais. A Internet é o exemplo " +
        "máximo.</td>" +
        "<td>Não se aplica.</td></tr>" +
        "</table></div>" +
        "<p>As quatro primeiras linhas formam uma escala de alcance, mas a inter-rede " +
        "não é um quinto tamanho, mas uma rede virtual construída sobre redes dos " +
        "tipos anteriores. À medida que o alcance cresce, aumentam a distância de " +
        "propagação e a quantidade de filas intermediárias.</p>" +
        "<p>Uma observação vale para todos esses tipos. Pacotes se perdem em qualquer " +
        "rede, e raramente por corrupção do sinal na mídia física. A causa comum é " +
        "o estouro de buffer, seja nas filas dos roteadores quando há congestionamento, " +
        "seja no host de destino quando ele não acompanha o ritmo.</p>" +
        "<p>Nas redes de longa distância há dois efeitos a mais, e os dois vêm de " +
        "decisões de projeto que este tópico ainda vai detalhar. Como cada pacote é " +
        "roteado individualmente, eles podem chegar fora de ordem. E como a suspeita " +
        "de perda dispara retransmissão, o destino pode receber duplicatas, que é " +
        "justamente o fenômeno da demonstração do Tópico 1.</p>",
      slides: [
        {
          title: "A rede molda o sistema executado sobre ela",
          html:
            "<ul>" +
            "<li>O <strong>subsistema de comunicação</strong> é o hardware e o " +
            "software que levam a mensagem de um nó a outro</li>" +
            "<li><strong>Nó</strong> é qualquer equipamento ligado à rede. Todo " +
            "<strong>host</strong> é um nó, mas nem todo nó executa a aplicação " +
            "distribuída</li>" +
            "<li>O desempenho permite estimar a invocação remota; a confiabilidade " +
            "mostra as falhas relevantes; a escalabilidade limita o tamanho " +
            "possível</li>" +
            "</ul>"
        },
        {
          title: "Latência e taxa de transferência",
          html:
            "<ul>" +
            "<li>A <strong>latência</strong> é o tempo até os primeiros dados " +
            "chegarem, medida com mensagem vazia</li>" +
            "<li>A <strong>taxa de transferência</strong> é a velocidade depois que " +
            "a transmissão começou</li>" +
            "<li>Tempo de transmissão = <strong>latência + tamanho ÷ taxa</strong>" +
            "</li>" +
            "<li>Sistema distribuído troca mensagens pequenas, e na mensagem pequena " +
            "o segundo termo some. <strong>Quem paga a conta é a latência</strong>" +
            "</li>" +
            "</ul>"
        },
        {
          title: "As ordens de grandeza",
          ref: "tab-latencias"
        },
        {
          title: "Os outros requisitos da rede",
          html:
            "<ul>" +
            "<li>O crescimento da Internet exigiu rever endereçamento e roteamento " +
            "para bilhões de nós</li>" +
            "<li>Buffers estouram em roteadores congestionados e no host de destino. " +
            "O argumento fim-a-fim deixa a verificação final com a aplicação</li>" +
            "<li>A <strong>segurança</strong> começa no firewall do gateway, e " +
            "aprofunda com criptografia fim-a-fim e VPN</li>" +
            "<li>Na <strong>mobilidade</strong>, o nó muda de sub-rede sem querer " +
            "perder sua identidade</li>" +
            "<li>A <strong>qualidade de serviço</strong> garante banda e latência " +
            "máxima, e o <strong>multicasting</strong> entrega a muitos sem repetir " +
            "o envio</li>" +
            "</ul>"
        },
        {
          title: "Tipos de rede, por alcance",
          ref: "tab-tipos-rede"
        }
      ]
    },
    {
      title: "Conceitos básicos: pacotes, camadas e roteamento",
      html:
        "<p>A base de todas as redes de computadores é a <strong>comutação de " +
        "pacotes</strong>, uma ideia dos anos 1960. Pacotes com destinos diferentes " +
        "compartilham os mesmos enlaces, e o contraste é com a comutação de circuitos " +
        "da telefonia antiga, que reservava um caminho inteiro para cada chamada e o " +
        "mantinha ocioso durante os silêncios.</p>" +
        "<p>Antes de transmitir, cada mensagem é dividida em pacotes de comprimento " +
        "limitado, por duas razões que vale separar. A primeira é que o limite " +
        "permite que os nós aloquem buffers de tamanho conhecido; a segunda é que ele " +
        "impede uma mensagem longa de monopolizar o canal enquanto as outras esperam. " +
        "O tamanho máximo do campo de dados chama-se unidade máxima de transmissão " +
        "(MTU), e na Ethernet ela é de 1.500 bytes.</p>" +
        "<h3>Esquemas de comutação</h3>" +
        "<p>Quatro esquemas resolvem, de maneiras diferentes, a mesma questão de como " +
        "os dados atravessam a rede.</p>" +
        '<div class="tabela-rolagem">' +
        '<table class="tabela-conteudo" id="tab-comutacao">' +
        "<tr><th>Esquema</th><th>Como funciona</th><th>Onde aparece</th></tr>" +
        "<tr><td>Broadcast</td>" +
        "<td>Não há comutação, pois tudo é transmitido a todos os nós e cada um recolhe " +
        "o que está endereçado a ele.</td>" +
        "<td>Ethernet e redes sem fio.</td></tr>" +
        "<tr><td>Comutação de circuitos</td>" +
        "<td>Um caminho é estabelecido e reservado antes de a conversa começar, e " +
        "fica dedicado a ela até o fim.</td>" +
        "<td>O sistema telefônico antigo.</td></tr>" +
        "<tr><td>Comutação de pacotes</td>" +
        "<td>Cada nó recebe o pacote inteiro, guarda e repassa ao seguinte, no " +
        "esquema de armazenamento e encaminhamento, como faz o sistema postal.</td>" +
        "<td>A Internet.</td></tr>" +
        "<tr><td>Frame relay</td>" +
        "<td>É o meio-termo. Quadros pequenos são comutados ainda em trânsito, com o " +
        "nó examinando só os primeiros bits, o que derruba a latência para a casa dos " +
        "microssegundos.</td>" +
        "<td>O frame relay das antigas WANs corporativas e o modo de transferência " +
        "assíncrona (ATM), tecnologias distintas que hoje estão em desuso.</td></tr>" +
        "</table></div>" +
        "<p>Os quatro esquemas trocam recursos diferentes. Circuitos reservam o " +
        "caminho antes do envio. Pacotes compartilham enlaces e aceitam filas. Frame " +
        "relay e ATM reduzem o trabalho de comutação, enquanto o broadcast dispensa " +
        "a escolha de uma saída.</p>" +
        "<h3>Protocolos em camadas</h3>" +
        "<p>Um <strong>protocolo</strong> é um conjunto conhecido de regras e formatos " +
        "com duas partes. A primeira é a sequência das mensagens que precisam ser " +
        "trocadas; a segunda é o formato dos dados dentro de cada uma delas. Sem " +
        "acordo nas duas partes, as pontas não conversam.</p>" +
        "<p>O software de rede se organiza em camadas, e cada camada oferece um " +
        "serviço à camada de cima usando o serviço da camada de baixo. O mecanismo " +
        "que faz isso funcionar é o <strong>encapsulamento</strong>. A figura a " +
        "seguir usa as quatro camadas da pilha TCP/IP simplificada, da aplicação ao " +
        "enlace. No remetente, " +
        "cada camada envolve os dados que recebeu de cima com o seu próprio " +
        "cabeçalho, e no destino o processo se inverte, camada por camada, até " +
        "restar o que a aplicação enviou.</p>" +
        '<figure class="figura" id="fig-encapsulamento">' +
        '<svg viewBox="0 0 640 262" role="img" aria-labelledby="fig-encap-titulo">' +
        '<title id="fig-encap-titulo">Os dados da aplicação atravessando quatro ' +
        "camadas, com cada camada acrescentando o seu cabeçalho à esquerda dos dados, " +
        "que permanecem inalterados do topo à base.</title>" +
        '<text class="rotulo-secundario" x="96" y="46" text-anchor="end" font-size="15">Aplicação</text>' +
        '<rect class="caixa-destaque" x="320" y="20" width="280" height="40" rx="6"/>' +
        '<text x="460" y="46" text-anchor="middle" font-size="15">Dados da aplicação</text>' +
        '<text class="rotulo-secundario" x="96" y="104" text-anchor="end" font-size="15">Transporte</text>' +
        '<rect class="caixa" x="250" y="78" width="70" height="40" rx="6"/>' +
        '<text class="rotulo-secundario" x="285" y="103" text-anchor="middle" font-size="12">transporte</text>' +
        '<rect class="caixa-destaque" x="320" y="78" width="280" height="40" rx="6"/>' +
        '<text x="460" y="104" text-anchor="middle" font-size="15">Dados da aplicação</text>' +
        '<text class="rotulo-secundario" x="96" y="162" text-anchor="end" font-size="15">Rede</text>' +
        '<rect class="caixa" x="180" y="136" width="70" height="40" rx="6"/>' +
        '<text class="rotulo-secundario" x="215" y="161" text-anchor="middle" font-size="12">rede</text>' +
        '<rect class="caixa" x="250" y="136" width="70" height="40" rx="6"/>' +
        '<text class="rotulo-secundario" x="285" y="161" text-anchor="middle" font-size="12">transporte</text>' +
        '<rect class="caixa-destaque" x="320" y="136" width="280" height="40" rx="6"/>' +
        '<text x="460" y="162" text-anchor="middle" font-size="15">Dados da aplicação</text>' +
        '<text class="rotulo-secundario" x="96" y="220" text-anchor="end" font-size="15">Enlace</text>' +
        '<rect class="caixa" x="110" y="194" width="70" height="40" rx="6"/>' +
        '<text class="rotulo-secundario" x="145" y="219" text-anchor="middle" font-size="12">enlace</text>' +
        '<rect class="caixa" x="180" y="194" width="70" height="40" rx="6"/>' +
        '<text class="rotulo-secundario" x="215" y="219" text-anchor="middle" font-size="12">rede</text>' +
        '<rect class="caixa" x="250" y="194" width="70" height="40" rx="6"/>' +
        '<text class="rotulo-secundario" x="285" y="219" text-anchor="middle" font-size="12">transporte</text>' +
        '<rect class="caixa-destaque" x="320" y="194" width="280" height="40" rx="6"/>' +
        '<text x="460" y="220" text-anchor="middle" font-size="15">Dados da aplicação</text>' +
        '<text class="rotulo-secundario" x="320" y="252" text-anchor="middle" font-size="13">' +
        "No remetente, de cima para baixo. No destino, o caminho inverso.</text>" +
        "</svg>" +
        "<figcaption>Cada cabeçalho novo entra à esquerda e nada é retirado no " +
        "caminho, então o pacote que trafega no enlace carrega três cabeçalhos além " +
        "dos dados. É essa acumulação que explica o custo do empilhamento.</figcaption>" +
        "</figure>" +
        "<p>O modelo de referência para interconexão de sistemas abertos (OSI) " +
        "organiza sete camadas. A física transmite bits; a de enlace forma quadros; " +
        "a de rede encaminha pacotes; a de transporte atende aos processos. Sessão, " +
        "apresentação e aplicação completam a pilha. A Internet não implementa " +
        "sessão e apresentação como camadas separadas, e as duas acabam absorvidas " +
        "pela aplicação ou pelo middleware.</p>" +
        "<p>O empilhamento simplifica o projeto, mas cobra por isso. Transmitir " +
        "através de N camadas envolve N transferências de controle e N cópias dos " +
        "dados, e é por essa razão que a taxa de transferência vista pela aplicação " +
        "fica bem abaixo da taxa anunciada pela rede.</p>" +
        "<p>Na camada de transporte, as mensagens não são endereçadas ao computador, " +
        "e sim a <strong>portas</strong>, que são pontos de destino ligados a " +
        "processos. Um endereço de transporte completo soma o endereço de rede do " +
        "host ao número da porta, e os serviços mais conhecidos usam portas " +
        "bem conhecidas, como a porta 80 do HTTP.</p>" +
        "<p>Na camada de rede há duas estratégias de entrega, e a diferença entre " +
        "elas é o que se decide antes de o primeiro dado partir. Na entrega por " +
        "<strong>datagramas</strong>, cada pacote é roteado de forma independente e " +
        "não há nenhuma configuração prévia, que é como funcionam o IP e a Ethernet. " +
        "Nos <strong>circuitos virtuais</strong>, um caminho é montado antes e os " +
        "pacotes passam a carregar apenas o número do circuito, que é a estratégia " +
        "do ATM.</p>" +
        "<h3>Roteamento</h3>" +
        "<p>Em qualquer rede maior que um segmento local, entregar um pacote é tarefa " +
        "coletiva dos roteadores, que o passam adiante em saltos sucessivos. Um " +
        "algoritmo de roteamento tem duas partes com ritmos bem diferentes. A " +
        "primeira decide o próximo salto de cada pacote e precisa ser rápida, porque " +
        "roda na chegada; a segunda mantém o conhecimento da topologia da rede e " +
        "trabalha em segundo plano.</p>" +
        "<p>O algoritmo de <strong>vetor de distância</strong>, de Bellman e Ford, é " +
        "a base do protocolo de informação de roteamento (RIP). Cada roteador guarda " +
        "uma tabela que associa cada destino a um enlace de saída e a um custo em " +
        "saltos.</p>" +
        "<p>Periodicamente, o roteador troca a tabela com os vizinhos e adota as " +
        "rotas melhores que descobrir. Um enlace defeituoso recebe custo infinito, e " +
        "a notícia da falha se propaga de vizinho em vizinho.</p>" +
        "<p>Propagar de vizinho em vizinho é justamente o problema, porque a " +
        "convergência fica lenta. Foi essa lentidão que motivou os algoritmos de " +
        "<strong>estado de enlace</strong>, como o OSPF (Open Shortest Path First), " +
        "em que cada nó mantém um mapa da rede inteira e calcula as rotas ótimas com " +
        "o algoritmo de Dijkstra.</p>" +
        "<p>Nenhum roteador consegue conhecer o mundo inteiro, por maior que seja a " +
        "sua tabela. Para o que a tabela não cobre existe a <strong>rota " +
        "padrão</strong>, uma saída única por onde segue todo pacote cujo destino o " +
        "roteador não reconhece.</p>" +
        "<p>Há ainda um limite que nenhum algoritmo de roteamento resolve, que é o " +
        "<strong>congestionamento</strong>. Quando a carga se aproxima da capacidade, " +
        "as filas crescem, os buffers podem estourar e os pacotes começam a ser " +
        "descartados. As retransmissões resultantes consomem mais recursos e podem " +
        "agravar o problema.</p>" +
        "<p>Em redes de datagramas, o controle de congestionamento é fim-a-fim. O " +
        "remetente reduz o ritmo ao inferir congestionamento por perdas, atrasos ou " +
        "marcações da rede. Esse mecanismo é diferente do controle de fluxo, que " +
        "protege o destinatário e será apresentado na seção seguinte.</p>" +
        "<h3>Interligando redes heterogêneas</h3>" +
        "<p>Unir sub-redes de tecnologias diferentes exige três elementos. O esquema " +
        "de endereçamento unificado é o endereço IP; o formato comum de pacotes vem " +
        "do protocolo IP; os roteadores fazem a interconexão e encaminham cada pacote " +
        "para a rede seguinte.</p>" +
        "<p>No caminho aparecem outros equipamentos, e a diferença entre eles está no " +
        "quanto cada um entende do que repassa. O <strong>hub</strong> repete sinais " +
        "sem ler o quadro. O <strong>comutador</strong> lê endereços de controle de " +
        "acesso ao meio (MAC) e envia o " +
        "quadro apenas pela saída apropriada. A <strong>ponte</strong> também opera " +
        "na camada de enlace e conecta redes locais, inclusive de tipos diferentes.</p>" +
        "<p>Falta ainda o caso em que a rede do meio não fala o mesmo protocolo das " +
        "pontas. A solução é o <strong>tunelamento</strong>, que transporta um " +
        "protocolo encapsulado dentro de outro.</p>" +
        '<figure class="figura" id="fig-tunel">' +
        '<svg viewBox="0 0 640 210" role="img" aria-labelledby="fig-tunel-titulo">' +
        '<title id="fig-tunel-titulo">Duas redes IPv6 ligadas por roteadores através ' +
        "de uma rede IPv4, com o pacote IPv6 viajando dentro de um pacote IPv4 no " +
        "trecho entre os dois roteadores.</title>" +
        '<rect class="caixa-destaque" x="20" y="24" width="110" height="36" rx="6"/>' +
        '<text x="75" y="47" text-anchor="middle" font-size="13">pacote IPv6</text>' +
        '<rect class="caixa" x="235" y="24" width="62" height="36" rx="6"/>' +
        '<text class="rotulo-secundario" x="266" y="47" text-anchor="middle" font-size="11">cab. IPv4</text>' +
        '<rect class="caixa-destaque" x="297" y="24" width="110" height="36" rx="6"/>' +
        '<text x="352" y="47" text-anchor="middle" font-size="13">pacote IPv6</text>' +
        '<rect class="caixa-destaque" x="515" y="24" width="110" height="36" rx="6"/>' +
        '<text x="570" y="47" text-anchor="middle" font-size="13">pacote IPv6</text>' +
        '<path class="traco" stroke-dasharray="4 4" d="M75 60 V120"/>' +
        '<path class="traco" stroke-dasharray="4 4" d="M320 60 V120"/>' +
        '<path class="traco" stroke-dasharray="4 4" d="M570 60 V120"/>' +
        '<rect class="caixa" x="20" y="120" width="110" height="44" rx="6"/>' +
        '<text x="75" y="147" text-anchor="middle" font-size="15">Rede IPv6</text>' +
        '<rect class="caixa" x="170" y="120" width="80" height="44" rx="6"/>' +
        '<text x="210" y="147" text-anchor="middle" font-size="14">Roteador</text>' +
        '<rect class="caixa" x="390" y="120" width="80" height="44" rx="6"/>' +
        '<text x="430" y="147" text-anchor="middle" font-size="14">Roteador</text>' +
        '<rect class="caixa" x="515" y="120" width="110" height="44" rx="6"/>' +
        '<text x="570" y="147" text-anchor="middle" font-size="15">Rede IPv6</text>' +
        '<path class="traco" d="M130 142 H162"/>' +
        '<path class="seta" d="M162 136 L170 142 L162 148 Z"/>' +
        '<path class="traco" d="M250 134 H382"/>' +
        '<path class="traco" d="M250 150 H382"/>' +
        '<path class="seta" d="M382 136 L390 142 L382 148 Z"/>' +
        '<path class="traco" d="M470 142 H507"/>' +
        '<path class="seta" d="M507 136 L515 142 L507 148 Z"/>' +
        '<text class="rotulo-secundario" x="316" y="184" text-anchor="middle" font-size="13">' +
        "túnel através da rede IPv4</text>" +
        "</svg>" +
        "<figcaption>Nas pontas trafega o pacote IPv6 puro. No trecho do meio ele " +
        "ganha um cabeçalho IPv4 e volta a perdê-lo na saída, de modo que as duas " +
        "redes das pontas não percebem a travessia.</figcaption>" +
        "</figure>" +
        "<p>O exemplo mais conhecido é o de pacotes IPv6 atravessando ilhas de IPv4, " +
        "e a propriedade que interessa é a transparência. Quem entra no túnel não " +
        "precisa saber que ele existe.</p>" +
        /* A demo saiu daqui para página própria em 2026-08-07. O cartão fica neste
           ponto porque o aluno acabou de ler encapsulamento, roteamento e túneis,
           que é exatamente o que as cinco etapas cobram. */
        '<a class="lab-card" href="demos/camadas-rede/index.html" ' +
        'target="_blank" rel="noopener">' +
        '<span class="lab-card-eyebrow">Demonstração interativa · 5 etapas · ' +
        "cerca de 12 min</span>" +
        '<span class="lab-card-title">A Viagem do Pacote</span>' +
        '<span class="lab-card-summary">Siga um pacote da origem ao destino, ' +
        "camada por camada. Numa das etapas quem encaminha é você, e é ali que " +
        "fica claro por que o roteador só precisa saber o próximo salto, e não o " +
        "caminho inteiro.</span>" +
        '<span class="lab-card-cta">Abrir a demonstração ↗</span>' +
        "</a>",
      slides: [
        {
          title: "Comutação de pacotes",
          html:
            "<ul>" +
            "<li>Pacotes de destinos diferentes <strong>compartilham os mesmos " +
            "enlaces</strong>. A telefonia antiga reservava um caminho por chamada" +
            "</li>" +
            "<li>A mensagem é dividida por duas razões. O nó aloca buffer de tamanho " +
            "conhecido, e a mensagem longa não monopoliza o canal</li>" +
            "<li>O teto do campo de dados é a <strong>MTU</strong>, de 1.500 bytes na " +
            "Ethernet</li>" +
            "</ul>"
        },
        {
          title: "Os quatro esquemas de comutação",
          ref: "tab-comutacao"
        },
        {
          title: "Protocolo e camadas",
          html:
            "<ul>" +
            "<li>Um <strong>protocolo</strong> fixa duas coisas, a sequência das " +
            "mensagens e o formato dos dados</li>" +
            "<li>Cada camada serve a de cima usando a de baixo</li>" +
            "<li>O <strong>OSI</strong> define sete camadas. A Internet não separa " +
            "sessão e apresentação, que a aplicação absorve</li>" +
            "<li>Empilhar custa. N camadas significam N transferências de controle e " +
            "N cópias, e é por isso que a aplicação vê menos taxa que a rede anuncia" +
            "</li>" +
            "</ul>"
        },
        {
          title: "Encapsulamento, camada por camada",
          ref: "fig-encapsulamento",
          html:
            "<ul>" +
            "<li>Cada camada envolve o que veio de cima com o seu cabeçalho</li>" +
            "<li>Os dados não mudam. O que cresce é o envelope</li>" +
            "</ul>"
        },
        {
          title: "Portas, datagramas e circuitos virtuais",
          html:
            "<ul>" +
            "<li>A camada de transporte endereça <strong>portas</strong>, que são " +
            "pontos ligados a processos, e não o computador</li>" +
            "<li>Endereço de transporte = endereço de rede do host + número da porta " +
            "(o HTTP usa a 80)</li>" +
            "<li>No <strong>datagrama</strong>, cada pacote é roteado sozinho, sem " +
            "configuração prévia. É o IP e é a Ethernet</li>" +
            "<li>No <strong>circuito virtual</strong>, o caminho é montado antes e o " +
            "pacote carrega só o número do circuito. É o ATM</li>" +
            "</ul>"
        },
        {
          title: "Roteamento e congestionamento",
          html:
            "<ul>" +
            "<li>O algoritmo tem duas partes. Decidir o próximo salto é rápido e roda " +
            "na chegada; manter a topologia roda em segundo plano</li>" +
            "<li><strong>Vetor de distância</strong> (RIP) troca a tabela com os " +
            "vizinhos. Simples, porém de convergência lenta</li>" +
            "<li><strong>Estado de enlace</strong> (OSPF) dá a cada nó o mapa da rede " +
            "e calcula a rota ótima com Dijkstra</li>" +
            "<li>A <strong>rota padrão</strong> cobre o que a tabela não conhece</li>" +
            "<li>Quando a carga se aproxima da capacidade, as filas crescem e os " +
            "buffers podem descartar pacotes</li>" +
            "<li>O controle de congestionamento reduz o ritmo na origem. O controle " +
            "de fluxo protege o destinatário</li>" +
            "</ul>"
        },
        {
          title: "Interligar redes de tecnologias diferentes",
          html:
            "<ul>" +
            "<li>O endereço IP identifica, o protocolo IP padroniza o pacote e o " +
            "roteador encaminha entre redes</li>" +
            "<li>O <strong>hub</strong> repete sinais, o <strong>comutador</strong> lê " +
            "endereços MAC e a <strong>ponte</strong> conecta redes na camada de " +
            "enlace</li>" +
            "<li>O <strong>tunelamento</strong> resolve o caso em que a rede do meio " +
            "não fala o protocolo das pontas</li>" +
            "</ul>"
        },
        {
          title: "O túnel, por dentro",
          ref: "fig-tunel"
        }
      ]
    },
    {
      title: "Protocolos Internet: IP, TCP, UDP e a infraestrutura",
      html:
        "<p>A pilha TCP/IP nasceu na rede da agência norte-americana de projetos de " +
        "pesquisa avançada (ARPANET) e hoje é quase universal em sistemas " +
        "distribuídos. O segredo dela " +
        "é a independência em relação à tecnologia de transmissão. A aplicação " +
        "enxerga uma única rede IP virtual, e por baixo os datagramas IP viajam " +
        "encapsulados nos quadros de qualquer rede real, seja Ethernet, WiFi, modo de " +
        "transferência assíncrona (ATM) ou " +
        "uma linha serial com o PPP (Point-to-Point Protocol).</p>" +
        "<p>Essa independência é o mesmo encapsulamento da seção anterior aplicado " +
        "em escala planetária. Trocar a rede física de um trecho do caminho não " +
        "obriga a mudar nada na aplicação, e é isso que permitiu à Internet crescer " +
        "absorvendo tecnologias que ainda nem existiam quando ela foi projetada.</p>" +
        "<h3>IP, a entrega de melhor esforço</h3>" +
        "<p>O IP transmite datagramas de até 64 KB com semântica de <strong>melhor " +
        "esforço</strong> (best effort), que é uma promessa mais fraca do que o nome " +
        "sugere. Ele tenta entregar, e só. Um datagrama pode ser perdido, duplicado, " +
        "retardado ou entregue fora de ordem, e nada no protocolo avisa quando isso " +
        "acontece.</p>" +
        "<p>A soma de verificação do IP cobre apenas o cabeçalho, e não os dados. " +
        "Validar o conteúdo fica por conta do protocolo de controle de transmissão " +
        "(TCP) e do protocolo de datagrama de usuário (UDP). Essa divisão aplica o princípio " +
        "fim-a-fim do Tópico 2 em forma de decisão de engenharia. Verificar os dados " +
        "em cada salto custaria caro e ainda assim não dispensaria a verificação nas " +
        "pontas.</p>" +
        "<p>No IPv4, quando um datagrama é maior que a MTU da rede que ele precisa " +
        "atravessar, ele pode ser fragmentado. Os fragmentos são remontados no " +
        "destino.</p>" +
        "<p>Na fronteira com a rede física, o protocolo de resolução de endereços " +
        "(ARP) traduz o endereço IP para o endereço físico da interface. Para isso, " +
        "ele pergunta em broadcast na rede local quem tem determinado IP e guarda as " +
        "respostas em cache.</p>" +
        "<p>Um alerta fecha o assunto. O endereço de origem de um datagrama não é " +
        "confiável, porque nada impede quem envia de escrever ali o endereço de " +
        "outro. Essa falsificação, o <strong>spoofing</strong> de IP, já alimentou " +
        "ataques de negação de serviço famosos.</p>" +
        "<h3>Endereçamento, da escassez ao IPv6</h3>" +
        "<p>O IPv4 usa endereços de 32 bits, escritos em quatro octetos como " +
        "138.37.94.248, e divide cada endereço em um identificador de rede e um " +
        "identificador de host. Originalmente a divisão seguia classes fixas, as " +
        "classes A, B e C, mais a classe D para multicast.</p>" +
        "<p>Quatro bilhões de endereços pareciam bastar, mas a alocação por classes " +
        "desperdiçava faixas inteiras, e por volta de 1990 o esgotamento já tinha " +
        "prazo marcado. Três medidas responderam a ele, e as três continuam " +
        "convivendo até hoje.</p>" +
        '<div class="tabela-rolagem">' +
        '<table class="tabela-conteudo" id="tab-esgotamento">' +
        "<tr><th>Medida</th><th>O que ela faz</th><th>O que ela resolve e o que " +
        "deixa em aberto</th></tr>" +
        "<tr><td>Roteamento entre domínios sem classes (CIDR)</td>" +
        "<td>Uma máscara na tabela de roteamento permite que a divisão entre rede e " +
        "host caia em qualquer ponto do endereço. A notação /29 indica 29 bits de " +
        "rede.</td>" +
        "<td>A alocação deixa de desperdiçar faixas inteiras, mas o número total de " +
        "endereços continua o mesmo.</td></tr>" +
        "<tr><td>Tradução de endereços de rede (NAT)</td>" +
        "<td>Uma rede inteira com endereços privados, distribuídos pelo protocolo de " +
        "configuração dinâmica de hosts (DHCP), compartilha um único IP registrado, " +
        "e o roteador cuida sozinho de manter as conversas separadas.</td>" +
        "<td>Funciona muito bem para clientes. Expor um servidor interno exige " +
        "configuração manual, porque de fora não há como iniciar a conversa.</td></tr>" +
        "<tr><td>IPv6</td>" +
        "<td>Endereços de 128 bits, o que dá cerca de 3 × 10³⁸ endereços. A classe de " +
        "tráfego permite distinguir prioridades, e o rótulo de fluxo identifica " +
        "pacotes que pedem o mesmo tratamento. O multicast entrega a um grupo. O " +
        "anycast entrega a um só membro do grupo, escolhido pela métrica de " +
        "roteamento. O protocolo também admite segurança no nível IP.</td>" +
        "<td>Resolve o problema de vez, mas a migração tem sido lenta justamente " +
        "porque as duas medidas anteriores aliviaram a pressão.</td></tr>" +
        "</table></div>" +
        "<p>A tradução é a medida mais fácil de encontrar em funcionamento, porque " +
        "está em praticamente todo roteador doméstico. O mecanismo cabe em uma " +
        "ideia. Ao encaminhar para fora a mensagem de um computador interno, o " +
        "roteador substitui o endereço e a porta de origem pelos seus próprios. A " +
        "porta escolhida é a chave, porque fica anotada numa tabela ao lado do " +
        "computador e da porta que a originaram.</p>" +
        '<figure class="figura" id="fig-nat">' +
        '<svg viewBox="0 0 640 268" role="img" aria-labelledby="fig-nat-titulo">' +
        '<title id="fig-nat-titulo">Uma mensagem saindo de um computador interno ' +
        "para um servidor na Internet e a resposta voltando, com o roteador NAT " +
        "trocando o endereço e a porta de origem na saída e restaurando o destino " +
        "na volta pela consulta à sua tabela de tradução.</title>" +
        '<text class="rotulo-secundario" x="320" y="22" text-anchor="middle" font-size="13">' +
        "Na saída, o roteador troca a origem</text>" +
        '<text x="184" y="52" text-anchor="middle" font-size="12">origem 10.0.0.5 porta 5000</text>' +
        '<text class="rotulo-secundario" x="184" y="68" text-anchor="middle" font-size="12">destino 198.51.100.9 porta 80</text>' +
        '<text x="460" y="52" text-anchor="middle" font-size="12">origem 203.0.113.7 porta 40001</text>' +
        '<text class="rotulo-secundario" x="460" y="68" text-anchor="middle" font-size="12">destino 198.51.100.9 porta 80</text>' +
        '<rect class="caixa" x="8" y="88" width="112" height="64" rx="6"/>' +
        '<text x="64" y="116" text-anchor="middle" font-size="13">Host interno</text>' +
        '<text class="rotulo-secundario" x="64" y="132" text-anchor="middle" font-size="12">10.0.0.5</text>' +
        '<rect class="caixa-destaque" x="248" y="88" width="152" height="64" rx="6"/>' +
        '<text x="324" y="116" text-anchor="middle" font-size="13">Roteador NAT</text>' +
        '<text class="rotulo-secundario" x="324" y="132" text-anchor="middle" font-size="12">203.0.113.7</text>' +
        '<rect class="caixa" x="520" y="88" width="112" height="64" rx="6"/>' +
        '<text x="576" y="116" text-anchor="middle" font-size="13">Servidor</text>' +
        '<text class="rotulo-secundario" x="576" y="132" text-anchor="middle" font-size="12">198.51.100.9</text>' +
        '<path class="traco" d="M120 104 H240"/>' +
        '<path class="seta" d="M240 98 L248 104 L240 110 Z"/>' +
        '<path class="traco" d="M400 104 H512"/>' +
        '<path class="seta" d="M512 98 L520 104 L512 110 Z"/>' +
        '<path class="traco" d="M248 136 H128"/>' +
        '<path class="seta" d="M128 130 L120 136 L128 142 Z"/>' +
        '<path class="traco" d="M520 136 H408"/>' +
        '<path class="seta" d="M408 130 L400 136 L408 142 Z"/>' +
        '<text x="184" y="172" text-anchor="middle" font-size="12">destino 10.0.0.5 porta 5000</text>' +
        '<text class="rotulo-secundario" x="184" y="188" text-anchor="middle" font-size="12">origem 198.51.100.9 porta 80</text>' +
        '<text x="460" y="172" text-anchor="middle" font-size="12">destino 203.0.113.7 porta 40001</text>' +
        '<text class="rotulo-secundario" x="460" y="188" text-anchor="middle" font-size="12">origem 198.51.100.9 porta 80</text>' +
        '<text class="rotulo-secundario" x="320" y="214" text-anchor="middle" font-size="13">' +
        "Na volta, a porta de destino acha a linha da tabela</text>" +
        '<rect class="caixa" x="178" y="228" width="118" height="30" rx="6"/>' +
        '<text x="237" y="248" text-anchor="middle" font-size="12">porta 40001</text>' +
        '<path class="traco" d="M296 243 H318"/>' +
        '<path class="seta" d="M318 237 L326 243 L318 249 Z"/>' +
        '<rect class="caixa-destaque" x="326" y="228" width="142" height="30" rx="6"/>' +
        '<text x="397" y="248" text-anchor="middle" font-size="12">10.0.0.5 porta 5000</text>' +
        "</svg>" +
        "<figcaption>O endereço interno nunca aparece na Internet, e é a porta " +
        "escolhida na saída que devolve o pacote ao computador certo. Uma porta por " +
        "conversa é o que permite a rede inteira caber em um endereço.</figcaption>" +
        "</figure>" +
        "<p>A resposta que volta de fora traz essa porta como destino, e é por ela " +
        "que o roteador encontra a linha certa da tabela e reescreve o endereço " +
        "antes de entregar. As duas pontas nunca percebem a troca. É essa " +
        "dependência da tabela que explica a limitação já registrada, porque a " +
        "linha nasce quando a mensagem sai e não existe antes disso, de modo que " +
        "ninguém de fora consegue iniciar a conversa.</p>" +
        "<p>O IPv6 responde de outro modo, e o tamanho do número é difícil de " +
        "imaginar. Mesmo nas estimativas pessimistas ele oferece mil endereços por " +
        "metro quadrado da superfície do planeta. A migração foi planejada por " +
        "túneis sobre IPv4, exatamente como a figura da seção anterior mostra. O " +
        "aumento do número de dispositivos móveis tornou a migração inevitável.</p>" +
        "<p>Um problema aparentado é o do computador que se move sem querer trocar de " +
        "endereço. O <strong>MobileIP</strong> resolve com dois agentes. Um agente " +
        "doméstico, na rede de origem, recebe os datagramas destinados ao host e os " +
        "entrega por túnel ao agente estrangeiro da rede onde ele está agora. Esse " +
        "agente fornece um <strong>\"endereço aos cuidados de\"</strong>, que localiza " +
        "temporariamente o host. A solução mantém o endereço de origem, mas cria um " +
        "caminho triangular e pode aumentar a latência. A telefonia celular resolve " +
        "um problema equivalente de forma nativa.</p>" +
        "<h3>TCP e UDP, os dois transportes</h3>" +
        "<p>Enquanto o IP liga computadores, o TCP e o protocolo de datagrama de " +
        "usuário (UDP) ligam processos, por meio das portas. Os dois ocupam a mesma " +
        "camada e oferecem serviços opostos.</p>" +
        '<div class="tabela-rolagem">' +
        '<table class="tabela-conteudo" id="tab-tcp-udp">' +
        "<tr><th>Dimensão</th><th>UDP</th><th>TCP</th></tr>" +
        "<tr><td>Conexão</td><td>Não existe. Cada datagrama viaja sozinho.</td>" +
        "<td>É orientado a conexão e entrega um fluxo de bytes.</td></tr>" +
        "<tr><td>Ordem</td><td>Não há nenhuma garantia.</td>" +
        "<td>Os segmentos são numerados e entregues à aplicação na ordem certa.</td></tr>" +
        "<tr><td>Perdas</td><td>Não há confirmação nem retransmissão.</td>" +
        "<td>O segmento não confirmado dentro do prazo é reenviado.</td></tr>" +
        "<tr><td>Controle de fluxo</td><td>Não há janela anunciada pelo receptor.</td>" +
        "<td>Cada confirmação carrega uma janela, que diz quanto o remetente pode " +
        "enviar antes da próxima. Esse mecanismo protege o receptor.</td></tr>" +
        "<tr><td>Congestionamento</td><td>Não há controle incorporado.</td>" +
        "<td>O remetente ajusta o ritmo quando infere congestionamento por perdas, " +
        "atrasos ou marcações da rede. Esse mecanismo protege o caminho.</td></tr>" +
        "<tr><td>Verificação</td><td>A soma de verificação é opcional.</td>" +
        "<td>A soma de verificação cobre o cabeçalho e os dados.</td></tr>" +
        "<tr><td>Para quem serve</td><td>Para quem tolera perdas e quer o custo " +
        "mínimo.</td>" +
        "<td>Para quem precisa de garantias e aceita pagar por elas.</td></tr>" +
        "</table></div>" +
        "<p>Resumindo a tabela em uma frase, o UDP é quase um IP com portas, e o TCP " +
        "é o que se constrói em cima do IP quando a aplicação não quer tratar de " +
        "perda, de ordem nem de ritmo.</p>" +
        "<h3>DNS, nomes em vez de números</h3>" +
        "<p>Pessoas usam nomes de domínio hierárquicos, como www.ifsp.edu.br, e a " +
        "comunicação exige endereços IP. O DNS faz essa conversão com servidores de " +
        "nomes distribuídos, cada um responsável pela sua parte da hierarquia. Na " +
        "navegação iterativa, cada servidor responde o que sabe ou indica o próximo " +
        "servidor, enquanto o resolvedor percorre a cadeia.</p>" +
        "<p>O detalhe que sustenta o serviço inteiro é o cache. Cada servidor guarda " +
        "as respostas que obteve, e sem isso os servidores-raiz seriam o gargalo de " +
        "toda a Internet, já que qualquer consulta começaria neles.</p>" +
        "<h3>Firewalls e VPNs</h3>" +
        "<p>Em uma intranet grande sempre haverá algum software vulnerável, e " +
        "esperar que não haja não é uma estratégia. O <strong>firewall</strong> " +
        "parte dessa constatação e monitora toda a comunicação que entra e sai, " +
        "aplicando a política de segurança da organização em até três níveis.</p>" +
        "<p>A filtragem de datagramas examina endereços, portas e o tipo de serviço. " +
        "O gateway TCP valida a conexão e os segmentos. O gateway de aplicação usa " +
        "um proxy para examinar o conteúdo compreendido por uma aplicação.</p>" +
        '<figure class="figura" id="fig-firewall">' +
        '<svg viewBox="0 0 640 190" role="img" aria-labelledby="fig-firewall-titulo">' +
        '<title id="fig-firewall-titulo">Três níveis de firewall em sequência entre a ' +
        "Internet e a intranet, cada um examinando uma parte mais profunda do pacote, " +
        "da filtragem de datagramas ao gateway de aplicação.</title>" +
        '<rect class="caixa" x="8" y="46" width="76" height="48" rx="6"/>' +
        '<text x="46" y="76" text-anchor="middle" font-size="14">Internet</text>' +
        '<path class="traco" d="M84 70 H102"/>' +
        '<path class="seta" d="M102 64 L110 70 L102 76 Z"/>' +
        '<rect class="caixa-destaque" x="110" y="46" width="140" height="48" rx="6"/>' +
        '<text x="180" y="68" text-anchor="middle" font-size="13">Filtragem de</text>' +
        '<text x="180" y="85" text-anchor="middle" font-size="13">datagramas IP</text>' +
        '<path class="traco" d="M250 70 H260"/>' +
        '<path class="seta" d="M260 64 L268 70 L260 76 Z"/>' +
        '<rect class="caixa-destaque" x="268" y="46" width="120" height="48" rx="6"/>' +
        '<text x="328" y="76" text-anchor="middle" font-size="13">Gateway TCP</text>' +
        '<path class="traco" d="M388 70 H398"/>' +
        '<path class="seta" d="M398 64 L406 70 L398 76 Z"/>' +
        '<rect class="caixa-destaque" x="406" y="46" width="150" height="48" rx="6"/>' +
        '<text x="481" y="68" text-anchor="middle" font-size="13">Gateway de</text>' +
        '<text x="481" y="85" text-anchor="middle" font-size="13">aplicação</text>' +
        '<path class="traco" d="M556 70 H566"/>' +
        '<path class="seta" d="M566 64 L574 70 L566 76 Z"/>' +
        '<rect class="caixa" x="574" y="46" width="58" height="48" rx="6"/>' +
        '<text x="603" y="76" text-anchor="middle" font-size="14">Intranet</text>' +
        '<text class="rotulo-secundario" x="180" y="122" text-anchor="middle" font-size="12">examina endereço, porta</text>' +
        '<text class="rotulo-secundario" x="180" y="139" text-anchor="middle" font-size="12">e tipo de serviço</text>' +
        '<text class="rotulo-secundario" x="328" y="122" text-anchor="middle" font-size="12">valida a conexão</text>' +
        '<text class="rotulo-secundario" x="328" y="139" text-anchor="middle" font-size="12">e os segmentos</text>' +
        '<text class="rotulo-secundario" x="481" y="122" text-anchor="middle" font-size="12">um proxy examina</text>' +
        '<text class="rotulo-secundario" x="481" y="139" text-anchor="middle" font-size="12">o conteúdo</text>' +
        '<text class="rotulo-secundario" x="320" y="174" text-anchor="middle" font-size="13">' +
        "Da esquerda para a direita, cada nível olha mais fundo no pacote.</text>" +
        "</svg>" +
        "<figcaption>Os três níveis podem ser combinados e correspondem a camadas " +
        "cada vez mais altas da pilha. Quanto mais fundo o firewall precisa olhar, " +
        "mais trabalho ele tem por pacote.</figcaption>" +
        "</figure>" +
        "<p>Os processos do gateway de aplicação costumam rodar em um computador " +
        "dedicado, chamado de <strong>bastião</strong>. Os servidores públicos da " +
        "organização, como o da Web e o de arquivos por FTP (File Transfer Protocol), " +
        "ficam fora da zona protegida, às vezes em uma sub-rede colocada entre dois " +
        "filtros.</p>" +
        "<p>O firewall defende um perímetro, e a VPN faz o oposto, estendendo esse " +
        "perímetro através da Internet pública. Canais cifrados no nível IP, pelo " +
        "protocolo de segurança IP (IPsec), ligam usuários remotos e filiais como se " +
        "todos estivessem dentro da " +
        "rede interna.</p>",
      slides: [
        {
          title: "A pilha TCP/IP e o que ela esconde",
          html:
            "<ul>" +
            "<li>A aplicação enxerga <strong>uma única rede IP virtual</strong></li>" +
            "<li>Por baixo, o datagrama IP viaja encapsulado no quadro de qualquer " +
            "rede real, seja Ethernet, WiFi, ATM ou linha serial</li>" +
            "<li>Trocar a rede física de um trecho não muda nada na aplicação. Foi " +
            "isso que permitiu à Internet absorver tecnologias que não existiam " +
            "quando ela foi projetada</li>" +
            "</ul>"
        },
        {
          title: "IP, entrega de melhor esforço",
          html:
            "<ul>" +
            "<li>Ele tenta entregar, e só. O datagrama pode se perder, duplicar, " +
            "atrasar ou chegar fora de ordem, sem qualquer aviso</li>" +
            "<li>A soma de verificação cobre <strong>só o cabeçalho</strong>. Os " +
            "dados ficam com TCP e UDP, que é o fim-a-fim virando engenharia</li>" +
            "<li>Maior que a MTU, o datagrama é fragmentado e remontado no destino" +
            "</li>" +
            "<li>O <strong>ARP</strong> pergunta em broadcast quem tem um IP e guarda a " +
            "resposta em cache</li>" +
            "<li>O endereço de origem não é confiável. O <strong>spoofing</strong> já " +
            "alimentou ataques de negação de serviço</li>" +
            "</ul>"
        },
        {
          title: "As três respostas ao esgotamento do IPv4",
          ref: "tab-esgotamento"
        },
        {
          title: "O NAT, na saída e na volta",
          ref: "fig-nat"
        },
        {
          title: "Endereços e mobilidade",
          html:
            "<ul>" +
            "<li>O IPv4 tem 32 bits divididos em rede e host, com as classes A, B e C " +
            "e a D para multicast</li>" +
            "<li>Quatro bilhões pareciam bastar, mas as classes desperdiçavam faixas " +
            "inteiras. Por volta de 1990 o esgotamento tinha prazo</li>" +
            "<li>O <strong>MobileIP</strong> usa dois agentes. O doméstico recebe e " +
            "encaminha por túnel ao estrangeiro, onde o host está agora</li>" +
            "<li>É eficaz e pouco eficiente, porque o caminho fica triangular. A " +
            "telefonia celular resolve o mesmo " +
            "problema de forma nativa</li>" +
            "</ul>"
        },
        {
          title: "UDP e TCP, lado a lado",
          ref: "tab-tcp-udp"
        },
        {
          title: "DNS, e por que o cache sustenta tudo",
          html:
            "<ul>" +
            "<li>Servidores de nomes distribuídos, cada um dono da sua parte da " +
            "hierarquia. O resolvedor percorre a cadeia, e cada servidor responde o " +
            "que sabe ou indica o próximo</li>" +
            "<li>Cada um guarda em <strong>cache</strong> o que já resolveu</li>" +
            "<li>Sem o cache, toda consulta começaria na raiz, e os servidores-raiz " +
            "seriam o gargalo da Internet inteira</li>" +
            "</ul>"
        },
        {
          title: "O firewall, nível por nível",
          ref: "fig-firewall",
          html:
            "<ul>" +
            "<li>Em intranet grande, sempre haverá software vulnerável</li>" +
            "<li>O <strong>bastião</strong> é o computador dedicado ao gateway de " +
            "aplicação</li>" +
            "</ul>"
        },
        {
          title: "A VPN, que faz o caminho inverso",
          html:
            "<ul>" +
            "<li>O firewall defende um perímetro. A <strong>VPN</strong> estende esse " +
            "perímetro através da Internet pública</li>" +
            "<li>Canais cifrados no nível IP, pelo <strong>IPsec</strong>, ligam " +
            "usuários remotos e filiais como se estivessem na rede interna</li>" +
            "<li>Servidores públicos, como o da Web, ficam fora da zona protegida, às " +
            "vezes em uma sub-rede entre dois filtros</li>" +
            "</ul>"
        }
      ]
    },
    {
      title: "Estudos de caso: Ethernet, WiFi e Bluetooth",
      html:
        "<p>Os padrões de rede local do Instituto de Engenheiros Eletricistas e " +
        "Eletrônicos (IEEE) dominam a borda da Internet. A seção compara três " +
        "famílias. O IEEE 802.3 especifica a Ethernet. O IEEE 802.11 especifica o " +
        "WiFi. O IEEE 802.15.1 documentou o Bluetooth.</p>" +
        "<p>A família IEEE 802 inclui ainda outros padrões, e o IEEE 802.15.4 atende " +
        "redes de baixa taxa usadas por tecnologias como ZigBee. O IEEE 802.16 foi " +
        "associado ao WiMAX. Esses dois exemplos situam a família, mas não serão " +
        "desenvolvidos nesta seção.</p>" +
        "<p>Os três casos foram escolhidos porque partem do mesmo problema e chegam a " +
        "compromissos de projeto bem diferentes. O problema é sempre o mesmo, ou seja, " +
        "várias estações querem falar por um meio que só comporta uma de cada vez.</p>" +
        "<h3>Ethernet, a disputa educada pelo meio</h3>" +
        "<p>Criada em 1973 no centro de pesquisa da Xerox em Palo Alto (PARC), a " +
        "Ethernet é um barramento de disputa. Todas as estações compartilham o meio e " +
        "escutam continuamente o que passa por ele. Os quadros têm de 64 a 1.518 " +
        "bytes e carregam endereços de controle de acesso ao meio (MAC) de 48 bits, " +
        "que vêm únicos de fábrica.</p>" +
        "<p>A base do método é o acesso múltiplo com detecção de portadora (CSMA), em " +
        "que a estação só começa a transmitir se ouvir o meio livre. A Ethernet " +
        "acrescenta a detecção de colisão, e o método completo, chamado de CSMA/CD, " +
        "combina três mecanismos.</p>" +
        "<ul>" +
        "<li>A <strong>detecção de portadora</strong> impede que uma estação comece a " +
        "transmitir enquanto ouve outra transmissão em curso.</li>" +
        "<li>A <strong>detecção de colisão</strong> compara o que a estação transmite " +
        "com o que ela ouve no meio; quando os dois divergem, houve colisão, e ela " +
        "para de transmitir e emite um sinal de reforço, o jamming, para que todos " +
        "percebam.</li>" +
        "<li>O <strong>back-off</strong> faz cada estação envolvida esperar um tempo " +
        "aleatório antes de tentar de novo, dobrando o limite desse sorteio a cada " +
        "nova colisão, o que evita que as duas voltem a colidir na mesma hora.</li>" +
        "</ul>" +
        "<p>O quadro mínimo de 64 bytes existe por causa desse método. Ele garante que " +
        "a transmissão dure o suficiente para que a colisão seja percebida mesmo entre " +
        "estações nos extremos opostos do cabo.</p>" +
        "<p>A eficiência do arranjo chega a algo entre 80% e 95%, o que é alto. O que " +
        "ele não oferece é garantia de prazo, porque o meio pode estar sempre ocupado " +
        "justamente quando a mensagem fica pronta, e por isso a Ethernet clássica não " +
        "serve a aplicações de tempo real.</p>" +
        '<div class="callout">' +
        '<p class="callout-title">💡 Por que a Ethernet comutada mudou o jogo</p>' +
        "<p>Com comutadores no lugar dos hubs, cada host passa a ter o seu próprio " +
        "segmento e só recebe os quadros endereçados a ele; sem disputa pelo meio, " +
        "some a espera imprevisível do back-off e a eficiência sobe muito. A latência " +
        "deixa de depender da sorte no acesso ao meio, mas continua variando com as " +
        "filas do comutador. Essa mudança aproximou a Ethernet das aplicações de " +
        "tempo real e ajudou a substituir concorrentes como o token ring.</p>" +
        "</div>" +
        "<h3>WiFi, quando não dá para detectar a colisão</h3>" +
        "<p>O WiFi leva o princípio da Ethernet para o rádio. O estudo histórico da " +
        "fonte usa a geração IEEE 802.11g, que opera em 2,4 GHz e anuncia até 54 Mbps. " +
        "Gerações posteriores passaram a usar também 5 e 6 GHz e elevaram as taxas " +
        "nominais para centenas de megabits ou alguns gigabits por segundo. O alcance " +
        "real depende da faixa, dos obstáculos e da potência.</p>" +
        "<p>O WiFi funciona em duas configurações. Na de infraestrutura, uma " +
        "estação-base serve de ponto de acesso à rede cabeada. Na ad hoc, os " +
        "dispositivos se detectam e formam a rede sem intermediário.</p>" +
        "<p>A mudança de meio quebra o componente central do método da Ethernet, pois no rádio a " +
        "intensidade do sinal varia muito pelo espaço, e a detecção de colisão falha " +
        "por três motivos independentes.</p>" +
        "<ul>" +
        "<li>Nas <strong>estações ocultas</strong>, um obstáculo esconde de uma " +
        "estação o transmissor ativo, fazendo-a concluir que o meio está livre " +
        "quando não está.</li>" +
        "<li>No <strong>desvanecimento</strong>, o sinal enfraquece com o quadrado da " +
        "distância, e a estação distante simplesmente não é ouvida.</li>" +
        "<li>No <strong>mascaramento</strong>, o próprio sinal da estação, muito mais " +
        "forte, abafa o sinal remoto, e o transmissor nunca ouve a colisão que ele " +
        "mesmo causou.</li>" +
        "</ul>" +
        "<p>Como detectar não funciona, a resposta é prevenir, e o método passa a se " +
        "chamar CSMA/CA, com as duas últimas letras vindas de evitar a colisão (CA). " +
        "Em vez de escutar e torcer, a estação reserva o meio antes de transmitir. " +
        "Ela troca com o destino dois quadros curtos, um de pedido para transmitir " +
        "(RTS) e outro de liberação para transmitir (CTS). Quem ouvir qualquer um " +
        "dos dois fica calado pelo período que o quadro anuncia.</p>" +
        "<p>São dois quadros, e não um, por causa justamente da estação oculta. A " +
        "figura acompanha uma reserva do começo ao fim, com duas outras estações " +
        "ouvindo de posições diferentes.</p>" +
        '<figure class="figura" id="fig-rts-cts">' +
        '<svg viewBox="0 0 640 292" role="img" aria-labelledby="fig-rts-cts-titulo">' +
        '<title id="fig-rts-cts-titulo">Diagrama de sequência com quatro linhas de ' +
        "vida, de uma estação vizinha de A, da estação A, do destino B e de uma " +
        "estação oculta de A. A envia o pedido para transmitir, que a vizinha " +
        "também ouve, B responde a liberação, que a oculta ouve, as duas se calam " +
        "pelo período anunciado, e só então A envia os dados e recebe a " +
        "confirmação.</title>" +
        '<rect class="caixa" x="13" y="8" width="130" height="34" rx="8"/>' +
        '<text x="78" y="30" text-anchor="middle" font-size="14">Vizinha de A</text>' +
        '<rect class="caixa-destaque" x="179" y="8" width="130" height="34" rx="8"/>' +
        '<text x="244" y="30" text-anchor="middle" font-size="14">Estação A</text>' +
        '<rect class="caixa" x="345" y="8" width="130" height="34" rx="8"/>' +
        '<text x="410" y="30" text-anchor="middle" font-size="14">Destino B</text>' +
        '<rect class="caixa" x="501" y="8" width="130" height="34" rx="8"/>' +
        '<text x="566" y="30" text-anchor="middle" font-size="14">Oculta de A</text>' +
        '<path class="traco" stroke-dasharray="4 5" d="M78 46 L78 258"/>' +
        '<path class="traco" stroke-dasharray="4 5" d="M244 46 L244 258"/>' +
        '<path class="traco" stroke-dasharray="4 5" d="M410 46 L410 258"/>' +
        '<path class="traco" stroke-dasharray="4 5" d="M566 46 L566 258"/>' +
        '<text class="rotulo-secundario" x="327" y="66" text-anchor="middle" font-size="13">RTS</text>' +
        '<path class="traco" d="M244 76 L398 76"/>' +
        '<path class="seta" d="M398 70 L398 82 L410 76 Z"/>' +
        '<text class="rotulo-secundario" x="161" y="66" text-anchor="middle" font-size="13">também ouve</text>' +
        '<path class="traco" stroke-dasharray="3 4" d="M244 76 L90 76"/>' +
        '<path class="seta" d="M90 70 L90 82 L78 76 Z"/>' +
        '<text class="rotulo-secundario" x="327" y="108" text-anchor="middle" font-size="13">CTS</text>' +
        '<path class="traco" d="M410 118 L256 118"/>' +
        '<path class="seta" d="M256 112 L256 124 L244 118 Z"/>' +
        '<text class="rotulo-secundario" x="488" y="108" text-anchor="middle" font-size="13">também ouve</text>' +
        '<path class="traco" stroke-dasharray="3 4" d="M410 118 L554 118"/>' +
        '<path class="seta" d="M554 112 L554 124 L566 118 Z"/>' +
        '<rect class="caixa" x="38" y="88" width="80" height="162" rx="6"/>' +
        '<text class="rotulo-secundario" x="78" y="173" text-anchor="middle" font-size="12">silêncio</text>' +
        '<rect class="caixa" x="526" y="130" width="80" height="120" rx="6"/>' +
        '<text class="rotulo-secundario" x="566" y="194" text-anchor="middle" font-size="12">silêncio</text>' +
        '<text class="rotulo-secundario" x="327" y="170" text-anchor="middle" font-size="13">dados</text>' +
        '<path class="traco" d="M244 180 L398 180"/>' +
        '<path class="seta" d="M398 174 L398 186 L410 180 Z"/>' +
        '<text class="rotulo-secundario" x="327" y="212" text-anchor="middle" font-size="13">confirmação</text>' +
        '<path class="traco" d="M410 222 L256 222"/>' +
        '<path class="seta" d="M256 216 L256 228 L244 222 Z"/>' +
        '<text class="rotulo-secundario" x="320" y="278" text-anchor="middle" font-size="13">' +
        "O tempo corre de cima para baixo.</text>" +
        "</svg>" +
        "<figcaption>O RTS cala quem está perto de quem transmite, e o CTS cala " +
        "quem está perto de quem recebe. Uma estação oculta só é alcançada pelo " +
        "segundo, e é isso que justifica haver dois.</figcaption>" +
        "</figure>" +
        "<p>A vizinha de A escuta o pedido e já se cala. A oculta de A não escuta " +
        "coisa alguma vinda de A, que é o que a define, e precisaria de uma segunda " +
        "mensagem para saber que o meio está reservado. O CTS é essa segunda " +
        "mensagem, e quem a transmite é o destino, que alcança as duas. A recepção " +
        "passa a " +
        "ser confirmada quadro a quadro, porque sem detecção de colisão o remetente " +
        "não tem outro jeito de saber que o quadro chegou.</p>" +
        "<p>A segurança do WiFi nasceu mal. O esquema original, a privacidade " +
        "equivalente à do cabo (WEP), tinha falhas de projeto. O Wi-Fi Protected " +
        "Access 2 (WPA2) e o Wi-Fi Protected Access 3 (WPA3) assumiram a proteção das " +
        "redes atuais.</p>" +
        "<h3>Bluetooth, a rede que cabe no bolso</h3>" +
        "<p>O Bluetooth foi projetado para ligar fones, telefones e acessórios com " +
        "hardware de custo mínimo, com a meta declarada de 5 dólares por dispositivo, " +
        "e com consumo baixíssimo; ele opera a cerca de 1 mW, o que lhe dá alcance de " +
        "10 metros.</p>" +
        "<p>Os nós se associam dinamicamente em <strong>piconets</strong>. Na " +
        "terminologia atual, cada piconet tem um dispositivo central e até sete " +
        "periféricos ativos, além de dispositivos estacionados em modo de baixa " +
        "energia. Quando um nó participa de duas piconets, ele funciona como ponte " +
        "entre elas e forma uma <strong>scatternet</strong>.</p>" +
        '<figure class="figura" id="fig-piconet">' +
        '<svg viewBox="0 0 640 250" role="img" aria-labelledby="fig-piconet-titulo">' +
        '<title id="fig-piconet-titulo">Duas piconets, cada uma com um dispositivo central e três ' +
        "periféricos, ligadas entre si por um nó-ponte que participa das duas e forma " +
        "uma scatternet.</title>" +
        '<path class="traco" d="M135 120 L45 55"/>' +
        '<path class="traco" d="M135 120 L45 185"/>' +
        '<path class="traco" d="M135 120 L150 40"/>' +
        '<path class="traco" d="M135 120 H320"/>' +
        '<path class="traco" d="M320 120 H505"/>' +
        '<path class="traco" d="M505 120 L595 55"/>' +
        '<path class="traco" d="M505 120 L595 185"/>' +
        '<path class="traco" d="M505 120 L490 40"/>' +
        '<circle class="caixa" cx="45" cy="55" r="24"/>' +
        '<text class="rotulo-secundario" x="45" y="59" text-anchor="middle" font-size="11">periférico</text>' +
        '<circle class="caixa" cx="45" cy="185" r="24"/>' +
        '<text class="rotulo-secundario" x="45" y="189" text-anchor="middle" font-size="11">periférico</text>' +
        '<circle class="caixa" cx="150" cy="40" r="24"/>' +
        '<text class="rotulo-secundario" x="150" y="44" text-anchor="middle" font-size="11">periférico</text>' +
        '<circle class="caixa-destaque" cx="135" cy="120" r="30"/>' +
        '<text x="135" y="125" text-anchor="middle" font-size="13">central</text>' +
        '<circle class="caixa" cx="595" cy="55" r="24"/>' +
        '<text class="rotulo-secundario" x="595" y="59" text-anchor="middle" font-size="11">periférico</text>' +
        '<circle class="caixa" cx="595" cy="185" r="24"/>' +
        '<text class="rotulo-secundario" x="595" y="189" text-anchor="middle" font-size="11">periférico</text>' +
        '<circle class="caixa" cx="490" cy="40" r="24"/>' +
        '<text class="rotulo-secundario" x="490" y="44" text-anchor="middle" font-size="11">periférico</text>' +
        '<circle class="caixa-destaque" cx="505" cy="120" r="30"/>' +
        '<text x="505" y="125" text-anchor="middle" font-size="13">central</text>' +
        '<circle class="caixa" cx="320" cy="120" r="27"/>' +
        '<text x="320" y="125" text-anchor="middle" font-size="12">ponte</text>' +
        '<text class="rotulo-secundario" x="135" y="228" text-anchor="middle" font-size="13">piconet</text>' +
        '<text class="rotulo-secundario" x="505" y="228" text-anchor="middle" font-size="13">piconet</text>' +
        "</svg>" +
        "<figcaption>Cada piconet tem um dispositivo central. O nó do meio pertence às duas ao " +
        "mesmo tempo, e é essa participação dupla que costura as piconets em uma " +
        "scatternet.</figcaption>" +
        "</figure>" +
        "<p>Dois tipos de enlace atendem aos dois usos previstos. O enlace síncrono " +
        "orientado a conexão (SCO) serve à voz em tempo real, e cada bit é transmitido " +
        "em triplicata sem nenhuma retransmissão, pela razão de que dado atrasado é " +
        "dado inútil numa conversa. O enlace assíncrono sem conexão (ACL) serve aos " +
        "dados, nos quais a integridade e a retransmissão têm prioridade sobre a " +
        "entrega imediata.</p>" +
        "<p>A versão 1.1 alcança 1 Mbps por piconet, e a 2.0 chega a 3 Mbps; o " +
        "calcanhar de Aquiles está na entrada, porque associar um dispositivo novo " +
        "pode levar até 10 segundos, o que inviabiliza usos como pagar pedágio em " +
        "movimento.</p>" +
        "<h3>Os três lado a lado</h3>" +
        "<p>Comparar os três pelas mesmas dimensões mostra que nenhum é melhor, e sim " +
        "que cada um otimizou o que o seu uso exigia.</p>" +
        '<div class="tabela-rolagem">' +
        '<table class="tabela-conteudo" id="tab-padroes">' +
        "<tr><th>Dimensão</th><th>Ethernet (IEEE 802.3)</th><th>WiFi (IEEE 802.11)</th>" +
        "<th>Bluetooth (IEEE 802.15.1)</th></tr>" +
        "<tr><td>Alcance</td><td>Um segmento de rede local.</td>" +
        "<td>Depende da faixa, dos obstáculos e da potência.</td><td>Cerca de 10 metros " +
        "no cenário histórico estudado.</td></tr>" +
        "<tr><td>Exemplo histórico de taxa na fonte</td><td>De 10 Mbps a 10 Gbps.</td>" +
        "<td>Até 54 Mbps no IEEE 802.11g.</td>" +
        "<td>1 Mbps na versão 1.1 e 3 Mbps na 2.0.</td></tr>" +
        "<tr><td>Acesso ao meio</td>" +
        "<td>CSMA/CD, que percebe a colisão depois que ela acontece.</td>" +
        "<td>CSMA/CA, que reserva o meio antes de transmitir.</td>" +
        "<td>Associação em piconet, com um central e até sete periféricos ativos.</td></tr>" +
        "<tr><td>O que o projeto priorizou</td>" +
        "<td>A eficiência no meio compartilhado, que fica entre 80% e 95%.</td>" +
        "<td>Funcionar sem fio, aceitando não conseguir detectar a colisão.</td>" +
        "<td>O custo mínimo, com meta histórica de 5 dólares, e o consumo " +
        "baixíssimo.</td></tr>" +
        "</table></div>" +
        "<p>Para um sistema distribuído, a escolha do enlace aparece como latência, " +
        "taxa útil, perdas, consumo de energia e alcance. O protocolo da aplicação " +
        "precisa tolerar as propriedades do meio escolhido. Ethernet, WiFi e " +
        "Bluetooth não são apenas formas de conectar máquinas, pois impõem " +
        "compromissos diferentes ao software.</p>",
      slides: [
        {
          title: "Três padrões, três compromissos",
          html:
            "<ul>" +
            "<li>Os padrões IEEE 802 dominam a borda da Internet. O 802.3 é a " +
            "Ethernet, o 802.11 é o WiFi e o 802.15.1 é o Bluetooth</li>" +
            "<li>O problema de partida é sempre o mesmo. Várias estações querem falar " +
            "por um meio que comporta uma de cada vez</li>" +
            "<li>O que muda entre eles é o que cada projeto decidiu priorizar</li>" +
            "</ul>"
        },
        {
          title: "Ethernet, disputa educada pelo meio",
          html:
            "<ul>" +
            "<li>Barramento de disputa. Todas as estações compartilham o meio e " +
            "escutam sem parar</li>" +
            "<li><strong>Detecção de portadora</strong>, só transmitir com o meio " +
            "livre</li>" +
            "<li><strong>Detecção de colisão</strong>, comparar o que transmite com o " +
            "que ouve. Divergiu, para e emite o sinal de reforço</li>" +
            "<li><strong>Back-off</strong>, esperar um tempo aleatório e dobrar o " +
            "limite do sorteio a cada nova colisão</li>" +
            "<li>Eficiência de 80% a 95%, porém <strong>sem garantia de prazo</strong>" +
            "</li>" +
            "</ul>"
        },
        {
          title: "Por que a Ethernet comutada mudou o jogo",
          html:
            "<ul>" +
            "<li>Com comutador no lugar do hub, cada host ganha o <strong>seu " +
            "segmento</strong> e só recebe o que é dele</li>" +
            "<li>Sem disputa, some a espera imprevisível do back-off. As filas do " +
            "comutador ainda fazem a latência variar</li>" +
            "<li>Foi assim que a Ethernet se aproximou do tempo real e ajudou a aposentar o " +
            "token ring</li>" +
            "</ul>"
        },
        {
          title: "WiFi, quando não dá para detectar a colisão",
          html:
            "<ul>" +
            "<li>Duas configurações. Na de <strong>infraestrutura</strong> há ponto " +
            "de acesso; na <strong>ad hoc</strong> os dispositivos formam a rede na " +
            "hora</li>" +
            "<li>A detecção falha por três motivos. A <strong>estação oculta</strong> " +
            "fica atrás de um obstáculo, o <strong>desvanecimento</strong> enfraquece " +
            "o sinal com o quadrado da distância e o <strong>mascaramento</strong> faz " +
            "o próprio sinal abafar o remoto</li>" +
            "<li>A saída é prevenir. No <strong>CSMA/CA</strong> a estação reserva o " +
            "meio trocando RTS e CTS, e quem ouvir qualquer um dos dois se cala</li>" +
            "</ul>"
        },
        {
          title: "Por que são dois quadros e não um",
          ref: "fig-rts-cts"
        },
        {
          title: "Bluetooth, a rede que cabe no bolso",
          ref: "fig-piconet",
          html:
            "<ul>" +
            "<li>Meta de 5 dólares por dispositivo, 1 mW e 10 metros</li>" +
            "<li>Um dispositivo central e até 7 periféricos ativos</li>" +
            "</ul>"
        },
        {
          title: "Os dois enlaces do Bluetooth",
          html:
            "<ul>" +
            "<li>O <strong>SCO</strong> é síncrono e serve à voz. Cada bit vai em " +
            "triplicata e não há retransmissão, porque dado atrasado é dado inútil</li>" +
            "<li>O <strong>ACL</strong> é assíncrono e serve aos dados. Nele, a " +
            "integridade e a retransmissão ganham prioridade sobre a entrega " +
            "imediata</li>" +
            "<li>1 Mbps na versão 1.1 e 3 Mbps na 2.0</li>" +
            "<li>O calcanhar de Aquiles é a entrada. Associar um dispositivo novo leva " +
            "até <strong>10 segundos</strong></li>" +
            "</ul>"
        },
        {
          title: "Os três lado a lado",
          ref: "tab-padroes"
        }
      ]
    }
  ],

  lab: {
    href: "labs/pratica-03/index.html",
    title: "Quem consegue iniciar a conversa",
    summary:
      "Um script monta uma rede de pilha dupla na AWS, com sub-redes pública e privadas, " +
      "NAT gateway e gateway somente de saída, e o seu trabalho começa onde ele para. " +
      "Descubra por que uma máquina com endereço IPv6 único no mundo e filtro aberto " +
      "continua inalcançável, o que muda quando você apaga e recria uma linha da tabela de " +
      "rotas com tudo ligado, e o que a rede cobra mais caro, atravessar a fronteira de " +
      "uma VPC ou trocar de zona de disponibilidade.",
    duration: "75 min",
    environment: "AWS Academy Sandbox"
  },

  quiz: [
    {
      question:
        "Uma interação requisição-resposta em rede local leva cerca de 0,5 ms, e invocar um objeto na memória local leva menos de 1 microssegundo. Para sistemas distribuídos, que trocam muitas mensagens <em>pequenas</em>, qual parâmetro da rede costuma pesar tanto quanto ou mais que a taxa de transferência?",
      options: [
        "A largura de banda total do sistema.",
        "A latência.",
        "A MTU da rede subjacente.",
        "O número de hosts conectados."
      ],
      answer: 1,
      explanation:
        "Tempo de transmissão = latência + tamanho ÷ taxa de transferência. Quando " +
        "as mensagens são pequenas, o termo do tamanho encolhe e quem passa a " +
        "dominar o tempo total é a latência. Ela representa o atraso que já existe " +
        "antes que o tamanho da mensagem passe a pesar."
    },
    {
      question:
        "Por que as mensagens são divididas em pacotes de comprimento limitado antes da transmissão?",
      options: [
        "Porque o modelo OSI exige exatamente sete fragmentos por mensagem enviada.",
        "Para obrigar todos os pacotes de uma mensagem a seguir sempre a mesma rota.",
        "Para dimensionar os buffers de cada nó e impedir que uma mensagem longa ocupe o canal.",
        "Para dispensar a soma de verificação, que sai cara em mensagens grandes."
      ],
      answer: 2,
      explanation:
        "Pacotes de tamanho limitado permitem que cada computador reserve buffer " +
        "para o maior pacote possível. Eles também impedem que uma mensagem longa " +
        "ocupe o canal sem subdivisão e atrase todas as outras. As duas razões " +
        "juntas sustentam a comutação de pacotes."
    },
    {
      question:
        "O IP oferece uma semântica de entrega de melhor esforço (best effort). O que isso significa?",
      options: [
        "Não há nenhuma garantia, e o datagrama pode se perder, duplicar, atrasar ou chegar fora de ordem.",
        "Os datagramas são sempre entregues, mas possivelmente fora de ordem.",
        "O IP retransmite cada datagrama perdido até três vezes antes de desistir.",
        "As perdas só ocorrem em redes sem fio; nas cabeadas a entrega é garantida."
      ],
      answer: 0,
      explanation:
        "O IP não oferece garantia de entrega. A soma de verificação do IPv4 cobre " +
        "apenas o cabeçalho, e não os dados. Confiabilidade, quando necessária, é " +
        "acrescentada pelo transporte (TCP) ou pela aplicação, seguindo o princípio " +
        "fim-a-fim."
    },
    {
      question:
        "Um roteador NAT recebe da Internet uma mensagem TCP de resposta. Como ele decide a qual computador da rede interna entregá-la?",
      options: [
        "Pelo endereço MAC de destino gravado no quadro Ethernet que chegou de fora.",
        "Em broadcast para todos os computadores internos, deixando cada um decidir.",
        "Pelo endereço IP de origem do servidor externo que produziu a resposta.",
        "Pelo número da porta de destino, que indexa na tabela o IP e a porta internos."
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
        "Qual mecanismo do TCP impede que um remetente rápido sobrecarregue um destinatário mais lento?",
      options: [
        "A soma de verificação, que cobre o cabeçalho e também os dados do segmento.",
        "O controle de fluxo, em que a confirmação anuncia a janela que o outro aceita.",
        "A fragmentação dos datagramas conforme o MTU de cada rede do caminho.",
        "O rótulo de fluxo do cabeçalho IPv6, que reserva capacidade para a conexão."
      ],
      answer: 1,
      explanation:
        "O receptor confirma os segmentos informando o número de sequência mais " +
        "alto que recebeu e um tamanho de janela, que diz o quanto ele ainda aceita " +
        "receber. O remetente só envia dentro dessa janela, o que equilibra os " +
        "ritmos dos dois lados."
    },
    {
      question:
        "Por que o WiFi (IEEE 802.11) previne a colisão, com o CSMA/CA e os quadros RTS e CTS, em vez de detectá-la como faz o CSMA/CD da Ethernet?",
      options: [
        "Porque a colisão é fisicamente impossível numa transmissão de rádio aberta.",
        "Porque os quadros RTS e CTS transportam os dados com mais rapidez que o resto.",
        "Porque no rádio o transmissor não escuta a colisão que ele mesmo provocou.",
        "Porque o protocolo de segurança WEP exige a reserva prévia do canal."
      ],
      answer: 2,
      explanation:
        "A detecção de colisão exige que todos ouçam sinais com intensidade " +
        "parecida, e no rádio isso falha por três motivos. Há estações ocultas por " +
        "obstáculos, há o sinal que desvanece com a distância e há o próprio sinal, " +
        "muito mais forte, mascarando o alheio. Por isso o 802.11 reserva o canal " +
        "antes, trocando os quadros RTS e CTS, e confirma cada quadro recebido."
    }
  ],

  glossary: [
    {
      term: "Comutação de pacotes",
      definition:
        "Técnica em que pacotes endereçados a destinos diferentes compartilham os " +
        "mesmos enlaces. Cada nó armazena o pacote que recebeu e o encaminha ao " +
        "próximo, no esquema de armazenamento e encaminhamento. É a base de todas " +
        "as redes de computadores."
    },
    {
      term: "Latência (de rede)",
      definition:
        "Tempo decorrido entre a execução do envio e o início da chegada dos dados " +
        "ao destino. Mede-se transferindo uma mensagem vazia, o que isola o atraso " +
        "do tamanho. Em sistemas distribuídos ela costuma pesar mais que a taxa de " +
        "transferência."
    },
    {
      term: "MTU (Maximum Transmission Unit)",
      definition:
        "Comprimento máximo do campo de dados de um pacote em uma tecnologia de " +
        "rede. Na Ethernet é de 1.500 bytes, e mensagens maiores precisam ser " +
        "fragmentadas e remontadas no destino."
    },
    {
      term: "Protocolo",
      definition:
        "Conjunto bem conhecido de regras e formatos para a comunicação entre " +
        "processos. Ele tem duas partes, a especificação da sequência de mensagens " +
        "trocadas e a especificação do formato dos dados dentro delas."
    },
    {
      term: "Datagrama",
      definition:
        "Modo de entrega em que cada pacote é roteado de forma independente, sem " +
        "configuração prévia nem estado na rede. Os pacotes podem seguir rotas " +
        "diferentes e chegar fora de ordem. É o modo do IP."
    },
    {
      term: "Circuito virtual",
      definition:
        "Modo de entrega em que um caminho é configurado antes da transmissão, com " +
        "entradas de tabela nos nós intermediários. Os pacotes passam a carregar " +
        "apenas o número do circuito, e não os endereços, como acontece nas redes de " +
        "modo de transferência assíncrona (ATM)."
    },
    {
      term: "Vetor de distância",
      definition:
        "Família de algoritmos de roteamento, de Bellman e Ford, em que cada " +
        "roteador mantém uma tabela que liga cada destino a um enlace de saída e a " +
        "um custo, e a troca periodicamente com os vizinhos, adotando as rotas de " +
        "custo menor. É a base do protocolo RIP."
    },
    {
      term: "NAT (Network Address Translation)",
      definition:
        "Esquema em que uma rede com endereços IP privados compartilha um único " +
        "endereço registrado. O roteador reescreve o endereço e a porta de origem " +
        "das mensagens que saem, e usa a porta de destino das respostas para " +
        "localizar o computador interno."
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
        "segurança da organização em três níveis, que são a filtragem de " +
        "datagramas IP, o gateway TCP e o gateway de aplicação, em que um proxy " +
        "examina o conteúdo."
    },
    {
      term: "CSMA/CD",
      definition:
        "Método de acesso ao meio da Ethernet, que junta o acesso múltiplo com " +
        "detecção de portadora à detecção de colisão. A estação só transmite com o " +
        "meio livre, compara o sinal que envia com o que ouve para perceber a " +
        "colisão e, quando ela ocorre, recua por um tempo aleatório antes de tentar " +
        "de novo."
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
