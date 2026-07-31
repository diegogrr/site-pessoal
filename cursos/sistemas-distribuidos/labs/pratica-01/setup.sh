#!/bin/bash
# ============================================================
# Pratica 01 (Topico 1) - Sistemas Distribuidos - IFSP Salto
# Script de inicializacao dos tres nos (campo "User data" do EC2).
# Roda uma unica vez, no primeiro boot da instancia.
#
# Sem acentos de proposito: o user data executa antes do locale
# estar definido. Testado em Amazon Linux 2023 (python3 da base).
# ============================================================
set -x
exec > /var/log/sd-setup.log 2>&1

mkdir -p /opt/sd

# ---- Identidade do no, lida do servico de metadados da instancia ----
# 169.254.169.254 e um endereco de link local: responde apenas dentro
# da propria instancia. E, ele mesmo, um servico distribuido.
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
# servico.py - responde quem sou eu e que horas sao NO MEU relogio
# ============================================================
cat > /opt/sd/servico.py <<'PY'
#!/usr/bin/env python3
"""Servico minimo da Pratica 01.

Responde JSON com a identidade do no e o valor do relogio LOCAL dele.
Sem dependencias: usa apenas a biblioteca padrao do Python.
"""
import http.server
import json
import socket
import time

IDENTIDADE = {}
try:
    with open("/opt/sd/identidade.txt", "r") as arquivo:
        for linha in arquivo:
            if "=" in linha:
                chave, valor = linha.strip().split("=", 1)
                IDENTIDADE[chave] = valor
except OSError:
    pass

CONTADOR = {"pedidos": 0}


def relogio_legivel(instante):
    return time.strftime("%H:%M:%S", time.localtime(instante)) + \
        ("%.3f" % (instante % 1))[1:]


class Manipulador(http.server.BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.1"
    server_version = "sd-pratica01/1.0"

    def do_GET(self):
        CONTADOR["pedidos"] += 1
        agora = time.time()
        corpo = json.dumps({
            # So o primeiro rotulo: o nome completo traz ".ec2.internal" e
            # estoura as colunas do cliente. O curto e o mesmo do prompt.
            "no": socket.gethostname().split(".")[0],
            "az": IDENTIDADE.get("az", "?"),
            "instancia": IDENTIDADE.get("instancia", "?"),
            "ip_privado": IDENTIDADE.get("ip_privado", "?"),
            "relogio": agora,
            "relogio_legivel": relogio_legivel(agora),
            "pedidos_atendidos": CONTADOR["pedidos"],
        }, indent=2).encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(corpo)))
        self.end_headers()
        self.wfile.write(corpo)

    def log_message(self, *args):
        pass  # silencia o log padrao, que poluiria o terminal


if __name__ == "__main__":
    servidor = http.server.ThreadingHTTPServer(("0.0.0.0", 8080), Manipulador)
    servidor.serve_forever()
PY

# ============================================================
# cliente.py - as tres medicoes da pratica
# ============================================================
cat > /opt/sd/cliente.py <<'PY'
#!/usr/bin/env python3
"""Cliente da Pratica 01 (Topico 1) - Sistemas Distribuidos - IFSP Salto.

Uso (o atalho "sd" chama este arquivo):
  sd rtt      <ip> [repeticoes]   tempo de resposta da aplicacao
  sd relogios <ip> [ip ...]       compara relogios (algoritmo de Cristian)
  sd causa    <ip>                gera um par causa/efeito e ordena por timestamp
  sd monitor  <ip> [ip ...]       laco de disponibilidade (Ctrl+C para parar)
"""
import json
import socket
import sys
import time
import urllib.error
import urllib.request

PORTA = 8080
TIMEOUT = 2.0


def consulta(host, timeout=TIMEOUT):
    """Chama o servico do no e devolve (dados, t0, t1, duracao).

    Os dois relogios da maquina, cada um no seu papel: t0 e t1 vem do
    relogio de PAREDE, porque o algoritmo de Cristian os compara com o
    relogio de parede do outro no; a duracao vem do relogio MONOTONICO,
    que nao anda para tras quando a hora e corrigida.
    """
    url = "http://%s:%d/" % (host, PORTA)
    t0 = time.time()
    m0 = time.monotonic()
    with urllib.request.urlopen(url, timeout=timeout) as resposta:
        bruto = resposta.read()
    m1 = time.monotonic()
    t1 = time.time()
    return json.loads(bruto.decode("utf-8")), t0, t1, m1 - m0


def classifica(erro):
    """Traduz a excecao no sintoma que o cliente enxerga."""
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


def marca(instante):
    return time.strftime("%H:%M:%S", time.localtime(instante)) + \
        ("%.3f" % (instante % 1))[1:]


