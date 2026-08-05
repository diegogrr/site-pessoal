#!/bin/bash
# ============================================================
# Pratica 02 (Topico 2) - Sistemas Distribuidos - IFSP Salto
# Script de inicializacao dos tres nos.
# Roda uma unica vez, no primeiro boot da instancia. Ele nao vai
# colado no campo "User data", que aceita no maximo 16 KB e nao
# comporta este arquivo. Quem vai colado la e o user-data.sh, um
# carregador de poucas linhas que baixa este script e o executa.
#
# Os tres nos recebem o MESMO script e sobem os MESMOS dois
# servicos: camada de dados na 8081 e camada de aplicacao na 8080.
# Que arranjo esta no ar (duas ou tres camadas, uma replica ou
# duas) nao esta escrito em lugar nenhum do codigo: e escolha de
# quem chama. Essa e a ideia central da pratica.
#
# Sem acentos de proposito: o user data executa antes do locale
# estar definido. Testado em Amazon Linux 2023 (python3 da base).
# ============================================================
set -x
# Acrescenta ao log em vez de truncar: o carregador ja escreveu ali
# a linha do download, e ela e a primeira coisa util no diagnostico.
exec >> /var/log/sd-setup.log 2>&1

mkdir -p /opt/sd

# ---- Identidade do no, lida do servico de metadados da instancia ----
TOKEN=$(curl -s -X PUT "http://169.254.169.254/latest/api/token" \
  -H "X-aws-ec2-metadata-token-ttl-seconds: 600")
MD="http://169.254.169.254/latest/meta-data"
AUTH="X-aws-ec2-metadata-token: $TOKEN"
{
  echo "instancia=$(curl -s -H "$AUTH" $MD/instance-id)"
  echo "tipo=$(curl -s -H "$AUTH" $MD/instance-type)"
  echo "az=$(curl -s -H "$AUTH" $MD/placement/availability-zone)"
  echo "ip_privado=$(curl -s -H "$AUTH" $MD/local-ipv4)"
  echo "ip_publico=$(curl -s -H "$AUTH" $MD/public-ipv4)"
} > /opt/sd/identidade.txt

# ============================================================
# semear.py - cria o catalogo que a camada de dados serve
# ============================================================
cat > /opt/sd/semear.py <<'PY'
#!/usr/bin/env python3
"""Cria o catalogo de pecas da Pratica 02.

Os precos saem de uma formula, nao de um sorteio: os tres nos
precisam ter EXATAMENTE o mesmo catalogo. Se o conteudo variasse de
maquina para maquina, a comparacao entre replicas do experimento 3
nao provaria nada.
"""
import os
import sqlite3
import sys

BANCO = "/opt/sd/catalogo.sqlite"
PECAS = 200


def preco(identificador):
    """Deterministica: mesmo id, mesmo preco, em qualquer no."""
    return round(10.0 + ((identificador * 3719) % 90000) / 100.0, 2)


def criar(caminho=BANCO):
    if os.path.exists(caminho):
        os.remove(caminho)
    conexao = sqlite3.connect(caminho)
    try:
        conexao.execute(
            "CREATE TABLE peca ("
            "  id INTEGER PRIMARY KEY,"
            "  nome TEXT NOT NULL,"
            "  preco REAL NOT NULL,"
            "  estoque INTEGER NOT NULL)"
        )
        conexao.executemany(
            "INSERT INTO peca (id, nome, preco, estoque) VALUES (?, ?, ?, ?)",
            [(i, "peca-%03d" % i, preco(i), (i * 7) % 50)
             for i in range(1, PECAS + 1)],
        )
        conexao.commit()
    finally:
        conexao.close()
    return caminho


if __name__ == "__main__":
    destino = sys.argv[1] if len(sys.argv) > 1 else BANCO
    criar(destino)
    print("catalogo com %d pecas em %s" % (PECAS, destino))
PY

