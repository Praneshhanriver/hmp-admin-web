import type { Metadata } from "next";
import PageHeader from "@/components/common/PageHeader";
import InvitationDetailView from "@/components/invitations/InvitationDetailView";
import { ROUTES } from "@/constants/invitation";
import { parseInvitationId } from "@/utils/routeParams";

export const metadata: Metadata = { title: "Invitation detail" };

interface InvitationDetailPageProps {
  params: Promise<{ id: string }>; // the [id] folder: "/details/5" → { id: "5" }
}

// W-03 Invitation detail + history (p.113e). Route: /doctors/invitations/details/[id]
export default async function InvitationDetailPage({ params }: InvitationDetailPageProps) {
  const { id } = await params;

  return (
    <div className="invitation-sub-page">
      <PageHeader title="Invitation detail" crumb="Invitation detail" parent={{ label: "Invitations", href: ROUTES.list }} />
      <InvitationDetailView id={parseInvitationId(id)} />
    </div>
  );
}
