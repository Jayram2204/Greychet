import Link from "next/link";
import { VerdictCard } from "@/components/verdict-card";
import { Nav } from "@/components/nav";

export default function NotFound() {
  return (
    <>
      <Nav />
      <main className="mx-auto max-w-lg px-6 py-20">
        <h1 className="font-display text-2xl text-bone italic">Page not found</h1>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-ash">This page isn&apos;t registered either.</p>

        <div className="mt-8">
          <VerdictCard variant="not-found" title="No record found for this page." />
        </div>

        <Link href="/" className="mt-6 inline-block text-sm font-medium text-bone underline underline-offset-4">
          Back to device verification
        </Link>
      </main>
    </>
  );
}
