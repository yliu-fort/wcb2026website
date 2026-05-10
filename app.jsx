const { useState } = React;

// ============ Configuration ============
const CONF = {
    shortName: "WWCP 2027",
    fullName: "8th Workshop on Waves and Wave-Coupled Processes",
    subtitle: "Ocean surface waves in the Earth System — dynamics, coupling and large-scale impacts",
    dates: "12 – 15 April 2027",
    city: "Bergen, Norway",
    host: "University of Bergen",
    // Replace with the real registration links before publishing.
    registrationChannels: [
        {
            id: "google",
            label: "Google Form",
            sub: "Recommended for most participants",
            url: "https://forms.gle/oxYy4vD4jwP9nWaH7",
            recommended: true,
        },
        {
            id: "tencent",
            label: "Tencent Form",
            sub: "If you have no access to Google, please use this link",
            url: "https://docs.qq.com/form/page/REPLACE_WITH_REAL_TENCENT_DOC_ID",
        },
    ],
    contactEmail: "wwcp2027@uib.no",
};

const RegisterContext = React.createContext(() => { });

const KEY_DATES = [
    { label: "Abstract submission opens", value: "Aug 1, 2026" },
    { label: "Abstract submission deadline", value: "Nov 15, 2026", deadline: true },
    { label: "Notification of acceptance", value: "Dec 20, 2026" },
    { label: "Early-bird registration ends", value: "Jan 30, 2027", deadline: true },
    { label: "Final program release", value: "March 12, 2027" },
    { label: "Workshop dates", value: "April 12 – 15, 2027" }
];

const COMMITTEES = [
    {
        title: "Organising Committee",
        members: [
            { name: "A/Prof. Yan Li", affil: "University of Bergen, Norway" },
            { name: "Prof. Alexander Babanin", affil: "The University of Melbourne, Australia" },
            { name: "Prof. Fangli Qiao", affil: "First Institute of Oceanography, China" },
            { name: "Prof. Lichuan Wu", affil: "Uppsala University, Sweden" },
            { name: "Dr. Jean Bidlot", affil: "ECMWF, UK" },
            { name: "Dr. Montri Maleewong", affil: "Kasetsart University, Thailand" },
        ],
    },
];

const THEMES = [
    "Dynamics of ocean waves and wave breaking, wave–current interactions",
    "Spectral wave modelling",
    "Air–sea fluxes and the atmospheric wave boundary layer",
    "Wave influences in the upper ocean, wave turbulence and mixing",
    "Wave–ice interactions",
    "Wave-coupled processes in extreme metocean conditions, tropical cyclones",
    "Wave-coupled effects in gas transfer, ocean biogeochemistry, ambient noise, and other air–sea interface and upper-ocean processes",
    "Waves in the large-scale air–sea system, metocean climatology",
];

const PAST_EDITIONS = [
    "Melbourne", "Qingdao", "Hangzhou", "Uppsala", "Reading", "Melbourne", "Bangkok",
];

const SPONSORS = [
    { name: "University of Bergen", logo: "images/logo-uib.png" },
    { name: "University of Melbourne", logo: "images/logo-melbourne.png" },
    { name: "First Institute of Oceanography", logo: "images/logo-fio.png" },
    { name: "Uppsala University", logo: "images/logo-uppsala.jpeg" },
    { name: "ECMWF", logo: "images/logo-ecmwf.png" },
    { name: "Kasetsart University", logo: "images/logo-kasetsart.jpg" },
];

// ============ Components ============
function RegisterButton({ className, children }) {
    const openRegister = React.useContext(RegisterContext);
    return (
        <button type="button" className={`register-trigger ${className || ""}`} onClick={openRegister}>
            {children}
        </button>
    );
}

