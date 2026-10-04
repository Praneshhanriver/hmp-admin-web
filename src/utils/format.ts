// "010-1234-5678" → "010-****-5678" (p.113c ②). Missing → "-", never hidden.
export function maskMobile(mobile: string | null): string {
  if (!mobile) return "-";
  const digits = mobile.replace(/\D/g, "");
  return `${digits.slice(0, 3)}-****-${digits.slice(-4)}`;
}

// "2026-09-08T10:00:00+09:00" → "26/09/08" (list date format in the Hi-Fi)
export function formatShortDate(iso: string): string {
  const [year, month, day] = iso.slice(0, 10).split("-");
  return `${year.slice(2)}/${month}/${day}`;
}