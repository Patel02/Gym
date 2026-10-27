import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { PageNavigation } from "@/components/ui/PageNavigation";
import IPFFlightManagerConsole from "@/components/admin/IPFFlightManagerConsole";
import {
  listManageableEventsAction,
  getFlightManagerDataAction,
} from "@/actions/flight-manager.actions";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "IPF Flight & Lot-Number Sorting Engine | Meet Director Hub",
  description:
    "Automated flight splitting by weight class and nominated openers with CSPRNG lot number randomizer and verifiable SHA-256 proof hash.",
};

export default async function AdminFlightsPage() {
  const session = await auth();
  const role = session?.user?.role;

  if (
    !session?.user ||
    (role !== "ADMIN" && role !== "SUPER_ADMIN" && role !== "MEET_DIRECTOR" && role !== "REFEREE")
  ) {
    redirect("/login?callbackUrl=/admin/flights");
  }

  const eventsRes = await listManageableEventsAction();
  const events = eventsRes.success && eventsRes.events ? eventsRes.events : [];

  let initialFlightData = null;
  const initialSelectedEventId = events[0]?.id ?? "";

  if (initialSelectedEventId) {
    const flightRes = await getFlightManagerDataAction(initialSelectedEventId);
    if (flightRes.success && flightRes.data) {
      initialFlightData = flightRes.data;
    }
  }

  return (
    <div className="min-h-screen bg-gym-black px-6 pb-20 pt-32 sm:pt-36 lg:pt-40 text-white md:px-12">
      <div className="mx-auto max-w-7xl">
        {/* Navigation Breadcrumb */}
        <PageNavigation
          backHref="/admin"
          backLabel="Back to Command Center"
          breadcrumbs={[
            { label: "Admin Hub", href: "/admin" },
            { label: "Flight & Lot Sorter" },
          ]}
          badge="IPF Technical Engine"
          className="mb-8"
        />

        {/* Master Console */}
        <IPFFlightManagerConsole
          initialEvents={events}
          initialSelectedEventId={initialSelectedEventId}
          initialFlightData={initialFlightData}
        />
      </div>
    </div>
  );
}
