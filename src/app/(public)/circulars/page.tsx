import { prisma } from "@/lib/prisma";
import { ExternalLink, FileText } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CircularsPage() {
  const circulars = await prisma.circular.findMany({ orderBy: { publishedAt: "desc" } });

  return (
    <div className="min-h-screen bg-gym-black px-6 pb-20 pt-32 md:px-12">
      <div className="mx-auto max-w-250">
        <div className="mb-10">
          <h1 className="mb-2 flex items-center gap-3 font-heading text-3xl font-black uppercase tracking-wider text-white">
            <FileText className="h-8 w-8 text-gym-orange" />
            Official <span className="text-gym-orange">Circulars</span>
          </h1>
          <p className="text-sm font-medium text-gray-400">Rules, invitations, results, and official federation documents.</p>
        </div>

        <div className="border border-white/10 bg-[#0a0a0a]">
          {circulars.length === 0 ? (
            <p className="p-8 text-center text-sm text-gray-500">No circulars published yet.</p>
          ) : (
            <div className="divide-y divide-white/5">
              {circulars.map((circular) => (
                <a key={circular.id} href={circular.fileUrl} target="_blank" rel="noreferrer" className="flex items-center justify-between gap-4 p-6 transition-colors hover:bg-[#111]">
                  <span>
                    <span className="block font-bold text-white">{circular.title}</span>
                    <span className="text-xs text-gray-500">Published {circular.publishedAt.toLocaleDateString()}</span>
                  </span>
                  <ExternalLink className="h-4 w-4 shrink-0 text-gym-orange" />
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}