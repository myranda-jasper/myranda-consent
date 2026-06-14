# Phase 5 — Prompt

> Saved verbatim. Visual polish only — animated background.

---

Continue myranda-consent. Standing rules as before (small commits, push, plain
English, tell me when to act). Save this as prompts/phase-5-polish.md.

Phase 5, visual polish only. Add a premium, interactive animated background to
make the app look high-end (Awwwards-style), WITHOUT touching any of the existing
wallet, encryption, signing, Walrus, or ENS logic.

Hard constraints:
1. ISOLATION: build it as a single, self-contained, fixed full-screen background
   component that renders BEHIND all existing content. It must not modify or wrap
   the consent flow logic. If it breaks, I want to be able to revert just this one
   commit and have the working app back.
2. NEXT.JS SAFETY: this is the App Router. Make it a client component, guard all
   window/document/canvas access, and dynamically import with ssr:false if needed
   so there are no hydration or SSR errors.
3. PERFORMANCE: I'm on a CPU-only 2019 Intel MacBook Pro, so it must stay smooth.
   Keep it lightweight, cap the frame rate, pause animation when the tab is
   hidden, and respect prefers-reduced-motion (show a static version for users who
   want reduced motion). Prefer a GPU-cheap technique (an animated mesh/aurora
   gradient, a subtle flow field, or a light mouse-reactive particle/constellation
   layer). Only use WebGL/Three.js if it stays at a smooth frame rate with low
   CPU; otherwise use canvas 2D or animated CSS/SVG.
4. ON-BRAND: dark purple palette matching the existing UI and logo (deep purple
   background, purple-to-pink accents like #8b3fd9 to #d96fd9). Subtle and
   elegant, not garish. A faint lock or key or "signal" motif is a nice touch but
   optional.
5. READABILITY: all existing text and cards must stay clearly legible. Add a
   subtle overlay or contrast layer behind content if needed.

Do this in ONE clean commit so it's easy to revert. Don't over-iterate, one
strong effect is enough.

When done: run the FULL existing flow locally (login, Approve and store an
export, Verify, Fetch from Walrus) to confirm nothing broke, then redeploy.
Confirm the live URL still returns 200 and the consent flow still works, and give
me the updated live URL.
