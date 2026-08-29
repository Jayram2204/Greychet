/**
 * Deployed CachetRegistry contract addresses, keyed by chain ID.
 * Single source of truth — import this instead of hardcoding an address.
 */
export const CACHET_REGISTRY_ADDRESS = {
  /** Monad Testnet */
  10143: "0x061BC07fC7612bd5e08D00121273d7bA23D3BFcD",
} as const satisfies Record<number, `0x${string}`>;

export type CachetSupportedChainId = keyof typeof CACHET_REGISTRY_ADDRESS;
