"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Pill, 
  AlertTriangle, 
  ShieldAlert, 
  Clock, 
  Info, 
  Sparkles, 
  CheckCircle2, 
  XCircle,
  ExternalLink,
  ChevronRight,
  Filter
} from "lucide-react";
import { WADA_PROHIBITED_SUBSTANCES, ProhibitedSubstance } from "@/data/doping-control-data";

export default function ProhibitedSubstanceChecker() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [selectedSubstance, setSelectedSubstance] = useState<ProhibitedSubstance | null>(null);

  const categories = [
    { code: "ALL", label: "All Classes (19+)" },
    { code: "S1", label: "S1. Anabolic Steroids" },
    { code: "S2", label: "S2. Peptide Hormones" },
    { code: "S3", label: "S3. Beta-2 Agonists" },
    { code: "S4", label: "S4. SARMs & Modulators" },
    { code: "S5", label: "S5. Diuretics & Masking" },
    { code: "S6", label: "S6. Stimulants" },
  ];

  const filteredSubstances = WADA_PROHIBITED_SUBSTANCES.filter((sub) => {
    const matchesCategory = activeCategory === "ALL" || sub.categoryCode === activeCategory;
    const query = searchQuery.toLowerCase().trim();
    if (!query) return matchesCategory;

    const matchesName = sub.name.toLowerCase().includes(query);
    const matchesChem = sub.chemicalName.toLowerCase().includes(query);
    const matchesBrand = sub.brandNames.some((b) => b.toLowerCase().includes(query));
    const matchesClass = sub.categoryName.toLowerCase().includes(query);

    return matchesCategory && (matchesName || matchesChem || matchesBrand || matchesClass);
  });

  return (
    <div className="space-y-6">
      {/* ── Search & Header Bar ── */}
      <div className="rounded-2xl border border-red-500/30 bg-gradient-to-br from-red-950/40 via-black/80 to-black p-6 shadow-[0_0_40px_rgba(239,68,68,0.1)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-red-500/20 pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-red-400">
              <ShieldAlert className="h-4 w-4" />
              <span>Official WADA Prohibited List 2026 Database</span>
            </div>
            <h2 className="text-2xl font-bold uppercase tracking-tight text-white mt-1">
              Prohibited Substance & Supplement Ingredient Checker
            </h2>
            <p className="text-sm text-gray-400 mt-0.5">
              Verify chemical compounds, OTC medications, detection windows, and strict liability penalty sanctions.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3.5 py-1.5 text-xs font-bold text-red-300">
            <span>Strict Liability Mandate</span>
          </div>
        </div>

        {/* ── Search Input ── */}
        <div className="mt-6 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by substance (e.g. Clenbuterol, Nandrolone, Ostarine, DMAA, Arimidex, Lasix)..."
            className="w-full rounded-xl border border-white/15 bg-white/[0.05] pl-12 pr-4 py-3.5 text-sm text-white focus:border-red-500 focus:outline-none placeholder-gray-500 shadow-inner"
          />
        </div>

        {/* ── Category Filter Pills ── */}
        <div className="mt-4 flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.code}
              onClick={() => setActiveCategory(cat.code)}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeCategory === cat.code
                  ? "bg-red-600 text-white shadow-md shadow-red-600/30"
                  : "border border-white/10 bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Substance Cards Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSubstances.map((sub) => (
          <motion.div
            key={sub.id}
            whileHover={{ y: -3 }}
            onClick={() => setSelectedSubstance(sub)}
            className="rounded-2xl border border-white/10 bg-zinc-950 p-5 hover:border-red-500/40 transition-all cursor-pointer flex flex-col justify-between group shadow-lg"
          >
            <div>
              {/* Header Badge */}
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <span className="font-mono text-xs font-bold text-red-400 bg-red-950/60 border border-red-500/30 px-2 py-0.5 rounded">
                  {sub.categoryCode}
                </span>

                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                  sub.prohibitedWhen === "AT_ALL_TIMES"
                    ? "border-red-500/40 bg-red-500/15 text-red-300"
                    : "border-amber-500/40 bg-amber-500/15 text-amber-300"
                }`}>
                  {sub.prohibitedWhen === "AT_ALL_TIMES" ? "Prohibited At All Times" : "In-Competition Only"}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-base font-bold uppercase text-white group-hover:text-red-400 transition-colors">
                {sub.name}
              </h3>
              <p className="text-xs text-gray-400 mt-0.5 font-mono">
                {sub.categoryName}
              </p>

              {/* Known Brands */}
              <div className="mt-3 flex flex-wrap gap-1">
                {sub.brandNames.map((b, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] bg-white/5 border border-white/10 text-gray-300 px-1.5 py-0.5 rounded"
                  >
                    {b}
                  </span>
                ))}
              </div>

              {/* Detection Window */}
              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                <span className="text-gray-500 flex items-center gap-1">
                  <Clock className="h-3 w-3 text-red-400" />
                  <span>Detection Window:</span>
                </span>
                <span className="font-bold text-white text-right truncate max-w-[150px]">
                  {sub.typicalDetectionWindow.split("(")[0]}
                </span>
              </div>
            </div>

            {/* Bottom Card Footer */}
            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-gray-400 group-hover:text-red-400">
              <span className="text-[11px] font-semibold">{sub.standardSanction}</span>
              <ChevronRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
            </div>
          </motion.div>
        ))}

        {filteredSubstances.length === 0 && (
          <div className="col-span-full rounded-2xl border border-white/10 bg-zinc-950 p-12 text-center text-gray-400">
            <AlertTriangle className="h-8 w-8 text-amber-400 mx-auto mb-2" />
            <p className="text-sm font-semibold">No prohibited substances matched your search.</p>
            <p className="text-xs text-gray-500 mt-1">Try searching by category or generic chemical name.</p>
          </div>
        )}
      </div>

      {/* ── Detailed Substance Modal ── */}
      <AnimatePresence>
        {selectedSubstance && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-2xl rounded-3xl border border-red-500/40 bg-zinc-950 p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedSubstance(null)}
                className="absolute top-5 right-5 text-gray-400 hover:text-white text-lg"
              >
                ✕
              </button>

              {/* Modal Header */}
              <div className="flex items-center gap-2 mb-2">
                <span className="font-mono text-xs font-bold text-red-400 bg-red-950/60 border border-red-500/30 px-2 py-0.5 rounded">
                  WADA Class {selectedSubstance.categoryCode}
                </span>
                <span className="text-xs text-gray-400">
                  {selectedSubstance.categoryName}
                </span>
              </div>

              <h2 className="text-2xl font-bold uppercase tracking-tight text-white">
                {selectedSubstance.name}
              </h2>
              <p className="text-xs font-mono text-gray-400 mt-1">
                Chemical: {selectedSubstance.chemicalName}
              </p>

              {/* Spec Matrix Table */}
              <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] divide-y divide-white/10 text-xs">
                <div className="grid grid-cols-3 p-3">
                  <span className="text-gray-400 font-semibold">Ban Status</span>
                  <span className="col-span-2 text-red-400 font-bold">
                    {selectedSubstance.prohibitedWhen === "AT_ALL_TIMES" ? "STRICTLY PROHIBITED AT ALL TIMES (In & Out of Competition)" : "PROHIBITED IN-COMPETITION ONLY"}
                  </span>
                </div>

                <div className="grid grid-cols-3 p-3">
                  <span className="text-gray-400 font-semibold">Standard Sanction</span>
                  <span className="col-span-2 text-white font-bold">
                    {selectedSubstance.standardSanction}
                  </span>
                </div>

                <div className="grid grid-cols-3 p-3">
                  <span className="text-gray-400 font-semibold">Detection Window</span>
                  <span className="col-span-2 text-amber-300 font-mono">
                    {selectedSubstance.typicalDetectionWindow}
                  </span>
                </div>

                <div className="grid grid-cols-3 p-3">
                  <span className="text-gray-400 font-semibold">Biological Half-Life</span>
                  <span className="col-span-2 text-gray-200 font-mono">
                    {selectedSubstance.biologicalHalfLife}
                  </span>
                </div>

                <div className="grid grid-cols-3 p-3">
                  <span className="text-gray-400 font-semibold">TUE Eligibility</span>
                  <span className="col-span-2 font-semibold">
                    {selectedSubstance.tueEligible ? (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Eligible with certified medical dossier
                      </span>
                    ) : (
                      <span className="text-red-400 flex items-center gap-1">
                        <XCircle className="h-3.5 w-3.5" /> Zero TUE approval (Non-clinical substance)
                      </span>
                    )}
                  </span>
                </div>
              </div>

              {/* Explanations */}
              <div className="mt-5 space-y-3 text-xs">
                <div>
                  <h4 className="font-bold text-gray-300 uppercase tracking-wider">
                    Common Misuse Mechanism in Powerlifting
                  </h4>
                  <p className="text-gray-400 mt-1 leading-relaxed">
                    {selectedSubstance.commonMisuseReason}
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-red-400 uppercase tracking-wider">
                    Severe Biological & Health Risks
                  </h4>
                  <p className="text-gray-400 mt-1 leading-relaxed">
                    {selectedSubstance.primaryRiskAndSideEffects}
                  </p>
                </div>

                <div className="rounded-xl border border-red-500/20 bg-red-950/20 p-3 text-[11px] text-gray-300">
                  <span className="font-bold text-red-300 block mb-0.5">WADA Analytical Laboratory Directive:</span>
                  {selectedSubstance.wadaClassDescription}
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setSelectedSubstance(null)}
                  className="rounded-xl bg-white/10 px-5 py-2 text-xs font-bold uppercase text-white hover:bg-white/20 transition-colors"
                >
                  Close Specification
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
