import PageHeader from "@/components/common/PageHeader";
import InvitationTable from "@/components/invitations/InvitationTable";
import { INVITATION_PAGE_SIZE } from "@/constants/invitation";
import { MOCK_INVITATIONS } from "@/mocks/invitations";

// W-01 Invitation list (p.113c). Route: /doctors/invitations/list
export default function InvitationListPage() {
  const total = MOCK_INVITATIONS.length;
  const pageRows = MOCK_INVITATIONS.slice(0, INVITATION_PAGE_SIZE);

  return (
    <div className="invitation-list-page">
      <PageHeader title="Doctor Invitations" crumb="Invitations" showIssue />

      <div className="invitation-list-summary" role="status" aria-live="polite">
        <span className="invitation-list-count">{total} invitations</span>
        <span className="invitation-list-range">Showing 1–{pageRows.length}</span>
      </div>

      <InvitationTable rows={pageRows} total={total} />
    </div>
  );
}