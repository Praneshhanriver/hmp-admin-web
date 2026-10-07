"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, FileText } from "@phosphor-icons/react";
import EmptyState from "@/components/common/EmptyState";
import InvitationForm from "@/components/invitations/InvitationForm";
import InvitationLoadFallback from "@/components/invitations/InvitationLoadFallback";
import { useToast } from "@/components/providers/ToastProvider";
import { ROUTES, STATUS_FILTER_OPTIONS } from "@/constants/invitation";
import { useGetInvitationDetail } from "@/hooks/API/invitations/useGetInvitationDetail";
import { useUpdateInvitation } from "@/hooks/API/invitations/useUpdateInvitation";
import type { InvitationDetail, InvitationFormValues } from "@/types/invitation";
import { canEdit } from "@/utils/invitationRules";

interface InvitationEditViewProps {
  id: number | null; // null when the URL id is not a number
}

// W-04 Edit (training extension): only Pending invitations; prefilled with the saved values
export default function InvitationEditView({ id }: InvitationEditViewProps) {
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

  if (!canEdit(detail.data.status)) return <NotEditable invitation={detail.data} />;

  // key: a different invitation starts a fresh form
  return <EditForm key={detail.data.id} invitation={detail.data} />;
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
        showToast({
          title: "Invitation updated",
          message: `A corrected link was sent to ${saved.doctorName}. The previous link no longer works.`,
        });
        router.push(ROUTES.list);
      },
    });
  }

  return (
    <section className="invitation-form-card" aria-label="Edit invitation form">
      <InvitationForm
        mode="edit"
        initialValues={initialValues}
        isSubmitting={update.isPending || update.isSuccess}
        submitError={update.error}
        onSubmit={handleSubmit}
        cancelHref={ROUTES.list}
      />
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
