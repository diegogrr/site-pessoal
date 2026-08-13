/* ============================================================
   topic-09.js — Serviços de Nomes
   ------------------------------------------------------------
   Estrutura documentada no modelo topic-01.js (sections[] com
   slides[] opcionais, quiz[], glossary[], references[]).
   Fundamentação: manifesto em docs/fontes/topico-09.json.
   Hierarquia de fontes em docs/fontes/README.md — o esqueleto é
   o Coulouris (cap. 13) e o conteúdo é do van Steen (cap. 6),
   que tem 66 páginas contra 30 e organiza o assunto por classe
   de sistema de nomes. Ficam com o Coulouris os URIs, a
   navegação por multicast, a não recursiva controlada pelo
   servidor e a leitura do DNS como serviço que aceita ficar
   inconsistente. São exclusivos do van Steen a nomeação plana
   (seção 2) e a rede orientada a dados nomeados (fim da seção
   5). O GNS e o X.500 completo saíram; os cortes estão
   justificados no manifesto.
   ============================================================ */

window.SD = window.SD || {};
SD.content = SD.content || {};

SD.content["09"] = {

  sections: [
    {
      title: "Nome, identificador e endereço",
      html:
        "<p>O tópico anterior fechou com um serviço capaz de encontrar um arquivo a partir " +
        "do nome dele. Vale generalizar esse movimento, porque ele não é próprio de " +
        "arquivos. Num sistema distribuído, tudo tem nome. Computadores, impressoras, " +
        "discos, processos, usuários, caixas de correio, páginas Web, janelas gráficas e " +
        "conexões de rede são nomeados o tempo todo, e quase nenhuma operação começa sem " +
        "que alguém tenha dito de que coisa está falando.</p>" +
        "<p>A atribuição de nomes é um problema fácil de desprezar e absolutamente " +
        "fundamental. Dois processos só compartilham um recurso se conseguem nomeá-lo de " +
        "forma consistente, porque de outro modo cada um estaria operando sobre uma coisa " +
        "diferente sem perceber. Duas pessoas só se comunicam por meio do sistema se podem " +
        "dar nomes uma à outra, e é para isso que existe um endereço de correio " +
        "eletrônico.</p>" +
        "<p>Um <strong>serviço de nomes</strong> é um serviço distinto dos demais, que " +
        "recebe o nome de um recurso e devolve os atributos dele. O atributo mais pedido é " +
        "o endereço, mas não é o único. Este tópico trata de como esse serviço é " +
        "projetado, por que ele precisa ser distribuído e o que muda conforme o tipo de " +
        "nome que ele resolve.</p>" +
        "<h3>A entidade, o ponto de acesso e o endereço</h3>" +
        "<p>Antes de nomear, convém separar duas coisas que a linguagem do dia a dia " +
        "mistura. Uma <strong>entidade</strong> é aquilo de que se fala, como um serviço, " +
        "um arquivo ou uma pessoa. Para operar sobre uma entidade é preciso alcançá-la, e " +
        "isso acontece num <strong>ponto de acesso</strong>, que é outra entidade, de tipo " +
        "especial. O nome de um ponto de acesso chama-se <strong>endereço</strong>.</p>" +
        "<p>O telefone ajuda a fixar a distinção. A pessoa é a entidade, o aparelho é o " +
        "ponto de acesso e o número é o endereço. Muita gente tem vários números, cada um " +
        "correspondendo a um lugar onde é possível encontrá-la. Num sistema distribuído, o " +
        "ponto de acesso costuma ser uma máquina executando um servidor, e o endereço é a " +
        "combinação de endereço de rede com número de porta que o tópico 04 usou para " +
        "abrir soquetes.</p>" +
        '<figure class="figura" id="fig-nome-entidade">' +
        '<svg viewBox="0 0 600 260" role="img" aria-labelledby="fig-nome-entidade-titulo">' +
        '<title id="fig-nome-entidade-titulo">No alto, uma caixa com o nome ' +
        "www.exemplo.br aponta para baixo, para uma caixa que representa a entidade, o " +
        "serviço de páginas. Dessa caixa saem duas setas, cada uma chegando a um ponto de " +
        "acesso diferente, e dentro de cada ponto de acesso aparece um endereço, formado " +
        "por endereço de rede e porta. Uma linha no rodapé diz que trocar de ponto de " +
        "acesso não muda o nome.</title>" +
        '<rect class="caixa-destaque" x="200" y="12" width="200" height="36" rx="8"/>' +
        '<text x="300" y="36" text-anchor="middle" font-size="13">www.exemplo.br</text>' +
        '<path class="traco" d="M300 48 L300 68"/>' +
        '<path class="seta" d="M294 68 L306 68 L300 78 Z"/>' +
        '<text class="rotulo-secundario" x="312" y="64" font-size="11">nome, e não endereço</text>' +
        '<rect class="caixa" x="170" y="80" width="260" height="44" rx="8"/>' +
        '<text x="300" y="108" text-anchor="middle" font-size="13">Entidade (o serviço de páginas)</text>' +
        '<path class="traco" d="M240 124 L240 150"/>' +
        '<path class="seta" d="M234 150 L246 150 L240 160 Z"/>' +
        '<path class="traco" d="M360 124 L360 150"/>' +
        '<path class="seta" d="M354 150 L366 150 L360 160 Z"/>' +
        '<rect class="caixa" x="110" y="162" width="180" height="64" rx="8"/>' +
        '<text x="200" y="184" text-anchor="middle" font-size="12">Ponto de acesso</text>' +
        '<rect class="caixa-destaque" x="128" y="194" width="144" height="24" rx="6"/>' +
        '<text x="200" y="211" text-anchor="middle" font-size="12">192.0.2.10:443</text>' +
        '<rect class="caixa" x="310" y="162" width="180" height="64" rx="8"/>' +
        '<text x="400" y="184" text-anchor="middle" font-size="12">Ponto de acesso</text>' +
        '<rect class="caixa-destaque" x="328" y="194" width="144" height="24" rx="6"/>' +
        '<text x="400" y="211" text-anchor="middle" font-size="12">198.51.100.7:443</text>' +
        '<text class="rotulo-secundario" x="300" y="248" text-anchor="middle" ' +
        'font-size="12">trocar de ponto de acesso não muda o nome de cima</text>' +
        "</svg>" +
        "<figcaption>O nome aponta para a entidade e os endereços apontam para os pontos " +
        "de acesso. É essa folga entre os dois níveis que permite mudar a instalação sem " +
        "avisar quem usa o serviço.</figcaption>" +
        "</figure>" +
        "<p>A figura mostra por que usar o endereço como nome habitual é uma escolha ruim, " +
        "e há duas razões independentes para isso. A primeira é que uma entidade muda de " +
        "ponto de acesso com facilidade. Um servidor passa a rodar em outra máquina numa " +
        "reorganização qualquer, um computador móvel recebe outro endereço ao trocar de " +
        "rede, e quem muda de provedor muda de endereço de correio eletrônico. No instante " +
        "em que isso acontece, toda referência escrita com o endereço antigo passa a " +
        "apontar para o nada, ou, pior, para outra entidade que herdou aquele ponto de " +
        "acesso.</p>" +
        "<p>A segunda razão é que uma entidade pode oferecer vários pontos de acesso ao " +
        "mesmo tempo. Uma organização que distribui o serviço Web por vários servidores " +
        "tem vários endereços igualmente válidos, e nenhum deles é o melhor candidato a " +
        "representar o serviço. O nome único resolve os dois problemas de uma vez, e por " +
        "isso se diz que ele é <strong>independente de localização</strong>, quer dizer, " +
        "não depende dos endereços dos pontos de acesso que a entidade oferece.</p>" +
        "<h3>O identificador promete o que o nome comum não promete</h3>" +
        "<p>Existe uma pergunta que nomes legíveis não conseguem responder. Se dois " +
        "processos guardam referências para alguma entidade, como decidir se as duas " +
        "referências apontam para a mesma coisa? Comparar os nomes não basta, porque o " +
        "nome João Silva não identifica uma pessoa só, e dois arquivos chamados " +
        "<code>relatorio.pdf</code> em máquinas diferentes nada têm em comum.</p>" +
        "<p>Um <strong>identificador</strong> é um nome que carrega três garantias, e são " +
        "elas que tornam a comparação confiável.</p>" +
        "<ul>" +
        "<li>Um identificador <strong>refere-se a no máximo uma entidade</strong>, de modo " +
        "que ele nunca é ambíguo.</li>" +
        "<li>Cada entidade <strong>é referida por no máximo um identificador</strong>, de " +
        "modo que não existem dois modos de nomear a mesma coisa.</li>" +
        "<li>Um identificador <strong>sempre se refere à mesma entidade</strong>, porque " +
        "nunca é reaproveitado depois que aquela entidade deixa de existir.</li>" +
        "</ul>" +
        "<p>Com essas três garantias, comparar dois identificadores é suficiente para " +
        "decidir se os processos falam da mesma entidade. O número de telefone mostra o " +
        "que acontece quando a terceira garantia falta. Ele é razoavelmente estável, e " +
        "ainda assim é reatribuído, então a padaria nova de Bob recebe durante meses as " +
        "ligações destinadas ao antiquário antigo de Alice. Um endereço reatribuível não " +
        "serve como identificador, pela mesma razão.</p>" +
        "<p>Needham separa ainda o <strong>nome puro</strong> dos demais. Um nome puro é um " +
        "padrão de bits que não diz nada sobre a coisa nomeada e que, por isso, " +
        "<em>sempre</em> precisa ser pesquisado antes de ser usado. Um nome que não é puro " +
        "carrega alguma informação embutida, muitas vezes a localização. Repare que as duas " +
        "classificações são independentes. Um identificador não precisa ser puro, porque " +
        "nada impede que ele carregue conteúdo, e um nome puro não precisa ser " +
        "identificador, porque nada garante que ele deixe de ser reaproveitado.</p>" +
        "<p>A tabela abaixo reúne os três tipos de nome que aparecem em qualquer sistema " +
        "distribuído, com a pergunta que interessa em cada linha, que é para quem aquele " +
        "nome foi feito.</p>" +
        '<div class="tabela-rolagem">' +
        '<table class="tabela-conteudo" id="tab-tipos-de-nome">' +
        "<tr><th>Tipo de nome</th><th>Para quem ele foi feito</th><th>Onde ele " +
        "decepciona</th></tr>" +
        "<tr><td>Nome legível por pessoas</td><td>Serve a quem digita, lê e conversa sobre " +
        "o sistema, e por isso é uma cadeia de caracteres escolhida por gente.</td>" +
        "<td>Não garante unicidade, porque duas entidades diferentes podem receber o mesmo " +
        "nome sem que ninguém perceba.</td></tr>" +
        "<tr><td>Identificador</td><td>Serve a programas que precisam decidir se duas " +
        "referências apontam para a mesma entidade.</td><td>Não diz nada a quem lê, e " +
        "costuma ser uma cadeia de bits que ninguém consegue soletrar ao telefone.</td></tr>" +
        "<tr><td>Endereço</td><td>Serve a quem vai de fato alcançar a entidade, porque " +
        "nomeia o ponto de acesso e diz como chegar até ele.</td><td>Deixa de valer assim " +
        "que a entidade muda de ponto de acesso, ou que o ponto de acesso é entregue a " +
        "outra entidade.</td></tr>" +
        "</table>" +
        "</div>" +
        "<p>A tabela deixa ver que nenhum dos três é dispensável. Um sistema real usa os " +
        "três ao mesmo tempo e passa boa parte do tempo convertendo um no outro, que é " +
        "justamente o serviço que este tópico estuda.</p>" +
        "<h3>Resolver, vincular e a cadeia que quase ninguém enxerga</h3>" +
        "<p>Diz-se que um nome foi <strong>resolvido</strong> quando ele é convertido nos " +
        "dados da entidade que nomeia. Esses dados são os <strong>atributos</strong>, e um " +
        "atributo é o valor de uma propriedade da entidade. A associação entre um nome e os " +
        "atributos correspondentes chama-se <strong>vínculo</strong>, e é o vínculo que o " +
        "serviço de nomes guarda. Um nome de domínio vinculado ao endereço de rede de um " +
        "computador é o caso mais familiar.</p>" +
        "<p>O detalhe fácil de perder é que um endereço costuma ser apenas mais um nome a " +
        "resolver. Abrir uma página exige uma sequência de resoluções encadeadas, cada uma " +
        "feita por um serviço diferente, com um espaço de nomes próprio.</p>" +
        '<figure class="figura" id="fig-cadeia-resolucao">' +
        '<svg viewBox="0 0 600 250" role="img" aria-labelledby="fig-cadeia-resolucao-titulo">' +
        '<title id="fig-cadeia-resolucao-titulo">Três linhas empilhadas, cada uma com uma ' +
        "caixa à esquerda, uma seta ao centro e uma caixa à direita. Na primeira linha, o " +
        "nome www.exemplo.br entra, o DNS resolve e sai o endereço de rede 192.0.2.10. Na " +
        "segunda linha, esse mesmo endereço entra, o ARP resolve e sai o endereço físico da " +
        "placa. Na terceira linha, o caminho barra aulas barra 09.html entra, o sistema de " +
        "arquivos do servidor resolve e sai o arquivo. Uma frase no rodapé observa que o " +
        "que sai de uma linha entra na seguinte.</title>" +
        '<rect class="caixa" x="14" y="24" width="204" height="38" rx="8"/>' +
        '<text x="116" y="48" text-anchor="middle" font-size="12">www.exemplo.br</text>' +
        '<path class="traco" d="M218 43 L358 43"/>' +
        '<path class="seta" d="M358 37 L358 49 L370 43 Z"/>' +
        '<text class="rotulo-secundario" x="288" y="34" text-anchor="middle" ' +
        'font-size="11">DNS</text>' +
        '<rect class="caixa" x="374" y="24" width="204" height="38" rx="8"/>' +
        '<text x="476" y="48" text-anchor="middle" font-size="12">192.0.2.10</text>' +
        '<rect class="caixa" x="14" y="99" width="204" height="38" rx="8"/>' +
        '<text x="116" y="123" text-anchor="middle" font-size="12">192.0.2.10</text>' +
        '<path class="traco" d="M218 118 L358 118"/>' +
        '<path class="seta" d="M358 112 L358 124 L370 118 Z"/>' +
        '<text class="rotulo-secundario" x="288" y="109" text-anchor="middle" ' +
        'font-size="11">ARP</text>' +
        '<rect class="caixa" x="374" y="99" width="204" height="38" rx="8"/>' +
        '<text x="476" y="123" text-anchor="middle" font-size="12">2a:60:8c:02:b0:5a</text>' +
        '<rect class="caixa" x="14" y="174" width="204" height="38" rx="8"/>' +
        '<text x="116" y="198" text-anchor="middle" font-size="12">/aulas/09.html</text>' +
        '<path class="traco" d="M218 193 L358 193"/>' +
        '<path class="seta" d="M358 187 L358 199 L370 193 Z"/>' +
        '<text class="rotulo-secundario" x="288" y="184" text-anchor="middle" ' +
        'font-size="11">sistema de arquivos</text>' +
        '<rect class="caixa-destaque" x="374" y="174" width="204" height="38" rx="8"/>' +
        '<text x="476" y="198" text-anchor="middle" font-size="12">o arquivo pedido</text>' +
        '<text class="rotulo-secundario" x="300" y="236" text-anchor="middle" ' +
        'font-size="12">o que sai de uma etapa é o nome que entra na seguinte</text>' +
        "</svg>" +
        "<figcaption>Nenhum serviço resolve a cadeia inteira. Cada etapa tem o seu " +
        "resolvedor, o seu espaço de nomes e o seu modo de falhar, e o endereço de uma " +
        "etapa é o nome da próxima.</figcaption>" +
        "</figure>" +
        "<p>O tópico 03 já havia apresentado o protocolo de resolução de endereços, " +
        "conhecido pela sigla ARP, como aquele que descobre o endereço físico de uma placa " +
        "a partir do endereço de rede. O que a figura acrescenta é o " +
        "lugar dele numa história maior. E a última etapa é a do tópico 08, porque quem " +
        "resolve o caminho dentro do servidor é o sistema de arquivos, com o módulo de " +
        "diretório traduzindo nomes em identificadores internos.</p>" +
        "<h3>URI, URL e URN</h3>" +
        "<p>A Web precisou de um jeito uniforme de identificar recursos, para que um " +
        "programa só, o navegador, conseguisse processar todos eles. Dessa necessidade " +
        "nasceram os <strong>identificadores uniformes de recurso</strong>, conhecidos pela " +
        "sigla URI. A sintaxe global deles incorpora muitos <em>esquemas</em> diferentes, " +
        "como <code>http</code>, <code>mailto</code>, <code>tel</code> e <code>urn</code>, " +
        "e essa é a jogada de projeto que interessa aqui.</p>" +
        "<p>A vantagem da uniformidade é que inventar um esquema novo não quebra o software " +
        "existente. Se alguém definir um esquema <code>widget</code>, os identificadores " +
        "que começarem por <code>widget:</code> obedecerão à sintaxe global e às regras " +
        "próprias do esquema. Um programa antigo, que nunca ouviu falar de widget, " +
        "continuará capaz de guardá-los numa lista e de reconhecê-los como identificadores " +
        "válidos. Foi assim que números de telefone entraram na Web, na forma " +
        "<code>tel:+55-11-5555-1212</code>, e viraram links que iniciam ligações.</p>" +
        "<p>Dentro do guarda-chuva dos URIs convivem duas famílias com propósitos opostos. " +
        "O <strong>localizador uniforme de recurso</strong>, conhecido pela sigla URL, traz " +
        "informação de localização e o método de acesso, como em " +
        "<code>http://www.exemplo.br/</code>. Ele é eficiente para alcançar o recurso, e o " +
        "preço aparece quando o recurso é apagado ou muda de lugar, porque todos os links " +
        "que apontavam para ali ficam quebrados. Pior que o erro é o caso silencioso, em " +
        "que outro recurso passou a ocupar aquela localização e o leitor recebe algo que " +
        "não era o que se prometia.</p>" +
        "<p>O <strong>nome uniforme de recurso</strong>, conhecido pela sigla URN, é a " +
        "família oposta. Ele é um nome puro, como <code>urn:ISBN:0-201-62433-8</code>, que " +
        "identifica um livro sem dizer onde encontrá-lo. Justamente por ser puro, ele exige " +
        "um serviço de resolução para virar alguma coisa acessível. Existem serviços assim, " +
        "e nenhum deles se tornou amplamente usado.</p>" +
        "<p>O debate segue aberto e vale a pena guardá-lo. De um lado se diz que bons URLs " +
        "não mudam, e que a solução é atribuir localizações com compromisso de " +
        "permanência. Do outro se observa que nem todo mundo está em posição de dar essa " +
        "garantia, porque ela exige manter o controle de um domínio e administrar os " +
        "recursos com cuidado por décadas.</p>" +
        "<h3>Duas maneiras de resolver um nome</h3>" +
        "<p>Chegamos ao tema central do tópico. Dado um nome, como obter o endereço? Existem " +
        "duas respostas, e o resto do material se organiza em torno delas.</p>" +
        "<p>A primeira mantém uma tabela de pares formados por nome e endereço, em geral " +
        "distribuída por muitas máquinas, e a resolução consiste em consultar essa tabela. " +
        "É o caminho do DNS e da maior parte dos serviços de nomes que existem. A segunda " +
        "não guarda tabela nenhuma no sentido usual, e roteia o pedido aos poucos na " +
        "direção do endereço associado ao nome, ou mesmo direto até o ponto de acesso. É o " +
        "caminho dos sistemas peer to peer estruturados e das redes orientadas a conteúdo, " +
        "e nele a fronteira entre resolver um nome e rotear uma mensagem simplesmente " +
        "desaparece.</p>" +
        "<p>As quatro seções seguintes percorrem esse território na ordem em que ele fica " +
        "mais fácil de entender. A seção 2 trata dos nomes planos, que são os que não " +
        "carregam estrutura alguma e obrigam a inventar mecanismos de localização. A seção " +
        "3 trata dos nomes estruturados, que são os que as pessoas usam, e da máquina de " +
        "resolução que eles permitem. A seção 4 abre o DNS, que é o maior serviço de nomes " +
        "em operação. E a seção 5 inverte a pergunta, indo dos atributos para o nome, e " +
        "termina com a proposta de dispensar o endereço.</p>",
      slides: [
        {
          title: "Por que nomear é um problema de projeto",
          html:
            "<ul>" +
            "<li>Num sistema distribuído tudo tem nome, de computadores a caixas de " +
            "correio</li>" +
            "<li>Dois processos só compartilham um recurso se conseguem nomeá-lo de forma " +
            "consistente</li>" +
            "<li>O <strong>serviço de nomes</strong> recebe um nome e devolve os atributos " +
            "da entidade</li>" +
            "<li>O atributo mais pedido é o endereço, e não é o único</li>" +
            "</ul>"
        },
        {
          title: "Entidade, ponto de acesso e endereço",
          ref: "fig-nome-entidade",
          html:
            "<ul>" +
            "<li>O endereço é o nome de um ponto de acesso, e não o nome da entidade</li>" +
            "<li>A entidade troca de ponto de acesso, e pode oferecer vários ao mesmo " +
            "tempo</li>" +
            "</ul>"
        },
        {
          title: "O identificador promete três coisas",
          html:
            "<ul>" +
            "<li>Refere-se a no máximo uma entidade</li>" +
            "<li>Cada entidade é referida por no máximo um identificador</li>" +
            "<li>Nunca é reaproveitado, então sempre aponta para a mesma entidade</li>" +
            "<li>Com isso, comparar dois identificadores decide se são a mesma coisa</li>" +
            "<li>O número de telefone falha na terceira, porque é reatribuído</li>" +
            "<li><strong>Nome puro</strong> não diz nada sobre a entidade e sempre precisa " +
            "ser pesquisado</li>" +
            "</ul>"
        },
        {
          title: "Os três tipos de nome",
          ref: "tab-tipos-de-nome"
        },
        {
          title: "Resolver é uma cadeia, não um passo",
          ref: "fig-cadeia-resolucao",
          html:
            "<ul>" +
            "<li>O endereço de uma etapa é o nome que entra na etapa seguinte</li>" +
            "<li>Cada etapa tem resolvedor, espaço de nomes e modo de falhar próprios</li>" +
            "</ul>"
        },
        {
          title: "URI, URL e URN",
          html:
            "<ul>" +
            "<li>O <strong>URI</strong> dá sintaxe uniforme a muitos esquemas, e esquema " +
            "novo não quebra software antigo</li>" +
            "<li>O <strong>URL</strong> traz localização e método de acesso, ao preço dos " +
            "links quebrados</li>" +
            "<li>O <strong>URN</strong> é nome puro e exige um serviço de resolução</li>" +
            "<li>O debate segue aberto entre garantir permanência e admitir que nem todos " +
            "podem garanti-la</li>" +
            "</ul>"
        },
        {
          title: "Duas maneiras de resolver, e o roteiro do tópico",
          html:
            "<ul>" +
            "<li>Consultar uma tabela distribuída de pares, que é o caminho do DNS</li>" +
            "<li>Rotear o pedido até o endereço, e aí resolver e rotear viram a mesma " +
            "coisa</li>" +
            "<li>Seção 2, nomes planos. Seção 3, nomes estruturados. Seção 4, o DNS</li>" +
            "<li>Seção 5, do atributo ao nome, e a proposta de dispensar o endereço</li>" +
            "</ul>"
        }
      ]
    },
    {
      title: "Nomes planos, quando o nome não diz onde procurar",
      html:
        "<p>Identificadores costumam ser cadeias de bits sorteadas ao acaso, e por isso são " +
        "chamados de <strong>nomes planos</strong>, ou não estruturados. A propriedade que " +
        "define esse tipo de nome é a ausência de qualquer informação sobre onde a entidade " +
        "está. Um nome de domínio ao menos diz que a resposta está em algum lugar sob " +
        "<code>.br</code>. Um nome plano não diz nem isso.</p>" +
        "<p>A pergunta desta seção é, portanto, bem concreta. Tendo apenas o identificador " +
        "de uma entidade, como descobrir o endereço dela? O assunto fica interessante " +
        "quando a entidade se move, porque aí não adianta ter registrado o endereço uma vez " +
        "e guardado. As cinco respostas que seguem foram inventadas em ordem crescente de " +
        "escala, e cada uma resolve o defeito da anterior cobrando um preço novo.</p>" +
        "<h3>Perguntar a todo mundo</h3>" +
        "<p>A solução mais simples é a <strong>difusão</strong>. Numa rede local, em que " +
        "todas as máquinas estão ligadas ao mesmo meio, basta enviar a todas uma mensagem " +
        "com o identificador procurado e pedir que cada uma verifique se o possui. Só quem " +
        "oferece um ponto de acesso para aquela entidade responde, e a resposta traz o " +
        "endereço.</p>" +
        "<p>Esse é exatamente o funcionamento do ARP, que o tópico 03 apresentou. Uma " +
        "máquina difunde na rede local a pergunta sobre quem é o dono de um endereço de " +
        "rede, e o dono responde com o endereço físico da placa dele. A técnica é tão " +
        "simples que continua em uso quarenta anos depois.</p>" +
        "<p>O defeito aparece com o crescimento da rede. Além do desperdício de banda com " +
        "mensagens de pergunta, o problema sério é que máquinas demais são interrompidas " +
        "por perguntas que não sabem responder. Trocar a difusão pelo <strong>multicast</strong> " +
        "alivia os dois males, porque restringe a pergunta a um grupo. O tópico 04 mostrou " +
        "que a rede oferece esse serviço tanto no nível de enlace quanto no nível de rede, " +
        "com máquinas entrando num grupo identificado por um endereço de multicast.</p>" +
        "<p>O multicast também rende um truque útil. Se a mesma entidade estiver replicada, " +
        "o pedido enviado ao grupo faz cada réplica responder com o endereço dela, e " +
        "escolher a que respondeu primeiro é uma maneira grosseira de escolher a mais " +
        "próxima. O tópico 10 vai mostrar que escolher a réplica mais próxima é bem menos " +
        "simples do que essa aproximação sugere.</p>" +
        "<h3>Deixar um bilhete no lugar antigo</h3>" +
        "<p>Uma segunda ideia serve a entidades que se movem com frequência e chama-se " +
        "<strong>ponteiro de encaminhamento</strong>. Quando a entidade sai de A e vai para " +
        "B, ela deixa em A uma referência para a nova localização. Achado o primeiro " +
        "endereço por um serviço de nomes comum, o cliente segue a corrente de ponteiros " +
        "até o fim, sem precisar saber que ela existe.</p>" +
        "<p>A simplicidade cobra três preços. A corrente de uma entidade muito móvel fica " +
        "tão longa que percorrê-la sai mais caro que procurar do zero. Todos os lugares " +
        "intermediários precisam manter o pedaço deles da corrente enquanto ela for " +
        "necessária, mesmo já não tendo nada a ver com a entidade. E qualquer elo perdido " +
        "torna a entidade inalcançável, o que faz da corrente um objeto frágil justamente " +
        "onde ela é comprida. Sistemas que usam a técnica precisam de mecanismos separados " +
        "para encurtar correntes de tempos em tempos.</p>" +
        "<h3>Ter uma casa que sabe onde você está</h3>" +
        "<p>Para redes de grande porte, a abordagem popular é dar à entidade uma " +
        "<strong>casa</strong>, que é um lugar fixo encarregado de saber a localização " +
        "atual dela. Na prática, a casa costuma ser o lugar onde a entidade foi criada. O " +
        "exemplo real é o Mobile IP, o mecanismo que mantém válido o endereço de rede de um " +
        "computador móvel enquanto ele muda de rede.</p>" +
        '<figure class="figura" id="fig-mobile-ip">' +
        '<svg viewBox="0 0 600 260" role="img" aria-labelledby="fig-mobile-ip-titulo">' +
        '<title id="fig-mobile-ip-titulo">Três participantes lado a lado no alto, o ' +
        "cliente à esquerda, a casa do computador móvel ao centro e a localização atual à " +
        "direita, cada um com uma linha de vida descendo. Quatro setas horizontais mostram " +
        "a sequência. A primeira vai do cliente à casa com o pacote endereçado ao endereço " +
        "fixo. A segunda volta da casa ao cliente informando a localização atual. A " +
        "terceira vai da casa à localização atual com o pacote encapsulado. A quarta vai " +
        "direto do cliente à localização atual, com os pacotes seguintes.</title>" +
        '<rect class="caixa" x="20" y="16" width="140" height="42" rx="8"/>' +
        '<text x="90" y="42" text-anchor="middle" font-size="12">Cliente</text>' +
        '<rect class="caixa" x="230" y="16" width="160" height="42" rx="8"/>' +
        '<text x="310" y="42" text-anchor="middle" font-size="12">Casa do móvel</text>' +
        '<rect class="caixa-destaque" x="440" y="16" width="140" height="42" rx="8"/>' +
        '<text x="510" y="42" text-anchor="middle" font-size="12">Onde ele está</text>' +
        '<path class="traco" d="M90 58 L90 236" stroke-dasharray="4 5"/>' +
        '<path class="traco" d="M310 58 L310 236" stroke-dasharray="4 5"/>' +
        '<path class="traco" d="M510 58 L510 236" stroke-dasharray="4 5"/>' +
        '<path class="traco" d="M90 100 L302 100"/>' +
        '<path class="seta" d="M302 94 L302 106 L312 100 Z"/>' +
        '<text class="rotulo-secundario" x="200" y="92" text-anchor="middle" ' +
        'font-size="11">1. pacote para o endereço fixo</text>' +
        '<path class="traco" d="M310 140 L98 140"/>' +
        '<path class="seta" d="M98 134 L98 146 L88 140 Z"/>' +
        '<text class="rotulo-secundario" x="200" y="132" text-anchor="middle" ' +
        'font-size="11">2. a casa informa a localização atual</text>' +
        '<path class="traco" d="M310 180 L502 180"/>' +
        '<path class="seta" d="M502 174 L502 186 L512 180 Z"/>' +
        '<text class="rotulo-secundario" x="410" y="172" text-anchor="middle" ' +
        'font-size="11">3. encapsula e reencaminha</text>' +
        '<path class="traco" d="M90 220 L502 220"/>' +
        '<path class="seta" d="M502 214 L502 226 L512 220 Z"/>' +
        '<text class="rotulo-secundario" x="296" y="212" text-anchor="middle" ' +
        'font-size="11">4. os pacotes seguintes vão direto</text>' +
        "</svg>" +
        "<figcaption>A casa é consultada uma vez e sai do caminho. O ganho da etapa 4 é " +
        "grande, e é ele que torna a abordagem viável apesar do desvio inicial.</figcaption>" +
        "</figure>" +
        "<p>O computador móvel mantém sempre o mesmo endereço de rede, e todo tráfego " +
        "destinado a ele chega primeiro ao <strong>agente domiciliar</strong>, que fica na " +
        "rede correspondente àquele endereço. Ao mudar de rede, o computador pede um " +
        "endereço temporário e registra esse endereço na casa. Quando um pacote chega, a " +
        "casa consulta a localização atual e, se ela for outra rede, encapsula o pacote " +
        "dentro de outro pacote endereçado ao endereço temporário. Ao mesmo tempo, ela " +
        "avisa quem enviou onde o destinatário está agora, e é por isso que a quarta etapa " +
        "da figura existe.</p>" +
        "<p>O que torna o mecanismo elegante é ele ser invisível para a aplicação. O " +
        "programa continua usando o endereço original, e quem cuida do redirecionamento é " +
        "software de comunicação abaixo dele. Do outro lado, o pacote encapsulado é " +
        "desembrulhado e entregue como se tivesse chegado ao endereço de sempre. É " +
        "transparência de localização obtida na camada de rede.</p>" +
        "<p>Duas desvantagens acompanham a ideia. A primeira é de latência, porque o " +
        "cliente precisa falar com a casa antes de falar com a entidade, e a casa pode " +
        "estar num continente diferente dos dois. A segunda é a rigidez da casa fixa. É " +
        "preciso garantir que ela sempre exista, e o caso ruim é o da entidade que se muda " +
        "definitivamente para longe, deixando a casa num lugar que não faz mais sentido. " +
        "Registrar a casa num serviço de nomes comum ameniza o problema, porque aí a " +
        "localização da casa também pode mudar, e como ela é estável o resultado da " +
        "consulta pode ficar em cache por muito tempo.</p>" +
        "<h3>A tabela hash distribuída, em que resolver é rotear</h3>" +
        "<p>As três soluções anteriores guardam, em algum lugar, um registro que diz onde a " +
        "entidade está. A <strong>tabela hash distribuída</strong> troca esse registro por " +
        "um cálculo. A ideia é que o próprio identificador determine, por aritmética, qual " +
        "nó da rede é responsável por ele, de modo que ninguém precise procurar às cegas. " +
        "O sistema Chord é o representante mais fácil de explicar.</p>" +
        "<p>No Chord, nós e chaves recebem identificadores sorteados de um mesmo espaço de " +
        "m bits, com m valendo 128 ou 160 conforme a função de resumo usada. Imagine esses " +
        "identificadores dispostos em círculo. A entidade de chave k fica sob a jurisdição " +
        "do nó de menor identificador maior ou igual a k, que é chamado de " +
        "<strong>sucessor</strong> de k. Toda a operação do sistema se reduz a encontrar " +
        "esse sucessor.</p>" +
        "<p>A maneira ingênua de encontrá-lo é cada nó conhecer apenas o vizinho seguinte e " +
        "repassar o pedido adiante até chegar ao responsável. Funciona e não escala, porque " +
        "um pedido percorre em média metade do anel. Conhecer também o vizinho anterior " +
        "corta esse número pela metade, o que continua longe do suficiente.</p>" +
        "<p>A saída do Chord é dar a cada nó uma <strong>tabela de dedos</strong>, que é uma " +
        "lista de atalhos cuja distância dobra a cada entrada. A entrada de índice i aponta " +
        "para o primeiro nó que vem depois do nó atual somado a dois elevado a i menos um. " +
        "Assim, um nó conhece bem a vizinhança imediata e conhece, de longe em longe, " +
        "pontos cada vez mais distantes do anel.</p>" +
        '<figure class="figura" id="fig-chord">' +
        '<svg viewBox="0 0 600 340" role="img" aria-labelledby="fig-chord-titulo">' +
        '<title id="fig-chord-titulo">Um anel com nove nós marcados, numerados 1, 4, 9, ' +
        "11, 14, 18, 20, 21 e 28 num espaço de 32 identificadores. Do nó 1 saem três " +
        "cordas que atravessam o anel, uma curta até o nó 4, uma média até o nó 9 e uma " +
        "longa até o nó 18. As cordas estão rotuladas com as distâncias mais um e mais " +
        "dois, mais quatro e mais oito, e mais dezesseis, mostrando que a distância do " +
        "atalho dobra a cada entrada da tabela.</title>" +
        '<circle cx="300" cy="165" r="120" fill="none" stroke="currentColor" ' +
        'stroke-opacity="0.25" stroke-width="1.5"/>' +
        '<path class="traco" d="M323 47 L385 80" stroke-dasharray="5 4"/>' +
        '<path class="traco" d="M323 47 L418 188" stroke-dasharray="5 4"/>' +
        '<path class="traco" d="M323 47 L254 276" stroke-width="2.5"/>' +
        '<circle cx="323" cy="47" r="9" class="caixa-destaque"/>' +
        '<circle cx="385" cy="80" r="7" class="caixa"/>' +
        '<circle cx="418" cy="188" r="7" class="caixa"/>' +
        '<circle cx="400" cy="232" r="7" class="caixa"/>' +
        '<circle cx="346" cy="276" r="7" class="caixa"/>' +
        '<circle cx="254" cy="276" r="7" class="caixa"/>' +
        '<circle cx="215" cy="250" r="7" class="caixa"/>' +
        '<circle cx="200" cy="232" r="7" class="caixa"/>' +
        '<circle cx="215" cy="80" r="7" class="caixa"/>' +
        '<text x="330" y="24" text-anchor="middle" font-size="12">1</text>' +
        '<text x="404" y="62" text-anchor="middle" font-size="12">4</text>' +
        '<text x="443" y="196" text-anchor="middle" font-size="12">9</text>' +
        '<text x="422" y="246" text-anchor="middle" font-size="12">11</text>' +
        '<text x="358" y="300" text-anchor="middle" font-size="12">14</text>' +
        '<text x="242" y="300" text-anchor="middle" font-size="12">18</text>' +
        '<text x="196" y="268" text-anchor="middle" font-size="12">20</text>' +
        '<text x="176" y="240" text-anchor="middle" font-size="12">21</text>' +
        '<text x="194" y="62" text-anchor="middle" font-size="12">28</text>' +
        '<text class="rotulo-secundario" x="368" y="58" font-size="11">+1 e +2</text>' +
        '<text class="rotulo-secundario" x="392" y="120" font-size="11">+4 e +8</text>' +
        '<text class="rotulo-secundario" x="252" y="150" font-size="11">+16</text>' +
        '<text class="rotulo-secundario" x="300" y="330" text-anchor="middle" ' +
        'font-size="12">a distância de cada atalho dobra, e o anel tem 32 posições</text>' +
        "</svg>" +
        "<figcaption>Os atalhos do nó 1, num anel de 32 posições. Procurar a chave 26 leva " +
        "o pedido pelo atalho longo até o nó 18, e de lá em saltos cada vez menores até o " +
        "nó 28, que é o responsável.</figcaption>" +
        "</figure>" +
        "<p>Acompanhe a busca da chave 26 a partir do nó 1. O nó 1 percebe que 26 está além " +
        "do seu atalho mais longo e repassa o pedido ao nó 18. O nó 18 escolhe entre os " +
        "atalhos dele o que não passa de 26 e repassa ao nó 20, que repassa ao 21, que " +
        "repassa ao 28. O nó 28 é o sucessor de 26 e devolve o próprio endereço a quem " +
        "iniciou a busca. Cada salto corta pelo menos metade da distância que faltava, e é " +
        "daí que sai o resultado que interessa, porque uma busca custa da ordem do " +
        "logaritmo do número de nós.</p>" +
        "<p>Entrar e sair do anel é simples. Um nó que quer entrar contata qualquer nó já " +
        "presente e pede a resolução do próprio identificador somado a um, o que lhe diz " +
        "entre quem ele deve se inserir. A complexidade está em manter as tabelas de dedos " +
        "atualizadas, e o Chord resolve isso com um processo de segundo plano que refaz " +
        "cada entrada de tempos em tempos e confere se o sucessor imediato ainda está " +
        "vivo.</p>" +
        "<p>Vale destacar o que aconteceu aqui, porque é a observação mais importante desta " +
        "seção. Não houve tabela de nomes, não houve servidor de nomes e não houve consulta " +
        "seguida de acesso. O pedido foi <em>roteado</em> pela rede lógica até o nó " +
        "responsável, guiado apenas pelo próprio identificador. Resolver o nome e encaminhar " +
        "a mensagem viraram a mesma operação, e a seção 5 vai levar essa ideia até o fim.</p>" +
        "<p>O ponto fraco do Chord é ignorar a rede física. Se o nó 1 estiver em Amsterdã, o " +
        "18 em San Diego, o 20 em Amsterdã de novo e o 21 em San Diego, resolver a chave 26 " +
        "atravessa o oceano três vezes, quando uma bastaria. Existem três famílias de " +
        "correção. Atribuir identificadores conforme a topologia aproxima no anel os nós " +
        "próximos na rede, e cria o risco de uma falha correlacionada abrir um buraco " +
        "inteiro no espaço de identificadores. Guardar várias alternativas por entrada da " +
        "tabela permite escolher, na hora do salto, a mais próxima entre as que servem. E " +
        "escolher os vizinhos por proximidade, o que só é possível quando há mais de um " +
        "candidato, funciona em protocolos que dão ao nó recém-chegado informação vinda de " +
        "vários outros.</p>" +
        "<h3>Uma árvore de domínios que explora a localidade</h3>" +
        "<p>A quinta resposta organiza a rede em <strong>domínios</strong>, com um domínio " +
        "de nível mais alto cobrindo tudo e domínios menores dentro dele. O domínio de " +
        "nível mais baixo corresponde na prática a uma rede local ou a uma célula de " +
        "telefonia. A hipótese que sustenta o arranjo é geográfica, porque transferir uma " +
        "mensagem dentro de um domínio pequeno custa menos tempo do que dentro de um " +
        "grande.</p>" +
        "<p>Cada domínio tem um nó de diretório associado, o que forma uma árvore desses " +
        "nós, com o nó raiz sabendo de todas as entidades. Uma entidade presente num " +
        "domínio de folha aparece no nó daquele domínio com o endereço dela. Nos níveis " +
        "acima, o registro correspondente guarda apenas um ponteiro para o nó de baixo. " +
        "Assim, a raiz tem um registro para cada entidade, e cada registro é só um ponteiro " +
        "para o subdomínio onde a entidade está.</p>" +
        "<p>A busca começa no nó de diretório do domínio onde o cliente está. Se não houver " +
        "registro ali, a entidade não está naquele domínio e o pedido sobe para o pai, que " +
        "representa uma região maior. O pedido sobe até encontrar um nó que tenha o " +
        "registro, e a partir dali desce seguindo os ponteiros até a folha, que devolve o " +
        "endereço. O efeito é que a procura acontece num anel que cresce em torno de quem " +
        "perguntou, e achar alguém perto custa pouco. É a propriedade que o Chord não " +
        "tem.</p>" +
        "<p>A objeção óbvia é que a raiz precisa registrar todas as entidades do sistema, o " +
        "que parece um erro de projeto na origem. A resposta está na distinção entre " +
        "desenho lógico e implementação física, que reaparecerá na seção 4 a propósito dos " +
        "servidores raiz do DNS. Nada obriga a raiz lógica a ser uma máquina. Distribuindo " +
        "os registros da raiz por muitas máquinas espalhadas, escolhidas conforme o " +
        "endereço da entidade, obtém-se ao mesmo tempo operação local, que é boa para a " +
        "escala geográfica, e distribuição plena dos níveis altos, que é boa para a escala " +
        "de tamanho.</p>" +
        '<div class="tabela-rolagem">' +
        '<table class="tabela-conteudo" id="tab-nomes-planos">' +
        "<tr><th>Mecanismo</th><th>Como ele encontra a entidade</th><th>Onde ele para de " +
        "servir</th></tr>" +
        "<tr><td>Difusão e multicast</td><td>Pergunta a todas as máquinas do grupo e " +
        "espera que só a dona responda.</td><td>Deixa de servir quando a rede cresce, " +
        "porque gasta banda e interrompe quem não tem como responder.</td></tr>" +
        "<tr><td>Ponteiro de encaminhamento</td><td>Deixa em cada lugar antigo uma " +
        "referência para o seguinte, e o cliente percorre a corrente.</td><td>Deixa de " +
        "servir quando a corrente fica longa ou quando um elo se perde, e aí a entidade " +
        "some.</td></tr>" +
        "<tr><td>Casa fixa</td><td>Registra num lugar conhecido onde a entidade está " +
        "agora, e o cliente pergunta à casa antes de tudo.</td><td>Cobra um desvio até a " +
        "casa em toda conversa nova, e obriga a casa a existir para sempre.</td></tr>" +
        "<tr><td>Tabela hash distribuída</td><td>Calcula quem é o responsável pela chave e " +
        "roteia o pedido até ele, em saltos que dobram de tamanho.</td><td>Roteia sem " +
        "olhar a rede física, então um pedido pode atravessar o oceano três vezes sem " +
        "precisar.</td></tr>" +
        "<tr><td>Árvore de domínios</td><td>Procura num anel que cresce em torno do " +
        "cliente, subindo na árvore até achar o registro e descendo até a folha.</td>" +
        "<td>Concentra na raiz o registro de todas as entidades, o que só funciona se a " +
        "raiz for distribuída na implementação.</td></tr>" +
        "</table>" +
        "</div>" +
        "<p>Lendo a tabela de cima a baixo, nota-se que o preço muda de natureza conforme a " +
        "escala aumenta. Nos dois primeiros mecanismos o custo é de tráfego e de fragilidade. " +
        "Nos dois últimos ele é de projeto, porque passa a depender de decisões sobre como " +
        "distribuir a estrutura que sustenta a busca.</p>" +
        "<h3>Nomes que se autocertificam</h3>" +
        "<p>Um nome plano não carrega informação alguma sobre como chegar à entidade, e a " +
        "consequência é que só resta confiar no processo de resolução. Se esse processo não " +
        "for confiável, não há razão para acreditar em resposta nenhuma. Há dois caminhos " +
        "diante disso, e o segundo é mais interessante que o primeiro. É possível proteger " +
        "o processo de resolução, assunto que a seção 4 retoma no DNS, e é possível " +
        "proteger o vínculo entre o identificador e a entidade.</p>" +
        "<p>Um <strong>nome autocertificante</strong> segue o segundo caminho, calculando o " +
        "identificador a partir da própria entidade com uma função de resumo criptográfica, " +
        "daquelas que o tópico 07 apresentou. Para um arquivo que não muda, o efeito é " +
        "imediato. O cliente recebe o arquivo, calcula o resumo por conta própria e compara " +
        "com o identificador que usou na busca, e a comparação basta para saber se recebeu " +
        "o arquivo certo.</p>" +
        "<p>Entidades que mudam pedem um arranjo um pouco maior, e o mais usado é fazer o " +
        "identificador ser a chave pública da entidade. A resposta vem acompanhada de dados " +
        "adicionais que permitem a verificação, como um resumo assinado que funciona como " +
        "assinatura do dono, e às vezes de um certificado atestando a validade daquela " +
        "chave. O resultado é o que interessa. Quem resolve o nome deixa de precisar ser " +
        "digno de confiança, porque o pior que ele consegue fazer é devolver nada ou " +
        "devolver algo falso, e a falsificação é detectada. A confiança exigida cai de " +
        "correção para mera disponibilidade.</p>" +
        "<p>Vale registrar o que continua difícil. Proteger sistemas baseados em tabela hash " +
        "distribuída provou-se problemático, porque um adversário pode fabricar " +
        "identidades em massa ou cercar um nó com vizinhos que ele controla. A robustez " +
        "depende de garantir que o identificador de um nó pertence a um dono só e que isso " +
        "pode ser verificado, o que na prática obriga a existir uma autoridade central " +
        "distribuindo identificadores. É um preço curioso, porque é justamente o tipo de " +
        "peça central que a arquitetura queria evitar.</p>" +
        '<div class="callout">' +
        '<p class="callout-title">💡 Por que este assunto quase nunca aparece nos manuais</p>' +
        "<p>Nomeação plana é invisível para quem programa aplicações, e é por isso que ela " +
        "raramente é ensinada. O ARP, o Mobile IP e as tabelas hash distribuídas estão " +
        "abaixo do nível em que se escreve código de negócio. Ainda assim, é aqui que se vê " +
        "o problema de localização na forma mais pura, sem a ajuda que a estrutura do nome " +
        "dá. Quem entende esta seção lê a próxima como um caso particular, em que o nome " +
        "colabora com quem o resolve.</p>" +
        "</div>",
      slides: [
        {
          title: "O que é um nome plano",
          html:
            "<ul>" +
            "<li>É uma cadeia de bits sorteada, sem estrutura e sem informação de " +
            "localização</li>" +
            "<li>A pergunta da seção é achar o endereço tendo só o identificador</li>" +
            "<li>O caso difícil é o da entidade que se move</li>" +
            "<li>Cinco respostas, cada uma corrigindo o defeito da anterior</li>" +
            "</ul>"
        },
        {
          title: "Difusão, multicast e ponteiro de encaminhamento",
          html:
            "<ul>" +
            "<li>A difusão pergunta a todos e só o dono responde, que é o ARP do tópico " +
            "03</li>" +
            "<li>Ela interrompe quem não pode responder, e o multicast restringe o " +
            "grupo</li>" +
            "<li>O <strong>ponteiro de encaminhamento</strong> deixa no lugar antigo o " +
            "endereço do novo</li>" +
            "<li>Corrente longa fica cara, e um elo perdido some com a entidade</li>" +
            "</ul>"
        },
        {
          title: "A casa fixa e o Mobile IP",
          ref: "fig-mobile-ip",
          html:
            "<ul>" +
            "<li>O endereço fixo leva à casa, que encapsula para o endereço temporário</li>" +
            "<li>A casa avisa quem enviou, e os pacotes seguintes vão direto</li>" +
            "</ul>"
        },
        {
          title: "O Chord troca registro por cálculo",
          ref: "fig-chord",
          html:
            "<ul>" +
            "<li>A chave pertence ao <strong>sucessor</strong> dela no anel</li>" +
            "<li>A tabela de dedos dobra a distância a cada entrada</li>" +
            "<li>A busca custa da ordem do logaritmo do número de nós</li>" +
            "</ul>"
        },
        {
          title: "Resolver virou rotear",
          html:
            "<ul>" +
            "<li>Não houve tabela de nomes, servidor de nomes nem consulta antes do " +
            "acesso</li>" +
            "<li>O pedido foi roteado até o responsável, guiado pelo identificador</li>" +
            "<li>O ponto fraco é ignorar a rede física, e um pedido cruza o oceano à " +
            "toa</li>" +
            "<li>Corrigem isso a atribuição por topologia, as alternativas por entrada e a " +
            "escolha de vizinho por proximidade</li>" +
            "</ul>"
        },
        {
          title: "A árvore de domínios explora localidade",
          html:
            "<ul>" +
            "<li>A rede vira domínios encaixados, cada um com um nó de diretório</li>" +
            "<li>A folha guarda o endereço e os níveis acima guardam ponteiros</li>" +
            "<li>A busca sobe até achar o registro e desce até a folha</li>" +
            "<li>Procurar alguém perto custa pouco, que é o que falta ao Chord</li>" +
            "<li>A raiz lógica não precisa ser uma máquina, e é isso que salva a escala</li>" +
            "</ul>"
        },
        {
          title: "Os cinco mecanismos lado a lado",
          ref: "tab-nomes-planos"
        },
        {
          title: "Nomes que se autocertificam",
          html:
            "<ul>" +
            "<li>O identificador sai de uma função de resumo sobre a própria entidade</li>" +
            "<li>Para entidade que muda, o identificador vira a chave pública dela</li>" +
            "<li>Quem resolve deixa de precisar ser confiável, porque a falsificação é " +
            "detectada</li>" +
            "<li>Continua difícil garantir que um identificador de nó tem um dono só</li>" +
            "</ul>"
        }
      ]
    },
    {
      title: "Nomes estruturados, o espaço de nomes e a resolução",
      html:
        "<p>Nomes planos servem bem às máquinas e mal às pessoas. Ninguém combina um " +
        "encontro passando uma cadeia de bits sorteada, e ninguém digita de cabeça o " +
        "identificador de 160 bits de um arquivo. Por isso os sistemas de nomes oferecem " +
        "<strong>nomes estruturados</strong>, compostos de partes simples e legíveis. É " +
        "assim que arquivos e computadores são nomeados, e é sobre esse tipo de nome que " +
        "quase todo o resto do tópico se apoia.</p>" +
        "<p>Um <strong>espaço de nomes</strong> é o conjunto de todos os nomes válidos que " +
        "um serviço reconhece. Ele exige uma definição sintática que separe o nome válido " +
        "do inválido, e vale insistir na diferença entre inválido e desvinculado. O nome " +
        "<code>www.cdk99.net</code> é válido mesmo que nenhuma entidade esteja vinculada a " +
        "ele, e o serviço vai tentar resolvê-lo. Já <code>...</code> não é sequer um nome " +
        "que o serviço aceite receber.</p>" +
        "<h3>O espaço de nomes é um grafo</h3>" +
        "<p>Um espaço de nomes estruturado se representa como um grafo dirigido com " +
        "arestas rotuladas, e nele existem dois tipos de nó. Um <strong>nó folha</strong> " +
        "representa uma entidade nomeada e não tem aresta de saída. Ele guarda informação " +
        "sobre a entidade, como o endereço dela, ou até o estado inteiro, que é o caso do " +
        "sistema de arquivos, em que a folha contém o arquivo.</p>" +
        "<p>Um <strong>nó de diretório</strong>, ao contrário, tem várias arestas de saída, " +
        "cada uma rotulada com um nome. Ele guarda uma <strong>tabela de diretório</strong>, " +
        "em que cada aresta de saída aparece como um par formado pelo identificador do nó " +
        "de destino e pelo rótulo da aresta. Esse detalhe é mais importante do que parece, " +
        "porque diz onde o nome mora. O nome está na aresta, e o nó tem apenas um " +
        "identificador.</p>" +
        "<p>Um caminho no grafo é referido pela sequência de rótulos das arestas " +
        "percorridas, e essa sequência é um <strong>nome de caminho</strong>. Ele é " +
        "absoluto quando o primeiro nó é a raiz do grafo, e relativo quando não é. Sistemas " +
        "de arquivos escrevem o nome de caminho como uma cadeia de caracteres única, com os " +
        "rótulos separados por barras, o que é apenas outra escrita da mesma sequência.</p>" +
        '<figure class="figura" id="fig-grafo-de-nomes">' +
        '<svg viewBox="0 0 600 320" role="img" aria-labelledby="fig-grafo-de-nomes-titulo">' +
        '<title id="fig-grafo-de-nomes-titulo">Um grafo com a raiz n0 no alto. Dela sai à ' +
        "esquerda uma aresta rotulada home, que leva ao nó de diretório n1, e à direita uma " +
        "aresta rotulada chaves, que leva ao nó folha n5. De n1 sai a aresta ana, que leva " +
        "ao nó de diretório n2. De n2 saem duas arestas, uma rotulada caixa, que leva ao nó " +
        "folha n4, e outra rotulada chaves, que leva ao nó n6. O nó n6 guarda o nome de " +
        "caminho barra chaves, e uma seta tracejada sobe de n6 até n5, indicando que a " +
        "resolução recomeça a partir do nome guardado. Uma frase no rodapé lembra que o " +
        "nome vive na aresta.</title>" +
        '<path class="traco" d="M284 44 L172 96"/>' +
        '<path class="traco" d="M316 44 L420 96"/>' +
        '<path class="traco" d="M160 126 L160 176"/>' +
        '<path class="traco" d="M144 206 L100 256"/>' +
        '<path class="traco" d="M188 206 L372 252"/>' +
        '<path class="traco" d="M440 252 L440 134" stroke-dasharray="5 4"/>' +
        '<path class="seta" d="M434 134 L446 134 L440 126 Z"/>' +
        '<rect class="caixa" x="272" y="14" width="56" height="30" rx="8"/>' +
        '<text x="300" y="34" text-anchor="middle" font-size="12">n0</text>' +
        '<rect class="caixa" x="132" y="96" width="56" height="30" rx="8"/>' +
        '<text x="160" y="116" text-anchor="middle" font-size="12">n1</text>' +
        '<rect class="caixa-destaque" x="398" y="96" width="84" height="30" rx="8"/>' +
        '<text x="440" y="116" text-anchor="middle" font-size="12">n5</text>' +
        '<rect class="caixa" x="132" y="176" width="56" height="30" rx="8"/>' +
        '<text x="160" y="196" text-anchor="middle" font-size="12">n2</text>' +
        '<rect class="caixa-destaque" x="45" y="256" width="80" height="30" rx="8"/>' +
        '<text x="85" y="276" text-anchor="middle" font-size="12">n4</text>' +
        '<rect class="caixa" x="372" y="252" width="136" height="44" rx="8"/>' +
        '<text x="440" y="272" text-anchor="middle" font-size="12">n6</text>' +
        '<text class="rotulo-secundario" x="440" y="289" text-anchor="middle" ' +
        'font-size="11">guarda /chaves</text>' +
        '<text class="rotulo-secundario" x="216" y="66" text-anchor="middle" ' +
        'font-size="11">home</text>' +
        '<text class="rotulo-secundario" x="380" y="66" text-anchor="middle" ' +
        'font-size="11">chaves</text>' +
        '<text class="rotulo-secundario" x="168" y="155" font-size="11">ana</text>' +
        '<text class="rotulo-secundario" x="100" y="236" text-anchor="middle" ' +
        'font-size="11">caixa</text>' +
        '<text class="rotulo-secundario" x="280" y="222" text-anchor="middle" ' +
        'font-size="11">chaves</text>' +
        '<text class="rotulo-secundario" x="452" y="196" font-size="11">a resolução recomeça</text>' +
        '<text class="rotulo-secundario" x="300" y="312" text-anchor="middle" ' +
        'font-size="12">o nome vive na aresta, e o nó só tem identificador</text>' +
        "</svg>" +
        "<figcaption>Os nós em destaque são folhas. O nó n5 é alcançado por dois nomes " +
        "diferentes, um direto e outro passando por n6, e essas são as duas maneiras de " +
        "construir um apelido.</figcaption>" +
        "</figure>" +
        "<p>Vale ainda separar nome global de nome local, porque a confusão entre os dois " +
        "custa caro. Um <strong>nome global</strong> denota a mesma entidade seja onde for " +
        "usado, porque é sempre interpretado em relação ao mesmo nó de diretório. Um " +
        "<strong>nome local</strong> tem interpretação dependente do lugar em que é usado, " +
        "e é na prática um nome relativo cujo diretório de referência está implícito.</p>" +
        "<h3>Onde a resolução começa</h3>" +
        "<p>Resolver um nome estruturado é percorrer o grafo, procurando um rótulo de cada " +
        "vez na tabela de diretório do nó corrente e continuando no nó devolvido. O " +
        "procedimento é simples e esconde uma pergunta que quase ninguém faz, que é onde " +
        "ele começa. Saber como e onde iniciar a resolução chama-se " +
        "<strong>mecanismo de fechamento</strong>, e ele é sempre em parte implícito.</p>" +
        "<p>Um exemplo fora da computação torna a ideia evidente. A sequência " +
        "<code>00312059837784</code> não diz a ninguém o que fazer com ela, até que alguém " +
        "informe que aquilo é um número de telefone. Só essa informação já basta para " +
        "iniciar a resolução, porque agora se sabe que o número deve ser digitado num " +
        "aparelho, e o sistema telefônico faz o resto.</p>" +
        "<p>Dentro do sistema, o mecanismo aparece em toda parte. A variável de ambiente " +
        "<code>HOME</code> é um nome local, e cada usuário tem a própria cópia dela, " +
        "resolvida numa tabela específica daquele usuário. No sistema de arquivos, resolver " +
        "<code>/home/ana/caixa</code> exige acesso prévio à tabela de diretório da raiz, e " +
        "esse acesso não pode ter sido obtido por resolução, sob pena de regressão " +
        "infinita. O que existe é uma convenção gravada no próprio sistema operacional, que " +
        "diz onde encontrar o índice do diretório raiz no disco.</p>" +
        "<p>O caso mais interessante é o dos contêineres, que o tópico 06 apresentou. O " +
        "comando <code>chroot</code> faz as aplicações de um contêiner enxergarem uma raiz " +
        "diferente da que as aplicações de outro contêiner enxergam. Em vocabulário deste " +
        "tópico, cada contêiner oferece o próprio grafo de nomes às aplicações que abriga, " +
        "e o sistema operacional hospedeiro fornece a cada um o fechamento que inicia a " +
        "resolução de forma independente. Isolamento de nomes é boa parte do que um " +
        "contêiner entrega.</p>" +
        "<h3>Apelido, e as duas maneiras de fazer um</h3>" +
        "<p>Um <strong>apelido</strong> é outro nome para a mesma entidade, e ele pode ser " +
        "implementado de duas maneiras que se parecem de fora e diferem por dentro.</p>" +
        "<p>A primeira permite que vários nomes de caminho absolutos levem ao mesmo nó do " +
        "grafo. No vocabulário do UNIX isso é um <strong>vínculo forte</strong>, e na " +
        "figura acima corresponde ao nó n5 alcançado direto pela aresta da raiz. A " +
        "resolução chega ao destino e acaba.</p>" +
        "<p>A segunda representa a entidade por um nó folha que, em vez do endereço ou do " +
        "estado, guarda um nome de caminho absoluto. Ao chegar nesse nó, a resolução " +
        "devolve o nome guardado e recomeça com ele. Isso é um <strong>vínculo " +
        "simbólico</strong>, e na figura é o nó n6. A diferença que importa é essa, e não a " +
        "aparência, porque no vínculo simbólico a resolução reinicia.</p>" +
        "<p>Reiniciar abre uma porta indesejada. Apelidos permitem <strong>ciclos</strong> " +
        "no espaço de nomes, e um ciclo faz a resolução nunca terminar. Duas defesas são " +
        "usadas na prática. A primeira abandona a resolução depois de um número limite de " +
        "passos, e a segunda deixa os administradores vetarem apelidos que introduziriam " +
        "ciclos. Nenhuma das duas é elegante, e as duas funcionam.</p>" +
        "<p>Apelidos são úteis o bastante para valer o incômodo. Eles permitem trocar um " +
        "nome complicado por um conveniente, e permitem que pessoas diferentes usem nomes " +
        "diferentes para a mesma coisa. Os encurtadores de URL são o exemplo mais " +
        "cotidiano, e o registro <code>CNAME</code> do DNS, que a seção 4 detalha, é " +
        "exatamente um vínculo simbólico no sentido descrito aqui.</p>" +
        "<h3>Montar um espaço de nomes dentro de outro</h3>" +
        "<p>Tudo o que foi dito até agora acontece dentro de um espaço de nomes só. A " +
        "resolução também serve para juntar espaços diferentes de forma transparente, e a " +
        "técnica é a <strong>montagem</strong>, que o tópico 08 já usou pelo lado do " +
        "sistema de arquivos. Um nó de diretório passa a guardar o identificador de um nó " +
        "de diretório de um espaço estrangeiro, e a resolução continua por lá.</p>" +
        "<p>Num sistema distribuído, o espaço estrangeiro costuma viver noutra máquina, o " +
        "que obriga a montagem a carregar três nomes, e cada um deles precisa ser resolvido " +
        "por seu próprio meio.</p>" +
        "<ul>" +
        "<li>O <strong>nome do protocolo de acesso</strong> precisa ser resolvido numa " +
        "implementação de protocolo capaz de conversar com o servidor estrangeiro.</li>" +
        "<li>O <strong>nome do servidor</strong> precisa ser resolvido num endereço onde " +
        "ele possa ser alcançado, e quem faz isso costuma ser o DNS.</li>" +
        "<li>O <strong>nome do ponto de montagem</strong> precisa ser resolvido num " +
        "identificador de nó dentro do espaço estrangeiro, e só o servidor de lá sabe " +
        "fazê-lo.</li>" +
        "</ul>" +
        "<p>Um jeito prático de escrever os três de uma vez é usar um URL. Em " +
        "<code>nfs://servidor.exemplo.br/home/ana</code>, o nome <code>nfs</code> é bem " +
        "conhecido e leva a uma implementação do protocolo, o nome do servidor vai ao DNS e " +
        "o caminho <code>/home/ana</code> é resolvido pelo servidor estrangeiro. Guardando " +
        "esse URL num nó de diretório local, o nome <code>/remoto/vu/caixa</code> passa a " +
        "resolver até um arquivo que está do outro lado da rede, e quem digitou não " +
        "precisou saber disso.</p>" +
        "<p>Aqui aparece o outro lado da moeda, que o tópico 08 mediu no sistema de " +
        "arquivos em rede, o NFS. Como cada " +
        "cliente monta o que quer onde quer, os clientes não compartilham um espaço de " +
        "nomes. O mesmo arquivo tem nomes diferentes em máquinas diferentes, e Alice não " +
        "consegue falar de um arquivo com Bob usando o nome que ela vê. A saída usual é " +
        "padronizar parte do espaço de nomes de todos os clientes, o que é convenção e não " +
        "mecanismo.</p>" +
        "<h3>Um servidor só não basta, e a hierarquia é o motivo</h3>" +
        "<p>Um serviço com um banco de dados enorme e uma população grande de clientes não " +
        "pode manter tudo num servidor. Ele seria um gargalo de desempenho e um ponto único " +
        "de falha, e é a mesma conclusão a que o tópico 08 chegou sobre armazenamento. A " +
        "saída também é a mesma, com os dados particionados entre servidores e cada partição " +
        "replicada.</p>" +
        "<p>Particionar exige um critério, e é aqui que a estrutura do nome deixa de ser " +
        "conveniência para virar arquitetura. Um <strong>domínio de atribuição de " +
        "nomes</strong> é um espaço de nomes sob uma única autoridade administrativa, que " +
        "controla quais nomes são vinculados ali e é livre para delegar essa " +
        "responsabilidade a subdomínios. Foi assim que o nome <code>dcs.qmul.ac.uk</code> " +
        "veio a existir, combinado com quem gerencia <code>qmul.ac.uk</code>, que por sua " +
        "vez foi aceito pela autoridade de <code>ac.uk</code>, e assim por diante.</p>" +
        "<p>A hierarquia rende três vantagens que um espaço plano não tem. Cada parte do " +
        "nome é resolvida num contexto pequeno e separado, o que mantém barata a busca " +
        "individual. O mesmo nome pode significar coisas diferentes em contextos " +
        "diferentes, e é por isso que <code>/etc/passwd</code> existe em duas máquinas sem " +
        "conflito. E contextos diferentes podem ser administrados por pessoas diferentes, " +
        "o que é a condição para o serviço crescer sem um administrador central. Some-se a " +
        "isso que um espaço hierárquico é potencialmente infinito, enquanto o plano é " +
        "limitado pelo comprimento máximo do nome.</p>" +
        "<h3>As três camadas de um espaço de nomes mundial</h3>" +
        "<p>Espaços de nomes de alcance mundial costumam ser divididos em três camadas " +
        "lógicas, e a divisão não é decorativa. Cada camada tem exigências de " +
        "disponibilidade e de desempenho tão diferentes que a implementação muda de uma " +
        "para a outra.</p>" +
        '<div class="tabela-rolagem">' +
        '<table class="tabela-conteudo" id="tab-camadas-nomes">' +
        "<tr><th>Camada</th><th>Que nós ela reúne</th><th>O que ela exige de quem a " +
        "implementa</th></tr>" +
        "<tr><td>Global</td><td>Reúne a raiz e os nós logicamente próximos dela, que " +
        "costumam representar organizações ou grupos de organizações e quase nunca " +
        "mudam.</td><td>Exige muitas réplicas e cache do lado do cliente, porque tolera " +
        "responder em segundos e não tolera ficar fora do ar.</td></tr>" +
        "<tr><td>Administrativa</td><td>Reúne os nós geridos dentro de uma organização, " +
        "como um por departamento ou um a partir do qual se acham todos os " +
        "computadores.</td><td>Exige responder em milissegundos e propagar atualização de " +
        "imediato, porque uma conta nova não pode demorar horas para valer.</td></tr>" +
        "<tr><td>Gerencial</td><td>Reúne os nós que mudam com frequência, como os " +
        "computadores da rede local e os diretórios e arquivos que os próprios usuários " +
        "criam.</td><td>Exige resposta imediata e quase dispensa réplica, porque a mudança " +
        "é tanta que o cache do cliente rende pouco.</td></tr>" +
        "</table>" +
        "</div>" +
        "<p>Repare na inversão que a tabela revela. Na camada global, o tempo de resposta " +
        "importa pouco e a disponibilidade é crítica, porque a falha de um servidor de lá " +
        "torna inalcançável um pedaço enorme do espaço de nomes. Na camada gerencial " +
        "acontece o contrário, com o tempo de resposta sendo crítico e a indisponibilidade " +
        "temporária sendo aceitável. As duas exigências se encontram na camada " +
        "administrativa, e é por isso que ela costuma ser a mais difícil de operar.</p>" +
        "<h3>Iterativa ou recursiva</h3>" +
        "<p>Distribuir o espaço de nomes por vários servidores muda o modo de resolver, " +
        "porque nenhum servidor responde sozinho. O processo de localizar dados de nomes " +
        "entre vários servidores chama-se <strong>navegação</strong>, e quem a executa em " +
        "nome da aplicação é o <strong>resolvedor</strong>, que costuma ser código de " +
        "biblioteca ligado ao programa cliente.</p>" +
        "<p>Na <strong>navegação iterativa</strong>, o resolvedor entrega o nome completo ao " +
        "servidor raiz, cujo endereço é bem conhecido. O raiz resolve o quanto consegue, " +
        "que costuma ser um rótulo só, e devolve ao cliente o endereço do servidor " +
        "seguinte. O cliente apresenta então o resto do nome àquele servidor, e assim por " +
        "diante. O trabalho é do cliente.</p>" +
        "<p>Na <strong>navegação recursiva</strong>, o cliente fala com um servidor apenas. " +
        "Esse servidor, se não puder resolver tudo, repassa o pedido ao servidor seguinte, " +
        "que repassa ao próximo, e a resposta volta pela mesma cadeia até chegar ao " +
        "resolvedor. O trabalho é dos servidores.</p>" +
        '<figure class="figura" id="fig-iterativa-recursiva">' +
        '<svg viewBox="0 0 600 380" role="img" aria-labelledby="fig-iterativa-recursiva-titulo">' +
        '<title id="fig-iterativa-recursiva-titulo">Dois painéis empilhados, cada um com ' +
        "quatro participantes no alto, que são o cliente, o servidor raiz, o servidor do " +
        "ponto br e o servidor de exemplo.br. No painel de cima, chamado iterativa, três " +
        "setas de duas pontas ligam o cliente a cada servidor, uma de cada vez, e a nota diz " +
        "que o cliente conversa com os três. No painel de baixo, chamado recursiva " +
        "controlada pelo servidor, uma seta vai do cliente ao raiz, outra do raiz ao ponto " +
        "br e outra do ponto br a exemplo.br, e uma seta tracejada devolve a resposta pela " +
        "cadeia inteira até o cliente, com a nota de que o cliente conversa uma vez " +
        "só.</title>" +
        '<text x="16" y="18" font-size="13">Iterativa</text>' +
        '<rect class="caixa" x="15" y="28" width="110" height="30" rx="8"/>' +
        '<text x="70" y="48" text-anchor="middle" font-size="12">Cliente</text>' +
        '<rect class="caixa" x="155" y="28" width="100" height="30" rx="8"/>' +
        '<text x="205" y="48" text-anchor="middle" font-size="12">raiz</text>' +
        '<rect class="caixa" x="305" y="28" width="100" height="30" rx="8"/>' +
        '<text x="355" y="48" text-anchor="middle" font-size="12">.br</text>' +
        '<rect class="caixa" x="440" y="28" width="145" height="30" rx="8"/>' +
        '<text x="512" y="48" text-anchor="middle" font-size="12">exemplo.br</text>' +
        '<path class="traco" d="M70 58 L70 152" stroke-dasharray="4 5"/>' +
        '<path class="traco" d="M205 58 L205 152" stroke-dasharray="4 5"/>' +
        '<path class="traco" d="M355 58 L355 152" stroke-dasharray="4 5"/>' +
        '<path class="traco" d="M512 58 L512 152" stroke-dasharray="4 5"/>' +
        '<path class="traco" d="M78 82 L197 82"/>' +
        '<path class="seta" d="M78 76 L78 88 L70 82 Z"/>' +
        '<path class="seta" d="M197 76 L197 88 L205 82 Z"/>' +
        '<text class="rotulo-secundario" x="137" y="74" text-anchor="middle" ' +
        'font-size="11">1. e volta com o endereço do .br</text>' +
        '<path class="traco" d="M78 112 L347 112"/>' +
        '<path class="seta" d="M78 106 L78 118 L70 112 Z"/>' +
        '<path class="seta" d="M347 106 L347 118 L355 112 Z"/>' +
        '<text class="rotulo-secundario" x="212" y="104" text-anchor="middle" ' +
        'font-size="11">2. e volta com o endereço de exemplo.br</text>' +
        '<path class="traco" d="M78 142 L504 142"/>' +
        '<path class="seta" d="M78 136 L78 148 L70 142 Z"/>' +
        '<path class="seta" d="M504 136 L504 148 L512 142 Z"/>' +
        '<text class="rotulo-secundario" x="291" y="134" text-anchor="middle" ' +
        'font-size="11">3. e volta com a resposta</text>' +
        '<text class="rotulo-secundario" x="300" y="172" text-anchor="middle" ' +
        'font-size="12">o cliente conversa com os três servidores</text>' +
        '<text x="16" y="214" font-size="13">Recursiva controlada pelo servidor</text>' +
        '<rect class="caixa" x="15" y="224" width="110" height="30" rx="8"/>' +
        '<text x="70" y="244" text-anchor="middle" font-size="12">Cliente</text>' +
        '<rect class="caixa" x="155" y="224" width="100" height="30" rx="8"/>' +
        '<text x="205" y="244" text-anchor="middle" font-size="12">raiz</text>' +
        '<rect class="caixa" x="305" y="224" width="100" height="30" rx="8"/>' +
        '<text x="355" y="244" text-anchor="middle" font-size="12">.br</text>' +
        '<rect class="caixa" x="440" y="224" width="145" height="30" rx="8"/>' +
        '<text x="512" y="244" text-anchor="middle" font-size="12">exemplo.br</text>' +
        '<path class="traco" d="M70 254 L70 350" stroke-dasharray="4 5"/>' +
        '<path class="traco" d="M205 254 L205 350" stroke-dasharray="4 5"/>' +
        '<path class="traco" d="M355 254 L355 350" stroke-dasharray="4 5"/>' +
        '<path class="traco" d="M512 254 L512 350" stroke-dasharray="4 5"/>' +
        '<path class="traco" d="M70 274 L197 274"/>' +
        '<path class="seta" d="M197 268 L197 280 L205 274 Z"/>' +
        '<text class="rotulo-secundario" x="137" y="266" text-anchor="middle" ' +
        'font-size="11">1. pergunta uma vez</text>' +
        '<path class="traco" d="M205 296 L347 296"/>' +
        '<path class="seta" d="M347 290 L347 302 L355 296 Z"/>' +
        '<text class="rotulo-secundario" x="276" y="288" text-anchor="middle" ' +
        'font-size="11">2. o servidor pergunta ao próximo</text>' +
        '<path class="traco" d="M355 318 L504 318"/>' +
        '<path class="seta" d="M504 312 L504 324 L512 318 Z"/>' +
        '<text class="rotulo-secundario" x="433" y="310" text-anchor="middle" ' +
        'font-size="11">3. e este ao seguinte</text>' +
        '<path class="traco" d="M512 342 L78 342" stroke-dasharray="5 4"/>' +
        '<path class="seta" d="M78 336 L78 348 L70 342 Z"/>' +
        '<text class="rotulo-secundario" x="300" y="334" text-anchor="middle" ' +
        'font-size="11">a resposta volta pela cadeia, e cada servidor guarda o que passou</text>' +
        '<text class="rotulo-secundario" x="300" y="368" text-anchor="middle" ' +
        'font-size="12">o cliente conversa uma vez só</text>' +
        "</svg>" +
        "<figcaption>A diferença não é de resultado, porque as duas devolvem o mesmo " +
        "endereço. A diferença é sobre quem paga o trabalho e quem tem a chance de " +
        "aprender com a resolução alheia.</figcaption>" +
        "</figure>" +
        "<p>O inconveniente da recursiva é a carga. Cada servidor precisa dar conta da " +
        "resolução completa de um nome, ainda que em cooperação com outros, e enquanto " +
        "isso ele mantém a requisição aberta. A carga é alta o bastante para que os " +
        "servidores da camada global aceitem apenas navegação iterativa, o que explica por " +
        "que o servidor raiz do DNS não resolve nomes por você.</p>" +
        "<p>Em compensação, a recursiva tem duas vantagens grandes. A primeira é que o " +
        "cache passa a funcionar em muito mais lugares. Como cada servidor da cadeia recebe " +
        "de volta o endereço dos servidores de nível mais baixo, ele guarda esse endereço. " +
        "Depois de uma única resolução de um nome sob <code>exemplo.br</code>, o servidor " +
        "raiz consegue encaminhar direto ao servidor certo qualquer outro nome daquele " +
        "domínio. Na iterativa, o cache fica restrito ao resolvedor do cliente que " +
        "perguntou, e o cliente seguinte percorre tudo de novo.</p>" +
        "<p>A segunda vantagem é o custo de comunicação, e ela fica clara com distância. " +
        "Suponha o cliente em São Francisco e a cadeia de servidores na Holanda. Na " +
        "recursiva, o cliente paga uma travessia longa até o primeiro servidor, e as demais " +
        "conversas acontecem entre máquinas vizinhas na Europa. Na iterativa, o cliente " +
        "atravessa o oceano três vezes, uma por servidor, e o custo total fica perto do " +
        "triplo.</p>" +
        "<p>Existem ainda dois modelos menos comuns e vale conhecê-los. Na " +
        "<strong>navegação não recursiva controlada pelo servidor</strong>, o cliente " +
        "escolhe um servidor qualquer, e esse servidor faz o papel de cliente perante os " +
        "pares, iterando ou usando multicast. Na <strong>navegação por multicast</strong>, " +
        "o cliente envia o nome a um grupo de servidores e só quem o tem responde, o que é " +
        "elegante e traz um problema, porque nome desvinculado é respondido com silêncio. A " +
        "correção usual é designar um servidor do grupo para responder pelos nomes " +
        "desvinculados.</p>" +
        "<p>Há um caso em que a escolha deixa de ser de desempenho e passa a ser de " +
        "viabilidade. Quando o serviço abrange domínios administrativos distintos, um " +
        "cliente de um domínio pode estar proibido de acessar os servidores de outro, e até " +
        "os servidores podem estar proibidos de descobrir como os dados alheios estão " +
        "dispostos. Nesse cenário, só a navegação recursiva serve, porque ela devolve os " +
        "atributos sem revelar onde cada parte do banco de dados está guardada.</p>" +
        "<h3>O cache, que é o que faz o serviço voar</h3>" +
        "<p>Resolvedores e servidores guardam em <strong>cache</strong> os resultados de " +
        "resoluções anteriores. Antes de procurar um nome, o resolvedor consulta o próprio " +
        "cache, e o servidor que ele consultar pode responder com dado que veio do cache " +
        "dele.</p>" +
        "<p>O ganho é duplo, e a segunda metade costuma ser esquecida. A primeira é " +
        "desempenho, com menos idas aos servidores e respostas mais rápidas. A segunda é " +
        "disponibilidade, porque o cache elimina do caminho de navegação os servidores de " +
        "nível alto, o raiz em particular, e deixa a resolução prosseguir apesar de falhas " +
        "deles.</p>" +
        "<p>O cache de nomes funciona tão bem por uma razão específica, que é a raridade " +
        "das mudanças. O endereço de um computador ou de um serviço costuma ficar o mesmo " +
        "por meses ou anos, então uma resposta guardada continua válida por muito tempo. " +
        "Guarde esse argumento, porque ele reaparece invertido no tópico 10, onde os dados " +
        "mudam o tempo todo e o cache deixa de ser barato.</p>" +
        "<p>O preço é a possibilidade de devolver atributos desatualizados. Um serviço que " +
        "usa cache aceita, por construção, entregar de vez em quando um endereço obsoleto, " +
        "e a pergunta de projeto passa a ser por quanto tempo. A seção 4 mostra a resposta " +
        "do DNS, que é dar a cada entrada um prazo de validade explícito.</p>",
      slides: [
        {
          title: "O espaço de nomes",
          html:
            "<ul>" +
            "<li>Nome estruturado é composto de partes simples e legíveis por pessoas</li>" +
            "<li><strong>Espaço de nomes</strong> é o conjunto dos nomes válidos que o " +
            "serviço reconhece</li>" +
            "<li>Nome inválido não é aceito, e nome válido desvinculado o serviço tenta " +
            "resolver</li>" +
            "</ul>"
        },
        {
          title: "O espaço de nomes é um grafo",
          ref: "fig-grafo-de-nomes",
          html:
            "<ul>" +
            "<li>Nó folha guarda a entidade, e nó de diretório guarda a tabela de " +
            "arestas</li>" +
            "<li>O nome está na aresta, e o nó só tem identificador</li>" +
            "</ul>"
        },
        {
          title: "Onde a resolução começa",
          html:
            "<ul>" +
            "<li>O <strong>mecanismo de fechamento</strong> diz como e onde iniciar, e é " +
            "sempre em parte implícito</li>" +
            "<li>Uma sequência de dígitos só resolve depois que alguém disser que é " +
            "telefone</li>" +
            "<li>No sistema de arquivos, uma convenção gravada no sistema diz onde está a " +
            "raiz</li>" +
            "<li>O <code>chroot</code> dá a cada contêiner um grafo e um fechamento " +
            "próprios</li>" +
            "</ul>"
        },
        {
          title: "Duas maneiras de fazer um apelido",
          html:
            "<ul>" +
            "<li>O <strong>vínculo forte</strong> leva dois caminhos ao mesmo nó, e a " +
            "resolução acaba ali</li>" +
            "<li>O <strong>vínculo simbólico</strong> guarda um nome, e a resolução " +
            "recomeça com ele</li>" +
            "<li>Recomeçar permite ciclos, que travariam a resolução</li>" +
            "<li>Defende-se abandonando após um limite de passos ou vetando o apelido " +
            "cíclico</li>" +
            "</ul>"
        },
        {
          title: "Montagem e domínio",
          html:
            "<ul>" +
            "<li>Montar exige três nomes, o do protocolo, o do servidor e o do ponto de " +
            "montagem</li>" +
            "<li>Cada um dos três é resolvido por um meio diferente</li>" +
            "<li>Como cada cliente monta o que quer, os clientes não compartilham espaço de " +
            "nomes</li>" +
            "<li>Um <strong>domínio</strong> é o espaço sob uma autoridade, livre para " +
            "delegar a subdomínios</li>" +
            "<li>A hierarquia dá contexto pequeno, nome repetido sem conflito e " +
            "administração separada</li>" +
            "</ul>"
        },
        {
          title: "As três camadas de um espaço mundial",
          ref: "tab-camadas-nomes"
        },
        {
          title: "Iterativa contra recursiva",
          ref: "fig-iterativa-recursiva",
          html:
            "<ul>" +
            "<li>A recursiva carrega o servidor, e por isso a camada global só aceita a " +
            "iterativa</li>" +
            "<li>Em troca, ela espalha o cache pela cadeia e corta o custo de " +
            "comunicação</li>" +
            "</ul>"
        },
        {
          title: "O cache é o que faz o serviço voar",
          html:
            "<ul>" +
            "<li>Ganha desempenho e ganha disponibilidade, porque tira o raiz do " +
            "caminho</li>" +
            "<li>Funciona porque dado de nome muda a cada meses ou anos</li>" +
            "<li>Cobra a entrega ocasional de atributo obsoleto</li>" +
            "<li>A pergunta de projeto vira por quanto tempo, e o DNS responde com prazo " +
            "de validade</li>" +
            "</ul>"
        }
      ]
    },
    {
      title: "O DNS, o serviço de nomes da Internet",
      html:
        "<p>O <strong>sistema de nomes de domínio</strong>, conhecido pela sigla DNS, é o " +
        "maior serviço de nomes em operação e o exemplo em que todas as ideias da seção " +
        "anterior aparecem juntas. Ele nomeia principalmente computadores e servidores de " +
        "correio da Internet, e vale conhecer o que ele substituiu, porque as escolhas de " +
        "projeto só fazem sentido contra esse pano de fundo.</p>" +
        "<p>No esquema original, todos os nomes e endereços da rede viviam num único " +
        "arquivo mestre central, baixado por transferência de arquivo em cada máquina que " +
        "precisasse dele. Três defeitos derrubaram o arranjo. Ele não tinha como escalar " +
        "para um número grande de computadores, as organizações queriam administrar os " +
        "próprios nomes em vez de pedir alteração ao centro, e era preciso um serviço de " +
        "nomes geral, e não um que só soubesse pesquisar endereços.</p>" +
        "<p>O DNS responde aos três com a receita da seção 3, que combina particionamento " +
        "hierárquico, replicação e cache. Nenhuma dessas três é invenção dele, e a " +
        "engenharia da combinação é que o tornou capaz de atender à Internet inteira.</p>" +
        "<h3>O espaço de nomes de domínio</h3>" +
        "<p>O espaço de nomes do DNS é uma árvore com raiz. Cada aresta leva um " +
        "<strong>rótulo</strong>, que é uma cadeia alfanumérica de no máximo 63 caracteres " +
        "e não distingue maiúsculas de minúsculas. Um nome de caminho completo tem no " +
        "máximo 255 caracteres e é escrito listando os rótulos a partir do mais à direita, " +
        "separados por pontos. A raiz é representada por um ponto final, que quase todo " +
        "mundo omite por comodidade.</p>" +
        "<p>Uma subárvore desse espaço chama-se <strong>domínio</strong>, e o nome de " +
        "caminho até a raiz dela é um <strong>nome de domínio</strong>. O termo é " +
        "potencialmente confuso e convém ter cuidado, porque alguns nomes de domínio " +
        "identificam domínios e outros identificam computadores, sem que a sintaxe " +
        "distinga um caso do outro.</p>" +
        "<p>No topo estão os domínios genéricos, criados para separar tipos de organização, " +
        "com <code>com</code> para empresas, <code>edu</code> para instituições de ensino, " +
        "<code>gov</code> e <code>mil</code> para órgãos e forças dos Estados Unidos, " +
        "<code>net</code> para centros de suporte à rede e <code>org</code> para o que não " +
        "cabia nos demais. Outros vieram depois, como <code>biz</code> e <code>mobi</code>. " +
        "Ao lado deles ficam os domínios de país, como <code>br</code>, <code>uk</code> e " +
        "<code>fr</code>, e vários países criaram subdomínios próprios, como " +
        "<code>co.uk</code> e <code>ac.uk</code>.</p>" +
        "<p>Um detalhe frequentemente mal entendido é que o sufixo geográfico é apenas " +
        "convencional. Um domínio terminado em <code>.uk</code> pode perfeitamente guardar " +
        "dados de computadores instalados na Espanha, porque o nome diz quem administra e " +
        "não onde a máquina está. Nome de domínio não é endereço, e esta é mais uma " +
        "aparição da distinção da seção 1.</p>" +
        "<h3>O que uma consulta pede e o que um nó guarda</h3>" +
        "<p>Uma consulta ao DNS é especificada por três coisas, que são o nome procurado, a " +
        "classe e o tipo. Para nomes da Internet a classe é sempre <code>IN</code>, e ela " +
        "existe para distinguir esse banco de dados de outros bancos experimentais. O tipo " +
        "diz o que se quer saber sobre aquele nome.</p>" +
        "<p>As duas consultas mais comuns são a de endereço de computador, que é o que o " +
        "navegador faz antes de abrir uma conexão, e a de servidor de correio de um " +
        "domínio, que devolve uma lista de servidores, cada um com um valor de preferência " +
        "indicando a ordem de tentativa. Existe ainda a resolução reversa, que parte do " +
        "endereço e devolve o nome, feita por um domínio especial chamado " +
        "<code>in-addr.arpa</code>, cujos nós são nomeados pelo próprio endereço escrito ao " +
        "contrário.</p>" +
        "<p>O conteúdo de um nó do espaço de nomes é formado por " +
        "<strong>registros de recurso</strong>, e cada tipo de registro responde a um tipo " +
        "de consulta. Os nomes dos tipos são abreviações em inglês do que cada um guarda, " +
        "com A de endereço, AAAA para o endereço da versão 6, NS de servidor de nomes, MX " +
        "de troca de correio, SRV de servidor, CNAME de nome canônico, SOA de início de " +
        "autoridade, PTR de ponteiro e TXT de texto. A tabela abaixo reúne os principais, e " +
        "a coluna da direita é a que interessa, porque diz por que cada um existe.</p>" +
        '<div class="tabela-rolagem">' +
        '<table class="tabela-conteudo" id="tab-registros-dns">' +
        "<tr><th>Registro</th><th>O que ele guarda</th><th>Para que ele serve</th></tr>" +
        "<tr><td>SOA</td><td>Guarda os parâmetros da zona, como o número de versão dos " +
        "dados e a frequência com que os secundários devem conferir a cópia.</td><td>Abre " +
        "os dados de uma zona e diz como ela é administrada.</td></tr>" +
        "<tr><td>A e AAAA</td><td>Guardam o endereço de rede do computador que o nó " +
        "representa, na versão 4 e na versão 6 do protocolo.</td><td>Atendem à consulta " +
        "mais comum de todas, que é traduzir nome de computador em endereço.</td></tr>" +
        "<tr><td>NS</td><td>Guarda o nome de um servidor com autoridade sobre a zona que o " +
        "nó representa.</td><td>Sustenta a delegação, porque é ele que aponta para quem " +
        "responde pelo subdomínio.</td></tr>" +
        "<tr><td>MX</td><td>Guarda o nome de um servidor de correio, precedido de um valor " +
        "de preferência.</td><td>Diz a quem envia mensagem em que ordem tentar os " +
        "servidores daquele domínio.</td></tr>" +
        "<tr><td>SRV</td><td>Guarda o nome do servidor que oferece um serviço, identificado " +
        "pelo nome do serviço e pelo protocolo.</td><td>Livra o cliente de saber o nome da " +
        "máquina, porque basta padronizar o nome do serviço.</td></tr>" +
        "<tr><td>CNAME</td><td>Guarda o nome canônico de um computador, quando o nó " +
        "consultado é apenas um apelido.</td><td>Faz o papel do vínculo simbólico da seção " +
        "3, e a resolução recomeça com o nome devolvido.</td></tr>" +
        "<tr><td>PTR</td><td>Guarda o nome de domínio correspondente a um endereço, dentro " +
        "do domínio <code>in-addr.arpa</code>.</td><td>Atende à resolução reversa, que " +
        "parte do endereço e devolve o nome.</td></tr>" +
        "<tr><td>TXT</td><td>Guarda texto livre associado ao nó.</td><td>Serve a usos que o " +
        "protocolo não previu, guardando qualquer informação que o administrador considere " +
        "útil.</td></tr>" +
        "</table>" +
        "</div>" +
        "<p>Olhando a coluna do meio, nota-se que vários registros não guardam endereço " +
        "nenhum. Eles guardam nomes que precisam ser resolvidos de novo, o que faz do DNS " +
        "um serviço que consulta a si mesmo o tempo todo. O registro SRV merece atenção " +
        "extra, porque é ele que separa o nome do serviço do nome da máquina, e a seção 5 " +
        "vai usá-lo para achar servidores de diretório. Existe ainda um registro de " +
        "informações de computador, que guarda arquitetura e sistema operacional, e " +
        "recomenda-se não usá-lo publicamente, porque entrega de graça informação útil a " +
        "quem tenta invadir.</p>" +
        "<h3>Zonas, autoridade e transferência</h3>" +
        "<p>O banco de dados do DNS é distribuído numa rede lógica de servidores, cada um " +
        "guardando sobretudo dados do domínio local dele. A unidade dessa divisão é a " +
        "<strong>zona</strong>, que é a parte do espaço de nomes implementada por um " +
        "servidor separado. Uma zona guarda quatro coisas.</p>" +
        "<ul>" +
        "<li>Guarda os <strong>dados de um domínio menos os subdomínios delegados</strong> " +
        "a autoridades de nível mais baixo, o que faz a fronteira da zona ser " +
        "administrativa antes de ser técnica.</li>" +
        "<li>Guarda os nomes e endereços de <strong>pelo menos dois servidores com " +
        "autoridade</strong> sobre ela, porque a arquitetura recusa deixar qualquer parte " +
        "do espaço de nomes dependendo de uma máquina só.</li>" +
        "<li>Guarda <strong>ponteiros para os servidores dos subdomínios delegados</strong>, " +
        "acompanhados dos endereços deles, que se chamam dados de cola porque quebrariam a " +
        "resolução se faltassem.</li>" +
        "<li>Guarda os <strong>parâmetros de gestão</strong>, que governam o uso de cache e " +
        "a replicação dos dados daquela zona.</li>" +
        "</ul>" +
        '<figure class="figura" id="fig-zonas">' +
        '<svg viewBox="0 0 600 300" role="img" aria-labelledby="fig-zonas-titulo">' +
        '<title id="fig-zonas-titulo">Duas regiões tracejadas. À esquerda, a zona ' +
        "exemplo.br contém o nó exemplo.br e os nós www e correio, ligados a ele. À " +
        "direita, a zona vendas.exemplo.br contém o nó vendas e os nós loja e estoque. Uma " +
        "seta sai do nó exemplo.br, atravessa a fronteira entre as duas regiões e chega ao " +
        "nó vendas, rotulada com registro NS e dado de cola. Uma frase no rodapé lembra que " +
        "cada zona é servida por pelo menos dois servidores com autoridade.</title>" +
        '<rect class="traco" x="40" y="18" width="330" height="160" rx="10" ' +
        'stroke-dasharray="6 5"/>' +
        '<text class="rotulo-secundario" x="50" y="34" font-size="11">zona exemplo.br</text>' +
        '<rect class="traco" x="385" y="100" width="195" height="160" rx="10" ' +
        'stroke-dasharray="6 5"/>' +
        '<text class="rotulo-secundario" x="393" y="116" font-size="11">zona vendas.exemplo.br</text>' +
        '<path class="traco" d="M215 76 L125 128"/>' +
        '<path class="traco" d="M240 76 L240 128"/>' +
        '<path class="traco" d="M465 158 L445 212"/>' +
        '<path class="traco" d="M505 158 L520 212"/>' +
        '<path class="traco" d="M310 60 L485 60 L485 118"/>' +
        '<path class="seta" d="M479 118 L491 118 L485 126 Z"/>' +
        '<text class="rotulo-secundario" x="398" y="52" text-anchor="middle" ' +
        'font-size="11">registro NS e dado de cola</text>' +
        '<rect class="caixa" x="170" y="44" width="140" height="32" rx="8"/>' +
        '<text x="240" y="65" text-anchor="middle" font-size="12">exemplo.br</text>' +
        '<rect class="caixa" x="55" y="128" width="110" height="32" rx="8"/>' +
        '<text x="110" y="149" text-anchor="middle" font-size="12">www</text>' +
        '<rect class="caixa" x="185" y="128" width="110" height="32" rx="8"/>' +
        '<text x="240" y="149" text-anchor="middle" font-size="12">correio</text>' +
        '<rect class="caixa-destaque" x="420" y="126" width="130" height="32" rx="8"/>' +
        '<text x="485" y="147" text-anchor="middle" font-size="12">vendas</text>' +
        '<rect class="caixa" x="400" y="212" width="80" height="32" rx="8"/>' +
        '<text x="440" y="233" text-anchor="middle" font-size="12">loja</text>' +
        '<rect class="caixa" x="490" y="212" width="80" height="32" rx="8"/>' +
        '<text x="530" y="233" text-anchor="middle" font-size="12">estoque</text>' +
        '<text class="rotulo-secundario" x="300" y="285" text-anchor="middle" ' +
        'font-size="12">cada zona é servida por pelo menos dois servidores com autoridade</text>' +
        "</svg>" +
        "<figcaption>A zona pai para onde a delegação começa e guarda apenas o ponteiro. " +
        "Sem o dado de cola, o ponteiro seria um nome que só o servidor apontado saberia " +
        "resolver, e a resolução entraria em círculo.</figcaption>" +
        "</figure>" +
        "<p>Cada zona é replicada, e a divisão de papéis é simples. Um servidor " +
        "<strong>principal</strong> lê os dados da zona de um arquivo mestre local, onde os " +
        "administradores os escrevem. Os servidores <strong>secundários</strong> baixam a " +
        "zona do principal e depois voltam periodicamente a conferir se a cópia " +
        "corresponde à que o principal mantém, em geral uma ou duas vezes por dia. Essa " +
        "cópia é chamada de transferência de zona.</p>" +
        "<p>Qualquer servidor é livre para guardar em cache dados de outros, e nesse caso " +
        "ele avisa nas respostas que é um servidor <strong>não autoridade</strong> sobre " +
        "aquele dado. É a distinção que permite ao cliente saber se recebeu uma resposta de " +
        "quem manda ou uma cópia possivelmente antiga.</p>" +
        "<h3>O prazo de validade, que é o único freio da inconsistência</h3>" +
        "<p>Cada entrada de uma zona carrega um <strong>tempo de vida</strong>, conhecido " +
        "pela sigla TTL. Ao guardar em cache um dado vindo de um servidor com autoridade, o " +
        "servidor não autoridade anota esse prazo e só fornece o dado durante ele. Passado " +
        "o prazo, ele volta a consultar a autoridade.</p>" +
        "<p>O prazo é escolhido pelo administrador da zona, e é aí que o mecanismo fica " +
        "interessante. Atributos que raramente mudam recebem prazo longo, o que minimiza o " +
        "tráfego. Um administrador que sabe de uma mudança marcada para amanhã reduz o " +
        "prazo hoje, para que o mundo pare de guardar o valor antigo antes que ele deixe de " +
        "valer. O TTL é o botão que equilibra atualidade e tráfego, e ele é ajustado à mão " +
        "conforme o que se espera do dado.</p>" +
        "<p>Todo servidor DNS conhece os endereços dos servidores raiz, que mudam pouco. Na " +
        "prática, os servidores raiz guardam entradas para vários níveis de domínio, e não " +
        "apenas para os de primeiro nível, o que encurta a navegação. Um nome de três " +
        "componentes como <code>www.berkeley.edu</code> se resolve, no pior caso, em duas " +
        "etapas, uma até um servidor raiz que tem a entrada apropriada e outra até o " +
        "servidor cujo nome ele devolveu.</p>" +
        "<p>Há um truque de distribuição de carga que depende do TTL e vale conhecer. " +
        "Quando um serviço muito usado é atendido por vários computadores, todos recebem o " +
        "mesmo nome de domínio, com um registro de endereço por máquina. O servidor de " +
        "nomes devolve esses endereços em rodízio, de modo que clientes sucessivos são " +
        "atendidos por máquinas diferentes. O cache tem o potencial de estragar o esquema, " +
        "porque quem já tem o endereço guardado continua usando aquele, e a defesa é dar a " +
        "esses registros um prazo de validade curto.</p>" +
        '<div class="callout">' +
        '<p class="callout-title">💡 O DNS aceita ficar inconsistente, de propósito</p>' +
        "<p>Se um dado de nomes muda, outros servidores podem continuar entregando a versão " +
        "antiga por dias, e o DNS não aplica nenhuma das técnicas fortes de replicação que " +
        "o tópico 10 vai apresentar. A aposta é dupla. Nomes mudam raramente, e a " +
        "inconsistência só incomoda no momento em que alguém tenta de fato usar um dado " +
        "obsoleto. Repare que o próprio DNS não trata de como o dado antigo é detectado, e " +
        "empurra esse problema para a aplicação, que vai simplesmente falhar ao conectar e " +
        "tentar de novo.</p>" +
        "</div>" +
        "<h3>O DNS que existe hoje</h3>" +
        "<p>A descrição acima supõe que a aplicação fala com um resolvedor local, dentro da " +
        "própria organização ou do provedor de acesso, e que esse resolvedor conversa com " +
        "os servidores de nomes. Foi assim durante décadas, e três mudanças recentes " +
        "alteraram o quadro o bastante para que se fale em DNS moderno.</p>" +
        "<p>A primeira é que muitas organizações passaram a usar um resolvedor externo. " +
        "Isso quebra uma suposição das redes de distribuição de conteúdo, que escolhem um " +
        "servidor próximo do cliente olhando o endereço de quem pergunta. O endereço que " +
        "elas veem é o do resolvedor, e não o do cliente, então um resolvedor distante leva " +
        "a uma escolha ruim. A correção é o resolvedor local informar também o endereço de " +
        "quem pediu, para que a escolha volte a fazer sentido.</p>" +
        "<p>A segunda é que muitos clientes, e os navegadores em particular, ignoram a " +
        "configuração da organização e falam direto com um resolvedor de escolha própria. " +
        "Não há nada de errado nisso, e há uma consequência prática, porque medir o que " +
        "acontece com as consultas de uma organização fica bem mais difícil, sobretudo " +
        "quando a conversa entre cliente e resolvedor também é cifrada.</p>" +
        "<p>A terceira é que cada vez menos organizações executam servidores de nomes " +
        "próprios, e a resolução é terceirizada. O efeito acumulado é que o DNS vem se " +
        "tornando menos descentralizado, o que é um resultado curioso para o serviço que " +
        "serve de exemplo de descentralização em todo livro de sistemas distribuídos. As " +
        "consequências ainda não estão claras, e espalhar o DNS por mais organizações " +
        "parece uma preocupação razoável.</p>" +
        "<h3>Assinar as respostas e proteger quem pergunta</h3>" +
        "<p>Sendo um dos serviços mais necessários da Internet, o DNS precisa de um meio de " +
        "verificar se uma resposta é legítima. É o papel das extensões de segurança do DNS, " +
        "conhecidas pela sigla DNSSEC, hoje suportadas pelos domínios de primeiro nível da " +
        "grande maioria dos países.</p>" +
        "<p>A ideia é direta e usa exatamente o ferramental do tópico 07. Os registros de " +
        "recurso de um mesmo tipo são agrupados num conjunto, e o conjunto inteiro é " +
        "assinado pela organização dona da zona. Quem recebe calcula o resumo do conjunto, " +
        "verifica a assinatura com a chave pública correspondente e aceita os registros se " +
        "os dois valores baterem. Essa chave pública é publicada na própria zona e chama-se " +
        "<strong>chave de assinatura de zona</strong>.</p>" +
        "<p>Duas alterações no protocolo foram necessárias para isso caber. Foi preciso " +
        "criar campos novos para transportar assinaturas e chaves, o que era esperado. E " +
        "foi preciso aceitar consultas e respostas maiores que 512 bytes, porque o DNS " +
        "original dependia de tudo caber num pacote desse tamanho, o que os mecanismos de " +
        "extensão do protocolo resolveram.</p>" +
        "<p>Falta a parte que sustenta o resto, que é saber se a chave de assinatura de zona " +
        "é legítima. As chaves de assinatura de zona são elas próprias agrupadas e " +
        "assinadas com outro segredo, cuja chave pública correspondente se chama " +
        "<strong>chave de assinatura de chave</strong>. Um resumo dessa segunda chave é " +
        "guardado e assinado pelo domínio pai, que por sua vez assina com a chave de zona " +
        "dele, também avalizada pela chave de chave dele. O encadeamento sobe até a " +
        "raiz.</p>" +
        '<figure class="figura" id="fig-dnssec">' +
        '<svg viewBox="0 0 600 340" role="img" aria-labelledby="fig-dnssec-titulo">' +
        '<title id="fig-dnssec-titulo">Três caixas empilhadas em coluna, de baixo para ' +
        "cima, representando as zonas exemplo.br, ponto br e raiz, cada uma com a chave de " +
        "zona e a chave de chave. Setas apontam para cima, ligando cada zona à zona pai, e " +
        "indicam que o pai assina a chave do filho. Na base, uma caixa destacada com o " +
        "conjunto de registros aponta para a zona exemplo.br, indicando que os registros " +
        "são assinados pela chave de zona.</title>" +
        '<rect class="caixa" x="150" y="16" width="300" height="54" rx="10"/>' +
        '<text x="300" y="40" text-anchor="middle" font-size="13">raiz</text>' +
        '<text class="rotulo-secundario" x="300" y="58" text-anchor="middle" ' +
        'font-size="11">chave de zona e chave de chave</text>' +
        '<rect class="caixa" x="150" y="112" width="300" height="54" rx="10"/>' +
        '<text x="300" y="136" text-anchor="middle" font-size="13">.br</text>' +
        '<text class="rotulo-secundario" x="300" y="154" text-anchor="middle" ' +
        'font-size="11">chave de zona e chave de chave</text>' +
        '<rect class="caixa" x="150" y="208" width="300" height="54" rx="10"/>' +
        '<text x="300" y="232" text-anchor="middle" font-size="13">exemplo.br</text>' +
        '<text class="rotulo-secundario" x="300" y="250" text-anchor="middle" ' +
        'font-size="11">chave de zona e chave de chave</text>' +
        '<path class="traco" d="M240 112 L240 78"/>' +
        '<path class="seta" d="M234 78 L246 78 L240 70 Z"/>' +
        '<text class="rotulo-secundario" x="258" y="96" font-size="11">a raiz assina a chave de .br</text>' +
        '<path class="traco" d="M240 208 L240 174"/>' +
        '<path class="seta" d="M234 174 L246 174 L240 166 Z"/>' +
        '<text class="rotulo-secundario" x="258" y="192" font-size="11">o .br assina a chave de exemplo.br</text>' +
        '<rect class="caixa-destaque" x="190" y="290" width="220" height="34" rx="8"/>' +
        '<text x="300" y="312" text-anchor="middle" font-size="12">conjunto de registros</text>' +
        '<path class="traco" d="M240 290 L240 272"/>' +
        '<path class="seta" d="M234 272 L246 272 L240 264 Z"/>' +
        '<text class="rotulo-secundario" x="258" y="284" font-size="11">assinados pela chave de zona</text>' +
        "</svg>" +
        "<figcaption>É a cadeia de certificados do tópico 07 aplicada à própria hierarquia " +
        "de nomes. A confiança sobe até a raiz, e quem confia na raiz consegue validar " +
        "qualquer resposta abaixo dela.</figcaption>" +
        "</figure>" +
        "<p>Um detalhe do procedimento merece ser dito, porque ele é o que dá sentido ao " +
        "desenho. A zona pai não guarda o resumo da chave do filho sem antes verificar que " +
        "aquela zona filha é de fato de quem diz ser e opera como deveria. A cadeia " +
        "criptográfica sustenta apenas o que a verificação administrativa colocou nela, o " +
        "que é a mesma lição que a autoridade certificadora ensinou no tópico 07.</p>" +
        "<p>Assinar as respostas resolve metade do problema. A outra metade é a privacidade " +
        "de quem pergunta. A informação guardada no DNS é pública, e pode ser vista como um " +
        "banco de dados aberto ao mundo. O que um cliente específico está perguntando, " +
        "porém, não é da conta de ninguém, e a lista das consultas de uma pessoa descreve " +
        "com precisão o que ela faz na Internet.</p>" +
        "<p>Dois mecanismos são usados hoje. O primeiro monta um canal seguro até um " +
        "resolvedor remoto com o protocolo de segurança da camada de transporte, que o " +
        "tópico 07 apresentou, o que impede um terceiro de descobrir a quais sites a " +
        "aplicação se refere. O segundo faz as consultas viajarem dentro de HTTPS, o que " +
        "oferece proteção equivalente e tira as consultas do controle dos administradores " +
        "locais, ignorando de quebra as políticas locais de acesso, para o bem e para o " +
        "mal.</p>" +
        "<p>Falta ainda um cuidado que os dois não cobrem. Nas duas formas de navegação da " +
        "seção 3, o caminho inteiro é enviado a cada servidor consultado, então o servidor " +
        "raiz fica sabendo o nome completo que se procura. Uma proteção mais barata e em " +
        "geral suficiente é pedir a cada servidor apenas a parte do caminho que lhe diz " +
        "respeito, perguntando ao raiz somente por <code>.br</code> em vez do nome todo. " +
        "Limitar a consulta ao mínimo necessário é uma boa regra de privacidade, e ela vale " +
        "muito além do DNS.</p>",
      slides: [
        {
          title: "O que o DNS substituiu",
          html:
            "<ul>" +
            "<li>Antes, um arquivo mestre único era baixado por transferência de arquivo " +
            "em cada máquina</li>" +
            "<li>Ele não escalava, não deixava a organização administrar os próprios nomes " +
            "e só servia a endereços</li>" +
            "<li>A resposta combina particionamento hierárquico, replicação e cache</li>" +
            "<li>A engenharia da combinação é que o fez atender à Internet inteira</li>" +
            "</ul>"
        },
        {
          title: "O espaço de nomes de domínio",
          html:
            "<ul>" +
            "<li>É uma árvore com raiz, com rótulo de até 63 caracteres e nome de até " +
            "255</li>" +
            "<li>Escreve-se do rótulo mais à direita para a esquerda, e a raiz é o ponto " +
            "final</li>" +
            "<li>Uma subárvore é um <strong>domínio</strong>, e nem todo nome de domínio " +
            "identifica um domínio</li>" +
            "<li>No topo ficam os genéricos e os de país, e o sufixo geográfico é " +
            "convenção</li>" +
            "<li>Uma consulta traz nome, classe e tipo, e para a Internet a classe é " +
            "<code>IN</code></li>" +
            "</ul>"
        },
        {
          title: "Os registros de recurso",
          ref: "tab-registros-dns"
        },
        {
          title: "A zona é a unidade de divisão",
          ref: "fig-zonas",
          html:
            "<ul>" +
            "<li>Guarda o domínio menos os subdomínios delegados, com o ponteiro e o dado " +
            "de cola</li>" +
            "<li>Exige pelo menos dois servidores com autoridade</li>" +
            "</ul>"
        },
        {
          title: "Principal, secundário e prazo de validade",
          html:
            "<ul>" +
            "<li>O principal lê a zona de um arquivo mestre e os secundários a baixam " +
            "dele</li>" +
            "<li>Quem responde de cache se declara <strong>não autoridade</strong></li>" +
            "<li>Cada entrada tem um <strong>tempo de vida</strong>, escolhido pelo " +
            "administrador</li>" +
            "<li>Prazo curto antecipa a mudança, e prazo longo economiza tráfego</li>" +
            "<li>O rodízio de endereços distribui carga e depende de prazo curto para " +
            "funcionar</li>" +
            "</ul>"
        },
        {
          title: "O DNS que existe hoje",
          html:
            "<ul>" +
            "<li>Resolvedor externo atrapalha a escolha de servidor próximo pela rede de " +
            "distribuição</li>" +
            "<li>Navegadores falam direto com o resolvedor que escolhem, e medir fica mais " +
            "difícil</li>" +
            "<li>Cada vez menos organizações rodam servidor próprio, e a resolução é " +
            "terceirizada</li>" +
            "<li>O exemplo clássico de descentralização vem se tornando menos " +
            "descentralizado</li>" +
            "</ul>"
        },
        {
          title: "DNSSEC, a cadeia de confiança",
          ref: "fig-dnssec",
          html:
            "<ul>" +
            "<li>Registros de mesmo tipo são agrupados e o conjunto é assinado</li>" +
            "<li>A chave de zona é avalizada pela chave de chave, que o pai assina</li>" +
            "</ul>"
        },
        {
          title: "Proteger quem pergunta",
          html:
            "<ul>" +
            "<li>O dado do DNS é público, e a lista de consultas de uma pessoa não é</li>" +
            "<li>O canal até o resolvedor é fechado com TLS, ou as consultas viajam dentro " +
            "de HTTPS</li>" +
            "<li>Dentro de HTTPS, a consulta sai do alcance do administrador local</li>" +
            "<li>Pedir a cada servidor só a parte do caminho que lhe diz respeito é mais " +
            "barato e quase sempre basta</li>" +
            "</ul>"
        }
      ]
    },
    {
      title: "Nomes por atributo, e quando o nome dispensa o endereço",
      html:
        "<p>Tudo o que veio até aqui supõe que quem procura sabe o nome. Nem sempre sabe. " +
        "Às vezes o que se tem é uma descrição, e as perguntas ficam assim. Qual é o nome " +
        "do usuário cujo telefone é 11 5555-9980? Que computadores deste prédio executam " +
        "macOS? Onde consigo imprimir uma imagem colorida em alta resolução? Nenhuma delas " +
        "pode ser respondida por um serviço que só sabe ir do nome para os atributos.</p>" +
        "<p>A resposta é a <strong>atribuição de nomes baseada em atributos</strong>, em " +
        "que a entidade é descrita por pares formados por atributo e valor. Ao dizer quais " +
        "valores certos atributos devem ter, quem pergunta restringe o conjunto de " +
        "entidades que lhe interessam, e cabe ao sistema devolver as que atendem à " +
        "descrição. Um serviço que guarda vínculos entre nomes e atributos e pesquisa " +
        "entradas que casam com uma especificação de atributos chama-se " +
        "<strong>serviço de diretório</strong>.</p>" +
        "<p>A analogia com o catálogo telefônico ajuda e é usada há décadas. O serviço de " +
        "nomes é o das páginas brancas, porque parte do nome e devolve os dados. O serviço " +
        "de diretório é o das páginas amarelas, porque parte da descrição e devolve quem " +
        "atende. As duas metades do catálogo respondem a necessidades diferentes, e nenhuma " +
        "substitui a outra.</p>" +
        "<h3>Por que isto é mais difícil do que parece</h3>" +
        "<p>Projetar um bom conjunto de atributos não é trivial, e na maior parte dos casos " +
        "o trabalho é manual. Mesmo havendo consenso sobre quais atributos usar, a prática " +
        "mostra que preencher os valores de forma consistente, num grupo variado de " +
        "pessoas, é um problema por si só. Quem já procurou música ou filme numa base " +
        "grande da Internet conhece o efeito, com o mesmo artista escrito de cinco jeitos " +
        "diferentes.</p>" +
        "<p>Houve pesquisa para unificar a forma de descrever recursos, e o resultado mais " +
        "relevante para sistemas distribuídos é o modelo de descrição de recursos conhecido " +
        "pela sigla RDF. Nele, um recurso é descrito por triplas formadas por sujeito, " +
        "predicado e objeto, como em uma tripla que diz que a pessoa tem nome Alice. Cada " +
        "um dos três pode ser ele mesmo um recurso, de modo que Alice pode ser uma " +
        "referência a um arquivo que se busca depois, e as referências são essencialmente " +
        "URLs.</p>" +
        "<p>O problema difícil, porém, é de desempenho, e ele é estrutural. Num sistema de " +
        "nomes estruturado, resolver um nome desce pela árvore e toca um nó folha. Num " +
        "sistema baseado em atributos, pesquisar valores exige em princípio uma varredura " +
        "exaustiva de todos os descritores. Técnicas de indexação atenuam isso, e a " +
        "varredura ainda é tolerável dentro de um armazenamento único. Enviar a mesma " +
        "consulta a centenas de servidores que implementam juntos um armazenamento " +
        "distribuído já não é uma boa ideia.</p>" +
        "<h3>O LDAP, o diretório que sobrou</h3>" +
        "<p>A saída comum para diretórios distribuídos é combinar nomeação estruturada com " +
        "nomeação por atributos, e o produto dessa combinação que se adotou em toda parte é " +
        "o <strong>protocolo leve de acesso a diretório</strong>, conhecido pela sigla " +
        "LDAP. Ele está por trás do Active Directory da Microsoft e de boa parte da " +
        "autenticação corporativa que existe.</p>" +
        "<p>A linhagem dele explica o adjetivo. O LDAP deriva do serviço de diretório " +
        "X.500, definido pelas organizações de padronização dentro do conjunto de padrões " +
        "de interconexão de sistemas abertos. O X.500 supunha que as organizações " +
        "publicariam as próprias informações em diretórios públicos, dentro de um sistema " +
        "comum, e essa suposição não se confirmou. Somou-se a isso a complexidade das " +
        "implementações, que dependiam da pilha inteira daqueles padrões. O LDAP simplificou " +
        "o acesso, deixando o cliente falar direto sobre TCP/IP e trocando a codificação " +
        "formal do padrão por codificação textual, e foi ele, e não o X.500, que se " +
        "espalhou.</p>" +
        "<p>Uma <strong>entrada de diretório</strong> é o análogo do registro de recurso do " +
        "DNS. Ela é uma coleção de pares formados por atributo e valor, cada atributo com um " +
        "tipo associado. Alguns atributos têm valor único e outros aceitam vários valores, " +
        "que representam listas. A entrada abaixo descreve os servidores gerais de uma " +
        "organização fictícia, e é um exemplo do formato.</p>" +
        '<div class="tabela-rolagem">' +
        '<table class="tabela-conteudo" id="tab-entrada-ldap">' +
        "<tr><th>Atributo</th><th>Abreviação</th><th>Valor</th></tr>" +
        "<tr><td>País</td><td>C</td><td>BR</td></tr>" +
        "<tr><td>Localidade</td><td>L</td><td>Salto</td></tr>" +
        "<tr><td>Organização</td><td>O</td><td>Exemplo Ltda</td></tr>" +
        "<tr><td>Unidade organizacional</td><td>OU</td><td>Ciência da Computação</td></tr>" +
        "<tr><td>Nome comum</td><td>CN</td><td>Servidor principal</td></tr>" +
        "<tr><td>Servidores de correio</td><td></td><td>192.0.2.3, 192.0.2.6, " +
        "192.0.2.10</td></tr>" +
        "<tr><td>Servidor web</td><td></td><td>192.0.2.20</td></tr>" +
        "</table>" +
        "</div>" +
        "<p>Repare que só a linha dos servidores de correio tem vários valores, e que os " +
        "cinco primeiros atributos seguem uma convenção do padrão. Esses cinco cumprem um " +
        "papel especial, porque são eles que dão nome à entrada.</p>" +
        "<p>Cada entrada precisa ter um nome globalmente único para poder ser pesquisada, e " +
        "esse nome aparece como uma sequência de atributos de nomeação. Cada atributo de " +
        "nomeação chama-se <strong>nome distinto relativo</strong>, e listá-los em sequência " +
        "produz um nome como <code>/C=BR/O=Exemplo Ltda/OU=Ciência da Computação</code>, " +
        "que é globalmente único da mesma forma que um nome de domínio é.</p>" +
        "<p>A consequência é que a coleção de entradas ganha uma hierarquia, chamada de " +
        "árvore de informações de diretório, e ela é exatamente o grafo de nomes da seção " +
        "3. Cada nó representa uma entrada e pode ao mesmo tempo ser um diretório no sentido " +
        "tradicional, com vários filhos. A coleção de todas as entradas se chama base de " +
        "informações de diretório.</p>" +
        "<p>Três operações de pesquisa dão conta dessa dupla natureza. A operação de leitura " +
        "recebe o nome de caminho de uma entrada e devolve o registro dela. A operação de " +
        "listagem devolve os nomes das arestas de saída de um nó, ou seja, os nomes dos " +
        "filhos, sem devolver registro nenhum. E a operação de busca é a que caracteriza um " +
        "diretório, recebendo um nó de base e uma expressão de filtragem, que é uma " +
        "expressão booleana avaliada para cada nó abaixo da base.</p>" +
        "<p>Um filtro pedindo o país igual a BR, a organização igual a Exemplo Ltda, " +
        "qualquer unidade organizacional e o nome comum igual a Servidor principal devolve " +
        "os servidores principais de todos os departamentos daquela organização. É " +
        "justamente esse pedido que expõe o custo, porque atender a ele exige percorrer as " +
        "entradas de cada departamento e combinar os resultados numa resposta só. Buscas " +
        "assim aceitam limites de abrangência, de tempo e de tamanho da resposta, e sem " +
        "esses limites uma busca mal formulada consome o serviço.</p>" +
        "<p>A implementação segue o molde do DNS mais do que se costuma notar. A árvore é " +
        "particionada entre servidores, cada parte correspondendo ao que o DNS chama de " +
        "zona, e cada servidor se comporta como um servidor de nomes acrescido das " +
        "operações de busca. Os clientes têm um agente próprio, análogo ao resolvedor. O " +
        "Active Directory leva o arranjo adiante, permitindo que várias árvores coexistam " +
        "ligadas entre si, e para não perder a escala ele mantém um servidor de índice " +
        "global, que é pesquisado primeiro e indica quais árvores precisam ser " +
        "percorridas.</p>" +
        "<p>Vale notar como as duas famílias de nomeação acabam se apoiando. Toda árvore de " +
        "diretório precisa ser alcançável na raiz, e essa raiz costuma ser conhecida por um " +
        "nome de domínio, encontrado por um registro SRV. O registro que a seção 4 " +
        "apresentou como curiosidade é o que permite achar o serviço de diretório sem saber " +
        "o nome da máquina que o executa.</p>" +
        "<p>Fica um argumento de projeto para guardar. Atributos são designadores mais " +
        "poderosos que nomes, porque permitem selecionar entidades por especificação " +
        "precisa, sem conhecer nome nenhum, e porque não expõem ao mundo a estrutura da " +
        "organização, como fazem os nomes particionados por departamento. Mesmo assim, a " +
        "simplicidade dos nomes textuais é tanta que dificilmente eles serão substituídos, " +
        "e o que se vê na prática são os dois convivendo.</p>" +
        "<p>Há um caso especial de serviço de diretório que o tópico 12 desenvolve, chamado " +
        "de <strong>serviço de descoberta</strong>, voltado a dispositivos em redes " +
        "espontâneas, que entram e saem de forma imprevisível. A diferença que interessa " +
        "aqui é de fechamento, no sentido da seção 3. O endereço de um serviço de diretório " +
        "costuma vir pré-configurado no cliente, enquanto um aparelho que acaba de chegar à " +
        "rede não tem essa configuração e precisa recorrer ao multicast, pelo menos na " +
        "primeira vez que procura o serviço de descoberta local.</p>" +
        "<h3>Fazer isso sem servidor central</h3>" +
        "<p>Com a chegada dos sistemas peer to peer, procurou-se um modo descentralizado de " +
        "fazer nomeação por atributos. Perguntar a todo nó do sistema se ele tem algo que " +
        "casa com os pares pedidos é inviável, então o que se busca é um mapeamento de " +
        "pares para servidores de índice, que por sua vez apontem para as entidades.</p>" +
        "<p>O arranjo mais direto usa um servidor por atributo. O servidor do atributo cor " +
        "guarda, para cada valor de cor, o conjunto das entidades que têm aquela cor. Uma " +
        "consulta com três atributos vai aos três servidores correspondentes, e o cliente " +
        "verifica quais entidades aparecem nos três conjuntos devolvidos. A beleza do " +
        "esquema é a simplicidade, e ele tem três defeitos sérios.</p>" +
        "<ul>" +
        "<li>Uma consulta que envolve vários atributos <strong>contata vários servidores " +
        "de índice</strong>, e o custo de comunicação cresce com o número de atributos " +
        "pedidos.</li>" +
        "<li>O <strong>cliente fica encarregado de combinar os conjuntos</strong>, e o " +
        "trabalho é desequilibrado. Procurando o arquivo de Pheriby Smith, ele recebe " +
        "talvez milhões de chaves de sobrenome Smith para descobrir que só um punhado tem o " +
        "primeiro nome Pheriby.</li>" +
        "<li>O esquema <strong>não suporta consulta por faixa</strong> com facilidade, " +
        "então pedir todos os produtos entre mil e dois mil e quinhentos reais não tem " +
        "resposta simples.</li>" +
        "</ul>" +
        "<p>A abordagem mais usada para contornar isso são as <strong>curvas de " +
        "preenchimento de espaço</strong>. A ideia é mapear o espaço de N dimensões, coberto " +
        "pelos N atributos, numa única dimensão, e distribuir o resultado entre servidores " +
        "de índice com uma técnica simples de espalhamento. A propriedade que faz o " +
        "mecanismo funcionar é a preservação de localidade, porque dois índices próximos na " +
        "curva correspondem a pontos próximos no espaço original, e é isso que faz uma " +
        "consulta por faixa cair em poucos servidores. As curvas de Hilbert são o caso " +
        "popular, e o sistema Squid usa um anel Chord como espaço de índices, com o nó " +
        "responsável por um índice guardando as entidades indexadas por ele.</p>" +
        "<p>A essência de todos os arranjos é a mesma, e vale enunciá-la. Atribui-se " +
        "atributos a servidores de modo que o cliente saiba para onde mandar a consulta, e " +
        "ao mesmo tempo se procura equilibrar a carga entre eles. Consulta por faixa exige " +
        "atenção especial, nem que seja para decidir qual servidor responde por qual " +
        "subfaixa, e o equilíbrio de carga é o problema que aparece na prática.</p>" +
        "<h3>Quando o nome dispensa o endereço</h3>" +
        "<p>É hora de questionar a premissa do tópico inteiro. Até aqui, resolver um nome " +
        "produz um endereço, e o endereço é usado para alcançar a entidade. A seção 2 já " +
        "abriu uma exceção, porque no Chord o identificador foi usado diretamente para " +
        "rotear o pedido até o nó responsável, sem endereço no meio. A " +
        "<strong>interligação de redes por dados nomeados</strong> leva essa exceção até o " +
        "nível da rede.</p>" +
        "<p>O princípio é observar que a aplicação não quer saber onde a entidade está " +
        "guardada. Ela quer uma cópia para usar localmente. Então que a aplicação peça a " +
        "entidade pelo nome, e que a rede tome esse nome, roteie o pedido até um lugar " +
        "apropriado onde a entidade esteja e devolva uma cópia. Nesse desenho, a camada de " +
        "dados nomeados assume o papel que o protocolo IP tem hoje, no meio da ampulheta " +
        "que é a pilha da Internet.</p>" +
        "<p>Os nomes continuam estruturados. Um capítulo de livro poderia ser referido por " +
        "um nome que começa pelo domínio da editora e desce por coleção, título, edição, " +
        "versão e capítulo. Isso levanta de imediato a pergunta de como as pessoas e as " +
        "aplicações devem nomear entidades, porque o esquema de nomes precisa ser " +
        "globalmente conhecido e as entidades de alcance mundial precisam de nomes " +
        "globalmente únicos. Como esse acordo é obtido fica fora do escopo da proposta, o " +
        "que é uma limitação honesta e não pequena.</p>" +
        "<p>A objeção imediata é de escala, porque parece impossível achar conteúdo na " +
        "Internet só pelo nome dele. Pensando um pouco, o problema não é diferente do que " +
        "já existe. Como alguém encontraria o ponto de acesso associado ao endereço " +
        "145.100.190.243? Nos dois casos é preciso decidir qual parte do nome, ou do " +
        "endereço, será anunciada no substrato global de roteamento, exatamente como se faz " +
        "hoje com prefixos de endereço entre operadoras. Uma vez que o pedido chegou à rede " +
        "da organização certa, o resto do nome serve para achar o conteúdo lá dentro.</p>" +
        '<figure class="figura" id="fig-roteador-ndn">' +
        '<svg viewBox="0 0 600 280" role="img" aria-labelledby="fig-roteador-ndn-titulo">' +
        '<title id="fig-roteador-ndn-titulo">Uma caixa grande representa o roteador e ' +
        "contém três caixas empilhadas, que são o depósito de conteúdo em destaque, a " +
        "tabela de interesses pendentes e a base de encaminhamento. Uma seta entra pela " +
        "esquerda com o pedido feito pelo nome. Outra seta sai pela esquerda com o dado, " +
        "caso ele já esteja no depósito. Uma terceira seta sai pela direita, a partir da " +
        "base de encaminhamento, quando o pedido precisa seguir adiante. Uma frase no " +
        "rodapé lembra que o pedido guarda a interface por onde entrou, e é por ela que o " +
        "dado volta.</title>" +
        '<rect class="caixa" x="140" y="40" width="320" height="200" rx="12"/>' +
        '<text x="300" y="64" text-anchor="middle" font-size="12">Roteador de dados nomeados</text>' +
        '<rect class="caixa-destaque" x="165" y="78" width="270" height="42" rx="8"/>' +
        '<text x="300" y="104" text-anchor="middle" font-size="12">Depósito de conteúdo</text>' +
        '<rect class="caixa" x="165" y="130" width="270" height="42" rx="8"/>' +
        '<text x="300" y="156" text-anchor="middle" font-size="12">Interesses pendentes</text>' +
        '<rect class="caixa" x="165" y="182" width="270" height="42" rx="8"/>' +
        '<text x="300" y="208" text-anchor="middle" font-size="12">Base de encaminhamento</text>' +
        '<path class="traco" d="M20 99 L132 99"/>' +
        '<path class="seta" d="M132 93 L132 105 L140 99 Z"/>' +
        '<text class="rotulo-secundario" x="76" y="91" text-anchor="middle" ' +
        'font-size="11">pedido pelo nome</text>' +
        '<path class="traco" d="M140 124 L28 124"/>' +
        '<path class="seta" d="M28 118 L28 130 L20 124 Z"/>' +
        '<text class="rotulo-secundario" x="76" y="142" text-anchor="middle" ' +
        'font-size="11">o dado, se já estiver ali</text>' +
        '<path class="traco" d="M460 208 L572 208"/>' +
        '<path class="seta" d="M572 202 L572 214 L580 208 Z"/>' +
        '<text class="rotulo-secundario" x="516" y="200" text-anchor="middle" ' +
        'font-size="11">segue adiante</text>' +
        '<text class="rotulo-secundario" x="300" y="266" text-anchor="middle" ' +
        'font-size="12">o pedido anota a interface por onde entrou, e o dado volta por ela</text>' +
        "</svg>" +
        "<figcaption>Os três elementos resolvem três perguntas diferentes. Se o dado já " +
        "está aqui, se alguém ainda o espera, e para onde mandar o pedido quando as duas " +
        "primeiras respostas forem negativas.</figcaption>" +
        "</figure>" +
        "<p>O <strong>depósito de conteúdo</strong> é um cache de dados já buscados. Se um " +
        "pedido entra e o dado nomeado está ali, o roteador o devolve na hora, sem " +
        "consultar mais ninguém. A <strong>tabela de interesses pendentes</strong> guarda " +
        "pares formados por nome e interface, de modo que, quando o dado chegar, o roteador " +
        "saiba por onde devolvê-lo. Se um dado chegar e não houver mais interesse por ele, " +
        "o roteador pode simplesmente descartá-lo. A <strong>base de encaminhamento</strong> " +
        "diz o que fazer com um pedido que não pôde ser atendido, e ela decide entre " +
        "inundar os vizinhos, iniciar um caminho aleatório ou descartar o pedido.</p>" +
        "<p>Uma restrição incômoda acompanha o desenho, e é ela que decide se a proposta " +
        "funciona. O dado não pode ser modificado sem gerar um nome novo, porque de outro " +
        "modo o cache dos roteadores deixa de valer e a eficiência inteira vai embora. Isso " +
        "parece grave e é menos do que parece, porque quem sabe que pode haver atualização " +
        "sempre pode pedir a versão mais recente. Existem protocolos de sincronização " +
        "próprios para isso, que permitem ao dono de um dado anunciar atualizações a quem " +
        "interessar, e o interessado então busca a versão nova pelo nome dela.</p>" +
        "<p>A segurança fecha o círculo desta disciplina de um jeito elegante. Nomear com " +
        "segurança aqui significa garantir que o nome está ligado de forma infalsificável " +
        "ao conteúdo que ele designa, e a maneira mais simples de conseguir isso é embutir " +
        "no nome um resumo assinado do conteúdo. É o nome autocertificante da seção 2, " +
        "aplicado a um contexto completamente diferente.</p>" +
        "<p>Se a interligação por dados nomeados vai substituir o protocolo IP em parte ou " +
        "no todo, a prática dirá. O motivo de estudá-la aqui é outro e independe disso. Ela " +
        "mostra que resolver o nome para depois usar o endereço é uma escolha de projeto e " +
        "não uma lei da natureza. O tópico começou separando nome, identificador e endereço " +
        "porque essa separação organiza quase tudo o que existe, passou pelos mecanismos " +
        "que localizam entidades sem nenhuma pista no nome, pela máquina de resolução que " +
        "os nomes estruturados permitem, pelo serviço que a Internet inteira usa e pela " +
        "inversão que parte da descrição. Fecha percebendo que a própria separação inicial " +
        "pode ser questionada, o que é o melhor sinal de que ela foi bem entendida.</p>",
      slides: [
        {
          title: "Quando não se sabe o nome",
          html:
            "<ul>" +
            "<li>A entidade é descrita por pares de atributo e valor, e o sistema devolve " +
            "quem casa</li>" +
            "<li>O <strong>serviço de diretório</strong> é o das páginas amarelas, e o de " +
            "nomes é o das brancas</li>" +
            "<li>Projetar o conjunto de atributos é manual, e preencher valores de forma " +
            "consistente é outro problema</li>" +
            "<li>Pesquisar exige varredura exaustiva dos descritores, o que a indexação " +
            "atenua</li>" +
            "</ul>"
        },
        {
          title: "O LDAP e a linhagem do X.500",
          html:
            "<ul>" +
            "<li>O X.500 supunha diretórios públicos comuns, e a suposição não se " +
            "confirmou</li>" +
            "<li>O LDAP fala direto sobre TCP/IP, com codificação textual, e foi ele que " +
            "se espalhou</li>" +
            "<li>A entrada é uma coleção de pares, com atributos de valor único ou de " +
            "vários valores</li>" +
            "<li>Os atributos de nomeação em sequência dão um nome globalmente único</li>" +
            "</ul>"
        },
        {
          title: "Uma entrada de diretório",
          ref: "tab-entrada-ldap"
        },
        {
          title: "Ler, listar e buscar",
          html:
            "<ul>" +
            "<li>A leitura devolve o registro de uma entrada nomeada</li>" +
            "<li>A listagem devolve os nomes dos filhos, e nenhum registro</li>" +
            "<li>A busca recebe um nó de base e um filtro booleano avaliado abaixo " +
            "dele</li>" +
            "<li>Ela é cara, e aceita limites de abrangência, de tempo e de tamanho</li>" +
            "<li>A árvore é particionada como as zonas do DNS, e a raiz é achada por um " +
            "registro SRV</li>" +
            "</ul>"
        },
        {
          title: "Fazer isso sem servidor central",
          html:
            "<ul>" +
            "<li>Um servidor por atributo obriga a contatar vários e a combinar no " +
            "cliente</li>" +
            "<li>O cliente recebe milhões de Smith para achar um Pheriby</li>" +
            "<li>Consulta por faixa não tem resposta simples nesse arranjo</li>" +
            "<li>A <strong>curva de preenchimento de espaço</strong> reduz N dimensões a " +
            "uma preservando localidade</li>" +
            "<li>Equilibrar a carga entre servidores é o problema que sobra</li>" +
            "</ul>"
        },
        {
          title: "O roteador de dados nomeados",
          ref: "fig-roteador-ndn",
          html:
            "<ul>" +
            "<li>A aplicação pede pelo nome, e a rede devolve uma cópia</li>" +
            "<li>O dado precisa ser imutável, senão o cache dos roteadores deixa de " +
            "valer</li>" +
            "</ul>"
        },
        {
          title: "O que o tópico mostrou",
          html:
            "<ul>" +
            "<li>Nome, identificador e endereço organizam quase tudo o que existe</li>" +
            "<li>Nome plano obriga a inventar mecanismos de localização</li>" +
            "<li>Nome estruturado permite uma máquina de resolução que particiona e " +
            "delega</li>" +
            "<li>O DNS combina particionamento, replicação e cache, e aceita ficar " +
            "inconsistente</li>" +
            "<li>Partir da descrição inverte o problema, e nomear com dados questiona a " +
            "premissa</li>" +
            "</ul>"
        }
      ]
    }
  ],

  quiz: [
    {
      question:
        "Um serviço Web é atendido por três servidores, com endereços diferentes, e a " +
        "empresa pretende trocar as máquinas no ano que vem. Por que usar um dos endereços " +
        "como nome habitual do serviço é uma escolha ruim?",
      options: [
        "Porque endereços de rede são sempre reservados a máquinas físicas e jamais podem ser atribuídos a serviços, o que exigiria um registro de tipo diferente no serviço de nomes.",
        "Porque a entidade oferece vários pontos de acesso, o que torna arbitrária a escolha de um deles, e porque o endereço deixa de valer quando ela muda de lugar.",
        "Porque endereços de rede são cadeias de bits que ninguém consegue memorizar, e a única objeção real ao uso deles é sempre a dificuldade de leitura por pessoas.",
        "Porque um endereço identifica a entidade em si, e nunca o ponto de acesso, o que impede o serviço de nomes de guardar mais de um atributo por entidade nomeada."
      ],
      answer: 1,
      explanation:
        "São duas razões independentes, e a legibilidade não é nenhuma delas. A entidade " +
        "troca de ponto de acesso, e aí toda referência escrita com o endereço antigo " +
        "aponta para o nada ou para outra entidade. E uma entidade pode oferecer vários " +
        "pontos de acesso ao mesmo tempo, o que torna arbitrária a escolha de um deles. Um " +
        "nome independente de localização resolve os dois casos."
    },
    {
      question:
        "Um catálogo publica referências para artigos científicos e quer que elas continuem " +
        "válidas por décadas, mesmo que os arquivos mudem de servidor. O que distingue um " +
        "URN de um URL nessa decisão?",
      options: [
        "O URN traz o método de acesso e a localização do recurso, o que dispensa qualquer serviço de resolução e o torna imune a link quebrado.",
        "O URN e o URL são a mesma coisa escrita de formas diferentes, e a escolha entre eles é apenas uma questão de preferência de sintaxe.",
        "O URN só pode ser usado dentro de uma organização, enquanto o URL funciona na Internet inteira e é a única opção de alcance global.",
        "O URN é um nome puro, que identifica o recurso sem dizer onde ele está e por isso exige um serviço de resolução para virar algo acessível."
      ],
      answer: 3,
      explanation:
        "O URL traz localização e método de acesso, o que o torna eficiente e sujeito a " +
        "link quebrado quando o recurso muda de lugar. O URN é um nome puro, como " +
        "urn:ISBN:0-201-62433-8, e justamente por não dizer onde o recurso está, ele exige " +
        "um serviço de resolução. Os dois são URIs, e o debate sobre qual usar continua " +
        "aberto."
    },
    {
      question:
        "Uma entidade móvel deixa, em cada lugar de onde sai, uma referência para a nova " +
        "localização. Qual é o problema mais grave desse mecanismo de ponteiros de " +
        "encaminhamento?",
      options: [
        "A entidade fica inalcançável assim que um elo da corrente se perde, e correntes longas ainda ficam caras de percorrer e frágeis de manter.",
        "O mecanismo só funciona se todas as máquinas envolvidas pertencerem ao mesmo domínio administrativo, o que restringe seu uso a uma rede local.",
        "A entidade precisa avisar previamente todos os clientes conhecidos antes de cada mudança, o que gera tráfego proporcional ao número de clientes.",
        "Cada consulta precisa ser difundida para toda a rede antes de a corrente ser percorrida, o que interrompe máquinas que nada têm com aquela busca."
      ],
      answer: 0,
      explanation:
        "São três defeitos, e o mais grave é a fragilidade. Perder um único ponteiro torna " +
        "a entidade inalcançável dali em diante. Somam-se a isso o custo de percorrer uma " +
        "corrente longa e a obrigação de todos os lugares intermediários manterem o pedaço " +
        "deles da corrente. Por isso sistemas que usam a técnica precisam encurtar correntes " +
        "periodicamente."
    },
    {
      question:
        "No Chord, cada nó mantém uma tabela de dedos em vez de conhecer apenas o vizinho " +
        "seguinte no anel. O que essa tabela muda no custo de uma busca?",
      options: [
        "Ela permite que qualquer nó responda a qualquer chave sem repassar o pedido, o que torna toda busca uma operação de um único salto.",
        "Ela guarda atalhos cuja distância dobra a cada entrada, o que faz cada salto cortar boa parte do que falta e reduz a busca à ordem do logaritmo do número de nós.",
        "Ela replica em cada nó a tabela completa de chaves e responsáveis, o que elimina a busca em troca de um custo alto de atualização a cada entrada de nó.",
        "Ela guarda o endereço físico dos nós mais próximos na rede real, o que reduz a latência de cada salto sem alterar o número de saltos necessários."
      ],
      answer: 1,
      explanation:
        "Conhecer só o sucessor faria um pedido percorrer em média metade do anel. A tabela " +
        "de dedos aponta para o primeiro nó que vem depois de distâncias que dobram, então " +
        "o nó conhece bem a vizinhança e conhece pontos cada vez mais distantes. Cada salto " +
        "corta pelo menos metade do que faltava, e a busca custa da ordem do logaritmo do " +
        "número de nós."
    },
    {
      question:
        "Um administrador cria dois apelidos num espaço de nomes, um por vínculo forte e " +
        "outro por vínculo simbólico. Qual é a diferença de comportamento durante a " +
        "resolução?",
      options: [
        "O vínculo forte devolve o nome guardado e a resolução recomeça, enquanto o vínculo simbólico leva direto ao nó de destino e encerra a resolução ali.",
        "Os dois levam ao mesmo nó pelo mesmo caminho, e a diferença está apenas no espaço em disco que cada um ocupa na tabela de diretório.",
        "O vínculo forte leva ao nó de destino e a resolução acaba, enquanto o vínculo simbólico guarda um nome de caminho e a resolução recomeça com ele.",
        "O vínculo simbólico só é resolvido quando o nó de destino está no mesmo servidor, e nos demais casos ele é ignorado pelo resolvedor."
      ],
      answer: 2,
      explanation:
        "No vínculo forte, dois nomes de caminho absolutos levam ao mesmo nó do grafo e a " +
        "resolução termina ali. No vínculo simbólico, o nó folha guarda um nome de caminho " +
        "em vez do endereço, e a resolução devolve esse nome e recomeça com ele. É esse " +
        "reinício que permite ciclos no espaço de nomes, defendidos por um limite de passos " +
        "ou pelo veto ao apelido cíclico."
    },
    {
      question:
        "Um serviço de nomes atende domínios administrativos que se recusam a revelar uns " +
        "aos outros como os dados estão distribuídos entre seus servidores. Que modelo de " +
        "navegação é viável nessa situação?",
      options: [
        "A navegação iterativa, porque o cliente recebe o endereço do próximo servidor e decide sozinho a quem perguntar em seguida.",
        "A navegação por multicast, porque a pergunta chega a todos os servidores ao mesmo tempo e só quem tem o nome precisa se identificar.",
        "A navegação recursiva controlada pelo servidor, porque a cadeia de servidores resolve o nome e devolve os atributos sem revelar onde cada parte está guardada.",
        "A navegação não recursiva controlada pelo servidor, porque o servidor escolhido age como cliente e consulta os pares em nome de quem perguntou."
      ],
      answer: 2,
      explanation:
        "A iterativa entrega ao cliente o endereço de cada servidor seguinte, e a não " +
        "recursiva controlada pelo servidor faz o mesmo do lado do servidor escolhido. As " +
        "duas revelam a disposição dos dados. Só a recursiva devolve os atributos sem " +
        "expor onde eles moram, e por isso ela é a única viável quando os domínios se " +
        "escondem uns dos outros."
    },
    {
      question:
        "Por que os servidores da camada global de um espaço de nomes mundial suportam " +
        "apenas navegação iterativa, mesmo com a recursiva trazendo vantagens de cache?",
      options: [
        "Porque a recursiva exige que cada servidor resolva o nome completo e mantenha a requisição aberta, e essa carga é alta demais para quem recebe consultas do mundo inteiro.",
        "Porque a recursiva não funciona quando o nome tem mais de três componentes, e nomes da camada global costumam ser mais longos do que isso.",
        "Porque a recursiva impede o uso de cache no cliente, e a camada global depende do cache do cliente para responder dentro do tempo esperado.",
        "Porque a recursiva exige um canal seguro entre cada par de servidores, e a camada global não pode assumir confiança entre organizações diferentes."
      ],
      answer: 0,
      explanation:
        "Na recursiva, o servidor precisa dar conta da resolução completa do nome, ainda " +
        "que em cooperação com outros, e enquanto isso a requisição fica aberta. A carga " +
        "resultante é alta demais para servidores que recebem consultas do mundo inteiro. " +
        "O cache do cliente continua funcionando nos dois modelos, e é justamente ele que " +
        "torna aceitável a camada global responder em segundos."
    },
    {
      question:
        "No DNS, os dados de atribuição de nomes são divididos em zonas. O que a " +
        "arquitetura exige de cada zona, e por quê?",
      options: [
        "Exige que a zona seja mantida num único servidor mestre, sem cópia alguma em outra máquina, para que nunca haja divergência entre versões dos mesmos registros.",
        "Exige que a zona contenha também os dados de todos os subdomínios abaixo dela, inclusive os delegados, para que uma consulta a qualquer nome termine num servidor só.",
        "Exige que toda consulta a nomes daquela zona comece num servidor raiz, mesmo quando o resolvedor já tem a resposta em cache, para revalidar a delegação a cada acesso.",
        "Exige dois servidores com autoridade, um principal lendo o arquivo mestre e secundários baixando a zona dele, para sobreviver à falha de uma máquina."
      ],
      answer: 3,
      explanation:
        "A arquitetura recusa deixar qualquer parte do espaço de nomes dependendo de uma " +
        "máquina só, e por isso exige pelo menos dois servidores com autoridade. O " +
        "principal lê os dados de um arquivo mestre local e os secundários os baixam dele, " +
        "conferindo periodicamente. Uma zona guarda o domínio menos os subdomínios " +
        "delegados, e não os dados deles."
    },
    {
      question:
        "Um administrador vai mudar amanhã o endereço de um servidor muito acessado. Que " +
        "providência ele toma hoje no DNS, e por quê?",
      options: [
        "Reduz o tempo de vida daquela entrada, para que os servidores não autoridade parem de fornecer o valor antigo de cache antes que ele deixe de valer.",
        "Aumenta o tempo de vida daquela entrada, para que os servidores não autoridade guardem o valor por mais tempo e absorvam o pico de consultas da migração.",
        "Registra a entrada como não autoridade, para que os clientes consultem sempre o servidor principal e nunca recebam uma cópia guardada em cache.",
        "Solicita uma transferência de zona a todos os servidores secundários, o que remove de imediato o valor antigo dos caches espalhados pela Internet."
      ],
      answer: 0,
      explanation:
        "O tempo de vida é o prazo durante o qual um servidor não autoridade pode fornecer " +
        "o dado guardado. Encurtá-lo antes da mudança faz o mundo parar de guardar o valor " +
        "antigo por muito tempo. A transferência de zona só atualiza os secundários daquela " +
        "zona, e não alcança os caches dos demais servidores, que continuam válidos até " +
        "expirar o prazo que já receberam."
    },
    {
      question:
        "No DNSSEC, um cliente verifica a assinatura de um conjunto de registros com a " +
        "chave de assinatura de zona publicada naquela zona. O que garante que essa chave " +
        "é legítima?",
      options: [
        "Nada além da própria zona, porque a chave de assinatura de zona é autoassinada e sua validade depende apenas de o cliente confiar no servidor consultado.",
        "Um resumo da chave de assinatura de chave é assinado pelo domínio pai, que por sua vez é avalizado pelo pai dele, formando uma cadeia que sobe até a raiz.",
        "A chave é distribuída junto com o sistema operacional do cliente, de modo que cada zona precisa registrar sua chave nos fabricantes de software antes de assinar.",
        "O tempo de vida do registro que contém a chave, porque uma chave só é aceita enquanto o prazo dela não expirar no cache do servidor não autoridade."
      ],
      answer: 1,
      explanation:
        "As chaves de assinatura de zona são agrupadas e assinadas com outro segredo, cuja " +
        "chave pública é a chave de assinatura de chave. Um resumo dessa segunda chave é " +
        "guardado e assinado pelo domínio pai, e o encadeamento sobe até a raiz. É a mesma " +
        "cadeia de certificados do tópico 07, e ela só vale porque o pai verifica " +
        "administrativamente a zona filha antes de assinar."
    },
    {
      question:
        "Uma consulta pergunta quais computadores de um prédio executam determinado sistema " +
        "operacional. Por que esse tipo de pergunta é mais caro de atender do que resolver " +
        "um nome de domínio?",
      options: [
        "Porque exige percorrer a árvore de trás para a frente, partindo das folhas até a raiz, o que dobra o número de servidores consultados em cada nível.",
        "Porque o resultado precisa ser ordenado antes de ser devolvido, e ordenar entradas espalhadas por vários servidores obriga a reunir tudo num servidor só.",
        "Porque toda consulta baseada em atributos precisa ser assinada e verificada em cada servidor por onde passa, e a verificação criptográfica domina o custo.",
        "Porque pesquisar por atributos exige em princípio uma varredura dos descritores abaixo do nó de base, e a resposta pode depender de entradas em vários servidores."
      ],
      answer: 3,
      explanation:
        "Resolver um nome estruturado desce pela árvore e toca um nó folha. Pesquisar por " +
        "atributos avalia um filtro para cada nó abaixo da base, o que exige em princípio " +
        "uma varredura exaustiva dos descritores e costuma envolver vários servidores. É " +
        "por isso que a operação de busca aceita limites de abrangência, de tempo e de " +
        "tamanho da resposta."
    },
    {
      question:
        "Na interligação de redes por dados nomeados, o dado não pode ser alterado sem " +
        "gerar um nome novo. Qual é a razão dessa restrição?",
      options: [
        "Porque os roteadores guardam cópias do dado no depósito de conteúdo, e uma alteração silenciosa faria essas cópias servirem conteúdo velho sob o mesmo nome.",
        "Porque o nome precisa caber num pacote de tamanho fixo, e alterar o dado alteraria o comprimento do nome além do que o formato permite.",
        "Porque a tabela de interesses pendentes descarta qualquer dado que chegue sem interesse associado, o que impede a entrega de qualquer versão atualizada.",
        "Porque a rede resolve o nome em um endereço antes de buscar o dado, e a alteração invalidaria o endereço obtido na resolução anterior."
      ],
      answer: 0,
      explanation:
        "A eficiência da proposta vem do cache nos roteadores. Se o conteúdo mudasse sob o " +
        "mesmo nome, as cópias guardadas passariam a servir versões velhas e o cache " +
        "deixaria de valer. Quem sabe que pode haver atualização pede a versão mais " +
        "recente, e existem protocolos de sincronização para o dono anunciar as " +
        "atualizações aos interessados."
    }
  ],

  glossary: [
    { term: "Serviço de nomes", definition: "Serviço distinto dos demais, que guarda vínculos entre nomes textuais e os atributos das entidades que eles denotam, e cuja operação principal é resolver um nome, isto é, pesquisar os atributos correspondentes." },
    { term: "Entidade e ponto de acesso", definition: "Entidade é aquilo de que se fala, como um serviço, um arquivo ou uma pessoa. Ponto de acesso é a entidade especial por meio da qual se alcança outra, e o nome de um ponto de acesso é o endereço." },
    { term: "Endereço", definition: "Nome de um ponto de acesso de uma entidade. É eficiente para alcançá-la e é ruim como referência duradoura, porque deixa de valer quando a entidade muda de ponto de acesso ou quando o ponto é atribuído a outra entidade." },
    { term: "Nome independente de localização", definition: "Nome de uma entidade que não depende dos endereços dos pontos de acesso que ela oferece, o que permite mudar a instalação sem invalidar as referências existentes." },
    { term: "Identificador", definition: "Nome com três garantias, que são referir-se a no máximo uma entidade, ser o único nome dela nessa qualidade e nunca ser reaproveitado. Com elas, comparar dois identificadores decide se apontam para a mesma entidade." },
    { term: "Nome puro", definition: "Padrão de bits que não carrega nenhuma informação sobre a entidade nomeada e que, por isso, sempre precisa ser pesquisado antes de ser usado. É independente de ser ou não um identificador." },
    { term: "Vínculo (binding)", definition: "Associação entre um nome e os atributos da entidade nomeada. É o vínculo que o serviço de nomes guarda, e resolver um nome é obter os atributos vinculados a ele." },
    { term: "URI, URL e URN", definition: "O URI dá sintaxe uniforme a muitos esquemas de identificação. O URL é o URI que traz localização e método de acesso, sujeito a link quebrado. O URN é o URI usado como nome puro, que exige um serviço de resolução." },
    { term: "Nome plano", definition: "Nome sem estrutura interna, em geral uma cadeia de bits sorteada, que não contém informação alguma sobre onde localizar a entidade associada." },
    { term: "Ponteiro de encaminhamento", definition: "Referência deixada no lugar antigo apontando para o novo, quando uma entidade se move. O cliente percorre a corrente até o fim, ao custo de correntes longas e da perda da entidade se um elo se romper." },
    { term: "Abordagem por casa", definition: "Mecanismo em que um lugar fixo, em geral onde a entidade foi criada, mantém a localização atual dela. O Mobile IP usa isso, com o agente domiciliar encapsulando pacotes para o endereço temporário do computador móvel." },
    { term: "Tabela hash distribuída", definition: "Arranjo em que o próprio identificador determina, por cálculo, qual nó é responsável por ele. No Chord, a chave pertence ao sucessor dela no anel, e a tabela de dedos com atalhos que dobram de distância leva a busca à ordem do logaritmo do número de nós." },
    { term: "Nome autocertificante", definition: "Identificador calculado a partir da própria entidade, por função de resumo ou usando a chave pública dela, de modo que quem recebe a resposta consegue verificá-la sem confiar em quem resolveu o nome." },
    { term: "Espaço de nomes", definition: "Conjunto de todos os nomes válidos que um serviço reconhece, com uma definição sintática que separa nome válido de inválido. Nome válido mas desvinculado continua sendo aceito para resolução." },
    { term: "Grafo de nomes", definition: "Representação de um espaço de nomes estruturado, com nós folha que guardam a entidade e nós de diretório que guardam uma tabela de arestas rotuladas. O nome vive na aresta, e o nó tem apenas um identificador." },
    { term: "Mecanismo de fechamento", definition: "Aquilo que diz como e onde iniciar a resolução de um nome. É sempre em parte implícito, como a convenção que localiza o diretório raiz no disco ou o chroot que dá a cada contêiner uma raiz própria." },
    { term: "Vínculo forte e vínculo simbólico", definition: "Duas maneiras de fazer um apelido. No vínculo forte, dois nomes de caminho levam ao mesmo nó e a resolução acaba ali. No vínculo simbólico, o nó guarda um nome de caminho e a resolução recomeça com ele, o que permite ciclos." },
    { term: "Domínio de atribuição de nomes", definition: "Espaço de nomes sob uma única autoridade administrativa, que controla quais nomes são vinculados ali e é livre para delegar essa responsabilidade a subdomínios, cada um com o seu servidor com autoridade." },
    { term: "Navegação", definition: "Processo de localizar dados de nomes espalhados por vários servidores. Pode ser iterativa, com o cliente repetindo a consulta, recursiva, com a cadeia de servidores resolvendo, não recursiva controlada pelo servidor ou por multicast." },
    { term: "Zona (DNS)", definition: "Parte do espaço de nomes implementada por um servidor separado. Guarda os dados de um domínio menos os subdomínios delegados, os ponteiros para os servidores desses subdomínios com os endereços de cola, e os parâmetros de gestão." },
    { term: "Registro de recurso", definition: "Unidade de conteúdo de um nó do DNS. Os principais são A e AAAA para endereço, NS para servidor com autoridade, MX para servidor de correio, SRV para servidor de um serviço, CNAME para apelido, SOA para abertura da zona, PTR para resolução reversa e TXT para texto livre." },
    { term: "Tempo de vida (TTL)", definition: "Prazo de validade de uma entrada guardada em cache por um servidor não autoridade. Passado o prazo, ele volta a consultar a autoridade. Atributo estável recebe prazo longo, e atributo prestes a mudar recebe prazo curto." },
    { term: "DNSSEC", definition: "Extensões de segurança do DNS, que agrupam registros de mesmo tipo e assinam o conjunto com a chave de assinatura de zona. Essa chave é avalizada pela chave de assinatura de chave, cujo resumo o domínio pai assina, formando uma cadeia até a raiz." },
    { term: "Serviço de diretório", definition: "Serviço que pesquisa entradas a partir de uma especificação de atributos, sendo o dual do serviço de nomes. É o das páginas amarelas, e o de nomes é o das páginas brancas." },
    { term: "LDAP", definition: "Protocolo leve de acesso a diretório, derivado do X.500 e simplificado para falar direto sobre TCP/IP com codificação textual. Organiza entradas numa árvore de informações de diretório e oferece leitura, listagem e busca por filtro." },
    { term: "Curva de preenchimento de espaço", definition: "Técnica que mapeia o espaço de N atributos numa única dimensão preservando localidade, de modo que valores próximos caiam no mesmo servidor de índice, o que torna viável a consulta por faixa em diretórios descentralizados." },
    { term: "Interligação por dados nomeados", definition: "Proposta em que a aplicação pede uma entidade pelo nome e a rede roteia o pedido até uma cópia, dispensando a resolução em endereço. O roteador tem depósito de conteúdo, tabela de interesses pendentes e base de encaminhamento, e o dado precisa ser imutável." }
  ],

  references: [
    "VAN STEEN, M.; TANENBAUM, A. S. Distributed Systems. 4. ed. (versão DS 4.03). " +
    "distributed-systems.net, 2023. Cap. 6. Naming (pp. 325-390). Fonte principal de " +
    "conteúdo deste tópico, de onde vêm a distinção entre entidade, ponto de acesso e " +
    "endereço, as três propriedades do identificador, a nomeação plana inteira com Mobile " +
    "IP, Chord e serviço hierárquico de localização, o grafo de nomes com fechamento e " +
    "montagem, as três camadas do espaço de nomes, a comparação entre resolução iterativa " +
    "e recursiva, o DNS moderno com DNSSEC, o LDAP e a interligação por dados nomeados.",
    "COULOURIS, G.; DOLLIMORE, J.; KINDBERG, T.; BLAIR, G. Sistemas Distribuídos: " +
    "Conceitos e Projeto. 5. ed. Porto Alegre: Bookman, 2013. Cap. 13. Serviço de Nomes " +
    "(pp. 565-594). Esqueleto do tópico, que define quais assuntos entram e em que ordem. " +
    "É também a fonte dos URIs com a família URL e URN, da navegação por multicast e da " +
    "não recursiva controlada pelo servidor, do conteúdo de uma zona do DNS e da leitura " +
    "do DNS como serviço que aceita ficar inconsistente de propósito.",
    "MOCKAPETRIS, P. Domain Names: Concepts and Facilities. RFC 1034, 1987; Domain Names: " +
    "Implementation and Specification. RFC 1035, 1987. Especificação original do DNS, " +
    "citada pelas duas obras acima. Leitura complementar para quem quiser o formato exato " +
    "das mensagens e dos registros de recurso.",
    "STOICA, I.; MORRIS, R.; KARGER, D.; KAASHOEK, M. F.; BALAKRISHNAN, H. Chord: A " +
    "Scalable Peer-to-peer Lookup Service for Internet Applications. In: SIGCOMM, 2001. " +
    "Leitura complementar da seção 2, com a análise teórica, as simulações e os " +
    "experimentos que sustentam o custo logarítmico da busca e o comportamento do sistema " +
    "quando nós entram e saem continuamente."
  ]
};
