"use client";

import { useState } from "react";
import { Check, Loader2, RotateCcw, Save, Sparkles, TrendingUp } from "lucide-react";
import Link from "next/link";

interface StatItem {
  id: string;
  value: string;
  suffix: string;
  label: string;
}

const DEFAULT_STATS: StatItem[] = [
  { id: "years", value: "50", suffix: "+", label: "Years of Heritage" },
  { id: "athletes", value: "10,000", suffix: "+", label: "Registered Athletes" },
  { id: "medals", value: "900", suffix: "+", label: "International Medals" },
  { id: "states", value: "37", suffix: "+", label: "Affiliated State Units" }
];

export function StatsEditor({ initialStats }: { initialStats: StatItem[] }) {
  const [stats, setStats] = useState<StatItem[]>(
    initialStats && initialStats.length > 0 ? initialStats : DEFAULT_STATS
  );
  const [isSaving, setIsSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleChange = (index: number, field: keyof StatItem, val: string) => {
    setStats((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: val };
      return next;
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSavedMessage(null);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/admin/stats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stats }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save stats");
      }

      setSavedMessage("Public Federation Stats updated successfully!");
      setTimeout(() => setSavedMessage(null), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || "An error occurred while saving.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetDefaults = () => {
    if (confirm("Reset stats back to official default values?")) {
      setStats(DEFAULT_STATS);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[#0d0d0d] p-5 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gym-primary/15 text-gym-primary border border-gym-primary/30">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-heading text-lg font-bold uppercase tracking-wider text-white">
              Public Federation Metrics
            </h3>
            <p className="text-xs text-gray-400">
              Changes saved here reflect live on the homepage PowerStats section.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-wider text-gray-300 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 rounded-full bg-gradient-to-r from-gym-primary to-gym-red px-6 py-2 text-xs font-bold uppercase tracking-widest text-white shadow-[0_0_15px_rgba(230,80,27,0.4)] hover:scale-105 hover:shadow-[0_0_25px_rgba(230,80,27,0.7)] transition-all cursor-pointer disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Save Live Stats</span>
              </>
            )}
          </button>
        </div>
      </div>

      {savedMessage && (
        <div className="flex items-center gap-2 rounded-xl border border-green-500/30 bg-green-500/10 p-4 text-xs font-bold uppercase tracking-wider text-green-400 shadow-lg">
          <Check className="h-4 w-4 shrink-0" />
          <span>{savedMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-xs font-bold uppercase tracking-wider text-red-400 shadow-lg">
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Editor Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {stats.map((stat, idx) => (
          <div
            key={stat.id}
            className="rounded-2xl border border-white/10 bg-[#0d0d0d] p-6 shadow-xl transition-all hover:border-gym-primary/40 flex flex-col gap-4"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-xs font-bold uppercase tracking-widest text-gym-primary">
                Stat #{idx + 1}
              </span>
              <span className="text-[10px] uppercase font-bold text-gray-500 font-mono">
                ID: {stat.id}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2 flex flex-col gap-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                  Value (Number)
                </label>
                <input
                  type="text"
                  value={stat.value}
                  onChange={(e) => handleChange(idx, "value", e.target.value)}
                  placeholder="e.g. 50, 10,000"
                  className="rounded-lg border border-white/15 bg-black/60 px-3 py-2 text-base font-bold text-white placeholder:text-gray-600 focus:border-gym-primary focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                  Suffix
                </label>
                <input
                  type="text"
                  value={stat.suffix}
                  onChange={(e) => handleChange(idx, "suffix", e.target.value)}
                  placeholder="e.g. +, KG"
                  className="rounded-lg border border-white/15 bg-black/60 px-3 py-2 text-base font-bold text-gym-primary placeholder:text-gray-600 focus:border-gym-primary focus:outline-none"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                Display Label
              </label>
              <input
                type="text"
                value={stat.label}
                onChange={(e) => handleChange(idx, "label", e.target.value)}
                placeholder="e.g. YEARS OF HERITAGE"
                className="rounded-lg border border-white/15 bg-black/60 px-3 py-2 text-xs font-bold uppercase tracking-wider text-gray-200 placeholder:text-gray-600 focus:border-gym-primary focus:outline-none"
              />
            </div>

            {/* Micro Live Preview */}
            <div className="mt-2 rounded-xl border border-white/5 bg-black/40 p-4 text-center">
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 block mb-1">
                Live Preview
              </span>
              <div className="font-heading text-3xl font-bold uppercase text-white">
                {stat.value}
                <span className="text-gym-primary ml-0.5">{stat.suffix}</span>
              </div>
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mt-1">
                {stat.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Full Live Preview Section */}
      <div className="rounded-2xl border border-gym-primary/30 bg-[#110402]/80 p-6 md:p-8 backdrop-blur-xl shadow-2xl">
        <div className="mb-6 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-gym-primary" />
          <h4 className="font-heading text-xl font-bold uppercase tracking-wider text-white">
            Homepage Ribbon Preview
          </h4>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.id}
              className="rounded-xl border border-white/10 bg-black/50 p-5 text-center shadow-lg"
            >
              <div className="font-heading text-4xl lg:text-5xl font-black uppercase text-white">
                {stat.value}
                <span className="text-gym-primary ml-0.5">{stat.suffix}</span>
              </div>
              <div className="mt-2 text-xs font-bold uppercase tracking-[0.2em] text-gray-400">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
