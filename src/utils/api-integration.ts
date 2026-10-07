import type { InvitationListParams } from "@/types/invitation";

// Where the API runs. NEXT_PUBLIC_* is baked in at build time (set it in Vercel, then redeploy)
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

// Every endpoint path in one place
export const API_ENDPOINTS = {
  INVITATIONS: "/api/v1/admin/doctor-invitations",
  INVITATION: (id: number) => `/api/v1/admin/doctor-invitations/${id}`,
  INVITATION_REISSUE: (id: number) => `/api/v1/admin/doctor-invitations/${id}/reissue`,
} as const;

// TanStack Query cache keys. A mutation invalidates QUERIES.INVITATIONS.all and every list and detail reloads
export const QUERIES = {
  INVITATIONS: {
    all: ["invitations"] as const,
    list: (params: InvitationListParams) => ["invitations", "list", params] as const,
    detail: (id: number) => ["invitations", "detail", id] as const,
  },
} as const;
