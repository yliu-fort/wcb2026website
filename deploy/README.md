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

### Automatically, from `main`

`bergen2027-autopublish.timer` runs `autopublish.sh` every five minutes. If
`origin/main` has moved since the last publish, it takes the new commit and runs
`publish.sh`. Nothing else is needed after a merge.

This exists because the two origins used to drift. GitHub Pages redeploys itself
through Actions; this one did not, and on 2026-08-13 it spent a day serving a
build whose form links were still `REPLACE_WITH_ABSTRACT_FORM_ID` — dead links
on a live conference site — because a merge landed and nobody ran `publish.sh`.

Three things worth knowing:

- **It works from its own clone in `/srv/bergen2027-publish`,** never
  `~/wcb2026website`. That working tree belongs to a human who may be mid-edit on
  another branch, and `git reset --hard` in it would be an expensive surprise.
- **The unit runs an installed copy** at `/usr/local/sbin/bergen2027-autopublish`,
  not the script in the repo. The first version pointed `ExecStart` at
  `~/wcb2026website/deploy/autopublish.sh` and broke within minutes of being
  armed: checking out a branch that predates the script leaves `ExecStart`
  pointing at nothing. So changing the *mechanism* takes a deliberate reinstall
  — content reaches production automatically, changes to how it gets there do
  not. The script warns on each publish if the two have drifted.
- **It is pull-based.** An Action pushing over SSH would want an inbound port, a
  deploy key on the runner and a secret in the repo. Here the VM asks GitHub what
  `main` is and GitHub is told nothing, which keeps the surface at 22/80/443 with
  no secrets on disk.
- **A refusal is safe.** `publish.sh` runs its whole preflight before it touches
  the docroot, so a bad `main` fails without changing what is public, and the
  state file is not advanced — the next tick retries. Verified by pointing the
  script at a scratch origin whose `publish.sh` always exits 1: the run failed,
  the state stayed empty, the docroot did not move.

```bash
systemctl status bergen2027-autopublish.timer     # is it armed
journalctl -u bergen2027-autopublish.service -n 50  # what did it do
deploy/autopublish.sh --force                     # publish now, ignoring state
```

State lives in `/var/lib/bergen2027-autopublish/`: `last-published` is the SHA
that reached the docroot, `npm-lock-hash` is what decides whether `npm ci` needs
to run again, `lock` serialises overlapping ticks.

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
refuse a command that merely mentions a dangerous pattern — it blocked an edit
to this very paragraph for containing the docroot path. That direction of error
is the intended one.

Its docroot rule is written inside-out on purpose. Enumerating the write
commands (`cp|rsync|mv|ln|tee`) let `install -m 644 /dev/stdin …` straight
through on the first attempt, because any such list is a guess about what
someone will type next. It now refuses everything that touches the docroot
except commands opening with a plainly read-only verb.

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

Run the second form **from a different machine** — and it has to be a real one.
A request from this host to its own public IP never leaves the host: the
address is configured on the local interface, so the kernel delivers it over
loopback, past both the NREC security group and ufw, and
`curl https://wavecoupling2027.eu/` from here returns 200 even when nobody
outside can reach the site. The same goes for anything else running on the
host, Claude Code's WebFetch included. Locally the script uses `curl --resolve`
to pin the hostname to `127.0.0.1`, which exercises the real server blocks
rather than the catch-all.

Two results are easy to misread:

- **A 200 on a path that should not exist is usually the SPA fallback.**
  `try_files ... /index.html` is what makes client-side routing work, so every
  unknown path returns index.html with a 200. The script therefore compares
  response bodies against index.html instead of trusting the status code — a
  200 whose body differs is a real leak. Checked in both directions by planting
  a sentinel file where the `/etc/passwd` probe would find it and confirming the
  result flips to LEAK.
- **Free CORS proxies are not a reachability test.** allorigins and codetabs
  return 520/522 from their own Cloudflare edge whether or not this server is
  up. The trustworthy signal is `/var/log/nginx/access.log`: if a request appears
  there from an address that is neither loopback nor this host's own public IP,
  it came from outside.

The hook's own test cases live in `hook-cases.txt`:

```bash
while IFS='|' read -r want c; do [ -z "$c" ] && continue; \
  printf '%s' "$c" | jq -R '{tool_input:{command:.}}' \
  | ~/.claude/hooks/guard-public-exposure.sh >/dev/null 2>&1; \
  [ "$?" = "$want" ] && echo "ok   $c" || echo "FAIL $c"; done < deploy/hook-cases.txt
```

## Maintenance window

**Sundays, 19:00–21:00 UTC.** Reboots, kernel updates, nginx changes and
anything else that can take the site down go in this slot.

