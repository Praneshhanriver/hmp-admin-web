import Link from "next/link";
import type { Icon } from "@phosphor-icons/react";
import { GearSix, Stethoscope, Users, VideoCamera } from "@phosphor-icons/react/dist/ssr";

export type NavKey = "patients" | "doctor-list" | "invitations" | "consultations" | "settings";

interface NavItem {
  key: NavKey | "doctors";
  label: string;
  href: string;
  icon?: Icon;
  children?: NavItem[];
}

const NAV_ITEMS: NavItem[] = [
  { key: "patients", label: "Patient management", href: "/patients/list", icon: Users },
  {
    key: "doctors",
    label: "Doctor management",
    href: "/doctors/list",
    icon: Stethoscope,
    children: [
      { key: "doctor-list", label: "Doctor list", href: "/doctors/list" },
      { key: "invitations", label: "Invitations", href: "/doctors/invitations/list" },
    ],
  },
  { key: "consultations", label: "Consultation status", href: "/consultations", icon: VideoCamera },
  { key: "settings", label: "Settings", href: "/settings", icon: GearSix },
];

interface AdminSidebarProps {
  activeItem: NavKey;
}

// Left navigation. The current page gets aria-current="page" + filled background
export default function AdminSidebar({ activeItem }: AdminSidebarProps) {
  return (
    <nav id="admin-nav" className="admin-sidebar" aria-label="Administration">
      {NAV_ITEMS.map((item) => {
        const ItemIcon = item.icon;
        const isGroupActive = item.children?.some((child) => child.key === activeItem) ?? false;

        return (
          <div key={item.key} className="admin-sidebar-group">
            <Link
              href={item.href}
              className={`admin-sidebar-link ${isGroupActive ? "is-group-active" : ""}`}
            >
              {ItemIcon && <ItemIcon className="icon-md" weight={isGroupActive ? "fill" : "regular"} aria-hidden />}
              {item.label}
            </Link>

            {item.children?.map((child) => {
              const isActive = child.key === activeItem;
              return (
                <Link
                  key={child.key}
                  href={child.href}
                  className={`admin-sidebar-sublink ${isActive ? "is-active" : ""}`}
                  aria-current={isActive ? "page" : undefined}
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