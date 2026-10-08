# Playwright HTML reports — execution evidence

Run on 8 Oct 2026 against the **live demo** (`PLAYWRIGHT_BASE_URL=https://hmp-admin-web.vercel.app`, API on Render),
Chromium (Playwright 1.63), web `main` and API `main` (`397c869`).

| Suite | Result | Open in the browser | Zip |
|---|---|---|---|
| Read-only — `e2e/invitations.spec.ts` (`npm run test:e2e`) | 24 passed (3.3m) | [read-only report](https://hmp-admin-web.vercel.app/test-reports/read-only/index.html) | [zip](playwright-report-read-only-2026-10-08.zip) |
| Mutation — `e2e/invitations.mutation.spec.ts` (`npm run test:e2e:mutation`) | 7 passed (1.5m) | [mutation report](https://hmp-admin-web.vercel.app/test-reports/mutation/index.html) | [zip](playwright-report-mutation-2026-10-08.zip) |

The same reports are served from `public/test-reports/`. To open a zip: unzip it and open `index.html`, or run
`npx playwright show-report <folder>`. The mutation run leaves one "Dr. E2E Test …" invitation (Pending, re-issued)
in the demo data until the API restarts.
