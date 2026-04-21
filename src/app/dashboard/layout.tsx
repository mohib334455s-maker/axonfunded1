"use client";

import { useState } from "react";
import DashboardSidebar from "@/components/layout/DashboardSidebar";
import DashboardTopbar from "@/components/layout/DashboardTopbar";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import { AnimatePresence, motion } from "framer-motion";
import { useIsRTL } from "@/contexts/ThemeContext";
import type { ReactNode } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const isRTL = useIsRTL();

  // RTL: sidebar slides from the right side
  const slideFrom = isRTL ? 240 : -240;

  return (
    <div className="dashboard-theme min-h-screen relative">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 dashboard-layout-bg"
        style={{ background: "#050506" }}
      />
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <DashboardSidebar onToggle={() => setMobileSidebarOpen(false)} />
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/75 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: slideFrom }}
              animate={{ x: 0 }}
              exit={{ x: slideFrom }}
              transition={{ type: "spring", damping: 26, stiffness: 300 }}
              className="mobile-sidebar-slide fixed top-0 bottom-0 w-[min(100vw,280px)] max-w-[280px] z-50 lg:hidden"
              style={isRTL ? { right: 0 } : { left: 0 }}
            >
              <DashboardSidebar
                mobile
                onToggle={() => setMobileSidebarOpen(false)}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Topbar */}
      <DashboardTopbar onMenuToggle={() => setMobileSidebarOpen(true)} />

      {/* Main Content */}
      <main className="dashboard-main dashboard-fintech min-h-screen pt-[72px] pb-24 lg:pb-8 flex flex-col items-center">
        <div className="w-full max-w-[1920px] mx-auto px-4 lg:px-8 py-6 lg:py-8">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <MobileBottomNav />
    </div>
  );
}
