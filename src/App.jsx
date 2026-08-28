import { useEffect, useRef, useState } from 'react';

import {
  CONF,
  EMAILS,
  FORMS,
  KEY_DATES,
  SPEAKERS,
  COMMITTEES,
  THEMES,
  PAST_EDITIONS,
  HOSTS,
  PARTNERS,
  VENUE,
  placeholderForms,
  asset,
  download,
} from './config.js';

// ============ Components ============

// Rendered only during development, so a placeholder form URL cannot be missed
// the way an earlier dead registration link in production was.
function ConfigWarning() {
  const missing = placeholderForms();
  if (!import.meta.env.DEV || missing.length === 0) return null;
  return (
    <div className="config-warning">
      <strong>Placeholder form URL{missing.length > 1 ? 's' : ''}:</strong>{' '}
      {missing.join(' & ')} — set the real Skjemaker links in{' '}
      <code>src/config.js</code> before deploying.
    </div>
  );
}

function TopBar() {
  return (
    <div className="topbar">
      <div className="topbar-inner">
        <span>{CONF.dates} · {CONF.city}</span>
        <span>
          Contact: <a href={`mailto:${EMAILS.information}`}>{EMAILS.information}</a>
        </span>
      </div>
    </div>
  );
}

// Nav labels are shorter than the section headings they point at, which is
// what lets eight of them sit on one row inside the 1100px column. Two are not
// just abbreviations: 'Abstracts' points at the section headed 'Abstracts &
// Registration', because a nav item called 'Registration' next to a 'Register'
// button that opens a different thing (the form) is a genuine trap.
const NAV_ITEMS = [
  ['Introduction', 'introduction'],
  ['Speakers', 'speakers'],
  ['Key Dates', 'key-dates'],
  ['Abstracts', 'registration'],
  ['Authors', 'for-authors'],
  ['Venue', 'venue'],
  ['Organisation', 'organization'],
  ['Sponsors', 'sponsors'],
];

function Header() {
  // Below the width where the full row fits, the nav collapses behind this
  // toggle. It used to be `display: none` with nothing in its place, so a phone
  // got a header with no navigation in it at all.
  const [open, setOpen] = useState(false);

  // Escape closes it, which is the one keyboard behaviour a disclosure like
  // this is expected to have and the one that is easiest to leave out.
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <a href="#top" className="brand" onClick={() => setOpen(false)}>
          <span className="brand-mark" aria-hidden="true"></span>
          <span className="brand-text">
            <span className="brand-title">{CONF.shortName}</span>
            <span className="brand-sub">Waves &amp; Wave-Coupled Processes</span>
          </span>
        </a>
        <button
          type="button"
          className="nav-toggle"
          aria-expanded={open}
          aria-controls="site-nav"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((v) => !v)}
        >
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
        </button>
        <nav className={`nav${open ? ' nav-open' : ''}`} id="site-nav">
          {NAV_ITEMS.map(([label, id]) => (
            <a key={id} href={`#${id}`} onClick={() => setOpen(false)}>
              {label}
            </a>
          ))}
          <a
            className="nav-cta"
            href={FORMS.registration.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
          >
            Register
          </a>
        </nav>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="hero" id="top">
      <div className="hero-inner">
        <span className="tag">{CONF.shortName}</span>
        <h1>{CONF.fullName}</h1>
        <p className="lede">{CONF.subtitle}</p>
        {/* No separator elements: the dots are drawn by CSS on the item that
            follows them, so a wrap can never leave one stranded on a line of
            its own — which is what happened at 375px. */}
        <div className="hero-meta">
          <span><strong>{CONF.dates}</strong></span>
          <span><strong>{CONF.city}</strong></span>
          <span>Hosted by {CONF.host}</span>
        </div>
        <div className="hero-actions">
          <a className="btn btn-primary" href="#registration">Submit an Abstract</a>
          <a className="btn btn-outline" href="#for-authors">Information for Authors</a>
        </div>
      </div>
    </section>
  );
}

