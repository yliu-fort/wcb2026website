const { useState } = React;

// ============ Configuration ============
const CONF = {
    shortName: "WCB 2026",
    fullName: "Wave Coupling and Beyond 2026",
    subtitle: "International Workshop on Wave Coupling, Scattering and Multi-Physics Interactions",
    dates: "August 17 – 21, 2026",
    city: "Bergen, Norway",
    // Replace with the real Google Form link before publishing.
    registrationUrl: "https://forms.gle/oxYy4vD4jwP9nWaH7",
    contactEmail: "wcb2026@example.org",
};

const KEY_DATES = [
    { label: "Abstract submission opens", value: "Feb 1, 2026" },
    { label: "Abstract submission deadline", value: "Apr 15, 2026", deadline: true },
    { label: "Notification of acceptance", value: "May 20, 2026" },
    { label: "Early-bird registration ends", value: "Jun 30, 2026", deadline: true },
    { label: "Final program release", value: "Jul 25, 2026" },
    { label: "Workshop dates", value: "Aug 17 – 21, 2026" },
];

const COMMITTEES = [
    {
        title: "General Chairs",
        members: [
            { name: "Prof. A. Researcher", affil: "Tsinghua University" },
            { name: "Prof. B. Scholar", affil: "MIT" },
        ],
    },
    {
        title: "Program Committee",
        members: [
            { name: "Prof. C. Wave", affil: "ETH Zürich" },
            { name: "Prof. D. Coupling", affil: "Stanford University" },
            { name: "Prof. E. Scatter", affil: "University of Tokyo" },
            { name: "Prof. F. Resonance", affil: "Imperial College London" },
        ],
    },
    {
        title: "Local Organizers",
        members: [
            { name: "Dr. G. Host", affil: "Shanghai Jiao Tong University" },
            { name: "Dr. H. Liaison", affil: "Fudan University" },
            { name: "Ms. I. Secretary", affil: "WCB Secretariat" },
        ],
    },
];

const PROGRAM = {
    "Day 1 · Aug 17": [
        { time: "08:30 – 09:00", title: "Registration & Welcome Coffee", session: true },
        { time: "09:00 – 09:20", title: "Opening Remarks", speaker: "General Chairs" },
        { time: "09:20 – 10:20", title: "Keynote: Multi-scale Wave Coupling in Heterogeneous Media", speaker: "Prof. J. Plenary, Caltech" },
        { time: "10:20 – 10:50", title: "Coffee Break" },
        { time: "10:50 – 12:30", title: "Session A — Acoustic–Elastic Coupling", session: true },
        { time: "12:30 – 14:00", title: "Lunch" },
        { time: "14:00 – 15:40", title: "Session B — Computational Methods", session: true },
        { time: "15:40 – 16:10", title: "Coffee Break" },
        { time: "16:10 – 17:30", title: "Poster Session I" },
        { time: "18:30 – ", title: "Welcome Reception" },
    ],
    "Day 2 · Aug 18": [
        { time: "09:00 – 10:00", title: "Keynote: Nonlinear Wave Phenomena in Active Matter", speaker: "Prof. K. Dynamics, Oxford" },
        { time: "10:00 – 10:30", title: "Coffee Break" },
        { time: "10:30 – 12:30", title: "Session C — Fluid–Structure Interaction", session: true },
        { time: "12:30 – 14:00", title: "Lunch" },
        { time: "14:00 – 16:00", title: "Session D — Metamaterials & Phononics", session: true },
        { time: "16:00 – 16:30", title: "Coffee Break" },
        { time: "16:30 – 18:00", title: "Industry Panel" },
    ],
    "Day 3 · Aug 19": [
        { time: "09:00 – 12:00", title: "Excursion / Cultural Tour" },
        { time: "12:00 – 14:00", title: "Lunch (free)" },
        { time: "14:00 – 17:30", title: "Workshops & Tutorials", session: true },
        { time: "19:00 – ", title: "Conference Banquet" },
    ],
    "Day 4 · Aug 20": [
        { time: "09:00 – 10:00", title: "Keynote: Inverse Problems for Coupled Wave Systems", speaker: "Prof. L. Inverse, INRIA" },
        { time: "10:00 – 10:30", title: "Coffee Break" },
        { time: "10:30 – 12:30", title: "Session E — Geophysical & Oceanic Waves", session: true },
        { time: "12:30 – 14:00", title: "Lunch" },
        { time: "14:00 – 16:00", title: "Session F — Quantum & Optical Coupling", session: true },
        { time: "16:00 – 17:30", title: "Poster Session II" },
    ],
    "Day 5 · Aug 21": [
        { time: "09:00 – 10:30", title: "Session G — Emerging Topics", session: true },
        { time: "10:30 – 11:00", title: "Coffee Break" },
        { time: "11:00 – 12:00", title: "Closing Ceremony & Best Paper Awards" },
        { time: "12:00 – ", title: "Farewell Lunch" },
    ],
};

