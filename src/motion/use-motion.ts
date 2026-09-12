'use client';

import { useLayoutEffect, useRef, type RefObject } from 'react';

import { animate, type Layer, type Playback } from '../engine';
import { usePresence } from './presence-context';

export type Plays = Playback | Playback[] | null | undefined | void;
export type MotionSpec = Layer | Layer[] | ((el: HTMLElement) => Plays);

const toList = (plays: Plays): Playback[] => (!plays ? [] : Array.isArray(plays) ? plays : [plays]);

export function run(spec: MotionSpec | undefined, el: HTMLElement): Playback[] {
  if (!spec) return [];
  if (typeof spec === 'function') return toList(spec(el));
  return [Array.isArray(spec) ? animate(el, ...spec) : animate(el, spec)];
}

const sameDeps = (a: unknown[], b: unknown[]): boolean =>
  a.length === b.length && a.every((v, i) => Object.is(v, b[i]));

const allSettled = (plays: Playback[]): Promise<void> =>
  plays.length ? Promise.all(plays.map((play) => play.finished)).then((): void => {}) : Promise.resolve();

export interface MotionSpecs {
  /** Plays on mount, and again whenever `deps` change. */
  animate?: MotionSpec;
  /** Plays when a parent `<Presence>` drops this child; it stays mounted until this finishes. */
  exit?: MotionSpec;
  /** Play `animate` on mount. Falls back to the parent Presence's own `initial`. @default true */
  initial?: boolean;
  /** Replay `animate` when these change. Must keep a stable length. @default [] */
  deps?: unknown[];
}

/** Drives `<Motion>`; use it directly on elements you hold a ref to but do not render. */
export function useMotion(ref: RefObject<HTMLElement | null>, { animate, exit, initial, deps }: MotionSpecs): void {
  const presence = usePresence();
  const playing = useRef<Playback[]>([]);
  const ran = useRef<unknown[] | null>(null);
  const exiting = useRef(false);
  const spec = useRef({ animate, exit, initial });
  spec.current = { animate, exit, initial };
  const release = useRef<(() => void) | null>(null);
  const ownsExit = !!exit;

  const stop = () => {
    for (const play of playing.current) play.stop();
    playing.current = [];
  };

  useLayoutEffect(() => {
    if (!ownsExit) return;
    release.current = presence.claimExit();
    return () => {
      release.current?.();
      release.current = null;
    };
  }, [ownsExit]); // eslint-disable-line react-hooks/exhaustive-deps

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const current = deps ?? [];
    const previous = ran.current;
    ran.current = current;
    const atMount = !previous || sameDeps(previous, current);
    if (atMount && (spec.current.initial ?? presence.initial) === false) return;
    stop();
    playing.current = run(spec.current.animate, el);
  }, deps ?? []); // eslint-disable-line react-hooks/exhaustive-deps

  useLayoutEffect(() => {
    const el = ref.current;
    if (presence.isPresent) {
      if (!exiting.current) return;
      exiting.current = false;
      stop();
      if (el) playing.current = run(spec.current.animate, el);
      return;
    }
    if (!ownsExit) return;
    exiting.current = true;
    stop();
    const exitPlays = el ? run(spec.current.exit, el) : [];
    playing.current = exitPlays;
    allSettled(exitPlays).then(() => {
      if (playing.current === exitPlays) release.current?.();
    });
  }, [presence.isPresent]); // eslint-disable-line react-hooks/exhaustive-deps

  useLayoutEffect(() => stop, []);
}
