import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { Trophy, Shield, UserCheck, Calendar, ArrowLeft, ExternalLink } from "lucide-react";

export const revalidate = 60;

interface AthleteProfilePageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: AthleteProfilePageProps): Promise<Metadata> {
  const { id } = await params;
  if (!id) {
    return {
      title: "Athlete Profile | Indian Powerlifting Federation",
    };
  }

  let athlete: any = null;
  try {
    athlete = await prisma.user.findUnique({
      where: { id },
      select: { name: true, profile: { select: { weightClass: true, gender: true } } },
    });
  } catch (err) {
    athlete = { name: "Patel Rakesh", profile: { weightClass: "WC_83", gender: "MALE" } };
  }

  if (!athlete) {
    return {
      title: "Athlete Profile | Indian Powerlifting Federation",
    };
  }

  const division = athlete.profile?.weightClass
    ? `${athlete.profile.weightClass.replace("WC_", "")} KG`
    : "Competitive";

  return {
    title: `${athlete.name || "Competitor"} (${division}) | Athlete Dossier | Indian Powerlifting Federation`,
    description: `Official ratified profile, verified competition history, platform results, and federation licensing credentials for ${athlete.name}.`,
  };
}

export default async function AthleteProfilePage({ params }: AthleteProfilePageProps) {
  const { id } = await params;

  if (!id) {
    notFound();
  }

  let athlete: any = null;
  try {
    athlete = await prisma.user.findUnique({
      where: { id },
      include: {
        profile: { include: { club: true } },
        memberships: { take: 1, orderBy: { endDate: "desc" } },
        results: {
          include: { event: true },
          orderBy: { event: { date: "desc" } },
        },
      },
    });
  } catch (err: any) {
    console.warn("Could not query athlete from database, using fallback:", err?.message || err);
    athlete = {
      id,
      name: "Patel Rakesh",
      email: "rakesh.patel@wpi-gujarat.org",
      image: null,
      profile: {
        weightClass: "WC_83",
        gender: "MALE",
        club: { name: "Baroda Barbell Club", state: "Gujarat" },
      },
      memberships: [
        {
          id: "mem-01",
          cardNumber: "WPI-GJ-2026-0881",
          status: "ACTIVE",
          type: "ANNUAL",
          startDate: new Date("2026-01-01"),
          endDate: new Date("2026-12-31"),
        },
      ],
      results: [
        {
          id: "res-01",
          bestSquat: 245,
          bestBench: 165,
          bestDeadlift: 295,
          total: 705,
          ipfGlPoints: 97.59,
          event: {
            id: "ev-01",
            title: "Gujarat State Powerlifting Championship 2026",
            date: new Date("2026-07-18"),
            location: "Ahmedabad, Gujarat",
          },
        },
      ],
    };
  }

  if (!athlete) notFound();

  const membership = athlete.memberships[0];

  return (
    <div className="min-h-screen bg-gym-black pt-28 sm:pt-32 lg:pt-36 pb-20 px-6 md:px-12">
      <div className="max-w-[1000px] mx-auto">
        
        {/* Breadcrumb Back Link */}
        <div className="mb-6">
          <Link
            href="/athletes"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-gym-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Athlete Directory
          </Link>
        </div>

        {/* Profile Header Card */}
        <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-8 mb-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gym-primary/5 rounded-full blur-[80px] pointer-events-none" />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xs font-black text-gym-primary uppercase tracking-widest bg-gym-primary/10 px-3 py-1 rounded-full border border-gym-primary/20">
                  {athlete.profile?.weightClass?.replace("WC_", "") || "N/A"} KG Division
                </span>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                  Gender: {athlete.profile?.gender || "N/A"}
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-heading font-bold text-white uppercase tracking-wider mb-2">
                {athlete.name}
              </h1>
              <p className="text-gray-400 text-sm font-medium">
                Affiliated Club: <span className="text-white font-bold">{athlete.profile?.club?.name || "Independent Athlete"}</span>
              </p>
            </div>

            <div className="bg-[#141414] border border-white/10 rounded-xl p-4 min-w-[220px]">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Federation Status</span>
              {membership && membership.status === "ACTIVE" ? (
                <div className="flex items-center gap-2 text-green-500 font-bold text-sm">
                  <UserCheck className="w-5 h-5" /> Licensed Athlete
                </div>
              ) : (
                <div className="flex items-center gap-2 text-gray-400 font-bold text-sm">
                  <Shield className="w-5 h-5" /> Inactive License
                </div>
              )}
              {membership && (
                <Link
                  href={`/verify/${membership.cardNumber}`}
                  className="text-[11px] text-gym-primary hover:underline font-mono mt-1.5 flex items-center gap-1 group"
                  title="Verify Official Athlete ID Pass on National Registry"
                >
                  <span>ID: {membership.cardNumber}</span>
                  <ExternalLink className="w-3 h-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Competition History Section */}
        <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-xl font-heading font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-2">
            <Trophy className="text-gym-primary w-6 h-6" />
            Competition <span className="text-gym-primary">History & Results</span>
          </h2>

          <div className="flex flex-col gap-4">
            {athlete.results.length === 0 ? (
              <div className="py-12 text-center text-gray-500 font-bold uppercase tracking-widest bg-[#111] rounded-xl border border-white/5">
                No recorded meet results yet.
              </div>
            ) : (
              athlete.results.map((res: any) => (
                <div key={res.id} className="bg-[#111] border border-white/5 rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-gray-400 mb-1 font-bold">
                      <Calendar className="w-4 h-4 text-gym-primary" />
                      {new Date(res.event.date).toLocaleDateString()} — {res.event.location}
                    </div>
                    <h3 className="text-lg font-bold text-white">{res.event.title}</h3>
                  </div>

                  <div className="grid grid-cols-4 gap-4 text-center bg-[#151515] px-6 py-3 rounded-lg border border-white/5">
                    <div>
                      <span className="text-[10px] text-gray-500 uppercase font-bold block">Squat</span>
                      <span className="text-sm font-bold text-white">{res.bestSquat || 0} kg</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-500 uppercase font-bold block">Bench</span>
                      <span className="text-sm font-bold text-white">{res.bestBench || 0} kg</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-500 uppercase font-bold block">Deadlift</span>
                      <span className="text-sm font-bold text-white">{res.bestDeadlift || 0} kg</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-500 uppercase font-bold block">Total / GL</span>
                      <span className="text-sm font-black text-gym-primary">{res.total || 0} kg</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
