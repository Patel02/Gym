"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { MembershipPlan } from "@prisma/client";

export interface AdminMembershipDto {
  id: string;
  userId: string;
  userName: string | null;
  userEmail: string | null;
  userRole: string;
  planType: MembershipPlan;
  amountPaid: number;
  status: string; // "ACTIVE" | "EXPIRED" | "CANCELLED"
  cardNumber: string;
  startDate: Date;
  endDate: Date;
}

function generateFederationCardNumber() {
  const currentYear = new Date().getFullYear();
  const hexPart = crypto.randomUUID().replaceAll("-", "").slice(0, 5).toUpperCase();
  return `FED-${currentYear}-${hexPart}`;
}

export async function getAdminMembershipsAction(): Promise<{
  success: boolean;
  memberships?: AdminMembershipDto[];
  error?: string;
}> {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN" && session?.user?.role !== "SUPER_ADMIN") {
      return { success: false, error: "Unauthorized. Administrator clearance required." };
    }

    const records = await prisma.membership.findMany({
      orderBy: { startDate: "desc" },
      take: 100,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    const memberships: AdminMembershipDto[] = records.map((m) => ({
      id: m.id,
      userId: m.userId,
      userName: m.user.name,
      userEmail: m.user.email,
      userRole: m.user.role,
      planType: m.planType,
      amountPaid: m.amountPaid,
      status: m.status,
      cardNumber: m.cardNumber,
      startDate: m.startDate,
      endDate: m.endDate,
    }));

    return { success: true, memberships };
  } catch (error: any) {
    console.error("Failed to load admin memberships:", error);
    return { success: false, error: error.message || "Failed to load memberships list." };
  }
}

export async function getAthletesListForMembershipAction(): Promise<{
  success: boolean;
  athletes?: Array<{ id: string; name: string | null; email: string | null; role: string }>;
  error?: string;
}> {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN" && session?.user?.role !== "SUPER_ADMIN") {
      return { success: false, error: "Unauthorized access." };
    }

    const athletes = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
      orderBy: { name: "asc" },
      take: 100,
    });

    return { success: true, athletes };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to query athletes." };
  }
}

export async function createAdminMembershipAction(data: {
  userId: string;
  planType: MembershipPlan;
  amountPaid: number;
  status?: string;
  durationMonths?: number;
  customCardNumber?: string;
  startDate?: string;
  endDate?: string;
}): Promise<{ success: boolean; error?: string; message?: string; cardNumber?: string }> {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN" && session?.user?.role !== "SUPER_ADMIN") {
      return { success: false, error: "Unauthorized. Administrator clearance required." };
    }

    const user = await prisma.user.findUnique({
      where: { id: data.userId },
      select: { id: true, name: true, email: true },
    });

    if (!user) {
      return { success: false, error: "Target athlete not found." };
    }

    const cardNumber = data.customCardNumber?.trim() || generateFederationCardNumber();

    const existingCard = await prisma.membership.findUnique({
      where: { cardNumber },
    });

    if (existingCard) {
      return { success: false, error: `Card number ${cardNumber} is already issued to another membership.` };
    }

    const startDate = data.startDate ? new Date(data.startDate) : new Date();
    let endDate: Date;

    if (data.endDate) {
      endDate = new Date(data.endDate);
    } else {
      const months = data.durationMonths || (data.planType === "LIFETIME" ? 120 : 12);
      endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + months);
    }

    const membership = await prisma.membership.create({
      data: {
        userId: data.userId,
        planType: data.planType,
        amountPaid: Number(data.amountPaid) || 0,
        status: data.status || "ACTIVE",
        cardNumber,
        startDate,
        endDate,
      },
    });

    if (session.user?.id) {
      try {
        await prisma.auditLog.create({
          data: {
            adminId: session.user.id,
            action: "CREATE_MEMBERSHIP",
            entityType: "MEMBERSHIP",
            entityId: membership.id,
            details: JSON.stringify({
              athleteName: user.name,
              athleteEmail: user.email,
              cardNumber,
              planType: data.planType,
              amountPaid: data.amountPaid,
              status: membership.status,
            }),
          },
        });
      } catch (err) {
        console.warn("Audit logging failed:", err);
      }
    }

    revalidatePath("/admin");
    revalidatePath("/admin/memberships");
    revalidatePath("/dashboard");
    return {
      success: true,
      message: `Membership card ${cardNumber} issued successfully to ${user.name || user.email}.`,
      cardNumber,
    };
  } catch (error: any) {
    console.error("Failed to create membership:", error);
    return { success: false, error: error.message || "Failed to create membership pass." };
  }
}

