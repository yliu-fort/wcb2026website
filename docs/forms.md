# Abstract submission, registration and withdrawal forms

Build spec for the three Skjemaker forms — abstract submission, registration,
and withdrawal — and the record of what was decided and why. Written to be
followed field-by-field while building the forms, so that the site copy, the
emails and the forms cannot drift apart.

**Status: Forms 1 and 2 are built** (13 August 2026), and their URLs are now in
`FORMS` in `src/config.js`:

| Form | URL |
|---|---|
| 1 — Abstract submission | `https://skjemaker.app.uib.no/view.php?id=21385291` |
| 2 — Registration | `https://skjemaker.app.uib.no/view.php?id=21386961` |

Form 3 is deferred by decision and withdrawal runs by email until then.
`robots.txt` is closed separately, via `SITE.indexable`.

The abstract receipt was rewritten on 17 August 2026 and **Skjemaker was edited to
match on the same day**, so this document and the live forms currently agree. What
was touched, since nothing in this repository can do it and the next person will
want the list: on Form 1, the auto-responder body and subject, field 13's label
and help text, and the confirmation text; on Form 2, field 6's label and help
text, the registration receipt body, and the description's mention of the
identifier. Anything changed here from now on has to be carried across by hand.

Both forms accept submissions from the moment someone has the link, and the
abstract window does not open until 30 August 2026. Neither URL is published
yet, so nothing is exposed. Until they open, each form carries a red **TEST
PERIOD** box above the description saying it is not open, that anything sent is
a test, will not be reviewed, and may be deleted — and the submission
confirmation page repeats it, so a test submission is not mistaken for a real
one. Skjemaker's description field accepts HTML including inline styles, which
is what the box is made of. **Remove both notices when the forms open**, or the
first real authors will be told their abstract does not count.

**Form 1's Submission Confirmation was only the TEST PERIOD notice** — no success
message underneath, unlike Form 2's — so deleting the notice at opening would
have left authors staring at a blank page, which reads as a failed submission and
is answered by submitting again. Found by test submission on 17 August 2026 and
fixed the same day: the confirmation now carries the notice *followed by*

> Thank you — your abstract has been received. A confirmation email carrying your
> abstract ID is on its way to the address you gave; if it does not arrive, check
> your spam folder before contacting abstract@wavecoupling2027.eu.

so at opening **delete only the notice sentence and leave the paragraph after
it.** Both forms now have the same shape here.

**The two fields handle line breaks differently, and they sit next to each other
in Form Properties.** Blank lines in *Description* become paragraphs; blank lines
in *Submission Confirmation* are collapsed, so its text renders as one run. That
is why the confirmation currently reads as a single block during the test period,
and why it comes out clean once the notice sentence goes. Whether that field
accepts HTML is untested — verifying it costs a test submission, and there is no
need while the remaining text is one paragraph.

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

Established while building Form 1, and the design depended on it:

- **An abstract ID can reach the author.** `{entry_no}` is a valid merge
  tag in the respondent auto-responder, alongside `{element_N}` for each field —
  the Merge Tags Lookup in Notification Settings lists it under "Entry
  Information". The received wisdom that MachForm only exposes the entry number
  to form owners is wrong for this version. This is what settles question 4
  below, and no fallback is needed.
- **Auto-responder From is `noreply@uib.no` and cannot be changed**, which
  confirms the self-hosted-install limitation. **Reply-To is customisable**, and
  is set as the Emails section describes.

## Design: one abstract ID, issued at submission

```
submit abstract  →  auto-responder carries the abstract ID:  B27-042
                        ↓
   correction?   →  resubmit, quoting B27-042 as the one it replaces
                        ↓
                 committee review
                        ↓
acceptance email  →  same abstract ID, now with a decision attached
                        ↓
   registration  →  author quotes B27-042 (deadline 12 Jan 2027)
```

One identifier for the whole lifecycle, issued the moment the abstract arrives.

The obvious reason is that an author needs to know the submission landed. The
receipt email alone already proves that, so on its own it would be a weak reason
to add a number. The stronger one is **replacement**: submissions cannot be
edited, so a correcting author resubmits, and without an abstract ID the form has
to ask which earlier submission is being replaced *by title* — fuzzy matching,
on the field most likely to have been edited in the correction. With an abstract
ID it is exact.

The earlier version of this design withheld the number until acceptance, on the
grounds that a number can read as "your abstract is in". That risk is real but it
is a wording problem, not a numbering one: the receipt says *received*, the
acceptance email says *accepted*, and both quote the same abstract ID. Renumbering
at acceptance would only mean two identifiers for one abstract and a mapping
table to keep.

