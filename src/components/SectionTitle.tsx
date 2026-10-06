export default function SectionTitle({
  title,
  subtitle,
  eyebrow,
}: {
  title: string;
  subtitle?: string;
  eyebrow?: string;
}) {
  return (
    <div className="mb-5">
      {eyebrow ? <p className="eyebrow mb-2">{eyebrow}</p> : null}
      <h2 className="font-display text-[26px] font-semibold tracking-tight text-cream">
        {title}
      </h2>
      <div
        aria-hidden="true"
        className="mt-2.5 h-[3px] w-14 rounded-full bg-gradient-to-r from-saffron via-saffron/70 to-maroon/40 shadow-glow"
      />
      {subtitle ? <p className="mt-2 max-w-prose text-sm leading-relaxed text-cream/60">{subtitle}</p> : null}
    </div>
  );
}
