import { Sparkles, ShieldCheck, RefreshCw } from "lucide-react";

export default function AdminLoading() {
  return (
    <div className="min-h-screen bg-gym-black px-6 pb-20 pt-32 sm:pt-36 lg:pt-40 text-white md:px-12 animate-in fade-in duration-200">
      <div className="mx-auto max-w-7xl">
        {/* Breadcrumb Skeleton */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-4 w-16 bg-white/10 rounded-md animate-pulse" />
            <div className="h-3 w-3 bg-white/5 rounded-full" />
            <div className="h-4 w-28 bg-white/10 rounded-md animate-pulse" />
            <div className="h-3 w-3 bg-white/5 rounded-full" />
            <div className="h-4 w-36 bg-gym-primary/20 rounded-md animate-pulse" />
          </div>
          <div className="h-6 w-28 bg-gym-primary/10 border border-gym-primary/20 rounded-full animate-pulse" />
        </div>

        {/* Top Header Skeleton */}
        <div className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6 border-b border-white/10 pb-8">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-gym-primary/30 bg-gym-primary/10 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-gym-primary">
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              <span>Loading Module...</span>
            </div>
            <div className="h-10 w-72 sm:w-96 bg-white/10 rounded-2xl animate-pulse" />
            <div className="h-4 w-full sm:w-80 bg-white/5 rounded-lg animate-pulse" />
          </div>

          <div className="flex items-center gap-3">
            <div className="h-10 w-36 bg-white/5 border border-white/10 rounded-full animate-pulse" />
            <div className="h-10 w-32 bg-white/5 border border-white/10 rounded-full animate-pulse" />
          </div>
        </div>

        {/* Top Metric Cards Skeleton */}
        <div className="mb-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#120402]/80 p-6 shadow-xl"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="h-10 w-10 rounded-xl bg-white/5 animate-pulse" />
                <div className="h-4 w-12 rounded-full bg-white/5 animate-pulse" />
              </div>
              <div className="h-8 w-24 bg-white/10 rounded-lg animate-pulse mb-2" />
              <div className="h-3 w-36 bg-white/5 rounded-md animate-pulse" />
              {/* Shimmer gradient overlay */}
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.03] to-transparent animate-[shimmer_2s_infinite]" />
            </div>
          ))}
        </div>

        {/* Module Section Skeleton */}
        <div className="mb-8">
          <div className="mb-6 flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-6 w-48 bg-white/10 rounded-lg animate-pulse" />
              <div className="h-3 w-64 bg-white/5 rounded-md animate-pulse" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-[#140402] to-[#0a0201] p-6 shadow-xl flex flex-col justify-between min-h-[220px]"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-12 w-12 rounded-2xl bg-white/5 animate-pulse" />
                    <div className="h-4 w-20 rounded-full bg-white/5 animate-pulse" />
                  </div>
                  <div className="h-6 w-44 bg-white/10 rounded-lg animate-pulse mb-3" />
                  <div className="space-y-1.5">
                    <div className="h-3 w-full bg-white/5 rounded animate-pulse" />
                    <div className="h-3 w-4/5 bg-white/5 rounded animate-pulse" />
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                  <div className="h-4 w-28 bg-gym-primary/20 rounded animate-pulse" />
                  <div className="h-3 w-16 bg-white/5 rounded animate-pulse" />
                </div>

                {/* Subtle Shimmer effect */}
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.02] to-transparent animate-[shimmer_1.8s_infinite]" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
