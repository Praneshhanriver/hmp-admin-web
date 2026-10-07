import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import type { ApiError } from "@/api-services/apiClient";
import EmptyState from "@/components/common/EmptyState";
import ErrorState from "@/components/common/ErrorState";
import { ROUTES } from "@/constants/invitation";

interface InvitationLoadFallbackProps {
  isLoading: boolean;
  error: ApiError | null;
  isInvalidId: boolean; // the URL holds something that is not an invitation number
  onRetry: () => void;
}

// What the detail and edit screens show before they have an invitation:
// loading placeholder, "not found" (with a way back) or the error with Retry. null = nothing to show
export default function InvitationLoadFallback({ isLoading, error, isInvalidId, onRetry }: InvitationLoadFallbackProps) {
  if (isInvalidId || error?.isNotFound) {
    return (
      <div className="invitation-detail-card">
        <EmptyState
          title="Invitation not found"
          description="This invitation does not exist. It may have been entered incorrectly."
          action={
            <Link href={ROUTES.list} className="btn btn-secondary btn-md">
              <ArrowLeft aria-hidden /> Back to the list
            </Link>
          }
        />
      </div>
    );
  }
  if (error) {
    return (
      <div className="invitation-detail-card">
        <ErrorState title="Unable to load the invitation" description={error.message} onRetry={onRetry} />
      </div>
    );
  }
  if (isLoading) {
    return (
      <div className="invitation-detail-card is-loading" aria-busy="true">
        <span className="visually-hidden" role="status">
          Loading the invitation…
        </span>
        <span className="skeleton-bar invitation-detail-skeleton-title" aria-hidden />
        <span className="skeleton-bar" aria-hidden />
        <span className="skeleton-bar" aria-hidden />
        <span className="skeleton-bar" aria-hidden />
      </div>
    );
  }
  return null;
}
