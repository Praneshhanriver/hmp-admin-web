import AdminHeader from "@/components/layout/AdminHeader";
import AdminSidebar from "@/components/layout/AdminSidebar";

// Admin shell: wraps every page inside (main)
export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AdminHeader accountEmail="admin@hmp.co.kr" />
      <div className="admin-layout-body">
        <AdminSidebar />
        <main className="admin-layout-main">
          <div className="admin-layout-content">{children}</div>
        </main>
      </div>
    </>
  );
}
