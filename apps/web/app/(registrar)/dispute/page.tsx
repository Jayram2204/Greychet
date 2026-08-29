"use client";

import { useState, type FormEvent } from "react";
import { encodeFunctionData, formatEther } from "viem";
import { useLogin, useLogout, usePrivy, useSendTransaction, type WalletWithMetadata } from "@privy-io/react-auth";
import { CachetRegistryAbi, CACHET_REGISTRY_ADDRESS, hashSerial, monadChains } from "@cachet/shared";
import { publicClient } from "@/lib/viem-client";
import { VerdictCard } from "@/components/verdict-card";

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

  const wallet = user?.linkedAccounts.find(
    (account) => account.type === "wallet" && account.walletClientType === "privy" && account.chainType === "ethereum",
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

  if (!ready) return <p className="p-8 text-sm text-ink-muted">Loading…</p>;

  return (
    <main className="mx-auto max-w-lg px-6 py-20">
      <h1 className="text-2xl font-semibold tracking-tight">Report an issue</h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-ink-muted">
        Simulates a buyer disputing a device&apos;s authenticity claim. This slashes the
        registrar&apos;s staked bond and pays it to whichever wallet is connected here.
      </p>

      {!user ? (
        <button
          onClick={() => login()}
          className="mt-8 rounded-sharp bg-ink px-5 py-2 text-sm font-medium text-paper transition-opacity hover:opacity-90"
        >
          Login
        </button>
      ) : (
        <>
          <div className="mt-6 flex items-center justify-between border border-line bg-white px-3 py-2 text-sm text-ink-muted">
            <span className="break-all font-mono text-xs">{wallet?.address ?? "creating…"}</span>
            <button onClick={logout} className="ml-3 shrink-0 text-ink underline underline-offset-4">
              Logout
            </button>
          </div>

          <form onSubmit={handleDispute} className="mt-6 flex flex-col gap-3">
            <input
              value={serial}
              onChange={(e) => setSerial(e.target.value)}
              placeholder="Device serial number to dispute"
              className="rounded-sharp border border-line bg-white px-3 py-2 font-mono text-sm text-ink placeholder:font-sans placeholder:text-ink-muted focus:border-ink focus:outline-none"
            />
            <button
              type="submit"
              disabled={!wallet || txState.status === "pending"}
              className="rounded-sharp bg-status-disputed px-5 py-2 text-sm font-medium text-paper transition-opacity hover:opacity-90 disabled:bg-line disabled:text-ink-muted"
            >
              {txState.status === "pending" ? "Confirming…" : "Report issue / dispute"}
            </button>
          </form>
        </>
      )}

      <div className="mt-6 min-h-[80px]">
        {txState.status === "pending" && (
          <p className="text-sm text-ink-muted">
            Stake before dispute: {formatEther(txState.stakeBefore)} MON — transaction sent,{" "}
            <a className="text-ink underline underline-offset-4" href={`${EXPLORER_URL}/tx/${txState.hash}`} target="_blank" rel="noreferrer">
              view on explorer
            </a>{" "}
            (waiting for confirmation…)
          </p>
        )}
        {txState.status === "confirmed" && (
          <VerdictCard variant="disputed" title="Dispute confirmed — stake slashed">
            <p>Stake before: {formatEther(txState.stakeBefore)} MON</p>
            <p>Stake after: 0 MON (paid out to disputing wallet)</p>
            <p className="mt-1">Block: {txState.blockNumber.toString()}</p>
            <a
              className="text-ink underline underline-offset-4"
              href={`${EXPLORER_URL}/tx/${txState.hash}`}
              target="_blank"
              rel="noreferrer"
            >
              View transaction on explorer
            </a>
          </VerdictCard>
        )}
        {txState.status === "error" && (
          <VerdictCard variant="disputed" title="Transaction failed">
            {txState.message}
          </VerdictCard>
        )}
      </div>
    </main>
  );
}
