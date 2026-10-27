"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { 
  GraduationCap, 
  BookOpen, 
  Users, 
  Award, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  Flame,
  Stethoscope
} from "lucide-react";
import CoachingCurriculumModules from "./CoachingCurriculumModules";
import CoachingCertificationExam from "./CoachingCertificationExam";
import CertifiedCoachesDirectory from "./CertifiedCoachesDirectory";

export default function CoachingAcademyMaster() {
  const [activeTab, setActiveTab] = useState<"curriculum" | "exam" | "directory" | "faculty">("curriculum");

  const tabs = [
    { id: "curriculum", label: "Accreditation Curriculum", icon: BookOpen, badge: "8 Modules" },
    { id: "exam", label: "Certification Examination", icon: GraduationCap, badge: "80% Pass Mark" },
    { id: "directory", label: "Certified Coaches Roster", icon: Users, badge: "National Registry" },
    { id: "faculty", label: "Master Faculty & Directors", icon: Award, badge: "Akash & Tanvi" },
  ] as const;

  return (
    <div className="space-y-8">
      {/* ── Top Hero ── */}
      <div className="relative rounded-3xl border border-amber-500/30 bg-gradient-to-b from-zinc-900 via-zinc-950 to-black p-6 sm:p-8 lg:p-10 shadow-2xl overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-amber-500/10 blur-[130px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-purple-500/10 blur-[130px] pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-xs font-mono font-bold uppercase tracking-widest text-amber-300">
                <GraduationCap className="h-3.5 w-3.5" />
                IPF & INDIAN POWERLIFTING FEDERATION ACCREDITED ACADEMY
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-mono font-bold uppercase tracking-widest text-gray-300">
                LEVEL 1 & LEVEL 2 LICENSES
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-white">
              National Strength Coaching & <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-500 bg-clip-text text-transparent">
                Technical Clinic Academy
              </span>
            </h1>

            <p className="text-sm sm:text-base text-gray-400 leading-relaxed">
              Official coaching certification authority under National Technical Directors <strong>Coach Akash & Coach Tanvi</strong>. Master platform biomechanics, 1RM peaking math, weigh-in refeed science, and WADA anti-doping strict liability to earn an official ratified coaching license.
            </p>
          </div>

          {/* Quick CTA + Logo */}
          <div className="flex flex-col items-center gap-4 shrink-0">
            {/* Official Logo Emblem */}
            <div className="relative group">
              <div className="absolute -inset-1.5 rounded-full bg-amber-500/25 blur-xl pointer-events-none" />
              <div className="relative h-24 w-24 rounded-full overflow-hidden border-2 border-amber-500/70 shadow-[0_0_40px_rgba(245,158,11,0.35)] bg-black">
                <Image
                  src="/images/wpi-logo-transparent.png"
                  alt="WPI Association of Gujarat"
                  fill
                  className="object-contain"
                />
              </div>
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-widest text-amber-400">
                Official Academy
              </div>
            </div>

            <button
              onClick={() => setActiveTab("exam")}
              className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 px-6 py-3 text-xs sm:text-sm font-bold uppercase tracking-wider text-zinc-950 shadow-lg shadow-amber-500/25 hover:scale-105 active:scale-95 cursor-pointer transition-all"
            >
              <Sparkles className="h-4 w-4" />
              <span>Take Accreditation Exam</span>
              <ChevronRight className="h-4 w-4" />
            </button>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-xs text-gray-400 text-center">
              <span className="text-white font-bold block">License Credential:</span>
              <span className="text-amber-300 font-mono text-[11px] block">CR80 Digital Pass & A4 Diploma</span>
            </div>
          </div>
        </div>

        {/* ── 4 Key Metric Badges ── */}
        <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-3.5">
            <span className="text-gray-500 text-[10px] font-mono uppercase block">Curriculum Depth</span>
            <span className="text-base font-bold text-white mt-0.5 block">8 Academic Modules</span>
            <span className="text-amber-400 text-[11px] font-semibold">82 Total Lab & Lecture Hours</span>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-3.5">
            <span className="text-gray-500 text-[10px] font-mono uppercase block">Examination Standard</span>
            <span className="text-base font-bold text-white mt-0.5 block">80% Pass Mark</span>
            <span className="text-purple-400 text-[11px] font-semibold">10 Rigorous Scenarios</span>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-3.5">
            <span className="text-gray-500 text-[10px] font-mono uppercase block">License Credential</span>
            <span className="text-base font-bold text-white mt-0.5 block">IPF-COACH Code</span>
            <span className="text-emerald-400 text-[11px] font-semibold">Tamper-Proof QR Verified</span>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-3.5">
            <span className="text-gray-500 text-[10px] font-mono uppercase block">National Faculty</span>
            <span className="text-base font-bold text-white mt-0.5 block">Akash & Tanvi</span>
            <span className="text-blue-400 text-[11px] font-semibold">National Technical Directors</span>
          </div>
        </div>
      </div>

      {/* ── Navigation Tabs ── */}
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
                  ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-zinc-950 shadow-lg shadow-amber-500/25 scale-[1.02]"
                  : "border border-white/10 bg-white/[0.03] text-gray-400 hover:bg-white/[0.08] hover:text-white"
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? "text-zinc-950" : "text-amber-400"}`} />
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

      {/* ── Tab Content ── */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {activeTab === "curriculum" && <CoachingCurriculumModules />}
        {activeTab === "exam" && <CoachingCertificationExam />}
        {activeTab === "directory" && <CertifiedCoachesDirectory />}
        {activeTab === "faculty" && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-950/40 via-black/80 to-black p-6 shadow-xl">
              <h2 className="text-2xl font-bold uppercase tracking-tight text-white">
                Master Faculty & Technical Leadership
              </h2>
              <p className="text-sm text-gray-400 mt-1">
                The National Coaching Academy is directed by Coach Akash & Coach Tanvi, certified national technical directors and sports nutritionists.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Coach Akash */}
              <div className="rounded-2xl border border-white/10 bg-zinc-950 p-6 space-y-4 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold text-xl">
                    CA
                  </div>
                  <div>
                    <h3 className="text-xl font-bold uppercase text-white">Coach Akash</h3>
                    <p className="text-xs text-amber-400 font-semibold font-mono">
                      National Technical Director & Head of Platform Biomechanics
                    </p>
                  </div>
                </div>

                <p className="text-xs text-gray-300 leading-relaxed">
                  Elite powerlifter and head coach with over a decade of national championship experience. Specialized in SBD kinematic bar paths, low-bar moment arm optimization, and game-day counter-attempt strategy. Coach to 40+ national podium medalists.
                </p>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                  <span className="text-gray-500 font-mono">Faculty Modules:</span>
                  <span className="text-white font-bold">Modules 1, 2, 3, 5, 7</span>
                </div>
              </div>

              {/* Coach Tanvi */}
              <div className="rounded-2xl border border-white/10 bg-zinc-950 p-6 space-y-4 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-xl">
                    CT
                  </div>
                  <div>
                    <h3 className="text-xl font-bold uppercase text-white">Coach Tanvi</h3>
                    <p className="text-xs text-emerald-400 font-semibold font-mono">
                      High-Performance & Clinical Sports Nutrition Director
                    </p>
                  </div>
                </div>

                <p className="text-xs text-gray-300 leading-relaxed">
                  Certified Sports Nutritionist, clinical dietitian, and national technical coach. Specialized in acute water-cutting protocols, post-weigh-in 120-minute rapid refeed science, and strict liability clean-sport education under the WADA Code.
                </p>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                  <span className="text-gray-500 font-mono">Faculty Modules:</span>
                  <span className="text-white font-bold">Modules 4, 6, 8</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
