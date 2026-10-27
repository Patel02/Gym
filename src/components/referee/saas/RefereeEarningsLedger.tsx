"use client";

import React, { useState } from "react";
import {
  CreditCard,
  Download,
  Printer,
  CheckCircle2,
  Clock,
  TrendingUp,
  Award,
  ShieldCheck,
  FileText,
  DollarSign,
  ArrowUpRight,
} from "lucide-react";

interface HonorariumEntry {
  id: string;
  meetTitle: string;
  date: string;
  platform: string;
  role: string;
  stipendAmount: number;
  travelAmount: number;
  totalAmount: number;
  status: "PAID" | "PROCESSING" | "APPROVED";
  utrNumber?: string;
}

const SAMPLE_ENTRIES: HonorariumEntry[] = [
  {
    id: "HON-2026-081",
    meetTitle: "Gujarat State Powerlifting Championship 2026",
    date: "Oct 5, 2026",
    platform: "Platform 1",
    role: "Chief Technical Referee & Jury",
    stipendAmount: 2500,
    travelAmount: 1200,
    totalAmount: 3700,
    status: "APPROVED",
  },
  {
    id: "HON-2026-074",
    meetTitle: "District Baroda Open Selection Meet 2026",
    date: "Sep 20, 2026",
    platform: "Platform 1",
    role: "Side Referee (Left)",
    stipendAmount: 2000,
    travelAmount: 800,
    totalAmount: 2800,
    status: "PAID",
    utrNumber: "UPI/628194018291",
  },
  {
    id: "HON-2026-068",
    meetTitle: "West Zone Inter-District Bench Press Cup",
    date: "Aug 15, 2026",
    platform: "Platform 2",
    role: "Technical Jury President",
    stipendAmount: 3000,
    travelAmount: 1500,
    totalAmount: 4500,
    status: "PAID",
    utrNumber: "NEFT/SBIN82910481",
  },
  {
    id: "HON-2026-052",
    meetTitle: "Gujarat State Sub-Junior & Junior Trials",
    date: "Jul 11, 2026",
    platform: "Platform 1",
    role: "Chief Referee",
    stipendAmount: 2500,
    travelAmount: 1000,
    totalAmount: 3500,
    status: "PAID",
    utrNumber: "UPI/519284019281",
  },
];

