import { expect, test } from "@playwright/test";
import type { Page, Route } from "@playwright/test";

// Doctor invitations: read-only checks against the real API (hmp-admin-api with its demo data).
// Nothing here creates, edits or revokes data; that is in invitations.mutation.spec.ts.
// Loading / empty / error are forced by intercepting the list request in the browser.

const LIST_URL = "/doctors/invitations/list";

// The list request goes from the browser to the API: GET /api/v1/admin/doctor-invitations?page=1&size=8
const isListRequest = (url: URL) => url.pathname === "/api/v1/admin/doctor-invitations";

function table(page: Page) {
  return page.getByRole("table");
}

function rows(page: Page) {
  return table(page).locator("tbody tr");
}

async function search(page: Page, text: string, status = "All statuses") {
  await page.getByLabel("Search by doctor name or contact").fill(text);
  await page.getByLabel("Status").selectOption({ label: status });
  await page.getByRole("button", { name: "Search", exact: true }).click();
}

test.describe("Invitation list", () => {
  test("opens with the title, the count and one page of rows", async ({ page }) => {
    await page.goto(LIST_URL);

    await expect(page).toHaveTitle("Doctor Invitations · HMP Administration");
    await expect(page.getByRole("heading", { level: 1, name: "Doctor Invitations" })).toBeVisible();
    await expect(page.getByText(/^\d[\d,]* invitations?$/)).toBeVisible();
    await expect(rows(page)).toHaveCount(8); // INVITATION_PAGE_SIZE
    // Contact is masked; dates follow the WM format YYYY-MM-DD
    await expect(table(page)).toContainText("010-****-");
    await expect(rows(page).first().locator("td").nth(1)).toHaveText(/^\d{4}-\d{2}-\d{2}$/);
  });

  test("searches by doctor name and keeps the search in the URL", async ({ page }) => {
    await page.goto(LIST_URL);
    await search(page, "Kim Han-mi");

    await expect(page).toHaveURL(/q=Kim\+Han-mi/);
    await expect(rows(page)).toHaveCount(1);
    await expect(rows(page).first()).toContainText("Dr. Kim Han-mi");
    await expect(page.getByText("1 invitation", { exact: true })).toBeVisible();

    // A reload shows the same results (the search lives in the URL)
    await page.reload();
    await expect(page.getByLabel("Search by doctor name or contact")).toHaveValue("Kim Han-mi");
    await expect(rows(page)).toHaveCount(1);
  });

  test("contact search never matches the hidden middle digits", async ({ page }) => {
    await page.goto(LIST_URL);
    // Dr. Kim Han-mi is 010-1234-5678 (shown 010-****-5678); Dr. Lee Seo-jun is shown 010-****-1234
    await search(page, "1234");

    await expect(table(page)).toContainText("Dr. Lee Seo-jun");
    await expect(table(page)).not.toContainText("Dr. Kim Han-mi");
  });

  test("filters by status", async ({ page }) => {
    await page.goto(LIST_URL);
    await search(page, "", "Revoked");

    await expect(page).toHaveURL(/status=revoked/);
    const chips = table(page).locator(".status-chip");
    await expect(chips.first()).toBeVisible();
    for (const chip of await chips.all()) {
      await expect(chip).toHaveText("Revoked");
    }
  });

  test("shows no results with the search echoed back, and Clear search", async ({ page }) => {
    await page.goto(LIST_URL);
    await search(page, "Kang Bo-ra", "Pending");

    await expect(table(page).getByText("No invitations found")).toBeVisible();
    await expect(table(page)).toContainText("Nothing matches “Kang Bo-ra” with status Pending.");

    await table(page).getByRole("button", { name: "Clear search" }).click();
    await expect(rows(page)).toHaveCount(8);
    await expect(page.getByLabel("Search by doctor name or contact")).toHaveValue("");
  });

  test("pages through the results", async ({ page }) => {
    await page.goto(LIST_URL);
    const pagination = page.getByRole("navigation", { name: "Pagination" }).first();

    await pagination.getByRole("button", { name: "Next" }).click();

    await expect(page).toHaveURL(/page=2/);
    await expect(pagination.getByRole("button", { name: "Page 2, current page" })).toHaveAttribute("aria-current", "page");
    await expect(page.getByText(/Showing\s*9–/)).toBeVisible();
  });

  test("shows a loading skeleton while the API answers", async ({ page }) => {
    let release: () => void = () => {};
    const answered = new Promise<void>((resolve) => (release = resolve));
    await page.route(isListRequest, async (route: Route) => {
      await answered;
      await route.continue();
    });

    await page.goto(LIST_URL);
    await expect(table(page)).toHaveAttribute("aria-busy", "true");
    await expect(page.getByText("Loading invitations…")).toBeVisible();

    release();
    await expect(table(page)).toHaveAttribute("aria-busy", "false");
    await expect(rows(page)).toHaveCount(8);
  });

  test("shows the empty state when there are no invitations at all", async ({ page }) => {
    await page.route(isListRequest, (route) =>
      route.fulfill({ json: { content: [], page: 1, size: 8, totalElements: 0, totalPages: 0 } }),
    );
    await page.goto(LIST_URL);

    await expect(table(page).getByText("No invitations yet")).toBeVisible();
    await expect(page.getByText("0 invitations")).toBeVisible();
  });

  test("shows the API's error message with Retry, then recovers", async ({ page }) => {
    await page.route(isListRequest, (route) =>
      route.fulfill({
        status: 500,
        json: {
          status: 500,
          code: "INTERNAL_ERROR",
          detail: "Something went wrong on our side. Please try again in a moment.",
          errors: [],
        },
      }),
    );
    await page.goto(`${LIST_URL}?q=Kim`);

    // Scoped to the table: the card list repeats the message for phones, and Next adds its own route announcer
    const alert = table(page).getByRole("alert");
    await expect(alert).toContainText("Unable to load invitations");
    await expect(alert).toContainText("Something went wrong on our side. Please try again in a moment. Your search is kept.");
    await expect(page.getByText("No invitations yet")).toHaveCount(0); // an error is never an empty state

    await page.unroute(isListRequest);
    await alert.getByRole("button", { name: "Retry" }).click();
    await expect(rows(page).first()).toContainText("Kim");
    await expect(page.getByLabel("Search by doctor name or contact")).toHaveValue("Kim");
  });

  test("shows a plain message when the server cannot be reached", async ({ page }) => {
    await page.route(isListRequest, (route) => route.abort("connectionrefused"));
    await page.goto(LIST_URL);

    await expect(table(page).getByRole("alert")).toContainText("We can't reach the server. Check your connection and try again.");
  });
});

