import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export const dynamic = "force-dynamic";

// ─────────────────────────────────────────────────────────────────────────────
// STRIPE PRODUCTION WEBHOOK — Stripe-Signature HMAC-SHA256 Verification
// ─────────────────────────────────────────────────────────────────────────────

const STRIPE_WEBHOOK_SECRET =
  process.env.STRIPE_WEBHOOK_SECRET || "";

/**
 * Stripe uses a timestamp-based signature to prevent replay attacks.
 * Format: "t=TIMESTAMP,v1=SIGNATURE"
 */
function verifyStripeSignature(rawBody: string, sigHeader: string, secret: string): boolean {
  if (!secret || !sigHeader) {
    return process.env.NODE_ENV !== "production"; // Allow unsigned in dev
  }

  try {
    const parts = sigHeader.split(",").reduce<Record<string, string>>((acc, part) => {
      const [key, val] = part.split("=");
      acc[key] = val;
      return acc;
    }, {});

    const timestamp = parts["t"];
    const v1Sig = parts["v1"];

    if (!timestamp || !v1Sig) return false;

    // Replay attack guard — reject if webhook is older than 5 minutes
    const webhookAge = Math.abs(Date.now() / 1000 - parseInt(timestamp));
    if (webhookAge > 300) {
      console.warn(`[Stripe Webhook] ⚠️ Stale webhook rejected (age: ${webhookAge}s)`);
      return false;
    }

    const signedPayload = `${timestamp}.${rawBody}`;
    const expectedSig = crypto
      .createHmac("sha256", secret)
      .update(signedPayload)
      .digest("hex");

    return crypto.timingSafeEqual(
      Buffer.from(expectedSig, "hex"),
      Buffer.from(v1Sig, "hex")
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
  const sigHeader = req.headers.get("stripe-signature") || "";
  if (!verifyStripeSignature(rawBody, sigHeader, STRIPE_WEBHOOK_SECRET)) {
    console.error("[Stripe Webhook] ❌ Invalid or missing signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let stripeEvent: any;
  try {
    stripeEvent = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const eventType: string = stripeEvent?.type || "";
  const dataObject = stripeEvent?.data?.object || {};

  console.log(`[Stripe Webhook] ✅ Received event: ${eventType}`);

  // ── 2. Route by Stripe event type ────────────────────────────────────────
  try {
    if (eventType === "checkout.session.completed") {
      await handleCheckoutCompleted(dataObject);
    } else if (eventType === "customer.subscription.updated") {
      await handleSubscriptionUpdated(dataObject);
    } else if (eventType === "customer.subscription.deleted") {
      await handleSubscriptionCancelled(dataObject);
    } else if (eventType === "invoice.payment_succeeded") {
      await handleInvoicePaid(dataObject);
    }
  } catch (err: any) {
    console.error(`[Stripe Webhook] ❌ Handler error for ${eventType}:`, err.message);
    return NextResponse.json({ error: "Internal handler error" }, { status: 500 });
  }

  return NextResponse.json({ success: true, eventType });
}

// ─────────────────────────────────────────────────────────────────────────────
// STRIPE EVENT HANDLERS
// ─────────────────────────────────────────────────────────────────────────────

async function handleCheckoutCompleted(session: any) {
  const email = session?.customer_details?.email || session?.customer_email || "";
  const metadata = session?.metadata || {};
  const paymentType = metadata?.paymentType || "membership";
  const planType = metadata?.planType || "MONTHLY";
  const eventId = metadata?.eventId || "";
  const stripeSessionId = session?.id || "";
  const amountTotal = (session?.amount_total || 0) / 100; // cents → INR equivalent

  const user = email ? await prisma.user.findUnique({ where: { email: email.toLowerCase() } }) : null;
  if (!user) {
    console.warn(`[Stripe Webhook] ⚠️ User not found for email: ${email}`);
    return;
  }

  if (paymentType === "membership") {
    await activateMembership(user.id, stripeSessionId, amountTotal);
    console.log(`[Stripe Webhook] ✅ Membership activated for ${email}`);
  } else if (paymentType === "meet_registration" && eventId) {
    await approveMeetRegistration(user.id, eventId, stripeSessionId);
    console.log(`[Stripe Webhook] ✅ Meet registration approved for ${email} — event: ${eventId}`);
  } else if (paymentType === "saas_subscription") {
    await activateSaasSubscription(user.id, stripeSessionId, planType, amountTotal);
    console.log(`[Stripe Webhook] ✅ SaaS subscription activated for ${email} — plan: ${planType}`);
  }
}

async function handleSubscriptionUpdated(subscription: any) {
  const stripeSubscriptionId = subscription?.id || "";
  const status = subscription?.status || "";
  const email = subscription?.customer_email || "";

  if (!email || status !== "active") return;

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user) return;

  await prisma.federationSubscription.updateMany({
    where: { userId: user.id },
    data: { status: "ACTIVE" },
  });
}

async function handleSubscriptionCancelled(subscription: any) {
  const email = subscription?.customer_email || "";
  if (!email) return;

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user) return;

  await prisma.federationSubscription.updateMany({
    where: { userId: user.id, status: "ACTIVE" },
    data: { status: "EXPIRED" },
  });
  console.log(`[Stripe Webhook] ⚠️ Subscription expired for ${email}`);
}

async function handleInvoicePaid(invoice: any) {
  // Subscription renewal — extend endDate
  const email = invoice?.customer_email || "";
  if (!email) return;

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user) return;

  const sub = await prisma.federationSubscription.findUnique({ where: { userId: user.id } });
  if (!sub) return;

  const now = new Date();
  let endDate: Date;
  switch (sub.planType) {
    case "YEARLY":
      endDate = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
      break;
    case "SIX_MONTH":
      endDate = new Date(now.getTime() + 183 * 24 * 60 * 60 * 1000);
      break;
    default:
      endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  }

  await prisma.federationSubscription.update({
    where: { userId: user.id },
    data: { status: "ACTIVE", endDate },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// SHARED FULFILLMENT HELPERS
// ─────────────────────────────────────────────────────────────────────────────

async function activateMembership(userId: string, paymentId: string, amount: number) {
  const pending = await prisma.membership.findFirst({
    where: { userId, status: "PENDING" },
  });

  if (pending) {
    await prisma.membership.update({
      where: { id: pending.id },
      data: { status: "ACTIVE" },
    });
  } else {
    const plan = amount >= 5000 ? "LIFETIME" : amount >= 2000 ? "COACH_OFFICIAL" : "ANNUAL_ATHLETE";
    const endDate =
      plan === "LIFETIME"
        ? new Date("2099-12-31")
        : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

    let cardNumber = generateWpiCardNumber();
    for (let i = 0; i < 5; i++) {
      const exists = await prisma.membership.findUnique({ where: { cardNumber } });
      if (!exists) break;
      cardNumber = generateWpiCardNumber();
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
  const count = await prisma.meetRegistration.count({
    where: { eventId, status: "APPROVED" },
  });
  const lotNumber = count + 1;

  await prisma.meetRegistration.upsert({
    where: { userId_eventId: { userId, eventId } },
    update: { status: "APPROVED", paymentRef: paymentId, lotNumber },
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
  const endDate =
    planType === "YEARLY"
      ? new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000)
      : planType === "SIX_MONTH"
      ? new Date(now.getTime() + 183 * 24 * 60 * 60 * 1000)
      : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

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
