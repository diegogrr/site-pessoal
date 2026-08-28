#!/bin/bash
# ============================================================
# Pratica 03 (Topico 3) - Sistemas Distribuidos - IFSP Salto
# Prepara o ambiente inteiro da pratica, no seu computador.
#
# Este e o script do macOS e do Linux. No Windows use o gemeo
# preparar-ambiente.ps1, que faz exatamente as mesmas coisas.
#
#   bash preparar-ambiente.sh            monta tudo
#   bash preparar-ambiente.sh --apagar   apaga tudo o que ele criou
#
# Ele constroi a rede que os experimentos usam, sobe os quatro nos
# e imprime no fim o bloco que voce cola na ficha do roteiro.
# Cada passo e anunciado antes de acontecer, para voce acompanhar
# o que esta sendo feito e por que.
#
# Sem acentos de proposito, porque o mesmo texto precisa sair
# legivel no terminal do macOS, no do Linux e no console do
# Windows, que nem sempre concordam sobre codificacao.
# ============================================================
set -u

BASE_PUBLICADA="https://diedu.com.br/cursos/sistemas-distribuidos/labs/pratica-03"
PERFIL="${SD_PERFIL:-sd-sandbox}"
REGIAO="us-east-1"
ZONA_A="us-east-1a"
ZONA_B="us-east-1b"
CIDR_VPC="10.10.0.0/16"
PASTA="$HOME/sd-pratica03"
FICHA="$PASTA/identificadores.env"
ANTES="$PASTA/antes.txt"

titulo() { printf '\n============================================================\n %s\n============================================================\n' "$1"; }
diz()    { printf '  %s\n' "$1"; }
morre()  { printf '\nFALHA: %s\n' "$1" >&2; exit 1; }
agora()  { date +%s; }

# ------------------------------------------------------------
# Credencial. Dois caminhos, nesta ordem.
# 1. O perfil sd-sandbox ja existe e ainda vale.
# 2. O perfil nao existe ou venceu, entao perguntamos os tres valores.
#
# O perfil tem nome proprio de proposito. Escrever em [default]
# passaria por cima da configuracao de quem ja usa a AWS na
# propria maquina, e apagar depois ficaria impossivel de fazer
# sem risco.
# ------------------------------------------------------------
autenticado() {
  aws sts get-caller-identity --output text >/dev/null 2>&1
}

perguntar_credencial() {
  diz "Abra o laboratorio no AWS Academy, clique em Details e depois em Show."
  diz "Copie os tres valores do bloco de credencial, um de cada vez."
  diz "Os dois ultimos sao secretos, entao nao aparecem enquanto voce cola."
  diz "Isso e proposital, e e o mesmo comportamento de uma senha no terminal."
  printf '\n'

  printf '  aws_access_key_id     : '
  read -r CHAVE
  printf '  aws_secret_access_key : '
  read -rs SEGREDO; printf '\n'
  printf '  aws_session_token     : '
  read -rs TOKEN; printf '\n'

  [ -n "$CHAVE" ]   || morre "o aws_access_key_id veio vazio"
  [ -n "$SEGREDO" ] || morre "o aws_secret_access_key veio vazio"
  [ -n "$TOKEN" ]   || morre "o aws_session_token veio vazio. Ele e obrigatorio, porque a credencial do laboratorio e temporaria"

  aws configure set aws_access_key_id     "$CHAVE"   --profile "$PERFIL"
  aws configure set aws_secret_access_key "$SEGREDO" --profile "$PERFIL"
  aws configure set aws_session_token     "$TOKEN"   --profile "$PERFIL"
  aws configure set region                "$REGIAO"  --profile "$PERFIL"
  unset CHAVE SEGREDO TOKEN
  diz "credencial gravada no perfil $PERFIL"
}

