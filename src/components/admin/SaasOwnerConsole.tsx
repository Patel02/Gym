"use client";

import React, { useState, useTransition } from "react";
import {
  Crown,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Zap,
  ArrowRight,
  TrendingUp,
  DollarSign,
  Users,
  Calendar,
  Lock,
  Unlock,
  PlusCircle,
  RefreshCw,
  Search,
  Filter,
  Copy,
  ExternalLink,
  MessageSquare,
  Sparkles,
  Award,
} from "lucide-react";
import {
  PlanType,
  superAdminApproveReactivationAction,
  superAdminRejectReactivationAction,
  superAdminGrantExtraCreditsAction,
  superAdminSimulateExpiryAction,
} from "@/actions/subscription.actions";
import WhatsAppIcon from "@/components/ui/WhatsAppIcon";

interface TenantSubscription {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  organizationName: string;
  planType: PlanType;
  status: "ACTIVE" | "EXPIRED" | "PENDING_APPROVAL" | "SUSPENDED";
  startDate: string;
  endDate: string;
  daysRemaining: number;
  monthlyEventQuota: number;
  extraEventCredits: number;
  totalAllowedEvents: number;
  usedEventsThisMonth: number;
  pricePaid: number;
  contactPhone?: string | null;
  paymentUtr?: string | null;
  reactivationRequestedAt?: string | null;
  reactivationNotes?: string | null;
  reactivationPlanType?: PlanType | null;
  approvedBy?: string | null;
  approvedAt?: string | null;
}

interface SaasOwnerConsoleProps {
  initialData: {
    subscriptions: TenantSubscription[];
    kpi: {
      totalTenants: number;
      activeTenants: number;
      expiredTenants: number;
      pendingApprovals: number;
      monthlyRecurringRevenue: number;
      totalEventsThisMonth: number;
    };
  };
}

