import type { Metadata } from "next";
import PageHeader from "@/components/common/PageHeader";
import InvitationCreateView from "@/components/invitations/InvitationCreateView";
import { ROUTES } from "@/constants/invitation";

export const metadata: Metadata = { title: "Issue invitation" };

// W-02 Issue invitation (p.113b). Route: /doctors/invitations/create
export default function InvitationCreatePage() {
  return (
    <div className="invitation-sub-page">
      <PageHeader title="Issue invitation" crumb="Issue invitation" parent={{ label: "Invitations", href: ROUTES.list }} />
      <InvitationCreateView />
    </div>
  );
}
