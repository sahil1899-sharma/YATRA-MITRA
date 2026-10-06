import { NavLink } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';

export interface TabItem {
  to?: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
  onClick?: () => void;
}

function tabClass(active: boolean): string {
  return `relative flex min-h-[62px] flex-col items-center justify-center gap-1 text-[11px] font-bold tracking-wide transition-colors duration-200 ${
    active ? 'text-saffron' : 'text-cream/45 hover:text-cream/80'
  }`;
}

export default function TabBar({ items }: { items: TabItem[] }) {
  return (
    <nav className="border-t border-white/10 bg-night-soft/95 backdrop-blur-md" aria-label="Primary">
      <div className="grid" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
        {items.map((item) => {
          const Icon = item.icon;
          return item.to ? (
            <NavLink key={item.label} to={item.to} end={item.end} className={({ isActive }) => tabClass(isActive)}>
              {({ isActive }) => (
                <>
                  <span
                    className={`flex h-8 w-16 items-center justify-center rounded-full transition-all duration-300 ${
                      isActive
                        ? 'bg-saffron/15 text-saffron shadow-[0_0_20px_rgba(232,137,12,0.35)]'
                        : 'text-current'
                    }`}
                  >
                    <Icon size={20} aria-hidden="true" />
                  </span>
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          ) : (
            <button key={item.label} type="button" onClick={item.onClick} className={tabClass(false)} aria-label={item.label}>
              <span className="flex h-8 w-16 items-center justify-center rounded-full">
                <Icon size={20} aria-hidden="true" />
              </span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
