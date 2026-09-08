#!/bin/bash
# ============================================================
# Pratica 04 (Topico 4) - Sistemas Distribuidos - IFSP Salto
# Script de inicializacao dos tres nos (campo "User data" do EC2).
# Roda uma unica vez, no primeiro boot da instancia.
#
# O MESMO texto sobe nos tres nos. O papel (A, B ou C) nao vem
# escrito aqui: ele e lido da etiqueta Name da propria instancia,
# pelo servico de metadados, porque os tres nascem com
# InstanceMetadataTags=enabled. Assim nao existem tres versoes
# deste arquivo para manter em acordo.
#
# Quem cola este texto no campo User data e o preparar-ambiente.py,
# que roda no seu computador. Voce nao precisa colar nada a mao.
#
# Sem acentos de proposito: o user data executa antes do locale
# estar definido. Testado em Amazon Linux 2023 (python3 da base).
# ============================================================
set -x
exec > /var/log/sd-setup.log 2>&1

mkdir -p /opt/sd

# ---- Identidade do no, lida do servico de metadados da instancia ----
# 169.254.169.254 e um endereco de link local: responde apenas dentro
# da propria instancia e nao consome rota nenhuma da VPC.
TOKEN=$(curl -s -X PUT "http://169.254.169.254/latest/api/token" \
  -H "X-aws-ec2-metadata-token-ttl-seconds: 300")
