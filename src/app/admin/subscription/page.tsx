import { auth } from "@/auth";
import { getAdminSubscriptionStatusAction } from "@/actions/subscription.actions";
import SubscriptionManager from "@/components/admin/SubscriptionManager";
import { Crown } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PageNavigation } from "@/components/ui/PageNavigation";

export const revalidate = 30;

export default async function AdminSubscriptionPage() {
  const session = await auth();

  if (session?.user?.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const res = await getAdminSubscriptionStatusAction();

  if (!res.success || !res.data) {
    return (
      <div className="min-h-screen bg-gym-black px-6 pt-32 text-white">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-2xl font-bold text-red-400">Failed to load subscription status</h1>
          <p className="mt-2 text-sm text-gray-400">{res.error || "Unknown error"}</p>
          <Link href="/admin" className="mt-4 inline-block text-xs font-bold text-gym-primary">
            ← Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gym-black px-6 pb-24 pt-32 sm:pt-36 lg:pt-40 text-white md:px-12">
      {/* Background Atmosphere */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-32 left-1/3 h-96 w-96 rounded-full bg-gym-primary/15 blur-[140px]" />
        <div className="absolute top-1/2 right-10 h-80 w-80 rounded-full bg-red-600/10 blur-[130px]" />
      </div>

      <div className="mx-auto max-w-6xl">
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <PageNavigation
            backHref="/admin"
            backLabel="Back to Command Center"
            breadcrumbs={[
              { label: "Admin Hub", href: "/admin" },
              { label: "Tenant Subscription & Billing" },
            ]}
            className="mb-0"
          />

          <Link
            href="/admin/saas"
            className="inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-950/40 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-amber-300 hover:bg-amber-900/50 transition-all shadow-[0_0_15px_rgba(245,158,11,0.2)]"
          >
            <Crown className="h-3.5 w-3.5 text-amber-400" />
            <span>Platform Owner SaaS Desk</span>
          </Link>
        </div>

        {/* Page Header */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="rounded-full border border-gym-primary/30 bg-gym-primary/10 px-3 py-0.5 text-[10px] font-black uppercase tracking-widest text-gym-primary">
              Commercial SaaS Tier
            </span>
            <span className="text-xs text-gray-400 font-mono">
              • 4 Events/Month Included • Top-ups Available
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white">
            Federation Subscription & Billing
          </h1>
          <p className="mt-1 text-sm text-gray-400 max-w-2xl">
            Manage your federation license validity, track your monthly championship hosting quota, and request reactivation or extra event slots.
          </p>
        </div>

        {/* Interactive Subscription Component */}
        <SubscriptionManager initialData={res.data} />
      </div>
    </div>
  );
}
