"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import AdminHeader from "@/components/layout/AdminHeader";
import AdminSidebar from "@/components/layout/AdminSidebar";

interface AdminShellProps {
  accountEmail: string;
  children: ReactNode; // server-rendered page content, passed straight through
}

// Header + sidebar + main area. Owns the drawer state used below 1024px
export default function AdminShell({ accountEmail, children }: AdminShellProps) {
  const [isNavOpen, setIsNavOpen] = useState(false);

  function toggle() {
    setIsNavOpen((open) => !open);
  }

  function close() {
    setIsNavOpen(false);
  }

  // Esc closes the drawer. The listener exists only while the drawer is open
  useEffect(() => {
    if (!isNavOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsNavOpen(false);
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isNavOpen]);

  return (
    <div className="admin-layout">
      <AdminHeader accountEmail={accountEmail} isNavOpen={isNavOpen} onMenuClick={toggle} />
      <div className="admin-layout-body">
        <AdminSidebar isOpen={isNavOpen} onNavigate={close} />
        {isNavOpen && <button type="button" className="admin-scrim" aria-label="Close menu" onClick={close} />}
        <main className="admin-layout-main">
          <div className="admin-layout-content">{children}</div>
        </main>
      </div>
    </div>
  );
}
