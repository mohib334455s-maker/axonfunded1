"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Search, ChevronDown, Menu, User, LogOut, ShieldCheck, Settings, BriefcaseBusiness } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { clearTraderAccessCookies } from "@/lib/trader-access";

interface DashboardTopbarProps {
  onMenuToggle?: () => void;
}

export default function DashboardTopbar({ onMenuToggle }: DashboardTopbarProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [displayEmail, setDisplayEmail] = useState("");
  const router = useRouter();

  useEffect(() => {
    try {
      const saved = localStorage.getItem("profileForm");
      if (saved) {
        const p = JSON.parse(saved);
        const name = p.firstName
          ? `${p.firstName}${p.lastName ? " " + p.lastName[0] + "." : ""}`
          : p.name || "Trader";
        setDisplayName(name.trim());
        if (p.email) setDisplayEmail(p.email);
      }
    } catch { /* ignore */ }
  }, []);

  const handleSignOut = () => {
    clearTraderAccessCookies();
    router.push("/");
    router.refresh();
  };

  const closeAll = () => { setShowNotifications(false); setShowProfile(false); };

  return (
    <header
      className="dashboard-topbar fixed top-0 right-0 left-0 lg:left-[220px] z-30"
      style={{
        background: "linear-gradient(180deg, rgba(10,14,24,0.97), rgba(8,12,20,0.98))",
        borderBottom: "1px solid rgba(255,215,0,0.1)",
        backdropFilter: "blur(20px) saturate(180%)",
        boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
      }}
    >
      <div className="h-16 flex items-center px-4 sm:px-6 gap-3">

        {/* Mobile menu toggle */}
        <div className="flex items-center gap-3 lg:hidden">
          <button
            onClick={onMenuToggle}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-gold-500/25 text-gold-300 hover:text-white hover:bg-gold-500/12 transition-all"
            aria-label="Open menu"
          >
            <Menu className="w-4.5 h-4.5" />
          </button>
          <span className="text-[10px] font-bold tracking-[0.22em] uppercase text-gold-400/70">
            Dashboard
          </span>
        </div>

        {/* Desktop search */}
        <div className="hidden lg:flex items-center gap-2 px-3.5 py-2 rounded-xl flex-1 max-w-xs"
          style={{
            background: "rgba(6,10,20,0.7)",
            border: "1px solid rgba(255,215,0,0.12)",
          }}
        >
          <Search className="w-3.5 h-3.5 text-gold-500/50 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent text-sm text-neutral-300 placeholder-neutral-600 outline-none flex-1 min-w-0"
          />
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2.5 ms-auto">

          {/* 2FA badge */}
          <Link
            href="/dashboard/profile"
            className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-gold-200/80 hover:text-gold-100 transition-colors"
            style={{
              background: "rgba(255,215,0,0.07)",
              border: "1px solid rgba(255,215,0,0.2)",
            }}
          >
            <ShieldCheck className="w-3 h-3" />
            Enable 2FA
          </Link>

          {/* Online status */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg"
            style={{ background: "rgba(6,10,20,0.7)", border: "1px solid rgba(0,200,83,0.2)" }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-success opacity-90" />
            <span className="text-[11px] font-medium text-neutral-300">Online</span>
          </div>

          {/* Notifications */}
          <div className="relative">
            <motion.button
              whileTap={{ scale: 0.93 }}
              onClick={() => { setShowNotifications(!showNotifications); setShowProfile(false); }}
              className="relative w-9 h-9 flex items-center justify-center rounded-xl border text-neutral-400 hover:text-white transition-all"
              style={{ border: "1px solid rgba(255,215,0,0.16)", background: "rgba(6,10,20,0.6)" }}
            >
              <Bell className="w-4 h-4" />
            </motion.button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-12 w-76 rounded-2xl overflow-hidden z-50"
                  style={{
                    background: "linear-gradient(160deg, rgba(14,20,38,0.98), rgba(8,12,22,0.99))",
                    border: "1px solid rgba(255,215,0,0.16)",
                    boxShadow: "0 16px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,215,0,0.06)",
                    backdropFilter: "blur(16px)",
                  }}
                >
                  <div className="px-4 py-3 flex items-center justify-between"
                    style={{ borderBottom: "1px solid rgba(255,215,0,0.1)" }}>
                    <span className="text-sm font-semibold text-white">Notifications</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full text-neutral-500"
                      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)" }}>
                      0 unread
                    </span>
                  </div>
                  <div className="px-4 py-8 text-center">
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center mx-auto mb-3"
                      style={{ background: "rgba(255,215,0,0.07)", border: "1px solid rgba(255,215,0,0.14)" }}>
                      <Bell className="w-5 h-5 text-gold-500/50" />
                    </div>
                    <p className="text-sm text-neutral-500">No new notifications</p>
                    <p className="text-xs text-neutral-700 mt-1">You&apos;re all caught up</p>
                  </div>
                  <div className="px-4 pb-3">
                    <Link href="/dashboard/notifications" onClick={closeAll}
                      className="block text-center text-xs text-gold-500/70 hover:text-gold-400 py-2 rounded-xl transition-colors"
                      style={{ background: "rgba(255,215,0,0.05)" }}>
                      View all notifications
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Profile */}
          <div className="relative">
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => { setShowProfile(!showProfile); setShowNotifications(false); }}
              className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-xl hover:bg-gold-500/8 transition-all"
              style={{ border: "1px solid transparent" }}
            >
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center text-gold-300 flex-shrink-0"
                style={{
                  background: "linear-gradient(135deg, rgba(255,215,0,0.18), rgba(255,215,0,0.08))",
                  border: "1px solid rgba(255,215,0,0.3)",
                }}
              >
                <User className="w-4 h-4" />
              </div>
              <div className="hidden sm:block text-start">
                <p className="text-[12px] font-bold text-white leading-tight">
                  {displayName || "—"}
                </p>
                <p className="text-[10px] text-neutral-600 leading-tight truncate max-w-[140px]">
                  {displayEmail || "—"}
                </p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-neutral-600 hidden sm:block" />
            </motion.button>

            <AnimatePresence>
              {showProfile && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-12 w-56 rounded-2xl overflow-hidden z-50"
                  style={{
                    background: "linear-gradient(160deg, rgba(14,20,38,0.98), rgba(8,12,22,0.99))",
                    border: "1px solid rgba(255,215,0,0.16)",
                    boxShadow: "0 16px 48px rgba(0,0,0,0.6)",
                    backdropFilter: "blur(16px)",
                  }}
                >
                  {/* User info */}
                  <div className="px-4 py-3.5" style={{ borderBottom: "1px solid rgba(255,215,0,0.1)" }}>
                    <p className="text-sm font-bold text-white">{displayName}</p>
                    <p className="text-[11px] text-neutral-500 mt-0.5">{displayEmail}</p>
                  </div>

                  {/* Menu items */}
                  <div className="py-1.5">
                    {[
                      { label: "My Accounts",    href: "/dashboard/accounts",  icon: BriefcaseBusiness },
                      { label: "Account Center", href: "/dashboard/account",   icon: null },
                      { label: "Profile",        href: "/dashboard/profile",   icon: Settings },
                      { label: "Certificates",   href: "/dashboard/certificates", icon: null },
                      { label: "Help Center",    href: "/blog",                icon: null },
                    ].map((item) => (
                      <Link
                        key={item.label}
                        href={item.href}
                        onClick={closeAll}
                        className="flex items-center px-4 py-2.5 text-[13px] text-neutral-400 hover:text-white hover:bg-gold-500/6 transition-colors"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>

                  {/* Sign out */}
                  <div style={{ borderTop: "1px solid rgba(255,215,0,0.08)" }} className="py-1.5">
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-danger hover:bg-danger/8 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Thin gold accent line at very bottom */}
      <div className="h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(255,215,0,0.2), transparent)" }} />
    </header>
  );
}

