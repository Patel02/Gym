import { Metadata } from "next";
import fs from "fs/promises";
import path from "path";
import Link from "next/link";
import { 
  Trophy, 
  ChevronRight, 
  Medal, 
  Award, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight,
  Globe2,
  Users
} from "lucide-react";
import { AboutData } from "@/components/admin/AboutEditor";
import WhatsAppIcon from "@/components/ui/WhatsAppIcon";

export const metadata: Metadata = {
  title: "Hall of Glory & National Honors • Indian Powerlifting Federation",
  description: "Recognizing 7 Arjuna Awardees, 1 Dronacharya Awardee, and over 900+ international medals won by Indian powerlifters.",
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

export default async function HonorsPage() {
  const about = await getAboutData();
  const WHATSAPP_PHONE = "917043951377";

  return (
    <div className="min-h-screen bg-gym-black text-white pt-28 sm:pt-32 lg:pt-36 pb-20 relative overflow-hidden">
      
      {/* Ambient Glows */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-yellow-500/15 blur-[120px]" />
      <div className="pointer-events-none absolute top-1/2 -right-40 h-96 w-96 rounded-full bg-gym-primary/15 blur-[130px]" />

      <div className="relative mx-auto max-w-7xl px-6 md:px-12">
        
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400 mb-6">
          <Link href="/" className="hover:text-gym-primary transition-colors">Home</Link>
          <ChevronRight className="h-3 w-3 text-gray-600" />
          <Link href="/about" className="hover:text-gym-primary transition-colors">About</Link>
          <ChevronRight className="h-3 w-3 text-gray-600" />
          <span className="text-gym-primary">Hall of Glory & Awards</span>
        </div>

        {/* Hero */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-yellow-400 mb-4 shadow-[0_0_20px_rgba(234,179,8,0.2)]">
            <Award className="h-3.5 w-3.5" />
            <span>National Hall of Fame</span>
          </div>

          <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight text-white drop-shadow-xl">
            Hall of Glory & <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(234,179,8,0.5)]">
              National Honors
            </span>
          </h1>

          <p className="mt-4 text-sm sm:text-base md:text-lg text-gray-300 leading-relaxed font-normal">
            Celebrating legendary athletes and coaches whose extraordinary strength and unyielding discipline earned India's highest sporting honors.
          </p>
        </div>

        {/* 4 Core Honors Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {about.honors.map((honor) => (
            <div
              key={honor.id}
              className="rounded-3xl border border-white/10 bg-[#120402]/80 p-7 backdrop-blur-xl hover:border-yellow-500/50 transition-all flex flex-col justify-between shadow-xl text-center relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/10 rounded-full blur-xl group-hover:bg-yellow-500/20 transition-all" />

              <div>
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 mb-4 shadow-[0_0_15px_rgba(234,179,8,0.2)]">
                  {honor.id === "arjuna" && <Award className="h-7 w-7" />}
                  {honor.id === "dronacharya" && <Trophy className="h-7 w-7" />}
                  {honor.id === "medals" && <Medal className="h-7 w-7" />}
                  {honor.id === "hosted" && <Globe2 className="h-7 w-7" />}
                </div>

                <div className="font-heading text-4xl sm:text-5xl font-black text-white group-hover:text-yellow-400 transition-colors">
                  {honor.count}
                </div>
                <h3 className="font-heading text-lg font-bold uppercase text-white mt-1 mb-2">
                  {honor.title}
                </h3>
                <p className="text-xs text-gray-300 leading-relaxed">
                  {honor.desc}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 text-[11px] font-bold uppercase tracking-wider text-yellow-400/80">
                Official Recognition
              </div>
            </div>
          ))}
        </div>

        {/* Legendary Awardees Showcase */}
        <div className="rounded-3xl border border-white/10 bg-[#120402]/80 p-8 sm:p-10 backdrop-blur-xl mb-16 shadow-2xl">
          <div className="text-xs font-bold uppercase tracking-widest text-gym-primary mb-2">Presidential Citations</div>
          <h3 className="font-heading text-2xl sm:text-3xl font-bold uppercase text-white mb-6">
            Pinnacle Arjuna & Dronacharya Laureates
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[
              { name: "Sri Subrata Dutta", award: "Dronacharya Awardee", feat: "Father of modern Indian powerlifting, mentoring multiple world record holders." },
              { name: "Sri E.S. Bhaskaran", award: "Arjuna Awardee", feat: "World record holder with an astonishing 260 KG Deadlift in the 52 KG class (1984)." },
              { name: "Sri P.J. Joseph", award: "Arjuna Awardee", feat: "Pioneer Asian Champion and legendary administrator advancing drug-free sport." },
            ].map((hero, i) => (
              <div key={i} className="rounded-2xl border border-white/10 bg-white/5 p-6 hover:border-yellow-500/30 transition-all">
                <div className="text-xs font-bold uppercase tracking-wider text-yellow-400 mb-1">{hero.award}</div>
                <div className="font-heading text-xl font-bold text-white">{hero.name}</div>
                <p className="text-xs text-gray-300 mt-2 leading-relaxed">{hero.feat}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Navigation & CTA */}
        <div className="rounded-3xl border border-gym-primary/30 bg-gradient-to-br from-[#1b0603] to-[#0c0201] p-8 sm:p-10 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-gym-primary mb-2">Next Chapter</div>
            <h3 className="font-heading text-2xl sm:text-3xl font-bold uppercase text-white">
              National Secretariat & Executive Governance
            </h3>
            <p className="text-xs sm:text-sm text-gray-300 mt-1 max-w-xl">
              Learn about our national headquarters, state affiliations across 37 units, and administrative leadership.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href="/about/governance"
              className="flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3.5 font-heading text-xs sm:text-sm font-bold uppercase tracking-wider text-white hover:bg-white/10 hover:border-gym-primary transition-all"
            >
              <span>View Secretariat & Governance</span>
              <ArrowRight className="h-4 w-4 text-gym-primary" />
            </Link>

            <a
              href={`https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent("Hi Coaches Akash & Tanvi, I am inspired by the Indian Powerlifting Federation's Hall of Glory and athletes.")}`}
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
