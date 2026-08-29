// Throwaway wiring-check script — NOT part of the app. Proves the exported
// ABI + address + chain config actually work end to end against the real
// deployed contract on Monad Testnet, via a free `verifyDevice` read call.
//
// Run with: pnpm --filter @cachet/shared test:read

import { createPublicClient, http } from "viem";
import { CachetRegistryAbi } from "../abi/CachetRegistry";
import { CACHET_REGISTRY_ADDRESS } from "../addresses";
import { monadChains } from "../chains";
import { hashSerial } from "../hashSerial";

async function main() {
  const client = createPublicClient({
    chain: monadChains.testnet,
    transport: http(),
  });

  const contractAddress = CACHET_REGISTRY_ADDRESS[10143];

  // A dummy, never-registered demo serial — no real IMEI/device data.
  const demoSerialHash = hashSerial("CACHET-DEMO-SERIAL-0001");

  console.log("Chain:", monadChains.testnet.name, `(id ${monadChains.testnet.id})`);
  console.log("Contract:", contractAddress);
  console.log("Querying verifyDevice() for serialHash:", demoSerialHash);

  const [registrar, stakeAmount, registeredAt, disputed] = await client.readContract({
    address: contractAddress,
    abi: CachetRegistryAbi,
    functionName: "verifyDevice",
    args: [demoSerialHash],
  });

  console.log("\n--- Real on-chain result ---");
  console.log({ registrar, stakeAmount, registeredAt, disputed });

  if (registrar === "0x0000000000000000000000000000000000000000") {
    console.log(
      "\nAll-zero result is expected: this demo serial was never registered. " +
        "The call decoded cleanly against the live contract, which proves the " +
        "ABI, address, and chain wiring are correct end to end.",
    );
  } else {
    console.log("\nThis serial IS registered — unexpected for a fresh demo hash, but a valid real result.");
  }
}

main().catch((err) => {
  console.error("verify-read-check failed:", err);
  process.exit(1);
});
