import { Fragment } from 'react';

// Infinite kinetic strip. Items are duplicated so the -50% loop is seamless.
export default function Marquee({
  items,
  className = '',
  separator = '✦',
}: {
  items: string[];
  className?: string;
  separator?: string;
}) {
  const row = (key: string) => (
    <div key={key} className="flex shrink-0 items-center" aria-hidden={key === 'b'}>
      {items.map((t, i) => (
        <Fragment key={i}>
          <span className="whitespace-nowrap px-6">{t}</span>
          <span className="text-saffron" aria-hidden="true">
            {separator}
          </span>
        </Fragment>
      ))}
    </div>
  );

  return (
    <div className={`marquee ${className}`} role="presentation">
      <div className="marquee-track py-3 text-sm font-semibold uppercase tracking-[0.22em]">
        {row('a')}
        {row('b')}
      </div>
    </div>
  );
}
