import { MISSING_CONTACT_LABEL } from "@/constants/invitation";

// WM Date format (English): "May 1, 2016" or "YYYY-MM-DD"; time "08:33 PM" (AM/PM after the number).
// Dates arrive in Korean time ("2026-09-08T10:00:00+09:00") and are shown as written,
// so the result never depends on the time zone of the admin's computer.
const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const HOURS_PER_HALF_DAY = 12;

// "2026-09-08T10:00:00+09:00" → "2026-09-08" (tables and cards: short and lines up in columns)
export function formatDate(iso: string): string {
  return iso.slice(0, 10); // ISO starts with "YYYY-MM-DD"
}

// "2026-09-08T10:00:00+09:00" → "September 8, 2026" (detail screen)
export function formatLongDate(iso: string): string {
  const [year, month, day] = iso.slice(0, 10).split("-").map(Number);
  return `${MONTH_NAMES[month - 1]} ${day}, ${year}`;
}

// "2026-09-08T20:33:00+09:00" → "September 8, 2026 08:33 PM" (history lines)
export function formatDateTime(iso: string): string {
  const [hour, minute] = iso.slice(11, 16).split(":").map(Number); // "HH:mm" after the "T"
  const period = hour < HOURS_PER_HALF_DAY ? "AM" : "PM";
  const hour12 = hour % HOURS_PER_HALF_DAY || HOURS_PER_HALF_DAY; // 0 → 12 AM, 13 → 1 PM
  return `${formatLongDate(iso)} ${pad(hour12)}:${pad(minute)} ${period}`;
}

// WM three-digit comma rule: 12345 → "12,345"
export function formatNumber(value: number): string {
  return value.toLocaleString("en-US");
}

// The server sends the contact already masked ("010-****-5678"); missing → "-", never hidden
export function formatContact(maskedMobile: string | null): string {
  return maskedMobile ?? MISSING_CONTACT_LABEL;
}

function pad(value: number): string {
  return String(value).padStart(2, "0");
}
