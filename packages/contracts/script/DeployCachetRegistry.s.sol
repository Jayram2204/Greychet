// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

import {Script, console} from "forge-std/Script.sol";
import {CachetRegistry} from "../src/CachetRegistry.sol";

/// @notice Deploys CachetRegistry to whichever chain is targeted via --rpc-url.
/// @dev Intended for Monad Testnet (chain ID 10143) — pass `--chain 10143`
/// explicitly. Do NOT point this at Monad Mainnet (chain ID 143) without
/// explicit go-ahead. Takes no constructor arguments.
contract DeployCachetRegistry is Script {
    function run() external returns (CachetRegistry registry) {
        vm.startBroadcast();
        registry = new CachetRegistry();
        vm.stopBroadcast();

        console.log("CachetRegistry deployed to:", address(registry));
        console.log("Chain ID:", block.chainid);
    }
}
