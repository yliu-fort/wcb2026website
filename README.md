# Bergen 2027 — Conference Website

Website for the **8th Workshop on Waves and Wave-Coupled Processes**, 12–15
April 2027, Bergen, Norway, hosted by the University of Bergen and the
Norwegian Meteorological Institute.

Live at <https://yliu-fort.github.io/wcb2026website/>.

> The repository name says `wcb2026website` for historical reasons; the site
> itself is the Bergen 2027 workshop.

## Stack

A React 18 single-page site built with [Vite](https://vite.dev). The build
produces plain static files — no server-side component.

## Local development

Requires Node.js 20.19+ (22 LTS recommended).

```bash
npm install
npm run dev
```

The dev server binds to `127.0.0.1:5173` only, deliberately: the host it runs on
has a public IP and no firewall. Reach it from your own machine with an SSH
tunnel:

```bash
ssh -L 5173:localhost:5173 <user>@<host>
```

Then open <http://localhost:5173/wcb2026website/>. Note the `/wcb2026website/`
path — `base` in `vite.config.js` matches the GitHub Pages sub-path, so local
URLs are identical to production.

To check a production build locally:

```bash
npm run build && npm run preview
```

## Editing content

Nearly everything an organiser needs to change lives in **`src/config.js`**:
names and dates, key dates, keynote speakers, committee members, research
themes, hosts and partner logos, venue details, contact address, and the two
form URLs. Component code in `src/App.jsx` should not need touching for routine
content updates.

Common tasks:

- **Add a speaker photo**: drop the file in `public/images/speakers/` and set
  `photo: "speakers/<file>"` on the speaker's entry in `SPEAKERS`. Until then
  the card shows an initials avatar.
- **Add an organiser photo**: the same, in `public/images/organisers/` with
  `photo: "organisers/<file>"` on the member's entry in `COMMITTEES`. Both
  sections render through one `Portrait` component, so they stay consistent.
- **Confirm a tentative speaker**: remove `tentative: true` from their entry.
- **Add a logo**: drop the file in `public/images/`, reference it from `HOSTS`
  or `PARTNERS`. Entries with `logo: null` render as text tiles.

## Forms

Abstract submission and registration each use a form in
[Skjemaker](https://skjemaker.app.uib.no), UiB's self-hosted MachForm —
university-hosted (reachable from mainland China, unlike Google Forms), accepts
PDF/DOCX uploads from external respondents with no login, and sends an automatic
receipt carrying the abstract ID, which presenting authors quote when
registering. Field-by-field specifications for both forms are in
[`docs/forms.md`](docs/forms.md).

While either URL in `src/config.js` is still a `REPLACE_WITH_…` placeholder,
`npm run dev` shows a red warning banner and CI refuses to deploy.

Abstract templates offered to authors live in `public/downloads/`
(`bergen2027-abstract-template.docx` / `.tex`).

## Fonts

Inter and Lora are **self-hosted** from `public/fonts/`, not loaded from Google.
Same constraint as the forms and the venue map: `fonts.gstatic.com` is
unreachable from mainland China, and a `preconnect` to a blocked host is the
first thing a visitor there hits. Self-hosting also keeps visitor IP addresses
out of Google's logs, which is the part European institutions care about.

Both ship as variable fonts, so one file per subset covers every weight
(`@font-face` details and update instructions are at the top of
`src/styles.css`). `deploy/publish.sh` refuses to publish a build that fetches
from `fonts.googleapis.com`, `fonts.gstatic.com` or `ajax.googleapis.com`, so
this cannot quietly come back.

## Funding acknowledgment

The Sponsors section uses each funder's own published file rather than a
composition of our own, because in both cases the rules are about the file, not
just the artwork:

- **ERC + EU** is one image, `logo-erc-eu.png`, taken from
  [erc.europa.eu/support/logos](https://erc.europa.eu/support/logos). ERC
  requires that "the EU emblem and the ERC logo should always be represented
  together in equal sizing", and their combined file already is. It also carries
  the 2021–2027 obligation to spell out "Funded by the European Union" beside the
  emblem. This replaced a hand-drawn `eu-emblem.svg` plus a separate ERC text
  tile.
- **Research Council of Norway** is `logo-rcn-funded.svg`, the English "Funded by
  The Research Council of Norway" mark. Their brand guide is explicit that a
  funded project **must not use the institutional Forskningsrådet logo** — there
  is a dedicated mark for exactly this purpose, and this is it. Source:
  [identitet.forskningsradet.no](https://identitet.forskningsradet.no/verktoykasse/logo).

The EU emblem must not be smaller than any other logo in that strip. Inside
ERC's combined file the flag block is 68.8% of the file's height, so the two
heights in `styles.css` (72px lockup, 40px RCN mark) put the flag at 49.6px
against 40px. Both numbers carry a comment saying so; changing either one means
re-checking the other.

Still missing from the acknowledgment text: the ERC grant agreement number and
the RCN project number.

## Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds the site
and publishes it to GitHub Pages. Pull requests run the same build as a check but
do not deploy.

The self-hosted origin at [wavecoupling2027.eu](https://wavecoupling2027.eu)
follows `main` too, but on a five-minute timer rather than through Actions — see
[`deploy/README.md`](deploy/README.md). `oceancoupling.eu` was the original
domain and now redirects there.

Work on a branch and merge via pull request — `main` is published automatically
to **both** origins, so anything landing there is immediately public.

## Repository layout

```
index.html                    Vite entry point
vite.config.js                base path, dev server binding, build options
src/
  main.jsx                    mounts <App> into #root
  App.jsx                     all page components
  config.js                   conference content — edit this for content changes
  styles.css                  full stylesheet
public/
  images/                     logos, hero image, EU emblem
  downloads/                  abstract templates (docx / LaTeX)
  fonts/                      self-hosted Inter + Lora (OFL, see LICENSE there)
  favicon.svg
docs/forms.md                 Skjemaker field specifications for both forms
.github/workflows/deploy.yml  build + Pages deployment
```