# ============================================================
# dados.py - CAMADA DE DADOS (porta 8081)
# ============================================================
cat > /opt/sd/dados.py <<'PY'
#!/usr/bin/env python3
"""Camada de dados da Pratica 02.

Serve o catalogo por HTTP e nao tem regra de negocio nenhuma: devolve
linhas, e quem soma e a camada de aplicacao. Essa divisao de trabalho
e o que faz dela uma camada separada, e nao apenas outro processo.

  GET /peca?id=7         uma peca por chamada
  GET /pecas?ids=1,2,3   varias pecas em UMA chamada
  GET /saude             estou vivo?

Sem dependencias: apenas a biblioteca padrao do Python.
"""
import http.server
import json
import socket
import sqlite3
import urllib.parse

BANCO = "/opt/sd/catalogo.sqlite"
PORTA = 8081

CONTADOR = {"chamadas": 0, "linhas": 0}


def no():
    # So o primeiro rotulo: o nome completo traz ".ec2.internal" e
    # estoura as colunas do cliente.
    return socket.gethostname().split(".")[0]


def busca(ids):
    """Uma consulta SQL com todos os ids pedidos."""
    if not ids:
        return []
    conexao = sqlite3.connect(BANCO)
    try:
        marcas = ",".join("?" * len(ids))
        cursor = conexao.execute(
            "SELECT id, nome, preco, estoque FROM peca WHERE id IN (%s)" % marcas,
            ids,
        )
        return [{"id": linha[0], "nome": linha[1],
                 "preco": linha[2], "estoque": linha[3]}
                for linha in cursor.fetchall()]
    finally:
        conexao.close()


class Servidor(http.server.ThreadingHTTPServer):
    """Nao reclama quando o cliente desiste antes da resposta.

    Sob timeout o cliente fecha a conexao no meio, e o servidor padrao
    despejaria um traceback no journal a cada pedido abandonado.
    """

    def handle_error(self, pedido, endereco):
        pass


class Manipulador(http.server.BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.1"
    server_version = "sd-dados/1.0"

    def responde(self, corpo, codigo=200):
        bruto = json.dumps(corpo).encode("utf-8")
        self.send_response(codigo)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(bruto)))
        self.end_headers()
        self.wfile.write(bruto)

    def do_GET(self):
        partes = urllib.parse.urlparse(self.path)
        consulta = urllib.parse.parse_qs(partes.query)

        if partes.path == "/saude":
            self.responde({"ok": True, "no": no(), "camada": "dados"})
            return

        if partes.path == "/peca":
            ids = [int(consulta.get("id", ["1"])[0])]
        elif partes.path == "/pecas":
            bruto = consulta.get("ids", [""])[0]
            ids = [int(p) for p in bruto.split(",") if p.strip()]
        else:
            self.responde({"erro": "rota desconhecida"}, 404)
            return

        pecas = busca(ids)
        CONTADOR["chamadas"] += 1
        CONTADOR["linhas"] += len(pecas)
        self.responde({
            "no": no(),
            "pecas": pecas,
            "chamadas_atendidas": CONTADOR["chamadas"],
        })

    def log_message(self, *args):
        pass  # silencia o log padrao, que poluiria o terminal


if __name__ == "__main__":
    Servidor(("0.0.0.0", PORTA), Manipulador).serve_forever()
PY

# ============================================================
# aplicacao.py - CAMADA DE APLICACAO (porta 8080)
# ============================================================
cat > /opt/sd/aplicacao.py <<'PY'
#!/usr/bin/env python3
"""Camada de aplicacao da Pratica 02.

  GET /pedido?itens=30&dados=local        duas camadas: le o disco
  GET /pedido?itens=30&dados=172.31.0.9   tres camadas: pergunta pela rede
  GET /pedido?itens=30&dados=...&lote=1   a mesma resposta em UMA chamada
  GET /saude                              estou vivo?

O codigo e o mesmo nos dois arranjos: muda quem responde pelo dado.
A arquitetura nao esta no codigo, esta no arranjo.

Dois defeitos podem ser ligados de fora, criando um arquivo, para os
experimentos 2 e 3. Nenhum dos dois afeta a rota /saude, e essa e
justamente a licao: o teste de saude pergunta se o no esta vivo, nao
se ele esta certo.
"""
import http.server
import json
import os
import socket
import sqlite3
import time
import urllib.parse
import urllib.request

