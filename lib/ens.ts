"use client";

import { useEffect, useState } from "react";

// ENS text-record key under which a user can publish their latest blob ID.
export const ENS_TEXT_KEY = "me.myranda.consent";

export interface EnsIdentity {
  name: string | null;
  avatar: string | null;
  resolver: string | null;
  owner: string | null;
}

const EMPTY: EnsIdentity = {
  name: null,
  avatar: null,
  resolver: null,
  owner: null,
};

// Cache by address so multiple receipts from the same signer share one lookup.
const cache = new Map<string, Promise<EnsIdentity>>();

export function fetchEnsIdentity(address: string): Promise<EnsIdentity> {
  const key = address.toLowerCase();
  const cached = cache.get(key);
  if (cached) return cached;

  const p = fetch(`/api/ens/${address}`)
    .then(async (res) => {
      if (!res.ok) return EMPTY;
      return (await res.json()) as EnsIdentity;
    })
    .catch(() => EMPTY);

  cache.set(key, p);
  return p;
}

export function useEnsIdentity(address?: string) {
  const [identity, setIdentity] = useState<EnsIdentity | null>(null);

  useEffect(() => {
    if (!address) return;
    let active = true;
    fetchEnsIdentity(address).then((id) => {
      if (active) setIdentity(id);
    });
    return () => {
      active = false;
    };
  }, [address]);

  return { identity };
}
