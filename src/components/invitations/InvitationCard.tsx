import Link from "next/link";
import { ArrowClockwise, FileText, PencilSimple, Prohibit } from "@phosphor-icons/react/dist/ssr";
import StatusChip from "@/components/common/StatusChip";
import type { Invitation } from "@/types/invitation";
import { formatShortDate, maskMobile } from "@/utils/format";
import { canEdit, canReissue, canRevoke } from "@/utils/invitationRules";

interface InvitationCardProps {
  invitation: Invitation;
  isHighlighted: boolean; // card just changed by an action
  onReissue: (invitation: Invitation) => void;
  onRevoke: (invitation: Invitation) => void;
}

// One invitation as a card: replaces the table row below 768px (Hi-Fi mobile)
export default function InvitationCard({ invitation, isHighlighted, onReissue, onRevoke }: InvitationCardProps) {
  const { id, doctorName, mobile, status, issuedAt, expiresAt, reissueCount } = invitation;
  const name = doctorName ?? "No information";
  const detailHref = `/doctors/invitations/details/${id}`;
  // Pending shows "View detail" in the footer instead of the actions row
  const showDetailAction = !canEdit(status);

  return (
    <article
      className={isHighlighted ? "invitation-card is-highlighted" : "invitation-card"}
      aria-label={`Invitation for ${name}`}
    >
      <div className="invitation-card-head">
        <h2 className={doctorName ? "invitation-card-title" : "invitation-card-title is-missing"}>{name}</h2>
        <StatusChip status={status} />
      </div>

      <dl className="invitation-card-facts">
        <div>
          <dt>Contact</dt>
          <dd>{maskMobile(mobile)}</dd>
        </div>
        <div>
          <dt>Re-issues</dt>
          <dd>{reissueCount}</dd>
        </div>
        <div>
          <dt>Issued</dt>
          <dd>{formatShortDate(issuedAt)}</dd>
        </div>
        <div>
          <dt>Expiry (TBC)</dt>
          <dd>{formatShortDate(expiresAt)}</dd>
        </div>
      </dl>

      <div className="invitation-card-actions">
        {canReissue(status) && (
          <button
            type="button"
            className="btn btn-primary btn-touch"
            aria-label={`Re-issue invitation for ${name}`}
            aria-haspopup="dialog"
            onClick={() => onReissue(invitation)}
          >
            <ArrowClockwise aria-hidden /> Re-issue
          </button>
        )}
        {canRevoke(status) && (
          <button
            type="button"
            className="btn btn-danger-outline btn-touch"
            aria-label={`Revoke invitation for ${name}`}
            aria-haspopup="dialog"
            onClick={() => onRevoke(invitation)}
          >
            <Prohibit aria-hidden /> Revoke
          </button>
        )}
        {showDetailAction && (
          <Link href={detailHref} className="btn btn-secondary btn-touch">
            <FileText aria-hidden /> View detail
          </Link>
        )}
      </div>

      {canEdit(status) && (
        <div className="invitation-card-footer">
          <Link href={detailHref} className="invitation-card-link">
            <FileText aria-hidden /> View detail
          </Link>
          <Link href={`/doctors/invitations/edit/${id}`} className="invitation-card-link is-primary">
            <PencilSimple aria-hidden /> Edit details
          </Link>
        </div>
      )}
    </article>
  );
}
