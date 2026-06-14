"use client";

import { useState } from "react";
import {
  ENCRYPTION_KEY_MESSAGE,
  deriveAesKeyFromSignature,
  decryptJson,
} from "@/lib/crypto";
import { verifyReceipt, type ConsentReceipt } from "@/lib/receipt";
import { getWalletClient, type SignerWallet } from "@/lib/wallet";
import { fetchBlobFromWalrus } from "@/lib/walrus";
import { EnsName } from "@/components/EnsName";

function short(s: string, head = 12, tail = 8): string {
  return s.length > head + tail + 1 ? `${s.slice(0, head)}…${s.slice(-tail)}` : s;
}

type VerifyStatus = "idle" | "checking" | "valid" | "invalid" | "error";
type FetchStatus = "idle" | "loading" | "done" | "error";

export default function ConsentHistory({
  receipts,
  wallet,
}: {
  receipts: ConsentReceipt[];
  wallet?: SignerWallet;
}) {
  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
      <h2 className="text-lg font-semibold">My consent history</h2>

      {receipts.length === 0 ? (
        <p className="mt-1 text-sm text-zinc-500">
          No consent receipts yet. Approve and store an export to create one.
        </p>
      ) : (
        <ul className="mt-4 space-y-4">
          {receipts.map((r) => (
            <ReceiptCard key={r.signature} receipt={r} wallet={wallet} />
          ))}
        </ul>
      )}
    </section>
  );
}

function ReceiptCard({
  receipt: r,
  wallet,
}: {
  receipt: ConsentReceipt;
  wallet?: SignerWallet;
}) {
  const [verify, setVerify] = useState<VerifyStatus>("idle");
  const [fetchStatus, setFetchStatus] = useState<FetchStatus>("idle");
  const [decrypted, setDecrypted] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleVerify() {
    setVerify("checking");
    try {
      const ok = await verifyReceipt(r);
      setVerify(ok ? "valid" : "invalid");
    } catch {
      setVerify("error");
    }
  }

  async function handleFetch() {
    if (!r.blobId || !wallet) return;
    setFetchStatus("loading");
    setError(null);
    try {
      // 1. Pull the encrypted blob back from Walrus.
      const bytes = await fetchBlobFromWalrus(r.blobId);
      // 2. Re-derive the key by asking the wallet to sign the fixed message
      //    again — only this user's wallet can produce the same signature.
      const walletClient = await getWalletClient(wallet);
      const signature = await walletClient.signMessage({
        account: wallet.address as `0x${string}`,
        message: ENCRYPTION_KEY_MESSAGE,
      });
      const aesKey = await deriveAesKeyFromSignature(signature);
      // 3. Decrypt. This only succeeds with the correct signature-derived key.
      const data = await decryptJson(bytes, aesKey);
      setDecrypted(JSON.stringify(data, null, 2));
      setFetchStatus("done");
    } catch (e) {
      setError(
        e instanceof Error
          ? `${e.message} (a different wallet/key cannot decrypt this)`
          : String(e),
      );
      setFetchStatus("error");
    }
  }

  return (
    <li className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
        <span className="font-medium">{r.dataCategory}</span>
        <span className="text-zinc-500">
          {new Date(r.createdAtIso).toLocaleString()}
        </span>
      </div>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        <EnsName address={r.user} prefix="Signed by " />
      </p>
      <p className="mt-1 text-xs text-zinc-500">
        Walrus blob ID:{" "}
        <span className="font-mono" title={r.blobId ?? ""}>
          {r.blobId ? short(r.blobId) : "not stored"}
        </span>
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          onClick={handleVerify}
          className="rounded-full border border-zinc-300 px-4 py-1.5 text-sm font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
        >
          {verify === "checking" ? "Verifying…" : "Verify"}
        </button>
        <button
          onClick={handleFetch}
          disabled={!r.blobId || !wallet || fetchStatus === "loading"}
          className="rounded-full border border-zinc-300 px-4 py-1.5 text-sm font-medium transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
        >
          {fetchStatus === "loading" ? "Fetching…" : "Fetch from Walrus"}
        </button>
      </div>

      {(verify === "valid" || verify === "invalid" || verify === "error") && (
        <p
          className={`mt-2 text-sm font-medium ${
            verify === "valid"
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-red-600 dark:text-red-400"
          }`}
        >
          {verify === "valid" &&
            "✓ Signature valid — consent confirmed for this address."}
          {verify === "invalid" && "✗ Signature does not match this address."}
          {verify === "error" && "Could not verify this signature."}
        </p>
      )}

      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      {decrypted && (
        <div className="mt-3">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Decrypted with your signature-derived key
          </p>
          <pre className="mt-2 max-h-60 overflow-auto rounded-lg bg-zinc-900 p-4 text-xs leading-5 text-zinc-100">
            {decrypted}
          </pre>
        </div>
      )}
    </li>
  );
}
