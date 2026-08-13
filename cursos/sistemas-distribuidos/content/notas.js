/* ============================================================
   content/notas.js: Notas de aprofundamento
   (sem travessão nem no comentário: o teste cobre o arquivo
   inteiro, porque quase tudo aqui é texto que o aluno lê)
   ------------------------------------------------------------
   Explicação longa de termos que uma definição de glossário
   (duas linhas) não resolve. Cada nota é identificada por um
   slug e o texto dela vive AQUI e em nenhum outro lugar: o
   mesmo termo pode ser citado por vários roteiros de prática e,
   mais adiante, pelo glossário do app.

   Campos de cada nota:
     termo  → título exibido no cabeçalho da nota
     html   → corpo (HTML já pronto)
     leia[] → ponteiros opcionais { rotulo, topico } para o curso;
              quem consome monta a URL (o roteiro de prática está
              dois níveis abaixo de app/, o app está na raiz).
     figura → opcional { src, alt, legenda, largura, altura, fonte }. O src é
              relativo à raiz de app/ e quem consome monta a URL, pela
              mesma razão do leia[]. O lugar dela no texto é marcado
              com {{figura}}; sem o marcador, ela entra no fim.
              O alt não é enfeite: é o que resta para quem usa leitor
              de tela e para quando a imagem não carrega.
              O fonte é obrigatório quando a figura reproduz o desenho
              de um autor com as legendas traduzidas, e proibido quando
              o desenho é original do projeto. Ele sai logo abaixo da
              imagem, e o formato exato está em docs/fontes/README.md,
              seção 4.1 (sobrenomes e ano da edição, sem página).

   Escopo: a nota explica o que o aluno precisa para entender o
   que acabou de acontecer na tela, não o assunto inteiro.
   Aprofundamento é papel do tópico e da bibliografia.
   Namespace global: SD.notas
   ============================================================ */

window.SD = window.SD || {};
SD.notas = SD.notas || {};

SD.notas["algoritmo-de-cristian"] = {
  termo: "Algoritmo de Cristian",
  html:
    "<p>O <code>sd relogios</code> monta a comparação com três marcas de tempo, que é o " +
    "raciocínio que Flaviu Cristian publicou em 1989 para acertar o relógio de uma " +
    "máquina perguntando a hora para outra:</p>" +
    "<ol>" +
    "<li><strong>t0</strong>, no seu relógio, quando a pergunta sai;</li>" +
    "<li><strong>T</strong>, no relógio do outro nó, quando ele responde;</li>" +
    "<li><strong>t1</strong>, no seu relógio, quando a resposta chega.</li>" +
    "</ol>" +
    "<p>Você sabe que o outro nó marcou <strong>T</strong> em algum instante entre t0 e " +
    "t1, mas não sabe em qual. O algoritmo aposta no meio: supõe que a ida custou metade " +
    "da viagem e que, no instante t1, o relógio do outro marcava " +
    "<code>T + (t1 - t0) / 2</code>, e o <strong>desvio estimado</strong> é a diferença " +
    "entre esse valor e o seu próprio t1.</p>" +
    "<p>Se a aposta estiver no pior caso possível (a mensagem gastou tudo na ida, ou tudo " +
    "na volta), o erro chega a metade do tempo de ida e volta, para mais ou para menos. É " +
    "daí que sai a linha <strong>incerteza</strong>: com 2,117 ms de ida e volta, ±1,059 " +
    "ms. Qualquer desvio menor do que isso é indistinguível de zero, e é por isso que o " +
    "veredito se recusa a afirmar que os relógios diferem.</p>" +
    "<p>Repare no que a fórmula não contém: a qualidade dos relógios. A incerteza vem do " +
    "tempo de ida e volta que você mediu, venha ele da rede ou do software. " +
    "<strong>Perguntar as horas para uma máquina mais distante dá uma resposta " +
    "pior</strong>, e perguntar por um caminho com mais camadas de software no meio " +
    "também, por melhor que seja o relógio dela. O passo 5 mostrou do que essa janela é " +
    "feita: boa parte dela é software, não distância.</p>",
  leia: [
    { rotulo: "Modelos de Sistema: desvio de relógio e ordenação de eventos", topico: "02" }
  ]
};

