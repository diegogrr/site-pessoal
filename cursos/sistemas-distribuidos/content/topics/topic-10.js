/* ============================================================
   topic-10.js — Replicação
   ------------------------------------------------------------
   Estrutura documentada no modelo topic-01.js (sections[] com
   slides[] opcionais, quiz[], glossary[], references[]).
   Fundamentação: manifesto em docs/fontes/topico-10.json.
   Recorte da decisao 3-A de docs/fontes/README.md, escolhido
   por Diego em 2026-08-13. Entram van Steen 7.1, 7.4 e 7.6 mais
   o Coulouris 18 inteiro; as secoes 7.2, 7.3 e 7.5 do van Steen
   ficam reservadas ao topico novo Consistencia. Nas secoes 3 a
   6 o Coulouris manda no conteudo, e nao so no esqueleto,
   porque a fatia do van Steen sobre os mesmos assuntos pertence
   aquele topico. O teorema CAP saiu do texto por falta de
   lastro nas paginas declaradas; a justificativa esta no campo
   "cortes" do manifesto.
   ============================================================ */

window.SD = window.SD || {};
SD.content = SD.content || {};

SD.content["10"] = {

  sections: [
    {
      title: "Por que replicar, e o preço que vem junto",
      html:
        "<p>Os tópicos anteriores encostaram na replicação sem lhe dar nome. O serviço " +
        "de nomes da Internet exige que cada zona esteja em pelo menos dois servidores " +
        "com autoridade, o sistema de arquivos distribuído guarda no cliente uma cópia " +
        "do que o servidor entregou, e o navegador conserva a página que acabou de " +
        "buscar para não precisar pedi-la outra vez. Os três fazem a mesma coisa, que é " +
        "manter cópias do mesmo dado em computadores diferentes.</p>" +
        "<p>Essa técnica se chama <strong>replicação</strong>, e ela sustenta boa parte " +
        "do que hoje se espera de um sistema distribuído. Este tópico responde a quatro " +
        "perguntas sobre ela. Por que manter cópias, onde colocá-las, como mantê-las " +
        "parecidas o bastante e quanto tudo isso custa.</p>" +

        "<h3>Manter cópias aumenta a confiabilidade</h3>" +
        "<p>A primeira razão para replicar é sobreviver a defeitos. Se um sistema de " +
        "arquivos foi replicado, o trabalho continua depois que uma réplica colapsa, " +
        "porque basta passar a usar outra. Guardar várias cópias protege também contra " +
        "dado corrompido. Imagine três cópias de um arquivo, em que toda leitura e toda " +
        "escrita são feitas nas três. O valor devolvido por pelo menos duas delas pode " +
        "ser tomado como o correto, e uma escrita que falhou sozinha deixa de contaminar " +
        "o resultado.</p>" +
        "<p>Vale dividir essa razão em duas, e a distinção organiza metade deste tópico. " +
        "Uma coisa é a <strong>disponibilidade</strong>, que é a fração do tempo em que o " +
        "serviço responde em prazo razoável. Outra é a <strong>tolerância a " +
        "falhas</strong>, que é garantir comportamento rigorosamente correto apesar de " +
        "certo número e certo tipo de falhas. Dado altamente disponível não é a mesma " +
        "coisa que dado rigorosamente correto, porque ele pode simplesmente estar " +
        "velho.</p>" +
        "<p>A disponibilidade tem uma conta simples por trás dela. Se cada um de " +
        "<em>n</em> servidores tem probabilidade independente <em>p</em> de falhar ou de " +
        "ficar inacessível, o objeto guardado em todos eles só desaparece quando todos " +
        "falham ao mesmo tempo, e a disponibilidade vale <code>1 - p<sup>n</sup></code>. " +
        "Com dois servidores e 5% de chance de falha em cada um, ela sobe de 95% para " +
        "99,75%. Cada cópia a mais multiplica por <em>p</em> a probabilidade de " +
        "indisponibilidade total, e é por isso que a terceira cópia rende bem menos que a " +
        "segunda.</p>" +
        "<p>Convém não confundir cache com réplica de servidor nessa conta. Uma cache não " +
        "guarda necessariamente conjuntos inteiros de objetos, e sim os pedaços que " +
        "alguém pediu há pouco. O usuário pode ter na cache o arquivo de que precisa " +
        "agora e não ter o próximo, de modo que o uso de cache não melhora a " +
        "disponibilidade no nível da aplicação da mesma forma que replicar o servidor " +
        "melhora.</p>" +
        "<p>O segundo inimigo da disponibilidade não é a queda de um servidor, e sim a " +
        "queda do caminho até ele. Um <strong>particionamento da rede</strong> divide o " +
        "sistema em pedaços que não conseguem se falar, e a <strong>operação " +
        "desconectada</strong> é o caso extremo, em que o cliente fica sozinho. O usuário " +
        "num trem, com o computador portátil fora do alcance da rede, só consegue " +
        "trabalhar se copiou antes o que pretende usar. Ele paga por isso com o risco de " +
        "ler dado que outra pessoa já alterou, e de marcar um compromisso numa hora que " +
        "deixou de estar livre.</p>" +
        "<p>A tolerância a falhas usa a mesma técnica com uma exigência mais dura. Se até " +
        "<em>f</em> de <strong>f + 1</strong> servidores falham por colapso, ao menos um " +
        "sobra para atender, e isso basta enquanto os sobreviventes se comportam conforme " +
        "a especificação. Quando o defeito pode fazer um servidor responder qualquer " +
        "coisa, inclusive um valor inventado, o número muda. São necessários " +
        "<strong>2f + 1</strong> servidores para mascarar <em>f</em> falhas desse tipo, " +
        "porque assim os corretos vencem os defeituosos por voto.</p>" +

        "<h3>Manter cópias também melhora o desempenho</h3>" +
        "<p>A segunda razão para replicar não tem nada a ver com defeito. Ela aparece " +
        "quando o sistema precisa crescer, e crescer acontece de dois jeitos diferentes. " +
        "Crescer em tamanho é atender um número cada vez maior de processos que disputam " +
        "o mesmo servidor, e a saída é replicar o servidor e dividir a carga entre as " +
        "cópias. Crescer em área geográfica é atender clientes espalhados pelo mundo, e a " +
        "saída é pôr uma cópia perto de quem usa, para que o tempo de acesso caia.</p>" +
        "<p>O ganho de desempenho é mais difícil de avaliar do que parece. O processo " +
        "cliente percebe respostas mais rápidas, e ao mesmo tempo a rede passa a carregar " +
        "as mensagens que mantêm todas as cópias atualizadas. Replicar dado imutável sai " +
        "barato, porque nada precisa ser propagado depois. Replicar dado mutável cobra os " +
        "protocolos que este tópico inteiro descreve, e existe um ponto a partir do qual " +
        "a conta deixa de fechar.</p>" +
        "<p>Uma razão numérica ajuda a enxergar esse ponto. Considere um processo que lê " +
        "a réplica local <em>N</em> vezes por segundo, enquanto a réplica é atualizada " +
        "<em>M</em> vezes por segundo. Quando <em>N</em> é muito menor que <em>M</em>, a " +
        "maior parte das versões que atravessaram a rede nunca chega a ser lida, e o " +
        "tráfego gasto com elas foi desperdício puro. Nesse caso teria sido melhor não " +
        "instalar a cópia local, ou atualizá-la por outra estratégia.</p>" +
        "<p>As três motivações pedem coisas diferentes do sistema, e vale vê-las lado a " +
        "lado antes de seguir. A tabela compara o que cada uma promete, como se mede o " +
        "resultado dela e o que ela aceita perder em troca.</p>" +
        '<div class="tabela-rolagem">' +
        '<table class="tabela-conteudo" id="tab-motivos">' +
        "<tr><th>Motivação</th><th>O que ela promete</th><th>Como se mede</th>" +
        "<th>O que ela aceita perder</th></tr>" +
        "<tr><td>Desempenho</td><td>Encurta o caminho entre quem pede e o dado, " +
        "espalhando cópias e dividindo a carga.</td><td>Mede-se pelo tempo de resposta " +
        "percebido pelo cliente e pela carga que sobra em cada servidor.</td>" +
        "<td>Aceita gastar banda de rede com atualizações que talvez ninguém leia.</td></tr>" +
        "<tr><td>Disponibilidade</td><td>Mantém o serviço acessível quando um servidor " +
        "cai ou quando a rede se parte.</td><td>Mede-se pela fração do tempo em que o " +
        "serviço responde em prazo razoável.</td><td>Aceita entregar dado velho, e " +
        "conviver com atualizações conflitantes feitas em lados opostos de uma " +
        "partição.</td></tr>" +
        "<tr><td>Tolerância a falhas</td><td>Garante comportamento correto apesar de um " +
        "número e de um tipo de falha combinados de antemão.</td><td>Mede-se pelo número " +
        "de falhas que o serviço atravessa sem que o cliente perceba diferença.</td>" +
        "<td>Aceita fazer o cliente esperar a coordenação entre as cópias antes de " +
        "responder.</td></tr>" +
        "</table>" +
        "</div>" +
        "<p>A última coluna é a que interessa ao resto do tópico. Nenhuma das três sai de " +
        "graça, e todas compram o que prometem gastando comunicação entre as cópias.</p>" +

        "<h3>O preço da replicação é a inconsistência</h3>" +
        "<p>Se replicar melhora confiabilidade e desempenho ao mesmo tempo, quem poderia " +
        "ser contra? O problema aparece no instante em que uma cópia é modificada, porque " +
        "nesse momento ela deixa de ser igual às outras. Para que o conjunto volte a " +
        "fazer sentido, a modificação precisa alcançar todas as demais, e é exatamente " +
        "<em>quando</em> e <em>como</em> isso acontece que define o preço.</p>" +
        "<p>O caso mais familiar é o do navegador. Buscar uma página num servidor distante " +
        "pode levar segundos, então o navegador guarda localmente a cópia do que acabou " +
        "de carregar e a devolve na próxima visita. O tempo de acesso percebido pelo " +
        "usuário fica excelente. Se a página mudou nesse meio-tempo, porém, a modificação " +
        "não chegou até a cópia guardada, e o usuário lê algo que já não é verdade.</p>" +
        "<p>Existem duas saídas óbvias para isso, e as duas são ruins. Proibir o navegador " +
        "de guardar cópias devolve o controle ao servidor e traz de volta o tempo de " +
        "acesso alto, sobretudo quando não há réplica nenhuma perto do usuário. Fazer o " +
        "servidor avisar cada cópia guardada resolve a atualização e obriga o servidor a " +
        "saber quem tem o quê, o que degrada o desempenho dele justamente no ponto em que " +
        "ele precisava crescer.</p>" +
        "<p>A forma rigorosa de manter tudo igual tem nome. Ela se chama " +
        "<strong>consistência estrita</strong> e é realizada pela <strong>replicação " +
        "síncrona</strong>, em que a atualização é aplicada em todas as cópias como uma " +
        "operação atômica única. A leitura em qualquer cópia devolve sempre o mesmo " +
        "resultado, e nenhuma operação posterior começa antes de a atualização ter " +
        "alcançado todo mundo.</p>" +
        "<p>Fazer isso funcionar em larga escala é caro por um motivo específico. Antes de " +
        "aplicar a atualização, as réplicas precisam concordar sobre o instante em que " +
        "ela entra, e concordar exige troca de mensagens. Elas podem decidir uma ordem " +
        "global usando carimbos de tempo lógicos, ou deixar que um coordenador atribua " +
        "essa ordem. Nos dois casos a sincronização global consome tempo, e ela consome " +
        "muito mais quando as réplicas estão espalhadas por uma rede de longa " +
        "distância.</p>" +
        "<p>O resultado é um dilema que não se resolve escolhendo melhor. A figura mostra " +
        "as duas forças em disputa conforme o número de cópias cresce, sem números nos " +
        "eixos, porque o que importa aqui é o sentido de cada curva.</p>" +
        '<figure class="figura" id="fig-dilema">' +
        '<svg viewBox="0 0 600 300" role="img" aria-labelledby="fig-dilema-titulo">' +
        '<title id="fig-dilema-titulo">Um gráfico esquemático com dois eixos e nenhuma ' +
        "escala numérica. O eixo horizontal representa o número de cópias e cresce para a " +
        "direita. Uma curva desce da esquerda para a direita e está rotulada como tempo " +
        "de acesso do cliente. Outra curva sobe da esquerda para a direita e está " +
        "rotulada como custo de manter as cópias iguais. As duas se cruzam perto do meio " +
        "do gráfico, e um traço vertical pontilhado marca esse cruzamento, com a " +
        "observação de que a partir dali a cura sai mais cara que a doença.</title>" +
        '<path class="traco" d="M70 258 L556 258"/>' +
        '<path class="seta" d="M556 252 L556 264 L568 258 Z"/>' +
        '<path class="traco" d="M70 258 L70 34"/>' +
        '<path class="seta" d="M64 34 L76 34 L70 22 Z"/>' +
        '<text class="rotulo-secundario" x="313" y="288" text-anchor="middle" ' +
        'font-size="12">número de cópias</text>' +
        '<path class="traco" d="M85 60 Q 250 230 545 235"/>' +
        '<path class="traco" d="M85 235 Q 400 225 545 60"/>' +
        '<path class="traco" stroke-dasharray="5 5" d="M298 70 L298 226"/>' +
        '<text x="88" y="44" font-size="12">tempo de acesso do cliente</text>' +
        '<text x="545" y="44" text-anchor="end" font-size="12">custo de manter as ' +
        "cópias iguais</text>" +
        '<text class="rotulo-secundario" x="298" y="246" text-anchor="middle" ' +
        'font-size="11">daqui em diante a cura sai mais cara</text>' +
        "</svg>" +
        "<figcaption>Cada cópia nova aproxima o dado de quem lê e afasta as cópias umas " +
        "das outras. As duas curvas andam em sentidos opostos, e nenhum arranjo de " +
        "engenharia faz as duas descerem ao mesmo tempo.</figcaption>" +
        "</figure>" +
        "<p>A figura explica por que a saída não é técnica, e sim de projeto. A única " +
        "coisa que se pode mover é a exigência de consistência. Se a atualização deixa de " +
        "precisar ser atômica, a sincronização global instantânea desaparece e o " +
        "desempenho volta, ao preço de as cópias nem sempre serem iguais em toda parte. O " +
        "quanto é possível relaxar depende do padrão de acesso e de atualização dos dados " +
        "e do uso que se faz deles, e não existe resposta única.</p>" +

        "<h3>Dois requisitos atravessam o tópico inteiro</h3>" +
        "<p>Antes de descer aos mecanismos, vale fixar o que se pede de qualquer sistema " +
        "replicado. O primeiro requisito é a <strong>transparência de " +
        "replicação</strong>. O cliente enxerga um objeto lógico só e recebe um conjunto " +
        "único de valores, sem saber quantas cópias físicas existem nem qual delas o " +
        "atendeu.</p>" +
        "<p>O segundo requisito é a <strong>consistência</strong>, e ele varia com o rigor " +
        "que cada aplicação exige. As operações executadas sobre um conjunto de objetos " +
        "replicados precisam produzir resultados que satisfaçam a especificação de " +
        "correção daqueles objetos. O que muda de sistema para sistema é a especificação, " +
        "e não a exigência.</p>" +
        "<p>Daqui em diante, uma pergunta só costura as seções. Quantas cópias precisam " +
        "concordar antes de o cliente receber a resposta? A seção seguinte mostra onde as " +
        "cópias ficam e por que caminho a atualização viaja até elas. A terceira monta o " +
        "vocabulário comum. A quarta e a quinta percorrem os dois extremos, com todas as " +
        "cópias concordando antes de responder e com uma só respondendo enquanto as " +
        "outras alcançam depois. A sexta transforma essa contagem em dois números que o " +
        "projetista ajusta, e a última mostra a resposta que a Web deu.</p>",
      slides: [
        {
          title: "Replicar é manter cópias em máquinas diferentes",
          html:
            "<ul>" +
            "<li>O DNS, o sistema de arquivos distribuído e o navegador já faziam isso</li>" +
            "<li>Replicar aumenta a <strong>confiabilidade</strong> e melhora o " +
            "<strong>desempenho</strong></li>" +
            "<li>O tópico pergunta por que, onde, como e a que custo</li>" +
            "</ul>"
        },
        {
          title: "Disponibilidade tem conta, correção tem número",
          html:
            "<ul>" +
            "<li>Falha independente <em>p</em> em <em>n</em> servidores dá " +
            "<code>1 - p<sup>n</sup></code> de disponibilidade</li>" +
            "<li>Dois servidores a 5% levam 95% para <strong>99,75%</strong></li>" +
            "<li><strong>f + 1</strong> réplicas atravessam <em>f</em> colapsos</li>" +
            "<li><strong>2f + 1</strong> mascaram <em>f</em> defeitos que respondem " +
            "qualquer coisa</li>" +
            "</ul>"
        },
        {
          title: "As três motivações lado a lado",
          ref: "tab-motivos"
        },
        {
          title: "O dilema que nenhum arranjo resolve",
          ref: "fig-dilema",
          html:
            "<ul>" +
            "<li>Cópia perto do cliente derruba o tempo de acesso</li>" +
            "<li>Manter as cópias iguais exige sincronização global e sobe o custo</li>" +
            "<li>A única peça que se move é a exigência de consistência</li>" +
            "</ul>"
        },
        {
          title: "A pergunta que costura o tópico",
          html:
            "<ul>" +
            "<li><strong>Transparência</strong> esconde do cliente quantas cópias existem</li>" +
            "<li><strong>Consistência</strong> é a especificação que o conjunto precisa " +
            "satisfazer</li>" +
            "<li>Quantas cópias precisam <strong>concordar</strong> antes de responder?</li>" +
            "</ul>"
        }
      ]
    },

    {
      title: "Onde ficam as cópias e como a atualização chega até elas",
      html:
        "<p>A decisão mais concreta de um sistema replicado é onde pôr as cópias. Ela " +
        "parece uma pergunta só e são duas, que costumam ser confundidas. Uma delas é " +
        "onde instalar os <strong>servidores de réplica</strong>, que é escolher lugares " +
        "na rede. A outra é qual <strong>conteúdo</strong> guardar em cada servidor já " +
        "instalado, que é escolher o que vai para onde.</p>" +
        "<p>Separar as duas ajuda porque elas mudam em ritmos muito diferentes. Instalar " +
        "servidor é decisão de infraestrutura, tomada com meses de antecedência e revista " +
        "raramente. Decidir qual arquivo mora em qual servidor é decisão de operação, e " +
        "pode mudar de hora em hora conforme a demanda se desloca.</p>" +

        "<h3>Onde instalar os servidores</h3>" +
        "<p>Escrito com rigor, o problema é escolher os <em>K</em> melhores lugares entre " +
        "<em>N</em> possíveis. Ele é computacionalmente difícil e só se resolve por " +
        "heurística, o que já seria motivo suficiente para desconfiar de qualquer solução " +
        "que se anuncie ótima. Antes disso, porém, é preciso decidir o que significa " +
        "melhor, e aí entram dois grupos de critério. Os de custo tratam do que se paga a " +
        "cada organização que hospeda um servidor, e os de rede tratam de latência até os " +
        "clientes, banda disponível e número de saltos.</p>" +
        "<p>Existe uma literatura grande de modelos para essa escolha, organizada por " +
        "Sahoo e colegas em famílias que otimizam qualidade de serviço, custo de manter a " +
        "consistência ou consumo de energia. O próprio autor do livro faz a ressalva que " +
        "importa aqui. Todos esses modelos dependem de medir com precisão coisas que são " +
        "difíceis de medir, como a latência até um cliente ao qual não se tem acesso, ou " +
        "a banda realmente disponível entre dois pontos. Quando o dado de entrada é " +
        "impreciso, otimizar em cima dele produz uma resposta que parece exata e não é, " +
        "de modo que uma heurística rápida costuma bastar, desde que o resultado seja " +
        "lido com desconfiança.</p>" +

        "<h3>Três tipos de cópia, em três anéis</h3>" +
        "<p>Decidido onde ficam os servidores, resta saber que cópias vivem neles. As " +
        "cópias de uma loja de dados se organizam em três tipos, e o que os distingue não " +
        "é a tecnologia, e sim quem tomou a iniciativa de criá-las.</p>" +
        '<figure class="figura" id="fig-tres-aneis">' +
        '<svg viewBox="0 0 600 360" role="img" aria-labelledby="fig-tres-aneis-titulo">' +
        '<title id="fig-tres-aneis-titulo">Três círculos concêntricos. O círculo mais ' +
        "interno, destacado, traz as réplicas permanentes. O anel do meio traz as " +
        "réplicas iniciadas pelo servidor. O anel externo traz as réplicas iniciadas pelo " +
        "cliente, que são as caches. Fora dos círculos, embaixo, duas caixas representam " +
        "clientes, e delas saem setas apontando para dentro do anel externo.</title>" +
        '<circle class="caixa" cx="300" cy="155" r="135"/>' +
        '<circle class="caixa" cx="300" cy="155" r="95"/>' +
        '<circle class="caixa-destaque" cx="300" cy="155" r="52"/>' +
        '<text x="300" y="150" text-anchor="middle" font-size="12">Réplicas</text>' +
        '<text x="300" y="166" text-anchor="middle" font-size="12">permanentes</text>' +
        '<text x="300" y="84" text-anchor="middle" font-size="12">Iniciadas pelo servidor</text>' +
        '<text class="rotulo-secundario" x="300" y="98" text-anchor="middle" ' +
        'font-size="11">o dono do dado decide criá-las</text>' +
        '<text x="300" y="40" text-anchor="middle" font-size="12">Iniciadas pelo cliente</text>' +
        '<text class="rotulo-secundario" x="300" y="54" text-anchor="middle" ' +
        'font-size="11">são as caches</text>' +
        '<rect class="caixa" x="180" y="313" width="90" height="32" rx="8"/>' +
        '<text x="225" y="334" text-anchor="middle" font-size="12">Cliente</text>' +
        '<rect class="caixa" x="330" y="313" width="90" height="32" rx="8"/>' +
        '<text x="375" y="334" text-anchor="middle" font-size="12">Cliente</text>' +
        '<path class="traco" d="M225 313 L225 284"/>' +
        '<path class="seta" d="M219 284 L231 284 L225 272 Z"/>' +
        '<path class="traco" d="M375 313 L375 284"/>' +
        '<path class="seta" d="M369 284 L381 284 L375 272 Z"/>' +
        "</svg>" +
        "<figcaption>Quanto mais para fora, mais perto de quem lê e menos permanente. O " +
        "anel externo aparece e some conforme o cliente pede, e ninguém no centro precisa " +
        "saber que ele existe.</figcaption>" +
        "</figure>" +
        "<p>No centro estão as <strong>réplicas permanentes</strong>, que são o conjunto " +
        "inicial e costumam ser poucas. Um sítio Web distribuído aparece em duas formas " +
        "conhecidas. Numa delas, os arquivos são copiados para um número limitado de " +
        "servidores no mesmo lugar físico, e cada pedido que chega é encaminhado a um " +
        "deles por rodízio. Na outra, chamada de espelhamento, o sítio inteiro é copiado " +
        "para alguns servidores espalhados geograficamente, e o cliente escolhe um espelho " +
        "numa lista ou é encaminhado a ele sem perceber. Bancos de dados distribuídos " +
        "seguem arranjo parecido, ora num agrupamento de servidores que não compartilham " +
        "disco nem memória, ora em instalações dispersas de uma federação.</p>" +
        "<p>No anel do meio ficam as <strong>réplicas iniciadas pelo servidor</strong>, " +
        "criadas por decisão de quem é dono do dado e com o único objetivo de melhorar o " +
        "desempenho. Pense num servidor Web instalado em Nova York, que dá conta do " +
        "recado sem esforço até o dia em que uma onda inesperada de pedidos começa a " +
        "chegar de um lugar distante. Vale a pena instalar cópias temporárias perto de " +
        "onde os pedidos nasceram, e desfazê-las quando a onda passar.</p>" +
        "<p>Hoje esse papel foi em boa parte entregue às <strong>redes de distribuição de " +
        "conteúdo</strong>, que a última seção deste tópico examina de perto. Vale " +
        "adiantar um ponto de classificação. Nelas a replicação acontece sob demanda, " +
        "porque o cliente é dirigido ao servidor de réplica mais próximo e é aquele " +
        "servidor que verifica se tem o conteúdo guardado. Ainda assim continua sendo " +
        "replicação iniciada pelo servidor, já que quem decide para onde dirigir o " +
        "cliente e o que armazenar é a rede de distribuição, e não quem pediu a " +
        "página.</p>" +
        "<p>No anel externo ficam as <strong>réplicas iniciadas pelo cliente</strong>, " +
        "conhecidas por outro nome. São as caches. Uma cache é um espaço local onde o " +
        "cliente guarda temporariamente uma cópia do que acabou de pedir, e em princípio " +
        "quem cuida dela é o próprio cliente. A loja de dados de onde o dado veio não tem " +
        "obrigação nenhuma de mantê-la em dia, embora em muitos casos ela colabore, " +
        "avisando quando o que está guardado envelheceu.</p>" +
        "<p>Quando o dado pedido está na cache local, houve um <strong>acerto de " +
        "cache</strong>, e o pedido nem chega à rede. Para elevar a taxa de acerto, é " +
        "possível compartilhar a cache entre vários clientes, na aposta de que o que um " +
        "deles pediu interessa a outro por perto. A aposta depende inteiramente do tipo " +
        "de dado. Em sistemas de arquivos tradicionais, os arquivos quase nunca são " +
        "compartilhados de fato, o que torna a cache compartilhada inútil. Na Web ela " +
        "funcionou por anos e vem perdendo terreno, porque as redes e os servidores " +
        "ficaram rápidos o bastante para que a replicação iniciada pelo servidor " +
        "compense mais.</p>" +

        "<h3>O que viaja quando algo muda</h3>" +
        "<p>Colocada a cópia, começa o trabalho de mantê-la em dia. A primeira escolha é " +
        "sobre o que exatamente atravessa a rede quando o dado muda, e há três " +
        "possibilidades com custos bem diferentes.</p>" +
        "<ul>" +
        "<li>Propagar apenas um <strong>aviso</strong> de que houve mudança é o que fazem " +
        "os protocolos de invalidação. A outra cópia fica sabendo que o que ela tem " +
        "deixou de valer, e só busca o conteúdo novo se alguém pedir.</li>" +
        "<li>Transferir os <strong>dados modificados</strong> de uma cópia para a outra " +
        "entrega tudo pronto, e é possível economizar mandando o registro das alterações " +
        "em vez do conteúdo inteiro, ou juntando várias modificações numa mensagem " +
        "só.</li>" +
        "<li>Propagar a <strong>operação</strong> que causou a mudança, com os parâmetros " +
        "dela, faz cada réplica refazer o trabalho localmente. É a estratégia que a " +
        "quarta seção vai chamar de replicação ativa.</li>" +
        "</ul>" +
        "<p>Qual das três compensa depende de uma razão que reaparece o tempo todo neste " +
        "assunto, que é quantas leituras acontecem para cada escrita. Quando há muitas " +
        "escritas e poucas leituras, mandar o conteúdo é desperdício, porque uma " +
        "atualização é sobrescrita pela seguinte antes que alguém leia qualquer uma das " +
        "duas, e o aviso de invalidação sai muito mais barato. Quando há muitas leituras " +
        "para cada escrita, vale o contrário, porque é grande a chance de o conteúdo " +
        "enviado ser lido antes da próxima mudança. Propagar a operação gasta a menor " +
        "banda de todas, desde que os parâmetros sejam pequenos, e cobra processamento de " +
        "cada réplica.</p>" +

        "<h3>Empurrar, puxar e o meio-termo da concessão</h3>" +
        "<p>A segunda escolha é quem toma a iniciativa de mover a atualização. Numa " +
        "estratégia de <strong>empurrar</strong>, o servidor propaga as mudanças sem que " +
        "ninguém as peça. Ela é a escolha comum entre réplicas permanentes e réplicas " +
        "iniciadas pelo servidor, e é o que se usa quando a aplicação exige consistência " +
        "forte, porque o dado atualizado já está no lugar no instante em que alguém " +
        "pergunta.</p>" +
        "<p>Numa estratégia de <strong>puxar</strong>, quem pergunta é o outro lado. A " +
        "cache da Web faz exatamente isso quando recebe um pedido para algo que ela já " +
        "tem guardado, consultando o servidor de origem para saber se aquilo mudou desde " +
        "que foi guardado. Se mudou, o conteúdo novo é transferido e devolvido; se não " +
        "mudou, a cópia guardada serve. Um servidor de réplica de uma rede de " +
        "distribuição de conteúdo faz o mesmo papel, e nessa hora ele age como cliente do " +
        "servidor de origem.</p>" +
        "<p>As duas estratégias trocam de posição em três dimensões, e a tabela mostra as " +
        "três de uma vez, com a solução híbrida na última coluna.</p>" +
        '<div class="tabela-rolagem">' +
        '<table class="tabela-conteudo" id="tab-empurrar-puxar">' +
        "<tr><th>Dimensão</th><th>Empurrar</th><th>Puxar</th><th>Concessão</th></tr>" +
        "<tr><td>Estado guardado no servidor</td><td>Guarda a lista de todas as réplicas " +
        "e caches que têm cada dado.</td><td>Não guarda nada, porque quem lembra o que " +
        "tem é o cliente.</td><td>Guarda a lista só enquanto os prazos concedidos não " +
        "vencem.</td></tr>" +
        "<tr><td>Mensagens trocadas</td><td>Envia a atualização, e mais uma busca depois " +
        "quando o que foi enviado é só o aviso.</td><td>Envia a pergunta do cliente e a " +
        "atualização, quando houver.</td><td>Envia atualizações durante o prazo e " +
        "perguntas depois que ele vence.</td></tr>" +
        "<tr><td>Tempo de resposta no cliente</td><td>Responde na hora, porque o dado " +
        "novo já chegou antes de alguém pedir.</td><td>Responde depois de perguntar ao " +
        "servidor e buscar o que mudou.</td><td>Responde na hora dentro do prazo e paga a " +
        "busca fora dele.</td></tr>" +
        "</table>" +
        "</div>" +
        "<p>A tabela deixa ver que o preço de empurrar é o servidor virar guardião de " +
        "estado. Um servidor Web popular precisaria acompanhar dezenas de milhares de " +
        "caches, propagar cada mudança para todas elas e ainda receber aviso de cada " +
        "cliente que apagou uma página por falta de espaço. Servidor com estado é menos " +
        "tolerante a falhas e mais caro de operar, e essa é a razão prática pela qual a " +
        "solução pura raramente aparece.</p>" +
        "<p>Daí nasce o meio-termo. Uma <strong>concessão</strong> é a promessa que o " +
        "servidor faz de empurrar as atualizações de um dado durante um prazo " +
        "determinado. Enquanto o prazo vale, o sistema se comporta como empurrar. Quando " +
        "ele vence, o cliente volta a perguntar, e pode pedir uma concessão nova. É um " +
        "botão que desliza entre as duas estratégias sem trocar de mecanismo.</p>" +
        "<p>O prazo não precisa ser o mesmo para todo mundo, e três critérios diferentes " +
        "servem para calculá-lo. O primeiro olha a <strong>idade</strong> do dado, na " +
        "hipótese de que o que não muda há muito tempo tende a continuar sem mudar, e por " +
        "isso concede prazos longos a dados antigos. O segundo olha a <strong>frequência " +
        "de renovação</strong> de cada cliente, e dá prazo longo a quem consulta muito, " +
        "de modo que o servidor acaba acompanhando só quem de fato usa aquele dado. O " +
        "terceiro olha para dentro, e encurta os prazos novos quando o servidor percebe " +
        "que está ficando sobrecarregado, o que o faz derivar sozinho para um modo com " +
        "menos estado.</p>" +
        "<p>Falta uma escolha menor e que economiza bastante. Ao propagar uma atualização " +
        "para vários servidores, é possível mandar uma mensagem para cada um ou usar o " +
        "multicast que o tópico 04 apresentou. Quando todas as réplicas estão na mesma " +
        "rede local, com difusão em hardware disponível, alcançar todas custa o mesmo que " +
        "alcançar uma, e mandar mensagens separadas seria desperdício. O multicast " +
        "combina naturalmente com empurrar, e puxar quase sempre envolve um interessado " +
        "só, que é quem perguntou.</p>" +

        "<h3>A armadilha da invocação replicada</h3>" +
        "<p>Há um efeito colateral da replicação que não aparece em nenhuma das escolhas " +
        "acima e estraga tudo em silêncio. Ele surge quando um objeto replicado chama " +
        "outro objeto replicado.</p>" +
        '<figure class="figura" id="fig-invocacao-replicada">' +
        '<svg viewBox="0 0 600 250" role="img" aria-labelledby="fig-invocacao-replicada-titulo">' +
        '<title id="fig-invocacao-replicada-titulo">Dois painéis lado a lado. No painel ' +
        "da esquerda, sem coordenação, o objeto A chama o objeto B replicado, e do B " +
        "replicado saem três setas para o objeto C replicado, indicando que C foi chamado " +
        "três vezes. No painel da direita, com coordenador, sai apenas uma seta de B para " +
        "C, e duas linhas pontilhadas interrompidas indicam que as outras réplicas " +
        "seguraram a cópia do pedido.</title>" +
        '<text x="150" y="28" text-anchor="middle" font-size="12">Sem coordenação</text>' +
        '<rect class="caixa" x="18" y="96" width="46" height="36" rx="8"/>' +
        '<text x="41" y="119" text-anchor="middle" font-size="12">A</text>' +
        '<path class="traco" d="M64 114 L80 114"/>' +
        '<path class="seta" d="M80 108 L80 120 L92 114 Z"/>' +
        '<rect class="caixa" x="94" y="86" width="80" height="56" rx="8"/>' +
        '<text x="134" y="110" text-anchor="middle" font-size="12">B</text>' +
        '<text class="rotulo-secundario" x="134" y="128" text-anchor="middle" ' +
        'font-size="11">três réplicas</text>' +
        '<path class="traco" d="M174 96 L196 96"/>' +
        '<path class="seta" d="M196 90 L196 102 L208 96 Z"/>' +
        '<path class="traco" d="M174 114 L196 114"/>' +
        '<path class="seta" d="M196 108 L196 120 L208 114 Z"/>' +
        '<path class="traco" d="M174 132 L196 132"/>' +
        '<path class="seta" d="M196 126 L196 138 L208 132 Z"/>' +
        '<rect class="caixa" x="210" y="86" width="72" height="56" rx="8"/>' +
        '<text x="246" y="110" text-anchor="middle" font-size="12">C</text>' +
        '<text class="rotulo-secundario" x="246" y="128" text-anchor="middle" ' +
        'font-size="11">três réplicas</text>' +
        '<text class="rotulo-secundario" x="150" y="182" text-anchor="middle" ' +
        'font-size="11">C executa a transferência três vezes</text>' +
        '<path class="traco" d="M300 40 L300 210"/>' +
        '<text x="450" y="28" text-anchor="middle" font-size="12">Com coordenador</text>' +
        '<rect class="caixa" x="318" y="96" width="46" height="36" rx="8"/>' +
        '<text x="341" y="119" text-anchor="middle" font-size="12">A</text>' +
        '<path class="traco" d="M364 114 L380 114"/>' +
        '<path class="seta" d="M380 108 L380 120 L392 114 Z"/>' +
        '<rect class="caixa" x="394" y="86" width="80" height="56" rx="8"/>' +
        '<text x="434" y="110" text-anchor="middle" font-size="12">B</text>' +
        '<text class="rotulo-secundario" x="434" y="128" text-anchor="middle" ' +
        'font-size="11">uma coordena</text>' +
        '<path class="traco" stroke-dasharray="4 4" d="M474 96 L492 96"/>' +
        '<path class="traco" d="M492 90 L492 102"/>' +
        '<path class="traco" d="M474 114 L496 114"/>' +
        '<path class="seta" d="M496 108 L496 120 L508 114 Z"/>' +
        '<path class="traco" stroke-dasharray="4 4" d="M474 132 L492 132"/>' +
        '<path class="traco" d="M492 126 L492 138"/>' +
        '<rect class="caixa-destaque" x="510" y="86" width="72" height="56" rx="8"/>' +
        '<text x="546" y="110" text-anchor="middle" font-size="12">C</text>' +
        '<text class="rotulo-secundario" x="546" y="128" text-anchor="middle" ' +
        'font-size="11">três réplicas</text>' +
        '<text class="rotulo-secundario" x="450" y="182" text-anchor="middle" ' +
        'font-size="11">C executa a transferência uma vez</text>' +
        "</svg>" +
        "<figcaption>Replicar um objeto replica também as chamadas que ele faz. O " +
        "coordenador existe para que só um pedido atravesse a fronteira, e o mesmo " +
        "arranjo devolve uma resposta só no caminho de volta.</figcaption>" +
        "</figure>" +
        "<p>Suponha que o objeto A chame o objeto B, e que B chame o objeto C. Se B for " +
        "replicado, cada réplica de B chamará C por conta própria, e C será executado " +
        "várias vezes onde deveria ter sido executado uma. Quando o método chamado em C " +
        "transfere cem mil reais, alguém vai reclamar, mais cedo ou mais tarde.</p>" +
        "<p>Não há muita solução de propósito geral para isso. Uma delas é proibir a " +
        "construção, o que faz sentido quando o desempenho está em jogo. A outra é " +
        "acrescentar uma camada de comunicação que conheça a replicação. Cada réplica de " +
        "B atribui ao pedido o mesmo identificador exclusivo, e então uma delas, no papel " +
        "de coordenadora, encaminha o pedido às réplicas de C enquanto as demais seguram " +
        "a cópia que produziram. O caminho de volta usa o mesmo truque, com uma " +
        "coordenadora entre as réplicas de C repassando a resposta e as outras segurando " +
        "as delas.</p>",
      slides: [
        {
          title: "Duas perguntas de colocação, não uma",
          html:
            "<ul>" +
            "<li>Onde instalar os <strong>servidores</strong> é decisão de " +
            "infraestrutura</li>" +
            "<li>Qual <strong>conteúdo</strong> guardar em cada um é decisão de " +
            "operação</li>" +
            "<li>Escolher os <em>K</em> melhores lugares entre <em>N</em> só se resolve " +
            "por heurística</li>" +
            "<li>Otimizar sobre medida imprecisa produz resposta que parece exata e não é</li>" +
            "</ul>"
        },
        {
          title: "Os três anéis da replicação",
          ref: "fig-tres-aneis",
          html:
            "<ul>" +
            "<li><strong>Permanentes</strong>: poucas, estáticas, o espelho e o " +
            "agrupamento</li>" +
            "<li><strong>Iniciadas pelo servidor</strong>: criadas sob demanda pelo dono " +
            "do dado</li>" +
            "<li><strong>Iniciadas pelo cliente</strong>: as caches</li>" +
            "</ul>"
        },
        {
          title: "O que viaja quando o dado muda",
          html:
            "<ul>" +
            "<li>O <strong>aviso</strong> de invalidação gasta quase nada de banda</li>" +
            "<li>Os <strong>dados</strong> chegam prontos e custam a transferência</li>" +
            "<li>A <strong>operação</strong> gasta menos e cobra processamento em cada " +
            "réplica</li>" +
            "<li>Quem decide é a razão entre leituras e escritas</li>" +
            "</ul>"
        },
        {
          title: "Empurrar, puxar e a concessão",
          ref: "tab-empurrar-puxar"
        },
        {
          title: "O prazo da concessão não é único",
          html:
            "<ul>" +
            "<li>Por <strong>idade</strong>, dando prazo longo ao que não muda há " +
            "tempos</li>" +
            "<li>Por <strong>frequência de renovação</strong>, favorecendo quem consulta " +
            "muito</li>" +
            "<li>Por <strong>sobrecarga</strong>, encurtando prazos quando o servidor " +
            "aperta</li>" +
            "<li>Empurrar combina com multicast; puxar tem um interessado só</li>" +
            "</ul>"
        },
        {
          title: "Objeto replicado replica as chamadas dele",
          ref: "fig-invocacao-replicada",
          html:
            "<ul>" +
            "<li>Cada réplica de B chama C por conta própria</li>" +
            "<li>O coordenador deixa passar um pedido só, e uma resposta só</li>" +
            "</ul>"
        }
      ]
    },

    {
      title: "O modelo de sistema e o papel da comunicação em grupo",
      html:
        "<p>As duas seções anteriores falaram de cópias sem dizer quem as guarda, quem " +
        "executa operações sobre elas e quem conversa com o cliente. Sem esses nomes, " +
        "comparar um sistema replicado com outro vira conversa vaga. Esta seção monta o " +
        "vocabulário que as quatro seções seguintes usam, e apresenta a ferramenta que " +
        "quase todos os sistemas fortes usam por baixo.</p>" +

        "<h3>Objeto, réplica, gerenciador e front-end</h3>" +
        "<p>Os dados do sistema são um conjunto de itens que chamamos de " +
        "<strong>objetos</strong>, e um objeto pode ser um arquivo, uma conta bancária ou " +
        "uma agenda. Cada objeto lógico é realizado por um conjunto de cópias físicas, as " +
        "<strong>réplicas</strong>, cada uma guardada num computador. Repare na palavra " +
        "lógico. O aluno que espera encontrar réplicas idênticas a cada instante vai se " +
        "decepcionar, porque algumas terão recebido atualizações que outras ainda não " +
        "receberam, e isso é normal em vez de ser defeito.</p>" +
        "<p>Quem contém as réplicas num computador e executa operações diretamente sobre " +
        "elas é o <strong>gerenciador de réplica</strong>. Num ambiente cliente e " +
        "servidor ele é simplesmente o servidor, e nada impede que ele seja um processo " +
        "de aplicação, como o programa de agenda no computador do usuário que está no " +
        "trem. Duas exigências recaem sobre ele.</p>" +
        "<ul>" +
        "<li>Ele aplica operações de forma <strong>recuperável</strong>, de modo que " +
        "falhar no meio de uma operação não deixe a réplica num estado sem sentido.</li>" +
        "<li>Muitas vezes ele precisa ser uma <strong>máquina de estados</strong>, o que " +
        "quer dizer que aplica cada operação de forma atômica e que o estado resultante é " +
        "função apenas do estado inicial e da sequência de operações aplicadas.</li>" +
        "</ul>" +
        "<p>A segunda exigência é mais forte do que parece. Ela proíbe que o resultado " +
        "dependa de qualquer coisa fora daquela sequência, como a leitura de um relógio " +
        "ou de um sensor. Sem isso, gerenciadores que aceitam atualizações de forma " +
        "independente jamais convergiriam, porque o sistema consegue controlar quais " +
        "operações cada um aplica e em que ordem, e não consegue reproduzir efeito não " +
        "determinístico. Uma consequência incômoda vem de brinde, porque um servidor que " +
        "atende requisições em várias threads deixa de ser máquina de estados, já que a " +
        "ordem de execução passa a depender do escalonador.</p>" +
        "<p>Do outro lado da conversa está o <strong>front-end</strong>, que recebe a " +
        "requisição do cliente e troca mensagens com um ou mais gerenciadores em vez de " +
        "obrigar o cliente a fazer isso sozinho. Ele é o componente que torna a " +
        "replicação transparente, e pode viver dentro do espaço de endereçamento do " +
        "cliente ou ser um processo separado.</p>" +
        '<figure class="figura" id="fig-modelo-replicacao">' +
        '<svg viewBox="0 0 600 288" role="img" aria-labelledby="fig-modelo-titulo">' +
        '<title id="fig-modelo-titulo">Da esquerda para a direita, dois clientes, dois ' +
        "front-ends e, dentro de uma moldura pontilhada que representa o serviço, três " +
        "gerenciadores de réplica, cada um contendo uma réplica destacada. Setas ligam " +
        "cada cliente ao seu front-end. Do primeiro front-end saem duas setas, uma para o " +
        "primeiro gerenciador e outra que desce e alcança o segundo. Do segundo front-end " +
        "sai uma seta para o terceiro gerenciador.</title>" +
        '<rect class="caixa" x="12" y="40" width="76" height="38" rx="8"/>' +
        '<text x="50" y="64" text-anchor="middle" font-size="12">Cliente</text>' +
        '<rect class="caixa" x="12" y="192" width="76" height="38" rx="8"/>' +
        '<text x="50" y="216" text-anchor="middle" font-size="12">Cliente</text>' +
        '<path class="traco" d="M88 59 L104 59"/>' +
        '<path class="seta" d="M104 53 L104 65 L116 59 Z"/>' +
        '<path class="traco" d="M88 211 L104 211"/>' +
        '<path class="seta" d="M104 205 L104 217 L116 211 Z"/>' +
        '<rect class="caixa" x="118" y="40" width="94" height="38" rx="8"/>' +
        '<text x="165" y="64" text-anchor="middle" font-size="12">Front-end</text>' +
        '<rect class="caixa" x="118" y="192" width="94" height="38" rx="8"/>' +
        '<text x="165" y="216" text-anchor="middle" font-size="12">Front-end</text>' +
        '<rect class="traco" stroke-dasharray="6 5" x="250" y="18" width="320" ' +
        'height="232" rx="12"/>' +
        '<path class="traco" d="M212 59 L254 59"/>' +
        '<path class="seta" d="M254 53 L254 65 L266 59 Z"/>' +
        '<path class="traco" d="M212 70 L232 70 L232 138 L254 138"/>' +
        '<path class="seta" d="M254 132 L254 144 L266 138 Z"/>' +
        '<path class="traco" d="M212 211 L254 211"/>' +
        '<path class="seta" d="M254 205 L254 217 L266 211 Z"/>' +
        '<rect class="caixa" x="268" y="34" width="176" height="52" rx="8"/>' +
        '<text x="356" y="53" text-anchor="middle" font-size="11">Gerenciador de réplica</text>' +
        '<rect class="caixa-destaque" x="300" y="58" width="112" height="22" rx="6"/>' +
        '<text x="356" y="74" text-anchor="middle" font-size="11">réplica</text>' +
        '<rect class="caixa" x="268" y="112" width="176" height="52" rx="8"/>' +
        '<text x="356" y="131" text-anchor="middle" font-size="11">Gerenciador de réplica</text>' +
        '<rect class="caixa-destaque" x="300" y="136" width="112" height="22" rx="6"/>' +
        '<text x="356" y="152" text-anchor="middle" font-size="11">réplica</text>' +
        '<rect class="caixa" x="268" y="190" width="176" height="52" rx="8"/>' +
        '<text x="356" y="209" text-anchor="middle" font-size="11">Gerenciador de réplica</text>' +
        '<rect class="caixa-destaque" x="300" y="214" width="112" height="22" rx="6"/>' +
        '<text x="356" y="230" text-anchor="middle" font-size="11">réplica</text>' +
        '<text class="rotulo-secundario" x="507" y="140" text-anchor="middle" ' +
        'font-size="11">um objeto lógico só</text>' +
        '<text class="rotulo-secundario" x="410" y="272" text-anchor="middle" ' +
        'font-size="11">o serviço, como o cliente nunca o enxerga</text>' +
        "</svg>" +
        "<figcaption>O cliente pede uma coisa e recebe um conjunto único de valores. " +
        "Tudo o que está dentro da moldura pontilhada existe para que ele não precise " +
        "saber quantas cópias responderam.</figcaption>" +
        "</figure>" +
        "<p>O conjunto de gerenciadores pode ser fixo ou variar durante a execução. Num " +
        "arranjo dinâmico, gerenciadores entram, como quando uma segunda secretária copia " +
        "a agenda para o computador dela, e saem quando falham. Guardar essa lista " +
        "atualizada é um problema por si só, e a última parte desta seção trata dele.</p>" +

        "<h3>As cinco fases de uma requisição</h3>" +
        "<p>Atender uma requisição sobre dados replicados passa por até cinco fases. " +
        "Elas não são um algoritmo, e sim uma grade de comparação, porque cada sistema " +
        "faz escolhas diferentes dentro de cada fase e às vezes até troca a ordem " +
        "delas.</p>" +
        '<figure class="figura" id="fig-cinco-fases">' +
        '<svg viewBox="0 0 600 168" role="img" aria-labelledby="fig-fases-titulo">' +
        '<title id="fig-fases-titulo">Cinco caixas em linha, ligadas por setas, na ' +
        "ordem requisição, coordenação, execução, acordo e resposta. A caixa da " +
        "coordenação está destacada, e uma linha desce dela até a observação de que é " +
        "nessa fase que os sistemas diferem entre si.</title>" +
        '<rect class="caixa" x="10" y="40" width="100" height="44" rx="8"/>' +
        '<text x="60" y="67" text-anchor="middle" font-size="11">Requisição</text>' +
        '<path class="traco" d="M110 62 L120 62"/>' +
        '<path class="seta" d="M120 56 L120 68 L130 62 Z"/>' +
        '<rect class="caixa-destaque" x="132" y="40" width="100" height="44" rx="8"/>' +
        '<text x="182" y="67" text-anchor="middle" font-size="11">Coordenação</text>' +
        '<path class="traco" d="M232 62 L242 62"/>' +
        '<path class="seta" d="M242 56 L242 68 L252 62 Z"/>' +
        '<rect class="caixa" x="254" y="40" width="100" height="44" rx="8"/>' +
        '<text x="304" y="67" text-anchor="middle" font-size="11">Execução</text>' +
        '<path class="traco" d="M354 62 L364 62"/>' +
        '<path class="seta" d="M364 56 L364 68 L374 62 Z"/>' +
        '<rect class="caixa" x="376" y="40" width="100" height="44" rx="8"/>' +
        '<text x="426" y="67" text-anchor="middle" font-size="11">Acordo</text>' +
        '<path class="traco" d="M476 62 L486 62"/>' +
        '<path class="seta" d="M486 56 L486 68 L496 62 Z"/>' +
        '<rect class="caixa" x="498" y="40" width="92" height="44" rx="8"/>' +
        '<text x="544" y="67" text-anchor="middle" font-size="11">Resposta</text>' +
        '<path class="traco" d="M182 84 L182 112"/>' +
        '<text class="rotulo-secundario" x="182" y="132" text-anchor="middle" ' +
        'font-size="11">é aqui que um sistema difere do outro</text>' +
        "</svg>" +
        "<figcaption>A grade das cinco fases serve para comparar sistemas. A fase de " +
        "coordenação é a que decide se a requisição será aplicada e em que ordem, e é " +
        "nela que mora quase toda a diferença entre os arranjos das próximas " +
        "seções.</figcaption>" +
        "</figure>" +
        "<p>Na <strong>requisição</strong>, o front-end emite o pedido, e já aqui há uma " +
        "bifurcação. Ele pode falar com um gerenciador só, que depois conversa com os " +
        "outros, ou enviar o pedido por multicast a todos de uma vez. Na " +
        "<strong>coordenação</strong>, os gerenciadores se preparam para executar de " +
        "forma consistente, decidindo se a requisição deve mesmo ser aplicada e em que " +
        "ordem ela entra em relação às demais. Na <strong>execução</strong>, cada um " +
        "aplica a operação, às vezes por tentativa, de um jeito que permita desfazê-la " +
        "depois.</p>" +
        "<p>No <strong>acordo</strong>, os gerenciadores chegam a consenso sobre o efeito " +
        "que será confirmado, e num sistema transacional é aqui que eles decidem " +
        "coletivamente por confirmar ou cancelar. Na <strong>resposta</strong>, um ou " +
        "mais deles respondem ao front-end. Quando responde mais de um, o front-end " +
        "escolhe o que fazer com o conjunto, e a escolha revela o objetivo do sistema. " +
        "Repassar a primeira resposta que chegar serve à alta disponibilidade, e esperar " +
        "para repassar a resposta que a maioria deu serve à tolerância a falhas " +
        "bizantinas.</p>" +

        "<h3>Antes da ordem, a relação acontece antes</h3>" +
        "<p>A fase de coordenação decide uma ordem, e discutir ordem em sistema " +
        "distribuído exige uma peça que a trilha ainda não montou. O tópico 02 anotou de " +
        "passagem que eventos podem ser ordenados logicamente, sem relógio comum. Vale " +
        "abrir essa ideia agora, porque as três garantias de ordenação e a arquitetura da " +
        "quinta seção se apoiam nela.</p>" +
        "<p>Lamport partiu de duas observações que ninguém contesta. Dois eventos que " +
        "acontecem no mesmo processo ocorreram na ordem em que aquele processo os " +
        "observou. E o envio de uma mensagem ocorreu antes da recepção dela. Encadeando " +
        "essas duas regras por transitividade, obtém-se a relação <strong>acontece " +
        "antes</strong>, que ordena parcialmente os eventos do sistema.</p>" +
        "<p>Ela é parcial, e isso é o ponto. Dois eventos em processos diferentes, sem " +
        "nenhuma corrente de mensagens ligando um ao outro, não são ordenados por ela, e " +
        "dizemos que são <strong>concorrentes</strong>. Vale também uma ressalva que " +
        "evita mal-entendido. A relação captura causalidade em potencial, não causalidade " +
        "real, porque um processo pode receber uma mensagem e enviar outra logo depois " +
        "sem que a segunda tenha qualquer coisa a ver com a primeira.</p>" +
        "<p>Para carregar essa ordem dentro do sistema, Lamport propôs o <strong>relógio " +
        "lógico</strong>, que é um contador de software sem relação nenhuma com o tempo " +
        "do relógio de parede. Cada processo incrementa o seu antes de cada evento e " +
        "envia o valor de carona nas mensagens; quem recebe adota o maior entre o valor " +
        "recebido e o próprio, e incrementa. O resultado tem uma limitação conhecida. Se " +
        "um evento acontece antes de outro, o carimbo do primeiro é menor, mas o inverso " +
        "não vale, porque carimbo menor não prova nada sobre a ordem.</p>" +
        "<p>O <strong>carimbo de tempo vetorial</strong> conserta isso trocando o contador " +
        "único por um vetor com uma posição para cada processo. Comparar dois vetores é " +
        "comparar todas as posições, e um vetor é menor que o outro quando não é maior em " +
        "posição nenhuma e é menor em pelo menos uma. Com isso a equivalência passa a " +
        "valer nos dois sentidos, de modo que comparar os vetores diz se um evento " +
        "aconteceu antes do outro ou se os dois foram concorrentes. O preço é o tamanho, " +
        "porque o vetor cresce com o número de processos e viaja em toda mensagem.</p>" +
        "<p>Com isso no lugar, as três garantias de ordenação que a fase de coordenação " +
        "pode oferecer ficam fáceis de enunciar. A <strong>ordem de primeiro a entrar e " +
        "primeiro a sair</strong>, conhecida pela sigla FIFO, exige que, se um front-end " +
        "emitiu duas requisições, elas sejam processadas nessa mesma " +
        "sequência. A <strong>ordem causal</strong> exige que, se a emissão de uma " +
        "requisição aconteceu antes da emissão de outra, a primeira seja processada " +
        "primeiro. A <strong>ordem total</strong> exige que todos os gerenciadores " +
        "corretos processem as requisições na mesma sequência, seja ela qual for. Quanto " +
        "mais forte a garantia, mais conversa a coordenação custa, e é bom saber que a " +
        "maioria das aplicações se contenta com a FIFO.</p>" +

        "<h3>Grupos, modos de visualização e o problema de quem está dentro</h3>" +
        "<p>A ferramenta que quase todos os arranjos fortes usam por baixo é a " +
        "comunicação em grupo, que o tópico 04 apresentou como multicast. Falta a peça " +
        "que a replicação exige e que a apresentação anterior não tinha, que é a " +
        "participação dinâmica. Processos entram e saem enquanto o sistema roda, e alguém " +
        "precisa manter essa lista.</p>" +
        "<p>Um serviço completo de participação mantém <strong>modos de " +
        "visualização</strong> do grupo, que são listas dos membros correntes. Um modo " +
        "novo é gerado toda vez que um processo é acrescentado ou excluído. O detalhe " +
        "desconfortável é que a exclusão acontece por suspeita, e não por certeza. Uma " +
        "falha de comunicação basta para tornar um processo inalcançável enquanto ele " +
        "continua funcionando perfeitamente, e o serviço tem toda liberdade de excluí-lo " +
        "assim mesmo.</p>" +
        "<p>Suspeitar de quem está vivo custa caro, porque o grupo perde a confiabilidade " +
        "ou o desempenho que aquele membro entregava. O desafio de projeto tem duas " +
        "partes, então. A primeira é construir detectores de falha tão precisos quanto " +
        "possível, e a segunda, mais importante, é garantir que o sistema não passe a se " +
        "comportar de forma incorreta quando a suspeita for falsa.</p>" +
        "<p>Quando a rede se parte, os serviços de participação se dividem em duas " +
        "famílias. O de <strong>particionamento primário</strong> deixa no máximo um " +
        "subgrupo sobreviver, normalmente o que tem maioria, e manda os demais suspender " +
        "as operações. Ele serve quando o custo de duas partes divergirem supera qualquer " +
        "vantagem de continuar trabalhando. O <strong>particionável</strong> deixa vários " +
        "subgrupos seguirem em frente, o que é aceitável numa videoconferência em que os " +
        "grupos separados discutem e depois reúnem o que produziram.</p>" +
        "<p>A entrega de um modo de visualização obedece a três requisitos. A " +
        "<strong>ordem</strong> garante que dois processos nunca entreguem dois modos em " +
        "sequências opostas. A <strong>integridade</strong> garante que um processo " +
        "sempre pertence ao modo que ele próprio entrega. A <strong>não " +
        "trivialidade</strong> impede a solução preguiçosa de informar a todo processo " +
        "que ele está sozinho, exigindo que dois processos que se comunicam apareçam um " +
        "no modo do outro, e que um particionamento duradouro se reflita nos modos " +
        "entregues de cada lado.</p>" +

        "<h3>O modo de visualização síncrono traça uma linha</h3>" +
        "<p>Os três requisitos acima ordenam as trocas de modo entre si e não dizem nada " +
        "sobre as mensagens comuns que atravessam essas trocas. É justamente aí que mora " +
        "o problema difícil. A <strong>comunicação em grupo com modo de visualização " +
        "síncrono</strong> acrescenta garantias que amarram as duas coisas.</p>" +
        "<p>A garantia de <strong>acordo</strong> diz que os processos corretos entregam " +
        "a mesma sequência de modos e o mesmo conjunto de mensagens dentro de cada modo, " +
        "de forma que uma mensagem entregue num modo por um processo correto é entregue " +
        "naquele mesmo modo por todos os outros que a entregarem. A de " +
        "<strong>integridade</strong> impede entrega dobrada da mesma mensagem. A de " +
        "<strong>validade</strong> fecha o cerco, porque se o sistema deixar de entregar " +
        "uma mensagem a algum processo, ele avisa os sobreviventes entregando um modo " +
        "novo com aquele processo de fora.</p>" +
        "<p>Um exemplo pequeno mostra o efeito. Um grupo tem os processos p, q e r; p " +
        "envia uma mensagem e falha logo em seguida, enquanto q e r continuam corretos.</p>" +
        '<figure class="figura" id="fig-visualizacao-sincrona">' +
        '<svg viewBox="0 0 600 236" role="img" aria-labelledby="fig-visao-titulo">' +
        '<title id="fig-visao-titulo">Dois painéis com três linhas de tempo cada, uma ' +
        "para o processo p, uma para q e uma para r. No painel da esquerda, rotulado como " +
        "permitido, a mensagem m sai de p e é entregue em q e r antes de o novo modo de " +
        "visualização, sem p, ser entregue nos dois. No painel da direita, rotulado como " +
        "proibido, o novo modo é entregue primeiro e a mensagem m chega depois, vinda de " +
        "um processo que já havia sido dado como falho.</title>" +
        '<text x="148" y="26" text-anchor="middle" font-size="12">Permitido</text>' +
        '<text class="rotulo-secundario" x="16" y="64" font-size="11">p</text>' +
        '<text class="rotulo-secundario" x="16" y="110" font-size="11">q</text>' +
        '<text class="rotulo-secundario" x="16" y="156" font-size="11">r</text>' +
        '<path class="traco" d="M32 60 L168 60"/>' +
        '<path class="traco" d="M32 106 L282 106"/>' +
        '<path class="traco" d="M32 152 L282 152"/>' +
        '<path class="traco" d="M160 52 L176 68"/>' +
        '<path class="traco" d="M176 52 L160 68"/>' +
        '<path class="traco" d="M84 60 L84 152"/>' +
        '<path class="seta" d="M78 96 L90 96 L84 106 Z"/>' +
        '<path class="seta" d="M78 142 L90 142 L84 152 Z"/>' +
        '<text class="rotulo-secundario" x="70" y="84" font-size="11">m</text>' +
        '<path class="traco" stroke-dasharray="4 4" d="M212 96 L212 162"/>' +
        '<circle class="seta" cx="212" cy="106" r="4"/>' +
        '<circle class="seta" cx="212" cy="152" r="4"/>' +
        '<text class="rotulo-secundario" x="212" y="182" text-anchor="middle" ' +
        'font-size="11">modo (q, r)</text>' +
        '<text class="rotulo-secundario" x="148" y="212" text-anchor="middle" ' +
        'font-size="11">m entra antes da linha, e os dois a entregam</text>' +
        '<path class="traco" d="M300 40 L300 200"/>' +
        '<text x="452" y="26" text-anchor="middle" font-size="12">Proibido</text>' +
        '<text class="rotulo-secundario" x="318" y="64" font-size="11">p</text>' +
        '<text class="rotulo-secundario" x="318" y="110" font-size="11">q</text>' +
        '<text class="rotulo-secundario" x="318" y="156" font-size="11">r</text>' +
        '<path class="traco" d="M334 60 L428 60"/>' +
        '<path class="traco" d="M334 106 L584 106"/>' +
        '<path class="traco" d="M334 152 L584 152"/>' +
        '<path class="traco" d="M420 52 L436 68"/>' +
        '<path class="traco" d="M436 52 L420 68"/>' +
        '<path class="traco" d="M356 60 L356 76 L524 76 L524 152"/>' +
        '<path class="seta" d="M518 96 L530 96 L524 106 Z"/>' +
        '<path class="seta" d="M518 142 L530 142 L524 152 Z"/>' +
        '<text class="rotulo-secundario" x="346" y="74" text-anchor="end" ' +
        'font-size="11">m</text>' +
        '<path class="traco" stroke-dasharray="4 4" d="M470 96 L470 162"/>' +
        '<circle class="seta" cx="470" cy="106" r="4"/>' +
        '<circle class="seta" cx="470" cy="152" r="4"/>' +
        '<text class="rotulo-secundario" x="470" y="182" text-anchor="middle" ' +
        'font-size="11">modo (q, r)</text>' +
        '<text class="rotulo-secundario" x="452" y="212" text-anchor="middle" ' +
        'font-size="11">m chega depois, vinda de quem já foi dado como falho</text>' +
        "</svg>" +
        "<figcaption>O novo modo de visualização traça uma linha imaginária no tempo, e " +
        "toda mensagem cai de forma consistente de um lado ou do outro dela. É essa " +
        "propriedade que permite decidir localmente o que fazer diante de uma mudança de " +
        "participação.</figcaption>" +
        "</figure>" +
        "<p>Dois desfechos são permitidos e olham parecidos. Se a mensagem não chegou a " +
        "ninguém antes de p falhar, q e r entregam apenas o modo novo. Se ela chegou a " +
        "pelo menos um dos dois, os dois entregam a mensagem e só depois o modo novo. O " +
        "que a figura proíbe é o terceiro caso, em que o modo novo é entregue primeiro e " +
        "a mensagem depois, porque aí um processo estaria entregando mensagem de alguém " +
        "sobre quem já foi informado que falhou. Também é proibido que q e r entreguem as " +
        "duas coisas em ordens opostas.</p>" +
        "<p>Essa linha imaginária tem uso prático imediato na transferência de estado. " +
        "Quando um gerenciador novo entra no grupo, ele precisa receber o estado corrente " +
        "sem perder atualizações e sem reaplicar as que já estão embutidas no que " +
        "recebeu. Com modo de visualização síncrono, o esquema é simples. Na entrega do " +
        "primeiro modo que contém o processo novo, um dos membros antigos captura o " +
        "estado, envia ao recém-chegado e suspende a execução, junto com todos os demais. " +
        "O conjunto de atualizações refletido naquele estado é, por definição, o mesmo " +
        "que todos aplicaram, e quando o novo integra o que recebeu e avisa o grupo, " +
        "todos voltam a andar.</p>" +
        "<p>Falta dizer o que esse serviço de participação custa. Manter a lista de " +
        "membros coerente entre todos é um problema de acordo, e resolver acordo num " +
        "sistema assíncrono esbarra num resultado de impossibilidade estabelecido por " +
        "Fischer e colegas em 1985. A saída usada na prática é o detector de falha, que " +
        "contorna o resultado ao custo de errar de vez em quando, o que fecha o círculo " +
        "com a suspeita falsa discutida acima. Esse assunto tem tópico próprio na " +
        "disciplina, e aqui basta reter que a ferramenta não é de graça.</p>",
      slides: [
        {
          title: "O vocabulário do dado replicado",
          html:
            "<ul>" +
            "<li><strong>Objeto</strong> lógico realizado por várias " +
            "<strong>réplicas</strong> físicas</li>" +
            "<li>O <strong>gerenciador de réplica</strong> executa operações sobre " +
            "elas</li>" +
            "<li>O <strong>front-end</strong> é quem torna a replicação transparente</li>" +
            "<li>Réplicas não são idênticas a cada instante, e isso é normal</li>" +
            "</ul>"
        },
        {
          title: "Máquina de estados, e o preço dela",
          html:
            "<ul>" +
            "<li>Aplica operações de forma atômica e determinística</li>" +
            "<li>O estado é função do inicial mais a <strong>sequência</strong> de " +
            "operações</li>" +
            "<li>Nada de relógio nem de sensor decidindo o resultado</li>" +
            "<li>Consequência: servidor com várias threads deixa de sê-la</li>" +
            "</ul>"
        },
        {
          title: "O modelo de gerenciamento",
          ref: "fig-modelo-replicacao",
          html:
            "<ul>" +
            "<li>O cliente enxerga um objeto e recebe um conjunto único de valores</li>" +
            "<li>O front-end fala com um ou com vários gerenciadores</li>" +
            "</ul>"
        },
        {
          title: "As cinco fases de uma requisição",
          ref: "fig-cinco-fases",
          html:
            "<ul>" +
            "<li>A coordenação decide <em>se</em> aplica e em que <strong>ordem</strong></li>" +
            "<li>Quem responde primeiro busca disponibilidade; quem espera a maioria " +
            "busca correção</li>" +
            "</ul>"
        },
        {
          title: "Acontece antes, e as três ordens",
          html:
            "<ul>" +
            "<li>Ordem local mais envio antes da recepção, encadeados, dão " +
            "<strong>acontece antes</strong></li>" +
            "<li>O relógio lógico numera; o <strong>carimbo vetorial</strong> também " +
            "detecta concorrência</li>" +
            "<li><strong>FIFO</strong> por front-end, <strong>causal</strong> pela " +
            "relação, <strong>total</strong> para todos</li>" +
            "<li>A maioria das aplicações se contenta com FIFO</li>" +
            "</ul>"
        },
        {
          title: "Participação dinâmica e suspeita",
          html:
            "<ul>" +
            "<li>O <strong>modo de visualização</strong> é a lista de membros correntes</li>" +
            "<li>Exclui-se por <strong>suspeita</strong>, e a suspeita erra</li>" +
            "<li><strong>Particionamento primário</strong> deixa um subgrupo seguir; o " +
            "<strong>particionável</strong> deixa vários</li>" +
            "<li>Entrega de modo obedece a ordem, integridade e não trivialidade</li>" +
            "</ul>"
        },
        {
          title: "A linha que o modo síncrono traça",
          ref: "fig-visualizacao-sincrona",
          html:
            "<ul>" +
            "<li>Toda mensagem cai consistentemente de um lado ou do outro da linha</li>" +
            "<li>É o que torna a transferência de estado simples</li>" +
            "</ul>"
        }
      ]
    },

    {
      title: "Serviços tolerantes a falhas, quando todas as cópias concordam antes",
      html:
        "<p>Com o vocabulário montado, dá para atacar a pergunta do tópico num extremo. " +
        "Aqui todas as cópias corretas combinam o que vão fazer antes de o cliente " +
        "receber qualquer resposta, e o objetivo é que ele não perceba diferença nenhuma " +
        "quando até <em>f</em> processos falham. Antes de comparar os dois arranjos que " +
        "conseguem isso, é preciso dizer com precisão o que significa estar correto.</p>" +

        "<h3>A anomalia que um servidor único jamais produziria</h3>" +
        "<p>A intuição é simples de enunciar. Um serviço replicado é correto se continua " +
        "respondendo apesar das falhas e se o cliente não consegue distingui-lo de um " +
        "único servidor correto. O difícil é satisfazer esse critério, porque a " +
        "replicação ingênua produz resultados que nenhum servidor sozinho produziria.</p>" +
        "<p>Acompanhe um caso pequeno. Dois gerenciadores, nos computadores A e B, " +
        "guardam réplicas de duas contas bancárias chamadas x e y, ambas começando com " +
        "saldo zero. Cada cliente lê e atualiza no gerenciador local e recorre ao outro " +
        "quando o local falha, e os gerenciadores propagam as atualizações entre si em " +
        "segundo plano, depois de já terem respondido.</p>" +
        '<figure class="figura" id="fig-anomalia">' +
        '<svg viewBox="0 0 600 262" role="img" aria-labelledby="fig-anomalia-titulo">' +
        '<title id="fig-anomalia-titulo">Duas linhas de tempo horizontais, uma para o ' +
        "gerenciador B em cima e outra para o gerenciador A embaixo. Na linha de B, o " +
        "cliente 1 grava x igual a 1 e logo depois B falha, marcado por um xis. Na linha " +
        "de A, o cliente 1 grava y igual a 2, e em seguida o cliente 2 lê y e vê 2 e lê x " +
        "e vê 0. A última leitura está destacada, porque é o resultado impossível num " +
        "servidor único.</title>" +
        '<text class="rotulo-secundario" x="12" y="94" font-size="11">Gerenciador B</text>' +
        '<text class="rotulo-secundario" x="12" y="184" font-size="11">Gerenciador A</text>' +
        '<path class="traco" d="M104 90 L268 90"/>' +
        '<path class="traco" d="M104 180 L580 180"/>' +
        '<path class="traco" d="M160 82 L160 98"/>' +
        '<text class="rotulo-secundario" x="160" y="44" text-anchor="middle" ' +
        'font-size="11">cliente 1</text>' +
        '<text x="160" y="66" text-anchor="middle" font-size="12">grava x igual a 1</text>' +
        '<path class="traco" d="M252 82 L268 98"/>' +
        '<path class="traco" d="M268 82 L252 98"/>' +
        '<text x="272" y="66" font-size="12">B falha</text>' +
        '<path class="traco" d="M330 172 L330 188"/>' +
        '<path class="traco" d="M430 172 L430 188"/>' +
        '<path class="traco" d="M524 172 L524 188"/>' +
        '<text x="330" y="212" text-anchor="middle" font-size="12">grava y igual a 2</text>' +
        '<text class="rotulo-secundario" x="330" y="234" text-anchor="middle" ' +
        'font-size="11">cliente 1</text>' +
        '<text x="430" y="212" text-anchor="middle" font-size="12">lê y e vê 2</text>' +
        '<rect class="caixa-destaque" x="474" y="196" width="100" height="24" rx="6"/>' +
        '<text x="524" y="213" text-anchor="middle" font-size="12">lê x e vê 0</text>' +
        '<text class="rotulo-secundario" x="477" y="234" text-anchor="middle" ' +
        'font-size="11">cliente 2</text>' +
        "</svg>" +
        "<figcaption>O cliente 2 vê o saldo novo de y e o saldo velho de x, embora x " +
        "tenha sido atualizado antes. Nenhuma auditoria aceitaria essa sequência, e " +
        "nenhum servidor único a produziria.</figcaption>" +
        "</figure>" +
        "<p>Repare no que a figura tem de perturbador. Se y foi atualizado depois de x, " +
        "quem enxerga o y novo tinha obrigação de enxergar o x novo, e não há nenhuma " +
        "ordem de execução num servidor só que explique o contrário. A escrita de x " +
        "simplesmente não chegou a A, porque B caiu antes de propagá-la. Para construir " +
        "sistemas que não fazem isso, é preciso primeiro definir o que se está tentando " +
        "garantir.</p>" +

        "<h3>Linearização e consistência sequencial</h3>" +
        "<p>Os dois critérios que interessam se apoiam na mesma ideia. Imagine que " +
        "alguém escrevesse, depois do fato, uma sequência única com todas as operações de " +
        "todos os clientes intercaladas, como se elas tivessem passado por um servidor " +
        "só. Essa sequência imaginária é chamada de <strong>interposição</strong>, e ela " +
        "não precisa ter acontecido em gerenciador nenhum, porque serve apenas para " +
        "julgar se a execução foi aceitável.</p>" +
        "<p>Um serviço replicado tem <strong>capacidade de linearização</strong> quando, " +
        "para qualquer execução, existe uma interposição que cumpre duas condições. A " +
        "primeira é satisfazer a especificação de uma cópia única e correta dos objetos. " +
        "A segunda é respeitar os tempos reais em que as operações de fato ocorreram.</p>" +
        "<p>A execução da figura reprova já na primeira condição. Não existe nenhuma " +
        "intercalação daquelas quatro operações que satisfaça uma especificação sensata " +
        "de conta bancária, e por isso ela nem chega a ser testada contra o tempo real. " +
        "Vale notar de passagem que a linearização trata de operações isoladas, e não de " +
        "transações. Uma execução linearizável ainda pode violar noções de consistência " +
        "próprias da aplicação se não houver controle de concorrência por cima.</p>" +
        "<p>A segunda condição é o problema. Falar em tempo real supõe relógios " +
        "sincronizados com precisão suficiente, e o tópico já lembrou que essa precisão " +
        "não está disponível. Daí nasce um critério mais fraco e realizável, a " +
        "<strong>consistência sequencial</strong>, que mantém a primeira condição e troca " +
        "a segunda por outra. A ordem da interposição precisa respeitar a ordem do " +
        "programa de cada cliente, tomado isoladamente.</p>" +
        "<p>A imagem que fixa a diferença é a do baralho. Consistência sequencial permite " +
        "embaralhar vários maços de cartas de qualquer jeito, contanto que a ordem " +
        "interna de cada maço seja preservada. Nenhuma ordem global sobre todas as " +
        "operações é exigida, e o tempo absoluto não aparece na definição.</p>" +
        "<p>A relação entre os dois critérios é de inclusão. Todo serviço linearizável é " +
        "sequencialmente consistente, porque a ordem do tempo real já reflete a ordem do " +
        "programa de cada cliente. O contrário é falso, e um exemplo mostra por quê. Se o " +
        "cliente 1 grava x em B e depois y em A, enquanto o cliente 2 lê zero para os " +
        "dois em A, o critério de tempo real não é cumprido, porque a leitura de x " +
        "aconteceu depois da escrita. Ainda assim existe uma interposição válida, com as " +
        "duas leituras vindo antes das duas escritas, e a execução é sequencialmente " +
        "consistente.</p>" +

        "<h3>Replicação passiva, um pensa e os outros copiam</h3>" +
        "<p>O primeiro arranjo concentra a decisão. Existe, a cada momento, um " +
        "gerenciador <strong>primário</strong> e um ou mais <strong>backups</strong>, e " +
        "os front-ends só falam com o primário. Ele trata cada requisição na ordem em que " +
        "a recebe, executa, envia o estado atualizado aos backups e responde.</p>" +
        "<p>As cinco fases ganham conteúdo específico. Na requisição, o front-end anexa um " +
        "identificador exclusivo. Na coordenação, o primário confere esse identificador " +
        "para ver se já executou aquilo, e, se já, apenas reenvia a resposta guardada. Na " +
        "execução, ele aplica a operação e guarda o resultado. No acordo, manda aos " +
        "backups o estado atualizado, a resposta e o identificador, e espera a " +
        "confirmação deles. Na resposta, devolve ao front-end.</p>" +
        "<p>Enquanto o primário estiver de pé, o sistema é linearizável, e a razão é " +
        "direta. Ele é quem coloca em sequência todas as operações sobre os objetos " +
        "compartilhados, então existe sempre uma ordem única, que é a dele. A pergunta " +
        "interessante é o que acontece quando ele cai.</p>" +
        "<p>A troca preserva a linearização se duas condições valerem. O primário " +
        "precisa ser substituído por um backup só, porque dois clientes usando dois " +
        "substitutos diferentes quebrariam o serviço na hora. E os gerenciadores " +
        "sobreviventes precisam concordar sobre quais operações já tinham sido executadas " +
        "no ponto em que o substituto assume.</p>" +
        "<p>É aqui que a ferramenta da seção anterior paga o investimento. Se os " +
        "gerenciadores estiverem organizados como grupo e o primário usar comunicação com " +
        "modo de visualização síncrono para enviar as atualizações, as duas condições " +
        "saem de graça. Quando o primário falha, o sistema entrega aos sobreviventes um " +
        "modo novo sem ele, e qualquer função desse modo escolhe o substituto, como pegar " +
        "o primeiro da lista. E a semântica do modo síncrono garante que todos os backups " +
        "receberam cada atualização, ou que nenhum recebeu, antes da troca, de modo que " +
        "eles concordam sobre o que foi processado.</p>" +
        "<p>O front-end que não recebeu resposta simplesmente retransmite ao novo " +
        "primário. Isso funciona sem que ninguém precise saber em que ponto o antigo " +
        "morreu, porque o substituto retoma a partir da fase de coordenação e o " +
        "identificador exclusivo revela se aquilo já foi feito.</p>" +
        "<p>Duas propriedades desse arranjo costumam surpreender. A primeira é que o " +
        "primário <em>pode</em> ser não determinístico, e portanto pode atender em várias " +
        "threads, porque o que viaja aos backups é o estado resultante e não a operação " +
        "que o produziu. A segunda é o limite de tolerância, porque bastam <strong>f + " +
        "1</strong> gerenciadores para atravessar <em>f</em> colapsos, e nenhum número de " +
        "réplicas neste arranjo protege contra um primário que responde valores " +
        "inventados.</p>" +
        "<p>O preço aparece no tempo. A comunicação com modo síncrono exige várias rodadas " +
        "de multicast por requisição, e a queda do primário acrescenta a espera enquanto " +
        "o grupo concorda sobre o modo novo e o distribui. Há ainda uma variação comum, " +
        "em que os clientes mandam leituras aos backups para aliviar o primário. Ela " +
        "aumenta a vazão e rebaixa a garantia, porque o serviço deixa de ser linearizável " +
        "e passa a oferecer consistência sequencial. O sistema de arquivos Harp usa " +
        "replicação passiva, e o serviço de informação de rede da Sun também, com " +
        "garantias ainda mais fracas que bastam para guardar registros de administração " +
        "do sistema.</p>" +

        "<h3>Replicação ativa, todos pensam a mesma coisa</h3>" +
        "<p>O segundo arranjo distribui a decisão. Os gerenciadores são máquinas de " +
        "estado com papéis equivalentes, organizados como grupo, e o front-end envia cada " +
        "requisição por multicast a todos eles. Cada um processa de forma independente e " +
        "responde.</p>" +
        "<p>O multicast usado aqui não é qualquer um. Ele precisa ser confiável e " +
        "<strong>totalmente ordenado</strong>, e é essa exigência que faz o arranjo " +
        "funcionar. Como todos recebem as mesmas requisições na mesma ordem, e como todos " +
        "são máquinas de estado, todos chegam ao mesmo resultado sem trocar uma única " +
        "mensagem entre si. A fase de acordo desaparece, porque a semântica do multicast " +
        "já a executou.</p>" +
        "<p>A garantia obtida é a consistência sequencial. A confiabilidade do multicast " +
        "assegura que os gerenciadores corretos processam o mesmo conjunto de " +
        "requisições, a ordem total assegura que processam na mesma sequência, e as " +
        "requisições de cada front-end são atendidas em ordem de emissão, porque ele " +
        "espera a resposta antes de mandar a próxima. Essa última parte é exatamente a " +
        "ordem do programa que a definição pede.</p>" +
        "<p>O que não se obtém é a linearização, e a razão é sutil. A ordem total em que " +
        "os gerenciadores processam não coincide necessariamente com a ordem temporal em " +
        "que os clientes emitiram os pedidos, porque nada no protocolo consulta relógio " +
        "algum. Num sistema síncrono com relógios aproximadamente sincronizados é " +
        "possível derivar a ordem total dos carimbos de tempo físicos anexados pelos " +
        "front-ends, o que chega perto sem alcançar, já que esses carimbos não são " +
        "perfeitamente precisos.</p>" +
        "<p>Há uma condição escondida na frase acima sobre a ordem do programa. Ela vale " +
        "enquanto os clientes não conversam entre si enquanto esperam. Se eles trocam " +
        "mensagens diretamente enquanto aguardam respostas, a ordem do programa deixa de " +
        "capturar tudo o que aconteceu antes, e seria preciso trocar o multicast por um " +
        "que fosse causal e total ao mesmo tempo.</p>" +
        '<figure class="figura" id="fig-passiva-ativa">' +
        '<svg viewBox="0 0 600 240" role="img" aria-labelledby="fig-passiva-ativa-titulo">' +
        '<title id="fig-passiva-ativa-titulo">Dois painéis. No da esquerda, replicação ' +
        "passiva, o front-end aponta para um único gerenciador primário destacado, e dele " +
        "saem duas setas para dois backups. No da direita, replicação ativa, o front-end " +
        "aponta ao mesmo tempo para três gerenciadores equivalentes, e nenhuma seta liga " +
        "os gerenciadores entre si.</title>" +
        '<text x="150" y="26" text-anchor="middle" font-size="12">Replicação passiva</text>' +
        '<rect class="caixa" x="14" y="102" width="72" height="34" rx="8"/>' +
        '<text x="50" y="123" text-anchor="middle" font-size="10">Front-end</text>' +
        '<path class="traco" d="M86 119 L100 119"/>' +
        '<path class="seta" d="M100 113 L100 125 L112 119 Z"/>' +
        '<rect class="caixa-destaque" x="114" y="102" width="84" height="34" rx="8"/>' +
        '<text x="156" y="123" text-anchor="middle" font-size="11">Primário</text>' +
        '<path class="traco" d="M198 110 L207 110 L207 71"/>' +
        '<path class="seta" d="M201 71 L213 71 L207 60 Z"/>' +
        '<path class="traco" d="M198 128 L207 128 L207 167"/>' +
        '<path class="seta" d="M201 167 L213 167 L207 178 Z"/>' +
        '<rect class="caixa" x="216" y="34" width="72" height="30" rx="8"/>' +
        '<text x="252" y="54" text-anchor="middle" font-size="11">Backup</text>' +
        '<rect class="caixa" x="216" y="174" width="72" height="30" rx="8"/>' +
        '<text x="252" y="194" text-anchor="middle" font-size="11">Backup</text>' +
        '<text class="rotulo-secundario" x="150" y="226" text-anchor="middle" ' +
        'font-size="11">um ordena tudo, e envia o estado pronto</text>' +
        '<path class="traco" d="M300 40 L300 210"/>' +
        '<text x="452" y="26" text-anchor="middle" font-size="12">Replicação ativa</text>' +
        '<rect class="caixa" x="314" y="102" width="72" height="34" rx="8"/>' +
        '<text x="350" y="123" text-anchor="middle" font-size="10">Front-end</text>' +
        '<path class="traco" d="M386 112 L410 112 L410 56 L420 56"/>' +
        '<path class="seta" d="M420 50 L420 62 L432 56 Z"/>' +
        '<path class="traco" d="M386 119 L420 119"/>' +
        '<path class="seta" d="M420 113 L420 125 L432 119 Z"/>' +
        '<path class="traco" d="M386 126 L410 126 L410 182 L420 182"/>' +
        '<path class="seta" d="M420 176 L420 188 L432 182 Z"/>' +
        '<rect class="caixa" x="434" y="40" width="92" height="32" rx="8"/>' +
        '<text x="480" y="60" text-anchor="middle" font-size="10">Gerenciador</text>' +
        '<rect class="caixa" x="434" y="103" width="92" height="32" rx="8"/>' +
        '<text x="480" y="123" text-anchor="middle" font-size="10">Gerenciador</text>' +
        '<rect class="caixa" x="434" y="166" width="92" height="32" rx="8"/>' +
        '<text x="480" y="186" text-anchor="middle" font-size="10">Gerenciador</text>' +
        '<text class="rotulo-secundario" x="452" y="226" text-anchor="middle" ' +
        'font-size="11">multicast totalmente ordenado, e nada mais</text>' +
        "</svg>" +
        "<figcaption>À esquerda, a ordem nasce dentro do primário e o estado desce " +
        "pronto. À direita, a ordem nasce fora dos gerenciadores, no multicast, e por " +
        "isso eles não precisam conversar entre si depois.</figcaption>" +
        "</figure>" +
        "<p>A tolerância a falhas do arranjo ativo é mais ambiciosa. Para atravessar " +
        "<em>f</em> colapsos bastam <strong>f + 1</strong> gerenciadores, como na " +
        "passiva. Para mascarar <em>f</em> gerenciadores que respondem qualquer coisa " +
        "são necessários <strong>2f + 1</strong>, e o front-end espera reunir <strong>f + " +
        "1</strong> respostas idênticas antes de repassar uma ao cliente. Para que ele " +
        "consiga associar cada resposta ao pedido certo diante de comportamento " +
        "malicioso, os gerenciadores acrescentam assinatura digital às respostas, " +
        "conforme o tópico 07 explicou.</p>" +
        "<p>Tudo isso repousa sobre uma suposição que ainda não foi paga. Resolver " +
        "multicast confiável e totalmente ordenado é equivalente a resolver o consenso, e " +
        "resolver consenso exige um sistema síncrono ou, num sistema assíncrono, o uso de " +
        "detectores de falha para contornar o resultado de impossibilidade de Fischer e " +
        "colegas. Quer dizer que a fase de acordo não desapareceu de verdade. Ela foi " +
        "empurrada para dentro do multicast, onde continua custando o que sempre custou.</p>" +
        "<p>Duas flexibilizações reduzem esse custo sem mudar a garantia. A primeira " +
        "explora operações comutativas, porque duas leituras de clientes diferentes, ou " +
        "duas escritas em objetos distintos, dão o mesmo resultado em qualquer ordem, e " +
        "ordená-las é trabalho jogado fora. A segunda manda requisições somente de " +
        "leitura a um gerenciador só, o que abre mão da tolerância que o multicast dava " +
        "àquela requisição específica e mantém a consistência sequencial do serviço.</p>" +
        "<p>A tabela resume os dois arranjos nas cinco dimensões que separam um do " +
        "outro.</p>" +
        '<div class="tabela-rolagem">' +
        '<table class="tabela-conteudo" id="tab-passiva-ativa">' +
        "<tr><th>Dimensão</th><th>Replicação passiva</th><th>Replicação ativa</th></tr>" +
        "<tr><td>Quem decide a ordem</td><td>O primário decide sozinho, na sequência em " +
        "que as requisições chegam a ele.</td><td>O multicast decide, e todos os " +
        "gerenciadores recebem a mesma sequência.</td></tr>" +
        "<tr><td>O que viaja entre os gerenciadores</td><td>Viaja o estado já atualizado, " +
        "com a resposta e o identificador.</td><td>Não viaja nada entre eles, porque cada " +
        "um recebeu a requisição original.</td></tr>" +
        "<tr><td>Garantia obtida</td><td>Alcança linearização enquanto as leituras também " +
        "passarem pelo primário.</td><td>Alcança consistência sequencial, e não " +
        "linearização, porque a ordem total ignora o tempo real.</td></tr>" +
        "<tr><td>Réplicas necessárias</td><td>Usa f + 1 para f colapsos, e não protege " +
        "contra resposta inventada.</td><td>Usa f + 1 para f colapsos e 2f + 1 para " +
        "mascarar f respostas inventadas.</td></tr>" +
        "<tr><td>O que acontece quando um cai</td><td>O serviço para até o grupo " +
        "promover um backup e distribuir o modo novo.</td><td>O serviço nem pisca, porque " +
        "os demais continuam respondendo.</td></tr>" +
        "</table>" +
        "</div>" +
        "<p>A última linha é a que costuma decidir na prática. A replicação passiva " +
        "entrega a garantia mais forte e cobra uma pausa a cada queda do primário, " +
        "enquanto a ativa esconde a falha sem pausa nenhuma e cobra o multicast ordenado " +
        "em toda requisição, inclusive nas que nunca vão encontrar falha alguma.</p>" +
        '<div class="callout">' +
        '<p class="callout-title">💡 A resposta desta seção à pergunta do tópico</p>' +
        "<p>Quantas cópias precisam concordar antes de responder? Nos dois arranjos desta " +
        "seção, todas as corretas. Elas concordam de formas diferentes, uma pela " +
        "autoridade do primário e outra pela ordem que o multicast impõe, e em ambos os " +
        "casos o cliente espera a coordenação terminar. É por isso que estes sistemas " +
        "entregam correção rigorosa e é também por isso que eles ficam indisponíveis " +
        "quando a coordenação não consegue acontecer, como durante um particionamento da " +
        "rede. A próxima seção pergunta o que acontece ao afrouxar exatamente esse " +
        "ponto.</p>" +
        "</div>",
      slides: [
        {
          title: "A anomalia que define o problema",
          ref: "fig-anomalia",
          html:
            "<ul>" +
            "<li>Correto é o cliente não distinguir o serviço de um servidor único</li>" +
            "<li>Ver o y novo e o x velho não tem explicação em cópia única</li>" +
            "</ul>"
        },
        {
          title: "Linearização e consistência sequencial",
          html:
            "<ul>" +
            "<li>As duas pedem uma <strong>interposição</strong> que satisfaça a cópia " +
            "única</li>" +
            "<li>A linearização exige respeitar o <strong>tempo real</strong>, e cobra " +
            "relógios</li>" +
            "<li>A sequencial exige respeitar a <strong>ordem do programa</strong> de " +
            "cada cliente</li>" +
            "<li>Embaralhar maços preservando a ordem interna de cada um</li>" +
            "<li>Toda execução linearizável é sequencial, e não o contrário</li>" +
            "</ul>"
        },
        {
          title: "Passiva, um pensa e os outros copiam",
          html:
            "<ul>" +
            "<li>O primário ordena, executa, manda o <strong>estado</strong> e responde</li>" +
            "<li>O modo de visualização síncrono garante a troca segura de primário</li>" +
            "<li>O primário pode ser não determinístico, porque envia estado</li>" +
            "<li>Usa <strong>f + 1</strong> réplicas e não enfrenta resposta inventada</li>" +
            "</ul>"
        },
        {
          title: "Ativa, todos pensam a mesma coisa",
          html:
            "<ul>" +
            "<li>Multicast <strong>confiável e totalmente ordenado</strong> ao grupo</li>" +
            "<li>A fase de acordo some, porque o multicast já a fez</li>" +
            "<li><strong>2f + 1</strong> réplicas e <strong>f + 1</strong> respostas " +
            "idênticas mascaram resposta inventada</li>" +
            "<li>O custo não sumiu, foi para dentro do multicast, que é consenso</li>" +
            "</ul>"
        },
        {
          title: "Os dois arranjos lado a lado",
          ref: "fig-passiva-ativa",
          html:
            "<ul>" +
            "<li>Na passiva a ordem nasce dentro do primário</li>" +
            "<li>Na ativa ela nasce fora, no multicast</li>" +
            "</ul>"
        },
        {
          title: "Passiva contra ativa, ponto a ponto",
          ref: "tab-passiva-ativa"
        }
      ]
    },

    {
      title: "Alta disponibilidade, quando uma cópia responde e as outras alcançam depois",
      html:
        "<p>Os sistemas da seção anterior propagam atualizações de forma ávida. Todos os " +
        "gerenciadores corretos recebem a novidade assim que possível e chegam a um " +
        "acordo coletivo antes de devolver o controle ao cliente. Para quem quer " +
        "disponibilidade, esse comportamento é exatamente o errado, porque o cliente fica " +
        "parado enquanto a coordenação acontece.</p>" +
        "<p>A troca desta seção inverte a prioridade. O sistema entrega um nível de " +
        "serviço aceitável usando o conjunto mínimo de gerenciadores que o cliente " +
        "consegue alcançar, e propaga o resto de forma preguiçosa, quando der. O " +
        "princípio geral por trás disso vale a pena guardar, porque ele reaparece em todo " +
        "sistema moderno. Graus mais fracos de consistência exigem menos acordo, e menos " +
        "acordo deixa o dado disponível com mais facilidade.</p>" +
        "<p>Três sistemas percorrem esse espaço de escolhas por caminhos diferentes. Um " +
        "deles preserva a ordem causal e não deixa o cliente andar para trás no tempo. " +
        "Outro deixa que atualizações conflitantes aconteçam e resolve o choque com " +
        "conhecimento da aplicação. O terceiro deixa o choque acontecer e chama o usuário " +
        "para resolvê-lo.</p>" +

        "<h3>Gossip, a fofoca com carimbos vetoriais</h3>" +
        "<p>Na arquitetura <strong>Gossip</strong>, cujo nome vem da fofoca que os " +
        "gerenciadores trocam entre si, o front-end envia cada operação ao gerenciador " +
        "que quiser, normalmente o mais próximo ou o mais rápido. Periodicamente os " +
        "gerenciadores trocam mensagens de fofoca contendo as atualizações que receberam " +
        "dos clientes, e é assim que a novidade se espalha.</p>" +
        '<figure class="figura" id="fig-gossip">' +
        '<svg viewBox="0 0 600 268" role="img" aria-labelledby="fig-gossip-titulo">' +
        '<title id="fig-gossip-titulo">Dois clientes à esquerda, cada um com o seu ' +
        "front-end, e três gerenciadores de réplica empilhados à direita. Uma seta liga o " +
        "primeiro front-end ao primeiro gerenciador e outra liga o segundo front-end ao " +
        "terceiro gerenciador. À direita dos gerenciadores, linhas os ligam entre si, " +
        "rotuladas como fofoca periódica.</title>" +
        '<rect class="caixa" x="12" y="54" width="78" height="36" rx="8"/>' +
        '<text x="51" y="77" text-anchor="middle" font-size="12">Cliente</text>' +
        '<rect class="caixa" x="12" y="176" width="78" height="36" rx="8"/>' +
        '<text x="51" y="199" text-anchor="middle" font-size="12">Cliente</text>' +
        '<path class="traco" d="M90 72 L98 72"/>' +
        '<path class="seta" d="M98 66 L98 78 L108 72 Z"/>' +
        '<path class="traco" d="M90 194 L98 194"/>' +
        '<path class="seta" d="M98 188 L98 200 L108 194 Z"/>' +
        '<rect class="caixa" x="108" y="54" width="94" height="36" rx="8"/>' +
        '<text x="155" y="77" text-anchor="middle" font-size="11">Front-end</text>' +
        '<rect class="caixa" x="108" y="176" width="94" height="36" rx="8"/>' +
        '<text x="155" y="199" text-anchor="middle" font-size="11">Front-end</text>' +
        '<path class="traco" d="M202 72 L248 72 L248 46 L284 46"/>' +
        '<path class="seta" d="M284 40 L284 52 L296 46 Z"/>' +
        '<path class="traco" d="M202 194 L248 194 L248 206 L284 206"/>' +
        '<path class="seta" d="M284 200 L284 212 L296 206 Z"/>' +
        '<rect class="caixa" x="296" y="26" width="140" height="40" rx="8"/>' +
        '<text x="366" y="51" text-anchor="middle" font-size="11">Gerenciador</text>' +
        '<rect class="caixa" x="296" y="106" width="140" height="40" rx="8"/>' +
        '<text x="366" y="131" text-anchor="middle" font-size="11">Gerenciador</text>' +
        '<rect class="caixa" x="296" y="186" width="140" height="40" rx="8"/>' +
        '<text x="366" y="211" text-anchor="middle" font-size="11">Gerenciador</text>' +
        '<path class="traco" d="M436 46 L478 46 L478 206 L436 206"/>' +
        '<path class="traco" d="M478 126 L442 126"/>' +
        '<text class="rotulo-secundario" x="492" y="130" font-size="11">fofoca periódica</text>' +
        '<text class="rotulo-secundario" x="155" y="246" text-anchor="middle" ' +
        'font-size="11">o front-end fala com o gerenciador que estiver disponível</text>' +
        "</svg>" +
        "<figcaption>Nenhuma seta liga um front-end a todos os gerenciadores ao mesmo " +
        "tempo. A responsabilidade de espalhar a novidade sai do caminho da requisição e " +
        "vai para as linhas da direita, que funcionam no tempo delas.</figcaption>" +
        "</figure>" +
        "<p>Esse arranjo faz duas promessas ao aluno que talvez pareçam contraditórias " +
        "com o desenho. A primeira é que <strong>cada cliente obtém um serviço " +
        "consistente ao longo do tempo</strong>, ou seja, uma consulta nunca devolve algo " +
        "anterior às atualizações que aquele cliente já viu, mesmo que ele tenha trocado " +
        "de gerenciador no meio do caminho. A segunda é a <strong>consistência relaxada " +
        "entre réplicas</strong>, que garante apenas que todos acabam recebendo todas as " +
        "atualizações. Dois clientes podem observar réplicas diferentes, e um cliente " +
        "pode observar dado velho.</p>" +
        "<p>O truque que sustenta a primeira promessa é o carimbo de tempo vetorial " +
        "apresentado na seção anterior. Cada front-end guarda um vetor que representa a " +
        "versão mais recente que ele já viu, e o envia em toda requisição. O gerenciador " +
        "que recebe a consulta só a executa quando o carimbo do próprio valor for pelo " +
        "menos tão recente quanto o que veio junto do pedido, e enquanto não for, deixa a " +
        "consulta numa fila de espera. Ele pode aguardar a fofoca chegar ou pedir a " +
        "atualização que falta diretamente a quem a tem.</p>" +
        "<p>Vale seguir um exemplo pequeno para ver o mecanismo trabalhar. Com três " +
        "gerenciadores numerados de zero a dois, um carimbo de valor igual a dois, cinco " +
        "e cinco significa que aquele valor reflete as duas primeiras atualizações " +
        "aceitas pelo gerenciador zero, as cinco primeiras do um e as cinco primeiras do " +
        "dois. Se chega uma consulta trazendo dois, quatro e seis, dá para ver de " +
        "imediato que falta uma atualização do gerenciador dois, e que o front-end que " +
        "mandou a consulta esteve conversando com outro gerenciador antes.</p>" +
        "<p>A mesma comparação decide quando uma atualização pode ser aplicada. Diz-se " +
        "que ela está <strong>estável</strong> quando tudo de que ela depende, isto é, " +
        "tudo o que o front-end tinha visto quando a emitiu, já foi aplicado ao valor " +
        "local. Enquanto não estiver, a atualização espera no registro de operações do " +
        "gerenciador, e a condição é reavaliada a cada mensagem de fofoca que chega.</p>" +
        "<p>Esse registro é uma das cinco peças de estado que um gerenciador Gossip " +
        "mantém, e cada uma responde a uma pergunta diferente. O <strong>valor</strong> é " +
        "o estado da aplicação, e o <strong>carimbo do valor</strong> diz quais " +
        "atualizações estão embutidas nele. O <strong>registro de atualizações</strong> " +
        "guarda tudo o que chegou, tanto o que ainda não está estável quanto o que já foi " +
        "aplicado e ainda precisa ser repassado adiante. O <strong>carimbo da " +
        "réplica</strong> diz o que o gerenciador aceitou, e não apenas o que ele já " +
        "aplicou. Por fim, duas tabelas evitam trabalho repetido, uma listando as " +
        "operações já executadas, para que a mesma atualização não seja aplicada duas " +
        "vezes quando chegar por dois caminhos, e outra guardando os carimbos dos demais " +
        "gerenciadores, que serve para descobrir quando um registro já pode ser " +
        "descartado.</p>" +
        "<p>A ordenação padrão desse arranjo é a causal, porque é a mais barata. Quando a " +
        "aplicação precisa de mais, há duas garantias mais fortes. A ordenação " +
        "<strong>forçada</strong> é total e causal ao mesmo tempo, obtida por um " +
        "sequenciador que numera as atualizações, com o cuidado de deixar que outro " +
        "gerenciador assuma o papel se o sequenciador cair, desde que uma maioria tenha " +
        "registrado qual atualização vem em seguida. A ordenação <strong>imediata</strong> " +
        "é mais forte ainda, e ordena a atualização em relação a todas as outras, sejam " +
        "elas causais, forçadas ou imediatas.</p>" +
        "<p>Uma lista de discussão eletrônica mostra as três em uso ao mesmo tempo. " +
        "Publicar uma mensagem pede apenas ordenação causal, e o efeito visível é que as " +
        "publicações podem aparecer em ordens diferentes em lugares diferentes, com a " +
        "única garantia de que uma resposta nunca precede a mensagem que ela responde. " +
        "Inscrever alguém na lista pede ordenação forçada, para que exista um registro " +
        "inequívoco da ordem de entrada. Remover alguém pede ordenação imediata, para que " +
        "essa pessoa não consiga recuperar mensagens novas por meio de um gerenciador " +
        "atrasado depois de a remoção ter retornado.</p>" +
        "<p>Falta dizer quando a fofoca acontece, e a arquitetura deliberadamente não " +
        "responde. Três fatores determinam quanto tempo uma atualização leva para " +
        "alcançar todo mundo, e apenas dois estão sob controle do projetista. O primeiro " +
        "é a frequência e a duração dos particionamentos, que ninguém escolhe. O segundo " +
        "é a frequência com que os gerenciadores conversam, que se ajusta à aplicação. O " +
        "terceiro é a política de escolha do parceiro de conversa.</p>" +
        "<p>As políticas de escolha se dividem em três famílias com defeitos opostos. A " +
        "aleatória sorteia um parceiro, com pesos que favorecem os mais próximos, e " +
        "funciona surpreendentemente bem em simulação, além de resistir bem a falhas. A " +
        "determinista usa uma função do estado local, como escolher o gerenciador que " +
        "parece mais atrasado. A topológica organiza os gerenciadores num grafo fixo, " +
        "como uma malha ou um anel, e o anel é o caso extremo, com pouquíssimo tráfego, " +
        "latência alta de propagação e a desagradável propriedade de parar de funcionar " +
        "quando um único membro cai.</p>" +
        "<p>O sistema tem um limite de escala conhecido. À medida que o número de " +
        "gerenciadores cresce, crescem tanto o volume de fofoca quanto o tamanho dos " +
        "carimbos, que têm uma posição por gerenciador. Uma atualização causal custa " +
        "cerca de duas mensagens entre front-end e gerenciador mais a fração da mensagem " +
        "de fofoca que cabe a ela, e juntar mais atualizações por mensagem melhora a " +
        "contagem ao preço de atrasar a propagação. A saída conhecida é tornar a maioria " +
        "das réplicas somente de leitura, deixando poucas aceitarem escrita, porque assim " +
        "não há fofoca partindo delas e o vetor encolhe.</p>" +

        "<h3>Bayou, quando a aplicação sabe resolver o conflito</h3>" +
        "<p>O <strong>Bayou</strong> também troca atualizações aos pares, num protocolo " +
        "que os autores chamam de antientropia, o mesmo parentesco da disseminação " +
        "epidêmica vista no tópico 04. A diferença está no que ele faz quando duas " +
        "atualizações se chocam, porque ele aposta em detecção e solução de conflitos " +
        "específicas do domínio da aplicação.</p>" +
        "<p>O problema que motiva essa aposta aparece na agenda compartilhada. Sob " +
        "consistência estrita, uma arquitetura de fofoca marcaria compromissos por " +
        "ordenação forçada, e então só quem estivesse na partição majoritária conseguiria " +
        "marcar qualquer coisa. Repare no que isso significa. O usuário que ia marcar um " +
        "compromisso perfeitamente compatível com a agenda é tratado do mesmo jeito que " +
        "aquele que ia ocupar duas vezes o mesmo horário, embora só o segundo fosse " +
        "causar problema.</p>" +
        "<p>No Bayou, os dois marcam. Toda atualização é aplicada localmente e registrada " +
        "como <strong>de tentativa</strong>, e o choque é descoberto mais tarde, quando " +
        "dois gerenciadores trocam o que têm. Nesse momento o sistema aplica uma política " +
        "do domínio para decidir o que fazer, e pode, por exemplo, confirmar o " +
        "compromisso do executivo e desmarcar o da secretária. O ajuste em que uma ou " +
        "mais operações de um conjunto conflitante são desfeitas ou alteradas para " +
        "resolver o choque chama-se <strong>transformação operacional</strong>.</p>" +
        "<p>Para isso funcionar, cada atualização carrega duas peças escritas por quem " +
        "programou a aplicação, além da operação em si. A <strong>verificação de " +
        "dependência</strong> roda antes e responde se aplicar aquilo criaria conflito, e " +
        "pode examinar qualquer parte da base de dados. No caso da agenda ela testaria se " +
        "outro cliente ocupou o horário pedido, e poderia ir além, testando também se o " +
        "número de compromissos daquele dia já passou de seis. O <strong>procedimento de " +
        "integração</strong> roda quando a verificação acusa conflito, e altera a operação " +
        "para que ela alcance algo parecido com o efeito pretendido sem colidir, como " +
        "escolher um horário vizinho.</p>" +
        "<p>Atualizações de tentativa não ficam assim para sempre. O sistema as coloca " +
        "numa ordem canônica e as marca como <strong>confirmadas</strong>, e a partir daí " +
        "elas permanecem aplicadas naquela ordem. Na prática, a ordem confirmada é " +
        "decidida por um gerenciador designado como primário, que a define pela sequência " +
        "em que recebe as tentativas e propaga essa informação aos demais.</p>" +
        '<figure class="figura" id="fig-bayou">' +
        '<svg viewBox="0 0 600 214" role="img" aria-labelledby="fig-bayou-titulo">' +
        '<title id="fig-bayou-titulo">Duas fileiras de caixas. Na fileira de cima, ' +
        "quatro atualizações confirmadas à esquerda e cinco de tentativa à direita, com " +
        "uma delas destacada. Uma seta parte da caixa destacada, desce e aponta para a " +
        "fileira de baixo, na posição imediatamente após a última confirmada. Na fileira " +
        "de baixo, a caixa destacada aparece nessa nova posição e as demais atualizações " +
        "de tentativa vêm depois dela.</title>" +
        '<text class="rotulo-secundario" x="106" y="30" text-anchor="middle" ' +
        'font-size="11">confirmadas</text>' +
        '<text class="rotulo-secundario" x="330" y="30" text-anchor="middle" ' +
        'font-size="11">de tentativa</text>' +
        '<rect class="caixa" x="14" y="42" width="44" height="30" rx="6"/>' +
        '<text x="36" y="62" text-anchor="middle" font-size="11">c1</text>' +
        '<rect class="caixa" x="62" y="42" width="44" height="30" rx="6"/>' +
        '<text x="84" y="62" text-anchor="middle" font-size="11">c2</text>' +
        '<rect class="caixa" x="110" y="42" width="44" height="30" rx="6"/>' +
        '<text x="132" y="62" text-anchor="middle" font-size="11">c3</text>' +
        '<rect class="caixa" x="158" y="42" width="44" height="30" rx="6"/>' +
        '<text x="180" y="62" text-anchor="middle" font-size="11">cN</text>' +
        '<rect class="caixa" x="212" y="42" width="44" height="30" rx="6"/>' +
        '<text x="234" y="62" text-anchor="middle" font-size="11">t1</text>' +
        '<rect class="caixa" x="260" y="42" width="44" height="30" rx="6"/>' +
        '<text x="282" y="62" text-anchor="middle" font-size="11">t2</text>' +
        '<rect class="caixa-destaque" x="308" y="42" width="44" height="30" rx="6"/>' +
        '<text x="330" y="62" text-anchor="middle" font-size="11">ti</text>' +
        '<rect class="caixa" x="356" y="42" width="44" height="30" rx="6"/>' +
        '<text x="378" y="62" text-anchor="middle" font-size="11">t3</text>' +
        '<rect class="caixa" x="404" y="42" width="44" height="30" rx="6"/>' +
        '<text x="426" y="62" text-anchor="middle" font-size="11">t4</text>' +
        '<path class="traco" d="M330 72 L330 96 L228 96 L228 124"/>' +
        '<path class="seta" d="M222 124 L234 124 L228 134 Z"/>' +
        '<text class="rotulo-secundario" x="356" y="112" font-size="11">ti é confirmada</text>' +
        '<rect class="caixa" x="14" y="136" width="44" height="30" rx="6"/>' +
        '<text x="36" y="156" text-anchor="middle" font-size="11">c1</text>' +
        '<rect class="caixa" x="62" y="136" width="44" height="30" rx="6"/>' +
        '<text x="84" y="156" text-anchor="middle" font-size="11">c2</text>' +
        '<rect class="caixa" x="110" y="136" width="44" height="30" rx="6"/>' +
        '<text x="132" y="156" text-anchor="middle" font-size="11">c3</text>' +
        '<rect class="caixa" x="158" y="136" width="44" height="30" rx="6"/>' +
        '<text x="180" y="156" text-anchor="middle" font-size="11">cN</text>' +
        '<rect class="caixa-destaque" x="206" y="136" width="44" height="30" rx="6"/>' +
        '<text x="228" y="156" text-anchor="middle" font-size="11">ti</text>' +
        '<rect class="caixa" x="254" y="136" width="44" height="30" rx="6"/>' +
        '<text x="276" y="156" text-anchor="middle" font-size="11">t1</text>' +
        '<rect class="caixa" x="302" y="136" width="44" height="30" rx="6"/>' +
        '<text x="324" y="156" text-anchor="middle" font-size="11">t2</text>' +
        '<rect class="caixa" x="350" y="136" width="44" height="30" rx="6"/>' +
        '<text x="372" y="156" text-anchor="middle" font-size="11">t3</text>' +
        '<rect class="caixa" x="398" y="136" width="44" height="30" rx="6"/>' +
        '<text x="420" y="156" text-anchor="middle" font-size="11">t4</text>' +
        '<text class="rotulo-secundario" x="228" y="196" text-anchor="middle" ' +
        'font-size="11">as de tentativa são desfeitas e reaplicadas depois dela</text>' +
        "</svg>" +
        "<figcaption>Confirmar uma atualização que estava no meio da fila obriga a " +
        "desfazer tudo o que veio depois dela e a refazer na ordem nova. É por isso que o " +
        "estado de uma réplica Bayou pode mudar debaixo de quem está olhando.</figcaption>" +
        "</figure>" +
        "<p>O resultado é uma espécie de consistência sequencial que só se alcança no " +
        "fim, e ela vem com dois custos que o desenho não mostra. O primeiro recai sobre " +
        "quem programa, porque escrever verificações de dependência e procedimentos de " +
        "integração para todos os conflitos possíveis é difícil. O segundo recai sobre o " +
        "usuário, que precisa conviver com dado ainda de tentativa e com a possibilidade " +
        "de a operação que ele pediu ter sido alterada, marcando um horário e descobrindo " +
        "depois que a marcação pulou para o horário seguinte. É por isso que o Bayou " +
        "abandona a transparência de replicação de propósito, e é por isso que ele exige " +
        "avisar claramente ao usuário o que ainda é tentativa.</p>" +

        "<h3>Coda, quando o cliente fica sozinho</h3>" +
        "<p>O <strong>Coda</strong> é descendente direto do <strong>Andrew File " +
        "System</strong>, conhecido pela sigla AFS e apresentado no tópico 08. Ele nasceu " +
        "para resolver três limitações daquele sistema sob um " +
        "objetivo único, que os autores chamam de disponibilidade constante de dados. A " +
        "replicação do AFS servia só a volumes somente de leitura, as falhas de servidor " +
        "e de rede atrapalhavam muita gente por períodos que iam de minutos a horas, e o " +
        "computador portátil estava se tornando comum sem que houvesse resposta para " +
        "ele.</p>" +
        "<p>A estrutura conhecida do AFS continua de pé, com o processo Vice nos " +
        "servidores e o Venus nos clientes. O que muda é que o Venus acumula dois papéis, " +
        "porque continua sendo o front-end que esconde o serviço dos processos locais e " +
        "passa a ser também um gerenciador de réplica, já que a cache local vira uma " +
        "réplica de pleno direito quando a rede some.</p>" +
        "<p>Dois conjuntos de servidores organizam essa história. O <strong>grupo de " +
        "armazenamento de volume</strong> reúne todos os servidores que têm réplica de um " +
        "volume, e o <strong>grupo disponível</strong> é o subconjunto que um cliente " +
        "consegue alcançar naquele instante. O segundo encolhe e cresce conforme falhas " +
        "aparecem e somem, e a operação desconectada é definida de forma direta, como o " +
        "estado em que o grupo disponível está vazio.</p>" +
        "<p>A estratégia é otimista, no mesmo espírito do Bayou. O cliente atualiza " +
        "durante a partição, na aposta de que conflitos são raros e corrigíveis depois. A " +
        "diferença é que o Coda detecta conflitos sem entender nada da semântica dos " +
        "arquivos, e oferece pouquíssima ajuda para resolvê-los.</p>" +
        "<p>A detecção usa um <strong>vetor de versão</strong> anexado a cada versão de " +
        "arquivo, com uma posição por servidor do grupo, em que cada posição estima " +
        "quantas modificações aquele servidor conhece. Quando um arquivo modificado é " +
        "fechado, o Venus manda o conteúdo novo e o vetor a todos os servidores " +
        "alcançáveis, e recalcula o vetor com os que responderam. Como a mensagem só " +
        "alcança o grupo disponível, quem estava fora não recebe nada, e é essa " +
        "assimetria que o vetor registra.</p>" +
        "<p>Um exemplo com três servidores fecha o mecanismo. Todos começam com o vetor " +
        "em um, um e um. O cliente 1 enxerga apenas os servidores 1 e 2, modifica o " +
        "arquivo e os dois passam a dois, dois e um. Ao mesmo tempo, o cliente 2 enxerga " +
        "apenas o servidor 3, modifica duas vezes, e ele fica em um, um e três. Quando a " +
        "rede se recompõe e alguém compara os vetores, nenhum dos dois é maior ou igual " +
        "ao outro em todas as posições, e isso é a definição de conflito, porque cada " +
        "réplica reflete pelo menos uma modificação que a outra não tem. Se o cliente 2 " +
        "não tivesse modificado nada, o vetor dele continuaria em um, um e um, seria " +
        "estritamente menor, e a atualização automática resolveria tudo sem incomodar " +
        "ninguém.</p>" +
        "<p>Diante de conflito de verdade, o Coda não decide. O arquivo é marcado como " +
        "inoperante, o dono é avisado, e a cópia que estava na cache vai para um lugar " +
        "temporário no servidor, num covolume que funciona como o diretório de achados e " +
        "perdidos dos sistemas Unix. Diretórios são a exceção, porque a semântica deles é " +
        "simples o bastante para resolver sozinho, já que a única coisa que se faz num " +
        "diretório é inserir ou remover entradas.</p>" +
        "<p>Trabalhar desconectado exige preparação, e é aqui que está a ideia mais " +
        "prática do sistema. Uma perda de cache durante a desconexão não é um problema de " +
        "desempenho, e sim uma parede, porque a computação simplesmente para até a " +
        "conexão voltar. Para evitá-la, o usuário mantém uma lista de prioridade dos " +
        "arquivos que o Venus deve se esforçar por manter na cache, e os do topo dessa " +
        "lista ficam lá o tempo todo. Como é difícil saber quais arquivos uma sequência " +
        "de ações realmente toca, uma ferramenta observa o usuário executando aquela " +
        "sequência e anota as referências geradas.</p>" +
        "<p>Ao voltar a ter rede, começa a reintegração, em que o Venus percorre o que " +
        "foi criado, alterado ou apagado e reaplica isso nas réplicas. Enquanto está " +
        "conectado, ele manda a cada poucos minutos uma mensagem de verificação aos " +
        "servidores dos volumes que tem em cache, e é essa mensagem que detecta " +
        "servidores que voltaram, servidores que sumiram e avisos de invalidação " +
        "perdidos. O intervalo largo é deliberado, para que essas verificações não " +
        "atrapalhem a escala do sistema.</p>" +
        "<p>O preço medido é honesto e vale citar. Sem replicação, Coda e AFS têm " +
        "desempenho praticamente igual. Com réplica tripla e carga equivalente a cinco " +
        "usuários típicos, o Coda ficou apenas 5% acima do AFS sem replicação. Com a " +
        "mesma réplica tripla e carga de cinquenta usuários, o tempo do Coda subiu 70%, " +
        "contra 16% do AFS, e parte dessa diferença vem de escolhas de implementação, não " +
        "só da replicação em si.</p>" +
        "<p>Os três sistemas resolvem o mesmo problema por caminhos que se distinguem em " +
        "três perguntas, e a tabela responde as três de uma vez.</p>" +
        '<div class="tabela-rolagem">' +
        '<table class="tabela-conteudo" id="tab-tres-sistemas">' +
        "<tr><th>Sistema</th><th>Como as réplicas se alcançam</th><th>Quem detecta e " +
        "quem resolve o conflito</th><th>O que o usuário precisa aceitar</th></tr>" +
        "<tr><td>Gossip</td><td>Troca mensagens de fofoca periódicas, com o registro de " +
        "atualizações e o carimbo da réplica.</td><td>Evita o conflito em vez de " +
        "resolvê-lo, segurando a operação até que a ordem exigida possa ser " +
        "respeitada.</td><td>Aceita ler dado velho, e aceita que dois clientes vejam " +
        "estados diferentes ao mesmo tempo.</td></tr>" +
        "<tr><td>Bayou</td><td>Troca atualizações aos pares, por antientropia, sem " +
        "topologia fixa.</td><td>Detecta pela verificação de dependência e resolve pelo " +
        "procedimento de integração, ambos escritos pela aplicação.</td><td>Aceita ver " +
        "dado de tentativa, e aceita que a operação pedida seja alterada para caber.</td></tr>" +
        "<tr><td>Coda</td><td>Propaga em paralelo aos servidores alcançáveis quando o " +
        "arquivo é fechado.</td><td>Detecta comparando vetores de versão, sem entender o " +
        "conteúdo, e devolve a resolução ao dono do arquivo.</td><td>Aceita resolver " +
        "conflito à mão, e aceita preparar a cache antes de desconectar.</td></tr>" +
        "</table>" +
        "</div>" +
        "<p>A coluna do meio mostra que as três estratégias formam uma escada de " +
        "conhecimento. O Gossip não precisa saber nada sobre os dados e paga com " +
        "espera, o Bayou sabe tudo sobre eles e paga com trabalho de programação, e o " +
        "Coda fica no meio, sabendo o suficiente para perceber o choque e não o bastante " +
        "para desfazê-lo. A próxima seção mostra um sistema comercial que oferece as duas " +
        "últimas escolhas ao mesmo tempo, deixando a decisão para quem escreve a " +
        "aplicação.</p>",
      slides: [
        {
          title: "De ávido para preguiçoso",
          html:
            "<ul>" +
            "<li>Tolerante a falhas propaga <strong>ávido</strong>, e o cliente espera o " +
            "acordo</li>" +
            "<li>Alta disponibilidade usa o mínimo de gerenciadores alcançáveis</li>" +
            "<li>Consistência mais fraca pede menos acordo e libera disponibilidade</li>" +
            "</ul>"
        },
        {
          title: "Gossip, a fofoca periódica",
          ref: "fig-gossip",
          html:
            "<ul>" +
            "<li>O front-end fala com o gerenciador que quiser</li>" +
            "<li>Espalhar a novidade sai do caminho da requisição</li>" +
            "</ul>"
        },
        {
          title: "As duas promessas do Gossip",
          html:
            "<ul>" +
            "<li>Cada cliente vê um serviço <strong>consistente ao longo do tempo</strong></li>" +
            "<li>As réplicas convergem, sem promessa de quando</li>" +
            "<li>O <strong>carimbo vetorial</strong> segura a consulta até o valor " +
            "alcançar</li>" +
            "<li>Ordem <strong>causal</strong> por padrão, com forçada e imediata " +
            "disponíveis</li>" +
            "</ul>"
        },
        {
          title: "Bayou, o conflito resolvido pela aplicação",
          ref: "fig-bayou",
          html:
            "<ul>" +
            "<li>Toda atualização entra como <strong>de tentativa</strong></li>" +
            "<li>Confirmar no meio da fila obriga a desfazer e refazer o resto</li>" +
            "</ul>"
        },
        {
          title: "As duas peças que a aplicação escreve",
          html:
            "<ul>" +
            "<li>A <strong>verificação de dependência</strong> responde se há choque</li>" +
            "<li>O <strong>procedimento de integração</strong> altera a operação para " +
            "caber</li>" +
            "<li>Chama-se <strong>transformação operacional</strong></li>" +
            "<li>O preço é a replicação deixar de ser transparente</li>" +
            "</ul>"
        },
        {
          title: "Coda, disponibilidade constante de dados",
          html:
            "<ul>" +
            "<li>Descendente do AFS, com o Venus virando também gerenciador de réplica</li>" +
            "<li>Grupo do volume contra grupo <strong>disponível</strong>, que encolhe e " +
            "cresce</li>" +
            "<li>O <strong>vetor de versão</strong> detecta o choque sem entender o " +
            "arquivo</li>" +
            "<li>Quem resolve é o dono, e a cache precisa ser abastecida antes</li>" +
            "</ul>"
        },
        {
          title: "Os três sistemas lado a lado",
          ref: "tab-tres-sistemas"
        }
      ]
    },

    {
      title: "Transações replicadas e o consenso de quórum",
      html:
        "<p>Tudo o que veio até aqui supunha clientes pedindo uma operação de cada vez. " +
        "Muitos sistemas reais não funcionam assim, porque agrupam operações em " +
        "<strong>transações</strong>, que são sequências aplicadas com garantias de " +
        "atomicidade, consistência, isolamento e durabilidade. Transferir dinheiro entre " +
        "duas contas é o exemplo de sempre, com um saque e um depósito que precisam " +
        "acontecer juntos ou não acontecer.</p>" +
        "<p>Do ponto de vista de quem usa o sistema, uma transação sobre objetos " +
        "replicados precisa ser indistinguível de uma sobre objetos comuns. Num sistema " +
        "sem réplicas, as transações parecem executar uma de cada vez, em alguma ordem. " +
        "Sobre réplicas, exige-se que o efeito seja igual ao de executá-las uma de cada " +
        "vez sobre um conjunto único de objetos, propriedade chamada de <strong>capacidade " +
        "de serialização de uma cópia</strong>.</p>" +
        "<p>Não confunda essa propriedade com a consistência sequencial da quarta seção. " +
        "As duas se parecem porque ambas comparam o sistema real com um sistema de cópia " +
        "única. A consistência sequencial trata de operações avulsas e não tem noção " +
        "nenhuma de agrupamento, enquanto a serialização de uma cópia trata de blocos de " +
        "operações que precisam parecer indivisíveis. Daqui em diante supomos que cada " +
        "gerenciador aplica travamento de duas fases sobre os objetos dele, que é o " +
        "mecanismo de controle de concorrência mais comum.</p>" +

        "<h3>Um lê e todos escrevem, e por que isso não sobrevive</h3>" +
        "<p>O esquema mais simples que alcança a serialização de uma cópia se enuncia numa " +
        "linha. A leitura é executada por um gerenciador qualquer, que coloca uma trava " +
        "de leitura sobre o objeto, e a escrita é executada por todos os gerenciadores, " +
        "cada um colocando uma trava de escrita.</p>" +
        "<p>Ele funciona por um argumento de travas que vale a pena acompanhar. Duas " +
        "escritas de transações diferentes sobre o mesmo objeto vão exigir travas " +
        "conflitantes em todos os gerenciadores, então uma delas espera. Uma leitura e " +
        "uma escrita vão exigir travas conflitantes em pelo menos um gerenciador, que é " +
        "aquele onde a leitura aconteceu, e isso basta para serializá-las.</p>" +
        "<p>O problema é que o esquema não sobrevive ao mundo real, porque qualquer " +
        "gerenciador indisponível trava todas as escritas. A <strong>replicação de cópias " +
        "disponíveis</strong> relaxa a exigência de um jeito quase óbvio, mandando a " +
        "escrita apenas aos gerenciadores que estiverem disponíveis, e mantendo a leitura " +
        "em um só. O front-end descobre quem está fora por tempo limite e tenta outro, e " +
        "um gerenciador que se recuperou mas ainda está desatualizado recusa a requisição " +
        "em vez de respondê-la errado.</p>" +
        "<p>Essa mudança pequena abre um buraco sutil. Enquanto o conjunto de disponíveis " +
        "não muda, o controle de concorrência local basta, como no esquema anterior. " +
        "Quando um gerenciador falha ou se recupera no meio de transações concorrentes, " +
        "duas delas podem observar falhas incompatíveis. Imagine que a transação T leu um " +
        "objeto no gerenciador X e depois escreveu em outros porque percebeu que N tinha " +
        "caído, enquanto a transação U leu no gerenciador N e escreveu em outros porque " +
        "percebeu que X tinha caído. Cada uma acredita numa ordem de falhas, e as duas " +
        "ordens não podem ser verdadeiras ao mesmo tempo.</p>" +
        "<p>A correção se chama <strong>validação local</strong> e acontece antes da " +
        "confirmação. A transação confere se os gerenciadores que ela deu por falhos " +
        "continuam falhos e se os que ela usou continuam disponíveis. No exemplo acima, T " +
        "passaria nessa checagem e U reprovaria, porque N já teria falhado, e a ordem " +
        "entre as duas ficaria bem definida. Vale registrar o limite dessa família de " +
        "algoritmos, que não pode ser usada em ambientes onde gerenciadores em " +
        "funcionamento não conseguem se falar.</p>" +

        "<h3>Quando a rede se parte</h3>" +
        "<p>Esse limite é justamente o caso do particionamento da rede, em que o grupo se " +
        "divide em subgrupos que se comunicam por dentro e não por fora. Os esquemas " +
        "supõem que a partição um dia será reparada, então o que cada subgrupo executar " +
        "enquanto isso não pode deixar o conjunto inconsistente depois.</p>" +
        "<p>As respostas se dividem em duas famílias, e a escolha entre elas é a mesma " +
        "que separou a quarta seção da quinta. A estratégia <strong>otimista</strong> não " +
        "limita a disponibilidade durante a partição, permite atualizações em todos os " +
        "lados e valida tudo depois, cancelando o que violar a serialização de uma cópia. " +
        "A estratégia <strong>pessimista</strong> limita a disponibilidade mesmo quando " +
        "não há partição alguma, e em troca impede que a inconsistência chegue a " +
        "existir.</p>" +
        "<p>A versão otimista tem um custo que não é técnico. Se não houvesse partição, " +
        "uma das duas transações conflitantes teria sido atrasada ou cancelada antes de " +
        "confirmar. Como houve, as duas confirmaram em lados opostos, e a única opção " +
        "restante é cancelar uma delas depois do fato, o que exige compensar efeitos que " +
        "já saíram para o mundo, como uma conta que ficou sem fundos. A estratégia só é " +
        "possível em aplicações onde essa compensação existe.</p>" +
        "<p>Detectar o que precisa ser cancelado tem duas técnicas conhecidas. Vetores de " +
        "versão, como os do Coda, comparam pares de escritas e funcionam bem em sistemas " +
        "de arquivos, onde as transações tocam um arquivo só e conflitos entre leitura e " +
        "escrita importam pouco. Grafos de precedência guardam, em cada partição, quais " +
        "objetos cada transação leu e escreveu, e a validação junta os grafos das " +
        "partições e acrescenta as arestas de conflito entre elas. Se o grafo resultante " +
        "tiver ciclo, a validação falhou.</p>" +

        "<h3>O consenso de quórum, e os dois números que o operador ajusta</h3>" +
        "<p>A estratégia pessimista mais influente é o <strong>consenso de quórum</strong>, " +
        "proposto por Gifford em 1979. A ideia central é impedir que subgrupos diferentes " +
        "executem operações conflitantes, dando a cada subgrupo condição de decidir " +
        "sozinho se tem direito de prosseguir. Um quórum é um subgrupo grande o bastante " +
        "para ter esse direito.</p>" +
        "<p>Cada cópia recebe um número de <strong>votos</strong>, que funciona como um " +
        "peso ligado ao quanto se deseja usar aquela cópia. Toda leitura precisa reunir " +
        "um <strong>quórum de leitura</strong> de R votos antes de ler, e toda escrita " +
        "precisa reunir um <strong>quórum de escrita</strong> de W votos antes de " +
        "prosseguir. Os dois números são configurados de uma vez para o grupo, sob duas " +
        "regras.</p>" +
        "<ul>" +
        "<li><strong>W precisa passar da metade do total de votos.</strong> Assim dois " +
        "quóruns de escrita sempre têm cópia em comum, e nunca acontecem escritas " +
        "conflitantes em partições diferentes.</li>" +
        "<li><strong>R somado a W precisa passar do total de votos.</strong> Assim todo " +
        "quórum de leitura cruza todo quórum de escrita, e a leitura sempre alcança pelo " +
        "menos uma cópia atualizada.</li>" +
        "</ul>" +
        '<figure class="figura" id="fig-quorum">' +
        '<svg viewBox="0 0 600 244" role="img" aria-labelledby="fig-quorum-titulo">' +
        '<title id="fig-quorum-titulo">Cinco cópias em linha, cada uma com um voto. Uma ' +
        "chave desenhada acima abrange as três primeiras e está rotulada como quórum de " +
        "escrita com três votos. Outra chave, desenhada abaixo, abrange as três últimas e " +
        "está rotulada como quórum de leitura com três votos. A terceira cópia, que " +
        "pertence aos dois quóruns, aparece destacada.</title>" +
        '<path class="traco" d="M36 86 L36 74 L348 74 L348 86"/>' +
        '<text class="rotulo-secundario" x="192" y="62" text-anchor="middle" ' +
        'font-size="11">quórum de escrita, 3 votos</text>' +
        '<rect class="caixa" x="36" y="96" width="96" height="50" rx="8"/>' +
        '<text x="84" y="118" text-anchor="middle" font-size="11">cópia 1</text>' +
        '<text class="rotulo-secundario" x="84" y="136" text-anchor="middle" ' +
        'font-size="11">1 voto</text>' +
        '<rect class="caixa" x="144" y="96" width="96" height="50" rx="8"/>' +
        '<text x="192" y="118" text-anchor="middle" font-size="11">cópia 2</text>' +
        '<text class="rotulo-secundario" x="192" y="136" text-anchor="middle" ' +
        'font-size="11">1 voto</text>' +
        '<rect class="caixa-destaque" x="252" y="96" width="96" height="50" rx="8"/>' +
        '<text x="300" y="118" text-anchor="middle" font-size="11">cópia 3</text>' +
        '<text class="rotulo-secundario" x="300" y="136" text-anchor="middle" ' +
        'font-size="11">1 voto</text>' +
        '<rect class="caixa" x="360" y="96" width="96" height="50" rx="8"/>' +
        '<text x="408" y="118" text-anchor="middle" font-size="11">cópia 4</text>' +
        '<text class="rotulo-secundario" x="408" y="136" text-anchor="middle" ' +
        'font-size="11">1 voto</text>' +
        '<rect class="caixa" x="468" y="96" width="96" height="50" rx="8"/>' +
        '<text x="516" y="118" text-anchor="middle" font-size="11">cópia 5</text>' +
        '<text class="rotulo-secundario" x="516" y="136" text-anchor="middle" ' +
        'font-size="11">1 voto</text>' +
        '<path class="traco" d="M252 156 L252 168 L564 168 L564 156"/>' +
        '<text class="rotulo-secundario" x="408" y="186" text-anchor="middle" ' +
        'font-size="11">quórum de leitura, 3 votos</text>' +
        '<text class="rotulo-secundario" x="300" y="216" text-anchor="middle" ' +
        'font-size="11">a cópia 3 está nos dois, e é ela que carrega a versão atual</text>' +
        "</svg>" +
        "<figcaption>As duas regras existem para forçar essa sobreposição. Enquanto ela " +
        "existir, a leitura encontra pelo menos uma cópia com o número de versão " +
        "corrente, e duas escritas nunca se perdem de vista.</figcaption>" +
        "</figure>" +
        "<p>Como saber qual cópia do quórum está atualizada? Cada cópia carrega um " +
        "<strong>número de versão</strong>, que é incrementado a cada alteração, e apenas " +
        "as cópias em dia têm o número corrente. Reunir um quórum de leitura é perguntar " +
        "números de versão até somar R votos, e a operação é então aplicada em qualquer " +
        "cópia que esteja com o número corrente. Reunir um quórum de escrita é perguntar " +
        "até encontrar cópias atualizadas somando W votos, e, se não houver atualizadas " +
        "suficientes, uma cópia velha é substituída por uma corrente para completar o " +
        "quórum.</p>" +
        "<p>Feita a escrita nas cópias do quórum, com o número de versão incrementado, o " +
        "cliente já pode ser informado. As demais cópias disponíveis são atualizadas " +
        "depois, em segundo plano, cada uma substituindo o conteúdo antigo por uma cópia " +
        "obtida de quem está em dia.</p>" +
        "<p>A grande vantagem do esquema é a de configuração. Ajustando os votos e os dois " +
        "quóruns, o projetista escolhe onde quer desempenho e onde quer confiabilidade, e " +
        "diminuir W favorece a escrita enquanto diminuir R favorece a leitura. Há ainda " +
        "um truque para usar cópias que ficam em disco local de máquina cliente. Elas " +
        "recebem <strong>zero voto</strong> e são chamadas de representantes fracos, o " +
        "que garante que nunca entrem em quórum nenhum, e mesmo assim servem para " +
        "acelerar a leitura, já que a operação pode ser aplicada nelas depois que o " +
        "quórum foi reunido em outro lugar.</p>" +
        "<p>Três configurações do próprio Gifford mostram o alcance disso, e vale ler a " +
        "tabela por colunas. As latências estão em milissegundos e as probabilidades de " +
        "bloqueio indicam a chance de não se conseguir formar um quórum, calculadas " +
        "supondo que cada gerenciador individual tem 1% de chance de estar indisponível " +
        "no instante do pedido.</p>" +
        '<div class="tabela-rolagem">' +
        '<table class="tabela-conteudo" id="tab-gifford">' +
        "<tr><th>Configuração</th><th>Exemplo 1</th><th>Exemplo 2</th><th>Exemplo 3</th></tr>" +
        "<tr><td>Latência da réplica 1</td><td>75</td><td>75</td><td>75</td></tr>" +
        "<tr><td>Latência da réplica 2</td><td>65</td><td>100</td><td>750</td></tr>" +
        "<tr><td>Latência da réplica 3</td><td>65</td><td>750</td><td>750</td></tr>" +
        "<tr><td>Votos das réplicas 1, 2 e 3</td><td>1, 0 e 0</td><td>2, 1 e 1</td>" +
        "<td>1, 1 e 1</td></tr>" +
        "<tr><td>Quórum de leitura R</td><td>1</td><td>2</td><td>1</td></tr>" +
        "<tr><td>Quórum de escrita W</td><td>1</td><td>3</td><td>3</td></tr>" +
        "<tr><td>Latência de leitura</td><td>65</td><td>75</td><td>75</td></tr>" +
        "<tr><td>Probabilidade de bloqueio na leitura</td><td>0,01</td><td>0,0002</td>" +
        "<td>0,000001</td></tr>" +
        "<tr><td>Latência de escrita</td><td>75</td><td>100</td><td>750</td></tr>" +
        "<tr><td>Probabilidade de bloqueio na escrita</td><td>0,01</td><td>0,0101</td>" +
        "<td>0,03</td></tr>" +
        "</table>" +
        "</div>" +
        '<p class="figura-fonte">Fonte: traduzido de Coulouris, Dollimore, Kindberg e ' +
        "Blair (2013).</p>" +
        "<p>Leia a tabela de trás para frente e ela vira um catálogo de intenções. O " +
        "exemplo 1 tem um gerenciador de verdade e duas cópias em disco de cliente, com " +
        "zero voto, e existe para acelerar leitura numa aplicação com muitas leituras por " +
        "escrita, sem melhorar a confiabilidade. O exemplo 2 dá dois votos ao gerenciador " +
        "da rede local e um a cada remoto, de modo que a leitura se resolve localmente e " +
        "a escrita precisa alcançar um remoto, e o arquivo continua legível se o local " +
        "cair. O exemplo 3 distribui votos iguais e exige escrita em todas as três, que é " +
        "o arranjo para um diretório de sistema, lido o tempo todo e alterado " +
        "raramente.</p>" +
        "<p>A desvantagem principal do consenso de quórum está no canto que ninguém olha " +
        "primeiro. Ler deixou de ser barato, porque exige reunir R gerenciadores em vez " +
        "de perguntar a um. O <strong>algoritmo de partição virtual</strong> ataca " +
        "exatamente isso, combinando as duas ideias desta seção. Se um subgrupo tem votos " +
        "suficientes para formar tanto o quórum de leitura quanto o de escrita, ele passa " +
        "a usar cópias disponíveis lá dentro, com leitura numa cópia só, e cancela as " +
        "transações em andamento sempre que a composição do subgrupo muda.</p>" +
        "<p>Essa regra de 1979 continua viva, com outro nome e no meio da nuvem. O " +
        "Dynamo, o serviço de armazenamento por chave e valor que a Amazon usa para " +
        "coisas como o carrinho de compras, exige que R somado a W ultrapasse N, o número " +
        "de nós com réplica, e uma configuração comum é ter N igual a três com R e W " +
        "iguais a dois. Ele acrescenta uma flexibilização batizada de quórum relaxado, em " +
        "que a réplica pode ser guardada num nó substituto que devolve os valores quando " +
        "o nó pretendido voltar, o que troca um pouco da garantia por disponibilidade " +
        "durante a partição. E, no espírito da seção anterior, o Dynamo aceita toda " +
        "escrita como versão imutável, usa carimbos vetoriais para ordenar versões e " +
        "entrega ao cliente as versões conflitantes para que ele resolva, oferecendo " +
        "tanto a saída do Bayou quanto a do Coda.</p>",
      slides: [
        {
          title: "Transação replicada e a cópia única",
          html:
            "<ul>" +
            "<li>Transação é uma <strong>sequência</strong> de operações com garantias " +
            "de atomicidade e isolamento</li>" +
            "<li>Exige-se <strong>serialização de uma cópia</strong>, e não consistência " +
            "sequencial</li>" +
            "<li>A diferença é que aqui as operações vêm agrupadas em blocos</li>" +
            "</ul>"
        },
        {
          title: "De um lê e todos escrevem às cópias disponíveis",
          html:
            "<ul>" +
            "<li>Leitura num gerenciador, escrita em todos, com travamento de duas " +
            "fases</li>" +
            "<li>Um gerenciador fora <strong>trava</strong> toda escrita</li>" +
            "<li>Cópias disponíveis escrevem só nos alcançáveis e toleram colapso</li>" +
            "<li>A <strong>validação local</strong> conserta as observações de falha " +
            "incompatíveis</li>" +
            "</ul>"
        },
        {
          title: "Otimista ou pessimista sob partição",
          html:
            "<ul>" +
            "<li>A <strong>otimista</strong> deixa todos escreverem e cancela depois</li>" +
            "<li>Cancelar depois exige compensar efeito que já saiu para o mundo</li>" +
            "<li>A <strong>pessimista</strong> limita a disponibilidade e evita a " +
            "inconsistência</li>" +
            "<li>Detecta-se por vetor de versão ou por grafo de precedência</li>" +
            "</ul>"
        },
        {
          title: "As duas regras do quórum",
          ref: "fig-quorum",
          html:
            "<ul>" +
            "<li>W passa da metade dos votos, então duas escritas se cruzam</li>" +
            "<li>R somado a W passa do total, então leitura cruza escrita</li>" +
            "</ul>"
        },
        {
          title: "O quórum ficou, e mudou de nome",
          html:
            "<ul>" +
            "<li>Diminuir W favorece a escrita; diminuir R favorece a leitura</li>" +
            "<li>Representante fraco tem <strong>zero voto</strong> e acelera leitura</li>" +
            "<li>A <strong>partição virtual</strong> usa cópias disponíveis dentro do " +
            "quórum</li>" +
            "<li>O Dynamo pede R mais W maior que N, com três, dois e dois</li>" +
            "</ul>"
        }
      ]
    },

    {
      title: "A Web, o maior sistema replicado que existe",
      html:
        "<p>A Web é provavelmente o maior sistema distribuído já construído, e ela vale " +
        "como fecho deste tópico por um motivo específico. Nascida como uma arquitetura " +
        "cliente e servidor bastante simples, ela precisou de exigências duras de " +
        "desempenho e disponibilidade, e a resposta que deu foi empilhar camada sobre " +
        "camada de cópia. Vale acompanhar essa pilha de fora para dentro.</p>" +

        "<h3>O caminho de um pedido, e as cópias que ele atravessa</h3>" +
        "<p>Do lado do cliente há duas cópias, e não uma. A primeira é a cache do próprio " +
        "navegador, que guarda cada documento buscado e o devolve na visita seguinte. A " +
        "segunda é o <strong>proxy</strong>, um servidor que a instituição do usuário " +
        "opera, que recebe os pedidos dos clientes locais, os repassa aos servidores Web " +
        "e guarda os resultados. Como o proxy atende muita gente, a cache dele é " +
        "compartilhada, e o que um usuário buscou aproveita a quem vier depois.</p>" +
        "<p>Com tanto documento gerado na hora, os servidores aprenderam a entregar a " +
        "página em pedaços, instruindo o cliente a guardar apenas as partes que " +
        "provavelmente não vão mudar no próximo pedido. Além dessas duas caches, os " +
        "provedores de acesso costumam manter caches próprias dentro das redes deles, o " +
        "que reduz o tráfego que eles pagam e melhora o tempo de resposta de quem " +
        "navega.</p>" +
        '<figure class="figura" id="fig-caminho-cache">' +
        '<svg viewBox="0 0 600 214" role="img" aria-labelledby="fig-caminho-titulo">' +
        '<title id="fig-caminho-titulo">Cinco caixas em linha, ligadas por setas da ' +
        "esquerda para a direita, na ordem navegador, proxy do sítio, cache do provedor, " +
        "servidor de borda e servidor de origem, este último destacado. Abaixo de cada " +
        "caixa, uma linha diz o que aquela etapa faz. Uma observação no rodapé lembra que " +
        "cada etapa que erra acrescenta latência à seguinte.</title>" +
        '<rect class="caixa" x="8" y="60" width="98" height="44" rx="8"/>' +
        '<text x="57" y="87" text-anchor="middle" font-size="11">Navegador</text>' +
        '<path class="traco" d="M106 82 L114 82"/>' +
        '<path class="seta" d="M114 76 L114 88 L124 82 Z"/>' +
        '<rect class="caixa" x="124" y="60" width="104" height="44" rx="8"/>' +
        '<text x="176" y="87" text-anchor="middle" font-size="11">Proxy do sítio</text>' +
        '<path class="traco" d="M228 82 L238 82"/>' +
        '<path class="seta" d="M238 76 L238 88 L248 82 Z"/>' +
        '<rect class="caixa" x="248" y="60" width="110" height="44" rx="8"/>' +
        '<text x="303" y="80" text-anchor="middle" font-size="11">Cache do</text>' +
        '<text x="303" y="95" text-anchor="middle" font-size="11">provedor</text>' +
        '<path class="traco" d="M358 82 L366 82"/>' +
        '<path class="seta" d="M366 76 L366 88 L376 82 Z"/>' +
        '<rect class="caixa" x="376" y="60" width="104" height="44" rx="8"/>' +
        '<text x="428" y="80" text-anchor="middle" font-size="11">Servidor</text>' +
        '<text x="428" y="95" text-anchor="middle" font-size="11">de borda</text>' +
        '<path class="traco" d="M480 82 L486 82"/>' +
        '<path class="seta" d="M486 76 L486 88 L496 82 Z"/>' +
        '<rect class="caixa-destaque" x="496" y="60" width="96" height="44" rx="8"/>' +
        '<text x="544" y="80" text-anchor="middle" font-size="11">Servidor</text>' +
        '<text x="544" y="95" text-anchor="middle" font-size="11">de origem</text>' +
        '<text class="rotulo-secundario" x="57" y="126" text-anchor="middle" ' +
        'font-size="10">guarda o que</text>' +
        '<text class="rotulo-secundario" x="57" y="140" text-anchor="middle" ' +
        'font-size="10">acabou de carregar</text>' +
        '<text class="rotulo-secundario" x="176" y="126" text-anchor="middle" ' +
        'font-size="10">compartilha entre</text>' +
        '<text class="rotulo-secundario" x="176" y="140" text-anchor="middle" ' +
        'font-size="10">os clientes do sítio</text>' +
        '<text class="rotulo-secundario" x="303" y="126" text-anchor="middle" ' +
        'font-size="10">poupa o tráfego</text>' +
        '<text class="rotulo-secundario" x="303" y="140" text-anchor="middle" ' +
        'font-size="10">que o provedor paga</text>' +
        '<text class="rotulo-secundario" x="428" y="126" text-anchor="middle" ' +
        'font-size="10">responde perto</text>' +
        '<text class="rotulo-secundario" x="428" y="140" text-anchor="middle" ' +
        'font-size="10">de quem pediu</text>' +
        '<text class="rotulo-secundario" x="544" y="126" text-anchor="middle" ' +
        'font-size="10">é a autoridade</text>' +
        '<text class="rotulo-secundario" x="544" y="140" text-anchor="middle" ' +
        'font-size="10">sobre o dado</text>' +
        '<text class="rotulo-secundario" x="300" y="180" text-anchor="middle" ' +
        'font-size="11">cada etapa que erra acrescenta latência à seguinte</text>' +
        "</svg>" +
        "<figcaption>Mais cópias no caminho aumentam a chance de acerto e pioram o pior " +
        "caso. Um pedido que erra em todas as etapas paga cinco consultas antes de chegar " +
        "à autoridade sobre o dado.</figcaption>" +
        "</figure>" +
        "<p>A figura mostra o risco de empilhar cache sobre cache. Uma alternativa a essa " +
        "hierarquia é a <strong>cache cooperativa</strong>, em que um proxy que errou " +
        "pergunta antes aos proxies vizinhos, e só depois vai ao servidor de origem. A " +
        "utilidade dela foi medida duas vezes com resultados quase opostos. Um estudo do " +
        "fim dos anos 1990 concluiu que ela só compensa para grupos da ordem de dezenas " +
        "de milhares de usuários, que poderiam ser atendidos por um proxy só, mais " +
        "barato. Um estudo de uma década depois, num sistema bastante descentralizado, " +
        "achou o oposto. As duas medições não se contradizem, e a lição delas é que o " +
        "efeito da cache cooperativa depende inteiramente do padrão de demanda dos " +
        "clientes.</p>" +

        "<h3>Como a Web decidiu manter suas cópias em dia</h3>" +
        "<p>Reconheça nos parágrafos seguintes as mesmas escolhas da segunda seção, agora " +
        "com nomes concretos. A forma mais direta de garantir que a cópia guardada ainda " +
        "vale é puxar, e alguns proxies fazem isso enviando um pedido condicional ao " +
        "servidor, com um cabeçalho que informa a data da última modificação do documento " +
        "guardado. O servidor devolve o documento inteiro apenas se ele mudou desde " +
        "aquela data.</p>" +
        "<p>Essa disciplina obriga o proxy a falar com o servidor a cada pedido, o que " +
        "custa caro. O proxy Squid, muito usado, troca parte da consistência por " +
        "desempenho com uma heurística simples de prazo de validade. Ele mede há quanto " +
        "tempo o documento tinha sido modificado quando entrou na cache, toma um quinto " +
        "desse intervalo e usa o resultado como prazo, dentro de limites mínimo e máximo. " +
        "Documento que já estava parado há meses ganha prazo longo, e documento recém " +
        "alterado ganha prazo curto, o que é a mesma ideia da concessão por idade que a " +
        "segunda seção apresentou.</p>" +
        "<p>A alternativa é empurrar, com o servidor enviando um aviso de invalidação " +
        "quando o documento muda. O problema já é conhecido, porque o servidor teria de " +
        "acompanhar um número enorme de proxies, e combinar invalidação com concessões " +
        "mantém esse estado dentro de limites aceitáveis, já que o prazo determina " +
        "quantas caches o servidor precisa lembrar. O curioso é o desfecho. Uma comparação " +
        "cuidadosa das políticas concluiu que deixar o servidor enviar invalidações supera " +
        "os demais métodos tanto em banda quanto em latência percebida, e ainda assim " +
        "protocolos de invalidação quase nunca são usados em proxies da Web. Quanto a " +
        "decidir o que descartar quando a cache enche, muita pesquisa foi feita e a " +
        "conclusão é modesta, porque descartar o objeto usado menos recentemente funciona " +
        "bem o suficiente.</p>" +

        "<h3>A rede de distribuição de conteúdo</h3>" +
        "<p>À medida que a Web virou o canal principal pelo qual as organizações se " +
        "apresentam e atendem, manter o conteúdo do sítio e mantê-lo acessível deixaram " +
        "de ser a mesma tarefa. Dessa separação nasceram as <strong>redes de distribuição " +
        "de conteúdo</strong>, que funcionam como serviço de hospedagem e oferecem a " +
        "infraestrutura para distribuir e replicar os documentos de muitos sítios pela " +
        "Internet. A escala impressiona, porque a Akamai é descrita, em 2022, com mais de " +
        "400 mil servidores pelo mundo.</p>" +
        "<p>Esse tamanho torna impossível decidir manualmente o que vai para onde, e o " +
        "arranjo usual é um laço de controle por realimentação. O sistema mede como está " +
        "se saindo, decide se precisa mudar e toma providências, que se dividem em " +
        "recolocar réplicas, impor consistência e dirigir pedidos de clientes.</p>" +
        "<p>Medir é mais difícil do que parece, e as métricas se agrupam em famílias com " +
        "problemas próprios. As de latência precisam estimar o atraso entre um cliente e " +
        "um servidor remoto sem ter acesso ao cliente. As de banda disponível são " +
        "notoriamente difíceis de obter com precisão. As espaciais contam saltos de " +
        "roteamento, número que nem sempre se correlaciona com latência. As de uso de " +
        "rede somam bytes transferidos e dependem de saber com que frequência cada " +
        "documento é lido, alterado e replicado. Há ainda as de consistência, que medem o " +
        "quanto uma réplica se afastou da cópia mestra, e as financeiras, que não são " +
        "técnicas e costumam decidir, já que essas redes operam comercialmente. Na " +
        "prática, o que conta é cumprir os acordos de nível de serviço firmados com os " +
        "clientes, quase sempre escritos em termos de com que rapidez eles serão " +
        "atendidos.</p>" +
        "<p>Impor consistência nessas condições tem uma solução elegante que reaproveita " +
        "o tópico 09. O documento principal vem sempre do servidor de origem, então ele " +
        "nunca fica velho. Os documentos embutidos, que vêm do servidor de réplica mais " +
        "próximo, ganham no endereço um identificador exclusivo que muda toda vez que " +
        "aquele documento muda. Mudar o identificador é mudar o nome do documento, e o " +
        "servidor de borda, ao procurar um nome que nunca viu, simplesmente não o " +
        "encontra na cache e vai buscá-lo na origem. A versão antiga fica lá até ser " +
        "descartada por desuso, sem que ninguém precise invalidá-la.</p>" +

        "<h3>Quando a página não existe pronta</h3>" +
        "<p>Tudo o que veio até aqui supõe conteúdo estático. A Web serve cada vez mais " +
        "páginas geradas na hora, e nesse caso a cópia guardada na borda deixa de ser um " +
        "arquivo e passa a ser algum recorte do banco de dados de origem. Existem três " +
        "soluções, e a honestidade obriga a dizer que nenhuma delas é a melhor em " +
        "abstrato.</p>" +
        '<div class="tabela-rolagem">' +
        '<table class="tabela-conteudo" id="tab-borda">' +
        "<tr><th>Solução</th><th>Quando ela compensa</th><th>O que ela custa</th></tr>" +
        "<tr><td>Replicar o banco inteiro na borda</td><td>Compensa quando as " +
        "atualizações são raras e as consultas percorrem várias tabelas.</td><td>Custa " +
        "uma travessia de rede longa a cada atualização, e desmorona quando elas ficam " +
        "frequentes.</td></tr>" +
        "<tr><td>Guardar respostas com conhecimento do conteúdo</td><td>Compensa quando " +
        "as consultas seguem poucos modelos conhecidos e se repetem.</td><td>Custa " +
        "processamento de consulta na borda e obriga a origem a saber que registro afeta " +
        "que modelo.</td></tr>" +
        "<tr><td>Guardar respostas sem olhar o conteúdo</td><td>Compensa quando a mesma " +
        "consulta se repete muito e a borda tem pouca capacidade de " +
        "processamento.</td><td>Custa espaço, porque guarda dado repetido, e complica " +
        "saber que atualização invalida que resposta.</td></tr>" +
        "</table>" +
        "</div>" +
        "<p>A segunda linha merece uma palavra a mais, porque ela guarda uma ideia bonita. " +
        "O servidor de borda mantém um banco organizado segundo a forma das consultas, e " +
        "não segundo a estrutura normalizada dos dados. Ao receber uma consulta, ele " +
        "verifica se consegue respondê-la com o que já tem guardado, pergunta que se " +
        "chama verificação de contenção. A terceira linha renuncia a esse raciocínio e " +
        "calcula um resumo da consulta para procurá-la na cache, o que gasta muito menos " +
        "processamento e muito mais espaço.</p>" +
        '<div class="callout">' +
        '<p class="callout-title">💡 A resposta da Web à pergunta do tópico</p>' +
        "<p>Quantas cópias precisam concordar antes de o cliente receber a resposta? Na " +
        "Web, nenhuma. O navegador responde do que tem, o proxy responde do que tem, o " +
        "servidor de borda responde do que tem, e ninguém consulta ninguém antes. O " +
        "sistema mais usado do mundo escolheu o extremo mais fraco do espectro deste " +
        "tópico, e funciona porque a maior parte do conteúdo muda devagar e porque ler " +
        "uma versão de alguns minutos atrás quase nunca faz mal. Nas partes em que isso " +
        "faz mal, como um saldo bancário ou um estoque, o mesmo sítio desliga a cache e " +
        "paga o preço da seção 4. A escolha nunca é do sistema inteiro, e sim de cada " +
        "dado dele.</p>" +
        "</div>",
      slides: [
        {
          title: "As cópias que um pedido atravessa",
          ref: "fig-caminho-cache",
          html:
            "<ul>" +
            "<li>Navegador, proxy do sítio, cache do provedor e servidor de borda</li>" +
            "<li>Mais cópias melhoram o caso médio e pioram o pior caso</li>" +
            "</ul>"
        },
        {
          title: "Cache cooperativa, medida duas vezes",
          html:
            "<ul>" +
            "<li>Proxy que erra pergunta aos vizinhos antes de ir à origem</li>" +
            "<li>Um estudo achou pouco ganho; outro, uma década depois, achou muito</li>" +
            "<li>Os dois estão certos, porque o efeito depende da demanda</li>" +
            "</ul>"
        },
        {
          title: "Puxar, empurrar e o prazo do Squid",
          html:
            "<ul>" +
            "<li>O pedido condicional envia a data da última modificação</li>" +
            "<li>O Squid usa <strong>um quinto</strong> da idade do documento como " +
            "prazo</li>" +
            "<li>Invalidar venceria em banda e em latência, e quase não se usa</li>" +
            "<li>Descartar o menos usado recentemente basta</li>" +
            "</ul>"
        },
        {
          title: "A rede de distribuição de conteúdo",
          html:
            "<ul>" +
            "<li>Hospedagem que replica documentos de muitos sítios, em escala de " +
            "centenas de milhares de servidores</li>" +
            "<li>Funciona como laço de controle, medindo, decidindo e agindo</li>" +
            "<li>Medir latência, banda e saltos é difícil; o que conta é o acordo de " +
            "nível de serviço</li>" +
            "<li>Consistência por <strong>mudança de nome</strong> do documento " +
            "embutido</li>" +
            "</ul>"
        },
        {
          title: "Conteúdo gerado na hora, três saídas",
          ref: "tab-borda"
        }
      ]
    }
  ],

  quiz: [
    {
      question:
        "Um objeto está replicado em três servidores que falham de forma independente, " +
        "cada um com 10% de probabilidade de estar indisponível num dado instante. Qual " +
        "é a disponibilidade do objeto?",
      options: [
        "É de 70%, porque as probabilidades de falha dos três servidores se somam e reduzem a disponibilidade nessa proporção.",
        "É de 90%, porque o objeto fica inacessível assim que qualquer um dos três servidores deixa de responder ao pedido.",
        "É de 99,9%, porque o objeto só some quando os três falham juntos, e a probabilidade disso é 0,1 elevado a 3, ou 0,001.",
        "É de 99,99%, porque replicar um objeto em três servidores garante quatro noves de disponibilidade em qualquer configuração."
      ],
      answer: 2,
      explanation:
        "Com falhas independentes, o objeto só desaparece se todas as cópias caírem ao " +
        "mesmo tempo, e essa probabilidade é 0,1 elevado a 3. A disponibilidade é o " +
        "complemento disso, ou seja, 1 menos 0,001. Cada réplica a mais multiplica a " +
        "probabilidade de indisponibilidade total por p, o que explica por que a terceira " +
        "cópia rende bem menos que a segunda."
    },
    {
      question:
        "Uma rede de distribuição de conteúdo guarda uma página num servidor de borda " +
        "porque um cliente daquela região a pediu. Em qual dos três tipos de cópia essa " +
        "réplica se encaixa?",
      options: [
        "É réplica iniciada pelo cliente, porque a cópia só passou a existir depois de um pedido feito por ele.",
        "É réplica iniciada pelo servidor, porque quem decide para onde dirigir o cliente e o que guardar é a rede.",
        "É réplica permanente, porque os servidores da rede de distribuição são instalados de forma estática e duradoura.",
        "É réplica iniciada pelo cliente, porque toda cópia criada sob demanda pertence por definição a esse terceiro anel."
      ],
      answer: 1,
      explanation:
        "O critério que separa os três anéis é de quem partiu a iniciativa, e não o que " +
        "disparou a criação da cópia. A replicação acontece sob demanda, mas quem decide " +
        "dirigir o cliente àquele servidor e quem decide o que armazenar é a rede de " +
        "distribuição, que age em nome do dono do dado. Réplicas iniciadas pelo cliente " +
        "são as caches do navegador e do proxy, que a loja de dados não controla."
    },
    {
      question:
        "No gerenciamento de réplicas, uma concessão é a promessa que o servidor faz de " +
        "empurrar atualizações de um dado durante um prazo determinado. Que problema ela " +
        "resolve?",
      options: [
        "Resolve o estado que empurrar obriga o servidor a guardar, porque a lista de caches encolhe conforme os prazos vencem.",
        "Resolve a falta de ordem entre atualizações concorrentes, porque o prazo funciona como um carimbo de tempo global do sistema.",
        "Resolve o conflito entre escritas feitas em partições diferentes, porque cancela automaticamente a que tiver o prazo mais curto.",
        "Resolve a escolha de onde instalar os servidores de réplica, porque indica quais localidades merecem receber prazos mais longos."
      ],
      answer: 0,
      explanation:
        "Empurrar entrega tempo de resposta imediato e transforma o servidor em guardião " +
        "de estado, porque ele precisa saber quem tem cada dado. A concessão limita esse " +
        "estado no tempo, já que o servidor só precisa lembrar dos clientes cujo prazo " +
        "ainda vale. Vencido o prazo, o cliente volta a perguntar, e o sistema desliza " +
        "para o comportamento de puxar sem trocar de mecanismo."
    },
    {
      question:
        "O modelo de replicação frequentemente exige que um gerenciador de réplica seja " +
        "uma máquina de estados determinística. O que essa exigência proíbe na prática?",
      options: [
        "Proíbe que o resultado dependa de relógio, de sensor ou da ordem das threads, porque o estado é função da sequência aplicada.",
        "Proíbe que o gerenciador escolha livremente a ordem em que aplica as operações, porque isso obrigaria o sistema inteiro a usar multicast totalmente ordenado.",
        "Proíbe que o gerenciador guarde registro das operações já executadas, porque desfazer uma operação exigiria reconstruir o estado inteiro a partir do começo da execução.",
        "Proíbe que dois gerenciadores guardem réplicas do mesmo objeto lógico, porque o front-end precisa comparar respostas vindas de fontes realmente independentes."
      ],
      answer: 0,
      explanation:
        "A definição de máquina de estados diz que o estado resultante é função apenas " +
        "do estado inicial e da sequência de operações aplicadas. Qualquer estímulo de " +
        "fora dessa sequência quebra a propriedade, e é por isso que ler um relógio ou um " +
        "sensor fica proibido. A consequência incômoda é que um servidor que atende em " +
        "várias threads deixa de ser máquina de estados, porque o escalonador passa a " +
        "influir no resultado."
    },
    {
      question:
        "Um processo p envia uma mensagem ao grupo e falha logo em seguida, enquanto q e " +
        "r continuam corretos. Que desfecho a comunicação com modo de visualização " +
        "síncrono proíbe?",
      options: [
        "Proíbe que q e r entreguem o modo de visualização novo sem que nenhum dos dois tenha entregue aquela mensagem.",
        "Proíbe que q e r entreguem a mensagem e só depois entreguem o modo de visualização novo, que já não inclui p.",
        "Proíbe que q e r entreguem o modo de visualização novo e só depois entreguem a mensagem enviada por p.",
        "Proíbe que q e r entreguem duas vezes a mesma mensagem, exigência que a ordenação causal já garantiria sozinha."
      ],
      answer: 2,
      explanation:
        "As duas primeiras alternativas descrevem desfechos permitidos, porque a " +
        "mensagem cai inteiramente de um lado ou do outro da linha traçada pela troca de " +
        "modo. O terceiro é proibido, já que um processo estaria entregando mensagem de " +
        "alguém sobre quem foi informado que falhou. A quarta descreve a garantia de " +
        "integridade, que existe e não é o que a pergunta pede."
    },
    {
      question:
        "Qual é a diferença entre a capacidade de linearização e a consistência " +
        "sequencial?",
      options: [
        "As duas pedem uma interposição que satisfaça a cópia única, e a linearização exige ainda que a ordem respeite os tempos reais.",
        "A linearização vale para transações agrupadas e a consistência sequencial vale para operações avulsas de cada cliente.",
        "A consistência sequencial é a mais forte das duas, porque recorre a relógios sincronizados para ordenar todas as operações.",
        "São critérios equivalentes, e os dois termos podem ser usados um no lugar do outro sem prejuízo de precisão técnica."
      ],
      answer: 0,
      explanation:
        "As duas exigem que exista uma intercalação das operações compatível com uma " +
        "cópia única e correta. A linearização acrescenta o requisito do tempo real, que " +
        "é mais forte e cobra relógios precisos, enquanto a sequencial se contenta com a " +
        "ordem do programa de cada cliente. Todo serviço linearizável é sequencialmente " +
        "consistente, e a recíproca é falsa."
    },
    {
      question:
        "Quantos gerenciadores a replicação passiva exige para atravessar até f falhas " +
        "por colapso, e quantos a replicação ativa exige para mascarar até f " +
        "gerenciadores que respondem valores inventados?",
      options: [
        "Exige f + 1 na passiva e f + 1 na ativa, porque o tipo de falha considerado não altera a contagem de réplicas.",
        "Exige f + 1 na passiva para colapsos e 2f + 1 na ativa, com o front-end esperando f + 1 respostas idênticas.",
        "Exige 2f + 1 na passiva e 3f + 1 na ativa, porque a passiva precisa de maioria e a ativa precisa de maioria qualificada.",
        "Exige f na passiva e f na ativa, porque cada falha prevista é coberta por exatamente um gerenciador de reserva."
      ],
      answer: 1,
      explanation:
        "Para colapsos basta que um sobreviva, e f + 1 réplicas garantem isso nos dois " +
        "arranjos. Para mascarar respostas inventadas é preciso que os corretos vençam os " +
        "defeituosos por voto, o que exige 2f + 1 réplicas e faz o front-end esperar " +
        "f + 1 respostas idênticas antes de repassar uma ao cliente. A replicação passiva " +
        "não protege contra esse tipo de falha em nenhuma quantidade de réplicas."
    },
    {
      question:
        "Na replicação ativa, o front-end envia a requisição por multicast totalmente " +
        "ordenado a gerenciadores que são máquinas de estado. Que garantia de " +
        "consistência isso alcança?",
      options: [
        "Alcança a linearização, porque a ordem total escolhida pelo multicast coincide sempre com a ordem temporal dos pedidos.",
        "Alcança apenas a ordem causal, porque o multicast totalmente ordenado é construído sobre carimbos de tempo vetoriais.",
        "Não alcança garantia nenhuma, porque cada gerenciador processa a requisição de forma independente dos seus pares.",
        "Alcança a consistência sequencial, porque todos processam na mesma ordem total, que não coincide com o tempo real."
      ],
      answer: 3,
      explanation:
        "O multicast confiável e totalmente ordenado faz todas as máquinas de estado " +
        "aplicarem a mesma sequência, e as requisições de cada front-end são atendidas em " +
        "ordem de emissão, o que dá consistência sequencial. A linearização não é " +
        "alcançada porque a ordem total escolhida pelo sistema pode diferir da ordem " +
        "temporal em que os clientes emitiram os pedidos, já que nada no protocolo " +
        "consulta relógio."
    },
    {
      question:
        "A arquitetura Gossip abre mão da consistência sequencial estrita em favor da " +
        "disponibilidade. Que princípio geral ela ilustra?",
      options: [
        "Réplicas que trocam mensagens de fofoca periódicas jamais chegam a convergir para um mesmo estado comum.",
        "Consistência mais forte exige mais acordo entre as réplicas, e mais acordo deixa o dado menos disponível.",
        "Alta disponibilidade só se obtém com replicação ativa apoiada em multicast confiável e totalmente ordenado.",
        "Guardar cópias na máquina do próprio cliente é o que garante a linearização das leituras feitas por ele."
      ],
      answer: 1,
      explanation:
        "É a troca central da replicação. Consistência forte obriga as réplicas a se " +
        "coordenarem antes de responder, o que reduz a disponibilidade; afrouxar a " +
        "consistência reduz o acordo necessário e mantém o serviço acessível mesmo com " +
        "réplicas incomunicáveis. As réplicas do Gossip convergem, sim, e a promessa " +
        "apenas não diz quando isso acontece."
    },
    {
      question:
        "O Bayou e o Coda usam estratégias otimistas e detectam conflitos de formas " +
        "diferentes. Qual afirmação descreve corretamente essa diferença?",
      options: [
        "O Bayou detecta com verificações do domínio e resolve por procedimento de integração; o Coda compara vetores e devolve ao dono.",
        "O Bayou compara vetores de versão sem entender o dado; o Coda usa verificações escritas por quem programou a aplicação.",
        "Os dois detectam sem semântica e resolvem automaticamente, e a diferença está apenas no intervalo entre as trocas de dados.",
        "Os dois exigem uma partição majoritária para aceitar escrita, e a diferença está apenas no formato do registro de operações."
      ],
      answer: 0,
      explanation:
        "O Bayou aposta em conhecimento do domínio, e cada atualização carrega uma " +
        "verificação de dependência e um procedimento de integração escritos pela " +
        "aplicação. O Coda usa vetores de versão e enxerga apenas que duas réplicas " +
        "divergiram, sem saber o que os arquivos contêm, então marca o arquivo e chama o " +
        "dono. Nenhum dos dois exige partição majoritária, que é justamente o que a " +
        "estratégia otimista dispensa."
    },
    {
      question:
        "No consenso de quórum de Gifford, atribuem-se votos às cópias e definem-se um " +
        "quórum de leitura R e um de escrita W. Que condições garantem a correção sob " +
        "particionamento?",
      options: [
        "R e W precisam ser iguais ao total de votos, de modo que toda cópia participe de toda leitura e de toda escrita.",
        "R somado a W precisa ficar abaixo do total de votos, para que partições diferentes consigam operar ao mesmo tempo.",
        "W precisa passar da metade dos votos e R somado a W precisa passar do total, o que força os quóruns a se sobreporem.",
        "R precisa ser sempre maior que W, para que a leitura tenha prioridade sobre a escrita enquanto durar o particionamento."
      ],
      answer: 2,
      explanation:
        "A primeira regra garante que dois quóruns de escrita sempre tenham cópia em " +
        "comum, o que impede escritas conflitantes em partições diferentes. A segunda " +
        "garante que todo quórum de leitura cruze todo quórum de escrita, de modo que a " +
        "leitura alcance pelo menos uma cópia com o número de versão corrente. Ajustar os " +
        "dois números é o que permite favorecer a leitura ou a escrita."
    },
    {
      question:
        "Numa rede de distribuição de conteúdo, o endereço de um documento embutido " +
        "carrega um identificador que muda toda vez que aquele documento muda. Para que " +
        "serve esse arranjo?",
      options: [
        "Serve para impedir que o servidor de origem seja consultado, porque o identificador novo é resolvido no próprio servidor de borda.",
        "Serve para autenticar o documento entregue, porque o identificador é o resumo criptográfico calculado sobre o conteúdo dele.",
        "Serve para distribuir a carga entre os servidores de borda, porque cada identificador aponta para um servidor diferente da rede.",
        "Serve para invalidar sem enviar mensagem, porque o nome novo não está na borda e obriga a buscar o documento na origem."
      ],
      answer: 3,
      explanation:
        "Mudar o identificador é mudar o nome do documento. O servidor de borda procura " +
        "um nome que nunca viu, não o encontra na cache e vai buscá-lo no servidor de " +
        "origem, sem que ninguém precise enviar aviso de invalidação. A versão antiga " +
        "fica guardada até ser descartada por desuso, já que ninguém mais a referencia."
    }
  ],

  glossary: [
    { term: "Replicação", definition: "Manutenção de cópias do mesmo dado em computadores diferentes, com o objetivo de melhorar o desempenho, aumentar a disponibilidade ou tolerar falhas." },
    { term: "Disponibilidade", definition: "Fração do tempo em que o serviço responde em prazo razoável. Com n servidores que falham de forma independente com probabilidade p, o objeto replicado atinge 1 menos p elevado a n." },
    { term: "Transparência de replicação", definition: "Propriedade pela qual o cliente enxerga um objeto lógico só e recebe um conjunto único de valores, sem saber quantas cópias físicas existem nem qual delas o atendeu." },
    { term: "Consistência estrita e replicação síncrona", definition: "Forma rigorosa de manter cópias iguais, em que a atualização é aplicada em todas elas como uma operação atômica única, ao custo de sincronização global antes de cada aplicação." },
    { term: "Réplica permanente", definition: "Cópia do conjunto inicial que constitui a loja de dados distribuída, criada de forma estática e duradoura, como o espelho de um sítio Web ou o agrupamento de servidores sem compartilhamento." },
    { term: "Réplica iniciada pelo servidor", definition: "Cópia criada por decisão de quem é dono do dado, para melhorar o desempenho onde a demanda aparece. Continua sendo desse tipo quando a decisão é delegada a uma rede de distribuição de conteúdo." },
    { term: "Réplica iniciada pelo cliente", definition: "Outro nome para a cache, que é o espaço local onde o cliente guarda temporariamente o que acabou de pedir. Quem cuida dela é o próprio cliente, e a loja de dados não tem obrigação de mantê-la em dia." },
    { term: "Protocolo de invalidação", definition: "Forma de propagação em que só um aviso de mudança atravessa a rede, sem o conteúdo novo. Gasta pouca banda e compensa quando há muitas escritas para cada leitura." },
    { term: "Concessão", definition: "Promessa que o servidor faz de empurrar atualizações de um dado durante um prazo determinado. Vencido o prazo, o cliente volta a perguntar, o que faz o sistema deslizar entre empurrar e puxar." },
    { term: "Gerenciador de réplica", definition: "Componente que contém réplicas num computador e executa operações diretamente sobre elas. Num ambiente cliente e servidor ele é o servidor, e muitas vezes precisa ser uma máquina de estados." },
    { term: "Front-end", definition: "Componente que recebe a requisição do cliente e troca mensagens com um ou mais gerenciadores de réplica. É ele que torna a replicação transparente para quem pede." },
    { term: "Máquina de estados", definition: "Gerenciador que aplica cada operação de forma atômica e cujo estado resultante é função apenas do estado inicial e da sequência de operações, sem depender de relógio, de sensor ou de escalonamento de threads." },
    { term: "Relação acontece antes", definition: "Ordem parcial dos eventos obtida ao encadear duas regras, a de que eventos do mesmo processo seguem a ordem local e a de que o envio de uma mensagem precede a recepção dela. Ela captura causalidade em potencial." },
    { term: "Carimbo de tempo vetorial", definition: "Vetor com uma posição por processo, comparado posição a posição, que permite decidir se um evento aconteceu antes de outro ou se os dois foram concorrentes. O tamanho dele cresce com o número de processos." },
    { term: "Ordem FIFO, causal e total", definition: "Garantias que a fase de coordenação pode oferecer. A FIFO preserva a sequência de emissão de cada front-end, a causal preserva a relação acontece antes e a total faz todos os gerenciadores aplicarem na mesma sequência." },
    { term: "Modo de visualização de grupo", definition: "Lista dos membros correntes de um grupo, gerada de novo a cada entrada ou saída. A exclusão acontece por suspeita, e não por certeza, porque uma falha de comunicação basta para tornar um processo inalcançável." },
    { term: "Comunicação com modo de visualização síncrono", definition: "Garantia de que os processos corretos entregam a mesma sequência de modos e o mesmo conjunto de mensagens dentro de cada modo, o que traça uma linha no tempo e permite decidir localmente diante de uma mudança de participação." },
    { term: "Capacidade de linearização", definition: "Critério de correção mais forte, que pede uma interposição das operações satisfazendo a especificação de uma cópia única e respeitando os tempos reais em que elas ocorreram." },
    { term: "Consistência sequencial", definition: "Critério mais fraco e realizável, que pede uma interposição satisfazendo a cópia única e respeitando a ordem do programa de cada cliente, sem recorrer ao tempo real." },
    { term: "Replicação passiva", definition: "Arranjo com um gerenciador primário que ordena, executa e envia o estado atualizado aos backups. Alcança linearização, atravessa f colapsos com f + 1 réplicas e pausa enquanto promove um substituto." },
    { term: "Replicação ativa", definition: "Arranjo com gerenciadores equivalentes que recebem as requisições por multicast confiável e totalmente ordenado e as processam de forma idêntica. Alcança consistência sequencial e pode mascarar respostas inventadas com 2f + 1 réplicas." },
    { term: "Arquitetura Gossip", definition: "Serviço de alta disponibilidade em que o front-end fala com o gerenciador que quiser e os gerenciadores trocam atualizações em mensagens periódicas de fofoca, com carimbos vetoriais garantindo que nenhum cliente ande para trás no tempo." },
    { term: "Transformação operacional", definition: "Ajuste em que uma ou mais operações de um conjunto conflitante são desfeitas ou alteradas para resolver o choque. No Bayou ela é guiada por uma verificação de dependência e um procedimento de integração escritos pela aplicação." },
    { term: "Grupo de armazenamento de volume disponível", definition: "No Coda, o subconjunto dos servidores de um volume que o cliente consegue alcançar naquele instante. Ele encolhe e cresce com as falhas, e a operação desconectada é definida como o estado em que ele fica vazio." },
    { term: "Vetor de versão", definition: "No Coda, vetor anexado a cada versão de arquivo com uma posição por servidor, em que cada posição estima quantas modificações aquele servidor conhece. Dois vetores em que nenhum domina o outro indicam conflito." },
    { term: "Capacidade de serialização de uma cópia", definition: "Exigência de que o efeito das transações sobre objetos replicados seja igual ao de executá-las uma de cada vez sobre um conjunto único de objetos. Difere da consistência sequencial por tratar de blocos, e não de operações avulsas." },
    { term: "Replicação de cópias disponíveis", definition: "Esquema em que a leitura vai a um gerenciador e a escrita vai a todos os que estiverem disponíveis. Tolera colapsos e exige validação local antes da confirmação, para evitar observações de falha incompatíveis." },
    { term: "Consenso de quórum", definition: "Esquema de votos por cópia em que a leitura reúne R votos e a escrita reúne W, com W acima da metade do total e R somado a W acima do total, o que força os quóruns a se sobreporem." },
    { term: "Partição virtual", definition: "Combinação do consenso de quórum com as cópias disponíveis. Se um subgrupo reúne os dois quóruns, ele passa a usar cópias disponíveis lá dentro, e cancela as transações em andamento quando a composição muda." },
    { term: "Rede de distribuição de conteúdo", definition: "Serviço de hospedagem que distribui e replica documentos de muitos sítios pela Internet, organizado como laço de controle que mede o desempenho, decide se precisa mudar e recoloca réplicas ou redireciona pedidos." }
  ],

  references: [
    "VAN STEEN, M.; TANENBAUM, A. S. Distributed Systems. 4. ed. (versão DS 4.03). distributed-systems.net, 2023. Cap. 7. Consistency and Replication, seções 7.1, 7.4 e 7.6 (pp. 392-395, 423-437 e 451-458). Fonte de conteúdo das seções 1, 2 e 7 deste tópico, de onde vêm as duas razões para replicar, a replicação como técnica de escala com o dilema da sincronização global, a separação entre colocar servidores e colocar conteúdo, os três anéis de réplicas, a comparação entre empurrar e puxar com as concessões, a invocação replicada e o caminho de caches da Web com as redes de distribuição de conteúdo e o servidor de borda.",
    "COULOURIS, G.; DOLLIMORE, J.; KINDBERG, T.; BLAIR, G. Sistemas Distribuídos: Conceitos e Projeto. 5. ed. Porto Alegre: Bookman, 2013. Cap. 18. Replicação (pp. 765-816). Esqueleto do tópico e fonte de conteúdo das seções 3 a 6, de onde vêm o modelo com réplicas, gerenciadores e front-ends, as cinco fases, a comunicação em grupo com modo de visualização síncrono, a linearização e a consistência sequencial, as replicações passiva e ativa, os estudos de caso do Gossip, do Bayou e do Coda, e as transações replicadas com o consenso de quórum de Gifford.",
    "COULOURIS, G. et al. Op. cit. Cap. 14. Tempo e Estados Globais, seção 14.4 (pp. 606-610). Prerrequisito lido para esta reescrita, fonte da relação acontece antes, do relógio lógico de Lamport e do carimbo de tempo vetorial, que a seção 3 apresenta no mínimo necessário para sustentar a ordem causal e a arquitetura Gossip.",
    "LAMPORT, L. Time, Clocks, and the Ordering of Events in a Distributed System. Communications of the ACM, v. 21, n. 7, 1978. Artigo original da relação acontece antes e do relógio lógico, citado pelas duas obras acima. Leitura complementar da seção 3 para quem quiser a construção completa.",
    "GIFFORD, D. K. Weighted Voting for Replicated Data. In: SOSP, 1979. Artigo original do consenso de quórum, de onde vêm as duas regras sobre R e W e as três configurações reproduzidas na tabela da seção 6. Leitura complementar para quem quiser as demonstrações e o estudo de desempenho."
  ]
};
