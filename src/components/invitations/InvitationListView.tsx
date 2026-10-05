"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { X } from "@phosphor-icons/react";
import EmptyState from "@/components/common/EmptyState";
import ErrorState from "@/components/common/ErrorState";
import InvitationTable from "@/components/invitations/InvitationTable";
import SearchBar from "@/components/invitations/SearchBar";
import { EMPTY_FILTERS, INVITATION_PAGE_SIZE, STATUS_FILTER_OPTIONS } from "@/constants/invitation";
import { useInvitations } from "@/hooks/useInvitations";
import type { MockScenario } from "@/services/invitationService";
import type { InvitationFilters } from "@/types/invitation";

interface InvitationListViewProps {
  mockScenario: MockScenario;
}

// The interactive part of the list: owns the filters, loads and shows the results
export default function InvitationListView({ mockScenario }: InvitationListViewProps) {
  const [filters, setFilters] = useState<InvitationFilters>(EMPTY_FILTERS);
  const [searchBarKey, setSearchBarKey] = useState(0);
  const { invitations, isLoading, isError, retry } = useInvitations(filters, mockScenario);

  // Derived values: recalculated on every render, never stored
  const pageRows = invitations.slice(0, INVITATION_PAGE_SIZE);
  const hasFilters = filters.query.trim() !== "" || filters.status !== "all";
  const isEmpty = !isLoading && !isError && invitations.length === 0;
  const countLabel = `${invitations.length} ${invitations.length === 1 ? "invitation" : "invitations"}`;

  function handleClearSearch() {
    setFilters(EMPTY_FILTERS);
    setSearchBarKey((key) => key + 1); // a new key = a fresh SearchBar with empty fields
  }

  let message: ReactNode = null;
  if (isError) {
    message = (
      <ErrorState
        title="Unable to load invitations"
        description="Something went wrong on our side. Your search is kept — try again in a moment."
        onRetry={retry}
      />
    );
  } else if (isEmpty && hasFilters) {
    message = (
      <EmptyState
        title="No invitations found"
        description={<NoResultsDescription filters={filters} />}
        action={
          <button type="button" className="btn btn-secondary btn-md" onClick={handleClearSearch}>
            <X aria-hidden /> Clear search
          </button>
        }
      />
    );
  } else if (isEmpty) {
    message = (
      <EmptyState
        title="No invitations yet"
        description="Invitations you issue will appear here. Use “Issue invitation” to send the first one."
      />
    );
  }

  return (
    <>
      <SearchBar key={searchBarKey} initialFilters={filters} onSearch={setFilters} />

      <div className="invitation-list-summary" role="status" aria-live="polite">
        <span className="invitation-list-count">
          {isLoading ? "Loading invitations…" : isError ? "Results unavailable" : countLabel}
        </span>
        {!isLoading && !isError && pageRows.length > 0 && (
          <span className="invitation-list-range">Showing 1–{pageRows.length}</span>
        )}
      </div>

      <InvitationTable rows={pageRows} total={invitations.length} isLoading={isLoading} message={message} />
    </>
  );
}

// Echoes the search back: Nothing matches "Kang Bo-ra" with status Pending.
function NoResultsDescription({ filters }: { filters: InvitationFilters }) {
  const query = filters.query.trim();
  const statusLabel = STATUS_FILTER_OPTIONS.find((option) => option.value === filters.status)?.label;

  if (query && filters.status !== "all") {
    return (
      <>
        Nothing matches <strong>“{query}”</strong> with status <strong>{statusLabel}</strong>.
      </>
    );
  }
  if (query) {
    return (
      <>
        Nothing matches <strong>“{query}”</strong>.
      </>
    );
  }
  return (
    <>
      No invitations with status <strong>{statusLabel}</strong>.
    </>
  );
}