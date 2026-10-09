// Exports the whole Claude Design board (every section and frame) as one JPEG, for a quick look without a login.
// Usage: node scripts/design/export-board.mjs public/design/hifi.html docs/design/doctor-invitation-crud-hifi.jpg
import { chromium } from "@playwright/test";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const [board, out] = process.argv.slice(2);
if (!board || !out) {
  console.error("Usage: node scripts/design/export-board.mjs <board.html> <out.jpg>");
  process.exit(1);
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 4200, height: 2000 } });
await page.goto(pathToFileURL(resolve(board)).href);
await page.waitForSelector(`[id="1a"]`, { timeout: 60_000 });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(1500);
await page.screenshot({ path: out, fullPage: true, type: "jpeg", quality: 80, animations: "disabled" });
await browser.close();
console.log(out);
