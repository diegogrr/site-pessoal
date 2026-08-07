/* ============================================================
   topic-05.js — Objetos Distribuídos e Invocação Remota
   ------------------------------------------------------------
   Estrutura documentada no modelo topic-01.js (sections[] com
   slides[] opcionais, quiz[], glossary[], references[]).
   Fundamentação: manifesto em docs/fontes/topico-05.json.
   Hierarquia de fontes em docs/fontes/README.md — o van Steen
   4. ed. (seção 4.2) manda no conteúdo da chamada remota e o
   Coulouris (caps. 5, 6 e 9) dá o esqueleto. Pendência 17
   (Diego, 2026-08-04): CORBA e RMI Java saem como tecnologia,
   entram REST e gRPC, e o conceito de objeto remoto fica.
   O esqueleto do tópico é a pergunta "o que quem chama
   precisa nomear".
   ============================================================ */

window.SD = window.SD || {};
SD.content = SD.content || {};

SD.content["05"] = {

  sections: [
    {
      title: "Requisição e resposta, e o que se promete",
      html:
        "<p>O tópico 04 entregou duas operações, <code>send</code> e <code>receive</code>, " +
        "e mostrou o que elas prometem e o que não prometem. Falta a pergunta que quase " +
        "toda aplicação faz em seguida. E se quem envia quiser uma resposta?</p>" +
        "<p>Esse padrão tem nome e tem protocolo próprio. Na <strong>comunicação por " +
        "requisição e resposta</strong>, o cliente manda um pedido e fica bloqueado até a " +
        "resposta do servidor chegar, o que a torna síncrona por construção. Ela também " +
        "pode ser confiável sem esforço adicional, porque a resposta do servidor funciona " +
        "como confirmação da requisição do cliente.</p>" +
        "<p>Este tópico inteiro se organiza em torno de uma pergunta que vai ficando mais " +
        "curta a cada seção. <strong>O que quem chama precisa nomear?</strong> Aqui, na " +
        "base de tudo, a resposta é longa, porque quem chama nomeia a máquina, a porta, a " +
        "operação e ainda trata sozinho o que der errado. As próximas seções vão tirando " +
        "itens dessa lista.</p>" +
        "<h3>Por que não usar simplesmente uma conexão</h3>" +
        "<p>Parece natural montar requisição e resposta sobre um fluxo confiável, e " +
        "muitas implementações atuais fazem isso. O protocolo clássico, porém, é " +
        "construído sobre datagramas, e vale entender a economia por trás dessa escolha, " +
        "porque ela reaparece toda vez que alguém mede o custo de uma chamada.</p>" +
        "<p>São três desperdícios que o fluxo cobra e que este padrão não precisa " +
        "pagar.</p>" +
        "<ul>" +
        "<li>As <strong>confirmações ficam redundantes</strong>, porque cada requisição " +
        "já é seguida por uma resposta que confirma a chegada dela.</li>" +
        "<li>O <strong>estabelecimento da conexão</strong> acrescenta dois pares de " +
        "mensagens além do par que a requisição e a resposta exigem.</li>" +
        "<li>O <strong>controle de fluxo fica redundante</strong> na maioria das " +
        "invocações, que passam argumentos e resultados pequenos.</li>" +
        "</ul>" +
        "<p>Repare que o segundo item é a mesma conta que o tópico 04 fez ao dizer que a " +
        "montagem da conexão é uma sobrecarga considerável por requisição. É o mesmo " +
        "fato visto de outro ângulo.</p>" +
        "<h3>As três primitivas e o identificador que amarra tudo</h3>" +
        "<p>O protocolo se apoia em três operações. O cliente chama " +
        "<code>doOperation</code>, informando o servidor remoto, a operação desejada e os " +
        "argumentos dela, e fica bloqueado. Do outro lado, o servidor chama " +
        "<code>getRequest</code> para obter pedidos e <code>sendReply</code> para devolver " +
        "o resultado, o que desbloqueia o cliente.</p>" +
        "<p>A mensagem que viaja carrega cinco campos, e um deles resolve um problema que " +
        "não é óbvio. Além do tipo da mensagem, da referência ao servidor, do " +
        "identificador da operação e dos argumentos empacotados, vai um " +
        "<strong>identificador de requisição</strong> que o cliente gera e o servidor " +
        "copia na resposta.</p>" +
        "<p>Sem esse identificador o cliente não teria como saber se a resposta que chegou " +
        "é da pergunta que ele acabou de fazer, ou de uma pergunta anterior que estava " +
        "atrasada. Essa confusão é real, porque o tópico 03 já mostrou que a rede entrega " +
        "fora de ordem, e uma resposta velha chegando tarde é indistinguível de uma " +
        "resposta nova para quem só olha o conteúdo.</p>" +
        "<p>O identificador completo tem duas partes, e as duas são necessárias. Uma é um " +
        "número que o remetente tira de uma sequência crescente, e a outra identifica o " +
        "próprio processo remetente, com a porta e o endereço. A primeira parte torna o " +
        "identificador único dentro daquele processo, e a segunda o torna único no sistema " +
        "distribuído inteiro.</p>" +
        "<h3>O que fazer quando a resposta não vem</h3>" +
        "<p>Aqui a coisa fica interessante, porque o tópico 04 já demonstrou que a " +
        "ausência de resposta não informa nada. Ela pode significar que a requisição se " +
        "perdeu, que o servidor caiu antes de executar, que ele executou e a resposta se " +
        "perdeu, ou simplesmente que tudo está lento.</p>" +
        "<p>O cliente tem uma opção óbvia, que é reenviar. E é justamente aí que nasce o " +
        "problema central desta seção, porque reenviar é seguro em alguns casos e " +
        "desastroso em outros.</p>" +
        "<p>Uma <strong>operação idempotente</strong> é aquela que pode ser executada " +
        "várias vezes com o mesmo efeito de uma execução única. Acrescentar um elemento a " +
        "um conjunto é idempotente, porque o conjunto fica igual na segunda vez. " +
        "Transferir cem reais entre contas não é, e o segundo envio tira mais cem reais " +
        "de alguém que já pagou.</p>" +
        "<p>Servidores construídos só com operações idempotentes podem reexecutar " +
        "requisições duplicadas sem dano, e isso simplifica o sistema inteiro. Quando não " +
        "dá, o servidor precisa de mecanismo próprio para reconhecer a duplicata.</p>" +
        "<p>Três medidas de tolerância a falhas estão em jogo, e a combinação delas " +
        "define o que o sistema promete a quem chama. A primeira é <strong>reenviar a " +
        "requisição</strong> até obter resposta ou concluir que o servidor falhou. A " +
        "segunda é <strong>filtrar duplicatas</strong> no servidor, reconhecendo pelo " +
        "identificador uma requisição que já chegou. A terceira é guardar um " +
        "<strong>histórico</strong> das respostas já enviadas, para retransmitir o " +
        "resultado sem executar a operação de novo.</p>" +
        "<p>Combinar essas medidas de maneiras diferentes produz três promessas " +
        "diferentes, e elas têm nome.</p>" +
        '<div class="tabela-rolagem">' +
        '<table class="tabela-conteudo" id="tab-semanticas-de-chamada">' +
        "<tr><th>Semântica</th><th>Reenvia a requisição</th><th>Filtra duplicatas</th>" +
        "<th>O que o servidor faz na duplicata</th><th>O que quem chama pode concluir</th></tr>" +
        "<tr><td>Talvez</td><td>Não</td><td>Não se aplica</td>" +
        "<td>Nada, porque não existe duplicata.</td>" +
        "<td>Nada. A operação pode ter sido executada uma vez ou nenhuma.</td></tr>" +
        "<tr><td>Pelo menos uma vez</td><td>Sim</td><td>Não</td>" +
        "<td>Executa o procedimento novamente.</td>" +
        "<td>A operação foi executada, e talvez mais de uma vez.</td></tr>" +
        "<tr><td>No máximo uma vez</td><td>Sim</td><td>Sim</td>" +
        "<td>Retransmite a resposta guardada no histórico.</td>" +
        "<td>A operação foi executada uma vez, ou não foi executada.</td></tr>" +
        "</table>" +
        "</div>" +
        "<p>A tabela merece ser lida pela última coluna, porque é ela que interessa a quem " +
        "escreve a aplicação. Nenhuma das três entrega a promessa que o programador " +
        "gostaria de ter, que é a de execução exatamente uma vez. Essa é a semântica da " +
        "chamada de procedimento local, e ela não sobrevive à travessia da rede.</p>" +
        "<p>A semântica <strong>talvez</strong> aparece quando nenhuma medida é tomada. " +
        "Ela sofre falha por omissão, se a requisição ou o resultado se perder, e falha " +
        "por colapso, se o servidor cair. Parece inútil, e não é, porque para consultas " +
        "que o cliente pode simplesmente repetir ela custa o mínimo possível.</p>" +
        "<p>A semântica <strong>pelo menos uma vez</strong> é a escolha natural quando " +
        "todas as operações são idempotentes, porque aí a repetição não machuca. Já a " +
        "semântica <strong>no máximo uma vez</strong> é o que se usa quando a operação tem " +
        "efeito colateral, e o preço dela é o servidor precisar guardar estado sobre os " +
        "clientes, o que o tópico 04 mostrou que complica a recuperação depois de uma " +
        "queda.</p>" +
        "<p>Guarde a última observação da seção, porque ela é a ponte para tudo o que vem " +
        "adiante. Até aqui, quem chama carrega todo esse trabalho. É o programador da " +
        "aplicação que decide o tempo de espera, que reenvia, que combina o identificador " +
        "e que escolhe a semântica. A próxima seção esconde tudo isso.</p>",
      slides: [
        {
          title: "E se quem envia quiser resposta?",
          html:
            "<ul>" +
            "<li>Requisição e resposta é <strong>síncrona</strong> por construção</li>" +
            "<li>A resposta já serve de confirmação da requisição</li>" +
            "<li>A pergunta do tópico, o que quem chama precisa <strong>nomear</strong></li>" +
            "<li>Aqui, a máquina, a porta, a operação e o tratamento da falha</li>" +
            "</ul>"
        },
        {
          title: "Por que não usar uma conexão",
          html:
            "<ul>" +
            "<li>Confirmação fica redundante, a resposta já confirma</li>" +
            "<li>A conexão custa dois pares de mensagens a mais</li>" +
            "<li>Controle de fluxo é inútil com argumento pequeno</li>" +
            "<li>É a mesma conta do tópico 04, vista de outro ângulo</li>" +
            "</ul>"
        },
        {
          title: "O identificador de requisição",
          html:
            "<ul>" +
            "<li>O cliente gera, o servidor copia na resposta</li>" +
            "<li>Sem ele, resposta atrasada parece resposta nova</li>" +
            "<li>Número da sequência, único no processo</li>" +
            "<li>Mais porta e endereço, único no sistema inteiro</li>" +
            "</ul>"
        },
        {
          title: "As três semânticas de chamada",
          ref: "tab-semanticas-de-chamada"
        },
        {
          title: "O que nenhuma delas entrega",
          html:
            "<ul>" +
            "<li><strong>Exatamente uma vez</strong> é a semântica da chamada local</li>" +
            "<li>Ela não sobrevive à travessia da rede</li>" +
            "<li>Operação idempotente permite repetir sem dano</li>" +
            "<li>Sem idempotência, o servidor guarda histórico e paga por isso</li>" +
            "</ul>"
        }
      ]
    },
    {
      title: "A chamada que parece local",
      html:
        "<p>A seção anterior terminou com uma lista de tarefas na conta do programador da " +
        "aplicação. A ideia que organiza esta seção é simples de enunciar e teve " +
        "consequências enormes. E se tudo isso pudesse ficar invisível?</p>" +
        "<p>A <strong>chamada de procedimento remoto</strong> estende a abstração de " +
        "chamada de procedimento aos ambientes distribuídos. Procedimentos que vivem em " +
        "máquinas remotas passam a ser chamados como se estivessem no espaço de " +
        "endereçamento local, e o sistema esconde o empacotamento, a passagem de " +
        "mensagens e a preservação da semântica. A proposta é de 1984, de Birrell e " +
        "Nelson, e abriu caminho para boa parte do que se programa hoje.</p>" +
        "<p>Na pergunta que organiza o tópico, a lista encurtou bastante. Quem chama " +
        "nomeia o procedimento e os argumentos, e mais nada.</p>" +
        "<h3>Programar com interfaces</h3>" +
        "<p>Antes do mecanismo vem o estilo de programação que ele promove, e vale " +
        "começar pelo que já é familiar. Linguagens modernas organizam um programa em " +
        "módulos que se comunicam, e cada módulo declara uma <strong>interface</strong> " +
        "explícita, que diz quais procedimentos podem ser acessados de fora. Enquanto a " +
        "interface não muda, a implementação pode mudar à vontade.</p>" +
        "<p>Num programa distribuído, os módulos executam em processos distintos, e a " +
        "especificação dos procedimentos que um servidor oferece chama-se " +
        "<strong>interface de serviço</strong>. A separação entre interface e " +
        "implementação rende três vantagens, e a terceira é a que mais aparece na " +
        "prática.</p>" +
        "<ul>" +
        "<li>Quem programa o cliente se ocupa apenas da abstração que a interface " +
        "oferece, sem conhecer detalhe nenhum da implementação.</li>" +
        "<li>Quem programa o cliente também não precisa saber em que linguagem nem sobre " +
        "que plataforma o serviço foi construído, o que é um avanço enorme diante da " +
        "heterogeneidade.</li>" +
        "<li>O software evolui, porque a implementação muda livremente desde que a " +
        "interface permaneça compatível com a anterior.</li>" +
        "</ul>" +
        "<p>A infraestrutura distribuída impõe três restrições ao que uma interface de " +
        "serviço pode declarar, e as três decorrem do mesmo fato, que é não existir " +
        "memória compartilhada entre os dois lados.</p>" +
        "<p>A primeira é que um módulo não consegue acessar variáveis de um módulo em " +
        "outro processo, então a interface não pode oferecer acesso direto a variável. A " +
        "segunda é que os endereços de um processo não valem em outro, então endereço não " +
        "pode ser argumento nem resultado. A terceira decorre das duas primeiras, e é a " +
        "que muda a forma de escrever a interface.</p>" +
        "<h3>Por valor, por referência, e o ponteiro que não atravessa</h3>" +
        "<p>Numa chamada local, o mecanismo de passagem de parâmetros costuma ser " +
        "invisível para quem escreve o código. Vale trazê-lo à superfície, porque é " +
        "exatamente ele que a distribuição quebra.</p>" +
        "<p>Na <strong>passagem por valor</strong>, o que vai para a pilha é o valor da " +
        "variável, e o procedimento chamado recebe uma variável local inicializada. Ele " +
        "pode alterá-la, e a alteração não afeta o valor original de quem chamou.</p>" +
        "<p>Na <strong>passagem por referência</strong>, o que vai para a pilha é o " +
        "endereço do objeto na memória principal. O procedimento chamado passa a mexer no " +
        "objeto original, e é por isso que acrescentar um elemento a uma lista passada por " +
        "referência de fato altera a lista de quem chamou.</p>" +
        "<p>Agora ponha os dois lados em máquinas diferentes. O valor atravessa a rede sem " +
        "problema, porque é só uma sequência de bytes que o empacotamento do tópico 04 " +
        "sabe montar. O endereço não atravessa, porque um endereço de memória não " +
        "significa nada na outra máquina, e passar por referência simplesmente deixa de " +
        "ser possível.</p>" +
        "<p>A saída que as interfaces de serviço adotam é declarar cada parâmetro como de " +
        "<strong>entrada</strong>, de <strong>saída</strong>, ou dos dois tipos. O " +
        "parâmetro de entrada viaja na mensagem de requisição e vira argumento da operação " +
        "no servidor. O parâmetro de saída volta na mensagem de resposta e substitui o " +
        "valor da variável correspondente em quem chamou. Um parâmetro que serve às duas " +
        "coisas viaja nas duas mensagens.</p>" +
        "<p>Existe ainda um mecanismo intermediário que a maioria das linguagens não usa, " +
        "e que vale conhecer porque é o que a declaração de entrada e saída de fato " +
        "imita. Na <strong>cópia e restauração</strong>, a variável é copiada para a pilha " +
        "como na passagem por valor, e copiada de volta depois da chamada, sobrescrevendo " +
        "o valor original. O efeito costuma ser o mesmo da passagem por referência, e " +
        "difere em situações particulares, como a de o mesmo parâmetro aparecer duas vezes " +
        "na lista.</p>" +
        "<h3>Os stubs, que são onde a mágica mora</h3>" +
        "<p>A transparência é obtida por um truque de substituição. Quando o procedimento " +
        "é remoto, quem é entregue ao cliente não é o procedimento, e sim uma versão " +
        "diferente dele, chamada <strong>stub do cliente</strong>. Ela é chamada pela " +
        "sequência normal de chamada, com os parâmetros na pilha, e por fora não há como " +
        "distinguir uma da outra.</p>" +
        "<p>O que o stub faz por dentro, porém, é outra coisa. Ele empacota os parâmetros " +
        "numa mensagem, pede que ela seja enviada ao servidor e chama <code>receive</code>, " +
        "bloqueando-se até a resposta voltar.</p>" +
        "<p>Do outro lado existe a peça simétrica. O <strong>stub do servidor</strong> " +
        "transforma requisições que chegam pela rede em chamadas de procedimento locais. " +
        "Ele estava bloqueado esperando mensagens, desempacota os parâmetros e chama o " +
        "procedimento do servidor da maneira usual.</p>" +
        "<p>Repare no que o servidor enxerga, porque é a parte elegante. Do ponto de vista " +
        "dele, é como se o cliente o tivesse chamado diretamente, já que os parâmetros e o " +
        "endereço de retorno estão na pilha onde deveriam estar, e nada parece fora do " +
        "comum. Ele faz o trabalho e retorna o resultado a quem chamou, que neste caso é o " +
        "stub.</p>" +
        "<p>O caminho de volta desfaz os mesmos passos. O stub do servidor empacota o " +
        "resultado, envia e volta a esperar a próxima requisição. Na máquina do cliente, a " +
        "mensagem chega pela operação <code>receive</code> que já estava pendente, o stub " +
        "do cliente desempacota o resultado, copia para quem chamou, e o processo cliente " +
        "é desbloqueado.</p>" +
        '<figure class="figura" id="fig-stubs">' +
        '<svg viewBox="0 0 600 250" role="img" aria-labelledby="fig-stubs-titulo">' +
        '<title id="fig-stubs-titulo">Duas máquinas lado a lado. Na do cliente, o programa ' +
        "chama o stub do cliente, que empacota e envia. Na do servidor, o stub do servidor " +
        "desempacota e chama o procedimento de serviço. A troca de mensagens acontece " +
        "entre os dois stubs, e nem o programa nem o procedimento de serviço percebem que " +
        "existe uma rede no meio.</title>" +
        '<rect class="caixa" x="14" y="16" width="240" height="46" rx="8"/>' +
        '<text x="134" y="45" text-anchor="middle" font-size="14">Programa cliente</text>' +
        '<rect class="caixa" x="346" y="16" width="240" height="46" rx="8"/>' +
        '<text x="466" y="45" text-anchor="middle" font-size="14">Procedimento de serviço</text>' +
        '<path class="traco" d="M134 62 L134 82"/>' +
        '<path class="seta" d="M128 82 L140 82 L134 92 Z"/>' +
        '<text class="rotulo-secundario" x="146" y="80" font-size="12">chamada normal</text>' +
        '<path class="traco" d="M466 92 L466 72"/>' +
        '<path class="seta" d="M460 72 L472 72 L466 62 Z"/>' +
        '<text class="rotulo-secundario" x="352" y="86" font-size="12">chamada normal</text>' +
        '<rect class="caixa-destaque" x="14" y="94" width="240" height="46" rx="8"/>' +
        '<text x="134" y="123" text-anchor="middle" font-size="14">Stub do cliente</text>' +
        '<rect class="caixa-destaque" x="346" y="94" width="240" height="46" rx="8"/>' +
        '<text x="466" y="123" text-anchor="middle" font-size="14">Stub do servidor</text>' +
        '<path class="traco" d="M254 108 L334 108"/>' +
        '<path class="seta" d="M334 102 L334 114 L346 108 Z"/>' +
        '<text class="rotulo-secundario" x="300" y="100" text-anchor="middle" ' +
        'font-size="12">requisição</text>' +
        '<path class="traco" d="M346 130 L266 130"/>' +
        '<path class="seta" d="M266 124 L266 136 L254 130 Z"/>' +
        '<text class="rotulo-secundario" x="300" y="148" text-anchor="middle" ' +
        'font-size="12">resposta</text>' +
        '<rect class="caixa" x="14" y="168" width="240" height="42" rx="8"/>' +
        '<text x="134" y="194" text-anchor="middle" font-size="13">Sistema operacional e rede</text>' +
        '<rect class="caixa" x="346" y="168" width="240" height="42" rx="8"/>' +
        '<text x="466" y="194" text-anchor="middle" font-size="13">Sistema operacional e rede</text>' +
        '<text class="rotulo-secundario" x="134" y="234" text-anchor="middle" ' +
        'font-size="13">máquina do cliente</text>' +
        '<text class="rotulo-secundario" x="466" y="234" text-anchor="middle" ' +
        'font-size="13">máquina do servidor</text>' +
        "</svg>" +
        "<figcaption>Os dois stubs são as únicas peças que sabem da rede. Acima deles, o " +
        "programa faz uma chamada comum, e abaixo deles o procedimento de serviço recebe " +
        "uma chamada comum. A ilusão se sustenta porque as duas pontas foram geradas a " +
        "partir da mesma descrição de interface.</figcaption>" +
        "</figure>" +
        "<h3>Quem escreve os stubs</h3>" +
        "<p>Ninguém escreve, e é esse o ponto. Os dois stubs são gerados a partir de uma " +
        "descrição da interface, escrita numa notação própria, feita para que " +
        "procedimentos implementados em linguagens diferentes consigam invocar uns aos " +
        "outros. Nessa notação, cada parâmetro é declarado como de entrada ou de saída, e " +
        "tem o tipo especificado.</p>" +
        "<p>Esse é o mesmo movimento que o tópico 04 mostrou no empacotamento, e a " +
        "coincidência não é acidental. Lá, a descrição compartilhada permitia que a " +
        "mensagem não carregasse o nome dos campos. Aqui, ela permite que ninguém escreva " +
        "o código de empacotar e desempacotar. Nos dois casos, o que se ganha vem de as " +
        "duas pontas terem combinado antes.</p>" +
        "<p>Fica no ar, porém, um incômodo que a próxima seção começa a tratar e a última " +
        "resolve. A chamada remota <em>parece</em> local, e não é. A seção 1 mostrou que a " +
        "semântica de execução exatamente uma vez não sobrevive à rede, então o stub " +
        "esconde a distribuição sem eliminá-la. Vale perguntar até onde essa ilusão ajuda, " +
        "e a partir de onde ela atrapalha.</p>",
      slides: [
        {
          title: "E se tudo isso ficasse invisível?",
          html:
            "<ul>" +
            "<li>Chamada remota estende a chamada de procedimento à rede</li>" +
            "<li>Birrell e Nelson, 1984</li>" +
            "<li>Quem chama nomeia o <strong>procedimento</strong> e os argumentos</li>" +
            "<li>O resto some dentro do sistema</li>" +
            "</ul>"
        },
        {
          title: "Programar com interfaces",
          html:
            "<ul>" +
            "<li>A <strong>interface de serviço</strong> lista o que o servidor oferece</li>" +
            "<li>Não importa a linguagem nem a plataforma do outro lado</li>" +
            "<li>A implementação muda se a interface continuar compatível</li>" +
            "<li>Sem memória compartilhada, variável e endereço ficam de fora</li>" +
            "</ul>"
        },
        {
          title: "O ponteiro não atravessa",
          html:
            "<ul>" +
            "<li>Por <strong>valor</strong>, viaja uma cópia dos bytes</li>" +
            "<li>Por <strong>referência</strong>, viajaria um endereço de memória</li>" +
            "<li>Endereço não significa nada na outra máquina</li>" +
            "<li>Por isso o parâmetro é declarado de entrada ou de saída</li>" +
            "</ul>"
        },
        {
          title: "Os dois stubs",
          html:
            "<ul>" +
            "<li>O stub do cliente empacota, envia e bloqueia</li>" +
            "<li>O stub do servidor desempacota e chama localmente</li>" +
            "<li>O servidor jura que foi chamado direto pelo cliente</li>" +
            "<li>Ninguém escreve stub, os dois são gerados da interface</li>" +
            "</ul>",
          ref: "fig-stubs"
        }
      ]
    },
    {
      title: "Do procedimento ao contrato",
      html:
        "<p>A chamada da seção anterior bloqueia quem chama até a resposta voltar, " +
        "exatamente como uma chamada local. Esse comportamento estrito é desnecessário " +
        "quando não há resultado a devolver, e atrapalha o desempenho quando várias " +
        "chamadas precisam ser feitas.</p>" +
        "<p>Existem variações que afrouxam a regra, e conhecê-las é o que separa quem usa " +
        "chamada remota de quem a projeta.</p>" +
        "<h3>Quando a chamada deixa de bloquear</h3>" +
        "<p>Na <strong>chamada assíncrona</strong>, o servidor devolve uma resposta no " +
        "instante em que recebe a requisição, e só depois disso chama o procedimento " +
        "localmente. Essa resposta imediata não é o resultado, e sim uma confirmação de " +
        "que o servidor vai processar o pedido, e o cliente segue adiante assim que a " +
        "recebe.</p>" +
        "<p>Quando existe resultado, mas o cliente não quer ficar parado esperando, entra " +
        "a <strong>chamada assíncrona diferida</strong>. O cliente chama, espera apenas o " +
        "aceite e continua. Quando o resultado fica pronto, o servidor envia uma mensagem " +
        "que dispara um <strong>retorno de chamada</strong> do lado do cliente, que é uma " +
        "função definida por quem programa e invocada quando um evento acontece. A " +
        "implementação direta cria uma thread separada que fica bloqueada esperando o " +
        "evento enquanto o processo principal continua.</p>" +
        "<p>O caso de uso que justifica tudo isso é concreto. Um cliente que precisa " +
        "consultar vários servidores independentes dispara as chamadas uma atrás da outra, " +
        "o que faz os servidores trabalharem mais ou menos em paralelo, e só depois começa " +
        "a esperar os resultados. Feito de forma bloqueante, o tempo total seria a soma; " +
        "feito assim, fica perto do maior.</p>" +
        "<p>Há ainda a <strong>chamada de uma via</strong>, em que o cliente continua " +
        "imediatamente depois de enviar, sem esperar nem o aceite. Ela tem um problema que " +
        "a seção 1 já preparou, porque sem garantia de confiabilidade o cliente não tem " +
        "como saber se o pedido dele chegou a ser processado. É a semântica talvez, com " +
        "outro nome.</p>" +
        "<p>Sobre essa variação se constrói a <strong>chamada em multicast</strong>, que " +
        "envia a mesma requisição a um grupo de servidores. Repare que ela só é viável " +
        "porque ninguém espera aceite, e que o tópico 04 já explicou o que acontece com " +
        "quem confia numa entrega de grupo sem garantias.</p>" +
        "<h3>O objeto remoto, e o que fica dele</h3>" +
        "<p>A chamada remota também foi embutida diretamente em linguagens, e o exemplo " +
        "mais conhecido é o Java, onde ela recebe o nome de invocação a método remoto. Um " +
        "cliente executando na própria máquina virtual invoca o método de um objeto " +
        "gerenciado por outra máquina virtual.</p>" +
        "<p>O van Steen faz uma observação sobre isso que vale guardar, porque ela é ao " +
        "mesmo tempo o elogio e a crítica da ideia. Lendo o código-fonte da aplicação, " +
        "pode ser difícil ou até impossível dizer se uma invocação de método vai a um " +
        "objeto local ou a um objeto remoto.</p>" +
        "<p>Esse modelo acrescenta à chamada remota três conceitos que sobrevivem à " +
        "tecnologia que os popularizou. O <strong>objeto remoto</strong> é aquele capaz de " +
        "receber invocações de objetos que vivem em outros processos. A <strong>referência " +
        "de objeto remoto</strong> é o identificador dele, válido no sistema distribuído " +
        "inteiro, e pode ser passada como argumento e devolvida como resultado. A " +
        "<strong>interface remota</strong> especifica quais métodos podem ser invocados de " +
        "fora.</p>" +
        "<p>Do lado da implementação, o mecanismo é o mesmo da seção anterior com outros " +
        "nomes. No cliente vive um <strong>proxy</strong>, que implementa os métodos da " +
        "interface remota e se comporta como se fosse o objeto, mas cada método dele " +
        "empacota a invocação numa requisição e desempacota a resposta. No servidor, um " +
        "<strong>despachante</strong> recebe a requisição e entrega ao objeto que " +
        "realmente executa.</p>" +
        "<p>As tecnologias que ensinaram esse modelo saíram de circulação, e por isso este " +
        "curso não as estuda como estudo de caso. O que fica é a linhagem, porque o proxy " +
        "do modelo de objetos é o mesmo stub da seção anterior, e é ele que reaparece " +
        "gerado por ferramenta na prática de hoje.</p>" +
        "<h3>O contrato, que é o que sobrou de tudo isso</h3>" +
        "<p>A prática corrente resolve o mesmo problema com uma peça central, e ela não é " +
        "o objeto nem o procedimento. É o <strong>contrato</strong>, um arquivo que " +
        "descreve o serviço numa notação neutra e a partir do qual o código das duas " +
        "pontas é gerado.</p>" +
        "<p>O gRPC é hoje o representante mais difundido dessa linhagem, e ele nasceu " +
        "resolvendo dois incômodos que quem constrói serviços distribuídos conhece bem. O " +
        "primeiro é <strong>manter a compatibilidade</strong> entre cliente e servidor, de " +
        "modo que o cliente envie pedidos que o servidor entenda, e que clientes antigos " +
        "continuem funcionando quando o servidor muda. O segundo é <strong>manter o " +
        "desempenho</strong>.</p>" +
        "<p>Vale detalhar onde esse desempenho é ganho, porque a resposta amarra este " +
        "tópico ao anterior. Depois que as consultas ao banco e os algoritmos já foram " +
        "otimizados, o que sobra é a velocidade de empacotar e desempacotar, que o tópico " +
        "04 tratou, e a redução da sobrecarga de cada comunicação, que se consegue usando " +
        "uma conexão única e duradoura em vez de uma conexão nova por requisição.</p>" +
        "<p>Repare que essa última frase responde ao argumento da seção 1. Lá, o custo de " +
        "montar a conexão a cada requisição justificava construir o protocolo sobre " +
        "datagramas. Aqui, a saída é outra, e consiste em pagar a montagem uma vez só e " +
        "reaproveitar a conexão para todas as chamadas seguintes.</p>" +
        "<p>O contrato também acomoda as variações desta seção. Além da chamada comum, " +
        "essas ferramentas oferecem <strong>fluxo contínuo nos dois sentidos</strong>, em " +
        "que cliente e servidor mandam sequências de mensagens pela mesma chamada, sem que " +
        "cada mensagem seja uma requisição nova.</p>" +
        "<p>Fecha aqui a linha que atravessa três tópicos. A descrição compartilhada " +
        "apareceu no tópico 04 como esquema que dispensa carregar o nome dos campos, " +
        "voltou na seção 2 como a fonte de onde os stubs são gerados, e reaparece agora " +
        "como o contrato que versiona a evolução do serviço. É sempre a mesma barganha, " +
        "que troca acoplamento prévio por economia depois.</p>" +
        /* Demonstração interativa do tópico, montada aqui porque as cinco etapas cobram
           o que as seções 1 a 3 explicaram. */
        '<div class="demo-area" data-demo="rpc-fluxo">' +
        '<span class="demo-placeholder-icon" aria-hidden="true">🧪</span>' +
        "<p><strong>Demonstração interativa</strong></p>" +
        "<p>Simulação do caminho de uma chamada remota, das semânticas de chamada à " +
        "passagem de parâmetros.</p>" +
        "</div>",
      slides: [
        {
          title: "Quando a chamada deixa de bloquear",
          html:
            "<ul>" +
            "<li><strong>Assíncrona</strong>, o aceite volta na hora e o resultado não</li>" +
            "<li><strong>Diferida</strong>, o resultado volta por retorno de chamada</li>" +
            "<li><strong>De uma via</strong>, nem o aceite volta, e é a semântica talvez</li>" +
            "<li>Sobre ela se constrói a chamada em multicast</li>" +
            "</ul>"
        },
        {
          title: "O que fica do objeto remoto",
          html:
            "<ul>" +
            "<li>Objeto remoto, referência única e interface remota</li>" +
            "<li>No cliente, o <strong>proxy</strong>; no servidor, o despachante</li>" +
            "<li>Lendo o código, não dá para saber se a chamada é remota</li>" +
            "<li>A tecnologia saiu, a linhagem do stub ficou</li>" +
            "</ul>"
        },
        {
          title: "O contrato",
          html:
            "<ul>" +
            "<li>Um arquivo descreve o serviço, e gera as duas pontas</li>" +
            "<li>Resolve <strong>compatibilidade</strong> e <strong>desempenho</strong></li>" +
            "<li>Uma conexão duradoura, em vez de uma por requisição</li>" +
            "<li>E fluxo contínuo nos dois sentidos pela mesma chamada</li>" +
            "</ul>"
        }
      ]
    },
    {
      title: "Nomear o recurso, ou não nomear ninguém",
      html:
        "<p>As três seções anteriores foram encurtando o que quem chama precisa nomear, " +
        "sem sair do mesmo modelo. Em todas elas existe uma operação com nome, e quem " +
        "chama a invoca. Esta seção troca o modelo duas vezes.</p>" +
        "<h3>A crítica que a transparência merece</h3>" +
        "<p>Antes de trocar, vale enfrentar o incômodo que a seção 2 deixou no ar. Fazer " +
        "uma chamada remota parecer local é uma boa ideia?</p>" +
        "<p>Quatro diferenças não desaparecem por mais bem-feito que o stub seja. Uma " +
        "chamada local demora quase sempre o mesmo tempo, enquanto uma requisição de rede " +
        "é muito mais lenta e tem duração <em>imprevisível</em>, podendo levar menos de um " +
        "milissegundo num bom momento e muitos segundos quando a rede congestiona.</p>" +
        "<p>Numa chamada local dá para passar referências a objetos na memória, e na " +
        "remota tudo precisa virar bytes, o que funciona bem para números e textos curtos " +
        "e vira problema com volumes maiores e objetos mutáveis. Some-se a isso que " +
        "cliente e serviço podem estar escritos em linguagens diferentes, e nem todas as " +
        "linguagens têm os mesmos tipos, o que traz de volta os problemas de codificação " +
        "que o tópico 04 catalogou.</p>" +
        "<p>A conclusão que se tira daí é forte e vale enunciar sem meias palavras. Não " +
        "adianta tentar fazer um serviço remoto parecer demais com um objeto local da sua " +
        "linguagem, porque ele é fundamentalmente outra coisa. Parte do apelo do estilo " +
        "que vem a seguir está justamente em tratar a transferência de estado pela rede " +
        "como um processo distinto de uma chamada de função.</p>" +
        "<h3>Nomear o recurso</h3>" +
        "<p>Um servidor HTTP hospeda <strong>recursos</strong>. Um recurso é uma abstração " +
        "de informação, como um documento, uma imagem ou uma coleção de outros recursos, e " +
        "é identificado por um endereço que descreve onde ele está no servidor.</p>" +
        "<p>Nada impede alguém de criar um recurso chamado <code>/obterProdutos</code>, " +
        "com os parâmetros no corpo da requisição, imitando um procedimento remoto sobre " +
        "HTTP. Fazendo assim, porém, a lista de produtos deixa de poder ser guardada em " +
        "cache pelo endereço dela, e é aí que entram as convenções que dão nome ao " +
        "estilo.</p>" +
        "<p>As relações entre recursos aparecem no próprio endereço. Se a coleção é " +
        "<code>/produtos</code>, o produto de identificador 42 é <code>/produtos/42</code>, " +
        "e as avaliações dele são <code>/produtos/42/avaliacoes</code>. A regra prática é " +
        "manter os endereços simples, ainda que isso obrigue o cliente a fazer mais de uma " +
        "requisição para juntar o que precisa.</p>" +
        "<p>A ação sobre o recurso não vai no nome, vai no <strong>método</strong> da " +
        "requisição, que funciona como o verbo. E os métodos se classificam por duas " +
        "propriedades que decidem o que o cliente e a infraestrutura podem fazer com " +
        "eles.</p>" +
        "<p>Um método é <strong>seguro</strong> quando não tem efeito colateral visível, o " +
        "que permite guardá-lo em cache com tranquilidade. Um método é " +
        "<strong>idempotente</strong> quando executá-lo várias vezes deixa o mesmo " +
        "resultado de executá-lo uma vez, que é exatamente a propriedade da seção 1.</p>" +
        '<div class="tabela-rolagem">' +
        '<table class="tabela-conteudo" id="tab-metodos-http">' +
        "<tr><th>Método</th><th>O que faz na coleção de produtos</th><th>Seguro</th>" +
        "<th>Idempotente</th></tr>" +
        "<tr><td><code>GET</code></td><td>Devolve a lista, ou o produto 42.</td>" +
        "<td>Sim</td><td>Sim</td></tr>" +
        "<tr><td><code>PUT</code></td><td>Atualiza o produto 42.</td>" +
        "<td>Não</td><td>Sim</td></tr>" +
        "<tr><td><code>POST</code></td><td>Cria um produto novo e devolve o endereço " +
        "dele.</td><td>Não</td><td>Não</td></tr>" +
        "<tr><td><code>DELETE</code></td><td>Apaga o produto 42.</td>" +
        "<td>Não</td><td>Sim</td></tr>" +
        "</table>" +
        "</div>" +
        "<p>A coluna da idempotência é a que mais vale, e ela liga esta seção à primeira. " +
        "Uma requisição idempotente pode ser repetida com segurança quando ela teve " +
        "sucesso mas o cliente nunca recebeu a resposta, por exemplo porque caiu e " +
        "reiniciou antes de recebê-la. É a semântica pelo menos uma vez funcionando de " +
        "graça, sem histórico e sem filtragem de duplicatas no servidor.</p>" +
        "<p>Repare também no <code>POST</code>, que é o único que não é idempotente. Não é " +
        "coincidência que ele seja justamente o que cria um recurso novo, porque repetir " +
        "uma criação cria duas coisas.</p>" +
        "<h3>O código de resposta diz o que fazer em seguida</h3>" +
        "<p>A resposta traz um código de status, e as faixas dele carregam uma instrução " +
        "operacional que muita gente ignora.</p>" +
        "<ul>" +
        "<li>A faixa de <strong>200 a 299</strong> comunica sucesso, e o corpo traz o " +
        "recurso pedido.</li>" +
        "<li>A faixa de <strong>300 a 399</strong> redireciona, informando no cabeçalho " +
        "onde o recurso passou a morar.</li>" +
        "<li>A faixa de <strong>400 a 499</strong> indica erro do cliente, e uma " +
        "requisição assim <strong>não deve ser repetida</strong>, porque o problema está " +
        "em quem pediu e vai se repetir igual.</li>" +
        "<li>A faixa de <strong>500 a 599</strong> indica erro do servidor, e essa " +
        "<strong>pode ser repetida</strong>, porque a causa talvez já esteja resolvida na " +
        "próxima tentativa.</li>" +
        "</ul>" +
        "<p>Guarde essa diferença, porque ela é uma regra de reenvio embutida no protocolo. " +
        "O tópico 04 mostrou que a ausência de resposta não informa nada, e aqui o " +
        "protocolo devolve exatamente a informação que faltava, que é se vale a pena " +
        "tentar de novo.</p>" +
        "<p>O contrato também existe deste lado. A interface pode ser descrita " +
        "formalmente, com os endereços disponíveis, os métodos aceitos, os códigos de " +
        "resposta possíveis e o esquema da representação de cada recurso, e dessa " +
        "descrição se gera código para as duas pontas. É o mesmo movimento da seção " +
        "anterior, aplicado a um modelo diferente.</p>" +
        "<h3>Não nomear ninguém</h3>" +
        "<p>Falta o último passo da progressão, e ele abandona a ideia de invocação. Em " +
        "tudo o que veio antes, quem chama sabe com quem está falando, ainda que por um " +
        "nome lógico. No modelo <strong>publicar e assinar</strong>, não sabe.</p>" +
        "<p>A aplicação publica uma mensagem sobre um assunto, e quem tiver declarado " +
        "interesse naquele assunto a recebe. O tópico 04 já mostrou esse arranjo pelo lado " +
        "de quem o implementa, quando o intermediário de mensagens faz a mediação entre " +
        "publicadores e assinantes. Aqui interessa o outro lado, que é o que muda para " +
        "quem programa.</p>" +
        "<p>Quem publica não nomeia destinatário, não sabe quantos existem e não descobre " +
        "se algum deles processou a mensagem. Em troca disso, acrescentar um consumidor " +
        "novo deixa de exigir qualquer alteração em quem produz, que é a propriedade que " +
        "torna esse estilo atraente em sistemas que crescem por partes.</p>" +
        "<p>O modelo de programação cabe em quatro operações. O publicador dissemina um " +
        "evento com <code>publish</code>, e o assinante declara interesse com " +
        "<code>subscribe</code>, informando um <strong>filtro</strong>, que é um padrão " +
        "definido sobre o conjunto de todos os eventos possíveis. Depois ele pode revogar " +
        "o interesse com <code>unsubscribe</code>, e quando chegam eventos que casam com o " +
        "filtro dele, a entrega acontece por <code>notify</code>.</p>" +
        "<p>Alguns sistemas acrescentam uma quinta operação, que inverte o sentido da " +
        "declaração. Com <code>advertise</code>, o publicador anuncia de antemão que tipo " +
        "de evento pretende gerar, o que permite ao sistema preparar o caminho antes de o " +
        "primeiro evento existir.</p>" +
        "<p>O que decide a expressividade do sistema é o <strong>modelo de " +
        "assinatura</strong>, ou seja, o quanto o filtro consegue dizer. Os esquemas se " +
        "ordenam em sofisticação crescente.</p>" +
        "<ul>" +
        "<li>No esquema <strong>baseado em canal</strong>, o publicador manda eventos para " +
        "canais nomeados e o assinante se inscreve num canal para receber tudo o que passa " +
        "por ele. É o mais primitivo, e o único que define um canal de fato.</li>" +
        "<li>No esquema <strong>baseado em tópico</strong>, a notificação tem vários " +
        "campos e um deles é o tópico, sobre o qual a assinatura é definida. A diferença " +
        "para o canal é que aqui o tópico é declarado explicitamente como um campo, e não " +
        "definido de forma implícita.</li>" +
        "<li>Os esquemas seguintes filtram pelo <strong>conteúdo</strong> do evento, o que " +
        "permite assinaturas bem mais finas que a escolha de um assunto.</li>" +
        "</ul>" +
        "<p>Organizar os tópicos em hierarquia melhora bastante o esquema do meio. Se as " +
        "assinaturas puderem ser definidas tanto em <code>comunicacao-indireta</code> " +
        "quanto em <code>comunicacao-indireta/publicar-assinar</code>, quem assina o " +
        "primeiro recebe também tudo o que se publica no segundo, sem precisar listar cada " +
        "subtópico.</p>" +
        "<p>Falta a pergunta que o tópico 04 deixou preparada, e que aqui recebe uma " +
        "resposta que depende da aplicação. Com que garantia as notificações são " +
        "entregues?</p>" +
        "<p>Dois exemplos mostram por que não existe resposta única. Num jogo pela " +
        "Internet, comunicar o estado mais recente de um jogador por multicast não " +
        "confiável é perfeitamente adequado, porque a próxima atualização provavelmente " +
        "chega logo e corrige o que se perdeu. Numa sala de negociação, não. Para ser " +
        "justo com todos os negociantes interessados na mesma mercadoria, é preciso que " +
        "todos recebam a mesma informação, e isso exige multicast confiável.</p>" +
        "<p>Repare que essa é exatamente a distinção que o tópico 04 construiu ao comparar " +
        "as três famílias de multicast. A escolha entre elas não é uma questão de " +
        "qualidade de engenharia, e sim uma consequência do que a aplicação considera " +
        "injusto ou incorreto.</p>" +
        '<figure class="figura" id="fig-o-que-se-nomeia">' +
        '<svg viewBox="0 0 600 260" role="img" aria-labelledby="fig-o-que-se-nomeia-titulo">' +
        '<title id="fig-o-que-se-nomeia-titulo">Quatro faixas empilhadas, uma por seção do ' +
        "tópico, mostrando o que quem chama precisa nomear em cada estilo. Em requisição e " +
        "resposta, a máquina, a porta e a operação. Na chamada remota, o procedimento e os " +
        "argumentos. Em REST, o recurso e o verbo. Em publicar e assinar, apenas o " +
        "assunto. A lista encurta de cima para baixo.</title>" +
        '<rect class="caixa" x="16" y="12" width="176" height="46" rx="8"/>' +
        '<text x="104" y="33" text-anchor="middle" font-size="13">Requisição</text>' +
        '<text x="104" y="50" text-anchor="middle" font-size="13">e resposta</text>' +
        '<rect class="caixa-destaque" x="212" y="12" width="372" height="46" rx="8"/>' +
        '<text x="398" y="41" text-anchor="middle" font-size="14">máquina · porta · ' +
        "operação · a falha</text>" +
        '<rect class="caixa" x="16" y="76" width="176" height="46" rx="8"/>' +
        '<text x="104" y="97" text-anchor="middle" font-size="13">Chamada</text>' +
        '<text x="104" y="114" text-anchor="middle" font-size="13">remota</text>' +
        '<rect class="caixa-destaque" x="212" y="76" width="266" height="46" rx="8"/>' +
        '<text x="345" y="105" text-anchor="middle" font-size="14">procedimento · ' +
        "argumentos</text>" +
        '<rect class="caixa" x="16" y="140" width="176" height="46" rx="8"/>' +
        '<text x="104" y="169" text-anchor="middle" font-size="13">Recurso na Web</text>' +
        '<rect class="caixa-destaque" x="212" y="140" width="196" height="46" rx="8"/>' +
        '<text x="310" y="169" text-anchor="middle" font-size="14">recurso · verbo</text>' +
        '<rect class="caixa" x="16" y="204" width="176" height="46" rx="8"/>' +
        '<text x="104" y="233" text-anchor="middle" font-size="13">Publicar e assinar</text>' +
        '<rect class="caixa-destaque" x="212" y="204" width="120" height="46" rx="8"/>' +
        '<text x="272" y="233" text-anchor="middle" font-size="14">assunto</text>' +
        "</svg>" +
        "<figcaption>A progressão do tópico inteiro, numa figura. A cada seção, quem chama " +
        "nomeia menos, e a barra encurta. O que some da lista não desaparece do sistema, " +
        "porque alguém continua tratando disso. Muda quem.</figcaption>" +
        "</figure>" +
        "<p>Essa última frase da legenda é a lição do tópico. Nenhuma das quatro linhas " +
        "eliminou trabalho, e todas apenas deslocaram o trabalho para outro lugar. O " +
        "tempo de espera, o reenvio, o identificador de requisição e a semântica de " +
        "chamada continuam existindo em qualquer sistema que use uma dessas quatro " +
        "formas.</p>" +
        "<p>O que mudou é quem escreve esse código, porque ele saiu da aplicação e entrou " +
        "no stub gerado, no arcabouço de serviço, no protocolo ou no intermediário. Saber " +
        "onde ele foi parar é o que permite depurar quando ele falha, e é por isso que a " +
        "seção 1 deste tópico continua valendo mesmo para quem nunca vai escrever um " +
        "protocolo de requisição e resposta na mão.</p>",
      slides: [
        {
          title: "A crítica que a transparência merece",
          html:
            "<ul>" +
            "<li>A chamada de rede é lenta e de duração <strong>imprevisível</strong></li>" +
            "<li>Referência a objeto local não atravessa</li>" +
            "<li>As linguagens dos dois lados não têm os mesmos tipos</li>" +
            "<li>Não adianta o remoto parecer demais com o local</li>" +
            "</ul>"
        },
        {
          title: "Recurso e verbo",
          html:
            "<ul>" +
            "<li>O servidor hospeda <strong>recursos</strong>, identificados por endereço</li>" +
            "<li>A relação aparece no endereço, <code>/produtos/42/avaliacoes</code></li>" +
            "<li>A ação vai no <strong>método</strong>, não no nome</li>" +
            "<li>Endereço simples, mesmo custando mais requisições</li>" +
            "</ul>"
        },
        {
          title: "Seguro e idempotente",
          ref: "tab-metodos-http"
        },
        {
          title: "O código de resposta é uma regra de reenvio",
          html:
            "<ul>" +
            "<li>400 a 499, erro do cliente, <strong>não repita</strong></li>" +
            "<li>500 a 599, erro do servidor, <strong>pode repetir</strong></li>" +
            "<li>É a informação que faltava ao tópico 04</li>" +
            "<li>Lá o silêncio não informava nada</li>" +
            "</ul>"
        },
        {
          title: "O que quem chama nomeia",
          ref: "fig-o-que-se-nomeia"
        },
        {
          title: "A lição do tópico",
          html:
            "<ul>" +
            "<li>Nenhuma das quatro formas eliminou trabalho</li>" +
            "<li>Todas <strong>deslocaram</strong> o trabalho de lugar</li>" +
            "<li>Espera, reenvio, identificador e semântica continuam lá</li>" +
            "<li>Saber onde eles foram parar é o que permite depurar</li>" +
            "</ul>"
        }
      ]
    }
  ],

  quiz: [
    {
      question:
        "Por que o protocolo clássico de requisição e resposta foi construído sobre datagramas, e não sobre um fluxo confiável?",
      options: [
        "Porque o datagrama entrega as mensagens sempre na ordem em que foram enviadas.",
        "Porque a resposta já confirma a requisição, e a conexão custaria mensagens a mais.",
        "Porque o fluxo confiável não consegue transportar argumentos empacotados em bytes.",
        "Porque o datagrama permite que o servidor responda a vários clientes de uma vez."
      ],
      answer: 1,
      explanation:
        "São três desperdícios evitados. A confirmação fica redundante, porque cada " +
        "requisição é seguida de uma resposta que confirma a chegada dela. O " +
        "estabelecimento da conexão acrescenta dois pares de mensagens além do par " +
        "necessário. E o controle de fluxo é inútil na maioria das invocações, que " +
        "passam argumentos e resultados pequenos."
    },
    {
      question:
        "Qual problema o identificador de requisição resolve, e que não seria resolvido apenas conferindo o conteúdo da resposta?",
      options: [
        "Impede que dois clientes diferentes recebam a resposta um do outro.",
        "Garante que o servidor execute a operação pedida uma única vez.",
        "Distingue a resposta da pergunta atual de uma resposta anterior atrasada.",
        "Permite ao servidor descobrir em que porta o cliente está escutando."
      ],
      answer: 2,
      explanation:
        "A rede entrega fora de ordem, então uma resposta antiga que chegou tarde é " +
        "indistinguível de uma resposta nova para quem só olha o conteúdo. O cliente " +
        "gera o identificador e o servidor o copia na resposta, o que permite conferir " +
        "a correspondência. O identificador completo junta um número de sequência, " +
        "único no processo, com a porta e o endereço, que o tornam único no sistema."
    },
    {
      question:
        "Um serviço só oferece operações idempotentes e reenvia requisições até obter resposta, sem filtrar duplicatas. Que semântica de chamada ele entrega?",
      options: [
        "Exatamente uma vez, porque a idempotência elimina o efeito da repetição.",
        "Talvez, porque sem filtragem de duplicatas nada pode ser garantido.",
        "No máximo uma vez, porque a operação idempotente nunca é executada duas vezes.",
        "Pelo menos uma vez, e a idempotência é o que torna a repetição inofensiva."
      ],
      answer: 3,
      explanation:
        "Reenviar sem filtrar duplicatas produz a semântica pelo menos uma vez, em que " +
        "a operação foi executada e talvez mais de uma vez. Ela só é aceitável porque " +
        "todas as operações são idempotentes, ou seja, executá-las várias vezes deixa o " +
        "mesmo resultado de executá-las uma vez. Exatamente uma vez é a semântica da " +
        "chamada local, e ela não sobrevive à travessia da rede."
    },
    {
      question:
        "Por que a passagem de parâmetro por referência não é suportada numa interface de serviço remota?",
      options: [
        "Porque um endereço de memória não significa nada na outra máquina.",
        "Porque o empacotamento não consegue converter estruturas de dados aninhadas.",
        "Porque o servidor não tem permissão de escrita na memória do cliente.",
        "Porque a referência ocuparia bytes demais dentro da mensagem de requisição."
      ],
      answer: 0,
      explanation:
        "Passar por referência coloca na pilha o endereço do objeto na memória " +
        "principal, e os endereços de um processo não valem em outro. Por isso as " +
        "interfaces de serviço declaram cada parâmetro como de entrada ou de saída. O " +
        "de entrada viaja na requisição, o de saída volta na resposta, e um parâmetro " +
        "que serve às duas coisas viaja nas duas mensagens."
    },
    {
      question:
        "Do ponto de vista do procedimento que executa no servidor, o que a chamada remota parece ser?",
      options: [
        "Uma mensagem que ele precisa desempacotar antes de tratar o pedido.",
        "Uma chamada local comum, com os parâmetros na pilha onde deveriam estar.",
        "Uma conexão aberta que ele precisa fechar depois de responder ao cliente.",
        "Um evento assíncrono que o obriga a instalar uma função de retorno."
      ],
      answer: 1,
      explanation:
        "Quem desempacota é o stub do servidor, que transforma a requisição vinda da " +
        "rede numa chamada de procedimento local. Do ponto de vista do procedimento de " +
        "serviço, é como se o cliente o tivesse chamado diretamente, com os parâmetros " +
        "e o endereço de retorno na pilha, e nada fora do comum. Os dois stubs são as " +
        "únicas peças que sabem da rede."
    },
    {
      question:
        "Um cliente precisa consultar cinco servidores independentes e não quer somar os cinco tempos de espera. Que variação da chamada remota resolve isso?",
      options: [
        "A chamada em multicast, que envia a mesma requisição aos cinco de uma vez.",
        "A chamada de uma via, em que o cliente segue sem esperar nem o aceite.",
        "A chamada assíncrona diferida, disparando as cinco e tratando os retornos depois.",
        "A chamada síncrona comum, confiando que os servidores respondam depressa."
      ],
      answer: 2,
      explanation:
        "O cliente chama, espera apenas o aceite e continua, disparando as cinco " +
        "chamadas uma atrás da outra. Isso faz os servidores trabalharem mais ou menos " +
        "em paralelo, e o tempo total fica perto do maior em vez de ser a soma. Quando " +
        "cada resultado fica pronto, o servidor envia uma mensagem que dispara um " +
        "retorno de chamada no cliente. A chamada em multicast serve a outro caso, que " +
        "é mandar o mesmo pedido a um grupo."
    },
    {
      question:
        "Depois de otimizar as consultas ao banco e os algoritmos, onde um arcabouço de chamada remota ainda consegue ganhar desempenho?",
      options: [
        "Aumentando o tempo de espera antes de considerar a requisição perdida.",
        "Trocando o formato textual das mensagens por um formato com mais campos.",
        "Distribuindo cada chamada entre várias conexões abertas simultaneamente.",
        "Empacotando mais rápido e reusando uma conexão em vez de abrir uma por pedido."
      ],
      answer: 3,
      explanation:
        "O que sobra é a velocidade de empacotar e desempacotar, tratada no tópico 04, " +
        "e a redução da sobrecarga de cada comunicação. A saída para a segunda é usar " +
        "uma conexão única e duradoura em vez de uma conexão nova por requisição. " +
        "Repare que isso responde ao argumento da primeira seção, porque em vez de " +
        "evitar a conexão, paga-se a montagem dela uma vez só."
    },
    {
      question:
        "Um cliente enviou uma requisição, ela foi processada com sucesso, mas o cliente caiu antes de receber a resposta. Que propriedade do método permite repeti-la com segurança?",
      options: [
        "Ser idempotente, porque repetir deixa o mesmo resultado de executar uma vez.",
        "Ser seguro, porque um método sem efeito colateral pode ser guardado em cache.",
        "Ser síncrono, porque o cliente só continua depois de saber o resultado.",
        "Ser transparente, porque o cliente não distingue a chamada local da remota."
      ],
      answer: 0,
      explanation:
        "A idempotência é o que torna o reenvio seguro, e é a mesma propriedade da " +
        "primeira seção reaparecendo no protocolo da Web. Um método seguro é outra " +
        "coisa, porque ele não tem efeito colateral visível e por isso pode ser " +
        "guardado em cache. Entre os métodos comuns, o único que não é idempotente é " +
        "justamente o que cria um recurso novo, porque repetir uma criação cria duas " +
        "coisas."
    },
    {
      question:
        "Uma requisição falhou com código de status na faixa de 400 a 499. O que o cliente deve fazer?",
      options: [
        "Repetir imediatamente, porque a causa costuma ser momentânea no servidor.",
        "Repetir com espera crescente, porque a faixa indica sobrecarga temporária.",
        "Seguir para outro servidor, porque a faixa indica que este saiu do ar.",
        "Não repetir, porque o problema está no pedido e vai se repetir igual."
      ],
      answer: 3,
      explanation:
        "A faixa de 400 a 499 indica erro do cliente, então a mesma requisição vai " +
        "falhar igual se for repetida. A faixa de 500 a 599 indica erro do servidor, e " +
        "essa pode ser repetida, porque a causa talvez já esteja resolvida na próxima " +
        "tentativa. É uma regra de reenvio embutida no protocolo, e ela devolve " +
        "justamente a informação que o silêncio do tópico 04 não dava."
    },
    {
      question:
        "O que muda para quem programa ao passar de uma invocação nomeada para o modelo de publicar e assinar?",
      options: [
        "Quem publica deixa de saber quem recebe e se alguém processou a mensagem.",
        "Quem publica passa a bloquear até que todos os assinantes tenham confirmado.",
        "Quem publica precisa manter a lista de assinantes atualizada no próprio código.",
        "Quem publica ganha a garantia de entrega ordenada para todos os assinantes."
      ],
      answer: 0,
      explanation:
        "A aplicação publica sobre um assunto, e quem declarou interesse recebe. Quem " +
        "publica não nomeia destinatário, não sabe quantos existem e não descobre se " +
        "algum processou. Em troca, acrescentar um consumidor novo deixa de exigir " +
        "alteração em quem produz, e é essa propriedade que torna o estilo atraente em " +
        "sistemas que crescem por partes."
    }
  ],

  glossary: [
    {
      term: "Protocolo de requisição e resposta",
      definition:
        "Padrão construído sobre a passagem de mensagens que casa cada requisição com " +
        "a resposta dela, por meio das primitivas doOperation, getRequest e sendReply. " +
        "É síncrono, porque o cliente bloqueia até a resposta chegar, e a própria " +
        "resposta serve de confirmação da requisição."
    },
    {
      term: "Identificador de requisição",
      definition:
        "Número que o cliente gera e o servidor copia na resposta, para o cliente " +
        "reconhecer se a resposta que chegou é da pergunta atual ou de uma anterior " +
        "atrasada. Junto com a porta e o endereço do remetente, forma um identificador " +
        "único no sistema distribuído inteiro."
    },
    {
      term: "Operação idempotente",
      definition:
        "Operação que pode ser executada várias vezes com o mesmo efeito de uma " +
        "execução única. Servidores construídos só com operações idempotentes " +
        "reexecutam requisições duplicadas sem dano, o que dispensa guardar histórico " +
        "de respostas."
    },
    {
      term: "Histórico de respostas",
      definition:
        "Estrutura em que o servidor registra as respostas já enviadas, para " +
        "retransmiti-las quando uma requisição duplicada chega, sem reexecutar a " +
        "operação. É o que sustenta a semântica no máximo uma vez, e cobra do servidor " +
        "guardar estado sobre os clientes."
    },
    {
      term: "Semântica de chamada",
      definition:
        "Promessa de confiabilidade que quem faz uma invocação remota recebe, " +
        "resultante das medidas de tolerância a falhas combinadas. São três, chamadas " +
        "de talvez, pelo menos uma vez e no máximo uma vez, e nenhuma delas entrega a " +
        "execução exatamente uma vez da chamada local."
    },
    {
      term: "Chamada de procedimento remoto",
      definition:
        "Extensão da abstração de chamada de procedimento aos ambientes distribuídos, " +
        "proposta por Birrell e Nelson em 1984. Procedimentos em máquinas remotas são " +
        "chamados como se estivessem no espaço de endereçamento local, e o sistema " +
        "esconde o empacotamento e a passagem de mensagens."
    },
    {
      term: "Interface de serviço",
      definition:
        "Especificação dos procedimentos que um servidor oferece, com os tipos dos " +
        "argumentos de cada um. Ela não pode declarar acesso direto a variável nem " +
        "receber endereço como argumento, porque não existe memória compartilhada " +
        "entre os dois lados."
    },
    {
      term: "Stub",
      definition:
        "Peça gerada a partir da descrição da interface que substitui o procedimento " +
        "remoto. No cliente, empacota os parâmetros, envia e bloqueia até a resposta. " +
        "No servidor, desempacota e chama o procedimento local. Os dois stubs são as " +
        "únicas peças que sabem da rede."
    },
    {
      term: "Chamada assíncrona",
      definition:
        "Variação em que o servidor devolve uma confirmação no instante em que recebe " +
        "a requisição, e só depois chama o procedimento localmente. O cliente segue " +
        "adiante assim que recebe essa confirmação, que não é o resultado."
    },
    {
      term: "Chamada assíncrona diferida",
      definition:
        "Variação em que o cliente espera apenas o aceite e continua, e o resultado " +
        "chega depois por meio de um retorno de chamada. Serve ao cliente que precisa " +
        "consultar vários servidores independentes sem somar os tempos de espera."
    },
    {
      term: "Retorno de chamada (callback)",
      definition:
        "Função definida por quem programa e invocada quando um evento acontece, como " +
        "a chegada de uma mensagem. A implementação direta cria uma thread separada " +
        "que fica bloqueada esperando o evento enquanto o processo principal continua."
    },
    {
      term: "Objeto remoto",
      definition:
        "Objeto capaz de receber invocações de objetos que vivem em outros processos. " +
        "Tem uma referência de objeto remoto, que é o identificador dele no sistema " +
        "inteiro e pode viajar como argumento, e uma interface remota, que diz quais " +
        "métodos podem ser invocados de fora."
    },
    {
      term: "Proxy",
      definition:
        "Peça que vive no processo cliente e implementa os métodos da interface " +
        "remota, comportando-se como se fosse o objeto. Cada método dele empacota a " +
        "invocação numa requisição e desempacota a resposta, e é a mesma linhagem do " +
        "stub."
    },
    {
      term: "Contrato de serviço",
      definition:
        "Arquivo que descreve o serviço numa notação neutra e a partir do qual o " +
        "código das duas pontas é gerado. Resolve ao mesmo tempo a compatibilidade " +
        "entre versões de cliente e servidor e a geração do empacotamento, que ninguém " +
        "precisa escrever à mão."
    },
    {
      term: "Recurso",
      definition:
        "Abstração de informação hospedada por um servidor HTTP, como um documento, " +
        "uma imagem ou uma coleção de outros recursos, identificada por um endereço. " +
        "A relação entre recursos aparece no próprio endereço, e a ação sobre eles vai " +
        "no método da requisição."
    },
    {
      term: "Método seguro",
      definition:
        "Método de requisição que não tem efeito colateral visível, e que por isso " +
        "pode ser guardado em cache com tranquilidade. Entre os métodos comuns, apenas " +
        "o de leitura é seguro."
    },
    {
      term: "Publicar e assinar",
      definition:
        "Estilo em que a aplicação publica uma mensagem sobre um assunto e quem tiver " +
        "declarado interesse a recebe. Quem publica não nomeia destinatário, não sabe " +
        "quantos existem e não descobre se algum processou, e em troca acrescentar um " +
        "consumidor não exige alterar quem produz."
    }
  ],

  references: [
    "VAN STEEN, M.; TANENBAUM, A. S. Distributed Systems. 4. ed. (versão DS 4.03). " +
    "distributed-systems.net. Cap. 4. Communication, seção 4.2. Fonte principal deste " +
    "tópico, de onde vêm o mecanismo dos stubs, a passagem de parâmetros por valor e " +
    "por referência, a geração das duas pontas a partir da descrição da interface, e " +
    "as variações assíncrona, diferida, de uma via e em multicast.",
    "COULOURIS, G.; DOLLIMORE, J.; KINDBERG, T.; BLAIR, G. Sistemas Distribuídos: " +
    "Conceitos e Projeto. 5. ed. Porto Alegre: Bookman, 2013. Cap. 5. Invocação " +
    "Remota (seções 5.2, 5.3 e 5.4), Cap. 6. Comunicação Indireta (seção 6.3) e Cap. " +
    "9. Serviços Web (seção 9.1). Organiza a progressão do tópico e é a fonte do " +
    "protocolo de requisição e resposta, da idempotência, das três semânticas de " +
    "chamada e do modelo de objeto remoto.",
    "VITILLO, R. Understanding Distributed Systems. 2021. Cap. 5. APIs. Leitura " +
    "complementar sobre interface de programação em HTTP, com recursos e endereços, " +
    "os métodos e a classificação em seguros e idempotentes, as faixas de código de " +
    "resposta e a descrição formal da interface.",
    "KLEPPMANN, M. Designing Data-Intensive Applications. 2. ed. Sebastopol: " +
    "O'Reilly, 2026. Cap. 5. Encoding and Evolution, seção Modes of Dataflow. Leitura " +
    "complementar com a crítica à transparência da chamada remota e a comparação " +
    "entre o estilo de recursos e o de chamada.",
    "JEFFERY, T. Distributed Services with Go. Raleigh: The Pragmatic Bookshelf, " +
    "2021. Cap. 2. Structure Data with Protocol Buffers e Cap. 4. Serve Requests with " +
    "gRPC. Leitura complementar sobre o contrato de serviço na prática, com a geração " +
    "de código nas duas pontas e o fluxo contínuo.",
    "TORNOW, S. Thinking Distributed Systems. Cap. 5. Message Delivery and " +
    "Processing. Leitura complementar sobre as garantias de entrega no máximo uma " +
    "vez, ao menos uma vez e exatamente uma vez."
  ]
};