SD.notas["curl-tempos"] = {
  termo: "Os tempos do curl",
  html:
    "<p>O <code>-w</code> (<code>--write-out</code>) manda o <code>curl</code> imprimir um " +
    "texto seu quando a chamada termina, trocando cada <code>%{variável}</code> pelo valor " +
    "medido. O <code>-o /dev/null</code> joga o corpo da resposta fora e o <code>-s</code> " +
    "cala a barra de progresso, então o que sobra na tela é só o seu formato. O nome da " +
    "região no começo da linha é o <code>echo</code> do laço, não é do <code>curl</code>.</p>" +
    "<p>Agora o que importa, e é onde quase todo mundo tropeça: os quatro números " +
    "<strong>não são durações de etapas</strong>. São marcos cronometrados a partir do mesmo " +
    "instante zero, o começo da chamada, e cada um diz quanto tempo já havia passado quando " +
    "aquela etapa terminou. Por isso o TLS já contém o TCP, que já contém o DNS.</p>" +
    "<ul>" +
    "<li><code>time_namelookup</code>: o nome virou endereço IP.</li>" +
    "<li><code>time_connect</code>: a conexão TCP ficou pronta, ou seja, o núcleo do sistema " +
    "concluiu o aperto de mão de três vias.</li>" +
    "<li><code>time_appconnect</code>: o aperto de mão TLS acabou e o canal aceita dados da " +
    "aplicação. Em URL sem TLS esse valor sai <code>0.000000</code>, o que é um jeito rápido " +
    "de ver que a conexão não foi cifrada (e não que o aperto de mão foi instantâneo).</li>" +
    "<li><code>time_total</code>: a operação inteira terminou, último byte recebido.</li>" +
    "</ul>" +
    "<p>A duração de cada etapa sai por <strong>subtração</strong> dos marcos vizinhos. Com a " +
    "linha do <code>sa-east-1</code> da segunda rodada:</p>" +
    "<table>" +
    "<thead><tr><th>Etapa</th><th>Conta</th><th>Duração</th></tr></thead>" +
    "<tbody>" +
    "<tr><td>DNS</td><td>0,002487</td><td>2,487 ms</td></tr>" +
    "<tr><td>aperto de mão TCP</td><td>0,113934 - 0,002487</td><td>111,447 ms</td></tr>" +
    "<tr><td>aperto de mão TLS</td><td>0,229092 - 0,113934</td><td>115,158 ms</td></tr>" +
    "<tr><td>requisição, espera e corpo</td><td>0,341778 - 0,229092</td><td>112,686 ms</td></tr>" +
    "</tbody>" +
    "</table>" +
    "<p>Some as quatro durações: dá 0,341778 s, o <code>total</code> exato. E veja o que " +
    "aparece só depois de subtrair: três blocos de 111 a 115 ms, três idas e voltas até São " +
    "Paulo, uma para cada camada do protocolo.</p>" +
    "{{figura}}" +
    "<p><strong>Somar os marcos, em vez das durações, não fecha.</strong> " +
    "0,002487 + 0,113934 + 0,229092 dá 0,345513 s, contra 0,341778 s de total. O excesso tem " +
    "origem exata: <code>soma - total = 2 x DNS + (TCP - HTTP)</code>, ou seja, " +
    "4,974 + (111,447 - 112,686) = 3,735 ms. O DNS entra três vezes na soma e uma vez no " +
    "total, e o resto é a diferença entre duas idas e voltas que não são idênticas. Repare no " +
    "tamanho do erro: como o DNS estava em cache, a soma errada chegou a 1% do valor certo. " +
    "Ela acerta por acidente aritmético, não por acerto de conceito. Refaça a conta com um " +
    "nome nunca resolvido, DNS de 30 ms, e o mesmo erro passa de 60 ms.</p>" +
    "<p>Por que o TCP mede quase só rede e o TLS não: o marco do TCP é o núcleo do sistema " +
    "dando a conexão por estabelecida, sem nenhum byte de aplicação e sem criptografia, " +
    "praticamente uma ida e volta pura (daí ele bater com o <code>ping</code>). O marco do " +
    "TLS é a biblioteca de criptografia terminando a negociação: uma ida e volta no TLS 1.3, " +
    "duas no 1.2, mais o custo de acordar chaves e validar o certificado. No exemplo, a etapa " +
    "TLS custou uma ida e volta mais 3,7 ms, então foram 3,7 ms de processamento e a versão " +
    "negociada foi a 1.3. Com duas idas e voltas, daria perto de 225 ms.</p>" +
    "<p>Duas coisas que este formato não mostra. Entre o <code>time_appconnect</code> e o " +
    "<code>time_total</code> existem <code>%{time_pretransfer}</code> e " +
    "<code>%{time_starttransfer}</code> (o tempo até o primeiro byte); sem eles, a última " +
    "linha da tabela junta \"enviei a requisição\", \"o servidor pensou\" e \"baixei o " +
    "corpo\" num número só. E <code>%{remote_ip}</code> com <code>%{http_code}</code> dizem " +
    "quem respondeu, o que ajuda quando a mesma URL atende de vários lugares.</p>" +
    "<p>Um detalhe que amarra com o passo 6: o <code>curl</code> cronometra com um relógio " +
    "monotônico, não com o de parede. Se o <code>chronyd</code> resolvesse acertar a hora no " +
    "meio da chamada, um cronômetro de parede poderia imprimir duração negativa.</p>",
  figura: {
    src: "assets/img/curl-marcos-e-duracoes.webp",
    largura: 1400,
    altura: 783,
    alt:
      "Diagrama de dois painéis sobre a mesma linha de tempo, de zero a 342 ms. " +
      "No painel de cima, quatro barras que começam todas no instante zero e terminam " +
      "em marcos diferentes, cada uma contendo a anterior: DNS em 0,002487 s, TCP em " +
      "0,113934 s, TLS em 0,229092 s e total em 0,341778 s. No painel de baixo, a mesma " +
      "linha de tempo dividida em quatro etapas consecutivas, encostadas uma na outra: " +
      "DNS de 2,5 ms, aperto de mão TCP de 111,4 ms, aperto de mão TLS de 115,2 ms e " +
      "requisição e resposta de 112,7 ms. Uma chave sob as três últimas etapas as " +
      "identifica como três idas e voltas até São Paulo.",
    legenda:
      "Em cima, o que o comando imprime: quatro marcos contados desde o mesmo instante " +
      "zero. Embaixo, o que aconteceu: quatro etapas em sequência. Somar os marcos conta " +
      "o DNS três vezes. No painel de baixo, o bloco do DNS está desenhado maior do que " +
      "é, para caber o rótulo: em escala, ele seria um risco fino como o de cima."
  },
  leia: [
    { rotulo: "Redes de Computadores: protocolos em camadas, TCP e DNS", topico: "03" }
  ]
};

SD.notas["chronyc-tracking"] = {
  termo: "As linhas do chronyc tracking",
  html:
    "<p>A saída tem treze linhas e responde a três perguntas: de quem esta máquina tira a " +
    "hora, o quanto ela erra, e o quanto o oscilador dela corre torto.</p>" +
    "<p><strong>De quem a máquina tira a hora</strong></p>" +
    "<ul>" +
    "<li><code>Reference ID</code>: a fonte que ele está seguindo. <code>A9FEA97B</code> é o " +
    "próprio endereço em hexadecimal (A9 = 169, FE = 254, A9 = 169, 7B = 123), ou seja, " +
    "169.254.169.123, o serviço de tempo da AWS. É um endereço link-local, da mesma família " +
    "do 169.254.169.254 que você consultou no passo 4: a hora não vem da internet, quem " +
    "responde é o próprio host.</li>" +
    "<li><code>Stratum</code>: quantos elos separam este relógio do relógio físico. O estrato " +
    "0 é o relógio de verdade (atômico ou GPS), o estrato 1 é a máquina ligada nele, e cada " +
    "salto soma um. Estrato 4 aqui significa que a instância é o quarto elo: o serviço que " +
    "ela consulta se declarou estrato 3.</li>" +
    "<li><code>Ref time (UTC)</code>: quando a última medição da fonte foi aceita. Quanto " +
    "mais velha, mais o <code>chronyd</code> está extrapolando em vez de medir.</li>" +
    "<li><code>Update interval</code>: o intervalo entre as duas últimas medições. Ele cresce " +
    "quando o relógio se comporta e encolhe quando o <code>chronyd</code> desconfia.</li>" +
    "<li><code>Leap status</code>: se existe segundo intercalar programado. " +
    "<code>Normal</code> quer dizer que não há nada previsto.</li>" +
    "</ul>" +
    "<p><strong>O quanto ele erra, e o quanto admite errar</strong></p>" +
    "<ul>" +
    "<li><code>System time</code>: a distância entre o relógio do sistema e a hora que o " +
    "próprio <code>chronyd</code> estima. É o resíduo da correção dele, não a distância até a " +
    "fonte. Repare que ele escreve o sentido em palavra (<code>slow</code>, <code>fast</code>) " +
    "em vez de sinal, para não deixar dúvida.</li>" +
    "<li><code>Last offset</code>: o desvio medido na última atualização, isto é, o tamanho " +
    "do último empurrão dado no relógio (0,17 microssegundo, no exemplo).</li>" +
    "<li><code>RMS offset</code>: a média de longo prazo desses desvios. Diz o quanto ele " +
    "costuma errar, não o quanto errou agora.</li>" +
    "<li><code>Root delay</code>: o atraso de ida e volta somado ao longo de toda a cadeia, " +
    "da instância até o estrato 0.</li>" +
    "<li><code>Root dispersion</code>: a incerteza somada na mesma cadeia. É desse par que " +
    "sai o limite de erro calculado acima, e nenhuma outra linha responde por ele.</li>" +
    "</ul>" +
    "<p><strong>Como o oscilador da máquina se comporta</strong></p>" +
    "<ul>" +
    "<li><code>Frequency</code>: o quanto o oscilador erraria se ninguém o corrigisse, em " +
    "partes por milhão. Os 8,624 ppm do exemplo são 8,6 microssegundos por segundo, ou cerca " +
    "de 0,7 s por dia. Sem daemon de tempo, essa instância chegaria sozinha aos dois segundos " +
    "do passo 6.2 em menos de três dias.</li>" +
    "<li><code>Residual freq</code>: o que sobrou desse ajuste nas últimas medições. Perto de " +
    "zero significa que a estimativa de frequência está boa.</li>" +
    "<li><code>Skew</code>: a incerteza da própria estimativa de frequência, também em ppm. É " +
    "com ela que o <code>chronyd</code> prevê o quanto o relógio vai se afastar até a próxima " +
    "consulta.</li>" +
    "</ul>" +
    "<p>Repare no padrão da saída, que é o mesmo do seu <code>sd relogios</code>: para cada " +
    "coisa que o <code>chronyd</code> estima, existe uma linha vizinha dizendo o quanto ele " +
    "confia nela. <code>Root dispersion</code> acompanha <code>Root delay</code>, " +
    "<code>Skew</code> acompanha <code>Frequency</code>, <code>RMS offset</code> acompanha " +
    "<code>Last offset</code>. Um número sozinho não decide nada: ele vale com o limite de " +
    "erro ao lado.</p>",
  leia: [
    { rotulo: "Modelos de Sistema: desvio de relógio e ordenação de eventos", topico: "02" }
  ]
};

