"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  Zap,
  LayoutDashboard,
  Users,
  Trophy,
  Banknote,
  FileCheck,
  Settings,
  LogOut,
  ShieldAlert,
  Bell,
  Radar,
  LineChart,
  Plug,
  Database,
  ClipboardList,
  KeyRound,
  Sliders,
} from "lucide-react";

type Snapshot = {
  ok?: boolean;
  mtTelemetry?: { alertsUnacked?: number };
  traderIngest?: { accounts?: number };
};

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
  badge?: number;
};

type NavGroup = { title: string; items: NavItem[] };

const groups: NavGroup[] = [
  {
    title: "Overview",
    items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true }],
  },
  {
    title: "Risk & data",
    items: [
      { href: "/admin/mt-monitor", label: "MT monitor", icon: Radar },
      { href: "/admin/trader-data", label: "Trader sync", icon: Database },
      { href: "/admin/integrations", label: "Integrations", icon: Plug },
    ],
  },
  {
    title: "Platform",
    items: [
      { href: "/admin/users", label: "Users", icon: Users },
      { href: "/admin/challenges", label: "Challenges", icon: Trophy },
      { href: "/admin/orders", label: "Orders", icon: ClipboardList },
      { href: "/admin/provisioning", label: "MT provisioning", icon: KeyRound },
      { href: "/admin/payouts", label: "Payouts", icon: Banknote },
      { href: "/admin/kyc", label: "KYC review", icon: FileCheck },
    ],
  },
  {
    title: "Content",
    items: [
      { href: "/admin/leaderboard", label: "Leaderboard", icon: Trophy },
      { href: "/admin/payout-proofs", label: "Payout proofs", icon: Banknote },
      { href: "/admin/scaling-plan", label: "Scaling plan", icon: LineChart },
      { href: "/admin/affiliate-program", label: "Affiliate ops", icon: Users },
      { href: "/admin/platform-settings", label: "Platform settings", icon: Sliders },
    ],
  },
  {
    title: "Broadcast",
    items: [{ href: "/admin/announcements", label: "Announcements", icon: Bell }],
  },
  {
    title: "System",
    items: [{ href: "/admin/settings", label: "Settings", icon: Settings }],
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [snap, setSnap] = useState<Snapshot | null>(null);

  const loadSnap = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/snapshot", { credentials: "include" });
      const j = (await res.json()) as Snapshot;
      if (res.ok) setSnap(j);
    } catch {
      setSnap(null);
    }
  }, []);

  useEffect(() => {
    loadSnap();
  }, [loadSnap]);

  const mtUnacked = snap?.mtTelemetry?.alertsUnacked ?? 0;
  const traderAccounts = snap?.traderIngest?.accounts ?? 0;

  const itemsWithBadges = (items: NavItem[]): NavItem[] =>
    items.map((item) => {
      if (item.href === "/admin/mt-monitor" && mtUnacked > 0) {
        return { ...item, badge: mtUnacked };
      }
      if (item.href === "/admin/trader-data" && traderAccounts > 0) {
        return { ...item, badge: traderAccounts };
      }
      return item;
    });

  const logout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST", credentials: "include" });
    } finally {
      router.push("/admin/login");
      router.refresh();
    }
  };

  return (
    <aside className="admin-sidebar-root w-60 flex-shrink-0 flex flex-col min-h-screen">
      <div className="admin-sidebar-crest px-5 pt-6 pb-5 border-b border-[rgba(212,175,55,0.1)]">
        <Link href="/admin" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-lg bg-gold-gradient flex items-center justify-center ring-1 ring-[rgba(212,175,55,0.35)] shadow-[0_0_20px_rgba(255,215,0,0.12)]">
            <Zap className="w-4 h-4 text-black fill-black" />
          </div>
          <div>
            <span className="admin-page-title text-lg leading-none text-[#faf6ef]">Axon</span>
            <span className="text-[10px] uppercase tracking-[0.22em] text-[#b8a88a] font-semibold block mt-1">
              Control Room
            </span>
          </div>
        </Link>
        <div className="flex items-center gap-1.5 mt-4 px-2.5 py-1.5 rounded-md border border-danger/25 bg-danger/[0.07] w-fit">
          <ShieldAlert className="w-3 h-3 text-danger shrink-0" />
          <span className="text-[10px] text-danger/95 font-medium tracking-wide">Restricted access</span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-5 space-y-6 overflow-y-auto">
        {groups.map((group) => (
          <div key={group.title}>
            <p className="px-3 mb-2 text-[10px] uppercase tracking-[0.2em] text-[#6d6860] font-semibold">{group.title}</p>
            <div className="space-y-1">
              {itemsWithBadges(group.items).map((item) => {
                const active =
                  item.exact === true
                    ? pathname === item.href
                    : pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`admin-nav-link flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all relative ${
                      active
                        ? "admin-nav-link-active"
                        : "text-[#8f8a82] hover:text-[#ebe6dc] hover:bg-[rgba(255,255,255,0.04)]"
                    }`}
                  >
                    <item.icon className="w-4 h-4 flex-shrink-0 opacity-90" />
                    {item.label}
                    {item.badge != null && item.badge > 0 ? (
                      <span className="ml-auto min-w-[1.25rem] text-center bg-danger text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                        {item.badge > 99 ? "99+" : item.badge}
                      </span>
                    ) : null}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-[rgba(212,175,55,0.08)] space-y-1 mt-auto">
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[#8f8a82] hover:text-[#ebe6dc] hover:bg-[rgba(255,255,255,0.04)] transition-all"
        >
          <Zap className="w-4 h-4" />
          View live site
        </Link>
        <button
          type="button"
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-danger/75 hover:text-danger hover:bg-danger/[0.08] transition-all text-left"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
