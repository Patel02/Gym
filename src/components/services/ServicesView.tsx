"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Briefcase, 
  ChevronRight, 
  CheckCircle2, 
  Clock, 
  Sparkles,
  ArrowRight
} from "lucide-react";
import WhatsAppIcon from "@/components/ui/WhatsAppIcon";
import { PageNavigation } from "@/components/ui/PageNavigation";
import type { ServicesData } from "@/actions/services.actions";

const WHATSAPP_PHONE = "917043951377";

export default function ServicesView({ initialData }: { initialData: ServicesData }) {
  const { hero, services, cta } = initialData;

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
            { label: "Federation Services & Accreditation" },
          ]}
          badge="Federation Services"
        />

        {/* ── Hero ── */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 rounded-full border border-gym-primary/30 bg-gym-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-gym-primary mb-4 shadow-[0_0_20px_rgba(230,80,27,0.2)]"
          >
            <Briefcase className="h-3.5 w-3.5" />
            <span>{hero.badge || "Federation Governance & Portfolios"}</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight text-white drop-shadow-xl"
          >
            {hero.title || "Federation Services"} <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-gym-primary via-[#ff7a45] to-gym-primary bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(230,80,27,0.5)]">
              {hero.subtitle || "& Accreditation"}
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-4 text-sm sm:text-base md:text-lg text-gray-300 leading-relaxed font-normal"
          >
            {hero.desc || "Supporting athletes, state bodies, certified officials, and strength gyms nationwide through structured accreditation, sanctioning, referee clinics, and equipment logistics."}
          </motion.p>
        </div>

        {/* ── Services Portfolio Cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-14">
          {services.map((serv, idx) => (
            <motion.div
              key={serv.id || idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              className="group rounded-3xl border border-white/10 bg-[#120402]/80 p-6 sm:p-7 backdrop-blur-xl hover:border-gym-primary/50 transition-all duration-300 flex flex-col justify-between shadow-xl"
            >
              <div>
                <div className="text-[11px] font-bold uppercase tracking-widest text-gym-primary mb-1">
                  {serv.category}
                </div>
                <h3 className="font-heading text-xl font-bold uppercase text-white group-hover:text-gym-primary transition-colors mb-2">
                  {serv.title}
                </h3>
                <p className="text-xs text-gray-300 leading-relaxed mb-4">
                  {serv.desc}
                </p>

                {serv.features && serv.features.length > 0 && (
                  <div className="space-y-2 mb-5">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Included Provisions:</div>
                    {serv.features.map((feat, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-gray-300">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 mt-0.5 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-white/10 flex flex-col gap-3">
                {serv.timeline && (
                  <div className="text-[11px] font-medium text-gray-400 italic flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-gym-primary" />
                    <span>{serv.timeline}</span>
                  </div>
                )}

                <a
                  href={`https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(serv.waMessage || `Hi Coaches Akash & Tanvi, I would like to inquire about ${serv.title}`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-md hover:brightness-110 transition-all cursor-pointer"
                >
                  <WhatsAppIcon variant="badge" className="h-4.5 w-4.5" />
                  <span>Inquire on WhatsApp</span>
                </a>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── Bottom Coach Consultation CTA ── */}
        {cta && (
          <div className="rounded-3xl border border-gym-primary/30 bg-gradient-to-br from-[#1b0603] to-[#0c0201] p-8 sm:p-10 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-gym-primary mb-2">
                {cta.tag || "Secretariat Helpdesk"}
              </div>
              <h3 className="font-heading text-2xl sm:text-3xl font-bold uppercase text-white">
                {cta.title || "Need Assistance With Affiliation or Licenses?"}
              </h3>
              <p className="text-xs sm:text-sm text-gray-300 mt-1 max-w-xl">
                {cta.desc || "Connect directly with the Federation Administration on WhatsApp for expedited processing of state sanction letters, referee clinic forms, or club membership badges."}
              </p>
            </div>

            <a
              href={`https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(cta.waMessage || "Hi Federation Secretariat, I need assistance regarding federation services and registration.")}`}
              target="_blank"
              rel="noreferrer"
              className="group flex items-center gap-2.5 rounded-full bg-gradient-to-r from-emerald-600 to-emerald-500 px-7 py-3.5 font-heading text-xs sm:text-sm font-bold uppercase tracking-wider text-white shadow-lg hover:brightness-105 transition-all cursor-pointer shrink-0"
            >
              <WhatsAppIcon variant="badge" className="h-6 w-6" />
              <span>Contact Secretariat on WhatsApp</span>
            </a>
          </div>
        )}

      </div>
    </div>
  );
}
