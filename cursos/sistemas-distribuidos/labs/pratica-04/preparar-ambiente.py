#!/usr/bin/env python3
# ============================================================
# Pratica 04 (Topico 4) - Sistemas Distribuidos - IFSP Salto
# Prepara o ambiente inteiro da pratica, no seu computador.
#
# Este arquivo unico atende Windows, macOS e Linux. Na pratica 03
# eram dois scripts gemeos, um por sistema, porque quem falava com
# a AWS era o AWS CLI dentro de um shell. Aqui quem fala e o proprio
# Python, pela biblioteca boto3, e a mesma linguagem roda nos tres.
#
#   python preparar-ambiente.py            monta tudo
#   python preparar-ambiente.py --apagar   apaga tudo o que ele criou
#
# Ele constroi a rede, sobe os tres nos, espera o software terminar
# de instalar e imprime no fim o bloco que voce cola na ficha do
# roteiro. Cada passo e anunciado antes de acontecer.
#
# Sem acentos de proposito, porque o mesmo texto precisa sair
# legivel no terminal do macOS, no do Linux e no console do
# Windows, que nem sempre concordam sobre codificacao.
# ============================================================
"""Provisionador da pratica 04, com chamadas diretas as APIs da AWS."""

import argparse
import configparser
import getpass
import ipaddress
import json
import sys
import time
from pathlib import Path
from urllib.request import urlopen

PERFIL = "sd-sandbox"
REGIAO = "us-east-1"
PROJETO = "sd-pratica04"

CIDR_VPC = "10.44.0.0/16"
CIDR_SUB = "10.44.0.0/24"
# Enderecos privados fixos. Sem isto, cada aluno teria endereco
# diferente e o roteiro precisaria de uma variavel a mais em todo
# comando. O experimentos.py conhece estes mesmos numeros.
NOS = {"A": "10.44.0.10", "B": "10.44.0.20", "C": "10.44.0.30"}
TIPOS = {"A": "t3.micro", "B": "t3.small", "C": "t3.micro"}
PORTA_APP = 9104
PORTA_FILA = 5672

PASTA = Path.home() / "sd-pratica04"
ESTADO = PASTA / "identificadores.json"
ANTES = PASTA / "antes.txt"
AQUI = Path(__file__).resolve().parent


def titulo(texto):
    print("\n" + "=" * 60 + "\n " + texto + "\n" + "=" * 60, flush=True)


def diz(texto):
    print("  " + texto, flush=True)


def morre(texto):
    print("\nFALHA: " + texto, file=sys.stderr, flush=True)
    raise SystemExit(1)


# ------------------------------------------------------------
# Credencial. Ela vai para um perfil de nome proprio, nunca para
# o [default]. Escrever no default passaria por cima da configuracao
# de quem ja usa a AWS na propria maquina, e apagar depois ficaria
# impossivel de fazer sem risco. O modo --apagar remove este perfil.
# ------------------------------------------------------------
def arquivo_de_credenciais():
    return Path.home() / ".aws" / "credentials"


def gravar_perfil(chave, segredo, token):
    caminho = arquivo_de_credenciais()
    caminho.parent.mkdir(parents=True, exist_ok=True)
    dados = configparser.RawConfigParser()
    if caminho.exists():
        dados.read(caminho, encoding="utf-8")
    if not dados.has_section(PERFIL):
        dados.add_section(PERFIL)
    dados.set(PERFIL, "aws_access_key_id", chave)
    dados.set(PERFIL, "aws_secret_access_key", segredo)
    dados.set(PERFIL, "aws_session_token", token)
    with open(caminho, "w", encoding="utf-8") as saida:
        dados.write(saida)
    try:
        caminho.chmod(0o600)
    except OSError:
        pass  # Windows ignora o modo do arquivo; a ACL do perfil ja restringe.


def apagar_perfil():
    caminho = arquivo_de_credenciais()
    if not caminho.exists():
        return
    dados = configparser.RawConfigParser()
    dados.read(caminho, encoding="utf-8")
    if dados.remove_section(PERFIL):
        with open(caminho, "w", encoding="utf-8") as saida:
            dados.write(saida)
        diz("perfil " + PERFIL + " removido de " + str(caminho))


