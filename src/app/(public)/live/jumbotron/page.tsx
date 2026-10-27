import type { Metadata } from "next";
import { getPublicLiveArenaDataAction } from "@/actions/public-live-stream.actions";
import { VenueJumbotronStage } from "@/components/live/VenueJumbotronStage";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Venue Stage Jumbotron | Indian Powerlifting Federation",
  description:
    "Official IPF Fullscreen Venue Stage Jumbotron. High-contrast auditorium display with massive 3-referee lights, 60-second countdown clock, and live barbell loading diagram.",
};

interface JumbotronPageProps {
  searchParams: Promise<{ meet?: string }>;
}

export default async function VenueJumbotronPage({ searchParams }: JumbotronPageProps) {
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
            decisionText: "READY ON PLATFORM",
            isGoodLift: true,
            whiteCount: 3,
          },
          results: [],
          spectatorCount: 250,
          lastUpdatedIso: new Date().toISOString(),
        };

  return <VenueJumbotronStage initialData={initialData} />;
}
