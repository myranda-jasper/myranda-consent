"use client";

import { useEnsIdentity } from "@/lib/ens";

function short(s: string, head = 12, tail = 8): string {
  return s.length > head + tail + 1 ? `${s.slice(0, head)}…${s.slice(-tail)}` : s;
}

// Shows "Signed by name.eth" with the avatar when the address has a primary ENS
// name, otherwise the shortened address with a small note.
export function EnsName({
  address,
  prefix = "",
}: {
  address: string;
  prefix?: string;
}) {
  const { identity } = useEnsIdentity(address);

  if (identity?.name) {
    return (
      <span className="inline-flex items-center gap-2">
        {identity.avatar && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={identity.avatar}
            alt=""
            className="h-5 w-5 rounded-full object-cover"
          />
        )}
        <span>
          {prefix}
          <span className="font-medium">{identity.name}</span>
        </span>
      </span>
    );
  }

  return (
    <span>
      {prefix}
      <span className="font-mono text-xs sm:text-sm">{short(address)}</span>
      <span className="ml-1 text-xs text-zinc-500">(no ENS name set)</span>
    </span>
  );
}
