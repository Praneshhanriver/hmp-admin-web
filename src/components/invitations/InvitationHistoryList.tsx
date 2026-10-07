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

const ACTION_CONFIG: Record<HistoryAction, { label: string; icon: Icon }> = {
  issued: { label: "Invitation issued", icon: PaperPlaneTilt },
  reissued: { label: "Re-issued — a new link was sent", icon: ArrowClockwise },
  edited: { label: "Details corrected — a corrected link was sent", icon: PencilSimple },
  revoked: { label: "Revoked — the link stopped working", icon: Prohibit },
  used: { label: "Used — the doctor signed up", icon: CheckCircle },
  expired: { label: "Expired — the link passed its expiry", icon: HourglassLow },
};

// These actions send a link; the newest of them is the one that still works while Pending
const SENDS_LINK: HistoryAction[] = ["issued", "reissued", "edited"];

interface InvitationHistoryListProps {
  history: InvitationHistoryEntry[]; // oldest first, as the API returns it
  status: InvitationStatus;
}

// p.113e history: oldest first, newest last; who did it, or "System" for automatic events
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
                {entry.actor ? `by ${entry.actor}` : "System"}
              </span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}
