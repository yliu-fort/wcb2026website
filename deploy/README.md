# Self-hosted deployment — https://oceancoupling.eu

Serves the built site from this machine over HTTPS, alongside the GitHub Pages
copy at `yliu-fort.github.io/wcb2026website/`. The self-hosted origin exists
because GitHub Pages is unreliable from mainland China, which the conference
audience includes.

The two copies differ only in Vite's `base`: GitHub Pages serves from a
sub-path, this one owns the domain root, so `publish.sh` builds with
`--base=/`. The Pages workflow runs a plain `npm run build` and is unaffected.

## Publishing

```bash
deploy/publish.sh
```

The only supported way to change what is public. Builds, scans the output,
mirrors it into the docroot, reloads nginx, re-probes the live server.
`--skip-build` republishes the existing `dist/`.

## Going live (one time)

```bash
deploy/enable-https.sh
```

Opens 80/443, obtains the Let's Encrypt certificate, installs the HTTPS config,
arms renewal, publishes, verifies. It refuses to start unless DNS already points
here — a failed challenge burns one of five Let's Encrypt attempts per domain
per week.

DNS lives at domene.shop (`ns*.hyp.net`). `A @` and `A www` point to this host.
There is deliberately **no AAAA record**: the public IPv4 is on `enp3s0` while
the IPv6 default route is on `enp4s0`, so inbound IPv6 would likely be dropped
as asymmetric — and since Let's Encrypt prefers IPv6 when a AAAA exists, a
broken one fails issuance outright rather than degrading gracefully.

## Why the guardrails are shaped this way

This host has a routable public IP and holds credentials and session
transcripts in `~/.claude`. The risk worth engineering against is not an
attacker finding a novel nginx bug — it is *us* pointing something at the wrong
directory. So each layer assumes the one above was configured wrong.

| Layer | Mechanism | Holds when… |
|---|---|---|
| 0 | `~/.claude` is `0700` | a process runs as `www-data` rather than `ubuntu` |
| 1 | docroot is `/var/www/bergen2027`, never `$HOME` | the docroot is correct |
| 2 | systemd `ProtectHome=yes` | **the docroot is wrong** |
| 3 | `disable_symlinks on` | a symlink points out of the docroot |
| 4 | ufw default-deny incoming | some other service binds `0.0.0.0` |
| 5 | `publish.sh` preflight | a secret reaches `dist/` |
| 6 | `verify-exposure.sh`, hourly | any of the above silently regresses |
| 7 | Claude Code PreToolUse hook | the assistant is about to undo one of these |

Layer 2 is load-bearing, because it is the only one that survives a
configuration mistake. It was verified empirically, not assumed: an nginx server
block with `root /home/ubuntu/.claude` and `autoindex on` returned 404 for
`/settings.json`, because `/home` is empty inside the unit's mount namespace
while the file plainly exists on the host. Re-run that check after any nginx
package upgrade — a `.service` file replaced by the package manager silently
drops the drop-in.

Layers 0–6 are enforced by the OS and apply to everyone. Layer 7 only constrains
Claude Code; it is the weakest and the first to go stale, so never rely on it
alone. It also matches on the whole command string, so it will occasionally
refuse a command that merely mentions a dangerous pattern. That direction of
error is the intended one.

Two smaller things the config does deliberately:

- **The catch-all returns 444.** Requests to the bare IP, or to any hostname we
  do not serve, get nothing at all. Without it nginx would answer them from the
  first server block and tie the address to the site for anyone scanning.
- **`/.well-known/acme-challenge/` uses `^~`.** It has to outrank the dotfile
  deny, or renewal breaks silently two months from now.

## Checking

```bash
deploy/verify-exposure.sh                          # locally, via --resolve
deploy/verify-exposure.sh https://oceancoupling.eu # from another machine
```

Probes traversal toward `~/.claude`, `.git`, dotfiles and `/etc/passwd`; checks
the certificate and the HTTP→HTTPS redirect; confirms `ProtectHome`,
`ProtectSystem`, ufw, `~/.claude` permissions, and that nothing unexpected is
bound to a wildcard address. A systemd timer (`verify-exposure.timer`) runs it
hourly; `systemctl status verify-exposure` shows the last result.

Run the second form **from a different machine**. Probing this host's own public
IP from the host routes over loopback, which ufw exempts, so every check passes
for the wrong reason. (Locally the script uses `curl --resolve` to pin the
hostname to `127.0.0.1`, which exercises the real server blocks rather than the
catch-all.)

The hook's own test cases live in `hook-cases.txt`:

```bash
while IFS='|' read -r want c; do [ -z "$c" ] && continue; \
  printf '%s' "$c" | jq -R '{tool_input:{command:.}}' \
  | ~/.claude/hooks/guard-public-exposure.sh >/dev/null 2>&1; \
  [ "$?" = "$want" ] && echo "ok   $c" || echo "FAIL $c"; done < deploy/hook-cases.txt
```

## Files

Tracked here, installed to the system by `enable-https.sh`:

- `nginx-bergen2027.conf` → `/etc/nginx/sites-available/bergen2027`
- `nginx-bootstrap-http.conf` → same path, temporarily, to answer the first
  ACME challenge before any certificate exists
- `nginx-hardening.conf` → `/etc/systemd/system/nginx.service.d/hardening.conf`
- `publish.sh`, `verify-exposure.sh`, `enable-https.sh` — run from the repo
- `~/.claude/hooks/guard-public-exposure.sh` — untracked, outside the repo

## Still open

- **IPv6.** No AAAA record until inbound IPv6 is confirmed working on this host;
  see above for why the interface split makes that non-obvious.
- **`build.sourcemap` is `true`,** so `dist/` ships source maps. Harmless while
  the GitHub repo is public; revisit if it ever goes private.
- **China reachability is the reason this origin exists but is not yet
  measured.** HTTPS prevents content injection in transit, which is the part we
  control; it does nothing about SNI-based filtering or latency. Worth testing
  from inside before relying on it.
