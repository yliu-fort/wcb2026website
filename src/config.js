// ============================================================================
// Conference content. Everything an organiser is likely to change lives here —
// editing this file should never require touching component code.
//
// NOTE: this file is in a PUBLIC repository. Never put personal contact
// details (e.g. speakers' email addresses) in here, not even in comments.
// ============================================================================

// Whether search engines may index the site. Flip to true at launch — the
// deploy writes robots.txt from this, and every publish prints the current
// state so it is hard to leave wrong.
//
// Deliberately its own switch rather than being inferred from whether the form
// URLs are still placeholders. Those are two different questions: abstract
// submission opens 30 Aug 2026 while registration does not open until December,
// so the registration URL is legitimately a placeholder during the months when
// authors most need to find this site in a search.
export const SITE = {
  indexable: false,
};

export const CONF = {
  shortName: "Bergen 2027",
  fullName: "8th Workshop on Waves and Wave-Coupled Processes",
  subtitle:
    "Ocean surface waves in the Earth System — dynamics, coupling and large-scale impacts",
  dates: "12 – 15 April 2027",
  city: "Bergen, Norway",
  host: "the University of Bergen and the Norwegian Meteorological Institute",


  // Month-precision values are deliberate — the committee will refine them.
  abstractOpens: "30 August 2026",
  abstractDeadline: "30 November 2026",
  decisionDate: "December 2026",
  presenterRegistrationDeadline: "12 January 2027",
};

// Both forms are built in Skjemaker (skjemaker.app.uib.no), UiB's self-hosted
// MachForm: hosted by the university rather than Google, so not blocked from
// mainland China; accepts submissions with no login; takes PDF/DOCX upload from
// external respondents; and merges the entry number into its auto-responder,
// which is how the abstract receipt issues the B27-… abstract ID the registration
// form asks presenting authors to quote. See docs/forms.md.
// Three mailboxes on the conference domain, routed by purpose rather than one
// catch-all, so an author chasing a submission and a delegate asking about the
// fee do not land in the same thread. They replaced wwcp2027@uib.no, an alias
// that was written into the site and both forms but never actually created --
// every use of it bounced.
//
// Whatever changes here has to be carried across to Skjemaker by hand: these
// same addresses are the Reply-To and the notification recipient on both forms.
// See docs/forms.md.
export const EMAILS = {
  // Abstract submission: replacements, withdrawals, anything about a submitted
  // abstract. Reply-To on Form 1's receipt.
  abstract: "abstract@wavecoupling2027.eu",
  // Registration, fees, invitation letters for visas. Reply-To on Form 2.
  registration: "registration@wavecoupling2027.eu",
  // Everything else, and the address shown in the header and the footer.
  information: "information@wavecoupling2027.eu",
};

export const FORMS = {
  abstract: {
    url: "https://skjemaker.app.uib.no/view.php?id=21385291",
  },
  registration: {
    url: "https://skjemaker.app.uib.no/view.php?id=21386961",
  },
};

// Names of forms whose URL is still a placeholder (empty array = ready).
export const placeholderForms = () =>
  Object.entries(FORMS)
    .filter(([, f]) => f.url.includes("REPLACE_WITH"))
    .map(([name]) => name);

export const KEY_DATES = [
  { label: "Abstract submission opens", value: "30 Aug 2026" },
  { label: "Abstract submission deadline", value: "30 Nov 2026", deadline: true },
  { label: "Notification of acceptance", value: "Dec 2026" },
  {
    label: "Registration deadline — presenting authors",
    value: "12 Jan 2027",
    deadline: true,
  },
  { label: "Workshop", value: "12 – 15 April 2027" },
];

// Alphabetical by surname. `tentative: true` renders a "to be confirmed" tag.
// Add `photo: "speakers/<file>"` (under public/images/) when portraits arrive —
// until then the card shows an initials avatar.
export const SPEAKERS = [
  {
    name: "Lotfi Aouf",
    affil: "Météo-France",
    topic: "Data assimilation and observations from satellites",
  },
  {
    name: "Simen Ellingsen",
    affil: "NTNU, Norway",
    topic:
      "Wave–current interaction; influences in the upper ocean, wave turbulence and mixing",
  },
  {
    name: "Peter Janssen",
    affil: "ECMWF, UK",
    topic: "Air–sea interaction",
  },
  {
    name: "Yuzhu Pearl Li",
    affil: "National University of Singapore",
    topic: "Wave breaking and turbulence modelling",
  },
  {
    // TODO: affiliation to be provided by the committee.
    name: "Al Osborne",
    affil: "",
    topic: "Dynamics of nonlinear waves",
  },
  {
    name: "Zhenya Song",
    affil: "First Institute of Oceanography, China",
    topic: "Integrating surface waves into Earth system models",
  },
  {
    name: "Jim Thomson",
    affil: "University of Washington, USA",
    topic: "In-situ observations and wave breaking",
    tentative: true,
  },
  {
    name: "Takuji Waseda",
    affil: "The University of Tokyo, Japan",
    topic: "Wave–ice interactions",
    tentative: true,
  },
];

