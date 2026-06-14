"use client";

import Link from "next/link";
import ConsentApp from "@/components/ConsentApp";

const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;

export default function AppPage() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-12">
      <Link
        href="/"
        className="text-sm text-zinc-500 transition-colors hover:text-zinc-800 dark:hover:text-zinc-300"
      >
        ← Myranda Consent
      </Link>

      {appId ? <ConsentApp /> : <NotConfiguredNotice />}
    </main>
  );
}

function NotConfiguredNotice() {
  return (
    <div className="mt-8 rounded-xl border border-amber-300 bg-amber-50 p-6 text-amber-900 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200">
      <h1 className="text-lg font-semibold">Almost ready — add your Privy App ID</h1>
      <p className="mt-2 text-sm leading-6">
        To enable login, put your Privy App ID in the{" "}
        <code className="rounded bg-black/10 px-1 py-0.5 dark:bg-white/10">.env.local</code>{" "}
        file as:
      </p>
      <pre className="mt-3 overflow-x-auto rounded-lg bg-black/80 p-3 text-xs text-zinc-100">
        NEXT_PUBLIC_PRIVY_APP_ID=your-app-id-here
      </pre>
      <p className="mt-3 text-sm leading-6">
        Get the App ID from{" "}
        <a
          href="https://dashboard.privy.io"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium underline"
        >
          dashboard.privy.io
        </a>
        , then restart the dev server.
      </p>
    </div>
  );
}
