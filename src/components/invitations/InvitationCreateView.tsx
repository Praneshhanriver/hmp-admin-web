"use client";

import { useRouter } from "next/navigation";
import InvitationForm from "@/components/invitations/InvitationForm";
import { useToast } from "@/components/providers/ToastProvider";
import { EMPTY_FORM_VALUES, ROUTES } from "@/constants/invitation";
import { useCreateInvitation } from "@/hooks/API/invitations/useCreateInvitation";
import type { InvitationFormValues } from "@/types/invitation";
import { formatLongDate } from "@/utils/format";

// W-02 Issue invitation: POST → toast → back to the list, where the new row is on top as Pending
export default function InvitationCreateView() {
  const router = useRouter();
  const { showToast } = useToast();
  const create = useCreateInvitation();

  function handleSubmit(values: InvitationFormValues) {
    create.mutate(values, {
      onSuccess: (created) => {
        showToast({
          title: "Invitation issued",
          message: `A link was sent to ${created.doctorName}. It works until ${formatLongDate(created.expiresAt)}.`,
        });
        router.push(ROUTES.list);
      },
    });
  }

  return (
    <section className="invitation-form-card" aria-label="Issue invitation form">
      <InvitationForm
        mode="create"
        initialValues={EMPTY_FORM_VALUES}
        // stays disabled after success too, while the list page opens: no second invitation by double click
        isSubmitting={create.isPending || create.isSuccess}
        submitError={create.error}
        onSubmit={handleSubmit}
        cancelHref={ROUTES.list}
      />
    </section>
  );
}
