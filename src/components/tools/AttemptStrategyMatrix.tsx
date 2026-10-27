"use client";

import { calculateIpfGl, type Equipment, type Gender } from "@/lib/calculations";
import {
  calculateAttemptStrategies,
  type AttemptJumpPlan,
} from "@/lib/plate-calculator";
import { ArrowUpRight, Award, ShieldAlert, Sparkles, Target, Trophy } from "lucide-react";
import React, { useMemo, useState } from "react";

interface AttemptStrategyMatrixProps {
  openerWeight: number;
  bodyweight?: number;
  gender?: Gender;
  equipment?: Equipment;
  disciplineName?: string;
  squatBest?: number;
  benchBest?: number;
  deadliftBest?: number;
  className?: string;
}

export function AttemptStrategyMatrix({
  openerWeight,
  bodyweight = 83,
  gender = "MALE",
  equipment = "RAW",
  disciplineName = "SQUAT",
  squatBest = 0,
  benchBest = 0,
  deadliftBest = 0,
  className = "",
}: AttemptStrategyMatrixProps) {
  const [selectedRoute, setSelectedRoute] = useState<"Conservative" | "Balanced" | "Aggressive">("Balanced");

  const plans = useMemo(() => {
    return calculateAttemptStrategies(openerWeight, bodyweight, gender, equipment);
  }, [openerWeight, bodyweight, gender, equipment]);

  const activePlan = plans.find((p) => p.name === selectedRoute) || plans[1];

  // Calculate projected totals for this strategy
  const currentDisciplineLower = disciplineName.toLowerCase();
  const projectedAttempt3 = activePlan.attempt3;
  
  const estimatedSquat = currentDisciplineLower.includes("squat") ? projectedAttempt3 : (squatBest || openerWeight);
  const estimatedBench = currentDisciplineLower.includes("bench") ? projectedAttempt3 : (benchBest || Math.round(openerWeight * 0.65));
  const estimatedDeadlift = currentDisciplineLower.includes("dead") ? projectedAttempt3 : (deadliftBest || Math.round(openerWeight * 1.15));

  const projectedTotal = estimatedSquat + estimatedBench + estimatedDeadlift;
  const projectedGl = calculateIpfGl(bodyweight, projectedTotal, gender, equipment);

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-[#180803] via-[#0d0301] to-[#120402] p-5 sm:p-6 shadow-2xl ${className}`}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-gym-primary" />
            <h3 className="font-heading text-lg font-bold uppercase tracking-wider text-white">
              Platform Attempt Strategy Matrix
            </h3>
            <span className="rounded-full border border-gym-primary/40 bg-gym-primary/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-gym-primary">
              {disciplineName}
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            Calibrated competition jump curves based on planned opening attempt ({openerWeight} KG).
          </p>
        </div>

        {/* Route Selector Pills */}
        <div className="flex items-center gap-1.5 bg-black/60 p-1 rounded-xl border border-white/10">
          {(["Conservative", "Balanced", "Aggressive"] as const).map((route) => (
            <button
              key={route}
              onClick={() => setSelectedRoute(route)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                selectedRoute === route
                  ? route === "Conservative"
                    ? "bg-emerald-600 text-white shadow-md"
                    : route === "Aggressive"
                    ? "bg-red-600 text-white shadow-md"
                    : "bg-gym-primary text-white shadow-md"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {route}
            </button>
          ))}
        </div>
      </div>

      {/* ── 3-ATTEMPTS CARD ROW ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 my-4">
        
        {/* Attempt 1 (Opener) */}
        <div className="relative overflow-hidden rounded-xl border border-white/15 bg-[#140602] p-4 flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between text-xs text-gray-400 border-b border-white/10 pb-2">
            <span className="font-black uppercase tracking-widest text-zinc-300">ATTEMPT 1</span>
            <span className="rounded bg-white/10 px-2 py-0.5 text-[9px] font-bold text-gray-300 uppercase">
              OPENER
            </span>
          </div>

          <div className="my-3 text-center">
            <div className="font-heading text-4xl font-bold text-white tracking-wider">
              {activePlan.attempt1} <span className="text-sm font-sans text-gym-primary">KG</span>
            </div>
            <p className="text-[11px] text-gray-400 mt-1">
              RPE 7.0 - 7.5 • 3-for-3 Confidence
            </p>
          </div>

          <div className="border-t border-white/10 pt-2 text-[10px] text-zinc-400 text-center">
            Base platform score guaranteed
          </div>
        </div>

        {/* Attempt 2 (Builder) */}
        <div className="relative overflow-hidden rounded-xl border border-gym-primary/40 bg-gradient-to-b from-gym-primary/10 to-[#140602] p-4 flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between text-xs text-gray-400 border-b border-white/10 pb-2">
            <span className="font-black uppercase tracking-widest text-gym-primary">ATTEMPT 2</span>
            <div className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
              <ArrowUpRight className="h-3 w-3" />
              <span>+{activePlan.attempt2JumpKg} KG (+{activePlan.attempt2JumpPercent}%)</span>
            </div>
          </div>

          <div className="my-3 text-center">
            <div className="font-heading text-4xl font-bold text-gym-primary tracking-wider">
              {activePlan.attempt2} <span className="text-sm font-sans text-white">KG</span>
            </div>
            <p className="text-[11px] text-gray-300 mt-1">
              RPE 8.5 - 9.0 • Total Anchor
            </p>
          </div>

          <div className="border-t border-white/10 pt-2 text-[10px] text-gray-400 text-center">
            Sets up podium position
          </div>
        </div>

        {/* Attempt 3 (Peak / Medal) */}
        <div className="relative overflow-hidden rounded-xl border border-amber-500/40 bg-gradient-to-b from-amber-500/10 to-[#140602] p-4 flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between text-xs text-gray-400 border-b border-white/10 pb-2">
            <span className="font-black uppercase tracking-widest text-amber-400">ATTEMPT 3</span>
            <div className="flex items-center gap-1 text-[10px] font-semibold text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30">
              <ArrowUpRight className="h-3 w-3" />
              <span>+{activePlan.attempt3JumpKg} KG (+{activePlan.attempt3JumpPercent}%)</span>
            </div>
          </div>

          <div className="my-3 text-center">
            <div className="font-heading text-4xl font-bold text-amber-400 tracking-wider">
              {activePlan.attempt3} <span className="text-sm font-sans text-white">KG</span>
            </div>
            <p className="text-[11px] text-gray-300 mt-1">
              RPE 9.5 - 10.0 • Max Effort / PR
            </p>
          </div>

          <div className="border-t border-white/10 pt-2 text-[10px] text-gray-400 text-center">
            Target record / highest placement
          </div>
        </div>

      </div>

      {/* ── PROJECTED TOTAL & IPF GL MATRIX ── */}
      <div className="mt-4 rounded-xl border border-white/10 bg-black/40 p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gym-primary/20 text-gym-primary border border-gym-primary/30 shrink-0">
            <Trophy className="h-4 w-4" />
          </div>
          <div>
            <div className="font-bold text-white uppercase text-[11px]">
              {activePlan.name} Strategy Assessment:
            </div>
            <p className="text-[11px] text-gray-400">
              {activePlan.description}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-[9px] font-semibold uppercase text-gray-400 block">
              PROJECTED TOTAL
            </span>
            <span className="font-mono text-base font-bold text-white">
              ~{projectedTotal} KG
            </span>
          </div>

          <div className="h-7 w-[1px] bg-white/10" />

          <div className="text-right">
            <span className="text-[9px] font-semibold uppercase text-gray-400 block">
              EST. IPF GL POINTS
            </span>
            <span className="font-mono text-base font-bold text-amber-400">
              {projectedGl}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
