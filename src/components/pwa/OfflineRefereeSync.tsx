"use client";

import { useEffect, useRef, useState, useCallback } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// useOfflineRefereeSync
// Hook that intercepts referee decisions and:
//   1. When online  → passes directly to the provided submit function
//   2. When offline → queues to Service Worker (IndexedDB) for background sync
// ─────────────────────────────────────────────────────────────────────────────

export interface QueuedDecision {
  resultId: string;
  decision: "WHITE" | "RED";
  refereePosition: "LEFT" | "CENTER" | "RIGHT";
  infractions?: string[];
  timestamp: number;
}

interface UseOfflineRefereeSyncReturn {
  isOnline: boolean;
  queueCount: number;
  queueDecision: (decision: QueuedDecision) => Promise<void>;
  forcSync: () => void;
  lastSyncAt: Date | null;
  syncStatus: "idle" | "syncing" | "synced" | "error";
}

export function useOfflineRefereeSync(
  onlineSubmit: (decision: QueuedDecision) => Promise<{ success: boolean; error?: string }>
): UseOfflineRefereeSyncReturn {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [queueCount, setQueueCount] = useState(0);

  // Sync actual browser online state after hydration mount
  useEffect(() => {
    if (typeof navigator !== "undefined") {
      setIsOnline(navigator.onLine);
    }
  }, []);
  const [lastSyncAt, setLastSyncAt] = useState<Date | null>(null);
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "synced" | "error">("idle");
  const swRef = useRef<ServiceWorker | null>(null);

  // ── Register SW & listen for messages ──
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    // Skip service worker in local dev
    if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
      return;
    }

    const registerSW = async () => {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
        });
        console.log("[PWA] Service Worker registered:", registration.scope);
        swRef.current = registration.active || registration.installing;
      } catch (err) {
        console.warn("[PWA] Service Worker registration failed:", err);
      }
    };

    registerSW();

    // Listen for messages from SW
    const handleSWMessage = (event: MessageEvent) => {
      const { type } = event.data || {};
      if (type === "SYNC_COMPLETE") {
        const { synced, failed } = event.data;
        console.log(`[PWA] Sync complete: ${synced} synced, ${failed} failed`);
        setLastSyncAt(new Date());
        setSyncStatus(failed > 0 ? "error" : "synced");
        refreshQueueCount();
        setTimeout(() => setSyncStatus("idle"), 3000);
      }
      if (type === "QUEUE_COUNT") {
        setQueueCount(event.data.count || 0);
      }
    };

    navigator.serviceWorker.addEventListener("message", handleSWMessage);
    return () => navigator.serviceWorker.removeEventListener("message", handleSWMessage);
  }, []);

  // ── Network status monitoring ──
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      console.log("[PWA] Network restored — triggering background sync");
      // Trigger background sync when back online
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.ready.then((reg) => {
          if ("sync" in reg) {
            (reg as any).sync.register("wpi-offline-queue").catch(console.warn);
          } else {
            // Fallback: force sync via message
            sendSWMessage({ type: "FORCE_SYNC" });
          }
        });
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      console.log("[PWA] Network lost — switching to offline queue mode");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const sendSWMessage = useCallback((message: object) => {
    if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage(message);
    }
  }, []);

  const refreshQueueCount = useCallback(() => {
    sendSWMessage({ type: "GET_QUEUE_COUNT" });
  }, [sendSWMessage]);

  // Periodically refresh queue count
  useEffect(() => {
    refreshQueueCount();
    const interval = setInterval(refreshQueueCount, 10_000);
    return () => clearInterval(interval);
  }, [refreshQueueCount]);

  // ── Main decision handler ──
  const queueDecision = useCallback(
    async (decision: QueuedDecision) => {
      if (isOnline) {
        // Try online submission first
        try {
          const result = await onlineSubmit(decision);
          if (!result.success) throw new Error(result.error);
          return;
        } catch (err) {
          console.warn("[PWA] Online submit failed, falling back to queue:", err);
        }
      }

      // Queue decision via Service Worker
      sendSWMessage({ type: "QUEUE_DECISION", payload: decision });
      setQueueCount((prev) => prev + 1);
      console.log("[PWA] Decision queued offline:", decision.resultId);
    },
    [isOnline, onlineSubmit, sendSWMessage]
  );

  // ── Force sync (manual button trigger) ──
  const forcSync = useCallback(() => {
    setSyncStatus("syncing");
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.ready.then((reg) => {
        if ("sync" in reg) {
          (reg as any).sync.register("wpi-offline-queue").catch(() => {
            sendSWMessage({ type: "FORCE_SYNC" });
          });
        } else {
          sendSWMessage({ type: "FORCE_SYNC" });
        }
      });
    }
  }, [sendSWMessage]);

  return { isOnline, queueCount, queueDecision, forcSync, lastSyncAt, syncStatus };
}

