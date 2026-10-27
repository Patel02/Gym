"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { randomBytes, randomInt } from "crypto";
import { z } from "zod";
import { generateQrDataUrl } from "@/lib/qr-generator";

// Internal imports (used by async functions in this file only)
import type { RefereeCategoryType, OfficialRoleType } from "@/lib/referee-constants";
import { CATEGORY_META, ROLE_LABELS } from "@/lib/referee-constants";

// Type-cast prisma client to avoid language-server cache desync for newly generated models
const db = prisma as any;

// RefereePassPayload is a pure TS interface (type-only, erased at runtime)
// so it's safe to export from a "use server" file.
export interface RefereePassPayload {
  refereeId: string;
  name: string;
  email: string | null;
  image: string | null;
  role: string;
  licenseNumber: string;
  category: RefereeCategoryType;
  categoryLabel: string;
  stateAffiliation: string;
  status: "ACTIVE" | "EXPIRED" | "SUSPENDED";
  totalMeetsJudged: number;
  licenseValidUntil: string;
  qrDataUrl: string;
  verificationUrl: string;
  currentAssignments: Array<{
    id: string;
    eventTitle: string;
    platformName: string;
    role: OfficialRoleType;
    roleLabel: string;
    shiftDate: string;
    flightGroup: string | null;
  }>;
  tenantOrganizationName: string;
  tenantTagline: string;
  tenantLogoUrl: string | null;
  primaryColor: string;
  sealText: string;
  presidentName: string;
  secretaryName: string;
}

/**
 * 1. List all Referees in the system with their active license and meet assignments
 */
