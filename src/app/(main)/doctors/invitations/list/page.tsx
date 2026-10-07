import type { Metadata } from "next";
import PageHeader from "@/components/common/PageHeader";
import InvitationListView from "@/components/invitations/InvitationListView";
import { parseListParams } from "@/utils/listParams";
import type { ListSearchParams } from "@/utils/listParams";

export const metadata: Metadata = { title: "Doctor Invitations" };

interface InvitationListPageProps {
  searchParams: Promise<ListSearchParams>;
}

// W-01 Invitation list (p.113c). Route: /doctors/invitations/list?q=&status=&page=
export default async function InvitationListPage({ searchParams }: InvitationListPageProps) {
  const { filters, page } = parseListParams(await searchParams);

  return (
    <div className="invitation-list-page">
      <PageHeader title="Doctor Invitations" crumb="Invitations" showIssue />
      <InvitationListView filters={filters} page={page} />
    </div>
  );
}
