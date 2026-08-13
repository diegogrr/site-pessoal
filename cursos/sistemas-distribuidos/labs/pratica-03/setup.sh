#!/bin/bash
# ============================================================
# Pratica 03 (Topico 3) - Sistemas Distribuidos - IFSP Salto
# Script de inicializacao dos tres nos (campo "User data" do EC2).
# Roda uma unica vez, no primeiro boot da instancia.
#
# O MESMO texto sobe nos tres nos. O papel (P, A ou E) nao vem
# escrito aqui: ele e lido da etiqueta Name da propria instancia,
# pelo servico de metadados, porque os tres nascem com
# InstanceMetadataTags=enabled. Assim nao existem tres versoes
# deste arquivo para manter em acordo.
#
# Sem acentos de proposito: o user data executa antes do locale
# estar definido. Testado em Amazon Linux 2023 (python3 da base).
# ============================================================
set -x
exec > /var/log/sd-setup.log 2>&1

mkdir -p /opt/sd

# ---- Identidade do no, lida do servico de metadados da instancia ----
# 169.254.169.254 e um endereco de link local: responde apenas dentro
# da propria instancia, e nao consome rota nenhuma da VPC. E por isso
# que ele funciona no no A antes mesmo de existir saida para a internet.
TOKEN=$(curl -s -X PUT "http://169.254.169.254/latest/api/token" \
  -H "X-aws-ec2-metadata-token-ttl-seconds: 600")
MD="http://169.254.169.254/latest/meta-data"
AUTH="X-aws-ec2-metadata-token: $TOKEN"

pergunta() {
  # -f devolve vazio no lugar do corpo de erro: o no A nao tem IPv4
  # publico, e sem isso a resposta 404 entraria no arquivo como se
  # fosse um endereco.
  curl -s -f -H "$AUTH" --max-time 3 "$MD/$1"
}

MAC=$(pergunta network/interfaces/macs/ | head -1 | tr -d '/')

PAPEL=$(pergunta tags/instance/Name)
case "$PAPEL" in
  sd-?) PAPEL=${PAPEL#sd-} ;;
  *)    PAPEL=$(pergunta instance-id) ;;
esac

{
  echo "papel=$PAPEL"
  echo "instancia=$(pergunta instance-id)"
  echo "az=$(pergunta placement/availability-zone)"
  echo "ipv4_privado=$(pergunta local-ipv4)"
  echo "ipv4_publico=$(pergunta public-ipv4)"
  echo "ipv6=$(pergunta network/interfaces/macs/$MAC/ipv6s | head -1)"
  echo "subrede=$(pergunta network/interfaces/macs/$MAC/subnet-id)"
  echo "vpc=$(pergunta network/interfaces/macs/$MAC/vpc-id)"
} > /opt/sd/identidade.txt

# O prompt passa a dizer em qual no o aluno esta. Nesta pratica quase
# todo comando roda num no e pergunta a outro, e tres janelas abertas
# com o mesmo prompt sao a receita para medir a coisa errada.
hostnamectl set-hostname "sd-$PAPEL"

# ---- Ferramentas de rede que o Amazon Linux 2023 nao traz de base ----
# traceroute mostra o caminho, tcpdump mostra o pacote, bind-utils traz
# o dig e nmap-ncat traz o nc, que testa uma porta sem cliente proprio.
dnf install -y traceroute tcpdump bind-utils nmap-ncat

# ============================================================
# servico.py - responde quem atendeu e de que endereco veio o pedido
# ============================================================
cat > /opt/sd/servico.py <<'PY'
#!/usr/bin/env python3
"""Servico minimo da Pratica 03.

Responde em texto puro quem atendeu e de que endereco o pedido chegou.
E o alvo das tentativas do experimento 1 e o destino que a medida 4
cronometra. Sem dependencias: apenas a biblioteca padrao do Python.

O socket nasce em AF_INET6 e escuta em "::", que e o equivalente IPv6 do
0.0.0.0. Com IPV6_V6ONLY em zero, o mesmo socket atende tambem quem
chega por IPv4, que aparece do lado de ca como ::ffff:10.10.1.4. Uma
linha, portanto, decide se o servico e de pilha dupla ou nao.
"""
import http.server
import socket

