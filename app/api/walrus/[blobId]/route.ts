import { NextResponse } from "next/server";

// Server-side proxy to the Walrus testnet aggregator (read path).
const AGGREGATOR =
  process.env.WALRUS_AGGREGATOR_URL ??
  "https://aggregator.walrus-testnet.walrus.space";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ blobId: string }> },
) {
  const { blobId } = await params;
  const url = `${AGGREGATOR}/v1/blobs/${encodeURIComponent(blobId)}`;

  let res: Response;
  try {
    res = await fetch(url);
  } catch (e) {
    return NextResponse.json(
      {
        error: `Could not reach the Walrus aggregator: ${
          e instanceof Error ? e.message : String(e)
        }`,
      },
      { status: 502 },
    );
  }

  if (!res.ok) {
    return NextResponse.json(
      { error: `Walrus aggregator returned ${res.status}` },
      { status: 502 },
    );
  }

  const buf = await res.arrayBuffer();
  return new NextResponse(buf, {
    status: 200,
    headers: { "content-type": "application/octet-stream" },
  });
}
