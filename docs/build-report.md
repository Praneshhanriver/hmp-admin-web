# Build report — Doctor Invitations, Homework 2 (QA hand-over)

**Structure:** WM | Report (Title · Introduction · Summary · Content · References · Findings · Conclusions).
**Content** holds the 10 hand-over parts from the training page, Step 8 Part C.

## Introduction
A complete Doctor Invitations feature for the HMP admin web (Admin ADM-003): list, issue, detail with history,
edit, delete (= revoke) and re-issue, connected to a Spring Boot API built for this homework.
Author: Pranesh Ghosh · Reviewer: Vaishali Naruka · Date: 2026-10-07.

## Summary
Lint, type-check, production build, 33 backend tests, 23 Playwright tests and 7 Playwright mutation tests all pass
(output in part 9). The feature runs end to end on the real API: create → list → edit → delete → re-issue.
No hard delete (spec p.113c); there is no login (one fixed admin).

## Content

### 1. Build
| | Frontend | Backend |
|---|---|---|
| Repo | <https://github.com/Praneshhanriver/hmp-admin-web> | <https://github.com/Praneshhanriver/hmp-admin-api> |
| Branch | `feature/hw2-invitation-crud` → merged to `main` | `main` |
| Commit | `WEB_COMMIT` | `API_COMMIT` |
| Link | <https://hmp-admin-web.vercel.app/doctors/invitations/list> | `DEMO_API_URL` (Render, Docker) |
| Date | 2026-10-07 | 2026-10-07 |
| Runtime | Node 24.21 (20+ supported) · Next.js 15.5.27 | Java 21.0.12 · Spring Boot 4.0.8 · H2 in memory |

### 2. TL tasks covered
- AI Frontend Training — Homework 2: <https://app.notion.com/p/3e9326b2d5fb80c0872def7b6a848d3c> (section 13)
- My submission page: <https://app.notion.com/p/divii/Pranesh-Ghosh-3f0326b2d5fb8157a257c5731cfd03b8>
- Spec: Admin ADM-003 — p.113b Issue invitation · p.113c Invitation list · p.113e Invitation detail

### 3. What changed (plain words)
- The invitation list now shows **real data from the API** instead of fake data. Search, the status filter and
  paging are done by the server. The search is kept in the address, so Back and reload keep it.
- New **Issue invitation** page: three fields, checked as you type after the first try, and checked again by the
  server. If the server refuses (e.g. the email already has a waiting invitation), the reason appears under the field.
- New **Invitation detail** page with the full history (who did what, when).
- New **Edit** page for Pending invitations: saving sends a corrected link.
- **Revoke is the delete**: the link stops working and the row stays in the list as Revoked.
- After any change the list updates by itself and a message confirms what happened.
- Dates now follow the WM format (`2026-09-08`, `September 8, 2026`, `08:33 PM`).

### 4. Fixed issues (Homework 1 review)
| Issue | What changed |
|---|---|
| README demo line "TO FILL IN", repo link on the feature branch | README rewritten with demo + `main` links |
| Design only visible with a Claude Design login | Exports attached on the Notion page |
| Date format `26/09/08` | WM format everywhere (`utils/format.ts`) |
| Use TanStack Query hooks in `src/hooks/API/<domain>/` | `src/hooks/API/invitations/`, one hook per file |
| Fixed values in component partials | Moved to `_tokens.scss`; comments name tokens |

Found and fixed during this build: re-issuing an old invitation could create a second live link for the same
email; spaces around a name were counted by the API but not by the browser; validation messages came back in a
random order; sidebar links to unbuilt screens caused console 404s (prefetch turned off).

### 5. Test accounts / roles
Not applicable: the admin web has no login in this homework. Every admin action is recorded as `admin@hmp.co.kr`.

### 6. Data QA must prepare
Nothing. Every API start creates 18 demo invitations (6 Pending · 5 Used · 4 Expired · 3 Revoked, one with no
name or contact) with dates relative to "now". **Restart the API to reset** (on Render: Manual Deploy → Restart).
Useful rows: Dr. Kim Han-mi (Pending, `kim.hanmi@clinic.co.kr`), Dr. Lee Seo-jun (Used, `lee.seojun@clinic.co.kr`),
Dr. Park Ji-ho (Expired, re-issued once), Dr. Kang Bo-ra (Used).

### 7. What to test
Full list with steps and expected results: [qa-test-cases.md](qa-test-cases.md) (58 cases). Priorities:
1. Issue → it appears on top as Pending → Edit → Revoke → Re-issue → detail history shows all four steps (TC-10…15).
2. Every form rule with wrong values; the server's "already waiting" message under Email (TC-20…33).
3. Search by name, by visible digits, never by hidden digits; status filter; paging; Back keeps the search (TC-50…58).
4. Loading, empty, error (stop the API) and Retry (TC-80…87).
5. Edit rules: prefilled, disabled until changed, refused for non-Pending (TC-40…43).
6. Widths 1920 / 1366 / 768 / 375 on all four screens (TC-90…93).

### 8. Known issues and not covered
- No login, so roles and permissions are not applicable; "Used" can't be produced from the admin (no doctor sign-up).
- Unsaved-changes warning only on tab close / reload, not on in-app links.
- Focus after Revoke falls to the page (the Revoke button is gone).
- Render free tier: first request after idle takes about a minute; data resets to the demo set on restart.
- Other sidebar sections (Patients, Doctor list, Consultations, Settings) are not part of this feature and 404.
- Designer questions still open: [design-check.md](design-check.md#still-open) (rows per page 8 vs 20, validity
  period, required fields, sort order).
