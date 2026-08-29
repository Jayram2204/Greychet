// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

import {Script, console} from "forge-std/Script.sol";
import {CachetRegistry} from "../src/CachetRegistry.sol";

/// @notice Seeds demo devices on the deployed CachetRegistry so the consumer
/// verification page has real on-chain data to test and demo against.
/// @dev All serials/metadata below are clearly-labeled dummy data — never
/// real IMEIs or personal identifiers. Registers 4 demo devices with the
/// broadcasting account as registrar, then disputes one of them so all three
/// consumer-facing states (clean / disputed / not-found) have real data.
/// Run with `--chain 10143` against Monad Testnet, using the same deployer
/// keystore as the Stage 4 deployment script. Serial hashing here
/// (`keccak256(bytes(serial))`) must match packages/shared/hashSerial.ts.
contract SeedDemoDevices is Script {
    // Must match packages/shared/addresses.ts — Solidity can't import that TS
    // file, so this is the one place the deployed address is duplicated.
    address constant REGISTRY_ADDRESS = 0x061BC07fC7612bd5e08D00121273d7bA23D3BFcD;

    function run() external {
        CachetRegistry registry = CachetRegistry(REGISTRY_ADDRESS);

        string[4] memory serials =
            ["CACHET-DEMO-PHONE-001", "CACHET-DEMO-PHONE-002", "CACHET-DEMO-LAPTOP-001", "CACHET-DEMO-TABLET-001"];
        string[4] memory metadatas = [
            "iPhone 13, 128GB, Grade A refurbished - DEMO DATA",
            "Galaxy S22, 256GB, Grade B refurbished - DEMO DATA",
            "ThinkPad X1 Carbon, Grade A refurbished - DEMO DATA",
            "iPad Air, 64GB, Grade A refurbished - DEMO DATA"
        ];
        uint256 stakeWei = 0.05 ether;

        vm.startBroadcast();

        for (uint256 i = 0; i < serials.length; i++) {
            bytes32 serialHash = keccak256(bytes(serials[i]));
            bytes32 metadataHash = keccak256(bytes(metadatas[i]));
            registry.registerDevice{value: stakeWei}(serialHash, metadataHash);
            console.log("Registered:", serials[i]);
            console.logBytes32(serialHash);
        }

        // Dispute the second device so the "registered+disputed" UI state has
        // real on-chain data to render, not just clean/not-found.
        bytes32 disputedHash = keccak256(bytes(serials[1]));
        registry.disputeDevice(disputedHash);
        console.log("Disputed:", serials[1]);

        vm.stopBroadcast();
    }
}
