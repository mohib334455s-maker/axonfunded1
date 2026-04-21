import React from "react";

export function SkeletonBox({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
  return <div className={`shimmer rounded-xl bg-white/5 ${className}`} style={style} />;
}

export function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-white/5 bg-surface p-5 space-y-4">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <SkeletonBox className="h-3 w-24" />
          <SkeletonBox className="h-7 w-32" />
        </div>
        <SkeletonBox className="w-10 h-10 rounded-xl" />
      </div>
      <SkeletonBox className="h-2 w-full" />
      <SkeletonBox className="h-3 w-16" />
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-0">
      <div className="flex gap-4 px-4 py-3 border-b border-white/5">
        {[40, 100, 80, 80, 80].map((w, i) => (
          <SkeletonBox key={i} className={`h-3`} style={{ width: w }} />
        ))}
      </div>
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="flex gap-4 px-4 py-4 border-b border-white/3">
          {[40, 120, 80, 80, 80].map((w, j) => (
            <SkeletonBox key={j} className="h-4" style={{ width: w }} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function SkeletonChart() {
  return (
    <div className="w-full h-full flex items-end gap-1 p-4">
      {[...Array(15)].map((_, i) => {
        const h = 20 + Math.abs(Math.sin(i * 0.8) * 70);
        return (
          <div key={i} className="flex-1 shimmer rounded-t-sm bg-white/5" style={{ height: `${h}%` }} />
        );
      })}
    </div>
  );
}

export function SkeletonDashboard() {
  return (
    <div className="space-y-6 max-w-7xl animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <SkeletonBox className="h-7 w-56" />
          <SkeletonBox className="h-4 w-40" />
        </div>
        <SkeletonBox className="h-8 w-32 rounded-xl" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-2xl border border-white/5 bg-surface p-6" style={{ height: 320 }}>
          <SkeletonBox className="h-5 w-32 mb-4" />
          <SkeletonChart />
        </div>
        <div className="rounded-2xl border border-white/5 bg-surface p-6" style={{ height: 320 }}>
          <SkeletonBox className="h-5 w-24 mb-4" />
          <SkeletonChart />
        </div>
      </div>
    </div>
  );
}
