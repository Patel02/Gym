import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import DopingControlMaster from "@/components/doping-control/DopingControlMaster";

export const metadata: Metadata = {
  title: "Official NADA & WADA Anti-Doping Control & Whereabouts Portal | Indian Powerlifting Federation",
  description:
    "Official Indian Powerlifting Federation Anti-Doping Administration Portal. Meet test draw machine, Chain of Custody sample logging, WADA prohibited substances database, and ADAMS whereabouts filing.",
  openGraph: {
    title: "Official NADA & WADA Anti-Doping Control & Whereabouts Portal",
    description:
      "Tamper-evident A/B bottle sealing, 60-minute chaperone countdown, 30+ prohibited compounds database, and strict liability compliance.",
  },
};

import { PageNavigation } from "@/components/ui/PageNavigation";

export default async function DopingControlPage() {
  const events = await prisma.event.findMany({
    select: {
      id: true,
      title: true,
      date: true,
    },
    orderBy: { date: "desc" },
    take: 10,
  });

  const formattedEvents = events.map((e) => ({
    id: e.id,
    title: e.title,
    date: e.date.toISOString().split("T")[0],
  }));

  return (
    <main className="min-h-screen bg-[#080201] text-white pt-32 sm:pt-36 lg:pt-40 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <PageNavigation
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "IPF Rules", href: "/rules" },
            { label: "NADA & WADA Doping Control Desk" },
          ]}
          badge="Anti-Doping Desk"
        />
        <DopingControlMaster events={formattedEvents} />
      </div>
    </main>
  );
}
