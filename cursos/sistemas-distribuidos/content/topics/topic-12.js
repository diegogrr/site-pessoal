/* ============================================================
   topic-12.js — Computação Móvel e Ubíqua
   ------------------------------------------------------------
   Estrutura documentada no modelo topic-01.js (sections[] com
   slides[] opcionais, quiz[], glossary[], references[]).
   Conteúdo baseado em: COULOURIS et al., cap. 19 (pp. 817–871);
   HWANG; DONGARRA; FOX, cap. 9 (IoT) e WEISER, The Computer for
   the 21st Century (leituras complementares).
   ============================================================ */

window.SD = window.SD || {};
SD.content = SD.content || {};

SD.content["12"] = {

  sections: [
    {
      title: "Móvel, ubíqua e sistemas voláteis",
      html:
        "<p>Chegamos ao último tópico, e ao momento em que o sistema " +
        "distribuído sai da sala de servidores e <strong>entra no mundo " +
        "físico</strong>. Dois avanços tornaram isso possível: a " +
        "<strong>miniaturização</strong> dos dispositivos e a " +
        "<strong>conectividade sem fio</strong>. A <strong>computação " +
        "móvel</strong> explora a conexão de dispositivos portáteis que se " +
        "<em>movem</em> pelo mundo físico (o notebook, o smartphone, o PDA); a " +
        "<strong>computação ubíqua</strong> explora a <em>integração crescente</em> " +
        "dos dispositivos de computação com o nosso cotidiano: computação 'em " +
        "toda parte'. Há subáreas: a de <strong>mão</strong> (handheld), a " +
        "<strong>acoplada ao corpo</strong> (wearable, como o 'crachá ativo' que " +
        "anuncia sua identidade por infravermelho) e a de " +
        "<strong>reconhecimento de contexto</strong>.</p>" +

        "<h3>A visão de Weiser</h3>" +
        "<p>Mark Weiser cunhou o termo em 1988 e previu duas mudanças " +
        "revolucionárias. A primeira: <strong>uma pessoa, muitos " +
        "computadores</strong>: não vários computadores parecidos (um no " +
        "trabalho, um em casa), mas computadores que se multiplicam na " +
        "<em>forma e na função</em>, cada um para uma tarefa. A segunda: os " +
        "computadores <strong>'desapareceriam'</strong>, incorporados a " +
        "utensílios do dia a dia até se tornarem indistinguíveis, como já " +
        "acontece com os ~100 microprocessadores de um carro, em que ninguém " +
        "pensa como 'computadores'.</p>" +

        "<h3>Sistemas voláteis: a mudança é a regra</h3>" +
        "<p>Do ponto de vista dos sistemas distribuídos, não há diferença de " +
        "fundo entre móvel e ubíqua: ambas são <strong>sistemas voláteis</strong>. " +
        "Voláteis porque, ao contrário de quase tudo que vimos no curso, aqui a " +
        "<strong>mudança é a regra, não a exceção</strong>. As formas de " +
        "volatilidade incluem: <strong>falhas</strong> de dispositivos e " +
        "enlaces; <strong>mudanças</strong> nas características da comunicação, " +
        "como a largura de banda; e a criação e destruição de " +
        "<strong>associações</strong> (relacionamentos lógicos) entre " +
        "componentes. O P2P (Tópico 10) também é volátil, mas o que distingue os " +
        "sistemas móveis e ubíquos é exibirem <em>todas</em> essas formas, por " +
        "causa da integração com o mundo físico.</p>" +

        "<h3>Espaços inteligentes e o modelo de dispositivo</h3>" +
        "<p>Um <strong>espaço inteligente</strong> (smart space) é qualquer " +
        "local físico com serviços incorporados (uma sala, um prédio, um " +
        "veículo) onde os dispositivos visitam, aparecem, saem e falham. Os " +
        "dispositivos dessa nova classe têm restrições duras: " +
        "<strong>energia limitada</strong> (a comunicação sem fio é cara em " +
        "energia: até só <em>ouvir</em> a rede consome bateria; a descarga da " +
        "bateria é uma causa de falha) e <strong>recursos escassos</strong> " +
        "(processador, memória, banda), porque ser pequeno limita os " +
        "transistores. E têm dois braços para o mundo físico: " +
        "<strong>sensores</strong> (medem o mundo: luz, som, posição) e " +
        "<strong>controladores</strong> (agem sobre o mundo: motores, ar " +
        "condicionado).</p>",
      slides: [
        {
          title: "Móvel × ubíqua",
          html:
            "<ul>" +
            "<li>Miniaturização + sem-fio tiram o sistema da sala de servidores</li>" +
            "<li><strong>Móvel</strong>: dispositivos portáteis que se " +
            "<em>movem</em></li>" +
            "<li><strong>Ubíqua</strong>: computação integrada ao cotidiano ('em " +
            "toda parte')</li>" +
            "<li>Subáreas: de mão, wearable, reconhecimento de contexto</li>" +
            "</ul>"
        },
        {
          title: "A visão de Weiser (1988)",
          html:
            "<ul>" +
            "<li><strong>Uma pessoa, muitos computadores</strong>: multiplicam " +
            "na forma e função</li>" +
            "<li>Os computadores <strong>'desaparecem'</strong> nos objetos do " +
            "dia a dia</li>" +
            "<li>Ex.: ~100 microprocessadores num carro, invisíveis ao usuário</li>" +
            "</ul>"
        },
        {
          title: "Sistemas voláteis",
          html:
            "<ul>" +
            "<li>A <strong>mudança é a regra</strong>, não a exceção</li>" +
            "<li>Falhas de dispositivo/enlace · banda variável · " +
            "<strong>associações</strong> criadas e destruídas</li>" +
            "<li>Móvel/ubíqua exibem <em>todas</em> as formas (integração " +
            "física)</li>" +
            "</ul>"
        },
        {
          title: "Espaço inteligente e dispositivo",
          html:
            "<ul>" +
            "<li><strong>Espaço inteligente</strong>: local físico com serviços " +
            "incorporados</li>" +
            "<li><strong>Energia limitada</strong>: sem-fio é caro (até ouvir " +
            "gasta bateria)</li>" +
            "<li>Recursos escassos; <strong>sensores</strong> (medem) + " +
            "<strong>controladores</strong> (agem)</li>" +
            "</ul>"
        }
      ]
    },

    {
      title: "Associação, descoberta e interoperabilidade",
      html:
        "<p>Se dispositivos aparecem e desaparecem imprevisivelmente, como " +
        "fazem para <strong>interagir sem intervenção do usuário</strong>? São " +
        "dois passos. Primeiro, a <strong>inicialização na rede</strong>: obter " +
        "um endereço local: via um servidor <strong>DHCP</strong> (Tópico 3) ou, " +
        "sem infraestrutura, via configuração automática (o padrão " +
        "<em>Zeroconf</em> do IETF, implementado no Bonjour da Apple, ou o " +
        "endereço sem servidor do IPv6), tudo por <strong>broadcast/multicast</strong> " +
        "em um endereço conhecido. Segundo, a <strong>associação</strong>: ligar-se " +
        "aos serviços certos do espaço inteligente.</p>" +

        "<h3>O problema da associação e o princípio do limite</h3>" +
        "<p>Associar-se corretamente esbarra em dois aspectos: " +
        "<strong>escala</strong> (pode haver muitos dispositivos e serviços) e " +
        "<strong>abrangência</strong> (considerar <em>todos</em> os componentes " +
        "do espaço, e <em>só</em> eles: em vez dos trilhões de fora). Um " +
        "espaço inteligente tem limites territoriais e administrativos que " +
        "importam: ao procurar uma impressora no seu quarto de hotel, você quer " +
        "a do <em>seu</em> quarto, não a do vizinho. O <strong>princípio do " +
        "limite</strong> diz que os limites do sistema devem corresponder aos " +
        "espaços significativos assim definidos. É aqui que a descoberta por " +
        "<strong>multicast de sub-rede</strong> falha: o alcance da sub-rede " +
        "raramente coincide com o espaço físico: ela <em>viola</em> o princípio " +
        "do limite, o que motiva soluções de <strong>associação física</strong> " +
        "(por proximidade, toque ou leitura de um código).</p>" +

        "<h3>Serviços de descoberta</h3>" +
        "<p>O <strong>serviço de descoberta</strong> é um velho conhecido: um " +
        "<strong>serviço de diretório</strong> (Tópico 9), busca por " +
        "atributos, mas adaptado à volatilidade. Quatro diferenças: os dados de " +
        "diretório relevantes são definidos <strong>em tempo de execução</strong> " +
        "pelo contexto (o espaço onde a consulta ocorre); pode <em>não haver</em> " +
        "servidor de diretório na infraestrutura; os serviços podem " +
        "<strong>desaparecer</strong> sozinhos; e os protocolos precisam ser " +
        "<strong>sensíveis a energia e banda</strong>. Distingue-se descoberta " +
        "de <em>dispositivo</em> (achar quem está por perto) de descoberta de " +
        "<em>serviço</em> (achar quem oferece o atributo desejado). A interface " +
        "registra/desregistra serviços e permite consultá-los, mas a descoberta " +
        "sozinha não associa: falta a <strong>seleção</strong> (escolher um do " +
        "conjunto retornado). Exemplos: <strong>Jini</strong>, o UPnP (com o " +
        "SSDP), o SLP e a descoberta do <strong>Bluetooth</strong>. A " +
        "<strong>interoperabilidade</strong> completa o quadro: componentes que " +
        "se encontram pela primeira vez precisam concordar em dados e " +
        "protocolos.</p>",
      slides: [
        {
          title: "Dois passos para interagir",
          html:
            "<ul>" +
            "<li><strong>Inicialização na rede</strong>: endereço via DHCP ou " +
            "sem servidor (Zeroconf/Bonjour/IPv6)</li>" +
            "<li>Tudo por <strong>broadcast/multicast</strong> em endereço " +
            "conhecido</li>" +
            "<li><strong>Associação</strong>: ligar-se aos serviços certos do " +
            "espaço</li>" +
            "</ul>"
        },
        {
          title: "O problema da associação",
          html:
            "<ul>" +
            "<li><strong>Escala</strong>: muitos dispositivos e serviços</li>" +
            "<li><strong>Abrangência</strong>: só os do espaço, e todos eles</li>" +
            "<li>A impressora do <em>seu</em> quarto, não a do vizinho</li>" +
            "</ul>"
        },
        {
          title: "O princípio do limite",
          html:
            "<ul>" +
            "<li>Limites do sistema = espaços territoriais/administrativos " +
            "significativos</li>" +
            "<li>Multicast de sub-rede <strong>viola</strong> o limite (alcance " +
            "≠ espaço)</li>" +
            "<li>Motiva a <strong>associação física</strong> (proximidade, " +
            "toque, código)</li>" +
            "</ul>"
        },
        {
          title: "Serviço de descoberta",
          html:
            "<ul>" +
            "<li>Serviço de <strong>diretório</strong> (Tópico 9) adaptado à " +
            "volatilidade</li>" +
            "<li>Dados em tempo de execução · sem servidor fixo · serviços " +
            "somem · sensível a energia</li>" +
            "<li>Descoberta + <strong>seleção</strong> ⇒ associação " +
            "(Jini, UPnP, Bluetooth)</li>" +
            "</ul>"
        }
      ]
    },

    {
      title: "Contexto, sensores e adaptação",
      html:
        "<p>A outra marca dos sistemas voláteis é a <strong>integração com o " +
        "mundo físico</strong>. O <strong>contexto</strong> de uma entidade é " +
        "qualquer circunstância física relevante para o comportamento do " +
        "sistema: localização, hora, temperatura, identidade de quem opera, " +
        "presença de um objeto. Um sistema de <strong>reconhecimento de " +
        "contexto</strong> adapta seu comportamento automaticamente a essas " +
        "circunstâncias, como o celular que deveria <em>vibrar</em>, e não " +
        "tocar, quando você está no cinema (e note como é difícil <em>detectar</em> " +
        "que você está assistindo ao filme, e não parado no saguão).</p>" +

        "<h3>Sensores e o modelo de erro</h3>" +
        "<p>Tudo começa nos <strong>sensores</strong>, que medem valores " +
        "contextuais: GPS/acelerômetro/giroscópio (posição, movimento, " +
        "orientação), termômetro/sensor de luz/microfone (ambiente), " +
        "RFID/NFC/sensor de pressão/infravermelho (presença). O ponto crucial: " +
        "<strong>todo sensor tem um modelo de erro</strong>. O GPS não funciona " +
        "dentro de prédios, varia com os satélites e a ionosfera, e dá leituras " +
        "diferentes no mesmo lugar: por isso o erro se expressa como precisão " +
        "para uma proporção das medidas ('10 m em 90% dos casos') ou como um " +
        "<strong>valor de confiança</strong>. Salber identificou quatro desafios " +
        "das arquiteturas de sensoriamento: integrar sensores " +
        "<strong>idiossincráticos</strong>; <strong>abstrair</strong> os dados " +
        "(uma posição pode ser um par lat/long ou o texto 'Café do Joe'); " +
        "<strong>combinar</strong> várias fontes propensas a erro: a " +
        "<strong>fusão de sensores</strong>; e lidar com um contexto " +
        "<strong>dinâmico</strong> (responder a mudanças, com callbacks). O " +
        "<em>Context Toolkit</em> resolve isso com componentes reutilizáveis que " +
        "escondem a complexidade dos sensores, como os widgets de uma interface " +
        "gráfica.</p>" +

        "<h3>Adaptação: fazer muito com pouco</h3>" +
        "<p>Como os dispositivos são heterogêneos e as condições mudam em tempo " +
        "de execução, o software precisa <strong>adaptar-se</strong>. Há duas " +
        "frentes. A <strong>adaptação de conteúdo</strong>: transformar mídia " +
        "para caber no dispositivo, na banda e nas preferências do usuário " +
        "(<strong>transcodificação</strong>: reduzir resolução, jogar fora cor, " +
        "converter texto em fala). O modelo da Web manda fazer isso na " +
        "<strong>infraestrutura rica em recursos</strong>: no serviço ou num " +
        "<strong>proxy</strong>, não no cliente pobre; perfis " +
        "<strong>CC/PP</strong> descrevem os recursos do dispositivo. A " +
        "<strong>adaptação ao nível de recursos</strong>: o sistema " +
        "<strong>Odyssey</strong> deixa a aplicação ajustar a " +
        "<strong>fidelidade</strong> dentro de uma 'janela de tolerância': um " +
        "reprodutor de vídeo cai para preto e branco ou reduz a taxa de quadros " +
        "quando a banda despenca. E há o <strong>cyber foraging</strong>: um " +
        "dispositivo fraco <strong>descarrega</strong> um processamento pesado " +
        "(reconhecer fala, traduzir) num servidor de computação do espaço " +
        "inteligente: ganhando resposta <em>e</em> poupando bateria, desde que " +
        "o custo de energia da comunicação não supere o ganho, e que a aplicação " +
        "ainda funcione (mais devagar) se nenhum servidor estiver disponível.</p>",
      slides: [
        {
          title: "Contexto e reconhecimento",
          html:
            "<ul>" +
            "<li><strong>Contexto</strong>: circunstância física relevante " +
            "(local, hora, presença)</li>" +
            "<li>Sistema adapta o comportamento automaticamente</li>" +
            "<li>Ex.: o celular que vibra no cinema (difícil de <em>detectar</em>)</li>" +
            "</ul>"
        },
        {
          title: "Sensores e modelo de erro",
          html:
            "<ul>" +
            "<li>GPS, acelerômetro, RFID, pressão, luz, som…</li>" +
            "<li><strong>Todo sensor erra</strong>: precisão por proporção ou " +
            "valor de confiança</li>" +
            "<li>Quatro desafios; <strong>fusão de sensores</strong> combina " +
            "fontes propensas a erro</li>" +
            "<li>Context Toolkit esconde a complexidade (widgets)</li>" +
            "</ul>"
        },
        {
          title: "Adaptação de conteúdo",
          html:
            "<ul>" +
            "<li><strong>Transcodificação</strong>: reduzir resolução, cor, " +
            "texto→fala</li>" +
            "<li>Feita na <strong>infraestrutura/proxy</strong>, não no cliente " +
            "pobre</li>" +
            "<li>Perfis <strong>CC/PP</strong> descrevem o dispositivo</li>" +
            "</ul>"
        },
        {
          title: "Adaptação de recursos",
          html:
            "<ul>" +
            "<li><strong>Odyssey</strong>: ajusta a <strong>fidelidade</strong> " +
            "numa janela de tolerância</li>" +
            "<li><strong>Cyber foraging</strong>: descarrega processamento num " +
            "servidor do espaço</li>" +
            "<li>Ganha resposta + poupa bateria (se a comunicação compensar)</li>" +
            "</ul>"
        }
      ]
    },

    {
      title: "Segurança, privacidade e o caso Cooltown",
      html:
        "<p>Segurança em sistemas voláteis é especialmente difícil, e os " +
        "protocolos convencionais (Tópico 7) fazem suposições que aqui não " +
        "valem. Por três razões de <strong>hardware</strong>: os dispositivos " +
        "são <strong>facilmente roubados ou forjados</strong> (o projeto não " +
        "pode confiar na integridade de nenhum subconjunto deles); são " +
        "<strong>fracos demais</strong> para criptografia de chave pública: o " +
        "SPINS usa só chave simétrica, com chaves compartilhadas salto a salto; " +
        "e a <strong>energia</strong> vira alvo, com o 'ataque de privação do " +
        "sono', que drena a bateria fazendo o dispositivo receber ou processar " +
        "lixo. E há a <strong>operação desconectada</strong>: sem um servidor " +
        "online, não se pode <em>revogar</em> um certificado, só fazê-lo " +
        "expirar, o que levanta a questão de como um dispositivo offline mede " +
        "o tempo com segurança.</p>" +

        "<h3>Evidência física no lugar da criptográfica</h3>" +
        "<p>A espontaneidade cria compartilhamentos novos: um visitante imprime " +
        "num café; dois colegas trocam um documento entre celulares numa " +
        "conferência; uma enfermeira liga um monitor cardíaco sem fio ao " +
        "registro de um paciente. Nenhum se parece com a intranet atrás de um " +
        "firewall. A saída explora a <strong>integração física</strong>: usar " +
        "<strong>evidência física em vez de criptográfica</strong>. É o problema " +
        "da <strong>associação segura espontânea</strong> (transiente): criar um " +
        "canal seguro entre dois dispositivos que <em>não</em> compartilham " +
        "segredo, <em>não</em> têm a chave pública um do outro e <em>não</em> " +
        "têm um terceiro confiável: resistindo ao homem no meio no canal sem " +
        "fio, muitas vezes usando um gesto físico (aproximar, tocar, ler um " +
        "código) como prova.</p>" +

        "<h3>Estudo de caso: Cooltown</h3>" +
        "<p>O projeto <strong>Cooltown</strong> (HP) foi atrás da " +
        "<strong>computação nômade</strong> (usuários se movendo entre casa, " +
        "trabalho e lojas) aplicando as lições da Web. Sua máxima: " +
        "<strong>'tudo tem uma presença Web'</strong>. Cada entidade física: " +
        "<em>pessoa, lugar ou coisa</em>, eletrônica ou não: ganha um recurso " +
        "Web associado: uma rádio de Internet hospeda a própria página de " +
        "controle; um documento impresso aponta para seu original eletrônico; " +
        "uma pessoa publica uma home page com seu contexto atual. As presenças " +
        "de coisas e pessoas se agregam nas presenças dos lugares. Dois " +
        "mecanismos ligam o físico ao digital: os <strong>hyperlinks " +
        "físicos</strong> (uma etiqueta ou baliza que carrega o URL da presença " +
        "Web de uma entidade) e o <strong>eSquirt</strong> (um protocolo simples " +
        "para <em>'esguichar'</em> um URL de um dispositivo a outro, do seu " +
        "crachá para um projetor, por exemplo), tudo sem instalar software " +
        "novo, como na Web.</p>" +

        "<div class=\"callout\">" +
        "<p class=\"callout-title\">🎓 Onde o curso encontra o mundo físico</p>" +
        "<p>Este tópico fecha a trilha reunindo todos os anteriores no mundo " +
        "real: a descoberta reusa os <strong>serviços de nomes</strong> " +
        "(Tópico 9); a operação desconectada vem da <strong>replicação</strong> " +
        "(Tópico 10); a associação segura estende a <strong>segurança</strong> " +
        "(Tópico 7); e o cyber foraging descarrega no que hoje é a " +
        "<strong>nuvem</strong> (Tópico 11). A <strong>Internet das Coisas</strong> " +
        "é esta visão em escala planetária: bilhões de sensores e objetos " +
        "conversando com serviços na nuvem. E fechamos onde começamos: o Tópico " +
        "1 alertava contra a falácia 'a rede é confiável'; nos sistemas voláteis, " +
        "a <strong>volatilidade e a integração física deixam de ser exceção e " +
        "viram a regra</strong>: o horizonte para onde os sistemas distribuídos " +
        "seguem.</p>" +
        "</div>",
      slides: [
        {
          title: "Segurança em sistemas voláteis",
          html:
            "<ul>" +
            "<li>Dispositivos <strong>roubados/forjados</strong>: não confiar " +
            "em subconjunto algum</li>" +
            "<li>Fracos para chave pública ⇒ <strong>simétrica</strong> salto a " +
            "salto (SPINS)</li>" +
            "<li>Energia como alvo: <strong>privação do sono</strong></li>" +
            "<li>Offline: certificado <strong>expira</strong>, não se revoga</li>" +
            "</ul>"
        },
        {
          title: "Evidência física",
          html:
            "<ul>" +
            "<li>Novos compartilhamentos: imprimir no café, trocar documento, " +
            "monitor do paciente</li>" +
            "<li><strong>Associação segura espontânea</strong>: canal seguro sem " +
            "segredo/PKI/terceiro</li>" +
            "<li>Gesto físico (aproximar, tocar, ler código) contra o homem no " +
            "meio</li>" +
            "</ul>"
        },
        {
          title: "Cooltown: tudo tem presença Web",
          html:
            "<ul>" +
            "<li>Computação <strong>nômade</strong> com as lições da Web</li>" +
            "<li>Cada pessoa/lugar/coisa tem um <strong>recurso Web</strong> " +
            "associado</li>" +
            "<li><strong>Hyperlinks físicos</strong> (etiqueta/baliza com URL) + " +
            "<strong>eSquirt</strong> (trocar URL)</li>" +
            "</ul>"
        },
        {
          title: "Onde o curso encontra o mundo",
          html:
            "<ul>" +
            "<li>Reúne nomes (9), replicação (10), segurança (7), nuvem (11)</li>" +
            "<li><strong>IoT</strong> = esta visão em escala planetária</li>" +
            "<li>Volatilidade e integração física viram a <strong>regra</strong>" +
            ": fecha o arco do Tópico 1</li>" +
            "</ul>"
        }
      ]
    }
  ],

  quiz: [
    {
      question:
        "Qual é a distinção entre computação móvel e computação ubíqua?",
      options: [
        "São sinônimos: ambos os termos designam apenas o uso de smartphones.",
        "A móvel explora a conexão de dispositivos portáteis que se movem pelo mundo físico; a ubíqua explora a integração crescente dos dispositivos de computação com o mundo físico cotidiano (computação “em toda parte”).",
        "A móvel usa comunicação com fio e a ubíqua usa apenas comunicação sem fio.",
        "A móvel destina-se a empresas e a ubíqua, exclusivamente ao uso doméstico."
      ],
      answer: 1,
      explanation:
        "A computação móvel trata de dispositivos portáteis que se movem e " +
        "mantêm conectividade; a ubíqua trata da integração cada vez maior da " +
        "computação com o mundo físico cotidiano: a computação que se " +
        "multiplica em forma e função e se incorpora aos objetos (a visão de " +
        "Weiser). Não são sinônimos de 'smartphone'."
    },
    {
      question:
        "O que caracteriza um “sistema volátil”, conceito que unifica os " +
        "sistemas móveis e ubíquos do ponto de vista dos sistemas distribuídos?",
      options: [
        "É um sistema que funciona exclusivamente com baterias.",
        "É um sistema em que todos os dados trafegam criptografados de ponta a ponta.",
        "É um sistema em que a mudança é a regra, e não a exceção: dispositivos e enlaces falham, a largura de banda varia e as associações entre componentes são criadas e destruídas o tempo todo.",
        "É um sistema em que todos os dispositivos possuem o mesmo poder de processamento."
      ],
      answer: 2,
      explanation:
        "A volatilidade é a propriedade que unifica esses sistemas: falhas, " +
        "variação de banda e criação/destruição de associações são frequentes, " +
        "não excepcionais. Os sistemas móveis e ubíquos exibem todas essas " +
        "formas por causa de sua integração com o mundo físico."
    },
    {
      question:
        "O “princípio do limite” (boundary principle) diz respeito a quê nos " +
        "espaços inteligentes?",
      options: [
        "Os limites do sistema (o alcance da descoberta) devem corresponder aos espaços significativos territorial e administrativamente: a impressora do seu quarto de hotel, não a do vizinho; por isso a descoberta por multicast de sub-rede, cujo alcance não respeita esses limites, é problemática.",
        "Toda bateria de dispositivo deve ter um limite máximo de carga por questões de segurança.",
        "A rede sem fio jamais deve ultrapassar as paredes de um prédio, por lei.",
        "O número de sensores por usuário deve ser limitado a cem para não sobrecarregar a rede."
      ],
      answer: 0,
      explanation:
        "O princípio do limite exige que as fronteiras do sistema coincidam com " +
        "os espaços significativos (o quarto, a sala). A descoberta baseada em " +
        "multicast de sub-rede costuma violá-lo, pois o alcance da sub-rede não " +
        "casa com o espaço físico: daí a busca por associação física."
    },
    {
      question:
        "Um sistema de reconhecimento de contexto combina microfone, sensores " +
        "de pressão no piso e vídeo para detectar a presença de uma pessoa. Como " +
        "se chama essa técnica, e por que é necessária?",
      options: [
        "Transcodificação; serve para adaptar o conteúdo ao tamanho da tela do dispositivo.",
        "Cyber foraging; serve para descarregar o processamento pesado em um servidor.",
        "Handover; serve para manter a conectividade quando o usuário troca de estação-base.",
        "Fusão de sensores; porque todo sensor tem um modelo de erro, e combinar várias fontes propensas a erro torna a percepção do fenômeno mais confiável."
      ],
      answer: 3,
      explanation:
        "Combinar leituras de vários sensores para reduzir o erro de cada um é " +
        "a fusão de sensores. Como todo sensor produz valores com incerteza (o " +
        "microfone confunde ruídos, a pressão não distingue pisadas), juntá-los " +
        "aumenta a confiabilidade da percepção."
    },
    {
      question:
        "Segundo o modelo da Web para adaptação de conteúdo a dispositivos " +
        "pobres em recursos, onde a adaptação (transcodificação) deve ocorrer?",
      options: [
        "No próprio dispositivo cliente, que conhece melhor suas limitações de tela e energia.",
        "Na infraestrutura rica em recursos (no próprio serviço ou em um proxy) e não no cliente sem recursos; por exemplo, um proxy comprime imagens de forma específica ao tipo antes de enviá-las.",
        "Em lugar nenhum: o mesmo conteúdo, no mesmo formato, é sempre enviado a todos os dispositivos.",
        "Exclusivamente em uma nuvem pública, nunca em uma infraestrutura local do espaço inteligente."
      ],
      answer: 1,
      explanation:
        "O cliente é justamente o que tem menos recursos; por isso a adaptação " +
        "pesada (transcodificação, compactação específica ao tipo) é feita na " +
        "infraestrutura (no serviço ou num proxy), que tem processamento de " +
        "sobra. Perfis CC/PP informam ao servidor as capacidades do dispositivo."
    },
    {
      question:
        "Por que a segurança em sistemas voláteis costuma recorrer a “evidência " +
        "física” em vez de apenas evidência criptográfica?",
      options: [
        "Porque a criptografia é ilegal na maioria dos países onde há dispositivos móveis.",
        "Porque imprimir uma etiqueta física é mais barato do que emitir um certificado digital.",
        "Porque os dispositivos podem ser fracos demais para chave pública, são facilmente roubados/forjados e frequentemente estão offline (sem terceiro confiável), e a integração física permite, por exemplo, a associação segura espontânea usando o próprio canal físico contra o homem no meio.",
        "Porque os usuários de dispositivos móveis sempre preferem senhas curtas a certificados."
      ],
      answer: 2,
      explanation:
        "As suposições dos protocolos convencionais falham: dispositivos " +
        "fracos, roubáveis e muitas vezes offline, sem terceiro confiável " +
        "acessível. Por isso essas técnicas exploram a integração física: um " +
        "gesto de aproximar, tocar ou ler um código serve de evidência para " +
        "estabelecer um canal seguro resistente ao homem no meio."
    }
  ],

  glossary: [
    { term: "Computação móvel", definition: "Área que explora a conexão de dispositivos portáteis (notebooks, smartphones, PDAs) que se movem pelo mundo físico mantendo conectividade sem fio." },
    { term: "Computação ubíqua (pervasiva)", definition: "Área que explora a integração crescente dos dispositivos de computação com o mundo físico cotidiano: a computação 'em toda parte', na visão de Weiser (1988)." },
    { term: "Computação acoplada ao corpo (wearable)", definition: "Dispositivos vestidos ou presos ao corpo (relógios, óculos, o 'crachá ativo') que muitas vezes funcionam sem o usuário manipulá-los." },
    { term: "Reconhecimento de contexto (context-aware)", definition: "Capacidade de um sistema adaptar seu comportamento automaticamente às circunstâncias físicas percebidas (localização, presença, hora)." },
    { term: "Sistema volátil", definition: "Sistema em que a mudança é a regra, não a exceção: falhas de dispositivos/enlaces, variação de banda e criação/destruição de associações entre componentes." },
    { term: "Espaço inteligente (smart space)", definition: "Qualquer local físico com serviços incorporados (uma sala, prédio ou veículo) no qual dispositivos aparecem, saem e falham dinamicamente." },
    { term: "Associação", definition: "Ato de um componente volátil ligar-se aos serviços apropriados de um espaço inteligente, após inicializar-se na rede; deve tratar de escala e abrangência." },
    { term: "Princípio do limite", definition: "Princípio segundo o qual as fronteiras do sistema devem corresponder aos espaços significativos territorial e administrativamente; a descoberta por multicast de sub-rede costuma violá-lo." },
    { term: "Serviço de descoberta", definition: "Serviço de diretório (busca por atributos) adaptado à volatilidade: dados definidos em tempo de execução, sem servidor fixo, com serviços que somem e protocolos sensíveis a energia (ex.: Jini, UPnP, Bluetooth)." },
    { term: "Contexto", definition: "Qualquer aspecto das circunstâncias físicas de uma entidade relevante para o comportamento do sistema: localização, hora, temperatura, identidade, presença." },
    { term: "Sensor e modelo de erro", definition: "Dispositivo que mede um valor contextual; como todo sensor produz valores com incerteza, seu erro se expressa por precisão para uma proporção de medidas ou por um valor de confiança." },
    { term: "Fusão de sensores", definition: "Combinação de leituras de várias fontes propensas a erro para tornar a percepção de um fenômeno mais confiável (ex.: microfone + pressão no piso + vídeo para detectar presença)." },
    { term: "Adaptação de conteúdo (transcodificação)", definition: "Transformação de mídia para caber no dispositivo, na banda e nas preferências do usuário; feita na infraestrutura rica em recursos (serviço ou proxy), não no cliente pobre." },
    { term: "Cyber foraging", definition: "Estratégia em que um dispositivo com poucos recursos descobre um servidor de computação no espaço inteligente e descarrega nele um processamento pesado, ganhando resposta e poupando bateria." },
    { term: "Associação segura espontânea", definition: "Problema de criar um canal seguro entre dois dispositivos que não compartilham segredo, não têm a chave pública um do outro nem um terceiro confiável, resistindo ao homem no meio: muitas vezes com apoio de um gesto físico." },
    { term: "Presença Web (Cooltown)", definition: "Recurso Web associado a cada entidade física (pessoa, lugar ou coisa) na arquitetura Cooltown, cuja máxima é 'tudo tem uma presença Web'; ligada ao físico por hyperlinks físicos e pelo protocolo eSquirt." }
  ],

  references: [
    "COULOURIS, G. et al. Sistemas Distribuídos: Conceitos e Projeto. 5. ed. Cap. 19. Computação Móvel e Ubíqua (pp. 817-871).",
    "HWANG, K.; DONGARRA, J.; FOX, G. C. Distributed and Cloud Computing. Cap. 9. Ubiquitous Clouds and the Internet of Things (IoT; leitura complementar).",
    "WEISER, M. The Computer for the 21st Century. Scientific American, v. 265, n. 3, 1991 (a visão fundadora da computação ubíqua)."
  ]
};
