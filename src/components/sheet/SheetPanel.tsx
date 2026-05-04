import type { ReactNode } from 'react';

/** A bordered "tab" panel approximating the rounded boxes on the official sheet. */
export function SheetPanel({
  title,
  badge,
  children,
  className = '',
}: {
  title?: string;
  /** Side-stripe label, like "AUGMENTS" or "SKILLS" on the PDF. */
  badge?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`relative border border-gray-300 rounded-md bg-white ${className}`}
    >
      {badge ? (
        <div className="absolute -left-px top-2 bottom-2 w-6 bg-gray-700 text-white text-[10px] font-semibold uppercase tracking-wider rounded-l flex items-center justify-center">
          <span className="-rotate-90 whitespace-nowrap">{badge}</span>
        </div>
      ) : null}
      {title ? (
        <header className="px-3 py-1.5 bg-gray-100 border-b border-gray-300 rounded-t-md text-xs font-semibold uppercase tracking-wide text-gray-700">
          {title}
        </header>
      ) : null}
      <div className={`p-3 ${badge ? 'pl-9' : ''}`}>{children}</div>
    </section>
  );
}
