"use client";

import React, { useState, useTransition } from "react";
import { issueRefereeConductWarningAction } from "@/actions/scoring.actions";
import {
  ShieldAlert,
  AlertTriangle,
  Ban,
  UserX,
  UserCheck,
  CheckCircle2,
  FileWarning,
  Scale,
  Award,
  Shirt,
  HelpCircle,
  History,
  Send,
} from "lucide-react";

interface ConductLogEntry {
  id: string;
  athleteName: string;
  type: "YELLOW_WARNING" | "RED_DISQUALIFICATION";
  reason: string;
  ruleCode: string;
  timestamp: string;
}

interface RefereeConductDeskProps {
  currentAthleteName: string;
  refereeName?: string;
}

const COMMON_CONDUCT_INFRACTIONS = [
  {
    code: "IPF-13.1",
    label: "Intentional Barbell Dumping (Safety Hazard to Spotters)",
    type: "RED_DISQUALIFICATION" as const,
  },
  {
    code: "IPF-13.2",
    label: "Abusive or Threatening Behavior Toward Referees or Loaders",
    type: "RED_DISQUALIFICATION" as const,
  },
  {
    code: "IPF-13.3",
    label: "Coach Coaching / Shouting From Prohibited Platform Area",
    type: "YELLOW_WARNING" as const,
  },
  {
    code: "IPF-13.4",
    label: "Unauthorized Application of Chalk / Powder on Platform",
    type: "YELLOW_WARNING" as const,
  },
  {
    code: "IPF-13.5",
    label: "Delaying Competition / Refusal to Clear Platform Promptly",
    type: "YELLOW_WARNING" as const,
  },
  {
    code: "IPF-13.6",
    label: "Second Official Warning Following Yellow Card Sanction",
    type: "RED_DISQUALIFICATION" as const,
  },
];

