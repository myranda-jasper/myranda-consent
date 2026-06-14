// Client-side helpers that talk to our own /api/walrus proxy (which forwards to
// the Walrus testnet publisher/aggregator).

export async function storeBlobOnWalrus(
  bytes: Uint8Array<ArrayBuffer>,
): Promise<string> {
  const res = await fetch("/api/walrus/store", {
    method: "POST",
    headers: { "content-type": "application/octet-stream" },
    body: bytes,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.error ?? `Walrus upload failed (${res.status})`);
  }
  return data.blobId as string;
}

export async function fetchBlobFromWalrus(
  blobId: string,
): Promise<Uint8Array<ArrayBuffer>> {
  const res = await fetch(`/api/walrus/${encodeURIComponent(blobId)}`);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.error ?? `Walrus fetch failed (${res.status})`);
  }
  const buf = await res.arrayBuffer();
  return new Uint8Array(buf);
}
