import PageHeader from "@/components/common/PageHeader";
import InvitationListView from "@/components/invitations/InvitationListView";
import { toMockScenario } from "@/services/invitationService";

interface InvitationListPageProps {
  searchParams: Promise<{ mock?: string }>;
}

// W-01 Invitation list (p.113c). Route: /doctors/invitations/list
// Add ?mock=error or ?mock=empty to the URL to see those states
export default async function InvitationListPage({ searchParams }: InvitationListPageProps) {
  const { mock } = await searchParams;

  return (
    <div className="invitation-list-page">
      <PageHeader title="Doctor Invitations" crumb="Invitations" showIssue />
      <InvitationListView mockScenario={toMockScenario(mock)} />
    </div>
  );
}