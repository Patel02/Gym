"use client";

import { useState } from "react";
import { 
  Briefcase, 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  RotateCcw, 
  Loader2, 
  CheckCircle2, 
  ExternalLink, 
  X, 
  Sparkles, 
  Check, 
  Clock, 
  MessageSquare, 
  Layers, 
  HelpCircle,
  FileCheck2,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import WhatsAppIcon from "@/components/ui/WhatsAppIcon";
import { saveServicesDataAction, type ServicesData, type ServiceItem } from "@/actions/services.actions";

export default function ServicesEditor({ initialData }: { initialData: ServicesData }) {
  const [data, setData] = useState<ServicesData>(initialData);
  const [activeTab, setActiveTab] = useState<"services" | "hero">("services");

  const [isSaving, setIsSaving] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modal states for Create / Edit Service
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [serviceForm, setServiceForm] = useState<ServiceItem>({
    id: "",
    title: "",
    category: "",
    desc: "",
    features: [""],
    timeline: "Processed within 3 to 5 business days",
    waMessage: "Hi Coaches Akash & Tanvi, I would like to inquire regarding this service."
  });

  // Delete Confirmation Modal State
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Live Popup Notification Modal for Admin
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
  const persistData = async (nextData: ServicesData, successMsg = "Services published live!") => {
    setIsSaving(true);
    setErrorMessage(null);
    setData(nextData);

    try {
      // 1. Try Server Action
      const actionRes = await saveServicesDataAction(nextData);
      if (actionRes.success) {
        playSuccessChime();
        setSuccessToast(successMsg);
        setTimeout(() => setSuccessToast(null), 4000);
        return true;
      }

      // 2. Fallback to API route
      const res = await fetch("/api/admin/services", {
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

  // Open Add Service Modal
  const handleOpenAddModal = () => {
    setEditingServiceId(null);
    setServiceForm({
      id: `service-${Date.now()}`,
      title: "",
      category: "Accreditation & Sanctioning",
      desc: "",
      features: [""],
      timeline: "Processed within 3 to 5 business days",
      waMessage: "Hi Coaches Akash & Tanvi, I would like to apply for this federation service."
    });
    setIsModalOpen(true);
  };

  // Open Edit Service Modal
  const handleOpenEditModal = (serv: ServiceItem) => {
    setEditingServiceId(serv.id);
    setServiceForm({
      ...serv,
      features: serv.features && serv.features.length > 0 ? [...serv.features] : [""]
    });
    setIsModalOpen(true);
  };

  // Save Service from Modal
  const handleSaveModalService = async () => {
    if (!serviceForm.title.trim()) {
      alert("Please enter a service title.");
      return;
    }

    const cleanFeatures = serviceForm.features.map(f => f.trim()).filter(Boolean);
    const finalItem: ServiceItem = {
      ...serviceForm,
      features: cleanFeatures.length > 0 ? cleanFeatures : ["Official certificate issued"]
    };

    let nextServices: ServiceItem[];
    if (editingServiceId) {
      nextServices = data.services.map(s => s.id === editingServiceId ? finalItem : s);
    } else {
      nextServices = [...data.services, finalItem];
    }

    const nextData = { ...data, services: nextServices };
    const ok = await persistData(nextData, editingServiceId ? "Service updated and published live!" : "New service created and published live!");

    if (ok) {
      setIsModalOpen(false);
      setLivePopup({
        isOpen: true,
        title: finalItem.title,
        subtitle: editingServiceId 
          ? "Service details updated on live /services page and WhatsApp desk."
          : "New service portfolio added to live /services page successfully!"
      });
    }
  };

  // Delete Service
  const handleConfirmDelete = async () => {
    if (!deleteConfirmId) return;
    const nextServices = data.services.filter(s => s.id !== deleteConfirmId);
    const nextData = { ...data, services: nextServices };
    const ok = await persistData(nextData, "Service permanently removed from live website!");
    if (ok) {
      setDeleteConfirmId(null);
    }
  };

  // Save Hero & CTA Section
  const handleSaveHeroAndCta = async () => {
    const ok = await persistData(data, "Header and Secretariat CTA updated live!");
    if (ok) {
      setLivePopup({
        isOpen: true,
        title: data.hero.title + " " + data.hero.subtitle,
        subtitle: "Header banner and Secretariat WhatsApp CTA updated live across website."
      });
    }
  };

  // Dynamic Features input helpers in modal
  const handleFeatureChange = (index: number, val: string) => {
    const newFeats = [...serviceForm.features];
    newFeats[index] = val;
    setServiceForm({ ...serviceForm, features: newFeats });
  };

  const handleAddFeatureField = () => {
    setServiceForm({ ...serviceForm, features: [...serviceForm.features, ""] });
  };

  const handleRemoveFeatureField = (index: number) => {
    const newFeats = serviceForm.features.filter((_, i) => i !== index);
    setServiceForm({ ...serviceForm, features: newFeats.length > 0 ? newFeats : [""] });
  };

  return (
    <div className="flex flex-col gap-8 relative">
      
      {/* ── Top Action Header Bar ── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-gym-primary/30 bg-gym-primary/10 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-gym-primary mb-2">
            <Briefcase className="h-3.5 w-3.5" />
            <span>Public Website CMS</span>
          </div>
          <h2 className="font-heading text-3xl font-bold uppercase text-white">
            Services & Accreditation <span className="text-gym-primary">Manager</span>
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Edit service offerings, license accreditation, pricing provisions, and WhatsApp inquiries on <span className="text-gym-primary">/services</span>.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/services"
            target="_blank"
            className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-gray-200 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
          >
            <span>View Live /services</span>
            <ExternalLink className="h-3.5 w-3.5 text-gym-primary" />
          </Link>

          <button
            type="button"
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-gym-primary to-gym-red px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-[0_0_20px_rgba(230,80,27,0.4)] hover:brightness-110 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add New Service</span>
          </button>
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
          onClick={() => setActiveTab("services")}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === "services"
              ? "border-gym-primary text-gym-primary bg-gym-primary/5"
              : "border-transparent text-gray-400 hover:text-white"
          }`}
        >
          <Layers className="h-4 w-4" />
          <span>Services Portfolio ({data.services.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("hero")}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === "hero"
              ? "border-gym-primary text-gym-primary bg-gym-primary/5"
              : "border-transparent text-gray-400 hover:text-white"
          }`}
        >
          <HelpCircle className="h-4 w-4" />
          <span>Hero Header & Helpdesk CTA</span>
        </button>
      </div>

      {/* ══════════════ TAB 1: SERVICES PORTFOLIO ══════════════ */}
      {activeTab === "services" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Showing {data.services.length} accredited federation services</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              Live on /services
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.services.map((serv, index) => (
              <div
                key={serv.id}
                className="group relative rounded-3xl border border-white/10 bg-[#120402]/80 p-6 backdrop-blur-xl hover:border-gym-primary/50 transition-all duration-300 flex flex-col justify-between shadow-xl"
              >
                <div>
                  {/* Top Bar: Category & Actions */}
                  <div className="flex items-center justify-between gap-2 mb-3 pb-3 border-b border-white/10">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gym-primary truncate">
                      {serv.category}
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(serv)}
                        title="Edit Service"
                        className="p-2 rounded-xl border border-white/10 bg-white/5 text-gray-300 hover:text-white hover:border-gym-primary/50 hover:bg-gym-primary/15 transition-all cursor-pointer"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmId(serv.id)}
                        title="Delete Service"
                        className="p-2 rounded-xl border border-red-500/20 bg-red-950/20 text-red-400 hover:bg-red-600 hover:text-white transition-all cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="font-heading text-xl font-bold uppercase text-white group-hover:text-gym-primary transition-colors mb-2">
                    {serv.title}
                  </h3>

                  <p className="text-xs text-gray-300 leading-relaxed line-clamp-3 mb-4">
                    {serv.desc}
                  </p>

                  {/* Features List */}
                  <div className="space-y-1.5 mb-4">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      Provisions ({serv.features?.length || 0}):
                    </div>
                    {serv.features?.slice(0, 3).map((f, i) => (
                      <div key={i} className="flex items-start gap-2 text-[11px] text-gray-300 truncate">
                        <CheckCircle2 className="h-3 w-3 text-emerald-400 mt-0.5 shrink-0" />
                        <span className="truncate">{f}</span>
                      </div>
                    ))}
                    {(serv.features?.length || 0) > 3 && (
                      <span className="text-[10px] text-gray-500 italic pl-5">
                        +{serv.features.length - 3} more provisions...
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10 flex flex-col gap-2">
                  <div className="text-[11px] font-medium text-gray-400 flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-gym-primary" />
                    <span>{serv.timeline}</span>
                  </div>

                  <div className="text-[11px] text-gray-400 truncate flex items-center gap-1.5">
                    <WhatsAppIcon variant="badge" className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">WA: "{serv.waMessage}"</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════ TAB 2: HERO HEADER & HELPDESK CTA ══════════════ */}
      {activeTab === "hero" && (
        <div className="space-y-8 max-w-4xl">
          {/* Hero Section Card */}
          <div className="rounded-3xl border border-white/10 bg-[#120402]/80 p-6 sm:p-8 backdrop-blur-xl shadow-xl">
            <h3 className="font-heading text-lg font-bold uppercase text-white mb-4 pb-3 border-b border-white/10 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-gym-primary" />
              <span>Page Hero Header (/services)</span>
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1">
                  Top Pill Badge
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
                  Hero Subtitle Description
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

          {/* Secretariat WhatsApp CTA Card */}
          <div className="rounded-3xl border border-white/10 bg-[#120402]/80 p-6 sm:p-8 backdrop-blur-xl shadow-xl">
            <h3 className="font-heading text-lg font-bold uppercase text-white mb-4 pb-3 border-b border-white/10 flex items-center gap-2">
              <WhatsAppIcon variant="badge" className="h-5 w-5" />
              <span>Bottom Secretariat Helpdesk CTA</span>
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
                onClick={handleSaveHeroAndCta}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-gym-primary to-gym-red px-6 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-lg hover:brightness-110 cursor-pointer disabled:opacity-60"
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                <span>Save Header & CTA Live</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════ MODAL: ADD / EDIT SERVICE ══════════════ */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-2xl rounded-3xl border border-gym-primary/40 bg-[#140402] p-6 sm:p-8 shadow-2xl my-8">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
              <div className="flex items-center gap-2 text-gym-primary">
                <Briefcase className="h-5 w-5" />
                <h3 className="font-heading text-lg sm:text-xl font-bold uppercase text-white">
                  {editingServiceId ? "Edit Service Offering" : "Add New Federation Service"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1">
                  Service Title *
                </label>
                <input
                  type="text"
                  value={serviceForm.title}
                  onChange={(e) => setServiceForm({ ...serviceForm, title: e.target.value })}
                  placeholder="e.g. Athlete Sanctioning & National IPF ID"
                  className="w-full rounded-xl border border-white/15 bg-black/60 px-4 py-2.5 text-sm text-white focus:border-gym-primary focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1">
                    Category Tag *
                  </label>
                  <input
                    type="text"
                    value={serviceForm.category}
                    onChange={(e) => setServiceForm({ ...serviceForm, category: e.target.value })}
                    placeholder="e.g. Individual Competitor Service"
                    className="w-full rounded-xl border border-white/15 bg-black/60 px-4 py-2.5 text-sm text-white focus:border-gym-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1">
                    Processing Timeline *
                  </label>
                  <input
                    type="text"
                    value={serviceForm.timeline}
                    onChange={(e) => setServiceForm({ ...serviceForm, timeline: e.target.value })}
                    placeholder="e.g. Processed within 3 to 5 business days"
                    className="w-full rounded-xl border border-white/15 bg-black/60 px-4 py-2.5 text-sm text-white focus:border-gym-primary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1">
                  Full Description *
                </label>
                <textarea
                  rows={3}
                  value={serviceForm.desc}
                  onChange={(e) => setServiceForm({ ...serviceForm, desc: e.target.value })}
                  placeholder="Detailed description of the service and its benefits..."
                  className="w-full rounded-xl border border-white/15 bg-black/60 px-4 py-2.5 text-sm text-white focus:border-gym-primary focus:outline-none"
                />
              </div>

              {/* Provisions / Features List */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">
                    Included Provisions / Bullet Points
                  </label>
                  <button
                    type="button"
                    onClick={handleAddFeatureField}
                    className="inline-flex items-center gap-1 text-[11px] font-bold uppercase text-gym-primary hover:underline cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Bullet</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {serviceForm.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                      <input
                        type="text"
                        value={feat}
                        onChange={(e) => handleFeatureChange(idx, e.target.value)}
                        placeholder={`Provision point #${idx + 1}`}
                        className="flex-1 rounded-xl border border-white/15 bg-black/60 px-3 py-2 text-xs text-white focus:border-gym-primary focus:outline-none"
                      />
                      {serviceForm.features.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveFeatureField(idx)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-white/5 cursor-pointer"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1">
                  Pre-filled WhatsApp Message *
                </label>
                <input
                  type="text"
                  value={serviceForm.waMessage}
                  onChange={(e) => setServiceForm({ ...serviceForm, waMessage: e.target.value })}
                  placeholder="Hi Coaches Akash & Tanvi, I would like to inquire..."
                  className="w-full rounded-xl border border-white/15 bg-black/60 px-4 py-2.5 text-sm text-white focus:border-gym-primary focus:outline-none"
                />
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 rounded-full border border-white/15 text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSaving}
                onClick={handleSaveModalService}
                className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-gym-primary text-xs font-bold uppercase tracking-wider text-white shadow-[0_0_20px_rgba(230,80,27,0.4)] hover:brightness-110 cursor-pointer disabled:opacity-60"
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                <span>{editingServiceId ? "Update & Publish Live" : "Add & Publish Live"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════ MODAL: DELETE CONFIRMATION ══════════════ */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl border border-red-500/40 bg-[#160503] p-6 sm:p-7 shadow-2xl">
            <div className="flex items-center gap-3 text-red-400 mb-4">
              <div className="p-3 rounded-2xl bg-red-950/60 border border-red-500/30">
                <Trash2 className="h-6 w-6 text-red-400" />
              </div>
              <div>
                <h4 className="font-heading text-lg font-bold uppercase text-white">Delete Service Offering?</h4>
                <p className="text-xs text-gray-400">This action will remove the service from /services.</p>
              </div>
            </div>

            <p className="text-sm text-gray-300 leading-relaxed mb-6">
              Are you sure you want to delete this service? It will be removed immediately from the public website.
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
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
                Services Published Live!
              </h3>

              <p className="text-xs text-gray-300 mt-2">
                {livePopup.subtitle}
              </p>

              <div className="mt-5 text-left rounded-2xl border border-white/15 bg-black/70 p-4 space-y-1">
                <div className="text-[10px] font-bold uppercase tracking-widest text-gym-primary">
                  Service Portfolio
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
                  href="/services"
                  target="_blank"
                  className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-6 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-lg transition-all cursor-pointer"
                >
                  <span>View Public /services Page</span>
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