export async function listAllRefereesAction() {
  try {
    const session = await auth();
    if (
      session?.user?.role !== "ADMIN" &&
      session?.user?.role !== "SUPER_ADMIN" &&
      session?.user?.role !== "REFEREE"
    ) {
      return { success: false, error: "Unauthorized. Admin or Official access required." };
    }

    const referees = await db.user.findMany({
      where: {
        OR: [{ role: "REFEREE" }, { refereeProfile: { isNot: null } }],
      },
      include: {
        refereeProfile: {
          include: {
            assignments: {
              include: {
                event: {
                  select: { id: true, title: true, date: true, location: true },
                },
              },
              orderBy: { shiftDate: "asc" },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const meets = await db.event.findMany({
      select: {
        id: true,
        title: true,
        date: true,
        location: true,
        status: true,
      },
      orderBy: { date: "desc" },
      take: 20,
    });

    return { success: true, referees, availableMeets: meets };
  } catch (err: any) {
    console.error("listAllRefereesAction error:", err);
    return { success: false, error: err.message || "Failed to list referees." };
  }
}

/**
 * 2. Create or Register an Official Referee account with license credentials
 */
export async function createOrRegisterRefereeAction(data: {
  name: string;
  email: string;
  phone?: string;
  password?: string;
  category: RefereeCategoryType;
  stateAffiliation: string;
  validYears?: number;
}) {
  try {
    const session = await auth();
    if (!session?.user?.id || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return { success: false, error: "Unauthorized. Admin privileges required." };
    }

    const parsed = z
      .object({
        name: z.string().trim().min(1).max(100),
        email: z.string().trim().email().transform((email) => email.toLowerCase()),
        phone: z.string().trim().max(32).optional(),
        password: z
          .string()
          .min(12)
          .refine((password) => Buffer.byteLength(password, "utf8") <= 72),
        category: z.enum(["STATE_CAT_2", "NATIONAL_CAT_2", "NATIONAL_CAT_1", "IPF_INTERNATIONAL"]),
        stateAffiliation: z.string().trim().min(1).max(120),
        validYears: z.number().int().min(1).max(5).optional(),
      })
      .safeParse(data);
    if (!parsed.success) {
      return { success: false, error: "Provide valid referee details and a password of at least 12 characters." };
    }
    const trimmedEmail = parsed.data.email;
    const trimmedName = parsed.data.name;
    const sanitizedPhone = parsed.data.phone || null;

    const randomSuffix = randomInt(1000, 10000).toString();
    const licenseNumber = `IPF-REF-2026-${randomSuffix}`;

    const validYears = parsed.data.validYears ?? 2;
    const licenseValidUntil = new Date(Date.now() + validYears * 365 * 24 * 60 * 60 * 1000);

    let user = await db.user.findUnique({
      where: { email: trimmedEmail },
      include: { refereeProfile: true },
    });

    if (user && user.refereeProfile) {
      return {
        success: false,
        error: "A referee profile already exists for this email address.",
      };
    }

    const hashedPassword = await bcrypt.hash(parsed.data.password, 12);

    if (!user) {
      user = await db.user.create({
        data: {
          name: trimmedName,
          email: trimmedEmail,
          phone: sanitizedPhone,
          password: hashedPassword,
          role: "REFEREE",
          isActive: true,
        },
        include: { refereeProfile: true },
      });
    } else {
      // Elevate or ensure role is REFEREE
      user = await db.user.update({
        where: { id: user.id },
        data: { 
          role: "REFEREE",
          ...(sanitizedPhone && { phone: sanitizedPhone }),
        },
        include: { refereeProfile: true },
      });
    }

    if (sanitizedPhone) {
      await db.profile.updateMany({
        where: { userId: user.id },
        data: { phoneNumber: sanitizedPhone },
      });
    }

    // Create RefereeProfile
    const profile = await db.refereeProfile.create({
      data: {
        userId: user.id,
        licenseNumber,
        category: parsed.data.category,
        stateAffiliation: parsed.data.stateAffiliation,
        isActive: true,
        totalMeetsJudged: 0,
        licenseValidUntil,
      },
    });

    // Audit log
    await db.auditLog.create({
      data: {
        adminId: session.user.id,
        action: "RECRUIT_REFEREE",
        entityType: "REFEREE",
        entityId: profile.id,
        details: JSON.stringify({
          name: trimmedName,
          email: trimmedEmail,
          licenseNumber,
          category: parsed.data.category,
          timestamp: new Date().toISOString(),
        }),
      },
    });

    revalidatePath("/admin/referees");
    revalidatePath("/super-admin");

    return {
      success: true,
      message: `Official Referee ${trimmedName} licensed successfully (${licenseNumber}).`,
      referee: { ...user, refereeProfile: profile },
    };
  } catch (err: any) {
    console.error("createOrRegisterRefereeAction error:", err);
    return { success: false, error: err.message || "Failed to create referee profile." };
  }
}

/**
 * 3. Update an existing Referee's license category, status, or validity
 */
export async function updateRefereeLicenseAction(data: {
  refereeProfileId: string;
  name?: string;
  phone?: string;
  category?: RefereeCategoryType;
  stateAffiliation?: string;
  isActive?: boolean;
  extendYears?: number;
}) {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN" && session?.user?.role !== "SUPER_ADMIN") {
      return { success: false, error: "Unauthorized. Admin privileges required." };
    }

    const currentProfile = await db.refereeProfile.findUnique({
      where: { id: data.refereeProfileId },
      include: { user: true },
    });

    if (!currentProfile) {
      return { success: false, error: "Referee profile not found." };
    }

    if (data.name || data.phone !== undefined) {
      const userUpdates: any = {};
      if (data.name) userUpdates.name = data.name.trim();
      if (data.phone !== undefined) userUpdates.phone = data.phone.trim() || null;

      await db.user.update({
        where: { id: currentProfile.userId },
        data: userUpdates,
      });

      if (data.phone !== undefined) {
        await db.profile.updateMany({
          where: { userId: currentProfile.userId },
          data: { phoneNumber: data.phone.trim() || null },
        });
      }
    }

    const updateData: any = {};
    if (data.category) updateData.category = data.category;
    if (data.stateAffiliation) updateData.stateAffiliation = data.stateAffiliation.trim();
    if (typeof data.isActive === "boolean") updateData.isActive = data.isActive;

    if (data.extendYears && data.extendYears > 0) {
      const currentValid = new Date(currentProfile.licenseValidUntil);
      const baseDate = currentValid > new Date() ? currentValid : new Date();
      updateData.licenseValidUntil = new Date(
        baseDate.getTime() + data.extendYears * 365 * 24 * 60 * 60 * 1000
      );
    }

    const updated = await db.refereeProfile.update({
      where: { id: data.refereeProfileId },
      data: updateData,
    });

    await db.auditLog.create({
      data: {
        adminId: session.user.id,
        action: "UPDATE_REFEREE_LICENSE",
        entityType: "REFEREE",
        entityId: data.refereeProfileId,
        details: JSON.stringify({
          updatedFields: Object.keys(updateData),
          timestamp: new Date().toISOString(),
        }),
      },
    });

    revalidatePath("/admin/referees");
    revalidatePath("/super-admin");

    return {
      success: true,
      message: `Referee license updated successfully.`,
      refereeProfile: updated,
    };
  } catch (err: any) {
    console.error("updateRefereeLicenseAction error:", err);
    return { success: false, error: err.message || "Failed to update referee license." };
  }
}

/**
 * 4. Assign an Official Referee to a Meet, Platform, and Role
 */
export async function assignRefereeToMeetAction(data: {
  refereeProfileId: string;
  eventId: string;
  platformName: string;
  role: OfficialRoleType;
  flightGroup?: string;
  shiftDate: string;
}) {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN" && session?.user?.role !== "SUPER_ADMIN") {
      return { success: false, error: "Unauthorized. Admin privileges required." };
    }

    // Verify referee exists and is active
    const referee = await db.refereeProfile.findUnique({
      where: { id: data.refereeProfileId },
      include: { user: true },
    });

    if (!referee || !referee.isActive) {
      return { success: false, error: "Referee is inactive or not found." };
    }

    // Ensure event exists
    let event = await db.event.findUnique({
      where: { id: data.eventId },
    });

    if (!event) {
      return { success: false, error: "Event championship not found." };
    }

    const parsedShift = new Date(data.shiftDate);
    const validShiftDate = isNaN(parsedShift.getTime()) ? new Date() : parsedShift;

    // Check for platform role conflict (e.g. Can't have two Chief Referees on Platform 1)
    const existingRoleHolder = await db.refereeAssignment.findFirst({
      where: {
        eventId: data.eventId,
        platformName: data.platformName,
        role: data.role,
        refereeProfileId: { not: data.refereeProfileId },
      },
      include: { refereeProfile: { include: { user: true } } },
    });

    if (existingRoleHolder) {
      return {
        success: false,
        error: `Conflict: ${existingRoleHolder.refereeProfile?.user?.name || "Another official"} is already assigned as ${ROLE_LABELS[data.role]} on ${data.platformName}.`,
      };
    }

    // Upsert assignment
    const assignment = await db.refereeAssignment.upsert({
      where: {
        refereeProfileId_eventId_role: {
          refereeProfileId: data.refereeProfileId,
          eventId: data.eventId,
          role: data.role,
        },
      },
      update: {
        platformName: data.platformName,
        flightGroup: data.flightGroup || "Flight A",
        shiftDate: validShiftDate,
        status: "ASSIGNED",
      },
      create: {
        refereeProfileId: data.refereeProfileId,
        eventId: data.eventId,
        platformName: data.platformName,
        role: data.role,
        flightGroup: data.flightGroup || "Flight A",
        shiftDate: validShiftDate,
        status: "ASSIGNED",
      },
    });

    // Increment meets judged metric
    await db.refereeProfile.update({
      where: { id: data.refereeProfileId },
      data: { totalMeetsJudged: { increment: 1 } },
    });

    await db.auditLog.create({
      data: {
        adminId: session.user.id,
        action: "ASSIGN_REFEREE_MEET",
        entityType: "REFEREE_ASSIGNMENT",
        entityId: assignment.id,
        details: JSON.stringify({
          referee: referee.user.name,
          event: event.title,
          platform: data.platformName,
          role: data.role,
          timestamp: new Date().toISOString(),
        }),
      },
    });

    revalidatePath("/admin/referees");
    revalidatePath("/referee/dashboard");

    return {
      success: true,
      message: `${referee.user.name} assigned as ${ROLE_LABELS[data.role]} on ${data.platformName}.`,
      assignment,
    };
  } catch (err: any) {
    console.error("assignRefereeToMeetAction error:", err);
    return { success: false, error: err.message || "Failed to assign referee." };
  }
}

/**
 * 5. Remove an assignment
 */
export async function removeRefereeAssignmentAction(assignmentId: string) {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN" && session?.user?.role !== "SUPER_ADMIN") {
      return { success: false, error: "Unauthorized. Admin privileges required." };
    }

    await db.refereeAssignment.delete({
      where: { id: assignmentId },
    });

    revalidatePath("/admin/referees");
    revalidatePath("/referee/dashboard");

    return { success: true, message: "Official assignment removed successfully." };
  } catch (err: any) {
    console.error("removeRefereeAssignmentAction error:", err);
    return { success: false, error: err.message || "Failed to remove assignment." };
  }
}

