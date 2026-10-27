/**
 * Enterprise In-Memory Broadcast Hub for Real-Time Server-Sent Events (SSE)
 * Connects /live spectator jumbotrons, referee switchboards, and match day platforms
 */

type StreamCallback = (payload: { event: string; data: any; timestamp: string }) => void;

interface Subscription {
  id: string;
  meetId?: string;
  callback: StreamCallback;
}

class LiveStreamHub {
  private subscribers: Map<string, Subscription> = new Map();
  private lastStageStates: Map<string, any> = new Map();

  /**
   * Subscribe a client stream to real-time events
   */
  public subscribe(id: string, callback: StreamCallback, meetId?: string): () => void {
    this.subscribers.set(id, { id, meetId, callback });

    // If there is a cached last state for this meet, send immediately on connection
    if (meetId && this.lastStageStates.has(meetId)) {
      try {
        callback({
          event: "stage_update",
          data: this.lastStageStates.get(meetId),
          timestamp: new Date().toISOString(),
        });
      } catch (err) {
        console.warn("[LiveHub] Error delivering initial state:", err);
      }
    }

    return () => {
      this.subscribers.delete(id);
    };
  }

  /**
   * Broadcast an event to all connected clients (optionally filtered by meetId)
   */
  public broadcast(event: string, data: any, meetId?: string) {
    const timestamp = new Date().toISOString();
    const payload = { event, data, timestamp };

    // Cache latest stage state for instant new client delivery
    if (meetId && (event === "stage_update" || event === "referee_decision" || event === "referee_light")) {
      const prev = this.lastStageStates.get(meetId) || {};
      this.lastStageStates.set(meetId, { ...prev, ...data });
    }

    this.subscribers.forEach((sub, id) => {
      // If subscriber is filtering by meetId, only send if matches
      if (meetId && sub.meetId && sub.meetId !== meetId && sub.meetId !== "ALL") {
        return;
      }

      try {
        sub.callback(payload);
      } catch (err) {
        console.warn(`[LiveHub] Failed to send to subscriber ${id}, removing.`);
        this.subscribers.delete(id);
      }
    });
  }

  /**
   * Get latest cached stage state for a meet
   */
  public getLastStageState(meetId?: string): any {
    if (!meetId) return null;
    return this.lastStageStates.get(meetId) || null;
  }

  /**
   * Get active subscriber count for telemetry
   */
  public getSubscriberCount(): number {
    return this.subscribers.size;
  }
}

// Global singleton across server invocations
const globalForHub = global as unknown as { liveStreamHub?: LiveStreamHub };
export const liveStreamHub = globalForHub.liveStreamHub || new LiveStreamHub();
if (process.env.NODE_ENV !== "production") globalForHub.liveStreamHub = liveStreamHub;

/**
 * Convenience helper to broadcast stage changes to all connected jumbotrons & screens
 */
export function broadcastLiveArenaUpdate(event: string, data: any, meetId?: string) {
  liveStreamHub.broadcast(event, data, meetId);
}
