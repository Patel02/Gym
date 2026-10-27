import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import SuperAdminDashboardMaster from "@/components/super-admin/SuperAdminDashboardMaster";
import InitialSuperAdminSetup from "@/components/super-admin/InitialSuperAdminSetup";
import {
  getSuperAdminDashboardDataAction,
  getSuperAdminSubscriptionsDataAction,
} from "@/actions/super-admin.actions";
import { superAdminListAllTenantBrandingsAction } from "@/actions/branding.actions";
import type { Metadata } from "next";

export const revalidate = 30;

export const metadata: Metadata = {
  title: "Super Admin Command Center | WPI Gujarat",
  description: "Root master administration and administrator fleet management console.",
};

export default async function SuperAdminPage() {
  const session = await auth();

  // Check if any Super Admin exists in the database
  const superAdminCount = await prisma.user.count({
    where: { role: "SUPER_ADMIN" },
  }).catch(() => 0);

  // If no Super Admin exists yet, show initial claim setup screen
  if (superAdminCount === 0) {
    return <InitialSuperAdminSetup />;
  }

  // If a Super Admin exists, strictly require SUPER_ADMIN role authentication
  if (!session?.user) {
    redirect("/login?callbackUrl=/super-admin");
  }

  if (session.user.role !== "SUPER_ADMIN") {
    // If ordinary admin accidentally hits this route, redirect to standard admin portal
    if (session.user.role === "ADMIN") {
      redirect("/admin");
    }
    redirect("/dashboard");
  }

  // Fetch complete telemetry, admin fleet, SaaS subscriptions, and tenant brandings
  const [data, subData, brandingsData] = await Promise.all([
    getSuperAdminDashboardDataAction(),
    getSuperAdminSubscriptionsDataAction(),
    superAdminListAllTenantBrandingsAction(),
  ]);

  if (!data.success || !data.currentSuperAdmin) {
    return (
      <div className="min-h-screen bg-[#07090e] text-slate-100 flex items-center justify-center p-4">
        <div className="bg-red-950/40 border border-red-500/40 rounded-2xl p-6 max-w-md text-center">
          <h2 className="text-lg font-bold text-red-400">Access Error</h2>
          <p className="text-sm text-slate-300 mt-2">
            {data.error || "Unable to verify Super Admin privileges."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <SuperAdminDashboardMaster
      initialData={{
        currentSuperAdmin: data.currentSuperAdmin,
        stats: data.stats!,
        admins: data.admins!,
        recentAuditLogs: data.recentAuditLogs!,
        availablePermissions: data.availablePermissions!,
        subscriptionsData: subData.success
          ? {
              subscriptions: subData.subscriptions!,
              adminsWithoutSub: subData.adminsWithoutSub!,
              metrics: subData.metrics!,
            }
          : undefined,
        brandings: brandingsData.success ? (brandingsData.brandings as any) : [],
      }}
    />
  );
}

