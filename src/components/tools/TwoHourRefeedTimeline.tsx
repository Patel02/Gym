"use client";

import React, { useState } from "react";
import {
  RefeedMilestone,
  TWO_HOUR_REFEED_SCHEDULE,
} from "@/lib/weigh-in-nutrition";
import {
  Clock,
  CheckCircle2,
  Sparkles,
  Droplets,
  Utensils,
  Zap,
  Activity,
  ShieldCheck,
  ChevronRight,
  Flame,
} from "lucide-react";

interface TwoHourRefeedTimelineProps {
  refeedVolumeLiters: number;
}

export function TwoHourRefeedTimeline({ refeedVolumeLiters }: TwoHourRefeedTimelineProps) {
  const [activeMilestoneIndex, setActiveMilestoneIndex] = useState<number>(0);
  const [completedMilestones, setCompletedMilestones] = useState<Record<number, boolean>>({});

  const activeMilestone: RefeedMilestone = TWO_HOUR_REFEED_SCHEDULE[activeMilestoneIndex];

  const toggleMilestone = (idx: number) => {
    setCompletedMilestones((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  return (
    <div className="space-y-8">
      {/* ── TOP BANNER ── */}
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r from-zinc-950 via-black to-zinc-950 p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gym-primary" />
              <span className="text-xs font-bold uppercase tracking-widest text-gym-primary">
                IPF Section 8.1 Post Weigh-In Protocol
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white uppercase tracking-wider font-heading">
              120-Minute Rapid Refeed Timeline
            </h2>
            <p className="text-xs text-zinc-400 max-w-xl">
              Strictly sequenced fluid resuscitation, fast glycogen loading, and osmotic cellular swelling without bloating or gastrointestinal distress.
            </p>
          </div>

          <div className="rounded-xl border border-gym-primary/30 bg-gym-primary/10 px-4 py-2 text-right shrink-0">
            <span className="text-[10px] font-bold uppercase text-gym-primary block">
              Total Refeed Fluids Target
            </span>
            <span className="text-xl font-bold text-white font-heading">
              {refeedVolumeLiters} LITERS
            </span>
          </div>
        </div>
      </div>

      {/* ── 4-STAGE TIMELINE PROGRESS BAR ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {TWO_HOUR_REFEED_SCHEDULE.map((m, idx) => {
          const isCurrent = activeMilestoneIndex === idx;
          const isDone = completedMilestones[idx];

          return (
            <div
              key={m.minuteRange}
              onClick={() => setActiveMilestoneIndex(idx)}
              className={`rounded-xl border p-4 flex flex-col justify-between transition-all cursor-pointer ${
                isCurrent
                  ? "border-gym-primary bg-gym-primary/15 shadow-lg shadow-orange-950/40"
                  : isDone
                  ? "border-emerald-500/40 bg-emerald-950/20"
                  : "border-white/10 bg-zinc-950 hover:bg-white/5"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-white font-heading">
                  STAGE {idx + 1}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleMilestone(idx);
                  }}
                  className="p-1 cursor-pointer"
                  title="Toggle Completed"
                >
                  <CheckCircle2
                    className={`h-4 w-4 ${isDone ? "text-emerald-400 fill-emerald-400/20" : "text-zinc-600"}`}
                  />
                </button>
              </div>

              <div className="my-2">
                <div className="text-sm font-black text-white font-heading">
                  {m.minuteRange}
                </div>
                <p className="text-xs text-zinc-300 font-bold mt-0.5 truncate">
                  {m.title}
                </p>
              </div>

              <div className="border-t border-white/10 pt-2 flex items-center justify-between text-[10px] text-zinc-400">
                <span>{m.fluidAmountMl}ml Fluids</span>
                <span className="text-gym-primary font-bold">+{m.carbsGrams}g Carbs</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── ACTIVE MILESTONE DEEP DIVE ── */}
      <div className="rounded-2xl border border-white/10 bg-zinc-950 p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-gym-primary/20 border border-gym-primary/40 px-2.5 py-0.5 text-[10px] font-semibold uppercase text-gym-primary">
                TIMEFRAME: {activeMilestone.minuteRange}
              </span>
            </div>
            <h3 className="text-2xl font-bold uppercase tracking-wider text-white font-heading mt-1">
              {activeMilestone.title}
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Objective: <strong className="text-white">{activeMilestone.goal}</strong>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="rounded-xl border border-white/10 bg-black/60 px-3 py-2 text-center">
              <span className="text-[9px] font-bold uppercase text-zinc-400 block">Fluid Vol</span>
              <span className="text-sm font-black text-blue-400 font-heading">
                {activeMilestone.fluidAmountMl} ML
              </span>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/60 px-3 py-2 text-center">
              <span className="text-[9px] font-bold uppercase text-zinc-400 block">Carbs</span>
              <span className="text-sm font-black text-amber-400 font-heading">
                {activeMilestone.carbsGrams} G
              </span>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/60 px-3 py-2 text-center">
              <span className="text-[9px] font-bold uppercase text-zinc-400 block">Protein</span>
              <span className="text-sm font-black text-purple-400 font-heading">
                {activeMilestone.proteinGrams} G
              </span>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/60 px-3 py-2 text-center">
              <span className="text-[9px] font-bold uppercase text-zinc-400 block">Sodium</span>
              <span className="text-sm font-black text-emerald-400 font-heading">
                {activeMilestone.sodiumMg} MG
              </span>
            </div>
          </div>
        </div>

        {/* Breakdown: Nutrition & Physiology */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Foods & Fluid Specs */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white">
              <Utensils className="h-4 w-4 text-gym-primary" />
              <span>Prescribed Refeed Fuel &amp; Hydration</span>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/60 p-4 space-y-3">
              <div className="text-xs text-zinc-300">
                <span className="text-zinc-500 font-bold block text-[10px] uppercase">
                  Fluid Selection:
                </span>
                <span className="font-bold text-blue-300">{activeMilestone.fluidType}</span>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-white/10">
                <span className="text-zinc-500 font-bold block text-[10px] uppercase">
                  Recommended Foods:
                </span>
                {activeMilestone.recommendedFoods.map((food, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-zinc-300">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                    <span>{food}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Physiology & Digestion Notes */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gym-primary">
              <Activity className="h-4 w-4" />
              <span>Gastric Emptying &amp; Sports Science</span>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/60 p-4 space-y-3">
              <p className="text-xs font-medium text-zinc-300 leading-relaxed">
                {activeMilestone.physiologyNote}
              </p>
              <div className="rounded-lg border border-emerald-500/30 bg-emerald-950/20 p-3 text-[11px] text-emerald-300 font-medium">
                <strong>Stomach Comfort Rule: </strong>
                Never chug fluids cold. Sip at room temperature to prevent gastric cramping and maximize intestinal absorption.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
