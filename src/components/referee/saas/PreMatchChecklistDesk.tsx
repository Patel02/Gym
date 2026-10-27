"use client";

import React, { useState } from "react";
import {
  CheckCircle2,
  AlertTriangle,
  Scale,
  Shield,
  Dumbbell,
  Clock,
  Video,
  HeartPulse,
  Sparkles,
  Printer,
  FileCheck,
  RotateCcw,
  CheckSquare,
  Square,
} from "lucide-react";

interface ChecklistItem {
  id: string;
  category: "EQUIPMENT" | "ELECTRONICS" | "SAFETY" | "OFFICIALS";
  title: string;
  desc: string;
  checked: boolean;
  notes: string;
}

const DEFAULT_ITEMS: ChecklistItem[] = [
  {
    id: "chk-1",
    category: "EQUIPMENT",
    title: "1. Calibrated Scale & Weigh-In Room Verification",
    desc: "Scale tested with certified 20kg calibration standard weight. Zero-point balanced. Privacy curtains secure.",
    checked: true,
    notes: "Scale tested at 20.00kg calibrated tolerance.",
  },
  {
    id: "chk-2",
    category: "EQUIPMENT",
    title: "2. Competition Combo Rack & Safety Arms",
    desc: "Elevation pins lubricated, bench press locking pins locked, upright safety stops verified for 120cm - 170cm range.",
    checked: true,
    notes: "Combo rack secure, pins clean.",
  },
  {
    id: "chk-3",
    category: "EQUIPMENT",
    title: "3. IPF Calibrated 20kg Power Barbell",
    desc: "Center knurling crisp, sleeve bearings rotate smoothly, shaft straightness checked with spin test.",
    checked: true,
    notes: "Eleiko IPF barbell loaded.",
  },
  {
    id: "chk-4",
    category: "EQUIPMENT",
    title: "4. Calibrated Disc Weight Tolerances & Collars",
    desc: "Olympic discs (25kg, 20kg, 15kg, 10kg, 5kg, 2.5kg, 1.25kg, micro plates 0.5kg/0.25kg) and 2.5kg collars inspected.",
    checked: true,
    notes: "Full set verified on plate trees.",
  },
  {
    id: "chk-5",
    category: "ELECTRONICS",
    title: "5. Electronic 3-Light Referee Switchboard",
    desc: "Left Referee, Chief Referee, and Right Referee keypads tested. White and Red signal lights illuminate properly.",
    checked: true,
    notes: "3-0 decision transmission verified.",
  },
  {
    id: "chk-6",
    category: "ELECTRONICS",
    title: "6. Platform 1-Minute Clock & Audio Buzzer",
    desc: "Platform timer displays accurately on big screen, 30-second warning chime, and 60-second loud horn tested.",
    checked: true,
    notes: "Buzzer audible at 88dB across hall.",
  },
  {
    id: "chk-7",
    category: "ELECTRONICS",
    title: "7. Technical Jury VAR Camera & Replay Monitor",
    desc: "Front 4K camera and 45-degree angle slow-motion feeds operational on Jury Desk review display.",
    checked: true,
    notes: "Instant replay 0.25x speed tested.",
  },
  {
    id: "chk-8",
    category: "OFFICIALS",
    title: "8. Spotters & Loaders Safety Briefing",
    desc: "Minimum 4 loaders briefed on center barbell capture, side hand placement during squats, and emergency dumping protocol.",
    checked: false,
    notes: "Briefing scheduled with Chief Loader.",
  },
  {
    id: "chk-9",
    category: "SAFETY",
    title: "9. Emergency First Aid & Paramedic Standby",
    desc: "EMS medical kit, ice packs, smelling salts, and emergency physician present in technical zone.",
    checked: false,
    notes: "Awaiting final medical team sign-in.",
  },
  {
    id: "chk-10",
    category: "SAFETY",
    title: "10. Magnesium Chalk & Resin Bins Stocked",
    desc: "Two chalk bowls with pure magnesium carbonate chalk placed at stage corners; stage floor swept with non-slip rosin.",
    checked: true,
    notes: "Both bins full.",
  },
];

interface PreMatchChecklistDeskProps {
  onCertify?: () => void;
}

