"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { timingSafeEqual } from "crypto";
import { z } from "zod";
import { consumeRateLimit, getClientIp } from "@/lib/rate-limit";

export type AdminRoleType = "ADMIN" | "MEET_DIRECTOR" | "REFEREE";

const ALL_PERMISSIONS = [
  "MANAGE_MEETS",
  "MANAGE_MEMBERS",
  "MANAGE_RECORDS",
  "LIVE_SCORING",
  "CMS_PUBLISH",
] as const;

export type PermissionType = (typeof ALL_PERMISSIONS)[number];

// Helper to strictly enforce Super Admin authorization
async function ensureSuperAdmin() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "SUPER_ADMIN") {
    throw new Error("UNAUTHORIZED: Exclusive Super Admin access required.");
  }

  const superAdmin = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, phone: true, role: true, isActive: true },
  });

  if (!superAdmin || superAdmin.role !== "SUPER_ADMIN" || superAdmin.isActive === false) {
    throw new Error("UNAUTHORIZED: Invalid or revoked Super Admin privileges.");
  }

  return superAdmin;
}

// 1. Fetch complete Super Admin Dashboard data
export async function getSuperAdminDashboardDataAction() {
  try {
    const superAdmin = await ensureSuperAdmin();

    let totalMeets = 0;
    try {
      const fs = await import("fs/promises");
      const path = await import("path");
      const fileData = await fs.readFile(
        path.join(process.cwd(), "src", "data", "federation-events.json"),
        "utf-8"
      );
      const parsed = JSON.parse(fileData);
      totalMeets = parsed.events?.length || 0;
    } catch {
      totalMeets = 0;
    }

    const [
      totalAdmins,
      activeAdmins,
      suspendedAdmins,
      totalReferees,
      totalMembers,
      allAdminUsers,
      recentAuditLogs,
    ] = await Promise.all([
      prisma.user.count({
        where: { role: "ADMIN" },
      }),
      prisma.user.count({
        where: { role: "ADMIN", isActive: true },
      }),
      prisma.user.count({
        where: { role: "ADMIN", isActive: false },
      }),
      prisma.user.count({
        where: { role: "REFEREE" },
      }),
      prisma.user.count({
        where: { role: "MEMBER" },
      }),
      prisma.user.findMany({
        where: {
          role: { in: ["SUPER_ADMIN", "ADMIN", "MEET_DIRECTOR"] },
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          permissions: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: { auditLogs: true },
          },
        },
        orderBy: [
          { role: "desc" }, // SUPER_ADMIN first
          { createdAt: "asc" },
        ],
      }),
      prisma.auditLog.findMany({
        take: 30,
        orderBy: { timestamp: "desc" },
        include: {
          admin: {
            select: { name: true, email: true, role: true },
          },
        },
      }),
    ]);

    return {
      success: true,
      currentSuperAdmin: superAdmin,
      stats: {
        totalAdmins,
        activeAdmins,
        suspendedAdmins,
        totalReferees,
        totalMembers,
        totalMeets,
      },
      admins: allAdminUsers,
      recentAuditLogs,
      availablePermissions: ALL_PERMISSIONS,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Failed to load Super Admin dashboard data.",
    };
  }
}

// 2. Create a new Admin account
export async function createAdminAction(data: {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: "ADMIN" | "MEET_DIRECTOR";
  permissions: PermissionType[];
}) {
  try {
    const superAdmin = await ensureSuperAdmin();
    const parsed = z
      .object({
        name: z.string().trim().min(1).max(100),
        email: z.string().trim().email().transform((email) => email.toLowerCase()),
        password: z
          .string()
          .min(12)
          .refine((password) => Buffer.byteLength(password, "utf8") <= 72),
        phone: z.string().trim().max(32).optional(),
        role: z.enum(["ADMIN", "MEET_DIRECTOR"]).optional(),
        permissions: z.array(z.enum(ALL_PERMISSIONS)).max(ALL_PERMISSIONS.length),
      })
      .safeParse(data);
    if (!parsed.success) {
      return { success: false, error: "Please provide valid admin details and a strong password." };
    }

    const { name, email, password, permissions } = parsed.data;
    const phone = parsed.data.phone || null;
    const targetRole = parsed.data.role ?? "ADMIN";

    // Check if email already registered
    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      return { success: false, error: `An account with email '${email}' already exists.` };
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newAdmin = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        role: targetRole,
        permissions,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        permissions: true,
        isActive: true,
        createdAt: true,
      },
    });

    // Record audit log
    await prisma.auditLog.create({
      data: {
        adminId: superAdmin.id,
        action: "CREATE_ADMIN",
        entityType: "User",
        entityId: newAdmin.id,
        details: `Super Admin created ${targetRole}: ${name} (${email}, Phone: ${phone || "None"}) with permissions: ${data.permissions.join(", ") || "None"}`,
      },
    });

    revalidatePath("/super-admin");
    return {
      success: true,
      message: `Admin account '${email}' created successfully!`,
      admin: newAdmin,
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Error creating admin account." };
  }
}

