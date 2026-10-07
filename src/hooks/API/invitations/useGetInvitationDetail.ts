import { useQuery } from "@tanstack/react-query";
import type { ApiError } from "@/api-services/apiClient";
import { InvitationService } from "@/api-services/InvitationService";
import type { InvitationDetail } from "@/types/invitation";
import { QUERIES } from "@/utils/api-integration";

// One invitation with its history (detail screen and edit form).
// id is null when the URL holds something that is not a number: nothing is requested then
export function useGetInvitationDetail(id: number | null) {
  return useQuery<InvitationDetail, ApiError>({
    queryKey: QUERIES.INVITATIONS.detail(id ?? 0),
    queryFn: () => InvitationService.getDetail(id as number),
    enabled: id !== null,
    retry: (failureCount, error) => !error.isNotFound && failureCount < 1, // a 404 won't fix itself
  });
}