def perguntar_credencial():
    diz("Abra o laboratorio no AWS Academy, clique em Details e depois em Show.")
    diz("Copie os tres valores do bloco de credencial, um de cada vez.")
    diz("Os dois ultimos sao secretos, entao nao aparecem enquanto voce cola.")
    diz("Isso e proposital, e e o mesmo comportamento de uma senha no terminal.")
    print()
    chave = input("  aws_access_key_id     : ").strip()
    segredo = getpass.getpass("  aws_secret_access_key : ").strip()
    token = getpass.getpass("  aws_session_token     : ").strip()
    if not chave:
        morre("o aws_access_key_id veio vazio")
    if not segredo:
        morre("o aws_secret_access_key veio vazio")
    if not token:
        morre("o aws_session_token veio vazio. Ele e obrigatorio, porque a"
              " credencial do laboratorio e temporaria")
    gravar_perfil(chave, segredo, token)
    diz("credencial gravada no perfil " + PERFIL)


def sessao():
    try:
        import boto3
    except ImportError:
        morre("a biblioteca boto3 nao esta instalada. Rode"
              " 'python -m pip install boto3' e tente de novo")
    def abrir():
        return boto3.Session(profile_name=PERFIL, region_name=REGIAO)
    try:
        sdk = abrir()
        sdk.client("sts").get_caller_identity()
        diz("usando o perfil " + PERFIL + ", que ja estava configurado e ainda vale")
        return sdk
    except Exception:
        titulo("credencial do laboratorio")
        perguntar_credencial()
    sdk = abrir()
    try:
        sdk.client("sts").get_caller_identity()
    except Exception as erro:
        morre("a credencial nao foi aceita pela AWS (" + type(erro).__name__ + ")."
              " Confira se copiou os tres valores inteiros e se a sessao do"
              " laboratorio ainda esta ligada")
    return sdk


# ------------------------------------------------------------
# Etiquetas. Todo recurso nasce com Project e Name, e a limpeza so
# apaga o que tem as duas. E o que impede o programa de encostar
# nas duas instancias que o laboratorio ja tem quando voce abre.
# ------------------------------------------------------------
def etiquetas(tipo, nome):
    return [{"ResourceType": tipo, "Tags": [{"Key": "Project", "Value": PROJETO},
                                            {"Key": "Name", "Value": nome}]}]


def filtro_do_projeto():
    return [{"Name": "tag:Project", "Values": [PROJETO]}]


def e_meu(recurso):
    marcas = {t["Key"]: t["Value"] for t in recurso.get("Tags", [])}
    return marcas.get("Project") == PROJETO


def inventario(ec2):
    instancias = [i for pagina in ec2.get_paginator("describe_instances").paginate()
                  for r in pagina["Reservations"] for i in r["Instances"]
                  if i["State"]["Name"] != "terminated"]
    return {"instancias": [{"id": i["InstanceId"], "tipo": i["InstanceType"],
                            "estado": i["State"]["Name"], "minha": e_meu(i)}
                           for i in instancias],
            "vpcs": [v["VpcId"] for v in ec2.describe_vpcs()["Vpcs"]]}


def guardar(estado):
    PASTA.mkdir(parents=True, exist_ok=True)
    temporario = ESTADO.with_suffix(".tmp")
    temporario.write_text(json.dumps(estado, indent=2), encoding="utf-8")
    temporario.replace(ESTADO)


def meu_ip():
    try:
        with urlopen("https://checkip.amazonaws.com", timeout=10) as resposta:
            return str(ipaddress.IPv4Address(resposta.read().decode().strip())) + "/32"
    except Exception:
        morre("nao consegui descobrir o IP publico desta maquina. Rode de novo"
              " com --ssh-cidr SEU.IP.AQUI/32, consultando o valor em"
              " https://checkip.amazonaws.com")


