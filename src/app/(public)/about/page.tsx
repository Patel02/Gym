import { Metadata } from "next";
import fs from "fs/promises";
import path from "path";
import Link from "next/link";
import { 
  Building2, 
  Calendar, 
  ChevronRight, 
  Globe2, 
  Landmark, 
  Mail, 
  MapPin, 
  Medal, 
  Phone, 
  ShieldCheck, 
  Sparkles, 
  Trophy, 
  Users, 
  Zap,
  ArrowRight,
  Target
} from "lucide-react";
import { AboutData } from "@/components/admin/AboutEditor";

export const metadata: Metadata = {
  title: "About Us • Indian Powerlifting Federation | Powerlifting India",
  description: "Estd. 1975. The apex national governing body for powerlifting in India, recognized by the Ministry of Youth Affairs & Sports (Govt. of India) and Indian Olympic Association.",
};

const ABOUT_FILE_PATH = path.join(process.cwd(), "src", "data", "federation-about.json");

async function getAboutData(): Promise<AboutData> {
  try {
    const data = await fs.readFile(ABOUT_FILE_PATH, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    throw new Error("Failed to load about federation data");
  }
}

import { PageNavigation } from "@/components/ui/PageNavigation";

export default async function AboutPage() {
  const about = await getAboutData();

  return (
    <div className="min-h-screen bg-gym-black text-white selection:bg-gym-primary selection:text-black">
      
      {/* ── 1. HERO SECTION ── */}
      <section className="relative overflow-hidden pt-36 pb-16 md:pt-44 md:pb-24 border-b border-white/5">
        {/* Background glow effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 h-[450px] w-[650px] rounded-full bg-gym-primary/15 blur-[120px] pointer-events-none" />
        <div className="absolute top-10 right-10 -z-10 h-72 w-72 rounded-full bg-gym-crimson/20 blur-[100px] pointer-events-none" />

        <div className="mx-auto w-full max-w-7xl px-6 md:px-12 lg:px-16 flex flex-col items-center text-center">
            <PageNavigation
              breadcrumbs={[
                { label: "Home", href: "/" },
                { label: "About Federation & Heritage" },
              ]}
              badge="Federation Heritage"
            />
          {/* Top Badge */}
          <div className="inline-flex items-center gap-2.5 rounded-full border border-gym-primary/35 bg-gym-primary/10 px-4 py-1.5 backdrop-blur-md shadow-[0_0_20px_rgba(230,80,27,0.2)] mb-6">
            <Landmark className="h-4 w-4 text-gym-primary shrink-0" />
            <span className="text-xs sm:text-sm font-bold uppercase tracking-[0.25em] text-gym-primary">
              {about.hero.badge}
            </span>
          </div>

          {/* Main Title */}
          <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight text-white leading-[1.05] max-w-5xl drop-shadow-2xl">
            About <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-gym-primary via-[#ff7a45] to-gym-primary bg-clip-text text-transparent drop-shadow-[0_0_40px_rgba(230,80,27,0.55)]">
              Indian Powerlifting Federation
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-5 max-w-3xl text-base sm:text-lg md:text-xl font-semibold text-gray-200 tracking-wide">
            {about.hero.subtitle}
          </p>

          {/* Lead Summary */}
          <p className="mt-4 max-w-3xl text-sm sm:text-base text-gray-300 font-normal leading-relaxed">
            {about.hero.description}
          </p>

          {/* Quick Action Navigation Bar */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/about/mission"
              className="rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-gray-200 hover:border-gym-primary hover:text-white hover:bg-gym-primary/15 transition-all shadow-sm"
            >
              Mission & Values
            </Link>
            <Link
              href="/about/timeline"
              className="rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-gray-200 hover:border-gym-primary hover:text-white hover:bg-gym-primary/15 transition-all shadow-sm"
            >
              Historic Timeline
            </Link>
            <Link
              href="/about/honors"
              className="rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-gray-200 hover:border-gym-primary hover:text-white hover:bg-gym-primary/15 transition-all shadow-sm"
            >
              Hall of Glory
            </Link>
            <Link
              href="/about/governance"
              className="rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-gray-200 hover:border-gym-primary hover:text-white hover:bg-gym-primary/15 transition-all shadow-sm"
            >
              National Secretariat
            </Link>
          </div>

          {/* ── Official Recognition Banners Grid ── */}
          <div className="mt-14 w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
            <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-[#110402]/80 border border-gym-primary/20 shadow-lg backdrop-blur-md">
              <ShieldCheck className="h-8 w-8 text-gym-primary shrink-0" />
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Govt. of India</div>
                <div className="text-xs sm:text-sm font-bold text-white">Ministry of Youth Affairs & Sports</div>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-[#110402]/80 border border-gym-primary/20 shadow-lg backdrop-blur-md">
              <Landmark className="h-8 w-8 text-gym-primary shrink-0" />
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Olympic Body</div>
                <div className="text-xs sm:text-sm font-bold text-white">Indian Olympic Association (IOA)</div>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-[#110402]/80 border border-gym-primary/20 shadow-lg backdrop-blur-md">
              <Globe2 className="h-8 w-8 text-gym-primary shrink-0" />
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400">World Body</div>
                <div className="text-xs sm:text-sm font-bold text-white">International Powerlifting Fed. (IPF)</div>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-[#110402]/80 border border-gym-primary/20 shadow-lg backdrop-blur-md">
              <Zap className="h-8 w-8 text-gym-primary shrink-0" />
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Clean Sport Code</div>
                <div className="text-xs sm:text-sm font-bold text-white">WADA & NADA Compliant</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── DEDICATED FEDERATION PORTALS SHOWCASE ── */}
      <section className="py-14 bg-[#0d0201]/90 border-b border-white/5 relative">
        <div className="mx-auto w-full max-w-7xl px-6 md:px-12 lg:px-16">
          <div className="mb-10 flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-gym-primary/30 bg-gym-primary/10 px-4 py-1 text-xs font-bold uppercase tracking-widest text-gym-primary mb-3 shadow-[0_0_15px_rgba(230,80,27,0.2)]">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Dedicated Portals</span>
            </div>
            <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-black uppercase text-white tracking-tight">
              Separate Federation <span className="bg-gradient-to-r from-gym-primary via-[#ff7a45] to-gym-primary bg-clip-text text-transparent">Pages</span>
            </h2>
            <p className="mt-2 text-sm sm:text-base text-gray-300 max-w-2xl">
              Access in-depth dedicated portals for every facet of the Indian Powerlifting Federation.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1: Mission */}
            <Link
              href="/about/mission"
              className="group relative rounded-3xl border border-white/10 bg-gradient-to-b from-[#180503] to-[#0c0201] p-6 sm:p-7 shadow-xl hover:border-gym-primary/60 hover:shadow-[0_0_30px_rgba(230,80,27,0.25)] transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gym-primary/15 text-gym-primary border border-gym-primary/30 group-hover:scale-110 transition-transform">
                    <Target className="h-6 w-6" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gym-primary/80 bg-gym-primary/10 px-2.5 py-1 rounded-full">
                    Doctrine
                  </span>
                </div>
                <h3 className="font-heading text-xl font-bold uppercase text-white group-hover:text-gym-primary transition-colors mb-2">
                  Mission & Values
                </h3>
                <p className="text-xs text-gray-300 leading-relaxed">
                  National motto, core constitutional pillars, 100% clean sport mandate, and ethical athlete empowerment.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-bold text-gym-primary uppercase tracking-wider group-hover:text-white transition-colors">
                <span>View Mission Page</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1.5 transition-transform" />
              </div>
            </Link>

            {/* Card 2: Timeline */}
            <Link
              href="/about/timeline"
              className="group relative rounded-3xl border border-white/10 bg-gradient-to-b from-[#180503] to-[#0c0201] p-6 sm:p-7 shadow-xl hover:border-gym-primary/60 hover:shadow-[0_0_30px_rgba(230,80,27,0.25)] transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gym-primary/15 text-gym-primary border border-gym-primary/30 group-hover:scale-110 transition-transform">
                    <Calendar className="h-6 w-6" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gym-primary/80 bg-gym-primary/10 px-2.5 py-1 rounded-full">
                    1975 – 2026
                  </span>
                </div>
                <h3 className="font-heading text-xl font-bold uppercase text-white group-hover:text-gym-primary transition-colors mb-2">
                  Historic Timeline
                </h3>
                <p className="text-xs text-gray-300 leading-relaxed">
                  50+ years chronological journey from founding pioneers to 23 hosted international meets and world records.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-bold text-gym-primary uppercase tracking-wider group-hover:text-white transition-colors">
                <span>View Timeline Page</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1.5 transition-transform" />
              </div>
            </Link>

            {/* Card 3: Honors */}
            <Link
              href="/about/honors"
              className="group relative rounded-3xl border border-white/10 bg-gradient-to-b from-[#180503] to-[#0c0201] p-6 sm:p-7 shadow-xl hover:border-gym-primary/60 hover:shadow-[0_0_30px_rgba(230,80,27,0.25)] transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-500/15 text-yellow-400 border border-yellow-500/30 group-hover:scale-110 transition-transform">
                    <Trophy className="h-6 w-6" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-yellow-400/80 bg-yellow-500/10 px-2.5 py-1 rounded-full">
                    Hall of Fame
                  </span>
                </div>
                <h3 className="font-heading text-xl font-bold uppercase text-white group-hover:text-yellow-400 transition-colors mb-2">
                  Hall of Glory & Awards
                </h3>
                <p className="text-xs text-gray-300 leading-relaxed">
                  7 Arjuna Awardees, 1 Dronacharya Awardee, 900+ medals, and legends like Subrata Dutta & E.S. Bhaskaran.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-bold text-yellow-400 uppercase tracking-wider group-hover:text-white transition-colors">
                <span>View Honors Page</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1.5 transition-transform" />
              </div>
            </Link>

            {/* Card 4: Governance */}
            <Link
              href="/about/governance"
              className="group relative rounded-3xl border border-white/10 bg-gradient-to-b from-[#180503] to-[#0c0201] p-6 sm:p-7 shadow-xl hover:border-gym-primary/60 hover:shadow-[0_0_30px_rgba(230,80,27,0.25)] transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gym-primary/15 text-gym-primary border border-gym-primary/30 group-hover:scale-110 transition-transform">
                    <Building2 className="h-6 w-6" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gym-primary/80 bg-gym-primary/10 px-2.5 py-1 rounded-full">
                    Secretariat
                  </span>
                </div>
                <h3 className="font-heading text-xl font-bold uppercase text-white group-hover:text-gym-primary transition-colors mb-2">
                  National Governance
                </h3>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Alappuzha headquarters, 37 state associations, registered athletes, and executive leadership roster.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-bold text-gym-primary uppercase tracking-wider group-hover:text-white transition-colors">
                <span>View Governance Page</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1.5 transition-transform" />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ── 2. MISSION & CORE VALUES ── */}
      <section id="mission" className="py-16 md:py-24 border-b border-white/5 relative">
        <div className="mx-auto w-full max-w-7xl px-6 md:px-12 lg:px-16">
          
          <div className="mb-12 flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-2.5 rounded-full border border-gym-primary/35 bg-gym-primary/10 px-4 py-1.5 backdrop-blur-md shadow-[0_0_20px_rgba(230,80,27,0.2)] mb-3.5">
              <ShieldCheck className="h-4 w-4 text-gym-primary shrink-0" />
              <span className="text-xs sm:text-sm font-bold uppercase tracking-[0.25em] text-gym-primary">
                Core Doctrine & Values
              </span>
            </div>
            <h2 className="font-heading text-4xl sm:text-5xl md:text-6xl font-black uppercase leading-[1.04] tracking-tight text-white drop-shadow-xl">
              The Iron <span className="bg-gradient-to-r from-gym-primary via-[#ff7a45] to-gym-primary bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(230,80,27,0.5)]">Calling</span>
            </h2>
          </div>

          {/* Motto Spotlight Banner */}
          <div className="relative overflow-hidden rounded-3xl border border-gym-primary/40 bg-gradient-to-r from-[#280905] via-[#1a0503] to-[#280905] p-8 sm:p-12 text-center shadow-[0_15px_50px_rgba(0,0,0,0.6)] mb-12">
            <div className="absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-gym-primary to-transparent opacity-80" />
            <div className="text-xs font-bold uppercase tracking-[0.3em] text-gym-primary mb-3">Official Federation Motto</div>
            <p className="font-heading text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black uppercase text-white tracking-wide leading-tight">
              "{about.mission.motto}"
            </p>
          </div>

          {/* Mission & Vision Side-by-Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <div className="p-8 rounded-3xl border border-white/10 bg-[#110402]/60 backdrop-blur-xl shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-widest text-gym-primary mb-3">
                  <Sparkles className="h-4 w-4" /> Our Mission
                </div>
                <h3 className="font-heading text-2xl sm:text-3xl font-bold uppercase text-white mb-4">
                  Governing With Platform Integrity
                </h3>
                <p className="text-sm sm:text-base text-gray-300 leading-relaxed font-normal">
                  {about.mission.missionStatement}
                </p>
              </div>
            </div>

            <div className="p-8 rounded-3xl border border-white/10 bg-[#110402]/60 backdrop-blur-xl shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-widest text-gym-primary mb-3">
                  <Trophy className="h-4 w-4" /> Our Vision
                </div>
                <h3 className="font-heading text-2xl sm:text-3xl font-bold uppercase text-white mb-4">
                  Podium Supremacy On The Global Stage
                </h3>
                <p className="text-sm sm:text-base text-gray-300 leading-relaxed font-normal">
                  {about.mission.visionStatement}
                </p>
              </div>
            </div>
          </div>

          {/* 4 Pillars Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {about.mission.pillars.map((pillar, idx) => (
              <div 
                key={pillar.id}
                className="group relative p-6 rounded-2xl border border-white/10 bg-black/40 hover:border-gym-primary/50 hover:bg-[#150503] transition-all duration-300 flex flex-col justify-between"
              >
                <div className="absolute left-0 top-0 h-1 w-0 bg-gym-primary transition-all duration-300 group-hover:w-full rounded-t-2xl" />
                <div>
                  <div className="text-xs font-bold uppercase tracking-widest text-gym-primary mb-2">0{idx + 1}</div>
                  <h4 className="text-base font-bold text-white mb-2 group-hover:text-gym-primary transition-colors">
                    {pillar.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
                    {pillar.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Dedicated Mission Page CTA */}
          <div className="mt-10 flex justify-center">
            <Link
              href="/about/mission"
              className="group inline-flex items-center gap-2.5 rounded-full border border-gym-primary/50 bg-gym-primary/10 px-6 py-3 text-xs sm:text-sm font-bold uppercase tracking-wider text-gym-primary hover:bg-gym-primary hover:text-white hover:shadow-[0_0_25px_rgba(230,80,27,0.4)] transition-all"
            >
              <span>Explore Dedicated Mission & Doctrine Page</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

        </div>
      </section>

      {/* ── 3. HISTORIC MILESTONES TIMELINE ── */}
      <section id="timeline" className="py-16 md:py-24 border-b border-white/5 relative">
        <div className="mx-auto w-full max-w-7xl px-6 md:px-12 lg:px-16">
          
          <div className="mb-14 flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-2.5 rounded-full border border-gym-primary/35 bg-gym-primary/10 px-4 py-1.5 backdrop-blur-md shadow-[0_0_20px_rgba(230,80,27,0.2)] mb-3.5">
              <Calendar className="h-4 w-4 text-gym-primary shrink-0" />
              <span className="text-xs sm:text-sm font-bold uppercase tracking-[0.25em] text-gym-primary">
                Half A Century of Strength • 1975 — 2026
              </span>
            </div>
            <h2 className="font-heading text-4xl sm:text-5xl md:text-6xl font-black uppercase leading-[1.04] tracking-tight text-white drop-shadow-xl">
              Historic <span className="bg-gradient-to-r from-gym-primary via-[#ff7a45] to-gym-primary bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(230,80,27,0.5)]">Timeline</span>
            </h2>
            <p className="mt-3.5 max-w-xl text-sm sm:text-base text-gray-300 font-normal leading-relaxed">
              From visionary founding in 1975 to unbroken world records and international championships.
            </p>
          </div>

          {/* Timeline Vertical Stack */}
          <div className="relative mx-auto max-w-4xl">
            {/* Vertical glowing center bar */}
            <div className="absolute left-6 md:left-1/2 top-4 bottom-4 w-0.5 -translate-x-1/2 bg-gradient-to-b from-gym-primary via-gym-crimson to-gym-primary opacity-40 hidden sm:block" />

            <div className="flex flex-col gap-10 sm:gap-14">
              {about.timeline.map((item, idx) => {
                const isEven = idx % 2 === 0;
                return (
                  <div 
                    key={idx} 
                    className={`relative flex flex-col sm:flex-row items-start sm:items-center gap-6 ${
                      isEven ? "sm:flex-row-reverse" : ""
                    }`}
                  >
                    {/* Content Card */}
                    <div className="w-full sm:w-[45%]">
                      <div className="group relative p-6 sm:p-7 rounded-2xl border border-white/10 bg-[#110402]/80 backdrop-blur-xl shadow-xl hover:border-gym-primary/50 transition-all duration-300">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-heading text-2xl sm:text-3xl font-bold text-gym-primary tracking-wide">
                            {item.year}
                          </span>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Milestone</span>
                        </div>
                        <h3 className="text-base sm:text-lg font-bold text-white mb-2 group-hover:text-gym-primary transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-300 font-normal leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                    </div>

                    {/* Timeline Node Point (Desktop) */}
                    <div className="hidden sm:flex absolute left-1/2 -translate-x-1/2 h-8 w-8 items-center justify-center rounded-full bg-gym-black border-2 border-gym-primary shadow-[0_0_15px_rgba(230,80,27,0.7)] z-10">
                      <div className="h-2.5 w-2.5 rounded-full bg-gym-primary" />
                    </div>

                    {/* Empty spacer on opposite side for alternating layout */}
                    <div className="hidden sm:block sm:w-[45%]" />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dedicated Timeline Page CTA */}
          <div className="mt-12 flex justify-center">
            <Link
              href="/about/timeline"
              className="group inline-flex items-center gap-2.5 rounded-full border border-gym-primary/50 bg-gym-primary/10 px-6 py-3 text-xs sm:text-sm font-bold uppercase tracking-wider text-gym-primary hover:bg-gym-primary hover:text-white hover:shadow-[0_0_25px_rgba(230,80,27,0.4)] transition-all"
            >
              <span>Explore Complete 1975–2026 Timeline Page</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

        </div>
      </section>

      {/* ── 4. HALL OF FAME & HONORS ── */}
      <section id="honors" className="py-16 md:py-24 border-b border-white/5 relative">
        <div className="mx-auto w-full max-w-7xl px-6 md:px-12 lg:px-16">
          
          <div className="mb-14 flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-2.5 rounded-full border border-gym-primary/35 bg-gym-primary/10 px-4 py-1.5 backdrop-blur-md shadow-[0_0_20px_rgba(230,80,27,0.2)] mb-3.5">
              <Trophy className="h-4 w-4 text-gym-primary shrink-0" />
              <span className="text-xs sm:text-sm font-bold uppercase tracking-[0.25em] text-gym-primary">
                Presidential Honors & Global Supremacy
              </span>
            </div>
            <h2 className="font-heading text-4xl sm:text-5xl md:text-6xl font-black uppercase leading-[1.04] tracking-tight text-white drop-shadow-xl">
              Hall Of <span className="bg-gradient-to-r from-gym-primary via-[#ff7a45] to-gym-primary bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(230,80,27,0.5)]">Glory</span>
            </h2>
            <p className="mt-3.5 max-w-xl text-sm sm:text-base text-gray-300 font-normal leading-relaxed">
              Celebrating athletes and coaches recognized at the highest levels of the Indian Republic.
            </p>
          </div>

          {/* Honors Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {about.honors.map((honor) => (
              <div 
                key={honor.id}
                className="group relative p-8 rounded-3xl border border-gym-primary/30 bg-gradient-to-b from-[#1c0603] to-[#0d0201] text-center shadow-xl hover:border-gym-primary hover:shadow-[0_0_35px_rgba(230,80,27,0.25)] transition-all duration-300"
              >
                <div className="font-heading text-5xl sm:text-6xl lg:text-7xl font-black text-gym-primary tracking-tight mb-2 drop-shadow-[0_0_25px_rgba(230,80,27,0.5)]">
                  {honor.count}
                </div>
                <h3 className="font-heading text-xl sm:text-2xl font-bold uppercase text-white tracking-wide mb-3">
                  {honor.title}
                </h3>
                <p className="text-xs sm:text-sm text-gray-300 font-normal leading-relaxed">
                  {honor.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Historic World Record Spotlight Card */}
          <div className="rounded-3xl border border-white/10 bg-[#110402]/70 p-8 sm:p-10 backdrop-blur-xl shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gym-primary/10 border border-gym-primary/40 shadow-[0_0_25px_rgba(230,80,27,0.3)]">
                <Medal className="h-10 w-10 text-gym-primary" />
              </div>
              <div>
                <div className="inline-block rounded-full bg-gym-primary/20 px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest text-gym-primary mb-2">
                  Historic Benchmark
                </div>
                <h4 className="font-heading text-2xl sm:text-3xl font-bold uppercase text-white tracking-wide">
                  Sri E.S. Bhaskaran — 260 KG Deadlift
                </h4>
                <p className="text-xs sm:text-sm text-gray-300 mt-1 max-w-2xl leading-relaxed">
                  Lifting more than 5x his bodyweight in the 52 KG class at the IPF World Championships, setting an unbroken legacy of Indian deadlift mastery.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
              <Link
                href="/about/honors"
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border border-yellow-500/50 bg-yellow-500/10 px-5 py-3 text-xs font-bold uppercase tracking-wider text-yellow-400 hover:bg-yellow-500 hover:text-black transition-all shadow-[0_0_15px_rgba(234,179,8,0.2)]"
              >
                <span>Hall of Glory Page</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/records"
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-gym-primary px-5 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-[0_0_20px_rgba(230,80,27,0.4)] hover:brightness-110 transition-all"
              >
                View Records <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* ── 5. GOVERNANCE & SECRETARIAT DIRECTORY ── */}
      <section id="governance" className="py-16 md:py-24 border-b border-white/5 relative">
        <div className="mx-auto w-full max-w-7xl px-6 md:px-12 lg:px-16">
          
          <div className="mb-14 flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-2.5 rounded-full border border-gym-primary/35 bg-gym-primary/10 px-4 py-1.5 backdrop-blur-md shadow-[0_0_20px_rgba(230,80,27,0.2)] mb-3.5">
              <Building2 className="h-4 w-4 text-gym-primary shrink-0" />
              <span className="text-xs sm:text-sm font-bold uppercase tracking-[0.25em] text-gym-primary">
                Governance & Secretariat
              </span>
            </div>
            <h2 className="font-heading text-4xl sm:text-5xl md:text-6xl font-black uppercase leading-[1.04] tracking-tight text-white drop-shadow-xl">
              National <span className="bg-gradient-to-r from-gym-primary via-[#ff7a45] to-gym-primary bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(230,80,27,0.5)]">Administration</span>
            </h2>
            <p className="mt-3.5 max-w-xl text-sm sm:text-base text-gray-300 font-normal leading-relaxed">
              Headquartered at Alappuzha, Kerala, overseeing 37 affiliated state units and central services boards.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Headquarters Card */}
            <div className="p-8 rounded-3xl border border-white/10 bg-[#110402]/60 backdrop-blur-xl shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gym-primary/10 border border-gym-primary/30 text-gym-primary mb-5">
                  <MapPin className="h-6 w-6" />
                </div>
                <h3 className="font-heading text-xl font-bold uppercase text-white mb-2">National Secretariat</h3>
                <p className="text-sm text-gray-300 leading-relaxed mb-4">
                  {about.governance.headquarters}
                </p>
              </div>
              <div className="pt-4 border-t border-white/10 text-xs text-gray-400 font-medium">
                Registered Society & National Sports Federation
              </div>
            </div>

            {/* Official Correspondence Card */}
            <div className="p-8 rounded-3xl border border-white/10 bg-[#110402]/60 backdrop-blur-xl shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gym-primary/10 border border-gym-primary/30 text-gym-primary mb-5">
                  <Mail className="h-6 w-6" />
                </div>
                <h3 className="font-heading text-xl font-bold uppercase text-white mb-2">Official Inquiries</h3>
                <p className="text-sm text-gray-300 leading-relaxed mb-2">
                  <strong className="text-white">Email:</strong>{" "}
                  <a href={`mailto:${about.governance.secretariatEmail}`} className="text-gym-primary hover:underline">
                    {about.governance.secretariatEmail}
                  </a>
                </p>
                <p className="text-sm text-gray-300 leading-relaxed">
                  <strong className="text-white">Phone:</strong>{" "}
                  <a href={`tel:${about.governance.secretariatPhone.replace(/[^0-9+]/g, '')}`} className="text-gray-300 hover:text-white">
                    {about.governance.secretariatPhone}
                  </a>
                </p>
              </div>
              <div className="pt-4 border-t border-white/10 text-xs text-gray-400 font-medium">
                Mon - Sat: 10:00 AM - 05:00 PM IST
              </div>
            </div>

            {/* Affiliations & Reach Card */}
            <div className="p-8 rounded-3xl border border-white/10 bg-[#110402]/60 backdrop-blur-xl shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gym-primary/10 border border-gym-primary/30 text-gym-primary mb-5">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="font-heading text-xl font-bold uppercase text-white mb-2">National Footprint</h3>
                <div className="space-y-2 mt-3">
                  <div className="flex items-center justify-between text-sm py-1 border-b border-white/5">
                    <span className="text-gray-400">State Units & Boards:</span>
                    <span className="font-bold text-white">{about.governance.affiliatedUnitsCount}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm py-1 border-b border-white/5">
                    <span className="text-gray-400">Athletes Registered:</span>
                    <span className="font-bold text-gym-primary">{about.governance.registeredAthletes}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm py-1">
                    <span className="text-gray-400">Affiliation:</span>
                    <span className="font-bold text-white">IPF & APF</span>
                  </div>
                </div>
              </div>
              <div className="pt-4 border-t border-white/10 text-xs text-gray-400 font-medium">
                Pan-India Representation
              </div>
            </div>
          </div>

          {/* Dedicated Governance Page CTA */}
          <div className="mt-12 flex justify-center">
            <Link
              href="/about/governance"
              className="group inline-flex items-center gap-2.5 rounded-full border border-gym-primary/50 bg-gym-primary/10 px-6 py-3 text-xs sm:text-sm font-bold uppercase tracking-wider text-gym-primary hover:bg-gym-primary hover:text-white hover:shadow-[0_0_25px_rgba(230,80,27,0.4)] transition-all"
            >
              <span>Open Dedicated Secretariat & Governance Page</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

        </div>
      </section>

    </div>
  );
}
