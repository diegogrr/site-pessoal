#!/bin/bash
# ============================================================
# Pratica 03 (Topico 3) - Sistemas Distribuidos - IFSP Salto
# Recuperacao: refaz a rede inteira e os tres nos em um comando.
#
# Existe para quando a sessao do Sandbox cai no meio da pratica e
# leva tudo embora. NAO faz parte do roteiro: os passos 3 a 6 sao
# o conteudo, e digita-los e o que ensina. Aqui a mesma sequencia
# vai de uma vez, para o aluno voltar ao experimento em que estava.
#
# Roda na CloudShell. Sem acentos, pelo mesmo motivo do setup.sh.
#
#   bash recriar-rede.sh          refaz tudo
#   bash recriar-rede.sh --apagar apaga o que este script criou
# ============================================================
set -u

BASE_PUBLICADA="https://diedu.com.br/cursos/sistemas-distribuidos/labs/pratica-03"
ZONA_A="us-east-1a"
ZONA_B="us-east-1b"
CIDR_VPC="10.10.0.0/16"
FICHA="$HOME/sd-pratica03.env"

titulo() { printf '\n=== %s ===\n' "$1"; }
morre()  { printf 'FALHA: %s\n' "$1" >&2; exit 1; }

id_da_vpc() {
  aws ec2 describe-vpcs --filters Name=tag:Name,Values=sd-vpc \
    Name=state,Values=available --query 'Vpcs[0].VpcId' --output text 2>/dev/null
}

# ------------------------------------------------------------
# Apagar, na ordem inversa da criacao
# ------------------------------------------------------------
if [ "${1:-}" = "--apagar" ]; then
  titulo "apagando o que a pratica 03 criou"
  VPC=$(id_da_vpc)

  IDS=$(aws ec2 describe-instances \
    --filters "Name=tag:Name,Values=sd-P,sd-A,sd-E" \
              "Name=instance-state-name,Values=pending,running,stopped" \
    --query 'Reservations[].Instances[].InstanceId' --output text)
  if [ -n "$IDS" ]; then
    aws ec2 terminate-instances --instance-ids $IDS >/dev/null
    echo "esperando as instancias encerrarem (perto de um minuto)"
    aws ec2 wait instance-terminated --instance-ids $IDS
  fi

  if [ "$VPC" != "None" ] && [ -n "$VPC" ]; then
    NAT=$(aws ec2 describe-nat-gateways --filter Name=vpc-id,Values=$VPC \
      --query 'NatGateways[?State==`available` || State==`pending`].NatGatewayId' \
      --output text)
    if [ -n "$NAT" ]; then
      # O endereco elastico e lido do proprio NAT gateway. Varrer os
      # enderecos livres da conta soltaria tambem os do Vocareum.
      EIP=$(aws ec2 describe-nat-gateways --nat-gateway-ids $NAT \
        --query 'NatGateways[0].NatGatewayAddresses[0].AllocationId' --output text)
      aws ec2 delete-nat-gateway --nat-gateway-id $NAT >/dev/null
      echo "esperando o NAT gateway sumir (perto de dois minutos)"
      aws ec2 wait nat-gateway-deleted --nat-gateway-ids $NAT
      [ "$EIP" = "None" ] || aws ec2 release-address --allocation-id $EIP
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
      aws ec2 delete-route-table --route-table-id $RT 2>/dev/null
    done
    for SG in $(aws ec2 describe-security-groups \
        --filters Name=group-name,Values=sd-nos,sd-observador \
        --query 'SecurityGroups[].GroupId' --output text); do
      aws ec2 delete-security-group --group-id $SG 2>/dev/null
    done
    aws ec2 delete-vpc --vpc-id $VPC
  fi
  rm -f "$FICHA"
  echo "pronto. A VPC padrao continua com o bloco IPv6 do passo 2."
  exit 0
fi

# ------------------------------------------------------------
# Recriar
# ------------------------------------------------------------
[ "$(id_da_vpc)" = "None" ] || morre "ja existe uma sd-vpc. Rode com --apagar antes."

if [ ! -f setup.sh ]; then
  titulo "baixando o setup.sh publicado"
  curl -sfO "$BASE_PUBLICADA/setup.sh" || morre "nao consegui baixar o setup.sh"
fi

titulo "passo 2: IPv6 na VPC padrao"
VPC_PADRAO=$(aws ec2 describe-vpcs --filters Name=isDefault,Values=true \
  --query 'Vpcs[0].VpcId' --output text)