/**
 * 6. Get official Referee Digital Credential & Jury Pass
 */
export async function getRefereeCredentialPassAction(
  targetUserId?: string
): Promise<{
  success: boolean;
  pass?: RefereePassPayload;
  error?: string;
}> {
  try {
    const session = await auth();
    const effectiveUserId = targetUserId || session?.user?.id;

    if (!effectiveUserId) {
      return { success: false, error: "Authentication required" };
    }

    const user = await db.user.findUnique({
      where: { id: effectiveUserId },
      include: {
        refereeProfile: {
          include: {
            assignments: {
              include: {
                event: {
                  select: { title: true, date: true, location: true },
                },
              },
              orderBy: { shiftDate: "asc" },
            },
          },
        },
      },
    });

    if (!user || !user.refereeProfile) {
      return { success: false, error: "Referee official profile not found." };
    }

    const profile = user.refereeProfile;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const verificationUrl = `${appUrl}/verify/${profile.licenseNumber}`;

    const qrDataUrl = await generateQrDataUrl(verificationUrl, {
      width: 320,
      margin: 1,
      color: { dark: "#000000", light: "#ffffff" },
    });

    const isExpired = new Date(profile.licenseValidUntil) < new Date();
    const status = !profile.isActive ? "SUSPENDED" : isExpired ? "EXPIRED" : "ACTIVE";

    // Query active tenant branding
    const activeBranding = await db.tenantBranding.findFirst({
      where: { isApproved: true },
      orderBy: { updatedAt: "desc" },
    });

    const categoryMeta =
      CATEGORY_META[profile.category as RefereeCategoryType] ||
      CATEGORY_META.NATIONAL_CAT_2;

    const pass: RefereePassPayload = {
      refereeId: profile.id,
      name: user.name || "Technical Official",
      email: user.email,
      image: user.image,
      role: user.role,
      licenseNumber: profile.licenseNumber,
      category: profile.category as RefereeCategoryType,
      categoryLabel: categoryMeta.label,
      stateAffiliation: profile.stateAffiliation,
      status,
      totalMeetsJudged: profile.totalMeetsJudged,
      licenseValidUntil: new Date(profile.licenseValidUntil).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      qrDataUrl,
      verificationUrl,
      currentAssignments: (profile.assignments || []).map((a: any) => ({
        id: a.id,
        eventTitle: a.event?.title || "Championship Meet",
        platformName: a.platformName,
        role: a.role as OfficialRoleType,
        roleLabel: ROLE_LABELS[a.role as OfficialRoleType] || a.role,
        shiftDate: new Date(a.shiftDate).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
        flightGroup: a.flightGroup,
      })),
      tenantOrganizationName:
        activeBranding?.organizationName || "Indian Powerlifting Federation",
      tenantTagline:
        activeBranding?.tagline || "Official Technical Official Accreditation",
      tenantLogoUrl: activeBranding?.logoUrl || null,
      primaryColor: activeBranding?.primaryColor || "#e6501b",
      sealText: activeBranding?.sealText || "OFFICIAL RATIFIED SEAL",
      presidentName: activeBranding?.presidentName || "President",
      secretaryName: activeBranding?.secretaryName || "General Secretary",
    };

    return { success: true, pass };
  } catch (err: any) {
    console.error("getRefereeCredentialPassAction error:", err);
    return { success: false, error: err.message || "Failed to load referee pass." };
  }
}

