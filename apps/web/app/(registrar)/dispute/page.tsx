"use client";

import { useState, type FormEvent } from "react";
import { encodeFunctionData, formatEther } from "viem";
import { useLogin, useLogout, usePrivy, useSendTransaction, type WalletWithMetadata } from "@privy-io/react-auth";
import { CachetRegistryAbi, CACHET_REGISTRY_ADDRESS, hashSerial, monadChains } from "@cachet/shared";
import { publicClient } from "@/lib/viem-client";
import { VerdictCard, VerdictRow } from "@/components/verdict-card";
import { SealPending } from "@/components/seal";
import { Nav } from "@/components/nav";

const EXPLORER_URL = monadChains.testnet.blockExplorers!.default.url;

type TxState =
  | { status: "idle" }
  | { status: "pending"; hash: `0x${string}`; stakeBefore: bigint }
  | { status: "confirmed"; hash: `0x${string}`; blockNumber: bigint; stakeBefore: bigint }
  | { status: "error"; message: string };

/**
 * Simulated buyer dispute flow. Per the contract's demo-scope design, ANY
 * connected wallet can dispute and claim the slashed stake — there's no
 * proof-of-purchase gating. Registrar-only route, code-split from the
 * walletless consumer verify page.
 */
export default function DisputePage() {
  const { ready, user } = usePrivy();
  const { login } = useLogin();
  const { logout } = useLogout();
  const { sendTransaction } = useSendTransaction();

  const [serial, setSerial] = useState("");
  const [txState, setTxState] = useState<TxState>({ status: "idle" });

  // Match any connected Ethereum wallet, not just Privy's own embedded one —
  // see the matching comment in app/(registrar)/register/page.tsx.
  const wallet = user?.linkedAccounts.find(
    (account) => account.type === "wallet" && account.chainType === "ethereum",
  ) as WalletWithMetadata | undefined;

  async function handleDispute(e: FormEvent) {
    e.preventDefault();
    if (!serial.trim()) return;

    setTxState({ status: "idle" });
    try {
      const serialHash = hashSerial(serial.trim());

      const [, stakeBefore] = await publicClient.readContract({
        address: CACHET_REGISTRY_ADDRESS[10143],
        abi: CachetRegistryAbi,
        functionName: "verifyDevice",
        args: [serialHash],
      });

      const { hash } = await sendTransaction({
        to: CACHET_REGISTRY_ADDRESS[10143],
        data: encodeFunctionData({
          abi: CachetRegistryAbi,
          functionName: "disputeDevice",
          args: [serialHash],
        }),
        chainId: 10143,
      });

      setTxState({ status: "pending", hash, stakeBefore });

      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      setTxState({ status: "confirmed", hash, blockNumber: receipt.blockNumber, stakeBefore });
    } catch (err) {
      setTxState({ status: "error", message: err instanceof Error ? err.message : String(err) });
    }
  }

  if (!ready) return <p className="p-8 text-sm text-ash">Loading…</p>;

  return (
    <>
      <Nav address={wallet?.address} onLogin={() => login()} onLogout={logout} />
      <main className="mx-auto max-w-lg px-6 py-20">
        <h1 className="font-display text-2xl text-bone italic">Report an issue</h1>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-ash">
          Simulates a buyer disputing a device&apos;s authenticity claim. This slashes the
          registrar&apos;s staked bond and pays it to whichever wallet is connected here.
        </p>

        {user && (
          <form onSubmit={handleDispute} className="mt-8 flex flex-col gap-3">
            <input
              value={serial}
              onChange={(e) => setSerial(e.target.value)}
              placeholder="Serial / IMEI to dispute"
              className="rounded-control border border-line bg-ink-raised px-3 py-2 font-mono text-sm text-bone placeholder:font-sans placeholder:text-ash focus:border-seal-gold"
            />
            <button
              type="submit"
              disabled={!wallet || txState.status === "pending"}
              className="rounded-control bg-disputed px-5 py-2 text-sm font-medium text-bone transition-opacity hover:opacity-90 disabled:bg-line-faint disabled:text-ash"
            >
              {txState.status === "pending" ? "Confirming…" : "Report issue / dispute"}
            </button>
          </form>
        )}

        <div className="mt-6 min-h-[80px]">
          {txState.status === "pending" && (
            <div>
              <p className="font-mono text-sm text-ash">Stake before dispute: {formatEther(txState.stakeBefore)} MON</p>
              <div className="mt-2">
                <SealPending />
              </div>
              <a
                className="mt-2 inline-block text-sm text-bone underline underline-offset-4"
                href={`${EXPLORER_URL}/tx/${txState.hash}`}
                target="_blank"
                rel="noreferrer"
              >
                view transaction on explorer
              </a>
            </div>
          )}
          {txState.status === "confirmed" && (
            <VerdictCard variant="disputed" title="Disputed">
              <VerdictRow label="Stake before" value={`${formatEther(txState.stakeBefore)} MON`} emphasis />
              <VerdictRow label="Stake after" value="0 MON (paid out to disputing wallet)" />
              <VerdictRow label="Block" value={txState.blockNumber.toString()} />
              <div className="flex items-center justify-between gap-4 py-2.5">
                <span className="font-mono text-xs tracking-wide text-ash uppercase">Tx</span>
                <a
                  className="font-mono text-sm text-bone underline underline-offset-4"
                  href={`${EXPLORER_URL}/tx/${txState.hash}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  View transaction on explorer
                </a>
              </div>
            </VerdictCard>
          )}
          {txState.status === "error" && (
            <VerdictCard variant="disputed" title="Transaction failed">
              {txState.message}
            </VerdictCard>
          )}
        </div>
      </main>
    </>
  );
}