SD.notas["problema-n-mais-1"] = {
  termo: "Problema N+1",
  html:
    "<p>O nome vem do padrão que você acabou de medir. Para montar uma resposta com N " +
    "itens, o programa faz <strong>uma consulta por item</strong>. No padrão clássico " +
    "ainda existe uma consulta a mais, para descobrir quais são os itens, e é dela que " +
    "vem o <strong>+1</strong> do nome. Aqui a lista já era conhecida, então, com 30 " +
    "peças no pedido, a aplicação atravessou a fronteira 30 vezes.</p>" +
    "<p>O que torna esse defeito traiçoeiro é que ele <strong>não aparece enquanto tudo " +
    "mora junto</strong>. No arranjo de duas camadas, as mesmas 30 consultas custaram " +
    "meio milissegundo somadas, porque cada uma é uma leitura em um arquivo no disco " +
    "local. Ninguém revisa código por causa de meio milissegundo.</p>" +
    "<p>Quando o banco muda de máquina, o mesmo código passa a pagar conexão, " +
    "requisição, resposta e espera 30 vezes, e a conta salta para dezenas de " +
    "milissegundos. O código não piorou. O que mudou foi o arranjo em volta dele.</p>" +
    "<p>É por isso que o resumo do <code>sd tempo</code> imprime a linha " +
    "<code>idas e voltas</code>, que é a métrica capaz de prever o problema antes de " +
    "ele acontecer. O custo de um pedido é o número de rodadas multiplicado pelo preço " +
    "de uma rodada, e o tamanho dos dados quase nunca é o que manda.</p>" +
    "<p>A correção é a de sempre, que é pedir tudo de uma vez, e você vai experimentá-la " +
    "logo adiante com <code>--lote</code>. Em SQL isso costuma virar um <code>JOIN</code> ou um " +
    "<code>WHERE id IN (...)</code>. Numa API, vira um parâmetro que aceita uma lista. " +
    "A arquitetura de três camadas continua exatamente a mesma, e o que mudou foi a " +
    "conversa que ela precisa manter.</p>",
  leia: [
    { rotulo: "Sistemas Operacionais Distribuídos: o preço de cada chamada", topico: "06" }
  ]
};

SD.notas["falha-bizantina"] = {
  termo: "Falha arbitrária (bizantina)",
  html:
    "<p>Na taxonomia do Tópico 2, uma falha por <strong>omissão</strong> é aquela em " +
    "que algo deixa de ser feito. O processo para, ou a mensagem se perde. É o tipo de " +
    "falha em que o sistema deixa de responder.</p>" +
    "<p>A falha <strong>arbitrária</strong> é a categoria que sobra, e nela cabe " +
    "qualquer comportamento, inclusive responder na hora, com sucesso, e responder " +
    "errado. É a pior semântica possível, porque nada no protocolo a denuncia.</p>" +
    "<p>O apelido <em>bizantina</em> vem do problema dos generais bizantinos, publicado " +
    "por Lamport, Shostak e Pease em 1982. Generais cercando uma cidade precisam " +
    "combinar atacar ou recuar, e alguns deles podem ser traidores que mandam ordens " +
    "diferentes para cada colega. O termo técnico correto continua sendo " +
    "<em>arbitrária</em>, mas o apelido pegou porque descreve bem o que você viu. Não " +
    "é um nó quebrado, é um nó convincente.</p>" +
    "<p>Repare no que falhou na sua tentativa de detectar. O teste de saúde perguntou " +
    "\"você está vivo?\" e recebeu a resposta certa. O rodízio perguntou \"deu erro?\" e " +
    "recebeu a resposta certa. Nenhum dos dois tinha como perguntar \"esse número está " +
    "certo?\", porque para saber isso seria preciso já ter a resposta.</p>" +
    "<p>Sobrou comparar réplicas, e é por aí mesmo que os sistemas reais atacam o " +
    "problema. Só que duas réplicas em desacordo dão um empate. Você fica sabendo que " +
    "existe um mentiroso e não fica sabendo quem é.</p>" +
    "<p>Com três réplicas e um mentiroso, quem pergunta às três e fica com a resposta " +
    "da maioria já se protege. Para votar sobre respostas independentes bastam " +
    "<strong>2f + 1</strong> réplicas, que é o caso do terceiro voto que você pediu ao " +
    "<code>sd conferir</code>.</p>" +
    "<p>Quando são as próprias réplicas que precisam concordar entre si antes de " +
    "responder, como na ordem das operações e no estado replicado, o limite fica mais " +
    "duro. Tolerar <em>f</em> nós arbitrários exige <strong>3f + 1</strong> réplicas, " +
    "contra as <strong>2f + 1</strong> que bastariam se eles apenas parassem, porque aí " +
    "basta a maioria concordar. É a regra que aparece no Tópico 10.</p>" +
    "<p>Sair de três para quatro máquinas por causa de um único mentiroso é o preço " +
    "dessa semântica. E f + 1 réplicas só bastam quando o objetivo é mascarar colapsos " +
    "sem que as réplicas precisem acordar nada entre si.</p>" +
    "<p>Em canais, felizmente, ela é rara. Uma soma de verificação transforma um pacote " +
    "corrompido em um pacote descartado, ou seja, converte a falha arbitrária em uma " +
    "falha por omissão, que a retransmissão já sabe mascarar.</p>",
  leia: [
    { rotulo: "Modelos de Sistema: modelo de falhas e mascaramento", topico: "02" },
    { rotulo: "Replicação: serviços tolerantes a falhas e quóruns", topico: "10" }
  ]
};

