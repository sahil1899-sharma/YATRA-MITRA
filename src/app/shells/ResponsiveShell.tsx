import type { ReactNode } from 'react';
import TabBar from './TabBar';
import type { TabItem } from './TabBar';
import DesktopNav from './DesktopNav';
import AppBackdrop from '../../components/AppBackdrop';

// One shell, two postures: a 430px phone frame with a bottom tab bar on
// mobile, and a full desktop layout with a sticky top nav on larger screens.
export default function ResponsiveShell({
  title,
  tabs,
  children,
  videoSrc,
  posterSrc,
}: {
  title: string;
  tabs: TabItem[];
  children: ReactNode;
  videoSrc?: string;
  posterSrc?: string;
}) {
  return (
    <>
      <div className="relative min-h-dvh bg-night/60 md:hidden">
        <AppBackdrop videoSrc={videoSrc} posterSrc={posterSrc} />
        <div className="bg-jaali-dark relative mx-auto flex min-h-dvh w-full max-w-[430px] flex-col">
          <header className="border-b border-white/10 bg-night-soft/85 px-4 py-3 backdrop-blur-md">
            <p className="font-display text-[19px] font-bold text-cream">{title}</p>
          </header>
          <div className="flex min-h-0 flex-1 flex-col">
            <main className="flex flex-1 flex-col">{children}</main>
          </div>
          <TabBar items={tabs} />
        </div>
      </div>

      <div className="bg-jaali-dark relative hidden min-h-dvh bg-night/60 md:block">
        <AppBackdrop videoSrc={videoSrc} posterSrc={posterSrc} />
        <DesktopNav title={title} tabs={tabs} />
        <div className="relative mx-auto w-full max-w-6xl px-6 py-8">{children}</div>
      </div>
    </>
  );
}
