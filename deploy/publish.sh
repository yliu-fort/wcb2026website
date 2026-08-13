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
TARGET="$DOCROOT"

red()  { printf '\033[31m%s\033[0m\n' "$*"; }
grn()  { printf '\033[32m%s\033[0m\n' "$*"; }
die()  { red "REFUSED: $*"; exit 1; }

# --- build ------------------------------------------------------------------
if [[ "${1:-}" != "--skip-build" ]]; then
  echo "==> building"
  # --base=/ overrides the '/wcb2026website/' in vite.config.js. That default is
  # right for GitHub Pages, which serves from a sub-path; here we own the domain
  # root. The GH Pages workflow runs a plain `npm run build` and is unaffected.
  ( cd "$REPO" && npm run build -- --base=/ )
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

# 5. Placeholder form URLs. CI blocks these on the GitHub Pages path; without
#    the same check here the self-hosted origin happily ships dead links, which
#    is exactly how it went live with REPLACE_WITH_ABSTRACT_FORM_ID in the
#    bundle. A dead registration link on a conference site is worse than a
#    missing one — visitors think they signed up.
#    Asks config.js rather than grepping the bundle: the bundle contains the
#    detector string and the source map contains the comment explaining it, so
#    a text search matches itself and stays red forever.
if node "$REPO/scripts/check-form-urls.mjs" >/dev/null 2>&1; then
  placeholders=0
else
  placeholders=1
fi

if (( placeholders )); then
  if [[ "${ALLOW_PLACEHOLDERS:-}" == 1 ]]; then
    printf '\033[33m    WARN: publishing with placeholder form URLs (ALLOW_PLACEHOLDERS=1)\033[0m\n'
  else
    node "$REPO/scripts/check-form-urls.mjs" || true
    die "placeholder form URL in src/config.js. Set the real URLs, or re-run with ALLOW_PLACEHOLDERS=1 to ship anyway."
  fi
fi

grn "    preflight clean ($(find "$SRC" -type f | wc -l) files)"

# robots.txt comes from SITE.indexable, which is an explicit launch switch and
# not inferred from the placeholder state above. Those are different questions:
# the registration URL is legitimately a placeholder until December while
# abstract submission is open from August, and inferring one from the other
# would hide the site from search for exactly the months authors are looking for
# it. Printed on every publish, loudly while it is off, so it is hard to leave
# wrong in either direction.
if node "$REPO/scripts/site-indexable.mjs" >/dev/null 2>&1; then
  printf 'User-agent: *\nAllow: /\n' > "$SRC/robots.txt"
  grn "    robots.txt: indexable"
else
  printf 'User-agent: *\nDisallow: /\n' > "$SRC/robots.txt"
  printf '\033[33m    robots.txt: Disallow / — set SITE.indexable = true in src/config.js at launch\033[0m\n'
fi

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
