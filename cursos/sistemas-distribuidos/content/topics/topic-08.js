/* ============================================================
   topic-08.js — Sistemas de Arquivos Distribuídos
   ------------------------------------------------------------
   Estrutura documentada no modelo topic-01.js (sections[] com
   slides[] opcionais, quiz[], glossary[], references[]).
   Conteúdo baseado em: COULOURIS et al., cap. 12 (pp. 521–564);
   GHEMAWAT; GOBIOFF; LEUNG, The Google File System (SOSP 2003)
   e COULOURIS et al., cap. 21 (leituras complementares).
   ============================================================ */

window.SD = window.SD || {};
SD.content = SD.content || {};

SD.content["08"] = {

  sections: [
    {
      title: "O serviço de arquivos e seus requisitos",
      html:
        "<p>Nos tópicos anteriores, processos passaram a conversar por " +
        "soquetes e a invocar objetos remotos como se fossem locais. Agora o " +
        "recurso compartilhado é o mais importante de todos: a " +
        "<strong>informação armazenada</strong>. Um <strong>sistema de " +
        "arquivos distribuído</strong> (SAD) permite que programas armazenem e " +
        "acessem arquivos remotos <em>exatamente como se fossem locais</em>, de " +
        "qualquer computador da rede, e com desempenho e confiabilidade " +
        "comparáveis (às vezes melhores) aos de um disco local. É o serviço " +
        "mais usado de uma intranet: quando um servidor Web serve uma página, " +
        "quando você faz login em outra máquina e reencontra seus arquivos, um " +
        "SAD está por baixo.</p>" +

        "<h3>O que é um arquivo, afinal</h3>" +
        "<p>Um arquivo tem duas partes. Os <strong>dados</strong> são uma " +
        "sequência de bytes, lida ou escrita em qualquer posição. Os " +
        "<strong>atributos</strong> formam um registro único com tamanho, " +
        "carimbos de tempo (criação, acesso, modificação), proprietário, tipo " +
        "e <strong>lista de controle de acesso</strong> (ACL). Alguns atributos " +
        "(tamanho, carimbos) são <em>sombreados</em>: mantidos pelo próprio " +
        "sistema, fora do alcance dos programas. O termo <strong>metadados</strong> " +
        "cobre todas as informações extras que o sistema guarda para gerenciar " +
        "arquivos: atributos e, sobretudo, os <strong>diretórios</strong>, que " +
        "mapeiam nomes textuais para identificadores internos e, encadeados, " +
        "formam a árvore hierárquica de nomes de caminho (<em>pathnames</em>) do " +
        "UNIX.</p>" +

        "<p>Num sistema não distribuído, tudo isso é implementado em " +
        "<strong>camadas</strong>: módulo de diretório (nome → id), módulo de " +
        "arquivo (id → arquivo), controle de acesso (verifica permissão), " +
        "acesso a arquivo (lê/escreve), módulo de bloco (aloca blocos de disco) " +
        "e módulo de dispositivo (E/S). Cada camada só depende da de baixo. Um " +
        "SAD precisa de todas elas <em>mais</em> componentes para a comunicação " +
        "cliente-servidor e para a atribuição de nomes e a localização de " +
        "arquivos espalhados pela rede.</p>" +

        "<h3>Os requisitos: o que muda ao distribuir</h3>" +
        "<p>Muitas das armadilhas dos serviços distribuídos foram descobertas " +
        "justamente ao construir os primeiros SAD, nos anos 70-80. A lista de " +
        "requisitos é quase um resumo do curso inteiro:</p>" +
        "<ul>" +
        "<li><strong>Transparência de acesso</strong>: um único conjunto de " +
        "operações para arquivos locais e remotos: programas existentes rodam " +
        "sem alteração.</li>" +
        "<li><strong>Transparência de localização</strong>: um espaço de nomes " +
        "uniforme; o mesmo nome de caminho vale em qualquer máquina.</li>" +
        "<li><strong>Transparência de mobilidade</strong>: mover arquivos (ou " +
        "volumes) entre servidores sem mudar seus nomes nem reconfigurar os " +
        "clientes.</li>" +
        "<li><strong>Transparência de desempenho e de escala</strong>: continuar " +
        "funcionando enquanto a carga varia, e crescer aos poucos.</li>" +
        "<li><strong>Atualizações concorrentes</strong>: as escritas de um " +
        "cliente não devem corromper o que outro vê: travamento em nível de " +
        "arquivo ou de registro.</li>" +
        "<li><strong>Replicação e cache</strong>: várias cópias dividem a carga " +
        "e toleram falhas; poucos serviços replicam de fato, mas quase todos " +
        "usam <em>cache</em>: uma forma limitada de replicação.</li>" +
        "<li><strong>Heterogeneidade</strong>: interfaces abertas que rodam em " +
        "qualquer SO e hardware.</li>" +
        "<li><strong>Tolerância a falhas</strong>: continuar diante de falhas de " +
        "cliente e de servidor.</li>" +
        "<li><strong>Segurança</strong>: autenticar as requisições e proteger o " +
        "tráfego com assinaturas e cifragem (Tópico 7).</li>" +
        "<li><strong>Eficiência</strong>: desempenho comparável ao de um sistema " +
        "de arquivos local.</li>" +
        "</ul>" +

        "<h3>Duas ideias que governam todo o resto</h3>" +
        "<p>Dois requisitos merecem destaque porque moldam cada decisão de " +
        "projeto adiante. O primeiro é a <strong>tolerância a falhas por " +
        "simplicidade</strong>: se o protocolo usar operações " +
        "<strong>idempotentes</strong>, que podem ser repetidas sem efeito " +
        "colateral, basta a semântica RPC <em>pelo menos uma vez</em>; e se o " +
        "servidor for <strong>sem estado</strong> (<em>stateless</em>), ele pode " +
        "cair e reiniciar <em>sem recuperar nada</em>, retomando o atendimento " +
        "como se nada tivesse acontecido. O segundo é a <strong>semântica de " +
        "atualização de cópia única</strong> (<em>one-copy</em>): o conteúdo que " +
        "todos os processos veem é o que veriam se existisse <em>uma só cópia</em> " +
        "do arquivo. Guardar dados em cache ou replicá-los introduz um atraso " +
        "inevitável na propagação das escritas, e, portanto, algum desvio dessa " +
        "semântica. Todo o tópico é a história de como NFS e AFS <em>aproximam</em> " +
        "a cópia única sem pagar o preço de uma consistência estrita.</p>" +
        "<div class=\"callout\">" +
        "<p class=\"callout-title\">💡 Modos de falha independentes</p>" +
        "<p>Por que a escrita direta (<em>write-through</em>) é tão importante " +
        "num SAD, mas não num disco local? Porque cliente e servidor falham de " +
        "forma <strong>independente</strong> (Tópico 1): o cliente continua " +
        "rodando e supondo que a escrita foi para o disco, mesmo que o servidor " +
        "tenha caído. Num sistema local, a falha do disco derruba também os " +
        "programas: não há como o programa 'seguir em frente' com uma suposição " +
        "falsa.</p>" +
        "</div>",
      slides: [
        {
          title: "O que é um sistema de arquivos distribuído",
          html:
            "<ul>" +
            "<li>Armazenar e acessar arquivos remotos <strong>como se fossem " +
            "locais</strong>, de qualquer máquina</li>" +
            "<li>Desempenho e confiabilidade comparáveis ao disco local</li>" +
            "<li>O <strong>serviço mais usado</strong> de uma intranet</li>" +
            "<li>Sob os servidores Web, o login remoto, o backup central</li>" +
            "</ul>"
        },
        {
          title: "Arquivo = dados + atributos",
          html:
            "<ul>" +
            "<li><strong>Dados</strong>: sequência de bytes, lida/escrita em " +
            "qualquer posição</li>" +
            "<li><strong>Atributos</strong>: tamanho, carimbos, dono, tipo, " +
            "ACL (alguns <em>sombreados</em>)</li>" +
            "<li><strong>Metadados</strong>: atributos + diretórios (nome → id)</li>" +
            "<li>Implementação em <strong>camadas</strong>: diretório, arquivo, " +
            "acesso, bloco, dispositivo</li>" +
            "</ul>"
        },
        {
          title: "Requisitos de transparência",
          html:
            "<ul>" +
            "<li><strong>Acesso</strong>: mesmas operações local/remoto, sem " +
            "recompilar</li>" +
            "<li><strong>Localização</strong>: espaço de nomes uniforme</li>" +
            "<li><strong>Mobilidade</strong>: mover arquivos sem renomear nem " +
            "reconfigurar</li>" +
            "<li><strong>Desempenho e escala</strong>: aguentar carga variável e " +
            "crescer aos poucos</li>" +
            "</ul>"
        },
        {
          title: "Duas ideias que governam o projeto",
          html:
            "<ul>" +
            "<li><strong>Sem estado + idempotente</strong> ⇒ o servidor reinicia " +
            "após falha sem recuperar nada (pelo menos uma vez)</li>" +
            "<li><strong>Semântica de cópia única</strong>: todos veem o arquivo " +
            "como se houvesse uma só cópia</li>" +
            "<li>Cache e réplicas ⇒ atraso na propagação ⇒ <em>desvio</em> " +
            "inevitável</li>" +
            "<li>NFS e AFS <strong>aproximam</strong> a cópia única sem pagar " +
            "consistência estrita</li>" +
            "</ul>"
        }
      ]
    },

    {
      title: "Arquitetura do serviço de arquivos",
      html:
        "<p>Antes dos estudos de caso, um <strong>modelo abstrato</strong> " +
        "separa as preocupações e serve de régua para comparar o NFS e o AFS. " +
        "Ele divide o serviço em <strong>três componentes</strong>: um serviço " +
        "de arquivos plano, um serviço de diretório e um módulo cliente.</p>" +

        "<h3>Serviço de arquivos plano</h3>" +
        "<p>Cuida apenas do <strong>conteúdo</strong> dos arquivos. Cada arquivo " +
        "é referenciado por um <strong>UFID</strong> (identificador único de " +
        "arquivo): uma longa sequência de bits, única em todo o sistema " +
        "distribuído, gerada quando o arquivo é criado. A interface é enxuta: " +
        "<code>Read(FileId, i, n)</code>, <code>Write(FileId, i, Dados)</code>, " +
        "<code>Create</code>, <code>Delete</code>, <code>GetAttributes</code>, " +
        "<code>SetAttributes</code>. Repare no que <strong>falta</strong>: não há " +
        "<code>open</code> nem <code>close</code>, e a posição <em>i</em> é " +
        "parâmetro <strong>explícito</strong> de cada leitura/escrita. A razão é " +
        "de tolerância a falhas: no UNIX, o ponteiro de leitura/escrita é um " +
        "<strong>estado por-cliente</strong> que avança sozinho: repetir uma " +
        "operação acidentalmente acessaria outra parte do arquivo. Eliminando o " +
        "ponteiro, as operações (exceto <code>Create</code>) ficam " +
        "<strong>idempotentes</strong>, permitindo a semântica <em>pelo menos " +
        "uma vez</em> e um servidor <strong>sem estado</strong>, que reinicia " +
        "após uma falha sem restaurar nada.</p>" +

        "<h3>Serviço de diretório</h3>" +
        "<p>Fornece o mapeamento <strong>nome textual → UFID</strong>. Sua " +
        "operação central é <code>Lookup(Dir, Nome) → FileId</code>; " +
        "<code>AddName</code> e <code>UnName</code> inserem e removem entradas " +
        "(ajustando a <strong>contagem de referência</strong> do arquivo, quando " +
        "ela chega a zero, o arquivo é removido); <code>GetNames</code> lista " +
        "nomes por correspondência de padrão. O diretório é, ele próprio, um " +
        "<strong>cliente do serviço de arquivos plano</strong>: cada diretório é " +
        "guardado como um arquivo comum, com seu UFID. Assim se constrói a " +
        "hierarquia: a raiz é um diretório de UFID conhecido, e um nome de " +
        "caminho é resolvido <em>passo a passo</em>, um <code>Lookup</code> por " +
        "parte. Vários nomes (<em>aliases</em>) para o mesmo arquivo saem de " +
        "graça com <code>AddName</code> + contagem de referência.</p>" +

        "<h3>Módulo cliente</h3>" +
        "<p>Roda em cada computador cliente e é a cola do sistema: integra os " +
        "dois serviços numa <strong>única interface de programação</strong> que " +
        "imita o sistema de arquivos do SO local (por exemplo, simulando as " +
        "chamadas UNIX). Ele conhece a <strong>localização</strong> dos " +
        "servidores e, decisivo para o desempenho, implementa uma " +
        "<strong>cache</strong> dos blocos usados recentemente. Por ser aberto, " +
        "módulos clientes distintos podem simular interfaces de SOs diferentes " +
        "sobre o mesmo serviço.</p>" +

        "<h3>Controle de acesso sem estado</h3>" +
        "<p>No UNIX local, a permissão é conferida <em>uma vez</em>, no " +
        "<code>open</code>, e a identidade do usuário não pode ser forjada. No " +
        "mundo distribuído a interface RPC do servidor é um ponto de acesso " +
        "<strong>aberto e desprotegido</strong>, e a identidade viaja na " +
        "requisição: <strong>forjável</strong>. Guardar o resultado da " +
        "verificação no servidor o tornaria <em>com estado</em>. Duas " +
        "estratégias preservam o servidor sem estado: (1) verificar no momento " +
        "em que o nome vira UFID e devolver uma <strong>capacidade</strong> " +
        "(Tópico 7) que o cliente reapresenta; ou (2) enviar a identidade " +
        "<strong>em cada requisição</strong> e verificar por operação: o " +
        "método usado por NFS e AFS. Nenhuma resolve a falsificação de " +
        "identidade sozinha; a resposta é assinar/autenticar, e na prática " +
        "integrar o <strong>Kerberos</strong>.</p>" +

        "<h3>Grupos de arquivos</h3>" +
        "<p>Um <strong>grupo de arquivos</strong> é um conjunto de arquivos num " +
        "servidor (o <em>filesystem</em> do UNIX é o exemplo). Grupos podem ser " +
        "<strong>movidos</strong> entre servidores, mas um arquivo não muda de " +
        "grupo. Para isso, o UFID embute um <strong>identificador de grupo</strong>, " +
        "e o módulo cliente usa esse identificador para mandar a requisição ao " +
        "servidor certo. O identificador precisa ser <strong>globalmente " +
        "único</strong>, pode-se concatenar o endereço IP (32 bits) do criador " +
        "com um inteiro derivado da data (16 bits), mas <em>não</em> serve para " +
        "localizar o grupo (ele pode ter migrado): o serviço mantém um " +
        "mapeamento separado grupo → servidor.</p>",
      slides: [
        {
          title: "Três módulos",
          html:
            "<ul>" +
            "<li><strong>Serviço de arquivos plano</strong>: conteúdo dos " +
            "arquivos (UFIDs)</li>" +
            "<li><strong>Serviço de diretório</strong>: nome textual → UFID</li>" +
            "<li><strong>Módulo cliente</strong>: integra os dois, imita o SO " +
            "local, mantém a cache</li>" +
            "<li>Modelo abstrato que serve de régua para NFS e AFS</li>" +
            "</ul>"
        },
        {
          title: "Serviço de arquivos plano",
          html:
            "<ul>" +
            "<li>Referência por <strong>UFID</strong> (único em todo o sistema)</li>" +
            "<li><code>Read/Write(FileId, i, …)</code>: posição " +
            "<strong>explícita</strong></li>" +
            "<li><strong>Sem</strong> open/close: nada de ponteiro por-cliente</li>" +
            "<li>Operações <strong>idempotentes</strong> ⇒ pelo menos uma vez + " +
            "servidor sem estado</li>" +
            "</ul>"
        },
        {
          title: "Serviço de diretório",
          html:
            "<ul>" +
            "<li><code>Lookup(Dir, Nome) → FileId</code> é o bloco básico</li>" +
            "<li><code>AddName/UnName</code> ajustam a <strong>contagem de " +
            "referência</strong></li>" +
            "<li>Diretório é um <strong>arquivo</strong>: cliente do serviço " +
            "plano</li>" +
            "<li>Caminho resolvido passo a passo, da raiz de UFID conhecido</li>" +
            "</ul>"
        },
        {
          title: "Acesso sem estado e grupos de arquivos",
          html:
            "<ul>" +
            "<li>Identidade viaja na requisição: <strong>forjável</strong></li>" +
            "<li>Sem estado: <strong>capacidade</strong> ou identidade " +
            "<strong>por requisição</strong> (NFS/AFS)</li>" +
            "<li>Falsificação só cai com autenticação (Kerberos)</li>" +
            "<li><strong>Grupo de arquivos</strong> move-se entre servidores; " +
            "UFID embute o id do grupo</li>" +
            "</ul>"
        }
      ]
    },

    {
      title: "Estudo de caso: Sun NFS",
      html:
        "<p>O <strong>NFS</strong> (Network File System) da Sun, de 1985, foi o " +
        "primeiro serviço de arquivos projetado como <em>produto</em>, e um " +
        "sucesso técnico e comercial. Suas interfaces foram colocadas em domínio " +
        "público, virou padrão de Internet (o protocolo versão 3 é o RFC 1813) e " +
        "hoje há implementações para praticamente todo SO. A relação é " +
        "<strong>simétrica</strong>: qualquer máquina pode ser cliente e " +
        "servidor. O NFS segue de perto o modelo abstrato da seção anterior.</p>" +

        "<h3>O sistema de arquivos virtual (VFS)</h3>" +
        "<p>A transparência de acesso vem de uma camada acrescentada ao núcleo: " +
        "o <strong>VFS</strong> (Virtual File System). Ele distingue arquivos " +
        "locais de remotos e encaminha cada requisição ao módulo certo (o FS " +
        "local, o cliente NFS ou outro). Mantém uma estrutura VFS por " +
        "<em>filesystem</em> montado e um <strong>v-node</strong> por arquivo " +
        "aberto, que aponta para o i-node local, se o arquivo é local, ou " +
        "guarda o <strong>manipulador de arquivo</strong> (<em>file handle</em>), " +
        "se é remoto. O manipulador é <strong>opaco</strong> ao cliente e, na " +
        "implementação UNIX, combina identificador do <em>filesystem</em> + " +
        "i-node + <strong>número de geração</strong> (necessário porque i-nodes " +
        "são reutilizados após remoção).</p>" +

        "<h3>Um servidor sem estado</h3>" +
        "<p>Os módulos conversam por <strong>RPC</strong> (o RPC da Sun, sobre " +
        "UDP ou TCP). A interface do servidor (Fig. 12.9) tem " +
        "<code>lookup</code>, <code>read</code>, <code>write</code>, " +
        "<code>getattr</code>, <code>create</code>, <code>rename</code>, " +
        "<code>mkdir</code>, <code>readdir</code> (com <em>cookie</em> para " +
        "continuar a leitura), entre outras: quase idênticas às do modelo " +
        "abstrato. O servidor é <strong>sem estado</strong>: não mantém arquivos " +
        "abertos em nome de ninguém, então <em>reconfere a identidade a cada " +
        "requisição</em> contra a ACL do arquivo. Na forma original, a " +
        "identidade viajava em claro: brecha fechada primeiro com credenciais " +
        "cifradas em DES e, depois, integrando o <strong>Kerberos</strong> " +
        "(Tópico 7) para autenticação forte.</p>" +

        "<h3>Montagem e automounter</h3>" +
        "<p>Cada cliente monta subárvores remotas no seu próprio espaço de " +
        "nomes. Um <strong>serviço de montagem</strong> lê o arquivo " +
        "<code>/etc/exports</code> (o que o servidor disponibiliza e para quem) " +
        "e devolve o manipulador do diretório. Como o ponto de montagem é " +
        "escolhido pelo cliente, o mesmo arquivo remoto pode ter " +
        "<strong>caminhos diferentes em clientes diferentes</strong>: a " +
        "uniformidade depende de tabelas de configuração combinadas. A montagem " +
        "pode ser <strong>incondicional</strong> (o processo espera o servidor " +
        "voltar) ou <strong>condicional</strong> (erro após poucas tentativas). " +
        "O <strong>automounter</strong> monta um diretório remoto sob demanda, " +
        "ao primeiro acesso, e, sondando vários servidores com cópias idênticas " +
        "de um FS só-leitura (como <code>/usr/lib</code>), oferece uma forma " +
        "simples de <strong>replicação, balanceamento e tolerância a falhas</strong>: " +
        "monta o primeiro que responder.</p>" +

        "<h3>Cache no servidor e no cliente</h3>" +
        "<p>Cache é indispensável para o desempenho, e é onde mora o desvio da " +
        "cópia única. No <strong>servidor</strong>, a escrita tem duas opções " +
        "(v3): <strong>escrita direta</strong> (<em>write-through</em>) grava no " +
        "disco antes de responder (persistência garantida, porém lenta); ou " +
        "escrever só na cache e confirmar depois com uma operação " +
        "<code>commit</code> (o padrão, executado ao fechar o arquivo). No " +
        "<strong>cliente</strong>, cada bloco em cache carrega dois carimbos: " +
        "<strong>T<sub>c</sub></strong> (última validação) e " +
        "<strong>T<sub>m</sub></strong> (última modificação no servidor). Um " +
        "bloco é válido no instante T se " +
        "<code>(T − T<sub>c</sub> &lt; t) ∨ (T<sub>m</sub>cliente = " +
        "T<sub>m</sub>servidor)</code>. A primeira metade se avalia " +
        "<em>sem</em> tocar no servidor; só se ela falha o cliente chama " +
        "<code>getattr</code>. O intervalo <strong>t</strong> é o botão de " +
        "compromisso: pequeno (ex.: 3 s) aproxima a cópia única ao custo de " +
        "muito tráfego <code>getattr</code>; por isso o Solaris o ajusta de " +
        "forma <strong>adaptativa</strong> (3-30 s para arquivos, 30-60 s para " +
        "diretórios). Processos <strong>bio-daemon</strong> fazem leitura " +
        "antecipada e escrita postergada de forma assíncrona.</p>" +

        "<h3>Como o NFS se sai</h3>" +
        "<p>Transparência de <strong>acesso</strong>, plena (chamadas UNIX " +
        "normais). De <strong>localização</strong>, boa se as montagens forem " +
        "combinadas. De <strong>mobilidade</strong>, parcial: mover um FS exige " +
        "atualizar as tabelas de montagem de cada cliente. " +
        "<strong>Escalabilidade</strong>, alta: servidores medidos vão de 12.000 " +
        "a 300.000 operações por segundo. <strong>Tolerância a falhas</strong>: " +
        "com servidor sem estado e operações idempotentes, quando o servidor " +
        "cai o cliente apenas espera e retoma; a queda de um cliente não afeta o " +
        "servidor (que não guarda estado dele). <strong>Consistência</strong>: " +
        "uma boa aproximação da cópia única, suficiente para a maioria dos " +
        "aplicativos, mas <em>não</em> recomendada para coordenação fina entre " +
        "processos em máquinas diferentes.</p>",
      slides: [
        {
          title: "NFS: VFS e manipulador de arquivo",
          html:
            "<ul>" +
            "<li>Padrão de 1985 (v3 = RFC 1813); cliente/servidor " +
            "<strong>simétrico</strong></li>" +
            "<li><strong>VFS</strong> no núcleo separa local × remoto; v-node " +
            "por arquivo aberto</li>" +
            "<li><strong>Manipulador</strong> opaco: id do FS + i-node + número " +
            "de geração</li>" +
            "<li>Segue de perto o modelo abstrato</li>" +
            "</ul>"
        },
        {
          title: "Servidor sem estado + Kerberos",
          html:
            "<ul>" +
            "<li>RPC Sun (UDP/TCP); operações quase iguais às do modelo</li>" +
            "<li>Sem estado ⇒ <strong>reconfere a identidade a cada " +
            "requisição</strong></li>" +
            "<li>Identidade em claro era brecha ⇒ DES ⇒ " +
            "<strong>Kerberos</strong></li>" +
            "<li>Falha do servidor: cliente espera e retoma</li>" +
            "</ul>"
        },
        {
          title: "Montagem e automounter",
          html:
            "<ul>" +
            "<li><code>/etc/exports</code> + serviço de montagem devolvem o " +
            "manipulador</li>" +
            "<li>Ponto de montagem é do cliente ⇒ caminhos podem diferir</li>" +
            "<li>Incondicional (espera) × condicional (erro)</li>" +
            "<li><strong>Automounter</strong>: monta sob demanda; réplica " +
            "só-leitura por sondagem</li>" +
            "</ul>"
        },
        {
          title: "Cache: servidor e cliente",
          html:
            "<ul>" +
            "<li>Servidor: <strong>write-through</strong> × <code>commit</code> " +
            "(v3)</li>" +
            "<li>Cliente valida por <strong>T<sub>c</sub></strong> (validação) e " +
            "<strong>T<sub>m</sub></strong> (modificação)</li>" +
            "<li>Válido se <code>T − T<sub>c</sub> &lt; t</code> ou " +
            "T<sub>m</sub> igual no servidor</li>" +
            "<li><strong>t</strong> adaptativo (3-30 s) equilibra consistência × " +
            "tráfego getattr</li>" +
            "</ul>"
        },
        {
          title: "Como o NFS se sai",
          html:
            "<ul>" +
            "<li>Acesso pleno; localização boa; <strong>mobilidade parcial</strong></li>" +
            "<li>Escala: 12.000-300.000 operações/s por servidor</li>" +
            "<li>Tolerância a falhas do modelo sem estado + idempotente</li>" +
            "<li>Consistência ≈ cópia única: não para coordenação fina</li>" +
            "</ul>"
        }
      ]
    },

    {
      title: "AFS e além",
      html:
        "<p>O <strong>Andrew File System</strong> (AFS), da Carnegie Mellon, " +
        "atende às mesmas primitivas UNIX, mas nasce de uma prioridade " +
        "diferente: <strong>escalabilidade</strong>: funcionar bem com muito " +
        "mais usuários ativos. Sua aposta é radical: <strong>cache de arquivos " +
        "inteiros</strong> no disco do cliente. Duas características incomuns: " +
        "<em>servir o arquivo inteiro</em> (no AFS-3, em blocos de 64 KB) e " +
        "<em>guardá-lo em cache no disco local</em>, onde ele sobrevive a " +
        "reinicializações e atende às próximas aberturas sem tocar no " +
        "servidor.</p>" +

        "<h3>O cenário e as suposições</h3>" +
        "<p>Quando um processo faz <code>open</code> de um arquivo compartilhado " +
        "que não está na cache local, o AFS busca uma <strong>cópia inteira</strong> " +
        "no servidor, grava-a no disco local e abre essa cópia; " +
        "<code>read</code>/<code>write</code> operam <em>só na cópia local</em>; " +
        "no <code>close</code>, se houve alteração, o conteúdo volta ao servidor. " +
        "A aposta se apoia em observações de cargas UNIX reais: a maioria dos " +
        "arquivos é <strong>pequena</strong> (&lt; 10 KB), leituras superam " +
        "escritas (~6×), o acesso é sequencial, a maioria dos arquivos tem " +
        "<strong>um único usuário</strong> e vale a <strong>localidade " +
        "temporal</strong> (o que foi usado tende a ser reusado). Bancos de " +
        "dados (muito compartilhados e atualizados) ficaram " +
        "<em>explicitamente fora</em> do escopo.</p>" +

        "<h3>Vice, Venus, volumes e fids</h3>" +
        "<p>O AFS vive em dois processos de nível de usuário: <strong>Vice</strong> " +
        "(o servidor) e <strong>Venus</strong> (o cliente, o módulo cliente do " +
        "modelo). O núcleo é modificado apenas para interceptar " +
        "<code>open</code>/<code>close</code> de arquivos compartilhados e " +
        "entregá-los ao Venus. Arquivos e diretórios têm um <strong>fid</strong> " +
        "de 96 bits (número do <strong>volume</strong> + manipulador + elemento " +
        "de exclusividade). Os <strong>volumes</strong>: menores que os " +
        "<em>filesystems</em> do NFS, tipicamente um por usuário. São a unidade " +
        "de localização e movimentação; um banco de dados replicado mapeia " +
        "volume → servidor. O Venus traduz nomes de caminho em fids passo a " +
        "passo; o Vice só aceita fids.</p>" +

        "<h3>A promessa de callback</h3>" +
        "<p>Aqui está a ideia que dá ao AFS sua escalabilidade. Ao entregar uma " +
        "cópia, o Vice também dá uma <strong>promessa de callback</strong>: um " +
        "tíquete que garante que o servidor <strong>avisará</strong> o Venus se " +
        "outro cliente modificar aquele arquivo. O tíquete tem dois estados, " +
        "<em>válido</em> ou <em>cancelado</em>. Quando alguém fecha o arquivo " +
        "após alterá-lo, o Vice dispara um <strong>callback</strong> (uma RPC do " +
        "servidor para o cliente) a cada Venus que detém a promessa, marcando o " +
        "tíquete como cancelado. No <code>open</code>, o Venus só precisa buscar " +
        "no servidor <em>se o tíquete estiver cancelado</em>; se estiver válido, " +
        "usa a cópia local <strong>sem nenhuma ida à rede</strong>. Compare com " +
        "o NFS, em que o cliente <em>pergunta</em> ao servidor (<code>getattr</code>) " +
        "a cada validação: no AFS, o servidor só fala quando algo muda. É por " +
        "isso que, num mesmo benchmark, o AFS mediu <strong>40% de carga no " +
        "servidor</strong> contra <strong>100% do NFS</strong>. Após reiniciar, " +
        "ou passado um intervalo <em>T</em> (~10 min) sem contato, o Venus " +
        "revalida antes de confiar no tíquete: para o caso de um callback ter " +
        "se perdido.</p>" +

        "<h3>Semântica de atualização: vale o último a fechar</h3>" +
        "<p>O algoritmo de consistência só age no <code>open</code> e no " +
        "<code>close</code>. Entre eles, o cliente lê e escreve a cópia local à " +
        "vontade, <em>sem</em> que ninguém saiba. A garantia formal do AFS-1 é " +
        "limpa: após um <code>open</code> bem-sucedido, o cliente tem a versão " +
        "mais recente; após um <code>close</code>, sua versão foi propagada ao " +
        "servidor. A consequência é dura: se dois usuários em estações " +
        "<strong>diferentes</strong> editam o mesmo arquivo ao mesmo tempo, " +
        "<strong>vale o último a fechar</strong>: as outras atualizações são " +
        "<em>perdidas em silêncio</em>, sem relatório de erro. (Processos na " +
        "<em>mesma</em> estação compartilham a cópia em cache e se comportam como " +
        "no UNIX, bloco a bloco.) O AFS não oferece controle de concorrência: " +
        "quem precisa, implementa por conta própria. Ainda assim, o " +
        "comportamento é <em>próximo o bastante</em> do UNIX para a maioria dos " +
        "programas rodar sem alteração, e o AFS foi implantado em mais de 1.000 " +
        "servidores, com taxa de acerto de cache de 96-98%.</p>" +

        "<h3>Aprimoramentos: leases, NFS v4 e o disco</h3>" +
        "<p>A pesquisa posterior fechou várias lacunas. O <strong>Spritely " +
        "NFS</strong> e o <strong>NQNFS</strong> acrescentaram <code>open</code>/" +
        "<code>close</code> e <strong>callbacks</strong> ao NFS, obtendo a " +
        "cópia única precisa ao custo de algum estado no servidor; o NQNFS usa " +
        "<strong>arrendamentos</strong> (<em>leases</em>, Tópico 5), tíquetes " +
        "com prazo, para que, se um cliente sumir, o servidor apenas " +
        "<em>espere o prazo expirar</em>. O <strong>NFS versão 4</strong> (2000) " +
        "incorporou esses recursos e a <strong>migração transparente</strong> de " +
        "arquivos. No <strong>DCE/DFS</strong>, herdeiro do AFS, o callback é " +
        "disparado assim que o arquivo é atualizado (não só no <code>close</code>), " +
        "via <em>tokens</em> de escrita por faixa de bytes. E, no disco, o " +
        "<strong>RAID</strong> distribui blocos em tiras por vários discos com " +
        "redundância (desempenho + tolerância a falhas), enquanto o " +
        "<strong>LFS</strong> (armazenamento estruturado em log) acumula " +
        "escritas e as grava em grandes segmentos sequenciais, chegando a 70% da " +
        "banda do disco contra menos de 10% de um FS convencional.</p>" +
        "<div class=\"callout\">" +
        "<p class=\"callout-title\">💡 Do NFS ao Google File System</p>" +
        "<p>Os mesmos problemas reaparecem em escala planetária. O " +
        "<strong>GFS</strong> (Google File System, 2003) roda sobre milhares de " +
        "discos comuns, onde a falha é a <em>regra</em>, não a exceção: um " +
        "<strong>mestre</strong> guarda os metadados e os arquivos são picados " +
        "em <em>chunks</em> <strong>replicados</strong> em vários " +
        "<em>chunkservers</em>. Otimiza para arquivos enormes e para " +
        "<strong>acréscimo</strong> (append) em vez de escrita aleatória, e " +
        "afrouxa a consistência de propósito: as mesmas trocas entre " +
        "desempenho, disponibilidade e cópia única que você viu aqui, levadas ao " +
        "limite. É a ponte para a computação em nuvem (Tópico 11) e para o " +
        "estudo de caso do Google.</p>" +
        "</div>" +

        /* Área reservada para demonstração interativa futura. */
        '<div class="demo-area" data-demo="arquivos-distribuidos">' +
        '<span class="demo-placeholder-icon" aria-hidden="true">🧪</span>' +
        "<p><strong>Demonstração interativa (em breve)</strong></p>" +
        "<p>Espaço reservado para uma visualização do caminho de uma operação de leitura/escrita em um sistema de arquivos distribuído.</p>" +
        "</div>",
      slides: [
        {
          title: "AFS: cache de arquivo inteiro",
          html:
            "<ul>" +
            "<li>Prioridade: <strong>escalabilidade</strong> (muitos usuários)</li>" +
            "<li>Serve e <strong>guarda o arquivo inteiro</strong> no disco " +
            "local (sobrevive a reboot)</li>" +
            "<li><code>open</code> busca a cópia · <code>close</code> devolve se " +
            "mudou · o resto é local</li>" +
            "<li>Apoiado em cargas UNIX: arquivos pequenos, ler ≫ escrever, um " +
            "usuário</li>" +
            "</ul>"
        },
        {
          title: "Vice, Venus, volumes e fids",
          html:
            "<ul>" +
            "<li><strong>Vice</strong> (servidor) + <strong>Venus</strong> " +
            "(cliente), em nível de usuário</li>" +
            "<li>Núcleo só intercepta <code>open</code>/<code>close</code> do " +
            "espaço compartilhado</li>" +
            "<li><strong>fid</strong> de 96 bits: volume + manipulador + " +
            "exclusividade</li>" +
            "<li><strong>Volumes</strong> (um por usuário) são a unidade de " +
            "localização/movimentação</li>" +
            "</ul>"
        },
        {
          title: "A promessa de callback",
          html:
            "<ul>" +
            "<li>Tíquete que garante <strong>aviso</strong> se outro cliente " +
            "alterar o arquivo</li>" +
            "<li>Tíquete válido ⇒ usa a cópia local <strong>sem ir à rede</strong></li>" +
            "<li>Servidor <strong>empurra</strong> a invalidação; no NFS o " +
            "cliente <strong>pergunta</strong> (getattr)</li>" +
            "<li>Resultado: 40% de carga no servidor × 100% do NFS</li>" +
            "</ul>"
        },
        {
          title: "Semântica: vale o último a fechar",
          html:
            "<ul>" +
            "<li>Consistência só no <code>open</code>/<code>close</code></li>" +
            "<li>Estações diferentes editando junto ⇒ <strong>vence o último " +
            "close</strong></li>" +
            "<li>Demais atualizações <strong>perdidas em silêncio</strong></li>" +
            "<li>Sem controle de concorrência embutido: a cargo da aplicação</li>" +
            "</ul>"
        },
        {
          title: "Aprimoramentos e o GFS",
          html:
            "<ul>" +
            "<li><strong>Leases</strong> (NQNFS) e callbacks ⇒ cópia única no " +
            "NFS · <strong>NFS v4</strong>: migração transparente</li>" +
            "<li>Disco: <strong>RAID</strong> (tiras + redundância) e " +
            "<strong>LFS</strong> (log, 70% da banda)</li>" +
            "<li><strong>GFS</strong>: mestre + chunks replicados em discos " +
            "comuns, otimizado para <em>append</em></li>" +
            "<li>As mesmas trocas, em escala planetária ⇒ nuvem (Tópico 11)</li>" +
            "</ul>"
        }
      ]
    }
  ],

  quiz: [
    {
      question:
        "O protocolo NFS foi projetado para servidores SEM ESTADO " +
        "(stateless), com operações idempotentes (exceto create). Qual é a " +
        "principal vantagem dessa escolha?",
      options: [
        "Garante uma semântica de atualização de cópia única idêntica à do UNIX local.",
        "Permite autenticar o cliente uma única vez, no open, e confiar nele até o close.",
        "Após uma falha, o servidor reinicia e retoma o atendimento sem recuperar estado dos clientes, e requisições sem resposta podem ser repetidas com segurança.",
        "Elimina a necessidade de cache no cliente, pois o servidor guarda a posição de leitura de cada arquivo aberto."
      ],
      answer: 2,
      explanation:
        "Sem estado + idempotente é a receita de tolerância a falhas mais " +
        "simples: o servidor pode cair e reiniciar sem procedimentos de " +
        "recuperação, e o cliente pode repetir uma chamada sem resposta (pelo " +
        "menos uma vez) sem risco. Justamente por ser sem estado, o NFS NÃO " +
        "consegue a cópia única precisa (opção A) nem guarda arquivos abertos " +
        "(opções B e D)."
    },
    {
      question:
        "O que significa a “semântica de atualização de cópia única” " +
        "(one-copy) e por que caches e réplicas a ameaçam?",
      options: [
        "Que existe só uma cópia física de cada arquivo no sistema; a cache a viola por duplicar dados no disco.",
        "Que todo processo vê o conteúdo do arquivo como se houvesse uma única cópia; ao colocar dados em cache ou replicá-los, há atraso na propagação das escritas, e algum desvio é inevitável.",
        "Que cada arquivo só pode ser aberto por um cliente de cada vez; a cache quebra isso ao permitir aberturas concorrentes.",
        "Que o servidor mantém uma cópia mestra e os clientes, cópias somente-leitura; réplicas de escrita a violam."
      ],
      answer: 1,
      explanation:
        "A cópia única é sobre o COMPORTAMENTO observável, não sobre o número " +
        "de cópias físicas: todos devem ver o que veriam se houvesse uma só " +
        "cópia. Como cache e réplicas propagam as escritas com atraso, algum " +
        "desvio dessa semântica é inevitável, e todo o tópico é sobre " +
        "aproximá-la sem pagar consistência estrita."
    },
    {
      question:
        "Na arquitetura abstrata, o serviço de arquivos plano NÃO tem open " +
        "nem close, e Read/Write recebem a posição i como parâmetro " +
        "explícito. Por quê?",
      options: [
        "Para economizar chamadas de rede, agrupando várias leituras numa só mensagem.",
        "Porque o serviço de diretório já mantém os arquivos abertos em nome dos clientes.",
        "Porque open e close são implementados diretamente pelo hardware de disco.",
        "Porque o ponteiro de leitura/escrita do UNIX é estado por-cliente; eliminá-lo torna as operações idempotentes e permite um servidor sem estado."
      ],
      answer: 3,
      explanation:
        "No UNIX, o ponteiro de leitura/escrita avança sozinho e é estado " +
        "mantido por cliente; repetir uma operação acidentalmente acessaria " +
        "outra parte do arquivo. Passando a posição i explicitamente, as " +
        "operações ficam idempotentes (semântica pelo menos uma vez) e o " +
        "servidor pode ser sem estado."
    },
    {
      question:
        "No NFS, cada bloco em cache no cliente é validado com dois carimbos: " +
        "Tç (última validação) e Tₘ (última modificação no servidor). " +
        "Diminuir o intervalo de atualização t (por exemplo, de 30 s para 3 s):",
      options: [
        "aproxima mais a consistência da cópia única, ao custo de mais chamadas getattr ao servidor.",
        "elimina a necessidade de contatar o servidor, pois o cliente passa a confiar sempre na cópia local.",
        "torna o servidor com estado, pois ele passa a lembrar quais blocos cada cliente colocou em cache.",
        "faz o servidor enviar callbacks a cada escrita, como no AFS."
      ],
      answer: 0,
      explanation:
        "t é o botão de compromisso entre consistência e eficiência: um t " +
        "menor revalida com mais frequência (mais getattr no servidor), " +
        "aproximando a cópia única; um t maior alivia o servidor, ao custo de " +
        "ver dados desatualizados por mais tempo. O NFS continua sem estado e " +
        "não usa callbacks: quem os usa é o AFS."
    },
    {
      question:
        "A principal razão de o AFS impor carga muito menor nos servidores " +
        "que o NFS (40% contra 100% no mesmo benchmark) é:",
      options: [
        "o AFS cifra o tráfego, o que reduz o número de pacotes trocados.",
        "o AFS mantém os arquivos na memória, enquanto o NFS os mantém no disco.",
        "no AFS o cliente usa a cópia em cache sem contatar o servidor enquanto a promessa de callback for válida; o servidor só avisa quando o arquivo muda, em vez de o cliente ficar consultando (getattr) o servidor como no NFS.",
        "o AFS transfere apenas blocos pequenos, enquanto o NFS transfere arquivos inteiros."
      ],
      answer: 2,
      explanation:
        "A promessa de callback inverte quem fala: o servidor EMPURRA a " +
        "invalidação apenas quando o arquivo muda, então o Venus usa a cópia " +
        "local sem ir à rede enquanto o tíquete é válido. No NFS, o cliente " +
        "PERGUNTA periodicamente (getattr) para validar a cache, gerando muito " +
        "mais tráfego ao servidor. (E é o AFS que serve o arquivo inteiro, não " +
        "o contrário da opção D.)"
    },
    {
      question:
        "Dois usuários em estações de trabalho DIFERENTES abrem, editam e " +
        "fecham o mesmo arquivo AFS quase ao mesmo tempo. O que o AFS garante?",
      options: [
        "As escritas de ambos são mescladas bloco a bloco, como no UNIX local.",
        "O segundo open falha, porque o primeiro cliente detém uma trava exclusiva sobre o arquivo.",
        "A semântica é de cópia única estrita: a segunda escrita espera a primeira terminar.",
        "Vale o último a fechar: a cópia enviada por quem der close por último substitui a outra, e as demais atualizações são perdidas em silêncio: o controle de concorrência fica a cargo da aplicação."
      ],
      answer: 3,
      explanation:
        "O algoritmo de consistência do AFS só age no open e no close, e não " +
        "há controle de concorrência entre estações: quem fechar por último " +
        "sobrescreve o arquivo, e as atualizações anteriores somem sem " +
        "relatório de erro. Processos na MESMA estação compartilham a cópia em " +
        "cache e aí, sim, escrevem bloco a bloco como no UNIX."
    }
  ],

  glossary: [
    { term: "Sistema de arquivos distribuído", definition: "Serviço que permite armazenar e acessar arquivos remotos como se fossem locais, a partir de qualquer computador da rede, com desempenho e confiabilidade comparáveis aos de um disco local." },
    { term: "Serviço de arquivos plano (flat file service)", definition: "Componente que implementa operações sobre o CONTEÚDO dos arquivos, referenciados por UFID; interface enxuta (Read, Write, Create, Delete, Get/SetAttributes), sem open/close." },
    { term: "UFID", definition: "Identificador único de arquivo: sequência longa de bits, única em todo o sistema distribuído, usada pelo serviço de arquivos plano para referenciar um arquivo." },
    { term: "Serviço de diretório", definition: "Componente que mapeia nomes textuais em UFIDs (operação Lookup) e mantém os diretórios; é ele próprio um cliente do serviço de arquivos plano." },
    { term: "Módulo cliente", definition: "Software em cada cliente que integra os serviços de arquivos e de diretório numa única API imitando o SO local, conhece a localização dos servidores e mantém a cache." },
    { term: "Servidor sem estado (stateless)", definition: "Servidor que não guarda informação de sessão dos clientes; após uma falha, pode reiniciar e retomar o atendimento sem procedimentos de recuperação." },
    { term: "Operação idempotente", definition: "Operação que pode ser repetida sem alterar o resultado, permitindo a semântica RPC 'pelo menos uma vez': base da tolerância a falhas simples de NFS e AFS." },
    { term: "Semântica de cópia única (one-copy)", definition: "Modelo em que todos os processos veem o conteúdo do arquivo como se houvesse uma única cópia; cache e réplicas causam desvio inevitável por causa do atraso de propagação." },
    { term: "VFS (sistema de arquivos virtual)", definition: "Camada acrescentada ao núcleo (no NFS) que distingue arquivos locais de remotos e encaminha cada requisição ao módulo certo; mantém um v-node por arquivo aberto." },
    { term: "Manipulador de arquivo (file handle)", definition: "Identificador de arquivo do NFS, opaco ao cliente; na implementação UNIX combina identificador do filesystem, i-node e número de geração." },
    { term: "Montagem (mount) / automounter", definition: "Mecanismo pelo qual um cliente NFS anexa uma subárvore remota ao seu espaço de nomes; o automounter faz isso sob demanda e pode oferecer réplica só-leitura por sondagem." },
    { term: "Cache no cliente (validação Tc/Tm)", definition: "No NFS, blocos em cache carregam Tc (última validação) e Tm (última modificação no servidor); um bloco é válido se T − Tc < t ou se Tm bate com o do servidor." },
    { term: "Vice e Venus", definition: "Processos do AFS em nível de usuário: Vice é o servidor (aceita fids); Venus é o cliente, que traduz nomes de caminho, gerencia a cache em disco e recebe callbacks." },
    { term: "Promessa de callback", definition: "Tíquete que o servidor AFS (Vice) dá junto com uma cópia, garantindo avisar o cliente (Venus) quando outro cliente modificar o arquivo; enquanto válido, a cópia local é usada sem contatar o servidor." },
    { term: "Volume", definition: "No AFS, unidade de agrupamento, localização e movimentação de arquivos (tipicamente um por usuário), identificada dentro do fid; menor que o filesystem do NFS." },
    { term: "Arrendamento (lease)", definition: "Concessão com prazo (usada no NQNFS e no NFS v4): se o cliente some, o servidor apenas espera o prazo expirar para prosseguir, simplificando a recuperação." }
  ],

  references: [
    "COULOURIS, G. et al. Sistemas Distribuídos: Conceitos e Projeto. 5. ed. Cap. 12. Sistemas de Arquivos Distribuídos (pp. 521-564).",
    "GHEMAWAT, S.; GOBIOFF, H.; LEUNG, S.-T. The Google File System. In: SOSP, 2003 (estudo de caso moderno de larga escala: leitura complementar).",
    "COULOURIS, G. et al. Op. cit. Cap. 21. Projeto de Sistemas Distribuídos: Estudo de Caso do Google (o GFS em detalhe: aprofundamento no próprio livro)."
  ]
};
