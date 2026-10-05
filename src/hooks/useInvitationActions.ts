import { useEffect, useState } from "react";
import { ROW_HIGHLIGHT_MS, TOAST_DURATION_MS } from "@/constants/invitation";
import { reissueInvitation, revokeInvitation } from "@/services/invitationService";
import type { Invitation, InvitationAction } from "@/types/invitation";

// The action waiting for confirmation in the dialog
export interface PendingAction {
  type: InvitationAction;
  invitation: Invitation;
}

export interface ToastMessage {
  title: string;
  message: string;
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

const FAILURE: Record<InvitationAction, string> = {
  reissue: "The invitation could not be re-issued. Please try again.",
  revoke: "The invitation could not be revoked. Please try again.",
};

// Re-issue / Revoke flow: confirm dialog → service call → toast + row highlight
export function useInvitationActions(onUpdated: (updated: Invitation) => void) {
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [isToastPaused, setIsToastPaused] = useState(false); // mouse or keyboard focus is on the toast

  // Hide the toast after a few seconds, but never while the admin is reading it.
  // Cleanup cancels the timer if the toast changes or gets paused first
  useEffect(() => {
    if (!toast || isToastPaused) return;
    const timer = setTimeout(() => setToast(null), TOAST_DURATION_MS);
    return () => clearTimeout(timer);
  }, [toast, isToastPaused]);

  // Remove the row highlight after a short moment
  useEffect(() => {
    if (!highlightedId) return;
    const timer = setTimeout(() => setHighlightedId(null), ROW_HIGHLIGHT_MS);
    return () => clearTimeout(timer);
  }, [highlightedId]);

  function open(type: InvitationAction, invitation: Invitation) {
    setErrorMessage(null);
    setPendingAction({ type, invitation });
  }

  function cancel() {
    setErrorMessage(null);
    setPendingAction(null);
  }

  async function confirm() {
    if (!pendingAction) return;
    const { type, invitation } = pendingAction;

    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const updated =
        type === "reissue" ? await reissueInvitation(invitation.id) : await revokeInvitation(invitation.id);
      onUpdated(updated);
      setPendingAction(null);
      setToast(SUCCESS[type](updated.doctorName));
      setHighlightedId(updated.id);
    } catch {
      setErrorMessage(FAILURE[type]); // dialog stays open so the admin can try again
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    pendingAction,
    isSubmitting,
    errorMessage,
    toast,
    highlightedId,
    open,
    cancel,
    confirm,
    dismissToast: () => {
      setToast(null);
      setIsToastPaused(false);
    },
    pauseToast: () => setIsToastPaused(true),
    resumeToast: () => setIsToastPaused(false),
  };
}
