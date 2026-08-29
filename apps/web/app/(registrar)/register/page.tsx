"use client";

import { useState, type FormEvent } from "react";
import { encodeFunctionData, parseEther, keccak256, toBytes } from "viem";
import { useLogin, useLogout, usePrivy, useSendTransaction, type WalletWithMetadata } from "@privy-io/react-auth";
import { CachetRegistryAbi, CACHET_REGISTRY_ADDRESS, hashSerial, monadChains } from "@cachet/shared";
import { publicClient } from "@/lib/viem-client";
import { VerdictCard } from "@/components/verdict-card";

const EXPLORER_URL = monadChains.testnet.blockExplorers!.default.url;

type TxState =
  | { status: "idle" }
  | { status: "pending"; hash: `0x${string}` }
  | { status: "confirmed"; hash: `0x${string}`; blockNumber: bigint }
  | { status: "error"; message: string };

/**
 * Registrar dashboard: connect wallet, register a device, lock a MON stake as
 * a bond. Registrar-only — never bundled into the walletless consumer route.
 */
export default function RegisterPage() {
  const { ready, user } = usePrivy();
  const { login } = useLogin();
  const { logout } = useLogout();
  const { sendTransaction } = useSendTransaction();

  const [serial, setSerial] = useState("");
  const [description, setDescription] = useState("");
  const [stake, setStake] = useState("0.05");
  const [txState, setTxState] = useState<TxState>({ status: "idle" });

  const wallet = user?.linkedAccounts.find(
    (account) => account.type === "wallet" && account.walletClientType === "privy" && account.chainType === "ethereum",
  ) as WalletWithMetadata | undefined;

  async function handleRegister(e: FormEvent) {
    e.preventDefault();
    if (!serial.trim() || !description.trim() || !stake.trim()) return;

    setTxState({ status: "idle" });
    try {
      const serialHash = hashSerial(serial.trim());
      const metadataHash = keccak256(toBytes(description.trim()));

      const { hash } = await sendTransaction({
        to: CACHET_REGISTRY_ADDRESS[10143],
        data: encodeFunctionData({
          abi: CachetRegistryAbi,
          functionName: "registerDevice",
          args: [serialHash, metadataHash],
        }),
        value: parseEther(stake.trim()),
        chainId: 10143,
      });

      setTxState({ status: "pending", hash });

      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      setTxState({ status: "confirmed", hash, blockNumber: receipt.blockNumber });
    } catch (err) {
      setTxState({ status: "error", message: err instanceof Error ? err.message : String(err) });
    }
  }

  if (!ready) return <p className="p-8 text-sm text-ink-muted">Loading…</p>;

  return (
    <main className="mx-auto max-w-lg px-6 py-20">
      <h1 className="text-2xl font-semibold tracking-tight">Registrar dashboard</h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-ink-muted">
        Register a device and lock a MON stake as a bond on its authenticity claim. This does not
        physically inspect the device — it makes a false claim economically costly.
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

          <form onSubmit={handleRegister} className="mt-6 flex flex-col gap-3">
            <input
              value={serial}
              onChange={(e) => setSerial(e.target.value)}
              placeholder="Device serial number (dummy/demo only)"
              className="rounded-sharp border border-line bg-white px-3 py-2 font-mono text-sm text-ink placeholder:font-sans placeholder:text-ink-muted focus:border-ink focus:outline-none"
            />
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description (e.g. iPhone 13, 128GB, Grade A)"
              className="rounded-sharp border border-line bg-white px-3 py-2 text-sm text-ink placeholder:text-ink-muted focus:border-ink focus:outline-none"
            />
            <input
              value={stake}
              onChange={(e) => setStake(e.target.value)}
              placeholder="Stake amount (MON)"
              inputMode="decimal"
              className="rounded-sharp border border-line bg-white px-3 py-2 font-mono text-sm text-ink placeholder:font-sans placeholder:text-ink-muted focus:border-ink focus:outline-none"
            />
            <button
              type="submit"
              disabled={!wallet || txState.status === "pending"}
              className="rounded-sharp bg-ink px-5 py-2 text-sm font-medium text-paper transition-opacity hover:opacity-90 disabled:bg-line disabled:text-ink-muted"
            >
              {txState.status === "pending" ? "Confirming…" : "Register device"}
            </button>
          </form>
        </>
      )}

      <div className="mt-6 min-h-[80px]">
        {txState.status === "pending" && (
          <p className="text-sm text-ink-muted">
            Transaction sent —{" "}
            <a className="text-ink underline underline-offset-4" href={`${EXPLORER_URL}/tx/${txState.hash}`} target="_blank" rel="noreferrer">
              view on explorer
            </a>{" "}
            (waiting for confirmation…)
          </p>
        )}
        {txState.status === "confirmed" && (
          <VerdictCard variant="clean" title="Device registered on-chain">
            <p>Block: {txState.blockNumber.toString()}</p>
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
