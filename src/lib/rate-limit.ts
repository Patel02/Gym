import { createHash } from "crypto";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

let lastCleanupAt = 0;

export async function getClientIp() {
  const requestHeaders = await headers();
  return (
    requestHeaders.get("x-real-ip")?.trim() ||
    requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  );
}

export async function consumeRateLimit(input: {
  scope: string;
  identifier: string;
  limit: number;
  windowMs: number;
}) {
  const now = Date.now();
  const windowNumber = Math.floor(now / input.windowMs);
  const windowStart = new Date(windowNumber * input.windowMs);
  const key = createHash("sha256")
    .update(`${input.scope}:${input.identifier.trim().toLowerCase()}:${windowNumber}`)
    .digest("hex");

  const bucket = await prisma.authRateLimit.upsert({
    where: { key },
    create: { key, count: 1, windowStart },
    update: { count: { increment: 1 } },
    select: { count: true },
  });

  if (now - lastCleanupAt > 60 * 60 * 1000) {
    lastCleanupAt = now;
    await prisma.authRateLimit.deleteMany({
      where: { windowStart: { lt: new Date(now - 24 * 60 * 60 * 1000) } },
    });
  }

  return {
    allowed: bucket.count <= input.limit,
    retryAfterSeconds: Math.max(
      1,
      Math.ceil(((windowNumber + 1) * input.windowMs - now) / 1000),
    ),
  };
}
