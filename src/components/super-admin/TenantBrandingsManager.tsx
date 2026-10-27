"use client";

import React, { useState, useTransition } from "react";
import Image from "next/image";
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Search,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  Award,
  CreditCard,
  Copy,
  Check,
  Eye,
  X,
  Building2,
  Calendar,
  Layers,
  Palette,
  Stamp,
  Users,
} from "lucide-react";
import { superAdminToggleBrandingApprovalAction } from "@/actions/branding.actions";

interface TenantBrandingsManagerProps {
  initialBrandings: any[];
  showToast: (type: "success" | "error", text: string) => void;
}

export default function TenantBrandingsManager({
  initialBrandings,
  showToast,
}: TenantBrandingsManagerProps) {
  const [brandings, setBrandings] = useState(initialBrandings || []);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [previewBranding, setPreviewBranding] = useState<any | null>(null);
  const [previewTab, setPreviewTab] = useState<"certificate" | "idcard">("certificate");
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  const [isPending, startTransition] = useTransition();

  const handleCopy = (text: string) => {
    if (typeof navigator !== "undefined") {
      navigator.clipboard.writeText(text);
      setCopiedHex(text);
      setTimeout(() => setCopiedHex(null), 2000);
    }
  };

  const handleToggleApproval = (brandingId: string, currentStatus: boolean, orgName: string) => {
    const nextStatus = !currentStatus;
    startTransition(async () => {
      const res = await superAdminToggleBrandingApprovalAction(brandingId, nextStatus);
      if (res.success) {
        showToast("success", res.message || "Branding status updated successfully.");
        setBrandings((prev) =>
          prev.map((b) => (b.id === brandingId ? { ...b, isApproved: nextStatus } : b))
        );
        if (previewBranding?.id === brandingId) {
          setPreviewBranding((prev: any) => (prev ? { ...prev, isApproved: nextStatus } : null));
        }
      } else {
        showToast("error", res.error || "Failed to update branding approval.");
      }
    });
  };

  const filteredBrandings = brandings.filter((b) => {
    const matchesSearch =
      b.organizationName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.user?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.slug?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL"
        ? true
        : statusFilter === "APPROVED"
        ? b.isApproved === true
        : b.isApproved === false;

    return matchesSearch && matchesStatus;
  });

  const totalBrandings = brandings.length;
  const approvedBrandings = brandings.filter((b) => b.isApproved).length;
  const suspendedBrandings = brandings.filter((b) => !b.isApproved).length;

  return (
    <div className="space-y-6">
      {/* ── METRICS SUMMARY CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-purple-950/20 via-zinc-900/60 to-black p-5 shadow-lg">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-purple-400">
            <span>White-Label Tenancies</span>
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="mt-3 font-heading text-3xl font-black text-white">
            {totalBrandings}
          </div>
          <p className="mt-1 text-xs text-zinc-400">
            Custom branded federation & gym tenants
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-emerald-950/20 via-zinc-900/60 to-black p-5 shadow-lg">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-emerald-400">
            <span>Approved & Active</span>
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <div className="mt-3 font-heading text-3xl font-black text-emerald-300">
            {approvedBrandings}
          </div>
          <p className="mt-1 text-xs text-zinc-400">
            Live on official certificates & credentials
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-amber-950/20 via-zinc-900/60 to-black p-5 shadow-lg">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-amber-400">
            <span>Pending / Suspended</span>
            <AlertTriangle className="h-4 w-4" />
          </div>
          <div className="mt-3 font-heading text-3xl font-black text-amber-300">
            {suspendedBrandings}
          </div>
          <p className="mt-1 text-xs text-zinc-400">
            Requires root Super-Admin sign-off
          </p>
        </div>
      </div>

      {/* ── SEARCH & FILTER CONTROLS ── */}
      <div className="rounded-2xl border border-white/10 bg-zinc-900/50 p-4 backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search tenant name, email, slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-black/60 pl-9 pr-4 py-2 text-sm text-white placeholder-zinc-500 focus:border-gym-primary focus:outline-none focus:ring-1 focus:ring-gym-primary transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center rounded-xl border border-white/10 bg-black/60 p-1">
            <button
              onClick={() => setStatusFilter("ALL")}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                statusFilter === "ALL"
                  ? "bg-gym-primary text-white shadow-xs"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              All ({totalBrandings})
            </button>
            <button
              onClick={() => setStatusFilter("APPROVED")}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                statusFilter === "APPROVED"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Approved ({approvedBrandings})
            </button>
            <button
              onClick={() => setStatusFilter("SUSPENDED")}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                statusFilter === "SUSPENDED"
                  ? "bg-amber-600 text-white shadow-xs"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Suspended ({suspendedBrandings})
            </button>
          </div>
        </div>
      </div>

      {/* ── BRANDINGS GRID ── */}
      {filteredBrandings.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-black/40 p-12 text-center">
          <Sparkles className="mx-auto h-12 w-12 text-zinc-600 mb-3" />
          <h3 className="text-base font-bold text-white uppercase tracking-wider">
            No White-Label Brandings Found
          </h3>
          <p className="mt-1 text-xs text-zinc-400 max-w-md mx-auto">
            {searchQuery
              ? `No brandings match the search filter "${searchQuery}".`
              : "No tenant administrators have configured custom white-label identities yet. The platform currently renders default Indian Powerlifting Federation / WPI Gujarat credentials."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredBrandings.map((branding) => {
            const primaryColor = branding.primaryColor || "#e6501b";
            const secondaryColor = branding.secondaryColor || "#0a0a0a";
            const isApproved = branding.isApproved;

            return (
              <div
                key={branding.id}
                className="rounded-2xl border border-white/10 bg-gradient-to-b from-zinc-900/80 via-black to-black p-5 shadow-xl transition-all hover:border-white/20 flex flex-col justify-between relative overflow-hidden"
              >
                {/* Accent glow corner */}
                <div
                  className="absolute -top-16 -right-16 h-32 w-32 rounded-full blur-[60px] opacity-25 pointer-events-none"
                  style={{ backgroundColor: primaryColor }}
                />

                <div>
                  {/* Card Header: Org Name, Status & Approval Pill */}
                  <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="relative h-12 w-12 rounded-xl overflow-hidden border bg-black shadow-md shrink-0 flex items-center justify-center"
                        style={{ borderColor: primaryColor }}
                      >
                        {branding.logoUrl ? (
                          <Image
                            src={branding.logoUrl}
                            alt={branding.organizationName}
                            fill
                            className="object-contain p-1"
                            unoptimized={
                              branding.logoUrl.startsWith("http") ||
                              branding.logoUrl.startsWith("data:")
                            }
                          />
                        ) : (
                          <div
                            className="font-heading text-lg font-black"
                            style={{ color: primaryColor }}
                          >
                            {branding.organizationName.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>

                      <div>
                        <h4 className="font-heading text-base font-bold text-white uppercase tracking-wide">
                          {branding.organizationName}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span
                            className="text-[10px] font-bold uppercase tracking-wider"
                            style={{ color: primaryColor }}
                          >
                            {branding.tagline || "Affiliated Member Body"}
                          </span>
                          {branding.slug && (
                            <span className="font-mono text-[9px] text-zinc-500 bg-white/5 px-1.5 py-0.5 rounded">
                              /{branding.slug}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <span
                      className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider shrink-0 flex items-center gap-1 ${
                        isApproved
                          ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                          : "border-amber-500/40 bg-amber-500/10 text-amber-400"
                      }`}
                    >
                      {isApproved ? (
                        <>
                          <ShieldCheck className="h-3 w-3" />
                          <span>Approved</span>
                        </>
                      ) : (
                        <>
                          <ShieldAlert className="h-3 w-3" />
                          <span>Suspended</span>
                        </>
                      )}
                    </span>
                  </div>

                  {/* Brand Palette & Config Details */}
                  <div className="grid grid-cols-2 gap-3 text-xs mb-4">
                    <div className="rounded-xl border border-white/5 bg-white/5 p-2.5">
                      <div className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest flex items-center justify-between mb-1.5">
                        <span>Brand Colors</span>
                        <Palette className="h-3 w-3" />
                      </div>
                      <div className="flex items-center gap-2">
                        <div
                          className="h-6 w-6 rounded-lg border border-white/20 shadow-xs cursor-pointer"
                          style={{ backgroundColor: primaryColor }}
                          onClick={() => handleCopy(primaryColor)}
                          title="Click to copy hex"
                        />
                        <div
                          className="h-6 w-6 rounded-lg border border-white/20 shadow-xs cursor-pointer"
                          style={{ backgroundColor: secondaryColor }}
                          onClick={() => handleCopy(secondaryColor)}
                          title="Click to copy hex"
                        />
                        <span className="font-mono text-[10px] text-zinc-300">
                          {primaryColor}
                        </span>
                        {copiedHex === primaryColor && (
                          <Check className="h-3 w-3 text-emerald-400" />
                        )}
                      </div>
                    </div>

                    <div className="rounded-xl border border-white/5 bg-white/5 p-2.5">
                      <div className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest flex items-center justify-between mb-1.5">
                        <span>Official Seal</span>
                        <Stamp className="h-3 w-3" />
                      </div>
                      <div className="font-bold text-zinc-200 truncate">
                        {branding.sealText || "OFFICIAL RATIFIED SEAL"}
                      </div>
                    </div>
                  </div>

                  {/* Officials & Tenant Admin */}
                  <div className="rounded-xl border border-white/5 bg-black/40 p-3 space-y-2 text-xs mb-4">
                    <div className="flex items-center justify-between text-zinc-400">
                      <span className="text-[10px] uppercase font-bold text-zinc-500">
                        President:
                      </span>
                      <span className="font-bold text-zinc-200">
                        {branding.presidentName || "President"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-zinc-400">
                      <span className="text-[10px] uppercase font-bold text-zinc-500">
                        General Secretary:
                      </span>
                      <span className="font-bold text-zinc-200">
                        {branding.secretaryName || "General Secretary"}
                      </span>
                    </div>
                    <div className="border-t border-white/5 pt-2 flex items-center justify-between text-zinc-400">
                      <span className="text-[10px] uppercase font-bold text-zinc-500">
                        Tenant Admin:
                      </span>
                      <span className="font-mono text-zinc-300 truncate max-w-[200px]">
                        {branding.user?.name || branding.user?.email || "Admin Account"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="border-t border-white/10 pt-3 flex items-center justify-between gap-2">
                  <button
                    onClick={() => {
                      setPreviewBranding(branding);
                      setPreviewTab("certificate");
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-zinc-300 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
                  >
                    <Eye className="h-3.5 w-3.5 text-gym-primary" />
                    <span>Live Preview</span>
                  </button>

                  <button
                    onClick={() =>
                      handleToggleApproval(
                        branding.id,
                        branding.isApproved,
                        branding.organizationName
                      )
                    }
                    disabled={isPending}
                    className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm ${
                      isApproved
                        ? "border border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20"
                        : "bg-emerald-600 text-white hover:bg-emerald-500 shadow-emerald-950"
                    }`}
                  >
                    {isApproved ? (
                      <>
                        <ShieldAlert className="h-3.5 w-3.5" />
                        <span>Suspend</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Approve Live</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── LIVE PREVIEW MODAL (CERTIFICATE / ID PASS) ── */}
      {previewBranding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl rounded-3xl border border-white/10 bg-gradient-to-b from-[#160602] via-[#0d0301] to-black p-6 shadow-2xl text-white max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl border bg-black shadow-md"
                  style={{ borderColor: previewBranding.primaryColor || "#e6501b" }}
                >
                  <Eye className="h-5 w-5 text-gym-primary" />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-bold uppercase text-white tracking-wide">
                    {previewBranding.organizationName}
                  </h3>
                  <p className="text-xs text-zinc-400">
                    White-Label Credential Simulator • Status:{" "}
                    <span
                      className={
                        previewBranding.isApproved
                          ? "text-emerald-400 font-bold"
                          : "text-amber-400 font-bold"
                      }
                    >
                      {previewBranding.isApproved ? "Approved Live" : "Suspended"}
                    </span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setPreviewBranding(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Preview Tabs */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <button
                onClick={() => setPreviewTab("certificate")}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                  previewTab === "certificate"
                    ? "bg-gym-primary text-white shadow-md"
                    : "bg-white/5 text-zinc-400 hover:text-white border border-white/10"
                }`}
              >
                <Award className="h-3.5 w-3.5" />
                <span>Ratified Certificate</span>
              </button>
              <button
                onClick={() => setPreviewTab("idcard")}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                  previewTab === "idcard"
                    ? "bg-gym-primary text-white shadow-md"
                    : "bg-white/5 text-zinc-400 hover:text-white border border-white/10"
                }`}
              >
                <CreditCard className="h-3.5 w-3.5" />
                <span>Athlete Digital ID Pass</span>
              </button>
            </div>

            {/* PREVIEW CONTENT */}
            {previewTab === "certificate" ? (
              <div className="rounded-2xl border-4 border-amber-500/40 bg-gradient-to-b from-[#1c0803] via-[#0e0301] to-[#1a0703] p-6 text-center shadow-2xl relative overflow-hidden">
                <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="relative h-10 w-10 rounded-full overflow-hidden border bg-black shadow-xs shrink-0 flex items-center justify-center"
                      style={{ borderColor: previewBranding.primaryColor || "#e6501b" }}
                    >
                      {previewBranding.logoUrl ? (
                        <Image
                          src={previewBranding.logoUrl}
                          alt="Logo"
                          fill
                          className="object-contain p-0.5"
                          unoptimized={
                            previewBranding.logoUrl.startsWith("http") ||
                            previewBranding.logoUrl.startsWith("data:")
                          }
                        />
                      ) : (
                        <span className="font-heading text-sm font-bold text-gym-primary">
                          {previewBranding.organizationName.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div className="text-left">
                      <div className="font-heading text-xs font-bold uppercase text-white">
                        {previewBranding.organizationName}
                      </div>
                      <div
                        className="text-[9px] font-bold uppercase tracking-widest"
                        style={{ color: previewBranding.primaryColor || "#e6501b" }}
                      >
                        {previewBranding.tagline || "Affiliated Member State Body"}
                      </div>
                    </div>
                  </div>

                  <span className="font-mono text-[9px] text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded">
                    IPF-CERT-2026-DEMO
                  </span>
                </div>

                <div className="my-6">
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 block mb-1">
                    CERTIFICATE OF MERIT &amp; RATIFIED PERFORMANCE
                  </span>
                  <h4 className="font-heading text-2xl font-black uppercase text-white tracking-wider">
                    PRIYANKA SHARMA
                  </h4>
                  <p className="text-xs text-zinc-400 mt-1">
                    State Senior Powerlifting Championship 2026 • 63 KG Open Female
                  </p>
                </div>

                <div className="rounded-xl border border-white/10 bg-black/60 p-3 mb-6 grid grid-cols-4 divide-x divide-white/10 text-center">
                  <div>
                    <span className="text-[8px] text-zinc-500 uppercase block font-bold">Squat</span>
                    <span className="font-mono text-sm font-bold text-white">165.0 KG</span>
                  </div>
                  <div>
                    <span className="text-[8px] text-zinc-500 uppercase block font-bold">Bench</span>
                    <span className="font-mono text-sm font-bold text-white">92.5 KG</span>
                  </div>
                  <div>
                    <span className="text-[8px] text-zinc-500 uppercase block font-bold">Deadlift</span>
                    <span className="font-mono text-sm font-bold text-white">185.0 KG</span>
                  </div>
                  <div className="bg-gym-primary/10">
                    <span className="text-[8px] text-gym-primary uppercase block font-bold">Total</span>
                    <span className="font-mono text-sm font-bold text-gym-primary">442.5 KG</span>
                  </div>
                </div>

                <div className="border-t border-white/10 pt-4 flex items-center justify-between text-xs text-zinc-400">
                  <div className="text-left">
                    <div className="font-serif italic font-bold text-white">
                      {previewBranding.presidentName || "President"}
                    </div>
                    <div className="text-[9px] uppercase text-zinc-500">President / Director</div>
                  </div>

                  <div className="h-10 w-10 rounded-full border-2 border-amber-500/40 bg-amber-500/10 flex items-center justify-center text-[7px] font-black text-amber-300 text-center uppercase p-1">
                    {previewBranding.sealText || "OFFICIAL SEAL"}
                  </div>

                  <div className="text-right">
                    <div className="font-serif italic font-bold text-white">
                      {previewBranding.secretaryName || "General Secretary"}
                    </div>
                    <div className="text-[9px] uppercase text-zinc-500">General Secretary</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border-2 border-white/20 bg-gradient-to-br from-[#1c0803] via-[#0e0301] to-[#1a0703] p-5 shadow-2xl relative overflow-hidden text-left">
                {/* ID Card Front Face Simulation */}
                <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3">
                  <div className="flex items-center gap-2">
                    <div
                      className="relative h-8 w-8 rounded-full overflow-hidden border bg-black shrink-0 flex items-center justify-center"
                      style={{ borderColor: previewBranding.primaryColor || "#e6501b" }}
                    >
                      {previewBranding.logoUrl ? (
                        <Image
                          src={previewBranding.logoUrl}
                          alt="Logo"
                          fill
                          className="object-contain"
                          unoptimized={
                            previewBranding.logoUrl.startsWith("http") ||
                            previewBranding.logoUrl.startsWith("data:")
                          }
                        />
                      ) : (
                        <span className="text-xs font-bold text-gym-primary">
                          {previewBranding.organizationName.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="font-heading text-xs font-bold uppercase text-white">
                        {previewBranding.organizationName}
                      </div>
                      <div
                        className="text-[8px] font-bold uppercase tracking-widest"
                        style={{ color: previewBranding.primaryColor || "#e6501b" }}
                      >
                        {previewBranding.tagline || "National Competitor Pass"}
                      </div>
                    </div>
                  </div>

                  <span className="rounded bg-emerald-600 px-1.5 py-0.5 text-[8px] font-black uppercase text-white">
                    VERIFIED
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3 my-3">
                  <div>
                    <span className="text-[8px] font-black uppercase text-zinc-400 block">
                      ATHLETE NAME
                    </span>
                    <h5 className="font-heading text-base font-bold uppercase text-white">
                      PRIYANKA SHARMA
                    </h5>
                    <span className="text-[10px] font-bold text-zinc-300">
                      63 KG • FEMALE • COMPETITOR
                    </span>
                  </div>

                  <div className="h-14 w-14 bg-white p-1 rounded-lg border border-white/20 shrink-0 flex items-center justify-center">
                    <span className="font-mono text-[7px] text-black font-black text-center">
                      QR CODE
                    </span>
                  </div>
                </div>

                <div className="border-t border-white/10 pt-2 flex items-center justify-between text-[8px] text-zinc-400">
                  <span>ID: FED-2026-9812</span>
                  <span>{previewBranding.sealText || "OFFICIAL RATIFIED SEAL"}</span>
                  <span className="text-gym-primary font-bold">ACTIVE ATHLETE</span>
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="mt-6 flex items-center justify-between">
              <button
                onClick={() =>
                  handleToggleApproval(
                    previewBranding.id,
                    previewBranding.isApproved,
                    previewBranding.organizationName
                  )
                }
                disabled={isPending}
                className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  previewBranding.isApproved
                    ? "border border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20"
                    : "bg-emerald-600 text-white hover:bg-emerald-500"
                }`}
              >
                {previewBranding.isApproved ? (
                  <>
                    <ShieldAlert className="h-4 w-4" />
                    <span>Suspend This Branding</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Approve &amp; Activate Live</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setPreviewBranding(null)}
                className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-xs font-bold uppercase tracking-wider text-zinc-300 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
