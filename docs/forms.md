# Abstract submission and registration forms

Build spec for the two Skjemaker forms, and the record of what was decided and
why. Written to be followed field-by-field while building the forms, so that the
site copy, the emails and the forms cannot drift apart.

**Status: not built yet.** `FORMS` in `src/config.js` still holds placeholders,
which is what keeps CI red and `robots.txt` closed.

## Platform

Skjemaker (`skjemaker.app.uib.no`) is UiB's self-hosted **MachForm** (the UiB
service catalogue names Appnitro Software as vendor). That identification is
what tells us which features exist, so it is worth keeping in mind when
searching for documentation — search MachForm's docs, not UiB's.

Verified by fetching a live UiB form anonymously:

- Forms render and accept submissions **without any login**, which is the
  precondition for a worldwide audience.
- File upload fields exist (MachForm "Advanced File Upload", multiple files).
- An auto-responder to the submitter exists, but **requires an Email field on
  the form** and is configured under Notifications → "Send Confirmation Email to
  User".

Not available, and this shapes the whole design:

- **There is no respondent-facing submission ID.** MachForm keeps an internal
  entry number, visible to form owners in the Entries table, but no documented
  merge tag puts it in the auto-responder, and there is no "unique ID" field
  type. Recurring requests on MachForm's own forums confirm it is not built in.

## Design: the abstract ID rides on the acceptance notification

```
submit abstract  →  auto-responder: "received", echoes title + filename,
                     states that decisions come in December. No ID.
                        ↓
                 committee review
                        ↓
acceptance email  →  the ID appears here for the first time:  B27-042
                        ↓
   registration  →  author quotes the ID (deadline 12 Jan 2027)
```

Issuing the ID at acceptance rather than at submission costs nothing to
automate, because a personal email is being sent at that moment anyway. It also
avoids the failure mode where a receipt lands in spam and the author is locked
out of registering, and it stops an ID reading as "accepted" when it is not.

**Use the Skjemaker entry number as the ID**, prefixed — e.g. `B27-042`. It is
unique, stable, and already present in the CSV export, so nothing has to be
assigned by hand. Gaps from deleted test entries do not matter.

If MachForm supports pre-filling fields from URL query parameters — open
question for UiB IT — put a registration link with the ID already filled into
the acceptance email and transcription errors disappear.

## Consequence of "multiple abstracts allowed" + "no edit or withdraw"

These two decisions interact, and the interaction needs an explicit field or it
becomes an unresolvable mess at reconciliation time.

With no self-service editing, an author who spots a mistake will submit again.
With multiple abstracts permitted, **a second submission from the same person is
indistinguishable from a correction to the first one.** Sorting that out by hand
across a hundred submissions is exactly the kind of work that produces a wrong
programme.

So the abstract form carries a replacement question (fields 12–13 below), the
auto-responder tells authors to use it, and the site says the same. Withdrawal
has no self-service path at all and goes to the shared mailbox — worth stating
explicitly, because people do withdraw and they will otherwise resubmit an empty
form or email a random committee member.

## Form 1 — Abstract submission

| # | Field | Type | Required | Notes |
|---|---|---|---|---|
| 1 | Presenting author — full name | Text | ✓ | |
| 2 | Email | Email | ✓ | Drives the auto-responder; the form has no receipt without it |
| 3 | Affiliation | Text | ✓ | |
| 4 | Country | Dropdown | ✓ | Statistics and visa-letter planning |
| 5 | Abstract title | Text | ✓ | Echoed in the receipt |
| 6 | Co-authors | Paragraph | | One per line, `Name, Affiliation`. For the programme |
| 7 | Theme | Dropdown | ✓ | Must match `THEMES` in `src/config.js` — see drift note below |
| 8 | Presentation format | Radio | ✓ | Oral / Poster / Either |
| 9 | Abstract file | File upload | ✓ | See file policy below |
| 10 | Abstract text | Paragraph | | Optional but strongly wanted — see below |
| 11 | Early-career researcher | Checkbox | | Only if travel support or a prize exists |
| 12 | Is this a replacement for an abstract you already submitted? | Radio | ✓ | Yes / No |
| 13 | Title of the submission it replaces | Text | conditional | Shown only when 12 = Yes |
| 14 | Consent to data processing | Checkbox | ✓ | |

**Field 10 is what actually buys flexibility.** The decision on file formats is
still open and is being designed permissively, but the durable fix is not a
longer list of accepted extensions — it is having the abstract as plain text so
the book of abstracts never depends on extracting text from whatever was
uploaded. Ask for both.

**File policy** (open decision 4, designed for maximum flexibility until it is
settled): accept PDF and DOCX rather than PDF alone; treat the repository
templates in `public/downloads/` as recommended rather than mechanically
enforced; request the largest size limit UiB will permit. Tightening later is
easy; loosening after authors have hit a wall is not.

**Theme drift.** The dropdown in Skjemaker is a manual copy of `THEMES` in
`src/config.js`. There is no mechanism keeping them in sync. Change one, change
the other, or submissions arrive tagged with a theme the site does not list.

## Form 2 — Registration

| # | Field | Type | Required | Notes |
|---|---|---|---|---|
| 1 | Full name | Text | ✓ | |
| 2 | Email | Email | ✓ | Drives the auto-responder |
| 3 | Affiliation | Text | ✓ | |
| 4 | Country | Dropdown | ✓ | |
| 5 | Are you presenting? | Radio | ✓ | Gates field 6 |
| 6 | Abstract ID(s) | Text | conditional | Shown only when 5 = Yes. Comma-separated; help text says "from your acceptance email, e.g. B27-042" |
| 7 | Registration category | Radio | ✓ | Student / Regular |
| 8 | Dietary requirements | Text | | |
| 9 | Accessibility requirements | Text | | |
| 10 | Conference dinner | Radio | | If one is held |
| 11 | Invitation letter for a visa required? | Checkbox | | Do not omit — a large share of this audience needs one, and requests arriving by email at the last minute are painful |
| 12 | Consent to data processing | Checkbox | ✓ | |