// 3. Update Admin Permissions and Profile
export async function updateAdminPermissionsAction(data: {
  adminId: string;
  name?: string;
  phone?: string;
  permissions: PermissionType[];
  role?: "ADMIN" | "MEET_DIRECTOR";
}) {
  try {
    const superAdmin = await ensureSuperAdmin();

    const targetUser = await prisma.user.findUnique({
      where: { id: data.adminId },
    });

    if (!targetUser) {
      return { success: false, error: "Target administrator not found." };
    }

    // Guard: Cannot alter Super Admin through this action
    if (targetUser.role === "SUPER_ADMIN" && targetUser.id !== superAdmin.id) {
      return { success: false, error: "Cannot alter Super Admin via this action." };
    }

    const updatedRole = targetUser.role === "SUPER_ADMIN" 
      ? "SUPER_ADMIN" 
      : (data.role === "MEET_DIRECTOR" ? "MEET_DIRECTOR" : "ADMIN");

    const newPhone = data.phone !== undefined ? (data.phone.trim() || null) : undefined;

    const updated = await prisma.user.update({
      where: { id: data.adminId },
      data: {
        name: data.name?.trim() || targetUser.name,
        ...(newPhone !== undefined && { phone: newPhone }),
        permissions: data.permissions as any,
        role: updatedRole,
      },
    });

    // Also sync with Profile table if phone was explicitly provided and a profile exists
    if (newPhone !== undefined) {
      await prisma.profile.updateMany({
        where: { userId: data.adminId },
        data: { phoneNumber: newPhone },
      });
    }

    await prisma.auditLog.create({
      data: {
        adminId: superAdmin.id,
        action: "UPDATE_ADMIN_PERMISSIONS",
        entityType: "User",
        entityId: targetUser.id,
        details: `Updated info for ${updated.name} (${updated.email}, Phone: ${newPhone ?? "Unchanged"}): ${data.permissions.join(", ") || "None"}`,
      },
    });

    revalidatePath("/super-admin");
    return { success: true, message: "Admin profile and permissions updated successfully." };
  } catch (err: any) {
    return { success: false, error: err.message || "Error updating permissions." };
  }
}

