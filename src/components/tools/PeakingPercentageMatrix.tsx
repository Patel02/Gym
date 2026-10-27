"use client";

import { useState } from "react";
import { PEAKING_PERCENTAGES, calculatePlateLoad } from "@/lib/powerlifting-math";
import { Dumbbell, Layers, Sparkles, CheckCircle2, ChevronRight } from "lucide-react";

interface PeakingMatrixProps {
  squat1RM: number;
  bench1RM: number;
  deadlift1RM: number;
}

export default function PeakingPercentageMatrix({
  squat1RM,
  bench1RM,
  deadlift1RM,
}: PeakingMatrixProps) {
  const [selectedLift, setSelectedLift] = useState<"squat" | "bench" | "deadlift">("squat");
  const [barWeight, setBarWeight] = useState<20 | 15>(20);

  const active1RM = selectedLift === "squat" ? squat1RM : selectedLift === "bench" ? bench1RM : deadlift1RM;
  const liftLabel = selectedLift === "squat" ? "Squat" : selectedLift === "bench" ? "Bench Press" : "Deadlift";

  return (
    <div className="rounded-3xl border border-white/10 bg-[#0a0301] p-6 sm:p-8 shadow-2xl relative overflow-hidden">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Layers className="w-5 h-5 text-gym-primary" />
            <h4 className="font-heading text-xl font-bold uppercase text-white tracking-wide">
              1RM Peaking Table & Plate Loading Matrix
            </h4>
          </div>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            Periodization Percentages with Calibrated Olympic Plates
          </span>
        </div>

        {/* Barbell Weight Toggle */}
        <div className="flex items-center gap-2 bg-black/60 border border-white/10 rounded-full p-1 text-xs font-mono">
          <span className="text-gray-400 pl-2 text-[10px] font-bold uppercase">Bar:</span>
          <button
            type="button"
            onClick={() => setBarWeight(20)}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
              barWeight === 20 ? "bg-gym-primary text-white" : "text-gray-400 hover:text-white"
            }`}
          >
            20 KG (Standard)
          </button>
          <button
            type="button"
            onClick={() => setBarWeight(15)}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
              barWeight === 15 ? "bg-gym-primary text-white" : "text-gray-400 hover:text-white"
            }`}
          >
            15 KG (Women)
          </button>
        </div>
      </div>

      {/* Lift Selector Tabs */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
        {[
          { id: "squat", name: "Squat", weight: squat1RM },
          { id: "bench", name: "Bench Press", weight: bench1RM },
          { id: "deadlift", name: "Deadlift", weight: deadlift1RM },
        ].map((item) => {
          const isActive = selectedLift === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelectedLift(item.id as any)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-heading text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                isActive
                  ? "bg-gym-primary text-white shadow-[0_0_20px_rgba(230,80,27,0.4)]"
                  : "border border-white/10 bg-white/5 text-gray-400 hover:text-white"
              }`}
            >
              <span>{item.name}</span>
              <span className="rounded-full bg-black/40 px-2 py-0.5 text-[10px] font-mono text-white">
                {item.weight} kg
              </span>
            </button>
          );
        })}
      </div>

      {/* Percentage Table */}
      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-black/40">
        <table className="w-full text-left text-xs text-gray-300">
          <thead className="bg-[#140502] text-[10px] font-semibold uppercase tracking-widest text-gray-400 border-b border-white/10">
            <tr>
              <th className="px-4 py-3.5">Intensity</th>
              <th className="px-4 py-3.5">Training Weight</th>
              <th className="px-4 py-3.5">Periodization Focus</th>
              <th className="px-4 py-3.5">Sleeve Plate Loading (Per Side)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {PEAKING_PERCENTAGES.map((row) => {
              const exactTarget = (active1RM * row.percent) / 100;
              const plateData = calculatePlateLoad(exactTarget, barWeight);

              return (
                <tr key={row.percent} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-white">
                    {row.percent}%
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-heading text-sm font-black text-gym-primary">
                      {plateData.targetWeight} kg
                    </span>
                    <span className="text-[10px] font-mono text-gray-500 block">
                      ({exactTarget.toFixed(1)} kg raw)
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-bold text-white block">{row.label.split("—")[1]?.trim()}</span>
                    <span className="text-[10px] text-gray-400 block">{row.reps}</span>
                  </td>
                  <td className="px-4 py-3">
                    {plateData.plates.length === 0 ? (
                      <span className="text-[11px] text-gray-500 italic">Empty Barbell ({barWeight} kg)</span>
                    ) : (
                      <div className="flex flex-wrap items-center gap-1.5">
                        {plateData.plates.map((p, idx) => (
                          <span
                            key={idx}
                            className={`rounded px-2 py-0.5 text-[10px] font-semibold border font-mono ${p.color}`}
                            title={`${p.countPerSide}x ${p.weight}kg plate per side`}
                          >
                            {p.countPerSide > 1 ? `${p.countPerSide}×` : ""}{p.weight}kg
                          </span>
                        ))}
                        <span className="text-[10px] text-gray-400 font-mono">
                          = {plateData.weightPerSide}kg/side
                        </span>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
}
