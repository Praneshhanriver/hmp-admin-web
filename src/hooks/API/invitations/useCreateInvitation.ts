import { useMutation } from "@tanstack/react-query";
import type { ApiError } from "@/api-services/apiClient";
import { InvitationService } from "@/api-services/InvitationService";
import { useInvalidateInvitations } from "@/hooks/API/invitations/useInvalidateInvitations";
import type { InvitationDetail, InvitationFormValues } from "@/types/invitation";

// Issue invitation (p.113b): POST, then the list reloads
export function useCreateInvitation() {
  const invalidate = useInvalidateInvitations();
  return useMutation<InvitationDetail, ApiError, InvitationFormValues>({
    mutationFn: (values) => InvitationService.create(values),
    onSuccess: invalidate,
  });
}
