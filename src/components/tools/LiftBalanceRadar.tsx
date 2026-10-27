"use client";

import { LiftBalanceAnalysis } from "@/lib/powerlifting-math";
import { Scale, Dumbbell, Compass, Lightbulb, CheckCircle2 } from "lucide-react";

interface LiftBalanceRadarProps {
  squat: number;
  bench: number;
  deadlift: number;
  total: number;
  analysis: LiftBalanceAnalysis;
}

export default function LiftBalanceRadar({
  squat,
  bench,
  deadlift,
  total,
  analysis,
}: LiftBalanceRadarProps) {
  const { squatPercent, benchPercent, deadliftPercent, archetype, coachTip } = analysis;

  return (
    <div className="rounded-3xl border border-white/10 bg-[#0c0402] p-6 sm:p-8 shadow-2xl relative overflow-hidden">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4 mb-6">
        <div className="flex items-center gap-2.5">
          <div className="rounded-full bg-gym-primary/15 p-2 text-gym-primary border border-gym-primary/30">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-heading text-xl font-bold uppercase text-white tracking-wide">
              Powerlifting Balance Ratios (S:B:D)
            </h4>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Biomechanics & Strength Distribution
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-gray-400 uppercase">Profile:</span>
          <span className="rounded-full bg-gym-primary/20 border border-gym-primary/40 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-gym-primary">
            {archetype}
          </span>
        </div>
      </div>

      {/* 3 Lift Proportional Breakdown Bars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        
        {/* Squat Ratio */}
        <div className="rounded-2xl border border-white/5 bg-black/40 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase text-gray-400">1. Squat Ratio</span>
            <span className="font-heading text-lg font-bold text-amber-400">{squatPercent}%</span>
          </div>
          <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden mb-2">
            <div 
              className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-500" 
              style={{ width: `${Math.min(100, (squatPercent / 50) * 100)}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] text-gray-400">
            <span>Lift: <strong className="text-white">{squat} kg</strong></span>
            <span>Standard: ~36%</span>
          </div>
        </div>

        {/* Bench Press Ratio */}
        <div className="rounded-2xl border border-white/5 bg-black/40 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase text-gray-400">2. Bench Ratio</span>
            <span className="font-heading text-lg font-bold text-cyan-400">{benchPercent}%</span>
          </div>
          <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden mb-2">
            <div 
              className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 rounded-full transition-all duration-500" 
              style={{ width: `${Math.min(100, (benchPercent / 35) * 100)}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] text-gray-400">
            <span>Lift: <strong className="text-white">{bench} kg</strong></span>
            <span>Standard: ~24%</span>
          </div>
        </div>

        {/* Deadlift Ratio */}
        <div className="rounded-2xl border border-white/5 bg-black/40 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase text-gray-400">3. Deadlift Ratio</span>
            <span className="font-heading text-lg font-bold text-red-400">{deadliftPercent}%</span>
          </div>
          <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden mb-2">
            <div 
              className="h-full bg-gradient-to-r from-red-600 to-red-500 rounded-full transition-all duration-500" 
              style={{ width: `${Math.min(100, (deadliftPercent / 55) * 100)}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] text-gray-400">
            <span>Lift: <strong className="text-white">{deadlift} kg</strong></span>
            <span>Standard: ~40%</span>
          </div>
        </div>

      </div>

      {/* Coach Akash & Tanvi Personalized Insights Box */}
      <div className="rounded-2xl border border-gym-primary/30 bg-gradient-to-r from-gym-primary/10 via-black to-gym-primary/5 p-4 sm:p-5 flex items-start gap-3.5">
        <div className="mt-0.5 rounded-full bg-gym-primary/20 p-2 text-gym-primary shrink-0 border border-gym-primary/40">
          <Lightbulb className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-heading text-xs font-bold uppercase tracking-wider text-gym-primary">
              Coaches Akash & Tanvi Technical Recommendation
            </span>
          </div>
          <p className="text-xs text-gray-200 leading-relaxed font-medium mt-1">
            {coachTip}
          </p>
        </div>
      </div>

    </div>
  );
}
