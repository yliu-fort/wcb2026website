# WWCP 2027 — Conference Website

Website for the **8th Workshop on Waves and Wave-Coupled Processes**, 12–15 April
2027, Bergen, Norway, hosted by the University of Bergen.

Live at <https://yliu-fort.github.io/wcb2026website/>.

> The repository name still says `wcb2026website` for historical reasons; the
> site itself is WWCP 2027.

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
conference name and dates, key dates, committee members, research themes, past
editions, sponsor logos, contact address, and the registration URL. Component
code in `src/App.jsx` should not need touching for routine content updates.

Adding a sponsor logo: drop the file in `public/images/`, then add a line to the
`SPONSORS` array with its filename.

## Registration

Registration goes through a single form hosted on
[UiB Skjemaker](https://skjemaker.app.uib.no/), set via `CONF.registrationUrl`.

A single UiB-hosted form replaced an earlier setup that offered a Google Form
alongside a Tencent Docs form, because Google services are blocked in mainland
China. A form on a Norwegian university domain is reachable from everywhere, so
the second channel is unnecessary.

While `registrationUrl` is still the Skjemaker service page rather than a real
form, `npm run dev` shows a red warning banner and CI refuses to deploy.

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
  images/                     sponsor logos, hero image
  favicon.svg
.github/workflows/deploy.yml  build + Pages deployment
```
