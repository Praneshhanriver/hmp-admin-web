# QA test cases — Doctor Invitations (Admin ADM-003)

**Feature:** Doctor invitation list, issue, detail, edit, delete (revoke) and re-issue on the real API
**Spec:** p.113b Issue · p.113c List · p.113e Detail · Edit = training extension
**Build:** see [build-report.md](build-report.md) · **Format:** WM | QA Template — each case is a "Verify that …"
statement, positive scenario first, then the invalid and boundary cases (condition in brackets).
**Type:** every case is marked **Positive** (valid use, the feature works) or **Negative** (wrong input, missing data,
server or network error, boundary). 61 cases: 33 Positive · 27 Negative · 1 N/A (roles, no login).

**Before you start**
1. API running (`hmp-admin-api`, `./mvnw spring-boot:run`) or the demo API on Render (after a quiet period the first call can take up to 3 minutes).
2. Web running (`npm run dev`) and open <http://localhost:3000/doctors/invitations/list>.
3. Restart the API to get the 18 demo invitations back (6 Pending · 5 Used · 4 Expired · 3 Revoked).
4. Fill in **Result** with Pass / Fail + note. **Auto** = the Playwright test that covers the case
   (`R-n` = `e2e/invitations.spec.ts` test n, `M-n` = `e2e/invitations.mutation.spec.ts` test n).

---

## 1. Page opens

| ID | Type | Verify that … | Steps | Expected | Auto | Result |
|---|---|---|---|---|---|---|
| TC-01 | Positive | the list opens with the right title and data | Open the list | Tab title "Doctor Invitations · HMP Administration", H1 "Doctor Invitations", "18 invitations", 8 rows, sidebar "Invitations" marked current | R-1 | |
| TC-02 | Positive | contact and dates follow the rules | Look at any row | Contact masked `010-****-5678`; Issued / Expiry as `YYYY-MM-DD` (WM date format) | R-1 | |
| TC-03 | Negative | an invitation without details is still listed (missing data) | Filter Revoked | Row with "No information" (grey) and contact "-" (screen reader: "No contact information") | — | |
| TC-04 | Positive | actions follow the status | Look at the Manage column | Pending: Re-issue + Revoke + Edit · Used: Detail · Expired / Revoked: Re-issue | — | |
| TC-05 | Positive | `/` opens the list | Open <http://localhost:3000/> | Redirects to the list | — | |

## 2. Main flow (create → list → edit → delete) — data changes

| ID | Type | Verify that … | Steps | Expected | Auto | Result |
|---|---|---|---|---|---|---|
| TC-10 | Positive | an invitation can be issued (positive) | Issue invitation → name `Dr. QA Test`, email `qa.test@clinic.co.kr`, mobile `01024681357` → Issue invitation | Back on the list; toast "Invitation issued — Dr. QA Test can now start sign-up from the link."; new row on top, Pending, `010-****-1357`, Re-issues 0 | M-1 | |
| TC-11 | Positive | the new invitation's detail shows its history | Click the doctor's name | Facts card + History: "Issued · <YYYY-MM-DD hh:mm AM/PM> · admin@hmp.co.kr" with the "Current link" tag | M-2 | |
| TC-12 | Positive | a pending invitation can be edited, without sending a new link | Row → Edit → change mobile to `010-2468-9999` → Save changes | Toast "Changes saved — …details were updated. No new link was sent."; row shows `010-****-9999`, **Re-issues still 0**, same Issued / Expiry; history adds "Details updated" | M-3 | |
| TC-13 | Positive | delete (revoke) works and keeps the row as history | Row → Revoke → dialog → Revoke invitation | Dialog: "Cannot be undone", focus on Cancel. After: toast "Invitation revoked", chip Revoked, Revoke and Edit buttons gone, row still listed | M-4 | |
| TC-14 | Positive | a revoked invitation can be re-issued | Row → Re-issue → dialog shows "0 → 1" → Re-issue invitation | Toast "Invitation re-issued", chip Pending, Re-issues 1 | M-5 | |
| TC-15 | Positive | the history lists every step oldest first | Open the detail | Issued → Details updated → Revoked → Re-issued (Current link) | M-6 | |
| TC-16 | Positive | Cancel in a dialog changes nothing | Revoke → Cancel (or Esc) | Dialog closes, focus back on the Revoke button, nothing changed | — | |
| TC-17 | Negative | Issue cannot be sent twice (double click) | Fill the form, double-click Issue invitation | Button turns "Issuing…" and disabled; only one new row | — | |

## 3. Validation (browser and API use the same rules and words)

