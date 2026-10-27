"use client";

import { motion } from "framer-motion";
import { Award, CheckCircle2, ChevronRight, FileText, Globe2, Landmark, Medal, ShieldCheck, Trophy, Zap } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const honors = [
  {
    icon: Award,
    title: "7 Arjuna Awardees",
    desc: "Highest sports honor from Govt. of India conferred upon 7 elite federation lifters.",
  },
  {
    icon: Medal,
    title: "1 Dronacharya Award",
    desc: "Govt. of India's premier national coaching award for international excellence.",
  },
  {
    icon: Trophy,
    title: "900+ International Medals",
    desc: "Won by Indian lifters in Asian, Commonwealth, and IPF World Championships.",
  },
  {
    icon: Zap,
    title: "Unbeaten World Record",
    desc: "Sri E.S. Bhaskaran lifted 260 KG Deadlift in the 52 KG class — an unbroken historic benchmark.",
  },
];

const championships = [
  "Sub Junior Nationals",
  "Junior Nationals",
  "Senior Nationals",
  "Master Nationals",
  "Benchpress Nationals",
  "Deadlift Nationals",
  "Federation Cup",
  "Zonal Championships (N, S, E, W)",
];

const governanceUnits = [
  { count: "37", label: "Affiliated State Associations" },
  { count: "06", label: "Central Govt. Office Board Units" },
  { count: "10,000+", label: "Registered Men & Women Athletes" },
  { count: "23", label: "International Meets Hosted in India" },
];

