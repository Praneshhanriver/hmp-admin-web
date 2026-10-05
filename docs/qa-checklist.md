# QA checklist — Doctor Invitation list

Run `npm run dev` and open <http://localhost:3000/doctors/invitations/list>.
Widths: Chrome DevTools device mode (Ctrl+Shift+M), "Responsive", type the width. Reload the page before each
section that changes data (the mock store lives in memory and resets on reload).
Fill in **Result** with ✅ / ❌ and a note.

## List, search and states

| ID | Area | Steps | Expected result | Result |
|---|---|---|---|---|
| L-01 | Default load | Open the page | Summary says "Loading invitations…", 6 grey skeleton rows, table has `aria-busy="true"`; after ~1s: "18 invitations", "Showing 1–8", 8 rows | |
| L-02 | Columns | Look at the table | Doctor, Contact, Issued, Re-issues (right-aligned), Expiry (TBC), Status, Manage. Contact masked `010-****-5678` | |
| L-03 | Missing data | Go to page 1, last row | "No information" in grey, contact "-" (screen reader: "No contact information") | |
| L-04 | Actions by status | Check the Manage column | Pending: Re-issue + Revoke + Edit · Used: Detail · Expired / Revoked: Re-issue | |
| S-01 | Search by name | Type `Kim Han-mi`, click Search | "1 invitation", only Dr. Kim Han-mi | |
| S-02 | Search by last 4 digits | Type `5678`, Search | Only Dr. Kim Han-mi (`010-****-5678`). Dr. Jung Min-seok (`010-5678-1357`) is **not** found: his 5678 is hidden | |
| S-03 | Masked digits never match | Type `1234`, Search | Only Dr. Lee Seo-jun (`010-****-1234`). Dr. Kim Han-mi is **not** found although her hidden middle digits are 1234 | |
| S-04 | Enter key | Type `Park`, press Enter | Same as clicking Search: "1 invitation", Dr. Park Ji-ho | |
| S-05 | Typing alone | Type `Oh` without pressing Search | List does not change until Search / Enter | |
| S-06 | Status filter | Clear the text, choose Pending, Search | "6 invitations", all chips Pending, no pagination (one page) | |
| S-07 | No results | Type `Kang Bo-ra`, status Pending, Search | "0 invitations", "No invitations found", Nothing matches **"Kang Bo-ra"** with status **Pending**, "Clear search" button | |
| S-08 | Clear search | On S-07 click Clear search | Text empty, status "All statuses", 18 invitations, page 1 | |
| S-09 | Pluralisation | S-01 result vs default | "1 invitation" (singular) vs "18 invitations" | |
| E-01 | Error state | Open `?mock=error` | "Results unavailable", red icon, "Unable to load invitations", plain text (no server error), Retry button; not the empty state | |
| E-02 | Retry keeps search | On `?mock=error` type `Kim`, Search, then Retry | Search box still shows `Kim` after each try; error shows again (the mock always fails) | |
| E-03 | Empty data | Open `?mock=empty` | "0 invitations", "No invitations yet" with the "Issue invitation" hint, no Clear search button, no pagination | |

## Pagination

| ID | Area | Steps | Expected result | Result |
|---|---|---|---|---|
| P-01 | First page | Default load | Previous disabled, page 1 filled blue with `aria-current="page"`, Next enabled | |
| P-02 | Next | Click Next twice | Page 3: "Showing 17–18", 2 rows, Next disabled | |
| P-03 | Page number | Click 2 | "Showing 9–16" | |
| P-04 | New search resets | On page 3 choose status All, click Search | Back to page 1, "Showing 1–8" | |
| P-05 | One page | Search `Kim` | No pagination shown | |

## Re-issue and Revoke

