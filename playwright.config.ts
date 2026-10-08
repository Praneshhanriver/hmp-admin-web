import { defineConfig, devices } from "@playwright/test";

// Read-only tests. Tests that create, edit or delete data are *.mutation.spec.ts and are skipped here;
// run them on purpose with `npm run test:e2e:mutation` (playwright.mutation.config.ts).
// Never run mutation tests against a shared server without telling the team.
export default defineConfig({
  testDir: "./e2e",
  testIgnore: ["**/*.mutation.spec.ts"],
  fullyParallel: false, // one dev server and one API: keep it simple and predictable
  workers: 1,
  retries: 0,
  timeout: 60_000,
  expect: { timeout: 15_000 }, // the first visit compiles the page in dev mode
  reporter: [["list"], ["html", { open: "never", outputFolder: "playwright-report/read-only" }]],
  use: {
    // Local code by default. Set PLAYWRIGHT_BASE_URL to test the deployed demo instead
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "desktop-chrome", use: { ...devices["Desktop Chrome"], viewport: { width: 1366, height: 900 } } },
  ],
});
