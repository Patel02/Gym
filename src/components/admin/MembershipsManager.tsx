"use client";

import { useState, useTransition } from "react";
import { 
  CreditCard, 
  Search, 
  Plus, 
  Trash2, 
  Edit3, 
  X, 
  Check, 
  AlertTriangle, 
  Calendar, 
  User, 
  DollarSign, 
  Clock, 
  RefreshCw,
  Copy,
  CheckCheck,
  ShieldCheck,
  Sparkles
} from "lucide-react";
import { MembershipPlan } from "@prisma/client";
import { 
  AdminMembershipDto, 
  createAdminMembershipAction, 
  updateAdminMembershipAction, 
  deleteAdminMembershipAction 
} from "@/actions/admin-memberships.actions";

export default function MembershipsManager({
  initialMemberships,
  athletesList
}: {
  initialMemberships: AdminMembershipDto[];
  athletesList: Array<{ id: string; name: string | null; email: string | null; role: string }>;
}) {
  const [memberships, setMemberships] = useState<AdminMembershipDto[]>(initialMemberships);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [planFilter, setPlanFilter] = useState<string>("ALL");

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMembership, setEditingMembership] = useState<AdminMembershipDto | null>(null);
  const [deletingMembership, setDeletingMembership] = useState<AdminMembershipDto | null>(null);

  // Form states
  const [formData, setFormData] = useState<{
    userId: string;
    planType: MembershipPlan;
    amountPaid: number;
    status: string;
    durationMonths: number;
    customCardNumber: string;
    startDate: string;
  }>({
    userId: athletesList[0]?.id || "",
    planType: "ANNUAL_ATHLETE",
    amountPaid: 2500,
    status: "ACTIVE",
    durationMonths: 12,
    customCardNumber: "",
    startDate: new Date().toISOString().split("T")[0],
  });

  const [editFormData, setEditFormData] = useState<{
    planType: MembershipPlan;
    amountPaid: number;
    status: string;
    endDate: string;
  }>({
    planType: "ANNUAL_ATHLETE",
    amountPaid: 2500,
    status: "ACTIVE",
    endDate: new Date().toISOString().split("T")[0],
  });

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Summary Metrics
  const totalActive = memberships.filter((m) => m.status === "ACTIVE").length;
  const totalExpired = memberships.filter((m) => m.status === "EXPIRED").length;
  const totalCancelled = memberships.filter((m) => m.status === "CANCELLED").length;
  const totalRevenue = memberships.reduce((acc, curr) => acc + (curr.amountPaid || 0), 0);

  // Filtered List
  const filteredMemberships = memberships.filter((m) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery = 
      !q || 
      m.cardNumber.toLowerCase().includes(q) ||
      (m.userName && m.userName.toLowerCase().includes(q)) ||
      (m.userEmail && m.userEmail.toLowerCase().includes(q));

    const matchesStatus = statusFilter === "ALL" || m.status === statusFilter;
    const matchesPlan = planFilter === "ALL" || m.planType === planFilter;

    return matchesQuery && matchesStatus && matchesPlan;
  });

  const copyCardNumber = (num: string) => {
    navigator.clipboard.writeText(num);
    setCopiedId(num);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const openAddModal = () => {
    setFormData({
      userId: athletesList[0]?.id || "",
      planType: "ANNUAL_ATHLETE",
      amountPaid: 2500,
      status: "ACTIVE",
      durationMonths: 12,
      customCardNumber: "",
      startDate: new Date().toISOString().split("T")[0],
    });
    setErrorMsg(null);
    setIsAddModalOpen(true);
  };

  const openEditModal = (m: AdminMembershipDto) => {
    setEditingMembership(m);
    setEditFormData({
      planType: m.planType,
      amountPaid: m.amountPaid,
      status: m.status,
      endDate: new Date(m.endDate).toISOString().split("T")[0],
    });
    setErrorMsg(null);
  };

  const handleCreateMembership = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    startTransition(async () => {
      const res = await createAdminMembershipAction(formData);
      if (res.success) {
        setSuccessMsg(res.message || "Membership pass issued.");
        setIsAddModalOpen(false);

        const targetAthlete = athletesList.find((a) => a.id === formData.userId);
        const startDateObj = new Date(formData.startDate);
        const endDateObj = new Date(startDateObj);
        endDateObj.setMonth(endDateObj.getMonth() + formData.durationMonths);

        setMemberships((prev) => [
          {
            id: `temp-${Date.now()}`,
            userId: formData.userId,
            userName: targetAthlete?.name || "Athlete",
            userEmail: targetAthlete?.email || "",
            userRole: targetAthlete?.role || "MEMBER",
            planType: formData.planType,
            amountPaid: Number(formData.amountPaid),
            status: formData.status,
            cardNumber: res.cardNumber || `FED-2026-${Date.now().toString().slice(-5)}`,
            startDate: startDateObj,
            endDate: endDateObj,
          },
          ...prev,
        ]);
        setTimeout(() => setSuccessMsg(null), 4000);
      } else {
        setErrorMsg(res.error || "Failed to create membership.");
      }
    });
  };

  const handleUpdateMembership = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMembership) return;
    setErrorMsg(null);

    startTransition(async () => {
      const res = await updateAdminMembershipAction({
        id: editingMembership.id,
        planType: editFormData.planType,
        amountPaid: Number(editFormData.amountPaid),
        status: editFormData.status,
        endDate: editFormData.endDate,
      });

      if (res.success) {
        setSuccessMsg(res.message || "Membership updated.");
        setMemberships((prev) =>
          prev.map((m) =>
            m.id === editingMembership.id
              ? {
                  ...m,
                  planType: editFormData.planType,
                  amountPaid: Number(editFormData.amountPaid),
                  status: editFormData.status,
                  endDate: new Date(editFormData.endDate),
                }
              : m
          )
        );
        setEditingMembership(null);
        setTimeout(() => setSuccessMsg(null), 4000);
      } else {
        setErrorMsg(res.error || "Failed to update membership.");
      }
    });
  };

  const handleDeleteMembership = () => {
    if (!deletingMembership) return;

    startTransition(async () => {
      const res = await deleteAdminMembershipAction(deletingMembership.id);
      if (res.success) {
        setSuccessMsg(res.message || "Membership pass revoked.");
        setMemberships((prev) => prev.filter((m) => m.id !== deletingMembership.id));
        setDeletingMembership(null);
        setTimeout(() => setSuccessMsg(null), 4000);
      } else {
        setErrorMsg(res.error || "Failed to revoke membership.");
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* ── Top Hero Card ── */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#1c0603] via-[#0e0302] to-[#070101] p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500/80 to-transparent" />
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-950/40 px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-400 mb-2 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
              <CreditCard className="h-3.5 w-3.5" />
              <span>Federation Pass Credentialing</span>
            </div>
            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-white">
              Active <span className="text-emerald-400">Memberships</span>
            </h1>
            <p className="text-sm text-gray-300 mt-1 max-w-2xl">
              Official membership accreditation: issue state & national cards, extend athletic license validities, and monitor affiliation statuses.
            </p>
          </div>

          <button
            onClick={openAddModal}
            className="group inline-flex items-center justify-center gap-2 self-start md:self-auto rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-[0_0_25px_rgba(16,185,129,0.4)] hover:shadow-[0_0_35px_rgba(16,185,129,0.7)] hover:scale-105 active:scale-95 transition-all duration-300"
          >
            <Plus className="h-4 w-4 transition-transform group-hover:rotate-90 duration-300" />
            <span>Issue New Membership</span>
          </button>
        </div>

        {/* Metric Pods */}
        <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-white/5 bg-white/5 p-3">
            <span className="text-[10px] font-bold uppercase text-gray-400 block">Active Passes</span>
            <span className="font-heading text-2xl font-bold text-emerald-400">{totalActive}</span>
          </div>
          <div className="rounded-2xl border border-white/5 bg-white/5 p-3">
            <span className="text-[10px] font-bold uppercase text-gray-400 block">Expired Passes</span>
            <span className="font-heading text-2xl font-bold text-amber-400">{totalExpired}</span>
          </div>
          <div className="rounded-2xl border border-white/5 bg-white/5 p-3">
            <span className="text-[10px] font-bold uppercase text-gray-400 block">Cancelled</span>
            <span className="font-heading text-2xl font-bold text-red-400">{totalCancelled}</span>
          </div>
          <div className="rounded-2xl border border-white/5 bg-white/5 p-3">
            <span className="text-[10px] font-bold uppercase text-gray-400 block">Total Revenue</span>
            <span className="font-heading text-2xl font-bold text-white">
              ₹ {totalRevenue.toLocaleString("en-IN")}
            </span>
          </div>
        </div>
      </div>

      {/* Global Alerts */}
      {successMsg && (
        <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/60 p-4 text-emerald-300 flex items-center gap-3 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
          <Check className="h-5 w-5 shrink-0 text-emerald-400" />
          <span className="text-xs font-bold">{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="rounded-2xl border border-red-500/40 bg-red-950/60 p-4 text-red-300 flex items-center gap-3 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
          <AlertTriangle className="h-5 w-5 shrink-0 text-red-400" />
          <span className="text-xs font-bold">{errorMsg}</span>
        </div>
      )}

      {/* ── Search & Filters ── */}
      <div className="rounded-2xl border border-white/10 bg-[#0d0201] p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-xl">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by card number (FED-2026-...), lifter name, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-gray-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-white/10 bg-[#160402] px-3 py-2.5 text-xs font-bold text-gray-300 focus:border-emerald-500 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active Passes</option>
            <option value="EXPIRED">Expired</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="rounded-xl border border-white/10 bg-[#160402] px-3 py-2.5 text-xs font-bold text-gray-300 focus:border-emerald-500 focus:outline-none"
          >
            <option value="ALL">All Plans</option>
            <option value="ANNUAL_ATHLETE">Annual Athlete</option>
            <option value="LIFETIME">Lifetime Pass</option>
            <option value="COACH_OFFICIAL">Coach / Official</option>
          </select>

          {(searchQuery || statusFilter !== "ALL" || planFilter !== "ALL") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("ALL");
                setPlanFilter("ALL");
              }}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-xs font-bold text-gray-400 hover:text-white transition-colors"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* ── Memberships Table ── */}
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#0d0201] shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="border-b border-white/10 bg-[#150402] text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              <tr>
                <th className="px-6 py-4">Card Identification</th>
                <th className="px-6 py-4">Athlete / Member</th>
                <th className="px-6 py-4">Accreditation Tier</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Fee Paid</th>
                <th className="px-6 py-4">Validity Horizon</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-gray-300">
              {filteredMemberships.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    <CreditCard className="mx-auto h-8 w-8 text-gray-600 mb-2 opacity-50" />
                    <p className="text-sm font-semibold">No membership passes match your filter criteria.</p>
                  </td>
                </tr>
              ) : (
                filteredMemberships.map((m) => {
                  const isExpired = new Date(m.endDate) < new Date();
                  return (
                    <tr key={m.id} className="hover:bg-white/[0.02] transition-colors group">
                      {/* Card Number */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold tracking-wider text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2.5 py-1 rounded-lg shadow-inner">
                            {m.cardNumber}
                          </span>
                          <button
                            onClick={() => copyCardNumber(m.cardNumber)}
                            className="p-1 text-gray-500 hover:text-white transition-colors"
                            title="Copy Card Number"
                          >
                            {copiedId === m.cardNumber ? (
                              <CheckCheck className="h-3.5 w-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Athlete */}
                      <td className="px-6 py-4">
                        <div className="font-bold text-white">{m.userName || "Lifter"}</div>
                        <div className="text-xs text-gray-400 font-mono mt-0.5">{m.userEmail}</div>
                      </td>

                      {/* Plan Type */}
                      <td className="px-6 py-4">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border border-white/10 bg-white/5 text-gray-200">
                          {m.planType.replace(/_/g, " ")}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${
                            m.status === "ACTIVE" && !isExpired
                              ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                              : m.status === "CANCELLED"
                              ? "bg-red-500/20 text-red-400 border-red-500/30"
                              : "bg-amber-500/20 text-amber-400 border-amber-500/30"
                          }`}
                        >
                          {m.status === "ACTIVE" && !isExpired && (
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                          )}
                          {isExpired && m.status === "ACTIVE" ? "EXPIRED" : m.status}
                        </span>
                      </td>

                      {/* Amount Paid */}
                      <td className="px-6 py-4 font-mono font-bold text-white">
                        ₹ {m.amountPaid.toLocaleString("en-IN")}
                      </td>

                      {/* Dates */}
                      <td className="px-6 py-4 text-xs font-mono text-gray-400">
                        <div>Exp: {new Date(m.endDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</div>
                        <div className="text-[10px] text-gray-500">
                          Since: {new Date(m.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(m)}
                            className="rounded-xl border border-white/10 bg-white/5 p-2 text-gray-300 hover:border-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10 hover:scale-105 active:scale-95 transition-all"
                            title="Edit Membership"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => setDeletingMembership(m)}
                            className="rounded-xl border border-white/10 bg-white/5 p-2 text-gray-300 hover:border-red-500 hover:text-red-400 hover:bg-red-500/10 hover:scale-105 active:scale-95 transition-all"
                            title="Revoke / Delete Pass"
                          >
                            <Trash2 className="h-4 w-4" />
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

      {/* ── MODAL: Issue Membership ── */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
          <div className="relative w-full max-w-lg rounded-3xl border border-white/15 bg-gradient-to-b from-[#1c0603] to-[#0a0201] p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                  <Plus className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-heading text-xl font-bold uppercase text-white">
                    Issue Membership Pass
                  </h3>
                  <p className="text-xs text-gray-400">Assign official credential to athlete</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-xl border border-white/10 p-2 text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateMembership} className="space-y-4">
              {/* Athlete Picker */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-300 mb-1">
                  Target Athlete
                </label>
                <select
                  required
                  value={formData.userId}
                  onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                  className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                >
                  {athletesList.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name || "Unnamed"} ({a.email}) — [{a.role}]
                    </option>
                  ))}
                </select>
              </div>

              {/* Plan Type */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-300 mb-1">
                  Accreditation Tier
                </label>
                <select
                  value={formData.planType}
                  onChange={(e) => {
                    const plan = e.target.value as MembershipPlan;
                    const fee = plan === "LIFETIME" ? 15000 : plan === "COACH_OFFICIAL" ? 3500 : 2500;
                    const months = plan === "LIFETIME" ? 120 : 12;
                    setFormData({ ...formData, planType: plan, amountPaid: fee, durationMonths: months });
                  }}
                  className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                >
                  <option value="ANNUAL_ATHLETE">Annual Athlete Pass (₹ 2,500 / 1 Year)</option>
                  <option value="COACH_OFFICIAL">Coach / Technical Official (₹ 3,500 / 1 Year)</option>
                  <option value="LIFETIME">Lifetime Federation Membership (₹ 15,000 / 10 Years)</option>
                </select>
              </div>

              {/* Row: Amount Paid & Duration */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-300 mb-1">
                    Amount Paid (₹)
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.amountPaid}
                    onChange={(e) => setFormData({ ...formData, amountPaid: Number(e.target.value) })}
                    className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-300 mb-1">
                    Duration (Months)
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formData.durationMonths}
                    onChange={(e) => setFormData({ ...formData, durationMonths: Number(e.target.value) })}
                    className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* Custom Card Number (Optional) */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-300 mb-1">
                  Card Number <span className="text-gray-500">(Leave empty to auto-generate FED-2026-...)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. FED-2026-GOLD9"
                  value={formData.customCardNumber}
                  onChange={(e) => setFormData({ ...formData, customCardNumber: e.target.value })}
                  className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none font-mono"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10 mt-6">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-xl border border-white/10 px-4 py-2.5 text-xs font-bold uppercase text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-black shadow-lg transition-all disabled:opacity-50"
                >
                  {isPending && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                  <span>Issue Pass</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: Edit Membership ── */}
      {editingMembership && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
          <div className="relative w-full max-w-lg rounded-3xl border border-white/15 bg-gradient-to-b from-[#1c0603] to-[#0a0201] p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                  <Edit3 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-heading text-xl font-bold uppercase text-white">
                    Edit Membership
                  </h3>
                  <p className="text-xs text-gray-400">Pass: {editingMembership.cardNumber}</p>
                </div>
              </div>
              <button
                onClick={() => setEditingMembership(null)}
                className="rounded-xl border border-white/10 p-2 text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateMembership} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-300 mb-1">
                  Accreditation Tier
                </label>
                <select
                  value={editFormData.planType}
                  onChange={(e) => setEditFormData({ ...editFormData, planType: e.target.value as MembershipPlan })}
                  className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                >
                  <option value="ANNUAL_ATHLETE">Annual Athlete</option>
                  <option value="COACH_OFFICIAL">Coach / Official</option>
                  <option value="LIFETIME">Lifetime Pass</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-300 mb-1">
                    Status
                  </label>
                  <select
                    value={editFormData.status}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                    className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="EXPIRED">EXPIRED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-300 mb-1">
                    Fee (₹)
                  </label>
                  <input
                    type="number"
                    value={editFormData.amountPaid}
                    onChange={(e) => setEditFormData({ ...editFormData, amountPaid: Number(e.target.value) })}
                    className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-300 mb-1">
                  Expiration Date
                </label>
                <input
                  type="date"
                  required
                  value={editFormData.endDate}
                  onChange={(e) => setEditFormData({ ...editFormData, endDate: e.target.value })}
                  className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10 mt-6">
                <button
                  type="button"
                  onClick={() => setEditingMembership(null)}
                  className="rounded-xl border border-white/10 px-4 py-2.5 text-xs font-bold uppercase text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-black shadow-lg transition-all disabled:opacity-50"
                >
                  {isPending && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: Revoke / Delete ── */}
      {deletingMembership && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn">
          <div className="relative w-full max-w-md rounded-3xl border border-red-500/40 bg-gradient-to-b from-[#220603] to-[#0c0201] p-6 sm:p-8 shadow-[0_0_50px_rgba(239,68,68,0.3)]">
            <div className="flex items-center gap-3 text-red-400 mb-4">
              <div className="p-3 rounded-2xl bg-red-500/20 border border-red-500/30">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-heading text-xl font-bold uppercase text-white">
                  Revoke Membership Pass
                </h3>
                <p className="text-xs text-red-300">Permanent pass cancellation</p>
              </div>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed">
              Are you sure you want to permanently revoke and delete card{" "}
              <strong className="text-white font-mono">{deletingMembership.cardNumber}</strong> belonging to{" "}
              <strong className="text-white">{deletingMembership.userName || deletingMembership.userEmail}</strong>?
            </p>

            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setDeletingMembership(null)}
                className="rounded-xl border border-white/10 px-4 py-2.5 text-xs font-bold uppercase text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={handleDeleteMembership}
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 hover:bg-red-500 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-[0_0_20px_rgba(239,68,68,0.5)] transition-all disabled:opacity-50"
              >
                {isPending && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                <span>Confirm Revocation</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
