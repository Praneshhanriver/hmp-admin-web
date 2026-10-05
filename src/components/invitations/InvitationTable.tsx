import Link from "next/link";
import { ArrowClockwise, FileText, PencilSimple, Prohibit } from "@phosphor-icons/react/dist/ssr";
import StatusChip from "@/components/common/StatusChip";
import type { Invitation } from "@/types/invitation";
import { formatShortDate, maskMobile } from "@/utils/format";
import { canEdit, canOpenDetail, canReissue, canRevoke } from "@/utils/invitationRules";
import type { ReactNode } from "react";

const COLUMN_COUNT = 7;
const SKELETON_ROW_COUNT = 6;

interface InvitationTableProps {
  rows: Invitation[];
  total: number;
  isLoading: boolean;
  message?: ReactNode; // empty or error state, shown inside the table
}

// p.113c table: 7 columns, actions depend on status
export default function InvitationTable({ rows, total, isLoading, message }: InvitationTableProps) {
  // Exactly one of: skeleton, message, or the real rows
  function renderBody() {
    if (isLoading) return <SkeletonRows />;
    if (message) {
      return (
        <tr>
          <td colSpan={COLUMN_COUNT} className="invitation-table-message">
            {message}
          </td>
        </tr>
      );
    }
    return rows.map((row) => <InvitationRow key={row.id} invitation={row} />);
  }

  return (
    <div className="invitation-table-card">
      <div className="invitation-table-scroll">
        <table className="invitation-table" aria-busy={isLoading}>
          <caption className="visually-hidden">Doctor invitations, {total} results</caption>
          <thead>
            <tr>
              <th scope="col">Doctor</th>
              <th scope="col">Contact</th>
              <th scope="col">Issued</th>
              <th scope="col" className="is-numeric">Re-issues</th>
              <th scope="col">Expiry (TBC)</th>
              <th scope="col">Status</th>
              <th scope="col">Manage</th>
            </tr>
          </thead>
          <tbody>{renderBody()}</tbody>
        </table>
      </div>
    </div>
  );
}

// One table row. Kept in the same file because only the table uses it
function InvitationRow({ invitation }: { invitation: Invitation }) {
  const { id, doctorName, mobile, status, issuedAt, expiresAt, reissueCount } = invitation;
  const name = doctorName ?? "No information";
  const detailHref = `/doctors/invitations/details/${id}`;

  return (
    <tr>
      <th scope="row">
        <Link href={detailHref} className={doctorName ? "invitation-name" : "invitation-name is-missing"}>
          {name}
        </Link>
      </th>
      <td className="is-secondary">{maskMobile(mobile)}</td>
      <td>{formatShortDate(issuedAt)}</td>
      <td className="is-numeric">{reissueCount}</td>
      <td>{formatShortDate(expiresAt)}</td>
      <td>
        <StatusChip status={status} />
      </td>
      <td>
        <div className="invitation-actions">
          {canReissue(status) && (
            <button type="button" className="btn btn-secondary btn-sm" aria-label={`Re-issue invitation for ${name}`}>
              <ArrowClockwise aria-hidden /> Re-issue
            </button>
          )}
          {canRevoke(status) && (
            <button type="button" className="btn btn-danger-outline btn-sm" aria-label={`Revoke invitation for ${name}`}>
              <Prohibit aria-hidden /> Revoke
            </button>
          )}
          {canOpenDetail(status) && (
            <Link href={detailHref} className="btn btn-secondary btn-sm" aria-label={`View invitation detail for ${name}`}>
              <FileText aria-hidden /> Detail
            </Link>
          )}
          {canEdit(status) && (
            <Link href={`/doctors/invitations/edit/${id}`} className="btn btn-link btn-sm" aria-label={`Edit invitation for ${name}`}>
              <PencilSimple aria-hidden /> Edit
            </Link>
          )}
        </div>
      </td>
    </tr>
  );
}

// Grey placeholder rows shown while the list is loading
function SkeletonRows() {
  return Array.from({ length: SKELETON_ROW_COUNT }, (_, rowIndex) => (
    <tr key={rowIndex} className="invitation-table-skeleton" aria-hidden>
      {Array.from({ length: COLUMN_COUNT }, (_, cellIndex) => (
        <td key={cellIndex}>
          <span className="skeleton-bar" />
        </td>
      ))}
    </tr>
  ));
}
