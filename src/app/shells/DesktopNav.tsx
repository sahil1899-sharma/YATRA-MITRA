import { NavLink } from 'react-router-dom';
import type { TabItem } from './TabBar';

function desktopTabClass(active: boolean): string {
  return `flex min-h-[44px] items-center gap-2 rounded-full px-4 text-sm font-bold transition-all duration-200 ${
    active
      ? 'bg-gradient-to-b from-[#f2a63b] to-saffron text-ink shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_8px_20px_rgba(232,137,12,0.35)]'
      : 'text-cream/60 hover:bg-white/10 hover:text-cream'
  }`;
}

// Desktop top navigation: the same tabs as the mobile bottom bar,
// rendered as pills in a sticky header.
export default function DesktopNav({ title, tabs }: { title: string; tabs: TabItem[] }) {
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-night/80 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-3">
        <p className="font-display text-[24px] font-semibold tracking-tight text-cream">{title}</p>
        <nav className="flex items-center gap-1.5" aria-label="Primary">
          {tabs.map((item) => {
            const Icon = item.icon;
            const inner = (
              <>
                <Icon size={17} aria-hidden="true" />
                {item.label}
              </>
            );
            return item.to ? (
              <NavLink
                key={item.label}
                to={item.to}
                end={item.end}
                className={({ isActive }) => desktopTabClass(isActive)}
              >
                {inner}
              </NavLink>
            ) : (
              <button
                key={item.label}
                type="button"
                onClick={item.onClick}
                className={desktopTabClass(false)}
                aria-label={item.label}
              >
                {inner}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
