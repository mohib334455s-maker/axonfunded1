"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  ArrowRight,
  Users,
  DollarSign,
  TrendingUp,
  Link as LinkIcon,
  BarChart2,
  Zap,
  CheckCircle2,
  Sparkles,
  Shield,
} from "lucide-react";
import { motion } from "framer-motion";
import GoldButton from "@/components/ui/GoldButton";

const officialProgram = [
  {
    title: "20% cash commission",
    body: "On every challenge purchase made through your unique referral link — percentage of the total transaction value.",
  },
  {
    title: "Fully withdrawable",
    body: "Rewards are described as withdrawable in cash or USDT, without artificial lockups in the official rulebook.",
  },
  {
    title: "Tracking & optimisation",
    body: "Tools to monitor referrals and improve conversion — as stated in the partnership section of the rules.",
  },
];

const steps = [
  {
    icon: LinkIcon,
    step: "1",
    title: "Get your link",
    desc: "Sign up as an affiliate and receive your unique referral link and partner tools.",
  },
  {
    icon: Users,
    step: "2",
    title: "Refer traders",
    desc: "Share your link on social media, YouTube, or trading communities. Purchases must use your official referral link to qualify under §18.",
  },
  {
    icon: DollarSign,
    step: "3",
    title: "Earn commissions",
    desc: "You receive the published 20% cash commission on qualifying challenge purchases, per the official rules.",
  },
];

const features = [
  {
    icon: BarChart2,
    title: "Referral tracking",
    desc: "Monitor referrals and conversion — called out in Trading Rules §18.",
  },
  {
    icon: DollarSign,
    title: "Cash / USDT rewards",
    desc: "Official text: rewards are withdrawable in cash or USDT without described lockups.",
  },
  {
    icon: TrendingUp,
    title: "20% on challenge sales",
    desc: "Single published headline rate for purchases through your unique link.",
  },
  {
    icon: Users,
    title: "Mentor-friendly",
    desc: "Rules welcome copy trading and mentor mirroring for traders (§16) — align your content with the official rulebook.",
  },
  {
    icon: Zap,
    title: "Marketing toolkit",
    desc: "Banners, copy templates, and swipes to help you promote responsibly.",
  },
  {
    icon: CheckCircle2,
    title: "Legal clarity",
    desc: "Always keep `/rules` as the source of truth if marketing copy and the rulebook ever differ.",
  },
];

