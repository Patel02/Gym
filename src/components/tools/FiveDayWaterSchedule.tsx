"use client";

import React, { useState } from "react";
import {
  DayHydrationPlan,
  WeighInFormat,
} from "@/lib/weigh-in-nutrition";
import {
  Droplets,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Flame,
  Info,
  ChevronRight,
  ShieldCheck,
  Utensils,
  Zap,
} from "lucide-react";

interface FiveDayWaterScheduleProps {
  schedule: DayHydrationPlan[];
  bodyweight: number;
  format: WeighInFormat;
}

export function FiveDayWaterSchedule({
  schedule,
  bodyweight,
  format,
}: FiveDayWaterScheduleProps) {
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);
  const activeDay = schedule[selectedDayIndex] || schedule[0];

  return (
    <div className="space-y-8">
      {/* ── TOP BANNER ── */}
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r from-zinc-950 via-black to-zinc-950 p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Droplets className="h-4 w-4 text-blue-400" />
              <span className="text-xs font-bold uppercase tracking-widest text-blue-400">
                5-Day Aldosterone Suppression Protocol
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white uppercase tracking-wider font-heading">
              Water Loading &amp; Sodium Taper Schedule
            </h2>
            <p className="text-xs text-zinc-400 max-w-xl">
              Scientific fluid manipulation designed to trigger spontaneous diuresis while preserving intra-muscular electrolytes and squat depth leverage.
            </p>
          </div>

          <div className="rounded-xl border border-blue-500/30 bg-blue-950/20 px-4 py-2 text-right shrink-0">
            <span className="text-[10px] font-bold uppercase text-blue-300 block">
              Athlete Mass Baseline
            </span>
            <span className="text-lg font-bold text-white font-heading">
              {bodyweight} KG
            </span>
          </div>
        </div>
      </div>

      {/* ── DAY SELECTOR HORIZONTAL TABS ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
        {schedule.map((day, idx) => {
          const isSelected = selectedDayIndex === idx;
          return (
            <button
              key={day.dayLabel}
              onClick={() => setSelectedDayIndex(idx)}
              className={`rounded-xl border p-3 flex flex-col items-center justify-between text-center transition-all cursor-pointer ${
                isSelected
                  ? "border-gym-primary bg-gym-primary/15 shadow-lg shadow-orange-950/40"
                  : "border-white/10 bg-zinc-950 hover:bg-white/5"
              }`}
            >
              <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                {day.daysOut === 0 ? "MEET DAY" : `${day.daysOut} DAYS OUT`}
              </span>
              <div className="my-1.5 flex items-baseline gap-1">
                <span className="text-xl font-bold text-white font-heading">
                  {day.waterLiters}
                </span>
                <span className="text-xs font-bold text-blue-400">L</span>
              </div>
              <span
                className={`text-[9px] font-semibold uppercase px-2 py-0.5 rounded ${
                  day.sodiumStatus === "HIGH_LOAD"
                    ? "bg-amber-500/20 text-amber-300"
                    : day.sodiumStatus === "LOW"
                    ? "bg-blue-500/20 text-blue-300"
                    : day.sodiumStatus === "ZERO"
                    ? "bg-red-500/20 text-red-300"
                    : "bg-white/10 text-zinc-400"
                }`}
              >
                {day.sodiumStatus.replace("_", " ")}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── ACTIVE DAY DEEP-DIVE CARD ── */}
      <div className="rounded-2xl border border-white/10 bg-zinc-950 p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gym-primary" />
              <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                {activeDay.dayLabel}
              </span>
            </div>
            <h3 className="text-2xl font-bold uppercase tracking-wider text-white font-heading mt-1">
              {activeDay.title}
            </h3>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-blue-500/30 bg-blue-950/30 px-4 py-2 text-center">
              <span className="text-[10px] font-bold uppercase text-blue-300 block">
                Target Hydration
              </span>
              <span className="text-xl font-bold text-white font-heading">
                {activeDay.waterLiters} LITERS
              </span>
            </div>

            <div className="rounded-xl border border-amber-500/30 bg-amber-950/30 px-4 py-2 text-center">
              <span className="text-[10px] font-bold uppercase text-amber-300 block">
                Sodium Intake
              </span>
              <span className="text-xl font-bold text-white font-heading">
                {activeDay.sodiumTargetMg > 0 ? `${activeDay.sodiumTargetMg} MG` : "ZERO"}
              </span>
            </div>
          </div>
        </div>

        {/* Warning Callout if present */}
        {activeDay.warningAlert && (
          <div className="rounded-xl border border-red-500/40 bg-red-950/20 p-4 flex items-center gap-3 text-red-300 text-xs">
            <AlertTriangle className="h-5 w-5 text-red-400 shrink-0" />
            <span className="font-bold">{activeDay.warningAlert}</span>
          </div>
        )}

        {/* Grid: Instructions & Foods */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Coach Directives */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gym-primary">
              <Sparkles className="h-4 w-4" />
              <span>Coach Akash &amp; Tanvi Protocols</span>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/60 p-4 space-y-3">
              <p className="text-xs font-medium text-zinc-300 leading-relaxed">
                {activeDay.coachDirectives}
              </p>
              <div className="border-t border-white/10 pt-3 text-[11px] text-zinc-400 flex items-center justify-between">
                <span>Hydration Timing:</span>
                <strong className="text-white">{activeDay.waterFormula}</strong>
              </div>
            </div>
          </div>

          {/* Key Food Selections */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white">
              <Utensils className="h-4 w-4 text-gym-primary" />
              <span>Recommended Clean Fuel Sources</span>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/60 p-4 space-y-2.5">
              {activeDay.keyFoods.map((food, i) => (
                <div key={i} className="flex items-center gap-2.5 text-xs text-zinc-300">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span>{food}</span>
                </div>
              ))}
              <div className="border-t border-white/10 pt-2.5 text-[11px] text-zinc-400 flex items-center justify-between">
                <span>Gut Residue Status:</span>
                <span
                  className={`font-black uppercase text-[10px] px-2 py-0.5 rounded ${
                    activeDay.fiberStatus === "LOW_RESIDUE"
                      ? "bg-amber-500/20 text-amber-300"
                      : activeDay.fiberStatus === "ZERO_FIBER"
                      ? "bg-red-500/20 text-red-300"
                      : "bg-emerald-500/20 text-emerald-300"
                  }`}
                >
                  {activeDay.fiberStatus.replace("_", " ")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
