# CLAUDE.md — hmp-admin-web

> If the official training CLAUDE.md template is provided, merge it into this file.

## Project
- HMP Telemedicine **Administration** web (Admin ADM-003, Doctor Invitation Management).
- Spec PDF pages: **p.113b** Issue invitation, **p.113c** Invitation list, **p.113e** Invitation detail.
  Design source: Claude Design wireframe + Hi-Fi ("Doctor Invitation CRUD"), Design System v1.11 (test).
- **Homework 1 (done):** the invitation list only — mock data, search + status filter, loading / empty /
  no-results / error states, pagination, Re-issue and Revoke dialogs, toast, responsive 1920 → 375.
- **Homework 2 (next):** Issue (create), Detail + history, Edit (training extension), real API.
  Links to those screens exist already and 404 until then.
- Open design questions live in `docs/design-check.md`; manual tests in `docs/qa-checklist.md`.

## Stack and commands
Next.js 15 (App Router, Turbopack) · React 19 · TypeScript (strict) · SCSS (Dart Sass modules) ·
Phosphor icons · Pretendard font. PrimeReact/PrimeIcons are installed but **not used** on this screen.

```bash
npm run dev        # http://localhost:3000/doctors/invitations/list
npx tsc --noEmit   # type check
npm run lint       # ESLint (next/core-web-vitals + typescript)
npm run build      # production build; must show no warnings
```
`npm run build` and `npm run dev` share `.next/`. Never build while a dev server is running
(it breaks the dev server with "Failed to load chunk"); stop it first or build in a copy.

## Folder structure
```
src/app/                       routes only; "/" redirects to the list
src/app/(main)/                route group = admin shell layout, not part of the URL
  doctors/invitations/list/    page.tsx (Server Component)
  # convention: list/, create/, details/[id]/, edit/[id]/
src/components/layout/         AdminShell (client), AdminHeader, AdminSidebar
src/components/common/         reusable: PageHeader, StatusChip, Pagination, EmptyState, ErrorState, Toast
src/components/invitations/    feature: InvitationListView, SearchBar, InvitationTable, InvitationCard, ConfirmationDialog
src/hooks/                     useInvitations (load list), useInvitationActions (re-issue / revoke flow)
src/services/                  invitationService — the only place that touches data
src/types/                     Invitation, InvitationStatus, filters
src/constants/                 page size, labels, timings (UPPER_SNAKE_CASE)
src/utils/                     pure helpers: maskMobile, formatShortDate, filterInvitations, invitationRules
src/mocks/                     18 mock invitations (replaced by the API in Homework 2)
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
- **Immutable updates**: `map` / spread to replace items; never mutate state or the mock store in place.
- **Effects** only for syncing with things outside React (fetch, timers, document listeners). Correct dependency
  array, always a cleanup (`clearTimeout`, `removeEventListener`, the `ignore` flag for stale requests).
- User actions are handled in event handlers, not effects.
- Reset a component's internal state by changing its `key` (see `SearchBar`).

## Data rules
- **Service + hook pattern**: components call hooks; hooks call `services/invitationService`; only the service
  reads mocks (later the API). Components never import `mocks/`.
- Mock scenarios via the URL: `?mock=error`, `?mock=empty` (parsed by `toMockScenario`).
- **Never show raw server errors**; show the plain-language ErrorState with Retry. Keep the search on retry.
- **Error state is never an empty state.** Empty (no data) ≠ no results (filters) ≠ error.
- Contact is **masked everywhere** (`010-****-5678`) via `maskMobile`; missing → `-` (spoken "No contact information").
- Search on contact matches **only the digits visible on screen**, so it never reveals masked digits.
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
- Don't build Homework 2 screens unless asked.
