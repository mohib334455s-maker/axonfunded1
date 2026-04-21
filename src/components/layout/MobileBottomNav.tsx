"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Flag, CircleDollarSign, Ticket, UserRound } from "lucide-react";
import { motion } from "framer-motion";
import { useDashboardDict } from "@/hooks/useDashboardDict";

const navItems = [
  { href: "/dashboard" as const, icon: LayoutDashboard },
  { href: "/dashboard/challenges" as const, icon: Flag },
  { href: "/dashboard/payouts" as const, icon: CircleDollarSign },
  { href: "/dashboard/support" as const, icon: Ticket },
  { href: "/dashboard/profile" as const, icon: UserRound },
];

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { dict } = useDashboardDict();

  return (
    <nav className="bottom-nav lg:hidden" aria-label="Mobile navigation" style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}>
      <div className="flex items-center justify-around px-0.5 py-2 gap-0.5">
        {navItems.map(({ href, icon: Icon }) => {
          const label = dict.sidebar.links[href];
          const isActive =
            href === "/dashboard"
              ? pathname === "/dashboard" || pathname === "/dashboard/"
              : pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-0.5 min-w-0 flex-1 max-w-[72px] py-1 px-0.5 rounded-xl"
            >
              <div className="relative flex items-center justify-center">
                {isActive && (
                  <motion.div
                    layoutId="bottomNavIndicator"
                    className="absolute inset-0 -m-1 rounded-lg bg-gold-500/10"
                  />
                )}
                <Icon
                  className={`w-[18px] h-[18px] sm:w-5 sm:h-5 relative z-10 transition-colors duration-200 ${
                    isActive ? "text-gold-500" : "text-neutral-500"
                  }`}
                />
              </div>
              <span
                className={`text-[8px] sm:text-[9px] font-medium transition-colors duration-200 w-full truncate text-center leading-tight px-0.5 ${
                  isActive ? "text-gold-500" : "text-neutral-600"
                }`}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
