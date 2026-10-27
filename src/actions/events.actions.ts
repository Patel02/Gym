"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import fs from "fs/promises";
import path from "path";
import type { MeetItem, AnnouncementItem } from "@/components/admin/EventsManager";

const EVENTS_FILE_PATH = path.join(process.cwd(), "src", "data", "federation-events.json");

export async function saveFederationEventsAction(
  events: MeetItem[],
  announcements?: AnnouncementItem[]
) {
  const session = await auth();

  if (session?.user?.role !== "ADMIN" && session?.user?.role !== "SUPER_ADMIN") {
    return { success: false, error: "Unauthorized. Admin credentials required." };
  }

  if (!Array.isArray(events)) {
    return { success: false, error: "Invalid events list." };
  }

  // ── SaaS Subscription & Monthly Quota Guard ──
  const { ensureAdminSubscription } = await import("./subscription.actions");
  const sub = await ensureAdminSubscription(session.user.id);
  const now = new Date();

  if (sub.status === "EXPIRED" || new Date(sub.endDate) < now) {
    return {
      success: false,
      error: "Subscription Expired: Your Federation Plan has expired. Please contact the platform owner to reactivate your access.",
    };
  }

  // Check 4-event monthly quota limit (+ extra credits)
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const currentMonthEventsCount = events.filter((ev) => {
    // MeetItem uses `dates` (string like "15-17 Jan 2026") — extract year from it
    if (!ev.dates) return false;
    const rawDate = ev.dates.trim();
    const d = new Date(rawDate);
    if (!isNaN(d.getTime())) {
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
    }
    // Fallback: check if the current year appears in the dates string
    return rawDate.includes(String(currentYear));
  }).length;

  const totalAllowed = (sub.monthlyEventQuota || 4) + (sub.extraEventCredits || 0);
  if (currentMonthEventsCount > totalAllowed) {
    return {
      success: false,
      error: `Monthly Event Limit Exceeded: Your plan allows ${totalAllowed} events this month (${sub.monthlyEventQuota} base + ${sub.extraEventCredits} extra credits), but ${currentMonthEventsCount} events are scheduled for ${now.toLocaleString('default', { month: 'long' })}. Please purchase Extra Event Top-up credits to create additional events.`,
    };
  }


  try {
    // If announcements wasn't passed, read existing ones from file
    let existingAnnouncements: AnnouncementItem[] = announcements || [];
    if (!announcements) {
      try {
        const currentData = await fs.readFile(EVENTS_FILE_PATH, "utf-8");
        const parsed = JSON.parse(currentData);
        existingAnnouncements = parsed.announcements || [];
      } catch {
        existingAnnouncements = [];
      }
    }

    // Tag events with tenant details
    const enrichedEvents = events.map((ev) => ({
      ...ev,
      tenantId: ev.tenantId || session.user.id,
      organizationName: ev.organizationName || sub.organizationName || "State Powerlifting Association",
    }));

    const payload = {
      events: enrichedEvents,
      announcements: existingAnnouncements,
    };

    await fs.mkdir(path.dirname(EVENTS_FILE_PATH), { recursive: true });
    await fs.writeFile(EVENTS_FILE_PATH, JSON.stringify(payload, null, 2), "utf-8");

    // Synchronize directly with PostgreSQL prisma.event table
    try {
      for (const ev of enrichedEvents) {
        const numericFee = parseFloat((ev.entryFee || "0").replace(/[^0-9.]/g, "")) || 0;
        await prisma.event.upsert({
          where: { id: ev.id },
          update: {
            title: ev.title,
            location: `${ev.city || "National"}, ${ev.venue || "Arena"}`,
            status: ev.status,
            entryFee: numericFee,
            meetDirector: ev.organizationName || sub.organizationName || "Federation Technical Committee",
          },
          create: {
            id: ev.id,
            title: ev.title,
            date: new Date(),
            location: `${ev.city || "National"}, ${ev.venue || "Arena"}`,
            status: ev.status,
            entryFee: numericFee,
            registrationOpen: new Date(),
            registrationClose: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
            maxAthletes: 120,
            meetDirector: ev.organizationName || sub.organizationName || "Federation Technical Committee",
          },
        });
      }
    } catch (dbSyncErr) {
      console.warn("Prisma event DB sync note:", dbSyncErr);
    }

    // Optional audit log for dashboard visibility
    if (session.user?.id) {
      try {
        await prisma.auditLog.create({
          data: {
            adminId: session.user.id,
            action: "MANAGE_EVENTS",
            entityType: "EVENT",
            entityId: "federation-events",
            details: JSON.stringify({ count: events.length, timestamp: new Date().toISOString() }),
          },
        });
      } catch (logErr) {
        console.warn("Audit log creation skipped:", logErr);
      }
    }

    // Revalidate all pages consuming events
    revalidatePath("/championships");
    revalidatePath("/");
    revalidatePath("/admin/events");
    revalidatePath("/admin");

    return { 
      success: true, 
      message: "Events successfully published to live website!", 
      events: payload.events,
      announcements: payload.announcements
    };
  } catch (error: any) {
    console.error("Failed to save federation events:", error);
    return { success: false, error: error.message || "Failed to persist events." };
  }
}
