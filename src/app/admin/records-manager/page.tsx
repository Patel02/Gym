import { AlertTriangle, Award, CheckCircle, Shield } from "lucide-react";
import { auth } from "@/auth";
import { RecordApprovalButton } from "@/components/admin/RecordApprovalButton";
import { prisma } from "@/lib/prisma";
import { Division, EquipmentType, Gender, LiftType, WeightClass } from "@prisma/client";
import { redirect } from "next/navigation";
import { PageNavigation } from "@/components/ui/PageNavigation";

export const revalidate = 30;

type Candidate = {
  key: string;
  liftType: LiftType;
  weight: number;
  athleteId: string;
  athleteName: string | null;
  meetId: string;
  meetTitle: string;
  weightClass: WeightClass;
  division: Division;
  equipment: EquipmentType;
  gender: Gender;
  currentWeight: number | null;
};

import { unstable_cache } from "next/cache";

const getCachedRecordsAndCandidates = unstable_cache(
  async () => {
    const [currentRecords, recentResults] = await Promise.all([
      prisma.nationalRecord
        .findMany({
          take: 50,
          orderBy: { dateSet: "desc" },
          include: { athlete: { select: { name: true } }, meet: { select: { title: true } } },
        })
        .catch((err) => {
          console.warn("[RecordsManager] Failed to load national records:", err?.message || err);
          return [];
        }),
      prisma.result
        .findMany({
          where: { total: { gt: 0 } },
          take: 60,
          orderBy: { total: "desc" },
          select: {
            id: true,
            userId: true,
            eventId: true,
            bestSquat: true,
            bestBench: true,
            bestDeadlift: true,
            total: true,
            event: { select: { title: true } },
            user: {
              select: {
                name: true,
                profile: {
                  select: {
                    weightClass: true,
                    gender: true,
                  },
                },
                registrations: {
                  select: {
                    eventId: true,
                    division: true,
                    equipment: true,
                  },
                },
              },
            },
          },
        })
        .catch((err) => {
          console.warn("[RecordsManager] Failed to load results:", err?.message || err);
          return [];
        }),
    ]);

    const recordMap = new Map(
      currentRecords.map((record) => [
        `${record.liftType}:${record.weightClass}:${record.division}:${record.equipment}:${record.gender}`,
        record.weight,
      ])
    );

    const candidates: Candidate[] = [];

    for (const result of recentResults) {
      if (!result.user.profile) continue;
      const registration = result.user.registrations.find((item) => item.eventId === result.eventId);
      if (!registration) continue;

      const attempts: Array<[LiftType, number | null]> = [
        [LiftType.SQUAT, result.bestSquat],
        [LiftType.BENCH, result.bestBench],
        [LiftType.DEADLIFT, result.bestDeadlift],
        [LiftType.TOTAL, result.total],
      ];

      for (const [liftType, weight] of attempts) {
        if (!weight) continue;
        const key = `${liftType}:${result.user.profile.weightClass}:${registration.division}:${registration.equipment}:${result.user.profile.gender}`;
        const current = recordMap.get(key) ?? null;
        if (!current || weight > current) {
          candidates.push({
            key,
            liftType,
            weight,
            athleteId: result.userId,
            athleteName: result.user.name,
            meetId: result.eventId,
            meetTitle: result.event.title,
            weightClass: result.user.profile.weightClass,
            division: registration.division,
            equipment: registration.equipment,
            gender: result.user.profile.gender,
            currentWeight: current,
          });
        }
      }
    }

    return { currentRecords, candidates };
  },
  ["admin-records-candidates-cache"],
  { revalidate: 30, tags: ["records", "results"] }
);

