"use client";

import { useState, type FormEvent } from "react";
import { formatEther } from "viem";
import { CachetRegistryAbi, CACHET_REGISTRY_ADDRESS, hashSerial } from "@cachet/shared";
import { publicClient } from "@/lib/viem-client";
import { VerdictCard, VerdictRow, type VerdictVariant } from "@/components/verdict-card";
import { SealPending } from "@/components/seal";
import { Nav } from "@/components/nav";

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
    <>
      <Nav />
      <main className="mx-auto max-w-lg px-6 py-20">
        <h1 className="font-display text-2xl text-bone italic">Check a device before you pay for it.</h1>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-ash">
          Free for anyone to check — no wallet needed. Cachet does not physically inspect devices; a
          business locks a MON stake as a bond on its authenticity claim, and a buyer dispute slashes
          that stake if the claim turns out false.
        </p>

        <form onSubmit={handleVerify} className="mt-8 flex flex-col gap-2 sm:flex-row">
          <input
            value={serial}
            onChange={(e) => setSerial(e.target.value)}
            placeholder="Enter serial / IMEI"
            aria-label="Device serial number"
            className="flex-1 rounded-control border border-line bg-ink-raised px-3 py-2 font-mono text-sm text-bone placeholder:font-sans placeholder:text-ash focus:border-seal-gold"
          />
          <button
            type="submit"
            disabled={state.status === "loading" || !serial.trim()}
            // A wallet/autofill browser extension can patch this attribute before
            // React hydrates, causing a harmless server/client mismatch warning
            // that isn't caused by our own state logic. See Stage 7 notes.
            suppressHydrationWarning
            className="w-full shrink-0 rounded-control bg-bone px-5 py-2 text-sm font-medium text-ink transition-opacity hover:opacity-90 disabled:bg-line-faint disabled:text-ash sm:w-auto"
          >
            {state.status === "loading" ? "Verifying…" : "Verify"}
          </button>
        </form>

        {/* Fixed min-height reserved from first paint so the result appearing
            doesn't shift the layout (skeleton and result share this box). */}
        <div className="mt-6 min-h-[140px]">
          {state.status === "idle" && <p className="font-mono text-sm text-ash">Nothing checked yet — results appear here.</p>}
          {state.status === "loading" && <SealPending label="checking chain" />}
          {state.status === "error" && (
            <VerdictCard variant="not-found" title="Couldn't check this device">
              {state.message}
            </VerdictCard>
          )}
          {state.status === "result" && <ResultCard result={state.result} />}
        </div>
      </main>
    </>
  );
}

function ResultCard({ result }: { result: VerifyResult }) {
  const { registrar, stakeAmount, registeredAt, disputed } = result;
  const notFound = registrar === ZERO_ADDRESS;
  const variant: VerdictVariant = notFound ? "not-found" : disputed ? "disputed" : "clean";

  if (variant === "clean") {
    return (
      <VerdictCard variant="clean" title="Verified">
        <VerdictRow label="Registered by" value={<span className="break-all">{registrar}</span>} />
        <VerdictRow label="Registered at" value={new Date(Number(registeredAt) * 1000).toLocaleString()} />
        <VerdictRow label="Stake locked" value={`${formatEther(stakeAmount)} MON`} emphasis />
      </VerdictCard>
    );
  }

  if (variant === "disputed") {
    return (
      <VerdictCard variant="disputed" title="Disputed">
        <p className="py-2 text-sm text-ash">
          A buyer disputed this device&apos;s authenticity claim, and the registrar&apos;s staked
          bond has been paid out as compensation. Treat this listing with caution.
        </p>
        <VerdictRow label="Original registrar" value={<span className="break-all">{registrar}</span>} />
      </VerdictCard>
    );
  }

  return (
    <VerdictCard variant="not-found" title="No record found for this serial.">
      This device may be unregistered — that alone is worth asking about.
    </VerdictCard>
  );
}
