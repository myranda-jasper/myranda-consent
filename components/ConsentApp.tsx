"use client";

import { useState } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { makeSampleExport, type SampleExport } from "@/lib/sampleData";

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

    try {
      // Step 2 — generate the data export that we will protect.
      pushStatus("Generating a sample data export…");
      const data = makeSampleExport(activeWallet.address);
      setSampleData(data);
      pushStatus("Export ready.");
      // Next steps (encryption, signed receipt, Walrus upload) are added below.
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
            <div className="flex justify-between gap-4">
              <dt className="text-zinc-500">Email</dt>
              <dd className="font-medium">{user.email.address}</dd>
            </div>
          )}
          <div className="flex justify-between gap-4">
            <dt className="text-zinc-500">Wallet</dt>
            <dd className="font-mono text-xs sm:text-sm">
              {activeWallet?.address ?? "preparing your wallet…"}
            </dd>
          </div>
        </dl>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="text-lg font-semibold">Approve and store an export</h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          We&apos;ll generate a small sample data export that stands in for your
          real exported data.
        </p>
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
              Sample export
            </p>
            <pre className="mt-2 max-h-72 overflow-auto rounded-lg bg-zinc-900 p-4 text-xs leading-5 text-zinc-100">
              {JSON.stringify(sampleData, null, 2)}
            </pre>
          </div>
        )}
      </section>
    </div>
  );
}