// 4. Toggle Admin Active Status (Suspend / Reactivate)
export async function toggleAdminStatusAction(adminId: string, shouldBeActive: boolean) {
  try {
    const superAdmin = await ensureSuperAdmin();

    const targetUser = await prisma.user.findUnique({
      where: { id: adminId },
    });

    if (!targetUser) {
      return { success: false, error: "Administrator not found." };
    }

    if (targetUser.role === "SUPER_ADMIN") {
      return { success: false, error: "Root Super Admin account cannot be suspended." };
    }

    await prisma.user.update({
      where: { id: adminId },
      data: { isActive: shouldBeActive },
    });

    await prisma.auditLog.create({
      data: {
        adminId: superAdmin.id,
        action: shouldBeActive ? "REACTIVATE_ADMIN" : "SUSPEND_ADMIN",
        entityType: "User",
        entityId: targetUser.id,
        details: `Super Admin ${shouldBeActive ? "reactivated" : "suspended"} admin account: ${targetUser.email}`,
      },
    });

    revalidatePath("/super-admin");
    return {
      success: true,
      message: `Admin account has been ${shouldBeActive ? "reactivated" : "suspended"}.`,
      isActive: shouldBeActive,
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Error changing admin status." };
  }
}

// 5. Reset Admin Password
export async function resetAdminPasswordAction(adminId: string, newPassword: string) {
  try {
    const superAdmin = await ensureSuperAdmin();

    const parsed = z
      .object({
        adminId: z.string().min(1).max(128),
        newPassword: z
          .string()
          .min(12)
          .refine((password) => Buffer.byteLength(password, "utf8") <= 72),
      })
      .safeParse({ adminId, newPassword });
    if (!parsed.success) {
      return { success: false, error: "Enter a valid account ID and password of at least 12 characters." };
    }
    adminId = parsed.data.adminId;

    const targetUser = await prisma.user.findUnique({
      where: { id: adminId },
    });

    if (!targetUser) {
      return { success: false, error: "Administrator not found." };
    }

    if (targetUser.role === "SUPER_ADMIN" && targetUser.id !== superAdmin.id) {
      return { success: false, error: "Cannot reset Super Admin password via this method." };
    }

    const hashedPassword = await bcrypt.hash(parsed.data.newPassword, 12);

    await prisma.user.update({
      where: { id: adminId },
      data: { password: hashedPassword },
    });

    await prisma.auditLog.create({
      data: {
        adminId: superAdmin.id,
        action: "RESET_ADMIN_PASSWORD",
        entityType: "User",
        entityId: targetUser.id,
        details: `Super Admin reset password for admin: ${targetUser.email}`,
      },
    });

    return {
      success: true,
      message: `Password for ${targetUser.email} has been updated successfully.`,
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Error resetting password." };
  }
}

// 6. Delete Admin Account (Revoke Admin Privileges)
export async function deleteAdminAction(adminId: string) {
  try {
    const superAdmin = await ensureSuperAdmin();

    const targetUser = await prisma.user.findUnique({
      where: { id: adminId },
    });

    if (!targetUser) {
      return { success: false, error: "Administrator not found." };
    }

    if (targetUser.role === "SUPER_ADMIN") {
      return { success: false, error: "Security Violation: Root Super Admin account cannot be deleted." };
    }

    // Demote to MEMBER or delete
    // To preserve athlete history if they were also an athlete, we demote to MEMBER and clear admin permissions,
    // or delete if they are purely an admin. Let's delete user or demote to MEMBER.
    // Let's delete or demote:
    await prisma.user.delete({
      where: { id: adminId },
    });

    await prisma.auditLog.create({
      data: {
        adminId: superAdmin.id,
        action: "DELETE_ADMIN",
        entityType: "User",
        entityId: adminId,
        details: `Super Admin deleted admin account: ${targetUser.name} (${targetUser.email})`,
      },
    });

    revalidatePath("/super-admin");
    return { success: true, message: `Admin account '${targetUser.email}' removed permanently.` };
  } catch (err: any) {
    return { success: false, error: err.message || "Error deleting admin account." };
  }
}

// 7. Update Super Admin's Own Security & Credentials
export async function updateSuperAdminOwnCredentialsAction(data: {
  name?: string;
  email?: string;
  phone?: string;
  currentPassword?: string;
  newPassword?: string;
}) {
  try {
    const superAdmin = await ensureSuperAdmin();

    const currentRecord = await prisma.user.findUnique({
      where: { id: superAdmin.id },
    });

    if (!currentRecord) {
      return { success: false, error: "Super Admin record not found." };
    }

    const updates: any = {};

    if (data.name && data.name.trim()) {
      updates.name = data.name.trim();
    }

    if (data.phone !== undefined) {
      const sanitizedPhone = data.phone.trim() || null;
      updates.phone = sanitizedPhone;
      await prisma.profile.updateMany({
        where: { userId: superAdmin.id },
        data: { phoneNumber: sanitizedPhone },
      });
    }

    if (data.email && data.email.trim().toLowerCase() !== currentRecord.email) {
      const newEmail = data.email.trim().toLowerCase();
      const existing = await prisma.user.findUnique({ where: { email: newEmail } });
      if (existing) {
        return { success: false, error: "This email address is already in use." };
      }
      updates.email = newEmail;
    }

    if (data.newPassword && data.newPassword.trim()) {
      if (!data.currentPassword) {
        return { success: false, error: "Current password is required to change password." };
      }

      const isCurrentValid = await bcrypt.compare(
        data.currentPassword,
        currentRecord.password || ""
      );

      if (!isCurrentValid) {
        return { success: false, error: "Current password is incorrect." };
      }

      if (
        data.newPassword.length < 12 ||
        Buffer.byteLength(data.newPassword, "utf8") > 72
      ) {
        return { success: false, error: "New password must be at least 12 characters long." };
      }

      updates.password = await bcrypt.hash(data.newPassword, 12);
    }

    const updated = await prisma.user.update({
      where: { id: superAdmin.id },
      data: updates,
    });

    await prisma.auditLog.create({
      data: {
        adminId: superAdmin.id,
        action: "SUPER_ADMIN_SELF_UPDATE",
        entityType: "User",
        entityId: superAdmin.id,
        details: `Super Admin updated their own profile (Email: ${updated.email}, Phone: ${updated.phone || "None"})`,
      },
    });

    revalidatePath("/super-admin");
    return { success: true, message: "Super Admin credentials and phone updated successfully!" };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update credentials." };
  }
}

// Helper for Admin or Super Admin access
async function ensureAdminOrSuperAdmin() {
  const session = await auth();
  if (!session?.user?.id || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "ADMIN")) {
    throw new Error("UNAUTHORIZED: Administrator clearance required.");
  }
  return session.user;
}

// 7b. Super Admin & Admin Direct Override: Update any user's (Admin, Referee, Member, Coach) phone number
export async function updateAnyUserPhoneBySuperAdminAction(data: {
  userId: string;
  phone: string;
  coachPhone?: string;
  coachName?: string;
}) {
  try {
    const caller = await ensureAdminOrSuperAdmin();

    const target = await prisma.user.findUnique({
      where: { id: data.userId },
      include: { profile: true },
    });

    if (!target) {
      return { success: false, error: "Target user account not found." };
    }

    const sanitizedPhone = data.phone.trim() || null;
    const sanitizedCoachPhone = data.coachPhone !== undefined ? (data.coachPhone.trim() || null) : undefined;
    const sanitizedCoachName = data.coachName !== undefined ? (data.coachName.trim() || null) : undefined;

    await prisma.user.update({
      where: { id: data.userId },
      data: { phone: sanitizedPhone },
    });

    const profileUpdates: any = { phoneNumber: sanitizedPhone };
    if (sanitizedCoachPhone !== undefined) profileUpdates.coachPhone = sanitizedCoachPhone;
    if (sanitizedCoachName !== undefined) profileUpdates.coachName = sanitizedCoachName;

    await prisma.profile.updateMany({
      where: { userId: data.userId },
      data: profileUpdates,
    });

    await prisma.auditLog.create({
      data: {
        adminId: caller.id,
        action: "UPDATE_USER_PHONE_OVERRIDE",
        entityType: "User",
        entityId: target.id,
        details: `${caller.role} (${caller.email}) updated contact phone for ${target.name} (${target.email}, Role: ${target.role}) to: ${sanitizedPhone || "Cleared"}${sanitizedCoachPhone ? ` (Coach: ${sanitizedCoachPhone})` : ""}`,
      },
    });

    revalidatePath("/super-admin");
    revalidatePath("/admin/athletes");
    return {
      success: true,
      message: `Phone number for ${target.name} updated to ${sanitizedPhone || "Cleared"}!`,
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update phone number." };
  }
}

// 7c. Search Any System User (Coach, Referee, Admin, Athlete) for Quick Emergency Phone Update
export async function searchAllSystemUsersForPhoneAction(query: string) {
  try {
    await ensureAdminOrSuperAdmin();
    const q = query.trim().toLowerCase();

    const users = await prisma.user.findMany({
      where: q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { email: { contains: q, mode: "insensitive" } },
              { phone: { contains: q } },
              { profile: { phoneNumber: { contains: q } } },
              { profile: { coachPhone: { contains: q } } },
              { profile: { coachName: { contains: q, mode: "insensitive" } } },
            ],
          }
        : {},
      take: 25,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        profile: {
          select: {
            phoneNumber: true,
            coachPhone: true,
            coachName: true,
            gender: true,
            weightClass: true,
          },
        },
        refereeProfile: {
          select: {
            licenseNumber: true,
            category: true,
            stateAffiliation: true,
          },
        },
      },
    });

    return { success: true, users };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to search users." };
  }
}

