"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Search, Filter, MoreVertical, CheckCircle2, XCircle,
  Clock, Shield, Ban, Eye, Mail, ChevronDown,
  UserCheck, UserX, Download,
} from "lucide-react";
import { mockLeaderboard } from "@/lib/mock-data";
import { WORLD_COUNTRY_NAMES_EN } from "@/lib/countries";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/admin/AdminPrimitives";

const COUNTRIES = ["All Countries", ...WORLD_COUNTRY_NAMES_EN];
const STATUSES = ["All Status", "Active", "Funded", "Evaluation", "Suspended"];

const users = mockLeaderboard.map((t, i) => ({
  id: t.traderId,
  name: t.traderName,
  email: `pending-${t.traderId}@axonfunded.com`,
  country: t.country,
  status: i < 3 ? "funded" : i < 8 ? "active" : i === 10 ? "suspended" : "evaluation",
  accountSize: `$${(t.accountSize / 1000).toFixed(0)}K`,
  profit: t.profit,
  joined: `Jan ${10 + i}, 2024`,
  kyc: i < 5 ? "verified" : i < 12 ? "pending" : "not_submitted",
  challenges: Math.floor(Math.random() * 3) + 1,
}));

const statusStyle: Record<string, string> = {
  funded: "bg-success/10 text-success border-success/20",
  active: "bg-blue-400/10 text-blue-400 border-blue-400/20",
  evaluation: "bg-warning/10 text-warning border-warning/20",
  suspended: "bg-danger/10 text-danger border-danger/20",
};

