import { useMutation } from "@tanstack/react-query";
import type { ApiError } from "@/api-services/apiClient";
import { InvitationService } from "@/api-services/InvitationService";
import { useInvalidateInvitations } from "@/hooks/API/invitations/useInvalidateInvitations";
import type { InvitationDetail, InvitationFormValues } from "@/types/invitation";

// Edit a Pending invitation (training extension): PUT, then the list and detail reload
export function useUpdateInvitation(id: number) {
  const invalidate = useInvalidateInvitations();
  return useMutation<InvitationDetail, ApiError, InvitationFormValues>({
    mutationFn: (values) => InvitationService.update(id, values),
    onSuccess: invalidate,
  });
}
