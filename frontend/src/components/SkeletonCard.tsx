export function SkeletonCard() {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-navy-700 bg-navy-800">
      <div className="h-1 w-full skeleton-shimmer" />
      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="flex justify-between items-start gap-2">
          <div className="min-w-0 flex-1">
            <div className="h-5 w-20 rounded-md skeleton-shimmer" />
            <div className="mt-3 h-6 w-3/4 rounded skeleton-shimmer" />
            <div className="mt-2 h-4 w-1/3 rounded skeleton-shimmer" />
          </div>
          <div className="h-6 w-16 shrink-0 rounded-md skeleton-shimmer" />
        </div>
        <div className="space-y-2">
          <div className="h-4 w-full rounded skeleton-shimmer" />
          <div className="h-4 w-5/6 rounded skeleton-shimmer" />
          <div className="h-4 w-2/3 rounded skeleton-shimmer" />
        </div>
        <div className="flex flex-wrap gap-1">
          <div className="h-6 w-14 rounded-md skeleton-shimmer" />
          <div className="h-6 w-16 rounded-md skeleton-shimmer" />
          <div className="h-6 w-12 rounded-md skeleton-shimmer" />
        </div>
        <div className="mt-auto border-t border-navy-700/70 pt-3">
          <div className="h-4 w-1/2 rounded skeleton-shimmer" />
        </div>
        <div className="grid grid-cols-2 gap-2 pt-1">
          <div className="h-10 rounded-lg skeleton-shimmer" />
          <div className="h-10 rounded-lg skeleton-shimmer" />
        </div>
      </div>
    </article>
  );
}

export function SkeletonRecommendationCard() {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-navy-700 bg-navy-800">
      <div className="h-1 w-full skeleton-shimmer" />
      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="flex justify-between items-start gap-2">
          <div className="min-w-0 flex-1">
            <div className="h-5 w-20 rounded-md skeleton-shimmer" />
            <div className="mt-3 h-6 w-3/4 rounded skeleton-shimmer" />
            <div className="mt-2 h-4 w-1/3 rounded skeleton-shimmer" />
          </div>
          <div className="flex shrink-0 flex-col items-center gap-1">
            <div className="h-[52px] w-[52px] rounded-full skeleton-shimmer" />
            <div className="h-3 w-8 rounded skeleton-shimmer" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex gap-2"><div className="h-4 w-4 shrink-0 rounded skeleton-shimmer" /><div className="h-4 w-3/4 rounded skeleton-shimmer" /></div>
          <div className="flex gap-2"><div className="h-4 w-4 shrink-0 rounded skeleton-shimmer" /><div className="h-4 w-2/3 rounded skeleton-shimmer" /></div>
        </div>
        <div className="mt-auto border-t border-navy-700/70 pt-3">
          <div className="h-4 w-1/3 rounded skeleton-shimmer" />
        </div>
        <div className="grid grid-cols-2 gap-2 pt-1">
          <div className="h-10 rounded-lg skeleton-shimmer" />
          <div className="h-10 rounded-lg skeleton-shimmer" />
        </div>
      </div>
    </article>
  );
}
