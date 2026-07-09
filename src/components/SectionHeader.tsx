type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: 'left' | 'center';
};

export default function SectionHeader({ eyebrow, title, description, align = 'left' }: SectionHeaderProps) {
  if (align === 'center') {
    return (
      <div className="mx-auto mb-10 max-w-2xl text-center">
        {eyebrow ? (
          <p className="flex items-center justify-center gap-3 text-xs font-bold uppercase tracking-[0.28em] text-roseGold">
            <span className="h-px w-8 bg-linear-to-r from-transparent to-roseGold" />
            {eyebrow}
            <span className="h-px w-8 bg-linear-to-l from-transparent to-roseGold" />
          </p>
        ) : null}
        <h2 className="mt-3 font-display text-3xl font-bold text-ink sm:text-4xl">{title}</h2>
        {description ? <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-ink/60">{description}</p> : null}
      </div>
    );
  }

  return (
    <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow ? <p className="eyebrow mb-2">{eyebrow}</p> : null}
        <h2 className="font-display text-3xl font-bold text-ink sm:text-4xl">{title}</h2>
      </div>
      {description ? <p className="max-w-xl text-sm leading-6 text-ink/60">{description}</p> : null}
    </div>
  );
}
