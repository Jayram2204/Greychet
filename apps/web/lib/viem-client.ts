import { createPublicClient, http } from "viem";
import { monadChains } from "@cachet/shared";

/**
 * Read-only public client for Monad Testnet. No wallet involved — safe to use
 * from walletless, consumer-facing pages.
 */
export const publicClient = createPublicClient({
  chain: monadChains.testnet,
  transport: http(),
});
