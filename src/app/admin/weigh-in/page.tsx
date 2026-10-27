import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { MeetStatus } from "@prisma/client";
import { redirect } from "next/navigation";
import { PageNavigation } from "@/components/ui/PageNavigation";

import { AutomatedWeighInManager, WeighInAthleteItem } from "@/components/admin/AutomatedWeighInManager";

export const revalidate = 30;

import { unstable_cache } from "next/cache";

const getCachedWeighInData = unstable_cache(
  async () => {
    const registrations = await (prisma as any).meetRegistration.findMany({
      where: { status: MeetStatus.APPROVED },
      take: 100,
      include: {
        user: {
          include: {
            profile: {
              include: { club: true },
            },
          },
        },
        event: true,
      },
      orderBy: [
        { event: { date: "asc" } },
        { lotNumber: "asc" },
        { user: { name: "asc" } },
      ],
    }).catch(() => []);

    const userIds = registrations.map((r: any) => r.userId);
    const results = userIds.length > 0 ? await (prisma as any).result.findMany({
      where: {
        userId: { in: userIds },
      },
      take: 100,
    }).catch(() => []) : [];

    const activeEvent = registrations.length > 0 ? registrations[0].event : null;
    const eventId = activeEvent?.id || "mock-event-1";
    const eventTitle = activeEvent?.title || "Gujarat State Powerlifting Championship 2026";

    return { registrations, results, eventId, eventTitle };
  },
  ["admin-weigh-in-data-cache"],
  { revalidate: 30, tags: ["weigh-in", "results"] }
);

export default async function WeighInPage() {
  const session = await auth();

  if (session?.user?.role !== "ADMIN" && session?.user?.role !== "REFEREE" && session?.user?.role !== "SUPER_ADMIN") {
    redirect("/dashboard");
  }

  const { registrations, results, eventId, eventTitle } = await getCachedWeighInData();

  const athletes: WeighInAthleteItem[] = registrations.map((r: any) => {
    const res = results.find(
      (resItem: any) => resItem.userId === r.userId && resItem.eventId === r.eventId
    );

    let meta: any = {};
    try {
      if (r.paymentRef && typeof r.paymentRef === "string" && r.paymentRef.startsWith("{")) {
        meta = JSON.parse(r.paymentRef);
      }
    } catch {
      meta = {};
    }

    return {
      id: r.id,
      userId: r.userId,
      name: r.user?.name || "Athlete",
      gender: (r.user?.profile?.gender as "MALE" | "FEMALE") || "MALE",
      clubName: r.user?.profile?.club?.name || "Independent / Affiliated Gym",
      registeredWeightClass: r.user?.profile?.weightClass || "WC_83",
      division: r.division || "OPEN",
      bodyweight: r.bodyweight,
      lotNumber: r.lotNumber,
      openingSquat: res?.squat1,
      openingBench: res?.bench1,
      openingDeadlift: res?.deadlift1,
      photoUrl: r.user?.image || null,
      biometricVerified: !!meta.biometricVerified,
      biometricConfidence: typeof meta.biometricConfidence === "number" ? meta.biometricConfidence : null,
      isProxyFlagged: !!meta.isProxyFlagged,
      proxyReason: meta.proxyReason || null,
    };
  });

  return (
    <div className="min-h-screen bg-gym-black px-4 pb-20 pt-32 sm:pt-36 lg:pt-40 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <PageNavigation href="/admin" label="Back to Command Center" badge="Weigh-In Desk" />
        <AutomatedWeighInManager
          eventId={eventId}
          eventTitle={eventTitle}
          initialAthletes={athletes}
        />
      </div>
    </div>
  );
}
