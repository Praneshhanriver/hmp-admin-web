import type { Invitation, InvitationFilters } from "@/types/invitation";
import { maskMobile } from "@/utils/format";

// Keeps rows that match the status AND (the name OR the contact digits)
export function filterInvitations(rows: Invitation[], filters: InvitationFilters): Invitation[] {
  const text = filters.query.trim().toLowerCase();
  const digits = text.replace(/\D/g, "");

  return rows.filter((row) => {
    if (filters.status !== "all" && row.status !== filters.status) return false;
    if (!text) return true;

    const nameMatch = row.doctorName?.toLowerCase().includes(text) ?? false;
    // Match only the digits shown on screen, so search never reveals masked digits
    const visibleDigits = maskMobile(row.mobile).replace(/\D/g, "");
    const contactMatch = digits.length > 0 && visibleDigits.includes(digits);
    return nameMatch || contactMatch;
  });
}