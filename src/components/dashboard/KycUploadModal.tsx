"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Upload, CheckCircle2, FileText, User,
  MapPin, Camera, ChevronRight, AlertCircle, Loader2, Wallet,
} from "lucide-react";
import { toast } from "sonner";
import type { KycFileMeta } from "@/lib/kyc-store";

interface Props {
  onClose: () => void;
  onComplete: () => void;
  profile: {
    name: string;
    email: string;
    country: string;
  };
}

const docTypes = [
  { id: "passport", label: "Passport", icon: FileText },
  { id: "national_id", label: "National ID", icon: User },
  { id: "drivers_license", label: "Driver's License", icon: Camera },
];

function UploadBox({
  label,
  file,
  onPick,
}: {
  label: string;
  file?: File | null;
  onPick: () => void;
}) {
  return (
    <button onClick={onPick}
      className={`w-full h-32 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all ${
        file
          ? "border-success/40 bg-success/5"
          : "border-white/15 hover:border-gold-500/40 hover:bg-gold-500/3"
      }`}>
      {file ? (
        <>
          <CheckCircle2 className="w-7 h-7 text-success" />
          <span className="text-xs text-success font-semibold">{label} — {file.name}</span>
          <span className="text-[10px] text-success/70">
            {(file.size / 1024 / 1024).toFixed(2)} MB
          </span>
        </>
      ) : (
        <>
          <Upload className="w-6 h-6 text-neutral-600" />
          <span className="text-xs text-neutral-500">{label}</span>
          <span className="text-[10px] text-neutral-700">JPG, PNG or PDF · Max 5MB</span>
        </>
      )}
    </button>
  );
}

