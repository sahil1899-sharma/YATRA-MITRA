import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'btn-shine bg-saffron text-ink shadow-glow hover:brightness-110',
  secondary: 'bg-maroon text-cream shadow-soft hover:brightness-125 border border-white/10',
  ghost: 'bg-transparent text-cream border border-white/20 hover:bg-white/10',
  danger: 'bg-alert text-white shadow-soft hover:brightness-110',
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