BANCO = "/opt/sd/catalogo.sqlite"
PORTA = 8080
PORTA_DADOS = 8081
TIMEOUT_DADOS = 5.0

# Ligados com "sudo touch", desligados com "sudo rm". Sem reiniciar nada.
LENTIDAO = "/opt/sd/lentidao"   # experimento 2: falha de temporizacao
DEFEITO = "/opt/sd/defeito"     # experimento 3: falha arbitraria
ATRASO = 5.0                    # segundos, maior que o timeout do cliente

CONTADOR = {"pedidos": 0}

IDENTIDADE = {}
try:
    with open("/opt/sd/identidade.txt", "r") as arquivo:
        for linha in arquivo:
            if "=" in linha:
                chave, valor = linha.strip().split("=", 1)
                IDENTIDADE[chave] = valor
except OSError:
    pass


def no():
    return socket.gethostname().split(".")[0]


def do_disco(ids, lote):
    """Duas camadas: a aplicacao abre o catalogo no proprio disco."""
    conexao = sqlite3.connect(BANCO)
    try:
        if lote:
            marcas = ",".join("?" * len(ids))
            cursor = conexao.execute(
                "SELECT id, preco FROM peca WHERE id IN (%s)" % marcas, ids)
            return [{"id": l[0], "preco": l[1]} for l in cursor.fetchall()], 1
        pecas = []
        for identificador in ids:
            cursor = conexao.execute(
                "SELECT id, preco FROM peca WHERE id = ?", (identificador,))
            pecas.extend({"id": l[0], "preco": l[1]} for l in cursor.fetchall())
        return pecas, len(ids)
    finally:
        conexao.close()


def baixa(url):
    with urllib.request.urlopen(url, timeout=TIMEOUT_DADOS) as resposta:
        return json.loads(resposta.read().decode("utf-8"))["pecas"]


def alvo(host, porta):
    """Aceita "ip" ou "ip:porta". O roteiro sempre passa so o ip."""
    return host if ":" in host else "%s:%d" % (host, porta)


def da_rede(ids, origem, lote):
    """Tres camadas: a aplicacao pergunta para a camada de dados."""
    base = "http://%s" % alvo(origem, PORTA_DADOS)
    if lote:
        lista = ",".join(str(i) for i in ids)
        return baixa("%s/pecas?ids=%s" % (base, lista)), 1
    pecas = []
    for identificador in ids:
        pecas.extend(baixa("%s/peca?id=%d" % (base, identificador)))
    return pecas, len(ids)


def total_de(pecas):
    """Soma os precos. Com o defeito ligado, perde a peca mais cara.

    O erro e silencioso de proposito: nao levanta excecao, nao escreve
    no log e devolve um valor plausivel. E o que torna a falha
    arbitraria diferente de todas as outras.
    """
    valores = sorted(peca["preco"] for peca in pecas)
    if os.path.exists(DEFEITO):
        valores = valores[:-1]
    return round(sum(valores), 2)


def monta_pedido(itens, origem, lote):
    ids = list(range(1, itens + 1))
    inicio = time.monotonic()
    if origem == "local":
        pecas, consultas = do_disco(ids, lote)
    else:
        pecas, consultas = da_rede(ids, origem, lote)
    tempo_dados = time.monotonic() - inicio
    CONTADOR["pedidos"] += 1
    return {
        "no": no(),
        "az": IDENTIDADE.get("az", "?"),
        "arranjo": "2 camadas" if origem == "local" else "3 camadas",
        "origem": origem,
        "itens": len(pecas),
        "consultas": consultas,
        "tempo_dados_ms": round(tempo_dados * 1000.0, 3),
        "total": total_de(pecas),
        "pedidos_atendidos": CONTADOR["pedidos"],
    }