| ID | Type | Verify that … | Steps | Expected | Auto | Result |
|---|---|---|---|---|---|---|
| TC-20 | Negative | every field is required (empty fields) | Issue invitation with all fields empty | Red box "3 fields need attention"; under the fields "Enter the doctor's name." · "Enter a valid email address, e.g. name@clinic.co.kr." · "Enter a Korean mobile number, e.g. 010-1234-5678."; red border + icon + words; focus on Doctor's name | R-13 | |
| TC-21 | Negative | name length is checked (1 character) | Name `K` | "The doctor's name must be 2 to 50 characters." | R-14 | |
| TC-22 | Negative | name length is checked (51 characters) | Name of 51 characters | Same message | API test | |
| TC-23 | Negative | spaces around a value are ignored | Name `  K  ` | Counted as 1 character → length message (browser and API both trim) | API check | |
| TC-24 | Negative | email format is checked (wrong format) | Email `name@host` | "Enter a valid email address, e.g. name@clinic.co.kr." | R-14 | |
| TC-25 | Negative | email length is checked (more than 100 characters) | 101-character email | "The email address must be 100 characters or fewer." | API test | |
| TC-26 | Negative | mobile format is checked (wrong format) | Mobile `010-123`, `020-1234-5678`, `abc` | "Enter a Korean mobile number, e.g. 010-1234-5678." | R-14 | |
| TC-27 | Positive | mobile without hyphens is accepted | Mobile `01012345678` | Accepted; stored and shown as `010-1234-5678` | R-14, M-1 | |
| TC-28 | Positive | messages update while typing after the first try | After TC-26, type a valid mobile | Mobile message disappears without pressing the button again | R-14 | |
| TC-29 | Negative | the API refuses a second pending invitation (server error under the field) | Issue with `kim.hanmi@clinic.co.kr` (already Pending) | Under Email: "An invitation for this email is already waiting to be used. Re-issue it from the list instead."; focus on Email; typed values kept; still on the form | R-15, M-7 | |
| TC-30 | Negative | the API refuses a doctor who already signed up | Issue with `lee.seojun@clinic.co.kr` (Used) | Under Email: "A doctor with this email has already signed up. No new invitation is needed." | API test | |
| TC-31 | Positive | the server's field message clears when that field is changed | After TC-29, change Email | Message disappears | R-15 | |
| TC-32 | Negative | a server error keeps what was typed (server error) | Stop the API, fill the form, Issue invitation | Red box "The invitation could not be issued — Nothing was sent to the doctor. We can't reach the server. Check your connection and try again."; values kept; button enabled again | R-16 (HTTP 500 variant) | |
| TC-33 | Negative | email case does not create duplicates | Issue with `KIM.HANMI@CLINIC.CO.KR` | Same 409 message as TC-29 | M-7 | |

## 4. Edit rules

| ID | Type | Verify that … | Steps | Expected | Auto | Result |
|---|---|---|---|---|---|---|
| TC-40 | Positive | the edit form is prefilled | Pending row → Edit | Name, email and full mobile filled in; "Editing" tag, "Dr. … · pending invitation", dashed box "Editing an existing invitation" with Issued / Expiry / Re-issues and "…It does not send a new link" | R-17 | |
| TC-41 | Positive | Save stays disabled until something changes | Open Edit, change nothing | "Save changes" disabled; enabled after a change | R-17 | |
| TC-42 | Negative | a non-pending invitation cannot be edited | Open `/doctors/invitations/edit/<id of a Used row>` | "This invitation can't be edited — Only pending invitations can be edited. This one is Used." + Back to the list + View detail | R-18 | |
| TC-43 | Negative | leaving with unsaved changes asks first | Change a field, then close or reload the tab | Browser asks "Leave site?" | — | |
| TC-44 | Negative | the edit form uses the same rules as Issue (wrong values) | Pending row → Edit → clear the name, set email `name@host` → Save changes | "Enter the doctor's name." and "Enter a valid email address, e.g. name@clinic.co.kr." under the fields; nothing saved | — | |
| TC-45 | Negative | edit cannot give a pending invitation the email of another waiting one (server error) | Edit Dr. Kim Han-mi → email `seo.haeun@clinic.co.kr` (Dr. Seo Ha-eun, Pending) → Save changes | Under Email: "An invitation for this email is already waiting to be used. Re-issue it from the list instead."; values kept; nothing saved | — | |

## 5. List behaviour: search, filter, paging

