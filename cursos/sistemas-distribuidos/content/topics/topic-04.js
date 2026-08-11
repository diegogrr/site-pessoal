/* ============================================================
   topic-04.js — Comunicação entre Processos
   ------------------------------------------------------------
   Estrutura documentada no modelo topic-01.js (sections[] com
   slides[] opcionais, quiz[], glossary[], references[]).
   Fundamentação: manifesto em docs/fontes/topico-04.json, que liga
   cada seção às páginas que a autorizam. Hierarquia de fontes em
   docs/fontes/README.md — o van Steen 4. ed. manda no conteúdo
   (4.1.2, 4.3 e 4.4, mais 3.4.1 e 3.4.4) e o Coulouris (caps. 4
   e 6) dá o esqueleto. Redesenho fechado em 2026-08-06, registrado
   em docs/fontes/README.md, seções 3.2 e 3.6.
   ============================================================ */

window.SD = window.SD || {};
SD.content = SD.content || {};

SD.content["04"] = {

  sections: [
    {
      title: "Os dois eixos e o soquete",
      html:
        "<p>O tópico 03 terminou com o pacote chegando ao computador de destino. Falta o " +
        "trecho final do caminho, que é o mais curto e o menos óbvio. O pacote alcançou a " +
        "máquina, mas ainda precisa alcançar o <strong>processo</strong> certo dentro " +
        "dela, e esse processo precisa saber o que fazer com a sequência de bytes que " +
        "recebeu.</p>" +
        "<p>Toda a distribuição se apoia em duas operações. Um processo executa " +
        "<code>send</code> para entregar uma mensagem a um destino, e outro executa " +
        "<code>receive</code> para retirá-la de lá. Invocação remota, replicação, " +
        "consenso e sistema de arquivos distribuído são construções feitas por cima desse " +
        "par, e nenhuma delas consegue ser mais confiável do que ele.</p>" +
        "<p>Cada destino de mensagem tem uma fila associada. O processo remetente faz a " +
        "mensagem ser acrescentada a uma fila remota, e o processo destino retira " +
        "mensagens da fila local dele. É essa fila que permite alguma folga entre os dois " +
        "lados, e é dela que nasce a primeira pergunta de projeto do tópico.</p>" +
        "<h3>Os dois eixos que classificam toda comunicação</h3>" +
        "<p>Dizer que um sistema troca mensagens não informa quase nada, porque a " +
        "expressão cobre arranjos que se comportam de maneiras opostas quando alguma " +
        "coisa falha. Vale então organizar essas possibilidades em dois eixos " +
        "independentes, e essa grade é o esqueleto do tópico inteiro.</p>" +
        "<p>O primeiro eixo pergunta por quanto tempo o sistema de comunicação guarda a " +
        "mensagem. Na <strong>comunicação persistente</strong>, o middleware armazena a " +
        "mensagem pelo tempo que for preciso para entregá-la. O remetente pode encerrar " +
        "logo depois de submetê-la, e o destinatário nem precisava estar em execução no " +
        "momento do envio. O correio eletrônico é o exemplo mais conhecido.</p>" +
        "<p>Na <strong>comunicação transiente</strong>, o sistema guarda a mensagem " +
        "apenas enquanto as duas aplicações estiverem em execução. Se a entrega não puder " +
        "acontecer, seja porque a transmissão foi interrompida, seja porque o " +
        "destinatário não está ativo, a mensagem é descartada. Todo serviço de nível de " +
        "transporte oferece somente comunicação transiente, e o roteador que não consegue " +
        "repassar um pacote adiante simplesmente o joga fora.</p>" +
        "<p>O segundo eixo pergunta se quem enviou continua trabalhando. Na " +
        "<strong>comunicação assíncrona</strong>, o remetente prossegue imediatamente " +
        "depois de submeter a mensagem, que fica guardada pelo middleware no ato da " +
        "submissão. Na <strong>comunicação síncrona</strong>, o remetente fica bloqueado " +
        "até saber que o pedido dele foi aceito.</p>" +
        "<p>A palavra aceito esconde uma ambiguidade que vale desfazer, porque a " +
        "sincronização pode acontecer em três lugares diferentes do percurso.</p>" +
        '<figure class="figura" id="fig-pontos-sincronizacao">' +
        '<svg viewBox="0 0 600 300" role="img" ' +
        'aria-labelledby="fig-pontos-sincronizacao-titulo">' +
        '<title id="fig-pontos-sincronizacao-titulo">Três linhas de vida verticais, do ' +
        "remetente, do middleware e do destinatário. A mensagem sai do remetente para o " +
        "middleware, é encaminhada ao destinatário, é processada por ele e volta como " +
        "resposta. Três marcas numeradas na linha do remetente mostram os pontos em que " +
        "ele pode ser desbloqueado, na submissão, na entrega e na resposta.</title>" +
        '<rect class="caixa" x="70" y="8" width="120" height="34" rx="8"/>' +
        '<text x="130" y="30" text-anchor="middle" font-size="14">Remetente</text>' +
        '<rect class="caixa-destaque" x="250" y="8" width="120" height="34" rx="8"/>' +
        '<text x="310" y="30" text-anchor="middle" font-size="14">Middleware</text>' +
        '<rect class="caixa" x="430" y="8" width="120" height="34" rx="8"/>' +
        '<text x="490" y="30" text-anchor="middle" font-size="14">Destinatário</text>' +
        '<path class="traco" stroke-dasharray="4 5" d="M130 46 L130 288"/>' +
        '<path class="traco" stroke-dasharray="4 5" d="M310 46 L310 288"/>' +
        '<path class="traco" stroke-dasharray="4 5" d="M490 46 L490 288"/>' +
        '<text class="rotulo-secundario" x="220" y="82" text-anchor="middle" ' +
        'font-size="13">submete</text>' +
        '<path class="traco" d="M130 92 L298 92"/>' +
        '<path class="seta" d="M298 86 L298 98 L310 92 Z"/>' +
        '<circle class="caixa-destaque" cx="34" cy="92" r="13"/>' +
        '<text x="34" y="97" text-anchor="middle" font-size="14">1</text>' +
        '<path class="traco" stroke-dasharray="2 4" d="M47 92 L117 92"/>' +
        '<text class="rotulo-secundario" x="400" y="137" text-anchor="middle" ' +
        'font-size="13">entrega</text>' +
        '<path class="traco" d="M310 147 L478 147"/>' +
        '<path class="seta" d="M478 141 L478 153 L490 147 Z"/>' +
        '<circle class="caixa-destaque" cx="34" cy="147" r="13"/>' +
        '<text x="34" y="152" text-anchor="middle" font-size="14">2</text>' +
        '<path class="traco" stroke-dasharray="2 4" d="M47 147 L117 147"/>' +
        '<rect class="caixa" x="466" y="172" width="48" height="44" rx="6"/>' +
        '<text class="rotulo-secundario" x="524" y="199" font-size="13">processa</text>' +
        '<text class="rotulo-secundario" x="310" y="247" text-anchor="middle" ' +
        'font-size="13">responde</text>' +
        '<path class="traco" d="M490 257 L142 257"/>' +
        '<path class="seta" d="M142 251 L142 263 L130 257 Z"/>' +
        '<circle class="caixa-destaque" cx="34" cy="257" r="13"/>' +
        '<text x="34" y="262" text-anchor="middle" font-size="14">3</text>' +
        '<path class="traco" stroke-dasharray="2 4" d="M47 257 L117 257"/>' +
        "</svg>" +
        "<figcaption>Os três pontos em que a comunicação síncrona pode desbloquear o " +
        "remetente. No ponto 1 ele espera apenas o middleware assumir a transmissão. No " +
        "ponto 2 espera a mensagem chegar ao destinatário. No ponto 3 espera o " +
        "destinatário processar e responder.</figcaption>" +
        "</figure>" +
        "<p>Os três pontos custam coisas diferentes e prometem coisas diferentes. " +
        "Desbloquear na submissão devolve o controle quase de imediato e não promete nada " +
        "sobre o outro lado. Desbloquear na entrega promete que a mensagem chegou, mas " +
        "não que ela foi compreendida. Desbloquear na resposta é a promessa mais forte e " +
        "também a mais cara, porque o remetente passa a pagar o tempo de processamento " +
        "alheio.</p>" +
        "<p>Os dois eixos combinados produzem quatro arranjos, e dois deles concentram a " +
        "maior parte do que se encontra em produção.</p>" +
        '<div class="tabela-rolagem">' +
        '<table class="tabela-conteudo" id="tab-eixos-comunicacao">' +
        "<tr><th>Combinação</th><th>Como se comporta</th><th>Onde aparece</th></tr>" +
        "<tr><td>Persistente e assíncrona</td>" +
        "<td>O remetente submete e segue adiante, e o middleware guarda a mensagem até " +
        "conseguir entregá-la.</td>" +
        "<td>O correio eletrônico funciona assim.</td></tr>" +
        "<tr><td>Persistente e síncrona na submissão</td>" +
        "<td>O remetente espera somente a confirmação de que o middleware assumiu a " +
        "transmissão.</td>" +
        "<td>É o esquema comum dos sistemas de fila de mensagens, tratados na seção 4.</td></tr>" +
        "<tr><td>Transiente e síncrona na resposta</td>" +
        "<td>O remetente fica bloqueado até o destinatário processar o pedido e devolver " +
        "o resultado.</td>" +
        "<td>Corresponde à chamada de procedimento remoto, que o tópico 05 detalha.</td></tr>" +
        "<tr><td>Transiente e assíncrona</td>" +
        "<td>O remetente segue adiante, e a mensagem se perde se o destinatário não " +
        "estiver ativo naquele instante.</td>" +
        "<td>Aparece no datagrama disparado sem espera de resposta.</td></tr>" +
        "</table>" +
        "</div>" +
        "<p>A tabela também antecipa o roteiro deste tópico. A seção 4 trata do quadrante " +
        "persistente, onde moram as filas de mensagens, e todo o resto vive no quadrante " +
        "transiente, que é onde o soquete opera.</p>" +
        "<h3>O soquete, que é o ponto de contato</h3>" +
        "<p>O <strong>soquete</strong> é um ponto de extremidade da comunicação, e existe " +
        "para dar ao programa um objeto no qual escrever os dados que saem e do qual ler " +
        "os dados que chegam. Ele funciona como abstração sobre a porta que o sistema " +
        "operacional usa para um protocolo de transporte específico, o que implica que " +
        "cada soquete pertence a um protocolo só.</p>" +
        "<p>Para receber mensagens, o soquete precisa estar vinculado a uma porta local e " +
        "a um dos endereços de rede da máquina em que executa. Daí decorre uma regra que " +
        "costuma surpreender quem programa pela primeira vez, porque um processo não " +
        "compartilha uma porta com outro processo da mesma máquina, embora qualquer " +
        "número de processos possa enviar mensagens para a mesma porta. A porta tem um " +
        "destinatário e muitos remetentes.</p>" +
        "<p>A interface de soquetes nasceu no Berkeley Unix nos anos 1970 e foi " +
        "padronizada depois com pouquíssimas adaptações, o que explica por que o mesmo " +
        "conjunto de operações reaparece em Linux, Windows e macOS. São oito operações, e o servidor " +
        "executa as quatro primeiras normalmente nessa ordem.</p>" +
        '<div class="tabela-rolagem">' +
        '<table class="tabela-conteudo" id="tab-operacoes-soquete">' +
        "<tr><th>Operação</th><th>O que ela faz</th></tr>" +
        "<tr><td><code>socket</code></td>" +
        "<td>Cria um ponto de extremidade novo para um protocolo de transporte, e o " +
        "sistema operacional reserva ali os recursos de envio e de recepção.</td></tr>" +
        "<tr><td><code>bind</code></td>" +
        "<td>Associa um endereço local ao soquete, avisando o sistema operacional de que " +
        "só interessam as mensagens daquele endereço e daquela porta.</td></tr>" +
        "<tr><td><code>listen</code></td>" +
        "<td>Informa quantos pedidos de conexão pendentes o servidor aceita enfileirar, " +
        "sem bloquear quem chamou.</td></tr>" +
        "<tr><td><code>accept</code></td>" +
        "<td>Bloqueia quem chamou até um pedido de conexão chegar, e devolve um soquete " +
        "novo dedicado àquela conversa.</td></tr>" +
        "<tr><td><code>connect</code></td>" +
        "<td>Tenta ativamente estabelecer a conexão com o endereço de transporte que o " +
        "chamador indicou.</td></tr>" +
        "<tr><td><code>send</code></td><td>Envia dados pela conexão já estabelecida.</td></tr>" +
        "<tr><td><code>receive</code></td><td>Recebe dados pela conexão já estabelecida.</td></tr>" +
        "<tr><td><code>close</code></td><td>Libera a conexão.</td></tr>" +
        "</table>" +
        "</div>" +
        "<p>A operação <code>accept</code> guarda a sutileza que permite ao servidor " +
        "atender mais de um cliente. Quando um pedido de conexão chega, o sistema " +
        "operacional cria um soquete <em>novo</em>, com as mesmas propriedades do " +
        "original, e devolve esse novo a quem chamou. O servidor entrega a conversa a uma " +
        "thread ou a um processo filho e volta a esperar no soquete original, que " +
        "continua livre para receber o próximo pedido.</p>" +
        "<p>Do lado do cliente a sequência é mais curta. Ele também cria um soquete, mas " +
        "não precisa vinculá-lo explicitamente a um endereço, porque o sistema " +
        "operacional aloca uma porta dinamicamente quando a conexão sobe. A operação " +
        "<code>connect</code> bloqueia até a conexão ficar estabelecida, e a partir daí " +
        "os dois lados trocam dados pelas mesmas duas operações. Encerrar é simétrico, " +
        "com os dois chamando <code>close</code>.</p>" +
        "<h3>O que o transporte promete, e o que ele não promete</h3>" +
        "<p>Escolher entre UDP e TCP é escolher o que o sistema operacional faz por você " +
        "e o que sobra para o seu código. O tópico 03 apresentou os dois protocolos por " +
        "dentro. Aqui interessa o que cada um entrega à aplicação, e principalmente o que " +
        "ele deixa de entregar.</p>" +
        "<p>O datagrama UDP viaja sem confirmação e sem nova tentativa de envio. Havendo " +
        "falha, a mensagem pode não chegar, e a aplicação não fica sabendo. Some-se a " +
        "isso que o destinatário precisa oferecer um vetor de bytes de tamanho definido, " +
        "e a mensagem maior que esse vetor chega truncada.</p>" +
        "<p>Duas fontes de perda merecem atenção porque nenhuma delas envolve a rede. A " +
        "mensagem pode ser descartada por erro de soma de verificação, e pode ser " +
        "descartada por falta de espaço em buffer, tanto na origem quanto no destino. Há " +
        "ainda um terceiro caso que confunde muita gente, porque a mensagem endereçada a " +
        "uma porta sem soquete vinculado é descartada em silêncio, sem que erro nenhum " +
        "volte ao remetente.</p>" +
        "<p>Em compensação, o UDP não paga três sobrecargas que a entrega garantida " +
        "cobra. Ele não guarda informação de estado na origem nem no destino, não " +
        "transmite mensagens adicionais de confirmação e não impõe latência ao remetente. " +
        "É por isso que o DNS e a voz sobre IP rodam sobre UDP, já que nos dois casos " +
        "repetir a pergunta sai mais barato que sustentar uma conexão.</p>" +
        "<p>O fluxo TCP faz o oposto e esconde quatro características da rede atrás da " +
        "abstração de um fluxo de bytes. A aplicação escolhe o volume que envia e o que " +
        "lê, sem pensar em pacotes. As perdas são tratadas por confirmação e " +
        "retransmissão. O controle de fluxo bloqueia quem escreve rápido demais até que " +
        "quem lê tenha consumido o suficiente. E os números de sequência descartam " +
        "duplicatas e recolocam em ordem o que chegou fora dela.</p>" +
        "<p>Nada disso sai de graça, e o preço aparece antes da primeira mensagem útil. " +
        "Os dois processos estabelecem uma conexão antes de poderem se comunicar, com um " +
        "<code>connect</code> partindo do cliente e um <code>accept</code> respondendo do " +
        "servidor. Num modelo cliente-servidor em que cada requisição é seguida de uma " +
        "resposta curta, essa montagem representa uma sobrecarga considerável por " +
        "requisição.</p>" +
        "<p>Falta a parte que costuma ficar de fora. <strong>O TCP não fornece " +
        "comunicação confiável.</strong> Ele garante a entrega diante da perda de alguns " +
        "pacotes, mas, se a perda ultrapassar um limite, ou se a rede se romper ou " +
        "congestionar seriamente, o software de envio deixa de receber confirmações e, " +
        "depois de certo tempo, declara a conexão desfeita.</p>" +
        "<p>O que acontece a seguir é o assunto de fundo da disciplina inteira. O " +
        "processo que tenta ler ou escrever recebe uma notificação de erro, e esse erro " +
        "tem duas propriedades incômodas. Ele não distingue falha de rede de falha do " +
        "processo do outro lado, e não informa se as mensagens enviadas há pouco chegaram " +
        "a ser recebidas.</p>" +
        "<p>Guarde essas duas frases, porque elas reaparecem em quase todo o resto do " +
        "curso. A incerteza que o tópico 02 classificou como falha por omissão não é um " +
        "defeito de implementação que uma biblioteca melhor resolveria. Ela é o que sobra " +
        "depois que o melhor protocolo de transporte disponível fez tudo o que podia " +
        "fazer.</p>",
      slides: [
        {
          title: "O último trecho do caminho",
          html:
            "<ul>" +
            "<li>O tópico 03 entregou o pacote à <strong>máquina</strong></li>" +
            "<li>Falta alcançar o <strong>processo</strong> certo dentro dela</li>" +
            "<li>Duas operações sustentam tudo, <code>send</code> e <code>receive</code></li>" +
            "<li>Nada construído em cima é mais confiável que esse par</li>" +
            "</ul>"
        },
        {
          title: "Os dois eixos",
          html:
            "<ul>" +
            "<li><strong>Persistente</strong>, o middleware guarda até entregar</li>" +
            "<li><strong>Transiente</strong>, guarda só enquanto os dois executam</li>" +
            "<li><strong>Assíncrona</strong>, o remetente segue adiante</li>" +
            "<li><strong>Síncrona</strong>, o remetente espera o aceite</li>" +
            "</ul>"
        },
        {
          title: "As quatro combinações",
          ref: "tab-eixos-comunicacao"
        },
        {
          title: "Três pontos de sincronização",
          html:
            "<ul>" +
            "<li>Na submissão, o middleware assumiu a transmissão</li>" +
            "<li>Na entrega, a mensagem chegou ao destinatário</li>" +
            "<li>Na resposta, o outro lado processou e devolveu</li>" +
            "</ul>",
          ref: "fig-pontos-sincronizacao"
        },
        {
          title: "O soquete",
          html:
            "<ul>" +
            "<li>Ponto de extremidade, abstração sobre a porta</li>" +
            "<li>Uma porta tem <strong>um destinatário</strong> e muitos remetentes</li>" +
            "<li><code>accept</code> devolve um soquete <em>novo</em> por conversa</li>" +
            "<li>O cliente dispensa <code>bind</code>, o sistema aloca a porta</li>" +
            "</ul>"
        },
        {
          title: "As oito operações de soquete",
          ref: "tab-operacoes-soquete"
        },
        {
          title: "O que o TCP não promete",
          html:
            "<ul>" +
            "<li>Esconde tamanho, perda, ordem e velocidade</li>" +
            "<li>Perda acima do limite desfaz a conexão</li>" +
            "<li>O erro <strong>não distingue</strong> falha de rede de falha do processo</li>" +
            "<li>E não diz se o que você enviou chegou</li>" +
            "</ul>"
        }
      ]
    },
    {
      title: "Empacotamento de dados",
      html:
        "<p>A seção anterior entregou ao programa um canal por onde passam bytes. Falta " +
        "resolver o descompasso que isso cria, porque um programa em execução não guarda " +
        "bytes. Ele guarda estruturas de dados, com objetos que apontam para outros " +
        "objetos, números inteiros, números com casas decimais e texto.</p>" +
        "<p>Antes de transmitir, essas estruturas precisam ser simplificadas em uma " +
        "sequência de bytes, e precisam ser reconstruídas na chegada. " +
        "<strong>Empacotamento</strong>, também chamado de <em>marshalling</em>, é o " +
        "procedimento de montar um conjunto de itens de dados numa forma conveniente " +
        "para viajar em uma mensagem. O <strong>desempacotamento</strong> é o " +
        "procedimento inverso, feito no destino.</p>" +
        "<p>Se as duas máquinas fossem idênticas, bastaria copiar a memória de uma para a " +
        "outra. Elas não são, e três diferenças atrapalham.</p>" +
        "<ul>" +
        "<li>A <strong>ordem dos bytes de um inteiro</strong> muda conforme a " +
        "arquitetura. Na ordem big-endian o byte mais significativo vem na primeira " +
        "posição, e na little-endian ele vem por último.</li>" +
        "<li>A <strong>representação de números em ponto flutuante</strong> também " +
        "difere entre arquiteturas de processador.</li>" +
        "<li>O <strong>código de caracteres</strong> não é único, porque um sistema pode " +
        "usar um byte por caractere enquanto outro adota uma codificação capaz de " +
        "representar muitos idiomas.</li>" +
        "</ul>" +
        "<p>Vale desfazer uma confusão comum aqui. Os bytes em si nunca têm a ordem dos " +
        "bits alterada durante a transmissão, e o problema é sempre a ordem dos bytes " +
        "dentro de um valor, nunca a ordem dos bits dentro de um byte.</p>" +
        "<p>Existem dois caminhos para conciliar as diferenças. O primeiro converte os " +
        "valores para um formato externo acordado antes da transmissão, e os converte de " +
        "volta para a forma local na recepção. O segundo transmite no formato do " +
        "remetente, acompanhado de uma indicação de qual formato é esse, e deixa a " +
        "conversão por conta do destinatário. O padrão acordado que sustenta o primeiro " +
        "caminho chama-se <strong>representação externa de dados</strong>.</p>" +
        "<h3>A pergunta que separa os formatos</h3>" +
        "<p>Todo formato de empacotamento responde à mesma pergunta, e é dela que saem as " +
        "diferenças de tamanho e de flexibilidade entre eles. Além dos valores, o que " +
        "mais viaja dentro da mensagem?</p>" +
        "<p>Um formato pode carregar o nome de cada campo, o tipo de cada campo, os dois " +
        "ou nenhum dos dois. Quanto menos ele carrega, menor fica a mensagem, e mais os " +
        "dois lados precisam ter combinado de antemão. Essa troca entre tamanho e " +
        "acoplamento organiza a seção inteira.</p>" +
        "<h3>Do texto ao binário</h3>" +
        "<p>O JSON e a linguagem de marcação extensível (XML) são os formatos textuais " +
        "mais difundidos, e a razão do sucesso deles não é técnica. Eles carregam o nome " +
        "e o valor de cada campo, então quem " +
        "recebe consegue interpretar a mensagem sem ter combinado nada antes. É isso que " +
        "os torna a escolha natural quando os dois lados pertencem a organizações " +
        "diferentes, porque fazer duas organizações concordarem em qualquer coisa é mais " +
        "difícil que economizar bytes.</p>" +
        "<p>O preço aparece em três lugares. A ambiguidade dos números é o mais " +
        "perigoso, porque o JSON distingue texto de número mas não distingue inteiro de " +
        "ponto flutuante e não especifica precisão. Inteiros acima de 2<sup>53</sup> não " +
        "cabem exatamente num ponto flutuante de precisão dupla, então chegam errados a " +
        "quem interpreta em JavaScript. A rede social X convive com isso mandando o " +
        "identificador de cada publicação duas vezes, uma como número e outra como texto " +
        "decimal.</p>" +
        "<p>O segundo preço é a ausência de cadeia binária. Nem JSON nem XML transportam " +
        "uma sequência de bytes sem codificação de caracteres, e a saída usual codifica o " +
        "binário como texto em Base64, o que aumenta o dado em cerca de um terço. O " +
        "terceiro preço é o próprio esquema, porque tanto o esquema de JSON quanto o de " +
        "XML são poderosos e, por isso mesmo, complicados de aprender e de implementar.</p>" +
        "<p>A verbosidade motivou uma família de codificações binárias do JSON, entre as " +
        "quais o MessagePack é a mais conhecida. Elas mantêm o modelo de dados intacto e apenas trocam a " +
        "sintaxe textual por bytes. Como não pressupõem esquema nenhum, continuam " +
        "obrigadas a incluir o nome de cada campo dentro da mensagem, e por isso o ganho " +
        "é modesto. Um registro de exemplo com três campos cai de 81 para 66 bytes.</p>" +
        "<h3>Quando o esquema entra, os nomes saem</h3>" +
        "<p>Os buffers de protocolo, criados no Google, exigem um esquema para qualquer " +
        "dado codificado. Esse esquema declara os campos numa linguagem de definição de " +
        "interface, e cada campo recebe um número, chamado de <strong>etiqueta de " +
        "campo</strong>. Na mensagem codificada não aparece nome nenhum, só a etiqueta, e " +
        "o mesmo registro de exemplo cai para 33 bytes.</p>" +
        "<p>A economia é a parte menos interessante. O que a etiqueta compra de verdade é " +
        "a <strong>evolução do esquema</strong>, que é a capacidade de mudar a estrutura " +
        "da mensagem sem parar o sistema. Isso vale mais que os bytes economizados, " +
        "porque em produção as versões nunca são trocadas todas ao mesmo tempo.</p>" +
        "<p>Duas propriedades descrevem o que se quer preservar. Há " +
        "<strong>compatibilidade para a frente</strong> quando o código antigo consegue " +
        "ler dados escritos pelo código novo, e há <strong>compatibilidade para " +
        "trás</strong> quando o código novo consegue ler dados escritos pelo antigo.</p>" +
        "<p>As etiquetas entregam as duas, com uma liberdade e uma proibição. Você pode " +
        "renomear um campo à vontade, porque o nome nunca aparece nos dados codificados, " +
        "mas não pode mudar a etiqueta de um campo, porque isso invalidaria todo dado já " +
        "escrito.</p>" +
        "<p>Acrescentar campo funciona assim. O campo novo ganha uma etiqueta nova, e o " +
        "código antigo, ao encontrar uma etiqueta que não conhece, simplesmente a ignora. " +
        "Ele consegue pular a quantidade certa de bytes porque o tipo do dado viaja " +
        "anotado junto da etiqueta, e é essa anotação que sustenta a compatibilidade para " +
        "a frente. No sentido contrário, o código novo que lê dado antigo preenche o " +
        "campo ausente com um valor padrão.</p>" +
        "<p>Remover campo é o mesmo problema espelhado, e deixa uma consequência " +
        "permanente. A etiqueta aposentada nunca mais pode ser reutilizada, porque ainda " +
        "pode existir dado escrito com ela em algum lugar, e reservá-la explicitamente no " +
        "esquema é a forma de não esquecer disso.</p>" +
        "<p>Mudar o tipo de um campo é o caso que mais engana. Alargar um inteiro de 32 " +
        "para 64 bits parece inofensivo, e o código novo de fato lê o dado antigo sem " +
        "problema, preenchendo com zeros os bits que faltam. O caminho inverso trunca, " +
        "porque o código antigo continua guardando o valor numa variável de 32 bits.</p>" +
        "<h3>Quando o esquema inteiro é compartilhado</h3>" +
        "<p>O Avro leva a ideia ao limite e não tem etiqueta nenhuma. A mensagem " +
        "codificada é a simples concatenação dos valores, e nada nela identifica campo " +
        "nem tipo. Um texto é apenas um prefixo de comprimento seguido dos bytes, e " +
        "olhando para os bytes ninguém consegue dizer se aquilo é texto ou número. O " +
        "mesmo registro de exemplo cai para 32 bytes, o menor de todos.</p>" +
        "<p>O preço dessa compactação é severo. Os dados só podem ser decodificados " +
        "corretamente por quem tiver exatamente o mesmo esquema de quem escreveu, e " +
        "qualquer divergência produz dado interpretado errado, não erro de leitura.</p>" +
        "<p>A saída do Avro para a evolução separa dois esquemas que os outros formatos " +
        "confundem. O <strong>esquema do escritor</strong> é a versão que a aplicação " +
        "usava quando codificou o dado. O <strong>esquema do leitor</strong> é a versão " +
        "que a aplicação que vai ler espera encontrar. Para decodificar, o Avro usa os " +
        "dois, compara um com o outro e traduz do primeiro para o segundo.</p>" +
        "<h3>A ideia é mais velha que as ferramentas</h3>" +
        "<p>Nada disso é invenção recente. A arquitetura comum de intermediação de " +
        "pedidos a objetos (CORBA), padronizada nos anos 1990, definiu uma representação " +
        "comum de dados que já transmitia somente os valores, sem nenhuma " +
        "informação sobre os tipos. Ela podia fazer isso porque remetente e destinatário " +
        "compartilhavam de antemão o conhecimento da ordem e dos tipos dos itens, " +
        "descritos numa linguagem de definição de interface a partir da qual as operações " +
        "de empacotamento eram geradas automaticamente.</p>" +
        "<p>É a mesma barganha que o Avro faz hoje, com trinta anos de diferença. E é por " +
        "isso que a tecnologia sair do currículo não tira a lição do lugar, porque a lição " +
        "nunca esteve no CORBA.</p>" +
        "<p>Os quatro formatos se comparam pelas mesmas dimensões, usando sempre o mesmo " +
        "registro de exemplo com três campos.</p>" +
        '<div class="tabela-rolagem">' +
        '<table class="tabela-conteudo" id="tab-formatos-empacotamento">' +
        "<tr><th>Formato</th><th>O que viaja além dos valores</th><th>Tamanho do " +
        "exemplo</th><th>O que os dois lados combinam antes</th></tr>" +
        "<tr><td>JSON textual</td>" +
        "<td>Viajam o nome de cada campo e a sintaxe que os separa.</td>" +
        "<td>81 bytes</td>" +
        "<td>Quase nada, porque a mensagem se descreve sozinha.</td></tr>" +
        "<tr><td>MessagePack</td>" +
        "<td>Os nomes continuam viajando, e só a sintaxe textual vira binária.</td>" +
        "<td>66 bytes</td>" +
        "<td>Quase nada, pelo mesmo motivo do JSON.</td></tr>" +
        "<tr><td>Buffers de protocolo</td>" +
        "<td>Viaja a etiqueta numérica de cada campo, com o tipo anotado junto.</td>" +
        "<td>33 bytes</td>" +
        "<td>Os dois precisam do esquema, mas versões diferentes dele convivem.</td></tr>" +
        "<tr><td>Avro</td>" +
        "<td>Nada além dos próprios valores, concatenados.</td>" +
        "<td>32 bytes</td>" +
        "<td>O leitor precisa do esquema exato de quem escreveu, além do dele.</td></tr>" +
        "</table>" +
        "</div>" +
        "<p>A tabela revela onde está mesmo o salto de tamanho, e não é entre texto e " +
        "binário. Trocar JSON por MessagePack economiza pouco, enquanto trocar qualquer " +
        "um dos dois por um formato com esquema corta a mensagem pela metade. O que se " +
        "paga em troca é acoplamento, porque a partir dali as duas pontas dependem de um " +
        "acordo que precisa ser versionado com o mesmo cuidado que o código.</p>",
      slides: [
        {
          title: "Por que empacotar",
          html:
            "<ul>" +
            "<li>O programa guarda estruturas, a mensagem carrega bytes</li>" +
            "<li>Diferem a ordem dos bytes, o ponto flutuante e o código de caractere</li>" +
            "<li><strong>Empacotar</strong> monta, <strong>desempacotar</strong> " +
            "reconstrói</li>" +
            "<li>A ordem dos <em>bits</em> dentro do byte nunca muda</li>" +
            "</ul>"
        },
        {
          title: "A pergunta que separa os formatos",
          html:
            "<ul>" +
            "<li>Além dos valores, o que mais viaja?</li>" +
            "<li>Nome do campo, tipo do campo, os dois, ou nenhum</li>" +
            "<li>Menos carga significa mensagem menor</li>" +
            "<li>E significa mais acordo prévio entre as pontas</li>" +
            "</ul>"
        },
        {
          title: "Os quatro formatos comparados",
          ref: "tab-formatos-empacotamento"
        },
        {
          title: "Evolução do esquema",
          html:
            "<ul>" +
            "<li><strong>Para a frente</strong>, código antigo lê dado novo</li>" +
            "<li><strong>Para trás</strong>, código novo lê dado antigo</li>" +
            "<li>Renomear campo pode, mudar a etiqueta não</li>" +
            "<li>Etiqueta aposentada nunca volta a ser usada</li>" +
            "</ul>"
        },
        {
          title: "A ideia é mais velha que a ferramenta",
          html:
            "<ul>" +
            "<li>A representação de dados do CORBA já mandava só os valores</li>" +
            "<li>Podia, porque a descrição da interface era compartilhada antes</li>" +
            "<li>O Avro faz a mesma barganha hoje</li>" +
            "<li>A lição nunca esteve na tecnologia</li>" +
            "</ul>"
        }
      ]
    },
    {
      title: "A outra ponta, quem recebe",
      html:
        "<p>As duas seções anteriores olharam para quem envia. A mensagem, porém, chega a " +
        "algum lugar, e duas decisões tomadas do lado de quem recebe mudam a comunicação " +
        "por inteiro. Uma delas define o que cada mensagem precisa carregar. A outra " +
        "define em qual máquina ela vai aterrissar.</p>" +
        "<p>Um servidor é um processo que implementa um serviço em nome de um conjunto de " +
        "clientes, e no fundo todos são organizados do mesmo jeito. Ele espera uma " +
        "requisição, garante que ela seja atendida e volta a esperar a próxima. As " +
        "diferenças interessantes estão nos detalhes desse ciclo.</p>" +
        "<h3>Atender sozinho ou passar adiante</h3>" +
        "<p>O <strong>servidor iterativo</strong> trata a requisição ele mesmo e devolve a " +
        "resposta ao cliente. Enquanto isso acontece, ninguém mais é atendido.</p>" +
        "<p>O <strong>servidor concorrente</strong> não trata a requisição. Ele a repassa " +
        "a uma thread separada ou a outro processo e volta imediatamente a esperar a " +
        "próxima, deixando a resposta por conta de quem recebeu a tarefa. Um servidor com " +
        "várias threads é o exemplo mais comum, e criar um processo filho por requisição " +
        "é a alternativa que muitos sistemas Unix seguem.</p>" +
        "<h3>Como o cliente descobre onde bater</h3>" +
        "<p>O cliente envia a requisição a um ponto de extremidade na máquina do servidor, " +
        "que é a porta da seção 1, e cada servidor escuta um ponto específico. Resta saber " +
        "como o cliente descobre qual é.</p>" +
        "<p>A resposta mais simples é atribuir pontos fixos aos serviços conhecidos. " +
        "Servidores de transferência de arquivos escutam sempre a porta TCP 21, e " +
        "servidores da Web escutam a porta TCP 80, por atribuição da autoridade que " +
        "administra os números da Internet. Com o ponto já definido, ao cliente basta " +
        "descobrir o endereço de rede da máquina, e para isso serve o serviço de nomes.</p>" +
        "<p>Muitos serviços, porém, não têm ponto atribuído de antemão, e recebem um " +
        "endereço dinâmico do sistema operacional local. Nesse caso entra um processo " +
        "auxiliar que escuta num ponto conhecido e sabe onde cada serviço da máquina está. " +
        "O cliente pergunta a ele primeiro e depois procura o servidor certo.</p>" +
        "<p>Há ainda uma variante que economiza recursos. Em vez de manter dezenas de " +
        "servidores acordados só esperando, um <strong>superservidor</strong> escuta todos " +
        "os pontos de uma vez e cria o processo adequado quando a requisição chega, " +
        "processo que termina ao acabar o trabalho.</p>" +
        "<h3>Como interromper um servidor</h3>" +
        "<p>Imagine alguém que começou a enviar um arquivo enorme e percebeu no meio que " +
        "escolheu o arquivo errado. O jeito que funciona bem demais na Internet de hoje, e " +
        "às vezes é o único disponível, consiste em fechar a aplicação cliente de supetão, " +
        "abri-la de novo e fingir que nada aconteceu. O servidor acaba desfazendo a " +
        "conexão antiga, achando que o cliente caiu.</p>" +
        "<p>A saída melhor exige que cliente e servidor tenham sido projetados para trocar " +
        "<strong>dados fora de banda</strong>, que são dados processados na frente de " +
        "qualquer outro daquele cliente. Uma forma é o servidor escutar um ponto de " +
        "controle separado, com prioridade maior que o ponto por onde passam os dados " +
        "normais. Outra é usar a mesma conexão, já que o TCP permite transmitir dados " +
        "urgentes que interrompem o servidor na chegada.</p>" +
        "<h3>Com estado ou sem estado</h3>" +
        "<p>Chegamos à decisão que mais afeta o resto do sistema. Um <strong>servidor sem " +
        "estado</strong> não guarda informação sobre a situação dos clientes dele, e pode " +
        "mudar o próprio estado sem avisar ninguém. O servidor da Web é o exemplo " +
        "clássico, porque responde à requisição e esquece o cliente por completo assim que " +
        "termina.</p>" +
        "<p>A definição é mais sutil do que parece. Muitos projetos sem estado de fato " +
        "guardam informação sobre os clientes, e o que os define é outra coisa, porque " +
        "perder essa informação não interrompe o serviço. Um servidor da Web costuma " +
        "registrar todas as requisições, o que ajuda a decidir o que replicar e onde, mas " +
        "perder o registro custa no máximo algum desempenho.</p>" +
        "<p>Existe um meio-termo com nome próprio. No <strong>estado leve</strong>, o " +
        "servidor promete guardar informação em nome do cliente por um tempo limitado, e " +
        "depois desse prazo volta ao comportamento padrão e descarta o que guardava. Um " +
        "servidor que promete avisar o cliente sobre atualizações durante alguns minutos, " +
        "e depois exige que o cliente volte a perguntar, funciona assim.</p>" +
        "<p>O <strong>servidor com estado</strong> mantém informação persistente sobre os " +
        "clientes, que precisa ser apagada explicitamente. Um servidor de arquivos que " +
        "permite ao cliente guardar uma cópia local para alterar mantém uma tabela de " +
        "pares formados por cliente e arquivo, e é ela que diz quem tem permissão de " +
        "escrita sobre o quê, e portanto quem tem a versão mais recente.</p>" +
        "<p>As duas escolhas se comparam pelas mesmas quatro dimensões.</p>" +
        '<div class="tabela-rolagem">' +
        '<table class="tabela-conteudo" id="tab-servidor-estado">' +
        "<tr><th>Dimensão</th><th>Sem estado</th><th>Com estado</th></tr>" +
        "<tr><td>O que guarda do cliente</td>" +
        "<td>Pode guardar, desde que perder aquilo não derrube o serviço.</td>" +
        "<td>Guarda informação persistente, que só some quando alguém a apaga.</td></tr>" +
        "<tr><td>O que acontece se o servidor cair</td>" +
        "<td>Ele volta a executar e passa a esperar requisições, sem medida " +
        "especial nenhuma.</td>" +
        "<td>Ele precisa recuperar todo o estado que tinha um instante antes da " +
        "queda.</td></tr>" +
        "<tr><td>Desempenho percebido pelo cliente</td>" +
        "<td>Cada requisição carrega tudo de que o servidor precisa, o que engorda a " +
        "mensagem.</td>" +
        "<td>Leitura e escrita ficam mais rápidas, porque o servidor já sabe o " +
        "contexto.</td></tr>" +
        "<tr><td>Complexidade que cria</td>" +
        "<td>Deixa a recuperação trivial e empurra o trabalho para o cliente.</td>" +
        "<td>Exige mecanismos de recuperação, que o tópico de tolerância a falhas " +
        "detalha.</td></tr>" +
        "</table>" +
        "</div>" +
        "<p>Vale separar dois tipos de estado que costumam ser confundidos. O " +
        "<strong>estado de sessão</strong> acompanha uma série de operações de um mesmo " +
        "usuário e deve durar algum tempo, mas não para sempre. Perdê-lo não causa dano " +
        "real, desde que o cliente possa repetir a requisição original, e é por isso que " +
        "ele admite armazenamento mais simples e menos confiável. O <strong>estado " +
        "permanente</strong> é o que vive em banco de dados, como o cadastro de um cliente " +
        "ou a chave de um software comprado.</p>" +
        "<p>A escolha entre os dois desenhos não deve mudar o serviço oferecido, e sim " +
        "como ele é implementado. Se um arquivo precisa ser aberto antes de ser lido, o " +
        "servidor sem estado imita esse comportamento abrindo o arquivo, fazendo a " +
        "operação e fechando o arquivo em seguida, tudo dentro do atendimento de uma " +
        "requisição só.</p>" +
        "<p>Quando o servidor quer lembrar do comportamento anterior do cliente sem " +
        "guardar estado, a solução conhecida é pedir que o próprio cliente carregue essa " +
        "informação. É o que faz o <em>cookie</em> da Web, um pedaço pequeno de dados com " +
        "informação de interesse do servidor, que o navegador apenas guarda e reenvia no " +
        "acesso seguinte, sem nunca executá-lo.</p>" +
        "<h3>Quando o servidor é um agrupamento</h3>" +
        "<p>Até aqui o servidor foi tratado como uma máquina. Em produção ele quase nunca " +
        "é, e um <strong>agrupamento de servidores</strong> é apenas um conjunto de " +
        "máquinas ligadas por rede, cada uma executando um ou mais servidores. A " +
        "organização mais comum se divide em três camadas.</p>" +
        '<figure class="figura" id="fig-agrupamento-servidores">' +
        '<svg viewBox="0 0 600 260" role="img" ' +
        'aria-labelledby="fig-agrupamento-servidores-titulo">' +
        '<title id="fig-agrupamento-servidores-titulo">Agrupamento de servidores em três ' +
        "camadas. As requisições dos clientes entram por um comutador lógico na primeira " +
        "camada, que as despacha para um entre três servidores de aplicação na segunda " +
        "camada, e esses servidores acessam o sistema distribuído de arquivos e banco de " +
        "dados na terceira camada.</title>" +
        '<text class="rotulo-secundario" x="8" y="122" font-size="13">requisições</text>' +
        '<path class="traco" d="M8 132 L86 132"/>' +
        '<path class="seta" d="M86 126 L86 138 L98 132 Z"/>' +
        '<rect class="caixa-destaque" x="100" y="72" width="92" height="120" rx="8"/>' +
        '<text x="146" y="126" text-anchor="middle" font-size="14">Comutador</text>' +
        '<text x="146" y="146" text-anchor="middle" font-size="14">lógico</text>' +
        '<rect class="caixa" x="252" y="52" width="152" height="42" rx="8"/>' +
        '<text x="328" y="78" text-anchor="middle" font-size="13">Servidor de aplicação</text>' +
        '<rect class="caixa" x="252" y="111" width="152" height="42" rx="8"/>' +
        '<text x="328" y="137" text-anchor="middle" font-size="13">Servidor de aplicação</text>' +
        '<rect class="caixa" x="252" y="170" width="152" height="42" rx="8"/>' +
        '<text x="328" y="196" text-anchor="middle" font-size="13">Servidor de aplicação</text>' +
        '<path class="traco" d="M192 118 L228 118 L228 73 L240 73"/>' +
        '<path class="seta" d="M240 67 L240 79 L252 73 Z"/>' +
        '<path class="traco" d="M192 132 L240 132"/>' +
        '<path class="seta" d="M240 126 L240 138 L252 132 Z"/>' +
        '<path class="traco" d="M192 146 L228 146 L228 191 L240 191"/>' +
        '<path class="seta" d="M240 185 L240 197 L252 191 Z"/>' +
        '<path class="traco" d="M404 73 L440 73 L440 126 L452 126"/>' +
        '<path class="seta" d="M452 120 L452 132 L464 126 Z"/>' +
        '<path class="traco" d="M404 132 L452 132"/>' +
        '<path class="seta" d="M452 126 L452 138 L464 132 Z"/>' +
        '<path class="traco" d="M404 191 L440 191 L440 138 L452 138"/>' +
        '<path class="seta" d="M452 132 L452 144 L464 138 Z"/>' +
        '<rect class="caixa" x="466" y="72" width="120" height="120" rx="8"/>' +
        '<text x="526" y="116" text-anchor="middle" font-size="13">Arquivos e</text>' +
        '<text x="526" y="136" text-anchor="middle" font-size="13">banco de dados</text>' +
        '<text x="526" y="156" text-anchor="middle" font-size="13">distribuídos</text>' +
        '<text class="rotulo-secundario" x="146" y="232" text-anchor="middle" ' +
        'font-size="13">1ª camada</text>' +
        '<text class="rotulo-secundario" x="328" y="232" text-anchor="middle" ' +
        'font-size="13">2ª camada</text>' +
        '<text class="rotulo-secundario" x="526" y="232" text-anchor="middle" ' +
        'font-size="13">3ª camada</text>' +
        "</svg>" +
        "<figcaption>O agrupamento de servidores em três camadas. O comutador é o único " +
        "endereço que o cliente conhece, e é ele que decide qual máquina atende cada " +
        "requisição.</figcaption>" +
        "</figure>" +
        "<p>A primeira camada tem um comutador lógico por onde as requisições dos clientes " +
        "são roteadas. A segunda reúne os servidores de aplicação, que fazem o " +
        "processamento propriamente dito. A terceira guarda os dados, com servidores de " +
        "arquivo e de banco de dados, muitas vezes em máquinas configuradas para acesso " +
        "rápido a disco e com bastante memória de cache.</p>" +
        "<p>A separação nem sempre é estrita. É frequente cada máquina ter o próprio " +
        "armazenamento local, integrando aplicação e dados num servidor só, o que reduz o " +
        "arranjo a duas camadas.</p>" +
        "<p>O objetivo de projeto do comutador é esconder que existem várias máquinas. O " +
        "cliente enxerga um único endereço de rede e não precisa saber nada sobre a " +
        "organização interna do agrupamento, o que é transparência de acesso pela " +
        "definição do tópico 01.</p>" +
        "<p>Existem dois tipos de comutador, e a diferença está em quanto cada um entende " +
        "do que passa por ele. O <strong>comutador de nível de transporte</strong> aceita " +
        "pedidos de conexão TCP e os repassa a um servidor escolhido, ficando no meio da " +
        "conexão e reescrevendo os endereços de origem e destino a cada segmento, que é " +
        "uma forma de tradução de endereços de rede.</p>" +
        "<p>O <strong>comutador de nível de aplicação</strong> inspeciona o conteúdo da " +
        "requisição em vez de olhar apenas o que o TCP mostra. Ele pode ler o endereço " +
        "pedido e mandar vídeo para máquinas preparadas para vídeo, e consulta a banco " +
        "para máquinas com acesso àquele banco. Quanto mais o comutador sabe sobre o que " +
        "está sendo pedido, melhor ele decide quem atende, e o custo desse conhecimento é " +
        "ser mais lento que o comutador de transporte.</p>" +
        "<p>Os nomes que a prática corrente usa são outros, e vale reconhecê-los. O " +
        "balanceador de carga em equipamento dedicado e o balanceador em software fazem o " +
        "papel do comutador. O <strong>sistema de descoberta de serviço</strong>, apoiado " +
        "num registro central, resolve o mesmo problema de forma mais dinâmica que o " +
        "serviço de nomes, porque cada instância se registra ao subir e envia sinais " +
        "periódicos de que continua viva. A <strong>malha de serviço</strong> combina as " +
        "duas coisas e coloca um balanceador local junto de cada cliente e de cada " +
        "servidor.</p>" +
        "<p>Feche a seção juntando as duas pontas dela, porque as duas decisões que " +
        "pareciam separadas são a mesma. O comutador só pode mandar qualquer requisição " +
        "para qualquer máquina se nenhuma delas guardar contexto daquele cliente. É o " +
        "servidor sem estado que torna o agrupamento possível, e é por isso que a escolha " +
        "da metade desta seção decide o que a outra metade consegue fazer.</p>",
      slides: [
        {
          title: "Quem recebe também decide",
          html:
            "<ul>" +
            "<li>Servidor <strong>iterativo</strong> atende ele mesmo</li>" +
            "<li>Servidor <strong>concorrente</strong> repassa e volta a esperar</li>" +
            "<li>Ponto de contato fixo, por atribuição, ou descoberto</li>" +
            "<li>O <strong>superservidor</strong> escuta por muitos de uma vez</li>" +
            "</ul>"
        },
        {
          title: "Com estado ou sem estado",
          html:
            "<ul>" +
            "<li><strong>Sem estado</strong>, perder a informação não derruba o serviço</li>" +
            "<li><strong>Estado leve</strong>, a promessa vale por um tempo</li>" +
            "<li><strong>Com estado</strong>, a queda exige recuperar tudo</li>" +
            "<li>O <em>cookie</em> devolve a lembrança ao cliente</li>" +
            "</ul>"
        },
        {
          title: "As duas escolhas, quatro dimensões",
          ref: "tab-servidor-estado"
        },
        {
          title: "O agrupamento em três camadas",
          html:
            "<ul>" +
            "<li>Comutador, aplicação e dados</li>" +
            "<li>O cliente enxerga <strong>um endereço só</strong></li>" +
            "<li>Comutador de transporte reescreve endereços</li>" +
            "<li>Comutador de aplicação lê o que foi pedido e decide melhor</li>" +
            "</ul>",
          ref: "fig-agrupamento-servidores"
        },
        {
          title: "As duas decisões são a mesma",
          html:
            "<ul>" +
            "<li>O comutador manda qualquer pedido para qualquer máquina</li>" +
            "<li>Isso só funciona se nenhuma guardar contexto do cliente</li>" +
            "<li>É o servidor <strong>sem estado</strong> que permite o agrupamento</li>" +
            "</ul>"
        }
      ]
    },
    {
      title: "Quando a mensagem espera",
      html:
        "<p>Tudo o que veio até aqui pressupõe a mesma coisa, que é os dois lados estarem " +
        "em execução no momento da conversa. A grade da seção 1 já tinha nomeado o outro " +
        "quadrante, e é hora de ir até lá.</p>" +
        "<p>Antes disso, vale uma parada dentro do próprio quadrante transiente. A " +
        "programação direta com soquetes é básica e frágil, porque erra-se com facilidade " +
        "e porque o soquete oferece apenas TCP ou UDP, deixando todo o resto por conta de " +
        "quem programa.</p>" +
        "<h3>Um degrau acima do soquete</h3>" +
        "<p>Uma observação simples deu origem a bibliotecas melhores. A maior parte das " +
        "aplicações que trocam mensagens se organiza segundo uns poucos padrões de " +
        "comunicação, então dá para oferecer um soquete já preparado para cada padrão. É " +
        "isso que o ZeroMQ faz, com três padrões principais, que são requisição e " +
        "resposta, publicar e assinar, e o encadeamento em linha de produção.</p>" +
        "<p>Duas escolhas de projeto dessa biblioteca merecem atenção. A comunicação é " +
        "assíncrona, então o remetente segue adiante depois de submeter a mensagem. E o " +
        "soquete pode estar vinculado a vários endereços, o que permite a um servidor " +
        "atender origens bem diferentes por uma interface só, com uma única operação de " +
        "recepção bloqueante.</p>" +
        "<p>A combinação das duas produz um efeito curioso, que já é um ensaio do que vem " +
        "adiante nesta seção. O processo pode pedir a conexão e enviar mensagens mesmo que " +
        "o destinatário ainda não esteja no ar, porque o pedido e as mensagens ficam " +
        "enfileirados do lado do remetente, e uma thread da própria biblioteca trata de " +
        "estabelecer a conexão e transmitir tudo quando for possível.</p>" +
        "<p>No outro extremo do espectro está a interface de passagem de mensagens usada " +
        "na computação de alto desempenho, que resolve um problema diferente. Ela expõe " +
        "explicitamente as duas dimensões da seção 1, com variantes bloqueantes e não " +
        "bloqueantes de envio e de recepção, e a diversidade cobra o preço dela. A quarta " +
        "versão do padrão passa de 650 operações, o que se explica pela busca de " +
        "desempenho em aplicações paralelas, e não por elegância de projeto.</p>" +
        "<h3>A fila de mensagens</h3>" +
        "<p>Os <strong>sistemas de fila de mensagens</strong> oferecem armazenamento de " +
        "médio prazo para mensagens, sem exigir que remetente ou destinatário estejam " +
        "ativos durante a transmissão. As aplicações se comunicam inserindo mensagens em " +
        "filas específicas, e essas mensagens são encaminhadas por uma série de servidores " +
        "de comunicação até alcançarem o destino, mesmo que ele estivesse fora do ar no " +
        "instante do envio.</p>" +
        "<p>Uma diferença de escala de tempo separa esses sistemas de tudo o que veio " +
        "antes, e ela é a chave para entender quando usá-los. Soquetes e passagem de " +
        "mensagens de alto desempenho trabalham em milissegundos ou segundos. Os sistemas " +
        "de fila são projetados para transferências que podem levar <strong>minutos</strong>.</p>" +
        "<p>A garantia que o remetente recebe é bem mais fraca do que ele costuma imaginar. " +
        "Ele tem a promessa de que a mensagem será eventualmente inserida na fila do " +
        "destinatário, e nada mais. Não há promessa sobre quando ela será lida, nem sequer " +
        "sobre se ela será lida, porque isso depende inteiramente do comportamento de " +
        "quem recebe.</p>" +
        "<p>Em compensação, essa semântica fraca compra uma propriedade valiosa, que é o " +
        "<strong>desacoplamento no tempo</strong>. Depois que a mensagem entra na fila, " +
        "ela fica lá até alguém removê-la, e pouco importa se o remetente ou o " +
        "destinatário estão executando. Isso produz quatro situações.</p>" +
        '<div class="tabela-rolagem">' +
        '<table class="tabela-conteudo" id="tab-desacoplamento-tempo">' +
        "<tr><th>Remetente</th><th>Destinatário</th><th>O que acontece</th></tr>" +
        "<tr><td>Em execução</td><td>Em execução</td>" +
        "<td>Os dois acompanham a transmissão inteira, que é o caso mais parecido com um " +
        "soquete.</td></tr>" +
        "<tr><td>Em execução</td><td>Passivo</td>" +
        "<td>O remetente continua enviando, ainda que a entrega não seja possível " +
        "agora.</td></tr>" +
        "<tr><td>Passivo</td><td>Em execução</td>" +
        "<td>O destinatário lê mensagens que lhe foram enviadas por quem já nem está " +
        "mais no ar.</td></tr>" +
        "<tr><td>Passivo</td><td>Passivo</td>" +
        "<td>O sistema guarda e transmite mensagens sem nenhum dos dois presentes, e só " +
        "quem suporta este caso oferece mensageria realmente persistente.</td></tr>" +
        "</table>" +
        "</div>" +
        "<p>A interface que tudo isso exige é surpreendentemente pequena, com quatro " +
        "operações que dão conta do modelo inteiro.</p>" +
        '<div class="tabela-rolagem">' +
        '<table class="tabela-conteudo" id="tab-operacoes-fila">' +
        "<tr><th>Operação</th><th>O que ela faz</th></tr>" +
        "<tr><td><code>PUT</code></td>" +
        "<td>Acrescenta uma mensagem à fila indicada, sem bloquear quem chamou.</td></tr>" +
        "<tr><td><code>GET</code></td>" +
        "<td>Bloqueia até a fila indicada ter conteúdo e remove a mensagem mais " +
        "antiga.</td></tr>" +
        "<tr><td><code>POLL</code></td>" +
        "<td>Consulta a fila e remove a primeira mensagem, e nunca bloqueia, porque " +
        "segue adiante se a fila estiver vazia.</td></tr>" +
        "<tr><td><code>NOTIFY</code></td>" +
        "<td>Instala um tratador que será chamado sozinho sempre que uma mensagem entrar " +
        "na fila.</td></tr>" +
        "</table>" +
        "</div>" +
        "<p>A operação <code>NOTIFY</code> tem um uso que passa despercebido. O tratador " +
        "instalado pode iniciar um processo que busque as mensagens quando nenhum processo " +
        "estiver executando, e é assim que a fila consegue acordar quem deveria consumi-la.</p>" +
        "<h3>Como a mensagem encontra o destino</h3>" +
        "<p>Quem administra as filas é um <strong>gerenciador de filas</strong>, que pode " +
        "ser um processo separado ou uma biblioteca ligada à aplicação. Vale uma regra " +
        "prática, porque a aplicação só põe mensagem em fila local e só retira mensagem de " +
        "fila local. O gerenciador e a aplicação dele ficam então na mesma máquina, ou no " +
        "pior caso na mesma rede local.</p>" +
        "<p>Se a aplicação só alcança filas locais, cada mensagem precisa carregar a " +
        "informação de destino, e cabe ao gerenciador fazê-la chegar lá. Para não amarrar " +
        "a fila a um lugar, os nomes de fila são lógicos e independentes de localização, e " +
        "o gerenciador mantém o mapeamento entre cada nome e um endereço de contato, que " +
        "inclui a máquina, a porta e o protocolo.</p>" +
        "<p>Esse mapeamento é o ponto fraco do arranjo. A solução mais direta implementa " +
        "uma tabela de consulta e a copia para todos os gerenciadores, e o problema de " +
        "manutenção aparece logo, porque batizar uma fila nova obriga a atualizar muitas " +
        "tabelas, quando não todas.</p>" +
        "<p>Há ainda um problema de escala escondido na suposição de que cada gerenciador " +
        "alcança qualquer outro diretamente, porque isso exigiria que todos conhecessem o " +
        "endereço de todos. Na prática, gerenciadores especiais funcionam como roteadores " +
        "e repassam mensagens adiante, e o sistema de filas vai crescendo até virar uma " +
        "rede de sobreposição completa, montada no nível da aplicação.</p>" +
        "<h3>O intermediário que traduz</h3>" +
        "<p>Aplicações diferentes raramente combinam o formato das mensagens de antemão, e " +
        "a estratégia geral é aprender a conviver com a diferença em vez de eliminá-la. " +
        "Quem faz a conversão é um <strong>intermediário de mensagens</strong>, que atua " +
        "como porta de entrada no nível da aplicação dentro da rede de filas.</p>" +
        "<p>Repare na posição dele, que é a parte contraintuitiva. Para o sistema de " +
        "filas, o intermediário é apenas mais uma aplicação, e não uma peça interna. Ele " +
        "recebe mensagens por uma fila e devolve mensagens por outra, exatamente como " +
        "qualquer participante.</p>" +
        "<p>O trabalho dele varia bastante em ambição. No caso simples, o intermediário " +
        "apenas reformata, trocando o separador de registros ou convertendo campos de " +
        "tamanho fixo em campos de tamanho variável. No caso avançado, ele guarda o " +
        "conhecimento do protocolo de várias aplicações, com um subprograma para cada par " +
        "de aplicações que precise conversar, e esses subprogramas entram e saem sem " +
        "parar o intermediário.</p>" +
        "<p>O intermediário também assume um papel de mediação que vale conhecer, porque é " +
        "onde nasce o modelo publicar e assinar. A aplicação publica uma mensagem sobre um " +
        "assunto, e quem tiver declarado interesse naquele assunto recebe a mensagem do " +
        "intermediário, sem que publicador e assinante saibam um do outro.</p>" +
        "<p>Fica um alerta que o próprio van Steen faz, e que serve para muito além deste " +
        "assunto. No coração do intermediário existe um repositório de regras de " +
        "transformação, e alguém precisa escrever cada uma delas. Produtos comerciais " +
        "costumam vender isso como inteligência do sistema, quando a inteligência está na " +
        "cabeça dos especialistas que preencheram o repositório.</p>" +
        "<p>A prática corrente chama esse arranjo de arquitetura orientada a eventos, e " +
        "chama o intermediário de intermediário de mensagens, com produtos que quase todo " +
        "sistema de porte usa. O nome mudou, o modelo é o desta seção, e o desacoplamento " +
        "no tempo continua sendo a razão de existir dele.</p>",
      slides: [
        {
          title: "Um degrau acima do soquete",
          html:
            "<ul>" +
            "<li>Soquete puro é básico e frágil</li>" +
            "<li>Bibliotecas oferecem <strong>padrões</strong> prontos</li>" +
            "<li>Requisição e resposta, publicar e assinar, linha de produção</li>" +
            "<li>Dá para enviar antes de o destinatário subir</li>" +
            "</ul>"
        },
        {
          title: "A fila muda a escala de tempo",
          html:
            "<ul>" +
            "<li>Soquete e alto desempenho trabalham em milissegundos</li>" +
            "<li>Fila é projetada para <strong>minutos</strong></li>" +
            "<li>A garantia é só de inserção na fila do destino</li>" +
            "<li>Nada promete quando, nem se, a mensagem será lida</li>" +
            "</ul>"
        },
        {
          title: "Quatro situações de desacoplamento",
          ref: "tab-desacoplamento-tempo"
        },
        {
          title: "A interface da fila",
          ref: "tab-operacoes-fila"
        },
        {
          title: "O intermediário",
          html:
            "<ul>" +
            "<li>Converte para o destino entender</li>" +
            "<li>Para o sistema de filas, é <strong>só mais uma aplicação</strong></li>" +
            "<li>Faz mediação, e daí sai publicar e assinar</li>" +
            "<li>A inteligência está em quem escreveu as regras</li>" +
            "</ul>"
        }
      ]
    },
    {
      title: "Do par ao grupo",
      html:
        "<p>Todas as seções anteriores tratam de uma mensagem que sai de um lugar e chega " +
        "a outro. Muitos problemas, porém, precisam de uma mensagem que sai de um lugar e " +
        "chega a muitos, como manter réplicas em dia, avisar um conjunto de serviços de " +
        "que um dado mudou ou distribuir uma atualização de configuração.</p>" +
        "<p>O tópico 03 já mostrou o multicast IP, e cabe explicar por que ele não resolveu " +
        "o assunto. Durante muitos anos o multicast pertenceu ao domínio dos protocolos de " +
        "rede, e o problema central de todas as propostas era montar os caminhos de " +
        "disseminação. Isso exigia um esforço de administração enorme, muitas vezes com " +
        "intervenção humana, e enquanto as propostas não convergiam os provedores se " +
        "mostravam pouco dispostos a sustentar o serviço.</p>" +
        "<p>O que destravou a situação veio de outro lugar. Com a tecnologia par a par e " +
        "com a gerência estruturada de sobreposições, montar caminhos de comunicação " +
        "ficou mais fácil, e como essas soluções vivem na camada de aplicação, o multicast " +
        "desceu junto com elas.</p>" +
        "<h3>Multicast no nível da aplicação</h3>" +
        "<p>A ideia básica organiza os nós numa rede de sobreposição, que passa a ser usada " +
        "para disseminar a informação entre os membros. Uma observação define tudo o que " +
        "vem depois, porque <strong>os roteadores da rede não participam da associação ao " +
        "grupo</strong>. Quem sabe quem é membro são os nós, e a rede por baixo não faz " +
        "ideia de que existe um grupo.</p>" +
        "<p>Daí decorre o preço. As ligações entre nós da sobreposição podem atravessar " +
        "vários enlaces físicos, e o roteamento dentro da sobreposição pode ficar bem pior " +
        "do que o roteamento que a rede faria se soubesse do assunto.</p>" +
        '<figure class="figura" id="fig-alongamento-sobreposicao">' +
        '<svg viewBox="0 0 600 220" role="img" ' +
        'aria-labelledby="fig-alongamento-sobreposicao-titulo">' +
        '<title id="fig-alongamento-sobreposicao-titulo">Comparação entre dois níveis. No ' +
        "nível da aplicação, os nós B e C são vizinhos ligados por um único salto. Na " +
        "rede física, os mesmos dois nós estão separados por quatro enlaces que passam por " +
        "roteadores intermediários.</title>" +
        '<text class="rotulo-secundario" x="8" y="22" font-size="13">no nível da ' +
        "aplicação</text>" +
        '<circle class="caixa-destaque" cx="110" cy="58" r="21"/>' +
        '<text x="110" y="63" text-anchor="middle" font-size="15">B</text>' +
        '<circle class="caixa-destaque" cx="490" cy="58" r="21"/>' +
        '<text x="490" y="63" text-anchor="middle" font-size="15">C</text>' +
        '<path class="traco" d="M131 58 L469 58"/>' +
        '<text class="rotulo-secundario" x="300" y="48" text-anchor="middle" ' +
        'font-size="13">um salto</text>' +
        '<path class="traco" stroke-dasharray="3 6" d="M20 104 L580 104"/>' +
        '<text class="rotulo-secundario" x="8" y="128" font-size="13">na rede</text>' +
        '<circle class="caixa" cx="110" cy="168" r="21"/>' +
        '<text x="110" y="173" text-anchor="middle" font-size="15">B</text>' +
        '<rect class="caixa" x="184" y="152" width="42" height="32" rx="6"/>' +
        '<text x="205" y="173" text-anchor="middle" font-size="13">R</text>' +
        '<rect class="caixa" x="264" y="152" width="42" height="32" rx="6"/>' +
        '<text x="285" y="173" text-anchor="middle" font-size="13">R</text>' +
        '<rect class="caixa" x="344" y="152" width="42" height="32" rx="6"/>' +
        '<text x="365" y="173" text-anchor="middle" font-size="13">R</text>' +
        '<circle class="caixa" cx="490" cy="168" r="21"/>' +
        '<text x="490" y="173" text-anchor="middle" font-size="15">C</text>' +
        '<path class="traco" d="M131 168 L184 168"/>' +
        '<path class="traco" d="M226 168 L264 168"/>' +
        '<path class="traco" d="M306 168 L344 168"/>' +
        '<path class="traco" d="M386 168 L469 168"/>' +
        '<path class="traco" stroke-dasharray="2 4" d="M110 79 L110 147"/>' +
        '<path class="traco" stroke-dasharray="2 4" d="M490 79 L490 147"/>' +
        "</svg>" +
        "<figcaption>Um salto entre vizinhos na sobreposição esconde vários enlaces " +
        "físicos, e nada garante que o caminho percorrido seja o mais curto. A razão entre " +
        "o custo do caminho lógico e o do caminho que a rede escolheria chama-se " +
        "alongamento. No exemplo do van Steen, 73 unidades contra 47, o que dá um " +
        "alongamento de 1,55.</figcaption>" +
        "</figure>" +
        "<p>Montar a sobreposição admite dois desenhos. Os nós podem se organizar " +
        "diretamente em <strong>árvore</strong>, com um caminho único entre cada par de " +
        "nós, ou em <strong>malha</strong>, em que cada nó tem vários vizinhos e existem " +
        "vários caminhos entre cada par.</p>" +
        "<p>A malha é mais robusta, e a razão é prática. Se uma ligação se rompe, porque um " +
        "nó falhou, ainda há por onde disseminar a informação, sem precisar reorganizar a " +
        "rede inteira na hora.</p>" +
        "<p>Escolher o pai de cada nó novo na árvore parece trivial e não é. Num grupo com " +
        "uma única origem, o melhor pai é obviamente a própria origem, porque assim o " +
        "alongamento vale 1. Só que fazer isso para todo mundo produz uma estrela com a " +
        "origem no centro, e a origem afunda sob a carga.</p>" +
        "<p>A saída limita a escolha aos nós que tenham no máximo um certo número de " +
        "vizinhos, e esse número vira parâmetro de projeto. A restrição complica " +
        "seriamente o algoritmo, porque encaixar um nó novo pode exigir reconfigurar parte " +
        "da árvore que já existia.</p>" +
        "<p>Existe ainda um caminho mais bruto, que é a <strong>inundação</strong>. Cada nó " +
        "repassa a mensagem aos vizinhos que ainda não a receberam, e num sistema " +
        "estruturado dá para dividir o espaço de identificadores de modo que a difusão " +
        "termine com N menos 1 mensagens, sendo N o número de nós. É simples e não exige " +
        "árvore nenhuma.</p>" +
        "<h3>Disseminação epidêmica</h3>" +
        "<p>Há uma terceira família, e ela abre mão da estrutura por completo. Os " +
        "<strong>protocolos epidêmicos</strong>, também chamados de fofoca, propagam " +
        "informação rapidamente entre muitos nós usando apenas informação local, sem " +
        "componente central nenhum coordenando a disseminação.</p>" +
        "<p>O vocabulário vem do estudo de epidemias, com a diferença de que aqui o " +
        "objetivo se inverte. Um nó está <strong>infectado</strong> quando tem um dado que " +
        "está disposto a espalhar, está <strong>suscetível</strong> quando ainda não viu " +
        "aquele dado, e está <strong>removido</strong> quando foi atualizado mas não " +
        "espalha mais. Quem projeta o protocolo quer infectar todo mundo o mais rápido " +
        "possível.</p>" +
        "<p>O modelo mais conhecido chama-se <strong>anti-entropia</strong>. Um nó P " +
        "escolhe outro nó Q ao acaso e troca atualizações com ele, e essa troca acontece de " +
        "três maneiras. P pode apenas puxar de Q o que lhe falta, pode apenas empurrar " +
        "para Q o que tem, ou os dois podem trocar nos dois sentidos.</p>" +
        "<p>Aqui aparece o resultado que costuma surpreender. <strong>Só empurrar é a pior " +
        "escolha.</strong> Num arranjo puramente de empurrar, quem propaga são os nós " +
        "infectados, e quando muitos já estão infectados a chance de cada um sortear " +
        "justamente um nó suscetível fica pequena. O resultado é que um nó pode continuar " +
        "sem a informação por muito tempo apenas porque ninguém o sorteou.</p>" +
        "<p>Puxar funciona melhor exatamente na situação inversa. Com muitos nós " +
        "infectados, quem dispara a propagação é o nó suscetível, e a chance de ele " +
        "encontrar alguém já infectado é grande. Combinar as duas direções é a melhor " +
        "estratégia, e o número de rodadas necessárias para levar uma atualização a todos " +
        "os nós cresce com o logaritmo do número de nós, o que é o mesmo que dizer que a " +
        "propagação é rápida e, sobretudo, escalável.</p>" +
        "<p>Uma variante chamada <strong>propagação de boato</strong> imita ainda mais de " +
        "perto a fofoca humana. O nó recém-atualizado procura outro e tenta empurrar a " +
        "novidade, mas se descobre que aquele outro já sabia, perde o interesse com certa " +
        "probabilidade e para de espalhar. É o que faz quem liga para um amigo com uma " +
        "notícia quente e desanima ao ouvir que ele já ficou sabendo.</p>" +
        "<p>Essa variante espalha notícia muito bem e traz um defeito que não dá para " +
        "esconder, porque ela <strong>não garante que todos os nós sejam atualizados</strong>. " +
        "A fração que permanece ignorante depende da probabilidade de desistir, e fica " +
        "sempre abaixo de mais ou menos 0,2. Para uma probabilidade de desistência de 0,20, " +
        "a fração que fica sem saber é de 0,0025, ou seja, cerca de um nó em cada " +
        "quatrocentos. Quando a desistência é alta, o sistema precisa de medida adicional " +
        "para fechar a conta.</p>" +
        "<p>Feche o tópico comparando as três famílias, porque a escolha entre elas é uma " +
        "troca e não um ranking.</p>" +
        '<div class="tabela-rolagem">' +
        '<table class="tabela-conteudo" id="tab-familias-multicast">' +
        "<tr><th>Família</th><th>O que ela exige</th><th>O que ela entrega</th></tr>" +
        "<tr><td>Árvore no nível da aplicação</td>" +
        "<td>Exige montar e manter a árvore, e reconfigurá-la quando um nó entra ou " +
        "sai.</td>" +
        "<td>Entrega a todos os membros por um caminho conhecido, com alongamento que " +
        "dá para medir e melhorar.</td></tr>" +
        "<tr><td>Inundação</td>" +
        "<td>Exige apenas que cada nó conheça os vizinhos dele.</td>" +
        "<td>Alcança todo mundo com N menos 1 mensagens, sem estrutura para " +
        "manter.</td></tr>" +
        "<tr><td>Epidemia</td>" +
        "<td>Exige só a capacidade de sortear outro nó e trocar atualizações com " +
        "ele.</td>" +
        "<td>Propaga em tempo logarítmico e escala muito bem, sem prometer que todos " +
        "serão alcançados.</td></tr>" +
        "</table>" +
        "</div>" +
        "<p>Guarde a anti-entropia com carinho, porque ela volta. Quando o curso chegar à " +
        "replicação, o problema de manter cópias em dia vai ser resolvido com esse mesmo " +
        "mecanismo, e o vocabulário de infectado, suscetível e removido vai reaparecer " +
        "aplicado a réplicas em vez de a nós.</p>" +
        /* A demo saiu daqui para página própria em 2026-08-07. O cartão fica neste
           ponto porque só aqui o aluno já leu tudo o que as quatro etapas cobram,
           das portas e soquetes até o multicast para réplicas. */
        '<a class="lab-card" href="demos/sockets-mensagens/index.html" ' +
        'target="_blank" rel="noopener">' +
        '<span class="lab-card-eyebrow">Demonstração interativa · 4 etapas · ' +
        "cerca de 10 min</span>" +
        '<span class="lab-card-title">O Middleware é Você</span>' +
        '<span class="lab-card-summary">Entregue mensagens à mão, sem middleware ' +
        "nenhum para ajudar. Você vai escolher portas, esperar o outro lado " +
        "responder, empacotar dados para atravessar a rede e mandar a mesma " +
        "mensagem para várias réplicas.</span>" +
        '<span class="lab-card-cta">Abrir a demonstração ↗</span>' +
        "</a>",
      slides: [
        {
          title: "Por que o multicast desceu de camada",
          html:
            "<ul>" +
            "<li>Montar caminhos de disseminação na rede custava caro</li>" +
            "<li>Provedores relutaram enquanto as propostas não convergiam</li>" +
            "<li>Par a par e sobreposições estruturadas destravaram</li>" +
            "<li>Os roteadores <strong>não participam</strong> da associação ao grupo</li>" +
            "</ul>"
        },
        {
          title: "O preço de não conhecer a rede",
          html:
            "<ul>" +
            "<li>Um salto lógico esconde vários enlaces físicos</li>" +
            "<li><strong>Alongamento</strong> mede o desvio, 73 contra 47</li>" +
            "<li>Árvore dá caminho único, malha dá robustez</li>" +
            "<li>O melhor pai sobrecarrega, então a escolha é limitada</li>" +
            "</ul>",
          ref: "fig-alongamento-sobreposicao"
        },
        {
          title: "Epidemia",
          html:
            "<ul>" +
            "<li>Infectado, suscetível, removido</li>" +
            "<li><strong>Só empurrar é a pior escolha</strong></li>" +
            "<li>Puxar funciona quando muitos já sabem</li>" +
            "<li>Propaga em tempo logarítmico, sem garantir todos</li>" +
            "</ul>"
        },
        {
          title: "As três famílias comparadas",
          ref: "tab-familias-multicast"
        }
      ]
    }
  ],

  quiz: [
    {
      question:
        "Um sistema em que o remetente pode encerrar logo depois de submeter a mensagem, e em que o destinatário nem precisava estar em execução naquele momento, é de que tipo?",
      options: [
        "Transiente, porque a mensagem só existe enquanto os dois lados executam.",
        "Persistente, porque o middleware guarda a mensagem até conseguir entregá-la.",
        "Síncrona, porque o remetente aguarda a confirmação antes de seguir adiante.",
        "Bloqueante, porque o destinatário controla quando a entrega vai acontecer."
      ],
      answer: 1,
      explanation:
        "O eixo da persistência responde por quanto tempo o sistema guarda a " +
        "mensagem. Na comunicação persistente, o middleware a armazena pelo tempo " +
        "que for preciso, e por isso os dois lados podem estar fora do ar em " +
        "momentos diferentes. O correio eletrônico é o exemplo clássico. Na " +
        "transiente, a mensagem é descartada quando a entrega não é possível."
    },
    {
      question:
        "Numa comunicação síncrona, o remetente é desbloqueado somente quando o destinatário processa o pedido e devolve o resultado. Qual arranjo isso descreve?",
      options: [
        "O ponto de sincronização mais barato, usado pelos sistemas de fila.",
        "O ponto intermediário, em que a mensagem apenas chegou ao destino.",
        "O ponto mais forte e mais caro, que corresponde à chamada remota.",
        "Um ponto inexistente, porque a resposta é sempre entregue de forma assíncrona."
      ],
      answer: 2,
      explanation:
        "A sincronização pode acontecer em três lugares. No primeiro, o remetente " +
        "espera só o middleware assumir a transmissão. No segundo, espera a " +
        "mensagem chegar ao destinatário. No terceiro, espera o processamento e a " +
        "resposta, que é a promessa mais forte e também a mais cara, porque o " +
        "remetente passa a pagar o tempo de processamento alheio."
    },
    {
      question:
        "Por que a operação accept devolve um soquete NOVO, em vez de reaproveitar aquele em que o servidor estava escutando?",
      options: [
        "Porque o soquete original continua livre para receber os próximos pedidos.",
        "Porque cada protocolo de transporte exige um soquete diferente do outro.",
        "Porque o soquete original perde o vínculo com a porta ao aceitar.",
        "Porque o cliente precisa vincular o soquete dele a uma porta fixa."
      ],
      answer: 0,
      explanation:
        "Quando um pedido de conexão chega, o sistema operacional cria um soquete " +
        "com as mesmas propriedades do original e o devolve a quem chamou. O " +
        "servidor entrega essa conversa a uma thread ou a um processo filho e volta " +
        "a esperar no soquete original. É esse desdobramento que permite atender " +
        "vários clientes ao mesmo tempo."
    },
    {
      question:
        "O software TCP declarou uma conexão desfeita depois de retransmitir sem receber confirmação. O que os processos que a usavam NÃO conseguem descobrir?",
      options: [
        "Quantos bytes tinham sido transmitidos desde o início daquela conexão TCP.",
        "Se a soma de verificação dos últimos segmentos recebidos estava correta.",
        "Qual era o número da porta remota que a conexão desfeita usava.",
        "Se a falha foi da rede ou do processo, e se o que enviou chegou."
      ],
      answer: 3,
      explanation:
        "A notificação de conexão desfeita tem duas propriedades incômodas. Ela não " +
        "distingue falha de rede de falha do processo do outro lado, e não informa " +
        "se as mensagens enviadas há pouco foram recebidas. É por isso que se diz " +
        "que o TCP não fornece comunicação confiável, e é daqui que sai a incerteza " +
        "que atravessa o curso inteiro."
    },
    {
      question:
        "Num formato com etiquetas de campo, como os buffers de protocolo, qual mudança de esquema é segura de fazer?",
      options: [
        "Renomear um campo, porque o nome não aparece nos dados codificados.",
        "Trocar a etiqueta de um campo por um número ainda não usado.",
        "Reaproveitar a etiqueta de um campo que foi removido do esquema.",
        "Estreitar um inteiro de 64 para 32 bits sem avisar os leitores."
      ],
      answer: 0,
      explanation:
        "Os dados codificados carregam a etiqueta numérica, nunca o nome, então " +
        "renomear é livre. Mudar a etiqueta invalidaria todo dado já escrito, e " +
        "reaproveitar a etiqueta de um campo removido faz o código novo interpretar " +
        "dado antigo como se fosse outra coisa. Estreitar um inteiro trunca valores " +
        "que não couberem no tamanho menor."
    },
    {
      question:
        "O Avro codifica um registro em 32 bytes, contra 81 do mesmo registro em JSON textual. O que ele cobra em troca dessa compactação?",
      options: [
        "Exige que cada campo receba um número de etiqueta estável no esquema.",
        "Exige que o leitor tenha exatamente o esquema usado por quem escreveu.",
        "Exige que todos os valores sejam convertidos para texto antes do envio.",
        "Exige que remetente e destinatário usem a mesma linguagem de programação."
      ],
      answer: 1,
      explanation:
        "A mensagem em Avro é a concatenação pura dos valores, sem nome e sem " +
        "etiqueta, e nada nela identifica campo ou tipo. Decodificar exige o esquema " +
        "de quem escreveu, e qualquer divergência produz dado interpretado errado, " +
        "não erro de leitura. A saída do Avro para a evolução usa dois esquemas ao " +
        "mesmo tempo, o do escritor e o do leitor."
    },
    {
      question:
        "Por que um agrupamento de servidores costuma exigir que as máquinas dele sejam servidores sem estado?",
      options: [
        "Porque servidores sem estado consomem bem menos memória que os demais.",
        "Porque o comutador precisa mandar qualquer pedido a qualquer máquina.",
        "Porque o estado só pode ser guardado na terceira camada, nunca antes.",
        "Porque a tradução de endereços apaga o contexto de cada cliente."
      ],
      answer: 1,
      explanation:
        "O comutador é o único endereço que o cliente conhece, e ele decide qual " +
        "máquina atende cada requisição. Essa liberdade só existe se nenhuma máquina " +
        "guardar contexto daquele cliente, porque senão o segundo pedido precisaria " +
        "cair exatamente onde o primeiro caiu. É o servidor sem estado que torna o " +
        "agrupamento possível."
    },
    {
      question:
        "Que garantia um sistema de fila de mensagens realmente oferece a quem envia uma mensagem?",
      options: [
        "Que a mensagem será lida pelo destinatário dentro do prazo combinado.",
        "Que a mensagem será entregue na mesma ordem em que foi enviada.",
        "Que a mensagem será eventualmente inserida na fila do destinatário.",
        "Que a mensagem será descartada se o destinatário estiver fora do ar."
      ],
      answer: 2,
      explanation:
        "A promessa é apenas de inserção na fila do destino. Nada é dito sobre " +
        "quando a mensagem será lida, nem sequer sobre se ela será lida, porque isso " +
        "depende inteiramente do comportamento de quem recebe. Essa garantia fraca é " +
        "justamente o que compra o desacoplamento no tempo, já que os dois lados " +
        "passam a executar de forma independente."
    },
    {
      question:
        "Na anti-entropia, por que a estratégia de APENAS empurrar atualizações se sai mal quando muitos nós já estão infectados?",
      options: [
        "Porque cada nó infectado tem pouca chance de sortear um nó suscetível.",
        "Porque empurrar exige que o nó conheça todos os outros do sistema.",
        "Porque a mensagem empurrada perde a marca de tempo pelo caminho.",
        "Porque nós infectados param de espalhar assim que são atualizados."
      ],
      answer: 0,
      explanation:
        "Num arranjo puramente de empurrar, quem propaga são os nós infectados. " +
        "Quando muitos já estão infectados, a chance de cada um sortear justamente " +
        "um nó que ainda não sabe fica pequena, e um nó pode ficar sem a informação " +
        "por muito tempo só porque ninguém o sorteou. Puxar inverte isso, porque a " +
        "propagação passa a ser disparada por quem ainda não sabe."
    },
    {
      question:
        "No multicast em nível de aplicação, o que explica o alongamento entre o caminho lógico e o caminho que a rede escolheria?",
      options: [
        "Os nós do grupo trocam mensagens sempre por datagramas UDP.",
        "A árvore de disseminação precisa ser reconstruída a cada mensagem.",
        "Os roteadores da rede não participam da associação ao grupo.",
        "O tempo de vida do datagrama limita quantos saltos ele percorre."
      ],
      answer: 2,
      explanation:
        "Quem sabe quem é membro do grupo são os nós da sobreposição, e a rede por " +
        "baixo não faz ideia de que existe um grupo. Por isso uma ligação entre dois " +
        "vizinhos lógicos pode atravessar vários enlaces físicos, às vezes o mesmo " +
        "enlace mais de uma vez. A razão entre o custo do caminho lógico e o do " +
        "caminho da rede é o alongamento."
    }
  ],

  glossary: [
    {
      term: "Comunicação persistente",
      definition:
        "Arranjo em que o middleware armazena a mensagem pelo tempo que for " +
        "preciso para entregá-la. O remetente pode encerrar depois de submetê-la, e " +
        "o destinatário não precisa estar em execução no momento do envio."
    },
    {
      term: "Comunicação transiente",
      definition:
        "Arranjo em que o sistema guarda a mensagem apenas enquanto as duas " +
        "aplicações estiverem em execução. Se a entrega não puder acontecer, a " +
        "mensagem é descartada. Todo serviço de nível de transporte é transiente."
    },
    {
      term: "Comunicação assíncrona",
      definition:
        "Forma de troca em que o remetente prossegue imediatamente depois de " +
        "submeter a mensagem, que fica guardada pelo middleware no ato da submissão."
    },
    {
      term: "Comunicação síncrona",
      definition:
        "Forma de troca em que o remetente fica bloqueado até saber que o pedido " +
        "dele foi aceito. A sincronização pode acontecer na submissão, na entrega ao " +
        "destinatário ou apenas quando a resposta volta."
    },
    {
      term: "Soquete (socket)",
      definition:
        "Ponto de extremidade da comunicação, no qual a aplicação escreve os dados " +
        "que saem e do qual lê os dados que chegam. Funciona como abstração sobre a " +
        "porta que o sistema operacional usa para um protocolo de transporte, e cada " +
        "soquete pertence a um protocolo só."
    },
    {
      term: "Porta",
      definition:
        "Destino de mensagem dentro de um computador, identificado por um número " +
        "inteiro. Tem um único destinatário e pode ter muitos remetentes, e um " +
        "processo não compartilha uma porta com outro processo da mesma máquina."
    },
    {
      term: "Empacotamento (marshalling)",
      definition:
        "Procedimento de montar um conjunto de itens de dados numa forma " +
        "conveniente para viajar em uma mensagem, convertendo-os para a " +
        "representação externa de dados. O inverso, feito na chegada, é o " +
        "desempacotamento."
    },
    {
      term: "Representação externa de dados",
      definition:
        "Padrão acordado para representar estruturas de dados e valores primitivos " +
        "de forma independente das diferenças entre computadores, que incluem a " +
        "ordem dos bytes de um inteiro, a representação do ponto flutuante e o " +
        "código de caracteres."
    },
    {
      term: "Etiqueta de campo",
      definition:
        "Número que identifica um campo dentro de um formato com esquema, como os " +
        "buffers de protocolo. Ela substitui o nome do campo nos dados codificados, " +
        "e é por isso que renomear um campo é livre enquanto trocar a etiqueta " +
        "invalida todo dado já escrito."
    },
    {
      term: "Evolução do esquema",
      definition:
        "Capacidade de mudar a estrutura das mensagens sem parar o sistema. Há " +
        "compatibilidade para a frente quando o código antigo lê dados escritos pelo " +
        "novo, e compatibilidade para trás quando o código novo lê dados escritos " +
        "pelo antigo."
    },
    {
      term: "Servidor sem estado",
      definition:
        "Servidor que não guarda informação sobre a situação dos clientes, ou que " +
        "guarda apenas informação cuja perda não interrompe o serviço. Recuperar de " +
        "uma queda é trivial, porque basta voltar a executar e esperar requisições."
    },
    {
      term: "Estado leve (soft state)",
      definition:
        "Meio-termo em que o servidor promete guardar informação em nome do cliente " +
        "por um tempo limitado. Vencido o prazo, ele volta ao comportamento padrão e " +
        "descarta o que guardava."
    },
    {
      term: "Agrupamento de servidores",
      definition:
        "Conjunto de máquinas ligadas por rede, cada uma executando um ou mais " +
        "servidores, organizado com frequência em três camadas. Na primeira fica o " +
        "comutador que despacha as requisições, na segunda os servidores de " +
        "aplicação e na terceira os servidores de dados."
    },
    {
      term: "Sistema de fila de mensagens",
      definition:
        "Middleware que oferece armazenamento de médio prazo para mensagens, sem " +
        "exigir que remetente ou destinatário estejam ativos durante a transmissão. " +
        "A garantia dada a quem envia é apenas a de inserção na fila do destino."
    },
    {
      term: "Intermediário de mensagens",
      definition:
        "Nó especial de uma rede de filas que converte mensagens para que a " +
        "aplicação de destino as entenda. Para o sistema de filas ele é apenas mais " +
        "uma aplicação, e não uma peça interna, e também faz a mediação de onde nasce " +
        "o modelo publicar e assinar."
    },
    {
      term: "Alongamento (stretch)",
      definition:
        "Razão entre o custo do caminho percorrido na rede de sobreposição e o " +
        "custo do caminho que a rede escolheria entre os mesmos dois nós. Ele existe " +
        "porque os roteadores não participam da associação ao grupo."
    },
    {
      term: "Anti-entropia",
      definition:
        "Modelo de propagação epidêmica em que um nó escolhe outro ao acaso e troca " +
        "atualizações com ele, puxando, empurrando ou fazendo as duas coisas. O " +
        "número de rodadas para alcançar todos cresce com o logaritmo do número de " +
        "nós."
    },
    {
      term: "Propagação de boato",
      definition:
        "Variante epidêmica em que o nó recém-atualizado empurra a novidade e " +
        "desiste de espalhar, com certa probabilidade, ao descobrir que o outro já " +
        "sabia. Espalha depressa, mas não garante que todos os nós sejam " +
        "atualizados."
    }
  ],

  references: [
    "VAN STEEN, M.; TANENBAUM, A. S. Distributed Systems. 4. ed. (versão DS 4.03). " +
    "distributed-systems.net. Cap. 4. Communication, seções 4.1.2, 4.3 e 4.4, mais as " +
    "seções 3.4.1 e 3.4.4 do Cap. 3. Processes. Fonte principal deste tópico, de onde " +
    "vêm a classificação da comunicação em dois eixos, os três pontos de " +
    "sincronização, a interface de soquetes, o desenho de servidores e o agrupamento " +
    "em três camadas, os sistemas de fila de mensagens com o intermediário, e o " +
    "multicast em nível de aplicação com a disseminação epidêmica.",
    "COULOURIS, G.; DOLLIMORE, J.; KINDBERG, T.; BLAIR, G. Sistemas Distribuídos: " +
    "Conceitos e Projeto. 5. ed. Porto Alegre: Bookman, 2013. Cap. 4. Comunicação " +
    "Entre Processos (pp. 145-183) e Cap. 6. Comunicação Indireta, seções 6.2 e 6.4. " +
    "Organiza a progressão do tópico e é a fonte do modelo de falhas do UDP e do TCP " +
    "vistos pela aplicação, e do empacotamento com a representação comum de dados.",
    "KLEPPMANN, M. Designing Data-Intensive Applications. 2. ed. Sebastopol: " +
    "O'Reilly, 2026. Cap. 5. Encoding and Evolution. Leitura complementar que " +
    "atualiza o empacotamento, com JSON, buffers de protocolo, Avro e evolução de " +
    "esquema, e que traz os balanceadores de carga, a descoberta de serviço e as " +
    "malhas de serviço.",
    "TORNOW, S. Thinking Distributed Systems. Cap. 5. Message Delivery and " +
    "Processing. Leitura complementar sobre as garantias de entrega no máximo uma " +
    "vez, ao menos uma vez e exatamente uma vez.",
    "KSHEMKALYANI, A. D.; SINGHAL, M. Distributed Computing: Principles, Algorithms, " +
    "and Systems. Cambridge University Press, 2011. Cap. 6. Message Ordering and " +
    "Group Communication. Leitura complementar sobre as ordens FIFO, causal e total " +
    "na comunicação em grupo."
  ]
};
