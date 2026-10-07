import type { Metadata } from "next";
import PageHeader from "@/components/common/PageHeader";
import InvitationCreateView from "@/components/invitations/InvitationCreateView";
import { ROUTES } from "@/constants/invitation";

export const metadata: Metadata = { title: "Issue Doctor Invitation" };

// W-02 Issue invitation (p.113b, Hi-Fi 1b). Route: /doctors/invitations/create
export default function InvitationCreatePage() {
  return (
    <div className="invitation-sub-page is-form">
      <PageHeader
        title="Issue Doctor Invitation"
        crumb="Issue invitation"
        backLink={{ label: "Back to invitations", href: ROUTES.list }}
        subtitle="Creates one single-use link that lets this doctor start sign-up."
      />
      <InvitationCreateView />
    </div>
  );
}
