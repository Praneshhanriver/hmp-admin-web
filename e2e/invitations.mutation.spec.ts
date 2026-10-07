import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

// MUTATION TEST: creates, edits, revokes (= deletes) and re-issues a real invitation through the UI and API.
// Not part of `npm run test:e2e`. Run on purpose: npm run test:e2e:mutation
// Uses a unique doctor each run, so it can run again without clean-up (the demo API resets on restart).

const LIST_URL = "/doctors/invitations/list";
const runId = Date.now();
const doctor = {
  name: `Dr. E2E Test ${runId}`,
  email: `e2e.${runId}@clinic.co.kr`,
  mobile: "01024681357", // no hyphens: the API stores "010-2468-1357"
};

test.describe.configure({ mode: "serial" }); // each step uses the invitation made by the one before

function row(page: Page) {
  return page.getByRole("table").locator("tbody tr").filter({ hasText: doctor.name });
}

async function findInList(page: Page) {
  await page.goto(LIST_URL);
  await page.getByLabel("Search by doctor name or contact").fill(doctor.name);
  await page.getByRole("button", { name: "Search", exact: true }).click();
  await expect(row(page)).toHaveCount(1);
}

function toast(page: Page) {
  return page.locator(".toast");
}

test("create: a new invitation appears in the list as Pending", async ({ page }) => {
  await page.goto(LIST_URL);
  await page.getByRole("link", { name: "Issue invitation" }).click();
  await expect(page).toHaveURL(/\/create$/);

  await page.getByLabel(/Doctor's name/).fill(doctor.name);
  await page.getByLabel(/Email/).fill(doctor.email);
  await page.getByLabel(/Mobile number/).fill(doctor.mobile);
  await page.getByRole("button", { name: "Issue invitation" }).click();

  await expect(page).toHaveURL(/\/doctors\/invitations\/list$/);
  await expect(toast(page)).toContainText("Invitation issued");
  await expect(toast(page)).toContainText(`${doctor.name} can now start sign-up from the link.`);

  await findInList(page);
  await expect(row(page)).toContainText("010-****-1357"); // masked, never the full number
  await expect(row(page)).toContainText("Pending");
  await expect(row(page).locator("td").nth(2)).toHaveText("0"); // re-issues
});

test("details: the new invitation has one history line", async ({ page }) => {
  await findInList(page);
  await row(page).getByRole("link", { name: `View invitation detail for ${doctor.name}` }).click();

  await expect(page.locator(".invitation-detail-facts")).toContainText(doctor.name);
  const history = page.locator(".invitation-history-item");
  await expect(history).toHaveCount(1);
  await expect(history.first()).toContainText("Issued");
  await expect(history.first()).toContainText("Current link");
  await expect(history.first()).toContainText("· admin@hmp.co.kr");
});

test("edit: the corrected details are saved, no new link is sent", async ({ page }) => {
  await findInList(page);
  await row(page).getByRole("link", { name: `Edit invitation for ${doctor.name}` }).click();

  await expect(page.getByLabel(/Mobile number/)).toHaveValue("010-2468-1357");
  await page.getByLabel(/Mobile number/).fill("010-2468-9999");
  await page.getByRole("button", { name: "Save changes" }).click();

  await expect(page).toHaveURL(/\/doctors\/invitations\/list$/);
  await expect(toast(page)).toContainText("Changes saved");
  await expect(toast(page)).toContainText("No new link was sent.");

  await findInList(page);
  await expect(row(page)).toContainText("010-****-9999");
  await expect(row(page).locator("td").nth(2)).toHaveText("0"); // Hi-Fi 1d: edit sends no new link
});

test("delete (revoke): the link stops working and the row stays as Revoked", async ({ page }) => {
  await findInList(page);
  await row(page).getByRole("button", { name: `Revoke invitation for ${doctor.name}` }).click();

  const dialog = page.getByRole("alertdialog", { name: "Revoke invitation?" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("button", { name: "Cancel" })).toBeFocused(); // safest choice first
  await dialog.getByRole("button", { name: "Revoke invitation" }).click();

  await expect(dialog).toBeHidden();
  await expect(toast(page)).toContainText("Invitation revoked");
  await expect(row(page)).toContainText("Revoked");
  await expect(row(page).getByRole("button", { name: `Revoke invitation for ${doctor.name}` })).toHaveCount(0);
});

test("re-issue: a revoked invitation goes back to Pending with a new link", async ({ page }) => {
  await findInList(page);
  await row(page).getByRole("button", { name: `Re-issue invitation for ${doctor.name}` }).click();

  const dialog = page.getByRole("alertdialog", { name: "Re-issue invitation?" });
  await expect(dialog).toContainText("0 → 1");
  await dialog.getByRole("button", { name: "Re-issue invitation" }).click();

  await expect(toast(page)).toContainText("Invitation re-issued");
  await expect(row(page)).toContainText("Pending");
  await expect(row(page).locator("td").nth(2)).toHaveText("1");
});

test("history lists every step, oldest first", async ({ page }) => {
  await findInList(page);
  await row(page).getByRole("link", { name: `View invitation detail for ${doctor.name}` }).click();

  const history = page.locator(".invitation-history-item");
  await expect(history).toHaveCount(4);
  await expect(history.nth(0)).toContainText("Issued");
  await expect(history.nth(1)).toContainText("Details updated");
  await expect(history.nth(2)).toContainText("Revoked");
  await expect(history.nth(3)).toContainText("Re-issued");
  await expect(history.nth(3)).toContainText("Current link");
});

test("a second invitation for the same email is refused by the API", async ({ page }) => {
  await page.goto("/doctors/invitations/create");
  await page.getByLabel(/Doctor's name/).fill(doctor.name);
  await page.getByLabel(/Email/).fill(doctor.email.toUpperCase()); // the API compares emails without case
  await page.getByLabel(/Mobile number/).fill("010-1357-2468");
  await page.getByRole("button", { name: "Issue invitation" }).click();

  await expect(page.getByText(/already waiting to be used/)).toBeVisible();
  await expect(page).toHaveURL(/\/create$/);
});
