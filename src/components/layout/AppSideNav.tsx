import Link from "next/link";

const NAV_ITEMS = [
  { label: "Patient management", href: "/patients/list" },
  { label: "Doctor management", href: "/doctors/invitations/list" },
  { label: "Consultation status", href: "/consultations" },
  { label: "Settings", href: "/settings" },
];

// Left navigation, 4 items (spec p.112)
export default function AppSideNav() {
  return (
    <nav className="app-sidenav" aria-label="Main">
      <ul className="app-sidenav-list">
        {NAV_ITEMS.map((item) => (
          <li key={item.href}>
            <Link href={item.href} className="app-sidenav-link">
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}