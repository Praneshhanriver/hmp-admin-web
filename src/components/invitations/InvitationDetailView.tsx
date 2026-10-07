"use client";

import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react";
import StatusChip from "@/components/common/StatusChip";
import InvitationHistoryList from "@/components/invitations/InvitationHistoryList";
import InvitationLoadFallback from "@/components/invitations/InvitationLoadFallback";
import { MISSING_CONTACT_SPOKEN, MISSING_NAME_LABEL, ROUTES } from "@/constants/invitation";
import { useGetInvitationDetail } from "@/hooks/API/invitations/useGetInvitationDetail";
import { formatContact, formatLongDate, formatNumber } from "@/utils/format";

interface InvitationDetailViewProps {
  id: number | null; // null when the URL id is not a number
}

// W-03 Invitation detail (p.113e): read-only facts + history. "Back to the list" is the only action (FINAL)
export default function InvitationDetailView({ id }: InvitationDetailViewProps) {
  const detail = useGetInvitationDetail(id);

  if (!detail.data) {
    return (
      <InvitationLoadFallback
        isLoading={detail.isPending}
        error={detail.error}
        isInvalidId={id === null}
        onRetry={() => detail.refetch()}
      />
    );
  }

  const invitation = detail.data;
  const name = invitation.doctorName ?? MISSING_NAME_LABEL;

  return (
    <>
      <article className="invitation-detail-card" aria-labelledby="invitation-detail-name">
        <div className="invitation-detail-head">
          <h2
            id="invitation-detail-name"
            className={invitation.doctorName ? "invitation-detail-name" : "invitation-detail-name is-missing"}
          >
            {name}
          </h2>
          <StatusChip status={invitation.status} />
        </div>

        <dl className="invitation-detail-facts">
          <div>
            <dt>Invited person</dt>
            <dd>{name}</dd>
          </div>
          <div>
            <dt>Contact</dt>
            <dd aria-label={invitation.maskedMobile ? undefined : MISSING_CONTACT_SPOKEN}>
              {formatContact(invitation.maskedMobile)}
            </dd>
          </div>
          <div>
            <dt>Issued on</dt>
            <dd>{formatLongDate(invitation.issuedAt)}</dd>
          </div>
          <div>
            <dt>Expiry (TBC)</dt>
            <dd>{formatLongDate(invitation.expiresAt)}</dd>
          </div>
          <div>
            <dt>Re-issues</dt>
            <dd>{formatNumber(invitation.reissueCount)}</dd>
          </div>
        </dl>
      </article>

      <section className="invitation-detail-card" aria-labelledby="invitation-history-title">
        <h2 id="invitation-history-title" className="invitation-detail-section-title">
          History
        </h2>
        <InvitationHistoryList history={invitation.history} status={invitation.status} />
      </section>

      <div className="invitation-detail-actions">
        <Link href={ROUTES.list} className="btn btn-secondary btn-lg">
          <ArrowLeft aria-hidden /> Back to the list
        </Link>
      </div>
    </>
  );
}
