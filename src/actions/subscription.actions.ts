"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import fs from "fs/promises";
import path from "path";

const EVENTS_FILE_PATH = path.join(process.cwd(), "src", "data", "federation-events.json");

export type PlanType = "MONTHLY" | "SIX_MONTH" | "YEARLY";

export interface SubscriptionStatusResponse {
  subscription: {
    id: string;
    userId: string;
    organizationName: string;
    planType: PlanType;
    status: "ACTIVE" | "EXPIRED" | "PENDING_APPROVAL" | "SUSPENDED";
    startDate: string;
    endDate: string;
    monthlyEventQuota: number;
    extraEventCredits: number;
    pricePaid: number;
    currency: string;
    contactPhone?: string | null;
    paymentUtr?: string | null;
    reactivationRequestedAt?: string | null;
    reactivationNotes?: string | null;
    reactivationPlanType?: PlanType | null;
    approvedBy?: string | null;
    approvedAt?: string | null;
  };
  metrics: {
    isExpired: boolean;
    daysRemaining: number;
    usedEventsThisMonth: number;
    baseQuota: number;
    extraCredits: number;
    totalAllowedEvents: number;
    remainingEvents: number;
    quotaExceeded: boolean;
    currentMonthName: string;
  };
}

/**
 * Counts events that fall in the current calendar month
 */
async function countEventsInCurrentMonth(): Promise<number> {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-indexed

  let totalThisMonth = 0;

  // 1. Check JSON file events
  try {
    const data = await fs.readFile(EVENTS_FILE_PATH, "utf-8");
    const parsed = JSON.parse(data);
    const events = parsed.events || [];
    for (const ev of events) {
      if (ev.date) {
        const d = new Date(ev.date);
        if (!isNaN(d.getTime())) {
          if (d.getFullYear() === currentYear && d.getMonth() === currentMonth) {
            totalThisMonth++;
          }
        }
      }
    }
  } catch {
    // Ignore JSON read errors
  }

  // 2. Also check DB events if more exist
  try {
    const startOfMonth = new Date(currentYear, currentMonth, 1);
    const endOfMonth = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59, 999);
    const dbCount = await prisma.event.count({
      where: {
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    });
    totalThisMonth = Math.max(totalThisMonth, dbCount);
  } catch {
    // Ignore db fallback
  }

  return totalThisMonth;
}

/**
 * Ensures that the admin has an active or valid subscription record.
 * Automatically marks subscription as EXPIRED if current date exceeds endDate.
 */
export async function ensureAdminSubscription(userId: string) {
  let sub = await prisma.federationSubscription.findUnique({
    where: { userId },
  });

  const now = new Date();

  if (!sub) {
    // Create default active starter subscription (1 Month duration, 4 events quota)
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000);
    sub = await prisma.federationSubscription.create({
      data: {
        userId,
        organizationName: "State Powerlifting Association",
        planType: "MONTHLY",
        status: "ACTIVE",
        startDate,
        endDate,
        monthlyEventQuota: 4,
        extraEventCredits: 0,
        pricePaid: 2999,
      },
    });
  } else if (sub.status === "ACTIVE" && new Date(sub.endDate) < now) {
    // Automatically transition to EXPIRED
    sub = await prisma.federationSubscription.update({
      where: { id: sub.id },
      data: { status: "EXPIRED" },
    });
  }

  return sub;
}

/**
 * Tenant Action: Get comprehensive subscription status and event quota metrics
 */
