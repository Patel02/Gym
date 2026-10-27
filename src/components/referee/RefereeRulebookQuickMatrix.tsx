"use client";

import React, { useState, useMemo } from "react";
import {
  BookOpen,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  HelpCircle,
  Compass,
  Eye,
  Info,
  Layers,
  ArrowDown,
  ArrowUp,
  Volume2,
} from "lucide-react";

interface RuleInfraction {
  discipline: "SQUAT" | "BENCH" | "DEADLIFT";
  infraction: string;
  card: "RED" | "BLUE" | "YELLOW";
  cardName: string;
  ruleSection: string;
  description: string;
}

const IPF_INFRACTIONS: RuleInfraction[] = [
  // SQUAT
  {
    discipline: "SQUAT",
    infraction: "Failure to break parallel depth (Hip crease must be lower than top of knee joint).",
    card: "RED",
    cardName: "Red Card",
    ruleSection: "IPF Rule 4.2.1",
    description: "The top of the surface of the legs at the hip joint must be lower than the top of the knees.",
  },
  {
    discipline: "SQUAT",
    infraction: "Downward movement of the barbell during the upward recovery ascent (Double bounce).",
    card: "BLUE",
    cardName: "Blue Card",
    ruleSection: "IPF Rule 4.2.3",
    description: "Any downward bar movement during the upward ascent invalidates the repetition.",
  },
  {
    discipline: "SQUAT",
    infraction: "Stepping forward or backward or lateral foot movement before the Rack command.",
    card: "YELLOW",
    cardName: "Yellow Card",
    ruleSection: "IPF Rule 4.2.4",
    description: "Lifter must maintain stationary foot contact throughout the entire repetition.",
  },
  {
    discipline: "SQUAT",
    infraction: "Failure to lock out knees fully erect at completion of the lift.",
    card: "RED",
    cardName: "Red Card",
    ruleSection: "IPF Rule 4.2.2",
    description: "Knees must be fully locked out and torso upright upon re-establishing starting posture.",
  },
  {
    discipline: "SQUAT",
    infraction: "Contact of the elbows or upper arms with the legs.",
    card: "YELLOW",
    cardName: "Yellow Card",
    ruleSection: "IPF Rule 4.2.5",
    description: "Elbows must not rest on thighs or knees during the squat ascent.",
  },
  {
    discipline: "SQUAT",
    infraction: "Initiating squat descent prior to Chief Referee's audible 'Squat!' command.",
    card: "YELLOW",
    cardName: "Yellow Card",
    ruleSection: "IPF Rule 4.1.6",
    description: "Lifter must wait for the audio signal and downward hand gesture before beginning descent.",
  },

  // BENCH PRESS
  {
    discipline: "BENCH",
    infraction: "Bar sinking into chest or bouncing off sternum after the motionless pause.",
    card: "BLUE",
    cardName: "Blue Card",
    ruleSection: "IPF Rule 5.2.2",
    description: "The bar must remain motionless on the chest. Any heave or bounce off the ribcage is disallowed.",
  },
  {
    discipline: "BENCH",
    infraction: "Buttocks lifting off the bench surface or moving laterally during the press.",
    card: "YELLOW",
    cardName: "Yellow Card",
    ruleSection: "IPF Rule 5.2.3",
    description: "Buttocks must remain in flat contact with the bench pad throughout the entire attempt.",
  },
  {
    discipline: "BENCH",
    infraction: "Pressing before the Chief Referee's audible 'Press!' command.",
    card: "YELLOW",
    cardName: "Yellow Card",
    ruleSection: "IPF Rule 5.2.1",
    description: "Lifter must wait for the motionless chest pause and the verbal signal before driving upward.",
  },
  {
    discipline: "BENCH",
    infraction: "Downward movement of the bar during the upward press ascent.",
    card: "BLUE",
    cardName: "Blue Card",
    ruleSection: "IPF Rule 5.2.4",
    description: "Once the bar starts upward from the chest, it cannot descend downward.",
  },
  {
    discipline: "BENCH",
    infraction: "Uneven lockout of the arms / failure to lock out both elbows simultaneously.",
    card: "RED",
    cardName: "Red Card",
    ruleSection: "IPF Rule 5.2.5",
    description: "Both elbows must reach full anatomical lockout before the Rack command.",
  },
  {
    discipline: "BENCH",
    infraction: "Feet sliding, lifting or shifting from the platform surface during the lift.",
    card: "YELLOW",
    cardName: "Yellow Card",
    ruleSection: "IPF Rule 5.4.2",
    description: "Entire foot (or heel/toes depending on federation rules) must remain stationary on the platform.",
  },
  {
    discipline: "BENCH",
    infraction: "Grip width exceeds 81 cm (Index fingers placed outside the knurling rings).",
    card: "YELLOW",
    cardName: "Yellow Card",
    ruleSection: "IPF Rule 5.1.4",
    description: "Hands must not exceed the maximum allowed width of 81cm between index fingers.",
  },

  // DEADLIFT
  {
    discipline: "DEADLIFT",
    infraction: "Supporting the barbell on the thighs (Hitching or ramping into lockout).",
    card: "BLUE",
    cardName: "Blue Card",
    ruleSection: "IPF Rule 6.2.2",
    description: "Bar cannot rest on the quadriceps as a stepping shelf. Smooth unbroken ascent required.",
  },
  {
    discipline: "DEADLIFT",
    infraction: "Downward motion of the barbell before reaching complete upright posture.",
    card: "BLUE",
    cardName: "Blue Card",
    ruleSection: "IPF Rule 6.2.1",
    description: "Bar must not dip or drop during the pull upward.",
  },
  {
    discipline: "DEADLIFT",
    infraction: "Failure to stand fully erect with shoulders pulled back and knees locked.",
    card: "RED",
    cardName: "Red Card",
    ruleSection: "IPF Rule 6.2.3",
    description: "Soft knees or slumped shoulders at the top constitutes an incomplete attempt.",
  },
  {
    discipline: "DEADLIFT",
    infraction: "Dropping the barbell or releasing grip before bar touches the platform.",
    card: "YELLOW",
    cardName: "Yellow Card",
    ruleSection: "IPF Rule 6.2.4",
    description: "Lifter must maintain dual hands on the bar and control its descent until resting on the floor.",
  },
  {
    discipline: "DEADLIFT",
    infraction: "Lowering the barbell before the Chief Referee gives the 'Down!' command.",
    card: "YELLOW",
    cardName: "Yellow Card",
    ruleSection: "IPF Rule 6.2.5",
    description: "Lifter must remain stationary at lockout until referee downward hand signal is given.",
  },
];

