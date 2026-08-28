# ============================================================
# Pratica 03 (Topico 3) - Sistemas Distribuidos - IFSP Salto
# Prepara o ambiente inteiro da pratica, no seu computador.
#
# Este e o script do Windows. No macOS e no Linux use o gemeo
# preparar-ambiente.sh, que faz exatamente as mesmas coisas.
#
#   powershell -ExecutionPolicy Bypass -File .\preparar-ambiente.ps1
#   powershell -ExecutionPolicy Bypass -File .\preparar-ambiente.ps1 -Apagar
#
# O -ExecutionPolicy Bypass e necessario porque o Windows recusa,
# por padrao, executar script baixado da Internet. Ele vale so
# para esta execucao e nao muda nenhuma configuracao da maquina.
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
param([switch]$Apagar)

$ErrorActionPreference = 'Continue'

$BASE_PUBLICADA = 'https://diedu.com.br/cursos/sistemas-distribuidos/labs/pratica-03'
$PERFIL = if ($env:SD_PERFIL) { $env:SD_PERFIL } else { 'sd-sandbox' }
$REGIAO = 'us-east-1'
$ZONA_A = 'us-east-1a'
$ZONA_B = 'us-east-1b'
$CIDR_VPC = '10.10.0.0/16'
$PASTA = Join-Path $env:USERPROFILE 'sd-pratica03'
$FICHA = Join-Path $PASTA 'identificadores.env'
$ANTES = Join-Path $PASTA 'antes.txt'

function titulo($t) {
  Write-Host ''
  Write-Host '============================================================'
  Write-Host " $t"
  Write-Host '============================================================'
}
function diz($t)   { Write-Host "  $t" }
function morre($t) { Write-Host ''; Write-Host "FALHA: $t"; exit 1 }
function segundos($t0) { [int]((Get-Date) - $t0).TotalSeconds }

function texto-secreto($rotulo) {
  $seguro = Read-Host -Prompt $rotulo -AsSecureString
  $ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($seguro)
  try   { [Runtime.InteropServices.Marshal]::PtrToStringAuto($ptr) }
  finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr) }
}

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
function autenticado {
  aws sts get-caller-identity --output text 2>$null | Out-Null
  return ($LASTEXITCODE -eq 0)
}

function perguntar-credencial {
  diz 'Abra o laboratorio no AWS Academy, clique em Details e depois em Show.'
  diz 'Copie os tres valores do bloco de credencial, um de cada vez.'
  diz 'Os dois ultimos sao secretos, entao nao aparecem enquanto voce cola.'
  diz 'Isso e proposital, e e o mesmo comportamento de uma senha no terminal.'
  Write-Host ''

  $chave   = Read-Host '  aws_access_key_id    '
  $segredo = texto-secreto '  aws_secret_access_key'
  $token   = texto-secreto '  aws_session_token    '

  if (-not $chave)   { morre 'o aws_access_key_id veio vazio' }
  if (-not $segredo) { morre 'o aws_secret_access_key veio vazio' }
  if (-not $token)   { morre 'o aws_session_token veio vazio. Ele e obrigatorio, porque a credencial do laboratorio e temporaria' }

  aws configure set aws_access_key_id     $chave   --profile $PERFIL
  aws configure set aws_secret_access_key $segredo --profile $PERFIL
  aws configure set aws_session_token     $token   --profile $PERFIL
  aws configure set region                $REGIAO  --profile $PERFIL
  Remove-Variable chave, segredo, token
  diz "credencial gravada no perfil $PERFIL"
}

