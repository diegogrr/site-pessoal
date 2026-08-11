/* ============================================================
   topic-08.js — Sistemas de Arquivos Distribuídos
   ------------------------------------------------------------
   Estrutura documentada no modelo topic-01.js (sections[] com
   slides[] opcionais, quiz[], glossary[], references[]).
   Fundamentação: manifesto em docs/fontes/topico-08.json.
   Hierarquia de fontes em docs/fontes/README.md — este é o
   tópico em que ela quase não se aplica, porque a 4. ed. do van
   Steen eliminou o capítulo de sistemas de arquivos
   distribuídos. O Coulouris (cap. 12) é ao mesmo tempo o
   esqueleto e a fonte de conteúdo; o van Steen entra nos dois
   lugares em que o NFS sobreviveu no livro dele (2.3.3 e
   6.3.5). A seção 5, com GFS e HDFS, é a ampliação decidida por
   Diego em 2026-08-04 e vem do paper original, do Coulouris 21,
   de HWANG 6, RAPTIS 7 e KLEPPMANN 11.
   ============================================================ */

window.SD = window.SD || {};
SD.content = SD.content || {};

SD.content["08"] = {

  sections: [
    {
      title: "O arquivo, o serviço e o que muda ao distribuir",
      html:
        "<p>Os sete tópicos anteriores ensinaram processos a conversar. Eles trocam " +
        "mensagens por soquetes, invocam procedimentos que moram em outra máquina, " +
        "protegem o que dizem de quem escuta a linha e rodam sobre sistemas operacionais " +
        "que escondem parte da distância. Falta o recurso que motivou boa parte disso, que " +
        "é a informação armazenada.</p>" +
        "<p>Um <strong>serviço de arquivos</strong> permite que um programa guarde e leia " +
        "arquivos remotos exatamente como se fossem locais, a partir de qualquer computador " +
        "da rede. A ambição é alta, porque o desempenho e a confiabilidade do acesso a um " +
        "arquivo guardado no servidor devem ser comparáveis aos de um arquivo guardado no " +
        "disco da própria máquina. Um <strong>sistema de arquivos distribuído</strong> é a " +
        "implementação dessa promessa.</p>" +
        "<p>Esse costuma ser o serviço mais usado de uma intranet, e a lista de quem depende " +
        "dele é maior do que parece. O servidor Web lê do sistema de arquivos as páginas que " +
        "serve. O serviço de nomes, o de autenticação de usuário e o de impressão guardam " +
        "ali o que precisam manter entre reinícios. E concentrar o armazenamento em poucos " +
        "servidores é justamente o que torna viável fazer cópia de segurança de tudo o que " +
        "uma organização produz.</p>" +
        "<h3>O que um arquivo é, antes de distribuir</h3>" +
        "<p>Um arquivo tem duas partes, e a distinção entre elas atravessa o tópico inteiro. " +
        "Os <strong>dados</strong> são uma sequência de bytes que se pode ler ou escrever em " +
        "qualquer posição. Os <strong>atributos</strong> formam um registro único, com o " +
        "tamanho do arquivo, os carimbos de tempo de criação, de acesso e de modificação, o " +
        "proprietário, o tipo e a lista de controle de acesso.</p>" +
        "<p>Alguns atributos não pertencem ao programa, e sim ao sistema. O tamanho e os " +
        "carimbos de tempo são <strong>sombreados</strong>, ou seja, o próprio sistema de " +
        "arquivos os mantém e um programa de usuário não os atualiza. Escrever no arquivo " +
        "muda o tamanho, e nenhum programa escolhe qual tamanho declarar.</p>" +
        "<p>O termo <strong>metadados</strong> cobre tudo o que o sistema guarda para " +
        "conseguir gerenciar arquivos, e não apenas para armazená-los. Entram aí os " +
        "atributos e, principalmente, os <strong>diretórios</strong>. Um diretório é um " +
        "arquivo de tipo especial que mapeia nomes textuais em identificadores internos, e " +
        "diretórios que apontam para outros diretórios formam a árvore de nomes de caminho " +
        "que qualquer usuário de UNIX conhece.</p>" +
        "<p>Um sistema de arquivos local também não é uma peça só. Ele é uma pilha de " +
        "módulos em que cada camada usa apenas a camada imediatamente inferior, e enxergar " +
        "essa pilha ajuda a ver o que a distribuição acrescenta.</p>" +
        '<figure class="figura" id="fig-camadas-fs">' +
        '<svg viewBox="0 0 600 300" role="img" aria-labelledby="fig-camadas-fs-titulo">' +
        '<title id="fig-camadas-fs-titulo">Seis módulos empilhados, do mais alto para o ' +
        "mais baixo. No topo fica o módulo de diretório, que relaciona nomes de arquivo com " +
        "identificadores. Abaixo dele vêm o módulo de arquivo, o controle de acesso, o " +
        "acesso a arquivo, o módulo de bloco e o módulo de dispositivo, que faz a entrada e " +
        "a saída no disco. Ao lado da pilha, duas caixas destacadas apontam para ela e " +
        "mostram o que a distribuição acrescenta, que são a comunicação entre cliente e " +
        "servidor e a nomeação e localização de arquivos espalhados pela rede.</title>" +
        '<rect class="caixa" x="16" y="10" width="290" height="38" rx="8"/>' +
        '<text x="161" y="34" text-anchor="middle" font-size="13">Módulo de diretório</text>' +
        '<rect class="caixa" x="16" y="52" width="290" height="38" rx="8"/>' +
        '<text x="161" y="76" text-anchor="middle" font-size="13">Módulo de arquivo</text>' +
        '<rect class="caixa" x="16" y="94" width="290" height="38" rx="8"/>' +
        '<text x="161" y="118" text-anchor="middle" font-size="13">Controle de acesso</text>' +
        '<rect class="caixa" x="16" y="136" width="290" height="38" rx="8"/>' +
        '<text x="161" y="160" text-anchor="middle" font-size="13">Acesso a arquivo</text>' +
        '<rect class="caixa" x="16" y="178" width="290" height="38" rx="8"/>' +
        '<text x="161" y="202" text-anchor="middle" font-size="13">Módulo de bloco</text>' +
        '<rect class="caixa" x="16" y="220" width="290" height="38" rx="8"/>' +
        '<text x="161" y="244" text-anchor="middle" font-size="13">Módulo de dispositivo</text>' +
        '<text class="rotulo-secundario" x="161" y="280" text-anchor="middle" ' +
        'font-size="12">cada camada usa apenas a de baixo</text>' +
        '<text class="rotulo-secundario" x="462" y="48" text-anchor="middle" ' +
        'font-size="12">o que a distribuição acrescenta</text>' +
        '<rect class="caixa-destaque" x="338" y="62" width="248" height="52" rx="8"/>' +
        '<text x="462" y="84" text-anchor="middle" font-size="13">Comunicação entre</text>' +
        '<text x="462" y="102" text-anchor="middle" font-size="13">cliente e servidor</text>' +
        '<path class="traco" d="M338 88 L318 88"/>' +
        '<path class="seta" d="M318 82 L318 94 L306 88 Z"/>' +
        '<rect class="caixa-destaque" x="338" y="148" width="248" height="52" rx="8"/>' +
        '<text x="462" y="170" text-anchor="middle" font-size="13">Nomeação e localização</text>' +
        '<text x="462" y="188" text-anchor="middle" font-size="13">de arquivos na rede</text>' +
        '<path class="traco" d="M338 174 L318 174"/>' +
        '<path class="seta" d="M318 168 L318 180 L306 174 Z"/>' +
        "</svg>" +
        "<figcaption>A pilha da esquerda já existe em qualquer sistema de arquivos local. " +
        "Um serviço distribuído precisa dela inteira e ainda dos dois assuntos da direita, " +
        "que são o resto deste tópico.</figcaption>" +
        "</figure>" +
        "<p>O vocabulário mudou pouco em quarenta anos. Num Linux de hoje, o driver de " +
        "dispositivo de bloco conversa com o disco, uma cache de páginas guarda em memória " +
        "os blocos lidos há pouco, a camada de sistema de arquivos quebra arquivos grandes " +
        "em blocos e cuida dos i-nodes e dos diretórios, e no topo o <strong>sistema de " +
        "arquivos virtual</strong>, conhecido pela sigla VFS, oferece às aplicações uma " +
        "interface única, seja qual for o sistema de arquivos por baixo. Guarde o VFS, " +
        "porque ele reaparece na seção 3 como a peça que torna o NFS possível.</p>" +
        "<h3>O que muda quando o arquivo fica do outro lado da rede</h3>" +
        "<p>Boa parte das armadilhas do projeto de serviços distribuídos foi descoberta " +
        "construindo os primeiros sistemas de arquivos distribuídos, nos anos 70 e 80. Eles " +
        "começaram oferecendo apenas transparência de acesso e de localização, e os demais " +
        "requisitos apareceram conforme o uso crescia. A lista que se formou é quase um " +
        "índice desta disciplina.</p>" +
        "<p>Cinco desses requisitos são formas de transparência, e vale separá-los porque " +
        "cada um esconde do programa cliente uma coisa diferente.</p>" +
        '<div class="tabela-rolagem">' +
        '<table class="tabela-conteudo" id="tab-transparencias">' +
        "<tr><th>Forma de transparência</th><th>O que o programa cliente deixa de " +
        "precisar saber</th></tr>" +
        "<tr><td>Acesso</td><td>Um único conjunto de operações serve para arquivo local e " +
        "para arquivo remoto, então um programa já escrito passa a acessar arquivos " +
        "remotos sem ser alterado.</td></tr>" +
        "<tr><td>Localização</td><td>Todos os clientes veem o mesmo espaço de nomes, e o " +
        "mesmo nome de caminho vale onde quer que o programa seja executado.</td></tr>" +
        "<tr><td>Mobilidade</td><td>Mover arquivos entre servidores não obriga a mudar " +
        "nome nenhum nem a reconfigurar os clientes.</td></tr>" +
        "<tr><td>Desempenho</td><td>O programa continua funcionando de forma satisfatória " +
        "enquanto a carga sobre o serviço varia.</td></tr>" +
        "<tr><td>Mudança de escala</td><td>O serviço cresce aos poucos, sem que uma " +
        "ampliação obrigue a refazer a instalação.</td></tr>" +
        "</table>" +
        "</div>" +
        "<p>A tabela mostra que transparência não é uma propriedade só. Um serviço pode " +
        "entregar acesso com folga e falhar em mobilidade, e é exatamente isso que acontece " +
        "com o NFS, como a seção 3 vai medir.</p>" +
        "<p>Os outros requisitos não são formas de transparência, e cada um deles cobra uma " +
        "decisão de projeto explícita.</p>" +
        "<ul>" +
        "<li>As <strong>atualizações concorrentes</strong> feitas por um cliente não podem " +
        "corromper o que outro cliente está vendo, e a resposta usual segue os padrões " +
        "modernos do UNIX, com travamento em nível de arquivo ou de registro.</li>" +
        "<li>A <strong>replicação</strong> divide a carga entre servidores e tolera falhas, " +
        "mas poucos serviços replicam de verdade, e quase todos se contentam com a cache, " +
        "que é uma forma limitada de replicação.</li>" +
        "<li>A <strong>heterogeneidade</strong> exige interfaces abertas, para que o " +
        "software de cliente e o de servidor possam ser escritos para sistemas operacionais " +
        "e computadores diferentes.</li>" +
        "<li>A <strong>tolerância a falhas</strong> mantém o serviço de pé diante da queda " +
        "do cliente e da queda do servidor, que falham de forma independente.</li>" +
        "<li>A <strong>segurança</strong> obriga a autenticar cada requisição e a proteger o " +
        "tráfego, porque a interface do servidor fica exposta na rede.</li>" +
        "<li>A <strong>eficiência</strong> fecha a lista, porque um serviço que entregue " +
        "tudo isso e seja lento simplesmente não é adotado.</li>" +
        "</ul>" +
        "<h3>Duas ideias governam todas as decisões seguintes</h3>" +
        "<p>Dois itens dessa lista merecem tratamento próprio, porque não são preferências " +
        "de projeto e sim restrições que moldam cada escolha dos estudos de caso.</p>" +
        "<p>A primeira é a <strong>tolerância a falhas obtida por simplicidade</strong>. Se " +
        "todas as operações do protocolo forem <strong>idempotentes</strong>, quer dizer, se " +
        "repeti-las não mudar o resultado, o cliente pode reenviar à vontade uma chamada que " +
        "ficou sem resposta, e a semântica <em>pelo menos uma vez</em> do tópico 05 já " +
        "basta. Se além disso o servidor for <strong>sem estado</strong> (<em>stateless</em>), " +
        "ele pode cair e reiniciar sem recuperar coisa alguma, porque não havia nada guardado " +
        "em nome de cliente nenhum.</p>" +
        "<p>Repare no tamanho do ganho. Duas propriedades baratas do protocolo compram uma " +
        "tolerância a falhas que, de outro modo, exigiria replicação de arquivos, que é bem " +
        "mais cara. É por isso que a seção 2 vai desenhar a interface do serviço abrindo mão " +
        "de conveniências que o UNIX oferece.</p>" +
        "<p>A segunda ideia é a <strong>semântica de atualização de cópia única</strong> " +
        "(<em>one-copy</em>). Ela descreve o comportamento que um sistema de arquivos local " +
        "entrega de graça, em que o conteúdo visto por todos os processos que acessam ou " +
        "atualizam um arquivo é aquele que eles veriam se existisse uma cópia só. A " +
        "afirmação é sobre comportamento observável, e não sobre quantas cópias existem no " +
        "disco.</p>" +
        "<p>É aí que mora a tensão do tópico. Guardar dados em cache no cliente ou " +
        "replicá-los entre servidores é o que torna o serviço rápido, e as duas coisas " +
        "introduzem um atraso inevitável na propagação das escritas. Algum desvio da cópia " +
        "única passa a ser certo, e a pergunta deixa de ser como evitá-lo. Passa a ser " +
        "quanto dele o serviço admite e o que oferece em troca. Cada sistema das próximas " +
        "três seções responde a isso de um jeito diferente.</p>" +
        "<h3>Duas maneiras de servir um arquivo remoto</h3>" +
        "<p>Antes dos estudos de caso, vale nomear a escolha que mais os separa. Há duas " +
        "maneiras de dar a um cliente acesso a um arquivo guardado no servidor, e elas " +
        "produzem sistemas com desempenho, consistência e modo de falhar bem diferentes.</p>" +
        '<figure class="figura" id="fig-modelos-acesso">' +
        '<svg viewBox="0 0 600 250" role="img" aria-labelledby="fig-modelos-acesso-titulo">' +
        '<title id="fig-modelos-acesso-titulo">Dois painéis lado a lado. No painel da ' +
        "esquerda, o modelo de acesso remoto mostra um cliente em cima e um servidor " +
        "embaixo, com o arquivo dentro do servidor. Uma seta desce com cada pedido e outra " +
        "sobe com a resposta, e o arquivo nunca sai do servidor. No painel da direita, o " +
        "modelo de carregar e descarregar mostra o arquivo inteiro subindo para o cliente, " +
        "que passa a ter uma cópia local, e depois a cópia descendo de volta ao servidor " +
        "quando o cliente termina.</title>" +
        '<text x="150" y="20" text-anchor="middle" font-size="13">Acesso remoto</text>' +
        '<rect class="caixa" x="60" y="32" width="180" height="40" rx="8"/>' +
        '<text x="150" y="57" text-anchor="middle" font-size="13">Cliente</text>' +
        '<rect class="caixa" x="60" y="146" width="180" height="62" rx="8"/>' +
        '<text x="150" y="169" text-anchor="middle" font-size="13">Servidor</text>' +
        '<rect class="caixa-destaque" x="100" y="178" width="100" height="24" rx="6"/>' +
        '<text x="150" y="195" text-anchor="middle" font-size="12">arquivo</text>' +
        '<path class="traco" d="M110 72 L110 136"/>' +
        '<path class="seta" d="M104 136 L116 136 L110 146 Z"/>' +
        '<text class="rotulo-secundario" x="102" y="108" text-anchor="end" ' +
        'font-size="11">pedido</text>' +
        '<path class="traco" d="M190 146 L190 82"/>' +
        '<path class="seta" d="M184 82 L196 82 L190 72 Z"/>' +
        '<text class="rotulo-secundario" x="198" y="108" font-size="11">resposta</text>' +
        '<text class="rotulo-secundario" x="150" y="232" text-anchor="middle" ' +
        'font-size="12">o arquivo nunca sai do servidor</text>' +
        '<text x="450" y="20" text-anchor="middle" font-size="13">Carregar e descarregar</text>' +
        '<rect class="caixa" x="360" y="32" width="180" height="62" rx="8"/>' +
        '<text x="450" y="55" text-anchor="middle" font-size="13">Cliente</text>' +
        '<rect class="caixa-destaque" x="400" y="64" width="100" height="24" rx="6"/>' +
        '<text x="450" y="81" text-anchor="middle" font-size="12">cópia</text>' +
        '<rect class="caixa" x="360" y="146" width="180" height="62" rx="8"/>' +
        '<text x="450" y="169" text-anchor="middle" font-size="13">Servidor</text>' +
        '<rect class="caixa-destaque" x="400" y="178" width="100" height="24" rx="6"/>' +
        '<text x="450" y="195" text-anchor="middle" font-size="12">arquivo</text>' +
        '<path class="traco" d="M410 146 L410 104"/>' +
        '<path class="seta" d="M404 104 L416 104 L410 94 Z"/>' +
        '<text class="rotulo-secundario" x="402" y="124" text-anchor="end" ' +
        'font-size="11">1. cópia inteira</text>' +
        '<path class="traco" d="M490 94 L490 136"/>' +
        '<path class="seta" d="M484 136 L496 136 L490 146 Z"/>' +
        '<text class="rotulo-secundario" x="498" y="124" font-size="11">3. devolve</text>' +
        '<text class="rotulo-secundario" x="450" y="232" text-anchor="middle" ' +
        'font-size="12">2. lê e escreve na cópia local</text>' +
        "</svg>" +
        '<p class="figura-fonte">Fonte: traduzido de Van Steen e Tanenbaum (2023).</p>' +
        "<figcaption>Os dois modelos entregam a mesma abstração ao programa e cobram " +
        "preços opostos. No acesso remoto, cada operação custa uma ida à rede. No carregar " +
        "e descarregar, a ida à rede acontece duas vezes por arquivo, e no intervalo " +
        "ninguém no servidor sabe o que está sendo feito com a cópia.</figcaption>" +
        "</figure>" +
        "<p>No <strong>modelo de acesso remoto</strong>, o arquivo permanece no servidor e o " +
        "cliente pede cada operação. Ele recebe uma interface parecida com a do sistema de " +
        "arquivos local, mas quem implementa as operações é o servidor. A consistência fica " +
        "mais fácil de sustentar, porque existe um lugar só onde o arquivo é modificado, e o " +
        "custo aparece no número de idas e voltas.</p>" +
        "<p>No <strong>modelo de carregar e descarregar</strong>, o cliente baixa o arquivo " +
        "inteiro, opera na cópia local sem falar com ninguém e devolve a cópia ao terminar. " +
        "O acesso fica rápido e o servidor fica aliviado, e o preço é que o servidor passa " +
        "um bom tempo sem saber o que está acontecendo com aquele arquivo. O serviço de " +
        "transferência de arquivos da Internet (FTP) funciona assim quando alguém baixa um " +
        "arquivo, edita e envia de volta.</p>" +
        "<p>Nenhum dos dois é melhor em abstrato, e é por isso que os dois viraram sistemas " +
        "reais e duradouros. O NFS da seção 3 adota o acesso remoto e o AFS da seção 4 adota " +
        "o carregar e descarregar, e quase toda diferença entre eles decorre dessa escolha " +
        "inicial.</p>" +
        '<div class="callout">' +
        '<p class="callout-title">💡 Por que a escrita direta importa aqui e não no disco local</p>' +
        "<p>Gravar no disco antes de responder ao cliente parece um exagero, e num sistema " +
        "local seria mesmo. A diferença está nos modos de falha independentes que o tópico " +
        "01 apresentou. Se o servidor cai, o cliente continua rodando e seguindo em frente " +
        "com a suposição de que a escrita anterior chegou ao disco. Num sistema local isso " +
        "não acontece, porque a falha que derruba o sistema de arquivos derruba junto todos " +
        "os programas que iriam agir com base na suposição falsa.</p>" +
        "</div>",
      slides: [
        {
          title: "O serviço de arquivos e o que ele promete",
          html:
            "<ul>" +
            "<li>Guardar e ler arquivos remotos <strong>como se fossem locais</strong>, de " +
            "qualquer computador da rede</li>" +
            "<li>Desempenho e confiabilidade comparáveis aos do disco local</li>" +
            "<li>É o serviço mais usado de uma intranet, e servidor Web, nomes e " +
            "autenticação dependem dele</li>" +
            "<li>Arquivo tem <strong>dados</strong> e <strong>atributos</strong>, e " +
            "metadados cobrem atributos e diretórios</li>" +
            "</ul>"
        },
        {
          title: "A pilha que já existe e o que a distribuição acrescenta",
          ref: "fig-camadas-fs",
          html:
            "<ul>" +
            "<li>Cada camada usa apenas a de baixo, e o serviço distribuído precisa de " +
            "todas elas</li>" +
            "<li>Sobram dois assuntos novos, que são comunicar e localizar</li>" +
            "</ul>"
        },
        {
          title: "Os requisitos que a distribuição impõe",
          ref: "tab-transparencias"
        },
        {
          title: "Duas ideias governam o resto",
          html:
            "<ul>" +
            "<li><strong>Idempotência mais servidor sem estado</strong> compram tolerância " +
            "a falhas barata, pois o servidor reinicia sem recuperar nada</li>" +
            "<li><strong>Cópia única</strong> descreve comportamento observável, não " +
            "número de cópias no disco</li>" +
            "<li>Cache e réplica atrasam a propagação, então algum desvio é certo</li>" +
            "<li>A pergunta vira quanto desvio o serviço admite e o que dá em troca</li>" +
            "</ul>"
        },
        {
          title: "Dois modelos de acesso separam os estudos de caso",
          ref: "fig-modelos-acesso",
          html:
            "<ul>" +
            "<li>No acesso remoto o arquivo fica no servidor, e o NFS segue este</li>" +
            "<li>Em carregar e descarregar a cópia vai ao cliente, e o AFS segue este</li>" +
            "</ul>"
        }
      ]
    },
    {
      title: "A arquitetura do serviço de arquivos",
      html:
        "<p>A seção anterior terminou com uma pergunta de projeto e nenhuma peça concreta " +
        "para respondê-la. Antes de abrir dois sistemas reais, convém montar um modelo " +
        "abstrato que separe as preocupações e sirva de régua para comparar os dois. Esse " +
        "modelo não corresponde a nenhum produto, e é justamente por isso que ele mostra a " +
        "estrutura sem o ruído das decisões de implementação.</p>" +
        "<p>O serviço se divide em três componentes com responsabilidades bem estreitas. Um " +
        "cuida do conteúdo dos arquivos, outro cuida dos nomes, e o terceiro roda no cliente " +
        "e junta os dois numa interface parecida com a do sistema operacional local.</p>" +
        '<figure class="figura" id="fig-arquitetura-servico">' +
        '<svg viewBox="0 0 600 200" role="img" aria-labelledby="fig-arquitetura-titulo">' +
        '<title id="fig-arquitetura-titulo">No computador cliente, o programa aplicativo ' +
        "chama o módulo cliente. Do módulo cliente saem duas setas para o computador " +
        "servidor, uma para o serviço de diretório e outra para o serviço de arquivos " +
        "plano. Uma terceira seta liga o serviço de diretório ao serviço de arquivos plano, " +
        "porque o diretório é ele próprio um cliente do serviço plano.</title>" +
        '<rect class="caixa" x="16" y="20" width="240" height="44" rx="8"/>' +
        '<text x="136" y="48" text-anchor="middle" font-size="13">Programa aplicativo</text>' +
        '<path class="traco" d="M136 64 L136 82"/>' +
        '<path class="seta" d="M130 82 L142 82 L136 92 Z"/>' +
        '<rect class="caixa-destaque" x="16" y="94" width="240" height="44" rx="8"/>' +
        '<text x="136" y="122" text-anchor="middle" font-size="13">Módulo cliente</text>' +
        '<rect class="caixa" x="330" y="20" width="254" height="44" rx="8"/>' +
        '<text x="457" y="48" text-anchor="middle" font-size="13">Serviço de diretório</text>' +
        '<rect class="caixa" x="330" y="118" width="254" height="44" rx="8"/>' +
        '<text x="457" y="146" text-anchor="middle" font-size="13">Serviço de arquivos plano</text>' +
        '<path class="traco" d="M256 106 L292 106 L292 42 L318 42"/>' +
        '<path class="seta" d="M318 36 L318 48 L330 42 Z"/>' +
        '<path class="traco" d="M256 126 L292 126 L292 140 L318 140"/>' +
        '<path class="seta" d="M318 134 L318 146 L330 140 Z"/>' +
        '<path class="traco" d="M457 64 L457 106"/>' +
        '<path class="seta" d="M451 106 L463 106 L457 118 Z"/>' +
        '<text class="rotulo-secundario" x="465" y="92" font-size="11">usa o serviço plano</text>' +
        '<text class="rotulo-secundario" x="136" y="182" text-anchor="middle" ' +
        'font-size="12">computador cliente</text>' +
        '<text class="rotulo-secundario" x="457" y="182" text-anchor="middle" ' +
        'font-size="12">computador servidor</text>' +
        "</svg>" +
        '<p class="figura-fonte">Fonte: traduzido de Coulouris, Dollimore, Kindberg e Blair (2013).</p>' +
        "<figcaption>Os dois serviços do lado direito exportam interfaces de chamada " +
        "remota que ninguém usa diretamente. Quem as usa é o módulo cliente, e é ele que " +
        "oferece ao programa aplicativo a interface que o programa já conhece.</figcaption>" +
        "</figure>" +
        "<h3>O serviço de arquivos plano cuida só do conteúdo</h3>" +
        "<p>O primeiro componente implementa as operações sobre o conteúdo dos arquivos e " +
        "não sabe nada sobre nomes. Cada arquivo é referenciado por um <strong>identificador " +
        "único de arquivo</strong>, conhecido pela sigla UFID, que é uma longa sequência de " +
        "bits escolhida de modo que nenhum outro arquivo do sistema distribuído inteiro " +
        "tenha o mesmo valor. Quando um arquivo é criado, o serviço gera o UFID e o devolve " +
        "a quem pediu.</p>" +
        "<p>A interface tem seis operações. <code>Read</code> lê uma sequência de elementos " +
        "a partir de uma posição, <code>Write</code> escreve a partir de uma posição e " +
        "aumenta o arquivo se for preciso, <code>Create</code> cria um arquivo vazio e gera " +
        "o UFID dele, <code>Delete</code> remove o arquivo, e <code>GetAttributes</code> e " +
        "<code>SetAttributes</code> leem e alteram o registro de atributos, sem tocar nas " +
        "partes sombreadas que a seção 1 apresentou.</p>" +
        "<p>Vale mais reparar no que falta do que no que está lá. Não existe " +
        "<code>open</code> nem <code>close</code>, e a posição dentro do arquivo é " +
        "parâmetro explícito de cada leitura e de cada escrita. A interface do UNIX faz o " +
        "contrário nos dois pontos, porque abre o arquivo, guarda um ponteiro de leitura e " +
        "escrita e faz esse ponteiro avançar sozinho a cada operação.</p>" +
        "<p>A ausência é deliberada e o motivo é tolerância a falhas. O ponteiro de leitura " +
        "e escrita é uma variável de estado mantida <strong>por cliente</strong>, e ele " +
        "avança a cada operação. Se uma chamada ficar sem resposta e o cliente repeti-la, a " +
        "segunda execução vai ler ou escrever em outro trecho do arquivo, porque o ponteiro " +
        "já andou. A operação repetida produz um efeito diferente da primeira, e é essa a " +
        "definição de operação que não é idempotente.</p>" +
        "<p>Eliminando o ponteiro, todas as operações menos <code>Create</code> passam a ser " +
        "idempotentes, e as duas consequências da seção 1 aparecem de uma vez. O cliente " +
        "pode repetir chamadas sem resposta, com a semântica pelo menos uma vez, e o " +
        "servidor deixa de guardar informação em nome de clientes específicos, o que o torna " +
        "sem estado. O <code>Create</code> continua fora, porque criar duas vezes produz " +
        "dois arquivos diferentes, e não há como fingir o contrário.</p>" +
        "<h3>O serviço de diretório cuida só dos nomes</h3>" +
        "<p>O segundo componente faz a tradução de nome textual para UFID. A operação " +
        "central é <code>Lookup</code>, que recebe um diretório e um nome e devolve o " +
        "identificador correspondente. <code>AddName</code> e <code>UnName</code> inserem e " +
        "removem entradas, e <code>GetNames</code> lista os nomes de um diretório que " +
        "casam com um padrão, que é o que o shell do UNIX usa para expandir uma expressão " +
        "com asterisco.</p>" +
        "<p>Duas dessas operações mexem numa contagem que o registro de atributos guarda. " +
        "<code>AddName</code> incrementa a <strong>contagem de referência</strong> do " +
        "arquivo e <code>UnName</code> a decrementa, e o arquivo só é removido de fato " +
        "quando a contagem chega a zero. Daí sai de graça a possibilidade de um arquivo ter " +
        "vários nomes, em um diretório ou em vários, que é o vínculo do UNIX.</p>" +
        "<p>O detalhe mais elegante do modelo é que o serviço de diretório é ele próprio um " +
        "cliente do serviço de arquivos plano. Cada diretório é guardado como um arquivo " +
        "comum, com o seu UFID, e não como uma estrutura especial. A hierarquia inteira se " +
        "constrói a partir daí, porque a raiz é um diretório de UFID conhecido e um nome de " +
        "caminho se resolve <strong>passo a passo</strong>, com uma chamada de " +
        "<code>Lookup</code> para cada parte do caminho.</p>" +
        "<p>Guarde esse passo a passo, porque ele custa caro. A seção 3 vai mostrar que " +
        "quase metade das chamadas que um servidor NFS recebe são de resolução de nome, e " +
        "isso é consequência direta de resolver um caminho parte por parte em vez de " +
        "resolvê-lo de uma vez.</p>" +
        "<h3>O módulo cliente é a cola</h3>" +
        "<p>O terceiro componente roda em cada computador cliente e integra os dois " +
        "serviços numa interface de programação única, que imita a do sistema de arquivos " +
        "local. Numa máquina UNIX, ele simula o conjunto completo de chamadas de sistema, " +
        "interpretando nomes de arquivo por meio de requisições sucessivas ao serviço de " +
        "diretório.</p>" +
        "<p>Ele carrega mais duas responsabilidades que decidem o desempenho do serviço " +
        "inteiro. A primeira é saber em que máquina da rede cada serviço está. A segunda é " +
        "manter uma <strong>cache</strong> dos blocos de arquivo usados recentemente, que é " +
        "de onde vem a maior parte do ganho e também todo o desvio da cópia única.</p>" +
        "<p>O projeto é aberto, no sentido de que módulos clientes diferentes podem oferecer " +
        "interfaces de programação diferentes sobre os mesmos dois serviços. Um módulo " +
        "simula as chamadas do UNIX, outro pode simular as de outro sistema operacional, e " +
        "os servidores não precisam saber a diferença.</p>" +
        "<h3>Como conferir permissão sem guardar estado</h3>" +
        "<p>O controle de acesso é o lugar em que a decisão de manter o servidor sem estado " +
        "encontra a maior resistência. No UNIX local, os direitos são conferidos uma única " +
        "vez, na chamada <code>open</code>, e o resultado vale até o arquivo ser fechado. A " +
        "identidade do usuário vem de um login já autenticado e não pode ser forjada por um " +
        "programa comum.</p>" +
        "<p>Nas duas pontas a situação distribuída é pior. A interface de chamada remota do " +
        "servidor é um ponto de acesso desprotegido, no sentido de que qualquer processo " +
        "consegue enviar requisições a ela, e a identidade do usuário viaja dentro da " +
        "requisição, o que a torna forjável. E guardar no servidor o resultado de uma " +
        "verificação para reaproveitá-lo depois é exatamente o que faria dele um servidor " +
        "com estado.</p>" +
        "<p>Duas estratégias resolvem a segunda parte do problema sem abrir mão do servidor " +
        "sem estado. Uma confere o acesso no momento em que o nome vira UFID e devolve ao " +
        "cliente uma <strong>capacidade</strong>, no sentido do tópico 07, que ele " +
        "reapresenta nas requisições seguintes. A outra manda a identidade do usuário em " +
        "cada requisição e refaz a verificação a cada operação, e é ela que o NFS e o AFS " +
        "usam.</p>" +
        "<p>Nenhuma das duas resolve a primeira parte, que é a identidade forjada. Para " +
        "essa não existe truque de interface, e a resposta é autenticar, com assinatura " +
        "digital ou com um serviço de autenticação dedicado. Na prática os dois estudos de " +
        "caso terminaram integrando o Kerberos, que o tópico 07 detalhou.</p>" +
        "<h3>Grupos de arquivos, ou por que o identificador não é um endereço</h3>" +
        "<p>Falta uma peça para o serviço poder crescer, que é a unidade de movimentação. " +
        "Um <strong>grupo de arquivos</strong> é um conjunto de arquivos guardado em um " +
        "servidor, no papel que o <em>filesystem</em> do UNIX exerce. Um servidor pode " +
        "conter vários grupos, e grupos podem ser movidos entre servidores, mas um arquivo " +
        "nunca muda de grupo.</p>" +
        "<p>Para que o módulo cliente saiba a quem enviar a requisição, o UFID embute um " +
        "identificador do grupo de arquivos. Esse identificador precisa ser único em todo o " +
        "sistema distribuído, porque sistemas de arquivos que nasceram separados podem ser " +
        "combinados depois, e a maneira usual de garantir isso é gerá-lo por construção. " +
        "Concatenar o endereço IP de 32 bits da máquina que cria o grupo com um inteiro de " +
        "16 bits derivado da data produz um identificador de 48 bits que ninguém mais vai " +
        "repetir.</p>" +
        "<p>O detalhe que fecha a seção está no que esse endereço IP não serve para fazer. " +
        "Ele não localiza o grupo, porque o grupo pode ter sido movido para outro servidor " +
        "desde a criação. O IP entrou ali só para garantir unicidade, e quem responde onde o " +
        "grupo está agora é um mapeamento separado, mantido pelo serviço. Confundir " +
        "identificador com endereço é um dos erros mais caros em sistemas distribuídos, e o " +
        "tópico 09 volta a esse ponto com o serviço de nomes.</p>",
      slides: [
        {
          title: "Três componentes com responsabilidades estreitas",
          ref: "fig-arquitetura-servico",
          html:
            "<ul>" +
            "<li>Modelo abstrato que não é produto nenhum e serve de régua para os dois " +
            "estudos de caso</li>" +
            "</ul>"
        },
        {
          title: "Serviço de arquivos plano, e o que falta nele",
          html:
            "<ul>" +
            "<li>Referencia o arquivo pelo <strong>UFID</strong>, único em todo o sistema " +
            "distribuído</li>" +
            "<li>Seis operações, com a posição como parâmetro explícito</li>" +
            "<li>Não tem <code>open</code> nem <code>close</code>, porque o ponteiro do " +
            "UNIX é estado por cliente e avança sozinho</li>" +
            "<li>Sem ponteiro, tudo menos <code>Create</code> fica idempotente, e o " +
            "servidor pode ser sem estado</li>" +
            "</ul>"
        },
        {
          title: "Serviço de diretório e módulo cliente",
          html:
            "<ul>" +
            "<li><code>Lookup</code> traduz nome em UFID e é o bloco básico de tudo</li>" +
            "<li>A contagem de referência sustenta vários nomes para o mesmo arquivo</li>" +
            "<li>Diretório é arquivo comum, então a hierarquia nasce da raiz de UFID " +
            "conhecido, resolvida passo a passo</li>" +
            "<li>O módulo cliente imita o sistema local, sabe onde estão os servidores e " +
            "mantém a cache</li>" +
            "</ul>"
        },
        {
          title: "Acesso sem estado e identificador que não é endereço",
          html:
            "<ul>" +
            "<li>A interface remota é ponto aberto, e a identidade viaja na requisição, " +
            "logo é forjável</li>" +
            "<li>Duas saídas preservam o servidor sem estado, que são a capacidade e a " +
            "identidade em cada requisição</li>" +
            "<li>Identidade forjada só cai com autenticação, e os dois casos adotaram " +
            "Kerberos</li>" +
            "<li>O UFID embute o grupo de arquivos, e o IP dentro dele garante unicidade " +
            "sem localizar nada</li>" +
            "</ul>"
        }
      ]
    },
    {
      title: "NFS, o serviço de arquivos que virou produto",
      html:
        "<p>Vários serviços de arquivos distribuídos já existiam em universidades e " +
        "laboratórios quando a Sun apresentou o <strong>Network File System</strong>, " +
        "conhecido pela sigla NFS, em 1985. O que o distinguiu foi ter sido o primeiro " +
        "projetado como <strong>produto</strong>, e essa origem explica quase todas as " +
        "escolhas que vêm a seguir.</p>" +
        "<p>Para virar padrão, a definição das principais interfaces foi colocada em " +
        "domínio público e o código de uma implementação de referência foi licenciado a " +
        "outros fabricantes. A versão 3 do protocolo virou padrão da Internet, definida no " +
        "RFC 1813, e hoje existe implementação para praticamente qualquer sistema " +
        "operacional. A relação entre as pontas é <strong>simétrica</strong>, no sentido de " +
        "que qualquer computador pode exportar alguns arquivos e ser servidor, e ao mesmo " +
        "tempo acessar arquivos de outras máquinas e ser cliente.</p>" +
        "<p>O NFS segue de perto o modelo abstrato da seção anterior, e por isso boa parte " +
        "dele já está explicada. O que ainda não está é como a transparência de acesso é " +
        "obtida de verdade, dentro de um núcleo que já tinha o seu próprio sistema de " +
        "arquivos.</p>" +
        "<h3>O sistema de arquivos virtual, a peça que torna tudo possível</h3>" +
        "<p>A ideia por trás do NFS é que cada servidor ofereça uma <strong>visão " +
        "padronizada</strong> do sistema de arquivos local dele. Não deve importar como esse " +
        "sistema local foi implementado, porque todo servidor NFS oferece o mesmo modelo. É " +
        "isso que permite a um conjunto heterogêneo de máquinas, com sistemas operacionais " +
        "diferentes, compartilhar um sistema de arquivos comum.</p>" +
        "<p>Do lado do cliente, o programa continua fazendo chamadas de sistema normais. " +
        "Quem separa o pedido local do pedido remoto é o sistema de arquivos virtual, o VFS " +
        "que a seção 1 apresentou, acrescentado ao núcleo justamente para isso.</p>" +
        '<figure class="figura" id="fig-vfs">' +
        '<svg viewBox="0 0 600 226" role="img" aria-labelledby="fig-vfs-titulo">' +
        '<title id="fig-vfs-titulo">No computador cliente, o programa aplicativo chama a ' +
        "camada de chamadas de sistema, que fala com o sistema de arquivos virtual. Dele " +
        "saem dois caminhos, um para o sistema de arquivos local e outro para o cliente " +
        "NFS. O cliente NFS conversa pela rede com o servidor NFS, que fica no computador " +
        "servidor. No servidor o caminho sobe, do servidor NFS para o sistema de arquivos " +
        "virtual e daí para o sistema de arquivos local, onde os arquivos de fato " +
        "estão.</title>" +
        '<rect class="caixa" x="12" y="10" width="264" height="34" rx="8"/>' +
        '<text x="144" y="32" text-anchor="middle" font-size="13">Programa aplicativo</text>' +
        '<rect class="caixa" x="12" y="48" width="264" height="34" rx="8"/>' +
        '<text x="144" y="70" text-anchor="middle" font-size="13">Chamadas de sistema</text>' +
        '<rect class="caixa-destaque" x="12" y="86" width="264" height="34" rx="8"/>' +
        '<text x="144" y="108" text-anchor="middle" font-size="13">Sistema de arquivos virtual</text>' +
        '<rect class="caixa" x="12" y="124" width="126" height="44" rx="8"/>' +
        '<text x="75" y="145" text-anchor="middle" font-size="12">Sistema de</text>' +
        '<text x="75" y="161" text-anchor="middle" font-size="12">arquivos local</text>' +
        '<rect class="caixa-destaque" x="150" y="124" width="126" height="44" rx="8"/>' +
        '<text x="213" y="151" text-anchor="middle" font-size="13">Cliente NFS</text>' +
        '<rect class="caixa" x="324" y="48" width="264" height="34" rx="8"/>' +
        '<text x="456" y="70" text-anchor="middle" font-size="13">Sistema de arquivos local</text>' +
        '<rect class="caixa-destaque" x="324" y="86" width="264" height="34" rx="8"/>' +
        '<text x="456" y="108" text-anchor="middle" font-size="13">Sistema de arquivos virtual</text>' +
        '<rect class="caixa-destaque" x="324" y="124" width="264" height="44" rx="8"/>' +
        '<text x="456" y="151" text-anchor="middle" font-size="13">Servidor NFS</text>' +
        '<path class="traco" d="M276 146 L324 146"/>' +
        '<path class="seta" d="M312 140 L312 152 L324 146 Z"/>' +
        '<path class="seta" d="M288 140 L288 152 L276 146 Z"/>' +
        '<text class="rotulo-secundario" x="300" y="186" text-anchor="middle" ' +
        'font-size="12">protocolo NFS</text>' +
        '<text class="rotulo-secundario" x="144" y="212" text-anchor="middle" ' +
        'font-size="12">computador cliente</text>' +
        '<text class="rotulo-secundario" x="456" y="212" text-anchor="middle" ' +
        'font-size="12">computador servidor</text>' +
        "</svg>" +
        '<p class="figura-fonte">Fonte: traduzido de Van Steen e Tanenbaum (2023).</p>' +
        "<figcaption>O caminho desce no cliente, atravessa a rede e sobe no servidor. As " +
        "duas camadas de sistema de arquivos virtual são o que permite trocar o sistema de " +
        "arquivos local de qualquer uma das pontas sem tocar no protocolo.</figcaption>" +
        "</figure>" +
        "<p>A vantagem desse arranjo é maior do que parece. Como o servidor converte as " +
        "requisições que chegam em operações comuns do sistema de arquivos virtual, não " +
        "importa se o sistema local de uma ponta é o do UNIX e o da outra é o do Windows. " +
        "A única exigência é que o sistema local consiga representar o modelo de arquivo " +
        "que o NFS define, e é aí que aparece o limite real. Um sistema com nomes de " +
        "arquivo curtos demais, como o antigo MS-DOS, não consegue implementar um servidor " +
        "NFS de forma totalmente transparente.</p>" +
        "<p>A camada de sistema de arquivos virtual guarda duas estruturas para conseguir " +
        "esse malabarismo. Uma <strong>estrutura VFS</strong> existe para cada sistema de " +
        "arquivos montado e liga um sistema remoto ao diretório local em que ele foi " +
        "montado. Um <strong>v-node</strong> existe para cada arquivo aberto e diz se aquele " +
        "arquivo é local ou remoto. Se for local, o v-node aponta para o índice do arquivo " +
        "no disco, que na implementação UNIX é o i-node. Se for remoto, ele guarda o " +
        "manipulador de arquivo.</p>" +
        "<h3>O manipulador de arquivo é o UFID do NFS</h3>" +
        "<p>O <strong>manipulador de arquivo</strong> (<em>file handle</em>) desempenha o " +
        "papel que o UFID desempenhava no modelo abstrato, e tem uma propriedade que vale " +
        "sublinhar. Ele é <strong>opaco</strong> para o cliente, quer dizer, o cliente o " +
        "guarda e o devolve nas requisições seguintes sem nunca interpretar o conteúdo. O " +
        "tamanho cresceu com as versões, de 32 bytes na versão 2 para até 128 bytes na " +
        "versão 4.</p>" +
        "<p>Na implementação UNIX ele junta três campos, que são o identificador do sistema " +
        "de arquivos, o i-node do arquivo e um número de geração. Os dois primeiros " +
        "localizam o arquivo, e o terceiro existe por um motivo específico. O UNIX reutiliza " +
        "i-nodes depois que um arquivo é removido, então um cliente que guardou um " +
        "manipulador antigo poderia, sem o número de geração, acabar acessando o arquivo " +
        "errado. Cada reutilização incrementa esse número, e o manipulador antigo passa a " +
        "não casar com nada.</p>" +
        "<p>Duas exigências decorrem disso e valem para qualquer implementação. Enquanto o " +
        "arquivo existir, ele deve manter um único manipulador, o que permite ao cliente " +
        "guardá-lo e evitar resolver o nome de novo antes de cada operação. E o servidor " +
        "não pode reaproveitar um manipulador depois de apagar um arquivo, que é a versão " +
        "geral do problema que o número de geração resolve no UNIX.</p>" +
        "<h3>Um servidor que não lembra de ninguém</h3>" +
        "<p>Cliente e servidor conversam por chamada de procedimento remoto, e o sistema de " +
        "chamada remota da Sun foi desenvolvido justamente para o NFS. Ele roda sobre UDP " +
        "ou sobre TCP, à escolha da instalação. As operações do protocolo são quase as " +
        "mesmas do modelo abstrato, com <code>read</code>, <code>write</code>, " +
        "<code>getattr</code> e <code>setattr</code> repetindo as do serviço de arquivos " +
        "plano, e <code>lookup</code>, <code>create</code>, <code>rename</code>, " +
        "<code>mkdir</code> e <code>readdir</code> repetindo as do serviço de diretório.</p>" +
        "<p>A diferença de arrumação é que o NFS integra os dois serviços num só. Criar um " +
        "arquivo e inserir o nome dele num diretório acontece numa única operação " +
        "<code>create</code>, que recebe o nome textual e o manipulador do diretório de " +
        "destino.</p>" +
        "<p>O servidor é <strong>sem estado</strong> e não mantém arquivos abertos em nome " +
        "de ninguém. A consequência prática é que ele precisa reconferir a identidade do " +
        "usuário contra os atributos de permissão do arquivo <strong>a cada " +
        "requisição</strong>, e o sistema de chamada remota da Sun anexa automaticamente a " +
        "identificação de usuário e de grupo a toda chamada.</p>" +
        "<p>Na forma original isso deixava uma brecha grande. O servidor oferece uma " +
        "interface de chamada remota numa porta conhecida, qualquer processo pode se " +
        "comportar como cliente, e nada impedia que um cliente montasse a chamada com a " +
        "identificação de outro usuário. A brecha foi fechada em duas etapas, primeiro com " +
        "a cifragem das informações de autenticação e depois com a integração do " +
        "Kerberos.</p>" +
        "<p>A kerberização escolheu um meio-termo que vale conhecer, porque mostra o custo " +
        "de manter o servidor sem estado. A solução óbvia seria mandar um tíquete e um " +
        "autenticador completos em cada requisição, e ela foi descartada por ser cara " +
        "demais em tempo de cifragem. O que se faz é autenticar pelo Kerberos no momento da " +
        "montagem, guardar no servidor a identificação do usuário e o endereço do cliente " +
        "junto das informações daquela montagem, e conferir esses dois valores a cada " +
        "requisição de arquivo. O servidor continua sem guardar estado sobre processos, " +
        "embora guarde as montagens vigentes de cada máquina cliente.</p>" +
        "<h3>Montagem, ou por que o mesmo arquivo tem nomes diferentes</h3>" +
        "<p>O NFS não impõe um espaço de nomes único a toda a rede. Um servidor " +
        "<strong>exporta</strong> subárvores, listadas num arquivo de nome conhecido, o " +
        "<code>/etc/exports</code>, que também diz quais máquinas podem montar cada uma. Um " +
        "cliente pede a montagem a um serviço de montagem que roda no servidor e recebe de " +
        "volta o manipulador do diretório exportado.</p>" +
        "<p>O ponto de montagem, porém, é escolhido pelo cliente. É essa decisão de projeto, " +
        "e não um descuido, que produz a consequência mais estranha do NFS.</p>" +
        '<figure class="figura" id="fig-montagem">' +
        '<svg viewBox="0 0 600 180" role="img" aria-labelledby="fig-montagem-titulo">' +
        '<title id="fig-montagem-titulo">Três árvores lado a lado. No centro, o servidor ' +
        "tem o diretório users, dentro dele steen, e dentro de steen o arquivo mbox. O " +
        "diretório steen é exportado. À esquerda, o cliente A montou esse diretório em " +
        "remote, sob o nome vu, então o arquivo se chama barra remote barra vu barra mbox. " +
        "À direita, o cliente B montou o mesmo diretório em work, sob o nome me, então o " +
        "mesmo arquivo se chama barra work barra me barra mbox.</title>" +
        '<text x="100" y="20" text-anchor="middle" font-size="13">Cliente A</text>' +
        '<text x="300" y="20" text-anchor="middle" font-size="13">Servidor</text>' +
        '<text x="500" y="20" text-anchor="middle" font-size="13">Cliente B</text>' +
        '<rect class="caixa" x="45" y="34" width="110" height="26" rx="6"/>' +
        '<text x="100" y="52" text-anchor="middle" font-size="12">remote</text>' +
        '<path class="traco" d="M100 60 L100 72"/>' +
        '<rect class="caixa-destaque" x="45" y="72" width="110" height="26" rx="6"/>' +
        '<text x="100" y="90" text-anchor="middle" font-size="12">vu</text>' +
        '<path class="traco" d="M100 98 L100 110"/>' +
        '<rect class="caixa" x="45" y="110" width="110" height="26" rx="6"/>' +
        '<text x="100" y="128" text-anchor="middle" font-size="12">mbox</text>' +
        '<rect class="caixa" x="245" y="34" width="110" height="26" rx="6"/>' +
        '<text x="300" y="52" text-anchor="middle" font-size="12">users</text>' +
        '<path class="traco" d="M300 60 L300 72"/>' +
        '<rect class="caixa-destaque" x="245" y="72" width="110" height="26" rx="6"/>' +
        '<text x="300" y="90" text-anchor="middle" font-size="12">steen</text>' +
        '<path class="traco" d="M300 98 L300 110"/>' +
        '<rect class="caixa" x="245" y="110" width="110" height="26" rx="6"/>' +
        '<text x="300" y="128" text-anchor="middle" font-size="12">mbox</text>' +
        '<rect class="caixa" x="445" y="34" width="110" height="26" rx="6"/>' +
        '<text x="500" y="52" text-anchor="middle" font-size="12">work</text>' +
        '<path class="traco" d="M500 60 L500 72"/>' +
        '<rect class="caixa-destaque" x="445" y="72" width="110" height="26" rx="6"/>' +
        '<text x="500" y="90" text-anchor="middle" font-size="12">me</text>' +
        '<path class="traco" d="M500 98 L500 110"/>' +
        '<rect class="caixa" x="445" y="110" width="110" height="26" rx="6"/>' +
        '<text x="500" y="128" text-anchor="middle" font-size="12">mbox</text>' +
        '<path class="traco" stroke-dasharray="4 4" d="M245 85 L155 85"/>' +
        '<path class="traco" stroke-dasharray="4 4" d="M355 85 L445 85"/>' +
        '<text class="rotulo-secundario" x="200" y="78" text-anchor="middle" ' +
        'font-size="11">monta</text>' +
        '<text class="rotulo-secundario" x="400" y="78" text-anchor="middle" ' +
        'font-size="11">monta</text>' +
        '<text class="rotulo-secundario" x="100" y="158" text-anchor="middle" ' +
        'font-size="12">/remote/vu/mbox</text>' +
        '<text class="rotulo-secundario" x="300" y="158" text-anchor="middle" ' +
        'font-size="12">/users/steen/mbox</text>' +
        '<text class="rotulo-secundario" x="500" y="158" text-anchor="middle" ' +
        'font-size="12">/work/me/mbox</text>' +
        "</svg>" +
        '<p class="figura-fonte">Fonte: traduzido de Van Steen e Tanenbaum (2023).</p>' +
        "<figcaption>O mesmo arquivo, três nomes. Como cada cliente escolhe onde pendurar " +
        "o diretório exportado, o nome de caminho descreve a organização daquele cliente e " +
        "não a do sistema.</figcaption>" +
        "</figure>" +
        "<p>A consequência incomoda mais do que se imagina. Alice não consegue falar de um " +
        "arquivo para Bob usando o nome que ela vê, porque aquele nome pode significar outra " +
        "coisa no espaço de nomes dele, ou coisa nenhuma. Compartilhar arquivo, que era o " +
        "objetivo do serviço, fica mais difícil justamente por causa da flexibilidade da " +
        "montagem.</p>" +
        "<p>A saída usual é combinar. Dá-se a cada cliente um espaço de nomes " +
        "<strong>parcialmente padronizado</strong>, com convenções de instalação que " +
        "reservam certos diretórios para certas montagens. A transparência de localização " +
        "existe no NFS, mas ela é fruto de tabelas de configuração combinadas entre os " +
        "administradores, e não uma garantia do protocolo.</p>" +
        "<p>Há ainda uma restrição que parece arbitrária e não é. Um servidor NFS pode " +
        "montar diretórios exportados por outros servidores, mas não pode reexportá-los aos " +
        "clientes dele. O motivo está no manipulador de arquivo, que identifica um arquivo " +
        "dentro de um sistema de arquivos e não carrega identificador de servidor. Para " +
        "atender o cliente, o servidor intermediário teria que devolver um manipulador " +
        "apontando para a terceira máquina, e o NFS não sabe representar isso. O cliente " +
        "precisa montar direto do servidor que guarda os arquivos.</p>" +
        "<h3>Resolver um nome custa uma viagem por parte</h3>" +
        "<p>A tradução de nomes de caminho é iterativa, e o cliente é quem a conduz. A razão " +
        "é a mesma montagem descrita acima, porque um nome de caminho pode cruzar um ponto " +
        "de montagem que só existe no cliente, e as partes seguintes do nome podem morar em " +
        "servidores diferentes. Nenhum servidor tem informação para resolver o caminho " +
        "inteiro.</p>" +
        "<p>Cada parte do nome vira uma chamada <code>lookup</code> separada, que devolve o " +
        "manipulador e os atributos daquele nível. Como o manipulador é opaco, quem descobre " +
        "se ele aponta para um diretório local ou remoto é o sistema de arquivos virtual do " +
        "cliente. O custo aparece nas medições, e a operação <code>lookup</code> chega a " +
        "responder por quase metade das chamadas que um servidor recebe. O que torna isso " +
        "suportável é a cache dos resultados de cada passo, que se apoia no fato de usuários " +
        "e programas acessarem arquivos em poucos diretórios.</p>" +
        "<p>A versão 4 do protocolo, de 2000, atacou esses pontos. Ela permite passar o " +
        "caminho completo e pedir que o servidor o resolva, permite que o " +
        "<code>lookup</code> cruze um ponto de montagem no próprio servidor, devolvendo o " +
        "manipulador do diretório montado em vez do original, e substitui o protocolo de " +
        "montagem separado por uma operação <code>putrootfh</code>, que manda o servidor " +
        "resolver nomes a partir da raiz do sistema de arquivos dele. Montar deixa de ser um " +
        "protocolo à parte e vira parte da resolução de nomes.</p>" +
        "<h3>Montagem incondicional, condicional e automática</h3>" +
        "<p>Ao montar, o cliente escolhe o que deve acontecer quando o servidor não " +
        "responde. Na <strong>montagem incondicional</strong>, o processo que acessa o " +
        "arquivo fica suspenso e o módulo cliente tenta de novo até conseguir, o que faz o " +
        "programa retomar sozinho quando o servidor volta. Na <strong>montagem " +
        "condicional</strong>, o módulo devolve um erro depois de poucas tentativas.</p>" +
        "<p>A segunda parece melhor e quase ninguém a usa, por uma razão desconfortável. " +
        "Muitos utilitários do UNIX nunca testam falha em acesso a arquivo, então eles se " +
        "comportam de maneira imprevisível quando o erro chega. A maioria das instalações " +
        "prefere a montagem incondicional, e com isso abre mão de programas que se recuperam " +
        "de uma indisponibilidade longa.</p>" +
        "<p>A <strong>montagem automática</strong> resolve outro problema, que é decidir " +
        "quando montar. Um processo próprio se comporta como um servidor NFS local e mantém " +
        "uma tabela de pontos de montagem, cada um associado a um ou mais servidores. Quando " +
        "o cliente tenta resolver um nome que passa por um desses pontos, o processo procura " +
        "na tabela, manda uma sondagem a cada servidor listado e monta o primeiro que " +
        "responder.</p>" +
        "<p>Repare no efeito colateral dessa sondagem. Se vários servidores tiverem cópias " +
        "idênticas de um sistema de arquivos só de leitura, como os binários do sistema, a " +
        "montagem automática entrega de graça uma forma limitada de replicação, de " +
        "balanceamento de carga e de tolerância a falhas. O primeiro a responder é " +
        "necessariamente um que não caiu e provavelmente um que não está ocupado.</p>" +
        "<h3>A cache, onde o desvio da cópia única mora</h3>" +
        "<p>Sem cache o NFS não teria desempenho aceitável, e é da cache que vem todo o " +
        "afastamento da semântica de cópia única. Vale separar a cache do servidor da cache " +
        "do cliente, porque elas resolvem problemas diferentes.</p>" +
        "<p>No <strong>servidor</strong>, guardar blocos lidos há pouco não cria problema " +
        "nenhum de consistência. A escrita é que exige cuidado, e a versão 3 do protocolo " +
        "oferece duas opções. Na <strong>escrita direta</strong> (<em>write-through</em>), o " +
        "dado vai para o disco antes de a resposta ser enviada, e o cliente tem certeza da " +
        "persistência assim que recebe a resposta. Na outra opção, o dado fica só na cache " +
        "de memória e vai ao disco quando chega uma operação <code>commit</code>, que os " +
        "clientes padrão executam ao fechar o arquivo. A segunda existe para resolver o " +
        "gargalo que a primeira criava em servidores com muita escrita.</p>" +
        "<p>No <strong>cliente</strong>, a cache guarda resultados de leitura, de escrita, " +
        "de consulta a atributos e de listagem de diretório. Como as escritas de um cliente " +
        "não atualizam a cópia que outro cliente tem, cabe a cada cliente conferir se o que " +
        "ele guardou ainda vale. A conferência usa dois carimbos de tempo por bloco, " +
        "<strong>T<sub>c</sub></strong> para o instante da última validação e " +
        "<strong>T<sub>m</sub></strong> para o instante da última modificação no servidor.</p>" +
        "<p>Um bloco é considerado válido no instante T se T menos T<sub>c</sub> for menor " +
        "que um intervalo de atualização t, ou se o T<sub>m</sub> que o cliente guardou for " +
        "igual ao T<sub>m</sub> do servidor. A ordem das duas metades é a parte esperta, " +
        "porque a primeira se avalia sem tocar no servidor, e só quando ela falha o cliente " +
        "gasta uma chamada <code>getattr</code> para comparar a segunda.</p>" +
        "<p>O intervalo t é o botão que regula a troca entre consistência e tráfego. Um t " +
        "pequeno aproxima a cópia única e enche o servidor de chamadas de conferência, e um " +
        "t grande alivia o servidor e deixa o cliente ver dados velhos por mais tempo. Os " +
        "clientes Solaris o ajustam de forma adaptativa, entre 3 e 30 segundos para " +
        "arquivos, conforme a frequência de atualização, e entre 30 e 60 segundos para " +
        "diretórios, que correm menos risco de atualização concorrente.</p>" +
        "<p>Três medidas reduzem ainda mais o tráfego de conferência. Um T<sub>m</sub> novo " +
        "vale para todas as entradas de cache daquele arquivo, os atributos correntes " +
        "viajam a tiracolo na resposta de qualquer operação sobre o arquivo, e o próprio " +
        "algoritmo adaptativo do parágrafo anterior corta a maior parte das chamadas. Do " +
        "lado da escrita, processos auxiliares chamados <strong>bio-daemon</strong> fazem " +
        "leitura antecipada e escrita postergada de forma assíncrona, para que o módulo " +
        "cliente não fique bloqueado esperando a rede.</p>" +
        "<h3>Como o NFS se sai</h3>" +
        "<p>Com todas as peças na mesa, dá para avaliar o NFS requisito a requisito, usando " +
        "a mesma lista da seção 1. A tabela abaixo é o balanço, e o que ela revela é que as " +
        "notas baixas não são descuido, e sim o preço das escolhas que produziram as notas " +
        "altas.</p>" +
        '<div class="tabela-rolagem">' +
        '<table class="tabela-conteudo" id="tab-avaliacao-nfs">' +
        "<tr><th>Requisito</th><th>Como o NFS se sai</th></tr>" +
        "<tr><td>Transparência de acesso</td><td>Entrega por completo, porque o módulo " +
        "cliente oferece a mesma interface do sistema local e nenhum programa precisa ser " +
        "alterado.</td></tr>" +
        "<tr><td>Transparência de localização</td><td>Depende de as tabelas de montagem " +
        "serem combinadas entre os clientes, já que o protocolo não impõe um espaço de " +
        "nomes único.</td></tr>" +
        "<tr><td>Transparência de mobilidade</td><td>Fica incompleta, porque mover um " +
        "sistema de arquivos obriga a atualizar a tabela de montagem de cada cliente " +
        "separadamente.</td></tr>" +
        "<tr><td>Escalabilidade</td><td>Vai longe, com servidores medidos de 12 mil a 300 " +
        "mil operações por segundo, e esbarra em arquivos muito procurados, que concentram " +
        "carga num servidor só.</td></tr>" +
        "<tr><td>Replicação</td><td>Cobre apenas o caso de leitura, por meio da sondagem da " +
        "montagem automática, e não replica arquivos que são atualizados.</td></tr>" +
        "<tr><td>Tolerância a falhas</td><td>Vem de graça do servidor sem estado com " +
        "operações idempotentes, e o cliente apenas espera e retoma quando o servidor " +
        "volta.</td></tr>" +
        "<tr><td>Consistência</td><td>Aproxima bem a cópia única e atende à maioria dos " +
        "programas, mas não serve para coordenar processos que rodam em máquinas " +
        "diferentes.</td></tr>" +
        "</table>" +
        "</div>" +
        "<p>A última linha merece uma leitura devagar. Dizer que o NFS não serve para " +
        "coordenar processos em máquinas diferentes não é um defeito escondido, é a " +
        "definição do que ele oferece. Quem precisa que dois processos vejam a mesma escrita " +
        "no mesmo instante precisa de outra coisa, e essa outra coisa é assunto do tópico de " +
        "replicação.</p>",
      slides: [
        {
          title: "NFS, o primeiro serviço de arquivos como produto",
          html:
            "<ul>" +
            "<li>Sun, 1985, com interfaces em domínio público e a versão 3 virando padrão " +
            "da Internet</li>" +
            "<li>A relação é <strong>simétrica</strong>, pois a mesma máquina exporta e " +
            "consome</li>" +
            "<li>Cada servidor oferece uma visão padronizada do sistema de arquivos local " +
            "dele</li>" +
            "<li>Segue de perto o modelo abstrato da seção 2</li>" +
            "</ul>"
        },
        {
          title: "O sistema de arquivos virtual sustenta a transparência",
          ref: "fig-vfs",
          html:
            "<ul>" +
            "<li>Desce no cliente, atravessa a rede e sobe no servidor</li>" +
            "<li>Trocar o sistema local de qualquer ponta não mexe no protocolo</li>" +
            "</ul>"
        },
        {
          title: "Manipulador de arquivo e servidor sem estado",
          html:
            "<ul>" +
            "<li>O manipulador é <strong>opaco</strong>, e o cliente o guarda sem " +
            "interpretar</li>" +
            "<li>Identificador do sistema de arquivos, i-node e número de geração, que " +
            "impede acertar o arquivo errado após reúso</li>" +
            "<li>Sem estado, o servidor reconfere a identidade a cada requisição</li>" +
            "<li>A identidade em claro era brecha, e o Kerberos autentica na montagem e " +
            "confere usuário e endereço depois</li>" +
            "</ul>"
        },
        {
          title: "Montar é do cliente, e por isso o nome muda",
          ref: "fig-montagem",
          html:
            "<ul>" +
            "<li>Alice não consegue citar um arquivo pelo nome que ela vê</li>" +
            "<li>A saída é combinar convenções entre os clientes</li>" +
            "</ul>"
        },
        {
          title: "A cache e o botão que regula a consistência",
          html:
            "<ul>" +
            "<li>No servidor, a escrita escolhe entre escrita direta e confirmação por " +
            "<code>commit</code></li>" +
            "<li>No cliente, T<sub>c</sub> e T<sub>m</sub> validam o bloco, e a primeira " +
            "metade do teste não toca no servidor</li>" +
            "<li>O intervalo <strong>t</strong> troca consistência por tráfego, e o " +
            "Solaris o ajusta entre 3 e 30 segundos</li>" +
            "<li>Resolver nome passo a passo responde por quase metade das chamadas ao " +
            "servidor</li>" +
            "</ul>"
        },
        {
          title: "O balanço do NFS",
          ref: "tab-avaliacao-nfs"
        }
      ]
    },
    {
      title: "AFS, escala por cache de arquivo inteiro",
      html:
        "<p>O <strong>Andrew File System</strong>, conhecido pela sigla AFS, nasceu na " +
        "Carnegie Mellon para servir de sistema de arquivos do campus inteiro. Ele atende " +
        "às mesmas primitivas do UNIX que o NFS atende, e programas existentes rodam sobre " +
        "ele sem alteração e sem recompilação. Toda a diferença vem de qual requisito foi " +
        "posto em primeiro lugar.</p>" +
        "<p>No AFS esse requisito é a <strong>escalabilidade</strong>, no sentido de " +
        "funcionar bem com um número de usuários ativos bem maior que o dos concorrentes. A " +
        "aposta para conseguir isso é minimizar a conversa entre cliente e servidor, e a " +
        "forma escolhida foi guardar <strong>arquivos inteiros</strong> na cache em disco do " +
        "cliente. É o modelo de carregar e descarregar que a seção 1 apresentou, levado a " +
        "sério.</p>" +
        "<p>Duas características de projeto decorrem daí e não têm equivalente no NFS. O " +
        "servidor transmite o conteúdo inteiro do arquivo, e não blocos sob demanda, ainda " +
        "que a versão 3 do AFS tenha passado a transferir em porções de 64 KB. E o cliente " +
        "guarda a cópia no <strong>disco local</strong>, e não na memória, o que faz a cache " +
        "sobreviver a uma reinicialização e atender às próximas aberturas sem tocar no " +
        "servidor.</p>" +
        "<h3>O que acontece quando o programa abre um arquivo</h3>" +
        "<p>O ciclo completo cabe em quatro passos. Quando um processo executa " +
        "<code>open</code> num arquivo do espaço compartilhado e não há cópia atual na cache " +
        "local, o AFS localiza o servidor que guarda o arquivo e pede uma cópia. Essa cópia " +
        "é gravada no sistema de arquivos local, aberta ali mesmo, e o descritor de arquivo " +
        "resultante é devolvido ao programa.</p>" +
        "<p>A partir daí, as leituras e escritas acontecem <strong>só na cópia local</strong>, " +
        "sem que o servidor participe. Quando o processo executa <code>close</code>, o " +
        "conteúdo volta ao servidor se tiver sido alterado, e a cópia permanece no disco do " +
        "cliente para o caso de ser necessária de novo.</p>" +
        "<p>A pergunta natural é como uma aposta tão radical pode dar certo, e a resposta " +
        "vem de medição e não de intuição. O projeto se apoia em observações de cargas reais " +
        "de trabalho em UNIX, feitas em ambientes acadêmicos e em outros.</p>" +
        "<ul>" +
        "<li>Os arquivos são pequenos, e a maioria não passa de 10 KB, então transferir o " +
        "arquivo inteiro raramente é caro.</li>" +
        "<li>As leituras superam as escritas por volta de seis vezes, então a cópia local " +
        "costuma servir muitas vezes antes de precisar voltar.</li>" +
        "<li>O acesso sequencial é comum e o acesso aleatório é raro, o que combina com " +
        "transferir tudo de uma vez.</li>" +
        "<li>A maioria dos arquivos é lida e escrita por um único usuário, e quando há " +
        "compartilhamento normalmente só um usuário modifica.</li>" +
        "<li>Vale a localidade temporal, porque um arquivo referenciado há pouco tem grande " +
        "chance de ser referenciado de novo em breve.</li>" +
        "</ul>" +
        "<p>Repare que essas observações descrevem uma carga de trabalho, e não uma lei. Há " +
        "um tipo de arquivo que não se encaixa em nenhuma delas, que é o banco de dados, " +
        "compartilhado por muita gente e atualizado o tempo todo. Os projetistas do AFS " +
        "excluíram bancos de dados dos objetivos de forma explícita, argumentando que a " +
        "granularidade fina, o controle de concorrência e a atomicidade que eles exigem " +
        "precisam ser tratados à parte. Delimitar o que o sistema não vai atender é uma " +
        "decisão de projeto tão importante quanto escolher o que ele atende.</p>" +
        "<h3>Vice, Venus, volumes e fids</h3>" +
        "<p>O AFS é implementado por dois programas que rodam em nível de usuário. O " +
        "<strong>Vice</strong> é o servidor, e o <strong>Venus</strong> roda em cada cliente " +
        "e exerce o papel do módulo cliente do modelo abstrato. O núcleo do UNIX recebe uma " +
        "única modificação, que é interceptar as chamadas <code>open</code> e " +
        "<code>close</code> quando elas se referem ao espaço de nomes compartilhado e " +
        "entregá-las ao Venus.</p>" +
        "<p>O espaço de nomes que o usuário vê separa o que é local do que é compartilhado. " +
        "Uma subárvore concentra todos os arquivos compartilhados, e os arquivos locais " +
        "servem só para arquivos temporários e para o que a estação precisa antes de " +
        "conseguir falar com a rede. Os diretórios dos usuários ficam do lado compartilhado, " +
        "que é o que permite a alguém sentar em qualquer estação e reencontrar o que é " +
        "seu.</p>" +
        "<p>Cada arquivo e diretório do espaço compartilhado tem um identificador de 96 " +
        "bits, o <strong>fid</strong>, que faz o papel do UFID. Ele junta o número do volume " +
        "que contém o arquivo, um manipulador que identifica o arquivo dentro do volume e um " +
        "elemento de exclusividade, que existe para que identificadores não sejam " +
        "reutilizados. O Venus traduz nomes de caminho em fids, passo a passo, e o Vice só " +
        "aceita requisições em termos de fid.</p>" +
        "<p>O <strong>volume</strong> é a unidade de agrupamento, de localização e de " +
        "movimentação, no papel que o grupo de arquivos exercia no modelo abstrato. A " +
        "diferença de tamanho em relação ao NFS é deliberada, porque um volume costuma ser " +
        "bem menor que um sistema de arquivos do UNIX, tipicamente um por usuário. Um banco " +
        "de dados de localização replicado em todos os servidores diz em qual servidor cada " +
        "volume está, e imprecisões temporárias durante uma mudança são inofensivas, porque " +
        "o servidor de origem deixa para trás a informação de encaminhamento.</p>" +
        "<h3>A promessa de callback inverte quem fala</h3>" +
        "<p>Chegamos à ideia que dá ao AFS a escalabilidade dele. Quando o Vice entrega uma " +
        "cópia a um Venus, ele entrega junto uma <strong>promessa de callback</strong>, que " +
        "é um tíquete garantindo que o servidor avisará aquele cliente se outro cliente " +
        "modificar o arquivo. O tíquete é guardado no disco, ao lado da cópia, e tem dois " +
        "estados possíveis, válido ou cancelado.</p>" +
        "<p>Quando alguém fecha o arquivo depois de alterá-lo, o Vice dispara um " +
        "<strong>callback</strong> para cada Venus que detém uma promessa daquele arquivo. " +
        "O callback é uma chamada de procedimento remoto feita <strong>do servidor para o " +
        "cliente</strong>, e o Venus que a recebe marca o tíquete como cancelado.</p>" +
        "<p>O ganho aparece no <code>open</code> seguinte. Se o tíquete estiver válido, o " +
        "Venus abre a cópia local sem nenhuma ida à rede, e só busca cópia nova quando o " +
        "tíquete está cancelado. Compare com o NFS, em que o cliente pergunta " +
        "periodicamente ao servidor se o que ele tem ainda vale.</p>" +
        '<figure class="figura" id="fig-callback">' +
        '<svg viewBox="0 0 600 210" role="img" aria-labelledby="fig-callback-titulo">' +
        '<title id="fig-callback-titulo">Dois painéis. No painel da esquerda, sobre o ' +
        "NFS, uma seta desce do cliente para o servidor levando a chamada getattr e outra " +
        "sobe trazendo o carimbo de tempo, e isso se repete a cada validação mesmo quando " +
        "nada mudou. No painel da direita, sobre o AFS, existe uma seta só, que sobe do " +
        "servidor para o cliente levando o callback, e ela só acontece quando outro cliente " +
        "altera o arquivo.</title>" +
        '<text x="150" y="18" text-anchor="middle" font-size="13">No NFS, o cliente pergunta</text>' +
        '<rect class="caixa" x="60" y="30" width="180" height="36" rx="8"/>' +
        '<text x="150" y="54" text-anchor="middle" font-size="13">Cliente</text>' +
        '<rect class="caixa" x="60" y="140" width="180" height="36" rx="8"/>' +
        '<text x="150" y="164" text-anchor="middle" font-size="13">Servidor</text>' +
        '<path class="traco" d="M110 66 L110 130"/>' +
        '<path class="seta" d="M104 130 L116 130 L110 140 Z"/>' +
        '<text class="rotulo-secundario" x="102" y="104" text-anchor="end" ' +
        'font-size="11">getattr</text>' +
        '<path class="traco" d="M190 140 L190 76"/>' +
        '<path class="seta" d="M184 76 L196 76 L190 66 Z"/>' +
        '<text class="rotulo-secundario" x="198" y="104" font-size="11">carimbo</text>' +
        '<text class="rotulo-secundario" x="150" y="198" text-anchor="middle" ' +
        'font-size="11">a cada validação, mesmo sem mudança</text>' +
        '<text x="450" y="18" text-anchor="middle" font-size="13">No AFS, o servidor avisa</text>' +
        '<rect class="caixa" x="360" y="30" width="180" height="36" rx="8"/>' +
        '<text x="450" y="54" text-anchor="middle" font-size="13">Cliente</text>' +
        '<rect class="caixa" x="360" y="140" width="180" height="36" rx="8"/>' +
        '<text x="450" y="164" text-anchor="middle" font-size="13">Servidor</text>' +
        '<path class="traco" d="M450 140 L450 76"/>' +
        '<path class="seta" d="M444 76 L456 76 L450 66 Z"/>' +
        '<text class="rotulo-secundario" x="458" y="104" font-size="11">callback</text>' +
        '<text class="rotulo-secundario" x="450" y="198" text-anchor="middle" ' +
        'font-size="11">só quando outro cliente altera o arquivo</text>' +
        "</svg>" +
        "<figcaption>A quantidade de setas é a lição. No NFS o tráfego acompanha o número " +
        "de validações, e no AFS ele acompanha o número de alterações, que é muito " +
        "menor.</figcaption>" +
        "</figure>" +
        "<p>O efeito foi medido. Num mesmo programa de avaliação, com 18 clientes, o AFS " +
        "impôs 40% de carga ao servidor contra 100% do NFS. A explicação está na figura, " +
        "porque a maioria dos arquivos não é acessada de forma concorrente e as leituras " +
        "predominam sobre as escritas, então quase toda pergunta do NFS recebe a resposta " +
        "de que nada mudou.</p>" +
        "<p>Duas situações ameaçam o esquema e as duas têm resposta. Depois de uma " +
        "reinicialização, o Venus tenta preservar o máximo de arquivos da cache em disco, " +
        "mas não pode confiar nos tíquetes, porque algum callback pode ter se perdido " +
        "enquanto a máquina estava fora. Antes do primeiro uso de cada arquivo, ele manda ao " +
        "servidor uma requisição de validação com o carimbo de tempo que tem, e o servidor " +
        "responde se o tíquete pode ser reinstalado. Além disso, passado um tempo T sem " +
        "comunicação com o servidor, da ordem de dez minutos na maioria das instalações, o " +
        "callback é renovado antes de o arquivo ser aberto.</p>" +
        "<p>Nada disso é de graça, e o preço tem nome. Manter a lista de quem detém promessa " +
        "de cada arquivo é <strong>estado por cliente no servidor</strong>, exatamente o que " +
        "o NFS e o modelo abstrato evitavam. Essa lista precisa sobreviver a falhas do " +
        "servidor, então ela é mantida em disco e atualizada com operações atômicas. A troca " +
        "que o AFS faz é clara, porque ele paga complexidade de recuperação para comprar " +
        "consistência barata e escala.</p>" +
        "<h3>A semântica de quem fecha por último</h3>" +
        "<p>O algoritmo de consistência do AFS age <strong>apenas</strong> no " +
        "<code>open</code> e no <code>close</code>. Entre os dois, o cliente lê e escreve a " +
        "cópia local à vontade, e nenhum processo em outra estação fica sabendo.</p>" +
        "<p>A garantia formal da primeira versão é curta. Depois de um <code>open</code> " +
        "bem-sucedido, o cliente tem o valor mais recente que o servidor tinha. Depois de um " +
        "<code>close</code> bem-sucedido, o valor do cliente foi propagado ao servidor. Na " +
        "versão com callbacks a garantia de abertura enfraquece um pouco, porque um callback " +
        "pode se perder numa falha de rede, e nesse caso a cópia usada não estará " +
        "desatualizada por mais que o intervalo T de renovação.</p>" +
        "<p>A consequência prática é dura e vale enunciá-la sem rodeios. Se dois usuários em " +
        "estações <strong>diferentes</strong> abrem, editam e fecham o mesmo arquivo mais ou " +
        "menos ao mesmo tempo, vale o último a fechar, e as demais atualizações são perdidas " +
        "em silêncio, sem relatório de erro nenhum. O AFS não oferece controle de " +
        "concorrência, e quem precisa dele implementa por conta própria.</p>" +
        "<p>Há uma exceção que confunde muita gente. Dois processos na <strong>mesma</strong> " +
        "estação compartilham a mesma cópia em cache, e por isso se comportam exatamente " +
        "como no UNIX, bloco a bloco. A semântica de atualização depende de onde os " +
        "processos estão, o que é estranho e, ainda assim, próximo o bastante do UNIX para a " +
        "maioria dos programas existentes funcionar sem alteração.</p>" +
        "<p>O sistema foi instalado em mais de mil servidores, em mais de 150 sites, e um " +
        "levantamento sobre 32 mil volumes com 200 GB de dados mediu taxas de acerto de " +
        "cache entre 96% e 98%. Números assim explicam por que a aposta se sustentou.</p>" +
        '<div class="tabela-rolagem">' +
        '<table class="tabela-conteudo" id="tab-nfs-afs">' +
        "<tr><th>Dimensão</th><th>NFS</th><th>AFS</th></tr>" +
        "<tr><td>Modelo de acesso</td><td>Mantém o arquivo no servidor e pede cada " +
        "operação.</td><td>Leva a cópia ao cliente e devolve no fechamento.</td></tr>" +
        "<tr><td>Unidade transferida</td><td>Transfere blocos sob demanda.</td><td>Transfere " +
        "o arquivo inteiro, em porções de 64 KB nas versões recentes.</td></tr>" +
        "<tr><td>Onde a cache fica</td><td>Guarda blocos na memória do cliente.</td>" +
        "<td>Guarda arquivos no disco do cliente, e eles sobrevivem ao reinício.</td></tr>" +
        "<tr><td>Quem fala primeiro</td><td>O cliente pergunta periodicamente se o que ele " +
        "tem ainda vale.</td><td>O servidor avisa quando alguém altera o arquivo.</td></tr>" +
        "<tr><td>Estado no servidor</td><td>Não guarda nada em nome do cliente.</td>" +
        "<td>Guarda a lista de promessas de callback, em disco e com atualização " +
        "atômica.</td></tr>" +
        "<tr><td>Escrita concorrente de estações diferentes</td><td>Mistura as escritas " +
        "conforme os blocos chegam ao servidor.</td><td>Preserva a versão de quem fecha por " +
        "último e descarta as demais em silêncio.</td></tr>" +
        "</table>" +
        "</div>" +
        "<p>Lendo a tabela de cima a baixo, dá para ver que nenhuma linha é independente das " +
        "outras. Escolher levar o arquivo ao cliente força a cache em disco, a cache em " +
        "disco torna a pergunta periódica cara demais, e a inversão de quem fala obriga o " +
        "servidor a guardar estado. É uma cadeia de consequências que começa numa decisão " +
        "só.</p>" +
        "<h3>O que veio depois dos dois</h3>" +
        "<p>A pesquisa dos anos seguintes tratou de fechar as lacunas de cada lado. Dois " +
        "projetos acrescentaram <code>open</code>, <code>close</code> e callbacks ao " +
        "protocolo NFS, com o objetivo de recuperar a cópia única precisa que o servidor sem " +
        "estado impedia. O Spritely NFS fez o servidor manter uma tabela de arquivos abertos " +
        "e mandar callbacks avisando os clientes para mudarem a estratégia de cache, ao " +
        "custo de um protocolo de recuperação para reconstruir essa tabela depois de uma " +
        "falha.</p>" +
        "<p>O projeto Not Quite NFS (NQNFS) perseguiu o mesmo objetivo e resolveu a " +
        "recuperação de outro " +
        "jeito, com <strong>arrendamentos</strong> (<em>leases</em>), que são concessões com " +
        "prazo. Se o cliente não responde ao callback, o servidor simplesmente espera o " +
        "prazo expirar e segue em frente. É a mesma ideia que o tópico 05 apresentou, e " +
        "guarde-a, porque ela reaparece na próxima seção comandando as escritas do GFS.</p>" +
        "<p>A versão 4 do NFS, de 2000, incorporou esses resultados. Ela usa callbacks ou " +
        "arrendamentos para manter a consistência, suporta recuperação dinâmica de falhas do " +
        "servidor e permite mover sistemas de arquivos para servidores novos de forma " +
        "transparente, o que fecha a lacuna de mobilidade que a tabela da seção 3 " +
        "apontou.</p>" +
        "<p>Do lado do AFS, o herdeiro é o Distributed File System (DFS) do Distributed " +
        "Computing Environment (DCE), o ambiente de computação distribuída da Open Software " +
        "Foundation, e por isso ele costuma ser citado como DCE/DFS. Ele foi além num ponto " +
        "preciso, porque o " +
        "callback deixa de esperar o fechamento e é disparado assim que o arquivo é " +
        "atualizado. Para escrever, o cliente pede ao servidor um tíquete de escrita válido " +
        "para uma faixa de bytes, e os clientes que têm cópias daquela faixa recebem " +
        "callbacks de revogação. Todos os tíquetes têm prazo e precisam ser renovados.</p>" +
        "<h3>A organização do disco também mudou</h3>" +
        "<p>Dois avanços na maneira de guardar os dados no disco entraram nesse mesmo " +
        "período e sobreviveram até hoje, em qualquer escala.</p>" +
        "<p>O <strong>RAID</strong>, sigla de arranjo redundante de discos baratos, " +
        "segmenta os blocos em porções de tamanho fixo e as espalha em tiras por vários " +
        "discos, junto com códigos redundantes de correção de erro. Ele melhora a tolerância " +
        "a falhas, porque um disco que morre não leva os dados junto, e melhora o " +
        "desempenho, porque as tiras que formam um bloco são lidas e escritas ao mesmo " +
        "tempo.</p>" +
        "<p>O <strong>armazenamento estruturado em log</strong> ataca outro gargalo. Com " +
        "muita memória servindo de cache, a leitura melhorou e a escrita continuou " +
        "medíocre, porque gravar blocos individuais e atualizar os metadados associados " +
        "custa muitas esperas do braço do disco. A solução é acumular um conjunto de " +
        "escritas na memória e gravá-las de uma vez, em segmentos grandes e adjacentes, na " +
        "ordem em que foram atualizadas. O ganho medido foi de até 70% da banda disponível " +
        "no disco, contra menos de 10% de um sistema de arquivos convencional, e o preço é " +
        "um processo de limpeza em segundo plano que compacta blocos vivos para liberar " +
        "espaço contíguo.</p>" +
        "<p>Por fim, dois protótipos de pesquisa dos anos 90, o xFS e o Frangipani, " +
        "apontaram para onde a próxima seção vai. Os dois separam a responsabilidade de " +
        "<strong>armazenar dados</strong> da responsabilidade de <strong>gerenciar " +
        "metadados e atender clientes</strong>, distribuindo a primeira por muitos nós de " +
        "uma rede local. Nenhum dos dois virou produto de massa, e a ideia de separar as " +
        "duas responsabilidades virou o desenho padrão de tudo o que veio depois.</p>",
      slides: [
        {
          title: "AFS, escalabilidade em primeiro lugar",
          html:
            "<ul>" +
            "<li>Mesmas primitivas do UNIX, e prioridade diferente, que é servir muitos " +
            "usuários ativos</li>" +
            "<li>Guarda <strong>arquivos inteiros</strong> na cache em disco do cliente, " +
            "que sobrevive ao reinício</li>" +
            "<li><code>open</code> busca a cópia, <code>close</code> devolve se mudou, e o " +
            "resto é local</li>" +
            "<li>A aposta se apoia em cargas medidas, com arquivos pequenos, leitura " +
            "predominante e um usuário por arquivo</li>" +
            "</ul>"
        },
        {
          title: "Vice, Venus, volumes e fids",
          html:
            "<ul>" +
            "<li><strong>Vice</strong> é o servidor e <strong>Venus</strong> é o módulo " +
            "cliente, os dois em nível de usuário</li>" +
            "<li>O núcleo só intercepta <code>open</code> e <code>close</code> do espaço " +
            "compartilhado</li>" +
            "<li>O <strong>fid</strong> de 96 bits junta volume, manipulador e elemento de " +
            "exclusividade</li>" +
            "<li>O <strong>volume</strong> é a unidade de localização e movimentação, " +
            "tipicamente um por usuário</li>" +
            "</ul>"
        },
        {
          title: "A promessa de callback inverte quem fala",
          ref: "fig-callback",
          html:
            "<ul>" +
            "<li>Tíquete válido significa abrir a cópia local sem ir à rede</li>" +
            "<li>Medido em 40% de carga no servidor contra 100% do NFS</li>" +
            "</ul>"
        },
        {
          title: "O preço da inversão e a semântica que sobra",
          html:
            "<ul>" +
            "<li>O servidor passa a guardar estado por cliente, em disco e com escrita " +
            "atômica</li>" +
            "<li>A consistência age só no <code>open</code> e no <code>close</code></li>" +
            "<li>Estações diferentes editando junto fazem vencer quem fecha por último, e " +
            "o resto se perde em silêncio</li>" +
            "<li>Processos na mesma estação dividem a cópia e escrevem bloco a bloco, como " +
            "no UNIX</li>" +
            "</ul>"
        },
        {
          title: "NFS e AFS lado a lado",
          ref: "tab-nfs-afs"
        },
        {
          title: "O que veio depois",
          html:
            "<ul>" +
            "<li>Spritely NFS e NQNFS trouxeram <code>open</code>, <code>close</code> e " +
            "callbacks ao NFS, e o segundo estreou o arrendamento</li>" +
            "<li>O NFS versão 4 incorporou tudo isso e a migração transparente</li>" +
            "<li>O DCE/DFS avisa ao atualizar, com tíquete de escrita por faixa de " +
            "bytes</li>" +
            "<li>RAID e log mudaram o disco, com até 70% da banda contra menos de 10%</li>" +
            "</ul>"
        }
      ]
    },
    {
      title: "Quando a falha é a regra, do GFS ao armazenamento de objetos",
      html:
        "<p>O NFS e o AFS supõem um mundo. Nele, os arquivos são pequenos, o hardware " +
        "raramente falha, a escrita aleatória é rara mas precisa funcionar, e o serviço " +
        "atende a uma intranet. Esse mundo continua existindo, e por volta do ano 2000 " +
        "apareceu outro ao lado dele, com premissas quase invertidas.</p>" +
        "<p>O Google mediu a própria carga de trabalho antes de projetar o " +
        "<strong>Google File System</strong>, conhecido pela sigla GFS, e as quatro " +
        "observações que ele registrou explicam todo o resto do sistema.</p>" +
        "<ul>" +
        "<li>A falha de componente é a <strong>regra</strong>, e não a exceção, porque um " +
        "agregado de milhares de máquinas comuns garante que alguma delas está quebrada " +
        "neste instante e que outra não vai voltar.</li>" +
        "<li>Os arquivos são enormes para o padrão anterior, com alguns milhões de arquivos " +
        "de uns 100 MB e vários deles na casa dos gigabytes, o que obriga a rever tamanhos " +
        "de bloco e de operação.</li>" +
        "<li>A mutação predominante é <strong>anexar</strong> dados ao fim do arquivo, e " +
        "não sobrescrever o que já está lá, e depois de escrito o arquivo em geral só é " +
        "lido, quase sempre em sequência.</li>" +
        "<li>A aplicação e o sistema de arquivos são projetados <strong>juntos</strong>, o " +
        "que permite relaxar a interface de um lado em troca de simplicidade do outro.</li>" +
        "</ul>" +
        "<p>Some a isso uma prioridade que também se inverte. Vazão alta e sustentada vale " +
        "mais que latência baixa, porque quase todas as aplicações de destino processam " +
        "dados em massa e pouquíssimas têm exigência de tempo de resposta individual.</p>" +
        "<h3>Um mestre que sai do caminho</h3>" +
        "<p>A escolha de projeto mais influente é guardar cada arquivo em pedaços de tamanho " +
        "fixo, chamados <strong>trechos</strong> (<em>chunks</em>), de 64 MB cada um. Isso é " +
        "enorme perto dos 4 KB de um sistema de arquivos comum, e cada trecho recebe na " +
        "criação um identificador de 64 bits imutável e único em todo o sistema. O " +
        "chunkserver guarda o trecho como um arquivo comum do Linux, e cada trecho é " +
        "replicado, por padrão em três máquinas.</p>" +
        '<figure class="figura" id="fig-gfs">' +
        '<svg viewBox="0 0 600 244" role="img" aria-labelledby="fig-gfs-titulo">' +
        '<title id="fig-gfs-titulo">O cliente fica à esquerda. Uma seta de controle sobe ' +
        "dele até o mestre, no alto à direita, que guarda o espaço de nomes, o mapeamento " +
        "de arquivos em trechos e a localização das réplicas. Uma seta de dados desce do " +
        "cliente até os chunkservers, embaixo à direita, que guardam os trechos de 64 " +
        "megabytes. Do mestre para os chunkservers descem linhas tracejadas de instruções e " +
        "de estado. O dado nunca passa pelo mestre.</title>" +
        '<rect class="caixa" x="14" y="96" width="130" height="48" rx="8"/>' +
        '<text x="79" y="125" text-anchor="middle" font-size="13">Cliente</text>' +
        '<rect class="caixa-destaque" x="246" y="16" width="250" height="52" rx="8"/>' +
        '<text x="371" y="38" text-anchor="middle" font-size="13">Mestre</text>' +
        '<text class="rotulo-secundario" x="371" y="56" text-anchor="middle" ' +
        'font-size="11">nomes, mapeamento e réplicas</text>' +
        '<rect class="caixa" x="214" y="170" width="160" height="56" rx="8"/>' +
        '<text x="294" y="192" text-anchor="middle" font-size="13">Chunkserver</text>' +
        '<text class="rotulo-secundario" x="294" y="210" text-anchor="middle" ' +
        'font-size="11">trechos de 64 MB</text>' +
        '<rect class="caixa" x="400" y="170" width="160" height="56" rx="8"/>' +
        '<text x="480" y="192" text-anchor="middle" font-size="13">Chunkserver</text>' +
        '<text class="rotulo-secundario" x="480" y="210" text-anchor="middle" ' +
        'font-size="11">trechos de 64 MB</text>' +
        '<path class="traco" d="M144 110 L200 110 L200 42 L234 42"/>' +
        '<path class="seta" d="M234 36 L234 48 L246 42 Z"/>' +
        '<text class="rotulo-secundario" x="208" y="78" font-size="11">controle</text>' +
        '<path class="traco" d="M144 132 L180 132 L180 198 L202 198"/>' +
        '<path class="seta" d="M202 192 L202 204 L214 198 Z"/>' +
        '<text class="rotulo-secundario" x="150" y="166" font-size="11">dados</text>' +
        '<path class="traco" stroke-dasharray="4 4" d="M300 68 L300 170"/>' +
        '<path class="traco" stroke-dasharray="4 4" d="M470 68 L470 170"/>' +
        '<text class="rotulo-secundario" x="385" y="122" text-anchor="middle" ' +
        'font-size="11">instruções e estado</text>' +
        "</svg>" +
        '<p class="figura-fonte">Fonte: traduzido de Ghemawat, Gobioff e Leung (2003).</p>' +
        "<figcaption>O mestre entra no começo e depois sai. Ele responde onde o trecho " +
        "está, e a partir daí o cliente conversa direto com o chunkserver, o que mantém o " +
        "mestre longe do caminho dos dados.</figcaption>" +
        "</figure>" +
        "<p>A separação entre <strong>fluxo de controle</strong> e <strong>fluxo de " +
        "dados</strong> é o que sustenta o desempenho. Quando o cliente precisa de um " +
        "deslocamento dentro de um arquivo, a biblioteca dele converte esse deslocamento em " +
        "um par formado pelo nome do arquivo e pelo índice do trecho, o que é fácil porque o " +
        "tamanho do trecho é fixo. O mestre responde com o identificador do trecho e a " +
        "localização das réplicas, o cliente guarda essa informação na cache e passa a falar " +
        "direto com o chunkserver mais próximo.</p>" +
        "<p>Junte a separação com o tamanho do trecho e o efeito aparece. Uma vez localizado " +
        "um trecho, os 64 MB inteiros podem ser lidos tão rápido quanto a rede e o disco " +
        "permitirem, sem mais nenhuma conversa com o mestre. Como as aplicações leem arquivos " +
        "grandes em sequência, uma pergunta paga muitas leituras.</p>" +
        "<p>O trecho grande traz outros dois ganhos e uma armadilha conhecida. O cliente " +
        "mantém uma conexão de longa duração com o chunkserver, o que reduz a sobrecarga de " +
        "rede, e o volume de metadados encolhe na mesma proporção, já que um trecho de 64 KB " +
        "multiplicaria os metadados por mil. A armadilha é o ponto quente, porque um arquivo " +
        "pequeno cabe num trecho só e concentra acessos em poucas máquinas. Isso aconteceu " +
        "de verdade quando um executável foi guardado como arquivo de um trecho e iniciado " +
        "em centenas de máquinas ao mesmo tempo, e a correção foi aumentar o fator de " +
        "replicação daquele arquivo e escalonar os inícios.</p>" +
        "<h3>Metadados na memória, e o que não se guarda</h3>" +
        "<p>Todos os metadados ficam na memória do mestre, o que torna as operações de " +
        "controle rápidas e permite ao mestre varrer o próprio estado em segundo plano, para " +
        "recolher trechos órfãos, refazer réplicas que sumiram e reequilibrar o uso de " +
        "disco. Isso só é viável por causa do tamanho do trecho, porque o mestre mantém " +
        "menos de 64 bytes de metadados para cada trecho de 64 MB.</p>" +
        "<p>Dois dos três tipos de metadado são mantidos de forma persistente, e o terceiro " +
        "não. O espaço de nomes e o mapeamento de arquivos em trechos vão para um " +
        "<strong>registro de operação</strong>, gravado no disco do mestre e replicado em " +
        "máquinas remotas, com pontos de checagem periódicos para que a recuperação não " +
        "precise reler o registro inteiro. Uma mudança só fica visível ao cliente depois de " +
        "o registro correspondente ter sido gravado nos dois lugares.</p>" +
        "<p>A localização das réplicas, por outro lado, não é guardada em disco nenhum. O " +
        "mestre pergunta a cada chunkserver quais trechos ele tem, no arranque e sempre que " +
        "um chunkserver entra no agregado. O argumento para isso é bonito e vale reter, " +
        "porque quem tem a palavra final sobre o que existe num disco é a máquina que " +
        "carrega aquele disco. Um disco pode falhar e fazer trechos desaparecerem sozinhos, " +
        "então manter no mestre uma visão consistente dessa informação seria perseguir uma " +
        "verdade que muda sem avisar.</p>" +
        "<p>O GFS também quase não usa cache, e essa é a diferença mais chocante em relação " +
        "às duas seções anteriores. O cliente guarda a localização dos trechos e não guarda " +
        "os dados. O motivo é a carga de trabalho, porque quem varre arquivos enormes em " +
        "sequência tem um conjunto de trabalho grande demais para caber em cache alguma. E, " +
        "sem cache de dados no cliente, some junto a necessidade de qualquer protocolo de " +
        "coerência, que foi o assunto de metade das duas seções anteriores.</p>" +
        "<h3>Consistência relaxada, de propósito</h3>" +
        "<p>Para falar do que o GFS garante, é preciso primeiro separar duas palavras que " +
        "ele usa em sentido técnico. Uma região do arquivo é <strong>consistente</strong> " +
        "quando todos os clientes leem a mesma coisa, seja qual for a réplica que " +
        "responder. Ela é <strong>definida</strong> quando, além de consistente, mostra por " +
        "inteiro o que a mutação escreveu. Uma região pode então ser consistente sem ser " +
        "definida, e é aí que mora a novidade.</p>" +
        '<div class="tabela-rolagem">' +
        '<table class="tabela-conteudo" id="tab-consistencia-gfs">' +
        "<tr><th>Situação</th><th>Depois de uma escrita comum</th><th>Depois de uma " +
        "anexação de registro</th></tr>" +
        "<tr><td>A mutação tem sucesso e ninguém escreve ao mesmo tempo</td><td>A região " +
        "fica definida, e todos leem exatamente o que foi escrito.</td><td>A região fica " +
        "definida, no deslocamento que o sistema escolheu.</td></tr>" +
        "<tr><td>Várias mutações concorrentes têm sucesso</td><td>A região fica consistente " +
        "e indefinida, porque todos leem a mesma coisa, que mistura pedaços de escritas " +
        "diferentes.</td><td>Cada registro forma uma região definida, e entre eles sobram " +
        "trechos inconsistentes.</td></tr>" +
        "<tr><td>A mutação falha em alguma réplica</td><td>A região fica inconsistente, e " +
        "clientes diferentes podem ler coisas diferentes.</td><td>A região fica " +
        "inconsistente, e cabe ao cliente repetir a operação.</td></tr>" +
        "</table>" +
        "</div>" +
        "<p>A coluna da direita descreve a operação que o GFS acrescentou à interface " +
        "clássica, a <strong>anexação de registro</strong> (<em>record append</em>). Numa " +
        "escrita comum o cliente diz em que deslocamento quer escrever. Na anexação de " +
        "registro ele diz apenas o que quer escrever, e o sistema escolhe o deslocamento, " +
        "grava o registro de forma atômica <strong>pelo menos uma vez</strong> e devolve ao " +
        "cliente onde ele foi parar. Centenas de máquinas podem anexar ao mesmo arquivo sem " +
        "combinar nada entre si, o que com escritas comuns exigiria um gerenciador de travas " +
        "distribuído.</p>" +
        "<p>O preço está escrito na tabela e é preciso encará-lo. O GFS não garante que as " +
        "réplicas de um trecho sejam idênticas byte a byte, e pode inserir preenchimento e " +
        "registros duplicados entre um registro e outro. A garantia é sobre o registro, e " +
        "não sobre o arquivo.</p>" +
        "<p>Uma garantia assim seria inútil se a aplicação não soubesse conviver com ela, e " +
        "é aqui que o co-projeto da lista inicial aparece. Três técnicas simples bastam, e " +
        "todas elas a aplicação já precisaria por outros motivos. Ela anexa em vez de " +
        "sobrescrever, o que já é mais eficiente e mais resistente a falha de aplicação. Ela " +
        "grava pontos de checagem, e o leitor processa apenas até o último ponto, que está " +
        "em região definida. E ela escreve registros autovalidáveis e autoidentificáveis, " +
        "com soma de verificação para descartar preenchimento e fragmento, e com " +
        "identificador único para filtrar duplicata quando duplicata for inaceitável.</p>" +
        "<p>Vale enunciar a lição, porque ela vale muito além do GFS. A garantia que o " +
        "usuário final enxerga não é uma propriedade do sistema de armazenamento sozinho, " +
        "ela é uma propriedade do par formado pelo armazenamento e pela aplicação. Relaxar " +
        "de um lado é aceitável quando o outro lado assume a parte que sobrou, e é isso que " +
        "distingue consistência relaxada de sistema mal feito.</p>" +
        "<h3>Quem decide a ordem das escritas</h3>" +
        "<p>Falta explicar como as réplicas de um trecho chegam a aplicar as mutações na " +
        "mesma ordem. O mestre concede a uma das réplicas um <strong>arrendamento</strong> " +
        "do trecho, e essa réplica passa a ser a <strong>primária</strong>. A primária " +
        "escolhe uma ordem serial para todas as mutações pendentes daquele trecho, e as " +
        "demais réplicas aplicam nessa ordem. A ordem global sai da combinação de duas " +
        "coisas, que são a sequência em que os arrendamentos foram concedidos e os números " +
        "de série que cada primária atribuiu.</p>" +
        "<p>O arrendamento é o mesmo mecanismo que o NQNFS estreou na seção anterior, e o " +
        "motivo de usá-lo é o mesmo. Se o mestre perder contato com a primária, ele não " +
        "precisa saber se ela morreu ou se apenas está incomunicável, e basta esperar o " +
        "prazo vencer para conceder o arrendamento a outra réplica com segurança. O prazo " +
        "inicial é de 60 segundos, e as renovações viajam a tiracolo nas mensagens de " +
        "batimento que o mestre já troca com todos os chunkservers.</p>" +
        "<p>O caminho dos dados é separado do caminho do controle também aqui. O cliente " +
        "empurra os dados para todas as réplicas antes de pedir a escrita, e as réplicas " +
        "guardam esses bytes num buffer sem gravá-los. Os dados viajam em cadeia, cada " +
        "máquina repassando à mais próxima que ainda não recebeu, o que usa a banda de saída " +
        "inteira de cada uma em vez de dividi-la. Só depois de todas confirmarem o " +
        "recebimento é que o cliente manda a requisição de escrita à primária, que serializa " +
        "e manda as secundárias aplicarem na mesma ordem.</p>" +
        "<p>O tópico de replicação vai nomear esse desenho, porque ele é replicação " +
        "passiva com uma modificação. Na forma clássica, a atualização vai à primária e ela " +
        "a repassa às demais. Aqui os dados vão a todas de uma vez e só a requisição vai à " +
        "primária, exatamente para que a transferência pesada possa ser otimizada sem " +
        "depender do controle.</p>" +
        "<h3>HDFS, o mesmo desenho com outros nomes</h3>" +
        "<p>O GFS é proprietário e nunca foi distribuído fora do Google, e a implementação " +
        "aberta que ele inspirou é o <strong>Hadoop Distributed File System</strong>, " +
        "conhecido pela sigla HDFS. Os princípios de projeto são os mesmos, e boa parte da " +
        "dificuldade de ler sobre os dois vem apenas do vocabulário, que muda inteiro.</p>" +
        '<div class="tabela-rolagem">' +
        '<table class="tabela-conteudo" id="tab-gfs-hdfs">' +
        "<tr><th>Papel</th><th>GFS</th><th>HDFS</th></tr>" +
        "<tr><td>Quem guarda os metadados</td><td>Chama-se mestre.</td><td>Chama-se " +
        "NameNode.</td></tr>" +
        "<tr><td>Quem guarda os dados</td><td>Chama-se chunkserver.</td><td>Chama-se " +
        "DataNode, normalmente um por máquina do agregado.</td></tr>" +
        "<tr><td>Como o arquivo é dividido</td><td>Divide em trechos de tamanho fixo, de 64 " +
        "MB.</td><td>Divide em blocos de tamanho fixo, de 64 MB no desenho original e de " +
        "128 MB nas configurações atuais.</td></tr>" +
        "<tr><td>Quantos escrevem ao mesmo tempo</td><td>Aceita vários escritores " +
        "concorrentes no mesmo arquivo.</td><td>Aceita um escritor de cada vez, o que " +
        "simplifica a semântica.</td></tr>" +
        "<tr><td>Que mutações existem</td><td>Oferece escrita comum e anexação de " +
        "registro.</td><td>Oferece só anexação, e dispensa a anexação de registro porque " +
        "não há concorrência a resolver.</td></tr>" +
        "<tr><td>O que faz com a réplica que falhou</td><td>Repete a mutação e admite " +
        "réplicas diferentes entre si.</td><td>Remove o nó com falha do conjunto de " +
        "réplicas, para que o conteúdo fique igual em todas.</td></tr>" +
        "</table>" +
        "</div>" +
        "<p>A coluna da direita conta uma história coerente. O HDFS trocou generalidade por " +
        "simplicidade em três lugares, e as três trocas se sustentam mutuamente, porque " +
        "quem tem um escritor só não precisa de anexação atômica nem de admitir réplicas " +
        "divergentes. Vale como exemplo de que copiar um sistema não obriga a copiar as " +
        "decisões difíceis dele.</p>" +
        "<p>O HDFS mantém a comunicação viva com duas mensagens periódicas que cada DataNode " +
        "envia ao NameNode. O <em>heartbeat</em> diz que aquele nó continua funcionando, e o " +
        "<em>blockreport</em> lista todos os blocos que ele guarda, que é a mesma ideia de " +
        "deixar o dono do disco falar sobre o próprio disco.</p>" +
        "<p>A política de colocação de réplicas merece atenção, porque ela expõe uma troca " +
        "que o texto anterior não tinha explicitado. Espalhar as três cópias por racks " +
        "diferentes dá mais confiabilidade, já que um rack inteiro cai junto quando o " +
        "comutador ou a alimentação dele falha. Mas a banda entre racks é menor que a banda " +
        "dentro de um rack, então o padrão guarda uma réplica no próprio nó que escreveu, " +
        "uma em outro nó do mesmo rack e a terceira num nó de outro rack. Confiabilidade e " +
        "custo de comunicação estão sendo pesados um contra o outro, e a resposta é uma " +
        "posição intermediária.</p>" +
        "<p>Uma última capacidade dos dois sistemas mudou a forma de processar dados em " +
        "massa. Como o cliente pode perguntar <strong>onde</strong> está guardada uma região " +
        "do arquivo, o escalonador de tarefas consegue enviar a tarefa para uma máquina que " +
        "já tem aquele dado no disco. Chama-se mover a computação para os dados, e o " +
        "raciocínio é que o código executável costuma ser bem menor que o arquivo que ele " +
        "vai ler.</p>" +
        "<h3>O presente, e o que sobrou de tudo isso</h3>" +
        "<p>Duas ideias desta seção viraram infraestrutura padrão e vale saber como elas " +
        "aparecem hoje. A primeira é que sistemas de arquivos distribuídos modernos seguem o " +
        "princípio de <strong>nada compartilhado</strong>, com máquinas comuns ligadas por " +
        "uma rede comum, em oposição às arquiteturas de disco compartilhado que dependem de " +
        "um equipamento de armazenamento central e de rede especializada. Como o hardware é " +
        "barato e falha mais, os blocos são replicados, e replicar não significa " +
        "obrigatoriamente guardar cópias inteiras, porque códigos de apagamento recuperam o " +
        "que se perdeu com menos espaço extra, na mesma linha do RAID da seção anterior.</p>" +
        "<p>A segunda é que o <strong>armazenamento de objetos</strong> se tornou a " +
        "alternativa mais comum em processamento em lote, com o Simple Storage Service (S3) " +
        "da Amazon, " +
        "o Google Cloud Storage e o Azure Blob Storage. A interface é bem mais estreita do " +
        "que a de um sistema de arquivos. Cada objeto tem uma chave dentro de um balde de " +
        "nome único, é lido por uma operação de leitura e escrito por uma de escrita, e é " +
        "<strong>imutável</strong> depois de escrito, de modo que atualizá-lo significa " +
        "reescrevê-lo inteiro.</p>" +
        "<p>O que parece diretório ali não é diretório. A barra dentro da chave é uma " +
        "convenção, e listar por prefixo devolve tudo o que começa com aquele prefixo, " +
        "inclusive o que está em subcaminhos, o que o torna parecido com uma listagem " +
        "recursiva. Diretório vazio não existe, e por isso é comum criar um objeto de zero " +
        "byte só para que o caminho continue aparecendo. Faltam ainda o vínculo, a trava e a " +
        "renomeação atômica, já que renomear é copiar para a chave nova e apagar a " +
        "antiga.</p>" +
        "<p>A fronteira entre os dois mundos ficou borrada, e convém desconfiar de " +
        "equivalências apressadas. Existem drivers que fazem um armazenamento de objetos " +
        "parecer um sistema de arquivos, e existem implementações que oferecem as duas " +
        "interfaces. As interfaces coincidirem não faz o desempenho nem as garantias de " +
        "consistência coincidirem, e é preciso conferir se o sistema se comporta como o " +
        "esperado antes de adotá-lo.</p>" +
        "<p>A diferença que de fato decide costuma ser outra. Um sistema de arquivos " +
        "distribuído permite rodar a tarefa na máquina que guarda o dado, e um armazenamento " +
        "de objetos separa armazenamento de computação. Separar gasta mais banda, o que as " +
        "redes atuais de centro de dados absorvem bem, e em troca permite dimensionar " +
        "processador, memória e disco de forma independente. É a mesma pergunta do começo " +
        "deste tópico, sobre onde o dado deve estar no momento em que alguém precisa dele, " +
        "recebendo mais uma resposta.</p>" +
        "<p>Repare, ao fechar, que os quatro sistemas responderam às mesmas três perguntas " +
        "de maneiras diferentes. Onde a cópia fica enquanto está em uso, quem fala primeiro " +
        "quando ela deixa de valer, e quanto da semântica de cópia única se abre mão em " +
        "troca de desempenho. O NFS deixa a cópia em blocos na memória do cliente e pergunta " +
        "de tempos em tempos, o AFS deixa o arquivo inteiro no disco do cliente e espera ser " +
        "avisado, o GFS não deixa cópia nenhuma e substitui consistência por uma disciplina " +
        "de escrita, e o armazenamento de objetos torna o objeto imutável para não precisar " +
        "responder à segunda pergunta. Os tópicos de nomes, de replicação e de nuvem " +
        "retomam cada uma dessas escolhas com outro nome.</p>",
      slides: [
        {
          title: "Quatro observações mudam todas as premissas",
          html:
            "<ul>" +
            "<li>Falha de componente é <strong>regra</strong> num agregado de milhares de " +
            "máquinas comuns</li>" +
            "<li>Arquivos são enormes, com milhões de 100 MB e vários na casa dos " +
            "gigabytes</li>" +
            "<li>A mutação predominante é <strong>anexar</strong>, e depois o arquivo só é " +
            "lido</li>" +
            "<li>Aplicação e sistema de arquivos são projetados juntos, e vazão vale mais " +
            "que latência</li>" +
            "</ul>"
        },
        {
          title: "Um mestre que sai do caminho",
          ref: "fig-gfs",
          html:
            "<ul>" +
            "<li>Trecho fixo de 64 MB, replicado em três chunkservers</li>" +
            "<li>Uma pergunta ao mestre paga muitas leituras</li>" +
            "</ul>"
        },
        {
          title: "Metadados na memória, e quase nenhuma cache",
          html:
            "<ul>" +
            "<li>Menos de 64 bytes de metadado por trecho de 64 MB, então tudo cabe na " +
            "memória</li>" +
            "<li>Nomes e mapeamento vão para o registro de operação replicado, com pontos " +
            "de checagem</li>" +
            "<li>A localização das réplicas é perguntada aos chunkservers, porque o dono do " +
            "disco tem a palavra final</li>" +
            "<li>O cliente guarda localização e não guarda dados, o que elimina o protocolo " +
            "de coerência</li>" +
            "</ul>"
        },
        {
          title: "O que o GFS garante depois de uma mutação",
          ref: "tab-consistencia-gfs"
        },
        {
          title: "A consistência relaxada só funciona em par com a aplicação",
          html:
            "<ul>" +
            "<li>A anexação de registro grava <strong>pelo menos uma vez</strong>, no " +
            "deslocamento que o sistema escolhe</li>" +
            "<li>Réplicas não são idênticas byte a byte, e sobram preenchimento e " +
            "duplicata</li>" +
            "<li>A aplicação anexa, grava pontos de checagem e escreve registros " +
            "autovalidáveis</li>" +
            "<li>A garantia é do par armazenamento mais aplicação, e não do armazenamento " +
            "sozinho</li>" +
            "</ul>"
        },
        {
          title: "GFS e HDFS lado a lado",
          ref: "tab-gfs-hdfs"
        },
        {
          title: "O que sobrou disso tudo",
          html:
            "<ul>" +
            "<li>Nada compartilhado virou padrão, com máquinas e rede comuns e códigos de " +
            "apagamento no lugar da cópia inteira</li>" +
            "<li>O armazenamento de objetos oferece interface estreita, com objeto imutável " +
            "e prefixo que só parece diretório</li>" +
            "<li>A escolha que decide é computar onde o dado está ou separar armazenamento " +
            "de computação</li>" +
            "<li>Os quatro sistemas responderam às mesmas três perguntas de formas " +
            "diferentes</li>" +
            "</ul>"
        }
      ]
    }
  ],

  quiz: [
    {
      question:
        "O que a semântica de atualização de cópia única (one-copy) afirma, e por que " +
        "cache e réplicas a ameaçam?",
      options: [
        "Que existe uma só cópia física de cada arquivo no sistema inteiro, e a cache a viola no instante em que duplica os dados no disco do cliente.",
        "Que cada arquivo só pode ser aberto por um cliente de cada vez, e a cache a quebra ao permitir que várias aberturas concorrentes aconteçam.",
        "Que os processos veem o conteúdo como se houvesse uma cópia só, e o atraso na propagação das escritas em réplicas e caches torna algum desvio inevitável.",
        "Que o servidor mantém a cópia mestra e os clientes nunca escrevem nela, e réplicas com permissão de escrita a violam sempre, por definição."
      ],
      answer: 2,
      explanation:
        "A afirmação é sobre comportamento observável, e não sobre quantas cópias " +
        "existem no disco. Como cache e réplicas propagam as escritas com atraso, algum " +
        "desvio é certo, e o tópico inteiro trata de quanto desvio cada sistema admite e " +
        "do que oferece em troca."
    },
    {
      question:
        "Um serviço entrega ao cliente o arquivo inteiro, deixa que ele leia e escreva na " +
        "cópia local sem falar com o servidor, e recebe a cópia de volta no fim. Que " +
        "modelo é esse, e qual é a consequência direta dele?",
      options: [
        "É o modelo de acesso remoto, e a consequência é que cada operação do programa custa uma ida e uma volta pela rede.",
        "É o modelo de carregar e descarregar, e a consequência é que o servidor passa um bom tempo sem saber o que está sendo feito com o arquivo.",
        "É o modelo de acesso remoto, e a consequência é que o servidor consegue impor a semântica de cópia única sem esforço adicional.",
        "É o modelo de carregar e descarregar, e a consequência é que o servidor precisa validar cada bloco antes de o cliente ler o seguinte."
      ],
      answer: 1,
      explanation:
        "Levar o arquivo ao cliente é o modelo de carregar e descarregar, adotado pelo " +
        "AFS. Entre a abertura e o fechamento ninguém no servidor sabe o que está " +
        "acontecendo com aquele arquivo, e é dessa cegueira que nasce a semântica de " +
        "quem fecha por último."
    },
    {
      question:
        "Por que a escrita direta (write-through) no servidor é um requisito relevante " +
        "num sistema de arquivos distribuído e quase não faz falta num sistema local?",
      options: [
        "Porque a rede corrompe blocos com frequência muito maior que o barramento de disco, e só a gravação imediata detecta a corrupção a tempo.",
        "Porque o disco do servidor costuma ser mais lento que o do cliente, e gravar cedo compensa a diferença de velocidade entre os dois.",
        "Porque o protocolo de chamada remota não consegue transportar confirmação de escrita, e a gravação imediata substitui essa confirmação que falta.",
        "Porque cliente e servidor falham de forma independente, e o cliente segue rodando supondo que os dados anteriores já chegaram ao disco do servidor."
      ],
      answer: 3,
      explanation:
        "É um caso de modos de falha independentes, do tópico 01. Num sistema local, a " +
        "falha que derruba o sistema de arquivos derruba junto os programas que agiriam " +
        "com base na suposição falsa, e no distribuído o cliente continua vivo e segue em " +
        "frente com essa suposição."
    },
    {
      question:
        "No modelo abstrato, o serviço de arquivos plano não tem open nem close, e Read e " +
        "Write recebem a posição como parâmetro explícito. Qual é a razão dessa escolha?",
      options: [
        "O ponteiro de leitura e escrita do UNIX é estado mantido por cliente e avança sozinho, então eliminá-lo torna as operações idempotentes e permite um servidor sem estado.",
        "Agrupar várias leituras numa única mensagem economiza chamadas de rede, e o parâmetro de posição é o que permite fazer esse agrupamento no cliente.",
        "O serviço de diretório já mantém os arquivos abertos em nome dos clientes, então repetir esse controle no serviço de arquivos plano seria trabalho duplicado.",
        "As operações de abertura e fechamento são implementadas diretamente pelo hardware do disco, e por isso não aparecem em interface de nível mais alto."
      ],
      answer: 0,
      explanation:
        "Repetir uma operação acidentalmente acessaria outra parte do arquivo, porque o " +
        "ponteiro já teria avançado, e é isso que torna a operação do UNIX não " +
        "idempotente. Passando a posição de forma explícita, tudo menos Create fica " +
        "idempotente e o servidor deixa de guardar estado por cliente."
    },
    {
      question:
        "O identificador de um grupo de arquivos é gerado concatenando o endereço IP de " +
        "32 bits da máquina criadora com um inteiro de 16 bits derivado da data. Para que " +
        "serve o endereço IP nessa construção?",
      options: [
        "Serve para localizar o servidor que guarda o grupo, e é por isso que o módulo cliente consegue enviar a requisição sem consultar mais ninguém.",
        "Serve para autenticar quem criou o grupo, já que o endereço é conferido contra a lista de máquinas autorizadas a criar grupos novos.",
        "Serve para ordenar os grupos por antiguidade, porque endereços menores foram atribuídos antes e indicam instalações mais velhas.",
        "Serve apenas para garantir unicidade global, e não localiza nada, porque o grupo pode ter sido movido para outro servidor depois de criado."
      ],
      answer: 3,
      explanation:
        "Grupos de arquivos podem ser movidos entre servidores, então o endereço embutido " +
        "no identificador não diz onde o grupo está agora. Quem responde isso é um " +
        "mapeamento separado, mantido pelo serviço, e confundir identificador com " +
        "endereço é um erro caro em sistemas distribuídos."
    },
    {
      question:
        "O manipulador de arquivo do NFS, na implementação UNIX, inclui um número de " +
        "geração além do identificador do sistema de arquivos e do i-node. Por que esse " +
        "campo existe?",
      options: [
        "Porque ele registra quantas vezes o arquivo foi modificado, o que permite ao cliente decidir se a cópia em cache dele ainda é a mais recente.",
        "Porque o UNIX reutiliza i-nodes depois que um arquivo é removido, e sem esse campo um manipulador antigo poderia acabar apontando para outro arquivo.",
        "Porque o campo identifica a versão do protocolo em uso, já que manipuladores de 32 bytes e de 128 bytes precisam ser distinguidos pelo servidor.",
        "Porque ele guarda a posição atual de leitura e escrita, que o servidor sem estado não pode manter em nenhuma outra estrutura interna."
      ],
      answer: 1,
      explanation:
        "O cliente guarda o manipulador e o reapresenta depois, e o i-node sozinho " +
        "voltaria a ser válido para um arquivo diferente assim que fosse reutilizado. " +
        "Cada reutilização incrementa o número de geração, e o manipulador antigo deixa " +
        "de casar com qualquer coisa."
    },
    {
      question:
        "No NFS, cada bloco em cache no cliente é validado por dois carimbos de tempo. " +
        "Reduzir o intervalo de atualização t de 30 para 3 segundos produz qual efeito?",
      options: [
        "Aproxima mais a consistência da cópia única, ao custo de mais chamadas getattr ao servidor para conferir o carimbo de modificação.",
        "Dispensa a conversa com o servidor, porque o cliente passa a confiar na cópia local durante toda a janela em que ela está na cache.",
        "Torna o servidor com estado, já que ele passa a registrar quais blocos cada cliente colocou em cache para poder invalidá-los depois.",
        "Faz o servidor emitir callbacks a cada escrita, no mesmo esquema que o AFS usa para avisar quem tem cópia do arquivo alterado."
      ],
      answer: 0,
      explanation:
        "O intervalo t é o botão que troca consistência por tráfego. Um t menor revalida " +
        "com mais frequência e aproxima a cópia única, e um t maior alivia o servidor ao " +
        "custo de ver dados velhos por mais tempo. O NFS continua sem estado e não usa " +
        "callbacks, que são do AFS."
    },
    {
      question:
        "No NFS, o mesmo arquivo remoto pode se chamar /remote/vu/mbox num cliente e " +
        "/work/me/mbox em outro. Por que isso acontece?",
      options: [
        "Porque cada cliente traduz os nomes para o idioma configurado nele, e o servidor guarda apenas a forma canônica do nome de caminho.",
        "Porque o servidor exporta uma cópia diferente do diretório para cada cliente, e cada cópia recebe um nome próprio no momento da exportação.",
        "Porque o ponto de montagem é escolhido pelo cliente, então o nome de caminho descreve a organização daquele cliente e não a do sistema.",
        "Porque o protocolo troca o nome do diretório a cada remontagem, para impedir que um cliente adivinhe caminhos que não lhe foram exportados."
      ],
      answer: 2,
      explanation:
        "O servidor exporta uma subárvore e cada cliente decide onde pendurá-la no espaço " +
        "de nomes local dele. A consequência é que ninguém pode citar um arquivo pelo " +
        "nome que vê, e a uniformidade, quando existe, vem de convenções combinadas entre " +
        "os administradores."
    },
    {
      question:
        "A principal razão de o AFS impor bem menos carga aos servidores que o NFS, " +
        "medida em 40% contra 100% no mesmo programa de avaliação, é que:",
      options: [
        "o AFS cifra o tráfego entre cliente e servidor, e a compressão que acompanha a cifragem reduz bastante o número de pacotes trocados na rede.",
        "o AFS mantém os arquivos na memória do servidor, enquanto o NFS precisa ler cada bloco do disco antes de responder a qualquer requisição.",
        "o AFS transfere apenas blocos pequenos sob demanda, enquanto o NFS transfere sempre o arquivo inteiro a cada abertura feita por um cliente.",
        "o cliente do AFS usa a cópia local sem tocar na rede enquanto a promessa de callback vale, e o do NFS pergunta de tempos em tempos."
      ],
      answer: 3,
      explanation:
        "A promessa de callback inverte quem fala. O servidor avisa apenas quando o " +
        "arquivo muda, e como a maioria dos arquivos não é acessada de forma concorrente " +
        "e leituras predominam, quase toda pergunta do NFS recebe a resposta de que nada " +
        "mudou. E é o AFS que serve o arquivo inteiro, não o contrário."
    },
    {
      question:
        "Dois usuários em estações de trabalho diferentes abrem, editam e fecham o mesmo " +
        "arquivo AFS quase ao mesmo tempo. O que o sistema garante?",
      options: [
        "As escritas dos dois são mescladas bloco a bloco, exatamente como aconteceria com dois processos do UNIX operando num arquivo local.",
        "A cópia enviada por quem fechar por último substitui a outra, as demais atualizações somem sem relatório de erro, e o controle de concorrência fica com a aplicação.",
        "A segunda abertura falha, porque o primeiro cliente detém uma trava exclusiva sobre o arquivo até que ele seja explicitamente liberado.",
        "A semântica é de cópia única estrita, então a segunda escrita fica bloqueada e espera a primeira terminar antes de ser aplicada no servidor."
      ],
      answer: 1,
      explanation:
        "O algoritmo de consistência do AFS age só na abertura e no fechamento, e não há " +
        "controle de concorrência entre estações. Processos na mesma estação, por outro " +
        "lado, compartilham a cópia em cache e aí sim escrevem bloco a bloco, como no " +
        "UNIX."
    },
    {
      question:
        "No GFS, o cliente pergunta ao mestre onde está o trecho e depois conversa " +
        "diretamente com o chunkserver. Que efeito o tamanho de trecho de 64 MB tem sobre " +
        "esse arranjo?",
      options: [
        "Obriga o mestre a participar de cada leitura, porque um trecho grande precisa ser dividido em pedaços menores antes de chegar ao cliente.",
        "Torna a cache de dados no cliente indispensável, já que um trecho desse tamanho não pode ser lido duas vezes em um intervalo curto.",
        "Faz com que uma consulta só pague muitas leituras seguidas, e reduz na mesma proporção o volume de metadados que precisa ficar na memória.",
        "Elimina a necessidade de replicação, porque um trecho tão grande já é gravado em tiras por vários discos da mesma máquina."
      ],
      answer: 2,
      explanation:
        "Localizado o trecho, os 64 MB podem ser lidos tão rápido quanto a rede e o disco " +
        "permitirem, sem nova conversa com o mestre. E como o mestre mantém menos de 64 " +
        "bytes de metadado por trecho, tudo cabe na memória dele. O preço é o ponto " +
        "quente em arquivos que ocupam um trecho só."
    },
    {
      question:
        "O GFS garante que uma anexação de registro seja gravada de forma atômica pelo " +
        "menos uma vez, e não garante que as réplicas fiquem idênticas byte a byte. Como " +
        "as aplicações convivem com isso?",
      options: [
        "Elas anexam em vez de sobrescrever, gravam pontos de checagem e escrevem registros com soma de verificação e identificador único, para descartar preenchimento e duplicata.",
        "Elas pedem ao mestre uma trava sobre a região do arquivo antes de anexar, o que serializa os escritores e devolve a garantia de cópia única.",
        "Elas leem sempre da réplica primária, que é a única com a versão correta do trecho, e ignoram as secundárias enquanto o arrendamento estiver ativo.",
        "Elas comparam as três réplicas byte a byte depois de cada anexação e repetem a operação até que as três apresentem exatamente o mesmo conteúdo."
      ],
      answer: 0,
      explanation:
        "A garantia que o usuário enxerga é do par formado pelo armazenamento e pela " +
        "aplicação, e não do armazenamento sozinho. As três técnicas já seriam úteis por " +
        "outros motivos, e é isso que distingue consistência relaxada de sistema mal " +
        "feito."
    },
    {
      question:
        "O HDFS aceita um escritor de cada vez, oferece só anexação e não tem anexação de " +
        "registro. Como essas três diferenças em relação ao GFS se relacionam?",
      options: [
        "São independentes entre si e cada uma resolve um problema diferente, o que explica por que o HDFS precisou de três mecanismos de recuperação distintos.",
        "São impostas pela linguagem em que o HDFS foi escrito, que não permite representar escritas concorrentes sobre o mesmo descritor de arquivo.",
        "São exigências do MapReduce, que só produz saída sequencial e por isso proíbe que um arquivo seja aberto por mais de um processo simultaneamente.",
        "Sustentam-se mutuamente, porque quem admite um escritor só não precisa de anexação atômica concorrente nem precisa aceitar réplicas divergentes."
      ],
      answer: 3,
      explanation:
        "O HDFS trocou generalidade por simplicidade em três lugares que se apoiam. Sem " +
        "concorrência não há o que serializar, e por isso ele remove do conjunto de " +
        "réplicas o nó que falhou, em vez de repetir a mutação e admitir réplicas " +
        "diferentes como o GFS faz."
    }
  ],

  glossary: [
    { term: "Sistema de arquivos distribuído", definition: "Serviço que permite guardar e ler arquivos remotos como se fossem locais, a partir de qualquer computador da rede, com desempenho e confiabilidade comparáveis aos de um disco local." },
    { term: "Metadados", definition: "Tudo o que o sistema de arquivos guarda para conseguir gerenciar arquivos, e não apenas para armazená-los. Cobre os atributos e, principalmente, os diretórios." },
    { term: "Atributo sombreado", definition: "Atributo mantido pelo próprio sistema de arquivos, fora do alcance dos programas de usuário. O tamanho do arquivo e os carimbos de tempo são os casos típicos." },
    { term: "Sistema de arquivos virtual (VFS)", definition: "Camada do núcleo que oferece às aplicações uma interface única sobre sistemas de arquivos diferentes. No NFS, é ela que separa o pedido local do pedido remoto e encaminha cada um ao módulo certo." },
    { term: "Semântica de cópia única (one-copy)", definition: "Modelo em que todo processo vê o conteúdo do arquivo como se existisse uma cópia só. É afirmação sobre comportamento observável, e cache e réplicas causam desvio inevitável por atrasarem a propagação das escritas." },
    { term: "Servidor sem estado (stateless)", definition: "Servidor que não guarda informação de sessão dos clientes. Depois de uma falha ele reinicia e retoma o atendimento sem procedimento de recuperação nenhum." },
    { term: "Operação idempotente", definition: "Operação que pode ser repetida sem que o resultado mude, o que permite ao cliente reenviar chamadas sem resposta com a semântica pelo menos uma vez." },
    { term: "Modelo de acesso remoto", definition: "Arranjo em que o arquivo permanece no servidor e o cliente pede cada operação. Facilita sustentar a consistência e cobra uma ida à rede por operação. É o do NFS." },
    { term: "Modelo de carregar e descarregar", definition: "Arranjo em que o cliente baixa o arquivo inteiro, opera na cópia local e a devolve ao terminar. Alivia o servidor e o deixa sem saber o que acontece com o arquivo no intervalo. É o do AFS." },
    { term: "Serviço de arquivos plano (flat file service)", definition: "Componente do modelo abstrato que implementa as operações sobre o conteúdo dos arquivos, referenciados por UFID. A interface tem seis operações e não tem open nem close." },
    { term: "UFID", definition: "Identificador único de arquivo, uma longa sequência de bits que nenhum outro arquivo do sistema distribuído repete. É por ele que o serviço de arquivos plano referencia cada arquivo." },
    { term: "Serviço de diretório", definition: "Componente do modelo abstrato que traduz nome textual em UFID, pela operação Lookup, e mantém os diretórios. Ele próprio é cliente do serviço de arquivos plano, porque cada diretório é guardado como arquivo comum." },
    { term: "Módulo cliente", definition: "Software que roda em cada cliente e integra os dois serviços numa interface parecida com a do sistema operacional local. Conhece a localização dos servidores e mantém a cache." },
    { term: "Grupo de arquivos", definition: "Conjunto de arquivos guardado em um servidor, que pode ser movido inteiro entre servidores. O UFID embute o identificador do grupo, e esse identificador garante unicidade sem localizar nada." },
    { term: "Manipulador de arquivo (file handle)", definition: "Identificador de arquivo do NFS, opaco para o cliente, que o guarda e devolve sem interpretar. Na implementação UNIX junta identificador do sistema de arquivos, i-node e número de geração." },
    { term: "Número de geração", definition: "Campo do manipulador de arquivo que é incrementado sempre que um i-node é reutilizado. Sem ele, um manipulador guardado por um cliente voltaria a ser válido para um arquivo diferente." },
    { term: "Montagem (mount)", definition: "Ato de anexar ao espaço de nomes local uma subárvore exportada por um servidor. Como o ponto de montagem é escolhido pelo cliente, o mesmo arquivo pode ter nomes de caminho diferentes em clientes diferentes." },
    { term: "Montagem automática (automounter)", definition: "Processo que monta um diretório remoto sob demanda, ao primeiro acesso. Sondando vários servidores com cópias idênticas de um sistema de arquivos só de leitura, oferece de graça uma forma limitada de replicação e de balanceamento." },
    { term: "Validação por Tc e Tm", definition: "Regra de cache do cliente NFS, em que o bloco vale se o tempo desde a última validação for menor que o intervalo t, ou se o carimbo de modificação guardado bater com o do servidor. A primeira metade se avalia sem tocar no servidor." },
    { term: "Vice e Venus", definition: "Os dois processos do AFS, em nível de usuário. Vice é o servidor e aceita requisições só em termos de fid, e Venus é o módulo cliente, que traduz nomes de caminho, gerencia a cache em disco e recebe callbacks." },
    { term: "Promessa de callback", definition: "Tíquete que o servidor AFS entrega junto com a cópia de um arquivo, garantindo avisar o cliente se outro cliente o modificar. Enquanto o tíquete estiver válido, a cópia local é aberta sem nenhuma ida à rede." },
    { term: "Volume", definition: "No AFS, unidade de agrupamento, localização e movimentação de arquivos, tipicamente um por usuário. Um banco de dados de localização replicado diz em qual servidor cada volume está." },
    { term: "Arrendamento (lease)", definition: "Concessão com prazo. Se o detentor some, o servidor apenas espera o prazo expirar em vez de precisar decidir se ele morreu ou está incomunicável. Aparece no NQNFS, no NFS versão 4 e no arrendamento de trecho do GFS." },
    { term: "Trecho (chunk)", definition: "Pedaço de tamanho fixo em que o GFS divide cada arquivo, de 64 MB, com identificador imutável de 64 bits e replicado por padrão em três chunkservers. O HDFS chama a mesma coisa de bloco." },
    { term: "Anexação de registro (record append)", definition: "Operação do GFS em que o cliente informa apenas o que quer gravar e o sistema escolhe o deslocamento, gravando de forma atômica pelo menos uma vez. Permite que centenas de máquinas anexem ao mesmo arquivo sem combinar nada." },
    { term: "Região consistente e região definida", definition: "No GFS, uma região é consistente quando todos os clientes leem a mesma coisa, seja qual for a réplica, e é definida quando, além disso, mostra por inteiro o que a mutação escreveu. Escritas concorrentes deixam a região consistente e indefinida." },
    { term: "NameNode e DataNode", definition: "Os dois papéis do HDFS. O NameNode guarda os metadados e o espaço de nomes, e cada DataNode guarda blocos e envia ao NameNode mensagens periódicas de heartbeat e de blockreport." },
    { term: "Mover a computação para os dados", definition: "Princípio que o GFS e o HDFS viabilizam ao informar onde cada região do arquivo está guardada, o que permite ao escalonador enviar a tarefa para a máquina que já tem o dado. Vale porque o código costuma ser bem menor que o arquivo." },
    { term: "Armazenamento de objetos", definition: "Alternativa ao sistema de arquivos distribuído, em que cada objeto tem uma chave dentro de um balde, é lido e escrito por inteiro e é imutável depois de escrito. O caminho com barras é convenção, e não existe diretório de verdade." }
  ],

  references: [
    "COULOURIS, G.; DOLLIMORE, J.; KINDBERG, T.; BLAIR, G. Sistemas Distribuídos: " +
    "Conceitos e Projeto. 5. ed. Porto Alegre: Bookman, 2013. Cap. 12. Sistemas de " +
    "Arquivos Distribuídos (pp. 521-564). Fonte principal deste tópico, de onde vêm os " +
    "requisitos, o modelo abstrato de três componentes, os dois estudos de caso e os " +
    "aprimoramentos posteriores. É também o esqueleto, porque a 4. ed. do van Steen " +
    "eliminou o capítulo de sistemas de arquivos distribuídos.",
    "GHEMAWAT, S.; GOBIOFF, H.; LEUNG, S.-T. The Google File System. In: SOSP, 2003. " +
    "Fonte da seção 5, com as observações de carga que motivam o projeto, a arquitetura " +
    "de mestre e chunkservers, o modelo de consistência com região consistente e " +
    "definida, a anexação de registro e as medições em agregados reais.",
    "COULOURIS, G. et al. Op. cit. Cap. 21. Projeto de Sistemas Distribuídos: Estudo de " +
    "Caso do Google, seção 21.5.1 (pp. 935-940). Situa o GFS dentro da infraestrutura do " +
    "Google e é a fonte da separação entre fluxo de controle e fluxo de dados, do que o " +
    "GFS deixa de colocar em cache e da leitura do esquema como replicação passiva " +
    "modificada.",
    "VAN STEEN, M.; TANENBAUM, A. S. Distributed Systems. 4. ed. (versão DS 4.03). " +
    "distributed-systems.net, 2023. Seções 2.3.3 e 6.3.5. Fonte do contraste entre o " +
    "modelo de acesso remoto e o de carregar e descarregar, da arquitetura em camadas do " +
    "NFS com o sistema de arquivos virtual, e da nomeação por montagem, com o manipulador " +
    "de arquivo opaco e o que a versão 4 do protocolo mudou.",
    "HWANG, K.; FOX, G.; DONGARRA, J. Distributed and Cloud Computing. Waltham: Morgan " +
    "Kaufmann, 2011. Cap. 6. Cloud Programming and Software Environments, seção 6.2.3. " +
    "Fonte do HDFS, com o NameNode e os DataNodes, a política de colocação de réplicas " +
    "por rack, as mensagens de heartbeat e blockreport e o fluxo de leitura e de escrita.",
    "RAPTIS, D. Distributed Systems for Practitioners. Cap. 7. Case studies. Leitura " +
    "complementar que compara GFS e HDFS lado a lado, com a tabela do modelo de " +
    "consistência e as três simplificações do HDFS.",
    "KLEPPMANN, M. Designing Data-Intensive Applications. 2. ed. Sebastopol: O'Reilly, " +
    "2026. Cap. 11. Batch Processing, seções sobre sistemas de arquivos distribuídos e " +
    "armazenamento de objetos. Leitura complementar que atualiza o assunto, com o " +
    "princípio de nada compartilhado, os códigos de apagamento e a comparação entre " +
    "sistema de arquivos distribuído e armazenamento de objetos."
  ]
};
