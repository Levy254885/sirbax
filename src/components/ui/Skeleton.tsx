export function FeedSkeleton() {
  return (
    <div className="space-y-3 px-3 py-2">
      {[1, 2, 3].map((i) => (
        <div key={i} className="animate-pulse rounded-2xl border border-slate-100 bg-white p-4">
          <div className="flex gap-3">
            <div className="h-10 w-10 rounded-full bg-slate-200" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-1/3 rounded bg-slate-200" />
              <div className="h-3 w-1/4 rounded bg-slate-100" />
            </div>
          </div>
          <div className="mt-3 space-y-2">
            <div className="h-3 w-full rounded bg-slate-100" />
            <div className="h-3 w-4/5 rounded bg-slate-100" />
          </div>
          <div className="mt-3 h-40 rounded-xl bg-slate-100" />
        </div>
      ))}
    </div>
  );
}
