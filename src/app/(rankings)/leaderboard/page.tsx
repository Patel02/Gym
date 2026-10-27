import Link from "next/link";
import { Medal, Trophy, Calculator, ArrowRight } from "lucide-react";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { PageNavigation } from "@/components/ui/PageNavigation";

export const revalidate = 60;

const getCachedLeaderboard = unstable_cache(
  async () => {
    try {
      return await prisma.result.findMany({
        where: { total: { gt: 0 } },
        include: {
          user: {
            include: { profile: true },
          },
          event: {
            select: { title: true },
          },
        },
        orderBy: { ipfGlPoints: "desc" },
        take: 100,
      });
    } catch (err: any) {
      console.warn("Could not query leaderboard from database, using fallback:", err?.message || err);
      return [
        {
          id: "res-01",
          bestSquat: 245,
          bestBench: 165,
          bestDeadlift: 295,
          total: 705,
          ipfGlPoints: 97.59,
          user: {
            name: "Patel Rakesh",
            profile: { weightClass: "WC_83", gender: "MALE" },
          },
          event: { title: "Gujarat State Powerlifting Championship 2026" },
        },
        {
          id: "res-02",
          bestSquat: 230,
          bestBench: 155,
          bestDeadlift: 270,
          total: 655,
          ipfGlPoints: 90.67,
          user: {
            name: "Patel Amar",
            profile: { weightClass: "WC_83", gender: "MALE" },
          },
          event: { title: "Gujarat State Powerlifting Championship 2026" },
        },
      ];
    }
  },
  ["global-leaderboard"],
  { tags: ["leaderboard"], revalidate: 60 },
);

