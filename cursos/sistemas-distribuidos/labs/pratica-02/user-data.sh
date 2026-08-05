#!/bin/bash
# ============================================================
# Pratica 02 (Topico 2) - Sistemas Distribuidos - IFSP Salto
# Carregador do script de inicializacao (campo "User data" do EC2).
#
# O campo "User data" aceita no maximo 16 KB, e o setup.sh da
# pratica passa disso. Entao o que voce cola no console e apenas
# este carregador. Ele baixa o setup.sh publicado no roteiro e o
# executa. O conteudo baixado esta inteiro na pagina, para leitura
# antes da execucao.
#
# Sem acentos de proposito: o user data executa antes do locale
# estar definido. Testado em Amazon Linux 2023.
# ============================================================
set -x
exec > /var/log/sd-setup.log 2>&1

URL=https://diedu.com.br/cursos/sistemas-distribuidos/labs/pratica-02/setup.sh
DESTINO=/opt/sd-setup.sh

# A rede da instancia pode ficar pronta alguns segundos depois do
# user data comecar. As tentativas cobrem essa janela.
if ! curl -fsSL --retry 5 --retry-delay 3 --max-time 60 -o "$DESTINO" "$URL"; then
  echo "FALHA: nao consegui baixar $URL"
  echo "Remedio: copie o setup.sh da pagina do roteiro para dentro da"
  echo "instancia e rode 'sudo bash setup.sh'."
  exit 1
fi

# Identifica a copia baixada, para o caso de a publicada estar
# atrasada em relacao ao roteiro que voce esta lendo.
sha256sum "$DESTINO"

bash "$DESTINO"
