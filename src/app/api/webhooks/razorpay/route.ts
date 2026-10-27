import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export const dynamic = "force-dynamic";

// ─────────────────────────────────────────────────────────────────────────────
// RAZORPAY PRODUCTION WEBHOOK — HMAC-SHA256 Signature Verification
// ─────────────────────────────────────────────────────────────────────────────

const RAZORPAY_WEBHOOK_SECRET =
  process.env.RAZORPAY_WEBHOOK_SECRET || "wpi_razorpay_webhook_secret_2026";

function verifyRazorpaySignature(rawBody: string, signatureHeader: string): boolean {
  const expectedSig = crypto
    .createHmac("sha256", RAZORPAY_WEBHOOK_SECRET)
    .update(rawBody)
    .digest("hex");
  // Constant-time comparison to prevent timing attacks
  try {
    return crypto.timingSafeEqual(
      Buffer.from(expectedSig, "hex"),
      Buffer.from(signatureHeader, "hex")
    );
  } catch {
    return false;
  }
}

function generateWpiCardNumber(): string {
  const year = new Date().getFullYear();
  const rand = Math.floor(10000 + Math.random() * 90000);
  return `WPI-${year}-${rand}`;
}

export async function POST(req: NextRequest) {
  let rawBody: string;
  try {
    rawBody = await req.text();
  } catch {
    return NextResponse.json({ error: "Cannot read request body" }, { status: 400 });
  }

  // ── 1. Signature Verification ────────────────────────────────────────────
  const signatureHeader = req.headers.get("x-razorpay-signature") || "";

  if (!signatureHeader) {
    // In development, allow unsigned requests for testing
    if (process.env.NODE_ENV === "production") {
      console.error("[Razorpay Webhook] Missing signature header");
      return NextResponse.json({ error: "Missing signature" }, { status: 401 });
    }
    console.warn("[Razorpay Webhook] ⚠️ No signature header — DEV mode, proceeding without verification");
  } else if (!verifyRazorpaySignature(rawBody, signatureHeader)) {
    console.error("[Razorpay Webhook] ❌ Invalid signature — possible forged request");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let body: any;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const event = body?.event as string;
  const paymentEntity = body?.payload?.payment?.entity;
  const paymentId: string = paymentEntity?.id || "";
  const email: string = (paymentEntity?.email || "").toLowerCase().trim();
  const notes = paymentEntity?.notes || {};

  console.log(`[Razorpay Webhook] ✅ Received event: ${event} | paymentId: ${paymentId}`);

  // ── 2. Idempotency check: skip if paymentRef already recorded ────────────
  if (paymentId) {
    const alreadyProcessed = await prisma.meetRegistration.findFirst({
      where: { paymentRef: paymentId },
    });
    if (alreadyProcessed) {
      console.log(`[Razorpay Webhook] ⏭️ Idempotent skip — paymentId already processed: ${paymentId}`);
      return NextResponse.json({ success: true, skipped: true });
    }
  }

  // ── 3. Identify user ─────────────────────────────────────────────────────
  const user = email ? await prisma.user.findUnique({ where: { email } }) : null;

  if (!user && event === "payment.captured") {
    console.warn(`[Razorpay Webhook] ⚠️ No user found for email: ${email}`);
    // Still return 200 so Razorpay doesn't retry
    return NextResponse.json({ success: true, warning: "User not found" });
  }

  // ── 4. Route by event type ───────────────────────────────────────────────
  if (event === "payment.captured") {
    const paymentType: string = notes?.paymentType || "membership";
    const eventId: string = notes?.eventId || "";
    const planType: string = notes?.planType || "MONTHLY";
    const amount: number = (paymentEntity?.amount || 0) / 100; // Razorpay sends paise

    try {
      if (paymentType === "membership" && user) {
        // ── MEMBERSHIP ACTIVATION ──────────────────────────────────────────
        await activateMembership(user.id, paymentId, amount);
        console.log(`[Razorpay Webhook] ✅ Membership activated for ${email}`);
      } else if (paymentType === "meet_registration" && user && eventId) {
        // ── MEET REGISTRATION APPROVAL ────────────────────────────────────
        await approveMeetRegistration(user.id, eventId, paymentId);
        console.log(`[Razorpay Webhook] ✅ Meet registration approved for ${email} — event: ${eventId}`);
      } else if (paymentType === "saas_subscription" && user) {
        // ── SAAS SUBSCRIPTION ACTIVATION ─────────────────────────────────
        await activateSaasSubscription(user.id, paymentId, planType, amount);
        console.log(`[Razorpay Webhook] ✅ SaaS subscription activated for ${email} — plan: ${planType}`);
      }
    } catch (fulfillError: any) {
      console.error("[Razorpay Webhook] ❌ Fulfillment error:", fulfillError.message);
      return NextResponse.json({ error: "Fulfillment failed" }, { status: 500 });
    }
  } else if (event === "payment.failed") {
    console.warn(`[Razorpay Webhook] ⚠️ Payment failed for ${email}: ${paymentEntity?.error_description}`);
    // Could update a payment attempt log here if needed
  } else if (event === "refund.created") {
    console.log(`[Razorpay Webhook] 🔄 Refund event received for ${paymentId}`);
  }

  return NextResponse.json({ success: true, event });
}

// ─────────────────────────────────────────────────────────────────────────────
// FULFILLMENT HELPERS
// ─────────────────────────────────────────────────────────────────────────────

async function activateMembership(userId: string, paymentId: string, amount: number) {
  // Check if there's a pending membership
  const pending = await prisma.membership.findFirst({
    where: { userId, status: "PENDING" },
  });

  if (pending) {
    await prisma.membership.update({
      where: { id: pending.id },
      data: { status: "ACTIVE" },
    });
  } else {
    // Create a new membership if none pending
    const plan =
      amount >= 5000 ? "LIFETIME" : amount >= 2000 ? "COACH_OFFICIAL" : "ANNUAL_ATHLETE";
    const endDate = plan === "LIFETIME"
      ? new Date("2099-12-31")
      : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

    // Generate unique card number with collision check
    let cardNumber = generateWpiCardNumber();
    let attempts = 0;
    while (attempts < 5) {
      const existing = await prisma.membership.findUnique({ where: { cardNumber } });
      if (!existing) break;
      cardNumber = generateWpiCardNumber();
      attempts++;
    }

    await prisma.membership.create({
      data: {
        userId,
        planType: plan as any,
        amountPaid: amount,
        status: "ACTIVE",
        cardNumber,
        startDate: new Date(),
        endDate,
      },
    });
  }
}

async function approveMeetRegistration(userId: string, eventId: string, paymentId: string) {
  // Assign a lot number (1 to N based on current registrations)
  const existingApprovedCount = await prisma.meetRegistration.count({
    where: { eventId, status: "APPROVED" },
  });
  const lotNumber = existingApprovedCount + 1;

  await prisma.meetRegistration.upsert({
    where: { userId_eventId: { userId, eventId } },
    update: {
      status: "APPROVED",
      paymentRef: paymentId,
      lotNumber,
    },
    create: {
      userId,
      eventId,
      status: "APPROVED",
      division: "OPEN",
      equipment: "RAW",
      paymentRef: paymentId,
      lotNumber,
    },
  });
}

async function activateSaasSubscription(
  userId: string,
  paymentId: string,
  planType: string,
  amount: number
) {
  const now = new Date();
  let endDate: Date;

  switch (planType) {
    case "YEARLY":
      endDate = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
      break;
    case "SIX_MONTH":
      endDate = new Date(now.getTime() + 183 * 24 * 60 * 60 * 1000);
      break;
    default: // MONTHLY
      endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  }

  const eventQuota = planType === "YEARLY" ? 48 : planType === "SIX_MONTH" ? 24 : 4;

  await prisma.federationSubscription.upsert({
    where: { userId },
    update: {
      status: "ACTIVE",
      planType: planType as any,
      endDate,
      pricePaid: amount,
      paymentUtr: paymentId,
      monthlyEventQuota: eventQuota,
    },
    create: {
      userId,
      planType: planType as any,
      status: "ACTIVE",
      startDate: now,
      endDate,
      pricePaid: amount,
      currency: "INR",
      paymentUtr: paymentId,
      monthlyEventQuota: eventQuota,
    },
  });
}