preparar_credencial() {
  command -v aws >/dev/null 2>&1 || morre \
    "o AWS CLI nao esta instalado. Instale por https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html e rode este script de novo"
  diz "AWS CLI encontrado, versao $(aws --version 2>&1)"

  export AWS_PROFILE="$PERFIL"
  export AWS_DEFAULT_REGION="$REGIAO"
  if autenticado; then
    diz "usando o perfil $PERFIL, que ja estava configurado e ainda vale"
  else
    titulo "credencial do laboratorio"
    perguntar_credencial
    autenticado || morre \
      "a credencial nao foi aceita. O caso comum e ela ter expirado, e a solucao e clicar em Start Lab de novo e copiar os tres valores outra vez"
  fi

  CONTA=$(aws sts get-caller-identity --query Account --output text)
  ARN=$(aws sts get-caller-identity --query Arn --output text)
  # So o papel e o usuario. O ARN inteiro carrega o numero da conta, e a
  # linha de baixo existe justamente para nao mostra-lo por extenso.
  diz "identidade confirmada: ${ARN##*:}"
  diz "conta terminada em ${CONTA#????????}, regiao $REGIAO"
}

# ------------------------------------------------------------
# Apagar, na ordem inversa da criacao
# ------------------------------------------------------------
id_da_vpc() {
  aws ec2 describe-vpcs --filters Name=tag:Name,Values=sd-vpc \
    Name=state,Values=available --query 'Vpcs[0].VpcId' --output text 2>/dev/null
}

