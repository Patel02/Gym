"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  ShieldCheck, 
  ChevronRight, 
  AlertOctagon, 
  FileCheck2, 
  HelpCircle, 
  HeartHandshake, 
  Sparkles, 
  CheckCircle2, 
  Lock, 
  PhoneCall,
  Activity,
  Award
} from "lucide-react";
import WhatsAppIcon from "@/components/ui/WhatsAppIcon";
import { PageNavigation } from "@/components/ui/PageNavigation";

const WHATSAPP_PHONE = "917043951377";

const PROHIBITED_CLASSES = [
  { code: "S1", title: "Anabolic Androgenic Steroids", desc: "Testosterone, Nandrolone, Stanozolol, Trenbolone, and all synthetic anabolic derivatives." },
  { code: "S2", title: "Peptide Hormones & Growth Factors", desc: "Human Growth Hormone (hGH), Erythropoietin (EPO), IGF-1, and related releasing factors." },
  { code: "S4", title: "Hormone & Metabolic Modulators", desc: "SARMs (Ostarine, RAD-140, LGD-4033), Aromatase Inhibitors, SERMs, and Clomiphene." },
  { code: "S5", title: "Diuretics & Masking Agents", desc: "Furosemide, Spironolactone, and plasma expanders used to alter urine concentration or weight cut." },
  { code: "S6", title: "Stimulants (In-Competition)", desc: "Amphetamines, Ephedrine (above threshold), DMAA, Methylphenidate, and related stimulants." },
];

