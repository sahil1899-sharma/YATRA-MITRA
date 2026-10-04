import { NavLink } from 'react-router-dom';
import type { TabItem } from './TabBar';

function desktopTabClass(active: boolean): string {
  return `flex min-h-[44px] items-center gap-2 rounded-full px-4 text-sm font-semibold transition ${
    active
      ? 'bg-saffron text-ink shadow-glow'
      : 'text-cream/60 hover:bg-white/10 hover:text-cream'
  }`;
}

// Desktop top navigation: the same tabs as the mobile bottom bar,
// rendered as pills in a sticky header.
export default function DesktopNav({ title, tabs }: { title: string; tabs: TabItem[] }) {
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-night/80 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-3">
        <p className="font-display text-[22px] font-bold text-cream">{title}</p>
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