apagar_tudo() {
  titulo "apagando o que a pratica 03 criou"
  VPC=$(id_da_vpc)
  VPC_APAGADA=1

  diz "encerrando as instancias"
  IDS=$(aws ec2 describe-instances \
    --filters "Name=tag:Name,Values=sd-P,sd-A,sd-B,sd-E" \
              "Name=instance-state-name,Values=pending,running,stopped" \
    --query 'Reservations[].Instances[].InstanceId' --output text)
  if [ -n "$IDS" ]; then
    aws ec2 terminate-instances --instance-ids $IDS >/dev/null
    diz "esperando as quatro encerrarem, perto de um minuto"
    aws ec2 wait instance-terminated --instance-ids $IDS
  fi

  if [ "$VPC" != "None" ] && [ -n "$VPC" ]; then
    VPC_APAGADA=0
    NAT=$(aws ec2 describe-nat-gateways --filter Name=vpc-id,Values=$VPC \
      --query 'NatGateways[?State==`available` || State==`pending`].NatGatewayId' \
      --output text)
    if [ -n "$NAT" ]; then
      # O endereco elastico e lido do proprio NAT gateway. Varrer os
      # enderecos livres da conta soltaria tambem os do Vocareum.
      EIP=$(aws ec2 describe-nat-gateways --nat-gateway-ids $NAT \
        --query 'NatGateways[0].NatGatewayAddresses[0].AllocationId' --output text)
      aws ec2 delete-nat-gateway --nat-gateway-id $NAT >/dev/null
      diz "esperando o NAT gateway sumir, que e o passo mais demorado"
      aws ec2 wait nat-gateway-deleted --nat-gateway-ids $NAT
      [ "$EIP" = "None" ] || aws ec2 release-address --allocation-id $EIP
      diz "NAT gateway apagado e endereco elastico devolvido"
    fi
    for EIGW in $(aws ec2 describe-egress-only-internet-gateways \
        --query 'EgressOnlyInternetGateways[].EgressOnlyInternetGatewayId' \
        --output text); do
      DONO=$(aws ec2 describe-egress-only-internet-gateways \
        --egress-only-internet-gateway-ids $EIGW \
        --query 'EgressOnlyInternetGateways[0].Attachments[0].VpcId' --output text)
      [ "$DONO" = "$VPC" ] && aws ec2 delete-egress-only-internet-gateway \
        --egress-only-internet-gateway-id $EIGW >/dev/null
    done
    IGW=$(aws ec2 describe-internet-gateways \
      --filters Name=attachment.vpc-id,Values=$VPC \
      --query 'InternetGateways[0].InternetGatewayId' --output text)
    if [ "$IGW" != "None" ] && [ -n "$IGW" ]; then
      aws ec2 detach-internet-gateway --internet-gateway-id $IGW --vpc-id $VPC
      aws ec2 delete-internet-gateway --internet-gateway-id $IGW
    fi
    for SUB in $(aws ec2 describe-subnets --filters Name=vpc-id,Values=$VPC \
        --query 'Subnets[].SubnetId' --output text); do
      aws ec2 delete-subnet --subnet-id $SUB
    done
    # A tabela principal nao se apaga, e some junto com a VPC. Tentar e
    # ignorar o erro sai mais barato que descobrir qual das duas ela e.
    for RT in $(aws ec2 describe-route-tables --filters Name=vpc-id,Values=$VPC \
        --query 'RouteTables[].RouteTableId' --output text); do
      aws ec2 delete-route-table --route-table-id $RT >/dev/null 2>&1
    done
    for SG in $(aws ec2 describe-security-groups \
        --filters Name=group-name,Values=sd-nos \
        --query 'SecurityGroups[].GroupId' --output text); do
      aws ec2 delete-security-group --group-id $SG >/dev/null 2>&1
    done
    if aws ec2 delete-vpc --vpc-id $VPC; then
      VPC_APAGADA=1
      diz "sd-vpc apagada com tudo que havia dentro"
    else
      diz "limpeza incompleta, a AWS recusou apagar a sd-vpc"
      diz "recursos que ainda sobraram na VPC:"
      aws ec2 describe-network-interfaces --filters Name=vpc-id,Values=$VPC \
        --query 'NetworkInterfaces[].{Interface:NetworkInterfaceId,Descricao:Description,Estado:Status}' \
        --output table
      aws ec2 describe-subnets --filters Name=vpc-id,Values=$VPC \
        --query 'Subnets[].{Subrede:SubnetId,Nome:Tags[?Key==`Name`]|[0].Value}' \
        --output table
      aws ec2 describe-route-tables --filters Name=vpc-id,Values=$VPC \
        --query 'RouteTables[].{Tabela:RouteTableId,Nome:Tags[?Key==`Name`]|[0].Value}' \
        --output table
    fi
  fi

  # A varredura final por nome independe da existencia da sd-vpc. O grupo
  # sd-observador mora na VPC padrao, e o sd-eip pode sobreviver sem o NAT.
  for SG in $(aws ec2 describe-security-groups \
      --filters Name=group-name,Values=sd-observador \
      --query 'SecurityGroups[].GroupId' --output text); do
    aws ec2 delete-security-group --group-id $SG >/dev/null 2>&1
  done
  for EIP_SOLTO in $(aws ec2 describe-addresses \
      --filters Name=tag:Name,Values=sd-eip \
      --query 'Addresses[].AllocationId' --output text); do
    aws ec2 release-address --allocation-id $EIP_SOLTO >/dev/null 2>&1
  done

  rm -rf "$PASTA"

  # A credencial sai por ultimo, e sai mesmo. Ela e temporaria e ja nao
  # serve, mas deixar credencial em maquina de laboratorio compartilhada
  # e o tipo de habito que custa caro fora da sala de aula.
  if [ "${AWS_PROFILE:-}" = "$PERFIL" ]; then
    aws configure set aws_access_key_id     "" --profile "$PERFIL" 2>/dev/null
    aws configure set aws_secret_access_key "" --profile "$PERFIL" 2>/dev/null
    aws configure set aws_session_token     "" --profile "$PERFIL" 2>/dev/null
    diz "credencial do perfil $PERFIL apagada deste computador"
  fi

  if [ "$VPC_APAGADA" -ne 1 ]; then
    titulo "limpeza incompleta"
    diz "Espere 30 segundos e confira os recursos listados antes de tentar de novo."
    exit 1
  fi

  titulo "pronto"
  diz "A VPC padrao continua com o bloco IPv6 e as duas rotas do passo 2."
  diz "Elas somem sozinhas quando voce clicar em End Lab."
  exit 0
}

