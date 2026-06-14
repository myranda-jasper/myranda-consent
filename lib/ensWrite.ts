"use client";

import {
  createWalletClient,
  custom,
  namehash,
  type EIP1193Provider,
} from "viem";
import { mainnet } from "viem/chains";
import type { SignerWallet } from "@/lib/wallet";
import { ENS_TEXT_KEY } from "@/lib/ens";

const RESOLVER_ABI = [
  {
    type: "function",
    name: "setText",
    stateMutability: "nonpayable",
    inputs: [
      { name: "node", type: "bytes32" },
      { name: "key", type: "string" },
      { name: "value", type: "string" },
    ],
    outputs: [],
  },
] as const;

export interface PrivyWallet extends SignerWallet {
  switchChain?: (chainId: number) => Promise<void>;
}

// Writes the blob ID into the ENS text record on the name's resolver. This is a
// mainnet transaction (costs gas) and must be signed by the name's owner.
export async function publishBlobIdToEns(opts: {
  wallet: PrivyWallet;
  name: string;
  resolver: string;
  blobId: string;
}): Promise<`0x${string}`> {
  const { wallet, name, resolver, blobId } = opts;

  // ENS lives on Ethereum mainnet — make sure the wallet is there.
  if (wallet.switchChain) {
    await wallet.switchChain(mainnet.id);
  }

  const provider = (await wallet.getEthereumProvider()) as EIP1193Provider;
  const walletClient = createWalletClient({
    account: wallet.address as `0x${string}`,
    chain: mainnet,
    transport: custom(provider),
  });

  return walletClient.writeContract({
    address: resolver as `0x${string}`,
    abi: RESOLVER_ABI,
    functionName: "setText",
    args: [namehash(name), ENS_TEXT_KEY, blobId],
    account: wallet.address as `0x${string}`,
    chain: mainnet,
  });
}
