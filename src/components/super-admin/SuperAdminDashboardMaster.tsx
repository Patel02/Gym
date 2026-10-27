"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import {
  Crown,
  Shield,
  ShieldCheck,
  ShieldAlert,
  UserPlus,
  Users,
  KeyRound,
  Trash2,
  Edit3,
  RefreshCw,
  Search,
  Check,
  Copy,
  AlertTriangle,
  Activity,
  FileText,
  ExternalLink,
  Lock,
  Unlock,
  CheckCircle2,
  XCircle,
  Settings,
  X,
  UserX,
  UserCheck,
  Eye,
  EyeOff,
  Sparkles,
  Layers,
  Award,
  Calendar,
  Flame,
  CreditCard,
  MessageSquare,
  Phone,
} from "lucide-react";
import SubscriptionsBillingManager from "./SubscriptionsBillingManager";
import TenantBrandingsManager from "./TenantBrandingsManager";
import WhatsappSaaSManager from "./WhatsappSaaSManager";
import { PageNavigation } from "@/components/ui/PageNavigation";
import {
  createAdminAction,
  updateAdminPermissionsAction,
  toggleAdminStatusAction,
  resetAdminPasswordAction,
  deleteAdminAction,
  updateSuperAdminOwnCredentialsAction,
  PermissionType,
} from "@/actions/super-admin.actions";

interface SuperAdminDashboardMasterProps {
  initialData: {
    currentSuperAdmin: {
      id: string;
      name: string | null;
      email: string | null;
      phone?: string | null;
      role: string;
      isActive: boolean;
    };
    stats: {
      totalAdmins: number;
      activeAdmins: number;
      suspendedAdmins: number;
      totalReferees: number;
      totalMembers: number;
      totalMeets: number;
    };
    admins: Array<{
      id: string;
      name: string | null;
      email: string | null;
      phone?: string | null;
      role: string;
      permissions: string[];
      isActive: boolean;
      createdAt: Date | string;
      updatedAt: Date | string;
      _count: { auditLogs: number };
    }>;
    recentAuditLogs: Array<{
      id: string;
      adminId: string;
      action: string;
      entityType: string;
      entityId: string;
      details: string;
      timestamp: Date | string;
      admin: {
        name: string | null;
        email: string | null;
        role: string;
      } | null;
    }>;
    availablePermissions: readonly PermissionType[];
    subscriptionsData?: {
      subscriptions: any[];
      adminsWithoutSub: any[];
      metrics: {
        totalMRR: number;
        activeSubsCount: number;
        expiredSubsCount: number;
        pendingUtrCount: number;
        totalTenants: number;
      };
    };
    brandings?: any[];
  };
}

const PERMISSION_LABELS: Record<PermissionType, { title: string; desc: string }> = {
  MANAGE_MEETS: {
    title: "Manage Meets",
    desc: "Create, edit, schedule, and approve federation championships",
  },
  MANAGE_MEMBERS: {
    title: "Manage Members",
    desc: "Approve memberships, issue digital cards, manage athlete roster",
  },
  MANAGE_RECORDS: {
    title: "National Records",
    desc: "Ratify official Gujarat & National powerlifting records",
  },
  LIVE_SCORING: {
    title: "Live Scoring",
    desc: "Operate meet controller, jury desk, and flight board",
  },
  CMS_PUBLISH: {
    title: "CMS & Circulars",
    desc: "Publish federation circulars, announcements, and PDFs",
  },
};

