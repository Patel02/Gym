"use client";

import React from "react";
import { type LiveScoringResultDto } from "@/actions/scoring.actions";
import {
  Users,
  ChevronLeft,
  ChevronRight,
  User,
  Shield,
  Award,
  Layers,
  CheckCircle,
  XCircle,
} from "lucide-react";

interface AthleteQueueStripProps {
  results: LiveScoringResultDto[];
  activeResultIndex: number;
  onSelectAthlete: (index: number) => void;
  discipline: "squat" | "bench" | "deadlift";
  attemptNum: 1 | 2 | 3;
}

export function AthleteQueueStrip({
  results,
  activeResultIndex,
  onSelectAthlete,
  discipline,
  attemptNum,
}: AthleteQueueStripProps) {
  if (!results || results.length === 0) return null;

  const activeAthlete = results[activeResultIndex] || results[0];
  const nextAthlete = results[(activeResultIndex + 1) % results.length];
  const inTheHoleAthlete = results[(activeResultIndex + 2) % results.length];

  // Helper to render attempt badge
  const renderAttemptBadge = (weight: number | null | undefined, label: string) => {
    if (weight === null || weight === undefined) {
      return (
        <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-[10px] text-zinc-500 font-mono">
          {label}: —
        </span>
      );
    }
    const isGood = weight > 0;
    return (
      <span
        className={`px-1.5 py-0.5 rounded text-[10px] font-bold font-mono ${
          isGood
            ? "bg-emerald-950/80 text-emerald-400 border border-emerald-500/40"
            : "bg-red-950/80 text-red-400 border border-red-500/40"
        }`}
      >
        {label}: {Math.abs(weight)}kg {isGood ? "⚪" : "🔴"}
      </span>
    );
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-[#160c08] via-[#0e0705] to-[#070302] p-5 shadow-2xl space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-gym-primary" />
          <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-white">
            Active Flight Lifter Roster &amp; Queue
          </h4>
          <span className="text-[10px] bg-gym-primary/20 text-gym-primary px-2 py-0.5 rounded-full font-black">
            {results.length} Competitors in Flight
          </span>
        </div>

        {/* Quick Prev / Next Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onSelectAthlete((activeResultIndex - 1 + results.length) % results.length)}
            className="flex items-center gap-1 px-3 py-1 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-xs font-bold text-zinc-300 hover:text-white transition-all cursor-pointer"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            <span>Prev Lifter</span>
          </button>

          <span className="text-xs font-bold text-zinc-400 font-mono px-1">
            {activeResultIndex + 1} / {results.length}
          </span>

          <button
            type="button"
            onClick={() => onSelectAthlete((activeResultIndex + 1) % results.length)}
            className="flex items-center gap-1 px-3 py-1 rounded-xl border border-gym-primary/40 bg-gym-primary/15 hover:bg-gym-primary/25 text-xs font-bold text-gym-primary transition-all cursor-pointer"
          >
            <span>Next Lifter</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* 3-Tier Status Cards: ON PLATFORM, ON DECK, IN THE HOLE */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Card 1: ON PLATFORM (ACTIVE) */}
        <div className="rounded-2xl border-2 border-gym-primary bg-gradient-to-b from-gym-primary/20 via-black to-black p-4 relative shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gym-primary text-black text-[9px] font-semibold uppercase tracking-wider animate-pulse">
              <span className="h-1.5 w-1.5 rounded-full bg-black animate-ping" />
              ON PLATFORM
            </span>
            <span className="text-[10px] text-zinc-400 font-mono">
              BW: {activeAthlete.bodyweight ? `${activeAthlete.bodyweight}kg` : "82.5kg"}
            </span>
          </div>

          <div className="text-base font-bold text-white uppercase font-heading truncate">
            {activeAthlete.user?.name || "Competitor"}
          </div>
          <div className="text-[11px] text-gym-primary font-bold uppercase mt-0.5">
            Class: {activeAthlete.user?.profile?.weightClass || "83 KG"} •{" "}
            {activeAthlete.user?.profile?.gender || "MALE"}
          </div>

          {/* Current Discipline Attempts */}
          <div className="flex flex-wrap gap-1 mt-3 pt-2 border-t border-white/10">
            {discipline === "squat" && (
              <>
                {renderAttemptBadge(activeAthlete.squat1, "SQ1")}
                {renderAttemptBadge(activeAthlete.squat2, "SQ2")}
                {renderAttemptBadge(activeAthlete.squat3, "SQ3")}
              </>
            )}
            {discipline === "bench" && (
              <>
                {renderAttemptBadge(activeAthlete.bench1, "BP1")}
                {renderAttemptBadge(activeAthlete.bench2, "BP2")}
                {renderAttemptBadge(activeAthlete.bench3, "BP3")}
              </>
            )}
            {discipline === "deadlift" && (
              <>
                {renderAttemptBadge(activeAthlete.deadlift1, "DL1")}
                {renderAttemptBadge(activeAthlete.deadlift2, "DL2")}
                {renderAttemptBadge(activeAthlete.deadlift3, "DL3")}
              </>
            )}
          </div>

          {/* Total & GL points */}
          <div className="flex items-center justify-between text-[10px] text-zinc-400 mt-2 font-mono">
            <span>Total: <strong className="text-white">{activeAthlete.total || 0}kg</strong></span>
            <span>IPF GL: <strong className="text-emerald-400">{(activeAthlete.ipfGlPoints || 0).toFixed(1)}</strong></span>
          </div>
        </div>

        {/* Card 2: ON DECK (NEXT) */}
        {nextAthlete && (
          <div
            onClick={() => onSelectAthlete((activeResultIndex + 1) % results.length)}
            className="rounded-2xl border border-white/10 bg-black/60 hover:border-amber-500/40 p-4 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[9px] font-semibold uppercase tracking-wider">
                ON DECK (NEXT)
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">
                Click to Switch
              </span>
            </div>

            <div className="text-sm font-black text-white uppercase font-heading group-hover:text-amber-300 transition-colors truncate">
              {nextAthlete.user?.name || "Next Competitor"}
            </div>
            <div className="text-[10px] text-zinc-400 uppercase mt-0.5">
              Class: {nextAthlete.user?.profile?.weightClass || "83 KG"}
            </div>

            <div className="flex flex-wrap gap-1 mt-3 pt-2 border-t border-white/10">
              {discipline === "squat" && renderAttemptBadge(nextAthlete.bestSquat, "Best SQ")}
              {discipline === "bench" && renderAttemptBadge(nextAthlete.bestBench, "Best BP")}
              {discipline === "deadlift" && renderAttemptBadge(nextAthlete.bestDeadlift, "Best DL")}
            </div>

            <div className="text-[10px] text-zinc-500 mt-2 font-mono">
              Total: {nextAthlete.total || 0}kg
            </div>
          </div>
        )}

        {/* Card 3: IN THE HOLE (2ND NEXT) */}
        {inTheHoleAthlete && (
          <div
            onClick={() => onSelectAthlete((activeResultIndex + 2) % results.length)}
            className="rounded-2xl border border-white/10 bg-black/40 hover:border-zinc-500/40 p-4 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 text-[9px] font-semibold uppercase tracking-wider">
                IN THE HOLE
              </span>
              <span className="text-[10px] text-zinc-600 font-mono">
                Warm-up Room
              </span>
            </div>

            <div className="text-sm font-black text-zinc-300 uppercase font-heading group-hover:text-white transition-colors truncate">
              {inTheHoleAthlete.user?.name || "3rd Competitor"}
            </div>
            <div className="text-[10px] text-zinc-500 uppercase mt-0.5">
              Class: {inTheHoleAthlete.user?.profile?.weightClass || "83 KG"}
            </div>

            <div className="flex flex-wrap gap-1 mt-3 pt-2 border-t border-white/10">
              <span className="text-[10px] text-zinc-500 font-mono">
                Total: {inTheHoleAthlete.total || 0}kg • GL: {(inTheHoleAthlete.ipfGlPoints || 0).toFixed(1)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Horizontal Lifter Quick-Select Bar */}
      <div className="overflow-x-auto pb-1 pt-2 border-t border-white/10">
        <div className="flex items-center gap-1.5 min-w-max">
          {results.map((r, idx) => {
            const isSelected = idx === activeResultIndex;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => onSelectAthlete(idx)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  isSelected
                    ? "bg-gym-primary text-white shadow-md font-black"
                    : "bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white border border-white/5"
                }`}
              >
                <span className="opacity-60 text-[10px]">#{idx + 1}</span>
                <span>{r.user?.name || `Lifter ${idx + 1}`}</span>
                <span className="text-[9px] font-mono opacity-80">
                  ({r.total || 0}kg)
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
