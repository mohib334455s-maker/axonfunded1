"use client";

import Link from "next/link";
import { AlertTriangle, ArrowLeft, CheckCircle2, RefreshCw, Scale, Shield, XCircle } from "lucide-react";
import { useLegalDict } from "@/hooks/useLegalDict";

export type LegalClientPage = "privacy" | "terms" | "risk" | "refund";

export function LegalDocumentClient({ page }: { page: LegalClientPage }) {
  const { dict } = useLegalDict();

  const Icon =
    page === "privacy"
      ? Shield
      : page === "terms"
        ? Scale
        : page === "risk"
          ? AlertTriangle
          : RefreshCw;

  const headerWrap =
    page === "risk"
      ? "bg-danger/10 border border-danger/20"
      : "bg-gold-500/10 border border-gold-500/20";

  const iconClass = page === "risk" ? "text-danger" : "text-gold-500";

  if (page === "privacy") {
    const d = dict.privacy;
    return (
      <div className="pt-20 min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-gold-500 transition-colors mb-10"
          >
            <ArrowLeft className="w-4 h-4" />
            {dict.backHome}
          </Link>
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${headerWrap}`}>
                <Icon className={`w-6 h-6 ${iconClass}`} />
              </div>
              <div>
                <h1 className="text-3xl font-black text-white">{d.title}</h1>
                <p className="text-sm text-neutral-500 mt-0.5">{d.lastUpdated}</p>
              </div>
            </div>
            <div className="p-4 rounded-xl border border-gold-500/20 bg-gold-500/5 text-sm text-neutral-300 leading-relaxed">{d.intro}</div>
          </div>
          <div className="space-y-8">
            {d.sections.map((section) => (
              <div key={section.title} className="rounded-2xl border border-white/5 bg-surface p-6">
                <h2 className="text-base font-bold text-white mb-3">{section.title}</h2>
                <p className="text-sm text-neutral-400 leading-relaxed">{section.content}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <p className="text-sm text-neutral-600">
              {d.footerBefore}{" "}
              <Link href="/contact" className="text-gold-500 hover:underline">
                {d.footerLink}
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (page === "terms") {
    const d = dict.terms;
    return (
      <div className="pt-20 min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-gold-500 transition-colors mb-10"
          >
            <ArrowLeft className="w-4 h-4" />
            {dict.backHome}
          </Link>
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${headerWrap}`}>
                <Icon className={`w-6 h-6 ${iconClass}`} />
              </div>
              <div>
                <h1 className="text-3xl font-black text-white">{d.title}</h1>
                <p className="text-sm text-neutral-500 mt-0.5">{d.lastUpdated}</p>
              </div>
            </div>
            <div className="p-4 rounded-xl border border-gold-500/20 bg-gold-500/5 text-sm text-neutral-300 leading-relaxed">
              {d.introBefore}
              <Link href="/rules" className="text-gold-400 font-semibold hover:underline">
                {d.introLinkLabel}
              </Link>
              {d.introAfter}
            </div>
          </div>
          <div className="space-y-8">
            {d.sections.map((section) => (
              <div key={section.title} className="rounded-2xl border border-white/5 bg-surface p-6">
                <h2 className="text-base font-bold text-white mb-3">{section.title}</h2>
                <p className="text-sm text-neutral-400 leading-relaxed">{section.content}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <p className="text-sm text-neutral-600">
              {d.footerBefore}{" "}
              <Link href="/contact" className="text-gold-500 hover:underline">
                {d.footerLink}
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (page === "risk") {
    const d = dict.risk;
    return (
      <div className="pt-20 min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-gold-500 transition-colors mb-10"
          >
            <ArrowLeft className="w-4 h-4" />
            {dict.backHome}
          </Link>
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${headerWrap}`}>
                <Icon className={`w-6 h-6 ${iconClass}`} />
              </div>
              <div>
                <h1 className="text-3xl font-black text-white">{d.title}</h1>
                <p className="text-sm text-neutral-500 mt-0.5">{d.subtitle}</p>
              </div>
            </div>
            <div className="p-4 rounded-xl border border-danger/20 bg-danger/5 text-sm text-neutral-300 leading-relaxed">
              <strong className="text-danger">{d.importantLabel}</strong> {d.importantBody}
            </div>
          </div>
          <div className="space-y-6">
            {d.sections.map((item) => (
              <div key={item.title} className="rounded-2xl border border-white/5 bg-surface p-6">
                <h2 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                  <span className="w-5 h-5 rounded flex items-center justify-center bg-danger/10 flex-shrink-0">
                    <AlertTriangle className="w-3 h-3 text-danger" />
                  </span>
                  {item.title}
                </h2>
                <p className="text-sm text-neutral-400 leading-relaxed">{item.content}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 p-6 rounded-2xl border border-danger/20 bg-danger/5 text-center">
            <p className="text-sm text-neutral-300 leading-relaxed max-w-2xl mx-auto">{d.ack}</p>
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm">
            <Link href="/legal/terms" className="text-gold-500 hover:underline">
              {d.linkTerms}
            </Link>
            <span className="text-neutral-700">·</span>
            <Link href="/legal/privacy" className="text-gold-500 hover:underline">
              {d.linkPrivacy}
            </Link>
            <span className="text-neutral-700">·</span>
            <Link href="/legal/refund" className="text-gold-500 hover:underline">
              {d.linkRefund}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const d = dict.refund;
  return (
    <div className="pt-20 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-gold-500 transition-colors mb-10"
        >
          <ArrowLeft className="w-4 h-4" />
          {dict.backHome}
        </Link>
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${headerWrap}`}>
              <Icon className={`w-6 h-6 ${iconClass}`} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white">{d.title}</h1>
              <p className="text-sm text-neutral-500 mt-0.5">{d.lastUpdated}</p>
            </div>
          </div>
          <div className="p-4 rounded-xl border border-gold-500/20 bg-gold-500/5 text-sm text-neutral-300 leading-relaxed">
            <strong className="text-gold-400">{d.calloutStrong}</strong> {d.calloutA}{" "}
            <strong>{d.calloutBold100}</strong> {d.calloutB} <strong>{d.calloutBoldFirst}</strong> {d.calloutC}{" "}
            <Link href="/rules#refund" className="text-gold-400 underline font-medium">
              {d.calloutLinkRules10}
            </Link>
            {d.calloutD}{" "}
            <Link href="/rules" className="text-gold-400 underline font-medium">
              {d.calloutLinkRules}
            </Link>
            {d.calloutE}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          <div className="rounded-2xl border border-success/20 bg-success/5 p-5">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 className="w-5 h-5 text-success" />
              <h2 className="text-base font-bold text-success">{d.eligibleTitle}</h2>
            </div>
            <ul className="space-y-3 text-sm text-neutral-300">
              {d.eligibleItems.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-success flex-shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-danger/20 bg-danger/5 p-5">
            <div className="flex items-center gap-2 mb-4">
              <XCircle className="w-5 h-5 text-danger" />
              <h2 className="text-base font-bold text-danger">{d.notEligibleTitle}</h2>
            </div>
            <ul className="space-y-3 text-sm text-neutral-300">
              {d.notEligibleItems.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <XCircle className="w-3.5 h-3.5 text-danger flex-shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="space-y-6">
          {d.extraSections.map((item) => (
            <div key={item.title} className="rounded-2xl border border-white/5 bg-surface p-6">
              <h2 className="text-base font-bold text-white mb-3">{item.title}</h2>
              <p className="text-sm text-neutral-400 leading-relaxed">{item.content}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <p className="text-sm text-neutral-500 mb-4">{d.supportPrompt}</p>
          <Link href="/contact" className="btn-gold px-6 py-3 rounded-xl text-sm font-semibold inline-flex items-center gap-2">
            {d.supportCta}
          </Link>
        </div>
      </div>
    </div>
  );
}
