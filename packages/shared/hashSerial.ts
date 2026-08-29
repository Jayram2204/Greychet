import { keccak256, toBytes, type Hex } from "viem";

/**
 * Canonical serial-number hashing used by both the registrar seed script and
 * the consumer verification page. Must match Solidity's `keccak256(bytes(s))`
 * exactly — `toBytes` UTF-8 encodes the string first, same as `bytes(s)` does
 * for a Solidity string.
 */
export function hashSerial(serial: string): Hex {
  return keccak256(toBytes(serial));
}
