"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Shield, Copy, CheckCircle2, Smartphone, KeyRound, ChevronRight, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Props {
  onClose: () => void;
  onEnabled: () => void;
}

const BACKUP_CODES = [
  "AXON-7K2M-9P4R", "AXON-3N8Q-5L1W", "AXON-4T6X-2B7Y",
  "AXON-8C3H-6J9Z", "AXON-1F5D-4V2E", "AXON-9G7R-3S6U",
];

const TOTP_SECRET = "JBSWY3DPEHPK3PXP";

export default function TwoFAModal({ onClose, onEnabled }: Props) {
  const [step, setStep] = useState<"app" | "verify" | "backup" | "done">("app");
  const [code, setCode] = useState("");
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [copiedBackup, setCopiedBackup] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const copySecret = () => {
    navigator.clipboard.writeText(TOTP_SECRET);
    setCopiedSecret(true);
    setTimeout(() => setCopiedSecret(false), 2000);
    toast.success("Secret key copied!");
  };

  const copyBackup = () => {
    navigator.clipboard.writeText(BACKUP_CODES.join("\n"));
    setCopiedBackup(true);
    setTimeout(() => setCopiedBackup(false), 2000);
    toast.success("Backup codes copied!");
  };

  const handleVerify = async () => {
    if (code.length !== 6) { toast.error("Enter the 6-digit code from your app"); return; }
    setVerifying(true);
    await new Promise((r) => setTimeout(r, 220));
    setVerifying(false);
    setStep("backup");
  };

  const handleFinish = () => {
    onEnabled();
    onClose();
    toast.success("Two-factor authentication enabled!");
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0d0d0d] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
          <div className="flex items-center gap-2.5">
            <Shield className="w-5 h-5 text-gold-500" />
            <h3 className="text-base font-bold text-white">Enable Two-Factor Authentication</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-neutral-600 hover:text-white hover:bg-white/8 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5">
          <AnimatePresence mode="wait">
            {/* Step: Install app */}
            {step === "app" && (
              <motion.div key="app" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                className="space-y-4">
                <p className="text-sm text-neutral-400">Use an authenticator app to generate secure login codes. We recommend Google Authenticator or Authy.</p>

                {/* QR Code area */}
                <div className="flex flex-col items-center gap-3">
                  <div className="w-44 h-44 rounded-xl border border-white/10 bg-white flex items-center justify-center">
                    {/* Simulated QR code using CSS grid */}
                    <div className="grid grid-cols-7 gap-0.5 p-2">
                      {Array.from({ length: 49 }, (_, i) => (
                        <div key={i} className={`w-4 h-4 rounded-sm ${[0,1,2,3,4,5,6,7,13,14,20,21,27,28,34,35,41,42,43,44,45,46,47,48,8,15,10,17,24,31,38,11,18,25,32,9,16,23,30,37].includes(i) ? "bg-black" : "bg-white"}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-neutral-500 text-center">Scan with your authenticator app</p>
                </div>

                <div>
                  <p className="text-xs text-neutral-500 mb-1.5">Or enter this key manually:</p>
                  <div className="flex items-center gap-2 p-3 rounded-xl border border-white/8 bg-surface">
                    <code className="flex-1 text-sm text-gold-400 font-mono tracking-widest">{TOTP_SECRET}</code>
                    <button onClick={copySecret} className="p-1.5 rounded-lg text-neutral-600 hover:text-gold-500 transition-colors">
                      {copiedSecret ? <CheckCircle2 className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-start gap-2 p-3 rounded-xl bg-white/3 border border-white/5">
                  <Smartphone className="w-4 h-4 text-neutral-500 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-neutral-500">
                    <p className="font-semibold text-neutral-400 mb-0.5">Recommended apps:</p>
                    <p>Google Authenticator · Authy · Microsoft Authenticator</p>
                  </div>
                </div>

                <button onClick={() => setStep("verify")} className="w-full btn-gold py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2">
                  I&apos;ve Scanned the Code <ChevronRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}

            {/* Step: Verify code */}
            {step === "verify" && (
              <motion.div key="verify" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                className="space-y-4">
                <div className="text-center">
                  <div className="w-14 h-14 rounded-2xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center mx-auto mb-4">
                    <KeyRound className="w-7 h-7 text-gold-500" />
                  </div>
                  <h4 className="text-sm font-bold text-white mb-1">Enter Verification Code</h4>
                  <p className="text-xs text-neutral-500">Open your authenticator app and enter the 6-digit code shown for Axon Funded.</p>
                </div>

                <input type="text" inputMode="numeric" maxLength={6} value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="000 000"
                  className="w-full bg-black/30 border border-white/8 rounded-xl px-4 py-4 text-white text-2xl font-mono text-center tracking-[0.5em] placeholder-neutral-700 focus:outline-none focus:border-gold-500/40" />

                <div className="flex gap-3">
                  <button onClick={() => setStep("app")} className="btn-outline px-5 py-3 rounded-xl text-sm font-semibold">Back</button>
                  <motion.button onClick={handleVerify} disabled={verifying || code.length !== 6}
                    whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                    className="flex-1 btn-gold py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50">
                    {verifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    {verifying ? "Verifying..." : "Verify Code"}
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* Step: Backup codes */}
            {step === "backup" && (
              <motion.div key="backup" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                className="space-y-4">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-warning/8 border border-warning/20">
                  <Shield className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-warning/90 font-semibold">Save these backup codes now. Each code can only be used once to recover your account if you lose access to your authenticator app.</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {BACKUP_CODES.map((code) => (
                    <div key={code} className="py-2 px-3 rounded-lg bg-surface border border-white/8 font-mono text-xs text-white text-center">
                      {code}
                    </div>
                  ))}
                </div>
                <button onClick={copyBackup} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-white/10 text-xs text-neutral-400 hover:text-white hover:bg-white/5 transition-colors">
                  {copiedBackup ? <CheckCircle2 className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                  Copy All Backup Codes
                </button>
                <button onClick={handleFinish} className="w-full btn-gold py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2">
                  <Shield className="w-4 h-4" /> Enable 2FA — I&apos;ve Saved My Codes
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
