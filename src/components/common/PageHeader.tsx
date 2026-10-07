import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft, CaretRight, Plus } from "@phosphor-icons/react/dist/ssr";
import { ROUTES } from "@/constants/invitation";

interface PageHeaderProps {
  title: string;
  crumb: string; // the current page, last in the breadcrumb
  backLink?: { label: string; href: string }; // "← Back to invitations" above the breadcrumb (Hi-Fi 1b–1d)
  tag?: ReactNode; // small label next to the title, e.g. "Editing"
  subtitle?: string; // one line under the title
  showIssue?: boolean; // optional: defaults to false
}

// Back link + breadcrumb + H1 (+ tag, subtitle) + optional "Issue invitation" action (Hi-Fi C-00)
export default function PageHeader({ title, crumb, backLink, tag, subtitle, showIssue = false }: PageHeaderProps) {
  return (
    <div className="page-header">
      {backLink && (
        <Link href={backLink.href} className="page-header-back">
          <ArrowLeft className="icon-md" aria-hidden />
          {backLink.label}
        </Link>
      )}

      <nav className="page-header-crumbs" aria-label="Breadcrumb">
        <span>Doctor management</span>
        <CaretRight className="icon-sm" aria-hidden />
        <span aria-current="page">{crumb}</span>
      </nav>

      <div className="page-header-row">
        <div className="page-header-heading">
          <div className="page-header-title-row">
            <h1 className="page-header-title">{title}</h1>
            {tag}
          </div>
          {subtitle && <p className="page-header-subtitle">{subtitle}</p>}
        </div>
        {showIssue && (
          <Link href={ROUTES.create} className="btn btn-primary btn-md">
            <Plus className="icon-md" aria-hidden />
            Issue invitation
          </Link>
        )}
      </div>
    </div>
  );
}
