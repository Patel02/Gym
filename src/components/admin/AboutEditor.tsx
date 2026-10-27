"use client";

import { useState } from "react";
import { 
  Award, 
  Building2, 
  Calendar, 
  Check, 
  Clock, 
  Globe2, 
  Landmark, 
  Layers, 
  Loader2, 
  Mail, 
  MapPin, 
  Phone, 
  Plus, 
  RotateCcw, 
  Save, 
  ShieldCheck, 
  Sparkles, 
  Trash2, 
  Trophy, 
  Zap 
} from "lucide-react";
import Link from "next/link";

export interface AboutData {
  hero: {
    badge: string;
    title: string;
    subtitle: string;
    description: string;
  };
  mission: {
    motto: string;
    missionStatement: string;
    visionStatement: string;
    pillars: Array<{
      id: string;
      title: string;
      desc: string;
      icon: string;
    }>;
  };
  timeline: Array<{
    year: string;
    title: string;
    desc: string;
  }>;
  honors: Array<{
    id: string;
    count: string;
    title: string;
    desc: string;
  }>;
  governance: {
    headquarters: string;
    secretariatEmail: string;
    secretariatPhone: string;
    affiliatedUnitsCount: string;
    registeredAthletes: string;
    presidentOffice: string;
    secgenOffice: string;
  };
}

