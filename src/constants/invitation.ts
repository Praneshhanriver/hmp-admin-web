import type { InvitationFilters, InvitationFormValues, StatusFilter } from "@/types/invitation";

// Every invitation screen (route group (main) is not part of the URL)
export const ROUTES = {
  list: "/doctors/invitations/list",
  create: "/doctors/invitations/create",
  detail: (id: number) => `/doctors/invitations/details/${id}`,
  edit: (id: number) => `/doctors/invitations/edit/${id}`,
} as const;

// Pagination always starts here, and every new search returns to it
export const FIRST_PAGE = 1;

// Shown when the invitation has no name or no contact (p.113c ②: never hidden)
export const MISSING_NAME_LABEL = "No information";
export const MISSING_CONTACT_LABEL = "-";
export const MISSING_CONTACT_SPOKEN = "No contact information"; // what a screen reader hears for "-"

// Rows per page, sent to the API as ?size=. The Hi-Fi shows 8 per page (18 results → 3 pages).
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

// Empty Issue invitation form
export const EMPTY_FORM_VALUES: InvitationFormValues = { doctorName: "", email: "", mobile: "" };

// Form limits. Must match the backend InvitationRequest (@Size / @Pattern)
export const DOCTOR_NAME_MIN_LENGTH = 2;
export const DOCTOR_NAME_MAX_LENGTH = 50;
export const EMAIL_MAX_LENGTH = 100;
export const SEARCH_MAX_LENGTH = 50;

// How long the success toast and the updated-row highlight stay visible
export const TOAST_DURATION_MS = 6000; // Hi-Fi: at least 6 s, paused on hover/focus
export const ROW_HIGHLIGHT_MS = 2000;

// API calls. The free Render server sleeps when idle; waking it took 143 s when measured (8 Oct),
// so the first request waits up to 3 minutes instead of showing the error state
export const API_REQUEST_TIMEOUT_MS = 180000;
export const QUERY_RETRY_COUNT = 1; // one quiet retry before the error state
export const QUERY_STALE_TIME_MS = 30000; // a list loaded in the last 30 s is shown without reloading
