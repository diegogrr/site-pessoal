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
        "de levar mensagens de um nó a outro. Do lado do hardware estão os cabos, as " +
        "fibras, o rádio, os roteadores, os comutadores e as interfaces de rede, e do " +
        "lado do software estão as pilhas de protocolo e os drivers de cada uma " +
        "dessas peças.</p>" +
        "<p>Duas palavras vão se repetir no restante do tópico, e vale separá-las " +
        "desde já. Um <strong>host</strong> é o computador que usa a rede para " +
        "executar as suas aplicações. Um <strong>nó</strong> é qualquer equipamento " +
        "ligado a ela, o que inclui os roteadores e os comutadores, que não executam " +
        "aplicação nenhuma e existem apenas para encaminhar o tráfego dos outros.</p>" +
        "<p>A rede não é um detalhe de implementação que o projetista possa ignorar, " +
        "porque cada propriedade dela reaparece como restrição no sistema que roda em " +
        "cima. O desempenho determina quanto custa cada invocação remota. A " +
        "confiabilidade determina de que falhas o sistema precisa se defender. A " +
        "escalabilidade limita o tamanho que ele pode alcançar, e a mobilidade decide " +
        "se um nó consegue mudar de lugar sem perder a identidade.</p>" +
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
        "<p>A tabela desfaz de passagem uma intuição comum. Já que a rede local é " +
        "mil vezes mais lenta que a memória, seria natural supor que ela também " +
        "perde para o disco, e não é o que acontece. Um servidor de arquivos com um " +
        "bom cache responde mais rápido que o disco rígido da própria máquina, porque " +
        "a resposta dele sai da memória e não de um prato girando.</p>" +
        "<h3>Os outros requisitos</h3>" +
        "<p>Desempenho é o requisito mais discutido, mas não é o único que a rede " +
        "impõe ao sistema distribuído. Outros seis aparecem com frequência.</p>" +
        "<ul>" +
        "<li>A <strong>escalabilidade</strong> obrigou a rever o endereçamento e o " +
        "roteamento, porque a Internet caminha para bilhões de nós e nenhum dos dois " +
        "esquemas originais foi projetado para essa ordem de grandeza.</li>" +
        "<li>A <strong>confiabilidade</strong> quase nunca é limitada pela mídia " +
        "física, que é muito confiável. Quando algo se perde, a causa costuma estar " +
        "no software das pontas, seja um estouro de buffer, seja um host que não " +
        "aceita o pacote. É o argumento fim-a-fim do Tópico 2 aparecendo de novo, e " +
        "ele recomenda deixar a detecção e a correção de erros com a aplicação.</li>" +
        "<li>A <strong>segurança</strong> começa pelo firewall no gateway da " +
        "organização, que é a defesa de perímetro. Proteção mais fina exige " +
        "criptografia fim-a-fim e redes privadas virtuais (VPN), assunto da seção 3." +
        "</li>" +
        "<li>A <strong>mobilidade</strong> desafia o endereçamento. Os dispositivos " +
        "trocam de ponto de conexão o tempo todo, e os esquemas de endereço da " +
        "Internet nasceram antes disso, o que exigiu adaptações como o MobileIP.</li>" +
        "<li>A <strong>qualidade de serviço</strong> (QoS) é a garantia de banda e de " +
        "latência máxima que a multimídia em tempo real precisa receber da rede.</li>" +
        "<li>O <strong>multicasting</strong> entrega a mesma mensagem a muitos " +
        "destinatários sem que o remetente repita um envio ponto a ponto para cada " +
        "um deles.</li>" +
        "</ul>" +
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
        "<td>A rede local sem fio (WLAN), do WiFi, de 11 a 108 Mbps.</td></tr>" +
        "<tr><td>Rede metropolitana (MAN)</td>" +
        "<td>De 2 a 50 quilômetros, o que cobre uma cidade.</td>" +
        "<td>Chega ao assinante pela linha digital (DSL) ou pelo modem a cabo.</td>" +
        "<td>A rede metropolitana sem fio (WMAN), do WiMAX.</td></tr>" +
        "<tr><td>Rede de longa distância (WAN)</td>" +
        "<td>Mundial.</td>" +
        "<td>Atravessa roteadores, e por isso a latência sobe para a faixa de 100 a " +
        "500 milissegundos.</td>" +
        "<td>A rede de longa distância sem fio (WWAN), da telefonia celular 3G e " +
        "4G.</td></tr>" +
        "<tr><td>Inter-rede</td>" +
        "<td>Sem limite definido.</td>" +
        "<td>Integra redes de tecnologias diferentes em um único meio de comunicação, " +
        "ou seja, monta uma rede virtual sobre as redes reais. A Internet é o exemplo " +
        "máximo.</td>" +
        "<td>Não se aplica.</td></tr>" +
        "</table></div>" +
        "<p>Uma observação vale para todos esses tipos. Pacotes se perdem em qualquer " +
        "rede, e quase nunca por corrupção do sinal na mídia física. A causa comum é " +
        "o atraso de processamento ou o estouro de buffer no destino, ou seja, o " +
        "problema nasce no software das pontas.</p>" +
        "<p>Nas redes de longa distância há dois efeitos a mais, e os dois vêm de " +
        "decisões de projeto que este tópico ainda vai detalhar. Como cada pacote é " +
        "roteado individualmente, eles podem chegar fora de ordem. E como a suspeita " +
        "de perda dispara retransmissão, o destino pode receber duplicatas, que é " +
        "justamente o fenômeno da demonstração do Tópico 1.</p>",
      slides: [
        {
          title: "A rede molda o sistema que roda em cima",
          html:
            "<ul>" +
            "<li>O <strong>subsistema de comunicação</strong> é o hardware e o " +
            "software que levam a mensagem de um nó a outro</li>" +
            "<li><strong>Host</strong> é o computador que executa aplicação. " +
            "<strong>Nó</strong> é qualquer equipamento ligado à rede, roteador " +
            "incluído</li>" +
            "<li>Cada propriedade da rede vira restrição lá em cima. O desempenho " +
            "precifica a invocação remota, a confiabilidade define de que falhas se " +
            "defender e a escalabilidade limita o tamanho possível</li>" +
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
            "<li>A <strong>escalabilidade</strong> obrigou a rever endereçamento e " +
            "roteamento, porque a Internet vai a bilhões de nós</li>" +
            "<li>A <strong>confiabilidade</strong> raramente falha na mídia. O erro " +
            "nasce no software das pontas, e o argumento fim-a-fim manda tratá-lo na " +
            "aplicação</li>" +
            "<li>A <strong>segurança</strong> começa no firewall do gateway, e " +
            "aprofunda com criptografia fim-a-fim e VPN</li>" +
            "<li>A <strong>mobilidade</strong> desafia o endereçamento, que nasceu " +
            "antes dela</li>" +
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
        "permite aos nós alocarem buffers de tamanho conhecido. A segunda é que ele " +
        "impede uma mensagem longa de monopolizar o canal enquanto as outras esperam. " +
        "O tamanho máximo do campo de dados chama-se unidade máxima de transmissão " +
        "(MTU), e na Ethernet ela é de 1.500 bytes.</p>" +
        "<h3>Esquemas de comutação</h3>" +
        "<p>Quatro esquemas resolvem, de maneiras diferentes, a mesma questão de como " +
        "os dados atravessam a rede.</p>" +
        '<div class="tabela-rolagem">' +
        '<table class="tabela-conteudo" id="tab-comutacao">' +
        "<tr><th>Esquema</th><th>Como funciona</th><th>Onde aparece</th></tr>" +
        "<tr><td>Difusão (broadcast)</td>" +
        "<td>Não há comutação. Tudo é transmitido a todos os nós, e cada um recolhe " +
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
        "<td>O modo de transferência assíncrona (ATM).</td></tr>" +
        "</table></div>" +
        "<h3>Protocolos em camadas</h3>" +
        "<p>Um <strong>protocolo</strong> é um conjunto conhecido de regras e formatos " +
        "com duas partes. A primeira é a sequência das mensagens que precisam ser " +
        "trocadas, e a segunda é o formato dos dados dentro de cada uma delas. Sem " +
        "acordo nas duas partes, as pontas não conversam.</p>" +
        "<p>O software de rede se organiza em camadas, e cada camada oferece um " +
        "serviço à camada de cima usando o serviço da camada de baixo. O mecanismo " +
        "que faz isso funcionar é o <strong>encapsulamento</strong>. No remetente, " +
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
        "<p>O modelo de referência para interconexão de sistemas abertos (OSI) define " +
        "sete camadas, que são a física, a de enlace, a de rede, a de transporte, a " +
        "de sessão, a de apresentação e a de aplicação. A Internet não implementa " +
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
        "registradas, como a porta 80 do HTTP.</p>" +
        "<p>Na camada de rede há duas estratégias de entrega, e a diferença entre " +
        "elas é o que se decide antes de o primeiro dado partir. Na entrega por " +
        "<strong>datagramas</strong>, cada pacote é roteado de forma independente e " +
        "não há configuração prévia nenhuma, que é como funcionam o IP e a Ethernet. " +
        "Nos <strong>circuitos virtuais</strong>, um caminho é montado antes e os " +
        "pacotes passam a carregar apenas o número do circuito, que é a estratégia " +
        "do ATM.</p>" +
        "<h3>Roteamento</h3>" +
        "<p>Em qualquer rede maior que um segmento local, entregar um pacote é tarefa " +
        "coletiva dos roteadores, que o passam adiante em saltos sucessivos. Um " +
        "algoritmo de roteamento tem duas partes com ritmos bem diferentes. A " +
        "primeira decide o próximo salto de cada pacote e precisa ser rápida, porque " +
        "roda na chegada. A segunda mantém o conhecimento da topologia da rede e " +
        "trabalha em segundo plano.</p>" +
        "<p>O algoritmo de <strong>vetor de distância</strong>, de Bellman e Ford, é " +
        "a base do protocolo de informação de roteamento (RIP). Cada roteador guarda " +
        "uma tabela que associa cada destino a um enlace de saída e a um custo em " +
        "saltos, e periodicamente troca essa tabela com os vizinhos, adotando as " +
        "rotas melhores que descobrir. Um enlace defeituoso recebe custo infinito, e " +
        "a notícia se propaga de vizinho em vizinho.</p>" +
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
        "<strong>congestionamento</strong>. Quando a carga passa de cerca de 80% da " +
        "capacidade, as filas estouram e os pacotes começam a ser descartados, e as " +
        "retransmissões que se seguem desperdiçam ainda mais recursos. Em redes de " +
        "datagramas o controle é fim-a-fim, ou seja, o remetente reduz o ritmo ao " +
        "perceber perdas ou avisos. É daí que vem o nome do TCP, o controle de " +
        "transmissão.</p>" +
        "<h3>Interligando redes heterogêneas</h3>" +
        "<p>Unir sub-redes de tecnologias diferentes exige três coisas ao mesmo " +
        "tempo, que são um esquema de endereçamento unificado, um protocolo comum de " +
        "pacotes e componentes que façam a interconexão. Na Internet, esses três " +
        "papéis cabem respectivamente aos endereços IP, ao protocolo IP e aos " +
        "roteadores.</p>" +
        "<p>No caminho aparecem outros equipamentos, e a diferença entre eles está no " +
        "quanto cada um entende do que repassa. O <strong>hub</strong> apenas estende " +
        "um segmento local, repetindo tudo para todos. O <strong>switch</strong> " +
        "comuta os quadros apenas para a rede local de destino. A <strong>ponte</strong> " +
        "liga redes de tipos diferentes.</p>" +
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
        '<div class="demo-area" data-demo="camadas-rede">' +
        '<span class="demo-placeholder-icon" aria-hidden="true">🧪</span>' +
        "<p><strong>A demonstração interativa não pôde ser carregada</strong></p>" +
        "<p>Recarregue a página para tentar de novo.</p>" +
        "</div>",
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
            "<li>Acima de ~80% da capacidade as filas estouram. O controle é " +
            "fim-a-fim, e daí vem o nome do TCP</li>" +
            "</ul>"
        },
        {
          title: "Interligar redes de tecnologias diferentes",
          html:
            "<ul>" +
            "<li>Exige três coisas juntas, que na Internet são o endereço IP, o " +
            "protocolo IP e o roteador</li>" +
            "<li>O <strong>hub</strong> repete tudo a todos, o <strong>switch</strong> " +
            "comuta só para o destino e a <strong>ponte</strong> liga redes de tipos " +
            "diferentes</li>" +
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
        "encapsulados nos quadros de qualquer rede real, seja Ethernet, WiFi, ATM ou " +
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
        "Validar o conteúdo fica por conta do TCP e do UDP, o que é o princípio " +
        "fim-a-fim do Tópico 2 em forma de decisão de engenharia. Verificar os dados " +
        "em cada salto custaria caro e ainda assim não dispensaria a verificação nas " +
        "pontas.</p>" +
        "<p>Quando um datagrama é maior que a MTU da rede que ele precisa " +
        "atravessar, o IP o fragmenta, e os fragmentos são remontados no destino. Já " +
        "na fronteira com a rede física aparece outro problema, que é traduzir o " +
        "endereço IP para o endereço físico da placa. Disso cuida o protocolo de " +
        "resolução de endereços (ARP), que pergunta em difusão na rede local quem " +
        "tem determinado IP e guarda as respostas em cache.</p>" +
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
        "configuração dinâmica de hosts (DHCP), compartilha um único IP registrado. " +
        "O roteador reescreve o endereço e a porta de origem de cada mensagem que " +
        "sai e usa a porta de destino das respostas para achar, na sua tabela, o " +
        "computador interno certo.</td>" +
        "<td>Funciona muito bem para clientes. Expor um servidor interno exige " +
        "configuração manual, porque de fora não há como iniciar a conversa.</td></tr>" +
        "<tr><td>IPv6</td>" +
        "<td>Endereços de 128 bits, o que dá cerca de 3 × 10³⁸ endereços. Traz ainda " +
        "roteamento mais rápido, classe de tráfego e rótulo de fluxo para tempo real, " +
        "difusão anycast e segurança no nível IP.</td>" +
        "<td>Resolve o problema de vez, mas a migração tem sido lenta justamente " +
        "porque as duas medidas anteriores aliviaram a pressão.</td></tr>" +
        "</table></div>" +
        "<p>Para dar a dimensão do número, mesmo nas estimativas pessimistas o IPv6 " +
        "oferece mil endereços por metro quadrado da superfície do planeta. A " +
        "migração foi planejada por túneis sobre IPv4, exatamente como a figura da " +
        "seção anterior mostra, e a explosão de dispositivos móveis acabou tornando-a " +
        "inevitável.</p>" +
        "<p>Um problema aparentado é o do computador que se move sem querer trocar de " +
        "endereço. O <strong>MobileIP</strong> resolve com dois agentes. Um agente " +
        "doméstico, na rede de origem, recebe os datagramas destinados ao host e os " +
        "entrega por túnel ao agente estrangeiro da rede onde ele está agora, que lhe " +
        "deu um endereço aos cuidados de. A solução é eficaz, embora pouco eficiente, " +
        "e vale notar que a telefonia celular faz o equivalente de forma nativa.</p>" +
        "<h3>TCP e UDP, os dois transportes</h3>" +
        "<p>Enquanto o IP liga computadores, o TCP e o protocolo de datagrama de " +
        "usuário (UDP) ligam processos, por meio das portas. Os dois ocupam a mesma " +
        "camada e oferecem serviços opostos.</p>" +
        '<div class="tabela-rolagem">' +
        '<table class="tabela-conteudo" id="tab-tcp-udp">' +
        "<tr><th>Dimensão</th><th>UDP</th><th>TCP</th></tr>" +
        "<tr><td>Conexão</td><td>Não existe. Cada datagrama viaja sozinho.</td>" +
        "<td>É orientado a conexão e entrega um fluxo de bytes.</td></tr>" +
        "<tr><td>Ordem</td><td>Não há garantia nenhuma.</td>" +
        "<td>Os segmentos são numerados e entregues à aplicação na ordem certa.</td></tr>" +
        "<tr><td>Perdas</td><td>Não há confirmação nem retransmissão.</td>" +
        "<td>O segmento não confirmado dentro do prazo é reenviado.</td></tr>" +
        "<tr><td>Ritmo</td><td>Não há controle de fluxo.</td>" +
        "<td>Cada confirmação carrega uma janela, que diz quanto o remetente pode " +
        "enviar antes da próxima, o que protege destinos e nós lentos.</td></tr>" +
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
        "nomes distribuídos, cada um responsável pela sua parte da hierarquia, que " +
        "resolvem as consultas recursivamente.</p>" +
        "<p>O detalhe que sustenta o serviço inteiro é o cache. Cada servidor guarda " +
        "as respostas que obteve, e sem isso os servidores-raiz seriam o gargalo de " +
        "toda a Internet, já que qualquer consulta começaria neles.</p>" +
        "<h3>Firewalls e VPNs</h3>" +
        "<p>Em uma intranet grande sempre haverá algum software vulnerável, e " +
        "esperar que não haja não é uma estratégia. O <strong>firewall</strong> " +
        "parte dessa constatação e monitora toda a comunicação que entra e sai, " +
        "aplicando a política de segurança da organização em até três níveis.</p>" +
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
        "<figcaption>Os três níveis são cumulativos e correspondem às camadas da " +
        "figura de encapsulamento. Quanto mais fundo o firewall precisa olhar, mais " +
        "trabalho ele tem por pacote.</figcaption>" +
        "</figure>" +
        "<p>Os processos do gateway de aplicação costumam rodar em um computador " +
        "dedicado, chamado de <strong>bastião</strong>. Os servidores públicos da " +
        "organização, como o da Web e o de arquivos por FTP (File Transfer Protocol), " +
        "ficam fora da zona protegida, às vezes em uma sub-rede colocada entre dois " +
        "filtros.</p>" +
        "<p>O firewall defende um perímetro, e a VPN faz o oposto, estendendo esse " +
        "perímetro através da Internet pública. Canais cifrados no nível IP, pelo " +
        "IPSec, ligam usuários remotos e filiais como se todos estivessem dentro da " +
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
            "atrasar ou chegar fora de ordem, sem aviso nenhum</li>" +
            "<li>A soma de verificação cobre <strong>só o cabeçalho</strong>. Os " +
            "dados ficam com TCP e UDP, que é o fim-a-fim virando engenharia</li>" +
            "<li>Maior que a MTU, o datagrama é fragmentado e remontado no destino" +
            "</li>" +
            "<li>O <strong>ARP</strong> pergunta em difusão quem tem um IP e guarda a " +
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
          title: "Endereços e mobilidade",
          html:
            "<ul>" +
            "<li>O IPv4 tem 32 bits divididos em rede e host, com as classes A, B e C " +
            "e a D para multicast</li>" +
            "<li>Quatro bilhões pareciam bastar, mas as classes desperdiçavam faixas " +
            "inteiras. Por volta de 1990 o esgotamento tinha prazo</li>" +
            "<li>O <strong>MobileIP</strong> usa dois agentes. O doméstico recebe e " +
            "encaminha por túnel ao estrangeiro, onde o host está agora</li>" +
            "<li>É eficaz e pouco eficiente. A telefonia celular resolve o mesmo " +
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
            "hierarquia, resolvem as consultas recursivamente</li>" +
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
            "<li>Canais cifrados no nível IP, pelo <strong>IPSec</strong>, ligam " +
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
        "<p>Os padrões de rede local do comitê IEEE 802 dominam a borda da Internet. " +
        "Os três desta seção são o 802.3, da Ethernet, o 802.11, do WiFi, e o " +
        "802.15.1, do Bluetooth, e a família ainda inclui o 802.15.4, do ZigBee para " +
        "sensores, e o 802.16, do WiMAX.</p>" +
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
        "com o que ela ouve no meio. Quando os dois divergem, houve colisão, e ela " +
        "para de transmitir e emite um sinal de reforço, o jamming, para que todos " +
        "percebam.</li>" +
        "<li>O <strong>back-off</strong> faz cada estação envolvida esperar um tempo " +
        "aleatório antes de tentar de novo, dobrando o limite desse sorteio a cada " +
        "nova colisão. É o que evita que as duas voltem a colidir na mesma hora.</li>" +
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
        "<p>Com switches no lugar dos hubs, cada host passa a ter o seu próprio " +
        "segmento e só recebe os quadros endereçados a ele. Sem disputa pelo meio não " +
        "há colisão, a eficiência se aproxima de 100% e a latência fica constante. Foi " +
        "assim que a Ethernet passou a atender também ao tempo real e aposentou " +
        "concorrentes como o token ring.</p>" +
        "</div>" +
        "<h3>WiFi, quando não dá para detectar a colisão</h3>" +
        "<p>O WiFi leva o princípio da Ethernet para o rádio, nas faixas de 2,4 e 5 " +
        "GHz, com até 54 Mbps e alcance da ordem de 150 metros. Ele funciona em duas " +
        "configurações. Na de infraestrutura, uma estação-base serve de ponto de " +
        "acesso à rede cabeada. Na ad hoc, os dispositivos se detectam e formam a rede " +
        "na hora, sem intermediário.</p>" +
        "<p>A mudança de meio quebra a peça central do método da Ethernet. No rádio, a " +
        "intensidade do sinal varia muito pelo espaço, e a detecção de colisão falha " +
        "por três motivos independentes.</p>" +
        "<ul>" +
        "<li>Nas <strong>estações ocultas</strong>, um obstáculo esconde de uma " +
        "estação um transmissor que está ativo, e ela conclui que o meio está livre " +
        "quando não está.</li>" +
        "<li>No <strong>desvanecimento</strong>, o sinal enfraquece com o quadrado da " +
        "distância, e a estação distante simplesmente não é ouvida.</li>" +
        "<li>No <strong>mascaramento</strong>, o próprio sinal da estação, muito mais " +
        "forte, abafa o sinal remoto. O transmissor nunca ouve a colisão que ele " +
        "mesmo causou.</li>" +
        "</ul>" +
        "<p>Como detectar não funciona, a resposta é prevenir. No CSMA/CA, em que as " +
        "duas últimas letras vêm de evitar a colisão (CA), a estação reserva um " +
        "intervalo antes de transmitir. Ela troca com o destino dois quadros curtos, " +
        "um de pedido para transmitir (RTS) e outro de liberação para transmitir " +
        "(CTS), e quem ouvir qualquer um dos dois fica calado pelo período anunciado. " +
        "A recepção passa a ser confirmada quadro a quadro.</p>" +
        "<p>A segurança do WiFi nasceu mal. O esquema original, a privacidade " +
        "equivalente à do cabo (WEP), tinha falhas de projeto e acabou substituído.</p>" +
        "<h3>Bluetooth, a rede que cabe no bolso</h3>" +
        "<p>O Bluetooth foi projetado para ligar fones, telefones e acessórios com " +
        "hardware de custo mínimo, com a meta declarada de 5 dólares por dispositivo, " +
        "e com consumo baixíssimo. Ele opera a cerca de 1 mW, o que lhe dá alcance de " +
        "10 metros.</p>" +
        "<p>Os nós se associam dinamicamente em <strong>piconets</strong>. Cada " +
        "piconet tem um mestre e até sete escravos ativos, além de até 255 " +
        "dispositivos estacionados em modo de baixa energia. Quando um nó participa de " +
        "duas piconets, ele funciona como ponte entre elas, e o conjunto passa a se " +
        "chamar <strong>scatternet</strong>.</p>" +
        '<figure class="figura" id="fig-piconet">' +
        '<svg viewBox="0 0 640 250" role="img" aria-labelledby="fig-piconet-titulo">' +
        '<title id="fig-piconet-titulo">Duas piconets, cada uma com um mestre e três ' +
        "escravos, ligadas entre si por um nó-ponte que participa das duas e forma " +
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
        '<text class="rotulo-secundario" x="45" y="59" text-anchor="middle" font-size="11">escravo</text>' +
        '<circle class="caixa" cx="45" cy="185" r="24"/>' +
        '<text class="rotulo-secundario" x="45" y="189" text-anchor="middle" font-size="11">escravo</text>' +
        '<circle class="caixa" cx="150" cy="40" r="24"/>' +
        '<text class="rotulo-secundario" x="150" y="44" text-anchor="middle" font-size="11">escravo</text>' +
        '<circle class="caixa-destaque" cx="135" cy="120" r="30"/>' +
        '<text x="135" y="125" text-anchor="middle" font-size="13">mestre</text>' +
        '<circle class="caixa" cx="595" cy="55" r="24"/>' +
        '<text class="rotulo-secundario" x="595" y="59" text-anchor="middle" font-size="11">escravo</text>' +
        '<circle class="caixa" cx="595" cy="185" r="24"/>' +
        '<text class="rotulo-secundario" x="595" y="189" text-anchor="middle" font-size="11">escravo</text>' +
        '<circle class="caixa" cx="490" cy="40" r="24"/>' +
        '<text class="rotulo-secundario" x="490" y="44" text-anchor="middle" font-size="11">escravo</text>' +
        '<circle class="caixa-destaque" cx="505" cy="120" r="30"/>' +
        '<text x="505" y="125" text-anchor="middle" font-size="13">mestre</text>' +
        '<circle class="caixa" cx="320" cy="120" r="27"/>' +
        '<text x="320" y="125" text-anchor="middle" font-size="12">ponte</text>' +
        '<text class="rotulo-secundario" x="135" y="228" text-anchor="middle" font-size="13">piconet</text>' +
        '<text class="rotulo-secundario" x="505" y="228" text-anchor="middle" font-size="13">piconet</text>' +
        "</svg>" +
        "<figcaption>Cada piconet tem um mestre só. O nó do meio pertence às duas ao " +
        "mesmo tempo, e é essa participação dupla que costura as piconets em uma " +
        "scatternet.</figcaption>" +
        "</figure>" +
        "<p>Dois tipos de enlace atendem aos dois usos previstos. O enlace síncrono " +
        "orientado a conexão (SCO) serve à voz em tempo real, e cada bit é transmitido " +
        "em triplicata sem nenhuma retransmissão, pela razão de que dado atrasado é " +
        "dado inútil numa conversa. O enlace assíncrono sem conexão (ACL) serve aos " +
        "dados, onde a ordem de prioridade se inverte.</p>" +
        "<p>A versão 1.1 alcança 1 Mbps por piconet, e a 2.0 chega a 3 Mbps. O " +
        "calcanhar de aquiles está na entrada, porque associar um dispositivo novo " +
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
        "<td>Cerca de 150 metros.</td><td>Cerca de 10 metros.</td></tr>" +
        "<tr><td>Taxa</td><td>De 10 Mbps a 10 Gbps.</td><td>Até 54 Mbps.</td>" +
        "<td>1 Mbps na versão 1.1 e 3 Mbps na 2.0.</td></tr>" +
        "<tr><td>Acesso ao meio</td>" +
        "<td>CSMA/CD, que percebe a colisão depois que ela acontece.</td>" +
        "<td>CSMA/CA, que reserva o meio antes de transmitir.</td>" +
        "<td>Associação em piconet, com um mestre e até sete escravos ativos.</td></tr>" +
        "<tr><td>O que o projeto priorizou</td>" +
        "<td>A eficiência no meio compartilhado, que fica entre 80% e 95%.</td>" +
        "<td>Funcionar sem fio, aceitando não conseguir detectar a colisão.</td>" +
        "<td>O custo mínimo, com meta de 5 dólares, e o consumo baixíssimo.</td></tr>" +
        "</table></div>",
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
            "<li>Com switch no lugar do hub, cada host ganha o <strong>seu " +
            "segmento</strong> e só recebe o que é dele</li>" +
            "<li>Sem disputa não há colisão. A eficiência vai perto de 100% e a " +
            "latência fica constante</li>" +
            "<li>Foi assim que a Ethernet passou a servir ao tempo real e aposentou o " +
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
          title: "Bluetooth, a rede que cabe no bolso",
          ref: "fig-piconet",
          html:
            "<ul>" +
            "<li>Meta de 5 dólares por dispositivo, 1 mW e 10 metros</li>" +
            "<li>Um mestre, até 7 escravos ativos e 255 estacionados</li>" +
            "</ul>"
        },
        {
          title: "Os dois enlaces do Bluetooth",
          html:
            "<ul>" +
            "<li>O <strong>SCO</strong> é síncrono e serve à voz. Cada bit vai em " +
            "triplicata e não há retransmissão, porque dado atrasado é dado inútil</li>" +
            "<li>O <strong>ACL</strong> é assíncrono e serve aos dados, onde a " +
            "prioridade se inverte</li>" +
            "<li>1 Mbps na versão 1.1 e 3 Mbps na 2.0</li>" +
            "<li>O calcanhar de aquiles é a entrada. Associar um dispositivo novo leva " +
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

  quiz: [
    {
      question:
        "Uma interação requisição-resposta em rede local leva cerca de 0,5 ms, e invocar um objeto na memória local leva menos de 1 microssegundo. Para sistemas distribuídos, que trocam muitas mensagens <em>pequenas</em>, qual parâmetro da rede costuma pesar tanto quanto ou mais que a taxa de transferência?",
      options: [
        "A largura de banda total do sistema.",
        "A latência.",
        "O MTU da rede subjacente.",
        "O número de hosts conectados."
      ],
      answer: 1,
      explanation:
        "Tempo de transmissão = latência + tamanho ÷ taxa de transferência. Quando " +
        "as mensagens são pequenas, o termo do tamanho encolhe e quem passa a " +
        "dominar o tempo total é a latência, que soma as sobrecargas de software, os " +
        "atrasos de roteamento e a disputa pelo canal."
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
        "para o maior pacote possível. Eles também impedem que uma mensagem longa " +
        "ocupe o canal sem subdivisão e atrase todas as outras. As duas razões " +
        "juntas sustentam a comutação de pacotes."
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
        "alto que recebeu e um tamanho de janela, que diz o quanto ele ainda aceita " +
        "receber. O remetente só envia dentro dessa janela, o que equilibra os " +
        "ritmos dos dois lados."
    },
    {
      question:
        "Por que o WiFi (IEEE 802.11) previne a colisão, com o CSMA/CA e os quadros RTS e CTS, em vez de detectá-la como faz o CSMA/CD da Ethernet?",
      options: [
        "Porque colisões são fisicamente impossíveis em transmissões de rádio.",
        "Porque os quadros RTS/CTS transportam os dados mais rapidamente.",
        "Porque no rádio o sinal local abafa o remoto e há estações ocultas e desvanecimento: o transmissor não consegue perceber a colisão que causou.",
        "Por exigência do protocolo de segurança WEP."
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
      term: "MTU (Maximum Transfer Unit)",
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
        "apenas o número do circuito, e não os endereços, como acontece nas redes " +
        "ATM."
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
        "correspondente dentro de uma rede local, perguntando em difusão e " +
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
        "datagramas IP, o gateway TCP e o proxy de aplicação."
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
