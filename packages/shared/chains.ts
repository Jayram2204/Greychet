import { monad, monadTestnet } from "viem/chains";
import type { Chain } from "viem";

/**
 * Monad chain definitions, re-exported from viem's own verified presets
 * (do not hand-roll RPC URLs / chain IDs here — viem's are authoritative).
 */
export const monadChains = {
  /** Monad Testnet — chain ID 10143. Active by default for this project. */
  testnet: monadTestnet,
  /** Monad Mainnet — chain ID 143. STRETCH GOAL ONLY, not used until told. */
  mainnet: monad,
} satisfies Record<string, Chain>;

/** The chain this project targets by default. Currently: Monad Testnet. */
export const DEFAULT_CHAIN: Chain = monadChains.testnet;