export default function AntiDopingPage() {
  const [pledged, setPledged] = useState(false);

  return (
    <div className="min-h-screen bg-gym-black text-white pt-32 sm:pt-36 lg:pt-40 pb-20 relative overflow-hidden">
      
      {/* ── Ambient Background Glows ── */}
      <motion.div 
        animate={{ y: [0, -25, 0], scale: [1, 1.15, 1] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-emerald-500/15 blur-[120px]" 
      />
      <motion.div 
        animate={{ y: [0, 25, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute top-1/2 -right-40 h-96 w-96 rounded-full bg-gym-primary/15 blur-[130px]" 
      />

      <div className="relative mx-auto max-w-7xl px-6 md:px-12">
        
        {/* ── Breadcrumb & Navigation ── */}
        <PageNavigation
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "IPF Rules", href: "/rules" },
            { label: "Anti-Doping & Clean Sport" },
          ]}
          badge="100% NADA & WADA Tested"
          className="mb-8"
        />

        {/* ── Hero ── */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-emerald-400 mb-4 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>NADA & WADA Compliant Platform</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight text-white drop-shadow-xl"
          >
            100% Clean <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(16,185,129,0.5)]">
              Powerlifting Sport
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-4 text-sm sm:text-base md:text-lg text-gray-300 leading-relaxed font-normal"
          >
            Our federation upholds absolute zero tolerance for performance-enhancing drugs. Operating under the World Anti-Doping Agency (WADA) and National Anti-Doping Agency (NADA) codes with strict liability.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mt-6 flex flex-wrap items-center justify-center gap-3"
          >
            <Link
              href="/doping-control"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 px-6 py-3 text-xs sm:text-sm font-bold uppercase tracking-wider text-zinc-950 shadow-lg shadow-emerald-500/25 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <ShieldCheck className="h-4 w-4" />
              <span>Launch Official Doping Control & Whereabouts Portal</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </div>

        {/* ── The Principle of Strict Liability ── */}
        <div className="rounded-3xl border border-white/10 bg-[#120402]/80 p-6 sm:p-10 backdrop-blur-xl mb-12 shadow-2xl">
          <div className="flex items-center gap-3 mb-4">
            <AlertOctagon className="h-6 w-6 text-gym-primary" />
            <h3 className="font-heading text-2xl sm:text-3xl font-bold uppercase text-white">
              The Doctrine of Strict Liability
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed max-w-3xl">
            Under IPF and WADA rules, <strong className="text-white">Strict Liability</strong> means an athlete is solely and completely responsible for any prohibited substance, its metabolites, or markers found in their specimen. Whether the ingestion was intentional, accidental, or from a tainted over-the-counter supplement, the anti-doping violation remains the athlete's liability.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-xs font-bold uppercase text-gym-primary">In-Competition Testing</div>
              <p className="text-xs text-gray-300 mt-1">National podium finishers, national record breakers, and randomly drawn lifters undergo immediate sample collection.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-xs font-bold uppercase text-gym-primary">Out-of-Competition Testing</div>
              <p className="text-xs text-gray-300 mt-1">Athletes in the Registered Testing Pool (RTP) must submit quarterly whereabouts and are subject to unannounced testing 365 days a year.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-xs font-bold uppercase text-gym-primary">Sanction Severity</div>
              <p className="text-xs text-gray-300 mt-1">Violations carry up to a 4-year national & international ban, forfeiture of all titles, and public registry naming.</p>
            </div>
          </div>
        </div>

        {/* ── Prohibited Substance Classes ── */}
        <div className="rounded-3xl border border-white/10 bg-[#120402]/80 p-6 sm:p-10 backdrop-blur-xl mb-12 shadow-2xl">
          <div className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-2">WADA Prohibited List</div>
          <h3 className="font-heading text-2xl sm:text-3xl font-bold uppercase text-white mb-6">
            Primary Banned Substances in Powerlifting
          </h3>
          <div className="space-y-3">
            {PROHIBITED_CLASSES.map((item, i) => (
              <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-2xl border border-white/10 bg-white/5 p-4 hover:border-emerald-500/30 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-500/20 text-xs font-black text-red-400 border border-red-500/30">
                    {item.code}
                  </span>
                  <div>
                    <div className="font-heading text-sm sm:text-base font-bold text-white">{item.title}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{item.desc}</div>
                  </div>
                </div>
                <span className="self-start sm:self-auto text-[10px] font-semibold uppercase tracking-wider text-red-400 bg-red-500/10 px-2.5 py-1 rounded-full border border-red-500/20">
                  Strictly Banned
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── TUE & Supplement Safety ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* TUE */}
          <div className="rounded-3xl border border-white/10 bg-[#120402]/80 p-6 sm:p-8 backdrop-blur-xl">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gym-primary mb-2">
              <FileCheck2 className="h-4 w-4" />
              <span>Medical Exemptions</span>
            </div>
            <h4 className="font-heading text-2xl font-bold uppercase text-white mb-3">
              Therapeutic Use Exemption (TUE)
            </h4>
            <p className="text-xs text-gray-300 leading-relaxed mb-4">
              If an athlete requires a prohibited medication to treat an acute or chronic diagnosed medical condition (such as insulin for Type 1 diabetes, or specific asthma inhalers), an official TUE application must be submitted to NADA at least 30 days prior to championship participation.
            </p>
            <div className="text-xs text-gray-400 bg-white/5 p-3 rounded-xl border border-white/10">
              Need assistance submitting your medical exemption paperwork? Contact the Federation Anti-Doping Medical Liaison.
            </div>
          </div>

          {/* Supplement Caution */}
          <div className="rounded-3xl border border-white/10 bg-[#120402]/80 p-6 sm:p-8 backdrop-blur-xl">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-400 mb-2">
              <ShieldCheck className="h-4 w-4" />
              <span>Supplement Due Diligence</span>
            </div>
            <h4 className="font-heading text-2xl font-bold uppercase text-white mb-3">
              Third-Party Batch Testing
            </h4>
            <p className="text-xs text-gray-300 leading-relaxed mb-4">
              Pre-workouts, fat burners, and cheap proteins frequently contain undeclared stimulants or SARMs. Athletes must ONLY consume supplements carrying third-party anti-doping batch certifications such as <strong className="text-white">Informed Sport</strong>, <strong className="text-white">NSF Certified for Sport</strong>, or <strong className="text-white">Cologne List</strong>.
            </p>
            <div className="text-xs text-emerald-300 bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/30">
              Head Coach Tanvi is a Certified Supplement Specialist offering clean supplement audits for competitors.
            </div>
          </div>
        </div>

        {/* ── Interactive Clean Lifter Oath ── */}
        <div className="rounded-3xl border border-emerald-500/40 bg-gradient-to-br from-[#041a10] via-[#09110d] to-[#040806] p-8 sm:p-10 text-center shadow-[0_0_40px_rgba(16,185,129,0.15)] mb-12">
          <div className="max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1 text-xs font-bold uppercase tracking-widest text-emerald-400 mb-3">
              <Award className="h-3.5 w-3.5" />
              <span>National Athlete Pledge</span>
            </div>
            <h3 className="font-heading text-2xl sm:text-3xl font-bold uppercase text-white mb-3">
              The Clean Athlete Oath
            </h3>
            <p className="text-xs sm:text-sm text-gray-300 mb-6 italic">
              "I solemnly pledge to compete with 100% natural dedication, honor the spirit of clean sport, uphold the IPF and NADA Anti-Doping codes, and respect my competitors through truthful strength."
            </p>

            <button
              type="button"
              onClick={() => setPledged(true)}
              className={`rounded-full px-8 py-3.5 font-heading text-xs sm:text-sm font-bold uppercase tracking-wider transition-all cursor-pointer ${
                pledged
                  ? "bg-emerald-500 text-white shadow-[0_0_25px_rgba(16,185,129,0.6)] cursor-default"
                  : "bg-white text-black hover:bg-emerald-400 hover:text-black shadow-lg"
              }`}
            >
              {pledged ? "✓ You Have Signed The Clean Sport Pledge" : "Take The Clean Lifter Pledge"}
            </button>
          </div>
        </div>

        {/* ── Direct WhatsApp Helpline ── */}
        <div className="rounded-3xl border border-gym-primary/30 bg-gradient-to-br from-[#1b0603] to-[#0c0201] p-8 sm:p-10 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-gym-primary mb-2">Confidential Anti-Doping Inquiry</div>
            <h3 className="font-heading text-2xl sm:text-3xl font-bold uppercase text-white">
              Questions About Your Supplement or Medication?
            </h3>
            <p className="text-xs sm:text-sm text-gray-300 mt-1 max-w-xl">
              Consult Coach Tanvi (Certified Supplement Specialist) before taking any OTC medication, pre-workout, or health supplement to verify zero banned substance cross-contamination.
            </p>
          </div>

          <a
            href={`https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent("Hi Coach Tanvi, I would like to verify my supplement/medication ingredients for NADA/WADA anti-doping safety.")}`}
            target="_blank"
            rel="noreferrer"
            className="group flex items-center gap-2.5 rounded-full bg-gradient-to-r from-emerald-600 to-emerald-500 px-7 py-3.5 font-heading text-xs sm:text-sm font-bold uppercase tracking-wider text-white shadow-lg hover:brightness-105 transition-all cursor-pointer shrink-0"
          >
            <WhatsAppIcon variant="badge" className="h-6 w-6" />
            <span>Verify Clean Status via WhatsApp</span>
          </a>
        </div>

      </div>
    </div>
  );
}