# ------------------------------------------------------------
# Criacao
# ------------------------------------------------------------
def criar(sdk, ssh_cidr):
    if ESTADO.exists():
        morre("ja existe um ambiente desta pratica criado por este programa ("
              + str(ESTADO) + "). Rode com --apagar antes, para nao ficar com"
              " duas redes iguais e nenhuma explicacao")
    ec2 = sdk.client("ec2")
    conta = sdk.client("sts").get_caller_identity()["Account"]

    titulo("como a sua conta esta agora, antes de criar qualquer coisa")
    antes = inventario(ec2)
    diz("instancias ja existentes: " + str(len(antes["instancias"])))
    diz("VPCs ja existentes: " + str(len(antes["vpcs"])))
    PASTA.mkdir(parents=True, exist_ok=True)
    ANTES.write_text(json.dumps(antes, indent=2), encoding="utf-8")
    diz("foto guardada em " + str(ANTES))
    if len(antes["instancias"]) + 3 > 9:
        morre("o Sandbox permite 9 instancias e nao sobra espaco para as tres"
              " desta pratica. Apague o que voce criou em praticas anteriores")
    if len(antes["vpcs"]) >= 5:
        morre("a conta ja esta nas 5 VPCs que a regiao permite. Apague uma rede"
              " de pratica anterior antes de continuar")
    if any(i["minha"] for i in antes["instancias"]):
        morre("ha instancia com a etiqueta " + PROJETO + " nesta conta e nenhum"
              " arquivo de estado aqui. Apague-a pelo console antes de continuar")

    rede = ipaddress.ip_network(ssh_cidr)
    if rede.version != 4 or rede.prefixlen != 32:
        morre("o endereco de SSH precisa ser um IPv4 com /32")

    titulo("escolhendo a imagem e a zona")
    imagens = ec2.describe_images(Owners=["amazon"], Filters=[
        {"Name": "name", "Values": ["al2023-ami-2023.*-x86_64"]},
        {"Name": "state", "Values": ["available"]},
        {"Name": "root-device-type", "Values": ["ebs"]}])["Images"]
    if not imagens:
        morre("nenhuma imagem do Amazon Linux 2023 foi encontrada em " + REGIAO)
    imagem = max(imagens, key=lambda i: i["CreationDate"])
    zonas = ec2.describe_availability_zones(
        Filters=[{"Name": "state", "Values": ["available"]}])["AvailabilityZones"]
    zona = sorted(z["ZoneName"] for z in zonas if z["ZoneType"] == "availability-zone")[0]
    diz("imagem " + imagem["ImageId"] + ", zona " + zona)

    estado = {"projeto": PROJETO, "conta": conta, "regiao": REGIAO, "zona": zona,
              "ami": imagem["ImageId"], "ssh_cidr": ssh_cidr,
              "criado_em": time.strftime("%Y-%m-%dT%H:%M:%S"), "nos": {}}
    guardar(estado)

    def lembrar(chave, valor, rotulo):
        estado[chave] = valor
        guardar(estado)
        diz(rotulo + " " + valor)
        return valor

    titulo("montando a rede")
    # Cada identificador e gravado assim que nasce. Se a criacao parar no
    # meio, o --apagar encontra o que ja existe e remove tudo mesmo assim.
    vpc = lembrar("vpc", ec2.create_vpc(
        CidrBlock=CIDR_VPC, TagSpecifications=etiquetas("vpc", "sd04-vpc"))["Vpc"]["VpcId"],
        "VPC criada:")
    ec2.get_waiter("vpc_available").wait(VpcIds=[vpc])
    ec2.modify_vpc_attribute(VpcId=vpc, EnableDnsSupport={"Value": True})
    ec2.modify_vpc_attribute(VpcId=vpc, EnableDnsHostnames={"Value": True})
    subrede = lembrar("subrede", ec2.create_subnet(
        VpcId=vpc, CidrBlock=CIDR_SUB, AvailabilityZone=zona,
        TagSpecifications=etiquetas("subnet", "sd04-subrede"))["Subnet"]["SubnetId"],
        "sub-rede criada:")
    gateway = lembrar("gateway", ec2.create_internet_gateway(
        TagSpecifications=etiquetas("internet-gateway", "sd04-igw")
        )["InternetGateway"]["InternetGatewayId"], "gateway de internet criado:")
    ec2.attach_internet_gateway(VpcId=vpc, InternetGatewayId=gateway)
    rota = lembrar("rota", ec2.create_route_table(
        VpcId=vpc, TagSpecifications=etiquetas("route-table", "sd04-rotas")
        )["RouteTable"]["RouteTableId"], "tabela de rotas criada:")
    ec2.create_route(RouteTableId=rota, DestinationCidrBlock="0.0.0.0/0", GatewayId=gateway)
    lembrar("associacao", ec2.associate_route_table(
        RouteTableId=rota, SubnetId=subrede)["AssociationId"], "tabela associada:")

    grupo = lembrar("grupo", ec2.create_security_group(
        VpcId=vpc, GroupName="sd04-nos",
        Description="Nos da pratica 04 e SSH do computador do aluno",
        TagSpecifications=etiquetas("security-group", "sd04-nos"))["GroupId"],
        "grupo de seguranca criado:")
    # SSH so do seu endereco. As portas da aplicacao e da fila so aceitam
    # trafego de quem esta no mesmo grupo, ou seja, dos proprios nos.
    ec2.authorize_security_group_ingress(GroupId=grupo, IpPermissions=[
        {"IpProtocol": "tcp", "FromPort": 22, "ToPort": 22,
         "IpRanges": [{"CidrIp": ssh_cidr, "Description": "SSH do aluno"}]},
        {"IpProtocol": "tcp", "FromPort": PORTA_FILA, "ToPort": PORTA_FILA,
         "UserIdGroupPairs": [{"GroupId": grupo}]},
        {"IpProtocol": "tcp", "FromPort": PORTA_APP, "ToPort": PORTA_APP,
         "UserIdGroupPairs": [{"GroupId": grupo}]},
        {"IpProtocol": "udp", "FromPort": PORTA_APP, "ToPort": PORTA_APP,
         "UserIdGroupPairs": [{"GroupId": grupo}]}])
    diz("SSH liberado apenas para " + ssh_cidr)

    titulo("subindo os tres nos")
    user_data = (AQUI / "setup.sh").read_text(encoding="utf-8")
    for papel in ("B", "A", "C"):
        resultado = ec2.run_instances(
            ImageId=imagem["ImageId"], MinCount=1, MaxCount=1,
            InstanceType=TIPOS[papel], KeyName="vockey",
            IamInstanceProfile={"Name": "LabInstanceProfile"},
            # InstanceMetadataTags e o que permite ao setup.sh descobrir o
            # proprio papel lendo a etiqueta Name. Sem isto, o mesmo texto
            # nao poderia servir aos tres nos.
            MetadataOptions={"HttpTokens": "required", "HttpEndpoint": "enabled",
                             "InstanceMetadataTags": "enabled"},
            BlockDeviceMappings=[{"DeviceName": imagem["RootDeviceName"],
                                  "Ebs": {"VolumeSize": 8, "VolumeType": "gp2",
                                          "DeleteOnTermination": True}}],
            NetworkInterfaces=[{"DeviceIndex": 0, "SubnetId": subrede, "Groups": [grupo],
                                "PrivateIpAddress": NOS[papel],
                                "AssociatePublicIpAddress": True,
                                "DeleteOnTermination": True}],
            UserData=user_data,
            TagSpecifications=etiquetas("instance", "sd04-" + papel)
                              + etiquetas("volume", "sd04-" + papel + "-disco"))
        estado["nos"][papel] = {"id": resultado["Instances"][0]["InstanceId"],
                                "privado": NOS[papel]}
        guardar(estado)
        diz("no " + papel + " (" + TIPOS[papel] + ") iniciando em " + NOS[papel])

    identificadores = [no["id"] for no in estado["nos"].values()]
    diz("esperando as tres maquinas ligarem")
    ec2.get_waiter("instance_running").wait(
        InstanceIds=identificadores, WaiterConfig={"Delay": 5, "MaxAttempts": 60})
    for papel, no in estado["nos"].items():
        info = ec2.describe_instances(InstanceIds=[no["id"]])["Reservations"][0]["Instances"][0]
        no["publico"] = info.get("PublicIpAddress")
    guardar(estado)
    diz("as tres estao ligadas")

    esperar_software(sdk, estado)
    ficha(estado)