SD.notas["relogio-monotonico"] = {
  termo: "Relógio monotônico",
  html:
    "<p>A máquina tem dois relógios, e eles respondem a perguntas diferentes.</p>" +
    "<p>O <strong>relógio de parede</strong> é o que o <code>date</code> mostra e o que o " +
    "<code>chronyd</code> ajusta. Ele responde \"que horas são\". Como é ajustado, ele " +
    "pode saltar, inclusive para trás. Você acabou de fazer isso duas vezes à mão: " +
    "primeiro com o <code>date -s</code>, depois com o <code>chronyc makestep</code>.</p>" +
    "<p>O <strong>relógio monotônico</strong> não sabe que horas são. Ele é só um contador " +
    "que começou a andar quando a máquina ligou e que nunca anda para trás, aconteça o " +
    "que acontecer com a hora oficial. Ninguém o acerta pela hora certa: no máximo o " +
    "daemon de tempo corrige o ritmo dele aos poucos, e mesmo assim ele nunca volta. Não " +
    "há com que acertá-lo, porque ele não representa hora nenhuma. Não serve para carimbar " +
    "um evento, serve para medir duração.</p>" +
    "<p><strong>Relógio de parede para dizer QUANDO. Monotônico para dizer QUANTO " +
    "TEMPO.</strong></p>" +
    "<p>Abra o <code>/opt/sd/cliente.py</code> e você vai ver os dois em uso, lado a lado, " +
    "na função que faz cada chamada: <code>time.time()</code> antes e depois, para poder " +
    "comparar com o relógio de parede do outro nó, e <code>time.monotonic()</code> em " +
    "volta da chamada, para medir quanto ela demorou. É a mesma função que responde ao " +
    "<code>sd rtt</code>, ao <code>sd relogios</code> e ao monitor do passo 7.</p>" +
    "<p>Repare em qual relógio importa aqui: o da máquina que mede. O cliente roda no nó " +
    "A e marca as duas pontas ali mesmo, então o salto que você provocou no nó C não " +
    "entra em nenhuma medição de duração. Se o cliente medisse duração com o relógio de " +
    "parede, um salto como aquele precisaria acontecer <strong>na própria máquina que " +
    "mede</strong> para estragar a conta (rode o cliente no nó C durante o salto para " +
    "ver): o <code>sd rtt</code> relataria uma ida e volta <strong>negativa</strong>. " +
    "Não é hipótese: rodando o cliente com um relógio que salta, o mínimo sai como " +
    "<code>-1998 ms</code>.</p>" +
    "<p>Cuidado com o caminho inverso, que é a armadilha comum: trocar tudo por " +
    "<code>time.monotonic()</code> quebraria a comparação de relógios, porque um contador " +
    "desde o boot não tem nada a ver com a hora que o outro nó devolveu. Não existe um " +
    "relógio melhor que o outro. Existe cada um no seu papel.</p>",
  leia: [
    { rotulo: "Modelos de Sistema: desvio de relógio e ordenação de eventos", topico: "02" }
  ]
};

/* ---------- Notas da demo "Arquiteto de Sistemas" (Tópico 2) ----------
   Camada 3 da tutoria: o conceito por trás de cada etapa, recolhido por
   padrão e aberto no lugar, dentro da própria demo. Plano em
   docs/demos/2026-08-03-demo-modelos-arquitetura-tutoria-plano.md */

SD.notas["saturacao-e-tempo-de-resposta"] = {
  termo: "Saturação: por que o tempo de resposta explode",
  html:
    "<p>A intuição diz que o dobro de usuários deveria custar o dobro de tempo. Não é o " +
    "que acontece. Quem manda no tempo de resposta é a <strong>utilização</strong>, ou " +
    "seja, a fração da capacidade do servidor que já está comprometida. Na demo, o " +
    "tempo é <code>60 ms divididos pela folga que sobra</code>, e é essa divisão que " +
    "muda tudo.</p>" +
    "<ul>" +
    "<li>Com metade da capacidade livre, o tempo é o dobro do tempo ocioso.</li>" +
    "<li>Com 10% livre, é dez vezes o tempo ocioso.</li>" +
    "<li>Sem folga nenhuma, não existe resposta. Chegam mais pedidos do que saem, a " +
    "fila só cresce, e a espera cresce junto, sem limite.</li>" +
    "</ul>" +
    "<p>Repare no que a métrica <strong>Atendidos por segundo</strong> faz no momento " +
    "da saturação. Ela trava na capacidade do servidor enquanto a demanda continua " +
    "subindo. A diferença entre as duas não vira lentidão, vira trabalho que ficou " +
    "para trás. Um sistema saturado não fica só devagar, ele passa a recusar parte do " +
    "que lhe pedem.</p>" +
    "<p>É por isso que \"resolvo com um servidor maior\" tem prazo de validade. A " +
    "centralização não favorece aumento de escala além do limite da capacidade daquele " +
    "computador e da largura de banda que o liga ao mundo. Uma máquina maior empurra o " +
    "joelho da curva para a direita, e não muda o formato dela.</p>" +
    "<p>Vale uma honestidade sobre o simulador. A fórmula é didática e os valores " +
    "absolutos são fictícios. O que ela reproduz de verdade é o comportamento, com o " +
    "crescimento não proporcional e a divergência na saturação. Nenhum número desta " +
    "tela serve para dimensionar sistema real.</p>",
  leia: [
    { rotulo: "Modelos de Sistema: modelos de arquitetura e posicionamento", topico: "02" },
    { rotulo: "Caracterização: escalabilidade e gargalos", topico: "01" }
  ]
};

