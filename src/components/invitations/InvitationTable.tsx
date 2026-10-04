import Link from "next/link";
import { ArrowClockwise, FileText, PencilSimple, Prohibit } from "@phosphor-icons/react/dist/ssr";
import StatusChip from "@/components/common/StatusChip";
import type { Invitation } from "@/types/invitation";
import { formatShortDate, maskMobile } from "@/utils/format";
import { canEdit, canOpenDetail, canReissue, canRevoke } from "@/utils/invitationRules";

interface InvitationTableProps {
  rows: Invitation[];
  total: number;
}

// p.113c table: 7 columns, actions depend on status
export default function InvitationTable({ rows, total }: InvitationTableProps) {
  return (
    <div className="invitation-table-card">
      <div className="invitation-table-scroll">
        <table className="invitation-table">
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
          <tbody>
            {rows.map((row) => (
              <InvitationRow key={row.id} invitation={row} />
            ))}
          </tbody>
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