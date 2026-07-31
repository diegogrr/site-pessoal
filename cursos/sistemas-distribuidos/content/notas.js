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
     figura → opcional { src, alt, legenda, largura, altura }. O src é
              relativo à raiz de app/ e quem consome monta a URL, pela
              mesma razão do leia[]. O lugar dela no texto é marcado
              com {{figura}}; sem o marcador, ela entra no fim.
              O alt não é enfeite: é o que resta para quem usa leitor
              de tela e para quando a imagem não carrega.

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
    "<p>O nome vem do padrão que você acabou de medir: para montar uma resposta com N " +
    "itens, o programa faz <strong>uma consulta por item</strong>. No padrão clássico " +
    "ainda existe uma consulta a mais, para descobrir quais são os itens, e é dela que " +
    "vem o <strong>+1</strong> do nome. Aqui a lista já era conhecida, então, com 30 " +
    "peças no pedido, a aplicação atravessou a fronteira 30 vezes.</p>" +
    "<p>O que torna esse defeito traiçoeiro é que ele <strong>não aparece enquanto tudo " +
    "mora junto</strong>. No arranjo de duas camadas, as mesmas 30 consultas custaram " +
    "cerca de 2 ms somadas, porque cada uma é uma leitura em um arquivo no disco local. " +
    "Ninguém revisa código por causa de 2 ms. Quando o banco muda de máquina, o mesmo " +
    "código passa a pagar conexão, requisição, resposta e espera 30 vezes, e a conta " +
    "salta para dezenas de milissegundos. O código não piorou: o arranjo mudou.</p>" +
    "<p>É por isso que o resumo do <code>sd tempo</code> imprime a linha " +
    "<code>idas e voltas</code>. Ela é a métrica que prevê o problema antes de ele " +
    "acontecer: <strong>o custo de um pedido é o número de rodadas vezes o preço de uma " +
    "rodada</strong>. O tamanho dos dados quase nunca é o que manda.</p>" +
    "<p>A correção que você experimentou com <code>--lote</code> é a de sempre: pedir " +
    "tudo de uma vez. Em SQL isso costuma virar um <code>JOIN</code> ou um " +
    "<code>WHERE id IN (...)</code>; em uma API, um parâmetro que aceita uma lista. A " +
    "arquitetura de três camadas continua exatamente a mesma. O que mudou foi a conversa " +
    "que ela precisa manter.</p>",
  leia: [
    { rotulo: "Sistemas Operacionais Distribuídos: o preço de cada chamada", topico: "06" }
  ]
};

SD.notas["falha-bizantina"] = {
  termo: "Falha arbitrária (bizantina)",
  html:
    "<p>Na taxonomia do Tópico 2, uma falha por <strong>omissão</strong> é aquela em que " +
    "algo deixa de ser feito: o processo para, a mensagem se perde. É o tipo de falha em " +
    "que o sistema deixa de responder. A falha <strong>arbitrária</strong> é a categoria " +
    "que sobra: qualquer comportamento, inclusive responder na hora, com sucesso, e " +
    "responder errado. É a pior semântica possível, porque nada no protocolo a denuncia.</p>" +
    "<p>O apelido <em>bizantina</em> vem do problema dos generais bizantinos, publicado " +
    "por Lamport, Shostak e Pease em 1982: generais cercando uma cidade precisam combinar " +
    "atacar ou recuar, e alguns deles podem ser traidores que mandam ordens diferentes " +
    "para cada colega. O termo técnico correto continua sendo <em>arbitrária</em>, mas o " +
    "apelido pegou porque descreve bem o que você viu: não é um nó quebrado, é um nó " +
    "convincente.</p>" +
    "<p>Repare no que falhou na sua tentativa de detectar. O teste de saúde perguntou " +
    "\"você está vivo?\" e recebeu a resposta certa. O rodízio perguntou \"deu erro?\" e " +
    "recebeu a resposta certa. Nenhum dos dois tinha como perguntar \"esse número está " +
    "certo?\", porque para saber isso seria preciso já ter a resposta.</p>" +
    "<p>Sobrou comparar réplicas, e é por aí mesmo que os sistemas reais atacam o " +
    "problema. Só que duas réplicas em desacordo dão um empate: você fica sabendo que " +
    "existe um mentiroso e não fica sabendo quem é. Com três réplicas e um mentiroso, " +
    "quem pergunta às três e fica com a resposta da maioria já se protege: para votar " +
    "sobre respostas independentes bastam <strong>2f + 1</strong> réplicas, que é o caso " +
    "do terceiro voto que você pediu ao <code>sd conferir</code>.</p>" +
    "<p>Quando são as próprias réplicas que precisam concordar entre si antes de " +
    "responder (a ordem das operações, o estado replicado), o limite fica mais duro: " +
    "tolerar <em>f</em> nós arbitrários exige <strong>3f + 1</strong> réplicas, contra as " +
    "f + 1 que bastariam se eles apenas parassem. É a regra que aparece no Tópico 10, e " +
    "sair de duas para quatro máquinas por causa de um único mentiroso é exatamente o " +
    "motivo pelo qual essa semântica é cara.</p>" +
    "<p>Em canais, felizmente, ela é rara: uma soma de verificação transforma um pacote " +
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
