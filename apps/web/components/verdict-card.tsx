import type { ReactNode } from "react";

export type VerdictVariant = "clean" | "disputed" | "not-found";

const VARIANT_CLASS: Record<VerdictVariant, string> = {
  clean: "border-status-clean bg-status-clean-bg text-status-clean",
  disputed: "border-status-disputed bg-status-disputed-bg text-status-disputed",
  "not-found": "border-status-neutral bg-status-neutral-bg text-status-neutral",
};

const VARIANT_ICON: Record<VerdictVariant, ReactNode> = {
  clean: <CheckIcon />,
  disputed: <AlertIcon />,
  "not-found": <DashIcon />,
};

/**
 * Shared verdict presentation for the three device states — reused verbatim
 * by the custom 404 page so "not registered" and "not found" read as one
 * consistent visual language rather than two different error styles.
 */
export function VerdictCard({
  variant,
  title,
  children,
}: {
  variant: VerdictVariant;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className={`flex gap-3 rounded-sharp border p-4 text-sm ${VARIANT_CLASS[variant]}`}>
      <span className="mt-0.5 shrink-0">{VARIANT_ICON[variant]}</span>
      <div>
        <p className="font-medium tracking-tight">{title}</p>
        {children && <div className="mt-1 text-ink-muted [&_*]:text-inherit">{children}</div>}
      </div>
    </div>
  );
}

export function VerdictSkeleton() {
  return (
    <div
      className="animate-pulse rounded-sharp border border-line bg-white p-4"
      aria-label="Loading verification result"
    >
      <div className="h-4 w-2/5 bg-line" />
      <div className="mt-3 h-3 w-3/5 bg-line" />
      <div className="mt-2 h-3 w-1/3 bg-line" />
    </div>
  );
}

function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="8.25" stroke="currentColor" strokeWidth="1.5" />
      <path d="M6.5 10.25L8.75 12.5L13.5 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M10 2.5L18 16.5H2L10 2.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M10 8V11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="10" cy="14" r="0.9" fill="currentColor" />
    </svg>
  );
}

function DashIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="8.25" stroke="currentColor" strokeWidth="1.5" />
      <path d="M6.75 10H13.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
