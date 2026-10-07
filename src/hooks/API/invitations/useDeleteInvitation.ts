import { useMutation } from "@tanstack/react-query";
import type { ApiError } from "@/api-services/apiClient";
import { InvitationService } from "@/api-services/InvitationService";
import { useInvalidateInvitations } from "@/hooks/API/invitations/useInvalidateInvitations";
import type { InvitationDetail } from "@/types/invitation";

// Delete = revoke: DELETE /{id}. The link stops working; the row stays in the list as Revoked
export function useDeleteInvitation() {
  const invalidate = useInvalidateInvitations();
  return useMutation<InvitationDetail, ApiError, number>({
    mutationFn: (id) => InvitationService.remove(id),
    onSuccess: invalidate,
  });
}
