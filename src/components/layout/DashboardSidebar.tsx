"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import type { ComponentType } from "react";
import {
  Sparkles,
  Flag,
  BadgeCheck,
  UsersRound,
  Award,
  ScrollText,
  UserRound,
  CircleDollarSign,
  Ticket,
  LayoutDashboard,
  X,
} from "lucide-react";
import PyramidLogo from "@/components/ui/PyramidLogo";
import { useDashboardDict } from "@/hooks/useDashboardDict";

type NavItem = { href: string; icon: ComponentType<{ className?: string }>; emphasize?: boolean };

/** Single flat menu — priority order from product spec */
const mainNav: NavItem[] = [
  { href: "/dashboard", icon: LayoutDashboard },
  { href: "/challenge", icon: Sparkles, emphasize: true },
  { href: "/dashboard/challenges", icon: Flag },
  { href: "/dashboard/payouts", icon: CircleDollarSign },
  { href: "/dashboard/kyc", icon: BadgeCheck },
  { href: "/dashboard/affiliate", icon: UsersRound },
  { href: "/dashboard/certificates", icon: Award },
  { href: "/rules", icon: ScrollText },
  { href: "/dashboard/support", icon: Ticket },
  { href: "/dashboard/profile", icon: UserRound },
];

function pathActive(pathname: string, href: string): boolean {
  if (href === "/dashboard") {
    return pathname === "/dashboard" || pathname === "/dashboard/";
  }
  if (href === "/challenge") return pathname === "/challenge" || pathname.startsWith("/challenge/");
  if (href === "/rules") return pathname === "/rules" || pathname.startsWith("/rules/");
  return pathname === href || pathname.startsWith(`${href}/`);
}

interface DashboardSidebarProps {
  onToggle?: () => void;
  mobile?: boolean;
}

export default function DashboardSidebar({ onToggle, mobile = false }: DashboardSidebarProps) {
  const pathname = usePathname();
  const { dict } = useDashboardDict();

  return (
    <motion.aside
      initial={mobile ? undefined : { x: -10, opacity: 0 }}
      animate={mobile ? undefined : { x: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`dashboard-sidebar flex flex-col w-[var(--sidebar-w,220px)] max-w-[220px] overflow-hidden ${
        mobile ? "h-full" : "fixed left-0 top-0 bottom-0 z-40"
      }`}
      style={{
        background: "linear-gradient(160deg, rgba(14,20,38,0.98), rgba(8,12,22,0.99))",
        borderRight: "1px solid rgba(255,215,0,0.14)",
        backdropFilter: "blur(20px)",
      }}
    >
      <div
        className="h-16 px-4 flex items-center justify-between shrink-0"
        style={{ borderBottom: "1px solid rgba(255,215,0,0.1)" }}
      >
        <PyramidLogo size="sm" animate={false} />
        {mobile ? (
          <button
            type="button"
            onClick={onToggle}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-neutral-500 hover:text-gold-300 hover:bg-gold-500/10 transition-colors"
            aria-label={dict.sidebar.toggleSidebar}
          >
            <X className="w-4 h-4" />
          </button>
        ) : (
          <span className="w-7" aria-hidden />
        )}
      </div>

      <nav className="flex-1 overflow-y-auto scrollbar-none py-4 px-3 min-h-0">
        <p className="text-[9.5px] uppercase tracking-[0.2em] font-semibold text-neutral-500 px-2 mb-1.5">
          {dict.sidebar.groups.menu}
        </p>
        <div className="space-y-0.5">
          {mainNav.map(({ href, icon: Icon, emphasize }) => {
            const isActive = pathActive(pathname, href);
            const label = dict.sidebar.links[href as keyof typeof dict.sidebar.links] ?? href;
            return (
              <Link key={href} href={href} onClick={mobile ? onToggle : undefined} className="group">
                <motion.div
                  whileHover={{ x: 2 }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  className={`dash-nav-item ${isActive ? "active" : ""} ${
                    emphasize
                      ? isActive
                        ? "ring-1 ring-amber-400/50 bg-amber-500/[0.12]"
                        : "border border-white/[0.07] bg-white/[0.02]"
                      : ""
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                      isActive
                        ? "bg-gradient-to-br from-amber-400/25 to-amber-600/15 border border-amber-300/45"
                        : "bg-white/5 border border-transparent"
                    }`}
                  >
                    <Icon
                      className={`w-3.5 h-3.5 transition-colors ${
                        isActive ? "text-amber-200" : "text-neutral-500 group-hover:text-neutral-300"
                      }`}
                    />
                  </div>
                  <span
                    className={`truncate text-[12.5px] leading-snug transition-colors ${
                      isActive ? "text-[#ffe9a8]" : "text-neutral-400"
                    }`}
                  >
                    {label}
                  </span>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="px-3 py-3 shrink-0 mt-auto" style={{ borderTop: "1px solid rgba(255,215,0,0.1)" }}>
        <div className="flex items-center gap-2 px-2">
          <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse shrink-0" />
          <span className="text-[10px] text-neutral-600 leading-snug">{dict.sidebar.systemsOnline}</span>
        </div>
      </div>
    </motion.aside>
  );
}
