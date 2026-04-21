import type { Metadata } from "next";
import { Cormorant_Garamond } from "next/font/google";
import AdminAppShell from "@/components/admin/AdminAppShell";

const adminDisplay = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-admin-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "Admin Panel", template: "%s | Axon Admin" },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${adminDisplay.variable} admin-font-scope`}>
      <AdminAppShell>{children}</AdminAppShell>
    </div>
  );
}
