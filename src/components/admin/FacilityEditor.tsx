"use client";

import { useState } from "react";
import { 
  Building2, 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  Loader2, 
  CheckCircle2, 
  ExternalLink, 
  X, 
  Sparkles, 
  Clock, 
  MapPin, 
  Layers, 
  CreditCard,
  Flame,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import WhatsAppIcon from "@/components/ui/WhatsAppIcon";
import { 
  saveFacilityDataAction, 
  type FacilityData, 
  type PassOption, 
  type PlatformHighlight 
} from "@/actions/facility.actions";

export default function FacilityEditor({ initialData }: { initialData: FacilityData }) {
  const [data, setData] = useState<FacilityData>(initialData);
  const [activeTab, setActiveTab] = useState<"passes" | "highlights" | "hours">("passes");

  const [isSaving, setIsSaving] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modal states for Pass (Create / Edit)
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);
  const [editingPassId, setEditingPassId] = useState<string | null>(null);
  const [passForm, setPassForm] = useState<PassOption>({
    id: "",
    name: "",
    price: "₹999",
    period: "Per Session",
    desc: "",
    features: [""],
    badge: "Flexible",
    popular: false,
    waMessage: "Hi Coaches Akash & Tanvi, I would like to book an access pass at the National Facility."
  });

  // Modal states for Platform Highlight (Create / Edit)
  const [isHighlightModalOpen, setIsHighlightModalOpen] = useState(false);
  const [editingHighlightId, setEditingHighlightId] = useState<string | null>(null);
  const [highlightForm, setHighlightForm] = useState<PlatformHighlight>({
    id: "",
    title: "",
    subtitle: "",
    desc: "",
    tag: "Available For Daily Athlete Training"
  });

  // Delete Confirmation State
  const [deleteTarget, setDeleteTarget] = useState<{ type: "pass" | "highlight"; id: string; name: string } | null>(null);

  // Live Popup Notification Modal
  const [livePopup, setLivePopup] = useState<{
    isOpen: boolean;
    title: string;
    subtitle: string;
  } | null>(null);

  const playSuccessChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      const now = ctx.currentTime;
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc.start(now);
      osc.stop(now + 0.45);
    } catch {
      // Audio policy fallback
    }
  };

  // Central Persistence Function
  const persistData = async (nextData: FacilityData, successMsg = "Facility data published live!") => {
    setIsSaving(true);
    setErrorMessage(null);
    setData(nextData);

    try {
      const actionRes = await saveFacilityDataAction(nextData);
      if (actionRes.success) {
        playSuccessChime();
        setSuccessToast(successMsg);
        setTimeout(() => setSuccessToast(null), 4000);
        return true;
      }

      // Fallback API
      const res = await fetch("/api/admin/facility", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nextData),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to persist changes.");
      }

      playSuccessChime();
      setSuccessToast(successMsg);
      setTimeout(() => setSuccessToast(null), 4000);
      return true;
    } catch (err: any) {
      console.error("Persistence error:", err);
      setErrorMessage(err.message || "An error occurred while saving to live website.");
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  // ── PASS ACTIONS ──
  const handleOpenAddPass = () => {
    setEditingPassId(null);
    setPassForm({
      id: `pass-${Date.now()}`,
      name: "",
      price: "₹1,499",
      period: "Per Month",
      desc: "Full access to IPF competition platforms and recovery equipment.",
      features: ["Unlimited training 6 days a week", "Competition combo racks", "Cold plunge access"],
      badge: "Popular",
      popular: false,
      waMessage: "Hi Coaches Akash & Tanvi, I would like to book a training pass at the National Facility."
    });
    setIsPassModalOpen(true);
  };

  const handleOpenEditPass = (pass: PassOption) => {
    setEditingPassId(pass.id);
    setPassForm({
      ...pass,
      features: pass.features && pass.features.length > 0 ? [...pass.features] : [""]
    });
    setIsPassModalOpen(true);
  };

  const handleSavePass = async () => {
    if (!passForm.name.trim() || !passForm.price.trim()) {
      alert("Please enter a pass name and price.");
      return;
    }

    const cleanFeatures = passForm.features.map(f => f.trim()).filter(Boolean);
    const finalItem: PassOption = {
      ...passForm,
      features: cleanFeatures.length > 0 ? cleanFeatures : ["Full platform access"]
    };

    let nextPasses: PassOption[];
    if (editingPassId) {
      nextPasses = data.passes.map(p => p.id === editingPassId ? finalItem : p);
    } else {
      nextPasses = [...data.passes, finalItem];
    }

    const nextData = { ...data, passes: nextPasses };
    const ok = await persistData(nextData, editingPassId ? "Access pass updated live!" : "New access pass created live!");

    if (ok) {
      setIsPassModalOpen(false);
      setLivePopup({
        isOpen: true,
        title: finalItem.name + ` (${finalItem.price})`,
        subtitle: editingPassId 
          ? "Access pass pricing & features updated on live /facility page."
          : "New facility access pass is now active for athlete bookings!"
      });
    }
  };

  // ── HIGHLIGHT ACTIONS ──
  const handleOpenAddHighlight = () => {
    setEditingHighlightId(null);
    setHighlightForm({
      id: `highlight-${Date.now()}`,
      title: "",
      subtitle: "IPF Competition Standard",
      desc: "",
      tag: "Available For Daily Athlete Training"
    });
    setIsHighlightModalOpen(true);
  };

  const handleOpenEditHighlight = (hl: PlatformHighlight) => {
    setEditingHighlightId(hl.id);
    setHighlightForm({ ...hl });
    setIsHighlightModalOpen(true);
  };

  const handleSaveHighlight = async () => {
    if (!highlightForm.title.trim()) {
      alert("Please enter a title.");
      return;
    }

    const finalItem: PlatformHighlight = { ...highlightForm };
    let nextHighlights: PlatformHighlight[];
    if (editingHighlightId) {
      nextHighlights = data.highlights.map(h => h.id === editingHighlightId ? finalItem : h);
    } else {
      nextHighlights = [...data.highlights, finalItem];
    }

    const nextData = { ...data, highlights: nextHighlights };
    const ok = await persistData(nextData, editingHighlightId ? "Platform highlight updated live!" : "New platform highlight added live!");

    if (ok) {
      setIsHighlightModalOpen(false);
      setLivePopup({
        isOpen: true,
        title: finalItem.title,
        subtitle: "Platform & equipment specification updated live on /facility."
      });
    }
  };

  // ── DELETE CONFIRMATION ──
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    let nextData = { ...data };
    if (deleteTarget.type === "pass") {
      nextData.passes = data.passes.filter(p => p.id !== deleteTarget.id);
    } else {
      nextData.highlights = data.highlights.filter(h => h.id !== deleteTarget.id);
    }

    const ok = await persistData(nextData, `${deleteTarget.type === "pass" ? "Access pass" : "Highlight"} deleted from live website!`);
    if (ok) {
      setDeleteTarget(null);
    }
  };

  // ── SAVE HOURS & HERO ──
  const handleSaveHoursAndHero = async () => {
    const ok = await persistData(data, "Facility hours, location, and visit CTA updated live!");
    if (ok) {
      setLivePopup({
        isOpen: true,
        title: `${data.hero.location} • ${data.hero.hours}`,
        subtitle: "Operating schedule, address, and in-person visit CTA updated live on website."
      });
    }
  };

  return (
    <div className="flex flex-col gap-8 relative">
      
      {/* ── Top Action Header Bar ── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-gym-primary/30 bg-gym-primary/10 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-gym-primary mb-2">
            <Building2 className="h-3.5 w-3.5" />
            <span>National Training Center CMS</span>
          </div>
          <h2 className="font-heading text-3xl font-bold uppercase text-white">
            Facility, Platforms & Passes <span className="text-gym-primary">Manager</span>
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Edit training passes, platform hardware specifications, operating hours, and booking WhatsApp messages on <span className="text-gym-primary">/facility</span>.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/facility"
            target="_blank"
            className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-gray-200 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
          >
            <span>View Live /facility</span>
            <ExternalLink className="h-3.5 w-3.5 text-gym-primary" />
          </Link>

          {activeTab === "passes" && (
            <button
              type="button"
              onClick={handleOpenAddPass}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-gym-primary to-gym-red px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-[0_0_20px_rgba(230,80,27,0.4)] hover:brightness-110 transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Add Training Pass</span>
            </button>
          )}

          {activeTab === "highlights" && (
            <button
              type="button"
              onClick={handleOpenAddHighlight}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-gym-primary to-gym-red px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-[0_0_20px_rgba(230,80,27,0.4)] hover:brightness-110 transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Add Platform Highlight</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Floating Notification Toast ── */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl border-2 border-emerald-500 bg-black/90 px-6 py-4 text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.5)] backdrop-blur-xl animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="h-6 w-6 shrink-0" />
          <div className="text-sm font-bold text-white">
            {successToast}
          </div>
        </div>
      )}

      {/* ── Error Message Alert ── */}
      {errorMessage && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-500/40 bg-red-950/40 p-4 text-xs font-bold text-red-300">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* ── Navigation Tabs ── */}
      <div className="flex border-b border-white/10 gap-2">
        <button
          type="button"
          onClick={() => setActiveTab("passes")}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === "passes"
              ? "border-gym-primary text-gym-primary bg-gym-primary/5"
              : "border-transparent text-gray-400 hover:text-white"
          }`}
        >
          <CreditCard className="h-4 w-4" />
          <span>Access Passes & Pricing ({data.passes.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("highlights")}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === "highlights"
              ? "border-gym-primary text-gym-primary bg-gym-primary/5"
              : "border-transparent text-gray-400 hover:text-white"
          }`}
        >
          <Layers className="h-4 w-4" />
          <span>Platform Highlights ({data.highlights.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("hours")}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === "hours"
              ? "border-gym-primary text-gym-primary bg-gym-primary/5"
              : "border-transparent text-gray-400 hover:text-white"
          }`}
        >
          <Clock className="h-4 w-4" />
          <span>Hours, Location & Tour CTA</span>
        </button>
      </div>

      {/* ══════════════ TAB 1: ACCESS PASSES & PRICING ══════════════ */}
      {activeTab === "passes" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Showing {data.passes.length} training pass tiers</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              Live on /facility
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {data.passes.map((pass) => (
              <div
                key={pass.id}
                className={`relative rounded-3xl p-6 flex flex-col justify-between backdrop-blur-xl transition-all shadow-xl ${
                  pass.popular
                    ? "border-2 border-gym-primary bg-gradient-to-b from-[#1d0603] to-[#100302] shadow-[0_0_35px_rgba(230,80,27,0.3)]"
                    : "border border-white/10 bg-[#120402]/80 hover:border-gym-primary/40"
                }`}
              >
                <div>
                  {/* Top Bar: Badge & Action Buttons */}
                  <div className="flex items-center justify-between gap-2 mb-3 pb-3 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-gym-primary">
                        {pass.badge}
                      </span>
                      {pass.popular && (
                        <span className="rounded-full bg-gym-primary px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-widest text-white">
                          Featured
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleOpenEditPass(pass)}
                        title="Edit Pass"
                        className="p-2 rounded-xl border border-white/10 bg-white/5 text-gray-300 hover:text-white hover:border-gym-primary/50 hover:bg-gym-primary/15 transition-all cursor-pointer"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget({ type: "pass", id: pass.id, name: pass.name })}
                        title="Delete Pass"
                        className="p-2 rounded-xl border border-red-500/20 bg-red-950/20 text-red-400 hover:bg-red-600 hover:text-white transition-all cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <h4 className="font-heading text-2xl font-bold uppercase text-white mb-1">
                    {pass.name}
                  </h4>

                  <div className="my-3 pb-3 border-b border-white/10 flex items-baseline gap-2">
                    <span className="font-heading text-3xl font-bold text-white">{pass.price}</span>
                    <span className="text-xs text-gray-400 font-medium">{pass.period}</span>
                  </div>

                  <p className="text-xs text-gray-300 leading-relaxed mb-4">
                    {pass.desc}
                  </p>

                  <div className="space-y-1.5 mb-4">
                    {pass.features.map((f, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-gray-300">
                        <CheckCircle2 className="h-3.5 w-3.5 text-gym-primary mt-0.5 shrink-0" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center gap-2 text-[11px] text-gray-400 truncate">
                  <WhatsAppIcon variant="badge" className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">"{pass.waMessage}"</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════ TAB 2: PLATFORM HIGHLIGHTS ══════════════ */}
      {activeTab === "highlights" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Showing {data.highlights.length} facility hardware & platform highlights</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              Live on /facility
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.highlights.map((hl) => (
              <div
                key={hl.id}
                className="group relative rounded-3xl border border-white/10 bg-[#120402]/80 p-6 backdrop-blur-xl hover:border-gym-primary/50 transition-all flex flex-col justify-between shadow-xl"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3 pb-3 border-b border-white/10">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gym-primary truncate">
                      {hl.subtitle}
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleOpenEditHighlight(hl)}
                        title="Edit Highlight"
                        className="p-2 rounded-xl border border-white/10 bg-white/5 text-gray-300 hover:text-white hover:border-gym-primary/50 hover:bg-gym-primary/15 transition-all cursor-pointer"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget({ type: "highlight", id: hl.id, name: hl.title })}
                        title="Delete Highlight"
                        className="p-2 rounded-xl border border-red-500/20 bg-red-950/20 text-red-400 hover:bg-red-600 hover:text-white transition-all cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="font-heading text-xl font-bold uppercase text-white mb-2">
                    {hl.title}
                  </h3>

                  <p className="text-xs text-gray-300 leading-relaxed">
                    {hl.desc}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-white/10 flex items-center gap-2 text-xs font-semibold text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>{hl.tag || "Available For Daily Athlete Training"}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════ TAB 3: HOURS, LOCATION & TOUR CTA ══════════════ */}
      {activeTab === "hours" && (
        <div className="space-y-8 max-w-4xl">
          <div className="rounded-3xl border border-white/10 bg-[#120402]/80 p-6 sm:p-8 backdrop-blur-xl shadow-xl">
            <h3 className="font-heading text-lg font-bold uppercase text-white mb-4 pb-3 border-b border-white/10 flex items-center gap-2">
              <Clock className="h-5 w-5 text-gym-primary" />
              <span>Location, Operating Hours & Hero Header</span>
            </h3>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1">
                    Locations Displayed
                  </label>
                  <input
                    type="text"
                    value={data.hero.location}
                    onChange={(e) => setData({ ...data, hero: { ...data.hero, location: e.target.value } })}
                    placeholder="Bengaluru & New Delhi Centers"
                    className="w-full rounded-xl border border-white/15 bg-black/60 px-4 py-2.5 text-sm text-white focus:border-gym-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1">
                    Operating Schedule & Hours
                  </label>
                  <input
                    type="text"
                    value={data.hero.hours}
                    onChange={(e) => setData({ ...data, hero: { ...data.hero, hours: e.target.value } })}
                    placeholder="Open Mon–Sat: 6:00 AM – 10:00 PM"
                    className="w-full rounded-xl border border-white/15 bg-black/60 px-4 py-2.5 text-sm text-white focus:border-gym-primary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1">
                  Hero Pill Badge
                </label>
                <input
                  type="text"
                  value={data.hero.badge}
                  onChange={(e) => setData({ ...data, hero: { ...data.hero, badge: e.target.value } })}
                  className="w-full rounded-xl border border-white/15 bg-black/60 px-4 py-2.5 text-sm text-white focus:border-gym-primary focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1">
                    Main Title (Line 1)
                  </label>
                  <input
                    type="text"
                    value={data.hero.title}
                    onChange={(e) => setData({ ...data, hero: { ...data.hero, title: e.target.value } })}
                    className="w-full rounded-xl border border-white/15 bg-black/60 px-4 py-2.5 text-sm text-white focus:border-gym-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1">
                    Subtitle (Orange Gradient Line 2)
                  </label>
                  <input
                    type="text"
                    value={data.hero.subtitle}
                    onChange={(e) => setData({ ...data, hero: { ...data.hero, subtitle: e.target.value } })}
                    className="w-full rounded-xl border border-white/15 bg-black/60 px-4 py-2.5 text-sm text-white focus:border-gym-primary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1">
                  Hero Description
                </label>
                <textarea
                  rows={3}
                  value={data.hero.desc}
                  onChange={(e) => setData({ ...data, hero: { ...data.hero, desc: e.target.value } })}
                  className="w-full rounded-xl border border-white/15 bg-black/60 px-4 py-2.5 text-sm text-white focus:border-gym-primary focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* In-Person Tour Visit CTA */}
          <div className="rounded-3xl border border-white/10 bg-[#120402]/80 p-6 sm:p-8 backdrop-blur-xl shadow-xl">
            <h3 className="font-heading text-lg font-bold uppercase text-white mb-4 pb-3 border-b border-white/10 flex items-center gap-2">
              <WhatsAppIcon variant="badge" className="h-5 w-5" />
              <span>Bottom In-Person Facility Tour CTA</span>
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1">
                  Tag Line
                </label>
                <input
                  type="text"
                  value={data.cta.tag}
                  onChange={(e) => setData({ ...data, cta: { ...data.cta, tag: e.target.value } })}
                  className="w-full rounded-xl border border-white/15 bg-black/60 px-4 py-2.5 text-sm text-white focus:border-gym-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1">
                  CTA Headline
                </label>
                <input
                  type="text"
                  value={data.cta.title}
                  onChange={(e) => setData({ ...data, cta: { ...data.cta, title: e.target.value } })}
                  className="w-full rounded-xl border border-white/15 bg-black/60 px-4 py-2.5 text-sm text-white focus:border-gym-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1">
                  CTA Description
                </label>
                <textarea
                  rows={2}
                  value={data.cta.desc}
                  onChange={(e) => setData({ ...data, cta: { ...data.cta, desc: e.target.value } })}
                  className="w-full rounded-xl border border-white/15 bg-black/60 px-4 py-2.5 text-sm text-white focus:border-gym-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1">
                  Pre-filled WhatsApp Message
                </label>
                <input
                  type="text"
                  value={data.cta.waMessage}
                  onChange={(e) => setData({ ...data, cta: { ...data.cta, waMessage: e.target.value } })}
                  className="w-full rounded-xl border border-white/15 bg-black/60 px-4 py-2.5 text-sm text-white focus:border-gym-primary focus:outline-none"
                />
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 flex justify-end">
              <button
                type="button"
                disabled={isSaving}
                onClick={handleSaveHoursAndHero}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-gym-primary to-gym-red px-6 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-lg hover:brightness-110 cursor-pointer disabled:opacity-60"
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                <span>Save Hours & Tour CTA Live</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════ MODAL: ADD / EDIT PASS ══════════════ */}
      {isPassModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-2xl rounded-3xl border border-gym-primary/40 bg-[#140402] p-6 sm:p-8 shadow-2xl my-8">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
              <div className="flex items-center gap-2 text-gym-primary">
                <CreditCard className="h-5 w-5" />
                <h3 className="font-heading text-lg sm:text-xl font-bold uppercase text-white">
                  {editingPassId ? "Edit Access Pass" : "Add New Training Pass"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsPassModalOpen(false)}
                className="text-gray-400 hover:text-white cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1">
                    Pass Name *
                  </label>
                  <input
                    type="text"
                    value={passForm.name}
                    onChange={(e) => setPassForm({ ...passForm, name: e.target.value })}
                    placeholder="e.g. Monthly Athlete Pass"
                    className="w-full rounded-xl border border-white/15 bg-black/60 px-4 py-2.5 text-sm text-white focus:border-gym-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1">
                    Badge Label
                  </label>
                  <input
                    type="text"
                    value={passForm.badge}
                    onChange={(e) => setPassForm({ ...passForm, badge: e.target.value })}
                    placeholder="e.g. Most Popular"
                    className="w-full rounded-xl border border-white/15 bg-black/60 px-4 py-2.5 text-sm text-white focus:border-gym-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1">
                    Price (₹) *
                  </label>
                  <input
                    type="text"
                    value={passForm.price}
                    onChange={(e) => setPassForm({ ...passForm, price: e.target.value })}
                    placeholder="e.g. ₹2,999"
                    className="w-full rounded-xl border border-white/15 bg-black/60 px-4 py-2.5 text-sm text-white focus:border-gym-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1">
                    Billing Period *
                  </label>
                  <input
                    type="text"
                    value={passForm.period}
                    onChange={(e) => setPassForm({ ...passForm, period: e.target.value })}
                    placeholder="e.g. Per Month or Single Session"
                    className="w-full rounded-xl border border-white/15 bg-black/60 px-4 py-2.5 text-sm text-white focus:border-gym-primary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1">
                  Short Description
                </label>
                <textarea
                  rows={2}
                  value={passForm.desc}
                  onChange={(e) => setPassForm({ ...passForm, desc: e.target.value })}
                  placeholder="Target audience or summary..."
                  className="w-full rounded-xl border border-white/15 bg-black/60 px-4 py-2.5 text-sm text-white focus:border-gym-primary focus:outline-none"
                />
              </div>

              {/* Features List */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">
                    Pass Features / Included Amenities
                  </label>
                  <button
                    type="button"
                    onClick={() => setPassForm({ ...passForm, features: [...passForm.features, ""] })}
                    className="inline-flex items-center gap-1 text-[11px] font-bold uppercase text-gym-primary hover:underline cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Amenity</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {passForm.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-gym-primary shrink-0" />
                      <input
                        type="text"
                        value={feat}
                        onChange={(e) => {
                          const updated = [...passForm.features];
                          updated[idx] = e.target.value;
                          setPassForm({ ...passForm, features: updated });
                        }}
                        placeholder={`Amenity #${idx + 1}`}
                        className="flex-1 rounded-xl border border-white/15 bg-black/60 px-3 py-2 text-xs text-white focus:border-gym-primary focus:outline-none"
                      />
                      {passForm.features.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const updated = passForm.features.filter((_, i) => i !== idx);
                            setPassForm({ ...passForm, features: updated.length > 0 ? updated : [""] });
                          }}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-white/5 cursor-pointer"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-3 cursor-pointer text-xs font-semibold text-gray-200">
                  <input
                    type="checkbox"
                    checked={passForm.popular}
                    onChange={(e) => setPassForm({ ...passForm, popular: e.target.checked })}
                    className="h-4 w-4 rounded accent-gym-primary cursor-pointer"
                  />
                  <span>Mark as "Most Popular" / Highlighted Card (Glows with orange border)</span>
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1">
                  Pre-filled WhatsApp Message
                </label>
                <input
                  type="text"
                  value={passForm.waMessage}
                  onChange={(e) => setPassForm({ ...passForm, waMessage: e.target.value })}
                  className="w-full rounded-xl border border-white/15 bg-black/60 px-4 py-2.5 text-sm text-white focus:border-gym-primary focus:outline-none"
                />
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsPassModalOpen(false)}
                className="px-5 py-2.5 rounded-full border border-white/15 text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSaving}
                onClick={handleSavePass}
                className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-gym-primary text-xs font-bold uppercase tracking-wider text-white shadow-[0_0_20px_rgba(230,80,27,0.4)] hover:brightness-110 cursor-pointer disabled:opacity-60"
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                <span>{editingPassId ? "Update & Publish Live" : "Add & Publish Live"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════ MODAL: ADD / EDIT HIGHLIGHT ══════════════ */}
      {isHighlightModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-lg rounded-3xl border border-gym-primary/40 bg-[#140402] p-6 sm:p-8 shadow-2xl my-8">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
              <div className="flex items-center gap-2 text-gym-primary">
                <Building2 className="h-5 w-5" />
                <h3 className="font-heading text-lg sm:text-xl font-bold uppercase text-white">
                  {editingHighlightId ? "Edit Platform Highlight" : "Add Platform Highlight"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsHighlightModalOpen(false)}
                className="text-gray-400 hover:text-white cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={highlightForm.title}
                  onChange={(e) => setHighlightForm({ ...highlightForm, title: e.target.value })}
                  placeholder="e.g. 8 Competition Platforms"
                  className="w-full rounded-xl border border-white/15 bg-black/60 px-4 py-2.5 text-sm text-white focus:border-gym-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1">
                  Subtitle Badge
                </label>
                <input
                  type="text"
                  value={highlightForm.subtitle}
                  onChange={(e) => setHighlightForm({ ...highlightForm, subtitle: e.target.value })}
                  placeholder="e.g. Built to IPF Standards"
                  className="w-full rounded-xl border border-white/15 bg-black/60 px-4 py-2.5 text-sm text-white focus:border-gym-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={highlightForm.desc}
                  onChange={(e) => setHighlightForm({ ...highlightForm, desc: e.target.value })}
                  placeholder="Details regarding the platform or equipment..."
                  className="w-full rounded-xl border border-white/15 bg-black/60 px-4 py-2.5 text-sm text-white focus:border-gym-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1">
                  Bottom Availability Tag
                </label>
                <input
                  type="text"
                  value={highlightForm.tag || ""}
                  onChange={(e) => setHighlightForm({ ...highlightForm, tag: e.target.value })}
                  placeholder="Available For Daily Athlete Training"
                  className="w-full rounded-xl border border-white/15 bg-black/60 px-4 py-2.5 text-sm text-white focus:border-gym-primary focus:outline-none"
                />
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsHighlightModalOpen(false)}
                className="px-5 py-2.5 rounded-full border border-white/15 text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSaving}
                onClick={handleSaveHighlight}
                className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-gym-primary text-xs font-bold uppercase tracking-wider text-white shadow-[0_0_20px_rgba(230,80,27,0.4)] hover:brightness-110 cursor-pointer disabled:opacity-60"
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                <span>{editingHighlightId ? "Update & Publish" : "Add & Publish"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════ MODAL: DELETE CONFIRMATION ══════════════ */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl border border-red-500/40 bg-[#160503] p-6 sm:p-7 shadow-2xl">
            <div className="flex items-center gap-3 text-red-400 mb-4">
              <div className="p-3 rounded-2xl bg-red-950/60 border border-red-500/30">
                <Trash2 className="h-6 w-6 text-red-400" />
              </div>
              <div>
                <h4 className="font-heading text-lg font-bold uppercase text-white">
                  Delete {deleteTarget.type === "pass" ? "Access Pass" : "Platform Highlight"}?
                </h4>
                <p className="text-xs text-gray-400">"{deleteTarget.name}" will be removed from /facility.</p>
              </div>
            </div>

            <p className="text-sm text-gray-300 leading-relaxed mb-6">
              Are you sure you want to permanently delete this item? It will be removed immediately from the public website.
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-5 py-2 rounded-full border border-white/15 text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-5 py-2 rounded-full bg-red-600 hover:bg-red-500 text-xs font-bold uppercase tracking-wider text-white shadow-lg cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════ GLOBAL POPUP NOTIFICATION MODAL (LIVE CONFIRMATION) ══════════════ */}
      {livePopup?.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl border-2 border-emerald-500/70 bg-[#120402] p-6 sm:p-8 shadow-[0_0_60px_rgba(16,185,129,0.4)] relative">
            <button
              type="button"
              onClick={() => setLivePopup(null)}
              className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="text-center">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-emerald-500/20 text-emerald-400 border-2 border-emerald-500/50 mb-4 shadow-[0_0_30px_rgba(16,185,129,0.4)]">
                <CheckCircle2 className="h-9 w-9" />
              </div>

              <div className="inline-block px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-[10px] font-semibold uppercase tracking-widest text-emerald-300 mb-2">
                ✓ Successfully Updated
              </div>

              <h3 className="font-heading text-2xl font-bold uppercase text-white tracking-wide">
                Facility Published Live!
              </h3>

              <p className="text-xs text-gray-300 mt-2">
                {livePopup.subtitle}
              </p>

              <div className="mt-5 text-left rounded-2xl border border-white/15 bg-black/70 p-4 space-y-1">
                <div className="text-[10px] font-bold uppercase tracking-widest text-gym-primary">
                  Updated Item
                </div>
                <div className="text-sm font-black text-white leading-snug">
                  {livePopup.title}
                </div>
                <div className="text-[11px] text-emerald-400 font-bold pt-1 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>Status: 100% Live on Website</span>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-center gap-3">
                <Link
                  href="/facility"
                  target="_blank"
                  className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-6 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-lg transition-all cursor-pointer"
                >
                  <span>View Public /facility Page</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>

                <button
                  type="button"
                  onClick={() => setLivePopup(null)}
                  className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold uppercase tracking-wider text-xs transition-all cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
