"use client";

import React, { useState } from "react";
import { calculateBarbellPlates, type LoadedPlateItem, type PlateDenomination } from "@/lib/plate-calculator";
import { Dumbbell, CheckCircle2, ShieldCheck, Scale, AlertCircle, Plus, Minus } from "lucide-react";

interface BarbellPlateVisualizerProps {
  declaredWeight: number;
  onWeightChange?: (newWeight: number) => void;
  barWeight?: number;
  collarWeight?: number;
}

export function BarbellPlateVisualizer({
  declaredWeight,
  onWeightChange,
  barWeight = 20,
  collarWeight = 2.5,
}: BarbellPlateVisualizerProps) {
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const load = calculateBarbellPlates(declaredWeight, barWeight, collarWeight);

  const handleAdjust = (delta: number) => {
    if (onWeightChange) {
      const next = Math.max(20, declaredWeight + delta);
      onWeightChange(next);
      setIsVerified(false);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-[#140c08] via-[#0d0705] to-[#070302] p-5 shadow-2xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-white/10 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <Dumbbell className="h-4 w-4 text-gym-primary" />
          <div>
            <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-white">
              Official Calibrated Barbell &amp; Plate Loader
            </h4>
            <span className="text-[10px] text-zinc-500 font-medium">
              IPF Spec: 20kg Eleiko/Titan Bar + 2x 2.5kg Calibrated Competition Collars
            </span>
          </div>
        </div>

        {/* Verification Checkmark for Referee / Platform Loader */}
        <button
          type="button"
          onClick={() => setIsVerified(!isVerified)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
            isVerified
              ? "border-emerald-500 bg-emerald-500/20 text-emerald-300 shadow-md shadow-emerald-950"
              : "border-white/15 bg-white/5 text-zinc-400 hover:text-white"
          }`}
        >
          {isVerified ? (
            <>
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              <span>Load Verified by Referee</span>
            </>
          ) : (
            <>
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Mark Bar Loaded &amp; Verified</span>
            </>
          )}
        </button>
      </div>

      {/* Visual Barbell Graphic */}
      <div className="rounded-2xl border border-white/10 bg-black/80 p-4 mb-4 flex flex-col items-center justify-center overflow-x-auto min-h-[120px]">
        <div className="flex items-center justify-center min-w-[360px] py-3">
          {/* Inner Shaft */}
          <div className="h-3 w-16 bg-gradient-to-b from-zinc-400 via-zinc-200 to-zinc-500 rounded-l shadow-inner shrink-0" />
          
          {/* Barbell Inside Sleeve Collar */}
          <div className="h-12 w-3 bg-gradient-to-b from-zinc-300 via-zinc-100 to-zinc-400 border border-zinc-500 shrink-0" />

          {/* Loaded Plates (Rendered from heaviest to lightest) */}
          <div className="flex items-center gap-0.5 shrink-0">
            {load.platesPerSide.length === 0 ? (
              <span className="text-[10px] text-zinc-500 italic px-4">Empty Barbell (20 KG)</span>
            ) : (
              load.platesPerSide.map((plate, idx) => {
                const heightPx = Math.round((plate.heightPercent / 100) * 88);
                return (
                  <div
                    key={`${plate.weight}-${idx}`}
                    style={{ height: `${heightPx}px`, width: `${Math.max(12, plate.widthPx)}px` }}
                    className={`${plate.bgClass} ${plate.borderClass || ""} rounded-sm shadow-md flex flex-col items-center justify-center border-x border-black/40 transition-all hover:scale-105 relative group`}
                    title={`${plate.weight} KG ${plate.colorName} Plate`}
                  >
                    <span className="text-[8px] font-black text-white transform -rotate-90 select-none drop-shadow">
                      {plate.weight}
                    </span>
                  </div>
                );
              })
            )}

            {/* Competition Outer Collar (2.5 KG) */}
            <div
              className="h-14 w-4 bg-gradient-to-b from-zinc-400 via-zinc-200 to-zinc-600 border border-zinc-700 rounded-sm shadow flex items-center justify-center shrink-0"
              title="2.5 KG Calibrated Steel Collar"
            >
              <span className="text-[7px] font-black text-zinc-900 transform -rotate-90 select-none">
                2.5
              </span>
            </div>
          </div>

          {/* Outer Sleeve Tip */}
          <div className="h-4 w-10 bg-gradient-to-b from-zinc-400 via-zinc-200 to-zinc-500 rounded-r shadow-inner shrink-0" />
        </div>

        {/* Load Breakdown Text */}
        <div className="mt-2 text-center text-xs text-zinc-300 font-mono">
          <span className="text-zinc-500">Each Side: </span>
          {load.plateCountsPerSide.length === 0 ? (
            <span className="text-zinc-500">No plates (Bar only)</span>
          ) : (
            load.plateCountsPerSide.map((item, i) => (
              <span key={item.plate.weight} className="inline-block mx-1">
                <strong className={item.plate.weight >= 20 ? "text-red-400" : "text-amber-300"}>
                  {item.count}×{item.plate.weight}kg
                </strong>
                {i < load.plateCountsPerSide.length - 1 ? " +" : ""}
              </span>
            ))
          )}
          <span className="text-zinc-500"> + 2.5kg collar = </span>
          <strong className="text-white">{(load.sideWeight + collarWeight).toFixed(1)}kg/side</strong>
        </div>
      </div>

      {/* Quick Weight Adjuster Chips */}
      {onWeightChange && (
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/10">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold uppercase text-zinc-500">Quick Adjust:</span>
            {[-5, -2.5, +2.5, +5, +7.5, +10].map((delta) => (
              <button
                key={delta}
                type="button"
                onClick={() => handleAdjust(delta)}
                className={`px-2 py-1 rounded-lg text-[10px] font-semibold tracking-wider transition-all cursor-pointer ${
                  delta > 0
                    ? "bg-gym-primary/15 hover:bg-gym-primary/30 border border-gym-primary/40 text-gym-primary"
                    : "bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-400 hover:text-white"
                }`}
              >
                {delta > 0 ? `+${delta}` : delta} kg
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-zinc-400">Total Bar:</span>
            <span className="text-sm font-black text-gym-primary font-heading font-mono">
              {declaredWeight} KG
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
