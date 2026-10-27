"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { Gender, UserRole, WeightClass } from "@prisma/client";
import { z } from "zod";

const passwordSchema = z
  .string()
  .min(12)
  .refine((password) => Buffer.byteLength(password, "utf8") <= 72);
const athleteFieldsSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().transform((email) => email.toLowerCase()),
  phone: z.string().trim().max(32).optional(),
  coachPhone: z.string().trim().max(32).optional(),
  coachName: z.string().trim().max(100).optional(),
  role: z.nativeEnum(UserRole),
  gender: z.nativeEnum(Gender),
  weightClass: z.nativeEnum(WeightClass),
});

export interface AdminAthleteDto {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  image: string | null;
  role: UserRole;
  createdAt: Date;
  profile: {
    gender: Gender;
    weightClass: WeightClass;
    phoneNumber?: string | null;
    coachPhone?: string | null;
    coachName?: string | null;
  } | null;
  activeMembership: {
    id: string;
    cardNumber: string;
    planType: string;
    status: string;
    endDate: Date;
  } | null;
  registrationsCount: number;
}

export async function getAdminAthletesAction(): Promise<{
  success: boolean;
  athletes?: AdminAthleteDto[];
  error?: string;
}> {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN" && session?.user?.role !== "SUPER_ADMIN") {
      return { success: false, error: "Unauthorized. Administrator clearance required." };
    }

    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        profile: {
          select: {
            gender: true,
            weightClass: true,
            phoneNumber: true,
            coachPhone: true,
            coachName: true,
          },
        },
        memberships: {
          where: { status: "ACTIVE" },
          take: 1,
          orderBy: { endDate: "desc" },
          select: {
            id: true,
            cardNumber: true,
            planType: true,
            status: true,
            endDate: true,
          },
        },
        _count: {
          select: { registrations: true },
        },
      },
    });

    const athletes: AdminAthleteDto[] = users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone || u.profile?.phoneNumber || null,
      image: u.image,
      role: u.role,
      createdAt: u.createdAt,
      profile: u.profile,
      activeMembership: u.memberships[0] || null,
      registrationsCount: u._count.registrations,
    }));

    return { success: true, athletes };
  } catch (error: any) {
    console.error("Failed to fetch admin athletes:", error);
    return { success: false, error: error.message || "Failed to load athlete roster." };
  }
}

export async function createAdminAthleteAction(data: {
  name: string;
  email: string;
  phone?: string;
  coachPhone?: string;
  coachName?: string;
  password?: string;
  role: UserRole;
  gender: Gender;
  weightClass: WeightClass;
}): Promise<{ success: boolean; error?: string; message?: string }> {
  try {
    const session = await auth();
    if (!session?.user?.id || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return { success: false, error: "Unauthorized. Administrator clearance required." };
    }

    const parsed = athleteFieldsSchema.extend({ password: passwordSchema }).safeParse(data);
    if (!parsed.success) {
      return { success: false, error: "Provide valid athlete details and a password of at least 12 characters." };
    }

    const { name: trimmedName, email: trimmedEmail, password } = parsed.data;
    const role = parsed.data.role;
    if (role === "SUPER_ADMIN") {
      return { success: false, error: "Super Admin accounts cannot be created here." };
    }
    if (role !== "MEMBER" && session.user.role !== "SUPER_ADMIN") {
      return { success: false, error: "Only a Super Admin can assign privileged account roles." };
    }

    const existing = await prisma.user.findUnique({
      where: { email: trimmedEmail },
    });

    if (existing) {
      return { success: false, error: "An athlete with this email already exists." };
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const phone = parsed.data.phone || null;
    const coachPhone = parsed.data.coachPhone || null;
    const coachName = parsed.data.coachName || null;

    const newUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: trimmedName,
          email: trimmedEmail,
          phone,
          password: hashedPassword,
          role,
        },
      });

      await tx.profile.create({
        data: {
          userId: user.id,
          gender: parsed.data.gender,
          weightClass: parsed.data.weightClass,
          phoneNumber: phone,
          coachPhone,
          coachName,
        },
      });

      return user;
    });

    // Record audit ledger
    if (session.user?.id) {
      try {
        await prisma.auditLog.create({
          data: {
            adminId: session.user.id,
            action: "CREATE_ATHLETE",
            entityType: "USER",
            entityId: newUser.id,
            details: JSON.stringify({
              email: trimmedEmail,
              name: trimmedName,
              phone,
              coachPhone,
              role,
              weightClass: parsed.data.weightClass,
            }),
          },
        });
      } catch (err) {
        console.warn("Audit logging failed:", err);
      }
    }

    revalidatePath("/admin");
    revalidatePath("/admin/athletes");
    return { success: true, message: `Athlete ${trimmedName} successfully registered in roster.` };
  } catch (error: any) {
    console.error("Failed to create athlete:", error);
    return { success: false, error: error.message || "Failed to create athlete record." };
  }
}