class Servidor(http.server.ThreadingHTTPServer):
    """Nao reclama quando o cliente desiste antes da resposta.

    Com a lentidao ligada isso acontece a cada pedido: o cliente
    esgota o timeout dele e fecha a conexao enquanto o servidor ainda
    dorme. E comportamento esperado, nao defeito, e nao precisa de um
    traceback no journal.
    """

    def handle_error(self, pedido, endereco):
        pass


class Manipulador(http.server.BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.1"
    server_version = "sd-aplicacao/1.0"

    def responde(self, corpo, codigo=200):
        bruto = json.dumps(corpo).encode("utf-8")
        self.send_response(codigo)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(bruto)))
        self.end_headers()
        self.wfile.write(bruto)

    def do_GET(self):
        partes = urllib.parse.urlparse(self.path)
        consulta = urllib.parse.parse_qs(partes.query)

        # O teste de saude nao passa pela camada de dados e nao dorme:
        # responde depressa mesmo com os dois defeitos ligados.
        if partes.path == "/saude":
            self.responde({"ok": True, "no": no(),
                           "az": IDENTIDADE.get("az", "?"),
                           "camada": "aplicacao"})
            return

        if partes.path != "/pedido":
            self.responde({"erro": "rota desconhecida"}, 404)
            return

        if os.path.exists(LENTIDAO):
            time.sleep(ATRASO)

        itens = max(1, min(200, int(consulta.get("itens", ["12"])[0])))
        origem = consulta.get("dados", ["local"])[0]
        lote = consulta.get("lote", ["0"])[0] not in ("0", "", "nao")
        try:
            self.responde(monta_pedido(itens, origem, lote))
        except Exception as erro:
            self.responde({"erro": "%s: %s" % (type(erro).__name__, erro)}, 502)

    def log_message(self, *args):
        pass


if __name__ == "__main__":
    Servidor(("0.0.0.0", PORTA), Manipulador).serve_forever()
PY

# ============================================================
# cliente.py - as tres medicoes da pratica
# ============================================================
cat > /opt/sd/cliente.py <<'PY'
#!/usr/bin/env python3
"""Cliente da Pratica 02 (Topico 2) - Sistemas Distribuidos - IFSP Salto.

Uso (o atalho "sd" chama este arquivo):
  sd tempo    <app> [--dados local|IP] [--itens N] [--lote] [--repeticoes R]
  sd frota    <app> <app> [--dados local|IP] [--itens N] [--pedidos N]
  sd conferir <app> <app> [--dados local|IP] [--itens N]
  sd saude    <app> [<app> ...]

Padroes: --dados local, --itens 12, --repeticoes 10, --pedidos 20.
"""
import json
import socket
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

PORTA_APP = 8080
TIMEOUT = 2.0

SEM_OPCAO = ("lote",)  # opcoes que nao levam valor


def opcoes(argumentos):
    """Separa <posicionais> das opcoes --chave valor."""
    posicionais, flags = [], {}
    indice = 0
    while indice < len(argumentos):
        atual = argumentos[indice]
        if atual.startswith("--"):
            nome = atual[2:]
            if nome in SEM_OPCAO:
                flags[nome] = True
                indice += 1
            else:
                flags[nome] = argumentos[indice + 1] if indice + 1 < len(argumentos) else ""
                indice += 2
        else:
            posicionais.append(atual)
            indice += 1
    return posicionais, flags


def alvo(host):
    """Aceita "ip" ou "ip:porta". O roteiro sempre passa so o ip."""
    return host if ":" in host else "%s:%d" % (host, PORTA_APP)


