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
- **Confirm a tentative speaker**: remove `tentative: true` from their entry.
- **Add a logo**: drop the file in `public/images/`, reference it from `HOSTS`
  or `PARTNERS`. Entries with `logo: null` render as text tiles.

## Forms

Abstract submission and registration each use a
[Nettskjema](https://nettskjema.no) form — Norwegian-hosted (reachable from
mainland China, unlike Google Forms), accepts PDF uploads from external
respondents, and sends an automatic receipt with a reference number, which
presenting authors quote when registering. Field-by-field specifications for
both forms are in [`docs/forms.md`](docs/forms.md).

While either URL in `src/config.js` is still a `REPLACE_WITH_…` placeholder,
`npm run dev` shows a red warning banner and CI refuses to deploy.

Abstract templates offered to authors live in `public/downloads/`
(`bergen2027-abstract-template.docx` / `.tex`).

## Funding acknowledgment

The Sponsors section follows the EU emblem rules for 2021–2027 programmes: the
emblem (drawn to the official geometry in `public/images/eu-emblem.svg`)
carries the spelled-out "Funded by the European Union" statement, the required
disclaimer is displayed, and the emblem must remain at least as large as any
other logo in that strip when the ERC and Research Council of Norway logo files
arrive.

## Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds the site
and publishes it to GitHub Pages. Pull requests run the same build as a check but
do not deploy.

Work on a branch and merge via pull request — `main` is published automatically,
so anything landing there is immediately public.

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
  favicon.svg
docs/forms.md                 Nettskjema field specifications for both forms
.github/workflows/deploy.yml  build + Pages deployment
```
