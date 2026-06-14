# Phase 2 — Prompt

> Saved verbatim. ENS identity on receipts.

---

Continue myranda-consent. Standing rules as before. Save this as
prompts/phase-2.md.

Phase 2, ENS.
1. Using viem with a public Ethereum mainnet RPC (reads only), resolve the
   connected wallet's primary ENS name and avatar. If the wallet has one, show
   "Signed by name.eth" with the avatar on each receipt instead of the raw
   address. If not, show the shortened address with a small note.
2. Stretch, only if quick: let the user write their latest Walrus blob ID into
   an ENS text record under the key "me.myranda.consent", so their ENS identity
   points to their consent index. Only attempt if the connected name is owned by
   the user, and warn me it costs gas. If it's not straightforward, skip it and
   keep the display-only version.
Commit per step. Tell me what to check, then redeploy.
