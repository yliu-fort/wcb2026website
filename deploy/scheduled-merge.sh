#!/usr/bin/env bash
# Merge one pull request at a set time, so that a change can go live with
# nobody at the keyboard. bergen2027-scheduled-merge.timer decides when; this
# decides whether. See "Scheduled releases" in deploy/README.md.
#
# Reads, from /etc/bergen2027-scheduled-merge.env via the unit:
#   RELEASE_PR      the pull request to merge
#   RELEASE_SHA     the head commit that was reviewed. Anything else is refused,
#                   so a push to the branch after arming cannot reach the site.
#   RELEASE_EXPECT  text the published bundle must contain once the release is
#                   live, and must not contain before it
#
#   --dry-run       every check on the pull request, and no merge; then the
#                   live checks against what is published now, looking for
#                   DRYRUN_EXPECT instead of RELEASE_EXPECT
#
# Merging is the only thing it does to the outside world. GitHub Pages then
# deploys from the push to main, and bergen2027-autopublish brings the
# self-hosted origin along within five minutes: the same two paths as a merge
# made by hand, so nothing here can publish what a merge would not.
set -euo pipefail

REPO=yliu-fort/wcb2026website
PAGES=https://yliu-fort.github.io/wcb2026website/
SELF=wavecoupling2027.eu
STATE_DIR=${STATE_DIRECTORY:-/var/lib/bergen2027-scheduled-merge}

# Transient trouble (a check still running, GitHub briefly unavailable, a
# mergeability GitHub has not computed yet) is retried: four times 30 seconds
# apart, since most of it clears in seconds and the release time matters, then
# every five minutes, for about two hours in all. Anything retrying cannot fix
# refuses at once.
TRIES=27
QUICK_TRIES=4
QUICK_PAUSE=30
PAUSE=300

DRY_RUN=0
[ "${1:-}" = "--dry-run" ] && DRY_RUN=1

: "${RELEASE_PR:?RELEASE_PR is not set}"
: "${RELEASE_SHA:?RELEASE_SHA is not set}"
: "${RELEASE_EXPECT:?RELEASE_EXPECT is not set}"
export RELEASE_SHA

log() { printf '%s %s\n' "$(date -u +%FT%TZ)" "$*"; }
# One line per outcome in $STATE_DIR/result, so "did it happen?" has an answer
# that outlives the journal.
record() {
  local tag=''
  [ "$DRY_RUN" = 1 ] && tag='dry run: '
  printf '%s %sPR #%s %s\n' "$(date -u +%FT%TZ)" "$tag" "$RELEASE_PR" "$*" \
    >> "$STATE_DIR/result" 2>/dev/null || true
}
refuse() { log "REFUSED: $*"; record "refused: $*"; exit 2; }

