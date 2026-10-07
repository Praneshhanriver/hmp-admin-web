"use client";

import Link from "next/link";
import { Eye, ListBullets } from "@phosphor-icons/react";
import StatusChip from "@/components/common/StatusChip";
import InvitationHistoryList from "@/components/invitations/InvitationHistoryList";
import InvitationLoadFallback from "@/components/invitations/InvitationLoadFallback";
import { MISSING_CONTACT_SPOKEN, MISSING_NAME_LABEL, ROUTES } from "@/constants/invitation";
import { useGetInvitationDetail } from "@/hooks/API/invitations/useGetInvitationDetail";
import { formatContact, formatDate, formatNumber } from "@/utils/format";

interface InvitationDetailViewProps {
  id: number | null; // null when the URL id is not a number
}

// W-03 Invitation detail (p.113e, Hi-Fi 1c): read-only facts + history.
// "Back to the list" is the only action (FINAL); the notice says where Re-issue and Revoke are
export default function InvitationDetailView({ id }: InvitationDetailViewProps) {
  const detail = useGetInvitationDetail(id);
  const invitation = detail.data;

  return (
    <>
      <p className="invitation-detail-notice">
        <Eye className="icon-md" aria-hidden />
        <span>
          <strong>Read-only.</strong> Re-issue and revoke are done from the invitation list.
        </span>
      </p>

      {!invitation ? (
        <InvitationLoadFallback
          isLoading={detail.isPending}
          error={detail.error}
          isInvalidId={id === null}
          onRetry={() => detail.refetch()}
        />
      ) : (
        <>
          <section className="invitation-detail-card" aria-labelledby="invitation-detail-title">
            <h2 id="invitation-detail-title" className="invitation-detail-section-title">
              Invitation
            </h2>
            <dl className="invitation-detail-facts">
              <div>
                <dt>Invited person</dt>
                <dd className={invitation.doctorName ? undefined : "is-missing"}>
                  {invitation.doctorName ?? MISSING_NAME_LABEL}
                </dd>
              </div>
              <div>
                <dt>Contact</dt>
                <dd aria-label={invitation.maskedMobile ? undefined : MISSING_CONTACT_SPOKEN}>
                  {formatContact(invitation.maskedMobile)}
                </dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>
                  <StatusChip status={invitation.status} />
                </dd>
              </div>
              <div>
                <dt>Issued on</dt>
                <dd>{formatDate(invitation.issuedAt)}</dd>
              </div>
              <div>
                <dt>Expiry (period TBC)</dt>
                <dd>{formatDate(invitation.expiresAt)}</dd>
              </div>
              <div>
                <dt>Re-issues</dt>
                <dd>{formatNumber(invitation.reissueCount)}</dd>
              </div>
            </dl>
          </section>

          <section className="invitation-detail-card" aria-labelledby="invitation-history-title">
            <div className="invitation-detail-section-head">
              <h2 id="invitation-history-title" className="invitation-detail-section-title">
                Invitation history
              </h2>
              <span className="invitation-detail-section-note">Oldest first</span>
            </div>
            <InvitationHistoryList history={invitation.history} status={invitation.status} />
          </section>
        </>
      )}

      <div className="invitation-detail-actions">
        <Link href={ROUTES.list} className="btn btn-secondary btn-lg">
          <ListBullets aria-hidden /> Back to the list
        </Link>
      </div>
    </>
  );
}
