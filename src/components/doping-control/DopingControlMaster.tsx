"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  ShieldCheck, 
  Dices, 
  FlaskConical, 
  Pill, 
  MapPin, 
  Award, 
  CheckCircle2, 
  AlertTriangle,
  FileCheck2,
  Lock,
  ExternalLink
} from "lucide-react";
import DopingTestDrawGenerator from "./DopingTestDrawGenerator";
import ChainOfCustodyLogger from "./ChainOfCustodyLogger";
import DopingBlockchainLedgerViewer from "./DopingBlockchainLedgerViewer";
import ProhibitedSubstanceChecker from "./ProhibitedSubstanceChecker";
import AthleteWhereaboutsSimulator from "./AthleteWhereaboutsSimulator";
import TueApplicationGuideModal from "./TueApplicationGuideModal";

interface DopingControlMasterProps {
  events: { id: string; title: string; date: string }[];
}

export default function DopingControlMaster({ events }: DopingControlMasterProps) {
  const [activeTab, setActiveTab] = useState<"draw" | "custody" | "ledger" | "substances" | "whereabouts">("draw");

  const tabs = [
    { id: "draw", label: "Meet Doping Draw Machine", icon: Dices, badge: "Live Draw" },
    { id: "custody", label: "Chain of Custody & A/B Bottles", icon: FlaskConical, badge: "DCO Desk" },
    { id: "ledger", label: "Blockchain Immutable Ledger", icon: ShieldCheck, badge: "Court Proof" },
    { id: "substances", label: "WADA Prohibited Substance Matrix", icon: Pill, badge: "30+ Drugs" },
    { id: "whereabouts", label: "ADAMS Whereabouts Filing", icon: MapPin, badge: "RTP 60-Min" },
  ] as const;

  return (
    <div className="space-y-8">
      {/* ── Olympic Doping Control Top Hero ── */}
      <div className="relative rounded-3xl border border-emerald-500/30 bg-gradient-to-b from-zinc-900 via-zinc-950 to-black p-6 sm:p-8 lg:p-10 shadow-2xl overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-blue-500/10 blur-[120px] pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs font-mono font-bold uppercase tracking-widest text-emerald-300">
                <ShieldCheck className="h-3.5 w-3.5" />
                NADA INDIA & WADA 2026 CODE ACCREDITED
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-mono font-bold uppercase tracking-widest text-gray-300">
                STRICT LIABILITY ENFORCEMENT
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-white">
              Anti-Doping Control & <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500 bg-clip-text text-transparent">
                Whereabouts Management Portal
              </span>
            </h1>

            <p className="text-sm sm:text-base text-gray-400 leading-relaxed">
              Official Indian Powerlifting Federation testing administration portal. Conduct sanctioned meet random & targeted doping draws, seal tamper-evident A/B security bottles, verify banned substances, and file quarterly ADAMS whereabouts.
            </p>
          </div>

          {/* Quick Action Button & TUE Guide */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
            <TueApplicationGuideModal />

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-xs space-y-1">
              <span className="text-gray-400 font-mono block">Testing Laboratory:</span>
              <span className="text-white font-bold block">National Dope Testing Laboratory</span>
              <span className="text-emerald-400 text-[11px] block">NDTL New Delhi (WADA Accredited)</span>
            </div>
          </div>
        </div>

        {/* ── 4 Highlight Stats ── */}
        <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-3.5">
            <span className="text-gray-500 text-[10px] font-mono uppercase block">Testing Standard</span>
            <span className="text-base font-bold text-white mt-0.5 block">WADA ISTI 2026</span>
            <span className="text-emerald-400 text-[11px] font-semibold">100% Blind Testing</span>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-3.5">
            <span className="text-gray-500 text-[10px] font-mono uppercase block">Sample Integrity</span>
            <span className="text-base font-bold text-white mt-0.5 block">≥ 90 mL • SG ≥ 1.005</span>
            <span className="text-blue-400 text-[11px] font-semibold">A/B Bottle Separation</span>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-3.5">
            <span className="text-gray-500 text-[10px] font-mono uppercase block">Prohibited Registry</span>
            <span className="text-base font-bold text-white mt-0.5 block">30+ Chemical Classes</span>
            <span className="text-amber-400 text-[11px] font-semibold">S1 to S8 Monitored</span>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-3.5">
            <span className="text-gray-500 text-[10px] font-mono uppercase block">Standard Sanction</span>
            <span className="text-base font-bold text-red-400 mt-0.5 block">4-Year Ban</span>
            <span className="text-gray-400 text-[11px] font-semibold">First Anti-Doping Offense</span>
          </div>
        </div>
      </div>

      {/* ── Main Navigation Tabs ── */}
      <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2.5 rounded-xl px-4 py-3 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all cursor-pointer ${
                isActive
                  ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-zinc-950 shadow-lg shadow-emerald-500/25 scale-[1.02]"
                  : "border border-white/10 bg-white/[0.03] text-gray-400 hover:bg-white/[0.08] hover:text-white"
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? "text-zinc-950" : "text-emerald-400"}`} />
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                isActive ? "bg-black/20 text-zinc-950 font-black" : "bg-white/10 text-gray-300"
              }`}>
                {tab.badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Active Tab Component ── */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {activeTab === "draw" && <DopingTestDrawGenerator events={events} />}
        {activeTab === "custody" && <ChainOfCustodyLogger />}
        {activeTab === "ledger" && <DopingBlockchainLedgerViewer />}
        {activeTab === "substances" && <ProhibitedSubstanceChecker />}
        {activeTab === "whereabouts" && <AthleteWhereaboutsSimulator />}
      </motion.div>
    </div>
  );
}