function Introduction() {
  return (
    <section className="band scroll-anchor" id="introduction">
      <div className="container">
        <h2 className="section-title">Introduction</h2>
        <p className="lead">
          Over the years, it has become clear that ocean surface waves play a
          critical role in the Earth System, modulating many surface exchanges
          — from tropical cyclones to the marginal ice zone, as well as acting
          in the atmospheric boundary layer and the upper ocean. Accounting for
          their impacts in ocean circulation, extreme marine weather, climate
          and other large-scale systems has recently attracted renewed interest
          and requires much attention.
        </p>
        <p>
          After the previous seven successful workshops in{' '}
          {PAST_EDITIONS.join(', ')}, {CONF.host} will organise the
          8<sup>th</sup> Workshop on Waves and Wave-Coupled Processes in{' '}
          {CONF.city}, aiming to foster discussion and collaboration within
          this field among the wider community. The meeting will be conducted
          in plenary, with time reserved for discussion to identify key
          research and technological questions relevant for the uptake of
          wave information in Earth System models.
        </p>
      </div>
    </section>
  );
}

// Academic titles carried in the name string. Committee members are listed with
// one, keynote speakers are not, and the initials have to come from the person's
// own name either way — without this, "A/Prof. Yan Li" initials to "AL".
const TITLE = /^(a\/prof|assoc|associate|prof|professor|dr|mr|ms|mrs|mx)\.?$/i;

// Circular portrait with the name plate below. Until a portrait file is
// supplied the circle carries the person's initials.
//
// Shared by the keynote grid and the organisation grid so the two cannot drift;
// `size` picks the modifier class rather than a second implementation.
function Portrait({ name, photo, credit, size }) {
  // Where the credit label currently sits, in viewport coordinates, or null
  // when it is hidden. Hooks run before the early returns below, unconditionally.
  const [tip, setTip] = useState(null);
  const holdRef = useRef(null);
  const wrapRef = useRef(null);

  // A press that never ends — the finger leaves, the component unmounts — would
  // otherwise fire its timer into a dead component.
  useEffect(() => () => clearTimeout(holdRef.current), []);

  const cls = `portrait${size === 'sm' ? ' portrait-sm' : ''}`;

  if (!photo) {
    const parts = name.split(/\s+/).filter(Boolean).filter((p) => !TITLE.test(p));
    const initials =
      parts.length === 0
        ? '?'
        : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return (
      <div className={`${cls} portrait-initials`} aria-hidden="true">
        {initials}
      </div>
    );
  }

  const img = <img className={cls} src={asset(photo)} alt={name} />;
  if (!credit) return img;

  const creditId = `credit-${photo.replace(/[^a-z0-9]+/gi, '-')}`;
  const show = (x, y) => setTip({ x, y });
  const hide = () => {
    clearTimeout(holdRef.current);
    holdRef.current = null;
    setTip(null);
  };

  // Pointer events rather than separate mouse and touch handlers: one code path
  // for both, and `pointerType` says which one is asking. Touch also raises
  // compatibility mouse events, so handling both would fire twice on a phone.
  const onDown = (e) => {
    if (e.pointerType === 'mouse') return;
    const { clientX, clientY } = e;
    // Long press, not tap. A tap does nothing and any movement cancels, so
    // scrolling past a face never pops the label open.
    holdRef.current = setTimeout(() => show(clientX, clientY), 450);
  };
  const onMove = (e) => {
    if (e.pointerType === 'mouse') show(e.clientX, e.clientY);
    else if (holdRef.current) hide();
  };
  // Keyboard focus has no pointer to follow, so anchor under the circle.
  const fromFocus = () => {
    const r = wrapRef.current.getBoundingClientRect();
    show(r.left + r.width / 2, r.bottom - 10);
  };

  // Flip the label rather than let it hang off the edge of the window.
  const flipX = tip && tip.x > window.innerWidth - 190;
  const flipY = tip && tip.y > window.innerHeight - 60;

  // Two spans, and the split matters. The inner one is clipped to the circle so
  // that only the visible portrait answers the pointer — the square's corners
  // and the empty width of the card do not. The label cannot live inside it: a
  // clip-path clips its descendants, fixed-position ones included, so the label
  // would be cut away the moment it appeared. It sits outside as a sibling.
  //
  // Focus is on the outer span for the same reason: an outline drawn on the
  // clipped element would be clipped off with everything else outside the
  // circle. Pointer in, keyboard out.
  return (
    <span
      ref={wrapRef}
      className="portrait-credited"
      tabIndex={0}
      aria-describedby={creditId}
      onFocus={fromFocus}
      onBlur={hide}
    >
      <span
        className="portrait-hit"
        onPointerEnter={(e) => e.pointerType === 'mouse' && show(e.clientX, e.clientY)}
        onPointerMove={onMove}
        onPointerLeave={hide}
        onPointerDown={onDown}
        onPointerUp={hide}
        onPointerCancel={hide}
        onContextMenu={(e) => {
          // Only while our own long press is open, so right-click still offers
          // "save image" on a desktop.
          if (tip) e.preventDefault();
        }}
      >
        {img}
      </span>
      <span id={creditId} className="visually-hidden">
        Photograph by {credit}
      </span>
      {tip && (
        <span
          className={`portrait-credit${flipX ? ' flip-x' : ''}${flipY ? ' flip-y' : ''}`}
          style={{ left: tip.x, top: tip.y }}
          aria-hidden="true"
        >
          Photo: {credit}
        </span>
      )}
    </span>
  );
}

