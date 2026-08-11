/* ============================================================
   topic-09.js — Serviços de Nomes
   ------------------------------------------------------------
   Estrutura documentada no modelo topic-01.js (sections[] com
   slides[] opcionais, quiz[], glossary[], references[]).
   Conteúdo baseado em: COULOURIS et al., cap. 13 (pp. 565–594);
   VAN STEEN; TANENBAUM, 4. ed., cap. 6 (Naming) e MOCKAPETRIS,
   RFC 1034/1035 (leituras complementares).
   ============================================================ */

window.SD = window.SD || {};
SD.content = SD.content || {};

SD.content["09"] = {

  sections: [
    {
      title: "Nomes, atributos e espaços de nomes",
      html:
        "<p>No tópico anterior, um sistema de arquivos localizava um arquivo a " +
        "partir do seu nome. Generalize isso: em um sistema distribuído, " +
        "<strong>tudo</strong> tem nome: computadores, serviços, objetos " +
        "remotos, arquivos, usuários. A atribuição de nomes é um problema " +
        "fácil de desprezar e absolutamente fundamental: processos só " +
        "compartilham um recurso se conseguem <strong>nomeá-lo de forma " +
        "consistente</strong>, e pessoas só se comunicam pelo sistema se podem " +
        "dar nomes umas às outras (um endereço de e-mail, um <code>@usuario</code>). " +
        "Um <strong>serviço de nomes</strong> é um serviço distinto que, dado o " +
        "nome simbólico de um recurso, devolve seus <strong>atributos</strong>: " +
        "tipicamente, o endereço.</p>" +

        "<h3>Nome, identificador, endereço, atributo</h3>" +
        "<p>Vale separar quatro ideias que a linguagem do dia a dia mistura. Um " +
        "<strong>nome</strong> legível (um nome de arquivo, um URL, um nome de " +
        "domínio como <code>www.cdk5.net</code>) serve a humanos. Um " +
        "<strong>identificador</strong> é um nome interpretado só por programas, " +
        "escolhido pela eficiência com que se pesquisa e armazena (uma " +
        "referência de objeto remoto, um manipulador de arquivo NFS). Needham " +
        "distingue ainda o <strong>nome puro</strong>: um padrão de bits que " +
        "não diz <em>nada</em> sobre o objeto e <em>sempre</em> precisa ser " +
        "pesquisado: do nome que carrega informação, como a localização. No " +
        "extremo oposto está o <strong>endereço</strong>: um valor que aponta a " +
        "<em>localização</em> do objeto, não o objeto. Endereços são eficientes " +
        "para acessar, mas péssimos como identidade duradoura: o objeto pode " +
        "<strong>mudar de lugar</strong> (seu e-mail muda quando você troca de " +
        "provedor). Um <strong>atributo</strong> é o valor de uma propriedade " +
        "do objeto; resolver um nome é convertê-lo nos dados (atributos) do " +
        "recurso, e a associação nome↔atributos chama-se <strong>vínculo</strong> " +
        "(<em>binding</em>). O DNS, por exemplo, vincula um nome de domínio a " +
        "atributos de um computador: endereço IP, tipo da entrada e prazo de " +
        "validade. Repare que um endereço IP é, ele próprio, apenas outro nome a " +
        "ser resolvido: o ARP o converte em um endereço físico (MAC) na entrega " +
        "final.</p>" +

        "<h3>URI, URL, URN</h3>" +
        "<p>Os <strong>URIs</strong> (Uniform Resource Identifiers) nasceram da " +
        "necessidade de identificar recursos da Web de forma <em>uniforme</em>, " +
        "para que um mesmo software (o navegador) os processe. A sintaxe global " +
        "incorpora muitos <em>esquemas</em> (<code>http:</code>, " +
        "<code>mailto:</code>, <code>tel:</code>, <code>urn:</code>): dá para " +
        "inventar um esquema novo sem quebrar o software existente. Dentro do " +
        "guarda-chuva dos URIs há duas famílias: o <strong>URL</strong> (Locator) " +
        "traz informação de <em>localização</em> e método de acesso " +
        "(<code>http://www.cdk5.net/</code>): eficiente, mas sujeito a " +
        "<strong>links quebrados</strong> se o recurso se mover; e o " +
        "<strong>URN</strong> (Name) é um nome <em>puro</em> " +
        "(<code>urn:ISBN:0-201-62433-8</code>), que exige um serviço de " +
        "resolução para ser localizado. O debate 'bons URLs não mudam' × 'é " +
        "preciso nomes puros' segue aberto.</p>" +

        "<h3>Espaços de nomes: hierarquia e domínios</h3>" +
        "<p>O <strong>espaço de nomes</strong> é o conjunto de todos os nomes " +
        "válidos que um serviço reconhece: com uma definição sintática que " +
        "separa nome válido de inválido (<code>www.cdk99.net</code> é válido, " +
        "mesmo desvinculado; <code>...</code> não é). Espaços " +
        "<strong>hierárquicos</strong> (nomes de caminho, nomes de domínio) " +
        "vencem os planos por três motivos: cada parte do nome é resolvida em um " +
        "<strong>contexto</strong> pequeno e separado; o mesmo nome pode ter " +
        "significados diferentes em contextos diferentes (<code>/etc/passwd</code> " +
        "em dois computadores); e diferentes contextos podem ser " +
        "<strong>administrados por pessoas diferentes</strong>: a hierarquia é " +
        "potencialmente infinita. Um <strong>alias</strong> é um nome extra para " +
        "a mesma entidade (como um vínculo simbólico, um encurtador de URL, ou o " +
        "registro <code>CNAME</code> do DNS). E um <strong>domínio de atribuição " +
        "de nomes</strong> é um espaço de nomes sob uma única autoridade " +
        "administrativa, livre para <strong>delegar</strong> a subdomínios: " +
        "<code>dcs.qmul.ac.uk</code> foi combinado com quem gerencia " +
        "<code>qmul.ac.uk</code>, que foi aceito por <code>ac.uk</code>, e assim " +
        "por diante: cada um com seu <strong>servidor com autoridade</strong> " +
        "sobre sua parte do banco de dados.</p>",
      slides: [
        {
          title: "Por que nomes importam",
          html:
            "<ul>" +
            "<li>Em um sistema distribuído, <strong>tudo</strong> tem nome: " +
            "hosts, serviços, objetos, arquivos, usuários</li>" +
            "<li>Só se compartilha um recurso se é possível " +
            "<strong>nomeá-lo de forma consistente</strong></li>" +
            "<li><strong>Serviço de nomes</strong>: dado o nome, devolve os " +
            "atributos (o endereço)</li>" +
            "</ul>"
        },
        {
          title: "Nome × identificador × endereço",
          html:
            "<ul>" +
            "<li><strong>Nome</strong>: legível por humanos · " +
            "<strong>identificador</strong>: interpretado por programas</li>" +
            "<li><strong>Nome puro</strong>: só bits, sempre precisa ser " +
            "pesquisado</li>" +
            "<li><strong>Endereço</strong>: aponta a localização: eficiente, " +
            "mas ruim como identidade (objetos se movem)</li>" +
            "<li>Resolver = nome → atributos · <strong>vínculo</strong> = " +
            "nome↔atributos</li>" +
            "</ul>"
        },
        {
          title: "URI, URL, URN",
          html:
            "<ul>" +
            "<li><strong>URI</strong>: sintaxe uniforme com muitos esquemas " +
            "(http, mailto, tel, urn)</li>" +
            "<li><strong>URL</strong>: localização + acesso: eficiente, mas " +
            "gera <em>links quebrados</em></li>" +
            "<li><strong>URN</strong>: nome puro (urn:ISBN:…): precisa de " +
            "serviço de resolução</li>" +
            "</ul>"
        },
        {
          title: "Espaços de nomes e domínios",
          html:
            "<ul>" +
            "<li>Espaço de nomes: todos os nomes válidos (sintaxe define " +
            "válido × inválido)</li>" +
            "<li><strong>Hierarquia</strong>: contextos pequenos, delegáveis, " +
            "potencialmente infinita</li>" +
            "<li><strong>Alias</strong>: nome extra (CNAME, encurtador de URL)</li>" +
            "<li><strong>Domínio</strong>: autoridade única que delega a " +
            "subdomínios</li>" +
            "</ul>"
        }
      ]
    },

    {
      title: "Resolução de nomes e navegação",
      html:
        "<p>Resolver um nome hierárquico é um processo <strong>iterativo ou " +
        "recursivo</strong>: o nome é apresentado a um <strong>contexto</strong> " +
        "de atribuição de nomes que ou o mapeia direto em atributos, ou o mapeia " +
        "em um <em>novo contexto</em> mais um <em>nome derivado</em> a apresentar " +
        "a esse contexto, e o processo continua. É o que acontece com " +
        "<code>/etc/passwd</code>: <code>etc</code> é resolvido no contexto " +
        "<code>/</code>, e depois <code>passwd</code> no contexto " +
        "<code>/etc</code>. Aliases podem criar <strong>ciclos</strong> no " +
        "espaço de nomes (a resolução nunca terminaria); as defesas são abortar " +
        "após um número-limite de passos ou vetar aliases cíclicos.</p>" +

        "<h3>Por que um servidor só não basta</h3>" +
        "<p>Um serviço com um banco de dados enorme e muitos clientes " +
        "<strong>não pode</strong> guardar tudo em um servidor: seria um " +
        "<strong>gargalo</strong> e um <strong>ponto único de falha</strong>. A " +
        "saída é <strong>particionar</strong> os dados por domínio (cada " +
        "autoridade guarda sua parte) e <strong>replicar</strong> cada parte " +
        "(o DNS exige pelo menos dois servidores por subconjunto). Como nenhum " +
        "servidor responde tudo sozinho, entra em cena a " +
        "<strong>navegação</strong>: o processo de localizar os dados de " +
        "atribuição de nomes entre vários servidores. O software cliente que a " +
        "executa é o <strong>resolvedor</strong>.</p>" +

        "<h3>Três modelos de navegação</h3>" +
        "<p>Na <strong>navegação iterativa</strong> (a do DNS), o cliente " +
        "apresenta o nome ao servidor local; se ele resolve, devolve; se não, " +
        "<strong>sugere outro servidor</strong>, e o <em>próprio cliente</em> " +
        "repete a consulta ali: tantas vezes quantas forem necessárias. Na " +
        "<strong>navegação controlada pelo servidor</strong>, o servidor faz o " +
        "trabalho: na variante <em>não recursiva</em>, ele age como cliente " +
        "(iterando ou por multicast) junto aos pares; na <em>recursiva</em>, o " +
        "cliente fala com um único servidor, que contata um par com um prefixo " +
        "maior do nome, que contata outro, até resolver, e a resposta volta " +
        "pela cadeia. A recursiva é a única viável quando os domínios " +
        "administrativos <strong>escondem</strong> uns dos outros a disposição " +
        "de seus dados. Há ainda a <strong>navegação por multicast</strong>: o " +
        "cliente manda o nome a um grupo de servidores e só quem o tem responde " +
        "(com o inconveniente de o silêncio significar 'nome desvinculado', a " +
        "menos que um servidor seja designado para responder por eles).</p>" +

        "<h3>Cache: o que faz o serviço voar</h3>" +
        "<p>Resolvedores clientes e servidores mantêm em <strong>cache</strong> " +
        "os resultados de resoluções anteriores. O ganho é duplo: " +
        "<strong>desempenho</strong> (menos idas aos servidores) e " +
        "<strong>disponibilidade</strong>: a cache pode <em>eliminar do " +
        "caminho</em> os servidores de alto nível, o raiz em particular, deixando " +
        "a resolução prosseguir apesar de falhas. Funciona tão bem porque os " +
        "dados de nomes <strong>mudam raramente</strong> (um endereço fica " +
        "estável por meses ou anos). O preço é a possibilidade de devolver " +
        "atributos <strong>desatualizados</strong>: tema que o DNS resolve com " +
        "um prazo de validade por entrada, como veremos a seguir.</p>",
      slides: [
        {
          title: "Resolução por contextos",
          html:
            "<ul>" +
            "<li>Nome apresentado a um <strong>contexto</strong> que devolve " +
            "atributos OU novo contexto + nome derivado</li>" +
            "<li>Iterativo/recursivo: <code>/etc/passwd</code> → " +
            "<code>etc</code> em <code>/</code>, depois <code>passwd</code> em " +
            "<code>/etc</code></li>" +
            "<li>Aliases podem criar <strong>ciclos</strong> ⇒ limite de passos " +
            "ou veto</li>" +
            "</ul>"
        },
        {
          title: "Por que particionar e replicar",
          html:
            "<ul>" +
            "<li>Um servidor só = <strong>gargalo</strong> + ponto único de " +
            "falha</li>" +
            "<li><strong>Particionar</strong> por domínio + " +
            "<strong>replicar</strong> (DNS: ≥ 2 servidores por parte)</li>" +
            "<li><strong>Navegação</strong>: localizar os dados entre vários " +
            "servidores (feita pelo <strong>resolvedor</strong>)</li>" +
            "</ul>"
        },
        {
          title: "Três modelos de navegação",
          html:
            "<ul>" +
            "<li><strong>Iterativa</strong> (DNS): o servidor sugere outro; o " +
            "<em>cliente</em> repete</li>" +
            "<li><strong>Recursiva no servidor</strong>: a cadeia de servidores " +
            "resolve e a resposta volta: única viável entre domínios que se " +
            "escondem</li>" +
            "<li><strong>Multicast</strong>: só quem tem o nome responde " +
            "(silêncio = desvinculado)</li>" +
            "</ul>"
        },
        {
          title: "Cache: por que funciona",
          html:
            "<ul>" +
            "<li>Resolvedores e servidores guardam resultados anteriores</li>" +
            "<li>Ganho: desempenho + disponibilidade (tira o raiz do caminho)</li>" +
            "<li>Funciona porque nomes <strong>mudam raramente</strong></li>" +
            "<li>Risco: dados <strong>desatualizados</strong> ⇒ prazo de " +
            "validade (TTL)</li>" +
            "</ul>"
        }
      ]
    },

    {
      title: "Estudo de caso: o DNS",
      html:
        "<p>O <strong>Domain Name System</strong> (Mockapetris, RFC 1034/1035) " +
        "nomeia computadores (e servidores de e-mail) na Internet. Ele " +
        "substituiu o esquema original, em que <em>todos</em> os nomes e " +
        "endereços viviam em um único arquivo mestre baixado por FTP em cada " +
        "máquina. Aquele esquema tinha três defeitos fatais: não " +
        "<strong>escalava</strong>, não deixava as organizações administrarem " +
        "seus próprios nomes e servia apenas para endereços. O DNS resolve os " +
        "três com a receita da seção anterior: <strong>particionamento " +
        "hierárquico + replicação + cache</strong>.</p>" +

        "<h3>Nomes de domínio e consultas</h3>" +
        "<p>Os nomes de domínio são hierárquicos, com o nível mais alto à " +
        "<strong>direita</strong>. No topo, os <strong>domínios genéricos</strong> " +
        "(<code>com</code>, <code>edu</code>, <code>gov</code>, <code>net</code>, " +
        "<code>org</code>…, mais tarde <code>biz</code>, <code>mobi</code>…) e os " +
        "<strong>domínios de país</strong> (<code>br</code>, <code>uk</code>, " +
        "<code>fr</code>…), muitas vezes com subdomínios (<code>co.uk</code>, " +
        "<code>ac.uk</code>). O sufixo geográfico é <em>convencional</em>: " +
        "<code>doit.co.uk</code> pode se referir a um computador na Espanha. " +
        "Nomes DNS ignoram maiúsculas/minúsculas. As consultas mais comuns " +
        "pedem o <strong>endereço IP</strong> de um computador (para o navegador " +
        "então falar HTTP) e o <strong>servidor de correio</strong> de um " +
        "domínio; há também a <strong>resolução reversa</strong> (IP → nome, via " +
        "o domínio especial <code>in-addr.arpa</code>). Uma consulta é " +
        "especificada por nome + classe (<code>IN</code>, de Internet) + tipo.</p>" +

        "<h3>Servidores, zonas e prazos</h3>" +
        "<p>O banco de dados é distribuído numa rede lógica de servidores, cada " +
        "um guardando sobretudo dados do seu domínio local. Os dados são " +
        "divididos em <strong>zonas</strong>. Uma zona contém: os dados de um " +
        "domínio <em>menos</em> os subdomínios delegados; os nomes e endereços " +
        "de <strong>pelo menos dois servidores com autoridade</strong> sobre " +
        "ela; ponteiros para os servidores dos subdomínios delegados (com dados " +
        "'de cola', os IPs desses servidores); e parâmetros de gestão. Cada zona " +
        "é <strong>replicada</strong>: um servidor <strong>primário</strong> " +
        "(mestre) lê a zona de um arquivo local; os <strong>secundários</strong> " +
        "baixam a zona do primário e conferem a cópia uma ou duas vezes por dia. " +
        "Qualquer servidor pode guardar dados de outros em cache: respondendo " +
        "então como <strong>não autoridade</strong>, e cada entrada carrega um " +
        "<strong>tempo de vida</strong> (TTL): passado ele, o servidor volta a " +
        "consultar a autoridade. Atributos estáveis ganham TTL longo; os que " +
        "vão mudar logo, TTL curto.</p>" +

        "<h3>Servidores raiz e registros de recurso</h3>" +
        "<p>Todo servidor DNS conhece os endereços dos <strong>servidores " +
        "raiz</strong> (que mudam pouco). Os raiz têm autoridade sobre os " +
        "servidores dos domínios de topo, e, na prática, guardam entradas de " +
        "vários níveis para <strong>encurtar</strong> a navegação: um nome de " +
        "três componentes como <code>www.berkeley.edu</code> se resolve em, no " +
        "pior caso, <strong>dois passos</strong>. Os dados de zona vivem em " +
        "<strong>registros de recurso</strong>: <code>A</code> (IPv4) e " +
        "<code>AAAA</code> (IPv6) dão o endereço; <code>NS</code> aponta o " +
        "servidor com autoridade; <code>CNAME</code> define um alias; " +
        "<code>SOA</code> abre a zona; <code>MX</code> lista servidores de " +
        "correio com um valor de <strong>preferência</strong>; <code>PTR</code> " +
        "serve à resolução reversa. A implementação clássica no UNIX é o " +
        "<strong>BIND</strong> (biblioteca resolvedora + daemon <code>named</code>), " +
        "com servidores primário, secundário e <strong>só-cache</strong>. Um " +
        "truque comum de <strong>balanceamento</strong> é dar vários registros " +
        "<code>A</code> ao mesmo nome e devolvê-los em rodízio (com TTL curto, " +
        "para a cache não estragar o rodízio).</p>" +

        "<div class=\"callout\">" +
        "<p class=\"callout-title\">💡 O DNS aceita ficar inconsistente</p>" +
        "<p>De propósito. Se um dado muda, outros servidores podem entregar a " +
        "versão antiga por <strong>dias</strong>: o DNS não aplica nenhuma das " +
        "técnicas fortes de replicação (Tópico 10). A aposta é que nomes mudam " +
        "raramente e que a inconsistência só incomoda quando alguém tenta " +
        "<em>usar</em> um dado obsoleto. É a mesma troca das caches do Tópico 8, " +
        "agora em escala de Internet: abrir mão da consistência estrita em nome " +
        "da disponibilidade e da escala.</p>" +
        "</div>",
      slides: [
        {
          title: "DNS: o que resolve e por que escala",
          html:
            "<ul>" +
            "<li>Nomeia computadores e servidores de e-mail na Internet " +
            "(RFC 1034/1035)</li>" +
            "<li>Substituiu o arquivo mestre único (não escalava, sem admin " +
            "local, só endereços)</li>" +
            "<li>Receita: <strong>particionar + replicar + cache</strong></li>" +
            "</ul>"
        },
        {
          title: "Domínios e consultas",
          html:
            "<ul>" +
            "<li>Hierárquico, topo à <strong>direita</strong>: genéricos (com, " +
            "edu…) + país (br, uk…)</li>" +
            "<li>Sufixo geográfico é convencional; nomes ignoram " +
            "maiúsc./minúsc.</li>" +
            "<li>Consultas: IP do host, servidor de e-mail, reversa " +
            "(in-addr.arpa)</li>" +
            "<li>Consulta = nome + classe (IN) + tipo</li>" +
            "</ul>"
        },
        {
          title: "Zonas, primário e TTL",
          html:
            "<ul>" +
            "<li><strong>Zona</strong>: domínio menos subdomínios delegados + " +
            "ponteiros de cola</li>" +
            "<li>Replicada: <strong>primário</strong> (arquivo mestre) + " +
            "<strong>secundários</strong> (baixam, conferem 1-2×/dia)</li>" +
            "<li>Cache = resposta <strong>não autoridade</strong>, válida até o " +
            "<strong>TTL</strong></li>" +
            "</ul>"
        },
        {
          title: "Raiz e registros de recurso",
          html:
            "<ul>" +
            "<li>Todo servidor conhece a <strong>raiz</strong>; " +
            "<code>www.berkeley.edu</code> em ≤ 2 passos</li>" +
            "<li><code>A</code>/<code>AAAA</code> (IP), <code>NS</code>, " +
            "<code>CNAME</code>, <code>SOA</code>, <code>MX</code> " +
            "(preferência), <code>PTR</code></li>" +
            "<li><strong>BIND</strong>: resolvedor + <code>named</code>; " +
            "primário/secundário/só-cache</li>" +
            "<li>Balanceamento: vários <code>A</code> em rodízio (TTL curto)</li>" +
            "</ul>"
        },
        {
          title: "O DNS aceita inconsistência",
          html:
            "<ul>" +
            "<li>Dado alterado ⇒ versão antiga por <strong>dias</strong></li>" +
            "<li>Sem replicação forte (Tópico 10)</li>" +
            "<li>Só incomoda ao <em>usar</em> um dado obsoleto</li>" +
            "<li>Consistência × disponibilidade × escala: a troca de sempre</li>" +
            "</ul>"
        }
      ]
    },

    {
      title: "Serviços de diretório: X.500 e LDAP",
      html:
        "<p>Um serviço de nomes guarda pares <strong>&lt;nome, atributos&gt;</strong> " +
        "e pesquisa <em>atributos a partir do nome</em>. É natural pensar no " +
        "<strong>dual</strong>, e se o cliente <em>não</em> souber o nome, mas " +
        "conhecer alguns atributos? 'Qual é o nome do usuário com o telefone " +
        "020-555 9980?' 'Que computadores deste prédio rodam Mac OS X?' Um " +
        "serviço que armazena vínculos nome↔atributos e <strong>busca entradas " +
        "que casam com uma especificação de atributos</strong> é um " +
        "<strong>serviço de diretório</strong>: também chamado de atribuição de " +
        "nomes <strong>baseada em atributos</strong>. Na analogia da lista " +
        "telefônica, o serviço de nomes é <strong>páginas brancas</strong> " +
        "(nome → dados) e o de diretório, <strong>páginas amarelas</strong> " +
        "(descrição → quem atende). Exemplos: Active Directory (Microsoft), " +
        "X.500, LDAP, e o UDDI dos serviços Web.</p>" +

        "<h3>Descoberta e o poder dos atributos</h3>" +
        "<p>Um caso especial é o <strong>serviço de descoberta</strong>: um " +
        "diretório para dispositivos em <strong>redes espontâneas</strong>, que " +
        "entram e saem de forma imprevisível. A diferença é que o endereço de um " +
        "serviço de diretório costuma vir pré-configurado no cliente, enquanto " +
        "um aparelho que acaba de chegar à rede precisa recorrer a " +
        "<strong>multicast</strong> para achar o serviço de descoberta local. Os " +
        "atributos são <em>mais poderosos</em> que nomes como designadores: " +
        "dá para selecionar objetos por especificação precisa, sem conhecer " +
        "nomes, e sem <strong>expor a estrutura</strong> da organização ao " +
        "mundo. Ainda assim, a simplicidade dos nomes textuais faz com que " +
        "dificilmente sejam substituídos.</p>" +

        "<h3>X.500: a árvore de diretório</h3>" +
        "<p>O <strong>X.500</strong> (padrão ITU/ISO) é um serviço de diretório " +
        "de propósito geral. Os dados formam uma árvore de nós nomeados: a " +
        "<strong>DIT</strong> (Directory Information Tree), e a estrutura " +
        "inteira, com os dados, é a <strong>DIB</strong> (Directory Information " +
        "Base): uma base única e integrada, com partes em servidores espalhados. " +
        "Os servidores são <strong>DSAs</strong> (Directory Service Agents) e os " +
        "clientes, <strong>DUAs</strong> (Directory User Agents); o cliente fala " +
        "com <em>qualquer</em> DSA, que invoca outros ou o redireciona. Cada " +
        "<strong>entrada</strong> é um nome mais um conjunto de atributos, e " +
        "cada atributo tem um <strong>tipo</strong> e um ou mais valores " +
        "(sintaxe ASN.1). Como em orientação a objetos, um atributo " +
        "<code>objectClass</code> define a classe da entrada (com herança de " +
        "atributos obrigatórios e opcionais), e alguns atributos escolhidos " +
        "formam o <strong>DN</strong> (Distinguished Name), que fixa a posição " +
        "da entrada na DIT.</p>" +

        "<h3>Ler, buscar, e o LDAP</h3>" +
        "<p>O diretório é acessado de dois modos. <code>read</code> recebe o " +
        "nome (absoluto ou relativo) de uma entrada e a lista de atributos " +
        "desejados: o DSA navega a DIT até a entrada e devolve os atributos. " +
        "<code>search</code> é a consulta <strong>baseada em atributos</strong>: " +
        "recebe um <em>nó de base</em> e uma <strong>expressão de filtragem</strong> " +
        "(uma expressão booleana avaliada para cada nó abaixo da base) e devolve " +
        "os nomes de todas as entradas que a satisfazem, por exemplo, o nome de " +
        "todo funcionário na sala Z42 do Departamento de Ciência da Computação. " +
        "A busca pode ser <strong>cara</strong> em árvores grandes, então " +
        "aceita limites de abrangência, tempo e tamanho da resposta. Como o " +
        "X.500 completo pressupunha a pilha OSI e agentes pesados, criou-se o " +
        "<strong>LDAP</strong> (Lightweight Directory Access Protocol): os mesmos " +
        "conceitos, mas com clientes acessando o diretório <strong>direto sobre " +
        "TCP/IP</strong>, com operações mais simples. É o LDAP (e não o X.500 " +
        "completo) que está por trás do Active Directory e de boa parte da " +
        "autenticação corporativa de hoje.</p>" +

        "<div class=\"callout\">" +
        "<p class=\"callout-title\">💡 Nomear é meia batalha de todo sistema</p>" +
        "<p>Todo o middleware que você viu depende de nomear e localizar: o " +
        "vinculador da RMI (Tópico 5) mapeia nome → referência remota; a " +
        "montagem do NFS (Tópico 8) mapeia caminhos entre servidores; o TLS " +
        "(Tópico 7) valida certificados amarrados a nomes de domínio; e a " +
        "replicação (Tópico 10) precisa <em>nomear</em> as réplicas. Um serviço " +
        "de nomes bem projetado (hierárquico, particionado, replicado, com " +
        "cache) é o que deixa tudo isso escalar de uma LAN à Internet inteira.</p>" +
        "</div>",
      slides: [
        {
          title: "Diretório: busca por atributos",
          html:
            "<ul>" +
            "<li>Serviço de nomes: nome → atributos (<strong>páginas " +
            "brancas</strong>)</li>" +
            "<li>Serviço de diretório: atributos → entradas " +
            "(<strong>páginas amarelas</strong>)</li>" +
            "<li>'Quem tem o telefone X?' 'Que hosts rodam Mac OS X?'</li>" +
            "<li>Ex.: Active Directory, X.500, LDAP, UDDI</li>" +
            "</ul>"
        },
        {
          title: "Descoberta e atributos",
          html:
            "<ul>" +
            "<li><strong>Descoberta</strong>: diretório para redes espontâneas " +
            "(entram/saem)</li>" +
            "<li>Endereço do diretório pré-configurado × dispositivo novo usa " +
            "<strong>multicast</strong></li>" +
            "<li>Atributos: seleção precisa, sem expor a estrutura, mas nomes " +
            "vencem pela simplicidade</li>" +
            "</ul>"
        },
        {
          title: "X.500: DIT, DIB, DSA/DUA",
          html:
            "<ul>" +
            "<li><strong>DIT</strong> (árvore de nomes) + <strong>DIB</strong> " +
            "(estrutura + dados), particionada e replicada</li>" +
            "<li><strong>DSA</strong> (servidor) × <strong>DUA</strong> " +
            "(cliente); fala com qualquer DSA</li>" +
            "<li>Entrada = nome + atributos (tipo + valores); " +
            "<code>objectClass</code>, <strong>DN</strong></li>" +
            "</ul>"
        },
        {
          title: "read, search e LDAP",
          html:
            "<ul>" +
            "<li><code>read</code>: nome → atributos pedidos</li>" +
            "<li><code>search</code>: nó de base + <strong>filtro</strong> " +
            "booleano → entradas que casam (com limites)</li>" +
            "<li><strong>LDAP</strong>: X.500 direto sobre TCP/IP, mais " +
            "simples: base do Active Directory</li>" +
            "</ul>"
        }
      ]
    }
  ],

  quiz: [
    {
      question:
        "Needham distingue um “nome puro” de um endereço. Qual afirmação está " +
        "correta?",
      options: [
        "Um nome puro contém a localização do objeto, por isso não precisa ser resolvido.",
        "Um endereço identifica a localização e é eficiente para acesso, mas é ruim como identidade de longo prazo, porque os objetos podem mudar de lugar.",
        "Nome puro e endereço são a mesma coisa, apenas escritos de formas diferentes.",
        "Um endereço nunca precisa ser resolvido, enquanto o nome puro é resolvido pelo hardware."
      ],
      answer: 1,
      explanation:
        "O endereço aponta a localização (eficiente para acessar), mas o objeto " +
        "pode se mover: por isso não serve como identidade duradoura. O nome " +
        "puro é o oposto: só bits, sem informação embutida, e SEMPRE precisa ser " +
        "pesquisado. E um endereço muitas vezes é só mais um nome a resolver (o " +
        "IP ainda vira um MAC via ARP)."
    },
    {
      question:
        "Na navegação ITERATIVA usada pelo DNS, o que o servidor de nomes faz " +
        "quando não conhece o nome consultado?",
      options: [
        "Resolve o nome recursivamente contatando outros servidores e devolve só a resposta final ao cliente.",
        "Descarta a consulta e retorna um erro imediatamente.",
        "Sugere ao cliente outro servidor que pode ajudar, e o próprio cliente repete a consulta nesse servidor.",
        "Faz multicast do nome para todos os servidores da Internet e espera a primeira resposta."
      ],
      answer: 2,
      explanation:
        "Na navegação iterativa, o trabalho é do cliente: o servidor que não " +
        "tem o nome apenas indica outro servidor mais provável, e o cliente " +
        "refaz a consulta ali, repetindo até resolver. Devolver só a resposta " +
        "final (opção A) é a navegação recursiva controlada pelo servidor."
    },
    {
      question:
        "No DNS, os dados de atribuição de nomes são divididos em ZONAS. O que " +
        "a arquitetura do DNS exige de cada zona?",
      options: [
        "Que seja mantida em um único servidor mestre, sem cópias, para evitar inconsistência.",
        "Que seja replicada em pelo menos dois servidores com autoridade: um primário, que lê do arquivo mestre, e secundários, que baixam a zona do primário.",
        "Que todas as consultas a ela comecem obrigatoriamente em um servidor raiz.",
        "Que contenha o banco de dados inteiro da Internet, replicado em cache."
      ],
      answer: 1,
      explanation:
        "Para sobreviver à falha de um servidor, a arquitetura do DNS exige que " +
        "cada zona tenha pelo menos dois servidores com autoridade: um primário " +
        "(que lê a zona de um arquivo mestre local) e secundários (que baixam a " +
        "zona do primário e conferem periodicamente). Isso é replicação, não a " +
        "cópia única da opção A."
    },
    {
      question:
        "Um programa de e-mail precisa entregar uma mensagem para alguém em " +
        "dcs.rnx.ac.uk. Que tipo de registro DNS ele consulta, e o que recebe?",
      options: [
        "Um registro A, que devolve diretamente o endereço IP do destinatário da mensagem.",
        "Um registro PTR, que faz a resolução reversa do endereço em nome.",
        "Um registro CNAME, que devolve o nome canônico do usuário.",
        "Um registro MX, que devolve uma lista de servidores de correio que aceitam e-mail para o domínio, cada um com um valor de preferência."
      ],
      answer: 3,
      explanation:
        "Correio eletrônico usa registros MX (Mail eXchange): o DNS devolve os " +
        "nomes dos servidores de correio do domínio, cada um com um valor de " +
        "preferência que indica a ordem de tentativa. O registro A daria o IP de " +
        "um host qualquer, não necessariamente o servidor de e-mail; o PTR é " +
        "para resolução reversa."
    },
    {
      question:
        "Por que o uso de cache é tão eficaz no DNS, e qual é o seu risco?",
      options: [
        "É eficaz porque os dados de nomes mudam raramente; o risco é entregar dados desatualizados (obsoletos) até o tempo de vida (TTL) expirar.",
        "É eficaz porque cifra as respostas; o risco é o custo de decifrá-las a cada consulta.",
        "É eficaz porque elimina a hierarquia de domínios; o risco é criar ciclos de resolução.",
        "É eficaz porque obriga cada consulta a passar pelo servidor raiz; o risco é sobrecarregar a raiz."
      ],
      answer: 0,
      explanation:
        "A cache funciona porque os vínculos nome→endereço mudam muito pouco, " +
        "então respostas guardadas continuam válidas por bastante tempo, " +
        "aliviando os servidores (inclusive o raiz). O preço é a possível " +
        "entrega de dados obsoletos até que o TTL da entrada expire e a " +
        "autoridade seja consultada de novo."
    },
    {
      question:
        "Qual é a diferença essencial entre um serviço de NOMES (como o DNS) e " +
        "um serviço de DIRETÓRIO (como o X.500)?",
      options: [
        "O serviço de nomes é sempre hierárquico e o de diretório é sempre plano.",
        "O serviço de diretório só funciona em redes locais, enquanto o de nomes funciona na Internet.",
        "O serviço de nomes resolve um nome em atributos (“páginas brancas”), enquanto o de diretório faz o inverso: busca as entradas que casam com uma especificação de atributos (“páginas amarelas”).",
        "O serviço de nomes armazena atributos e o de diretório armazena apenas nomes."
      ],
      answer: 2,
      explanation:
        "O serviço de nomes vai do nome para os atributos (páginas brancas); o " +
        "de diretório faz o dual: recebe uma descrição por atributos e devolve " +
        "as entradas que a satisfazem (páginas amarelas / busca baseada em " +
        "atributos, como o search do X.500). Ambos podem ser hierárquicos e " +
        "ambos armazenam pares nome↔atributos."
    }
  ],

  glossary: [
    { term: "Serviço de nomes", definition: "Serviço que armazena vínculos entre nomes textuais e atributos das entidades que denotam, e cuja operação principal é resolver um nome: pesquisar seus atributos (tipicamente o endereço)." },
    { term: "Serviço de diretório", definition: "Serviço que busca entradas a partir de uma especificação de atributos (o dual do serviço de nomes); também chamado de atribuição de nomes baseada em atributos ou 'páginas amarelas'." },
    { term: "Nome puro", definition: "Padrão de bits que não carrega nenhuma informação sobre o objeto nomeado e, por isso, sempre precisa ser pesquisado (resolvido) antes de ser usado." },
    { term: "Endereço", definition: "Valor que identifica a localização de um objeto (não o objeto em si); eficiente para acessar, mas inadequado como identidade duradoura, pois objetos podem mudar de lugar." },
    { term: "Vínculo (binding)", definition: "Associação entre um nome e os atributos do objeto nomeado (em geral, os atributos, e não a implementação do objeto)." },
    { term: "Resolução de nomes", definition: "Processo iterativo ou recursivo de apresentar um nome a contextos de atribuição de nomes até obter os atributos a que ele se refere." },
    { term: "URI / URL / URN", definition: "URI: identificador uniforme com muitos esquemas. URL: URI que traz localização e método de acesso (sujeito a links quebrados). URN: URI usado como nome puro, que exige serviço de resolução." },
    { term: "Espaço de nomes", definition: "Conjunto de todos os nomes válidos reconhecidos por um serviço, com uma definição sintática que separa nomes válidos de inválidos (mesmo que desvinculados)." },
    { term: "Alias", definition: "Nome adicional para a mesma entidade, análogo a um vínculo simbólico; no DNS é o registro CNAME, e encurtadores de URL são um exemplo comum." },
    { term: "Domínio de atribuição de nomes", definition: "Espaço de nomes sob uma única autoridade administrativa, que controla quais nomes são vinculados e pode delegar essa responsabilidade a subdomínios." },
    { term: "Navegação", definition: "Processo de localizar dados de atribuição de nomes espalhados por vários servidores; pode ser iterativa (o cliente repete), recursiva (a cadeia de servidores resolve) ou por multicast." },
    { term: "Zona (DNS)", definition: "Parte do banco de dados DNS: os dados de um domínio menos os subdomínios delegados, mais ponteiros para os servidores desses subdomínios e parâmetros de gestão. Deve ser replicada em pelo menos dois servidores com autoridade." },
    { term: "Registro de recurso", definition: "Unidade de dados de zona no DNS: A/AAAA (endereço IPv4/IPv6), NS (servidor com autoridade), CNAME (alias), SOA (início da zona), MX (servidor de correio, com preferência), PTR (resolução reversa)." },
    { term: "Servidor primário e secundário", definition: "No DNS, o primário (mestre) lê a zona de um arquivo local; os secundários baixam a zona do primário e conferem periodicamente. Servidores só-cache não têm autoridade." },
    { term: "Tempo de vida (TTL)", definition: "Prazo de validade de uma entrada DNS em cache: passado ele, o servidor não autoridade volta a consultar a autoridade. Equilibra atualidade dos dados e tráfego de rede." },
    { term: "X.500 / LDAP", definition: "X.500 é um serviço de diretório padrão (árvore DIT, base DIB, servidores DSA, clientes DUA, operações read e search). LDAP é seu acesso leve sobre TCP/IP, base do Active Directory." }
  ],

  references: [
    "COULOURIS, G. et al. Sistemas Distribuídos: Conceitos e Projeto. 5. ed. Cap. 13. Serviço de Nomes (pp. 565-594).",
    "VAN STEEN, M.; TANENBAUM, A. S. Distributed Systems. 4. ed. Cap. 6. Naming (leitura complementar).",
    "MOCKAPETRIS, P. Domain Names. Concepts and Facilities. RFC 1034 (1987); RFC 1035: especificação do DNS citada pelo capítulo."
  ]
};
