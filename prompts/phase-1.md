# Phase 1 — Prompt

> Saved verbatim. The core consent flow.

---

Continue the myranda-consent project. Standing rules as before (small commits,
push, PLAN.md, /prompts, plain English, tell me when to act). Save this as
prompts/phase-1.md.

Phase 1, the core flow. Commit after each numbered step.

1. Add Privy auth (@privy-io/react-auth). I will paste my Privy App ID into an
   env file. Tell me the exact env var name. Support login with email and with
   an external wallet (MetaMask).

2. Build a page with a button "Approve and store an export". For the demo,
   generate a small sample JSON object that stands in for the user's exported
   data.

3. Encrypt that JSON in the browser with AES-GCM. Derive the encryption key from
   a wallet signature: ask the user's wallet to sign a fixed message ("Myranda
   Consent encryption key v1"), then derive the AES key from that signature with
   a KDF. In plain words on screen, explain that this means only the user's own
   wallet can recreate the key, so only they can decrypt.

4. Create a signed consent receipt using EIP-712. Fields: user address, action
   ("export_stored"), data category, timestamp, and the hash of the encrypted
   blob. Ask the user to sign it. This signature is the verifiable consent.

5. Upload the encrypted blob to Walrus. Read the CURRENT Walrus testnet
   publisher and aggregator endpoints from the Walrus docs (do not assume old
   URLs), PUT the blob, and get back the blob ID. Keep the receipt list in app
   state for now.

6. Add a "My consent history" view listing each receipt: date, category, Walrus
   blob ID, a "Verify" button that re-checks the signature against the address
   and shows valid or not, and a "Fetch from Walrus" button that GETs the blob
   back and shows it only decrypts with the user's signature-derived key.

Use viem for signing and hashing. No private keys anywhere in the code;
everything is signed in my browser. When done, tell me to test the full flow and
confirm both Verify and Fetch-from-Walrus work, then redeploy to Vercel.
