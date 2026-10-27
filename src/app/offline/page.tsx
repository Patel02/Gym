import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "WPI Platform — Offline",
  description: "You are currently offline. Referee decisions are queued and will sync automatically.",
};

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gym-black px-6 text-white">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-xl shadow-2xl">
        {/* Animated Signal Icon */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-gym-primary/30 bg-gym-primary/10">
          <svg
            className="h-10 w-10 text-gym-primary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.288 15.038a5.25 5.25 0 017.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 011.06 0z"
            />
          </svg>
        </div>

        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-gym-primary/30 bg-gym-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-gym-primary">
          <span className="h-2 w-2 animate-pulse rounded-full bg-gym-primary" />
          Offline Mode Active
        </div>

        <h1 className="mb-3 font-heading text-3xl font-bold text-white">
          No Network Connection
        </h1>

        <p className="mb-6 text-sm leading-relaxed text-gray-400">
          The WPI Referee Platform is running in <strong className="text-white">offline mode</strong>.
          Your referee decisions are being saved locally and will automatically sync to the server
          when your connection is restored.
        </p>

        {/* Feature highlights */}
        <div className="mb-6 space-y-3 text-left">
          {[
            { icon: "✅", label: "Referee decisions saved locally" },
            { icon: "🔄", label: "Auto-sync when back online" },
            { icon: "📊", label: "Cached scoreboards available" },
            { icon: "🔒", label: "Data encrypted in local storage" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/5 px-4 py-2.5">
              <span className="text-base">{item.icon}</span>
              <span className="text-sm font-medium text-gray-300">{item.label}</span>
            </div>
          ))}
        </div>

        <button
          onClick={() => window.location.reload()}
          className="w-full rounded-xl bg-gym-primary py-3 text-sm font-bold text-black transition-all hover:bg-gym-primary/90 active:scale-95"
        >
          Try Reconnecting
        </button>

        <p className="mt-4 text-xs text-gray-600">
          WPI Platform v1.0 · Offline-First PWA · Service Worker Active
        </p>
      </div>
    </div>
  );
}