test.describe("Invitation detail", () => {
  test("shows the facts and the history, oldest first", async ({ page }) => {
    await page.goto(LIST_URL);
    await search(page, "Park Ji-ho");
    await table(page).getByRole("link", { name: "View invitation detail for Dr. Park Ji-ho" }).first().click();

    await expect(page).toHaveTitle("Invitation detail · HMP Administration");
    await expect(page.getByText("Read-only. Re-issue and revoke are done from the invitation list.")).toBeVisible();
    await expect(page.locator(".invitation-detail-facts")).toContainText("Dr. Park Ji-ho");
    await expect(page.getByText("010-****-8765")).toBeVisible();
    await expect(page.locator(".invitation-detail-facts")).toContainText("Expired"); // status chip in the facts
    // Issued on: WM format YYYY-MM-DD, as in the Hi-Fi
    await expect(page.locator(".invitation-detail-facts dd").nth(3)).toHaveText(/^\d{4}-\d{2}-\d{2}$/);

    const history = page.locator(".invitation-history-item");
    await expect(history).toHaveCount(3);
    await expect(history.nth(0)).toContainText("Issued");
    await expect(history.nth(1)).toContainText("Re-issued");
    await expect(history.nth(2)).toContainText("Expired");
    await expect(history.nth(2)).toContainText("System");
    await expect(history.nth(0)).toContainText(/\d{2}:\d{2} (AM|PM)/);

    // Hi-Fi 1c has two: "← Back to the list" above the breadcrumb and the button below the history
    await expect(page.getByRole("link", { name: "Back to the list" })).toHaveCount(2);
    await page.getByRole("link", { name: "Back to the list" }).last().click();
    await expect(page).toHaveURL(/\/doctors\/invitations\/list/);
  });

  test("says when an invitation does not exist", async ({ page }) => {
    await page.goto("/doctors/invitations/details/999999");
    await expect(page.getByText("Invitation not found")).toBeVisible();

    await page.goto("/doctors/invitations/details/not-a-number");
    await expect(page.getByText("Invitation not found")).toBeVisible();
  });
});