It is fixed in UTC because that is the server's clock and the audience spans
time zones. In Oslo it is 21:00–23:00 in summer and 20:00–22:00 in winter; in
Beijing, 03:00–05:00 all year.

Why this slot:

- **Nobody is visiting.** Two weeks of access logs (2–16 October 2026) showed
  no human visitors in it on any of the four weekend days, and five across all
  fourteen days — against 29 in the busiest two hours, 08:00–10:00 UTC.
- **Someone can be awake for it.** It is evening in Norway, so whoever reboots
  can stay until the site is back. The quietest slot overall, Sunday
  02:00–05:00 UTC, lost on this point alone: it would need an unattended
  reboot, and a server that failed to come back would stay down until morning.
- **It is night in China.** Mainland-China visitors are why this origin exists,
  and they have no fallback while it is down. Everyone else still has the
  GitHub Pages copy.
- **It collects the week's updates.** unattended-upgrades installs packages
  every morning around 06:00 UTC, but a new kernel or libc does nothing until
  the next reboot; `/var/run/reboot-required.pkgs` lists what is waiting. By
  October 2026 the VM had been up 71 days, running 6.8.0-136 with 6.8.0-147
  installed.

"Human visitor" needs defining, because the obvious measure is wrong. Most
requests are scanners, and the SPA fallback answers their made-up paths with a
200, so neither request counts nor status codes separate them. What scanners
almost never do is fetch the bundle, so a visitor here is a non-bot IP that
loaded the JS or CSS under `/assets/` with a 200 or 304.

The sample is small: 3 to 18 visitors a day, and nginx keeps 14 days of logs.
Re-check the hourly profile before the abstract deadline (30 November 2026) and
the presenting-author registration deadline (12 January 2027), when traffic
will rise, and move the window if it stops being empty.

A reboot, in order:

```bash
sudo nginx -t
sudo certbot renew --dry-run
systemctl is-active bergen2027-autopublish.service   # wait while it says active
sudo shutdown -r +1
```

`nginx -t` comes first because a running nginx keeps its old configuration
until it restarts: a broken file on disk goes unnoticed until the reboot, and
then the site does not come back. The dry-run exercises both certificate
lineages — `wavecoupling2027.eu` and `oceancoupling.eu`, with their `www` names
— against the staging CA, so it costs nothing against the production rate
limit. Waiting out a running publish is tidiness rather than necessity: an
interrupted publish never advances the state file, so the next tick after
boot republishes.

After boot, `verify-exposure` runs by itself five minutes in
(`OnBootSec=5min`); `journalctl -u verify-exposure.service -b` shows the result.
Then confirm that the site loads from outside: from another machine, or by
finding a request in the access log from an address that is neither loopback
nor this host's own. A check run on this host stays on this host (see
[Checking](#checking)).

## Files

Tracked here, installed to the system by `enable-https.sh`:

- `nginx-bergen2027.conf` → `/etc/nginx/sites-available/bergen2027`
- `nginx-bootstrap-http.conf` → same path, temporarily, to answer the first
  ACME challenge before any certificate exists
- `nginx-hardening.conf` → `/etc/systemd/system/nginx.service.d/hardening.conf`
- `publish.sh`, `enable-https.sh` — run from the repo
- `~/.claude/hooks/guard-public-exposure.sh` — untracked, outside the repo

The two timers and the scripts they run are installed rather than executed from
the repo, because a path inside a git working tree stops existing the moment
someone checks out a branch that predates the file:

```bash
sudo install -m 755 deploy/autopublish.sh      /usr/local/sbin/bergen2027-autopublish
sudo install -m 755 deploy/verify-exposure.sh  /usr/local/sbin/bergen2027-verify-exposure
sudo install -m 644 deploy/bergen2027-autopublish.service deploy/bergen2027-autopublish.timer \
                    deploy/verify-exposure.service deploy/verify-exposure.timer \
                    /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now bergen2027-autopublish.timer verify-exposure.timer
```

Re-run the relevant line after changing a script or a unit; nothing picks those
up on its own, deliberately. `autopublish.sh` warns on each publish if its
installed copy has drifted from `main`.

`verify-exposure`'s units used to exist only in `/etc`, written there by hand and
never tracked — invisible to review and lost with the VM. They are in the repo
now, so all four unit files can be diffed and rebuilt from a clone.

## Still open

- **IPv6.** No AAAA record until inbound IPv6 is confirmed working on this host;
  see above for why the interface split makes that non-obvious.
- **`build.sourcemap` is `true`,** so `dist/` ships source maps. Harmless while
  the GitHub repo is public; revisit if it ever goes private.
- **China reachability is the reason this origin exists but is not yet
  measured.** HTTPS prevents content injection in transit, which is the part we
  control; it does nothing about SNI-based filtering or latency. Worth testing
  from inside before relying on it.
