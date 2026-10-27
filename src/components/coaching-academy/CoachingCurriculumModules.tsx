"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BookOpen, 
  Clock, 
  GraduationCap, 
  CheckCircle2, 
  ChevronDown, 
  Sparkles, 
  Award, 
  Quote,
  FileText
} from "lucide-react";
import { ACADEMY_CURRICULUM, AcademyModule } from "@/data/coaching-academy-data";

export default function CoachingCurriculumModules() {
  const [activeLevel, setActiveLevel] = useState<"ALL" | "LEVEL_1" | "LEVEL_2">("ALL");
  const [expandedModuleId, setExpandedModuleId] = useState<string | null>("mod-01");

  const filteredModules = ACADEMY_CURRICULUM.filter(
    (m) => activeLevel === "ALL" || m.level === activeLevel
  );

  return (
    <div className="space-y-6">
      {/* ── Top Header & Filter ── */}
      <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-950/40 via-black/80 to-black p-6 shadow-[0_0_40px_rgba(245,158,11,0.1)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-amber-500/20 pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-amber-400">
              <BookOpen className="h-4 w-4" />
              <span>Official Accreditation Syllabus</span>
            </div>
            <h2 className="text-2xl font-bold uppercase tracking-tight text-white mt-1">
              National Strength Coaching Curriculum
            </h2>
            <p className="text-sm text-gray-400 mt-0.5">
              8 comprehensive academic modules spanning platform biomechanics, periodization, flight tactics, and anti-doping regulations.
            </p>
          </div>

          {/* Level Filter Pills */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveLevel("ALL")}
              className={`rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeLevel === "ALL"
                  ? "bg-amber-500 text-zinc-950 font-black shadow-md shadow-amber-500/30"
                  : "border border-white/10 bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
              }`}
            >
              All Modules (8)
            </button>
            <button
              onClick={() => setActiveLevel("LEVEL_1")}
              className={`rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeLevel === "LEVEL_1"
                  ? "bg-amber-500 text-zinc-950 font-black shadow-md shadow-amber-500/30"
                  : "border border-white/10 bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
              }`}
            >
              Level 1: Club Coach (4)
            </button>
            <button
              onClick={() => setActiveLevel("LEVEL_2")}
              className={`rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeLevel === "LEVEL_2"
                  ? "bg-amber-500 text-zinc-950 font-black shadow-md shadow-amber-500/30"
                  : "border border-white/10 bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
              }`}
            >
              Level 2: High-Performance (4)
            </button>
          </div>
        </div>
      </div>

      {/* ── Curriculum Modules List ── */}
      <div className="space-y-4">
        {filteredModules.map((module) => {
          const isExpanded = expandedModuleId === module.id;
          return (
            <motion.div
              key={module.id}
              className={`rounded-2xl border transition-all overflow-hidden ${
                isExpanded
                  ? "border-amber-500/50 bg-gradient-to-b from-zinc-900 to-zinc-950 shadow-xl"
                  : "border-white/10 bg-zinc-950 hover:border-amber-500/30"
              }`}
            >
              {/* Accordion Bar Header */}
              <div
                onClick={() => setExpandedModuleId(isExpanded ? null : module.id)}
                className="p-5 sm:p-6 flex items-center justify-between gap-4 cursor-pointer select-none"
              >
                <div className="flex items-start sm:items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-300 font-mono font-bold text-lg">
                    0{module.moduleNumber}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        module.level === "LEVEL_1"
                          ? "bg-blue-950/60 border border-blue-500/30 text-blue-300"
                          : "bg-purple-950/60 border border-purple-500/30 text-purple-300"
                      }`}>
                        {module.level === "LEVEL_1" ? "Level 1 • Club Coach" : "Level 2 • High-Performance"}
                      </span>
                      <span className="text-xs text-gray-400 flex items-center gap-1 font-mono">
                        <Clock className="h-3 w-3 text-amber-400" />
                        {module.duration}
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold uppercase text-white tracking-wide mt-1">
                      {module.title}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform duration-300 ${
                    isExpanded ? "rotate-180 text-amber-400" : ""
                  }`} />
                </div>
              </div>

              {/* Accordion Body Details */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border-t border-white/10 p-6 sm:p-8 space-y-6 text-xs bg-black/40"
                  >
                    {/* Summary */}
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300 mb-1.5 font-mono">
                        Module Overview
                      </h4>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        {module.summary}
                      </p>
                    </div>

                    {/* Learning Outcomes */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/10">
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2 font-mono flex items-center gap-1.5">
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Core Learning Competencies</span>
                        </h4>
                        <ul className="space-y-2">
                          {module.learningOutcomes.map((outcome, idx) => (
                            <li key={idx} className="text-gray-300 flex items-start gap-2 leading-relaxed">
                              <span className="text-emerald-400 font-bold">•</span>
                              <span>{outcome}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Coaching Cues by Akash & Tanvi */}
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-2 font-mono flex items-center gap-1.5">
                          <Quote className="h-4 w-4" />
                          <span>Signature Platform Cues by Akash & Tanvi</span>
                        </h4>
                        <div className="space-y-2">
                          {module.coachingCues.map((cue, idx) => (
                            <div
                              key={idx}
                              className="rounded-xl border border-amber-500/20 bg-amber-950/20 p-2.5 text-amber-200/90 italic"
                            >
                              {cue}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Tutors & Reading Material */}
                    <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-gray-400">
                      <div>
                        <span className="text-[10px] font-mono uppercase block text-gray-500">Curriculum Tutors</span>
                        <span className="font-semibold text-white">{module.tutors.join(", ")}</span>
                      </div>

                      <div>
                        <span className="text-[10px] font-mono uppercase block text-gray-500">Required Reading</span>
                        <span className="font-mono text-[11px] text-amber-300">{module.readingMaterial}</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
