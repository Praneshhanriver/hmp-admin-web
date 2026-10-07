import type { Icon } from "@phosphor-icons/react";
import {
  ArrowClockwise,
  CheckCircle,
  HourglassLow,
  PaperPlaneTilt,
  PencilSimple,
  Prohibit,
} from "@phosphor-icons/react/dist/ssr";
import type { HistoryAction, InvitationHistoryEntry, InvitationStatus } from "@/types/invitation";
import { formatDateTime } from "@/utils/format";

// Short labels as in the Hi-Fi history ("Issued", "Re-issued")
const ACTION_CONFIG: Record<HistoryAction, { label: string; icon: Icon }> = {
  issued: { label: "Issued", icon: PaperPlaneTilt },
  reissued: { label: "Re-issued", icon: ArrowClockwise },
  edited: { label: "Details updated", icon: PencilSimple },
  revoked: { label: "Revoked", icon: Prohibit },
  used: { label: "Used — doctor signed up", icon: CheckCircle },
  expired: { label: "Expired", icon: HourglassLow },
};

// These actions send a link; the newest of them is the one that still works while Pending
const SENDS_LINK: HistoryAction[] = ["issued", "reissued"];

interface InvitationHistoryListProps {
  history: InvitationHistoryEntry[]; // oldest first, as the API returns it
  status: InvitationStatus;
}

// p.113e history (Hi-Fi 1c): a timeline, oldest first; who did it, or "System" for automatic events
export default function InvitationHistoryList({ history, status }: InvitationHistoryListProps) {
  const currentLinkId =
    status === "pending" ? history.findLast((entry) => SENDS_LINK.includes(entry.action))?.id : undefined;

  return (
    <ol className="invitation-history">
      {history.map((entry) => {
        const { label, icon: ActionIcon } = ACTION_CONFIG[entry.action];
        return (
          <li key={entry.id} className="invitation-history-item">
            <span className="invitation-history-icon" aria-hidden>
              <ActionIcon />
            </span>
            <span className="invitation-history-text">
              <span className="invitation-history-label">
                {label}
                {entry.id === currentLinkId && <span className="invitation-history-tag">Current link</span>}
              </span>
              <span className="invitation-history-meta">
                <time dateTime={entry.occurredAt}>{formatDateTime(entry.occurredAt)}</time>
                {" · "}
                {entry.actor ?? "System"}
              </span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}
