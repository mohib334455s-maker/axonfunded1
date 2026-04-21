"use client";

import { usePathname } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminAppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === "/admin/login";

  if (isLogin) {
    return <div className="admin-theme min-h-screen">{children}</div>;
  }

  return (
    <div className="admin-theme min-h-screen flex">
      <AdminSidebar />
      <main className="flex-1 min-w-0 overflow-auto min-h-screen">
        <div className="admin-main-vignette min-h-full">
          <div className="max-w-7xl mx-auto px-5 py-7 sm:px-7 sm:py-9 lg:px-10 lg:py-10">{children}</div>
        </div>
      </main>
    </div>
  );
}
