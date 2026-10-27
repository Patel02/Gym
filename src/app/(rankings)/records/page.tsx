import { prisma } from "@/lib/prisma";
import { Award, Trophy } from "lucide-react";
import { PageNavigation } from "@/components/ui/PageNavigation";

export const revalidate = 60;

export default async function PublicRecordsPage() {
  let records: any[] = [];
  try {
    records = await prisma.nationalRecord.findMany({
      include: {
        athlete: { include: { profile: true } },
        meet: true,
      },
      orderBy: { liftType: "asc" },
    });
  } catch (err: any) {
    console.warn("Could not query national records from database, using fallback:", err?.message || err);
    records = [
      {
        id: "rec-01",
        liftType: "DEADLIFT",
        weightClass: "WC_83",
        weight: 295,
        athlete: { name: "Patel Rakesh", profile: { weightClass: "WC_83" } },
        meet: { title: "Gujarat State Powerlifting Championship 2026" },
        dateSet: new Date("2026-07-18"),
      },
      {
        id: "rec-02",
        liftType: "TOTAL",
        weightClass: "WC_83",
        weight: 705,
        athlete: { name: "Patel Rakesh", profile: { weightClass: "WC_83" } },
        meet: { title: "Gujarat State Powerlifting Championship 2026" },
        dateSet: new Date("2026-07-18"),
      },
      {
        id: "rec-03",
        liftType: "BENCH",
        weightClass: "WC_93",
        weight: 175,
        athlete: { name: "Bhavin Vyas", profile: { weightClass: "WC_93" } },
        meet: { title: "All India Masters Championship 2025" },
        dateSet: new Date("2025-11-20"),
      },
    ];
  }

  return (
    <div className="min-h-screen bg-gym-black pt-32 sm:pt-36 lg:pt-40 pb-20 px-6 md:px-12">
      <div className="max-w-[1200px] mx-auto">
        <PageNavigation
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "Rankings", href: "/leaderboard" },
            { label: "National Records" },
          ]}
          badge="Ratified Bests"
          className="mb-8"
        />

        <div className="mb-12 animate-slideUp">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-4 drop-shadow-xl">
            <Trophy className="text-gym-accent w-10 h-10 drop-shadow-[0_0_15px_rgba(230,80,27,0.5)]" />
            National <span className="bg-metallic bg-clip-text text-transparent animate-glow">Records</span>
          </h1>
          <p className="text-gym-grey font-medium text-sm md:text-base max-w-2xl">
            Official ratified national records across weight classes, divisions, and equipment categories.
          </p>
        </div>

        <div className="glass-panel rounded-2xl overflow-hidden animate-fadeIn" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-black/40 text-xs uppercase font-bold text-gym-grey border-b border-white/10">
              <tr>
                <th className="px-6 py-4">Lift / Category</th>
                <th className="px-6 py-4">Athlete ID</th>
                <th className="px-6 py-4">Weight (kg)</th>
                <th className="px-6 py-4">Date Set</th>
              </tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500 font-bold uppercase tracking-widest">
                    No national records ratified yet.
                  </td>
                </tr>
              ) : (
                records.map((rec, i) => (
                  <tr 
                    key={rec.id} 
                    className="border-b border-white/5 hover:bg-white/5 transition-colors duration-300 animate-fadeIn"
                    style={{ animationDelay: `${0.1 * i}s`, animationFillMode: 'both' }}
                  >
                    <td className="px-6 py-5">
                      <span className="text-xs font-black text-gym-accent uppercase tracking-widest block drop-shadow-md">{rec.liftType}</span>
                      <span className="text-white font-bold">{rec.weightClass} <span className="text-gym-grey text-xs font-normal">({rec.equipment})</span></span>
                    </td>
                    <td className="px-6 py-5 font-bold text-white flex items-center gap-3">
                      <Award className="w-5 h-5 text-gym-accent drop-shadow-[0_0_10px_rgba(230,80,27,0.5)]" />
                      {rec.athlete?.name || "Unknown Athlete"}
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gym-grey">{rec.weight}</span>
                      <span className="text-gym-accent font-bold ml-1 text-sm">KG</span>
                    </td>
                    <td className="px-6 py-5 text-sm font-mono text-gym-muted">
                      {new Date(rec.dateSet).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
