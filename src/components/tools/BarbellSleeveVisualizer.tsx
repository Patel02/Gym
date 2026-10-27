"use client";

import type { BarbellLoadResult, PlateDenomination } from "@/lib/plate-calculator";
import { Info, Lock } from "lucide-react";
import React from "react";

interface BarbellSleeveVisualizerProps {
  load: BarbellLoadResult;
  showFullBarbell?: boolean;
  className?: string;
}

export function BarbellSleeveVisualizer({
  load,
  showFullBarbell = false,
  className = "",
}: BarbellSleeveVisualizerProps) {
  const { barWeight, collarWeight, platesPerSide, plateCountsPerSide, actualWeight, isExact } = load;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Visual Barbell Container */}
      <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-gradient-to-b from-[#180803] via-[#0e0301] to-[#120402] p-4 sm:p-6 shadow-2xl">
        {/* Glow Effects */}
        <div className="absolute -left-10 -top-10 h-32 w-32 rounded-full bg-gym-primary/10 blur-2xl pointer-events-none" />
        <div className="absolute -right-10 -bottom-10 h-32 w-32 rounded-full bg-red-600/10 blur-2xl pointer-events-none" />

        {/* Top Barbell Info Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-heading text-sm font-bold uppercase tracking-wider text-white">
              Olympic Barbell Sleeve Load
            </span>
            <span className="rounded bg-gym-primary/20 px-2 py-0.5 font-mono text-[11px] font-bold text-gym-primary border border-gym-primary/30">
              {actualWeight} KG TOTAL
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-gray-400">
            <span>Bar: <strong className="text-white">{barWeight} kg</strong></span>
            <span>•</span>
            <span>Collars: <strong className="text-white">{collarWeight * 2} kg</strong></span>
            <span>•</span>
            <span>Per Side: <strong className="text-gym-primary">{load.sideWeight} kg</strong></span>
          </div>
        </div>

        {/* ── SVG BARBELL SLEEVE RENDERER ── */}
        <div className="my-6 flex items-center justify-center overflow-x-auto py-2">
          <div className="relative flex items-center min-w-[340px] max-w-full h-44 sm:h-52 select-none">
            
            {/* Left Shaft (Steel Bar) */}
            <div className="h-4 w-12 sm:w-20 bg-gradient-to-r from-zinc-600 via-zinc-400 to-zinc-500 rounded-l shadow-inner shrink-0" />

            {/* Inner Barbell Collar Ring (Stop) */}
            <div className="h-20 w-4 bg-gradient-to-r from-zinc-700 via-zinc-300 to-zinc-800 rounded-sm shadow-md border-r border-zinc-900 shrink-0 z-10" />

            {/* Barbell Sleeve (Underneath plates) */}
            <div className="relative flex items-center h-full">
              {/* The Sleeve Cylinder */}
              <div className="absolute top-1/2 -translate-y-1/2 left-0 h-9 w-full min-w-[200px] bg-gradient-to-b from-zinc-400 via-zinc-200 to-zinc-500 rounded-r shadow-inner -z-0" />

              {/* ── STACKED PLATES (From inside out) ── */}
              <div className="relative z-10 flex items-center gap-1 pl-1">
                {platesPerSide.length === 0 ? (
                  <div className="px-6 py-2 text-xs font-bold uppercase tracking-wider text-zinc-400 bg-black/60 rounded-xl border border-white/10 backdrop-blur-md">
                    Empty Barbell ({barWeight} KG)
                  </div>
                ) : (
                  platesPerSide.map((plate, idx) => (
                    <div
                      key={idx}
                      style={{
                        height: `${plate.heightPercent}%`,
                        width: `${plate.widthPx}px`,
                        backgroundColor: plate.hexColor,
                      }}
                      className={`relative flex flex-col items-center justify-between rounded-sm shadow-lg shrink-0 transition-transform duration-300 hover:scale-105 group cursor-pointer ${
                        plate.borderClass || "border-x border-black/30"
                      }`}
                      title={`${plate.weight} KG (${plate.colorName})`}
                    >
                      {/* Top Lip highlight */}
                      <div className="w-full h-1 bg-white/40 rounded-t" />

                      {/* Plate Weight Label */}
                      <span
                        className={`font-mono text-[9px] sm:text-[10px] font-semibold leading-none transform -rotate-90 select-none ${plate.textClass}`}
                      >
                        {plate.weight}
                      </span>

                      {/* Bottom Lip shadow */}
                      <div className="w-full h-1 bg-black/40 rounded-b" />
                    </div>
                  ))
                )}

                {/* Competition Collar Clamp */}
                {collarWeight > 0 && platesPerSide.length > 0 && (
                  <div
                    className="relative h-16 w-5 sm:w-6 rounded-sm bg-gradient-to-r from-zinc-400 via-zinc-200 to-zinc-600 border border-zinc-700 shadow-xl flex flex-col items-center justify-center shrink-0 ml-0.5"
                    title={`Competition Collar: ${collarWeight} KG`}
                  >
                    <Lock className="h-3 w-3 text-zinc-800" />
                    <span className="text-[7px] font-black text-zinc-900 leading-none mt-0.5">
                      {collarWeight}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Sleeve Cap End */}
            <div className="h-9 w-3 bg-gradient-to-r from-zinc-700 to-zinc-900 rounded-r shadow-md shrink-0 ml-1 border-l border-black/40" />
          </div>
        </div>

        {/* ── PLATE BREAKDOWN CHIPS (PER SIDE) ── */}
        <div className="border-t border-white/10 pt-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Info className="h-3.5 w-3.5 text-gym-primary" />
            <span className="font-semibold">Load Each Side With:</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {plateCountsPerSide.length === 0 ? (
              <span className="text-xs text-gray-400 italic">No plates needed (Empty bar)</span>
            ) : (
              plateCountsPerSide.map((item) => (
                <div
                  key={item.plate.weight}
                  style={{ backgroundColor: item.plate.hexColor }}
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-black shadow-xs ${
                    item.plate.textClass
                  } ${item.plate.borderClass || ""}`}
                >
                  <span>{item.count}×</span>
                  <span>{item.plate.weight}kg</span>
                </div>
              ))
            )}

            {collarWeight > 0 && (
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-300 text-zinc-900 text-xs font-black shadow-xs border border-zinc-400">
                <Lock className="h-3 w-3 text-zinc-800" />
                <span>1× {collarWeight}kg Collar</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
