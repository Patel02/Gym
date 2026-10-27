import { auth } from "@/auth";
import AthletesManager from "@/components/admin/AthletesManager";
import { AdminAthleteDto } from "@/actions/admin-athletes.actions";
import { prisma } from "@/lib/prisma";
import { PageNavigation } from "@/components/ui/PageNavigation";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminAthletesPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN" && session?.user?.role !== "SUPER_ADMIN") {
    redirect("/login?callbackUrl=/admin/athletes");
  }

  let initialAthletes: AdminAthleteDto[] = [];

  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        profile: {
          select: {
            gender: true,
            weightClass: true,
            phoneNumber: true,
            coachPhone: true,
            coachName: true,
          },
        },
        memberships: {
          where: { status: "ACTIVE" },
          take: 1,
          orderBy: { endDate: "desc" },
          select: {
            id: true,
            cardNumber: true,
            planType: true,
            status: true,
            endDate: true,
          },
        },
        _count: {
          select: { registrations: true },
        },
      },
    });

    initialAthletes = users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone || u.profile?.phoneNumber || null,
      image: u.image,
      role: u.role,
      createdAt: u.createdAt,
      profile: u.profile,
      activeMembership: u.memberships[0] || null,
      registrationsCount: u._count.registrations,
    }));
  } catch (err) {
    console.error("Failed to load athletes in AdminAthletesPage:", err);
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
            { label: "Athlete Directory" },
          ]}
          badge="Lifter Registry"
          className="mb-8"
        />

        {/* Interactive Athletes Manager */}
        <AthletesManager initialAthletes={initialAthletes} />
      </div>
    </div>
  );
}
