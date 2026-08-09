#!/usr/bin/env bash
# Probe the running server for the things we believe are impossible.
#
# Assertions, not assumptions: publish.sh runs this after every deploy, and a
# systemd timer runs it hourly. Run it by hand against the public address to
# check what the internet actually sees — from another machine, since probing
# this host's own public IP from the host routes over loopback, which ufw
# exempts, and every check would pass for the wrong reason:
#
#     deploy/verify-exposure.sh https://oceancoupling.eu
#
# The host's IP is deliberately not written down here: this repo is public, and
# naming it would hand a scanner the target plus README.md's inventory of what
# runs on it.

set -uo pipefail

DOMAIN=oceancoupling.eu
LOCAL=0
CURL_EXTRA=()

if [[ -n "${1:-${SITE_URL:-}}" ]]; then
  # Explicit target: whatever the caller named, over the real network.
  BASE="${1:-$SITE_URL}"
else
  # No argument — this is the post-publish and hourly-timer path, running on the
  # host. The config answers only to the real hostname (everything else gets a
  # 444 from the catch-all), so pin the name to loopback rather than requesting
  # 127.0.0.1 directly, which would fail for the wrong reason. Falls back to
  # plain HTTP if TLS is not up yet.
  LOCAL=1
  if ss -tlnH 2>/dev/null | grep -q ':443 '; then
    BASE="https://$DOMAIN"
    CURL_EXTRA=(--resolve "$DOMAIN:443:127.0.0.1" --resolve "$DOMAIN:80:127.0.0.1")
  else
    BASE="http://$DOMAIN"
    CURL_EXTRA=(--resolve "$DOMAIN:80:127.0.0.1")
  fi
fi

fails=0

red() { printf '\033[31m%s\033[0m\n' "$*"; }
grn() { printf '\033[32m%s\033[0m\n' "$*"; }

code() {
  curl -s -o /dev/null -w '%{http_code}' --path-as-is --max-time 10 \
       "${CURL_EXTRA[@]}" "$1"
}

# Must be reachable.
want_200() {
  local c; c=$(code "$BASE$1")
  if [[ "$c" == 200 ]]; then grn "  ok    200  $1"
  else red "  FAIL  $c  $1 (expected 200)"; ((fails++)); fi
}

# Must NOT be reachable. 403/404 are both fine; 200 is a leak.
want_blocked() {
  local c; c=$(code "$BASE$1")
  if [[ "$c" == 200 ]]; then red "  LEAK  200  $1"; ((fails++))
  else grn "  ok    $c  $1"; fi
}

echo "== reachability ($BASE)"
want_200 /
want_200 /index.html

echo "== path traversal toward the home directory"
want_blocked /.claude/settings.json
want_blocked /../.claude/settings.json
want_blocked /../../../home/ubuntu/.claude/settings.json
want_blocked /../../../home/ubuntu/.claude/.credentials.json
want_blocked /..%2f..%2f..%2fhome/ubuntu/.claude/settings.json
want_blocked /home/ubuntu/.claude/settings.json

echo "== repository and dotfile exposure"
want_blocked /.git/config
want_blocked /.env
want_blocked /.well-known/../.env

echo "== system files"
want_blocked /../../../etc/passwd
want_blocked /etc/passwd

# Transport checks, only meaningful against the real name.
if [[ "$BASE" == https://* ]]; then
  host=${BASE#https://}; host=${host%%/*}

  echo "== TLS"
  if curl -s -o /dev/null --max-time 10 "${CURL_EXTRA[@]}" "https://$host/"; then grn "  ok    certificate validates"
  else red "  FAIL  certificate does not validate"; ((fails++)); fi

  connect="$host:443"; (( LOCAL )) && connect="127.0.0.1:443"
  days=$(echo | openssl s_client -servername "$host" -connect "$connect" 2>/dev/null \
         | openssl x509 -noout -enddate 2>/dev/null | cut -d= -f2)
  if [[ -n "$days" ]]; then
    left=$(( ( $(date -d "$days" +%s) - $(date +%s) ) / 86400 ))
    if (( left > 20 )); then grn "  ok    cert valid for $left more days"
    else red "  WARN  cert expires in $left days — check certbot.timer"; fi
  fi

  # Plain HTTP must not serve content; it must hand visitors to HTTPS.
  rc=$(curl -s -o /dev/null -w '%{http_code}' --max-time 10 "${CURL_EXTRA[@]}" "http://$host/")
  if [[ "$rc" =~ ^30 ]]; then grn "  ok    http -> https redirect ($rc)"
  else red "  FAIL  http://$host/ returned $rc, expected a redirect"; ((fails++)); fi
fi

# Only meaningful on the host itself.
if (( LOCAL )); then
  echo "== host controls"
  ph=$(systemctl show nginx -p ProtectHome --value 2>/dev/null)
  if [[ "$ph" == "yes" ]]; then grn "  ok    nginx ProtectHome=yes (/home invisible to the process)"
  else red "  FAIL  nginx ProtectHome=$ph — hardening drop-in not loaded"; ((fails++)); fi

  ps_=$(systemctl show nginx -p ProtectSystem --value 2>/dev/null)
  if [[ "$ps_" == "strict" ]]; then grn "  ok    nginx ProtectSystem=strict"
  else red "  FAIL  nginx ProtectSystem=$ps_"; ((fails++)); fi

  if sudo -n ufw status 2>/dev/null | grep -q '^Status: active'; then grn "  ok    ufw active"
  else red "  FAIL  ufw is not active"; ((fails++)); fi

  # Anything listening on 0.0.0.0 that is not nginx:80 or sshd:22 is a service
  # someone bound too widely — ufw is blocking it today, but it should not exist.
  stray=$(ss -tlnH 2>/dev/null | awk '$4 ~ /^(0\.0\.0\.0|\[::\]):/ {split($4,a,":"); p=a[length(a)]; if (p!="22" && p!="80" && p!="443") print p}' | sort -u)
  if [[ -z "$stray" ]]; then grn "  ok    no unexpected wildcard listeners"
  else red "  WARN  services bound to all interfaces on port(s): $stray"; fi

  perm=$(stat -c '%a' /home/ubuntu/.claude 2>/dev/null)
  if [[ "$perm" == "700" ]]; then grn "  ok    ~/.claude is 0700"
  else red "  FAIL  ~/.claude is $perm, expected 700"; ((fails++)); fi
fi

echo
if (( fails )); then red "$fails check(s) failed"; exit 1; fi
grn "all checks passed"
