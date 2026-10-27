"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { escapeHtml, sendTransactionalEmail } from "@/lib/email";
import { consumeRateLimit } from "@/lib/rate-limit";
import fs from "fs/promises";
import path from "path";

// Helper: Ensure the caller is an authenticated user
async function getAuthenticatedUser() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized: Please log in to your account.");
  }

  const db = prisma as any;
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: {
      profile: true,
      deletionRequest: true,
      memberships: {
        where: { status: "ACTIVE" },
        orderBy: { endDate: "desc" },
        take: 1,
      },
    },
  });

  if (!user) {
    throw new Error("User record not found in system.");
  }

  return user as any;
}

// 1. Get Athlete Profile Data
export async function getUserProfileData() {
  try {
    const user = await getAuthenticatedUser();
    const activeMembership = user.memberships[0] || null;

    return {
      success: true,
      data: {
        id: user.id,
        name: user.name || "Athlete",
        email: user.email || "",
        image: user.image || null,
        role: user.role,
        phone: user.phone || user.profile?.phoneNumber || "",
        coachPhone: user.profile?.coachPhone || "",
        coachName: user.profile?.coachName || "",
        gender: user.profile?.gender || "MALE",
        weightClass: user.profile?.weightClass || "WC_83",
        createdAt: user.createdAt.toISOString(),
        activeMembership: activeMembership
          ? {
              cardNumber: activeMembership.cardNumber,
              planType: activeMembership.planType,
              status: activeMembership.status,
              endDate: activeMembership.endDate.toISOString(),
            }
          : null,
        deletionRequest: user.deletionRequest
          ? {
              id: user.deletionRequest.id,
              status: user.deletionRequest.status,
              reason: user.deletionRequest.reason || "",
              createdAt: user.deletionRequest.createdAt.toISOString(),
            }
          : null,
      },
    };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to retrieve athlete profile." };
  }
}