function preparar-credencial {
  if (-not (Get-Command aws -ErrorAction SilentlyContinue)) {
    morre 'o AWS CLI nao esta instalado. Instale por https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html e rode este script de novo'
  }
  diz "AWS CLI encontrado, versao $(aws --version)"

  $env:AWS_PROFILE = $PERFIL
  $env:AWS_DEFAULT_REGION = $REGIAO
  if (autenticado) {
    diz "usando o perfil $PERFIL, que ja estava configurado e ainda vale"
  } else {
    titulo 'credencial do laboratorio'
    perguntar-credencial
    if (-not (autenticado)) {
      morre 'a credencial nao foi aceita. O caso comum e ela ter expirado, e a solucao e clicar em Start Lab de novo e copiar os tres valores outra vez'
    }
  }

  $conta = aws sts get-caller-identity --query Account --output text
  $arn = aws sts get-caller-identity --query Arn --output text
  # So o papel e o usuario. O ARN inteiro carrega o numero da conta, e a
  # linha de baixo existe justamente para nao mostra-lo por extenso.
  diz "identidade confirmada: $($arn.Split(':')[-1])"
  diz "conta terminada em $($conta.Substring(8)), regiao $REGIAO"
}

function id-da-vpc {
  $v = aws ec2 describe-vpcs --filters Name=tag:Name,Values=sd-vpc Name=state,Values=available --query 'Vpcs[0].VpcId' --output text 2>$null
  return $v
}