function RegisterModal({ onClose }) {
    React.useEffect(() => {
        const onKey = (e) => { if (e.key === "Escape") onClose(); };
        document.addEventListener("keydown", onKey);
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", onKey);
            document.body.style.overflow = prev;
        };
    }, [onClose]);

    return (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="register-modal-title" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <button type="button" className="modal-close" aria-label="Close" onClick={onClose}>×</button>
                <h3 id="register-modal-title">Choose a registration channel</h3>
                <p className="modal-sub">
                    Please use the channel that best suits your location. The information collected is identical.
                </p>
                <div className="channel-list">
                    {CONF.registrationChannels.map((c) => (
                        <a
                            key={c.id}
                            className={`channel-card ${c.recommended ? "recommended" : ""}`}
                            href={c.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={onClose}
                        >
                            <div className="channel-label">
                                {c.label}
                                {c.recommended && <span className="channel-tag">Recommended</span>}
                            </div>
                            <div className="channel-sub">{c.sub}</div>
                            <div className="channel-cta">Open form ↗</div>
                        </a>
                    ))}
                </div>
            </div>
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
        ["Introduction", "introduction"],
        ["Themes", "themes"],
        ["Key Dates", "key-dates"],
        ["Organisation", "organization"],
        ["Venue", "venue"],
        ["Sponsors", "sponsors"],
    ];
    return (
        <header className="site-header">
            <div className="site-header-inner">
                <a href="#top" className="brand">
                    <span className="brand-mark" aria-hidden="true"></span>
                    <span className="brand-text">
                        <span className="brand-title">{CONF.shortName}</span>
                        <span className="brand-sub">Waves & Wave-Coupled Processes</span>
                    </span>
                </a>
                <nav className="nav">
                    {items.map(([label, id]) => (
                        <a key={id} href={`#${id}`}>{label}</a>
                    ))}
                    <RegisterButton className="nav-cta">
                        Register
                    </RegisterButton>
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
                    <RegisterButton className="btn btn-primary">
                        Register Your Interest
                    </RegisterButton>
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
                    After the previous seven successful workshops in{" "}
                    {PAST_EDITIONS.join(", ")}, the {CONF.host} will organise the
                    8<sup>th</sup> Workshop on Waves and Wave-Coupled Processes in{" "}
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
                <p style={{ marginTop: 18, color: "var(--muted)", fontSize: "0.9rem" }}>
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
                        <div key={i} className={`date-card ${d.deadline ? "deadline" : ""}`}>
                            <div className="label">{d.label}</div>
                            <div className="value">{d.value}</div>
                        </div>
                    ))}
                </div>
                <p style={{ marginTop: 18, color: "var(--muted)", fontSize: "0.9rem" }}>
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
                            <strong>{CONF.shortName}</strong> will be hosted by the{" "}
                            <strong>{CONF.host}</strong> in {CONF.city}. Bergen, on
                            Norway's western coast, is a major centre for ocean and
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
                        src="images/wave-hero.png"
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
                <h2 className="section-title">Organisers & Partner Institutions</h2>
                <p>
                    {CONF.shortName} is organised by {CONF.host} with the support of
                    partner institutions represented on the Organising Committee.
                </p>
                <div className="sponsor-strip">
                    {SPONSORS.map((s) => (
                        <div key={s.name} className="sponsor-logo">
                            <img src={s.logo} alt={s.name} title={s.name} />
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
                    To help us plan the workshop, please register your interest before{" "}
                    <strong>30 November 2026</strong>. There is no payment required at
                    this stage; abstract submission and registration details will follow.
                </p>
                <RegisterButton className="btn btn-primary">
                    Open Interest Form ↗
                </RegisterButton>
                <div className="register-note">
                    For questions, write to{" "}
                    <a href={`mailto:${CONF.contactEmail}`} style={{ color: "#fff", textDecoration: "underline" }}>
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
                    <div><a href="#themes">Themes</a> · <a href="#venue">Venue</a> · <RegisterButton className="footer-link">Register Interest</RegisterButton></div>
                </div>
            </div>
            <div style={{ maxWidth: "var(--maxw)", margin: "20px auto 0", paddingTop: 14, borderTop: "1px solid #14305a", color: "#8aa0bb", fontSize: "0.82rem" }}>
                © 2027 {CONF.shortName} Organising Committee. Hosted by {CONF.host}.
            </div>
        </footer>
    );
}

function App() {
    const [registerOpen, setRegisterOpen] = useState(false);
    const openRegister = React.useCallback(() => setRegisterOpen(true), []);
    const closeRegister = React.useCallback(() => setRegisterOpen(false), []);
    return (
        <RegisterContext.Provider value={openRegister}>
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
            {registerOpen && <RegisterModal onClose={closeRegister} />}
        </RegisterContext.Provider>
    );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
