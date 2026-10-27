"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Dices, 
  ShieldCheck, 
  Timer, 
  UserCheck, 
  Printer, 
  AlertTriangle, 
  Award, 
  Sparkles, 
  FileText, 
  CheckCircle2,
  RefreshCw,
  Clock
} from "lucide-react";
import { DopingTestDrawCandidate } from "@/data/doping-control-data";
import { generateDopingTestDrawAction } from "@/actions/doping-control.actions";
import DopingNotificationSlipModal from "./DopingNotificationSlipModal";

interface DopingTestDrawGeneratorProps {
  events: Array<{ id: string; title: string; date: string }>;
}

export default function DopingTestDrawGenerator({ events }: DopingTestDrawGeneratorProps) {
  const [selectedEventId, setSelectedEventId] = useState(events[0]?.id || "");
  const [strategy, setStrategy] = useState<"ALL_PODIUM_AND_RECORDS" | "RANDOM_FLIGHT_LOTTERY" | "COMBINED_HYBRID">("COMBINED_HYBRID");
  const [sampleCount, setSampleCount] = useState<number>(3);
  const [chaperone, setChaperone] = useState<string>("Officer Suresh Deshmukh (NADA Certified)");
  const [loading, setLoading] = useState<boolean>(false);
  const [drawResult, setDrawResult] = useState<DopingTestDrawCandidate[]>([]);
  const [isSlipModalOpen, setIsSlipModalOpen] = useState<boolean>(false);

  const handleExecuteDraw = async () => {
    setLoading(true);
    try {
      const res = await generateDopingTestDrawAction({
        eventId: selectedEventId,
        strategy,
        sampleCount,
        assignedChaperone: chaperone,
      });

      if (res.success && res.candidates) {
        setDrawResult(res.candidates);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handlePrintSlip = () => {
    setIsSlipModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* ── Control Panel Header ── */}
      <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/40 via-black/80 to-black p-6 shadow-[0_0_40px_rgba(16,185,129,0.1)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-emerald-500/20 pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-emerald-400">
              <ShieldCheck className="h-4 w-4" />
              <span>NADA Testing Protocol • Article 5.4</span>
            </div>
            <h2 className="text-2xl font-bold uppercase tracking-tight text-white mt-1">
              Sanctioned Meet Doping Test Draw Machine
            </h2>
            <p className="text-sm text-gray-400 mt-0.5">
              Cryptographically randomized flight draws, podium targeted testing, and 60-minute chaperone escort tracking.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              Draw System Active
            </span>
          </div>
        </div>

        {/* ── Form Inputs ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6">
          {/* Meet Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
              Target Championship Meet
            </label>
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none"
            >
              {events.map((evt) => (
                <option key={evt.id} value={evt.id} className="bg-zinc-950 text-white">
                  {evt.title}
                </option>
              ))}
              <option value="default-event" className="bg-zinc-950 text-white">
                National Senior Men & Women Powerlifting Championship 2026
              </option>
            </select>
          </div>

          {/* Strategy Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
              Selection Protocol Strategy
            </label>
            <select
              value={strategy}
              onChange={(e) => setStrategy(e.target.value as any)}
              className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none"
            >
              <option value="COMBINED_HYBRID" className="bg-zinc-950 text-white">
                Combined Hybrid (Podium + Random Lottery)
              </option>
              <option value="ALL_PODIUM_AND_RECORDS" className="bg-zinc-950 text-white">
                Targeted: Gold Medalists & National Records
              </option>
              <option value="RANDOM_FLIGHT_LOTTERY" className="bg-zinc-950 text-white">
                Pure Random Flight Lottery Draw
              </option>
            </select>
          </div>

          {/* Samples & Chaperone */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                Samples Count
              </label>
              <select
                value={sampleCount}
                onChange={(e) => setSampleCount(Number(e.target.value))}
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none"
              >
                <option value={2} className="bg-zinc-950 text-white">2 Lifters</option>
                <option value={3} className="bg-zinc-950 text-white">3 Lifters</option>
                <option value={4} className="bg-zinc-950 text-white">4 Lifters</option>
                <option value={6} className="bg-zinc-950 text-white">6 Lifters</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                Chaperone In-Charge
              </label>
              <input
                type="text"
                value={chaperone}
                onChange={(e) => setChaperone(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* ── Action Trigger ── */}
        <div className="mt-6 flex items-center justify-between pt-4 border-t border-white/5">
          <div className="text-xs text-gray-400 flex items-center gap-1.5">
            <Dices className="h-4 w-4 text-emerald-400" />
            <span>Cryptographic Seed: SHA-256 Verified Pseudo-Random Distribution</span>
          </div>

          <button
            onClick={handleExecuteDraw}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-2.5 text-sm font-bold uppercase tracking-wider text-zinc-950 shadow-lg shadow-emerald-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Executing Draw...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>Generate Official Doping Draw</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Draw Results Ledger ── */}
      {drawResult && drawResult.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold uppercase tracking-tight text-white flex items-center gap-2">
              <FileText className="h-5 w-5 text-emerald-400" />
              <span>Official DCO Notification Orders Issued ({drawResult.length} Athletes Selected)</span>
            </h3>

            <button
              onClick={handlePrintSlip}
              className="flex items-center gap-1.5 rounded-lg border border-white/20 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/10 transition-colors"
            >
              <Printer className="h-3.5 w-3.5 text-gray-300" />
              <span>Print Notification Slips</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {drawResult.map((athlete) => (
              <motion.div
                key={athlete.id}
                whileHover={{ y: -2 }}
                className="relative rounded-2xl border border-emerald-500/30 bg-gradient-to-b from-zinc-900 to-zinc-950 p-5 shadow-lg overflow-hidden"
              >
                {/* Top Corner Badge */}
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-0.5 rounded-md">
                    {athlete.notificationSlipNumber}
                  </span>

                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                    athlete.reasonForSelection === "PODIUM_GOLD"
                      ? "border-amber-500/40 bg-amber-500/15 text-amber-300"
                      : athlete.reasonForSelection === "NATIONAL_RECORD"
                      ? "border-purple-500/40 bg-purple-500/15 text-purple-300"
                      : "border-blue-500/40 bg-blue-500/15 text-blue-300"
                  }`}>
                    {athlete.reasonForSelection === "PODIUM_GOLD" && "🥇 Podium Gold"}
                    {athlete.reasonForSelection === "NATIONAL_RECORD" && "📜 Record Breaker"}
                    {athlete.reasonForSelection === "RANDOM_LOTTERY" && "🎲 Random Flight Lottery"}
                  </span>
                </div>

                {/* Athlete Name & Details */}
                <h4 className="text-lg font-bold uppercase text-white tracking-wide">
                  {athlete.name}
                </h4>
                <p className="text-xs text-gray-400">
                  {athlete.weightClass} • {athlete.division} • {athlete.clubOrState}
                </p>

                <div className="mt-4 grid grid-cols-2 gap-2 text-xs py-2.5 border-y border-white/10">
                  <div>
                    <span className="text-gray-500 block text-[10px] uppercase font-mono">Platform Flight</span>
                    <span className="font-semibold text-white">{athlete.flight} (Lot #{athlete.lotNumber})</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[10px] uppercase font-mono">Assigned Chaperone</span>
                    <span className="font-semibold text-emerald-300 truncate block">{athlete.chaperoneAssigned.split("(")[0]}</span>
                  </div>
                </div>

                {/* 60-Minute Escort Countdown Indicator */}
                <div className="mt-3.5 rounded-xl border border-amber-500/20 bg-amber-500/5 p-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-300 text-xs">
                    <Clock className="h-4 w-4 text-amber-400 animate-pulse" />
                    <div>
                      <span className="font-bold block">60-Min Escort Window</span>
                      <span className="text-[10px] text-gray-400">Must report to Station by {athlete.notificationTimestamp} + 60m</span>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded">
                    59:42
                  </span>
                </div>

                {/* Directive */}
                <div className="mt-3 flex items-center gap-1.5 text-[11px] text-gray-400">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span>Chaperone must maintain continuous visual contact until testing completes.</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Official Printable 1-Page A4 Chaperone Escort Slips Modal ── */}
      <DopingNotificationSlipModal
        isOpen={isSlipModalOpen}
        onClose={() => setIsSlipModalOpen(false)}
        athletes={drawResult}
        meetTitle={events.find((e) => e.id === selectedEventId)?.title || "Sanctioned Championship"}
      />
    </div>
  );
}