# ------------------------------------------------------------
# Apagar, na ordem inversa da criacao
# ------------------------------------------------------------
function apagar-tudo {
  titulo 'apagando o que a pratica 03 criou'
  $VPC = id-da-vpc
  $VPC_APAGADA = $true

  diz 'encerrando as instancias'
  $IDS = aws ec2 describe-instances --filters 'Name=tag:Name,Values=sd-P,sd-A,sd-B,sd-E' 'Name=instance-state-name,Values=pending,running,stopped' --query 'Reservations[].Instances[].InstanceId' --output text
  if ($IDS) {
    $lista = $IDS.Split()
    aws ec2 terminate-instances --instance-ids $lista | Out-Null
    diz 'esperando as quatro encerrarem, perto de um minuto'
    aws ec2 wait instance-terminated --instance-ids $lista
  }

  if ($VPC -and $VPC -ne 'None') {
    $VPC_APAGADA = $false
    $NAT = aws ec2 describe-nat-gateways --filter "Name=vpc-id,Values=$VPC" --query 'NatGateways[?State==`available` || State==`pending`].NatGatewayId' --output text
    if ($NAT) {
      # O endereco elastico e lido do proprio NAT gateway. Varrer os
      # enderecos livres da conta soltaria tambem os do Vocareum.
      $EIP = aws ec2 describe-nat-gateways --nat-gateway-ids $NAT --query 'NatGateways[0].NatGatewayAddresses[0].AllocationId' --output text
      aws ec2 delete-nat-gateway --nat-gateway-id $NAT | Out-Null
      diz 'esperando o NAT gateway sumir, que e o passo mais demorado'
      aws ec2 wait nat-gateway-deleted --nat-gateway-ids $NAT
      if ($EIP -ne 'None') { aws ec2 release-address --allocation-id $EIP }
      diz 'NAT gateway apagado e endereco elastico devolvido'
    }
    $todos = aws ec2 describe-egress-only-internet-gateways --query 'EgressOnlyInternetGateways[].EgressOnlyInternetGatewayId' --output text
    if ($todos) {
      foreach ($EIGW in $todos.Split()) {
        $dono = aws ec2 describe-egress-only-internet-gateways --egress-only-internet-gateway-ids $EIGW --query 'EgressOnlyInternetGateways[0].Attachments[0].VpcId' --output text
        if ($dono -eq $VPC) { aws ec2 delete-egress-only-internet-gateway --egress-only-internet-gateway-id $EIGW | Out-Null }
      }
    }
    $IGW = aws ec2 describe-internet-gateways --filters "Name=attachment.vpc-id,Values=$VPC" --query 'InternetGateways[0].InternetGatewayId' --output text
    if ($IGW -and $IGW -ne 'None') {
      aws ec2 detach-internet-gateway --internet-gateway-id $IGW --vpc-id $VPC
      aws ec2 delete-internet-gateway --internet-gateway-id $IGW
    }
    $subs = aws ec2 describe-subnets --filters "Name=vpc-id,Values=$VPC" --query 'Subnets[].SubnetId' --output text
    if ($subs) { foreach ($s in $subs.Split()) { aws ec2 delete-subnet --subnet-id $s } }
    # A tabela principal nao se apaga, e some junto com a VPC. Tentar e
    # ignorar o erro sai mais barato que descobrir qual das duas ela e.
    $rts = aws ec2 describe-route-tables --filters "Name=vpc-id,Values=$VPC" --query 'RouteTables[].RouteTableId' --output text
    if ($rts) { foreach ($r in $rts.Split()) { aws ec2 delete-route-table --route-table-id $r 2>$null | Out-Null } }
    $sgs = aws ec2 describe-security-groups --filters 'Name=group-name,Values=sd-nos' --query 'SecurityGroups[].GroupId' --output text
    if ($sgs) { foreach ($g in $sgs.Split()) { aws ec2 delete-security-group --group-id $g 2>$null | Out-Null } }
    aws ec2 delete-vpc --vpc-id $VPC
    if ($LASTEXITCODE -eq 0) {
      $VPC_APAGADA = $true
      diz 'sd-vpc apagada com tudo que havia dentro'
    } else {
      diz 'limpeza incompleta, a AWS recusou apagar a sd-vpc'
      diz 'recursos que ainda sobraram na VPC:'
      aws ec2 describe-network-interfaces --filters "Name=vpc-id,Values=$VPC" --query 'NetworkInterfaces[].{Interface:NetworkInterfaceId,Descricao:Description,Estado:Status}' --output table
      aws ec2 describe-subnets --filters "Name=vpc-id,Values=$VPC" --query 'Subnets[].{Subrede:SubnetId,Nome:Tags[?Key==`Name`]|[0].Value}' --output table
      aws ec2 describe-route-tables --filters "Name=vpc-id,Values=$VPC" --query 'RouteTables[].{Tabela:RouteTableId,Nome:Tags[?Key==`Name`]|[0].Value}' --output table
    }
  }

  # A varredura final por nome independe da existencia da sd-vpc. O grupo
  # sd-observador mora na VPC padrao, e o sd-eip pode sobreviver sem o NAT.
  $sgsRestantes = aws ec2 describe-security-groups --filters 'Name=group-name,Values=sd-observador' --query 'SecurityGroups[].GroupId' --output text
  if ($sgsRestantes) { foreach ($g in $sgsRestantes.Split()) { aws ec2 delete-security-group --group-id $g 2>$null | Out-Null } }
  $eipsRestantes = aws ec2 describe-addresses --filters 'Name=tag:Name,Values=sd-eip' --query 'Addresses[].AllocationId' --output text
  if ($eipsRestantes) { foreach ($e in $eipsRestantes.Split()) { aws ec2 release-address --allocation-id $e 2>$null | Out-Null } }

  Set-Location $env:USERPROFILE
  if (Test-Path $PASTA) { Remove-Item -Recurse -Force $PASTA }

  # A credencial sai por ultimo, e sai mesmo. Ela e temporaria e ja nao
  # serve, mas deixar credencial em maquina de laboratorio compartilhada
  # e o tipo de habito que custa caro fora da sala de aula.
  if ($env:AWS_PROFILE -eq $PERFIL) {
    aws configure set aws_access_key_id     '' --profile $PERFIL 2>$null
    aws configure set aws_secret_access_key '' --profile $PERFIL 2>$null
    aws configure set aws_session_token     '' --profile $PERFIL 2>$null
    diz "credencial do perfil $PERFIL apagada deste computador"
  }

  if (-not $VPC_APAGADA) {
    titulo 'limpeza incompleta'
    diz 'Espere 30 segundos e confira os recursos listados antes de tentar de novo.'
    exit 1
  }

  titulo 'pronto'
  diz 'A VPC padrao continua com o bloco IPv6 e as duas rotas do passo 2.'
  diz 'Elas somem sozinhas quando voce clicar em End Lab.'
  exit 0
}

# ------------------------------------------------------------
# Comeco
# ------------------------------------------------------------
titulo 'Pratica 03: preparando o ambiente'
diz 'Sistemas Distribuidos, IFSP Campus Salto'
Write-Host ''
preparar-credencial

