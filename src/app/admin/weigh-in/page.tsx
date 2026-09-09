import { auth } from "@/auth";
import { WeighInRow } from "@/components/admin/WeighInRow";
import { prisma } from "@/lib/prisma";
import { MeetStatus } from "@prisma/client";
import { Scale } from "lucide-react";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function WeighInPage() {
  const session = await auth();

  if (session?.user?.role !== "ADMIN" && session?.user?.role !== "REFEREE") {
    redirect("/dashboard");
  }

  const registrations = await prisma.meetRegistration.findMany({
    where: { status: MeetStatus.APPROVED },
    include: {
      user: { include: { profile: true } },
      event: true,
    },
    orderBy: [{ event: { date: "asc" } }, { user: { name: "asc" } }],
  });

  return (
    <div className="min-h-screen bg-gym-black px-6 pb-20 pt-32 md:px-12">
      <div className="mx-auto max-w-300">
        <div className="mb-8">
          <h1 className="mb-2 flex items-center gap-3 font-heading text-3xl font-black uppercase tracking-wider text-white">
            <Scale className="h-8 w-8 text-gym-orange" />
            Live <span className="text-gym-orange">Weigh-in</span>
          </h1>
          <p className="text-sm font-medium text-gray-400">
            Record actual bodyweights and assign lot numbers before the meet begins. Essential for IPF GL calculation.
          </p>
        </div>

        <div className="overflow-hidden rounded-xl border border-white/10 bg-[#0a0a0a] shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full min-w-225 text-left text-sm text-gray-300">
              <thead className="border-b border-white/10 bg-[#111] text-xs font-bold uppercase text-gray-500">
                <tr>
                  <th className="px-6 py-4">Athlete</th>
                  <th className="px-6 py-4">Registered Class</th>
                  <th className="px-6 py-4">Meet</th>
                  <th className="px-6 py-4">Exact BW (kg)</th>
                  <th className="px-6 py-4">Lot #</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {registrations.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center font-bold uppercase tracking-widest text-gray-500">
                      No approved registrations found.
                    </td>
                  </tr>
                ) : (
                  registrations.map((registration) => <WeighInRow key={registration.id} registration={registration} />)
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}