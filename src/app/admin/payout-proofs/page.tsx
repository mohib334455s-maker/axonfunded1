"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { AdminPageHeader, AdminPanel, AdminPanelHeader } from "@/components/admin/AdminPrimitives";

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

export default function AdminPayoutProofsPage() {
  const [rows, setRows] = useState<Proof[]>([]);
  const [cats, setCats] = useState<{ slug: string; name: string }[]>([]);
  const [form, setForm] = useState({
    amountUsd: "",
    paidAt: "",
    txUrl: "",
    txId: "",
    categorySlug: "default",
    receiptMediaId: "",
    published: true,
  });
  const [catSlug, setCatSlug] = useState("");
  const [catName, setCatName] = useState("");

  const load = useCallback(() => {
    void fetch("/api/admin/platform/payout-proofs", { credentials: "include" })
      .then((r) => r.json())
      .then((j) => {
        setRows(Array.isArray(j.data) ? j.data : []);
        setCats(Array.isArray(j.categories) ? j.categories : []);
      });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const upload = async (file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("subdir", "receipts");
    const res = await fetch("/api/admin/platform/upload", { method: "POST", credentials: "include", body: fd });
    const j = await res.json();
    if (!res.ok) throw new Error(j.error || "upload failed");
    setForm((f) => ({ ...f, receiptMediaId: j.mediaId }));
    toast.success("Receipt uploaded");
  };

  const saveProof = async () => {
    const res = await fetch("/api/admin/platform/payout-proofs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        amountUsd: parseFloat(form.amountUsd),
        paidAt: form.paidAt,
        txUrl: form.txUrl,
        txId: form.txId,
        categorySlug: form.categorySlug,
        receiptMediaId: form.receiptMediaId || null,
        published: form.published,
      }),
    });
    if (!res.ok) {
      toast.error("Save failed");
      return;
    }
    toast.success("Saved");
    setForm({ amountUsd: "", paidAt: "", txUrl: "", txId: "", categorySlug: "default", receiptMediaId: "", published: true });
    load();
  };

  const saveCat = async () => {
    await fetch("/api/admin/platform/payout-proofs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ action: "category", slug: catSlug, name: catName }),
    });
    setCatSlug("");
    setCatName("");
    load();
  };

  return (
    <div className="space-y-8">
      <AdminPageHeader title="Payout proofs" description="Upload receipts, link blockchain URLs, categorise and publish." />
      <AdminPanel>
        <AdminPanelHeader title="Categories" />
        <div className="flex flex-wrap gap-2 p-5">
          <input className="rounded border border-white/10 bg-black/30 px-2 py-1 text-sm text-white" placeholder="slug" value={catSlug} onChange={(e) => setCatSlug(e.target.value)} />
          <input className="rounded border border-white/10 bg-black/30 px-2 py-1 text-sm text-white" placeholder="name" value={catName} onChange={(e) => setCatName(e.target.value)} />
          <button type="button" className="rounded bg-[#b8860b] px-3 py-1 text-xs font-semibold text-black" onClick={() => void saveCat()}>
            Add category
          </button>
        </div>
      </AdminPanel>
      <AdminPanel>
        <AdminPanelHeader title="New proof" />
        <div className="grid gap-3 p-5 sm:grid-cols-2">
          <input className="rounded border border-white/10 bg-black/30 px-3 py-2 text-sm text-white" placeholder="Amount USD" value={form.amountUsd} onChange={(e) => setForm((f) => ({ ...f, amountUsd: e.target.value }))} />
          <input className="rounded border border-white/10 bg-black/30 px-3 py-2 text-sm text-white" placeholder="Paid at (ISO)" value={form.paidAt} onChange={(e) => setForm((f) => ({ ...f, paidAt: e.target.value }))} />
          <input className="rounded border border-white/10 bg-black/30 px-3 py-2 text-sm text-white" placeholder="TX URL" value={form.txUrl} onChange={(e) => setForm((f) => ({ ...f, txUrl: e.target.value }))} />
          <input className="rounded border border-white/10 bg-black/30 px-3 py-2 text-sm text-white" placeholder="TXID" value={form.txId} onChange={(e) => setForm((f) => ({ ...f, txId: e.target.value }))} />
          <select className="rounded border border-white/10 bg-black/30 px-3 py-2 text-sm text-white" value={form.categorySlug} onChange={(e) => setForm((f) => ({ ...f, categorySlug: e.target.value }))}>
            <option value="default">default</option>
            {cats.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
          <label className="flex items-center gap-2 text-sm text-[#ebe6dc]">
            <input type="checkbox" checked={form.published} onChange={(e) => setForm((f) => ({ ...f, published: e.target.checked }))} />
            Published
          </label>
          <input type="file" accept="image/*" className="text-xs text-[#ebe6dc]" onChange={(e) => e.target.files?.[0] && void upload(e.target.files[0]).catch(() => toast.error("Upload failed"))} />
          <p className="text-xs text-neutral-500">Receipt media id: {form.receiptMediaId || "—"}</p>
          <button type="button" className="rounded bg-[#b8860b] px-4 py-2 text-sm font-semibold text-black sm:col-span-2" onClick={() => void saveProof()}>
            Save proof
          </button>
        </div>
      </AdminPanel>
      <AdminPanel>
        <AdminPanelHeader title="Existing" />
        <ul className="divide-y divide-white/5 p-5 text-sm text-[#ebe6dc]">
          {rows.map((r) => (
            <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
              <span>
                ${r.amountUsd} · {r.categorySlug} · {r.published ? "pub" : "draft"}
              </span>
              <button
                type="button"
                className="text-xs text-red-300"
                onClick={() =>
                  void fetch(`/api/admin/platform/payout-proofs?id=${encodeURIComponent(r.id)}`, {
                    method: "DELETE",
                    credentials: "include",
                  }).then(() => load())
                }
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </AdminPanel>
    </div>
  );
}
