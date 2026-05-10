# WCB 2026 — Conference Website (Demo)

A fully static academic-conference site for the (fictional) **Wave Coupling and
Beyond 2026** workshop. No build step required: React 18 is loaded from a CDN
and JSX is transpiled in the browser by `@babel/standalone`.

## Files

- `index.html` — entry point. Loads React, ReactDOM, Babel-standalone, the
  stylesheet, and the JSX app.
- `styles.css` — academic style inspired by past Wave Coupling Workshop sites
  (navy / ocean / teal palette, serif headings, generous whitespace).
- `app.jsx` — all React components and the conference data (key dates,
  committees, program, sponsors). Edit the constants at the top of the file
  to customize.

## Run locally

The site is fully static. From the project directory:

```bash
# Python 3
python3 -m http.server 8000
# then open http://localhost:8000
```

Or any other static server (e.g. `npx serve`, `php -S`, VS Code Live Server).
Opening `index.html` directly via `file://` works in most browsers but some
will block the JSX fetch — use a local server when in doubt.

## Configure the registration form

Registration uses dual channels — a Google Form for international participants
and a Tencent Docs form for users in mainland China (where Google services are
blocked). Clicking any "Register" button opens a modal that lets the visitor
pick the channel that works for them.

Open `app.jsx` and edit `CONF.registrationChannels`:

```js
const CONF = {
  ...
  registrationChannels: [
    { id: "google",  label: "Google Form", sub: "International participants",
      url: "https://forms.gle/your-google-form-id-here", recommended: true },
    { id: "tencent", label: "腾讯文档", sub: "中国大陆用户 (Mainland China users)",
      url: "https://docs.qq.com/form/page/your-tencent-doc-id-here" },
  ],
  ...
};
```

The same config is used by the hero CTA, the navigation "Register" button,
the dedicated Registration section, and the footer link.

## Replace placeholders

- **Logos**: edit the `SPONSORS` array in `app.jsx`. Logos use
  `placehold.co` images — swap in real URLs or local files (e.g.
  `./logos/foo.png`).
- **Venue map**: replace the `<img className="venue-map" src="..." />` URL in
  the `Venue` component with a real map image or an embedded `<iframe>` from
  Google Maps.
- **Committees / Program / Key Dates**: edit the `COMMITTEES`, `PROGRAM`, and
  `KEY_DATES` constants at the top of `app.jsx`.

## Notes for production

This demo is intentionally simple to suit ~100 visitors. For a small academic
audience the CDN + Babel-in-the-browser setup is fine, but if you want to
deploy at scale or strip the runtime transpile cost you can pre-build the JSX
with `esbuild app.jsx --bundle --outfile=app.js` and include the result
directly via a regular `<script>` tag.