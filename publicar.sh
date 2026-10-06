#!/bin/bash
# Publica a Agenda Pratkar no GitHub.
# Uso:  bash publicar.sh
set -u
GH="$HOME/.local/bin/gh"
REPO="omaycondias/agenda-pratkar"
cd "$(dirname "$0")" || exit 1

echo "→ 1/4  Autenticando no GitHub"
if ! "$GH" auth status >/dev/null 2>&1; then
  "$GH" auth login --web --git-protocol https || { echo "✗ login cancelado"; exit 1; }
else
  echo "   já autenticado"
fi

echo "→ 2/4  Ligando o git à sua conta"
"$GH" auth setup-git || exit 1

echo "→ 3/4  Preparando o repositório $REPO"
if "$GH" repo view "$REPO" >/dev/null 2>&1; then
  echo "   já existe — reaproveitando"
  git remote set-url origin "https://github.com/$REPO.git" 2>/dev/null \
    || git remote add origin "https://github.com/$REPO.git"
else
  echo "   criando (público)"
  "$GH" repo create "$REPO" --public \
    --description "Landing page da Jogamos Shop — grupo de ofertas no WhatsApp" \
    || { echo "✗ não consegui criar"; exit 1; }
  git remote set-url origin "https://github.com/$REPO.git" 2>/dev/null \
    || git remote add origin "https://github.com/$REPO.git"
fi

echo "→ 4/4  Enviando os arquivos"
if git push -u origin main; then
  echo ""
  echo "✓ Pronto: https://github.com/$REPO"
  echo "  Volte no Claude e diga: 'subiu'"
else
  echo ""
  echo "✗ O push foi rejeitado — o repositório já tem conteúdo."
  echo "  NADA foi perdido. Volte no Claude e diga: 'push rejeitado'"
  echo "  que eu faço o merge sem apagar o que está lá."
  exit 1
fi
