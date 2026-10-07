"use client";

import { useRouter } from "next/navigation";
import InvitationForm from "@/components/invitations/InvitationForm";
import { useToast } from "@/components/providers/ToastProvider";
import { EMPTY_FORM_VALUES, ROUTES } from "@/constants/invitation";
import { useCreateInvitation } from "@/hooks/API/invitations/useCreateInvitation";
import type { InvitationFormValues } from "@/types/invitation";

// W-02 Issue invitation: POST → toast → back to the list, where the new row is on top as Pending (Hi-Fi 2f)
export default function InvitationCreateView() {
  const router = useRouter();
  const { showToast } = useToast();
  const create = useCreateInvitation();

  function handleSubmit(values: InvitationFormValues) {
    create.mutate(values, {
      onSuccess: (created) => {
        showToast({
          title: "Invitation issued",
          message: `${created.doctorName} can now start sign-up from the link.`,
        });
        router.push(ROUTES.list);
      },
    });
  }

  return (
    <InvitationForm
      mode="create"
      initialValues={EMPTY_FORM_VALUES}
      // stays disabled after success too, while the list page opens: no second invitation by double click
      isSubmitting={create.isPending || create.isSuccess}
      submitError={create.error}
      onSubmit={handleSubmit}
    />
  );
}