# ------------------------------------------------------------
# Comeco
# ------------------------------------------------------------
titulo "Pratica 03: preparando o ambiente"
diz "Sistemas Distribuidos, IFSP Campus Salto"
printf '\n'
preparar_credencial

[ "${1:-}" = "--apagar" ] && apagar_tudo

VPC_EXISTENTE=$(id_da_vpc)
if [ "$VPC_EXISTENTE" != "None" ] && [ -n "$VPC_EXISTENTE" ]; then
  morre "ja existe uma sd-vpc nesta conta ($VPC_EXISTENTE). Rode com --apagar antes, para nao ficar com duas redes iguais e nenhuma explicacao"
fi

mkdir -p "$PASTA"
cd "$PASTA" || morre "nao consegui usar a pasta $PASTA"

# ------------------------------------------------------------
titulo "passo 1 de 6: a foto da conta antes de qualquer mudanca"
diz "Guardo aqui como a conta esta agora, porque daqui a pouco ela muda."
diz "O roteiro pede que voce leia esta foto, e ela fica em:"
diz "$ANTES"
{
  echo "Foto da conta em $(date '+%Y-%m-%d %H:%M:%S'), antes de a pratica 03 criar qualquer coisa."
  echo
  echo "== as redes que ja existem =="
  aws ec2 describe-vpcs \
    --query 'Vpcs[].{VPC:VpcId,CIDR:CidrBlock,Padrao:IsDefault,IPv6:Ipv6CidrBlockAssociationSet[0].Ipv6CidrBlock,Nome:Tags[?Key==`Name`]|[0].Value}' \
    --output table
  echo
  echo "== as tabelas de rotas delas, com a contagem de linhas IPv6 =="
  aws ec2 describe-route-tables \
    --query 'sort_by(RouteTables[].{Tabela:RouteTableId,VPC:VpcId,Rotas:length(Routes),LinhasIPv6:length(Routes[?DestinationIpv6CidrBlock!=null])},&VPC)' \
    --output table
  echo
  echo "== e as rotas, uma a uma =="
  for RT in $(aws ec2 describe-route-tables --query 'RouteTables[].RouteTableId' --output text); do
    echo "-- tabela $RT"
    aws ec2 describe-route-tables --route-table-ids $RT \
      --query 'RouteTables[0].Routes[].[DestinationCidrBlock,DestinationIpv6CidrBlock,GatewayId,Origin]' \
      --output text
  done
} > "$ANTES" 2>&1
diz "foto guardada"

# ------------------------------------------------------------
titulo "passo 2 de 6: dando saida e IPv6 a VPC padrao"
diz "O no E, o observador de fora, vai nascer nesta rede."
diz "Ela precisa de duas coisas que nao tem, um bloco IPv6 e um caminho"
diz "de saida. O gateway de internet dela ja existe, e nao ha rota ate ele."
VPC_PADRAO=$(aws ec2 describe-vpcs --filters Name=isDefault,Values=true \
  --query 'Vpcs[0].VpcId' --output text)
IPV6_PADRAO=$(aws ec2 describe-vpcs --vpc-ids $VPC_PADRAO \
  --query 'Vpcs[0].Ipv6CidrBlockAssociationSet[0].Ipv6CidrBlock' --output text)
if [ "$IPV6_PADRAO" = "None" ]; then
  diz "pedindo um bloco /56 a Amazon"
  T0=$(agora)
  aws ec2 associate-vpc-cidr-block --vpc-id $VPC_PADRAO \
    --amazon-provided-ipv6-cidr-block >/dev/null || morre "nao consegui pedir o bloco IPv6"
  TENTATIVAS=0
  while [ "$IPV6_PADRAO" = "None" ] && [ $TENTATIVAS -lt 30 ]; do
    sleep 2
    TENTATIVAS=$((TENTATIVAS + 1))
    IPV6_PADRAO=$(aws ec2 describe-vpcs --vpc-ids $VPC_PADRAO \
      --query 'Vpcs[0].Ipv6CidrBlockAssociationSet[0].Ipv6CidrBlock' --output text)
  done
  diz "bloco $IPV6_PADRAO entregue em $(( $(agora) - T0 )) s"
