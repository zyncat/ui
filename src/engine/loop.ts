import { UIMotion } from '../tokens/motion-tokens';
import { claim, clock, release, type Playback, type PropertyHolder } from './animate';

export type SimulationFrame = (k: number, dt: number, now: number) => boolean | void;

export interface LoopOptions {
  el?: HTMLElement;
  claims?: string[];
  speed?: () => number;
  snap?: () => void;
}

const MAX_FRAME_MS = 34;
const BASE_FRAME_MS = 1000 / 60;

export interface LoopPlayback extends Playback {
  wake(): void;
}

const settled: LoopPlayback = { stop() {}, wake() {}, finished: Promise.resolve() };

export function loop(frame: SimulationFrame, options: LoopOptions = {}): LoopPlayback {
  if (UIMotion.reduced) {
    options.snap?.();
    return settled;
  }

  const { el, claims, speed } = options;
  const keys = el && claims?.length ? claims : null;

  let raf = 0;
  let stopped = false;
  let parked = false;
  let hidden = document.visibilityState === 'hidden';
  let inView = true;
  let running = false;
  let last = 0;
  let resolveFinished!: () => void;
  const finished = new Promise<void>((resolve) => (resolveFinished = resolve));

  const step = (now: number) => {
    raf = 0;
    if (!running) return;
    const dt = Math.min(MAX_FRAME_MS, now - last) || BASE_FRAME_MS;
    last = now;
    const rate = Number(speed ? speed() : 1);
    const effective = (isFinite(rate) && rate >= 0 ? rate : 1) / clock.scale;
    parked = frame((dt / BASE_FRAME_MS) * effective, dt * effective, now) === false;
    sync();
    if (running) raf = requestAnimationFrame(step);
  };

  const sync = () => {
    const next = !stopped && !parked && !hidden && inView;
    if (next === running) return;
    running = next;
    if (running) {
      last = performance.now();
      raf = requestAnimationFrame(step);
    } else if (raf) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
  };

  const onVisibility = () => {
    hidden = document.visibilityState === 'hidden';
    sync();
  };
  document.addEventListener('visibilitychange', onVisibility);

  let observer: IntersectionObserver | null = null;
  if (el && typeof IntersectionObserver !== 'undefined') {
    observer = new IntersectionObserver((entries) => {
      inView = entries[entries.length - 1].isIntersecting;
      sync();
    });
    observer.observe(el);
  }

  const teardown = () => {
    if (stopped) return;
    stopped = true;
    sync();
    document.removeEventListener('visibilitychange', onVisibility);
    observer?.disconnect();
    resolveFinished();
  };

  const holder: PropertyHolder = { cancel: teardown };

  const stop = () => {
    if (stopped) return;
    if (keys && el) release(el, keys, holder);
    teardown();
  };

  if (keys && el) claim(el, keys, holder);

  const wake = () => {
    parked = false;
    sync();
  };

  sync();

  return { stop, wake, finished };
}
