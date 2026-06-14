"use client";

import { usePrivy, useWallets } from "@privy-io/react-auth";

export default function ConsentApp() {
  const { ready, authenticated, user, login, logout } = usePrivy();
  const { wallets } = useWallets();

  // The wallet we will use for signing: prefer the user's primary linked
  // wallet, otherwise the first connected wallet (email users get an
  // embedded wallet created on login).
  const activeWallet =
    wallets.find((w) => w.address === user?.wallet?.address) ?? wallets[0];

  if (!ready) {
    return (
      <p className="mt-10 text-sm text-zinc-500">Loading…</p>
    );
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

      {/* The approve-and-store flow is added in the next step. */}
    </div>
  );
}
