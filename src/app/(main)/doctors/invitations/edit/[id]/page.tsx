import type { Metadata } from "next";
import InvitationEditView from "@/components/invitations/InvitationEditView";
import { parseInvitationId } from "@/utils/routeParams";

export const metadata: Metadata = { title: "Edit invitation" };

interface InvitationEditPageProps {
  params: Promise<{ id: string }>;
}

// W-04 Edit a pending invitation (training extension, Hi-Fi 1d). Route: /doctors/invitations/edit/[id]
// The header is inside InvitationEditView: its subtitle needs the doctor's name from the API
export default async function InvitationEditPage({ params }: InvitationEditPageProps) {
  const { id } = await params;

  return (
    <div className="invitation-sub-page is-form">
      <InvitationEditView id={parseInvitationId(id)} />
    </div>
  );
}
