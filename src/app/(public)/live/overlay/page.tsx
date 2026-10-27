import type { Metadata } from "next";
import { getPublicLiveArenaDataAction } from "@/actions/public-live-stream.actions";
import { StreamOverlayLowerThird } from "@/components/live/StreamOverlayLowerThird";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "OBS Livestream Lower-Third Overlay | Indian Powerlifting Federation",
  description:
    "Official IPF Livestream Lower-Third Overlay for OBS Studio and vMix. Broadcast-grade real-time attempt card, timer bar, and 3-referee light popups with transparent background.",
};

interface OverlayPageProps {
  searchParams: Promise<{
    meet?: string;
    mode?: "lower-third" | "lights-only" | "jumbotron" | "ticker";
    theme?: "broadcast" | "contrast" | "cyber";
    sound?: string;
    control?: string;
  }>;
}

export default async function StreamOverlayPage({ searchParams }: OverlayPageProps) {
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

  return (
    <StreamOverlayLowerThird
      initialData={initialData}
      meetId={resolvedParams?.meet}
      mode={resolvedParams?.mode || "lower-third"}
      theme={resolvedParams?.theme || "broadcast"}
      soundDefault={resolvedParams?.sound === "1"}
      showControlDefault={resolvedParams?.control === "1"}
    />
  );
}
