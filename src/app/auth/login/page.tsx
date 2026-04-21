"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, ArrowRight, Lock, Mail, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PyramidLogo from "@/components/ui/PyramidLogo";
import { SESSION_VALUE, setClientCookie, TRADER_COOKIES } from "@/lib/trader-access";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (!email.trim() || password.length < 6) {
        setError("Invalid email or password. Please check your credentials and try again.");
        return;
      }
      const res = await fetch("/api/trader/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: email.trim(), mode: "login" }),
      });
      const raw = await res.text();
      let data = {} as { traderId?: string; error?: string };
      try {
        data = raw ? (JSON.parse(raw) as typeof data) : {};
      } catch {
        throw new Error(
          `Bad response (${res.status}). Run the site from the axon project (\`npm run dev\`) and use http://localhost:3000`
        );
      }
      if (!res.ok || !data.traderId) {
        throw new Error(data.error || `Sign-in failed (HTTP ${res.status})`);
      }
      setClientCookie(TRADER_COOKIES.traderId, data.traderId);
      setClientCookie(TRADER_COOKIES.traderEmail, email.trim().toLowerCase());
      setClientCookie(TRADER_COOKIES.session, SESSION_VALUE);
      setClientCookie(TRADER_COOKIES.registered, "1");
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(msg || "Sign-in failed");
      setError("Could not complete sign-in. Try again or register first.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 relative overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.32, ease: [0.25, 0.1, 0.25, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <PyramidLogo size="md" animate={false} />
        </div>

        {/* Card */}
        <div className="glass-card p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">Welcome back</h1>
            <p className="text-sm text-neutral-500">Sign in to your trading dashboard</p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-2.5 p-3.5 rounded-xl bg-danger/10 border border-danger/20 mb-6"
            >
              <AlertCircle className="w-4 h-4 text-danger flex-shrink-0 mt-0.5" />
              <p className="text-sm text-danger">{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs text-neutral-500 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="trader@example.com"
                  className="w-full bg-black/30 border border-white/8 rounded-xl pl-10 pr-4 py-3.5 text-white text-sm placeholder-neutral-600 focus:outline-none focus:border-gold-500/50 focus:bg-black/50 transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs text-neutral-500 uppercase tracking-wider">Password</label>
                <Link href="/auth/forgot" className="text-xs text-gold-500 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full bg-black/30 border border-white/8 rounded-xl pl-10 pr-12 py-3.5 text-white text-sm placeholder-neutral-600 focus:outline-none focus:border-gold-500/50 focus:bg-black/50 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-neutral-400 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <input type="checkbox" id="remember" className="w-4 h-4 rounded border-white/20 bg-black/30 accent-gold-500" />
              <label htmlFor="remember" className="text-sm text-neutral-400 cursor-pointer select-none">
                Keep me signed in
              </label>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.01 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              className="w-full btn-gold py-3.5 text-sm font-semibold rounded-xl flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-black/40 border-t-black rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/5" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 bg-surface text-xs text-neutral-600 rounded">OR</span>
            </div>
          </div>

          <div className="text-center">
            <p className="text-sm text-neutral-500">
              Don&apos;t have an account?{" "}
              <Link href="/auth/register" className="text-gold-500 font-medium hover:underline">
                Start your challenge
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-neutral-700 mt-6">
          Protected by 256-bit encryption · Axon Funded © 2024
        </p>
      </motion.div>
    </div>
  );
}
