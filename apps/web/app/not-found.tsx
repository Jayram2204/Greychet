import Link from "next/link";
import { VerdictCard } from "@/components/verdict-card";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-lg px-6 py-20">
      <h1 className="text-2xl font-semibold tracking-tight">Page not found</h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-ink-muted">
        This page isn&apos;t registered either.
      </p>

      <div className="mt-8">
        <VerdictCard variant="not-found" title="Not registered with Cachet" />
      </div>

      <Link href="/" className="mt-6 inline-block text-sm font-medium text-ink underline underline-offset-4">
        Back to device verification
      </Link>
    </main>
  );
}
