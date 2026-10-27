"use client";

import React, { useState, useMemo } from "react";
import {
  MeetTacticsState,
  calculateMeetDiagnostics,
} from "@/lib/attempt-tactics";
import WhatsAppIcon from "@/components/ui/WhatsAppIcon";
import {
  Printer,
  Copy,
  Check,
  Share2,
  FileText,
  Sliders,
  Dumbbell,
  Shield,
  Award,
  CheckCircle2,
} from "lucide-react";

interface OfficialAttemptCardPrintProps {
  tactics: MeetTacticsState;
  setTactics: React.Dispatch<React.SetStateAction<MeetTacticsState>>;
}

export function OfficialAttemptCardPrint({ tactics, setTactics }: OfficialAttemptCardPrintProps) {
  const [copied, setCopied] = useState<boolean>(false);
  const diagnostics = useMemo(() => calculateMeetDiagnostics(tactics), [tactics]);

  const handlePrint = () => {
    window.print();
  };

  // Update Rack Heights
  const handleRackChange = (field: "squatRack" | "benchRack" | "benchSafety", value: string) => {
    setTactics((prev) => ({
      ...prev,
      rackHeights: {
        ...prev.rackHeights,
        [field]: value,
      },
    }));
  };

  // Pre-composed WhatsApp message for coach / handler
  const whatsappMessage = useMemo(() => {
    let msg = `📋 *IPF MEET DAY ATTEMPT CARD*\n`;
    msg += `🏋️ Lifter: *${tactics.athleteName}*\n`;
    msg += `⚖️ Division: *${tactics.weightClass}* (${tactics.bodyweight} KG)\n`;
    msg += `🎯 Strategy: *${tactics.strategyRoute}*\n`;
    msg += `🔢 Flight: *${tactics.flight}* | Lot: *#${tactics.lotNumber}*\n\n`;

    msg += `📏 *RACK HEIGHTS:*\n`;
    msg += `• Squat Rack: *${tactics.rackHeights.squatRack}*\n`;
    msg += `• Bench Rack: *${tactics.rackHeights.benchRack}*\n`;
    msg += `• Bench Safety Pins: *${tactics.rackHeights.benchSafety}*\n\n`;

    msg += `🔥 *9-ATTEMPT PEAKING PLAN:*\n`;
    msg += `*SQUAT:* 1st: ${tactics.squat.attempts[0].weightKg}kg | 2nd: ${tactics.squat.attempts[1].weightKg}kg | 3rd: ${tactics.squat.attempts[2].weightKg}kg\n`;
    msg += `*BENCH:* 1st: ${tactics.bench.attempts[0].weightKg}kg | 2nd: ${tactics.bench.attempts[1].weightKg}kg | 3rd: ${tactics.bench.attempts[2].weightKg}kg\n`;
    msg += `*DEADLIFT:* 1st: ${tactics.deadlift.attempts[0].weightKg}kg | 2nd: ${tactics.deadlift.attempts[1].weightKg}kg | 3rd: ${tactics.deadlift.attempts[2].weightKg}kg\n\n`;

    msg += `🏆 *Projected Total:* ${diagnostics.projectedTotal} KG\n`;
    msg += `📊 *Projected IPF GL:* ${diagnostics.ipfGlPoints} PTS\n`;
    msg += `Generated via A&T Official Powerlifting Tactical Command`;

    return encodeURIComponent(msg);
  }, [tactics, diagnostics]);

  const handleCopy = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      let text = `IPF MEET DAY ATTEMPT CARD: ${tactics.athleteName} (${tactics.weightClass})\n\n`;
      text += `RACK HEIGHTS:\nSquat: ${tactics.rackHeights.squatRack} | Bench: ${tactics.rackHeights.benchRack} | Safety: ${tactics.rackHeights.benchSafety}\n\n`;
      text += `ATTEMPTS:\n`;
      text += `Squat: ${tactics.squat.attempts[0].weightKg} / ${tactics.squat.attempts[1].weightKg} / ${tactics.squat.attempts[2].weightKg} KG\n`;
      text += `Bench: ${tactics.bench.attempts[0].weightKg} / ${tactics.bench.attempts[1].weightKg} / ${tactics.bench.attempts[2].weightKg} KG\n`;
      text += `Deadlift: ${tactics.deadlift.attempts[0].weightKg} / ${tactics.deadlift.attempts[1].weightKg} / ${tactics.deadlift.attempts[2].weightKg} KG\n\n`;
      text += `Projected Total: ${diagnostics.projectedTotal} KG | IPF GL: ${diagnostics.ipfGlPoints} PTS`;

      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const printStyles = `
    @media print {
      @page {
        size: A4 portrait;
        margin: 10mm;
      }
      html, body {
        background: #ffffff !important;
        color: #000000 !important;
        margin: 0 !important;
        padding: 0 !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      body > *:not(#print-attempt-container) {
        display: none !important;
      }
      .no-print {
        display: none !important;
      }
      #print-attempt-container {
        display: block !important;
        visibility: visible !important;
        position: static !important;
        width: 100% !important;
        background: #ffffff !important;
        color: #000000 !important;
      }
      #print-attempt-sheet {
        display: block !important;
        visibility: visible !important;
      }
    }
  `;

  return (
    <div className="space-y-8" id="print-attempt-container">
      <style dangerouslySetInnerHTML={{ __html: printStyles }} />

      {/* ── SCREEN VIEW: HEADER ACTIONS ── */}
      <div className="no-print relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r from-zinc-950 via-black to-zinc-950 p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-gym-primary" />
              <span className="text-xs font-bold uppercase tracking-widest text-gym-primary">
                Official Score Table Triplicate Sheet
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white uppercase tracking-wider font-heading">
              IPF Competition Attempt Card &amp; Rack Form
            </h2>
            <p className="text-xs text-zinc-400">
              Complete clipboard-ready attempt card with calibrated rack heights. Printable for backstage coach and scoring marshals.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleCopy}
              className="px-3.5 py-2 rounded-xl bg-white/5 border border-white/15 text-zinc-300 hover:text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  <span>Copy</span>
                </>
              )}
            </button>

            <a
              href={`https://wa.me/?text=${whatsappMessage}`}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
            >
              <WhatsAppIcon variant="official" className="h-4 w-4" />
              <span>WhatsApp Card</span>
            </a>

            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-gym-primary to-gym-red text-white text-xs font-bold uppercase tracking-wider hover:brightness-110 transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <Printer className="h-4 w-4" />
              <span>Print Card (A4)</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── OFFICIAL ATTEMPT CARD (DUAL SCREEN / PRINT RENDERING) ── */}
      <div
        id="print-attempt-sheet"
        className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 sm:p-8 shadow-2xl text-white print:border-2 print:border-black print:bg-white print:text-black print:p-6 print:rounded-none print:shadow-none"
      >
        {/* Top Official Letterhead */}
        <div className="border-b-2 border-zinc-800 print:border-black pb-4 flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-gym-primary print:text-black" />
              <span className="text-xs font-bold uppercase tracking-widest text-gym-primary print:text-black">
                INDIAN POWERLIFTING FEDERATION (ESTD. 1975)
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold uppercase tracking-wider font-heading text-white print:text-black">
              Official Attempt &amp; Rack Height Card
            </h1>
            <p className="text-[11px] text-zinc-400 print:text-zinc-600">
              Technical Rulebook Section 8 (Attempt Progression &amp; Substitution Protocol)
            </p>
          </div>

          <div className="text-right">
            <span className="inline-block rounded border border-gym-primary/40 bg-gym-primary/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-gym-primary print:border-black print:bg-zinc-100 print:text-black">
              {tactics.flight} • LOT #{tactics.lotNumber}
            </span>
          </div>
        </div>

        {/* Lifter Biometric Ledger */}
        <div className="my-5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs border border-zinc-800 print:border-black rounded-xl p-4 bg-black/40 print:bg-zinc-50">
          <div>
            <span className="text-zinc-400 print:text-zinc-600 uppercase font-bold block text-[10px]">
              Lifter Full Name
            </span>
            <span className="font-black text-white print:text-black text-sm uppercase">
              {tactics.athleteName}
            </span>
          </div>
          <div>
            <span className="text-zinc-400 print:text-zinc-600 uppercase font-bold block text-[10px]">
              Weight Category
            </span>
            <span className="font-black text-white print:text-black text-sm">
              {tactics.weightClass} ({tactics.bodyweight} KG)
            </span>
          </div>
          <div>
            <span className="text-zinc-400 print:text-zinc-600 uppercase font-bold block text-[10px]">
              Division &amp; Gear
            </span>
            <span className="font-black text-white print:text-black text-sm uppercase">
              {tactics.gender} • {tactics.equipment}
            </span>
          </div>
          <div>
            <span className="text-zinc-400 print:text-zinc-600 uppercase font-bold block text-[10px]">
              Tactical Strategy
            </span>
            <span className="font-black text-gym-primary print:text-black text-sm uppercase">
              {tactics.strategyRoute}
            </span>
          </div>
        </div>

        {/* ── RACK HEIGHTS BANNER ── */}
        <div className="my-5 rounded-xl border border-zinc-800 print:border-black p-4 bg-zinc-900/50 print:bg-zinc-100 space-y-3">
          <div className="flex items-center gap-2">
            <Sliders className="h-4 w-4 text-gym-primary print:text-black" />
            <span className="text-xs font-bold uppercase tracking-wider text-white print:text-black">
              Official Platform Calibrated Rack Settings
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-lg border border-white/10 print:border-black/30 bg-black/50 print:bg-white p-3">
              <label className="text-[10px] font-bold uppercase text-zinc-400 print:text-zinc-600 block">
                Squat Rack Height (In / Out)
              </label>
              <input
                type="text"
                value={tactics.rackHeights.squatRack}
                onChange={(e) => handleRackChange("squatRack", e.target.value)}
                className="mt-1 w-full bg-transparent border-b border-white/20 print:border-black text-sm font-black text-white print:text-black focus:outline-none focus:border-gym-primary"
                placeholder="e.g. 14 IN"
              />
            </div>

            <div className="rounded-lg border border-white/10 print:border-black/30 bg-black/50 print:bg-white p-3">
              <label className="text-[10px] font-bold uppercase text-zinc-400 print:text-zinc-600 block">
                Bench Press Rack Pin
              </label>
              <input
                type="text"
                value={tactics.rackHeights.benchRack}
                onChange={(e) => handleRackChange("benchRack", e.target.value)}
                className="mt-1 w-full bg-transparent border-b border-white/20 print:border-black text-sm font-black text-white print:text-black focus:outline-none focus:border-gym-primary"
                placeholder="e.g. 11"
              />
            </div>

            <div className="rounded-lg border border-white/10 print:border-black/30 bg-black/50 print:bg-white p-3">
              <label className="text-[10px] font-bold uppercase text-zinc-400 print:text-zinc-600 block">
                Bench Safety Catch Pin
              </label>
              <input
                type="text"
                value={tactics.rackHeights.benchSafety}
                onChange={(e) => handleRackChange("benchSafety", e.target.value)}
                className="mt-1 w-full bg-transparent border-b border-white/20 print:border-black text-sm font-black text-white print:text-black focus:outline-none focus:border-gym-primary"
                placeholder="e.g. 6"
              />
            </div>
          </div>
        </div>

        {/* ── 9-ATTEMPT LEDGER TABLE ── */}
        <div className="overflow-x-auto my-5">
          <table className="w-full text-left border-collapse border border-zinc-800 print:border-black text-xs">
            <thead>
              <tr className="bg-zinc-900 print:bg-zinc-200 border-b border-zinc-800 print:border-black">
                <th className="p-2.5 font-black uppercase text-zinc-400 print:text-black border-r border-zinc-800 print:border-black">
                  Discipline
                </th>
                <th className="p-2.5 font-black uppercase text-zinc-400 print:text-black text-center border-r border-zinc-800 print:border-black">
                  Attempt 1
                </th>
                <th className="p-2.5 font-black uppercase text-zinc-400 print:text-black text-center border-r border-zinc-800 print:border-black">
                  Attempt 2
                </th>
                <th className="p-2.5 font-black uppercase text-zinc-400 print:text-black text-center border-r border-zinc-800 print:border-black">
                  Attempt 3
                </th>
                <th className="p-2.5 font-black uppercase text-gym-primary print:text-black text-right">
                  Best Lift
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800 print:divide-black">
              {/* SQUAT ROW */}
              <tr>
                <td className="p-3 font-black text-white print:text-black border-r border-zinc-800 print:border-black">
                  SQUAT
                </td>
                {tactics.squat.attempts.map((a) => (
                  <td
                    key={a.attemptNumber}
                    className="p-3 text-center font-mono font-bold border-r border-zinc-800 print:border-black"
                  >
                    <span className="text-sm font-black text-white print:text-black">
                      {a.weightKg} KG
                    </span>
                    <span className="block text-[9px] text-zinc-500 uppercase mt-0.5">
                      {a.result === "PENDING" ? "PLANNED" : a.result === "GOOD_LIFT" ? "⚪ 3 WHITE" : "🔴 NO LIFT"}
                    </span>
                  </td>
                ))}
                <td className="p-3 text-right font-black text-gym-primary print:text-black text-sm">
                  {diagnostics.bestSquat > 0 ? `${diagnostics.bestSquat} KG` : "—"}
                </td>
              </tr>

              {/* BENCH ROW */}
              <tr>
                <td className="p-3 font-black text-white print:text-black border-r border-zinc-800 print:border-black">
                  BENCH PRESS
                </td>
                {tactics.bench.attempts.map((a) => (
                  <td
                    key={a.attemptNumber}
                    className="p-3 text-center font-mono font-bold border-r border-zinc-800 print:border-black"
                  >
                    <span className="text-sm font-black text-white print:text-black">
                      {a.weightKg} KG
                    </span>
                    <span className="block text-[9px] text-zinc-500 uppercase mt-0.5">
                      {a.result === "PENDING" ? "PLANNED" : a.result === "GOOD_LIFT" ? "⚪ 3 WHITE" : "🔴 NO LIFT"}
                    </span>
                  </td>
                ))}
                <td className="p-3 text-right font-black text-gym-primary print:text-black text-sm">
                  {diagnostics.bestBench > 0 ? `${diagnostics.bestBench} KG` : "—"}
                </td>
              </tr>

              {/* DEADLIFT ROW */}
              <tr>
                <td className="p-3 font-black text-white print:text-black border-r border-zinc-800 print:border-black">
                  DEADLIFT
                </td>
                {tactics.deadlift.attempts.map((a) => (
                  <td
                    key={a.attemptNumber}
                    className="p-3 text-center font-mono font-bold border-r border-zinc-800 print:border-black"
                  >
                    <span className="text-sm font-black text-white print:text-black">
                      {a.weightKg} KG
                    </span>
                    <span className="block text-[9px] text-zinc-500 uppercase mt-0.5">
                      {a.result === "PENDING" ? "PLANNED" : a.result === "GOOD_LIFT" ? "⚪ 3 WHITE" : "🔴 NO LIFT"}
                    </span>
                  </td>
                ))}
                <td className="p-3 text-right font-black text-gym-primary print:text-black text-sm">
                  {diagnostics.bestDeadlift > 0 ? `${diagnostics.bestDeadlift} KG` : "—"}
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr className="bg-zinc-900/80 print:bg-zinc-100 border-t-2 border-zinc-800 print:border-black font-black">
                <td className="p-3 text-white print:text-black border-r border-zinc-800 print:border-black">
                  TOTAL / IPF GL
                </td>
                <td colSpan={3} className="p-3 text-center text-zinc-400 print:text-black">
                  Current Success Rate: {diagnostics.successRate}% • Attempts Completed: {diagnostics.completedAttemptsCount}/9
                </td>
                <td className="p-3 text-right text-sm text-gym-primary print:text-black font-heading">
                  {diagnostics.currentTotal > 0 ? `${diagnostics.currentTotal} KG` : `${diagnostics.projectedTotal} KG (Proj)`}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Signatures & Official Validation Footer */}
        <div className="mt-8 pt-6 border-t border-zinc-800 print:border-black grid grid-cols-2 gap-6 text-xs">
          <div className="border-t border-zinc-700 print:border-black pt-2 text-center">
            <span className="font-bold text-zinc-400 print:text-black block text-[10px] uppercase">
              Athlete / Designated Coach Signature
            </span>
            <span className="font-mono text-zinc-500 print:text-black text-[11px]">
              {tactics.athleteName} (Authorized)
            </span>
          </div>

          <div className="border-t border-zinc-700 print:border-black pt-2 text-center">
            <span className="font-bold text-zinc-400 print:text-black block text-[10px] uppercase">
              Technical Jury / Score Table Marshal
            </span>
            <span className="font-mono text-zinc-500 print:text-black text-[11px]">
              IPF Category I / II Official
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
