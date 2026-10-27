// ─────────────────────────────────────────────────────────────────────────────
// WPI FEDERATION PLATFORM — Service Worker v1.0.0
// Offline-first strategy for referee platform with background sync queue
// ─────────────────────────────────────────────────────────────────────────────

const SW_VERSION = "wpi-sw-v1.0.3";
const STATIC_CACHE = `${SW_VERSION}-static`;
const DYNAMIC_CACHE = `${SW_VERSION}-dynamic`;
const OFFLINE_SYNC_QUEUE = "wpi-offline-queue";

// ── Static assets to precache (App Shell) ───────────────────────────────────
const PRECACHE_URLS = [
  "/",
  "/referee/dashboard",
  "/live",
  "/leaderboard",
  "/championships",
  "/offline",
  "/manifest.json",
  "/wpi-logo.png",
];

// ── Routes that should NEVER be cached (always network) ─────────────────────
const NETWORK_ONLY_PATTERNS = [
  /\/api\/auth\//,
  /\/api\/webhooks\//,
  /\/_next\/webpack-hmr/,
];

// ── Routes cached with "Network first, fallback to cache" ───────────────────
const NETWORK_FIRST_PATTERNS = [
  /\/api\/live\//,
  /\/api\/scores\//,
  /\/api\/events\//,
];

// ─────────────────────────────────────────────────────────────────────────────
// INSTALL — Precache static app shell
// ─────────────────────────────────────────────────────────────────────────────
self.addEventListener("install", (event) => {
  console.log(`[SW] Installing ${SW_VERSION}`);
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
      .catch((err) => console.warn("[SW] Precache partial failure:", err))
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// ACTIVATE — Clean old caches
// ─────────────────────────────────────────────────────────────────────────────
self.addEventListener("activate", (event) => {
  console.log(`[SW] Activating ${SW_VERSION}`);
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k !== STATIC_CACHE && k !== DYNAMIC_CACHE)
            .map((k) => {
              console.log("[SW] Deleting old cache:", k);
              return caches.delete(k);
            })
        )
      )
      .then(() => self.clients.claim())
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// FETCH — Routing strategy
// ─────────────────────────────────────────────────────────────────────────────
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests and cross-origin
  if (request.method !== "GET" || url.origin !== self.location.origin) return;

  // In development / localhost, bypass service worker completely so HMR, Turbopack, and RSC prefetching work cleanly
  if (url.hostname === "localhost" || url.hostname === "127.0.0.1") {
    return;
  }

  // Next.js RSC (React Server Component) payloads & prefetch requests — always bypass SW to server
  if (
    url.searchParams.has("_rsc") ||
    request.headers.get("RSC") === "1" ||
    request.headers.get("Next-Router-Prefetch") === "1" ||
    request.headers.get("accept")?.includes("text/x-component")
  ) {
    return;
  }

  // Network-only routes (auth, webhooks, HMR)
  if (NETWORK_ONLY_PATTERNS.some((p) => p.test(url.pathname))) return;

  // Network-first (live scoring APIs)
  if (NETWORK_FIRST_PATTERNS.some((p) => p.test(url.pathname))) {
    event.respondWith(networkFirstStrategy(request));
    return;
  }

  // Next.js static assets (_next/static) — Cache first
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(cacheFirstStrategy(request, STATIC_CACHE));
    return;
  }

  // HTML Pages — ALWAYS Network-first with offline fallback (never stale-while-revalidate for SSR HTML)
  if (request.mode === "navigate" || request.headers.get("accept")?.includes("text/html")) {
    event.respondWith(networkFirstStrategy(request));
    return;
  }

  // Other assets — Stale-while-revalidate
  event.respondWith(staleWhileRevalidate(request));
});

// ─────────────────────────────────────────────────────────────────────────────
// CACHE STRATEGIES
// ─────────────────────────────────────────────────────────────────────────────

async function networkFirstStrategy(request) {
  try {
    const response = await fetch(request.clone());
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    return cached || offlineFallback(request);
  }
}

async function cacheFirstStrategy(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request.clone());
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return offlineFallback(request);
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request.clone())
    .then((response) => {
      if (response && response.ok) {
        cache.put(request, response.clone()).catch(() => {});
      }
      return response;
    })
    .catch(() => null);

  if (cached) return cached;
  const netResponse = await fetchPromise;
  if (netResponse) return netResponse;
  return offlineFallback(request);
}

