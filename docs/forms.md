# Nettskjema form specifications

Both forms are created in [Nettskjema](https://nettskjema.no) (log in with
Feide). Nettskjema was chosen because it is Norwegian-hosted (reachable from
mainland China, unlike Google Forms), accepts file uploads from external
respondents, and sends every respondent an automatic email receipt carrying a
submission reference number — which the registration form asks presenting
authors to quote.

After creating each form, put its URL into `src/config.js` (`FORMS.abstract.url`
and `FORMS.registration.url`). While either URL is still a `REPLACE_WITH_…`
placeholder, `npm run dev` shows a warning banner and CI blocks deployment.

## Form 1 — Abstract submission

Open **30 August – 30 November 2026** (set the opening and closing dates in the
form settings so submissions outside the window are rejected automatically).

Suggested fields:

| # | Field | Type | Required |
|---|-------|------|----------|
| 1 | Name of the submitting author | short text | yes |
| 2 | Email address | email (used for the receipt) | yes |
| 3 | Affiliation (institution, country) | short text | yes |
| 4 | Name of the presenting author | short text | yes |
| 5 | Abstract title | short text | yes |
| 6 | Research theme | dropdown — the eight themes from the website | yes |
| 7 | Abstract (PDF, one A4 page, from the template) | file upload, restrict to `.pdf` | yes |
| 8 | Comments to the organisers | long text | no |

Settings: enable the email receipt to the respondent. The receipt includes the
submission reference number; the website tells authors to keep it.

## Form 2 — Registration

Presenting authors must register by **12 January 2027**; the participant
deadline is still to be announced.

Suggested fields:

| # | Field | Type | Required |
|---|-------|------|----------|
| 1 | Full name | short text | yes |
| 2 | Email address | email | yes |
| 3 | Affiliation (institution, country) | short text | yes |
| 4 | I am registering as | radio: "Presenting author" / "Participant" | yes |
| 5 | Abstract reference number | short text — shown only when "Presenting author" is selected (conditional question) | yes when shown |
| 6 | Dietary requirements | short text | no |
| 7 | Comments to the organisers | long text | no |

Settings: enable the email receipt. Use Nettskjema's conditional-question
feature for field 5 so participants never see it.

One form with a branch keeps a single URL and one dataset; if the committee
prefers two separate registration forms (one per category, with different
closing dates enforced by the form itself), create both and add a second URL to
`src/config.js` — the Registration card in `src/App.jsx` then needs a second
button.
