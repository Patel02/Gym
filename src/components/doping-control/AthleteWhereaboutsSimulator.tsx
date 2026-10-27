"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  MapPin, 
  Calendar, 
  Clock, 
  ShieldAlert, 
  CheckCircle2, 
  AlertOctagon, 
  Send, 
  Printer, 
  Building2, 
  Home, 
  PhoneCall,
  Sparkles,
  FileText
} from "lucide-react";
import { submitWhereaboutsFilingAction } from "@/actions/doping-control.actions";
import AdamsWhereaboutsDossierModal, { WhereaboutsDossierData } from "./AdamsWhereaboutsDossierModal";

export default function AthleteWhereaboutsSimulator() {
  const [athleteName, setAthleteName] = useState("Patel Rakesh");
  const [fedId, setFedId] = useState("FED-2026-8849");
  const [quarter, setQuarter] = useState("Q4 2026 (Oct 1 - Dec 31)");
  const [slotTime, setSlotTime] = useState("06:00 AM - 07:00 AM");
  const [residence, setResidence] = useState("Flat 402, Shivam Enclave, Andheri West, Mumbai, Maharashtra 400053");
  const [trainingGym, setTrainingGym] = useState("A&T High-Performance Barbell Academy, Bandra East, Mumbai");
  const [phone, setPhone] = useState("+91 98765 43210");
  const [notes, setNotes] = useState("Training Monday through Saturday 05:00 PM - 08:00 PM. Rest day Sunday.");
  
  const [submitting, setSubmitting] = useState(false);
  const [adamsReceipt, setAdamsReceipt] = useState<string | null>(null);
  const [isDossierModalOpen, setIsDossierModalOpen] = useState<boolean>(false);
  const [dossierData, setDossierData] = useState<WhereaboutsDossierData | null>(null);

  const handleOpenDossier = (receipt?: string) => {
    const data: WhereaboutsDossierData = {
      athleteName,
      athleteFederationId: fedId,
      quarter,
      dailySlotTime: slotTime,
      residentialAddress: residence,
      trainingGymAddress: trainingGym,
      emergencyContactPhone: phone,
      competitionCalendarNotes: notes,
      adamsReceiptNumber: receipt || adamsReceipt || "ADAMS-IND-2026-884912",
      filingTimestamp: new Date().toISOString(),
    };
    setDossierData(data);
    setIsDossierModalOpen(true);
  };

  const handleSubmitWhereabouts = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await submitWhereaboutsFilingAction({
        athleteName,
        athleteFederationId: fedId,
        quarter,
        dailySlotTime: slotTime,
        residentialAddress: residence,
        trainingGymAddress: trainingGym,
        emergencyContactPhone: phone,
        competitionCalendarNotes: notes,
      });

      if (res.success && res.adamsReceiptNumber) {
        setAdamsReceipt(res.adamsReceiptNumber);
        handleOpenDossier(res.adamsReceiptNumber);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="space-y-8">
      {/* ── Top Header ── */}
      <div className="rounded-2xl border border-purple-500/30 bg-gradient-to-br from-purple-950/40 via-black/80 to-black p-6 shadow-[0_0_40px_rgba(168,85,247,0.1)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-purple-500/20 pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-purple-400">
              <MapPin className="h-4 w-4" />
              <span>WADA ADAMS System • Registered Testing Pool (RTP)</span>
            </div>
            <h2 className="text-2xl font-bold uppercase tracking-tight text-white mt-1">
              Athlete Whereabouts Quarterly Filing Simulator
            </h2>
            <p className="text-sm text-gray-400 mt-0.5">
              Mandatory 60-minute daily testing window filing for out-of-competition unannounced doping control.
            </p>
          </div>

          <button
            onClick={() => handleOpenDossier()}
            className="flex items-center gap-2 self-start md:self-auto rounded-xl border border-purple-500/40 bg-purple-500/20 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-purple-300 hover:bg-purple-500/30 transition-all cursor-pointer shadow-md"
          >
            <Printer className="h-4 w-4 text-purple-400" />
            <span>Print ADAMS Dossier (1-Page A4)</span>
          </button>
        </div>

        {/* ── 3-Strike Rule Banner ── */}
        <div className="mt-5 rounded-xl border border-red-500/30 bg-red-950/20 p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <AlertOctagon className="h-5 w-5 text-red-400 shrink-0" />
            <div>
              <span className="text-xs font-bold uppercase tracking-wide text-red-300 block">
                Strict Liability: The 3-Strike Rule (WADA Code Article 2.4)
              </span>
              <p className="text-[11px] text-gray-400">
                Any combination of 3 missed tests or filing failures within a rolling 12-month period constitutes an Anti-Doping Rule Violation (ADRV) resulting in a 2-Year Ineligibility Ban.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 self-end md:self-auto shrink-0 font-mono text-xs">
            <span className="rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 px-2 py-0.5">Strike 1: None</span>
            <span className="rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 px-2 py-0.5">Strike 2: None</span>
            <span className="rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 px-2 py-0.5">Strike 3: None</span>
          </div>
        </div>

        {/* ── Form ── */}
        <form onSubmit={handleSubmitWhereabouts} className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Athlete Info */}
          <div>
            <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-gray-400 mb-1">
              Registered Athlete Full Name
            </label>
            <input
              type="text"
              value={athleteName}
              onChange={(e) => setAthleteName(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-xs text-white focus:border-purple-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-gray-400 mb-1">
              Federation Athlete ID
            </label>
            <input
              type="text"
              value={fedId}
              onChange={(e) => setFedId(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-xs text-white focus:border-purple-500 focus:outline-none"
              required
            />
          </div>

          {/* Filing Quarter & 60-Min Slot */}
          <div>
            <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-gray-400 mb-1">
              Filing Quarter
            </label>
            <select
              value={quarter}
              onChange={(e) => setQuarter(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-xs text-white focus:border-purple-500 focus:outline-none"
            >
              <option value="Q4 2026 (Oct 1 - Dec 31)" className="bg-zinc-950 text-white">Q4 2026 (Oct 1 - Dec 31)</option>
              <option value="Q1 2027 (Jan 1 - Mar 31)" className="bg-zinc-950 text-white">Q1 2027 (Jan 1 - Mar 31)</option>
              <option value="Q2 2027 (Apr 1 - Jun 30)" className="bg-zinc-950 text-white">Q2 2027 (Apr 1 - Jun 30)</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-purple-400 mb-1 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>Mandatory 60-Minute Daily Testing Slot (05:00 AM - 11:00 PM)</span>
            </label>
            <select
              value={slotTime}
              onChange={(e) => setSlotTime(e.target.value)}
              className="w-full rounded-xl border border-purple-500/40 bg-purple-950/20 px-3.5 py-2.5 text-xs font-bold text-white focus:border-purple-500 focus:outline-none"
            >
              <option value="05:00 AM - 06:00 AM" className="bg-zinc-950 text-white">05:00 AM - 06:00 AM (Early Rise)</option>
              <option value="06:00 AM - 07:00 AM" className="bg-zinc-950 text-white">06:00 AM - 07:00 AM (Standard Residential)</option>
              <option value="07:00 AM - 08:00 AM" className="bg-zinc-950 text-white">07:00 AM - 08:00 AM</option>
              <option value="09:00 PM - 10:00 PM" className="bg-zinc-950 text-white">09:00 PM - 10:00 PM (Evening Slot)</option>
            </select>
          </div>

          {/* Residence & Gym */}
          <div>
            <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-gray-400 mb-1 flex items-center gap-1">
              <Home className="h-3 w-3 text-purple-400" />
              <span>Primary Residential Accommodation</span>
            </label>
            <input
              type="text"
              value={residence}
              onChange={(e) => setResidence(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-xs text-white focus:border-purple-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-gray-400 mb-1 flex items-center gap-1">
              <Building2 className="h-3 w-3 text-purple-400" />
              <span>Primary Training Gym Facility</span>
            </label>
            <input
              type="text"
              value={trainingGym}
              onChange={(e) => setTrainingGym(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-xs text-white focus:border-purple-500 focus:outline-none"
              required
            />
          </div>

          {/* Emergency Phone & Notes */}
          <div>
            <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-gray-400 mb-1 flex items-center gap-1">
              <PhoneCall className="h-3 w-3 text-purple-400" />
              <span>Emergency Mobile (Available during 60-min window)</span>
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-xs text-white focus:border-purple-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-gray-400 mb-1">
              Training Schedule & Competition Calendar Notes
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-xs text-white focus:border-purple-500 focus:outline-none"
            />
          </div>

          {/* Submit Action */}
          <div className="col-span-full pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-gray-400">
              By filing, the athlete consents to unannounced out-of-competition testing 365 days a year.
            </span>

            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-purple-500/25 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 cursor-pointer transition-all"
            >
              <Send className="h-4 w-4" />
              <span>{submitting ? "Submitting to ADAMS..." : "Submit Quarterly Whereabouts Filing"}</span>
            </button>
          </div>
        </form>

        {/* ── ADAMS Filing Confirmation Card ── */}
        {adamsReceipt && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 rounded-2xl border border-emerald-500/40 bg-emerald-950/30 p-5 text-xs space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-300 flex items-center gap-1.5 uppercase tracking-wider">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                ADAMS Whereabouts Receipt Issued
              </span>
              <span className="font-mono text-emerald-400 font-bold bg-emerald-900/60 border border-emerald-500/30 px-2 py-0.5 rounded">
                {adamsReceipt}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2 border-t border-emerald-500/20">
              <p className="text-gray-300">
                Quarterly filing confirmed for <strong>{athleteName}</strong> ({fedId}). 60-Minute daily inspection window recorded as <strong>{slotTime}</strong> at <em>{residence}</em>.
              </p>
              <button
                type="button"
                onClick={() => handleOpenDossier()}
                className="inline-flex items-center gap-1.5 rounded-xl bg-purple-600 px-3.5 py-1.5 text-xs font-bold uppercase text-white hover:bg-purple-500 transition-all cursor-pointer shrink-0 shadow"
              >
                <FileText className="h-3.5 w-3.5" />
                <span>View &amp; Print Dossier (1-Page)</span>
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* ── Official Printable 1-Page A4 ADAMS Dossier Modal ── */}
      <AdamsWhereaboutsDossierModal
        isOpen={isDossierModalOpen}
        onClose={() => setIsDossierModalOpen(false)}
        data={dossierData}
      />
    </div>
  );
}
