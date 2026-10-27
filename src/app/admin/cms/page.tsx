import { auth } from "@/auth";
import { CircularUploadForm } from "@/components/admin/CircularUploadForm";
import { CircularDeleteButton } from "@/components/admin/CircularDeleteButton";
import { prisma } from "@/lib/prisma";
import { 
  FileText, 
  ExternalLink, 
  Globe, 
  Download, 
  Calendar, 
  Sparkles,
  LayoutGrid
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PageNavigation } from "@/components/ui/PageNavigation";

export const revalidate = 30;

import { unstable_cache } from "next/cache";

const getCachedCirculars = unstable_cache(
  async () => {
    return await prisma.circular
      .findMany({
        orderBy: { publishedAt: "desc" },
        take: 50,
      })
      .catch((err) => {
        console.warn("[CMSPage] Failed to fetch circulars:", err?.message || err);
        return [];
      });
  },
  ["admin-circulars-cache"],
  { revalidate: 30, tags: ["circulars"] }
);

export default async function CMSPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN" && session?.user?.role !== "SUPER_ADMIN") {
    redirect("/dashboard");
  }

  const circulars = await getCachedCirculars();

  return (
    <div className="min-h-screen bg-gym-black px-6 pb-20 pt-32 sm:pt-36 lg:pt-40 text-white md:px-12">
      <div className="mx-auto max-w-5xl">
        {/* Navigation Breadcrumb */}
        <PageNavigation
          backHref="/admin"
          backLabel="Back to Command Center"
          breadcrumbs={[
            { label: "Admin Hub", href: "/admin" },
            { label: "Document & Circulars CMS" },
          ]}
          badge="CMS Engine"
          className="mb-8"
        />

        {/* ── Top Header ── */}
        <div className="mb-8 rounded-3xl border border-white/10 bg-[#120402]/90 p-6 md:p-8 backdrop-blur-xl shadow-2xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gym-primary mb-1">
              <FileText className="h-4 w-4" />
              <span>Official Federation Document Publishing Portal</span>
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl font-black uppercase text-white">
              Document <span className="text-gym-primary">Portal</span> (CMS)
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">
              Upload and publish official IPF rulebooks, meet invitations, entry forms, and results PDFs.
            </p>
          </div>

          <Link
            href="/circulars"
            target="_blank"
            className="inline-flex items-center gap-2 rounded-full border border-gym-primary/40 bg-gym-primary/10 px-5 py-2.5 text-xs font-black uppercase tracking-wider text-gym-primary hover:bg-gym-primary hover:text-white transition-all shadow-[0_0_15px_rgba(230,80,27,0.2)] shrink-0"
          >
            <Globe className="h-4 w-4" />
            <span>View Public /circulars Page</span>
          </Link>
        </div>

        {/* ── Where Are Documents Shown? Explainer Card ── */}
        <div className="mb-10 rounded-3xl border border-white/10 bg-[#160604]/70 p-6 backdrop-blur-xl">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gym-primary mb-3">
            <Sparkles className="h-4 w-4" />
            <span>Where do published documents appear on the website?</span>
          </div>
          <p className="text-xs text-gray-300 leading-relaxed mb-4">
            Whenever you upload a document below, it is <strong className="text-white">automatically made live</strong> across all 4 key public sections:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <Link
              href="/circulars"
              target="_blank"
              className="group flex items-start gap-3 p-4 rounded-2xl border border-white/10 bg-black/40 hover:border-gym-primary/50 hover:bg-gym-primary/5 transition-all"
            >
              <div className="p-2.5 rounded-xl bg-gym-primary/10 border border-gym-primary/30 text-gym-primary group-hover:scale-105 transition-transform">
                <Globe className="h-4 w-4" />
              </div>
              <div>
                <div className="text-xs font-black uppercase text-white group-hover:text-gym-primary transition-colors flex items-center gap-1.5">
                  <span>1. Official Circulars Page</span>
                  <ExternalLink className="h-3 w-3 text-gray-500 group-hover:text-gym-primary" />
                </div>
                <div className="text-[11px] text-gray-400 mt-0.5">
                  <span className="text-gym-primary font-semibold">/circulars</span> • Complete downloadable archive for athletes and coaches.
                </div>
              </div>
            </Link>

            <Link
              href="/#events"
              target="_blank"
              className="group flex items-start gap-3 p-4 rounded-2xl border border-white/10 bg-black/40 hover:border-gym-primary/50 hover:bg-gym-primary/5 transition-all"
            >
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 group-hover:scale-105 transition-transform">
                <LayoutGrid className="h-4 w-4" />
              </div>
              <div>
                <div className="text-xs font-black uppercase text-white group-hover:text-gym-primary transition-colors flex items-center gap-1.5">
                  <span>2. Homepage Events Section</span>
                  <ExternalLink className="h-3 w-3 text-gray-500 group-hover:text-gym-primary" />
                </div>
                <div className="text-[11px] text-gray-400 mt-0.5">
                  <span className="text-emerald-400 font-semibold">/#events</span> • Prominently featured in the "Official Circulars" column.
                </div>
              </div>
            </Link>

            <Link
              href="/championships"
              target="_blank"
              className="group flex items-start gap-3 p-4 rounded-2xl border border-white/10 bg-black/40 hover:border-gym-primary/50 hover:bg-gym-primary/5 transition-all"
            >
              <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 group-hover:scale-105 transition-transform">
                <Calendar className="h-4 w-4" />
              </div>
              <div>
                <div className="text-xs font-black uppercase text-white group-hover:text-gym-primary transition-colors flex items-center gap-1.5">
                  <span>3. National Meet Calendar</span>
                  <ExternalLink className="h-3 w-3 text-gray-500 group-hover:text-gym-primary" />
                </div>
                <div className="text-[11px] text-gray-400 mt-0.5">
                  <span className="text-purple-400 font-semibold">/championships</span> • Linked on each championship meet card.
                </div>
              </div>
            </Link>

            <div className="flex items-start gap-3 p-4 rounded-2xl border border-white/10 bg-black/40">
              <div className="p-2.5 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-400">
                <Download className="h-4 w-4" />
              </div>
              <div>
                <div className="text-xs font-black uppercase text-white">
                  <span>4. Header Navigation Menu</span>
                </div>
                <div className="text-[11px] text-gray-400 mt-0.5">
                  Under <strong className="text-white">CHAMPIONSHIPS &gt; Official Circulars & Forms</strong> on every page.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Document Upload Form Section ── */}
        <section className="mb-10 rounded-3xl border border-white/10 bg-[#120402]/90 p-6 md:p-8 backdrop-blur-xl shadow-2xl">
          <div className="mb-6 pb-4 border-b border-white/10 flex items-center justify-between">
            <h2 className="font-heading text-xl font-black uppercase tracking-wider text-white">
              Upload & Publish New Document
            </h2>
            <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
              Live Auto-Sync Active
            </span>
          </div>

          <CircularUploadForm />
        </section>

        {/* ── Published Circulars List ── */}
        <section className="rounded-3xl border border-white/10 bg-[#120402]/90 backdrop-blur-xl shadow-2xl overflow-hidden">
          <div className="border-b border-white/10 p-6 flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="font-heading text-xl font-black uppercase tracking-wider text-white">
                Published Documents & Circulars ({circulars.length})
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                All documents currently live and accessible to lifters and visitors.
              </p>
            </div>

            <Link
              href="/circulars"
              target="_blank"
              className="inline-flex items-center gap-1.5 text-xs font-bold uppercase text-gym-primary hover:underline"
            >
              <span>Preview /circulars</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>

          {circulars.length === 0 ? (
            <div className="p-12 text-center text-sm text-gray-500">
              <FileText className="h-10 w-10 text-gray-600 mx-auto mb-3" />
              <p className="font-bold uppercase tracking-wider text-gray-400">No circulars published yet.</p>
              <p className="text-xs text-gray-500 mt-1">Upload a PDF or image document using the form above.</p>
            </div>
          ) : (
            <div className="divide-y divide-white/10">
              {circulars.map((circular) => (
                <div 
                  key={circular.id} 
                  className="flex items-center justify-between gap-4 p-5 md:p-6 transition-colors hover:bg-white/5"
                >
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div className="p-2.5 rounded-xl bg-gym-primary/10 border border-gym-primary/20 text-gym-primary shrink-0 mt-0.5">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <span className="block font-bold text-white text-sm sm:text-base truncate">
                        {circular.title}
                      </span>
                      <div className="flex items-center gap-3 text-xs text-gray-400 mt-1 flex-wrap">
                        <span>Published: {new Date(circular.publishedAt).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })}</span>
                        <span className="text-gray-600">•</span>
                        <span className="text-emerald-400 font-semibold">Live on /circulars</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={circular.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-gray-300 hover:text-white hover:border-gym-primary transition-all"
                    >
                      <Download className="h-3.5 w-3.5 text-gym-primary" />
                      <span className="hidden sm:inline">Open PDF</span>
                    </a>

                    <CircularDeleteButton id={circular.id} title={circular.title} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
