import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getTenantBrandingAction } from "@/actions/branding.actions";
import WhiteLabelStudio from "@/components/admin/WhiteLabelStudio";
import type { Metadata } from "next";

export const revalidate = 30;

export const metadata: Metadata = {
  title: "White-Label Branding Studio | Admin Portal",
  description: "Customize federation name, brand colors, certificate signatures, and official seals.",
};

export default async function AdminBrandingPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login?callbackUrl=/admin/branding");
  }

  if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
    redirect("/dashboard");
  }

  const res = await getTenantBrandingAction();

  return (
    <WhiteLabelStudio
      initialBranding={res.branding}
      isSuperAdmin={session.user.role === "SUPER_ADMIN"}
    />
  );
}
