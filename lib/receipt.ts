// The EIP-712 consent receipt. The user signs a structured message; that
// signature IS the verifiable consent. Anyone can later check the signature
// against the user's address without trusting us.

import { keccak256, verifyTypedData, type Hex } from "viem";

export const CONSENT_ACTION = "export_stored";

// A chain-agnostic domain (name + version only) keeps signing simple and avoids
// asking the wallet to switch networks — no on-chain transaction is involved.
export const CONSENT_DOMAIN = { name: "Myranda Consent", version: "1" } as const;

export const CONSENT_TYPES = {
  ConsentReceipt: [
    { name: "user", type: "address" },
    { name: "action", type: "string" },
    { name: "dataCategory", type: "string" },
    { name: "timestamp", type: "uint256" },
    { name: "blobHash", type: "bytes32" },
  ],
} as const;

export interface ConsentReceipt {
  user: Hex;
  action: string;
  dataCategory: string;
  timestamp: number; // unix seconds
  blobHash: Hex; // keccak256 of the encrypted blob
  signature: Hex; // the EIP-712 signature = verifiable consent
  blobId: string | null; // Walrus blob ID (set after upload)
  createdAtIso: string;
}

interface ConsentCore {
  user: Hex;
  action: string;
  dataCategory: string;
  timestamp: number;
  blobHash: Hex;
}

// keccak256 hash of the encrypted blob, used as the bytes32 field in the receipt.
export function hashBlob(bytes: Uint8Array): Hex {
  return keccak256(bytes);
}

// The exact EIP-712 payload — used identically for signing and verifying.
export function buildConsentTypedData(core: ConsentCore) {
  return {
    domain: CONSENT_DOMAIN,
    types: CONSENT_TYPES,
    primaryType: "ConsentReceipt" as const,
    message: {
      user: core.user,
      action: core.action,
      dataCategory: core.dataCategory,
      timestamp: BigInt(core.timestamp),
      blobHash: core.blobHash,
    },
  };
}

// Re-check the signature against the claimed address. Returns true iff valid.
export async function verifyReceipt(r: ConsentReceipt): Promise<boolean> {
  return verifyTypedData({
    address: r.user,
    ...buildConsentTypedData(r),
    signature: r.signature,
  });
}
