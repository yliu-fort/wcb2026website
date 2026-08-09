#!/usr/bin/env bash
# The only sanctioned way to put files on the public server.
#
# Builds the site, refuses to publish anything that looks like it should not be
# public, then mirrors dist/ into the docroot and re-checks the live server.
# Nothing else should ever write to /var/www/bergen2027.
#
# Usage:  deploy/publish.sh [--skip-build]

set -euo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SRC="$REPO/dist"
DOCROOT=/var/www/bergen2027
TARGET="$DOCROOT/wcb2026website"

red()  { printf '\033[31m%s\033[0m\n' "$*"; }
grn()  { printf '\033[32m%s\033[0m\n' "$*"; }
die()  { red "REFUSED: $*"; exit 1; }

# --- build ------------------------------------------------------------------
if [[ "${1:-}" != "--skip-build" ]]; then
  echo "==> building"
  ( cd "$REPO" && npm run build )
fi

[[ -d "$SRC" ]]             || die "no dist/ — run npm run build"
[[ -f "$SRC/index.html" ]]  || die "dist/ has no index.html; refusing to publish what is probably the wrong directory"

# --- preflight: what are we about to make public? ---------------------------
echo "==> preflight scan of dist/"

# 1. Dotfiles. Vite should never emit one; if it did, something is wrong.
if dots=$(find "$SRC" -name '.*' -not -name '.' -not -path "$SRC" -print -quit); then
  [[ -n "$dots" ]] && die "dotfile in dist/: $dots"
fi

# 2. Anything whose name suggests a credential.
if named=$(find "$SRC" \( -iname '*.env' -o -iname '.env*' -o -iname '*.pem' \
      -o -iname '*.key' -o -iname 'id_rsa*' -o -iname '*.p12' -o -iname '*.pfx' \
      -o -iname '*secret*' -o -iname '*credential*' \) -print -quit); then
  [[ -n "$named" ]] && die "credential-looking file in dist/: $named"
fi

# 3. Symlinks. One pointing outside dist/ would be an escape hatch out of the
#    docroot, so no symlinks at all — a static build has no need for them.
if link=$(find "$SRC" -type l -print -quit); then
  [[ -n "$link" ]] && die "symlink in dist/: $link"
fi

# 4. Secrets inlined at build time. Vite bakes any VITE_*-prefixed env var into
#    the bundle, which is the easy way to leak a key without noticing.
if hits=$(grep -rIlE 'sk-ant-|ghp_|github_pat_|AKIA[0-9A-Z]{16}|AIza[0-9A-Za-z_-]{35}|-----BEGIN [A-Z ]*PRIVATE KEY-----' "$SRC" 2>/dev/null); then
  [[ -n "$hits" ]] && die "possible secret baked into the bundle: $hits"
fi

grn "    preflight clean ($(find "$SRC" -type f | wc -l) files)"

# --- publish ----------------------------------------------------------------
echo "==> mirroring dist/ -> $TARGET"
sudo mkdir -p "$TARGET"
sudo rsync -a --delete --no-owner --no-group "$SRC/" "$TARGET/"

sudo chown -R ubuntu:www-data "$DOCROOT"
sudo find "$DOCROOT" -type d -exec chmod 750 {} +
sudo find "$DOCROOT" -type f -exec chmod 640 {} +

sudo systemctl reload nginx
grn "    published"

# --- prove it ---------------------------------------------------------------
exec "$REPO/deploy/verify-exposure.sh"
