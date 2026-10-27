"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  calculateIpfGlPoints, 
  calculateDots, 
  calculateWilks, 
  getStrengthClassification, 
  analyzeLiftBalance, 
  Gender, 
  Equipment 
} from "@/lib/powerlifting-math";
import StrengthPercentileGauge from "@/components/tools/StrengthPercentileGauge";
import LiftBalanceRadar from "@/components/tools/LiftBalanceRadar";
import PeakingPercentageMatrix from "@/components/tools/PeakingPercentageMatrix";
import WhatsAppIcon from "@/components/ui/WhatsAppIcon";
import { 
  Calculator, 
  ChevronRight, 
  Trophy, 
  Zap, 
  Shield, 
  Share2, 
  Printer, 
  RotateCcw, 
  Sparkles,
  Info,
  Dumbbell
} from "lucide-react";
import { PageNavigation } from "@/components/ui/PageNavigation";

export default function StrengthCalculatorPage() {
  // Unit & Category toggles
  const [unit, setUnit] = useState<"kg" | "lbs">("kg");
  const [gender, setGender] = useState<Gender>("male");
  const [equipment, setEquipment] = useState<Equipment>("raw");

  // Numeric lift states (stored in KG internally)
  const [bodyweight, setBodyweight] = useState<number>(83.0);
  const [squat, setSquat] = useState<number>(220.0);
  const [bench, setBench] = useState<number>(150.0);
  const [deadlift, setDeadlift] = useState<number>(260.0);

  // Unit conversion factor
  const toDisplay = (kg: number) => (unit === "kg" ? kg : parseFloat((kg * 2.20462).toFixed(1)));
  const toKg = (val: number) => (unit === "kg" ? val : parseFloat((val / 2.20462).toFixed(1)));

  // Computed totals and scores
  const total = useMemo(() => {
    return parseFloat((squat + bench + deadlift).toFixed(1));
  }, [squat, bench, deadlift]);

  const glPoints = useMemo(() => {
    return calculateIpfGlPoints(bodyweight, total, gender, equipment);
  }, [bodyweight, total, gender, equipment]);

  const dotsScore = useMemo(() => {
    return calculateDots(bodyweight, total, gender);
  }, [bodyweight, total, gender]);

  const wilksScore = useMemo(() => {
    return calculateWilks(bodyweight, total, gender);
  }, [bodyweight, total, gender]);

  const classification = useMemo(() => {
    return getStrengthClassification(glPoints, gender);
  }, [glPoints, gender]);

  const balanceAnalysis = useMemo(() => {
    return analyzeLiftBalance(squat, bench, deadlift);
  }, [squat, bench, deadlift]);

  // Weight class designation
  const weightClassLabel = useMemo(() => {
    if (gender === "male") {
      if (bodyweight <= 53) return "53.0 KG Sub-Junior";
      if (bodyweight <= 59) return "59.0 KG Class";
      if (bodyweight <= 66) return "66.0 KG Class";
      if (bodyweight <= 74) return "74.0 KG Class";
      if (bodyweight <= 83) return "83.0 KG Class";
      if (bodyweight <= 93) return "93.0 KG Class";
      if (bodyweight <= 105) return "105.0 KG Class";
      if (bodyweight <= 120) return "120.0 KG Class";
      return "120.0+ KG Superheavyweight";
    } else {
      if (bodyweight <= 43) return "43.0 KG Sub-Junior";
      if (bodyweight <= 47) return "47.0 KG Class";
      if (bodyweight <= 52) return "52.0 KG Class";
      if (bodyweight <= 57) return "57.0 KG Class";
      if (bodyweight <= 63) return "63.0 KG Class";
      if (bodyweight <= 69) return "69.0 KG Class";
      if (bodyweight <= 76) return "76.0 KG Class";
      if (bodyweight <= 84) return "84.0 KG Class";
      return "84.0+ KG Superheavyweight";
    }
  }, [bodyweight, gender]);

  // Quick Preset Handlers
  const handleLoadPreset = (preset: "national_male" | "national_female" | "state_champ" | "gym_lifter") => {
    if (preset === "national_male") {
      setGender("male");
      setBodyweight(82.5);
      setSquat(275);
      setBench(185);
      setDeadlift(310);
    } else if (preset === "national_female") {
      setGender("female");
      setBodyweight(62.4);
      setSquat(175);
      setBench(110);
      setDeadlift(205);
    } else if (preset === "state_champ") {
      setGender("male");
      setBodyweight(83.0);
      setSquat(210);
      setBench(140);
      setDeadlift(245);
    } else {
      setGender("male");
      setBodyweight(75.0);
      setSquat(140);
      setBench(95);
      setDeadlift(165);
    }
  };

  // WhatsApp Share Handler
  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(
      `🏋️ *MY POWERLIFTING STRENGTH ASSESSMENT*\n` +
      `Division: *${gender.toUpperCase()} • ${weightClassLabel} (${equipment.toUpperCase()})*\n` +
      `Bodyweight: *${bodyweight} kg*\n\n` +
      `📊 *LIFTS SCORECARD:*\n` +
      `• Squat: *${squat} kg*\n` +
      `• Bench Press: *${bench} kg*\n` +
      `• Deadlift: *${deadlift} kg*\n` +
      `• Total Lifted: *${total} kg*\n\n` +
      `🏆 *OFFICIAL RATINGS:*\n` +
      `• IPF GL Points: *${glPoints}*\n` +
      `• DOTS Score: *${dotsScore}*\n` +
      `• Wilks Score: *${wilksScore}*\n` +
      `• Rank: *${classification.tier} (Top ${100 - classification.percentile}% in India)*\n\n` +
      `Calculate your strength & 1RM peaking percentages here:\n` +
      `https://atfitnesspowerlifting.com/tools/strength-calculator`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-gym-black text-white pt-32 sm:pt-36 lg:pt-40 pb-20 relative overflow-hidden">
      
      {/* ── Background Glows ── */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-gym-primary/15 blur-[120px]" />
      <div className="pointer-events-none absolute top-1/3 -right-40 h-96 w-96 rounded-full bg-blue-600/10 blur-[130px]" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        
        {/* ── Breadcrumb & Navigation ── */}
        <PageNavigation
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "Rankings", href: "/leaderboard" },
            { label: "Strength & GL Calculator" },
          ]}
          badge="Goodlift 2026 Engine"
          className="mb-8"
        />

        {/* ── Hero ── */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-gym-primary/30 bg-gym-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-gym-primary mb-3 shadow-[0_0_20px_rgba(230,80,27,0.2)]">
            <Calculator className="h-3.5 w-3.5" />
            <span>Official Goodlift 2026 Engine</span>
          </div>

          <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-white">
            National Strength <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-gym-primary via-[#ff7a45] to-gym-primary bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(230,80,27,0.4)]">
              Percentile & GL Calculator
            </span>
          </h1>

          <p className="mt-3 text-xs sm:text-sm md:text-base text-gray-300 leading-relaxed font-normal">
            Calculate your official IPF GL Points, DOTS, and Wilks scores. Discover where you rank across India&apos;s strength tiers, analyze your S:B:D biomechanical balance ratios, and generate custom 65%–95% 1RM plate loading workouts.
          </p>

          {/* Quick Preset Selector Buttons */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest mr-1">
              Sample Benchmarks:
            </span>
            <button
              type="button"
              onClick={() => handleLoadPreset("national_male")}
              className="rounded-full border border-white/10 bg-white/5 hover:bg-gym-primary/20 hover:border-gym-primary/40 px-3 py-1 text-[11px] font-bold text-gray-300 transition-colors"
            >
              🇮🇳 Senior Male Record (83kg)
            </button>
            <button
              type="button"
              onClick={() => handleLoadPreset("national_female")}
              className="rounded-full border border-white/10 bg-white/5 hover:bg-gym-primary/20 hover:border-gym-primary/40 px-3 py-1 text-[11px] font-bold text-gray-300 transition-colors"
            >
              🇮🇳 Senior Female Record (63kg)
            </button>
            <button
              type="button"
              onClick={() => handleLoadPreset("state_champ")}
              className="rounded-full border border-white/10 bg-white/5 hover:bg-gym-primary/20 hover:border-gym-primary/40 px-3 py-1 text-[11px] font-bold text-gray-300 transition-colors"
            >
              🥇 State Champion Standard
            </button>
            <button
              type="button"
              onClick={() => handleLoadPreset("gym_lifter")}
              className="rounded-full border border-white/10 bg-white/5 hover:bg-gym-primary/20 hover:border-gym-primary/40 px-3 py-1 text-[11px] font-bold text-gray-300 transition-colors"
            >
              🏋️ Intermediate Lifter
            </button>
          </div>
        </div>

        {/* ── Input Parameters Card ── */}
        <div className="rounded-3xl border border-white/15 bg-gradient-to-b from-[#140502] via-[#0e0301] to-black p-6 sm:p-8 shadow-2xl mb-10">
          
          {/* Top Toggles Bar: Gender, Equipment & Units */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-b border-white/10 pb-6 mb-6">
            
            {/* Gender Toggle */}
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">
                Athlete Gender:
              </label>
              <div className="flex items-center bg-black/60 border border-white/10 rounded-xl p-1">
                <button
                  type="button"
                  onClick={() => setGender("male")}
                  className={`flex-1 py-2 text-xs font-heading font-bold uppercase tracking-wider rounded-lg transition-colors ${
                    gender === "male" ? "bg-gym-primary text-white" : "text-gray-400 hover:text-white"
                  }`}
                >
                  Male Lifter
                </button>
                <button
                  type="button"
                  onClick={() => setGender("female")}
                  className={`flex-1 py-2 text-xs font-heading font-bold uppercase tracking-wider rounded-lg transition-colors ${
                    gender === "female" ? "bg-gym-primary text-white" : "text-gray-400 hover:text-white"
                  }`}
                >
                  Female Lifter
                </button>
              </div>
            </div>

            {/* Division Toggle */}
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">
                Division Equipment:
              </label>
              <div className="flex items-center bg-black/60 border border-white/10 rounded-xl p-1">
                <button
                  type="button"
                  onClick={() => setEquipment("raw")}
                  className={`flex-1 py-2 text-xs font-heading font-bold uppercase tracking-wider rounded-lg transition-colors ${
                    equipment === "raw" ? "bg-gym-primary text-white" : "text-gray-400 hover:text-white"
                  }`}
                >
                  Classic Raw
                </button>
                <button
                  type="button"
                  onClick={() => setEquipment("equipped")}
                  className={`flex-1 py-2 text-xs font-heading font-bold uppercase tracking-wider rounded-lg transition-colors ${
                    equipment === "equipped" ? "bg-gym-primary text-white" : "text-gray-400 hover:text-white"
                  }`}
                >
                  Single-Ply Equipped
                </button>
              </div>
            </div>

            {/* Units Toggle */}
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">
                Weight Measurement:
              </label>
              <div className="flex items-center bg-black/60 border border-white/10 rounded-xl p-1">
                <button
                  type="button"
                  onClick={() => setUnit("kg")}
                  className={`flex-1 py-2 text-xs font-heading font-bold uppercase tracking-wider rounded-lg transition-colors ${
                    unit === "kg" ? "bg-gym-primary text-white" : "text-gray-400 hover:text-white"
                  }`}
                >
                  Kilograms (KG)
                </button>
                <button
                  type="button"
                  onClick={() => setUnit("lbs")}
                  className={`flex-1 py-2 text-xs font-heading font-bold uppercase tracking-wider rounded-lg transition-colors ${
                    unit === "lbs" ? "bg-gym-primary text-white" : "text-gray-400 hover:text-white"
                  }`}
                >
                  Pounds (LBS)
                </button>
              </div>
            </div>

          </div>

          {/* 4 Inputs: Bodyweight, Squat, Bench, Deadlift */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            
            {/* Bodyweight */}
            <div className="rounded-2xl border border-white/10 bg-black/50 p-4">
              <label className="text-[11px] font-bold uppercase text-gray-400 block mb-1">
                Bodyweight ({unit.toUpperCase()}):
              </label>
              <input
                type="number"
                step="0.1"
                min="35"
                max="250"
                value={toDisplay(bodyweight)}
                onChange={(e) => setBodyweight(toKg(parseFloat(e.target.value) || 0))}
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2.5 text-2xl font-heading font-bold text-white focus:outline-none focus:border-gym-primary"
              />
              <span className="text-[10px] font-mono text-gym-primary mt-1.5 block font-bold">
                {weightClassLabel}
              </span>
            </div>

            {/* Squat 1RM */}
            <div className="rounded-2xl border border-amber-500/30 bg-black/50 p-4">
              <label className="text-[11px] font-bold uppercase text-amber-400 block mb-1">
                Best Squat ({unit.toUpperCase()}):
              </label>
              <input
                type="number"
                step="2.5"
                min="0"
                value={toDisplay(squat)}
                onChange={(e) => setSquat(toKg(parseFloat(e.target.value) || 0))}
                className="w-full bg-white/[0.04] border border-amber-500/30 rounded-xl px-3 py-2.5 text-2xl font-heading font-bold text-amber-300 focus:outline-none focus:border-amber-400"
              />
              <span className="text-[10px] font-mono text-gray-400 mt-1.5 block">
                {(squat / (bodyweight || 1)).toFixed(2)}× Bodyweight
              </span>
            </div>

            {/* Bench Press 1RM */}
            <div className="rounded-2xl border border-cyan-500/30 bg-black/50 p-4">
              <label className="text-[11px] font-bold uppercase text-cyan-400 block mb-1">
                Best Bench ({unit.toUpperCase()}):
              </label>
              <input
                type="number"
                step="2.5"
                min="0"
                value={toDisplay(bench)}
                onChange={(e) => setBench(toKg(parseFloat(e.target.value) || 0))}
                className="w-full bg-white/[0.04] border border-cyan-500/30 rounded-xl px-3 py-2.5 text-2xl font-heading font-bold text-cyan-300 focus:outline-none focus:border-cyan-400"
              />
              <span className="text-[10px] font-mono text-gray-400 mt-1.5 block">
                {(bench / (bodyweight || 1)).toFixed(2)}× Bodyweight
              </span>
            </div>

            {/* Deadlift 1RM */}
            <div className="rounded-2xl border border-red-500/30 bg-black/50 p-4">
              <label className="text-[11px] font-bold uppercase text-red-400 block mb-1">
                Best Deadlift ({unit.toUpperCase()}):
              </label>
              <input
                type="number"
                step="2.5"
                min="0"
                value={toDisplay(deadlift)}
                onChange={(e) => setDeadlift(toKg(parseFloat(e.target.value) || 0))}
                className="w-full bg-white/[0.04] border border-red-500/30 rounded-xl px-3 py-2.5 text-2xl font-heading font-bold text-red-300 focus:outline-none focus:border-red-400"
              />
              <span className="text-[10px] font-mono text-gray-400 mt-1.5 block">
                {(deadlift / (bodyweight || 1)).toFixed(2)}× Bodyweight
              </span>
            </div>

          </div>

          {/* Aggregate Total Banner */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 bg-gym-primary/10 border border-gym-primary/30 rounded-2xl p-4 sm:p-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gym-primary text-white flex items-center justify-center font-black">
                Σ
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-gym-primary block">
                  3-LIFT COMPETITION TOTAL
                </span>
                <span className="font-heading text-2xl sm:text-3xl font-bold text-white">
                  {total} KG <span className="text-xs font-mono text-gray-400">({(total * 2.20462).toFixed(1)} lbs)</span>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleWhatsAppShare}
                className="flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg transition-all hover:scale-105"
              >
                <WhatsAppIcon variant="official" className="w-4 h-4" />
                <span>Share Results</span>
              </button>
            </div>
          </div>

        </div>

        {/* ── Output 1: Speedometer Gauge & Three Formula Scores ── */}
        <div className="mb-10">
          <StrengthPercentileGauge
            glPoints={glPoints}
            dots={dotsScore}
            wilks={wilksScore}
            total={total}
            classification={classification}
            bodyweight={bodyweight}
            weightClassLabel={weightClassLabel}
          />
        </div>

        {/* ── Output 2: Biomechanical Lift Balance Ratios ── */}
        <div className="mb-10">
          <LiftBalanceRadar
            squat={squat}
            bench={bench}
            deadlift={deadlift}
            total={total}
            analysis={balanceAnalysis}
          />
        </div>

        {/* ── Output 3: 1RM Peaking Training Matrix with Sleeve Plates ── */}
        <div className="mb-14">
          <PeakingPercentageMatrix
            squat1RM={squat}
            bench1RM={bench}
            deadlift1RM={deadlift}
          />
        </div>

      </div>

    </div>
  );
}
