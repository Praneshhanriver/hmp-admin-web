import PageHeader from "@/components/common/PageHeader";
import InvitationListView from "@/components/invitations/InvitationListView";
import { MOCK_INVITATIONS } from "@/mocks/invitations";

// W-01 Invitation list (p.113c). Route: /doctors/invitations/list
// Server Component: loads the data, hands it to the interactive view
export default function InvitationListPage() {
  return (
    <div className="invitation-list-page">
      <PageHeader title="Doctor Invitations" crumb="Invitations" showIssue />
      <InvitationListView invitations={MOCK_INVITATIONS} />
    </div>
  );
}