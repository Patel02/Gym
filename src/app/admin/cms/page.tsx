import { auth } from "@/auth";
import { CircularUploadForm } from "@/components/admin/CircularUploadForm";
import { prisma } from "@/lib/prisma";
import { FileText, ExternalLink } from "lucide-react";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function CMSPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/dashboard");

  const circulars = await prisma.circular.findMany({
    orderBy: { publishedAt: "desc" },
    take: 20,
  });

  return (
    <div className="min-h-screen bg-gym-black px-6 pb-20 pt-32 md:px-12">
      <div className="mx-auto max-w-250">
        <div className="mb-8">
          <h1 className="mb-2 flex items-center gap-3 font-heading text-3xl font-black uppercase tracking-wider text-white">
            <FileText className="h-8 w-8 text-gym-orange" />
            Document <span className="text-gym-orange">Portal</span>
          </h1>
          <p className="text-sm font-medium text-gray-400">Publish official rulebooks, meet invitations, and results PDFs.</p>
        </div>

        <section className="mb-10 border border-white/10 bg-[#0a0a0a] p-6 shadow-2xl md:p-8">
          <CircularUploadForm />
        </section>

        <section className="border border-white/10 bg-[#0a0a0a]">
          <div className="border-b border-white/10 p-6">
            <h2 className="font-heading text-xl font-black uppercase tracking-wider text-white">Published Circulars</h2>
          </div>
          {circulars.length === 0 ? (
            <p className="p-6 text-sm text-gray-500">No circulars published yet.</p>
          ) : (
            <div className="divide-y divide-white/5">
              {circulars.map((circular) => (
                <a key={circular.id} href={circular.fileUrl} target="_blank" rel="noreferrer" className="flex items-center justify-between gap-4 p-6 transition-colors hover:bg-[#111]">
                  <span>
                    <span className="block font-bold text-white">{circular.title}</span>
                    <span className="text-xs text-gray-500">{circular.publishedAt.toLocaleDateString()}</span>
                  </span>
                  <ExternalLink className="h-4 w-4 shrink-0 text-gym-orange" />
                </a>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}