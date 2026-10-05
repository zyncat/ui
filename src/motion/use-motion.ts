'use client';

import { useLayoutEffect, useRef, type RefObject } from 'react';

import { animate, measure, offscreen, type Layer, type Playback } from '../engine';
import { beforePaint } from './before-paint';
import { usePresence } from './presence-context';

export type Plays = Playback | Playback[] | null | undefined | void;
export type MotionSpec = Layer | Layer[] | ((el: HTMLElement) => Plays);

const toList = (plays: Plays): Playback[] => (!plays ? [] : Array.isArray(plays) ? plays : [plays]);

export function run(spec: MotionSpec | undefined, el: HTMLElement): Playback[] {
  if (!spec) return [];
  if (typeof spec === 'function') return toList(spec(el));
  return [Array.isArray(spec) ? animate(el, ...spec) : animate(el, spec)];
}

const landed = (layers: Layer[]): Layer[] =>
  layers.map((layer) => ({ ...layer, timing: { duration: 0, fill: layer.timing?.fill } }));

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
  /** How far outside the viewport, in px, this element still animates; further out, `animate` and layout moves land on their end state at once. `Infinity` always animates. @default 100 */
  offscreenMargin?: number;
}

/** Drives `<Motion>`; use it directly on elements you hold a ref to but do not render. */
export function useMotion(
  ref: RefObject<HTMLElement | null>,
  { animate, exit, initial, deps, offscreenMargin }: MotionSpecs,
): void {
  const presence = usePresence();
  const playing = useRef<Playback[]>([]);
  const pending = useRef<object | null>(null);
  const mounted = useRef(false);
  const ran = useRef<unknown[] | null>(null);
  const exiting = useRef(false);
  const spec = useRef({ animate, exit, initial });
  spec.current = { animate, exit, initial };
  const release = useRef<(() => void) | null>(null);
  const ownsExit = !!exit;

  const stop = () => {
    pending.current = null;
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
    if (previous && atMount && (pending.current || playing.current.length)) return;
    if (atMount && (spec.current.initial ?? presence.initial) === false) return;
    stop();
    const animation = spec.current.animate;
    if (!animation || typeof animation === 'function') {
      playing.current = run(animation, el);
      return;
    }
    const token = {};
    pending.current = token;
    beforePaint(() => {
      if (pending.current !== token) return;
      const layers = offscreen(offscreenMargin, measure(el)) ? landed([animation].flat()) : animation;
      return () => {
        playing.current = run(layers, el);
      };
    });
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

  useLayoutEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      queueMicrotask(() => {
        if (!mounted.current) stop();
      });
    };
  }, []);
}
