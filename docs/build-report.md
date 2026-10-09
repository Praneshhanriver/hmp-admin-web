# Build report — Doctor Invitations, Homework 2 (QA hand-over)

**Structure:** WM | Report (Title · Introduction · Summary · Content · References · Findings · Conclusions).
**Content** holds the 10 hand-over parts from the training page, Step 8 Part C.

## Introduction
A complete Doctor Invitations feature for the HMP admin web (Admin ADM-003): list, issue, detail with history,
edit, delete (= revoke) and re-issue, connected to a Spring Boot API built for this homework.
Author: Pranesh Ghosh · Reviewers: Vaishali Naruka (code), Bhagyashree Gouda (design), Archana Swain (QA) ·
Date: 2026-10-07, updated 2026-10-08 after the code review and 2026-10-09 after the design and QA reviews (part 4).

## Summary
Lint, type-check, production build, 36 backend tests, 26 Playwright read-only tests and 7 Playwright mutation tests
all pass, locally and on the live demo (output in part 9, HTML reports linked there). The feature runs end to end on the real API: create → list → edit → delete → re-issue.
No hard delete (spec p.113c); there is no login (one fixed admin).

## Content

### 1. Build
| | Frontend | Backend |
|---|---|---|
| Repo | <https://github.com/Praneshhanriver/hmp-admin-web> | <https://github.com/Praneshhanriver/hmp-admin-api> |
| Branch | `main` (from `feature/hw2-invitation-crud`) | `main` |
| Commit | [`ee52060`](https://github.com/Praneshhanriver/hmp-admin-web/commit/ee52060) (deployed and tested; later commits are docs and test reports only) | [`397c869`](https://github.com/Praneshhanriver/hmp-admin-api/commit/397c869) (deployed and tested) |
| Link | <https://hmp-admin-web.vercel.app/doctors/invitations/list> (Vercel) | <https://hmp-admin-api.onrender.com/api/v1/admin/doctor-invitations> (Render, Docker) |
| Date | 2026-10-08 | 2026-10-08 |
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
- New **Edit** page for Pending invitations: saving updates the name, email or mobile only — no new link is sent
  (Re-issue on the list does that).
- **Revoke is the delete**: the link stops working and the row stays in the list as Revoked.
- After any change the list updates by itself and a message confirms what happened.
- Dates now follow the WM format (`2026-09-08`; history `2026-09-08 08:33 PM`).
- All screens and states were matched to the Hi-Fi design frames (titles, back links, notices, banners, buttons, copy).
- After the design review (9 Oct): three button heights (36 / 44 / 48) instead of four, one disabled look (60%
  opacity) for every button including Previous, a 216px sidebar at 1024–1439 so no menu label wraps, and long doctor
  names wrap in the table instead of pushing the Manage buttons onto a second line. The Hi-Fi itself was corrected
  (icon colours, dates, toast position, one red, 1920 / 1024 frames) and all frames re-exported, with two new frames
  (2p not found, 3k long name).

### 4. Fixed issues (Homework 1 review)
| Issue | What changed |
|---|---|
| README demo line "TO FILL IN", repo link on the feature branch | README rewritten with demo + `main` links |
| Design only visible with a Claude Design login | Exports in `docs/design/` and on the Notion page |
| Date format `26/09/08` | WM format everywhere (`utils/format.ts`) |
| Use TanStack Query hooks in `src/hooks/API/<domain>/` | `src/hooks/API/invitations/`, one hook per file |
| Fixed values in component partials | Moved to `_tokens.scss`; comments name tokens |

**Fixed after the HW2 code review (8 Oct)**
| Review point | What changed |
|---|---|
| Page facts no longer true (date wording, old pasted response, old commit) | Notion page and this report updated: dates `2026-09-08`, response pasted again from the live API, commits above |
| Cold start (143 s) longer than the 70 s request timeout | Request timeout 180 s (`API_REQUEST_TIMEOUT_MS`); demo link says "up to 3 minutes, press Retry if needed" |
| Dark pairs missing | `_tokens.scss`: `$colors-day` / `$colors-night` with the same names (WM Light/Dark), constants apart; the build fails if a name is missing on one side. Compiled CSS unchanged |
| Section 12 for QA, Positive / Negative per case | Section 12 filled; every test case marked Positive or Negative (33 / 27 / 1 N/A), TC-44 and TC-45 added |
| Unused `primereact` / `primeicons`; wrong comment on `update` | Packages removed; comment says no new link is sent |

**Fixed after the HW2 design review (Bhagyashree, 9 Oct)** — full list with the fix per item: [design-check.md](design-check.md#design-review-fixes-bhagyashree-9-oct)
| Review point | What changed |
|---|---|
| 1–2 Icons one dark grey (2.1:1 on filled buttons); error icon dark in 2c / 2n | Hi-Fi rule `color: var(--fg-2)` → `color: inherit`; all 31 frames re-exported (now 33 with 2p and 3k) |
| 3 Dates `26/09/08` in list and cards | `2026-09-08` on every frame; history times with AM/PM |
| 4 1024: headers touch, icons and wrapped labels | Frame 3b uses the build's 1024 table; sidebar 216px with labels on one line, **build too**; Playwright checks 1024 |
| 5 1920 frame 4200px wide | Exported at 1920, content centred |
| 6 Three toast positions | Desktop bottom-right, phone bottom, as built |
| 7 Unused purple and second red | Removed (Hi-Fi and `_palette.scss`) |
| 9 Four button heights | `$control-h-sm` 36 · `md` 44 · `lg` 48 only (`$control-h-touch` and 40 removed), same in the Hi-Fi |
| 10 Two disabled looks | 60% opacity everywhere (`$opacity-disabled`), pagination included |
| 11 Edit on a second line at 1440 in the frame | Frame updated to one line; build keeps it one line even with a long name (`$table-name-max-w`) |
| 13–15 Built but not drawn | 768 create / detail / edit declared; new frames 2p (not found) and 3k (long name) |

**Fixed after the HW2 QA review (Archana, 9 Oct)**
| Review point | What changed |
|---|---|
| 1 Mutation runs leave a "Dr. E2E Test …" row | The row is now named `E2E test row <run id> (auto-revoked)` and an `afterAll` step revokes it even when a test fails, so a run never leaves an open invitation; it disappears on the next API restart |
| 2 Cold start up to 3 minutes | `hmp-admin-api/.github/workflows/keep-alive.yml` calls `/actuator/health` every 10 minutes, so Render does not put the API to sleep (one free service ≈ 744 of 750 free hours a month) |
| 3 Width lists did not match | Part 10 now names the review widths 1440 / 768 / 375 and lists exactly what Playwright checks |
| 4 Test case IDs with gaps | Note in [qa-test-cases.md](qa-test-cases.md): IDs go in blocks of ten per section, gaps are intentional; 2 cases added (TC-62 long name, TC-94 1024) |

**Found on the live demo on 8 Oct and fixed:** the Render API's in-memory database closed while the app kept running
(reads worked, every create / edit / revoke answered 500, log: `The database has been closed [90098]`). The API now
stops itself when it sees that error so Render starts a fresh instance (`DatabaseClosedGuard`, with a test), runs with
`-XX:+ExitOnOutOfMemoryError`, and H2 no longer closes itself on exit. Both Playwright suites pass on the live demo after the fix.
The design links (Claude Design) opened only for project members; the Hi-Fi and wireframe are now served from the demo:
[/design/hifi.html](https://hmp-admin-web.vercel.app/design/hifi.html) · [/design/wireframe.html](https://hmp-admin-web.vercel.app/design/wireframe.html).

Found and fixed during this build: re-issuing an old invitation could create a second live link for the same
email; spaces around a name were counted by the API but not by the browser; validation messages came back in a
random order; a name containing a digit ("E2E") also matched contact numbers (contact search now only for phone-like text); sidebar links to unbuilt screens caused console 404s (prefetch turned off).

### 5. Test accounts / roles
Not applicable: the admin web has no login in this homework. Every admin action is recorded as `admin@hmp.co.kr`.

### 6. Data QA must prepare
Nothing. Every API start creates 18 demo invitations (6 Pending · 5 Used · 4 Expired · 3 Revoked, one with no
name or contact) with dates relative to "now". **Restart the API to reset** (on Render: Manual Deploy → Restart).
Useful rows: Dr. Kim Han-mi (Pending, `kim.hanmi@clinic.co.kr`), Dr. Lee Seo-jun (Used, `lee.seojun@clinic.co.kr`),
Dr. Park Ji-ho (Expired, re-issued once), Dr. Kang Bo-ra (Used).

### 7. What to test
Full list with steps and expected results: [qa-test-cases.md](qa-test-cases.md) (63 cases: 34 Positive · 28 Negative ·
1 N/A; IDs in blocks of ten per section, the gaps are intentional). Priorities:
1. Issue → it appears on top as Pending → Edit → Revoke → Re-issue → detail history shows all four steps (TC-10…15).
2. Every form rule with wrong values; the server's "already waiting" message under Email (TC-20…33).
3. Search by name, by visible digits, never by hidden digits; status filter; paging; Back keeps the search (TC-50…62).
4. Loading, empty, error (stop the API) and Retry (TC-80…87).
5. Edit rules: prefilled, disabled until changed, refused for non-Pending (TC-40…43).
6. Widths 1440 / 768 / 375 (review widths) plus 1920 / 1366 / 1024 on all four screens (TC-90…94).

### 8. Known issues and not covered
- No login, so roles and permissions are not applicable; "Used" can't be produced from the admin (no doctor sign-up).
- Unsaved-changes warning only on tab close / reload, not on in-app links.
- Focus after Revoke falls to the page (the Revoke button is gone).
- Render free tier: without traffic the API sleeps and the next request can take up to 3 minutes (measured 143 s).
  A keep-alive call every 10 minutes (GitHub Actions) prevents that; GitHub may start a scheduled run a few minutes late,
  and pauses schedules after 60 days without commits. The app waits 180 s and offers Retry. Data resets to the demo
  set on every restart.
- Mutation tests may be run on the demo: each run makes one `E2E test row <number> (auto-revoked)`, touches no other
  row and leaves its row Revoked.
  Please do not revoke the demo rows the test cases use (Dr. Kim Han-mi, Dr. Lee Seo-jun); a restart resets them anyway.
- Other sidebar sections (Patients, Doctor list, Consultations, Settings) are not part of this feature and 404.
- Designer questions still open: [design-check.md](design-check.md#still-open) (rows per page 8 vs 20, validity
  period, required fields, sort order).
- Browsers: only Chromium was tested automatically; Safari and Firefox not checked.

### 9. Results of lint, type-check, build and tests
Run on 2026-10-09 after the design and QA review fixes, on Windows 11. Locally, Playwright ran against the **production build**
(`npm run start`) and the API (`./mvnw spring-boot:run`); the API Docker image was built and smoke-tested too.

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
├ ○ /doctors/invitations/create        5.88 kB         166 kB
├ ƒ /doctors/invitations/details/[id]  11.7 kB         171 kB
├ ƒ /doctors/invitations/edit/[id]     16.5 kB         176 kB
└ ƒ /doctors/invitations/list          39.2 kB         178 kB
exit 0 — 0 warnings

$ ./mvnw verify            (hmp-admin-api)
[INFO] Tests run: 13 -- in InvitationApiIntegrationTest
[INFO] Tests run: 6  -- in InvitationTest
[INFO] Tests run: 14 -- in MobileNumbersTest
[INFO] Tests run: 1  -- in HmpAdminApiApplicationTests
[INFO] Tests run: 2  -- in DatabaseClosedGuardTest
[INFO] Tests run: 36, Failures: 0, Errors: 0, Skipped: 0
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
  ✓ 19 Screen sizes › no sideways scrolling at 1920px on list, create, detail and edit
  ✓ 20 Screen sizes › no sideways scrolling at 1440px on list, create, detail and edit
  ✓ 21 Screen sizes › no sideways scrolling at 1366px on list, create, detail and edit
  ✓ 22 Screen sizes › no sideways scrolling at 1024px on list, create, detail and edit
  ✓ 23 Screen sizes › no sideways scrolling at 768px on list, create, detail and edit
  ✓ 24 Screen sizes › no sideways scrolling at 375px on list, create, detail and edit
  ✓ 25 Screen sizes › at 1024px the table fits its card and every nav label stays on one line (Hi-Fi 3b)
  ✓ 26 Screen sizes › shows cards instead of the table on phones
  26 passed (1.2m)

$ npm run test:e2e:mutation   (e2e/invitations.mutation.spec.ts)
  ✓ 1 create: a new invitation appears in the list as Pending
  ✓ 2 details: the new invitation has one history line
  ✓ 3 edit: the corrected details are saved, no new link is sent
  ✓ 4 delete (revoke): the link stops working and the row stays as Revoked
  ✓ 5 re-issue: a revoked invitation goes back to Pending with a new link
  ✓ 6 history lists every step, oldest first
  ✓ 7 a second invitation for the same email is refused by the API
  7 passed (28.1s)   — afterwards the run's own row "E2E test row … (auto-revoked)" is Revoked
```
Then against the **live demo** (`PLAYWRIGHT_BASE_URL=https://hmp-admin-web.vercel.app`, API on Render), 8 Oct 2026,
web `ee52060` and API `397c869`:
```text
$ npx playwright test
  24 passed (3.3m)
$ npm run test:e2e:mutation
  7 passed (1.5m)
```
**HTML reports (execution evidence):** [read-only](https://hmp-admin-web.vercel.app/test-reports/read-only/index.html) ·
[mutation](https://hmp-admin-web.vercel.app/test-reports/mutation/index.html) (open in the browser, no login) · zips in
[test-reports/](test-reports/). The read-only and mutation runs write separate reports
(`playwright-report/read-only`, `playwright-report/mutation`).
The live mutation run leaves one "Dr. E2E Test …" invitation (Pending, re-issued twice) in the demo data; it disappears when the
Render service restarts.

Console check on the production build (list, create, detail, edit): no errors, except the browser's own log of
the API's 404 when a detail id does not exist (expected).

### 10. Screen sizes and browsers checked
| Widths | How | Screens |
|---|---|---|
| **1440 · 768 · 375** (design and QA review widths) | Playwright on every run, locally and on the live demo: no sideways scroll; cards instead of the table at 375. Side by side with the Hi-Fi: [design/compare](design/compare) | list, create, detail, edit |
| 1920 · 1366 · 1024 | Playwright on every run: no sideways scroll; at 1024 also "the table fits its card and every menu label is on one line" | list, create, detail, edit |
| 1920 · 1600 · 1366 · 1280 · 1024 · 991 · 768 · 640 · 480 · 375 (the ten WM widths) | Screenshots, no sideways scroll at any width: [screenshots/hw2](screenshots/hw2) (`<screen>-w<width>.png`, plus dialogs and states) | list, create, detail, edit |

So Playwright checks **1920 · 1440 · 1366 · 1024 · 768 · 375**; 1440 is not one of the ten WM widths, which is why it
is listed separately.
- Browser: Chromium (Playwright 1.63, Desktop Chrome profile), locally and on the live demo. Safari / Firefox / real phones not checked.

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
