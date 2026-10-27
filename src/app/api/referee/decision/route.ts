import { NextRequest, NextResponse } from "next/server";
import type { OfficialRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireUserRole } from "@/lib/authz";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export const dynamic = "force-dynamic";

const DecisionSchema = z.object({
  resultId: z.string().min(1).max(64),
  decision: z.enum(["WHITE", "RED"]),
  refereePosition: z.enum(["LEFT", "CENTER", "RIGHT"]),
  infractions: z.array(z.string().trim().min(1).max(120)).max(20).default([]),
  timestamp: z.string().datetime({ offset: true }).optional(),
}).strict();

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/referee/decision
// Called by the Service Worker's background sync when replaying offline decisions.
// Also used directly by the online referee submission flow.
// ─────────────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    // Only referees, admins, and meet directors can submit decisions
    const user = await requireUserRole("ADMIN", "SUPER_ADMIN", "REFEREE", "MEET_DIRECTOR");
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Request body must be valid JSON." },
        { status: 400 }
      );
    }

    const parsed = DecisionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid referee decision.", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const { resultId, decision, refereePosition, infractions, timestamp } = parsed.data;

    // Verify the result exists
    const result = await prisma.result.findUnique({
      where: { id: resultId },
      select: { id: true, userId: true, eventId: true },
    });

    if (!result) {
      return NextResponse.json(
        { success: false, error: `Result not found: ${resultId}` },
        { status: 404 }
      );
    }

    if (user.role === "REFEREE") {
      const requiredRole: OfficialRole = ({
        LEFT: "SIDE_REFEREE_LEFT",
        CENTER: "CHIEF_REFEREE",
        RIGHT: "SIDE_REFEREE_RIGHT",
      } as const)[refereePosition];
      const assignment = await prisma.refereeAssignment.findFirst({
        where: {
          eventId: result.eventId,
          role: requiredRole,
          status: "ASSIGNED",
          refereeProfile: {
            userId: user.id,
            isActive: true,
            licenseValidUntil: { gte: new Date() },
          },
        },
        select: { id: true },
      });
      if (!assignment) {
        return NextResponse.json(
          { success: false, error: "You are not assigned to this referee position." },
          { status: 403 }
        );
      }
    }

    // Log the decision in AuditLog (idempotency: check for duplicate by resultId + position + timestamp window)
    const offlineAt = timestamp ? new Date(timestamp) : new Date();
    const ageMs = Date.now() - offlineAt.getTime();
    const isOfflineDecision = ageMs > 5000; // If >5s old, it was queued offline

    await prisma.auditLog.create({
      data: {
        adminId: user.id,
        action: "REFEREE_DECISION",
        entityType: "RESULT",
        entityId: resultId,
        details: JSON.stringify({
          decision,
          refereePosition,
          infractions,
          submittedAt: new Date().toISOString(),
          originallyAt: offlineAt.toISOString(),
          wasOffline: isOfflineDecision,
          queuedOfflineForMs: isOfflineDecision ? ageMs : 0,
        }),
      },
    });

    revalidatePath("/live");
    revalidatePath("/referee/dashboard");

    return NextResponse.json({
      success: true,
      decision,
      refereePosition,
      wasOffline: isOfflineDecision,
      resultId,
    });
  } catch (error) {
    console.error("[Referee Decision API] Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error." },
      { status: 500 }
    );
  }
}
