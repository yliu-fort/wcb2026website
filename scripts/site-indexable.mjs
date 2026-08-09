// Exits 0 when the site may be indexed, 1 when it may not. publish.sh writes
// robots.txt from this.
//
// Separate from check-form-urls.mjs on purpose: "are the form links real" and
// "has the site launched" are different questions with different dates behind
// them, and conflating them would hide the site from search during the abstract
// submission window, when the registration URL is still legitimately a
// placeholder.

import { SITE } from "../src/config.js";

if (SITE.indexable) {
  console.log("indexable");
  process.exit(0);
}
console.log("not indexable (SITE.indexable is false in src/config.js)");
process.exit(1);
