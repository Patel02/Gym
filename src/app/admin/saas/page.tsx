import { auth } from "@/auth";
import { superAdminListAllSubscriptionsAction } from "@/actions/subscription.actions";
import SaasOwnerConsole from "@/components/admin/SaasOwnerConsole";
import { Crown, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PageNavigation } from "@/components/ui/PageNavigation";

export const revalidate = 30;

export default async function SaasOwnerPage() {
  const session = await auth();

  if (session?.user?.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const res = await superAdminListAllSubscriptionsAction();

  if (!res.success || !res.data) {
    return (
      <div className="min-h-screen bg-gym-black px-6 pt-32 text-white">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-2xl font-bold text-red-400">Failed to load SaaS management console</h1>
          <p className="mt-2 text-sm text-gray-400">{res.error || "Unknown error"}</p>
          <Link href="/admin" className="mt-4 inline-block text-xs font-bold text-gym-primary">
            ← Return to Command Center
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gym-black px-6 pb-24 pt-32 sm:pt-36 lg:pt-40 text-white md:px-12">
      {/* Background Atmosphere */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-32 right-1/4 h-96 w-96 rounded-full bg-amber-500/15 blur-[150px]" />
        <div className="absolute top-1/2 left-10 h-80 w-80 rounded-full bg-gym-primary/15 blur-[140px]" />
      </div>

      <div className="mx-auto max-w-7xl">
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <PageNavigation
            backHref="/admin"
            backLabel="Back to Command Center"
            breadcrumbs={[
              { label: "Admin Hub", href: "/admin" },
              { label: "Platform SaaS Console" },
            ]}
            className="mb-0"
          />

          <Link
            href="/admin/subscription"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-gray-300 hover:text-white hover:bg-white/10 transition-all"
          >
            <span>View Tenant Billing View</span>
          </Link>
        </div>

        {/* Page Header */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-950/40 px-3 py-0.5 text-[10px] font-black uppercase tracking-widest text-amber-300">
              <Crown className="h-3 w-3 text-amber-400" />
              <span>Platform Owner Clearance • Super Admin Console</span>
            </span>
            <span className="text-xs text-gray-400 font-mono">
              • Commercial SaaS Revenue &amp; Approvals Engine
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white">
            SaaS Platform &amp; Subscription Master Control
          </h1>
          <p className="mt-1 text-sm text-gray-400 max-w-3xl">
            As the platform creator, verify incoming subscription payments, approve account reactivations, manage tenant quotas (4 events/month base limit), and grant extra event slots.
          </p>
        </div>

        {/* Console Hub */}
        <SaasOwnerConsole initialData={res.data} />
      </div>
    </div>
  );
}