SD.notas["replicar-ou-particionar"] = {
  termo: "Replicar ou particionar",
  html:
    "<p>As duas saídas colocam vários servidores no lugar de um, e param de se parecer " +
    "no instante seguinte. A diferença está em <strong>quem guarda o quê</strong>.</p>" +
    "<ul>" +
    "<li><strong>Replicar</strong> significa que todos guardam os mesmos dados, e " +
    "qualquer servidor atende qualquer pedido. Isso divide a leitura muito bem e " +
    "equilibra a carga sozinho. O preço aparece na escrita, porque toda atualização " +
    "precisa chegar a todas as cópias, e enquanto não chega existe divergência entre " +
    "elas.</li>" +
    "<li><strong>Particionar</strong> significa que cada servidor guarda uma fatia do " +
    "conjunto e responde só por ela. É o que escala escrita e armazenamento, porque nem " +
    "o volume de dados nem as atualizações precisam caber num nó só. O preço é o " +
    "desequilíbrio, porque quando uma fatia é mais procurada que as outras o servidor " +
    "dela satura sozinho enquanto os demais ficam ociosos.</li>" +
    "</ul>" +
    "<p>A etapa 2 da demo está construída em cima de uma conta que vale fazer à mão. " +
    "Com 180 pedidos/s e uma fatia quente que concentra 70% da procura, essa fatia " +
    "sozinha são 126 pedidos/s, e um servidor faz 100. Acrescentar servidores divide as " +
    "fatias frias entre mais gente e <strong>não toca na quente</strong>. Com 4 " +
    "servidores, o dono da fatia quente continua com os mesmos 126 pedidos/s. Nenhuma " +
    "quantidade de máquinas resolve, porque o problema não é quantidade, é o corte.</p>" +
    "<p>Daí as saídas reais serem outras. Dá para cortar a fatia quente em pedaços " +
    "menores, reparticionando por uma chave que espalhe melhor, ou para replicar só " +
    "ela, ou para pôr um cache na frente dela, que é a etapa seguinte. Na prática, " +
    "sistemas grandes combinam as três coisas, com partições para caber, réplicas " +
    "dentro de cada partição para aguentar leitura e sobreviver a falhas, e cache na " +
    "frente de tudo.</p>" +
    "<p>O capítulo traz dois exemplos clássicos. A Web é particionada, porque cada " +
    "servidor responde pelo seu conjunto de páginas. O NIS é replicado, porque cada " +
    "servidor tem uma cópia inteira do mapa de usuários.</p>",
  leia: [
    { rotulo: "Modelos de Sistema: posicionamento em vários servidores", topico: "02" },
    { rotulo: "Replicação: manter cópias em dia e o que isso custa", topico: "10" }
  ]
};

SD.notas["cache-e-atualidade"] = {
  termo: "Cache: desempenho comprado com atualidade",
  html:
    "<p>Um cache é um armazém de objetos usados recentemente, colocado <strong>mais " +
    "perto do cliente</strong> do que a fonte da verdade. Quando o pedido chega, " +
    "olha-se primeiro ali. Se o objeto está lá e ainda vale, o que se chama de " +
    "<em>acerto</em>, a resposta sai sem atravessar a rede até o servidor e sem " +
    "consumir capacidade dele.</p>" +
    "<p>O efeito é duplo, e a etapa 3 mostra os dois números ao mesmo tempo. A " +
    "<strong>latência</strong> cai porque a resposta vem de perto. A " +
    "<strong>carga</strong> no backend cai porque o pedido nem chega lá. Com 60% de " +
    "acerto, os servidores passam a receber 40% do que recebiam, e é por isso que o " +
    "cache chega a dispensar réplicas inteiras, atacando o mesmo problema por outro " +
    "lado.</p>" +
    "<p>O preço tem nome e está no contador da tela, que é o das <strong>respostas " +
    "possivelmente desatualizadas</strong>. Quem respondeu não foi a fonte da verdade, " +
    "foi uma cópia feita algum tempo atrás. Se o dado mudou desde então e o cache não " +
    "soube, o cliente recebe o valor velho com toda a confiança do mundo. Navegadores e " +
    "servidores proxy convivem com isso verificando a atualidade das cópias de tempos " +
    "em tempos, o que estreita a janela sem nunca fechá-la de todo.</p>" +
    "<p>Repare que um cache com 0% de acerto não é neutro. Ele vira um salto a mais no " +
    "caminho, com todo o custo e nenhum benefício.</p>" +
    "<p>E note o que isso implica sobre projeto. Cache resolve leitura repetida de dado " +
    "que tolera atraso. Para dado que precisa estar certo no instante da leitura, a " +
    "conversa é outra, e é a do Tópico 10.</p>",
  leia: [
    { rotulo: "Modelos de Sistema: cache e servidores proxy", topico: "02" },
    { rotulo: "Replicação: modelos de consistência", topico: "10" }
  ]
};

SD.notas["p2p-recursos-crescem"] = {
  termo: "Peer-to-peer: os recursos crescem com os usuários",
  html:
    "<p>No cliente-servidor há uma assimetria permanente, porque quem chega só consome. " +
    "Cada usuário novo é carga nova sobre uma capacidade que continua a mesma, e é por " +
    "isso que a curva sobe até saturar.</p>" +
    "<p>No peer-to-peer todos os processos executam o mesmo programa e oferecem as " +
    "mesmas interfaces, de modo que cada participante é cliente e servidor ao mesmo " +
    "tempo. Quem chega traz disco, banda e processador junto.</p>" +
    "<p>Se cada peer traz mais capacidade do que consome, a utilização para de depender " +
    "do tamanho da população. Ela fica onde está, com 10 ou com 1000 peers.</p>" +
    "<p>É essa a frase mais importante da seção, e também a mais fácil de ler sem " +
    "sentir o peso. Os recursos disponíveis para executar o serviço aumentam com o " +
    "número de usuários.</p>" +
    "<p>A conta não some, muda de lugar. O que era problema de capacidade vira problema " +
    "de <strong>localização</strong>. Com os objetos espalhados por milhares de " +
    "participantes, achar quem tem o que você quer custa uma sequência de saltos pela " +
    "rede. Em redes de sobreposição estruturadas esse número cresce com o logaritmo do " +
    "número de peers, que é o comportamento do contador da demo, com 7 saltos para 100 " +
    "peers e 10 para 1000.</p>" +
    "<p>Crescimento logarítmico é boa notícia, e não é gratuidade. Cada salto é uma " +
    "viagem de rede a mais antes da primeira resposta.</p>" +
    "<p>E há ainda o <em>churn</em>, que é a entrada e a saída de peers a qualquer " +
    "momento, levando embora as cópias que eles guardavam. Manter o serviço de pé exige " +
    "refazer réplicas o tempo todo, trabalho que não aparece no tempo de resposta e " +
    "existe assim mesmo. Napster abriu o caminho e o BitTorrent é o exemplo moderno. " +
    "Nos dois, a complexidade que sumiu do servidor reapareceu no protocolo.</p>",
  leia: [
    { rotulo: "Modelos de Sistema: papéis, cliente-servidor e peer-to-peer", topico: "02" },
    { rotulo: "Serviços de Nomes: localizar recursos em escala", topico: "09" }
  ]
};