export default function KycUploadModal({ onClose, onComplete, profile }: Props) {
  const [step, setStep] = useState(0);
  const [docType, setDocType] = useState("");
  const [sourceOfFunds, setSourceOfFunds] = useState("");
  const [files, setFiles] = useState<{
    front: File | null;
    back: File | null;
    address: File | null;
    selfie: File | null;
  }>({ front: null, back: null, address: null, selfie: null });
  const [submitting, setSubmitting] = useState(false);
  const refs = {
    front: useRef<HTMLInputElement>(null),
    back: useRef<HTMLInputElement>(null),
    address: useRef<HTMLInputElement>(null),
    selfie: useRef<HTMLInputElement>(null),
  };

  const steps = ["Document Type", "Upload Documents", "Proof of Address", "Review"];

  const pickFile = (key: keyof typeof files, file?: File) => {
    if (!file) return;
    const allowed = ["image/jpeg", "image/png", "application/pdf"];
    if (!allowed.includes(file.type)) {
      toast.error("Only JPG, PNG, or PDF files are allowed.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Max file size is 5MB.");
      return;
    }
    setFiles((prev) => ({ ...prev, [key]: file }));
    toast.success(`${key} uploaded`);
  };

  const toMeta = (file: File): KycFileMeta => ({
    name: file.name,
    size: file.size,
    type: file.type,
    uploadedAt: new Date(),
  });

  const handleSubmit = async () => {
    if (!files.front || !files.address) {
      toast.error("Required files are missing.");
      return;
    }
    if (docType !== "passport" && !files.back) {
      toast.error("Back side is required for this document type.");
      return;
    }
    if (!sourceOfFunds) {
      toast.error("Please select source of funds.");
      return;
    }

    setSubmitting(true);
    const response = await fetch("/api/kyc", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: "current-user",
        traderName: profile.name || "Trader",
        email: profile.email || "user@email.com",
        country: profile.country || "Unknown",
        accountSize: "$50K",
        docType,
        sourceOfFunds,
        files: {
          idFront: toMeta(files.front),
          idBack: files.back ? toMeta(files.back) : undefined,
          addressProof: toMeta(files.address),
          selfie: files.selfie ? toMeta(files.selfie) : undefined,
        },
      }),
    });
    if (!response.ok) {
      setSubmitting(false);
      toast.error("Could not submit KYC. Please try again.");
      return;
    }
    setSubmitting(false);
    toast.success("KYC submitted! Review takes up to 24 hours.");
    onComplete();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#0d0d0d] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
          <div>
            <h3 className="text-base font-bold text-white">KYC Verification</h3>
            <p className="text-xs text-neutral-500 mt-0.5">Step {step + 1} of {steps.length}: {steps[step]}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-neutral-600 hover:text-white hover:bg-white/8 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress */}
        <div className="flex">
          {steps.map((_, i) => (
            <div key={i} className={`flex-1 h-0.5 transition-all ${i <= step ? "bg-gold-500" : "bg-white/8"}`} />
          ))}
        </div>

        <div className="p-5">
          <AnimatePresence mode="wait">
            {/* Step 0: Document type */}
            {step === 0 && (
              <motion.div key="type" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                className="space-y-3">
                <p className="text-sm text-neutral-400 mb-4">Select the type of government-issued ID you will upload.</p>
                {docTypes.map((d) => (
                  <button key={d.id} onClick={() => setDocType(d.id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${
                      docType === d.id ? "border-gold-500/40 bg-gold-500/8" : "border-white/8 hover:border-white/15"
                    }`}>
                    <d.icon className={`w-5 h-5 ${docType === d.id ? "text-gold-500" : "text-neutral-500"}`} />
                    <span className={`text-sm font-semibold ${docType === d.id ? "text-white" : "text-neutral-300"}`}>{d.label}</span>
                    <div className={`ml-auto w-4 h-4 rounded-full border-2 ${docType === d.id ? "border-gold-500 bg-gold-500" : "border-white/20"}`} />
                  </button>
                ))}
              </motion.div>
            )}

            {/* Step 1: Upload ID */}
            {step === 1 && (
              <motion.div key="upload" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                className="space-y-3">
                <p className="text-sm text-neutral-400 mb-4">Upload clear photos of your <strong className="text-white">{docTypes.find((d) => d.id === docType)?.label}</strong>. Both sides required.</p>
                <UploadBox label="Front side" file={files.front}
                  onPick={() => refs.front.current?.click()} />
                <input ref={refs.front} type="file" accept=".jpg,.jpeg,.png,.pdf" className="hidden"
                  onChange={(e) => pickFile("front", e.target.files?.[0])} />
                {docType !== "passport" && (
                  <>
                    <UploadBox label="Back side" file={files.back}
                      onPick={() => refs.back.current?.click()} />
                    <input ref={refs.back} type="file" accept=".jpg,.jpeg,.png,.pdf" className="hidden"
                      onChange={(e) => pickFile("back", e.target.files?.[0])} />
                  </>
                )}
                <UploadBox label="Selfie with ID (optional)" file={files.selfie}
                  onPick={() => refs.selfie.current?.click()} />
                <input ref={refs.selfie} type="file" accept=".jpg,.jpeg,.png" className="hidden"
                  onChange={(e) => pickFile("selfie", e.target.files?.[0])} />
                <div className="flex items-start gap-2 p-3 rounded-xl bg-white/3 border border-white/5">
                  <AlertCircle className="w-4 h-4 text-neutral-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-neutral-500">Ensure the document is fully visible, not expired, and all text is legible. Photos taken in good lighting.</p>
                </div>
              </motion.div>
            )}

            {/* Step 2: Proof of address */}
            {step === 2 && (
              <motion.div key="address" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                className="space-y-3">
                <p className="text-sm text-neutral-400 mb-4">Upload a recent proof of address (utility bill, bank statement, or official letter). Must be dated within the last 3 months.</p>
                <UploadBox label="Proof of Address document" file={files.address}
                  onPick={() => refs.address.current?.click()} />
                <input ref={refs.address} type="file" accept=".jpg,.jpeg,.png,.pdf" className="hidden"
                  onChange={(e) => pickFile("address", e.target.files?.[0])} />
                <div>
                  <label className="text-xs text-neutral-500 uppercase tracking-wider block mb-1.5">
                    Source of Funds
                  </label>
                  <div className="relative">
                    <Wallet className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
                    <select
                      value={sourceOfFunds}
                      onChange={(e) => setSourceOfFunds(e.target.value)}
                      className="w-full bg-black/30 border border-white/8 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-gold-500/40 appearance-none"
                    >
                      <option value="" className="bg-surface text-neutral-500">Select source of funds...</option>
                      {[
                        "Salary",
                        "Business income",
                        "Trading income",
                        "Savings",
                        "Investments",
                        "Inheritance",
                      ].map((item) => (
                        <option key={item} value={item} className="bg-surface">
                          {item}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-neutral-500 font-semibold">Accepted documents:</p>
                  {["Utility bill (electricity, gas, water)", "Bank statement", "Government letter", "Tax certificate"].map((d) => (
                    <div key={d} className="flex items-center gap-2 text-xs text-neutral-500">
                      <div className="w-1 h-1 rounded-full bg-gold-500/60" />{d}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 3: Review */}
            {step === 3 && (
              <motion.div key="review" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                className="space-y-3">
                <p className="text-sm text-neutral-400 mb-4">Review your submission before sending.</p>
                {[
                  { label: "Document Type", value: docTypes.find((d) => d.id === docType)?.label || "", icon: FileText, ok: !!docType },
                  { label: "ID Front", value: files.front ? files.front.name : "Missing", icon: Camera, ok: !!files.front },
                  { label: "ID Back / N/A", value: (files.back || docType === "passport") ? (files.back?.name || "N/A for passport") : "Missing", icon: Camera, ok: !!files.back || docType === "passport" },
                  { label: "Proof of Address", value: files.address ? files.address.name : "Missing", icon: MapPin, ok: !!files.address },
                  { label: "Source of Funds", value: sourceOfFunds || "Missing", icon: Wallet, ok: !!sourceOfFunds },
                ].map((item) => (
                  <div key={item.label} className={`flex items-center justify-between p-3 rounded-xl border ${item.ok ? "border-success/15 bg-success/5" : "border-danger/15 bg-danger/5"}`}>
                    <div className="flex items-center gap-2.5">
                      <item.icon className={`w-4 h-4 ${item.ok ? "text-success" : "text-danger"}`} />
                      <span className="text-sm text-neutral-300">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-xs font-semibold ${item.ok ? "text-success" : "text-danger"}`}>{item.value}</span>
                      {item.ok ? <CheckCircle2 className="w-3.5 h-3.5 text-success" /> : <X className="w-3.5 h-3.5 text-danger" />}
                    </div>
                  </div>
                ))}
                <div className="p-3 rounded-xl bg-gold-500/5 border border-gold-500/15 text-xs text-neutral-400">
                  After submission, our compliance team will review your documents within <strong className="text-white">24 hours</strong>. You will receive an email notification when the review is complete.
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex gap-3 mt-5">
            {step > 0 && (
              <button onClick={() => setStep((s) => s - 1)} className="btn-outline px-5 py-3 rounded-xl text-sm font-semibold">Back</button>
            )}
            {step < steps.length - 1 ? (
              <button
                onClick={() => {
                  if (step === 0 && !docType) { toast.error("Please select a document type"); return; }
                  if (step === 1 && !files.front) { toast.error("Please upload the front of your document"); return; }
                  if (step === 1 && docType !== "passport" && !files.back) { toast.error("Please upload the back side of your document"); return; }
                  if (step === 2 && !files.address) { toast.error("Please upload proof of address"); return; }
                  if (step === 2 && !sourceOfFunds) { toast.error("Please select source of funds"); return; }
                  setStep((s) => s + 1);
                }}
                className="flex-1 btn-gold py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2">
                Continue <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <motion.button onClick={handleSubmit} disabled={submitting}
                whileHover={{ scale: submitting ? 1 : 1.01 }}
                className="flex-1 btn-gold py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-60">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {submitting ? "Submitting..." : "Submit for Review"}
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
