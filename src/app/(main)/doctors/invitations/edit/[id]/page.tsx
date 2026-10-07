import type { Metadata } from "next";
import PageHeader from "@/components/common/PageHeader";
import InvitationEditView from "@/components/invitations/InvitationEditView";
import { ROUTES } from "@/constants/invitation";
import { parseInvitationId } from "@/utils/routeParams";

export const metadata: Metadata = { title: "Edit invitation" };

interface InvitationEditPageProps {
  params: Promise<{ id: string }>;
}

// W-04 Edit a pending invitation (training extension). Route: /doctors/invitations/edit/[id]
export default async function InvitationEditPage({ params }: InvitationEditPageProps) {
  const { id } = await params;

  return (
    <div className="invitation-sub-page">
      <PageHeader title="Edit invitation" crumb="Edit invitation" parent={{ label: "Invitations", href: ROUTES.list }} />
      <InvitationEditView id={parseInvitationId(id)} />
    </div>
  );
}
