# CLAUDE.md — hmp-admin-web

> If the official training CLAUDE.md template is provided, merge it into this file.

## Project
- HMP Telemedicine **Administration** web (Admin ADM-003, Doctor Invitation Management).
- Spec PDF pages: **p.113b** Issue invitation, **p.113c** Invitation list, **p.113e** Invitation detail.
  Design source: Claude Design wireframe + Hi-Fi ("Doctor Invitation CRUD"), Design System v1.11 (test).
- **Homework 1 (passed):** the invitation list — search + status filter, all states, pagination, dialogs, toast,
  responsive 1920 → 375.
- **Homework 2:** Issue (create), Detail + history, Edit (training extension), Delete (= revoke) on the real API.
- **Backend:** Spring Boot repo `hmp-admin-api` (sibling folder). API base `NEXT_PUBLIC_API_BASE_URL`
  (default `http://localhost:8080`), endpoints under `/api/v1/admin/doctor-invitations`. Errors are RFC 7807
  `{ status, code, detail, errors: [{ field, message }] }`.
- Docs: `docs/design-check.md` (open questions), `docs/qa-test-cases.md` (WM QA cases), `docs/build-report.md`
  (QA hand-over), `docs/error-messages.md` (every message, WM layout).

## Stack and commands
Next.js 15 (App Router, Turbopack) · React 19 · TypeScript (strict) · SCSS (Dart Sass modules) ·
Phosphor icons · Pretendard font. PrimeReact/PrimeIcons are installed but **not used** on this screen.

```bash
npm run dev        # http://localhost:3000/doctors/invitations/list
npx tsc --noEmit   # type check
npm run lint       # ESLint (next/core-web-vitals + typescript)
npm run build      # production build; must show no warnings
npm run test:e2e   # Playwright read-only tests (API + web must be running)
npm run test:e2e:mutation   # create / edit / revoke tests — changes data, run on purpose
```
Backend (in `../hmp-admin-api`): `./mvnw spring-boot:run` (port 8080, H2 in memory, 18 demo rows on every start),
`./mvnw verify` (tests).
`npm run build` and `npm run dev` share `.next/`. Never build while a dev server is running
(it breaks the dev server with "Failed to load chunk"); stop it first or build in a copy.

## Folder structure
```
src/app/                       routes only; "/" redirects to the list
src/app/(main)/                route group = admin shell layout, not part of the URL
  doctors/invitations/         list/, create/, details/[id]/, edit/[id]/ — each page.tsx is a Server Component
src/components/layout/         AdminShell (client), AdminHeader, AdminSidebar
src/components/common/         reusable: PageHeader, StatusChip, Pagination, EmptyState, ErrorState, Toast
src/components/providers/      QueryProvider (TanStack Query), ToastProvider (one toast for the whole admin)
src/components/invitations/    feature: list view, search bar, table, card, dialog, form, create/detail/edit views
src/api-services/              apiClient (axios + ApiError), InvitationService — the only files that call the API
src/hooks/API/invitations/     one TanStack hook per file: useGetInvitationsList, useGetInvitationDetail,
                               useCreateInvitation, useUpdateInvitation, useReissueInvitation, useDeleteInvitation
src/hooks/                     useInvitationActions (re-issue / revoke dialog flow)
src/types/                     Invitation, InvitationStatus, filters
src/constants/                 page size, labels, timings (UPPER_SNAKE_CASE)
src/utils/                     api-integration (API_ENDPOINTS, QUERIES), format, invitationValidation, invitationRules,
                               listParams (list search <-> URL), routeParams
e2e/                           invitations.spec.ts (read-only), invitations.mutation.spec.ts (changes data)
src/styles/                    _palette, _tokens, _mixins, components/ (one partial per component)
```

## Styling rules
- `_palette.scss` = raw colours named **colour + code** (`$blue-600`). Only `_tokens.scss` uses them.
- Components use **only semantic tokens** from `_tokens.scss` (`$color-primary`, `$space-md`, `$control-h-sm`).
- **No raw values** in component partials: no hex, px, rem, opacity numbers. Raw values are allowed only in
  `_palette.scss`, `_tokens.scss`, `_mixins.scss`. Plain CSS keywords are fine: `0`, `100%`, `50%` for centring,
  flex factors, `1fr`, `auto`, `nth-child(n)` (comment what column it is).
- **Breakpoints only via `_mixins.scss`**: `@include below($bp-sm)`, `from(...)`, `between($bp-md, $bp-lg)`.
  Desktop-first. `$bp-sm` 768 (cards below), `$bp-md` 1024 (drawer below), `$bp-lg` 1440 (narrow sidebar below).