- Browsers: only Chromium was tested automatically; Safari and Firefox not checked.

### 9. Results of lint, type-check, build and tests
Run on 2026-10-07 on Windows 11. Playwright ran against the **production build** (`npm run start`) and the API
**Docker image** (`docker run hmp-admin-api:local`).

```text
$ npx tsc --noEmit
(no output) exit 0

$ npm run lint
> eslint
(no output) exit 0

$ npm run build
   ▲ Next.js 15.5.27 (Turbopack)
 ✓ Compiled successfully
Route (app)                               Size  First Load JS
┌ ○ /                                      0 B         128 kB
├ ○ /_not-found                            0 B         128 kB
├ ○ /doctors/invitations/create        5.42 kB         165 kB
├ ƒ /doctors/invitations/details/[id]  9.53 kB         169 kB
├ ƒ /doctors/invitations/edit/[id]     11.2 kB         171 kB
└ ƒ /doctors/invitations/list          39.3 kB         178 kB
exit 0 — 0 warnings

$ ./mvnw verify            (hmp-admin-api)
[INFO] Tests run: 12 -- in InvitationApiIntegrationTest
[INFO] Tests run: 6  -- in InvitationTest
[INFO] Tests run: 14 -- in MobileNumbersTest
[INFO] Tests run: 1  -- in HmpAdminApiApplicationTests
[INFO] Tests run: 33, Failures: 0, Errors: 0, Skipped: 0
[INFO] BUILD SUCCESS

$ npm run test:e2e         (e2e/invitations.spec.ts)
  ✓  1 Invitation list › opens with the title, the count and one page of rows
  ✓  2 Invitation list › searches by doctor name and keeps the search in the URL
  ✓  3 Invitation list › contact search never matches the hidden middle digits
  ✓  4 Invitation list › filters by status
  ✓  5 Invitation list › shows no results with the search echoed back, and Clear search
  ✓  6 Invitation list › pages through the results
  ✓  7 Invitation list › shows a loading skeleton while the API answers
  ✓  8 Invitation list › shows the empty state when there are no invitations at all
  ✓  9 Invitation list › shows the API's error message with Retry, then recovers
  ✓ 10 Invitation list › shows a plain message when the server cannot be reached
  ✓ 11 Invitation detail › shows the facts and the history, oldest first
  ✓ 12 Invitation detail › says when an invitation does not exist
  ✓ 13 Issue invitation form › requires every field and puts focus on the first problem
  ✓ 14 Issue invitation form › checks length and format with the same rules as the backend
  ✓ 15 Issue invitation form › shows the backend's own error under the field and keeps what was typed
  ✓ 16 Issue invitation form › shows a server error without losing the input
  ✓ 17 Edit invitation › prefills a pending invitation and enables Save only after a change
  ✓ 18 Edit invitation › refuses to edit an invitation that is no longer pending
  ✓ 19 Screen sizes › no sideways scrolling at 1920px on list, create and detail
  ✓ 20 Screen sizes › no sideways scrolling at 1366px on list, create and detail
  ✓ 21 Screen sizes › no sideways scrolling at 768px on list, create and detail
  ✓ 22 Screen sizes › no sideways scrolling at 375px on list, create and detail
  ✓ 23 Screen sizes › shows cards instead of the table on phones
  23 passed (1.3m)

$ npm run test:e2e:mutation   (e2e/invitations.mutation.spec.ts)
  ✓ 1 create: a new invitation appears in the list as Pending
  ✓ 2 details: the new invitation has one history line
  ✓ 3 edit: the corrected details are saved and a corrected link is sent
  ✓ 4 delete (revoke): the link stops working and the row stays as Revoked
  ✓ 5 re-issue: a revoked invitation goes back to Pending with a new link
  ✓ 6 history lists every step, oldest first
  ✓ 7 a second invitation for the same email is refused by the API
  7 passed (36.1s)
```
Console check on the production build (list, create, detail, edit): no errors, except the browser's own log of
the API's 404 when a detail id does not exist (expected).

### 10. Screen sizes and browsers checked
- Widths: 1920 · 1600 · 1366 · 1280 · 1024 · 991 · 768 · 640 · 480 · 375 on list, create, detail and edit: no
  sideways scrolling at any width. Screenshots: [screenshots/hw2](screenshots/hw2) (`<screen>-w<width>.png`, plus
  `create-errors-*` and `edit-not-editable-*`). Playwright re-checks 1920 / 1366 / 768 / 375 on every run.
- Browser: Chromium (Playwright 1.63, Desktop Chrome profile). Safari / Firefox / real phones not checked.

## References
- Training page (Steps 3–8, section 13): <https://app.notion.com/p/3e9326b2d5fb80c0872def7b6a848d3c>
- WM: Date format · Three digit comma rule · Error Message List · QA Template · Report
- [qa-test-cases.md](qa-test-cases.md) · [error-messages.md](error-messages.md) · [design-check.md](design-check.md)
- API reference: [hmp-admin-api README](https://github.com/Praneshhanriver/hmp-admin-api#endpoints)

## Findings
- Keeping one source of truth per rule paid off: the browser and the API share the same validation messages, and the
  status rules exist once per side (`invitationRules.ts` / `InvitationStatus`).
- Most bugs were found by trying the real API (re-issue duplicate, trim mismatch), not by reading code.
- The WM Error Message List and QA Template pages are still stubs; the message table and test-case layout here are
  our own and could be reused for them.

## Conclusions
Ready for QA on the scope above. Open items are designer questions and the known limits in part 8, none of which
block the main flow.
