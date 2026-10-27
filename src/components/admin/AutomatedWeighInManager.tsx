"use client";

import React, { useState, useTransition } from "react";
import {
  Scale,
  Dice5,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Printer,
  Search,
  Lock,
  Copy,
  Check,
  RotateCw,
  Sparkles,
  Layers,
  ChevronDown,
  Info,
  Camera,
  Scan,
  UserCheck,
  Eye,
} from "lucide-react";
import { submitWeighIn, runCryptographicLotDrawAction } from "@/actions/weighin.actions";
import { classifyIpfWeightClass, ClassificationResult } from "@/lib/ipf-weight-classes";
import { CryptographicDrawResult } from "@/lib/cryptographic-lot-randomizer";
import FacialBiometricScannerModal from "./FacialBiometricScannerModal";

export interface WeighInAthleteItem {
  id: string; // registrationId
  userId: string;
  name: string;
  gender: "MALE" | "FEMALE";
  clubName: string;
  registeredWeightClass: string;
  division: string;
  bodyweight: number | null;
  lotNumber: number | null;
  openingSquat?: number | null;
  openingBench?: number | null;
  openingDeadlift?: number | null;
  rackHeightSquat?: string | null;
  rackHeightBench?: string | null;
  photoUrl?: string | null;
  biometricVerified?: boolean;
  biometricConfidence?: number | null;
  isProxyFlagged?: boolean;
  proxyReason?: string | null;
}

interface AutomatedWeighInManagerProps {
  eventId: string;
  eventTitle: string;
  initialAthletes: WeighInAthleteItem[];
}

