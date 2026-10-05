import type { InvitationFilters, StatusFilter } from "@/types/invitation";

// Pagination always starts here, and every new search returns to it
export const FIRST_PAGE = 1;

// Shown when the invitation has no name or no contact (p.113c ②: never hidden)
export const MISSING_NAME_LABEL = "No information";
export const MISSING_CONTACT_LABEL = "-";
export const MISSING_CONTACT_SPOKEN = "No contact information"; // what a screen reader hears for "-"

// Rows per page. The Hi-Fi shows 8 per page (18 results → 3 pages).
// Design-check question: the spec's admin lists use 20. Confirm with the designer.
export const INVITATION_PAGE_SIZE = 8;

// Options of the Status dropdown, in Hi-Fi order
export const STATUS_FILTER_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "pending", label: "Pending" },
  { value: "used", label: "Used" },
  { value: "expired", label: "Expired" },
  { value: "revoked", label: "Revoked" },
];

// Starting point: no search text, every status
export const EMPTY_FILTERS: InvitationFilters = { query: "", status: "all" };

// How long the success toast and the updated-row highlight stay visible
export const TOAST_DURATION_MS = 6000; // Hi-Fi: at least 6 s, paused on hover/focus
export const ROW_HIGHLIGHT_MS = 2000;