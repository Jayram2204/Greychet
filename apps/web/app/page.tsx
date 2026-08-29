"use client";

import { useState, type FormEvent } from "react";
import { formatEther } from "viem";
import { CachetRegistryAbi, CACHET_REGISTRY_ADDRESS, hashSerial } from "@cachet/shared";
import { publicClient } from "@/lib/viem-client";
import { VerdictCard, VerdictSkeleton, type VerdictVariant } from "@/components/verdict-card";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

type VerifyResult = {
  registrar: `0x${string}`;
  stakeAmount: bigint;
  registeredAt: bigint;
  disputed: boolean;
};

type VerifyState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "result"; result: VerifyResult };

export default function VerifyPage() {
  const [serial, setSerial] = useState("");
  const [state, setState] = useState<VerifyState>({ status: "idle" });

  async function handleVerify(e: FormEvent) {
    e.preventDefault();
    const trimmed = serial.trim();
    if (!trimmed) return;

    setState({ status: "loading" });
    try {
      const serialHash = hashSerial(trimmed);
      const [registrar, stakeAmount, registeredAt, disputed] = await publicClient.readContract({
        address: CACHET_REGISTRY_ADDRESS[10143],
        abi: CachetRegistryAbi,
        functionName: "verifyDevice",
        args: [serialHash],
      });
      setState({ status: "result", result: { registrar, stakeAmount, registeredAt, disputed } });
    } catch (err) {
      setState({ status: "error", message: err instanceof Error ? err.message : String(err) });
    }
  }

  return (
    <main className="mx-auto max-w-lg px-6 py-20">
      <h1 className="text-2xl font-semibold tracking-tight">Verify a device</h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-ink-muted">
        Free for anyone to check — no wallet needed. Cachet does not physically inspect devices; a
        business locks a MON stake as a bond on its authenticity claim, and a buyer dispute slashes
        that stake if the claim turns out false.
      </p>

      <form onSubmit={handleVerify} className="mt-8 flex gap-2">
        <input
          value={serial}
          onChange={(e) => setSerial(e.target.value)}
          placeholder="Device serial number"
          aria-label="Device serial number"
          className="flex-1 rounded-sharp border border-line bg-white px-3 py-2 font-mono text-sm text-ink placeholder:font-sans placeholder:text-ink-muted focus:border-ink focus:outline-none"
        />
        <button
          type="submit"
          disabled={state.status === "loading" || !serial.trim()}
          // A wallet/autofill browser extension can patch this attribute before
          // React hydrates, causing a harmless server/client mismatch warning
          // that isn't caused by our own state logic. See Stage 7 notes.
          suppressHydrationWarning
          className="rounded-sharp bg-ink px-5 py-2 text-sm font-medium text-paper transition-opacity hover:opacity-90 disabled:bg-line disabled:text-ink-muted"
        >
          {state.status === "loading" ? "Verifying…" : "Verify"}
        </button>
      </form>

      {/* Fixed min-height reserved from first paint so the result appearing
          doesn't shift the layout (skeleton and result share this box). */}
      <div className="mt-6 min-h-[140px]">
        {state.status === "loading" && <VerdictSkeleton />}
        {state.status === "error" && (
          <VerdictCard variant="not-found" title="Couldn't check this device">
            {state.message}
          </VerdictCard>
        )}
        {state.status === "result" && <ResultCard result={state.result} />}
      </div>
    </main>
  );
}

function ResultCard({ result }: { result: VerifyResult }) {
  const { registrar, stakeAmount, registeredAt, disputed } = result;
  const notFound = registrar === ZERO_ADDRESS;
  const variant: VerdictVariant = notFound ? "not-found" : disputed ? "disputed" : "clean";

  if (variant === "clean") {
    return (
      <VerdictCard variant="clean" title="Registered — no disputes">
        <p>Staked bond: {formatEther(stakeAmount)} MON</p>
        <p>Registered: {new Date(Number(registeredAt) * 1000).toLocaleString()}</p>
        <p className="mt-1 break-all font-mono text-xs">Registrar: {registrar}</p>
      </VerdictCard>
    );
  }

  if (variant === "disputed") {
    return (
      <VerdictCard variant="disputed" title="Disputed — bond already slashed">
        <p>
          A buyer disputed this device&apos;s authenticity claim, and the registrar&apos;s staked
          bond has been paid out as compensation. Treat this listing with caution.
        </p>
        <p className="mt-1 break-all font-mono text-xs">Original registrar: {registrar}</p>
      </VerdictCard>
    );
  }

  return <VerdictCard variant="not-found" title="Not registered with Cachet" />;
}
