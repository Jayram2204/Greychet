import type { ContractFunctionArgs, ContractFunctionReturnType } from "viem";
import { CachetRegistryAbi } from "./abi/CachetRegistry";

/**
 * Param/return types for CachetRegistry's four functions, derived directly
 * from the generated ABI (never hand-declared) so they can't drift out of
 * sync with the deployed contract.
 */

export type RegisterDeviceArgs = ContractFunctionArgs<typeof CachetRegistryAbi, "payable", "registerDevice">;

export type VerifyDeviceArgs = ContractFunctionArgs<typeof CachetRegistryAbi, "view", "verifyDevice">;
export type VerifyDeviceReturn = ContractFunctionReturnType<typeof CachetRegistryAbi, "view", "verifyDevice">;

export type DisputeDeviceArgs = ContractFunctionArgs<typeof CachetRegistryAbi, "nonpayable", "disputeDevice">;

export type FlagDuplicateScanArgs = ContractFunctionArgs<
  typeof CachetRegistryAbi,
  "nonpayable",
  "flagDuplicateScan"
>;
