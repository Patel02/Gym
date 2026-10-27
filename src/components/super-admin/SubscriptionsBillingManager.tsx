"use client";

import React, { useState, useTransition } from "react";
import {
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  Calendar,
  Layers,
  ArrowUpRight,
  TrendingUp,
  RefreshCw,
  Search,
  Check,
  X,
  Plus,
  ShieldCheck,
  Building2,
  Lock,
  Unlock,
  Coins,
  FileCheck,
} from "lucide-react";
import {
  assignPlanToAdminAction,
  superAdminApprovePaymentUtrAction,
  superAdminRejectPaymentUtrAction,
  superAdminExtendThirtyDaysAction,
} from "@/actions/super-admin.actions";

interface SubscriptionsBillingManagerProps {
  initialSubscriptions: any[];
  adminsWithoutSub: any[];
  initialMetrics: {
    totalMRR: number;
    activeSubsCount: number;
    expiredSubsCount: number;
    pendingUtrCount: number;
    totalTenants: number;
  };
  showToast: (type: "success" | "error", text: string) => void;
}

export default function SubscriptionsBillingManager({
  initialSubscriptions,
  adminsWithoutSub,
  initialMetrics,
  showToast,
}: SubscriptionsBillingManagerProps) {
  const [subscriptions, setSubscriptions] = useState(initialSubscriptions);
  const [unsubscribedAdmins, setUnsubscribedAdmins] = useState(adminsWithoutSub);
  const [metrics, setMetrics] = useState(initialMetrics);
  const [searchQuery, setSearchQuery] = useState("");
  const [planFilter, setPlanFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [isPending, startTransition] = useTransition();

  // Modals state
  const [assignModalAdmin, setAssignModalAdmin] = useState<any | null>(null);
  const [rejectUtrSub, setRejectUtrSub] = useState<any | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const filteredSubscriptions = subscriptions.filter((sub) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      (sub.organizationName || "").toLowerCase().includes(q) ||
      (sub.user?.name || "").toLowerCase().includes(q) ||
      (sub.user?.email || "").toLowerCase().includes(q) ||
      (sub.paymentUtr || "").toLowerCase().includes(q);

    const matchesPlan = planFilter === "ALL" || sub.planType === planFilter;
    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "ACTIVE" && sub.effectiveStatus === "ACTIVE") ||
      (statusFilter === "PENDING_APPROVAL" && sub.effectiveStatus === "PENDING_APPROVAL") ||
      (statusFilter === "EXPIRED" && sub.effectiveStatus === "EXPIRED");

    return matchesSearch && matchesPlan && matchesStatus;
  });

  const pendingUtrs = subscriptions.filter(
    (s) => s.effectiveStatus === "PENDING_APPROVAL" || s.paymentUtr
  );

  // Handle Approve UTR
  const handleApproveUtr = (sub: any) => {
    startTransition(async () => {
      const res = await superAdminApprovePaymentUtrAction({
        subscriptionId: sub.id,
        approvedPlan: sub.reactivationPlanType || sub.planType,
      });

      if (res.success) {
        setSubscriptions((prev) =>
          prev.map((item) =>
            item.id === sub.id
              ? {
                  ...item,
                  status: "ACTIVE",
                  effectiveStatus: "ACTIVE",
                  paymentUtr: null,
                  reactivationNotes: null,
                }
              : item
          )
        );
        setMetrics((prev) => ({
          ...prev,
          activeSubsCount: prev.activeSubsCount + 1,
          pendingUtrCount: Math.max(0, prev.pendingUtrCount - 1),
        }));
        showToast("success", res.message || "Payment UTR approved!");
      } else {
        showToast("error", res.error || "Approval failed.");
      }
    });
  };

  // Handle Reject UTR
  const handleRejectUtr = () => {
    if (!rejectUtrSub) return;
    startTransition(async () => {
      const res = await superAdminRejectPaymentUtrAction(
        rejectUtrSub.id,
        rejectReason || "Invalid payment details"
      );

      if (res.success) {
        setSubscriptions((prev) =>
          prev.map((item) =>
            item.id === rejectUtrSub.id
              ? {
                  ...item,
                  status: "EXPIRED",
                  effectiveStatus: "EXPIRED",
                  paymentUtr: null,
                }
              : item
          )
        );
        setMetrics((prev) => ({
          ...prev,
          pendingUtrCount: Math.max(0, prev.pendingUtrCount - 1),
          expiredSubsCount: prev.expiredSubsCount + 1,
        }));
        setRejectUtrSub(null);
        setRejectReason("");
        showToast("success", "UTR rejected.");
      } else {
        showToast("error", res.error || "Rejection failed.");
      }
    });
  };

  // Handle Extend 30 Days
  const handleExtendThirtyDays = (sub: any) => {
    startTransition(async () => {
      const res = await superAdminExtendThirtyDaysAction(sub.id);
      if (res.success) {
        setSubscriptions((prev) =>
          prev.map((item) =>
            item.id === sub.id
              ? {
                  ...item,
                  status: "ACTIVE",
                  effectiveStatus: "ACTIVE",
                  daysRemaining: (item.daysRemaining || 0) + 30,
                }
              : item
          )
        );
        showToast("success", res.message || "Extended 30 days.");
      } else {
        showToast("error", res.error || "Failed to extend.");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* SaaS Telemetry Header Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0f172a] border border-amber-500/30 rounded-2xl p-5 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              Monthly Recurring (MRR)
            </span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-black text-white mt-2">
            ₹{metrics.totalMRR.toLocaleString("en-IN")}
          </div>
          <p className="text-xs text-slate-400 mt-1">Platform monthly run rate</p>
        </div>

        <div className="bg-[#0e1422] border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              Active Paid Tenants
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-emerald-400 mt-2">
            {metrics.activeSubsCount}
          </div>
          <p className="text-xs text-slate-400 mt-1">Out of {metrics.totalTenants} total tenants</p>
        </div>

        <div className="bg-[#0e1422] border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              Pending UTR Approvals
            </span>
            <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
          </div>
          <div className="text-3xl font-black text-amber-400 mt-2">
            {metrics.pendingUtrCount}
          </div>
          <p className="text-xs text-slate-400 mt-1">Awaiting your approval</p>
        </div>

        <div className="bg-[#0e1422] border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-red-400 uppercase tracking-wider">
              Expired / Suspended
            </span>
            <AlertTriangle className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-3xl font-black text-red-400 mt-2">
            {metrics.expiredSubsCount}
          </div>
          <p className="text-xs text-slate-400 mt-1">Restricted event publishing</p>
        </div>
      </div>

      {/* Pending UTR Queue (If any pending) */}
      {pendingUtrs.length > 0 && (
        <div className="bg-amber-950/30 border border-amber-500/40 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2.5 text-amber-400">
            <Coins className="w-5 h-5 animate-bounce" />
            <h3 className="font-bold text-white text-base">
              Pending Bank Transfer / UPI UTR Approvals ({pendingUtrs.length})
            </h3>
          </div>
          <p className="text-xs text-slate-300">
            These administrators have submitted payment reference UTR numbers for subscription renewal. Verify bank deposit and approve access:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingUtrs.map((sub) => (
              <div
                key={sub.id}
                className="bg-[#111827] border border-amber-500/30 rounded-xl p-4 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-white text-sm">
                      {sub.organizationName || "State Association"}
                    </h4>
                    <p className="text-xs text-slate-400">
                      {sub.user?.name} ({sub.user?.email})
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase">
                    {sub.reactivationPlanType || sub.planType} Plan
                  </span>
                </div>

                <div className="bg-black/40 border border-slate-800 rounded-lg p-2.5 font-mono text-xs text-amber-300 flex items-center justify-between">
                  <span>UTR: {sub.paymentUtr || "Manual Review Request"}</span>
                  <span className="text-[10px] text-slate-400">
                    Phone: {sub.contactPhone || "N/A"}
                  </span>
                </div>

                {sub.reactivationNotes && (
                  <p className="text-xs text-slate-300 italic">
                    Note: &quot;{sub.reactivationNotes}&quot;
                  </p>
                )}

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                  <button
                    onClick={() => setRejectUtrSub(sub)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-950/60 hover:bg-red-900/60 text-red-300 border border-red-800/40 transition-colors"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleApproveUtr(sub)}
                    disabled={isPending}
                    className="px-4 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 shadow-md shadow-emerald-950/40 transition-all hover:scale-105"
                  >
                    Approve Payment & Activate
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Unsubscribed Admins Alert & Provisioning */}
      {unsubscribedAdmins.length > 0 && (
        <div className="bg-[#0e1424] border border-indigo-500/30 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
              <Building2 className="w-4 h-4" />
              <span>{unsubscribedAdmins.length} Administrator(s) Without Subscription Plan</span>
            </div>
            <p className="text-xs text-slate-400">
              Assign a plan (Free, Monthly, Yearly, or Enterprise) to grant official meet creation capacity.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {unsubscribedAdmins.slice(0, 3).map((admin) => (
              <button
                key={admin.id}
                onClick={() => setAssignModalAdmin(admin)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 transition-colors"
              >
                + Plan for {admin.name || admin.email}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-[#0c121d] border border-slate-800/80 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search tenant by association name, email, or UTR..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#131b2c] border border-slate-700/60 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-amber-500/60 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="bg-[#131b2c] border border-slate-700/60 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500/60"
          >
            <option value="ALL">All Plans</option>
            <option value="FREE">Free</option>
            <option value="MONTHLY">Monthly (₹2,999)</option>
            <option value="SIX_MONTH">6-Month (₹14,999)</option>
            <option value="YEARLY">Yearly (₹26,999)</option>
            <option value="ENTERPRISE">Enterprise (₹49,999)</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#131b2c] border border-slate-700/60 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500/60"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active Only</option>
            <option value="PENDING_APPROVAL">Pending UTR</option>
            <option value="EXPIRED">Expired Only</option>
          </select>
        </div>
      </div>

      {/* Subscriptions Matrix Table */}
      <div className="bg-[#0b101b] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-[#0e1424] text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-4 px-5">Federation / Association</th>
                <th className="py-4 px-5">Tenant Administrator</th>
                <th className="py-4 px-5">SaaS Plan</th>
                <th className="py-4 px-5">Status</th>
                <th className="py-4 px-5">Quota & Extra</th>
                <th className="py-4 px-5">Validity / Expiry</th>
                <th className="py-4 px-5 text-right">Master Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-sm">
              {filteredSubscriptions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <CreditCard className="w-10 h-10 mx-auto text-slate-600 mb-2" />
                    <p className="font-medium">No subscriptions found matching query.</p>
                  </td>
                </tr>
              ) : (
                filteredSubscriptions.map((sub) => {
                  const isActive = sub.effectiveStatus === "ACTIVE";
                  const isPendingStatus = sub.effectiveStatus === "PENDING_APPROVAL";
                  const isExpired = sub.effectiveStatus === "EXPIRED";

                  return (
                    <tr
                      key={sub.id}
                      className="hover:bg-slate-800/30 transition-colors"
                    >
                      {/* Organization Name & White-label Badge */}
                      <td className="py-4 px-5">
                        <div className="font-bold text-white">
                          {sub.organizationName || "State Association"}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {sub.user?.branding ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400">
                              <Sparkles className="w-3 h-3" />
                              Custom Brand Active
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-500">
                              Standard Gujarat Theme
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Admin Info */}
                      <td className="py-4 px-5">
                        <div className="font-medium text-slate-200">
                          {sub.user?.name || "Admin"}
                        </div>
                        <div className="text-xs text-slate-400">
                          {sub.user?.email}
                        </div>
                      </td>

                      {/* Plan Type */}
                      <td className="py-4 px-5">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider ${
                            sub.planType === "ENTERPRISE"
                              ? "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                              : sub.planType === "YEARLY"
                              ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                              : sub.planType === "SIX_MONTH"
                              ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40"
                              : sub.planType === "MONTHLY"
                              ? "bg-blue-500/20 text-blue-300 border border-blue-500/40"
                              : "bg-slate-700 text-slate-300"
                          }`}
                        >
                          {sub.planType}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-5">
                        {isActive ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            Active
                          </span>
                        ) : isPendingStatus ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                            UTR Pending
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                            Expired
                          </span>
                        )}
                      </td>

                      {/* Quota */}
                      <td className="py-4 px-5">
                        <div className="font-mono text-xs text-white">
                          {sub.monthlyEventQuota} meets/mo
                        </div>
                        {sub.extraEventCredits > 0 && (
                          <div className="text-[10px] text-amber-400 font-semibold">
                            +{sub.extraEventCredits} extra credits
                          </div>
                        )}
                      </td>

                      {/* Expiry */}
                      <td className="py-4 px-5 whitespace-nowrap">
                        <div className="text-xs text-slate-300">
                          {new Date(sub.endDate).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </div>
                        <div
                          className={`text-[11px] font-semibold mt-0.5 ${
                            sub.daysRemaining > 15
                              ? "text-emerald-400"
                              : sub.daysRemaining > 0
                              ? "text-amber-400"
                              : "text-red-400"
                          }`}
                        >
                          {sub.daysRemaining > 0
                            ? `${sub.daysRemaining} days remaining`
                            : "Expired"}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          {isPendingStatus && (
                            <button
                              onClick={() => handleApproveUtr(sub)}
                              title="Approve UTR & Activate"
                              className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 transition-colors"
                            >
                              Approve UTR
                            </button>
                          )}

                          <button
                            onClick={() => handleExtendThirtyDays(sub)}
                            title="Extend 30 Days Free"
                            disabled={isPending}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-amber-500/10 transition-colors"
                          >
                            <Calendar className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() =>
                              setAssignModalAdmin({
                                id: sub.userId,
                                name: sub.user?.name,
                                email: sub.user?.email,
                                subscription: sub,
                              })
                            }
                            title="Upgrade / Change Plan"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-300 hover:bg-indigo-500/10 transition-colors"
                          >
                            <CreditCard className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: ASSIGN / UPGRADE PLAN */}
      {assignModalAdmin && (
        <AssignPlanModal
          admin={assignModalAdmin}
          onClose={() => setAssignModalAdmin(null)}
          onSuccess={(newSub) => {
            setSubscriptions((prev) => {
              const exists = prev.some((s) => s.id === newSub.id);
              if (exists) {
                return prev.map((s) => (s.id === newSub.id ? newSub : s));
              }
              return [newSub, ...prev];
            });
            setUnsubscribedAdmins((prev) =>
              prev.filter((a) => a.id !== assignModalAdmin.id)
            );
            setAssignModalAdmin(null);
            showToast("success", "Subscription plan assigned successfully!");
          }}
          showToast={showToast}
        />
      )}

      {/* MODAL: REJECT UTR */}
      {rejectUtrSub && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border border-red-500/40 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2.5 text-red-400">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="font-bold text-white text-lg">Reject Payment UTR</h3>
            </div>

            <p className="text-xs text-slate-300">
              Rejecting UTR for{" "}
              <strong className="text-white">
                {rejectUtrSub.organizationName}
              </strong>{" "}
              (UTR: {rejectUtrSub.paymentUtr}). Please provide a rejection reason:
            </p>

            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. UTR not matching bank statement, incorrect deposit amount..."
              className="w-full bg-[#1e293b] border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-red-500"
            />

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setRejectUtrSub(null)}
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRejectUtr}
                disabled={isPending}
                className="px-5 py-2 rounded-xl text-sm font-bold bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-950/40"
              >
                {isPending ? "Rejecting..." : "Confirm Rejection"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// SUBCOMPONENT: ASSIGN / UPGRADE PLAN MODAL
function AssignPlanModal({
  admin,
  onClose,
  onSuccess,
  showToast,
}: {
  admin: any;
  onClose: () => void;
  onSuccess: (sub: any) => void;
  showToast: (type: "success" | "error", text: string) => void;
}) {
  const currentSub = admin.subscription;
  const [orgName, setOrgName] = useState(
    currentSub?.organizationName || "State Powerlifting Association"
  );
  const [planType, setPlanType] = useState<
    "FREE" | "MONTHLY" | "SIX_MONTH" | "YEARLY" | "ENTERPRISE"
  >(currentSub?.planType || "MONTHLY");
  const [durationDays, setDurationDays] = useState(30);
  const [extraCredits, setExtraCredits] = useState(0);
  const [isPending, startTransition] = useTransition();

  const handlePlanChange = (plan: any) => {
    setPlanType(plan);
    if (plan === "FREE") setDurationDays(365);
    else if (plan === "MONTHLY") setDurationDays(30);
    else if (plan === "SIX_MONTH") setDurationDays(180);
    else if (plan === "YEARLY") setDurationDays(365);
    else if (plan === "ENTERPRISE") setDurationDays(365);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await assignPlanToAdminAction({
        userId: admin.id,
        organizationName: orgName,
        planType,
        durationDays,
        extraCredits,
      });

      if (res.success) {
        onSuccess({
          id: currentSub?.id || "sub-" + admin.id,
          userId: admin.id,
          organizationName: orgName,
          planType,
          status: "ACTIVE",
          effectiveStatus: "ACTIVE",
          daysRemaining: durationDays,
          monthlyEventQuota:
            planType === "ENTERPRISE" ? 20 : planType === "YEARLY" ? 8 : 4,
          extraEventCredits: extraCredits,
          endDate: new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000),
          user: { name: admin.name, email: admin.email },
        });
      } else {
        showToast("error", res.error || "Failed to assign plan.");
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0f172a] border border-amber-500/30 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2 text-amber-400">
            <CreditCard className="w-5 h-5" />
            <h3 className="font-bold text-white text-lg">Assign / Upgrade SaaS Plan</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-300">
          Admin: <strong className="text-white">{admin.name}</strong> (
          <span className="text-amber-300">{admin.email}</span>)
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Federation / Association Name
            </label>
            <input
              type="text"
              required
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              className="w-full bg-[#1e293b] border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Subscription Plan Tier
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: "FREE", name: "Free Tier", price: "₹0 / Free" },
                { id: "MONTHLY", name: "Monthly", price: "₹2,999 / mo" },
                { id: "SIX_MONTH", name: "6-Month", price: "₹14,999" },
                { id: "YEARLY", name: "Yearly Pro", price: "₹26,999 / yr" },
                { id: "ENTERPRISE", name: "Enterprise", price: "₹49,999 / yr" },
              ].map((p) => (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => handlePlanChange(p.id)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    planType === p.id
                      ? "bg-amber-500/15 border-amber-500 text-white shadow-md shadow-amber-950/40"
                      : "bg-[#162032] border-slate-700/60 text-slate-400 hover:text-white"
                  }`}
                >
                  <div className="font-bold text-xs">{p.name}</div>
                  <div className="text-[10px] text-amber-400 mt-0.5">{p.price}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Validity (Days)
              </label>
              <input
                type="number"
                min={1}
                value={durationDays}
                onChange={(e) => setDurationDays(parseInt(e.target.value) || 30)}
                className="w-full bg-[#1e293b] border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Bonus Meet Credits
              </label>
              <input
                type="number"
                min={0}
                value={extraCredits}
                onChange={(e) => setExtraCredits(parseInt(e.target.value) || 0)}
                className="w-full bg-[#1e293b] border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-6 py-2 rounded-xl text-sm font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-950/40"
            >
              {isPending ? "Saving..." : "Apply & Activate Plan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