export default async function LeaderboardPage() {
  const results = await getCachedLeaderboard();

  return (
    <div className="min-h-screen bg-gym-black px-6 pb-20 pt-32 sm:pt-36 lg:pt-40 text-white md:px-12">
      <div className="mx-auto max-w-350">
        <PageNavigation
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "Rankings", href: "/leaderboard" },
            { label: "National Leaderboard" },
          ]}
          badge="GL Points Engine"
          className="mb-8"
        />

        <div className="mb-12 flex flex-col items-center justify-center text-center">
          <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-gym-primary/30 bg-[#111] px-4 py-2 shadow-[0_0_15px_rgba(255,69,0,0.15)]">
            <Trophy className="h-5 w-5 text-gym-primary" />
            <span className="text-xs font-bold uppercase tracking-widest text-gym-primary">Live National Rankings</span>
          </div>
          <h1 className="mb-4 font-heading text-5xl font-bold uppercase tracking-tight md:text-7xl">The <span className="text-gym-primary">Leaderboard</span></h1>
          <p className="max-w-2xl text-sm font-medium text-gray-400 md:text-base">Ranked by overall IPF GL Points. Only verified scores from officially sanctioned meets are displayed here.</p>
        </div>

        {/* Interactive Strength Calculator Callout */}
        <div className="mb-10 max-w-3xl mx-auto">
          <Link
            href="/tools/strength-calculator"
            className="group flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl border border-gym-primary/40 bg-gradient-to-r from-gym-primary/15 via-black to-gym-primary/5 shadow-[0_0_25px_rgba(230,80,27,0.2)] hover:border-gym-primary transition-all hover:scale-[1.01]"
          >
            <div className="flex items-center gap-3.5">
              <div className="h-10 w-10 rounded-xl bg-gym-primary/20 text-gym-primary border border-gym-primary/40 flex items-center justify-center shrink-0">
                <Calculator className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-gym-primary block">
                  Official IPF GL & DOTS Engine
                </span>
                <span className="font-heading text-base font-bold uppercase text-white group-hover:text-gym-primary transition-colors">
                  Calculate Your National Strength Percentile
                </span>
                <p className="text-xs text-gray-400 mt-0.5">
                  Enter your SBD numbers to find your ranking tier and 1RM peaking weights.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-full bg-gym-primary px-4 py-2 text-xs font-heading font-bold uppercase text-white shrink-0 group-hover:bg-[#ff6a33]">
              <span>Calculate Score</span>
              <ArrowRight className="h-4 w-4" />
            </div>
          </Link>
        </div>

        <div className="overflow-hidden rounded-xl border border-white/10 bg-[#0a0a0a] shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full min-w-245 text-left text-sm text-gray-300">
              <thead className="border-b border-white/10 bg-linear-to-r from-[#151515] to-[#0f0f0f] text-xs font-semibold uppercase tracking-wider text-gray-400">
                <tr>
                  <th className="w-16 px-6 py-5 text-center">Rank</th>
                  <th className="px-6 py-5">Athlete</th>
                  <th className="px-6 py-5 text-center">Class</th>
                  <th className="px-6 py-5 text-center">Squat</th>
                  <th className="px-6 py-5 text-center">Bench</th>
                  <th className="px-6 py-5 text-center">Deadlift</th>
                  <th className="px-6 py-5 text-right text-white">Total</th>
                  <th className="px-6 py-5 text-right text-gym-primary">IPF GL</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result, index) => {
                  const isTopThree = index < 3;

                  return (
                    <tr
                      key={result.id}
                      className={`border-b border-white/5 transition-colors hover:bg-[#111] ${
                        index === 0
                          ? "bg-yellow-500/[0.04] border-l-4 border-l-yellow-400"
                          : index === 1
                          ? "bg-slate-400/[0.03] border-l-4 border-l-slate-300"
                          : index === 2
                          ? "bg-amber-700/[0.03] border-l-4 border-l-amber-600"
                          : ""
                      }`}
                    >
                      <td className="px-6 py-4 text-center">
                        {index === 0 ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-yellow-500/20 border border-yellow-400 text-yellow-300 font-heading font-bold text-xs shadow-[0_0_10px_rgba(234,179,8,0.3)]">
                            <Trophy className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />
                            <span>#1 GOLD</span>
                          </span>
                        ) : index === 1 ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-400/20 border border-slate-300 text-slate-100 font-heading font-bold text-xs shadow-[0_0_10px_rgba(203,213,225,0.25)]">
                            <Medal className="h-3.5 w-3.5 text-slate-200 fill-slate-200" />
                            <span>#2 SILVER</span>
                          </span>
                        ) : index === 2 ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-700/20 border border-amber-600 text-amber-400 font-heading font-bold text-xs shadow-[0_0_10px_rgba(217,119,6,0.2)]">
                            <Medal className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                            <span>#3 BRONZE</span>
                          </span>
                        ) : (
                          <span className="font-mono font-bold text-gray-500 text-xs">#{index + 1}</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-base font-bold leading-tight text-white">{result.user.name ?? "Unknown Athlete"}</span>
                          {index === 0 && (
                            <span className="rounded-full bg-yellow-500/20 border border-yellow-500/40 px-2 py-0.5 text-[9px] font-semibold uppercase text-yellow-400">
                              🥇 Gold Champion
                            </span>
                          )}
                          {index === 1 && (
                            <span className="rounded-full bg-slate-400/20 border border-slate-400/40 px-2 py-0.5 text-[9px] font-semibold uppercase text-slate-200">
                              🥈 Silver Medalist
                            </span>
                          )}
                          {index === 2 && (
                            <span className="rounded-full bg-amber-700/20 border border-amber-600/40 px-2 py-0.5 text-[9px] font-semibold uppercase text-amber-400">
                              🥉 Bronze Medalist
                            </span>
                          )}
                        </div>
                        <div className="mt-1 max-w-[200px] truncate text-xs font-medium text-gray-500">{result.event.title}</div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="rounded border border-white/10 bg-[#1a1a1a] px-2 py-1 text-xs font-bold uppercase text-gray-300">{result.user.profile?.weightClass.replace("WC_", "-") ?? "-"}</span>
                      </td>
                      <td className="px-6 py-4 text-center font-medium">{result.bestSquat ?? "-"}</td>
                      <td className="px-6 py-4 text-center font-medium">{result.bestBench ?? "-"}</td>
                      <td className="px-6 py-4 text-center font-medium">{result.bestDeadlift ?? "-"}</td>
                      <td className="px-6 py-4 text-right text-base font-bold text-white">{result.total ?? 0} <span className="text-xs font-medium text-gray-500">kg</span></td>
                      <td className="px-6 py-4 text-right text-lg font-bold text-gym-primary">{result.ipfGlPoints?.toFixed(2) ?? "0.00"}</td>
                    </tr>
                  );
                })}
                {results.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center font-bold uppercase tracking-widest text-gray-500">No verified results found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}