IDENTIDADE = {}
try:
    with open("/opt/sd/identidade.txt", "r") as arquivo:
        for linha in arquivo:
            if "=" in linha:
                chave, valor = linha.strip().split("=", 1)
                IDENTIDADE[chave] = valor
except OSError:
    pass


def origem(endereco):
    """Separa o endereco de quem chamou do protocolo por onde ele veio."""
    if endereco.startswith("::ffff:") and "." in endereco:
        return endereco[len("::ffff:"):], "IPv4"
    return endereco, "IPv6"


class Manipulador(http.server.BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.1"
    server_version = "sd-pratica03/1.0"

    def do_GET(self):
        endereco, familia = origem(self.client_address[0])
        corpo = (
            "quem respondeu : no %s (%s)\n"
            "zona           : %s\n"
            "quem perguntou : %s\n"
            "protocolo      : %s\n"
        ) % (IDENTIDADE.get("papel", "?"), IDENTIDADE.get("instancia", "?"),
             IDENTIDADE.get("az", "?"), endereco, familia)
        corpo = corpo.encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "text/plain; charset=utf-8")
        self.send_header("Content-Length", str(len(corpo)))
        self.end_headers()
        self.wfile.write(corpo)

    def log_message(self, *args):
        pass  # silencia o log padrao, que poluiria o terminal


class ServidorDePilhaDupla(http.server.ThreadingHTTPServer):
    address_family = socket.AF_INET6

    def server_bind(self):
        self.socket.setsockopt(socket.IPPROTO_IPV6, socket.IPV6_V6ONLY, 0)
        http.server.ThreadingHTTPServer.server_bind(self)


if __name__ == "__main__":
    ServidorDePilhaDupla(("::", 8080), Manipulador).serve_forever()
PY

# ============================================================
# rede.py - os enderecos deste no em tres linhas (atalho "sd-rede")
# ============================================================
cat > /opt/sd/rede.py <<'PY'
#!/usr/bin/env python3
"""Imprime os enderecos deste no em tres linhas limpas.

A primeira linha diz quem e o no, a segunda o que ele tem de IPv4 e a
terceira o que ele tem de IPv6. Quem responde e o proprio kernel, pelo
comando "ip addr": o servico de metadados entra so para o nome do no, a
zona e o endereco publico, que sao coisas que a interface nao conhece.
"""
import subprocess


def identidade():
    dados = {}
    try:
        with open("/opt/sd/identidade.txt", "r") as arquivo:
            for linha in arquivo:
                if "=" in linha:
                    chave, valor = linha.strip().split("=", 1)
                    dados[chave] = valor
    except OSError:
        pass
    return dados


def enderecos(familia):
    """Enderecos de alcance global da interface, um por elemento."""
    try:
        saida = subprocess.run(
            ["ip", "-o", familia, "addr", "show", "scope", "global"],
            capture_output=True, text=True, timeout=5).stdout
    except (OSError, subprocess.SubprocessError):
        return []
    achados = []
    for linha in saida.splitlines():
        campos = linha.split()
        if len(campos) > 3:
            achados.append(campos[3])
    return achados


def principal():
    dados = identidade()
    print("no    : %s   instancia %s   zona %s" % (
        dados.get("papel", "?"), dados.get("instancia", "?"),
        dados.get("az", "?")))
    publico = dados.get("ipv4_publico", "")
    print("IPv4  : %s   %s" % (
        ", ".join(enderecos("-4")) or "nenhum",
        ("publico " + publico) if publico else "SEM endereco publico"))
    print("IPv6  : %s" % (", ".join(enderecos("-6")) or "nenhum"))


if __name__ == "__main__":
    principal()
PY

# ---- Atalho "sd-rede", para o aluno nao decorar caminho de arquivo ----
printf '#!/bin/bash\nexec /usr/bin/python3 /opt/sd/rede.py "$@"\n' > /usr/local/bin/sd-rede
chmod +x /usr/local/bin/sd-rede /opt/sd/servico.py /opt/sd/rede.py

# ---- Servico gerenciado pelo systemd (sobe no boot, reinicia se cair) ----
cat > /etc/systemd/system/sd-servico.service <<'UNIT'
[Unit]
Description=Servico da Pratica 03 (Sistemas Distribuidos)
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

echo "pratica 03: no $PAPEL pronto em $(date -Is)" >> /opt/sd/identidade.txt