fi
SUB_PADRAO=$(aws ec2 describe-subnets --filters Name=vpc-id,Values=$VPC_PADRAO \
  Name=availability-zone,Values=$ZONA_A --query 'Subnets[0].SubnetId' --output text)
JA_TEM=$(aws ec2 describe-subnets --subnet-ids $SUB_PADRAO \
  --query 'Subnets[0].Ipv6CidrBlockAssociationSet[0].Ipv6CidrBlock' --output text)
if [ "$JA_TEM" = "None" ]; then
  aws ec2 associate-subnet-cidr-block --subnet-id $SUB_PADRAO \
    --ipv6-cidr-block "${IPV6_PADRAO%00::/56}00::/64" >/dev/null
  diz "sub-rede de $ZONA_A recortada em ${IPV6_PADRAO%00::/56}00::/64"
fi
RT_PADRAO=$(aws ec2 describe-route-tables --filters Name=vpc-id,Values=$VPC_PADRAO \
  --query 'RouteTables[0].RouteTableId' --output text)
IGW_PADRAO=$(aws ec2 describe-internet-gateways \
  --filters Name=attachment.vpc-id,Values=$VPC_PADRAO \
  --query 'InternetGateways[0].InternetGatewayId' --output text)
# As DUAS rotas, e a de IPv4 nao e redundancia. A tabela da VPC padrao do
# Sandbox vem com a linha local e nada mais, mesmo tendo um gateway de
# internet ligado a ela. Verificado em duas sessoes reais em 2026-08-23,
# em contas diferentes.
aws ec2 create-route --route-table-id $RT_PADRAO --destination-cidr-block 0.0.0.0/0 \
  --gateway-id $IGW_PADRAO >/dev/null 2>&1
aws ec2 create-route --route-table-id $RT_PADRAO --destination-ipv6-cidr-block ::/0 \
  --gateway-id $IGW_PADRAO >/dev/null 2>&1
diz "as duas rotas de saida escritas, as duas para $IGW_PADRAO"
diz "a rede que nao falava com ninguem virou rede de pilha dupla"

# ------------------------------------------------------------
titulo "passo 3 de 6: a sd-vpc e as tres sub-redes"
diz "O bloco IPv4 e $CIDR_VPC, escolhido para nao repetir o 10.0.0.0/16"
diz "que as duas redes do laboratorio ja usam."
VPC=$(aws ec2 create-vpc --cidr-block $CIDR_VPC --amazon-provided-ipv6-cidr-block \
  --tag-specifications 'ResourceType=vpc,Tags=[{Key=Name,Value=sd-vpc}]' \
  --query 'Vpc.VpcId' --output text) || morre "nao consegui criar a VPC"
aws ec2 wait vpc-available --vpc-ids $VPC
PREFIXO=$(aws ec2 describe-vpcs --vpc-ids $VPC \
  --query 'Vpcs[0].Ipv6CidrBlockAssociationSet[0].Ipv6CidrBlock' --output text)
RAIZ=${PREFIXO%00::/56}
diz "sd-vpc criada como $VPC, com o prefixo $PREFIXO"
printf '\n'
diz "Agora o recorte, que e o CIDR do topico 3 virando comando."
diz "A Amazon entrega um /56 por VPC e cada sub-rede leva um /64. Os oito"
diz "bits de diferenca sao o que sobra para voce numerar as sub-redes, e e"
diz "por isso que o que muda abaixo e o par final, de 00 para 01 e 02."
printf '\n'
printf '    %-14s %-16s %s\n' "sd-publica-a" "10.10.1.0/24" "${RAIZ}00::/64"
printf '    %-14s %-16s %s\n' "sd-privada-a" "10.10.2.0/24" "${RAIZ}01::/64"
printf '    %-14s %-16s %s\n' "sd-privada-b" "10.10.3.0/24" "${RAIZ}02::/64"
printf '\n'