IPV6_PADRAO=$(aws ec2 describe-vpcs --vpc-ids $VPC_PADRAO \
  --query 'Vpcs[0].Ipv6CidrBlockAssociationSet[0].Ipv6CidrBlock' --output text)
if [ "$IPV6_PADRAO" = "None" ]; then
  aws ec2 associate-vpc-cidr-block --vpc-id $VPC_PADRAO \
    --amazon-provided-ipv6-cidr-block >/dev/null
  sleep 10
  IPV6_PADRAO=$(aws ec2 describe-vpcs --vpc-ids $VPC_PADRAO \
    --query 'Vpcs[0].Ipv6CidrBlockAssociationSet[0].Ipv6CidrBlock' --output text)
fi
SUB_PADRAO=$(aws ec2 describe-subnets --filters Name=vpc-id,Values=$VPC_PADRAO \
  Name=availability-zone,Values=$ZONA_A --query 'Subnets[0].SubnetId' --output text)
if [ "$(aws ec2 describe-subnets --subnet-ids $SUB_PADRAO \
      --query 'Subnets[0].Ipv6CidrBlockAssociationSet[0].Ipv6CidrBlock' \
      --output text)" = "None" ]; then
  aws ec2 associate-subnet-cidr-block --subnet-id $SUB_PADRAO \
    --ipv6-cidr-block "${IPV6_PADRAO%00::/56}00::/64" >/dev/null
fi
RT_PADRAO=$(aws ec2 describe-route-tables --filters Name=vpc-id,Values=$VPC_PADRAO \
  --query 'RouteTables[0].RouteTableId' --output text)
IGW_PADRAO=$(aws ec2 describe-internet-gateways \
  --filters Name=attachment.vpc-id,Values=$VPC_PADRAO \
  --query 'InternetGateways[0].InternetGatewayId' --output text)
aws ec2 create-route --route-table-id $RT_PADRAO --destination-ipv6-cidr-block ::/0 \
  --gateway-id $IGW_PADRAO >/dev/null 2>&1

titulo "passo 3: sd-vpc e as tres sub-redes"
VPC=$(aws ec2 create-vpc --cidr-block $CIDR_VPC --amazon-provided-ipv6-cidr-block \
  --tag-specifications 'ResourceType=vpc,Tags=[{Key=Name,Value=sd-vpc}]' \
  --query 'Vpc.VpcId' --output text) || morre "nao consegui criar a VPC"
aws ec2 wait vpc-available --vpc-ids $VPC
PREFIXO=$(aws ec2 describe-vpcs --vpc-ids $VPC \
  --query 'Vpcs[0].Ipv6CidrBlockAssociationSet[0].Ipv6CidrBlock' --output text)
RAIZ=${PREFIXO%00::/56}

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

titulo "passo 4: os tres dispositivos de borda"
IGW=$(aws ec2 create-internet-gateway \
  --tag-specifications 'ResourceType=internet-gateway,Tags=[{Key=Name,Value=sd-igw}]' \
  --query 'InternetGateway.InternetGatewayId' --output text)
aws ec2 attach-internet-gateway --internet-gateway-id $IGW --vpc-id $VPC
EIP=$(aws ec2 allocate-address --domain vpc --query AllocationId --output text)
NAT=$(aws ec2 create-nat-gateway --subnet-id $SUB_PUB --allocation-id $EIP \
  --tag-specifications 'ResourceType=natgateway,Tags=[{Key=Name,Value=sd-nat}]' \
  --query 'NatGateway.NatGatewayId' --output text)
EIGW=$(aws ec2 create-egress-only-internet-gateway --vpc-id $VPC \
  --query 'EgressOnlyInternetGateway.EgressOnlyInternetGatewayId' --output text)

titulo "passo 5: as duas tabelas de rotas"
RT_PUB=$(aws ec2 create-route-table --vpc-id $VPC \
  --tag-specifications 'ResourceType=route-table,Tags=[{Key=Name,Value=rt-publica}]' \
  --query 'RouteTable.RouteTableId' --output text)
aws ec2 create-route --route-table-id $RT_PUB --destination-cidr-block 0.0.0.0/0 \
  --gateway-id $IGW >/dev/null
aws ec2 create-route --route-table-id $RT_PUB --destination-ipv6-cidr-block ::/0 \
  --gateway-id $IGW >/dev/null
aws ec2 associate-route-table --route-table-id $RT_PUB --subnet-id $SUB_PUB >/dev/null

RT_PRIV=$(aws ec2 create-route-table --vpc-id $VPC \
  --tag-specifications 'ResourceType=route-table,Tags=[{Key=Name,Value=rt-privada}]' \
  --query 'RouteTable.RouteTableId' --output text)