export async function updateAdminMembershipAction(data: {
  id: string;
  planType: MembershipPlan;
  amountPaid: number;
  status: string; // "ACTIVE" | "EXPIRED" | "CANCELLED"
  endDate: string;
}): Promise<{ success: boolean; error?: string; message?: string }> {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN" && session?.user?.role !== "SUPER_ADMIN") {
      return { success: false, error: "Unauthorized. Administrator clearance required." };
    }

    const current = await prisma.membership.findUnique({
      where: { id: data.id },
      include: { user: { select: { name: true, email: true } } },
    });

    if (!current) {
      return { success: false, error: "Membership record not found." };
    }

    const updatedEndDate = new Date(data.endDate);

    const updated = await prisma.membership.update({
      where: { id: data.id },
      data: {
        planType: data.planType,
        amountPaid: Number(data.amountPaid) || 0,
        status: data.status,
        endDate: updatedEndDate,
      },
    });

    if (session.user?.id) {
      try {
        await prisma.auditLog.create({
          data: {
            adminId: session.user.id,
            action: "UPDATE_MEMBERSHIP",
            entityType: "MEMBERSHIP",
            entityId: data.id,
            details: JSON.stringify({
              cardNumber: current.cardNumber,
              oldStatus: current.status,
              newStatus: data.status,
              oldPlan: current.planType,
              newPlan: data.planType,
              amountPaid: data.amountPaid,
              endDate: updated.endDate.toISOString(),
            }),
          },
        });
      } catch (err) {
        console.warn("Audit log error:", err);
      }
    }

    revalidatePath("/admin");
    revalidatePath("/admin/memberships");
    revalidatePath("/dashboard");
    return {
      success: true,
      message: `Membership pass ${current.cardNumber} successfully updated.`,
    };
  } catch (error: any) {
    console.error("Failed to update membership:", error);
    return { success: false, error: error.message || "Failed to update membership." };
  }
}

export async function deleteAdminMembershipAction(
  membershipId: string
): Promise<{ success: boolean; error?: string; message?: string }> {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN" && session?.user?.role !== "SUPER_ADMIN") {
      return { success: false, error: "Unauthorized. Administrator clearance required." };
    }

    const membership = await prisma.membership.findUnique({
      where: { id: membershipId },
      include: { user: { select: { name: true, email: true } } },
    });

    if (!membership) {
      return { success: false, error: "Membership not found." };
    }

    await prisma.membership.delete({
      where: { id: membershipId },
    });

    if (session.user?.id) {
      try {
        await prisma.auditLog.create({
          data: {
            adminId: session.user.id,
            action: "REVOKE_MEMBERSHIP",
            entityType: "MEMBERSHIP",
            entityId: membershipId,
            details: JSON.stringify({
              revokedCardNumber: membership.cardNumber,
              athleteName: membership.user.name,
              athleteEmail: membership.user.email,
              planType: membership.planType,
              revokedAt: new Date().toISOString(),
            }),
          },
        });
      } catch (err) {
        console.warn("Audit logging error:", err);
      }
    }

    revalidatePath("/admin");
    revalidatePath("/admin/memberships");
    revalidatePath("/dashboard");
    return {
      success: true,
      message: `Membership pass ${membership.cardNumber} has been permanently revoked and deleted.`,
    };
  } catch (error: any) {
    console.error("Failed to delete membership:", error);
    return { success: false, error: error.message || "Failed to revoke membership." };
  }
}
