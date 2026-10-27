"use client";

import React, { useState } from "react";
import { type LiveScoringResultDto, certifyAthleteWeighInAction } from "@/actions/scoring.actions";
import {
  Scale,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Sliders,
  Sparkles,
  ClipboardList,
  Loader2,
} from "lucide-react";
import { classifyIpfWeightClass } from "@/lib/ipf-weight-classes";

interface PreMeetWeighInDeskProps {
  athlete: LiveScoringResultDto;
  onUpdateBodyweight?: (newBw: number) => void;
}

export function PreMeetWeighInDesk({ athlete, onUpdateBodyweight }: PreMeetWeighInDeskProps) {
  const [bodyweight, setBodyweight] = useState<string>(
    athlete.bodyweight ? athlete.bodyweight.toString() : "82.60"
  );
  const [lotNumber, setLotNumber] = useState<string>("14");
  const [squatRack, setSquatRack] = useState<string>("14");
  const [benchRack, setBenchRack] = useState<string>("11");
  const [safetyPin, setSafetyPin] = useState<string>("5");

  // Equipment checklist state
  const [gearChecks, setGearChecks] = useState({
    singlet: true,
    belt: true,
    kneeSleeves: true,
    wristWraps: true,
    deadliftSocks: true,
    undergarments: true,
  });

  const [isCertified, setIsCertified] = useState<boolean>(true);
  const [certifiedNotice, setCertifiedNotice] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const toggleCheck = (key: keyof typeof gearChecks) => {
    setGearChecks((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleCertify = async () => {
    const bwNum = parseFloat(bodyweight);
    const lotNum = parseInt(lotNumber, 10) || 1;
    if (isNaN(bwNum) || bwNum <= 0) {
      alert("Please enter a valid bodyweight in KG.");
      return;
    }

    setIsSaving(true);
    try {
      if (athlete.userId && athlete.eventId) {
        const gearSummary = Object.entries(gearChecks)
          .map(([k, v]) => `${k}:${v ? "PASS" : "FAIL"}`)
          .join(", ");

        await certifyAthleteWeighInAction({
          userId: athlete.userId,
          eventId: athlete.eventId,
          bodyweight: bwNum,
          lotNumber: lotNum,
          squatRack,
          benchRack,
          safetyPin,
          gearSummary,
        });
      }

      if (onUpdateBodyweight) {
        onUpdateBodyweight(bwNum);
      }
      setIsCertified(true);
      setCertifiedNotice(`Official weigh-in certified at ${bwNum.toFixed(2)} KG! Equipment passed IPF inspection.`);
      setTimeout(() => setCertifiedNotice(null), 4000);
    } catch (err: any) {
      alert(err.message || "Failed to certify weigh in");
    } finally {
      setIsSaving(false);
    }
  };

  const allGearPassed = Object.values(gearChecks).every(Boolean);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-[#160c08] via-[#0d0705] to-[#070302] p-6 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Scale className="h-4 w-4 text-gym-primary" />
            <h3 className="font-heading text-lg font-bold uppercase tracking-wider text-white">
              Official Referee Weigh-In &amp; Equipment Compliance Desk
            </h3>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            IPF Technical Rule Section 7: 2-hour pre-championship weigh-in, lot draw &amp; equipment inspection.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isCertified ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-bold uppercase">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Weigh-In Certified</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs font-bold uppercase">
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>Weigh-In Pending</span>
            </span>
          )}
        </div>
      </div>

      {certifiedNotice && (
        <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/40 p-3 text-xs font-bold text-emerald-300 flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{certifiedNotice}</span>
        </div>
      )}

      {/* Grid: 3 Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Section 1: Official Scale & Weight Class */}
        <div className="rounded-2xl border border-white/10 bg-black/60 p-5 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-300">
            <Scale className="h-4 w-4 text-gym-primary" />
            <span>1. Official Calibrated Scale</span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-[10px] font-bold uppercase text-zinc-400 block mb-1">
                Athlete Name &amp; Division
              </label>
              <div className="text-sm font-black text-white uppercase font-heading">
                {athlete.user?.name || "Competitor"}
              </div>
              <div className="text-xs text-gym-primary font-bold">
                Category: {athlete.user?.profile?.weightClass || "83 KG"} ({athlete.user?.profile?.gender || "MALE"})
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase text-zinc-400 block mb-1">
                Official Bodyweight (KG)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.05"
                  value={bodyweight}
                  onChange={(e) => setBodyweight(e.target.value)}
                  className="w-full bg-black/80 border border-white/15 rounded-xl px-4 py-2.5 font-mono font-bold text-lg text-white focus:border-gym-primary focus:outline-none"
                  placeholder="82.50"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-black text-gym-primary">
                  KG
                </span>
              </div>
              {(() => {
                const parsedBw = parseFloat(bodyweight);
                if (isNaN(parsedBw) || parsedBw <= 0) return null;
                const result = classifyIpfWeightClass(
                  parsedBw,
                  (athlete.user?.profile?.gender as any) || "MALE",
                  athlete.user?.profile?.weightClass
                );
                return (
                  <div className="mt-2 p-2.5 rounded-xl bg-black/60 border border-white/10 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-zinc-400 font-bold uppercase">IPF Category:</span>
                      <span
                        className={`font-black uppercase tracking-wider ${
                          result.status === "EXACT_FIT"
                            ? "text-emerald-400"
                            : result.status === "OVERWEIGHT"
                            ? "text-red-400"
                            : "text-amber-400"
                        }`}
                      >
                        {result.classifiedLabel}
                      </span>
                    </div>
                    <div className="text-[10px] text-zinc-400 leading-tight">
                      {result.message}
                    </div>
                    {result.reclassificationNote && (
                      <div className="text-[9px] font-bold text-amber-300">
                        ⚠️ {result.reclassificationNote}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase text-zinc-400 block mb-1">
                Official Lot Number
              </label>
              <input
                type="number"
                value={lotNumber}
                onChange={(e) => setLotNumber(e.target.value)}
                className="w-full bg-black/80 border border-white/15 rounded-xl px-4 py-2 text-sm font-mono font-bold text-white focus:border-gym-primary focus:outline-none"
                placeholder="14"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Platform Rack Heights & Safeties */}
        <div className="rounded-2xl border border-white/10 bg-black/60 p-5 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-300">
            <Sliders className="h-4 w-4 text-gym-primary" />
            <span>2. Platform Rack Heights</span>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between text-[10px] font-bold uppercase text-zinc-400 mb-1">
                <span>Squat Rack Height (Combo Rack)</span>
                <span className="text-white font-mono font-bold">Pin #{squatRack}</span>
              </div>
              <input
                type="number"
                min="1"
                max="30"
                value={squatRack}
                onChange={(e) => setSquatRack(e.target.value)}
                className="w-full bg-black/80 border border-white/15 rounded-xl px-4 py-2 text-sm font-mono text-white focus:border-gym-primary focus:outline-none"
              />
            </div>

            <div>
              <div className="flex items-center justify-between text-[10px] font-bold uppercase text-zinc-400 mb-1">
                <span>Bench Press Rack Height</span>
                <span className="text-white font-mono font-bold">Pin #{benchRack}</span>
              </div>
              <input
                type="number"
                min="1"
                max="30"
                value={benchRack}
                onChange={(e) => setBenchRack(e.target.value)}
                className="w-full bg-black/80 border border-white/15 rounded-xl px-4 py-2 text-sm font-mono text-white focus:border-gym-primary focus:outline-none"
              />
            </div>

            <div>
              <div className="flex items-center justify-between text-[10px] font-bold uppercase text-zinc-400 mb-1">
                <span>Bench Safety Pins Height</span>
                <span className="text-white font-mono font-bold">Hole #{safetyPin}</span>
              </div>
              <input
                type="number"
                min="1"
                max="20"
                value={safetyPin}
                onChange={(e) => setSafetyPin(e.target.value)}
                className="w-full bg-black/80 border border-white/15 rounded-xl px-4 py-2 text-sm font-mono text-white focus:border-gym-primary focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Equipment Compliance Checklist */}
        <div className="rounded-2xl border border-white/10 bg-black/60 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-300">
              <ClipboardList className="h-4 w-4 text-gym-primary" />
              <span>3. IPF Equipment Checklist</span>
            </div>
            <span
              className={`text-[9px] font-semibold uppercase px-2 py-0.5 rounded ${
                allGearPassed ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
              }`}
            >
              {allGearPassed ? "All Passed" : "Action Required"}
            </span>
          </div>

          <div className="space-y-2 text-xs">
            {[
              { key: "singlet", label: "IPF Legal Lifting Singlet (Single-ply)" },
              { key: "belt", label: "Competition Belt (<=10cm width, <=13mm thick)" },
              { key: "kneeSleeves", label: "Neoprene Knee Sleeves (<=30cm length, <=7mm)" },
              { key: "wristWraps", label: "Wrist Wraps (<=1m length, approved brand)" },
              { key: "deadliftSocks", label: "High Deadlift Socks (Covering entire shin)" },
              { key: "undergarments", label: "Compliant Briefs (No leg extensions)" },
            ].map(({ key, label }) => {
              const checked = gearChecks[key as keyof typeof gearChecks];
              return (
                <label
                  key={key}
                  className="flex items-center gap-2.5 p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer select-none"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleCheck(key as keyof typeof gearChecks)}
                    className="h-4 w-4 rounded accent-gym-primary cursor-pointer"
                  />
                  <span className={`text-[11px] font-medium ${checked ? "text-zinc-200" : "text-zinc-500 line-through"}`}>
                    {label}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      </div>

      {/* Certify Button */}
      <button
        type="button"
        onClick={handleCertify}
        className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-gym-primary via-amber-600 to-gym-primary bg-[length:200%] hover:bg-right text-white font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-gym-primary/20 transition-all cursor-pointer"
      >
        <FileCheck className="h-4 w-4" />
        <span>Certify Official Weigh-In &amp; Lock Platform Eligibility</span>
      </button>
    </div>
  );
}