if ($Apagar) { apagar-tudo }

$existente = id-da-vpc
if ($existente -and $existente -ne 'None') {
  morre "ja existe uma sd-vpc nesta conta ($existente). Rode com -Apagar antes, para nao ficar com duas redes iguais e nenhuma explicacao"
}

if (-not (Test-Path $PASTA)) { New-Item -ItemType Directory $PASTA | Out-Null }
Set-Location $PASTA

# ------------------------------------------------------------
titulo 'passo 1 de 6: a foto da conta antes de qualquer mudanca'
diz 'Guardo aqui como a conta esta agora, porque daqui a pouco ela muda.'
diz 'O roteiro pede que voce leia esta foto, e ela fica em:'
diz $ANTES
$foto = @()
$foto += "Foto da conta em $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss'), antes de a pratica 03 criar qualquer coisa."
$foto += ''
$foto += '== as redes que ja existem =='
$foto += (aws ec2 describe-vpcs --query 'Vpcs[].{VPC:VpcId,CIDR:CidrBlock,Padrao:IsDefault,IPv6:Ipv6CidrBlockAssociationSet[0].Ipv6CidrBlock,Nome:Tags[?Key==`Name`]|[0].Value}' --output table)
$foto += ''
$foto += '== as tabelas de rotas delas, com a contagem de linhas IPv6 =='
$foto += (aws ec2 describe-route-tables --query 'sort_by(RouteTables[].{Tabela:RouteTableId,VPC:VpcId,Rotas:length(Routes),LinhasIPv6:length(Routes[?DestinationIpv6CidrBlock!=null])},&VPC)' --output table)
$foto += ''
$foto += '== e as rotas, uma a uma =='
foreach ($RT in (aws ec2 describe-route-tables --query 'RouteTables[].RouteTableId' --output text).Split()) {
  $foto += "-- tabela $RT"
  $foto += (aws ec2 describe-route-tables --route-table-ids $RT --query 'RouteTables[0].Routes[].[DestinationCidrBlock,DestinationIpv6CidrBlock,GatewayId,Origin]' --output text)
}
[IO.File]::WriteAllLines($ANTES, [string[]]$foto, (New-Object System.Text.UTF8Encoding($false)))
diz 'foto guardada'

