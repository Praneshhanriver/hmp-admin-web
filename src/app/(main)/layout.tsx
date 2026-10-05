import AdminShell from "@/components/layout/AdminShell";

// Admin shell: wraps every page inside (main). Stays a Server Component;
// the interactive drawer lives in the AdminShell client component
export default function MainLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell accountEmail="admin@hmp.co.kr">{children}</AdminShell>;
}
