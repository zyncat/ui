'use client';

import { useLayoutEffect, useRef, type EffectCallback, type RefObject } from 'react';

import {
  animate,
  dropShared,
  keepShared,
  measure,
  offscreen,
  readShared,
  type Box,
  type FlipOptions,
  type Playback,
} from '../engine';
import { flipLayers } from '../engine/flip';
import { sharedSlot } from '../shared-slot';
import { UIMotion } from '../tokens/motion-tokens';
import { beforePaint } from './before-paint';

export interface FlipTuning extends FlipOptions {
  /** Keep the element that last held the `layoutId` on screen through the handoff: a copy of it takes the same path and fades out while this one fades in. */
  crossfade?: boolean;
}

const SAME_BOX_PX = 0.5;

const sharedOwner = sharedSlot('motion.flip-owner@1', () => new Map<string, HTMLElement>());

let loadedCrossfade: typeof import('./crossfade') | null = null;

const loadCrossfade = (): void => {
  if (!loadedCrossfade) void import('./crossfade').then((module) => (loadedCrossfade = module));
};

const usable = (box: Box | null): box is Box => !!box && box.width > 0 && box.height > 0;

const sameBox = (a: Box, b: Box): boolean =>
  (['left', 'top', 'width', 'height'] as const).every((side) => Math.abs(a[side] - b[side]) < SAME_BOX_PX);

export function useFlip<T extends HTMLElement>(
  sharedId: string | null,
  tuning: FlipTuning & { offscreenMargin?: number } = {},
  inPlace: boolean,
): { ref: RefObject<T | null>; play: EffectCallback } {
  const ref = useRef<T | null>(null);
  const playing = useRef<{ play: Playback; el: T } | null>(null);
  const superseded = useRef<Playback | null>(null);
  const queued = useRef<object | null>(null);
  const held = useRef<string | null>(null);
  const interrupted = useRef<Box | null>(null);
  const origin = useRef<Box | null>(null);
  const latest = useRef(tuning);
  latest.current = tuning;
  const { size, timing, crossfade, offscreenMargin } = tuning;
  const enabled = inPlace || sharedId !== null;
  const lastCommitted = ref.current && (inPlace || playing.current) ? measure(ref.current) : null;

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;
    if (crossfade) loadCrossfade();
    const live = playing.current;
    const midFlight = live?.el === el;
    const moved = !!lastCommitted && !sameBox(lastCommitted, measure(el));
    if (midFlight && !moved) return;
    let from = moved ? lastCommitted : null;
    if (sharedId !== null && !midFlight) {
      if (interrupted.current) from = interrupted.current;
      else if (sharedOwner.get(sharedId) !== el) from = readShared(sharedId);
    }
    superseded.current = live?.play ?? null;
    playing.current = null;
    interrupted.current = null;
    if (sharedId !== null) {
      keepShared(sharedId, measure(el));
      sharedOwner.set(sharedId, el);
    }
    origin.current ??= from;
  });

  useLayoutEffect(() => {
    if (sharedId === null) return;
    held.current = sharedId;
    return () => {
      held.current = null;
      const live = playing.current;
      let box: Box | null = live ? measure(live.el) : null;
      if (!usable(box)) box = ref.current ? measure(ref.current) : null;
      const painted = !origin.current;
      if (painted && latest.current.crossfade && loadedCrossfade && ref.current && usable(box) && !UIMotion.reduced)
        loadedCrossfade.keep(sharedId, ref.current, box, latest.current.timing, latest.current.offscreenMargin);
      if (usable(box)) keepShared(sharedId, box);
      const mine = readShared(sharedId);
      queueMicrotask(() => {
        if (held.current === sharedId) return;
        if (readShared(sharedId) === mine) dropShared(sharedId);
        const owner = sharedOwner.get(sharedId);
        if (owner && !owner.isConnected) sharedOwner.delete(sharedId);
      });
    };
  }, [sharedId]);

  const play = () => {
    const stale = superseded.current;
    superseded.current = null;
    if (!origin.current && !stale) return;
    const job = {};
    queued.current = job;
    beforePaint(() => {
      if (queued.current !== job) return;
      const el = ref.current;
      const from = origin.current;
      origin.current = null;
      if (!el || !usable(from) || UIMotion.reduced) return;
      const to = measure(el);
      if (offscreen(offscreenMargin, from, to)) return;
      const layers = flipLayers(el, from, to, { size, timing });
      return () => {
        const handoff =
          sharedId !== null && crossfade && loadedCrossfade
            ? loadedCrossfade.play(sharedId, el, from, { timing })
            : undefined;
        const next = handoff === undefined ? layers && animate(el, ...layers) : handoff;
        if (!next) return;
        playing.current = { play: next, el };
        interrupted.current = from;
        next.finished.then(() => {
          if (playing.current?.play === next) {
            playing.current = null;
            interrupted.current = null;
          }
        });
      };
    }, stale?.stop);
    return () => {
      queued.current = null;
    };
  };

  return { ref, play };
}
