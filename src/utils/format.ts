import { MISSING_CONTACT_LABEL } from "@/constants/invitation";

// "010-1234-5678" → "010-****-5678" (p.113c ②). Missing → "-", never hidden.
export function maskMobile(mobile: string | null): string {
  if (!mobile) return MISSING_CONTACT_LABEL;
  const digits = mobile.replace(/\D/g, "");
  // Korean mobile: first 3 digits (010) and last 4 stay visible, the middle is masked
  return `${digits.slice(0, 3)}-****-${digits.slice(-4)}`;
}

// "2026-09-08T10:00:00+09:00" → "26/09/08" (list date format in the Hi-Fi)
export function formatShortDate(iso: string): string {
  // ISO starts "YYYY-MM-DD" (first 10 characters); the year is shortened to its last 2 digits
  const [year, month, day] = iso.slice(0, 10).split("-");
  return `${year.slice(2)}/${month}/${day}`;
}