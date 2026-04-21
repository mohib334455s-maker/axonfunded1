"use client";

import { useEffect, useState } from "react";

type Row = {
  id: string;
  pseudonym: string;
  gainPct: number;
  favoritePairs: string;
  accountStatus: string;
};

export default function LeaderboardPage() {
  const [rows, setRows] = useState<Row[] | null>(null);

  useEffect(() => {
    void fetch("/api/public/leaderboard")
      .then((r) => r.json())
      .then((j) => setRows(Array.isArray(j.data) ? j.data : []))
      .catch(() => setRows([]));
  }, []);

  return (
    <div className="mx-auto min-h-screen max-w-6xl px-4 pb-24 pt-24 sm:px-6">
      <h1 className="mb-2 text-center text-3xl font-black text-white md:text-4xl">Leaderboard</h1>
      <p className="mx-auto mb-10 max-w-xl text-center text-sm text-neutral-400">
        Verified performers published by operations. Rankings update when admins approve entries — no demo data is
        shown.
      </p>
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-elevated/60">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-white/10 bg-black/40 text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
            <tr>
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">Trader</th>
              <th className="px-4 py-3">Gain</th>
              <th className="px-4 py-3 hidden md:table-cell">Pairs</th>
              <th className="px-4 py-3">Account</th>
            </tr>
          </thead>
          <tbody>
            {rows === null ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-neutral-500">
                  Loading…
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-neutral-500">
                  No approved leaderboard rows yet. Admins can add and publish entries from the admin panel.
                </td>
              </tr>
            ) : (
              rows.map((r, i) => (
                <tr key={r.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                  <td className="px-4 py-3 font-mono text-gold-500">{i + 1}</td>
                  <td className="px-4 py-3 font-medium text-white">{r.pseudonym}</td>
                  <td className="px-4 py-3 font-mono text-success">{r.gainPct.toFixed(2)}%</td>
                  <td className="px-4 py-3 text-neutral-400 hidden md:table-cell">{r.favoritePairs || "—"}</td>
                  <td className="px-4 py-3 text-neutral-300">{r.accountStatus}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