// 2. Update Athlete Profile Details
export async function updateUserProfileDetailsAction(data: {
  name: string;
  gender?: string;
  weightClass?: string;
  phone?: string;
  coachPhone?: string;
  coachName?: string;
}) {
  try {
    const user = await getAuthenticatedUser();
    const name = String(data.name || "").trim();

    if (!name || name.length < 2) {
      return { success: false, error: "Please provide a valid full name (minimum 2 characters)." };
    }

    const gender = (data.gender as any) || "MALE";
    const weightClass = (data.weightClass as any) || "WC_83";
    const cleanPhone = data.phone ? data.phone.trim() : null;
    const cleanCoachPhone = data.coachPhone ? data.coachPhone.trim() : null;
    const cleanCoachName = data.coachName ? data.coachName.trim() : null;

    await prisma.user.update({
      where: { id: user.id },
      data: {
        name,
        phone: cleanPhone || undefined,
        profile: {
          upsert: {
            create: {
              gender,
              weightClass,
              phoneNumber: cleanPhone,
              coachPhone: cleanCoachPhone,
              coachName: cleanCoachName || undefined,
            },
            update: {
              gender,
              weightClass,
              phoneNumber: cleanPhone,
              coachPhone: cleanCoachPhone,
              coachName: cleanCoachName || undefined,
            },
          },
        },
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/profile");
    revalidatePath("/live/warmup");
    revalidatePath("/admin/live-scoring");

    return {
      success: true,
      message: "Athlete profile updated successfully!",
    };
  } catch (error: any) {
    console.error("[User Profile Update Error]:", error);
    return { success: false, error: error.message || "Failed to update profile." };
  }
}

// 3. Delete Athlete Photo
export async function deleteUserPhotoAction() {
  try {
    const user = await getAuthenticatedUser();

    if (!user.image) {
      return { success: false, error: "No profile photo is currently set." };
    }

    // Clean up local avatar file
    if (user.image.startsWith("/uploads/avatars/")) {
      try {
        const filePath = path.join(process.cwd(), "public", user.image.replace(/^\//, ""));
        await fs.unlink(filePath);
      } catch (unlinkErr) {
        console.warn("[User Avatar Unlink Warning]:", unlinkErr);
      }
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { image: null },
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/profile");

    return {
      success: true,
      message: "Profile photo removed successfully! Default emblem restored.",
    };
  } catch (error: any) {
    console.error("[User Photo Delete Error]:", error);
    return { success: false, error: error.message || "Failed to delete profile photo." };
  }
}

// 4. Send Athlete Password Change OTP
export async function sendUserPasswordOtpAction(data: { currentPassword: string }) {
  try {
    const user = await getAuthenticatedUser();
    const parsed = z.object({ currentPassword: z.string().min(1).max(72) }).safeParse(data);
    if (!parsed.success) {
      return { success: false, error: "Current password is required to verify identity." };
    }
    const currentPassword = parsed.data.currentPassword;

    if (!user.password) {
      return { success: false, error: "No password credential found for this account." };
    }

    const throttle = await consumeRateLimit({
      scope: "user-password-otp",
      identifier: user.id,
      limit: 3,
      windowMs: 60 * 60 * 1000,
    });
    if (!throttle.allowed) {
      return { success: false, error: "Too many security-code requests. Please try again later." };
    }
    const isCurrentValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentValid) {
      return { success: false, error: "Incorrect current password. Verification failed." };
    }

    const userEmail = user.email!;
    const otp = crypto.randomInt(100000, 1000000).toString();
    const otpHash = await bcrypt.hash(otp, 12);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.emailOtp.upsert({
      where: { email: userEmail },
      update: { otp: otpHash, expiresAt },
      create: { email: userEmail, otp: otpHash, expiresAt },
    });

    const emailHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #080201; color: #ffffff; padding: 40px; border-radius: 16px; max-width: 600px; margin: 0 auto; border: 1px solid #e6501b33;">
        <div style="text-align: center; margin-bottom: 25px;">
          <h2 style="color: #e6501b; text-transform: uppercase; margin: 0; font-size: 24px; letter-spacing: 1px;">A&T FITNESS & NUTRITION</h2>
          <p style="color: #888; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; margin-top: 5px;">Athlete Security Verification</p>
        </div>
        <p style="color: #d1d5db; font-size: 14px; text-align: center;">Hello <strong>${escapeHtml(user.name ?? "Member")}</strong>, use the 6-digit security code below to authorize your password change.</p>
        <div style="background: linear-gradient(180deg, #1c0603 0%, #100302 100%); border: 2px solid #e6501b; padding: 25px; text-align: center; border-radius: 14px; margin: 25px 0;">
          <span style="font-size: 42px; font-family: 'Courier New', monospace; font-weight: 900; color: #ffffff; letter-spacing: 12px; display: inline-block; margin-left: 12px;">${otp}</span>
        </div>
        <p style="color: #e6501b; font-size: 12px; text-align: center; font-weight: bold;">Code valid for 10 minutes. Do not share this code with anyone.</p>
        <p style="color: #666; font-size: 11px; text-align: center; margin-top: 25px;">If you did not request this password change, immediately contact Federation Support.</p>
      </div>
    `;

    try {
      await sendTransactionalEmail({
        to: userEmail,
        subject: "Athlete Account - Password Change Verification",
        html: emailHtml,
      });
    } catch (error) {
      await prisma.emailOtp.deleteMany({
        where: { email: userEmail, otp: otpHash },
      });
      throw error;
    }

    return {
      success: true,
      message: "Security code sent. Please check your inbox.",
    };
  } catch (error) {
    console.error(
      "[Send User Password OTP Error]:",
      error instanceof Error ? error.message : "Unknown email error",
    );
    return { success: false, error: "Failed to dispatch the security code." };
  }
}

// 5. Verify OTP & Finalize Password Change
export async function verifyAndChangeUserPasswordAction(data: {
  currentPassword: string;
  newPassword: string;
  otp: string;
}) {
  try {
    const user = await getAuthenticatedUser();
    const parsed = z
      .object({
        currentPassword: z.string().min(1).max(72),
        newPassword: z
          .string()
          .min(12)
          .refine((password) => Buffer.byteLength(password, "utf8") <= 72),
        otp: z.string().regex(/^\d{6}$/),
      })
      .safeParse(data);
    if (!parsed.success) {
      return { success: false, error: "Please check your password and six-digit code." };
    }
    const { currentPassword, newPassword, otp } = parsed.data;
    const throttle = await consumeRateLimit({
      scope: "user-password-change",
      identifier: user.id,
      limit: 8,
      windowMs: 15 * 60 * 1000,
    });
    if (!throttle.allowed) {
      return { success: false, error: "Too many attempts. Please try again later." };
    }

    if (!user.password || !(await bcrypt.compare(currentPassword, user.password))) {
      return { success: false, error: "Invalid current password credentials." };
    }

    const userEmail = user.email!;
    const record = await prisma.emailOtp.findUnique({
      where: { email: userEmail },
    });

    if (
      !record ||
      record.expiresAt <= new Date() ||
      !(await bcrypt.compare(otp, record.otp))
    ) {
      return { success: false, error: "Invalid verification OTP code. Please check and try again." };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    const changed = await prisma.$transaction(async (transaction) => {
      const deleted = await transaction.emailOtp.deleteMany({
        where: { email: userEmail, otp: record.otp, expiresAt: { gt: new Date() } },
      });
      if (deleted.count !== 1) return false;

      await transaction.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      });
      return true;
    });
    if (!changed) {
      return { success: false, error: "Invalid or expired verification OTP." };
    }

    return {
      success: true,
      message: "Password updated successfully! Your account credentials are now secured.",
    };
  } catch (error) {
    console.error(
      "[User Password Change Error]:",
      error instanceof Error ? error.name : "Unknown error",
    );
    return { success: false, error: "Failed to update password." };
  }
}

// 6. Submit Account Deletion Request (Pending Admin Review)
export async function submitAccountDeletionRequestAction(data: {
  currentPassword: string;
  reason?: string;
}) {
  try {
    const user = await getAuthenticatedUser();
    const currentPassword = String(data.currentPassword || "");
    const reason = String(data.reason || "").trim();

    if (user.role === "ADMIN") {
      return {
        success: false,
        error: "Admins cannot submit member deletion requests. Please manage your admin account in the Admin Profile Danger Zone.",
      };
    }

    if (!currentPassword) {
      return { success: false, error: "Current password is required to authorize deletion request." };
    }

    if (!user.password || !(await bcrypt.compare(currentPassword, user.password))) {
      return { success: false, error: "Incorrect password. Authorization failed." };
    }

    // Upsert DeletionRequest in Database
    const db = prisma as any;
    await db.deletionRequest.upsert({
      where: { userId: user.id },
      update: {
        status: "PENDING",
        reason: reason || "Athlete requested account removal.",
        updatedAt: new Date(),
      },
      create: {
        userId: user.id,
        status: "PENDING",
        reason: reason || "Athlete requested account removal.",
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/profile");
    revalidatePath("/admin");
    revalidatePath("/admin/deletion-requests");

    return {
      success: true,
      message: "Account deletion request submitted successfully! An Administrator will review and finalize your request.",
    };
  } catch (error: any) {
    console.error("[Submit Deletion Request Error]:", error);
    return { success: false, error: error.message || "Failed to submit deletion request." };
  }
}

// 7. Cancel Account Deletion Request
export async function cancelAccountDeletionRequestAction() {
  try {
    const user = await getAuthenticatedUser();

    const userRecord = user as any;
    if (!userRecord.deletionRequest) {
      return { success: false, error: "No active deletion request found." };
    }

    const db = prisma as any;
    await db.deletionRequest.delete({
      where: { userId: user.id },
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/profile");
    revalidatePath("/admin");
    revalidatePath("/admin/deletion-requests");

    return {
      success: true,
      message: "Account deletion request cancelled. Your athlete account remains active!",
    };
  } catch (error: any) {
    console.error("[Cancel Deletion Request Error]:", error);
    return { success: false, error: error.message || "Failed to cancel deletion request." };
  }
}
