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
    throw new Error("Admin record not found in system.");
  }

  return admin;
}

// 1. Get Admin Profile Data
export async function getAdminProfile() {
  try {
    const admin = await getAuthenticatedAdmin();
    return {
      success: true,
      data: {
        id: admin.id,
        name: admin.name || "Administrator",
        email: admin.email || "",
        image: admin.image || null,
        role: admin.role,
        createdAt: admin.createdAt.toISOString(),
        updatedAt: admin.updatedAt.toISOString(),
      },
    };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to retrieve profile." };
  }
}

// 2. Update Admin Profile Details (Name & Email)
export async function updateAdminProfileAction(data: { name: string; email: string }) {
  try {
    const admin = await getAuthenticatedAdmin();
    const name = String(data.name || "").trim();
    const email = String(data.email || "").trim().toLowerCase();

    if (!name || name.length < 2) {
      return { success: false, error: "Please provide a valid full name (minimum 2 characters)." };
    }

    if (!email || !email.includes("@")) {
      return { success: false, error: "Please enter a valid administrative email address." };
    }

    // Check if new email is taken by someone else
    if (email !== admin.email) {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing && existing.id !== admin.id) {
        return { success: false, error: "This email address is already in use by another account." };
      }
    }

    const updated = await prisma.user.update({
      where: { id: admin.id },
      data: {
        name,
        email,
      },
    });

    // Record Security Audit Log
    await prisma.auditLog.create({
      data: {
        adminId: admin.id,
        action: "UPDATE_ADMIN_PROFILE",
        entityType: "USER",
        entityId: admin.id,
        details: `Admin profile updated: Name='${name}', Email='${email}'`,
      },
    });

    revalidatePath("/admin");
    revalidatePath("/admin/profile");

    return {
      success: true,
      message: "Profile details updated successfully!",
      data: {
        name: updated.name,
        email: updated.email,
        image: updated.image,
      },
    };
  } catch (error: any) {
    console.error("[Profile Update Error]:", error);
    return { success: false, error: error.message || "Failed to update profile." };
  }
}