- Shared looks are placeholders (`%card-surface` in `_mixins.scss`, `%sidebar-link`, `%pagination-button`) used with `@extend`.
- Class names **lowercase-hyphen**, prefixed by the component (`invitation-card-title`); state classes `is-*`.
- **One SCSS partial per component** in `src/styles/components/`, imported once in `src/app/globals.scss`.
- Use `sass:list` / `sass:math` module functions, never the deprecated globals.

## React / Next rules
- **Server Components by default.** Add `"use client"` only for state, effects, event handlers or browser hooks
  (`usePathname`). Keep the client part small; pass server content through `children`.
- Icons: `@phosphor-icons/react/dist/ssr` in files **without** `"use client"`; `@phosphor-icons/react` in client files.
- Props get a named `interface XxxProps`. No `any`.
- **Derived values are calculated, not stored** (count, total pages, page rows, isEmpty).
- **Immutable updates**: `map` / spread to replace items; never mutate state or cached data in place.
- **Effects** only for syncing with things outside React (fetch, timers, document listeners). Correct dependency
  array, always a cleanup (`clearTimeout`, `removeEventListener`). Data fetching is TanStack Query, not effects.
- User actions are handled in event handlers, not effects.
- Reset a component's internal state by changing its `key` (see `SearchBar`).

## Data rules
- **3 layers (Divii pattern)**: path in `API_ENDPOINTS` → axios call in `api-services/InvitationService` →
  TanStack hook in `hooks/API/invitations/`. Components only call hooks. No mock data.
- Server data lives in the TanStack cache only — never copy it into `useState`. Mutations invalidate
  `QUERIES.INVITATIONS.all` so lists and details reload by themselves.
- List search, status and page live in the URL (`?q=&status=&page=`); the page reads them and passes props.
- Every failure becomes an `ApiError` whose `message` is safe to show (the API's plain `detail`, or a fixed
  network message). **Never show raw error text.** Field errors (`fieldErrors`) go under their field.
- Form validation in `utils/invitationValidation.ts` must match the backend `InvitationRequest` exactly
  (same rules, order and words). Change both together.
- Dates: WM format — `YYYY-MM-DD` in tables/cards, `September 8, 2026` on detail, `… 08:33 PM` in history.
  Numbers: `formatNumber` (three-digit commas).
- **Error state is never an empty state.** Empty (no data) ≠ no results (filters) ≠ error.
- Contact is **masked everywhere** (`010-****-5678`); the list API already sends `maskedMobile`. Only the detail
  (for the edit form) has the full number. Missing → `-` (spoken "No contact information").
- The API's contact search matches **only the digits visible on screen**, so it never reveals masked digits.
- Delete = revoke (spec p.113c): `DELETE /{id}`, the row stays as Revoked.
- Actions by status come from `utils/invitationRules.ts` (Pending: Re-issue + Revoke + Edit; Used: Detail;
  Expired/Revoked: Re-issue). Don't hard-code status checks in components.

## Accessibility rules
- Labels always visible above fields; placeholders are examples only.
- Buttons do things (`<button type="button">`), links go places (`<Link>`). No icon-only actions.
- Row and card actions name the doctor in `aria-label` ("Revoke invitation for Dr. Kim Han-mi").
- `aria-current="page"` on the current nav item and page number; `aria-busy` while loading; table has a caption,
  `th scope="col"`, doctor name as `th scope="row"`.
- Dialogs: native `<dialog>` with `showModal()`, `role="alertdialog"`, focus starts on **Cancel**, Esc = Cancel,
  focus returns to the opener when it still exists.
- Status is never shown by colour alone: icon + word + border style.
- Targets at least **32px** (`$control-h-sm` 36) on desktop, **44px** (`$control-h-touch`) on phones.
- Closed drawer uses `visibility: hidden` so its links leave the Tab order. Respect `prefers-reduced-motion`.

## Workflow
1. Read the relevant files first. 2. Show a plan and **wait for approval** before writing.
3. Small steps. 4. After each change run `npx tsc --noEmit`, `npm run lint`, `npm run build` (no warnings).
5. Give the user a manual test list. 6. **Never commit or push** unless the user explicitly asks.

## Don'ts
- Don't add packages or remove them from `package.json` without asking.
- Don't put hex/px/breakpoint numbers in component styles, or inline `style={{}}` in components.
- Don't store derived values in state or fetch inside components.
- Don't show unmasked phone numbers or raw error text.
- Don't make `layout.tsx` or `page.tsx` client components.
- Don't add mock data or call axios outside `api-services/`.
- Don't run `*.mutation.spec.ts` against a shared server without telling the team.
