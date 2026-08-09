# Abstract submission, registration and withdrawal forms

Build spec for the three Skjemaker forms — abstract submission, registration,
and withdrawal — and the record of what was decided and why. Written to be
followed field-by-field while building the forms, so that the site copy, the
emails and the forms cannot drift apart.

**Status: none of them built yet.** `FORMS` in `src/config.js` still holds
placeholders, which is what keeps CI red. Forms 1 and 2 are the first round;
Form 3 is deferred by decision and withdrawal runs by email until then.
`robots.txt` is closed separately, via `SITE.indexable`.

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

Not established, and the design now depends on it:

- **Whether a submission reference can reach the author.** MachForm keeps an
  entry number, but only form owners see it, in the Entries table. Its merge
  tags are documented as field-based, there is no "unique ID" field type, and
  recurring requests on MachForm's own forums suggest exposing the entry number
  is not built in. Question 4 to UiB IT settles it; see the design section for
  what to do with either answer.

## Design: one reference, issued at submission

```
submit abstract  →  auto-responder carries the reference:  B27-042
                        ↓
   correction?   →  resubmit, quoting B27-042 as the one it replaces
                        ↓
                 committee review
                        ↓
acceptance email  →  same reference, now with a decision attached
                        ↓
   registration  →  author quotes B27-042 (deadline 12 Jan 2027)
```

One identifier for the whole lifecycle, issued the moment the abstract arrives.

The obvious reason is that an author needs to know the submission landed. The
receipt email alone already proves that, so on its own it would be a weak reason
to add a number. The stronger one is **replacement**: submissions cannot be
edited, so a correcting author resubmits, and without a reference the form has
to ask which earlier submission is being replaced *by title* — fuzzy matching,
on the field most likely to have been edited in the correction. With a reference
it is exact.

The earlier version of this design withheld the number until acceptance, on the
grounds that a number can read as "your abstract is in". That risk is real but it
is a wording problem, not a numbering one: the receipt says *received*, the
acceptance email says *accepted*, and both quote the same reference. Renumbering
at acceptance would only mean two identifiers for one abstract and a mapping
table to keep.

**The reference should be the Skjemaker entry number, prefixed** — unique,
stable, already in the CSV export, nothing assigned by hand.

### This depends on an unanswered question, and it is now blocking

MachForm exposes the entry number to *form owners* in the Entries table. What is
not established is whether it can be **merged into the auto-responder** — its
merge tags are documented as field-based, and there is no "unique ID" field
type. So the design above cannot be built until UiB IT answers question 4 below.
Ask that before building Form 1, not after.

Fallbacks, best first, if the answer is no:

1. **Custom confirmation page.** MachForm shows a page after submission; if the
   entry number can appear there, the author sees it immediately and the receipt
   email carries title and filename as before. Screen-only, so weaker than
   email, but no moving parts. Worth asking in the same message.
2. **A reference minted by this site.** The abstract page links to the form with
   `?ref=B27-XXXXXX`; a hidden field on the form captures it, and the
   auto-responder echoes it like any other field. Depends on URL pre-fill
   (question 3). **Caveat that rules it out unless handled:** an author who
   reaches the form from a bookmark or a link a colleague forwarded arrives with
   no token, or worse, with someone else's — so the reference stops being
   unique exactly when people start sharing the link, which they will.
3. **Keep the number at acceptance only**, i.e. the previous design, and accept
   title-matching for replacements.

A webhook from Skjemaker to a script on this server could mint and mail
references, but it would put abstract data through infrastructure outside UiB,
needs its own mail deliverability and secret handling, and is far more machinery
than a workshop needs. Not recommended unless 1–3 all fail and the committee
still wants it.

If URL pre-fill (question 3) works, put a registration link with the reference
already filled into the acceptance email, and transcription errors disappear.

## Consequence of "multiple abstracts allowed" + "no editing"

These two decisions interact, and the interaction needs an explicit field or it
becomes an unresolvable mess at reconciliation time.

With no self-service editing, an author who spots a mistake will submit again.
With multiple abstracts permitted, **a second submission from the same person is
indistinguishable from a correction to the first one.** Sorting that out by hand
across a hundred submissions is exactly the kind of work that produces a wrong
programme.