# ------------------------------------------------------------
titulo 'passo 2 de 6: dando saida e IPv6 a VPC padrao'
diz 'O no E, o observador de fora, vai nascer nesta rede.'
diz 'Ela precisa de duas coisas que nao tem, um bloco IPv6 e um caminho'
diz 'de saida. O gateway de internet dela ja existe, e nao ha rota ate ele.'
$VPC_PADRAO = aws ec2 describe-vpcs --filters Name=isDefault,Values=true --query 'Vpcs[0].VpcId' --output text
$IPV6_PADRAO = aws ec2 describe-vpcs --vpc-ids $VPC_PADRAO --query 'Vpcs[0].Ipv6CidrBlockAssociationSet[0].Ipv6CidrBlock' --output text
if ($IPV6_PADRAO -eq 'None') {
  diz 'pedindo um bloco /56 a Amazon'
  $t0 = Get-Date
  aws ec2 associate-vpc-cidr-block --vpc-id $VPC_PADRAO --amazon-provided-ipv6-cidr-block | Out-Null
  if ($LASTEXITCODE -ne 0) { morre 'nao consegui pedir o bloco IPv6' }
  $tentativas = 0
  while ($IPV6_PADRAO -eq 'None' -and $tentativas -lt 30) {
    Start-Sleep -Seconds 2
    $tentativas++
    $IPV6_PADRAO = aws ec2 describe-vpcs --vpc-ids $VPC_PADRAO --query 'Vpcs[0].Ipv6CidrBlockAssociationSet[0].Ipv6CidrBlock' --output text
  }
  diz "bloco $IPV6_PADRAO entregue em $(segundos $t0) s"
}
$SUB_PADRAO = aws ec2 describe-subnets --filters "Name=vpc-id,Values=$VPC_PADRAO" "Name=availability-zone,Values=$ZONA_A" --query 'Subnets[0].SubnetId' --output text
$jaTem = aws ec2 describe-subnets --subnet-ids $SUB_PADRAO --query 'Subnets[0].Ipv6CidrBlockAssociationSet[0].Ipv6CidrBlock' --output text
$RAIZ_PADRAO = $IPV6_PADRAO -replace '00::/56$', ''
if ($jaTem -eq 'None') {
  aws ec2 associate-subnet-cidr-block --subnet-id $SUB_PADRAO --ipv6-cidr-block ($RAIZ_PADRAO + '00::/64') | Out-Null
  diz "sub-rede de $ZONA_A recortada em $($RAIZ_PADRAO)00::/64"
}
$RT_PADRAO = aws ec2 describe-route-tables --filters "Name=vpc-id,Values=$VPC_PADRAO" --query 'RouteTables[0].RouteTableId' --output text
$IGW_PADRAO = aws ec2 describe-internet-gateways --filters "Name=attachment.vpc-id,Values=$VPC_PADRAO" --query 'InternetGateways[0].InternetGatewayId' --output text
# As DUAS rotas, e a de IPv4 nao e redundancia. A tabela da VPC padrao do
# Sandbox vem com a linha local e nada mais, mesmo tendo um gateway de
# internet ligado a ela. Verificado em duas sessoes reais em 2026-08-23,
# em contas diferentes.
aws ec2 create-route --route-table-id $RT_PADRAO --destination-cidr-block 0.0.0.0/0 --gateway-id $IGW_PADRAO 2>$null | Out-Null
aws ec2 create-route --route-table-id $RT_PADRAO --destination-ipv6-cidr-block ::/0 --gateway-id $IGW_PADRAO 2>$null | Out-Null
diz "as duas rotas de saida escritas, as duas para $IGW_PADRAO"
diz 'a rede que nao falava com ninguem virou rede de pilha dupla'

# ------------------------------------------------------------
titulo 'passo 3 de 6: a sd-vpc e as tres sub-redes'
diz "O bloco IPv4 e $CIDR_VPC, escolhido para nao repetir o 10.0.0.0/16"
diz 'que as duas redes do laboratorio ja usam.'
$VPC = aws ec2 create-vpc --cidr-block $CIDR_VPC --amazon-provided-ipv6-cidr-block --tag-specifications 'ResourceType=vpc,Tags=[{Key=Name,Value=sd-vpc}]' --query 'Vpc.VpcId' --output text
if ($LASTEXITCODE -ne 0) { morre 'nao consegui criar a VPC' }
aws ec2 wait vpc-available --vpc-ids $VPC
$PREFIXO = aws ec2 describe-vpcs --vpc-ids $VPC --query 'Vpcs[0].Ipv6CidrBlockAssociationSet[0].Ipv6CidrBlock' --output text
$RAIZ = $PREFIXO -replace '00::/56$', ''
diz "sd-vpc criada como $VPC, com o prefixo $PREFIXO"
Write-Host ''
diz 'Agora o recorte, que e o CIDR do topico 3 virando comando.'
diz 'A Amazon entrega um /56 por VPC e cada sub-rede leva um /64. Os oito'
diz 'bits de diferenca sao o que sobra para voce numerar as sub-redes, e e'
diz 'por isso que o que muda abaixo e o par final, de 00 para 01 e 02.'
Write-Host ''
Write-Host ('    {0,-14} {1,-16} {2}' -f 'sd-publica-a', '10.10.1.0/24', ($RAIZ + '00::/64'))
Write-Host ('    {0,-14} {1,-16} {2}' -f 'sd-privada-a', '10.10.2.0/24', ($RAIZ + '01::/64'))
Write-Host ('    {0,-14} {1,-16} {2}' -f 'sd-privada-b', '10.10.3.0/24', ($RAIZ + '02::/64'))
Write-Host ''

