"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  FlaskConical,
  Mail,
  Timer,
  User,
  XCircle,
  Zap,
} from "lucide-react";
import PyramidLogo from "@/components/ui/PyramidLogo";
import {
  COOKIE_MAX_AGE,
  REGISTERED_VALUE,
  SESSION_VALUE,
  setClientCookie,
  TRADER_COOKIES,
  TRIAL_PLAN_ID,
  type TraderEntitlement,
} from "@/lib/trader-access";
import { toast } from "sonner";

const trialEntitlement: TraderEntitlement = "trial";

export default function TrialPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const activate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/trader/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: email.trim(),
          name: name.trim(),
          mode: "register" as const,
          referralCode: (() => {
            try {
              const m = typeof document !== "undefined" ? document.cookie.match(/(?:^|; )axon_ref=([^;]*)/) : null;
              return m?.[1] ? decodeURIComponent(m[1]) : undefined;
            } catch {
              return undefined;
            }
          })(),
        }),
      });
      const raw = await res.text();
      let data = {} as { traderId?: string; error?: string };
      try {
        data = raw ? (JSON.parse(raw) as typeof data) : {};
      } catch {
        throw new Error(`Invalid server response (${res.status})`);
      }
      if (!res.ok || !data.traderId) {
        throw new Error(data.error || `Could not start trial (HTTP ${res.status})`);
      }
      setClientCookie(TRADER_COOKIES.traderId, data.traderId);
      setClientCookie(TRADER_COOKIES.traderEmail, email.trim().toLowerCase());
      setClientCookie(TRADER_COOKIES.session, SESSION_VALUE);
      setClientCookie(TRADER_COOKIES.registered, REGISTERED_VALUE);
      setClientCookie(TRADER_COOKIES.entitlement, trialEntitlement, COOKIE_MAX_AGE);
      setClientCookie(TRADER_COOKIES.activePlan, TRIAL_PLAN_ID, COOKIE_MAX_AGE);
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(msg || "Could not activate trial");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-20 min-h-screen relative overflow-hidden bg-black">
      <div className="relative z-10 max-w-lg mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="flex justify-center mb-6">
            <PyramidLogo size="md" animate={false} />
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 text-xs font-semibold mb-4">
            <FlaskConical className="w-3.5 h-3.5" />
            Practice only · not a paid challenge
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white mb-3">Free trial environment</h1>
          <p className="text-sm text-neutral-500 leading-relaxed">
            A dedicated sandbox with its own balance and rules. This is{" "}
            <strong className="text-neutral-300">not</strong> a $6K–$200K Plan A evaluation unlock — paid plans are only
            available through checkout.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06 }}
          className="glass-card rounded-2xl p-7 border border-white/10"
        >
          <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-4 mb-6">
            <div className="flex items-center justify-between gap-3 mb-2">
              <span className="text-xs text-cyan-200/80 uppercase tracking-wider font-semibold">Trial SKU</span>
              <code className="text-xs text-cyan-300 font-mono">{TRIAL_PLAN_ID}</code>
            </div>
            <p className="text-sm text-white font-bold">$10,000 simulated · 7 calendar days</p>
            <p className="text-xs text-neutral-500 mt-2 flex items-center gap-1.5">
              <Timer className="w-3.5 h-3.5" />
              Timer starts when you open the dashboard.
            </p>
          </div>

          <ul className="space-y-3 text-sm text-neutral-400 mb-6">
            {[
              "Same UI as the funded workspace for onboarding practice",
              "Stricter news-window mock (educational)",
              "No certificates, competitions, or payout eligibility",
            ].map((t) => (
              <li key={t} className="flex gap-2">
                <Check className="w-4 h-4 text-cyan-500 shrink-0 mt-0.5" />
                {t}
              </li>
            ))}
            <li className="flex gap-2 text-neutral-500">
              <XCircle className="w-4 h-4 text-neutral-600 shrink-0 mt-0.5" />
              Does not grant paid Plan A account sizes or pricing.
            </li>
          </ul>

          <form onSubmit={activate} className="space-y-4">
            <div>
              <label className="block text-xs text-neutral-500 uppercase tracking-wider mb-2">Full name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  autoComplete="name"
                  className="w-full bg-black/30 border border-white/8 rounded-xl pl-10 pr-4 py-3 text-white text-sm placeholder-neutral-600 focus:outline-none focus:border-cyan-500/40"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-neutral-500 uppercase tracking-wider mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="w-full bg-black/30 border border-white/8 rounded-xl pl-10 pr-4 py-3 text-white text-sm placeholder-neutral-600 focus:outline-none focus:border-cyan-500/40"
                />
              </div>
            </div>

            <p className="text-[11px] text-neutral-500 leading-relaxed">
              <strong className="text-neutral-400">Google:</strong> OAuth is not wired in this build yet. Use email
              above (same address you will use for checkout). Full password registration:{" "}
              <Link href="/auth/register" className="text-cyan-400 hover:underline font-medium">
                Create account
              </Link>
              .
            </p>

            <label className="flex items-start gap-2.5 text-xs text-neutral-500 cursor-pointer">
              <input type="checkbox" required className="mt-0.5 w-4 h-4 rounded accent-cyan-500" />
              I understand this trial is separate from paid challenges and I will not receive live capital or payouts.
            </label>
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.01 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              className="w-full py-3.5 rounded-xl text-sm font-bold bg-gradient-to-r from-cyan-600 to-cyan-500 text-black flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  Activating…
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 fill-black" />
                  Open practice dashboard
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </form>

          <p className="mt-6 text-center text-xs text-neutral-600">
            Already registered?{" "}
            <Link href="/auth/login" className="text-cyan-400 hover:underline font-medium">
              Sign in
            </Link>{" "}
            then return here to attach the trial to your profile.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
