// ============================================================================
// Conference content. Everything an organiser is likely to change lives here —
// editing this file should never require touching component code.
// ============================================================================

export const CONF = {
  shortName: "WWCP 2027",
  fullName: "8th Workshop on Waves and Wave-Coupled Processes",
  subtitle:
    "Ocean surface waves in the Earth System — dynamics, coupling and large-scale impacts",
  dates: "12 – 15 April 2027",
  city: "Bergen, Norway",
  host: "University of Bergen",

  // TODO(before merging to main): replace with the real form URL created in
  // UiB Skjemaker. The value below is the Skjemaker service page, NOT a form —
  // shipping it would repeat the broken-link bug currently live on the site.
  // A visible warning banner is rendered while this placeholder is in place.
  registrationUrl: "https://skjemaker.app.uib.no/",

  // Deadline quoted in the "Register Your Interest" section. NOTE: this does not
  // match the abstract-submission deadline in KEY_DATES (15 Nov 2026) — confirm
  // which is intended.
  interestDeadline: "30 November 2026",

  contactEmail: "wwcp2027@uib.no",
};

// True while `registrationUrl` is still the Skjemaker service page rather than
// an actual form. Used to surface an unmissable warning during development.
export const REGISTRATION_URL_IS_PLACEHOLDER =
  CONF.registrationUrl === "https://skjemaker.app.uib.no/";

export const KEY_DATES = [
  { label: "Abstract submission opens", value: "Aug 1, 2026" },
  { label: "Abstract submission deadline", value: "Nov 15, 2026", deadline: true },
  { label: "Notification of acceptance", value: "Dec 20, 2026" },
  { label: "Early-bird registration ends", value: "Jan 30, 2027", deadline: true },
  { label: "Final program release", value: "March 12, 2027" },
  { label: "Workshop dates", value: "April 12 – 15, 2027" },
];

export const COMMITTEES = [
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

// Files live in public/images/ — add a logo by dropping the file there and
// adding a line below. `asset()` prefixes the deployment base path.
export const SPONSORS = [
  { name: "University of Bergen", logo: "logo-uib.png" },
  { name: "University of Melbourne", logo: "logo-melbourne.png" },
  { name: "First Institute of Oceanography", logo: "logo-fio.png" },
  { name: "Uppsala University", logo: "logo-uppsala.jpeg" },
  { name: "ECMWF", logo: "logo-ecmwf.png" },
  { name: "Kasetsart University", logo: "logo-kasetsart.jpg" },
];

// Resolves a file in public/images/ to a URL that respects `base` from
// vite.config.js. Vite rewrites asset paths in HTML but not in JS strings, so
// anything referenced from a component has to go through this.
export const asset = (file) => `${import.meta.env.BASE_URL}images/${file}`;
