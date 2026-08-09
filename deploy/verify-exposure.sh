#!/usr/bin/env bash
# Probe the running server for the things we believe are impossible.
#
# Assertions, not assumptions: publish.sh runs this after every deploy, and a
# systemd timer runs it hourly. Run it by hand against the public address to
# check what the internet actually sees — from another machine, since probing
# this host's own public IP from the host routes over loopback, which ufw
# exempts, and every check would pass for the wrong reason:
#
#     deploy/verify-exposure.sh http://<public-ip>
#
# The address is deliberately not hardcoded: this repo is public, and naming the
# host here would hand a scanner the target plus the stack documented in
# README.md. Keep it in your shell history or a local untracked file.

set -uo pipefail
BASE="${1:-${SITE_URL:-http://127.0.0.1}}"
fails=0

red() { printf '\033[31m%s\033[0m\n' "$*"; }
grn() { printf '\033[32m%s\033[0m\n' "$*"; }

code() { curl -s -o /dev/null -w '%{http_code}' --path-as-is --max-time 10 "$1"; }

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
want_200 /wcb2026website/
want_200 /wcb2026website/index.html

echo "== path traversal toward the home directory"
want_blocked /.claude/settings.json
want_blocked /../.claude/settings.json
want_blocked /wcb2026website/../../../home/ubuntu/.claude/settings.json
want_blocked /wcb2026website/../../../home/ubuntu/.claude/.credentials.json
want_blocked /wcb2026website/..%2f..%2f..%2fhome/ubuntu/.claude/settings.json
want_blocked /home/ubuntu/.claude/settings.json

echo "== repository and dotfile exposure"
want_blocked /.git/config
want_blocked /wcb2026website/.git/config
want_blocked /.env
want_blocked /wcb2026website/.env

echo "== system files"
want_blocked /wcb2026website/../../../etc/passwd
want_blocked /etc/passwd

# Only meaningful on the host itself.
if [[ "$BASE" == http://127.0.0.1* ]]; then
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
  stray=$(ss -tlnH 2>/dev/null | awk '$4 ~ /^(0\.0\.0\.0|\[::\]):/ {split($4,a,":"); p=a[length(a)]; if (p!="22" && p!="80") print p}' | sort -u)
  if [[ -z "$stray" ]]; then grn "  ok    no unexpected wildcard listeners"
  else red "  WARN  services bound to all interfaces on port(s): $stray"; fi

  perm=$(stat -c '%a' /home/ubuntu/.claude 2>/dev/null)
  if [[ "$perm" == "700" ]]; then grn "  ok    ~/.claude is 0700"
  else red "  FAIL  ~/.claude is $perm, expected 700"; ((fails++)); fi
fi

echo
if (( fails )); then red "$fails check(s) failed"; exit 1; fi
grn "all checks passed"