def pede(host, itens, origem, lote=False, timeout=None):
    """Um pedido a camada de aplicacao. Devolve (resposta, duracao).

    A duracao vem do relogio monotonico, que nao anda para tras se a
    hora da maquina for corrigida no meio da medicao.
    """
    timeout = TIMEOUT if timeout is None else timeout
    parametros = {"itens": itens, "dados": origem}
    if lote:
        parametros["lote"] = "1"
    url = "http://%s/pedido?%s" % (
        alvo(host), urllib.parse.urlencode(parametros))
    inicio = time.monotonic()
    with urllib.request.urlopen(url, timeout=timeout) as resposta:
        bruto = resposta.read()
    return json.loads(bruto.decode("utf-8")), time.monotonic() - inicio


def pergunta_saude(host, timeout=None):
    timeout = TIMEOUT if timeout is None else timeout
    url = "http://%s/saude" % alvo(host)
    inicio = time.monotonic()
    with urllib.request.urlopen(url, timeout=timeout) as resposta:
        bruto = resposta.read()
    return json.loads(bruto.decode("utf-8")), time.monotonic() - inicio


def classifica(erro):
    """Traduz a excecao no sintoma que o cliente enxerga."""
    if isinstance(erro, urllib.error.HTTPError):
        # A aplicacao respondeu, e respondeu que nao conseguiu. O motivo
        # esta no corpo: quase sempre a camada de dados fora do ar.
        try:
            corpo = json.loads(erro.read().decode("utf-8"))
            return "ERRO %d" % erro.code, corpo.get("erro", erro.reason)
        except Exception:
            return "ERRO %d" % erro.code, erro.reason
    motivo = getattr(erro, "reason", erro)
    if isinstance(motivo, (socket.timeout, TimeoutError)):
        return "SEM RESPOSTA", "esgotou o tempo de espera"
    if isinstance(motivo, ConnectionRefusedError):
        return "RECUSADO", "conexao recusada (RST)"
    if isinstance(motivo, ConnectionResetError):
        return "RECUSADO", "conexao encerrada pelo outro lado"
    if isinstance(motivo, socket.gaierror):
        return "SEM NOME", "nome nao resolvido"
    if isinstance(motivo, OSError) and getattr(motivo, "errno", None) == 113:
        return "SEM ROTA", "sem rota para o destino"
    return "ERRO", str(motivo)


def ms(segundos):
    return "%.3f ms" % (segundos * 1000.0)


