# Design check — Doctor Invitation list (ADM-003, p.113c)

Sources compared: spec PDF p.113b / p.113c / p.113e, the Claude Design **wireframe** and **Hi-Fi**
("Doctor Invitation CRUD", Design System v1.11 test), and the code (Homework 1 on `feature/hw1-invitation-list`, Homework 2 on `feature/hw2-invitation-crud`).
The wireframe and Hi-Fi files are the same design (the wireframe re-maps colours to grey and shows the notes),
so they are checked together.

**Status legend** — **Decided by Hi-Fi**: the spec is silent or conflicting and we followed the Hi-Fi ·
**Our addition**: not in the spec or Hi-Fi, added by us · **Question**: needs an answer from the designer or reviewer.

## Spec ↔ Hi-Fi ↔ build

| # | Area | Spec / Hi-Fi says | What was built | Status |
|---|---|---|---|---|
| 1 | Sidebar width | Hi-Fi 240px (216px at 1024 since the 9 Oct design review; was 200px). Spec admin shell 176px | 240px ≥1440, 216px 1024–1439 (`$layout-sidebar-w`, `-md`), every label on one line | Decided by Hi-Fi |
| 2 | Rows per page | Hi-Fi 8 per page (18 → 3 pages). Other spec admin lists use 20 | `INVITATION_PAGE_SIZE = 8` | Question for designer |
| 3 | Status filter | In the Hi-Fi search bar; **not** in spec p.113c (search only) | Status dropdown next to search, applied on Search | Decided by Hi-Fi |
| 4 | "No invitations yet" | Hi-Fi shows only no-results (filters) and error | Separate empty state when there is no data at all | Our addition |
| 5 | Contact search | Spec: search by name or contact. Contact shown masked `010-****-####` | HW2: the **API** matches only the visible digits (stored `mobile_search_digits` = first 3 + last 4), and the list API sends the number already masked | Our addition · Question for reviewer |
| 6 | Expiry after re-issue | Validity period TBC (S12 ▸ INVITATION). Spec conflicts on whether re-issue resets expiry. Hi-Fi 2d keeps Issued/Expiry unchanged | HW2: API setting `hmp.invitation.validity=P14D`; re-issue and edit set Issued = now, Expiry = now + 14 days; a job marks overdue Pending invitations Expired every minute | Question for designer |
| 7 | Focus after Revoke | Hi-Fi: focus returns to the Revoke button that opened the dialog | After Revoke the row is Revoked and its Revoke button is gone, so focus cannot return to it (falls to the page) | Known limitation · Question |
| 8 | Updated row in a filtered list | Not specified | A re-issued/revoked row stays in the current filtered list (e.g. "Pending") until the next Search, so the admin sees what changed | Our addition (intentional) |
| 9 | Action failure | Hi-Fi has no failure frame for Re-issue/Revoke | Error message (the API's own text) inside the dialog, dialog stays open to retry. HW2: testable by stopping the API (TC-87) | Our addition |
| 10 | Date format | Spec uses three formats: `26/09/08`, `2026 09 08`, `2026.07.12` | HW2 (reviewer feedback): WM English format — `YYYY-MM-DD` in tables and cards, after the design review was announced: `YYYY-MM-DD` on every screen, as in the Hi-Fi detail; history `2026-09-08 08:33 PM` | Fixed |
| 11 | Mobile masking | Spec masking examples are inconsistent | `010-****-5678` everywhere (masked by the API), missing → `-` | Decided by Hi-Fi |
| 12 | Body text size | p.112 uses 13px; elsewhere and Hi-Fi minimum 14px | `$font-size-body: 14px`, nothing smaller in the list (the old 12px dialog tag was fixed to 14px) | Decided by Hi-Fi |
| 13 | Linked screens | Issue invitation (p.113b), Detail (p.113e), Edit (training extension) | HW2: all three screens built | Closed |
| 14 | Component library | PrimeReact is the company stack | Custom components built from the Hi-Fi design system; `primereact` / `primeicons` installed but unused | Question for reviewer |

## Other differences found while checking the code against the Hi-Fi

| # | Area | Spec / Hi-Fi says | What was built | Status |
|---|---|---|---|---|
| 15 | Drawer breakpoint | Hi-Fi notes say "≤768: sidebar becomes a Menu drawer"; frames show 1024 with sidebar and 768 with Menu | Drawer below **1024** (the 769–1023 range is not drawn in the Hi-Fi) | Decided by us · Question |
| 16 | Scroll hint | Hi-Fi 768 frame: "Scroll the table sideways for Manage →"; Hi-Fi 1024 frame: all columns fit, Manage buttons stacked | Rows never wrap (Hi-Fi), except a long doctor name, which wraps at `$table-name-max-w` (Hi-Fi 3b / 3k). 1024–1439: tighter cell padding and stacked Manage buttons, so every column fits (Hi-Fi 3b). Below 1024 the table scrolls inside its card and the hint shows (Hi-Fi 3c). Measured on 7 Oct: fits at 1024–1920, scrolls at 991 and 768 | Fixed (matches Hi-Fi) |
| 17 | Mobile range text | Hi-Fi 375 frames show "1–4 of 18" (they only draw 4 cards) | "1–8 of 18" because the page size is 8 | Decided by Hi-Fi (page size) |
| 18 | Detail action | Hi-Fi **table**: Detail only for Used. Hi-Fi **card**: View detail also for Expired and Revoked | Built exactly as each Hi-Fi component: table and card differ | Question for designer (Hi-Fi is inconsistent) |
| 19 | Card heading level | Hi-Fi card uses `<h3>` | `<h2>`: the correct level directly under the page `<h1>` | Our decision (a11y) |
| 20 | Table markup | Hi-Fi uses `div` grid with ARIA table roles | Native `<table>` with caption, `scope="col"`, row headers; scrolls inside its card | Our decision (a11y) |
| 21 | Mobile error copy | Hi-Fi 3e: "Something went wrong on our side. Your search is kept." | Same text as desktop ("… — try again in a moment.") on every width | Our decision (one component) |
| 22 | Loading announcement | Hi-Fi: visually hidden "Loading invitations" inside the table | Visible "Loading invitations…" in the live summary row + `aria-busy` on table and card list | Decided by Hi-Fi 2a (visible text) |
| 23 | Pagination disabled | Hi-Fi uses `aria-disabled` on Previous | Native `disabled` (not focusable, not clickable), shown with the same 60% opacity as every disabled button (design review 9 Oct) | Our decision |
| 24 | Danger colours | Hi-Fi mixed them with `color-mix()` from a second red `#EF4444` | One red: `#942626` (`$red-700`, Hi-Fi `--error`) with tints `$red-50` / `$red-300`; `#EF4444` and the purple scale removed from both (design review 9 Oct) | Fixed |
| 25 | Busy / disabled button | Hi-Fi busy opacity was 0.7, Previous was grey text | One look: `$opacity-disabled` / `--opacity-disabled` 0.6 on every disabled or busy control, in build and Hi-Fi; spinner icon + "Revoking…" label | Fixed (design review 9 Oct) |
| 26 | Data shape | Hi-Fi: `doctorName: string`, plus `updatedAt` and `history[]` | HW2: `InvitationDetail` has `createdAt`, `updatedAt` and `history[]` (action, actor, time) | Closed |
| 27 | Account menu | Hi-Fi: account button with `aria-haspopup="menu"` | Same button, but there is no menu yet | Known limitation |
| 28 | Other sidebar links | Patient management, Doctor list, Consultation status, Settings | Links render and mark the current page, but those routes 404. HW2: their prefetch is off, so they no longer log console errors | Out of scope |
| 29 | Breadcrumb | "Doctor management › Invitations" as plain text | List: same. Create / detail / edit: "Invitations" is a link back to the list | Decided by Hi-Fi · Our addition |
| 30 | Toast timing | Hi-Fi: auto-dismiss ≥ 6s, pauses on hover/focus | 6s (`TOAST_DURATION_MS`), pauses while hovered or focused; Dismiss button 36px | Decided by Hi-Fi |

## Homework 2 — create, detail, edit and the API

| # | Area | Spec / wireframe says | What was built | Status |
|---|---|---|---|---|
| 31 | Delete | Training asks for delete; spec p.113c says Revoke = delete, no hard delete, row stays as history (wireframe W-01g) | `DELETE /api/v1/admin/doctor-invitations/{id}` revokes; the row stays as Revoked with a history line | Decided by spec |
| 32 | Issue form fields | p.113b: Doctor's name, Email, Mobile number; required = TBC (proposal: all three) | All three required; limits name 2–50, email ≤100, Korean mobile with or without hyphens (normalised by the API) | Our decision · Question |
| 33 | Already invited / registered | W-02d / W-02e: block a second invitation | 409 `INVITATION_ALREADY_PENDING` / `DOCTOR_ALREADY_REGISTERED`, shown under Email | Decided by spec |
| 34 | Detail actions | p.113e: "Back to the list" is the only action (FINAL) | Same. Re-issue / Revoke / Edit stay on the list | Decided by spec |
| 35 | Detail fields | p.113e: invited person, contact (masked), status, issued, expiry, re-issues, history | Same; email not shown (not in p.113e) | Decided by spec |
| 36 | History actor | W-03: "issued — admin Kim Unyeong"; expiry is a system event | No login in the homework: every admin action is recorded as `admin@hmp.co.kr`; expiry and sign-up as "System" | Our decision |
| 37 | Edit | Training extension. Wireframe prompt W-04 said "save and re-issue"; the **Hi-Fi 1d** says "Saving updates the recipient details… It does not send a new link — use Re-issue" | Built as the Hi-Fi (changed 7 Oct): "Save changes" updates name / email / mobile only — no new link, re-issue count and dates unchanged, history "Details updated"; Save disabled until something changes; browser warns before closing with unsaved changes | Decided by Hi-Fi |
| 38 | Unsaved changes dialog | W-04: dialog when leaving | Only the browser's own prompt on close / reload; in-app links (Cancel, sidebar) leave without asking | Known limitation |
| 39 | List sort order | Not specified | Newest invitation first (first issue date), so a re-issued row does not jump to the top | Question for designer |
| 40 | Search in the URL | Not specified | `?q=&status=&page=` so Back from the detail and reload keep the search | Our addition |
| 41 | "Used" status | Set when the doctor signs up (doctor app) | No sign-up flow in this homework: Used rows exist only in the demo data | Out of scope |

## Design review alignment (7 Oct) — Hi-Fi frames vs build
Every HW2 screen was compared with its Hi-Fi frame and changed to match: back link above the breadcrumb, breadcrumb
`Doctor management › <page>`, titles ("Issue Doctor Invitation"), subtitles, "Required" labels, placeholders and hints,
the "Validity period to be confirmed" box, full-width Issue button, "N fields need attention" and "could not be issued"
banners, the Edit summary box and "Save changes", the detail "Read-only" notice, 3-column facts with the status chip,
the history timeline ("Oldest first"), loading / error frames 2m / 2n, toasts 2f / 2l. Side-by-side images:
[docs/design/compare](design/compare). Remaining deliberate differences:

| # | Area | Hi-Fi | Build | Why |
|---|---|---|---|---|
| 42 | List dates | Was `26/09/08`; Hi-Fi now `2026-09-08` everywhere (9 Oct) | `2026-09-08` | Fixed in the Hi-Fi |
| 43 | History time | Was `2026-08-26 10:12`; Hi-Fi now `2026-08-26 10:12 AM` (9 Oct) | `2026-08-26 10:12 AM` | Fixed in the Hi-Fi |
| 44 | History actor | "Admin Kim Un-yeong" | `admin@hmp.co.kr` / "System" | No login in the homework; the API records the admin account |
| 45 | Sample data | September dates, other names | Dates relative to today | Demo data must stay valid (14-day expiry) |
| 46 | 768 px create / detail / edit | Not drawn | Same layout as 1440, one column | Only the list has a 768 frame (declared) |

## Design review fixes (Bhagyashree, 9 Oct)
Result: Pass, on condition that item 1 is fixed and the frames re-exported. All items below are done. The Hi-Fi and
wireframe served from the demo ([hifi.html](https://hmp-admin-web.vercel.app/design/hifi.html),
[wireframe.html](https://hmp-admin-web.vercel.app/design/wireframe.html)) carry the fixes, and every frame was
re-exported from them: [docs/design/frames](design/frames) (33 Hi-Fi + 33 wireframe; 2p and 3k are new).
How: `scripts/design/` unpacks the Claude Design bundle, applies the fixes (`apply-review-fixes.py`, each edit
checked) and exports one PNG per frame id (`export-frames.mjs`).

| # | Review item | Fix |
|---|---|---|
| 1 | Icons a fixed dark grey, 2.1:1 on filled buttons | The rule in the design system's `icons.css` was `color: var(--fg-2)`; now `color: inherit`. Icons take their label's colour: white on Issue / Save / Retry / Revoke invitation, red next to Revoke and error text, blue next to Edit. All frames re-exported |
| 2 | Error icon dark in 2c / 2n, red in 3e | Same cause as 1: now red (`--color-danger`) in 2c, 2n and 3e, as in the build |
| 3 | Dates `26/09/08` on list and cards | `2026-09-08` on every frame (list, cards, success frames); history times with AM/PM |
| 4 | 1024 (3b): "Re-issues" / "Expiry (TBC)" touch; icons top-aligned while labels wrap | 3b uses the build's 1024 table: 8px cell padding and compact columns that fit without scrolling; sidebar 216px and labels never wrap (build too: `$layout-sidebar-w-md`, `white-space: nowrap`). Playwright now checks 1024: no sideways scroll, table fits its card, each nav label on one line |
| 5 | 1920 (3a) exported 4104px wide, content left | The frame no longer stretches to the 4200px board: 3a exports at 1920 (1922 with border), content centred in the main column as built |
| 6 | Toast top-right / top-left / bottom | One position per breakpoint, as built: desktop bottom-right (2d, 2e, 2f, 2l), phone bottom full width (3j) |
| 7 | Unused purple scale and second red `#EF4444` | Removed from the design file. `--error` is the one red `#942626`; the danger tint and border are its tints. Build: unused `$red-500` removed from `_palette.scss` |
| 9 | Four button heights 36 / 40 / 44 / 48 | Three, in build and Hi-Fi: `sm` 36 (table rows, pagination, toast Dismiss), `md` 44 (default buttons, header, inputs, every phone action), `lg` 48 (form submit, dialogs). `$control-h-touch` and the 40 are gone |
| 10 | Two disabled treatments | One: 60% opacity (`$opacity-disabled`) on every disabled or busy control. Pagination Previous now uses it in the build; the Hi-Fi busy buttons, dialog Cancel and Previous use `--opacity-disabled` |
| 11 | 1440: Edit on a second line in the frame, inline in the build | Frame updated: Manage actions on one line at 1440 (1a, 2d–2f, 3a); they stack only in the narrow 1024 column (3b). Build: a long doctor name wraps (`$table-name-max-w`) so Manage keeps its one line |
| 12 | Design but not build | Nothing |
| 13 | Issue, Detail and Edit at 768 | Declared (row 46): same one-column layout as 1440 |
| 14 | "Invitation not found" not drawn | New frame **2p** (detail not found; edit shows the same) |
| 15 | Long doctor name wrapping not drawn | New frame **3k** (375: card and detail with a 44-character name) |

Note: the Claude Design project itself (claude.ai/design) still holds the pre-review file; the corrected bundle is
`public/design/hifi.html` (and `wireframe.html`), which can be uploaded there to replace it.

## Still open
- Designer: rows 2, 6, 15, 16, 18, 39; required fields (row 32).
- Reviewer: PrimeReact vs custom components (row 14); contact search on visible digits only (row 5).
- Focus after Revoke (row 7): still falls to the page.