NOME=$(curl -s -H "X-aws-ec2-metadata-token: $TOKEN" \
  http://169.254.169.254/latest/meta-data/tags/instance/Name)
PAPEL=${NOME#sd04-}
echo "$PAPEL" > /opt/sd/papel
hostnamectl set-hostname "$NOME"

dnf install -y python3-pip docker

# ---- Ambiente Python isolado, com as duas bibliotecas da pratica ----
# pika fala AMQP com o gerenciador de filas; protobuf faz o formato
# binario do experimento de empacotamento. Versoes fixas de proposito,
# porque uma atualizacao no meio do semestre mudaria a medida da turma.
python3 -m venv /opt/sd/venv
/opt/sd/venv/bin/pip install --disable-pip-version-check pika==1.3.2 protobuf==5.29.5
chmod 755 /opt/sd
chmod -R a+rX /opt/sd/venv

cat > /opt/sd/experimentos.py <<'PY'
"""Programas da pratica 04. Rodam nas EC2, sem credencial da AWS.

Um registro de sensor atravessa os quatro experimentos. O que muda de
um para o outro e o caminho que ele percorre, nunca o dado em si.
"""

import argparse
import base64
import json
import socket
import socketserver
import time
from concurrent.futures import ThreadPoolExecutor

# Enderecos privados fixados pelo preparar-ambiente.py, para que os
# comandos do roteiro sejam iguais em todas as maquinas da turma.
NO_B = "10.44.0.20"
NO_C = "10.44.0.30"
PORTA = 9104
FILA = "sd04-leituras"

# Credencial do gerenciador de filas. Ela e fixa e esta a vista de
# proposito, porque a porta 5672 so aceita conexao vinda do proprio
# grupo de seguranca. Quem alcanca o gerenciador ja esta dentro do seu
# ambiente. Em producao isto seria erro grave, e o roteiro explica por que.
USUARIO_FILA = "sd"
SENHA_FILA = "sd-pratica04"

MAX_FRAME = 1024 * 1024


def recv_exact(sock, size):
    parts = bytearray()
    while len(parts) < size:
        chunk = sock.recv(size - len(parts))
        if not chunk:
            raise EOFError("Conexao encerrada com quadro incompleto")
        parts.extend(chunk)
    return bytes(parts)


def recv_frame(sock):
    """Le um quadro precedido de 4 bytes de comprimento.

    O TCP entrega uma sequencia de bytes, nunca mensagens. Sem esta
    moldura, duas leituras poderiam chegar grudadas numa recv so, ou
    uma delas partida em duas.
    """
    size = int.from_bytes(recv_exact(sock, 4), "big")
    if size > MAX_FRAME:
        raise ValueError("Quadro acima de 1 MiB")
    return recv_exact(sock, size)


def send_frame(sock, data):
    if len(data) > MAX_FRAME:
        raise ValueError("Quadro acima de 1 MiB")
    sock.sendall(len(data).to_bytes(4, "big") + data)


def message_class(version):
    """Monta em memoria o esquema Protocol Buffers da versao pedida.

    v1 tem tres campos. v2 acrescenta unidade, e e o caso de campo novo.
    incompativel reaproveita a etiqueta 3 com outro significado, que e o
    erro que o formato binario nao tem como perceber.
    """
    from google.protobuf import descriptor_pb2, descriptor_pool, message_factory
    descriptor = descriptor_pb2.FileDescriptorProto(name="sensor.proto", syntax="proto3")
    message = descriptor.message_type.add(name="Leitura")
    fields = [("id", 1, 5), ("sensor", 2, 9),
              ("umidade_mili" if version == "incompativel" else "temperatura_mili", 3, 5)]
    if version == "v2":
        fields.append(("unidade", 4, 9))
    for name, number, kind in fields:
        message.field.add(name=name, number=number, type=kind, label=1)
    pool = descriptor_pool.DescriptorPool()
    pool.Add(descriptor)
    return message_factory.GetMessageClass(pool.FindMessageTypeByName("Leitura"))


def encode(record, fmt="json", version="v1"):
    if fmt == "json":
        return json.dumps(record, ensure_ascii=False, separators=(",", ":")).encode("utf-8")
    cls = message_class(version)
    names = {field.name for field in cls.DESCRIPTOR.fields}
    return cls(**{key: value for key, value in record.items() if key in names}).SerializeToString()


def decode(data, fmt="json", version="v1"):
    if fmt == "json":
        return json.loads(data)
    message = message_class(version)()
    message.ParseFromString(data)
    return {field.name: getattr(message, field.name) for field in message.DESCRIPTOR.fields}


def record(number):
    return {"id": number, "sensor": "sala-1", "temperatura_mili": 23500, "unidade": "C"}


def process(envelope, args):
    envelope = json.loads(envelope)
    reading = decode(base64.b64decode(envelope["payload"]), envelope["format"], args.schema)
    print(json.dumps({"recebido": reading}, ensure_ascii=False), flush=True)
    time.sleep(args.delay)
    return json.dumps({"processado": reading}, ensure_ascii=False).encode("utf-8")


def serve(args):
    class TCPHandler(socketserver.BaseRequestHandler):
        def handle(self):
            self.request.settimeout(10)
            try:
                send_frame(self.request, process(recv_frame(self.request), args))
            except (OSError, EOFError, ValueError) as error:
                print(json.dumps({"erro": type(error).__name__}), flush=True)

    class UDPHandler(socketserver.BaseRequestHandler):
        def handle(self):
            data, sock = self.request
            try:
                sock.sendto(process(data, args), self.client_address)
            except (OSError, ValueError) as error:
                print(json.dumps({"erro": type(error).__name__}), flush=True)

    base = socketserver.TCPServer if args.protocol == "tcp" else socketserver.UDPServer
    if args.concurrent:
        class Server(socketserver.ThreadingMixIn, base):
            daemon_threads = True
            allow_reuse_address = True
    else:
        class Server(base):
            allow_reuse_address = True
    with Server(("0.0.0.0", args.port), TCPHandler if args.protocol == "tcp" else UDPHandler) as server:
        server.max_packet_size = 65535
        print(json.dumps({"pronto": True, "protocolo": args.protocol, "porta": args.port}), flush=True)
        server.serve_forever()


def send(args):
    def one(number):
        payload = encode(record(number), args.format, args.schema)
        envelope = json.dumps({"format": args.format,
                               "payload": base64.b64encode(payload).decode("ascii")}).encode("ascii")
        start = time.perf_counter()
        result = {"id": number, "bytes_payload": len(payload)}
        try:
            if args.protocol == "tcp":
                with socket.create_connection((args.host, args.port), timeout=args.timeout) as sock:
                    send_frame(sock, envelope)
                    result["resposta"] = json.loads(recv_frame(sock))
            else:
                with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as sock:
                    sock.settimeout(args.timeout)
                    sock.sendto(envelope, (args.host, args.port))
                    if args.wait:
                        result["resposta"] = json.loads(sock.recvfrom(65535)[0])
                    else:
                        result["submetido_localmente"] = True
        except (OSError, EOFError) as error:
            result["erro"] = type(error).__name__
        result["ms"] = round((time.perf_counter() - start) * 1000, 3)
        return result
    start = time.perf_counter()
    with ThreadPoolExecutor(max_workers=args.clients) as pool:
        results = list(pool.map(one, range(1, args.count + 1)))
    print(json.dumps({"resultados": results, "total_ms": round((time.perf_counter()-start)*1000, 3)}))
    return int(any("erro" in result for result in results))


def queue_action(args):
    import pika
    connection = pika.BlockingConnection(pika.ConnectionParameters(
        host=NO_B, credentials=pika.PlainCredentials(USUARIO_FILA, SENHA_FILA),
        connection_attempts=3, retry_delay=2, socket_timeout=5, blocked_connection_timeout=15))
    try:
        channel = connection.channel()
        # durable=True e a metade do acordo. A outra e delivery_mode=2 em
        # cada mensagem publicada, mais abaixo. Uma sem a outra nao preserva.
        status = channel.queue_declare(queue=FILA, durable=True, auto_delete=False)
        if args.action == "fila":
            print(json.dumps({"prontas": status.method.message_count,
                              "consumidores": status.method.consumer_count}))
        elif args.action == "publicar":
            channel.confirm_delivery()
            start = time.perf_counter()
            ids = list(range(1, args.count + 1))
            for number in ids:
                channel.basic_publish(exchange="", routing_key=FILA, mandatory=True,
                                      body=encode(record(number)),
                                      properties=pika.BasicProperties(delivery_mode=2, content_type="application/json"))
            print(json.dumps({"confirmados_pelo_broker": ids,
                              "ms": round((time.perf_counter()-start)*1000, 3)}))
        elif args.action == "consumir":
            ids = []
            deadline = time.monotonic() + args.timeout
            while len(ids) < args.count and time.monotonic() < deadline:
                method, _, body = channel.basic_get(queue=FILA, auto_ack=False)
                if method is None:
                    time.sleep(.2)
                    continue
                reading = decode(body)
                ids.append(reading["id"])
                channel.basic_ack(method.delivery_tag)
            print(json.dumps({"consumidos_e_confirmados": ids}))
            return int(len(ids) != args.count)
    finally:
        connection.close()
    return 0


def main():
    parser = argparse.ArgumentParser(description="Programas da pratica 04")
    parser.add_argument("action", choices=["servir", "enviar", "formatos", "publicar", "consumir", "fila"])
    parser.add_argument("--host", default=NO_C)
    parser.add_argument("--port", type=int, default=PORTA)
    parser.add_argument("--protocol", choices=["tcp", "udp"], default="tcp")
    parser.add_argument("--format", choices=["json", "protobuf"], default="json")
    parser.add_argument("--schema", choices=["v1", "v2", "incompativel"], default="v1")
    parser.add_argument("--delay", type=float, default=0)
    parser.add_argument("--concurrent", action="store_true")
    parser.add_argument("--wait", action="store_true")
    parser.add_argument("--count", type=int, default=5)
    parser.add_argument("--clients", type=int, default=1)
    parser.add_argument("--timeout", type=float, default=10)
    args = parser.parse_args()
    if args.action == "servir":
        serve(args)
    elif args.action == "enviar":
        return send(args)
    elif args.action == "formatos":
        reading = record(7)
        print(json.dumps({fmt: {"bytes": len(encode(reading, fmt, "v2")),
                               "leitor_v1": decode(encode(reading, fmt, "v2"), fmt, "v1")}
                          for fmt in ["json", "protobuf"]}))
    else:
        return queue_action(args)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
PY
chmod 644 /opt/sd/experimentos.py

# ---- Atalho sd04, para o roteiro nao repetir o caminho do venv ----
cat > /usr/local/bin/sd04 <<'SH'
#!/bin/bash
exec /opt/sd/venv/bin/python /opt/sd/experimentos.py "$@"
SH
chmod 755 /usr/local/bin/sd04

# ---- So o no B carrega o gerenciador de filas ----
# A imagem vai fixada pelo digest, e nao pela etiqueta 4-management: a
# etiqueta muda de conteudo quando o projeto publica uma versao nova, e
# a turma passaria a medir coisas diferentes na mesma semana.
if [ "$PAPEL" = B ]; then
  systemctl enable --now docker
  printf 'RABBITMQ_DEFAULT_USER=sd\nRABBITMQ_DEFAULT_PASS=sd-pratica04\n' > /opt/sd/rabbit.env
  chmod 600 /opt/sd/rabbit.env
  IMAGEM=rabbitmq@sha256:ffd1b50c522ad20172ffd6716a2f41db375c7269560c8f3fb9a694e210ef0852
  docker pull "$IMAGEM"
  # O -p amarra a porta ao IP privado, nunca a 0.0.0.0. Quem sustenta o
  # docker restart do passo 7.3 sao a fila duravel e a mensagem persistente,
  # porque a camada gravavel do conteiner sobrevive a parar e iniciar. O
  # volume nomeado protege outra coisa: recriar o conteiner ou trocar a imagem.
  docker run -d --name sd04-rabbit --hostname sd04-b --restart unless-stopped \
    --env-file /opt/sd/rabbit.env -p 10.44.0.20:5672:5672 \
    -v sd04-rabbit-data:/var/lib/rabbitmq "$IMAGEM"
  pronto=0
  for tentativa in {1..90}; do
    if docker exec sd04-rabbit rabbitmq-diagnostics -q ping; then pronto=1; break; fi
    sleep 2
  done
  # Sem "set -e", um teste solto nao interrompe nada: o script seguiria para
  # o PRONTO abaixo e anunciaria o no B instalado sem gerenciador de filas,
  # e a falha so apareceria no passo 7. Por isso o desfecho vai para arquivo.
  if [ "$pronto" != 1 ]; then
    echo 'o gerenciador de filas nao respondeu em 180s' > /opt/sd/FALHOU
    echo 'SD04_SETUP_FALHOU'
    exit 1
  fi
fi

# O arquivo PRONTO e o que o preparar-ambiente.py espera aparecer. EC2 em
# running so diz que a maquina ligou, nunca que o software terminou de subir.
touch /opt/sd/PRONTO
echo 'SD04_SETUP_PRONTO'