// Two groups, as the committee lists them. Order within each group follows the
// committee's own announcement rather than being alphabetised -- the local
// hosts lead, and the two host institutions appear in the order they are named
// throughout the site.
export const COMMITTEES = [
  {
    title: "Local Organisers",
    members: [
      { name: "A/Prof. Yan Li", affil: "University of Bergen, Norway" },
      { name: "Dr. Yuxuan Liu", affil: "University of Bergen, Norway" },
      { name: "Prof. Henrik Kalisch", affil: "University of Bergen, Norway" },
      {
        name: "Prof. \u00d8yvind Breivik",
        affil: "Norwegian Meteorological Institute, Norway",
      },
    ],
  },
  {
    title: "Organising Committee",
    members: [
      { name: "Prof. Alexander Babanin", affil: "The University of Melbourne, Australia" },
      { name: "Prof. Fangli Qiao", affil: "First Institute of Oceanography, China" },
      { name: "A/Prof. Lichuan Wu", affil: "Uppsala University, Sweden" },
      { name: "Dr. Jean Bidlot", affil: "ECMWF, UK" },
      { name: "Dr. Montri Maleewong", affil: "Kasetsart University, Thailand" },
    ],
  },
];

export const THEMES = [
  "Dynamics of ocean waves and wave breaking, wave–current interactions",
  "Spectral wave modelling",
  "Air–sea fluxes and the atmospheric wave boundary layer",
  "Wave influences in the upper ocean, wave turbulence and mixing",
  "Wave–ice interactions",
  "Wave-coupled processes in extreme metocean conditions, tropical cyclones",
  "Wave-coupled effects in gas transfer, ocean biogeochemistry, ambient noise, and other air–sea interface and upper-ocean processes",
  "Waves in the large-scale air–sea system, metocean climatology",
];

export const PAST_EDITIONS = [
  "Melbourne", "Qingdao", "Hangzhou", "Uppsala", "Reading", "Melbourne", "Bangkok",
];

// Hosts appear in their own row above the partner strip. `logo: null` renders
// a text tile until an official logo file is supplied.
export const HOSTS = [
  { name: "University of Bergen", logo: "logo-uib.png" },
  // Met_RGB_Horisontal_ENG from met.no's own logo page. The English horizontal
  // lockup, not the SVG in the site header — that one reads "Meteorologisk
  // institutt" and this site is in English throughout.
  { name: "Norwegian Meteorological Institute", logo: "logo-met.jpg" },
];

// Partner institutions represented on the Organising Committee (hosts excluded).
export const PARTNERS = [
  { name: "University of Melbourne", logo: "logo-melbourne.png" },
  { name: "First Institute of Oceanography", logo: "logo-fio.png" },
  { name: "Uppsala University", logo: "logo-uppsala.jpeg" },
  { name: "ECMWF", logo: "logo-ecmwf.png" },
  { name: "Kasetsart University", logo: "logo-kasetsart.jpg" },
];

// Venue. Coordinates drive the OpenStreetMap embed in the Venue section
// (chosen over a Google Maps embed, which is blocked in mainland China).
export const VENUE = {
  name: "Grand Hotel Terminus",
  address: ["Zander Kaaes gate 6", "5015 Bergen, Norway"],
  lat: 60.3897,
  lon: 5.3316,
};

// Resolves a file in public/images/ to a URL that respects `base` from
// vite.config.js. Vite rewrites asset paths in HTML but not in JS strings, so
// anything referenced from a component has to go through this.
export const asset = (file) => `${import.meta.env.BASE_URL}images/${file}`;

// Same, for files in public/downloads/ (abstract templates).
export const download = (file) => `${import.meta.env.BASE_URL}downloads/${file}`;