export default function SaasOwnerConsole({ initialData }: SaasOwnerConsoleProps) {
  const [subscriptions, setSubscriptions] = useState<TenantSubscription[]>(initialData.subscriptions);
  const [kpi, setKpi] = useState(initialData.kpi);

  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Approval Modal State
  const [approvalModalSub, setApprovalModalSub] = useState<TenantSubscription | null>(null);
  const [approvedPlan, setApprovedPlan] = useState<PlanType>("MONTHLY");
  const [bonusCredits, setBonusCredits] = useState<number>(0);
  const [overrideDays, setOverrideDays] = useState<number>(30);

  // Extra Credits Modal State
  const [creditModalSub, setCreditModalSub] = useState<TenantSubscription | null>(null);
  const [creditsToAdd, setCreditsToAdd] = useState<number>(1);

  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Pending approval list
  const pendingRequests = subscriptions.filter((s) => s.status === "PENDING_APPROVAL");

  // Filtered subscriptions list
  const filteredSubscriptions = subscriptions.filter((s) => {
    const matchesFilter = filterStatus === "ALL" || s.status === filterStatus;
    const matchesSearch =
      s.organizationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.paymentUtr && s.paymentUtr.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  // Handle Approve Request
  const handleApproveReactivation = (sub: TenantSubscription) => {
    startTransition(async () => {
      setMessage(null);
      const res = await superAdminApproveReactivationAction({
        subscriptionId: sub.id,
        approvedPlan: approvedPlan,
        bonusEventCredits: bonusCredits,
        overrideDays: overrideDays,
      });

      if (res.success) {
        setMessage({ text: res.message || "Subscription approved successfully!", type: "success" });
        setApprovalModalSub(null);

        // Update local state
        setSubscriptions((prev) =>
          prev.map((item) =>
            item.id === sub.id
              ? {
                  ...item,
                  status: "ACTIVE",
                  planType: approvedPlan,
                  daysRemaining: overrideDays,
                  extraEventCredits: item.extraEventCredits + bonusCredits,
                  totalAllowedEvents: item.monthlyEventQuota + item.extraEventCredits + bonusCredits,
                  approvedAt: new Date().toISOString(),
                }
              : item
          )
        );

        setKpi((prev) => ({
          ...prev,
          activeTenants: prev.activeTenants + 1,
          pendingApprovals: Math.max(0, prev.pendingApprovals - 1),
          expiredTenants: Math.max(0, prev.expiredTenants - 1),
        }));
      } else {
        setMessage({ text: res.error || "Approval failed.", type: "error" });
      }
    });
  };

  // Handle Reject Request
  const handleRejectReactivation = (sub: TenantSubscription) => {
    startTransition(async () => {
      setMessage(null);
      const res = await superAdminRejectReactivationAction({
        subscriptionId: sub.id,
        reason: "Payment UTR could not be verified in bank records.",
      });

      if (res.success) {
        setMessage({ text: "Request marked as rejected.", type: "success" });
        setSubscriptions((prev) =>
          prev.map((item) =>
            item.id === sub.id
              ? {
                  ...item,
                  status: "EXPIRED",
                }
              : item
          )
        );
        setKpi((prev) => ({
          ...prev,
          pendingApprovals: Math.max(0, prev.pendingApprovals - 1),
          expiredTenants: prev.expiredTenants + 1,
        }));
      } else {
        setMessage({ text: res.error || "Rejection failed.", type: "error" });
      }
    });
  };

  // Handle Grant Extra Event Credits
  const handleGrantExtraCredits = (sub: TenantSubscription) => {
    startTransition(async () => {
      setMessage(null);
      const res = await superAdminGrantExtraCreditsAction({
        subscriptionId: sub.id,
        creditsToAdd: creditsToAdd,
      });

      if (res.success) {
        setMessage({ text: res.message || "Extra credits granted!", type: "success" });
        setCreditModalSub(null);

        setSubscriptions((prev) =>
          prev.map((item) =>
            item.id === sub.id
              ? {
                  ...item,
                  extraEventCredits: item.extraEventCredits + creditsToAdd,
                  totalAllowedEvents: item.monthlyEventQuota + item.extraEventCredits + creditsToAdd,
                }
              : item
          )
        );
      } else {
        setMessage({ text: res.error || "Credit grant failed.", type: "error" });
      }
    });
  };

  // Handle Simulate Expiry (Testing Toggle)
  const handleSimulateExpiry = (sub: TenantSubscription, makeExpired: boolean) => {
    startTransition(async () => {
      setMessage(null);
      const res = await superAdminSimulateExpiryAction({
        subscriptionId: sub.id,
        makeExpired,
      });

      if (res.success) {
        setMessage({ text: res.message || "Simulation applied!", type: "success" });
        setSubscriptions((prev) =>
          prev.map((item) =>
            item.id === sub.id
              ? {
                  ...item,
                  status: makeExpired ? "EXPIRED" : "ACTIVE",
                  daysRemaining: makeExpired ? 0 : 30,
                }
              : item
          )
        );

        setKpi((prev) => ({
          ...prev,
          activeTenants: makeExpired ? Math.max(0, prev.activeTenants - 1) : prev.activeTenants + 1,
          expiredTenants: makeExpired ? prev.expiredTenants + 1 : Math.max(0, prev.expiredTenants - 1),
        }));
      } else {
        setMessage({ text: res.error || "Simulation failed.", type: "error" });
      }
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setMessage({ text: `Copied "${text}" to clipboard!`, type: "success" });
  };

  return (
    <div className="space-y-8">
      {/* ── Status Feedback Banner ── */}
      {message && (
        <div
          className={`flex items-start gap-3 rounded-2xl p-4 border text-sm font-medium ${
            message.type === "success"
              ? "border-emerald-500/40 bg-emerald-950/40 text-emerald-300"
              : "border-red-500/40 bg-red-950/40 text-red-300"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
          )}
          <div>{message.text}</div>
        </div>
      )}

      {/* ── Master SaaS KPIs (4-Metric Grid) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* KPI 1: Active Tenants */}
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#1c0804]/90 via-[#0e0302]/95 to-black p-6 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Active Tenants</span>
            <Users className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-bold text-white font-mono">{kpi.activeTenants}</div>
          <div className="text-xs text-gray-400 mt-1">
            Total registered clients: <strong className="text-white">{kpi.totalTenants}</strong>
          </div>
        </div>

        {/* KPI 2: MRR */}
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#1c0804]/90 via-[#0e0302]/95 to-black p-6 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Monthly Recurring (MRR)</span>
            <TrendingUp className="h-4 w-4 text-gym-primary" />
          </div>
          <div className="text-3xl font-bold text-white font-mono">
            ₹{kpi.monthlyRecurringRevenue.toLocaleString()}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            Avg revenue per client: <strong className="text-gym-primary">₹2,999/mo</strong>
          </div>
        </div>

        {/* KPI 3: Pending Approvals (Pulsing) */}
        <div className="relative overflow-hidden rounded-3xl border border-amber-500/40 bg-gradient-to-br from-[#241302]/90 via-[#100600]/95 to-black p-6 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-300">Pending Approvals</span>
            <Clock className="h-4 w-4 text-amber-400 animate-pulse" />
          </div>
          <div className="text-3xl font-bold text-amber-400 font-mono flex items-center gap-3">
            <span>{kpi.pendingApprovals}</span>
            {kpi.pendingApprovals > 0 && (
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-amber-500" />
              </span>
            )}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {kpi.pendingApprovals > 0 ? "Requires owner manual verification" : "All requests approved"}
          </div>
        </div>

        {/* KPI 4: Monthly Meets Quota Across Tenants */}
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#1c0804]/90 via-[#0e0302]/95 to-black p-6 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Meets Hosted This Month</span>
            <Calendar className="h-4 w-4 text-gym-primary" />
          </div>
          <div className="text-3xl font-bold text-white font-mono">{kpi.totalEventsThisMonth}</div>
          <div className="text-xs text-gray-400 mt-1">
            Base cap: <strong className="text-white">4 meets/mo</strong> • Add-ons available
          </div>
        </div>
      </div>

      {/* ── Pending Reactivation Approvals Deck ── */}
      {pendingRequests.length > 0 && (
        <div className="rounded-3xl border-2 border-amber-500/60 bg-gradient-to-br from-[#1a0e03]/90 via-[#100701]/95 to-black p-6 sm:p-8 shadow-[0_0_50px_rgba(245,158,11,0.25)]">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-950/80 px-3 py-0.5 text-xs font-semibold uppercase tracking-wider text-amber-400 mb-2">
                <Clock className="h-3.5 w-3.5 animate-spin" />
                <span>Action Required: {pendingRequests.length} Pending Approval(s)</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-white">
                Reactivation Verification Desk
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                Admins who have made payment and requested reactivation. Verify their payment UTR in bank statement and click &quot;Approve &amp; Activate&quot;.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {pendingRequests.map((req) => (
              <div
                key={req.id}
                className="relative rounded-2xl border border-white/15 bg-black/60 p-5 shadow-lg flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-base font-bold text-white">{req.organizationName}</h3>
                      <div className="text-xs text-gray-400">
                        Admin: <span className="text-gray-200">{req.userName}</span> ({req.userEmail})
                      </div>
                    </div>
                    <span className="rounded-full border border-amber-500/40 bg-amber-950/50 px-2.5 py-0.5 text-[10px] font-bold text-amber-300 uppercase">
                      {req.reactivationPlanType || req.planType} Plan
                    </span>
                  </div>

                  {/* Payment Details */}
                  <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Payment Reference / UTR:</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-gym-primary">{req.paymentUtr || "N/A"}</span>
                        {req.paymentUtr && (
                          <button
                            type="button"
                            onClick={() => copyToClipboard(req.paymentUtr!)}
                            className="text-gray-400 hover:text-white"
                            title="Copy UTR"
                          >
                            <Copy className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Contact Phone:</span>
                      <span className="font-mono text-white">{req.contactPhone || "Not provided"}</span>
                    </div>
                    {req.reactivationNotes && (
                      <div className="pt-1 text-[11px] text-gray-300 italic">
                        &quot;{req.reactivationNotes}&quot;
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-5 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
                  {req.contactPhone ? (
                    <a
                      href={`https://wa.me/${req.contactPhone.replace(/[^0-9]/g, "")}?text=Hello%20${encodeURIComponent(req.userName)},%20I%20have%20verified%20your%20payment%20UTR%20${encodeURIComponent(req.paymentUtr || "")}.%20Your%20subscription%20is%20now%20being%20activated.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-medium"
                    >
                      <WhatsAppIcon className="h-3.5 w-3.5 fill-emerald-400" />
                      <span>WhatsApp Admin</span>
                    </a>
                  ) : (
                    <span />
                  )}

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleRejectReactivation(req)}
                      className="rounded-xl border border-red-500/40 bg-red-950/30 px-3 py-1.5 text-xs font-bold text-red-400 hover:bg-red-900/40 transition-colors"
                    >
                      Reject
                    </button>
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => {
                        setApprovalModalSub(req);
                        setApprovedPlan(req.reactivationPlanType || "MONTHLY");
                        setOverrideDays(
                          req.reactivationPlanType === "YEARLY"
                            ? 365
                            : req.reactivationPlanType === "SIX_MONTH"
                            ? 180
                            : 30
                        );
                      }}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white shadow-md hover:scale-105 transition-all"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Approve &amp; Activate</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Client Tenants Roster & Management Console ── */}
      <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-[#140402]/90 to-black/90 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-white">
              Federation Tenants &amp; Subscriptions Roster
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Real-time oversight of all gym, federation, and meet director subscriptions, monthly event usage, and validity.
            </p>
          </div>

          {/* Filter Pills & Search */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="h-3.5 w-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search org, name, UTR..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="rounded-xl border border-white/15 bg-black/60 pl-8 pr-3 py-1.5 text-xs text-white placeholder-gray-500 focus:border-gym-primary focus:outline-none"
              />
            </div>

            <div className="flex rounded-xl border border-white/15 bg-black/60 p-0.5 text-xs">
              {(["ALL", "ACTIVE", "PENDING_APPROVAL", "EXPIRED"] as const).map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setFilterStatus(status)}
                  className={`px-3 py-1 rounded-lg font-bold text-[11px] uppercase transition-all ${
                    filterStatus === status
                      ? "bg-gym-primary text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  {status === "PENDING_APPROVAL" ? "Pending" : status}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table of Subscriptions */}
        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-black/40">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-white/10 bg-white/[0.02] text-[10px] uppercase font-bold tracking-widest text-gray-400">
              <tr>
                <th className="py-3.5 px-4">Organization &amp; Admin</th>
                <th className="py-3.5 px-4">Plan Tier</th>
                <th className="py-3.5 px-4">Monthly Events Quota</th>
                <th className="py-3.5 px-4">Validity / Expiry</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Super Admin Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-medium">
              {filteredSubscriptions.map((sub) => {
                const isExp = sub.status === "EXPIRED";
                const isPend = sub.status === "PENDING_APPROVAL";

                return (
                  <tr key={sub.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-4">
                      <div className="font-bold text-white text-sm">{sub.organizationName}</div>
                      <div className="text-[11px] text-gray-400">
                        {sub.userName} • <span className="font-mono">{sub.userEmail}</span>
                      </div>
                      {sub.contactPhone && (
                        <div className="text-[10px] text-gray-500 font-mono mt-0.5">{sub.contactPhone}</div>
                      )}
                    </td>

                    <td className="py-4 px-4">
                      <span className="font-bold text-white uppercase">{sub.planType}</span>
                      <div className="text-[11px] text-gray-400 font-mono">₹{sub.pricePaid.toLocaleString()}</div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold font-mono text-white text-sm">
                          {sub.usedEventsThisMonth}
                        </span>
                        <span className="text-gray-400">/ {sub.totalAllowedEvents} meets</span>
                      </div>
                      <div className="text-[10px] text-gray-400 mt-0.5">
                        Base: 4 meets
                        {sub.extraEventCredits > 0 && (
                          <span className="text-emerald-400 ml-1">+{sub.extraEventCredits} extra credits</span>
                        )}
                      </div>
                    </td>

                    <td className="py-4 px-4 font-mono">
                      <div className={isExp ? "text-red-400 font-bold" : "text-white"}>
                        {new Date(sub.endDate).toLocaleDateString()}
                      </div>
                      <div className="text-[10px] text-gray-400">
                        {isExp ? "Expired" : `${sub.daysRemaining} days left`}
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${
                          isExp
                            ? "border-red-500/50 bg-red-950/60 text-red-400"
                            : isPend
                            ? "border-amber-500/50 bg-amber-950/60 text-amber-400"
                            : "border-emerald-500/50 bg-emerald-950/60 text-emerald-400"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            isExp ? "bg-red-400" : isPend ? "bg-amber-400 animate-ping" : "bg-emerald-400"
                          }`}
                        />
                        <span>{sub.status}</span>
                      </span>
                    </td>

                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Add Extra Credits Button */}
                        <button
                          type="button"
                          onClick={() => {
                            setCreditModalSub(sub);
                            setCreditsToAdd(1);
                          }}
                          className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 px-2.5 py-1 text-[11px] font-bold text-gym-primary transition-colors"
                          title="Grant Extra Event Credits beyond 4/month"
                        >
                          <PlusCircle className="h-3 w-3" />
                          <span>+Credits</span>
                        </button>

                        {/* Extend / Reactivate */}
                        <button
                          type="button"
                          onClick={() => {
                            setApprovalModalSub(sub);
                            setApprovedPlan(sub.planType);
                            setOverrideDays(30);
                          }}
                          className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 px-2.5 py-1 text-[11px] font-bold text-white transition-colors"
                          title="Extend Validity / Approve"
                        >
                          <Calendar className="h-3 w-3" />
                          <span>Extend</span>
                        </button>

                        {/* Test Simulate Expiry / Lockout */}
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => handleSimulateExpiry(sub, !isExp)}
                          className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] font-bold transition-colors ${
                            isExp
                              ? "border-emerald-500/40 bg-emerald-950/30 text-emerald-400 hover:bg-emerald-900/40"
                              : "border-red-500/40 bg-red-950/30 text-red-400 hover:bg-red-900/40"
                          }`}
                          title="Test account lockout state"
                        >
                          {isExp ? <Unlock className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                          <span>{isExp ? "Test Unlock" : "Test Lockout"}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredSubscriptions.length === 0 && (
            <div className="py-12 text-center text-xs text-gray-500">
              No subscriptions found matching the selected filter.
            </div>
          )}
        </div>
      </div>

      {/* ── Commercial SaaS Selling Reference Deck (For User) ── */}
      <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#1a0804]/60 via-black to-black p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="rounded-2xl border border-gym-primary/30 bg-gym-primary/10 p-2.5">
            <Award className="h-6 w-6 text-gym-primary" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white uppercase tracking-tight">
              B2B Commercial SaaS Business Rules
            </h3>
            <p className="text-xs text-gray-400">
              Pre-configured commercial rules for selling this platform to state federations and gym owners.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-gray-300">
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
            <div className="font-bold text-white text-sm mb-1">1. Monthly Quota Rule</div>
            <p className="text-gray-400">
              Every plan includes a strict limit of <strong>4 meets/month</strong>. If an admin schedules 5 or more events in a calendar month, the system enforces Extra Event Add-on credits (₹999/meet).
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
            <div className="font-bold text-white text-sm mb-1">2. Hard Lockout on Expiry</div>
            <p className="text-gray-400">
              The moment `endDate` passes, the admin dashboard locks administrative actions with a full paywall. They cannot self-reactivate without your personal approval.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
            <div className="font-bold text-white text-sm mb-1">3. Manual Owner Approval</div>
            <p className="text-gray-400">
              Clients submit their Payment UTR on the subscription page. You receive it here in the Approval Desk, verify payment in your bank/UPI app, and hit &quot;Approve &amp; Activate&quot; to restore access!
            </p>
          </div>
        </div>
      </div>

      {/* ── Modal: Approve / Extend Subscription ── */}
      {approvalModalSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="relative w-full max-w-lg rounded-3xl border border-white/20 bg-gradient-to-b from-[#1c0804] to-black p-6 sm:p-8 shadow-2xl">
            <h3 className="text-xl font-bold uppercase text-white tracking-tight">
              Approve &amp; Grant Access
            </h3>
            <p className="mt-1 text-xs text-gray-300">
              Organization: <strong className="text-white">{approvalModalSub.organizationName}</strong> ({approvalModalSub.userEmail})
            </p>

            {approvalModalSub.paymentUtr && (
              <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-950/30 p-3 text-xs flex items-center justify-between">
                <span className="text-gray-400">Submitted UTR:</span>
                <span className="font-mono font-bold text-amber-300">{approvalModalSub.paymentUtr}</span>
              </div>
            )}

            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                  Subscription Duration &amp; Plan
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { plan: "MONTHLY", label: "1 Month (30d)", days: 30 },
                    { plan: "SIX_MONTH", label: "6 Months (180d)", days: 180 },
                    { plan: "YEARLY", label: "1 Year (365d)", days: 365 },
                  ].map((p) => (
                    <button
                      key={p.plan}
                      type="button"
                      onClick={() => {
                        setApprovedPlan(p.plan as PlanType);
                        setOverrideDays(p.days);
                      }}
                      className={`rounded-2xl p-2.5 text-center border text-xs font-bold transition-all ${
                        approvedPlan === p.plan
                          ? "border-emerald-500 bg-emerald-950/40 text-emerald-300"
                          : "border-white/10 bg-black/40 text-gray-400 hover:text-white"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
                  Custom Validity (Days from today)
                </label>
                <input
                  type="number"
                  value={overrideDays}
                  onChange={(e) => setOverrideDays(parseInt(e.target.value) || 30)}
                  className="w-full rounded-2xl border border-white/15 bg-black/60 px-4 py-2.5 text-sm text-white focus:border-gym-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
                  Bonus Extra Event Credits (Optional)
                </label>
                <input
                  type="number"
                  min="0"
                  value={bonusCredits}
                  onChange={(e) => setBonusCredits(parseInt(e.target.value) || 0)}
                  placeholder="0"
                  className="w-full rounded-2xl border border-white/15 bg-black/60 px-4 py-2.5 text-sm text-white focus:border-gym-primary focus:outline-none"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setApprovalModalSub(null)}
                  className="rounded-xl border border-white/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => handleApproveReactivation(approvalModalSub)}
                  className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-lg hover:scale-105 transition-all disabled:opacity-50"
                >
                  {isPending ? "Activating..." : "Confirm & Grant Access"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Grant Extra Event Credits ── */}
      {creditModalSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="relative w-full max-w-md rounded-3xl border border-white/20 bg-gradient-to-b from-[#1c0804] to-black p-6 sm:p-8 shadow-2xl">
            <h3 className="text-xl font-bold uppercase text-white tracking-tight">
              Grant Extra Event Slots
            </h3>
            <p className="mt-1 text-xs text-gray-300">
              Add event capacity for <strong className="text-white">{creditModalSub.organizationName}</strong> beyond their monthly 4-event limit.
            </p>

            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                  Select Slots to Add
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 3, 5].map((cnt) => (
                    <button
                      key={cnt}
                      type="button"
                      onClick={() => setCreditsToAdd(cnt)}
                      className={`rounded-xl p-2.5 text-center border text-xs font-bold transition-all ${
                        creditsToAdd === cnt
                          ? "border-gym-primary bg-gym-primary/30 text-white"
                          : "border-white/10 bg-black/40 text-gray-400 hover:text-white"
                      }`}
                    >
                      +{cnt} Meet{cnt > 1 ? "s" : ""}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setCreditModalSub(null)}
                  className="rounded-xl border border-white/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => handleGrantExtraCredits(creditModalSub)}
                  className="rounded-xl bg-gym-primary px-6 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-orange-600 disabled:opacity-50"
                >
                  {isPending ? "Adding..." : `Grant +${creditsToAdd} Slots`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
