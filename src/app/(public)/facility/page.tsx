import { Metadata } from "next";
import fs from "fs/promises";
import path from "path";
import FacilityView from "@/components/facility/FacilityView";
import type { FacilityData } from "@/actions/facility.actions";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "National High-Performance Training Facility & Platforms • Indian Powerlifting Federation",
  description: "8 IPF competition platforms, Eleiko & Rogue combo racks, calibrated steel discs, specialty bars, recovery cold plunge, and training access passes.",
};

const FACILITY_FILE_PATH = path.join(process.cwd(), "src", "data", "federation-facility.json");

async function getFacilityData(): Promise<FacilityData> {
  try {
    const data = await fs.readFile(FACILITY_FILE_PATH, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    return {
      hero: {
        badge: "High-Performance Platform Lab",
        title: "National Training",
        subtitle: "Facility & Platforms",
        desc: "India's premier strength destination designed specifically for Olympic-grade IPF powerlifting.",
        location: "Bengaluru & New Delhi Centers",
        hours: "Open Mon–Sat: 6:00 AM – 10:00 PM"
      },
      highlights: [],
      passes: [],
      cta: {
        tag: "Schedule A Visit & Platform Tour",
        title: "Want to Tour the Facility in Person?",
        desc: "Meet Coaches Akash & Tanvi at the platform lab for an in-person orientation.",
        waMessage: "Hi Coaches Akash & Tanvi, I would like to schedule an in-person visit at the National Facility."
      }
    };
  }
}

export default async function FacilityPage() {
  const facilityData = await getFacilityData();

  return <FacilityView initialData={facilityData} />;
}
