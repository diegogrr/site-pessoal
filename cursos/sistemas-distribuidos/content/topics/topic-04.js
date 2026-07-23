/* ============================================================
   topic-04.js — Comunicação entre Processos
   ------------------------------------------------------------
   Estrutura documentada no modelo topic-01.js (sections[] com
   slides[] opcionais, quiz[], glossary[], references[]).
   Conteúdo baseado em: COULOURIS et al., cap. 4 (pp. 145–183),
   VAN STEEN; TANENBAUM, 4. ed., cap. 4 e KLEPPMANN, cap. 5
   (leituras complementares).
   ============================================================ */

window.SD = window.SD || {};
SD.content = SD.content || {};

SD.content["04"] = {

  sections: [
    {
      title: "Passagem de mensagens: características, portas e soquetes",
      html:
        "<p>Chegamos à camada em que o sistema distribuído de fato conversa. O " +
        "Tópico 3 mostrou como a Internet move pacotes entre <em>computadores</em>; " +
        "agora subimos um degrau: como <strong>processos</strong> trocam mensagens " +
        "usando UDP e TCP, e como o middleware constrói, sobre eles, as abstrações " +
        "dos próximos tópicos (a invocação remota do Tópico 5, por exemplo). Este " +
        "tópico cobre os dois andares de baixo do middleware: a <strong>passagem de " +
        "mensagens</strong> e o <strong>empacotamento de dados</strong>.</p>" +
        "<h3>send e receive</h3>" +
        "<p>Toda a comunicação entre processos se apoia em duas operações: " +
        "<strong>send</strong> (enviar uma sequência de bytes a um destino) e " +
        "<strong>receive</strong> (receber). Uma <em>fila</em> é associada a cada " +
        "destino: processos origem fazem mensagens serem adicionadas a filas " +
        "remotas, e processos destino as removem de suas filas locais. A " +
        "sincronização entre os dois lados define duas formas de comunicação:</p>" +
        "<ul>" +
        "<li><strong>Síncrona</strong>: send e receive são operações " +
        "<em>bloqueantes</em>: quem envia fica bloqueado até que o receive " +
        "correspondente seja executado no destino; quem recebe fica bloqueado até a " +
        "mensagem chegar. Os dois processos se sincronizam a cada mensagem.</li>" +
        "<li><strong>Assíncrona</strong>: o send é <em>não bloqueante</em>: " +
        "retorna assim que a mensagem foi copiada para um buffer local, e a " +
        "transmissão prossegue em paralelo com o remetente. O receive pode ter " +
        "variante não bloqueante (o buffer é preenchido em segundo plano e o " +
        "processo é notificado depois, por polling ou interrupção), mas ela " +
        "complica o programa: em sistemas com <em>threads</em>, como Java, o " +
        "receive bloqueante executado por uma thread dedicada dá a mesma " +
        "flexibilidade com muito mais simplicidade: por isso a recepção não " +
        "bloqueante é rara nos sistemas atuais.</li>" +
        "</ul>" +
        "<h3>Destinos: endereço IP + porta</h3>" +
        "<p>Nos protocolos Internet, mensagens são enviadas para o par " +
        "(<strong>endereço IP</strong>, <strong>porta local</strong>). Uma porta tem " +
        "<em>exatamente um destino</em>, mas pode ter <em>vários remetentes</em>: " +
        "qualquer processo que conheça o número da porta pode escrever para ela. " +
        "Cada computador tem 2<sup>16</sup> portas; um processo pode usar várias, " +
        "mas não pode compartilhá-las com outros processos do mesmo computador (o " +
        "multicast IP é a exceção). E um alerta de projeto: se o cliente usa um " +
        "endereço IP fixo, o serviço fica amarrado àquele computador para sempre. " +
        "Para haver <strong>transparência de localização</strong>, clientes se " +
        "referem a serviços por <em>nome</em>, e um servidor de nomes ou " +
        "<em>binder</em> converte o nome em localização na hora da execução: assim " +
        "o serviço pode mudar de máquina com o sistema rodando (assunto do " +
        "Tópico 9).</p>" +
        "<h3>As promessas: confiabilidade e ordenamento</h3>" +
        "<p>Dois eixos separam os serviços de comunicação (o Tópico 2 os apresentou " +
        "no modelo de falhas):</p>" +
        "<ul>" +
        "<li><strong>Confiabilidade</strong>: <em>validade</em>: toda mensagem " +
        "enviada é entregue, não importa quantos pacotes se percam no caminho; " +
        "<em>integridade</em>: o que chega não está corrompido nem duplicado.</li>" +
        "<li><strong>Ordenamento</strong>: algumas aplicações exigem entrega na " +
        "ordem de emissão; para elas, mensagem fora de ordem é falha.</li>" +
        "</ul>" +
        "<h3>Soquetes: a abstração de programação</h3>" +
        "<p>UDP e TCP são programados por uma mesma abstração, originária do UNIX " +
        "BSD e presente em praticamente todo sistema operacional: o " +
        "<strong>soquete</strong> (socket). Um soquete é um ponto de destino de " +
        "comunicação: para receber mensagens, o processo <em>vincula</em> seu " +
        "soquete a uma porta local e a um dos endereços IP do computador; o mesmo " +
        "soquete serve para enviar e receber. Cada soquete é associado a um único " +
        "protocolo (UDP <em>ou</em> TCP). Em Java, a classe <em>InetAddress</em> " +
        "encapsula os endereços: o programador usa nomes DNS e nem precisa saber se " +
        "o endereço resolvido é IPv4 (4 bytes) ou IPv6 (16 bytes).</p>",
      slides: [
        {
          title: "Onde estamos na pilha do middleware",
          html:
            "<ul>" +
            "<li>Tópico 3: pacotes entre <strong>computadores</strong> · agora: " +
            "mensagens entre <strong>processos</strong></li>" +
            "<li>Acima de nós: requisição-resposta, RPC e RMI (Tópico 5)</li>" +
            "<li>Este tópico: <strong>passagem de mensagens</strong> + " +
            "<strong>empacotamento de dados</strong></li>" +
            "</ul>"
        },
        {
          title: "send e receive: síncrono ou assíncrono",
          html:
            "<ul>" +
            "<li>Uma <strong>fila</strong> por destino: origem adiciona, destino remove</li>" +
            "<li><strong>Síncrono</strong>: os dois bloqueiam; sincronia a cada mensagem</li>" +
            "<li><strong>Assíncrono</strong>: send retorna após copiar ao buffer local</li>" +
            "<li>Na prática: receive <strong>bloqueante</strong> + uma thread dedicada</li>" +
            "</ul>"
        },
        {
          title: "Portas e soquetes",
          html:
            "<ul>" +
            "<li>Destino = <strong>endereço IP + porta</strong> (2¹⁶ por computador)</li>" +
            "<li>Porta: <strong>1 destino, N remetentes</strong>; sem compartilhar entre processos</li>" +
            "<li><strong>Soquete</strong>: vinculado a porta + IP; envia e recebe; UDP <em>ou</em> TCP</li>" +
            "<li>Transparência de localização: nome + <strong>binder</strong>, não IP fixo</li>" +
            "</ul>"
        }
      ]
    },
    {
      title: "Comunicação cliente-servidor: UDP e TCP na prática",
      html:
        "<p>UDP e TCP resolvem o mesmo problema, levar bytes de um processo a " +
        "outro, com filosofias opostas: o UDP é a passagem de mensagens em estado " +
        "bruto; o TCP, um <strong>fluxo</strong> (stream) que imita, entre " +
        "processos remotos, a simplicidade de ler e escrever em um arquivo. Nos " +
        "dois, o uso típico é <strong>cliente-servidor</strong>: o servidor vincula " +
        "seu soquete a uma porta de serviço que divulga; o cliente usa qualquer " +
        "porta livre.</p>" +
        "<h3>UDP: datagramas sem promessas</h3>" +
        "<p>Um datagrama UDP viaja da origem ao destino <em>sem confirmações nem " +
        "novas tentativas</em>: se algo falhar, a mensagem não chega, e ninguém " +
        "avisa. Quem programa com UDP convive com:</p>" +
        "<ul>" +
        "<li><strong>Tamanho</strong>: o receptor fornece um vetor de bytes para " +
        "receber; mensagem maior que ele é <em>truncada</em>. O IP admite " +
        "datagramas de até 64 KB, mas a maioria dos ambientes limita a 8 KB na " +
        "prática.</li>" +
        "<li><strong>Bloqueio</strong>: send não bloqueante (retorna ao repassar a " +
        "mensagem às camadas UDP/IP); receive bloqueante. Mensagens endereçadas a " +
        "uma porta sem soquete associado são <em>descartadas</em>.</li>" +
        "<li><strong>Timeouts</strong>: esperar para sempre é inadequado: o " +
        "remetente pode ter falhado. Pode-se configurar um tempo-limite no soquete" +
        ", mas escolher seu valor é difícil, como a demo do Tópico 1 mostrou.</li>" +
        "<li><strong>Recepção anônima</strong>: o receive não escolhe origem: " +
        "obtém qualquer mensagem endereçada ao soquete, informando IP e porta do " +
        "remetente (para responder, ou para restringir, com connect).</li>" +
        "</ul>" +
        "<p><strong>Modelo de falhas</strong>: falhas por <em>omissão</em> " +
        "(descarte por erro na soma de verificação ou por buffer cheio, na origem " +
        "ou no destino) e entrega <em>fora de ordem</em>. Quem precisa de mais " +
        "constrói por cima: com confirmações e retransmissões, monta-se um serviço " +
        "confiável sobre UDP. É o que fazem os protocolos requisição-resposta do " +
        "Tópico 5.</p>" +
        "<p>E por que alguém escolheria isso? Porque a entrega garantida cobra três " +
        "sobrecargas que o UDP não tem: <em>manter estado</em> na origem e no " +
        "destino, <em>mensagens extras</em> (confirmações) e a <em>latência do " +
        "remetente</em>. O DNS roda sobre UDP; o VoIP também: áudio atrasado é " +
        "inútil, retransmitir não ajuda.</p>" +
        "<h3>TCP: o fluxo que esconde a rede</h3>" +
        "<p>O TCP oferece um fluxo de bytes bidirecional entre dois processos " +
        "<em>conectados</em>. Antes dos dados, o estabelecimento: o cliente pede a " +
        "conexão (<em>connect</em>) e o servidor a aceita (<em>accept</em>). O " +
        "soquete de escuta do servidor permanece na porta de serviço, e cada " +
        "conexão aceita ganha um <em>novo soquete</em>: por isso um servidor " +
        "atende muitos clientes na mesma porta, tipicamente com uma <em>thread por " +
        "cliente</em>, que pode bloquear esperando dados sem atrasar os demais. " +
        "Estabelecida a conexão, os papéis desaparecem. São dois fluxos, um em cada " +
        "direção, sem endereços nem portas nas leituras e escritas. A abstração " +
        "esconde da aplicação:</p>" +
        "<ul>" +
        "<li><strong>Tamanhos de mensagem</strong>: a aplicação escreve e lê o " +
        "volume que quiser; o TCP decide quanto agrupar em cada datagrama IP;</li>" +
        "<li><strong>Mensagens perdidas</strong>: confirmações com <em>janela " +
        "deslizante</em>: o que não é confirmado no prazo é retransmitido;</li>" +
        "<li><strong>Controle de fluxo</strong>: quem escreve rápido demais é " +
        "bloqueado até o leitor consumir;</li>" +
        "<li><strong>Duplicação e desordem</strong>: identificadores de mensagem " +
        "permitem rejeitar duplicatas e reordenar o que chega trocado.</li>" +
        "</ul>" +
        "<p>Restam para a aplicação a <strong>correspondência dos dados</strong> " +
        "(se um lado escreve um inteiro seguido de um double, o outro deve ler um " +
        "inteiro seguido de um double: o fluxo não marca fronteiras de mensagem) e " +
        "o custo do estabelecimento de conexão em interações curtas. HTTP, FTP, " +
        "Telnet e SMTP rodam sobre TCP.</p>" +
        '<div class="callout">' +
        '<p class="callout-title">⚠️ O TCP não é comunicação confiável no sentido forte</p>' +
        "<p>Somas de verificação e números de sequência garantem a integridade; " +
        "timeouts e retransmissões, a validade: em boas condições. Mas se as " +
        "perdas passam do limite ou a rede se rompe, o TCP declara a conexão " +
        "<em>desfeita</em>. Os processos ficam sem saber: a falha foi da rede ou do " +
        "processo do outro lado? As últimas mensagens chegaram ou não? É o " +
        "“caiu ou está lenta?” do Tópico 1: nenhum transporte elimina " +
        "essa incerteza fundamental.</p>" +
        "</div>",
      slides: [
        {
          title: "UDP: mensagens sem promessas",
          html:
            "<ul>" +
            "<li>Sem confirmação, sem retransmissão, sem aviso de perda</li>" +
            "<li>Truncamento: buffer do receptor manda · prática ~8 KB</li>" +
            "<li>Porta sem soquete → mensagem <strong>descartada</strong></li>" +
            "<li>Falhas: <strong>omissão</strong> + <strong>desordem</strong> · " +
            "timeout é problema do programador</li>" +
            "</ul>"
        },
        {
          title: "Por que alguém escolhe UDP?",
          html:
            "<ul>" +
            "<li>Entrega garantida cobra caro: <strong>estado</strong> + " +
            "<strong>mensagens extras</strong> + <strong>latência</strong></li>" +
            "<li><strong>DNS</strong>: requisição perdida? pergunta de novo</li>" +
            "<li><strong>VoIP</strong>: áudio atrasado é inútil: retransmitir não ajuda</li>" +
            "<li>Confiabilidade sob medida: a aplicação constrói o que precisar</li>" +
            "</ul>"
        },
        {
          title: "TCP: o fluxo que esconde a rede",
          html:
            "<ul>" +
            "<li>Conexão: <strong>connect</strong> (cliente) + <strong>accept</strong> " +
            "(servidor) → novo soquete por cliente</li>" +
            "<li>Esconde: tamanhos, perdas (janela deslizante), controle de fluxo, " +
            "duplicação, ordem</li>" +
            "<li>Fluxo sem fronteiras: os dois lados combinam o formato</li>" +
            "<li>HTTP · FTP · Telnet · SMTP</li>" +
            "</ul>"
        },
        {
          title: "O que o TCP NÃO garante",
          html:
            "<ul>" +
            "<li>Perdas demais → conexão declarada <strong>desfeita</strong></li>" +
            "<li>Rede caiu ou processo caiu? <strong>Indistinguível</strong></li>" +
            "<li>Últimas mensagens entregues? <strong>Incerto</strong></li>" +
            "<li>O “caiu ou está lenta?” do Tópico 1 continua valendo</li>" +
            "</ul>"
        }
      ]
    },
    {
      title: "Representação externa de dados e empacotamento",
      html:
        "<p>Programas guardam informação em <strong>estruturas de dados</strong>; " +
        "mensagens carregam <em>sequências puras de bytes</em>. Toda comunicação " +
        "exige, portanto, uma ida e uma volta: <em>simplificar</em> as estruturas " +
        "em bytes antes de transmitir e reconstruí-las na chegada. E os dois lados " +
        "podem discordar em tudo: na ordem dos bytes de um inteiro " +
        "(<strong>big-endian</strong>, byte mais significativo primeiro, ou " +
        "<strong>little-endian</strong>), no formato de ponto flutuante, no código " +
        "de caracteres (ASCII de um byte, Unicode multibyte).</p>" +
        "<p>Há duas saídas: converter os valores para um <em>formato externo " +
        "acordado</em> antes de transmitir, ou transmiti-los <em>no formato do " +
        "remetente, com uma indicação do formato usado</em>: o destinatário " +
        "converte se precisar. Um padrão aceito para representar estruturas de " +
        "dados e valores primitivos chama-se <strong>representação externa de " +
        "dados</strong>. <strong>Empacotamento</strong> (marshalling) é montar os " +
        "itens de dados na forma adequada para transmissão; " +
        "<strong>desempacotamento</strong> (unmarshalling) é desmontá-los na " +
        "chegada. Feito à mão, o empacotamento é minucioso e propenso a erros; por " +
        "isso é gerado automaticamente ou executado pelo middleware, sem envolver o " +
        "programador. Três estratégias clássicas:</p>" +
        "<ul>" +
        "<li><strong>CDR do CORBA</strong>: binária e <em>sem informação de " +
        "tipos</em>: a mensagem carrega só os valores, pois remetente e " +
        "destinatário conhecem de antemão a ordem e os tipos dos itens, descritos " +
        "em <strong>IDL</strong> (linguagem de definição de interface), da qual um " +
        "compilador gera as operações de empacotamento. Aceita as duas ordens de " +
        "bytes: os valores viajam na ordem do remetente, indicada em cada " +
        "mensagem.</li>" +
        "<li><strong>Serialização Java</strong>: binária e <em>autossuficiente</em>: " +
        "a forma serializada inclui o nome e a versão da classe e os tipos e nomes " +
        "das variáveis; o grafo inteiro de objetos referenciados é serializado " +
        "junto, com <em>handles</em> garantindo que cada objeto seja gravado uma só " +
        "vez. A <em>reflexão</em> torna o processo genérico, sem código especial " +
        "por tipo. Variáveis <em>transientes</em> (recursos locais, como arquivos e " +
        "soquetes) ficam de fora.</li>" +
        "<li><strong>XML</strong>: <em>textual e autodescritiva</em>: dados " +
        "rotulados por tags, legíveis por humanos e independentes de plataforma; " +
        "<em>espaços de nomes</em> dão escopo às tags e <em>esquemas</em> definem e " +
        "validam a estrutura. O preço: mensagens bem maiores e mais lentas de " +
        "processar (dados binários só via base64). É a base dos serviços Web " +
        "(SOAP).</li>" +
        "</ul>" +
        '<div class="callout">' +
        '<p class="callout-title">💡 E hoje? JSON e buffers de protocolo</p>' +
        "<p>O próprio livro registra a tendência: os <strong>buffers de " +
        "protocolo</strong> do Google (binário compacto descrito por esquema) e o " +
        "<strong>JSON</strong> (texto leve nascido do JavaScript) representam um " +
        "passo em direção a estratégias mais leves que a XML. É o cardápio atual: " +
        "JSON domina as APIs Web; Protocol Buffers, a comunicação interna entre " +
        "serviços. A leitura complementar de Kleppmann aprofunda a comparação, " +
        "inclusive o problema de <em>evoluir o esquema</em> sem quebrar quem ainda " +
        "fala a versão antiga.</p>" +
        "</div>" +
        "<h3>Referências a objetos remotos</h3>" +
        "<p>Em sistemas de objetos distribuídos (Java RMI, CORBA), a mensagem de " +
        "invocação precisa dizer <em>qual</em> objeto invocar. Uma " +
        "<strong>referência de objeto remoto</strong> identifica um objeto no " +
        "sistema inteiro e deve ser única <em>no espaço e no tempo</em>: mesmo " +
        "depois que o objeto é excluído, a referência não pode ser reutilizada: " +
        "invocar um objeto que não existe mais deve produzir erro, nunca acessar " +
        "outro objeto por engano. Uma construção clássica concatena endereço IP + " +
        "porta do processo criador + hora da criação + número sequencial do objeto " +
        "+ informação da interface. Se o objeto puder migrar de processo, a " +
        "referência não pode servir de endereço: o Tópico 5 retoma o assunto.</p>",
      slides: [
        {
          title: "O problema: bytes não são objetos",
          html:
            "<ul>" +
            "<li>Estruturas de dados ⇄ sequências de bytes</li>" +
            "<li><strong>big-endian × little-endian</strong> · ponto flutuante · " +
            "ASCII × Unicode</li>" +
            "<li>Formato externo acordado <em>ou</em> formato do remetente + indicação</li>" +
            "<li><strong>Empacotar</strong> (marshalling) → transmitir → " +
            "<strong>desempacotar</strong></li>" +
            "</ul>"
        },
        {
          title: "Três estratégias clássicas",
          html:
            "<ul>" +
            "<li><strong>CDR/CORBA</strong>: binária, sem tipos: a IDL é o acordo prévio</li>" +
            "<li><strong>Java</strong>: binária, com tipos: classe + versão + reflexão</li>" +
            "<li><strong>XML</strong>: textual, autodescritiva: legível, mas grande e lenta</li>" +
            "<li>Middleware empacota sozinho: feito à mão, é fonte de erros</li>" +
            "</ul>"
        },
        {
          title: "E hoje: JSON e Protocol Buffers",
          html:
            "<ul>" +
            "<li>Passo para <strong>estratégias mais leves</strong> que a XML</li>" +
            "<li><strong>JSON</strong>: texto simples; padrão das APIs Web</li>" +
            "<li><strong>Protobuf</strong>: binário + esquema; serviços internos (Google)</li>" +
            "<li>Desafio real: <strong>evoluir o esquema</strong> sem quebrar os antigos</li>" +
            "</ul>"
        },
        {
          title: "Referências a objetos remotos",
          html:
            "<ul>" +
            "<li>Identificam o objeto no sistema todo: únicas no " +
            "<strong>espaço e no tempo</strong></li>" +
            "<li>IP + porta + hora + nº do objeto + interface</li>" +
            "<li>Nunca reutilizar: objeto excluído → <strong>erro</strong>, jamais " +
            "outro objeto</li>" +
            "<li>Se o objeto migra, a referência não é endereço (Tópico 5)</li>" +
            "</ul>"
        }
      ]
    },
    {
      title: "Comunicação em grupo: multicast, sobreposições e MPI",
      html:
        "<p>A troca de mensagens <em>aos pares</em> não serve bem quando um " +
        "processo precisa falar com um <strong>grupo</strong>, por exemplo, com um " +
        "serviço replicado em vários computadores para tolerar falhas. O " +
        "<strong>multicast</strong> envia uma única mensagem a todos os membros de " +
        "um grupo de processos, com a participação transparente para o remetente. " +
        "Quatro usos o motivam:</p>" +
        "<ul>" +
        "<li><strong>Tolerância a falhas por replicação</strong>: requisições " +
        "difundidas a um grupo de servidores que executam as mesmas operações; se " +
        "alguns falham, os demais seguem atendendo;</li>" +
        "<li><strong>Descoberta de serviços</strong>: localizar os servidores de " +
        "descoberta em redes espontâneas (é o que o Jini faz);</li>" +
        "<li><strong>Desempenho por dados replicados</strong>: propagar cada " +
        "mudança a todas as réplicas;</li>" +
        "<li><strong>Notificações de eventos</strong>: um status muda e todos os " +
        "interessados sabem (a base do publicar-assinar).</li>" +
        "</ul>" +
        "<h3>Multicast IP</h3>" +
        "<p>O <strong>multicast IP</strong> transmite um único datagrama a um " +
        "<em>grupo multicast</em>, identificado por um endereço IP classe D " +
        "(224.0.0.0 a 239.255.255.255). A participação é dinâmica (computadores " +
        "entram e saem quando querem) e dá até para enviar sem ser membro. Para o " +
        "programador, está disponível <em>apenas via UDP</em>: datagramas comuns " +
        "com endereço de grupo (em Java, um MulticastSocket entra no grupo com " +
        "joinGroup; processos do mesmo computador podem, aqui sim, compartilhar a " +
        "porta). O <strong>TTL</strong> limita quantos roteadores o datagrama " +
        "atravessa: o padrão 1 restringe à rede local. Endereços podem ser " +
        "<em>permanentes</em>, atribuídos pelo IANA (224.0.1.1 é do protocolo NTP), " +
        "ou <em>temporários</em>, criados sob demanda.</p>" +
        "<p><strong>Modelo de falhas</strong>: o mesmo do UDP: <em>omissão</em>. " +
        "Qualquer destino pode descartar por buffer cheio, e um datagrama perdido " +
        "entre roteadores some para todos os membros dali em diante. Resultado: " +
        "<em>alguns membros recebem, outros não</em>: o multicast IP é um " +
        "<strong>multicast não confiável</strong>. Também não há garantias de " +
        "ordem: membros diferentes podem receber as mensagens em ordens " +
        "diferentes.</p>" +
        "<p>Para o serviço replicado do primeiro exemplo, isso é fatal: réplicas " +
        "que perdem uma operação, ou que as aplicam em ordem diferente, divergem. " +
        "Ele exige <strong>multicast confiável</strong>: entrega <em>tudo ou " +
        "nada</em> (atômica), e, quase sempre, <strong>totalmente ordenado</strong>: " +
        "todos os membros recebem todas as mensagens na mesma ordem. Construir " +
        "essas garantias sobre uma rede que não as dá é assunto do Tópico 10 " +
        "(Replicação).</p>" +
        "<h3>Redes de sobreposição: reinventar a rede sem trocá-la</h3>" +
        "<p>E quando a rede não fornece o que a aplicação precisa (multicast entre " +
        "domínios, por exemplo)? Constrói-se uma <strong>rede de sobreposição</strong> " +
        "(overlay): uma rede <em>virtual</em>, de nós e enlaces virtuais, montada " +
        "sobre a rede existente: com endereçamento, protocolos e roteamento " +
        "próprios. Exemplos: as <em>tabelas de hashing distribuídas</em> (DHTs, com " +
        "roteamento baseado em chave), o compartilhamento de arquivos " +
        "<em>peer-to-peer</em>, as <em>redes de distribuição de conteúdo</em> " +
        "(CDNs), o MBone para multicast, sobreposições de resiliência e as VPNs. " +
        "Vantagens: novos serviços <em>sem mudar a rede subjacente</em>, " +
        "experimentação e várias sobreposições coexistindo; o custo é um nível " +
        "extra de indireção (desempenho) e mais complexidade. É uma resposta " +
        "elegante ao dilema fim-a-fim do Tópico 2: otimizar a rede para <em>uma</em> " +
        "aplicação sem impor isso a todas.</p>" +
        "<p>O <strong>Skype</strong> é o estudo de caso: VoIP peer-to-peer sobre a " +
        "Internet comum. Hosts comuns e <strong>supernós</strong>, hosts promovidos " +
        "por terem banda, endereço IP global (sem NAT) e boa disponibilidade, " +
        "formam a sobreposição. O login é autenticado em um servidor conhecido; a " +
        "busca por um usuário é orquestrada pelo supernó do cliente e contata, em " +
        "média, oito supernós (três a quatro segundos). A voz usa TCP para " +
        "sinalização e <em>preferencialmente UDP</em> para o áudio: com TCP e nós " +
        "intermediários para atravessar firewalls.</p>" +
        "<h3>MPI: passagem de mensagens de alto desempenho</h3>" +
        "<p>Na computação de alto desempenho, a passagem de mensagens é usada em " +
        "estado puro, pelo padrão <strong>MPI</strong> (Message Passing Interface, " +
        "1994): uma interface portável, com mais de 115 operações, que separa " +
        "explicitamente as duas dimensões da primeira seção: síncrono/assíncrono e " +
        "bloqueante/não bloqueante. Só de send bloqueante há quatro variantes: " +
        "MPI_Send (genérico: retorna quando for “seguro” reutilizar o " +
        "buffer da aplicação), MPI_Ssend (síncrono: só retorna com a mensagem " +
        "entregue), MPI_Bsend (copia para um buffer explícito da biblioteca) e " +
        "MPI_Rsend (o programador <em>afirma</em> que o receptor já está pronto, " +
        "permitindo otimizações, e falhando se a suposição for falsa). As " +
        "variantes não bloqueantes (MPI_Isend etc.) retornam imediatamente e são " +
        "acompanhadas com MPI_Wait e MPI_Test. Há ainda comunicação " +
        "<em>coletiva</em>: scatter (um para muitos) e gather (muitos para um).</p>" +
        /* Área reservada para demonstração interativa futura. */
        '<div class="demo-area" data-demo="sockets-mensagens">' +
        '<span class="demo-placeholder-icon" aria-hidden="true">🧪</span>' +
        "<p><strong>Demonstração interativa (em breve)</strong></p>" +
        "<p>Espaço reservado para uma simulação de troca de mensagens entre processos (sockets UDP/TCP, multicast).</p>" +
        "</div>",
      slides: [
        {
          title: "Multicast: falar com o grupo",
          html:
            "<ul>" +
            "<li>Uma mensagem → <strong>todos os membros</strong>; grupo transparente " +
            "ao remetente</li>" +
            "<li><strong>Replicação</strong> tolerante a falhas · " +
            "<strong>descoberta</strong> de serviços</li>" +
            "<li>Dados replicados por desempenho · <strong>notificações</strong> " +
            "(publicar-assinar)</li>" +
            "</ul>"
        },
        {
          title: "Multicast IP: UDP para grupos",
          html:
            "<ul>" +
            "<li>Endereço <strong>classe D</strong> (224.x, 239.x) · entra/sai quando quiser</li>" +
            "<li>Só via <strong>UDP</strong> · <strong>TTL</strong> limita o alcance " +
            "(padrão: rede local)</li>" +
            "<li>Permanentes (IANA, NTP: 224.0.1.1) × temporários</li>" +
            "</ul>"
        },
        {
          title: "O que falta: confiabilidade e ordem",
          html:
            "<ul>" +
            "<li>Falhas do UDP: alguns membros recebem, outros não</li>" +
            "<li>→ multicast IP é <strong>não confiável</strong>, sem ordem garantida</li>" +
            "<li>Réplicas exigem: <strong>tudo ou nada</strong> + <strong>mesma " +
            "ordem</strong> em todos</li>" +
            "<li>Multicast confiável e totalmente ordenado → Tópico 10</li>" +
            "</ul>"
        },
        {
          title: "Sobreposições (overlays) e o Skype",
          html:
            "<ul>" +
            "<li>Rede <strong>virtual</strong> sobre a rede: endereçamento e " +
            "roteamento próprios</li>" +
            "<li>DHTs · peer-to-peer · CDNs · MBone · VPNs</li>" +
            "<li>Novos serviços <strong>sem mudar a Internet</strong> · custo: indireção</li>" +
            "<li><strong>Skype</strong>: supernós, busca P2P, áudio por UDP</li>" +
            "</ul>"
        },
        {
          title: "MPI: mensagens de alto desempenho",
          html:
            "<ul>" +
            "<li>Padrão portável (1994) · &gt;115 operações</li>" +
            "<li>Bloqueantes: <strong>MPI_Send</strong> · Ssend (entregue) · Bsend " +
            "(buffer) · Rsend (“pronto”)</li>" +
            "<li>Não bloqueantes: MPI_Isend… + <strong>MPI_Wait/MPI_Test</strong></li>" +
            "<li>Coletivas: <strong>scatter</strong> (1→N) · <strong>gather</strong> (N→1)</li>" +
            "</ul>"
        }
      ]
    }
  ],

  quiz: [
    {
      question:
        "Na forma SÍNCRONA de comunicação por passagem de mensagens, o que acontece quando um processo executa a operação send?",
      options: [
        "O send retorna imediatamente, assim que a mensagem é copiada para um buffer local.",
        "O processo remetente fica bloqueado até que o receive correspondente seja executado no destino.",
        "A mensagem é descartada se o destinatário não estiver esperando naquele momento.",
        "O send retorna um identificador de pedido para consulta posterior, como no MPI_Isend."
      ],
      answer: 1,
      explanation:
        "Na comunicação síncrona, send e receive são operações bloqueantes e os " +
        "dois processos se sincronizam a cada mensagem: quem envia espera o receive " +
        "correspondente; quem recebe espera a mensagem chegar. O retorno imediato " +
        "após a cópia para um buffer local descreve o send ASSÍNCRONO."
    },
    {
      question:
        "O DNS e o VoIP são implementados sobre UDP. O que torna o UDP atraente para esses usos?",
      options: [
        "Ele garante entrega ordenada usando menos mensagens que o TCP.",
        "Ele usa endereços classe D, que os roteadores encaminham mais rápido.",
        "Ele retransmite datagramas perdidos automaticamente, sem manter estado.",
        "Ele evita as sobrecargas da entrega garantida: manter estado na origem e no destino, mensagens extras de confirmação e a latência imposta ao remetente."
      ],
      answer: 3,
      explanation:
        "O UDP não promete nada, e por isso não paga as três sobrecargas da " +
        "entrega garantida: informações de estado nos dois lados, mensagens de " +
        "confirmação e latência do remetente. Para o DNS, basta repetir a consulta " +
        "perdida; para o VoIP, retransmitir áudio atrasado seria inútil."
    },
    {
      question:
        "Quando o software TCP declara uma conexão desfeita (após retransmissões demais sem confirmação), o que os processos que a usavam NÃO conseguem saber?",
      options: [
        "Se a falha foi da rede ou do processo do outro lado, e se as últimas mensagens enviadas chegaram ou não.",
        "Qual era o número da porta remota usada pela conexão.",
        "Quantos bytes haviam sido transmitidos desde o início da conexão.",
        "Se as somas de verificação dos segmentos recebidos estavam corretas."
      ],
      answer: 0,
      explanation:
        "A notificação de conexão desfeita não distingue falha de rede de falha do " +
        "processo remoto, e não diz o destino das mensagens recentes. Por isso o " +
        "TCP não fornece comunicação confiável no sentido forte: a incerteza " +
        "'caiu ou está lenta?' do Tópico 1 permanece."
    },
    {
      question:
        "Por que uma mensagem no CDR do CORBA pode omitir os tipos dos dados que transporta?",
      options: [
        "Porque o CDR transporta apenas strings, que dispensam informação de tipo.",
        "Porque o destinatário deduz os tipos a partir do tamanho total da mensagem.",
        "Porque remetente e destinatário têm conhecimento prévio da ordem e dos tipos dos itens, descritos na interface (IDL) da qual as operações de empacotamento são geradas.",
        "Porque os tipos viajam separadamente, em um documento XML anexo."
      ],
      answer: 2,
      explanation:
        "No CORBA, os tipos dos argumentos e resultados estão especificados na IDL, " +
        "e o compilador da interface gera o empacotamento e o desempacotamento a " +
        "partir dela. Como os dois lados compartilham esse acordo prévio, a " +
        "mensagem só precisa carregar os valores: ao contrário da serialização " +
        "Java e da XML, que embutem a informação de tipo."
    },
    {
      question:
        "Qual é o modelo de falhas do multicast IP?",
      options: [
        "Entrega atômica, ou todos os membros do grupo recebem a mensagem, ou nenhum recebe.",
        "O mesmo do UDP: falhas por omissão: alguns membros do grupo podem receber a mensagem e outros não (multicast não confiável), sem garantias de ordem.",
        "Entrega garantida a todos, mas possivelmente em ordens diferentes.",
        "Perda só ocorre quando o TTL do datagrama chega a zero."
      ],
      answer: 1,
      explanation:
        "O multicast IP herda as falhas por omissão do UDP: um destino pode " +
        "descartar por buffer cheio, e uma perda entre roteadores elimina a " +
        "mensagem para todos os membros além daquele ponto. Alguns recebem, outros " +
        "não, e a ordem também não é garantida. Entrega 'tudo ou nada' é " +
        "justamente o que o multicast CONFIÁVEL acrescenta."
    },
    {
      question:
        "Um serviço replicado no qual todas as réplicas partem do mesmo estado e executam as mesmas operações exige quais garantias do multicast?",
      options: [
        "Apenas baixa latência: réplicas inconsistentes se corrigem sozinhas.",
        "Criptografia fim-a-fim entre as réplicas.",
        "Multicast confiável (entrega tudo ou nada) e totalmente ordenado (todos os membros recebem as mensagens na mesma ordem).",
        "Somente um TTL alto, para que os datagramas alcancem todas as réplicas."
      ],
      answer: 2,
      explanation:
        "Se uma réplica perde uma operação, ela diverge das demais: por isso a " +
        "entrega precisa ser atômica (tudo ou nada). E se as réplicas aplicarem as " +
        "mesmas operações em ordens diferentes, também divergem: por isso o " +
        "ordenamento total. O multicast IP não dá nenhuma das duas garantias; o " +
        "Tópico 10 mostra como construí-las."
    }
  ],

  glossary: [
    {
      term: "Comunicação síncrona",
      definition:
        "Forma de passagem de mensagens em que send e receive são operações " +
        "bloqueantes: o remetente espera o receive correspondente e o destinatário " +
        "espera a mensagem chegar: os dois processos se sincronizam a cada " +
        "mensagem."
    },
    {
      term: "Comunicação assíncrona",
      definition:
        "Forma de passagem de mensagens em que o send é não bloqueante: retorna " +
        "assim que a mensagem é copiada para um buffer local, e a transmissão " +
        "ocorre em paralelo com o processo remetente."
    },
    {
      term: "Porta",
      definition:
        "Destino de mensagem dentro de um computador, identificado por um valor " +
        "inteiro (2¹⁶ por computador). Tem exatamente um destino (processo " +
        "receptor), mas pode ter muitos remetentes; junto com o endereço IP, forma " +
        "o destino completo de uma mensagem na Internet."
    },
    {
      term: "Soquete (socket)",
      definition:
        "Abstração de ponto de destino da comunicação entre processos, originária " +
        "do UNIX BSD. Para receber mensagens, é vinculado a uma porta local e a um " +
        "endereço IP; o mesmo soquete envia e recebe, e cada soquete é associado a " +
        "um único protocolo (UDP ou TCP)."
    },
    {
      term: "Empacotamento (marshalling)",
      definition:
        "Procedimento de montar um conjunto de itens de dados em uma forma " +
        "conveniente para transmissão em uma mensagem, convertendo-os para a " +
        "representação externa de dados. O inverso, na chegada, é o " +
        "desempacotamento (unmarshalling)."
    },
    {
      term: "Representação externa de dados",
      definition:
        "Padrão aceito para representar estruturas de dados e valores primitivos " +
        "de forma independente das diferenças entre computadores (ordem de bytes, " +
        "ponto flutuante, códigos de caracteres). Exemplos: CDR do CORBA, XDR da " +
        "Sun, XML, JSON."
    },
    {
      term: "Serialização (Java)",
      definition:
        "Atividade de simplificar um objeto (ou um grafo de objetos conectados) " +
        "em uma forma sequencial que inclui nome, versão e tipos da classe, " +
        "adequada para transmissão ou armazenamento. Usa reflexão para funcionar " +
        "de forma genérica, sem código específico por tipo."
    },
    {
      term: "Referência de objeto remoto",
      definition:
        "Identificador de um objeto remoto válido em todo o sistema distribuído, " +
        "único no espaço e no tempo (nunca reutilizado após a exclusão do objeto). " +
        "Construção clássica: endereço IP + porta do processo criador + hora da " +
        "criação + número do objeto + interface."
    },
    {
      term: "Multicast IP",
      definition:
        "Transmissão de um único datagrama a um grupo multicast, identificado por " +
        "um endereço IP classe D. A participação é dinâmica, o acesso do " +
        "programador é via UDP e o TTL limita o alcance. Sofre de falhas por " +
        "omissão. É um multicast não confiável."
    },
    {
      term: "Multicast confiável",
      definition:
        "Multicast com entrega atômica ('tudo ou nada'): qualquer mensagem " +
        "transmitida é recebida por todos os membros do grupo ou por nenhum. Na " +
        "variante totalmente ordenada, todos os membros recebem todas as mensagens " +
        "na mesma ordem: requisito típico de serviços replicados."
    },
    {
      term: "Rede de sobreposição (overlay)",
      definition:
        "Rede virtual de nós e enlaces virtuais construída sobre uma rede " +
        "existente (como a Internet), com endereçamento, protocolos e roteamento " +
        "próprios, para oferecer serviços que a rede subjacente não fornece: " +
        "DHTs, peer-to-peer, CDNs, multicast, VPNs."
    },
    {
      term: "MPI (Message Passing Interface)",
      definition:
        "Padrão de passagem de mensagens da computação de alto desempenho (1994), " +
        "portável entre sistemas operacionais e linguagens, com mais de 115 " +
        "operações que separam explicitamente as dimensões síncrono/assíncrono e " +
        "bloqueante/não bloqueante, além de comunicação coletiva (scatter/gather)."
    }
  ],

  references: [
    "COULOURIS, G.; DOLLIMORE, J.; KINDBERG, T.; BLAIR, G. Sistemas Distribuídos: " +
    "Conceitos e Projeto. 5. ed. Porto Alegre: Bookman, 2013. Cap. 4. Comunicação " +
    "Entre Processos (pp. 145-183).",
    "VAN STEEN, M.; TANENBAUM, A. S. Distributed Systems. 4. ed. (versão DS 4.03). " +
    "distributed-systems.net. Cap. 4. Communication (leitura complementar: " +
    "fundamentos, RPC, comunicação orientada a mensagens e multicast).",
    "KLEPPMANN, M. Designing Data-Intensive Applications. Sebastopol: O'Reilly, " +
    "2017. Cap. 5. Encoding and Evolution (leitura complementar: JSON, Protocol " +
    "Buffers e evolução de esquemas)."
  ]
};