export async function getAdminSubscriptionStatusAction(): Promise<{
  success: boolean;
  data?: SubscriptionStatusResponse;
  error?: string;
}> {
  const session = await auth();

  if (session?.user?.role !== "ADMIN" && session?.user?.role !== "SUPER_ADMIN") {
    return { success: false, error: "Unauthorized. Admin credentials required." };
  }

  try {
    const sub = await ensureAdminSubscription(session.user.id);
    const usedEventsThisMonth = await countEventsInCurrentMonth();

    const now = new Date();
    const isExpired = sub.status === "EXPIRED" || new Date(sub.endDate) < now;
    const diffTime = new Date(sub.endDate).getTime() - now.getTime();
    const daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    const baseQuota = sub.monthlyEventQuota || 4;
    const extraCredits = sub.extraEventCredits || 0;
    const totalAllowedEvents = baseQuota + extraCredits;
    const remainingEvents = Math.max(0, totalAllowedEvents - usedEventsThisMonth);
    const quotaExceeded = usedEventsThisMonth >= totalAllowedEvents;

    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const currentMonthName = `${monthNames[now.getMonth()]} ${now.getFullYear()}`;

    return {
      success: true,
      data: {
        subscription: {
          id: sub.id,
          userId: sub.userId,
          organizationName: sub.organizationName,
          planType: sub.planType as PlanType,
          status: sub.status as any,
          startDate: sub.startDate.toISOString(),
          endDate: sub.endDate.toISOString(),
          monthlyEventQuota: sub.monthlyEventQuota,
          extraEventCredits: sub.extraEventCredits,
          pricePaid: sub.pricePaid,
          currency: sub.currency,
          contactPhone: sub.contactPhone,
          paymentUtr: sub.paymentUtr,
          reactivationRequestedAt: sub.reactivationRequestedAt?.toISOString() || null,
          reactivationNotes: sub.reactivationNotes,
          reactivationPlanType: sub.reactivationPlanType as PlanType | null,
          approvedBy: sub.approvedBy,
          approvedAt: sub.approvedAt?.toISOString() || null,
        },
        metrics: {
          isExpired,
          daysRemaining: isExpired ? 0 : daysRemaining,
          usedEventsThisMonth,
          baseQuota,
          extraCredits,
          totalAllowedEvents,
          remainingEvents,
          quotaExceeded,
          currentMonthName,
        },
      },
    };
  } catch (err: any) {
    console.error("Error fetching subscription status:", err);
    return { success: false, error: err.message || "Failed to load subscription details" };
  }
}

/**
 * Tenant Action: Submit reactivation request after making payment
 */
export async function requestReactivationAction({
  planType,
  paymentUtr,
  contactPhone,
  organizationName,
  notes,
}: {
  planType: PlanType;
  paymentUtr: string;
  contactPhone: string;
  organizationName?: string;
  notes?: string;
}) {
  const session = await auth();

  if (session?.user?.role !== "ADMIN" && session?.user?.role !== "SUPER_ADMIN") {
    return { success: false, error: "Unauthorized. Admin credentials required." };
  }

  if (!paymentUtr || paymentUtr.trim().length < 4) {
    return { success: false, error: "Please provide a valid Payment UTR or Transaction Reference ID." };
  }

  try {
    const sub = await ensureAdminSubscription(session.user.id);

    const updated = await prisma.federationSubscription.update({
      where: { id: sub.id },
      data: {
        status: "PENDING_APPROVAL",
        reactivationPlanType: planType,
        paymentUtr: paymentUtr.trim(),
        contactPhone: contactPhone.trim(),
        organizationName: organizationName?.trim() || sub.organizationName,
        reactivationNotes: notes?.trim() || "Payment submitted via bank/UPI",
        reactivationRequestedAt: new Date(),
      },
    });

    // Record in Audit Log
    try {
      await prisma.auditLog.create({
        data: {
          adminId: session.user.id,
          action: "REQUEST_REACTIVATION",
          entityType: "SUBSCRIPTION",
          entityId: updated.id,
          details: JSON.stringify({
            planType,
            paymentUtr,
            contactPhone,
            timestamp: new Date().toISOString(),
          }),
        },
      });
    } catch {}

    revalidatePath("/admin");
    revalidatePath("/admin/subscription");
    revalidatePath("/admin/saas");

    return {
      success: true,
      message: "Reactivation request submitted successfully. Awaiting platform owner manual verification & approval.",
    };
  } catch (err: any) {
    console.error("Reactivation request error:", err);
    return { success: false, error: err.message || "Failed to submit reactivation request." };
  }
}

/**
 * Tenant Action: Request extra event credits Top-up (Add-on)
 */
