"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { consumeRateLimit, getClientIp } from "@/lib/rate-limit";

const initialPasswordSchema = z
  .object({
    currentPassword: z.string().min(1).max(72),
    newPassword: z
      .string()
      .min(12)
      .refine((password) => Buffer.byteLength(password, "utf8") <= 72),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ["confirmPassword"],
  });

export async function changeInitialPasswordAction(formData: FormData) {
  const session = await auth();
  const email = session?.user?.email;
  if (!session?.user?.mustChangePassword || !email) {
    return { success: false, error: "This password change is not authorized." };
  }

  const parsed = initialPasswordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { success: false, error: "Use a matching password with at least 12 characters." };
  }

  const [emailLimit, ipLimit] = await Promise.all([
    consumeRateLimit({
      scope: "initial-password-email",
      identifier: email,
      limit: 5,
      windowMs: 15 * 60 * 1000,
    }),
    getClientIp().then((ip) =>
      consumeRateLimit({
        scope: "initial-password-ip",
        identifier: ip,
        limit: 15,
        windowMs: 15 * 60 * 1000,
      }),
    ),
  ]);
  if (!emailLimit.allowed || !ipLimit.allowed) {
    return { success: false, error: "Too many attempts. Please try again later." };
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, password: true, isActive: true, mustChangePassword: true },
  });
  if (
    !user?.isActive ||
    !user.mustChangePassword ||
    !user.password ||
    !(await bcrypt.compare(parsed.data.currentPassword, user.password))
  ) {
    return { success: false, error: "The current password is incorrect." };
  }

  const hashedPassword = await bcrypt.hash(parsed.data.newPassword, 12);
  const updated = await prisma.user.updateMany({
    where: {
      id: user.id,
      password: user.password,
      mustChangePassword: true,
      isActive: true,
    },
    data: { password: hashedPassword, mustChangePassword: false },
  });
  if (updated.count !== 1) {
    return { success: false, error: "The password could not be updated. Sign in and try again." };
  }

  await signOut({ redirectTo: "/login" });
}
