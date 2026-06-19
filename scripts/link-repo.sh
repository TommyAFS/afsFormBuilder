#!/usr/bin/env bash
# Recreate the symlinks that point this sandbox at the real website-front-end
# repo. The symlinks are machine-specific and gitignored, so run this after a
# fresh clone (or if the repo moves).
#
# Usage: ./scripts/link-repo.sh [path-to-website-front-end]
set -euo pipefail

REPO="${1:-../../website-front-end}"
REPO="$(cd "$REPO" && pwd)"   # resolve to absolute
cd "$(dirname "$0")/.."

echo "Linking against repo: $REPO"

for d in api constants contexts hooks logging models svgs test types utils; do
  ln -snf "$REPO/$d" "$d"
done
mkdir -p components
ln -snf "$REPO/components/atoms" components/atoms
ln -snf "$REPO/components/molecules" components/molecules

# Static assets (fonts, images, svg-sprites) referenced as /fonts, /media, etc.
ln -snf "$REPO/public" public

# Keep the svgr config in sync with the repo.
cp "$REPO/.svgrrc.js" .svgrrc.js

echo "Done. Symlinks created."
