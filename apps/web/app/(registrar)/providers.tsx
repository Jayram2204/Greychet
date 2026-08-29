"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import { monadChains } from "@cachet/shared";

/**
 * Wraps the app with Privy for registrar-side embedded wallet auth.
 * Consumer-facing device verification never renders inside this provider's
 * gated flows — it stays walletless, per the product's free-verification model.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
      clientId={process.env.NEXT_PUBLIC_PRIVY_CLIENT_ID}
      config={{
        embeddedWallets: {
          ethereum: {
            createOnLogin: "users-without-wallets",
          },
        },
        defaultChain: monadChains.testnet,
        supportedChains: [monadChains.testnet],
      }}
    >
      {children}
    </PrivyProvider>
  );
}
