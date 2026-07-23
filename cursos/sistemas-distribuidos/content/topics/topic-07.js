/* ============================================================
   topic-07.js — Segurança
   ------------------------------------------------------------
   Estrutura documentada no modelo topic-01.js (sections[] com
   slides[] opcionais, quiz[], glossary[], references[]).
   Conteúdo baseado em: COULOURIS et al., cap. 11 (pp. 463–519),
   VAN STEEN; TANENBAUM, 4. ed., cap. 9 e KSHEMKALYANI; SINGHAL,
   cap. 16 (leituras complementares).
   ============================================================ */

window.SD = window.SD || {};
SD.content = SD.content || {};

SD.content["07"] = {

  sections: [
    {
      title: "Ameaças e ataques",
      html:
        "<p>Nos tópicos anteriores construímos sistemas que <em>funcionam</em>: " +
        "processos que conversam por soquetes, chamadas remotas que parecem " +
        "locais, servidores que atendem milhares de requisições. Este tópico " +
        "muda a pergunta, e se alguém quiser <strong>quebrar</strong> tudo " +
        "isso? A necessidade de segurança nasce do mesmo desejo que criou os " +
        "sistemas distribuídos: <strong>compartilhar recursos</strong>. Recurso " +
        "que não é compartilhado se protege por isolamento; recurso " +
        "compartilhado vive encapsulado em processos cujas interfaces são " +
        "<em>necessariamente abertas</em> (qualquer cliente novo precisa poder " +
        "chamá-las) e que conversam por uma rede usada por muitos. Quem está " +
        "autorizado a usar um recurso é um <strong>principal</strong>: um " +
        "usuário ou um processo agindo em nome dele.</p>" +
        "<h3>Políticas × mecanismos</h3>" +
        "<p>No mundo físico, uma empresa não “instala segurança”: ela adota uma " +
        "<strong>política</strong> (só funcionários e visitantes autorizados " +
        "entram no prédio) e a impõe com <strong>mecanismos</strong> " +
        "(recepcionista, crachás, guarda, tranca eletrônica). A distinção vale " +
        "igual no mundo digital: a política diz <em>quem pode o quê</em> e " +
        "independe da tecnologia; os mecanismos (criptografia, autenticação, " +
        "controle de acesso) apenas a fazem valer. Uma tranca na porta não " +
        "garante nada se não existir a política de trancá-la. Nenhum mecanismo " +
        "deste tópico “torna um sistema seguro” por si só.</p>" +
        "<h3>Três classes de ameaça, cinco métodos de ataque</h3>" +
        "<p>As ameaças à segurança caem em três classes amplas: " +
        "<strong>vazamento</strong> (informação chega a quem não devia), " +
        "<strong>falsificação</strong> (alteração não autorizada da " +
        "informação) e <strong>vandalismo</strong> (interferir na operação " +
        "correta do sistema, <em>sem ganho</em> para o invasor). Os ataques " +
        "concretos exploram os <em>canais de comunicação</em>:</p>" +
        "<ul>" +
        "<li><strong>Intromissão</strong>: obter cópias de mensagens sem " +
        "autorização (em muitas redes locais, basta um programa ouvindo);</li>" +
        "<li><strong>Mascaramento</strong>: enviar ou receber mensagens com a " +
        "identidade de outro principal;</li>" +
        "<li><strong>Falsificação de mensagem</strong>: interceptar e alterar " +
        "o conteúdo antes de entregar. O caso célebre é o <em>homem no meio</em> " +
        "(man-in-the-middle): o invasor intercepta a troca inicial de chaves e " +
        "substitui pelas dele, passando a decifrar e recifrar tudo dali em " +
        "diante;</li>" +
        "<li><strong>Reprodução</strong> (replay): armazenar mensagens " +
        "interceptadas e reenviá-las depois. Funciona <em>mesmo com mensagens " +
        "cifradas e autenticadas</em>: Mallory não precisa da chave para copiar " +
        "os bits de um pedido de pagamento e fazer Bob pagar duas vezes;</li>" +
        "<li><strong>Negação de serviço</strong>: saturar um canal ou recurso " +
        "com mensagens para impedir o acesso dos demais.</li>" +
        "</ul>" +
        '<div class="callout">' +
        '<p class="callout-title">💡 O elenco da segurança</p>' +
        "<p>A literatura de segurança usa nomes próprios para os protagonistas " +
        "desde o artigo original do RSA (1978): <strong>Alice</strong> e " +
        "<strong>Bob</strong> são os participantes legítimos, " +
        "<strong>Carol</strong> e <strong>Dave</strong> entram em protocolos de " +
        "três ou quatro partes, <strong>Eve</strong> é a bisbilhoteira " +
        "(<em>eavesdropper</em>), <strong>Mallory</strong> é o invasor " +
        "mal-intencionado e <strong>Sara</strong> é um servidor. Nomear os " +
        "papéis torna os protocolos legíveis, e as brechas, visíveis. Vamos " +
        "usá-los o tópico inteiro.</p>" +
        "</div>" +
        "<h3>Ameaças além do canal</h3>" +
        "<p>Nos sistemas com <strong>código móvel</strong>, o perigo entra pela " +
        "porta da frente: um programa baixado de um servidor remoto executa " +
        "<em>dentro</em> do seu processo. A máquina virtual Java foi projetada " +
        "para isso: cada aplicação ganha um ambiente com um <em>gerenciador de " +
        "segurança</em> que limita o que ela alcança (o modelo " +
        "<em>sandbox</em>), classes baixadas ficam separadas das locais e os " +
        "bytecodes são validados antes de executar. Ainda assim, a história " +
        "registra brechas: construir um ambiente de execução seguro é cheio de " +
        "oportunidades de erro. Há também o <strong>vazamento de " +
        "informações</strong> sutil: às vezes a simples <em>existência</em> do " +
        "tráfego informa (uma avalanche de mensagens para um operador da bolsa " +
        "sobre certa ação já diz muito), o que motiva atribuir níveis de " +
        "segurança à informação e controlar seu fluxo.</p>" +
        "<h3>Transações que dependem de segurança</h3>" +
        "<p>Pense no que a Internet faz todo dia: <em>e-mail</em> com conteúdo " +
        "sigiloso, <em>compras</em> com número de cartão, <em>bancos</em> " +
        "on-line, <em>microtransações</em> de centavos. Políticas de segurança " +
        "para compras na web exigem: (1) <strong>autenticar o vendedor</strong> " +
        "para o comprador (você está mesmo falando com a loja?); (2) proteger o " +
        "<strong>cartão de crédito</strong> em trânsito, sem alteração; (3) " +
        "entregar bens digitais sem exposição a terceiros. O banco acrescenta " +
        "(4): <strong>autenticar o correntista</strong> antes de dar acesso à " +
        "conta, e garantir que ele <em>não possa negar</em> depois que fez a " +
        "transação, o requisito chamado <strong>não repúdio</strong>. E tudo " +
        "isso deve funcionar entre desconhecidos: comprador e vendedor fecham " +
        "negócio <em>sem contato prévio</em> e sem registrar chaves antes.</p>" +
        "<h3>Projetando para o pior caso</h3>" +
        "<p>Segurança se projeta supondo o pior. As diretrizes clássicas:</p>" +
        "<ul>" +
        "<li>As <strong>interfaces são expostas</strong>: qualquer um pode " +
        "enviar uma mensagem para qualquer interface;</li>" +
        "<li>As <strong>redes são inseguras</strong>: remetentes podem ser " +
        "forjados, endereços sofrem <em>spoofing</em>;</li>" +
        "<li>Todo segredo tem <strong>prazo e escopo limitados</strong>: " +
        "quanto mais uma chave circula, maior o risco;</li>" +
        "<li>Os <strong>algoritmos e o código estão nas mãos do invasor</strong>" +
        ": a prática correta é publicar os algoritmos e concentrar o segredo " +
        "<em>nas chaves</em>; algoritmos abertos ao escrutínio ficam mais " +
        "fortes;</li>" +
        "<li>O invasor tem <strong>acesso a recursos enormes</strong>: " +
        "dimensione para os computadores que existirão durante a vida do " +
        "sistema, e acrescente margem;</li>" +
        "<li><strong>Minimize a base confiável</strong>: a parte do sistema da " +
        "qual a segurança depende deve ser a menor possível (não confie em " +
        "aplicativos para proteger dados).</li>" +
        "</ul>" +
        "<p>O método: construir a <strong>lista de ameaças</strong> e mostrar " +
        "que cada uma é evitada pelos mecanismos empregados. Como nenhuma lista " +
        "é exaustiva, mantém-se <strong>auditoria</strong>: um log seguro com " +
        "carimbo de tempo (principal, operação, objeto) para detectar violações " +
        "depois. E como mecanismos custam processamento e atrapalham usuários " +
        "legítimos, pondera-se sempre <em>custo contra ameaça</em>: a proteção " +
        "deve custar menos do que vale o que ela protege.</p>",
      slides: [
        {
          title: "Por que segurança?",
          html:
            "<ul>" +
            "<li>Compartilhar recursos ⇒ proteger recursos</li>" +
            "<li>Interfaces de serviço são <strong>necessariamente " +
            "abertas</strong></li>" +
            "<li>A rede é de todos, inclusive de Mallory</li>" +
            "<li><strong>Política</strong> (quem pode o quê) × " +
            "<strong>mecanismo</strong> (como impor)</li>" +
            "</ul>"
        },
        {
          title: "Ameaças e ataques",
          html:
            "<ul>" +
            "<li>Classes: <strong>vazamento</strong> · " +
            "<strong>falsificação</strong> · <strong>vandalismo</strong></li>" +
            "<li>Ataques no canal: intromissão · mascaramento · falsificação " +
            "de mensagem (<em>homem no meio</em>) · " +
            "<strong>reprodução</strong> · negação de serviço</li>" +
            "<li>Replay funciona <em>sem conhecer a chave</em></li>" +
            "</ul>"
        },
        {
          title: "O elenco",
          html:
            "<ul>" +
            "<li><strong>Alice</strong> e <strong>Bob</strong>: participantes " +
            "legítimos</li>" +
            "<li><strong>Eve</strong>: bisbilhoteira · <strong>Mallory</strong>: " +
            "invasor ativo · <strong>Sara</strong>: servidor</li>" +
            "<li>Convenção da literatura desde o artigo do RSA (1978)</li>" +
            "</ul>"
        },
        {
          title: "Transações eletrônicas",
          html:
            "<ul>" +
            "<li>E-mail · compras · banco · microtransações</li>" +
            "<li>Autenticar o <strong>vendedor</strong>; proteger o " +
            "<strong>cartão</strong> em trânsito</li>" +
            "<li>Autenticar o <strong>correntista</strong>; garantir " +
            "<strong>não repúdio</strong></li>" +
            "<li>Tudo entre desconhecidos, sem acordo prévio</li>" +
            "</ul>"
        },
        {
          title: "Suposições de pior caso",
          html:
            "<ul>" +
            "<li>Interfaces expostas · redes inseguras</li>" +
            "<li>Segredos com <strong>prazo e escopo limitados</strong></li>" +
            "<li>Algoritmos <strong>públicos</strong>; segredo só nas " +
            "<strong>chaves</strong></li>" +
            "<li>Invasor com recursos enormes · base confiável " +
            "<strong>mínima</strong></li>" +
            "<li>Lista de ameaças + auditoria + custo × ameaça</li>" +
            "</ul>"
        }
      ]
    },

    {
      title: "Criptografia: chaves secretas e chaves públicas",
      html:
        "<p><strong>Criptografia</strong> é codificar a informação num formato " +
        "que só os destinatários apropriados conseguem ler. O algoritmo aplica " +
        "uma função de cifragem parametrizada por um segredo: a " +
        "<strong>chave</strong>, de modo que reverter a transformação sem a " +
        "chave seja impraticável. A notação usada na literatura (e daqui em " +
        "diante): <em>K<sub>A</sub></em> é a chave secreta de Alice; " +
        "<em>K<sub>AB</sub></em>, a chave compartilhada por Alice e Bob; " +
        "<em>K<sub>Apriv</sub></em> e <em>K<sub>Apub</sub></em>, o par " +
        "privada/pública de Alice; <em>{M}<sub>K</sub></em> é a mensagem M " +
        "cifrada com K; <em>[M]<sub>K</sub></em>, a mensagem M assinada com " +
        "K.</p>" +
        "<p>Há duas grandes famílias. Na <strong>criptografia de chave secreta " +
        "(simétrica)</strong>, remetente e destinatário compartilham a mesma " +
        "chave, e mais ninguém. Na <strong>criptografia de chave pública " +
        "(assimétrica)</strong>, cada um tem um <em>par</em>: a chave pública é " +
        "publicada para o mundo cifrar; só a privada correspondente decifra. A " +
        "assimétrica resolve elegantemente a distribuição de chaves, mas cobra " +
        "caro: exige da ordem de <strong>100 a 1.000 vezes mais " +
        "processamento</strong> que a simétrica.</p>" +
        "<h3>Três cenários para entender os usos</h3>" +
        "<p><strong>Cenário 1: segredo com chave compartilhada:</strong> Alice " +
        "cifra mensagens com <em>K<sub>AB</sub></em> e Bob as decifra. Se a " +
        "mensagem decifrada faz sentido (contém uma soma de verificação " +
        "combinada), Bob sabe que veio de Alice e não foi alterada. Ficam dois " +
        "problemas no ar: <em>como Alice entrega K<sub>AB</sub> a Bob com " +
        "segurança?</em> E <em>como Bob sabe que a mensagem não é um replay</em> " +
        "de Mallory?</p>" +
        "<p><strong>Cenário 2: autenticação com um servidor:</strong> Sara, um " +
        "servidor de autenticação, conhece as chaves secretas de todos os " +
        "principais (derivadas das senhas). Quando Alice quer usar o servidor " +
        "de arquivos de Bob, Sara responde com um <strong>tíquete</strong> " +
        "cifrado com a chave de Bob (contendo a identidade de Alice e uma nova " +
        "chave de sessão <em>K<sub>AB</sub></em>), tudo embrulhado na chave de " +
        "Alice. Repare no truque, chamado <strong>desafio</strong> " +
        "(challenge): a senha de Alice <em>nunca viaja pela rede</em>: a " +
        "resposta de Sara só é útil para quem conseguir decifrá-la, e só a " +
        "verdadeira Alice, com a senha certa, consegue. Esse esquema é uma " +
        "versão simplificada do protocolo de Needham, Schroeder, a base do " +
        "Kerberos (seção de estudos de caso).</p>" +
        "<p><strong>Cenário 3: chaves públicas distribuindo chaves " +
        "secretas:</strong> Alice obtém a chave pública de Bob, gera uma chave " +
        "de sessão <em>K<sub>AB</sub></em> e a envia cifrada com " +
        "<em>K<sub>Bpub</sub></em>; só Bob decifra. É o <strong>protocolo " +
        "misto</strong> usado na prática (TLS). Mas atenção: se Mallory " +
        "interceptar o pedido e responder com a chave pública <em>dele</em>, " +
        "vira o homem no meio e lê tudo. A defesa é exigir que a chave pública " +
        "venha num <strong>certificado</strong> assinado por autoridade " +
        "confiável: assunto da próxima seção.</p>" +
        "<h3>Por dentro dos algoritmos</h3>" +
        "<p>Toda a criptografia moderna repousa sobre <strong>funções de mão " +
        "única</strong>: fáceis de calcular, inviáveis de inverter. Nos " +
        "algoritmos simétricos, a segurança contra a força bruta cresce " +
        "exponencialmente com o tamanho da chave: testar todas as chaves de " +
        "<em>N</em> bits custa 2<sup><em>N</em>−1</sup> tentativas em média. Os " +
        "algoritmos de chave pública usam <strong>funções de alçapão</strong> " +
        "(trap-door): mão única <em>com uma saída secreta</em>. No RSA, " +
        "multiplicar dois primos enormes é fácil; fatorar o produto de volta, " +
        "impraticável: a menos que você conheça o segredo (a chave " +
        "privada).</p>" +
        "<p>Os algoritmos simétricos misturam o texto com a chave usando os " +
        "princípios de <em>mistura</em> e <em>difusão</em> de Shannon, em geral " +
        "sobre <strong>cifras de bloco</strong> (blocos de 64 ou 128 bits). " +
        "Cifrar cada bloco isoladamente repete padrões; por isso usa-se o " +
        "<strong>encadeamento de blocos de cifra (CBC)</strong>: cada bloco de " +
        "texto puro passa por XOR com o bloco <em>cifrado</em> anterior antes " +
        "de ser cifrado, e um <strong>vetor de inicialização</strong> " +
        "diferente por mensagem impede que duas mensagens iguais produzam o " +
        "mesmo texto cifrado. Para dados em tempo real (voz, vídeo), em que " +
        "não dá para esperar blocos, a <strong>cifra de fluxo</strong> gera um " +
        "<em>fluxo de chaves</em> pseudoaleatório e faz XOR bit a bit com os " +
        "dados, como um ruído branco combinado que o receptor sabe " +
        "subtrair.</p>" +
        "<h3>O arsenal</h3>" +
        "<p><strong>TEA</strong> (Tiny Encryption Algorithm) cabe em meia " +
        "página de C: chave de 128 bits, ótimo para entender como mistura e " +
        "difusão viram código. <strong>DES</strong>, o padrão americano por " +
        "décadas, usa chave de 56 bits: hoje é peça de museu. " +
        "<strong>Triple-DES</strong> (3DES) aplica o DES três vezes (força de " +
        "112 bits), mas é lento. <strong>IDEA</strong> (128 bits) cifra cerca " +
        "de 3× mais rápido que o DES. O <strong>AES</strong> (algoritmo " +
        "Rijndael) venceu o concurso público do NIST em 2000, 21 propostas de " +
        "11 países, e é o padrão atual, com chaves de 128, 192 ou 256 bits. " +
        "<strong>RC4</strong>, cifra de fluxo ~10× mais rápida que o DES, foi " +
        "adotada em todo lugar (inclusive no WiFi) até revelarem fraquezas: " +
        "história contada na última seção. No lado assimétrico, o " +
        "<strong>RSA</strong> usa primos maiores que 10<sup>100</sup>; chaves " +
        "de 512 bits já foram fatoradas, e recomenda-se pelo menos " +
        "<strong>768 bits</strong> (até 2.048 em aplicações exigentes). Os " +
        "algoritmos de <strong>curva elíptica</strong> obtêm segurança " +
        "equivalente com chaves menores e menos processamento: atraentes para " +
        "dispositivos móveis.</p>" +
        '<div class="callout">' +
        '<p class="callout-title">💡 O dia em que a Internet quebrou o DES</p>' +
        "<p>Em 1997, um consórcio de voluntários pôs até <strong>14.000 " +
        "máquinas</strong> comuns para varrer o espaço de chaves do DES em " +
        "paralelo, coordenadas por um único servidor que distribuía intervalos " +
        "de chaves: um sistema distribuído atacando outro. A chave de 56 bits " +
        "caiu em ~12 semanas, após testar cerca de 25% das 2<sup>56</sup> " +
        "possibilidades. No ano seguinte, uma máquina dedicada da Electronic " +
        "Frontier Foundation passou a quebrar chaves DES em <strong>três " +
        "dias</strong>. Moral: segurança é aritmética: 56 bits eram pouco; " +
        "cada bit a mais dobra o custo do ataque.</p>" +
        "</div>" +
        "<h3>Desempenho e o protocolo misto</h3>" +
        "<p>Nos números da biblioteca Crypto++ (num Pentium 4 de 2,1 GHz), o " +
        "AES cifra na casa de <strong>60 MB/s</strong>: uma página web " +
        "raramente passa de 100 KB, ou seja, cifrar seu conteúdo custa poucos " +
        "milissegundos. Assinar com RSA de 1.024 bits custa ~4,75 ms; " +
        "verificar, ~0,18 ms. A conclusão prática: usa-se <strong>chave " +
        "pública só na abertura</strong> da conversa (autenticar as partes e " +
        "trocar uma chave de sessão) e <strong>chave secreta para o " +
        "grosso dos dados</strong>. Esse é o <em>esquema de criptografia " +
        "misto</em>, e é exatamente o desenho do TLS, que sustenta o " +
        "comércio eletrônico inteiro.</p>" +
        '<div class="demo-area" data-demo="criptografia-basica">' +
        '<span class="demo-placeholder-icon" aria-hidden="true">🧪</span>' +
        "<p><strong>Demonstração interativa (em breve)</strong></p>" +
        "<p>Espaço reservado para uma demonstração interativa de criptografia de chave pública e assinaturas.</p>" +
        "</div>",
      slides: [
        {
          title: "A ferramenta e a notação",
          html:
            "<ul>" +
            "<li><em>{M}<sub>K</sub></em>: M cifrada com K · " +
            "<em>[M]<sub>K</sub></em>: M assinada com K</li>" +
            "<li><strong>Simétrica</strong>: mesma chave nos dois lados " +
            "(K<sub>AB</sub>)</li>" +
            "<li><strong>Assimétrica</strong>: par público/privado: o mundo " +
            "cifra, só o dono decifra</li>" +
            "<li>Assimétrica custa <strong>100-1.000×</strong> mais</li>" +
            "</ul>"
        },
        {
          title: "Três cenários",
          html:
            "<ul>" +
            "<li><strong>1.</strong> Segredo compartilhado, mas como " +
            "distribuir a chave? E o replay?</li>" +
            "<li><strong>2.</strong> Servidor de autenticação: " +
            "<strong>tíquete</strong> + <strong>desafio</strong>: a senha " +
            "nunca viaja (base do Kerberos)</li>" +
            "<li><strong>3.</strong> Chave pública entrega chave de sessão: " +
            "cuidado com o <em>homem no meio</em></li>" +
            "</ul>"
        },
        {
          title: "Por dentro dos algoritmos",
          html:
            "<ul>" +
            "<li><strong>Mão única</strong>: fácil ir, inviável voltar · força " +
            "bruta ∝ 2<sup>N</sup></li>" +
            "<li><strong>Alçapão</strong> (RSA): multiplicar primos é fácil; " +
            "fatorar, não</li>" +
            "<li>Bloco + <strong>CBC</strong> (XOR com o bloco anterior + " +
            "vetor de inicialização)</li>" +
            "<li><strong>Fluxo</strong>: XOR com fluxo de chaves: dados em " +
            "tempo real</li>" +
            "</ul>"
        },
        {
          title: "O arsenal",
          html:
            "<ul>" +
            "<li><strong>DES</strong> (56 bits): quebrado em 1997 · " +
            "<strong>3DES</strong>: seguro, lento</li>" +
            "<li><strong>IDEA</strong> (128) · <strong>AES</strong>/Rijndael " +
            "(128-256): padrão atual</li>" +
            "<li><strong>RC4</strong>: fluxo, veloz, e com defeitos (WiFi!)</li>" +
            "<li><strong>RSA</strong>: ≥ 768 bits · <strong>curvas " +
            "elípticas</strong>: chaves menores</li>" +
            "</ul>"
        },
        {
          title: "Misto: o padrão da prática",
          html:
            "<ul>" +
            "<li>Chave <strong>pública</strong>: autenticar + trocar a chave " +
            "de sessão</li>" +
            "<li>Chave <strong>secreta</strong>: cifrar o grosso dos dados</li>" +
            "<li>AES ~60 MB/s: uma página web custa milissegundos</li>" +
            "<li>É o desenho do <strong>TLS</strong></li>" +
            "</ul>"
        }
      ]
    },

    {
      title: "Assinaturas digitais, certificados e controle de acesso",
      html:
        "<p>Uma assinatura manuscrita atende três necessidades de quem recebe " +
        "o documento: ele é <strong>autêntico</strong> (o signatário assinou " +
        "deliberadamente e ninguém alterou), <strong>impossível de " +
        "falsificar</strong> (só o signatário poderia tê-lo assinado; a " +
        "assinatura não se transplanta para outro documento) e " +
        "<strong>impossível de repudiar</strong> (o signatário não pode negar " +
        "depois). Documentos digitais são triviais de copiar e alterar: colar " +
        "o nome ou a foto do autor não prova nada. A <strong>assinatura " +
        "digital</strong> resolve vinculando de forma irreversível um " +
        "<em>segredo do signatário</em> à <em>sequência de bits inteira</em> do " +
        "documento.</p>" +
        "<h3>Resumos seguros</h3>" +
        "<p>Assinar o documento inteiro seria caro; assina-se um " +
        "<strong>resumo</strong> (digest) de comprimento fixo, calculado por " +
        "uma <em>função de resumo segura</em> H(M): também chamada de hash " +
        "seguro. As propriedades exigidas: dado M, calcular h = H(M) é fácil; " +
        "dado h, recuperar M é inviável; e, crucialmente, dado M, é inviável " +
        "achar <em>outro</em> M′ com H(M) = H(M′): senão Mallory colaria a " +
        "assinatura de M num M′ forjado. As funções clássicas são o " +
        "<strong>MD5</strong> (resumo de 128 bits, rapidíssimo) e o " +
        "<strong>SHA-1</strong> (160 bits, mais lento e mais forte); depois de " +
        "ataques publicados contra seus predecessores, o NIST passou a " +
        "recomendar versões SHA de resumo mais longo (224 a 512 bits).</p>" +
        '<div class="callout">' +
        '<p class="callout-title">💡 O paradoxo do aniversário</p>' +
        "<p>Numa sala com <strong>23 pessoas</strong>, a chance de duas fazerem " +
        "aniversário no mesmo dia já passa de 50%: achar <em>um par qualquer</em> " +
        "é muito mais fácil do que achar alguém com uma data específica. O " +
        "<em>ataque da data de nascimento</em> explora isso: Alice gera milhares " +
        "de variações invisíveis (espaços no fim das linhas) de um contrato " +
        "favorável M e de um desfavorável M′, até achar um par com o " +
        "<em>mesmo resumo</em>. Bob assina M; Alice troca por M′: a assinatura " +
        "continua batendo. Com resumos de 64 bits bastam ~2<sup>32</sup> " +
        "versões; por isso resumos seguros têm <strong>128 bits ou mais</strong>.</p>" +
        "</div>" +
        "<h3>Assinando com chave pública, e com chave secreta</h3>" +
        "<p>No método padrão, Alice calcula H(M) e cifra o resumo <em>com sua " +
        "chave privada</em>: S = {H(M)}<sub>Kpriv</sub>. Qualquer um verifica: " +
        "decifra S com a chave pública de Alice, recalcula H(M) e compara. " +
        "Note a inversão elegante: para <em>segredo</em>, cifra-se com a chave " +
        "pública <em>do destinatário</em>; para <em>assinar</em>, com a chave " +
        "privada <em>do remetente</em>: o segredo é só do signatário, a " +
        "verificação é de todos. O RSA serve perfeitamente. Há também a " +
        "variante barata com chave secreta: quando um canal seguro já " +
        "estabeleceu um segredo compartilhado K, calcula-se h = H(M + K): um " +
        "<strong>código de autenticação de mensagem (MAC)</strong>. Não " +
        "envolve criptografia nenhuma (resumos são 3-10× mais rápidos que " +
        "cifrar), e é o que o TLS usa para autenticar cada bloco " +
        "transmitido.</p>" +
        "<h3>Certificados: a confiança vira documento</h3>" +
        "<p>Um <strong>certificado digital</strong> é uma declaração assinada " +
        "por um principal. Carol (vendedora) aceita o certificado “Alice tem a " +
        "conta 6262626” porque ele é assinado pelo Banco Bob; mas para validar " +
        "essa assinatura ela precisa da chave pública de Bob: obtida em " +
        "<em>outro</em> certificado, “a chave pública do Banco Bob é " +
        "K<sub>Bpub</sub>”, assinado por Fred, a Federação dos Bancos. É um " +
        "<strong>encadeamento de certificados</strong>: a verificação sobe a " +
        "cadeia até uma <strong>autoridade certificadora</strong> em que Carol " +
        "já confia por outros meios. O formato padrão é o <strong>X.509</strong>: " +
        "sujeito (nome + chave pública), emitente (nome + assinatura) e " +
        "<em>período de validade</em>. Revogar certificado é tão difícil " +
        "(avisar todo mundo?) que a solução prática é a <strong>data de " +
        "expiração</strong>: certificado vencido se rejeita, e o dono renova. " +
        "Quanto mais longa a cadeia, maior o risco de um elo fraco, e a " +
        "escolha da autoridade raiz é sempre o ponto sensível.</p>" +
        "<h3>Controle de acesso: capacidades × ACLs</h3>" +
        "<p>Autenticado o principal, falta decidir <em>o que ele pode fazer</em>. " +
        "As requisições têm a forma &lt;op, principal, recurso&gt; e o servidor " +
        "aplica o controle de acesso do seu <strong>domínio de proteção</strong>" +
        ": o conjunto de pares &lt;recurso, direitos&gt; do principal. Duas " +
        "implementações clássicas:</p>" +
        "<ul>" +
        "<li><strong>Capacidades</strong>: o <em>cliente</em> porta uma chave " +
        "de acesso infalsificável (identificador do recurso + operações " +
        "permitidas + assinatura). Como a chave de uma porta: prova imediata, " +
        "sem consultar listas, ótima para <em>delegar</em>. E com os mesmos " +
        "defeitos da chave física: pode ser <em>roubada</em> (quem pega, usa) e " +
        "é difícil de <em>revogar</em>;</li>" +
        "<li><strong>Listas de controle de acesso (ACLs)</strong>: a lista " +
        "fica com o <em>recurso</em>: cada arquivo carrega &lt;domínio, " +
        "operações&gt; como os bits de permissão do UNIX e do Windows. " +
        "Alterações valem na hora (revogação imediata), ao custo de verificar " +
        "a lista a cada acesso.</li>" +
        "</ul>" +
        "<p><strong>Credenciais</strong> generalizam o conceito: o certificado " +
        "de chave pública <em>representa</em> o usuário (requisição assinada " +
        "com a chave privada dele fala por ele), certificados de " +
        "<em>papel</em> (role) associam principais a funções organizacionais, e " +
        "um certificado de <strong>delegação</strong> autoriza alguém a agir em " +
        "nome de outro: o servidor de impressão que recebe o direito " +
        "<em>temporário</em> de ler o arquivo protegido que vai imprimir. Já os " +
        "<strong>firewalls</strong> protegem no atacado: filtram toda a " +
        "comunicação da intranet com o exterior. São necessários, mas " +
        "grosseiros: não protegem <em>nada</em> contra ataques de dentro da " +
        "organização, não dão controle fino por usuário e pouco podem contra " +
        "negação de serviço: a avalanche satura justamente o ponto único de " +
        "defesa.</p>",
      slides: [
        {
          title: "O que uma assinatura promete",
          html:
            "<ul>" +
            "<li><strong>Autêntica</strong> · <strong>infalsificável</strong> " +
            "· <strong>irrepudiável</strong></li>" +
            "<li>Documento digital: copiar e alterar é trivial</li>" +
            "<li>Solução: vincular um <strong>segredo do signatário</strong> " +
            "aos bits do documento inteiro</li>" +
            "</ul>"
        },
        {
          title: "Resumo + chave privada",
          html:
            "<ul>" +
            "<li>H(M): fácil calcular · inviável inverter · inviável " +
            "<em>colidir</em></li>" +
            "<li>MD5 (128 bits) · SHA-1 (160 bits)</li>" +
            "<li>Assinar = cifrar H(M) com <strong>K<sub>priv</sub></strong>; " +
            "verificar com K<sub>pub</sub></li>" +
            "<li><strong>MAC</strong>: h = H(M + K): sem criptografia, para " +
            "canais com segredo compartilhado</li>" +
            "</ul>"
        },
        {
          title: "O paradoxo do aniversário",
          html:
            "<ul>" +
            "<li>23 pessoas ⇒ &gt; 50% de aniversários coincidentes</li>" +
            "<li>Achar <em>um par qualquer</em> é fácil; um alvo específico, " +
            "difícil</li>" +
            "<li>Resumo de 64 bits cai com ~2<sup>32</sup> variações do " +
            "documento</li>" +
            "<li>Por isso: resumos de <strong>≥ 128 bits</strong></li>" +
            "</ul>"
        },
        {
          title: "Certificados",
          html:
            "<ul>" +
            "<li>Declaração <strong>assinada</strong> por um principal</li>" +
            "<li><strong>Cadeia</strong>: Alice ← Banco Bob ← Federação: até " +
            "uma autoridade confiável</li>" +
            "<li><strong>X.509</strong>: sujeito · emitente · validade</li>" +
            "<li>Revogar é difícil ⇒ <strong>data de expiração</strong></li>" +
            "</ul>"
        },
        {
          title: "Controle de acesso",
          html:
            "<ul>" +
            "<li>&lt;op, principal, recurso&gt; + domínio de proteção</li>" +
            "<li><strong>Capacidade</strong>: chave na mão do cliente: " +
            "delega fácil, revoga difícil</li>" +
            "<li><strong>ACL</strong>: lista no recurso (UNIX, Windows): " +
            "revogação imediata</li>" +
            "<li>Delegação: o servidor de impressão · firewall: filtro na " +
            "borda, nada contra o insider</li>" +
            "</ul>"
        }
      ]
    },

    {
      title: "Estudos de caso: Needham, Schroeder, Kerberos, TLS e WiFi",
      html:
        "<p>Quatro sistemas reais mostram a teoria em ação, e, no último " +
        "caso, o preço de ignorá-la.</p>" +
        "<h3>Needham, Schroeder: o protocolo fundador</h3>" +
        "<p>Publicado em 1978, quando os servidores de arquivos surgiam e era " +
        "urgente gerenciar chaves numa rede local. A ideia: um " +
        "<strong>servidor de autenticação</strong> S guarda a chave secreta de " +
        "cada principal e fabrica, sob demanda, chaves de sessão para cada " +
        "par. Quando A quer falar com B: (1) A pede a S uma chave para " +
        "conversar com B, incluindo um <strong>nonce</strong> N<sub>A</sub>: " +
        "um número usado uma única vez, que prova que a resposta é nova; (2) S " +
        "devolve, cifrado com a chave de A: o nonce, a chave de sessão " +
        "K<sub>AB</sub> recém-gerada e um <strong>tíquete</strong> " +
        "{K<sub>AB</sub>, A} cifrado com a chave de B; (3) A repassa o tíquete " +
        "a B, que o decifra e descobre com quem fala e com qual chave; (4-5) B " +
        "desafia A com um nonce cifrado em K<sub>AB</sub>, e A responde com " +
        "uma transformação combinada (N<sub>B</sub> − 1), provando que possui " +
        "a chave. A fraqueza famosa: <em>B não tem como saber se a mensagem 3 " +
        "é nova</em>. Se Mallory comprometer uma chave de sessão antiga e " +
        "tiver guardado o tíquete correspondente, pode reapresentá-lo e se " +
        "passar por A. O conserto: incluir um <strong>carimbo de tempo</strong> " +
        "no tíquete. É exatamente o que o Kerberos adotou.</p>" +
        "<h3>Kerberos: autenticação para a intranet inteira</h3>" +
        "<p>Desenvolvido no MIT nos anos 80 para o campus, o Kerberos (versão " +
        "5, RFC 4120) é hoje o serviço de autenticação padrão de sistemas como " +
        "o Windows. Ele lida com três objetos: o <strong>tíquete</strong> " +
        "(passe com prazo de validade para um servidor específico), o " +
        "<strong>autenticador</strong> (prova de identidade que <em>só vale " +
        "uma vez</em>: nome + carimbo de tempo, cifrados na chave de sessão) e " +
        "a <strong>chave de sessão</strong>. O servidor Kerberos: chamado " +
        "<strong>KDC</strong> (Centro de Distribuição de Chaves): tem dois " +
        "guichês: o <em>serviço de autenticação</em> (AS), procurado uma vez " +
        "por sessão de login, e o <em>serviço de concessão de tíquetes</em> " +
        "(TGS), procurado a cada novo servidor que o cliente queira usar. No " +
        "login, o AS responde com um desafio cifrado na chave derivada da " +
        "senha do usuário: quem digita a senha certa obtém a chave de sessão e " +
        "um tíquete para o TGS, e a senha é <em>apagada da memória</em> em " +
        "seguida, sem nunca ter viajado pela rede. Dali em diante, cada acesso " +
        "a serviço (arquivos, e-mail, login remoto, impressão) apresenta " +
        "tíquete + autenticador novo. Tíquetes valem horas (na prática, ~12h: " +
        "uma jornada), limitando o estrago de um comprometimento e permitindo " +
        "revogar usuários por expiração. O preço arquitetural: os nonces da " +
        "versão em uso são carimbos de tempo, então a proteção contra replay " +
        "<em>depende de relógios aproximadamente sincronizados</em> entre " +
        "clientes e servidores, e a sincronização, ela mesma, precisa ser " +
        "segura (Tópico de sincronização, mais adiante no curso).</p>" +
        "<h3>TLS: o canal seguro do comércio eletrônico</h3>" +
        "<p>O TLS (Transport Layer Security), herdeiro do SSL da Netscape, " +
        "materializa o protocolo misto para redes abertas: sem negociação " +
        "prévia e sem terceiros obrigatórios. Dois traços de projeto se " +
        "destacam. Primeiro, <strong>tudo é negociável</strong>: no " +
        "<em>handshake</em> (aperto de mãos), cliente e servidor acertam o " +
        "<strong>conjunto de cifras</strong>: método de troca de chaves (ex.: " +
        "RSA com certificados), cifra simétrica para os dados (ex.: AES) e " +
        "função de resumo para os MACs (ex.: SHA-1): em vez de amarrar o " +
        "protocolo a algoritmos fixos que o tempo pode derrubar. Segundo, a " +
        "<strong>partida a frio</strong>: a conversa começa em claro, troca " +
        "certificados X.509, e então um dos lados gera um <em>segredo " +
        "pré-mestre</em>, envia-o cifrado com a chave pública do outro, e " +
        "ambos derivam dele as chaves simétricas de sessão (uma por direção). " +
        "A partir da mensagem de “troca de especificação de cifra”, tudo passa " +
        "cifrado e autenticado. A camada inferior, o <strong>protocolo de " +
        "registro</strong>, processa cada mensagem da aplicação: fragmenta, " +
        "opcionalmente compacta, anexa o MAC e cifra, entregando ao TCP. " +
        "Sessões podem ser retomadas sem repetir o handshake. Contra o homem " +
        "no meio do cenário 3, a defesa prática: os navegadores já vêm de " +
        "fábrica com as chaves públicas das autoridades certificadoras " +
        "reconhecidas.</p>" +
        '<div class="callout">' +
        '<p class="callout-title">💡 O cadeado do navegador</p>' +
        "<p>Toda vez que uma URL começa com <code>https:</code>, esse teatro " +
        "inteiro acontece em milissegundos: handshake, certificado do " +
        "servidor validado contra as autoridades pré-instaladas, segredo " +
        "pré-mestre, chaves de sessão, e só então a página viaja, cifrada " +
        "com AES e autenticada bloco a bloco. O cadeado na barra de endereços " +
        "é o resumo visual deste tópico: criptografia mista + certificados + " +
        "MACs, funcionando em escala planetária.</p>" +
        "</div>" +
        "<h3>WEP: um catálogo de como não fazer</h3>" +
        "<p>O padrão IEEE 802.11 WiFi (1999) incluía a especificação de " +
        "segurança <strong>WEP</strong> (Wired Equivalent Privacy): controle " +
        "de acesso por desafio-resposta e cifragem RC4, ambos usando uma chave " +
        "K compartilhada. As deficiências viraram estudo de caso clássico:</p>" +
        "<ul>" +
        "<li><strong>Uma chave única para a rede inteira</strong>: " +
        "distribuída por canais desprotegidos; um único usuário descuidado (ou " +
        "um ex-funcionário) compromete tudo, sem que ninguém perceba;</li>" +
        "<li><strong>O ponto de acesso nunca se autentica</strong>: Mallory " +
        "pode subir um ponto de acesso falso e interceptar o tráfego de quem " +
        "se conectar;</li>" +
        "<li><strong>Mau uso da cifra de fluxo</strong>: o RC4 é reiniciado a " +
        "cada pacote com um <em>valor inicial de apenas 24 bits</em> " +
        "concatenado à chave fixa. São só ~10<sup>7</sup> estados: em poucas " +
        "horas o fluxo de chaves <em>se repete</em>, e o valor inicial viaja " +
        "aberto no pacote: o invasor detecta a repetição, deduz o fluxo de " +
        "chaves a partir de um texto puro conhecido e decifra os pacotes " +
        "seguintes;</li>" +
        "<li><strong>Chaves de 40 bits</strong>: incluídas para cumprir as " +
        "regras de exportação americanas da época: força bruta trivial;</li>" +
        "<li><strong>O próprio RC4 revelou-se fraco</strong> (ataques " +
        "publicados em 2001 recuperam a chave observando tráfego suficiente, " +
        "mesmo com 128 bits) e o WEP não previa <em>negociar</em> outro " +
        "algoritmo, ao contrário do TLS;</li>" +
        "<li><strong>Segurança desligada de fábrica</strong>: produtos vinham " +
        "com o WEP desativado e documentação omissa.</li>" +
        "</ul>" +
        "<p>A resposta veio no IEEE 802.11i: o <strong>WPA2</strong>, com " +
        "criptografia <strong>AES</strong> no lugar do RC4, ratificado em " +
        "2004. Releia as suposições de pior caso da primeira seção: cada " +
        "deficiência do WEP viola uma delas. Projetar segurança é difícil, e " +
        "é por isso que se começa pela lista de ameaças, não pela " +
        "tecnologia.</p>",
      slides: [
        {
          title: "Needham, Schroeder",
          html:
            "<ul>" +
            "<li>Servidor S conhece a chave secreta de cada principal</li>" +
            "<li>Entrega K<sub>AB</sub> + <strong>tíquete</strong> cifrado " +
            "para B</li>" +
            "<li><strong>Nonces</strong> provam que as respostas são novas</li>" +
            "<li>Falha: mensagem 3 pode ser reproduzida ⇒ carimbo de tempo " +
            "(Kerberos)</li>" +
            "</ul>"
        },
        {
          title: "Kerberos",
          html:
            "<ul>" +
            "<li><strong>KDC</strong> = AS (login) + TGS (um tíquete por " +
            "serviço)</li>" +
            "<li>Tíquete (~12h) + <strong>autenticador</strong> (uma vez) + " +
            "chave de sessão</li>" +
            "<li>A senha <strong>nunca viaja</strong>: desafio cifrado na " +
            "chave derivada dela</li>" +
            "<li>MIT, anos 80 → RFC 4120, autenticação padrão do Windows</li>" +
            "</ul>"
        },
        {
          title: "TLS: o aperto de mãos",
          html:
            "<ul>" +
            "<li>Negocia o <strong>conjunto de cifras</strong> (troca de " +
            "chaves + cifra + resumo)</li>" +
            "<li>Certificados X.509 · autoridades pré-instaladas no " +
            "navegador</li>" +
            "<li><strong>Segredo pré-mestre</strong> cifrado com chave " +
            "pública ⇒ chaves de sessão</li>" +
            "<li><code>https:</code> = tudo isso em milissegundos</li>" +
            "</ul>"
        },
        {
          title: "TLS: protocolo de registro",
          html:
            "<ul>" +
            "<li>Fragmenta → compacta (opcional) → <strong>MAC</strong> → " +
            "cifra → TCP</li>" +
            "<li>Privacidade + integridade + autenticidade, por mensagem</li>" +
            "<li>Sessões retomáveis sem novo handshake</li>" +
            "<li>Misto na prática: chave pública abre, AES conversa</li>" +
            "</ul>"
        },
        {
          title: "WEP: como não fazer",
          html:
            "<ul>" +
            "<li>Chave <strong>única</strong> para todos · ponto de acesso " +
            "<strong>nunca autenticado</strong></li>" +
            "<li>RC4 + valor inicial de <strong>24 bits</strong> ⇒ fluxo de " +
            "chaves se repete em horas</li>" +
            "<li>Chaves de 40 bits (regras de exportação) · segurança " +
            "desligada de fábrica</li>" +
            "<li>Resposta: <strong>WPA2</strong> (802.11i, AES, 2004)</li>" +
            "</ul>"
        }
      ]
    }
  ],

  quiz: [
    {
      question:
        "Um invasor satura um servidor com mensagens inúteis apenas para " +
        "impedir que os usuários legítimos o acessem: ele não lê nem altera " +
        "nenhuma informação. Nas classes de ameaça vistas no tópico, esse " +
        "ataque é um caso de:",
      options: [
        "Vazamento, porque informações sobre a carga do servidor ficam expostas ao invasor.",
        "Falsificação, porque as mensagens inúteis alteram o estado interno do servidor.",
        "Vandalismo: interferência na operação correta do sistema, sem ganho para o invasor.",
        "Mascaramento, porque o invasor esconde sua identidade ao enviar as mensagens."
      ],
      answer: 2,
      explanation:
        "O método de ataque é a negação de serviço; a classe de ameaça é o " +
        "vandalismo: interferir na operação correta sem obter informação nem " +
        "alterá-la. Vazamento seria informação chegando a quem não devia; " +
        "falsificação, alteração não autorizada de dados."
    },
    {
      question:
        "Mallory copia da rede uma mensagem cifrada que ordena um pagamento e " +
        "a reenvia, intacta, no dia seguinte: sem conhecer a chave. Que " +
        "ataque é esse, e por que a criptografia sozinha não o impede?",
      options: [
        "Homem no meio; a criptografia falha porque Mallory substituiu as chaves na troca inicial.",
        "Reprodução (replay); a mensagem é autêntica e decifra corretamente. É preciso um nonce ou carimbo de tempo para provar que ela é nova.",
        "Intromissão; a criptografia falha porque a chave era curta demais para resistir à força bruta.",
        "Ataque de texto puro escolhido; Mallory cifrou mensagens até obter uma correspondência."
      ],
      answer: 1,
      explanation:
        "É o ataque de reprodução: copiar os bits e reenviar depois funciona " +
        "mesmo com mensagens cifradas e autenticadas, porque a mensagem " +
        "reproduzida É legítima: só não é nova. A defesa é incluir prova de " +
        "frescor: nonces (Needham, Schroeder) ou carimbos de tempo (Kerberos)."
    },
    {
      question:
        "Por que o TLS usa criptografia de chave pública apenas na abertura " +
        "da sessão e troca para chaves secretas no restante da comunicação?",
      options: [
        "Porque algoritmos assimétricos custam da ordem de 100 a 1.000 vezes mais processamento: a chave pública serve para autenticar e trocar uma chave de sessão; a simétrica cifra o grosso dos dados.",
        "Porque a criptografia de chave pública não garante a integridade das mensagens, apenas o segredo.",
        "Porque os certificados X.509 expiram durante sessões longas, invalidando as chaves públicas.",
        "Porque as chaves secretas dispensam qualquer autenticação prévia entre as partes."
      ],
      answer: 0,
      explanation:
        "É o esquema de criptografia misto: a assimétrica resolve a " +
        "distribuição de chaves (sem canal seguro prévio), mas é cara demais " +
        "para volume de dados; a simétrica (AES, ~60 MB/s) faz o trabalho " +
        "pesado com a chave de sessão que a fase assimétrica estabeleceu."
    },
    {
      question:
        "Na assinatura digital com chaves públicas, o que Alice cifra, e com " +
        "qual chave?",
      options: [
        "O documento inteiro, com a chave pública de Bob, para que só ele verifique.",
        "O documento inteiro, com a sua chave pública, para provar que a publicou.",
        "O resumo (digest) do documento, com a chave pública de Bob, para garantir o sigilo da assinatura.",
        "O resumo (digest) do documento, com a sua própria chave privada: qualquer um verifica com a chave pública dela."
      ],
      answer: 3,
      explanation:
        "A assinatura precisa nascer de um segredo que só o signatário possui " +
        "(a chave privada) e ser verificável por todos (com a pública). " +
        "Assina-se o resumo, não o documento, porque cifrar H(M) de " +
        "comprimento fixo é muito mais barato, e o resumo seguro vincula a " +
        "assinatura aos bits do documento inteiro."
    },
    {
      question:
        "No login com Kerberos, a senha do usuário nunca é transmitida pela " +
        "rede. Como o serviço de autenticação sabe, então, que quem pediu o " +
        "tíquete é o usuário legítimo?",
      options: [
        "O cliente envia um resumo (hash) da senha, que o servidor compara com o armazenado.",
        "A resposta do servidor é um desafio: vem cifrada com a chave derivada da senha, e só quem digitar a senha correta consegue decifrá-la e obter a chave de sessão e o tíquete.",
        "O serviço de concessão de tíquetes consulta a lista de controle de acesso do usuário antes de responder.",
        "O servidor confia no endereço da máquina de origem, registrado previamente pelo administrador."
      ],
      answer: 1,
      explanation:
        "É o conceito de desafio (challenge) herdado de Needham, Schroeder: a " +
        "resposta do AS só é útil para quem consegue decifrá-la. Um impostor " +
        "recebe a mesma resposta, e fica olhando para dados incoerentes, " +
        "porque não tem a senha da qual a chave é derivada. A senha é usada " +
        "localmente e apagada da memória."
    },
    {
      question:
        "Qual foi o erro central do WEP (802.11) no uso da cifra de fluxo RC4?",
      options: [
        "Usar uma cifra de bloco onde a aplicação exigia uma cifra de fluxo, atrasando os pacotes.",
        "Não incluir nenhuma soma de verificação nos pacotes cifrados, sacrificando a integridade.",
        "Reiniciar o RC4 a cada pacote com um valor inicial de apenas 24 bits somado a uma chave fixa compartilhada: o fluxo de chaves se repete em poucas horas, e o invasor decifra os pacotes seguintes.",
        "Adotar o AES com chaves curtas demais para resistir a ataques de força bruta."
      ],
      answer: 2,
      explanation:
        "Com só 2²⁴ (~10⁷) valores iniciais possíveis, enviados abertos em " +
        "cada pacote, o fluxo de chaves se repete rápido; conhecendo o texto " +
        "puro de um pacote, o invasor deduz o fluxo e decifra os demais. A " +
        "especificação do RC4 alertava explicitamente contra repetir fluxo de " +
        "chaves. A correção veio no WPA2 (802.11i), com AES."
    }
  ],

  glossary: [
    {
      term: "Principal",
      definition:
        "Usuário ou processo autorizado a agir sobre recursos em um sistema " +
        "distribuído. As requisições têm a forma <op, principal, recurso>: " +
        "o servidor primeiro autentica o principal, depois aplica o controle " +
        "de acesso."
    },
    {
      term: "Ataque de reprodução (replay)",
      definition:
        "Armazenar mensagens interceptadas e reenviá-las mais tarde. Eficaz " +
        "mesmo contra mensagens cifradas e autenticadas: a cópia É legítima, " +
        "só não é nova. Combate-se com provas de frescor: nonces ou carimbos " +
        "de tempo."
    },
    {
      term: "Homem no meio (man-in-the-middle)",
      definition:
        "Ataque em que o invasor intercepta a troca inicial de chaves e a " +
        "substitui pelas suas, passando a decifrar e recifrar todo o tráfego " +
        "subsequente sem ser notado. A defesa é autenticar as chaves públicas " +
        "com certificados de autoridades confiáveis."
    },
    {
      term: "Criptografia de chave secreta (simétrica)",
      definition:
        "Família de algoritmos em que a mesma chave, compartilhada por " +
        "remetente e destinatário, cifra e decifra (DES, 3DES, IDEA, AES). " +
        "Rápida: por isso cuida do grosso dos dados nos protocolos mistos; " +
        "sua dificuldade é distribuir a chave com segurança."
    },
    {
      term: "Criptografia de chave pública (assimétrica)",
      definition:
        "Família de algoritmos com par de chaves: a pública, divulgada, " +
        "cifra; só a privada correspondente decifra (RSA, curvas elípticas). " +
        "Resolve a distribuição de chaves, mas custa 100-1.000× mais " +
        "processamento que a simétrica."
    },
    {
      term: "Função de alçapão (trap-door)",
      definition:
        "Função de mão única com uma saída secreta: fácil de calcular, " +
        "inviável de inverter: exceto para quem conhece o segredo. Base dos " +
        "esquemas de chave pública: no RSA, multiplicar dois primos enormes é " +
        "fácil; fatorar o produto, impraticável."
    },
    {
      term: "Encadeamento de blocos de cifra (CBC)",
      definition:
        "Modo de operação das cifras de bloco em que cada bloco de texto puro " +
        "passa por XOR com o bloco cifrado anterior antes de ser cifrado, " +
        "impedindo que trechos idênticos produzam saídas idênticas. Um vetor " +
        "de inicialização diferente por mensagem completa a proteção."
    },
    {
      term: "Cifra de fluxo",
      definition:
        "Algoritmo que cifra incrementalmente, aplicando XOR entre os dados e " +
        "um fluxo de chaves pseudoaleatório: adequado a voz e vídeo em tempo " +
        "real. Exige nunca repetir o fluxo de chaves: a violação dessa regra " +
        "foi um dos erros fatais do WEP."
    },
    {
      term: "Função de resumo segura (digest)",
      definition:
        "Função H(M) que produz um valor de comprimento fixo caracterizando o " +
        "documento: fácil de calcular, inviável de inverter e inviável de " +
        "colidir (achar M′ com o mesmo resumo). Exemplos: MD5 (128 bits), " +
        "SHA-1 (160 bits). É o que se assina, no lugar do documento."
    },
    {
      term: "Assinatura digital",
      definition:
        "Vínculo irreversível entre um segredo do signatário e os bits de um " +
        "documento: cifra-se o resumo H(M) com a chave privada; qualquer um " +
        "verifica com a pública. Garante autenticidade, impossibilidade de " +
        "falsificação e não repúdio."
    },
    {
      term: "Código de autenticação de mensagem (MAC)",
      definition:
        "Assinatura de baixo custo para canais que já compartilham um segredo " +
        "K: h = H(M + K). Não envolve criptografia (resumos são 3-10× mais " +
        "rápidos) e autentica a comunicação entre os dois portadores do " +
        "segredo: usado pelo TLS em cada bloco transmitido."
    },
    {
      term: "Certificado digital",
      definition:
        "Declaração assinada por um principal, por exemplo, vinculando um " +
        "nome a uma chave pública (formato X.509: sujeito, emitente, período " +
        "de validade). Verifica-se subindo a cadeia de assinaturas até uma " +
        "autoridade certificadora confiável; a expiração substitui a " +
        "revogação, que é impraticável."
    },
    {
      term: "Nonce",
      definition:
        "Valor usado uma única vez, incluído numa mensagem para demonstrar " +
        "que ela é nova (prova de frescor). Central nos protocolos de " +
        "desafio-resposta como Needham, Schroeder; o Kerberos usa carimbos de " +
        "tempo no mesmo papel: ao custo de exigir relógios sincronizados."
    },
    {
      term: "Capacidade (capability)",
      definition:
        "Chave de acesso infalsificável portada pelo cliente: identificador " +
        "do recurso + operações permitidas + assinatura. Prova imediata de " +
        "autorização e mecanismo natural de delegação; como a chave de uma " +
        "porta, sofre com roubo e é difícil de revogar."
    },
    {
      term: "Lista de controle de acesso (ACL)",
      definition:
        "Lista associada ao recurso com entradas <domínio, operações>: o " +
        "esquema dos bits de permissão do UNIX e do Windows. Alterações valem " +
        "imediatamente (revogação fácil), ao custo de autenticar o principal " +
        "e consultar a lista a cada requisição."
    }
  ],

  references: [
    "COULOURIS, G.; DOLLIMORE, J.; KINDBERG, T.; BLAIR, G. Sistemas Distribuídos: " +
    "Conceitos e Projeto. 5. ed. Porto Alegre: Bookman, 2013. Cap. 11. Segurança " +
    "(pp. 463-519).",
    "VAN STEEN, M.; TANENBAUM, A. S. Distributed Systems. 4. ed. (versão DS 4.03). " +
    "distributed-systems.net. Cap. 9. Security (leitura complementar: canais " +
    "seguros, autorização, gerenciamento de chaves e exemplos modernos).",
    "KSHEMKALYANI, A. D.; SINGHAL, M. Distributed Computing: Principles, " +
    "Algorithms, and Systems. Cambridge: Cambridge University Press, 2011. " +
    "Cap. 16. Authentication in distributed systems (leitura complementar: " +
    "protocolos de autenticação com chaves secretas e públicas)."
  ]
};
