import { FIRST_PAGE, SEARCH_MAX_LENGTH, STATUS_FILTER_OPTIONS } from "@/constants/invitation";
import type { InvitationFilters, StatusFilter } from "@/types/invitation";

// The list's search lives in the URL: /doctors/invitations/list?q=kim&status=pending&page=2
// so Back from the detail screen, a refresh or a shared link shows the same results
export interface ListSearchParams {
  q?: string | string[];
  status?: string | string[];
  page?: string | string[];
}

export interface ListState {
  filters: InvitationFilters;
  page: number;
}

function first(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

// Anything unexpected in the URL falls back to the default instead of breaking the page
export function parseListParams(params: ListSearchParams): ListState {
  const status = first(params.status);
  const page = Number.parseInt(first(params.page), 10);
  return {
    filters: {
      query: first(params.q).slice(0, SEARCH_MAX_LENGTH),
      status: STATUS_FILTER_OPTIONS.some((option) => option.value === status) ? (status as StatusFilter) : "all",
    },
    page: Number.isInteger(page) && page >= FIRST_PAGE ? page : FIRST_PAGE,
  };
}

// The reverse: only non-default values go into the URL, so the plain list URL stays clean
export function toListQueryString({ filters, page }: ListState): string {
  const params = new URLSearchParams();
  const query = filters.query.trim();
  if (query) params.set("q", query);
  if (filters.status !== "all") params.set("status", filters.status);
  if (page !== FIRST_PAGE) params.set("page", String(page));
  const text = params.toString();
  return text ? `?${text}` : "";
}