function criar-subrede($nome, $cidr4, $cidr6, $zona) {
  aws ec2 create-subnet --vpc-id $VPC --cidr-block $cidr4 --ipv6-cidr-block $cidr6 --availability-zone $zona --tag-specifications "ResourceType=subnet,Tags=[{Key=Name,Value=$nome}]" --query 'Subnet.SubnetId' --output text
}
$SUB_PUB    = criar-subrede 'sd-publica-a' '10.10.1.0/24' ($RAIZ + '00::/64') $ZONA_A
$SUB_PRIV_A = criar-subrede 'sd-privada-a' '10.10.2.0/24' ($RAIZ + '01::/64') $ZONA_A
$SUB_PRIV_B = criar-subrede 'sd-privada-b' '10.10.3.0/24' ($RAIZ + '02::/64') $ZONA_B
aws ec2 modify-subnet-attribute --subnet-id $SUB_PUB --map-public-ip-on-launch
diz "as tres criadas. Repare que a sd-privada-b fica em $ZONA_B, e as"
diz "outras duas em $ZONA_A. Essa escolha e medida no experimento 3."

# ------------------------------------------------------------
titulo 'passo 4 de 6: os tres dispositivos de borda'
diz 'A rede tem enderecos e nao tem nenhuma porta aberta. Nada entra e nada sai.'
$IGW = aws ec2 create-internet-gateway --tag-specifications 'ResourceType=internet-gateway,Tags=[{Key=Name,Value=sd-igw}]' --query 'InternetGateway.InternetGatewayId' --output text
aws ec2 attach-internet-gateway --internet-gateway-id $IGW --vpc-id $VPC
diz "gateway de internet $IGW criado e ligado. Ele atende os dois"
diz 'protocolos e deixa passar conversa iniciada dos dois lados.'
Write-Host ''

$tNat = Get-Date
$EIP = aws ec2 allocate-address --domain vpc --tag-specifications 'ResourceType=elastic-ip,Tags=[{Key=Name,Value=sd-eip}]' --query AllocationId --output text
$NAT = aws ec2 create-nat-gateway --subnet-id $SUB_PUB --allocation-id $EIP --tag-specifications 'ResourceType=natgateway,Tags=[{Key=Name,Value=sd-nat}]' --query 'NatGateway.NatGatewayId' --output text
diz "NAT gateway $NAT pedido. Ele so atende IPv4, precisou de um endereco"
diz "elastico reservado ($EIP), precisa morar numa sub-rede publica e leva"
diz 'um tempo para ficar de pe. Seguimos enquanto ele nasce.'
Write-Host ''

$tEigw = Get-Date
$EIGW = aws ec2 create-egress-only-internet-gateway --vpc-id $VPC --query 'EgressOnlyInternetGateway.EgressOnlyInternetGatewayId' --output text
$segEigw = segundos $tEigw
diz "gateway somente de saida $EIGW pronto em $segEigw s."
diz 'Ele e o equivalente do NAT gateway para IPv6, e so no resultado.'
diz 'Nasceu sem endereco, sem sub-rede e sem espera, porque nao traduz nada.'

# ------------------------------------------------------------
titulo 'passo 5 de 6: as duas tabelas de rotas'
diz 'Aqui mora o argumento da pratica. As duas tabelas tem a mesma forma'
diz 'e diferem em duas linhas, e sao essas duas linhas que decidem qual'
diz 'sub-rede e publica e qual e privada.'
$RT_PUB = aws ec2 create-route-table --vpc-id $VPC --tag-specifications 'ResourceType=route-table,Tags=[{Key=Name,Value=rt-publica}]' --query 'RouteTable.RouteTableId' --output text
aws ec2 create-route --route-table-id $RT_PUB --destination-cidr-block 0.0.0.0/0 --gateway-id $IGW | Out-Null
aws ec2 create-route --route-table-id $RT_PUB --destination-ipv6-cidr-block ::/0 --gateway-id $IGW | Out-Null
aws ec2 associate-route-table --route-table-id $RT_PUB --subnet-id $SUB_PUB | Out-Null
diz "rt-publica $RT_PUB, com os dois destinos de fora indo para o mesmo"
diz 'gateway de internet, e associada a sd-publica-a'