def esperar_software(sdk, estado, limite=420):
    """Espera o setup.sh terminar, perguntando pelo Systems Manager.

    Uma EC2 em running so afirma que a maquina ligou. O software desta
    pratica leva mais de um minuto depois disso, e o arquivo PRONTO e o
    que separa uma coisa da outra. O setup.sh grava FALHOU no lugar dele
    quando o gerenciador de filas nao sobe, e perguntar pelos dois evita
    esperar o prazo inteiro por um no que ja desistiu. Se o canal
    administrativo nao responder, o programa avisa e segue, em vez de
    travar a pratica.
    """
    titulo("esperando o software terminar de instalar")
    diz("a maquina ligar nao e a mesma coisa que o programa estar instalado")
    ssm = sdk.client("ssm")
    faltam = dict(estado["nos"])
    falharam = []
    prazo = time.monotonic() + limite
    while faltam and time.monotonic() < prazo:
        for papel, no in list(faltam.items()):
            try:
                envio = ssm.send_command(
                    InstanceIds=[no["id"]], DocumentName="AWS-RunShellScript",
                    TimeoutSeconds=60,
                    Parameters={"commands": [
                        "if [ -f /opt/sd/FALHOU ]; then echo SD04_FALHOU;"
                        " elif [ -f /opt/sd/PRONTO ]; then echo SD04_PRONTO;"
                        " else echo SD04_ESPERANDO; fi"]})
            except Exception:
                continue  # O agente ainda nao se registrou nesta instancia.
            identificador = envio["Command"]["CommandId"]
            for _ in range(20):
                time.sleep(1)
                try:
                    saida = ssm.get_command_invocation(
                        CommandId=identificador, InstanceId=no["id"])
                except Exception:
                    continue
                if saida["Status"] in ("Pending", "InProgress", "Delayed"):
                    continue
                if saida["Status"] == "Success":
                    marca = (saida.get("StandardOutputContent") or "").strip()
                    if marca == "SD04_PRONTO":
                        faltam.pop(papel, None)
                        diz("no " + papel + " pronto")
                    elif marca == "SD04_FALHOU":
                        faltam.pop(papel, None)
                        falharam.append(papel)
                        diz("no " + papel + " FALHOU na instalacao. Entre nele por"
                            " SSH e veja /opt/sd/FALHOU e /var/log/sd-setup.log")
                break
        if faltam:
            time.sleep(5)
    # Um no que falhou sai de "faltam", entao sem esta separacao o programa
    # anunciaria os tres prontos logo depois de dizer que um deles falhou.
    if falharam:
        diz("a instalacao FALHOU em " + ", ".join(sorted(falharam)) + ". O passo 7"
            " nao vai funcionar assim: apague o ambiente e crie de novo")
    if faltam:
        diz("nao consegui confirmar " + ", ".join(sorted(faltam)) + " pelo canal"
            " administrativo. Entre por SSH e leia /var/log/sd-setup.log")
    elif not falharam:
        diz("os tres nos terminaram a instalacao")


