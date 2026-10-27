"use client";

import {
  generateWarmupRamp,
  type BarbellLoadResult,
  type WarmupProtocolType,
  type WarmupSet,
} from "@/lib/plate-calculator";
import { AttemptStrategyMatrix } from "@/components/tools/AttemptStrategyMatrix";
import { BarbellSleeveVisualizer } from "@/components/tools/BarbellSleeveVisualizer";
import { WarmupRestTimer } from "@/components/tools/WarmupRestTimer";
import WhatsAppIcon from "@/components/ui/WhatsAppIcon";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Copy,
  Dumbbell,
  Flame,
  Minus,
  Plus,
  Printer,
  RotateCcw,
  Scale,
  Share2,
  Sparkles,
  Zap,
} from "lucide-react";
import React, { useMemo, useState } from "react";

interface WarmupCalculatorAppProps {
  initialOpener?: number;
  initialDiscipline?: "SQUAT" | "BENCH" | "DEADLIFT";
  athleteName?: string;
  bodyweight?: number;
}

export function WarmupCalculatorApp({
  initialOpener = 210,
  initialDiscipline = "SQUAT",
  athleteName = "Patel Rakesh",
  bodyweight = 83,
}: WarmupCalculatorAppProps) {
  const [discipline, setDiscipline] = useState<"SQUAT" | "BENCH" | "DEADLIFT">(initialDiscipline);
  const [openerWeight, setOpenerWeight] = useState<number>(initialOpener);
  const [barWeight, setBarWeight] = useState<number>(20);
  const [collarWeight, setCollarWeight] = useState<number>(2.5);
  const [protocol, setProtocol] = useState<WarmupProtocolType>("standard-5");
  const [selectedSetIndex, setSelectedSetIndex] = useState<number>(0);
  const [completedSets, setCompletedSets] = useState<Record<number, boolean>>({});
  const [copied, setCopied] = useState<boolean>(false);

  // Generate Warm-Up Ramp
  const warmupSets: WarmupSet[] = useMemo(() => {
    return generateWarmupRamp(openerWeight, protocol, barWeight, collarWeight);
  }, [openerWeight, protocol, barWeight, collarWeight]);

  // Selected Set for visualizer
  const activeSet = warmupSets[selectedSetIndex] || warmupSets[0];

  // Quick increment/decrement
  const adjustOpener = (delta: number) => {
    setOpenerWeight((prev) => Math.max(barWeight, Math.round((prev + delta) * 2) / 2));
  };

  // Toggle set completed checkbox
  const toggleSetCompleted = (setNum: number) => {
    setCompletedSets((prev) => ({
      ...prev,
      [setNum]: !prev[setNum],
    }));
  };

  // WhatsApp Pre-composed message
  const whatsappMessage = useMemo(() => {
    let msg = `🏋️‍♂️ *IPF WARM-UP & ATTEMPT PLAN: ${discipline}*\n`;
    msg += `Athlete: *${athleteName}*\n`;
    msg += `Planned Opener: *${openerWeight} KG*\n`;
    msg += `Bar: *${barWeight}kg* | Collars: *${collarWeight * 2}kg*\n\n`;
    msg += `*WARM-UP RAMP:*\n`;
    warmupSets.forEach((s) => {
      msg += `• Set ${s.setNumber} (${s.percentage}%): *${s.weight} KG* × ${s.reps} reps (~${s.estimatedMinutesBeforeOpener}m out)\n`;
    });
    msg += `\n*PLATFORM OPENER:* 100% — *${openerWeight} KG*\n`;
    msg += `Generated via A&T Official Powerlifting Hub`;
    return encodeURIComponent(msg);
  }, [discipline, athleteName, openerWeight, barWeight, collarWeight, warmupSets]);

  const handleCopyPlan = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      let text = `IPF WARM-UP PLAN: ${discipline} (${openerWeight} KG OPENER)\n\n`;
      warmupSets.forEach((s) => {
        text += `Set ${s.setNumber} (${s.percentage}%): ${s.weight} KG x ${s.reps} (${s.notes})\n`;
      });
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const printStyles = `
    @media print {
      @page {
        size: A4 portrait;
        margin: 8mm 10mm;
      }
      html, body {
        background: #ffffff !important;
        color: #000000 !important;
        margin: 0 !important;
        padding: 0 !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      body > *:not(#print-warmup-container) {
        display: none !important;
      }
      .no-print {
        display: none !important;
      }
      #print-warmup-container {
        display: block !important;
        visibility: visible !important;
        position: static !important;
        width: 100% !important;
        max-width: 100% !important;
        background: #ffffff !important;
        color: #000000 !important;
      }
      #print-warmup-sheet {
        display: block !important;
        visibility: visible !important;
      }
    }
  `;

  return (
    <div className="space-y-8" id="print-warmup-container">
      <style dangerouslySetInnerHTML={{ __html: printStyles }} />

      {/* ══════════════════════════════════════════════════════════════════════════════
          1. TOP HERO HEADER & CONTROLS (SCREEN VIEW)
         ══════════════════════════════════════════════════════════════════════════════ */}
      <div className="no-print relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-[#180803] via-[#0e0301] to-[#120402] p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-gym-primary/15 blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-gym-primary/40 bg-gym-primary/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-gym-primary">
              <Flame className="h-3.5 w-3.5 fill-current" />
              <span>OFFICIAL IPF WARM-UP &amp; ATTEMPT HUB</span>
            </div>

            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-wider text-white">
              Warm-Up Room <span className="text-gym-primary">&amp; Plate Calculator</span>
            </h1>

            <p className="text-sm font-medium text-gray-400 max-w-2xl leading-relaxed">
              Backstage attempt timing, calibrated Olympic barbell plate loading visualizer, and 3-attempt competition jump curves for lifters &amp; coaches.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={handleCopyPlan}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider text-gray-300 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  <span>Copy Ramp</span>
                </>
              )}
            </button>

            <a
              href={`https://wa.me/?text=${whatsappMessage}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-md hover:brightness-110 transition-all cursor-pointer"
            >
              <WhatsAppIcon variant="official" className="h-4 w-4" />
              <span>Share Plan</span>
            </a>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-gym-primary to-gym-red px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-md hover:brightness-110 transition-all cursor-pointer"
            >
              <Printer className="h-4 w-4" />
              <span>Print Sheet</span>
            </button>
          </div>
        </div>

        {/* ── DISCIPLINE TABS ── */}
        <div className="mt-6 pt-5 border-t border-white/10 flex flex-wrap items-center gap-2.5">
          {(["SQUAT", "BENCH", "DEADLIFT"] as const).map((d) => (
            <button
              key={d}
              onClick={() => {
                setDiscipline(d);
                // Adjust default opener based on discipline
                if (d === "SQUAT") setOpenerWeight(210);
                if (d === "BENCH") setOpenerWeight(140);
                if (d === "DEADLIFT") setOpenerWeight(240);
                setSelectedSetIndex(0);
              }}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                discipline === d
                  ? "bg-gym-primary text-white shadow-[0_0_25px_rgba(230,80,27,0.4)] scale-102"
                  : "bg-black/40 text-gray-400 hover:text-white hover:bg-white/10 border border-white/10"
              }`}
            >
              <Dumbbell className="h-4 w-4" />
              <span>{d === "BENCH" ? "BENCH PRESS" : d}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════════════
          2. CONFIGURATION CARDS (OPENER INPUT, BARBELL, COLLARS, RAMP PROTOCOL)
         ══════════════════════════════════════════════════════════════════════════════ */}
      <div className="no-print grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Platform Opener Weight */}
        <div className="rounded-2xl border border-white/15 bg-gradient-to-b from-[#180803] to-black p-4 flex flex-col justify-between shadow-xl">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
            <span className="font-bold uppercase tracking-wider">PLATFORM OPENER</span>
            <span className="text-gym-primary font-bold">100% Target</span>
          </div>

          <div className="my-1 flex items-center justify-between gap-2">
            <button
              onClick={() => adjustOpener(-5)}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white hover:bg-white/20 active:scale-95 transition-all text-sm font-black cursor-pointer"
              title="-5 KG"
            >
              -5
            </button>

            <div className="flex-1 text-center">
              <input
                type="number"
                step={2.5}
                min={20}
                max={500}
                value={openerWeight}
                onChange={(e) => setOpenerWeight(Number(e.target.value) || 20)}
                className="w-full bg-transparent text-center font-heading text-4xl font-bold text-white focus:outline-none"
              />
              <span className="text-[10px] font-bold uppercase tracking-widest text-gym-primary">
                KILOGRAMS
              </span>
            </div>

            <button
              onClick={() => adjustOpener(5)}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white hover:bg-white/20 active:scale-95 transition-all text-sm font-black cursor-pointer"
              title="+5 KG"
            >
              +5
            </button>
          </div>

          <div className="mt-2 flex items-center justify-center gap-1">
            {[-2.5, +2.5].map((delta) => (
              <button
                key={delta}
                onClick={() => adjustOpener(delta)}
                className="rounded-lg bg-black/40 border border-white/10 px-2.5 py-1 text-[10px] font-bold text-gray-300 hover:text-white transition-all cursor-pointer"
              >
                {delta > 0 ? `+${delta}` : delta} kg
              </button>
            ))}
          </div>
        </div>

        {/* Card 2: Barbell Type */}
        <div className="rounded-2xl border border-white/15 bg-gradient-to-b from-[#180803] to-black p-4 flex flex-col justify-between shadow-xl">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
            <span className="font-bold uppercase tracking-wider">BARBELL SELECTION</span>
            <span className="font-mono text-zinc-300">{barWeight} KG</span>
          </div>

          <div className="space-y-1.5 my-auto">
            {[
              { label: "20 KG (IPF Power Bar)", weight: 20 },
              { label: "15 KG (Women's Olympic)", weight: 15 },
              { label: "25 KG (Specialty Squat Bar)", weight: 25 },
            ].map((b) => (
              <button
                key={b.weight}
                onClick={() => setBarWeight(b.weight)}
                className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-between ${
                  barWeight === b.weight
                    ? "bg-gym-primary text-white shadow-md"
                    : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
                }`}
              >
                <span>{b.label}</span>
                {barWeight === b.weight && <Check className="h-3.5 w-3.5" />}
              </button>
            ))}
          </div>
        </div>

        {/* Card 3: Collars Selection */}
        <div className="rounded-2xl border border-white/15 bg-gradient-to-b from-[#180803] to-black p-4 flex flex-col justify-between shadow-xl">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
            <span className="font-bold uppercase tracking-wider">COLLAR PAIR</span>
            <span className="font-mono text-zinc-300">{collarWeight * 2} KG PAIR</span>
          </div>

          <div className="space-y-1.5 my-auto">
            {[
              { label: "2.5 KG Competition Collars", weight: 2.5 },
              { label: "0.5 KG Spring Collars", weight: 0.5 },
              { label: "None (0 KG Bare Sleeve)", weight: 0 },
            ].map((c) => (
              <button
                key={c.weight}
                onClick={() => setCollarWeight(c.weight)}
                className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-between ${
                  collarWeight === c.weight
                    ? "bg-gym-primary text-white shadow-md"
                    : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
                }`}
              >
                <span>{c.label}</span>
                {collarWeight === c.weight && <Check className="h-3.5 w-3.5" />}
              </button>
            ))}
          </div>
        </div>

        {/* Card 4: Ramp Protocol */}
        <div className="rounded-2xl border border-white/15 bg-gradient-to-b from-[#180803] to-black p-4 flex flex-col justify-between shadow-xl">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
            <span className="font-bold uppercase tracking-wider">RAMP PROTOCOL</span>
            <span className="text-gym-primary font-bold">Flight Pacing</span>
          </div>

          <div className="space-y-1.5 my-auto">
            {[
              { id: "standard-5", label: "Classic 5-Set (25m Out)" },
              { id: "heavy-flight-6", label: "Heavy 6-Set (28m Out)" },
              { id: "fast-4", label: "Fast 4-Set (20m Out)" },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  setProtocol(p.id as WarmupProtocolType);
                  setSelectedSetIndex(0);
                }}
                className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-between ${
                  protocol === p.id
                    ? "bg-gym-primary text-white shadow-md"
                    : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
                }`}
              >
                <span>{p.label}</span>
                {protocol === p.id && <Check className="h-3.5 w-3.5" />}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* ══════════════════════════════════════════════════════════════════════════════
          3. ACTIVE SET VISUALIZER + REST TIMER DUAL COLUMN
         ══════════════════════════════════════════════════════════════════════════════ */}
      <div className="no-print grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left 2 Cols: Barbell Sleeve Visualizer */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-heading text-lg font-bold uppercase tracking-wider text-white">
              Selected Set Loading:{" "}
              <span className="text-gym-primary">
                Set #{activeSet.setNumber} ({activeSet.weight} KG • {activeSet.reps} Reps)
              </span>
            </h3>
            <span className="text-xs text-gray-400">
              Click any set in the table below to inspect its sleeve load
            </span>
          </div>

          <BarbellSleeveVisualizer load={activeSet.load} />
        </div>

        {/* Right 1 Col: Rest Timer */}
        <div className="space-y-3">
          <h3 className="font-heading text-lg font-bold uppercase tracking-wider text-white">
            Backstage Rest Clock
          </h3>
          <WarmupRestTimer initialSeconds={180} />
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════════════
          4. THE WARM-UP RAMP TABLE
         ══════════════════════════════════════════════════════════════════════════════ */}
      <div className="no-print rounded-3xl border border-white/10 bg-gradient-to-b from-[#180803] via-[#0e0301] to-[#120402] p-5 sm:p-6 shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-gym-primary" />
            <h2 className="font-heading text-xl font-bold uppercase tracking-wider text-white">
              Warm-Up Flight Schedule &amp; Plate Breakdown
            </h2>
          </div>

          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span>Completed: <strong className="text-emerald-400">{Object.values(completedSets).filter(Boolean).length} / {warmupSets.length} Sets</strong></span>
            <span>•</span>
            <button
              onClick={() => setCompletedSets({})}
              className="text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              Reset Checks
            </button>
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                <th className="py-3 px-3">Done</th>
                <th className="py-3 px-3">Set</th>
                <th className="py-3 px-3">Intensity</th>
                <th className="py-3 px-3">Weight (KG)</th>
                <th className="py-3 px-3">Reps</th>
                <th className="py-3 px-4">Plates Per Side</th>
                <th className="py-3 px-3">Flight Timing</th>
                <th className="py-3 px-3 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {warmupSets.map((s, idx) => {
                const isSelected = selectedSetIndex === idx;
                const isDone = completedSets[s.setNumber];

                return (
                  <tr
                    key={s.setNumber}
                    onClick={() => setSelectedSetIndex(idx)}
                    className={`transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-gym-primary/15 text-white"
                        : "hover:bg-white/5 text-gray-300"
                    } ${isDone ? "opacity-60" : ""}`}
                  >
                    {/* Checkbox */}
                    <td className="py-3.5 px-3">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSetCompleted(s.setNumber);
                        }}
                        className={`flex h-5 w-5 items-center justify-center rounded-md border transition-all cursor-pointer ${
                          isDone
                            ? "border-emerald-500 bg-emerald-500 text-black"
                            : "border-white/20 bg-white/5 hover:border-white/40"
                        }`}
                      >
                        {isDone && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                      </button>
                    </td>

                    {/* Set Number */}
                    <td className="py-3.5 px-3 font-mono font-bold text-white">
                      #{s.setNumber}
                    </td>

                    {/* Percentage */}
                    <td className="py-3.5 px-3 font-mono text-gym-primary font-bold">
                      {s.percentage}%
                    </td>

                    {/* Total Weight */}
                    <td className="py-3.5 px-3 font-mono text-sm font-black text-white">
                      {s.weight} KG
                    </td>

                    {/* Reps */}
                    <td className="py-3.5 px-3 font-bold text-gray-200">
                      {s.reps} {typeof s.reps === "number" && s.reps === 1 ? "rep" : "reps"}
                    </td>

                    {/* Plate Breakdown Chips */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap items-center gap-1">
                        {s.load.plateCountsPerSide.length === 0 ? (
                          <span className="text-[10px] text-gray-500 italic">Empty Bar</span>
                        ) : (
                          s.load.plateCountsPerSide.map((item) => (
                            <span
                              key={item.plate.weight}
                              style={{ backgroundColor: item.plate.hexColor }}
                              className={`px-1.5 py-0.5 rounded text-[10px] font-semibold shadow-xs ${
                                item.plate.textClass
                              } ${item.plate.borderClass || ""}`}
                            >
                              {item.count}×{item.plate.weight}k
                            </span>
                          ))
                        )}
                        {collarWeight > 0 && s.load.platesPerSide.length > 0 && (
                          <span className="px-1.5 py-0.5 rounded bg-zinc-300 text-zinc-900 text-[10px] font-bold">
                            +c
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Flight Timing Out */}
                    <td className="py-3.5 px-3 text-gray-400 font-mono">
                      ~{s.estimatedMinutesBeforeOpener}m out
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-3 text-right">
                      <span
                        className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase transition-all ${
                          isSelected
                            ? "bg-gym-primary text-white"
                            : "bg-white/5 text-gray-400 hover:text-white"
                        }`}
                      >
                        View
                      </span>
                    </td>
                  </tr>
                );
              })}

              {/* Platform Opener Row */}
              <tr className="border-t-2 border-gym-primary/50 bg-gradient-to-r from-gym-primary/20 to-transparent font-black">
                <td className="py-4 px-3 text-gym-primary">
                  <Flame className="h-4 w-4" />
                </td>
                <td className="py-4 px-3 font-heading text-sm text-gym-primary">
                  STAGE
                </td>
                <td className="py-4 px-3 font-mono text-gym-primary">
                  100%
                </td>
                <td className="py-4 px-3 font-mono text-base text-white">
                  {openerWeight} KG
                </td>
                <td className="py-4 px-3 text-white">
                  1 rep (OPENER)
                </td>
                <td className="py-4 px-4 text-xs text-gray-300 font-medium">
                  Walk onto the competition platform when marshals call your name!
                </td>
                <td className="py-4 px-3 font-mono text-gym-primary font-bold">
                  0m (LIFT)
                </td>
                <td className="py-4 px-3 text-right">
                  <span className="rounded bg-gym-primary px-2 py-0.5 text-[9px] font-semibold uppercase text-white">
                    PLATFORM
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════════════
          5. 3-ATTEMPT COMPETITION JUMP MATRIX
         ══════════════════════════════════════════════════════════════════════════════ */}
      <div className="no-print">
        <AttemptStrategyMatrix
          openerWeight={openerWeight}
          disciplineName={discipline}
          bodyweight={bodyweight}
        />
      </div>

      {/* ══════════════════════════════════════════════════════════════════════════════
          6. DEDICATED PRINTABLE COACH CLIPBOARD SHEET (A4 PORTRAIT)
         ══════════════════════════════════════════════════════════════════════════════ */}
      <div id="print-warmup-sheet" className="hidden bg-white text-zinc-950 p-6 font-sans text-left">
        {/* Print Header */}
        <div className="flex items-center justify-between border-b-2 border-black pb-3 mb-4">
          <div>
            <h1 className="text-xl font-bold uppercase tracking-wider text-black font-serif">
              Indian Powerlifting Federation
            </h1>
            <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-700">
              Official Coach &amp; Lifter Warm-Up Room Sheet • {discipline}
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs font-bold uppercase text-black">
              Athlete: {athleteName}
            </div>
            <div className="text-[10px] font-bold text-zinc-600">
              Planned Opener: <strong className="text-black text-sm">{openerWeight} KG</strong>
            </div>
          </div>
        </div>

        {/* Equipment Specs */}
        <div className="flex items-center justify-between text-[9px] text-zinc-600 border border-zinc-300 bg-zinc-50 p-2 rounded mb-4">
          <span>Barbell: <strong>{barWeight} KG</strong></span>
          <span>•</span>
          <span>Collars: <strong>{collarWeight * 2} KG Pair</strong></span>
          <span>•</span>
          <span>Protocol: <strong>{protocol.toUpperCase()}</strong></span>
          <span>•</span>
          <span>Date: <strong>{new Date().toLocaleDateString("en-IN")}</strong></span>
        </div>

        {/* Print Table */}
        <table className="w-full text-left text-xs border-collapse border border-zinc-400 mb-6">
          <thead>
            <tr className="bg-zinc-100 text-[10px] font-semibold uppercase tracking-wider text-black border-b border-zinc-400">
              <th className="py-2 px-3 border-r border-zinc-400">Check</th>
              <th className="py-2 px-3 border-r border-zinc-400">Set</th>
              <th className="py-2 px-3 border-r border-zinc-400">Intensity</th>
              <th className="py-2 px-3 border-r border-zinc-400">Weight</th>
              <th className="py-2 px-3 border-r border-zinc-400">Reps</th>
              <th className="py-2 px-4 border-r border-zinc-400">Plates Each Side</th>
              <th className="py-2 px-3">Flight Timing</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-300">
            {warmupSets.map((s) => (
              <tr key={s.setNumber}>
                <td className="py-2 px-3 border-r border-zinc-300 font-mono text-center">
                  [ &nbsp;&nbsp; ]
                </td>
                <td className="py-2 px-3 border-r border-zinc-300 font-bold">
                  Set #{s.setNumber}
                </td>
                <td className="py-2 px-3 border-r border-zinc-300 font-mono">
                  {s.percentage}%
                </td>
                <td className="py-2 px-3 border-r border-zinc-300 font-bold text-sm">
                  {s.weight} KG
                </td>
                <td className="py-2 px-3 border-r border-zinc-300">
                  {s.reps} reps
                </td>
                <td className="py-2 px-4 border-r border-zinc-300 font-mono text-[10px]">
                  {s.load.plateCountsPerSide.length === 0
                    ? "Empty Bar"
                    : s.load.plateCountsPerSide.map((p) => `${p.count}x ${p.plate.weight}k`).join(" + ") + (collarWeight > 0 ? " + Collar" : "")}
                </td>
                <td className="py-2 px-3 font-mono text-[10px]">
                  ~{s.estimatedMinutesBeforeOpener} min out
                </td>
              </tr>
            ))}
            <tr className="bg-zinc-200 font-black border-t-2 border-black">
              <td className="py-2 px-3 border-r border-zinc-400 text-center">[ &nbsp;&nbsp; ]</td>
              <td className="py-2 px-3 border-r border-zinc-400">OPENER</td>
              <td className="py-2 px-3 border-r border-zinc-400">100%</td>
              <td className="py-2 px-3 border-r border-zinc-400 text-sm">{openerWeight} KG</td>
              <td className="py-2 px-3 border-r border-zinc-400">1 rep</td>
              <td className="py-2 px-4 border-r border-zinc-400" colSpan={2}>
                PLATFORM ATTEMPT 1
              </td>
            </tr>
          </tbody>
        </table>

        {/* Attempt Jump Targets */}
        <div className="border border-zinc-300 rounded p-3 bg-zinc-50 text-xs">
          <div className="font-bold uppercase text-[10px] text-zinc-700 mb-2">
            Coach Attempt Declaration Plan:
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="border border-zinc-200 bg-white p-2 rounded">
              <div className="text-[9px] uppercase text-zinc-500 font-bold">Attempt 1 (Opener)</div>
              <div className="text-base font-bold text-black">{openerWeight} KG</div>
            </div>
            <div className="border border-zinc-200 bg-white p-2 rounded">
              <div className="text-[9px] uppercase text-zinc-500 font-bold">Attempt 2 (Builder)</div>
              <div className="text-base font-bold text-black">
                {Math.round((openerWeight * 1.075) / 2.5) * 2.5} KG
              </div>
            </div>
            <div className="border border-zinc-200 bg-white p-2 rounded">
              <div className="text-[9px] uppercase text-zinc-500 font-bold">Attempt 3 (Peak)</div>
              <div className="text-base font-bold text-black">
                {Math.round(((Math.round((openerWeight * 1.075) / 2.5) * 2.5) * 1.045) / 2.5) * 2.5} KG
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-3 border-t border-zinc-300 flex items-center justify-between text-[8px] text-zinc-500">
          <span>Official Technical Clipboard Sheet • Indian Powerlifting Federation</span>
          <span>Coach Signature: _______________________</span>
        </div>
      </div>

    </div>
  );
}
