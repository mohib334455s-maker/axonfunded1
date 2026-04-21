"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import {
  ShieldCheck, Clock, Users, DollarSign, Award, Zap,
  Building2, Lock, Banknote, BadgeCheck, HeadphonesIcon,
} from "lucide-react";
import { PLATFORM_STATS, PLATFORM_STATS_PUBLISHED } from "@/lib/platform-stats";
import { useLandingDict } from "@/hooks/useLandingDict";

function AnimatedNumber({
  target,
  suffix,
  format,
}: {
  target: string;
  suffix: string;
  format: (n: number) => string;
}) {
  const [display, setDisplay] = useState("0");
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const numericTarget = parseFloat(target.replace(/[^0-9.]/g, ""));
    if (isNaN(numericTarget)) {
      setDisplay(target);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          let start = 0;
          const duration = 1400;
          const step = (timestamp: number) => {
            if (!start) start = timestamp;
            const progress = Math.min((timestamp - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplay(format(eased * numericTarget));
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, format]);

  return (
    <span ref={ref}>
      {display}
      {suffix}
    </span>
  );
}

export default function TrustBar() {
  const { t } = useLandingDict();

  const stats = useMemo(
    () => [
      {
        icon: Users,
        value: String(PLATFORM_STATS.fundedTraders),
        label: t("trust.statTraders"),
        suffix: "+",
        format: (n: number) => Math.floor(n).toLocaleString(),
      },
      {
        icon: DollarSign,
        value: String(PLATFORM_STATS.totalPayoutsM),
        label: t("trust.statPayouts"),
        suffix: "M+",
        format: (n: number) => n.toFixed(1),
      },
      {
        icon: Award,
        value: String(PLATFORM_STATS.challengePassRate),
        label: t("trust.statPass"),
        suffix: "%",
        format: (n: number) => Math.round(n).toString(),
      },
      {
        icon: Clock,
        value: String(PLATFORM_STATS.avgPayoutHours),
        label: t("trust.statPayoutTime"),
        suffix: "h",
        format: (n: number) => Math.round(n).toString(),
      },
      {
        icon: ShieldCheck,
        value: String(PLATFORM_STATS.trustpilotRating),
        label: t("trust.statTrust"),
        suffix: "/5",
        format: (n: number) => n.toFixed(1),
      },
      {
        icon: Zap,
        value: String(PLATFORM_STATS.avgDaysToFund),
        label: t("trust.statDays"),
        suffix: "",
        format: (n: number) => Math.round(n).toString(),
      },
    ],
    [t]
  );

  const badges = useMemo(
    () => [
      { label: t("trust.badgeReg"), icon: Building2 },
      { label: t("trust.badgeSsl"), icon: Lock },
      { label: t("trust.badgeWithdraw"), icon: Banknote },
      { label: t("trust.badgeFees"), icon: BadgeCheck },
      { label: t("trust.badgeSupport"), icon: HeadphonesIcon },
    ],
    [t]
  );

  if (!PLATFORM_STATS_PUBLISHED) {
    return (
      <section className="py-12 px-4 sm:px-6 bg-surface/60 border-y border-white/5">
        <div className="max-w-7xl mx-auto w-full">
          <p className="text-center text-sm text-neutral-400 max-w-2xl mx-auto leading-relaxed mb-8">
            {t("trust.statsPending")}
          </p>
          <p className="text-center text-xs text-neutral-600 max-w-xl mx-auto mb-8">
            {t("trust.trustpilotPending")}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 pt-6 border-t border-white/5">
            {badges.map(({ label, icon: Icon }) => (
              <div key={label} className="flex items-center gap-1.5 text-xs text-neutral-500">
                <Icon className="w-3.5 h-3.5 text-gold-500/70 shrink-0" />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 px-4 sm:px-6 bg-surface/60 border-y border-white/5">
      <div className="max-w-7xl mx-auto w-full">
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8 text-center">
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className="w-5 h-5 text-[#00B67A] fill-[#00B67A]"
                viewBox="0 0 24 24"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            ))}
          </div>
          <span className="text-sm font-semibold text-white">
            {PLATFORM_STATS.trustpilotRating} {t("trust.trustpilotPrefix")}
          </span>
          <span className="text-xs text-neutral-500">{t("trust.trustpilotMid")}</span>
          <span className="text-sm font-bold text-[#00B67A]">{t("trust.trustpilotBrand")}</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 lg:gap-6">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center group min-w-0">
              <div className="w-10 h-10 rounded-xl bg-gold-500/8 border border-gold-500/15 flex items-center justify-center mx-auto mb-3 group-hover:bg-gold-500/15 transition-colors">
                <stat.icon className="w-5 h-5 text-gold-500" />
              </div>
              <p className="text-xl sm:text-2xl font-black text-white font-mono truncate px-1">
                <AnimatedNumber target={stat.value} suffix={stat.suffix} format={stat.format} />
              </p>
              <p className="text-xs text-neutral-500 mt-0.5 leading-snug px-1">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 mt-8 pt-6 border-t border-white/5">
          {badges.map(({ label, icon: Icon }) => (
            <div key={label} className="flex items-center gap-1.5 text-xs text-neutral-500">
              <Icon className="w-3.5 h-3.5 text-gold-500/70 shrink-0" />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