SD.notas["camadas-fisicas-latencia"] = {
  termo: "Camadas físicas: latência contra manutenibilidade",
  html:
    "<p>Cuidado com a palavra camada, que aparece em dois sentidos. Camadas " +
    "<strong>lógicas</strong> são divisões do software, ou seja, apresentação, lógica " +
    "da aplicação e dados, e existem em qualquer sistema bem organizado. Camadas " +
    "<strong>físicas</strong> são divisões de máquina, isto é, quantos computadores " +
    "diferentes o pedido atravessa. Só as segundas custam rede.</p>" +
    "<ul>" +
    "<li><strong>Duas camadas físicas</strong> são o cliente e o servidor, com o " +
    "servidor cuidando da lógica da aplicação e dos dados. Um pedido é uma ida e volta. " +
    "Em troca, a lógica da aplicação acaba <strong>dividida</strong> entre os dois " +
    "lados, e mudar uma regra de negócio significa mexer no cliente e no servidor, e " +
    "ainda distribuir a atualização para todo mundo.</li>" +
    "<li><strong>Três camadas físicas</strong> são o cliente, o servidor de aplicação e " +
    "o servidor de dados. A lógica passa a morar <strong>em um só lugar</strong>, o que " +
    "é bem mais fácil de manter e de evoluir. O preço é o salto extra, porque o " +
    "servidor de aplicação precisa conversar com o banco antes de responder.</li>" +
    "</ul>" +
    "<p>Na demo, o pedido custa 110 ms em duas camadas e 125 ms em três. Vale reparar " +
    "de onde vêm esses 15 ms. Dez saem das duas pernas de rede local do centro de " +
    "dados, e cinco saem do custo de atravessar a fronteira do processo do banco, com " +
    "a conexão e a serialização que ela cobra. O trabalho de achar o dado existe nos " +
    "dois arranjos, e por isso não entra na diferença.</p>" +
    "<p>A rede local é barata perto da perna até o cliente, que custa 40 ms de cada " +
    "lado, e é por isso que a terceira camada sai barata. Ela mora do lado de dentro. " +
    "Uma terceira camada do outro lado do país seria conversa completamente " +
    "diferente.</p>" +
    "<p>O que faz esse custo doer é a repetição. Um salto extra por pedido é aceitável. " +
    "O mesmo salto dentro de um laço, uma vez por item de uma lista, é o efeito N+1, e " +
    "é ele que transforma 15 ms em segundos de espera quando a lista é grande. A " +
    "fronteira entre camadas é barata de atravessar uma vez e cara de atravessar " +
    "mil.</p>",
  leia: [
    { rotulo: "Modelos de Sistema: arquitetura de camadas físicas", topico: "02" },
    { rotulo: "Objetos Distribuídos: o custo de cada invocação remota", topico: "05" }
  ]
};

/* ---------- Notas da demo "A Viagem do Pacote" (Tópico 3) ----------
   Camada 3 da tutoria, uma por etapa. Plano em
   docs/demos/2026-08-08-demo-camadas-rede-tutoria-plano.md */

SD.notas["encapsulamento"] = {
  termo: "Encapsulamento, e por que a montagem é o inverso da transmissão",
  html:
    "<p>Cada camada do software de rede oferece um serviço à camada de cima e usa o " +
    "serviço da camada de baixo. O encapsulamento é o mecanismo que faz isso funcionar. " +
    "No remetente, cada camada envolve o que recebeu de cima com o seu próprio cabeçalho, " +
    "e no destino o processo se inverte, camada por camada, até restar o que a aplicação " +
    "enviou.</p>" +
    "<p>Repare no que não acontece pelo caminho. Os dados da aplicação não são " +
    "reescritos, traduzidos nem reduzidos. O que cresce é o envelope, e por isso o pacote " +
    "que trafega no enlace carrega três cabeçalhos além dos dados.</p>" +
    "<p>Cada cabeçalho responde a uma pergunta diferente, e as três perguntas não se " +
    "misturam.</p>" +
    "<ul>" +
    "<li>O <strong>cabeçalho TCP</strong> endereça um processo, pela porta. É ele que " +
    "distingue o servidor web na porta 80 de qualquer outro programa da mesma " +
    "máquina.</li>" +
    "<li>O <strong>cabeçalho IP</strong> endereça um computador em qualquer lugar da " +
    "inter-rede, e viaja inteiro da origem ao destino final.</li>" +
    "<li>O <strong>quadro Ethernet</strong> endereça a placa do próximo salto, e nada " +
    "além disso. Ele é descartado e refeito em cada roteador do caminho.</li>" +
    "</ul>" +
    "<p>A demo monta o pacote de dentro para fora, começando pela mensagem da aplicação. " +
    "A transmissão faz o contrário. O último envelope fechado é o primeiro a entrar no " +
    "fio, porque o cabeçalho de cada camada vem à frente daquilo que ela embrulhou. Quem " +
    "recebe lê nessa mesma ordem e abre um envelope de cada vez, de fora para dentro, o " +
    "que explica por que um switch decide o destino de um quadro sem nunca olhar o " +
    "endereço IP.</p>" +
    "<p>Empilhar camadas simplifica o projeto e cobra por isso. Transmitir através de N " +
    "camadas envolve N transferências de controle e N cópias dos dados, e é por essa " +
    "razão que a taxa de transferência vista pela aplicação fica bem abaixo da taxa " +
    "anunciada pela rede.</p>",
  leia: [
    { rotulo: "Redes de Computadores: protocolo, camadas e encapsulamento", topico: "03" },
    { rotulo: "Modelos de Sistema: camadas de software e middleware", topico: "02" }
  ]
};

SD.notas["arp-e-cache-arp"] = {
  termo: "ARP, e o cache que poupa a difusão",
  html:
    "<p>Dentro de uma rede local não há roteamento nenhum a fazer. As estações " +
    "compartilham o mesmo segmento e o quadro alcança todas elas, o que torna a entrega " +
    "local um problema bem diferente do da inter-rede.</p>" +
    "<p>Sobra um problema de tradução. O programa conhece o destino pelo endereço IP, e o " +
    "quadro Ethernet precisa de um endereço físico, que é o MAC da placa. Nada no " +
    "endereço IP permite calcular o MAC correspondente, porque os dois vêm de mundos " +
    "independentes. Um é atribuído pela administração da rede, o outro vem gravado de " +
    "fábrica.</p>" +
    "<p>Quem resolve é o protocolo de resolução de endereços (ARP). Ele pergunta em " +
    "difusão na rede local quem tem determinado IP e guarda a resposta de quem se " +
    "reconhece. São dois quadros no fio, a pergunta que todas as estações recebem e a " +
    "resposta que só o dono do endereço envia.</p>" +
    "<p>Perguntar em difusão sai caro, porque toda estação do segmento é interrompida " +
    "para examinar um quadro que quase sempre não é dela. Fazer isso a cada envio " +
    "inviabilizaria a rede local, e o cache é o que impede que aconteça. O par (IP, MAC) " +
    "fica guardado, e o envio seguinte para o mesmo destino sai direto, com um quadro " +
    "só.</p>" +
    "<p>A entrada do cache tem prazo de validade, tipicamente de alguns minutos. Ela " +
    "expira porque a associação entre IP e MAC muda quando uma placa é trocada ou quando " +
    "o endereço é reatribuído a outra máquina. É o mesmo compromisso de qualquer cache, " +
    "com desempenho comprado ao preço de uma informação que pode ter envelhecido.</p>" +
    "<p>Vale reparar de onde veio a economia do segundo envio. A rede não ficou mais " +
    "rápida. O que desapareceu foi trabalho repetido.</p>",
  leia: [
    { rotulo: "Redes de Computadores: IP, ARP e o endereço da placa", topico: "03" },
    { rotulo: "Modelos de Sistema: cache e servidores proxy", topico: "02" }
  ]
};