export function RefereeEarningsLedger() {
  const [entries] = useState<HonorariumEntry[]>(SAMPLE_ENTRIES);

  const totalEarned = entries.reduce((acc, curr) => acc + curr.totalAmount, 0);
  const totalPaid = entries
    .filter((e) => e.status === "PAID")
    .reduce((acc, curr) => acc + curr.totalAmount, 0);
  const totalPending = entries
    .filter((e) => e.status !== "PAID")
    .reduce((acc, curr) => acc + curr.totalAmount, 0);

  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-[#130a05] to-[#080201] p-5 sm:p-7 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-gym-primary/20 text-gym-primary">
              <CreditCard className="h-4 w-4" />
            </span>
            <span className="text-[10px] font-black uppercase tracking-widest text-gym-primary">
              Financial Transparency • Phase 3
            </span>
          </div>
          <h2 className="font-heading text-xl sm:text-2xl font-black uppercase tracking-wider text-white">
            Official Technical Referee Honorarium &amp; Payout Ledger
          </h2>
          <p className="text-xs text-zinc-400">
            Per-meet officiating honorarium allowances, travel reimbursements, and direct bank disbursement vouchers.
          </p>
        </div>

        <button
          type="button"
          onClick={() => window.print()}
          className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-zinc-200 hover:bg-white/10 hover:text-white transition-all shrink-0"
        >
          <Printer className="h-3.5 w-3.5 text-gym-primary" />
          <span>Print Annual Tax Statement</span>
        </button>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-white/10 bg-zinc-900/60 p-4">
          <div className="flex items-center justify-between text-zinc-400 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Season Honorarium</span>
            <TrendingUp className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="font-heading text-2xl sm:text-3xl font-bold text-white">
            ₹{totalEarned.toLocaleString("en-IN")}
          </div>
          <span className="text-[11px] text-zinc-500">4 Sanctioned Championship Meets</span>
        </div>

        <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4">
          <div className="flex items-center justify-between text-emerald-400 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Disbursed to Bank Account</span>
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <div className="font-heading text-2xl sm:text-3xl font-bold text-emerald-300">
            ₹{totalPaid.toLocaleString("en-IN")}
          </div>
          <span className="text-[11px] text-emerald-400/80">3 Payments Settled via NEFT / UPI</span>
        </div>

        <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-4">
          <div className="flex items-center justify-between text-amber-400 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Approved Pending Settlement</span>
            <Clock className="h-4 w-4" />
          </div>
          <div className="font-heading text-2xl sm:text-3xl font-bold text-amber-300">
            ₹{totalPending.toLocaleString("en-IN")}
          </div>
          <span className="text-[11px] text-amber-400/80">Session 2 Today (Payable Friday)</span>
        </div>
      </div>

      {/* Detailed Ledger Table */}
      <div className="overflow-hidden rounded-xl border border-white/10 bg-zinc-950/80">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="border-b border-white/10 bg-zinc-900 text-[10px] font-black uppercase tracking-wider text-zinc-400">
              <tr>
                <th className="px-4 py-3">Meet &amp; Date</th>
                <th className="px-4 py-3">Role &amp; Platform</th>
                <th className="px-4 py-3">Stipend</th>
                <th className="px-4 py-3">Travel TA/DA</th>
                <th className="px-4 py-3">Total Payable</th>
                <th className="px-4 py-3">Payment Status</th>
                <th className="px-4 py-3 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {entries.map((entry) => (
                <tr key={entry.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3.5">
                    <div className="font-bold text-white line-clamp-1">{entry.meetTitle}</div>
                    <div className="text-[11px] text-zinc-500">{entry.date}</div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="font-semibold text-zinc-200">{entry.role}</div>
                    <div className="text-[11px] text-gym-primary">{entry.platform}</div>
                  </td>
                  <td className="px-4 py-3.5 font-bold text-white">
                    ₹{entry.stipendAmount.toLocaleString("en-IN")}
                  </td>
                  <td className="px-4 py-3.5 text-zinc-400">
                    ₹{entry.travelAmount.toLocaleString("en-IN")}
                  </td>
                  <td className="px-4 py-3.5 font-bold text-emerald-400">
                    ₹{entry.totalAmount.toLocaleString("en-IN")}
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        entry.status === "PAID"
                          ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                          : entry.status === "APPROVED"
                          ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                          : "bg-zinc-500/15 text-zinc-400 border border-zinc-500/30"
                      }`}
                    >
                      {entry.status === "PAID" && <CheckCircle2 className="h-3 w-3" />}
                      {entry.status === "APPROVED" && <Clock className="h-3 w-3" />}
                      <span>{entry.status}</span>
                    </span>
                    {entry.utrNumber && (
                      <div className="text-[10px] text-zinc-500 mt-0.5">{entry.utrNumber}</div>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <button
                      type="button"
                      onClick={() => alert(`Official Payment Voucher #${entry.id}\nPayee: Official Referee\nAmount: ₹${entry.totalAmount}\nStatus: ${entry.status}`)}
                      className="text-[11px] font-bold text-gym-primary hover:text-orange-400 hover:underline inline-flex items-center gap-1"
                    >
                      <span>Voucher</span>
                      <ArrowUpRight className="h-3 w-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Performance Compliance Benchmarks */}
      <div className="rounded-xl border border-white/10 bg-zinc-900/40 p-4">
        <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-3 flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span>Technical Official Performance &amp; Compliance Audit Metrics</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div className="p-3 rounded-lg bg-black/40 border border-white/5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">On-Time Report Compliance</span>
            <div className="font-heading text-xl font-bold text-emerald-400 mt-0.5">98.4%</div>
            <p className="text-[10px] text-zinc-400">Reports submitted within 2 hours</p>
          </div>
          <div className="p-3 rounded-lg bg-black/40 border border-white/5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Platform Attendance Rate</span>
            <div className="font-heading text-xl font-bold text-emerald-400 mt-0.5">100%</div>
            <p className="text-[10px] text-zinc-400">Zero missed or unnotified shifts</p>
          </div>
          <div className="p-3 rounded-lg bg-black/40 border border-white/5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Jury Overturn Disparity Rate</span>
            <div className="font-heading text-xl font-bold text-emerald-400 mt-0.5">0.9%</div>
            <p className="text-[10px] text-zinc-400">99.1% decisions upheld by Jury</p>
          </div>
        </div>
      </div>
    </div>
  );
}