export function AutomatedWeighInManager({
  eventId,
  eventTitle,
  initialAthletes,
}: AutomatedWeighInManagerProps) {
  const [athletes, setAthletes] = useState<WeighInAthleteItem[]>(initialAthletes);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenderFilter, setSelectedGenderFilter] = useState<"ALL" | "MALE" | "FEMALE">("ALL");

  // Cryptographic Draw State
  const [isDrawing, startDrawTransition] = useTransition();
  const [drawResult, setDrawResult] = useState<CryptographicDrawResult | null>(null);
  const [copiedHash, setCopiedHash] = useState(false);
  const [drawSuccessMessage, setDrawSuccessMessage] = useState<string | null>(null);

  // Biometric Check-In Modal Target
  const [biometricTarget, setBiometricTarget] = useState<WeighInAthleteItem | null>(null);

  const handleBiometricComplete = (updated: {
    registrationId: string;
    verified: boolean;
    confidence: number;
    proofHash: string;
    photoUrl?: string;
  }) => {
    setAthletes((prev) =>
      prev.map((a) =>
        a.id === updated.registrationId
          ? {
              ...a,
              biometricVerified: updated.verified,
              biometricConfidence: updated.confidence,
              photoUrl: updated.photoUrl || a.photoUrl,
            }
          : a
      )
    );
  };

  // Per-row editing state
  const [rowStates, setRowStates] = useState<
    Record<
      string,
      {
        bodyweight: string;
        lotNumber: string;
        openingSquat: string;
        openingBench: string;
        openingDeadlift: string;
        rackHeightSquat: string;
        rackHeightBench: string;
        isSaving: boolean;
        saveSuccess: boolean;
        errorMessage: string | null;
      }
    >
  >(() => {
    const initial: Record<string, any> = {};
    for (const a of initialAthletes) {
      initial[a.id] = {
        bodyweight: a.bodyweight ? a.bodyweight.toString() : "",
        lotNumber: a.lotNumber ? a.lotNumber.toString() : "",
        openingSquat: a.openingSquat ? a.openingSquat.toString() : "",
        openingBench: a.openingBench ? a.openingBench.toString() : "",
        openingDeadlift: a.openingDeadlift ? a.openingDeadlift.toString() : "",
        rackHeightSquat: a.rackHeightSquat || "",
        rackHeightBench: a.rackHeightBench || "",
        isSaving: false,
        saveSuccess: false,
        errorMessage: null,
      };
    }
    return initial;
  });

  const handleInputChange = (id: string, field: string, value: string) => {
    setRowStates((prev) => ({
      ...prev,
      [id]: {
        ...(prev[id] || {}),
        [field]: value,
        saveSuccess: false,
        errorMessage: null,
      },
    }));
  };

  // Run Cryptographic Lot Draw
  const handleExecuteLotDraw = () => {
    startDrawTransition(async () => {
      const res = await runCryptographicLotDrawAction(eventId);
      if (res.success && res.result) {
        setDrawResult(res.result);
        setDrawSuccessMessage(
          `Provably Fair Cryptographic Lot Draw Completed for ${res.result.totalAthletes} athletes!`
        );

        // Update local athletes with assigned lots
        const lotMap = new Map(res.result.assignments.map((a) => [a.registrationId, a.lotNumber]));
        setAthletes((prev) =>
          prev.map((ath) => ({
            ...ath,
            lotNumber: lotMap.get(ath.id) ?? ath.lotNumber,
          }))
        );

        // Update row states
        setRowStates((prev) => {
          const updated = { ...prev };
          for (const [regId, lotNum] of lotMap.entries()) {
            if (updated[regId]) {
              updated[regId].lotNumber = lotNum.toString();
            }
          }
          return updated;
        });

        setTimeout(() => setDrawSuccessMessage(null), 5000);
      } else {
        alert(res.error || "Failed to execute lot draw.");
      }
    });
  };

  // Save single row weigh-in
  const handleSaveRow = async (athlete: WeighInAthleteItem) => {
    const row = rowStates[athlete.id];
    if (!row) return;

    const parsedBw = parseFloat(row.bodyweight);
    const parsedLot = parseInt(row.lotNumber, 10);

    if (isNaN(parsedBw) || parsedBw <= 0) {
      setRowStates((prev) => ({
        ...prev,
        [athlete.id]: { ...prev[athlete.id], errorMessage: "Valid BW required" },
      }));
      return;
    }

    if (isNaN(parsedLot) || parsedLot <= 0) {
      setRowStates((prev) => ({
        ...prev,
        [athlete.id]: { ...prev[athlete.id], errorMessage: "Lot # required" },
      }));
      return;
    }

    setRowStates((prev) => ({
      ...prev,
      [athlete.id]: { ...prev[athlete.id], isSaving: true, errorMessage: null },
    }));

    // Check classification
    const classification = classifyIpfWeightClass(
      parsedBw,
      athlete.gender,
      athlete.registeredWeightClass
    );

    const payload = {
      registrationId: athlete.id,
      bodyweight: parsedBw,
      lotNumber: parsedLot,
      openingSquat: parseFloat(row.openingSquat) || undefined,
      openingBench: parseFloat(row.openingBench) || undefined,
      openingDeadlift: parseFloat(row.openingDeadlift) || undefined,
      rackHeightSquat: row.rackHeightSquat.trim() || undefined,
      rackHeightBench: row.rackHeightBench.trim() || undefined,
      isReclassified: !classification.registeredMatch,
      reclassifiedClass: classification.classifiedCode,
    };

    const res = await submitWeighIn(payload);

    if (res.success) {
      setAthletes((prev) =>
        prev.map((a) =>
          a.id === athlete.id
            ? {
                ...a,
                bodyweight: parsedBw,
                lotNumber: parsedLot,
                openingSquat: payload.openingSquat,
                openingBench: payload.openingBench,
                openingDeadlift: payload.openingDeadlift,
              }
            : a
        )
      );

      setRowStates((prev) => ({
        ...prev,
        [athlete.id]: {
          ...prev[athlete.id],
          isSaving: false,
          saveSuccess: true,
          errorMessage: null,
        },
      }));

      setTimeout(() => {
        setRowStates((prev) => ({
          ...prev,
          [athlete.id]: { ...prev[athlete.id], saveSuccess: false },
        }));
      }, 3000);
    } else {
      setRowStates((prev) => ({
        ...prev,
        [athlete.id]: {
          ...prev[athlete.id],
          isSaving: false,
          errorMessage: res.error || "Save failed",
        },
      }));
    }
  };

  const handleCopyProofHash = () => {
    if (drawResult?.proofHash) {
      navigator.clipboard.writeText(drawResult.proofHash);
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 2000);
    }
  };

  // Filter athletes
  const filteredAthletes = athletes.filter((a) => {
    const matchesSearch =
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.clubName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.registeredWeightClass.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGender = selectedGenderFilter === "ALL" || a.gender === selectedGenderFilter;
    return matchesSearch && matchesGender;
  });

  const totalWeighedIn = athletes.filter((a) => a.bodyweight && a.bodyweight > 0).length;
  const totalWithLot = athletes.filter((a) => a.lotNumber && a.lotNumber > 0).length;

  return (
    <div className="space-y-6">
      {/* ── TOP BANNER & CRYPTOGRAPHIC LOT DRAW ENGINE ── */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-[#170a04] via-[#0d0402] to-[#120502] p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gym-primary/15 blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-gym-primary/40 bg-gym-primary/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-gym-primary">
              <Scale className="h-3.5 w-3.5" />
              <span>MODULE 2: AUTOMATED WEIGH-IN &amp; LOT PROTOCOL</span>
            </div>

            <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-black uppercase tracking-wider text-white">
              Official Technical <span className="text-gym-primary">Weigh-In &amp; Lot Randomizer</span>
            </h1>

            <p className="text-xs sm:text-sm font-medium text-zinc-400 max-w-2xl leading-relaxed">
              Auto-classifies athletes into exact IPF weight categories (59kg – 120kg+) with real-time overweight alerts, and executes a verifiable cryptographic randomizer for non-manipulable lifting order.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-2xl border border-white/10 bg-black/60 p-4 text-center min-w-28">
              <span className="text-[10px] font-bold uppercase text-zinc-500 block">Total Lifters</span>
              <span className="font-heading text-2xl font-bold text-white font-mono">{athletes.length}</span>
            </div>
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-4 text-center min-w-28">
              <span className="text-[10px] font-bold uppercase text-emerald-400 block">Weighed-In</span>
              <span className="font-heading text-2xl font-bold text-emerald-300 font-mono">
                {totalWeighedIn} / {athletes.length}
              </span>
            </div>
            <div className="rounded-2xl border border-gym-primary/30 bg-gym-primary/10 p-4 text-center min-w-28">
              <span className="text-[10px] font-bold uppercase text-gym-primary block">Lots Assigned</span>
              <span className="font-heading text-2xl font-bold text-white font-mono">
                {totalWithLot} / {athletes.length}
              </span>
            </div>
          </div>
        </div>

        {/* ── CRYPTOGRAPHIC LOT DRAW WAR ROOM PANEL ── */}
        <div className="mt-6 pt-6 border-t border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-gym-primary" />
              <span className="text-xs font-black uppercase tracking-widest text-white">
                Provably Fair Cryptographic Lot Draw
              </span>
              <span className="rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-emerald-300">
                CSPRNG Algorithm
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">
              Generates unbiased, anti-tampering random lot numbers (1..N) backed by hardware entropy and SHA-256 audit proof.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <button
              type="button"
              onClick={() => {
                const target = athletes.find((a) => !a.biometricVerified) || athletes[0];
                if (target) setBiometricTarget(target);
              }}
              className="flex items-center gap-1.5 rounded-xl border border-cyan-500/40 bg-cyan-950/30 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-cyan-300 hover:text-white hover:bg-cyan-900/50 transition-colors shadow-sm"
              title="Open Facial Biometric & Anti-Proxy Check-In Desk"
            >
              <Scan className="h-3.5 w-3.5 text-cyan-400" />
              <span>Biometric Check-In</span>
            </button>

            <a
              href="/admin/flights"
              className="flex items-center gap-1.5 rounded-xl border border-purple-500/40 bg-purple-950/30 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-purple-300 hover:text-white hover:bg-purple-900/50 transition-colors shadow-sm"
              title="Open IPF Flight Sorter & Weigh-in Calling Sheet"
            >
              <Layers className="h-3.5 w-3.5 text-purple-400" />
              <span>Flight &amp; Lot Sorter</span>
            </a>

            <button
              type="button"
              onClick={() => window.print()}
              className="flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-zinc-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              <Printer className="h-3.5 w-3.5 text-gym-primary" />
              <span>Print Official Protocol</span>
            </button>

            <button
              type="button"
              disabled={isDrawing || athletes.length === 0}
              onClick={handleExecuteLotDraw}
              className="flex-1 md:flex-initial flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-gym-primary to-red-600 px-5 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-lg hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
            >
              <Dice5 className={`h-4 w-4 ${isDrawing ? "animate-spin" : ""}`} />
              <span>{isDrawing ? "Drawing Lots..." : "Run Cryptographic Lot Draw"}</span>
            </button>
          </div>
        </div>

        {/* Draw Success / Proof Hash Banner */}
        {drawResult && (
          <div className="mt-4 rounded-2xl border border-emerald-500/40 bg-emerald-950/30 p-4 space-y-2 animate-fade-in">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span>Provably Fair Draw Certified &amp; Ratified by Technical Jury</span>
              </div>
              <span className="text-[10px] text-zinc-400 font-mono">
                {drawResult.sessionTimestamp}
              </span>
            </div>

            <div className="flex items-center justify-between gap-3 bg-black/60 rounded-xl px-3 py-2 border border-white/10">
              <div className="flex items-center gap-2 overflow-hidden">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 shrink-0">
                  SHA-256 Proof Hash:
                </span>
                <span className="text-xs font-mono text-emerald-400 truncate">
                  {drawResult.proofHash}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopyProofHash}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-zinc-300 hover:text-white shrink-0 ml-2"
              >
                {copiedHash ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                <span>{copiedHash ? "Copied" : "Copy"}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── SEARCH & FILTER CONTROLS ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by athlete name, state/club, or weight class..."
            className="w-full rounded-xl bg-zinc-950 border border-white/10 pl-10 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-gym-primary"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-zinc-400">Gender Filter:</span>
          {(["ALL", "MALE", "FEMALE"] as const).map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setSelectedGenderFilter(g)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
                selectedGenderFilter === g
                  ? "bg-gym-primary text-white"
                  : "bg-zinc-900 text-zinc-400 hover:text-white"
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* ── LIVE INTERACTIVE WEIGH-IN DESK TABLE ── */}
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/90 shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="border-b border-white/10 bg-zinc-900 text-[10px] font-black uppercase tracking-wider text-zinc-400">
              <tr>
                <th className="px-4 py-3.5">Athlete &amp; Team</th>
                <th className="px-3 py-3.5">Biometric Gate</th>
                <th className="px-3 py-3.5">Reg. Class</th>
                <th className="px-4 py-3.5">Scale BW (kg)</th>
                <th className="px-4 py-3.5">IPF Auto-Classification</th>
                <th className="px-3 py-3.5">Lot #</th>
                <th className="px-4 py-3.5">Opening Lifts (SQ / BP / DL)</th>
                <th className="px-3 py-3.5">Rack Ht</th>
                <th className="px-4 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredAthletes.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-xs font-bold uppercase text-zinc-500">
                    No matching lifters found.
                  </td>
                </tr>
              ) : (
                filteredAthletes.map((athlete) => {
                  const row = rowStates[athlete.id] || {
                    bodyweight: "",
                    lotNumber: "",
                    openingSquat: "",
                    openingBench: "",
                    openingDeadlift: "",
                    rackHeightSquat: "",
                    rackHeightBench: "",
                    isSaving: false,
                    saveSuccess: false,
                    errorMessage: null,
                  };

                  const parsedBw = parseFloat(row.bodyweight);
                  const classification: ClassificationResult = !isNaN(parsedBw) && parsedBw > 0
                    ? classifyIpfWeightClass(parsedBw, athlete.gender, athlete.registeredWeightClass)
                    : {
                        classifiedCode: athlete.registeredWeightClass,
                        classifiedLabel: `${athlete.registeredWeightClass.replace("WC_", "")} KG`,
                        upperLimit: 0,
                        deltaKg: 0,
                        status: "EXACT_FIT",
                        message: "Awaiting scale measurement",
                        registeredMatch: true,
                        allowanceRemainingKg: 0,
                      };

                  return (
                    <tr
                      key={athlete.id}
                      className={`hover:bg-white/[0.02] transition-colors ${
                        !classification.registeredMatch && parsedBw > 0
                          ? "bg-amber-950/15"
                          : ""
                      }`}
                    >
                      {/* Athlete & Team */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {athlete.photoUrl ? (
                            <img
                              src={athlete.photoUrl}
                              alt={athlete.name}
                              className="h-8 w-8 rounded-xl object-cover border border-cyan-500/30 shrink-0"
                            />
                          ) : (
                            <div className="h-8 w-8 rounded-xl bg-zinc-800 border border-white/10 flex items-center justify-center text-xs font-bold text-zinc-400 shrink-0">
                              {athlete.name[0]}
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-white text-sm">{athlete.name}</div>
                            <div className="text-[11px] text-zinc-400">
                              {athlete.clubName} • <span className="text-zinc-500">{athlete.division}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Biometric Anti-Proxy Gate */}
                      <td className="px-3 py-3">
                        {athlete.isProxyFlagged ? (
                          <button
                            type="button"
                            onClick={() => setBiometricTarget(athlete)}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/40 text-[10px] font-bold"
                            title="Competitor flagged as proxy lifter"
                          >
                            <AlertTriangle className="w-3 h-3" />
                            <span>Proxy Flagged</span>
                          </button>
                        ) : athlete.biometricVerified ? (
                          <button
                            type="button"
                            onClick={() => setBiometricTarget(athlete)}
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-bold hover:bg-emerald-500/30 transition-colors"
                            title="Facial biometric match confirmed. Click to view scan audit."
                          >
                            <ShieldCheck className="w-3 h-3" />
                            <span>Verified ({athlete.biometricConfidence ?? 96}%)</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setBiometricTarget(athlete)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/25 text-[10px] font-bold transition-all shadow-sm"
                            title="Open Live Camera Biometric Verification"
                          >
                            <Camera className="w-3 h-3 text-cyan-400" />
                            <span>Scan Face</span>
                          </button>
                        )}
                      </td>

                      {/* Registered Class */}
                      <td className="px-3 py-3">
                        <span className="rounded bg-white/5 px-2 py-1 text-[11px] font-black text-gym-primary border border-white/10">
                          {athlete.registeredWeightClass.replace("WC_", "")} KG
                        </span>
                      </td>

                      {/* Scale Bodyweight Input */}
                      <td className="px-4 py-3">
                        <div className="relative">
                          <input
                            type="number"
                            step="0.01"
                            value={row.bodyweight}
                            onChange={(e) => handleInputChange(athlete.id, "bodyweight", e.target.value)}
                            placeholder="82.45"
                            className="w-24 rounded-lg bg-black/60 border border-white/15 px-2.5 py-1.5 text-xs font-mono font-bold text-white focus:outline-none focus:border-gym-primary"
                          />
                        </div>
                      </td>

                      {/* Real-Time IPF Classification Badge */}
                      <td className="px-4 py-3">
                        {parsedBw > 0 ? (
                          <div className="space-y-1">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                classification.status === "EXACT_FIT"
                                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                  : classification.status === "OVERWEIGHT"
                                  ? "bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse"
                                  : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                              }`}
                            >
                              {classification.status === "EXACT_FIT" ? (
                                <CheckCircle2 className="h-3 w-3" />
                              ) : (
                                <AlertTriangle className="h-3 w-3" />
                              )}
                              <span>{classification.classifiedLabel}</span>
                            </span>

                            <div className="text-[10px] text-zinc-400 max-w-xs leading-tight">
                              {classification.message}
                            </div>

                            {classification.reclassificationNote && (
                              <div className="text-[9px] font-bold text-amber-300">
                                ⚠️ {classification.reclassificationNote}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-[11px] text-zinc-500 italic">Enter weight...</span>
                        )}
                      </td>

                      {/* Lot # Input */}
                      <td className="px-3 py-3">
                        <input
                          type="number"
                          value={row.lotNumber}
                          onChange={(e) => handleInputChange(athlete.id, "lotNumber", e.target.value)}
                          placeholder="Lot"
                          className="w-16 rounded-lg bg-black/60 border border-white/15 px-2 py-1.5 text-xs font-mono font-bold text-center text-white focus:outline-none focus:border-gym-primary"
                        />
                      </td>

                      {/* Opening Lifts (SQ / BP / DL) */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            step="2.5"
                            value={row.openingSquat}
                            onChange={(e) => handleInputChange(athlete.id, "openingSquat", e.target.value)}
                            placeholder="SQ"
                            title="Opening Squat Attempt (kg)"
                            className="w-14 rounded-lg bg-black/60 border border-white/10 px-1.5 py-1 text-[11px] font-mono font-bold text-center text-zinc-200 focus:outline-none focus:border-gym-primary"
                          />
                          <input
                            type="number"
                            step="2.5"
                            value={row.openingBench}
                            onChange={(e) => handleInputChange(athlete.id, "openingBench", e.target.value)}
                            placeholder="BP"
                            title="Opening Bench Press Attempt (kg)"
                            className="w-14 rounded-lg bg-black/60 border border-white/10 px-1.5 py-1 text-[11px] font-mono font-bold text-center text-zinc-200 focus:outline-none focus:border-gym-primary"
                          />
                          <input
                            type="number"
                            step="2.5"
                            value={row.openingDeadlift}
                            onChange={(e) => handleInputChange(athlete.id, "openingDeadlift", e.target.value)}
                            placeholder="DL"
                            title="Opening Deadlift Attempt (kg)"
                            className="w-14 rounded-lg bg-black/60 border border-white/10 px-1.5 py-1 text-[11px] font-mono font-bold text-center text-zinc-200 focus:outline-none focus:border-gym-primary"
                          />
                        </div>
                      </td>

                      {/* Rack Heights */}
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            value={row.rackHeightSquat}
                            onChange={(e) => handleInputChange(athlete.id, "rackHeightSquat", e.target.value)}
                            placeholder="S:14"
                            title="Squat Rack Pin Height"
                            className="w-12 rounded-lg bg-black/60 border border-white/10 px-1 py-1 text-[10px] font-mono text-center text-zinc-400 focus:outline-none focus:border-gym-primary"
                          />
                          <input
                            type="text"
                            value={row.rackHeightBench}
                            onChange={(e) => handleInputChange(athlete.id, "rackHeightBench", e.target.value)}
                            placeholder="B:10"
                            title="Bench Press Rack Pin Height"
                            className="w-12 rounded-lg bg-black/60 border border-white/10 px-1 py-1 text-[10px] font-mono text-center text-zinc-400 focus:outline-none focus:border-gym-primary"
                          />
                        </div>
                      </td>

                      {/* Action */}
                      <td className="px-4 py-3 text-right">
                        <div className="flex flex-col items-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleSaveRow(athlete)}
                            disabled={row.isSaving}
                            className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                              row.saveSuccess
                                ? "bg-emerald-600 text-white shadow-emerald-500/30"
                                : "bg-gym-primary text-white hover:bg-orange-600"
                            }`}
                          >
                            {row.isSaving ? "Saving..." : row.saveSuccess ? "Saved ✓" : "Record"}
                          </button>
                          {row.errorMessage && (
                            <span className="text-[10px] text-red-400">{row.errorMessage}</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {biometricTarget && (
        <FacialBiometricScannerModal
          athlete={{
            ...biometricTarget,
            weightClass: biometricTarget.registeredWeightClass,
            photoUrl: biometricTarget.photoUrl || null,
          }}
          onClose={() => setBiometricTarget(null)}
          onVerificationComplete={handleBiometricComplete}
        />
      )}
    </div>
  );
}
