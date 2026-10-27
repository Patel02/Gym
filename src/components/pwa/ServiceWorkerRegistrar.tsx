"use client";

// WPI PWA Service Worker Registrar — client-only bootstrap component
import { useEffect } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// ServiceWorkerRegistrar
// Client-only component that registers /sw.js and handles SW update lifecycle.
// Rendered once in RootLayout — zero UI, zero overhead.
// ─────────────────────────────────────────────────────────────────────────────

export default function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    // In development / localhost, unregister existing service worker so it never intercepts local dev requests
    if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
      navigator.serviceWorker.getRegistrations().then((regs) => {
        for (const reg of regs) {
          reg.unregister();
        }
      });
      if ("caches" in window) {
        caches.keys().then((keys) => {
          for (const key of keys) {
            caches.delete(key);
          }
        });
      }
      return;
    }

    const registerSW = async () => {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
          updateViaCache: "none", // Always check for SW updates
        });

        console.log("[PWA] Service Worker registered:", registration.scope);

        // Handle SW update available — new version waiting
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          if (!newWorker) return;

          newWorker.addEventListener("statechange", () => {
            if (
              newWorker.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              // New SW waiting — notify user (could show a "Refresh for update" toast)
              console.log("[PWA] New Service Worker version available.");
              // Auto-activate on next navigation (conservative approach)
              newWorker.postMessage({ type: "SKIP_WAITING" });
            }
          });
        });

        // Check for SW updates every 60 seconds (good for long referee sessions)
        const updateInterval = setInterval(() => {
          registration.update().catch(() => {});
        }, 60_000);

        return () => clearInterval(updateInterval);
      } catch (err) {
        console.warn("[PWA] Service Worker registration failed:", err);
      }
    };

    // Delay registration to not block initial page paint
    if (document.readyState === "complete") {
      registerSW();
    } else {
      window.addEventListener("load", registerSW, { once: true });
    }
  }, []);

  return null; // No UI rendered
}
