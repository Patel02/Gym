import { Metadata } from "next";
import fs from "fs/promises";
import path from "path";
import Link from "next/link";
import { 
  Landmark, 
  ChevronRight, 
  ShieldCheck, 
  Zap, 
  Trophy, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight,
  HeartHandshake,
  Target,
  Eye
} from "lucide-react";
import { AboutData } from "@/components/admin/AboutEditor";
import WhatsAppIcon from "@/components/ui/WhatsAppIcon";

export const metadata: Metadata = {
  title: "Mission, Vision & Core Values • Indian Powerlifting Federation",
  description: "Our constitutional doctrine: Health and Strength for the Nation through the Iron Games. Committed to 100% drug-free powerlifting across India.",
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

export default async function MissionPage() {
  const about = await getAboutData();
  const WHATSAPP_PHONE = "917043951377";

  return (
    <div className="min-h-screen bg-gym-black text-white pt-28 sm:pt-32 lg:pt-36 pb-20 relative overflow-hidden">
      
      {/* Ambient Glows */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-gym-primary/15 blur-[120px]" />
      <div className="pointer-events-none absolute top-1/2 -right-40 h-96 w-96 rounded-full bg-emerald-500/10 blur-[130px]" />

      <div className="relative mx-auto max-w-7xl px-6 md:px-12">
        
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400 mb-6">
          <Link href="/" className="hover:text-gym-primary transition-colors">Home</Link>
          <ChevronRight className="h-3 w-3 text-gray-600" />
          <Link href="/about" className="hover:text-gym-primary transition-colors">About</Link>
          <ChevronRight className="h-3 w-3 text-gray-600" />
          <span className="text-gym-primary">Mission & Values</span>
        </div>

        {/* Hero */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-gym-primary/30 bg-gym-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-gym-primary mb-4 shadow-[0_0_20px_rgba(230,80,27,0.2)]">
            <Target className="h-3.5 w-3.5" />
            <span>Constitutional Doctrine</span>
          </div>

          <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight text-white drop-shadow-xl">
            Our Mission & <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-gym-primary via-[#ff7a45] to-gym-primary bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(230,80,27,0.5)]">
              Core Doctrine
            </span>
          </h1>

          <p className="mt-4 text-base sm:text-lg font-bold text-gray-200 tracking-wide">
            "{about.mission.motto}"
          </p>
        </div>

        {/* Mission & Vision Dual Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {/* Mission Card */}
          <div className="rounded-3xl border border-gym-primary/30 bg-gradient-to-br from-[#1c0603] to-[#0d0201] p-8 sm:p-10 shadow-2xl relative overflow-hidden">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gym-primary/20 text-gym-primary border border-gym-primary/40">
                <Target className="h-6 w-6" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-gym-primary">Our Mandate</span>
                <h3 className="font-heading text-2xl sm:text-3xl font-bold uppercase text-white">The Mission</h3>
              </div>
            </div>
            <p className="text-sm sm:text-base text-gray-300 leading-relaxed font-normal">
              {about.mission.missionStatement}
            </p>
          </div>

          {/* Vision Card */}
          <div className="rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-[#06180f] to-[#030d08] p-8 sm:p-10 shadow-2xl relative overflow-hidden">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                <Eye className="h-6 w-6" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">Future Horizon</span>
                <h3 className="font-heading text-2xl sm:text-3xl font-bold uppercase text-white">The Vision</h3>
              </div>
            </div>
            <p className="text-sm sm:text-base text-gray-300 leading-relaxed font-normal">
              {about.mission.visionStatement}
            </p>
          </div>
        </div>

        {/* 4 Core Pillars */}
        <div className="mb-16">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="text-xs font-bold uppercase tracking-widest text-gym-primary mb-2">Pillars of Integrity</div>
            <h3 className="font-heading text-3xl sm:text-4xl font-black uppercase text-white">
              The 4 Pillars of Federation Culture
            </h3>
            <p className="text-xs sm:text-sm text-gray-300 mt-1">
              Every meet, certification, and athlete program is governed strictly by these four foundational principles.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {about.mission.pillars.map((pillar) => (
              <div
                key={pillar.id}
                className="rounded-3xl border border-white/10 bg-[#120402]/80 p-6 backdrop-blur-xl hover:border-gym-primary/50 transition-all flex flex-col justify-between shadow-xl"
              >
                <div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gym-primary/15 text-gym-primary border border-gym-primary/30 mb-4">
                    {pillar.icon === "ShieldCheck" && <ShieldCheck className="h-5 w-5" />}
                    {pillar.icon === "Zap" && <Zap className="h-5 w-5" />}
                    {pillar.icon === "Trophy" && <Trophy className="h-5 w-5" />}
                    {pillar.icon === "Landmark" && <Landmark className="h-5 w-5" />}
                  </div>
                  <h4 className="font-heading text-lg font-bold uppercase text-white mb-2">
                    {pillar.title}
                  </h4>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    {pillar.desc}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-white/10 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Constitutional Standard</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Navigation & CTA */}
        <div className="rounded-3xl border border-gym-primary/30 bg-gradient-to-br from-[#1b0603] to-[#0c0201] p-8 sm:p-10 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-gym-primary mb-2">Next Chapter</div>
            <h3 className="font-heading text-2xl sm:text-3xl font-bold uppercase text-white">
              Explore 50+ Years of Historic Milestones
            </h3>
            <p className="text-xs sm:text-sm text-gray-300 mt-1 max-w-xl">
              From our 1975 founding in Kolkata to Asian Championship golds and World Games podiums, discover our history.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href="/about/timeline"
              className="flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3.5 font-heading text-xs sm:text-sm font-bold uppercase tracking-wider text-white hover:bg-white/10 hover:border-gym-primary transition-all"
            >
              <span>View Historic Timeline</span>
              <ArrowRight className="h-4 w-4 text-gym-primary" />
            </Link>

            <a
              href={`https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent("Hi Coaches Akash & Tanvi, I would like to learn more about the Indian Powerlifting Federation's mission and athlete affiliation.")}`}
              target="_blank"
              rel="noreferrer"
              className="group flex items-center gap-2.5 rounded-full bg-gradient-to-r from-emerald-600 to-emerald-500 px-6 py-3.5 font-heading text-xs sm:text-sm font-bold uppercase tracking-wider text-white shadow-lg hover:brightness-105 transition-all cursor-pointer"
            >
              <WhatsAppIcon variant="badge" className="h-5 w-5" />
              <span>Connect on WhatsApp</span>
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