# One look at the pull request, as a verdict: "ready", "merged <sha>",
# "wait <why>" or "refuse <why>".
verdict() {
  gh pr view "$RELEASE_PR" --repo "$REPO" \
    --json state,isDraft,headRefOid,mergeable,statusCheckRollup,mergeCommit \
    --jq '
      def failed: ((.conclusion // "") | IN("FAILURE","ERROR","CANCELLED","TIMED_OUT","ACTION_REQUIRED","STARTUP_FAILURE"))
                  or ((.state // "") | IN("FAILURE","ERROR"));
      def running: ((.status // "COMPLETED") != "COMPLETED") or ((.state // "") | IN("PENDING","EXPECTED"));
      if .state == "MERGED" then "merged \(.mergeCommit.oid)"
      elif .state != "OPEN" then "refuse the pull request is \(.state | ascii_downcase)"
      elif .headRefOid != env.RELEASE_SHA then "refuse its head is \(.headRefOid), not the armed \(env.RELEASE_SHA)"
      elif .isDraft then "refuse it is a draft"
      elif any(.statusCheckRollup[]; failed) then "refuse a check failed: \([.statusCheckRollup[] | select(failed) | .name // .context] | join(", "))"
      elif (.statusCheckRollup | length) == 0 then "wait no checks have reported yet"
      elif any(.statusCheckRollup[]; running) then "wait checks are still running"
      elif .mergeable == "CONFLICTING" then "refuse it conflicts with main"
      elif .mergeable != "MERGEABLE" then "wait mergeability is \(.mergeable)"
      else "ready" end'
}

# Does the page's script bundle contain the text? $1 page URL, $2 text, then
# extra curl arguments. The page is fetched with a throwaway query string,
# because GitHub Pages' CDN caches index.html for ten minutes; the bundle's
# own name changes with its content, so it needs none.
bundle_has() {
  local page=$1 text=$2 html js body
  shift 2
  html=$(curl -fsS -m 30 "$@" "${page}?release-check=$(date +%s%N)") || return 1
  js=$(grep -o 'assets/main-[A-Za-z0-9_-]*\.js' <<<"$html" | head -n 1) || return 1
  [ -n "$js" ] || return 1
  # Into a variable first: piping curl into grep -q under pipefail reports a
  # miss whenever grep matches early, because curl then dies writing the rest.
  body=$(curl -fsS -m 30 "$@" "${page}${js}") || return 1
  grep -qF -- "$text" <<<"$body"
}

# Poll until the text is live on one origin. $1 name, $2 minutes, then
# bundle_has's arguments.
until_live() {
  local name=$1 minutes=$2 end
  shift 2
  end=$(( $(date +%s) + minutes * 60 ))
  until bundle_has "$@"; do
    if [ "$(date +%s)" -ge "$end" ]; then
      log "NOT live on $name after $minutes minutes"
      return 1
    fi
    sleep 30
  done
  log "live on $name"
}

log "PR #$RELEASE_PR, armed at $RELEASE_SHA$([ "$DRY_RUN" = 1 ] && echo ', dry run')"
merged=''
ready=0
for try in $(seq 1 "$TRIES"); do
  v=$(verdict 2>&1) || v="wait gh failed: $v"
  case "$v" in
    'merged '*)
      merged=${v#merged }
      log "merged as $merged"
      break ;;
    ready)
      if [ "$DRY_RUN" = 1 ]; then
        log "ready: it would be merged now"
        ready=1
        break
      fi
      log "merging"
      if out=$(gh pr merge "$RELEASE_PR" --repo "$REPO" --squash \
                 --match-head-commit "$RELEASE_SHA" 2>&1); then
        if [ -n "$out" ]; then log "$out"; fi
        continue        # the next look reads back the merge commit
      fi
      v="wait the merge failed: $out" ;;
    'refuse '*)
      refuse "${v#refuse }" ;;
  esac
  if [ "$DRY_RUN" = 1 ]; then
    log "not ready: ${v#wait }"
    break
  fi
  pause=$PAUSE
  if [ "$try" -le "$QUICK_TRIES" ]; then pause=$QUICK_PAUSE; fi
  log "not yet: ${v#wait } (try $try of $TRIES, next in ${pause}s)"
  if [ "$try" -lt "$TRIES" ]; then sleep "$pause"; fi
done

if [ "$DRY_RUN" = 0 ] && [ -z "$merged" ]; then
  refuse "gave up after $TRIES tries: ${v#wait }"
fi

# From here on the merge has happened (or, in a dry run, would have). Watch
# both origins pick it up. Nothing below changes anything, so a failure here
# means "go and look", not "merge again".
expect=$RELEASE_EXPECT
[ "$DRY_RUN" = 1 ] && expect=${DRYRUN_EXPECT:-Bergen 2027}
live=1
until_live 'GitHub Pages' 30 "$PAGES" "$expect" || live=0
# Pinned to loopback, as verify-exposure does: from this VM the public address
# is delivered locally anyway, so this checks what nginx serves, not the path
# from outside.
until_live "$SELF" 20 "https://$SELF/" "$expect" --resolve "$SELF:443:127.0.0.1" || live=0

if [ "$DRY_RUN" = 1 ]; then
  if [ "$ready" = 1 ] && [ "$live" = 1 ]; then
    record "ready, and the live checks work"
    log "dry run passed"
    exit 0
  fi
  record "not ready (${v#wait }) or a live check failed"
  log "dry run FAILED"
  exit 1
fi

if [ "$live" = 1 ]; then
  record "merged as $merged, live on both origins"
  log "released"
  exit 0
fi
record "merged as $merged, but NOT confirmed live on both origins"
log "merged, but not confirmed live: check the Pages run with" \
    "'gh run list --commit $merged' and 'journalctl -u bergen2027-autopublish'"
exit 1
