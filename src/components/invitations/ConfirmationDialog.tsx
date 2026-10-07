"use client";

import { useEffect, useId, useRef } from "react";
import type { SyntheticEvent } from "react";
import {
  ArrowClockwise,
  CircleNotch,
  Clock,
  LinkBreak,
  PaperPlaneTilt,
  Prohibit,
  Warning,
} from "@phosphor-icons/react";
import type { Icon } from "@phosphor-icons/react";
import { MISSING_NAME_LABEL } from "@/constants/invitation";
import type { Invitation, InvitationAction } from "@/types/invitation";
import { formatContact, formatNumber } from "@/utils/format";

interface ConfirmationDialogProps {
  variant: InvitationAction;
  invitation: Invitation;
  isSubmitting: boolean;
  errorMessage: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

interface DialogCopy {
  tag?: string;
  title: string;
  body: (name: string) => string;
  points: { icon: Icon; text: string }[];
  confirm: string;
  busy: string;
  buttonClass: string;
  confirmIcon: Icon;
}

// Text from the Hi-Fi confirmation dialogs
const COPY: Record<InvitationAction, DialogCopy> = {
  revoke: {
    tag: "Cannot be undone",
    title: "Revoke invitation?",
    body: (name) => `The current invitation link for ${name} will no longer be usable. No new link is sent.`,
    points: [
      { icon: LinkBreak, text: "The doctor can no longer open the current link." },
      { icon: Prohibit, text: "Status changes to Revoked. It cannot return to Pending." },
      { icon: ArrowClockwise, text: "You can still re-issue a new invitation later." },
    ],
    confirm: "Revoke invitation",
    busy: "Revoking…",
    buttonClass: "btn btn-lg btn-danger",
    confirmIcon: Prohibit,
  },
  reissue: {
    title: "Re-issue invitation?",
    body: (name) => `A new link will be sent to ${name}. The link they have now stops working immediately.`,
    points: [
      { icon: PaperPlaneTilt, text: "A new single-use link is sent to the doctor." },
      { icon: LinkBreak, text: "The previous link stops working at once — only the newest link works." },
      { icon: Clock, text: "Status returns to Pending and the re-issue count goes up by one." },
    ],
    confirm: "Re-issue invitation",
    busy: "Re-issuing…",
    buttonClass: "btn btn-lg btn-primary",
    confirmIcon: ArrowClockwise,
  },
};

// Modal confirmation for Re-issue / Revoke, built on the native <dialog>
export default function ConfirmationDialog({
  variant,
  invitation,
  isSubmitting,
  errorMessage,
  onConfirm,
  onCancel,
}: ConfirmationDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const bodyId = useId();

  const copy = COPY[variant];
  const ConfirmIcon = isSubmitting ? CircleNotch : copy.confirmIcon; // spinner while busy
  const name = invitation.doctorName ?? MISSING_NAME_LABEL;
  const { reissueCount } = invitation;

  // Open as a modal on mount; on unmount close it and give focus back to the row button
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    const dialog = dialogRef.current;
    dialog?.showModal();
    cancelRef.current?.focus(); // safest choice first: nothing happens by accident

    return () => {
      dialog?.close();
      if (opener?.isConnected) opener.focus(); // the Revoke button is gone after a revoke
    };
  }, []);

  // Esc fires "cancel". We decide when to close, so block the browser's own close
  function handleCancel(event: SyntheticEvent<HTMLDialogElement>) {
    event.preventDefault();
    if (!isSubmitting) onCancel();
  }

  return (
    <dialog
      ref={dialogRef}
      className="confirmation-dialog"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={bodyId}
      onCancel={handleCancel}
    >
      <div className="confirmation-dialog-head">
        {copy.tag && (
          <span className="confirmation-dialog-tag">
            <Warning aria-hidden /> {copy.tag}
          </span>
        )}
        <h2 id={titleId} className="confirmation-dialog-title">
          {copy.title}
        </h2>
        <p id={bodyId} className="confirmation-dialog-body">
          {copy.body(name)}
        </p>
      </div>

      <dl className="confirmation-dialog-summary">
        <dt>Invited person</dt>
        <dd>{name}</dd>
        <dt>Contact</dt>
        <dd>{formatContact(invitation.maskedMobile)}</dd>
        <dt>Re-issues</dt>
        <dd>
          {variant === "reissue"
            ? `${formatNumber(reissueCount)} → ${formatNumber(reissueCount + 1)}`
            : formatNumber(reissueCount)}
        </dd>
      </dl>

      <div className="confirmation-dialog-next">
        <span className="confirmation-dialog-next-title">What happens next</span>
        <ul>
          {copy.points.map(({ icon: PointIcon, text }) => (
            <li key={text}>
              <PointIcon aria-hidden /> {text}
            </li>
          ))}
        </ul>
      </div>

      {errorMessage && (
        <p className="confirmation-dialog-error" role="alert">
          {errorMessage}
        </p>
      )}

      <div className="confirmation-dialog-actions">
        <button ref={cancelRef} type="button" className="btn btn-secondary btn-lg" disabled={isSubmitting} onClick={onCancel}>
          Cancel
        </button>
        <button type="button" className={copy.buttonClass} disabled={isSubmitting} onClick={onConfirm}>
          <ConfirmIcon aria-hidden /> {isSubmitting ? copy.busy : copy.confirm}
        </button>
      </div>
    </dialog>
  );
}