// 8. One-Time Setup Action for Super Admin (Only works if 0 Super Admins exist)
export async function initializeFirstSuperAdminAction(data: {
  email: string;
  password: string;
  name: string;
  masterSetupKey: string;
}) {
  try {
    const throttle = await consumeRateLimit({
      scope: "first-superadmin-setup",
      identifier: await getClientIp(),
      limit: 5,
      windowMs: 60 * 60 * 1000,
    });
    if (!throttle.allowed) {
      return { success: false, error: "Too many setup attempts. Please try again later." };
    }

    const parsed = z
      .object({
        email: z.string().trim().email(),
        password: z
          .string()
          .min(12)
          .refine((password) => Buffer.byteLength(password, "utf8") <= 72),
        name: z.string().trim().min(1).max(100),
        masterSetupKey: z.string().min(32).max(256),
      })
      .safeParse(data);
    if (!parsed.success) {
      return { success: false, error: "Provide valid setup details and a strong password." };
    }

    const configuredKey = process.env.SUPERADMIN_SETUP_KEY;
    if (!configuredKey || configuredKey.length < 32) {
      return { success: false, error: "First-admin setup is not configured on the server." };
    }
    const expectedKey = Buffer.from(configuredKey);
    const suppliedKey = Buffer.from(parsed.data.masterSetupKey);
    if (
      expectedKey.length !== suppliedKey.length ||
      !timingSafeEqual(expectedKey, suppliedKey)
    ) {
      return {
        success: false,
        error: "Invalid first-admin setup key.",
      };
    }

    const email = parsed.data.email.toLowerCase();
    const hashedPassword = await bcrypt.hash(parsed.data.password, 12);
    const initialized = await prisma.$transaction(
      async (transaction) => {
        const existingSuperAdminCount = await transaction.user.count({
          where: { role: "SUPER_ADMIN" },
        });
        if (existingSuperAdminCount > 0) return false;

        const existingUser = await transaction.user.findUnique({ where: { email } });
        if (existingUser) {
          await transaction.user.update({
            where: { id: existingUser.id },
            data: {
              role: "SUPER_ADMIN",
              password: hashedPassword,
              name: parsed.data.name,
              isActive: true,
              permissions: [...ALL_PERMISSIONS],
            },
          });
        } else {
          await transaction.user.create({
            data: {
              email,
              password: hashedPassword,
              name: parsed.data.name,
              role: "SUPER_ADMIN",
              isActive: true,
              permissions: [...ALL_PERMISSIONS],
            },
          });
        }
        return true;
      },
      { isolationLevel: "Serializable" },
    );
    if (!initialized) {
      return {
        success: false,
        error: "System already has a configured Super Admin.",
      };
    }

    return {
      success: true,
      message: "Super Admin account initialized successfully. You may now sign in.",
    };
  } catch (error) {
    console.error(
      "First super-admin initialization failed:",
      error instanceof Error ? error.name : "Unknown error",
    );
    return { success: false, error: "Initialization failed." };
  }
}

