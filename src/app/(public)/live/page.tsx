import type { Metadata } from "next";
import { getPublicLiveArenaDataAction } from "@/actions/public-live-stream.actions";
import { LiveSpectatorArena } from "@/components/live/LiveSpectatorArena";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Live Match Day Arena | Indian Powerlifting Federation",
  description:
    "Official IPF Match Day Live Broadcast Arena. Real-time platform attempts, barbell plate visualizer, 1-minute countdown clock, IPF 3-light referee jury decisions, and official competition scoreboard.",
};

interface LivePageProps {
  searchParams: Promise<{ meet?: string }>;
}

export default async function PublicLiveArenaPage({ searchParams }: LivePageProps) {
  const resolvedParams = await searchParams;
  const res = await getPublicLiveArenaDataAction(resolvedParams?.meet);

  const initialData = res.success && res.data
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
          decisionText: "STANDBY FOR STREAM",
          isGoodLift: true,
          whiteCount: 3,
        },
        results: [],
        spectatorCount: 420,
        lastUpdatedIso: new Date().toISOString(),
      };

  return (
    <div className="min-h-screen bg-[#080201] text-white pt-32 sm:pt-36 lg:pt-40 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <LiveSpectatorArena initialData={initialData} />
      </div>
    </div>
  );
}
