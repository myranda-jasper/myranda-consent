# Myranda Consent — Plan

**Tagline:** Your data. Your keys. Your consent, on the record.

Myranda Consent is an open-source project for **user-owned consent**: people
control their own data, hold their own keys, and every consent decision is
recorded in a way that is verifiable and tamper-evident.

This document is the running roadmap. Phases 0–1 are done. Phases 2–3 are a
proposed direction and will be refined as we go (each phase starts from a
written prompt saved in [`/prompts`](./prompts)).

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

## Phase 2 — Your keys (proposed)

Make "your keys" real — the user, not us, signs their consent.

- Generate a keypair in the user's browser; the private key stays with them.
- Cryptographically sign each consent record with that key.
- Show that a receipt is signed and by whom (public key / identity).

## Phase 3 — On the record (proposed)

Make consent verifiable and tamper-evident — "on the record."

- Tamper-evidence (e.g. hashing / linking records so changes are detectable).
- A public verification page: anyone can check a receipt's signature is valid.
- Shareable proof of consent.

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
