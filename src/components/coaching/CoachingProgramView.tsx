"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Activity, 
  ArrowLeft, 
  ArrowRight, 
  Award, 
  Check, 
  CheckCircle2, 
  ChevronDown, 
  ChevronRight, 
  Dumbbell, 
  HeartHandshake, 
  HelpCircle, 
  MessageCircle, 
  Phone, 
  ShieldCheck, 
  Sparkles, 
  Target, 
  UserCheck, 
  Users, 
  Zap 
} from "lucide-react";
import { ProgramDetail } from "@/data/coaching-programs";
import CoachingPlans from "@/components/home/CoachingPlans";
import WhatsAppIcon from "@/components/ui/WhatsAppIcon";
import { PageNavigation } from "@/components/ui/PageNavigation";

const WHATSAPP_PHONE = "917043951377";
const WHATSAPP_DISPLAY = "7043951377";

function InstagramIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
    </svg>
  );
}

export default function CoachingProgramView({ program }: { program: ProgramDetail }) {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  return (
    <div className="min-h-screen bg-gym-black text-white pt-32 sm:pt-36 lg:pt-40 pb-20 relative overflow-hidden">
      
      {/* ── Animated Ambient Background Glowing Orbs ── */}
      <motion.div 
        animate={{ 
          y: [0, -20, 0],
          scale: [1, 1.1, 1],
          opacity: [0.15, 0.25, 0.15] 
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -top-40 left-1/4 h-96 w-96 rounded-full bg-gym-primary blur-[120px]" 
      />
      <motion.div 
        animate={{ 
          y: [0, 25, 0],
          scale: [1, 1.15, 1],
          opacity: [0.1, 0.2, 0.1] 
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="pointer-events-none absolute top-1/3 -right-40 h-96 w-96 rounded-full bg-emerald-500 blur-[130px]" 
      />

      <div className="mx-auto max-w-7xl px-6 md:px-12 relative z-10">
        
        {/* ── Page Navigation & Breadcrumb ── */}
        <PageNavigation
          href="/coaching"
          label="Back to Coaching Catalog"
          parentHref="/"
          parentLabel="Home"
          badge={program.category}
        />

        {/* ── Program Hero Section ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start mb-16">
          
          {/* Left Column: Heading, Badge, Description */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="lg:col-span-7 flex flex-col"
          >
            {/* Category & Badge */}
            <div className="flex flex-wrap items-center gap-2.5 mb-4">
              <span className={`rounded-full border px-3.5 py-1 text-xs font-extrabold uppercase tracking-wider ${program.badgeColor}`}>
                {program.badge}
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-gray-400">
                {program.category}
              </span>
            </div>

            {/* Title with Gradient Text */}
            <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight text-white leading-[1.04]">
              {program.title}
            </h1>

            {/* Subtitle / Tagline */}
            <p className="mt-4 text-base sm:text-lg text-gray-300 font-normal leading-relaxed">
              {program.tagline}
            </p>

            {/* Overview Box */}
            <div className="mt-6 rounded-2xl border border-white/10 bg-[#140402]/80 p-5 backdrop-blur-md">
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                {program.overview}
              </p>
            </div>

            {/* Coach Credentials Pills */}
            <div className="mt-6 flex flex-wrap items-center gap-2 sm:gap-3">
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                <Dumbbell className="h-3.5 w-3.5 text-gym-primary" />
                Coach Akash (Certified Fitness Trainer)
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                Coach Tanvi (Nutrition & Supplement Specialist)
              </span>
            </div>
          </motion.div>

          {/* Right Column: Pricing & Quick Enrolment Card with Animated Glowing Border */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
            className="lg:col-span-5 relative"
          >
            {/* Glowing Backdrop */}
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-tr from-gym-primary via-gym-red to-amber-500 opacity-30 blur-xl animate-pulse" />

            <div className="relative rounded-3xl border-2 border-gym-primary/50 bg-gradient-to-b from-[#1f0703] via-[#140402] to-[#0d0201] p-7 sm:p-8 shadow-2xl backdrop-blur-2xl">
              <div className="text-xs font-bold uppercase tracking-widest text-gym-primary mb-1">
                Pricing & Enrolment
              </div>
              
              <div className="flex items-baseline gap-2">
                <span className="font-heading text-4xl sm:text-5xl font-black text-white tracking-tight">
                  {program.price}
                </span>
                <span className="text-xs font-semibold text-gray-400">
                  {program.priceNote}
                </span>
              </div>

              <div className="my-6 border-t border-white/10 pt-5 flex flex-col gap-3">
                <div className="text-xs font-bold uppercase tracking-wider text-gray-200">
                  Included in this coaching program:
                </div>
                {program.features.map((feat, idx) => (
                  <motion.div 
                    key={feat}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + idx * 0.05 }}
                    className="flex items-start gap-2.5 text-xs text-gray-200"
                  >
                    <Check className="h-4 w-4 shrink-0 text-gym-primary mt-0.5" />
                    <span>{feat}</span>
                  </motion.div>
                ))}
              </div>

              {/* Direct WhatsApp CTA Button with Pulse & Authentic WhatsApp Badge */}
              <a
                href={`https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(program.waMessage)}`}
                target="_blank"
                rel="noreferrer"
                className="group relative flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600 py-4 px-5 font-heading text-sm sm:text-base font-bold uppercase tracking-wider text-white shadow-[0_0_30px_rgba(16,185,129,0.5)] hover:shadow-[0_0_40px_rgba(37,211,102,0.7)] hover:brightness-105 active:scale-[0.99] transition-all cursor-pointer overflow-hidden border border-emerald-400/40"
              >
                {/* Glossy light sweep on hover */}
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />

                {/* Authentic WhatsApp 3D Badge */}
                <WhatsAppIcon variant="badge" className="h-8 w-8" />
                <span className="tracking-wide drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]">Enrol via WhatsApp Now</span>
              </a>

              <div className="mt-3 text-center text-[11px] text-gray-400 flex items-center justify-center gap-2">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                <span>100% Direct Coach Access • No Bot Replies</span>
              </div>
            </div>
          </motion.div>

        </div>

        {/* If this is the "plans" slug, also show the interactive 4-tier comparison tabs right here! */}
        {program.slug === "plans" && (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-16"
          >
            <CoachingPlans />
          </motion.div>
        )}

        {/* ── Who Is This For & Deliverables Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
          
          {/* Who Is This For */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-6 rounded-3xl border border-white/10 bg-[#120402]/80 p-7 backdrop-blur-xl shadow-xl"
          >
            <div className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-wider text-gym-primary mb-4">
              <Target className="h-4 w-4" />
              <span>Who Is This Program For?</span>
            </div>
            <div className="flex flex-col gap-3">
              {program.whoIsThisFor.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gym-primary/20 text-gym-primary text-xs font-bold mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="text-xs sm:text-sm text-gray-300 leading-relaxed">{item}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Core Deliverables */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-6 rounded-3xl border border-white/10 bg-[#120402]/80 p-7 backdrop-blur-xl shadow-xl"
          >
            <div className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-wider text-gym-primary mb-4">
              <Award className="h-4 w-4" />
              <span>Core Coaching Deliverables</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {program.deliverables.map((item, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-white/[0.03] border border-white/5 flex flex-col justify-between">
                  <div>
                    <h4 className="font-heading text-base font-bold text-white mb-1.5">{item.title}</h4>
                    <p className="text-xs text-gray-400 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

        </div>

        {/* ── FAQ Section with Animated Accordion ── */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-16 rounded-3xl border border-white/10 bg-[#120402]/80 p-8 sm:p-10 backdrop-blur-xl"
        >
          <div className="text-center mb-8">
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-gym-primary mb-1">
              Common Queries
            </div>
            <h3 className="font-heading text-2xl sm:text-3xl font-bold uppercase text-white">
              Frequently Asked Questions
            </h3>
          </div>

          <div className="mx-auto max-w-3xl flex flex-col gap-3">
            {program.faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div 
                  key={idx}
                  className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden transition-colors hover:border-gym-primary/40"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    className="w-full flex items-center justify-between p-4 sm:p-5 text-left text-xs sm:text-sm font-bold text-white cursor-pointer"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown className={`h-4 w-4 text-gym-primary transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="px-4 pb-5 sm:px-5 text-xs text-gray-300 leading-relaxed border-t border-white/5 pt-3"
                      >
                        {faq.answer}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* ── Direct Coach Mentorship Card ── */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="rounded-3xl border border-gym-primary/40 bg-gradient-to-r from-[#210603] via-[#140302] to-[#210603] p-8 sm:p-12 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8"
        >
          <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
            <div className="relative h-24 w-24 rounded-full overflow-hidden border-2 border-gym-primary shadow-[0_0_25px_rgba(230,80,27,0.5)] shrink-0 bg-black">
              <Image
                src="/images/at-logo.png"
                alt="Coaches Akash & Tanvi"
                fill
                sizes="96px"
                className="object-cover"
              />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-gym-primary">Direct Coach Consultation</div>
              <h3 className="font-heading text-3xl sm:text-4xl font-black uppercase text-white">
                Coaches Akash & Tanvi
              </h3>
              <p className="text-xs sm:text-sm text-gray-300 mt-1 max-w-xl">
                Ready to begin {program.title}? Chat with us directly on WhatsApp to ask questions or customize your start date.
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-4 text-xs font-semibold text-gray-300 justify-center sm:justify-start">
                <a href={`https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(program.waMessage)}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300">
                  <WhatsAppIcon variant="official" className="h-3.5 w-3.5" />
                  <span>+{WHATSAPP_DISPLAY}</span>
                </a>
                <a href="https://instagram.com/akash._.fit" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-gym-primary hover:text-white">
                  <InstagramIcon className="h-3.5 w-3.5" />
                  <span>@akash._.fit</span>
                </a>
                <a href="https://instagram.com/tanvifitfusion" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-gym-primary hover:text-white">
                  <InstagramIcon className="h-3.5 w-3.5" />
                  <span>@tanvifitfusion</span>
                </a>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/coaching"
              className="flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-4 font-heading text-xs sm:text-sm font-bold uppercase tracking-wider text-white hover:bg-white/10 hover:border-gym-primary transition-all"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>All Programs</span>
            </Link>
            <a
              href={`https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(program.waMessage)}`}
              target="_blank"
              rel="noreferrer"
              className="group flex items-center gap-2.5 rounded-full bg-gym-primary px-8 py-4 font-heading text-xs sm:text-sm font-bold uppercase tracking-wider text-white shadow-[0_0_25px_rgba(230,80,27,0.5)] hover:brightness-110 transition-all cursor-pointer"
            >
              <WhatsAppIcon variant="white" className="h-4 w-4" />
              <span>Chat on WhatsApp</span>
            </a>
          </div>
        </motion.div>

      </div>
    </div>
  );
}

export { CoachingProgramView };
