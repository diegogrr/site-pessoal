/* ============================================================
   topic-10.js — Replicação
   ------------------------------------------------------------
   Estrutura documentada no modelo topic-01.js (sections[] com
   slides[] opcionais, quiz[], glossary[], references[]).
   Conteúdo baseado em: COULOURIS et al., cap. 18 (pp. 765–816);
   VAN STEEN; TANENBAUM, 4. ed., cap. 7 e KLEPPMANN, cap. 5
   (leituras complementares).
   ============================================================ */

window.SD = window.SD || {};
SD.content = SD.content || {};

SD.content["10"] = {

  sections: [
    {
      title: "Por que replicar e o modelo de sistema",
      html:
        "<p>Nos tópicos anteriores, o DNS mantinha cada zona em pelo menos dois " +
        "servidores e o NFS guardava blocos em cache: os dois <strong>replicam</strong> " +
        "dados: mantêm cópias em vários computadores. A replicação é o segredo " +
        "da eficácia dos sistemas distribuídos, e tem três motivações que vale " +
        "separar.</p>" +

        "<h3>Desempenho, disponibilidade, tolerância a falhas</h3>" +
        "<p><strong>Desempenho</strong>: caches de cliente e proxy evitam a " +
        "latência de ir ao servidor de origem, e o balanceamento espalha a carga " +
        "(lembre do rodízio de registros <code>A</code> do DNS). Replicar dados " +
        "<em>imutáveis</em> é barato; replicar dados <em>mutáveis</em> custa os " +
        "protocolos que mantêm as cópias atualizadas. Há um limite para esse " +
        "ganho. <strong>Disponibilidade</strong>: a fração do tempo em que o " +
        "serviço responde bem deve ser próxima de 100%. Se cada um de " +
        "<em>n</em> servidores falha de forma independente com probabilidade " +
        "<em>p</em>, a disponibilidade do objeto é <strong>1 − p<sup>n</sup></strong>" +
        ": com 2 servidores a 5% de falha, sobe de 95% para 99,75%. O outro " +
        "inimigo da disponibilidade é o <strong>particionamento da rede</strong> " +
        "e a <strong>operação desconectada</strong> (o usuário no trem, com o " +
        "notebook fora da rede). <strong>Tolerância a falhas</strong>: dado " +
        "altamente disponível não é o mesmo que <em>rigorosamente correto</em>: " +
        "pode estar desatualizado. Um serviço tolerante a falhas garante " +
        "comportamento correto apesar de um certo número e tipo de falhas: com " +
        "<strong>f + 1</strong> réplicas sobrevive a <em>f</em> colapsos; com " +
        "<strong>2f + 1</strong>, mascara <em>f</em> falhas bizantinas (os " +
        "corretos vencem os falhos por voto).</p>" +

        "<p>Dois requisitos atravessam tudo: a <strong>transparência de " +
        "replicação</strong> (o cliente vê um objeto lógico só, não as cópias " +
        "físicas) e a <strong>consistência</strong> (as operações sobre o " +
        "conjunto de réplicas devem produzir resultados que respeitem a " +
        "especificação de correção: com o rigor que a aplicação exigir).</p>" +

        "<h3>O modelo: réplicas, gerenciadores e front-ends</h3>" +
        "<p>Cada <strong>objeto</strong> lógico (um arquivo, uma conta) é " +
        "implementado por várias cópias físicas, as <strong>réplicas</strong>, " +
        "guardadas por <strong>gerenciadores de réplica</strong> (GR): os " +
        "servidores que executam operações sobre elas. As réplicas não são " +
        "necessariamente idênticas a cada instante: algumas podem ter recebido " +
        "atualizações que outras ainda não. O cliente não fala direto com os GR: " +
        "um <strong>front-end</strong> (FE) recebe a requisição e conversa com " +
        "um ou mais gerenciadores. É ele que torna a replicação transparente. " +
        "Muitas vezes exige-se que cada GR seja uma <strong>máquina de " +
        "estados</strong>: aplica operações de forma atômica e determinística, " +
        "de modo que o estado final é função só do estado inicial e da " +
        "<em>sequência</em> de operações: sem isso, réplicas que aceitam " +
        "atualizações independentes não teriam como convergir.</p>" +

        "<h3>As cinco fases de uma requisição</h3>" +
        "<p>Processar uma requisição sobre dados replicados passa por até cinco " +
        "fases, e é na <em>escolha</em> de como fazer cada uma que os sistemas " +
        "diferem: <strong>(1) Requisição</strong>: o FE emite a requisição a " +
        "um GR ou a todos (multicast); <strong>(2) Coordenação</strong>: os GR " +
        "combinam <em>se</em> e em que <strong>ordem</strong> aplicar a " +
        "requisição; <strong>(3) Execução</strong>; <strong>(4) Acordo</strong>" +
        ": chegam a consenso sobre o efeito a confirmar; <strong>(5) " +
        "Resposta</strong>. A ordem da fase 2 pode ser <strong>FIFO</strong> " +
        "(preserva a ordem de emissão de cada FE), <strong>causal</strong> " +
        "(preserva 'aconteceu-antes') ou <strong>total</strong> (todos os GR " +
        "aplicam na mesma ordem): quanto mais forte a ordem, mais coordenação " +
        "custa.</p>",
      slides: [
        {
          title: "Três motivações para replicar",
          html:
            "<ul>" +
            "<li><strong>Desempenho</strong>: cache e balanceamento (imutável é " +
            "barato; mutável custa)</li>" +
            "<li><strong>Disponibilidade</strong>: sobreviver a falhas e " +
            "partições/desconexão</li>" +
            "<li><strong>Tolerância a falhas</strong>: comportamento " +
            "rigorosamente correto apesar de falhas</li>" +
            "</ul>"
        },
        {
          title: "Disponibilidade e número de réplicas",
          html:
            "<ul>" +
            "<li>Falha independente <em>p</em> em <em>n</em> servidores ⇒ " +
            "disponibilidade <strong>1 − p<sup>n</sup></strong></li>" +
            "<li>2 servidores a 5% ⇒ 95% vira <strong>99,75%</strong></li>" +
            "<li><strong>f + 1</strong> réplicas toleram <em>f</em> colapsos</li>" +
            "<li><strong>2f + 1</strong> mascaram <em>f</em> falhas bizantinas " +
            "(voto)</li>" +
            "</ul>"
        },
        {
          title: "O modelo de gerenciamento",
          html:
            "<ul>" +
            "<li><strong>Objeto</strong> lógico ⇒ várias <strong>réplicas</strong> " +
            "físicas</li>" +
            "<li><strong>Gerenciador de réplica (GR)</strong> executa as " +
            "operações</li>" +
            "<li><strong>Front-end</strong> torna a replicação transparente</li>" +
            "<li><strong>Máquina de estados</strong>: determinística, aplica na " +
            "sequência</li>" +
            "</ul>"
        },
        {
          title: "As cinco fases (e a ordenação)",
          html:
            "<ul>" +
            "<li>Requisição → Coordenação → Execução → Acordo → Resposta</li>" +
            "<li>A coordenação decide <em>se</em> e em que <strong>ordem</strong></li>" +
            "<li><strong>FIFO</strong> × <strong>causal</strong> × " +
            "<strong>total</strong></li>" +
            "<li>Mais ordem = mais coordenação = mais custo</li>" +
            "</ul>"
        }
      ]
    },

    {
      title: "Serviços tolerantes a falhas: passiva × ativa",
      html:
        "<p>Um serviço replicado é <strong>correto</strong> se os clientes não " +
        "conseguem distingui-lo de um único servidor correto. Sem cuidado, " +
        "surgem anomalias. Imagine dois GR (A e B) com réplicas de duas contas " +
        "<code>x</code> e <code>y</code> (ambas $0), que propagam atualizações " +
        "em segundo plano. O cliente 1 faz <code>x:=1</code> em B, depois " +
        "<code>y:=2</code> (mas B caiu, então vai em A). O cliente 2, lendo em " +
        "A, vê <code>y=2</code> e <strong><code>x=0</code></strong>: a escrita " +
        "de <code>x</code> não chegou. Isso <em>jamais</em> aconteceria com um " +
        "servidor único: se <code>y</code> foi atualizado <em>depois</em> de " +
        "<code>x</code>, quem vê o novo <code>y</code> tinha de ver o novo " +
        "<code>x</code>. Para evitar isso, precisamos definir a correção.</p>" +

        "<h3>Linearização × consistência sequencial</h3>" +
        "<p>Um serviço é <strong>linearizável</strong> se existe uma " +
        "<strong>interposição</strong> (intercalação) das operações de todos os " +
        "clientes tal que (1) ela satisfaz a especificação de uma <em>única " +
        "cópia</em> correta e (2) a ordem respeita os <strong>tempos reais</strong> " +
        "em que as operações ocorreram. É o critério mais forte, e o " +
        "problemático, pois exige relógios sincronizados com precisão. A " +
        "<strong>consistência sequencial</strong> mantém (1), mas troca (2) por: " +
        "a ordem respeita a <strong>ordem do programa</strong> de cada cliente " +
        "(sem apelar ao tempo real). É como embaralhar vários maços de cartas " +
        "preservando a ordem interna de cada maço. Todo serviço linearizável é " +
        "sequencialmente consistente; a recíproca é falsa. A consistência " +
        "sequencial é mais fraca, porém <strong>exequível</strong>, e é o alvo " +
        "prático da maioria dos sistemas.</p>" +

        "<h3>Replicação passiva (backup primário)</h3>" +
        "<p>Há um único GR <strong>primário</strong> e um ou mais " +
        "<strong>backups</strong>. O FE só fala com o primário, que: trata as " +
        "requisições em ordem (fase de coordenação), executa, envia o " +
        "<strong>estado atualizado</strong> aos backups (acordo) e responde. Se " +
        "o primário cai, um backup é <strong>promovido</strong>: de forma " +
        "segura, graças à <strong>comunicação em grupo com modo de visualização " +
        "síncrono</strong>, que garante que todos os backups viram o mesmo " +
        "conjunto de atualizações antes da troca de modo de visualização. Como o " +
        "primário sequencia tudo, o sistema é <strong>linearizável</strong>. " +
        "Precisa de <strong>f + 1</strong> réplicas para <em>f</em> colapsos " +
        "(não tolera bizantinas), e o FE quase não faz nada: só reencontra o " +
        "novo primário quando o atual não responde. O preço são as várias " +
        "rodadas de comunicação e a latência do <em>failover</em>. É a estratégia " +
        "do sistema de arquivos Harp e do NIS da Sun.</p>" +

        "<h3>Replicação ativa (máquinas de estado)</h3>" +
        "<p>Aqui os GR têm papéis <strong>equivalentes</strong>. O FE envia a " +
        "requisição por <strong>multicast totalmente ordenado e confiável</strong> " +
        "ao grupo; como todos são máquinas de estado e recebem as requisições na " +
        "<em>mesma ordem total</em>, todos processam de forma idêntica e " +
        "respondem: <strong>nenhuma fase de acordo</strong> é necessária. A " +
        "falha de um GR não afeta o serviço: os demais seguem respondendo. Para " +
        "<em>f</em> colapsos bastam <strong>f + 1</strong> réplicas; para " +
        "mascarar <em>f</em> falhas <strong>bizantinas</strong>, usam-se " +
        "<strong>2f + 1</strong> réplicas e o FE espera <strong>f + 1 respostas " +
        "idênticas</strong> (voto da maioria, com assinaturas). O modelo alcança " +
        "<strong>consistência sequencial</strong>, mas <em>não</em> linearização: " +
        "a ordem total em que as réplicas processam não coincide " +
        "necessariamente com o tempo real das requisições. E há um porém " +
        "fundamental: multicast totalmente ordenado e confiável é " +
        "<strong>equivalente ao consenso</strong>: que, num sistema assíncrono, " +
        "exige detectores de falha para contornar a impossibilidade de FLP.</p>" +

        "<div class=\"callout\">" +
        "<p class=\"callout-title\">💡 Passiva × ativa, em uma linha</p>" +
        "<p><strong>Passiva</strong>: um cérebro (o primário) pensa, os backups " +
        "copiam o resultado: linearizável, tolera só colapsos, sofre no " +
        "failover. <strong>Ativa</strong>: todos pensam igual, em coro: " +
        "sequencialmente consistente, esconde a falha sem pausa e pode " +
        "enfrentar bizantinos, ao custo de um multicast ordenado (isto é, " +
        "consenso).</p>" +
        "</div>",
      slides: [
        {
          title: "Correção: a anomalia bancária",
          html:
            "<ul>" +
            "<li>Serviço correto = indistinguível de um servidor único</li>" +
            "<li>2 GR + propagação em segundo plano ⇒ cliente vê " +
            "<code>y=2</code>, <code>x=0</code></li>" +
            "<li>Impossível com uma cópia só: precisa definir a correção</li>" +
            "</ul>"
        },
        {
          title: "Linearização × sequencial",
          html:
            "<ul>" +
            "<li>Ambas: interposição que satisfaz a <strong>cópia única</strong></li>" +
            "<li><strong>Linearização</strong>: ordem respeita o <strong>tempo " +
            "real</strong> (mais forte, exige relógios)</li>" +
            "<li><strong>Sequencial</strong>: ordem respeita a <strong>ordem do " +
            "programa</strong> de cada cliente</li>" +
            "<li>Linearizável ⇒ sequencial; a recíproca é falsa</li>" +
            "</ul>"
        },
        {
          title: "Replicação passiva (backup primário)",
          html:
            "<ul>" +
            "<li>Primário sequencia, executa, envia o <strong>estado</strong> " +
            "aos backups, responde</li>" +
            "<li>Falha ⇒ backup promovido via <strong>modo de visualização " +
            "síncrono</strong></li>" +
            "<li><strong>Linearizável</strong> · <strong>f + 1</strong> réplicas " +
            "· só colapsos</li>" +
            "<li>Preço: rodadas de comunicação + latência do failover (Harp, " +
            "NIS)</li>" +
            "</ul>"
        },
        {
          title: "Replicação ativa (máquinas de estado)",
          html:
            "<ul>" +
            "<li>FE faz <strong>multicast totalmente ordenado</strong> ao grupo</li>" +
            "<li>Todos processam idêntico: sem fase de acordo</li>" +
            "<li><strong>Sequencial</strong> (não linearizável); f + 1 colapsos, " +
            "<strong>2f + 1</strong> bizantinas</li>" +
            "<li>Multicast ordenado ≡ <strong>consenso</strong> (FLP + " +
            "detectores)</li>" +
            "</ul>"
        },
        {
          title: "Passiva × ativa",
          html:
            "<ul>" +
            "<li><strong>Passiva</strong>: um pensa, os outros copiam: forte, " +
            "mas pausa no failover</li>" +
            "<li><strong>Ativa</strong>: todos pensam em coro: esconde a falha " +
            "sem pausa, enfrenta bizantinos</li>" +
            "<li>Troca: garantia × custo de coordenação</li>" +
            "</ul>"
        }
      ]
    },

    {
      title: "Alta disponibilidade: Gossip, Bayou e Coda",
      html:
        "<p>Os serviços tolerantes a falhas propagam atualizações de forma " +
        "<strong>ávida</strong>: todos os GR corretos recebem a atualização e " +
        "concordam <em>antes</em> de responder ao cliente. Para " +
        "<strong>alta disponibilidade</strong>, isso é ruim: o cliente fica " +
        "bloqueado esperando a coordenação. A ideia agora é dar um serviço " +
        "aceitável usando o <strong>mínimo</strong> de réplicas conectadas ao " +
        "cliente, propagando o resto <strong>preguiçosamente</strong>. O " +
        "princípio geral: <strong>consistências mais fracas exigem menos acordo " +
        "e liberam mais disponibilidade</strong>. Três sistemas ilustram o " +
        "espectro.</p>" +

        "<h3>Gossip: fofoca e carimbos de tempo vetoriais</h3>" +
        "<p>Na arquitetura <strong>Gossip</strong> (fofoca), o front-end manda " +
        "cada consulta/atualização ao GR que quiser (o disponível e mais " +
        "rápido), e os GR trocam mensagens de <strong>fofoca</strong> " +
        "periodicamente para repassar o que receberam. Duas garantias, mesmo com " +
        "GR temporariamente incomunicáveis: <strong>cada cliente vê um serviço " +
        "consistente ao longo do tempo</strong> (uma consulta nunca devolve algo " +
        "<em>anterior</em> às atualizações que o cliente já viu: mesmo trocando " +
        "de GR) e <strong>consistência relaxada entre réplicas</strong> (todos " +
        "acabam recebendo todas as atualizações). O truque é o " +
        "<strong>carimbo de tempo vetorial</strong>: o FE guarda um vetor " +
        "<code>prev</code> da versão que já viu e o envia em cada requisição; um " +
        "GR só aplica a consulta quando seu valor é <em>pelo menos</em> tão " +
        "recente. A ordenação padrão é <strong>causal</strong> (barata); há " +
        "ainda <strong>forçada</strong> (total) e <strong>imediata</strong> para " +
        "quando a aplicação precisa.</p>" +

        "<h3>Bayou: transformação operacional</h3>" +
        "<p>O <strong>Bayou</strong> também troca atualizações aos pares " +
        "(<strong>antientropia</strong>), mas aposta na <strong>detecção e " +
        "solução de conflitos específicas do domínio</strong>. Desconectados, o " +
        "executivo e a secretária podem <em>ambos</em> marcar compromissos; cada " +
        "atualização é aplicada localmente como <strong>de tentativa</strong>. " +
        "Quando as réplicas se encontram, o Bayou detecta o choque e o resolve " +
        "por uma política do domínio (ex.: prioridade do executivo): desfazendo " +
        "ou alterando operações. Esse ajuste chama-se <strong>transformação " +
        "operacional</strong>. Toda atualização carrega uma <strong>verificação " +
        "de dependência</strong> (há conflito?) e um <strong>procedimento de " +
        "integração</strong> (como contornar). As atualizações passam de " +
        "<em>tentativa</em> a <strong>confirmadas</strong> numa ordem canônica " +
        "(fixada por um GR primário). O resultado é uma espécie de " +
        "<strong>consistência sequencial final</strong>, mas a replicação " +
        "deixa de ser transparente: a aplicação precisa fornecer as verificações " +
        "e o usuário precisa conviver com dados de tentativa que podem mudar.</p>" +

        "<h3>Coda: operação desconectada</h3>" +
        "<p>O <strong>Coda</strong> é um descendente do AFS (Tópico 8) feito " +
        "para <strong>disponibilidade constante dos dados</strong>, mesmo " +
        "desconectado. Como o Bayou, é <strong>otimista</strong>: deixa o " +
        "cliente atualizar durante uma partição, apostando que conflitos são " +
        "raros e corrigíveis depois, mas detecta conflitos <em>sem</em> " +
        "conhecer a semântica dos arquivos e oferece pouca ajuda para resolvê-los. " +
        "Ele replica <strong>volumes</strong> (ao contrário do AFS, restrito a " +
        "volumes só-leitura): o conjunto de servidores com um volume é o " +
        "<strong>VSG</strong> (Volume Storage Group), e o subconjunto " +
        "<em>acessível</em> a um cliente é o <strong>AVSG</strong> (Available " +
        "VSG), que encolhe e cresce com as falhas. Antes de desconectar, o " +
        "cliente faz <strong>hoarding</strong>: enche a cache local com o " +
        "conjunto de trabalho para poder operar sozinho.</p>",
      slides: [
        {
          title: "De ávido a preguiçoso",
          html:
            "<ul>" +
            "<li>Tolerante a falhas: propagação <strong>ávida</strong>, todos " +
            "concordam antes de responder</li>" +
            "<li>Alta disponibilidade: mínimo de réplicas conectadas + " +
            "propagação <strong>preguiçosa</strong></li>" +
            "<li>Princípio: consistência mais fraca ⇒ menos acordo ⇒ mais " +
            "disponível</li>" +
            "</ul>"
        },
        {
          title: "Gossip: fofoca",
          html:
            "<ul>" +
            "<li>FE fala com qualquer GR; GR trocam <strong>fofoca</strong> " +
            "periódica</li>" +
            "<li>Cliente vê serviço <strong>consistente no tempo</strong> + " +
            "réplicas convergem</li>" +
            "<li><strong>Carimbo vetorial</strong> <code>prev</code>: só aplica " +
            "quando o valor é recente o bastante</li>" +
            "<li>Ordem <strong>causal</strong> (barata) / forçada / imediata</li>" +
            "</ul>"
        },
        {
          title: "Bayou: transformação operacional",
          html:
            "<ul>" +
            "<li>Antientropia aos pares + conflitos <strong>do domínio</strong></li>" +
            "<li>Atualização <strong>de tentativa</strong> → " +
            "<strong>confirmada</strong> (ordem canônica)</li>" +
            "<li>Cada uma traz <strong>verificação de dependência</strong> + " +
            "<strong>procedimento de integração</strong></li>" +
            "<li>Replicação <strong>não transparente</strong>: a app resolve os " +
            "conflitos</li>" +
            "</ul>"
        },
        {
          title: "Coda: operação desconectada",
          html:
            "<ul>" +
            "<li>Descendente do AFS · disponibilidade constante</li>" +
            "<li><strong>Otimista</strong>: atualiza na partição, resolve depois</li>" +
            "<li><strong>VSG</strong> (todos os servidores) × <strong>AVSG</strong> " +
            "(os acessíveis)</li>" +
            "<li><strong>Hoarding</strong>: enche a cache antes de desconectar</li>" +
            "</ul>"
        }
      ]
    },

    {
      title: "Transações replicadas e quóruns",
      html:
        "<p>Até aqui, os clientes faziam operações <em>isoladas</em>. Uma " +
        "<strong>transação</strong> é uma sequência de operações com garantias " +
        "ACID (Tópicos de coordenação). Sobre dados replicados, o efeito das " +
        "transações deve ser igual ao de executá-las uma a uma sobre um " +
        "<em>único</em> conjunto de objetos: propriedade chamada de " +
        "<strong>serializabilidade de uma cópia</strong> (parecida com a " +
        "consistência sequencial, mas para transações, não para operações " +
        "avulsas). A questão de projeto: quantos GR precisam participar de cada " +
        "leitura e de cada escrita?</p>" +

        "<h3>De 'um lê / todos escrevem' às cópias disponíveis</h3>" +
        "<p>O esquema mais simples é <strong>um lê / todos escrevem</strong>: a " +
        "leitura vai a um GR qualquer, a escrita a <em>todos</em>. Funciona, mas " +
        "qualquer GR indisponível <strong>trava</strong> as escritas. A " +
        "<strong>replicação de cópias disponíveis</strong> relaxa isso: a escrita " +
        "vai a todos os GR <em>disponíveis</em>. Ela tolera colapsos, mas " +
        "<strong>não</strong> o particionamento: duas partições escrevendo o " +
        "mesmo objeto divergem, e é preciso um procedimento de " +
        "<strong>validação</strong> ao reparar a rede.</p>" +

        "<h3>Consenso de quórum (Gifford)</h3>" +
        "<p>Para operar corretamente <em>durante</em> uma partição, Gifford " +
        "atribui um número de <strong>votos</strong> a cada cópia. Uma leitura " +
        "precisa reunir um <strong>quórum de leitura R</strong>; uma escrita, um " +
        "<strong>quórum de escrita W</strong>, respeitando duas regras:</p>" +
        "<ul>" +
        "<li><strong>W &gt; metade do total de votos</strong>: assim dois " +
        "quóruns de escrita sempre se cruzam (não há duas escritas conflitantes " +
        "em partições diferentes);</li>" +
        "<li><strong>R + W &gt; total de votos</strong>: assim todo quórum de " +
        "leitura cruza todo quórum de escrita, garantindo que a leitura enxergue " +
        "pelo menos uma cópia atualizada (identificada por número de versão).</li>" +
        "</ul>" +
        "<p>Só um subgrupo que reúna <strong>quórum</strong> pode prosseguir na " +
        "partição; os demais ficam bloqueados até a rede se reparar (quando os GR " +
        "se atualizam por procedimentos de recuperação). Ajustando R e W, o " +
        "projetista escolhe entre leituras baratas (R pequeno, W grande) e " +
        "escritas baratas. A <strong>partição virtual</strong> combina quórum " +
        "com cópias disponíveis: se a partição virtual tem quórum, usa cópias " +
        "disponíveis lá dentro.</p>" +

        "<div class=\"callout\">" +
        "<p class=\"callout-title\">💡 O botão R+W que a nuvem herdou</p>" +
        "<p>Esse quórum de 1979 é <em>exatamente</em> a regra <code>R + W &gt; " +
        "N</code> dos bancos de dados distribuídos modernos (Dynamo, Cassandra), " +
        "onde o operador ajusta N réplicas, R e W por requisição. E toda a " +
        "tensão deste tópico é o teorema <strong>CAP</strong>: sob " +
        "particionamento (P), escolhe-se entre <strong>consistência</strong> " +
        "(bloquear quem não tem quórum, como na replicação ativa) e " +
        "<strong>disponibilidade</strong> (deixar todos escreverem e reconciliar " +
        "depois, como no Gossip/Bayou/Coda e no próprio DNS do Tópico 9). Não " +
        "existe replicação 'certa': existe a troca que a aplicação escolhe.</p>" +
        "</div>",
      slides: [
        {
          title: "Serializabilidade de uma cópia",
          html:
            "<ul>" +
            "<li><strong>Transação</strong>: sequência de operações com ACID</li>" +
            "<li>Efeito sobre réplicas = uma a uma sobre um " +
            "<strong>conjunto único</strong></li>" +
            "<li>Como a consistência sequencial, mas para " +
            "<strong>transações</strong></li>" +
            "</ul>"
        },
        {
          title: "Um lê / todos escrevem → cópias disponíveis",
          html:
            "<ul>" +
            "<li><strong>Um lê / todos escrevem</strong>: simples, mas um GR " +
            "fora <strong>trava</strong> a escrita</li>" +
            "<li><strong>Cópias disponíveis</strong>: escreve nos GR disponíveis</li>" +
            "<li>Tolera colapso, <strong>não</strong> partição ⇒ validação ao " +
            "reparar</li>" +
            "</ul>"
        },
        {
          title: "Consenso de quórum (Gifford)",
          html:
            "<ul>" +
            "<li>Votos por cópia; leitura reúne <strong>R</strong>, escrita " +
            "<strong>W</strong></li>" +
            "<li><strong>W &gt; metade dos votos</strong> ⇒ escritas nunca " +
            "conflitam</li>" +
            "<li><strong>R + W &gt; total</strong> ⇒ leitura cruza escrita (vê " +
            "versão atual)</li>" +
            "<li>Só o subgrupo com <strong>quórum</strong> prossegue na partição</li>" +
            "</ul>"
        },
        {
          title: "O botão R+W e o CAP",
          html:
            "<ul>" +
            "<li>É a regra <code>R + W &gt; N</code> de Dynamo/Cassandra</li>" +
            "<li><strong>CAP</strong>: sob partição, consistência × " +
            "disponibilidade</li>" +
            "<li>Ativa/quórum escolhem C; Gossip/Bayou/Coda/DNS escolhem A</li>" +
            "<li>Não há replicação 'certa': há a troca que a app escolhe</li>" +
            "</ul>"
        }
      ]
    }
  ],

  quiz: [
    {
      question:
        "Um objeto é replicado em 3 servidores que falham de forma " +
        "independente, cada um com 10% de probabilidade de estar indisponível. " +
        "Qual é a disponibilidade do objeto (fórmula 1 − pⁿ)?",
      options: [
        "90%, porque basta um servidor estar indisponível para o objeto ficar inacessível.",
        "99,9%, porque o objeto só fica indisponível se os três falharem: 1 − 0,1³ = 1 − 0,001.",
        "70%, somando as probabilidades de falha dos três servidores.",
        "99,99%, porque a replicação sempre garante quatro noves de disponibilidade."
      ],
      answer: 1,
      explanation:
        "Com falhas independentes, o objeto só some se TODAS as cópias caírem: " +
        "probabilidade 0,1³ = 0,001. Logo a disponibilidade é 1 − 0,001 = " +
        "99,9%. Cada réplica extra multiplica a probabilidade de indisponibilidade " +
        "total. É o poder de 1 − pⁿ."
    },
    {
      question:
        "Qual é a diferença entre linearização e consistência sequencial?",
      options: [
        "A linearização vale para transações; a consistência sequencial, para operações isoladas.",
        "São critérios idênticos; os termos são intercambiáveis.",
        "Ambas exigem uma interposição que satisfaça a especificação de cópia única; a linearização exige ainda que a ordem respeite o tempo real, enquanto a sequencial exige apenas a ordem do programa de cada cliente.",
        "A consistência sequencial é a mais forte, porque usa relógios sincronizados para ordenar tudo."
      ],
      answer: 2,
      explanation:
        "As duas pedem uma intercalação das operações consistente com uma " +
        "única cópia correta. A linearização acrescenta o requisito do tempo " +
        "real (mais forte, mas exige relógios precisos); a sequencial só exige " +
        "respeitar a ordem do programa de cada cliente. Todo serviço " +
        "linearizável é sequencialmente consistente, mas não o contrário."
    },
    {
      question:
        "Quantos gerenciadores de réplica a replicação passiva exige para " +
        "tolerar até f falhas por colapso? E quantos a replicação ativa exige " +
        "para mascarar até f falhas bizantinas?",
      options: [
        "2f+1 na passiva e 3f+1 na ativa.",
        "f+1 para colapsos na passiva; 2f+1 para falhas bizantinas na ativa.",
        "f na passiva e f na ativa, em ambos os casos.",
        "f+1 nos dois casos, pois o tipo de falha não altera a contagem."
      ],
      answer: 1,
      explanation:
        "Para colapsos, basta que UM sobreviva: f+1 réplicas (a passiva só " +
        "tolera colapsos). Para mascarar falhas bizantinas, é preciso que os " +
        "corretos vençam os falhos por voto: com 2f+1 réplicas, o front-end " +
        "espera f+1 respostas idênticas e ignora o resto."
    },
    {
      question:
        "Na replicação ATIVA, o front-end envia a requisição por multicast " +
        "totalmente ordenado às réplicas, que são máquinas de estado. Que " +
        "garantia de consistência isso alcança, e por que não a mais forte?",
      options: [
        "Linearização, porque a ordem total sempre coincide com o tempo real das requisições.",
        "Nenhuma garantia, porque cada réplica processa a requisição de forma independente.",
        "Consistência apenas causal, porque o multicast usado é somente causal.",
        "Consistência sequencial: todas as réplicas processam na mesma ordem total (igual à ordem do programa de cada front-end), mas essa ordem total não coincide necessariamente com o tempo real das requisições."
      ],
      answer: 3,
      explanation:
        "O multicast totalmente ordenado faz todas as máquinas de estado " +
        "aplicarem a mesma sequência, garantindo consistência sequencial. Não é " +
        "linearização porque a ordem total escolhida pelo sistema pode diferir " +
        "da ordem temporal real em que os clientes emitiram as requisições."
    },
    {
      question:
        "A arquitetura Gossip abre mão da consistência sequencial estrita em " +
        "favor da disponibilidade. Que princípio geral ela ilustra?",
      options: [
        "Quanto mais forte a consistência exigida, mais coordenação (acordo) entre réplicas é necessária, e menos disponível o dado fica; consistências mais fracas exigem menos acordo e liberam disponibilidade.",
        "Réplicas que trocam mensagens de fofoca nunca chegam a convergir.",
        "Alta disponibilidade só é possível com replicação ativa e multicast ordenado.",
        "O uso de cache no cliente sempre garante a linearização das leituras."
      ],
      answer: 0,
      explanation:
        "É a troca central da replicação: consistência forte exige que as " +
        "réplicas se coordenem bastante antes de responder, o que reduz a " +
        "disponibilidade; afrouxar a consistência (fofoca preguiçosa) reduz o " +
        "acordo necessário e mantém o serviço acessível mesmo com réplicas " +
        "incomunicáveis. Elas convergem com o tempo (consistência relaxada)."
    },
    {
      question:
        "No consenso de quórum de Gifford, atribuem-se votos às cópias e " +
        "definem-se um quórum de leitura R e um de escrita W. Que condições " +
        "garantem a correção sob particionamento?",
      options: [
        "R = W = total de votos, para que todas as cópias participem de toda operação.",
        "R + W < total de votos, para permitir que partições independentes operem em paralelo.",
        "W > metade do total de votos E R + W > total de votos: assim todo quórum de leitura cruza todo quórum de escrita, e dois quóruns de escrita sempre se cruzam.",
        "R > W sempre, para que as leituras tenham prioridade sobre as escritas."
      ],
      answer: 2,
      explanation:
        "W > metade dos votos garante que dois quóruns de escrita se " +
        "sobreponham (nada de escritas conflitantes em partições distintas); " +
        "R + W > total garante que todo quórum de leitura cruze todo quórum de " +
        "escrita, então a leitura sempre alcança pelo menos uma cópia atualizada " +
        "(reconhecida pelo número de versão). Só o subgrupo com quórum opera."
    }
  ],

  glossary: [
    { term: "Replicação", definition: "Manutenção de cópias dos dados em vários computadores, para melhorar desempenho, disponibilidade ou tolerância a falhas." },
    { term: "Gerenciador de réplica (GR)", definition: "Componente (servidor) que contém réplicas em um computador e executa operações diretamente sobre elas; muitas vezes modelado como uma máquina de estados determinística." },
    { term: "Front-end (FE)", definition: "Componente que recebe a requisição do cliente e se comunica com um ou mais gerenciadores de réplica, tornando a replicação transparente para o cliente." },
    { term: "Transparência de replicação", definition: "Propriedade pela qual o cliente enxerga um único objeto lógico e recebe um único conjunto de valores, sem saber que há várias cópias físicas." },
    { term: "Disponibilidade (1 − pⁿ)", definition: "Fração do tempo em que o serviço responde adequadamente; com n servidores que falham independentemente com probabilidade p, vale 1 − pⁿ para o objeto replicado." },
    { term: "Tolerância a falhas (f+1, 2f+1)", definition: "f+1 réplicas toleram f falhas por colapso; 2f+1 réplicas mascaram f falhas bizantinas, fazendo os gerenciadores corretos vencerem os falhos por voto." },
    { term: "Modo de visualização síncrono", definition: "Comunicação em grupo que entrega a mesma sequência de modos de visualização e o mesmo conjunto de mensagens em cada modo, permitindo troca segura de primário na replicação passiva." },
    { term: "Linearização", definition: "Critério de correção mais forte: existe uma intercalação das operações que satisfaz a especificação de cópia única E respeita a ordem do tempo real em que ocorreram." },
    { term: "Consistência sequencial", definition: "Critério mais fraco e exequível: existe uma intercalação que satisfaz a cópia única e respeita a ordem do programa de cada cliente, sem apelar ao tempo real." },
    { term: "Replicação passiva (backup primário)", definition: "Um GR primário sequencia e executa as operações e envia o estado atualizado aos backups; se falha, um backup é promovido. É linearizável e tolera f colapsos com f+1 réplicas." },
    { term: "Replicação ativa", definition: "GR equivalentes que recebem as requisições por multicast totalmente ordenado e as processam de forma idêntica (máquinas de estado). Alcança consistência sequencial e pode mascarar falhas bizantinas." },
    { term: "Ordenação (FIFO, causal, total)", definition: "Garantias sobre a ordem de aplicação das requisições: FIFO (por front-end), causal (respeita aconteceu-antes) e total (mesma ordem em todos os GR); ordens mais fortes custam mais coordenação." },
    { term: "Arquitetura Gossip", definition: "Serviço de alta disponibilidade em que os GR trocam mensagens de 'fofoca' preguiçosamente; usa carimbos de tempo vetoriais para dar a cada cliente um serviço consistente no tempo e consistência relaxada entre réplicas." },
    { term: "Transformação operacional (Bayou)", definition: "Estratégia em que atualizações são aplicadas como 'de tentativa' e, ao encontrar conflitos, são desfeitas ou alteradas por procedimentos de integração específicos do domínio, até serem 'confirmadas'." },
    { term: "Operação desconectada (Coda, VSG/AVSG)", definition: "Capacidade de continuar trabalhando com réplicas locais enquanto se está desconectado; o Coda replica volumes (VSG = todos os servidores, AVSG = os acessíveis) e faz hoarding da cache antes da desconexão." },
    { term: "Consenso de quórum (Gifford)", definition: "Esquema de votos por cópia em que a leitura reúne R votos e a escrita W, com W > metade dos votos e R + W > total, garantindo que quóruns de escrita se cruzem entre si e com os de leitura." }
  ],

  references: [
    "COULOURIS, G. et al. Sistemas Distribuídos: Conceitos e Projeto. 5. ed. Cap. 18. Replicação (pp. 765-816).",
    "VAN STEEN, M.; TANENBAUM, A. S. Distributed Systems. 4. ed. Cap. 7. Consistency and Replication (leitura complementar).",
    "KLEPPMANN, M. Designing Data-Intensive Applications. Cap. 5. Replication (consistência eventual, quóruns e liderança; aprofundamento moderno)."
  ]
};