export default function AffiliateProgramView() {
  const sp = useSearchParams();
  useEffect(() => {
    const ref = sp.get("ref");
    if (ref && typeof document !== "undefined") {
      document.cookie = `axon_ref=${encodeURIComponent(ref.trim().toUpperCase())}; path=/; max-age=${60 * 60 * 24 * 90}; SameSite=Lax`;
    }
  }, [sp]);

  return (
    <div className="mx-auto w-full min-w-0 max-w-full overflow-x-clip pt-20">
      <section className="relative overflow-hidden bg-background px-4 py-24 text-center sm:px-6 sm:py-28">
        <div className="relative z-10 mx-auto max-w-3xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-gold-500/35 bg-white/[0.04] px-4 py-2 backdrop-blur-md">
            <Users className="h-3.5 w-3.5 text-amber-200/95" strokeWidth={1.25} />
            <span className="text-sm font-medium text-amber-100/95">Affiliate program</span>
          </div>
          <h1 className="mb-6 text-balance text-4xl font-black tracking-tight text-white md:text-6xl">
            Earn up to{" "}
            <span className="text-gold-gradient">20% commission</span>
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-pretty text-lg text-neutral-400">
            Refer traders to Axon Funded — The First Ever Daily payout prop — and earn on every qualifying challenge
            purchase through your link, aligned with Trading Rules §18.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <GoldButton href="/auth/register" size="lg">
              Join as affiliate <ArrowRight className="h-5 w-5" strokeWidth={1.25} />
            </GoldButton>
            <GoldButton href="#how-it-works" variant="outline" size="lg">
              How it works
            </GoldButton>
          </div>
        </div>
      </section>

      <section className="border-y border-white/5 bg-gradient-to-b from-white/[0.03] to-transparent px-4 py-14 sm:px-6">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 text-center sm:grid-cols-4">
          {[
            { value: "20%", label: "Published rate" },
            { value: "Lifetime", label: "Link attribution" },
            { value: "24h", label: "Typical review SLA" },
            { value: "§18", label: "Rules reference" },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-white/[0.06] bg-elevated/80 py-6">
              <p className="font-mono text-2xl font-black text-gold-500 sm:text-3xl">{s.value}</p>
              <p className="mt-1 text-xs text-neutral-500">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <div className="mb-14 text-center">
            <div className="mb-3 inline-flex items-center gap-2 text-gold-500/80">
              <Shield className="h-4 w-4" strokeWidth={1.25} />
              <span className="text-xs font-semibold uppercase tracking-widest">Official terms</span>
            </div>
            <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">Partnership in one place</h2>
            <p className="mx-auto max-w-2xl text-neutral-400">
              Published commission terms match{" "}
              <Link href="/rules#ib" className="font-medium text-gold-500 hover:underline">
                Trading Rules §18
              </Link>
              .
            </p>
          </div>
          <div className="mb-10 grid gap-4 md:grid-cols-3">
            {officialProgram.map((row) => (
              <div
                key={row.title}
                className="rounded-2xl border border-gold-500/20 bg-gradient-to-b from-gold-500/[0.12] to-elevated p-6 text-left shadow-[0_24px_80px_-40px_rgba(212,175,55,0.15)]"
              >
                <Sparkles className="mb-3 h-5 w-5 text-amber-300/70" strokeWidth={1.25} />
                <p className="mb-2 text-lg font-bold text-white">{row.title}</p>
                <p className="text-sm leading-relaxed text-neutral-400">{row.body}</p>
              </div>
            ))}
          </div>
          <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-elevated p-8 text-center ring-1 ring-gold-500/10 sm:p-10">
            <p className="mb-1 font-mono text-5xl font-black text-gold-gradient sm:text-6xl">20%</p>
            <p className="mb-4 text-sm text-neutral-400">per qualifying challenge purchase via your link</p>
            <p className="mx-auto max-w-lg text-xs text-neutral-600">
              If operational bonuses or sub-affiliate programs exist, they are offered outside the core rule text —
              always confirm in your partner agreement.
            </p>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="border-t border-white/5 bg-elevated/70 px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-4 text-center text-3xl font-bold text-white md:text-4xl">How it works</h2>
          <p className="mx-auto mb-14 max-w-xl text-center text-sm text-neutral-500">
            Three steps from signup to recurring rewards.
          </p>
          <div className="relative grid gap-8 md:grid-cols-3">
            <div className="pointer-events-none absolute left-[16%] right-[16%] top-10 hidden h-px bg-gradient-to-r from-transparent via-gold-500/25 to-transparent md:block" />
            {steps.map((item) => (
              <div
                key={item.step}
                className="relative rounded-3xl border border-white/[0.07] bg-gradient-to-b from-white/[0.05] to-elevated/40 p-8 text-center backdrop-blur-sm"
              >
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-gold-500/25 bg-gold-500/10 shadow-inner">
                  <item.icon className="h-8 w-8 text-amber-200/90" strokeWidth={1.25} />
                </div>
                <p className="mb-2 text-xs font-bold uppercase tracking-widest text-gold-500">Step {item.step}</p>
                <h3 className="mb-3 text-lg font-bold text-white">{item.title}</h3>
                <p className="text-sm leading-relaxed text-neutral-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-12 text-center text-3xl font-bold text-white">Everything in your toolkit</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {features.map((f) => (
              <div
                key={f.title}
                className="flex gap-4 rounded-2xl border border-white/[0.07] bg-elevated p-5 transition-colors hover:border-gold-500/20"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-gold-500/20 bg-gold-500/10">
                  <f.icon className="h-5 w-5 text-amber-200/90" strokeWidth={1.25} />
                </div>
                <div>
                  <h3 className="mb-1 text-sm font-semibold text-white">{f.title}</h3>
                  <p className="text-xs leading-relaxed text-neutral-400">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-white/5 bg-gradient-to-b from-gold-500/[0.06] to-[#050505] px-4 py-20 sm:px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="mb-4 text-3xl font-bold text-white">Ready to start earning?</h2>
          <p className="mb-8 text-neutral-400">
            Create your partner account and access your dashboard link in minutes.
          </p>
          <GoldButton href="/auth/register" size="lg">
            Create affiliate account <ArrowRight className="h-5 w-5" strokeWidth={1.25} />
          </GoldButton>
          <p className="mt-4 text-xs text-neutral-600">Free to join · Instant access · Official rate in trading rules section 18</p>
        </motion.div>
      </section>
    </div>
  );
}
