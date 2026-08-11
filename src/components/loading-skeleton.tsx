"use client";

export function LoadingSkeleton() {
  return (
    <div className="space-y-3 sm:space-y-4 animate-in fade-in duration-300">
      {/* Stat cards row */}
      <section className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-xl border border-border bg-card p-4 space-y-2.5"
          >
            <div className="skeleton-shimmer h-3 w-20 rounded" />
            <div className="skeleton-shimmer h-7 w-28 rounded-lg" />
            <div className="skeleton-shimmer h-2.5 w-32 rounded" />
          </div>
        ))}
      </section>

      {/* Two-column content */}
      <div className="grid gap-3 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Transactions list */}
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="skeleton-shimmer h-4 w-40 rounded mb-4" />
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-lg border border-border p-3"
              >
                <div className="skeleton-shimmer size-9 rounded-lg shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="skeleton-shimmer h-3.5 w-3/4 rounded" />
                  <div className="skeleton-shimmer h-2.5 w-1/2 rounded" />
                </div>
                <div className="skeleton-shimmer h-4 w-16 rounded" />
              </div>
            ))}
          </div>
        </div>

        {/* Debts panel */}
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="skeleton-shimmer h-4 w-36 rounded mb-4" />
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-lg border border-border p-3"
              >
                <div className="space-y-1.5">
                  <div className="skeleton-shimmer h-3.5 w-24 rounded" />
                  <div className="skeleton-shimmer h-2.5 w-32 rounded" />
                </div>
                <div className="skeleton-shimmer h-6 w-14 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
