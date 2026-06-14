"use client";

import { PrivyProvider } from "@privy-io/react-auth";

// The Privy App ID is a PUBLIC, client-side identifier, so it is safe to inline
// in the browser bundle (hence the NEXT_PUBLIC_ prefix).
const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;

export default function Providers({ children }: { children: React.ReactNode }) {
  // Until an App ID is configured, render the app without Privy so the site
  // (e.g. the landing page) still works. The /app page detects the missing
  // App ID and shows setup instructions instead of calling Privy hooks.
  if (!appId) {
    return <>{children}</>;
  }

  return (
    <PrivyProvider
      appId={appId}
      config={{
        // 'email' = email one-time-code login; 'wallet' = external wallets (MetaMask).
        loginMethods: ["email", "wallet"],
        appearance: {
          theme: "light",
          accentColor: "#4f46e5",
          walletList: ["metamask", "detected_wallets"],
        },
        // Give email-login users a wallet too, so they can sign as well.
        embeddedWallets: {
          ethereum: { createOnLogin: "users-without-wallets" },
        },
      }}
    >
      {children}
    </PrivyProvider>
  );
}