So the abstract form carries a replacement question (fields 12–13 below), the
auto-responder tells authors to use it, and the site says the same. The
submission reference is what makes field 13 exact rather than a title match —
see the design section.

**Withdrawal is by email to `wwcp2027@uib.no` for now.** A self-service form is
designed (Form 3) but deliberately not built yet — see that section.

The interim path inherits one rule from that design, and it is the rule that is
easiest to get wrong over email: **confirm to the address on the original
submission, not to whoever sent the withdrawal request.** Replying to the sender
is the natural thing to do with mail, and it is precisely what lets someone
withdraw an abstract that is not theirs. A conference programme is public;
titles and author addresses are not secrets.

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
| 13 | Reference of the submission it replaces | Text | conditional | Shown only when 12 = Yes. From the earlier receipt, e.g. `B27-042`. Falls back to the title if the reference design cannot be built |
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
| 6 | Abstract reference(s) | Text | conditional | Shown only when 5 = Yes. Comma-separated; help text says "from your abstract receipt or acceptance email, e.g. B27-042" |
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

**Field 6 cannot be validated.** Forms 1 and 2 are separate with no integration
between them, so the ID is free text and is checked during reconciliation.

**Non-presenting attendees must be able to complete this form**, which is what
the conditional on field 5 is for. Only the presenting author of an abstract is
required to register in connection with it — so **co-authors who plan to attend
register here as ordinary attendees.** Say so on the site, or badge and catering
counts will be short.

## Form 3 — Withdrawal (deferred, do not build yet)

**Not being built in the first round.** Withdrawal goes to `wwcp2027@uib.no`
until the design is settled. Kept here because the reasoning below applies to
the email path too, and because deferring a form is cheap while retro-fitting
the confirmation step onto a live one is not.

Two things to settle before building it: the withdrawal deadline (below), and
whether requests from authors who have already paid belong in the form at all.

A withdrawal request, not an instruction the system carries out. Small, and the
confirmation step is the part that matters.

| # | Field | Type | Required | Notes |
|---|---|---|---|---|
| 1 | Your email | Email | ✓ | For the acknowledgement. **Not** used to authorise the withdrawal |
| 2 | Submission reference | Text | ✓ | From the receipt, e.g. `B27-042` |
| 3 | Abstract title | Text | ✓ | Cross-check against the reference; catches a mistyped one |
| 4 | Have you already registered **and paid**? | Radio | ✓ | Yes / No |
| 5 | Reason (optional) | Paragraph | | Useful for the committee, never required |

When field 4 is **Yes**, show text directing the author to email
`wwcp2027@uib.no` instead: a refund has to be arranged by hand and a form cannot
do it. (Accepting the submission anyway and flagging it "refund required" in the
committee notification would capture the request with less friction and the same
audit trail — worth reconsidering if withdrawals after payment turn out to be
common.)

**Why this is a request and not an action.** A reference plus a title is not
authentication — both appear in the receipt, which gets forwarded, and a
programme is public. Acting on the form directly would let
anyone withdraw someone else's abstract. So the committee confirms by email to
the address captured on the *original submission*, and the abstract stays in the
programme until that reply arrives. Field 1 exists only so the requester gets an
acknowledgement; it carries no authority. Getting this backwards — confirming to
the address typed into the withdrawal form — reintroduces the whole problem.

**A withdrawal deadline is still undecided.** Once the programme is published, a
withdrawal is a scheduling change rather than a database edit, and it probably
should stop being self-service at that point.

## Emails

**Abstract receipt (auto-responder, Form 1).** Carries the reference, and says
plainly that a reference is not a decision.

> Thank you — we have received your abstract for the 8th Workshop on Waves and
> Wave-Coupled Processes, Bergen, 12–15 April 2027.
>
> **Your submission reference: `{reference}`** — quote it in any correspondence
> about this abstract, and when you register.
>
> Title: `{title}`
> File: `{filename}`
>
> The committee will notify all authors of its decision in December 2026. You do
> not need to do anything until then, and you do not need to register yet.
>
> This submission cannot be edited. If you need to correct it, submit the form
> again, answer "Yes" to the replacement question, and give this reference. To
> withdraw it, email wwcp2027@uib.no.
>
> Receiving this reference means your abstract arrived. It does not mean it has
> been accepted — the committee decides in December 2026.

