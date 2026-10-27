"use client";

import { motion } from "framer-motion";
import { StrengthClassification } from "@/lib/powerlifting-math";
import { Award, Trophy, Zap, Shield, Sparkles } from "lucide-react";

interface StrengthPercentileGaugeProps {
  glPoints: number;
  dots: number;
  wilks: number;
  total: number;
  classification: StrengthClassification;
  bodyweight: number;
  weightClassLabel: string;
}

export default function StrengthPercentileGauge({
  glPoints,
  dots,
  wilks,
  total,
  classification,
  bodyweight,
  weightClassLabel,
}: StrengthPercentileGaugeProps) {
  const { percentile, tier, badgeColor, description } = classification;
  const topPercent = Math.max(1, 100 - percentile);

  // Gauge angle calculation (180 degree semi-circle arc)
  const angle = Math.min(180, Math.max(0, (percentile / 100) * 180));

  return (
    <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-[#160602] via-[#0d0301] to-black p-6 sm:p-8 shadow-2xl relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-1/4 w-80 h-80 bg-gym-primary/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Top Banner: Tier & Percentile */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-5 mb-6 relative z-10">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-gray-400 block mb-1">
            NATIONAL STRENGTH STANDARD EVALUATION
          </span>
          <h3 className="font-heading text-2xl sm:text-3xl font-bold uppercase text-white tracking-wide">
            {tier}
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <div className={`rounded-full border px-4 py-1.5 text-xs font-bold uppercase tracking-widest shadow-lg ${badgeColor}`}>
            TOP {topPercent}% IN INDIA
          </div>
        </div>
      </div>

      {/* Main Grid: Semi-Circle Gauge (Left) + Three Formula Pillars (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        
        {/* Speedometer Arc Gauge */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center p-4">
          <div className="relative w-64 h-36 flex items-end justify-center">
            {/* SVG Semi-Circle Arc */}
            <svg viewBox="0 0 200 110" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="gaugeGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#718096" />
                  <stop offset="30%" stopColor="#3182ce" />
                  <stop offset="60%" stopColor="#38a169" />
                  <stop offset="85%" stopColor="#dd6b20" />
                  <stop offset="100%" stopColor="#e53e3e" />
                </linearGradient>
              </defs>

              {/* Background Arc */}
              <path
                d="M 20 100 A 80 80 0 0 1 180 100"
                fill="none"
                stroke="#1f2937"
                strokeWidth="16"
                strokeLinecap="round"
              />

              {/* Animated Foreground Arc */}
              <motion.path
                d="M 20 100 A 80 80 0 0 1 180 100"
                fill="none"
                stroke="url(#gaugeGradient)"
                strokeWidth="16"
                strokeLinecap="round"
                strokeDasharray="251.2"
                initial={{ strokeDashoffset: 251.2 }}
                animate={{ strokeDashoffset: 251.2 - (251.2 * (percentile / 100)) }}
                transition={{ duration: 1.2, ease: "easeOut" }}
              />

              {/* Needle Indicator */}
              <motion.g
                initial={{ rotate: -90 }}
                animate={{ rotate: -90 + angle }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                style={{ originX: "100px", originY: "100px" }}
              >
                <line x1="100" y1="100" x2="100" y2="30" stroke="#ff6a33" strokeWidth="3" strokeLinecap="round" />
                <circle cx="100" cy="100" r="6" fill="#fff" stroke="#ff6a33" strokeWidth="2" />
              </motion.g>
            </svg>

            {/* Needle Value readout */}
            <div className="absolute bottom-0 text-center">
              <span className="font-heading text-3xl font-bold text-white leading-none block">
                {percentile}th
              </span>
              <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">
                PERCENTILE
              </span>
            </div>
          </div>

          <p className="text-xs text-gray-400 text-center font-medium mt-3 max-w-xs">
            {description}
          </p>
        </div>

        {/* Scoring Matrix Cards (IPF GL, DOTS, WILKS) */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-3">
          
          {/* 1. Official IPF GL Points */}
          <div className="rounded-2xl border border-gym-primary/40 bg-gradient-to-b from-gym-primary/15 via-black/40 to-black p-4 text-center shadow-[0_0_20px_rgba(230,80,27,0.2)]">
            <div className="flex items-center justify-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-gym-primary mb-1">
              <Trophy className="w-3 h-3" />
              <span>IPF GL POINTS</span>
            </div>
            <span className="font-heading text-3xl sm:text-4xl font-black text-white tracking-tight">
              {glPoints}
            </span>
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block mt-1">
              Official Goodlift 2026
            </span>
          </div>

          {/* 2. DOTS Score */}
          <div className="rounded-2xl border border-blue-500/30 bg-gradient-to-b from-blue-950/20 via-black/40 to-black p-4 text-center">
            <div className="flex items-center justify-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-blue-400 mb-1">
              <Zap className="w-3 h-3" />
              <span>DOTS SCORE</span>
            </div>
            <span className="font-heading text-3xl sm:text-4xl font-black text-white tracking-tight">
              {dots}
            </span>
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block mt-1">
              All-Federations Standard
            </span>
          </div>

          {/* 3. Wilks Score */}
          <div className="rounded-2xl border border-purple-500/30 bg-gradient-to-b from-purple-950/20 via-black/40 to-black p-4 text-center">
            <div className="flex items-center justify-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-purple-400 mb-1">
              <Shield className="w-3 h-3" />
              <span>WILKS SCORE</span>
            </div>
            <span className="font-heading text-3xl sm:text-4xl font-black text-white tracking-tight">
              {wilks}
            </span>
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block mt-1">
              Classic International
            </span>
          </div>

        </div>

      </div>

      {/* Footer Comparison Callout */}
      <div className="mt-6 bg-black/50 border border-white/5 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-gray-300">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-gym-primary shrink-0" />
          <span>
            Bodyweight: <strong className="text-white">{bodyweight} kg</strong> | Total: <strong className="text-white">{total} kg</strong> in <strong className="text-white">{weightClassLabel}</strong>.
          </span>
        </div>
        <span className="text-[11px] font-mono text-gray-400">
          Ranked against verified Indian national platform database.
        </span>
      </div>

    </div>
  );
}
