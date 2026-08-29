# Cachet — Design System Specification
### The Seal: a synthesis of diagnostic rigor, regulatory certainty, provenance ceremony, and engineering precision

---

## 0. Design Thesis (read this before touching code)

Your four references are four different professional registers, each partially right and each individually a trap if copied directly:

- **Phonecheck/Swappa** — the rigor is right (real diagnostic data, pass/fail clarity), the execution is wrong (cluttered, ad-heavy, slow). We take the *scorecard honesty*, not the *form-heavy chrome*.
- **GSMA/CEIR** — the unambiguity is right (CLEAN / BLACKLISTED, no hedging), the aesthetic is wrong (dry, bureaucratic, no cryptographic weight visible). We take the *verdict clarity*, not the *government-portal blankness*.
- **Arianee/Aura** — the ceremony is right (a device's history deserves to feel like a real object with a real past), the friction is wrong (gated, modal-heavy, luxury-consortium exclusivity). We take the *timeline-as-narrative idea*, not the *velvet-rope onboarding*.
- **Linear/Raycast** — the density and precision are right (this should feel like a tool operated by someone competent, not a marketing page), the sterility is wrong if taken alone — a pure terminal has no ceremony, and Cachet's whole value is that a stamp of approval *means something*.

**The synthesis, not a collage:** Cachet is what happens when a regulatory terminal grows a sense of occasion. Every verification reads with GSMA's unambiguous certainty and Linear's operator-grade density — but the moment a device is confirmed, it gets *stamped*, literally, the way a customs seal or a wax seal historically meant "this is real, and someone is accountable for that claim." That stamp is the one ceremonial moment in an otherwise sober, dense, no-nonsense interface. Everything else stays quiet so that moment lands.

**Self-critique against generic AI defaults, done up front:** this is not cream-background-with-terracotta-serif (background is dark ink, no warm cream anywhere), not black-background-with-one-neon-accent (the accent system has three functional colors — verified green, disputed oxblood, seal gold — each tied to a real state, not one decorative accent), and the hairline/dense-grid instinct here is earned by the regulatory-ledger subject matter itself, not borrowed wholesale as a broadsheet template. If any part of the build starts to feel like "any fintech dashboard," stop and check it against this thesis.

---

## 1. Token System

### Color — named, purposeful, no gradients

| Token | Hex | Role |
|---|---|---|
| `ink` | `#12151A` | Primary background — deep charcoal with a cool blue-green undertone, not pure black. Ledger-at-night, not "crypto dark mode." |
| `ink-raised` | `#1A1E24` | Card/panel surface, one step up from base background |
| `paper` | `#ECEDE5` | Light-mode / printed-artifact surface (certificates, exported reports) — a cool bone-grey, deliberately not warm cream |
| `line` | `#333A3F` | Hairline borders, dividers — visible but never loud |
| `line-faint` | `#22262B` | Sub-dividers, table row separators |
| `ash` | `#8B9198` | Secondary text, labels, metadata |
| `bone` | `#E6E7E1` | Primary text on dark surfaces |
| `verified` | `#1F6B45` | Deep stamp-ink green — the "clean/registered" verdict color. Desaturated, institutional, not a SaaS-success green. |
| `disputed` | `#8A2E22` | Oxblood/sealing-wax red — the "disputed/flagged" verdict color. Ties literally to wax-seal tradition. |
| `pending` | `#8B7A3F` | Muted amber-brass — mid-state, e.g. "dispute filed, awaiting resolution" |
| `seal-gold` | `#A6863A` | Reserved almost exclusively for the seal/stamp component itself and stake-amount emphasis — this is the one "expensive-feeling" color in the system, spend it carefully |

No gradients anywhere. No glassmorphism/blur. Flat fills, hairline strokes, one texture exception noted in Section 4 (the seal itself).

### Typography — three roles, each doing one job

| Role | Face | Where it's used | Why |
|---|---|---|---|
| **Certificate/display** | Newsreader (italic, optical size ≥28px) | Only for: the verdict headline on a fresh verification result, the seal's internal lettering, the certificate/report PDF header | An old-ledger, engraved-document quality — used sparingly enough that it reads as ceremony, not as the page's default voice |
| **UI/body** | IBM Plex Sans (400/500/600) | Labels, buttons, paragraph copy, navigation, form fields | Institutional without being cold — Plex's own enterprise/engineering heritage matches the "regulatory terminal" register honestly, not decoratively |
| **Data/mono** | IBM Plex Mono (400/500) | Serial hashes, wallet addresses, stake amounts, timestamps, transaction hashes, status codes | Every piece of cryptographic or numeric truth on this page is set in mono — it's a visual promise: "this specific string is exactly what's on chain, not paraphrased" |

Type scale (base 16px, 1.25 ratio):
`12 / 14 / 16 / 20 / 25 / 31 / 39 / 49px` — display/certificate moments live at 31–49px, UI body at 14–16px, data/mono rarely exceeds 20px (it's meant to be scanned precisely, not shouted).

### Spacing & shape
- 8px base grid.
- **Zero border-radius on data/ledger elements** (tables, status rows, address fields) — these are records, not soft consumer-app cards. **Small radius (4px) permitted only on interactive controls** (buttons, inputs) to keep them legible as "things you can press," distinct from "things you read."
- Hairline borders (`1px solid line`) do the separating work that shadows would do elsewhere — no drop shadows except a single, small, functional elevation shadow on the seal component itself at the moment it stamps (see motion section).

---

## 2. Layout Concept

### Consumer Verify Page (the walletless, public page — this is the product's front door)

```
+------------------------------------------------------------------+
| CACHET                                          [ For businesses→]|  <- thin top bar, mono wordmark
+------------------------------------------------------------------+
|                                                                    |
|   Check a device before you pay for it.                          |  <- Newsreader italic, restrained
|                                                                    |
|   [ Enter serial / IMEI                                    ] [→] |  <- single input, no clutter, no ads
|                                                                    |
+------------------------------------------------------------------+
|                                                                    |
|   (empty state: quiet ledger-line placeholder text, e.g.          |
|    "Nothing checked yet — results appear here.")                  |
|                                                                    |
+------------------------------------------------------------------+
```

**After verification — the result renders as a ledger entry with an embedded seal, not a modal:**

```
+------------------------------------------------------------------+
|  [SEAL: verified-green,     STATUS  VERIFIED                     |
|   stamped, slight rotation]  ------  --------                    |
|                               Registered by  0x4a...9F2c          |
|                               Registered at  2026-08-29 14:32 UTC |
|                               Stake locked   2.40 MON             |
|                               Tx             0x8e...c11d  [view →]|
|------------------------------------------------------------------|
|  TIMELINE                                                          |
|  ● Registered           ● Ownership handshake        ○ Disputed   |
|  Aug 29, 14:32           Aug 29, 14:40                (none)      |
+------------------------------------------------------------------+
|                                          [ Report a problem → ]    |
+------------------------------------------------------------------+
```

This single layout does the work of all four references at once: GSMA's unambiguous verdict word (VERIFIED, in caps, no hedging), Phonecheck's scorecard density (a real data table, not prose), Arianee's timeline (event trail, horizontal, tick-marked), and Linear's mono precision (every hash and timestamp exact and inspectable) — unified by the one signature element, the seal, instead of feeling like four borrowed patterns stitched together.

**Disputed state** uses the identical layout, only the seal recolors to `disputed` oxblood with a visible crack/fracture texture (see Section 4), and the STATUS word changes to `DISPUTED` — same structure, different verdict, reinforcing that this is one honest system, not a different UI for bad news.

**Not-found state** — deliberately the quietest state in the system: no seal renders at all (nothing to stamp), just a plain mono line: `No record found for this serial.` — emptiness as information, not an error, per the "treat emptiness as a moment for direction" principle: follow it with one calm next step, e.g. `This device may be unregistered — that alone is worth asking about.`

### Registrar Dashboard

```
+------------------------------------------------------------------+
|  CACHET · Registrar                          0x4a...9F2c  [⏻]    |
+------------------------------------------------------------------+
|  Register a device                                                |
|  Serial / IMEI      [                              ]              |
|  Condition claim     ( New )( Certified refurbished )( Used )     |
|  Stake amount        [ 2.40 ] MON     — refunded if undisputed    |
|                                          [ Register & lock stake ]|
+------------------------------------------------------------------+
|  Your registered devices                                          |
|  ------------------------------------------------------------     |
|  SERIAL      STATUS     STAKE     REGISTERED         ACTION       |
|  a4f...9c1   VERIFIED   2.40 MON  Aug 29, 14:32       —           |
|  b7e...332   DISPUTED   0.00 MON  Aug 28, 09:11    [ details ]    |
|  ------------------------------------------------------------     |
+------------------------------------------------------------------+
```

A plain, dense ledger table — deliberately closer to Linear's issue list than to a "dashboard" full of cards and charts. The registrar is a professional doing repeat work; respect that with density, not gamified widgets.

### The Seal component itself (Section 4 covers this in full)
Circular, ~72px, sits to the left of every verdict row. Rendered as an actual stamp: slightly irregular edge (not a perfect circle — a hand-press has give), fine radial engraving lines inside reading `CACHET · VERIFIED` in Newsreader italic set on a curve, in the verdict color, at ~85% opacity on the `ink-raised` surface so it reads as pressed-in, not printed-on.

---

## 3. Signature Element: The Seal

This is the one place the design spends its boldness — everything else in the system is quiet by design so this lands.

- **What it is:** a circular stamp mark, rendered in SVG, that visually "presses" onto the ledger row the instant a `verifyDevice()` read resolves.
- **Why it's earned, not decorative:** the product's entire name and mechanism is about a mark of approval carrying real, financial weight (the locked stake). The UI's one moment of ceremony should be the exact moment that mark is granted or broken — nowhere else.
- **Two states only:**
  - *Verified*: solid `verified` green ink, unbroken circular edge, centered checkmark-adjacent glyph (not a generic checkmark — a small crossed-quill or wax-press mark, custom-drawn, reinforcing "official mark" rather than "todo item done").
  - *Disputed*: `disputed` oxblood, the circle rendered with one deliberate fracture line through it — the seal, broken. This single detail communicates the entire staking mechanism wordlessly: a broken seal means the bond was forfeit.
- **It never appears animated on page load for existing data** (e.g., scrolling a dashboard table) — only on the live moment of a fresh verification or a fresh dispute transaction resolving, per the motion principles below. A seal that stamps constantly on every scroll is decoration; a seal that stamps once, at the real moment of consequence, is ceremony.

---

## 4. Motion — one orchestrated moment, restraint everywhere else

- **The stamp animation** (the only elaborate motion in the system): on a fresh verify/dispute transaction resolving, the seal scales in from 130% to 100% over ~180ms with a slight overshoot-settle (press-then-settle, like a real stamp hitting paper), accompanied by a single small elevation shadow that appears and fades — this is the one drop-shadow in the entire design system, used exactly once, for exactly this.
- **Loading state:** while a chain read/write is in flight, the seal's position renders as a faint dashed-circle outline (reserving layout space, avoiding CLS per the earlier performance spec) with a slow mono-spaced counter ticking (`awaiting confirmation...`) rather than a generic spinner — keeps the "ledger/terminal" voice even in the waiting state.
- **Hover/interaction:** table rows get a 1px `line` → `seal-gold` border-color shift on hover, nothing more — no scale, no shadow, no color-fill sweep. Buttons get a simple background-darken, no gradient sweep or glow.
- **Explicitly rejected:** scroll-triggered reveals, horizontal scroll, scroll-progress bars, parallax, pulsing/breathing dots, any looping ambient animation. This is a tool for verifying real money and real property — motion that runs whether or not anything true just happened undercuts the entire premise. (This also directly answers the earlier "shall we add scroll effects" question — no, and now you have the design-thesis reason why, not just a time-budget reason.)

---

## 5. 404 / Not-Found Page
Reuses the exact "not-found" verdict-row pattern from the consumer verify page (Section 2) — no seal, plain mono line: `No record found for this page.` followed by a single calm link back. This keeps the entire site's vocabulary consistent: "not found" means the same thing everywhere, whether it's a device or a URL, which is itself a small piece of design honesty worth having.

---

## 6. Accessibility & Quality Floor (non-negotiable, per design principles)
- Visible keyboard focus ring on every interactive element, rendered in `seal-gold` at 2px — distinct enough to see, consistent with the palette.
- Color is never the only signal: VERIFIED/DISPUTED/PENDING are always paired with the actual word in caps mono text, never color alone (this also matters practically — colorblind users must be able to read a fraud verdict correctly).
- `prefers-reduced-motion` respected: the stamp animation becomes an instant state-swap with no scale/overshoot when the OS setting is set.
- Responsive down to a single-column mobile layout: the ledger table becomes stacked key-value rows below ~640px, the seal shrinks to 48px but never disappears — it's the one element that should survive every breakpoint intact.

---

## 7. Implementation Notes for the Build (Tailwind mapping)
Drop these tokens into `tailwind.config` (or the CSS `@theme` block if on Tailwind v4 — confirm actual current major version before writing config, don't assume) as custom theme colors named exactly as in Section 1 (`ink`, `ink-raised`, `paper`, `line`, `verified`, `disputed`, `pending`, `seal-gold`, `ash`, `bone`) rather than reaching for default Tailwind palette shades (`slate-900`, `emerald-600`, etc.) — the whole point of this system is that these colors mean something specific to Cachet, and using stock Tailwind names invites future edits to quietly drift back toward generic defaults.