export function RefereeConductDesk({
  currentAthleteName,
  refereeName = "Chief Technical Referee",
}: RefereeConductDeskProps) {
  // Uniform & Neutrality Compliance Checklist state
  const [uniformChecks, setUniformChecks] = useState({
    whiteShirt: true,
    officialTie: true,
    darkTrousers: true,
    federationBlazer: true,
    neutralityPledge: true,
  });

  // Warning Form state
  const [targetName, setTargetName] = useState<string>(currentAthleteName);
  const [sanctionType, setSanctionType] = useState<"YELLOW_WARNING" | "RED_DISQUALIFICATION">(
    "YELLOW_WARNING"
  );
  const [selectedInfraction, setSelectedInfraction] = useState<string>(
    COMMON_CONDUCT_INFRACTIONS[2].label
  );
  const [ruleCode, setRuleCode] = useState<string>(COMMON_CONDUCT_INFRACTIONS[2].code);
  const [additionalNotes, setAdditionalNotes] = useState<string>("");
  const [isSubmitting, startTransition] = useTransition();
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError?: boolean } | null>(
    null
  );

  // Recent Sanctions audit log
  const [sanctionLogs, setSanctionLogs] = useState<ConductLogEntry[]>([
    {
      id: "log-1",
      athleteName: "Karan Johal (Coach)",
      type: "YELLOW_WARNING",
      reason: "Coach coaching from prohibited platform boundary area",
      ruleCode: "IPF-13.3",
      timestamp: "12 mins ago",
    },
  ]);

  const toggleUniformCheck = (key: keyof typeof uniformChecks) => {
    setUniformChecks((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const isUniformCompliant = Object.values(uniformChecks).every(Boolean);

  const handleInfractionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedLabel = e.target.value;
    setSelectedInfraction(selectedLabel);
    const found = COMMON_CONDUCT_INFRACTIONS.find((i) => i.label === selectedLabel);
    if (found) {
      setRuleCode(found.code);
      setSanctionType(found.type);
    }
  };

  const handleIssueSanction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetName.trim()) {
      setStatusMessage({ text: "Please enter the athlete or coach's name.", isError: true });
      return;
    }

    startTransition(async () => {
      try {
        const fullReason = additionalNotes.trim()
          ? `${selectedInfraction} — Notes: ${additionalNotes}`
          : selectedInfraction;

        const res = await issueRefereeConductWarningAction({
          athleteName: targetName,
          type: sanctionType,
          reason: fullReason,
          ruleCode,
        });

        if (res.success) {
          const newEntry: ConductLogEntry = {
            id: `log-${Date.now()}`,
            athleteName: targetName,
            type: sanctionType,
            reason: fullReason,
            ruleCode,
            timestamp: "Just now",
          };
          setSanctionLogs((prev) => [newEntry, ...prev]);
          setStatusMessage({ text: res.message || "Sanction recorded successfully!" });
          setAdditionalNotes("");
          setTimeout(() => setStatusMessage(null), 5000);
        } else {
          setStatusMessage({ text: res.error || "Failed to record sanction.", isError: true });
        }
      } catch (err: any) {
        setStatusMessage({ text: err.message || "Error issuing sanction.", isError: true });
      }
    });
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-[#180d09] via-[#0f0705] to-[#070302] p-6 shadow-2xl space-y-6">
      {/* ── TOP HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-gym-primary" />
            <h3 className="font-heading text-lg font-bold uppercase tracking-wider text-white">
              Referee Code of Conduct &amp; Disciplinary Desk
            </h3>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            IPF Section 8 &amp; 13: Strict Referee Neutrality, Official Dress Code &amp; Athlete/Coach Platform Sanctions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isUniformCompliant ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-bold uppercase">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Referee Certified Compliant</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs font-bold uppercase">
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>Uniform Check Incomplete</span>
            </span>
          )}
        </div>
      </div>

      {statusMessage && (
        <div
          className={`rounded-2xl p-4 text-xs font-bold flex items-center gap-2 border animate-fadeIn ${
            statusMessage.isError
              ? "bg-red-950/60 border-red-500/50 text-red-300"
              : "bg-emerald-950/60 border-emerald-500/50 text-emerald-300"
          }`}
        >
          {statusMessage.isError ? (
            <AlertTriangle className="h-4 w-4 shrink-0 text-red-400" />
          ) : (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* ── 2 COLUMN GRID: 1) CODE OF CONDUCT & DRESS CODE, 2) SANCTION ISSUER ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Official Referee Uniform & Neutrality Pledge */}
        <div className="rounded-2xl border border-white/10 bg-black/60 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white">
              <Shirt className="h-4 w-4 text-gym-primary" />
              <span>Official Referee Uniform &amp; Ethics Standards</span>
            </div>
            <span className="text-[10px] text-zinc-500 font-mono">IPF Section 8.1</span>
          </div>

          <p className="text-xs text-zinc-400 leading-relaxed">
            Referees must maintain strict professional neutrality, free from all club or state bias. The official IPF uniform is mandatory on the competition platform.
          </p>

          <div className="space-y-2.5">
            {[
              {
                key: "whiteShirt" as const,
                label: "Clean White Collared Shirt or Blouse",
                desc: "Crisp white button-down with sleeves unrolled.",
              },
              {
                key: "officialTie" as const,
                label: "Official Federation / IPF Tie or Cravat",
                desc: "Official certified neckwear properly fastened.",
              },
              {
                key: "darkTrousers" as const,
                label: "Dark Trousers / Slacks (Navy, Grey or Black)",
                desc: "Formal attire; no jeans, track pants, or shorts.",
              },
              {
                key: "federationBlazer" as const,
                label: "Official Federation Blazer with Badge/Crest",
                desc: "Category 1 / 2 International referee crest.",
              },
              {
                key: "neutralityPledge" as const,
                label: "Declaration of Strict Impartiality & Neutrality",
                desc: "No favoritism, coaching, or bias from the referee chairs.",
              },
            ].map(({ key, label, desc }) => (
              <label
                key={key}
                onClick={() => toggleUniformCheck(key)}
                className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none ${
                  uniformChecks[key]
                    ? "bg-white/5 border-gym-primary/40 text-white"
                    : "bg-black/40 border-white/5 text-zinc-400 hover:border-white/20"
                }`}
              >
                <div
                  className={`mt-0.5 h-4 w-4 rounded border flex items-center justify-center shrink-0 ${
                    uniformChecks[key]
                      ? "bg-gym-primary border-gym-primary text-black"
                      : "border-zinc-600 bg-transparent"
                  }`}
                >
                  {uniformChecks[key] && <CheckCircle2 className="h-3.5 w-3.5" />}
                </div>
                <div>
                  <span className="text-xs font-bold block">{label}</span>
                  <span className="text-[10px] text-zinc-500">{desc}</span>
                </div>
              </label>
            ))}
          </div>

          <div className="p-3 rounded-xl bg-gym-primary/10 border border-gym-primary/20 text-[11px] text-gym-primary leading-snug">
            <strong className="block font-black uppercase text-[10px] mb-0.5">
              Referees Power of Disqualification (IPF 8.8):
            </strong>
            The platform referee panel holds sovereign authority to caution or immediately disqualify any athlete, coach, or trainer whose behavior violates sportsmanlike conduct or platform safety.
          </div>
        </div>

        {/* Right Column: Platform Disciplinary Sanctions Desk */}
        <div className="rounded-2xl border border-white/10 bg-black/60 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white">
              <FileWarning className="h-4 w-4 text-gym-primary" />
              <span>Issue Official Warning or Disqualification</span>
            </div>
            <span className="text-[10px] text-zinc-500 font-mono">Real-time Platform Sanctions</span>
          </div>

          <form onSubmit={handleIssueSanction} className="space-y-4">
            {/* Target Lifter / Coach Name */}
            <div>
              <label className="text-[10px] font-bold uppercase text-zinc-400 block mb-1">
                Target Athlete or Coach Name
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={targetName}
                  onChange={(e) => setTargetName(e.target.value)}
                  className="flex-1 bg-black/80 border border-white/15 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-gym-primary font-heading"
                  placeholder="Athlete or Coach Name"
                />
                <button
                  type="button"
                  onClick={() => setTargetName(currentAthleteName)}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-[10px] font-semibold uppercase text-zinc-300 transition-colors"
                >
                  Current Lifter
                </button>
              </div>
            </div>

            {/* Sanction Card Type Selector */}
            <div>
              <label className="text-[10px] font-bold uppercase text-zinc-400 block mb-1.5">
                Sanction Level
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSanctionType("YELLOW_WARNING")}
                  className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-heading text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    sanctionType === "YELLOW_WARNING"
                      ? "bg-amber-500/20 border-amber-500 text-amber-300 shadow-lg shadow-amber-500/20"
                      : "bg-black/40 border-white/10 text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  <AlertTriangle className="h-4 w-4 text-amber-400" />
                  <span>🟨 Yellow Warning</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSanctionType("RED_DISQUALIFICATION")}
                  className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-heading text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    sanctionType === "RED_DISQUALIFICATION"
                      ? "bg-red-600/30 border-red-500 text-red-300 shadow-lg shadow-red-600/30"
                      : "bg-black/40 border-white/10 text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  <Ban className="h-4 w-4 text-red-400" />
                  <span>🟥 Red Disqualification</span>
                </button>
              </div>
            </div>

            {/* Common Infraction Selection */}
            <div>
              <label className="text-[10px] font-bold uppercase text-zinc-400 block mb-1">
                Official Infraction Clause
              </label>
              <select
                value={selectedInfraction}
                onChange={handleInfractionChange}
                className="w-full bg-black/80 border border-white/15 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-gym-primary cursor-pointer"
              >
                {COMMON_CONDUCT_INFRACTIONS.map((inf) => (
                  <option key={inf.code} value={inf.label}>
                    [{inf.code}] {inf.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Additional Remarks */}
            <div>
              <label className="text-[10px] font-bold uppercase text-zinc-400 block mb-1">
                Specific Referee Incident Notes
              </label>
              <textarea
                rows={2}
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                placeholder="Details of warning given, time, verbal warning context..."
                className="w-full bg-black/80 border border-white/15 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-gym-primary"
              />
            </div>

            {/* Submit Sanction Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 px-4 rounded-xl font-heading text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg ${
                sanctionType === "RED_DISQUALIFICATION"
                  ? "bg-red-600 hover:bg-red-700 text-white shadow-red-600/30"
                  : "bg-amber-500 hover:bg-amber-600 text-black shadow-amber-500/30"
              }`}
            >
              <Send className="h-4 w-4" />
              <span>
                {isSubmitting
                  ? "Broadcasting to Platform..."
                  : sanctionType === "RED_DISQUALIFICATION"
                  ? "Issue Red Card (Disqualify Lifter/Coach)"
                  : "Issue Official Yellow Card Warning"}
              </span>
            </button>
          </form>
        </div>
      </div>

      {/* ── SANCTION AUDIT LOG HISTORY ── */}
      <div className="rounded-2xl border border-white/10 bg-black/60 p-5 space-y-3">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white">
            <History className="h-4 w-4 text-gym-primary" />
            <span>Platform Conduct Sanctions Log</span>
          </div>
          <span className="text-[10px] text-zinc-500 font-mono">
            Recorded by Chief Referee &amp; Technical Jury
          </span>
        </div>

        {sanctionLogs.length === 0 ? (
          <div className="p-6 text-center text-xs text-zinc-500 italic">
            No disciplinary sanctions issued in this championship session. Clean sportsmanship!
          </div>
        ) : (
          <div className="space-y-2">
            {sanctionLogs.map((log) => (
              <div
                key={log.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/15 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`px-2.5 py-1 rounded text-[10px] font-semibold uppercase shrink-0 ${
                      log.type === "RED_DISQUALIFICATION"
                        ? "bg-red-500/20 text-red-400 border border-red-500/40"
                        : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                    }`}
                  >
                    {log.type === "RED_DISQUALIFICATION" ? "🟥 DISQUALIFIED" : "🟨 WARNING"}
                  </span>
                  <div>
                    <span className="text-xs font-black text-white uppercase block">
                      {log.athleteName}
                    </span>
                    <span className="text-[11px] text-zinc-400">{log.reason}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-right shrink-0">
                  <span className="text-[10px] font-mono text-gym-primary font-bold">
                    {log.ruleCode}
                  </span>
                  <span className="text-[10px] text-zinc-500 font-mono">{log.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
