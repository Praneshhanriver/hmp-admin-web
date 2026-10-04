import AppTopBar from "@/components/layout/AppTopBar";
import AppSideNav from "@/components/layout/AppSideNav";

// Admin shell: wraps every page inside (main)
export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-shell">
      <AppTopBar accountEmail="admin@hmp.co.kr" />
      <div className="app-shell-body">
        <AppSideNav />
        <main className="app-shell-content">{children}</main>
      </div>
    </div>
  );
}