# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Two distinct primary audiences:
- **Consumers** verifying a used/refurbished device before or after a purchase — checking whether a business has staked a bond on its authenticity claim, and whether that claim has been disputed. Walletless, likely on mobile, likely time-pressured (e.g. mid-purchase at a kiosk or checking a listing).
- **Small business owners / refurbishers** who register devices, lock a MON stake as a bond, and manage their registered inventory. Business operators, not crypto-native users — many will be new to wallets entirely (Cachet provisions an embedded wallet on login).

## Product Purpose

Cachet is a device-authenticity trust registry. A business registers a device and locks a financial stake as a bond on its authenticity claim. Consumers verify that claim for free, with no wallet required. If a buyer disputes a device as tampered or misrepresented, the registrar's stake is slashed and paid to the disputer.

## Positioning

Cachet does not physically inspect devices and does not claim to. Its mechanism is economic, not forensic: false authenticity claims are made costly via a slashable stake plus buyer dispute rights, not verified by inspection. This distinction must stay legible everywhere the mechanism is described — in copy, UI, and code comments alike.

## Operating Context

- Consumer verification is free, read-only, and requires no wallet — this must never regress.
- Registrar actions (register, and the demo dispute-trigger flow) are real on-chain transactions on Monad Testnet, signed via an embedded wallet.
- A device can be in exactly one of three states, each needing an unambiguous visual treatment: registered with no dispute, registered and disputed (stake already slashed), or not registered.

## Capabilities and Constraints

- Reads happen via a public RPC client; no wallet SDK may load on the consumer-facing verification route.
- Registrar flows load an embedded-wallet SDK, scoped away from the consumer route via code-splitting.
- Currently targets Monad Testnet only; mainnet is a distinct, undecided future scope.

## Brand Commitments

- Name: Cachet. No logo or lockup exists yet.
- Voice/tone: credible and institutional — closer to a banking or insurance product than a typical crypto dApp. This is a durable brand commitment, not a one-off polish note.

## Evidence on Hand

No real customer testimonials, case studies, or press exist. Any device data shown in the product (staked amounts, registrar addresses, serials) must stay clearly labeled demo/dummy data until real registrars are onboarded — none of it may be presented as real evidence.

## Product Principles

1. Say the mechanism honestly: stake-backed self-attestation plus dispute rights, never implied physical inspection.
2. Consumer verification stays free and walletless, permanently — no feature may add friction here.
3. Every state-changing action is a real, showable on-chain transaction; nothing in the trust-relevant UI is backed by local-only state.
4. Read as institutional and boring-in-a-good-way, not as a speculative crypto product — trust is the entire product.
