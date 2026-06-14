# Myranda Consent — Plan

**Tagline:** Your data. Your keys. Your consent, on the record.

Myranda Consent is an open-source project for **user-owned consent**: people
control their own data, hold their own keys, and every consent decision is
recorded in a way that is verifiable and tamper-evident.

This document is the running roadmap. Phases 0–2 are done. Phase 3 will be
defined by the next prompt (each phase starts from a written prompt saved in
[`/prompts`](./prompts)).

**Live site:** https://myranda-consent.vercel.app
**Repo:** https://github.com/myranda-jasper/myranda-consent

---

## Phase 0 — Foundation ✅ (complete)

Get a real, live, public project online that we can build on.

- [x] Scaffold a Next.js app (App Router) with TypeScript and Tailwind.
- [x] Landing page: title "Myranda Consent" + subtitle.
- [x] Initialise git and create a **public** GitHub repo `myranda-consent`.
- [x] Deploy to Vercel for a live URL.
- [x] `PLAN.md` + `/prompts` folder (this file, and `prompts/phase-0.md`).

## Phase 1 — Core consent flow ✅ (complete)

Login, encrypt, sign, store, and verify — the whole loop, at `/app`.

- [x] Privy auth (email + external wallet / MetaMask).
- [x] "Approve and store an export" with a sample data export.
- [x] AES-GCM encryption in the browser, key derived from a wallet signature
      (HKDF over the signature of "Myranda Consent encryption key v1").
- [x] EIP-712 signed consent receipt (user, action, category, timestamp,
      blob hash) — the signature is the verifiable consent.
- [x] Encrypted blob uploaded to Walrus testnet (via a server-side proxy).
- [x] "My consent history" with Verify (re-check signature) and Fetch from
      Walrus (re-download + decrypt with the signature-derived key).

## Phase 2 — ENS identity ✅ (complete)

Put a human-readable identity on every consent receipt.

- [x] Resolve the connected wallet's primary ENS name + avatar (viem, public
      mainnet RPC, reads only, with forward-verification).
- [x] Show "Signed by name.eth" + avatar on each receipt (and in the identity
      card); fall back to the shortened address with a note when there's no name.
- [x] Stretch: owner-gated "Publish to ENS" — writes the latest Walrus blob ID
      into the text record `me.myranda.consent` (mainnet tx, gas-warned). Only
      shown when the connected wallet owns its primary ENS name.

## Phase 3 — To be defined

Direction set by the next prompt. Threads not yet built: persisting the receipt
list (currently in-memory only), a public verification page where anyone can
check a receipt, tamper-evidence / linking of records, and shareable proof of
consent.

---

## Standing rules for this project

- Public GitHub repo named **myranda-consent**.
- Commit in small steps; push after each.
- Keep this `PLAN.md` up to date and save every prompt in `/prompts`.
- Do **not** touch the unrelated "On-device web agent" project.
- Explain in plain English and flag exactly when the user must act.

## Tech stack

- Next.js (App Router) + TypeScript
- Tailwind CSS
- Hosting: Vercel
- Source: GitHub (public)
