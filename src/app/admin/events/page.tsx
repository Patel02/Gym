import { auth } from "@/auth";
import EventsManager, { FederationEventsData } from "@/components/admin/EventsManager";
import { PageNavigation } from "@/components/ui/PageNavigation";
import { redirect } from "next/navigation";
import fs from "fs/promises";
import path from "path";

export const revalidate = 30;

const EVENTS_FILE_PATH = path.join(process.cwd(), "src", "data", "federation-events.json");

import { unstable_cache } from "next/cache";

const getCachedEventsData = unstable_cache(
  async (): Promise<FederationEventsData> => {
    try {
      const data = await fs.readFile(EVENTS_FILE_PATH, "utf-8");
      return JSON.parse(data);
    } catch (err) {
      return { events: [], announcements: [] };
    }
  },
  ["federation-events-data-cache"],
  { revalidate: 30, tags: ["events"] }
);

export default async function AdminEventsPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN" && session?.user?.role !== "SUPER_ADMIN") {
    redirect("/dashboard");
  }

  const eventsData = await getCachedEventsData();

  return (
    <div className="min-h-screen bg-gym-black px-6 pb-20 pt-32 sm:pt-36 lg:pt-40 text-white md:px-12">
      <div className="mx-auto max-w-6xl">
        {/* Navigation Breadcrumb */}
        <PageNavigation
          backHref="/admin"
          backLabel="Back to Command Center"
          breadcrumbs={[
            { label: "Admin Hub", href: "/admin" },
            { label: "Events & Meets Manager" },
          ]}
          badge="Championship Engine"
          className="mb-8"
        />

        {/* Interactive Event Management Portal */}
        <EventsManager initialData={eventsData} />
      </div>
    </div>
  );
}
