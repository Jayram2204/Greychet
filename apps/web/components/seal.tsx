"use client";

import { useEffect, useId, useState } from "react";

export type SealVariant = "clean" | "disputed";

const OUTER_RING =
  "M 60,8 L 78.75,14.73 L 97.48,22.52 L 106.19,40.87 L 114,60 L 105.27,78.75 L 96.77,96.77 L 79.13,106.19 L 60,113 L 41.25,105.27 L 23.23,96.77 L 13.81,79.13 L 6,60 L 14.73,41.25 L 22.52,22.52 L 40.87,13.81 Z";

const ENGRAVING_TICKS: Array<[number, number, number, number]> = [
  [60.0, 17.0, 60.0, 13.0],
  [68.39, 17.83, 69.17, 13.9],
  [76.46, 20.27, 77.99, 16.58],
  [83.89, 24.25, 86.11, 20.92],
  [90.41, 29.59, 93.23, 26.77],
  [95.75, 36.11, 99.08, 33.89],
  [99.73, 43.54, 103.42, 42.01],
  [102.17, 51.61, 106.1, 50.83],
  [103.0, 60.0, 107.0, 60.0],
  [102.17, 68.39, 106.1, 69.17],
  [99.73, 76.46, 103.42, 77.99],
  [95.75, 83.89, 99.08, 86.11],
  [90.41, 90.41, 93.23, 93.23],
  [83.89, 95.75, 86.11, 99.08],
  [76.46, 99.73, 77.99, 103.42],
  [68.39, 102.17, 69.17, 106.1],
  [60.0, 103.0, 60.0, 107.0],
  [51.61, 102.17, 50.83, 106.1],
  [43.54, 99.73, 42.01, 103.42],
  [36.11, 95.75, 33.89, 99.08],
  [29.59, 90.41, 26.77, 93.23],
  [24.25, 83.89, 20.92, 86.11],
  [20.27, 76.46, 16.58, 77.99],
  [17.83, 68.39, 13.9, 69.17],
  [17.0, 60.0, 13.0, 60.0],
  [17.83, 51.61, 13.9, 50.83],
  [20.27, 43.54, 16.58, 42.01],
  [24.25, 36.11, 20.92, 33.89],
  [29.59, 29.59, 26.77, 26.77],
  [36.11, 24.25, 33.89, 20.92],
  [43.54, 20.27, 42.01, 16.58],
  [51.61, 17.83, 50.83, 13.9],
];

// One deliberate crack from upper-left edge through center to lower-right edge.
const FRACTURE = "M 24,20 L 50,46 L 43,61 L 68,73 L 58,92 L 96,104";

/**
 * The Seal — Cachet's one signature ceremonial element (Design System Spec,
 * Section 3). Two states only: an unbroken pressed mark for a clean
 * verification, or the same seal with a fracture through it for a disputed
 * one. Deliberately not a generic checkmark/warning icon — a custom-drawn
 * press mark, because the product's whole claim is that this mark carries
 * real financial weight.
 */
export function Seal({ variant, className = "" }: { variant: SealVariant; className?: string }) {
  const textPathId = useId();
  const label = variant === "clean" ? "CACHET · VERIFIED" : "CACHET · DISPUTED";
  const colorClass = variant === "clean" ? "text-verified" : "text-disputed";

  return (
    <svg
      viewBox="0 0 120 120"
      // Never smaller than 48px on any breakpoint (Section 6); larger at
      // sm+ where there's room for the full "signature element" presence.
      // Mounts fresh only at the moment a verify/dispute result actually
      // resolves (see call sites), so this animation never replays on
      // scroll or re-render of already-shown data.
      className={`h-12 w-12 shrink-0 animate-stamp motion-reduce:animate-none sm:h-14 sm:w-14 ${colorClass} ${className}`}
      style={{ opacity: 0.85 }}
      role="img"
      aria-label={label}
    >
      <defs>
        <path id={textPathId} d="M 22,60 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0" />
      </defs>

      <path d={OUTER_RING} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />

      {ENGRAVING_TICKS.map(([x1, y1, x2, y2], i) => (
        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="currentColor" strokeWidth="1" />
      ))}

      <text className="font-display" fontSize="9.5" fontStyle="italic" letterSpacing="1" fill="currentColor">
        <textPath href={`#${textPathId}`} startOffset="50%" textAnchor="middle">
          {label}
        </textPath>
      </text>

      {variant === "clean" ? (
        <g stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none">
          <path d="M60,48 L68,60 L60,72 L52,60 Z" />
          <line x1="46" y1="60" x2="74" y2="60" />
          <line x1="52" y1="46" x2="58" y2="52" />
          <line x1="68" y1="46" x2="62" y2="52" />
        </g>
      ) : (
        <path d={FRACTURE} fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinejoin="round" strokeLinecap="round" />
      )}
    </svg>
  );
}

/**
 * The seal's in-flight placeholder (Section 4): while an existing chain
 * read/write is pending, render a faint dashed outline in the seal's exact
 * position (reserving layout space) plus a slow mono-spaced counter — never
 * a spinner, keeping the ledger/terminal voice even while waiting. Purely
 * presentational: it renders for as long as the caller keeps it mounted and
 * has no opinion on what "pending" means — the caller's existing loading/tx
 * status decides that, unchanged.
 */
export function SealPending({ label = "awaiting confirmation" }: { label?: string }) {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex items-center gap-4">
      <svg viewBox="0 0 120 120" className="h-12 w-12 shrink-0 text-line sm:h-14 sm:w-14" aria-hidden="true">
        <circle cx="60" cy="60" r="52" fill="none" stroke="currentColor" strokeWidth="1.75" strokeDasharray="5 6" />
      </svg>
      <span className="font-mono text-sm text-pending">
        {label}… {String(seconds).padStart(2, "0")}s
      </span>
    </div>
  );
}
