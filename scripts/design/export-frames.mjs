// Exports every frame of the Claude Design board (public/design/*.html) as a PNG, one file per frame id.
// Usage: node scripts/design/export-frames.mjs public/design/hifi.html docs/design/frames/hifi
// The frame ids and file names come from FRAMES below; a frame missing from the board is reported, not skipped.
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const FRAMES = {
  "1a": "invitation-list-filled",
  "1b": "issue-doctor-invitation",
  "1c": "invitation-detail-history",
  "1d": "edit-invitation",
  "1e": "revoke-confirmation",
  "1f": "re-issue-confirmation",
  "2a": "list-loading",
  "2b": "list-empty-result",
  "2c": "list-error",
  "2d": "list-success-after-re-issue",
  "2e": "list-success-after-revoke",
  "2f": "create-success",
  "2g": "create-validation-error",
  "2h": "create-submitting",
  "2i": "create-server-error",
  "2j": "edit-validation-error",
  "2k": "edit-saving",
  "2l": "edit-success",
  "2m": "detail-loading",
  "2n": "detail-error",
  "2o": "revoke-in-progress",
  "2p": "detail-not-found",
  "3a": "1920-list",
  "3b": "1024-list",
  "3c": "768-list",
  "3d": "375-list-cards",
  "3e": "375-loading-empty-error",
  "3f": "375-create-validation",
  "3g": "375-edit",
  "3h": "375-detail",
  "3i": "375-revoke-confirmation",
  "3j": "375-success-after-revoke",
  "3k": "375-long-name",
};

const [board, outDir] = process.argv.slice(2);
if (!board || !outDir) {
  console.error("Usage: node scripts/design/export-frames.mjs <board.html> <out dir>");
  process.exit(1);
}
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 4300, height: 2000 } });
await page.goto(pathToFileURL(resolve(board)).href);
await page.waitForSelector(`[id="1a"]`, { timeout: 60_000 }); // the board has rendered
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(1500);

let missing = 0;
for (const [id, name] of Object.entries(FRAMES)) {
  const frame = page.locator(`[id="${id}"]`);
  if ((await frame.count()) === 0) {
    console.warn(`missing frame ${id}`);
    missing += 1;
    continue;
  }
  await frame.screenshot({ path: `${outDir}/${id}-${name}.png`, animations: "disabled" });
  console.log(`${id}-${name}.png`);
}
await browser.close();
process.exit(missing ? 2 : 0);
