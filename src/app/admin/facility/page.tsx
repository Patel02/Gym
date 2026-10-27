import { auth } from "@/auth";
import FacilityEditor from "@/components/admin/FacilityEditor";
import { PageNavigation } from "@/components/ui/PageNavigation";
import { redirect } from "next/navigation";
import fs from "fs/promises";
import path from "path";
import type { FacilityData } from "@/actions/facility.actions";

export const revalidate = 30;

const FACILITY_FILE_PATH = path.join(process.cwd(), "src", "data", "federation-facility.json");

async function getFacilityData(): Promise<FacilityData> {
  try {
    const data = await fs.readFile(FACILITY_FILE_PATH, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    throw new Error("Could not load facility data.");
  }
}

export default async function AdminFacilityPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const facilityData = await getFacilityData();

  return (
    <div className="min-h-screen bg-gym-black px-6 pb-20 pt-32 sm:pt-36 lg:pt-40 text-white md:px-12">
      <div className="mx-auto max-w-6xl">
        {/* Navigation Breadcrumb */}
        <PageNavigation
          backHref="/admin"
          backLabel="Back to Command Center"
          breadcrumbs={[
            { label: "Admin Hub", href: "/admin" },
            { label: "Facility & Passes Editor" },
          ]}
          badge="Gym Management"
          className="mb-8"
        />

        {/* Interactive Facility & Passes Editor */}
        <FacilityEditor initialData={facilityData} />
      </div>
    </div>
  );
}
