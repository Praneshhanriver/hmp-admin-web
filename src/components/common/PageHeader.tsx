import Link from "next/link";
import { CaretRight, Plus } from "@phosphor-icons/react/dist/ssr";

interface PageHeaderProps {
  title: string;
  crumb: string;
  showIssue?: boolean; // optional: defaults to false
}

// Breadcrumb + H1 + optional "Issue invitation" action (Hi-Fi C-00)
export default function PageHeader({ title, crumb, showIssue = false }: PageHeaderProps) {
  return (
    <div className="page-header">
      <nav className="page-header-crumbs" aria-label="Breadcrumb">
        <span>Doctor management</span>
        <CaretRight className="icon-sm" aria-hidden />
        <span aria-current="page">{crumb}</span>
      </nav>

      <div className="page-header-row">
        <h1 className="page-header-title">{title}</h1>
        {showIssue && (
          <Link href="/doctors/invitations/create" className="btn btn-primary btn-md">
            <Plus className="icon-md" aria-hidden />
            Issue invitation
          </Link>
        )}
      </div>
    </div>
  );
}