**The abstract ID should be the Skjemaker entry number, prefixed** — unique,
stable, already in the CSV export, nothing assigned by hand.

### This was the blocking question, and it is settled

The design above needed the entry number to reach the author, which meant
merging it into the auto-responder. It does: `{entry_no}` is a documented merge
tag in Skjemaker's Notification Settings, and Form 1's receipt is built on it.
The three fallbacks this section used to carry — entry number on the
confirmation page, an ID minted by this site and passed through a hidden
field, and keeping the number until acceptance — are all unnecessary, and so is
the webhook-to-this-server variant that was never recommended anyway.

If URL pre-fill (question 3) works, put a registration link with the abstract ID
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
abstract ID is what makes field 13 exact rather than a title match —
see the design section.

**Withdrawal is by email to `abstract@wavecoupling2027.eu` for now.** A
self-service form is designed (Form 3) but deliberately not built yet — see that
section.

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
| 13 | Abstract ID of the submission it replaces | Text | conditional | Shown only when 12 = Yes, via Skjemaker's Logic Builder. Help text: from the receipt email of the abstract being replaced, e.g. `B27-042`, or the exact title if the author no longer has the ID |
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

As built: accepted types `pdf, docx, doc`, one file per submission, and no
size cap set on the field, so the server default applies — question 1 to UiB IT
is what says whether that default is generous enough to leave alone.

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
| 6 | Abstract ID(s) | Text | conditional | Shown only when 5 = Yes. Comma-separated; help text says "from your abstract receipt or acceptance email, e.g. B27-042" |
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

**Not being built in the first round.** Withdrawal goes to
`abstract@wavecoupling2027.eu` until the design is settled. Kept here because
the reasoning below applies to the email path too, and because deferring a form
is cheap while retro-fitting the confirmation step onto a live one is not.

Two things to settle before building it: the withdrawal deadline (below), and
whether requests from authors who have already paid belong in the form at all.

A withdrawal request, not an instruction the system carries out. Small, and the
confirmation step is the part that matters.

| # | Field | Type | Required | Notes |
|---|---|---|---|---|
| 1 | Your email | Email | ✓ | For the acknowledgement. **Not** used to authorise the withdrawal |
| 2 | Abstract ID | Text | ✓ | From the receipt, e.g. `B27-042` |
| 3 | Abstract title | Text | ✓ | Cross-check against the ID; catches a mistyped one |
| 4 | Have you already registered **and paid**? | Radio | ✓ | Yes / No |
| 5 | Reason (optional) | Paragraph | | Useful for the committee, never required |

When field 4 is **Yes**, show text directing the author to email
`registration@wavecoupling2027.eu` instead — a refund is a registration matter,
not an abstract one — because it has to be arranged by hand and a form cannot
do it. (Accepting the submission anyway and flagging it "refund required" in the
committee notification would capture the request with less friction and the same
audit trail — worth reconsidering if withdrawals after payment turn out to be
common.)

**Why this is a request and not an action.** An abstract ID plus a title is not
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

### Who sends what

| Message | Sent by | When |
|---|---|---|
| Abstract receipt | **Skjemaker**, automatically | On submission of Form 1 |
| Registration receipt | **Skjemaker**, automatically | On submission of Form 2 |
| Acceptance / rejection | **Committee**, by hand | December 2026, mail-merged from the CSV export |
| Withdrawal acknowledgement | Committee, by hand | On a withdrawal request (Skjemaker would do it if Form 3 is ever built) |
| Withdrawal confirmation | **Committee**, by hand | Always manual — it is the authentication step |

Only the two receipts are automatic, and both are sent by UiB's server, not by
this site and not by anyone on the committee. That is also why the abstract ID has
to come from Skjemaker: nothing else is in the loop at the moment the receipt
goes out.

### From and Reply-To

MachForm's documentation says a **self-hosted install must send from its own
domain** — customisable From addresses are a cloud-plan feature. That holds for
Skjemaker: **From is `noreply@uib.no` and the field is locked.** It is an
address no author recognises, so the three mitigations below are all load-bearing
rather than nice-to-have. As built:

- **Reply-To is per form**, because the replies differ: Form 1's receipt
  answers to `abstract@wavecoupling2027.eu`, Form 2's to
  `registration@wavecoupling2027.eu`. Reply-To is customisable independently of
  From, and authors do reply to receipts.