// 3. Delete Admin Avatar Photo
export async function deleteAdminPhotoAction() {
  try {
    const admin = await getAuthenticatedAdmin();

    if (!admin.image) {
      return { success: false, error: "No profile photo is currently set." };
    }

    // If it's a local upload, clean up the file
    if (admin.image.startsWith("/uploads/avatars/")) {
      try {
        const filePath = path.join(process.cwd(), "public", admin.image.replace(/^\//, ""));
        await fs.unlink(filePath);
      } catch (unlinkErr) {
        console.warn("[Avatar Unlink Warning]:", unlinkErr);
      }
    }

    await prisma.user.update({
      where: { id: admin.id },
      data: { image: null },
    });

    // Record Audit Log
    await prisma.auditLog.create({
      data: {
        adminId: admin.id,
        action: "DELETE_ADMIN_AVATAR",
        entityType: "USER",
        entityId: admin.id,
        details: "Admin profile picture removed.",
      },
    });

    revalidatePath("/admin");
    revalidatePath("/admin/profile");

    return {
      success: true,
      message: "Profile photo removed successfully! Default emblem restored.",
    };
  } catch (error: any) {
    console.error("[Delete Photo Error]:", error);
    return { success: false, error: error.message || "Failed to delete profile photo." };
  }
}

// 4. Send Admin Password Change OTP
export async function sendAdminPasswordOtpAction(data: { currentPassword: string }) {
  try {
    const admin = await getAuthenticatedAdmin();
    const parsed = z.object({ currentPassword: z.string().min(1).max(72) }).safeParse(data);
    if (!parsed.success) {
      return { success: false, error: "Current password is required to verify your identity." };
    }
    const currentPassword = parsed.data.currentPassword;

    if (!currentPassword) {
      return { success: false, error: "Current password is required to verify your identity." };
    }

    if (!admin.password) {
      return { success: false, error: "No password found for this administrator account." };
    }

    const throttle = await consumeRateLimit({
      scope: "admin-password-otp",
      identifier: admin.id,
      limit: 3,
      windowMs: 60 * 60 * 1000,
    });
    if (!throttle.allowed) {
      return { success: false, error: "Too many security-code requests. Please try again later." };
    }
    const isCurrentValid = await bcrypt.compare(currentPassword, admin.password);
    if (!isCurrentValid) {
      return { success: false, error: "Incorrect current password. Identity verification failed." };
    }

    const adminEmail = admin.email!;

    // Generate secure 6-digit OTP
    const otp = crypto.randomInt(100000, 1000000).toString();
    const otpHash = await bcrypt.hash(otp, 12);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.emailOtp.upsert({
      where: { email: adminEmail },
      update: { otp: otpHash, expiresAt },
      create: { email: adminEmail, otp: otpHash, expiresAt },
    });

    const emailHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #080201; color: #ffffff; padding: 40px; border-radius: 16px; max-width: 600px; margin: 0 auto; border: 1px solid #e6501b33; box-shadow: 0 10px 40px rgba(0,0,0,0.8);">
        <div style="text-align: center; margin-bottom: 25px;">
          <span style="background: rgba(230,80,27,0.15); border: 1px solid #e6501b; color: #e6501b; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; padding: 6px 14px; border-radius: 20px;">
            🔒 Security Authorization
          </span>
          <h2 style="color: #ffffff; text-transform: uppercase; margin: 15px 0 5px 0; font-size: 24px; letter-spacing: 1px;">A&T FITNESS & NUTRITION</h2>
          <p style="color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; margin: 0;">Administrative Command Center</p>
        </div>
        
        <p style="color: #d1d5db; font-size: 14px; line-height: 1.6; text-align: center;">
          Hello <strong style="color: #ffffff;">${escapeHtml(admin.name ?? "Administrator")}</strong>, a request has been made to modify your Administrator master password.
        </p>
        
        <p style="color: #9ca3af; font-size: 13px; text-align: center; margin-top: 5px;">
          Enter this one-time security authorization code on the screen to confirm your change:
        </p>

        <div style="background: linear-gradient(180deg, #1c0603 0%, #100302 100%); border: 2px solid #e6501b; padding: 25px; text-align: center; border-radius: 14px; margin: 25px 0; box-shadow: 0 0 30px rgba(230,80,27,0.25);">
          <span style="font-size: 42px; font-family: 'Courier New', Courier, monospace; font-weight: 900; color: #ffffff; letter-spacing: 12px; display: inline-block; margin-left: 12px;">${otp}</span>
        </div>

        <div style="background: rgba(230,80,27,0.1); border: 1px dashed #e6501b80; border-radius: 10px; padding: 12px; text-align: center; margin-bottom: 20px;">
          <p style="color: #e6501b; font-size: 12px; margin: 0; font-weight: 700;">
            Code is valid for 10 minutes. Never share this code with anyone.
          </p>
        </div>

        <p style="color: #6b7280; font-size: 11px; text-align: center; line-height: 1.5; margin-top: 25px;">
          If you did not initiate this password change, immediately review active sessions and contact Federation Security Administration.
        </p>
      </div>
    `;

    try {
      await sendTransactionalEmail({
        to: adminEmail,
        subject: "Admin Security Alert: Password Change Verification",
        html: emailHtml,
      });
    } catch (error) {
      await prisma.emailOtp.deleteMany({
        where: { email: adminEmail, otp: otpHash },
      });
      throw error;
    }

    return {
      success: true,
      message: `Security code sent to ${adminEmail}. Please check your inbox.`,
    };
  } catch (error) {
    console.error(
      "[Send Password OTP Error]:",
      error instanceof Error ? error.message : "Unknown email error",
    );
    return { success: false, error: "Failed to dispatch the security code." };
  }
}

// 5. Verify OTP & Finalize Password Change
export async function verifyAndChangeAdminPasswordAction(data: {
  currentPassword: string;
  newPassword: string;
  otp: string;
}) {
  try {
    const admin = await getAuthenticatedAdmin();
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
      scope: "admin-password-change",
      identifier: admin.id,
      limit: 8,
      windowMs: 15 * 60 * 1000,
    });
    if (!throttle.allowed) {
      return { success: false, error: "Too many attempts. Please try again later." };
    }

    // Re-verify current password
    if (!admin.password || !(await bcrypt.compare(currentPassword, admin.password))) {
      return { success: false, error: "Invalid current password credentials." };
    }

    const adminEmail = admin.email!;

    // Verify OTP in Database
    const record = await prisma.emailOtp.findUnique({
      where: { email: adminEmail },
    });

    if (
      !record ||
      record.expiresAt <= new Date() ||
      !(await bcrypt.compare(otp, record.otp))
    ) {
      return { success: false, error: "Invalid verification OTP. Please check the code and try again." };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    const changed = await prisma.$transaction(async (transaction) => {
      const deleted = await transaction.emailOtp.deleteMany({
        where: { email: adminEmail, otp: record.otp, expiresAt: { gt: new Date() } },
      });
      if (deleted.count !== 1) return false;

      await transaction.user.update({
        where: { id: admin.id },
        data: { password: hashedPassword },
      });
      await transaction.auditLog.create({
        data: {
          adminId: admin.id,
          action: "ADMIN_PASSWORD_CHANGED_WITH_OTP",
          entityType: "USER",
          entityId: admin.id,
          details: "Administrator password updated after OTP verification.",
        },
      });
      return true;
    });
    if (!changed) {
      return { success: false, error: "Invalid or expired verification OTP." };
    }

    return {
      success: true,
      message: "Admin password successfully updated! Your account is fully secured.",
    };
  } catch (error) {
    console.error("[Password Change Error]:", error instanceof Error ? error.name : "Unknown error");
    return { success: false, error: "Failed to update password." };
  }
}

// 6. Delete / Deactivate Admin Account
export async function deleteAdminAccountAction(data: {
  confirmationText: string;
  password: string;
}) {
  try {
    const admin = await getAuthenticatedAdmin();
    const { confirmationText, password } = data;

    if (confirmationText !== "DELETE MY ADMIN ACCOUNT") {
      return {
        success: false,
        error: "Confirmation phrase does not match. Please type 'DELETE MY ADMIN ACCOUNT' exactly.",
      };
    }

    if (!password || !admin.password || !(await bcrypt.compare(password, admin.password))) {
      return { success: false, error: "Incorrect password. Deletion authorization rejected." };
    }

    // Check how many admins exist to prevent accidental total lockout
    const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
    if (adminCount <= 1) {
      return {
        success: false,
        error: "Safety Block: You are currently the sole Administrator of this Federation. Please assign another Admin before deleting this account.",
      };
    }

    // Clean up local avatar file if exists
    if (admin.image && admin.image.startsWith("/uploads/avatars/")) {
      try {
        const filePath = path.join(process.cwd(), "public", admin.image.replace(/^\//, ""));
        await fs.unlink(filePath);
      } catch {}
    }

    // Delete the admin user
    await prisma.user.delete({
      where: { id: admin.id },
    });

    console.log(`[SECURITY AUDIT] Admin account ${admin.name} (${admin.email}) was deleted.`);

    return {
      success: true,
      message: "Admin account has been permanently deleted.",
    };
  } catch (error: any) {
    console.error("[Delete Admin Error]:", error);
    return { success: false, error: error.message || "Failed to delete account." };
  }
}
