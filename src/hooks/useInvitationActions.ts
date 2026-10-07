import { useEffect, useState } from "react";
import { useToast } from "@/components/providers/ToastProvider";
import type { ToastMessage } from "@/components/providers/ToastProvider";
import { ROW_HIGHLIGHT_MS } from "@/constants/invitation";
import { useDeleteInvitation } from "@/hooks/API/invitations/useDeleteInvitation";
import { useReissueInvitation } from "@/hooks/API/invitations/useReissueInvitation";
import type { Invitation, InvitationAction } from "@/types/invitation";

// The action waiting for confirmation in the dialog
export interface PendingAction {
  type: InvitationAction;
  invitation: Invitation;
}

// Toast text from the Hi-Fi. Names the doctor when the invitation has one
const SUCCESS: Record<InvitationAction, (name: string | null) => ToastMessage> = {
  reissue: (name) => ({
    title: "Invitation re-issued",
    message: name
      ? `A new link was sent to ${name}. The previous link no longer works.`
      : "A new link was sent. The previous link no longer works.",
  }),
  revoke: (name) => ({
    title: "Invitation revoked",
    message: name
      ? `${name}’s link no longer works. No new link was sent.`
      : "The link no longer works. No new link was sent.",
  }),
};

// Re-issue / Revoke flow: confirm dialog → API call → list reloads → toast + row highlight.
// On failure the dialog stays open and shows the API's message, so the admin can try again
export function useInvitationActions() {
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [highlightedId, setHighlightedId] = useState<number | null>(null);
  const reissue = useReissueInvitation();
  const revoke = useDeleteInvitation();
  const { showToast } = useToast();

  const mutation = pendingAction?.type === "revoke" ? revoke : reissue;

  // Remove the row highlight after a short moment
  useEffect(() => {
    if (highlightedId === null) return;
    const timer = setTimeout(() => setHighlightedId(null), ROW_HIGHLIGHT_MS);
    return () => clearTimeout(timer);
  }, [highlightedId]);

  function open(type: InvitationAction, invitation: Invitation) {
    reissue.reset(); // forget the error of an earlier attempt
    revoke.reset();
    setPendingAction({ type, invitation });
  }

  function cancel() {
    setPendingAction(null);
  }

  function confirm() {
    if (!pendingAction) return;
    const { type, invitation } = pendingAction;
    mutation.mutate(invitation.id, {
      onSuccess: (updated) => {
        setPendingAction(null);
        showToast(SUCCESS[type](updated.doctorName));
        setHighlightedId(updated.id);
      },
    });
  }

  return {
    pendingAction,
    isSubmitting: mutation.isPending,
    errorMessage: mutation.error?.message ?? null,
    highlightedId,
    open,
    cancel,
    confirm,
  };
}
