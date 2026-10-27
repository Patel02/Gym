import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { PageNavigation } from "@/components/ui/PageNavigation";
import RefereeFleetManager from "@/components/admin/RefereeFleetManager";
import { listAllRefereesAction } from "@/actions/referee-management.actions";
import type { Metadata } from "next";

export const revalidate = 30;

export const metadata: Metadata = {
  title: "Official Referee & Jury Fleet | IPF Technical Committee",
  description: "Accredited referee licensing, platform station assignments, and digital official passes.",
};

export default async function AdminRefereesPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN" && session?.user?.role !== "SUPER_ADMIN") {
    redirect("/dashboard");
  }

  const res = await listAllRefereesAction();
  const referees = res.success && res.referees ? res.referees : [];
  const meets = res.success && res.availableMeets ? res.availableMeets : [];

  return (
    <div className="min-h-screen bg-gym-black px-6 pb-20 pt-32 sm:pt-36 lg:pt-40 text-white md:px-12">
      <div className="mx-auto max-w-7xl">
        {/* Navigation Breadcrumb */}
        <PageNavigation
          backHref="/admin"
          backLabel="Back to Command Center"
          breadcrumbs={[
            { label: "Admin Hub", href: "/admin" },
            { label: "Referee & Jury Fleet" },
          ]}
          badge="Jury Registry"
          className="mb-8"
        />

        {/* Referee Fleet Manager Console */}
        <RefereeFleetManager
          initialReferees={referees}
          availableMeets={meets}
          currentRole={session.user.role}
        />
      </div>
    </div>
  );
}
