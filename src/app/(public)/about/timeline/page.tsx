import { Metadata } from "next";
import fs from "fs/promises";
import path from "path";
import Link from "next/link";
import { 
  Calendar, 
  ChevronRight, 
  Award, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight,
  Flame,
  Medal
} from "lucide-react";
import { AboutData } from "@/components/admin/AboutEditor";
import WhatsAppIcon from "@/components/ui/WhatsAppIcon";

export const metadata: Metadata = {
  title: "Historic Timeline (1975–2026) • Indian Powerlifting Federation",
  description: "Chronological journey of powerlifting in India. Over 50 years of historic achievements, world records, and national milestones.",
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

export default async function TimelinePage() {
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
          <span className="text-gym-primary">Historic Timeline</span>
        </div>

        {/* Hero */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-gym-primary/30 bg-gym-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-gym-primary mb-4 shadow-[0_0_20px_rgba(230,80,27,0.2)]">
            <Calendar className="h-3.5 w-3.5" />
            <span>50+ Years of Sporting Heritage</span>
          </div>

          <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight text-white drop-shadow-xl">
            Historic Timeline <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-gym-primary via-[#ff7a45] to-gym-primary bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(230,80,27,0.5)]">
              (1975 – 2026)
            </span>
          </h1>

          <p className="mt-4 text-sm sm:text-base md:text-lg text-gray-300 leading-relaxed font-normal">
            From the pioneering visionaries of 1975 to international glory across 23 hosted championships, trace the chronological evolution of powerlifting in India.
          </p>
        </div>

        {/* Timeline Stream */}
        <div className="relative max-w-4xl mx-auto mb-16">
          {/* Vertical central glowing line */}
          <div className="absolute left-4 sm:left-1/2 top-4 bottom-4 -translate-x-1/2 w-0.5 bg-gradient-to-b from-gym-primary via-gym-primary/40 to-transparent" />

          <div className="space-y-12">
            {about.timeline.map((item, idx) => {
              const isEven = idx % 2 === 0;
              return (
                <div 
                  key={idx} 
                  className={`relative flex flex-col sm:flex-row items-start sm:items-center ${
                    isEven ? "sm:flex-row-reverse" : ""
                  } gap-6 sm:gap-12 pl-12 sm:pl-0`}
                >
                  {/* Central Node Circle */}
                  <div className="absolute left-4 sm:left-1/2 -translate-x-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-[#120402] border-2 border-gym-primary shadow-[0_0_15px_rgba(230,80,27,0.6)] z-10">
                    <span className="h-2.5 w-2.5 rounded-full bg-gym-primary" />
                  </div>

                  {/* Content Card */}
                  <div className="w-full sm:w-1/2">
                    <div className="rounded-3xl border border-white/10 bg-[#120402]/80 p-6 sm:p-7 backdrop-blur-xl hover:border-gym-primary/50 transition-all shadow-xl">
                      <div className="inline-flex items-center gap-2 rounded-full border border-gym-primary/30 bg-gym-primary/15 px-3 py-1 text-xs font-black text-gym-primary mb-3">
                        <Calendar className="h-3 w-3" />
                        <span>{item.year}</span>
                      </div>
                      <h3 className="font-heading text-xl sm:text-2xl font-bold uppercase text-white mb-2">
                        {item.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-normal">
                        {item.desc}
                      </p>
                    </div>
                  </div>

                  {/* Spacer for opposite column on desktop */}
                  <div className="hidden sm:block sm:w-1/2" />
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Navigation & CTA */}
        <div className="rounded-3xl border border-gym-primary/30 bg-gradient-to-br from-[#1b0603] to-[#0c0201] p-8 sm:p-10 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-gym-primary mb-2">National Accolades</div>
            <h3 className="font-heading text-2xl sm:text-3xl font-bold uppercase text-white">
              Discover Our Hall of Glory & Awardees
            </h3>
            <p className="text-xs sm:text-sm text-gray-300 mt-1 max-w-xl">
              Honoring 7 Arjuna Awardees, 1 Dronacharya Awardee, and over 900+ international medals won for the nation.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href="/about/honors"
              className="flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3.5 font-heading text-xs sm:text-sm font-bold uppercase tracking-wider text-white hover:bg-white/10 hover:border-gym-primary transition-all"
            >
              <span>View Hall of Glory</span>
              <ArrowRight className="h-4 w-4 text-gym-primary" />
            </Link>

            <a
              href={`https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent("Hi Coaches Akash & Tanvi, I am fascinated by the Indian Powerlifting Federation's historic timeline and achievements.")}`}
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