test.describe("Issue invitation form", () => {
  test("requires every field and puts focus on the first problem", async ({ page }) => {
    await page.goto("/doctors/invitations/create");
    await expect(page).toHaveTitle("Issue Doctor Invitation · HMP Administration");
    await expect(page.getByRole("heading", { level: 1, name: "Issue Doctor Invitation" })).toBeVisible();

    await page.getByRole("button", { name: "Issue invitation" }).click();

    await expect(page.getByText("Enter the doctor's name.")).toBeVisible();
    await expect(page.getByText("Enter a valid email address, e.g. name@clinic.co.kr.")).toBeVisible();
    await expect(page.getByText("Enter a Korean mobile number, e.g. 010-1234-5678.")).toBeVisible();
    await expect(page.getByText("3 fields need attention")).toBeVisible(); // Hi-Fi 2g summary
    await expect(page.getByLabel(/Doctor's name/)).toBeFocused();
    await expect(page.getByLabel(/Doctor's name/)).toHaveAttribute("aria-invalid", "true");
  });

  test("checks length and format with the same rules as the backend", async ({ page }) => {
    await page.goto("/doctors/invitations/create");

    await page.getByLabel(/Doctor's name/).fill("K");
    await page.getByLabel(/Email/).fill("name@host");
    await page.getByLabel(/Mobile number/).fill("010-123");
    await page.getByRole("button", { name: "Issue invitation" }).click();

    await expect(page.getByText("The doctor's name must be 2 to 50 characters.")).toBeVisible();
    await expect(page.getByText("Enter a valid email address, e.g. name@clinic.co.kr.")).toBeVisible();
    await expect(page.getByText("Enter a Korean mobile number, e.g. 010-1234-5678.")).toBeVisible();

    // Messages update while typing after the first try
    await page.getByLabel(/Mobile number/).fill("01012345678");
    await expect(page.getByText("Enter a Korean mobile number, e.g. 010-1234-5678.")).toHaveCount(0);
    await expect(page.getByText("2 fields need attention")).toBeVisible();
  });

  test("shows the backend's own error under the field and keeps what was typed", async ({ page }) => {
    await page.goto("/doctors/invitations/create");

    // Dr. Kim Han-mi already has a Pending invitation, so the real API answers 409 and creates nothing
    await page.getByLabel(/Doctor's name/).fill("Dr. Kim Han-mi");
    await page.getByLabel(/Email/).fill("kim.hanmi@clinic.co.kr");
    await page.getByLabel(/Mobile number/).fill("010-1234-5678");
    await page.getByRole("button", { name: "Issue invitation" }).click();

    await expect(
      page.getByText("An invitation for this email is already waiting to be used. Re-issue it from the list instead."),
    ).toBeVisible();
    await expect(page.getByLabel(/Email/)).toBeFocused();
    await expect(page.getByLabel(/Doctor's name/)).toHaveValue("Dr. Kim Han-mi");
    await expect(page).toHaveURL(/\/create$/);

    // Changing the email clears the server's message for that field
    await page.getByLabel(/Email/).fill("someone.else@clinic.co.kr");
    await expect(page.getByText(/already waiting to be used/)).toHaveCount(0);
  });

  test("shows a server error without losing the input", async ({ page }) => {
    await page.route(
      (url) => url.pathname === "/api/v1/admin/doctor-invitations",
      (route) =>
        route.request().method() === "POST"
          ? route.fulfill({
              status: 500,
              json: { status: 500, code: "INTERNAL_ERROR", detail: "Something went wrong on our side. Please try again in a moment.", errors: [] },
            })
          : route.continue(),
    );
    await page.goto("/doctors/invitations/create");
    await page.getByLabel(/Doctor's name/).fill("Dr. Test Server Error");
    await page.getByLabel(/Email/).fill("server.error@clinic.co.kr");
    await page.getByLabel(/Mobile number/).fill("010-5555-0000");
    await page.getByRole("button", { name: "Issue invitation" }).click();

    // Hi-Fi 2i
    const banner = page.locator(".invitation-form").getByRole("alert");
    await expect(banner).toContainText("The invitation could not be issued");
    await expect(banner).toContainText("Nothing was sent to the doctor. Something went wrong on our side. Please try again in a moment.");
    await expect(page.getByLabel(/Email/)).toHaveValue("server.error@clinic.co.kr");
    await expect(page.getByRole("button", { name: "Issue invitation" })).toBeEnabled();
  });
});

test.describe("Edit invitation", () => {
  test("prefills a pending invitation and enables Save only after a change", async ({ page }) => {
    await page.goto(LIST_URL);
    await search(page, "Kim Han-mi");
    await table(page).getByRole("link", { name: "Edit invitation for Dr. Kim Han-mi" }).click();

    await expect(page).toHaveTitle("Edit invitation · HMP Administration");
    await expect(page.getByLabel(/Doctor's name/)).toHaveValue("Dr. Kim Han-mi");
    await expect(page.getByLabel(/Email/)).toHaveValue("kim.hanmi@clinic.co.kr");
    await expect(page.getByLabel(/Mobile number/)).toHaveValue("010-1234-5678");

    const save = page.getByRole("button", { name: "Save changes" });
    await expect(page.getByText("Editing an existing invitation")).toBeVisible();
    await expect(page.getByText("Dr. Kim Han-mi · pending invitation")).toBeVisible();
    await expect(save).toBeDisabled();
    await page.getByLabel(/Mobile number/).fill("010-1234-9999");
    await expect(save).toBeEnabled();
    // Not saved: the mutation test covers saving
  });

  test("refuses to edit an invitation that is no longer pending", async ({ page }) => {
    await page.goto(LIST_URL);
    await search(page, "Lee Seo-jun", "Used");
    await table(page).getByRole("link", { name: "View invitation detail for Dr. Lee Seo-jun" }).first().click();
    await expect(page).toHaveURL(/\/details\/\d+$/);

    await page.goto(page.url().replace("/details/", "/edit/"));
    await expect(page.getByText("This invitation can't be edited")).toBeVisible();
    await expect(page.getByText("Only pending invitations can be edited. This one is Used.")).toBeVisible();
  });
});

test.describe("Screen sizes", () => {
  const widths = [1920, 1366, 768, 375];

  for (const width of widths) {
    test(`no sideways scrolling at ${width}px on list, create and detail`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });

      for (const path of [LIST_URL, "/doctors/invitations/create", "/doctors/invitations/details/1"]) {
        await page.goto(path);
        await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
        await expect(page.locator("[aria-busy=true]")).toHaveCount(0); // data has arrived
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
        expect(overflow, `${path} at ${width}px`).toBeLessThanOrEqual(0);
      }
    });
  }

  test("shows cards instead of the table on phones", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await page.goto(LIST_URL);

    await expect(page.locator(".invitation-card").first()).toBeVisible();
    await expect(table(page)).toBeHidden();
  });
});
