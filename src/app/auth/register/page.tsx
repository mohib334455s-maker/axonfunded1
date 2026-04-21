"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, ArrowRight, Lock, Mail, User, Check, Globe } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PyramidLogo from "@/components/ui/PyramidLogo";
import {
  clearClientCookie,
  REGISTERED_VALUE,
  SESSION_VALUE,
  setClientCookie,
  TRADER_COOKIES,
} from "@/lib/trader-access";
import { toast } from "sonner";
import { WORLD_COUNTRY_NAMES_EN } from "@/lib/countries";

const steps = ["Account", "Personal", "Complete"];

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", country: "" });

  const update = (field: string, val: string) => setForm((p) => ({ ...p, [field]: val }));

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 2) setStep(step + 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/trader/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: form.email.trim(),
          name: form.name.trim(),
          mode: "register",
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
        throw new Error(
          `Bad response (${res.status}). If you see 404, run \`npm run dev\` from the axon folder and open http://localhost:3000 — not another app on the same port.`
        );
      }
      if (!res.ok || !data.traderId) {
        throw new Error(data.error || `Could not create profile (HTTP ${res.status})`);
      }
      setClientCookie(TRADER_COOKIES.traderId, data.traderId);
      setClientCookie(TRADER_COOKIES.traderEmail, form.email.trim().toLowerCase());
      setClientCookie(TRADER_COOKIES.session, SESSION_VALUE);
      setClientCookie(TRADER_COOKIES.registered, REGISTERED_VALUE);
      clearClientCookie(TRADER_COOKIES.entitlement);
      clearClientCookie(TRADER_COOKIES.activePlan);
      router.push("/get-started");
      router.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(msg || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.32, ease: [0.25, 0.1, 0.25, 1] }}
        className="relative z-10 w-full max-w-lg"
      >
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <PyramidLogo size="md" animate={false} />
        </div>

        {/* Step Indicators */}
        <div className="flex items-center justify-center gap-3 mb-8">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-3">
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                i === step ? "bg-gold-500/15 text-gold-500 border border-gold-500/30" :
                i < step ? "bg-success/15 text-success border border-success/30" :
                "bg-white/5 text-neutral-600 border border-white/5"
              }`}>
                {i < step ? <Check className="w-3 h-3" /> : <span>{i + 1}</span>}
                {s}
              </div>
              {i < steps.length - 1 && (
                <div className={`w-8 h-px ${i < step ? "bg-gold-500/40" : "bg-white/10"}`} />
              )}
            </div>
          ))}
        </div>

        <div className="glass-card p-8">
          <AnimatePresence mode="wait">
            {/* Step 0 — Account */}
            {step === 0 && (
              <motion.form key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} onSubmit={handleNext} className="space-y-5">
                <div className="text-center mb-6">
                  <h1 className="text-2xl font-bold text-white mb-1">Create your account</h1>
                  <p className="text-sm text-neutral-500">Create your Axon Funded account to continue.</p>
                </div>
                <div>
                  <label className="block text-xs text-neutral-500 uppercase tracking-wider mb-2">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
                    <input type="email" required value={form.email} onChange={(e) => update("email", e.target.value)}
                      placeholder="trader@example.com"
                      className="w-full bg-black/30 border border-white/8 rounded-xl pl-10 pr-4 py-3.5 text-white text-sm placeholder-neutral-600 focus:outline-none focus:border-gold-500/50 transition-all" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-neutral-500 uppercase tracking-wider mb-2">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
                    <input type={showPassword ? "text" : "password"} required minLength={8} value={form.password} onChange={(e) => update("password", e.target.value)}
                      placeholder="8+ characters"
                      className="w-full bg-black/30 border border-white/8 rounded-xl pl-10 pr-12 py-3.5 text-white text-sm placeholder-neutral-600 focus:outline-none focus:border-gold-500/50 transition-all" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-neutral-400">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {form.password && (
                    <div className="flex gap-1.5 mt-2">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className={`h-1 flex-1 rounded-full transition-all ${form.password.length > i * 2 + 1 ? (form.password.length < 6 ? "bg-danger" : form.password.length < 10 ? "bg-warning" : "bg-success") : "bg-white/10"}`} />
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-start gap-2.5">
                  <input type="checkbox" required id="terms" className="mt-0.5 w-4 h-4 rounded accent-gold-500" />
                  <label htmlFor="terms" className="text-xs text-neutral-400">
                    I agree to the{" "}
                    <Link href="/legal/terms" target="_blank" className="text-gold-500 hover:underline">Terms of Service</Link>{" "}
                    and{" "}
                    <Link href="/legal/privacy" target="_blank" className="text-gold-500 hover:underline">Privacy Policy</Link>
                  </label>
                </div>
                <button type="submit" className="w-full btn-gold py-3.5 text-sm font-semibold rounded-xl flex items-center justify-center gap-2">
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
                <p className="text-center text-sm text-neutral-500">
                  Already have an account?{" "}
                  <Link href="/auth/login" className="text-gold-500 hover:underline font-medium">Sign in</Link>
                </p>
              </motion.form>
            )}

            {/* Step 1 — Personal */}
            {step === 1 && (
              <motion.form key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} onSubmit={handleNext} className="space-y-5">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-white mb-1">Personal details</h2>
                  <p className="text-sm text-neutral-500">Required for account verification</p>
                </div>
                <div>
                  <label className="block text-xs text-neutral-500 uppercase tracking-wider mb-2">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
                    <input type="text" required value={form.name} onChange={(e) => update("name", e.target.value)}
                      placeholder="Your full name"
                      className="w-full bg-black/30 border border-white/8 rounded-xl pl-10 pr-4 py-3.5 text-white text-sm placeholder-neutral-600 focus:outline-none focus:border-gold-500/50 transition-all" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-neutral-500 uppercase tracking-wider mb-2">Country</label>
                  <div className="relative">
                    <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600 z-10" />
                    <select value={form.country} onChange={(e) => update("country", e.target.value)} required
                      className="w-full bg-black/30 border border-white/8 rounded-xl pl-10 pr-4 py-3.5 text-white text-sm focus:outline-none focus:border-gold-500/50 transition-all appearance-none">
                      <option value="" className="bg-surface">Select country...</option>
                      {WORLD_COUNTRY_NAMES_EN.map((c) => (
                        <option key={c} value={c} className="bg-surface">{c}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setStep(0)} className="flex-1 btn-outline py-3.5 text-sm font-semibold rounded-xl">Back</button>
                  <button type="submit" className="flex-1 btn-gold py-3.5 text-sm font-semibold rounded-xl flex items-center justify-center gap-2">
                    Continue <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.form>
            )}

            {/* Step 2 — Account created (no paid plan selection; purchase or trial is next) */}
            {step === 2 && (
              <motion.form key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} onSubmit={handleSubmit} className="space-y-5">
                <div className="text-center mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-gold-500/15 border border-gold-500/25 flex items-center justify-center mx-auto mb-4">
                    <Check className="w-7 h-7 text-gold-500" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-1">Almost there</h2>
                  <p className="text-sm text-neutral-500">
                    Your profile is ready. Funded challenges are only unlocked after checkout. You may start a separate practice trial — it does not include paid account tiers.
                  </p>
                </div>
                <div className="rounded-xl border border-white/8 bg-black/20 p-4 text-xs text-neutral-400 space-y-2">
                  <p className="text-neutral-300 font-medium text-sm">Next steps</p>
                  <p>1. Purchase a challenge, or</p>
                  <p>2. Start the free practice trial (sandbox only)</p>
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setStep(1)} className="flex-1 btn-outline py-3.5 text-sm font-semibold rounded-xl">Back</button>
                  <motion.button type="submit" disabled={loading} whileHover={{ scale: loading ? 1 : 1.01 }} whileTap={{ scale: 0.98 }}
                    className="flex-1 btn-gold py-3.5 text-sm font-semibold rounded-xl flex items-center justify-center gap-2 disabled:opacity-60">
                    {loading ? (
                      <><div className="w-4 h-4 border-2 border-black/40 border-t-black rounded-full animate-spin" />Creating account...</>
                    ) : (
                      <>Continue <ArrowRight className="w-4 h-4" /></>
                    )}
                  </motion.button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
