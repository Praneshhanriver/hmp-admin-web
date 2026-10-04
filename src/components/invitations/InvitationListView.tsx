"use client";

import { useState } from "react";
import InvitationTable from "@/components/invitations/InvitationTable";
import SearchBar from "@/components/invitations/SearchBar";
import { EMPTY_FILTERS, INVITATION_PAGE_SIZE } from "@/constants/invitation";
import type { Invitation, InvitationFilters } from "@/types/invitation";
import { filterInvitations } from "@/utils/filterInvitations";

interface InvitationListViewProps {
  invitations: Invitation[];
}

// The interactive part of the list: owns the filters, shows the results
export default function InvitationListView({ invitations }: InvitationListViewProps) {
  const [filters, setFilters] = useState<InvitationFilters>(EMPTY_FILTERS);

  // Derived values: recalculated from state on every render, never stored
  const results = filterInvitations(invitations, filters);
  const pageRows = results.slice(0, INVITATION_PAGE_SIZE);
  const countLabel = `${results.length} ${results.length === 1 ? "invitation" : "invitations"}`;

  return (
    <>
      <SearchBar initialFilters={filters} onSearch={setFilters} />

      <div className="invitation-list-summary" role="status" aria-live="polite">
        <span className="invitation-list-count">{countLabel}</span>
        <span className="invitation-list-range">
          {pageRows.length > 0 ? `Showing 1–${pageRows.length}` : "Showing 0"}
        </span>
      </div>

      <InvitationTable rows={pageRows} total={results.length} />
    </>
  );
}