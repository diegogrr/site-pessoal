/* ============================================================
   topic-05.js — Objetos Distribuídos e Invocação Remota
   ------------------------------------------------------------
   Estrutura documentada no modelo topic-01.js (sections[] com
   slides[] opcionais, quiz[], glossary[], references[]).
   Conteúdo baseado em: COULOURIS et al., cap. 5 (pp. 185–228),
   VAN STEEN; TANENBAUM, 4. ed., cap. 4 (§4.2) e JEFFERY,
   cap. 4 (leituras complementares).
   ============================================================ */

window.SD = window.SD || {};
SD.content = SD.content || {};

SD.content["05"] = {

  sections: [
    {
      title: "Protocolos de requisição-resposta",
      html:
        "<p>A demonstração do Tópico 4 terminou com uma promessa: tudo o que você " +
        "fez à mão (retransmitir requisições, filtrar duplicatas, decidir o que " +
        "fazer com uma resposta perdida) alguém faria por você. Este tópico " +
        "apresenta esse alguém. Subimos a escada do middleware em três degraus de " +
        "abstração crescente: os <strong>protocolos de requisição-resposta</strong> " +
        "(um padrão leve sobre a passagem de mensagens), a <strong>chamada de " +
        "procedimento remoto (RPC)</strong> e a <strong>invocação a método remoto " +
        "(RMI)</strong>, cada um escondendo mais encanamento do programador.</p>" +
        "<h3>O trio doOperation, getRequest e sendReply</h3>" +
        "<p>A comunicação por requisição-resposta é o padrão das interações " +
        "cliente-servidor: no caso normal ela é <em>síncrona</em>: o cliente fica " +
        "<strong>bloqueado</strong> até a resposta chegar, e a própria resposta " +
        "funciona como confirmação da requisição. O protocolo se apoia em três " +
        "primitivas: <strong>doOperation</strong>, usada pelo cliente para invocar " +
        "uma operação remota (envia a requisição e espera a resposta); " +
        "<strong>getRequest</strong>, usada pelo servidor para obter a próxima " +
        "requisição; e <strong>sendReply</strong>, com que o servidor devolve o " +
        "resultado. Cada mensagem carrega: o <em>tipo</em> (requisição ou " +
        "resposta), um <strong>requestId</strong>, a <em>referência remota</em> do " +
        "objeto ou servidor alvo, um identificador da <em>operação</em> a invocar " +
        "e os <em>argumentos</em> como vetor de bytes (empacotados como no " +
        "Tópico 4). O requestId, combinado com a identificação do remetente " +
        "(endereço IP e porta), torna cada mensagem única no sistema inteiro. É " +
        "com ele que o cliente reconhece que uma resposta atrasada pertence a uma " +
        "chamada antiga, e que o servidor reconhece uma duplicata.</p>" +
        "<p>Por que não simplesmente usar TCP? Porque, para trocas curtas, um " +
        "protocolo sobre datagramas UDP evita três sobrecargas: as " +
        "<em>confirmações</em> são redundantes (a resposta já confirma), o " +
        "<em>estabelecimento de conexão</em> custa dois pares extras de mensagens, " +
        "e o <em>controle de fluxo</em> é desnecessário quando viajam argumentos " +
        "pequenos.</p>" +
        "<h3>Falhas, e como mascará-las</h3>" +
        "<p>Construído sobre UDP, o protocolo herda o modelo de falhas do " +
        "Tópico 4: <em>omissão</em> e <em>desordem</em>; além disso, processos " +
        "podem sofrer colapso (assumimos que param de vez, sem comportamento " +
        "bizantino). As máscaras são as que você experimentou na demo:</p>" +
        "<ul>" +
        "<li><strong>Timeout</strong>: doOperation não desiste na primeira " +
        "espera: retransmite a requisição até receber resposta ou até estar " +
        "razoavelmente seguro de que o servidor falhou (e então informa o cliente " +
        "com uma exceção).</li>" +
        "<li><strong>Filtragem de duplicatas</strong>: retransmissão gera " +
        "duplicata: o servidor reconhece requisições repetidas pelo requestId. Se " +
        "ainda está executando a original, basta não executar de novo e responder " +
        "ao final.</li>" +
        "<li><strong>Respostas perdidas</strong>: se o servidor já tinha " +
        "respondido, precisa <em>reexecutar</em> a operação ou retransmitir o " +
        "resultado guardado. Uma operação <strong>idempotente</strong> pode ser " +
        "executada repetidamente com o mesmo efeito de uma execução única (pôr um " +
        "elemento em um conjunto é idempotente; anexar a uma sequência, não). " +
        "Servidores só com operações idempotentes podem simplesmente reexecutar.</li>" +
        "<li><strong>Histórico</strong>: para retransmitir sem reexecutar, o " +
        "servidor guarda as respostas já enviadas. Como cada cliente faz uma " +
        "requisição por vez, a requisição seguinte confirma a resposta anterior: " +
        "basta guardar a última resposta de cada cliente, descartando as antigas " +
        "após um tempo.</li>" +
        "</ul>" +
        "<h3>R, RR e RRA</h3>" +
        "<p>Spector identificou três estilos de troca, que produzem " +
        "comportamentos diferentes sob falha: <strong>R</strong> (só a " +
        "requisição, quando não há resultado a devolver nem necessidade de " +
        "confirmação), <strong>RR</strong> (requisição-resposta: o suficiente " +
        "para a maioria das interações, com a resposta confirmando a requisição e " +
        "a requisição seguinte confirmando a resposta) e <strong>RRA</strong> " +
        "(requisição-resposta-confirmação: a confirmação carrega o requestId da " +
        "resposta e permite ao servidor <em>descartar entradas do histórico</em>, " +
        "sem bloquear o cliente).</p>" +
        "<p>E quando os argumentos não cabem em um datagrama? Implementar o " +
        "protocolo sobre <strong>TCP</strong> permite argumentos e resultados de " +
        "qualquer tamanho, e, como o TCP já retransmite, filtra duplicatas e " +
        "ordena, o protocolo de requisição-resposta não precisa fazer nada disso. " +
        "Se trocas sucessivas usam o mesmo fluxo, o custo da conexão se dilui. A " +
        "serialização de objetos Java, por exemplo, viaja bem sobre fluxos TCP. " +
        "Já quem não precisa de tudo isso pode ser mais eficiente sobre UDP: o " +
        "NFS da Sun transmite blocos de arquivo de tamanho fixo e tem operações " +
        "<em>idempotentes</em> por projeto: dispensa histórico.</p>" +
        "<h3>HTTP: requisição-resposta em escala planetária</h3>" +
        "<p>O protocolo mais usado do mundo é um protocolo de requisição-resposta " +
        "implementado sobre TCP. Servidores Web gerenciam <em>recursos</em> " +
        "(dados, como páginas e imagens, ou programas), e o HTTP define um " +
        "conjunto <em>fixo</em> de métodos aplicável a todos eles (ao contrário " +
        "dos protocolos anteriores, em que cada serviço define suas operações): " +
        "<strong>GET</strong> (obter o recurso do URL), <strong>HEAD</strong> " +
        "(só os metadados), <strong>POST</strong> (entregar dados a um programa), " +
        "<strong>PUT</strong> (armazenar no URL), <strong>DELETE</strong> " +
        "(excluir). GET, PUT e DELETE são idempotentes; POST não " +
        "necessariamente é: pode alterar o estado de um recurso. As mensagens " +
        "são strings de texto ASCII; os dados carregam seu tipo " +
        "<strong>MIME</strong> (text/html, image/jpeg…); há negociação de " +
        "conteúdo e autenticação por desafio. Na versão original, cada troca " +
        "abria e fechava uma conexão: caro demais; o HTTP 1.1 usa " +
        "<strong>conexões persistentes</strong>, que atravessam uma sequência de " +
        "trocas até serem encerradas por ociosidade.</p>" +
        '<div class="callout">' +
        '<p class="callout-title">💡 Você já viu a idempotência na prática</p>' +
        "<p>Se uma conexão persistente cai no meio de uma requisição, o navegador " +
        "reenvia sozinho, mas só se a operação for idempotente, como GET. Para " +
        "as demais, ele pergunta. É o famoso aviso “deseja reenviar o " +
        "formulário?”. O navegador não sabe se o POST (não idempotente!) chegou a " +
        "executar, e só você pode decidir se arrisca uma segunda compra.</p>" +
        "</div>",
      slides: [
        {
          title: "Subindo a escada do middleware",
          html:
            "<ul>" +
            "<li>Tópico 4: send/receive à mão · agora: <strong>invocação remota</strong></li>" +
            "<li>Três degraus: <strong>requisição-resposta</strong> → " +
            "<strong>RPC</strong> → <strong>RMI</strong></li>" +
            "<li>Requisição-resposta: o padrão das interações cliente-servidor</li>" +
            "<li>Síncrono: o cliente <strong>bloqueia</strong> até a resposta chegar</li>" +
            "</ul>"
        },
        {
          title: "O trio e a mensagem",
          html:
            "<ul>" +
            "<li><strong>doOperation</strong> (cliente) · <strong>getRequest</strong> " +
            "+ <strong>sendReply</strong> (servidor)</li>" +
            "<li>Mensagem: tipo · <strong>requestId</strong> · referência remota · " +
            "<strong>operationId</strong> · argumentos</li>" +
            "<li>A resposta é a confirmação: acks separados são redundantes</li>" +
            "<li>requestId + remetente = identificador único no sistema</li>" +
            "</ul>"
        },
        {
          title: "Falhas e máscaras",
          html:
            "<ul>" +
            "<li>Timeout → <strong>retransmitir</strong> a requisição, não desistir</li>" +
            "<li>Duplicata no servidor → <strong>filtrar</strong> pelo requestId</li>" +
            "<li>Resposta perdida → reexecutar <em>ou</em> retransmitir do " +
            "<strong>histórico</strong></li>" +
            "<li><strong>Idempotente</strong>: repetir tem o mesmo efeito: " +
            "dispensa histórico</li>" +
            "</ul>"
        },
        {
          title: "R · RR · RRA, e UDP × TCP",
          html:
            "<ul>" +
            "<li><strong>R</strong>: só requisição: sem resultado nem confirmação</li>" +
            "<li><strong>RR</strong>: resposta confirma requisição; a próxima " +
            "requisição confirma a resposta</li>" +
            "<li><strong>RRA</strong>: confirmação permite <strong>limpar o " +
            "histórico</strong></li>" +
            "<li>TCP: argumentos de qualquer tamanho · UDP: mais leve " +
            "(NFS: blocos fixos + idempotência)</li>" +
            "</ul>"
        },
        {
          title: "HTTP: requisição-resposta em produção",
          html:
            "<ul>" +
            "<li>Sobre TCP · métodos fixos: <strong>GET · HEAD · POST · PUT · " +
            "DELETE</strong></li>" +
            "<li>GET, PUT, DELETE <strong>idempotentes</strong> · POST não</li>" +
            "<li>HTTP 1.1: <strong>conexões persistentes</strong>: várias trocas " +
            "por conexão</li>" +
            "<li>Texto + tipos <strong>MIME</strong> · “reenviar o formulário?” = " +
            "idempotência na prática</li>" +
            "</ul>"
        }
      ]
    },
    {
      title: "Chamada de procedimento remoto (RPC)",
      html:
        "<p>A RPC, apresentada por <strong>Birrell e Nelson em 1984</strong>, é " +
        "um dos avanços intelectuais mais importantes da computação distribuída: " +
        "estender a abstração de <em>chamada de procedimento</em>, que todo " +
        "programador já domina, para o ambiente distribuído. Um processo chama " +
        "um procedimento em um nó remoto <em>como se fosse local</em>: o sistema " +
        "RPC oculta o empacotamento de parâmetros e resultados, a passagem de " +
        "mensagens e a preservação da semântica da chamada. Três questões de " +
        "projeto definem o conceito.</p>" +
        "<h3>Programação com interfaces</h3>" +
        "<p>No modelo cliente-servidor, cada servidor oferece um conjunto de " +
        "procedimentos disponíveis aos clientes; a <strong>interface de " +
        "serviço</strong> é a especificação desses procedimentos e dos tipos de " +
        "seus argumentos. Programar contra a interface (e não contra a " +
        "implementação) traz as vantagens da modularidade: o cliente não precisa " +
        "conhecer os detalhes internos, <em>nem sequer a linguagem ou a " +
        "plataforma</em> do serviço (um avanço no gerenciamento da " +
        "heterogeneidade), e a implementação pode evoluir sem quebrar quem a usa. " +
        "A natureza distribuída impõe restrições que não existem entre módulos " +
        "locais:</p>" +
        "<ul>" +
        "<li>um módulo não pode acessar as <em>variáveis</em> de um módulo em " +
        "outro processo: a interface só especifica procedimentos;</li>" +
        "<li>a <em>chamada por referência</em> não é suportada: os parâmetros são " +
        "descritos como de <strong>entrada</strong> (viajam na requisição) ou de " +
        "<strong>saída</strong> (voltam na resposta), ou ambos;</li>" +
        "<li><em>endereços de memória</em> de um processo não valem em outro: não " +
        "podem ser passados como argumento nem devolvidos como resultado.</li>" +
        "</ul>" +
        "<p>Quando cliente e serviço podem ser escritos em linguagens diferentes, " +
        "entra a <strong>linguagem de definição de interface (IDL)</strong>: uma " +
        "notação neutra para definir interfaces, com cada parâmetro anotado como " +
        "entrada ou saída e seu tipo especificado. O conceito nasceu nos sistemas " +
        "RPC e se espalhou: a XDR da Sun (RPC), a IDL do CORBA (RMI), a WSDL dos " +
        "serviços Web e os buffers de protocolo do Google são todos IDLs.</p>" +
        "<h3>Semânticas de chamada</h3>" +
        "<p>Uma chamada de procedimento <em>local</em> tem semântica " +
        "<em>exatamente uma vez</em>. Na chamada remota, a semântica depende de " +
        "quais medidas de tolerância a falhas o protocolo combina: retransmitir " +
        "a requisição? filtrar duplicatas no servidor? reexecutar a operação ou " +
        "retransmitir a resposta do histórico? Três combinações importam:</p>" +
        "<ul>" +
        "<li><strong>Talvez</strong>: nenhuma medida. A chamada pode ter " +
        "executado uma vez ou nenhuma: se a requisição se perdeu, não executou; " +
        "se a <em>resposta</em> se perdeu, executou, e o cliente não sabe " +
        "distinguir. Útil somente quando falhas ocasionais são aceitáveis.</li>" +
        "<li><strong>Pelo menos uma vez</strong>: retransmissão sem filtragem: o " +
        "cliente recebe um resultado (executou pelo menos uma vez) ou uma " +
        "exceção. O perigo são as <em>falhas arbitrárias</em>: a retransmissão " +
        "pode fazer o servidor executar a operação <em>mais de uma vez</em>: " +
        "aceitável apenas se as operações forem <strong>idempotentes</strong>. " +
        "Creditar $10 numa conta duas vezes não é um detalhe. É exatamente o " +
        "débito duplicado que você viu na demo do Tópico 4.</li>" +
        "<li><strong>No máximo uma vez</strong>: retransmissão + filtragem de " +
        "duplicatas + histórico. O cliente recebe um resultado (executou " +
        "<em>exatamente</em> uma vez) ou uma exceção (executou uma vez ou " +
        "nenhuma); nunca há execução dupla.</li>" +
        "</ul>" +
        "<h3>O debate da transparência</h3>" +
        "<p>Birrell e Nelson queriam chamadas remotas <em>indistinguíveis</em> " +
        "das locais, e as retransmissões, de fato, ficam invisíveis. Mas a " +
        "chamada remota envolve uma rede, outro computador e outro processo. É " +
        "mais vulnerável a falhas, e quando algo dá errado é <em>impossível " +
        "distinguir</em> falha da rede de falha do servidor (o “caiu ou está " +
        "lenta?” do Tópico 1). A latência é ordens de grandeza maior. Waldo e " +
        "colegas argumentaram que a diferença entre local e remoto deve ser " +
        "<em>expressa na interface</em>; o Argus foi além e mudou a própria " +
        "sintaxe da linguagem. O consenso atual: a <strong>sintaxe</strong> da " +
        "chamada remota deve ser igual à da local, mas a <strong>diferença deve " +
        "aparecer na interface</strong>, por exemplo, permitindo que invocações " +
        "remotas lancem exceções de comunicação que o cliente é obrigado a " +
        "tratar.</p>" +
        "<h3>Como uma RPC funciona por dentro</h3>" +
        "<p>No cliente, cada procedimento da interface ganha um <strong>stub</strong>: " +
        "para quem chama, ele parece o procedimento local; por dentro, empacota o " +
        "identificador do procedimento e os argumentos em uma mensagem de " +
        "requisição, envia ao servidor pelo módulo de comunicação e, quando a " +
        "resposta chega, desempacota o resultado. No servidor, um " +
        "<strong>despachante</strong> seleciona, pelo identificador na " +
        "requisição, o <em>stub de servidor</em> correspondente, que desempacota " +
        "os argumentos, chama o <em>procedimento de serviço</em> real e empacota " +
        "o retorno. Stubs e despachante são <strong>gerados automaticamente por " +
        "um compilador de interface</strong> a partir da definição da interface: " +
        "ninguém escreve empacotamento à mão. A semântica escolhida (pelo menos / " +
        "no máximo uma vez) é implementada pelo módulo de comunicação, com as " +
        "medidas da seção anterior.</p>" +
        "<h3>Estudo de caso: RPC da Sun</h3>" +
        "<p>Projetada para o sistema de arquivos de rede <strong>NFS</strong> " +
        "(que reencontraremos no Tópico 8), a RPC da Sun (ou ONC RPC) roda sobre " +
        "UDP (mensagens até ~8-9 KB, na prática) ou TCP, com semântica " +
        "<strong>pelo menos uma vez</strong>: coerente com as operações " +
        "idempotentes do NFS. A interface é definida na linguagem " +
        "<strong>XDR</strong> e compilada pelo <strong>rpcgen</strong>, que gera " +
        "stubs de cliente, despachante, stubs de servidor e o código de " +
        "empacotamento. Curiosidades reveladoras: interfaces não têm nome: têm " +
        "um <em>número de programa</em> e um <em>número de versão</em> (que muda " +
        "quando uma assinatura muda, protegendo cliente e servidor de conversarem " +
        "em versões diferentes); cada procedimento tem um número, e o número 0 é " +
        "um procedimento nulo gerado automaticamente para testar se o servidor " +
        "está vivo. A vinculação usa o <strong>mapeador de porta</strong> (port " +
        "mapper): um serviço local, em porta bem conhecida, no qual cada servidor " +
        "registra programa, versão e porta, e que o cliente consulta para " +
        "descobrir onde o serviço está. A requisição pode carregar credenciais de " +
        "autenticação (nenhuma, estilo UNIX com uid/gid, chave compartilhada ou " +
        "Kerberos: assunto do Tópico 7).</p>" +
        /* Área reservada para demonstração interativa futura. */
        '<div class="demo-area" data-demo="rpc-fluxo">' +
        '<span class="demo-placeholder-icon" aria-hidden="true">🧪</span>' +
        "<p><strong>Demonstração interativa (em breve)</strong></p>" +
        "<p>Espaço reservado para uma animação do fluxo de uma chamada remota (stub, empacotamento, rede, despacho).</p>" +
        "</div>",
      slides: [
        {
          title: "RPC: a grande ideia (1984)",
          html:
            "<ul>" +
            "<li>Birrell e Nelson: chamar procedimento remoto <strong>como se " +
            "fosse local</strong></li>" +
            "<li>O sistema esconde: empacotamento, mensagens, retransmissões</li>" +
            "<li>Transparência de <strong>acesso</strong> e de " +
            "<strong>localização</strong></li>" +
            "<li>Abriu o caminho: de CORBA e RMI Java até o gRPC</li>" +
            "</ul>"
        },
        {
          title: "Programação com interfaces",
          html:
            "<ul>" +
            "<li><strong>Interface de serviço</strong>: só ela é visível: " +
            "implementação e linguagem livres</li>" +
            "<li>Sem acesso a variáveis · sem passar endereços de memória</li>" +
            "<li>Parâmetros de <strong>entrada</strong> e <strong>saída</strong>: " +
            "não chamada por referência</li>" +
            "<li><strong>IDL</strong>: XDR, IDL do CORBA, WSDL, protobuf</li>" +
            "</ul>"
        },
        {
          title: "Semânticas de chamada",
          html:
            "<ul>" +
            "<li>Local = <strong>exatamente uma vez</strong> · remoto: escolha " +
            "com custo</li>" +
            "<li><strong>Talvez</strong>: nenhuma medida: executou? não se sabe</li>" +
            "<li><strong>Pelo menos uma vez</strong>: reenvio sem filtro: exige " +
            "<strong>idempotência</strong></li>" +
            "<li><strong>No máximo uma vez</strong>: reenvio + filtragem + " +
            "histórico</li>" +
            "</ul>"
        },
        {
          title: "Transparência: até onde?",
          html:
            "<ul>" +
            "<li>Retransmissões somem: falhas parciais e latência, <strong>não</strong></li>" +
            "<li>Rede caiu ou servidor caiu? <strong>Indistinguível</strong> (Tópico 1)</li>" +
            "<li>Consenso: mesma sintaxe, diferença <strong>expressa na " +
            "interface</strong></li>" +
            "<li>Exceções remotas fazem parte do contrato</li>" +
            "</ul>"
        },
        {
          title: "Anatomia, e a RPC da Sun",
          html:
            "<ul>" +
            "<li>Cliente: <strong>stub</strong> empacota · Servidor: " +
            "<strong>despachante</strong> → stub → procedimento de serviço</li>" +
            "<li>Tudo gerado pelo <strong>compilador de interface</strong></li>" +
            "<li>Sun/ONC (NFS): <strong>XDR</strong> + rpcgen · nº de programa e " +
            "de versão · procedimento 0 = teste</li>" +
            "<li><strong>Mapeador de porta</strong> local · pelo menos uma vez</li>" +
            "</ul>"
        }
      ]
    },
    {
      title: "Objetos distribuídos e o modelo da RMI",
      html:
        "<p>Nos anos 90, a RPC foi estendida ao mundo dos objetos: na " +
        "<strong>RMI</strong>, um objeto pode invocar um método de um objeto que " +
        "vive em <em>outro processo</em>: no mesmo computador ou do outro lado " +
        "do planeta. RPC e RMI compartilham o essencial: programação com " +
        "interfaces, implementação sobre requisição-resposta, as mesmas " +
        "semânticas de chamada (pelo menos / no máximo uma vez) e o mesmo nível " +
        "de transparência. O que a RMI acrescenta é expressividade: todo o poder " +
        "da orientação a objetos (classes, herança, metodologias e ferramentas) " +
        "e, principalmente, <strong>referências de objeto</strong> que valem no " +
        "sistema inteiro e <em>viajam como parâmetros e resultados</em>. Se o " +
        "dado é grande ou complexo, em vez de copiá-lo pela rede passa-se a " +
        "referência, e o outro lado invoca o objeto de volta, por RMI.</p>" +
        "<h3>O modelo de objeto distribuído</h3>" +
        "<p>Em cada processo vive um conjunto de objetos; alguns aceitam só " +
        "invocações locais, outros: os <strong>objetos remotos</strong>: também " +
        "aceitam invocações vindas de outros processos. Dois conceitos sustentam " +
        "o modelo:</p>" +
        "<ul>" +
        "<li>a <strong>referência de objeto remoto</strong>: o identificador " +
        "que o Tópico 4 apresentou: único no espaço e no tempo, ele especifica o " +
        "alvo de uma invocação e pode ser passado como argumento ou devolvido " +
        "como resultado;</li>" +
        "<li>a <strong>interface remota</strong>: todo objeto remoto tem uma, " +
        "especificando <em>quais</em> de seus métodos podem ser invocados " +
        "remotamente (os demais seguem acessíveis apenas localmente). Interfaces " +
        "remotas não têm construtores: objetos remotos são criados por " +
        "<strong>métodos de fábrica</strong>: métodos comuns, expostos na " +
        "interface, cujo trabalho é instanciar e devolver novos objetos " +
        "remotos.</li>" +
        "</ul>" +
        "<p>Distribuir objetos é natural, o estado de um programa orientado a " +
        "objetos já é particionado entre eles, e a distribuição ainda " +
        "<em>impõe</em> o encapsulamento: entre processos, só os métodos alcançam " +
        "o estado. Mas invocações remotas concorrentes podem chegar de vários " +
        "computadores ao mesmo tempo, e o objeto precisa proteger seu estado com " +
        "sincronização. E uma invocação remota pode falhar por motivos que não " +
        "existem no caso local (processo remoto morto, mensagem perdida, tempo " +
        "esgotado), então a RMI deve ser capaz de <em>lançar exceções</em> " +
        "dessas condições, e o cliente, de tratá-las.</p>" +
        "<h3>A engrenagem: proxy, despachante, esqueleto e servente</h3>" +
        "<p>A invocação remota atravessa uma cadeia de módulos espelhada entre " +
        "cliente e servidor:</p>" +
        "<ul>" +
        "<li>O <strong>proxy</strong> vive no cliente e torna a RMI transparente: " +
        "implementa os métodos da interface remota e se comporta como o objeto, " +
        "mas cada método, em vez de executar, <em>empacota</em> o alvo, a " +
        "operação e os argumentos em uma requisição, envia, espera a resposta e " +
        "desempacota o resultado. Há um proxy para cada objeto remoto que o " +
        "processo referencia.</li>" +
        "<li>No servidor, o <strong>despachante</strong> recebe a requisição e " +
        "usa o identificador da operação para selecionar o método certo no " +
        "<strong>esqueleto</strong>, que desempacota os argumentos, invoca o " +
        "método real e empacota o resultado (ou a exceção) na resposta.</li>" +
        "<li>O <strong>servente</strong> é a instância que dá corpo ao objeto " +
        "remoto: quem de fato executa. O <em>módulo de referência remota</em> de " +
        "cada processo mantém a tabela que traduz referências remotas em " +
        "referências locais (objetos remotos do processo e proxies), e o " +
        "<em>módulo de comunicação</em> executa o protocolo de requisição-" +
        "resposta com a semântica escolhida.</li>" +
        "</ul>" +
        "<p>Como na RPC, as classes de proxy, despachante e esqueleto são " +
        "<strong>geradas por um compilador de interface</strong>. E quando a " +
        "interface não é conhecida em tempo de compilação? A <em>invocação " +
        "dinâmica</em> oferece um doOperation genérico (referência + método + " +
        "argumentos), útil para aplicações que descobrem interfaces em execução. " +
        "Para não atrasar uma invocação enquanto outra demora, servidores " +
        "geralmente criam <strong>uma thread por invocação</strong>: mais um " +
        "motivo para o servente cuidar da concorrência.</p>" +
        "<h3>Serviços de apoio: vinculador, ativação, persistência e localização</h3>" +
        "<p>Falta responder perguntas práticas. Como o cliente obtém a " +
        "<em>primeira</em> referência remota? Pelo <strong>vinculador</strong> " +
        "(binder): um serviço que mapeia nomes textuais em referências de objeto " +
        "remoto: servidores registram seus objetos pelo nome, clientes os " +
        "pesquisam (o RMIregistry do Java e o Naming Service do CORBA; o Tópico 9 " +
        "generaliza a ideia para serviços de nomes completos). Manter todo objeto " +
        "vivo em um processo rodando para sempre seria desperdício: um " +
        "<strong>ativador</strong> inicia processos servidores <em>sob " +
        "demanda</em> e ativa objetos <em>passivos</em> (implementação + estado " +
        "empacotado em disco) quando alguém os invoca. Objetos que sobrevivem " +
        "entre invocações são <em>persistentes</em>, gerenciados por repositórios " +
        "que os guardam em disco e os ativam de forma transparente. E se um " +
        "objeto <em>migra</em> de processo, sua referência remota deixa de servir " +
        "de endereço: um <em>serviço de localização</em> mapeia referências para " +
        "localizações prováveis.</p>" +
        "<h3>Coleta de lixo distribuída</h3>" +
        "<p>Se em algum lugar do sistema ainda existe uma referência para o " +
        "objeto, ele deve continuar existindo; quando a última desaparece, sua " +
        "memória deve ser recuperada. O algoritmo do Java (na linha de Birrell) " +
        "usa <strong>contagem de referências</strong> cooperando com os coletores " +
        "locais: o servidor de cada objeto remoto B mantém o conjunto dos " +
        "processos que têm proxies para B. Quando um cliente recebe uma " +
        "referência para B pela primeira vez, chama <em>addRef(B)</em> e só então " +
        "cria o proxy; quando o coletor local percebe que o proxy não é mais " +
        "alcançável, o cliente chama <em>removeRef(B)</em>. Com o conjunto vazio, " +
        "o coletor local do servidor recolhe B. As chamadas addRef/removeRef são " +
        "<em>idempotentes</em> e viajam com semântica no máximo uma vez, e o " +
        "caso do cliente que morre sem avisar é resolvido por " +
        "<strong>arrendamento</strong> (leasing): o servidor concede a referência " +
        "por tempo limitado, e o cliente é responsável por renovar antes de " +
        "expirar.</p>" +
        '<div class="callout">' +
        '<p class="callout-title">💡 Arrendamento: a resposta padrão para “e se ele sumir?”</p>' +
        "<p>Conceder um recurso por tempo limitado e exigir renovação evita " +
        "protocolos complicados para descobrir se o interessado ainda existe: " +
        "quem some, expira. O Jini elevou o leasing a princípio de projeto, e a " +
        "ideia reaparece em todo sistema distribuído moderno: registros de " +
        "serviço, locks distribuídos, caches. Guarde-a: ela volta nos próximos " +
        "tópicos.</p>" +
        "</div>",
      slides: [
        {
          title: "De RPC a RMI",
          html:
            "<ul>" +
            "<li>Herda da RPC: interfaces, requisição-resposta, semânticas de " +
            "chamada</li>" +
            "<li>A mais: todo o poder da <strong>orientação a objetos</strong></li>" +
            "<li><strong>Referências de objeto</strong> viajam como parâmetros e " +
            "resultados</li>" +
            "<li>Dado grande? Passe a referência: o outro lado invoca de volta</li>" +
            "</ul>"
        },
        {
          title: "O modelo de objeto distribuído",
          html:
            "<ul>" +
            "<li><strong>Objeto remoto</strong>: aceita invocações de outros " +
            "processos</li>" +
            "<li><strong>Referência de objeto remoto</strong>: única no espaço e " +
            "no tempo (Tópico 4)</li>" +
            "<li><strong>Interface remota</strong>: quais métodos são invocáveis " +
            "à distância</li>" +
            "<li>Sem construtores remotos → <strong>métodos de fábrica</strong></li>" +
            "</ul>"
        },
        {
          title: "A engrenagem da RMI",
          html:
            "<ul>" +
            "<li><strong>Proxy</strong> no cliente: parece o objeto, empacota e " +
            "envia</li>" +
            "<li><strong>Despachante</strong> + <strong>esqueleto</strong> no " +
            "servidor: desempacotam e invocam</li>" +
            "<li><strong>Servente</strong>: o objeto de verdade, que executa</li>" +
            "<li>Gerados pelo compilador de interface · uma <strong>thread por " +
            "invocação</strong></li>" +
            "</ul>"
        },
        {
          title: "Apoio, e coleta de lixo",
          html:
            "<ul>" +
            "<li><strong>Vinculador</strong>: nome → referência remota · ativação " +
            "sob demanda · persistência</li>" +
            "<li>GC distribuída: o servidor sabe <strong>quem tem proxies</strong> " +
            "(addRef/removeRef)</li>" +
            "<li>Cliente sumiu? <strong>Arrendamento</strong>: referência expira " +
            "sem renovação</li>" +
            "<li>Leasing: ideia que reaparece em todo sistema moderno</li>" +
            "</ul>"
        }
      ]
    },
    {
      title: "Estudo de caso: RMI Java",
      html:
        "<p>A RMI Java estende o modelo de objeto da linguagem para dar suporte " +
        "a objetos distribuídos <em>em Java</em>: invocações remotas usam a mesma " +
        "sintaxe das locais e a verificação de tipos vale igualmente para as " +
        "duas. Ser um sistema de uma linguagem só simplifica tudo: as interfaces " +
        "remotas são interfaces Java comuns, sem IDL separada para aprender. Mas " +
        "a transparência é deliberadamente incompleta, como manda o consenso da " +
        "seção anterior: quem invoca <em>sabe</em> que o alvo é remoto, porque " +
        "precisa tratar <strong>RemoteException</strong>; quem implementa sabe, " +
        "porque a interface precisa estender <strong>Remote</strong>. O estudo de " +
        "caso do livro é um <em>quadro branco compartilhado</em>: um servidor " +
        "guarda as figuras desenhadas pelos usuários (interfaces remotas " +
        "<em>Shape</em> e <em>ShapeList</em>, com um número de versão que cresce " +
        "a cada figura nova) e clientes consultam e acrescentam figuras.</p>" +
        "<h3>Passagem de parâmetros: referência ou cópia</h3>" +
        "<p>Na RMI Java, parâmetros são de entrada e o resultado é a saída; o " +
        "empacotamento usa a <em>serialização Java</em> do Tópico 4. A regra tem " +
        "dois lados:</p>" +
        "<ul>" +
        "<li><strong>Objetos remotos</strong> (tipo declarado como interface " +
        "remota) são passados como <strong>referência de objeto remoto</strong>: " +
        "quem recebe pode invocá-los por RMI;</li>" +
        "<li><strong>Objetos não remotos serializáveis</strong> são " +
        "<strong>copiados e passados por valor</strong>: um objeto novo nasce no " +
        "processo de destino, e dali em diante os estados da cópia e do original " +
        "podem divergir.</li>" +
        "</ul>" +
        "<p>Quando o destino não possui a classe de um objeto recebido (ou a " +
        "classe do proxy de uma referência), o código é carregado por " +
        "<strong>download automático</strong> (a serialização anota a localização " +
        "da classe como um URL). É um superpoder do sistema monolinguagem: se um " +
        "cliente do quadro branco inventa uma subclasse de figura com texto, o " +
        "servidor e os demais clientes a recebem e passam a exibi-la <em>sem " +
        "recompilar nada</em>. Por segurança, um gerenciador " +
        "(RMISecurityManager) impede que código baixado toque recursos locais " +
        "como arquivos.</p>" +
        "<h3>Servidor, cliente e RMIregistry</h3>" +
        "<p>O <strong>RMIregistry</strong> é o vinculador da RMI Java: uma " +
        "instância roda em cada computador servidor e mapeia nomes textuais no " +
        "estilo de URL (<em>//computador:porta/nomeObjeto</em>) em referências " +
        "para objetos remotos daquele computador, via métodos da classe " +
        "<em>Naming</em>: <em>bind</em>/<em>rebind</em> para registrar, " +
        "<em>lookup</em> para pesquisar, <em>list</em> para enumerar. O programa " +
        "servidor então se resume a: instanciar o servente, exportá-lo para o " +
        "runtime da RMI com <em>exportObject</em> (porta 0 = porta anônima, " +
        "escolhida pelo runtime) e registrá-lo pelo nome com <em>rebind</em>. O " +
        "cliente faz <em>lookup</em> do nome, recebe a referência remota, cujo " +
        "tipo é a interface remota, e passa a invocar métodos normalmente, " +
        "obtendo outras referências durante a execução conforme precise. As " +
        "classes serventes implementam os métodos da interface sem nenhuma " +
        "preocupação com comunicação: um método <em>newShape</em> que cria um " +
        "servente novo e o devolve é um método de fábrica em meia dúzia de " +
        "linhas.</p>" +
        "<h3>Callbacks: o servidor liga para você</h3>" +
        "<p>Como um cliente do quadro branco descobre figuras novas? Consultando " +
        "o servidor de tempos em tempos (<em>polling</em>), o que degrada o " +
        "servidor e atrasa a notícia. A alternativa é a <strong>callback</strong>: " +
        "inverter a direção. O cliente cria <em>seu próprio objeto remoto</em> " +
        "com um método de notificação, registra a referência no servidor " +
        "(métodos <em>register</em>/<em>deregister</em> na interface), e o " +
        "servidor invoca todos os interessados quando o evento ocorre. Os " +
        "problemas são instrutivos: clientes que terminam sem se desregistrar " +
        "deixam a lista do servidor suja (a solução é o <em>arrendamento</em> da " +
        "seção anterior); além disso, notificar N clientes com RMIs síncronas, um " +
        "a um, não escala, o que motiva a comunicação indireta " +
        "(publicar-assinar), além do escopo deste tópico.</p>" +
        "<h3>Por dentro: reflexão no lugar de esqueletos</h3>" +
        "<p>A implementação da RMI Java conta a evolução da própria técnica. O " +
        "sistema original tinha todos os componentes da seção anterior: proxies " +
        "gerados por um compilador (rmic), esqueletos, despachantes por classe. A " +
        "partir do Java 1.2, a <strong>reflexão</strong> tornou o despachante " +
        "<em>genérico</em>: a requisição carrega um objeto <em>Method</em> e os " +
        "argumentos, e o despachante simplesmente chama <em>invoke</em>: nenhum " +
        "esqueleto é necessário. Das versões recentes em diante, até os stubs de " +
        "cliente são gerados <em>dinamicamente em tempo de execução</em>, e o " +
        "rmic se aposentou.</p>" +
        '<div class="callout">' +
        '<p class="callout-title">💡 De RMI e CORBA ao gRPC</p>' +
        "<p>A linhagem da RPC está viva. O <strong>gRPC</strong>, padrão atual " +
        "para comunicação entre serviços, é reconhecível na hora: a interface é " +
        "definida em uma IDL (os buffers de protocolo), um compilador gera stubs " +
        "de cliente e servidor, e as chamadas viajam em requisição-resposta sobre " +
        "HTTP/2. Os mesmos projetos de 1984: interfaces, stubs, semânticas de " +
        "chamada, deadlines. A leitura complementar de Jeffery constrói um " +
        "serviço gRPC completo em Go: compare cada peça com as deste tópico.</p>" +
        "</div>",
      slides: [
        {
          title: "RMI Java: o contrato",
          html:
            "<ul>" +
            "<li>Interface remota <strong>estende Remote</strong> · métodos " +
            "lançam <strong>RemoteException</strong></li>" +
            "<li>Mesma sintaxe da invocação local · mesma verificação de tipos</li>" +
            "<li>Uma linguagem só: sem IDL separada</li>" +
            "<li>Transparência incompleta <em>de propósito</em>: o programador " +
            "sabe que é remoto</li>" +
            "</ul>"
        },
        {
          title: "Parâmetros: referência ou cópia",
          html:
            "<ul>" +
            "<li>Objeto <strong>remoto</strong> → viaja a <strong>referência</strong> " +
            "remota</li>" +
            "<li>Objeto <strong>serializável</strong> não remoto → " +
            "<strong>cópia</strong> por valor</li>" +
            "<li>Cópia e original podem <strong>divergir</strong> dali em diante</li>" +
            "<li>Classe faltando? <strong>Download automático</strong> (com " +
            "gerenciador de segurança)</li>" +
            "</ul>"
        },
        {
          title: "Servidor, cliente e RMIregistry",
          html:
            "<ul>" +
            "<li>Servidor: servente → <strong>exportObject</strong> → " +
            "<strong>rebind</strong> no registry</li>" +
            "<li>Cliente: <strong>lookup</strong> (//computador/nome) → referência " +
            "→ RMIs</li>" +
            "<li>Nomes estilo URL · um registry por computador servidor</li>" +
            "<li>Servente: lógica pura: zero código de comunicação</li>" +
            "</ul>"
        },
        {
          title: "Callbacks, e o RPC de hoje",
          html:
            "<ul>" +
            "<li><em>Polling</em> degrada · melhor: o cliente registra um objeto " +
            "de <strong>callback</strong></li>" +
            "<li>O servidor notifica os interessados quando o evento ocorre</li>" +
            "<li>Cliente que some → <strong>arrendamento</strong>, de novo</li>" +
            "<li>Hoje: <strong>gRPC</strong> = IDL (protobuf) + stubs gerados + " +
            "requisição-resposta</li>" +
            "</ul>"
        }
      ]
    }
  ],

  quiz: [
    {
      question:
        "Após o timeout, o cliente retransmite a requisição, e o servidor, que já tinha executado a operação e enviado a resposta, recebe a duplicata. O que permite ao servidor retransmitir a resposta SEM executar a operação de novo?",
      options: [
        "Reduzir o timeout do cliente, para que retransmissões nunca ocorram.",
        "Um histórico: o registro das respostas já transmitidas, do qual a resposta é retransmitida quando chega uma requisição duplicada.",
        "Usar o protocolo R, que dispensa mensagens de resposta.",
        "Reiniciar a conexão TCP para descartar o estado antigo."
      ],
      answer: 1,
      explanation:
        "O histórico guarda as respostas enviadas (basta a última de cada " +
        "cliente, pois a requisição seguinte confirma a anterior). Sem ele, o " +
        "servidor precisaria reexecutar a operação: aceitável apenas quando " +
        "todas as operações são idempotentes, como no NFS."
    },
    {
      question:
        "Qual combinação de medidas de tolerância a falhas produz a semântica de chamada NO MÁXIMO UMA VEZ?",
      options: [
        "Nenhuma medida: as garantias do UDP são suficientes.",
        "Apenas a retransmissão da mensagem de requisição.",
        "Retransmissão da requisição com reexecução do procedimento a cada duplicata recebida.",
        "Retransmissão da requisição, filtragem de duplicatas no servidor e retransmissão das respostas a partir de um histórico."
      ],
      answer: 3,
      explanation:
        "Sem nenhuma medida, a semântica é 'talvez'; retransmissão sem filtragem " +
        "dá 'pelo menos uma vez' (o procedimento pode executar várias vezes). Só " +
        "o conjunto completo (retransmitir, filtrar duplicatas e responder pelo " +
        "histórico) garante que cada chamada execute no máximo uma vez."
    },
    {
      question:
        "Um serviço bancário expõe a operação creditar(conta, 10) por RPC com semântica PELO MENOS UMA VEZ. O que pode acontecer?",
      options: [
        "Falhas arbitrárias: uma retransmissão pode fazer o servidor executar o crédito mais de uma vez, gravando um saldo errado.",
        "Nada de errado: pelo menos uma vez implica execução exatamente uma vez.",
        "A operação nunca será executada se qualquer mensagem se perder.",
        "O servidor recusará a operação por ela não ser idempotente."
      ],
      answer: 0,
      explanation:
        "Creditar não é idempotente: repetir muda o resultado. Com pelo menos " +
        "uma vez, a retransmissão pode causar execução dupla: exatamente o " +
        "débito duplicado da demo do Tópico 4. A semântica só é aceitável quando " +
        "as operações da interface são idempotentes; caso contrário, é preciso " +
        "no máximo uma vez."
    },
    {
      question:
        "Qual é o consenso atual sobre a transparência das chamadas de procedimento remoto?",
      options: [
        "A sintaxe da chamada remota deve ser diferente da local, como fazia a linguagem do Argus.",
        "Chamadas remotas devem ser indistinguíveis das locais em todos os aspectos, como propuseram Birrell e Nelson.",
        "A sintaxe deve ser a mesma da chamada local, mas a diferença deve ser expressa na interface, por exemplo, com exceções remotas que o cliente trata.",
        "A transparência é impossível, e por isso a RPC caiu em desuso."
      ],
      answer: 2,
      explanation:
        "Retransmissões e empacotamento ficam ocultos, mas falhas parciais e " +
        "latência não desaparecem, e é impossível distinguir falha da rede de " +
        "falha do servidor. Por isso a diferença aparece na interface: na RMI " +
        "Java, todo método remoto declara RemoteException, que o cliente é " +
        "obrigado a tratar."
    },
    {
      question:
        "Na implementação da RMI, qual é a função do PROXY?",
      options: [
        "Selecionar, pelo identificador da operação, o método correto a invocar no esqueleto.",
        "Tornar a invocação remota transparente para o cliente: comportar-se como o objeto local, mas empacotar cada invocação em uma mensagem de requisição para o objeto remoto e desempacotar a resposta.",
        "Executar de fato o método invocado, dando corpo ao objeto remoto no servidor.",
        "Manter a tabela que mapeia nomes textuais em referências de objeto remoto."
      ],
      answer: 1,
      explanation:
        "O proxy vive no cliente e implementa a interface remota 'fingindo' ser " +
        "o objeto: por dentro, empacota e envia. As outras alternativas " +
        "descrevem o despachante, o servente e o vinculador (binder), " +
        "respectivamente."
    },
    {
      question:
        "Na RMI Java, como um objeto NÃO remoto e serializável é passado como argumento de uma invocação remota?",
      options: [
        "Como referência de objeto remoto, que o destino usa para invocá-lo de volta.",
        "Ele não pode ser passado: apenas objetos remotos servem como argumentos.",
        "Por valor: uma cópia é criada no processo de destino, e, dali em diante, o estado da cópia pode divergir do original.",
        "Como um ponteiro para a memória do cliente, válido enquanto a conexão durar."
      ],
      answer: 2,
      explanation:
        "A regra tem dois lados: objetos remotos viajam como referência de " +
        "objeto remoto; objetos não remotos serializáveis são copiados e " +
        "passados por valor (um objeto novo nasce no destino). Endereços de " +
        "memória nunca cruzam a fronteira entre processos."
    }
  ],

  glossary: [
    {
      term: "Protocolo de requisição-resposta",
      definition:
        "Padrão de comunicação sobre a passagem de mensagens que combina cada " +
        "requisição com sua resposta (primitivas doOperation, getRequest e " +
        "sendReply). Normalmente síncrono, o cliente bloqueia até a resposta, " +
        "usa a própria resposta como confirmação e é a base sobre a qual RPC e " +
        "RMI são implementadas."
    },
    {
      term: "Operação idempotente",
      definition:
        "Operação que pode ser executada repetidamente com o mesmo efeito de uma " +
        "execução única (pôr um elemento em um conjunto, GET do HTTP). Servidores " +
        "só com operações idempotentes podem reexecutar requisições duplicadas " +
        "sem dano, dispensando histórico de respostas."
    },
    {
      term: "Histórico",
      definition:
        "Estrutura em que o servidor registra as respostas já transmitidas " +
        "(identificador da requisição, mensagem e cliente), para retransmiti-las " +
        "quando uma requisição duplicada chega, sem reexecutar a operação. Como " +
        "cada nova requisição de um cliente confirma a resposta anterior, basta " +
        "guardar a última resposta por cliente."
    },
    {
      term: "Chamada de procedimento remoto (RPC)",
      definition:
        "Extensão da abstração de chamada de procedimento aos ambientes " +
        "distribuídos (Birrell e Nelson, 1984): procedimentos em máquinas " +
        "remotas são chamados como se fossem locais, com o sistema ocultando " +
        "empacotamento, passagem de mensagens e retransmissões."
    },
    {
      term: "Semântica de chamada",
      definition:
        "Garantia de confiabilidade percebida por quem faz uma invocação remota, " +
        "resultante das medidas de tolerância a falhas combinadas: talvez " +
        "(nenhuma medida), pelo menos uma vez (retransmissão da requisição; " +
        "exige operações idempotentes) e no máximo uma vez (retransmissão + " +
        "filtragem de duplicatas + histórico)."
    },
    {
      term: "Linguagem de definição de interface (IDL)",
      definition:
        "Notação neutra para definir interfaces de serviço, com os parâmetros de " +
        "cada operação anotados como entrada ou saída e com tipos especificados, " +
        "permitindo que procedimentos implementados em linguagens diferentes " +
        "invoquem uns aos outros. Exemplos: XDR da Sun, IDL do CORBA, WSDL e os " +
        "buffers de protocolo."
    },
    {
      term: "Stub",
      definition:
        "Procedimento gerado pelo compilador de interface que representa, no " +
        "cliente, um procedimento remoto: comporta-se como o procedimento local, " +
        "mas empacota identificador e argumentos em uma mensagem de requisição e " +
        "desempacota o resultado da resposta. No servidor, o stub faz o caminho " +
        "inverso e chama o procedimento de serviço real."
    },
    {
      term: "Invocação a método remoto (RMI)",
      definition:
        "Extensão da RPC ao mundo dos objetos distribuídos: um objeto invoca " +
        "métodos de um objeto em outro processo. Acrescenta à RPC o poder da " +
        "orientação a objetos e referências de objeto únicas no sistema inteiro, " +
        "que podem ser passadas como parâmetros e resultados."
    },
    {
      term: "Objeto remoto",
      definition:
        "Objeto capaz de receber invocações de objetos que vivem em outros " +
        "processos. Todo objeto remoto tem uma referência de objeto remoto (seu " +
        "identificador global) e uma interface remota, que especifica quais de " +
        "seus métodos podem ser invocados remotamente: interfaces remotas não " +
        "têm construtores."
    },
    {
      term: "Proxy",
      definition:
        "Componente do software RMI que vive no processo cliente e torna a " +
        "invocação remota transparente: implementa os métodos da interface " +
        "remota comportando-se como o objeto local, mas cada método empacota a " +
        "invocação em uma mensagem de requisição para o objeto remoto e " +
        "desempacota a resposta. Existe um proxy por objeto remoto referenciado."
    },
    {
      term: "Servente (servant)",
      definition:
        "Instância de classe, no processo servidor, que dá corpo a um objeto " +
        "remoto. É ela que executa de fato os métodos invocados remotamente, " +
        "recebendo as requisições repassadas pelo despachante e pelo esqueleto " +
        "(ou pelo despachante genérico, nas implementações com reflexão)."
    },
    {
      term: "Vinculador (binder)",
      definition:
        "Serviço que mantém o mapeamento de nomes textuais para referências de " +
        "objeto remoto: servidores registram seus objetos pelo nome e clientes " +
        "os pesquisam para obter a primeira referência. Exemplos: o RMIregistry " +
        "da RMI Java (nomes no estilo de URL) e o Naming Service do CORBA."
    }
  ],

  references: [
    "COULOURIS, G.; DOLLIMORE, J.; KINDBERG, T.; BLAIR, G. Sistemas Distribuídos: " +
    "Conceitos e Projeto. 5. ed. Porto Alegre: Bookman, 2013. Cap. 5. Invocação " +
    "Remota (pp. 185-228).",
    "VAN STEEN, M.; TANENBAUM, A. S. Distributed Systems. 4. ed. (versão DS 4.03). " +
    "distributed-systems.net. Cap. 4. Communication, seção 4.2 (leitura " +
    "complementar: RPC passo a passo, variações assíncronas e RPC multicast).",
    "JEFFERY, T. Distributed Services with Go. Raleigh: The Pragmatic Bookshelf, " +
    "2021. Cap. 4. Serve Requests with gRPC (leitura complementar: a linhagem da " +
    "RPC hoje: gRPC, buffers de protocolo e stubs gerados)."
  ]
};
