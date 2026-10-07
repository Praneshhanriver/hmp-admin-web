"use client";

import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { X } from "@phosphor-icons/react";
import EmptyState from "@/components/common/EmptyState";
import ErrorState from "@/components/common/ErrorState";
import Pagination from "@/components/common/Pagination";
import ConfirmationDialog from "@/components/invitations/ConfirmationDialog";
import InvitationTable from "@/components/invitations/InvitationTable";
import SearchBar from "@/components/invitations/SearchBar";
import { EMPTY_FILTERS, FIRST_PAGE, INVITATION_PAGE_SIZE, STATUS_FILTER_OPTIONS } from "@/constants/invitation";
import { useGetInvitationsList } from "@/hooks/API/invitations/useGetInvitationsList";
import { useInvitationActions } from "@/hooks/useInvitationActions";
import type { InvitationFilters } from "@/types/invitation";
import { formatNumber } from "@/utils/format";
import { toListQueryString } from "@/utils/listParams";

interface InvitationListViewProps {
  filters: InvitationFilters; // from the URL, read by the page
  page: number;
}

// The interactive part of the list. Search, filter and paging are done by the API;
// this component only shows the answer and writes the admin's choices into the URL
export default function InvitationListView({ filters, page }: InvitationListViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const list = useGetInvitationsList({ ...filters, page, size: INVITATION_PAGE_SIZE });
  const actions = useInvitationActions();

  // Derived values: recalculated on every render, never stored
  const isLoading = list.isPending;
  const isError = list.isError;
  const rows = list.data?.content ?? [];
  const total = list.data?.totalElements ?? 0;
  const totalPages = list.data?.totalPages ?? 0;
  const firstIndex = (page - 1) * INVITATION_PAGE_SIZE;
  const hasFilters = filters.query.trim() !== "" || filters.status !== "all";
  const isPastLastPage = !isLoading && !isError && total > 0 && rows.length === 0; // e.g. ?page=99
  const isEmpty = !isLoading && !isError && total === 0;
  const isFilled = !isLoading && !isError && rows.length > 0;
  const countLabel = `${formatNumber(total)} ${total === 1 ? "invitation" : "invitations"}`;

  // New results = new URL. The page re-reads it and passes new props; the hook loads the new key
  function navigate(nextFilters: InvitationFilters, nextPage: number) {
    router.push(`${pathname}${toListQueryString({ filters: nextFilters, page: nextPage })}`, { scroll: false });
  }

  // A new search is a new result list, so start again on page 1
  function handleSearch(nextFilters: InvitationFilters) {
    navigate(nextFilters, FIRST_PAGE);
  }

  let message: ReactNode = null;
  if (isError) {
    message = (
      <ErrorState
        title="Unable to load invitations"
        description={`${list.error.message} Your search is kept.`}
        onRetry={() => list.refetch()}
      />
    );
  } else if (isPastLastPage) {
    message = (
      <EmptyState
        title="This page has no invitations"
        description={`There are ${countLabel} on ${formatNumber(totalPages)} pages.`}
        action={
          <button type="button" className="btn btn-secondary btn-md" onClick={() => navigate(filters, FIRST_PAGE)}>
            Go to page 1
          </button>
        }
      />
    );
  } else if (isEmpty && hasFilters) {
    message = (
      <EmptyState
        title="No invitations found"
        description={<NoResultsDescription filters={filters} />}
        action={
          <button type="button" className="btn btn-secondary btn-md" onClick={() => handleSearch(EMPTY_FILTERS)}>
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
      {/* The key resets the fields when the URL changes from outside (Back button, Clear search) */}
      <SearchBar key={`${filters.query}|${filters.status}`} initialFilters={filters} onSearch={handleSearch} />

      <div className="invitation-list-summary" role="status" aria-live="polite">
        <span className="invitation-list-count">
          {isLoading ? "Loading invitations…" : isError ? "Results unavailable" : countLabel}
        </span>
        {isFilled && (
          <span className="invitation-list-range">
            <span className="invitation-list-range-label">Showing </span>
            {formatNumber(firstIndex + 1)}–{formatNumber(firstIndex + rows.length)}
            <span className="invitation-list-range-total"> of {formatNumber(total)}</span>
          </span>
        )}
        {isFilled && <span className="invitation-list-scroll-hint">Scroll the table sideways for Manage →</span>}
      </div>

      <InvitationTable
        rows={rows}
        total={total}
        isLoading={isLoading}
        message={message}
        highlightedId={actions.highlightedId}
        onReissue={(invitation) => actions.open("reissue", invitation)}
        onRevoke={(invitation) => actions.open("revoke", invitation)}
      />

      {isFilled && <Pagination page={page} totalPages={totalPages} onPageChange={(next) => navigate(filters, next)} />}

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