/**
 * 7. Seed Sample Referees if none exist in the database
 */
export async function seedSampleRefereesAction() {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN" && session?.user?.role !== "SUPER_ADMIN") {
      return { success: false, error: "Unauthorized. Admin privileges required." };
    }

    const existingCount = await db.refereeProfile.count();
    if (existingCount > 0) {
      return { success: true, message: `System already has ${existingCount} referees.` };
    }

    const validUntil = new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000);

    const sampleReferees = [
      {
        name: "Vikram Sharma",
        email: "referee.vikram@wpigujarat.in",
        category: "IPF_INTERNATIONAL" as RefereeCategoryType,
        stateAffiliation: "Gujarat State Powerlifting Association",
        licenseNumber: "IPF-REF-2026-INT1",
        totalMeetsJudged: 18,
      },
      {
        name: "Rajesh Kulkarni",
        email: "referee.rajesh@wpigujarat.in",
        category: "NATIONAL_CAT_1" as RefereeCategoryType,
        stateAffiliation: "Maharashtra State Association",
        licenseNumber: "IPF-REF-2026-NAT1",
        totalMeetsJudged: 12,
      },
      {
        name: "Ananya Dave",
        email: "referee.ananya@wpigujarat.in",
        category: "NATIONAL_CAT_2" as RefereeCategoryType,
        stateAffiliation: "Gujarat State Powerlifting Association",
        licenseNumber: "IPF-REF-2026-NAT2",
        totalMeetsJudged: 6,
      },
    ];

    for (const ref of sampleReferees) {
      const passwordHash = await bcrypt.hash(randomBytes(32).toString("hex"), 12);
      const user = await db.user.upsert({
        where: { email: ref.email },
        update: { role: "REFEREE" },
        create: {
          name: ref.name,
          email: ref.email,
          password: passwordHash,
          role: "REFEREE",
          isActive: true,
        },
      });

      await db.refereeProfile.upsert({
        where: { userId: user.id },
        update: {},
        create: {
          userId: user.id,
          licenseNumber: ref.licenseNumber,
          category: ref.category,
          stateAffiliation: ref.stateAffiliation,
          totalMeetsJudged: ref.totalMeetsJudged,
          licenseValidUntil: validUntil,
          isActive: true,
        },
      });
    }

    revalidatePath("/admin/referees");
    return { success: true, message: "Sample accredited referees seeded successfully!" };
  } catch (err: any) {
    console.error("seedSampleRefereesAction error:", err);
    return { success: false, error: err.message || "Failed to seed sample referees." };
  }
}
