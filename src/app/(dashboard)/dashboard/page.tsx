import { auth } from "@/auth";
import { UserCard } from "@/components/dashboard/UserCard";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { MembershipCheckout } from "@/components/dashboard/MembershipCheckout";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/login?callbackUrl=/dashboard");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      profile: true,
      memberships: {
        where: { status: "ACTIVE" },
        orderBy: { endDate: "desc" },
        take: 1,
      },
    },
  });

  if (!user) {
    return <div className="flex min-h-screen items-center justify-center bg-gym-black text-white">Account not found. Please contact support.</div>;
  }

  const membership = user.memberships[0];
  const formattedUser = {
    name: user.name,
    email: user.email,
    image: user.image,
    role: user.role,
    profile: user.profile,
    activeMembership: membership
      ? { cardNumber: membership.cardNumber, planType: membership.planType, status: membership.status, endDate: membership.endDate }
      : null,
  };

  return (
    <div className="min-h-screen bg-gym-black px-6 pb-20 pt-32 text-white md:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between gap-4"><h1 className="font-heading text-3xl font-black uppercase tracking-wider">Athlete <span className="text-gym-orange">Headquarters</span></h1><LogoutButton /></div>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div>
            <UserCard user={formattedUser} />
            {!membership && <MembershipCheckout />}
          </div>
          <div className="flex flex-col items-center justify-center border border-white/10 bg-[#0a0a0a] p-8 text-center lg:col-span-2">
            <h2 className="mb-4 font-heading text-2xl font-black uppercase tracking-wider">Meet History &amp; PR Tracker</h2>
            <p className="max-w-md font-medium text-gray-500">Register for your first sanctioned meet to unlock the performance tracker, Wilks history, and IPF GL progression charts.</p>
          </div>
        </div>
      </div>
    </div>
  );
}