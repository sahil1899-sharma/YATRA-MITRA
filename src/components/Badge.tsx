import type { ReactNode } from 'react';

type BadgeVariant = 'verified' | 'sakhi' | 'simulated' | 'alert';

const styles: Record<BadgeVariant, string> = {
  verified: 'border-verified/40 bg-verified/15 text-emerald-300',
  sakhi: 'border-saffron/40 bg-saffron/15 text-saffron',
  simulated: 'border-amber/50 bg-amber/15 text-amber',
  alert: 'border-alert/40 bg-alert/15 text-red-300',
};

export default function Badge({ variant, children }: { variant: BadgeVariant; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${styles[variant]}`}
    >
      {children}
    </span>
  );
}
