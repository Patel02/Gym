"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  FlaskConical, 
  Barcode, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  Printer, 
  Send, 
  FileCheck2, 
  Scale, 
  Thermometer, 
  Lock,
  Clock,
  Sparkles,
  Fingerprint,
  UserCheck,
  Check,
  Layers,
  Copy
} from "lucide-react";
import { DopingChainOfCustodyRecord, SEED_CHAIN_OF_CUSTODY_RECORDS } from "@/data/doping-control-data";
import { submitChainOfCustodyAction } from "@/actions/doping-control.actions";
import { DopingLedgerBlock } from "@/lib/doping-chain-ledger";
import DopingControlFormModal from "./DopingControlFormModal";

export default function ChainOfCustodyLogger() {
  const [athleteName, setAthleteName] = useState("Patel Rakesh");
  const [athleteId, setAthleteId] = useState("cmu3n9gdd0004toa6di565n31");
  const [meetTitle, setMeetTitle] = useState("Indian National Senior Men & Women Powerlifting Championship 2026");
  const [sampleVolume, setSampleVolume] = useState<number>(100);
  const [specificGravity, setSpecificGravity] = useState<number>(1.020);
  const [samplePh, setSamplePh] = useState<number>(6.5);
  const [dcoName, setDcoName] = useState("Dr. Arvind Rao, MD (Senior NADA DCO)");
  const [dcoLicense, setDcoLicense] = useState("DCO-NADA-IND-042");
  const [chaperoneName, setChaperoneName] = useState("Inspector Rajesh Kumar");
  const [declaration, setDeclaration] = useState("Asthalin Inhaler (Salbutamol 200mcg - Approved TUE #TUE-2026-081), Creatine Monohydrate 5g, Electrolyte Drink.");

  // Deterministic live barcodes
  const [aBarcode, setABarcode] = useState(`A-NADA-${Math.floor(80000 + Math.random() * 9000)}-SEC`);
  const [bBarcode, setBBarcode] = useState(`B-NADA-${Math.floor(80000 + Math.random() * 9000)}-SEC`);
  
  // Mandatory Legal Consent Checkmarks (WADA Article 5.4)
  const [consentWitnessed, setConsentWitnessed] = useState(true);
  const [consentBottlesChosen, setConsentBottlesChosen] = useState(true);
  const [consentBarcodesMatch, setConsentBarcodesMatch] = useState(true);
  const [consentNoTampering, setConsentNoTampering] = useState(true);

  // Digital Signatures
  const [athleteSignatureText, setAthleteSignatureText] = useState("Patel Rakesh (Signed Digital Consent)");
  const [dcoSignatureText, setDcoSignatureText] = useState("Dr. Arvind Rao, MD (PKI Token DCO-NADA-IND-042)");

  const [records, setRecords] = useState<DopingChainOfCustodyRecord[]>(SEED_CHAIN_OF_CUSTODY_RECORDS);
  const [sealedBlock, setSealedBlock] = useState<DopingLedgerBlock | null>(null);
  const [selectedRecordForDcf, setSelectedRecordForDcf] = useState<DopingChainOfCustodyRecord | null>(null);
  const [isDcfOpen, setIsDcfOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [copiedHash, setCopiedHash] = useState(false);

  const openDcf = (rec: DopingChainOfCustodyRecord) => {
    setSelectedRecordForDcf(rec);
    setIsDcfOpen(true);
  };

  const isValidVolume = sampleVolume >= 90;
  const isValidSg = specificGravity >= 1.005;
  const allConsentGiven = consentWitnessed && consentBottlesChosen && consentBarcodesMatch && consentNoTampering;

  const handleSealAndSubmit = async () => {
    if (!allConsentGiven) {
      alert("All 4 WADA Athlete Legal Consent items must be verified before sealing samples.");
      return;
    }

    setIsSubmitting(true);
    setNotification(null);

    try {
      const testCode = `NADA-2026-IND-${Math.floor(1000 + Math.random() * 9000)}`;
      const res = await submitChainOfCustodyAction({
        testCode,
        athleteName,
        athleteId,
        meetTitle,
        aSampleBarcode: aBarcode,
        bSampleBarcode: bBarcode,
        sampleVolumeMl: sampleVolume,
        specificGravity,
        samplePh,
        dcoOfficerName: dcoName,
        dcoLicenseNumber: dcoLicense,
        chaperoneName,
        athleteDeclaration: declaration,
        dcoSignatureDataUrl: dcoSignatureText,
        athleteSignatureDataUrl: athleteSignatureText,
        witnessedObservation: consentWitnessed,
        bottlesChosenByAthlete: consentBottlesChosen,
        barcodesMatched: consentBarcodesMatch,
        noTamperingObserved: consentNoTampering,
      });

      if (res.success && res.record) {
        setRecords([res.record, ...records]);
        setSelectedRecordForDcf(res.record);
        if (res.block) {
          setSealedBlock(res.block);
        }
        setIsDcfOpen(true);
        setNotification({
          type: "success",
          message: `Chain of Custody sealed & mined into Immutable Blockchain Ledger! Tracking Reference: ${res.trackingReference}`,
        });
        // Generate next pair of barcodes
        setABarcode(`A-NADA-${Math.floor(80000 + Math.random() * 9000)}-SEC`);
        setBBarcode(`B-NADA-${Math.floor(80000 + Math.random() * 9000)}-SEC`);
      } else {
        setNotification({
          type: "error",
          message: res.error || "Failed to seal sample.",
        });
      }
    } catch (e: any) {
      setNotification({
        type: "error",
        message: e.message || "An unexpected error occurred.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* ── Top Workbench Header ── */}
      <div className="rounded-2xl border border-blue-500/30 bg-gradient-to-br from-blue-950/40 via-black/80 to-black p-6 shadow-[0_0_40px_rgba(59,130,246,0.1)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-blue-500/20 pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-blue-400">
              <FlaskConical className="h-4 w-4" />
              <span>Doping Control Station (DCS) • Chain of Custody Desk</span>
            </div>
            <h2 className="text-2xl font-bold uppercase tracking-tight text-white mt-1">
              Sample Collection, Digital Signature &amp; A/B Sealing
            </h2>
            <p className="text-xs text-gray-400 mt-1 max-w-2xl">
              Strict liability testing protocol. Athlete and DCO execute digital signatures, verify barcode integrity, and seal security caps into the blockchain-style immutable audit trail.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs font-mono font-bold text-emerald-300">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>WADA ISTI SEC 65B READY</span>
            </span>
          </div>
        </div>

        {/* Live Notification */}
        {notification && (
          <div className={`mt-4 p-4 rounded-xl text-xs font-mono flex items-center justify-between gap-2 border ${
            notification.type === "success" 
              ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
              : "bg-red-950/40 border-red-500/40 text-red-300"
          }`}>
            <div className="flex items-center gap-2">
              {notification.type === "success" ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              <span>{notification.message}</span>
            </div>
          </div>
        )}

        {/* Recently Mined Block Proof Alert */}
        {sealedBlock && (
          <div className="mt-4 rounded-2xl border border-emerald-500/40 bg-emerald-950/30 p-4 space-y-2 animate-fade-in">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-300">
              <span className="flex items-center gap-1.5">
                <Lock className="h-4 w-4 text-emerald-400" />
                <span>Block #{sealedBlock.blockHeight} Mined &amp; Linked to Immutable Ledger</span>
              </span>
              <span className="text-[10px] font-mono text-zinc-400">{sealedBlock.timestamp}</span>
            </div>
            <div className="bg-black/70 rounded-xl p-3 border border-white/10 space-y-1 font-mono text-xs">
              <div className="flex items-center justify-between text-zinc-400 text-[11px]">
                <span>Block Hash:</span>
                <span className="text-emerald-400 font-bold truncate max-w-md">{sealedBlock.blockHash}</span>
              </div>
              <div className="flex items-center justify-between text-zinc-500 text-[10px]">
                <span>Merkle Root:</span>
                <span className="text-zinc-300 truncate max-w-md">{sealedBlock.merkleRoot}</span>
              </div>
            </div>
          </div>
        )}

        {/* ── Collection Form Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Left Column: Sample Metrics & Barcodes */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
              <Scale className="h-4 w-4 text-blue-400" />
              <span>1. Physical Specimen Metrics &amp; Barcode Kit</span>
            </h3>

            {/* A & B Barcodes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3.5 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">
                    Bottle A (Primary 60 mL)
                  </span>
                  <span className="text-[10px] font-mono text-gray-400">Min: 60 mL</span>
                </div>
                <div className="flex items-center gap-2">
                  <Barcode className="h-5 w-5 text-emerald-400" />
                  <input
                    type="text"
                    value={aBarcode}
                    onChange={(e) => setABarcode(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 rounded-lg px-2.5 py-1 text-xs font-mono font-bold text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="rounded-xl border border-blue-500/30 bg-blue-950/20 p-3.5 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-blue-400">
                    Bottle B (Reserve 30 mL)
                  </span>
                  <span className="text-[10px] font-mono text-gray-400">Min: 30 mL</span>
                </div>
                <div className="flex items-center gap-2">
                  <Barcode className="h-5 w-5 text-blue-400" />
                  <input
                    type="text"
                    value={bBarcode}
                    onChange={(e) => setBBarcode(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 rounded-lg px-2.5 py-1 text-xs font-mono font-bold text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Volume & Specific Gravity Sliders */}
            <div className="space-y-3">
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3.5">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-300">
                    Total Urine Sample Volume (mL)
                  </span>
                  <span className={`text-xs font-mono font-bold ${isValidVolume ? "text-emerald-400" : "text-red-400"}`}>
                    {sampleVolume} mL {isValidVolume ? "✓ WADA Compliant" : "⚠️ Partial (<90mL)"}
                  </span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="180"
                  step="5"
                  value={sampleVolume}
                  onChange={(e) => setSampleVolume(Number(e.target.value))}
                  className="w-full accent-blue-500 cursor-pointer"
                />
              </div>

              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3.5">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-300">
                    Specific Gravity (Refractometer)
                  </span>
                  <span className={`text-xs font-mono font-bold ${isValidSg ? "text-emerald-400" : "text-amber-400"}`}>
                    {specificGravity.toFixed(3)} {isValidSg ? "✓ Valid Concentration" : "⚠️ Dilute (<1.005)"}
                  </span>
                </div>
                <input
                  type="range"
                  min="1.000"
                  max="1.035"
                  step="0.001"
                  value={specificGravity}
                  onChange={(e) => setSpecificGravity(Number(e.target.value))}
                  className="w-full accent-blue-500 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Athlete Info, Digital Signatures & Consent */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
              <UserCheck className="h-4 w-4 text-emerald-400" />
              <span>2. Athlete Legal Consent &amp; Tripartite Digital Signatures</span>
            </h3>

            {/* Athlete & DCO Inputs */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-gray-400 mb-1">
                  Tested Athlete Name
                </label>
                <input
                  type="text"
                  value={athleteName}
                  onChange={(e) => setAthleteName(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-gray-400 mb-1">
                  Supervising DCO Name &amp; License
                </label>
                <input
                  type="text"
                  value={dcoName}
                  onChange={(e) => setDcoName(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Declared Medication */}
            <div>
              <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-gray-400 mb-1">
                Declared Medications &amp; TUE (Past 7 Days)
              </label>
              <textarea
                rows={2}
                value={declaration}
                onChange={(e) => setDeclaration(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] p-2.5 text-xs text-white focus:border-blue-500 focus:outline-none placeholder-gray-600"
              />
            </div>

            {/* ── WADA Mandatory Athlete Legal Consent Checklist ── */}
            <div className="rounded-xl border border-white/10 bg-black/60 p-3.5 space-y-2">
              <div className="text-[10px] font-black uppercase tracking-wider text-emerald-400 flex items-center justify-between">
                <span>WADA ISTI Article 5.4 Mandatory Consent Checkmarks</span>
                <span className="text-[9px] text-zinc-400 font-mono">4 / 4 Required</span>
              </div>

              <div className="space-y-1.5 text-xs text-zinc-300">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consentWitnessed}
                    onChange={(e) => setConsentWitnessed(e.target.checked)}
                    className="mt-0.5 accent-emerald-500 h-3.5 w-3.5"
                  />
                  <span className="text-[11px] leading-tight">
                    Sample provision was conducted under direct uninterrupted visual observation by the DCO/chaperone.
                  </span>
                </label>

                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consentBottlesChosen}
                    onChange={(e) => setConsentBottlesChosen(e.target.checked)}
                    className="mt-0.5 accent-emerald-500 h-3.5 w-3.5"
                  />
                  <span className="text-[11px] leading-tight">
                    Athlete personally chose the sealed collection vessel and A/B bottle kit from multiple options.
                  </span>
                </label>

                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consentBarcodesMatch}
                    onChange={(e) => setConsentBarcodesMatch(e.target.checked)}
                    className="mt-0.5 accent-emerald-500 h-3.5 w-3.5"
                  />
                  <span className="text-[11px] leading-tight">
                    Barcodes on Bottle A, Bottle B, and the DCF slip match exactly and have been verified by the athlete.
                  </span>
                </label>

                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consentNoTampering}
                    onChange={(e) => setConsentNoTampering(e.target.checked)}
                    className="mt-0.5 accent-emerald-500 h-3.5 w-3.5"
                  />
                  <span className="text-[11px] leading-tight">
                    Tamper-evident red seal caps were closed and clicked in athlete presence with no irregularities.
                  </span>
                </label>
              </div>
            </div>

            {/* Digital Signature Fingerprints */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 mb-1">
                  Athlete Digital Signature
                </label>
                <input
                  type="text"
                  value={athleteSignatureText}
                  onChange={(e) => setAthleteSignatureText(e.target.value)}
                  className="w-full rounded-xl border border-emerald-500/30 bg-emerald-950/20 px-3 py-1.5 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-blue-400 mb-1">
                  DCO PKI Signature Token
                </label>
                <input
                  type="text"
                  value={dcoSignatureText}
                  onChange={(e) => setDcoSignatureText(e.target.value)}
                  className="w-full rounded-xl border border-blue-500/30 bg-blue-950/20 px-3 py-1.5 text-xs text-white focus:outline-none"
                />
              </div>
            </div>

            {/* Submit Action */}
            <button
              onClick={handleSealAndSubmit}
              disabled={isSubmitting || !isValidVolume || !isValidSg || !allConsentGiven}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 py-3 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-emerald-500/20 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer transition-all"
            >
              <Lock className="h-4 w-4" />
              <span>{isSubmitting ? "Mining Blockchain Block..." : "Seal A/B Bottles & Mine Blockchain Block"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Recent Chain of Custody Dispatches ── */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold uppercase tracking-tight text-white flex items-center gap-2">
          <Clock className="h-5 w-5 text-blue-400" />
          <span>Active Chain of Custody Security Ledger ({records.length} Batches)</span>
        </h3>

        <div className="space-y-3">
          {records.map((rec) => (
            <div
              key={rec.id}
              className="rounded-2xl border border-white/10 bg-zinc-950 p-4 hover:border-blue-500/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-blue-400 bg-blue-950/60 border border-blue-500/30 px-2 py-0.5 rounded">
                    {rec.testCode}
                  </span>
                  <span className="text-xs font-mono text-gray-500">
                    {rec.collectionDate} • {rec.collectionTime}
                  </span>
                </div>
                <h4 className="text-sm font-bold uppercase text-white">
                  {rec.athleteName}
                </h4>
                <p className="text-xs text-gray-400">
                  {rec.meetTitle}
                </p>
                <p className="text-[11px] text-gray-500 italic truncate max-w-xl">
                  Declaration: {rec.athleteDeclaration}
                </p>
              </div>

              <div className="flex flex-col md:items-end gap-2 shrink-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] text-emerald-400 bg-emerald-950/40 border border-emerald-500/20 px-2 py-0.5 rounded">
                    {rec.aSampleBarcode}
                  </span>
                  <span className="font-mono text-[11px] text-blue-400 bg-blue-950/40 border border-blue-500/20 px-2 py-0.5 rounded">
                    {rec.bSampleBarcode}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="text-gray-400 font-mono">{rec.sampleVolumeMl} mL • SG {rec.specificGravity.toFixed(3)}</span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300 uppercase">
                    <CheckCircle2 className="h-3 w-3" />
                    {rec.status.replace(/_/g, " ")}
                  </span>
                  <button
                    onClick={() => openDcf(rec)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-blue-500/30 bg-blue-950/40 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-blue-300 hover:bg-blue-900/50 transition-all cursor-pointer"
                  >
                    <FileCheck2 className="h-3.5 w-3.5 text-blue-400" />
                    <span>View DCF Manifest</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Official Printable 1-Page A4 DCF Modal ── */}
      <DopingControlFormModal
        isOpen={isDcfOpen}
        onClose={() => setIsDcfOpen(false)}
        record={selectedRecordForDcf}
      />
    </div>
  );
}
