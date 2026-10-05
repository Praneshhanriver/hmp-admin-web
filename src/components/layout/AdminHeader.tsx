import Link from "next/link";
import { CaretDown, List, UserCircle } from "@phosphor-icons/react/dist/ssr";

interface AdminHeaderProps {
  accountEmail: string;
  isNavOpen: boolean;
  onMenuClick: () => void;
}

// Top bar: menu button (below 1024px), product name + account menu. No role switch (spec, 2026-08-07)
export default function AdminHeader({ accountEmail, isNavOpen, onMenuClick }: AdminHeaderProps) {
  return (
    <header className="admin-header">
      <button
        type="button"
        className="admin-header-menu"
        aria-expanded={isNavOpen}
        aria-controls="admin-nav"
        onClick={onMenuClick}
      >
        <List className="icon-md" aria-hidden />
        Menu
      </button>
      <Link href="/" className="admin-header-brand">
        <span className="admin-header-title">HMP Administration</span>
        <span className="admin-header-title-short">HMP Admin</span>
        <span className="admin-header-subtitle">Telemedicine operations</span>
      </Link>
      <button
        type="button"
        className="admin-header-account"
        aria-haspopup="menu"
        aria-label={`Account menu, ${accountEmail}`}
      >
        <UserCircle className="icon-md" aria-hidden />
        <span className="admin-header-account-email">{accountEmail}</span>
        <span className="admin-header-account-short">Account</span>
        <CaretDown className="icon-sm admin-header-account-caret" aria-hidden />
      </button>
    </header>
  );
}
