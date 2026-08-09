# Self-hosted deployment

Serves the built static site from this machine, alongside the GitHub Pages
deployment. Same build artifact for both: Vite's `base` stays
`/wcb2026website/`, and nginx serves that same path prefix, so a link that works
in one place works in the other.

## Publishing

```bash
deploy/publish.sh
```

That is the only supported way to change what is public. It builds, scans the
output, mirrors it into the docroot, reloads nginx, and re-probes the live
server. `--skip-build` republishes the existing `dist/`.

## Why the guardrails are shaped this way

This host has a routable public IP and holds credentials and session
transcripts in `~/.claude`. The risk worth engineering against is not an
attacker finding a novel nginx bug — it is *us* pointing something at the wrong
directory. So each layer below assumes the layer above was configured wrong.

(The host's address is not written down anywhere in this repo, which is public.
Naming it here would pair a scannable target with a precise inventory of what is
running on it.)

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

Layer 2 is the load-bearing one, because it is the only layer that survives a
configuration mistake. It was verified empirically, not assumed: an nginx server
block with `root /home/ubuntu/.claude` and `autoindex on` returns 404 for
`/settings.json`, because `/home` is empty inside the unit's mount namespace
while the file plainly exists on the host. Re-run that check after any nginx
package upgrade — a `.service` file replaced by the package manager would drop
the drop-in.

Layers 0–6 are enforced by the OS and apply to everyone. Layer 7 only constrains
Claude Code; it is the weakest and the first to go stale, so never rely on it
alone.

## Checking

```bash
deploy/verify-exposure.sh                       # against localhost
deploy/verify-exposure.sh http://<public-ip>    # what the internet sees
```

Run the second form **from a different machine**. Probing this host's own public
IP from the host itself routes over loopback, which ufw exempts, so everything
passes for the wrong reason.

Probes traversal toward `~/.claude`, `.git`, dotfiles and `/etc/passwd`, then
confirms `ProtectHome`, `ProtectSystem`, ufw, `~/.claude` permissions, and that
nothing unexpected is bound to a wildcard address. A systemd timer
(`verify-exposure.timer`) runs it hourly; `systemctl status verify-exposure`
shows the last result.

The hook's own test cases live in `hook-cases.txt`:

```bash
while IFS='|' read -r want c; do [ -z "$c" ] && continue; \
  printf '%s' "$c" | jq -R '{tool_input:{command:.}}' \
  | ~/.claude/hooks/guard-public-exposure.sh >/dev/null 2>&1; \
  [ "$?" = "$want" ] && echo "ok   $c" || echo "FAIL $c"; done < deploy/hook-cases.txt
```

## Files

Tracked here, installed to the system by hand (see git log for the commands):

- `nginx-bergen2027.conf` → `/etc/nginx/sites-available/bergen2027`
- `nginx-hardening.conf` → `/etc/systemd/system/nginx.service.d/hardening.conf`
- `publish.sh`, `verify-exposure.sh` — run from the repo
- `~/.claude/hooks/guard-public-exposure.sh` — untracked, outside the repo

## Still open

Port 80 is **closed at the firewall**. Nothing is public yet. To open it:

```bash
sudo ufw allow 80/tcp comment 'http'
```

Before doing that, two things are worth settling:

- **No HTTPS.** Plain HTTP is modifiable in transit by any intermediary, which
  matters more than usual given the site needs to be reachable from China. A
  domain name pointed here plus Caddy (or certbot) would fix it; serving a bare
  IP cannot get a certificate.
- **`build.sourcemap` is `true`,** so `dist/` ships source maps. Harmless while
  the GitHub repo is public, but revisit if it ever goes private.
