import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import UserProfileEditor from "@/components/dashboard/UserProfileEditor";

export const revalidate = 30;

export const metadata = {
  title: "Athlete Profile & Security | A&T Powerlifting Federation",
  description: "Manage athlete profile, weight category, photo, password security, and account settings.",
};

export default async function UserProfilePage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/login?callbackUrl=/dashboard/profile");
  }

  const db = prisma as any;
  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      profile: true,
      deletionRequest: true,
      memberships: {
        where: { status: "ACTIVE" },
        orderBy: { endDate: "desc" },
        take: 1,
      },
    },
  });

  if (!user) {
    redirect("/login");
  }

  const userRecord = user as any;
  const activeMembership = userRecord.memberships?.[0] || null;

  const initialData = {
    id: userRecord.id,
    name: userRecord.name || "Athlete",
    email: userRecord.email || "",
    image: userRecord.image || null,
    role: userRecord.role,
    phone: userRecord.phone || userRecord.profile?.phoneNumber || "",
    coachPhone: userRecord.profile?.coachPhone || "",
    coachName: userRecord.profile?.coachName || "",
    gender: userRecord.profile?.gender || "MALE",
    weightClass: userRecord.profile?.weightClass || "WC_83",
    createdAt: userRecord.createdAt.toISOString(),
    activeMembership: activeMembership
      ? {
          cardNumber: activeMembership.cardNumber,
          planType: activeMembership.planType,
          status: activeMembership.status,
          endDate: activeMembership.endDate.toISOString(),
        }
      : null,
    deletionRequest: userRecord.deletionRequest
      ? {
          id: userRecord.deletionRequest.id,
          status: userRecord.deletionRequest.status,
          reason: userRecord.deletionRequest.reason || "",
          createdAt: userRecord.deletionRequest.createdAt.toISOString(),
        }
      : null,
  };

  return <UserProfileEditor initialData={initialData} />;
}
