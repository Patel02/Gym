"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import {
  Palette,
  Shield,
  Award,
  Crown,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Upload,
  Eye,
  CreditCard,
  Building2,
  FileCheck,
  ArrowLeft,
  Stamp,
  PenTool,
  Save,
  RotateCcw,
  ExternalLink,
} from "lucide-react";
import { updateTenantBrandingAction, TenantBrandingData } from "@/actions/branding.actions";

interface WhiteLabelStudioProps {
  initialBranding: TenantBrandingData;
  isSuperAdmin?: boolean;
}

const COLOR_PRESETS = [
  { name: "Gujarat Flame", hex: "#e6501b" },
  { name: "Imperial Gold", hex: "#f59e0b" },
  { name: "Cyberpunk Emerald", hex: "#10b981" },
  { name: "Neon Sapphire", hex: "#3b82f6" },
  { name: "Blood Crimson", hex: "#dc2626" },
  { name: "Royal Violet", hex: "#8b5cf6" },
];

export default function WhiteLabelStudio({
  initialBranding,
  isSuperAdmin = false,
}: WhiteLabelStudioProps) {
  // Form states
  const [orgName, setOrgName] = useState(initialBranding.organizationName || "State Powerlifting Association");
  const [tagline, setTagline] = useState(initialBranding.tagline || "Affiliated Member State Body");
  const [slug, setSlug] = useState(initialBranding.slug || "delhi-powerlifting");
  const [logoUrl, setLogoUrl] = useState(initialBranding.logoUrl || "");
  const [primaryColor, setPrimaryColor] = useState(initialBranding.primaryColor || "#e6501b");
  const [sealText, setSealText] = useState(initialBranding.sealText || "OFFICIAL RATIFIED SEAL");
  const [presidentName, setPresidentName] = useState(initialBranding.presidentName || "Dr. Rajesh Kumar");
  const [presidentSignUrl, setPresidentSignUrl] = useState(initialBranding.presidentSignUrl || "");
  const [secretaryName, setSecretaryName] = useState(initialBranding.secretaryName || "Amit Sharma");
  const [secretarySignUrl, setSecretarySignUrl] = useState(initialBranding.secretarySignUrl || "");

  // Preview tab: 'certificate' | 'idcard' | 'banner'
  const [previewTab, setPreviewTab] = useState<"certificate" | "idcard" | "banner">("certificate");

  const [isPending, startTransition] = useTransition();
  const [toastMessage, setToastMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const showToast = (type: "success" | "error", text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await updateTenantBrandingAction({
        organizationName: orgName,
        tagline,
        slug,
        logoUrl: logoUrl || undefined,
        primaryColor,
        sealText,
        presidentName,
        presidentSignUrl: presidentSignUrl || undefined,
        secretaryName,
        secretarySignUrl: secretarySignUrl || undefined,
      });

      if (res.success) {
        showToast("success", res.message || "White-label branding saved successfully!");
      } else {
        showToast("error", res.error || "Failed to save branding.");
      }
    });
  };

  const handleResetToDefault = () => {
    setOrgName("WPI Association of Gujarat");
    setTagline("Official State Powerlifting Federation & Academy");
    setSlug("wpi-gujarat");
    setLogoUrl("/wpi-logo.png");
    setPrimaryColor("#e6501b");
    setSealText("OFFICIAL RATIFIED SEAL • GUJARAT POWERLIFTING");
    setPresidentName("Dr. Rakesh Patel");
    setSecretaryName("Sanjay Dave");
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 font-sans pt-28 sm:pt-32 lg:pt-36 pb-24">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div
            className={`flex items-center gap-3 px-5 py-3.5 rounded-xl border backdrop-blur-xl shadow-2xl ${
              toastMessage.type === "success"
                ? "bg-emerald-950/90 border-emerald-500/40 text-emerald-100"
                : "bg-red-950/90 border-red-500/40 text-red-100"
            }`}
          >
            {toastMessage.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-red-400" />
            )}
            <span className="text-sm font-medium">{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Header Bar */}
      <header className="border-b border-white/10 bg-[#0d121e] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link
                href="/admin"
                className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
                title="Back to Admin Dashboard"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                    <Palette className="w-5 h-5" />
                  </div>
                  <h1 className="text-2xl font-black tracking-tight text-white">
                    WHITE-LABEL BRANDING STUDIO
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/30">
                    Pro SaaS Feature
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Customize your state association or gym name, official seal, logo, and certificate signatures in real time.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleResetToDefault}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Defaults</span>
              </button>

              <button
                onClick={handleSave}
                disabled={isPending}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:to-amber-600 text-slate-950 transition-all hover:scale-105 shadow-[0_0_20px_rgba(245,158,11,0.35)]"
              >
                <Save className="w-4 h-4 stroke-[2.5]" />
                <span>{isPending ? "Applying..." : "Save & Publish Branding"}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Studio Grid (Editor Controls on Left, Live Canvas on Right) */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: Controls Form (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <form onSubmit={handleSave} className="bg-[#0c121e] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
              <div className="pb-3 border-b border-slate-800 flex items-center justify-between">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-amber-400" />
                  Federation & Gym Identity
                </h2>
                <span className="text-[10px] text-slate-400">Live preview syncs automatically</span>
              </div>

              {/* Organization Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Official Federation / Gym Name *
                </label>
                <input
                  type="text"
                  required
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder="e.g. Delhi State Powerlifting Association"
                  className="w-full bg-[#131b2c] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              {/* Tagline / Subtitle */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Affiliation Tagline / Subtitle
                </label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="e.g. Affiliated to National Federation • Estd. 1998"
                  className="w-full bg-[#131b2c] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              {/* Logo URL */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Official Logo Image URL
                </label>
                <input
                  type="text"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="https://.../your-gym-logo.png"
                  className="w-full bg-[#131b2c] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Square or circular PNG with transparent background recommended.
                </p>
              </div>

              {/* Brand Accent Color */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Brand Theme Color Accent
                </label>
                <div className="flex items-center gap-2 flex-wrap mb-3">
                  {COLOR_PRESETS.map((p) => (
                    <button
                      type="button"
                      key={p.hex}
                      onClick={() => setPrimaryColor(p.hex)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                        primaryColor === p.hex
                          ? "border-white text-white shadow-md"
                          : "border-slate-800 text-slate-400 hover:text-white"
                      }`}
                    >
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: p.hex }} />
                      <span>{p.name}</span>
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-12 h-10 rounded-lg cursor-pointer bg-transparent border border-slate-700 p-0.5"
                  />
                  <input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-28 bg-[#131b2c] border border-slate-700 rounded-lg px-2.5 py-1.5 font-mono text-xs text-white uppercase focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Certificate Stamp & Signatures Section */}
              <div className="pt-4 border-t border-slate-800 space-y-4">
                <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Stamp className="w-4 h-4" />
                  Certificate Ratification Details
                </h3>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Official Gold Seal Circular Text
                  </label>
                  <input
                    type="text"
                    value={sealText}
                    onChange={(e) => setSealText(e.target.value)}
                    placeholder="OFFICIAL RATIFIED SEAL • DELHI POWERLIFTING"
                    className="w-full bg-[#131b2c] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      President Name
                    </label>
                    <input
                      type="text"
                      value={presidentName}
                      onChange={(e) => setPresidentName(e.target.value)}
                      placeholder="Dr. Rajesh Kumar"
                      className="w-full bg-[#131b2c] border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Secretary Name
                    </label>
                    <input
                      type="text"
                      value={secretaryName}
                      onChange={(e) => setSecretaryName(e.target.value)}
                      placeholder="Amit Sharma"
                      className="w-full bg-[#131b2c] border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end">
                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-lg shadow-amber-950/40"
                >
                  {isPending ? "Saving Changes..." : "Save Custom Branding"}
                </button>
              </div>
            </form>
          </div>

          {/* RIGHT COLUMN: Live Interactive Studio Canvas (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Canvas Header & Tabs */}
            <div className="flex items-center justify-between flex-wrap gap-2 pb-2">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Real-Time Live Canvas Preview
                </span>
              </div>

              <div className="flex items-center gap-1 bg-[#0f172a] p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => setPreviewTab("certificate")}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    previewTab === "certificate"
                      ? "bg-amber-500 text-slate-950 shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Official Certificate
                </button>
                <button
                  onClick={() => setPreviewTab("idcard")}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    previewTab === "idcard"
                      ? "bg-amber-500 text-slate-950 shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Athlete ID Card
                </button>
                <button
                  onClick={() => setPreviewTab("banner")}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    previewTab === "banner"
                      ? "bg-amber-500 text-slate-950 shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Portal Header
                </button>
              </div>
            </div>

            {/* PREVIEW 1: OFFICIAL CERTIFICATE */}
            {previewTab === "certificate" && (
              <div className="bg-[#0b0f19] border border-slate-800 rounded-2xl p-4 sm:p-6 overflow-x-auto shadow-2xl">
                <div
                  className="mx-auto w-[680px] min-h-[460px] bg-[#fdfbf7] text-zinc-900 p-6 sm:p-8 rounded-xl shadow-2xl relative overflow-hidden border-[10px]"
                  style={{
                    borderColor: "#18120c",
                    backgroundImage: `radial-gradient(circle at 50% 50%, ${primaryColor}15 0%, rgba(0, 0, 0, 0) 70%)`,
                  }}
                >
                  {/* Outer & Inner Filigree Border */}
                  <div
                    className="absolute inset-2 border-2 pointer-events-none rounded"
                    style={{ borderColor: primaryColor }}
                  />
                  <div
                    className="absolute inset-3.5 border border-dashed pointer-events-none"
                    style={{ borderColor: `${primaryColor}66` }}
                  />

                  {/* Corner Accents */}
                  <div
                    className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 pointer-events-none"
                    style={{ borderColor: primaryColor }}
                  />
                  <div
                    className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 pointer-events-none"
                    style={{ borderColor: primaryColor }}
                  />
                  <div
                    className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 pointer-events-none"
                    style={{ borderColor: primaryColor }}
                  />
                  <div
                    className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 pointer-events-none"
                    style={{ borderColor: primaryColor }}
                  />

                  {/* Header Row */}
                  <div className="flex items-center justify-between border-b pb-3 mb-4" style={{ borderColor: `${primaryColor}40` }}>
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white shadow-md overflow-hidden"
                        style={{ backgroundColor: primaryColor }}
                      >
                        {logoUrl ? (
                          <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                        ) : (
                          <Building2 className="w-6 h-6 text-white" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-black text-sm uppercase tracking-wider text-zinc-900 leading-tight">
                          {orgName}
                        </h4>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">
                          {tagline}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block">
                        CERTIFICATE CODE
                      </span>
                      <span
                        className="font-mono text-xs font-bold px-2 py-0.5 rounded border"
                        style={{ color: primaryColor, borderColor: `${primaryColor}60`, backgroundColor: `${primaryColor}10` }}
                      >
                        CERT-WPI-2026-0925
                      </span>
                    </div>
                  </div>

                  {/* Title & Body */}
                  <div className="text-center space-y-2 py-2">
                    <span
                      className="text-[11px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full border inline-block"
                      style={{ color: primaryColor, borderColor: `${primaryColor}40`, backgroundColor: `${primaryColor}10` }}
                    >
                      Official Merit Certificate
                    </span>
                    <h3 className="text-xl font-serif font-black tracking-tight text-zinc-900">
                      CERTIFICATE OF MERIT & PERFORMANCE
                    </h3>
                    <p className="text-xs text-zinc-600 italic">This is officially ratified that</p>
                    <div className="text-xl font-serif font-extrabold text-zinc-900 underline decoration-2 decoration-amber-600 underline-offset-4">
                      Rohit V. Sharma
                    </div>
                    <p className="text-[11px] text-zinc-700 max-w-md mx-auto leading-relaxed pt-1">
                      has successfully competed in the <strong>Open Men 83kg Division</strong> and achieved a
                      competition total of <strong>585.0 KG (Gold Medalist)</strong>.
                    </p>
                  </div>

                  {/* Footer Seal & Signatures */}
                  <div className="mt-8 pt-4 flex items-end justify-between px-4 border-t border-zinc-200">
                    {/* President Signature */}
                    <div className="text-center">
                      <div className="font-serif italic font-bold text-xs text-zinc-800 border-b border-zinc-400 pb-0.5 px-3">
                        {presidentName}
                      </div>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 block mt-1">
                        President
                      </span>
                      <span className="text-[8px] text-zinc-400 block">{orgName}</span>
                    </div>

                    {/* Official Stamp / Seal */}
                    <div className="flex flex-col items-center">
                      <div
                        className="w-14 h-14 rounded-full border-2 border-dashed flex items-center justify-center p-0.5 shadow-sm"
                        style={{ borderColor: primaryColor }}
                      >
                        <div
                          className="w-full h-full rounded-full border flex flex-col items-center justify-center text-center p-1"
                          style={{ borderColor: primaryColor }}
                        >
                          <Shield className="w-4 h-4" style={{ color: primaryColor }} />
                          <span className="text-[5px] font-black uppercase tracking-tighter" style={{ color: primaryColor }}>
                            {sealText.slice(0, 18)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Secretary General Signature */}
                    <div className="text-center">
                      <div className="font-serif italic font-bold text-xs text-zinc-800 border-b border-zinc-400 pb-0.5 px-3">
                        {secretaryName}
                      </div>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 block mt-1">
                        General Secretary
                      </span>
                      <span className="text-[8px] text-zinc-400 block">{orgName}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* PREVIEW 2: ATHLETE ID CARD */}
            {previewTab === "idcard" && (
              <div className="bg-[#0b0f19] border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col sm:flex-row items-center justify-center gap-6">
                {/* ID Card Front */}
                <div
                  className="w-72 h-44 rounded-2xl p-4 shadow-xl border relative overflow-hidden flex flex-col justify-between"
                  style={{
                    backgroundColor: "#0d111a",
                    borderColor: `${primaryColor}60`,
                    boxShadow: `0 0 25px ${primaryColor}20`,
                  }}
                >
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs text-white"
                        style={{ backgroundColor: primaryColor }}
                      >
                        {logoUrl ? <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" /> : "F"}
                      </div>
                      <div className="text-[10px] font-extrabold uppercase text-white truncate max-w-[150px]">
                        {orgName}
                      </div>
                    </div>
                    <span
                      className="px-2 py-0.5 rounded text-[8px] font-black uppercase"
                      style={{ backgroundColor: `${primaryColor}25`, color: primaryColor }}
                    >
                      ATHLETE
                    </span>
                  </div>

                  <div className="flex items-center gap-3 my-1">
                    <div className="w-14 h-14 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-300">
                      PHOTO
                    </div>
                    <div className="space-y-0.5">
                      <div className="text-xs font-extrabold text-white">Rohit Sharma</div>
                      <div className="text-[10px] text-slate-400 font-mono">ID: WPI-GUJ-2026-44</div>
                      <div className="text-[9px] text-emerald-400 font-bold">STATUS: ACTIVE LIFTER</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[9px] text-slate-400 pt-1 border-t border-white/5">
                    <span>Valid: 2026 - 2027</span>
                    <span className="font-bold" style={{ color: primaryColor }}>
                      IPF Affiliated
                    </span>
                  </div>
                </div>

                {/* ID Card Back */}
                <div
                  className="w-72 h-44 rounded-2xl p-4 shadow-xl border relative overflow-hidden flex flex-col justify-between"
                  style={{
                    backgroundColor: "#0d111a",
                    borderColor: `${primaryColor}60`,
                  }}
                >
                  <div className="text-[9px] text-slate-300 font-medium space-y-1">
                    <p className="font-bold text-white text-[10px]">TERMS & RATIFICATION</p>
                    <p>Official competitor license issued by {orgName}.</p>
                    <p>WADA / NADA Anti-Doping Code binding.</p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/10">
                    <div className="w-10 h-10 bg-white p-1 rounded">
                      <div className="w-full h-full bg-slate-900 flex items-center justify-center text-[7px] text-white font-mono">
                        QR
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[8px] text-slate-400 block">Signatory</span>
                      <span className="font-serif italic text-[10px] font-bold text-white block">
                        {secretaryName}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* PREVIEW 3: PORTAL BANNER */}
            {previewTab === "banner" && (
              <div className="bg-[#0b0f19] border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
                <div
                  className="w-full rounded-2xl p-6 border shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4"
                  style={{
                    backgroundColor: "#0c101a",
                    borderColor: `${primaryColor}50`,
                    boxShadow: `0 0 35px ${primaryColor}15`,
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-white shadow-lg"
                      style={{ backgroundColor: primaryColor }}
                    >
                      {logoUrl ? <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" /> : <Building2 className="w-8 h-8 text-white" />}
                    </div>
                    <div>
                      <h2 className="text-lg font-black uppercase text-white tracking-wide">{orgName}</h2>
                      <p className="text-xs text-slate-400">{tagline}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="px-5 py-2 rounded-xl text-xs font-bold text-slate-950 shadow-md"
                    style={{ backgroundColor: primaryColor }}
                  >
                    Register Athlete
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
