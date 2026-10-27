import type { Metadata } from "next";
import fs from "fs/promises";
import path from "path";
import ChampionshipsView from "@/components/championships/ChampionshipsView";
import type { MeetItem } from "@/components/admin/EventsManager";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "National Championships 2026 | Indian Powerlifting Federation",
  description: "Official IPF-sanctioned National Powerlifting Championships 2026 calendar, weight classes, divisions, MQT qualifying totals, and WhatsApp entry registration.",
};

async function getMeets(): Promise<MeetItem[]> {
  try {
    const filePath = path.join(process.cwd(), "src", "data", "federation-events.json");
    const rawData = await fs.readFile(filePath, "utf-8");
    const parsed = JSON.parse(rawData);
    return parsed.events || [];
  } catch (error) {
    console.error("Failed to load federation events:", error);
    return [];
  }
}

export default async function ChampionshipsPage() {
  const meets = await getMeets();

  return <ChampionshipsView initialMeets={meets} />;
}
