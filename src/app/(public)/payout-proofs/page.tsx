"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Script from "next/script";

type Proof = {
  id: string;
  amountUsd: number;
  paidAt: string;
  txUrl: string;
  txId: string;
  categorySlug: string;
  receiptMediaId: string | null;
  published: boolean;
};

export default function PayoutProofsPage() {
  const [proofs, setProofs] = useState<Proof[]>([]);
  const [tpId, setTpId] = useState("");

  useEffect(() => {
    void fetch("/api/public/payout-proofs")
      .then((r) => r.json())
      .then((j) => {
        setProofs(Array.isArray(j.data) ? j.data : []);
        setTpId(typeof j.trustpilotBusinessUnitId === "string" ? j.trustpilotBusinessUnitId : "");
      })
      .catch(() => setProofs([]));
  }, []);

  return (
    <div className="mx-auto min-h-screen max-w-6xl px-4 pb-24 pt-24 sm:px-6">
      <h1 className="mb-2 text-center text-3xl font-black text-white md:text-4xl">Payout proofs</h1>
      <p className="mx-auto mb-10 max-w-xl text-center text-sm text-neutral-400">
        On-chain references and receipts published by finance. Only admin-approved items appear here.
      </p>

      {tpId ? (
        <div className="mb-12 flex justify-center">
          <Script src="https://widget.trustpilot.com/bootstrap/v5/tp.widget.bootstrap.min.js" strategy="lazyOnload" />
          <div
            className="trustpilot-widget"
            data-locale="en-US"
            data-template-id="5419b6a8b0d04a076446a9ad"
            data-businessunit-id={tpId}
            data-style-height="24px"
            data-style-width="100%"
            data-theme="dark"
          >
            <a href="https://www.trustpilot.com/review/axonfunded.com" target="_blank" rel="noreferrer" className="text-neutral-500 text-xs">
              Trustpilot
            </a>
          </div>
        </div>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {proofs.length === 0 ? (
          <p className="col-span-full py-12 text-center text-neutral-500">
            No payout proofs published yet. Configure Trustpilot ID and proofs in admin.
          </p>
        ) : (
          proofs.map((p) => (
            <article
              key={p.id}
              className="flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-elevated/70 shadow-[0_16px_40px_-24px_rgba(0,0,0,0.8)]"
            >
              <div className="border-b border-white/10 px-4 py-3">
                <p className="text-2xl font-black text-gold-500">${p.amountUsd.toLocaleString()}</p>
                <p className="text-xs text-neutral-500">{new Date(p.paidAt).toLocaleDateString()}</p>
                <p className="mt-1 text-[10px] uppercase tracking-wider text-neutral-600">{p.categorySlug}</p>
              </div>
              {p.receiptMediaId ? (
                <div className="relative aspect-video w-full bg-black">
                  <Image
                    src={`/api/public/media/${p.receiptMediaId}`}
                    alt="Receipt"
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="flex aspect-video items-center justify-center bg-black/50 text-xs text-neutral-600">
                  No receipt image
                </div>
              )}
              <div className="mt-auto space-y-2 px-4 py-3">
                {p.txId ? (
                  <p className="break-all font-mono text-[11px] text-neutral-400">
                    TX: {p.txId}
                  </p>
                ) : null}
                {p.txUrl ? (
                  <a href={p.txUrl} target="_blank" rel="noreferrer" className="text-xs font-semibold text-gold-500 hover:underline">
                    View transaction
                  </a>
                ) : null}
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
