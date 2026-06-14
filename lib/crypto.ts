// Browser-side AES-GCM encryption with a key derived from a wallet signature.
//
// No private keys are ever handled here. The only secret input is a *signature*
// that the user's wallet produces over a fixed message. Because only that wallet
// can recreate the signature, only the user can recreate the key — so only the
// user can decrypt. Nothing is stored or transmitted except ciphertext.

const ENC = new TextEncoder();
const DEC = new TextDecoder();

// The fixed message the wallet signs to produce key material (spec step 3).
export const ENCRYPTION_KEY_MESSAGE = "Myranda Consent encryption key v1";

function hexToBytes(hex: string): Uint8Array<ArrayBuffer> {
  const clean = hex.startsWith("0x") ? hex.slice(2) : hex;
  const bytes = new Uint8Array(clean.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

// Derive a 256-bit AES-GCM key from a wallet signature using HKDF-SHA256.
export async function deriveAesKeyFromSignature(
  signature: string,
): Promise<CryptoKey> {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    hexToBytes(signature),
    "HKDF",
    false,
    ["deriveKey"],
  );
  return crypto.subtle.deriveKey(
    {
      name: "HKDF",
      hash: "SHA-256",
      salt: ENC.encode("myranda-consent-salt-v1"),
      info: ENC.encode("myranda-consent-aes-gcm-v1"),
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

// Encrypt a JSON-serialisable value. Returns iv(12 bytes) || ciphertext.
export async function encryptJson(
  data: unknown,
  key: CryptoKey,
): Promise<Uint8Array<ArrayBuffer>> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const plaintext = ENC.encode(JSON.stringify(data));
  const ciphertext = new Uint8Array(
    await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, plaintext),
  );
  const out = new Uint8Array(iv.length + ciphertext.length);
  out.set(iv, 0);
  out.set(ciphertext, iv.length);
  return out;
}

// Decrypt iv||ciphertext bytes back to the original value. Throws if the key is
// wrong (e.g. a different wallet's signature) — which is exactly the point.
export async function decryptJson(
  blob: Uint8Array<ArrayBuffer>,
  key: CryptoKey,
): Promise<unknown> {
  const iv = blob.slice(0, 12);
  const ciphertext = blob.slice(12);
  const plaintext = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    ciphertext,
  );
  return JSON.parse(DEC.decode(plaintext));
}