SD.notas["proximo-salto-e-rota-padrao"] = {
  termo: "Próximo salto e rota padrão",
  html:
    "<p>Em qualquer rede maior que um segmento local, entregar um pacote é tarefa " +
    "coletiva dos roteadores, que o passam adiante em saltos sucessivos. A pergunta desta " +
    "etapa é como cada roteador decide para onde mandar, e a resposta é bem mais modesta " +
    "do que a intuição sugere.</p>" +
    "<p>Nenhum roteador conhece o caminho inteiro. A tabela dele associa cada destino a " +
    "um enlace de saída, e a decisão consome uma linha só, a do destino daquele pacote. O " +
    "que acontece depois é problema do próximo roteador, que tem a sua própria tabela e " +
    "decide sozinho, com o mesmo critério.</p>" +
    "<p>Essa modéstia é a virtude do arranjo. Como ninguém depende de um mapa completo, " +
    "um encaminhamento errado costuma custar um caminho mais longo, e não o pacote, desde " +
    "que o roteador em que ele foi parar também saiba alcançar o destino. É por isso que " +
    "a rede tolera tabelas parcialmente desatualizadas.</p>" +
    "<p>A decisão do próximo salto precisa ser rápida, porque roda na chegada de cada " +
    "pacote. Manter o conhecimento da topologia é a outra metade do algoritmo de " +
    "roteamento, e trabalha em segundo plano, no ritmo das mudanças da rede.</p>" +
    "<p>Sobra o caso do destino que a tabela não conhece, que é a regra e não a exceção. " +
    "Nenhum roteador tem uma linha para cada rede do mundo, por maior que seja a tabela " +
    "dele. Para tudo o que ele não reconhece existe a <strong>rota padrão</strong>, uma " +
    "saída única por onde o pacote segue rumo a quem sabe mais. O roteador de uma casa " +
    "trabalha quase inteiramente assim, com uma linha para a rede local e a rota padrão " +
    "apontando para o provedor.</p>",
  leia: [
    { rotulo: "Redes de Computadores: roteamento e rota padrão", topico: "03" },
    { rotulo: "Serviços de Nomes: decidir com conhecimento parcial", topico: "09" }
  ]
};

SD.notas["vetor-de-distancia-e-convergencia"] = {
  termo: "Vetor de distância, e o intervalo em que a rede erra",
  html:
    "<p>O algoritmo de vetor de distância, de Bellman e Ford, é a base do protocolo de " +
    "informação de roteamento (RIP). Cada roteador guarda uma tabela que associa cada " +
    "destino a um enlace de saída e a um custo em saltos, e periodicamente troca essa " +
    "tabela com os vizinhos, adotando as rotas melhores que descobrir.</p>" +
    "<p>Repare no que cada roteador faz com o que recebe. Ele soma 1 ao custo anunciado " +
    "pelo vizinho, compara com o que já tinha e fica com o menor. Ninguém calcula o " +
    "caminho inteiro, e a rota boa emerge dessa conversa repetida.</p>" +
    "<p>Quando um enlace cai, o roteador que o perdeu marca com custo infinito as rotas " +
    "que passavam por ali, e a notícia se propaga de vizinho em vizinho. Aqui aparece o " +
    "que esta etapa existe para mostrar. Entre a falha e a chegada da notícia, os outros " +
    "roteadores continuam encaminhando por uma rota que já morreu, e os pacotes que " +
    "seguirem por ela são descartados. A rede não erra por defeito de projeto, ela erra " +
    "porque a informação leva tempo para viajar.</p>" +
    "<p>A convergência é o fim desse intervalo, e ela tem um sinal preciso. Enquanto " +
    "alguma rota mudar numa rodada de troca, a rede ainda está se acertando. Quando uma " +
    "rodada inteira passa sem que nada mude, as tabelas concordam. A rodada que não traz " +
    "novidade é justamente a que autoriza declarar convergência, e por isso ela nunca é " +
    "desperdício.</p>" +
    "<p>Propagar de vizinho em vizinho é simples de implementar e lento de convergir, " +
    "porque a notícia atravessa a rede um salto por rodada. Foi essa lentidão que motivou " +
    "os algoritmos de <strong>estado de enlace</strong>, como o OSPF, em que cada nó " +
    "mantém um mapa da rede inteira e calcula as rotas ótimas com o algoritmo de " +
    "Dijkstra. Entre cinco roteadores a diferença é irrelevante, e entre milhares ela " +
    "decide.</p>",
  leia: [
    { rotulo: "Redes de Computadores: vetor de distância e estado de enlace", topico: "03" },
    { rotulo: "Caracterização: falha parcial e informação que chega atrasada", topico: "01" }
  ]
};

SD.notas["entrega-confiavel-sobre-melhor-esforco"] = {
  termo: "Confiabilidade construída nas pontas",
  html:
    "<p>O IP entrega no <strong>melhor esforço</strong> (best effort), que é uma promessa " +
    "mais fraca do que o nome sugere. Ele tenta entregar, e só. Um datagrama pode ser " +
    "perdido, duplicado, retardado ou entregue fora de ordem, e nada no protocolo avisa " +
    "quando isso acontece.</p>" +
    "<p>Os três acidentes desta etapa têm causas corriqueiras. A perda quase sempre vem " +
    "de uma fila cheia num roteador congestionado. A desordem vem de pacotes que tomaram " +
    "rotas diferentes e chegaram em ritmos diferentes. A duplicata costuma vir de uma " +
    "retransmissão disparada cedo demais, quando a confirmação estava apenas atrasada.</p>" +
    "<p>Cabe então a pergunta de projeto. Por que não consertar isso no meio do caminho, " +
    "roteador por roteador? Porque a verificação nas pontas continua necessária de " +
    "qualquer forma. Um salto pode entregar o dado intacto e a memória do destino " +
    "corrompê-lo logo depois, de modo que o remendo intermediário não dispensa a " +
    "conferência final e ainda cobra caro em cada salto. Esse raciocínio é o princípio " +
    "fim-a-fim.</p>" +
    "<p>Daí a soma de verificação do IP cobrir apenas o cabeçalho, e não os dados. " +
    "Validar o conteúdo é trabalho do TCP e do UDP.</p>" +
    "<p>O <strong>UDP</strong> acrescenta muito pouco ao melhor esforço. Ele entrega à " +
    "aplicação o que chegou, na ordem em que chegou, com as repetições que houver. Em " +
    "troca, custa pouco e não faz ninguém esperar, o que serve bem a voz, a vídeo e a " +
    "consulta curta como a do DNS.</p>" +
    "<p>O <strong>TCP</strong> acrescenta três mecanismos, e os três operam só nas " +
    "pontas. O número de sequência ordena os segmentos e denuncia a repetição, a " +
    "confirmação avisa o remetente do que chegou, e a retransmissão repõe o que a " +
    "confirmação não cobriu. A rede continuou perdendo e duplicando durante o envio " +
    "inteiro, e quem consertou foram as duas pontas.</p>" +
    "<p>Nada disso sai de graça. O pedaço perdido só é reposto depois que o prazo da " +
    "confirmação vence, e o que chegou depois dele espera no buffer para ser entregue em " +
    "ordem. O TCP compra integridade com tempo, e é essa a escolha que a aplicação faz ao " +
    "preferir um dos dois protocolos.</p>",
  leia: [
    { rotulo: "Redes de Computadores: IP de melhor esforço, UDP e TCP", topico: "03" },
    { rotulo: "Modelos de Sistema: o princípio fim-a-fim", topico: "02" }
  ]
};

