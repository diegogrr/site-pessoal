/* ============================================================
   topic-07.js — Segurança
   ------------------------------------------------------------
   Estrutura documentada no modelo topic-01.js (sections[] com
   slides[] opcionais, quiz[], glossary[], references[]).
   Fundamentação: manifesto em docs/fontes/topico-07.json.
   Hierarquia de fontes em docs/fontes/README.md — o Coulouris
   (cap. 11) dá o esqueleto, que vai da ameaça à criptografia,
   daí às assinaturas e ao controle de acesso, e fecha nos
   protocolos reais; o van Steen 4. ed. (cap. 9) manda no
   conteúdo e acrescenta gerência de chaves, autorização,
   confiança e monitoramento.
   A seção 1 retoma política contra mecanismo como conhecimento
   dado: o assunto foi absorvido pelo tópico 02 em 2026-08-04.
   ============================================================ */

window.SD = window.SD || {};
SD.content = SD.content || {};

SD.content["07"] = {

  sections: [
    {
      title: "Ameaças, política e projeto",
      html:
        "<p>Os seis tópicos anteriores construíram sistemas que funcionam. Processos " +
        "conversam por soquetes, chamadas remotas parecem locais, servidores atendem " +
        "milhares de pedidos e o sistema operacional distribui tudo isso por várias " +
        "máquinas. Este tópico troca a pergunta. E se alguém quiser quebrar tudo isso de " +
        "propósito?</p>" +
        "<p>A necessidade de segurança não é um acréscimo tardio ao que já foi " +
        "construído. Ela nasce do mesmo desejo que criou os sistemas distribuídos, que é " +
        "compartilhar recursos. Um recurso que ninguém compartilha se protege por " +
        "isolamento, e basta mantê-lo fora da rede. Um recurso compartilhado vive dentro " +
        "de um processo cuja interface é necessariamente aberta, porque qualquer cliente " +
        "novo precisa poder chamá-la, e conversa por uma rede usada por muita gente.</p>" +
        "<p>Quem está autorizado a operar sobre um recurso é um <strong>principal</strong>, " +
        "que pode ser um usuário ou um processo agindo em nome dele. O termo atravessa o " +
        "tópico inteiro, e vale guardá-lo desde já, porque todo mecanismo daqui em diante " +
        "responde a alguma pergunta sobre principais.</p>" +
        "<p>O tópico 02 já separou <strong>política</strong> de <strong>mecanismo</strong> " +
        "e nomeou os quatro mecanismos de segurança, que são criptografar, autenticar, " +
        "autorizar e auditar. Aquela separação continua valendo e não vai ser " +
        "reapresentada. O que muda é o foco. Lá o assunto era como um sistema distribuído " +
        "se organiza, e a segurança apareceu como uma das preocupações do projeto. Aqui os " +
        "mecanismos são o assunto, e a pergunta é como cada um funciona por dentro e o que " +
        "ele de fato garante.</p>" +
        "<h3>Três classes de ameaça</h3>" +
        "<p>Antes de escolher mecanismo é preciso saber contra o que se está defendendo. " +
        "As ameaças à segurança se agrupam em três classes, e a distinção entre elas " +
        "importa porque cada uma exige uma resposta diferente.</p>" +
        "<p>O <strong>vazamento</strong> é a chegada de informação a quem não deveria " +
        "recebê-la. É a ameaça que a maioria das pessoas imagina quando ouve a palavra " +
        "segurança, e é também a única das três que a criptografia sozinha consegue " +
        "tratar bem.</p>" +
        "<p>A <strong>falsificação</strong> é a alteração não autorizada da informação. " +
        "Ela é pior que o vazamento em muitos contextos, porque um dado alterado continua " +
        "parecendo legítimo e o sistema segue operando sobre ele. Um saldo bancário lido " +
        "por quem não devia é um problema, e um saldo bancário alterado é outro bem " +
        "maior.</p>" +
        "<p>O <strong>vandalismo</strong> é a interferência na operação correta do " +
        "sistema sem que o invasor ganhe nada com isso. Ele existe porque nem todo ataque " +
        "busca proveito, e é a classe que mais frustra quem tenta se defender pensando em " +
        "motivação econômica.</p>" +
        "<h3>Cinco maneiras de abusar de um canal</h3>" +
        "<p>As três classes acima dizem o que se perde. Falta dizer como o invasor chega " +
        "lá, e num sistema distribuído ele chega quase sempre pelo canal de comunicação, " +
        "seja obtendo acesso a um canal existente, seja estabelecendo um canal novo que se " +
        "faz passar por autorizado. A tabela abaixo separa os métodos pelo que o invasor " +
        "faz com as mensagens.</p>" +
        '<div class="tabela-rolagem">' +
        '<table class="tabela-conteudo" id="tab-ataques-canal">' +
        "<tr><th>Método</th><th>O que o invasor faz</th><th>Contra o que ele se apoia</th></tr>" +
        "<tr><td>Intromissão</td><td>Obtém cópias das mensagens sem autorização.</td>" +
        "<td>Na maioria das redes locais, basta um programa ouvindo o meio.</td></tr>" +
        "<tr><td>Mascaramento</td><td>Envia ou recebe mensagens com a identidade de outro " +
        "principal.</td><td>O destinatário não tem como conferir quem realmente falou.</td></tr>" +
        "<tr><td>Falsificação de mensagem</td><td>Intercepta a mensagem e altera o " +
        "conteúdo antes de entregá-la.</td><td>O caminho passa por nós que ninguém " +
        "controla.</td></tr>" +
        "<tr><td>Reprodução</td><td>Guarda mensagens interceptadas e as reenvia mais " +
        "tarde.</td><td>A mensagem copiada é legítima, e só não é nova.</td></tr>" +
        "<tr><td>Negação de serviço</td><td>Satura um canal ou um recurso para impedir o " +
        "acesso dos demais.</td><td>Um serviço aberto precisa aceitar pedidos de " +
        "desconhecidos.</td></tr>" +
        "</table>" +
        "</div>" +
        "<p>Duas linhas dessa tabela merecem uma segunda leitura. A falsificação de " +
        "mensagem tem uma forma célebre, o <strong>ataque do homem no meio</strong>, em " +
        "que o invasor intercepta justamente a primeira troca de chaves de uma conversa e " +
        "substitui as chaves pelas dele. A partir daí ele decifra tudo, lê, recifra com a " +
        "chave certa e repassa adiante, e nenhuma das duas pontas percebe.</p>" +
        "<p>A reprodução é a mais desconcertante das cinco, porque funciona mesmo contra " +
        "mensagens cifradas e autenticadas. O invasor não precisa da chave para copiar o " +
        "padrão de bits de um pedido de pagamento e reenviá-lo amanhã. A mensagem " +
        "reproduzida é autêntica de verdade, e o problema não está no conteúdo dela, e sim " +
        "no fato de o destinatário não ter como saber que ela é velha. Guarde isso, porque " +
        "boa parte dos protocolos da seção 4 existe para resolver exatamente esse " +
        "ponto.</p>" +
        '<div class="callout">' +
        '<p class="callout-title">💡 O elenco da segurança</p>' +
        "<p>A literatura de segurança dá nomes próprios aos participantes desde o artigo " +
        "de 1978 em que Rivest, Shamir e Adleman (RSA) apresentaram a criptografia de " +
        "chave pública, e este tópico usa a mesma convenção. Alice e Bob são os " +
        "participantes legítimos, Carol e Dave entram quando o protocolo tem três ou " +
        "quatro partes, Eve é a bisbilhoteira que só escuta, Mallory é o invasor que " +
        "interfere e Sara é um servidor. Nomear os papéis parece brincadeira, e não é. " +
        "Quando o protocolo vira uma conversa entre pessoas com nome, a brecha fica " +
        "visível, e descrever quem sabe o quê em cada passo passa a ser fácil.</p>" +
        "</div>" +
        "<h3>Em que camada o mecanismo mora</h3>" +
        "<p>Sabendo do que se defender, a primeira decisão de projeto não é qual algoritmo " +
        "usar, e sim em que altura do sistema colocar a proteção. Um sistema distribuído " +
        "se organiza em camadas, e praticamente toda camada tem uma solução de segurança " +
        "consagrada. A figura abaixo mostra cinco alturas possíveis, com um exemplo real " +
        "em cada uma.</p>" +
        '<figure class="figura" id="fig-camadas-mecanismo">' +
        '<svg viewBox="0 0 600 292" role="img" aria-labelledby="fig-camadas-titulo">' +
        '<title id="fig-camadas-titulo">Cinco faixas empilhadas, uma por camada do ' +
        "sistema. Da mais alta para a mais baixa aparecem a aplicação, com cifragem fim a " +
        "fim; o middleware, com um serviço de autenticação; os serviços do sistema " +
        "operacional, com o login remoto seguro; o transporte, com o canal seguro sobre " +
        "TCP; e a rede, com o túnel entre redes. Quanto mais alta a camada, menos a " +
        "proteção depende de terceiros e mais a própria aplicação paga para " +
        "mantê-la.</title>" +
        '<rect class="caixa" x="14" y="12" width="212" height="44" rx="8"/>' +
        '<text x="120" y="40" text-anchor="middle" font-size="13">Aplicação</text>' +
        '<rect class="caixa-destaque" x="240" y="12" width="346" height="44" rx="8"/>' +
        '<text x="413" y="40" text-anchor="middle" font-size="13">cifragem fim a fim, ' +
        "feita pela própria aplicação</text>" +
        '<rect class="caixa" x="14" y="66" width="212" height="44" rx="8"/>' +
        '<text x="120" y="94" text-anchor="middle" font-size="13">Middleware</text>' +
        '<rect class="caixa-destaque" x="240" y="66" width="346" height="44" rx="8"/>' +
        '<text x="413" y="94" text-anchor="middle" font-size="13">serviço de autenticação ' +
        "compartilhado (Kerberos)</text>" +
        '<rect class="caixa" x="14" y="120" width="212" height="44" rx="8"/>' +
        '<text x="120" y="142" text-anchor="middle" font-size="13">Serviços do sistema</text>' +
        '<text x="120" y="158" text-anchor="middle" font-size="13">operacional</text>' +
        '<rect class="caixa-destaque" x="240" y="120" width="346" height="44" rx="8"/>' +
        '<text x="413" y="148" text-anchor="middle" font-size="13">login remoto seguro ' +
        "(SSH), com protocolo próprio</text>" +
        '<rect class="caixa" x="14" y="174" width="212" height="44" rx="8"/>' +
        '<text x="120" y="202" text-anchor="middle" font-size="13">Transporte</text>' +
        '<rect class="caixa-destaque" x="240" y="174" width="346" height="44" rx="8"/>' +
        '<text x="413" y="202" text-anchor="middle" font-size="13">canal seguro sobre uma ' +
        "conexão TCP (TLS)</text>" +
        '<rect class="caixa" x="14" y="228" width="212" height="44" rx="8"/>' +
        '<text x="120" y="256" text-anchor="middle" font-size="13">Rede e enlace</text>' +
        '<rect class="caixa-destaque" x="240" y="228" width="346" height="44" rx="8"/>' +
        '<text x="413" y="256" text-anchor="middle" font-size="13">túnel entre duas redes ' +
        "distantes (VPN)</text>" +
        '<text class="rotulo-secundario" x="300" y="286" text-anchor="middle" ' +
        'font-size="12">mais alto protege mais, e a conta fica com quem escreveu a ' +
        "aplicação</text>" +
        "</svg>" +
        "<figcaption>A mesma ameaça pode ser tratada em cinco alturas diferentes, e a " +
        "escolha muda quem paga a conta. Um túnel entre redes protege tudo o que passa " +
        "por ele sem que nenhum programa saiba disso. Uma aplicação que cifra sozinha, " +
        "como os mensageiros modernos, não depende de garantia nenhuma das camadas de " +
        "baixo, e em troca precisa manter todo o mecanismo por conta própria.</figcaption>" +
        "</figure>" +
        "<p>Repare que as duas pontas da figura representam decisões opostas. A cifragem " +
        "fim a fim da aplicação não confia em nada abaixo dela, o que é a escolha certa " +
        "quando o próprio provedor da infraestrutura está na lista de ameaças. Ao mesmo " +
        "tempo, separar a função da aplicação daquilo que ela precisa em matéria de " +
        "segurança quase sempre simplifica a vida. Quem automatiza uma cópia de segurança " +
        "de várias máquinas remotas ganha muito usando o login remoto seguro que o sistema " +
        "operacional já oferece, em vez de reimplementar aquilo dentro do próprio " +
        "programa.</p>" +
        "<h3>A base de computação confiável</h3>" +
        "<p>Escolhida a camada, aparece uma segunda pergunta, que é de quanta coisa a " +
        "segurança do sistema depende. A <strong>base de computação confiável</strong> é " +
        "o conjunto de mecanismos necessários e suficientes para fazer valer a política de " +
        "segurança, e que portanto precisam ser confiáveis. Ela inclui software, " +
        "firmware, hardware e também pessoas.</p>" +
        "<p>Quanto menor essa base, melhor. A razão é prática. Se dá para dizer com " +
        "clareza quais módulos precisam ser confiáveis, também dá para dizer onde " +
        "concentrar a inspeção quando alguém quiser afirmar que o sistema é seguro. " +
        "Nenhum programa aplicativo deveria estar nessa lista, o que é o mesmo que dizer " +
        "que não se confia num aplicativo para proteger os dados dos usuários dele.</p>" +
        "<p>Na prática, separar o confiável do não confiável é mais difícil do que " +
        "parece. Um programa que precisa de privilégio administrativo claramente entra na " +
        "base, porque comprometê-lo dá ao invasor muito mais do que aquele programa " +
        "deveria poder fazer. Já um serviço de armazenamento próprio, executado como um " +
        "conjunto de scripts sem privilégio nenhum, é ambíguo, porque alguns desses " +
        "scripts criam e removem usuários do próprio serviço. A resposta depende da " +
        "política, e quando ela não foi escrita não existe resposta.</p>" +
        "<h3>Cinco princípios que envelheceram bem</h3>" +
        "<p>Projetar para a segurança tem princípios estabelecidos há meio século, " +
        "propostos por Saltzer e Schroeder em 1975 e revisitados quase quarenta anos " +
        "depois com a conclusão de que a maioria continua valendo. Eles não substituem a " +
        "análise de ameaças, e servem como perguntas a fazer sobre qualquer projeto.</p>" +
        '<div class="tabela-rolagem">' +
        '<table class="tabela-conteudo" id="tab-principios">' +
        "<tr><th>Princípio</th><th>O que ele exige</th><th>Como ele falha na prática</th></tr>" +
        "<tr><td>Padrão seguro por omissão</td><td>A configuração de fábrica já protege, " +
        "porque quase ninguém a troca.</td><td>O par de usuário e senha administrativos " +
        "iguais em todos os aparelhos de um modelo.</td></tr>" +
        "<tr><td>Projeto aberto</td><td>Todo aspecto do sistema fica disponível para " +
        "revisão, sem segurança por obscuridade.</td><td>Sistemas grandes demais para que " +
        "a leitura do projeto ainda signifique alguma coisa.</td></tr>" +
        "<tr><td>Separação de privilégio</td><td>Nenhuma entidade sozinha controla o que é " +
        "realmente crítico.</td><td>Um único administrador capaz de desligar o serviço " +
        "inteiro.</td></tr>" +
        "<tr><td>Menor privilégio</td><td>Cada processo opera com os menores direitos que " +
        "bastam para o trabalho dele.</td><td>Serviços que rodam como administrador " +
        "porque assim é mais fácil.</td></tr>" +
        "<tr><td>Mecanismo comum mínimo</td><td>Componentes que precisam do mesmo " +
        "mecanismo recebem a mesma implementação dele.</td><td>Três versões do mesmo " +
        "controle de acesso espalhadas pelo sistema.</td></tr>" +
        "</table>" +
        "</div>" +
        "<p>A lista original trazia outros três princípios que envelheceram de maneira " +
        "desigual. A economia de mecanismo, que manda manter o sistema o mais simples " +
        "possível, continua sendo um objetivo excelente e cada vez mais distante do que a " +
        "engenharia consegue entregar. A mediação completa exige conferir toda a operação " +
        "sobre todo objeto, e a dificuldade hoje é que nem sempre se descobre por onde o " +
        "invasor entrou. A aceitação psicológica pede interfaces em que a pessoa consiga " +
        "fazer apenas a coisa certa, e vem recebendo mais atenção justamente porque " +
        "organizações perceberam o quanto ficam vulneráveis quando os funcionários não " +
        "conseguem trabalhar com o sistema.</p>" +
        "<h3>Supor o pior, e pagar o preço certo</h3>" +
        "<p>Segurança se projeta supondo o pior, o que significa partir de um conjunto de " +
        "suposições desconfortáveis sobre o mundo em que o sistema vai operar. Quatro " +
        "delas sustentam tudo o que este tópico descreve.</p>" +
        "<ul>" +
        "<li>As <strong>interfaces estão expostas</strong>, e qualquer um pode enviar uma " +
        "mensagem para qualquer interface de qualquer serviço.</li>" +
        "<li>As <strong>redes são inseguras</strong>, e tanto o remetente de uma mensagem " +
        "quanto o endereço de um computador podem ser forjados.</li>" +
        "<li>Os <strong>algoritmos e o código estão nas mãos do invasor</strong>, e por " +
        "isso a prática correta é publicar os algoritmos e concentrar o segredo apenas nas " +
        "chaves.</li>" +
        "<li>O <strong>invasor dispõe de recursos enormes</strong>, e o " +
        "dimensionamento precisa considerar os computadores que existirão durante toda a " +
        "vida do sistema, com alguma folga.</li>" +
        "</ul>" +
        "<p>A terceira suposição costuma surpreender quem chega ao assunto pela primeira " +
        "vez. Publicar o algoritmo parece entregar o jogo ao adversário, e o efeito medido " +
        "foi o contrário. Algoritmo aberto ao escrutínio de uma comunidade inteira fica " +
        "mais forte, e algoritmo secreto é inadequado para redes de larga escala, porque " +
        "quanto mais amplamente distribuído está um segredo, maior o risco de ele " +
        "aparecer.</p>" +
        "<p>Há ainda uma suposição sobre o tempo. Todo segredo tem prazo e escopo " +
        "limitados, porque uma chave recém-gerada é seguramente íntegra e uma chave muito " +
        "usada e muito compartilhada não é. Essa ideia simples reaparece na seção 3 como " +
        "chave de sessão e na seção 4 como prazo de validade de tíquete.</p>" +
        "<p>Com as suposições no lugar, o método é direto. Os projetistas constroem a " +
        "<strong>lista de ameaças</strong>, que reúne as maneiras pelas quais a política " +
        "poderia ser violada, e mostram que cada uma delas é evitada pelos mecanismos " +
        "empregados. Como nenhuma lista é exaustiva, o sistema também mantém " +
        "<strong>auditoria</strong>, na forma de um registro seguro com carimbo de tempo " +
        "que guarda o principal, a operação executada e o objeto afetado. A auditoria não " +
        "protege coisa alguma, e serve para analisar a violação depois que ela " +
        "aconteceu.</p>" +
        "<p>Falta o lado econômico, que os cursos de segurança costumam esquecer. " +
        "Mecanismo custa processamento e tráfego, e medida mal especificada impede o " +
        "usuário legítimo de fazer o que precisa. Por isso o projeto pondera custo contra " +
        "ameaça, e a proteção deve custar menos do que vale aquilo que ela protege.</p>" +
        "<h3>Privacidade não é a mesma coisa que sigilo</h3>" +
        "<p>Uma distinção recente fecha esta seção, e ela mudou o que se espera de um " +
        "sistema distribuído nos últimos anos. Confidencialidade e privacidade são " +
        "parentes próximos e não são sinônimos. A confidencialidade é violada, enquanto a " +
        "privacidade é invadida.</p>" +
        "<p>Garantir que dado nenhum seja revelado sem autorização não basta para " +
        "garantir privacidade. O direito à privacidade é melhor descrito como o direito ao " +
        "fluxo apropriado da informação pessoal, ou seja, ao controle sobre quem vê o quê, " +
        "quando e como. Isso inclui algo que os sistemas de ontem não previam, que é a " +
        "possibilidade de a pessoa interromper e revogar um fluxo que já começou.</p>" +
        "<p>Do lado prático existe hoje regulação, e a mais influente delas é o " +
        "regulamento geral de proteção de dados da União Europeia, conhecido pela sigla " +
        "GDPR, em vigor desde 2016. Ainda não está claro até que ponto é possível " +
        "construir um sistema distribuído plenamente conforme, mas há um consenso " +
        "desconfortável de que adequar o sistema depois de pronto é muito mais difícil, " +
        "quando não impossível. É o mesmo aviso que a segurança já fazia. Medidas de " +
        "proteção precisam ser pensadas no estágio de projeto básico, porque a Internet e " +
        "os sistemas conectados a ela nasceram sem elas e vêm pagando por isso desde " +
        "então.</p>",
      slides: [
        {
          title: "Por que segurança existe",
          html:
            "<ul>" +
            "<li>Compartilhar recursos é o que cria a necessidade de protegê-los</li>" +
            "<li>Interface de serviço é <strong>necessariamente aberta</strong></li>" +
            "<li>A rede é de todos, inclusive de Mallory</li>" +
            "<li><strong>Principal</strong> é quem está autorizado a operar sobre o recurso</li>" +
            "<li>Política contra mecanismo já veio do tópico 02</li>" +
            "</ul>"
        },
        {
          title: "Três classes de ameaça",
          html:
            "<ul>" +
            "<li><strong>Vazamento</strong>, a informação chega a quem não devia</li>" +
            "<li><strong>Falsificação</strong>, a informação é alterada sem autorização</li>" +
            "<li><strong>Vandalismo</strong>, o sistema para sem ganho para o invasor</li>" +
            "<li>Dado alterado é pior que dado lido, porque o sistema segue confiando nele</li>" +
            "</ul>"
        },
        {
          title: "Como se abusa de um canal",
          ref: "tab-ataques-canal"
        },
        {
          title: "A reprodução é a mais teimosa",
          html:
            "<ul>" +
            "<li>Funciona contra mensagem cifrada <strong>e</strong> autenticada</li>" +
            "<li>A cópia é legítima, e só não é nova</li>" +
            "<li>O invasor não precisa da chave para copiar bits</li>" +
            "<li>Metade dos protocolos da seção 4 existe por causa disso</li>" +
            "</ul>"
        },
        {
          title: "Em que camada o mecanismo mora",
          ref: "fig-camadas-mecanismo"
        },
        {
          title: "Base de computação confiável",
          html:
            "<ul>" +
            "<li>Os mecanismos necessários e suficientes para impor a política</li>" +
            "<li>Inclui software, hardware e pessoas</li>" +
            "<li>Quanto menor, mais fácil dizer onde inspecionar</li>" +
            "<li>Não se confia em aplicativo para proteger dado de usuário</li>" +
            "</ul>"
        },
        {
          title: "Cinco princípios de projeto",
          ref: "tab-principios"
        },
        {
          title: "Supor o pior",
          html:
            "<ul>" +
            "<li>Interfaces expostas e redes inseguras</li>" +
            "<li>Algoritmo público, segredo só na chave</li>" +
            "<li>Invasor com recursos enormes, e segredo com prazo</li>" +
            "<li>Lista de ameaças, mais auditoria, porque a lista nunca é completa</li>" +
            "<li>A proteção custa menos do que vale o que ela protege</li>" +
            "</ul>"
        },
        {
          title: "Privacidade contra sigilo",
          html:
            "<ul>" +
            "<li>A confidencialidade é violada, a privacidade é invadida</li>" +
            "<li>Privacidade é o direito ao fluxo apropriado da informação pessoal</li>" +
            "<li>Inclui interromper e revogar um fluxo já iniciado</li>" +
            "<li>Adequar depois de pronto é muito mais difícil</li>" +
            "</ul>"
        }
      ]
    },

    {
      title: "Criptografia",
      html:
        "<p>Os quatro mecanismos de segurança repousam sobre uma primitiva só. Sem " +
        "criptografia não há como esconder um dado de quem observa o canal, não há como " +
        "provar quem escreveu uma mensagem e não há como detectar que alguém a alterou. " +
        "Esta seção constrói a primitiva, e as duas seguintes só a aplicam.</p>" +
        "<p>A ideia é simples de enunciar. Quem envia transforma a mensagem original, " +
        "chamada de <strong>texto puro</strong>, em uma mensagem ininteligível, chamada de " +
        "<strong>texto cifrado</strong>, e envia essa segunda forma. Quem recebe desfaz a " +
        "transformação. Cifrar e decifrar são feitos por métodos parametrizados por um " +
        "segredo, a <strong>chave</strong>, de tal maneira que reverter a transformação " +
        "sem ela seja impraticável.</p>" +
        "<p>Descrever protocolo de segurança em prosa fica confuso rápido, então a " +
        "literatura usa uma notação enxuta. A tabela abaixo reúne a que este tópico " +
        "usa.</p>" +
        '<div class="tabela-rolagem">' +
        '<table class="tabela-conteudo" id="tab-notacao">' +
        "<tr><th>Notação</th><th>O que significa</th></tr>" +
        "<tr><td><code>K(A,B)</code></td><td>Chave secreta compartilhada por A e por B.</td></tr>" +
        "<tr><td><code>PK(A)</code></td><td>Chave pública de A, que qualquer um pode conhecer.</td></tr>" +
        "<tr><td><code>SK(A)</code></td><td>Chave privada de A, que só A conhece.</td></tr>" +
        "<tr><td><code>K(m)</code></td><td>A mensagem m cifrada com a chave K.</td></tr>" +
        "<tr><td><code>H(m)</code></td><td>O resumo de m, calculado pela função de resumo H.</td></tr>" +
        "<tr><td><code>[m]A</code></td><td>A mensagem m assinada digitalmente por A.</td></tr>" +
        "</table>" +
        "</div>" +
        "<h3>Três ataques que a cifragem trata</h3>" +
        "<p>Vale saber exatamente o que a cifragem resolve, porque ela resolve mais do que " +
        "o senso comum supõe e menos do que os alunos costumam esperar. Ela ajuda contra " +
        "três dos ataques da seção anterior.</p>" +
        "<p>O primeiro é a <strong>interceptação</strong>. Se a mensagem foi cifrada de " +
        "maneira que decifrá-la sem a chave seja inviável, interceptar não serve de nada, " +
        "porque o intruso vê apenas dados ininteligíveis.</p>" +
        "<p>O segundo é a <strong>modificação</strong>. Alterar texto puro é trivial. " +
        "Alterar texto cifrado de forma útil é bem mais difícil, porque o intruso " +
        "precisaria primeiro decifrar a mensagem para saber o que está mudando, e depois " +
        "recifrá-la corretamente, sob pena de o destinatário notar a adulteração.</p>" +
        "<p>O terceiro é a <strong>inserção</strong>, em que o intruso injeta mensagens " +
        "novas na conversa tentando fazer o destinatário acreditar que elas vieram do " +
        "remetente legítimo. Repare que quem consegue modificar mensagens também consegue " +
        "inseri-las, então os dois ataques andam juntos.</p>" +
        "<p>Falta o que a cifragem não trata, e a lacuna é instrutiva. A simples " +
        "existência do tráfego já informa. Se numa crise internacional o volume de " +
        "mensagens que chega a um prédio de governo despenca enquanto o volume que chega a " +
        "certa montanha dispara, existe informação valiosa aí, e cifrar cada mensagem não " +
        "esconde nada disso.</p>" +
        "<h3>Duas famílias, dois problemas diferentes</h3>" +
        "<p>A distinção fundamental entre sistemas criptográficos está em saber se a chave " +
        "que cifra é a mesma que decifra. No sistema <strong>simétrico</strong>, também " +
        "chamado de chave secreta ou chave compartilhada, ela é a mesma, e por isso quem " +
        "envia e quem recebe precisam compartilhá-la sem que mais ninguém a veja. No " +
        "sistema <strong>assimétrico</strong>, também chamado de chave pública, as duas " +
        "chaves são diferentes e formam um par único, com uma delas publicada e a outra " +
        "mantida em segredo.</p>" +
        "<p>Qual das duas se publica depende do que se quer. Para mandar uma mensagem " +
        "confidencial a Bob, Alice cifra com a chave pública de Bob, e como só ele tem a " +
        "privada correspondente, só ele decifra. Para provar que uma mensagem veio de " +
        "Alice, ela cifra com a própria chave privada, e quem conseguir decifrá-la com a " +
        "chave pública de Alice sabe de onde ela veio. É a mesma matemática servindo a " +
        "dois objetivos opostos, e essa inversão é a base da assinatura digital da seção " +
        "3.</p>" +
        '<div class="tabela-rolagem">' +
        '<table class="tabela-conteudo" id="tab-familias">' +
        "<tr><th>Dimensão</th><th>Chave secreta (simétrica)</th><th>Chave pública (assimétrica)</th></tr>" +
        "<tr><td>Quantas chaves</td><td>Uma, conhecida pelos dois lados.</td>" +
        "<td>Um par por participante, com uma publicada.</td></tr>" +
        "<tr><td>O problema que resolve bem</td><td>Cifrar muito dado depressa.</td>" +
        "<td>Combinar segredo com quem nunca se encontrou antes.</td></tr>" +
        "<tr><td>O problema que ela cria</td><td>Entregar a chave ao outro lado sem " +
        "expô-la.</td><td>Garantir que a chave pública é mesmo de quem diz ser.</td></tr>" +
        "<tr><td>Custo de processamento</td><td>Referência da comparação.</td>" +
        "<td>De 100 a 1.000 vezes maior.</td></tr>" +
        "<tr><td>Uso típico</td><td>O corpo da conversa.</td><td>A abertura da conversa e " +
        "a assinatura.</td></tr>" +
        "</table>" +
        "</div>" +
        "<p>A última linha antecipa a conclusão da seção. As duas famílias não competem " +
        "entre si, e sim se completam, porque cada uma é boa exatamente onde a outra é " +
        "ruim.</p>" +
        "<h3>Mão única e alçapão</h3>" +
        "<p>Falta explicar por que reverter a transformação sem a chave é inviável, e a " +
        "resposta está numa classe de funções. Uma <strong>função de mão única</strong> é " +
        "fácil de calcular numa direção e inviável de inverter. Nos algoritmos simétricos, " +
        "a resistência à força bruta cresce com o tamanho da chave, e testar todas as " +
        "chaves de N bits custa em média metade das combinações possíveis, o que dobra a " +
        "cada bit acrescentado.</p>" +
        "<p>Os algoritmos de chave pública precisam de algo a mais, porque neles alguém " +
        "tem que conseguir inverter. Eles usam <strong>funções de alçapão</strong>, que " +
        "são de mão única para todo mundo e têm uma saída secreta para quem conhece o " +
        "segredo. No RSA, o alçapão é a fatoração. Multiplicar dois números primos muito " +
        "grandes, maiores que dez elevado a cem, é imediato, e recuperar os dois fatores a " +
        "partir do produto é inviável com os algoritmos conhecidos.</p>" +
        "<p>Dá para ver a mecânica com números de brinquedo, e o livro-fonte usa " +
        "justamente estes. Tomando os primos <code>P = 13</code> e <code>Q = 17</code>, " +
        "chega-se a <code>N = 221</code> e a <code>Z = 192</code>. Escolhendo " +
        "<code>d = 5</code>, que não tem fator comum com Z, resolve-se a equação " +
        "<code>c * d = 1 mod Z</code> e chega-se a <code>c = 77</code>. O par " +
        "<code>&lt;77, 221&gt;</code> vira a chave pública e o par " +
        "<code>&lt;5, 221&gt;</code> vira a privada. Com primos de verdade, o mesmo " +
        "cálculo continua fácil e a fatoração de N deixa de ser possível.</p>" +
        "<p>O tamanho da chave RSA acompanhou o avanço dos fatoradores. Chaves de 512 bits " +
        "já foram quebradas, o mínimo recomendado passou a 768 bits para segurança de " +
        "longo prazo, e aplicações exigentes chegam a 2.048. Existe ainda uma segunda " +
        "família assimétrica, a de <strong>curvas elípticas</strong>, cuja segurança não " +
        "depende da dificuldade de fatorar. Ela alcança segurança equivalente com chaves " +
        "menores e menos processamento, o que a torna atraente para dispositivos móveis, " +
        "que têm pouco de ambos.</p>" +
        "<h3>Como o texto se esconde</h3>" +
        "<p>Por dentro, um algoritmo simétrico faz duas coisas com o texto puro, e as duas " +
        "vêm da teoria da informação. A <strong>mistura</strong> combina cada bloco de " +
        "texto com a chave por operações que não destroem informação, como o ou exclusivo " +
        "e o deslocamento circular, escondendo a relação entre o texto e o resultado. A " +
        "<strong>difusão</strong> transpõe partes de cada bloco para eliminar os padrões " +
        "regulares que todo texto natural tem.</p>" +
        "<p>A maioria desses algoritmos trabalha sobre <strong>cifras de bloco</strong>, " +
        "de 64 ou 128 bits. Cifrar cada bloco isoladamente tem um defeito que aparece " +
        "rápido, porque dois blocos iguais no texto puro produzem dois blocos iguais no " +
        "texto cifrado, e o padrão do original reaparece no resultado. A correção é o " +
        "<strong>encadeamento de blocos de cifra</strong>, conhecido pela sigla CBC, em " +
        "que cada bloco de texto puro passa por um ou exclusivo com o bloco cifrado " +
        "anterior antes de ser cifrado. Um <strong>vetor de inicialização</strong> " +
        "diferente a cada mensagem completa a proteção, impedindo que duas mensagens " +
        "iguais gerem o mesmo texto cifrado.</p>" +
        "<p>Dados em tempo real, como voz e vídeo, não podem esperar o bloco encher. Para " +
        "eles existe a <strong>cifra de fluxo</strong>, que gera um fluxo de chaves " +
        "pseudoaleatório e o combina bit a bit com os dados por ou exclusivo, como um " +
        "ruído que o receptor sabe subtrair. Cifra de fluxo não usa difusão, simplesmente " +
        "porque não há bloco a transpor, e ela tem uma regra que não admite exceção. O " +
        "fluxo de chaves nunca pode se repetir.</p>" +
        "<h3>O arsenal, e o que envelheceu</h3>" +
        "<p>A tabela a seguir reúne os algoritmos que aparecem no restante do tópico, e " +
        "quase todos são conhecidos por sigla. O algoritmo minúsculo de cifragem, " +
        "conhecido pela sigla TEA, entra por ser didático. O padrão de cifragem de dados " +
        "(DES) e o padrão de criptografia avançada (AES) foram os padrões americanos " +
        "sucessivos, o segundo escolhido pelo instituto nacional de padrões e tecnologia " +
        "dos Estados Unidos, conhecido pela sigla NIST. Completam os simétricos o " +
        "algoritmo internacional de cifragem de dados (IDEA) e a quarta cifra de Ronald " +
        "Rivest, conhecida pela sigla RC4. Entram ainda duas funções de resumo, o quinto " +
        "resumo de mensagem de Rivest (MD5) e o algoritmo de resumo seguro, conhecido " +
        "pela sigla SHA.</p>" +
        "<p>As velocidades foram medidas pela biblioteca Crypto++ num Pentium 4 de 2,1 " +
        "GHz. A máquina é antiga, o que não invalida a comparação, porque o que interessa " +
        "aqui é a razão entre as linhas, e não o valor absoluto de cada uma.</p>" +
        '<div class="tabela-rolagem">' +
        '<table class="tabela-conteudo" id="tab-arsenal">' +
        "<tr><th>Algoritmo</th><th>Chave ou resumo</th><th>Velocidade medida</th>" +
        "<th>O que vale saber</th></tr>" +
        "<tr><td>TEA</td><td>128 bits</td><td>23,8 MB/s</td><td>Cabe em meia página de " +
        "código C e serve para ver mistura e difusão virarem programa.</td></tr>" +
        "<tr><td>DES</td><td>56 bits</td><td>21,3 MB/s</td><td>Foi o padrão americano por " +
        "décadas e hoje é peça de museu.</td></tr>" +
        "<tr><td>Triple-DES</td><td>112 bits efetivos</td><td>9,8 MB/s</td><td>Aplica o " +
        "DES três vezes e resiste bem, ao preço de ser o mais lento da lista.</td></tr>" +
        "<tr><td>IDEA</td><td>128 bits</td><td>19,0 MB/s</td><td>Foi muito analisado e não " +
        "teve deficiência significativa encontrada.</td></tr>" +
        "<tr><td>AES</td><td>128, 192 ou 256 bits</td><td>61,0 a 48,2 MB/s</td><td>Venceu " +
        "o concurso público do NIST em 2000, com 21 propostas de 11 países, e é o padrão " +
        "atual.</td></tr>" +
        "<tr><td>RC4</td><td>até 2.048 bits</td><td>cerca de dez vezes o DES</td>" +
        "<td>É cifra de fluxo, foi adotada em todo lugar e teve deficiência publicada em " +
        "2001.</td></tr>" +
        "<tr><td>MD5</td><td>resumo de 128 bits</td><td>216,7 MB/s</td><td>É a função de " +
        "resumo mais rápida da lista, e a de resumo mais curto.</td></tr>" +
        "<tr><td>SHA-1</td><td>resumo de 160 bits</td><td>68,0 MB/s</td><td>É mais lenta " +
        "que o MD5 e resiste melhor por causa do resumo mais longo.</td></tr>" +
        "</table>" +
        "</div>" +
        "<p>Duas leituras saltam da tabela. As funções de resumo são muito mais rápidas " +
        "que qualquer cifra, o que a seção 3 vai explorar para produzir assinatura barata. " +
        "E o tamanho da chave conta uma história de obsolescência, porque o DES não caiu " +
        "por causa de defeito de projeto, e sim por causa de aritmética.</p>" +
        '<div class="callout">' +
        '<p class="callout-title">💡 O dia em que a Internet quebrou o DES</p>' +
        "<p>Em junho de 1997, um consórcio de voluntários da Internet resolveu demonstrar " +
        "que chaves menores que 128 bits não protegiam mais nada. Eles começaram com mil " +
        "máquinas comuns e chegaram a 14 mil em 24 horas, coordenadas por um único " +
        "servidor que distribuía a cada cliente a faixa de chaves que ele deveria testar. " +
        "Era um sistema distribuído atacando outro, com o mesmo desenho de mestre e " +
        "trabalhadores que o tópico 02 descreveu. A chave caiu em cerca de 12 semanas, " +
        "depois que aproximadamente 25% das combinações possíveis tinham sido " +
        "verificadas. No ano seguinte, uma máquina dedicada, construída pela Electronic " +
        "Frontier Foundation, passou a quebrar chaves DES em cerca de três dias.</p>" +
        "</div>" +
        "<h3>Resumo seguro</h3>" +
        "<p>Falta a terceira ferramenta criptográfica, e ela não cifra nada. Uma " +
        "<strong>função de resumo</strong> recebe uma mensagem de comprimento arbitrário " +
        "e devolve uma sequência de bits de comprimento fixo. O resultado lembra os bits " +
        "de verificação que os protocolos de comunicação anexam à mensagem para detectar " +
        "erro, e a diferença está nas garantias exigidas.</p>" +
        "<p>Uma função de resumo criptográfica tem três propriedades. Ela é de " +
        "<strong>mão única</strong>, então descobrir a mensagem a partir do resumo é " +
        "inviável, enquanto calcular o resumo a partir da mensagem é imediato. Ela tem " +
        "<strong>resistência fraca a colisão</strong>, o que quer dizer que, dada uma " +
        "mensagem e o resumo dela, achar outra mensagem com o mesmo resumo é inviável. E " +
        "ela tem <strong>resistência forte a colisão</strong>, que é mais exigente, porque " +
        "proíbe achar qualquer par de mensagens diferentes com resumos iguais.</p>" +
        "<p>Um uso imediato explica por que essas propriedades importam. Sistemas guardam " +
        "senhas como resumo, e não como texto. Quando alguém entra com uma senha, o " +
        "sistema calcula o resumo dela e compara com o guardado. Quem roubar o arquivo de " +
        "senhas leva resumos, e a propriedade de mão única obriga o invasor a adivinhar as " +
        "senhas em vez de simplesmente lê-las.</p>" +
        "<h3>O protocolo misto</h3>" +
        "<p>Agora as peças se encaixam. A criptografia assimétrica resolve a distribuição " +
        "de chaves sem canal seguro prévio, e cobra de 100 a 1.000 vezes mais " +
        "processamento. A simétrica é rápida, e exige que a chave já esteja dos dois " +
        "lados. A saída adotada em praticamente todo sistema distribuído de larga escala é " +
        "usar as duas, cada uma onde ela é boa.</p>" +
        '<figure class="figura" id="fig-protocolo-misto">' +
        '<svg viewBox="0 0 600 246" role="img" aria-labelledby="fig-misto-titulo">' +
        '<title id="fig-misto-titulo">Três passos em sequência. No primeiro, Alice obtém ' +
        "a chave pública de Bob. No segundo, ela gera uma chave de sessão e a envia " +
        "cifrada com a chave pública de Bob. No terceiro, os dois passam a cifrar os dados " +
        "com a chave de sessão. Os dois primeiros passos usam criptografia assimétrica e " +
        "acontecem uma vez; o terceiro usa criptografia simétrica e acontece o tempo " +
        "todo.</title>" +
        '<rect class="caixa" x="14" y="30" width="176" height="70" rx="8"/>' +
        '<text x="102" y="58" text-anchor="middle" font-size="13">Alice obtém a chave</text>' +
        '<text x="102" y="76" text-anchor="middle" font-size="13">pública de Bob</text>' +
        '<path class="traco" d="M190 65 L206 65"/>' +
        '<path class="seta" d="M206 59 L206 71 L218 65 Z"/>' +
        '<rect class="caixa" x="222" y="30" width="176" height="70" rx="8"/>' +
        '<text x="310" y="50" text-anchor="middle" font-size="13">Alice gera a chave</text>' +
        '<text x="310" y="68" text-anchor="middle" font-size="13">de sessão e a envia</text>' +
        '<text x="310" y="86" text-anchor="middle" font-size="13">cifrada com aquela</text>' +
        '<path class="traco" d="M398 65 L414 65"/>' +
        '<path class="seta" d="M414 59 L414 71 L426 65 Z"/>' +
        '<rect class="caixa-destaque" x="430" y="30" width="156" height="70" rx="8"/>' +
        '<text x="508" y="58" text-anchor="middle" font-size="13">os dois cifram os</text>' +
        '<text x="508" y="76" text-anchor="middle" font-size="13">dados com ela</text>' +
        '<path class="traco" d="M14 116 L398 116"/>' +
        '<path class="traco" d="M14 110 L14 122"/>' +
        '<path class="traco" d="M398 110 L398 122"/>' +
        '<text class="rotulo-secundario" x="206" y="140" text-anchor="middle" ' +
        'font-size="12">assimétrica, cara, uma vez por conversa</text>' +
        '<path class="traco" d="M430 116 L586 116"/>' +
        '<path class="traco" d="M430 110 L430 122"/>' +
        '<path class="traco" d="M586 110 L586 122"/>' +
        '<text class="rotulo-secundario" x="508" y="140" text-anchor="middle" ' +
        'font-size="12">simétrica, barata,</text>' +
        '<text class="rotulo-secundario" x="508" y="156" text-anchor="middle" ' +
        'font-size="12">o tempo todo</text>' +
        '<rect class="caixa" x="14" y="176" width="572" height="56" rx="8"/>' +
        '<text x="300" y="200" text-anchor="middle" font-size="13">Assinar um resumo com ' +
        "RSA de 1.024 bits custa perto de 4,75 ms, e verificar, 0,18 ms.</text>" +
        '<text x="300" y="220" text-anchor="middle" font-size="13">O AES cifra a 61 MB/s, ' +
        "então uma página de 100 KB sai em poucos milissegundos.</text>" +
        "</svg>" +
        "<figcaption>O esquema misto usa a chave pública apenas para autenticar as partes " +
        "e transportar uma chave de sessão, e deixa o volume de dados com a chave secreta. " +
        "Os números embaixo mostram por que a divisão funciona. O custo alto da " +
        "criptografia assimétrica é pago uma vez, e não por byte transmitido.</figcaption>" +
        "</figure>" +
        "<p>Esse é exatamente o desenho da segurança da camada de transporte (TLS), que " +
        "sustenta o comércio eletrônico inteiro e aparece em detalhe na seção 4. O " +
        "impacto do desempenho na velocidade " +
        "que o usuário percebe é mínimo, porque a parte cara acontece uma vez por sessão " +
        "e a parte repetida é a barata.</p>" +
        "<h3>Operar sobre o que não se pode ler</h3>" +
        "<p>Uma limitação incômoda acompanha tudo o que foi dito até aqui. Guardar dados " +
        "com segurança num servidor que não se controla é fácil, bastando cifrá-los com a " +
        "chave pública antes de enviá-los. Mas quando alguém precisa <em>calcular</em> " +
        "algo sobre esses dados, o servidor normalmente exige tê-los em texto puro, e a " +
        "proteção cai justamente no momento em que os dados são usados.</p>" +
        "<p>A <strong>criptografia homomórfica</strong> ataca esse problema. Ela tem a " +
        "propriedade de que uma operação matemática aplicada aos textos cifrados produz o " +
        "cifrado do resultado da mesma operação sobre os textos puros. Na prática, o " +
        "servidor soma ou multiplica dados que não consegue ler, e o resultado sai " +
        "cifrado com a mesma chave, pronto para ser guardado ou usado em outro cálculo.</p>" +
        "<p>Há um porém de desempenho. A forma geral, que suporta soma e multiplicação e " +
        "com isso permite implementar qualquer operação matemática, ainda é lenta demais " +
        "para uso amplo. Existem esquemas parciais, que suportam só a soma ou só a " +
        "multiplicação, com implementações eficientes, e o preço deles é servir apenas a " +
        "aplicações muito específicas.</p>",
      slides: [
        {
          title: "A primitiva de que tudo depende",
          html:
            "<ul>" +
            "<li>Texto puro vira texto cifrado, parametrizado por uma <strong>chave</strong></li>" +
            "<li>Reverter sem a chave precisa ser impraticável</li>" +
            "<li>Sem ela não há sigilo, prova de autoria nem detecção de alteração</li>" +
            "</ul>"
        },
        {
          title: "A notação do tópico",
          ref: "tab-notacao"
        },
        {
          title: "O que a cifragem trata",
          html:
            "<ul>" +
            "<li><strong>Interceptar</strong> deixa de valer a pena</li>" +
            "<li><strong>Modificar</strong> exige decifrar antes e recifrar depois</li>" +
            "<li><strong>Inserir</strong> anda junto com modificar</li>" +
            "<li>Não trata a existência do tráfego, que já informa sozinha</li>" +
            "</ul>"
        },
        {
          title: "Simétrica contra assimétrica",
          ref: "tab-familias"
        },
        {
          title: "Mão única e alçapão",
          html:
            "<ul>" +
            "<li>Mão única é fácil de ir e inviável de voltar</li>" +
            "<li>Força bruta dobra de custo a cada bit da chave</li>" +
            "<li>Alçapão é mão única com saída secreta, e no RSA a saída é a fatoração</li>" +
            "<li>Curvas elípticas dão a mesma segurança com chave menor</li>" +
            "</ul>"
        },
        {
          title: "Como o texto se esconde",
          html:
            "<ul>" +
            "<li><strong>Mistura</strong> combina bloco e chave, <strong>difusão</strong> " +
            "quebra padrão</li>" +
            "<li>Bloco isolado repete padrão, e o encadeamento CBC corrige</li>" +
            "<li>Vetor de inicialização impede que mensagens iguais saiam iguais</li>" +
            "<li>Cifra de fluxo serve tempo real, e nunca pode repetir o fluxo de chaves</li>" +
            "</ul>"
        },
        {
          title: "O arsenal",
          ref: "tab-arsenal"
        },
        {
          title: "Resumo seguro",
          html:
            "<ul>" +
            "<li>Entrada de qualquer tamanho, saída de tamanho fixo</li>" +
            "<li>Mão única, resistência fraca e resistência forte a colisão</li>" +
            "<li>Guardar senha como resumo obriga o invasor a adivinhar</li>" +
            "<li>É muito mais rápido que cifrar, e a seção 3 explora isso</li>" +
            "</ul>"
        },
        {
          title: "O protocolo misto",
          ref: "fig-protocolo-misto"
        },
        {
          title: "Calcular sem poder ler",
          html:
            "<ul>" +
            "<li>Dado cifrado no servidor fica exposto na hora de ser usado</li>" +
            "<li>A criptografia <strong>homomórfica</strong> opera sobre o cifrado</li>" +
            "<li>A forma geral ainda é lenta demais para uso amplo</li>" +
            "<li>As parciais são eficientes e servem a aplicações específicas</li>" +
            "</ul>"
        }
      ]
    },

    {
      title: "Assinaturas, certificados e controle de acesso",
      html:
        "<p>A seção anterior entregou sigilo, e sigilo não é tudo o que um sistema " +
        "distribuído precisa. Falta responder a duas perguntas que a cifra sozinha não " +
        "responde. De quem veio esta mensagem, e o que quem a mandou tem direito de fazer? " +
        "As duas respostas saem da mesma primitiva, e é isso que reúne assinaturas, " +
        "certificados e controle de acesso numa seção só.</p>" +
        "<h3>O que uma assinatura promete</h3>" +
        "<p>Vale começar pelo que já é familiar. Uma assinatura manuscrita atende três " +
        "necessidades de quem recebe o documento. Ela o convence de que o documento é " +
        "<strong>autêntico</strong>, ou seja, que o signatário assinou deliberadamente e " +
        "ninguém alterou o texto depois. Ela é <strong>impossível de falsificar</strong>, " +
        "porque prova que só o signatário poderia tê-la produzido e porque não se " +
        "transplanta para outro documento. E ela é <strong>impossível de " +
        "repudiar</strong>, então o signatário não pode negar depois que assinou.</p> " +
        "<p>Nenhuma dessas três propriedades é inteiramente alcançada pela assinatura " +
        "manuscrita, e o mundo convive com a imperfeição por causa da dificuldade de " +
        "fraudar e do risco de detecção. Documentos digitais são muito piores nesse " +
        "aspecto, porque copiar e alterar é trivial, e anexar o nome do autor como texto, " +
        "foto ou imagem não prova absolutamente nada.</p>" +
        "<p>Um exemplo torna concreto o que está em jogo. Bob vende a Alice um disco de " +
        "vinil de colecionador por 500 reais, e o negócio inteiro acontece por correio " +
        "eletrônico, terminando com uma mensagem em que Alice confirma a compra. Dois " +
        "riscos aparecem de imediato. Bob poderia alterar os 500 reais para um valor maior " +
        "e alegar que Alice prometeu mais, e Alice poderia mudar de ideia e negar que " +
        "mandou a mensagem.</p>" +
        "<p>A <strong>assinatura digital</strong> resolve os dois de uma vez, vinculando " +
        "de forma irreversível um segredo que só o signatário conhece à sequência de bits " +
        "inteira do documento. Como a associação é única, alterar o documento quebra a " +
        "assinatura, e como a assinatura nasce de um segredo pessoal, negá-la fica " +
        "difícil.</p>" +
        "<h3>Assinar é cifrar o resumo com a chave privada</h3>" +
        "<p>O mecanismo aproveita a inversão que a seção 2 apresentou. Alice calcula o " +
        "resumo do documento e cifra esse resumo com a própria chave privada, produzindo " +
        "a assinatura, que viaja junto do documento em texto puro. Bob decifra a " +
        "assinatura com a chave pública de Alice, calcula por conta própria o resumo do " +
        "documento recebido e compara os dois valores. Se batem, a mensagem foi assinada " +
        "por Alice.</p>" +
        "<p>Vale explicitar a inversão, porque ela confunde muita gente na primeira " +
        "leitura. Para obter <strong>sigilo</strong>, cifra-se com a chave pública do " +
        "destinatário, já que só ele deve conseguir ler. Para obter " +
        "<strong>assinatura</strong>, cifra-se com a chave privada do remetente, já que " +
        "todo mundo deve conseguir verificar. A regra por trás das duas é a mesma. A " +
        "assinatura precisa nascer de um segredo que só o signatário tem, e precisa ser " +
        "verificável por qualquer um.</p>" +
        "<p>Falta justificar por que se assina o resumo e não o documento. Cifrar o " +
        "documento inteiro com a chave privada funcionaria, e é caro e desnecessário. O " +
        "resumo tem comprimento fixo e pequeno, e como qualquer alteração no documento " +
        "muda o resumo, assinar o resumo já vincula a assinatura à sequência de bits " +
        "inteira. A mensagem em si segue em texto puro, e todo mundo pode lê-la. Quando " +
        "também se quer sigilo, cifra-se a mensagem à parte, com a chave pública do " +
        "destinatário.</p>" +
        '<div class="callout">' +
        '<p class="callout-title">💡 O ataque da data de nascimento</p>' +
        "<p>Numa sala com 23 pessoas, a chance de duas fazerem aniversário no mesmo dia já " +
        "passa de 50%, enquanto seriam necessárias 253 pessoas para haver a mesma chance " +
        "de encontrar alguém que faça aniversário numa data escolhida de antemão. Achar um " +
        "par qualquer é muito mais fácil que achar um par marcado, e um ataque explora " +
        "exatamente isso. Alice prepara duas versões de um contrato, uma favorável a Bob e " +
        "outra não, e gera milhares de variações visualmente indistinguíveis de cada uma, " +
        "acrescentando espaços no fim das linhas. Ela compara os resumos até achar uma " +
        "versão de cada lado com o mesmo valor. Bob assina a versão favorável, e Alice " +
        "troca o documento pela desfavorável mantendo a assinatura, que continua batendo. " +
        "Com resumos de 64 bits bastam cerca de quatro bilhões de versões, o que é pouco " +
        "para tranquilizar alguém. É por isso que resumo seguro tem 128 bits ou mais.</p>" +
        "</div>" +
        "<p>Os dois resumos clássicos são o MD5, com 128 bits, e o SHA-1, com 160. Depois " +
        "que ataques contra os predecessores do SHA-1 foram publicados, o NIST passou a " +
        "recomendar versões de resumo mais longo, de 224 a 512 bits. O comprimento maior " +
        "custa mais para gerar, guardar e transmitir, e essa é a troca que se aceita.</p>" +
        "<h3>A assinatura barata</h3>" +
        "<p>Existe uma alternativa muito mais rápida quando as duas partes já compartilham " +
        "um segredo, o que acontece sempre que um canal seguro foi estabelecido antes. " +
        "Alice concatena a mensagem com a chave secreta compartilhada, calcula o resumo do " +
        "resultado e envia a mensagem junto desse valor. Bob repete a conta com a chave " +
        "que ele também tem e compara. Esse valor se chama <strong>código de autenticação " +
        "de mensagem</strong>, conhecido pela sigla MAC.</p>" +
        "<p>A vantagem é de desempenho, e é grande. O esquema não envolve criptografia " +
        "nenhuma, e resumo seguro é de três a dez vezes mais rápido que cifra simétrica. " +
        "É por isso que o TLS o usa para autenticar cada bloco transmitido, em vez de " +
        "assinar cada bloco com chave pública.</p>" +
        "<p>A limitação vem da simetria. Verificar a assinatura exige conhecer a chave, e " +
        "quem conhece a chave também consegue forjar. Assinatura de chave secreta " +
        "autentica a comunicação entre dois portadores de um segredo, e não serve para " +
        "provar autoria diante de terceiros. Quando o signatário não sabe de antemão quem " +
        "vai verificar, ou quando a verificação precisa acontecer meses depois, só a chave " +
        "pública resolve.</p>" +
        "<h3>De onde vem a chave</h3>" +
        "<p>Todos os protocolos descritos até aqui supuseram que as chaves já estavam " +
        "disponíveis, e essa suposição esconde o problema mais difícil da criptografia " +
        "aplicada. Estabelecer e distribuir chaves não é trivial, e distribuir chave " +
        "secreta digitalmente sem cifrar está fora de questão.</p>" +
        "<p>Comecemos pela chave de menor prazo. Uma <strong>chave de sessão</strong> é " +
        "uma chave secreta temporária, usada durante uma única conversa e descartada no " +
        "fim. Ela existe por três motivos que valem enunciar separadamente. Chave sofre " +
        "desgaste, e quanto mais dados o intruso interceptar cifrados com a mesma chave, " +
        "mais material ele tem para atacá-la. Chave nova a cada sessão protege contra a " +
        "reprodução de uma sessão inteira. E se uma chave de sessão for comprometida, o " +
        "estrago se limita àquela conversa, enquanto as outras continuam confidenciais.</p>" +
        "<p>Falta como as duas pontas chegam à mesma chave de sessão sem que ela viaje. " +
        "Existe um esquema elegante para isso, e ele funciona mesmo sobre um canal que " +
        "todo mundo escuta.</p>" +
        '<figure class="figura" id="fig-diffie-hellman">' +
        '<svg viewBox="0 0 600 288" role="img" aria-labelledby="fig-dh-titulo">' +
        '<title id="fig-dh-titulo">Alice e Bob combinam publicamente dois números, p e g. ' +
        "Alice escolhe um número secreto x e Bob escolhe um número secreto y. Alice envia " +
        "g elevado a x, módulo p, e Bob envia g elevado a y, módulo p, ambos em claro. " +
        "Cada um eleva o que recebeu ao próprio número secreto e os dois chegam ao mesmo " +
        "valor, g elevado a x vezes y, módulo p, que vira a chave compartilhada. Nem x nem " +
        "y trafegam pela rede.</title>" +
        '<rect class="caixa" x="200" y="10" width="200" height="36" rx="8"/>' +
        '<text x="300" y="34" text-anchor="middle" font-size="13">p e g, combinados em ' +
        "público</text>" +
        '<rect class="caixa" x="14" y="60" width="176" height="36" rx="8"/>' +
        '<text x="102" y="84" text-anchor="middle" font-size="13">Alice escolhe x</text>' +
        '<rect class="caixa" x="410" y="60" width="176" height="36" rx="8"/>' +
        '<text x="498" y="84" text-anchor="middle" font-size="13">Bob escolhe y</text>' +
        '<path class="traco" d="M190 124 L396 124"/>' +
        '<path class="seta" d="M396 118 L396 130 L410 124 Z"/>' +
        '<text class="rotulo-secundario" x="300" y="118" text-anchor="middle" ' +
        'font-size="12">g^x mod p, em claro</text>' +
        '<path class="traco" d="M410 158 L204 158"/>' +
        '<path class="seta" d="M204 152 L204 164 L190 158 Z"/>' +
        '<text class="rotulo-secundario" x="300" y="176" text-anchor="middle" ' +
        'font-size="12">g^y mod p, em claro</text>' +
        '<rect class="caixa" x="14" y="196" width="176" height="36" rx="8"/>' +
        '<text x="102" y="220" text-anchor="middle" font-size="13">eleva a x</text>' +
        '<rect class="caixa" x="410" y="196" width="176" height="36" rx="8"/>' +
        '<text x="498" y="220" text-anchor="middle" font-size="13">eleva a y</text>' +
        '<rect class="caixa-destaque" x="200" y="196" width="200" height="36" rx="8"/>' +
        '<text x="300" y="220" text-anchor="middle" font-size="13">os dois chegam a g^xy ' +
        "mod p</text>" +
        '<text class="rotulo-secundario" x="300" y="262" text-anchor="middle" ' +
        'font-size="12">x e y nunca saem da máquina de quem os escolheu</text>' +
        "</svg>" +
        "<figcaption>A troca de chaves de Diffie e Hellman constrói um segredo " +
        "compartilhado sobre um canal inseguro. Tudo o que trafega pode ser lido por " +
        "qualquer um, porque recuperar x a partir do valor enviado é inviável. Quando as " +
        "duas partes trocam de x e de y a cada conversa, o esquema recebe o nome de " +
        "efêmero, e comprometer uma chave antiga não abre as sessões seguintes.</figcaption>" +
        "</figure>" +
        "<p>Resolvida a chave de sessão, resta a distribuição das chaves de longa duração, " +
        "e ela pede canais de qualidades diferentes conforme o tipo de chave. Chave " +
        "secreta precisa de um <strong>canal seguro</strong>, que autentica as duas partes " +
        "e mantém sigilo. Chave pública pode viajar em claro e precisa de um canal " +
        "<strong>autenticado</strong>, porque o problema não é alguém ler a chave pública, " +
        "e sim saber com certeza de quem ela é. Quando nem isso existe, resta o caminho de " +
        "fora da rede, com as duas partes se falando por outro meio.</p>" +
        "<h3>O certificado, que é a confiança virando documento</h3>" +
        "<p>O canal autenticado para chave pública tem uma implementação padrão. Um " +
        "<strong>certificado</strong> é uma declaração curta assinada por um principal, e " +
        "no caso mais comum ela vincula um nome a uma chave pública. Quem confia em quem " +
        "assinou passa a confiar no vínculo.</p>" +
        "<p>O exemplo clássico mostra que a confiança se encadeia. Carol é vendedora e " +
        "aceita o certificado que diz que Alice tem a conta 6262626, porque ele foi " +
        "assinado pelo Banco Bob. Para validar essa assinatura, porém, Carol precisa da " +
        "chave pública de Bob, que vem em outro certificado dizendo qual é a chave pública " +
        "do Banco Bob, assinado por Fred, a Federação dos Bancos. A recursão pararia num " +
        "terceiro certificado, e assim por diante.</p>" +
        "<p>Ela para quando a verificação chega a uma <strong>autoridade " +
        "certificadora</strong> em que Carol já confia por outros meios. Na prática do dia " +
        "a dia, os navegadores já vêm de fábrica com as chaves públicas de várias " +
        "autoridades reconhecidas, e é isso que fecha a cadeia. Quanto mais longo o " +
        "encadeamento, maior o risco de um elo fraco, e escolher a autoridade raiz é " +
        "sempre o ponto sensível.</p>" +
        "<p>O formato padrão é o X.509, e ele tem quatro partes que dizem tudo. O sujeito " +
        "traz o nome e a chave pública que estão sendo vinculados, o emitente traz o nome " +
        "de quem assinou e a assinatura, o período de validade traz duas datas e as " +
        "informações administrativas trazem versão e número de série.</p>" +
        "<p>O período de validade é a peça mais interessante, e a razão dele é a " +
        "dificuldade de revogar. Se uma chave privada for comprometida, o certificado " +
        "correspondente precisa deixar de valer, e avisar todo mundo que já guardou uma " +
        "cópia dele é caro ou impossível. Existem duas saídas. Uma é publicar " +
        "periodicamente uma <strong>lista de certificados revogados</strong>, o que obriga " +
        "o cliente a consultá-la sempre e faz a revogação demorar até a próxima " +
        "publicação. A outra é dar prazo curto a todo certificado e exigir renovação, que " +
        "é o caminho dominante hoje, com sistemas de emissão automática renovando " +
        "certificados de servidor Web sem intervenção humana.</p>" +
        "<p>Autoridade certificadora não é a única saída, e ela tem custo administrativo e " +
        "história de falhas, com casos em que a posse de uma chave pública não foi " +
        "verificada direito e casos de ataque bem-sucedido contra a própria autoridade. A " +
        "alternativa descentralizada é a <strong>teia de confiança</strong>, nascida nos " +
        "anos 90 com o programa de correio cifrado conhecido pela sigla PGP. Pessoas se " +
        "encontram, trocam chaves públicas pessoalmente e " +
        "assinam a chave umas das outras, e quem confia na assinatura de Alice passa a " +
        "aceitar a chave que Alice endossou. Dá para exigir mais de um endosso antes de " +
        "aceitar, o que aumenta a confiança. O que se sabe depois de décadas é que o " +
        "arranjo não escala bem, porque o núcleo de gente mutuamente endossada é pequeno e " +
        "a maioria dos participantes se liga a ele por caminhos longos, o que torna a " +
        "confiança frágil.</p>" +
        "<h3>Autorizado a quê</h3>" +
        "<p>Autenticado o principal, falta decidir o que ele pode fazer, e isso é " +
        "autorização. O modelo é sempre o mesmo. Um <strong>sujeito</strong>, que " +
        "normalmente é um processo agindo em nome de um usuário, pede uma operação sobre " +
        "um <strong>objeto</strong>, que encapsula o próprio estado e oferece operações " +
        "por uma interface. Entre os dois fica o <strong>monitor de referência</strong>, " +
        "que registra quem pode o quê e decide cada pedido. O monitor é chamado a cada " +
        "invocação, e por isso ele mesmo precisa ser à prova de adulteração.</p>" +
        "<p>Antes de escolher o mecanismo, há uma decisão sobre onde apontar o controle, e " +
        "existem três respostas possíveis. Proteger os <strong>dados</strong> significa " +
        "garantir a integridade deles diretamente, como fazem as restrições de integridade " +
        "que um banco de dados confere a cada alteração. Proteger as " +
        "<strong>operações</strong> significa dizer exatamente quais podem ser executadas " +
        "e por quem, que é o terreno do controle de acesso propriamente dito. Proteger " +
        "<strong>quem chama</strong> significa restringir o acesso à aplicação a certas " +
        "pessoas, independentemente do que elas queiram fazer lá dentro. As três se " +
        "combinam na prática.</p>" +
        "<p>Escolhido o foco, resta a política. Quatro tipos aparecem repetidamente em " +
        "sistemas distribuídos, e eles diferem em quem decide o acesso.</p>" +
        '<div class="tabela-rolagem">' +
        '<table class="tabela-conteudo" id="tab-politicas-acesso">' +
        "<tr><th>Política</th><th>Quem decide</th><th>Exemplo</th></tr>" +
        "<tr><td>Obrigatória</td><td>Uma administração central, fora do alcance do " +
        "indivíduo.</td><td>Rótulos militares de sigilo, do acesso público ao " +
        "ultrassecreto.</td></tr>" +
        "<tr><td>Discricionária</td><td>O dono do objeto, que muda os direitos e quem os " +
        "tem.</td><td>Os bits de permissão do UNIX, com dono, grupo e o resto do " +
        "mundo.</td></tr>" +
        "<tr><td>Por papéis</td><td>A organização, que autoriza pelo papel e não pela " +
        "identidade.</td><td>Numa universidade, os papéis de docente, aluno e coordenador " +
        "de curso.</td></tr>" +
        "<tr><td>Por atributos</td><td>Uma regra que combina atributos do sujeito e do " +
        "objeto.</td><td>Só o docente desta disciplina lê a nota de quem está matriculado " +
        "nela.</td></tr>" +
        "</table>" +
        "</div>" +
        "<p>A tabela vai do mais grosso ao mais fino, e o custo acompanha. O controle " +
        "obrigatório é conceitualmente simples e difícil de administrar. O controle por " +
        "atributos é o mais expressivo e exige escrever regras que descrevam com precisão " +
        "quem pode o quê, o que continua sendo um problema em aberto.</p>" +
        "<h3>A matriz, e as duas maneiras de fatiá-la</h3>" +
        "<p>Qualquer que seja a política, os direitos podem ser modelados por uma " +
        "<strong>matriz de controle de acesso</strong>, com um sujeito por linha e um " +
        "objeto por coluna. Cada célula lista as operações que aquele sujeito pode pedir " +
        "sobre aquele objeto, e o monitor de referência consulta a célula antes de " +
        "autorizar.</p>" +
        "<p>Implementar a matriz literalmente é inviável, porque um sistema tem milhares " +
        "de usuários e milhões de objetos, e quase toda célula fica vazia, já que um " +
        "sujeito costuma ter acesso a poucos objetos. As implementações reais guardam a " +
        "matriz fatiada, e há duas maneiras de fatiar.</p>" +
        '<figure class="figura" id="fig-matriz-acesso">' +
        '<svg viewBox="0 0 600 250" role="img" aria-labelledby="fig-matriz-titulo">' +
        '<title id="fig-matriz-titulo">Uma matriz com três sujeitos nas linhas, Alice, Bob ' +
        "e Carol, e três objetos nas colunas, arquivo, impressora e agenda. Cada célula " +
        "traz as operações permitidas. Um recorte vertical destaca a coluna da " +
        "impressora, que corresponde à lista de controle de acesso guardada com o objeto. " +
        "Um recorte horizontal destaca a linha de Bob, que corresponde à lista de " +
        "capacidades guardada com o sujeito.</title>" +
        '<text class="rotulo-secundario" x="150" y="26" text-anchor="middle" ' +
        'font-size="12">arquivo</text>' +
        '<text class="rotulo-secundario" x="250" y="26" text-anchor="middle" ' +
        'font-size="12">impressora</text>' +
        '<text class="rotulo-secundario" x="350" y="26" text-anchor="middle" ' +
        'font-size="12">agenda</text>' +
        '<rect class="caixa" x="10" y="36" width="88" height="42" rx="6"/>' +
        '<text x="54" y="62" text-anchor="middle" font-size="12">Alice</text>' +
        '<rect class="caixa" x="102" y="36" width="96" height="42" rx="6"/>' +
        '<text x="150" y="62" text-anchor="middle" font-size="12">ler, gravar</text>' +
        '<rect class="caixa" x="202" y="36" width="96" height="42" rx="6"/>' +
        '<text x="250" y="62" text-anchor="middle" font-size="12">imprimir</text>' +
        '<rect class="caixa" x="302" y="36" width="96" height="42" rx="6"/>' +
        '<text x="350" y="62" text-anchor="middle" font-size="12">ler</text>' +
        '<rect class="caixa" x="10" y="84" width="88" height="42" rx="6"/>' +
        '<text x="54" y="110" text-anchor="middle" font-size="12">Bob</text>' +
        '<rect class="caixa" x="102" y="84" width="96" height="42" rx="6"/>' +
        '<text x="150" y="110" text-anchor="middle" font-size="12">ler</text>' +
        '<rect class="caixa-destaque" x="202" y="84" width="96" height="42" rx="6"/>' +
        '<text x="250" y="110" text-anchor="middle" font-size="12">imprimir</text>' +
        '<rect class="caixa" x="302" y="84" width="96" height="42" rx="6"/>' +
        '<text x="350" y="110" text-anchor="middle" font-size="12">ler, gravar</text>' +
        '<rect class="caixa" x="10" y="132" width="88" height="42" rx="6"/>' +
        '<text x="54" y="158" text-anchor="middle" font-size="12">Carol</text>' +
        '<rect class="caixa" x="102" y="132" width="96" height="42" rx="6"/>' +
        '<text x="150" y="158" text-anchor="middle" font-size="12">nenhuma</text>' +
        '<rect class="caixa" x="202" y="132" width="96" height="42" rx="6"/>' +
        '<text x="250" y="158" text-anchor="middle" font-size="12">imprimir</text>' +
        '<rect class="caixa" x="302" y="132" width="96" height="42" rx="6"/>' +
        '<text x="350" y="158" text-anchor="middle" font-size="12">nenhuma</text>' +
        '<rect class="traco" x="197" y="31" width="106" height="148" rx="8" ' +
        'stroke-dasharray="6 4"/>' +
        '<rect class="traco" x="5" y="79" width="398" height="52" rx="8" ' +
        'stroke-dasharray="6 4"/>' +
        '<text class="rotulo-secundario" x="250" y="200" text-anchor="middle" ' +
        'font-size="12">a coluna vira a lista de controle de acesso,</text>' +
        '<text class="rotulo-secundario" x="250" y="216" text-anchor="middle" ' +
        'font-size="12">guardada com o objeto</text>' +
        '<text class="rotulo-secundario" x="414" y="98" font-size="12">a linha vira a</text>' +
        '<text class="rotulo-secundario" x="414" y="114" font-size="12">lista de ' +
        "capacidades,</text>" +
        '<text class="rotulo-secundario" x="414" y="130" font-size="12">guardada com o ' +
        "sujeito</text>" +
        "</svg>" +
        "<figcaption>A mesma informação, guardada de dois jeitos. Fatiar por coluna deixa " +
        "cada objeto com a lista de quem pode o quê sobre ele. Fatiar por linha deixa cada " +
        "sujeito com os bilhetes que pode apresentar. As células vazias somem nos dois " +
        "casos, e é isso que torna qualquer um dos dois viável.</figcaption>" +
        "</figure>" +
        "<p>A comparação entre as duas fatias é uma decisão de projeto com consequências " +
        "que aparecem no dia a dia da operação.</p>" +
        '<div class="tabela-rolagem">' +
        '<table class="tabela-conteudo" id="tab-acl-capacidade">' +
        "<tr><th>Dimensão</th><th>Lista de controle de acesso</th><th>Capacidade</th></tr>" +
        "<tr><td>Onde a informação mora</td><td>Com o objeto, uma lista por recurso.</td>" +
        "<td>Com o sujeito, que a carrega consigo.</td></tr>" +
        "<tr><td>O que o pedido carrega</td><td>A identidade do principal, que o servidor " +
        "autentica.</td><td>Um bilhete impossível de falsificar, com os direitos " +
        "dentro.</td></tr>" +
        "<tr><td>Custo por pedido</td><td>Autenticar o principal e consultar a lista.</td>" +
        "<td>Validar o bilhete, sem consultar lista nenhuma.</td></tr>" +
        "<tr><td>Revogação</td><td>Vale na hora, bastando editar a lista.</td>" +
        "<td>É difícil, porque o bilhete já saiu das mãos de quem o emitiu.</td></tr>" +
        "<tr><td>Delegação</td><td>Exige mexer na lista do objeto.</td><td>É natural, " +
        "porque basta passar o bilhete adiante.</td></tr>" +
        "<tr><td>Risco próprio</td><td>Depende de autenticar bem a cada pedido.</td>" +
        "<td>Quem roubar o bilhete o usa, como quem rouba a chave de uma porta.</td></tr>" +
        "</table>" +
        "</div>" +
        "<p>A analogia com a chave física ajuda a fixar a capacidade e explica os dois " +
        "defeitos dela de uma vez. A chave de uma porta prova imediatamente que se pode " +
        "entrar, sem que ninguém precise consultar uma lista de moradores. Em compensação, " +
        "quem a pega usa, e tirá-la de circulação depois que o portador deixou de ser " +
        "autorizado exige trocar a fechadura e redistribuir chaves a todo mundo.</p>" +
        "<p>Na prática os dois esquemas convivem. É comum autenticar e consultar a lista " +
        "uma vez, emitir uma capacidade de curta duração e usá-la nos acessos seguintes ao " +
        "mesmo recurso, o que junta a revogação da lista com o baixo custo do bilhete.</p>" +
        "<h3>Delegação</h3>" +
        "<p>Falta um caso que o modelo de sujeito e objeto não cobre sozinho, e ele é " +
        "corriqueiro. Alice manda imprimir um arquivo protegido contra leitura, e o " +
        "servidor de impressão precisa lê-lo para imprimir. Copiar o arquivo para o " +
        "servidor seria desperdício, e o servidor não tem direito de leitura sobre ele. " +
        "Alice precisa transferir temporariamente um direito seu.</p>" +
        "<p>O exemplo moderno é o mesmo problema com outra roupa. Alice usa o cliente de " +
        "correio eletrônico preferido dela, instalado no computador dela, para acessar uma " +
        "caixa postal que o provedor guarda e que normalmente só se abre pelo navegador. O " +
        "cliente precisa agir em nome de Alice, e a pior saída possível é entregar a senha " +
        "dela ao aplicativo, porque não existe motivo para confiar num aplicativo nem na " +
        "máquina em que ele roda.</p>" +
        "<p>A saída boa é o <strong>proxy de delegação</strong>, que é um bilhete " +
        "permitindo ao portador operar com os mesmos direitos de quem o emitiu, ou com " +
        "menos. Ele tem duas partes. A primeira é a lista de direitos delegados, junto da " +
        "parte pública de um segredo, tudo assinado por Alice, o que impede alteração. A " +
        "segunda é a parte privada desse segredo, entregue apenas a quem recebe a " +
        "delegação.</p>" +
        "<p>A mecânica funciona como uma pergunta difícil. Alice inventa uma pergunta cuja " +
        "resposta só ela sabe, anexa a pergunta à lista de direitos e assina o conjunto. " +
        "Ela entrega a lista assinada a Bob e, em separado, a resposta. Quando Bob quiser " +
        "exercer um direito, apresenta a lista ao servidor, que confere a assinatura e " +
        "então faz a pergunta. Quem sabe responder provou que recebeu o bilhete de quem " +
        "tinha o direito de dá-lo. Alice não precisa conhecer todo mundo a quem os " +
        "direitos vão chegar, e Bob pode repassá-los adiante.</p>" +
        "<p>Esse desenho tem um nome comercial que o aluno vai encontrar em qualquer " +
        "serviço de nuvem, o OAuth. Ele distingue quatro papéis, que são o dono do " +
        "recurso, o aplicativo cliente que quer agir em nome dele, o servidor de recursos " +
        "onde os dados moram e o servidor de autorização que emite os bilhetes. Vale a " +
        "regra geral da delegação. Os direitos transferidos são um subconjunto dos " +
        "direitos de quem delega, e limitar o prazo reduz o estrago caso o aplicativo " +
        "delegado seja comprometido depois.</p>",
      slides: [
        {
          title: "O que uma assinatura promete",
          html:
            "<ul>" +
            "<li><strong>Autêntica</strong>, <strong>impossível de falsificar</strong>, " +
            "<strong>impossível de repudiar</strong></li>" +
            "<li>Documento digital se copia e se altera sem esforço</li>" +
            "<li>Anexar nome, foto ou imagem não prova nada</li>" +
            "<li>A saída é vincular um segredo do signatário aos bits do documento</li>" +
            "</ul>"
        },
        {
          title: "Assinar é cifrar o resumo",
          html:
            "<ul>" +
            "<li>Para <strong>sigilo</strong>, cifra-se com a pública do destinatário</li>" +
            "<li>Para <strong>assinar</strong>, com a privada do remetente</li>" +
            "<li>O segredo é de um só, e a verificação é de todos</li>" +
            "<li>Assina-se o resumo, porque ele é curto e já prende o documento inteiro</li>" +
            "</ul>"
        },
        {
          title: "O ataque da data de nascimento",
          html:
            "<ul>" +
            "<li>Achar um par qualquer é muito mais fácil que achar um par marcado</li>" +
            "<li>Duas versões do contrato, milhares de variações invisíveis</li>" +
            "<li>Resumo de 64 bits cai com cerca de quatro bilhões de versões</li>" +
            "<li>Por isso resumo seguro tem 128 bits ou mais</li>" +
            "</ul>"
        },
        {
          title: "A assinatura barata",
          html:
            "<ul>" +
            "<li>O código de autenticação de mensagem sai do resumo da mensagem com a chave</li>" +
            "<li>Não envolve cifra, e resumo é de 3 a 10 vezes mais rápido</li>" +
            "<li>O TLS o usa em cada bloco transmitido</li>" +
            "<li>Quem verifica precisa da chave, e quem tem a chave forja</li>" +
            "</ul>"
        },
        {
          title: "A chave de sessão",
          html:
            "<ul>" +
            "<li>Chave temporária, descartada no fim da conversa</li>" +
            "<li>Chave muito usada dá material ao invasor</li>" +
            "<li>Chave nova por sessão impede reproduzir a sessão inteira</li>" +
            "<li>Comprometer uma chave de sessão custa uma conversa, não todas</li>" +
            "</ul>"
        },
        {
          title: "Diffie-Hellman",
          ref: "fig-diffie-hellman"
        },
        {
          title: "Certificados",
          html:
            "<ul>" +
            "<li>Declaração assinada que liga um nome a uma chave pública</li>" +
            "<li>A cadeia sobe até uma autoridade em que já se confia</li>" +
            "<li>O navegador já vem com as chaves das autoridades reconhecidas</li>" +
            "<li>Revogar é caro, então o prazo curto virou o padrão</li>" +
            "<li>A teia de confiança dispensa a autoridade e não escala bem</li>" +
            "</ul>"
        },
        {
          title: "As quatro políticas de acesso",
          ref: "tab-politicas-acesso"
        },
        {
          title: "A matriz e as duas fatias",
          ref: "fig-matriz-acesso"
        },
        {
          title: "Lista contra capacidade",
          ref: "tab-acl-capacidade"
        },
        {
          title: "Delegação",
          html:
            "<ul>" +
            "<li>O servidor de impressão precisa ler o arquivo que vai imprimir</li>" +
            "<li>Entregar a senha ao aplicativo é a pior saída</li>" +
            "<li>O proxy traz a lista de direitos assinada e uma pergunta difícil</li>" +
            "<li>Quem sabe a resposta provou que recebeu o bilhete de quem podia dá-lo</li>" +
            "<li>É o desenho do OAuth, com quatro papéis</li>" +
            "</ul>"
        }
      ]
    },

    {
      title: "Autenticação e confiança na prática",
      html:
        "<p>A seção 3 decidiu o que cada principal pode fazer, supondo resolvida a " +
        "pergunta anterior. Agora ela é o assunto. <strong>Autenticar</strong> é " +
        "verificar a identidade alegada por um usuário, um cliente, um servidor ou um " +
        "aparelho, e <strong>autorizar</strong> é decidir o que aquela identidade pode. " +
        "As duas costumam ser confundidas, e a ordem entre elas nunca muda, porque " +
        "autorizar sem autenticar é decidir sobre alguém que não se sabe quem é.</p>" +
        "<h3>Quatro maneiras de provar quem se é</h3>" +
        "<p>Toda autenticação se apoia em algo que distingue o cliente legítimo dos " +
        "demais, e existem quatro categorias.</p>" +
        '<div class="tabela-rolagem">' +
        '<table class="tabela-conteudo" id="tab-meios-autenticacao">' +
        "<tr><th>Categoria</th><th>Exemplo</th><th>Fraqueza própria</th></tr>" +
        "<tr><td>O que o cliente sabe</td><td>Uma senha ou um número de identificação " +
        "pessoal.</td><td>Pessoas escolhem mal e nem percebem o quanto.</td></tr>" +
        "<tr><td>O que o cliente tem</td><td>Um cartão, um telefone celular ou um par de " +
        "chaves em arquivo.</td><td>Objeto se perde, se empresta e se rouba.</td></tr>" +
        "<tr><td>O que o cliente é</td><td>Impressão digital ou características do " +
        "rosto.</td><td>Não se troca depois de vazar.</td></tr>" +
        "<tr><td>O que o cliente faz</td><td>Padrão de voz ou de digitação.</td>" +
        "<td>Varia com a pessoa e ainda é pouco usada sozinha.</td></tr>" +
        "</table>" +
        "</div>" +
        "<p>Usar uma categoria só é autenticação de fator único, e a mais comum delas " +
        "continua sendo a senha. Como as pessoas administram senhas muito mal, os sistemas " +
        "vêm combinando categorias, o que se chama de autenticação de múltiplos fatores. " +
        "O arranjo típico junta a senha com o telefone celular que o usuário registrou " +
        "antes, e às vezes acrescenta a impressão digital lida naquele telefone.</p>" +
        "<p>Uma limitação estrutural fica escondida em tudo isso, e vale enunciá-la. A " +
        "autenticação acontece uma vez, no início da sessão, e a partir daí o serviço " +
        "supõe que continua falando com quem autenticou. Nem sempre continua. Alice faz o " +
        "login e deixa Bob usar o computador, o que é inofensivo quando Alice quis, e é " +
        "outra história quando Bob a obrigou. A resposta a isso é a <strong>autenticação " +
        "contínua</strong>, que verifica o cliente ao longo da sessão inteira, por " +
        "exemplo conferindo se o aparelho pessoal dele continua por perto ou se o lugar de " +
        "onde ele acessa é um lugar conhecido.</p>" +
        "<h3>Autenticação e integridade não vivem separadas</h3>" +
        "<p>Antes dos protocolos, um esclarecimento que evita erro de projeto. Suponha um " +
        "sistema que autentica as duas partes e não garante integridade das mensagens. Bob " +
        "sabe com certeza que Alice enviou a mensagem, e não sabe se o que chegou é o que " +
        "ela mandou, o que torna a certeza inútil. Agora suponha o contrário, um sistema " +
        "que garante integridade e não autentica ninguém. Bob recebe a garantia de que a " +
        "mensagem anunciando que ele ganhou um milhão não foi alterada, e não tem como " +
        "saber se ela veio de quem diz. As duas propriedades só valem juntas.</p>" +
        "<h3>Desafio e resposta</h3>" +
        "<p>O protocolo mais básico supõe que Alice e Bob já compartilham uma chave " +
        "secreta e prova, para cada um deles, que o outro a conhece. Ele tem cinco " +
        "mensagens e a estrutura é simétrica.</p>" +
        "<ol>" +
        "<li>Alice envia a identidade dela a Bob, dizendo que quer abrir um canal.</li>" +
        "<li>Bob responde com um desafio, que é um número escolhido ao acaso.</li>" +
        "<li>Alice devolve esse número cifrado com a chave compartilhada, e Bob decifra a " +
        "resposta e confere se encontra o número que enviou.</li>" +
        "<li>Alice envia o próprio desafio dela a Bob.</li>" +
        "<li>Bob devolve o número cifrado com a mesma chave, e Alice confere.</li>" +
        "</ol>" +
        "<p>A lógica é sempre a mesma. Só quem tem a chave consegue produzir a resposta " +
        "certa a um número que nunca foi visto antes, então responder corretamente prova a " +
        "posse da chave sem revelá-la. É o mesmo raciocínio do desafio que aparece no " +
        "Kerberos mais adiante.</p>" +
        "<h3>A otimização que quebra o protocolo</h3>" +
        "<p>Cinco mensagens para uma tarefa tão simples parecem desperdício, e a economia " +
        "óbvia é juntar mensagens. Se Alice vai desafiar Bob de qualquer jeito, ela pode " +
        "mandar o desafio dela junto da identidade, e Bob pode responder e desafiar numa " +
        "mensagem só. O protocolo cai de cinco para três mensagens e para de funcionar.</p>" +
        '<figure class="figura" id="fig-reflexao">' +
        '<svg viewBox="0 0 600 324" role="img" aria-labelledby="fig-reflexao-titulo">' +
        '<title id="fig-reflexao-titulo">Diagrama de sequência entre Mallory, que se diz ' +
        "Alice, e Bob. Mallory abre um primeiro canal com um desafio próprio. Bob responde " +
        "e manda o desafio dele. Mallory abre um segundo canal usando o desafio de Bob " +
        "como se fosse dele, e Bob cifra o próprio desafio para respondê-lo. Mallory então " +
        "volta ao primeiro canal e entrega essa resposta, fechando a autenticação sem " +
        "nunca ter tido a chave.</title>" +
        '<rect class="caixa-destaque" x="14" y="10" width="230" height="40" rx="8"/>' +
        '<text x="129" y="35" text-anchor="middle" font-size="13">Mallory, dizendo-se ' +
        "Alice</text>" +
        '<rect class="caixa" x="356" y="10" width="230" height="40" rx="8"/>' +
        '<text x="471" y="35" text-anchor="middle" font-size="13">Bob</text>' +
        '<path class="traco" d="M129 50 L129 300"/>' +
        '<path class="traco" d="M471 50 L471 300"/>' +
        '<text class="rotulo-secundario" x="300" y="76" text-anchor="middle" ' +
        'font-size="11">canal 1, a identidade de Alice e um desafio de Mallory</text>' +
        '<path class="traco" d="M132 86 L456 86"/>' +
        '<path class="seta" d="M456 80 L456 92 L468 86 Z"/>' +
        '<text class="rotulo-secundario" x="300" y="118" text-anchor="middle" ' +
        'font-size="11">a resposta ao desafio dele, e o desafio de Bob</text>' +
        '<path class="traco" d="M468 128 L144 128"/>' +
        '<path class="seta" d="M144 122 L144 134 L132 128 Z"/>' +
        '<text class="rotulo-secundario" x="300" y="170" text-anchor="middle" ' +
        'font-size="11">canal 2, a identidade de Alice e o desafio de Bob de volta</text>' +
        '<path class="traco" d="M132 180 L456 180"/>' +
        '<path class="seta" d="M456 174 L456 186 L468 180 Z"/>' +
        '<text class="rotulo-secundario" x="300" y="212" text-anchor="middle" ' +
        'font-size="11">Bob cifra o próprio desafio e responde</text>' +
        '<path class="traco" d="M468 222 L144 222"/>' +
        '<path class="seta" d="M144 216 L144 228 L132 222 Z"/>' +
        '<text class="rotulo-secundario" x="300" y="264" text-anchor="middle" ' +
        'font-size="11">canal 1 de novo, com a resposta que Bob acabou de dar</text>' +
        '<path class="traco" d="M132 274 L456 274"/>' +
        '<path class="seta" d="M456 268 L456 280 L468 274 Z"/>' +
        '<text class="rotulo-secundario" x="300" y="314" text-anchor="middle" ' +
        'font-size="12">Bob cifrou o próprio desafio para o invasor, e não percebeu</text>' +
        "</svg>" +
        "<figcaption>O ataque de reflexão derruba a versão de três mensagens. Mallory não " +
        "tem a chave e não precisa dela, porque abre um segundo canal só para fazer Bob " +
        "cifrar o desafio que o próprio Bob criou. O erro não está na criptografia, e sim " +
        "no desenho do protocolo.</figcaption>" +
        "</figure>" +
        "<p>Duas lições saem daí, e as duas valem para qualquer protocolo. A primeira é " +
        "que os dois lados estavam fazendo a mesma coisa do mesmo jeito, e um desafio de " +
        "Bob virou indistinguível de um desafio do outro lado. Um desenho melhor faz cada " +
        "papel usar desafios de tipos diferentes, com o iniciador usando números ímpares e " +
        "o respondente usando pares, por exemplo.</p>" +
        "<p>A segunda é mais geral. Na versão de três mensagens, Bob entregou informação " +
        "valiosa, que é a resposta cifrada, antes de saber a quem estava entregando. Na " +
        "versão de cinco, Alice provava a identidade dela primeiro, e só então Bob cifrava " +
        "alguma coisa para ela. A regra prática que fica é que ajustar um protocolo de " +
        "segurança para deixá-lo mais rápido mexe na correção dele, e a mudança precisa " +
        "ser analisada de novo por inteiro.</p>" +
        "<h3>O problema de escala e o centro de distribuição de chaves</h3>" +
        "<p>Um sistema com N máquinas em que cada par compartilha uma chave secreta " +
        "precisa administrar quase N ao quadrado dividido por dois chaves, e cada máquina " +
        "guarda N menos uma. Para N grande isso não se sustenta. A alternativa é " +
        "centralizar num <strong>centro de distribuição de chaves</strong>, que " +
        "compartilha uma chave com cada máquina e nenhuma chave entre pares, o que reduz o " +
        "total a N.</p>" +
        "<p>Quando Alice quer falar com Bob, ela pede ao centro, que gera uma chave de " +
        "sessão para os dois. A maneira ingênua de entregá-la é o centro mandar a chave " +
        "para os dois lados, cifrada com a chave de cada um, e ela tem um defeito prático. " +
        "Alice pode começar a falar antes de a mensagem chegar a Bob. A saída é o centro " +
        "devolver tudo a Alice, incluindo um <strong>tíquete</strong>, que é a chave de " +
        "sessão cifrada com a chave de Bob. Alice não consegue ler o tíquete, e o trabalho " +
        "dela é entregá-lo a Bob, o único que sabe abri-lo.</p>" +
        "<h3>O protocolo de Needham e Schroeder</h3>" +
        "<p>Esse desenho tem origem datada, e ela é a mesma para quase tudo o que veio " +
        "depois. Em 1978, quando os servidores de arquivos estavam surgindo e a gerência " +
        "de chaves numa rede local virou urgência, Needham e Schroeder publicaram o " +
        "protocolo que ainda serve de base. A tabela mostra as cinco mensagens, com S " +
        "sendo o servidor de autenticação.</p>" +
        '<div class="tabela-rolagem">' +
        '<table class="tabela-conteudo" id="tab-needham-schroeder">' +
        "<tr><th>Passo</th><th>Quem fala</th><th>O que a mensagem carrega</th></tr>" +
        "<tr><td>1</td><td>A pede a S</td><td>A identidade de A, a de B e um número usado " +
        "uma vez.</td></tr>" +
        "<tr><td>2</td><td>S responde a A</td><td>Cifrado com a chave de A, vão o número " +
        "de volta, a chave de sessão recém-gerada e o tíquete cifrado com a chave de " +
        "B.</td></tr>" +
        "<tr><td>3</td><td>A envia a B</td><td>O tíquete, que B decifra para descobrir com " +
        "quem fala e com que chave.</td></tr>" +
        "<tr><td>4</td><td>B desafia A</td><td>Um número novo, cifrado com a chave de " +
        "sessão.</td></tr>" +
        "<tr><td>5</td><td>A responde a B</td><td>Uma transformação combinada daquele " +
        "número, provando que A o decifrou.</td></tr>" +
        "</table>" +
        "</div>" +
        "<p>O número usado uma vez tem nome próprio, <strong>nonce</strong>, e o papel " +
        "dele é amarrar duas mensagens uma à outra. Ao devolver no passo 2 o número que " +
        "recebeu no passo 1, o servidor prova que aquela resposta é para aquela pergunta, " +
        "e não a reprodução de uma resposta antiga. Sem o nonce, quem tivesse guardado uma " +
        "resposta velha e comprometido a chave antiga de Bob poderia reapresentá-la e " +
        "enganar Alice.</p>" +
        "<p>O protocolo tem uma deficiência conhecida, e ela vale como exemplo de como " +
        "brechas sobrevivem em desenhos cuidadosos. Bob não tem motivo para acreditar que " +
        "a mensagem 3 é nova. Quem conseguir comprometer uma chave de sessão antiga e " +
        "tiver guardado o tíquete correspondente pode reapresentá-lo e se passar por " +
        "Alice. É a reprodução da seção 1 aparecendo onde ninguém a esperava, dentro de um " +
        "protocolo de autenticação. O conserto é incluir um carimbo de tempo no tíquete, " +
        "para que Bob confira se ele é recente.</p>" +
        "<h3>Kerberos</h3>" +
        "<p>O conserto tem nome, e ele virou o serviço de autenticação mais usado do " +
        "mundo. O Kerberos nasceu no MIT nos anos 80 para atender à rede do campus, com " +
        "milhares de usuários, estações de trabalho em que qualquer um instalava o que " +
        "quisesse e máquinas servidoras sem garantia de segurança física. A versão 5, " +
        "descrita na RFC 4120, é a autenticação padrão de sistemas como o Windows.</p>" +
        "<p>Ele trabalha com três objetos. O <strong>tíquete</strong> é o passe emitido " +
        "para um servidor específico, com prazo de validade e a chave de sessão dentro. O " +
        "<strong>autenticador</strong> é a prova de identidade que vale uma vez só, " +
        "formada pelo nome do cliente e um carimbo de tempo, cifrados na chave de sessão. " +
        "A <strong>chave de sessão</strong> é a chave secreta gerada para aquela conversa " +
        "com aquele servidor.</p>" +
        "<p>O servidor Kerberos é um centro de distribuição de chaves com dois guichês. O " +
        "<strong>serviço de autenticação</strong> é procurado uma vez por sessão de login. " +
        "O <strong>serviço de concessão de tíquetes</strong> é procurado uma vez para cada " +
        "servidor novo que o cliente queira usar, e o preço de entrada nele é justamente o " +
        "tíquete que o primeiro guichê emitiu.</p>" +
        "<p>O momento mais elegante é o login. O serviço de autenticação responde com uma " +
        "mensagem cifrada com a chave derivada da senha do usuário, contendo a chave de " +
        "sessão e o tíquete para o segundo guichê. O programa de login pede a senha, " +
        "deriva a chave e tenta decifrar. Quem digitou a senha certa obtém dados " +
        "coerentes, e quem errou obtém lixo. Repare no que não aconteceu. A senha não " +
        "viajou pela rede em momento nenhum, e ela é apagada da memória logo depois de " +
        "ser usada, porque a partir dali quem autentica o usuário é o tíquete.</p>" +
        "<p>Os tíquetes valem algumas horas, com valores da ordem de doze na prática, o " +
        "que corresponde a uma jornada. O prazo faz dois trabalhos ao mesmo tempo. Ele " +
        "limita o estrago de um tíquete que caia em mãos erradas, e permite revogar " +
        "direitos de quem deixou de ser usuário autorizado, bastando não renovar.</p>" +
        "<p>Há um preço arquitetural que vale conhecer. Como os nonces do Kerberos são " +
        "carimbos de tempo, a proteção contra reprodução depende de os relógios de " +
        "clientes e servidores estarem aproximadamente sincronizados, e a própria " +
        "sincronização precisa ser segura contra ataques. Quem fez a prática do tópico 01 " +
        "já viu de perto o quanto relógios de máquinas diferentes divergem e o trabalho " +
        "que dá mantê-los próximos. Aqui essa divergência deixa de ser curiosidade e vira " +
        "requisito de segurança.</p>" +
        "<h3>TLS</h3>" +
        "<p>O Kerberos resolve a autenticação dentro de um domínio administrado, em que " +
        "existe um servidor confiável que conhece as chaves de todo mundo. A Internet não " +
        "é assim. Comprador e vendedor fecham negócio sem contato prévio, sem terceiro " +
        "obrigatório e sem terem registrado chave nenhuma antes. O protocolo que atende a " +
        "esse caso é o TLS, herdeiro da camada de soquetes seguros (SSL) e padrão de fato " +
        "do comércio eletrônico.</p>" +
        "<p>Dois traços de projeto explicam por que ele durou. O primeiro é que " +
        "<strong>tudo é negociável</strong>. Numa rede aberta não se pode supor que as " +
        "duas pontas tenham o mesmo software nem os mesmos algoritmos, e leis de alguns " +
        "países restringiram o uso de certos algoritmos. Por isso as duas pontas acertam " +
        "no início da conversa um <strong>conjunto de cifras</strong>, que escolhe o " +
        "método de troca de chaves, a cifra dos dados e a função de resumo dos códigos de " +
        "autenticação. Se não houver algoritmo em comum, a conexão falha, e essa é a única " +
        "resposta honesta possível.</p>" +
        "<p>O segundo traço é a <strong>partida a frio</strong>. A conversa começa em " +
        "claro, com a troca das opções e de valores aleatórios. Em seguida as partes trocam " +
        "certificados X.509, opcionalmente dos dois lados. Um dos lados então gera um " +
        "<strong>segredo pré-mestre</strong>, que é um valor aleatório grande, e o envia " +
        "cifrado com a chave pública do outro. Dele os dois derivam as chaves de escrita, " +
        "uma para cada direção, e os segredos usados na autenticação de mensagem. A partir " +
        "das mensagens de troca de especificação de cifra, tudo passa cifrado e " +
        "autenticado.</p>" +
        "<p>Repare que isso é o protocolo misto da seção 2 implementado por inteiro. A " +
        "criptografia de chave pública aparece uma vez, para autenticar e transportar o " +
        "segredo, e daí em diante quem trabalha é a simétrica.</p>" +
        "<p>Abaixo do aperto de mãos fica o <strong>protocolo de registro</strong>, que " +
        "trata cada mensagem da aplicação numa sequência fixa. Ele fragmenta a mensagem em " +
        "blocos de tamanho determinado, opcionalmente compacta cada bloco, calcula o " +
        "código de autenticação, cifra o resultado e entrega à conexão TCP. Do outro lado " +
        "as transformações são desfeitas na ordem inversa. A compactação não é " +
        "propriamente uma característica de segurança, e está ali porque reduzir o volume " +
        "antes de cifrar e assinar barateia as duas etapas seguintes.</p>" +
        "<p>Sobra a defesa contra o homem no meio, que a seção 2 deixou em aberto. Ela é " +
        "prática e não é matemática. Os navegadores e outros programas de Internet são " +
        "distribuídos já contendo as chaves públicas de autoridades certificadoras " +
        "reconhecidas, então o primeiro certificado recebido é verificado com uma chave " +
        "que não veio pela rede naquela conversa. Uma segunda defesa inclui o nome de " +
        "domínio do serviço no certificado dele, e o cliente só aceita falar com o " +
        "endereço correspondente àquele nome. Cada sessão ganha um identificador, e as " +
        "duas pontas podem guardá-lo para retomar a conversa depois sem repetir o aperto " +
        "de mãos inteiro.</p>" +
        /* A demo saiu daqui para página própria em 2026-08-07. O cartão fica neste
           ponto porque as cinco etapas cobram a cifra da seção 2, a assinatura e o
           certificado da seção 3 e o aperto de mãos que este trecho descreveu. */
        '<a class="lab-card" href="demos/criptografia-basica/index.html" ' +
        'target="_blank" rel="noopener">' +
        '<span class="lab-card-eyebrow">Demonstração interativa · 5 etapas · ' +
        "cerca de 15 min</span>" +
        '<span class="lab-card-title">Mallory na Linha</span>' +
        '<span class="lab-card-summary">Você começa do lado errado da linha, ' +
        "grampeando a rede de Alice e Bob, e vai fechando as brechas que você " +
        "mesmo explorou até o cadeado acender. Termina montando o aperto de mãos " +
        "peça por peça.</span>" +
        '<span class="lab-card-cta">Abrir a demonstração ↗</span>' +
        "</a>" +
        "<h3>Confiança</h3>" +
        "<p>Autenticar é provar ser quem se diz. Feita a prova, aparece uma pergunta que a " +
        "criptografia não responde, que é o quanto aquela prova vale. É aí que começa a " +
        "confiança, e ela se define assim. <strong>Confiança é a garantia que uma entidade " +
        "tem de que outra vai agir conforme uma expectativa específica.</strong></p>" +
        "<p>A definição tem um efeito curioso. Onde a expectativa está inteiramente " +
        "especificada, não é preciso falar em confiança. O tópico 02 mostrou isso sem usar " +
        "a palavra, ao tratar da falha arbitrária. Num grupo de n processos em que no " +
        "máximo um terço se comporta de forma arbitrária, o grupo chega a acordo correto " +
        "entre os não defeituosos. Ninguém precisa confiar em processo nenhum, e basta " +
        "confiar em que o grupo cumpre a especificação dele. Quando a especificação é " +
        "violada, porque há defeituosos demais, nada mais se pode afirmar.</p>" +
        "<h3>Confiar numa identidade</h3>" +
        "<p>Sistemas descentralizados aceitam pedidos de origens que ninguém autenticou, " +
        "e é isso que uma rede par a par faz o tempo todo. Aí mora um ataque com nome " +
        "próprio. Todo sistema de identificação supõe três coisas, que um identificador " +
        "aponta para no máximo uma entidade, que cada entidade tem no máximo um " +
        "identificador e que o identificador sempre se refere à mesma entidade. No " +
        "<strong>ataque Sybil</strong> o invasor viola a segunda, criando muitas " +
        "identidades e entrando no sistema separadamente com cada uma.</p>" +
        "<p>O estrago numa rede par a par é grande, porque o invasor controla todas essas " +
        "identidades e elas agem em conluio. Basta deixarem de encaminhar pedidos de busca " +
        "para produzir uma negação de serviço. Se forem suficientes, qualquer busca passa " +
        "com alta probabilidade por um nó malicioso. Elas também podem apagar em conjunto " +
        "os arquivos pelos quais são coletivamente responsáveis, e nem a replicação " +
        "impede a perda definitiva.</p>" +
        "<p>Um parente próximo é o <strong>ataque de eclipse</strong>, em que os nós em " +
        "conluio isolam um nó do resto da rede. Ele funciona bem contra as redes que " +
        "mantêm a vizinhança trocando links escolhidos ao acaso, porque os maliciosos " +
        "nunca devolvem link de nó honesto, só de comparsa. Em poucas rodadas de troca, a " +
        "lista local da vítima só contém comparsas, e a partir daí ela vê apenas o que " +
        "eles deixam ver.</p>" +
        "<p>A saída simples é uma autoridade certificadora central, que obriga cada um a " +
        "provar ser dono da identidade digital que apresenta. Isso resolve e contraria a " +
        "proposta de um sistema descentralizado. A saída alternativa não tenta impedir " +
        "identidades múltiplas, e sim torná-las caras. É o que as cadeias de blocos sem " +
        "permissão fazem, por dois caminhos. Na <strong>prova de trabalho</strong>, quem " +
        "valida um bloco disputa uma corrida que consome muito processamento, e uma " +
        "identidade a mais para a mesma máquina física só divide o que ela já tinha. Na " +
        "<strong>prova de participação</strong>, quem valida é escolhido conforme a " +
        "quantidade de fichas que possui, e criar identidades novas não ajuda, porque cada " +
        "uma precisaria obter fichas próprias.</p>" +
        "<h3>Confiar num sistema</h3>" +
        "<p>As cadeias de blocos trazem uma afirmação forte, que é a de dispensar terceiro " +
        "confiável e também a confiança em cada participante. Para avaliá-la vale separar " +
        "a estrutura de dados do protocolo que a mantém.</p>" +
        "<p>A estrutura em si é sólida, e o mecanismo é o resumo da seção 2. Cada bloco " +
        "guarda um conjunto de transações validadas e um valor de resumo calculado sobre " +
        "o conteúdo dele. Esse valor é copiado para o bloco seguinte e entra no cálculo do " +
        "resumo daquele bloco. Alterar um bloco no meio da cadeia invalida o resumo dele, " +
        "o que invalida o resumo do próximo, e assim por diante até a ponta. Como a cadeia " +
        "é somente para leitura e massivamente replicada, alterá-la sem que ninguém " +
        "perceba é considerado difícil demais para valer a pena.</p>" +
        "<p>A afirmação mais ampla, porém, não se sustenta sozinha, e o voto eletrônico é " +
        "o exemplo que deixa isso claro. É possível montar um registro distribuído " +
        "verificável e à prova de adulteração, e mesmo assim o sistema sofre dos mesmos " +
        "problemas de qualquer votação eletrônica. Continua sendo necessário confiar em " +
        "que o sistema distribuído foi corretamente implementado e protegido contra " +
        "ataques, o que nenhuma estrutura de dados garante. Some-se a isso que existem " +
        "intermediários oferecendo serviços a quem quer participar, e esses " +
        "intermediários também precisam ser confiáveis.</p>" +
        "<h3>Observar, porque prevenir não basta</h3>" +
        "<p>Todo este tópico tratou de prevenção. Falta a metade que sobra, porque seria " +
        "ingênuo supor que as políticas são suficientes, que foram corretamente " +
        "implementadas e que estão sendo cumpridas. Acompanhar o que acontece no sistema " +
        "é o que permite agir quando alguma dessas três suposições falha.</p>" +
        "<p>A forma passiva é o registro de eventos, que serve para entender o que fazer " +
        "<em>depois</em> e não ajuda enquanto o estrago acontece. A forma ativa é a " +
        "detecção de intrusão, e o mecanismo mais difundido dela é o " +
        "<strong>firewall</strong>, que desconecta uma parte do sistema do mundo externo " +
        "e inspeciona tudo o que entra e sai.</p>" +
        "<p>Há dois tipos, e eles se combinam. O <strong>filtro de pacotes</strong> " +
        "trabalha como um roteador e decide pelo cabeçalho, olhando endereço de origem e " +
        "de destino. A <strong>porta de aplicação</strong> vai além e inspeciona o " +
        "conteúdo da mensagem, o que permite recusar correio acima de certo tamanho ou " +
        "filtrar mensagem indesejada. Um caso particular dela é o intermediário da Web, " +
        "que aceita pedidos comuns e devolve páginas modificadas, retirando delas o código " +
        "executável que não deveria rodar dentro da rede interna.</p>" +
        "<p>O firewall tem limites conhecidos. Como opera sobre tráfego de rede, ele não " +
        "trata autenticação nem autorização de recursos específicos, então uma conta " +
        "tomada por um invasor passa a fazer acessos que o firewall não tem como " +
        "reprovar. Ele também é ineficaz contra negação de serviço, porque a avalanche " +
        "sobrecarrega justamente o ponto único de defesa.</p>" +
        "<p>Por isso existe detecção de intrusão propriamente dita, em dois sabores. Os " +
        "sistemas <strong>baseados em assinatura</strong> guardam padrões de intrusões " +
        "conhecidas e comparam o tráfego novo com eles, o que funciona bem para o que já " +
        "se viu e não funciona contra ataque inédito, o chamado ataque de dia zero. Os " +
        "sistemas <strong>baseados em anomalia</strong> aprendem o comportamento típico do " +
        "sistema numa fase de treinamento e sinalizam o que foge dele, apoiados em " +
        "aprendizado de máquina.</p>" +
        "<p>O compromisso da detecção por anomalia merece atenção, porque ele reaparece em " +
        "qualquer classificador. Falso negativo é tratar como normal um evento que era " +
        "ataque, e é o erro que ninguém quer cometer. Reduzi-lo empurra o sistema para o " +
        "pessimismo, o que multiplica os falsos positivos. O resultado é o operador de " +
        "segurança cansado de alertas, que passa a ignorá-los, e aí os falsos negativos " +
        "voltam pela porta dos fundos.</p>" +
        "<p>Num sistema distribuído grande não existe um ponto de observação de onde se " +
        "veja o quadro completo, e é isso que justifica a <strong>detecção " +
        "colaborativa</strong>. Sensores espalhados pelo sistema medem dados que podem " +
        "indicar intrusão, e são agrupados em comunidades. Cada comunidade tem uma cabeça " +
        "que coleta e analisa os dados dos membros dela, e as cabeças trocam informação " +
        "entre si. Quando todas reportam a uma entidade única, o arranjo é centralizado; " +
        "quando elas se organizam numa rede par a par, ele é distribuído. Sem essa troca " +
        "não existe detecção colaborativa, e sim um punhado de detectores isolados.</p>" +
        "<p>Vale fechar o tópico onde ele começou. Nenhum mecanismo destas quatro seções " +
        "torna um sistema seguro sozinho. A política diz quem pode o quê, o mecanismo a " +
        "impõe, e a lista de ameaças é o que liga uma coisa à outra e permite argumentar " +
        "que a proteção cobre o que precisava cobrir. Como nenhuma lista de ameaças é " +
        "completa, o sistema observa a si mesmo e guarda registro do que aconteceu. " +
        "Segurança é menos um conjunto de ferramentas e mais um jeito de projetar, e é por " +
        "isso que ela precisa entrar no estágio básico do projeto e não no fim dele.</p>",
      slides: [
        {
          title: "Autenticar contra autorizar",
          html:
            "<ul>" +
            "<li>Autenticar verifica a identidade alegada</li>" +
            "<li>Autorizar decide o que aquela identidade pode</li>" +
            "<li>A ordem nunca muda</li>" +
            "<li>Autorizar sem autenticar é decidir sobre um desconhecido</li>" +
            "</ul>"
        },
        {
          title: "Quatro maneiras de provar quem se é",
          ref: "tab-meios-autenticacao"
        },
        {
          title: "O que a sessão esconde",
          html:
            "<ul>" +
            "<li>A autenticação acontece uma vez, no início</li>" +
            "<li>Depois o serviço apenas supõe que continua falando com o mesmo cliente</li>" +
            "<li>Autenticação <strong>contínua</strong> confere ao longo da sessão</li>" +
            "<li>Autenticar e garantir integridade só valem juntos</li>" +
            "</ul>"
        },
        {
          title: "Desafio e resposta",
          html:
            "<ul>" +
            "<li>Bob manda um número que Alice nunca viu</li>" +
            "<li>Alice devolve o número cifrado com a chave compartilhada</li>" +
            "<li>Só quem tem a chave produz a resposta certa</li>" +
            "<li>Cinco mensagens, porque cada lado desafia o outro</li>" +
            "</ul>"
        },
        {
          title: "O ataque de reflexão",
          ref: "fig-reflexao"
        },
        {
          title: "Duas lições do ataque",
          html:
            "<ul>" +
            "<li>Os dois lados faziam a mesma coisa do mesmo jeito</li>" +
            "<li>Bob entregou informação antes de saber a quem</li>" +
            "<li>Acelerar um protocolo mexe na correção dele</li>" +
            "<li>Toda mudança pede análise nova por inteiro</li>" +
            "</ul>"
        },
        {
          title: "Centro de distribuição de chaves",
          html:
            "<ul>" +
            "<li>Chave por par cresce com o quadrado do número de máquinas</li>" +
            "<li>Uma chave por máquina com o centro reduz o total a N</li>" +
            "<li>O <strong>tíquete</strong> é a chave de sessão cifrada para o destino</li>" +
            "<li>Quem entrega o tíquete é quem pediu, e ele não consegue lê-lo</li>" +
            "</ul>"
        },
        {
          title: "Needham e Schroeder",
          ref: "tab-needham-schroeder"
        },
        {
          title: "Kerberos",
          html:
            "<ul>" +
            "<li>Tíquete, autenticador e chave de sessão</li>" +
            "<li>Dois guichês, um por login e um por servidor novo</li>" +
            "<li>A senha nunca viaja, e é apagada da memória</li>" +
            "<li>Tíquete de cerca de doze horas limita estrago e revoga por expiração</li>" +
            "<li>O preço é depender de relógios sincronizados com segurança</li>" +
            "</ul>"
        },
        {
          title: "TLS",
          html:
            "<ul>" +
            "<li>Tudo é negociável, no <strong>conjunto de cifras</strong></li>" +
            "<li>Partida a frio, sem acordo prévio e sem terceiro obrigatório</li>" +
            "<li>Segredo pré-mestre gera as chaves de escrita, uma por direção</li>" +
            "<li>O registro fragmenta, compacta, autentica, cifra e entrega ao TCP</li>" +
            "<li>Contra o homem no meio, as autoridades já vêm no navegador</li>" +
            "</ul>"
        },
        {
          title: "Confiança",
          html:
            "<ul>" +
            "<li>Garantia de que outra entidade agirá conforme uma expectativa</li>" +
            "<li>Onde a expectativa está especificada, não se fala em confiança</li>" +
            "<li>Grupo com no máximo um terço arbitrário dispensa confiar em cada um</li>" +
            "<li>O que se confia é na especificação do grupo</li>" +
            "</ul>"
        },
        {
          title: "Sybil e eclipse",
          html:
            "<ul>" +
            "<li>Uma entidade cria muitas identidades e entra com cada uma</li>" +
            "<li>Em conluio, elas negam serviço e apagam o que deveriam guardar</li>" +
            "<li>No eclipse, os comparsas isolam a vítima do resto da rede</li>" +
            "<li>Prova de trabalho e prova de participação tornam a identidade cara</li>" +
            "</ul>"
        },
        {
          title: "Confiar num sistema",
          html:
            "<ul>" +
            "<li>O resumo de cada bloco entra no cálculo do resumo do seguinte</li>" +
            "<li>Alterar um bloco obriga a alterar todos os posteriores</li>" +
            "<li>Registro à prova de adulteração não é sistema confiável</li>" +
            "<li>Continua sendo preciso confiar em quem implementou</li>" +
            "</ul>"
        },
        {
          title: "Observar o próprio sistema",
          html:
            "<ul>" +
            "<li>Filtro de pacotes olha o cabeçalho, porta de aplicação olha o conteúdo</li>" +
            "<li>Firewall nada pode contra conta tomada nem contra negação de serviço</li>" +
            "<li>Detecção por assinatura falha no ataque inédito</li>" +
            "<li>Detecção por anomalia troca falso negativo por falso positivo</li>" +
            "<li>Em escala, sensores em comunidades que trocam informação</li>" +
            "</ul>"
        }
      ]
    }
  ],

  quiz: [
    {
      question:
        "Um invasor satura um servidor com mensagens inúteis apenas para impedir que os " +
        "usuários legítimos o acessem, sem ler nem alterar informação nenhuma. Nas três " +
        "classes de ameaça, esse ataque se enquadra como",
      options: [
        "vazamento, porque expõe ao invasor informações sobre a carga atual do servidor.",
        "falsificação, porque as mensagens inúteis alteram o estado interno do servidor.",
        "vandalismo, porque interfere na operação correta do sistema sem trazer ganho para quem ataca.",
        "mascaramento, porque o invasor esconde a identidade dele ao enviar as mensagens."
      ],
      answer: 2,
      explanation:
        "O método de ataque é a negação de serviço, e a classe de ameaça é o vandalismo, " +
        "que reúne a interferência na operação correta sem obtenção nem alteração de " +
        "informação. Vazamento seria informação chegando a quem não devia, e falsificação " +
        "seria alteração não autorizada de dados."
    },
    {
      question:
        "Mallory copia da rede uma mensagem cifrada que ordena um pagamento e a reenvia " +
        "intacta no dia seguinte, sem nunca ter conhecido a chave. Qual é o ataque, e por " +
        "que a criptografia sozinha não o impede?",
      options: [
        "É reprodução, e a mensagem copiada decifra corretamente porque é legítima, faltando apenas prova de que ela é nova.",
        "É homem no meio, e a criptografia falha porque Mallory substituiu as chaves durante a troca inicial da conversa.",
        "É intromissão, e a criptografia falha porque a chave usada era curta demais para resistir à força bruta.",
        "É texto puro escolhido, e Mallory cifrou mensagens em série até obter uma que correspondesse à original."
      ],
      answer: 0,
      explanation:
        "Copiar os bits e reenviá-los depois funciona mesmo contra mensagem cifrada e " +
        "autenticada, porque a cópia é autêntica de verdade e o problema é ela ser velha. " +
        "A defesa é incluir prova de frescor, na forma de nonce, como em Needham e " +
        "Schroeder, ou de carimbo de tempo, como no Kerberos."
    },
    {
      question:
        "Uma equipe precisa decidir em que camada colocar a proteção de uma aplicação de " +
        "mensagens em que o próprio provedor de infraestrutura está na lista de ameaças. " +
        "Qual escolha atende a esse requisito, e a que custo?",
      options: [
        "Estabelecer um túnel entre as redes, o que protege tudo o que passa por ele sem que nenhum programa precise ser alterado.",
        "Cifrar dentro da própria aplicação, o que dispensa garantia das camadas de baixo e transfere à equipe a manutenção de todo o mecanismo.",
        "Usar o canal seguro de transporte, que já vem pronto e não custa nada à equipe da aplicação manter ao longo do tempo.",
        "Delegar ao serviço de autenticação do middleware, que é independente do sistema operacional e resolve o problema sem custo."
      ],
      answer: 1,
      explanation:
        "Quanto mais alta a camada, menos a proteção depende de garantias de terceiros. A " +
        "cifragem fim a fim feita pela aplicação é a única das quatro que não confia em " +
        "nenhuma camada abaixo dela, e a contrapartida é que todo o mecanismo passa a ser " +
        "implantado e mantido pela própria aplicação."
    },
    {
      question:
        "Por que o TLS usa criptografia de chave pública apenas na abertura da sessão e " +
        "troca para chave secreta no restante da comunicação?",
      options: [
        "Porque a criptografia de chave pública garante apenas o segredo da mensagem e não tem como garantir a integridade dela, o que obrigaria a assinar cada bloco à parte.",
        "Porque os certificados X.509 expiram durante sessões longas e as chaves públicas deles ficariam inválidas no meio da conversa, obrigando as duas pontas a recomeçar.",
        "Porque as chaves secretas dispensam qualquer autenticação prévia entre as partes, o que simplifica o início da conversa e reduz o número de mensagens trocadas.",
        "Porque a assimétrica custa de 100 a 1.000 vezes mais processamento, então ela autentica as partes e transporta a chave de sessão, e a simétrica cifra os dados."
      ],
      answer: 3,
      explanation:
        "É o esquema de criptografia misto. A assimétrica resolve a distribuição de " +
        "chaves sem canal seguro prévio e é cara demais por byte, enquanto a simétrica " +
        "faz o trabalho pesado com a chave de sessão que a fase assimétrica estabeleceu. " +
        "O AES cifra a 61 MB/s, então uma página de 100 KB sai em poucos milissegundos."
    },
    {
      question:
        "Na assinatura digital com chave pública, o que Alice cifra e com qual chave?",
      options: [
        "O resumo do documento, com a própria chave privada, deixando a verificação ao alcance de quem tiver a chave pública dela.",
        "O documento inteiro, com a chave pública de Bob, de modo que nenhum outro destinatário consiga verificar a autoria do texto.",
        "O documento inteiro, com a própria chave pública, de modo a provar publicamente que foi sempre ela quem o publicou primeiro.",
        "O resumo do documento, com a chave pública de Bob, de modo a manter em sigilo o conteúdo de qualquer assinatura que ela produza."
      ],
      answer: 0,
      explanation:
        "A assinatura precisa nascer de um segredo que só o signatário possui e ser " +
        "verificável por todos, o que inverte o uso do par em relação ao sigilo. " +
        "Assina-se o resumo e não o documento porque cifrar um valor de comprimento fixo " +
        "é muito mais barato, e o resumo já vincula a assinatura à sequência de bits " +
        "inteira."
    },
    {
      question:
        "Alice e Bob nunca se falaram antes e precisam chegar a uma chave secreta comum " +
        "usando um canal que Eve escuta por inteiro. Na troca de chaves de Diffie e " +
        "Hellman, o que impede Eve de calcular a mesma chave?",
      options: [
        "Os valores trocados viajam cifrados com as chaves públicas de cada participante, então Eve não consegue lê-los ao interceptar a conversa.",
        "Os dois números públicos combinados no início da conversa são mantidos em segredo, e sem eles nenhum terceiro consegue refazer o cálculo.",
        "Recuperar o número secreto de cada um a partir do valor que ele publicou é inviável, e sem ele Eve não consegue chegar ao segredo comum.",
        "Cada participante envia a chave já pronta em uma segunda mensagem, protegida por um código de autenticação que só os dois conseguem produzir."
      ],
      answer: 2,
      explanation:
        "Tudo o que trafega na troca de Diffie e Hellman pode ser lido por qualquer um, " +
        "inclusive os dois números combinados no início. A segurança vem de ser inviável " +
        "recuperar o expoente secreto a partir do valor publicado, e é por isso que os " +
        "dois números secretos nunca precisam sair da máquina de quem os escolheu."
    },
    {
      question:
        "Uma empresa precisa que a saída de um funcionário retire imediatamente o acesso " +
        "dele a todos os documentos, mesmo os que ele já vinha acessando. Entre lista de " +
        "controle de acesso e capacidade, o que essa exigência recomenda?",
      options: [
        "A capacidade, porque o bilhete carrega os direitos e basta reemiti-lo com o conjunto novo.",
        "A lista de controle de acesso, porque ela fica com o objeto e a alteração vale no acesso seguinte.",
        "A capacidade, porque a validação dispensa consultar lista e por isso responde mais rápido à mudança.",
        "A lista de controle de acesso, porque ela evita que o servidor precise autenticar o principal a cada pedido."
      ],
      answer: 1,
      explanation:
        "Revogação imediata é a vantagem característica da lista de controle de acesso, " +
        "que mora com o objeto e é consultada a cada pedido. A capacidade sofre do " +
        "problema oposto, porque o bilhete já saiu das mãos de quem o emitiu, como a " +
        "chave de uma porta que continua abrindo depois que o portador deixou de ser " +
        "autorizado."
    },
    {
      question:
        "No login com Kerberos a senha do usuário nunca é transmitida pela rede. Como o " +
        "serviço de autenticação sabe, então, que quem pediu o tíquete é o usuário " +
        "legítimo?",
      options: [
        "O cliente calcula o resumo da senha e o envia ao servidor, que o compara com o resumo previamente armazenado no banco de autenticação daquele domínio.",
        "O serviço de concessão de tíquetes consulta a lista de controle de acesso do usuário e libera o tíquete apenas se ele já constar dela como autorizado.",
        "O servidor confia no endereço da máquina de origem, previamente registrado pelo administrador do sistema no banco de autenticação junto do nome do usuário.",
        "A resposta do serviço vem cifrada com a chave derivada da senha, e só quem digitar a senha certa consegue decifrá-la e obter a chave de sessão."
      ],
      answer: 3,
      explanation:
        "É o conceito de desafio, herdado de Needham e Schroeder. A resposta do serviço " +
        "de autenticação só é útil para quem conseguir decifrá-la, e um impostor recebe a " +
        "mesma resposta e fica olhando para dados incoerentes. A senha é usada localmente " +
        "para derivar a chave e apagada da memória logo em seguida."
    },
    {
      question:
        "Uma equipe reduziu de cinco para três mensagens um protocolo de desafio e " +
        "resposta, juntando o desafio de cada lado à mensagem que ele já enviava. O " +
        "protocolo passou a ser derrotado pelo ataque de reflexão. Qual erro de projeto " +
        "explica isso?",
      options: [
        "Bob passou a entregar uma resposta cifrada antes de saber a quem entregava, e os dois lados desafiavam do mesmo jeito.",
        "A chave compartilhada passou a ser usada duas vezes na mesma sessão, o que reduziu a resistência dela à análise do invasor.",
        "O desafio deixou de ser um número escolhido ao acaso e passou a ser previsível para quem observasse mensagens anteriores.",
        "As mensagens juntadas ficaram grandes demais para um único pacote, e a fragmentação abriu espaço para inserção de conteúdo."
      ],
      answer: 0,
      explanation:
        "O invasor abre um segundo canal usando como desafio o próprio desafio que Bob " +
        "acabou de enviar, e Bob o cifra sem perceber que já o tinha usado. Dois " +
        "princípios foram violados de uma vez, porque os dois papéis faziam a mesma coisa " +
        "do mesmo jeito e porque informação valiosa foi entregue antes da prova de " +
        "identidade."
    },
    {
      question:
        "Numa rede par a par sem autoridade central, um invasor cria centenas de nós " +
        "lógicos controlados por ele e os põe para agir em conluio. Que ataque é esse, e " +
        "por que a prova de trabalho de uma cadeia de blocos o desencoraja?",
      options: [
        "É o ataque de eclipse, e a prova de trabalho impede que os nós maliciosos deixem de encaminhar os pedidos de busca que recebem dos demais.",
        "É o ataque de reflexão, e a prova de trabalho garante que cada nó responda apenas a desafios que ele mesmo não tenha originado antes.",
        "É o ataque Sybil, e a prova de trabalho torna cada identidade cara, porque uma identidade a mais na mesma máquina só divide o processamento que ela já tinha.",
        "É o ataque do homem no meio, e a prova de trabalho substitui os certificados por um registro replicado que dispensa autoridade certificadora."
      ],
      answer: 2,
      explanation:
        "O ataque Sybil viola a suposição de que cada entidade tem no máximo um " +
        "identificador. Sem autoridade confiável ele é praticamente impossível de " +
        "impedir, e a saída das cadeias de blocos sem permissão é torná-lo pouco " +
        "atraente, exigindo que cada identidade gaste processamento, na prova de " +
        "trabalho, ou possua fichas próprias, na prova de participação."
    }
  ],

  glossary: [
    {
      term: "Principal",
      definition:
        "Usuário ou processo autorizado a operar sobre recursos de um sistema " +
        "distribuído. O servidor primeiro autentica o principal e depois aplica o " +
        "controle de acesso, e essa ordem nunca se inverte."
    },
    {
      term: "Ataque de reprodução (replay)",
      definition:
        "Armazenar mensagens interceptadas e reenviá-las mais tarde. Funciona mesmo " +
        "contra mensagem cifrada e autenticada, porque a cópia é legítima e apenas não é " +
        "nova. Combate-se com prova de frescor, na forma de nonce ou de carimbo de tempo."
    },
    {
      term: "Homem no meio (man-in-the-middle)",
      definition:
        "Ataque em que o invasor intercepta a troca inicial de chaves e a substitui pelas " +
        "chaves dele, passando a decifrar e recifrar todo o tráfego sem ser notado. A " +
        "defesa é autenticar a chave pública com certificado de autoridade confiável."
    },
    {
      term: "Base de computação confiável",
      definition:
        "Conjunto de mecanismos necessários e suficientes para fazer valer a política de " +
        "segurança, e que por isso precisam ser confiáveis. Inclui software, firmware, " +
        "hardware e pessoas, e quanto menor for, mais fácil fica dizer onde concentrar a " +
        "inspeção."
    },
    {
      term: "Criptografia de chave secreta (simétrica)",
      definition:
        "Família de algoritmos em que a mesma chave, compartilhada por quem envia e por " +
        "quem recebe, cifra e decifra. É rápida e por isso cuida do volume de dados nos " +
        "protocolos mistos, e a dificuldade dela é entregar a chave com segurança."
    },
    {
      term: "Criptografia de chave pública (assimétrica)",
      definition:
        "Família de algoritmos com par de chaves, em que a pública cifra e apenas a " +
        "privada correspondente decifra. Resolve a distribuição de chaves entre quem " +
        "nunca se encontrou e custa de 100 a 1.000 vezes mais processamento que a " +
        "simétrica."
    },
    {
      term: "Função de alçapão (trap-door)",
      definition:
        "Função de mão única com uma saída secreta, fácil de calcular e inviável de " +
        "inverter para quem não conhece o segredo. É a base dos esquemas de chave " +
        "pública, e no RSA a saída secreta está na fatoração do produto de dois primos " +
        "muito grandes."
    },
    {
      term: "Encadeamento de blocos de cifra (CBC)",
      definition:
        "Modo de operação das cifras de bloco em que cada bloco de texto puro passa por " +
        "ou exclusivo com o bloco cifrado anterior antes de ser cifrado, impedindo que " +
        "trechos idênticos produzam saídas idênticas. Um vetor de inicialização diferente " +
        "por mensagem completa a proteção."
    },
    {
      term: "Função de resumo segura",
      definition:
        "Função que transforma uma mensagem de qualquer tamanho num valor de comprimento " +
        "fixo. Precisa ser de mão única e resistente a colisão, tanto para uma mensagem " +
        "dada quanto para qualquer par de mensagens. É o que se assina, no lugar do " +
        "documento."
    },
    {
      term: "Assinatura digital",
      definition:
        "Vínculo irreversível entre um segredo do signatário e os bits de um documento, " +
        "obtido cifrando o resumo com a chave privada. Qualquer um verifica com a chave " +
        "pública, e o resultado garante autenticidade, impossibilidade de falsificação e " +
        "não repúdio."
    },
    {
      term: "Código de autenticação de mensagem (MAC)",
      definition:
        "Assinatura de baixo custo para canais que já compartilham um segredo, obtida " +
        "pelo resumo da mensagem concatenada com a chave. Não envolve criptografia, e " +
        "resumo seguro é de três a dez vezes mais rápido que cifra simétrica. O TLS o usa " +
        "em cada bloco transmitido."
    },
    {
      term: "Certificado digital",
      definition:
        "Declaração assinada por um principal, em geral vinculando um nome a uma chave " +
        "pública, no formato X.509 com sujeito, emitente e período de validade. " +
        "Verifica-se subindo a cadeia de assinaturas até uma autoridade certificadora " +
        "confiável, e o prazo curto substitui a revogação, que é cara."
    },
    {
      term: "Troca de chaves de Diffie-Hellman",
      definition:
        "Esquema em que dois participantes chegam a um segredo compartilhado sobre um " +
        "canal que qualquer um escuta. Cada um escolhe um número secreto, publica um " +
        "valor derivado dele e eleva ao próprio segredo o valor recebido, chegando ambos " +
        "ao mesmo resultado sem que os segredos trafeguem."
    },
    {
      term: "Chave de sessão",
      definition:
        "Chave secreta temporária, usada durante uma única conversa e descartada no fim. " +
        "Existe porque chave muito usada dá material de análise ao invasor, porque " +
        "protege contra a reprodução de uma sessão inteira e porque limita o estrago de " +
        "um comprometimento a uma conversa só."
    },
    {
      term: "Nonce",
      definition:
        "Valor usado uma única vez, incluído numa mensagem para amarrá-la a outra e " +
        "demonstrar que ela é nova. É a peça central dos protocolos de desafio e " +
        "resposta, e o Kerberos usa carimbos de tempo no mesmo papel, ao preço de exigir " +
        "relógios sincronizados."
    },
    {
      term: "Monitor de referência",
      definition:
        "Programa que registra qual sujeito pode executar qual operação sobre qual " +
        "objeto e decide cada invocação. É chamado a cada acesso, e por isso ele mesmo " +
        "precisa ser à prova de adulteração."
    },
    {
      term: "Capacidade (capability)",
      definition:
        "Bilhete impossível de falsificar que o cliente carrega, contendo o " +
        "identificador do recurso, as operações permitidas e uma assinatura. Corresponde " +
        "a uma linha da matriz de acesso, prova a autorização na hora e delega com " +
        "facilidade, e sofre com roubo e com revogação difícil."
    },
    {
      term: "Lista de controle de acesso (ACL)",
      definition:
        "Lista associada ao recurso com entradas que dizem quais operações cada domínio " +
        "pode executar sobre ele, como nos bits de permissão do UNIX e do Windows. " +
        "Corresponde a uma coluna da matriz de acesso, e alterações valem no acesso " +
        "seguinte, ao custo de autenticar o principal e consultar a lista a cada pedido."
    },
    {
      term: "Delegação",
      definition:
        "Transferência de direitos de um principal para outro, para que este aja em nome " +
        "daquele. O proxy que a implementa traz a lista de direitos assinada e uma " +
        "pergunta que só quem recebeu a delegação sabe responder, e os direitos " +
        "transferidos são sempre um subconjunto dos de quem delegou."
    },
    {
      term: "Ataque Sybil",
      definition:
        "Ataque em que uma entidade cria muitas identidades lógicas e entra no sistema " +
        "com cada uma, violando a suposição de que cada entidade tem um identificador só. " +
        "Sem autoridade confiável é quase impossível de impedir, e as cadeias de blocos o " +
        "desencorajam tornando cada identidade cara."
    }
  ],

  references: [
    "VAN STEEN, M.; TANENBAUM, A. S. Distributed Systems. 4. ed. (versão DS 4.03). " +
    "distributed-systems.net, 2023. Cap. 9. Security (pp. 545-614). Fonte principal do " +
    "conteúdo deste tópico, com os princípios de projeto, a criptografia, a gerência de " +
    "chaves, a autorização, a autenticação, a confiança e o monitoramento.",
    "COULOURIS, G.; DOLLIMORE, J.; KINDBERG, T.; BLAIR, G. Sistemas Distribuídos: " +
    "Conceitos e Projeto. 5. ed. Porto Alegre: Bookman, 2013. Cap. 11. Segurança " +
    "(pp. 463-519). Define a progressão do tópico, da ameaça aos protocolos reais, e " +
    "sustenta os algoritmos de criptografia, as assinaturas e os estudos de caso do " +
    "Needham e Schroeder, do Kerberos e do TLS.",
    "KSHEMKALYANI, A. D.; SINGHAL, M. Distributed Computing: Principles, Algorithms, " +
    "and Systems. Cambridge: Cambridge University Press, 2011. Cap. 16. Authentication " +
    "in distributed systems. Leitura complementar para quem quiser o tratamento formal " +
    "dos protocolos de autenticação com chaves secretas e públicas."
  ]
};