export default function SuperAdminDashboardMaster({
  initialData,
}: SuperAdminDashboardMasterProps) {
  const [activeTab, setActiveTab] = useState<
    "admins" | "subscriptions" | "brandings" | "whatsapp" | "overview" | "audit" | "security"
  >("admins");

  const [adminsList, setAdminsList] = useState(initialData.admins);
  const [auditLogs, setAuditLogs] = useState(initialData.recentAuditLogs);
  const [stats, setStats] = useState(initialData.stats);
  const [superAdminProfile, setSuperAdminProfile] = useState(
    initialData.currentSuperAdmin
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const [isPending, startTransition] = useTransition();
  const [toastMessage, setToastMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<any | null>(null);
  const [passwordResetAdmin, setPasswordResetAdmin] = useState<any | null>(null);
  const [deletingAdmin, setDeletingAdmin] = useState<any | null>(null);

  const showToast = (type: "success" | "error", text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Filtered admins
  const filteredAdmins = adminsList.filter((adm) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      (adm.name?.toLowerCase() || "").includes(q) ||
      (adm.email?.toLowerCase() || "").includes(q);

    const matchesRole =
      roleFilter === "ALL" ||
      (roleFilter === "SUPER_ADMIN" && adm.role === "SUPER_ADMIN") ||
      (roleFilter === "ADMIN" && adm.role === "ADMIN") ||
      (roleFilter === "MEET_DIRECTOR" && adm.role === "MEET_DIRECTOR");

    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "ACTIVE" && adm.isActive) ||
      (statusFilter === "SUSPENDED" && !adm.isActive);

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Handle Toggle Status (Suspend / Reactivate)
  const handleToggleStatus = (admin: any) => {
    if (admin.role === "SUPER_ADMIN") {
      showToast("error", "The Master Super Admin account cannot be suspended.");
      return;
    }

    const nextStatus = !admin.isActive;
    startTransition(async () => {
      const res = await toggleAdminStatusAction(admin.id, nextStatus);
      if (res.success) {
        setAdminsList((prev) =>
          prev.map((a) => (a.id === admin.id ? { ...a, isActive: nextStatus } : a))
        );
        setStats((prev) => ({
          ...prev,
          activeAdmins: nextStatus
            ? prev.activeAdmins + 1
            : Math.max(0, prev.activeAdmins - 1),
          suspendedAdmins: nextStatus
            ? Math.max(0, prev.suspendedAdmins - 1)
            : prev.suspendedAdmins + 1,
        }));
        showToast(
          "success",
          `Admin '${admin.email}' is now ${nextStatus ? "ACTIVE" : "SUSPENDED"}.`
        );
      } else {
        showToast("error", res.error || "Failed to update admin status.");
      }
    });
  };

  // Handle Delete Admin
  const handleDeleteAdmin = (admin: any) => {
    if (admin.role === "SUPER_ADMIN") {
      showToast("error", "Security Violation: Master Super Admin cannot be deleted.");
      return;
    }

    startTransition(async () => {
      const res = await deleteAdminAction(admin.id);
      if (res.success) {
        setAdminsList((prev) => prev.filter((a) => a.id !== admin.id));
        setStats((prev) => ({
          ...prev,
          totalAdmins: Math.max(0, prev.totalAdmins - 1),
          activeAdmins: admin.isActive
            ? Math.max(0, prev.activeAdmins - 1)
            : prev.activeAdmins,
          suspendedAdmins: !admin.isActive
            ? Math.max(0, prev.suspendedAdmins - 1)
            : prev.suspendedAdmins,
        }));
        setDeletingAdmin(null);
        showToast("success", res.message || "Admin account removed.");
      } else {
        showToast("error", res.error || "Failed to delete admin.");
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div
            className={`flex items-center gap-3 px-5 py-3.5 rounded-xl border backdrop-blur-xl shadow-2xl ${
              toastMessage.type === "success"
                ? "bg-emerald-950/90 border-emerald-500/40 text-emerald-100 shadow-emerald-950/50"
                : "bg-red-950/90 border-red-500/40 text-red-100 shadow-red-950/50"
            }`}
          >
            {toastMessage.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
            )}
            <span className="text-sm font-medium">{toastMessage.text}</span>
            <button
              onClick={() => setToastMessage(null)}
              className="ml-2 text-white/50 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Top Banner / Masthead */}
      <header className="border-b border-amber-500/20 bg-gradient-to-r from-[#0d111a] via-[#101524] to-[#0d111a] relative overflow-hidden">
        {/* Ambient golden top glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-gradient-to-b from-amber-500/10 via-amber-500/5 to-transparent blur-2xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 sm:pt-36 lg:pt-40 pb-8 relative z-10">
          <PageNavigation
            backHref="/admin"
            backLabel="Back to Command Center"
            breadcrumbs={[
              { label: "Admin Hub", href: "/admin" },
              { label: "Super Admin Console" },
            ]}
            badge="Root Clearance"
            className="mb-5"
          />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-600 to-amber-900 p-0.5 shadow-[0_0_30px_rgba(245,158,11,0.3)]">
                <div className="w-full h-full bg-[#090d16] rounded-[14px] flex items-center justify-center">
                  <Crown className="w-7 h-7 text-amber-400 animate-pulse" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-amber-200 via-amber-400 to-amber-100 bg-clip-text text-transparent">
                    SUPER ADMIN CONSOLE
                  </h1>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/30">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Root Master
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    1 of 1 Strict Invariant
                  </span>
                </div>
                <p className="text-sm text-slate-400 mt-1">
                  Exclusive control center for{" "}
                  <span className="text-amber-300 font-medium">
                    {superAdminProfile.name || "Master Super Admin"}
                  </span>{" "}
                  ({superAdminProfile.email})
                </p>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-3 shrink-0 flex-wrap">
              <Link
                href="/admin"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700/60 transition-all hover:scale-105 shadow-sm"
              >
                <span>Federation Admin</span>
                <ExternalLink className="w-4 h-4 text-slate-400" />
              </Link>

              <Link
                href="/admin/referees"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-purple-950/60 hover:bg-purple-900/60 text-purple-200 border border-purple-500/40 transition-all hover:scale-105 shadow-sm"
              >
                <Shield className="w-4 h-4 text-purple-400" />
                <span>Referee Fleet</span>
              </Link>

              <Link
                href="/admin/athletes"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-200 border border-cyan-500/40 transition-all hover:scale-105 shadow-sm"
              >
                <Users className="w-4 h-4 text-cyan-400" />
                <span>Athlete Directory</span>
              </Link>

              <Link
                href="/admin/flights"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-indigo-950/60 hover:bg-indigo-900/60 text-indigo-200 border border-indigo-500/40 transition-all hover:scale-105 shadow-sm"
              >
                <Layers className="w-4 h-4 text-indigo-400" />
                <span>Flight Sorter</span>
              </Link>

              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:to-amber-600 text-slate-950 transition-all hover:scale-105 shadow-[0_0_20px_rgba(245,158,11,0.35)]"
              >
                <UserPlus className="w-4 h-4 stroke-[2.5]" />
                <span>Create Admin</span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-2 mt-8 border-b border-slate-800/80 overflow-x-auto pb-px">
            <button
              onClick={() => setActiveTab("admins")}
              className={`flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold rounded-t-xl transition-all border-b-2 whitespace-nowrap ${
                activeTab === "admins"
                  ? "border-amber-400 text-amber-300 bg-amber-500/10"
                  : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Admin Management</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {adminsList.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("subscriptions")}
              className={`flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold rounded-t-xl transition-all border-b-2 whitespace-nowrap ${
                activeTab === "subscriptions"
                  ? "border-amber-400 text-amber-300 bg-amber-500/10"
                  : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>SaaS Subscriptions & Billing</span>
              {initialData.subscriptionsData?.metrics?.pendingUtrCount &&
              initialData.subscriptionsData.metrics.pendingUtrCount > 0 ? (
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-slate-950 animate-pulse">
                  {initialData.subscriptionsData.metrics.pendingUtrCount} UTR
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-300">
                  {initialData.subscriptionsData?.subscriptions?.length || 0}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("brandings")}
              className={`flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold rounded-t-xl transition-all border-b-2 whitespace-nowrap ${
                activeTab === "brandings"
                  ? "border-amber-400 text-amber-300 bg-amber-500/10"
                  : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>White-Label Brandings</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-300">
                {initialData.brandings?.length || 0}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("whatsapp")}
              className={`flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold rounded-t-xl transition-all border-b-2 whitespace-nowrap ${
                activeTab === "whatsapp"
                  ? "border-emerald-400 text-emerald-300 bg-emerald-500/10"
                  : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
              }`}
            >
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              <span>WhatsApp & Call Room</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                SaaS Fleet
              </span>
            </button>

            <button
              onClick={() => setActiveTab("overview")}
              className={`flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold rounded-t-xl transition-all border-b-2 whitespace-nowrap ${
                activeTab === "overview"
                  ? "border-amber-400 text-amber-300 bg-amber-500/10"
                  : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>System Telemetry</span>
            </button>

            <button
              onClick={() => setActiveTab("audit")}
              className={`flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold rounded-t-xl transition-all border-b-2 whitespace-nowrap ${
                activeTab === "audit"
                  ? "border-amber-400 text-amber-300 bg-amber-500/10"
                  : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Security Audit Logs</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-300">
                {auditLogs.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("security")}
              className={`flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold rounded-t-xl transition-all border-b-2 whitespace-nowrap ${
                activeTab === "security"
                  ? "border-amber-400 text-amber-300 bg-amber-500/10"
                  : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
              }`}
            >
              <KeyRound className="w-4 h-4" />
              <span>Master ID & Password Setup</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ========================================================================= */}
        {/* TAB 1: ADMINS MANAGEMENT                                                  */}
        {/* ========================================================================= */}
        {activeTab === "admins" && (
          <div className="space-y-6">
            {/* Top Stat Banner for Admins */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-[#0e1422] border border-slate-800/80 rounded-2xl p-4 shadow-lg">
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Total Administrators
                </span>
                <div className="text-2xl sm:text-3xl font-black text-white mt-1">
                  {stats.totalAdmins}
                </div>
                <div className="text-xs text-amber-400 mt-1 flex items-center gap-1">
                  <Crown className="w-3 h-3" /> +1 Master Super Admin
                </div>
              </div>

              <div className="bg-[#0e1422] border border-slate-800/80 rounded-2xl p-4 shadow-lg">
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Active Admins
                </span>
                <div className="text-2xl sm:text-3xl font-black text-emerald-400 mt-1">
                  {stats.activeAdmins}
                </div>
                <div className="text-xs text-emerald-400/80 mt-1">
                  Operational clearance
                </div>
              </div>

              <div className="bg-[#0e1422] border border-slate-800/80 rounded-2xl p-4 shadow-lg">
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Suspended Admins
                </span>
                <div className="text-2xl sm:text-3xl font-black text-red-400 mt-1">
                  {stats.suspendedAdmins}
                </div>
                <div className="text-xs text-red-400/80 mt-1">
                  Access blocked at login
                </div>
              </div>

              <div className="bg-[#0e1422] border border-slate-800/80 rounded-2xl p-4 shadow-lg">
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Master Security Rule
                </span>
                <div className="text-base sm:text-lg font-bold text-amber-300 mt-1">
                  Strict 1-SuperAdmin
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  No other Super Admin permitted
                </div>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="bg-[#0c121d] border border-slate-800/80 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
              {/* Search input */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search admin by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#131b2c] border border-slate-700/60 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-amber-500/60 transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Filter chips */}
              <div className="flex items-center gap-2 flex-wrap">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="bg-[#131b2c] border border-slate-700/60 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500/60"
                >
                  <option value="ALL">All Roles</option>
                  <option value="SUPER_ADMIN">Super Admin</option>
                  <option value="ADMIN">Administrator</option>
                  <option value="MEET_DIRECTOR">Meet Director</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-[#131b2c] border border-slate-700/60 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500/60"
                >
                  <option value="ALL">All Status</option>
                  <option value="ACTIVE">Active Only</option>
                  <option value="SUSPENDED">Suspended Only</option>
                </select>
              </div>
            </div>

            {/* Admins Table / Roster */}
            <div className="bg-[#0b101b] border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 bg-[#0e1424] text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="py-4 px-5">Administrator</th>
                      <th className="py-4 px-5">Role & Clearance</th>
                      <th className="py-4 px-5">Status</th>
                      <th className="py-4 px-5">Granular Permissions</th>
                      <th className="py-4 px-5">Created</th>
                      <th className="py-4 px-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-sm">
                    {filteredAdmins.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-400">
                          <Users className="w-10 h-10 mx-auto text-slate-600 mb-2" />
                          <p className="font-medium">No administrators found matching criteria.</p>
                          <p className="text-xs text-slate-500 mt-1">
                            Click &quot;Create Admin&quot; to provision a new administrator account.
                          </p>
                        </td>
                      </tr>
                    ) : (
                      filteredAdmins.map((admin) => {
                        const isSuper = admin.role === "SUPER_ADMIN";
                        return (
                          <tr
                            key={admin.id}
                            className={`transition-colors ${
                              isSuper
                                ? "bg-amber-500/[0.04] hover:bg-amber-500/[0.07]"
                                : "hover:bg-slate-800/30"
                            }`}
                          >
                            {/* User details */}
                            <td className="py-4 px-5">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                                    isSuper
                                      ? "bg-gradient-to-br from-amber-400 to-amber-700 text-slate-950 shadow-[0_0_12px_rgba(245,158,11,0.4)]"
                                      : "bg-slate-800 text-slate-300 border border-slate-700"
                                  }`}
                                >
                                  {isSuper ? (
                                    <Crown className="w-5 h-5" />
                                  ) : (
                                    (admin.name?.[0] || admin.email?.[0] || "A").toUpperCase()
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <div className="font-semibold text-white truncate flex items-center gap-2">
                                    <span>{admin.name || "Unnamed Admin"}</span>
                                    {isSuper && (
                                      <span className="text-[10px] uppercase font-extrabold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                        YOU (ROOT)
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-xs text-slate-400 truncate">
                                    {admin.email}
                                  </div>
                                  {admin.phone ? (
                                    <a
                                      href={`https://wa.me/${admin.phone.replace(/[^0-9]/g, "")}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      onClick={(e) => e.stopPropagation()}
                                      className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400 hover:text-emerald-300 hover:underline mt-0.5"
                                      title="Open direct WhatsApp conversation"
                                    >
                                      <Phone className="w-3 h-3 text-emerald-400" />
                                      {admin.phone}
                                    </a>
                                  ) : (
                                    <div className="text-[10px] text-slate-500 italic mt-0.5">
                                      No WhatsApp assigned
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* Role */}
                            <td className="py-4 px-5">
                              {isSuper ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                                  <Crown className="w-3.5 h-3.5 text-amber-400" />
                                  SUPER_ADMIN
                                </span>
                              ) : admin.role === "MEET_DIRECTOR" ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                                  MEET_DIRECTOR
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                                  ADMINISTRATOR
                                </span>
                              )}
                            </td>

                            {/* Status */}
                            <td className="py-4 px-5">
                              {admin.isActive ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                  Active
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
                                  <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                                  Suspended
                                </span>
                              )}
                            </td>

                            {/* Permissions */}
                            <td className="py-4 px-5">
                              {isSuper ? (
                                <span className="text-xs font-semibold text-amber-300 flex items-center gap-1">
                                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                                  Full Root Powers (All Modules)
                                </span>
                              ) : admin.permissions.length === 0 ? (
                                <span className="text-xs text-slate-500 italic">
                                  No granular permissions assigned
                                </span>
                              ) : (
                                <div className="flex flex-wrap gap-1 max-w-xs">
                                  {admin.permissions.map((perm) => (
                                    <span
                                      key={perm}
                                      className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700/60"
                                    >
                                      {perm.replace("MANAGE_", "")}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </td>

                            {/* Created Date */}
                            <td className="py-4 px-5 text-xs text-slate-400 whitespace-nowrap">
                              {new Date(admin.createdAt).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </td>

                            {/* Actions */}
                            <td className="py-4 px-5 text-right whitespace-nowrap">
                              {isSuper ? (
                                <button
                                  onClick={() => setActiveTab("security")}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 transition-colors"
                                >
                                  <Settings className="w-3.5 h-3.5" />
                                  Edit My ID / Pass
                                </button>
                              ) : (
                                <div className="inline-flex items-center gap-1">
                                  {/* Edit permissions */}
                                  <button
                                    onClick={() => setEditingAdmin(admin)}
                                    title="Edit Permissions & Details"
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-amber-500/10 transition-colors"
                                  >
                                    <Edit3 className="w-4 h-4" />
                                  </button>

                                  {/* Reset Password */}
                                  <button
                                    onClick={() => setPasswordResetAdmin(admin)}
                                    title="Reset Password"
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-300 hover:bg-indigo-500/10 transition-colors"
                                  >
                                    <KeyRound className="w-4 h-4" />
                                  </button>

                                  {/* Suspend / Activate */}
                                  <button
                                    onClick={() => handleToggleStatus(admin)}
                                    title={admin.isActive ? "Suspend Admin" : "Reactivate Admin"}
                                    disabled={isPending}
                                    className={`p-1.5 rounded-lg transition-colors ${
                                      admin.isActive
                                        ? "text-slate-400 hover:text-amber-400 hover:bg-amber-500/10"
                                        : "text-red-400 hover:text-emerald-400 hover:bg-emerald-500/10"
                                    }`}
                                  >
                                    {admin.isActive ? (
                                      <Lock className="w-4 h-4" />
                                    ) : (
                                      <Unlock className="w-4 h-4" />
                                    )}
                                  </button>

                                  {/* Delete */}
                                  <button
                                    onClick={() => setDeletingAdmin(admin)}
                                    title="Delete Administrator"
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB: SAAS SUBSCRIPTIONS & BILLING MATRIX                                 */}
        {/* ========================================================================= */}
        {activeTab === "subscriptions" && initialData.subscriptionsData && (
          <SubscriptionsBillingManager
            initialSubscriptions={initialData.subscriptionsData.subscriptions}
            adminsWithoutSub={initialData.subscriptionsData.adminsWithoutSub}
            initialMetrics={initialData.subscriptionsData.metrics}
            showToast={showToast}
          />
        )}

        {/* ========================================================================= */}
        {/* TAB: WHITE-LABEL BRANDINGS                                                */}
        {/* ========================================================================= */}
        {activeTab === "brandings" && (
          <TenantBrandingsManager
            initialBrandings={initialData.brandings || []}
            showToast={showToast}
          />
        )}

        {/* ========================================================================= */}
        {/* TAB: WHATSAPP LIVE CALL ROOM & TWILIO FAIL-SAFE                          */}
        {/* ========================================================================= */}
        {activeTab === "whatsapp" && <WhatsappSaaSManager />}

        {/* ========================================================================= */}
        {/* TAB 2: SYSTEM TELEMETRY                                                   */}
        {/* ========================================================================= */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Master Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-gradient-to-br from-[#0f172a] to-[#090d16] border border-amber-500/30 rounded-2xl p-6 relative overflow-hidden shadow-xl">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Crown className="w-24 h-24 text-amber-400" />
                </div>
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  Super Admin Invariant
                </span>
                <div className="text-3xl font-black text-white mt-2">1 ONLY</div>
                <p className="text-xs text-slate-400 mt-2">
                  System strictly blocks creation of duplicate Super Admin accounts.
                </p>
              </div>

              <div className="bg-[#0e1422] border border-slate-800 rounded-2xl p-6 shadow-xl">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Total Admins Fleet
                </span>
                <div className="text-3xl font-black text-white mt-2">
                  {stats.totalAdmins}
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  {stats.activeAdmins} Active • {stats.suspendedAdmins} Suspended
                </p>
              </div>

              <div className="bg-[#0e1422] border border-slate-800 rounded-2xl p-6 shadow-xl">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Certified Referees
                </span>
                <div className="text-3xl font-black text-indigo-400 mt-2">
                  {stats.totalReferees}
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  Live scoring & judging console access
                </p>
              </div>

              <div className="bg-[#0e1422] border border-slate-800 rounded-2xl p-6 shadow-xl">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Registered Athletes
                </span>
                <div className="text-3xl font-black text-emerald-400 mt-2">
                  {stats.totalMembers}
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  Gujarat federation member database
                </p>
              </div>
            </div>

            {/* Architecture & Security Invariant Panel */}
            <div className="bg-[#0c121e] border border-slate-800/80 rounded-2xl p-6 sm:p-8 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-amber-400" />
                  Hierarchical Security & Access Architecture
                </h3>
                <p className="text-sm text-slate-400 mt-1">
                  How role-based access control (RBAC) and data isolation operate in this platform:
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[#111827] border border-amber-500/20 rounded-xl p-5">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                    <Crown className="w-4 h-4" /> Level 0: Super Admin (Root)
                  </div>
                  <ul className="text-xs text-slate-300 mt-3 space-y-2 list-disc list-inside">
                    <li>Exclusive access to <code>/super-admin</code></li>
                    <li>Can create, suspend, or delete any Admin</li>
                    <li>Can reset any Admin password</li>
                    <li>Protected against deletion & self-suspension</li>
                    <li>Full access to standard <code>/admin</code> operations</li>
                  </ul>
                </div>

                <div className="bg-[#111827] border border-indigo-500/20 rounded-xl p-5">
                  <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
                    <ShieldCheck className="w-4 h-4" /> Level 1: Administrators
                  </div>
                  <ul className="text-xs text-slate-300 mt-3 space-y-2 list-disc list-inside">
                    <li>Access to <code>/admin</code> federation suite</li>
                    <li>Bound by granular permissions</li>
                    <li>STRICTLY BLOCKED from <code>/super-admin</code></li>
                    <li>Cannot see or alter Super Admin credentials</li>
                    <li>Can be suspended instantly by Super Admin</li>
                  </ul>
                </div>

                <div className="bg-[#111827] border border-emerald-500/20 rounded-xl p-5">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                    <Award className="w-4 h-4" /> Level 2: Referees & Athletes
                  </div>
                  <ul className="text-xs text-slate-300 mt-3 space-y-2 list-disc list-inside">
                    <li>Referees: <code>/referee/dashboard</code> (White/Red lights)</li>
                    <li>Athletes: <code>/dashboard</code> (Cards, results, PRs)</li>
                    <li>Zero access to any administrative endpoints</li>
                    <li>Automatic redirection on unauthorized attempts</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: AUDIT LOGS                                                         */}
        {/* ========================================================================= */}
        {activeTab === "audit" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-amber-400" />
                  Administrative Audit Trail
                </h3>
                <p className="text-sm text-slate-400 mt-0.5">
                  Chronological log of administrative actions, account changes, and privilege modifications.
                </p>
              </div>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                Last {auditLogs.length} Records
              </span>
            </div>

            <div className="bg-[#0b101b] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              {auditLogs.length === 0 ? (
                <div className="py-16 text-center text-slate-400">
                  <FileText className="w-10 h-10 mx-auto text-slate-600 mb-2" />
                  <p className="font-medium">No audit events recorded yet.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-800/80">
                  {auditLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-4 sm:p-5 hover:bg-slate-800/20 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${
                              log.action.includes("CREATE")
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                : log.action.includes("DELETE")
                                ? "bg-red-500/20 text-red-300 border border-red-500/30"
                                : log.action.includes("SUSPEND")
                                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                : "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                            }`}
                          >
                            {log.action}
                          </span>
                          <span className="text-xs text-slate-400">
                            by{" "}
                            <strong className="text-slate-200">
                              {log.admin?.name || log.admin?.email || "Super Admin"}
                            </strong>
                          </span>
                        </div>
                        <p className="text-sm text-slate-300">{log.details}</p>
                      </div>

                      <div className="text-xs text-slate-500 whitespace-nowrap self-start sm:self-center">
                        {new Date(log.timestamp).toLocaleString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: SUPER ADMIN ID & PASSWORD SETUP                                     */}
        {/* ========================================================================= */}
        {activeTab === "security" && (
          <SuperAdminSecuritySettings
            currentSuperAdmin={superAdminProfile}
            onProfileUpdated={(updated) => {
              setSuperAdminProfile(updated);
              showToast("success", "Super Admin credentials updated successfully!");
            }}
            showToast={showToast}
          />
        )}
      </main>

      {/* ========================================================================= */}
      {/* MODAL: CREATE ADMIN                                                       */}
      {/* ========================================================================= */}
      {showCreateModal && (
        <CreateAdminModal
          availablePermissions={initialData.availablePermissions}
          onClose={() => setShowCreateModal(false)}
          onCreated={(newAdmin) => {
            setAdminsList((prev) => [newAdmin, ...prev]);
            setStats((prev) => ({
              ...prev,
              totalAdmins: prev.totalAdmins + 1,
              activeAdmins: prev.activeAdmins + 1,
            }));
            setShowCreateModal(false);
            showToast("success", `Admin '${newAdmin.email}' created successfully!`);
          }}
          showToast={showToast}
        />
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDIT ADMIN PERMISSIONS                                             */}
      {/* ========================================================================= */}
      {editingAdmin && (
        <EditAdminModal
          admin={editingAdmin}
          availablePermissions={initialData.availablePermissions}
          onClose={() => setEditingAdmin(null)}
          onUpdated={(updatedAdmin) => {
            setAdminsList((prev) =>
              prev.map((a) => (a.id === updatedAdmin.id ? { ...a, ...updatedAdmin } : a))
            );
            setEditingAdmin(null);
            showToast("success", "Admin permissions updated.");
          }}
          showToast={showToast}
        />
      )}

      {/* ========================================================================= */}
      {/* MODAL: RESET PASSWORD                                                     */}
      {/* ========================================================================= */}
      {passwordResetAdmin && (
        <ResetPasswordModal
          admin={passwordResetAdmin}
          onClose={() => setPasswordResetAdmin(null)}
          showToast={showToast}
        />
      )}

      {/* ========================================================================= */}
      {/* MODAL: DELETE CONFIRMATION                                                */}
      {/* ========================================================================= */}
      {deletingAdmin && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border border-red-500/40 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <div className="p-3 bg-red-500/10 rounded-xl">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-white text-lg">Delete Administrator?</h3>
                <p className="text-xs text-red-300">This action is irreversible.</p>
              </div>
            </div>

            <p className="text-sm text-slate-300">
              Are you sure you want to permanently delete administrator account{" "}
              <strong className="text-white">{deletingAdmin.name}</strong> (
              <span className="text-amber-300">{deletingAdmin.email}</span>)?
              They will lose access immediately.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setDeletingAdmin(null)}
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={() => handleDeleteAdmin(deletingAdmin)}
                className="px-5 py-2 rounded-xl text-sm font-bold bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-900/40"
              >
                {isPending ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// SUBCOMPONENT: CREATE ADMIN MODAL
// ============================================================================
function CreateAdminModal({
  availablePermissions,
  onClose,
  onCreated,
  showToast,
}: {
  availablePermissions: readonly PermissionType[];
  onClose: () => void;
  onCreated: (newAdmin: any) => void;
  showToast: (type: "success" | "error", text: string) => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"ADMIN" | "MEET_DIRECTOR">("ADMIN");
  const [selectedPermissions, setSelectedPermissions] = useState<PermissionType[]>([
    "MANAGE_MEETS",
    "MANAGE_MEMBERS",
    "LIVE_SCORING",
  ]);
  const [isPending, startTransition] = useTransition();

  const handleGeneratePassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%";
    let gen = "";
    for (let i = 0; i < 12; i++) {
      gen += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(gen);
  };

  const togglePermission = (perm: PermissionType) => {
    setSelectedPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      showToast("error", "Name, email, and password are required.");
      return;
    }

    startTransition(async () => {
      const res = await createAdminAction({
        name,
        email,
        phone: phone.trim() || undefined,
        password,
        role,
        permissions: selectedPermissions,
      });

      if (res.success && res.admin) {
        onCreated({
          ...res.admin,
          _count: { auditLogs: 0 },
        });
      } else {
        showToast("error", res.error || "Failed to create administrator.");
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#0f172a] border border-amber-500/30 rounded-2xl max-w-xl w-full p-6 shadow-2xl my-8">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2 text-amber-400">
            <UserPlus className="w-5 h-5" />
            <h3 className="font-bold text-white text-lg">Provision New Administrator</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Ramesh Shah"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#1e293b] border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Email Address *
              </label>
              <input
                type="email"
                required
                placeholder="admin@wpigujarat.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#1e293b] border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>WhatsApp / Mobile</span>
                <span className="text-[10px] text-amber-400 font-normal">Optional</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-[#1e293b] border border-slate-700 rounded-xl pl-9 pr-3.5 py-2 text-sm text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Administrative Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="w-full bg-[#1e293b] border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              >
                <option value="ADMIN">Administrator (Full Federation Operations)</option>
                <option value="MEET_DIRECTOR">Meet Director (Events & Scoring Lead)</option>
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Initial Password *
              </label>
              <button
                type="button"
                onClick={handleGeneratePassword}
                className="text-[11px] text-amber-400 hover:text-amber-300 underline font-semibold"
              >
                Generate Strong
              </button>
            </div>
            <input
              type="text"
              required
              placeholder="Minimum 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#1e293b] border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white font-mono focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Granular Permissions Checklist */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Granular Module Permissions
            </label>
            <div className="grid grid-cols-1 gap-2 bg-[#131d31] p-3 rounded-xl border border-slate-800">
              {availablePermissions.map((perm) => {
                const info = PERMISSION_LABELS[perm] || {
                  title: perm,
                  desc: perm,
                };
                const isChecked = selectedPermissions.includes(perm);
                return (
                  <label
                    key={perm}
                    onClick={() => togglePermission(perm)}
                    className={`flex items-start gap-3 p-2.5 rounded-lg cursor-pointer transition-colors ${
                      isChecked
                        ? "bg-amber-500/10 border border-amber-500/30"
                        : "hover:bg-slate-800/40 border border-transparent"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}}
                      className="mt-0.5 rounded text-amber-500 focus:ring-amber-500"
                    />
                    <div className="text-xs">
                      <div className="font-semibold text-white">{info.title}</div>
                      <div className="text-slate-400">{info.desc}</div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
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
              className="px-6 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-lg shadow-amber-950/40"
            >
              {isPending ? "Provisioning..." : "Create Account"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================================
// SUBCOMPONENT: EDIT ADMIN MODAL
// ============================================================================
function EditAdminModal({
  admin,
  availablePermissions,
  onClose,
  onUpdated,
  showToast,
}: {
  admin: any;
  availablePermissions: readonly PermissionType[];
  onClose: () => void;
  onUpdated: (updated: any) => void;
  showToast: (type: "success" | "error", text: string) => void;
}) {
  const [name, setName] = useState(admin.name || "");
  const [phone, setPhone] = useState(admin.phone || "");
  const [role, setRole] = useState(admin.role);
  const [selectedPermissions, setSelectedPermissions] = useState<PermissionType[]>(
    admin.permissions || []
  );
  const [isPending, startTransition] = useTransition();

  const togglePermission = (perm: PermissionType) => {
    setSelectedPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await updateAdminPermissionsAction({
        adminId: admin.id,
        name,
        phone,
        role,
        permissions: selectedPermissions,
      });

      if (res.success) {
        onUpdated({
          id: admin.id,
          name,
          phone,
          role,
          permissions: selectedPermissions,
        });
      } else {
        showToast("error", res.error || "Failed to update permissions.");
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0f172a] border border-amber-500/30 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2 text-amber-400">
            <Edit3 className="w-5 h-5" />
            <h3 className="font-bold text-white text-lg">Edit Administrator</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#1e293b] border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>WhatsApp / Contact Number</span>
              <span className="text-[10px] text-amber-400 font-normal">If SIM is closed, replace with new number</span>
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-[#1e293b] border border-slate-700 rounded-xl pl-10 pr-3.5 py-2 text-sm text-white font-mono focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-[#1e293b] border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
            >
              <option value="ADMIN">Administrator</option>
              <option value="MEET_DIRECTOR">Meet Director</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Assigned Permissions
            </label>
            <div className="space-y-1.5 bg-[#131d31] p-3 rounded-xl border border-slate-800 max-h-56 overflow-y-auto">
              {availablePermissions.map((perm) => {
                const info = PERMISSION_LABELS[perm] || { title: perm, desc: perm };
                const isChecked = selectedPermissions.includes(perm);
                return (
                  <label
                    key={perm}
                    onClick={() => togglePermission(perm)}
                    className={`flex items-start gap-2.5 p-2 rounded-lg cursor-pointer transition-colors ${
                      isChecked
                        ? "bg-amber-500/10 border border-amber-500/30"
                        : "hover:bg-slate-800/40 border border-transparent"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}}
                      className="mt-0.5 rounded text-amber-500 focus:ring-amber-500"
                    />
                    <div className="text-xs">
                      <div className="font-semibold text-white">{info.title}</div>
                      <div className="text-slate-400 text-[11px]">{info.desc}</div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
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
              {isPending ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================================
// SUBCOMPONENT: RESET PASSWORD MODAL
// ============================================================================
function ResetPasswordModal({
  admin,
  onClose,
  showToast,
}: {
  admin: any;
  onClose: () => void;
  showToast: (type: "success" | "error", text: string) => void;
}) {
  const [newPassword, setNewPassword] = useState("");
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleGenerate = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%";
    let gen = "";
    for (let i = 0; i < 12; i++) {
      gen += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(gen);
  };

  const handleCopy = () => {
    if (!newPassword) return;
    navigator.clipboard.writeText(newPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      showToast("error", "Password must be at least 6 characters.");
      return;
    }

    startTransition(async () => {
      const res = await resetAdminPasswordAction(admin.id, newPassword);
      if (res.success) {
        showToast("success", res.message || "Password reset successfully.");
        onClose();
      } else {
        showToast("error", res.error || "Failed to reset password.");
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0f172a] border border-amber-500/30 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2 text-amber-400">
            <KeyRound className="w-5 h-5" />
            <h3 className="font-bold text-white text-lg">Reset Admin Password</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-300">
          Set a new access password for{" "}
          <strong className="text-white">{admin.name}</strong> (
          <span className="text-amber-300">{admin.email}</span>).
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                New Password
              </label>
              <button
                type="button"
                onClick={handleGenerate}
                className="text-[11px] text-amber-400 hover:text-amber-300 underline font-semibold"
              >
                Generate Random
              </button>
            </div>
            <div className="relative">
              <input
                type="text"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter or generate new password"
                className="w-full bg-[#1e293b] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-amber-500 pr-10"
              />
              {newPassword && (
                <button
                  type="button"
                  onClick={handleCopy}
                  title="Copy password"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              )}
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
              className="px-5 py-2 rounded-xl text-sm font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-950/40"
            >
              {isPending ? "Resetting..." : "Save Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================================
// SUBCOMPONENT: SUPER ADMIN OWN SECURITY SETTINGS
// ============================================================================
function SuperAdminSecuritySettings({
  currentSuperAdmin,
  onProfileUpdated,
  showToast,
}: {
  currentSuperAdmin: any;
  onProfileUpdated: (updated: any) => void;
  showToast: (type: "success" | "error", text: string) => void;
}) {
  const [name, setName] = useState(currentSuperAdmin.name || "");
  const [email, setEmail] = useState(currentSuperAdmin.email || "");
  const [phone, setPhone] = useState(currentSuperAdmin.phone || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword && newPassword !== confirmPassword) {
      showToast("error", "New passwords do not match.");
      return;
    }

    if (newPassword && !currentPassword) {
      showToast("error", "Current password is required to change password.");
      return;
    }

    startTransition(async () => {
      const res = await updateSuperAdminOwnCredentialsAction({
        name,
        email,
        phone,
        currentPassword: currentPassword || undefined,
        newPassword: newPassword || undefined,
      });

      if (res.success) {
        onProfileUpdated({
          ...currentSuperAdmin,
          name,
          email,
          phone,
        });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        showToast("success", "Super Admin profile and phone number updated successfully!");
      } else {
        showToast("error", res.error || "Failed to update credentials.");
      }
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Credentials form */}
      <div className="lg:col-span-2 bg-[#0c121e] border border-amber-500/20 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Crown className="w-5 h-5 text-amber-400" />
            Root Master Credentials
          </h3>
          <p className="text-sm text-slate-400 mt-1">
            Change your personal Super Admin email address, phone/WhatsApp number, or password.
          </p>
        </div>

        <form onSubmit={handleUpdate} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Super Admin Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#131b2c] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Super Admin Login Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#131b2c] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>Super Admin WhatsApp / Contact Mobile</span>
              <span className="text-[10px] text-emerald-400 font-normal">Direct line for SaaS & Alert tests</span>
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-[#131b2c] border border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-amber-500"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              If your personal phone number or SIM is changed in the future, you can freely update it here.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-800/80 space-y-4">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              Change Master Password (Optional)
            </h4>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showCurrentPass ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Required if changing password"
                  className="w-full bg-[#131b2c] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPass(!showCurrentPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showCurrentPass ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPass ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full bg-[#131b2c] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showNewPass ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Confirm New Password
                </label>
                <input
                  type={showNewPass ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full bg-[#131b2c] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/80 flex justify-end">
            <button
              type="submit"
              disabled={isPending}
              className="px-6 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:to-amber-600 text-slate-950 transition-all hover:scale-105 shadow-lg shadow-amber-950/40"
            >
              {isPending ? "Updating Credentials..." : "Update Master Credentials"}
            </button>
          </div>
        </form>
      </div>

      {/* Side Guide / CLI Command Card */}
      <div className="space-y-6">
        <div className="bg-[#0f172a] border border-amber-500/20 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
            <KeyRound className="w-4 h-4" />
            CLI Emergency Access Utility
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            If you ever forget your password or want to provision/reassign the Super Admin
            from the terminal, you can run the built-in CLI command anytime:
          </p>

          <div className="bg-black/60 border border-slate-800 rounded-xl p-3 font-mono text-[11px] text-amber-300 overflow-x-auto select-all">
            node scripts/setup-super-admin.mjs &lt;email&gt; &lt;password&gt; &quot;[Name]&quot;
          </div>

          <p className="text-[11px] text-slate-400">
            This script automatically enforces the <strong>1-of-1 invariant</strong>: if an existing
            Super Admin exists, it seamlessly reassigns the master clearance to the new ID.
          </p>
        </div>

        <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3">
          <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" />
            Security Guarantees
          </div>
          <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside">
            <li>Passwords are hashed with 10 salt rounds of Bcrypt.</li>
            <li>No plain-text credentials stored anywhere.</li>
            <li>Direct URL tampering blocked by NextAuth middleware.</li>
            <li>Suspended admins cannot log in under any circumstances.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
