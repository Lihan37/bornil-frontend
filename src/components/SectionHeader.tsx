type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
};

export default function SectionHeader({ eyebrow, title, description }: SectionHeaderProps) {
  return (
    <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow ? <p className="mb-2 text-xs font-bold uppercase tracking-[0.24em] text-roseGold">{eyebrow}</p> : null}
        <h2 className="font-display text-3xl font-bold text-ink sm:text-4xl">{title}</h2>
      </div>
      {description ? <p className="max-w-2xl text-sm leading-6 text-ink/65">{description}</p> : null}
    </div>
  );
}
