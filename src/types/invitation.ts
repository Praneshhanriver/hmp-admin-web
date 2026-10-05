// The four token states from the spec (S08 ②, p.113c ⑤)
export type InvitationStatus = "pending" | "used" | "expired" | "revoked";

// Row actions that need a confirmation dialog
export type InvitationAction = "reissue" | "revoke";

// One doctor invitation, shaped like the Hi-Fi "Data shape" (C-00).
// History is added in Homework 2 with the detail screen.
export interface Invitation {
  id: string;
  doctorName: string | null; // null → shown as "No information"
  email: string | null;
  mobile: string | null; // full number; masked when displayed
  status: InvitationStatus;
  issuedAt: string; // ISO 8601
  expiresAt: string; // ISO 8601 · validity period still TBC
  reissueCount: number;
}

// The Status dropdown adds "all" to the four real statuses
export type StatusFilter = InvitationStatus | "all";

// What the admin searched for
export interface InvitationFilters {
  query: string;
  status: StatusFilter;
}