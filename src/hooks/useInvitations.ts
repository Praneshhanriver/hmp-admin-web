import { useEffect, useState } from "react";
import { fetchInvitations } from "@/services/invitationService";
import type { MockScenario } from "@/services/invitationService";
import type { Invitation, InvitationFilters } from "@/types/invitation";

interface UseInvitationsResult {
  invitations: Invitation[];
  isLoading: boolean;
  isError: boolean;
  retry: () => void;
  replaceInvitation: (updated: Invitation) => void;
}

// Loads invitations for the given filters and tracks loading / error
export function useInvitations(filters: InvitationFilters, scenario: MockScenario): UseInvitationsResult {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [attempt, setAttempt] = useState(0); // bumped by retry() to run the effect again

  useEffect(() => {
    let ignore = false; // true once a newer request has replaced this one
    setIsLoading(true);
    setIsError(false);

    fetchInvitations(filters, scenario)
      .then((rows) => {
        if (!ignore) setInvitations(rows);
      })
      .catch(() => {
        if (!ignore) setIsError(true);
      })
      .finally(() => {
        if (!ignore) setIsLoading(false);
      });

    // Cleanup: runs before the next request starts, or when the page closes
    return () => {
      ignore = true;
    };
  }, [filters, scenario, attempt]);

  // Swaps in one updated row after an action, without loading the list again
  function replaceInvitation(updated: Invitation) {
    setInvitations((current) => current.map((invitation) => (invitation.id === updated.id ? updated : invitation)));
  }

  return { invitations, isLoading, isError, retry: () => setAttempt((count) => count + 1), replaceInvitation };
}