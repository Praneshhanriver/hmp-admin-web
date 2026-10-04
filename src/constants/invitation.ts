import type { InvitationFilters, StatusFilter } from "@/types/invitation";

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