import { MISSING_CONTACT_LABEL } from "@/constants/invitation";

// "010-1234-5678" → "010-****-5678" (p.113c ②). Missing → "-", never hidden.
export function maskMobile(mobile: string | null): string {
  if (!mobile) return MISSING_CONTACT_LABEL;
  const digits = mobile.replace(/\D/g, "");
  // Korean mobile: first 3 digits (010) and last 4 stay visible, the middle is masked
  return `${digits.slice(0, 3)}-****-${digits.slice(-4)}`;
}

// "2026-09-08T10:00:00+09:00" → "2026-09-08"
// WM Date format (English): "May 1, 2016" or "YYYY-MM-DD". Tables and cards use YYYY-MM-DD (short, lines up)
export function formatDate(iso: string): string {
  return iso.slice(0, 10); // ISO starts with "YYYY-MM-DD"
}