$RT_PRIV = aws ec2 create-route-table --vpc-id $VPC --tag-specifications 'ResourceType=route-table,Tags=[{Key=Name,Value=rt-privada}]' --query 'RouteTable.RouteTableId' --output text
aws ec2 create-route --route-table-id $RT_PRIV --destination-ipv6-cidr-block ::/0 --egress-only-internet-gateway-id $EIGW | Out-Null
aws ec2 associate-route-table --route-table-id $RT_PRIV --subnet-id $SUB_PRIV_A | Out-Null
aws ec2 associate-route-table --route-table-id $RT_PRIV --subnet-id $SUB_PRIV_B | Out-Null
diz "rt-privada $RT_PRIV, servindo as DUAS sub-redes privadas ao mesmo"
diz 'tempo, o que mostra que tabela e sub-rede sao objetos diferentes'
Write-Host ''

diz 'esperando o NAT gateway, que e a unica espera desta preparacao'
aws ec2 wait nat-gateway-available --nat-gateway-ids $NAT
if ($LASTEXITCODE -ne 0) { morre 'o NAT gateway nao ficou disponivel' }
$segNat = segundos $tNat
aws ec2 create-route --route-table-id $RT_PRIV --destination-cidr-block 0.0.0.0/0 --nat-gateway-id $NAT | Out-Null
diz "NAT gateway disponivel em $segNat s, e a rota IPv4 da rt-privada escrita"
Write-Host ''
diz 'Guarde a comparacao, porque ela e conteudo:'
diz "  gateway somente de saida  $segEigw s   sem endereco, sem sub-rede, nao traduz"
diz "  NAT gateway               $segNat s   com endereco, numa sub-rede, traduz"
diz 'Os dois entregam o mesmo resultado pratico, por mecanismos opostos.'

# ------------------------------------------------------------
titulo 'passo 6 de 6: os quatro nos'
diz 'Baixando o mesmo script de inicializacao que os quatro vao executar.'
try {
  Invoke-WebRequest -UseBasicParsing -Uri "$BASE_PUBLICADA/setup.sh" -OutFile (Join-Path $PASTA 'setup.sh') -ErrorAction Stop
} catch {
  morre "nao consegui baixar o setup.sh de $BASE_PUBLICADA"
}
diz "setup.sh baixado, $((Get-Item (Join-Path $PASTA 'setup.sh')).Length) bytes"

function abrir-portas($sg) {
  # Onde a VPC tem bloco IPv6, a regra de saida padrao ja cobre ::/0 e a AWS
  # responde InvalidPermission.Duplicate. Pedimos assim mesmo, para o script
  # servir tambem a uma rede so de IPv4, e engolimos a recusa.
  aws ec2 authorize-security-group-egress --group-id $sg --ip-permissions 'IpProtocol=-1,Ipv6Ranges=[{CidrIpv6=::/0}]' 2>$null | Out-Null
  aws ec2 authorize-security-group-ingress --group-id $sg --ip-permissions `
    'IpProtocol=tcp,FromPort=22,ToPort=22,IpRanges=[{CidrIp=0.0.0.0/0}],Ipv6Ranges=[{CidrIpv6=::/0}]' `
    'IpProtocol=tcp,FromPort=8080,ToPort=8080,IpRanges=[{CidrIp=0.0.0.0/0}],Ipv6Ranges=[{CidrIpv6=::/0}]' `
    'IpProtocol=icmp,FromPort=-1,ToPort=-1,IpRanges=[{CidrIp=0.0.0.0/0}]' `
    'IpProtocol=icmpv6,FromPort=-1,ToPort=-1,Ipv6Ranges=[{CidrIpv6=::/0}]' | Out-Null
}
$SG_NOS = aws ec2 create-security-group --group-name sd-nos --description 'Pratica 03 nos da sd-vpc' --vpc-id $VPC --query GroupId --output text
$SG_E   = aws ec2 create-security-group --group-name sd-observador --description 'Pratica 03 observador na VPC padrao' --vpc-id $VPC_PADRAO --query GroupId --output text
abrir-portas $SG_NOS
abrir-portas $SG_E
diz 'dois grupos de seguranca criados, os dois com a entrada aberta de'
diz 'proposito, para o experimento 1 medir roteamento e nao filtro'

