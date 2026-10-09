# Playwright HTML reports — execution evidence

Run on 9 Oct 2026 against the **live demo** (`PLAYWRIGHT_BASE_URL=https://hmp-admin-web.vercel.app`, API on Render),
Chromium (Playwright 1.63), web `main` (`34925fe`) and API `main` (`e8c615f`), after the design and QA review fixes.

| Suite | Result | Open in the browser | Zip |
|---|---|---|---|
| Read-only — `e2e/invitations.spec.ts` (`npm run test:e2e`) | 26 passed (2.7m) | [read-only report](https://hmp-admin-web.vercel.app/test-reports/read-only/index.html) | [zip](playwright-report-read-only-2026-10-09.zip) |
| Mutation — `e2e/invitations.mutation.spec.ts` (`npm run test:e2e:mutation`) | 7 passed (56.8s) | [mutation report](https://hmp-admin-web.vercel.app/test-reports/mutation/index.html) | [zip](playwright-report-mutation-2026-10-09.zip) |

The same reports are served from `public/test-reports/`. To open a zip: unzip it and open `index.html`, or run
`npx playwright show-report <folder>`. The mutation run leaves one `E2E test row <number> (auto-revoked)` invitation,
always **Revoked**, in the demo data until the API restarts.