const SPONSORS = [
    { name: "Sponsor A", logo: "https://placehold.co/200x80/0b2545/ffffff?text=Sponsor+A" },
    { name: "Sponsor B", logo: "https://placehold.co/200x80/1d4e89/ffffff?text=Sponsor+B" },
    { name: "Sponsor C", logo: "https://placehold.co/200x80/2a9d8f/ffffff?text=Sponsor+C" },
    { name: "Sponsor D", logo: "https://placehold.co/200x80/13315c/ffffff?text=Sponsor+D" },
    { name: "Sponsor E", logo: "https://placehold.co/200x80/5b6b7d/ffffff?text=Sponsor+E" },
];

// ============ Components ============
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
        ["Key Dates", "key-dates"],
        ["Organization", "organization"],
        ["Program", "program"],
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
                        <span className="brand-sub">Wave Coupling Workshop</span>
                    </span>
                </a>
                <nav className="nav">
                    {items.map(([label, id]) => (
                        <a key={id} href={`#${id}`}>{label}</a>
                    ))}
                    <a href={CONF.registrationUrl} target="_blank" rel="noopener noreferrer" className="nav-cta">
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
                    <span>In-person & hybrid</span>
                </div>
                <div className="hero-actions">
                    <a className="btn btn-primary" href={CONF.registrationUrl} target="_blank" rel="noopener noreferrer">
                        Register via Google Form
                    </a>
                    <a className="btn btn-outline" href="#program">View Program</a>
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
                    The <strong>{CONF.fullName}</strong> ({CONF.shortName}) brings together
                    mathematicians, physicists, and engineers working on the theory,
                    computation, and applications of coupled wave systems. Building on the
                    tradition of the Wave Coupling Workshop series, the 2026 edition will
                    feature plenary lectures, contributed talks, posters, and tutorials
                    covering acoustic–elastic interaction, fluid–structure coupling,
                    metamaterials, geophysical and oceanic waves, and emerging quantum
                    and photonic platforms.
                </p>
                <p>
                    The workshop is intended as a small-scale, focused gathering of
                    roughly 80–100 participants, encouraging in-depth discussion and
                    collaboration. Early-career researchers and PhD students are warmly
                    welcomed; a limited number of travel grants will be available.
                </p>
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
                        <div key={i} className={`date-card ${d.deadline ? "deadline" : ""}`}>
                            <div className="label">{d.label}</div>
                            <div className="value">{d.value}</div>
                        </div>
                    ))}
                </div>
                <p style={{ marginTop: 18, color: "var(--muted)", fontSize: "0.9rem" }}>
                    All deadlines are 23:59 Anywhere on Earth (AoE).
                </p>
            </div>
        </section>
    );
}

