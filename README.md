# HMP Admin — Doctor Invitations

The **Doctor Invitations** feature of the HMP Telemedicine Administration web (Admin ADM-003): list, issue, detail
with history, edit, delete (= revoke) and re-issue, on a real Spring Boot API.
Next.js 15 App Router · React 19 · TypeScript · SCSS · TanStack Query · axios · Playwright.
Built for the AI Frontend Training — Homework 1 (list screen, passed) and Homework 2 (full feature on a real API).

## Links
| | |
|---|---|
| **Demo (web)** | Being deployed (Vercel, after the API is on Render). Until then <https://hmp-admin-web.vercel.app/doctors/invitations/list> shows Homework 1 |
| **Demo (API)** | Being deployed (Render, Docker) · free service: the first load after a quiet period can take about a minute. Run locally: [How to run](#how-to-run) |
| **Frontend repo** | <https://github.com/Praneshhanriver/hmp-admin-web> — HW2 on `feature/hw2-invitation-crud` (merged to `main` with the demo deploy); HW1 on `main` |
| **Backend repo** | <https://github.com/Praneshhanriver/hmp-admin-api> — branch `main` |
| **Design** | Claude Design wireframe + Hi-Fi from spec p.113b / p.113c / p.113e: [wireframe](docs/design/doctor-invitation-crud-wireframe.jpg) · [Hi-Fi](docs/design/doctor-invitation-crud-hifi.jpg) (original HTML in [`docs/design/`](docs/design)) |

## What I built
| Screen | Route | Spec |
|---|---|---|
| Invitation list | `/doctors/invitations/list?q=&status=&page=` | p.113c |
| Issue invitation | `/doctors/invitations/create` | p.113b |
| Invitation detail + history | `/doctors/invitations/details/[id]` | p.113e |
| Edit (Pending only) | `/doctors/invitations/edit/[id]` | training extension |
| Delete = Revoke, and Re-issue | dialogs on the list | p.113c (no hard delete: the row stays as Revoked) |

- **List:** server-side search (doctor name, or only the contact digits visible on screen), status filter and
  paging; the search lives in the URL, so Back and reload keep it. Loading skeleton, empty, no results (search
  echoed + Clear search), error with the API's message + Retry, page-past-the-end.
- **Issue / Edit form:** labels above fields; the browser checks the **same rules with the same words** as the
  backend; the backend's own errors (e.g. "already waiting to be used") appear under the field; on any error what
  was typed is kept; the button can't be pressed twice; Edit is prefilled and enabled only after a change.
- **Detail:** facts (masked contact, WM dates) and the full history, oldest first, with the current link marked.
- **After every change** the list and detail reload by themselves (TanStack Query invalidation), with a toast that
  survives the page change.
- **Formats:** WM dates (`2026-09-08` in tables, `September 8, 2026` on detail, `… 08:33 PM` in history),
  three-digit commas, plain error messages ([docs/error-messages.md](docs/error-messages.md)).
- **Responsive** 1920 → 375 on every screen (cards, drawer, full-width form buttons on phones).

### Homework 2 checklist
- [x] List, create, details, edit, delete on a real API — [hmp-admin-api](https://github.com/Praneshhanriver/hmp-admin-api) (Spring Boot, 34 tests)
- [x] Service + hook pattern — `API_ENDPOINTS` → `api-services/InvitationService` → `hooks/API/invitations/use*` (TanStack Query); no API calls in components
- [x] Search, filter and paging on the list — done by the API
- [x] Validation matches the backend — same rules, order and messages; backend errors shown under the field
- [x] Loading, empty and error states, with the API's error messages
- [x] WM date, number and error-message formats
- [x] All screen sizes — [docs/screenshots/hw2](docs/screenshots/hw2) (10 widths × 4 screens)
- [x] Test cases in WM QA Template format — [docs/qa-test-cases.md](docs/qa-test-cases.md) (59 cases)
- [x] Playwright test + separate mutation test — `e2e/invitations.spec.ts` (23) · `e2e/invitations.mutation.spec.ts` (7)
- [x] QA build report — [docs/build-report.md](docs/build-report.md)

### Homework 1 feedback — fixed
| Feedback | Fix |
|---|---|
| README demo line "TO FILL IN", repo link on the feature branch | This README: demo + `main` links |
| Design links need a Claude Design login | Wireframe and Hi-Fi exported to [`docs/design/`](docs/design) (images + HTML) and attached on the Notion page |
| Dates `26/09/08` | WM format, `utils/format.ts` (`formatDate`, `formatLongDate`, `formatDateTime`) |
| Use the TanStack Query hook pattern in `src/hooks/API/<domain>/` | `src/hooks/API/invitations/`, one hook per file |
| A few fixed values left in component partials | Skeleton widths moved to `_tokens.scss`; comments name tokens, not pixels |

## How to run
Needs **Node.js 20+** and **Java 21**. Two terminals, side by side folders:

```bash
# 1. API — http://localhost:8080 (18 demo invitations on every start)
git clone https://github.com/Praneshhanriver/hmp-admin-api.git
cd hmp-admin-api
./mvnw spring-boot:run            # Windows: mvnw.cmd spring-boot:run

# 2. Web — http://localhost:3000
git clone https://github.com/Praneshhanriver/hmp-admin-web.git
cd hmp-admin-web
npm install
cp .env.example .env.local        # NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
npm run dev
```
Open <http://localhost:3000> (redirects to the list).

| To see | Do |
|---|---|
| Loading | DevTools → Network → Slow 4G, reload |
| Error | Stop the API, reload the list → message + Retry; start the API, press Retry |
| No results | Search `Kang Bo-ra` with status **Pending** |
| Empty | Covered by the Playwright test (the API always has demo data) |
| Backend validation on screen | Issue invitation with `kim.hanmi@clinic.co.kr` → "already waiting to be used" under Email |
| Privacy-safe contact search | Search `1234` → only Dr. Lee Seo-jun (Dr. Kim Han-mi's hidden middle digits are 1234) |
| Full flow | Issue → find it → Edit → Revoke → Re-issue → open its detail and read the history |

### Checks
```bash
npx tsc --noEmit
npm run lint
npm run build                     # stop `npm run dev` first: both use .next/
npx playwright install chromium   # once
npm run test:e2e                  # read-only, API + web running
npm run test:e2e:mutation         # creates / edits / revokes data — run on purpose
# backend: cd ../hmp-admin-api && ./mvnw verify
```
Real output of every check: [docs/build-report.md](docs/build-report.md#9-results-of-lint-type-check-build-and-tests).

## Project structure
```
src/app/(main)/doctors/invitations/   list/ create/ details/[id]/ edit/[id]/ — thin Server Component pages
src/api-services/                     apiClient (axios + ApiError) · InvitationService (the only API calls)
src/hooks/API/invitations/            useGetInvitationsList · useGetInvitationDetail · useCreate/Update/Reissue/DeleteInvitation
src/hooks/useInvitationActions.ts     Re-issue / Revoke dialog flow
src/components/providers/             QueryProvider · ToastProvider
src/components/invitations/           list view, search bar, table, card, dialog, form, create / detail / edit views
src/components/common/  layout/       PageHeader, StatusChip, Pagination, EmptyState, ErrorState, Toast · admin shell
src/utils/                            api-integration (API_ENDPOINTS, QUERIES), format, invitationValidation, listParams
src/styles/                           _palette · _tokens · _mixins · one partial per component
e2e/                                  Playwright: invitations.spec.ts, invitations.mutation.spec.ts
docs/                                 design check · QA test cases · build report · error messages · screenshots
```

## React and Next.js concepts used (where to look)
| Concept | Where |
|---|---|
| Server vs client components | Every `page.tsx` is a Server Component that reads `params` / `searchParams`; `"use client"` only on views with state, events or hooks |
| Dynamic routes | `details/[id]`, `edit/[id]` → `parseInvitationId` (non-numbers show "not found" without an API call) |
| Custom hooks / TanStack Query | `hooks/API/invitations/*`: `useQuery` with cache keys from `QUERIES`, `useMutation` + `invalidateQueries` |
| Controlled form | `InvitationForm`: value from state, `onChange` updates state, derived errors (not stored) |
| Context | `ToastProvider` (`createContext` + `useToast`) so the toast survives navigation |
| Effects with cleanup | Toast timer, row highlight timer, `beforeunload` listener, focus after a server error |
| Resetting state with `key` | `SearchBar key={query|status}`, `EditForm key={id}` |
| Env variables | `NEXT_PUBLIC_API_BASE_URL` (baked in at build time) |

## Prompts and skills used
**Skills:** the training skills (`fe-*`, `smoke-test`, `fe-build-handoff`) have not been shared yet, so they are not
installed. The project rules are in [`CLAUDE.md`](CLAUDE.md) (both repos); WM pages were read through the Notion
connector.

**Main prompt (Claude Code, exact text):**
```
now start working on the backend for the same
<pasted: the Slack announcement of the AI Frontend Training homework>
https://app.notion.com/p/3e9326b2d5fb80c0872def7b6a848d3c --> This is the trainging page go throuhg this deeply
understnad the requirements and build the Homework-2 in java spring boot in backend complete the same end to end
with full proper testing off the backened with fromtend complete both end to end
https://app.notion.com/p/divii/Pranesh-Ghosh-3f0326b2d5fb8157a257c5731cfd03b8 -->> This I have submitted for HW-1
now check the slack status and also complete the HW-2
check slack notion and everything and complete the HW-2
```
How the work went from that prompt:
1. Claude Code read the training page, my HW1 page (with Vaishali's feedback) and the Slack thread, and showed a plan.
2. I answered four decisions: packages (`@tanstack/react-query`, `axios`, `@playwright/test`), **Delete = Revoke**
   (as in the spec), a separate backend repo, H2 + Flyway.
3. Backend first (entity rules, validation, errors, 34 tests, Docker), checked with curl; then the frontend data
   layer, screens, Playwright, docs. Type-check and lint after every step; build, all tests and screenshots at the end.

## Problem I hit and how I solved it
**The demo data would have been all "Expired".** Caught while planning the seed data: the HW1 mocks have fixed
September dates with a 14-day validity. Loaded as they were, every Pending invitation would already be past its
expiry, so the new expiry job would turn all six into Expired the moment the API started — no Pending rows to edit,
revoke or test. Fix: the `DemoDataSeeder` builds the 18
invitations with dates **relative to start-up** ("issued 2 days ago") and through the same domain methods as real
requests (`issue`, `reissue`, `revoke`, `markUsed`, `expireIfDue`), so their history is real too. Every restart
(including Render waking up) gives the same, valid demo.

Also found along the way:
- **Re-issuing an old invitation could create a second live link.** Revoke A, issue B for the same email, then
  re-issue A → two Pending invitations. Found by trying it with curl against the running API. The service now runs the same duplicate check on re-issue (API test
  `reissuingARevokedInvitationIsRefusedWhenTheEmailHasANewerPendingOne`).
- **" K " passed the length check on the API but not in the browser** (the API counted the spaces). Noticed while copying
  the rules into the frontend. The request record now trims before validation, so both sides agree.
- **Validation messages came back in a random order** (Bean Validation has no fixed order), so "required" and
  "too short" could swap. Noticed in code review. The handler now picks one message per field in a fixed order: required → length → format.

## Known limitations
- No login: every admin action is recorded as `admin@hmp.co.kr`; "Used" exists only in the demo data (no doctor
  sign-up in this homework).
- Unsaved-changes warning only on tab close / reload, not on in-app links.
- Other sidebar sections (Patients, Doctor list, Consultations, Settings) are outside this feature and 404.
- Open designer questions: [docs/design-check.md](docs/design-check.md#still-open).