export default function WelcomeFederation() {
  return (
    <section id="welcome" className="relative z-10 w-full border-b border-white/5 bg-gym-black py-12 md:py-16 lg:py-20 flex flex-col items-center">
      
      {/* ── Top Header Marker ── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mb-8 md:mb-10 flex flex-col items-center text-center px-6"
      >
        <div className="inline-flex items-center gap-2.5 rounded-full border border-gym-primary/35 bg-gym-primary/10 px-4 py-1.5 backdrop-blur-md shadow-[0_0_20px_rgba(230,80,27,0.2)] mb-3.5">
          <Landmark className="h-4 w-4 text-gym-primary shrink-0" />
          <span className="text-xs sm:text-sm font-bold uppercase tracking-[0.25em] text-gym-primary">
            World Powerlifting India • State Governing Body
          </span>
        </div>
        <h2 className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-[4.25rem] font-black uppercase leading-[1.04] tracking-tight text-white drop-shadow-xl">
          Welcome To <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-gym-primary via-[#ff7a45] to-gym-primary bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(230,80,27,0.5)]">
            WPI Association of Gujarat
          </span>
        </h2>
        <p className="mt-3.5 max-w-3xl text-sm sm:text-base md:text-lg text-gray-300 font-normal leading-relaxed">
          The official state governing authority for powerlifting in Gujarat under <strong className="text-white font-semibold">World Powerlifting India (WPI)</strong>. Dedicated to platform excellence, certified coaching academies, strict anti-doping integrity, and producing national champions.
        </p>
      </motion.div>

      {/* ── Main Glass Showcase Card ── */}
      <div className="w-full px-6 md:px-12 lg:px-24 flex justify-center">
        <div className="w-full max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative w-full glass-panel rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
          >
            {/* Top orange glow line */}
            <div className="absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-gym-primary to-transparent opacity-75 z-10" />

            <div className="p-6 sm:p-8 md:p-10 lg:p-12 flex flex-col gap-8 md:gap-10 bg-black/25">

              {/* ── Top Recognition Banners ── */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-6 border-b border-white/10">
                <div className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                  <ShieldCheck className="h-7 w-7 text-gym-primary shrink-0" />
                  <div>
                    <div className="text-xs text-gray-400 uppercase font-semibold">National Authority</div>
                    <div className="text-sm font-bold text-white">World Powerlifting India (WPI)</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                  <Landmark className="h-7 w-7 text-gym-primary shrink-0" />
                  <div>
                    <div className="text-xs text-gray-400 uppercase font-semibold">State Jurisdiction</div>
                    <div className="text-sm font-bold text-white">Association of Gujarat</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                  <Globe2 className="h-7 w-7 text-gym-primary shrink-0" />
                  <div>
                    <div className="text-xs text-gray-400 uppercase font-semibold">Standards</div>
                    <div className="text-sm font-bold text-white">WADA & NADA Anti-Doping Code</div>
                  </div>
                </div>
              </div>

              {/* ── Middle: Two-Column Heritage & Emblem ── */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                
                {/* Left Description & Legacy */}
                <div className="lg:col-span-7 flex flex-col gap-6">
                  <span className="self-start inline-flex items-center gap-2 rounded-full bg-gym-primary/10 border border-gym-primary/30 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-gym-primary">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Gujarat State Platform Authority
                  </span>
                  
                  <h3 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black uppercase text-white leading-tight">
                    Empowering Strength Across <span className="text-gym-primary">Gujarat</span>
                  </h3>

                  <p className="text-sm sm:text-base leading-relaxed text-gray-300">
                    WPI Association of Gujarat organizes official district and state powerlifting championships, maintains ratified state records, licenses competitive athletes, and conducts accredited referee and coach academies. Lifters compete under international standard technical switchboards and calibrated barbells.
                  </p>

                  {/* Highlight Callout */}
                  <div className="p-5 rounded-2xl bg-gradient-to-r from-gym-primary/15 via-[#3a0e08]/40 to-transparent border-l-4 border-gym-primary border-y border-r border-white/5">
                    <div className="flex items-start gap-3">
                      <Zap className="h-5 w-5 text-gym-primary shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs font-bold uppercase tracking-wider text-gym-primary">Official Championship Standard</div>
                        <div className="text-sm sm:text-base font-semibold text-white mt-1">
                          All state championships feature calibrated plates, electronic 3-light referee jury consoles, and strict NADA-compliant random doping draws.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Emblem / Federation Crest Showcase */}
                <div className="lg:col-span-5 flex flex-col items-center justify-center">
                  <div className="relative flex flex-col items-center justify-center p-8 sm:p-10 rounded-3xl bg-gradient-to-b from-white/[0.04] to-black/60 border border-amber-500/30 shadow-[0_0_50px_rgba(245,158,11,0.15)] text-center w-full max-w-sm">
                    {/* Glowing circular halo */}
                    <div className="absolute inset-0 bg-amber-500/10 blur-[45px] rounded-full pointer-events-none" />

                    {/* Official Circular Emblem */}
                    <div className="relative z-10 flex h-36 w-36 sm:h-40 sm:w-40 items-center justify-center rounded-full overflow-hidden border-2 border-amber-500/80 shadow-[0_0_40px_rgba(245,158,11,0.4)] mb-6 group transition-transform duration-300 hover:scale-105 bg-black">
                      <Image
                        src="/images/wpi-logo-transparent.png"
                        alt="WPI Association of Gujarat Official Logo"
                        fill
                        className="object-contain"
                        priority
                      />
                    </div>

                    <div className="relative z-10 font-heading text-2xl font-bold uppercase tracking-wider text-white">
                      WPI Gujarat
                    </div>
                    <div className="relative z-10 mt-1 text-xs font-bold uppercase tracking-[0.25em] text-amber-400">
                      ASSOCIATION OF GUJARAT
                    </div>
                    <div className="relative z-10 mt-4 text-xs text-gray-400 font-medium">
                      World Powerlifting India • Official State Governing Body
                    </div>
                  </div>
                </div>

              </div>

              {/* ── Honors & Achievements Grid (Arjuna, Dronacharya, Medals) ── */}
              <div id="welcome-awards" className="flex flex-col gap-6 pt-4">
                <div className="flex items-center gap-3">
                  <span className="h-0.5 w-8 bg-gym-primary" />
                  <span className="text-xs font-bold uppercase tracking-[0.3em] text-gray-400">
                    National & International Honors
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  {honors.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={item.title}
                        className="group relative p-6 rounded-2xl bg-white/[0.02] border border-white/10 transition-all duration-300 hover:border-gym-primary/50 hover:bg-white/[0.04] hover:-translate-y-1 shadow-lg"
                      >
                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gym-primary/10 border border-gym-primary/30 text-gym-primary transition-colors group-hover:bg-gym-primary group-hover:text-white">
                          <Icon className="h-6 w-6" />
                        </div>
                        <h4 className="font-heading text-xl font-bold uppercase text-white mb-2 tracking-wide">
                          {item.title}
                        </h4>
                        <p className="text-xs leading-relaxed text-gray-400">
                          {item.desc}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ── Key Statistics Row ── */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-4 border-t border-white/10">
                {governanceUnits.map((stat) => (
                  <div key={stat.label} className="flex flex-col items-center text-center">
                    <div className="font-heading text-4xl sm:text-5xl font-black text-gym-primary drop-shadow">
                      {stat.count}
                    </div>
                    <div className="text-xs font-bold uppercase tracking-wider text-gray-400 mt-1">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>

              {/* ── Annual Championships Calendar List & Action CTAs ── */}
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pt-6 border-t border-white/10">
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-gym-primary">
                    Annual National Championships
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {championships.map((champ) => (
                      <span
                        key={champ}
                        className="text-xs px-3 py-1 rounded-full bg-white/[0.03] border border-white/10 text-gray-300 font-medium"
                      >
                        {champ}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 shrink-0">
                  <Link
                    href="/circulars"
                    className="inline-flex items-center gap-2 rounded-full bg-gym-primary px-6 py-3 text-xs font-bold uppercase tracking-widest text-white shadow-[0_0_20px_rgba(230,80,27,0.4)] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(230,80,27,0.7)]"
                  >
                    <FileText className="h-4 w-4" />
                    <span>Official Circulars</span>
                  </Link>

                  <Link
                    href="/records"
                    className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3 text-xs font-bold uppercase tracking-widest text-white transition-all duration-300 hover:bg-white/10 hover:border-white/40"
                  >
                    <span>National Records</span>
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>

            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
