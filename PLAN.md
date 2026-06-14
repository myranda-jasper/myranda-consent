# Myranda Consent — Plan

**Tagline:** Your data. Your keys. Your consent, on the record.

Myranda Consent is an open-source project for **user-owned consent**: people
control their own data, hold their own keys, and every consent decision is
recorded in a way that is verifiable and tamper-evident.

This document is the running roadmap. Phase 0 is concrete and underway. Phases
1–3 are a proposed direction and will be refined as we go (each phase starts
from a written prompt saved in [`/prompts`](./prompts)).

---

## Phase 0 — Foundation (in progress)

Get a real, live, public project online that we can build on.

- [x] Scaffold a Next.js app (App Router) with TypeScript and Tailwind.
- [x] Landing page: title "Myranda Consent" + subtitle.
- [ ] Initialise git and create a **public** GitHub repo `myranda-consent`.
- [ ] Deploy to Vercel for a live URL.
- [ ] `PLAN.md` + `/prompts` folder (this file, and `prompts/phase-0.md`).

## Phase 1 — Consent records (proposed)

The core idea made tangible: create and view a consent "receipt."

- A form to record a consent decision (who, what data, what purpose, when).
- Store the consent record and display a clean, human-readable receipt.
- A list/history of consent records.

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