- **The workshop is named in the From display name and the subject**, so the
  message is recognisable even when the address is not — From "Bergen 2027 —
  Waves and Wave-Coupled Processes", subjects "Abstract received — your
  abstract ID is B27-{entry_no} (Bergen 2027)" and "Registration received —
  Bergen 2027 [#{entry_no}]".
- Put `noreply@uib.no` in the site's submission instructions, so authors know
  what to whitelist. A receipt in a spam folder is the failure this whole design
  is trying to avoid.

**The addresses changed on 25 August 2026.** `wwcp2027@uib.no` was written
into the site and both forms but never actually created, so every use of it was a
bounce. It is replaced by three mailboxes on the conference's own domain, routed
by purpose:

| Address | Used for |
|---|---|
| `abstract@wavecoupling2027.eu` | Form 1 Reply-To and notifications; replacements and withdrawals |
| `registration@wavecoupling2027.eu` | Form 2 Reply-To and notifications; fees, refunds, visa letters |
| `information@wavecoupling2027.eu` | Everything else; the address in the site header and footer |

They are the same three in `EMAILS` in `src/config.js`. Nothing keeps the two in
sync — change one, change the other.

**All three currently forward a copy to `wwcp2027@gmail.com`,** which was the
throwaway debugging inbox. That is fine while the forms carry only test
submissions and it is what makes the wiring checkable. It must be switched off
before 30 August 2026, when abstract submission opens: notifications carry
`{entry_data}`, the whole submission, so every real abstract arriving while the
forward is live copies author names, addresses and affiliations onto Google's
servers. Avoiding exactly that is why the notification inbox was never supposed
to stay on Gmail.

Deliverability itself is not a worry: mail from UiB's own server carries UiB's
SPF and DKIM, which is a good deal better than anything sent from this VM.

**Abstract receipt (auto-responder, Form 1).** Carries the abstract ID, and
echoes the four fields an author is most likely to have got wrong, so a mistake
is visible while a replacement submission can still fix it.

> Thank you for your abstract for the 8th Workshop on Waves and Wave-Coupled
> Processes, Bergen, 12–15 April 2027. We hereby confirm the receipt of the
> following abstract:
>
> **Abstract ID: `{abstract_id}`**
> Title: `{title}`
> Presenting author: `{presenting_author}`
> Selected Presentation type: `{presentation_type}`
> File: `{filename}`
>
> The committee will notify the acceptance of abstracts in December 2026. In order
> to be considered in the final program for presentation, the abstract is required
> to be registered and presented by at least 1 author. The abstracts that fail to
> be registered by the registration deadline will be removed from the program.
>
> For a re-submission of an abstract, follow the website instructions to submit an
> abstract again, and answer "Yes" to the replacement question with the assigned
> abstract ID.
>
> All are welcome to register for the workshop, if interested, after it is open
> for registration later this year.

**This is the committee's wording, edited for grammar only** (17 August 2026).
Four fixes were applied to the text as supplied and nothing else: `of abstract` →
`of abstracts`, `abstracts who fail` → `abstracts that fail`, `website
instruction` → `instructions`, and an `and` to join the two imperatives in the
re-submission sentence. Left as written by decision, so do not "tidy" them:
`notify the acceptance` (rather than *notify authors of*), the American `program`
against this repository's `programme`, and the numeral in `1 author`.

**The five merge tags, as built.** `{abstract_id}` is `B27-{entry_no}`; the other
four are `{element_1}` (presenting author), `{element_5}` (title), `{element_8}`
(presentation format) and `{element_9}` (file). Read off Merge Tags Lookup in the
form's Notification Settings, where they are confirmed against the field names —
`N` is Skjemaker's internal element id and only coincides with this table's field
numbers because Form 1's fields were created in order. **Check the Lookup again
rather than counting rows** if a field is ever inserted or deleted. The author
and format tags are new; the first version of this receipt echoed only title and
file.

**"Selected Presentation type" is the committee's phrasing**, kept over a
suggestion to say "requested" instead. The reason for the suggestion, in case the
question returns: the committee assigns formats in December and the site says so,
so "selected" can read as though the receipt has already granted an oral slot.
Field 8's third option is *Either*, which prints as written.

**Two things the receipt no longer states, both by decision.** It does not name
the registration deadline — authors who want the date go to the site — even though
receipts go out from August, months before registration opens. And it does not say
that arriving is not being accepted; see the note below the merge tags.

**The closing paragraph commits the workshop to opening registration in 2026.**
"Later this year", in a message sent throughout the abstract window. There is
still no decided registration-opening date (see the timeline gaps below) and the
fee has to be settled first, so if registration slips into January every receipt
already sent will have said something untrue. The repair is one phrase in this
text, but only if someone notices in time.

**Two sentences were deliberately dropped** (committee decision, 17 August 2026):
the withdrawal address, and an explicit "arriving is not being accepted" line.
Both had been argued for here, so record where their content survives — the
withdrawal address is in Form 1's *description*, which an author reads before
submitting but does not keep, and "received" now rests on the opening sentence
rather than being spelled out at the end. If authors start mailing committee
members at random to withdraw, the address in the receipt is the first thing to
put back.

**Acceptance (manual, December 2026).** Where the ID is issued.

> Your abstract **B27-042** has been accepted for **oral / poster**
> presentation.
>
> Please quote the same abstract ID when you register — it has not changed.
>
> Presenting authors must register by **12 January 2027**: `<registration link>`

**Registration receipt (auto-responder, Form 2).** Echo the category and any
abstract IDs, so a mistyped one is visible to the author while it can
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
| Dec 2026 | Notification of acceptance — the ID is reused, not reissued |
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
4. ~~Is the entry number available as a merge tag in the auto-responder?~~
   **Answered by building it: yes, `{entry_no}`.** No longer needs asking.
5. Is payment collection available, or should a fee go through UiB invoicing?
6. Retention: how long are submissions kept, and who at UiB can access them?
7. ~~What From address do auto-responders use, and can Reply-To be set?~~
   **Answered by building it: From is `noreply@uib.no` and is locked; Reply-To
   is customisable and is set.** The mailbox half of this is settled too: the
   three `@wavecoupling2027.eu` addresses exist, so nothing here bounces any
   more.

The English-interface question is settled — it can be switched.

## Reconciliation

Export both forms to CSV, then:

1. Drop abstract rows superseded by a replacement — field 12 = Yes, and field 13
   names the abstract ID being replaced. Exact, provided the ID design was
   built; if it fell back to title matching, check the author's email too and
   expect to resolve some by hand.
2. Drop withdrawn abstracts — **only those whose withdrawal was confirmed by
   reply**, not every request received. An unconfirmed request is not a
   withdrawal.
3. Join registrations to abstracts on the abstract ID, splitting Form 2 field 6 on
   commas.
4. Check both directions. **A presenting author with no registration** must be
   chased before the programme is fixed. **A registration quoting an unknown
   abstract ID** is usually a typo, occasionally someone who was not accepted.
5. Match on email as a fallback where an ID is missing or wrong.

## Decision record

Settled:

| Decision | Outcome |
|---|---|
| Review step | Yes — committee reviews, acceptance notification sent |
| Form structure | Two separate forms |
| Abstract ID | One ID for the whole lifecycle, issued in the submission receipt and reused in the acceptance email. Skjemaker entry number, prefixed: `B27-{entry_no}` — **built and working** |
| Registration fee | Will be charged; model undecided; designed as free for now |
| Who builds the forms | Organiser, with their own UiB account |
| Multiple abstracts per person | Allowed; registration accepts several IDs |
| Co-author registration | Only the presenting author registers per abstract |
| Edit after submission | Not offered; corrections via a replacement submission |
| Withdraw after submission | By email to the shared mailbox for now. Self-service (Form 3) is designed but deferred until the rules are settled. Either way, confirmation goes to the address on the original submission |
| Notification recipient | Shared mailbox on the conference domain, never a personal address: `abstract@wavecoupling2027.eu` for Form 1, `registration@wavecoupling2027.eu` for Form 2 |
| Form interface language | English |
| Data protection | Confirmed by the organiser; treated as compliant here |
| Search engine indexing | Blocked until launch, via `SITE.indexable` in `src/config.js` |

Open:

| Decision | Blocking what |
|---|---|
| File formats, template enforcement, size limits | Built permissively (`pdf, docx, doc`, one file, no cap); tighten once UiB IT answers q1 |
| Timeline: registration opening, non-presenter deadline | Site copy |
| Fee model | Opening registration; **must be settled before December 2026** |
| Cap on presentations per person | Field 6 help text, site copy |
| Withdrawal deadline, and whether self-service stops once the programme is published | Building Form 3 |
| Whether post-payment withdrawals belong in Form 3 or stay on email | Building Form 3 |
| Whether travel support or a prize exists | Field 11 of Form 1 — built, delete it if neither exists |
| Whether a conference dinner is held | Field 10 of Form 2 — built, delete it if there is none |
| China reachability of `skjemaker.app.uib.no` | Being checked by the organiser |
| The `wwcp2027@gmail.com` forward on all three mailboxes | Opening submissions. Harmless for test traffic, but it copies every real submission to Google once the abstract window opens on 30 Aug 2026 — turn it off first |
