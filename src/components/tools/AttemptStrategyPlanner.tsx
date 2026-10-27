"use client";

import React, { useMemo } from "react";
import {
  MeetTacticsState,
  StrategyRoute,
  LiftDiscipline,
  LiftAttempt,
  STRATEGY_PERCENTAGES,
  generateDisciplineAttempts,
  roundToIpfIncrement,
  calculateMeetDiagnostics,
} from "@/lib/attempt-tactics";
import {
  Trophy,
  Flame,
  ShieldCheck,
  Award,
  ChevronRight,
  Sparkles,
  Plus,
  Minus,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Dumbbell,
  ArrowRight,
  TrendingUp,
} from "lucide-react";

interface AttemptStrategyPlannerProps {
  tactics: MeetTacticsState;
  setTactics: React.Dispatch<React.SetStateAction<MeetTacticsState>>;
}

export function AttemptStrategyPlanner({ tactics, setTactics }: AttemptStrategyPlannerProps) {
  const diagnostics = useMemo(() => calculateMeetDiagnostics(tactics), [tactics]);

  // Switch Strategy Philosophy
  const handleStrategyChange = (route: StrategyRoute) => {
    if (route === "Custom") {
      setTactics((prev) => ({ ...prev, strategyRoute: "Custom" }));
      return;
    }

    setTactics((prev) => ({
      ...prev,
      strategyRoute: route,
      squat: {
        ...prev.squat,
        attempts: generateDisciplineAttempts("SQUAT", prev.squat.oneRepMax, route),
      },
      bench: {
        ...prev.bench,
        attempts: generateDisciplineAttempts("BENCH", prev.bench.oneRepMax, route),
      },
      deadlift: {
        ...prev.deadlift,
        attempts: generateDisciplineAttempts("DEADLIFT", prev.deadlift.oneRepMax, route),
      },
    }));
  };

  // Adjust attempt weight
  const adjustAttemptWeight = (discipline: LiftDiscipline, attemptIndex: 0 | 1 | 2, delta: number) => {
    setTactics((prev) => {
      const discKey = discipline.toLowerCase() as "squat" | "bench" | "deadlift";
      const currentAttempts = [...prev[discKey].attempts] as [LiftAttempt, LiftAttempt, LiftAttempt];
      const targetAtt = currentAttempts[attemptIndex];
      const newWeight = roundToIpfIncrement(Math.max(20, targetAtt.weightKg + delta));

      currentAttempts[attemptIndex] = {
        ...targetAtt,
        weightKg: newWeight,
      };

      return {
        ...prev,
        strategyRoute: "Custom",
        [discKey]: {
          ...prev[discKey],
          attempts: currentAttempts,
        },
      };
    });
  };

  // Adjust 1RM Benchmark
  const adjustOneRepMax = (discipline: LiftDiscipline, new1Rm: number) => {
    const valid1Rm = Math.max(20, Math.round(new1Rm * 2) / 2);
    setTactics((prev) => {
      const discKey = discipline.toLowerCase() as "squat" | "bench" | "deadlift";
      const newAttempts = prev.strategyRoute === "Custom"
        ? prev[discKey].attempts
        : generateDisciplineAttempts(discipline, valid1Rm, prev.strategyRoute);

      return {
        ...prev,
        [discKey]: {
          ...prev[discKey],
          oneRepMax: valid1Rm,
          attempts: newAttempts,
        },
      };
    });
  };

  const disciplines: Array<{
    name: LiftDiscipline;
    title: string;
    iconColor: string;
    borderColor: string;
    bgGlow: string;
    discKey: "squat" | "bench" | "deadlift";
  }> = [
    {
      name: "SQUAT",
      title: "Squat (Opening Lift)",
      iconColor: "text-amber-400",
      borderColor: "border-amber-500/20 hover:border-amber-500/40",
      bgGlow: "from-amber-950/20 via-black to-black",
      discKey: "squat",
    },
    {
      name: "BENCH",
      title: "Bench Press (Midway Lift)",
      iconColor: "text-blue-400",
      borderColor: "border-blue-500/20 hover:border-blue-500/40",
      bgGlow: "from-blue-950/20 via-black to-black",
      discKey: "bench",
    },
    {
      name: "DEADLIFT",
      title: "Deadlift (Final Platform Lift)",
      iconColor: "text-red-400",
      borderColor: "border-red-500/20 hover:border-red-500/40",
      bgGlow: "from-red-950/20 via-black to-black",
      discKey: "deadlift",
    },
  ];

  return (
    <div className="space-y-8">
      {/* ── Top Strategy Selector Banner ── */}
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r from-zinc-950 via-black to-zinc-950 p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-gym-primary" />
              <span className="text-xs font-bold uppercase tracking-widest text-gym-primary">
                9-Attempt Tactical Peaking Engine
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white uppercase tracking-wider font-heading">
              Select Competition Attempt Strategy
            </h2>
            <p className="text-xs text-zinc-400 max-w-xl">
              {tactics.strategyRoute === "Custom"
                ? "Custom Mode: Individual attempts customized by coach."
                : STRATEGY_PERCENTAGES[tactics.strategyRoute].desc}
            </p>
          </div>

          {/* Strategy Mode Buttons */}
          <div className="flex flex-wrap items-center gap-2 bg-black/60 p-1.5 rounded-xl border border-white/10">
            {(["Conservative", "Balanced", "Aggressive", "Custom"] as const).map((route) => {
              const isActive = tactics.strategyRoute === route;
              return (
                <button
                  key={route}
                  onClick={() => handleStrategyChange(route)}
                  className={`px-3.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    isActive
                      ? route === "Conservative"
                        ? "bg-emerald-600 text-white shadow-lg shadow-emerald-950"
                        : route === "Aggressive"
                        ? "bg-red-600 text-white shadow-lg shadow-red-950"
                        : route === "Balanced"
                        ? "bg-gym-primary text-white shadow-lg shadow-orange-950"
                        : "bg-purple-600 text-white shadow-lg shadow-purple-950"
                      : "text-zinc-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {route === "Conservative" && "🛡️ "}
                  {route === "Balanced" && "⚖️ "}
                  {route === "Aggressive" && "⚡ "}
                  {route === "Custom" && "✏️ "}
                  {route}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Projected Scoreboard Snapshot ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="rounded-xl border border-white/10 bg-zinc-950/80 p-4 flex flex-col justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
            Projected Total
          </span>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-bold text-white font-heading">
              {diagnostics.projectedTotal}
            </span>
            <span className="text-xs font-bold text-gym-primary">KG</span>
          </div>
          <span className="text-[10px] text-zinc-500 mt-1">9-Attempt Max Target</span>
        </div>

        <div className="rounded-xl border border-gym-primary/30 bg-gym-primary/5 p-4 flex flex-col justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gym-primary">
            IPF GL Points
          </span>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-bold text-gym-primary font-heading">
              {diagnostics.ipfGlPoints}
            </span>
            <span className="text-xs font-bold text-gym-primary/70">PTS</span>
          </div>
          <span className="text-[10px] text-zinc-400 mt-1">Goodlift 2026 Formula</span>
        </div>

        <div className="rounded-xl border border-white/10 bg-zinc-950/80 p-4 flex flex-col justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
            DOTS Score
          </span>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-bold text-white font-heading">
              {diagnostics.dotsPoints}
            </span>
            <span className="text-xs font-bold text-zinc-400">PTS</span>
          </div>
          <span className="text-[10px] text-zinc-500 mt-1">Universal Coefficient</span>
        </div>

        <div className="rounded-xl border border-white/10 bg-zinc-950/80 p-4 flex flex-col justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
            Wilks Score
          </span>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-bold text-white font-heading">
              {diagnostics.wilksPoints}
            </span>
            <span className="text-xs font-bold text-zinc-400">PTS</span>
          </div>
          <span className="text-[10px] text-zinc-500 mt-1">Classic Benchmark</span>
        </div>
      </div>

      {/* ── 3 Disciplines (Squat, Bench, Deadlift) Matrix ── */}
      <div className="space-y-6">
        {disciplines.map(({ name, title, iconColor, borderColor, bgGlow, discKey }) => {
          const disc = tactics[discKey];
          const [att1, att2, att3] = disc.attempts;
          const jump1to2 = Math.round((att2.weightKg - att1.weightKg) * 10) / 10;
          const jump2to3 = Math.round((att3.weightKg - att2.weightKg) * 10) / 10;

          return (
            <div
              key={name}
              className={`relative overflow-hidden rounded-2xl border ${borderColor} bg-gradient-to-b ${bgGlow} p-5 sm:p-6 transition-all shadow-xl`}
            >
              {/* Discipline Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-4 mb-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/10">
                    <Dumbbell className={`h-5 w-5 ${iconColor}`} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold uppercase tracking-wider text-white font-heading">
                      {title}
                    </h3>
                    <p className="text-xs text-zinc-400">
                      Standard Jump Increment: 2.5 KG • Official Calibrated Plates
                    </p>
                  </div>
                </div>

                {/* 1RM Baseline Input */}
                <div className="flex items-center gap-2.5 bg-black/60 px-3.5 py-1.5 rounded-xl border border-white/10 shrink-0">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Baseline 1RM:
                  </span>
                  <input
                    type="number"
                    step="2.5"
                    min="20"
                    max="600"
                    value={disc.oneRepMax}
                    onChange={(e) => adjustOneRepMax(name, parseFloat(e.target.value) || 20)}
                    className="w-20 bg-zinc-900 border border-white/20 rounded-lg px-2.5 py-1 text-center text-sm font-black text-white focus:outline-none focus:border-gym-primary"
                  />
                  <span className="text-xs font-black text-gym-primary">KG</span>
                </div>
              </div>

              {/* 3 Attempts Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* ── Attempt 1 (Opener) ── */}
                <div className="relative rounded-xl border border-white/10 bg-black/50 p-4 flex flex-col justify-between">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <span className="text-xs font-bold uppercase tracking-widest text-zinc-300">
                      1st Attempt
                    </span>
                    <span className="rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 text-[9px] font-semibold uppercase">
                      Opener ({Math.round((att1.weightKg / disc.oneRepMax) * 100)}%)
                    </span>
                  </div>

                  <div className="my-4 text-center">
                    <div className="flex items-center justify-center gap-3">
                      <button
                        onClick={() => adjustAttemptWeight(name, 0, -2.5)}
                        className="h-8 w-8 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-white transition-all cursor-pointer"
                        title="-2.5 kg"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <div className="font-heading text-3xl sm:text-4xl font-black text-white tracking-wider">
                        {att1.weightKg} <span className="text-sm font-sans text-gym-primary">KG</span>
                      </div>
                      <button
                        onClick={() => adjustAttemptWeight(name, 0, 2.5)}
                        className="h-8 w-8 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-white transition-all cursor-pointer"
                        title="+2.5 kg"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-1.5">
                      Confidence: 99% • RPE 7.0 - 7.5
                    </p>
                  </div>

                  <div className="border-t border-white/10 pt-2 text-[10px] text-zinc-500 flex items-center justify-between">
                    <span>Base Score Guarantee</span>
                    <span className="text-emerald-400 font-bold">Opens Meet</span>
                  </div>
                </div>

                {/* ── Attempt 2 ── */}
                <div className="relative rounded-xl border border-white/10 bg-black/50 p-4 flex flex-col justify-between">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <span className="text-xs font-bold uppercase tracking-widest text-zinc-300">
                      2nd Attempt
                    </span>
                    <span className="rounded bg-gym-primary/20 text-gym-primary border border-gym-primary/30 px-2 py-0.5 text-[9px] font-semibold uppercase">
                      Builder ({Math.round((att2.weightKg / disc.oneRepMax) * 100)}%)
                    </span>
                  </div>

                  <div className="my-4 text-center">
                    <div className="flex items-center justify-center gap-3">
                      <button
                        onClick={() => adjustAttemptWeight(name, 1, -2.5)}
                        className="h-8 w-8 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-white transition-all cursor-pointer"
                        title="-2.5 kg"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <div className="font-heading text-3xl sm:text-4xl font-black text-white tracking-wider">
                        {att2.weightKg} <span className="text-sm font-sans text-gym-primary">KG</span>
                      </div>
                      <button
                        onClick={() => adjustAttemptWeight(name, 1, 2.5)}
                        className="h-8 w-8 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-white transition-all cursor-pointer"
                        title="+2.5 kg"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <p className="text-[11px] text-gym-primary mt-1.5 font-bold">
                      Jump: +{jump1to2} KG ({Math.round((jump1to2 / att1.weightKg) * 100)}%)
                    </p>
                  </div>

                  <div className="border-t border-white/10 pt-2 text-[10px] text-zinc-500 flex items-center justify-between">
                    <span>RPE 8.5 - 9.0 Target</span>
                    <span className="text-zinc-400 font-bold">Solid PR Builder</span>
                  </div>
                </div>

                {/* ── Attempt 3 ── */}
                <div className="relative rounded-xl border border-white/10 bg-black/50 p-4 flex flex-col justify-between">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <span className="text-xs font-bold uppercase tracking-widest text-zinc-300">
                      3rd Attempt
                    </span>
                    <span className="rounded bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 text-[9px] font-semibold uppercase">
                      Medal / PR ({Math.round((att3.weightKg / disc.oneRepMax) * 100)}%)
                    </span>
                  </div>

                  <div className="my-4 text-center">
                    <div className="flex items-center justify-center gap-3">
                      <button
                        onClick={() => adjustAttemptWeight(name, 2, -2.5)}
                        className="h-8 w-8 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-white transition-all cursor-pointer"
                        title="-2.5 kg"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <div className="font-heading text-3xl sm:text-4xl font-black text-white tracking-wider">
                        {att3.weightKg} <span className="text-sm font-sans text-gym-primary">KG</span>
                      </div>
                      <button
                        onClick={() => adjustAttemptWeight(name, 2, 2.5)}
                        className="h-8 w-8 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-white transition-all cursor-pointer"
                        title="+2.5 kg"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <p className="text-[11px] text-red-400 mt-1.5 font-bold">
                      Jump: +{jump2to3} KG ({Math.round((jump2to3 / att2.weightKg) * 100)}%)
                    </p>
                  </div>

                  <div className="border-t border-white/10 pt-2 text-[10px] text-zinc-500 flex items-center justify-between">
                    <span>RPE 9.5 - 10.0 Maximum</span>
                    <span className="text-amber-400 font-bold">Podium Decider</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