function Speakers() {
  return (
    <section className="band alt scroll-anchor" id="speakers">
      <div className="container">
        <h2 className="section-title">Keynote Speakers</h2>
        <div className="speakers-grid">
          {SPEAKERS.map((s) => (
            <div key={s.name} className="speaker-card">
              <Portrait name={s.name} photo={s.photo} credit={s.credit} />
              <div className="speaker-name">{s.name}</div>
              {s.affil && <div className="speaker-affil">{s.affil}</div>}
              <div className="speaker-topic">{s.topic}</div>
              {s.tentative && <span className="speaker-tag">Tentative</span>}
            </div>
          ))}
        </div>
        <p className="section-note">
          Further keynote speakers may be announced in due course.
        </p>
      </div>
    </section>
  );
}

function Themes() {
  return (
    <section className="band scroll-anchor" id="themes">
      <div className="container">
        <h2 className="section-title">Research Themes</h2>
        <p>The workshop will cover the following research themes:</p>
        <ul className="theme-list">
          {THEMES.map((t, i) => (
            <li key={i}>{t}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function KeyDates() {
  return (
    <section className="band alt scroll-anchor" id="key-dates">
      <div className="container">
        <h2 className="section-title">Key Dates</h2>
        <div className="dates-grid">
          {KEY_DATES.map((d, i) => (
            <div key={i} className={`date-card ${d.deadline ? 'deadline' : ''}`}>
              <div className="label">{d.label}</div>
              <div className="value">{d.value}</div>
            </div>
          ))}
        </div>
        <p className="section-note">
          Further dates, including the participant registration deadline, will
          be announced in due course.
        </p>
      </div>
    </section>
  );
}

function AbstractsRegistration() {
  return (
    <section className="register scroll-anchor" id="registration">
      <div className="container">
        <h2>Abstracts &amp; Registration</h2>
        <p className="lead">
          The workshop is open to everyone with an interest in waves and
          wave-coupled processes.
        </p>
        <div className="absreg-grid">
          <div className="absreg-card">
            <h3>Abstract submission</h3>
            <p>
              Submit a one-page abstract in PDF format between{' '}
              <strong>{CONF.abstractOpens}</strong> and{' '}
              <strong>{CONF.abstractDeadline}</strong>. Please start from the
              template and follow the instructions in{' '}
              <a href="#for-authors">Information for Authors</a>.
            </p>
            <p>
              Every submission receives an email receipt with an abstract
              ID — keep it for later. The receipt is sent automatically from{' '}
              <code>noreply@uib.no</code>; add it to your contacts so the
              receipt is not filtered as spam.
            </p>
            <a
              className="btn btn-primary"
              href={FORMS.abstract.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              Submit an Abstract ↗
            </a>
          </div>
          <div className="absreg-card">
            <h3>Registration</h3>
            <p>
              <strong>Presenting authors</strong> must register by{' '}
              <strong>{CONF.presenterRegistrationDeadline}</strong>. The
              registration form asks for the abstract ID issued with your
              abstract receipt.
            </p>
            <p>
              <strong>Participants</strong> who are not presenting are equally
              welcome. The participant registration deadline and further
              details, including any fees, will be announced.
            </p>
            <a
              className="btn btn-primary"
              href={FORMS.registration.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              Register ↗
            </a>
          </div>
        </div>
        <div className="register-note">
          Questions — about an abstract, registration, fees, or an invitation
          letter for a visa — go to{' '}
          <a href={`mailto:${EMAILS.information}`} className="register-note-link">
            {EMAILS.information}
          </a>.
        </div>
      </div>
    </section>
  );
}

function InfoForAuthors() {
  return (
    <section className="band scroll-anchor" id="for-authors">
      <div className="container">
        <h2 className="section-title">Information for Authors</h2>
        <ul className="authors-list">
          <li>
            <strong>Format.</strong> Abstracts are limited to one A4 page as a
            PDF file, including any figures and references. Please start from
            the template:{' '}
            <a href={download('bergen2027-abstract-template.docx')}>Word</a>
            {' '}·{' '}
            <a href={download('bergen2027-abstract-template.tex')}>LaTeX</a>.
          </li>
          <li>
            <strong>Submission.</strong> Abstracts are submitted through the{' '}
            <a href="#registration">abstract submission form</a> between{' '}
            {CONF.abstractOpens} and {CONF.abstractDeadline}. You will receive
            an email receipt with an abstract ID; it is required when
            registering as a presenting author.
          </li>
          <li>
            <strong>Corrections and withdrawals.</strong> Submissions cannot be
            edited. To correct one, submit again and answer “Yes” to the
            replacement question, quoting the abstract ID of the submission it
            replaces. To withdraw an abstract, write to{' '}
            <a href={`mailto:${EMAILS.information}`}>{EMAILS.information}</a> — the
            committee confirms every withdrawal to the address on the original
            submission before it takes effect.
          </li>
          <li>
            <strong>Decisions.</strong> Notifications of acceptance are
            expected in {CONF.decisionDate}.
          </li>
          <li>
            <strong>Presentation.</strong> Presentations can only be given by
            registered participants: presenting authors must complete
            registration by {CONF.presenterRegistrationDeadline}. The meeting
            is conducted in plenary; presentation formats and allocated times
            will be communicated with the notification of acceptance.
          </li>
        </ul>
      </div>
    </section>
  );
}

function Venue() {
  // OpenStreetMap embed rather than Google Maps: Google is blocked in mainland
  // China and mainland participants are part of the audience.
  const d = 0.006;
  const bbox = [VENUE.lon - d, VENUE.lat - d / 2, VENUE.lon + d, VENUE.lat + d / 2].join('%2C');
  const osmSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${VENUE.lat}%2C${VENUE.lon}`;
  return (
    <section className="band alt scroll-anchor" id="venue">
      <div className="container">
        <h2 className="section-title">Venue</h2>
        <div className="venue-grid">
          <div className="venue-info">
            <p>
              The workshop, hosted by {CONF.host}, takes place at the{' '}
              <strong>{VENUE.name}</strong> in central Bergen, directly by the
              Bergen railway station. Bergen, on Norway&apos;s western coast,
              is a major centre for ocean and climate research and is well
              connected by direct flights to major European hubs.
            </p>
            <div className="addr">
              <strong>{VENUE.name}</strong><br />
              {VENUE.address.map((line) => (
                <span key={line}>{line}<br /></span>
              ))}
            </div>
            <p style={{ marginTop: 16 }}>
              The nearest international airport is Bergen Airport, Flesland
              (BGO), with light rail and bus connections to the city centre.
              Recommended accommodation and further travel information will be
              announced.
            </p>
            <p>
              <a
                href="https://www.google.com/maps/search/?api=1&query=Grand+Hotel+Terminus+Bergen"
                target="_blank"
                rel="noopener noreferrer"
              >
                Open in Google Maps →
              </a>
            </p>
          </div>
          <iframe
            className="venue-map"
            title={`Map of ${VENUE.name}, Bergen`}
            src={osmSrc}
            loading="lazy"
          />
        </div>
      </div>
    </section>
  );
}

function Organization() {
  return (
    <section className="band scroll-anchor" id="organization">
      <div className="container">
        <h2 className="section-title">Organisation</h2>
        {COMMITTEES.map((c) => (
          <div key={c.title} className="org-block">
            <h3 className="org-block-title">{c.title}</h3>
            <div className="people-grid">
              {c.members.map((m) => (
                <div key={m.name} className="person-card">
                  <Portrait
                    name={m.name}
                    photo={m.photo}
                    credit={m.credit}
                    size="sm"
                  />
                  <div className="person-name">{m.name}</div>
                  <div className="person-affil">{m.affil}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// Renders an image logo when a file is available, otherwise a text tile.
function LogoTile({ name, logo }) {
  return (
    <div className={`sponsor-logo ${logo ? '' : 'text-logo'}`}>
      {logo ? <img src={asset(logo)} alt={name} title={name} /> : name}
    </div>
  );
}

function Organisers() {
  return (
    <section className="band alt scroll-anchor" id="organisers">
      <div className="container">
        <h2 className="section-title">Organisers &amp; Partner Institutions</h2>
        <p>
          The workshop is organised by {CONF.host}, with the support of the
          partner institutions represented on the Organising Committee.
        </p>
        <div className="sponsor-strip hosts-strip">
          {HOSTS.map((h) => (
            <LogoTile key={h.name} {...h} />
          ))}
        </div>
        <div className="sponsor-strip">
          {PARTNERS.map((p) => (
            <LogoTile key={p.name} {...p} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Sponsors() {
  return (
    <section className="band scroll-anchor" id="sponsors">
      <div className="container">
        <h2 className="section-title">Sponsors</h2>
        <p>
          The workshop is supported by the European Research Council (ERC)
          through the Starting Grant project Ocean Coupling, and by the
          Research Council of Norway through the EVALMIT network.
          {/* TODO: add the ERC grant agreement number and the RCN project
              number to this acknowledgment once provided. */}
        </p>
        <div className="funding-strip">
          {/* ERC publishes this as one file: the EU emblem with the spelled-out
              funding statement, a rule, then the ERC logo. Using it rather than
              composing the two by hand is what satisfies "the EU emblem and the
              ERC logo should always be represented together in equal sizing" —
              the proportions are the ones ERC ships, not ones we chose.

              It also carries the 2021–2027 obligation to spell out "Funded by
              the European Union" next to the emblem. Sizing against the RCN mark
              beside it is set in styles.css. */}
          <div className="funding-item erc-eu-lockup">
            <img
              src={asset('logo-erc-eu.png')}
              alt="Funded by the European Union — European Research Council, established by the European Commission"
            />
          </div>
          {/* Not the Research Council's institutional logo: their brand rules say
              a funded project must use this dedicated "Funded by" mark instead.
              English version of Forskningsradet_Stottet-logo. */}
          <div className="funding-item rcn-mark">
            <img
              src={asset('logo-rcn-funded.svg')}
              alt="Funded by The Research Council of Norway"
            />
            <span className="funding-sub">EVALMIT network</span>
          </div>
        </div>
        <p className="funding-disclaimer">
          Funded by the European Union. Views and opinions expressed are
          however those of the author(s) only and do not necessarily reflect
          those of the European Union or the European Research Council
          Executive Agency. Neither the European Union nor the granting
          authority can be held responsible for them.
        </p>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div>
          <h4>{CONF.shortName}</h4>
          <div>{CONF.fullName}</div>
          <div>{CONF.dates} · {CONF.city}</div>
        </div>
        <div>
          <h4>Contact</h4>
          <div><a href={`mailto:${EMAILS.information}`}>{EMAILS.information}</a></div>
        </div>
        <div>
          <h4>Quick Links</h4>
          <div>
            <a href="#speakers">Speakers</a> ·{' '}
            <a href="#registration">Abstracts &amp; Registration</a> ·{' '}
            <a href="#venue">Venue</a>
          </div>
        </div>
      </div>
      <div className="footer-legal">
        © {CONF.shortName} Organising Committee. Hosted by {CONF.host}.
      </div>
    </footer>
  );
}

export default function App() {
  return (
    <>
      <ConfigWarning />
      <TopBar />
      <Header />
      <Hero />
      <Introduction />
      <Speakers />
      <Themes />
      <KeyDates />
      <AbstractsRegistration />
      <InfoForAuthors />
      <Venue />
      <Organization />
      <Organisers />
      <Sponsors />
      <Footer />
    </>
  );
}
