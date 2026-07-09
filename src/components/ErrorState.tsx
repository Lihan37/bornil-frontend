import { Gem } from 'lucide-react';

export default function ErrorState({ message = 'Something went wrong.' }: { message?: string }) {
  return (
    <div className="grid place-items-center rounded-[2rem] border border-roseGold/15 bg-white/80 px-6 py-14 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-full bg-blush text-roseGold">
        <Gem size={24} />
      </div>
      <p className="mt-4 font-display text-xl font-bold text-ink">Nothing to show here</p>
      <p className="mt-1 max-w-sm text-sm leading-6 text-ink/55">{message}</p>
    </div>
  );
}
