import type { Metadata } from "next";
import { getPublicLiveArenaDataAction } from "@/actions/public-live-stream.actions";
import { BackstageWarmupMatrix } from "@/components/live/BackstageWarmupMatrix";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Backstage Warmup Peaking Matrix | Indian Powerlifting Federation",
  description:
    "Official IPF Backstage Warmup Room & Peaking Matrix. Real-time platform queue order, 'In The Hole' / 'In The Rack' lifter alerts, attempt countdowns, and warmup bar loading calculations.",
};

interface WarmupPageProps {
  searchParams: Promise<{ meet?: string }>;
}

export default async function BackstageWarmupPage({ searchParams }: WarmupPageProps) {
  const resolvedParams = await searchParams;
  const res = await getPublicLiveArenaDataAction(resolvedParams?.meet);

  const initialData =
    res.success && res.data
      ? res.data
      : {
          meets: [],
          selectedMeetId: "",
          currentMeet: null,
          activeLifter: null,
          refereeLights: {
            ref1: "WHITE" as const,
            headRef: "WHITE" as const,
            ref3: "WHITE" as const,
            decisionText: "STANDBY",
            isGoodLift: true,
            whiteCount: 3,
          },
          results: [],
          spectatorCount: 0,
          lastUpdatedIso: new Date().toISOString(),
        };

  return <BackstageWarmupMatrix initialData={initialData} />;
}
