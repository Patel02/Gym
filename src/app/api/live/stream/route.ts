import { NextRequest } from "next/server";
import { liveStreamHub } from "@/lib/live-stream-hub";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const meetId = searchParams.get("meetId") || "ALL";

  const clientId = `client-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const encoder = new TextEncoder();

  let unsubscribe: (() => void) | null = null;
  let heartbeatInterval: NodeJS.Timeout | null = null;

  const stream = new ReadableStream({
    start(controller) {
      // 1. Initial Connection Handshake event
      const initialMessage = `event: connected\ndata: ${JSON.stringify({
        clientId,
        meetId,
        message: "Microsecond Real-Time Broadcast Stream Connected",
        timestamp: new Date().toISOString(),
      })}\n\n`;
      controller.enqueue(encoder.encode(initialMessage));

      // Push cached state immediately so OBS browser source doesn't start empty
      const cached = liveStreamHub.getLastStageState(meetId);
      if (cached) {
        const cachedMsg = `event: stage_update\ndata: ${JSON.stringify(cached)}\n\n`;
        controller.enqueue(encoder.encode(cachedMsg));
      }

      // 2. Subscribe to LiveStreamHub
      unsubscribe = liveStreamHub.subscribe(
        clientId,
        (payload) => {
          try {
            const sseData = `event: ${payload.event}\ndata: ${JSON.stringify(payload.data)}\n\n`;
            controller.enqueue(encoder.encode(sseData));
          } catch (err) {
            console.warn(`[SSE Stream] Enqueue error for ${clientId}:`, err);
          }
        },
        meetId
      );

      // 3. Heartbeat / Keepalive every 15 seconds
      heartbeatInterval = setInterval(() => {
        try {
          const ping = `: ping ${new Date().toISOString()}\n\n`;
          controller.enqueue(encoder.encode(ping));
        } catch {
          if (heartbeatInterval) clearInterval(heartbeatInterval);
        }
      }, 15000);
    },
    cancel() {
      if (unsubscribe) unsubscribe();
      if (heartbeatInterval) clearInterval(heartbeatInterval);
    },
  });

  req.signal.addEventListener("abort", () => {
    if (unsubscribe) unsubscribe();
    if (heartbeatInterval) clearInterval(heartbeatInterval);
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform, must-revalidate",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no", // Disables nginx buffering
    },
  });
}
