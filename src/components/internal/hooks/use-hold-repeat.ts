'use client';

import { useEffect, useRef } from 'react';
import type { PointerEvent } from 'react';

const FIRST_REPEAT_MS = 400;
const FASTEST_REPEAT_MS = 40;
const ACCELERATION = 0.8;

export function useHoldRepeat(onStep: (direction: 1 | -1) => boolean) {
  const stepRef = useRef(onStep);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const repeatedRef = useRef(false);

  useEffect(() => {
    stepRef.current = onStep;
  });

  const stop = () => clearTimeout(timerRef.current);
  useEffect(() => stop, []);

  return (direction: 1 | -1) => ({
    onPointerDown: (e: PointerEvent) => {
      if (e.button !== 0) return;
      repeatedRef.current = false;
      let delay = FIRST_REPEAT_MS;
      const tick = () => {
        repeatedRef.current = true;
        if (!stepRef.current(direction)) return;
        delay = Math.max(FASTEST_REPEAT_MS, delay * ACCELERATION);
        timerRef.current = setTimeout(tick, delay);
      };
      timerRef.current = setTimeout(tick, delay);
    },
    onPointerUp: stop,
    onPointerLeave: stop,
    onPointerCancel: stop,
    onClick: () => {
      if (!repeatedRef.current) stepRef.current(direction);
      repeatedRef.current = false;
    },
  });
}
