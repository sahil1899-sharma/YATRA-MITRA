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
  return `relative flex min-h-[60px] flex-col items-center justify-center gap-1 text-[11px] font-semibold transition ${
    active ? 'text-saffron' : 'text-cream/45 hover:text-cream/80'
  }`;
}

function ActiveBar() {
  return (
    <span
      aria-hidden="true"
      className="absolute inset-x-8 top-0 h-[3px] rounded-b-full bg-saffron"
    />
  );
}

export default function TabBar({ items }: { items: TabItem[] }) {
  return (
    <nav className="border-t border-white/10 bg-night-soft/95 backdrop-blur-md" aria-label="Primary">
      <div className="grid" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
        {items.map((item) => {
          const Icon = item.icon;
          const inner = (
            <>
              <Icon size={20} aria-hidden="true" />
              <span>{item.label}</span>
            </>
          );
          return item.to ? (
            <NavLink key={item.label} to={item.to} end={item.end} className={({ isActive }) => tabClass(isActive)}>
              {({ isActive }) => (
                <>
                  {isActive ? <ActiveBar /> : null}
                  {inner}
                </>
              )}
            </NavLink>
          ) : (
            <button key={item.label} type="button" onClick={item.onClick} className={tabClass(false)} aria-label={item.label}>
              {inner}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
