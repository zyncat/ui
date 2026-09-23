'use client';

import { useLayoutEffect, useRef, type RefObject } from 'react';

import {
  dropShared,
  flip,
  keepShared,
  measure,
  readShared,
  type Box,
  type FlipOptions,
  type Playback,
} from '../engine';
import { sharedSlot } from '../shared-slot';
import { UIMotion } from '../tokens/motion-tokens';

export type FlipTuning = FlipOptions;

const SAME_BOX_PX = 0.5;

const sharedOwner = sharedSlot('motion.flip-owner@1', () => new Map<string, HTMLElement>());

const usable = (box: Box | null): box is Box => !!box && box.width > 0 && box.height > 0;

const sameBox = (a: Box, b: Box): boolean =>
  (['left', 'top', 'width', 'height'] as const).every((side) => Math.abs(a[side] - b[side]) < SAME_BOX_PX);

export function useFlip<T extends HTMLElement>(
  sharedId: string | null,
  tuning: FlipTuning = {},
  inPlace: boolean,
): { ref: RefObject<T | null>; play: () => void } {
  const ref = useRef<T | null>(null);
  const playing = useRef<{ play: Playback; el: T } | null>(null);
  const interrupted = useRef<Box | null>(null);
  const origin = useRef<Box | null>(null);
  const { size, timing } = tuning;
  const enabled = inPlace || sharedId !== null;
  const lastCommitted = ref.current && (inPlace || playing.current) ? measure(ref.current) : null;

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;
    const live = playing.current;
    const midFlight = live?.el === el;
    const moved = !!lastCommitted && !sameBox(lastCommitted, measure(el));
    if (midFlight && !moved) return;
    let from = moved ? lastCommitted : null;
    if (sharedId !== null && !midFlight) {
      if (interrupted.current) from = interrupted.current;
      else if (sharedOwner.get(sharedId) !== el) from = readShared(sharedId);
    }
    live?.play.stop();
    playing.current = null;
    interrupted.current = null;
    if (sharedId !== null) {
      keepShared(sharedId, measure(el));
      sharedOwner.set(sharedId, el);
    }
    origin.current = from;
  });

  useLayoutEffect(() => {
    if (sharedId === null) return;
    return () => {
      const live = playing.current;
      let box: Box | null = live ? measure(live.el) : null;
      live?.play.stop();
      playing.current = null;
      if (!usable(box)) box = ref.current ? measure(ref.current) : null;
      if (usable(box)) keepShared(sharedId, box);
      const mine = readShared(sharedId);
      queueMicrotask(() => {
        if (readShared(sharedId) === mine) dropShared(sharedId);
        const owner = sharedOwner.get(sharedId);
        if (owner && !owner.isConnected) sharedOwner.delete(sharedId);
      });
    };
  }, [sharedId]);

  const play = () => {
    const el = ref.current;
    const from = origin.current;
    origin.current = null;
    if (!el || !usable(from) || UIMotion.reduced) return;
    const next = flip(el, from, { size, timing });
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

  return { ref, play };
}
