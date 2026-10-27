import React from 'react';

export default function Skeleton({ className = '', height = 'h-4', width = 'w-full' }) {
  return (
    <div
      className={`bg-slate-200/70 animate-pulse rounded-lg ${height} ${width} ${className}`}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
      <div className="h-40 bg-slate-200/70 animate-pulse rounded-xl" />
      <div className="flex gap-2">
        <Skeleton height="h-5" width="w-20" />
        <Skeleton height="h-5" width="w-24" />
      </div>
      <Skeleton height="h-5" width="w-3/4" />
      <Skeleton height="h-4" width="w-full" />
      <Skeleton height="h-4" width="w-2/3" />
      <div className="pt-3 border-t border-slate-100 flex justify-between">
        <Skeleton height="h-4" width="w-24" />
        <Skeleton height="h-8" width="w-16" />
      </div>
    </div>
  );
}
