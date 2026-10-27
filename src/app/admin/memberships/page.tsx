import { auth } from "@/auth";
import MembershipsManager from "@/components/admin/MembershipsManager";
import { 
  getAdminMembershipsAction, 
  getAthletesListForMembershipAction 
} from "@/actions/admin-memberships.actions";
import { PageNavigation } from "@/components/ui/PageNavigation";
import { redirect } from "next/navigation";

export const revalidate = 30;

export default async function AdminMembershipsPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const [membershipsRes, athletesRes] = await Promise.all([
    getAdminMembershipsAction(),
    getAthletesListForMembershipAction(),
  ]);

  const initialMemberships = membershipsRes.memberships || [];
  const athletesList = athletesRes.athletes || [];

  return (
    <div className="min-h-screen bg-gym-black px-6 pb-20 pt-32 sm:pt-36 lg:pt-40 text-white md:px-12">
      <div className="mx-auto max-w-7xl">
        {/* Navigation Breadcrumb */}
        <PageNavigation
          backHref="/admin"
          backLabel="Back to Command Center"
          breadcrumbs={[
            { label: "Admin Hub", href: "/admin" },
            { label: "Memberships & Affiliations" },
          ]}
          badge="Registration Ledger"
          className="mb-8"
        />

        {/* Interactive Memberships Manager */}
        <MembershipsManager 
          initialMemberships={initialMemberships} 
          athletesList={athletesList} 
        />
      </div>
    </div>
  );
}
