/* ============================================================
   topic-11.js — Computação em Nuvem
   ------------------------------------------------------------
   Estrutura documentada no modelo topic-01.js (sections[] com
   slides[] opcionais, quiz[], glossary[], references[]).
   Conteúdo baseado em: HWANG; DONGARRA; FOX, Distributed and
   Cloud Computing, cap. 4 (pp. 191–261); HWANG et al., cap. 6 e
   COULOURIS et al., cap. 21 (leituras complementares).
   ============================================================ */

window.SD = window.SD || {};
SD.content = SD.content || {};

SD.content["11"] = {

  sections: [
    {
      title: "O que é computação em nuvem",
      html:
        "<p>No Tópico 6 vimos a virtualização empacotar serviços em máquinas " +
        "virtuais e contêineres. A <strong>computação em nuvem</strong> é essa " +
        "sala de máquinas levada à escala de <strong>data centers</strong> e " +
        "<em>alugada por hora</em>. Ela herda de três avós: a computação em " +
        "<strong>cluster</strong> (muitos computadores em paralelo), em " +
        "<strong>grade</strong> (grid, compartilhar recursos entre organizações) " +
        "e <strong>utilitária</strong> (utility, pagar pelo uso, como luz e " +
        "água), e as combina: a infraestrutura entrega um grande número de " +
        "serviços a usuários finais, sob demanda, de qualquer lugar, por " +
        "dispositivos conectados.</p>" +

        "<p>A ideia central inverte o fluxo tradicional: em vez de copiar os " +
        "dados para milhões de desktops, <strong>manda-se a computação para " +
        "onde os dados estão</strong>: evitando movimentar grandes volumes e " +
        "usando melhor a banda da rede. E ela liberta as empresas de TI da " +
        "tarefa de baixo nível de montar servidores e administrar o software de " +
        "sistema: os recursos (hardware, software, dados) são reunidos como uma " +
        "<strong>plataforma virtual com recursos elásticos</strong>, provisionados " +
        "sob demanda.</p>" +

        "<h3>A virada econômica: pagar pelo uso</h3>" +
        "<p>Este é o coração da nuvem. Na TI tradicional, você faz um " +
        "<strong>investimento de capital</strong> (compra servidores) que domina " +
        "o custo e <em>fica obsoleto a cada ~18 meses</em>, e ainda arca com " +
        "custos operacionais crescentes. Na nuvem, o modelo é " +
        "<strong>pay-as-you-go</strong>: sem custo inicial de hardware, você " +
        "aluga os recursos e paga <em>só a fase de execução</em>. A IBM estimou " +
        "economia de <strong>80% a 95%</strong> frente ao modelo convencional, " +
        "especialmente atraente para <em>startups</em> e pequenos usuários, que " +
        "deixam de comprar equipamento caro que envelhece.</p>" +

        "<h3>Seis objetivos de projeto</h3>" +
        "<p>A comunidade convergiu para seis metas que tornam a nuvem " +
        "aceitável: <strong>(1)</strong> deslocar a computação do desktop para " +
        "os data centers; <strong>(2)</strong> provisionar serviços com " +
        "<strong>economia de nuvem</strong>: SLAs e preço por uso; " +
        "<strong>(3)</strong> <strong>escalar</strong> o desempenho conforme " +
        "crescem os usuários; <strong>(4)</strong> proteger a " +
        "<strong>privacidade</strong> dos dados; <strong>(5)</strong> garantir " +
        "<strong>QoS</strong> padronizada e interoperável; <strong>(6)</strong> " +
        "criar <strong>padrões e APIs</strong> abertas, resolvendo o " +
        "aprisionamento de dados. Um <strong>SLA</strong> (acordo de nível de " +
        "serviço) é o contrato que amarra disponibilidade, desempenho e proteção " +
        "de dados entre provedor e usuário.</p>" +

        "<div class=\"callout\">" +
        "<p class=\"callout-title\">💡 Nuvem = sistemas distribuídos por virtualização</p>" +
        "<p>Há quem chame a nuvem de 'computação centralizada em data centers' e " +
        "quem a chame de 'computação distribuída sobre os recursos do data " +
        "center'. As duas visões cabem: toda computação na nuvem é " +
        "<strong>distribuída para servidores</strong>, que são, na verdade, " +
        "<strong>máquinas virtuais em clusters virtuais</strong> criados a partir " +
        "dos recursos do data center. A nuvem é, literalmente, um sistema " +
        "distribuído construído <em>por virtualização</em> (Tópico 6), " +
        "geograficamente espalhado por tolerância a falhas, latência e razões " +
        "legais.</p>" +
        "</div>",
      slides: [
        {
          title: "De cluster/grade/utilitária à nuvem",
          html:
            "<ul>" +
            "<li><strong>Cluster</strong> (paralelo) + <strong>grade</strong> " +
            "(compartilhar) + <strong>utilitária</strong> (pagar pelo uso)</li>" +
            "<li>Serviços sob demanda, de qualquer lugar, por dispositivos " +
            "conectados</li>" +
            "<li>Manda a <strong>computação para os dados</strong>, não o " +
            "contrário</li>" +
            "<li>Recursos <strong>elásticos</strong> provisionados sob demanda</li>" +
            "</ul>"
        },
        {
          title: "A virada econômica: pay-as-you-go",
          html:
            "<ul>" +
            "<li>TI tradicional: <strong>capital</strong> antecipado, obsoleto a " +
            "cada ~18 meses</li>" +
            "<li>Nuvem: <strong>pay-as-you-go</strong>, sem custo inicial, paga " +
            "só a execução</li>" +
            "<li>Economia estimada de <strong>80-95%</strong> (IBM)</li>" +
            "<li>Ideal para startups e pequenos usuários</li>" +
            "</ul>"
        },
        {
          title: "Seis objetivos de projeto",
          html:
            "<ul>" +
            "<li>Desktop → data center · provisionar com <strong>economia</strong> " +
            "(SLA, preço por uso)</li>" +
            "<li><strong>Escalar</strong> o desempenho · proteger a " +
            "<strong>privacidade</strong></li>" +
            "<li><strong>QoS</strong> padronizada · <strong>APIs</strong> abertas " +
            "(fim do lock-in)</li>" +
            "<li><strong>SLA</strong> amarra disponibilidade × desempenho × dados</li>" +
            "</ul>"
        },
        {
          title: "Nuvem = distribuído por virtualização",
          html:
            "<ul>" +
            "<li>Toda computação vai para servidores = <strong>VMs em clusters " +
            "virtuais</strong></li>" +
            "<li>É a sala de máquinas do Tópico 6 em escala de data center</li>" +
            "<li>Espalhada geograficamente: tolerância a falhas, latência, " +
            "razões legais</li>" +
            "</ul>"
        }
      ]
    },

    {
      title: "Modelos de serviço e de implantação",
      html:
        "<p>A nuvem entrega infraestrutura, plataforma e software " +
        "<em>como serviço</em>, em três <strong>modelos</strong> que são os " +
        "pilares sobre os quais tudo é oferecido, e que se empilham em " +
        "<strong>camadas</strong>, cada uma servindo de base para a de cima.</p>" +

        "<h3>IaaS, PaaS, SaaS: os três pilares</h3>" +
        "<ul>" +
        "<li><strong>IaaS</strong> (infraestrutura como serviço): a base. Você " +
        "aluga <strong>compute, armazenamento e rede virtualizados</strong> e " +
        "roda suas aplicações sobre o SO que escolher. O provedor gerencia a " +
        "infraestrutura; <em>você</em> controla o SO, o armazenamento e as " +
        "aplicações. Exemplo: <strong>Amazon EC2</strong> (instâncias de VM) + " +
        "<strong>S3</strong> (armazenamento).</li>" +
        "<li><strong>PaaS</strong> (plataforma como serviço): o meio. O provedor " +
        "entrega um <strong>ambiente de desenvolvimento e execução</strong> (SO " +
        "+ bibliotecas de runtime) e você só desenvolve e implanta o " +
        "<em>código</em>, em linguagens suportadas (Java, Python, .NET), sem " +
        "gerenciar a infraestrutura. Exemplos: <strong>Google App Engine</strong>, " +
        "<strong>Microsoft Azure</strong>.</li>" +
        "<li><strong>SaaS</strong> (software como serviço): o topo. Aplicações " +
        "prontas, <strong>acessadas pelo navegador</strong>, sem investir em " +
        "servidores nem licenças. Exemplos: <strong>Gmail</strong>, Google Docs, " +
        "<strong>Salesforce</strong> (CRM), SharePoint.</li>" +
        "</ul>" +
        "<p>A dependência é de baixo para cima: <strong>SaaS roda sobre PaaS, que " +
        "roda sobre IaaS</strong>. E o esforço do provedor cresce na mesma " +
        "direção: no <strong>SaaS</strong> ele gerencia quase tudo (hardware + " +
        "plataforma + aplicação); no <strong>IaaS</strong>, o mínimo (só a " +
        "infraestrutura virtual). Quanto mais alto o pilar, menos você gerencia, " +
        "e menos controle tem.</p>" +

        "<h3>Público, privado, híbrido</h3>" +
        "<p>Quanto à <strong>implantação</strong>, uma nuvem pode ser: " +
        "<strong>pública</strong>: construída sobre a Internet, acessível por " +
        "assinatura a qualquer pagante (GAE, AWS, Azure); promove padronização e " +
        "evita investimento de capital. <strong>Privada</strong>: dentro da " +
        "intranet de uma única organização, dona e gestora da infraestrutura; " +
        "oferece mais <em>customização, controle, segurança e privacidade</em> " +
        "(ex.: a nuvem do CERN para milhares de cientistas). " +
        "<strong>Híbrida</strong>: combina as duas: mantém o sensível na " +
        "privada e <strong>transborda</strong> picos de carga para a pública " +
        "(o chamado <em>surge computing</em> ou <em>cloud bursting</em>). Os " +
        "autores preveem que a maioria das nuvens futuras será híbrida.</p>" +

        "<div class=\"callout\">" +
        "<p class=\"callout-title\">💡 Quem gerencia o quê</p>" +
        "<p>Pense num gradiente. No <strong>IaaS</strong> você recebe uma VM " +
        "'crua' e ainda instala e atualiza o SO, como alugar um terreno e " +
        "construir. No <strong>PaaS</strong>, o terreno já vem com fundação e " +
        "encanamento: você só sobe o seu código. No <strong>SaaS</strong>, você " +
        "apenas <em>entra</em> e usa (abre o Gmail): não gerencia nada. Mais " +
        "conveniência de um lado; mais controle e responsabilidade do outro.</p>" +
        "</div>",
      slides: [
        {
          title: "Os três pilares",
          html:
            "<ul>" +
            "<li><strong>IaaS</strong>: compute/armazenamento/rede virtuais: " +
            "você controla o SO (EC2 + S3)</li>" +
            "<li><strong>PaaS</strong>: ambiente de dev/execução: você só sobe " +
            "o código (GAE, Azure)</li>" +
            "<li><strong>SaaS</strong>: app pronto no navegador (Gmail, " +
            "Salesforce)</li>" +
            "</ul>"
        },
        {
          title: "Camadas e esforço do provedor",
          html:
            "<ul>" +
            "<li><strong>SaaS sobre PaaS sobre IaaS</strong>: dependência de " +
            "baixo para cima</li>" +
            "<li>Esforço do provedor: <strong>SaaS mais</strong>, IaaS menos</li>" +
            "<li>Quanto mais alto o pilar, <strong>menos você gerencia</strong> " +
            "(e menos controla)</li>" +
            "</ul>"
        },
        {
          title: "Público × privado × híbrido",
          html:
            "<ul>" +
            "<li><strong>Pública</strong>: Internet, assinatura, padronização, " +
            "sem capital</li>" +
            "<li><strong>Privada</strong>: intranet de uma org: controle, " +
            "segurança, customização</li>" +
            "<li><strong>Híbrida</strong>: sensível na privada + " +
            "<strong>transbordo</strong> à pública (cloud bursting)</li>" +
            "</ul>"
        },
        {
          title: "Quem gerencia o quê",
          html:
            "<ul>" +
            "<li><strong>IaaS</strong>: alugar terreno e construir (você patcha " +
            "o SO)</li>" +
            "<li><strong>PaaS</strong>: terreno com fundação: sobe o código</li>" +
            "<li><strong>SaaS</strong>: só entrar e usar: não gerencia nada</li>" +
            "<li>Conveniência × controle e responsabilidade</li>" +
            "</ul>"
        }
      ]
    },

    {
      title: "Recursos: data centers, virtualização e elasticidade",
      html:
        "<p>De onde vêm os recursos que a nuvem aluga? De <strong>data " +
        "centers</strong> em <strong>escala de galpão</strong> (warehouse-scale), " +
        "com de milhares a milhões de servidores: a Microsoft tem um data " +
        "center em Chicago com <strong>100.000 servidores de 8 núcleos em 50 " +
        "contêineres</strong>. Ao contrário dos supercomputadores (redes " +
        "sob medida, fat-tree), o data center usa <strong>rede IP de " +
        "prateleira</strong> (Ethernet de 10 Gbps), em camadas: racks de " +
        "servidores embaixo (camada 2), ligados por switches rápidos, e roteadores " +
        "de acesso e de borda conectando à Internet (camada 3), com balanceadores " +
        "de carga. Escalar é o requisito fundamental.</p>" +

        "<h3>A virtualização é o motor</h3>" +
        "<p>Nada disso vira nuvem sem virtualização. As VMs em clusters virtuais " +
        "trazem quatro ganhos decisivos: <strong>consolidam</strong> cargas de " +
        "servidores subutilizados em menos máquinas; rodam <strong>código " +
        "legado</strong> sem interferir em outras APIs; criam " +
        "<strong>sandboxes</strong> para isolar aplicações de confiabilidade " +
        "duvidosa (segurança); e dão <strong>isolamento de desempenho</strong>, " +
        "permitindo ao provedor oferecer garantias de QoS. A consolidação também " +
        "corta o consumo de energia (<strong>data centers verdes</strong>): a " +
        "TI já passou de 3% da energia dos EUA.</p>" +

        "<h3>Virtualização e recuperação de desastres</h3>" +
        "<p>A VM encapsula uma máquina inteira num arquivo, e isso transforma a " +
        "<strong>recuperação de desastres</strong>. Recuperar uma máquina física " +
        "por outra é lento (configurar hardware, instalar e configurar o SO, os " +
        "agentes de backup, reiniciar). Recuperar uma VM por outra elimina as " +
        "etapas de SO e agentes: cai para cerca de <strong>40%</strong> do tempo. " +
        "A técnica é o <strong>clone de VM</strong>: para cada VM ativa, um clone " +
        "<em>suspenso</em> num servidor remoto; se a original falha, o centro de " +
        "controle ativa o clone por <strong>migração a quente</strong>, enviando " +
        "só o estado modificado. Quantos <em>snapshots</em> se tira determina o " +
        "RPO (quanto dado se pode perder) e o RTO (quão rápido se recupera).</p>" +

        "<h3>Elasticidade: o recurso central</h3>" +
        "<p>Se há uma palavra que resume o valor da nuvem, é " +
        "<strong>elasticidade</strong>: crescer e encolher os recursos conforme " +
        "a carga. O contraste esclarece: sem elasticidade, o provisionamento é " +
        "<strong>estático</strong> e desperdiça. <strong>Superprovisionar</strong> " +
        "para o pico deixa uma montanha de capacidade ociosa nos vales; " +
        "<strong>subprovisionar</strong> perde a demanda paga que passa do teto " +
        "(e ainda desperdiça o que fica abaixo dele). A nuvem resolve com " +
        "<strong>auto-scaling</strong>, em três sabores: " +
        "<strong>por demanda</strong> (adiciona/remove instâncias quando a " +
        "utilização cruza um limiar: o auto-scale do EC2), <strong>por " +
        "evento</strong> (antecipa picos sazonais previstos, como o Natal) e " +
        "<strong>por popularidade</strong> (segue o tráfego monitorado). Você " +
        "paga só pelo que usa.</p>",
      slides: [
        {
          title: "Data centers em escala de galpão",
          html:
            "<ul>" +
            "<li>De milhares a <strong>milhões de servidores</strong> (MS " +
            "Chicago: 100 mil em 50 contêineres)</li>" +
            "<li>Rede IP de prateleira (Ethernet 10 Gbps), não sob medida</li>" +
            "<li>Camadas: racks → switches → roteadores de acesso/borda + " +
            "balanceadores</li>" +
            "<li><strong>Escalar</strong> é o requisito fundamental</li>" +
            "</ul>"
        },
        {
          title: "A virtualização é o motor",
          html:
            "<ul>" +
            "<li><strong>Consolida</strong> servidores subutilizados</li>" +
            "<li>Roda <strong>código legado</strong> e cria " +
            "<strong>sandboxes</strong> (segurança)</li>" +
            "<li><strong>Isolamento de desempenho</strong> ⇒ garantias de QoS</li>" +
            "<li>Consolidar corta energia: <strong>data centers verdes</strong></li>" +
            "</ul>"
        },
        {
          title: "VM e recuperação de desastres",
          html:
            "<ul>" +
            "<li>Recuperar VM por VM ⇒ ~<strong>40%</strong> do tempo (sem " +
            "reinstalar SO)</li>" +
            "<li><strong>Clone de VM</strong> suspenso remoto + migração a " +
            "quente</li>" +
            "<li>Nº de snapshots define <strong>RPO</strong> (perda) e " +
            "<strong>RTO</strong> (tempo)</li>" +
            "</ul>"
        },
        {
          title: "Elasticidade: sub × superprovisionar",
          html:
            "<ul>" +
            "<li>Estático desperdiça: <strong>superprovisionar</strong> " +
            "(ociosidade) × <strong>subprovisionar</strong> (demanda perdida)</li>" +
            "<li>Elasticidade cresce/encolhe conforme a carga</li>" +
            "<li>Você paga <strong>só pelo que usa</strong></li>" +
            "</ul>"
        },
        {
          title: "Auto-scaling em três sabores",
          html:
            "<ul>" +
            "<li><strong>Por demanda</strong>: limiar de utilização (auto-scale " +
            "do EC2)</li>" +
            "<li><strong>Por evento</strong>: picos sazonais previstos (Natal)</li>" +
            "<li><strong>Por popularidade</strong>: segue o tráfego monitorado</li>" +
            "</ul>"
        }
      ]
    },

    {
      title: "Aplicabilidade e desafios para aplicações distribuídas",
      html:
        "<p>Como construir uma aplicação distribuída na nuvem? Dois caminhos " +
        "típicos. Pelo <strong>PaaS</strong>, você escreve o código num ambiente " +
        "que já cuida do resto: no <strong>Google App Engine</strong>, a " +
        "aplicação roda nos clusters do Google com <strong>escala e " +
        "balanceamento automáticos</strong>; um ambiente local simula o GAE para " +
        "codificar e depurar, e o SDK <em>faz upload</em> do código para a " +
        "infraestrutura. Pelo <strong>IaaS</strong>, você aluga VMs no " +
        "<strong>EC2</strong>, escolhe o SO, isola seus recursos numa " +
        "<strong>VPC</strong> (nuvem privada virtual) e liga o <strong>auto-scaling " +
        "+ balanceamento de carga elástico</strong>. Para dados em escala, " +
        "entram modelos como <strong>MapReduce</strong> e armazenamentos como " +
        "BigTable/S3: a nuvem também alivia o problema de E/S em petaescala.</p>" +

        "<h3>Seis desafios que o desenvolvedor precisa pesar</h3>" +
        "<p>A nuvem não é mágica de graça. Armbrust e colegas mapearam seis " +
        "desafios, que são, ao mesmo tempo, riscos e oportunidades:</p>" +
        "<ul>" +
        "<li><strong>1. Disponibilidade e aprisionamento de dados</strong>: um " +
        "único provedor é um ponto único de falha, e APIs proprietárias " +
        "<em>prendem</em> seus dados. Saídas: usar <strong>múltiplos " +
        "provedores</strong> e <strong>padronizar APIs</strong> (ex.: OVF, " +
        "formato aberto de empacotamento de VMs).</li>" +
        "<li><strong>2. Privacidade e segurança</strong>: nuvens são redes " +
        "essencialmente públicas, expostas a ataques, inclusive novos, como " +
        "<em>malware de hipervisor</em>, <em>VM rootkits</em>, salto entre " +
        "convidados e homem-no-meio na migração de VM. Cifrar dados e respeitar " +
        "leis de residência de dados ajudam (ecoa o Tópico 7).</li>" +
        "<li><strong>3. Desempenho imprevisível</strong>: VMs compartilham CPU e " +
        "memória bem, mas a <strong>E/S</strong> não. Há interferência de " +
        "disco/rede entre VMs vizinhas.</li>" +
        "<li><strong>4. Armazenamento distribuído e bugs em larga escala</strong>: " +
        "bases sempre crescendo, e bugs que <em>só aparecem na escala de " +
        "produção</em> e não se reproduzem no laboratório.</li>" +
        "<li><strong>5. Escalabilidade, interoperabilidade e padronização</strong>: " +
        "cobrança por byte/hora, e a necessidade de VMs <em>agnósticas de " +
        "hipervisor</em> e migração entre plataformas (OVF de novo).</li>" +
        "<li><strong>6. Licenciamento e reputação compartilhada</strong>: " +
        "licenças por uso em vez de perpétuas; e o <em>mau comportamento de um " +
        "inquilino</em> (spam) pode manchar a reputação de IPs compartilhados por " +
        "todos.</li>" +
        "</ul>" +

        "<div class=\"callout\">" +
        "<p class=\"callout-title\">🎓 Todo o curso roda aqui</p>" +
        "<p>A nuvem é onde o curso inteiro se encontra. A comunicação entre " +
        "processos e a RPC (Tópicos 4-5) viram chamadas a serviços gerenciados; " +
        "a virtualização (Tópico 6) e os contêineres/Kubernetes são o " +
        "empacotamento; a segurança e o TLS (Tópico 7) protegem o canal; os " +
        "sistemas de arquivos e o GFS (Tópico 8) guardam os dados; os serviços " +
        "de nomes (Tópico 9) localizam as réplicas; e a replicação com quóruns " +
        "(Tópico 10) define a consistência. O trabalho do " +
        "desenvolvedor muda de <em>comprar e operar servidores</em> para " +
        "<strong>compor serviços gerenciados e pagar pelo uso</strong>: sem " +
        "esquecer de administrar as trocas: lock-in, segurança, consistência e " +
        "custo.</p>" +
        "</div>",
      slides: [
        {
          title: "Construir na nuvem: PaaS × IaaS",
          html:
            "<ul>" +
            "<li><strong>PaaS (GAE)</strong>: sobe o código, escala/balanceia " +
            "automático; SDK faz upload</li>" +
            "<li><strong>IaaS (EC2)</strong>: aluga VMs, escolhe o SO, isola em " +
            "<strong>VPC</strong>, auto-scaling + LB elástico</li>" +
            "<li>Dados em escala: <strong>MapReduce</strong>, BigTable/S3</li>" +
            "</ul>"
        },
        {
          title: "Desafios 1-3",
          html:
            "<ul>" +
            "<li><strong>Disponibilidade + lock-in</strong>: provedor único = " +
            "SPOF; padronizar APIs (OVF)</li>" +
            "<li><strong>Segurança</strong>: malware de hipervisor, VM rootkit, " +
            "MITM na migração</li>" +
            "<li><strong>Desempenho</strong>: interferência de <strong>E/S</strong> " +
            "entre VMs</li>" +
            "</ul>"
        },
        {
          title: "Desafios 4-6",
          html:
            "<ul>" +
            "<li><strong>Armazenamento + bugs</strong>: base crescente; bugs só " +
            "na escala de produção</li>" +
            "<li><strong>Padronização</strong>: cobrança por uso, VMs " +
            "agnósticas de hipervisor</li>" +
            "<li><strong>Licença + reputação</strong>: licenciar por uso; um " +
            "inquilino ruim mancha IPs compartilhados</li>" +
            "</ul>"
        },
        {
          title: "Todo o curso roda aqui",
          html:
            "<ul>" +
            "<li>RPC (4-5), virtualização/contêineres (6), TLS (7), GFS (8), " +
            "nomes (9), replicação/CAP (10)</li>" +
            "<li>De <em>comprar servidores</em> a <strong>compor serviços " +
            "gerenciados</strong> e pagar pelo uso</li>" +
            "<li>Administrar as trocas: lock-in, segurança, consistência, custo</li>" +
            "</ul>"
        }
      ]
    }
  ],

  quiz: [
    {
      question:
        "Qual é a principal mudança econômica que a computação em nuvem traz " +
        "frente à TI tradicional?",
      options: [
        "Elimina totalmente os custos operacionais, restando apenas o investimento de capital.",
        "Substitui o investimento de capital antecipado (comprar e renovar hardware) por um modelo de pagamento por uso (pay-as-you-go), em que só se paga pelos recursos efetivamente consumidos.",
        "Torna a computação gratuita para pequenas empresas por meio de subsídios dos provedores.",
        "Aumenta o custo total, porque alugar recursos é sempre mais caro do que comprá-los."
      ],
      answer: 1,
      explanation:
        "A nuvem troca o CAPEX (comprar servidores que ficam obsoletos a cada " +
        "~18 meses) pelo modelo pay-as-you-go: sem custo inicial de hardware, " +
        "paga-se só a execução. A IBM estimou economia de 80-95%, especialmente " +
        "valiosa para startups e pequenos usuários."
    },
    {
      question:
        "Um desenvolvedor aluga uma máquina virtual, instala nela o sistema " +
        "operacional que quiser e implanta sua aplicação. Que modelo de serviço " +
        "ele está usando, e o que o provedor gerencia?",
      options: [
        "SaaS: o provedor gerencia tudo, inclusive a aplicação pronta.",
        "PaaS: o provedor fornece a linguagem e o runtime, e o desenvolvedor apenas envia o código.",
        "IaaS: o provedor gerencia a infraestrutura virtualizada (compute, armazenamento e rede), e o usuário controla o SO, o armazenamento e as aplicações.",
        "Nenhum: instalar o próprio SO caracteriza TI tradicional, não computação em nuvem."
      ],
      answer: 2,
      explanation:
        "Alugar VMs e escolher o próprio SO é a marca do IaaS: o provedor cuida " +
        "da infraestrutura virtual (compute/armazenamento/rede) e o usuário " +
        "controla o SO, o armazenamento e as aplicações (ex.: Amazon EC2 + S3). " +
        "No PaaS você só subiria o código; no SaaS, só usaria o app pronto."
    },
    {
      question:
        "Sobre os três modelos de serviço em camadas, qual afirmação é correta?",
      options: [
        "O IaaS é construído sobre o PaaS, que é construído sobre o SaaS.",
        "O SaaS costuma ser construído sobre o PaaS, que por sua vez roda sobre o IaaS; e, do ponto de vista do provedor, o SaaS exige mais trabalho e o IaaS, menos.",
        "Os três modelos são independentes e nunca compartilham recursos entre si.",
        "O IaaS exige mais trabalho do provedor, porque entrega aplicações prontas ao usuário final."
      ],
      answer: 1,
      explanation:
        "A pilha vai de baixo para cima: IaaS (infraestrutura) sustenta o PaaS " +
        "(plataforma), que sustenta o SaaS (aplicação). Quanto mais alto o " +
        "pilar, mais o provedor gerencia: SaaS demanda mais trabalho dele; " +
        "IaaS, menos (o usuário assume o SO e as aplicações)."
    },
    {
      question:
        "Por que a elasticidade é considerada o recurso central da nuvem, e o " +
        "que acontece sem ela?",
      options: [
        "Sem elasticidade, o provisionamento estático desperdiça recursos: superprovisionar para o pico deixa capacidade ociosa e subprovisionar perde a demanda paga; a elasticidade (auto-scaling) cresce e encolhe os recursos conforme a carga, pagando-se só pelo uso.",
        "A elasticidade cifra os dados em trânsito; sem ela, todo o tráfego da nuvem ficaria exposto a invasores.",
        "A elasticidade garante consistência forte entre as réplicas; sem ela, os dados dos usuários divergem irremediavelmente.",
        "Sem elasticidade, as máquinas virtuais não conseguem migrar de um servidor físico para outro."
      ],
      answer: 0,
      explanation:
        "O provisionamento estático sempre erra: superprovisionar para o pico " +
        "gera ociosidade nos vales; subprovisionar perde a demanda paga acima da " +
        "capacidade. A elasticidade ajusta os recursos à carga automaticamente " +
        "(auto-scaling por demanda, evento ou popularidade), e o usuário paga só " +
        "o que consome."
    },
    {
      question:
        "Uma empresa mantém seus dados sensíveis em uma nuvem privada, mas " +
        "'transborda' picos de carga sazonais para uma nuvem pública. Que modelo " +
        "de implantação é esse?",
      options: [
        "Nuvem pública, porque em algum momento usa recursos acessados pela Internet.",
        "Nuvem privada, porque a organização continua dona da infraestrutura principal.",
        "Nuvem comunitária, compartilhada apenas entre organizações do mesmo setor.",
        "Nuvem híbrida: combina uma nuvem privada e uma pública, usando a pública para absorver a carga excedente (surge computing / cloud bursting)."
      ],
      answer: 3,
      explanation:
        "Manter o sensível na privada e transbordar picos para a pública é " +
        "exatamente a nuvem híbrida (cloud bursting / surge computing). Ela " +
        "combina o controle e a privacidade da privada com a escala e a economia " +
        "da pública."
    },
    {
      question:
        "O 'aprisionamento de dados' (data lock-in) é um dos desafios da nuvem. " +
        "Em que ele consiste, e qual a solução apontada?",
      options: [
        "É a criptografia obrigatória imposta pelo provedor; a solução é usar chaves de cifragem mais curtas.",
        "É a impossibilidade física de replicar dados entre data centers; a solução é concentrar tudo em um único data center.",
        "É a dificuldade de extrair dados e programas de um provedor para outro por causa de APIs proprietárias; a solução é padronizar as APIs (por exemplo, o formato OVF), permitindo portar aplicações e usar múltiplos provedores.",
        "É o vazamento de dados por ataques de hipervisor; a solução é desligar a virtualização no data center."
      ],
      answer: 2,
      explanation:
        "O lock-in prende o cliente porque cada provedor tem APIs proprietárias, " +
        "dificultando levar dados e programas para outro. A saída é padronizar " +
        "as APIs e formatos (como o OVF, de empacotamento aberto de VMs), o que " +
        "também habilita usar múltiplos provedores e o modelo híbrido."
    }
  ],

  glossary: [
    { term: "Computação em nuvem", definition: "Paradigma que entrega recursos de computação (infraestrutura, plataforma e software) como serviços sob demanda, a partir de grandes data centers, cobrados pelo uso." },
    { term: "Computação utilitária (utility)", definition: "Modelo, herdado pela nuvem, de fornecer recursos como um serviço medido e pago pelo consumo, à maneira de água e energia elétrica." },
    { term: "Pay-as-you-go", definition: "Modelo de cobrança da nuvem: sem investimento de capital antecipado, paga-se apenas pelos recursos efetivamente usados (só a fase de execução)." },
    { term: "IaaS", definition: "Infraestrutura como serviço: aluguel de compute, armazenamento e rede virtualizados; o usuário controla o SO e as aplicações, o provedor cuida da infraestrutura (ex.: Amazon EC2/S3)." },
    { term: "PaaS", definition: "Plataforma como serviço: ambiente de desenvolvimento e execução (SO + runtime) em que o usuário só desenvolve e implanta o código, sem gerenciar a infraestrutura (ex.: Google App Engine, Azure)." },
    { term: "SaaS", definition: "Software como serviço: aplicações prontas acessadas pelo navegador, sem investir em servidores ou licenças (ex.: Gmail, Salesforce)." },
    { term: "Nuvem pública", definition: "Nuvem construída sobre a Internet e acessível por assinatura a qualquer pagante; promove padronização e evita investimento de capital." },
    { term: "Nuvem privada", definition: "Nuvem dentro da intranet de uma única organização, que é dona e gestora da infraestrutura; oferece mais customização, controle, segurança e privacidade." },
    { term: "Nuvem híbrida", definition: "Combinação de nuvem privada e pública, mantendo o sensível na privada e transbordando picos de carga para a pública (surge computing / cloud bursting)." },
    { term: "Data center em escala de galpão", definition: "Instalação com de milhares a milhões de servidores de prateleira, ligados por rede IP em camadas (racks, switches, roteadores de acesso e borda); a base física da nuvem." },
    { term: "Virtualização (motor da nuvem)", definition: "Tecnologia que cria VMs em clusters virtuais sobre o hardware do data center, permitindo consolidação, código legado, sandboxes de segurança e isolamento de desempenho." },
    { term: "Elasticidade", definition: "Capacidade de crescer e encolher os recursos alocados conforme a carga; evita o desperdício do provisionamento estático (super ou subprovisionamento)." },
    { term: "Auto-scaling", definition: "Provisionamento elástico automático de instâncias: por demanda (limiar de utilização), por evento (picos sazonais previstos) ou por popularidade (tráfego monitorado)." },
    { term: "SLA (acordo de nível de serviço)", definition: "Contrato entre provedor e usuário que define garantias de disponibilidade, desempenho e proteção de dados do serviço de nuvem." },
    { term: "Data lock-in", definition: "Aprisionamento do cliente pela dificuldade de mover dados e programas entre provedores por causa de APIs proprietárias; mitigado pela padronização de APIs e formatos (ex.: OVF)." },
    { term: "Recuperação de desastres por clone de VM", definition: "Manter um clone suspenso de cada VM em servidor remoto e ativá-lo por migração a quente na falha; cai a ~40% do tempo de recuperação física (parâmetros RPO e RTO)." }
  ],

  references: [
    "HWANG, K.; DONGARRA, J.; FOX, G. C. Distributed and Cloud Computing. Cap. 4. Cloud Platform Architecture over Virtualized Data Centers (pp. 191-261).",
    "HWANG, K.; DONGARRA, J.; FOX, G. C. Op. cit. Cap. 6. Cloud Programming and Software Environments (MapReduce e GAE; aprofundamento).",
    "COULOURIS, G. et al. Sistemas Distribuídos: Conceitos e Projeto. 5. ed. Cap. 21. Projeto de Sistemas Distribuídos: Estudo de Caso do Google (infraestrutura de nuvem em escala; leitura complementar)."
  ]
};
