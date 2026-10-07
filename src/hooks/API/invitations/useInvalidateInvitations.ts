import { useQueryClient } from "@tanstack/react-query";
import { QUERIES } from "@/utils/api-integration";

// After any change, every cached invitation list and detail is stale: mark them so they load again
export function useInvalidateInvitations() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: QUERIES.INVITATIONS.all });
}