export async function updateAdminAthleteAction(data: {
  id: string;
  name: string;
  email: string;
  phone?: string;
  coachPhone?: string;
  coachName?: string;
  role: UserRole;
  gender: Gender;
  weightClass: WeightClass;
  password?: string;
}): Promise<{ success: boolean; error?: string; message?: string }> {
  try {
    const session = await auth();
    if (!session?.user?.id || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return { success: false, error: "Unauthorized. Administrator clearance required." };
    }

    const parsed = athleteFieldsSchema
      .extend({
        id: z.string().min(1).max(128),
        password: z.union([passwordSchema, z.literal("")]).optional(),
      })
      .safeParse(data);
    if (!parsed.success) {
      return { success: false, error: "Provide valid athlete details and a valid password if changing it." };
    }
    const { id, name: trimmedName, email: trimmedEmail, role } = parsed.data;
    if (role === "SUPER_ADMIN") {
      return { success: false, error: "Super Admin roles cannot be assigned from athlete management." };
    }
    if (role !== "MEMBER" && session.user.role !== "SUPER_ADMIN") {
      return { success: false, error: "Only a Super Admin can assign privileged account roles." };
    }

    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (targetUser?.role === "SUPER_ADMIN" && session?.user?.role !== "SUPER_ADMIN") {
      return { success: false, error: "Protected account: Cannot modify the Super Admin." };
    }

    const existingEmail = await prisma.user.findFirst({
      where: { email: trimmedEmail, NOT: { id } },
    });

    if (existingEmail) {
      return { success: false, error: "Another account is already using this email." };
    }

    const phone = parsed.data.phone !== undefined ? (parsed.data.phone || null) : undefined;
    const coachPhone = parsed.data.coachPhone !== undefined ? (parsed.data.coachPhone || null) : undefined;
    const coachName = parsed.data.coachName !== undefined ? (parsed.data.coachName || null) : undefined;

    await prisma.$transaction(async (tx) => {
      const updateData: any = {
        name: trimmedName,
        email: trimmedEmail,
        role,
        ...(phone !== undefined && { phone }),
      };

      if (parsed.data.password) {
        updateData.password = await bcrypt.hash(parsed.data.password, 12);
      }

      await tx.user.update({
        where: { id },
        data: updateData,
      });

      const profileUpdates: any = {
        gender: parsed.data.gender,
        weightClass: parsed.data.weightClass,
      };
      if (phone !== undefined) profileUpdates.phoneNumber = phone;
      if (coachPhone !== undefined) profileUpdates.coachPhone = coachPhone;
      if (coachName !== undefined) profileUpdates.coachName = coachName;

      await tx.profile.upsert({
        where: { userId: id },
        update: profileUpdates,
        create: {
          userId: id,
          gender: parsed.data.gender,
          weightClass: parsed.data.weightClass,
          phoneNumber: phone ?? null,
          coachPhone: coachPhone ?? null,
          coachName: coachName ?? null,
        },
      });
    });

    if (session.user?.id) {
      try {
        await prisma.auditLog.create({
          data: {
            adminId: session.user.id,
            action: "UPDATE_ATHLETE",
            entityType: "USER",
            entityId: data.id,
            details: JSON.stringify({
              name: trimmedName,
              email: trimmedEmail,
              role: data.role,
              weightClass: data.weightClass,
              passwordUpdated: Boolean(data.password && data.password.trim().length >= 6),
            }),
          },
        });
      } catch (err) {
        console.warn("Audit log error:", err);
      }
    }

    revalidatePath("/admin");
    revalidatePath("/admin/athletes");
    return { success: true, message: `Athlete ${trimmedName} updated successfully.` };
  } catch (error: any) {
    console.error("Failed to update athlete:", error);
    return { success: false, error: error.message || "Failed to update athlete details." };
  }
}

export async function deleteAdminAthleteAction(
  athleteId: string
): Promise<{ success: boolean; error?: string; message?: string }> {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN" && session?.user?.role !== "SUPER_ADMIN") {
      return { success: false, error: "Unauthorized. Administrator clearance required." };
    }

    if (session.user.id === athleteId) {
      return { success: false, error: "Security restriction: You cannot delete your own account from here." };
    }

    const athlete = await prisma.user.findUnique({
      where: { id: athleteId },
      select: { name: true, email: true, role: true },
    });

    if (!athlete) {
      return { success: false, error: "Athlete record not found." };
    }

    if (athlete.role === "SUPER_ADMIN") {
      return { success: false, error: "Critical Security Violation: The Root Super Admin account cannot be deleted." };
    }

    await prisma.$transaction(async (tx) => {
      // 1. Delete associated deletion requests
      await (tx as any).deletionRequest.deleteMany({ where: { userId: athleteId } });
      // 2. Delete meet registrations
      await tx.meetRegistration.deleteMany({ where: { userId: athleteId } });
      // 3. Delete results
      await tx.result.deleteMany({ where: { userId: athleteId } });
      // 4. Delete memberships
      await tx.membership.deleteMany({ where: { userId: athleteId } });
      // 5. Delete profile
      await tx.profile.deleteMany({ where: { userId: athleteId } });
      // 6. Delete user
      await tx.user.delete({ where: { id: athleteId } });
    });

    if (session.user?.id) {
      try {
        await prisma.auditLog.create({
          data: {
            adminId: session.user.id,
            action: "DELETE_ATHLETE",
            entityType: "USER",
            entityId: athleteId,
            details: JSON.stringify({
              deletedName: athlete.name,
              deletedEmail: athlete.email,
              deletedRole: athlete.role,
              deletedAt: new Date().toISOString(),
            }),
          },
        });
      } catch (err) {
        console.warn("Audit logging skipped:", err);
      }
    }

    revalidatePath("/admin");
    revalidatePath("/admin/athletes");
    return { success: true, message: `Athlete ${athlete.name || athlete.email} has been permanently deleted.` };
  } catch (error: any) {
    console.error("Failed to delete athlete:", error);
    return { success: false, error: error.message || "Failed to delete athlete record." };
  }
}
