"use client";

import React, { useState, useMemo } from "react";
import {
  WeighInFormat,
  calculateCutDiagnostics,
  generateFiveDayHydrationPlan,
} from "@/lib/weigh-in-nutrition";
import { WeighInCutCalculator } from "./WeighInCutCalculator";
import { FiveDayWaterSchedule } from "./FiveDayWaterSchedule";
import { TwoHourRefeedTimeline } from "./TwoHourRefeedTimeline";
import { OfficialNutritionPdfPrint } from "./OfficialNutritionPdfPrint";
import {
  Scale,
  Droplets,
  Clock,
  FileText,
  Sparkles,
  Flame,
  Shield,
  Apple,
} from "lucide-react";

interface WeighInPlannerMasterProps {
  initialAthleteName?: string;
  initialCurrentWeight?: number;
  initialTargetWeight?: number;
}

export function WeighInPlannerMaster({
  initialAthleteName = "Patel Rakesh",
  initialCurrentWeight = 85.5,
  initialTargetWeight = 83,
}: WeighInPlannerMasterProps) {
  const [activeTab, setActiveTab] = useState<"ANALYZER" | "WATER_SCHEDULE" | "REFEED" | "PRINT_SHEET">("ANALYZER");
  const [athleteName, setAthleteName] = useState<string>(initialAthleteName);
  const [currentWeight, setCurrentWeight] = useState<number>(initialCurrentWeight);
  const [targetWeight, setTargetWeight] = useState<number>(initialTargetWeight);
  const [format, setFormat] = useState<WeighInFormat>("IPF_2_HOUR");

  // Core Diagnostics
  const diagnostics = useMemo(() => {
    return calculateCutDiagnostics(currentWeight, targetWeight, format);
  }, [currentWeight, targetWeight, format]);

  // 5-Day Schedule
  const fiveDaySchedule = useMemo(() => {
    return generateFiveDayHydrationPlan(currentWeight, diagnostics.cutWeightKg, format);
  }, [currentWeight, diagnostics.cutWeightKg, format]);

  // Quick Presets
  const applyPreset = (preset: {
    name: string;
    current: number;
    target: number;
  }) => {
    setAthleteName(preset.name);
    setCurrentWeight(preset.current);
    setTargetWeight(preset.target);
  };

  return (
    <div className="space-y-8">
      {/* ── TOP HERO HEADER (Dark Luxury Olympic Aesthetics) ── */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-[#180803] via-[#0e0301] to-[#120402] p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        <div className="absolute -right-16 -top-16 h-60 w-60 rounded-full bg-gym-primary/15 blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-gym-primary/40 bg-gym-primary/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-gym-primary">
              <Apple className="h-3.5 w-3.5 fill-current" />
              <span>OFFICIAL SPORTS NUTRITION &amp; WEIGH-IN CLINIC</span>
            </div>

            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-wider text-white">
              Weigh-In Water Cut <span className="text-gym-primary">&amp; Rapid Refeed</span>
            </h1>

            <p className="text-sm font-medium text-zinc-400 max-w-2xl leading-relaxed">
              Scientific aldosterone water loading, low-residue gut clearance, and minute-by-minute post weigh-in isotonic glycogen refeed. Formulated by Coach Akash &amp; Coach Tanvi.
            </p>
          </div>

          {/* Quick Presets */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 shrink-0">
              Presets:
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() =>
                  applyPreset({
                    name: "Patel Rakesh",
                    current: 85.5,
                    target: 83,
                  })
                }
                className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-bold text-zinc-300 hover:text-white transition-all cursor-pointer"
              >
                83kg Class (-2.5kg Cut)
              </button>

              <button
                onClick={() =>
                  applyPreset({
                    name: "Vikramjit Singh",
                    current: 96.0,
                    target: 93,
                  })
                }
                className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-bold text-zinc-300 hover:text-white transition-all cursor-pointer"
              >
                93kg Class (-3.0kg Cut)
              </button>

              <button
                onClick={() =>
                  applyPreset({
                    name: "Ananya Deshmukh",
                    current: 70.8,
                    target: 69,
                  })
                }
                className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-bold text-zinc-300 hover:text-white transition-all cursor-pointer"
              >
                69kg Women (-1.8kg Cut)
              </button>
            </div>
          </div>
        </div>

        {/* Athlete Name Customization */}
        <div className="mt-6 pt-6 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2">
            <label className="text-zinc-400 font-bold uppercase text-[10px] shrink-0">
              Competitor Name:
            </label>
            <input
              type="text"
              value={athleteName}
              onChange={(e) => setAthleteName(e.target.value)}
              className="bg-black/50 border border-white/15 rounded-lg px-3 py-1.5 text-white font-bold text-xs focus:outline-none focus:border-gym-primary"
            />
          </div>

          <div className="flex items-center gap-4 text-zinc-400 text-xs">
            <span>
              Target Category: <strong className="text-white">{targetWeight} KG</strong>
            </span>
            <span>•</span>
            <span>
              Deficit: <strong className="text-gym-primary">{diagnostics.cutWeightKg} KG ({diagnostics.cutPercentage}%)</strong>
            </span>
          </div>
        </div>
      </div>

      {/* ── NAVIGATION TABS ── */}
      <div className="flex border-b border-white/10 gap-2 sm:gap-4 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab("ANALYZER")}
          className={`flex items-center gap-2 pb-3 px-3 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
            activeTab === "ANALYZER"
              ? "border-gym-primary text-gym-primary"
              : "border-transparent text-zinc-400 hover:text-white"
          }`}
        >
          <Scale className="h-4 w-4" />
          <span>Cut &amp; Safety Analyzer</span>
        </button>

        <button
          onClick={() => setActiveTab("WATER_SCHEDULE")}
          className={`flex items-center gap-2 pb-3 px-3 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
            activeTab === "WATER_SCHEDULE"
              ? "border-gym-primary text-gym-primary"
              : "border-transparent text-zinc-400 hover:text-white"
          }`}
        >
          <Droplets className="h-4 w-4" />
          <span>5-Day Water Loading Protocol</span>
        </button>

        <button
          onClick={() => setActiveTab("REFEED")}
          className={`flex items-center gap-2 pb-3 px-3 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
            activeTab === "REFEED"
              ? "border-gym-primary text-gym-primary"
              : "border-transparent text-zinc-400 hover:text-white"
          }`}
        >
          <Clock className="h-4 w-4" />
          <span>120-Minute Rapid Refeed Clock</span>
        </button>

        <button
          onClick={() => setActiveTab("PRINT_SHEET")}
          className={`flex items-center gap-2 pb-3 px-3 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
            activeTab === "PRINT_SHEET"
              ? "border-gym-primary text-gym-primary"
              : "border-transparent text-zinc-400 hover:text-white"
          }`}
        >
          <FileText className="h-4 w-4" />
          <span>Official Printable Refeed Sheet</span>
        </button>
      </div>

      {/* ── TAB CONTENT ── */}
      {activeTab === "ANALYZER" && (
        <WeighInCutCalculator
          currentWeight={currentWeight}
          setCurrentWeight={setCurrentWeight}
          targetWeight={targetWeight}
          setTargetWeight={setTargetWeight}
          format={format}
          setFormat={setFormat}
          diagnostics={diagnostics}
        />
      )}

      {activeTab === "WATER_SCHEDULE" && (
        <FiveDayWaterSchedule
          schedule={fiveDaySchedule}
          bodyweight={currentWeight}
          format={format}
        />
      )}

      {activeTab === "REFEED" && (
        <TwoHourRefeedTimeline
          refeedVolumeLiters={diagnostics.rehydrationFluidNeededLiters}
        />
      )}

      {activeTab === "PRINT_SHEET" && (
        <OfficialNutritionPdfPrint
          athleteName={athleteName}
          diagnostics={diagnostics}
          schedule={fiveDaySchedule}
        />
      )}
    </div>
  );
}