// 9. Fetch SaaS Subscriptions & Billing Matrix for Super Admin
export async function getSuperAdminSubscriptionsDataAction() {
  try {
    await ensureSuperAdmin();

    const [subscriptions, allAdmins] = await Promise.all([
      prisma.federationSubscription.findMany({
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              isActive: true,
              branding: true,
            },
          },
        },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.user.findMany({
        where: { role: { in: ["ADMIN", "MEET_DIRECTOR"] } },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          subscription: true,
          branding: true,
        },
      }),
    ]);

    const now = new Date();
    let totalMRR = 0;
    let activeSubsCount = 0;
    let expiredSubsCount = 0;
    let pendingUtrCount = 0;

    const formattedSubscriptions = subscriptions.map((sub) => {
      const isExpired = sub.status === "EXPIRED" || new Date(sub.endDate) < now;
      const effectiveStatus = isExpired && sub.status === "ACTIVE" ? "EXPIRED" : sub.status;

      if (effectiveStatus === "ACTIVE") {
        activeSubsCount++;
        if (sub.planType === "MONTHLY") totalMRR += 2999;
        else if (sub.planType === "SIX_MONTH") totalMRR += Math.round(14999 / 6);
        else if (sub.planType === "YEARLY") totalMRR += Math.round(26999 / 12);
        else if (sub.planType === "ENTERPRISE") totalMRR += Math.round(49999 / 12);
      } else if (effectiveStatus === "EXPIRED") {
        expiredSubsCount++;
      } else if (effectiveStatus === "PENDING_APPROVAL") {
        pendingUtrCount++;
      }

      const diffTime = new Date(sub.endDate).getTime() - now.getTime();
      const daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

      return {
        ...sub,
        effectiveStatus,
        daysRemaining,
      };
    });

    // Admins without an explicit subscription record
    const adminsWithoutSub = allAdmins.filter((a) => !a.subscription);

    return {
      success: true,
      subscriptions: formattedSubscriptions,
      adminsWithoutSub,
      metrics: {
        totalMRR,
        activeSubsCount,
        expiredSubsCount,
        pendingUtrCount,
        totalTenants: allAdmins.length,
      },
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to load subscription data." };
  }
}

