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
| 1 | Sidebar width | Hi-Fi 240px (200px at 1024). Spec admin shell 176px | 240px ≥1440, 200px 1024–1439 (`$layout-sidebar-w`, `-md`) | Decided by Hi-Fi |
| 2 | Rows per page | Hi-Fi 8 per page (18 → 3 pages). Other spec admin lists use 20 | `INVITATION_PAGE_SIZE = 8` | Question for designer |
| 3 | Status filter | In the Hi-Fi search bar; **not** in spec p.113c (search only) | Status dropdown next to search, applied on Search | Decided by Hi-Fi |
| 4 | "No invitations yet" | Hi-Fi shows only no-results (filters) and error | Separate empty state when there is no data at all | Our addition |
| 5 | Contact search | Spec: search by name or contact. Contact shown masked `010-****-####` | HW2: the **API** matches only the visible digits (stored `mobile_search_digits` = first 3 + last 4), and the list API sends the number already masked | Our addition · Question for reviewer |
| 6 | Expiry after re-issue | Validity period TBC (S12 ▸ INVITATION). Spec conflicts on whether re-issue resets expiry. Hi-Fi 2d keeps Issued/Expiry unchanged | HW2: API setting `hmp.invitation.validity=P14D`; re-issue and edit set Issued = now, Expiry = now + 14 days; a job marks overdue Pending invitations Expired every minute | Question for designer |
| 7 | Focus after Revoke | Hi-Fi: focus returns to the Revoke button that opened the dialog | After Revoke the row is Revoked and its Revoke button is gone, so focus cannot return to it (falls to the page) | Known limitation · Question |
| 8 | Updated row in a filtered list | Not specified | A re-issued/revoked row stays in the current filtered list (e.g. "Pending") until the next Search, so the admin sees what changed | Our addition (intentional) |
| 9 | Action failure | Hi-Fi has no failure frame for Re-issue/Revoke | Error message (the API's own text) inside the dialog, dialog stays open to retry. HW2: testable by stopping the API (TC-87) | Our addition |
| 10 | Date format | Spec uses three formats: `26/09/08`, `2026 09 08`, `2026.07.12` | HW2 (reviewer feedback): WM English format — `YYYY-MM-DD` in tables and cards, `September 8, 2026` on the detail, `September 8, 2026 08:33 PM` in the history | Fixed |
| 11 | Mobile masking | Spec masking examples are inconsistent | `010-****-5678` everywhere (masked by the API), missing → `-` | Decided by Hi-Fi |
| 12 | Body text size | p.112 uses 13px; elsewhere and Hi-Fi minimum 14px | `$font-size-body: 14px`, nothing smaller in the list (the old 12px dialog tag was fixed to 14px) | Decided by Hi-Fi |
| 13 | Linked screens | Issue invitation (p.113b), Detail (p.113e), Edit (training extension) | HW2: all three screens built | Closed |
| 14 | Component library | PrimeReact is the company stack | Custom components built from the Hi-Fi design system; `primereact` / `primeicons` installed but unused | Question for reviewer |

## Other differences found while checking the code against the Hi-Fi

| # | Area | Spec / Hi-Fi says | What was built | Status |
|---|---|---|---|---|
| 15 | Drawer breakpoint | Hi-Fi notes say "≤768: sidebar becomes a Menu drawer"; frames show 1024 with sidebar and 768 with Menu | Drawer below **1024** (the 769–1023 range is not drawn in the Hi-Fi) | Decided by us · Question |
| 16 | Scroll hint | Hi-Fi 768 frame: "Scroll the table sideways for Manage →" | Hint shown 768–1023. Measured: at 768 the table scrolls in its card, at 991 it already fits, but the hint still shows | Question for designer |
| 17 | Mobile range text | Hi-Fi 375 frames show "1–4 of 18" (they only draw 4 cards) | "1–8 of 18" because the page size is 8 | Decided by Hi-Fi (page size) |
| 18 | Detail action | Hi-Fi **table**: Detail only for Used. Hi-Fi **card**: View detail also for Expired and Revoked | Built exactly as each Hi-Fi component: table and card differ | Question for designer (Hi-Fi is inconsistent) |
| 19 | Card heading level | Hi-Fi card uses `<h3>` | `<h2>`: the correct level directly under the page `<h1>` | Our decision (a11y) |
| 20 | Table markup | Hi-Fi uses `div` grid with ARIA table roles | Native `<table>` with caption, `scope="col"`, row headers; scrolls inside its card | Our decision (a11y) |
| 21 | Mobile error copy | Hi-Fi 3e: "Something went wrong on our side. Your search is kept." | Same text as desktop ("… — try again in a moment.") on every width | Our decision (one component) |
| 22 | Loading announcement | Hi-Fi: visually hidden "Loading invitations" inside the table | Visible "Loading invitations…" in the live summary row + `aria-busy` on table and card list | Decided by Hi-Fi 2a (visible text) |
| 23 | Pagination disabled | Hi-Fi uses `aria-disabled` on Previous | Native `disabled` (not focusable, not clickable) | Our decision |
| 24 | Danger colours | Hi-Fi mixes them with `color-mix()` | Fixed palette values (`$red-700`, `$red-50`, `$red-300`, `$blue-50`) close to the mixed result | Decided by us (no color-mix in SCSS tokens) |
| 25 | Busy button | Hi-Fi busy opacity 0.7 | Disabled buttons use `$opacity-disabled` 0.6 everywhere; spinner icon + "Revoking…" label as in the Hi-Fi | Our decision (one token) |
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
| 37 | Edit | Training extension; wireframe W-04: Pending only, saving re-issues (count +1) | Same; Save disabled until something changes; browser warns before closing with unsaved changes | Our addition |
| 38 | Unsaved changes dialog | W-04: dialog when leaving | Only the browser's own prompt on close / reload; in-app links (Cancel, sidebar) leave without asking | Known limitation |
| 39 | List sort order | Not specified | Newest invitation first (first issue date), so a re-issued row does not jump to the top | Question for designer |
| 40 | Search in the URL | Not specified | `?q=&status=&page=` so Back from the detail and reload keep the search | Our addition |
| 41 | "Used" status | Set when the doctor signs up (doctor app) | No sign-up flow in this homework: Used rows exist only in the demo data | Out of scope |

## Still open
- Designer: rows 2, 6, 15, 16, 18, 39; required fields (row 32).
- Reviewer: PrimeReact vs custom components (row 14); contact search on visible digits only (row 5).
- Focus after Revoke (row 7): still falls to the page.