criar_subrede() {
  aws ec2 create-subnet --vpc-id $VPC --cidr-block "$2" \
    --ipv6-cidr-block "$3" --availability-zone "$4" \
    --tag-specifications "ResourceType=subnet,Tags=[{Key=Name,Value=$1}]" \
    --query 'Subnet.SubnetId' --output text
}
SUB_PUB=$(criar_subrede sd-publica-a 10.10.1.0/24 "${RAIZ}00::/64" $ZONA_A)
SUB_PRIV_A=$(criar_subrede sd-privada-a 10.10.2.0/24 "${RAIZ}01::/64" $ZONA_A)
SUB_PRIV_B=$(criar_subrede sd-privada-b 10.10.3.0/24 "${RAIZ}02::/64" $ZONA_B)
aws ec2 modify-subnet-attribute --subnet-id $SUB_PUB --map-public-ip-on-launch
diz "as tres criadas. Repare que a sd-privada-b fica em $ZONA_B, e as"
diz "outras duas em $ZONA_A. Essa escolha e medida no experimento 3."

# ------------------------------------------------------------
titulo "passo 4 de 6: os tres dispositivos de borda"
diz "A rede tem enderecos e nao tem nenhuma porta aberta. Nada entra e nada sai."
IGW=$(aws ec2 create-internet-gateway \
  --tag-specifications 'ResourceType=internet-gateway,Tags=[{Key=Name,Value=sd-igw}]' \
  --query 'InternetGateway.InternetGatewayId' --output text)
aws ec2 attach-internet-gateway --internet-gateway-id $IGW --vpc-id $VPC
diz "gateway de internet $IGW criado e ligado. Ele atende os dois"
diz "protocolos e deixa passar conversa iniciada dos dois lados."
printf '\n'

T_NAT=$(agora)
EIP=$(aws ec2 allocate-address --domain vpc \
  --tag-specifications 'ResourceType=elastic-ip,Tags=[{Key=Name,Value=sd-eip}]' \
  --query AllocationId --output text)
NAT=$(aws ec2 create-nat-gateway --subnet-id $SUB_PUB --allocation-id $EIP \
  --tag-specifications 'ResourceType=natgateway,Tags=[{Key=Name,Value=sd-nat}]' \
  --query 'NatGateway.NatGatewayId' --output text)
diz "NAT gateway $NAT pedido. Ele so atende IPv4, precisou de um endereco"
diz "elastico reservado ($EIP), precisa morar numa sub-rede publica e leva"
diz "um tempo para ficar de pe. Seguimos enquanto ele nasce."
printf '\n'

T_EIGW=$(agora)
EIGW=$(aws ec2 create-egress-only-internet-gateway --vpc-id $VPC \
  --query 'EgressOnlyInternetGateway.EgressOnlyInternetGatewayId' --output text)
SEG_EIGW=$(( $(agora) - T_EIGW ))
diz "gateway somente de saida $EIGW pronto em $SEG_EIGW s."
diz "Ele e o equivalente do NAT gateway para IPv6, e so no resultado."
diz "Nasceu sem endereco, sem sub-rede e sem espera, porque nao traduz nada."

# ------------------------------------------------------------
titulo "passo 5 de 6: as duas tabelas de rotas"
diz "Aqui mora o argumento da pratica. As duas tabelas tem a mesma forma"
diz "e diferem em duas linhas, e sao essas duas linhas que decidem qual"
diz "sub-rede e publica e qual e privada."
RT_PUB=$(aws ec2 create-route-table --vpc-id $VPC \
  --tag-specifications 'ResourceType=route-table,Tags=[{Key=Name,Value=rt-publica}]' \
  --query 'RouteTable.RouteTableId' --output text)
aws ec2 create-route --route-table-id $RT_PUB --destination-cidr-block 0.0.0.0/0 \
  --gateway-id $IGW >/dev/null
aws ec2 create-route --route-table-id $RT_PUB --destination-ipv6-cidr-block ::/0 \
  --gateway-id $IGW >/dev/null
