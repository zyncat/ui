const RUN = 10;
const BOUNCE = 0.28;
const SETTLE_DECAYS = 4;
const CARRY_SOFTENING = 0.88;
const CARRY_FLOOR = 0.55;
const OPEN_RATE = 1.25;
const REST_CELL = 0.004;
const REST_RATE = 1;

export const MIN_ROLL = 0.08;
export const DIGIT = /\d/;
export const CELLS = Array.from({ length: RUN * 2 }, (_, i) => i % RUN);

export type Slot = (HTMLElement | null)[];

export interface Place {
  at: number;
  rate: number;
  to: number;
  digit: number;
  open: number;
  openRate: number;
  shown: number;
  omega: number;
  settled: boolean;
}

export const charAt = (core: string, i: number) => (i < core.length ? core[core.length - 1 - i] : '');

export function parts(text: string): [string, string, string] {
  const first = text.search(DIGIT);
  if (first < 0) return [text, '', ''];
  const last = text.search(/\d\D*$/);
  return [text.slice(0, first), text.slice(first, last + 1), text.slice(last + 1)];
}

function rest(p: Place): void {
  p.at = p.to - Math.floor(p.to / RUN) * RUN;
  p.to = p.at;
  p.rate = 0;
  p.open = p.shown;
  p.openRate = 0;
  p.settled = true;
}

function write(col: HTMLElement | null, strip: HTMLElement | null, p: Place): void {
  col?.style.setProperty('--_odometer-reveal', p.open.toFixed(4));
  if (strip) strip.style.translate = `0 calc(var(--_odometer-cell) * ${(-p.at).toFixed(4)})`;
}

export function aim(places: Place[], grid: string, core: string, zero: number, seconds: number, dir: number): void {
  const zeta = 1 - BOUNCE;
  for (let i = 0, ordinal = 0; i < grid.length; i++) {
    const omega = (SETTLE_DECAYS / (zeta * seconds)) * Math.max(CARRY_FLOOR, CARRY_SOFTENING ** ordinal);
    const open = i < zero ? 1 : 0;
    const p = (places[i] ??= { at: 0, rate: 0, to: 0, digit: 0, open, openRate: 0, shown: open, omega, settled: true });
    p.omega = omega;
    p.shown = i < core.length ? 1 : 0;
    p.settled = false;
    const char = charAt(core, i) || charAt(grid, i);
    if (!DIGIT.test(char)) continue;
    const digit = i < core.length ? Number(char) : 0;
    p.to += (((((digit - p.digit) * dir) % RUN) + RUN) % RUN) * dir;
    p.digit = digit;
    ordinal++;
  }
}

export function step(places: Place[], cols: Slot, strips: Slot, dt: number): void {
  const zeta = 1 - BOUNCE;
  for (let i = 0; i < places.length; i++) {
    const p = places[i];
    if (!p || p.settled) continue;
    p.rate += (p.omega * p.omega * (p.to - p.at) - 2 * zeta * p.omega * p.rate) * dt;
    p.at += p.rate * dt;
    const shift = Math.floor(p.at / RUN) * RUN;
    p.at -= shift;
    p.to -= shift;
    const wide = p.omega * OPEN_RATE;
    p.openRate += (wide * wide * (p.shown - p.open) - 2 * wide * p.openRate) * dt;
    p.open = Math.min(1, Math.max(0, p.open + p.openRate * dt));
    const slow = Math.abs(p.rate) < REST_RATE && Math.abs(p.openRate) < REST_RATE;
    if (slow && Math.abs(p.to - p.at) < REST_CELL && Math.abs(p.shown - p.open) < REST_CELL) rest(p);
    write(cols[i], strips[i], p);
  }
}

export function snap(places: Place[], cols: Slot, strips: Slot): void {
  for (let i = 0; i < places.length; i++) {
    if (!places[i]) continue;
    rest(places[i]);
    write(cols[i], strips[i], places[i]);
  }
}