const kycStyle: Record<string, string> = {
  verified: "text-success",
  pending: "text-warning",
  not_submitted: "text-neutral-600",
};

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const filtered = users.filter((u) => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) || u.id.includes(search);
    const matchStatus = statusFilter === "All Status" || u.status === statusFilter.toLowerCase();
    return matchSearch && matchStatus;
  });

  const toggleSelect = (id: string) =>
    setSelectedUsers((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  const handleAction = (action: string, userId: string, name: string) => {
    setOpenMenu(null);
    const messages: Record<string, string> = {
      email: `Email sent to ${name}`,
      suspend: `${name} suspended`,
      activate: `${name} activated`,
      viewProfile: `Opening ${name}'s profile`,
    };
    toast.success(messages[action] || action);
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Users"
        description={`${users.length} registered traders`}
        actions={
          <div className="flex items-center gap-2">
          {selectedUsers.length > 0 && (
            <div className="flex items-center gap-2">
              <button onClick={() => { toast.success(`Email sent to ${selectedUsers.length} users`); setSelectedUsers([]); }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-white/10 text-xs text-white hover:bg-white/5 transition-colors">
                <Mail className="w-3.5 h-3.5" /> Email Selected ({selectedUsers.length})
              </button>
              <button onClick={() => { toast.error(`${selectedUsers.length} users suspended`); setSelectedUsers([]); }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-danger/20 bg-danger/8 text-xs text-danger hover:bg-danger/15 transition-colors">
                <Ban className="w-3.5 h-3.5" /> Suspend
              </button>
            </div>
          )}
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[rgba(212,175,55,0.18)] text-xs text-[#b8a88a] hover:text-[#ebe6dc] hover:bg-[rgba(255,255,255,0.05)] transition-colors">
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
          </div>
        }
      />

      {/* Filters */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or ID..."
            className="w-full bg-surface border border-white/8 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-gold-500/40 transition-all" />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-600" />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-surface border border-white/8 rounded-xl pl-9 pr-8 py-2.5 text-sm text-white focus:outline-none focus:border-gold-500/40 appearance-none cursor-pointer">
            {STATUSES.map((s) => <option key={s} value={s} className="bg-surface">{s}</option>)}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-600 pointer-events-none" />
        </div>
        <div className="relative">
          <select className="bg-surface border border-white/8 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-gold-500/40 appearance-none cursor-pointer pr-8">
            {COUNTRIES.map((c) => <option key={c} value={c} className="bg-surface">{c}</option>)}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-600 pointer-events-none" />
        </div>
      </motion.div>

      {/* Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="admin-panel rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5 text-left">
                <th className="px-4 py-3.5 w-10">
                  <input type="checkbox"
                    checked={selectedUsers.length === filtered.length && filtered.length > 0}
                    onChange={(e) => setSelectedUsers(e.target.checked ? filtered.map((u) => u.id) : [])}
                    className="w-4 h-4 rounded accent-gold-500" />
                </th>
                <th className="px-4 py-3.5 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Trader</th>
                <th className="px-4 py-3.5 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3.5 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Account</th>
                <th className="px-4 py-3.5 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Profit</th>
                <th className="px-4 py-3.5 text-xs font-semibold text-neutral-500 uppercase tracking-wider">KYC</th>
                <th className="px-4 py-3.5 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Joined</th>
                <th className="px-4 py-3.5 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/3">
              {filtered.map((user) => (
                <tr key={user.id} className={`hover:bg-white/1 transition-colors ${selectedUsers.includes(user.id) ? "bg-gold-500/3" : ""}`}>
                  <td className="px-4 py-3.5">
                    <input type="checkbox" checked={selectedUsers.includes(user.id)}
                      onChange={() => toggleSelect(user.id)}
                      className="w-4 h-4 rounded accent-gold-500" />
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gold-500/15 border border-gold-500/20 flex items-center justify-center text-xs font-bold text-gold-500 flex-shrink-0">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{user.name}</p>
                        <p className="text-xs text-neutral-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border capitalize ${statusStyle[user.status]}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-sm text-white font-mono">{user.accountSize}</span>
                    <p className="text-[11px] text-neutral-600">{user.challenges} challenge{user.challenges > 1 ? "s" : ""}</p>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`text-sm font-bold font-mono ${user.profit > 0 ? "text-success" : "text-danger"}`}>
                      {user.profit > 0 ? "+" : ""}${user.profit.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className={`flex items-center gap-1.5 text-xs font-semibold ${kycStyle[user.kyc]}`}>
                      {user.kyc === "verified" ? <CheckCircle2 className="w-3.5 h-3.5" /> :
                       user.kyc === "pending" ? <Clock className="w-3.5 h-3.5" /> :
                       <XCircle className="w-3.5 h-3.5" />}
                      <span className="capitalize">{user.kyc.replace("_", " ")}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-neutral-500">{user.joined}</td>
                  <td className="px-4 py-3.5 relative">
                    <button onClick={() => setOpenMenu(openMenu === user.id ? null : user.id)}
                      className="p-1.5 rounded-lg text-neutral-600 hover:text-white hover:bg-white/8 transition-colors">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    {openMenu === user.id && (
                      <div className="absolute right-2 top-full mt-1 w-44 rounded-xl border border-white/10 bg-[#111] shadow-xl z-20 py-1">
                        {[
                          { icon: Eye, label: "View Profile", action: "viewProfile" },
                          { icon: Mail, label: "Send Email", action: "email" },
                          { icon: Shield, label: "View KYC", action: "kyc" },
                          { icon: user.status === "suspended" ? UserCheck : UserX,
                            label: user.status === "suspended" ? "Activate User" : "Suspend User",
                            action: user.status === "suspended" ? "activate" : "suspend",
                            danger: user.status !== "suspended" },
                        ].map((item) => (
                          <button key={item.label} onClick={() => handleAction(item.action, user.id, user.name)}
                            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm transition-colors ${
                              item.danger ? "text-danger hover:bg-danger/10" : "text-neutral-300 hover:bg-white/5"
                            }`}>
                            <item.icon className="w-3.5 h-3.5" />
                            {item.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-12 text-center text-neutral-600 text-sm">No users found</div>
          )}
        </div>
        <div className="px-5 py-3.5 border-t border-white/5 flex items-center justify-between">
          <span className="text-xs text-neutral-600">Showing {filtered.length} of {users.length} users</span>
          <div className="flex items-center gap-1">
            {[1,2,3].map((p) => (
              <button key={p} className={`w-7 h-7 rounded-lg text-xs font-semibold transition-colors ${
                p === 1 ? "bg-gold-500/15 text-gold-500 border border-gold-500/20" : "text-neutral-500 hover:bg-white/5"
              }`}>{p}</button>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
