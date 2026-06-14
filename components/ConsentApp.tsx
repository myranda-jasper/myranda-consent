"use client";

import { useState } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import {
  DATA_CATEGORY,
  makeSampleExport,
  type SampleExport,
} from "@/lib/sampleData";
import {
  ENCRYPTION_KEY_MESSAGE,
  deriveAesKeyFromSignature,
  encryptJson,
} from "@/lib/crypto";
import {
  CONSENT_ACTION,
  buildConsentTypedData,
  hashBlob,
  type ConsentReceipt,
} from "@/lib/receipt";
import { getWalletClient } from "@/lib/wallet";
import { storeBlobOnWalrus } from "@/lib/walrus";
import ConsentHistory from "@/components/ConsentHistory";

function previewHex(bytes: Uint8Array, n = 48): string {
  return Array.from(bytes.slice(0, n))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export default function ConsentApp() {
  const { ready, authenticated, user, login, logout } = usePrivy();
  const { wallets } = useWallets();

  // The wallet we will use for signing: prefer the user's primary linked
  // wallet, otherwise the first connected wallet (email users get an
  // embedded wallet created on login).
  const activeWallet =
    wallets.find((w) => w.address === user?.wallet?.address) ?? wallets[0];

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusLog, setStatusLog] = useState<string[]>([]);
  const [sampleData, setSampleData] = useState<SampleExport | null>(null);
  const [encrypted, setEncrypted] = useState<Uint8Array | null>(null);
  // Receipt list lives in app state for now (spec step 5).
  const [receipts, setReceipts] = useState<ConsentReceipt[]>([]);

  function pushStatus(msg: string) {
    setStatusLog((log) => [...log, msg]);
  }

  async function runFlow() {
    if (!activeWallet) {
      setError("Your wallet isn't ready yet — give it a moment and try again.");
      return;
    }
    setBusy(true);
    setError(null);
    setStatusLog([]);
    setSampleData(null);
    setEncrypted(null);

    try {
      // Step 2 — generate the data export that we will protect.
      pushStatus("Generating a sample data export…");
      const data = makeSampleExport(activeWallet.address);
      setSampleData(data);

      // Step 3 — derive an AES key from a wallet signature, then encrypt.
      pushStatus("Asking your wallet to sign the encryption-key message…");
      const walletClient = await getWalletClient(activeWallet);
      const signature = await walletClient.signMessage({
        account: activeWallet.address as `0x${string}`,
        message: ENCRYPTION_KEY_MESSAGE,
      });

      pushStatus("Deriving your AES-GCM key from that signature…");
      const key = await deriveAesKeyFromSignature(signature);

      pushStatus("Encrypting your export in the browser…");
      const encryptedBytes = await encryptJson(data, key);
      setEncrypted(encryptedBytes);
      pushStatus(
        `Encrypted ${encryptedBytes.length} bytes. Only your wallet can decrypt this.`,
      );

      // Step 4 — build and sign an EIP-712 consent receipt.
      pushStatus("Hashing the encrypted blob and building your consent receipt…");
      const blobHash = hashBlob(encryptedBytes);
      const timestamp = Math.floor(Date.now() / 1000);

      pushStatus("Asking your wallet to sign the consent receipt (EIP-712)…");
      const consentSignature = await walletClient.signTypedData({
        account: activeWallet.address as `0x${string}`,
        ...buildConsentTypedData({
          user: activeWallet.address as `0x${string}`,
          action: CONSENT_ACTION,
          dataCategory: DATA_CATEGORY,
          timestamp,
          blobHash,
        }),
      });

      const signedReceipt: ConsentReceipt = {
        user: activeWallet.address as `0x${string}`,
        action: CONSENT_ACTION,
        dataCategory: DATA_CATEGORY,
        timestamp,
        blobHash,
        signature: consentSignature,
        blobId: null,
        createdAtIso: new Date().toISOString(),
      };
      setReceipts((rs) => [signedReceipt, ...rs]);
      pushStatus(
        "Consent receipt signed — this signature is your verifiable consent.",
      );

      // Step 5 — upload the encrypted blob to Walrus and record the blob ID.
      pushStatus("Uploading the encrypted blob to Walrus (testnet)…");
      const blobId = await storeBlobOnWalrus(encryptedBytes);
      setReceipts((rs) =>
        rs.map((x) =>
          x.signature === signedReceipt.signature ? { ...x, blobId } : x,
        ),
      );
      pushStatus(`Stored on Walrus. Blob ID: ${blobId}`);
      pushStatus("Done. See it in your consent history below.");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  if (!ready) {
    return <p className="mt-10 text-sm text-zinc-500">Loading…</p>;
  }

  if (!authenticated) {
    return (
      <div className="mt-8">
        <h1 className="text-2xl font-semibold tracking-tight">Consent console</h1>
        <p className="mt-2 max-w-md text-zinc-600 dark:text-zinc-400">
          Log in to approve and store an encrypted data export, and to create a
          verifiable, signed consent receipt.
        </p>
        <button
          onClick={login}
          className="mt-6 inline-flex h-11 items-center rounded-full bg-indigo-600 px-6 text-sm font-medium text-white transition-colors hover:bg-indigo-500"
        >
          Log in with email or MetaMask
        </button>
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Consent console</h1>
          <p className="mt-1 text-sm text-zinc-500">You are logged in.</p>
        </div>
        <button
          onClick={logout}
          className="shrink-0 rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
        >
          Log out
        </button>
      </header>

      <section className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="text-sm font-medium text-zinc-500">Your identity</h2>
        <dl className="mt-3 space-y-2 text-sm">
          {user?.email?.address && (
            <Row label="Email" value={user.email.address} />
          )}
          <Row
            label="Wallet"
            value={activeWallet?.address ?? "preparing your wallet…"}
            mono
          />
        </dl>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="text-lg font-semibold">Approve and store an export</h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          We&apos;ll generate a small sample data export, then encrypt it in your
          browser with a key only your wallet can recreate.
        </p>

        <div className="mt-4 rounded-lg border border-indigo-200 bg-indigo-50 p-4 text-sm leading-6 text-indigo-900 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-200">
          <p className="font-medium">How this stays private</p>
          <p className="mt-1">
            Your encryption key is rebuilt from a signature only your wallet can
            produce — it signs the fixed message{" "}
            <span className="font-mono text-xs">
              &ldquo;{ENCRYPTION_KEY_MESSAGE}&rdquo;
            </span>
            . The key is never stored or sent anywhere. Because only your wallet
            can recreate that signature, only you can decrypt this data — not us,
            not Walrus, no one else.
          </p>
        </div>

        <button
          onClick={runFlow}
          disabled={busy || !activeWallet}
          className="mt-4 inline-flex h-11 items-center rounded-full bg-indigo-600 px-6 text-sm font-medium text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? "Working…" : "Approve and store an export"}
        </button>

        {statusLog.length > 0 && (
          <ul className="mt-4 space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
            {statusLog.map((msg, i) => (
              <li key={i}>• {msg}</li>
            ))}
          </ul>
        )}

        {error && (
          <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300">
            {error}
          </p>
        )}

        {sampleData && (
          <div className="mt-4">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              Sample export (plaintext, before encryption)
            </p>
            <pre className="mt-2 max-h-60 overflow-auto rounded-lg bg-zinc-900 p-4 text-xs leading-5 text-zinc-100">
              {JSON.stringify(sampleData, null, 2)}
            </pre>
          </div>
        )}

        {encrypted && (
          <div className="mt-4">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              Encrypted blob ({encrypted.length} bytes) — unreadable without your key
            </p>
            <pre className="mt-2 overflow-auto rounded-lg bg-zinc-900 p-4 text-xs leading-5 text-emerald-300">
              {previewHex(encrypted)}…
            </pre>
          </div>
        )}
      </section>

      <ConsentHistory receipts={receipts} wallet={activeWallet} />
    </div>
  );
}

function Row({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-zinc-500">{label}</dt>
      <dd className={mono ? "font-mono text-xs sm:text-sm" : "font-medium"}>
        {value}
      </dd>
    </div>
  );
}
