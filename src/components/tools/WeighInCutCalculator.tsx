"use client";

import React from "react";
import {
  CutDiagnostics,
  WeighInFormat,
} from "@/lib/weigh-in-nutrition";
import {
  Scale,
  ShieldCheck,
  AlertTriangle,
  Flame,
  Droplets,
  Activity,
  Sparkles,
  Info,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from "lucide-react";

interface WeighInCutCalculatorProps {
  currentWeight: number;
  setCurrentWeight: (w: number) => void;
  targetWeight: number;
  setTargetWeight: (w: number) => void;
  format: WeighInFormat;
  setFormat: (f: WeighInFormat) => void;
  diagnostics: CutDiagnostics;
}

export function WeighInCutCalculator({
  currentWeight,
  setCurrentWeight,
  targetWeight,
  setTargetWeight,
  format,
  setFormat,
  diagnostics,
}: WeighInCutCalculatorProps) {
  // Safety Tier Styling
  const tierConfig = {
    SAFE: {
      label: "Safe / Optimal Cut",
      badgeColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      gaugeColor: "#10b981",
      icon: ShieldCheck,
    },
    MODERATE: {
      label: "Moderate / Standard Competition Cut",
      badgeColor: "bg-amber-500/20 text-amber-400 border-amber-500/30",
      gaugeColor: "#f59e0b",
      icon: Activity,
    },
    AGGRESSIVE: {
      label: "Aggressive / Elite Supervised Only",
      badgeColor: "bg-red-500/20 text-red-400 border-red-500/30",
      gaugeColor: "#ef4444",
      icon: AlertTriangle,
    },
    HAZARDOUS: {
      label: "Hazardous / Class Bump Advised",
      badgeColor: "bg-rose-950 text-rose-300 border-rose-500",
      gaugeColor: "#be123c",
      icon: AlertCircle,
    },
  }[diagnostics.safetyTier];

  const TierIcon = tierConfig.icon;

  // Arc gauge calculation (180 degree semi-circle)
  // Max percentage to display is 10%
  const gaugePercent = Math.min(100, (diagnostics.cutPercentage / 8) * 100);
  const radius = 80;
  const circumference = Math.PI * radius;
  const strokeDashoffset = circumference * (1 - gaugePercent / 100);

  return (
    <div className="space-y-8">
      {/* ── TOP CONTROL DECK: INPUTS & FORMAT ── */}
      <div className="rounded-2xl border border-white/10 bg-zinc-950 p-6 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Scale className="h-4 w-4 text-gym-primary" />
              <span className="text-xs font-bold uppercase tracking-widest text-gym-primary">
                Official Calibrated Scale Metrics
              </span>
            </div>
            <h3 className="text-lg font-bold uppercase tracking-wider text-white font-heading mt-0.5">
              Weight Cut &amp; Hydration Parameters
            </h3>
          </div>

          {/* Weigh-In Format Switcher */}
          <div className="flex items-center gap-1.5 bg-black/60 p-1.5 rounded-xl border border-white/10">
            <button
              onClick={() => setFormat("IPF_2_HOUR")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                format === "IPF_2_HOUR"
                  ? "bg-gym-primary text-white shadow-md shadow-orange-950"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              IPF 2-Hour (Strict)
            </button>
            <button
              onClick={() => setFormat("OPEN_24_HOUR")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                format === "OPEN_24_HOUR"
                  ? "bg-purple-600 text-white shadow-md shadow-purple-950"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              24-Hour Day Before
            </button>
          </div>
        </div>

        {/* Sliders & Numerical Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Current Walk-Around Bodyweight */}
          <div className="rounded-xl border border-white/10 bg-black/50 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Current Morning Weight (Walk-Around)
              </label>
              <div className="flex items-baseline gap-1">
                <input
                  type="number"
                  step="0.1"
                  min="40"
                  max="180"
                  value={currentWeight}
                  onChange={(e) => setCurrentWeight(parseFloat(e.target.value) || 83)}
                  className="w-20 bg-zinc-900 border border-white/20 rounded-lg px-2.5 py-1 text-center text-base font-bold text-white focus:outline-none focus:border-gym-primary"
                />
                <span className="text-xs font-black text-gym-primary">KG</span>
              </div>
            </div>
            <input
              type="range"
              min="45"
              max="150"
              step="0.2"
              value={currentWeight}
              onChange={(e) => setCurrentWeight(parseFloat(e.target.value))}
              className="w-full accent-gym-primary cursor-pointer"
            />
            <p className="text-[11px] text-zinc-500">
              Weighed naked immediately after waking up and morning urination.
            </p>
          </div>

          {/* Target Official Weight Class */}
          <div className="rounded-xl border border-white/10 bg-black/50 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Official Category Limit (Scale Ceiling)
              </label>
              <div className="flex items-baseline gap-1">
                <input
                  type="number"
                  step="0.5"
                  min="40"
                  max="180"
                  value={targetWeight}
                  onChange={(e) => setTargetWeight(parseFloat(e.target.value) || 83)}
                  className="w-20 bg-zinc-900 border border-white/20 rounded-lg px-2.5 py-1 text-center text-base font-bold text-white focus:outline-none focus:border-gym-primary"
                />
                <span className="text-xs font-black text-gym-primary">KG</span>
              </div>
            </div>
            <input
              type="range"
              min="43"
              max="140"
              step="0.5"
              value={targetWeight}
              onChange={(e) => setTargetWeight(parseFloat(e.target.value))}
              className="w-full accent-gym-primary cursor-pointer"
            />
            <div className="flex items-center gap-1.5 overflow-x-auto pt-0.5">
              {[59, 66, 74, 83, 93, 105, 120].map((kg) => (
                <button
                  key={kg}
                  onClick={() => setTargetWeight(kg)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-all ${
                    targetWeight === kg
                      ? "bg-gym-primary text-white font-black"
                      : "bg-white/5 text-zinc-400 hover:text-white"
                  }`}
                >
                  {kg}kg
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── SAFETY ARC GAUGE & METRIC TILES ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Semi-Circular Safety Gauge (5 Cols) */}
        <div className="lg:col-span-5 rounded-2xl border border-white/10 bg-zinc-950 p-6 flex flex-col items-center justify-between shadow-xl">
          <div className="w-full flex items-center justify-between border-b border-white/10 pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Cut Safety Index
            </span>
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[10px] font-semibold uppercase ${tierConfig.badgeColor}`}>
              <TierIcon className="h-3 w-3" />
              <span>{diagnostics.safetyTier}</span>
            </span>
          </div>

          {/* SVG Gauge Graphic */}
          <div className="relative my-4 flex flex-col items-center">
            <svg className="w-56 h-32">
              <path
                d="M 18 115 A 80 80 0 0 1 178 115"
                fill="none"
                stroke="#27272a"
                strokeWidth="14"
                strokeLinecap="round"
              />
              <path
                d="M 18 115 A 80 80 0 0 1 178 115"
                fill="none"
                stroke={tierConfig.gaugeColor}
                strokeWidth="14"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>

            <div className="text-center -mt-8">
              <div className="text-4xl font-black font-heading text-white">
                {diagnostics.cutPercentage}%
              </div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 block mt-0.5">
                Bodyweight Deficit
              </span>
            </div>
          </div>

          <div className="w-full rounded-xl bg-black/60 border border-white/10 p-3 text-center">
            <span className="text-xs font-bold text-white block">
              {tierConfig.label}
            </span>
            <span className="text-[11px] text-zinc-400 mt-0.5 block">
              {diagnostics.cutWeightKg} KG cut required to reach {targetWeight} KG
            </span>
          </div>
        </div>

        {/* Key Numerical Tiles (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="rounded-xl border border-white/10 bg-zinc-950 p-4">
              <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-bold uppercase">
                <Scale className="h-3.5 w-3.5 text-gym-primary" />
                <span>Total Weight to Shed</span>
              </div>
              <div className="mt-2 text-2xl sm:text-3xl font-bold text-white font-heading">
                {diagnostics.cutWeightKg} <span className="text-xs font-bold text-gym-primary">KG</span>
              </div>
              <span className="text-[10px] text-zinc-500 mt-1 block">
                {diagnostics.cutPercentage}% of total body mass
              </span>
            </div>

            <div className="rounded-xl border border-gym-primary/30 bg-gym-primary/5 p-4">
              <div className="flex items-center gap-1.5 text-gym-primary text-xs font-bold uppercase">
                <Droplets className="h-3.5 w-3.5" />
                <span>Post-Weigh Refeed Fluids</span>
              </div>
              <div className="mt-2 text-2xl sm:text-3xl font-bold text-gym-primary font-heading">
                {diagnostics.rehydrationFluidNeededLiters} <span className="text-xs font-bold text-gym-primary/80">LITERS</span>
              </div>
              <span className="text-[10px] text-zinc-400 mt-1 block">
                135% replacement of lost water weight
              </span>
            </div>

            <div className="rounded-xl border border-white/10 bg-zinc-950 p-4">
              <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-bold uppercase">
                <Flame className="h-3.5 w-3.5 text-amber-400" />
                <span>Day -5 Water Load Start</span>
              </div>
              <div className="mt-2 text-2xl sm:text-3xl font-bold text-white font-heading">
                {diagnostics.waterLoadVolumeLiters} <span className="text-xs font-bold text-zinc-400">LITERS / DAY</span>
              </div>
              <span className="text-[10px] text-zinc-500 mt-1 block">
                Suppresses water-retaining aldosterone
              </span>
            </div>

            <div className="rounded-xl border border-white/10 bg-zinc-950 p-4">
              <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-bold uppercase">
                <Activity className="h-3.5 w-3.5 text-emerald-400" />
                <span>Platform Power Forecast</span>
              </div>
              <div className="mt-2 text-2xl sm:text-3xl font-bold text-white font-heading">
                {diagnostics.safetyScore >= 80 ? "100%" : diagnostics.safetyScore >= 50 ? "~95%" : "~85%"}
              </div>
              <span className="text-[10px] text-emerald-400 font-bold mt-1 block">
                {diagnostics.safetyTier === "SAFE" ? "Zero Compromise" : "Moderate Adaptation"}
              </span>
            </div>
          </div>

          {/* Coach Advice Banner */}
          <div className="rounded-xl border border-white/10 bg-gradient-to-r from-zinc-950 via-black to-zinc-950 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-gym-primary flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Coach Akash &amp; Tanvi Diagnostic</span>
              </span>
              <span className="text-[10px] text-zinc-500 uppercase font-bold">
                Certified Sports Nutritionists
              </span>
            </div>
            <p className="text-xs font-medium text-zinc-300 leading-relaxed">
              {diagnostics.recommendedAction}
            </p>
            <p className="text-[11px] text-zinc-400 leading-relaxed border-t border-white/10 pt-2">
              <strong className="text-white">Strength Impact: </strong>
              {diagnostics.strengthImpactDescription}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
