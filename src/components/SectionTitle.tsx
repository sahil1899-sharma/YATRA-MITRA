export default function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-4">
      <h2 className="font-display text-[22px] font-bold text-cream">{title}</h2>
      <div aria-hidden="true" className="mt-1.5 h-[3px] w-12 rounded-full bg-gradient-to-r from-saffron to-maroon/60 shadow-glow" />
      {subtitle ? <p className="mt-1.5 text-sm text-cream/60">{subtitle}</p> : null}
    </div>
  );
}