aws ec2 create-route --route-table-id $RT_PRIV --destination-ipv6-cidr-block ::/0 \
  --egress-only-internet-gateway-id $EIGW >/dev/null
aws ec2 associate-route-table --route-table-id $RT_PRIV --subnet-id $SUB_PRIV_A >/dev/null
aws ec2 associate-route-table --route-table-id $RT_PRIV --subnet-id $SUB_PRIV_B >/dev/null

echo "esperando o NAT gateway ficar disponivel (perto de dois minutos)"
aws ec2 wait nat-gateway-available --nat-gateway-ids $NAT
aws ec2 create-route --route-table-id $RT_PRIV --destination-cidr-block 0.0.0.0/0 \
  --nat-gateway-id $NAT >/dev/null

titulo "grupos de seguranca, os dois com saida IPv4 e IPv6"
# As MESMAS regras do passo 6 do roteiro, nos dois grupos. A saida ::/0 e o
# que faz o experimento 1 medir roteamento em vez de filtro, e a entrada de
# ICMPv6 no grupo do no E e o que faz a medida 4 do experimento 3 existir.
abrir_portas () {
  aws ec2 authorize-security-group-egress --group-id "$1" \
    --ip-permissions 'IpProtocol=-1,Ipv6Ranges=[{CidrIpv6=::/0}]' >/dev/null
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

titulo "passo 6: os tres nos"
AMI=$(aws ec2 describe-images --owners amazon \
  --filters 'Name=name,Values=al2023-ami-2023*-x86_64' 'Name=state,Values=available' \
  --query 'sort_by(Images,&CreationDate)[-1].ImageId' --output text)

subir_no() {
  aws ec2 run-instances --image-id $AMI --instance-type t3.micro --key-name vockey \
    --subnet-id "$2" --security-group-ids "$3" --ipv6-address-count 1 "$4" \
    --iam-instance-profile Name=LabInstanceProfile \
    --metadata-options 'InstanceMetadataTags=enabled' \
    --user-data file://setup.sh \
    --tag-specifications "ResourceType=instance,Tags=[{Key=Name,Value=$1}]" \
    --query 'Instances[0].InstanceId' --output text
}
NO_P=$(subir_no sd-P $SUB_PUB    $SG_NOS --associate-public-ip-address)
NO_E=$(subir_no sd-E $SUB_PADRAO $SG_E   --associate-public-ip-address)
NO_A=$(subir_no sd-A $SUB_PRIV_A $SG_NOS --no-associate-public-ip-address)
aws ec2 wait instance-running --instance-ids $NO_P $NO_E $NO_A

# Os mesmos nomes que o passo 5.2 do roteiro grava, para o experimento 2
# continuar funcionando depois de um "source" deste arquivo.
{
  echo "VPC=$VPC"
  echo "VPC_PADRAO=$VPC_PADRAO"
  echo "SUB_PUB=$SUB_PUB"
  echo "SUB_PRIV_A=$SUB_PRIV_A"
  echo "SUB_PRIV_B=$SUB_PRIV_B"
  echo "SUB_PADRAO=$SUB_PADRAO"
  echo "IGW=$IGW"
  echo "NAT=$NAT"
  echo "EIGW=$EIGW"
  echo "RT_PUB=$RT_PUB"
  echo "RT_PRIV=$RT_PRIV"
  echo "SG_NOS=$SG_NOS"
  echo "SG_E=$SG_E"
  echo "PREFIXO=$PREFIXO"
} > "$FICHA"

endereco() {
  aws ec2 describe-instances --instance-ids "$1" \
    --query "Reservations[0].Instances[0].$2" --output text
}

titulo "pronto. Copie estes seis valores para a ficha do roteiro"
printf 'IPv4 publico do no P : %s\n' "$(endereco $NO_P PublicIpAddress)"
printf 'IPv6 do no P         : %s\n' "$(endereco $NO_P Ipv6Address)"
printf 'IPv4 privado do no A : %s\n' "$(endereco $NO_A PrivateIpAddress)"
printf 'IPv6 do no A         : %s\n' "$(endereco $NO_A Ipv6Address)"
printf 'IPv4 publico do no E : %s\n' "$(endereco $NO_E PublicIpAddress)"
printf 'IPv6 do no E         : %s\n' "$(endereco $NO_E Ipv6Address)"
echo
echo "Os identificadores da rede ficaram em $FICHA."
echo "Numa aba nova da CloudShell, recupere-os com: source $FICHA"
echo "As instancias ainda estao instalando as ferramentas; de um minuto a elas."