// 10. Assign or Upgrade Plan for an Admin
export async function assignPlanToAdminAction(data: {
  userId: string;
  organizationName?: string;
  planType: "FREE" | "MONTHLY" | "SIX_MONTH" | "YEARLY" | "ENTERPRISE";
  durationDays?: number;
  monthlyQuota?: number;
  extraCredits?: number;
}) {
  try {
    const superAdmin = await ensureSuperAdmin();

    const targetUser = await prisma.user.findUnique({
      where: { id: data.userId },
    });

    if (!targetUser) return { success: false, error: "Administrator not found." };

    let duration = data.durationDays || 30;
    let price = 2999;
    let quota = data.monthlyQuota || 4;

    if (data.planType === "FREE") {
      duration = data.durationDays || 365;
      price = 0;
      quota = 1;
    } else if (data.planType === "SIX_MONTH") {
      duration = data.durationDays || 180;
      price = 14999;
      quota = 6;
    } else if (data.planType === "YEARLY") {
      duration = data.durationDays || 365;
      price = 26999;
      quota = 8;
    } else if (data.planType === "ENTERPRISE") {
      duration = data.durationDays || 365;
      price = 49999;
      quota = 20;
    }

    const now = new Date();
    const endDate = new Date(now.getTime() + duration * 24 * 60 * 60 * 1000);

    const sub = await prisma.federationSubscription.upsert({
      where: { userId: data.userId },
      update: {
        planType: data.planType as any,
        status: "ACTIVE",
        organizationName: data.organizationName?.trim() || "State Powerlifting Association",
        startDate: now,
        endDate,
        monthlyEventQuota: quota,
        extraEventCredits: { increment: data.extraCredits || 0 },
        pricePaid: price,
        approvedBy: superAdmin.email || superAdmin.name,
        approvedAt: now,
        reactivationNotes: null,
      },
      create: {
        userId: data.userId,
        planType: data.planType as any,
        status: "ACTIVE",
        organizationName: data.organizationName?.trim() || "State Powerlifting Association",
        startDate: now,
        endDate,
        monthlyEventQuota: quota,
        extraEventCredits: data.extraCredits || 0,
        pricePaid: price,
        approvedBy: superAdmin.email || superAdmin.name,
        approvedAt: now,
      },
    });

    await prisma.auditLog.create({
      data: {
        adminId: superAdmin.id,
        action: "ASSIGN_TENANT_SUBSCRIPTION",
        entityType: "SUBSCRIPTION",
        entityId: sub.id,
        details: `Assigned ${data.planType} plan to ${targetUser.email} valid until ${endDate.toISOString()}`,
      },
    });

    revalidatePath("/super-admin");
    revalidatePath("/admin/subscription");
    return {
      success: true,
      message: `Plan ${data.planType} successfully assigned to ${targetUser.email}! Valid until ${endDate.toLocaleDateString()}.`,
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to assign plan." };
  }
}

// 11. Super Admin 1-Click Approve UTR
export async function superAdminApprovePaymentUtrAction(data: {
  subscriptionId: string;
  approvedPlan?: "FREE" | "MONTHLY" | "SIX_MONTH" | "YEARLY" | "ENTERPRISE";
  bonusCredits?: number;
}) {
  try {
    const superAdmin = await ensureSuperAdmin();

    const sub = await prisma.federationSubscription.findUnique({
      where: { id: data.subscriptionId },
    });

    if (!sub) return { success: false, error: "Subscription record not found." };

    const plan = (data.approvedPlan || sub.reactivationPlanType || sub.planType || "MONTHLY") as any;

    let durationDays = 30;
    let price = 2999;
    if (plan === "SIX_MONTH") {
      durationDays = 180;
      price = 14999;
    } else if (plan === "YEARLY" || plan === "ENTERPRISE") {
      durationDays = 365;
      price = plan === "ENTERPRISE" ? 49999 : 26999;
    }

    const now = new Date();
    const baseDate = new Date(sub.endDate) > now ? new Date(sub.endDate) : now;
    const newEndDate = new Date(baseDate.getTime() + durationDays * 24 * 60 * 60 * 1000);

    await prisma.federationSubscription.update({
      where: { id: data.subscriptionId },
      data: {
        status: "ACTIVE",
        planType: plan,
        startDate: now,
        endDate: newEndDate,
        pricePaid: price,
        extraEventCredits: (sub.extraEventCredits || 0) + (data.bonusCredits || 0),
        approvedBy: superAdmin.email || superAdmin.name,
        approvedAt: now,
        reactivationNotes: null,
      },
    });

    await prisma.auditLog.create({
      data: {
        adminId: superAdmin.id,
        action: "APPROVE_PAYMENT_UTR",
        entityType: "SUBSCRIPTION",
        entityId: sub.id,
        details: `Approved payment UTR: ${sub.paymentUtr || "Manual"} for ${sub.organizationName} (${plan} plan)`,
      },
    });

    revalidatePath("/super-admin");
    revalidatePath("/admin/subscription");
    return {
      success: true,
      message: `Payment UTR approved! ${sub.organizationName} is now ACTIVE until ${newEndDate.toLocaleDateString()}.`,
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to approve payment." };
  }
}

// 12. Super Admin Reject UTR
export async function superAdminRejectPaymentUtrAction(subscriptionId: string, reason?: string) {
  try {
    const superAdmin = await ensureSuperAdmin();

    const sub = await prisma.federationSubscription.findUnique({
      where: { id: subscriptionId },
    });

    if (!sub) return { success: false, error: "Subscription record not found." };

    await prisma.federationSubscription.update({
      where: { id: subscriptionId },
      data: {
        status: "EXPIRED",
        reactivationNotes: `Payment rejected by Super Admin: ${reason || "Invalid UTR / Payment not received"}`,
      },
    });

    await prisma.auditLog.create({
      data: {
        adminId: superAdmin.id,
        action: "REJECT_PAYMENT_UTR",
        entityType: "SUBSCRIPTION",
        entityId: subscriptionId,
        details: `Rejected UTR for ${sub.organizationName}. Reason: ${reason || "Invalid UTR"}`,
      },
    });

    revalidatePath("/super-admin");
    revalidatePath("/admin/subscription");
    return { success: true, message: "Payment UTR rejected and status set to Expired." };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to reject UTR." };
  }
}

// 13. Super Admin Quick Extend 30 Days
export async function superAdminExtendThirtyDaysAction(subscriptionId: string) {
  try {
    const superAdmin = await ensureSuperAdmin();

    const sub = await prisma.federationSubscription.findUnique({
      where: { id: subscriptionId },
    });

    if (!sub) return { success: false, error: "Subscription not found." };

    const now = new Date();
    const baseDate = new Date(sub.endDate) > now ? new Date(sub.endDate) : now;
    const newEndDate = new Date(baseDate.getTime() + 30 * 24 * 60 * 60 * 1000);

    await prisma.federationSubscription.update({
      where: { id: subscriptionId },
      data: {
        status: "ACTIVE",
        endDate: newEndDate,
        approvedBy: superAdmin.email,
        approvedAt: now,
      },
    });

    await prisma.auditLog.create({
      data: {
        adminId: superAdmin.id,
        action: "EXTEND_SUBSCRIPTION_30_DAYS",
        entityType: "SUBSCRIPTION",
        entityId: subscriptionId,
        details: `Extended subscription by 30 days for ${sub.organizationName} until ${newEndDate.toISOString()}`,
      },
    });

    revalidatePath("/super-admin");
    revalidatePath("/admin/subscription");
    return {
      success: true,
      message: `Extended 30 days for ${sub.organizationName}! New expiry: ${newEndDate.toLocaleDateString()}`,
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to extend subscription." };
  }
}
