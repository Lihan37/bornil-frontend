export default function LoadingState({ label = 'Loading collection...' }: { label?: string }) {
  return (
    <div className="grid min-h-64 place-items-center rounded-[2rem] border border-roseGold/10 bg-white">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-champagne border-t-roseGold" aria-label={label} />
    </div>
  );
}
