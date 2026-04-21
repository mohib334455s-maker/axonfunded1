"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Zap, Lock, Mail, Eye, EyeOff, ShieldAlert } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: email.trim(), password }),
      });
      if (res.ok) {
        router.push("/admin");
        router.refresh();
      } else {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        setError(j.error === "server_misconfigured" ? "Server misconfigured (admin secret)." : "Invalid admin credentials.");
      }
    } catch {
      setError("Network error — could not reach login API.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-5 sm:p-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-5">
            <div className="w-11 h-11 rounded-xl bg-gold-gradient flex items-center justify-center ring-1 ring-[rgba(212,175,55,0.35)] shadow-[0_0_28px_rgba(255,215,0,0.12)]">
              <Zap className="w-5 h-5 text-black fill-black" />
            </div>
            <div className="text-start">
              <span className="admin-page-title text-2xl text-[#faf6ef] block leading-tight">Axon</span>
              <span className="text-[11px] uppercase tracking-[0.2em] text-[#b8a88a] font-semibold">Administration</span>
            </div>
          </div>
          <div className="flex items-center justify-center gap-2 px-4 py-2 rounded-full border border-danger/28 bg-danger/[0.07] mx-auto w-fit">
            <ShieldAlert className="w-3.5 h-3.5 text-danger shrink-0" />
            <span className="text-xs text-danger/95 font-medium tracking-wide">Restricted — authorized personnel only</span>
          </div>
        </div>

        <div className="admin-login-card p-8 sm:p-9">
          <h1 className="admin-page-title text-2xl text-[#faf6ef] mb-1">Sign in</h1>
          <p className="text-sm admin-page-desc mb-7">Access the platform management dashboard</p>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl border border-danger/25 bg-danger/8 text-sm text-danger">{error}</div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs admin-page-desc uppercase tracking-wider block mb-1.5">Admin email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@axonfunded.com"
                  className="w-full bg-black/30 border border-white/8 rounded-xl pl-10 pr-4 py-3 text-white text-sm placeholder-neutral-700 focus:outline-none focus:border-gold-500/40 transition-all" />
              </div>
            </div>
            <div>
              <label className="text-xs admin-page-desc uppercase tracking-wider block mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
                <input type={showPw ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="Admin password"
                  className="w-full bg-black/35 border border-[rgba(212,175,55,0.14)] rounded-xl pl-10 pr-12 py-3 text-[#ebe6dc] text-sm placeholder-[#5c5852] focus:outline-none focus:border-[rgba(255,215,0,0.35)] transition-all" />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-neutral-400">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <motion.button type="submit" disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.01 }} whileTap={{ scale: 0.98 }}
              className="w-full btn-gold py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-60 mt-2">
              {loading ? <div className="w-4 h-4 border-2 border-black/40 border-t-black rounded-full animate-spin" /> : <Lock className="w-4 h-4" />}
              {loading ? "Verifying..." : "Sign In to Admin"}
            </motion.button>
          </form>

          <p className="text-xs text-[#5c5852] text-center mt-6 tracking-wide leading-relaxed">
            Production: set <span className="font-mono text-[#8a8275]">ADMIN_EMAIL</span>,{" "}
            <span className="font-mono text-[#8a8275]">ADMIN_PASSWORD_HASH</span> (bcrypt), and{" "}
            <span className="font-mono text-[#8a8275]">AXON_ADMIN_SECRET</span> in environment. Local dev may use password{" "}
            <span className="font-mono">admin123</span> when no hash is set — see <span className="font-mono">.env.example</span>.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