export async function requestExtraEventCreditsAction({
  credits,
  paymentUtr,
  notes,
}: {
  credits: number;
  paymentUtr: string;
  notes?: string;
}) {
  const session = await auth();

  if (session?.user?.role !== "ADMIN" && session?.user?.role !== "SUPER_ADMIN") {
    return { success: false, error: "Unauthorized. Admin credentials required." };
  }

  if (!credits || credits <= 0) {
    return { success: false, error: "Invalid credit count." };
  }

  try {
    const sub = await ensureAdminSubscription(session.user.id);

    await prisma.auditLog.create({
      data: {
        adminId: session.user.id,
        action: "REQUEST_EXTRA_EVENT_CREDITS",
        entityType: "SUBSCRIPTION",
        entityId: sub.id,
        details: JSON.stringify({
          requestedCredits: credits,
          paymentUtr,
          notes,
          timestamp: new Date().toISOString(),
        }),
      },
    });

    revalidatePath("/admin");
    revalidatePath("/admin/subscription");
    revalidatePath("/admin/saas");

    return {
      success: true,
      message: `Request for +${credits} extra event slots submitted with reference UTR: ${paymentUtr}. Platform owner will credit shortly!`,
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to submit extra credit request." };
  }
}

/**
 * Check if the tenant is eligible to create an event right now
 */
export async function checkEventCreationEligibilityAction(): Promise<{
  allowed: boolean;
  reason?: "EXPIRED" | "QUOTA_EXCEEDED" | "UNAUTHORIZED";
  message?: string;
  used?: number;
  totalAllowed?: number;
}> {
  const session = await auth();
  if (session?.user?.role !== "ADMIN" && session?.user?.role !== "SUPER_ADMIN") {
    return { allowed: false, reason: "UNAUTHORIZED", message: "Admin access required." };
  }

  const sub = await ensureAdminSubscription(session.user.id);
  const now = new Date();

  if (sub.status === "EXPIRED" || new Date(sub.endDate) < now) {
    return {
      allowed: false,
      reason: "EXPIRED",
      message: "Your Federation Subscription has expired. Please renew or contact platform owner for approval.",
    };
  }

  const used = await countEventsInCurrentMonth();
  const totalAllowed = (sub.monthlyEventQuota || 4) + (sub.extraEventCredits || 0);

  if (used >= totalAllowed) {
    return {
      allowed: false,
      reason: "QUOTA_EXCEEDED",
      message: `Monthly event quota reached (${used}/${totalAllowed} events used). Purchase extra event credits to host more events this month.`,
      used,
      totalAllowed,
    };
  }

  return { allowed: true, used, totalAllowed };
}

/**
 * Super Admin (Platform Owner) Action: List all subscriptions across all tenants
 */
export async function superAdminListAllSubscriptionsAction() {
  const session = await auth();

  if (session?.user?.role !== "ADMIN" && session?.user?.role !== "SUPER_ADMIN") {
    return { success: false, error: "Unauthorized. Admin credentials required." };
  }

  try {
    const subscriptions = await prisma.federationSubscription.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            image: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    const now = new Date();
    const currentMonthEvents = await countEventsInCurrentMonth();

    // Calculate SaaS KPIs
    let totalMRR = 0;
    let activeCount = 0;
    let expiredCount = 0;
    let pendingCount = 0;

    const formattedList = subscriptions.map((s) => {
      const isExpired = s.status === "EXPIRED" || new Date(s.endDate) < now;
      const effectiveStatus = isExpired && s.status === "ACTIVE" ? "EXPIRED" : s.status;

      if (effectiveStatus === "ACTIVE") {
        activeCount++;
        // MRR approx
        if (s.planType === "MONTHLY") totalMRR += 2999;
        if (s.planType === "SIX_MONTH") totalMRR += Math.round(14999 / 6);
        if (s.planType === "YEARLY") totalMRR += Math.round(26999 / 12);
      } else if (effectiveStatus === "EXPIRED") {
        expiredCount++;
      } else if (effectiveStatus === "PENDING_APPROVAL") {
        pendingCount++;
      }

      const diffTime = new Date(s.endDate).getTime() - now.getTime();
      const daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

      return {
        id: s.id,
        userId: s.userId,
        userName: s.user?.name || "Federation Administrator",
        userEmail: s.user?.email || "N/A",
        organizationName: s.organizationName,
        planType: s.planType as PlanType,
        status: effectiveStatus,
        startDate: s.startDate.toISOString(),
        endDate: s.endDate.toISOString(),
        daysRemaining: effectiveStatus === "EXPIRED" ? 0 : daysRemaining,
        monthlyEventQuota: s.monthlyEventQuota,
        extraEventCredits: s.extraEventCredits,
        totalAllowedEvents: s.monthlyEventQuota + s.extraEventCredits,
        usedEventsThisMonth: currentMonthEvents,
        pricePaid: s.pricePaid,
        contactPhone: s.contactPhone,
        paymentUtr: s.paymentUtr,
        reactivationRequestedAt: s.reactivationRequestedAt?.toISOString() || null,
        reactivationNotes: s.reactivationNotes,
        reactivationPlanType: s.reactivationPlanType as PlanType | null,
        approvedBy: s.approvedBy,
        approvedAt: s.approvedAt?.toISOString() || null,
      };
    });

    return {
      success: true,
      data: {
        subscriptions: formattedList,
        kpi: {
          totalTenants: subscriptions.length,
          activeTenants: activeCount,
          expiredTenants: expiredCount,
          pendingApprovals: pendingCount,
          monthlyRecurringRevenue: totalMRR,
          totalEventsThisMonth: currentMonthEvents,
        },
      },
    };
  } catch (err: any) {
    console.error("Super Admin subscriptions list error:", err);
    return { success: false, error: err.message || "Failed to load SaaS roster." };
  }
}

/**
 * Super Admin (Platform Owner) Action: Approve reactivation and grant access
 */
export async function superAdminApproveReactivationAction({
  subscriptionId,
  approvedPlan,
  bonusEventCredits = 0,
  overrideDays,
}: {
  subscriptionId: string;
  approvedPlan: PlanType;
  bonusEventCredits?: number;
  overrideDays?: number;
}) {
  const session = await auth();

  if (session?.user?.role !== "ADMIN" && session?.user?.role !== "SUPER_ADMIN") {
    return { success: false, error: "Unauthorized. Admin credentials required." };
  }

  try {
    const sub = await prisma.federationSubscription.findUnique({
      where: { id: subscriptionId },
    });

    if (!sub) {
      return { success: false, error: "Subscription not found." };
    }

    // Determine duration
    let durationDays = 30;
    let price = 2999;
    if (approvedPlan === "SIX_MONTH") {
      durationDays = 180;
      price = 14999;
    } else if (approvedPlan === "YEARLY") {
      durationDays = 365;
      price = 26999;
    }
    if (overrideDays && overrideDays > 0) {
      durationDays = overrideDays;
    }

    const now = new Date();
    // If not expired yet, extend from current endDate; if expired, start from now
    const baseDate = new Date(sub.endDate) > now ? new Date(sub.endDate) : now;
    const newEndDate = new Date(baseDate.getTime() + durationDays * 24 * 60 * 60 * 1000);

    await prisma.federationSubscription.update({
      where: { id: subscriptionId },
      data: {
        status: "ACTIVE",
        planType: approvedPlan,
        startDate: now,
        endDate: newEndDate,
        pricePaid: price,
        extraEventCredits: (sub.extraEventCredits || 0) + (bonusEventCredits || 0),
        approvedBy: session.user.email || session.user.name || "Platform Owner",
        approvedAt: now,
        reactivationNotes: null,
      },
    });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        adminId: session.user.id,
        action: "SUPER_ADMIN_APPROVE_SUBSCRIPTION",
        entityType: "SUBSCRIPTION",
        entityId: subscriptionId,
        details: JSON.stringify({
          approvedPlan,
          durationDays,
          newEndDate: newEndDate.toISOString(),
          bonusEventCredits,
          approvedBy: session.user.email,
        }),
      },
    });

    revalidatePath("/admin");
    revalidatePath("/admin/subscription");
    revalidatePath("/admin/saas");

    return {
      success: true,
      message: `Subscription successfully approved and activated! Extended until ${newEndDate.toLocaleDateString()} (${approvedPlan} plan).`,
    };
  } catch (err: any) {
    console.error("Super Admin approval error:", err);
    return { success: false, error: err.message || "Failed to approve subscription." };
  }
}

