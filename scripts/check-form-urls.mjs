// Fails when any form URL in src/config.js is still a placeholder.
//
// This replaced `grep -q 'REPLACE_WITH_' src/config.js`, which matched the
// comment and the detector string in config.js itself — so it stayed red after
// the real URLs were filled in, and the reason would have looked arbitrary.
// Asking config.js directly means the check cannot disagree with the banner the
// dev server shows: both call placeholderForms().

import { placeholderForms } from "../src/config.js";

const pending = placeholderForms();

if (pending.length === 0) {
  console.log("form URLs: all real");
  process.exit(0);
}

const where = "src/config.js";
console.error(
  `::error file=${where}::Still a placeholder: ${pending.join(", ")}. ` +
    `Set the real form URLs in ${where} before deploying.`,
);
process.exit(1);
