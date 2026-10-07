import { useMutation } from "@tanstack/react-query";
import type { ApiError } from "@/api-services/apiClient";
import { InvitationService } from "@/api-services/InvitationService";
import { useInvalidateInvitations } from "@/hooks/API/invitations/useInvalidateInvitations";
import type { InvitationDetail } from "@/types/invitation";

// Re-issue: a new link, back to Pending. Takes the invitation id
export function useReissueInvitation() {
  const invalidate = useInvalidateInvitations();
  return useMutation<InvitationDetail, ApiError, number>({
    mutationFn: (id) => InvitationService.reissue(id),
    onSuccess: invalidate,
  });
}
