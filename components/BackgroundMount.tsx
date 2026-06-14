"use client";

import dynamic from "next/dynamic";

// Client-only mount: no SSR so there are zero hydration/SSR concerns.
const AuroraBackground = dynamic(() => import("./AuroraBackground"), {
  ssr: false,
});

export default function BackgroundMount() {
  return <AuroraBackground />;
}
