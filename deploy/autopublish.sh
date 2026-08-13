#!/usr/bin/env bash
# Keeps oceancoupling.eu in step with origin/main.
#
# GitHub Pages redeploys itself from main through Actions. This origin does not,
# and on 2026-08-13 it spent a day serving a build whose form links were still
# REPLACE_WITH_ABSTRACT_FORM_ID, because a merge landed and nobody ran
# publish.sh. That is the gap this closes.
#
# Pull-based on purpose. A GitHub Action pushing over SSH would need an inbound
# port, a deploy key on the runner and a secret in the repo; this host spent a
# lot of effort getting its attack surface down to 22/80/443 and no secrets on
# disk. Here the VM asks GitHub what main is, and GitHub is told nothing.
#
# Works against its OWN clone in /srv/bergen2027-publish, never ~/wcb2026website.
# The working tree there belongs to a human who may be mid-edit on another
# branch, and `git reset --hard` in it would be an expensive surprise.
#
# Publishing still goes through deploy/publish.sh, so every preflight — secrets,
# dotfiles, symlinks, placeholder form URLs, Google font fetches — gates this
# path exactly as it gates a manual publish. If any of them fires, nothing is
# mirrored and the state file is not advanced, so the next tick tries again.
#
# Usage:  deploy/autopublish.sh [--force]
#           --force   publish even when origin/main has not moved

set -euo pipefail

# Overridable so the script can be exercised against a scratch clone without
# touching the real one. Nothing in normal operation sets these; the defaults
# are the contract.
REPO_URL="${AUTOPUBLISH_REPO_URL:-https://github.com/yliu-fort/wcb2026website.git}"
BRANCH="${AUTOPUBLISH_BRANCH:-main}"
CLONE="${AUTOPUBLISH_CLONE:-/srv/bergen2027-publish}"
STATE_DIR="${AUTOPUBLISH_STATE_DIR:-/var/lib/bergen2027-autopublish}"
STATE="$STATE_DIR/last-published"
LOCK="$STATE_DIR/lock"
DOCROOT=/var/www/bergen2027

FORCE=0
[[ "${1:-}" == "--force" ]] && FORCE=1

log() { printf '%s %s\n' "$(date -Is)" "$*"; }
die() { log "FAILED: $*"; exit 1; }

# --- one-time setup, idempotent ---------------------------------------------
if [[ ! -d "$STATE_DIR" ]]; then
  sudo mkdir -p "$STATE_DIR"
  sudo chown ubuntu:ubuntu "$STATE_DIR"
fi

if [[ ! -d "$CLONE/.git" ]]; then
  log "first run: cloning $REPO_URL into $CLONE"
  sudo mkdir -p "$(dirname "$CLONE")"
  sudo install -d -o ubuntu -g ubuntu "$CLONE"
  git clone --quiet "$REPO_URL" "$CLONE"
fi

# --- serialise: a slow build must not overlap the next tick ------------------
exec 9>"$LOCK"
if ! flock -n 9; then
  log "another run holds the lock; skipping this tick"
  exit 0
fi

# --- what does main say? -----------------------------------------------------
cd "$CLONE"
git remote set-url origin "$REPO_URL"
git fetch --quiet --prune origin "$BRANCH" || die "git fetch"

remote_sha=$(git rev-parse "origin/$BRANCH")
last_sha=$(cat "$STATE" 2>/dev/null || true)

# A missing or empty docroot means publish regardless of what the state file
# claims — the state can outlive the thing it describes.
docroot_ok=1
[[ -f "$DOCROOT/index.html" ]] || docroot_ok=0

if (( ! FORCE )) && [[ "$remote_sha" == "$last_sha" ]] && (( docroot_ok )); then
  exit 0   # quiet: this is the common case, every five minutes, forever
fi

if (( ! docroot_ok )); then
  log "docroot has no index.html; publishing regardless of state"
fi

last_short="none"
[[ -n "$last_sha" ]] && last_short="${last_sha:0:12}"
log "origin/$BRANCH is ${remote_sha:0:12} (published: $last_short); publishing"

# --- take exactly what main says, nothing local ------------------------------
git reset --quiet --hard "origin/$BRANCH" || die "git reset"
git clean --quiet -fdx -e node_modules -e dist || die "git clean"

# node_modules only when the lockfile actually moved; `npm ci` is ~15s and hits
# the network, which is a lot to spend every time a docs commit lands. The hash
# lives outside the clone because `git clean -x` above would delete it.
lock_hash=$(sha256sum package-lock.json | cut -d' ' -f1)
if [[ ! -d node_modules ]] || [[ "$(cat "$STATE_DIR/npm-lock-hash" 2>/dev/null || true)" != "$lock_hash" ]]; then
  log "package-lock.json changed (or node_modules missing); running npm ci"
  npm ci --no-audit --no-fund --silent || die "npm ci"
  printf '%s\n' "$lock_hash" > "$STATE_DIR/npm-lock-hash"
fi

# --- publish through the sanctioned path -------------------------------------
# publish.sh builds with --base=/, runs every preflight, mirrors, reloads nginx
# and ends by exec'ing verify-exposure.sh. Its exit status is the whole story.
if ! "$CLONE/deploy/publish.sh"; then
  die "publish.sh refused or errored for ${remote_sha:0:12} — docroot left untouched"
fi

printf '%s\n' "$remote_sha" > "$STATE"
log "published ${remote_sha:0:12}"
