"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export interface TenantBrandingData {
  id?: string;
  userId?: string;
  organizationName: string;
  tagline?: string | null;
  slug?: string | null;
  logoUrl?: string | null;
  primaryColor: string;
  secondaryColor: string;
  sealText?: string | null;
  presidentName?: string | null;
  presidentSignUrl?: string | null;
  secretaryName?: string | null;
  secretarySignUrl?: string | null;
  isApproved?: boolean;
}

const DEFAULT_BRANDING: TenantBrandingData = {
  organizationName: "WPI Association of Gujarat",
  tagline: "Official State Powerlifting Federation & Academy",
  slug: "wpi-gujarat",
  logoUrl: "/wpi-logo.png",
  primaryColor: "#e6501b",
  secondaryColor: "#0a0a0a",
  sealText: "OFFICIAL RATIFIED SEAL • GUJARAT POWERLIFTING",
  presidentName: "Dr. Rakesh Patel",
  presidentSignUrl: null,
  secretaryName: "Sanjay Dave",
  secretarySignUrl: null,
  isApproved: true,
};

// 1. Get Branding for current Admin or specific user
export async function getTenantBrandingAction(targetUserId?: string): Promise<{
  success: boolean;
  branding: TenantBrandingData;
  isCustomized: boolean;
  error?: string;
}> {
  try {
    const session = await auth();
    const effectiveUserId = targetUserId || session?.user?.id;

    if (!effectiveUserId) {
      return {
        success: true,
        branding: DEFAULT_BRANDING,
        isCustomized: false,
      };
    }

    const brandingRecord = await prisma.tenantBranding.findUnique({
      where: { userId: effectiveUserId },
    });

    if (!brandingRecord) {
      // Check if user has organizationName in their subscription
      const sub = await prisma.federationSubscription.findUnique({
        where: { userId: effectiveUserId },
      });

      return {
        success: true,
        branding: {
          ...DEFAULT_BRANDING,
          organizationName: sub?.organizationName || DEFAULT_BRANDING.organizationName,
        },
        isCustomized: false,
      };
    }

    return {
      success: true,
      branding: {
        id: brandingRecord.id,
        userId: brandingRecord.userId,
        organizationName: brandingRecord.organizationName,
        tagline: brandingRecord.tagline,
        slug: brandingRecord.slug,
        logoUrl: brandingRecord.logoUrl,
        primaryColor: brandingRecord.primaryColor || "#e6501b",
        secondaryColor: brandingRecord.secondaryColor || "#0a0a0a",
        sealText: brandingRecord.sealText,
        presidentName: brandingRecord.presidentName,
        presidentSignUrl: brandingRecord.presidentSignUrl,
        secretaryName: brandingRecord.secretaryName,
        secretarySignUrl: brandingRecord.secretarySignUrl,
        isApproved: brandingRecord.isApproved,
      },
      isCustomized: true,
    };
  } catch (err: any) {
    console.error("Failed to load tenant branding:", err);
    return {
      success: false,
      branding: DEFAULT_BRANDING,
      isCustomized: false,
      error: err.message,
    };
  }
}

// 2. Save or Update Tenant Branding
export async function updateTenantBrandingAction(data: {
  userId?: string;
  organizationName: string;
  tagline?: string;
  slug?: string;
  logoUrl?: string;
  primaryColor: string;
  secondaryColor?: string;
  sealText?: string;
  presidentName?: string;
  presidentSignUrl?: string;
  secretaryName?: string;
  secretarySignUrl?: string;
}) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Authentication required." };
    }

    // Role check: must be ADMIN or SUPER_ADMIN
    if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
      return { success: false, error: "Only administrators can customize white-label branding." };
    }

    // If caller is normal ADMIN, they can only edit their own branding
    let targetUserId = session.user.id;
    if (data.userId && session.user.role === "SUPER_ADMIN") {
      targetUserId = data.userId;
    }

    const orgName = data.organizationName.trim();
    if (!orgName) {
      return { success: false, error: "Federation / Gym Name is required." };
    }

    // Auto-generate clean slug if not given
    const generatedSlug = (data.slug || orgName)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    const updated = await prisma.tenantBranding.upsert({
      where: { userId: targetUserId },
      update: {
        organizationName: orgName,
        tagline: data.tagline?.trim() || null,
        slug: generatedSlug,
        logoUrl: data.logoUrl?.trim() || null,
        primaryColor: data.primaryColor || "#e6501b",
        secondaryColor: data.secondaryColor || "#0a0a0a",
        sealText: data.sealText?.trim() || null,
        presidentName: data.presidentName?.trim() || null,
        presidentSignUrl: data.presidentSignUrl?.trim() || null,
        secretaryName: data.secretaryName?.trim() || null,
        secretarySignUrl: data.secretarySignUrl?.trim() || null,
      },
      create: {
        userId: targetUserId,
        organizationName: orgName,
        tagline: data.tagline?.trim() || null,
        slug: generatedSlug,
        logoUrl: data.logoUrl?.trim() || null,
        primaryColor: data.primaryColor || "#e6501b",
        secondaryColor: data.secondaryColor || "#0a0a0a",
        sealText: data.sealText?.trim() || null,
        presidentName: data.presidentName?.trim() || null,
        presidentSignUrl: data.presidentSignUrl?.trim() || null,
        secretaryName: data.secretaryName?.trim() || null,
        secretarySignUrl: data.secretarySignUrl?.trim() || null,
      },
    });

    // Also sync organizationName with their FederationSubscription if present
    await prisma.federationSubscription.updateMany({
      where: { userId: targetUserId },
      data: { organizationName: orgName },
    });

    revalidatePath("/admin/branding");
    revalidatePath("/admin");
    revalidatePath("/super-admin");
    revalidatePath("/");

    return {
      success: true,
      message: "White-label branding saved and applied successfully!",
      branding: updated,
    };
  } catch (err: any) {
    console.error("Update tenant branding error:", err);
    return { success: false, error: err.message || "Failed to save branding." };
  }
}

// 3. Super Admin Action: List all Tenant Brandings
export async function superAdminListAllTenantBrandingsAction() {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "SUPER_ADMIN") {
      return { success: false, error: "Exclusive Super Admin access required." };
    }

    const brandings = await prisma.tenantBranding.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            subscription: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return { success: true, brandings };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to list tenant brandings." };
  }
}

// 4. Super Admin Action: Toggle Tenant Branding Approval
export async function superAdminToggleBrandingApprovalAction(
  brandingId: string,
  isApproved: boolean
) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "SUPER_ADMIN") {
      return { success: false, error: "Exclusive Super Admin access required." };
    }

    const updated = await prisma.tenantBranding.update({
      where: { id: brandingId },
      data: { isApproved },
    });

    await prisma.auditLog.create({
      data: {
        adminId: session.user.id,
        action: isApproved ? "APPROVE_BRANDING" : "SUSPEND_BRANDING",
        entityType: "TENANT_BRANDING",
        entityId: brandingId,
        details: JSON.stringify({
          isApproved,
          organizationName: updated.organizationName,
          timestamp: new Date().toISOString(),
        }),
      },
    });

    revalidatePath("/super-admin");
    revalidatePath("/admin/branding");
    revalidatePath("/championships");
    revalidatePath("/");

    return {
      success: true,
      message: `White-label branding for ${updated.organizationName} is now ${isApproved ? "Approved & Live" : "Suspended"}.`,
      branding: updated,
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update branding approval." };
  }
}

