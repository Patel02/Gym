import { NextRequest, NextResponse } from "next/server";
import { requireUserRole } from "@/lib/authz";
import { liveStreamHub } from "@/lib/live-stream-hub";
import { z } from "zod";

export const dynamic = "force-dynamic";

const BROADCAST_SECRET = process.env.BROADCAST_FEED_SECRET;

// Rate limiting map (max 30 broadcast updates per 5 seconds per IP)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 5000 });
    return true;
  }
  if (entry.count >= 30) {
    return false;
  }
  entry.count++;
  return true;
}

// XSS Sanitizer for stream text
function sanitizeText(str?: string): string {
  if (!str) return "";
  return str
    .replace(/[<>]/g, "")
    .replace(/javascript:/gi, "")
    .trim()
    .slice(0, 100);
}

const BroadcastPayloadSchema = z.object({
  type: z.enum([
    "referee_decision",
    "referee_light",
    "stage_update",
    "timer_event",
    "national_record",
    "announcement",
  ]),
  meetId: z.string().optional().default("ALL"),
  data: z.record(z.string(), z.any()),
});

export async function POST(req: NextRequest) {
  try {
    // 1. Rate Limit Check
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0] ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { success: false, error: "Too many broadcast requests. Rate limit exceeded." },
        { status: 429 }
      );
    }

    // 2. Authentication: Check Session OR API Key
    const authHeader = req.headers.get("authorization") || "";
    const apiKeyHeader =
      req.headers.get("x-broadcast-key") || req.headers.get("x-api-key") || "";
    const token = authHeader.replace(/^Bearer\s+/i, "") || apiKeyHeader;

    const user = await requireUserRole("ADMIN", "REFEREE", "SUPER_ADMIN");
    const isSessionAuthorized = Boolean(user);

    const isApiKeyAuthorized = Boolean(
      BROADCAST_SECRET && token && token === BROADCAST_SECRET,
    );

    if (!isSessionAuthorized && !isApiKeyAuthorized) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Unauthorized. A valid Referee/Admin session or authorized Broadcast API key is required.",
        },
        { status: 401 }
      );
    }

    // 3. Payload Validation
    const body = await req.json();
    const parsed = BroadcastPayloadSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid broadcast schema.", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { type, meetId, data } = parsed.data;

    // 4. Sanitize text fields
    if (data.lifterName) data.lifterName = sanitizeText(data.lifterName);
    if (data.infractionReason) data.infractionReason = sanitizeText(data.infractionReason);
    if (data.headline) data.headline = sanitizeText(data.headline);
    if (data.subtitle) data.subtitle = sanitizeText(data.subtitle);

    // 5. Broadcast in real time
    liveStreamHub.broadcast(type, data, meetId);

    const subscribersCount = liveStreamHub.getSubscriberCount();

    return NextResponse.json({
      success: true,
      type,
      meetId,
      subscribersCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[Broadcast API Error]:", error);
    return NextResponse.json(
      { success: false, error: "Internal broadcast error." },
      { status: 500 }
    );
  }
}

// GET endpoint to query broadcast telemetry and stream status
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const meetId = searchParams.get("meetId") || "ALL";

  return NextResponse.json({
    status: "ONLINE",
    protocol: "SSE / Microsecond Event Hub",
    activeSubscribers: liveStreamHub.getSubscriberCount(),
    meetId,
    lastStageState: liveStreamHub.getLastStageState(meetId),
    timestamp: new Date().toISOString(),
  });
}