function Organization() {
    return (
        <section className="band scroll-anchor" id="organization">
            <div className="container">
                <h2 className="section-title">Organization</h2>
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

function Program() {
    const days = Object.keys(PROGRAM);
    const [active, setActive] = useState(days[0]);
    const rows = PROGRAM[active];
    return (

        <section className="band alt scroll-anchor" id="program">
            <div className="container">
                <h2 className="section-title">Program</h2>
                <div className="program-tabs">
                    {days.map((d) => (
                        <button
                            key={d}
                            className={`tab-btn ${d === active ? "active" : ""}`}
                            onClick={() => setActive(d)}
                        >
                            {d}
                        </button>
                    ))}
                </div>
                <table className="program-table">
                    <thead>
                        <tr>
                            <th style={{ width: 140 }}>Time</th>
                            <th>Item</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((r, i) => (
                            <tr key={i} className={r.session ? "session" : ""}>
                                <td className="time">{r.time}</td>
                                <td>
                                    {r.title}
                                    {r.speaker && <div className="speaker">{r.speaker}</div>}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <p style={{ marginTop: 14, color: "var(--muted)", fontSize: "0.9rem" }}>
                    The program is tentative and subject to change. Detailed talk titles
                    and abstracts will be released in late July 2026.
                </p>
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
                            <strong>{CONF.shortName}</strong> will be held at the
                            <strong> International Conference Hall</strong> on the Minhang
                            campus of Shanghai Jiao Tong University. The campus is well
                            connected to downtown Shanghai by metro Line 5.
                        </p>
                        <div className="addr">
                            <strong>Address</strong><br />
                            International Conference Hall<br />
                            800 Dongchuan Road, Minhang District<br />
                            Shanghai 200240, China
                        </div>
                        <p style={{ marginTop: 16 }}>
                            Recommended hotels and travel information will be provided to
                            registered participants. The nearest international airport is
                            Shanghai Pudong International (PVG); Shanghai Hongqiao (SHA) also
                            offers convenient access via metro.
                        </p>
                        <p>
                            <a
                                href="https://www.google.com/maps/search/?api=1&query=Shanghai+Jiao+Tong+University+Minhang"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Open in Google Maps →
                            </a>
                        </p>
                    </div>
                    <img
                        className="venue-map"
                        src="https://placehold.co/720x520/eef3f8/0b2545?text=Venue+Map+Placeholder"
                        alt="Venue map placeholder"
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
                <h2 className="section-title">Organizers & Sponsors</h2>
                <p>
                    {CONF.shortName} is jointly organized and supported by the following
                    institutions and partners.
                </p>
                <div className="sponsor-strip">
                    {SPONSORS.map((s) => (
                        <div key={s.name} className="sponsor-logo">
                            <img src={s.logo} alt={s.name} />
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
                <h2>Registration</h2>
                <p className="lead">
                    Registration is handled via a Google Form. There is <strong>no
                        payment required at registration</strong>; on-site fee collection
                    details (if any) will be sent by email after confirmation.
                </p>
                <a
                    className="btn btn-primary"
                    href={CONF.registrationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Open Registration Form ↗
                </a>
                <div className="register-note">
                    The form takes about 3 minutes. For questions, write to{" "}
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
                    <div><a href="#program">Program</a> · <a href="#venue">Venue</a> · <a href={CONF.registrationUrl} target="_blank" rel="noopener noreferrer">Register</a></div>
                </div>
            </div>
            <div style={{ maxWidth: "var(--maxw)", margin: "20px auto 0", paddingTop: 14, borderTop: "1px solid #14305a", color: "#8aa0bb", fontSize: "0.82rem" }}>
                © 2026 {CONF.shortName} Organizing Committee. All rights reserved.
            </div>
        </footer>
    );
}

function App() {
    return (
        <React.Fragment>
            <TopBar />
            <Header />
            <Hero />
            <Introduction />
            <KeyDates />
            <Organization />
            <Program />
            <Venue />
            <Sponsors />
            <Register />
            <Footer />
        </React.Fragment>
    );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);