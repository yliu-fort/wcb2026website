import {
  CONF,
  KEY_DATES,
  COMMITTEES,
  THEMES,
  PAST_EDITIONS,
  SPONSORS,
  REGISTRATION_URL_IS_PLACEHOLDER,
  asset,
} from './config.js';

// ============ Components ============

// Registration goes through a single UiB Skjemaker form. It used to be a modal
// offering a Google Form or a Tencent Docs form, because Google is blocked in
// mainland China; a UiB-hosted form is reachable from everywhere, so the choice
// — and the modal — are no longer needed.
function RegisterLink({ className, children }) {
  return (
    <a
      className={`register-trigger ${className || ''}`}
      href={CONF.registrationUrl}
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  );
}

// Rendered only during development, so a placeholder registration URL cannot be
// missed the way the previous dead Tencent Docs link was.
function ConfigWarning() {
  if (!import.meta.env.DEV || !REGISTRATION_URL_IS_PLACEHOLDER) return null;
  return (
    <div className="config-warning">
      <strong>Placeholder registration link.</strong> Set{' '}
      <code>CONF.registrationUrl</code> in <code>src/config.js</code> to the real
      UiB Skjemaker form before deploying.
    </div>
  );
}

function TopBar() {
  return (
    <div className="topbar">
      <div className="topbar-inner">
        <span>{CONF.dates} · {CONF.city}</span>
        <span>
          Contact: <a href={`mailto:${CONF.contactEmail}`}>{CONF.contactEmail}</a>
        </span>
      </div>
    </div>
  );
}

function Header() {
  const items = [
    ['Introduction', 'introduction'],
    ['Themes', 'themes'],
    ['Key Dates', 'key-dates'],
    ['Organisation', 'organization'],
    ['Venue', 'venue'],
    ['Sponsors', 'sponsors'],
  ];
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <a href="#top" className="brand">
          <span className="brand-mark" aria-hidden="true"></span>
          <span className="brand-text">
            <span className="brand-title">{CONF.shortName}</span>
            <span className="brand-sub">Waves &amp; Wave-Coupled Processes</span>
          </span>
        </a>
        <nav className="nav">
          {items.map(([label, id]) => (
            <a key={id} href={`#${id}`}>{label}</a>
          ))}
          <RegisterLink className="nav-cta">Register</RegisterLink>
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
        <div className="hero-meta">
          <span><strong>{CONF.dates}</strong></span>
          <span>·</span>
          <span><strong>{CONF.city}</strong></span>
          <span>·</span>
          <span>Hosted by {CONF.host}</span>
        </div>
        <div className="hero-actions">
          <RegisterLink className="btn btn-primary">
            Register Your Interest
          </RegisterLink>
          <a className="btn btn-outline" href="#themes">Research Themes</a>
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
          {PAST_EDITIONS.join(', ')}, the {CONF.host} will organise the
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

function Themes() {
  return (
    <section className="band alt scroll-anchor" id="themes">
      <div className="container">
        <h2 className="section-title">Research Themes</h2>
        <p>The workshop will cover the following research themes:</p>
        <ul className="theme-list">
          {THEMES.map((t, i) => (
            <li key={i}>{t}</li>
          ))}
        </ul>
        <p className="section-note">
          <strong>Keynote speakers:</strong> to be confirmed.
        </p>
      </div>
    </section>
  );
}

function KeyDates() {
  return (
    <section className="band scroll-anchor" id="key-dates">
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
          Further deadlines (abstract submission, programme release) will be
          announced in due course.
        </p>
      </div>
    </section>
  );
}

function Organization() {
  return (
    <section className="band alt scroll-anchor" id="organization">
      <div className="container">
        <h2 className="section-title">Organisation</h2>
        <div className="org-grid">
          {COMMITTEES.map((c) => (
            <div key={c.title} className="org-card">
              <h3>{c.title}</h3>
              <ul>
                {c.members.map((m) => (
                  <li key={m.name}>
                    {m.name}
                    <span className="affil">{m.affil}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Venue() {
  return (
    <section className="band scroll-anchor" id="venue">
      <div className="container">
        <h2 className="section-title">Venue</h2>
        <div className="venue-grid">
          <div className="venue-info">
            <p>
              <strong>{CONF.shortName}</strong> will be hosted by the{' '}
              <strong>{CONF.host}</strong> in {CONF.city}. Bergen, on
              Norway&apos;s western coast, is a major centre for ocean and
              climate research and is well connected by direct flights to
              major European hubs.
            </p>
            <div className="addr">
              <strong>Host institution</strong><br />
              University of Bergen<br />
              Bergen, Norway
            </div>
            <p style={{ marginTop: 16 }}>
              The full venue address, recommended hotels and travel
              information will be provided to participants who have
              registered their interest. The nearest international airport
              is Bergen Airport, Flesland (BGO).
            </p>
            <p>
              <a
                href="https://www.google.com/maps/search/?api=1&query=University+of+Bergen"
                target="_blank"
                rel="noopener noreferrer"
              >
                Open in Google Maps →
              </a>
            </p>
          </div>
          <img
            className="venue-map"
            src={asset('wave-hero.png')}
            alt="Ocean surface waves"
          />
        </div>
      </div>
    </section>
  );
}

function Sponsors() {
  return (
    <section className="band alt scroll-anchor" id="sponsors">
      <div className="container">
        <h2 className="section-title">Organisers &amp; Partner Institutions</h2>
        <p>
          {CONF.shortName} is organised by {CONF.host} with the support of
          partner institutions represented on the Organising Committee.
        </p>
        <div className="sponsor-strip">
          {SPONSORS.map((s) => (
            <div key={s.name} className="sponsor-logo">
              <img src={asset(s.logo)} alt={s.name} title={s.name} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Register() {
  return (
    <section className="register scroll-anchor" id="register">
      <div className="container">
        <h2>Register Your Interest</h2>
        <p className="lead">
          To help us plan the workshop, please register your interest before{' '}
          <strong>{CONF.interestDeadline}</strong>. There is no payment required
          at this stage; abstract submission and registration details will follow.
        </p>
        <RegisterLink className="btn btn-primary">
          Open Interest Form ↗
        </RegisterLink>
        <div className="register-note">
          For questions, write to{' '}
          <a href={`mailto:${CONF.contactEmail}`} className="register-note-link">
            {CONF.contactEmail}
          </a>.
        </div>
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
          <div><a href={`mailto:${CONF.contactEmail}`}>{CONF.contactEmail}</a></div>
        </div>
        <div>
          <h4>Quick Links</h4>
          <div>
            <a href="#themes">Themes</a> · <a href="#venue">Venue</a> ·{' '}
            <RegisterLink className="footer-link">Register Interest</RegisterLink>
          </div>
        </div>
      </div>
      <div className="footer-legal">
        © 2027 {CONF.shortName} Organising Committee. Hosted by {CONF.host}.
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
      <Themes />
      <KeyDates />
      <Organization />
      <Venue />
      <Sponsors />
      <Register />
      <Footer />
    </>
  );
}
