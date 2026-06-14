"use client";

import { useEffect, useRef } from "react";

// A lightweight, GPU-cheap "aurora": a few soft purple→pink glows that drift and
// gently react to the mouse. Rendered at a low internal resolution and upscaled
// by CSS for a soft look. Self-contained: it touches nothing but its own canvas.
export default function AuroraBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || typeof window === "undefined") return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;
    const cv = canvas; // non-null binding for use inside nested closures

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    // Internal buffer resolution factor (kept small — blurry glows don't need
    // full resolution, and the upscale adds a soft, premium look cheaply).
    const SCALE = 0.42;
    let w = 0;
    let h = 0;

    const palette: [number, number, number][] = [
      [139, 63, 217], // #8b3fd9 purple
      [217, 111, 217], // #d96fd9 pink
      [96, 41, 176], // deep violet
      [123, 47, 207], // mid purple
      [176, 84, 214], // light orchid
    ];

    type Blob = {
      bx: number;
      by: number;
      r: number;
      color: [number, number, number];
      sx: number;
      sy: number;
      ax: number;
      ay: number;
    };
    let blobs: Blob[] = [];

    function setup() {
      w = Math.max(1, Math.floor(window.innerWidth * SCALE));
      h = Math.max(1, Math.floor(window.innerHeight * SCALE));
      cv.width = w;
      cv.height = h;

      // Glows pushed toward the corners/edges so the centre (where content
      // sits) stays deep and calm. [xFrac, yFrac, rFrac, color]
      const defs: [number, number, number, [number, number, number]][] = [
        [0.18, 0.14, 0.42, palette[0]],
        [0.84, 0.2, 0.4, palette[1]],
        [0.14, 0.9, 0.38, palette[2]],
        [0.88, 0.84, 0.42, palette[3]],
        [0.5, 0.04, 0.32, palette[4]],
      ];
      blobs = defs.map(([xf, yf, rf, color], i) => ({
        color,
        bx: xf * w,
        by: yf * h,
        r: rf * Math.max(w, h),
        sx: 0.00005 + i * 0.000015,
        sy: 0.00007 + i * 0.000012,
        ax: (0.05 + 0.025 * (i % 3)) * w,
        ay: (0.04 + 0.025 * (i % 2)) * h,
      }));
    }

    // Smoothed mouse position, normalised to roughly -1..1 from centre.
    let targetMX = 0;
    let targetMY = 0;
    let mx = 0;
    let my = 0;
    function onPointer(e: PointerEvent) {
      targetMX = (e.clientX / window.innerWidth) * 2 - 1;
      targetMY = (e.clientY / window.innerHeight) * 2 - 1;
    }

    function draw(t: number) {
      if (!ctx) return;
      // base vertical gradient
      ctx.globalCompositeOperation = "source-over";
      const bg = ctx.createLinearGradient(0, 0, 0, h);
      bg.addColorStop(0, "#160a26");
      bg.addColorStop(1, "#0b0416");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      mx += (targetMX - mx) * 0.05;
      my += (targetMY - my) * 0.05;

      // additive glows
      ctx.globalCompositeOperation = "lighter";
      for (let i = 0; i < blobs.length; i++) {
        const b = blobs[i];
        const depth = (i + 1) / blobs.length;
        const cx = b.bx + Math.sin(t * b.sx + i) * b.ax + mx * 0.06 * w * depth;
        const cy =
          b.by + Math.cos(t * b.sy + i * 1.3) * b.ay + my * 0.06 * h * depth;
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, b.r);
        const [r, gr, bl] = b.color;
        g.addColorStop(0, `rgba(${r},${gr},${bl},0.22)`);
        g.addColorStop(0.5, `rgba(${r},${gr},${bl},0.06)`);
        g.addColorStop(1, `rgba(${r},${gr},${bl},0)`);
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
      }

      // vignette for edge contrast / readability
      ctx.globalCompositeOperation = "source-over";
      const vig = ctx.createRadialGradient(
        w / 2,
        h * 0.5,
        Math.min(w, h) * 0.32,
        w / 2,
        h * 0.5,
        Math.max(w, h) * 0.85,
      );
      vig.addColorStop(0, "rgba(0,0,0,0)");
      vig.addColorStop(1, "rgba(6,2,12,0.4)");
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, w, h);
    }

    let raf = 0;
    let last = 0;
    const interval = 1000 / 30; // cap at ~30fps

    function loop(now: number) {
      raf = requestAnimationFrame(loop);
      if (now - last < interval) return;
      last = now;
      draw(now);
    }

    setup();
    if (reduceMotion) {
      draw(0);
    } else {
      window.addEventListener("pointermove", onPointer, { passive: true });
      raf = requestAnimationFrame(loop);
    }

    function onResize() {
      setup();
      if (reduceMotion) draw(0);
    }
    window.addEventListener("resize", onResize);

    function onVisibility() {
      if (document.hidden) {
        if (raf) cancelAnimationFrame(raf);
        raf = 0;
      } else if (!reduceMotion && raf === 0) {
        last = 0;
        raf = requestAnimationFrame(loop);
      }
    }
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        zIndex: -10,
        pointerEvents: "none",
        display: "block",
      }}
    />
  );
}
