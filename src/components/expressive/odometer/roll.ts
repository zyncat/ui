import { clampedCurve, sample, settleSeconds, wrappedCurve, type Spring } from './spring';

const RUN = 10;
const BOUNCE = 0.28;
const SETTLE_DECAYS = 4;
const CARRY_SOFTENING = 0.88;
const CARRY_FLOOR = 0.55;
const OPEN_RATE = 1.25;
const REST_CELL = 0.004;
const LAP: Keyframe[] = [{ translate: '0 0%' }, { translate: '0 -50%' }];
const GATE: Keyframe[] = [{ '--_odometer-reveal': 0 }, { '--_odometer-reveal': 1 }];

export const MIN_ROLL = 0.08;
export const DIGIT = /\d/;
export const RUN_TEXT = Array.from({ length: RUN * 2 }, (_, i) => i % RUN).join('\n');

export type Slot = (HTMLElement | null)[];

export interface Place extends Spring {
  digit: number;
  roll: Animation | null;
  gate: Spring;
  reveal: Animation | null;
}

export const charAt = (core: string, i: number) => (i < core.length ? core[core.length - 1 - i] : '');

export function parts(text: string): [string, string, string] {
  const first = text.search(DIGIT);
  if (first < 0) return [text, '', ''];
  const last = text.search(/\d\D*$/);
  return [text.slice(0, first), text.slice(first, last + 1), text.slice(last + 1)];
}

export const motions = (places: Place[]) => places.flatMap((p) => [p.roll, p.reveal]).filter((m) => m !== null);

function settle(s: Spring): void {
  s.at = s.to;
  s.rate = 0;
}

function rebase(p: Place): void {
  const shift = Math.floor(p.at / RUN) * RUN;
  p.at -= shift;
  p.to -= shift;
}

function land(strip: HTMLElement | null, p: Place): void {
  settle(p);
  rebase(p);
  p.roll?.cancel();
  p.roll = null;
  if (strip) strip.style.translate = `0 calc(var(--_odometer-cell) * ${(-p.at).toFixed(4)})`;
}

function shut(col: HTMLElement | null, p: Place): void {
  settle(p.gate);
  p.reveal?.cancel();
  p.reveal = null;
  col?.style.setProperty('--_odometer-reveal', String(p.gate.to));
}

function follow(s: Spring, motion: Animation | null): void {
  if (!motion) return;
  if (motion.playState === 'finished') settle(s);
  else [s.at, s.rate] = sample(s, Number(motion.currentTime ?? 0) / 1000);
}

export function aim(places: Place[], grid: string, core: string, zero: number, seconds: number, dir: number): void {
  const zeta = 1 - BOUNCE;
  for (let i = 0, ordinal = 0; i < grid.length; i++) {
    const omega = (SETTLE_DECAYS / (zeta * seconds)) * Math.max(CARRY_FLOOR, CARRY_SOFTENING ** ordinal);
    const open = i < zero ? 1 : 0;
    const p = (places[i] ??= {
      at: 0,
      rate: 0,
      to: 0,
      zeta,
      omega,
      digit: 0,
      roll: null,
      gate: { at: open, rate: 0, to: open, omega, zeta: 1 },
      reveal: null,
    });
    follow(p, p.roll);
    rebase(p);
    follow(p.gate, p.reveal);
    p.omega = omega;
    p.gate.omega = omega * OPEN_RATE;
    p.gate.to = i < core.length ? 1 : 0;
    const char = charAt(core, i) || charAt(grid, i);
    if (!DIGIT.test(char)) continue;
    const digit = i < core.length ? Number(char) : 0;
    p.to += (((((digit - p.digit) * dir) % RUN) + RUN) % RUN) * dir;
    p.digit = digit;
    ordinal++;
  }
}

export function launch(places: Place[], strips: Slot, cols: Slot, rate: number, paused: boolean): void {
  const now = document.timeline.currentTime;
  const start = (el: HTMLElement, frames: Keyframe[], seconds: number, easing: string) => {
    const motion = el.animate(frames, { duration: seconds * 1000, easing, fill: 'forwards' });
    motion.playbackRate = rate;
    motion.startTime = now;
    if (paused) motion.pause();
    return motion;
  };
  for (let i = 0; i < places.length; i++) {
    const p = places[i];
    const [strip, col] = [strips[i], cols[i]];
    const rolling = settleSeconds(p, REST_CELL);
    const opening = settleSeconds(p.gate, REST_CELL);
    if (!rolling) land(strip, p);
    else if (strip) {
      p.roll?.cancel();
      p.roll = start(strip, LAP, rolling, wrappedCurve(p, rolling, RUN));
    }
    if (!opening) shut(col, p);
    else if (col) {
      p.reveal?.cancel();
      p.reveal = start(col, GATE, opening, clampedCurve(p.gate, opening));
    }
  }
}

export function hold(places: Place[], paused: boolean): void {
  for (const motion of motions(places)) {
    if (paused && motion.playState === 'running') motion.pause();
    if (!paused && motion.playState === 'paused') motion.play();
  }
}

export function snap(places: Place[], cols: Slot, strips: Slot): void {
  for (let i = 0; i < places.length; i++) {
    shut(cols[i], places[i]);
    land(strips[i], places[i]);
  }
}
