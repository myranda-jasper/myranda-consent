import { NextResponse } from "next/server";

// Server-side proxy to the Walrus testnet publisher. Keeping the upload on the
// server avoids browser CORS/rate-limit coupling and lets us swap endpoints via
// env. The blob we receive is already encrypted, so the server never sees
// readable data.
const PUBLISHER =
  process.env.WALRUS_PUBLISHER_URL ??
  "https://publisher.walrus-testnet.walrus.space";
const EPOCHS = process.env.WALRUS_EPOCHS ?? "5";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Give the Walrus upload room to finish on serverless infrastructure.
export const maxDuration = 60;

export async function POST(req: Request) {
  const body = await req.arrayBuffer();
  if (!body || body.byteLength === 0) {
    return NextResponse.json({ error: "Empty body" }, { status: 400 });
  }

  const url = `${PUBLISHER}/v1/blobs?epochs=${encodeURIComponent(EPOCHS)}`;

  let res: Response;
  try {
    res = await fetch(url, {
      method: "PUT",
      headers: { "content-type": "application/octet-stream" },
      body,
    });
  } catch (e) {
    return NextResponse.json(
      {
        error: `Could not reach the Walrus publisher: ${
          e instanceof Error ? e.message : String(e)
        }`,
      },
      { status: 502 },
    );
  }

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    return NextResponse.json(
      { error: `Walrus publisher returned ${res.status}`, detail },
      { status: 502 },
    );
  }

  const data = await res.json();
  // blobId lives at newlyCreated.blobObject.blobId (first store) OR
  // alreadyCertified.blobId (identical blob already on Walrus).
  const blobId: string | undefined =
    data?.newlyCreated?.blobObject?.blobId ?? data?.alreadyCertified?.blobId;

  if (!blobId) {
    return NextResponse.json(
      { error: "No blobId found in the Walrus response", raw: data },
      { status: 502 },
    );
  }

  return NextResponse.json({ blobId });
}
