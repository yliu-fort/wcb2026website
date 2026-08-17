import {
  CONF,
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
          Contact: <a href={`mailto:${CONF.contactEmail}`}>{CONF.contactEmail}</a>
        </span>
      </div>
    </div>
  );
}

function Header() {
  const items = [
    ['Introduction', 'introduction'],
    ['Keynote Speakers', 'speakers'],
    ['Key Dates', 'key-dates'],
    ['Registration', 'registration'],
    ['For Authors', 'for-authors'],
    ['Venue', 'venue'],
    ['Organisation', 'organization'],
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
          <a
            className="nav-cta"
            href={FORMS.registration.url}
            target="_blank"
            rel="noopener noreferrer"
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
        <div className="hero-meta">
          <span><strong>{CONF.dates}</strong></span>
          <span>·</span>
          <span><strong>{CONF.city}</strong></span>
          <span>·</span>
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

// Circular portrait with the name plate below. Until a portrait file is
// supplied the circle carries the speaker's initials.
function SpeakerPortrait({ name, photo }) {
  if (photo) {
    return <img className="speaker-photo" src={asset(photo)} alt={name} />;
  }
  const parts = name.split(/\s+/).filter(Boolean);
  const initials = (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return (
    <div className="speaker-photo speaker-initials" aria-hidden="true">
      {initials}
    </div>
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
              <SpeakerPortrait name={s.name} photo={s.photo} />
              <div className="speaker-name">{s.name}</div>
              {s.affil && <div className="speaker-affil">{s.affil}</div>}
              <div className="speaker-topic">{s.topic}</div>
              {s.tentative && <span className="speaker-tag">To be confirmed</span>}
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
              ID — keep it for later.
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
          For questions, write to{' '}
          <a href={`mailto:${CONF.contactEmail}`} className="register-note-link">
            {CONF.contactEmail}
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
          {/* EU emblem rules (2021–2027): the emblem carries the spelled-out
              funding statement and must be at least as large as the biggest
              other logo in this strip — keep that invariant when the ERC and
              RCN logo files arrive. */}
          <div className="funding-item eu-lockup">
            <img src={asset('eu-emblem.svg')} alt="Flag of the European Union" />
            <span>Funded by<br />the European Union</span>
          </div>
          {/* TODO: replace with the official ERC logo from the grantee brand
              pack — ERC projects display the EU emblem and ERC logo together. */}
          <div className="funding-item text-logo">European Research Council</div>
          {/* TODO: official logo file from the Research Council of Norway. */}
          <div className="funding-item text-logo">
            The Research Council of Norway
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
          <div><a href={`mailto:${CONF.contactEmail}`}>{CONF.contactEmail}</a></div>
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
