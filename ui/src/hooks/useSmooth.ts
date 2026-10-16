import { useEffect, useRef, useState } from 'react';

const commonPrefixLength = (a: string, b: string) => {
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i += 1;
  return i;
};

interface SmoothTextOptions {
  // Minimum reveal speed; it speeds up automatically to clear any backlog within catchUpSeconds
  charsPerSecond?: number;
  catchUpSeconds?: number;
  // Cap re-renders for expensive consumers (e.g. markdown)
  maxFps?: number;
}

/**
 * Reveals streamed text at a steady pace instead of in network-sized bursts.
 * Returns the visible text and whether it is still catching up to the target.
 */
export const useSmoothText = (
  target: string,
  { charsPerSecond = 90, catchUpSeconds = 0.6, maxFps = 60 }: SmoothTextOptions = {}
) => {
  const [shown, setShown] = useState('');
  const shownRef = useRef('');
  const carryRef = useRef(0);

  useEffect(() => {
    let frame = 0;
    let lastTick = performance.now();
    let lastRender = 0;
    const minFrameMs = 1000 / maxFps;

    const tick = (now: number) => {
      let current = shownRef.current;
      // Target was rewritten (not just extended): keep only the part that still matches
      if (!target.startsWith(current)) {
        current = current.slice(0, commonPrefixLength(current, target));
      }

      const backlog = target.length - current.length;
      const elapsed = (now - lastTick) / 1000;
      lastTick = now;

      if (backlog > 0) {
        const rate = Math.max(charsPerSecond, backlog / catchUpSeconds);
        carryRef.current += rate * elapsed;
        const step = Math.min(backlog, Math.floor(carryRef.current));
        carryRef.current -= step;
        current = target.slice(0, current.length + step);
      }

      const done = current.length === target.length;
      if (current !== shownRef.current && (done || now - lastRender >= minFrameMs)) {
        shownRef.current = current;
        lastRender = now;
        setShown(current);
      }
      if (!done || current !== shownRef.current) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, charsPerSecond, catchUpSeconds, maxFps]);

  return { text: shown, isRevealing: shown.length < target.length };
};

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

/** Animates a number from its previous value (0 on mount) to the new one. */
export const useCountUp = (value: number, durationMs = 700) => {
  const [display, setDisplay] = useState(0);
  const displayRef = useRef(0);

  useEffect(() => {
    const from = displayRef.current;
    if (from === value) return;
    const start = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / durationMs);
      const next = Math.round(from + (value - from) * easeOutCubic(progress));
      if (next !== displayRef.current) {
        displayRef.current = next;
        setDisplay(next);
      }
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, durationMs]);

  return display;
};
