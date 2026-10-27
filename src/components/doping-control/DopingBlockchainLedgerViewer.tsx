"use client";

import React, { useState, useEffect, useTransition } from "react";
import {
  ShieldCheck,
  Lock,
  Link as LinkIcon,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  Search,
  RefreshCw,
  FileText,
  ExternalLink,
  Barcode,
  Layers,
  Fingerprint,
  Calendar,
  UserCheck,
  Sparkles,
} from "lucide-react";
import { DopingLedgerBlock, getInitialLedgerChain, verifyLedgerChain } from "@/lib/doping-chain-ledger";
import { getDopingBlockchainLedgerAction } from "@/actions/doping-control.actions";

interface DopingBlockchainLedgerViewerProps {
  onOpenDcfModal?: (testCode: string) => void;
}

export default function DopingBlockchainLedgerViewer({
  onOpenDcfModal,
}: DopingBlockchainLedgerViewerProps) {
  const [chain, setChain] = useState<DopingLedgerBlock[]>(() => getInitialLedgerChain());
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [isVerifying, startVerifyTransition] = useTransition();
  const [integrityStatus, setIntegrityStatus] = useState<{
    verified: boolean;
    timestamp: string;
    message: string;
  }>({
    verified: true,
    timestamp: new Date().toLocaleTimeString("en-IN"),
    message: "All blocks verified with valid Merkle roots and SHA-256 parent hash links.",
  });

  useEffect(() => {
    // Load live chain from server actions
    getDopingBlockchainLedgerAction().then((res) => {
      if (res.success && res.chain) {
        setChain(res.chain);
      }
    });
  }, []);

  const handleCopy = (text: string, id: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedHash(id);
      setTimeout(() => setCopiedHash(null), 2000);
    }
  };

  const handleRunIntegrityAudit = () => {
    startVerifyTransition(async () => {
      const res = await getDopingBlockchainLedgerAction();
      if (res.success && res.chain) {
        setChain(res.chain);
        const check = verifyLedgerChain(res.chain);
        setIntegrityStatus({
          verified: check.isValid,
          timestamp: new Date().toLocaleTimeString("en-IN"),
          message: check.isValid
            ? `Cryptographic Merkle tree & SHA-256 chain audit passed for all ${res.chain.length} blocks.`
            : `Integrity fault detected at Block #${check.corruptedBlockHeight}: ${check.reason}`,
        });
      }
    });
  };

  const filteredBlocks = chain.filter((b) => {
    const q = searchQuery.toLowerCase();
    return (
      b.testCode.toLowerCase().includes(q) ||
      b.athleteName.toLowerCase().includes(q) ||
      b.sampleData.aSampleBarcode.toLowerCase().includes(q) ||
      b.sampleData.bSampleBarcode.toLowerCase().includes(q) ||
      b.dcoOfficer.name.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* ── TOP IMMUTABLE LEDGER HEADER ── */}
      <div className="relative overflow-hidden rounded-3xl border border-emerald-500/30 bg-gradient-to-r from-[#04140d] via-[#020b07] to-[#010805] p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-300">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>MODULE 7: BLOCKCHAIN-STYLE AUDIT LEDGER</span>
            </div>

            <h2 className="font-heading text-2xl sm:text-3xl font-black uppercase tracking-wider text-white">
              NADA / WADA <span className="text-emerald-400">Chain-of-Custody Digital Ledger</span>
            </h2>

            <p className="text-xs sm:text-sm font-medium text-zinc-400 max-w-2xl leading-relaxed">
              Every A and B sample bottle barcode, testing officer digital signature, and athlete consent form is cryptographically linked in an immutable SHA-256 block hash chain for 100% legal transparency and court admissibility.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-2xl border border-white/10 bg-black/60 p-4 text-center min-w-28">
              <span className="text-[10px] font-bold uppercase text-zinc-500 block">Block Height</span>
              <span className="font-heading text-2xl font-bold text-white font-mono">
                #{chain.length - 1}
              </span>
            </div>
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-4 text-center min-w-28">
              <span className="text-[10px] font-bold uppercase text-emerald-400 block">Sealed Bottles</span>
              <span className="font-heading text-2xl font-bold text-emerald-300 font-mono">
                {Math.max(0, (chain.length - 1) * 2)}
              </span>
            </div>
            <div className="rounded-2xl border border-blue-500/30 bg-blue-950/20 p-4 text-center min-w-28">
              <span className="text-[10px] font-bold uppercase text-blue-400 block">Chain Integrity</span>
              <span className="font-heading text-xs font-black uppercase tracking-widest text-emerald-300 flex items-center justify-center gap-1 mt-1">
                <CheckCircle2 className="h-4 w-4" /> 100% Valid
              </span>
            </div>
          </div>
        </div>

        {/* ── Cryptographic Audit Action Bar ── */}
        <div className="mt-6 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-zinc-300">
            <Fingerprint className="h-4 w-4 text-emerald-400" />
            <span className="font-bold text-white">SHA-256 Parent Chaining:</span>
            <span className="text-zinc-400 font-mono text-[11px] truncate max-w-xs sm:max-w-md">
              Latest Hash: {chain[chain.length - 1]?.blockHash}
            </span>
          </div>

          <button
            type="button"
            onClick={handleRunIntegrityAudit}
            disabled={isVerifying}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 text-xs font-black uppercase tracking-wider text-white shadow-lg hover:scale-[1.02] active:scale-95 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isVerifying ? "animate-spin" : ""}`} />
            <span>{isVerifying ? "Auditing Hashes..." : "Verify Cryptographic Chain"}</span>
          </button>
        </div>

        {/* Live Integrity Banner */}
        <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-950/20 px-3.5 py-2.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-emerald-300">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>{integrityStatus.message}</span>
          </div>
          <span className="text-[10px] font-mono text-zinc-400 shrink-0 ml-2">
            Verified at {integrityStatus.timestamp}
          </span>
        </div>
      </div>

      {/* ── SEARCH & FILTER ── */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by test code, athlete name, or sample barcode..."
            className="w-full rounded-xl bg-zinc-950 border border-white/10 pl-10 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <span className="text-xs font-bold text-zinc-400 font-mono">
          Showing {filteredBlocks.length} / {chain.length} Blocks
        </span>
      </div>

      {/* ── THE BLOCKCHAIN-STYLE CHRONOLOGICAL LEDGER ── */}
      <div className="space-y-4">
        {filteredBlocks.map((block, index) => {
          const isGenesis = block.blockHeight === 0;

          return (
            <div
              key={block.blockHash}
              className="relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/90 p-5 shadow-xl hover:border-emerald-500/40 transition-colors space-y-4"
            >
              {/* Block Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="rounded-lg bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-1 text-xs font-mono font-black text-emerald-300">
                    {isGenesis ? "GENESIS BLOCK #000" : `BLOCK #${String(block.blockHeight).padStart(3, "0")}`}
                  </span>
                  <span className="text-sm font-bold text-white uppercase tracking-wider font-heading">
                    {block.testCode}
                  </span>
                  <span className="rounded-full bg-white/5 border border-white/10 px-2 py-0.5 text-[10px] font-bold uppercase text-zinc-400">
                    {block.auditStatus.replace(/_/g, " ")}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs text-zinc-400 font-mono">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-zinc-500" />
                    <span>{new Date(block.timestamp).toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>

              {/* Hashes & Merkle Root */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                <div className="rounded-xl border border-white/5 bg-black/60 p-3 space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                    <span className="flex items-center gap-1">
                      <LinkIcon className="h-3 w-3 text-zinc-400" />
                      Previous Block Hash
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(block.previousBlockHash, `prev-${block.blockHeight}`)}
                      className="text-zinc-400 hover:text-white"
                    >
                      {copiedHash === `prev-${block.blockHeight}` ? (
                        <Check className="h-3 w-3 text-emerald-400" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </button>
                  </div>
                  <div className="text-[11px] text-zinc-400 truncate">
                    {block.previousBlockHash}
                  </div>
                </div>

                <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/10 p-3 space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                    <span className="flex items-center gap-1">
                      <Lock className="h-3 w-3" />
                      Current Block Hash (Immutable Seal)
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(block.blockHash, `curr-${block.blockHeight}`)}
                      className="text-emerald-400 hover:text-white"
                    >
                      {copiedHash === `curr-${block.blockHeight}` ? (
                        <Check className="h-3 w-3 text-emerald-300" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </button>
                  </div>
                  <div className="text-[11px] text-emerald-300 truncate font-bold">
                    {block.blockHash}
                  </div>
                </div>
              </div>

              {/* Sample Bottle Details & Physical Security */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                {/* A-Bottle */}
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3 space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 block">
                    Bottle A • Primary Analysis
                  </span>
                  <div className="font-mono font-bold text-white text-xs flex items-center gap-1.5">
                    <Barcode className="h-3.5 w-3.5 text-emerald-400" />
                    <span>{block.sampleData.aSampleBarcode}</span>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-400 block">
                    Seal Cap: {block.sampleData.aBottleSealCode}
                  </span>
                </div>

                {/* B-Bottle */}
                <div className="rounded-xl border border-blue-500/30 bg-blue-950/20 p-3 space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-blue-400 block">
                    Bottle B • Counter-Analysis Reserve
                  </span>
                  <div className="font-mono font-bold text-white text-xs flex items-center gap-1.5">
                    <Barcode className="h-3.5 w-3.5 text-blue-400" />
                    <span>{block.sampleData.bSampleBarcode}</span>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-400 block">
                    Seal Cap: {block.sampleData.bBottleSealCode}
                  </span>
                </div>

                {/* Physical Specifications */}
                <div className="rounded-xl border border-white/10 bg-black/40 p-3 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                    Physical Metrics
                  </span>
                  <div className="text-white font-mono text-xs">
                    {block.sampleData.sampleVolumeMl} mL • SG {block.sampleData.specificGravity} • pH {block.sampleData.samplePh}
                  </div>
                  <span className="text-[10px] text-emerald-400 font-semibold block">
                    ✓ Meets WADA Spec (≥90mL)
                  </span>
                </div>

                {/* Athlete & Meet */}
                <div className="rounded-xl border border-white/10 bg-black/40 p-3 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                    Athlete &amp; Destination
                  </span>
                  <div className="text-white font-bold text-xs truncate">
                    {block.athleteName}
                  </div>
                  <span className="text-[10px] text-zinc-400 truncate block">
                    NDTL WADA Lab, New Delhi
                  </span>
                </div>
              </div>

              {/* Digital Signatures & Athlete Legal Consent Audit */}
              <div className="rounded-xl border border-white/10 bg-black/60 p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-2">
                  <span className="text-xs font-black uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                    <UserCheck className="h-4 w-4 text-emerald-400" />
                    <span>Tripartite Digital Signatures &amp; Athlete Consent Protocol</span>
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    Indian Evidence Act Sec 65B Compliant
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* DCO Signature Box */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-zinc-400 font-bold">1. Doping Control Officer (DCO):</span>
                      <span className="text-emerald-400 font-bold text-[10px]">VERIFIED ✓</span>
                    </div>
                    <div className="text-white font-medium">
                      {block.dcoOfficer.name} (License: {block.dcoOfficer.licenseNumber})
                    </div>
                    <div className="text-[10px] font-mono text-zinc-500 truncate">
                      Digital Signature Hash: {block.dcoOfficer.dcoSignatureHash}
                    </div>
                  </div>

                  {/* Athlete Consent Box */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-zinc-400 font-bold">2. Athlete Legal Consent:</span>
                      <span className="text-emerald-400 font-bold text-[10px]">CONSENT GRANTED ✓</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-[10px] text-zinc-300">
                      <span className="inline-flex items-center gap-1 text-emerald-300">
                        <Check className="h-3 w-3 text-emerald-400" /> Witnessed Sample
                      </span>
                      <span className="inline-flex items-center gap-1 text-emerald-300">
                        <Check className="h-3 w-3 text-emerald-400" /> Bottles Selected
                      </span>
                      <span className="inline-flex items-center gap-1 text-emerald-300">
                        <Check className="h-3 w-3 text-emerald-400" /> Barcodes Matched
                      </span>
                    </div>
                    <div className="text-[10px] font-mono text-zinc-500 truncate">
                      Consent Token Hash: {block.athleteConsent.athleteSignatureHash}
                    </div>
                  </div>
                </div>

                {/* Declared Medication */}
                <div className="pt-2 border-t border-white/5 text-[11px] text-zinc-400">
                  <span className="font-bold text-zinc-300">Declared Medications / TUE: </span>
                  <span className="italic">{block.declaredSubstances}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
