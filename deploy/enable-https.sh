#!/usr/bin/env bash
# One-time: take the site public at https://wavecoupling2027.eu.
#
# Ordered because the steps genuinely depend on each other — Let's Encrypt has
# to reach port 80 from the internet to prove we control the domain, so the
# firewall opens before the certificate exists, and the real config cannot be
# installed until it does. Refuses to start if DNS is not already pointing here,
# because a failed challenge counts against Let's Encrypt's rate limit (5 per
# domain per week) and burning those is an annoying way to lose an afternoon.
#
# Safe to re-run: certbot no-ops on a valid cert, ufw rules are idempotent.

set -euo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DOMAIN=wavecoupling2027.eu
# The original domain, circulated before the August 2026 rename. It stays on
# the certificate and 301s to the canonical one; dropping it would break links
# already in the wild, and a name missing from the certificate cannot renew.
LEGACY_DOMAIN=oceancoupling.eu
NAMES=("$DOMAIN" "www.$DOMAIN" "$LEGACY_DOMAIN" "www.$LEGACY_DOMAIN")
DOMAIN_ARGS=(); for name in "${NAMES[@]}"; do DOMAIN_ARGS+=(-d "$name"); done
# Let's Encrypt wants an address for expiry warnings, but this repo is public and
# a plaintext address in it is just something to be scraped. Take it from the
# environment, falling back to the committer's git identity — which is already
# in every commit here, so it leaks nothing new.
EMAIL="${LETSENCRYPT_EMAIL:-$(git -C "$REPO" config user.email 2>/dev/null)}"
[[ -n "$EMAIL" ]] || die "set LETSENCRYPT_EMAIL, or configure git user.email — Let's Encrypt needs an address for expiry notices"

red() { printf '\033[31m%s\033[0m\n' "$*"; }
grn() { printf '\033[32m%s\033[0m\n' "$*"; }
die() { red "ABORT: $*"; exit 1; }

# --- 1. DNS must already point here -----------------------------------------
echo "==> checking DNS"
want=$(curl -s -4 --max-time 10 ifconfig.me)
[[ -n "$want" ]] || die "could not determine this host's public IPv4"

for name in "${NAMES[@]}"; do
  got=$(dig +short A "$name" @1.1.1.1 | tail -1)
  [[ "$got" == "$want" ]] || die "$name resolves to '${got:-nothing}', expected $want. Update DNS at the registrar and wait for the TTL to expire."
  grn "    $name -> $got"
done

# An AAAA that does not actually accept connections is worse than none: Let's
# Encrypt prefers IPv6 when it exists, so a stale record fails issuance outright.
for name in "${NAMES[@]}"; do
  if aaaa=$(dig +short AAAA "$name" @1.1.1.1 | tail -1) && [[ -n "$aaaa" ]]; then
    curl -s -6 -o /dev/null --max-time 8 "http://[$aaaa]/" 2>/dev/null \
      || die "$name has AAAA $aaaa but it does not answer. Remove the AAAA record, or fix IPv6 first — Let's Encrypt will try it before IPv4 and fail."
  fi
done

# --- 2. bootstrap HTTP so the challenge can be answered ----------------------
echo "==> installing bootstrap HTTP config"
sudo mkdir -p /var/www/acme
sudo chown ubuntu:www-data /var/www/acme
sudo cp "$REPO/deploy/nginx-bootstrap-http.conf" /etc/nginx/sites-available/bergen2027
sudo ln -sf /etc/nginx/sites-available/bergen2027 /etc/nginx/sites-enabled/bergen2027
sudo nginx -t
sudo systemctl reload nginx

# --- 3. open the firewall ----------------------------------------------------
echo "==> opening 80 and 443"
sudo ufw allow 80/tcp  comment 'http'  >/dev/null
sudo ufw allow 443/tcp comment 'https' >/dev/null
sudo ufw status | grep -E '80/tcp|443/tcp' | head -4

# --- 4. certificate ----------------------------------------------------------
echo "==> obtaining certificate"
sudo certbot certonly \
  --webroot -w /var/www/acme \
  --cert-name "$DOMAIN" \
  "${DOMAIN_ARGS[@]}" \
  --email "$EMAIL" --agree-tos --no-eff-email \
  --keep-until-expiring \
  --deploy-hook "systemctl reload nginx"

# sudo test, not [[ -f ]]: /etc/letsencrypt/live is root-owned 0700, so this
# script's own user cannot stat inside it and would call a perfectly good
# certificate missing.
sudo test -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" \
  || die "certbot reported success but no certificate is present"

# certonly plus our own config, rather than --nginx: the plugin rewrites the
# config in place, which would make the tracked file in this repo diverge from
# what is actually running.
echo "==> installing HTTPS config"
sudo cp "$REPO/deploy/nginx-bergen2027.conf" /etc/nginx/sites-available/bergen2027
sudo nginx -t
sudo systemctl reload nginx

# --- 5. renewal must actually be armed ---------------------------------------
echo "==> checking renewal"
sudo systemctl is-enabled --quiet certbot.timer && grn "    certbot.timer enabled" \
  || { sudo systemctl enable --now certbot.timer && grn "    certbot.timer enabled"; }
sudo certbot renew --dry-run --cert-name "$DOMAIN" 2>&1 | tail -3

# --- 6. publish and prove ----------------------------------------------------
echo "==> publishing"
"$REPO/deploy/publish.sh"

echo "==> verifying over the public name"
"$REPO/deploy/verify-exposure.sh" "https://$DOMAIN"
