// Captures the built screens as evidence images and puts them next to the Hi-Fi frames.
//   docs/screenshots/hw2/     list / create / detail / edit at the ten WM widths (<screen>-w<width>.png, full page),
//                             the Re-issue / Revoke dialogs and the loading / error / validation states
//   docs/design/compare/      one page per screen: "Design" (Hi-Fi frame PNG from docs/design/frames/hifi)
//                             beside "Build" (a fresh screenshot of the same screen or state)
// Usage: node scripts/design/capture-build.mjs [hw2|compare]   (no argument = both)
// Needs the web app on http://localhost:3000 (WEB_URL to change it) and the API on :8080 with the demo data.
// Read-only: dialogs are opened, never confirmed; loading, errors and the server error are made with page.route
// in the browser, and every other write request to the API is blocked.
import { chromium } from "@playwright/test";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("../..", import.meta.url));
const WEB = process.env.WEB_URL ?? "http://localhost:3000";
const HW2_DIR = resolve(ROOT, "docs/screenshots/hw2");
const COMPARE_DIR = resolve(ROOT, "docs/design/compare");
const FRAMES_DIR = resolve(ROOT, "docs/design/frames/hifi");

const WIDTHS = [1920, 1600, 1366, 1280, 1024, 991, 768, 640, 480, 375];
const DETAIL_ID = 5; // Dr. Jung Min-seok, Pending with 2 re-issues: the invitation Hi-Fi 1c / 3h show
const EDIT_ID = 1; // Dr. Kim Han-mi, Pending
const DIALOG_DOCTOR = "Dr. Kim Han-mi";
const SERVER_ERROR = {
  status: 500,
  code: "INTERNAL_ERROR",
  detail: "Something went wrong on our side. Please try again in a moment.",
  errors: [],
};

const PATHS = {
  list: "/doctors/invitations/list",
  create: "/doctors/invitations/create",
  detail: `/doctors/invitations/details/${DETAIL_ID}`,
  edit: `/doctors/invitations/edit/${EDIT_ID}`,
};

// API requests the browser makes (the API is on another origin)
const isList = (url) => url.pathname === "/api/v1/admin/doctor-invitations";
const isDetail = (url) => url.pathname === `/api/v1/admin/doctor-invitations/${DETAIL_ID}`;
const never = new Promise(() => {}); // a held request keeps the screen loading

// ---------- page setups: each one leaves the page showing what the image needs ----------

async function ready(page) {
  await page.getByRole("heading", { level: 1 }).waitFor();
  await page.waitForLoadState("networkidle");
  await page.waitForFunction(() => !document.querySelector("[aria-busy=true]"));
}

const open = (path) => async (page) => {
  await page.goto(WEB + path);
  await ready(page);
};

const openDialog = (action) => async (page) => {
  await open(PATHS.list)(page);
  // Table on desktop, card on phones: click the one that is visible
  const button = page.getByRole("button", { name: `${action} invitation for ${DIALOG_DOCTOR}` }).filter({ visible: true }).first();
  // Phones: bring the doctor's card to the top, so the dimmed page behind the dialog shows it (as in Hi-Fi 3i)
  await button.evaluate((element) => element.closest(".invitation-card")?.scrollIntoView({ block: "start" }));
  await button.click();
  await page.getByRole("alertdialog").waitFor();
};

