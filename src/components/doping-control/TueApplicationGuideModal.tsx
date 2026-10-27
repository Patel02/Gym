"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileCheck2, 
  Stethoscope, 
  AlertCircle, 
  CheckCircle2, 
  Printer, 
  Download, 
  HelpCircle,
  ShieldCheck,
  ClipboardList
} from "lucide-react";

export default function TueApplicationGuideModal() {
  const [isOpen, setIsOpen] = useState(false);

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-amber-300 hover:bg-amber-500/20 transition-all cursor-pointer shadow-sm"
      >
        <Stethoscope className="h-4 w-4" />
        <span>Therapeutic Use Exemption (TUE) Guide</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-3xl rounded-3xl border border-amber-500/40 bg-zinc-950 p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              {/* Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-5 right-5 text-gray-400 hover:text-white text-lg cursor-pointer"
              >
                ✕
              </button>

              {/* Header */}
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-amber-400 mb-1">
                <ShieldCheck className="h-4 w-4" />
                <span>NADA / WADA Medical Commission</span>
              </div>
              <h2 className="text-2xl font-bold uppercase tracking-tight text-white">
                Therapeutic Use Exemption (TUE) Protocol
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                Strict compliance guidelines under the International Standard for Therapeutic Use Exemptions (ISTUE Article 4.2).
              </p>

              {/* 4 Mandatory Criteria */}
              <div className="mt-6 space-y-3 text-xs">
                <h3 className="font-bold uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
                  <ClipboardList className="h-4 w-4 text-amber-400" />
                  <span>The 4 Mandatory Legal Criteria for TUE Approval</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3.5 space-y-1">
                    <span className="text-amber-400 font-bold font-mono">Criterion 1: Health Necessity</span>
                    <p className="text-gray-400 text-[11px] leading-relaxed">
                      The athlete would experience significant impairment to health if the prohibited substance or method were to be withheld during competition.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3.5 space-y-1">
                    <span className="text-amber-400 font-bold font-mono">Criterion 2: No Performance Enhancement</span>
                    <p className="text-gray-400 text-[11px] leading-relaxed">
                      Therapeutic use will not produce any enhancement of performance other than the anticipated return to normal state of health.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3.5 space-y-1">
                    <span className="text-amber-400 font-bold font-mono">Criterion 3: No Permitted Alternative</span>
                    <p className="text-gray-400 text-[11px] leading-relaxed">
                      There is no reasonable permitted therapeutic alternative to the use of the prohibited substance or prohibited method.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3.5 space-y-1">
                    <span className="text-amber-400 font-bold font-mono">Criterion 4: Non-Doping Etiology</span>
                    <p className="text-gray-400 text-[11px] leading-relaxed">
                      The necessity for the use of the substance cannot be a consequence, wholly or in part, of prior non-therapeutic use of prohibited substances.
                    </p>
                  </div>
                </div>
              </div>

              {/* Common Scenarios in Powerlifting */}
              <div className="mt-6 space-y-3 text-xs">
                <h3 className="font-bold uppercase tracking-wider text-gray-300">
                  Common Clinical Scenarios in Powerlifting
                </h3>

                <div className="rounded-2xl border border-white/10 bg-white/[0.02] divide-y divide-white/10">
                  <div className="p-3 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-white block">Severe Asthma / Bronchospasm</span>
                      <span className="text-gray-400 text-[11px]">High-dose Salbutamol, Formoterol, or Inhaled Corticosteroids</span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded">
                      Spirometry dossier required
                    </span>
                  </div>

                  <div className="p-3 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-white block">Type 1 Diabetes Mellitus</span>
                      <span className="text-gray-400 text-[11px]">Injectable Insulin (Class S4 Metabolic Modulator)</span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded">
                      HbA1c & endocrinologist letter
                    </span>
                  </div>

                  <div className="p-3 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-white block">Severe Hypogonadism / TRT</span>
                      <span className="text-gray-400 text-[11px]">Testosterone replacement</span>
                    </div>
                    <span className="text-[10px] font-mono text-red-400 bg-red-950/60 border border-red-500/30 px-2 py-0.5 rounded">
                      99% Rejected unless organic pituitary tumor
                    </span>
                  </div>
                </div>
              </div>

              {/* Notice & Footer */}
              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                <span className="text-[11px] text-gray-400">
                  Applications must be submitted at least <strong>30 days</strong> before a national championship.
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrint}
                    className="flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold uppercase text-white hover:bg-white/20 transition-colors"
                  >
                    <Printer className="h-3.5 w-3.5" />
                    <span>Print TUE Checklist</span>
                  </button>

                  <button
                    onClick={() => setIsOpen(false)}
                    className="rounded-xl bg-amber-500 px-5 py-2 text-xs font-bold uppercase text-zinc-950 hover:bg-amber-400 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
