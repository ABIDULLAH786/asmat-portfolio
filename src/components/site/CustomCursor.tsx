"use client";
import { useEffect, useRef } from "react";

/**
 * Custom cursor — single rAF loop drives both dot and ring.
 * Hover detection uses `elementFromPoint` once per frame instead of listening
 * to every `mouseover` (which fires hundreds of times per second on a moving
 * cursor and walks the DOM each time). All DOM writes use translate3d to keep
 * the cursor on its own GPU compositor layer.
 */
export default function CustomCursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let rx = mx;
    let ry = my;
    let raf = 0;
    let lastHoverCheck = 0;
    let isHovering = false;

    const HOVER_SELECTORS =
      "a, button, input, textarea, select, [data-cursor='hover'], [role='button']";

    const onMove = (e: MouseEvent) => {
      // Just update target coords — let the rAF loop write to the DOM.
      // (Writing in the event handler causes layout thrash and fights rAF.)
      mx = e.clientX;
      my = e.clientY;
    };

    const loop = (now: number) => {
      // Dot follows cursor exactly
      const dEl = dot.current;
      if (dEl) dEl.style.transform = `translate3d(${mx}px, ${my}px, 0) translate(-50%, -50%)`;

      // Ring lags behind with smooth easing
      rx += (mx - rx) * 0.22;
      ry += (my - ry) * 0.22;
      const rEl = ring.current;
      if (rEl) rEl.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%)`;

      // Throttled hover detection — every ~80ms is plenty for a ring grow
      if (now - lastHoverCheck > 80 && rEl) {
        lastHoverCheck = now;
        const hit = document.elementFromPoint(mx, my) as HTMLElement | null;
        const isOver = !!hit?.closest(HOVER_SELECTORS);
        if (isOver !== isHovering) {
          isHovering = isOver;
          rEl.classList.toggle("is-hovering", isOver);
        }
      }

      raf = requestAnimationFrame(loop);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    raf = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <div ref={ring} className="cursor-ring" aria-hidden />
      <div ref={dot} className="cursor-dot" aria-hidden />
    </>
  );
}
