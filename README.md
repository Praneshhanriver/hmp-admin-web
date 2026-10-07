# HMP Admin — Doctor Invitation List (Homework 1)

The **Doctor Invitation list** of the HMP Telemedicine Administration web (Admin ADM-003, spec p.113c), built with
Next.js 15 App Router, React 19, TypeScript and SCSS from a Claude Design wireframe and Hi-Fi. Admins can search
invitations by doctor name or the visible contact digits, filter by status, page through the results, and
re-issue or revoke an invitation through a confirmation dialog with a toast and a highlighted row. Data comes from
an in-memory mock service, every list state (loading, empty, no results, error) is designed, and the layout works
at every width from 1920 down to 375 without sideways page scrolling.

## Links
- **Demo:** <https://hmp-admin-web.vercel.app/doctors/invitations/list> (Vercel, deployed from `main`)
- **Repository:** <https://github.com/Praneshhanriver/hmp-admin-web> — branch `main` (lesson-by-lesson commits on `feature/hw1-invitation-list`)
- **Design:** [wireframe](docs/design/doctor-invitation-crud-wireframe.jpg) · [Hi-Fi](docs/design/doctor-invitation-crud-hifi.jpg) (full-canvas exports; the original Claude Design HTML files are next to them in [`docs/design/`](docs/design))

## Fixes after the Homework 1 review (2026-10-07)
| Review point | What changed |
|---|---|
| README demo line said "TO FILL IN" and the repo link pointed to the feature branch | Links above: live demo and branch `main` |
| Design links open only with a Claude Design login | Wireframe and Hi-Fi exported as images (and the original HTML) in [`docs/design/`](docs/design), also attached on the Notion page |
| Dates shown as `26/09/08`; WM English format is `May 1, 2016` or `YYYY-MM-DD` | `formatShortDate` replaced by `formatDate` → `2026-09-08` in the table and the cards |
| Use the TanStack Query hook pattern in `src/hooks/API/<domain>/` for Homework 2 | Done in Homework 2 (`src/hooks/API/invitations/`); the HW1 list keeps its mock service |
| A few fixed values left in component partials | Skeleton widths moved to `_tokens.scss` (`$skeleton-table-widths`, `$skeleton-card-head-widths`); comments now name tokens (`$bp-md`, `$control-h-touch`) instead of pixel numbers |

Screenshots were retaken from the production build at all WM widths, now including 1600.

## What I built
**Screen** — `/doctors/invitations/list` inside the admin shell (header, sidebar with the current page marked).
Table columns: Doctor · Contact (masked `010-****-5678`) · Issued · Re-issues · Expiry (TBC) · Status · Manage.
Dates in the WM format `YYYY-MM-DD`.

**States**
- Loading: skeleton rows (cards on phones), `aria-busy`, "Loading invitations…".
- Filled: "18 invitations · Showing 1–8", 8 rows per page.
- No results: echoes the search ("Nothing matches "Kang Bo-ra" with status Pending.") + Clear search.
- Empty: "No invitations yet" (`?mock=empty`).
- Error: plain-language message + Retry; the search is kept (`?mock=error`). Never shown as an empty state.

**Interactions**
- Search by name or by the contact digits shown on screen (Enter or the Search button) + Status filter.
- Pagination (Previous / numbers / Next); a new search returns to page 1.
- Re-issue (count n → n+1) and Revoke ("Cannot be undone") in a native modal dialog: focus starts on Cancel,
  Esc cancels, busy label + spinner, then a toast (6s, pauses on hover/focus) and a 2s row highlight.
- Actions follow the status rules (Pending: Re-issue + Revoke + Edit · Used: Detail · Expired / Revoked: Re-issue).

**Responsive behaviour**
- ≥1440: 240px sidebar; 1920: content capped at 1200px and centred.
- 1024–1439: 200px sidebar, compact table density.
- <1024: sidebar becomes a drawer behind a **Menu** button (Esc, the dark background or a link closes it; closed
  links are skipped by Tab); the table scrolls sideways inside its own card.
- <768: the table becomes cards with 44px buttons, pagination becomes "Page 1 of 3", the dialog becomes a bottom sheet.