/**
 * Super Admin (Platform Owner) Action: Reject reactivation request
 */
export async function superAdminRejectReactivationAction({
  subscriptionId,
  reason,
}: {
  subscriptionId: string;
  reason?: string;
}) {
  const session = await auth();

  if (session?.user?.role !== "ADMIN" && session?.user?.role !== "SUPER_ADMIN") {
    return { success: false, error: "Unauthorized." };
  }

  try {
    await prisma.federationSubscription.update({
      where: { id: subscriptionId },
      data: {
        status: "EXPIRED",
        reactivationNotes: `Rejected by owner: ${reason || "Invalid payment details"}`,
      },
    });

    revalidatePath("/admin");
    revalidatePath("/admin/subscription");
    revalidatePath("/admin/saas");

    return { success: true, message: "Reactivation request rejected." };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to reject request." };
  }
}

/**
 * Super Admin (Platform Owner) Action: Grant extra event credits directly
 */
export async function superAdminGrantExtraCreditsAction({
  subscriptionId,
  creditsToAdd,
}: {
  subscriptionId: string;
  creditsToAdd: number;
}) {
  const session = await auth();

  if (session?.user?.role !== "ADMIN" && session?.user?.role !== "SUPER_ADMIN") {
    return { success: false, error: "Unauthorized." };
  }

  try {
    const sub = await prisma.federationSubscription.findUnique({
      where: { id: subscriptionId },
    });

    if (!sub) return { success: false, error: "Subscription not found." };

    const newCredits = (sub.extraEventCredits || 0) + creditsToAdd;

    await prisma.federationSubscription.update({
      where: { id: subscriptionId },
      data: { extraEventCredits: newCredits },
    });

    await prisma.auditLog.create({
      data: {
        adminId: session.user.id,
        action: "GRANT_EXTRA_EVENT_CREDITS",
        entityType: "SUBSCRIPTION",
        entityId: subscriptionId,
        details: JSON.stringify({
          creditsAdded: creditsToAdd,
          totalNewCredits: newCredits,
          timestamp: new Date().toISOString(),
        }),
      },
    });

    revalidatePath("/admin");
    revalidatePath("/admin/subscription");
    revalidatePath("/admin/saas");

    return {
      success: true,
      message: `Successfully granted +${creditsToAdd} extra event credits! Total capacity is now ${sub.monthlyEventQuota + newCredits} events/month.`,
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to grant extra credits." };
  }
}

/**
 * Testing & Simulation Action: Simulate instant plan expiry or reset
 * Allows the platform owner to test both the Lockout state and Reactivation approval flow in real time!
 */
export async function superAdminSimulateExpiryAction({
  subscriptionId,
  makeExpired,
}: {
  subscriptionId: string;
  makeExpired: boolean;
}) {
  const session = await auth();

  if (session?.user?.role !== "ADMIN" && session?.user?.role !== "SUPER_ADMIN") {
    return { success: false, error: "Unauthorized." };
  }

  try {
    const now = new Date();
    if (makeExpired) {
      // Set endDate to yesterday and status to EXPIRED
      const expiredDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      await prisma.federationSubscription.update({
        where: { id: subscriptionId },
        data: {
          status: "EXPIRED",
          endDate: expiredDate,
        },
      });
    } else {
      // Restore to active 30 days
      const futureDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      await prisma.federationSubscription.update({
        where: { id: subscriptionId },
        data: {
          status: "ACTIVE",
          startDate: now,
          endDate: futureDate,
          reactivationNotes: null,
          paymentUtr: null,
        },
      });
    }

    revalidatePath("/admin");
    revalidatePath("/admin/subscription");
    revalidatePath("/admin/saas");

    return {
      success: true,
      message: makeExpired
        ? "Simulated Plan Expiry! Account is now locked out until reactivated."
        : "Restored subscription to Active state with 30 days validity.",
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Simulation failed." };
  }
}
