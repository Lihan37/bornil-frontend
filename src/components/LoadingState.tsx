export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-roseGold/10 bg-white/70">
      <div className="skeleton aspect-[4/5] w-full" />
      <div className="space-y-3 p-4">
        <div className="skeleton h-3 w-16 rounded-full" />
        <div className="skeleton h-4 w-3/4 rounded-full" />
        <div className="flex items-center justify-between pt-2">
          <div className="skeleton h-5 w-20 rounded-full" />
          <div className="skeleton h-11 w-11 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
}

export default function LoadingState({ label = 'Loading collection…' }: { label?: string }) {
  return (
    <div className="grid min-h-64 place-items-center rounded-[2rem] border border-roseGold/10 bg-white/70">
      <div className="flex flex-col items-center gap-4">
        <div className="relative h-12 w-12">
          <div className="absolute inset-0 animate-spin rounded-full border-[3px] border-champagne border-t-roseGold" />
          <div className="absolute inset-2 rounded-full bg-linear-to-br from-champagne to-goldLight opacity-40" />
        </div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-ink/45">{label}</p>
      </div>
    </div>
  );
}
