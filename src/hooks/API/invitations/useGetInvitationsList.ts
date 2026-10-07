import { useQuery } from "@tanstack/react-query";
import type { ApiError } from "@/api-services/apiClient";
import { InvitationService } from "@/api-services/InvitationService";
import type { Invitation, InvitationListParams, PageResult } from "@/types/invitation";
import { QUERIES } from "@/utils/api-integration";

// One page of the invitation list. A new search / status / page = a new cache key = a new request.
// TanStack Query ignores the answer of an older request, so a slow old search never overwrites a new one
export function useGetInvitationsList(params: InvitationListParams) {
  return useQuery<PageResult<Invitation>, ApiError>({
    queryKey: QUERIES.INVITATIONS.list(params),
    queryFn: () => InvitationService.getList(params),
  });
}
