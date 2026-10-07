"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, FileText, PencilSimple } from "@phosphor-icons/react";
import EmptyState from "@/components/common/EmptyState";
import PageHeader from "@/components/common/PageHeader";
import StatusChip from "@/components/common/StatusChip";
import InvitationForm from "@/components/invitations/InvitationForm";
import InvitationLoadFallback from "@/components/invitations/InvitationLoadFallback";
import { useToast } from "@/components/providers/ToastProvider";
import { MISSING_NAME_LABEL, ROUTES, STATUS_FILTER_OPTIONS } from "@/constants/invitation";
import { useGetInvitationDetail } from "@/hooks/API/invitations/useGetInvitationDetail";
import { useUpdateInvitation } from "@/hooks/API/invitations/useUpdateInvitation";
import type { InvitationDetail, InvitationFormValues } from "@/types/invitation";
import { formatDate, formatNumber } from "@/utils/format";
import { canEdit } from "@/utils/invitationRules";

interface InvitationEditViewProps {
  id: number | null; // null when the URL id is not a number
}

const BACK_LINK = { label: "Back to invitations", href: ROUTES.list };

// W-04 Edit (training extension, Hi-Fi 1d): only Pending invitations; prefilled with the saved values.
// The header lives here, not in page.tsx, because its subtitle needs the doctor's name
export default function InvitationEditView({ id }: InvitationEditViewProps) {
  const detail = useGetInvitationDetail(id);
  const invitation = detail.data;
  const isEditable = invitation ? canEdit(invitation.status) : false;

  return (
    <>
      <PageHeader
        title="Edit invitation"
        crumb="Edit invitation"
        backLink={BACK_LINK}
        tag={
          <span className="page-header-tag">
            <PencilSimple className="icon-sm" aria-hidden /> Editing
          </span>
        }
        subtitle={invitation && isEditable ? `${invitation.doctorName ?? MISSING_NAME_LABEL} · pending invitation` : undefined}
      />

      {!invitation ? (
        <InvitationLoadFallback
          isLoading={detail.isPending}
          error={detail.error}
          isInvalidId={id === null}
          onRetry={() => detail.refetch()}
        />
      ) : isEditable ? (
        // key: a different invitation starts a fresh form
        <EditForm key={invitation.id} invitation={invitation} />
      ) : (
        <NotEditable invitation={invitation} />
      )}
    </>
  );
}

function EditForm({ invitation }: { invitation: InvitationDetail }) {
  const router = useRouter();
  const { showToast } = useToast();
  const update = useUpdateInvitation(invitation.id);

  const initialValues: InvitationFormValues = {
    doctorName: invitation.doctorName ?? "",
    email: invitation.email ?? "",
    mobile: invitation.mobile ?? "",
  };

  function handleSubmit(values: InvitationFormValues) {
    update.mutate(values, {
      onSuccess: (saved) => {
        // Hi-Fi 2l
        showToast({
          title: "Changes saved",
          message: `${saved.doctorName}’s invitation details were updated. No new link was sent.`,
        });
        router.push(ROUTES.list);
      },
    });
  }

  return (
    <>
      <EditSummary invitation={invitation} />
      <InvitationForm
        mode="edit"
        initialValues={initialValues}
        isSubmitting={update.isPending || update.isSuccess}
        submitError={update.error}
        onSubmit={handleSubmit}
        cancelHref={ROUTES.list}
      />
    </>
  );
}

// Dashed box above the form (Hi-Fi 1d): what is being edited, and that saving sends no new link
function EditSummary({ invitation }: { invitation: InvitationDetail }) {
  return (
    <section className="invitation-edit-summary" aria-labelledby="invitation-edit-summary-title">
      <div className="invitation-edit-summary-head">
        <h2 id="invitation-edit-summary-title" className="invitation-edit-summary-title">
          <PencilSimple className="icon-md" aria-hidden /> Editing an existing invitation
        </h2>
        <StatusChip status={invitation.status} />
      </div>
      <dl className="invitation-edit-summary-facts">
        <div>
          <dt>Issued</dt>
          <dd>{formatDate(invitation.issuedAt)}</dd>
        </div>
        <div>
          <dt>Expiry (TBC)</dt>
          <dd>{formatDate(invitation.expiresAt)}</dd>
        </div>
        <div>
          <dt>Re-issues</dt>
          <dd>{formatNumber(invitation.reissueCount)}</dd>
        </div>
      </dl>
      <p className="invitation-edit-summary-text">
        Saving updates the recipient details of this pending invitation. It does not send a new link — use{" "}
        <strong>Re-issue</strong> on the invitation list for that.
      </p>
    </section>
  );
}

// Used / Expired / Revoked: nothing to edit, say why and offer a way out
function NotEditable({ invitation }: { invitation: InvitationDetail }) {
  const statusLabel = STATUS_FILTER_OPTIONS.find((option) => option.value === invitation.status)?.label;

  return (
    <div className="invitation-detail-card">
      <EmptyState
        title="This invitation can't be edited"
        description={
          <>
            Only pending invitations can be edited. This one is <strong>{statusLabel}</strong>.
          </>
        }
        action={
          <div className="invitation-detail-actions">
            <Link href={ROUTES.list} className="btn btn-secondary btn-md">
              <ArrowLeft aria-hidden /> Back to the list
            </Link>
            <Link href={ROUTES.detail(invitation.id)} className="btn btn-secondary btn-md">
              <FileText aria-hidden /> View detail
            </Link>
          </div>
        }
      />
    </div>
  );
}