function offlineFallback(request) {
  const url = new URL(request.url);
  if (request.headers.get("accept")?.includes("text/html")) {
    return caches.match("/offline") || new Response(offlineHTML(), {
      headers: { "Content-Type": "text/html" },
    });
  }
  return new Response(JSON.stringify({ offline: true, error: "No network connection" }), {
    status: 503,
    headers: { "Content-Type": "application/json" },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// BACKGROUND SYNC — Offline referee decision queue
// ─────────────────────────────────────────────────────────────────────────────

self.addEventListener("sync", (event) => {
  if (event.tag === OFFLINE_SYNC_QUEUE) {
    console.log("[SW] Background sync triggered: flushing offline referee queue");
    event.waitUntil(flushOfflineQueue());
  }
});

async function flushOfflineQueue() {
  let db;
  try {
    db = await openSyncDB();
    const tx = db.transaction("decisions", "readwrite");
    const store = tx.objectStore("decisions");
    const allDecisions = await getAllFromStore(store);

    if (allDecisions.length === 0) {
      console.log("[SW] No queued decisions to sync.");
      return;
    }

    console.log(`[SW] Flushing ${allDecisions.length} queued decisions...`);

    const results = await Promise.allSettled(
      allDecisions.map(async (decision) => {
        const response = await fetch("/api/referee/decision", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(decision.payload),
        });
        if (response.ok) {
          const deleteTx = db.transaction("decisions", "readwrite");
          deleteTx.objectStore("decisions").delete(decision.id);
          console.log(`[SW] ✅ Synced decision ${decision.id}`);
        } else {
          throw new Error(`HTTP ${response.status}`);
        }
      })
    );

    const synced = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;
    console.log(`[SW] Sync complete: ${synced} succeeded, ${failed} failed`);

    // Notify all open clients
    const clients = await self.clients.matchAll({ type: "window" });
    clients.forEach((client) =>
      client.postMessage({
        type: "SYNC_COMPLETE",
        synced,
        failed,
        timestamp: Date.now(),
      })
    );
  } catch (err) {
    console.error("[SW] Background sync failed:", err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// MESSAGE HANDLER — Commands from main thread
// ─────────────────────────────────────────────────────────────────────────────

self.addEventListener("message", async (event) => {
  const { type, payload } = event.data || {};

  if (type === "QUEUE_DECISION") {
    // Store decision in IndexedDB for background sync
    try {
      const db = await openSyncDB();
      const tx = db.transaction("decisions", "readwrite");
      const store = tx.objectStore("decisions");
      const id = `decision-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      await putToStore(store, { id, payload, queuedAt: Date.now() });
      console.log(`[SW] Queued offline decision: ${id}`);
      event.source?.postMessage({ type: "QUEUED", id });
    } catch (err) {
      console.error("[SW] Failed to queue decision:", err);
      event.source?.postMessage({ type: "QUEUE_ERROR", error: err.message });
    }
  }

  if (type === "FORCE_SYNC") {
    console.log("[SW] Force sync requested by client");
    await flushOfflineQueue();
  }

  if (type === "GET_QUEUE_COUNT") {
    try {
      const db = await openSyncDB();
      const tx = db.transaction("decisions", "readonly");
      const store = tx.objectStore("decisions");
      const count = await countFromStore(store);
      event.source?.postMessage({ type: "QUEUE_COUNT", count });
    } catch {
      event.source?.postMessage({ type: "QUEUE_COUNT", count: 0 });
    }
  }

  if (type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// INDEXEDDB HELPERS (no external deps)
// ─────────────────────────────────────────────────────────────────────────────

function openSyncDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open("wpi-offline-sync", 1);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains("decisions")) {
        const store = db.createObjectStore("decisions", { keyPath: "id" });
        store.createIndex("queuedAt", "queuedAt");
      }
    };
    req.onsuccess = (e) => resolve(e.target.result);
    req.onerror = (e) => reject(e.target.error);
  });
}

function getAllFromStore(store) {
  return new Promise((resolve, reject) => {
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

function putToStore(store, value) {
  return new Promise((resolve, reject) => {
    const req = store.put(value);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function countFromStore(store) {
  return new Promise((resolve, reject) => {
    const req = store.count();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(0);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// OFFLINE FALLBACK HTML (shown when page not cached and network unavailable)
// ─────────────────────────────────────────────────────────────────────────────

function offlineHTML() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>WPI Platform — Offline</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{background:#0a0a0a;color:#fff;font-family:'Outfit',sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;padding:2rem}
    .card{background:#1a1a1a;border:1px solid #333;border-radius:24px;padding:3rem;text-align:center;max-width:480px;width:100%}
    .icon{font-size:4rem;margin-bottom:1rem}
    h1{font-size:1.75rem;font-weight:700;color:#FF5500;margin-bottom:.5rem}
    p{color:#aaa;font-size:.95rem;line-height:1.6;margin-bottom:1.5rem}
    .badge{display:inline-flex;align-items:center;gap:.5rem;background:#FF5500/10;border:1px solid #FF5500/40;color:#FF5500;border-radius:999px;padding:.35rem 1rem;font-size:.8rem;font-weight:600;margin-bottom:2rem}
    button{background:#FF5500;color:#000;border:none;border-radius:12px;padding:.75rem 2rem;font-size:.9rem;font-weight:700;cursor:pointer;width:100%}
    button:hover{background:#ff6622}
    .note{margin-top:1.5rem;font-size:.8rem;color:#555;border-top:1px solid #333;padding-top:1.5rem}
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">📡</div>
    <div class="badge">⚡ Offline Mode Active</div>
    <h1>No Network Connection</h1>
    <p>The WPI Referee Platform is running in offline mode. Your referee decisions are being saved locally and will automatically sync when connection is restored.</p>
    <button onclick="window.location.reload()">Try Reconnecting</button>
    <p class="note">Offline decisions are stored securely in your device and will be uploaded automatically when you're back online.</p>
  </div>
</body>
</html>`;
}