### Homework 1 requirements
- [x] One list screen from a design, with mock data — p.113c from the Hi-Fi, 18 mock invitations
- [x] Works at every size 1920 → 375 — measured at 10 widths, see [Responsive check](#responsive-check)
- [x] CLAUDE.md and skills — [`CLAUDE.md`](CLAUDE.md); skills check in [Prompts and skills](#prompts-and-skills-used)
- [x] Design check — [`docs/design-check.md`](docs/design-check.md)
- [x] Reuse of components — `PageHeader`, `StatusChip`, `Pagination`, `EmptyState`, `ErrorState`, `Toast`, one
      `ConfirmationDialog` for both actions; SCSS placeholders `%card-surface`, `%sidebar-link`, `%pagination-button`
- [x] WM naming — palette `colour + code` (`$blue-600`), semantic tokens, lowercase-hyphen classes,
      PascalCase components, `use*` hooks, UPPER_SNAKE_CASE constants
- [x] No hardcoded colours or numbers — raw values only in `_palette.scss`, `_tokens.scss`, `_mixins.scss`;
      breakpoints only through the mixins
- [x] Loading, empty and filled states — plus no-results and error

## How to run
Prerequisites: **Node.js 20+** and npm.

```bash
npm install
npm run dev
```
Open <http://localhost:3000/doctors/invitations/list> (`/` redirects there).

| To see | Do |
|---|---|
| Loading | Reload the page (the mock waits 0.8s) |
| Error state | <http://localhost:3000/doctors/invitations/list?mock=error> |
| Empty state | <http://localhost:3000/doctors/invitations/list?mock=empty> |
| No results | Search `Kang Bo-ra` with status **Pending** |
| Privacy-safe contact search | Search `5678` → only Dr. Kim Han-mi (Dr. Jung Min-seok's hidden middle digits 5678 are not searched) |

Checks (all pass with no warnings):
```bash
npx tsc --noEmit
npm run lint
npm run build   # stop `npm run dev` first: both use the .next folder
```
Manual test cases: [`docs/qa-checklist.md`](docs/qa-checklist.md).

## Project structure
```
src/
  app/(main)/doctors/invitations/list/   the list route (Server Component); (main) = admin shell layout
  components/layout/                     AdminShell (drawer state), AdminHeader, AdminSidebar
  components/common/                     reusable UI: PageHeader, StatusChip, Pagination, EmptyState, ErrorState, Toast
  components/invitations/                feature UI: list view, search bar, table, card, confirmation dialog
  hooks/                                 useInvitations (load), useInvitationActions (re-issue / revoke)
  services/                              invitationService: the only place that touches data (mock now, API later)
  types/  constants/  utils/  mocks/     data shapes, named values, pure helpers, 18 mock invitations
  styles/                                _palette, _tokens, _mixins + one partial per component
docs/                                    design check, QA checklist, screenshots
```

## Design source
Wireframe and Hi-Fi were made in **Claude Design** from the spec PDF pages **p.113b, p.113c and p.113e**, using
**Design System v1.11 (test)** (Surfing Bear: Pretendard, Phosphor icons). The Hi-Fi's `invitation-tokens.css`
is mirrored one to one in `src/styles/_tokens.scss`. Differences and open questions:
[`docs/design-check.md`](docs/design-check.md).

## How I worked
- **Lessons 1–4** (app shell, tokens, table, search and filter) — typed by hand in guided lessons with Claude (chat).
- **Lessons 5–8** (service + hook and states, pagination and dialogs, responsive layout, final audit) — implemented
  with **Claude Code** from detailed prompts. For each step I reviewed the plan before approving it and ran the
  manual tests. I committed Lessons 1–6 myself; for Lesson 7, the Hi-Fi alignment and this final step I asked
  Claude Code to commit and push for me after reviewing the changes.
- After Lesson 7, Claude Code compared the build with the Hi-Fi file component by component and fixed the gaps
  (card link labels, toast target size and timing, 44px touch targets, dialog tag, phone dialog and toast).

## Prompts and skills used
| Prompt | What it did |
|---|---|
| Claude Design — wireframe | Low-fidelity layout, hierarchy, notes and all states for list / create / detail / edit from p.113b, c, e |
| Claude Design — Hi-Fi | Same screens on Design System v1.11: tokens, components, responsive frames 1920 · 1024 · 768 · 375 |
| Claude Code — Lesson 5 | Service + hook pattern, mock scenarios, loading / empty / no-results / error states |
| Claude Code — Lesson 6 | Pagination, Re-issue / Revoke dialogs, toast and row highlight |
| Claude Code — Lesson 7 | Breakpoint mixins, drawer, cards, compact pagination, sidebar current-page style |
| Claude Code — Hi-Fi check | Compared the code with the Hi-Fi and wireframe and fixed every gap found |
| Claude Code — final | Quality audit (tokens, naming, reuse, unused code), CLAUDE.md, design check, QA checklist, README, verification |

**Skills:** official training skills are not available yet; `CLAUDE.md` holds the project rules. The project has
no `.claude/skills/`; the user-level folder only has a personal `weekly-report` skill and the built-in document
skills (docx, pdf, pptx, xlsx …) — none for design checks, so the design check was done by hand.

## Problem I hit and how I solved it
**Masked digits leaked through search.** The contact is shown as `010-****-5678`, but search first matched the full
number, so searching `5678` returned Dr. Kim Han-mi (`010-****-5678`) **and** Dr. Jung Min-seok, whose hidden
middle digits are 5678 (`010-5678-1357`) — the search revealed digits the screen hides. Fix: `filterInvitations`
builds the masked string with the same `maskMobile` used for display and matches only those visible digits. A
search for the full number now needs the server (noted in the design check).

Two more:
- **404 on the list page** — the route-group folder was named `main` instead of `(main)`, so it became part of the
  URL (`/main/doctors/...`). Renaming it to `(main)` keeps the shared layout without changing the URL.
- **Sass deprecation warnings** — the global `length()` / `nth()` functions are deprecated in Dart Sass;
  `@use "sass:list"` with `list.length()` / `list.nth()` removed the warnings from the build.
- (Bonus) **"Failed to load chunk" in dev** — running `npm run build` while `npm run dev` was running overwrote the
  shared `.next` folder. Stop the dev server before building (now in CLAUDE.md).

## Responsive check
Measured in headless Chrome at each width (page `scrollWidth` vs viewport) and in DevTools device mode.

| Width | Layout | Result | Screenshot |
|---|---|---|---|
| 1920 | 240px sidebar, content capped and centred | No sideways scroll | [docs/screenshots/w1920.png](docs/screenshots/w1920.png) |
| 1600 | 240px sidebar | No sideways scroll | [docs/screenshots/w1600.png](docs/screenshots/w1600.png) |
| 1440 | 240px sidebar | No sideways scroll | [docs/screenshots/w1440.png](docs/screenshots/w1440.png) |
| 1366 | 200px sidebar, compact table | No sideways scroll | [docs/screenshots/w1366.png](docs/screenshots/w1366.png) |
| 1280 | 200px sidebar, compact table | No sideways scroll | [docs/screenshots/w1280.png](docs/screenshots/w1280.png) |
| 1024 | 200px sidebar, all columns fit | No sideways scroll | [docs/screenshots/w1024.png](docs/screenshots/w1024.png) |
| 991 | Menu drawer, table fits | No sideways scroll | [docs/screenshots/w991.png](docs/screenshots/w991.png) |
| 768 | Menu drawer, table scrolls inside its card | No sideways scroll | [docs/screenshots/w768.png](docs/screenshots/w768.png) |
| 640 | Cards, "Page 1 of 3" | No sideways scroll | [docs/screenshots/w640.png](docs/screenshots/w640.png) |
| 480 | Cards | No sideways scroll | [docs/screenshots/w480.png](docs/screenshots/w480.png) |
| 375 | Cards, bottom-sheet dialog | No sideways scroll | [docs/screenshots/w375.png](docs/screenshots/w375.png) |

Screenshots are from the production build (`npm run build && npm run start`).

## Known limitations and Homework 2 next steps
From [`docs/design-check.md`](docs/design-check.md):
- Issue invitation, Detail and Edit links lead to Homework 2 screens and **404 for now**; so do the other sidebar sections.
- Contact search matches only the visible digits; full-number search needs the server.
- Expiry after re-issue is mocked as 14 days — the validity period is TBC (S12 ▸ INVITATION).
- After Revoke the Revoke button disappears, so focus cannot return to it.
- Re-issued / revoked rows stay in a filtered list until the next search (intentional).
- The action failure message exists but cannot be triggered with the mock.
- Open designer questions: rows per page (8 vs 20), date format, drawer breakpoint, scroll-hint range, Detail
  action on Expired/Revoked cards; reviewer question: PrimeReact vs custom components.
- **Homework 2:** Issue invitation (p.113b), Detail + history (p.113e), Edit (extension), and the real API behind
  `invitationService`.
