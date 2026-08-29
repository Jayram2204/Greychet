import type { ReactNode } from "react";
import { Seal } from "./seal";

export type VerdictVariant = "clean" | "disputed" | "not-found";

/**
 * Shared verdict presentation for the three device states — reused verbatim
 * by the custom 404 page so "not registered" and "not found" read as one
 * consistent visual language rather than two different error styles.
 *
 * Renders as a dense ledger/scorecard row, not a soft consumer-app card:
 * zero border-radius (data/ledger element), hairline border, flat fill on
 * `ink-raised`. `not-found` is deliberately the quietest state — no box, no
 * icon emphasis, just a plain line — per the design system's "emptiness as
 * information" principle.
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
  if (variant === "not-found") {
    // Deliberately the quietest state — no seal renders at all, per Section
    // 2: "nothing to stamp." Just a plain line and one calm next step.
    return (
      <div className="flex items-start gap-3 py-2">
        <span className="mt-0.5 shrink-0 text-ash">
          <DashIcon />
        </span>
        <div>
          <p className="font-mono text-sm text-ash">{title}</p>
          {children && <div className="mt-1 text-sm text-ash">{children}</div>}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-none border border-line bg-ink-raised">
      <div className="flex items-center gap-4 border-b border-line-faint px-4 py-4">
        <Seal variant={variant} />
        <p className="font-mono text-sm font-medium tracking-wide text-bone uppercase">{title}</p>
      </div>
      {children && <div className="px-4 py-1 text-bone">{children}</div>}
    </div>
  );
}

/**
 * A single label/value line inside a VerdictCard's data area, formatted as an
 * aligned ledger row (label in tracked mono caps, value right-aligned) —
 * matches the design system's "scorecard" tabular format.
 */
export function VerdictRow({ label, value, emphasis }: { label: string; value: ReactNode; emphasis?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-line-faint py-2.5 transition-colors last:border-b-0 hover:border-b-seal-gold">
      <span className="shrink-0 font-mono text-xs tracking-wide text-ash uppercase">{label}</span>
      <span className={`text-right font-mono text-sm ${emphasis ? "text-seal-gold" : "text-bone"}`}>{value}</span>
    </div>
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