$AMI = aws ec2 describe-images --owners amazon --filters 'Name=name,Values=al2023-ami-2023*-x86_64' 'Name=state,Values=available' --query 'sort_by(Images,&CreationDate)[-1].ImageId' --output text
diz "imagem mais recente do Amazon Linux 2023: $AMI"

function subir-no($nome, $sub, $sg, $publico) {
  aws ec2 run-instances --image-id $AMI --instance-type t3.micro --key-name vockey `
    --subnet-id $sub --security-group-ids $sg --ipv6-address-count 1 $publico `
    --iam-instance-profile Name=LabInstanceProfile `
    --metadata-options 'InstanceMetadataTags=enabled' `
    --user-data file://setup.sh `
    --tag-specifications "ResourceType=instance,Tags=[{Key=Name,Value=$nome}]" `
    --query 'Instances[0].InstanceId' --output text
}
Write-Host ''
diz 'sd-P na sd-publica-a, com endereco publico. Serve como porta de entrada.'
$NO_P = subir-no 'sd-P' $SUB_PUB    $SG_NOS '--associate-public-ip-address'
diz 'sd-E na VPC padrao, com endereco publico. Atua como observador de fora.'
$NO_E = subir-no 'sd-E' $SUB_PADRAO $SG_E   '--associate-public-ip-address'
diz 'sd-A na sd-privada-a, SEM endereco publico. E o alvo dos experimentos.'
$NO_A = subir-no 'sd-A' $SUB_PRIV_A $SG_NOS '--no-associate-public-ip-address'
diz "sd-B na sd-privada-b, em $ZONA_B. So ele muda de zona, e e essa a"
diz 'unica diferenca que o experimento 3 vai medir contra o sd-A.'
$NO_B = subir-no 'sd-B' $SUB_PRIV_B $SG_NOS '--no-associate-public-ip-address'
Write-Host ''
diz 'os quatro sobem em paralelo, entao a espera e a de um so'
aws ec2 wait instance-running --instance-ids $NO_P $NO_E $NO_A $NO_B

function endereco($id, $campo) {
  aws ec2 describe-instances --instance-ids $id --query "Reservations[0].Instances[0].$campo" --output text
}

$linhas = @(
  "IP_PUB_P=$(endereco $NO_P 'PublicIpAddress')",
  "IPV6_P=$(endereco $NO_P 'Ipv6Address')",
  "IP_PRIV_A=$(endereco $NO_A 'PrivateIpAddress')",
  "IPV6_A=$(endereco $NO_A 'Ipv6Address')",
  "IP_PRIV_B=$(endereco $NO_B 'PrivateIpAddress')",
  "IPV6_B=$(endereco $NO_B 'Ipv6Address')",
  "IP_PUB_E=$(endereco $NO_E 'PublicIpAddress')",
  "IPV6_E=$(endereco $NO_E 'Ipv6Address')",
  "RT_PRIV=$RT_PRIV",
  "SG_NOS=$SG_NOS",
  "IGW=$IGW",
  "EIGW=$EIGW",
  "NAT=$NAT"
)
[IO.File]::WriteAllLines($FICHA, [string[]]$linhas, (New-Object System.Text.UTF8Encoding($false)))

titulo 'pronto. O ambiente da pratica 03 esta de pe'
diz 'Copie o bloco abaixo inteiro e cole na ficha do roteiro, no campo'
diz 'que diz colar de uma vez. Ele tambem ficou guardado em:'
diz $FICHA
Write-Host ''
$linhas | ForEach-Object { Write-Host $_ }
Write-Host ''
diz 'As instancias ainda estao instalando as ferramentas de rede.'
diz 'Espere um minuto antes de abrir as janelas do experimento 1.'
diz "A foto da conta antes das mudancas esta em $ANTES."