| ID | Area | Steps | Expected result | Result |
|---|---|---|---|---|
| R-01 | Open Re-issue | Click Re-issue on Dr. Kim Han-mi | Dialog "Re-issue invitation?", Re-issues **0 → 1**, three "What happens next" lines, focus on **Cancel**, page behind is dimmed | |
| R-02 | Esc | Press Esc | Dialog closes, nothing changes, focus back on that Re-issue button | |
| R-03 | Cancel | Open again, click Cancel | Same as R-02 | |
| R-04 | Confirm | Open again, click "Re-issue invitation" | Button shows spinner + "Re-issuing…", both buttons disabled, Esc ignored; then dialog closes | |
| R-05 | Result | After R-04 | Row: Pending, Re-issues 1, Issued = today; row briefly light blue (~2s); toast "Invitation re-issued — A new link was sent to Dr. Kim Han-mi. The previous link no longer works." | |
| V-01 | Open Revoke | Click Revoke on Dr. Jung Min-seok | Dialog with red tag "Cannot be undone", "Revoke invitation?", Re-issues 2 (no arrow), focus on Cancel | |
| V-02 | Confirm Revoke | Click "Revoke invitation" | "Revoking…", then row chip Revoked, only Re-issue left, toast "Invitation revoked — Dr. Jung Min-seok's link no longer works. No new link was sent." | |
| T-01 | Toast auto-hide | Wait after R-05 / V-02 | Toast disappears after ~6s | |
| T-02 | Toast pause | Trigger a toast, keep the mouse on it (or Tab to Dismiss) | Toast stays; leaves ~6s after the mouse/focus moves away | |
| T-03 | Dismiss | Click Dismiss | Toast closes at once | |
| T-04 | Reload resets | Reload the page | Mock data back to the start (Kim Han-mi Re-issues 0, Jung Min-seok Pending) | |
| N-01 | Sidebar active item | Look at the sidebar | "Invitations" has the light-blue fill and `aria-current="page"`; "Doctor management" bold with filled icon | |

## Responsive (no sideways page scroll at any width)

| ID | Width | Steps | Expected result | Result |
|---|---|---|---|---|
| W-01 | 1920 | Load | Sidebar 240px, content capped at 1200px and centred, no horizontal scrollbar | |
| W-02 | 1440 | Load | Sidebar 240px, full header (title, subtitle, email), no horizontal scrollbar | |
| W-03 | 1366 | Load | Sidebar 200px, compact table, no horizontal scrollbar | |
| W-04 | 1280 | Load | Sidebar 200px, no horizontal scrollbar | |
| W-05 | 1024 | Load | Sidebar 200px, all 7 columns visible, no horizontal scrollbar | |
| W-06 | 991 | Load | Menu button, "HMP Admin", "Account"; no sidebar; hint "Scroll the table sideways for Manage →"; no page scrollbar | |
| W-07 | 768 | Load, scroll the table | Table scrolls **inside its card only**, page does not scroll sideways; full pagination | |
| W-08 | 640 | Load | Cards instead of the table, "1–8 of 18", "Page 1 of 3", no horizontal scrollbar | |
| W-09 | 480 | Load | Same as 640, no horizontal scrollbar | |
| W-10 | 375 | Load | Cards, full-width Issue / Search buttons, 44px card buttons, "Page 1 of 3" with 44px Previous / Next, no horizontal scrollbar | |

## Drawer, keyboard and phone details

| ID | Area | Steps | Expected result | Result |
|---|---|---|---|---|
| D-01 | Open drawer | At 991 click Menu | Drawer slides in under the header, dark background, Menu `aria-expanded="true"` | |
| D-02 | Esc closes | Press Esc | Drawer closes | |
| D-03 | Scrim closes | Open, click the dark background | Drawer closes | |
| D-04 | Link closes | Open, click "Invitations" | Drawer closes | |
| D-05 | Tab skips closed drawer | Drawer closed, press Tab from the top | Focus goes Menu → HMP Admin → Account → page; never a sidebar link | |
| D-06 | Reduced motion | DevTools → Rendering → prefers-reduced-motion: reduce | Drawer opens without the slide | |
| M-01 | Cards at 375 | Check card for Dr. Kim Han-mi | Name + Pending chip, 4 facts in 2 columns, Re-issue + Revoke, footer "View detail" and "Edit details" | |
| M-02 | Card loading | Reload at 375 | 3 grey placeholder cards (name + chip, block, button) | |
| M-03 | Compact pagination | At 375 click Next | "Page 2 of 3", "9–16 of 18" | |
| M-04 | Dialog at 375 | Click Revoke on a Pending card | Dialog is a bottom sheet 8px from the sides, Revoke on top and Cancel below, both full width, focus on Cancel | |
| M-05 | Toast at 375 | Confirm M-04 | Toast 8px from both sides, 16px from the bottom | |
| M-06 | States at 375 | `?mock=error`, `?mock=empty`, search `Kang Bo-ra` + Pending | Message in a white box in place of the cards; Retry / Clear search full width, 44px | |
