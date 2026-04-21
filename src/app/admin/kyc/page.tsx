"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileCheck,
  CheckCircle2,
  XCircle,
  Eye,
  Clock,
  User,
  MapPin,
  FileText,
  AlertTriangle,
  X,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import {
  formatRelativeTime,
  type KycSubmission,
} from "@/lib/kyc-store";
import { AdminPageHeader } from "@/components/admin/AdminPrimitives";

export default function AdminKycPage() {
  const [data, setData] = useState<KycSubmission[]>([]);
  const [viewing, setViewing] = useState<KycSubmission | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const reload = async () => {
    const response = await fetch("/api/kyc?scope=all", { cache: "no-store" });
    if (!response.ok) return;
    const payload = (await response.json()) as { data: KycSubmission[] };
    setData(payload.data || []);
  };
  useEffect(() => {
    void reload();
  }, []);

  const filtered = useMemo(
    () =>
      data.filter(
        (item) =>
          item.traderName.toLowerCase().includes(query.toLowerCase()) ||
          item.email.toLowerCase().includes(query.toLowerCase()) ||
          item.id.toLowerCase().includes(query.toLowerCase())
      ),
    [data, query]
  );

  const approve = (id: string) => {
    void (async () => {
      const response = await fetch(`/api/kyc/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "approved" }),
      });
      if (!response.ok) {
        toast.error("Could not approve KYC.");
        return;
      }
      await reload();
      setViewing(null);
      toast.success("KYC approved — trader notified");
    })();
  };

  const reject = (id: string) => {
    if (!rejectReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }
    void (async () => {
      const response = await fetch(`/api/kyc/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "rejected", reason: rejectReason }),
      });
      if (!response.ok) {
        toast.error("Could not reject KYC.");
        return;
      }
      await reload();
      setRejectingId(null);
      setRejectReason("");
      setViewing(null);
      toast.error("KYC rejected — trader notified");
    })();
  };

  const pending = filtered.filter((k) => k.status === "pending");

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="KYC review"
        description="Review identity verification submissions"
      />

      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, email or submission ID..."
          className="w-full bg-surface border border-white/8 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-gold-500/40"
        />
      </div>

      {pending.length > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-warning/25 bg-warning/8">
          <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0" />
          <p className="text-sm text-warning font-semibold">{pending.length} submissions require review</p>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Pending Review", value: filtered.filter((k) => k.status === "pending").length, color: "text-warning", border: "border-warning/20 bg-warning/5" },
          { label: "Approved", value: filtered.filter((k) => k.status === "approved").length, color: "text-success", border: "border-success/15 bg-success/5" },
          { label: "Rejected", value: filtered.filter((k) => k.status === "rejected").length, color: "text-danger", border: "border-danger/15 bg-danger/5" },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl border ${s.border} p-4 text-center`}>
            <p className={`text-3xl font-black font-mono ${s.color}`}>{s.value}</p>
            <p className="text-xs text-neutral-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* KYC list */}
      <div className="space-y-3">
        {filtered.map((kyc, i) => (
          <motion.div key={kyc.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className={`admin-panel rounded-2xl p-5 ${
              kyc.status === "pending" ? "ring-1 ring-warning/15" :
              kyc.status === "approved" ? "ring-1 ring-success/12" : ""
            }`}>
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center">
                  <User className="w-5 h-5 text-gold-500" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-white">{kyc.traderName}</p>
                    <span className="text-[10px] text-neutral-600">{kyc.id}</span>
                  </div>
                  <p className="text-xs text-neutral-500">{kyc.email}</p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="flex items-center gap-1 text-[11px] text-neutral-500">
                      <MapPin className="w-3 h-3" />{kyc.country}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-neutral-500">
                      <FileText className="w-3 h-3" />{kyc.docType}
                    </span>
                    <span className="text-[11px] text-neutral-600">{kyc.accountSize} account</span>
                    <span className="flex items-center gap-1 text-[11px] text-neutral-600">
                      <Clock className="w-3 h-3" />{formatRelativeTime(kyc.createdAt)}
                    </span>
                  </div>
                  {kyc.reviewReason && <p className="text-xs text-danger mt-1">Reason: {kyc.reviewReason}</p>}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button onClick={() => setViewing(kyc)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-white/10 text-xs text-neutral-300 hover:text-white hover:bg-white/8 transition-colors">
                  <Eye className="w-3.5 h-3.5" /> Review
                </button>
                {kyc.status === "pending" && (
                  <>
                    <button onClick={() => approve(kyc.id)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-success/12 border border-success/20 text-success text-xs font-semibold hover:bg-success/20 transition-colors">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                    </button>
                    <button onClick={() => setRejectingId(kyc.id)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-danger/10 border border-danger/20 text-danger text-xs font-semibold hover:bg-danger/18 transition-colors">
                      <XCircle className="w-3.5 h-3.5" /> Reject
                    </button>
                  </>
                )}
                {kyc.status === "approved" && (
                  <span className="flex items-center gap-1.5 text-xs text-success font-semibold px-3 py-2 rounded-lg bg-success/10 border border-success/20">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                  </span>
                )}
                {kyc.status === "rejected" && (
                  <span className="flex items-center gap-1.5 text-xs text-danger font-semibold px-3 py-2 rounded-lg bg-danger/10 border border-danger/20">
                    <XCircle className="w-3.5 h-3.5" /> Rejected
                  </span>
                )}
              </div>
            </div>

            {/* Reject reason input */}
            <AnimatePresence>
              {rejectingId === kyc.id && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                  className="mt-4 flex gap-2">
                  <input value={rejectReason} onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Enter rejection reason (required)..."
                    className="flex-1 bg-black/30 border border-danger/25 rounded-xl px-4 py-2.5 text-sm text-white placeholder-neutral-600 focus:outline-none" />
                  <button onClick={() => reject(kyc.id)}
                    className="px-4 py-2.5 rounded-xl bg-danger/15 border border-danger/25 text-danger text-xs font-bold hover:bg-danger/25 transition-colors">
                    Confirm Reject
                  </button>
                  <button onClick={() => { setRejectingId(null); setRejectReason(""); }}
                    className="p-2.5 rounded-xl border border-white/10 text-neutral-500 hover:text-white hover:bg-white/5 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {/* Document viewer modal */}
      <AnimatePresence>
        {viewing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
            onClick={(e) => { if (e.target === e.currentTarget) setViewing(null); }}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-2xl admin-login-card border border-[rgba(212,175,55,0.14)] overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
                <div className="flex items-center gap-3">
                  <FileCheck className="w-5 h-5 text-gold-500" />
                  <h3 className="text-base font-bold text-white">KYC Review — {viewing.traderName}</h3>
                </div>
                <button onClick={() => setViewing(null)} className="p-1.5 rounded-lg text-neutral-500 hover:text-white hover:bg-white/8 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-5 space-y-4">
                {/* Info */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Full Name", value: viewing.traderName },
                    { label: "Email", value: viewing.email },
                    { label: "Country", value: viewing.country },
                    { label: "Document Type", value: viewing.docType },
                    { label: "Account Size", value: viewing.accountSize },
                    { label: "Source of Funds", value: viewing.sourceOfFunds },
                  ].map((f) => (
                    <div key={f.label} className="rounded-xl border border-white/5 bg-surface p-3">
                      <p className="text-[10px] text-neutral-600 uppercase tracking-wider">{f.label}</p>
                      <p className="text-sm text-white font-semibold mt-0.5">{f.value}</p>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { title: "ID Front", file: viewing.files.idFront },
                    { title: "ID Back", file: viewing.files.idBack },
                    { title: "Address Proof", file: viewing.files.addressProof },
                    { title: "Selfie", file: viewing.files.selfie },
                  ].map((doc) => (
                    <div key={doc.title} className="rounded-xl border border-white/8 bg-surface p-3">
                      <p className="text-xs text-neutral-400 mb-2">{doc.title}</p>
                      {doc.file ? (
                        <div className="space-y-1">
                          <p className="text-sm text-white font-medium truncate">{doc.file.name}</p>
                          <p className="text-[11px] text-neutral-600">
                            {(doc.file.size / 1024 / 1024).toFixed(2)} MB · {doc.file.type}
                          </p>
                        </div>
                      ) : (
                        <p className="text-xs text-neutral-600">Not provided</p>
                      )}
                    </div>
                  ))}
                </div>
                {viewing.status === "pending" && (
                  <div className="flex gap-3 pt-2">
                    <button onClick={() => approve(viewing.id)}
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-success/12 border border-success/25 text-success font-bold text-sm hover:bg-success/20 transition-colors">
                      <CheckCircle2 className="w-4 h-4" /> Approve KYC
                    </button>
                    <button onClick={() => { setViewing(null); setRejectingId(viewing.id); }}
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-danger/10 border border-danger/20 text-danger font-bold text-sm hover:bg-danger/18 transition-colors">
                      <XCircle className="w-4 h-4" /> Reject
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
