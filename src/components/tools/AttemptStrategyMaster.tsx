"use client";

import React, { useState } from "react";
import {
  MeetTacticsState,
  StrategyRoute,
  generateDisciplineAttempts,
  roundToIpfIncrement,
  calculateMeetDiagnostics,
} from "@/lib/attempt-tactics";
import { AttemptStrategyPlanner } from "./AttemptStrategyPlanner";
import { MeetDayLiveCockpit } from "./MeetDayLiveCockpit";
import { OfficialAttemptCardPrint } from "./OfficialAttemptCardPrint";
import {
  Target,
  Clock,
  FileText,
  Sliders,
  User,
  Sparkles,
  Flame,
  Dumbbell,
  Shield,
  RotateCcw,
} from "lucide-react";

interface AttemptStrategyMasterProps {
  initialAthleteName?: string;
  initialBodyweight?: number;
  initialWeightClass?: string;
  initialSquat1Rm?: number;
  initialBench1Rm?: number;
  initialDeadlift1Rm?: number;
}

export function AttemptStrategyMaster({
  initialAthleteName = "Patel Rakesh",
  initialBodyweight = 83,
  initialWeightClass = "83 KG (Senior)",
  initialSquat1Rm = 240,
  initialBench1Rm = 160,
  initialDeadlift1Rm = 270,
}: AttemptStrategyMasterProps) {
  const [activeTab, setActiveTab] = useState<"PLANNER" | "COCKPIT" | "OFFICIAL_CARD">("PLANNER");

  // Master State
  const [tactics, setTactics] = useState<MeetTacticsState>({
    athleteName: initialAthleteName,
    weightClass: initialWeightClass,
    bodyweight: initialBodyweight,
    gender: "MALE",
    equipment: "RAW",
    flight: "Flight A",
    lotNumber: "14",
    strategyRoute: "Balanced",
    rackHeights: {
      squatRack: "14 IN",
      benchRack: "11",
      benchSafety: "6",
    },
    squat: {
      discipline: "SQUAT",
      oneRepMax: initialSquat1Rm,
      attempts: generateDisciplineAttempts("SQUAT", initialSquat1Rm, "Balanced"),
      warmupMinutesBeforeOpener: 45,
    },
    bench: {
      discipline: "BENCH",
      oneRepMax: initialBench1Rm,
      attempts: generateDisciplineAttempts("BENCH", initialBench1Rm, "Balanced"),
      warmupMinutesBeforeOpener: 35,
    },
    deadlift: {
      discipline: "DEADLIFT",
      oneRepMax: initialDeadlift1Rm,
      attempts: generateDisciplineAttempts("DEADLIFT", initialDeadlift1Rm, "Balanced"),
      warmupMinutesBeforeOpener: 40,
    },
  });

  // Sample Presets
  const applyPreset = (preset: {
    name: string;
    weightClass: string;
    bw: number;
    squat: number;
    bench: number;
    deadlift: number;
    gender: "MALE" | "FEMALE";
  }) => {
    setTactics((prev) => ({
      ...prev,
      athleteName: preset.name,
      weightClass: preset.weightClass,
      bodyweight: preset.bw,
      gender: preset.gender,
      strategyRoute: "Balanced",
      squat: {
        ...prev.squat,
        oneRepMax: preset.squat,
        attempts: generateDisciplineAttempts("SQUAT", preset.squat, "Balanced"),
      },
      bench: {
        ...prev.bench,
        oneRepMax: preset.bench,
        attempts: generateDisciplineAttempts("BENCH", preset.bench, "Balanced"),
      },
      deadlift: {
        ...prev.deadlift,
        oneRepMax: preset.deadlift,
        attempts: generateDisciplineAttempts("DEADLIFT", preset.deadlift, "Balanced"),
      },
    }));
  };

  const diagnostics = calculateMeetDiagnostics(tactics);

  return (
    <div className="space-y-8">
      {/* ── TOP HERO HEADER (Dark Luxury Olympic Aesthetics) ── */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-[#180803] via-[#0e0301] to-[#120402] p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        <div className="absolute -right-16 -top-16 h-60 w-60 rounded-full bg-gym-primary/15 blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-gym-primary/40 bg-gym-primary/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-gym-primary">
              <Flame className="h-3.5 w-3.5 fill-current" />
              <span>OFFICIAL IPF MEET DAY COMMAND CENTER</span>
            </div>

            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-wider text-white">
              Coach Attempt Strategy <span className="text-gym-primary">&amp; War Room</span>
            </h1>

            <p className="text-sm font-medium text-zinc-400 max-w-2xl leading-relaxed">
              Backstage 9-for-9 attempt peaking curves, IPF 60-second submission countdown, live platform contingency decision tree, and official triplicate rack height card.
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
                    weightClass: "83 KG (Senior)",
                    bw: 83,
                    squat: 240,
                    bench: 160,
                    deadlift: 270,
                    gender: "MALE",
                  })
                }
                className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-bold text-zinc-300 hover:text-white transition-all cursor-pointer"
              >
                83kg Elite (670 Total)
              </button>

              <button
                onClick={() =>
                  applyPreset({
                    name: "Vikramjit Singh",
                    weightClass: "93 KG (Senior)",
                    bw: 93,
                    squat: 275,
                    bench: 185,
                    deadlift: 310,
                    gender: "MALE",
                  })
                }
                className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-bold text-zinc-300 hover:text-white transition-all cursor-pointer"
              >
                93kg Heavy (770 Total)
              </button>

              <button
                onClick={() =>
                  applyPreset({
                    name: "Ananya Deshmukh",
                    weightClass: "69 KG (Open Women)",
                    bw: 68.5,
                    squat: 175,
                    bench: 110,
                    deadlift: 205,
                    gender: "FEMALE",
                  })
                }
                className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-bold text-zinc-300 hover:text-white transition-all cursor-pointer"
              >
                69kg Women (490 Total)
              </button>
            </div>
          </div>
        </div>

        {/* Lifter Setup Row (Editable) */}
        <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="text-zinc-400 font-bold uppercase text-[10px] block">
              Athlete Name
            </label>
            <input
              type="text"
              value={tactics.athleteName}
              onChange={(e) => setTactics((p) => ({ ...p, athleteName: e.target.value }))}
              className="mt-1 w-full bg-black/50 border border-white/15 rounded-lg px-2.5 py-1.5 text-white font-bold text-xs focus:outline-none focus:border-gym-primary"
            />
          </div>

          <div>
            <label className="text-zinc-400 font-bold uppercase text-[10px] block">
              Bodyweight (KG)
            </label>
            <input
              type="number"
              step="0.1"
              value={tactics.bodyweight}
              onChange={(e) => setTactics((p) => ({ ...p, bodyweight: parseFloat(e.target.value) || 83 }))}
              className="mt-1 w-full bg-black/50 border border-white/15 rounded-lg px-2.5 py-1.5 text-white font-bold text-xs focus:outline-none focus:border-gym-primary"
            />
          </div>

          <div>
            <label className="text-zinc-400 font-bold uppercase text-[10px] block">
              Weight Division
            </label>
            <input
              type="text"
              value={tactics.weightClass}
              onChange={(e) => setTactics((p) => ({ ...p, weightClass: e.target.value }))}
              className="mt-1 w-full bg-black/50 border border-white/15 rounded-lg px-2.5 py-1.5 text-white font-bold text-xs focus:outline-none focus:border-gym-primary"
            />
          </div>

          <div>
            <label className="text-zinc-400 font-bold uppercase text-[10px] block">
              Flight &amp; Lot Number
            </label>
            <div className="flex gap-2 mt-1">
              <input
                type="text"
                value={tactics.flight}
                onChange={(e) => setTactics((p) => ({ ...p, flight: e.target.value }))}
                className="w-1/2 bg-black/50 border border-white/15 rounded-lg px-2 py-1.5 text-white font-bold text-xs focus:outline-none focus:border-gym-primary"
                placeholder="Flight"
              />
              <input
                type="text"
                value={tactics.lotNumber}
                onChange={(e) => setTactics((p) => ({ ...p, lotNumber: e.target.value }))}
                className="w-1/2 bg-black/50 border border-white/15 rounded-lg px-2 py-1.5 text-white font-bold text-xs focus:outline-none focus:border-gym-primary"
                placeholder="Lot #"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── NAVIGATION TABS ── */}
      <div className="flex border-b border-white/10 gap-2 sm:gap-4 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab("PLANNER")}
          className={`flex items-center gap-2 pb-3 px-3 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
            activeTab === "PLANNER"
              ? "border-gym-primary text-gym-primary"
              : "border-transparent text-zinc-400 hover:text-white"
          }`}
        >
          <Target className="h-4 w-4" />
          <span>9-Attempt Peaking Planner</span>
        </button>

        <button
          onClick={() => setActiveTab("COCKPIT")}
          className={`flex items-center gap-2 pb-3 px-3 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
            activeTab === "COCKPIT"
              ? "border-gym-primary text-gym-primary"
              : "border-transparent text-zinc-400 hover:text-white"
          }`}
        >
          <Clock className="h-4 w-4" />
          <span>Live Backstage Cockpit &amp; 60s Clock</span>
          <span className="rounded-full bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.2 text-[9px] font-semibold">
            LIVE
          </span>
        </button>

        <button
          onClick={() => setActiveTab("OFFICIAL_CARD")}
          className={`flex items-center gap-2 pb-3 px-3 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
            activeTab === "OFFICIAL_CARD"
              ? "border-gym-primary text-gym-primary"
              : "border-transparent text-zinc-400 hover:text-white"
          }`}
        >
          <FileText className="h-4 w-4" />
          <span>Official Attempt Card &amp; Rack Heights</span>
        </button>
      </div>

      {/* ── TAB CONTENT ── */}
      {activeTab === "PLANNER" && (
        <AttemptStrategyPlanner tactics={tactics} setTactics={setTactics} />
      )}

      {activeTab === "COCKPIT" && (
        <MeetDayLiveCockpit tactics={tactics} setTactics={setTactics} />
      )}

      {activeTab === "OFFICIAL_CARD" && (
        <OfficialAttemptCardPrint tactics={tactics} setTactics={setTactics} />
      )}
    </div>
  );
}