SD.notas["prefixo-ipv6-56-e-64"] = {
  termo: "Por que a VPC ganha /56 e a sub-rede leva /64",
  html:
    "<p>Um endereço IPv6 tem 128 bits, escritos em oito grupos de quatro dígitos " +
    "hexadecimais. O número depois da barra diz quantos bits do começo estão fixos e " +
    "pertencem ao prefixo da rede. O que sobra é o espaço em que a rede numera o que " +
    "tem dentro.</p>" +
    "<p>A Amazon entrega sempre um <strong>/56</strong> por nuvem privada virtual (VPC), o " +
    "que fixa os 56 primeiros bits e deixa 72 livres. Uma sub-rede leva um " +
    "<strong>/64</strong>, que fixa oito bits a mais. Esses oito bits de diferença são o " +
    "que a VPC tem para numerar sub-redes, e oito bits dão 256 delas.</p>" +
    "<p>Os oito bits ficam num lugar cômodo de ler. Como cada grupo hexadecimal vale 16 " +
    "bits, o quarto grupo do endereço se parte ao meio, com a primeira metade dentro do " +
    "prefixo da VPC e a segunda à disposição de quem recorta. É por isso que o /56 sempre " +
    "termina em <code>00</code> antes dos dois-pontos duplos, e é por isso que as " +
    "sub-redes desta prática se distinguem por trocar esse par para <code>00</code>, " +
    "<code>01</code> e <code>02</code>.</p>" +
    "<p>O /64 da sub-rede não é escolha de quem projeta a rede. Ele é o tamanho que os " +
    "mecanismos de autoconfiguração do IPv6 assumem, e usar um prefixo mais longo quebra " +
    "a descoberta automática de endereço. Vale registrar a extravagância do número. Cada " +
    "sub-rede /64 comporta cerca de 18 quintilhões de endereços, mais do que o IPv4 " +
    "inteiro elevado ao quadrado, para hospedar meia dúzia de máquinas.</p>" +
    "<p>Esse desperdício deliberado é a diferença de mentalidade entre os dois " +
    "protocolos. O IPv4 gastou trinta anos economizando endereço, com máscaras apertadas " +
    "e tradução no meio do caminho. O IPv6 tem endereço em quantidade que dispensa a " +
    "economia, e troca a contabilidade fina por uma regra simples que qualquer rede " +
    "segue igual.</p>",
  leia: [
    { rotulo: "Redes de Computadores: CIDR, esgotamento e IPv6", topico: "03" }
  ]
};

SD.notas["gateway-somente-de-saida"] = {
  termo: "Gateway somente de saída",
  html:
    "<p>Uma máquina numa sub-rede privada precisa alcançar a internet para instalar " +
    "pacotes e chamar serviços, e não deve poder ser alcançada de fora. No IPv4 quem " +
    "resolve isso é o NAT, que compartilha um endereço público entre muitas máquinas " +
    "internas e reescreve o endereço de origem de tudo que sai. O efeito colateral de " +
    "não aceitar conexão vinda de fora é consequência do mecanismo, não objetivo dele.</p>" +
    "<p>No IPv6 a escassez que motivou o NAT não existe, e cada máquina já nasce com um " +
    "endereço único no mundo. O NAT perderia o propósito principal e sobraria com o " +
    "efeito colateral, então a AWS oferece um dispositivo que faz só o efeito colateral. " +
    "É o <strong>gateway somente de saída</strong>.</p>" +
    "<p>Ele é um filtro com estado na borda da VPC. Quando uma máquina de dentro abre uma " +
    "conexão, ele anota o fluxo e deixa a resposta voltar. Quando um pacote chega de fora " +
    "sem que exista fluxo anotado, ele descarta. O endereço de origem atravessa " +
    "intacto nos dois sentidos.</p>" +
    "<p>Daí vêm as três economias que o roteiro faz você notar. Ele não precisa de " +
    "endereço reservado, porque não vai reescrever origem nenhuma. Não precisa morar " +
    "numa sub-rede, porque não é um nó com endereço. E fica pronto na hora, porque não " +
    "há nada a provisionar.</p>" +
    "<p>Vale separar duas coisas que o resultado parecido embaralha. O NAT é um " +
    "<em>tradutor</em> que acabou virando barreira, e o gateway somente de saída é uma " +
    "<em>barreira</em> que nunca precisou traduzir. Quem confunde os dois costuma " +
    "concluir que o IPv6 precisa de NAT, e a conclusão certa é a oposta.</p>",
  leia: [
    { rotulo: "Redes de Computadores: NAT, IPv6 e as respostas ao esgotamento", topico: "03" }
  ]
};

SD.notas["pilha-dupla-e-escolha-de-endereco"] = {
  termo: "Pilha dupla, e quem escolhe o protocolo",
  html:
    "<p>Uma máquina de <strong>pilha dupla</strong> tem endereço IPv4 e endereço IPv6 ao " +
    "mesmo tempo, e fala os dois protocolos. Foi assim que a migração se planejou desde o " +
    "começo, porque desligar o IPv4 num dia marcado nunca foi possível.</p>" +
    "<p>Isso cria uma decisão que não existia antes. Ao pedir uma página a um nome, o " +
    "programa recebe do serviço de nomes duas respostas, uma com o endereço IPv4 e outra " +
    "com o IPv6, cada uma guardada num tipo de registro próprio, e precisa escolher por " +
    "qual delas sair.</p>" +
    "<p>A escolha não é sua, e nem sempre é a mesma. A regra usual do sistema operacional " +
    "prefere o IPv6 quando ele existe, e muitos clientes acrescentam a isso uma corrida " +
    "entre os dois, em que sai vencedor o primeiro que completar a conexão. É um bom " +
    "comportamento para o uso comum, porque a conexão simplesmente funciona, e é " +
    "péssimo para um experimento sobre caminhos.</p>" +
    "<p>O problema aparece assim. Você apaga a rota IPv6 de saída, repete o comando " +
    "esperando que ele falhe, e ele responde normalmente, porque o cliente percebeu a " +
    "falha e trocou de protocolo sozinho. Você concluiria que a rota não fazia " +
    "diferença.</p>" +
    "<p>É por isso que todo comando desta prática traz <code>-4</code> ou <code>-6</code> " +
    "escrito à mão. As duas opções desligam a escolha automática e obrigam o cliente a " +
    "usar a família que você mandou, mesmo que ela não funcione. Num experimento, a falha " +
    "é a informação, e um cliente prestativo demais a esconde.</p>",
  leia: [
    { rotulo: "Redes de Computadores: pilha dupla e migração para o IPv6", topico: "03" },
    { rotulo: "Serviços de Nomes: os tipos de registro que guardam endereço", topico: "09" }
  ]
};