def ficha(estado):
    titulo("ficha do ambiente")
    linhas = ["IP_PUB_%s=%s" % (papel, estado["nos"][papel].get("publico"))
              for papel in ("A", "B", "C")]
    (PASTA / "ficha.txt").write_text("\n".join(linhas) + "\n", encoding="utf-8")
    diz("Copie o bloco abaixo inteiro e cole na ficha do roteiro, no campo")
    diz("de colar. Ele tambem ficou guardado em " + str(PASTA / "ficha.txt"))
    print()
    for linha in linhas:
        print(linha)
    print()
    diz("Os enderecos privados sao sempre os mesmos, entao o roteiro os")
    diz("escreve direto: A e 10.44.0.10, B e 10.44.0.20 e C e 10.44.0.30.")


# ------------------------------------------------------------
# Limpeza
# ------------------------------------------------------------
def apagar(sdk):
    # Desistir sem tirar a credencial local era o unico ponto em que a limpeza
    # nao cumpria o que anuncia. O roteiro manda apagar o arquivo de estado
    # quando a sessao do Sandbox morre no meio, e depois disso todo --apagar
    # recusava, deixando chave, segredo e token no ~/.aws/credentials de uma
    # maquina de laboratorio. O perfil sai so aqui, nunca antes do trabalho:
    # a sessao ja resolveu a credencial, mas remove-la no inicio deixaria a
    # propria limpeza dependendo de um cache que este programa nao controla.
    def desiste(mensagem):
        apagar_perfil()
        morre(mensagem)

    if not ESTADO.exists():
        desiste("nao encontrei " + str(ESTADO) + ", entao este programa nao criou"
                " nada nesta maquina. Se voce criou o ambiente em outro"
                " computador, apague por la ou pelo console da AWS")
    estado = json.loads(ESTADO.read_text(encoding="utf-8"))
    conta = sdk.client("sts").get_caller_identity()["Account"]
    if estado.get("conta") != conta or estado.get("regiao") != REGIAO:
        desiste("o ambiente guardado aqui pertence a outra conta ou regiao. Nao"
                " vou apagar nada. Confira se abriu o laboratorio certo")
    ec2 = sdk.client("ec2")

    titulo("conferindo o que sera apagado")
    # Tudo e descoberto pela etiqueta, e nao so pelo arquivo local. Assim a
    # limpeza alcanca o que ficou de uma criacao interrompida no meio.
    vpcs = ec2.describe_vpcs(Filters=filtro_do_projeto())["Vpcs"]
    instancias = [i for r in ec2.describe_instances(
        Filters=filtro_do_projeto())["Reservations"] for i in r["Instances"]
        if i["State"]["Name"] != "terminated"]
    subredes = ec2.describe_subnets(Filters=filtro_do_projeto())["Subnets"]
    rotas = ec2.describe_route_tables(Filters=filtro_do_projeto())["RouteTables"]
    grupos = ec2.describe_security_groups(Filters=filtro_do_projeto())["SecurityGroups"]
    gateways = ec2.describe_internet_gateways(Filters=filtro_do_projeto())["InternetGateways"]
    if len(vpcs) > 1:
        morre("achei mais de uma VPC com a etiqueta " + PROJETO + ". Isso nao"
              " deveria acontecer, e prefiro nao apagar nada sem voce olhar")
    for recurso in vpcs + instancias + subredes + rotas + grupos + gateways:
        if not e_meu(recurso):
            morre("um recurso sem a etiqueta " + PROJETO + " entrou na lista."
                  " Limpeza recusada")
    if vpcs:
        dentro = [i for r in ec2.describe_instances(Filters=[
            {"Name": "vpc-id", "Values": [vpcs[0]["VpcId"]]}])["Reservations"]
            for i in r["Instances"] if i["State"]["Name"] != "terminated"]
        for maquina in dentro:
            if not e_meu(maquina):
                morre("ha uma instancia que nao e desta pratica dentro da VPC."
                      " Limpeza recusada, para nao derrubar o trabalho dela")
    diz("instancias a terminar: " + str(len(instancias)))
    diz("redes a apagar: " + str(len(vpcs)))

    titulo("apagando")
    identificadores = [i["InstanceId"] for i in instancias]
    if identificadores:
        ec2.terminate_instances(InstanceIds=identificadores)
        diz("esperando as instancias terminarem, o que leva cerca de um minuto")
        ec2.get_waiter("instance_terminated").wait(
            InstanceIds=identificadores, WaiterConfig={"Delay": 5, "MaxAttempts": 90})
        diz("instancias terminadas, e os discos delas foram junto")
    for tabela in rotas:
        for associacao in tabela["Associations"]:
            if not associacao["Main"]:
                ec2.disassociate_route_table(
                    AssociationId=associacao["RouteTableAssociationId"])
    for subrede in subredes:
        ec2.delete_subnet(SubnetId=subrede["SubnetId"])
        diz("sub-rede apagada: " + subrede["SubnetId"])
    for tabela in rotas:
        ec2.delete_route_table(RouteTableId=tabela["RouteTableId"])
        diz("tabela de rotas apagada: " + tabela["RouteTableId"])
    for grupo in grupos:
        ec2.delete_security_group(GroupId=grupo["GroupId"])
        diz("grupo de seguranca apagado: " + grupo["GroupId"])
    for gateway in gateways:
        for ligacao in gateway["Attachments"]:
            ec2.detach_internet_gateway(
                InternetGatewayId=gateway["InternetGatewayId"], VpcId=ligacao["VpcId"])
        ec2.delete_internet_gateway(InternetGatewayId=gateway["InternetGatewayId"])
        diz("gateway apagado: " + gateway["InternetGatewayId"])
    for vpc in vpcs:
        ec2.delete_vpc(VpcId=vpc["VpcId"])
        diz("VPC apagada: " + vpc["VpcId"])

    titulo("conferindo que nao sobrou nada")
    sobrou = {
        "instancias": [i["InstanceId"] for r in ec2.describe_instances(
            Filters=filtro_do_projeto())["Reservations"] for i in r["Instances"]
            if i["State"]["Name"] != "terminated"],
        "volumes": [v["VolumeId"] for v in ec2.describe_volumes(
            Filters=filtro_do_projeto())["Volumes"]],
        "grupos": [g["GroupId"] for g in ec2.describe_security_groups(
            Filters=filtro_do_projeto())["SecurityGroups"]],
        "vpcs": [v["VpcId"] for v in ec2.describe_vpcs(
            Filters=filtro_do_projeto())["Vpcs"]],
    }
    restante = {chave: valor for chave, valor in sobrou.items() if valor}
    if restante:
        morre("sobrou recurso com a etiqueta do projeto: " + json.dumps(restante)
              + ". Apague pelo console antes de fechar o laboratorio")
    diz("nenhum recurso desta pratica continua de pe")
    # A comparacao com a foto do passo 2 e informativa, e por isso nao pode
    # derrubar o que vem depois dela. Um desligamento no meio da pratica deixa
    # o antes.txt com o tamanho certo e o conteudo zerado, e foi assim que esta
    # limpeza morreu uma vez: apagou tudo na AWS e parou antes de tirar a
    # credencial da maquina. Tirar a credencial e justamente o habito que a
    # pratica ensina, num laboratorio de computadores compartilhados, entao ele
    # acontece mesmo quando a conferencia nao sai.
    try:
        antes = json.loads(ANTES.read_text(encoding="utf-8")) if ANTES.exists() else {}
        instancias_antes = antes.get("instancias", [])
        vpcs_antes = antes.get("vpcs", [])
        if instancias_antes or vpcs_antes:
            agora = inventario(ec2)
            atuais = [j["id"] for j in agora["instancias"]]
            faltando = ([i["id"] for i in instancias_antes if i["id"] not in atuais]
                        + [v for v in vpcs_antes if v not in agora["vpcs"]])
            if faltando:
                diz("ATENCAO: recurso que ja existia antes sumiu: " + ", ".join(faltando))
            else:
                diz("o que ja existia antes da pratica continua igual")
    except Exception:
        diz("nao consegui comparar com a foto que o passo 2 guardou em "
            + str(ANTES) + ", entao pulei essa conferencia. A varredura por"
            " etiqueta acima ja disse que nada desta pratica ficou de pe")

    # O perfil sai antes de arquivar o estado, porque o trabalho na AWS acabou
    # e nenhum passo daqui para baixo pode adiar a remocao da credencial.
    apagar_perfil()
    ESTADO.replace(PASTA / ("encerrado-" + time.strftime("%Y%m%d-%H%M%S") + ".json"))
    titulo("pronto")
    diz("Feche tambem a sessao do laboratorio no AWS Academy.")


def main():
    analisador = argparse.ArgumentParser(description=__doc__)
    analisador.add_argument("--apagar", action="store_true",
                            help="apaga tudo o que este programa criou")
    analisador.add_argument("--ssh-cidr",
                            help="seu IPv4 com /32, quando a descoberta automatica falhar")
    argumentos = analisador.parse_args()
    sdk = sessao()
    if argumentos.apagar:
        apagar(sdk)
    else:
        criar(sdk, argumentos.ssh_cidr or meu_ip())
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
