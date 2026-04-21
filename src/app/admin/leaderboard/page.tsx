"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { AdminPageHeader, AdminPanel, AdminPanelHeader } from "@/components/admin/AdminPrimitives";

type Row = {
  id: string;
  pseudonym: string;
  gainPct: number;
  favoritePairs: string;
  accountStatus: string;
  approved: boolean;
};

export default function AdminLeaderboardPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [minGain, setMinGain] = useState("");
  const [form, setForm] = useState({ pseudonym: "", gainPct: "", favoritePairs: "", accountStatus: "", approved: true });

  const load = useCallback(() => {
    const q = minGain.trim() ? `?minGain=${encodeURIComponent(minGain)}` : "";
    void fetch(`/api/admin/platform/leaderboard${q}`, { credentials: "include" })
      .then((r) => r.json())
      .then((j) => setRows(Array.isArray(j.data) ? j.data : []));
  }, [minGain]);

  useEffect(() => {
    load();
  }, [load]);

  const save = async () => {
    const res = await fetch("/api/admin/platform/leaderboard", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        pseudonym: form.pseudonym,
        gainPct: parseFloat(form.gainPct),
        favoritePairs: form.favoritePairs,
        accountStatus: form.accountStatus,
        approved: form.approved,
      }),
    });
    if (!res.ok) {
      toast.error("Save failed");
      return;
    }
    toast.success("Saved");
    setForm({ pseudonym: "", gainPct: "", favoritePairs: "", accountStatus: "", approved: true });
    load();
  };

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Leaderboard"
        description="Approve rows for the public table, filter by minimum gain, export CSV."
        actions={
          <a
            className="rounded-lg border border-[rgba(212,175,55,0.35)] px-3 py-2 text-xs font-semibold text-[#ebe6dc]"
            href="/api/admin/platform/leaderboard?format=csv"
          >
            Export CSV
          </a>
        }
      />
      <AdminPanel>
        <AdminPanelHeader title="Add row" />
        <div className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-3">
          <input
            className="admin-input rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
            placeholder="Pseudonym"
            value={form.pseudonym}
            onChange={(e) => setForm((f) => ({ ...f, pseudonym: e.target.value }))}
          />
          <input
            className="admin-input rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
            placeholder="Gain %"
            value={form.gainPct}
            onChange={(e) => setForm((f) => ({ ...f, gainPct: e.target.value }))}
          />
          <input
            className="admin-input rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
            placeholder="Pairs (e.g. EURUSD, XAUUSD)"
            value={form.favoritePairs}
            onChange={(e) => setForm((f) => ({ ...f, favoritePairs: e.target.value }))}
          />
          <input
            className="admin-input rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
            placeholder="Account status"
            value={form.accountStatus}
            onChange={(e) => setForm((f) => ({ ...f, accountStatus: e.target.value }))}
          />
          <label className="flex items-center gap-2 text-sm text-[#ebe6dc]">
            <input type="checkbox" checked={form.approved} onChange={(e) => setForm((f) => ({ ...f, approved: e.target.checked }))} />
            Approved (visible on site)
          </label>
          <button type="button" onClick={() => void save()} className="rounded-lg bg-[#b8860b] px-4 py-2 text-sm font-semibold text-black">
            Save row
          </button>
        </div>
      </AdminPanel>
      <AdminPanel>
        <AdminPanelHeader
          title="All rows"
          aside={
            <input
              className="rounded border border-white/10 bg-black/30 px-2 py-1 text-xs text-white"
              placeholder="Min gain filter"
              value={minGain}
              onChange={(e) => setMinGain(e.target.value)}
            />
          }
        />
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[#ebe6dc]">
            <thead className="border-b border-[rgba(212,175,55,0.12)] text-xs uppercase text-[#8f8a82]">
              <tr>
                <th className="px-4 py-2">Pseudonym</th>
                <th className="px-4 py-2">Gain</th>
                <th className="px-4 py-2">Approved</th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-white/5">
                  <td className="px-4 py-2">{r.pseudonym}</td>
                  <td className="px-4 py-2 font-mono">{r.gainPct}%</td>
                  <td className="px-4 py-2">{r.approved ? "yes" : "no"}</td>
                  <td className="space-x-2 px-4 py-2 text-right">
                    <button
                      type="button"
                      className="text-xs text-[#c9a227]"
                      onClick={() =>
                        void fetch("/api/admin/platform/leaderboard", {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          credentials: "include",
                          body: JSON.stringify({ id: r.id, approved: !r.approved }),
                        }).then(() => load())
                      }
                    >
                      Toggle
                    </button>
                    <button
                      type="button"
                      className="text-xs text-red-300"
                      onClick={() =>
                        void fetch(`/api/admin/platform/leaderboard?id=${encodeURIComponent(r.id)}`, {
                          method: "DELETE",
                          credentials: "include",
                        }).then(() => load())
                      }
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminPanel>
    </div>
  );
}