Keep the withdrawal instruction in the receipt rather than only on the site. It
is the one message the author is certain to still have, and an author hunting
for how to withdraw is an author about to email someone at random. Swap the
address for a link if Form 3 is ever built.

**Acceptance (manual, December 2026).** Where the ID is issued.

> Your abstract **B27-042** has been accepted for **oral / poster**
> presentation.
>
> Please quote the same reference when you register — it has not changed.
>
> Presenting authors must register by **12 January 2027**: `<registration link>`

**Registration receipt (auto-responder, Form 2).** Echo the category and any
abstract references, so a mistyped one is visible to the author while it can
still be fixed.

**Withdrawal acknowledgement** — for Form 3 when it exists; until then the
committee sends the equivalent by hand. Either way it must say that the request
is *not yet* effective:

> We have received a request to withdraw `{title}`. To confirm it is genuinely
> from you, we will email the address on the original submission. The abstract
> stays in the programme until you reply to that message.

**Withdrawal confirmation (manual).** Sent by the committee **to the email
address on the original abstract submission** — never to the address typed into
the withdrawal form. See the note under Form 3.

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
4. **Is the entry number available as a merge tag in the auto-responder, or
   displayable on the confirmation page?** This one blocks Form 1 — see the
   design section.
5. Is payment collection available, or should a fee go through UiB invoicing?
6. Retention: how long are submissions kept, and who at UiB can access them?

The English-interface question is settled — it can be switched.

## Reconciliation

Export both forms to CSV, then:

1. Drop abstract rows superseded by a replacement — field 12 = Yes, and field 13
   names the reference being replaced. Exact, provided the reference design was
   built; if it fell back to title matching, check the author's email too and
   expect to resolve some by hand.
2. Drop withdrawn abstracts — **only those whose withdrawal was confirmed by
   reply**, not every request received. An unconfirmed request is not a
   withdrawal.
3. Join registrations to abstracts on the reference, splitting Form 2 field 6 on
   commas.
4. Check both directions. **A presenting author with no registration** must be
   chased before the programme is fixed. **A registration quoting an unknown
   reference** is usually a typo, occasionally someone who was not accepted.
5. Match on email as a fallback where a reference is missing or wrong.

## Decision record

Settled:

| Decision | Outcome |
|---|---|
| Review step | Yes — committee reviews, acceptance notification sent |
| Form structure | Two separate forms |
| Abstract reference | One reference for the whole lifecycle, issued in the submission receipt and reused in the acceptance email. Skjemaker entry number, prefixed — **conditional on UiB IT question 4** |
| Registration fee | Will be charged; model undecided; designed as free for now |
| Who builds the forms | Organiser, with their own UiB account |
| Multiple abstracts per person | Allowed; registration accepts several IDs |
| Co-author registration | Only the presenting author registers per abstract |
| Edit after submission | Not offered; corrections via a replacement submission |
| Withdraw after submission | By email to the shared mailbox for now. Self-service (Form 3) is designed but deferred until the rules are settled. Either way, confirmation goes to the address on the original submission |
| Notification recipient | Shared mailbox, `wwcp2027@uib.no` — never a personal address |
| Form interface language | English |
| Data protection | Confirmed by the organiser; treated as compliant here |
| Search engine indexing | Blocked until launch, via `SITE.indexable` in `src/config.js` |

Open:

| Decision | Blocking what |
|---|---|
| Whether the entry number can reach the author (UiB IT q4) | Building Form 1 — the reference design falls back if not |
| File formats, template enforcement, size limits | Building Form 1; permissive until settled |
| Timeline: registration opening, non-presenter deadline | Site copy |
| Fee model | Opening registration; **must be settled before December 2026** |
| Cap on presentations per person | Field 6 help text, site copy |
| Withdrawal deadline, and whether self-service stops once the programme is published | Building Form 3 |
| Whether post-payment withdrawals belong in Form 3 or stay on email | Building Form 3 |
| Whether travel support or a prize exists | Field 11 of Form 1 |
| China reachability of `skjemaker.app.uib.no` | Being checked by the organiser |
| `wwcp2027@uib.no` alias predates the "Bergen 2027" name | Replace once a matching alias exists |
