"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Icon } from "@phosphor-icons/react";
import { GearSix, Stethoscope, Users, VideoCamera } from "@phosphor-icons/react";

interface NavItem {
  key: string;
  label: string;
  href: string;
  match: string; // URL prefix that makes this item "current"
  icon?: Icon;
  children?: NavItem[];
  isBuilt?: boolean; // false: screen outside this feature, not built yet (link 404s)
}

const NAV_ITEMS: NavItem[] = [
  { key: "patients", label: "Patient management", href: "/patients/list", match: "/patients", icon: Users, isBuilt: false },
  {
    key: "doctors",
    label: "Doctor management",
    href: "/doctors/list",
    match: "/doctors",
    icon: Stethoscope,
    isBuilt: false,
    children: [
      { key: "doctor-list", label: "Doctor list", href: "/doctors/list", match: "/doctors/list", isBuilt: false },
      { key: "invitations", label: "Invitations", href: "/doctors/invitations/list", match: "/doctors/invitations" },
    ],
  },
  { key: "consultations", label: "Consultation status", href: "/consultations", match: "/consultations", icon: VideoCamera, isBuilt: false },
  { key: "settings", label: "Settings", href: "/settings", match: "/settings", icon: GearSix, isBuilt: false },
];

// "/doctors/invitations/details/5" is inside "/doctors/invitations"
function isCurrent(pathname: string, match: string): boolean {
  return pathname === match || pathname.startsWith(`${match}/`);
}

interface AdminSidebarProps {
  isOpen: boolean; // drawer state, only matters below 1024px
  onNavigate: () => void; // closes the drawer after a link is chosen
}

// Left navigation. Reads the URL to mark the current page
export default function AdminSidebar({ isOpen, onNavigate }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <nav id="admin-nav" className={isOpen ? "admin-sidebar is-open" : "admin-sidebar"} aria-label="Administration">
      {NAV_ITEMS.map((item) => {
        const ItemIcon = item.icon;
        const isItemCurrent = isCurrent(pathname, item.match);
        const hasChildren = Boolean(item.children);
        // A top-level item is the current page only if it has no sub-items
        const isActive = isItemCurrent && !hasChildren;

        return (
          <div key={item.key} className="admin-sidebar-group">
            <Link
              href={item.href}
              prefetch={item.isBuilt !== false} // no background request (and console 404) for screens not built yet
              className={`admin-sidebar-link ${isActive ? "is-active" : ""} ${isItemCurrent && hasChildren ? "is-group-active" : ""}`}
              aria-current={isActive ? "page" : undefined}
              onClick={onNavigate}
            >
              {ItemIcon && <ItemIcon className="icon-md" weight={isItemCurrent ? "fill" : "regular"} aria-hidden />}
              {item.label}
            </Link>

            {item.children?.map((child) => {
              const isChildActive = isCurrent(pathname, child.match);
              return (
                <Link
                  key={child.key}
                  href={child.href}
                  prefetch={child.isBuilt !== false}
                  className={`admin-sidebar-sublink ${isChildActive ? "is-active" : ""}`}
                  aria-current={isChildActive ? "page" : undefined}
                  onClick={onNavigate}
                >
                  {child.label}
                </Link>
              );
            })}
          </div>
        );
      })}
    </nav>
  );
}