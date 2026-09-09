"use server";

import { signIn } from "@/auth";
import { resend } from "@/inngest/client";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { revalidatePath } from "next/cache";
import { randomInt } from "node:crypto";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character] ?? character);
}

export async function sendRegistrationOtp(email: string) {
  const normalizedEmail = normalizeEmail(email);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    return { success: false, error: "Please enter a valid email address." };
  }

  const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existingUser) return { success: false, error: "An account with this email already exists." };
  if (!resend) return { success: false, error: "Email service is not configured." };

  const otp = String(randomInt(100000, 1000000));
  const hashedOtp = await bcrypt.hash(otp, 10);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await prisma.emailOtp.upsert({
    where: { email: normalizedEmail },
    update: { otp: hashedOtp, expiresAt },
    create: { email: normalizedEmail, otp: hashedOtp, expiresAt },
  });

  try {
    const result = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? "Federation Security <noreply@yourfederation.com>",
      to: normalizedEmail,
      subject: "Your Federation Registration OTP",
      html: `<div style="font-family:sans-serif;background:#0a0a0a;color:#fff;padding:40px;text-align:center"><h2 style="color:#FF4500">Email Verification</h2><p style="color:#ccc">Use this code to complete registration.</p><div style="background:#151515;border:1px solid #333;padding:20px;font-size:32px;font-family:monospace;font-weight:bold;color:#FF4500;letter-spacing:6px">${escapeHtml(otp)}</div><p style="color:#777;font-size:12px">This code expires in 10 minutes.</p></div>`,
    });
    if (result.error) throw new Error(result.error.message);
    return { success: true, message: "Verification OTP sent to your email." };
  } catch (error) {
    await prisma.emailOtp.deleteMany({ where: { email: normalizedEmail } });
    console.error("Failed to send OTP email:", error);
    return { success: false, error: "Failed to send verification email. Try again later." };
  }
}

export async function verifyAndRegister(data: { name: string; email: string; password: string; otp: string }) {
  const name = data.name.trim();
  const email = normalizeEmail(data.email);
  if (name.length < 2 || data.password.length < 8 || !/^\d{6}$/.test(data.otp)) {
    return { success: false, error: "Enter a valid name, 8-character password, and 6-digit OTP." };
  }

  const record = await prisma.emailOtp.findUnique({ where: { email } });
  if (!record || new Date() > record.expiresAt || !(await bcrypt.compare(data.otp, record.otp))) {
    return { success: false, error: "Invalid or expired verification OTP." };
  }

  try {
    const hashedPassword = await bcrypt.hash(data.password, 12);
    await prisma.$transaction(async (transaction) => {
      await transaction.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          profile: { create: { gender: "MALE", weightClass: "WC_83" } },
        },
      });
      await transaction.emailOtp.delete({ where: { email } });
    });
    return { success: true, message: "Account created successfully. You can now log in." };
  } catch (error) {
    console.error("Registration failed:", error);
    return { success: false, error: "Could not create the account. Please try again." };
  }
}

export async function loginUser(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  try {
    await signIn("credentials", { email, password, redirectTo: "/dashboard" });
  } catch (error) {
    if (error instanceof AuthError) return { success: false, error: "Invalid email or password." };
    throw error;
  }
  revalidatePath("/dashboard");
  return { success: true };
}