"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import PyramidLogo from "@/components/ui/PyramidLogo";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 180));
    setSent(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 relative overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.32, ease: [0.25, 0.1, 0.25, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="flex justify-center mb-8">
          <PyramidLogo size="md" animate={false} />
        </div>

        <div className="glass-card p-8">
          <AnimatePresence mode="wait">
            {!sent ? (
              <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="text-center mb-8">
                  <h1 className="text-2xl font-bold text-white mb-2">Reset your password</h1>
                  <p className="text-sm text-neutral-500">Enter your email and we&apos;ll send a reset link</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-xs text-neutral-500 uppercase tracking-wider mb-2">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
                      <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                        placeholder="trader@example.com"
                        className="w-full bg-black/30 border border-white/8 rounded-xl pl-10 pr-4 py-3.5 text-white text-sm placeholder-neutral-600 focus:outline-none focus:border-gold-500/50 transition-all" />
                    </div>
                  </div>
                  <button type="submit" disabled={loading}
                    className="w-full btn-gold py-3.5 text-sm font-semibold rounded-xl flex items-center justify-center gap-2 disabled:opacity-60">
                    {loading ? <div className="w-4 h-4 border-2 border-black/40 border-t-black rounded-full animate-spin" /> : <><ArrowRight className="w-4 h-4" /> Send Reset Link</>}
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4">
                <div className="w-16 h-16 rounded-2xl bg-success/10 border border-success/20 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-8 h-8 text-success" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Check your inbox</h2>
                <p className="text-sm text-neutral-400 mb-6">We&apos;ve sent a password reset link to <span className="text-white font-medium">{email}</span></p>
                <Link href="/auth/login" className="text-sm text-gold-500 hover:underline font-medium">← Back to login</Link>
              </motion.div>
            )}
          </AnimatePresence>
          {!sent && (
            <div className="mt-6 text-center">
              <Link href="/auth/login" className="text-sm text-neutral-500 hover:text-white transition-colors">← Back to login</Link>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
