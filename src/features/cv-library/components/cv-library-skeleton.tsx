"use client";

export function CVLibrarySkeleton() {
  return (
    <div className="grid h-full w-full gap-6 p-6 md:p-8 lg:grid-cols-[360px_1fr]">
      <div className="space-y-2 rounded-lg border border-white/[0.06] bg-white/[0.02] p-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="h-20 animate-pulse rounded-lg bg-white/[0.04]"
          />
        ))}
      </div>
      <div className="min-h-[520px] animate-pulse rounded-lg border border-white/[0.06] bg-white/[0.03]" />
    </div>
  );
}