aws ec2 associate-route-table --route-table-id $RT_PUB --subnet-id $SUB_PUB >/dev/null
diz "rt-publica $RT_PUB, com os dois destinos de fora indo para o mesmo"
diz "gateway de internet, e associada a sd-publica-a"

RT_PRIV=$(aws ec2 create-route-table --vpc-id $VPC \
  --tag-specifications 'ResourceType=route-table,Tags=[{Key=Name,Value=rt-privada}]' \
  --query 'RouteTable.RouteTableId' --output text)
aws ec2 create-route --route-table-id $RT_PRIV --destination-ipv6-cidr-block ::/0 \
  --egress-only-internet-gateway-id $EIGW >/dev/null
aws ec2 associate-route-table --route-table-id $RT_PRIV --subnet-id $SUB_PRIV_A >/dev/null
aws ec2 associate-route-table --route-table-id $RT_PRIV --subnet-id $SUB_PRIV_B >/dev/null
diz "rt-privada $RT_PRIV, servindo as DUAS sub-redes privadas ao mesmo"
diz "tempo, o que mostra que tabela e sub-rede sao objetos diferentes"
printf '\n'

diz "esperando o NAT gateway, que e a unica espera desta preparacao"
aws ec2 wait nat-gateway-available --nat-gateway-ids $NAT || morre "o NAT gateway nao ficou disponivel"
SEG_NAT=$(( $(agora) - T_NAT ))
aws ec2 create-route --route-table-id $RT_PRIV --destination-cidr-block 0.0.0.0/0 \
  --nat-gateway-id $NAT >/dev/null
diz "NAT gateway disponivel em $SEG_NAT s, e a rota IPv4 da rt-privada escrita"
printf '\n'
diz "Guarde a comparacao, porque ela e conteudo:"
diz "  gateway somente de saida  $SEG_EIGW s   sem endereco, sem sub-rede, nao traduz"
diz "  NAT gateway               $SEG_NAT s   com endereco, numa sub-rede, traduz"
diz "Os dois entregam o mesmo resultado pratico, por mecanismos opostos."

# ------------------------------------------------------------
titulo "passo 6 de 6: os quatro nos"
diz "Baixando o mesmo script de inicializacao que os quatro vao executar."
curl -sfO "$BASE_PUBLICADA/setup.sh" || morre "nao consegui baixar o setup.sh de $BASE_PUBLICADA"
diz "setup.sh baixado, $(wc -c < setup.sh) bytes"

abrir_portas() {
  # Onde a VPC tem bloco IPv6, a regra de saida padrao ja cobre ::/0 e a AWS
  # responde InvalidPermission.Duplicate. Pedimos assim mesmo, para o script
  # servir tambem a uma rede so de IPv4, e engolimos a recusa.
  aws ec2 authorize-security-group-egress --group-id "$1" \
    --ip-permissions 'IpProtocol=-1,Ipv6Ranges=[{CidrIpv6=::/0}]' >/dev/null 2>&1
  aws ec2 authorize-security-group-ingress --group-id "$1" --ip-permissions \
    'IpProtocol=tcp,FromPort=22,ToPort=22,IpRanges=[{CidrIp=0.0.0.0/0}],Ipv6Ranges=[{CidrIpv6=::/0}]' \
    'IpProtocol=tcp,FromPort=8080,ToPort=8080,IpRanges=[{CidrIp=0.0.0.0/0}],Ipv6Ranges=[{CidrIpv6=::/0}]' \
    'IpProtocol=icmp,FromPort=-1,ToPort=-1,IpRanges=[{CidrIp=0.0.0.0/0}]' \
    'IpProtocol=icmpv6,FromPort=-1,ToPort=-1,Ipv6Ranges=[{CidrIpv6=::/0}]' >/dev/null
}
SG_NOS=$(aws ec2 create-security-group --group-name sd-nos \
  --description "Pratica 03 nos da sd-vpc" --vpc-id $VPC \
  --query GroupId --output text)
