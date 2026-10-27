"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import fs from "fs/promises";
import path from "path";

// Helper: Ensure the caller is an authenticated ADMIN
async function getAuthenticatedAdmin() {
  const session = await auth();
  if (!session?.user?.id || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
    throw new Error("Unauthorized: Administrative access required.");
  }

  const admin = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!admin || (admin.role !== "ADMIN" && admin.role !== "SUPER_ADMIN")) {
    throw new Error("Admin record not found.");
  }

  return admin;
}

// 1. Get All Pending Account Deletion Requests
export async function getPendingDeletionRequestsAction() {
  try {
    await getAuthenticatedAdmin();
    // Using (prisma as any) ensures full compatibility across TypeScript language servers
    const db = prisma as any;
    const requests = await db.deletionRequest.findMany({
      where: { status: "PENDING" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true,
            createdAt: true,
            profile: {
              select: {
                gender: true,
                weightClass: true,
              },
            },
            memberships: {
              where: { status: "ACTIVE" },
              select: {
                cardNumber: true,
                planType: true,
                endDate: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const formatted = requests.map((req: any) => ({
      id: req.id,
      userId: req.userId,
      reason: req.reason || "No specific reason provided.",
      status: req.status,
      createdAt: req.createdAt.toISOString(),
      user: {
        id: req.user.id,
        name: req.user.name || "Athlete",
        email: req.user.email || "",
        image: req.user.image || null,
        role: req.user.role,
        joinedDate: req.user.createdAt.toISOString(),
        gender: req.user.profile?.gender || "MALE",
        weightClass: req.user.profile?.weightClass || "WC_83",
        activeMembership: req.user.memberships[0] || null,
      },
    }));

    return { success: true, data: formatted };
  } catch (error: any) {
    console.error("[Get Deletion Requests Error]:", error);
    return { success: false, error: error.message || "Failed to fetch deletion requests." };
  }
}

// 2. Approve Deletion Request & Permanently Delete User Account
export async function approveDeletionRequestAction(data: {
  requestId: string;
  userId: string;
}) {
  try {
    const admin = await getAuthenticatedAdmin();
    const { requestId, userId } = data;

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!targetUser) {
      return { success: false, error: "User record does not exist or was already removed." };
    }

    if (targetUser.role === "ADMIN") {
      return { success: false, error: "Safety Block: Cannot delete Administrator accounts via this desk." };
    }

    // Clean up local avatar file if exists
    if (targetUser.image && targetUser.image.startsWith("/uploads/avatars/")) {
      try {
        const filePath = path.join(process.cwd(), "public", targetUser.image.replace(/^\//, ""));
        await fs.unlink(filePath);
      } catch {}
    }

    const userName = targetUser.name || "Unknown";
    const userEmail = targetUser.email || "Unknown";

    // Perform atomic cascade delete
    const db = prisma as any;
    await prisma.$transaction([
      db.deletionRequest.deleteMany({ where: { userId } }),
      prisma.meetRegistration.deleteMany({ where: { userId } }),
      prisma.result.deleteMany({ where: { userId } }),
      prisma.emailOtp.deleteMany({ where: { email: userEmail } }),
      prisma.user.delete({ where: { id: userId } }),
    ]);

    // Record Audit Log
    await prisma.auditLog.create({
      data: {
        adminId: admin.id,
        action: "APPROVED_ACCOUNT_DELETION",
        entityType: "USER",
        entityId: userId,
        details: `Admin approved permanent deletion of user account: ${userName} (${userEmail})`,
      },
    });

    revalidatePath("/admin");
    revalidatePath("/admin/deletion-requests");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: `Account for ${userName} (${userEmail}) has been permanently deleted from the Federation database.`,
    };
  } catch (error: any) {
    console.error("[Approve Deletion Error]:", error);
    return { success: false, error: error.message || "Failed to approve account deletion." };
  }
}

// 3. Reject Account Deletion Request
export async function rejectDeletionRequestAction(data: {
  requestId: string;
  note?: string;
}) {
  try {
    const admin = await getAuthenticatedAdmin();
    const { requestId, note } = data;
    const db = prisma as any;

    const request = await db.deletionRequest.findUnique({
      where: { id: requestId },
      include: { user: true },
    });

    if (!request) {
      return { success: false, error: "Deletion request not found." };
    }

    // Delete or mark request as rejected
    await db.deletionRequest.delete({
      where: { id: requestId },
    });

    // Record Audit Log
    await prisma.auditLog.create({
      data: {
        adminId: admin.id,
        action: "REJECTED_ACCOUNT_DELETION",
        entityType: "USER",
        entityId: request.userId,
        details: `Admin rejected account deletion request for ${request.user.name} (${request.user.email}). Note: ${note || "Dismissed by admin"}`,
      },
    });

    revalidatePath("/admin");
    revalidatePath("/admin/deletion-requests");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/profile");

    return {
      success: true,
      message: `Deletion request rejected. Athlete account for ${request.user.name} remains fully active.`,
    };
  } catch (error: any) {
    console.error("[Reject Deletion Error]:", error);
    return { success: false, error: error.message || "Failed to reject deletion request." };
  }
}