**Field 6 accepts several IDs** because one person may present more than one
abstract. Note the programme consequence: permitting multiple *submissions* is
routine, permitting one person to *present* twice creates scheduling constraints
and is usually capped. If the committee wants a cap, it belongs in the site copy
and in this field's help text.

**Field 7 exists now even though registration is currently designed as free.**
Adding it later means re-contacting everyone who already registered.

**Field 6 cannot be validated.** The two forms are separate with no integration,
so the ID is free text and is checked during reconciliation.

**Non-presenting attendees must be able to complete this form**, which is what
the conditional on field 5 is for. Only the presenting author of an abstract is
required to register in connection with it — so **co-authors who plan to attend
register here as ordinary attendees.** Say so on the site, or badge and catering
counts will be short.

## Emails

**Abstract receipt (auto-responder, Form 1).** No ID.

> Thank you — we have received your abstract for the 8th Workshop on Waves and
> Wave-Coupled Processes, Bergen, 12–15 April 2027.
>
> Title: `{title}`
> File: `{filename}`
>
> The committee will notify all authors of its decision in December 2026. You do
> not need to do anything until then, and you do not need to register yet.
>
> This submission cannot be edited. If you need to correct it, submit the form
> again and answer "Yes" to the replacement question. To withdraw an abstract,
> email wwcp2027@uib.no.

**Acceptance (manual, December 2026).** Where the ID is issued.

> Your abstract has been accepted for **oral / poster** presentation.
>
> **Abstract ID: B27-042** — please quote it when you register.
>
> Presenting authors must register by **12 January 2027**: `<registration link>`

**Registration receipt (auto-responder, Form 2).** Echo the category and any
abstract IDs, so a mistyped ID is visible to the author while it can still be
fixed.

## Timeline

From `KEY_DATES` in `src/config.js`:

| Date | Event |
|---|---|
| 30 Aug 2026 | Abstract submission opens |
| 30 Nov 2026 | Abstract submission deadline |
| Dec 2026 | Notification of acceptance — **IDs issued here** |
| 12 Jan 2027 | Registration deadline, presenting authors |
| 12–15 Apr 2027 | Workshop |

Two gaps, both open decision 7: there is **no "registration opens" date** and
**no deadline for non-presenting attendees**.

## The registration fee has a hard deadline of December 2026

Registration is being designed as free because the fee model is undecided. That
is workable, but it constrains the calendar in a way worth stating plainly:

**Do not open registration before the fee is settled.** Someone who registers
while the site implies no charge has a fair claim not to be billed later.
Because the acceptance emails in December carry the registration link, the fee
must be decided and published *before* those go out.

Also:

- **Do not write "free" anywhere** — not on the site, not in the forms — while
  the question is open.
- Whether Skjemaker can take payment at all is unknown. If it cannot, a fee goes
  through UiB invoicing, which needs invoice address, organisation number and PO
  reference collected on the form. Add those when the model is known.
- With a fee, the presenting-author deadline becomes a *payment* deadline, and
  the committee must decide whether an accepted abstract is dropped from the
  programme when payment does not arrive.

## Open questions for UiB IT

One email covers all of them:

1. File upload: maximum size and permitted types for respondents?
2. Which MachForm version is Skjemaker running?
3. Can fields be pre-filled from URL query parameters?
4. Is the entry number available as a merge tag in the auto-responder?
5. Is payment collection available, or should a fee go through UiB invoicing?
6. Retention: how long are submissions kept, and who at UiB can access them?

The English-interface question is settled — it can be switched.

## Reconciliation

Export both forms to CSV, then:

1. Drop abstract rows superseded by a replacement (field 12 = Yes; match on
   field 13 plus the author's email).
2. Join registrations to abstracts on the abstract ID, splitting field 6 on
   commas.
3. Check both directions. **A presenting author with no registration** must be
   chased before the programme is fixed. **A registration quoting an unknown
   ID** is usually a typo, occasionally someone who was not accepted.
4. Match on email as a fallback where an ID is missing or wrong.

## Decision record

Settled:

| Decision | Outcome |
|---|---|
| Review step | Yes — committee reviews, acceptance notification sent |
| Form structure | Two separate forms |
| Abstract ID mechanism | Skjemaker entry number, issued in the acceptance email |
| Registration fee | Will be charged; model undecided; designed as free for now |
| Who builds the forms | Organiser, with their own UiB account |
| Multiple abstracts per person | Allowed; registration accepts several IDs |
| Co-author registration | Only the presenting author registers per abstract |
| Edit / withdraw after submission | Not offered; corrections via replacement, withdrawal by email |
| Notification recipient | Shared mailbox, `wwcp2027@uib.no` — never a personal address |
| Form interface language | English |
| Data protection | Confirmed by the organiser; treated as compliant here |
| Search engine indexing | Blocked until launch, via `SITE.indexable` in `src/config.js` |

Open:

| Decision | Blocking what |
|---|---|
| File formats, template enforcement, size limits | Building Form 1; permissive until settled |
| Timeline: registration opening, non-presenter deadline | Site copy |
| Fee model | Opening registration; **must be settled before December 2026** |
| Cap on presentations per person | Field 6 help text, site copy |
| Whether travel support or a prize exists | Field 11 of Form 1 |
| China reachability of `skjemaker.app.uib.no` | Being checked by the organiser |
| `wwcp2027@uib.no` alias predates the "Bergen 2027" name | Replace once a matching alias exists |
