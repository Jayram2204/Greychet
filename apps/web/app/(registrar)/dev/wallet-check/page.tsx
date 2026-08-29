"use client";

import { useMemo, useState } from "react";
import { useLogin, useLogout, usePrivy, useSignMessage, type WalletWithMetadata } from "@privy-io/react-auth";

/**
 * Throwaway registrar-wallet isolation harness — NOT the dashboard UI (that's
 * later stages). Deliberately unstyled. Exists only to prove Privy embedded
 * wallet connect + message signing actually works before any UI is built.
 */
export default function WalletCheckPage() {
  const { ready, user } = usePrivy();
  const { login } = useLogin();
  const { logout } = useLogout();
  const { signMessage } = useSignMessage();
  const [signature, setSignature] = useState<string | null>(null);
  const [signing, setSigning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const embeddedWallet = useMemo<WalletWithMetadata | undefined>(
    () =>
      user?.linkedAccounts.find(
        (account) =>
          account.type === "wallet" && account.walletClientType === "privy" && account.chainType === "ethereum",
      ) as WalletWithMetadata | undefined,
    [user],
  );

  async function handleSignTestMessage() {
    if (!embeddedWallet) return;
    setSigning(true);
    setError(null);
    try {
      const { signature } = await signMessage(
        { message: "Cachet registrar wallet isolation test" },
        { address: embeddedWallet.address },
      );
      setSignature(signature);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSigning(false);
    }
  }

  if (!ready) return <p>Loading Privy...</p>;

  return (
    <div>
      <h1>Registrar wallet isolation check</h1>
      <p>Not the real dashboard — just proving connect + sign works before any UI is built.</p>

      {!user ? (
        <button onClick={() => login()}>Login</button>
      ) : (
        <>
          <p>Logged in as user: {user.id}</p>
          <button onClick={logout}>Logout</button>
        </>
      )}

      {embeddedWallet && (
        <div>
          <p>Embedded wallet address: {embeddedWallet.address}</p>
          <button onClick={handleSignTestMessage} disabled={signing}>
            {signing ? "Signing..." : "Sign test message"}
          </button>
        </div>
      )}

      {signature && (
        <p>
          Signature: <code>{signature}</code>
        </p>
      )}
      {error && <p style={{ color: "red" }}>Error: {error}</p>}
    </div>
  );
}
