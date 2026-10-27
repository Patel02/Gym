import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { 
  FileText, 
  Download, 
  ChevronRight, 
  Calendar, 
  Sparkles, 
  Search, 
  ExternalLink,
  ShieldAlert,
  ArrowRight
} from "lucide-react";
import Link from "next/link";
import fs from "fs/promises";
import path from "path";
import WhatsAppIcon from "@/components/ui/WhatsAppIcon";
import { PageNavigation } from "@/components/ui/PageNavigation";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Official Circulars & Platform Documents | Indian Powerlifting Federation",
  description: "Download official IPF meet entry circulars, anti-doping guidelines, technical rulebooks, and federation notices.",
};

const WHATSAPP_PHONE = "917043951377";
const EVENTS_FILE_PATH = path.join(process.cwd(), "src", "data", "federation-events.json");

interface CircularDoc {
  id: string;
  title: string;
  date: string;
  fileUrl: string;
  source: "cms" | "federation";
}

async function getPublishedCirculars(): Promise<CircularDoc[]> {
  const docs: CircularDoc[] = [];

  // 1. Fetch from database (CMS uploads)
  try {
    const dbCirculars = await prisma.circular.findMany({
      orderBy: { publishedAt: "desc" },
    });
    for (const c of dbCirculars) {
      docs.push({
        id: c.id,
        title: c.title,
        date: new Date(c.publishedAt).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }).toUpperCase(),
        fileUrl: c.fileUrl,
        source: "cms"
      });
    }
  } catch (err) {
    console.error("Failed to query database circulars:", err);
  }

  // 2. Fetch from federation-events.json announcements
  try {
    const raw = await fs.readFile(EVENTS_FILE_PATH, "utf-8");
    const parsed = JSON.parse(raw);
    const announcements = parsed.announcements || [];
    for (const a of announcements) {
      if (!docs.some(d => d.title.toLowerCase() === a.title.toLowerCase())) {
        docs.push({
          id: String(a.id),
          title: a.title,
          date: a.date || "RECENT",
          fileUrl: a.fileUrl || "/circulars",
          source: "federation"
        });
      }
    }
  } catch {}

  return docs;
}

export default async function CircularsPage() {
  const circulars = await getPublishedCirculars();

  return (
    <div className="min-h-screen bg-gym-black text-white pt-32 sm:pt-36 lg:pt-40 pb-20 relative overflow-hidden">
      
      {/* ── Ambient Background Glows ── */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-gym-primary/15 blur-[120px]" />
      <div className="pointer-events-none absolute top-1/2 -right-40 h-96 w-96 rounded-full bg-emerald-500/10 blur-[130px]" />

      <div className="relative mx-auto max-w-5xl px-6 md:px-12">
        
        {/* ── Breadcrumb & Navigation ── */}
        <PageNavigation
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "Championships", href: "/championships" },
            { label: "Official Circulars & Forms" },
          ]}
          badge="Official Registry"
          className="mb-8"
        />

        {/* ── Hero Section ── */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-gym-primary/30 bg-gym-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-gym-primary mb-4 shadow-[0_0_20px_rgba(230,80,27,0.2)]">
            <FileText className="h-3.5 w-3.5" />
            <span>Official Federation Secretariat Documents</span>
          </div>

          <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight text-white drop-shadow-xl">
            Official <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-gym-primary via-[#ff7a45] to-gym-primary bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(230,80,27,0.5)]">
              Circulars & Forms
            </span>
          </h1>

          <p className="mt-4 text-sm sm:text-base text-gray-300 leading-relaxed font-normal">
            Download official IPF technical rulebooks, National Championship entry circulars, WADA anti-doping notices, and state affiliation forms.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <a
              href={`https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent("Hi Coaches Akash & Tanvi, I have a query regarding official championship circulars and entries.")}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2.5 rounded-full bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600 px-6 py-3 text-xs sm:text-sm font-bold uppercase tracking-wider text-white shadow-[0_0_25px_rgba(16,185,129,0.4)] hover:brightness-105 transition-all cursor-pointer border border-emerald-400/40"
            >
              <WhatsAppIcon variant="badge" className="h-5 w-5" />
              <span>Circular Desk: +91 7043951377</span>
            </a>

            <Link
              href="/championships"
              className="flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3 text-xs sm:text-sm font-bold uppercase tracking-wider text-white hover:bg-white/10 hover:border-gym-primary transition-all"
            >
              <Calendar className="h-4 w-4 text-gym-primary" />
              <span>View Meet Calendar</span>
            </Link>
          </div>
        </div>

        {/* ── Document List Header ── */}
        <div className="mb-6 flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-white/10">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400">
            <Sparkles className="h-4 w-4 text-gym-primary" />
            <span>Available Documents ({circulars.length})</span>
          </div>
          <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
            100% Ratified & Live
          </span>
        </div>

        {/* ── Documents Cards Grid ── */}
        {circulars.length === 0 ? (
          <div className="text-center py-16 rounded-3xl border border-white/10 bg-[#120402]/80 p-8 shadow-2xl">
            <FileText className="h-12 w-12 text-gray-600 mx-auto mb-3" />
            <h4 className="font-heading text-xl font-bold uppercase text-gray-300">No Documents Published Yet</h4>
            <p className="text-xs text-gray-500 mt-1">Please check back soon or contact the secretariat desk.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {circulars.map((doc, idx) => (
              <div
                key={doc.id || idx}
                className="group relative rounded-2xl border border-white/10 bg-[#120402]/80 p-5 sm:p-6 backdrop-blur-xl hover:border-gym-primary/50 transition-all duration-300 shadow-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-gym-primary/10 rounded-full blur-xl group-hover:bg-gym-primary/20 transition-all pointer-events-none" />

                <div className="flex items-start gap-3.5 min-w-0">
                  <div className="p-3 rounded-xl bg-gym-primary/15 border border-gym-primary/30 text-gym-primary shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest text-gym-primary mb-1">
                      <span>{doc.date}</span>
                      <span className="text-gray-600">•</span>
                      <span>OFFICIAL FEDERATION CIRCULAR</span>
                    </div>
                    <h3 className="font-heading text-base sm:text-lg font-bold uppercase text-white group-hover:text-gym-primary transition-colors">
                      {doc.title}
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">
                      Ratified for athlete registration, platform verification & anti-doping compliance.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-gym-primary to-gym-red px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-md hover:brightness-110 transition-all cursor-pointer"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download PDF</span>
                  </a>

                  <a
                    href={`https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(`Hi Coaches, I need assistance regarding the circular: "${doc.title}".`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 rounded-xl border border-white/10 bg-white/5 text-gray-300 hover:text-emerald-400 hover:border-emerald-500/40 transition-all"
                    title="Inquire on WhatsApp"
                  >
                    <WhatsAppIcon variant="badge" className="h-4 w-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Help / Inquiries Banner ── */}
        <div className="mt-14 rounded-3xl border border-white/10 bg-[#160604]/80 p-8 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h4 className="font-heading text-xl font-bold uppercase text-white">
              Need Help With Championship Entry Forms?
            </h4>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">
              Contact our national secretariat desk for team entry submissions, anti-doping therapeutic use exemptions (TUE), and rule inquiries.
            </p>
          </div>

          <a
            href={`https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent("Hi Coaches, I need official assistance with championship forms & entries.")}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 rounded-full bg-emerald-600 hover:bg-emerald-500 px-6 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-lg shrink-0 transition-all"
          >
            <WhatsAppIcon variant="badge" className="h-4 w-4" />
            <span>Chat With Secretariat</span>
          </a>
        </div>

      </div>
    </div>
  );
}