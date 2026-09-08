# Greychet

A stake-backed device-authenticity registry on [Monad](https://monad.xyz) — a business locks a MON bond on a device's authenticity claim, anyone can verify it for free with no wallet, and a disputing buyer can slash a false claim.

[![CI](https://github.com/Jayram2204/Greychet/actions/workflows/ci.yml/badge.svg)](https://github.com/Jayram2204/Greychet/actions/workflows/ci.yml)

- **Live app:** https://cachet-monad.vercel.app
- **Deployed contract (Monad Testnet, chain ID `10143`):** [`0x061BC07fC7612bd5e08D00121273d7bA23D3BFcD`](https://testnet.monadscan.com/address/0x061BC07fC7612bd5e08D00121273d7bA23D3BFcD) — verified source, "Exact Match"

## What this is (and isn't)

**Cachet does not physically inspect any device.** It makes false authenticity claims economically expensive instead:

1. A registrar (refurbisher/retailer) calls `registerDevice(serialHash, metadataHash)` with a MON stake attached — that stake is a bond on their claim.
2. Anyone can call `verifyDevice(serialHash)` — a free, read-only check, no wallet or gas required — to see whether a device is registered, its staked amount, and whether it's been disputed.
3. If the claim turns out false, anyone acting as the disputing buyer calls `disputeDevice(serialHash)`, which slashes the registrar's full stake and pays it to the disputer.

There's no proof-of-purchase gating on step 3 — that's an intentional, documented simplification for this build (see the NatSpec in `CachetRegistry.sol`), not an oversight.

## Prerequisites

Exact versions this project was built and tested against:

| Tool | Version |
|---|---|
| Node.js | **24.20.0** (see `.nvmrc`) |
| pnpm | **11.24.0** |
| Foundry (`forge`/`cast`/`anvil`) | **1.5.1-stable** |
| Solidity | **0.8.36** (pinned in `packages/contracts/foundry.toml`) |

Install Foundry via `curl -L https://foundry.paradigm.xyz | bash && foundryup` if you don't have it. Everything else (Next.js 16.3.3, React 19.2.8, viem, OpenZeppelin Contracts v5.7.0) is pinned in the lockfile / `foundry.lock` and installed automatically below.

You'll also need [nvm](https://github.com/nvm-sh/nvm#installing-and-updating) (or any way to get Node 24.20.0 on your PATH) and `git`.

## Setup

```bash
# 1. Clone WITH submodules (forge-std and OpenZeppelin are git submodules —
#    a plain clone leaves packages/contracts/lib/ empty and forge build will fail)
git clone --recurse-submodules https://github.com/Jayram2204/Greychet.git
cd Greychet

# 2. Use the exact Node version this project was built with
nvm install && nvm use   # reads .nvmrc

# 3. Get pnpm 11.24.0 (Node 24 ships corepack, which installs the exact
#    version this project pins in package.json#packageManager)
corepack enable
corepack install

# 4. Install JS/TS dependencies for the whole monorepo (web app + shared package)
pnpm install

# 5. Build and test the contracts
cd packages/contracts
forge build
forge test   # prints "No tests found in project!" and exits 0 — see note below
cd ../..
```

> **Honest gap:** this project currently ships zero Solidity unit tests. `forge test` exiting 0 with "No tests found" is expected today, not a passing test suite — don't mistake the two. CI runs `forge test` anyway so a real test suite starts passing automatically the moment one is added.

### Run the web app locally

The consumer verify page works immediately with no configuration — it only does free, walletless reads against the already-deployed contract above.

```bash
pnpm --filter web dev
# open http://localhost:3000
```

To also use the registrar dashboard (`/register`, `/dispute`), which needs a wallet:

1. Create a free app at https://dashboard.privy.io
2. In that app's settings, add `http://localhost:3000` as an allowed origin
3. `cp .env.example apps/web/.env.local`, then edit that file and fill in `NEXT_PUBLIC_PRIVY_APP_ID` (and optionally `NEXT_PUBLIC_PRIVY_CLIENT_ID`) from the Privy dashboard — both are client-exposed by Privy's own design, not secrets, but keep this file local anyway (it's gitignored)
4. Restart `pnpm --filter web dev`, then visit `http://localhost:3000/register`, log in (email/social — Privy provisions an embedded wallet automatically, no seed phrase needed), fund that wallet from https://faucet.monad.xyz, and register a device with a small MON stake

### Deploying your own contract instance (optional)

You don't need to do this to try the app — the frontend already points at a live deployed contract. Only do this if you want your own isolated registry:

```bash
cd packages/contracts
cast wallet import my-deployer --private-key $(cast wallet new | grep 'Private key:' | awk '{print $3}')
# fund the printed address from https://faucet.monad.xyz, then:
forge script script/DeployCachetRegistry.s.sol \
  --rpc-url https://testnet-rpc.monad.xyz/ \
  --account my-deployer \
  --chain 10143 \
  --broadcast
```

Update `packages/shared/addresses.ts` with the resulting address — it's the single place the frontend reads the contract address from.

## Project structure

```
apps/web/            Next.js 16 app — consumer verify page + registrar dashboard
packages/contracts/  Foundry project — CachetRegistry.sol, deploy/seed scripts
packages/shared/     Generated ABI, derived types, chain config, contract address
```

## Security notes

See [NOTES.md](./NOTES.md) for design-tooling notes. No private keys, seed phrases, or API keys are committed anywhere in this repo or its history — `.env` files are gitignored, `.env.example` holds placeholders only, and the deployer key used for the live contract lives only in a local Foundry encrypted keystore, never in any tracked file.