def mediana(valores):
    ordenados = sorted(valores)
    return ordenados[len(ordenados) // 2]


def percentil95(valores):
    ordenados = sorted(valores)
    # Interpolacao pelo piso: com n=10 cai na nona amostra, e nao na
    # ultima, que seria o proprio maximo escondendo a cauda.
    return ordenados[int(0.95 * (len(ordenados) - 1))]


def cmd_tempo(argumentos):
    posicionais, flags = opcoes(argumentos)
    host = posicionais[0]
    origem = flags.get("dados", "local")
    itens = int(flags.get("itens", 12))
    repeticoes = int(flags.get("repeticoes", 10))
    lote = bool(flags.get("lote", False))

    arranjo = "2 camadas (dado no disco da propria aplicacao)" \
        if origem == "local" else "3 camadas (dado em %s)" % origem
    print("Pedido de %d itens em %s, %d repeticoes" % (itens, host, repeticoes))
    print("arranjo: %s" % arranjo)
    print("consulta: %s\n" % ("uma chamada em lote" if lote
                              else "uma chamada por item"))

    totais, nos_dados, resposta = [], [], None
    for _ in range(repeticoes):
        try:
            resposta, duracao = pede(host, itens, origem, lote)
            if "erro" in resposta:
                print("  a aplicacao devolveu erro: %s" % resposta["erro"])
                return
            totais.append(duracao)
            nos_dados.append(resposta["tempo_dados_ms"] / 1000.0)
        except Exception as erro:
            rotulo, detalhe = classifica(erro)
            print("  %s: %s" % (rotulo, detalhe))
        time.sleep(0.05)

    if not totais:
        print("  nenhuma resposta: confira o IP e a regra do grupo de seguranca")
        return

    fatia = 100.0 * mediana(nos_dados) / mediana(totais)
    print("  respostas        : %d de %d" % (len(totais), repeticoes))
    print("  mediana total    : %s   <-- anote este valor" % ms(mediana(totais)))
    print("  p95 total        : %s" % ms(percentil95(totais)))
    print("  mediana nos dados: %s   (%.0f%% do total)" % (ms(mediana(nos_dados)), fatia))
    print("  idas e voltas    : %d por pedido" % resposta["consultas"])
    print("  total do pedido  : %.2f" % resposta["total"])


def cmd_frota(argumentos):
    posicionais, flags = opcoes(argumentos)
    hosts = posicionais
    origem = flags.get("dados", "local")
    itens = int(flags.get("itens", 12))
    pedidos = int(flags.get("pedidos", 20))

    print("Rodizio entre %d replicas, %d pedidos de %d itens" % (
        len(hosts), pedidos, itens))
    print("timeout de %.1f s; se uma replica falhar, tenta a seguinte\n" % TIMEOUT)

    atendidos, perdidos = {}, 0
    custos_diretos, custos_com_desvio, falhas = [], [], {}
    for numero in range(pedidos):
        giro = numero % len(hosts)
        ordem = hosts[giro:] + hosts[:giro]
        inicio = time.monotonic()
        desviou = False
        for host in ordem:
            try:
                resposta, _ = pede(host, itens, origem)
                nome = resposta.get("no", host)
                atendidos[nome] = atendidos.get(nome, 0) + 1
                custo = time.monotonic() - inicio
                (custos_com_desvio if desviou else custos_diretos).append(custo)
                break
            except Exception as erro:
                rotulo, detalhe = classifica(erro)
                falhas[rotulo] = falhas.get(rotulo, 0) + 1
                falhas["_detalhe"] = detalhe
                desviou = True
        else:
            perdidos += 1

    todos = custos_diretos + custos_com_desvio
    print("  atendidos     : %d de %d" % (pedidos - perdidos, pedidos))
    if atendidos:
        print("  por no        : %s" % " | ".join(
            "%s %d" % (nome, quantos) for nome, quantos in sorted(atendidos.items())))
    if falhas:
        detalhe = falhas.pop("_detalhe", "")
        print("  tentativas perdidas: %s (%s)" % (
            " | ".join("%s %d" % (rotulo, quantos)
                       for rotulo, quantos in sorted(falhas.items())), detalhe))
    else:
        print("  tentativas perdidas: nenhuma")
    if todos:
        print("  mediana       : %s" % ms(mediana(todos)))
        print("  p95           : %s" % ms(percentil95(todos)))
    if custos_com_desvio and custos_diretos:
        penalidade = mediana(custos_com_desvio) - mediana(custos_diretos)
        print("  preco do desvio: %s a mais nos pedidos que precisaram da"
              " segunda tentativa" % ms(penalidade))


def cmd_conferir(argumentos):
    posicionais, flags = opcoes(argumentos)
    hosts = posicionais
    origem = flags.get("dados", "local")
    itens = int(flags.get("itens", 12))

    print("Mesma pergunta, %d replicas: %d itens, dados em %s\n" % (
        len(hosts), itens, origem))
    respostas = []
    for host in hosts:
        try:
            resposta, duracao = pede(host, itens, origem)
            respostas.append(resposta)
            print("  no %-18s %-12s total %12.2f   itens %3d   %s" % (
                resposta["no"], resposta["az"], resposta["total"],
                resposta["itens"], ms(duracao)))
        except Exception as erro:
            rotulo, detalhe = classifica(erro)
            print("  %s  %s: %s" % (host, rotulo, detalhe))
    print("")

    if len(respostas) < 2:
        print("  Preciso de duas respostas para comparar.")
        return

    divergentes = [campo for campo in ("total", "itens")
                   if len({r[campo] for r in respostas}) > 1]
    if not divergentes:
        print("  As respostas sao IDENTICAS.")
        print("  Isso nao prova que estao certas: prova que as duas concordam.")
        return

    print("  As respostas DIVERGEM em: %s" % ", ".join(divergentes))
    print("  Nenhuma replica acusou erro e todas responderam 200 OK.")
    print("  Elas leram o mesmo catalogo, entao a diferenca esta na aplicacao.")

    # Com 3 ou mais replicas a maioria ja aponta o mentiroso, que e o que a
    # extensao "Um terceiro voto" ensina. Com 2, so da para saber que ha
    # desacordo (achado D4 da auditoria de 2026-08-04).
    if len(respostas) < 3:
        print("  Com duas replicas voce descobre que ha desacordo,")
        print("  mas nao descobre qual das duas esta errada.")
        return

    contagem = {}
    for r in respostas:
        chave = "%.2f" % r["total"]
        contagem[chave] = contagem.get(chave, 0) + 1
    print("")
    print("  Votos por total:")
    for chave in sorted(contagem, key=lambda c: -contagem[c]):
        print("    %14s   %d voto(s)" % (chave, contagem[chave]))
    vencedor = max(contagem, key=lambda c: contagem[c])
    if contagem[vencedor] > len(respostas) / 2.0:
        print("  O valor %s tem maioria e sobrevive a votacao." % vencedor)
        print("  Com tres replicas e um mentiroso, a maioria aponta quem errou.")
    else:
        print("  Nenhum valor teve maioria: a votacao nao decide este caso.")


def cmd_saude(argumentos):
    hosts, _ = opcoes(argumentos)
    print("Saude das replicas: a pergunta que um balanceador faria\n")
    for host in hosts:
        try:
            resposta, duracao = pergunta_saude(host)
            print("  %-16s SAUDAVEL   no %-18s %s" % (
                host, resposta.get("no", "?"), ms(duracao)))
        except Exception as erro:
            rotulo, detalhe = classifica(erro)
            print("  %-16s FORA       %s: %s" % (host, rotulo, detalhe))
    print("")
    print("  Esta rota nao consulta a camada de dados e nao soma nada.")
    print("  Ela responde \"estou vivo\", nunca \"estou certo\".")


COMANDOS = {
    "tempo": cmd_tempo,
    "frota": cmd_frota,
    "conferir": cmd_conferir,
    "saude": cmd_saude,
}

if __name__ == "__main__":
    if len(sys.argv) < 3 or sys.argv[1] not in COMANDOS:
        print(__doc__)
        sys.exit(2)
    COMANDOS[sys.argv[1]](sys.argv[2:])
PY

# ---- Atalho "sd" para encurtar os comandos da pratica ----
printf '#!/bin/bash\nexec /usr/bin/python3 /opt/sd/cliente.py "$@"\n' > /usr/local/bin/sd
chmod +x /usr/local/bin/sd /opt/sd/dados.py /opt/sd/aplicacao.py /opt/sd/cliente.py

# ---- Catalogo, antes dos servicos subirem ----
/usr/bin/python3 /opt/sd/semear.py

# ---- As duas camadas, cada uma no seu servico ----
cat > /etc/systemd/system/sd-dados.service <<'UNIT'
[Unit]
Description=Camada de dados da Pratica 02 (Sistemas Distribuidos)
After=network-online.target

[Service]
ExecStart=/usr/bin/python3 /opt/sd/dados.py
Restart=always
RestartSec=1
User=root

[Install]
WantedBy=multi-user.target
UNIT

cat > /etc/systemd/system/sd-aplicacao.service <<'UNIT'
[Unit]
Description=Camada de aplicacao da Pratica 02 (Sistemas Distribuidos)
After=network-online.target sd-dados.service

[Service]
ExecStart=/usr/bin/python3 /opt/sd/aplicacao.py
Restart=always
RestartSec=1
User=root

[Install]
WantedBy=multi-user.target
UNIT

systemctl daemon-reload
systemctl enable --now sd-dados
systemctl enable --now sd-aplicacao

echo "pratica 02: no pronto em $(date -Is)" >> /opt/sd/identidade.txt
