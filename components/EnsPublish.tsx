"use client";

import { useState } from "react";
import { ENS_TEXT_KEY, type EnsIdentity } from "@/lib/ens";
import { publishBlobIdToEns, type PrivyWallet } from "@/lib/ensWrite";

// Lets a user write their latest Walrus blob ID into the ENS text record
// `me.myranda.consent`. Only shown when the connected wallet OWNS its primary
// ENS name (so we never offer a transaction that would just revert).
export default function EnsPublish({
  wallet,
  identity,
  latestBlobId,
}: {
  wallet?: PrivyWallet;
  identity: EnsIdentity | null;
  latestBlobId: string | null;
}) {
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">(
    "idle",
  );
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const ownsName =
    !!identity?.name &&
    !!identity.resolver &&
    !!identity.owner &&
    !!wallet &&
    identity.owner.toLowerCase() === wallet.address.toLowerCase();

  if (!ownsName) return null;

  async function handlePublish() {
    if (!wallet || !identity?.name || !identity.resolver || !latestBlobId) return;
    setStatus("submitting");
    setError(null);
    setTxHash(null);
    try {
      const hash = await publishBlobIdToEns({
        wallet,
        name: identity.name,
        resolver: identity.resolver,
        blobId: latestBlobId,
      });
      setTxHash(hash);
      setStatus("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setStatus("error");
    }
  }

  return (
    <section className="rounded-xl border border-amber-300 bg-amber-50 p-5 dark:border-amber-500/40 dark:bg-amber-500/10">
      <h2 className="text-lg font-semibold text-amber-900 dark:text-amber-200">
        Point your ENS name at your consent index
      </h2>
      <p className="mt-1 text-sm leading-6 text-amber-900/90 dark:text-amber-200/90">
        Write your latest Walrus blob ID into the ENS text record{" "}
        <span className="font-mono">{ENS_TEXT_KEY}</span> on{" "}
        <span className="font-medium">{identity!.name}</span>, so your ENS
        identity points to your latest consent record.
      </p>

      <dl className="mt-3 space-y-1 text-sm text-amber-900/90 dark:text-amber-200/90">
        <div className="flex justify-between gap-4">
          <dt>Key</dt>
          <dd className="font-mono text-xs">{ENS_TEXT_KEY}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>Value (latest blob ID)</dt>
          <dd className="truncate font-mono text-xs" title={latestBlobId ?? ""}>
            {latestBlobId ?? "— store an export first —"}
          </dd>
        </div>
      </dl>

      <p className="mt-3 rounded-lg bg-amber-100 p-3 text-sm font-medium text-amber-900 dark:bg-amber-500/20 dark:text-amber-100">
        ⚠️ This sends a transaction on Ethereum mainnet and costs gas (real ETH).
        Your wallet will show the fee and ask you to confirm first.
      </p>

      <button
        onClick={handlePublish}
        disabled={!latestBlobId || status === "submitting"}
        className="mt-3 inline-flex h-11 items-center rounded-full bg-amber-600 px-6 text-sm font-medium text-white transition-colors hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {status === "submitting" ? "Submitting…" : "Publish to ENS (costs gas)"}
      </button>

      {txHash && (
        <p className="mt-3 text-sm text-amber-900 dark:text-amber-200">
          Submitted:{" "}
          <a
            href={`https://etherscan.io/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono underline"
          >
            {txHash.slice(0, 14)}…
          </a>
        </p>
      )}
      {error && (
        <p className="mt-3 text-sm text-red-700 dark:text-red-300">{error}</p>
      )}
    </section>
  );
}