def cmd_rtt(argumentos):
    host = argumentos[0]
    repeticoes = int(argumentos[1]) if len(argumentos) > 1 else 20
    print("Tempo de resposta da aplicacao ate %s (%d chamadas)" % (host, repeticoes))
    amostras = []
    for _ in range(repeticoes):
        try:
            _, _, _, duracao = consulta(host)
            amostras.append(duracao)
        except Exception as erro:
            rotulo, detalhe = classifica(erro)
            print("  %s: %s" % (rotulo, detalhe))
        time.sleep(0.05)
    if not amostras:
        print("  nenhuma resposta: confira o IP e a regra do grupo de seguranca")
        return
    amostras.sort()
    n = len(amostras)
    # Indice do p95 por interpolacao pelo piso: com n=20 cai na 19a amostra,
    # e nao na ultima (int(n*0.95) daria o proprio maximo, escondendo a cauda).
    p95 = amostras[int(0.95 * (n - 1))]
    print("  respostas : %d de %d" % (n, repeticoes))
    print("  minimo    : %s" % ms(amostras[0]))
    print("  mediana   : %s   <-- anote este valor" % ms(amostras[n // 2]))
    print("  p95       : %s" % ms(p95))
    print("  maximo    : %s" % ms(amostras[-1]))
    print("")
    print("  Use a mediana, nao a media: uma unica amostra ruim distorce a media.")


def cmd_relogios(hosts):
    print("Comparando relogios (algoritmo de Cristian)")
    print("O relogio do outro no so pode ser conhecido dentro de uma janela")
    print("do tamanho do tempo de ida e volta. Essa incerteza nao some.\n")
    for host in hosts:
        try:
            dados, t0, _, ida_volta = consulta(host)
        except Exception as erro:
            rotulo, detalhe = classifica(erro)
            print("  %s  %s: %s" % (host, rotulo, detalhe))
            continue
        # t0 e de parede (comparavel com o relogio do outro no) e a meia
        # viagem foi medida com o monotonico: cada relogio no seu papel.
        estimativa = t0 + ida_volta / 2.0
        desvio = dados["relogio"] - estimativa
        print("  no %s (%s)" % (dados["no"], dados["az"]))
        print("    ida e volta     : %s" % ms(ida_volta))
        print("    desvio estimado : %+.3f ms" % (desvio * 1000.0))
        print("    incerteza       : +/- %s" % ms(ida_volta / 2.0))
        if abs(desvio) < ida_volta / 2.0:
            print("    veredito        : o desvio cabe dentro da incerteza."
                  " Voce NAO consegue afirmar que os relogios diferem.")
        else:
            print("    veredito        : o desvio e MAIOR que a incerteza."
                  " Os relogios estao mesmo em desacordo.")
        print("")


def cmd_causa(argumentos):
    host = argumentos[0]
    print("Causa e efeito entre dois nos\n")
    t_causa = time.time()
    try:
        dados, _, _, _ = consulta(host)
    except Exception as erro:
        rotulo, detalhe = classifica(erro)
        print("  %s: %s" % (rotulo, detalhe))
        return
    t_efeito = dados["relogio"]
    eventos = [
        (t_causa, "no local", "enviou o pedido      (CAUSA)"),
        (t_efeito, dados["no"], "respondeu ao pedido  (EFEITO)"),
    ]
    print("Log unificado, ordenado pelo timestamp que cada no registrou:")
    for instante, no, texto in sorted(eventos):
        print("  %s  %-18s %s" % (marca(instante), no, texto))
    diferenca = t_efeito - t_causa
    print("")
    if diferenca < 0:
        print("  O EFEITO aparece %.3f s ANTES da CAUSA." % abs(diferenca))
        print("  Nenhum dos dois relogios esta quebrado: eles apenas discordam,")
        print("  e o log ordenado por timestamp virou ficcao.")
    else:
        print("  Ordem coerente: o efeito veio %.3f s depois da causa." % diferenca)
        print("  Isso nao prova nada. Com relogios proximos e rede rapida,")
        print("  a ordem pode inverter a qualquer momento.")


def cmd_monitor(hosts):
    print("Monitor de disponibilidade. Timeout de %.1f s. Ctrl+C para parar.\n" % TIMEOUT)
    print("%-13s %-18s %-14s %s" % ("hora", "no", "situacao", "detalhe"))
    try:
        while True:
            for host in hosts:
                inicio = time.monotonic()
                try:
                    dados, _, t1, duracao = consulta(host)
                    print("%-13s %-18s %-14s %s" % (
                        marca(t1), dados["no"], "OK", ms(duracao)))
                except Exception as erro:
                    rotulo, detalhe = classifica(erro)
                    # A espera vem do monotonico; a hora impressa continua
                    # vindo do relogio de parede, que e o que se le num log.
                    espera = time.monotonic() - inicio
                    print("%-13s %-18s %-14s %s, apos %s" % (
                        marca(time.time()), host, rotulo, detalhe, ms(espera)))
            sys.stdout.flush()
            time.sleep(1.0)
    except KeyboardInterrupt:
        print("\nmonitor encerrado")


COMANDOS = {
    "rtt": cmd_rtt,
    "relogios": cmd_relogios,
    "causa": cmd_causa,
    "monitor": cmd_monitor,
}

if __name__ == "__main__":
    if len(sys.argv) < 3 or sys.argv[1] not in COMANDOS:
        print(__doc__)
        sys.exit(2)
    COMANDOS[sys.argv[1]](sys.argv[2:])
PY

# ---- Atalho "sd" para encurtar os comandos da pratica ----
printf '#!/bin/bash\nexec /usr/bin/python3 /opt/sd/cliente.py "$@"\n' > /usr/local/bin/sd
chmod +x /usr/local/bin/sd /opt/sd/servico.py /opt/sd/cliente.py

# ---- Servico gerenciado pelo systemd (sobe no boot, reinicia se cair) ----
cat > /etc/systemd/system/sd-servico.service <<'UNIT'
[Unit]
Description=Servico da Pratica 01 (Sistemas Distribuidos)
After=network-online.target

[Service]
ExecStart=/usr/bin/python3 /opt/sd/servico.py
Restart=always
RestartSec=1
User=root

[Install]
WantedBy=multi-user.target
UNIT

systemctl daemon-reload
systemctl enable --now sd-servico

echo "pratica 01: no pronto em $(date -Is)" >> /opt/sd/identidade.txt