SG_E=$(aws ec2 create-security-group --group-name sd-observador \
  --description "Pratica 03 observador na VPC padrao" --vpc-id $VPC_PADRAO \
  --query GroupId --output text)
abrir_portas $SG_NOS
abrir_portas $SG_E
diz "dois grupos de seguranca criados, os dois com a entrada aberta de"
diz "proposito, para o experimento 1 medir roteamento e nao filtro"

AMI=$(aws ec2 describe-images --owners amazon \
  --filters 'Name=name,Values=al2023-ami-2023*-x86_64' 'Name=state,Values=available' \
  --query 'sort_by(Images,&CreationDate)[-1].ImageId' --output text)
diz "imagem mais recente do Amazon Linux 2023: $AMI"

subir_no() {
  aws ec2 run-instances --image-id $AMI --instance-type t3.micro --key-name vockey \
    --subnet-id "$2" --security-group-ids "$3" --ipv6-address-count 1 "$4" \
    --iam-instance-profile Name=LabInstanceProfile \
    --metadata-options 'InstanceMetadataTags=enabled' \
    --user-data file://setup.sh \
    --tag-specifications "ResourceType=instance,Tags=[{Key=Name,Value=$1}]" \
    --query 'Instances[0].InstanceId' --output text
}
printf '\n'
diz "sd-P na sd-publica-a, com endereco publico. Serve como porta de entrada."
NO_P=$(subir_no sd-P $SUB_PUB    $SG_NOS --associate-public-ip-address)
diz "sd-E na VPC padrao, com endereco publico. Atua como observador de fora."
NO_E=$(subir_no sd-E $SUB_PADRAO $SG_E   --associate-public-ip-address)
diz "sd-A na sd-privada-a, SEM endereco publico. E o alvo dos experimentos."
NO_A=$(subir_no sd-A $SUB_PRIV_A $SG_NOS --no-associate-public-ip-address)
diz "sd-B na sd-privada-b, em $ZONA_B. So ele muda de zona, e e essa a"
diz "unica diferenca que o experimento 3 vai medir contra o sd-A."
NO_B=$(subir_no sd-B $SUB_PRIV_B $SG_NOS --no-associate-public-ip-address)
printf '\n'
diz "os quatro sobem em paralelo, entao a espera e a de um so"
aws ec2 wait instance-running --instance-ids $NO_P $NO_E $NO_A $NO_B

endereco() {
  aws ec2 describe-instances --instance-ids "$1" \
    --query "Reservations[0].Instances[0].$2" --output text
}

{
  echo "IP_PUB_P=$(endereco $NO_P PublicIpAddress)"
  echo "IPV6_P=$(endereco $NO_P Ipv6Address)"
  echo "IP_PRIV_A=$(endereco $NO_A PrivateIpAddress)"
  echo "IPV6_A=$(endereco $NO_A Ipv6Address)"
  echo "IP_PRIV_B=$(endereco $NO_B PrivateIpAddress)"
  echo "IPV6_B=$(endereco $NO_B Ipv6Address)"
  echo "IP_PUB_E=$(endereco $NO_E PublicIpAddress)"
  echo "IPV6_E=$(endereco $NO_E Ipv6Address)"
  echo "RT_PRIV=$RT_PRIV"
  echo "SG_NOS=$SG_NOS"
  echo "IGW=$IGW"
  echo "EIGW=$EIGW"
  echo "NAT=$NAT"
} > "$FICHA"

titulo "pronto. O ambiente da pratica 03 esta de pe"
diz "Copie o bloco abaixo inteiro e cole na ficha do roteiro, no campo"
diz "que diz colar de uma vez. Ele tambem ficou guardado em:"
diz "$FICHA"
printf '\n'
cat "$FICHA"
printf '\n'
diz "As instancias ainda estao instalando as ferramentas de rede."
diz "Espere um minuto antes de abrir as janelas do experimento 1."
diz "A foto da conta antes das mudancas esta em $ANTES."