// ─────────────────────────────────────────────────────────────────────────────
// OfflineSyncStatusBar — Shows connection status + queued decision count
// ─────────────────────────────────────────────────────────────────────────────

interface OfflineSyncStatusBarProps {
  isOnline: boolean;
  queueCount: number;
  syncStatus: "idle" | "syncing" | "synced" | "error";
  lastSyncAt: Date | null;
  onForceSync: () => void;
}

export function OfflineSyncStatusBar({
  isOnline,
  queueCount,
  syncStatus,
  lastSyncAt,
  onForceSync,
}: OfflineSyncStatusBarProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;
  if (isOnline && queueCount === 0 && syncStatus === "idle") return null;

  return (
    <div
      className={`flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-sm transition-all ${
        !isOnline
          ? "border-amber-500/40 bg-amber-950/30 text-amber-300"
          : syncStatus === "error"
          ? "border-red-500/40 bg-red-950/30 text-red-300"
          : syncStatus === "synced"
          ? "border-emerald-500/40 bg-emerald-950/30 text-emerald-300"
          : "border-blue-500/40 bg-blue-950/30 text-blue-300"
      }`}
    >
      <div className="flex items-center gap-2.5">
        {/* Indicator dot */}
        <span
          className={`h-2.5 w-2.5 flex-shrink-0 rounded-full ${
            !isOnline
              ? "animate-pulse bg-amber-400"
              : syncStatus === "syncing"
              ? "animate-spin bg-blue-400"
              : syncStatus === "synced"
              ? "bg-emerald-400"
              : syncStatus === "error"
              ? "bg-red-400"
              : "bg-emerald-400"
          }`}
        />

        <div>
          {!isOnline ? (
            <span className="font-semibold">
              📡 Offline Mode —{" "}
              {queueCount > 0 ? (
                <span>
                  <strong>{queueCount}</strong> decision{queueCount !== 1 ? "s" : ""} queued for sync
                </span>
              ) : (
                "Ready to queue decisions"
              )}
            </span>
          ) : syncStatus === "syncing" ? (
            <span className="font-semibold">🔄 Syncing {queueCount} queued decisions…</span>
          ) : syncStatus === "synced" ? (
            <span className="font-semibold">
              ✅ All decisions synced{lastSyncAt ? ` at ${lastSyncAt.toLocaleTimeString()}` : ""}
            </span>
          ) : syncStatus === "error" ? (
            <span className="font-semibold">⚠️ Sync error — {queueCount} decisions still pending</span>
          ) : queueCount > 0 ? (
            <span className="font-semibold">
              🟡 {queueCount} offline decision{queueCount !== 1 ? "s" : ""} pending sync
            </span>
          ) : null}
        </div>
      </div>

      {/* Force sync button */}
      {isOnline && queueCount > 0 && syncStatus !== "syncing" && (
        <button
          onClick={onForceSync}
          className="flex-shrink-0 rounded-xl border border-current/30 bg-black/30 px-3 py-1.5 text-xs font-bold transition-all hover:bg-black/60"
        >
          Sync Now
        </button>
      )}
    </div>
  );
}
