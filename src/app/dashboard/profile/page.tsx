"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
  Globe,
  Shield,
  Bell,
  Lock,
  Clock,
  Camera,
  ChevronRight,
  Save,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import {
  formatRelativeTime,
  type KycSubmission,
} from "@/lib/kyc-store";
import { WORLD_COUNTRY_NAMES_EN } from "@/lib/countries";
import { useDashboardPagesDict } from "@/hooks/useDashboardPagesDict";
import { useProfileUIDict } from "@/hooks/useProfileUIDict";

const KycUploadModal = dynamic(() => import("@/components/dashboard/KycUploadModal"), { ssr: false });
const TwoFAModal = dynamic(() => import("@/components/dashboard/TwoFAModal"), { ssr: false });

type NotifKey = "email" | "profitTarget" | "drawdown" | "payout" | "news";

export default function ProfilePage() {
  const { dict } = useDashboardPagesDict();
  const p = useProfileUIDict();
  const header = dict.profile;
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    country: "",
  });
  const [saving, setSaving] = useState(false);

  const [notifications, setNotifications] = useState({
    email: true,
    profitTarget: true,
    drawdown: true,
    payout: true,
    news: false,
  });

  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [showKyc, setShowKyc] = useState(false);
  const [kycStatus, setKycStatus] = useState<"not_submitted" | "pending" | "verified" | "rejected">("not_submitted");
  const [latestKyc, setLatestKyc] = useState<KycSubmission | null>(null);
  const [show2FA, setShow2FA] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem("axon_profile_form");
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as {
          name?: string;
          email?: string;
          country?: string;
        };
        setProfileForm({
          name: parsed.name || "",
          email: parsed.email || "",
          country: parsed.country || "",
        });
      } catch {
        // ignore malformed profile cache
      }
    }
    setTwoFAEnabled(localStorage.getItem("axon_security_2fa_enabled") === "1");
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const key = "axon_profile_otp_toast_shown";
    if (sessionStorage.getItem(key) === "1") return;
    void (async () => {
      try {
        const response = await fetch("/api/security/otp/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ channel: "email" }),
        });
        if (response.ok) {
          toast.success(p.toastOtp);
          sessionStorage.setItem(key, "1");
        }
      } catch {
        // silent fallback
      }
    })();
  }, [p.toastOtp]);

  const loadKycStatus = async () => {
    try {
      const response = await fetch(
        `/api/kyc?scope=current&email=${encodeURIComponent(profileForm.email || "")}`,
        { cache: "no-store" }
      );
      if (!response.ok) return;
      const payload = (await response.json()) as { data: KycSubmission | null };
      const current = payload.data;
      if (!current) {
        setKycStatus("not_submitted");
        setLatestKyc(null);
        return;
      }
      setLatestKyc(current);
      if (current.status === "approved") setKycStatus("verified");
      else if (current.status === "rejected") setKycStatus("rejected");
      else if (current.status === "pending") setKycStatus("pending");
      else setKycStatus("not_submitted");
    } catch {
      // ignore fetch failures in UI-only mode
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 120));
    setSaving(false);
    if (typeof window !== "undefined") {
      localStorage.setItem("axon_profile_form", JSON.stringify(profileForm));
    }
    toast.success(p.toastSaved);
  };

  useEffect(() => {
    void loadKycStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileForm.email, showKyc]);

  const kycPendingText = p.kycPendingBody.replace(
    "{time}",
    latestKyc ? ` ${formatRelativeTime(latestKyc.createdAt)}` : ""
  );

  const notifRows: { key: NotifKey; label: string; desc: string }[] = [
    { key: "email", label: p.notifEmail, desc: p.notifEmailDesc },
    { key: "profitTarget", label: p.notifProfit, desc: p.notifProfitDesc },
    { key: "drawdown", label: p.notifDd, desc: p.notifDdDesc },
    { key: "payout", label: p.notifPayout, desc: p.notifPayoutDesc },
    { key: "news", label: p.notifNews, desc: p.notifNewsDesc },
  ];

  return (
    <div className="space-y-6 dashboard-page">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold text-white">{header.title}</h1>
        <p className="text-sm text-neutral-500 mt-1">{header.subtitle}</p>
      </motion.div>

      {/* Avatar & Personal Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl border border-white/8 bg-surface p-6"
      >
        <h2 className="text-base font-semibold text-white mb-6">
          {p.personalSection}
        </h2>

        <div className="flex items-start gap-6 mb-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-surface border border-white/10 flex items-center justify-center text-neutral-500 text-3xl font-black">
              {profileForm.name ? profileForm.name.charAt(0).toUpperCase() : <User className="w-8 h-8" />}
            </div>
            <button type="button" className="absolute -bottom-1 -end-1 w-7 h-7 rounded-full bg-surface border border-white/10 flex items-center justify-center text-neutral-400 hover:text-white hover:border-gold-500/30 transition-colors">
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">{profileForm.name || p.namePlaceholder}</h3>
            <p className="text-sm text-neutral-500">{profileForm.email || p.emailPlaceholder}</p>
            <p className="text-xs text-neutral-600 mt-1">{p.completeHint}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-neutral-500 mb-2 uppercase tracking-wider">{p.fullName}</label>
            <div className="relative">
              <User className="absolute start-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
              <input type="text" value={profileForm.name} onChange={(e) => setProfileForm((pr) => ({ ...pr, name: e.target.value }))}
                className="w-full bg-black/30 border border-white/8 rounded-xl ps-10 pe-4 py-3 text-white text-sm focus:outline-none focus:border-gold-500/40 transition-colors" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-neutral-500 mb-2 uppercase tracking-wider">{p.email}</label>
            <div className="relative">
              <Mail className="absolute start-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
              <input type="email" value={profileForm.email} onChange={(e) => setProfileForm((pr) => ({ ...pr, email: e.target.value }))}
                className="w-full bg-black/30 border border-white/8 rounded-xl ps-10 pe-4 py-3 text-white text-sm focus:outline-none focus:border-gold-500/40 transition-colors" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-neutral-500 mb-2 uppercase tracking-wider">{p.country}</label>
            <div className="relative">
              <Globe className="absolute start-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600 z-10" />
              <select value={profileForm.country} onChange={(e) => setProfileForm((pr) => ({ ...pr, country: e.target.value }))}
                className="w-full bg-black/30 border border-white/8 rounded-xl ps-10 pe-4 py-3 text-sm focus:outline-none focus:border-gold-500/40 transition-colors appearance-none"
                style={{ color: profileForm.country ? "#ffffff" : "#525252" }}>
                <option value="" className="bg-surface text-neutral-500">{p.countrySelect}</option>
                {WORLD_COUNTRY_NAMES_EN.map((c) => (
                  <option key={c} value={c} className="bg-surface">{c}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs text-neutral-500 mb-2 uppercase tracking-wider">{p.accountId}</label>
            <div className="relative">
              <Shield className="absolute start-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
              <input type="text" value={p.accountIdPending} readOnly
                className="w-full bg-black/10 border border-white/5 rounded-xl ps-10 pe-4 py-3 text-neutral-600 text-sm cursor-not-allowed" />
            </div>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button type="button" onClick={handleSaveProfile} disabled={saving}
            className="btn-gold px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 disabled:opacity-60">
            {saving ? <div className="w-4 h-4 border-2 border-black/40 border-t-black rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? p.saving : p.save}
          </button>
          <button type="button" onClick={() => setProfileForm({ name: "", email: "", country: "" })}
            className="btn-outline px-5 py-2.5 rounded-xl text-sm font-semibold">
            {p.cancel}
          </button>
        </div>
      </motion.div>

      {/* KYC Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl border border-white/8 bg-surface p-6"
      >
        <h2 className="text-base font-semibold text-white mb-6">
          {p.kycTitle}
        </h2>

        {kycStatus === "not_submitted" && (
          <div className="flex items-start gap-4 p-4 rounded-xl border border-warning/20 bg-warning/5">
            <Clock className="w-6 h-6 text-warning flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-warning">{p.kycRequiredTitle}</p>
              <p className="text-xs text-neutral-400 mt-1">{p.kycRequiredBody}</p>
            </div>
            <button type="button" onClick={() => setShowKyc(true)} className="btn-gold px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap">{p.kycStart}</button>
          </div>
        )}
        {kycStatus === "pending" && (
          <div className="flex items-start gap-4 p-4 rounded-xl border border-blue-400/20 bg-blue-400/5">
            <Clock className="w-6 h-6 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-blue-400">{p.kycPendingTitle}</p>
              <p className="text-xs text-neutral-400 mt-1">
                {kycPendingText}
              </p>
            </div>
          </div>
        )}
        {kycStatus === "verified" && (
          <div className="flex items-start gap-4 p-4 rounded-xl border border-success/20 bg-success/5">
            <CheckCircle2 className="w-6 h-6 text-success flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-success">{p.kycVerifiedTitle}</p>
              <p className="text-xs text-neutral-400 mt-1">{p.kycVerifiedBody}</p>
            </div>
          </div>
        )}
        {kycStatus === "rejected" && (
          <div className="flex items-start gap-4 p-4 rounded-xl border border-danger/20 bg-danger/5">
            <Clock className="w-6 h-6 text-danger flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-danger">{p.kycRejectedTitle}</p>
              <p className="text-xs text-neutral-400 mt-1">
                {latestKyc?.reviewReason || p.kycRejectedFallback}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowKyc(true)}
              className="btn-gold px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap"
            >
              {p.kycResubmit}
            </button>
          </div>
        )}

        <div className="mt-4 grid grid-cols-3 gap-3">
          {[
            { label: p.kycStepIdentity, done: kycStatus !== "not_submitted" && kycStatus !== "rejected" },
            { label: p.kycStepAddress, done: kycStatus !== "not_submitted" && kycStatus !== "rejected" },
            { label: p.kycStepReview, done: kycStatus === "verified" },
          ].map((s) => (
            <div key={s.label} className={`flex items-center gap-2 p-3 rounded-xl border ${s.done ? "border-success/20 bg-success/5" : "bg-white/3 border-white/5"}`}>
              <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${s.done ? "border-success bg-success" : "border-white/15"}`} />
              <span className={`text-xs ${s.done ? "text-success" : "text-neutral-500"}`}>{s.label}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Security */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-2xl border border-white/8 bg-surface p-6"
      >
        <h2 className="text-base font-semibold text-white mb-6">{p.securityTitle}</h2>

        <div className="space-y-3">
          {/* 2FA */}
          <div className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-black/20">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gold-500/10 border border-gold-500/20 flex items-center justify-center">
                <Lock className="w-4 h-4 text-gold-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">
                  {p.twoFATitle}
                </p>
                <p className="text-xs text-neutral-500">
                  {twoFAEnabled ? p.twoFAOnDesc : p.twoFAOffDesc}
                </p>
              </div>
            </div>
            {twoFAEnabled ? (
              <button type="button" onClick={() => {
                setTwoFAEnabled(false);
                if (typeof window !== "undefined") {
                  localStorage.setItem("axon_security_2fa_enabled", "0");
                }
                toast.success(p.toast2faOff);
              }}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-danger border border-danger/20 bg-danger/8 hover:bg-danger/15 transition-colors">
                {p.twoFADisable}
              </button>
            ) : (
              <button type="button" onClick={() => setShow2FA(true)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold btn-gold">
                {p.twoFAEnable}
              </button>
            )}
          </div>

          {/* Change Password */}
          <button type="button" className="w-full flex items-center justify-between p-4 rounded-xl border border-white/5 bg-black/20 hover:border-white/10 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/8 flex items-center justify-center">
                <Shield className="w-4 h-4 text-neutral-400" />
              </div>
              <div className="text-start">
                <p className="text-sm font-medium text-white">{p.changePassword}</p>
                <p className="text-xs text-neutral-500">{p.changePasswordDesc}</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-neutral-500 rtl:rotate-180" />
          </button>
        </div>
      </motion.div>

      {/* Notifications */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="rounded-2xl border border-white/8 bg-surface p-6"
      >
        <h2 className="text-base font-semibold text-white mb-6">
          {p.notifTitle}
        </h2>

        <div className="space-y-3">
          {notifRows.map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-black/20"
            >
              <div className="flex items-center gap-3">
                <Bell className="w-4 h-4 text-neutral-500" />
                <div>
                  <p className="text-sm font-medium text-white">{item.label}</p>
                  <p className="text-xs text-neutral-500">{item.desc}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setNotifications((prev) => {
                    const newVal = !prev[item.key];
                    const state = newVal ? p.notifOn : p.notifOff;
                    toast.success(
                      p.notifToggled.replace("{label}", item.label).replace("{state}", state)
                    );
                    return { ...prev, [item.key]: newVal };
                  });
                }}
                className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
                  notifications[item.key] ? "bg-gold-500" : "bg-white/10"
                }`}
              >
                <span
                  className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all duration-200 ${
                    notifications[item.key] ? "start-7" : "start-1"
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </motion.div>

      {/* KYC Modal */}
      <AnimatePresence>
        {showKyc && (
          <KycUploadModal
            onClose={() => setShowKyc(false)}
            onComplete={() => {
              setKycStatus("pending");
              void loadKycStatus();
            }}
            profile={profileForm}
          />
        )}
      </AnimatePresence>

      {/* 2FA Modal */}
      <AnimatePresence>
        {show2FA && (
          <TwoFAModal
            onClose={() => setShow2FA(false)}
            onEnabled={() => {
              setTwoFAEnabled(true);
              if (typeof window !== "undefined") {
                localStorage.setItem("axon_security_2fa_enabled", "1");
              }
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
