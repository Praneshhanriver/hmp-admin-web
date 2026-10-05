"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { X } from "@phosphor-icons/react";
import EmptyState from "@/components/common/EmptyState";
import ErrorState from "@/components/common/ErrorState";
import Pagination from "@/components/common/Pagination";
import Toast from "@/components/common/Toast";
import ConfirmationDialog from "@/components/invitations/ConfirmationDialog";
import InvitationTable from "@/components/invitations/InvitationTable";
import SearchBar from "@/components/invitations/SearchBar";
import { EMPTY_FILTERS, INVITATION_PAGE_SIZE, STATUS_FILTER_OPTIONS } from "@/constants/invitation";
import { useInvitationActions } from "@/hooks/useInvitationActions";
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
  const [page, setPage] = useState(1);
  const { invitations, isLoading, isError, retry, replaceInvitation } = useInvitations(filters, mockScenario);
  const actions = useInvitationActions(replaceInvitation);

  // Derived values: recalculated on every render, never stored
  const total = invitations.length;
  const totalPages = Math.max(1, Math.ceil(total / INVITATION_PAGE_SIZE));
  const currentPage = Math.min(page, totalPages); // never past the last page
  const firstIndex = (currentPage - 1) * INVITATION_PAGE_SIZE;
  const pageRows = invitations.slice(firstIndex, firstIndex + INVITATION_PAGE_SIZE);
  const hasFilters = filters.query.trim() !== "" || filters.status !== "all";
  const isEmpty = !isLoading && !isError && total === 0;
  const isFilled = !isLoading && !isError && total > 0;
  const countLabel = `${total} ${total === 1 ? "invitation" : "invitations"}`;

  // A new search is a new result list, so start again on page 1
  function handleSearch(nextFilters: InvitationFilters) {
    setFilters(nextFilters);
    setPage(1);
  }

  function handleClearSearch() {
    handleSearch(EMPTY_FILTERS);
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
      <SearchBar key={searchBarKey} initialFilters={filters} onSearch={handleSearch} />

      <div className="invitation-list-summary" role="status" aria-live="polite">
        <span className="invitation-list-count">
          {isLoading ? "Loading invitations…" : isError ? "Results unavailable" : countLabel}
        </span>
        {isFilled && (
          <span className="invitation-list-range">
            Showing {firstIndex + 1}–{firstIndex + pageRows.length}
          </span>
        )}
      </div>

      <InvitationTable
        rows={pageRows}
        total={total}
        isLoading={isLoading}
        message={message}
        highlightedId={actions.highlightedId}
        onReissue={(invitation) => actions.open("reissue", invitation)}
        onRevoke={(invitation) => actions.open("revoke", invitation)}
      />

      {isFilled && <Pagination page={currentPage} totalPages={totalPages} onPageChange={setPage} />}

      {actions.pendingAction && (
        <ConfirmationDialog
          variant={actions.pendingAction.type}
          invitation={actions.pendingAction.invitation}
          isSubmitting={actions.isSubmitting}
          errorMessage={actions.errorMessage}
          onConfirm={actions.confirm}
          onCancel={actions.cancel}
        />
      )}

      {actions.toast && (
        <Toast title={actions.toast.title} message={actions.toast.message} onDismiss={actions.dismissToast} />
      )}
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