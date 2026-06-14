// Build a viem WalletClient from a Privy wallet's EIP-1193 provider.
// All signing happens in the browser through the user's wallet; no private
// keys are ever exposed to this code.

import {
  createWalletClient,
  custom,
  type EIP1193Provider,
  type WalletClient,
} from "viem";

interface SignerWallet {
  address: string;
  getEthereumProvider: () => Promise<unknown>;
}

export async function getWalletClient(
  wallet: SignerWallet,
): Promise<WalletClient> {
  const provider = (await wallet.getEthereumProvider()) as EIP1193Provider;
  return createWalletClient({
    account: wallet.address as `0x${string}`,
    transport: custom(provider),
  });
}
