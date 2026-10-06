import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'btn-shine bg-gradient-to-b from-[#f2a63b] to-saffron text-ink shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_10px_26px_rgba(232,137,12,0.38)] hover:brightness-110 active:scale-[0.98]',
  secondary:
    'bg-gradient-to-b from-maroon to-[#5c1620] text-cream shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_8px_20px_rgba(0,0,0,0.4)] hover:brightness-125 active:scale-[0.98] border border-white/10',
  ghost:
    'bg-transparent text-cream border border-white/20 hover:bg-white/10 hover:border-white/30 active:scale-[0.98]',
  danger:
    'bg-gradient-to-b from-[#d04434] to-alert text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_8px_20px_rgba(0,0,0,0.4)] hover:brightness-110 active:scale-[0.98]',
};

export default function Button({
  variant = 'primary',
  children,
  className = '',
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex min-h-[44px] items-center justify-center gap-2 rounded-card px-5 text-[15px] font-semibold transition ${variantClasses[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
