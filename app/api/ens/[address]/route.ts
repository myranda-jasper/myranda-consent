import { NextResponse } from "next/server";
import {
  createPublicClient,
  http,
  namehash,
  isAddress,
  getAddress,
} from "viem";
import { mainnet } from "viem/chains";

// Reads only. A public mainnet RPC is enough for ENS resolution.
const RPC = process.env.MAINNET_RPC_URL ?? "https://ethereum-rpc.publicnode.com";

const ENS_REGISTRY = "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e";
const REGISTRY_ABI = [
  {
    type: "function",
    name: "owner",
    stateMutability: "view",
    inputs: [{ name: "node", type: "bytes32" }],
    outputs: [{ name: "", type: "address" }],
  },
] as const;

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const client = createPublicClient({ chain: mainnet, transport: http(RPC) });

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ address: string }> },
) {
  const { address } = await params;
  if (!isAddress(address)) {
    return NextResponse.json({ error: "Invalid address" }, { status: 400 });
  }
  const addr = getAddress(address);

  try {
    const name = await client.getEnsName({ address: addr });
    if (!name) {
      return NextResponse.json({
        name: null,
        avatar: null,
        resolver: null,
        owner: null,
      });
    }

    // Forward-verify: the primary name must resolve back to this address,
    // otherwise it could be a spoofed reverse record.
    const forward = await client.getEnsAddress({ name }).catch(() => null);
    if (!forward || getAddress(forward) !== addr) {
      return NextResponse.json({
        name: null,
        avatar: null,
        resolver: null,
        owner: null,
      });
    }

    const [avatar, resolver, owner] = await Promise.all([
      client.getEnsAvatar({ name }).catch(() => null),
      client.getEnsResolver({ name }).catch(() => null),
      client
        .readContract({
          address: ENS_REGISTRY,
          abi: REGISTRY_ABI,
          functionName: "owner",
          args: [namehash(name)],
        })
        .catch(() => null),
    ]);

    return NextResponse.json({
      name,
      avatar,
      resolver,
      owner: owner ? getAddress(owner) : null,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "ENS lookup failed" },
      { status: 502 },
    );
  }
}