export function RefereeRulebookQuickMatrix() {
  const [activeView, setActiveView] = useState<"matrix" | "visuals">("matrix");
  const [filterDiscipline, setFilterDiscipline] = useState<string>("ALL");
  const [filterCard, setFilterCard] = useState<string>("ALL");
  const [search, setSearch] = useState<string>("" );

  const filteredRules = useMemo(() => {
    return IPF_INFRACTIONS.filter((r) => {
      if (filterDiscipline !== "ALL" && r.discipline !== filterDiscipline) return false;
      if (filterCard !== "ALL" && r.card !== filterCard) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          r.infraction.toLowerCase().includes(q) ||
          r.ruleSection.toLowerCase().includes(q) ||
          r.cardName.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [filterDiscipline, filterCard, search]);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-[#180e0a] via-[#0f0705] to-[#070302] p-6 shadow-2xl space-y-6">
      {/* ── TOP HEADER & VIEW TOGGLES ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-gym-primary" />
            <h3 className="font-heading text-lg font-bold uppercase tracking-wider text-white">
              Official IPF Technical Rulebook &amp; Infraction Matrix
            </h3>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Sections 4, 5 &amp; 6: Strict Adjudication Rules, Visual Depth Criteria &amp; Penalty Cards.
          </p>
        </div>

        {/* View Switcher: Searchable Table vs Visual Diagrams */}
        <div className="flex items-center gap-1.5 bg-black/60 p-1 rounded-xl border border-white/10">
          <button
            type="button"
            onClick={() => setActiveView("matrix")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeView === "matrix"
                ? "bg-gym-primary text-white shadow"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>Search Matrix</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveView("visuals")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeView === "visuals"
                ? "bg-gym-primary text-white shadow"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Eye className="h-3.5 w-3.5" />
            <span>Visual Depth &amp; Rules Guide</span>
          </button>
        </div>
      </div>

      {/* ── VIEW 1: SEARCHABLE INFRACTION MATRIX ── */}
      {activeView === "matrix" && (
        <div className="space-y-4">
          {/* Controls: Search, Discipline Filter, Card Filter */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-500" />
              <input
                type="text"
                placeholder="Search rule section, foul name, card type, or keyword..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-black/60 border border-white/15 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-gym-primary"
              />
            </div>

            {/* Discipline Filter */}
            <div className="flex items-center gap-1 bg-black/60 p-1 rounded-xl border border-white/10 shrink-0">
              {(["ALL", "SQUAT", "BENCH", "DEADLIFT"] as const).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setFilterDiscipline(d)}
                  className={`px-3 py-1 rounded-lg text-[10px] font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                    filterDiscipline === d
                      ? "bg-gym-primary text-white"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>

            {/* Card Filter */}
            <div className="flex items-center gap-1 bg-black/60 p-1 rounded-xl border border-white/10 shrink-0">
              {[
                { id: "ALL", label: "All Cards" },
                { id: "RED", label: "🟥 Red" },
                { id: "BLUE", label: "🟦 Blue" },
                { id: "YELLOW", label: "🟨 Yellow" },
              ].map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setFilterCard(c.id)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                    filterCard === c.id
                      ? "bg-white/20 text-white font-black"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Infraction Table */}
          <div className="overflow-x-auto rounded-2xl border border-white/10">
            <table className="w-full text-left border-collapse bg-black/60 text-xs">
              <thead>
                <tr className="bg-zinc-950 border-b border-white/10 text-zinc-400 uppercase font-black text-[10px]">
                  <th className="p-3 border-r border-white/10">Card Penalty</th>
                  <th className="p-3 border-r border-white/10">Lift</th>
                  <th className="p-3 border-r border-white/10">Rule Section</th>
                  <th className="p-3 border-r border-white/10">Infraction Description</th>
                  <th className="p-3">Official Platform Directive</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredRules.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-zinc-500 font-bold uppercase">
                      No matching infractions found for your search query.
                    </td>
                  </tr>
                ) : (
                  filteredRules.map((rule, idx) => (
                    <tr key={idx} className="hover:bg-white/5 transition-colors">
                      <td className="p-3 border-r border-white/10 whitespace-nowrap">
                        <span
                          className={`inline-block px-2.5 py-1 rounded text-[10px] font-semibold uppercase ${
                            rule.card === "RED"
                              ? "bg-red-500/20 text-red-400 border border-red-500/40"
                              : rule.card === "BLUE"
                              ? "bg-blue-500/20 text-blue-400 border border-blue-500/40"
                              : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                          }`}
                        >
                          {rule.card === "RED" && "🟥 "}
                          {rule.card === "BLUE" && "🟦 "}
                          {rule.card === "YELLOW" && "🟨 "}
                          {rule.cardName}
                        </span>
                      </td>
                      <td className="p-3 border-r border-white/10 font-bold text-gym-primary uppercase font-heading whitespace-nowrap">
                        {rule.discipline}
                      </td>
                      <td className="p-3 border-r border-white/10 font-mono font-bold text-white whitespace-nowrap">
                        {rule.ruleSection}
                      </td>
                      <td className="p-3 border-r border-white/10 font-bold text-zinc-200">
                        {rule.infraction}
                      </td>
                      <td className="p-3 text-zinc-400 text-[11px] leading-relaxed">
                        {rule.description}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── VIEW 2: VISUAL TECHNICAL RULES & DEPTH CRITERIA GUIDE ── */}
      {activeView === "visuals" && (
        <div className="space-y-6">
          {/* SQUAT DEPTH VISUAL BREAKDOWN */}
          <div className="rounded-2xl border border-white/10 bg-black/60 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-gym-primary" />
                <h4 className="font-heading text-sm font-bold uppercase tracking-wider text-white">
                  1. Squat Depth Rule (IPF Rule 4.2.1)
                </h4>
              </div>
              <span className="text-[10px] font-mono text-zinc-400">Section 4 — Squat</span>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              Lifter must bend the knees and lower the body until the <strong>top surface of the legs at the hip joint (hip crease)</strong> is lower than the <strong>top of the knees</strong>. Anything at parallel or higher is a foul.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Good Lift Illustration Card */}
              <div className="p-4 rounded-xl border border-emerald-500/40 bg-emerald-950/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-emerald-400 flex items-center gap-1.5 font-heading">
                    <CheckCircle2 className="h-4 w-4" /> ⚪ GOOD LIFT (PASSED DEPTH)
                  </span>
                  <span className="text-[10px] font-mono font-bold text-emerald-400/80">
                    Below Parallel
                  </span>
                </div>
                <div className="h-24 rounded-lg bg-black/50 border border-emerald-500/20 flex items-center justify-center relative overflow-hidden">
                  <div className="text-center">
                    <div className="text-xs font-mono font-bold text-emerald-300">
                      Hip Crease &lt; Top of Knee
                    </div>
                    <div className="text-[10px] text-zinc-400 mt-1">
                      Clear angle break below horizontal plane
                    </div>
                  </div>
                  <div className="absolute bottom-2 left-6 right-6 border-b-2 border-dashed border-emerald-500/60" />
                </div>
                <p className="text-[11px] text-zinc-300">
                  Hip crease is unambiguously beneath the top surface of the knee joint. Lifter ascends smoothly without downward dip.
                </p>
              </div>

              {/* No Lift High Squat Card */}
              <div className="p-4 rounded-xl border border-red-500/40 bg-red-950/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-red-400 flex items-center gap-1.5 font-heading">
                    <XCircle className="h-4 w-4" /> 🔴 NO LIFT (HIGH SQUAT - RED CARD)
                  </span>
                  <span className="text-[10px] font-mono font-bold text-red-400/80">
                    Parallel or High
                  </span>
                </div>
                <div className="h-24 rounded-lg bg-black/50 border border-red-500/20 flex items-center justify-center relative overflow-hidden">
                  <div className="text-center">
                    <div className="text-xs font-mono font-bold text-red-400">
                      Hip Crease ≥ Top of Knee
                    </div>
                    <div className="text-[10px] text-zinc-400 mt-1">
                      Failed to break parallel plane
                    </div>
                  </div>
                  <div className="absolute top-1/2 left-6 right-6 border-b-2 border-red-500/80" />
                </div>
                <p className="text-[11px] text-zinc-300">
                  Infraction 4.2.1: Thigh surface remained horizontal or higher. Side referees and Chief Referee trigger RED LIGHT.
                </p>
              </div>
            </div>
          </div>

          {/* BENCH PRESS PAUSE & CONTACT POINTS */}
          <div className="rounded-2xl border border-white/10 bg-black/60 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-gym-primary" />
                <h4 className="font-heading text-sm font-bold uppercase tracking-wider text-white">
                  2. Bench Press Rules: Pause, Contact &amp; Grip (IPF Section 5)
                </h4>
              </div>
              <span className="text-[10px] font-mono text-zinc-400">Section 5 — Bench Press</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-3.5 rounded-xl border border-white/10 bg-black/40 space-y-1.5">
                <span className="text-xs font-bold text-gym-primary uppercase block font-heading">
                  1. The Motionless Chest Pause
                </span>
                <p className="text-[11px] text-zinc-300 leading-snug">
                  Bar must stop completely motionless on chest/belly. Any touch-and-go, sinking, or bouncing off ribcage receives a <strong>🟦 Blue Card</strong>.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-white/10 bg-black/40 space-y-1.5">
                <span className="text-xs font-bold text-gym-primary uppercase block font-heading">
                  2. Buttocks &amp; Foot Contact
                </span>
                <p className="text-[11px] text-zinc-300 leading-snug">
                  Buttocks must maintain continuous contact with bench pad throughout attempt. Feet must remain stationary without sliding. Foul receives a <strong>🟨 Yellow Card</strong>.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-white/10 bg-black/40 space-y-1.5">
                <span className="text-xs font-bold text-gym-primary uppercase block font-heading">
                  3. 81cm Maximum Grip Width
                </span>
                <p className="text-[11px] text-zinc-300 leading-snug">
                  Index fingers cannot exceed knurling rings (81cm apart). Bar must be gripped with thumbs wrapped around bar (no thumbless/suicide grip allowed).
                </p>
              </div>
            </div>
          </div>

          {/* DEADLIFT HITCHING VS CLEAN LOCKOUT */}
          <div className="rounded-2xl border border-white/10 bg-black/60 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-gym-primary" />
                <h4 className="font-heading text-sm font-bold uppercase tracking-wider text-white">
                  3. Deadlift Rules: Hitching &amp; Return Control (IPF Section 6)
                </h4>
              </div>
              <span className="text-[10px] font-mono text-zinc-400">Section 6 — Deadlift</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-3.5 rounded-xl border border-white/10 bg-black/40 space-y-1.5">
                <span className="text-xs font-bold text-gym-primary uppercase block font-heading">
                  1. Hitching / Thigh Resting
                </span>
                <p className="text-[11px] text-zinc-300 leading-snug">
                  Any stopping of the bar on the thighs or using thighs as a shelf to assist the ascent is strictly prohibited. Foul receives a <strong>🟦 Blue Card</strong>.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-white/10 bg-black/40 space-y-1.5">
                <span className="text-xs font-bold text-gym-primary uppercase block font-heading">
                  2. Complete Upright Lockout
                </span>
                <p className="text-[11px] text-zinc-300 leading-snug">
                  Lifter must stand erect with shoulders retracted backward, chest out, and knees locked straight. Soft knees or forward slouching receives a <strong>🟥 Red Card</strong>.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-white/10 bg-black/40 space-y-1.5">
                <span className="text-xs font-bold text-gym-primary uppercase block font-heading">
                  3. Controlled Ground Return
                </span>
                <p className="text-[11px] text-zinc-300 leading-snug">
                  Lifter must wait for Chief Referee's audible "Down!" and downward hand signal, returning bar with both hands in control without dropping or dumping.
                </p>
              </div>
            </div>
          </div>

          {/* 3-CARD PENALTY SYSTEM QUICK SUMMARY */}
          <div className="rounded-2xl border border-white/10 bg-black/60 p-5 space-y-3">
            <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-white">
              Official 3-Card Infraction Designation Summary
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl border border-red-500/30 bg-red-950/20 text-xs">
                <span className="font-bold text-red-400 block mb-1">🟥 RED CARD</span>
                <span className="text-zinc-300 text-[11px]">
                  Failure to complete lift, break parallel squat depth, or lock out knees/shoulders.
                </span>
              </div>
              <div className="p-3 rounded-xl border border-blue-500/30 bg-blue-950/20 text-xs">
                <span className="font-bold text-blue-400 block mb-1">🟦 BLUE CARD</span>
                <span className="text-zinc-300 text-[11px]">
                  Downward bar movement during upward ascent, double bounce, heaving/bouncing on chest, or hitching on thighs.
                </span>
              </div>
              <div className="p-3 rounded-xl border border-amber-500/30 bg-amber-950/20 text-xs">
                <span className="font-bold text-amber-300 block mb-1">🟨 YELLOW CARD</span>
                <span className="text-zinc-300 text-[11px]">
                  Foot movement, buttocks lifting, elbow contact, failure to observe referee commands, or dropping bar before platform contact.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
