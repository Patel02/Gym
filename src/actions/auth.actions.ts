"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import { z } from "zod";
import { sendTransactionalEmail } from "@/lib/email";
import { consumeRateLimit, getClientIp } from "@/lib/rate-limit";

const emailSchema = z.string().trim().email().transform((email) => email.toLowerCase());
const passwordSchema = z
  .string()
  .min(12, "Password must be at least 12 characters long.")
  .refine((password) => Buffer.byteLength(password, "utf8") <= 72, {
    message: "Password must be no more than 72 bytes.",
  });
const registrationSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: emailSchema,
  password: passwordSchema,
  otp: z.string().regex(/^\d{6}$/),
});
const refereeRegistrationSchema = registrationSchema.extend({
  inviteCode: z.string().trim().min(1).max(128),
});
const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1),
});

// 1. Send OTP Action
export async function sendRegistrationOtp(email: string) {
  const parsedEmail = emailSchema.safeParse(email);
  if (!parsedEmail.success) {
    return { success: false, error: "Please enter a valid email address." };
  }
  const normalizedEmail = parsedEmail.data;
  const [emailThrottle, ipThrottle] = await Promise.all([
    consumeRateLimit({
      scope: "registration-otp-email",
      identifier: normalizedEmail,
      limit: 3,
      windowMs: 60 * 60 * 1000,
    }),
    consumeRateLimit({
      scope: "registration-otp-ip",
      identifier: await getClientIp(),
      limit: 10,
      windowMs: 60 * 60 * 1000,
    }),
  ]);
  if (!emailThrottle.allowed || !ipThrottle.allowed) {
    return { success: false, error: "Too many verification requests. Please try again later." };
  }

  const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existingUser) {
    return { success: false, error: "An account with this email already exists." };
  }

  const otp = crypto.randomInt(100000, 1000000).toString();
  const otpHash = await bcrypt.hash(otp, 12);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await prisma.emailOtp.upsert({
    where: { email: normalizedEmail },
    update: { otp: otpHash, expiresAt },
    create: { email: normalizedEmail, otp: otpHash, expiresAt },
  });

  const emailHtml = `
    <div style="font-family: Arial, sans-serif; background-color: #0a0a0a; color: #ffffff; padding: 40px; border-radius: 12px; max-width: 600px; margin: 0 auto; border: 1px solid #222;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="color: #e6501b; text-transform: uppercase; margin: 0; font-size: 24px; letter-spacing: 1px;">A&T FITNESS & NUTRITION</h2>
        <p style="color: #888; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; margin-top: 5px;">National Powerlifting Federation</p>
      </div>
      <p style="color: #ccc; text-align: center; font-size: 14px;">Use the 6-digit verification code below to complete your official athlete registration.</p>
      <div style="background: linear-gradient(180deg, #1c0603 0%, #100302 100%); border: 2px solid #e6501b; padding: 24px; text-align: center; border-radius: 12px; margin: 25px 0;">
        <span style="font-size: 38px; font-family: 'Courier New', monospace; font-weight: 900; color: #ffffff; letter-spacing: 10px;">${otp}</span>
      </div>
      <p style="color: #e6501b; font-size: 12px; text-align: center; font-weight: bold;">Code valid for 10 minutes. Do not share this OTP with anyone.</p>
      <p style="color: #666; font-size: 11px; text-align: center; margin-top: 25px;">If you did not request this code, you can safely ignore this email.</p>
    </div>
  `;

  try {
    await sendTransactionalEmail({
      to: normalizedEmail,
      subject: "Athlete Registration - Email Verification",
      html: emailHtml,
    });
  } catch (error) {
    await prisma.emailOtp.deleteMany({
      where: { email: normalizedEmail, otp: otpHash },
    });
    console.error(
      "Registration OTP email delivery failed:",
      error instanceof Error ? error.message : "Unknown email error",
    );
    return {
      success: false,
      error: "Unable to deliver the verification email. Please try again later.",
    };
  }

  return {
    success: true,
    message: "Verification code sent. Please check your inbox.",
  };
}