export default async function RecordsManagerPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN" && session?.user?.role !== "SUPER_ADMIN") {
    redirect("/dashboard");
  }

  const { currentRecords, candidates } = await getCachedRecordsAndCandidates();

  return (
    <div className="min-h-screen bg-gym-black px-6 pb-20 pt-32 sm:pt-36 lg:pt-40 text-white md:px-12">
      <div className="mx-auto max-w-7xl">
        <PageNavigation
          backHref="/admin"
          backLabel="Back to Command Center"
          breadcrumbs={[
            { label: "Admin Hub", href: "/admin" },
            { label: "Records Ratification Desk" },
          ]}
          badge="Ratification Desk"
          className="mb-8"
        />

        <div className="mb-8 flex items-center justify-between border-b border-white/10 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold uppercase tracking-tight text-white flex items-center gap-3">
              <Award className="h-8 w-8 text-gym-primary" />
              National Records Ratification Desk
            </h1>
            <p className="mt-1 text-sm text-gray-400">
              Audit and ratify broken national records submitted from sanctioned championship meets.
            </p>
          </div>
        </div>

        {/* Pending Record Candidates */}
        <div className="mb-12">
          <h2 className="mb-4 text-xl font-bold uppercase tracking-wider text-gym-primary flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Pending Broken Record Candidates ({candidates.length})
          </h2>

          {candidates.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center text-gray-400">
              <CheckCircle className="mx-auto mb-2 h-8 w-8 text-emerald-400" />
              <p className="font-semibold">All ratified records are up to date.</p>
              <p className="text-xs text-gray-500 mt-1">No pending unverified meet results exceed current benchmarks.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-white/10 bg-neutral-900/60 shadow-xl">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-white/10 bg-white/5 text-xs uppercase tracking-wider text-gray-400">
                  <tr>
                    <th className="p-4">Athlete</th>
                    <th className="p-4">Lift</th>
                    <th className="p-4">Class & Div</th>
                    <th className="p-4">Candidate Weight</th>
                    <th className="p-4">Current Record</th>
                    <th className="p-4">Sanctioned Meet</th>
                    <th className="p-4 text-right">Ratify</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {candidates.map((c, idx) => (
                    <tr key={`${c.key}-${idx}`} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-4 font-bold text-white">{c.athleteName || "Unknown Athlete"}</td>
                      <td className="p-4 font-mono font-bold text-gym-primary">{c.liftType}</td>
                      <td className="p-4 text-xs text-gray-300">
                        {c.weightClass.replace("_", " ")} | {c.division} | {c.equipment} | {c.gender}
                      </td>
                      <td className="p-4 font-mono text-base font-extrabold text-emerald-400">{c.weight} kg</td>
                      <td className="p-4 font-mono text-gray-400">
                        {c.currentWeight ? `${c.currentWeight} kg` : "None"}
                      </td>
                      <td className="p-4 text-xs text-gray-400">{c.meetTitle}</td>
                      <td className="p-4 text-right">
                        <RecordApprovalButton
                          data={{
                            liftType: c.liftType,
                            weightClass: c.weightClass,
                            division: c.division,
                            equipment: c.equipment,
                            gender: c.gender,
                            weight: c.weight,
                            athleteId: c.athleteId,
                            meetId: c.meetId,
                          }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Existing Ratified Records */}
        <div>
          <h2 className="mb-4 text-xl font-bold uppercase tracking-wider text-white flex items-center gap-2">
            <Shield className="h-5 w-5 text-emerald-400" />
            Currently Ratified National Records ({currentRecords.length})
          </h2>

          <div className="overflow-x-auto rounded-xl border border-white/10 bg-neutral-900/60 shadow-xl">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-white/10 bg-white/5 text-xs uppercase tracking-wider text-gray-400">
                <tr>
                  <th className="p-4">Lift</th>
                  <th className="p-4">Weight Class</th>
                  <th className="p-4">Division</th>
                  <th className="p-4">Equipment</th>
                  <th className="p-4">Gender</th>
                  <th className="p-4">Record</th>
                  <th className="p-4">Athlete</th>
                  <th className="p-4">Meet</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {currentRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-white/[0.02]">
                    <td className="p-4 font-mono font-bold text-gym-primary">{r.liftType}</td>
                    <td className="p-4 text-xs">{r.weightClass.replace("_", " ")}</td>
                    <td className="p-4 text-xs text-gray-400">{r.division}</td>
                    <td className="p-4 text-xs text-gray-400">{r.equipment}</td>
                    <td className="p-4 text-xs text-gray-400">{r.gender}</td>
                    <td className="p-4 font-mono font-bold text-white">{r.weight} kg</td>
                    <td className="p-4 font-semibold text-gray-200">{r.athlete?.name || "Official Benchmark"}</td>
                    <td className="p-4 text-xs text-gray-400">{r.meet?.title || "National Council"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}