export function PreMatchChecklistDesk({ onCertify }: PreMatchChecklistDeskProps) {
  const [items, setItems] = useState<ChecklistItem[]>(DEFAULT_ITEMS);
  const [inspectorName, setInspectorName] = useState("Official Chief Technical Referee");
  const [isCertified, setIsCertified] = useState(false);

  const toggleItem = (id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
  };

  const updateNotes = (id: string, notes: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, notes } : item))
    );
  };

  const checkedCount = items.filter((i) => i.checked).length;
  const progressPercent = Math.round((checkedCount / items.length) * 100);
  const isAllComplete = checkedCount === items.length;

  const handleSignOff = () => {
    setIsCertified(true);
    if (onCertify) onCertify();
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-[#120a06] to-[#080201] p-5 sm:p-7 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-gym-primary/20 text-gym-primary">
              <CheckSquare className="h-4 w-4" />
            </span>
            <span className="text-[10px] font-black uppercase tracking-widest text-gym-primary">
              Operational Workspace • Phase 2
            </span>
          </div>
          <h2 className="font-heading text-xl sm:text-2xl font-black uppercase tracking-wider text-white">
            Pre-Match Platform Safety &amp; Tech Inspection
          </h2>
          <p className="text-xs text-zinc-400">
            Mandatory 10-point technical checklist before Platform 1 can be certified for live attempts.
          </p>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Progress</span>
            <div className="text-sm font-black text-white">
              {checkedCount} / {items.length} Checked ({progressPercent}%)
            </div>
          </div>
          <div
            className={`flex h-11 w-11 items-center justify-center rounded-2xl border font-heading text-base font-bold ${
              isAllComplete
                ? "border-emerald-500/40 bg-emerald-500/20 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                : "border-gym-primary/40 bg-gym-primary/20 text-gym-primary"
            }`}
          >
            {progressPercent}%
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="h-2.5 w-full rounded-full bg-white/5 overflow-hidden p-0.5 border border-white/10">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isAllComplete
                ? "bg-gradient-to-r from-emerald-500 to-green-400 shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                : "bg-gradient-to-r from-gym-primary to-red-500"
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Checklist Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => toggleItem(item.id)}
            className={`rounded-xl border p-4 cursor-pointer transition-all ${
              item.checked
                ? "border-emerald-500/30 bg-emerald-950/15 shadow-[0_0_15px_rgba(16,185,129,0.08)]"
                : "border-white/10 bg-zinc-900/60 hover:border-white/25"
            }`}
          >
            <div className="flex items-start gap-3">
              <button
                type="button"
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border transition-all mt-0.5 ${
                  item.checked
                    ? "border-emerald-500 bg-emerald-500 text-black shadow-md"
                    : "border-white/20 bg-white/5 text-transparent hover:border-white/40"
                }`}
              >
                <CheckCircle2 className="h-4 w-4 stroke-[3]" />
              </button>

              <div className="flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h4
                    className={`text-xs font-bold ${
                      item.checked ? "text-white" : "text-zinc-300"
                    }`}
                  >
                    {item.title}
                  </h4>
                  <span
                    className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                      item.category === "EQUIPMENT"
                        ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        : item.category === "ELECTRONICS"
                        ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                        : item.category === "SAFETY"
                        ? "bg-red-500/10 text-red-400 border border-red-500/20"
                        : "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                    }`}
                  >
                    {item.category}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 mt-1 leading-snug">{item.desc}</p>

                {/* Optional Note Field */}
                <div
                  className="mt-2.5 pt-2 border-t border-white/5"
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    type="text"
                    value={item.notes}
                    onChange={(e) => updateNotes(item.id, e.target.value)}
                    placeholder="Technical inspection note..."
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-2.5 py-1 text-[11px] text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-gym-primary/50"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Certification Footer Box */}
      <div className="rounded-2xl border border-white/10 bg-black/50 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gym-primary/10 border border-gym-primary/30 text-gym-primary shrink-0">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-white">Platform Certification Sign-Off</div>
            <div className="text-[11px] text-zinc-400">
              Certifies compliance with IPF Technical Rulebook 2026 for sanctioned competition.
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={() => setItems(DEFAULT_ITEMS)}
            className="rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5 inline mr-1" />
            Reset
          </button>

          <button
            type="button"
            disabled={!isAllComplete}
            onClick={handleSignOff}
            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-black uppercase tracking-wider transition-all shadow-lg ${
              isCertified
                ? "bg-emerald-600 text-white shadow-emerald-600/30"
                : isAllComplete
                ? "bg-gradient-to-r from-gym-primary to-red-600 text-white hover:scale-[1.02] shadow-gym-primary/30"
                : "bg-zinc-800 text-zinc-500 cursor-not-allowed border border-white/5"
            }`}
          >
            <FileCheck className="h-4 w-4" />
            <span>
              {isCertified
                ? "Platform Certified ✓"
                : isAllComplete
                ? "Sign Off & Certify Platform"
                : `Complete All 10 Items (${checkedCount}/10)`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