export default function AboutEditor({ initialData }: { initialData: AboutData }) {
  const [data, setData] = useState<AboutData>(initialData);
  const [activeTab, setActiveTab] = useState<"hero" | "mission" | "timeline" | "honors" | "governance">("hero");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Tab handlers
  const handleHeroChange = (field: keyof AboutData["hero"], value: string) => {
    setData((prev) => ({
      ...prev,
      hero: { ...prev.hero, [field]: value }
    }));
  };

  const handleMissionChange = (field: keyof AboutData["mission"], value: any) => {
    setData((prev) => ({
      ...prev,
      mission: { ...prev.mission, [field]: value }
    }));
  };

  const handlePillarChange = (index: number, field: "title" | "desc", value: string) => {
    setData((prev) => {
      const newPillars = [...prev.mission.pillars];
      newPillars[index] = { ...newPillars[index], [field]: value };
      return {
        ...prev,
        mission: { ...prev.mission, pillars: newPillars }
      };
    });
  };

  const handleTimelineChange = (index: number, field: "year" | "title" | "desc", value: string) => {
    setData((prev) => {
      const newTimeline = [...prev.timeline];
      newTimeline[index] = { ...newTimeline[index], [field]: value };
      return { ...prev, timeline: newTimeline };
    });
  };

  const addTimelineItem = () => {
    setData((prev) => ({
      ...prev,
      timeline: [
        ...prev.timeline,
        { year: "2026", title: "New Historic Milestone", desc: "Description of national or international achievement." }
      ]
    }));
  };

  const removeTimelineItem = (index: number) => {
    if (data.timeline.length <= 1) return;
    setData((prev) => ({
      ...prev,
      timeline: prev.timeline.filter((_, idx) => idx !== index)
    }));
  };

  const handleHonorChange = (index: number, field: "count" | "title" | "desc", value: string) => {
    setData((prev) => {
      const newHonors = [...prev.honors];
      newHonors[index] = { ...newHonors[index], [field]: value };
      return { ...prev, honors: newHonors };
    });
  };

  const handleGovernanceChange = (field: keyof AboutData["governance"], value: string) => {
    setData((prev) => ({
      ...prev,
      governance: { ...prev.governance, [field]: value }
    }));
  };

  // Reset to initial
  const handleReset = () => {
    if (confirm("Reset all fields back to initial values?")) {
      setData(initialData);
      setSaveSuccess(false);
      setErrorMessage(null);
    }
  };

  // Save changes
  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/admin/about", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ about: data })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save");
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || "An error occurred while saving.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full flex flex-col gap-8">
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-gym-primary/30 bg-gym-primary/10 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-gym-primary mb-2">
            <Sparkles className="h-3.5 w-3.5" />
            Live Content Management
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl font-black uppercase text-white tracking-wide">
            Manage <span className="text-gym-primary">About Federation</span> Page
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Update official heritage, presidential awards, governance contacts, and milestones shown on{" "}
            <Link href="/about" target="_blank" className="text-gym-primary underline hover:text-white transition-colors">
              /about
            </Link>.
          </p>
        </div>

        <div className="flex items-center gap-3 self-stretch sm:self-auto justify-end">
          <button
            type="button"
            onClick={handleReset}
            disabled={isSaving}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-gray-300 hover:bg-white/10 hover:text-white transition-all cursor-pointer disabled:opacity-50"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 rounded-xl bg-gym-primary px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-[0_0_20px_rgba(230,80,27,0.4)] hover:brightness-110 transition-all cursor-pointer disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : saveSuccess ? (
              <>
                <Check className="h-4 w-4" />
                Saved Live!
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>

      {/* Notifications */}
      {saveSuccess && (
        <div className="flex items-center gap-3 rounded-xl border border-green-500/30 bg-green-500/10 p-4 text-sm font-semibold text-green-400">
          <Check className="h-5 w-5 shrink-0 text-green-400" />
          <span>About Federation page updated successfully! Public page and cache revalidated.</span>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm font-semibold text-red-400">
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-white/10 overflow-x-auto pb-2 scrollbar-none">
        {[
          { id: "hero", label: "1. Hero & Branding", icon: Sparkles },
          { id: "mission", label: "2. Mission & 4 Pillars", icon: ShieldCheck },
          { id: "timeline", label: "3. Historic Milestones", icon: Calendar },
          { id: "honors", label: "4. Hall of Fame & Honors", icon: Trophy },
          { id: "governance", label: "5. Secretariat & Directory", icon: Building2 },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2.5 whitespace-nowrap rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                isActive
                  ? "bg-gym-primary text-white shadow-[0_0_15px_rgba(230,80,27,0.35)]"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: HERO & BRANDING */}
      {activeTab === "hero" && (
        <div className="flex flex-col gap-6 rounded-2xl border border-white/10 bg-[#110402]/60 p-6 sm:p-8 backdrop-blur-xl">
          <div className="flex items-center gap-2 text-gym-primary text-xs font-bold uppercase tracking-widest">
            <Sparkles className="h-4 w-4" /> Top Prestige Header & Introduction
          </div>

          <div className="grid grid-cols-1 gap-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                Top Badge Label
              </label>
              <input
                type="text"
                value={data.hero.badge}
                onChange={(e) => handleHeroChange("badge", e.target.value)}
                className="w-full rounded-xl border border-white/15 bg-black/50 px-4 py-2.5 text-sm text-white focus:border-gym-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                Main Page Title
              </label>
              <input
                type="text"
                value={data.hero.title}
                onChange={(e) => handleHeroChange("title", e.target.value)}
                className="w-full rounded-xl border border-white/15 bg-black/50 px-4 py-2.5 text-sm text-white focus:border-gym-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                Subtitle / Authority Tagline
              </label>
              <input
                type="text"
                value={data.hero.subtitle}
                onChange={(e) => handleHeroChange("subtitle", e.target.value)}
                className="w-full rounded-xl border border-white/15 bg-black/50 px-4 py-2.5 text-sm text-white focus:border-gym-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                Detailed Lead Summary
              </label>
              <textarea
                rows={4}
                value={data.hero.description}
                onChange={(e) => handleHeroChange("description", e.target.value)}
                className="w-full rounded-xl border border-white/15 bg-black/50 p-4 text-sm text-white focus:border-gym-primary focus:outline-none leading-relaxed"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MISSION & 4 PILLARS */}
      {activeTab === "mission" && (
        <div className="flex flex-col gap-8 rounded-2xl border border-white/10 bg-[#110402]/60 p-6 sm:p-8 backdrop-blur-xl">
          <div className="flex items-center gap-2 text-gym-primary text-xs font-bold uppercase tracking-widest">
            <ShieldCheck className="h-4 w-4" /> Core Mission, Vision & Standards
          </div>

          <div className="grid grid-cols-1 gap-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                Federation Motto
              </label>
              <input
                type="text"
                value={data.mission.motto}
                onChange={(e) => handleMissionChange("motto", e.target.value)}
                className="w-full rounded-xl border border-white/15 bg-black/50 px-4 py-2.5 text-sm text-white focus:border-gym-primary focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                  Mission Statement
                </label>
                <textarea
                  rows={4}
                  value={data.mission.missionStatement}
                  onChange={(e) => handleMissionChange("missionStatement", e.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-black/50 p-3.5 text-sm text-white focus:border-gym-primary focus:outline-none leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                  Vision Statement
                </label>
                <textarea
                  rows={4}
                  value={data.mission.visionStatement}
                  onChange={(e) => handleMissionChange("visionStatement", e.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-black/50 p-3.5 text-sm text-white focus:border-gym-primary focus:outline-none leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* 4 Pillars */}
          <div className="flex flex-col gap-4 border-t border-white/10 pt-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">4 Core Pillars & Principles</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.mission.pillars.map((pillar, idx) => (
                <div key={pillar.id} className="p-4 rounded-xl border border-white/10 bg-black/40 flex flex-col gap-3">
                  <div className="text-[11px] font-bold uppercase tracking-widest text-gym-primary">
                    Pillar 0{idx + 1}
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-400 mb-1">Title</label>
                    <input
                      type="text"
                      value={pillar.title}
                      onChange={(e) => handlePillarChange(idx, "title", e.target.value)}
                      className="w-full rounded-lg border border-white/10 bg-black/50 px-3 py-1.5 text-sm text-white focus:border-gym-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-400 mb-1">Description</label>
                    <textarea
                      rows={2}
                      value={pillar.desc}
                      onChange={(e) => handlePillarChange(idx, "desc", e.target.value)}
                      className="w-full rounded-lg border border-white/10 bg-black/50 p-2.5 text-xs text-white focus:border-gym-primary focus:outline-none leading-relaxed"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: TIMELINE & MILESTONES */}
      {activeTab === "timeline" && (
        <div className="flex flex-col gap-6 rounded-2xl border border-white/10 bg-[#110402]/60 p-6 sm:p-8 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gym-primary text-xs font-bold uppercase tracking-widest">
              <Calendar className="h-4 w-4" /> Historic Milestones (1975 — 2026)
            </div>

            <button
              type="button"
              onClick={addTimelineItem}
              className="flex items-center gap-1.5 rounded-lg border border-gym-primary/40 bg-gym-primary/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-gym-primary hover:bg-gym-primary hover:text-white transition-all cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Milestone
            </button>
          </div>

          <div className="flex flex-col gap-4">
            {data.timeline.map((item, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-white/10 bg-black/40 flex flex-col sm:flex-row items-start gap-4">
                <div className="w-full sm:w-28 shrink-0">
                  <label className="block text-[11px] font-semibold text-gray-400 mb-1">Year</label>
                  <input
                    type="text"
                    value={item.year}
                    onChange={(e) => handleTimelineChange(idx, "year", e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-black/50 px-3 py-1.5 font-heading text-lg font-bold text-gym-primary focus:border-gym-primary focus:outline-none"
                  />
                </div>

                <div className="w-full flex-1 flex flex-col gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-400 mb-1">Milestone Title</label>
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => handleTimelineChange(idx, "title", e.target.value)}
                      className="w-full rounded-lg border border-white/10 bg-black/50 px-3 py-1.5 text-sm font-bold text-white focus:border-gym-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-400 mb-1">Description</label>
                    <textarea
                      rows={2}
                      value={item.desc}
                      onChange={(e) => handleTimelineChange(idx, "desc", e.target.value)}
                      className="w-full rounded-lg border border-white/10 bg-black/50 p-2 text-xs text-gray-300 focus:border-gym-primary focus:outline-none leading-relaxed"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => removeTimelineItem(idx)}
                  className="self-end sm:self-center p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                  title="Remove milestone"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: HALL OF FAME & HONORS */}
      {activeTab === "honors" && (
        <div className="flex flex-col gap-6 rounded-2xl border border-white/10 bg-[#110402]/60 p-6 sm:p-8 backdrop-blur-xl">
          <div className="flex items-center gap-2 text-gym-primary text-xs font-bold uppercase tracking-widest">
            <Trophy className="h-4 w-4" /> Presidential Awards & Medal Tallies
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {data.honors.map((honor, idx) => (
              <div key={honor.id} className="p-5 rounded-xl border border-white/10 bg-black/40 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Award 0{idx + 1}</span>
                  <Trophy className="h-4 w-4 text-gym-primary" />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-400 mb-1">Count</label>
                    <input
                      type="text"
                      value={honor.count}
                      onChange={(e) => handleHonorChange(idx, "count", e.target.value)}
                      className="w-full rounded-lg border border-white/10 bg-black/50 px-3 py-1.5 font-heading text-xl font-bold text-gym-primary focus:border-gym-primary focus:outline-none"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[11px] font-semibold text-gray-400 mb-1">Title</label>
                    <input
                      type="text"
                      value={honor.title}
                      onChange={(e) => handleHonorChange(idx, "title", e.target.value)}
                      className="w-full rounded-lg border border-white/10 bg-black/50 px-3 py-1.5 text-sm font-bold text-white focus:border-gym-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-400 mb-1">Description / Conferred By</label>
                  <textarea
                    rows={2}
                    value={honor.desc}
                    onChange={(e) => handleHonorChange(idx, "desc", e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-black/50 p-2.5 text-xs text-gray-300 focus:border-gym-primary focus:outline-none leading-relaxed"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: GOVERNANCE & SECRETARIAT */}
      {activeTab === "governance" && (
        <div className="flex flex-col gap-6 rounded-2xl border border-white/10 bg-[#110402]/60 p-6 sm:p-8 backdrop-blur-xl">
          <div className="flex items-center gap-2 text-gym-primary text-xs font-bold uppercase tracking-widest">
            <Building2 className="h-4 w-4" /> National Secretariat & Administration
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                National Secretariat Address
              </label>
              <input
                type="text"
                value={data.governance.headquarters}
                onChange={(e) => handleGovernanceChange("headquarters", e.target.value)}
                className="w-full rounded-xl border border-white/15 bg-black/50 px-4 py-2.5 text-sm text-white focus:border-gym-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                Secretariat Official Email
              </label>
              <input
                type="email"
                value={data.governance.secretariatEmail}
                onChange={(e) => handleGovernanceChange("secretariatEmail", e.target.value)}
                className="w-full rounded-xl border border-white/15 bg-black/50 px-4 py-2.5 text-sm text-white focus:border-gym-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                Secretariat Telephone
              </label>
              <input
                type="text"
                value={data.governance.secretariatPhone}
                onChange={(e) => handleGovernanceChange("secretariatPhone", e.target.value)}
                className="w-full rounded-xl border border-white/15 bg-black/50 px-4 py-2.5 text-sm text-white focus:border-gym-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                Affiliated State Associations & Boards
              </label>
              <input
                type="text"
                value={data.governance.affiliatedUnitsCount}
                onChange={(e) => handleGovernanceChange("affiliatedUnitsCount", e.target.value)}
                className="w-full rounded-xl border border-white/15 bg-black/50 px-4 py-2.5 text-sm text-white focus:border-gym-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                Registered Athletes Number
              </label>
              <input
                type="text"
                value={data.governance.registeredAthletes}
                onChange={(e) => handleGovernanceChange("registeredAthletes", e.target.value)}
                className="w-full rounded-xl border border-white/15 bg-black/50 px-4 py-2.5 text-sm text-white focus:border-gym-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                Office of the President
              </label>
              <input
                type="text"
                value={data.governance.presidentOffice}
                onChange={(e) => handleGovernanceChange("presidentOffice", e.target.value)}
                className="w-full rounded-xl border border-white/15 bg-black/50 px-4 py-2.5 text-sm text-white focus:border-gym-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                Office of the Secretary General
              </label>
              <input
                type="text"
                value={data.governance.secgenOffice}
                onChange={(e) => handleGovernanceChange("secgenOffice", e.target.value)}
                className="w-full rounded-xl border border-white/15 bg-black/50 px-4 py-2.5 text-sm text-white focus:border-gym-primary focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