| ID | Type | Verify that … | Steps | Expected | Auto | Result |
|---|---|---|---|---|---|---|
| TC-50 | Positive | search by name works | Search `Kim Han-mi` | "1 invitation", only Dr. Kim Han-mi; URL has `?q=Kim+Han-mi` | R-2 | |
| TC-51 | Positive | search by visible contact digits works | Search `5678` | Only Dr. Kim Han-mi (`010-****-5678`) | — | |
| TC-52 | Negative | hidden middle digits are never searched (privacy) | Search `1234` | Only Dr. Lee Seo-jun (`010-****-1234`); Dr. Kim Han-mi (hidden 1234) not found | R-3 | |
| TC-53 | Positive | status filter works | Status Revoked → Search | All chips "Revoked"; URL has `status=revoked` | R-4 | |
| TC-54 | Negative | no results echo the search | `Kang Bo-ra` + Pending → Search | "No invitations found — Nothing matches "Kang Bo-ra" with status Pending." + Clear search | R-5 | |
| TC-55 | Positive | Clear search resets everything | On TC-54 click Clear search | Empty field, All statuses, 8 rows, page 1 | R-5 | |
| TC-56 | Positive | paging works | Next / page 2 | Page 2 marked current, "Showing 9–16 of 18", URL `page=2` | R-6 | |
| TC-57 | Positive | the search survives reload and Back | Search, open a detail, press Back (or reload) | Same search, same page | R-2 | |
| TC-58 | Negative | a page past the end is handled (boundary) | Open `?page=99` | "This page has no invitations" + Go to page 1 | — | |
| TC-59 | Positive | sort order | Look at the list | Newest invitation first (by first issue date) | — | |
| TC-60 | Positive | list refreshes by itself after a change | Do TC-13 | Row updates without reloading the page | M-4 | |
| TC-61 | Negative | a name containing digits is not a contact search | Search `E2E` (after creating `Dr. E2E Test`) | Only names containing "E2E"; no doctor whose contact contains a 2 | API test | |

## 6. Roles

| ID | Type | Verify that … | Expected | Result |
|---|---|---|---|---|
| TC-70 | N/A | roles and permissions | **Not applicable** — the homework app has no login (one admin, `admin@hmp.co.kr`, written into the history) | N/A |

## 7. States: loading, empty, error

| ID | Type | Verify that … | Steps | Expected | Auto | Result |
|---|---|---|---|---|---|---|
| TC-80 | Positive | loading shows a skeleton, not old data | Open the list on a slow connection (DevTools → Network → Slow 4G) | "Loading invitations…", grey rows, table `aria-busy="true"` | R-7 | |
| TC-81 | Negative | empty data has its own message | (forced in the test) API returns no invitations | "0 invitations", "No invitations yet", no pagination | R-8 | |
| TC-82 | Negative | an API error shows the API's message with Retry | Make the API return 500 | "Unable to load invitations — Something went wrong on our side. Please try again in a moment. Your search is kept." + Retry; never the empty state | R-9 | |
| TC-83 | Positive | Retry recovers and keeps the search | On TC-82 fix the API, click Retry | Rows load; search text still there | R-9 | |
| TC-84 | Negative | API down shows a plain message (server error) | Stop the API, reload the list | "We can't reach the server. Check your connection and try again." + Retry | R-10 | |
| TC-85 | Negative | unknown or invalid detail id | Open `/details/999999` and `/details/abc` | "Invitation not found" + Back to the list (no API call for `abc`) | R-12 | |
| TC-86 | Negative | detail and edit have loading and error states | Slow 4G / stop API on a detail page | Skeleton card, then "Unable to load the invitation" + Retry | — | |
| TC-87 | Negative | dialog failure keeps the dialog open | Stop the API, Revoke → confirm | Dialog stays open with "We can't reach the server…"; Cancel still works | — | |

## 8. Screen sizes (WM widths)

| ID | Type | Verify that … | Steps | Expected | Auto | Result |
|---|---|---|---|---|---|---|
| TC-90 | Positive | no sideways scrolling at 1920 / 1440 / 1366 / 768 / 375 | DevTools device mode at each width on list, create, detail, edit | No horizontal page scroll, nothing overlapping or cut off; the table scrolls inside its card at 768 | R-19…23 | |
| TC-91 | Positive | phones show cards | 375 px list | Cards with 44 px buttons, "Page 1 of 3" paging | R-24 | |
| TC-92 | Positive | forms on phones | 375 px create / edit | Full-width fields; full-width buttons, main action on top | — | |
| TC-93 | Positive | all ten WM widths | 1920 · 1600 · 1366 · 1280 · 1024 · 991 · 768 · 640 · 480 · 375 | Matches `docs/screenshots/hw2/*-w<width>.png` | screenshots | |

## 9. Accessibility (spot checks)

| ID | Type | Verify that … | Expected | Result |
|---|---|---|---|---|
| TC-95 | Positive | keyboard only | Every action reachable with Tab / Enter / Esc; visible focus ring | |
| TC-96 | Positive | labels and errors | Labels always above fields; errors in words, linked with `aria-describedby`, field `aria-invalid` | |
| TC-97 | Positive | status never by colour alone | Chips show icon + word + border | |
