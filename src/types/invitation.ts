// The four token states from the spec (S08 ②, p.113c ⑤)
export type InvitationStatus = "pending" | "used" | "expired" | "revoked";

// Row actions that need a confirmation dialog. "revoke" is the feature's delete (DELETE /{id})
export type InvitationAction = "reissue" | "revoke";

// One list row, exactly as GET /api/v1/admin/doctor-invitations returns it.
// The server masks the mobile, so the full number never reaches the list
export interface Invitation {
  id: number;
  doctorName: string | null; // null → shown as "No information"
  maskedMobile: string | null; // "010-****-5678"; null → shown as "-"
  status: InvitationStatus;
  issuedAt: string; // ISO 8601 in Korean time, e.g. "2026-09-08T10:00:00+09:00"
  expiresAt: string; // validity period still TBC
  reissueCount: number;
}

// What happened to an invitation (p.113e history)
export type HistoryAction = "issued" | "reissued" | "edited" | "revoked" | "used" | "expired";

export interface InvitationHistoryEntry {
  id: number;
  action: HistoryAction;
  actor: string | null; // null = system event (expiry, doctor sign-up)
  occurredAt: string;
}

// GET /{id}: detail screen + edit form. Includes the full contact so the form can be prefilled
export interface InvitationDetail extends Invitation {
  email: string | null;
  mobile: string | null;
  createdAt: string;
  updatedAt: string;
  history: InvitationHistoryEntry[]; // oldest first
}

// One page of results; page is 1-based like the pagination on screen
export interface PageResult<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

// The Status dropdown adds "all" to the four real statuses
export type StatusFilter = InvitationStatus | "all";

// What the admin searched for
export interface InvitationFilters {
  query: string;
  status: StatusFilter;
}

// Everything that decides which list page is shown
export interface InvitationListParams extends InvitationFilters {
  page: number;
  size: number;
}

// Body of Issue (POST) and Edit (PUT)
export interface InvitationFormValues {
  doctorName: string;
  email: string;
  mobile: string;
}

export type InvitationField = keyof InvitationFormValues;

// One message per field, e.g. { email: "Enter an email address." }
export type InvitationFieldErrors = Partial<Record<InvitationField, string>>;
