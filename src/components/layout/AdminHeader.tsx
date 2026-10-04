import Link from "next/link";
import { CaretDown, UserCircle } from "@phosphor-icons/react/dist/ssr";

interface AdminHeaderProps {
  accountEmail: string;
}

// Top bar: product name + account menu. No role switch (spec, 2026-08-07)
export default function AdminHeader({ accountEmail }: AdminHeaderProps) {
  return (
    <header className="admin-header">
      <Link href="/" className="admin-header-brand">
        <span className="admin-header-title">HMP Administration</span>
        <span className="admin-header-subtitle">Telemedicine operations</span>
      </Link>
      <button
        type="button"
        className="admin-header-account"
        aria-haspopup="menu"
        aria-label={`Account menu, ${accountEmail}`}
      >
        <UserCircle className="icon-md" aria-hidden />
        {accountEmail}
        <CaretDown className="icon-sm" aria-hidden />
      </button>
    </header>
  );
}