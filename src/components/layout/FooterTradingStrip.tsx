"use client";

import type { LucideIcon } from "lucide-react";
import {
  MonitorSmartphone,
  Target,
  Percent,
  Shield,
  Layers3,
  Gauge,
  Landmark,
  LineChart,
  BookOpenCheck,
  Cpu,
  Wallet,
  CalendarClock,
  Scale,
  Sparkles,
} from "lucide-react";

const STRIP_ITEMS: { label: string; Icon: LucideIcon }[] = [
  { label: "MetaTrader 5", Icon: MonitorSmartphone },
  { label: "Phase 1 · 8%", Icon: Target },
  { label: "Phase 2 · 4%", Icon: Layers3 },
  { label: "5% daily drawdown", Icon: Percent },
  { label: "12% max static DD", Icon: Shield },
  { label: "1:100 leverage", Icon: Gauge },
  { label: "90% profit split", Icon: Landmark },
  { label: "Funded accounts", Icon: LineChart },
  { label: "Risk management", Icon: Scale },
  { label: "Prop evaluation", Icon: Sparkles },
  { label: "EAs (per /rules)", Icon: Cpu },
  { label: "KYC & payouts", Icon: BookOpenCheck },
  { label: "Challenge tiers", Icon: Layers3 },
  { label: "Two-phase model", Icon: Target },
  { label: "Min trading days", Icon: CalendarClock },
  { label: "Drawdown rules", Icon: Shield },
  { label: "Axon Wallet", Icon: Wallet },
];

/** Full-width strip above footer — programme specs with icons (marquee). */
export default function FooterTradingStrip() {
  return (
    <div
      className="footer-trading-strip relative z-40 w-full overflow-hidden border-t-2 border-gold-500/35 bg-[#0c0c12] py-3 shadow-[inset_0_1px_0_rgba(255,215,0,0.08)]"
      aria-hidden
    >
      <div className="pointer-events-none absolute left-1/2 top-0 h-[2px] w-[10cm] max-w-[92vw] -translate-x-1/2 bg-gradient-to-r from-transparent via-gold-500/70 to-transparent" />
      <div className="footer-ticker-inner flex w-max items-center">
        {[0, 1].map((dup) => (
          <ul key={dup} className="flex shrink-0 items-center gap-12 md:gap-14 pe-12 md:pe-14">
            {STRIP_ITEMS.map(({ label, Icon }) => (
              <li key={`${dup}-${label}`} className="flex items-center gap-2.5 whitespace-nowrap">
                <Icon className="h-5 w-5 shrink-0 text-gold-400/90 md:h-6 md:w-6" strokeWidth={1.5} aria-hidden />
                <span className="text-[13px] font-bold uppercase tracking-[0.14em] text-gold-500/85 md:text-sm">
                  {label}
                </span>
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}