// 2. Verify OTP & Finalize Registration Action
export async function verifyAndRegister(data: {
  name: string;
  email: string;
  password: string;
  otp: string;
}) {
  const parsed = registrationSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: "Please check your registration details and try again." };
  }
  const { name, email, password, otp } = parsed.data;
  const throttle = await consumeRateLimit({
    scope: "registration-verify",
    identifier: email,
    limit: 8,
    windowMs: 15 * 60 * 1000,
  });
  if (!throttle.allowed) {
    return { success: false, error: "Too many verification attempts. Please request a new code later." };
  }

  const record = await prisma.emailOtp.findUnique({ where: { email } });
  if (
    !record ||
    record.expiresAt <= new Date() ||
    !(await bcrypt.compare(otp, record.otp))
  ) {
    return { success: false, error: "Invalid or expired verification OTP." };
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  try {
    const consumed = await prisma.$transaction(async (transaction) => {
      const deleted = await transaction.emailOtp.deleteMany({
        where: { email, otp: record.otp, expiresAt: { gt: new Date() } },
      });
      if (deleted.count !== 1) return false;

      await transaction.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: "MEMBER",
          profile: {
            create: { gender: "MALE", weightClass: "WC_83" },
          },
        },
      });
      return true;
    });

    if (!consumed) {
      return { success: false, error: "Invalid or expired verification OTP." };
    }

    return { success: true, message: "Account created successfully! Redirecting to login..." };
  } catch (error) {
    console.error("Registration failed:", error instanceof Error ? error.name : "Unknown error");
    return { success: false, error: "Database error during registration." };
  }
}

export async function loginUser(formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { success: false, error: "Please enter a valid email and password." };
  }

  try {
    await signIn("credentials", {
      ...parsed.data,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { success: false, error: "Invalid email or password." };
        default:
          return { success: false, error: "Something went wrong during login." };
      }
    }
    throw error; // NextAuth redirect throws an error which must be re-thrown
  }
}

// Validate Federation Invite Code (step 1 validation)
export async function validateRefereeInviteCode(inviteCode: string) {
  const parsed = z.string().trim().min(1).max(128).safeParse(inviteCode);
  if (!parsed.success) return { isValid: false };
  const throttle = await consumeRateLimit({
    scope: "referee-invite",
    identifier: await getClientIp(),
    limit: 10,
    windowMs: 15 * 60 * 1000,
  });
  if (!throttle.allowed) return { isValid: false };

  const expected = process.env.REFEREE_INVITE_CODE?.trim().toUpperCase();
  const supplied = parsed.data.toUpperCase();
  if (!expected) return { isValid: false };

  const expectedBytes = Buffer.from(expected);
  const suppliedBytes = Buffer.from(supplied);
  return {
    isValid:
      expectedBytes.length === suppliedBytes.length &&
      crypto.timingSafeEqual(expectedBytes, suppliedBytes),
  };
}

// Referee Registration: verify OTP + invite code, create REFEREE role account
export async function verifyAndRegisterReferee(data: {
  name: string;
  email: string;
  password: string;
  otp: string;
  inviteCode: string;
}) {
  const parsed = refereeRegistrationSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: "Please check your registration details and try again." };
  }
  const { name, email, password, otp, inviteCode } = parsed.data;
  const throttle = await consumeRateLimit({
    scope: "referee-registration-verify",
    identifier: email,
    limit: 8,
    windowMs: 15 * 60 * 1000,
  });
  if (!throttle.allowed) {
    return { success: false, error: "Too many verification attempts. Please request a new code later." };
  }

  const inviteResult = await validateRefereeInviteCode(inviteCode);
  if (!inviteResult.isValid) {
    return { success: false, error: "Invalid Federation Invite Code. Contact the WPI Gujarat secretary." };
  }

  const record = await prisma.emailOtp.findUnique({ where: { email } });
  if (
    !record ||
    record.expiresAt <= new Date() ||
    !(await bcrypt.compare(otp, record.otp))
  ) {
    return { success: false, error: "Invalid or expired verification OTP." };
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  try {
    const consumed = await prisma.$transaction(async (transaction) => {
      const deleted = await transaction.emailOtp.deleteMany({
        where: { email, otp: record.otp, expiresAt: { gt: new Date() } },
      });
      if (deleted.count !== 1) return false;

      await transaction.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: "REFEREE",
          profile: {
            create: { gender: "MALE", weightClass: "WC_83" },
          },
        },
      });
      return true;
    });

    if (!consumed) {
      return { success: false, error: "Invalid or expired verification OTP." };
    }

    return { success: true, message: "Referee account created successfully! Please sign in." };
  } catch (error) {
    console.error("Referee registration failed:", error instanceof Error ? error.name : "Unknown error");
    return { success: false, error: "Database error during registration. Email may already be registered." };
  }
}

// Referee Login: authenticates and redirects to /referee/dashboard
export async function loginReferee(formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { success: false, error: "Please enter a valid email and password." };
  }

  try {
    await signIn("credentials", {
      ...parsed.data,
      redirectTo: "/referee/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { success: false, error: "Invalid email or password." };
        default:
          return { success: false, error: "Something went wrong during login." };
      }
    }
    throw error;
  }
}