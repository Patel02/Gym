"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Building2, 
  ChevronRight, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  Sparkles
} from "lucide-react";
import WhatsAppIcon from "@/components/ui/WhatsAppIcon";
import { PageNavigation } from "@/components/ui/PageNavigation";
import type { FacilityData } from "@/actions/facility.actions";

const WHATSAPP_PHONE = "917043951377";

export default function FacilityView({ initialData }: { initialData: FacilityData }) {
  const { hero, highlights, passes, cta } = initialData;

  return (
    <div className="min-h-screen bg-gym-black text-white pt-32 sm:pt-36 lg:pt-40 pb-20 relative overflow-hidden">
      
      {/* ── Ambient Background Glows ── */}
      <motion.div 
        animate={{ y: [0, -25, 0], scale: [1, 1.15, 1] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-gym-primary/15 blur-[120px]" 
      />
      <motion.div 
        animate={{ y: [0, 25, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute top-1/2 -right-40 h-96 w-96 rounded-full bg-emerald-500/10 blur-[130px]" 
      />

      <div className="relative mx-auto max-w-7xl px-6 md:px-12">
        
        <PageNavigation
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "High-Performance Facility" },
          ]}
          badge="National Platforms"
        />

        {/* ── Hero ── */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 rounded-full border border-gym-primary/30 bg-gym-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-gym-primary mb-4 shadow-[0_0_20px_rgba(230,80,27,0.2)]"
          >
            <Building2 className="h-3.5 w-3.5" />
            <span>{hero.badge || "High-Performance Platform Lab"}</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight text-white drop-shadow-xl"
          >
            {hero.title || "National Training"} <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-gym-primary via-[#ff7a45] to-gym-primary bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(230,80,27,0.5)]">
              {hero.subtitle || "Facility & Platforms"}
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-4 text-sm sm:text-base md:text-lg text-gray-300 leading-relaxed font-normal"
          >
            {hero.desc || "India's premier strength destination designed specifically for Olympic-grade IPF powerlifting, elite hypertrophy preparation, and advanced athlete recovery."}
          </motion.p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs font-bold uppercase tracking-wider text-gray-400">
            {hero.location && (
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-gym-primary" /> {hero.location}
              </span>
            )}
            {hero.location && hero.hours && <span>•</span>}
            {hero.hours && (
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-gym-primary" /> {hero.hours}
              </span>
            )}
          </div>
        </div>

        {/* ── Facility Specifications Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {highlights.map((item, idx) => (
            <motion.div
              key={item.id || idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              className="rounded-3xl border border-white/10 bg-[#120402]/80 p-6 sm:p-7 backdrop-blur-xl hover:border-gym-primary/50 transition-all flex flex-col justify-between shadow-xl"
            >
              <div>
                <div className="text-[11px] font-bold uppercase tracking-widest text-gym-primary mb-1">
                  {item.subtitle}
                </div>
                <h3 className="font-heading text-xl font-bold uppercase text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-xs text-gray-300 leading-relaxed">
                  {item.desc}
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-white/10 flex items-center gap-2 text-xs font-semibold text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>{item.tag || "Available For Daily Athlete Training"}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── Training Access Passes & Pricing ── */}
        <div className="mb-16">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="text-xs font-bold uppercase tracking-widest text-gym-primary mb-2">Facility Access Passes</div>
            <h3 className="font-heading text-3xl sm:text-4xl font-black uppercase text-white">
              Train on Competition Platforms
            </h3>
            <p className="text-xs sm:text-sm text-gray-300 mt-1">
              Whether you need a single heavy day mock-meet session or a dedicated monthly training membership, choose an access pass below.
            </p>
          </div>

          <div className={`grid grid-cols-1 sm:grid-cols-2 ${passes.length <= 3 ? "lg:grid-cols-3" : "lg:grid-cols-2 xl:grid-cols-4"} gap-6`}>
            {passes.map((pass, idx) => (
              <motion.div
                key={pass.id || idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`relative rounded-3xl p-6 sm:p-8 flex flex-col justify-between backdrop-blur-xl transition-all ${
                  pass.popular
                    ? "border-2 border-gym-primary bg-gradient-to-b from-[#1c0603] to-[#100302] shadow-[0_0_35px_rgba(230,80,27,0.35)] scale-102"
                    : "border border-white/10 bg-[#120402]/80 hover:border-white/25"
                }`}
              >
                {pass.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gym-primary px-4 py-1 text-[10px] font-semibold uppercase tracking-widest text-white shadow-md">
                    {pass.badge || "Most Popular"}
                  </span>
                )}

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-gym-primary">{pass.badge}</span>
                  </div>
                  <h4 className="font-heading text-2xl font-bold uppercase text-white">{pass.name}</h4>
                  <p className="text-xs text-gray-300 mt-2 mb-4">{pass.desc}</p>

                  <div className="my-4 pb-4 border-b border-white/10">
                    <span className="font-heading text-4xl font-bold text-white">{pass.price}</span>
                    <span className="text-xs text-gray-400 font-medium ml-2">{pass.period}</span>
                  </div>

                  {pass.features && pass.features.length > 0 && (
                    <div className="space-y-2 mb-6">
                      {pass.features.map((f, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-gray-300">
                          <CheckCircle2 className="h-3.5 w-3.5 text-gym-primary mt-0.5 shrink-0" />
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <a
                  href={`https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(pass.waMessage || `Hi Coaches Akash & Tanvi, I would like to book the ${pass.name} at the facility.`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className={`w-full flex items-center justify-center gap-2 rounded-xl py-3.5 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    pass.popular
                      ? "bg-gym-primary text-white hover:brightness-110 shadow-[0_0_20px_rgba(230,80,27,0.5)]"
                      : "bg-white/10 hover:bg-white/15 text-white border border-white/15"
                  }`}
                >
                  <WhatsAppIcon variant="badge" className="h-4.5 w-4.5" />
                  <span>Book Pass on WhatsApp</span>
                </a>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── Bottom Coach Consultation CTA ── */}
        {cta && (
          <div className="rounded-3xl border border-gym-primary/30 bg-gradient-to-br from-[#1b0603] to-[#0c0201] p-8 sm:p-10 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-gym-primary mb-2">
                {cta.tag || "Schedule A Visit & Platform Tour"}
              </div>
              <h3 className="font-heading text-2xl sm:text-3xl font-bold uppercase text-white">
                {cta.title || "Want to Tour the Facility in Person?"}
              </h3>
              <p className="text-xs sm:text-sm text-gray-300 mt-1 max-w-xl">
                {cta.desc || "Meet Coaches Akash & Tanvi at the platform lab for an in-person orientation, equipment trial, and discussion of your competition goals."}
              </p>
            </div>

            <a
              href={`https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(cta.waMessage || "Hi Coaches Akash & Tanvi, I would like to schedule an in-person visit and platform trial at the National Facility.")}`}
              target="_blank"
              rel="noreferrer"
              className="group flex items-center gap-2.5 rounded-full bg-gradient-to-r from-emerald-600 to-emerald-500 px-7 py-3.5 font-heading text-xs sm:text-sm font-bold uppercase tracking-wider text-white shadow-lg hover:brightness-105 transition-all cursor-pointer shrink-0"
            >
              <WhatsAppIcon variant="badge" className="h-6 w-6" />
              <span>Schedule Visit on WhatsApp</span>
            </a>
          </div>
        )}

      </div>
    </div>
  );
}