async function fillCreateForm(page, name, email, mobile) {
  await page.getByLabel(/Doctor's name/).fill(name);
  await page.getByLabel(/Email/).fill(email);
  await page.getByLabel(/Mobile number/).fill(mobile);
  await page.getByRole("button", { name: "Issue invitation" }).click();
}

const STATES = {
  "state-list-loading": async (page) => {
    await page.route(isList, () => never);
    await page.goto(WEB + PATHS.list);
    await page.getByText("Loading invitations…").first().waitFor();
  },
  "state-list-error": async (page) => {
    await page.route(isList, (route) => route.fulfill({ status: 500, json: SERVER_ERROR }));
    await page.goto(WEB + PATHS.list);
    await page.getByRole("table").getByText("Unable to load invitations").waitFor();
  },
  "state-list-no-results": async (page) => {
    await open(`${PATHS.list}?q=Kang+Bo-ra&status=pending`)(page); // Dr. Kang Bo-ra is Used, so nothing matches
    await page.getByRole("table").getByText("No invitations found").waitFor();
  },
  "state-detail-loading": async (page) => {
    await page.route(isDetail, () => never);
    await page.goto(WEB + PATHS.detail);
    await page.locator("[aria-busy=true]").first().waitFor();
  },
  "state-detail-error": async (page) => {
    await page.route(isDetail, (route) => route.fulfill({ status: 500, json: SERVER_ERROR }));
    await page.goto(WEB + PATHS.detail);
    await page.getByText("Unable to load this invitation").waitFor();
  },
  "state-create-validation": async (page) => {
    await open(PATHS.create)(page);
    await fillCreateForm(page, "", "hanmi.kim@clinic", "010-12-5678"); // Hi-Fi 2g values; fails in the browser
    await page.getByText("3 fields need attention").waitFor();
  },
  "state-create-server-error": async (page) => {
    await page.route(isList, (route) =>
      route.request().method() === "POST" ? route.fulfill({ status: 500, json: SERVER_ERROR }) : route.continue(),
    );
    await open(PATHS.create)(page);
    await fillCreateForm(page, "Kim Han-mi", "hanmi.kim@clinic.example", "010-1234-5678"); // Hi-Fi 2i values
    await page.getByText("The invitation could not be issued").waitFor();
  },
};

// ---------- capture ----------

const browser = await chromium.launch();
const shots = new Map(); // one capture per key, shared by both outputs

async function shot(key, width, setup, { fullPage = true } = {}) {
  if (shots.has(key)) return shots.get(key);
  const context = await browser.newContext({
    viewport: { width, height: width >= 768 ? 900 : 800 },
    reducedMotion: "reduce",
  });
  // Safety net: nothing may change the demo data. A test's own page.route (POST mock) runs before this
  await context.route(
    (url) => url.pathname.startsWith("/api/"),
    (route) => {
      if (["GET", "OPTIONS"].includes(route.request().method())) return route.continue();
      console.warn(`blocked ${route.request().method()} ${route.request().url()}`);
      return route.abort();
    },
  );
  const page = await context.newPage();
  await setup(page);
  await page.evaluate(() => document.fonts.ready);
  const buffer = await page.screenshot({ fullPage, animations: "disabled", caret: "hide" });
  await context.close();
  shots.set(key, buffer);
  return buffer;
}

const screen = (name, width) => shot(`${name}@${width}`, width, open(PATHS[name]));
const state = (name, width = 1440) => shot(`${name}@${width}`, width, STATES[name]);
const dialog = (action, width) => shot(`dialog-${action}@${width}`, width, openDialog(action), { fullPage: false });

function save(dir, file, buffer) {
  writeFileSync(resolve(dir, file), buffer);
  console.log(relative(ROOT, resolve(dir, file)).replaceAll("\\", "/"));
}

// ---------- docs/screenshots/hw2 ----------

async function writeHw2() {
  mkdirSync(HW2_DIR, { recursive: true });
  for (const name of Object.keys(PATHS)) {
    for (const width of WIDTHS) save(HW2_DIR, `${name}-w${width}.png`, await screen(name, width));
  }
  save(HW2_DIR, "dialog-reissue-1440.png", await dialog("Re-issue", 1440));
  save(HW2_DIR, "dialog-revoke-1440.png", await dialog("Revoke", 1440));
  save(HW2_DIR, "dialog-revoke-375.png", await dialog("Revoke", 375));
  for (const name of Object.keys(STATES)) save(HW2_DIR, `${name}-1440.png`, await state(name));
}

// ---------- docs/design/compare ----------

const REAL = "real API";
const MOCKED = "API answer mocked in the browser";
const HELD = "API answer held back to show loading";
const COMPARE = [
  // file, title, Hi-Fi frame, build width, build capture, how the API answered
  ["list-1440", "Invitation list — filled · 1440", "1a-invitation-list-filled", 1440, () => screen("list", 1440), REAL],
  ["list-768", "Invitation list · 768", "3c-768-list", 768, () => screen("list", 768), REAL],
  ["list-375", "Invitation list (cards) · 375", "3d-375-list-cards", 375, () => screen("list", 375), REAL],
  ["create-1440", "Issue invitation · 1440", "1b-issue-doctor-invitation", 1440, () => screen("create", 1440), REAL],
  ["create-validation-375", "Issue invitation — validation · 375", "3f-375-create-validation", 375, () => state("state-create-validation", 375), REAL],
  ["detail-1440", "Invitation detail · history · 1440", "1c-invitation-detail-history", 1440, () => screen("detail", 1440), REAL],
  ["detail-375", "Invitation detail · 375", "3h-375-detail", 375, () => screen("detail", 375), REAL],
  ["edit-1440", "Edit invitation · 1440", "1d-edit-invitation", 1440, () => screen("edit", 1440), REAL],
  ["edit-375", "Edit invitation · 375", "3g-375-edit", 375, () => screen("edit", 375), REAL],
  ["dialog-reissue-1440", "Re-issue confirmation", "1f-re-issue-confirmation", 1440, () => dialog("Re-issue", 1440), REAL],
  ["dialog-revoke-1440", "Revoke confirmation", "1e-revoke-confirmation", 1440, () => dialog("Revoke", 1440), REAL],
  ["dialog-revoke-375", "Revoke confirmation · 375", "3i-375-revoke-confirmation", 375, () => dialog("Revoke", 375), REAL],
  ["state-list-loading-1440", "List — loading", "2a-list-loading", 1440, () => state("state-list-loading"), HELD],
  ["state-list-no-results-1440", "List — empty result", "2b-list-empty-result", 1440, () => state("state-list-no-results"), REAL],
  ["state-list-error-1440", "List — error", "2c-list-error", 1440, () => state("state-list-error"), MOCKED],
  ["state-create-validation-1440", "Create — validation error", "2g-create-validation-error", 1440, () => state("state-create-validation"), REAL],
  ["state-create-server-error-1440", "Create — server error", "2i-create-server-error", 1440, () => state("state-create-server-error"), MOCKED],
  ["state-detail-loading-1440", "Detail — loading", "2m-detail-loading", 1440, () => state("state-detail-loading"), HELD],
  ["state-detail-error-1440", "Detail — error", "2n-detail-error", 1440, () => state("state-detail-error"), MOCKED],
];

const dataUrl = (buffer) => `data:image/png;base64,${buffer.toString("base64")}`;
const escape = (text) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;");

function comparePage(title, frame, width, build, api) {
  const frameId = frame.split("-")[0];
  return `<!doctype html><html><head><meta charset="utf-8"><style>
  body { margin: 0; padding: 24px; background: #f0f3f8; color: #0f172a;
         font-family: Pretendard, "Segoe UI", system-ui, sans-serif; }
  h1 { margin: 4px 0 24px; font-size: 24px; font-weight: 500; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; align-items: start; }
  .card { background: #fff; border: 1px solid #dbe1ea; border-radius: 12px; padding: 16px; }
  h2 { margin: 0 0 4px; font-size: 20px; }
  p { margin: 0 0 12px; font-size: 14px; color: #475569; }
  img { display: block; width: 100%; border: 1px solid #e2e8f0; }
</style></head><body>
  <h1>${escape(title)}</h1>
  <div class="grid">
    <section class="card"><h2>Design</h2><p>Claude Design Hi-Fi, frame ${frameId}</p>
      <img src="${dataUrl(readFileSync(resolve(FRAMES_DIR, `${frame}.png`)))}" alt=""></section>
    <section class="card"><h2>Build</h2><p>Implemented screen at ${width}px (production build, ${api})</p>
      <img src="${dataUrl(build)}" alt=""></section>
  </div>
</body></html>`;
}

async function writeCompare() {
  mkdirSync(COMPARE_DIR, { recursive: true });
  for (const [file, title, frame, width, capture, api] of COMPARE) {
    const html = comparePage(title, frame, width, await capture(), api);
    // Desktop pairs get a wide page so each side is shown near its real size; phone / tablet pairs a narrow one
    const page = await browser.newPage({ viewport: { width: width >= 1440 ? 3000 : 1400, height: 400 } });
    await page.setContent(html, { waitUntil: "load" });
    save(COMPARE_DIR, `${file}.png`, await page.screenshot({ fullPage: true }));
    await page.close();
  }
}

const only = process.argv[2];
try {
  if (!only || only === "hw2") await writeHw2();
  if (!only || only === "compare") await writeCompare();
} finally {
  await browser.close();
}
